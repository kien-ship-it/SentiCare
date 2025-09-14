#!/usr/bin/env python3
"""
Simple camera test to diagnose webcam issues
"""
import cv2
import time

def test_camera():
    print("Testing camera access...")
    
    # Try different camera indices
    for camera_index in range(3):
        print(f"\nTrying camera index {camera_index}...")
        cap = cv2.VideoCapture(camera_index)
        
        if cap.isOpened():
            print(f"✓ Camera {camera_index} opened successfully")
            
            # Try to read a frame
            ret, frame = cap.read()
            if ret:
                print(f"✓ Successfully captured frame: {frame.shape}")
                
                # Show camera properties
                width = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
                height = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
                fps = cap.get(cv2.CAP_PROP_FPS)
                
                print(f"  Resolution: {int(width)}x{int(height)}")
                print(f"  FPS: {fps}")
                
                # Test multiple frames
                print("Testing frame capture (5 frames)...")
                for i in range(5):
                    ret, frame = cap.read()
                    if ret:
                        print(f"  Frame {i+1}: OK")
                    else:
                        print(f"  Frame {i+1}: FAILED")
                    time.sleep(0.1)
                
                cap.release()
                print(f"✓ Camera {camera_index} working properly!")
                return camera_index
            else:
                print(f"✗ Could not capture frame from camera {camera_index}")
        else:
            print(f"✗ Could not open camera {camera_index}")
        
        cap.release()
    
    print("\n✗ No working cameras found!")
    return None

def test_opencv_backends():
    print("\nTesting OpenCV backends...")
    backends = [
        (cv2.CAP_DSHOW, "DirectShow (Windows)"),
        (cv2.CAP_MSMF, "Media Foundation (Windows)"),
        (cv2.CAP_V4L2, "Video4Linux2 (Linux)"),
        (cv2.CAP_ANY, "Any available")
    ]
    
    for backend_id, backend_name in backends:
        try:
            cap = cv2.VideoCapture(0, backend_id)
            if cap.isOpened():
                ret, frame = cap.read()
                if ret:
                    print(f"✓ {backend_name}: Working")
                    cap.release()
                    return backend_id
                else:
                    print(f"✗ {backend_name}: Opens but can't capture")
            else:
                print(f"✗ {backend_name}: Cannot open")
            cap.release()
        except Exception as e:
            print(f"✗ {backend_name}: Error - {str(e)}")
    
    return None

if __name__ == "__main__":
    print("SentiCare Camera Diagnostic Tool")
    print("=" * 40)
    
    # Test basic camera access
    working_camera = test_camera()
    
    if working_camera is None:
        # Test different backends
        working_backend = test_opencv_backends()
        
        if working_backend is None:
            print("\nTroubleshooting suggestions:")
            print("1. Check if webcam is connected and not used by another app")
            print("2. Try closing other video applications (Zoom, Teams, etc.)")
            print("3. Check Windows Camera privacy settings")
            print("4. Try running as administrator")
            print("5. Update webcam drivers")
        else:
            print(f"\nSuggestion: Use backend {working_backend} in your camera code")
    else:
        print(f"\n✓ Camera system is working! Use camera index {working_camera}")
