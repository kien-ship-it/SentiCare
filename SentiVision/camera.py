from collections import deque
import cv2
import threading
import time
import numpy as np


class Webcam:
    def __init__(self, clip_length=20, show_preview=True):
        self.cap = cv2.VideoCapture(0)
        self.clip_length = clip_length
        self.videoBuffer = deque(maxlen=clip_length)
        self.videoReady = False
        self.show_preview = show_preview

        # Thread safety
        self._lock = threading.RLock()  # Reentrant lock
        self._capture_thread = None
        self._running = False

        if not self.cap.isOpened():
            print("Cannot open webcam")
            raise RuntimeError("Failed to open webcam")
        
        # Set camera properties for better quality
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        self.cap.set(cv2.CAP_PROP_FPS, 20)

    def start_capture(self):
        """Start continuous frame capture in background thread"""
        with self._lock:
            if self._capture_thread is not None and self._capture_thread.is_alive():
                return  # Already running

            self._running = True
            self._capture_thread = threading.Thread(target=self._capture_loop, daemon=True)
            self._capture_thread.start()

    def stop_capture(self):
        """Stop the capture thread"""
        with self._lock:
            self._running = False

        if self._capture_thread and self._capture_thread.is_alive():
            self._capture_thread.join(timeout=2.0)

    def _capture_loop(self):
        """Internal method - runs in background thread"""
        while self._running:
            ret, frame = self.cap.read()

            if not ret:
                print("[ERROR] Failed to grab frame.")
                time.sleep(0.1)  # Brief pause before retry
                continue

            with self._lock:
                self.videoBuffer.append(frame.copy())  # Copy frame to avoid reference issues
                if len(self.videoBuffer) == self.videoBuffer.maxlen:
                    self.videoReady = True

            # Show preview window if enabled
            if self.show_preview:
                self._show_preview_frame(frame)

            time.sleep(0.05)  # ~20 FPS

    def capture_frame(self):
        """Manual frame capture (thread-safe)"""
        ret, frame = self.cap.read()

        if not ret:
            print("[ERROR] Failed to grab frame.")
            return False

        with self._lock:
            self.videoBuffer.append(frame.copy())
            if len(self.videoBuffer) == self.videoBuffer.maxlen:
                self.videoReady = True

        return True

    def get_frame(self):
        """Get the latest frame (thread-safe)"""
        with self._lock:
            if self.videoBuffer:
                return self.videoBuffer[-1].copy()  # Return copy to avoid modification
            return None

    def get_clip(self):
        """Get current video clip (thread-safe)"""
        with self._lock:
            if self.videoReady:
                return [frame.copy() for frame in self.videoBuffer]  # Return copies
            return []

    def is_ready(self):
        """Check if video clip is ready (thread-safe)"""
        with self._lock:
            return self.videoReady

    def get_buffer_size(self):
        """Get current buffer size (thread-safe)"""
        with self._lock:
            return len(self.videoBuffer)
    
    def _show_preview_frame(self, frame):
        """Show preview frame with AI status overlay"""
        try:
            # Create a copy for display
            display_frame = frame.copy()
            
            # Add status overlay
            height, width = display_frame.shape[:2]
            
            # Add SentiCare branding
            cv2.putText(display_frame, "SentiCare AI Monitor", (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            # Add buffer status
            buffer_text = f"Buffer: {len(self.videoBuffer)}/{self.clip_length}"
            cv2.putText(display_frame, buffer_text, (10, height - 60), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            
            # Add ready status
            status_text = "READY" if self.videoReady else "FILLING..."
            color = (0, 255, 0) if self.videoReady else (0, 255, 255)
            cv2.putText(display_frame, status_text, (10, height - 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
            
            # Show the frame
            cv2.imshow("SentiCare Camera Feed", display_frame)
            
            # Handle window events (non-blocking)
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                print("Preview window closed by user")
                self.show_preview = False
                cv2.destroyWindow("SentiCare Camera Feed")
                
        except Exception as e:
            # Silently handle preview errors to not crash the main loop
            pass

    def release_camera(self):
        """Clean shutdown"""
        self.stop_capture()

        if self.cap.isOpened():
            self.cap.release()

        cv2.destroyAllWindows()

    def __enter__(self):
        """Context manager support"""
        self.start_capture()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager cleanup"""
        self.release_camera()