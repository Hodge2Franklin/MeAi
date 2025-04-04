/**
 * Core AI Response System
 * 
 * This system integrates advanced NLU capabilities to provide intelligent,
 * context-aware responses in the MeAI main application.
 */

class CoreAIResponseSystem {
    constructor() {
        // Initialize dependencies
        this.eventSystem = window.eventSystem || this.createEventSystem();
        this.storageManager = window.storageManager || this.createStorageManager();
        
        // Initialize state
        this.state = {
            initialized: false,
            isProcessing: false,
            currentContext: null,
            currentSentiment: null,
            currentTopics: [],
            conversationHistory: [],
            maxHistoryLength: 50
        };
        
        // Response templates for different scenarios
        this.responseTemplates = {
            greeting: [
                "Hello! How can I help you today?",
                "Hi there! What can I assist you with?",
                "Greetings! How may I be of service?",
                "Hello! I'm here to help. What's on your mind?"
            ],
            farewell: [
                "Goodbye! Feel free to chat again anytime.",
                "See you later! Have a great day.",
                "Until next time! Take care.",
                "Farewell! I'll be here when you need me."
            ],
            clarification: [
                "I'm not sure I understood. Could you please rephrase that?",
                "I'd like to help, but I'm having trouble understanding. Can you explain differently?",
                "Could you provide more details about what you're asking?",
                "I want to make sure I help correctly. Can you clarify what you mean?"
            ],
            thinking: [
                "Let me think about that...",
                "Processing your request...",
                "Analyzing that information...",
                "Considering your question..."
            ],
            fallback: [
                "That's an interesting point. Would you like to discuss this further?",
                "I appreciate you sharing that. Is there anything specific you'd like to know?",
                "Thanks for that information. How can I help you with this topic?",
                "I understand. What would you like to know about this subject?"
            ]
        };
        
        // Initialize the system
        this.initialize();
    }
    
