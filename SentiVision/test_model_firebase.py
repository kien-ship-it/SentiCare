#!/usr/bin/env python3
"""
Test script to verify SentiVision model loading and Firebase integration
"""

import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # Suppress TensorFlow logging

import numpy as np
import time
from model_interface import ModelInterface
from firebase_client import FirebaseClient

def create_mock_video_clip():
    """Create a mock video clip for testing"""
    # Create 20 frames of 224x224x3 random data (simulating video frames)
    frames = []
    for i in range(20):
        frame = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
        frames.append(frame)
    return frames

def test_model_loading():
    """Test model loading with various strategies"""
    print("=" * 60)
    print("Testing SentiVision Model Loading")
    print("=" * 60)
    
    try:
        model_interface = ModelInterface()
        print("✅ Model interface created successfully")
        
        # Test prediction with mock data
        mock_video = create_mock_video_clip()
        print(f"Created mock video clip with {len(mock_video)} frames")
        
        prediction = model_interface.predict(mock_video)
        print("✅ Prediction completed successfully")
        print(f"Prediction result: {prediction}")
        
        return model_interface, prediction
        
    except Exception as e:
        print(f"❌ Model loading failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return None, None

def test_firebase_connection():
    """Test Firebase connection and data writing"""
    print("\n" + "=" * 60)
    print("Testing Firebase Connection")
    print("=" * 60)
    
    try:
        firebase_client = FirebaseClient()
        print("✅ Firebase client created successfully")
        
        # Test writing a sample event
        firebase_client.write_event(
            event_type="SITTING",
            duration_seconds=30,
            confidence_score=0.85,
            metadata={"test": True}
        )
        print("✅ Test event written to Firebase")
        
        # Test writing a sample alert
        firebase_client.write_alert(
            alert_type="FALL_DETECTED",
            confidence_score=0.95
        )
        print("✅ Test alert written to Firebase")
        
        # Test updating patient status
        firebase_client.update_patient_status(
            current_state="WALKING",
            state_start_time=time.time(),
            confidence_score=0.88
        )
        print("✅ Patient status updated in Firebase")
        
        return firebase_client
        
    except Exception as e:
        print(f"❌ Firebase connection failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

def test_integration():
    """Test full integration between model and Firebase"""
    print("\n" + "=" * 60)
    print("Testing Model-Firebase Integration")
    print("=" * 60)
    
    model_interface, prediction = test_model_loading()
    if not model_interface or not prediction:
        print("❌ Cannot test integration - model loading failed")
        return False
    
    firebase_client = test_firebase_connection()
    if not firebase_client:
        print("❌ Cannot test integration - Firebase connection failed")
        return False
    
    try:
        # Simulate the full pipeline
        mock_video = create_mock_video_clip()
        prediction = model_interface.predict(mock_video)
        
        # Check if prediction is Firebase compatible
        if prediction.get('firebase_compatible', False):
            print("✅ Prediction is Firebase compatible")
            
            # Write prediction to Firebase based on type
            if prediction['is_critical']:
                # Write critical event
                firebase_client.write_alert(
                    alert_type=prediction['state'],
                    confidence_score=prediction['confidence']
                )
                print(f"✅ Critical event written: {prediction['state']}")
            else:
                # Write regular event (with mock duration)
                firebase_client.write_event(
                    event_type=prediction['state'],
                    duration_seconds=60,  # Mock duration
                    confidence_score=prediction['confidence']
                )
                print(f"✅ Regular event written: {prediction['state']}")
            
            # Update patient status
            firebase_client.update_patient_status(
                current_state=prediction['state'],
                state_start_time=time.time(),
                confidence_score=prediction['confidence']
            )
            print(f"✅ Patient status updated: {prediction['state']}")
            
            return True
        else:
            print("❌ Prediction is not Firebase compatible")
            return False
            
    except Exception as e:
        print(f"❌ Integration test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main test function"""
    print("SentiCare Model-Firebase Integration Test")
    print("This script will test model loading and Firebase connectivity")
    print()
    
    success = test_integration()
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 ALL TESTS PASSED!")
        print("Your SentiVision model and Firebase integration are working correctly.")
    else:
        print("❌ SOME TESTS FAILED")
        print("Please check the error messages above and fix the issues.")
    print("=" * 60)

if __name__ == "__main__":
    main()
