// User Preference Tracking System for MeAI
class UserPreferenceTrackingSystem {
  constructor() {
    this.voiceService = window.voiceNarrationService || (window.EnhancedVoiceNarrationService && new window.EnhancedVoiceNarrationService());
    this.contextSystem = window.contextSystem;
    
    // User preferences storage
    this.preferences = {
      // Communication preferences
      communication: {
        preferVoice: false,
        voiceVolume: 0.8,
        voiceRate: 1.0,
        voicePitch: 1.0,
        preferredVoice: null,
        notificationLevel: 'medium', // low, medium, high
        responseLength: 'medium', // brief, medium, detailed
      },
      
      // Visual preferences
      visual: {
        theme: 'light', // light, dark, system
        colorScheme: 'default', // default, calm, vibrant, focus
        fontSize: 'medium', // small, medium, large
        reduceMotion: false,
        highContrast: false,
      },
      
      // Interaction preferences
      interaction: {
        proactiveAssistance: true,
        meetingReminders: true,
        journalPrompts: true,
        focusExercises: true,
        breathReminders: false,
        ritualSuggestions: true,
        preferredRituals: [],
        preferredExercises: [],
      },
      
      // Privacy preferences
      privacy: {
        dataRetention: 90, // days
        shareAnalytics: false,
        recordConversations: true,
        locationAwareness: false,
        contactIntegration: false,
      },
      
      // Content preferences
      content: {
        topics: {
          work: true,
          personal: true,
          health: true,
          relationships: true,
          creativity: true,
          learning: true,
        },
        contentTone: 'friendly', // friendly, professional, casual, supportive
        humorLevel: 'medium', // none, light, medium, high
      },
      
      // Usage patterns
      usage: {
        preferredTimes: [],
        sessionCount: 0,
        totalUsageTime: 0,
        lastSession: null,
        frequentFeatures: {},
        completedRituals: [],
        journalEntries: 0,
      }
    };
    
    // Preference learning
    this.learningData = {
      interactionHistory: [],
      featureUsage: {},
      implicitPreferences: {},
      explicitPreferences: {},
    };
    
    // Initialize
    this.init();
  }
  
  // Initialize the system
  init() {
    // Load preferences
    this.loadPreferences();
    
    // Set up event listeners
    document.addEventListener('meai-feature-used', this.handleFeatureUsed.bind(this));
    document.addEventListener('meai-preference-set', this.handlePreferenceSet.bind(this));
    document.addEventListener('meai-session-start', this.handleSessionStart.bind(this));
    document.addEventListener('meai-session-end', this.handleSessionEnd.bind(this));
    
    // Start session
    this.startSession();
    
    // Set up periodic save
    setInterval(() => this.savePreferences(), 60000); // Save every minute
  }
  
  // Load preferences from storage
  loadPreferences() {
    const savedPreferences = localStorage.getItem('meai-user-preferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        this.preferences = this.mergeObjects(this.preferences, parsed);
      } catch (e) {
        console.error('Error loading preferences:', e);
      }
    }
    
