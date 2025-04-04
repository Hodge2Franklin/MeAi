/**
 * Basic Memory and Context System
 * 
 * This system provides essential memory and context awareness for natural conversations,
 * storing and retrieving relevant information based on conversation flow.
 */

class BasicMemorySystem {
    constructor() {
        // Initialize dependencies
        this.eventSystem = window.eventSystem || this.createEventSystem();
        
        // Initialize state
        this.state = {
            initialized: false,
            conversationHistory: [],
            userProfile: {
                name: null,
                preferences: {},
                topics: {}
            },
            currentContext: {
                topic: null,
                recentMessages: [],
                recentEntities: [],
                activeConversation: false
            },
            maxHistoryLength: 50,
            maxRecentMessages: 5
        };
        
        // Initialize the system
        this.initialize();
    }
    
    /**
     * Initialize the memory system
     */
    initialize() {
        try {
            console.log('Initializing Basic Memory System...');
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load conversation history
            this.loadConversationHistory();
            
            // Load user profile
            this.loadUserProfile();
            
            // Mark as initialized
            this.state.initialized = true;
            
            console.log('Basic Memory System initialized successfully');
            
            return true;
        } catch (error) {
            console.error('Error initializing Basic Memory System:', error);
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
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for user messages
        this.eventSystem.subscribe('user-message', (data) => {
            this.handleUserMessage(data);
        });
        
        // Listen for AI responses
        this.eventSystem.subscribe('ai-response', (data) => {
            this.handleAIResponse(data);
        });
        
        // Listen for clear conversation requests
        this.eventSystem.subscribe('clear-conversation', () => {
            this.clearConversation();
        });
        
        // Listen for user profile updates
        this.eventSystem.subscribe('user-profile-update', (data) => {
            this.updateUserProfile(data);
        });
    }
    
    /**
     * Load conversation history from storage
     */
    loadConversationHistory() {
        try {
            const history = localStorage.getItem('conversation-history');
            if (history) {
                this.state.conversationHistory = JSON.parse(history);
                
                // Update current context with recent messages
                this.updateCurrentContext();
                
                console.log(`Loaded ${this.state.conversationHistory.length} conversation messages from storage`);
            }
        } catch (error) {
            console.error('Error loading conversation history:', error);
            this.state.conversationHistory = [];
        }
    }
    
    /**
     * Save conversation history to storage
     */
    saveConversationHistory() {
        try {
            localStorage.setItem('conversation-history', JSON.stringify(this.state.conversationHistory));
        } catch (error) {
            console.error('Error saving conversation history:', error);
        }
    }
    
    /**
     * Load user profile from storage
     */
    loadUserProfile() {
        try {
            const profile = localStorage.getItem('user-profile');
            if (profile) {
                this.state.userProfile = JSON.parse(profile);
                console.log('Loaded user profile from storage');
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }
    
    /**
     * Save user profile to storage
     */
    saveUserProfile() {
        try {
            localStorage.setItem('user-profile', JSON.stringify(this.state.userProfile));
        } catch (error) {
            console.error('Error saving user profile:', error);
        }
    }
    
    /**
     * Handle user message
     * @param {Object} data - Message data
     */
    handleUserMessage(data) {
        // Add message to history
        const message = {
            id: this.generateMessageId(),
            type: 'user',
            text: data.text,
            timestamp: data.timestamp || Date.now(),
            entities: this.extractEntities(data.text)
        };
        
        this.addMessageToHistory(message);
        
        // Update current context
        this.updateCurrentContext();
        
        // Mark conversation as active
        this.state.currentContext.activeConversation = true;
        
        // Extract and update user information
        this.extractUserInformation(data.text);
    }
    
    /**
     * Handle AI response
     * @param {Object} data - Response data
     */
    handleAIResponse(data) {
        // Add message to history
        const message = {
            id: this.generateMessageId(),
            type: 'ai',
            text: data.text,
            timestamp: data.timestamp || Date.now(),
            entities: this.extractEntities(data.text),
            sentiment: data.sentiment,
            topic: data.topic
        };
        
        this.addMessageToHistory(message);
        
        // Update current context
        this.updateCurrentContext();
        
        // Update topic if provided
        if (data.topic) {
            this.state.currentContext.topic = data.topic;
        }
    }
    
    /**
     * Add message to history
     * @param {Object} message - Message object
     */
    addMessageToHistory(message) {
        // Add to history
        this.state.conversationHistory.push(message);
        
        // Trim history if needed
        if (this.state.conversationHistory.length > this.state.maxHistoryLength) {
            this.state.conversationHistory = this.state.conversationHistory.slice(-this.state.maxHistoryLength);
        }
        
        // Save updated history
        this.saveConversationHistory();
    }
    
    /**
     * Update current context
     */
    updateCurrentContext() {
        // Get recent messages
        const recentMessages = this.state.conversationHistory.slice(-this.state.maxRecentMessages);
        this.state.currentContext.recentMessages = recentMessages;
        
        // Extract recent entities
        const recentEntities = [];
        recentMessages.forEach(message => {
            if (message.entities) {
                message.entities.forEach(entity => {
                    if (!recentEntities.some(e => e.text === entity.text && e.type === entity.type)) {
                        recentEntities.push(entity);
                    }
                });
            }
        });
        this.state.currentContext.recentEntities = recentEntities;
        
        // Determine current topic if not set
        if (!this.state.currentContext.topic && recentMessages.length > 0) {
            this.state.currentContext.topic = this.determineCurrentTopic(recentMessages);
        }
    }
    
    /**
     * Determine current topic from messages
     * @param {Array} messages - Recent messages
     * @returns {string} - Current topic
     */
    determineCurrentTopic(messages) {
        // Simple topic detection based on keyword frequency
        const topicKeywords = {};
        
        messages.forEach(message => {
            const text = message.text.toLowerCase();
            
            // Check for common topics
            const topics = [
                'weather', 'news', 'music', 'movie', 'film', 'book', 'game', 
                'sport', 'food', 'travel', 'health', 'technology', 'science',
                'art', 'history', 'politics', 'education', 'business', 'finance'
            ];
            
            topics.forEach(topic => {
                if (text.includes(topic)) {
                    topicKeywords[topic] = (topicKeywords[topic] || 0) + 1;
                }
            });
            
            // Use existing topic if available
            if (message.topic) {
                topicKeywords[message.topic] = (topicKeywords[message.topic] || 0) + 2;
            }
        });
        
        // Find most frequent topic
        let currentTopic = null;
        let maxCount = 0;
        
        for (const topic in topicKeywords) {
            if (topicKeywords[topic] > maxCount) {
                maxCount = topicKeywords[topic];
                currentTopic = topic;
            }
        }
        
        return currentTopic || 'general';
    }
    
    /**
     * Extract entities from text
     * @param {string} text - Message text
     * @returns {Array} - Extracted entities
     */
    extractEntities(text) {
        const entities = [];
        
        // Simple entity extraction
        
        // Extract names (capitalized words)
        const nameRegex = /\b[A-Z][a-z]+\b/g;
        const names = text.match(nameRegex) || [];
        
        names.forEach(name => {
            // Filter out common sentence starters
            if (!['I', 'The', 'A', 'An', 'This', 'That', 'These', 'Those', 'My', 'Your', 'His', 'Her'].includes(name)) {
                entities.push({
                    type: 'name',
                    text: name,
                    position: text.indexOf(name)
                });
            }
        });
        
        // Extract dates
        const dateRegex = /\b(today|tomorrow|yesterday|monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december)\b/gi;
        const dates = text.match(dateRegex) || [];
        
        dates.forEach(date => {
            entities.push({
                type: 'date',
                text: date,
                position: text.indexOf(date)
            });
        });
        
        // Extract times
        const timeRegex = /\b([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]\b/g;
        const times = text.match(timeRegex) || [];
        
        times.forEach(time => {
            entities.push({
                type: 'time',
                text: time,
                position: text.indexOf(time)
            });
        });
        
        // Extract locations (simple approach)
        const locationPrefixes = ['in', 'at', 'to', 'from'];
        const words = text.split(' ');
        
        for (let i = 0; i < words.length - 1; i++) {
            if (locationPrefixes.includes(words[i].toLowerCase()) && words[i+1].match(/^[A-Z]/)) {
                entities.push({
                    type: 'location',
                    text: words[i+1].replace(/[.,!?;:]$/, ''),
                    position: text.indexOf(words[i+1])
                });
            }
        }
        
        return entities;
    }
    
    /**
     * Extract user information from text
     * @param {string} text - Message text
     */
    extractUserInformation(text) {
        // Extract name
        if (!this.state.userProfile.name) {
            const nameMatches = [
                /my name is ([A-Z][a-z]+)/i,
                /i am ([A-Z][a-z]+)/i,
                /i'm ([A-Z][a-z]+)/i,
                /call me ([A-Z][a-z]+)/i
            ];
            
            for (const regex of nameMatches) {
                const match = text.match(regex);
                if (match && match[1]) {
                    this.state.userProfile.name = match[1];
                    this.saveUserProfile();
                    break;
                }
            }
        }
        
        // Extract preferences
        const likeMatches = [
            /i (?:like|love|enjoy|prefer) ([a-z]+)/i,
            /i'm (?:into|fond of) ([a-z]+)/i,
            /([a-z]+) is my favorite/i
        ];
        
        for (const regex of likeMatches) {
            const match = text.match(regex);
            if (match && match[1]) {
                const preference = match[1].toLowerCase();
                this.state.userProfile.preferences[preference] = true;
                this.saveUserProfile();
            }
        }
        
        const dislikeMatches = [
            /i (?:dislike|hate|don't like|do not like) ([a-z]+)/i,
            /i'm not (?:into|fond of) ([a-z]+)/i,
            /([a-z]+) is not my favorite/i
        ];
        
        for (const regex of dislikeMatches) {
            const match = text.match(regex);
            if (match && match[1]) {
                const preference = match[1].toLowerCase();
                this.state.userProfile.preferences[preference] = false;
                this.saveUserProfile();
            }
        }
        
        // Track topics mentioned
        const topics = [
            'weather', 'news', 'music', 'movie', 'film', 'book', 'game', 
            'sport', 'food', 'travel', 'health', 'technology', 'science',
            'art', 'history', 'politics', 'education', 'business', 'finance'
        ];
        
        const lowerText = text.toLowerCase();
        
        topics.forEach(topic => {
            if (lowerText.includes(topic)) {
                this.state.userProfile.topics[topic] = (this.state.userProfile.topics[topic] || 0) + 1;
                this.saveUserProfile();
            }
        });
    }
    
    /**
     * Update user profile
     * @param {Object} data - Profile data
     */
    updateUserProfile(data) {
        // Update profile with provided data
        if (data.name) {
            this.state.userProfile.name = data.name;
        }
        
        if (data.preferences) {
            this.state.userProfile.preferences = {
                ...this.state.userProfile.preferences,
                ...data.preferences
            };
        }
        
        if (data.topics) {
            this.state.userProfile.topics = {
                ...this.state.userProfile.topics,
                ...data.topics
            };
        }
        
        // Save updated profile
        this.saveUserProfile();
    }
    
    /**
     * Clear conversation
     */
    clearConversation() {
        // Clear history
        this.state.conversationHistory = [];
        
        // Reset context
        this.state.currentContext = {
            topic: null,
            recentMessages: [],
            recentEntities: [],
            activeConversation: false
        };
        
        // Save empty history
        this.saveConversationHistory();
    }
    
    /**
     * Generate unique message ID
     * @returns {string} - Unique ID
     */
    generateMessageId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    /**
     * Get conversation history
     * @param {number} limit - Optional limit
     * @returns {Array} - Conversation history
     */
    getConversationHistory(limit) {
        if (limit) {
            return this.state.conversationHistory.slice(-limit);
        }
        return this.state.conversationHistory;
    }
    
    /**
     * Get current context
     * @returns {Object} - Current context
     */
    getCurrentContext() {
        return this.state.currentContext;
    }
    
    /**
     * Get user profile
     * @returns {Object} - User profile
     */
    getUserProfile() {
        return this.state.userProfile;
    }
    
    /**
     * Get user name
     * @returns {string} - User name or null
     */
    getUserName() {
        return this.state.userProfile.name;
    }
    
    /**
     * Check if user has preference
     * @param {string} preference - Preference to check
     * @returns {boolean|null} - True if liked, false if disliked, null if unknown
     */
    getUserPreference(preference) {
        return this.state.userProfile.preferences[preference] ?? null;
    }
    
    /**
     * Get user's top topics
     * @param {number} limit - Number of topics to return
     * @returns {Array} - Top topics
     */
    getTopTopics(limit = 3) {
        const topics = Object.entries(this.state.userProfile.topics)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(entry => entry[0]);
        
        return topics;
    }
    
    /**
     * Check if conversation is active
     * @returns {boolean} - True if active
     */
    isConversationActive() {
        return this.state.currentContext.activeConversation;
    }
    
    /**
     * Get relevant context for current conversation
     * @returns {Object} - Relevant context
     */
    getRelevantContext() {
        return {
            userName: this.getUserName(),
            currentTopic: this.state.currentContext.topic,
            recentEntities: this.state.currentContext.recentEntities,
            topTopics: this.getTopTopics(),
            messageCount: this.state.conversationHistory.length,
            isActive: this.isConversationActive()
        };
    }
}

// Create singleton instance
const basicMemorySystem = new BasicMemorySystem();

// Export the singleton
window.basicMemorySystem = basicMemorySystem;
