import time
import threading
from datetime import datetime
from google.cloud import firestore


class ActivityStateMachine:
    def __init__(self, firebase_client, debounce_duration=7, confidence_threshold=0.90, max_event_duration=600):
        """
        Initialize the state machine for activity tracking
        
        Args:
            firebase_client: FirebaseClient instance for database operations
            debounce_duration: Time in seconds to wait before confirming state change
            confidence_threshold: Minimum confidence for critical event detection
            max_event_duration: Maximum duration (seconds) before writing periodic events
        """
        self.firebase_client = firebase_client
        self.debounce_duration = debounce_duration
        self.confidence_threshold = confidence_threshold
        self.max_event_duration = max_event_duration  # 10 minutes default
        
        # State tracking
        self.current_state = None
        self.state_start_time = None
        self.pending_state = None
        self.pending_start_time = None
        self.debounce_timer = None
        self.last_event_write_time = None  # Track when we last wrote an event for current state
        self.last_status_update_time = None  # Track when we last updated patient status
        
        # Thread safety
        self._lock = threading.Lock()
        
        # Valid states from specification
        self.valid_states = {
            'IDLE', 'SITTING', 'WALKING', 'STANDING', 'IN_BED', 'NOT_PRESENT'
        }
        
        # Critical events
        self.critical_events = {'FALL_DETECTED', 'HELP_SIGNAL_DETECTED'}
        
        print("ActivityStateMachine initialized")
    
    def process_prediction(self, prediction_result):
        """
        Process a new prediction from the model
        
        Args:
            prediction_result: Dict with 'state', 'confidence', 'is_critical', 'raw_class'
        """
        with self._lock:
            state = prediction_result['state']
            confidence = prediction_result['confidence']
            is_critical = prediction_result['is_critical']
            
            # Handle critical events immediately (highest priority)
            if is_critical and confidence >= self.confidence_threshold:
                self._handle_critical_event(state, confidence)
                return
            
            # Handle routine state changes with debouncing
            if state in self.valid_states:
                self._handle_routine_state(state, confidence)
    
    def _handle_critical_event(self, event_type, confidence):
        """Handle critical events immediately without debouncing"""
        try:
            print(f"CRITICAL EVENT DETECTED: {event_type} (confidence: {confidence:.3f})")
            
            # Write to alerts collection immediately
            self.firebase_client.write_alert(event_type, confidence)
            
            # Also write to events collection for historical record
            # For critical events, we use a minimal duration (1 second)
            self.firebase_client.write_event(event_type, 1, confidence)
            
        except Exception as e:
            print(f"Error handling critical event: {str(e)}")
    
    def _handle_routine_state(self, new_state, confidence):
        """Handle routine state changes with debouncing logic"""
        current_time = time.time()
        
        # Initialize state if this is the first prediction
        if self.current_state is None:
            self.current_state = new_state
            self.state_start_time = current_time
            self.last_event_write_time = current_time
            self.last_status_update_time = current_time
            print(f"Initial state set: {new_state}")
            
            # Immediately update patient status for initial state
            self._update_patient_status_immediately(confidence)
            return
        
        # If new state is same as current state, check for periodic event logging
        if new_state == self.current_state:
            # Cancel any pending state change
            if self.debounce_timer:
                self.debounce_timer.cancel()
                self.debounce_timer = None
                self.pending_state = None
                self.pending_start_time = None
            
            # Check if we need to write a periodic event for long-duration states
            self._check_periodic_event_logging(confidence, current_time)
            
            # Also update patient status periodically (every 30 seconds) during ongoing states
            self._check_periodic_status_update(confidence, current_time)
            return
        
        # If new state is different from current state
        if new_state != self.pending_state:
            # Cancel previous debounce timer if exists
            if self.debounce_timer:
                self.debounce_timer.cancel()
            
            # Start new debounce timer
            self.pending_state = new_state
            self.pending_start_time = current_time
            
            print(f"State change detected: {self.current_state} -> {new_state}, starting debounce timer")
            
            self.debounce_timer = threading.Timer(
                self.debounce_duration,
                self._confirm_state_change,
                args=[new_state, confidence, current_time]
            )
            self.debounce_timer.start()
    
    def _check_periodic_event_logging(self, confidence, current_time):
        """Check if we need to write a periodic event for long-duration states"""
        if not self.last_event_write_time:
            self.last_event_write_time = self.state_start_time or current_time
            return
        
        # Check if enough time has passed since last event write
        time_since_last_write = current_time - self.last_event_write_time
        
        if time_since_last_write >= self.max_event_duration:
            # Write a periodic event for the current ongoing state
            duration_seconds = int(time_since_last_write)
            
            try:
                self.firebase_client.write_event(
                    self.current_state,
                    duration_seconds,
                    confidence
                )
                
                # Update the last write time to current time
                self.last_event_write_time = current_time
                print(f"Periodic event logged: {self.current_state} ({duration_seconds}s)")
                
            except Exception as e:
                print(f"Error writing periodic event: {str(e)}")

    def _confirm_state_change(self, new_state, confidence, change_time):
        """Confirm state change after debounce period"""
        with self._lock:
            try:
                # Calculate duration of previous state
                if self.state_start_time:
                    duration_seconds = int(change_time - self.state_start_time)
                    
                    # Write previous state to events collection
                    if duration_seconds > 0:  # Only write if duration is positive
                        self.firebase_client.write_event(
                            self.current_state,
                            duration_seconds,
                            confidence
                        )
                
                # Update to new state
                previous_state = self.current_state
                self.current_state = new_state
                self.state_start_time = change_time
                self.last_event_write_time = change_time  # Reset periodic logging timer
                self.last_status_update_time = change_time  # Reset status update timer
                
                # Clear pending state
                self.pending_state = None
                self.pending_start_time = None
                self.debounce_timer = None
                
                print(f"State change confirmed: {previous_state} -> {new_state}")
                
                # Immediately update patient status for new confirmed state
                self._update_patient_status_immediately(confidence)
                
            except Exception as e:
                print(f"Error confirming state change: {str(e)}")
    
    def get_current_state(self):
        """Get current state information"""
        with self._lock:
            return {
                'current_state': self.current_state,
                'state_start_time': self.state_start_time,
                'pending_state': self.pending_state,
                'is_debouncing': self.debounce_timer is not None
            }
    
    def force_heartbeat_update(self, confidence):
        """Force a heartbeat update to patient status"""
        with self._lock:
            if self.current_state and self.state_start_time:
                try:
                    # Convert timestamp to Firestore timestamp
                    state_start_timestamp = firestore.SERVER_TIMESTAMP
                    if self.state_start_time:
                        state_start_timestamp = datetime.fromtimestamp(self.state_start_time)
                    
                    self.firebase_client.update_patient_status(
                        self.current_state,
                        state_start_timestamp,
                        confidence
                    )
                except Exception as e:
                    print(f"Error during heartbeat update: {str(e)}")
    
    def shutdown(self):
        """Clean shutdown of state machine"""
        with self._lock:
            if self.debounce_timer:
                self.debounce_timer.cancel()
                self.debounce_timer = None
            
            # Write final state if exists
            if self.current_state and self.state_start_time:
                try:
                    duration_seconds = int(time.time() - self.state_start_time)
                    if duration_seconds > 0:
                        self.firebase_client.write_event(
                            self.current_state,
                            duration_seconds,
                            0.5  # Default confidence for shutdown
                        )
                except Exception as e:
                    print(f"Error writing final state during shutdown: {str(e)}")
            
            print("ActivityStateMachine shutdown complete")
    
    def _update_patient_status_immediately(self, confidence):
        """Immediately update patient status in Firebase"""
        try:
            if self.current_state and self.state_start_time:
                # Convert timestamp to Firestore timestamp
                state_start_timestamp = firestore.SERVER_TIMESTAMP
                if self.state_start_time:
                    state_start_timestamp = datetime.fromtimestamp(self.state_start_time)
                
                self.firebase_client.update_patient_status(
                    self.current_state,
                    state_start_timestamp,
                    confidence
                )
                print(f"Patient status updated immediately: {self.current_state}")
        except Exception as e:
            print(f"Error updating patient status immediately: {str(e)}")
    
    def _check_periodic_status_update(self, confidence, current_time):
        """Check if we need to update patient status periodically (every 30 seconds)"""
        if not self.last_status_update_time:
            self.last_status_update_time = self.state_start_time or current_time
            return
        
        # Check if enough time has passed since last status update (30 seconds)
        time_since_last_update = current_time - self.last_status_update_time
        
        if time_since_last_update >= 30:  # Update every 30 seconds
            try:
                self._update_patient_status_immediately(confidence)
                self.last_status_update_time = current_time
                
            except Exception as e:
                print(f"Error during periodic status update: {str(e)}")
