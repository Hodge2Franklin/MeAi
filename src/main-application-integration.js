/**
 * Main Application Integration System
 * 
 * This system integrates all components of the MeAI application into a cohesive whole,
 * connecting the conversation interface, AI response system, user input handling,
 * visual feedback, memory system, and advanced features.
 */

class MainApplicationIntegration {
    constructor() {
        // Initialize state
        this.state = {
            initialized: false,
            componentsLoaded: {
                coreAI: false,
                userInput: false,
                visualFeedback: false,
                memorySystem: false,
                advancedFeatures: false
            },
            advancedFeaturesAvailable: {
                threeD: false,
                longTermMemory: false,
                spatialAudio: false,
                advancedProfiles: false
            }
        };
        
        // Initialize the system
        this.initialize();
    }
    
    /**
     * Initialize the integration system
     */
    initialize() {
        try {
            console.log('Initializing Main Application Integration...');
            
            // Create event system if not exists
            window.eventSystem = window.eventSystem || this.createEventSystem();
            
            // Initialize core components
            this.initializeComponents();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Check for advanced features
            this.detectAdvancedFeatures();
            
            // Mark as initialized
            this.state.initialized = true;
            
            console.log('Main Application Integration initialized successfully');
            
            // Publish initialization complete event
            window.eventSystem.publish('app-initialized', {
                timestamp: Date.now(),
                advancedFeatures: this.state.advancedFeaturesAvailable
            });
            
            return true;
        } catch (error) {
            console.error('Error initializing Main Application Integration:', error);
            return false;
        }
    }
    
