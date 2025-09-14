. #!/usr/bin/env python3
"""
Simple test to debug the model and camera integration
"""

import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # Suppress TensorFlow logging

import numpy as np
from model_interface import ModelInterface
from camera import Webcam
import time

def test_model_only():
    print("=== Testing Model Interface ===")
    try:
        model = ModelInterface()
        
        # Create fake video data
        fake_video = [np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8) for _ in range(20)]
        
        print("Running prediction...")
        result = model.predict(fake_video)
        print(f"Result: {result}")
        return True
        
    except Exception as e:
        print(f"❌ Model test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_camera_only():
    print("\n=== Testing Camera Interface ===")
    try:
        with Webcam(show_preview=True) as cam:
            print("Camera started, waiting for buffer to fill...")
            
            # Wait for buffer to fill
            while not cam.is_ready():
                print(f"Buffer: {cam.get_buffer_size()}/20")
                time.sleep(0.5)
            
            print("✅ Camera buffer ready!")
            print("Camera preview should be visible now. Press any key in the preview window to continue...")
            
            # Keep showing preview for 5 seconds
            for i in range(50):  # 5 seconds at 0.1s intervals
                frame = cam.get_frame()
                if frame is not None:
                    cam._show_preview_frame(frame)
                time.sleep(0.1)
            
            return True
            
    except Exception as e:
        print(f"❌ Camera test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_integration():
    print("\n=== Testing Model + Camera Integration ===")
    try:
        model = ModelInterface()
        
        with Webcam(show_preview=True) as cam:
            # Wait for camera buffer
            while not cam.is_ready():
                print(f"Buffer: {cam.get_buffer_size()}/20")
                time.sleep(0.5)
            
            print("Running AI prediction on camera feed...")
            
            # Get video clip and run prediction
            clip = cam.get_clip()
            if clip:
                result = model.predict(clip)
                print(f"✅ Prediction successful: {result}")
                return True
            else:
                print("❌ No video clip available")
                return False
                
    except Exception as e:
        print(f"❌ Integration test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("SentiCare Debug Test")
    print("=" * 50)
    
    # Test each component
    model_ok = test_model_only()
    camera_ok = test_camera_only()
    
    if model_ok and camera_ok:
        integration_ok = test_integration()
        
        if integration_ok:
            print("\n🎉 All tests passed! The system should work.")
        else:
            print("\n❌ Integration test failed.")
    else:
        print("\n❌ Basic component tests failed.")
        
    print("\nPress Enter to exit...")
    input()
