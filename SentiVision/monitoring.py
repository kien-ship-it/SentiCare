import time
import threading
import signal
import sys
from camera import Webcam
from model_interface import ModelInterface
from firebase_client import FirebaseClient
from state_machine import ActivityStateMachine


class Monitor:
    def __init__(self, config_path="config.json"):
        """Initialize the monitoring system with all components"""
        print("Initializing SentiCare AI Monitoring System...")
        
        # Initialize components
        self.firebase_client = FirebaseClient(config_path)
        config = self.firebase_client.get_config()
        
        self.model_interface = ModelInterface()
        self.state_machine = ActivityStateMachine(
            self.firebase_client,
            debounce_duration=config.get('debounce_duration', 7),
            confidence_threshold=config.get('confidence_threshold', 0.90),
            max_event_duration=config.get('max_event_duration', 600)  # 10 minutes default
        )
        
        # Threading control
        self.running = False
        self.processing_thread = None
        self.heartbeat_thread = None
        self.heartbeat_interval = config.get('heartbeat_interval', 180)  # 3 minutes
        
        # Performance tracking
        self.last_prediction_time = 0
        self.prediction_count = 0
        
        # Setup graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
        
        print("Monitor initialization complete")
    
    def start_monitoring(self):
        """Start the monitoring system with multithreading"""
        if self.running:
            print("Monitoring is already running")
            return
        
        self.running = True
        print("Starting SentiCare monitoring system...")
        
        # Start processing thread
        self.processing_thread = threading.Thread(target=self._processing_loop, daemon=True)
        self.processing_thread.start()
        
        # Start heartbeat thread
        self.heartbeat_thread = threading.Thread(target=self._heartbeat_loop, daemon=True)
        self.heartbeat_thread.start()
        
        print("Monitoring system started successfully")
        print("Press Ctrl+C to stop monitoring")
        
        # Keep main thread alive
        try:
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            self.stop_monitoring()
    
    def _processing_loop(self):
        """Main processing loop running in separate thread"""
        print("Starting video processing loop...")
        
        try:
            with Webcam(show_preview=True) as webcam:
                # Wait for buffer to fill
                while not webcam.is_ready() and self.running:
                    print(f"Buffer filling... {webcam.get_buffer_size()}/{webcam.clip_length}")
                    time.sleep(0.5)
                
                print("Camera ready, starting AI processing...")
                print("📹 Camera preview window opened - Press 'Q' to close preview")
                
                # Main processing loop
                while self.running:
                    if webcam.is_ready():
                        start_time = time.time()
                        
                        # Get video clip
                        clip = webcam.get_clip()
                        
                        if clip:
                            try:
                                # Run AI inference
                                prediction = self.model_interface.predict(clip)
                                if prediction is None:
                                    continue
                                
                                # Process prediction through state machine
                                self.state_machine.process_prediction(prediction)
                                
                                # Update performance metrics
                                self.prediction_count += 1
                                self.last_prediction_time = time.time()
                                
                                processing_time = self.last_prediction_time - start_time
                                
                                # Log prediction details (clean format)
                                if self.prediction_count % 10 == 0:  # Only log every 10th prediction to reduce spam
                                    print(f"📊 Prediction #{self.prediction_count}: "
                                          f"{prediction['state']} "
                                          f"({prediction['confidence']:.1%}, "
                                          f"{processing_time:.1f}s)")
                                
                            except Exception as e:
                                print(f"Error during AI processing: {str(e)}")
                    
                    # Control processing rate (process every 0.1 seconds)
                    time.sleep(0.1)
                    
        except Exception as e:
            print(f"Error in processing loop: {str(e)}")
            self.running = False
    
    def _heartbeat_loop(self):
        """Heartbeat loop for patient status updates"""
        print(f"Starting heartbeat loop (interval: {self.heartbeat_interval}s)")
        
        while self.running:
            try:
                # Wait for heartbeat interval
                for _ in range(self.heartbeat_interval):
                    if not self.running:
                        break
                    time.sleep(1)
                
                if self.running:
                    # Get current state and send heartbeat
                    state_info = self.state_machine.get_current_state()
                    
                    if state_info['current_state']:
                        # Use a default confidence for heartbeat if no recent prediction
                        confidence = 0.8  # Default heartbeat confidence
                        
                        self.state_machine.force_heartbeat_update(confidence)
                        print(f"Heartbeat sent - Current state: {state_info['current_state']}")
                    else:
                        print("Heartbeat skipped - No current state available")
                        
            except Exception as e:
                print(f"Error in heartbeat loop: {str(e)}")
    
    def stop_monitoring(self):
        """Stop the monitoring system gracefully"""
        if not self.running:
            return
        
        print("\nStopping SentiCare monitoring system...")
        self.running = False
        
        # Wait for threads to finish
        if self.processing_thread and self.processing_thread.is_alive():
            self.processing_thread.join(timeout=5)
        
        if self.heartbeat_thread and self.heartbeat_thread.is_alive():
            self.heartbeat_thread.join(timeout=5)
        
        # Shutdown state machine
        self.state_machine.shutdown()
        
        print("Monitoring system stopped")
        print(f"Total predictions processed: {self.prediction_count}")
    
    def _signal_handler(self, signum, frame):
        """Handle shutdown signals gracefully"""
        print(f"\nReceived signal {signum}, shutting down...")
        self.stop_monitoring()
        sys.exit(0)
    
    def get_status(self):
        """Get current monitoring status"""
        state_info = self.state_machine.get_current_state()
        
        return {
            'running': self.running,
            'prediction_count': self.prediction_count,
            'last_prediction_time': self.last_prediction_time,
            'current_state': state_info['current_state'],
            'is_debouncing': state_info['is_debouncing'],
            'pending_state': state_info['pending_state']
        }