# SentiCare AI Client Application

AI-Powered Patient Wellness Monitoring System that implements real-time human pose estimation and activity recognition with Firebase integration.

## Features

- **Real-time Video Processing**: Captures and processes webcam video using multithreading
- **AI Activity Recognition**: Maps keras model outputs to specification states:
  - `WALKING` (walk)
  - `SITTING` (sitting/sit_down)
  - `STANDING` (standing/stand_up)
  - `IN_BED` (lying/lie_down)
  - `IDLE` (fallen/other)
  - `FALL_DETECTED` (critical event)
- **State Machine**: Implements debouncing logic to prevent flickering state changes
- **Firebase Integration**: Writes to three Firestore collections:
  - `events`: Historical activity log
  - `alerts`: Critical event notifications
  - `patientStatus`: Live patient status updates
- **Multithreaded Architecture**: Separate threads for video processing and heartbeat updates
- **Graceful Shutdown**: Handles interrupts and saves final state

## Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Firebase Authentication
1. Download your Firebase service account JSON key file
2. Set the environment variable:
```bash
# Windows
set GOOGLE_APPLICATION_CREDENTIALS=path\to\your\service-account-key.json

# Linux/Mac
export GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json
```

### 3. Configuration
Edit `config.json` with your specific settings:
```json
{
    "patientId": "your-patient-id",
    "roomId": "your-room-id",
    "debounce_duration": 7,
    "heartbeat_interval": 180,
    "confidence_threshold": 0.90
}
```

## Usage

### Basic Usage
```bash
python main.py
```

### With Custom Config
```bash
python main.py --config custom_config.json
```

### Verbose Mode
```bash
python main.py --verbose
```

## System Architecture

### Components

1. **ModelInterface**: Handles AI model inference and label mapping
2. **ActivityStateMachine**: Manages state transitions with debouncing logic
3. **FirebaseClient**: Handles authentication and Firestore operations
4. **Monitor**: Orchestrates all components with multithreading
5. **Webcam**: Manages video capture with thread-safe buffer

### Data Flow

1. Webcam captures video frames continuously
2. ModelInterface processes video clips and returns predictions
3. ActivityStateMachine applies debouncing logic and manages state transitions
4. FirebaseClient writes events, alerts, and status updates to Firestore
5. Heartbeat thread sends status updates every 3 minutes

### State Machine Logic

- **Critical Events**: Immediately written to both `alerts` and `events` collections
- **Routine States**: Debounced for 7 seconds before confirming state change
- **Heartbeat**: Status updates sent every 3 minutes regardless of state changes

## Firestore Collections

### events
```json
{
    "patientId": "string",
    "roomId": "string",
    "eventType": "SITTING|WALKING|STANDING|IN_BED|IDLE",
    "durationSeconds": "number",
    "confidenceScore": "number",
    "timestamp": "Firestore Timestamp"
}
```

### alerts
```json
{
    "patientId": "string",
    "roomId": "string",
    "alertType": "FALL_DETECTED|HELP_SIGNAL_DETECTED",
    "acknowledged": false,
    "confidenceScore": "number",
    "timestamp": "Firestore Timestamp"
}
```

### patientStatus
```json
{
    "currentState": "string",
    "stateStartTime": "Firestore Timestamp",
    "lastSeen": "Firestore Timestamp",
    "roomId": "string",
    "confidenceScore": "number"
}
```

## Troubleshooting

### Common Issues

1. **GOOGLE_APPLICATION_CREDENTIALS not set**
   - Ensure environment variable points to valid service account key

2. **Model file not found**
   - Verify `Senticare/model_checkpoint.keras` exists

3. **Webcam not accessible**
   - Check if webcam is connected and not used by other applications

4. **Firebase connection issues**
   - Verify internet connection and Firebase project settings

### Logs

The application provides detailed logging for:
- System initialization
- AI predictions with confidence scores
- State transitions and debouncing
- Firebase operations
- Error handling

## Performance

- **Processing Rate**: ~10 FPS video analysis
- **Memory Usage**: Optimized with frame copying and buffer management
- **Network Usage**: Minimal - only sends data on state changes and heartbeats
- **CPU Usage**: Efficient multithreading separates video processing from I/O operations
