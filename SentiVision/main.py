#!/usr/bin/env python3
"""
SentiCare AI Client Application
AI-Powered Patient Wellness Monitoring System

This application implements the AI Engineering specification for real-time
human pose estimation and activity recognition with Firebase integration.

Usage:
    python main.py

Requirements:
    - Set GOOGLE_APPLICATION_CREDENTIALS environment variable
    - Ensure config.json is properly configured
    - Connected webcam
    - Internet connection for Firebase
"""

import os
import sys
import argparse
from monitoring import Monitor


def check_environment():
    """Check if the environment is properly configured"""
    # Check for config file
    if not os.path.exists('config.json'):
        print("ERROR: config.json not found")
        print("Please ensure config.json exists with patientId and roomId")
        return False
    
    # Load config to check service account path
    try:
        import json
        with open('config.json', 'r') as f:
            config = json.load(f)
        
        service_account_path = config.get('serviceAccountKeyPath')
        if service_account_path and os.path.exists(service_account_path):
            print(f"Using service account key from config: {service_account_path}")
            return True
        
        # Fallback to environment variable
        credentials_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
        if credentials_path and os.path.exists(credentials_path):
            print(f"Using service account key from environment: {credentials_path}")
            return True
        
        print("ERROR: Service account key file not found")
        print("Please ensure one of the following:")
        print("1. Set 'serviceAccountKeyPath' in config.json to point to your service account key")
        print("2. Set GOOGLE_APPLICATION_CREDENTIALS environment variable")
        print(f"Expected path from config: {service_account_path}")
        return False
        
    except Exception as e:
        print(f"ERROR: Failed to load config.json: {str(e)}")
        return False


def main():
    """Main entry point for SentiCare AI Client"""
    parser = argparse.ArgumentParser(
        description='SentiCare AI Client - Patient Wellness Monitoring System'
    )
    parser.add_argument(
        '--config', 
        default='config.json',
        help='Path to configuration file (default: config.json)'
    )
    parser.add_argument(
        '--verbose', 
        action='store_true',
        help='Enable verbose logging'
    )
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("SentiCare AI Client Application")
    print("AI-Powered Patient Wellness Monitoring System")
    print("=" * 60)
    
    # Check environment setup
    if not check_environment():
        sys.exit(1)
    
    try:
        # Initialize and start monitoring system
        monitor = Monitor(config_path=args.config)
        
        print("\nSystem initialized successfully!")
        print("Starting monitoring...")
        print("\nThe system will:")
        print("- Capture video from webcam")
        print("- Perform real-time AI analysis")
        print("- Track patient activity states")
        print("- Send data to Firebase Firestore")
        print("- Generate alerts for critical events")
        print("- Send heartbeat updates every 3 minutes")
        
        # Start monitoring (this will block until stopped)
        monitor.start_monitoring()
        
    except KeyboardInterrupt:
        print("\nShutdown requested by user")
    except Exception as e:
        print(f"\nERROR: {str(e)}")
        sys.exit(1)
    
    print("SentiCare AI Client stopped")


if __name__ == "__main__":
    main()