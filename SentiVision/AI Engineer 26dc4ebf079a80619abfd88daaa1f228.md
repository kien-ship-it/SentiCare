# AI Engineer

**Technical Specification for AI Client Application**

---

**Project:** SentiCare - AI-Powered Patient Wellness Monitoring System
**Version:** 1.1
**Audience:** AI Engineer

---

### **1. Objective**

Your primary responsibility is to develop a standalone Python application (the "AI Client") that runs on a local laptop. This application will use a connected webcam to perform real-time human pose estimation and activity recognition. Based on this analysis, it will generate structured data payloads and write them directly to the appropriate Google Firestore collections.

This document serves as the formal data contract between the AI Client and the cloud backend. Adherence to these specifications is critical for the correct functioning of the entire SentiCare system.

### **2. Core System Responsibilities**

The AI Client application must:

1. **Video Input:** Capture a continuous video stream from a connected webcam.
2. **AI Inference:** Process the video feed in real-time to perform:
    - **Pose Estimation:** Identify key body landmarks.
    - **Activity Recognition:** Classify the patient's current state and detect critical events.
3. **State Management:** Maintain an internal state machine to track the patient's current activity, manage state transitions, and calculate durations.
4. **Data Formatting:** Construct JSON-like Python dictionaries that strictly adhere to the Firestore schemas defined in this document.
5. **Data Persistence:** Securely authenticate with and write data to the specified Google Firestore collections.

### **3. Required Model Outputs & Classifications**

Your model pipeline must be able to classify the patient's activity into one of the following categories. Each classification must be accompanied by a `confidenceScore` (float, 0.0 to 1.0).

### **Routine States (Enum):**

- `IDLE`: Patient is present but not in a clearly defined state.
- `SITTING`: Patient is detected in a sitting posture.
- `WALKING`: Patient is detected ambulating.
- `STANDING`: Patient is detected standing still.
- `IN_BED`: Patient is detected lying in a pre-defined "bed" zone.
- **`NOT_PRESENT`: No person has been detected in the frame for a sustained period (see debouncing logic).**

### **Critical Events (Enum):**

- `FALL_DETECTED`: A rapid, unintentional transition to a lower level has been detected.
- `HELP_SIGNAL_DETECTED`: A pre-defined gesture (e.g., both arms raised for >2 seconds) has been detected.

### **4. Core Logic: State Machine & Update Strategy**

To ensure data accuracy and control costs, you will not stream data on every frame. Instead, implement the following stateful logic:

### **A. Critical Event Logic (Highest Priority)**

- **Trigger:** A `FALL_DETECTED` or `HELP_SIGNAL_DETECTED` event is classified with a confidence score above the required threshold (e.g., `0.90`).
- **Action:**
    1. Immediately construct two separate payloads: one for the `alerts` collection and one for the `events` collection.
    2. Write both payloads to their respective collections in Firestore without delay.

### **B. Routine State Change Logic (Debouncing)**

- **Purpose:** To prevent "flickering" state changes from polluting the event log.
- **Implementation:**
    1. Maintain the `current_state` and `state_start_time` in memory.
    2. When the model detects a `new_state` that is different from `current_state`, start a **debounce timer** (recommended: **5-10 seconds**). **This includes the case where no person is detected, which should be considered the `NOT_PRESENT` state.**
    3. Only if the `new_state` is consistently detected for the entire debounce duration, proceed with the state change.
    4. **On successful state change:**
        - Calculate the duration of the *previous* state: `durationSeconds = now() - state_start_time`.
        - Construct the payload for the *previous* state and write it to the `events` collection.
        - Update the internal `current_state` to the `new_state` and reset the `state_start_time`.

### **C. Live Status Heartbeat Logic**

- **Purpose:** To provide a real-time status update to the dashboard and confirm the AI Client is online.
- **Implementation:**
    1. Every **3 minutes**, regardless of state changes, construct a status payload.
    2. Write this payload to the `patientStatus` collection. **Note:** This is an *overwrite* operation on a single document, not an addition of a new one.

### **5. Firestore Data Contract: Schemas & Payloads**

You will write to three separate Firestore collections. All field names must be `camelCase`. Timestamps must be handled by the Firestore client library to ensure they are stored as `Timestamp` objects.

### **Collection 1: `events`**

