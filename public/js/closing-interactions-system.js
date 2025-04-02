// Warm Closing Interactions System for MeAI
class ClosingInteractionsSystem {
  constructor() {
    this.preferenceSystem = window.preferenceSystem;
    this.communicationSystem = window.communicationSystem;
    this.contextSystem = window.contextSystem;
    
    // Closing state
    this.isClosing = false;
    this.lastClosingTime = null;
    this.closingReason = null;
    
    // Session tracking
    this.sessionStartTime = new Date();
    this.sessionActive = true;
    this.inactivityTimeout = null;
    this.inactivityThreshold = 5 * 60 * 1000; // 5 minutes
    
    // Closing messages
    this.closingMessages = {
      standard: [
        "All set for now? I'll keep track of everything for you - just let me know when you need anything else!",
        "I'll be here whenever you need me. Just reach out when you want to chat again!",
        "Feel free to come back anytime. I'll be here ready to help!",
        "I've got everything saved for you. Come back whenever you need assistance!",
        "Take care! I'll be here when you return.",
        "Until next time! I'll keep everything organized for you.",
        "I'll be here whenever you need me. Have a great day!",
        "Feel free to check in anytime. I'll be ready to help!"
      ],
      
      brief: [
        "All set! I'll be here when you need me.",
        "Got it all saved. See you soon!",
        "Take care! I'll be here.",
        "Until next time!",
        "Ready when you are.",
        "I'll keep everything organized for you.",
        "Just reach out when you need me!",
        "Feel free to check in anytime."
      ],
      
      withSummary: [
        "We've covered quite a bit today! I've saved our conversation and will remember the key points for next time. I'll be here whenever you need me!",
        "Great session! I've noted your preferences and will have everything ready for our next conversation. Feel free to come back anytime!",
        "I've saved all the important details from our chat. Everything will be organized and waiting for you when you return!",
        "I'll remember what we discussed about {topic}. Just let me know when you'd like to pick up where we left off!",
        "I've got all the details saved about {topic}. I'll be here ready to help whenever you need me!",
        "I'll keep track of everything we discussed about {topic}. Feel free to check in anytime you need assistance with this or anything else!"
      ],
      
      withNextSteps: [
        "I'll have everything ready for your meeting with {person} when you return. Take care until then!",
        "I'll remind you about {task} at the time we discussed. Feel free to check in if you need anything before then!",
        "Next time we can continue working on {topic} if you'd like. I'll be here whenever you're ready!",
        "I'll keep your focus exercise preferences saved for next time. Just let me know when you want to try another session!",
        "I've saved your journal entry and will have insights ready for you next time. Take care until then!",
        "Your ritual progress has been saved. We can continue where we left off whenever you're ready!"
      ],
      
      timeSpecific: {
        morning: [
          "Have a wonderful day ahead! I'll be here when you need me.",
          "Wishing you a productive day! I'll keep everything organized for when you return.",
          "Hope your day goes well! I'll be ready to help when you check back in."
        ],
        afternoon: [
          "Enjoy the rest of your day! I'll be here when you need me.",
          "Hope your afternoon goes smoothly! I'll keep everything saved for you.",
          "Have a great afternoon! I'll be ready to help when you return."
        ],
        evening: [
          "Have a relaxing evening! I'll be here when you need me tomorrow.",
          "Rest well tonight! I'll keep everything organized for when you return.",
          "Enjoy your evening! I'll be ready to help when you check back in."
        ],
        night: [
          "Have a good night! I'll be here for you tomorrow.",
          "Sleep well! I'll keep everything saved for you.",
          "Rest well! I'll be ready to help when you return tomorrow."
        ]
      }
    };
    
    // Initialize
    this.init();
  }
  
  // Initialize the system
  init() {
    // Set up event listeners
    document.addEventListener('meai-session-end-request', this.handleSessionEndRequest.bind(this));
    document.addEventListener('meai-user-input', this.handleUserInput.bind(this));
    document.addEventListener('meai-inactivity-detected', this.handleInactivityDetected.bind(this));
    
    // Start inactivity timer
    this.resetInactivityTimer();
    
    // Set up visibility change detection
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Set up before unload event
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  }
  
  // Reset inactivity timer
  resetInactivityTimer() {
    // Clear existing timeout
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
    }
    
