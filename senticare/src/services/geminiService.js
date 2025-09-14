import { GoogleGenerativeAI } from '@google/generative-ai';
import analyticsDataService from './analyticsDataService';

class GeminiService {
  constructor() {
    // Initialize with API key from environment variable
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!this.apiKey) {
      console.error('VITE_GEMINI_API_KEY not found in environment variables');
      return;
    }
    
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    // System prompt for patient intelligence agent
    this.systemPrompt = `You are a Patient Intelligence Agent for SentiCare, an advanced healthcare monitoring system. You are an expert AI assistant specialized in analyzing patient health data, wellness trends, and providing actionable insights for caregivers and healthcare professionals.

YOUR ROLE:
- Analyze patient health data including sleep patterns, activity levels, wellness scores, and fall incidents
- Provide clear, professional insights about patient wellbeing and health trends
- Alert caregivers to concerning patterns or improvements in patient health
- Answer questions about patient data with accuracy and clinical relevance
- Suggest care recommendations based on data analysis

PATIENT CONTEXT:
- You are monitoring John D., an elderly patient in a care facility
- The system tracks: current activity state, daily summaries, sleep analysis, activity breakdowns, fall history, and wellness scores
- Falls are only counted when acknowledged by caregivers
- Wellness scores range from 0-100, with higher scores indicating better overall health

COMMUNICATION STYLE:
- Professional but warm and empathetic
- Use clear, non-technical language when speaking to family members
- Use appropriate medical terminology when speaking to healthcare professionals
- Always prioritize patient safety and wellbeing
- Be proactive in highlighting concerning trends or positive improvements

CAPABILITIES:
- Analyze real-time patient data from SentiCare monitoring systems
- Identify patterns in sleep, activity, and wellness trends
- Provide insights on fall risk and prevention
- Generate health summaries and reports
- Answer questions about patient status and care recommendations

Remember: You have access to comprehensive patient analytics data. Always base your responses on actual data when available, and clearly state when you're providing general healthcare guidance versus specific patient insights.`;
  }

  async generateResponse(userMessage, includeAnalytics = true) {
    if (!this.model) {
      throw new Error('Gemini service not properly initialized. Please check your API key.');
    }

    try {
      let contextData = '';
      
      if (includeAnalytics) {
        // Get real analytics data from Firebase
        console.log('🔄 Fetching analytics data from Firebase...');
        const analyticsData = await analyticsDataService.getComprehensiveAnalytics();
        contextData = analyticsDataService.formatDataForAI(analyticsData);
        console.log('📊 Analytics data retrieved:', !!analyticsData);
      }

      // Construct the full prompt
      const fullPrompt = `${this.systemPrompt}

${contextData ? `CURRENT PATIENT DATA:
${contextData}` : 'No current patient data available.'}

USER QUESTION: ${userMessage}

Please provide a helpful, professional response based on the patient data and your role as a Patient Intelligence Agent.`;

      // Generate response
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
      
    } catch (error) {
      console.error('Error generating Gemini response:', error);
      
      if (error.message?.includes('API_KEY_INVALID')) {
        throw new Error('Invalid API key. Please check your Gemini API key configuration.');
      } else if (error.message?.includes('QUOTA_EXCEEDED')) {
        throw new Error('API quota exceeded. Please check your Gemini API usage limits.');
      } else {
        throw new Error('Failed to generate AI response. Please try again.');
      }
    }
  }

  // Quick response for simple queries without full analytics
  async generateQuickResponse(userMessage) {
    return this.generateResponse(userMessage, false);
  }

  // Generate a comprehensive health report
  async generateHealthReport() {
    try {
      const analyticsData = await analyticsDataService.getComprehensiveAnalytics();
      const contextData = analyticsDataService.formatDataForAI(analyticsData);

      const reportPrompt = `${this.systemPrompt}

PATIENT DATA:
${contextData}

Please generate a comprehensive health report for John D. Include:
1. Current status summary
2. Key health trends and patterns
3. Areas of concern (if any)
4. Positive developments
5. Care recommendations
6. Suggested follow-up actions

Format this as a professional healthcare report suitable for caregivers and family members.`;

      const result = await this.model.generateContent(reportPrompt);
      const response = await result.response;
      return response.text();
      
    } catch (error) {
      console.error('Error generating health report:', error);
      throw new Error('Failed to generate health report. Please try again.');
    }
  }

  // Analyze specific health trends
  async analyzeTrends(trendType = 'all') {
    try {
      const analyticsData = await analyticsDataService.getComprehensiveAnalytics();
      const contextData = analyticsDataService.formatDataForAI(analyticsData);

      const trendPrompt = `${this.systemPrompt}

PATIENT DATA:
${contextData}

Please analyze the ${trendType} trends for John D. Focus on:
- Pattern identification over time
- Significant changes or improvements
- Potential health implications
- Recommendations for care optimization

Provide specific, actionable insights based on the data trends.`;

      const result = await this.model.generateContent(trendPrompt);
      const response = await result.response;
      return response.text();
      
    } catch (error) {
      console.error('Error analyzing trends:', error);
      throw new Error('Failed to analyze trends. Please try again.');
    }
  }
}

export default new GeminiService();