- **Purpose:** The historical log of all routine activities.
- **Trigger:** A stable state change has occurred.
- **Schema:**
| Field Name | Data Type | Required? | Description |
|-------------------|--------------------|-----------|--------------------------------------------------------------------------------|
| `patientId` | String | Yes | Unique ID of the patient. Provided via a configuration file. |
| `roomId` | String | Yes | Unique ID of the room. Provided via a configuration file. |
| `timestamp` | Firestore Timestamp| Yes | The time the event *ended*. The library will set this upon writing. |
| `eventType` | String (Enum) | Yes | One of the Routine State enums (e.g., `SITTING`). |
| `durationSeconds` | Number (Integer) | Yes | The total duration of the state in seconds. |
| `confidenceScore` | Number (Float) | Yes | Average or final confidence score for the detected state. |
| `metadata` | Map | No | Optional. For future use (e.g., `{ "avgPoseCertainty": 0.85 }`). |
- **Example Payload (Python Dictionary):**
    
    ```python
    event_data = {
        "patientId": "pXT5aC3gQd9F8hJ2kL5n",
        "roomId": "rM1bVzYw7XpS4tG9eR2c",
        "eventType": "SITTING",
        "durationSeconds": 1800,
        "confidenceScore": 0.95,
        "timestamp": firestore.SERVER_TIMESTAMP # Let Firestore set the time
    }
    # db.collection('events').add(event_data)
    
    ```
    

---

### **Collection 2: `alerts`**

- **Purpose:** For critical events that require immediate notification.
- **Trigger:** A `FALL_DETECTED` or `HELP_SIGNAL_DETECTED` event is classified.
- **Schema:**
| Field Name | Data Type | Required? | Description |
|-------------------|--------------------|-----------|--------------------------------------------------------------------------------|
| `patientId` | String | Yes | Unique ID of the patient. |
| `roomId` | String | Yes | Unique ID of the room. |
| `timestamp` | Firestore Timestamp| Yes | The exact time the alert was triggered. |
| `alertType` | String (Enum) | Yes | `FALL_DETECTED` or `HELP_SIGNAL_DETECTED`. |
| `acknowledged` | Boolean | Yes | **Hardcode this to `False`**. The backend will manage updates. |
| `confidenceScore` | Number (Float) | Yes | The model's confidence in this specific critical event detection. |
- **Example Payload (Python Dictionary):**
    
    ```python
    alert_data = {
        "patientId": "pXT5aC3gQd9F8hJ2kL5n",
        "roomId": "rM1bVzYw7XpS4tG9eR2c",
        "alertType": "FALL_DETECTED",
        "acknowledged": False,
        "confidenceScore": 0.99,
        "timestamp": firestore.SERVER_TIMESTAMP
    }
    # db.collection('alerts').add(alert_data)
    
    ```
    

---

### **Collection 3: `patientStatus`**

- **Purpose:** To provide a live, real-time snapshot of the patient's current state.
- **Trigger:** Every 3 minutes (heartbeat).
- **Document ID:** Use the `{patientId}` as the document ID for this collection.
- **Schema:**
| Field Name | Data Type | Required? | Description |
|-------------------|--------------------|-----------|--------------------------------------------------------------------------------|
| `currentState` | String (Enum) | Yes | The patient's current state (e.g., `WALKING`). |
| `stateStartTime` | Firestore Timestamp| Yes | The timestamp when the `currentState` began. |
| `lastSeen` | Firestore Timestamp| Yes | The timestamp of this heartbeat update. Set this on every write. |
| `roomId` | String | Yes | Unique ID of the room. |
| `confidenceScore` | Number (Float) | Yes | Confidence of the current state detection. |
- **Example Payload (Python Dictionary):**
    
    ```python
    # Note the use of .document(patient_id).set() to overwrite
    patient_id = "pXT5aC3gQd9F8hJ2kL5n"
    status_data = {
        "currentState": "WALKING",
        "stateStartTime": state_start_timestamp_object, # The saved start time
        "lastSeen": firestore.SERVER_TIMESTAMP,
        "roomId": "rM1bVzYw7XpS4tG9eR2c",
        "confidenceScore": 0.88
    }
    # db.collection('patientStatus').document(patient_id).set(status_data)
    
    ```
    

### **6. Setup & Configuration**

- **Authentication:** You will be provided with a Google Cloud Service Account JSON key file. The application must use this key to authenticate with Firestore.
- **Environment Variables:** Do not hardcode credentials. Load the path to the service account key from an environment variable (`GOOGLE_APPLICATION_CREDENTIALS`).
- **Configuration:** The `patientId` and `roomId` should be loaded from a simple local configuration file (e.g., `config.ini` or `config.json`) to allow for easy deployment in different rooms/for different patients.
- **Recommended Library:** `google-cloud-firestore` for Python.

### **7. Summary of Write Operations**

| If... | Then... |
| --- | --- |
| A **fall** or **help signal** is detected | Immediately write a new document to `alerts` AND `events`. |
| A **stable state change** is confirmed | Write a new document for the *previous state* to `events`, including its calculated `durationSeconds`. |
| It has been **3 minutes** since the last heartbeat | **Overwrite** the `{patientId}` document in `patientStatus` with the current live data. |