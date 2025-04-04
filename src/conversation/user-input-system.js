/**
 * Streamlined User Input Handling System
 * 
 * This system manages user input through text and voice interfaces,
 * providing a seamless experience with appropriate feedback.
 */

class UserInputSystem {
    constructor() {
        // Initialize dependencies
        this.eventSystem = window.eventSystem || this.createEventSystem();
        
        // Initialize state
        this.state = {
            initialized: false,
            isListening: false,
            voiceRecognition: null,
            inputHistory: [],
            maxHistoryLength: 20
        };
        
        // DOM elements
        this.elements = {
            userInput: null,
            sendButton: null,
            voiceButton: null
        };
        
        // Initialize the system
        this.initialize();
    }
    
    /**
     * Initialize the user input system
     */
    initialize() {
        try {
            console.log('Initializing User Input System...');
            
            // Find DOM elements
            this.findDOMElements();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initialize voice recognition if available
            this.initializeVoiceRecognition();
            
            // Load input history from storage
            this.loadInputHistory();
            
            // Mark as initialized
            this.state.initialized = true;
            
            console.log('User Input System initialized successfully');
            
            return true;
        } catch (error) {
            console.error('Error initializing User Input System:', error);
            return false;
        }
    }
    
    /**
     * Create a simple event system if the global one is not available
     */
    createEventSystem() {
        console.warn('Global EventSystem not found, creating local instance');
        return {
            listeners: {},
            subscribe: function(event, callback) {
                if (!this.listeners[event]) {
                    this.listeners[event] = [];
                }
                this.listeners[event].push(callback);
                return () => {
                    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
                };
            },
            publish: function(event, data) {
                if (this.listeners[event]) {
                    this.listeners[event].forEach(callback => {
                        try {
                            callback(data);
                        } catch (error) {
                            console.error(`Error in event listener for ${event}:`, error);
                        }
                    });
                }
            }
        };
    }
    
    /**
     * Find DOM elements
     */
    findDOMElements() {
        this.elements.userInput = document.getElementById('user-input');
        this.elements.sendButton = document.getElementById('send-button');
        this.elements.voiceButton = document.getElementById('voice-input-button');
        
        if (!this.elements.userInput || !this.elements.sendButton || !this.elements.voiceButton) {
            console.warn('Some UI elements not found, will attempt to find them later');
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Retry finding elements if they weren't available initially
        if (!this.elements.userInput || !this.elements.sendButton || !this.elements.voiceButton) {
            window.addEventListener('DOMContentLoaded', () => {
                this.findDOMElements();
                this.setupUIEventListeners();
            });
        } else {
            this.setupUIEventListeners();
        }
        
        // Listen for settings changes
        this.eventSystem.subscribe('settings-updated', (data) => {
            if (data.voiceInput !== undefined) {
                if (!data.voiceInput && this.state.isListening) {
                    this.stopVoiceRecognition();
                }
            }
        });
        
        // Listen for clear conversation requests
        this.eventSystem.subscribe('clear-conversation', () => {
            this.clearInputHistory();
        });
    }
    
    /**
     * Set up UI-specific event listeners
     */
    setupUIEventListeners() {
        if (this.elements.userInput) {
            // Send message on Enter key
            this.elements.userInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendUserMessage();
                }
            });
            
            // Input focus events
            this.elements.userInput.addEventListener('focus', () => {
                this.eventSystem.publish('input-focus', {});
            });
            
            this.elements.userInput.addEventListener('blur', () => {
                this.eventSystem.publish('input-blur', {});
            });
            
