#!/usr/bin/env python3
"""
Debug version of main.py with detailed logging
"""
import os
import sys
import cv2
import time

def test_camera_basic():
    """Test basic camera functionality"""
    print("Step 1: Testing basic camera access...")
    try:
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("❌ Camera failed to open")
            return False
        
        ret, frame = cap.read()
        if not ret:
            print("❌ Camera opened but cannot read frames")
            cap.release()
            return False
        
        print(f"✅ Camera working - Frame shape: {frame.shape}")
        cap.release()
        return True
    except Exception as e:
        print(f"❌ Camera error: {str(e)}")
        return False

def test_imports():
    """Test all required imports"""
    print("Step 2: Testing imports...")
    try:
        print("  - Testing TensorFlow...")
        import tensorflow as tf
        print(f"    ✅ TensorFlow {tf.__version__}")
        
        print("  - Testing Firebase...")
        from google.cloud import firestore
        print("    ✅ Firebase imports OK")
        
        print("  - Testing custom modules...")
        from camera import Webcam
        print("    ✅ Camera module OK")
        
        from model_interface import ModelInterface
        print("    ✅ Model interface OK")
        
        from firebase_client import FirebaseClient
        print("    ✅ Firebase client OK")
        
        from state_machine import ActivityStateMachine
        print("    ✅ State machine OK")
        
        from monitoring import Monitor
        print("    ✅ Monitor OK")
        
        return True
    except Exception as e:
        print(f"❌ Import error: {str(e)}")
        return False

def test_config():
    """Test configuration loading"""
    print("Step 3: Testing configuration...")
    try:
        import json
        with open('config.json', 'r') as f:
            config = json.load(f)
        print(f"✅ Config loaded: {list(config.keys())}")
        
        service_account_path = config.get('serviceAccountKeyPath')
        if service_account_path and os.path.exists(service_account_path):
            print(f"✅ Service account key found: {service_account_path}")
        else:
            print(f"❌ Service account key missing: {service_account_path}")
            return False
        
        return True
    except Exception as e:
        print(f"❌ Config error: {str(e)}")
        return False

def test_model_loading():
    """Test model loading"""
    print("Step 4: Testing model loading...")
    try:
        from model_interface import ModelInterface
        print("  - Creating ModelInterface...")
        interface = ModelInterface()
        print("✅ Model loaded successfully")
        return True
    except Exception as e:
        print(f"❌ Model loading error: {str(e)}")
        return False

def test_firebase_connection():
    """Test Firebase connection"""
    print("Step 5: Testing Firebase connection...")
    try:
        from firebase_client import FirebaseClient
        print("  - Creating FirebaseClient...")
        client = FirebaseClient()
        print("✅ Firebase client created successfully")
        return True
    except Exception as e:
        print(f"❌ Firebase error: {str(e)}")
        return False

def test_webcam_class():
    """Test Webcam class"""
    print("Step 6: Testing Webcam class...")
    try:
        from camera import Webcam
        print("  - Creating Webcam instance...")
        with Webcam() as webcam:
            print("  - Waiting for camera to be ready...")
            start_time = time.time()
            while not webcam.is_ready() and (time.time() - start_time) < 10:
                print(f"    Buffer: {webcam.get_buffer_size()}/{webcam.clip_length}")
                time.sleep(0.5)
            
            if webcam.is_ready():
                print("✅ Webcam class working")
                return True
            else:
                print("❌ Webcam buffer never filled")
                return False
    except Exception as e:
        print(f"❌ Webcam class error: {str(e)}")
        return False

def main():
    print("SentiCare Debug Diagnostic")
    print("=" * 50)
    
    tests = [
        test_camera_basic,
        test_imports,
        test_config,
        test_model_loading,
        test_firebase_connection,
        test_webcam_class
    ]
    
    for i, test in enumerate(tests, 1):
        print(f"\n[{i}/{len(tests)}] Running {test.__name__}...")
        if not test():
            print(f"\n❌ FAILED at step {i}: {test.__name__}")
            print("Fix this issue before proceeding to the next step.")
            return
        print(f"✅ Step {i} passed")
    
    print("\n🎉 All tests passed! The system should work.")
    print("\nTrying to start the full monitoring system...")
    
    try:
        from monitoring import Monitor
        monitor = Monitor()
        print("✅ Monitor created successfully")
        print("Starting monitoring for 10 seconds...")
        
        # Start monitoring in a separate thread for testing
        import threading
        monitor_thread = threading.Thread(target=monitor.start_monitoring, daemon=True)
        monitor_thread.start()
        
        # Let it run for 10 seconds
        time.sleep(10)
        
        # Stop monitoring
        monitor.stop_monitoring()
        print("✅ Monitoring test completed")
        
    except Exception as e:
        print(f"❌ Full system error: {str(e)}")

if __name__ == "__main__":
    main()
