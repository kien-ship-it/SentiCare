// Simple data extractor that gets data from analytics components
class AnalyticsDataExtractor {
  
  // Extract data from DOM elements or component states
  extractCurrentAnalyticsData() {
    const analyticsData = {
      timestamp: new Date().toISOString(),
      patientId: "John D.",
    };

    try {
      // Extract current state from LatestState component - using correct selectors
      const currentStateElement = document.querySelector('.activity-text');
      if (currentStateElement) {
        analyticsData.currentState = currentStateElement.textContent.trim();
      }

      // Extract location info
      const locationElement = document.querySelector('.activity-location');
      if (locationElement) {
        analyticsData.currentLocation = locationElement.textContent.replace('📍', '').trim();
      }

      // Extract last update time
      const timestampElement = document.querySelector('.activity-timestamp');
      if (timestampElement) {
        analyticsData.lastUpdate = timestampElement.textContent.replace('Last update:', '').trim();
      }

      // Extract wellness score from WellnessIndicator component
      const wellnessScoreElements = document.querySelectorAll('.wellness-indicator-container svg + div');
      if (wellnessScoreElements.length > 0) {
        const scoreText = wellnessScoreElements[0].textContent.trim();
        analyticsData.wellnessScore = scoreText.replace('/100', '');
      }

      // Extract sleep data from SleepAnalytics component
      const sleepCardHeader = document.querySelector('.analytics-card h3');
      if (sleepCardHeader && sleepCardHeader.textContent.includes('Sleep')) {
        const sleepCard = sleepCardHeader.closest('.analytics-card');
        const sleepBars = sleepCard?.querySelectorAll('.recharts-bar-rectangle');
        if (sleepBars && sleepBars.length > 0) {
          analyticsData.sleepData = `Sleep analysis shows ${sleepBars.length} days of data with visual bar chart`;
        }
      }

      // Extract activity breakdown from ActivityBreakdown component
      const activityCardHeader = document.querySelector('h3');
      if (activityCardHeader && activityCardHeader.textContent.includes('Activity Breakdown')) {
        const activityCard = activityCardHeader.closest('.analytics-card');
        const pieSlices = activityCard?.querySelectorAll('.recharts-pie-sector');
        if (pieSlices && pieSlices.length > 0) {
          analyticsData.activityBreakdown = `Activity breakdown shows ${pieSlices.length} different activity categories in pie chart`;
        }
      }

      // Extract fall warnings from FallWarnings component - using correct selectors
      const fallElements = document.querySelectorAll('.alert-log-item');
      if (fallElements.length > 0) {
        const fallData = [];
        fallElements.forEach((element) => {
          const alertType = element.querySelector('.alert-type')?.textContent || '';
          const alertTime = element.querySelector('.alert-time')?.textContent || '';
          const alertLocation = element.querySelector('.alert-location')?.textContent || '';
          const alertStatus = element.querySelector('.status-acknowledged, .status-pending')?.textContent || '';
          
          if (alertType && alertTime) {
            fallData.push(`${alertTime}: ${alertType} - ${alertLocation} - ${alertStatus}`);
          }
        });
        analyticsData.fallHistory = fallData.length > 0 ? fallData : ['No recent fall alerts'];
      } else {
        analyticsData.fallHistory = ['No fall alerts displayed'];
      }

      // Extract wellness trend data from WellnessScore component
      const wellnessTrendCard = document.querySelector('.analytics-card');
      if (wellnessTrendCard) {
        const trendDots = wellnessTrendCard.querySelectorAll('.recharts-line-dot');
        if (trendDots.length > 0) {
          analyticsData.wellnessTrend = `Wellness trend chart shows ${trendDots.length} data points over time`;
        }
      }

      // Get today's summary info from QuickAnalytics
      const metricElements = document.querySelectorAll('.metric-value');
      if (metricElements.length > 0) {
        const summaryData = [];
        metricElements.forEach(element => {
          const value = element.textContent.trim();
          const label = element.parentElement?.querySelector('.metric-label')?.textContent || '';
          if (value && label) {
            summaryData.push(`${label}: ${value}`);
          }
        });
        analyticsData.todaySummary = summaryData;
      }

      // Extract patient header info
      const patientNameElement = document.querySelector('.patient-name');
      if (patientNameElement) {
        analyticsData.patientName = patientNameElement.textContent.trim();
      }

    } catch (error) {
      console.error('Error extracting analytics data:', error);
      analyticsData.error = 'Failed to extract some analytics data from the page';
    }

    return analyticsData;
  }