            // Input typing events
            this.elements.userInput.addEventListener('input', () => {
                this.eventSystem.publish('user-typing', {
                    isTyping: this.elements.userInput.value.length > 0
                });
            });
        }
        
        if (this.elements.sendButton) {
            // Send message on button click
            this.elements.sendButton.addEventListener('click', () => {
                this.sendUserMessage();
            });
        }
        
        if (this.elements.voiceButton) {
            // Toggle voice input on button click
            this.elements.voiceButton.addEventListener('click', () => {
                this.toggleVoiceInput();
            });
        }
    }
    
    /**
     * Initialize voice recognition
     */
    initializeVoiceRecognition() {
        // Check if the browser supports the Web Speech API
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.state.voiceRecognition = new SpeechRecognition();
            
            // Configure recognition
            this.state.voiceRecognition.continuous = false;
            this.state.voiceRecognition.interimResults = false;
            this.state.voiceRecognition.lang = 'en-US';
            
            // Set up recognition event handlers
            this.state.voiceRecognition.onstart = () => {
                this.handleVoiceRecognitionStart();
            };
            
            this.state.voiceRecognition.onresult = (event) => {
                this.handleVoiceRecognitionResult(event);
            };
            
            this.state.voiceRecognition.onerror = (event) => {
                this.handleVoiceRecognitionError(event);
            };
            
            this.state.voiceRecognition.onend = () => {
                this.handleVoiceRecognitionEnd();
            };
            
            console.log('Voice recognition initialized');
        } else {
            console.warn('Web Speech API not supported in this browser');
        }
    }
    
    /**
     * Load input history from storage
     */
    loadInputHistory() {
        try {
            const history = localStorage.getItem('input-history');
            if (history) {
                this.state.inputHistory = JSON.parse(history);
            }
        } catch (error) {
            console.error('Error loading input history:', error);
            this.state.inputHistory = [];
        }
    }
    
    /**
     * Save input history to storage
     */
    saveInputHistory() {
        try {
            localStorage.setItem('input-history', JSON.stringify(this.state.inputHistory));
        } catch (error) {
            console.error('Error saving input history:', error);
        }
    }
    
    /**
     * Clear input history
     */
    clearInputHistory() {
        this.state.inputHistory = [];
        this.saveInputHistory();
    }
    
    /**
     * Send user message
     */
    sendUserMessage() {
        if (!this.elements.userInput) {
            console.error('User input element not found');
            return;
        }
        
        const message = this.elements.userInput.value.trim();
        
        if (message) {
            // Add to input history
            this.addToInputHistory(message);
            
            // Clear input field
            this.elements.userInput.value = '';
            
            // Publish message event
            this.eventSystem.publish('user-message', {
                text: message,
                timestamp: Date.now()
            });
            
            // Play send sound
            this.playSound('send');
        }
    }
    
    /**
     * Add message to input history
     * @param {string} message - User input message
     */
    addToInputHistory(message) {
        // Add to history
        this.state.inputHistory.push({
            text: message,
            timestamp: Date.now()
        });
        
        // Trim history if needed
        if (this.state.inputHistory.length > this.state.maxHistoryLength) {
            this.state.inputHistory = this.state.inputHistory.slice(-this.state.maxHistoryLength);
        }
        
        // Save updated history
        this.saveInputHistory();
    }
    
    /**
     * Toggle voice input
     */
    toggleVoiceInput() {
        if (this.state.isListening) {
            this.stopVoiceRecognition();
        } else {
            this.startVoiceRecognition();
        }
    }
    
    /**
     * Start voice recognition
     */
    startVoiceRecognition() {
        if (!this.state.voiceRecognition) {
            console.warn('Voice recognition not available');
            this.showVoiceError('Voice recognition not supported in this browser');
            return;
        }
        
        try {
            this.state.voiceRecognition.start();
        } catch (error) {
            console.error('Error starting voice recognition:', error);
            this.showVoiceError('Could not start voice recognition');
        }
    }
    
    /**
     * Stop voice recognition
     */
    stopVoiceRecognition() {
        if (!this.state.voiceRecognition || !this.state.isListening) {
            return;
        }
        
        try {
            this.state.voiceRecognition.stop();
        } catch (error) {
            console.error('Error stopping voice recognition:', error);
        }
    }
    
    /**
     * Handle voice recognition start
     */
    handleVoiceRecognitionStart() {
        this.state.isListening = true;
        
        // Update UI
        if (this.elements.voiceButton) {
            this.elements.voiceButton.classList.add('voice-input-active');
        }
        
        // Publish event
        this.eventSystem.publish('voice-listening-start', {
            timestamp: Date.now()
        });
        
        // Play sound
        this.playSound('voice-start');
    }
    
    /**
     * Handle voice recognition result
     * @param {Event} event - Recognition result event
     */
    handleVoiceRecognitionResult(event) {
        const result = event.results[0][0].transcript;
        
        // Set recognized text as input
        if (this.elements.userInput) {
            this.elements.userInput.value = result;
        }
        
        // Publish event
        this.eventSystem.publish('voice-result', {
            text: result,
            confidence: event.results[0][0].confidence,
            timestamp: Date.now()
        });
        
        // Send message after a short delay
        setTimeout(() => {
            this.sendUserMessage();
        }, 500);
    }
    
    /**
     * Handle voice recognition error
     * @param {Event} event - Recognition error event
     */
    handleVoiceRecognitionError(event) {
        console.error('Voice recognition error:', event.error);
        
        let errorMessage = 'An error occurred with voice recognition';
        
        switch (event.error) {
            case 'no-speech':
                errorMessage = 'No speech was detected';
                break;
            case 'aborted':
                errorMessage = 'Voice recognition was aborted';
                break;
            case 'audio-capture':
                errorMessage = 'Could not capture audio';
                break;
            case 'network':
                errorMessage = 'Network error occurred';
                break;
            case 'not-allowed':
                errorMessage = 'Microphone access not allowed';
                break;
            case 'service-not-allowed':
                errorMessage = 'Service not allowed';
                break;
            case 'bad-grammar':
                errorMessage = 'Bad grammar configuration';
                break;
            case 'language-not-supported':
                errorMessage = 'Language not supported';
                break;
        }
        
        this.showVoiceError(errorMessage);
        
        // Publish event
        this.eventSystem.publish('voice-error', {
            error: event.error,
            message: errorMessage,
            timestamp: Date.now()
        });
    }
    
    /**
     * Handle voice recognition end
     */
    handleVoiceRecognitionEnd() {
        this.state.isListening = false;
        
        // Update UI
        if (this.elements.voiceButton) {
            this.elements.voiceButton.classList.remove('voice-input-active');
        }
        
        // Publish event
        this.eventSystem.publish('voice-listening-end', {
            timestamp: Date.now()
        });
        
        // Play sound
        this.playSound('voice-end');
    }
    
    /**
     * Show voice error message
     * @param {string} message - Error message
     */
    showVoiceError(message) {
        // Publish error event
        this.eventSystem.publish('voice-error-message', {
            message: message,
            timestamp: Date.now()
        });
        
        // Add system message if needed
        this.eventSystem.publish('system-message', {
            text: `Voice input error: ${message}`,
            type: 'error',
            timestamp: Date.now()
        });
    }
    
    /**
     * Play sound effect
     * @param {string} soundType - Type of sound to play
     */
    playSound(soundType) {
        // Check if sound effects are enabled
        const soundEnabled = localStorage.getItem('sound-effects-enabled') !== 'false';
        
        if (!soundEnabled) {
            return;
        }
        
        // Use AudioContext to generate simple sounds
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            if (soundType === 'send') {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.1);
                
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.1);
            } else if (soundType === 'voice-start') {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(330, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(660, audioContext.currentTime + 0.2);
                
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.2);
            } else if (soundType === 'voice-end') {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(330, audioContext.currentTime + 0.2);
                
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.2);
            }
        } catch (error) {
            console.warn('Error playing sound:', error);
        }
    }
    
    /**
     * Get input history
     * @returns {Array} - Input history
     */
    getInputHistory() {
        return this.state.inputHistory;
    }
    
    /**
     * Check if voice recognition is supported
     * @returns {boolean} - True if supported
     */
    isVoiceRecognitionSupported() {
        return !!this.state.voiceRecognition;
    }
    
    /**
     * Check if voice recognition is currently active
     * @returns {boolean} - True if listening
     */
    isVoiceRecognitionActive() {
        return this.state.isListening;
    }
    
    /**
     * Focus the input field
     */
    focusInput() {
        if (this.elements.userInput) {
            this.elements.userInput.focus();
        }
    }
    
    /**
     * Set input field value
     * @param {string} text - Text to set
     */
    setInputValue(text) {
        if (this.elements.userInput) {
            this.elements.userInput.value = text;
        }
    }
}

// Create singleton instance
const userInputSystem = new UserInputSystem();

// Export the singleton
window.userInputSystem = userInputSystem;
