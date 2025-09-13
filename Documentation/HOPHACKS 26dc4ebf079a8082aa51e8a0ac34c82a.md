# HOPHACKS

<aside>
💡

LINKS
[https://www.contextus.space/docs/api](https://www.contextus.space/docs/api) 

https://www.contextus.space/login

[https://spacetimedb.com/](https://spacetimedb.com/)

https://www.mentormates.ai/login

[https://docs.google.com/document/d/1DoOE1PWELIK34gsD_HLgOCEPuX8gySnTLpFAKQ4dUyY/edit?tab=t.0](https://docs.google.com/document/d/1DoOE1PWELIK34gsD_HLgOCEPuX8gySnTLpFAKQ4dUyY/edit?tab=t.0)

[https://discord.com/channels/1310458266228359178/1310458267465682996](https://discord.com/channels/1310458266228359178/1310458267465682996)

</aside>

[AI Engineer](HOPHACKS%2026dc4ebf079a8082aa51e8a0ac34c82a/AI%20Engineer%2026dc4ebf079a80619abfd88daaa1f228.md)

[SWE](HOPHACKS%2026dc4ebf079a8082aa51e8a0ac34c82a/SWE%2026dc4ebf079a80b79ff0d51289555eff.md)

### **Technical Application Description: SentiCare Wellness System**

**Version:** 1.0
**Document Purpose:** This document provides a comprehensive technical overview of the SentiCare system, outlining the complete architecture, data flow, technology stack, and the distinct responsibilities of the AI and Software Engineering roles.

---

### **1. Project Overview**

SentiCare is a non-invasive, AI-powered patient wellness monitoring system designed to provide caregivers with real-time insights into a patient's activity and safety. By leveraging a local webcam and edge computing, the system analyzes a patient's state, detects critical events like falls, and presents the data in an intuitive web dashboard. The core of the system is an event-driven architecture built on Google Cloud Platform, ensuring scalability, real-time responsiveness, and a clear separation of concerns.

### 

### **2. Core Features**

- **Activity Monitoring:** Tracks `time in bed`, `sitting time`, `standing time`, **and `time away` (out of view)**.
- **Real-time Patient State:** Identifies if the patient is `IDLE`, `SITTING`, `WALKING`, `STANDING`, `IN_BED`, **or `NOT_PRESENT`**.
- **Critical Event Detection:** Automatically detects `Falls` and pre-defined `Help Signals` (body movement gestures).
- **Instant Notifications:** Sends immediate SMS alerts to caregivers via Twilio for critical events.
- **Wellness Dashboard:** A web-based interface for caregivers to view real-time status, historical activity data, and room-specific analysis.
- **AI Chat Agent:** A Gemini-powered assistant within the dashboard that can summarize patient data and calculate a daily "wellness score" on demand.

### **3. System Architecture**

SentiCare operates on a decoupled, event-driven architecture where Google Firestore serves as the central data hub and event bus.

1. **AI Client (Edge Compute | Producer):** A standalone Python application running on a local laptop. It captures the webcam feed, performs real-time AI inference to detect patient states and events, and is solely responsible for writing analysis data directly to Firestore.
2. **Google Firestore (Data Hub & Event Bus):** The single source of truth. It stores all raw events, alerts, live status, and aggregated summaries. Its event-driven nature is key to the system's reactivity.
3. **Backend Services (Cloud Functions | Reactive Consumer):** Serverless functions that trigger in response to database events in Firestore. They handle business logic that should not live on the client, such as sending notifications and aggregating data.
4. **Node.js API (Service Endpoint):** A dedicated, secure backend service whose primary function is to serve as a bridge between the frontend and the Gemini API for the AI Chat Agent.
5. **React Frontend (Web Application | Consumer):** The user-facing dashboard. It authenticates users and subscribes directly to Firestore for real-time data visualization, providing a live and interactive experience.

### **4. Technology Stack**

- **AI / Edge Compute:** Python, TensorFlow/PyTorch, OpenCV, YOLO
- **Database:** Google Firestore
- **Backend:** Node.js, Cloud Functions for Firebase
- **AI Chat Agent:** Firebase Gemini
- **Authentication:** Firebase Authentication
- **Notifications:** Twilio SMS API
- **Frontend:** React.js, Firebase SDK, Chart.js (or similar)

---

### **5. Core Data Flow & Workflows**

This section describes the end-to-end journey of data for the two most important system functions.

### **Workflow A: Critical Fall Alert**

1. **Detection (AI Client):** The AI model detects a fall with high confidence.
2. **Write to Firestore (AI Client):** The client immediately constructs and writes a new document to the `alerts` collection.
3. **Trigger (Cloud Function):** The `onAlertCreated` Cloud Function is triggered by the new document.
4. **Notification (Backend):** The function reads the alert data, fetches caregiver contact info, and sends an SMS via Twilio.
5. **Display (Frontend):** The React dashboard, listening to the `alerts` collection, instantly displays a prominent notification banner for the new, unacknowledged alert.

### **Workflow B: Routine Activity Logging & Summarization**

1. **State Change Detection (AI Client):** The client's internal state machine detects a stable transition (e.g., patient was `SITTING` for 30 minutes and is now `STANDING`).
2. **Write to Firestore (AI Client):** The client calculates the duration (`1800 seconds`) and writes a new document for the *completed* `SITTING` event to the `events` collection.
3. **Trigger (Cloud Function):** The `onEventCreated` Cloud Function is triggered.
4. **Aggregation (Backend):** The function reads the event and atomically updates the appropriate fields in the `dailySummaries` document for that patient and day (e.g., increments `sittingTimeSeconds` by 1800).
5. **Display (Frontend):** When the user views the dashboard, the charts and graphs read their data from the pre-aggregated `dailySummaries` collection, ensuring fast load times.

---

### **6. Unified Data Contract: Firestore Schema**

This defines the data structures that both engineers must adhere to.

| Collection | Producer(s) | Consumer(s) | Purpose |
| --- | --- | --- | --- |
| events | AI Client | Backend (Cloud Function) | Historical log of all routine activities. |
| alerts | AI Client | Backend (Cloud Function), Frontend | Critical, actionable events that trigger notifications. The frontend updates the acknowledged and acknowledgedBy fields. |
| patientStatus | AI Client | Frontend | A single, live-updating document for real-time patient status. |
| dailySummaries | Backend (Cloud Function), Backend (API for Gemini) | Frontend, Backend (API for Gemini) | Pre-aggregated data for efficient dashboard visualization. |
| users, patients | Backend (Setup/Admin) | Backend (Cloud Function), Frontend | User and patient profile information. |

---

### **7. Roles & Responsibilities**

### **AI Engineer**

- **Owns the AI Client Application:** Develop, test, and maintain the Python application responsible for video processing and AI inference.
- **Model Implementation:** Implement and optimize the pose estimation and activity recognition models.
- **State Machine Logic:** Build the core logic for state management, including debouncing and duration calculation.
- **Data Production:** Ensure the AI Client produces data that strictly conforms to the `events`, `alerts`, and `patientStatus` Firestore schemas.
- **System Configuration:** Manage the client-side configuration for `patientId`, `roomId`, and service account credentials.

### **Software Engineer**

- **Owns the Cloud Infrastructure & Web App:** Responsible for the entire Firebase project, Node.js API, and the React frontend.
- **Backend Development:** Implement, test, and deploy the Cloud Functions (`onAlertCreated`, `onEventCreated`) that handle notifications and data aggregation.
- **API Development:** Build and secure the Node.js API endpoint for the Gemini AI Chat Agent.
- **Frontend Development:** Develop the React dashboard, including authentication, real-time data listeners (`onSnapshot`), data visualizations, and the user interface for alert management.
- **Database Management:** Define and enforce Firestore Security Rules to ensure data privacy and integrity.
- **Service Integrations:** Manage the integration with Twilio and Firebase Gemini.