  // Format extracted data for AI consumption
  formatDataForAI(extractedData) {
    if (!extractedData) return "No analytics data available.";

    let formattedData = `PATIENT ANALYTICS REPORT - Generated: ${extractedData.timestamp}\n`;
    formattedData += `Patient: ${extractedData.patientId}\n\n`;

    if (extractedData.currentState) {
      formattedData += `CURRENT STATUS:\n`;
      formattedData += `- Activity: ${extractedData.currentState}\n`;
      if (extractedData.currentLocation) {
        formattedData += `- Location: ${extractedData.currentLocation}\n`;
      }
      if (extractedData.lastUpdate) {
        formattedData += `- Last Update: ${extractedData.lastUpdate}\n`;
      }
      formattedData += `\n`;
    }

    if (extractedData.wellnessScore || extractedData.wellnessStatus) {
      formattedData += `WELLNESS STATUS:\n`;
      if (extractedData.wellnessScore) {
        formattedData += `- Score: ${extractedData.wellnessScore}\n`;
      }
      if (extractedData.wellnessStatus) {
        formattedData += `- Status: ${extractedData.wellnessStatus}\n`;
      }
      formattedData += `\n`;
    }

    if (extractedData.todaySummary && extractedData.todaySummary.length > 0) {
      formattedData += `TODAY'S SUMMARY:\n`;
      extractedData.todaySummary.forEach(item => {
        formattedData += `- ${item}\n`;
      });
      formattedData += `\n`;
    }

    if (extractedData.sleepData) {
      formattedData += `SLEEP ANALYSIS:\n`;
      formattedData += `- ${extractedData.sleepData}\n\n`;
    }

    if (extractedData.activityBreakdown) {
      formattedData += `ACTIVITY BREAKDOWN:\n`;
      formattedData += `- ${extractedData.activityBreakdown}\n\n`;
    }

    if (extractedData.fallHistory && extractedData.fallHistory.length > 0) {
      formattedData += `FALL HISTORY:\n`;
      extractedData.fallHistory.forEach(fall => {
        formattedData += `- ${fall}\n`;
      });
      formattedData += `\n`;
    }

    if (extractedData.wellnessTrend) {
      formattedData += `WELLNESS TRENDS:\n`;
      formattedData += `- ${extractedData.wellnessTrend}\n\n`;
    }

    if (extractedData.error) {
      formattedData += `NOTE: ${extractedData.error}\n`;
    }

    return formattedData;
  }

  // Get comprehensive analytics data from current page
  getAnalyticsForAI() {
    console.log('🔍 Starting analytics data extraction...');
    console.log('Current URL:', window.location.pathname);
    console.log('Available DOM elements:', {
      activityText: !!document.querySelector('.activity-text'),
      analyticsCards: document.querySelectorAll('.analytics-card').length,
      alertLogItems: document.querySelectorAll('.alert-log-item').length,
      metricValues: document.querySelectorAll('.metric-value').length
    });
    
    const extractedData = this.extractCurrentAnalyticsData();
    
    // Debug logging to see what data is extracted
    console.log('📊 Extracted Analytics Data:', extractedData);
    
    const formattedData = this.formatDataForAI(extractedData);
    console.log('🤖 Formatted Data for AI:', formattedData);
    
    return formattedData;
  }
}

export default new AnalyticsDataExtractor();
