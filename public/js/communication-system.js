// Voice and Text Communication System for MeAI
class CommunicationSystem {
  constructor() {
    this.preferenceSystem = window.preferenceSystem;
    this.contextSystem = window.contextSystem;
    
    // Voice synthesis
    this.synthesis = window.speechSynthesis;
    this.voices = [];
    this.currentVoice = null;
    this.isSpeaking = false;
    this.speechQueue = [];
    this.processingQueue = false;
    
    // Voice recognition
    this.recognition = null;
    this.isListening = false;
    this.recognitionActive = false;
    this.recognitionResults = [];
    
    // Communication state
    this.communicationMode = 'text'; // 'text', 'voice', 'both'
    this.conversationHistory = [];
    this.lastInteraction = null;
    
    // UI elements
    this.voiceButton = null;
    this.textInput = null;
    
    // Initialize
    this.init();
  }
  
  // Initialize the system
  init() {
    // Load preferences
    this.loadPreferences();
    
    // Initialize voice synthesis
    this.initVoiceSynthesis();
    
    // Initialize voice recognition if supported
    this.initVoiceRecognition();
    
    // Set up event listeners
    document.addEventListener('meai-speak', this.handleSpeakRequest.bind(this));
    document.addEventListener('meai-listen', this.handleListenRequest.bind(this));
    document.addEventListener('meai-communication-mode', this.handleCommunicationModeChange.bind(this));
    
    // Create UI elements
    this.createUI();
    
    // Set initial communication mode based on preferences
    this.setCommunicationMode(this.preferenceSystem && this.preferenceSystem.getPreference('communication', 'preferVoice') ? 'both' : 'text');
  }
  
  // Load preferences
  loadPreferences() {
    if (this.preferenceSystem) {
      // Get communication preferences
      const commPrefs = this.preferenceSystem.getPreferenceCategory('communication');
      
      if (commPrefs) {
        // Set initial communication mode
        this.communicationMode = commPrefs.preferVoice ? 'both' : 'text';
      }
    }
  }
  
  // Initialize voice synthesis
  initVoiceSynthesis() {
    // Get available voices
    this.voices = this.synthesis.getVoices();
    
    // If voices aren't loaded yet, wait for them
    if (this.voices.length === 0) {
      this.synthesis.addEventListener('voiceschanged', () => {
        this.voices = this.synthesis.getVoices();
        this.selectVoice();
      });
    } else {
      this.selectVoice();
    }
  }
  
  // Select appropriate voice
  selectVoice() {
    // Default to first available voice
    let selectedVoice = this.voices[0];
    
    // Try to find a warm, friendly female voice as default
    const preferredVoices = this.voices.filter(voice => 
      (voice.name.includes('female') || voice.name.includes('Female') || 
       voice.name.includes('woman') || voice.name.includes('Woman')) &&
      (voice.lang.startsWith('en'))
    );
    
    if (preferredVoices.length > 0) {
      selectedVoice = preferredVoices[0];
    }
    
    // Check if user has a preferred voice
    if (this.preferenceSystem) {
      const preferredVoice = this.preferenceSystem.getPreference('communication', 'preferredVoice');
      
      if (preferredVoice) {
        const matchingVoice = this.voices.find(voice => voice.name === preferredVoice);
        if (matchingVoice) {
          selectedVoice = matchingVoice;
        }
      }
    }
    
    this.currentVoice = selectedVoice;
  }
  
  // Initialize voice recognition
  initVoiceRecognition() {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      
      // Set up recognition event handlers
      this.recognition.onstart = () => {
        this.isListening = true;
        this.recognitionActive = true;
        this.updateVoiceButtonState();
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('meai-listening-started', {
          detail: {
            timestamp: new Date().toISOString()
          }
        }));
      };
      
      this.recognition.onend = () => {
        this.isListening = false;
        this.updateVoiceButtonState();
        
        // If recognition is still active, restart it
        if (this.recognitionActive) {
          this.recognition.start();
        } else {
          // Dispatch event
          document.dispatchEvent(new CustomEvent('meai-listening-ended', {
            detail: {
              timestamp: new Date().toISOString()
            }
          }));
        }
      };
      
      this.recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        
        // Add to results
        this.recognitionResults.push({
          transcript,
          confidence: result[0].confidence,
          isFinal: result.isFinal
        });
        