    /**
     * Initialize the AI response system
     */
    async initialize() {
        try {
            console.log('Initializing Core AI Response System...');
            
            // Load conversation history from storage
            await this.loadConversationHistory();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Mark as initialized
            this.state.initialized = true;
            
            console.log('Core AI Response System initialized successfully');
            
            return true;
        } catch (error) {
            console.error('Error initializing Core AI Response System:', error);
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
     * Create a simple storage manager if the global one is not available
     */
    createStorageManager() {
        console.warn('Global StorageManager not found, creating local instance');
        return {
            getItem: function(key) {
                try {
                    const item = localStorage.getItem(key);
                    return item ? JSON.parse(item) : null;
                } catch (error) {
                    console.error('Error getting item from storage:', error);
                    return null;
                }
            },
            setItem: function(key, value) {
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                    return true;
                } catch (error) {
                    console.error('Error setting item in storage:', error);
                    return false;
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
            this.processUserMessage(data.text);
        });
        
        // Listen for context updates
        this.eventSystem.subscribe('context-update', (data) => {
            this.state.currentContext = data.context;
        });
        
        // Listen for sentiment updates
        this.eventSystem.subscribe('sentiment-update', (data) => {
            this.state.currentSentiment = data.sentiment;
        });
        
        // Listen for topic updates
        this.eventSystem.subscribe('topics-update', (data) => {
            this.state.currentTopics = data.topics;
        });
        
        // Listen for clear conversation requests
        this.eventSystem.subscribe('clear-conversation', () => {
            this.clearConversationHistory();
        });
    }
    
    /**
     * Load conversation history from storage
     */
    async loadConversationHistory() {
        try {
            const history = this.storageManager.getItem('conversation-history');
            if (history && Array.isArray(history)) {
                this.state.conversationHistory = history.slice(-this.state.maxHistoryLength);
            }
            return true;
        } catch (error) {
            console.error('Error loading conversation history:', error);
            this.state.conversationHistory = [];
            return false;
        }
    }
    
    /**
     * Save conversation history to storage
     */
    async saveConversationHistory() {
        try {
            this.storageManager.setItem('conversation-history', this.state.conversationHistory);
            return true;
        } catch (error) {
            console.error('Error saving conversation history:', error);
            return false;
        }
    }
    
    /**
     * Clear conversation history
     */
    clearConversationHistory() {
        this.state.conversationHistory = [];
        this.saveConversationHistory();
        
        // Publish event to notify other components
        this.eventSystem.publish('conversation-cleared', {
            timestamp: Date.now()
        });
    }
    
    /**
     * Process a user message and generate a response
     * @param {string} message - The user message
     */
    async processUserMessage(message) {
        if (!message || this.state.isProcessing) {
            return;
        }
        
        // Set processing state
        this.state.isProcessing = true;
        
        try {
            // Publish thinking event
            this.eventSystem.publish('ai-thinking', {
                message: this.getRandomResponse('thinking')
            });
            
            // Add user message to history
            this.addToConversationHistory('user', message);
            
            // Analyze message with NLU components if available
            await this.analyzeMessage(message);
            
            // Generate response
            const response = await this.generateResponse(message);
            
            // Add AI response to history
            this.addToConversationHistory('ai', response);
            
            // Publish response event
            this.eventSystem.publish('ai-response', {
                text: response,
                context: this.state.currentContext,
                sentiment: this.state.currentSentiment,
                topics: this.state.currentTopics
            });
            
            // Save updated conversation history
            this.saveConversationHistory();
            
        } catch (error) {
            console.error('Error processing message:', error);
            
            // Publish error event
            this.eventSystem.publish('ai-response-error', {
                error: error.message
            });
            
            // Provide fallback response
            const fallbackResponse = "I'm sorry, I encountered an error processing your message. Could you try again?";
            
            this.eventSystem.publish('ai-response', {
                text: fallbackResponse,
                isError: true
            });
            
        } finally {
            // Reset processing state
            this.state.isProcessing = false;
        }
    }
    
    /**
     * Analyze a message using available NLU components
     * @param {string} message - The message to analyze
     */
    async analyzeMessage(message) {
        // Check for advanced NLU components and use them if available
        
        // Context awareness
        if (window.contextAwarenessSystem) {
            try {
                const contextResult = await this.analyzeContext(message);
                this.state.currentContext = contextResult;
            } catch (error) {
                console.warn('Error analyzing context:', error);
            }
        }
        
        // Sentiment analysis
        if (window.sentimentAnalysisSystem) {
            try {
                const sentimentResult = await this.analyzeSentiment(message);
                this.state.currentSentiment = sentimentResult;
            } catch (error) {
                console.warn('Error analyzing sentiment:', error);
            }
        }
        
        // Topic modeling
        if (window.topicModelingSystem) {
            try {
                const topicsResult = await this.analyzeTopics(message);
                this.state.currentTopics = topicsResult;
            } catch (error) {
                console.warn('Error analyzing topics:', error);
            }
        }
        
        // If advanced NLU is not available, use basic analysis
        if (!window.contextAwarenessSystem && !window.sentimentAnalysisSystem && !window.topicModelingSystem) {
            this.performBasicAnalysis(message);
        }
    }
    
    /**
     * Analyze context using context awareness system
     * @param {string} message - The message to analyze
     * @returns {Promise<Object>} - Context analysis result
     */
    async analyzeContext(message) {
        return new Promise((resolve) => {
            const requestId = `context_${Date.now()}`;
            
            // Set up one-time listener for response
            const unsubscribe = this.eventSystem.subscribe('context-analysis-response', (data) => {
                if (data.requestId === requestId) {
                    unsubscribe();
                    resolve(data.context);
                }
            });
            
            // Request context analysis
            this.eventSystem.publish('context-analysis-request', {
                requestId: requestId,
                text: message
            });
            
            // Set timeout for response
            setTimeout(() => {
                unsubscribe();
                resolve({
                    confidence: 0.5,
                    references: {},
                    entities: {}
                });
            }, 1000);
        });
    }
    
    /**
     * Analyze sentiment using sentiment analysis system
     * @param {string} message - The message to analyze
     * @returns {Promise<Object>} - Sentiment analysis result
     */
    async analyzeSentiment(message) {
        return new Promise((resolve) => {
            const requestId = `sentiment_${Date.now()}`;
            
            // Set up one-time listener for response
            const unsubscribe = this.eventSystem.subscribe('sentiment-analysis-response', (data) => {
                if (data.requestId === requestId) {
                    unsubscribe();
                    resolve(data.sentiment);
                }
            });
            
            // Request sentiment analysis
            this.eventSystem.publish('sentiment-analysis-request', {
                requestId: requestId,
                text: message
            });
            
            // Set timeout for response
            setTimeout(() => {
                unsubscribe();
                resolve({
                    positive: 0.5,
                    negative: 0.5,
                    neutral: 0.0,
                    compound: 0.0
                });
            }, 1000);
        });
    }
    
    /**
     * Analyze topics using topic modeling system
     * @param {string} message - The message to analyze
     * @returns {Promise<Array>} - Topic analysis result
     */
    async analyzeTopics(message) {
        return new Promise((resolve) => {
            const requestId = `topics_${Date.now()}`;
            
            // Set up one-time listener for response
            const unsubscribe = this.eventSystem.subscribe('topic-detection-response', (data) => {
                if (data.requestId === requestId) {
                    unsubscribe();
                    resolve(data.topics);
                }
            });
            
            // Request topic detection
            this.eventSystem.publish('topic-detection-request', {
                requestId: requestId,
                text: message
            });
            
            // Set timeout for response
            setTimeout(() => {
                unsubscribe();
                resolve([]);
            }, 1000);
        });
    }
    
    /**
     * Perform basic analysis when advanced NLU is not available
     * @param {string} message - The message to analyze
     */
    performBasicAnalysis(message) {
        const messageLower = message.toLowerCase();
        
        // Basic context analysis
        this.state.currentContext = {
            confidence: 0.5,
            references: {},
            entities: {}
        };
        
        // Basic sentiment analysis
        const positiveWords = ['good', 'great', 'excellent', 'amazing', 'happy', 'love', 'like', 'enjoy', 'thanks', 'thank'];
        const negativeWords = ['bad', 'terrible', 'awful', 'sad', 'unhappy', 'hate', 'dislike', 'sorry', 'problem', 'issue'];
        
        let positiveCount = 0;
        let negativeCount = 0;
        
        positiveWords.forEach(word => {
            if (messageLower.includes(word)) positiveCount++;
        });
        
        negativeWords.forEach(word => {
            if (messageLower.includes(word)) negativeCount++;
        });
        
        const total = positiveCount + negativeCount || 1;
        
        this.state.currentSentiment = {
            positive: positiveCount / total,
            negative: negativeCount / total,
            neutral: 1 - ((positiveCount + negativeCount) / total),
            compound: (positiveCount - negativeCount) / total
        };
        
        // Basic topic detection
        const topics = [];
        
        if (messageLower.includes('weather') || messageLower.includes('temperature') || messageLower.includes('rain')) {
            topics.push({ name: 'weather', confidence: 0.8 });
        }
        
        if (messageLower.includes('music') || messageLower.includes('song') || messageLower.includes('listen')) {
            topics.push({ name: 'music', confidence: 0.8 });
        }
        
        if (messageLower.includes('movie') || messageLower.includes('film') || messageLower.includes('watch')) {
            topics.push({ name: 'movies', confidence: 0.8 });
        }
        
        if (messageLower.includes('food') || messageLower.includes('eat') || messageLower.includes('restaurant')) {
            topics.push({ name: 'food', confidence: 0.8 });
        }
        
        if (messageLower.includes('help') || messageLower.includes('assist') || messageLower.includes('support')) {
            topics.push({ name: 'assistance', confidence: 0.9 });
        }
        
        this.state.currentTopics = topics;
    }
    
    /**
     * Generate a response based on the user message and analysis results
     * @param {string} message - The user message
     * @returns {Promise<string>} - The generated response
     */
    async generateResponse(message) {
        const messageLower = message.toLowerCase();
        
        // Check for greetings
        if (this.isGreeting(messageLower)) {
            return this.getRandomResponse('greeting');
        }
        
        // Check for farewells
        if (this.isFarewell(messageLower)) {
            return this.getRandomResponse('farewell');
        }
        
        // Check for questions about MeAI
        if (this.isAboutMeAI(messageLower)) {
            return this.getAboutMeAIResponse();
        }
        
        // Check for help requests
        if (this.isHelpRequest(messageLower)) {
            return this.getHelpResponse();
        }
        
        // Check for thanks
        if (this.isThanks(messageLower)) {
            return this.getThanksResponse();
        }
        
        // Check for jokes
        if (this.isJokeRequest(messageLower)) {
            return this.getRandomJoke();
        }
        
        // Use advanced NLU if available
        if (window.advancedNLUSystem) {
            try {
                return await this.getAdvancedResponse(message);
            } catch (error) {
                console.warn('Error getting advanced response:', error);
                // Fall back to basic response
            }
        }
        
        // Generate response based on sentiment and topics
        if (this.state.currentSentiment && this.state.currentSentiment.negative > 0.7) {
            return this.getEmpathicResponse();
        }
        
        if (this.state.currentTopics && this.state.currentTopics.length > 0) {
            return this.getTopicBasedResponse(this.state.currentTopics[0].name);
        }
        
        // Default response
        return this.getRandomResponse('fallback');
    }
    
    /**
     * Get a response using the advanced NLU system
     * @param {string} message - The user message
     * @returns {Promise<string>} - The generated response
     */
    async getAdvancedResponse(message) {
        return new Promise((resolve) => {
            const requestId = `response_${Date.now()}`;
            
            // Set up one-time listener for response
            const unsubscribe = this.eventSystem.subscribe('nlu-response-generation', (data) => {
                if (data.requestId === requestId) {
                    unsubscribe();
                    resolve(data.response);
                }
            });
            
            // Request response generation
            this.eventSystem.publish('nlu-generate-response', {
                requestId: requestId,
                text: message,
                context: this.state.currentContext,
                sentiment: this.state.currentSentiment,
                topics: this.state.currentTopics,
                history: this.state.conversationHistory.slice(-5)
            });
            
            // Set timeout for response
            setTimeout(() => {
                unsubscribe();
                resolve(this.getRandomResponse('fallback'));
            }, 2000);
        });
    }
    
    /**
     * Check if a message is a greeting
     * @param {string} messageLower - Lowercase message
     * @returns {boolean} - True if greeting
     */
    isGreeting(messageLower) {
        const greetings = ['hello', 'hi', 'hey', 'greetings', 'howdy', 'hola', 'good morning', 'good afternoon', 'good evening'];
        return greetings.some(greeting => messageLower.includes(greeting));
    }
    
    /**
     * Check if a message is a farewell
     * @param {string} messageLower - Lowercase message
     * @returns {boolean} - True if farewell
     */
    isFarewell(messageLower) {
        const farewells = ['bye', 'goodbye', 'see you', 'farewell', 'adios', 'cya', 'talk to you later', 'ttyl'];
        return farewells.some(farewell => messageLower.includes(farewell));
    }
    
    /**
     * Check if a message is about MeAI
     * @param {string} messageLower - Lowercase message
     * @returns {boolean} - True if about MeAI
     */
    isAboutMeAI(messageLower) {
        const aboutPhrases = ['who are you', 'what are you', 'tell me about yourself', 'your name', 'what can you do', 'your capabilities'];
        return aboutPhrases.some(phrase => messageLower.includes(phrase));
    }
    
    /**
     * Check if a message is a help request
     * @param {string} messageLower - Lowercase message
     * @returns {boolean} - True if help request
     */
    isHelpRequest(messageLower) {
        const helpPhrases = ['help', 'assist', 'support', 'how do i', 'how to', 'what should i do'];
        return helpPhrases.some(phrase => messageLower.includes(phrase));
    }
    
    /**
     * Check if a message is expressing thanks
     * @param {string} messageLower - Lowercase message
     * @returns {boolean} - True if thanks
     */
    isThanks(messageLower) {
        const thanksPhrases = ['thank', 'thanks', 'appreciate', 'grateful'];
        return thanksPhrases.some(phrase => messageLower.includes(phrase));
    }
    
    /**
     * Check if a message is requesting a joke
     * @param {string} messageLower - Lowercase message
     * @returns {boolean} - True if joke request
     */
    isJokeRequest(messageLower) {
        const jokePhrases = ['joke', 'funny', 'make me laugh', 'tell me something funny'];
        return jokePhrases.some(phrase => messageLower.includes(phrase));
    }
    
    /**
     * Get a response about MeAI
     * @returns {string} - Response about MeAI
     */
    getAboutMeAIResponse() {
        const responses = [
            "I'm MeAI, an AI assistant designed to have natural conversations and help with various tasks. I can understand context, recognize emotions, and remember important information from our conversations.",
            "My name is MeAI. I'm an artificial intelligence assistant created to provide helpful, natural conversations. I'm designed to understand context, recognize emotions, and remember important details.",
            "I'm an AI assistant called MeAI. I'm here to chat with you, answer questions, and provide assistance. I can understand the context of our conversation and respond appropriately.",
            "I'm MeAI, your friendly AI assistant. I'm designed to have natural conversations, understand context, and provide helpful responses. I'm constantly learning and improving to serve you better."
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    /**
     * Get a help response
     * @returns {string} - Help response
     */
    getHelpResponse() {
        const responses = [
            "I can help with a variety of tasks! I can answer questions, have conversations, provide information on different topics, tell jokes, and more. What would you like help with?",
            "I'm here to assist you! I can chat about various topics, answer questions, provide information, or just have a friendly conversation. What can I help you with today?",
            "I'd be happy to help! I can answer questions, discuss different subjects, provide information, or just chat. What would you like assistance with?",
            "I'm at your service! I can help by answering questions, discussing topics of interest, providing information, or just having a conversation. What do you need help with?"
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    /**
     * Get a response to thanks
     * @returns {string} - Thanks response
     */
    getThanksResponse() {
        const responses = [
            "You're welcome! I'm happy to help.",
            "Glad I could assist! Is there anything else you'd like to know?",
            "My pleasure! I'm here whenever you need assistance.",
            "You're very welcome. Feel free to ask if you need anything else."
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    /**
     * Get a random joke
     * @returns {string} - Random joke
     */
    getRandomJoke() {
        const jokes = [
            "Why don't scientists trust atoms? Because they make up everything!",
            "Why did the scarecrow win an award? Because he was outstanding in his field!",
            "What do you call a fake noodle? An impasta!",
            "How does a penguin build its house? Igloos it together!",
            "Why don't eggs tell jokes? They'd crack each other up!",
            "What's the best thing about Switzerland? I don't know, but the flag is a big plus!",
            "Did you hear about the mathematician who's afraid of negative numbers? He'll stop at nothing to avoid them!",
            "Why was the math book sad? Because it had too many problems!",
            "What do you call a parade of rabbits hopping backwards? A receding hare-line!",
            "What's orange and sounds like a parrot? A carrot!"
        ];
        
        return jokes[Math.floor(Math.random() * jokes.length)];
    }
    
    /**
     * Get an empathic response for negative sentiment
     * @returns {string} - Empathic response
     */
    getEmpathicResponse() {
        const responses = [
            "I'm sorry to hear that. Would you like to talk more about what's bothering you?",
            "That sounds difficult. I'm here to listen if you want to share more.",
            "I understand that can be frustrating. Is there any way I can help?",
            "I'm sorry you're feeling that way. Would it help to discuss it further?"
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    /**
     * Get a response based on detected topic
     * @param {string} topic - Detected topic
     * @returns {string} - Topic-based response
     */
    getTopicBasedResponse(topic) {
        const topicResponses = {
            'weather': [
                "The weather is always an interesting topic! What's it like where you are?",
                "Weather can have such an impact on our mood. What kind of weather do you prefer?",
                "I wish I could check the weather for you, but I don't have access to real-time data in this version.",
                "Weather patterns are fascinating to study. Are you interested in meteorology?"
            ],
            'music': [
                "Music can be so powerful! What kind of music do you enjoy listening to?",
                "I find music fascinating - it can evoke such strong emotions. Do you have a favorite artist?",
                "Music is a universal language. What genres do you typically listen to?",
                "If I could listen to music, I'd probably enjoy a bit of everything. What about you?"
            ],
            'movies': [
                "Movies are a great way to escape reality for a while. Do you have a favorite film?",
                "The art of filmmaking is so complex and interesting. What kinds of movies do you enjoy?",
                "I find storytelling through film fascinating. Have you seen any good movies lately?",
                "Movies can be so impactful. Is there a film that changed your perspective on something?"
            ],
            'food': [
                "Food is such an important part of culture and daily life. Do you enjoy cooking?",
                "Talking about food always makes me wish I could eat! What's your favorite cuisine?",
                "Food brings people together in such a special way. Do you have a favorite dish?",
                "The world of culinary arts is so diverse and creative. What kinds of foods do you enjoy most?"
            ],
            'assistance': [
                "I'm here to help! What can I assist you with specifically?",
                "I'd be happy to help you. Could you tell me more about what you need?",
                "Helping is what I'm designed for. What kind of assistance are you looking for?",
                "I'm ready to assist! What would you like help with today?"
            ]
        };
        
        // Default to fallback if topic not recognized
        if (!topicResponses[topic]) {
            return this.getRandomResponse('fallback');
        }
        
        const responses = topicResponses[topic];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    /**
     * Get a random response from a template category
     * @param {string} category - Template category
     * @returns {string} - Random response from category
     */
    getRandomResponse(category) {
        const templates = this.responseTemplates[category] || this.responseTemplates.fallback;
        return templates[Math.floor(Math.random() * templates.length)];
    }
    
    /**
     * Add a message to conversation history
     * @param {string} sender - Message sender ('user' or 'ai')
     * @param {string} text - Message text
     */
    addToConversationHistory(sender, text) {
        // Add message to history
        this.state.conversationHistory.push({
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            sender: sender,
            text: text,
            timestamp: Date.now(),
            context: sender === 'user' ? null : this.state.currentContext,
            sentiment: sender === 'user' ? this.state.currentSentiment : null,
            topics: sender === 'user' ? this.state.currentTopics : null
        });
        
        // Trim history if needed
        if (this.state.conversationHistory.length > this.state.maxHistoryLength) {
            this.state.conversationHistory = this.state.conversationHistory.slice(-this.state.maxHistoryLength);
        }
    }
    
    /**
     * Get the current conversation history
     * @returns {Array} - Conversation history
     */
    getConversationHistory() {
        return this.state.conversationHistory;
    }
}

// Create singleton instance
const coreAIResponseSystem = new CoreAIResponseSystem();

// Export the singleton
window.coreAIResponseSystem = coreAIResponseSystem;
