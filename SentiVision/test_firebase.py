#!/usr/bin/env python3
"""
Test script to verify Firebase connectivity and patientStatus updates
"""

import sys
import time
from firebase_client import FirebaseClient
from model_interface import ModelInterface
from state_machine import ActivityStateMachine

def test_firebase_connection():
    """Test basic Firebase connection"""
    print("Testing Firebase connection...")
    try:
        firebase_client = FirebaseClient("config.json")
        config = firebase_client.get_config()
        print(f"✅ Connected to Firebase project: {config.get('projectId')}")
        print(f"✅ Patient ID: {config.get('patientId')}")
        print(f"✅ Room ID: {config.get('roomId')}")
        return firebase_client
    except Exception as e:
        print(f"❌ Firebase connection failed: {str(e)}")
        return None

def test_patient_status_update(firebase_client):
    """Test patientStatus collection update"""
    print("\nTesting patientStatus update...")
    try:
        # Test direct patient status update
        firebase_client.update_patient_status(
            current_state="TESTING",
            state_start_time=None,  # Will use SERVER_TIMESTAMP
            confidence_score=0.95
        )
        print("✅ PatientStatus update successful")
        return True
    except Exception as e:
        print(f"❌ PatientStatus update failed: {str(e)}")
        return False

def test_model_prediction():
    """Test model prediction"""
    print("\nTesting model prediction...")
    try:
        model_interface = ModelInterface()
        # Create dummy video data (20 frames of 224x224x3)
        import numpy as np
        dummy_video = [np.random.rand(224, 224, 3) for _ in range(20)]
        
        prediction = model_interface.predict(dummy_video)
        print(f"✅ Model prediction successful: {prediction['state']} ({prediction['confidence']:.2%})")
        return prediction
    except Exception as e:
        print(f"❌ Model prediction failed: {str(e)}")
        return None

def test_state_machine_integration(firebase_client):
    """Test state machine with Firebase integration"""
    print("\nTesting state machine integration...")
    try:
        state_machine = ActivityStateMachine(firebase_client)
        
        # Test with a mock prediction
        mock_prediction = {
            'state': 'SITTING',
            'confidence': 0.85,
            'is_critical': False,
            'raw_class': 4,
            'firebase_compatible': True
        }
        
        state_machine.process_prediction(mock_prediction)
        print("✅ State machine processing successful")
        
        # Check current state
        state_info = state_machine.get_current_state()
        print(f"✅ Current state: {state_info['current_state']}")
        
        return True
    except Exception as e:
        print(f"❌ State machine integration failed: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("SentiCare Firebase Integration Test")
    print("=" * 60)
    
    # Test Firebase connection
    firebase_client = test_firebase_connection()
    if not firebase_client:
        print("\n❌ Cannot proceed without Firebase connection")
        sys.exit(1)
    
    # Test patientStatus update
    status_test = test_patient_status_update(firebase_client)
    
    # Test model prediction
    prediction = test_model_prediction()
    
    # Test state machine integration
    state_machine_test = test_state_machine_integration(firebase_client)
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print(f"Firebase Connection: {'✅ PASS' if firebase_client else '❌ FAIL'}")
    print(f"PatientStatus Update: {'✅ PASS' if status_test else '❌ FAIL'}")
    print(f"Model Prediction: {'✅ PASS' if prediction else '❌ FAIL'}")
    print(f"State Machine Integration: {'✅ PASS' if state_machine_test else '❌ FAIL'}")
    
    if all([firebase_client, status_test, prediction, state_machine_test]):
        print("\n🎉 All tests passed! The system should be working correctly.")
        print("The patientStatus collection should now be receiving updates.")
    else:
        print("\n⚠️ Some tests failed. Check the error messages above.")

if __name__ == "__main__":
    main()