        // If final result, process it
        if (result.isFinal) {
          this.processRecognitionResult(transcript);
        }
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('meai-recognition-result', {
          detail: {
            transcript,
            confidence: result[0].confidence,
            isFinal: result.isFinal
          }
        }));
      };
      
      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        this.isListening = false;
        this.recognitionActive = false;
        this.updateVoiceButtonState();
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('meai-recognition-error', {
          detail: {
            error: event.error,
            timestamp: new Date().toISOString()
          }
        }));
      };
    }
  }
  
  // Create UI elements
  createUI() {
    // Create voice button if it doesn't exist
    if (!this.voiceButton) {
      this.voiceButton = document.createElement('button');
      this.voiceButton.id = 'meai-voice-button';
      this.voiceButton.className = 'meai-voice-button';
      
      // Add to body
      document.body.appendChild(this.voiceButton);
      
      // Add styles if not already present
      if (!document.getElementById('meai-communication-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'meai-communication-styles';
        styleElement.textContent = `
          .meai-voice-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: #6c5ce7;
            color: white;
            border: none;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            transition: all 0.3s ease;
          }
          .meai-voice-button:hover {
            transform: scale(1.1);
          }
          .meai-voice-button:active {
            transform: scale(0.95);
          }
          .meai-voice-button.listening {
            background-color: #e74c3c;
            animation: pulse 1.5s infinite;
          }
          .meai-voice-button.speaking {
            background-color: #2ecc71;
          }
          .meai-voice-button.disabled {
            background-color: #95a5a6;
            cursor: not-allowed;
          }
          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.4);
            }
            70% {
              box-shadow: 0 0 0 10px rgba(231, 76, 60, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(231, 76, 60, 0);
            }
          }
          .meai-voice-indicator {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 8px 16px;
            border-radius: 20px;
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            font-size: 14px;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          .meai-voice-indicator.visible {
            opacity: 1;
          }
          .meai-communication-toggle {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 8px 12px;
            border-radius: 20px;
            background-color: #f5f5f5;
            border: 1px solid #ddd;
            font-size: 14px;
            cursor: pointer;
            z-index: 1000;
          }
        `;
        document.head.appendChild(styleElement);
      }
      
      // Set initial icon
      this.updateVoiceButtonState();
      
      // Add event listener
      this.voiceButton.addEventListener('click', () => {
        if (this.isListening) {
          this.stopListening();
        } else if (this.isSpeaking) {
          this.stopSpeaking();
        } else {
          this.startListening();
        }
      });
    }
    
    // Create communication toggle
    const toggleElement = document.createElement('div');
    toggleElement.className = 'meai-communication-toggle';
    toggleElement.innerHTML = 'Text Only';
    
    // Add to body
    document.body.appendChild(toggleElement);
    
    // Add event listener
    toggleElement.addEventListener('click', () => {
      // Cycle through modes: text -> both -> voice -> text
      if (this.communicationMode === 'text') {
        this.setCommunicationMode('both');
        toggleElement.innerHTML = 'Text & Voice';
      } else if (this.communicationMode === 'both') {
        this.setCommunicationMode('voice');
        toggleElement.innerHTML = 'Voice Only';
      } else {
        this.setCommunicationMode('text');
        toggleElement.innerHTML = 'Text Only';
      }
    });
  }
  
  // Update voice button state
  updateVoiceButtonState() {
    if (!this.voiceButton) return;
    
    // Remove all classes
    this.voiceButton.classList.remove('listening', 'speaking', 'disabled');
    
    // Set icon and class based on state
    if (this.isListening) {
      this.voiceButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>';
      this.voiceButton.classList.add('listening');
    } else if (this.isSpeaking) {
      this.voiceButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
      this.voiceButton.classList.add('speaking');
    } else if (this.communicationMode === 'text') {
      this.voiceButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>';
      this.voiceButton.classList.add('disabled');
    } else {
      this.voiceButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>';
    }
  }
  
  // Show voice indicator
  showVoiceIndicator(text, duration = 3000) {
    // Create indicator if it doesn't exist
    let indicatorElement = document.getElementById('meai-voice-indicator');
    
    if (!indicatorElement) {
      indicatorElement = document.createElement('div');
      indicatorElement.id = 'meai-voice-indicator';
      indicatorElement.className = 'meai-voice-indicator';
      
      // Add to body
      document.body.appendChild(indicatorElement);
    }
    
    // Set text
    indicatorElement.textContent = text;
    
    // Show indicator
    indicatorElement.classList.add('visible');
    
    // Hide after duration
    setTimeout(() => {
      indicatorElement.classList.remove('visible');
    }, duration);
  }
  
  // Set communication mode
  setCommunicationMode(mode) {
    if (['text', 'voice', 'both'].includes(mode)) {
      this.communicationMode = mode;
      
      // Update UI
      this.updateVoiceButtonState();
      
      // Update preference if available
      if (this.preferenceSystem) {
        this.preferenceSystem.setPreference('communication', 'preferVoice', mode !== 'text');
      }
      
      // Dispatch event
      document.dispatchEvent(new CustomEvent('meai-communication-mode-changed', {
        detail: {
          mode,
          timestamp: new Date().toISOString()
        }
      }));
      
      // Show indicator
      let modeText = 'Text Only';
      if (mode === 'voice') modeText = 'Voice Only';
      if (mode === 'both') modeText = 'Text & Voice';
      
      this.showVoiceIndicator(`Communication Mode: ${modeText}`);
      
      return true;
    }
    
    return false;
  }
  
  // Speak text
  speak(text, options = {}) {
    // If voice is not enabled, don't speak
    if (this.communicationMode === 'text') {
      return false;
    }
    
    // Add to queue
    this.speechQueue.push({ text, options });
    
    // Process queue if not already processing
    if (!this.processingQueue) {
      this.processSpeechQueue();
    }
    
    return true;
  }
  
  // Process speech queue
  processSpeechQueue() {
    // If queue is empty or already speaking, return
    if (this.speechQueue.length === 0 || this.isSpeaking) {
      this.processingQueue = false;
      return;
    }
    
    this.processingQueue = true;
    
    // Get next item from queue
    const { text, options } = this.speechQueue.shift();
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice
    if (this.currentVoice) {
      utterance.voice = this.currentVoice;
    }
    
    // Set options
    if (this.preferenceSystem) {
      utterance.volume = options.volume || this.preferenceSystem.getPreference('communication', 'voiceVolume') || 1;
      utterance.rate = options.rate || this.preferenceSystem.getPreference('communication', 'voiceRate') || 1;
      utterance.pitch = options.pitch || this.preferenceSystem.getPreference('communication', 'voicePitch') || 1;
    } else {
      utterance.volume = options.volume || 1;
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
    }
    
    // Set event handlers
    utterance.onstart = () => {
      this.isSpeaking = true;
      this.updateVoiceButtonState();
      
      // Dispatch event
      document.dispatchEvent(new CustomEvent('meai-speaking-started', {
        detail: {
          text,
          timestamp: new Date().toISOString()
        }
      }));
    };
    
    utterance.onend = () => {
      this.isSpeaking = false;
      this.updateVoiceButtonState();
      
      // Dispatch event
      document.dispatchEvent(new CustomEvent('meai-speaking-ended', {
        detail: {
          text,
          timestamp: new Date().toISOString()
        }
      }));
      
      // Process next item in queue
      this.processSpeechQueue();
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      
      this.isSpeaking = false;
      this.updateVoiceButtonState();
      
      // Dispatch event
      document.dispatchEvent(new CustomEvent('meai-speaking-error', {
        detail: {
          text,
          error: event,
          timestamp: new Date().toISOString()
        }
      }));
      
      // Process next item in queue
      this.processSpeechQueue();
    };
    
    // Speak
    this.synthesis.speak(utterance);
  }
  
  // Stop speaking
  stopSpeaking() {
    if (this.isSpeaking) {
      this.synthesis.cancel();
      this.isSpeaking = false;
      this.updateVoiceButtonState();
      
      // Clear queue
      this.speechQueue = [];
      this.processingQueue = false;
      
      // Dispatch event
      document.dispatchEvent(new CustomEvent('meai-speaking-stopped', {
        detail: {
          timestamp: new Date().toISOString()
        }
      }));
      
      return true;
    }
    
    return false;
  }
  
  // Start listening
  startListening() {
    // If voice is not enabled or already listening, don't start
    if (this.communicationMode === 'text' || this.isListening || !this.recognition) {
      return false;
    }
    
    // Clear previous results
    this.recognitionResults = [];
    
    // Start recognition
    try {
      this.recognition.start();
      this.recognitionActive = true;
      
      // Show indicator
      this.showVoiceIndicator('Listening...');
      
      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      return false;
    }
  }
  
  // Stop listening
  stopListening() {
    if (this.isListening && this.recognition) {
      this.recognition.stop();
      this.recognitionActive = false;
      this.isListening = false;
      this.updateVoiceButtonState();
      
      // Dispatch event
      document.dispatchEvent(new CustomEvent('meai-listening-stopped', {
        detail: {
          timestamp: new Date().toISOString()
        }
      }));
      
      return true;
    }
    
    return false;
  }
  
  // Process recognition result
  processRecognitionResult(transcript) {
    // Stop listening
    this.stopListening();
    
    // Add to conversation history
    this.addToConversationHistory('user', transcript);
    
    // Dispatch event
    document.dispatchEvent(new CustomEvent('meai-user-input', {
      detail: {
        text: transcript,
        source: 'voice',
        timestamp: new Date().toISOString()
      }
    }));
    
    // Show indicator
    this.showVoiceIndicator('Processing...', 2000);
  }
  
  // Add to conversation history
  addToConversationHistory(role, text) {
    const timestamp = new Date().toISOString();
    
    this.conversationHistory.push({
      role,
      text,
      timestamp
    });
    
    // Limit history size
    if (this.conversationHistory.length > 100) {
      this.conversationHistory = this.conversationHistory.slice(-100);
    }
    
    // Update last interaction
    this.lastInteraction = timestamp;
    
    // Record in context system if available
    if (this.contextSystem && role === 'user') {
      document.dispatchEvent(new CustomEvent('meai-conversation', {
        detail: {
          text,
          timestamp
        }
      }));
    }
  }
  
  // Get conversation history
  getConversationHistory(limit = 10) {
    return this.conversationHistory.slice(-limit);
  }
  
  // Get available voices
  getAvailableVoices() {
    return this.voices.map(voice => ({
      name: voice.name,
      lang: voice.lang,
      default: voice.default
    }));
  }
  
  // Set voice by name
  setVoice(voiceName) {
    const voice = this.voices.find(v => v.name === voiceName);
    
    if (voice) {
      this.currentVoice = voice;
      
      // Update preference if available
      if (this.preferenceSystem) {
        this.preferenceSystem.setPreference('communication', 'preferredVoice', voiceName);
      }
      
      return true;
    }
    
    return false;
  }
  
  // Event handlers
  handleSpeakRequest(event) {
    if (event.detail && event.detail.text) {
      this.speak(event.detail.text, event.detail.options || {});
    }
  }
  
  handleListenRequest(event) {
    this.startListening();
  }
  
  handleCommunicationModeChange(event) {
    if (event.detail && event.detail.mode) {
      this.setCommunicationMode(event.detail.mode);
    }
  }
  
  // Generate warm, friendly response
  generateResponse(input, context = {}) {
    // This is a simple implementation - in a real system, this would connect to an AI model
    const responses = [
      "I'm here to help with that. What specific information would you like?",
      "Great to see you! How can I assist you today?",
      "I'd be happy to help you with that. Let me know what you need.",
      "Thanks for sharing that with me. Is there anything specific you'd like me to remember?",
      "I understand. Would you like me to help you prepare for this?",
      "That sounds interesting! Would you like to explore this topic further?",
      "I appreciate you telling me about this. How are you feeling about it?",
      "I'm here for you. What would be most helpful right now?",
      "Let me help you with that. What's the first step you'd like to take?",
      "I've got you covered. What else would you like to know?"
    ];
    
    // Get a random response
    const randomIndex = Math.floor(Math.random() * responses.length);
    const response = responses[randomIndex];
    
    // Add to conversation history
    this.addToConversationHistory('assistant', response);
    
    // Speak response if voice is enabled
    if (this.communicationMode !== 'text') {
      this.speak(response);
    }
    
    return response;
  }
  
  // Generate closing message
  generateClosingMessage() {
    const closingMessages = [
      "All set for now? I'll keep track of everything for you - just let me know when you need anything else!",
      "I'll be here whenever you need me. Just reach out when you want to chat again!",
      "Feel free to come back anytime. I'll be here ready to help!",
      "I've got everything saved for you. Come back whenever you need assistance!",
      "Take care! I'll be here when you return.",
      "Until next time! I'll keep everything organized for you.",
      "I'll be here whenever you need me. Have a great day!",
      "Feel free to check in anytime. I'll be ready to help!"
    ];
    
    // Get a random message
    const randomIndex = Math.floor(Math.random() * closingMessages.length);
    return closingMessages[randomIndex];
  }
}

// Export the system
window.CommunicationSystem = CommunicationSystem;

// Initialize the system when the document is ready
document.addEventListener('DOMContentLoaded', () => {
  window.communicationSystem = new CommunicationSystem();
});