    // Set new timeout
    this.inactivityTimeout = setTimeout(() => {
      this.handleInactivity();
    }, this.inactivityThreshold);
  }
  
  // Handle inactivity
  handleInactivity() {
    if (this.sessionActive && !this.isClosing) {
      // Dispatch event
      document.dispatchEvent(new CustomEvent('meai-inactivity-detected', {
        detail: {
          timestamp: new Date().toISOString(),
          sessionDuration: this.getSessionDuration()
        }
      }));
    }
  }
  
  // Get session duration in seconds
  getSessionDuration() {
    return Math.floor((new Date() - this.sessionStartTime) / 1000);
  }
  
  // Handle visibility change
  handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      // User navigated away
      if (this.sessionActive && !this.isClosing) {
        this.prepareClosing('visibility_change');
      }
    } else {
      // User returned
      if (this.isClosing) {
        // Cancel closing if user returns quickly (within 5 seconds)
        const timeSinceClosing = new Date() - new Date(this.lastClosingTime);
        if (timeSinceClosing < 5000) {
          this.cancelClosing();
        }
      }
      
      // Reset inactivity timer
      this.resetInactivityTimer();
    }
  }
  
  // Handle before unload
  handleBeforeUnload(event) {
    if (this.sessionActive && !this.isClosing) {
      this.prepareClosing('page_unload');
    }
  }
  
  // Prepare closing
  prepareClosing(reason) {
    this.isClosing = true;
    this.lastClosingTime = new Date().toISOString();
    this.closingReason = reason;
    
    // Generate closing message
    const closingMessage = this.generateClosingMessage(reason);
    
    // Display closing message
    this.displayClosingMessage(closingMessage);
    
    // End session
    this.endSession();
  }
  
  // Cancel closing
  cancelClosing() {
    this.isClosing = false;
    this.lastClosingTime = null;
    this.closingReason = null;
    
    // Hide closing message if visible
    this.hideClosingMessage();
    
    // Reset inactivity timer
    this.resetInactivityTimer();
  }
  
  // End session
  endSession() {
    if (this.sessionActive) {
      this.sessionActive = false;
      
      // Record session end in preference system
      if (this.preferenceSystem) {
        this.preferenceSystem.endSession();
      }
      
      // Dispatch event
      document.dispatchEvent(new CustomEvent('meai-session-ended', {
        detail: {
          timestamp: new Date().toISOString(),
          duration: this.getSessionDuration(),
          reason: this.closingReason
        }
      }));
    }
  }
  
  // Generate closing message
  generateClosingMessage(reason) {
    // Get user context
    const context = this.getClosingContext();
    
    // Determine message type based on context and reason
    let messageType = 'standard';
    
    if (context.hasSummary) {
      messageType = 'withSummary';
    } else if (context.hasNextSteps) {
      messageType = 'withNextSteps';
    } else if (context.isTimeSpecific) {
      messageType = 'timeSpecific';
    } else if (reason === 'quick_exit' || context.prefersBrief) {
      messageType = 'brief';
    }
    
    // Get appropriate messages
    let messages;
    if (messageType === 'timeSpecific') {
      messages = this.closingMessages.timeSpecific[context.timeOfDay];
    } else {
      messages = this.closingMessages[messageType];
    }
    
    // Select random message
    let message = messages[Math.floor(Math.random() * messages.length)];
    
    // Replace placeholders
    if (messageType === 'withSummary' || messageType === 'withNextSteps') {
      message = message.replace('{topic}', context.topic || 'our conversation');
      message = message.replace('{person}', context.person || 'your contact');
      message = message.replace('{task}', context.task || 'your task');
    }
    
    return message;
  }
  
  // Get closing context
  getClosingContext() {
    const context = {
      hasSummary: false,
      hasNextSteps: false,
      isTimeSpecific: false,
      timeOfDay: null,
      topic: null,
      person: null,
      task: null,
      prefersBrief: false
    };
    
    // Check if context system is available
    if (this.contextSystem) {
      // Get recent topics
      const recentTopics = this.contextSystem.getRecentTopics && this.contextSystem.getRecentTopics();
      if (recentTopics && recentTopics.length > 0) {
        context.topic = recentTopics[0].topic;
        context.hasSummary = true;
      }
      
      // Get upcoming meetings
      const upcomingMeetings = this.contextSystem.getUpcomingMeetings && this.contextSystem.getUpcomingMeetings();
      if (upcomingMeetings && upcomingMeetings.length > 0) {
        context.person = upcomingMeetings[0].attendees[0] || 'your contact';
        context.hasNextSteps = true;
      }
      
      // Get upcoming tasks
      const upcomingTasks = this.contextSystem.getUpcomingTasks && this.contextSystem.getUpcomingTasks();
      if (upcomingTasks && upcomingTasks.length > 0) {
        context.task = upcomingTasks[0].title || 'your task';
        context.hasNextSteps = true;
      }
    }
    
    // Check time of day
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      context.timeOfDay = 'morning';
      context.isTimeSpecific = true;
    } else if (hour >= 12 && hour < 17) {
      context.timeOfDay = 'afternoon';
      context.isTimeSpecific = true;
    } else if (hour >= 17 && hour < 22) {
      context.timeOfDay = 'evening';
      context.isTimeSpecific = true;
    } else {
      context.timeOfDay = 'night';
      context.isTimeSpecific = true;
    }
    
    // Check user preferences
    if (this.preferenceSystem) {
      const commPrefs = this.preferenceSystem.getPreferenceCategory('communication');
      if (commPrefs && commPrefs.responseLength === 'brief') {
        context.prefersBrief = true;
      }
    }
    
    return context;
  }
  
  // Display closing message
  displayClosingMessage(message) {
    // Create closing message element if it doesn't exist
    let closingElement = document.getElementById('meai-closing-message');
    
    if (!closingElement) {
      closingElement = document.createElement('div');
      closingElement.id = 'meai-closing-message';
      closingElement.className = 'meai-closing-message';
      
      // Add to body
      document.body.appendChild(closingElement);
      
      // Add styles if not already present
      if (!document.getElementById('meai-closing-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'meai-closing-styles';
        styleElement.textContent = `
          .meai-closing-message {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 16px 24px;
            border-radius: 12px;
            background-color: #6c5ce7;
            color: white;
            font-size: 16px;
            max-width: 80%;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.5s ease;
          }
          .meai-closing-message.visible {
            opacity: 1;
          }
          .meai-closing-actions {
            margin-top: 12px;
            display: flex;
            justify-content: center;
            gap: 12px;
          }
          .meai-closing-button {
            padding: 8px 16px;
            border-radius: 20px;
            border: none;
            background-color: rgba(255, 255, 255, 0.2);
            color: white;
            font-size: 14px;
            cursor: pointer;
            transition: background-color 0.3s ease;
          }
          .meai-closing-button:hover {
            background-color: rgba(255, 255, 255, 0.3);
          }
        `;
        document.head.appendChild(styleElement);
      }
    }
    
    // Set message content
    closingElement.innerHTML = `
      <div class="meai-closing-text">${message}</div>
      <div class="meai-closing-actions">
        <button class="meai-closing-button" data-action="stay">Continue Session</button>
        <button class="meai-closing-button" data-action="end">End Session</button>
      </div>
    `;
    
    // Add event listeners
    const stayButton = closingElement.querySelector('[data-action="stay"]');
    const endButton = closingElement.querySelector('[data-action="end"]');
    
    stayButton.addEventListener('click', () => {
      this.cancelClosing();
    });
    
    endButton.addEventListener('click', () => {
      this.confirmClosing();
    });
    
    // Show message
    setTimeout(() => {
      closingElement.classList.add('visible');
    }, 100);
    
    // Speak message if voice is enabled
    if (this.communicationSystem && this.communicationSystem.communicationMode !== 'text') {
      this.communicationSystem.speak(message);
    }
  }
  
  // Hide closing message
  hideClosingMessage() {
    const closingElement = document.getElementById('meai-closing-message');
    
    if (closingElement) {
      closingElement.classList.remove('visible');
    }
  }
  
  // Confirm closing
  confirmClosing() {
    // Hide closing message
    this.hideClosingMessage();
    
    // End session if not already ended
    if (this.sessionActive) {
      this.endSession();
    }
    
    // Dispatch event
    document.dispatchEvent(new CustomEvent('meai-session-confirmed-end', {
      detail: {
        timestamp: new Date().toISOString(),
        reason: this.closingReason
      }
    }));
  }
  
  // Handle session end request
  handleSessionEndRequest(event) {
    if (this.sessionActive && !this.isClosing) {
      this.prepareClosing('user_request');
    }
  }
  
  // Handle user input
  handleUserInput(event) {
    // Reset inactivity timer
    this.resetInactivityTimer();
    
    // Cancel closing if in progress
    if (this.isClosing) {
      this.cancelClosing();
    }
    
    // Check for closing phrases
    if (event.detail && event.detail.text) {
      const text = event.detail.text.toLowerCase();
      
      const closingPhrases = [
        'goodbye', 'bye', 'see you later', 'talk to you later', 'until next time',
        'that\'s all', 'that\'s it for now', 'i\'m done', 'end session', 'close'
      ];
      
      if (closingPhrases.some(phrase => text.includes(phrase))) {
        this.prepareClosing('user_closing_phrase');
      }
    }
  }
  
  // Handle inactivity detected
  handleInactivityDetected(event) {
    if (this.sessionActive && !this.isClosing) {
      this.prepareClosing('inactivity');
    }
  }
  
  // Request session end
  requestSessionEnd() {
    if (this.sessionActive && !this.isClosing) {
      this.prepareClosing('system_request');
      return true;
    }
    
    return false;
  }
  
  // Check if session is active
  isSessionActive() {
    return this.sessionActive;
  }
  
  // Get session info
  getSessionInfo() {
    return {
      active: this.sessionActive,
      startTime: this.sessionStartTime.toISOString(),
      duration: this.getSessionDuration(),
      isClosing: this.isClosing,
      closingReason: this.closingReason,
      lastClosingTime: this.lastClosingTime
    };
  }
  
  // Add custom closing message
  addCustomClosingMessage(category, message) {
    if (category in this.closingMessages) {
      if (Array.isArray(this.closingMessages[category])) {
        this.closingMessages[category].push(message);
        return true;
      } else if (typeof this.closingMessages[category] === 'object') {
        // For timeSpecific category, need to specify subcategory
        return false;
      }
    }
    
    return false;
  }
  
  // Add custom time-specific closing message
  addCustomTimeSpecificClosingMessage(timeOfDay, message) {
    if (timeOfDay in this.closingMessages.timeSpecific) {
      this.closingMessages.timeSpecific[timeOfDay].push(message);
      return true;
    }
    
    return false;
  }
}

// Export the system
window.ClosingInteractionsSystem = ClosingInteractionsSystem;

// Initialize the system when the document is ready
document.addEventListener('DOMContentLoaded', () => {
  window.closingSystem = new ClosingInteractionsSystem();
});
