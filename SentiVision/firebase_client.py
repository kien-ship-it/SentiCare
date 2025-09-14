import os
import json
import pytz
from google.cloud import firestore
from google.oauth2 import service_account
import threading
from datetime import datetime


class FirebaseClient:
    def __init__(self, config_path="config.json"):
        """Initialize Firebase client with authentication"""
        self.config = self._load_config(config_path)
        self.db = self._initialize_firestore()
        self._lock = threading.Lock()
        
        # Set up timezone from config
        self.timezone = pytz.timezone(self.config.get('timezone', 'America/New_York'))
        
    def _load_config(self, config_path):
        """Load configuration from JSON file"""
        try:
            with open(config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            raise FileNotFoundError(f"Configuration file {config_path} not found")
        except json.JSONDecodeError:
            raise ValueError(f"Invalid JSON in configuration file {config_path}")
    
    def _initialize_firestore(self):
        """Initialize Firestore client with service account authentication"""
        # Use hardcoded credentials from config
        service_account_path = self.config.get('serviceAccountKeyPath')
        project_id = self.config.get('projectId')
        
        if not service_account_path:
            # Fallback to environment variable
            service_account_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
            
        if not service_account_path:
            raise ValueError(
                "Service account key path not found in config or GOOGLE_APPLICATION_CREDENTIALS environment variable. "
                "Please set serviceAccountKeyPath in config.json or GOOGLE_APPLICATION_CREDENTIALS environment variable."
            )
        
        if not os.path.exists(service_account_path):
            raise FileNotFoundError(f"Service account key file not found: {service_account_path}")
        
        try:
            # Load credentials from service account key file
            credentials = service_account.Credentials.from_service_account_file(service_account_path)
            
            # Use project ID from config or from credentials
            final_project_id = project_id or credentials.project_id
            
            # Initialize Firestore client
            db = firestore.Client(credentials=credentials, project=final_project_id)
            
            print(f"Successfully connected to Firestore project: {final_project_id}")
            return db
            
        except Exception as e:
            raise RuntimeError(f"Failed to initialize Firestore client: {str(e)}")
    
    def write_event(self, event_type, duration_seconds, confidence_score, metadata=None):
        """Write event data to the events collection"""
        with self._lock:
            try:
                event_data = {
                    "patientId": self.config["patientId"],
                    "roomId": self.config["roomId"],
                    "eventType": event_type,
                    "durationSeconds": duration_seconds,
                    "confidenceScore": confidence_score,
                    "timestamp": firestore.SERVER_TIMESTAMP
                }
                
                if metadata:
                    event_data["metadata"] = metadata
                
                doc_ref = self.db.collection('events').add(event_data)
                print(f"Event written to Firestore: {event_type} (duration: {duration_seconds}s)")
                return doc_ref
                
            except Exception as e:
                print(f"Error writing event to Firestore: {str(e)}")
                raise
    
    def write_alert(self, alert_type, confidence_score):
        """Write alert data to the alerts collection"""
        with self._lock:
            try:
                alert_data = {
                    "patientId": self.config["patientId"],
                    "roomId": self.config["roomId"],
                    "alertType": alert_type,
                    "acknowledged": False,
                    "confidenceScore": confidence_score,
                    "timestamp": firestore.SERVER_TIMESTAMP
                }
                
                doc_ref = self.db.collection('alerts').add(alert_data)
                print(f"CRITICAL ALERT written to Firestore: {alert_type} (confidence: {confidence_score})")
                return doc_ref
                
            except Exception as e:
                print(f"Error writing alert to Firestore: {str(e)}")
                raise
    
    def update_patient_status(self, current_state, state_start_time, confidence_score):
        """Update patient status in the patientStatus collection"""
        with self._lock:
            try:
                status_data = {
                    "currentState": current_state,
                    "stateStartTime": state_start_time,
                    "lastSeen": firestore.SERVER_TIMESTAMP,
                    "roomId": self.config["roomId"],
                    "confidenceScore": confidence_score
                }
                
                # Use patientId as document ID for overwrite operation
                doc_ref = self.db.collection('patientStatus').document(self.config["patientId"])
                doc_ref.set(status_data)
                
                print(f"Patient status updated: {current_state} (confidence: {confidence_score})")
                return doc_ref
                
            except Exception as e:
                print(f"Error updating patient status in Firestore: {str(e)}")
                raise
    
    def get_config(self, key=None):
        """Get configuration value(s)"""
        if key:
            return self.config.get(key)
        return self.config.copy()
