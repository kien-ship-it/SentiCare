import tensorflow as tf
import numpy as np
import os
import einops

# Suppress TensorFlow verbose output
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # Hide INFO and WARNING messages
tf.get_logger().setLevel('ERROR')
import warnings
warnings.filterwarnings('ignore')

# Custom layer definitions from your training script
class Conv2Plus1D(tf.keras.layers.Layer):
    def __init__(self, filters, kernel_size, padding, **kwargs):
        super().__init__(**kwargs)
        self.filters = filters
        self.kernel_size = kernel_size
        self.padding = padding
        self.seq = tf.keras.Sequential([
            # Spatial decomposition
            tf.keras.layers.Conv3D(filters=filters,
                          kernel_size=(1, kernel_size[1], kernel_size[2]),
                          padding=padding),
            # Temporal decomposition
            tf.keras.layers.Conv3D(filters=filters,
                          kernel_size=(kernel_size[0], 1, 1),
                          padding=padding)
        ])

    def call(self, x):
        return self.seq(x)
    
    def get_config(self):
        config = super().get_config()
        config.update({
            'filters': self.filters,
            'kernel_size': self.kernel_size,
            'padding': self.padding
        })
        return config

class ResidualMain(tf.keras.layers.Layer):
    def __init__(self, filters, kernel_size, **kwargs):
        super().__init__(**kwargs)
        self.filters = filters
        self.kernel_size = kernel_size
        self.seq = tf.keras.Sequential([
            Conv2Plus1D(filters=filters,
                        kernel_size=kernel_size,
                        padding='same'),
            tf.keras.layers.LayerNormalization(),
            tf.keras.layers.ReLU(),
            Conv2Plus1D(filters=filters,
                        kernel_size=kernel_size,
                        padding='same'),
            tf.keras.layers.LayerNormalization()
        ])

    def call(self, x):
        return self.seq(x)
    
    def get_config(self):
        config = super().get_config()
        config.update({
            'filters': self.filters,
            'kernel_size': self.kernel_size
        })
        return config

class Project(tf.keras.layers.Layer):
    def __init__(self, units, **kwargs):
        super().__init__(**kwargs)
        self.units = units
        self.seq = tf.keras.Sequential([
            tf.keras.layers.Dense(units),
            tf.keras.layers.LayerNormalization()
        ])

    def call(self, x):
        return self.seq(x)
    
    def get_config(self):
        config = super().get_config()
        config.update({'units': self.units})
        return config

class ResizeVideo(tf.keras.layers.Layer):
    def __init__(self, height, width, **kwargs):
        super().__init__(**kwargs)
        self.height = height
        self.width = width
        self.resizing_layer = tf.keras.layers.Resizing(self.height, self.width)

    def call(self, video):
        old_shape = einops.parse_shape(video, 'b t h w c')
        images = einops.rearrange(video, 'b t h w c -> (b t) h w c')
        images = self.resizing_layer(images)
        videos = einops.rearrange(
            images, '(b t) h w c -> b t h w c',
            t = old_shape['t'])
        return videos
    
    def get_config(self):
        config = super().get_config()
        config.update({
            'height': self.height,
            'width': self.width
        })
        return config


