#!/usr/bin/env python3
"""
Test script to verify the fixed event logging system
Tests both state changes and periodic event logging for long-duration states
"""

import time
import sys
from model_interface import ModelInterface
from firebase_client import FirebaseClient
from state_machine import ActivityStateMachine

def test_event_logging():
    """Test the event logging functionality"""
    print("Testing Event Logging System")
    print("=" * 50)
    
    try:
        # Initialize components
        print("Initializing components...")
        firebase_client = FirebaseClient("config.json")
        
        # Use shorter durations for testing
        state_machine = ActivityStateMachine(
            firebase_client,
            debounce_duration=3,  # 3 seconds for faster testing
            confidence_threshold=0.90,
            max_event_duration=10  # 10 seconds for periodic events
        )
        
        print("✅ Components initialized")
        
        # Test 1: Initial state setting
        print("\n--- Test 1: Initial State Setting ---")
        prediction1 = {
            'state': 'SITTING',
            'confidence': 0.85,
            'is_critical': False,
            'raw_class': 4
        }
        state_machine.process_prediction(prediction1)
        time.sleep(1)
        
        # Test 2: Same state (should not trigger event yet)
        print("\n--- Test 2: Same State (No Event Expected) ---")
        for i in range(5):
            state_machine.process_prediction(prediction1)
            time.sleep(1)
            print(f"Processed prediction {i+1}/5")
        
        # Test 3: Wait for periodic event logging (should trigger after 10 seconds)
        print("\n--- Test 3: Waiting for Periodic Event (10s) ---")
        for i in range(6):
            state_machine.process_prediction(prediction1)
            time.sleep(1)
            print(f"Waiting... {i+1}/6 seconds")
        
        # Test 4: State change (should trigger event for previous state)
        print("\n--- Test 4: State Change (Should Trigger Event) ---")
        prediction2 = {
            'state': 'WALKING',
            'confidence': 0.92,
            'is_critical': False,
            'raw_class': 0
        }
        
        # Send new state multiple times to trigger debouncing
        for i in range(4):
            state_machine.process_prediction(prediction2)
            time.sleep(1)
            print(f"Debouncing WALKING state... {i+1}/4")
        
        # Test 5: Critical event (should trigger immediately)
        print("\n--- Test 5: Critical Event (Immediate) ---")
        critical_prediction = {
            'state': 'FALL_DETECTED',
            'confidence': 0.95,
            'is_critical': True,
            'raw_class': 1
        }
        state_machine.process_prediction(critical_prediction)
        
        print("\n--- Test Complete ---")
        print("Check your Firebase console for the following expected events:")
        print("1. SITTING event (from periodic logging)")
        print("2. SITTING event (from state change)")
        print("3. FALL_DETECTED alert")
        print("4. FALL_DETECTED event")
        
        # Clean shutdown
        state_machine.shutdown()
        print("✅ Test completed successfully")
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    print("SentiCare Event Logging Test")
    print("This will test both periodic events and state change events")
    print("Make sure your Firebase credentials are configured correctly")
    print()
    
    success = test_event_logging()
    
    if success:
        print("\n🎉 All tests passed! Check Firebase console for events.")
    else:
        print("\n❌ Tests failed. Check error messages above.")
        sys.exit(1)