    /**
     * Create event system
     */
    createEventSystem() {
        console.log('Creating global event system');
        
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
     * Initialize core components
     */
    initializeComponents() {
        // Load core components
        this.loadScript('/src/conversation/core-ai-response-system.js', () => {
            this.state.componentsLoaded.coreAI = true;
            this.checkAllComponentsLoaded();
        });
        
        this.loadScript('/src/conversation/user-input-system.js', () => {
            this.state.componentsLoaded.userInput = true;
            this.checkAllComponentsLoaded();
        });
        
        this.loadScript('/src/visual/essential-visual-feedback.js', () => {
            this.state.componentsLoaded.visualFeedback = true;
            this.checkAllComponentsLoaded();
        });
        
        this.loadScript('/src/conversation/basic-memory-system.js', () => {
            this.state.componentsLoaded.memorySystem = true;
            this.checkAllComponentsLoaded();
        });
    }
    
    /**
     * Load script
     * @param {string} src - Script source
     * @param {Function} callback - Callback function
     */
    loadScript(src, callback) {
        const script = document.createElement('script');
        script.src = src;
        script.onload = callback;
        script.onerror = (error) => {
            console.error(`Error loading script ${src}:`, error);
            callback();
        };
        document.head.appendChild(script);
    }
    
    /**
     * Check if all components are loaded
     */
    checkAllComponentsLoaded() {
        const { coreAI, userInput, visualFeedback, memorySystem } = this.state.componentsLoaded;
        
        if (coreAI && userInput && visualFeedback && memorySystem) {
            console.log('All core components loaded');
            
            // Initialize advanced features
            this.initializeAdvancedFeatures();
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for user messages
        window.eventSystem.subscribe('user-message', (data) => {
            // Publish AI thinking event
            window.eventSystem.publish('ai-thinking', {
                timestamp: Date.now()
            });
            
            // Process message with AI response system
            setTimeout(() => {
                if (window.coreAIResponseSystem) {
                    window.coreAIResponseSystem.processUserMessage(data);
                } else {
                    this.fallbackProcessMessage(data);
                }
            }, 500);
        });
        
        // Listen for settings changes
        window.eventSystem.subscribe('settings-updated', (data) => {
            this.handleSettingsUpdate(data);
        });
        
        // Listen for advanced feature detection
        window.eventSystem.subscribe('advanced-feature-detected', (data) => {
            this.handleAdvancedFeatureDetection(data);
        });
    }
    
    /**
     * Detect advanced features
     */
    detectAdvancedFeatures() {
        // Check for 3D visualization
        if (window.pixelVisualization3D || 
            (typeof THREE !== 'undefined' && document.getElementById('visualization-container'))) {
            this.state.advancedFeaturesAvailable.threeD = true;
        }
        
        // Check for long-term memory
        if (window.longTermMemorySystem || 
            (window.indexedDB && document.getElementById('memory-visualization'))) {
            this.state.advancedFeaturesAvailable.longTermMemory = true;
        }
        
        // Check for spatial audio
        if (window.spatialAudioSystem || 
            (window.AudioContext && document.getElementById('audio-container'))) {
            this.state.advancedFeaturesAvailable.spatialAudio = true;
        }
        
        // Check for advanced profiles
        if (window.advancedUserProfileSystem || 
            (localStorage.getItem('advanced-user-profile'))) {
            this.state.advancedFeaturesAvailable.advancedProfiles = true;
        }
        
        console.log('Advanced features detected:', this.state.advancedFeaturesAvailable);
    }
    
    /**
     * Initialize advanced features
     */
    initializeAdvancedFeatures() {
        // Load advanced features if available
        if (this.state.advancedFeaturesAvailable.threeD) {
            this.loadScript('/src/visual/pixel-visualization-3d.js', () => {
                console.log('3D visualization loaded');
            });
        }
        
        if (this.state.advancedFeaturesAvailable.longTermMemory) {
            this.loadScript('/src/conversation/long-term-memory-system.js', () => {
                console.log('Long-term memory system loaded');
            });
        }
        
        if (this.state.advancedFeaturesAvailable.spatialAudio) {
            this.loadScript('/src/audio/spatial-audio-system.js', () => {
                console.log('Spatial audio system loaded');
            });
        }
        
        if (this.state.advancedFeaturesAvailable.advancedProfiles) {
            this.loadScript('/src/utils/advanced-user-profile-system.js', () => {
                console.log('Advanced user profile system loaded');
            });
        }
        
        // Mark advanced features as loaded
        this.state.componentsLoaded.advancedFeatures = true;
        
        // Publish event
        window.eventSystem.publish('advanced-features-loaded', {
            timestamp: Date.now(),
            features: this.state.advancedFeaturesAvailable
        });
    }
    
    /**
     * Handle settings update
     * @param {Object} data - Settings data
     */
    handleSettingsUpdate(data) {
        // Handle advanced features settings
        if (data.useAdvancedFeatures !== undefined) {
            if (data.useAdvancedFeatures) {
                this.initializeAdvancedFeatures();
            }
        }
    }
    
    /**
     * Handle advanced feature detection
     * @param {Object} data - Feature data
     */
    handleAdvancedFeatureDetection(data) {
        if (data.feature && data.available !== undefined) {
            this.state.advancedFeaturesAvailable[data.feature] = data.available;
            
            console.log(`Advanced feature ${data.feature} ${data.available ? 'detected' : 'not available'}`);
        }
    }
    
    /**
     * Fallback message processing
     * @param {Object} data - Message data
     */
    fallbackProcessMessage(data) {
        console.warn('Core AI Response System not available, using fallback');
        
        // Simple fallback response
        const responses = [
            "I'm here to help. What would you like to know?",
            "How can I assist you today?",
            "I'm MeAI, your AI assistant. What can I do for you?",
            "I'm processing your message. How else can I help?",
            "I understand. Is there anything specific you'd like to know?"
        ];
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        
        // Publish AI response
        window.eventSystem.publish('ai-response', {
            text: response,
            timestamp: Date.now()
        });
    }
}

// Create singleton instance
const mainApplicationIntegration = new MainApplicationIntegration();

// Export the singleton
window.mainApplicationIntegration = mainApplicationIntegration;