class ModelInterface:

    def __init__(self):
        # Get the directory where this script is located
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Load SentiVision model only
        model_path = os.path.join(script_dir, "models/SentiVision.keras")
        
        if os.path.exists(model_path):
            try:
                print(f"Loading SentiVision model (this may take 30-60 seconds)...")
                # Try loading with custom objects and without compilation first
                self.model = self._load_model_safely(model_path)
                print("SentiVision model loaded successfully")
            except Exception as e:
                print(f"Failed to load SentiVision model: {str(e)}")
                print("Creating mock model for testing...")
                self.model = self._create_mock_model()
                print("Mock model created")
        else:
            print(f"SentiVision model not found at: {model_path}")
            print("Creating mock model for testing...")
            self.model = self._create_mock_model()
            print("Mock model created")
        
        # Mapping from keras model outputs to specification states
        self.label_mapping = {
            0: "WALKING",      # walk
            1: "FALL_DETECTED", # fall (critical event)
            2: "IDLE",         # fallen (post-fall state)
            3: "SITTING",      # sit_down (transition, map to sitting)
            4: "SITTING",      # sitting
            5: "IN_BED",       # lie_down (transition, map to in_bed)
            6: "IN_BED",       # lying
            7: "STANDING",     # stand_up (transition, map to standing)
            8: "STANDING",     # standing
            9: "IDLE"          # other
        }
        
        # Critical events that require immediate alerts
        self.critical_events = {1}  # fall detection

    def _load_model_safely(self, model_path):
        """Safely load the model with various fallback strategies"""
        # Strategy 1: Try loading without compilation
        try:
            with tf.device('/CPU:0'):  # Force CPU to avoid GPU issues
                return tf.keras.models.load_model(model_path, compile=False)
        except Exception as e1:
            # Strategy 2: Try with custom objects (for Conv2D issues)
            try:
                custom_objects = {
                    'Conv2Plus1D': Conv2Plus1D,
                    'ResidualMain': ResidualMain,
                    'Project': Project,
                    'ResizeVideo': ResizeVideo,
                }
                with tf.device('/CPU:0'):
                    return tf.keras.models.load_model(model_path, custom_objects=custom_objects, compile=False)
            except Exception as e2:
                # Strategy 3: Try loading with safe_mode
                try:
                    with tf.device('/CPU:0'):
                        return tf.keras.models.load_model(model_path, compile=False, safe_mode=False)
                except Exception as e3:
                    raise Exception(f"Model loading failed. Conv2D error likely due to version incompatibility: {str(e3)}")

    def _create_mock_model(self):
        """Create a simple mock model for testing when real model fails to load"""
        inputs = tf.keras.Input(shape=(20, 224, 224, 3))
        x = tf.keras.layers.GlobalAveragePooling3D()(inputs)
        outputs = tf.keras.layers.Dense(10, activation='softmax')(x)
        model = tf.keras.Model(inputs, outputs)
        return model

    def predict(self, video):
        try:
            # Suppress all numpy array printing
            original_printoptions = np.get_printoptions()
            np.set_printoptions(suppress=True, threshold=0)
            
            video_tensor = self.convert_to_tensor(video)
            
            # Run prediction with output suppression
            import sys
            from io import StringIO
            old_stdout = sys.stdout
            sys.stdout = StringIO()  # Redirect stdout to suppress prints
            
            try:
                predictions = self.model(video_tensor)
            finally:
                sys.stdout = old_stdout  # Restore stdout
                np.set_printoptions(**original_printoptions)  # Restore numpy settings
            
            # Handle different prediction output formats
            if isinstance(predictions, (list, tuple)):
                predictions = predictions[0]
            
            # Get probabilities and predicted class
            probabilities = tf.nn.softmax(predictions).numpy()
            predicted_class = int(tf.argmax(predictions, axis=-1).numpy().flatten()[0])
            confidence_score = float(probabilities.flatten()[predicted_class])
            
            # Ensure predicted_class is within valid range
            if predicted_class >= len(self.label_mapping):
                print(f"Warning: Predicted class {predicted_class} out of range, defaulting to IDLE")
                predicted_class = 9  # Default to 'other' class
                confidence_score = 0.5
            
            # Map to specification state
            mapped_state = self.label_mapping.get(predicted_class, "IDLE")
            
            # Check if it's a critical event
            is_critical = predicted_class in self.critical_events
            
            # Validate state against Firebase requirements
            valid_states = {'IDLE', 'SITTING', 'WALKING', 'STANDING', 'IN_BED', 'NOT_PRESENT'}
            valid_critical_events = {'FALL_DETECTED', 'HELP_SIGNAL_DETECTED'}
            
            if confidence_score <= 0.65:
                return None

            if mapped_state not in valid_states and mapped_state not in valid_critical_events:
                print(f"Warning: Invalid state {mapped_state}, defaulting to IDLE")
                mapped_state = "IDLE"
                is_critical = False

            result = {
                'state': mapped_state,
                'confidence': confidence_score,
                'is_critical': is_critical,
                'raw_class': int(predicted_class),
                'firebase_compatible': True  # Flag to indicate Firebase compatibility
            }
            
            # Only print concise prediction info
            print(f"{mapped_state} ({confidence_score:.1%})")
            return result
            
        except Exception as e:
            print(f"Prediction error: {str(e)}")
            # Return a safe default prediction
            return {
                'state': 'IDLE',
                'confidence': 0.5,
                'is_critical': False,
                'raw_class': 9,
                'firebase_compatible': True
            }

    def convert_to_tensor(self, video):
        formatted_frames = []

        for image in video:
            formatted_image = self.format_frames(image)
            formatted_frames.append(formatted_image)

        video_tensor = tf.stack(formatted_frames)  # Shape: (20, 224, 224, 3)
        video_tensor = tf.expand_dims(video_tensor, axis=0)  # Shape: (1, 20, 224, 224, 3)

        return video_tensor

    def format_frames(self, frame):
        """
          Pad and resize an image from a video.

          Args:
            frame: Image that needs to resized and padded.
            output_size: Pixel size of the output frame image.

          Return:
            Formatted frame with padding of specified output size.
        """
        frame = tf.image.convert_image_dtype(frame, tf.float32)
        frame = tf.image.resize_with_pad(frame, *(224,224))
        return frame

