# scripts/seed_data.py

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta
import random
import pytz # Handles timezone awareness

# --- 1. CONFIGURATION ---
# IMPORTANT: Replace with your actual Firebase Project ID
PROJECT_ID = "senticare-wellness-system" 
SERVICE_ACCOUNT_KEY_PATH = "scripts/serviceAccountKey.json"

# Use the hardcoded IDs from your app's configuration
PATIENT_ID = "pXT5aC3gQd9F8hJ2kL5n"
DEMO_USER_ID = "demo_caregiver_01"
ROOM_ID = "Living Room"

# Define a single, consistent timezone for the entire script
TIMEZONE = pytz.timezone('America/New_York')

# Define the date range for data generation (inclusive) and make them timezone-aware
START_DATE = TIMEZONE.localize(datetime(2025, 8, 14))
END_DATE = TIMEZONE.localize(datetime(2025, 9, 14))


# --- 2. INITIALIZE FIREBASE ADMIN SDK ---
try:
    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
    firebase_admin.initialize_app(cred, {
        'projectId': PROJECT_ID,
    })
    db = firestore.client()
    print("✅ Firebase Admin SDK initialized successfully.")
except Exception as e:
    print(f"❌ Error initializing Firebase Admin SDK: {e}")
    print("Please ensure your serviceAccountKey.json is in the correct path and your PROJECT_ID is set.")
    exit()

# --- 3. DATA GENERATION LOGIC ---

def generate_daily_data(current_date):
    """
    Generates a list of event documents and a single daily summary document
    based on the narrative arc.
    """
    events_for_day = []
    daily_summary_data = {
        'patientId': PATIENT_ID,
        'summaryDate': current_date,
        'wellnessScore': None, # To be filled by Gemini later
        'roomMetrics': {
            ROOM_ID: {
                'timeInBedSeconds': 0, 'sittingTimeSeconds': 0, 'standingTimeSeconds': 0,
                'walkingTimeSeconds': 0, 'idleTimeSeconds': 0, 'notPresentTimeSeconds': 0,
                'fallCount': 0, 'helpSignalCount': 0,
            }
        },
        'lastUpdated': firestore.SERVER_TIMESTAMP
    }
    alerts_for_day = []

    # --- NARRATIVE PHASES ---
    # All date comparisons are now between timezone-aware objects
    
    # PHASE 1: Baseline (Aug 14 - Aug 25)
    if START_DATE <= current_date <= TIMEZONE.localize(datetime(2025, 8, 25)):
        sleep_seconds = random.randint(27000, 30600) # 7.5 - 8.5 hours
        walking_seconds = random.randint(3600, 5400) # 1 - 1.5 hours
        not_present_seconds = random.randint(1800, 3600) # 30 - 60 mins

    # PHASE 2: The Incident & Aftermath (Aug 26 - Aug 28)
    elif current_date == TIMEZONE.localize(datetime(2025, 8, 26)): # Day of the fall
        print(f"  -> Generating incident data for {current_date.date()}")
        sleep_seconds = random.randint(14400, 18000) # 4 - 5 hours (disrupted sleep)
        walking_seconds = random.randint(1800, 2700) # Lower walking
        not_present_seconds = 0
        daily_summary_data['roomMetrics'][ROOM_ID]['fallCount'] = 1
        
        # Create the alert document for the fall
        fall_time = current_date + timedelta(hours=random.randint(14, 16)) # Afternoon fall
        alerts_for_day.append({
            'patientId': PATIENT_ID, 'roomId': ROOM_ID, 'timestamp': fall_time,
            'alertType': 'FALL_DETECTED', 'acknowledged': False, 'confidenceScore': round(random.uniform(0.92, 0.99), 2)
        })

    elif TIMEZONE.localize(datetime(2025, 8, 27)) <= current_date <= TIMEZONE.localize(datetime(2025, 8, 28)): # Doctor's visit / disruption
        sleep_seconds = random.randint(28800, 32400) # Catching up on sleep
        walking_seconds = random.randint(300, 600) # Very little walking
        not_present_seconds = random.randint(10800, 14400) # 3-4 hours away
    
    # PHASE 3: The Recovery Period (Aug 29 - Sep 14)
    else:
        sleep_seconds = random.randint(27000, 30600) # Sleep back to normal
        
        # Model gradual recovery for walking time
        recovery_start_date = TIMEZONE.localize(datetime(2025, 8, 28))
        days_into_recovery = (current_date - recovery_start_date).days
        max_recovery_days = (END_DATE - recovery_start_date).days
        recovery_progress = min(days_into_recovery / max_recovery_days, 1.0) # Progress from 0.0 to 1.0
        
        # Start low and slowly return to baseline
        start_walk_sec = 900 # 15 mins
        baseline_walk_sec = 4500 # 1.25 hours avg
        walking_seconds = int(start_walk_sec + (baseline_walk_sec - start_walk_sec) * recovery_progress)
        
        not_present_seconds = random.randint(900, 1800) # Shorter trips
        
        # Add a help signal alert during recovery
        if current_date == TIMEZONE.localize(datetime(2025, 9, 5)):
            print(f"  -> Generating help signal for {current_date.date()}")
            daily_summary_data['roomMetrics'][ROOM_ID]['helpSignalCount'] = 1
            help_time = current_date + timedelta(hours=random.randint(10, 12)) # Morning
            alerts_for_day.append({
                'patientId': PATIENT_ID, 'roomId': ROOM_ID, 'timestamp': help_time,
                'alertType': 'HELP_SIGNAL_DETECTED', 'acknowledged': True, 
                'acknowledgedBy': DEMO_USER_ID, 'confidenceScore': round(random.uniform(0.85, 0.95), 2)
            })

    # --- FILLING THE 24-HOUR DAY ---
    total_seconds_in_day = 86400
    accounted_seconds = sleep_seconds + walking_seconds + not_present_seconds
    remaining_seconds = total_seconds_in_day - accounted_seconds
    
    # Distribute remaining time between sitting and standing
    sitting_seconds = int(remaining_seconds * random.uniform(0.75, 0.90))
    standing_seconds = remaining_seconds - sitting_seconds
    
    # Update the summary with final calculated values
    metrics = daily_summary_data['roomMetrics'][ROOM_ID]
    metrics['timeInBedSeconds'] = sleep_seconds
    metrics['walkingTimeSeconds'] = walking_seconds
    metrics['notPresentTimeSeconds'] = not_present_seconds
    metrics['sittingTimeSeconds'] = sitting_seconds
    metrics['standingTimeSeconds'] = standing_seconds
    
    # (Simplified) Create a few representative event logs for the day
    if sleep_seconds > 0: events_for_day.append({'eventType': 'IN_BED', 'durationSeconds': sleep_seconds})
    if sitting_seconds > 0: events_for_day.append({'eventType': 'SITTING', 'durationSeconds': sitting_seconds})
    if walking_seconds > 0: events_for_day.append({'eventType': 'WALKING', 'durationSeconds': walking_seconds})
    if not_present_seconds > 0: events_for_day.append({'eventType': 'NOT_PRESENT', 'durationSeconds': not_present_seconds})
    
    # Finalize event documents with required fields
    for event in events_for_day:
        event.update({
            'patientId': PATIENT_ID, 'roomId': ROOM_ID,
            'timestamp': current_date + timedelta(hours=random.randint(1, 23)),
            'confidenceScore': round(random.uniform(0.88, 0.99), 2)
        })
        
    return events_for_day, daily_summary_data, alerts_for_day

