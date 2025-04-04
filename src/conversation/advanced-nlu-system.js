/**
 * Advanced Natural Language Understanding System
 * 
 * This system enhances MeAI's language understanding capabilities with
 * advanced context awareness, sentiment analysis, and topic modeling.
 */

class AdvancedNLUSystem {
    constructor() {
        // Initialize dependencies
        this.eventSystem = window.eventSystem;
        this.storageManager = window.storageManager;
        this.contextualMemory = window.contextualMemorySystem;
        this.longTermMemory = window.longTermMemorySystem;
        
        // Initialize subsystems
        this.contextAwareness = null;
        this.sentimentAnalysis = null;
        this.topicModeling = null;
        
        // Configuration
        this.config = {
            contextHistoryLength: 10,
            sentimentAnalysisThreshold: 0.6,
            topicExtractionMinWords: 3,
            confidenceThreshold: 0.7,
            maxTopicsPerConversation: 5
        };
        
        // State
        this.state = {
            initialized: false,
            activeContext: null,
            currentSentiment: {
                positive: 0.5,
                negative: 0.5,
                neutral: 0.0,
                compound: 0.0
            },
            currentTopics: [],
            processingQueue: []
        };
        
        // Initialize the system
        this.initialize();
    }
    
    /**
     * Initialize the NLU system and its components
     */
    async initialize() {
        try {
            console.log('Initializing Advanced NLU System...');
            
            // Load configuration from storage if available
            const storedConfig = await this.storageManager.getIndexedDB('config', 'nlu-system');
            if (storedConfig) {
                this.config = {...this.config, ...storedConfig};
            }
            
            // Initialize context awareness system
            this.contextAwareness = new ContextAwarenessSystem(this.config);
            await this.contextAwareness.initialize();
            
            // Initialize sentiment analysis system
            this.sentimentAnalysis = new SentimentAnalysisSystem(this.config);
            await this.sentimentAnalysis.initialize();
            
            // Initialize topic modeling system
            this.topicModeling = new TopicModelingSystem(this.config);
            await this.topicModeling.initialize();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Mark as initialized
            this.state.initialized = true;
            
            console.log('Advanced NLU System initialized successfully');
            
            // Publish initialization event
            this.eventSystem.publish('nlu-system-ready', {
                status: 'ready',
                capabilities: [
                    'context-awareness',
                    'sentiment-analysis',
                    'topic-modeling'
                ]
            });
            
        } catch (error) {
            console.error('Error initializing Advanced NLU System:', error);
            
            // Publish error event
            this.eventSystem.publish('nlu-system-error', {
                status: 'error',
                error: error.message
            });
        }
    }
    
    /**
     * Set up event listeners for the NLU system
     */
    setupEventListeners() {
        // Listen for new user messages
        this.eventSystem.subscribe('conversation-new-message', (data) => {
            if (data.sender === 'user') {
                this.processUserMessage(data);
            }
        });
        
        // Listen for context retrieval requests
        this.eventSystem.subscribe('context-retrieval-request', (data) => {
            this.retrieveContext(data.query).then(context => {
                this.eventSystem.publish('context-retrieval-response', {
                    requestId: data.requestId,
                    context: context
                });
            });
        });
        
        // Listen for sentiment analysis requests
        this.eventSystem.subscribe('sentiment-analysis-request', (data) => {
            this.analyzeSentiment(data.text).then(sentiment => {
                this.eventSystem.publish('sentiment-analysis-response', {
                    requestId: data.requestId,
                    sentiment: sentiment
                });
            });
        });
        
        // Listen for topic extraction requests
        this.eventSystem.subscribe('topic-extraction-request', (data) => {
            this.extractTopics(data.text).then(topics => {
                this.eventSystem.publish('topic-extraction-response', {
                    requestId: data.requestId,
                    topics: topics
                });
            });
        });
    }
    
    /**
     * Process a new user message through all NLU components
     * @param {Object} messageData - The message data
     */
    async processUserMessage(messageData) {
        try {
            // Add to processing queue
            this.state.processingQueue.push(messageData);
            
            // Process context
            const contextResult = await this.contextAwareness.processMessage(messageData);
            this.state.activeContext = contextResult.activeContext;
            
            // Process sentiment
            const sentimentResult = await this.sentimentAnalysis.analyzeSentiment(messageData.content);
            this.state.currentSentiment = sentimentResult;
            
            // Process topics
            const topicsResult = await this.topicModeling.extractTopics(messageData.content);
            this.state.currentTopics = topicsResult.topics;
            
            // Remove from processing queue
            this.state.processingQueue = this.state.processingQueue.filter(
                item => item.id !== messageData.id
            );
            
            // Publish NLU results
            this.eventSystem.publish('nlu-processing-complete', {
                messageId: messageData.id,
                context: this.state.activeContext,
                sentiment: this.state.currentSentiment,
                topics: this.state.currentTopics
            });
            
        } catch (error) {
            console.error('Error processing message in NLU system:', error);
            
            // Remove from processing queue
            this.state.processingQueue = this.state.processingQueue.filter(
                item => item.id !== messageData.id
            );
            
            // Publish error event
            this.eventSystem.publish('nlu-processing-error', {
                messageId: messageData.id,
                error: error.message
            });
        }
    }
    
    /**
     * Retrieve context based on a query
     * @param {string} query - The query to retrieve context for
     * @returns {Promise<Object>} - The retrieved context
     */
    async retrieveContext(query) {
        return this.contextAwareness.retrieveContext(query);
    }
    
    /**
     * Analyze sentiment of a text
     * @param {string} text - The text to analyze
     * @returns {Promise<Object>} - The sentiment analysis result
     */
    async analyzeSentiment(text) {
        return this.sentimentAnalysis.analyzeSentiment(text);
    }
    
    /**
     * Extract topics from a text
     * @param {string} text - The text to extract topics from
     * @returns {Promise<Object>} - The topic extraction result
     */
    async extractTopics(text) {
        return this.topicModeling.extractTopics(text);
    }
    
    /**
     * Get the current state of the NLU system
     * @returns {Object} - The current state
     */
    getState() {
        return {
            initialized: this.state.initialized,
            activeContext: this.state.activeContext,
            currentSentiment: this.state.currentSentiment,
            currentTopics: this.state.currentTopics,
            processingQueue: this.state.processingQueue.length
        };
    }
}

// Create singleton instance
const advancedNLUSystem = new AdvancedNLUSystem();

// Export the singleton
window.advancedNLUSystem = advancedNLUSystem;