    const savedLearningData = localStorage.getItem('meai-learning-data');
    if (savedLearningData) {
      try {
        this.learningData = JSON.parse(savedLearningData);
      } catch (e) {
        console.error('Error loading learning data:', e);
      }
    }
  }
  
  // Save preferences to storage
  savePreferences() {
    localStorage.setItem('meai-user-preferences', JSON.stringify(this.preferences));
    localStorage.setItem('meai-learning-data', JSON.stringify(this.learningData));
  }
  
  // Merge objects (deep)
  mergeObjects(target, source) {
    const output = { ...target };
    
    for (const key in source) {
      if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
        output[key] = this.mergeObjects(target[key], source[key]);
      } else {
        output[key] = source[key];
      }
    }
    
    return output;
  }
  
  // Get all preferences
  getAllPreferences() {
    return { ...this.preferences };
  }
  
  // Get specific preference category
  getPreferenceCategory(category) {
    return category in this.preferences ? { ...this.preferences[category] } : null;
  }
  
  // Get specific preference
  getPreference(category, key) {
    if (category in this.preferences && key in this.preferences[category]) {
      return this.preferences[category][key];
    }
    return null;
  }
  
  // Set preference
  setPreference(category, key, value) {
    if (category in this.preferences && key in this.preferences[category]) {
      // Record explicit preference
      this.recordExplicitPreference(category, key, value);
      
      // Update preference
      this.preferences[category][key] = value;
      
      // Save preferences
      this.savePreferences();
      
      // Dispatch event
      document.dispatchEvent(new CustomEvent('meai-preference-updated', {
        detail: {
          category,
          key,
          value
        }
      }));
      
      return true;
    }
    
    return false;
  }
  
  // Set multiple preferences
  setPreferences(preferencesObj) {
    let updated = false;
    
    for (const category in preferencesObj) {
      if (category in this.preferences) {
        for (const key in preferencesObj[category]) {
          if (key in this.preferences[category]) {
            // Record explicit preference
            this.recordExplicitPreference(category, key, preferencesObj[category][key]);
            
            // Update preference
            this.preferences[category][key] = preferencesObj[category][key];
            updated = true;
          }
        }
      }
    }
    
    if (updated) {
      // Save preferences
      this.savePreferences();
      
      // Dispatch event
      document.dispatchEvent(new CustomEvent('meai-preferences-updated', {
        detail: {
          preferences: this.getAllPreferences()
        }
      }));
    }
    
    return updated;
  }
  
  // Reset preferences to defaults
  resetPreferences() {
    // Create a new instance to get default preferences
    const defaultInstance = new UserPreferenceTrackingSystem();
    this.preferences = { ...defaultInstance.preferences };
    
    // Clear learning data
    this.learningData = {
      interactionHistory: [],
      featureUsage: {},
      implicitPreferences: {},
      explicitPreferences: {},
    };
    
    // Save preferences
    this.savePreferences();
    
    // Dispatch event
    document.dispatchEvent(new CustomEvent('meai-preferences-reset', {
      detail: {
        preferences: this.getAllPreferences()
      }
    }));
    
    return true;
  }
  
  // Start a new session
  startSession() {
    const now = new Date();
    
    // Update session data
    this.preferences.usage.sessionCount++;
    this.preferences.usage.lastSession = now.toISOString();
    
    // Record session start
    this.learningData.interactionHistory.push({
      type: 'session_start',
      timestamp: now.toISOString()
    });
    
    // Limit history size
    if (this.learningData.interactionHistory.length > 1000) {
      this.learningData.interactionHistory = this.learningData.interactionHistory.slice(-1000);
    }
    
    // Save preferences
    this.savePreferences();
    
    // Dispatch event
    document.dispatchEvent(new CustomEvent('meai-session-started', {
      detail: {
        timestamp: now.toISOString(),
        sessionCount: this.preferences.usage.sessionCount
      }
    }));
  }
  
  // End the current session
  endSession() {
    const now = new Date();
    const lastSession = new Date(this.preferences.usage.lastSession);
    const sessionDuration = (now - lastSession) / 1000; // in seconds
    
    // Update usage time
    this.preferences.usage.totalUsageTime += sessionDuration;
    
    // Record session end
    this.learningData.interactionHistory.push({
      type: 'session_end',
      timestamp: now.toISOString(),
      duration: sessionDuration
    });
    
    // Save preferences
    this.savePreferences();
    
    // Dispatch event
    document.dispatchEvent(new CustomEvent('meai-session-ended', {
      detail: {
        timestamp: now.toISOString(),
        duration: sessionDuration,
        totalUsageTime: this.preferences.usage.totalUsageTime
      }
    }));
  }
  
  // Record feature usage
  recordFeatureUsage(feature, subfeature = null, metadata = {}) {
    const now = new Date();
    
    // Create feature key
    const featureKey = subfeature ? `${feature}.${subfeature}` : feature;
    
    // Initialize feature usage if not exists
    if (!this.learningData.featureUsage[featureKey]) {
      this.learningData.featureUsage[featureKey] = {
        count: 0,
        firstUsed: now.toISOString(),
        lastUsed: null,
        metadata: {}
      };
    }
    
    // Update feature usage
    this.learningData.featureUsage[featureKey].count++;
    this.learningData.featureUsage[featureKey].lastUsed = now.toISOString();
    
    // Merge metadata
    this.learningData.featureUsage[featureKey].metadata = {
      ...this.learningData.featureUsage[featureKey].metadata,
      ...metadata
    };
    
    // Update frequent features in preferences
    if (!this.preferences.usage.frequentFeatures[featureKey]) {
      this.preferences.usage.frequentFeatures[featureKey] = 0;
    }
    this.preferences.usage.frequentFeatures[featureKey]++;
    
    // Record interaction
    this.learningData.interactionHistory.push({
      type: 'feature_used',
      feature: featureKey,
      timestamp: now.toISOString(),
      metadata
    });
    
    // Learn from feature usage
    this.learnFromFeatureUsage(feature, subfeature, metadata);
    
    // Save preferences
    this.savePreferences();
  }
  
  // Record explicit preference
  recordExplicitPreference(category, key, value) {
    const now = new Date();
    
    // Create preference key
    const preferenceKey = `${category}.${key}`;
    
    // Initialize explicit preference if not exists
    if (!this.learningData.explicitPreferences[preferenceKey]) {
      this.learningData.explicitPreferences[preferenceKey] = {
        history: [],
        firstSet: now.toISOString(),
        lastSet: null
      };
    }
    
    // Update explicit preference
    this.learningData.explicitPreferences[preferenceKey].history.push({
      value,
      timestamp: now.toISOString()
    });
    
    // Limit history size
    if (this.learningData.explicitPreferences[preferenceKey].history.length > 10) {
      this.learningData.explicitPreferences[preferenceKey].history = 
        this.learningData.explicitPreferences[preferenceKey].history.slice(-10);
    }
    
    this.learningData.explicitPreferences[preferenceKey].lastSet = now.toISOString();
    
    // Record interaction
    this.learningData.interactionHistory.push({
      type: 'preference_set',
      preference: preferenceKey,
      value,
      timestamp: now.toISOString()
    });
  }
  
  // Record implicit preference
  recordImplicitPreference(category, key, value, confidence = 0.5) {
    const now = new Date();
    
    // Create preference key
    const preferenceKey = `${category}.${key}`;
    
    // Initialize implicit preference if not exists
    if (!this.learningData.implicitPreferences[preferenceKey]) {
      this.learningData.implicitPreferences[preferenceKey] = {
        observations: [],
        firstObserved: now.toISOString(),
        lastObserved: null,
        inferredValue: null,
        confidence: 0
      };
    }
    
    // Update implicit preference
    this.learningData.implicitPreferences[preferenceKey].observations.push({
      value,
      confidence,
      timestamp: now.toISOString()
    });
    
    // Limit observations size
    if (this.learningData.implicitPreferences[preferenceKey].observations.length > 20) {
      this.learningData.implicitPreferences[preferenceKey].observations = 
        this.learningData.implicitPreferences[preferenceKey].observations.slice(-20);
    }
    
    this.learningData.implicitPreferences[preferenceKey].lastObserved = now.toISOString();
    
    // Calculate inferred value and confidence
    this.updateInferredPreference(preferenceKey);
    
    // Apply implicit preference if confidence is high enough
    if (this.learningData.implicitPreferences[preferenceKey].confidence > 0.7) {
      // Check if there's an explicit preference that overrides this
      const hasExplicitPreference = 
        this.learningData.explicitPreferences[preferenceKey] && 
        this.learningData.explicitPreferences[preferenceKey].lastSet &&
        new Date(this.learningData.explicitPreferences[preferenceKey].lastSet) > 
        new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Within last week
      
      if (!hasExplicitPreference) {
        // Apply the inferred preference
        this.preferences[category][key] = this.learningData.implicitPreferences[preferenceKey].inferredValue;
        
        // Save preferences
        this.savePreferences();
      }
    }
  }
  
  // Update inferred preference
  updateInferredPreference(preferenceKey) {
    const observations = this.learningData.implicitPreferences[preferenceKey].observations;
    
    if (observations.length === 0) {
      return;
    }
    
    // For boolean preferences
    if (typeof observations[0].value === 'boolean') {
      let trueCount = 0;
      let totalConfidence = 0;
      
      observations.forEach(obs => {
        if (obs.value === true) {
          trueCount += obs.confidence;
        }
        totalConfidence += obs.confidence;
      });
      
      const trueRatio = trueCount / totalConfidence;
      const inferredValue = trueRatio > 0.5;
      const confidence = Math.abs(trueRatio - 0.5) * 2; // Scale to 0-1
      
      this.learningData.implicitPreferences[preferenceKey].inferredValue = inferredValue;
      this.learningData.implicitPreferences[preferenceKey].confidence = confidence;
    }
    // For string preferences
    else if (typeof observations[0].value === 'string') {
      const valueCounts = {};
      let totalConfidence = 0;
      
      observations.forEach(obs => {
        if (!valueCounts[obs.value]) {
          valueCounts[obs.value] = 0;
        }
        valueCounts[obs.value] += obs.confidence;
        totalConfidence += obs.confidence;
      });
      
      let maxValue = null;
      let maxCount = 0;
      
      for (const value in valueCounts) {
        if (valueCounts[value] > maxCount) {
          maxValue = value;
          maxCount = valueCounts[value];
        }
      }
      
      const valueRatio = maxCount / totalConfidence;
      
      this.learningData.implicitPreferences[preferenceKey].inferredValue = maxValue;
      this.learningData.implicitPreferences[preferenceKey].confidence = valueRatio;
    }
    // For numeric preferences
    else if (typeof observations[0].value === 'number') {
      let weightedSum = 0;
      let totalConfidence = 0;
      
      observations.forEach(obs => {
        weightedSum += obs.value * obs.confidence;
        totalConfidence += obs.confidence;
      });
      
      const weightedAverage = weightedSum / totalConfidence;
      
      // Calculate standard deviation to determine confidence
      let variance = 0;
      observations.forEach(obs => {
        variance += Math.pow(obs.value - weightedAverage, 2) * obs.confidence;
      });
      variance /= totalConfidence;
      
      const stdDev = Math.sqrt(variance);
      const normalizedStdDev = Math.min(stdDev / weightedAverage, 1);
      const confidence = 1 - normalizedStdDev;
      
      this.learningData.implicitPreferences[preferenceKey].inferredValue = weightedAverage;
      this.learningData.implicitPreferences[preferenceKey].confidence = confidence;
    }
  }
  
  // Learn from feature usage
  learnFromFeatureUsage(feature, subfeature, metadata) {
    // Learn communication preferences
    if (feature === 'voice') {
      if (subfeature === 'enabled') {
        this.recordImplicitPreference('communication', 'preferVoice', true, 0.6);
      } else if (subfeature === 'disabled') {
        this.recordImplicitPreference('communication', 'preferVoice', false, 0.6);
      } else if (subfeature === 'volume_adjusted' && metadata.volume) {
        this.recordImplicitPreference('communication', 'voiceVolume', metadata.volume, 0.7);
      } else if (subfeature === 'rate_adjusted' && metadata.rate) {
        this.recordImplicitPreference('communication', 'voiceRate', metadata.rate, 0.7);
      } else if (subfeature === 'voice_selected' && metadata.voice) {
        this.recordImplicitPreference('communication', 'preferredVoice', metadata.voice, 0.8);
      }
    }
    
    // Learn interaction preferences
    if (feature === 'proactive_assistance' && metadata.response) {
      if (metadata.response === 'positive') {
        this.recordImplicitPreference('interaction', 'proactiveAssistance', true, 0.6);
      } else if (metadata.response === 'negative') {
        this.recordImplicitPreference('interaction', 'proactiveAssistance', false, 0.6);
      }
    }
    
    if (feature === 'meeting_reminder' && metadata.response) {
      if (metadata.response === 'positive') {
        this.recordImplicitPreference('interaction', 'meetingReminders', true, 0.6);
      } else if (metadata.response === 'negative') {
        this.recordImplicitPreference('interaction', 'meetingReminders', false, 0.6);
      }
    }
    
    if (feature === 'journal_prompt' && metadata.response) {
      if (metadata.response === 'positive') {
        this.recordImplicitPreference('interaction', 'journalPrompts', true, 0.6);
      } else if (metadata.response === 'negative') {
        this.recordImplicitPreference('interaction', 'journalPrompts', false, 0.6);
      }
    }
    
    if (feature === 'focus_exercise') {
      if (subfeature && metadata.completed) {
        // Add to preferred exercises if completed successfully
        const preferredExercises = [...this.preferences.interaction.preferredExercises];
        if (!preferredExercises.includes(subfeature)) {
          preferredExercises.push(subfeature);
          this.setPreference('interaction', 'preferredExercises', preferredExercises);
        }
        
        this.recordImplicitPreference('interaction', 'focusExercises', true, 0.7);
      } else if (metadata.skipped) {
        this.recordImplicitPreference('interaction', 'focusExercises', false, 0.4);
      }
    }
    
    if (feature === 'ritual') {
      if (subfeature && metadata.completed) {
        // Add to preferred rituals if completed successfully
        const preferredRituals = [...this.preferences.interaction.preferredRituals];
        if (!preferredRituals.includes(subfeature)) {
          preferredRituals.push(subfeature);
          this.setPreference('interaction', 'preferredRituals', preferredRituals);
        }
        
        this.recordImplicitPreference('interaction', 'ritualSuggestions', true, 0.7);
      } else if (metadata.skipped) {
        this.recordImplicitPreference('interaction', 'ritualSuggestions', false, 0.4);
      }
    }
    
    // Learn visual preferences
    if (feature === 'theme' && subfeature) {
      this.recordImplicitPreference('visual', 'theme', subfeature, 0.8);
    }
    
    if (feature === 'color_scheme' && subfeature) {
      this.recordImplicitPreference('visual', 'colorScheme', subfeature, 0.8);
    }
    
    if (feature === 'font_size' && subfeature) {
      this.recordImplicitPreference('visual', 'fontSize', subfeature, 0.8);
    }
    
    // Learn content preferences
    if (feature === 'journal' && subfeature === 'entry' && metadata.topics) {
      metadata.topics.forEach(topic => {
        if (topic in this.preferences.content.topics) {
          this.recordImplicitPreference('content', 'topics', { [topic]: true }, 0.5);
        }
      });
      
      // Increment journal entries count
      this.preferences.usage.journalEntries++;
    }
    
    if (feature === 'response' && metadata.tone) {
      this.recordImplicitPreference('content', 'contentTone', metadata.tone, 0.4);
    }
    
    if (feature === 'response' && metadata.length) {
      this.recordImplicitPreference('communication', 'responseLength', metadata.length, 0.4);
    }
    
    // Learn usage patterns
    if (feature === 'session_start') {
      const hour = new Date().getHours();
      const timeBlock = Math.floor(hour / 4); // 0-5 (0-3, 4-7, 8-11, 12-15, 16-19, 20-23)
      
      const preferredTimes = [...this.preferences.usage.preferredTimes];
      if (!preferredTimes.includes(timeBlock)) {
        preferredTimes.push(timeBlock);
        this.setPreference('usage', 'preferredTimes', preferredTimes);
      }
    }
  }
  
  // Get most frequent features
  getMostFrequentFeatures(limit = 5) {
    return Object.entries(this.preferences.usage.frequentFeatures)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([feature, count]) => ({ feature, count }));
  }
  
  // Get user activity summary
  getUserActivitySummary() {
    return {
      sessionCount: this.preferences.usage.sessionCount,
      totalUsageTime: this.preferences.usage.totalUsageTime,
      lastSession: this.preferences.usage.lastSession,
      journalEntries: this.preferences.usage.journalEntries,
      completedRituals: this.preferences.usage.completedRituals.length,
      frequentFeatures: this.getMostFrequentFeatures(3)
    };
  }
  
  // Get preference insights
  getPreferenceInsights() {
    const insights = [];
    
    // Communication insights
    if (this.preferences.communication.preferVoice) {
      insights.push({
        category: 'communication',
        insight: 'You prefer voice interactions over text-only communication.'
      });
    } else {
      insights.push({
        category: 'communication',
        insight: 'You prefer text-based interactions over voice communication.'
      });
    }
    
    // Interaction insights
    if (this.preferences.interaction.proactiveAssistance) {
      insights.push({
        category: 'interaction',
        insight: 'You appreciate proactive assistance and reminders.'
      });
    } else {
      insights.push({
        category: 'interaction',
        insight: 'You prefer to initiate interactions yourself rather than receiving proactive assistance.'
      });
    }
    
    // Content insights
    const activeTopics = Object.entries(this.preferences.content.topics)
      .filter(([_, active]) => active)
      .map(([topic]) => topic);
    
    if (activeTopics.length > 0) {
      insights.push({
        category: 'content',
        insight: `You're most interested in discussing: ${activeTopics.join(', ')}.`
      });
    }
    
    // Usage insights
    if (this.preferences.usage.preferredTimes.length > 0) {
      const timeBlocks = {
        0: 'early morning (12am-3am)',
        1: 'morning (4am-7am)',
        2: 'mid-morning (8am-11am)',
        3: 'afternoon (12pm-3pm)',
        4: 'evening (4pm-7pm)',
        5: 'night (8pm-11pm)'
      };
      
      const preferredTimeBlocks = this.preferences.usage.preferredTimes
        .map(block => timeBlocks[block])
        .join(', ');
      
      insights.push({
        category: 'usage',
        insight: `You typically use MeAI during ${preferredTimeBlocks}.`
      });
    }
    
    return insights;
  }
  
  // Display preferences UI
  displayPreferencesUI() {
    // Create preferences element if it doesn't exist
    let preferencesElement = document.getElementById('user-preferences');
    
    if (!preferencesElement) {
      preferencesElement = document.createElement('div');
      preferencesElement.id = 'user-preferences';
      preferencesElement.className = 'user-preferences';
      
      // Add to body
      document.body.appendChild(preferencesElement);
      
      // Add styles if not already present
      if (!document.getElementById('user-preferences-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'user-preferences-styles';
        styleElement.textContent = `
          .user-preferences {
            position: fixed;
            top: 0;
            right: 0;
            width: 350px;
            height: 100%;
            background-color: #ffffff;
            box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            overflow-y: auto;
            transform: translateX(100%);
            transition: transform 0.3s ease;
          }
          .user-preferences.visible {
            transform: translateX(0);
          }
          .user-preferences-header {
            padding: 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .user-preferences-title {
            font-size: 18px;
            font-weight: 600;
          }
          .user-preferences-close {
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: #666;
          }
          .user-preferences-tabs {
            display: flex;
            border-bottom: 1px solid #eee;
          }
          .user-preferences-tab {
            padding: 12px 16px;
            cursor: pointer;
            border-bottom: 2px solid transparent;
          }
          .user-preferences-tab.active {
            border-bottom-color: #6c5ce7;
            color: #6c5ce7;
          }
          .user-preferences-content {
            padding: 20px;
          }
          .user-preferences-section {
            margin-bottom: 24px;
          }
          .user-preferences-section-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 12px;
          }
          .user-preferences-option {
            margin-bottom: 16px;
          }
          .user-preferences-option-label {
            display: block;
            margin-bottom: 6px;
            font-size: 14px;
          }
          .user-preferences-toggle {
            position: relative;
            display: inline-block;
            width: 44px;
            height: 24px;
          }
          .user-preferences-toggle input {
            opacity: 0;
            width: 0;
            height: 0;
          }
          .user-preferences-toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 24px;
          }
          .user-preferences-toggle-slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
          }
          .user-preferences-toggle input:checked + .user-preferences-toggle-slider {
            background-color: #6c5ce7;
          }
          .user-preferences-toggle input:checked + .user-preferences-toggle-slider:before {
            transform: translateX(20px);
          }
          .user-preferences-select {
            width: 100%;
            padding: 8px;
            border-radius: 4px;
            border: 1px solid #ddd;
          }
          .user-preferences-range {
            width: 100%;
          }
          .user-preferences-actions {
            padding: 20px;
            border-top: 1px solid #eee;
            display: flex;
            justify-content: flex-end;
            gap: 12px;
          }
          .user-preferences-button {
            padding: 8px 16px;
            border-radius: 4px;
            border: none;
            cursor: pointer;
            font-size: 14px;
          }
          .user-preferences-button.primary {
            background-color: #6c5ce7;
            color: white;
          }
          .user-preferences-button.secondary {
            background-color: #f5f5f5;
            color: #333;
          }
          .user-preferences-button.danger {
            background-color: #e74c3c;
            color: white;
          }
        `;
        document.head.appendChild(styleElement);
      }
    }
    
    // Create preferences content
    preferencesElement.innerHTML = `
      <div class="user-preferences-header">
        <div class="user-preferences-title">Preferences</div>
        <button class="user-preferences-close">&times;</button>
      </div>
      <div class="user-preferences-tabs">
        <div class="user-preferences-tab active" data-tab="communication">Communication</div>
        <div class="user-preferences-tab" data-tab="visual">Visual</div>
        <div class="user-preferences-tab" data-tab="interaction">Interaction</div>
        <div class="user-preferences-tab" data-tab="privacy">Privacy</div>
      </div>
      <div class="user-preferences-content">
        <!-- Communication Tab -->
        <div class="user-preferences-tab-content" data-tab="communication">
          <div class="user-preferences-section">
            <div class="user-preferences-section-title">Voice Settings</div>
            <div class="user-preferences-option">
              <label class="user-preferences-option-label">Enable Voice</label>
              <label class="user-preferences-toggle">
                <input type="checkbox" data-preference="communication.preferVoice" ${this.preferences.communication.preferVoice ? 'checked' : ''}>
                <span class="user-preferences-toggle-slider"></span>
              </label>
            </div>
            <div class="user-preferences-option">
              <label class="user-preferences-option-label">Voice Volume: ${this.preferences.communication.voiceVolume}</label>
              <input type="range" class="user-preferences-range" data-preference="communication.voiceVolume" min="0" max="1" step="0.1" value="${this.preferences.communication.voiceVolume}">
            </div>
            <div class="user-preferences-option">
              <label class="user-preferences-option-label">Voice Rate: ${this.preferences.communication.voiceRate}</label>
              <input type="range" class="user-preferences-range" data-preference="communication.voiceRate" min="0.5" max="2" step="0.1" value="${this.preferences.communication.voiceRate}">
            </div>
            <div class="user-preferences-option">
              <label class="user-preferences-option-label">Voice Pitch: ${this.preferences.communication.voicePitch}</label>
              <input type="range" class="user-preferences-range" data-preference="communication.voicePitch" min="0.5" max="2" step="0.1" value="${this.preferences.communication.voicePitch}">
            </div>
          </div>
          <div class="user-preferences-section">
            <div class="user-preferences-section-title">Notification Settings</div>
            <div class="user-preferences-option">
              <label class="user-preferences-option-label">Notification Level</label>
              <select class="user-preferences-select" data-preference="communication.notificationLevel">
                <option value="low" ${this.preferences.communication.notificationLevel === 'low' ? 'selected' : ''}>Low - Essential notifications only</option>
                <option value="medium" ${this.preferences.communication.notificationLevel === 'medium' ? 'selected' : ''}>Medium - Important notifications</option>
                <option value="high" ${this.preferences.communication.notificationLevel === 'high' ? 'selected' : ''}>High - All notifications</option>
              </select>
            </div>
            <div class="user-preferences-option">
              <label class="user-preferences-option-label">Response Length</label>
              <select class="user-preferences-select" data-preference="communication.responseLength">
                <option value="brief" ${this.preferences.communication.responseLength === 'brief' ? 'selected' : ''}>Brief - Concise responses</option>
                <option value="medium" ${this.preferences.communication.responseLength === 'medium' ? 'selected' : ''}>Medium - Balanced responses</option>
                <option value="detailed" ${this.preferences.communication.responseLength === 'detailed' ? 'selected' : ''}>Detailed - Comprehensive responses</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Visual Tab -->
        <div class="user-preferences-tab-content" data-tab="visual" style="display: none;">
          <div class="user-preferences-section">
            <div class="user-preferences-section-title">Theme Settings</div>
            <div class="user-preferences-option">
              <label class="user-preferences-option-label">Theme</label>
              <select class="user-preferences-select" data-preference="visual.theme">
                <option value="light" ${this.preferences.visual.theme === 'light' ? 'selected' : ''}>Light</option>
                <option value="dark" ${this.preferences.visual.theme === 'dark' ? 'selected' : ''}>Dark</option>
                <option value="system" ${this.preferences.visual.theme === 'system' ? 'selected' : ''}>System Default</option>
              </select>
            </div>
            <div class="user-preferences-option">
              <label class="user-preferences-option-label">Color Scheme</label>
              <select class="user-preferences-select" data-preference="visual.colorScheme">
                <option value="default" ${this.preferences.visual.colorScheme === 'default' ? 'selected' : ''}>Default</option>
                <option value="calm" ${this.preferences.visual.colorScheme === 'calm' ? 'selected' : ''}>Calm</option>
                <option value="vibrant" ${this.preferences.visual.colorScheme === 'vibrant' ? 'selected' : ''}>Vibrant</option>
                <option value="focus" ${this.preferences.visual.colorScheme === 'focus' ? 'selected' : ''}>Focus</option>
              </select>
            </div>
            <div class="user-preferences-option">
              <label class="user-preferences-option-label">Font Size</label>
              <select class="user-preferences-select" data-preference="visual.fontSize">
                <option value="small" ${this.preferences.visual.fontSize === 'small' ? 'selected' : ''}>Small</option>
                <option value="medium" ${this.preferences.visual.fontSize === 'medium' ? 'selected' : ''}>Medium</option>
                <option value="large" ${this.preferences.visual.fontSize === 'large' ? 'selected' : ''}>Large</option>
              </select>
            </div>
          </div>
          <div class="user-preferences-section">
            <div class="user-preferences-section-title">Accessibility</div>
            <div class="user-preferences-option">
              <label class="user-preferences-option-label">Reduce Motion</label>
              <label class="user-preferences-toggle">
                <input type="checkbox" data-preference="visual.reduceMotion" ${this.preferences.visual.reduceMotion ? 'checked' : ''}>
                <span class="user-preferences-toggle-slider"></span>
              </label>
            </div>
            <div class="user-preferences-option">
              <label class="user-preferences-option-label">High Contrast</label>
              <label class="user-preferences-toggle">
                <input type="checkbox" data-preference="visual.highContrast" ${this.preferences.visual.highContrast ? 'checked' : ''}>
                <span class="user-preferences-toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
        
        <!-- Interaction Tab -->
        <div class="user-preferences-tab-content" data-tab="interaction" style="display: none;">
          <div class="user-preferences-section">
            <div class="user-preferences-section-title">Assistance Settings</div>
            <div class="user-preferences-option">
              <label class="user-preferences-option-label">Proactive Assistance</label>
              <label class="user-preferences-toggle">
                <input type="checkbox" data-preference="interaction.proactiveAssistance" ${this.preferences.interaction.proactiveAssistance ? 'checked' : ''}>
                <span class="user-preferences-toggle-slider"></span>
              </label>
            </div>
            <div class="user-preferences-option">
              <label class="user-preferences-option-label">Meeting Reminders</label>
              <label class="user-preferences-toggle">
                <input type="checkbox" data-preference="interaction.meetingReminders" ${this.preferences.interaction.meetingReminders ? 'checked' : ''}>
                <span class="user-preferences-toggle-slider"></span>
              </label>
            </div>
            <div class="user-preferences-option">
              <label class="user-preferences-option-label">Journal Prompts</label>
              <label class="user-preferences-toggle">
                <input type="checkbox" data-preference="interaction.journalPrompts" ${this.preferences.interaction.journalPrompts ? 'checked' : ''}>
                <span class="user-preferences-toggle-slider"></span>
              </label>
            </div>
            <div class="user-preferences-option">
              <label class="user-preferences-option-label">Focus Exercises</label>
              <label class="user-preferences-toggle">
                <input type="checkbox" data-preference="interaction.focusExercises" ${this.preferences.interaction.focusExercises ? 'checked' : ''}>
                <span class="user-preferences-toggle-slider"></span>
              </label>
            </div>
            <div class="user-preferences-option">
              <label class="user-preferences-option-label">Breath Reminders</label>
              <label class="user-preferences-toggle">
                <input type="checkbox" data-preference="interaction.breathReminders" ${this.preferences.interaction.breathReminders ? 'checked' : ''}>
                <span class="user-preferences-toggle-slider"></span>
              </label>
            </div>
            <div class="user-preferences-option">
              <label class="user-preferences-option-label">Ritual Suggestions</label>
              <label class="user-preferences-toggle">
                <input type="checkbox" data-preference="interaction.ritualSuggestions" ${this.preferences.interaction.ritualSuggestions ? 'checked' : ''}>
                <span class="user-preferences-toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
        
        <!-- Privacy Tab -->
        <div class="user-preferences-tab-content" data-tab="privacy" style="display: none;">
          <div class="user-preferences-section">
            <div class="user-preferences-section-title">Data Settings</div>
            <div class="user-preferences-option">
              <label class="user-preferences-option-label">Data Retention (days)</label>
              <select class="user-preferences-select" data-preference="privacy.dataRetention">
                <option value="30" ${this.preferences.privacy.dataRetention === 30 ? 'selected' : ''}>30 days</option>
                <option value="90" ${this.preferences.privacy.dataRetention === 90 ? 'selected' : ''}>90 days</option>
                <option value="180" ${this.preferences.privacy.dataRetention === 180 ? 'selected' : ''}>180 days</option>
                <option value="365" ${this.preferences.privacy.dataRetention === 365 ? 'selected' : ''}>1 year</option>
              </select>
            </div>
            <div class="user-preferences-option">
              <label class="user-preferences-option-label">Share Analytics</label>
              <label class="user-preferences-toggle">
                <input type="checkbox" data-preference="privacy.shareAnalytics" ${this.preferences.privacy.shareAnalytics ? 'checked' : ''}>
                <span class="user-preferences-toggle-slider"></span>
              </label>
            </div>
            <div class="user-preferences-option">
              <label class="user-preferences-option-label">Record Conversations</label>
              <label class="user-preferences-toggle">
                <input type="checkbox" data-preference="privacy.recordConversations" ${this.preferences.privacy.recordConversations ? 'checked' : ''}>
                <span class="user-preferences-toggle-slider"></span>
              </label>
            </div>
            <div class="user-preferences-option">
              <label class="user-preferences-option-label">Location Awareness</label>
              <label class="user-preferences-toggle">
                <input type="checkbox" data-preference="privacy.locationAwareness" ${this.preferences.privacy.locationAwareness ? 'checked' : ''}>
                <span class="user-preferences-toggle-slider"></span>
              </label>
            </div>
            <div class="user-preferences-option">
              <label class="user-preferences-option-label">Contact Integration</label>
              <label class="user-preferences-toggle">
                <input type="checkbox" data-preference="privacy.contactIntegration" ${this.preferences.privacy.contactIntegration ? 'checked' : ''}>
                <span class="user-preferences-toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
      <div class="user-preferences-actions">
        <button class="user-preferences-button secondary" data-action="reset">Reset to Defaults</button>
        <button class="user-preferences-button primary" data-action="save">Save Preferences</button>
      </div>
    `;
    
    // Show preferences panel
    preferencesElement.classList.add('visible');
    
    // Add event listeners
    const closeButton = preferencesElement.querySelector('.user-preferences-close');
    const tabs = preferencesElement.querySelectorAll('.user-preferences-tab');
    const saveButton = preferencesElement.querySelector('[data-action="save"]');
    const resetButton = preferencesElement.querySelector('[data-action="reset"]');
    const inputs = preferencesElement.querySelectorAll('[data-preference]');
    
    closeButton.addEventListener('click', () => {
      this.hidePreferencesUI();
    });
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show corresponding content
        const tabName = tab.getAttribute('data-tab');
        const tabContents = preferencesElement.querySelectorAll('.user-preferences-tab-content');
        
        tabContents.forEach(content => {
          if (content.getAttribute('data-tab') === tabName) {
            content.style.display = 'block';
          } else {
            content.style.display = 'none';
          }
        });
      });
    });
    
    saveButton.addEventListener('click', () => {
      // Collect all preference values
      const newPreferences = {};
      
      inputs.forEach(input => {
        const prefPath = input.getAttribute('data-preference').split('.');
        const category = prefPath[0];
        const key = prefPath[1];
        
        if (!newPreferences[category]) {
          newPreferences[category] = {};
        }
        
        if (input.type === 'checkbox') {
          newPreferences[category][key] = input.checked;
        } else if (input.type === 'range') {
          newPreferences[category][key] = parseFloat(input.value);
        } else if (input.tagName === 'SELECT') {
          // Handle numeric values in selects
          const value = input.value;
          if (!isNaN(parseInt(value))) {
            newPreferences[category][key] = parseInt(value);
          } else {
            newPreferences[category][key] = value;
          }
        }
      });
      
      // Update preferences
      this.setPreferences(newPreferences);
      
      // Hide UI
      this.hidePreferencesUI();
      
      // Show confirmation
      this.showNotification('Preferences saved successfully!');
    });
    
    resetButton.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all preferences to default values?')) {
        this.resetPreferences();
        this.hidePreferencesUI();
        this.showNotification('Preferences reset to defaults.');
      }
    });
    
    // Add event listeners for range inputs to update labels
    const rangeInputs = preferencesElement.querySelectorAll('input[type="range"]');
    rangeInputs.forEach(input => {
      input.addEventListener('input', () => {
        const label = input.previousElementSibling;
        const prefPath = input.getAttribute('data-preference').split('.');
        const category = prefPath[0];
        const key = prefPath[1];
        
        label.textContent = `${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}: ${input.value}`;
      });
    });
  }
  
  // Hide preferences UI
  hidePreferencesUI() {
    const preferencesElement = document.getElementById('user-preferences');
    if (preferencesElement) {
      preferencesElement.classList.remove('visible');
    }
  }
  
  // Show notification
  showNotification(message, type = 'success') {
    // Create notification element if it doesn't exist
    let notificationElement = document.getElementById('preference-notification');
    
    if (!notificationElement) {
      notificationElement = document.createElement('div');
      notificationElement.id = 'preference-notification';
      notificationElement.className = 'preference-notification';
      
      // Add to body
      document.body.appendChild(notificationElement);
      
      // Add styles if not already present
      if (!document.getElementById('preference-notification-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'preference-notification-styles';
        styleElement.textContent = `
          .preference-notification {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-size: 14px;
            z-index: 2000;
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          .preference-notification.success {
            background-color: #2ecc71;
          }
          .preference-notification.error {
            background-color: #e74c3c;
          }
          .preference-notification.info {
            background-color: #3498db;
          }
          .preference-notification.visible {
            opacity: 1;
          }
        `;
        document.head.appendChild(styleElement);
      }
    }
    
    // Set notification content and type
    notificationElement.textContent = message;
    notificationElement.className = `preference-notification ${type}`;
    
    // Show notification
    notificationElement.classList.add('visible');
    
    // Hide after 3 seconds
    setTimeout(() => {
      notificationElement.classList.remove('visible');
    }, 3000);
  }
  
  // Event handlers
  handleFeatureUsed(event) {
    if (event.detail) {
      const { feature, subfeature, metadata } = event.detail;
      this.recordFeatureUsage(feature, subfeature, metadata);
    }
  }
  
  handlePreferenceSet(event) {
    if (event.detail) {
      const { category, key, value } = event.detail;
      this.setPreference(category, key, value);
    }
  }
  
  handleSessionStart(event) {
    this.startSession();
  }
  
  handleSessionEnd(event) {
    this.endSession();
  }
}

// Export the system
window.UserPreferenceTrackingSystem = UserPreferenceTrackingSystem;

// Initialize the system when the document is ready
document.addEventListener('DOMContentLoaded', () => {
  window.preferenceSystem = new UserPreferenceTrackingSystem();
});