# --- 4. MAIN EXECUTION ---
def main():
    print("Starting data generation process...")
    
    all_events = []
    all_summaries = []
    all_alerts = []

    total_days = (END_DATE - START_DATE).days + 1
    day_count = 0
    
    # The loop now naturally produces timezone-aware datetime objects
    for current_date in (START_DATE + timedelta(n) for n in range(total_days)):
        day_count += 1
        print(f"[{day_count}/{total_days}] Generating data for {current_date.strftime('%Y-%m-%d')}...")
        
        events, summary, alerts = generate_daily_data(current_date)
        all_events.extend(events)
        all_summaries.append(summary)
        all_alerts.extend(alerts)

    print("\nData generation complete. Preparing to upload to Firestore...")

    # --- BATCH UPLOAD TO FIRESTORE ---
    batch = db.batch()
    
    # Add events
    for event_data in all_events:
        event_ref = db.collection('events').document()
        batch.set(event_ref, event_data)
        
    # Add alerts
    for alert_data in all_alerts:
        alert_ref = db.collection('alerts').document()
        batch.set(alert_ref, alert_data)
        
    # Add daily summaries
    for summary_data in all_summaries:
        date_str = summary_data['summaryDate'].strftime('%Y-%m-%d')
        doc_id = f"{PATIENT_ID}_{date_str}"
        summary_ref = db.collection('dailySummaries').document(doc_id)
        batch.set(summary_ref, summary_data)
        
    try:
        batch.commit()
        print(f"\n✅ SUCCESS! Uploaded:")
        print(f"  - {len(all_summaries)} Daily Summary documents")
        print(f"  - {len(all_events)} Event documents")
        print(f"  - {len(all_alerts)} Alert documents")
    except Exception as e:
        print(f"❌ An error occurred during the batch upload: {e}")

if __name__ == "__main__":
    main()