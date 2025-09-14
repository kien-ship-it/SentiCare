#!/usr/bin/env python3
"""
Simple camera test to debug camera issues
"""

import cv2
import time

def test_camera():
    print("Testing camera access...")
    
    # Try to open camera
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("❌ Cannot open camera")
        print("Possible issues:")
        print("1. Camera is being used by another application")
        print("2. Camera permissions not granted")
        print("3. No camera connected")
        return False
    
    print("✅ Camera opened successfully")
    
    # Test frame capture
    ret, frame = cap.read()
    if not ret:
        print("❌ Cannot read frame from camera")
        cap.release()
        return False
    
    print(f"✅ Frame captured: {frame.shape}")
    
    # Show a test window for 3 seconds
    print("Opening test window for 3 seconds...")
    cv2.imshow("Camera Test", frame)
    cv2.waitKey(3000)  # Wait 3 seconds
    
    # Cleanup
    cap.release()
    cv2.destroyAllWindows()
    
    print("✅ Camera test completed successfully")
    return True

if __name__ == "__main__":
    test_camera()
