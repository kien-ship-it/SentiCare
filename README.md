# SentiCare
A non-invasive intelligence system using a webcam to track wellness and detect falls. It sends instant alerts and analysis to caregivers, providing constant peace of mind.
<img width="1624" height="1062" alt="Screenshot 2025-09-14 at 06 46 55" src="https://github.com/user-attachments/assets/4947a722-b4cf-4942-85e5-f273f82a15ca" />
<img width="1624" height="1062" alt="Screenshot 2025-09-14 at 06 46 49" src="https://github.com/user-attachments/assets/c73b6c3a-d53c-47e8-a5a9-54892a24448a" />
<img width="1624" height="1062" alt="Screenshot 2025-09-14 at 06 46 58" src="https://github.com/user-attachments/assets/c37a3e76-2053-432d-950f-ece26035b3e9" />
## Inspiration
We were inspired to help caregivers who constantly worry about the safety of their loved ones. Existing solutions like wearables can feel intrusive, so we wanted to create a system that provides critical safety alerts while fundamentally respecting a person's **privacy and dignity**. Our goal was a system that protects without prying.

## What it does
SentiCare turns a standard webcam into a smart wellness monitor. Because all video is processed locally on the edge, **no sensitive footage ever leaves the room, ensuring complete privacy.**
*   **Activity Tracking:** It logs time spent `in bed`, `sitting`, `standing`, or `away`.
*   **Fall Detection:** Using our custom-trained AI, it instantly identifies falls.
*   **Instant In-App Alerts:** When a fall is detected, a prominent, real-time alert appears on the caregiver's web dashboard.
*   **AI Wellness Analysis:** Our system doesn't just collect data; it understands it. A Gemini-powered intelligence engine analyzes daily activity to generate a "wellness score" and provide caregivers with simple, natural-language summaries on demand.

## How we built it
We used a privacy-first, event-driven architecture.
*   **AI Edge Client:** The core is a Python application running on a local computer. We trained our own **ResNet-based model** using **Google Colab** to classify patient activity. This **edge computing** approach means only anonymous data points (like 'SITTING' or 'FALL_DETECTED') are sent to the cloud.
*   **Data Hub:** **Google Firestore** acts as our central database and event bus.
*   **Reactive Backend:** Serverless **Cloud Functions** trigger on new database entries to aggregate data.
*   **Frontend Dashboard:** A **React.js** app subscribes to Firestore for live data.
*   **AI Analysis Service:** A **Node.js** API connects our frontend to the **Firebase Gemini API** to generate intelligent wellness summaries.

## Challenges we ran into
Integrating the physical **hardware** (the local computer and webcam) with our **cloud software** was a major hurdle. We had to build a reliable and secure data pipeline from the Python client to Firestore, managing credentials safely on the edge device and ensuring the data structures from Python perfectly matched what our Node.js cloud functions expected.

Additionally, ensuring data accuracy from our AI model was critical. We implemented a robust **debouncing logic** to filter out noisy, "flickering" state changes, guaranteeing our activity logs were clean and meaningful.

## Accomplishments that we're proud of
We are incredibly proud of successfully **training and deploying our own custom ResNet model**. Building a complete, end-to-end system and successfully **bridging the gap between local hardware processing and our real-time cloud infrastructure** is a massive achievement. Our AI wellness engine provides true, actionable insights, not just raw data, fulfilling our goal of creating a truly intelligent care system.

## What we learned
This project was a deep dive into the full machine learning lifecycle—from training a model in Colab to deploying it in a live application. We learned how to design a robust, event-driven system and solve the practical challenges of connecting an edge device securely and reliably to a cloud backend.

## What's next for SentiCare
*   **Proactive Anomaly Detection:** Train the system to automatically flag subtle, negative trends in a patient's daily routine before they become critical.
*   **Multi-Room Support:** Expand the system to aggregate data from multiple cameras for a more holistic view of a patient's home.
*   **Caregiver Collaboration:** Add features for caregivers to leave notes and coordinate care directly within the dashboard.
