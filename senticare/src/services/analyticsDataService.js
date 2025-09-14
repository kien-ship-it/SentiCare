import { db } from '../firebase/firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  doc, 
  getDoc,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { PATIENT_ID } from '../firebase/appConfig';

class AnalyticsDataService {
  constructor() {
    this.patientId = PATIENT_ID;
  }

  // Get current patient state
  async getCurrentState() {
    try {
      console.log('🔍 Fetching current state for patient:', this.patientId);
      const patientStatusRef = doc(db, 'patientStatus', this.patientId);
      const docSnap = await getDoc(patientStatusRef);
      
      console.log('📄 Patient status document exists:', docSnap.exists());
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('📊 Raw patient status data:', data);
        
        if (data.currentState) {
          const currentState = {
            type: data.currentState.activity || data.currentState.state || data.currentState.eventType || data.currentState,
            timestamp: data.currentState.timestamp?.toDate() || new Date(),
            location: data.currentState.location || data.currentState.roomId || data.currentState.room || 'Room 101'
          };
          console.log('✅ Processed current state:', currentState);
          return currentState;
        }
      }
      
      // Return mock data if no real data exists
      console.log('⚠️ No current state found, returning mock data');
      return {
        type: 'STANDING',
        timestamp: new Date(),
        location: 'Room 325'
      };
    } catch (error) {
      console.error('❌ Error fetching current state:', error);
      return {
        type: 'UNKNOWN',
        timestamp: new Date(),
        location: 'Unknown Location'
      };
    }
  }

  // Get today's summary data
  async getTodaySummary() {
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      console.log('📅 Looking for today\'s summary:', todayStr, 'for patient:', this.patientId);
      
      const summaryQuery = query(
        collection(db, 'dailySummaries'),
        where('patientId', '==', this.patientId),
        where('date', '==', todayStr),
        limit(1)
      );

      const querySnapshot = await getDocs(summaryQuery);
      console.log('📊 Daily summaries found:', querySnapshot.size);
      
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        console.log('✅ Today\'s summary data:', data);
        return data;
      }
      
      // Return mock data for testing
      console.log('⚠️ No today summary found, returning mock data');
      return {
        date: todayStr,
        patientId: this.patientId,
        sleep: { hours: 7.5, quality: 'Good', bedtime: '22:30', wakeTime: '06:00' },
        wellnessScore: 93,
        activities: {
          sleeping: 7.5,
          sitting: 8.2,
          walking: 2.1,
          standing: 6.2
        }
      };
    } catch (error) {
      console.error('❌ Error fetching today summary:', error);
      return null;
    }
  }

  // Get activity breakdown for today
  async getActivityBreakdown() {
    try {
      const todaySummary = await this.getTodaySummary();
      if (todaySummary && todaySummary.activities) {
        return todaySummary.activities;
      }
      return null;
    } catch (error) {
      console.error('Error fetching activity breakdown:', error);
      return null;
    }
  }

  // Get sleep analysis for the past week
  async getSleepAnalysis() {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);
      
      console.log('😴 Fetching sleep data from', startDate.toISOString().split('T')[0], 'to', endDate.toISOString().split('T')[0]);

      const sleepQuery = query(
        collection(db, 'dailySummaries'),
        where('patientId', '==', this.patientId),
        where('date', '>=', startDate.toISOString().split('T')[0]),
        where('date', '<=', endDate.toISOString().split('T')[0]),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(sleepQuery);
      console.log('😴 Sleep records found:', querySnapshot.size);
      
      const sleepData = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.sleep) {
          sleepData.push({
            date: data.date,
            sleepHours: data.sleep.hours || 0,
            sleepQuality: data.sleep.quality || 'Unknown',
            bedtime: data.sleep.bedtime || null,
            wakeTime: data.sleep.wakeTime || null
          });
        }
      });

      if (sleepData.length === 0) {
        console.log('⚠️ No sleep data found, returning mock data');
        // Return mock sleep data for the past 7 days
        const mockSleepData = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          mockSleepData.push({
            date: date.toISOString().split('T')[0],
            sleepHours: 6.5 + Math.random() * 2, // 6.5-8.5 hours
            sleepQuality: ['Good', 'Fair', 'Excellent'][Math.floor(Math.random() * 3)],
            bedtime: '22:30',
            wakeTime: '06:00'
          });
        }
        return mockSleepData;
      }

      return sleepData;
    } catch (error) {
      console.error('❌ Error fetching sleep analysis:', error);
      return [];
    }
  }

  // Get fall history (only acknowledged falls)
  async getFallHistory() {
    try {
      const fallQuery = query(
        collection(db, 'alerts'),
        where('patientId', '==', this.patientId),
        where('type', '==', 'fall'),
        where('acknowledged', '==', true),
        orderBy('timestamp', 'desc'),
        limit(10)
      );

      const querySnapshot = await getDocs(fallQuery);
      const fallHistory = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fallHistory.push({
          id: doc.id,
          timestamp: data.timestamp.toDate(),
          location: data.location || data.roomId || 'Unknown',
          severity: data.severity || 'Unknown',
          response: data.response || 'No response recorded',
          acknowledgedAt: data.acknowledgedAt?.toDate() || null,
          acknowledgedBy: data.acknowledgedBy || 'Unknown'
        });
      });

      return fallHistory;
    } catch (error) {
      console.error('Error fetching fall history:', error);
      return [];
    }
  }

  // Get wellness scores for the past week
  async getWellnessScores() {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);
      
      console.log('💚 Fetching wellness scores from', startDate.toISOString().split('T')[0], 'to', endDate.toISOString().split('T')[0]);

      const wellnessQuery = query(
        collection(db, 'dailySummaries'),
        where('patientId', '==', this.patientId),
        where('date', '>=', startDate.toISOString().split('T')[0]),
        where('date', '<=', endDate.toISOString().split('T')[0]),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(wellnessQuery);
      console.log('💚 Wellness records found:', querySnapshot.size);
      
      const wellnessData = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.wellnessScore !== undefined) {
          wellnessData.push({
            date: data.date,
            score: data.wellnessScore,
            factors: data.wellnessFactors || {}
          });
        }
      });

      if (wellnessData.length === 0) {
        console.log('⚠️ No wellness data found, returning mock data');
        // Return mock wellness data for the past 7 days
        const mockWellnessData = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          mockWellnessData.push({
            date: date.toISOString().split('T')[0],
            score: 75 + Math.floor(Math.random() * 20), // 75-95 score
            factors: {
              sleep: 'Good',
              activity: 'Moderate',
              mood: 'Positive'
            }
          });
        }
        return mockWellnessData;
      }

      return wellnessData;
    } catch (error) {
      console.error('❌ Error fetching wellness scores:', error);
      return [];
    }
  }

  // Get comprehensive analytics data
  async getComprehensiveAnalytics() {
    try {
      const [
        currentState,
        todaySummary,
        activityBreakdown,
        sleepAnalysis,
        fallHistory,
        wellnessScores
      ] = await Promise.all([
        this.getCurrentState(),
        this.getTodaySummary(),
        this.getActivityBreakdown(),
        this.getSleepAnalysis(),
        this.getFallHistory(),
        this.getWellnessScores()
      ]);

      return {
        patientId: this.patientId,
        currentState,
        todaySummary,
        activityBreakdown,
        sleepAnalysis,
        fallHistory,
        wellnessScores,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching comprehensive analytics:', error);
      return null;
    }
  }

  // Format data for AI consumption
  formatDataForAI(analyticsData) {
    if (!analyticsData) return "No analytics data available.";

    let formattedData = `PATIENT ANALYTICS REPORT - Generated: ${analyticsData.generatedAt}\n`;
    formattedData += `Patient ID: ${analyticsData.patientId}\n\n`;

    // Current State
    if (analyticsData.currentState) {
      formattedData += `CURRENT STATE:\n`;
      formattedData += `- Activity: ${analyticsData.currentState.type}\n`;
      formattedData += `- Location: ${analyticsData.currentState.location}\n`;
      formattedData += `- Last Update: ${analyticsData.currentState.timestamp.toLocaleString()}\n\n`;
    }

    // Today's Summary
    if (analyticsData.todaySummary) {
      formattedData += `TODAY'S SUMMARY:\n`;
      if (analyticsData.todaySummary.sleep) {
        formattedData += `- Sleep: ${analyticsData.todaySummary.sleep.hours || 0} hours\n`;
      }
      if (analyticsData.todaySummary.wellnessScore !== undefined) {
        formattedData += `- Wellness Score: ${analyticsData.todaySummary.wellnessScore}/100\n`;
      }
      formattedData += `\n`;
    }

    // Activity Breakdown
    if (analyticsData.activityBreakdown) {
      formattedData += `ACTIVITY BREAKDOWN (Today):\n`;
      Object.entries(analyticsData.activityBreakdown).forEach(([activity, hours]) => {
        formattedData += `- ${activity}: ${hours} hours\n`;
      });
      formattedData += `\n`;
    }

    // Sleep Analysis
    if (analyticsData.sleepAnalysis && analyticsData.sleepAnalysis.length > 0) {
      formattedData += `SLEEP ANALYSIS (Past 7 days):\n`;
      analyticsData.sleepAnalysis.forEach(sleep => {
        formattedData += `- ${sleep.date}: ${sleep.sleepHours} hours (Quality: ${sleep.sleepQuality})\n`;
      });
      const avgSleep = analyticsData.sleepAnalysis.reduce((sum, s) => sum + s.sleepHours, 0) / analyticsData.sleepAnalysis.length;
      formattedData += `- Average: ${avgSleep.toFixed(1)} hours/night\n\n`;
    }

    // Fall History
    if (analyticsData.fallHistory && analyticsData.fallHistory.length > 0) {
      formattedData += `FALL HISTORY (Recent acknowledged falls):\n`;
      analyticsData.fallHistory.forEach(fall => {
        formattedData += `- ${fall.timestamp.toLocaleString()}: ${fall.severity} fall in ${fall.location}\n`;
      });
      formattedData += `\n`;
    } else {
      formattedData += `FALL HISTORY: No recent acknowledged falls\n\n`;
    }

    // Wellness Scores
    if (analyticsData.wellnessScores && analyticsData.wellnessScores.length > 0) {
      formattedData += `WELLNESS TRENDS (Past 7 days):\n`;
      analyticsData.wellnessScores.forEach(wellness => {
        formattedData += `- ${wellness.date}: ${wellness.score}/100\n`;
      });
      const avgWellness = analyticsData.wellnessScores.reduce((sum, w) => sum + w.score, 0) / analyticsData.wellnessScores.length;
      formattedData += `- Average: ${avgWellness.toFixed(1)}/100\n\n`;
    }

    return formattedData;
  }
}

export default new AnalyticsDataService();
