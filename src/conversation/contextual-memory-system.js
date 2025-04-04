/**
 * Advanced Contextual Memory System
 * 
 * This system provides persistent memory capabilities across conversations,
 * with memory prioritization, contextual retrieval, and user preference tracking.
 */

class ContextualMemorySystem {
    constructor() {
        // Initialize dependencies
        this.storageManager = window.storageManager;
        this.eventSystem = window.eventSystem;
        
        // Memory structure
        this.shortTermMemory = []; // Current conversation, cleared on session end
        this.mediumTermMemory = []; // Recent conversations, persists for a few days
        this.longTermMemory = []; // Important memories, persists indefinitely
        
        // Memory configuration
        this.shortTermCapacity = 50; // Max items in short-term memory
        this.mediumTermCapacity = 200; // Max items in medium-term memory
        this.longTermCapacity = 500; // Max items in long-term memory
        
        // Importance thresholds
        this.mediumTermThreshold = 0.3; // Min importance to move to medium-term
        this.longTermThreshold = 0.7; // Min importance to move to long-term
        
        // User preferences
        this.userPreferences = {};
        
        // Initialize
        this.initialize();
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    /**
     * Initialize the memory system
     */
    async initialize() {
        try {
            // Load memories from storage
            await this.loadMemories();
            
            // Load user preferences
            await this.loadUserPreferences();
            
            console.log('Contextual Memory System initialized');
            
            // Notify system that memory is ready
            this.eventSystem.publish('memory-system-ready', {
                shortTermCount: this.shortTermMemory.length,
                mediumTermCount: this.mediumTermMemory.length,
                longTermCount: this.longTermMemory.length
            });
        } catch (error) {
            console.error('Error initializing memory system:', error);
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for new messages
        this.eventSystem.subscribe('conversation-new-message', (data) => {
            this.addMemory(data);
        });
        
        // Listen for user preference updates
        this.eventSystem.subscribe('user-preference-update', (data) => {
            this.updateUserPreference(data.key, data.value);
        });
        
        // Listen for session end
        this.eventSystem.subscribe('session-end', () => {
            this.processEndOfSession();
        });
        
        // Listen for memory retrieval requests
        this.eventSystem.subscribe('memory-retrieval-request', (data) => {
            this.retrieveMemories(data.context, data.limit).then(memories => {
                this.eventSystem.publish('memory-retrieval-response', {
                    requestId: data.requestId,
                    memories: memories
                });
            });
        });
    }
    
    /**
     * Load memories from persistent storage
     */
    async loadMemories() {
        try {
            // Load medium-term memory
            const mediumTerm = await this.storageManager.getIndexedDB('memory', 'medium-term');
            if (mediumTerm && mediumTerm.items) {
                this.mediumTermMemory = mediumTerm.items;
                
                // Filter out expired medium-term memories
                const now = Date.now();
                this.mediumTermMemory = this.mediumTermMemory.filter(memory => {
                    const age = now - memory.timestamp;
                    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
                    return age < maxAge;
                });
            }
            
            // Load long-term memory
            const longTerm = await this.storageManager.getIndexedDB('memory', 'long-term');
            if (longTerm && longTerm.items) {
                this.longTermMemory = longTerm.items;
            }
            
            // Load short-term memory (from session storage)
            const shortTerm = this.storageManager.getSessionStorage('short-term-memory', []);
            if (shortTerm) {
                this.shortTermMemory = shortTerm;
            }
        } catch (error) {
            console.error('Error loading memories:', error);
            // Initialize with empty arrays if loading fails
            this.shortTermMemory = [];
            this.mediumTermMemory = [];
            this.longTermMemory = [];
        }
    }
    
    /**
     * Load user preferences from storage
     */
    async loadUserPreferences() {
        try {
            const preferences = await this.storageManager.getIndexedDB('preferences', 'user-preferences');
            if (preferences) {
                this.userPreferences = preferences;
            } else {
                // Initialize with default preferences
                this.userPreferences = {
                    id: 'user-preferences',
                    theme: 'default',
                    voiceVolume: 0.8,
                    ambientVolume: 0.5,
                    reducedMotion: false,
                    highContrast: false,
                    fontSize: 'medium',
                    lastVisit: Date.now()
                };
                
                // Save default preferences
                await this.storageManager.setIndexedDB('preferences', this.userPreferences);
            }
        } catch (error) {
            console.error('Error loading user preferences:', error);
            // Initialize with default preferences
            this.userPreferences = {
                id: 'user-preferences',
                theme: 'default',
                voiceVolume: 0.8,
                ambientVolume: 0.5,
                reducedMotion: false,
                highContrast: false,
                fontSize: 'medium',
                lastVisit: Date.now()
            };
        }
    }
    
    /**
     * Add a new memory item
     * @param {Object} data - Memory data to add
     */
    addMemory(data) {
        // Create memory object
        const memory = {
            id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            type: data.type || 'message',
            content: data.content,
            sender: data.sender,
            importance: this.calculateImportance(data),
            context: data.context || {},
            references: data.references || []
        };
        
        // Add to short-term memory
        this.shortTermMemory.push(memory);
        
        // Trim short-term memory if needed
        if (this.shortTermMemory.length > this.shortTermCapacity) {
            this.shortTermMemory.shift();
        }
        
        // Save short-term memory to session storage
        this.storageManager.setSessionStorage('short-term-memory', this.shortTermMemory);
        
        // Check if memory should be immediately added to long-term
        if (memory.importance >= this.longTermThreshold) {
            this.longTermMemory.push(memory);
            
            // Trim long-term memory if needed
            if (this.longTermMemory.length > this.longTermCapacity) {
                // Remove least important memory
                this.longTermMemory.sort((a, b) => a.importance - b.importance);
                this.longTermMemory.shift();
            }
            
            // Save long-term memory
            this.saveMemories();
        }
    }
    
    /**
     * Calculate importance score for a memory
     * @param {Object} data - Memory data
     * @returns {number} - Importance score (0-1)
     */
    calculateImportance(data) {
        let importance = 0;
        
        // Base importance by type
        switch (data.type) {
            case 'preference':
                importance += 0.8; // User preferences are important
                break;
            case 'personal':
                importance += 0.7; // Personal information is important
                break;
            case 'question':
                importance += 0.5; // Questions are moderately important
                break;
            case 'answer':
                importance += 0.5; // Answers are moderately important
                break;
            case 'greeting':
                importance += 0.2; // Greetings are less important
                break;
            case 'farewell':
                importance += 0.3; // Farewells are somewhat important
                break;
            default:
                importance += 0.4; // Default importance
        }
        
        // Adjust importance based on content
        const content = data.content.toLowerCase();
        
        // Check for personal information indicators
        if (
            content.includes('my name is') ||
            content.includes('i am') ||
            content.includes('i like') ||
            content.includes('i prefer') ||
            content.includes('i need') ||
            content.includes('i want') ||
            content.includes('i feel')
        ) {
            importance += 0.2;
        }
        
        // Check for emotional content
        if (
            content.includes('love') ||
            content.includes('hate') ||
            content.includes('happy') ||
            content.includes('sad') ||
            content.includes('angry') ||
            content.includes('excited') ||
            content.includes('worried') ||
            content.includes('afraid')
        ) {
            importance += 0.15;
        }
        
        // Check for question indicators
        if (
            content.includes('?') ||
            content.startsWith('who') ||
            content.startsWith('what') ||
            content.startsWith('when') ||
            content.startsWith('where') ||
            content.startsWith('why') ||
            content.startsWith('how')
        ) {
            importance += 0.1;
        }
        
        // Check for explicit importance indicators
        if (
            content.includes('important') ||
            content.includes('remember') ||
            content.includes('don\'t forget') ||
            content.includes('crucial')
        ) {
            importance += 0.25;
        }
        
        // Normalize importance to 0-1 range
        return Math.min(Math.max(importance, 0), 1);
    }
    
    /**
     * Process end of session, moving memories to appropriate storage
     */
    async processEndOfSession() {
        // Process short-term memories
        for (const memory of this.shortTermMemory) {
            // Check if memory should be moved to medium-term
            if (memory.importance >= this.mediumTermThreshold) {
                this.mediumTermMemory.push(memory);
            }
        }
        
        // Trim medium-term memory if needed
        if (this.mediumTermMemory.length > this.mediumTermCapacity) {
            // Sort by importance and timestamp (keep important and recent)
            this.mediumTermMemory.sort((a, b) => {
                // Weighted score combining importance and recency
                const scoreA = (a.importance * 0.7) + ((Date.now() - a.timestamp) / (30 * 24 * 60 * 60 * 1000) * 0.3);
                const scoreB = (b.importance * 0.7) + ((Date.now() - b.timestamp) / (30 * 24 * 60 * 60 * 1000) * 0.3);
                return scoreA - scoreB;
            });
            
            // Remove excess memories
            this.mediumTermMemory = this.mediumTermMemory.slice(
                this.mediumTermMemory.length - this.mediumTermCapacity
            );
        }
        
        // Check if any medium-term memories should be promoted to long-term
        const memoriesToPromote = this.mediumTermMemory.filter(
            memory => memory.importance >= this.longTermThreshold
        );
        
        if (memoriesToPromote.length > 0) {
            this.longTermMemory = [...this.longTermMemory, ...memoriesToPromote];
            
            // Remove promoted memories from medium-term
            const promotedIds = memoriesToPromote.map(memory => memory.id);
            this.mediumTermMemory = this.mediumTermMemory.filter(
                memory => !promotedIds.includes(memory.id)
            );
            
            // Trim long-term memory if needed
            if (this.longTermMemory.length > this.longTermCapacity) {
                // Sort by importance (keep most important)
                this.longTermMemory.sort((a, b) => a.importance - b.importance);
                this.longTermMemory = this.longTermMemory.slice(
                    this.longTermMemory.length - this.longTermCapacity
                );
            }
        }
        
        // Save memories to persistent storage
        await this.saveMemories();
        
        // Clear short-term memory
        this.shortTermMemory = [];
        this.storageManager.setSessionStorage('short-term-memory', []);
        
        // Update last visit timestamp in user preferences
        this.userPreferences.lastVisit = Date.now();
        await this.storageManager.setIndexedDB('preferences', this.userPreferences);
    }
    
    /**
     * Save memories to persistent storage
     */
    async saveMemories() {
        try {
            // Save medium-term memory
            await this.storageManager.setIndexedDB('memory', {
                id: 'medium-term',
                items: this.mediumTermMemory,
                lastUpdated: Date.now()
            });
            
            // Save long-term memory
            await this.storageManager.setIndexedDB('memory', {
                id: 'long-term',
                items: this.longTermMemory,
                lastUpdated: Date.now()
            });
        } catch (error) {
            console.error('Error saving memories:', error);
        }
    }
    
    /**
     * Update a user preference
     * @param {string} key - Preference key
     * @param {any} value - Preference value
     */
    async updateUserPreference(key, value) {
        // Update preference
        this.userPreferences[key] = value;
        
        // Save preferences
        try {
            await this.storageManager.setIndexedDB('preferences', this.userPreferences);
            
            // Publish event that preference was updated
            this.eventSystem.publish('user-preference-updated', {
                key,
                value,
                preferences: this.userPreferences
            });
        } catch (error) {
            console.error('Error saving user preference:', error);
        }
    }
    
    /**
     * Get all user preferences
     * @returns {Object} - User preferences
     */
    getUserPreferences() {
        return { ...this.userPreferences };
    }
    
    /**
     * Get a specific user preference
     * @param {string} key - Preference key
     * @param {any} defaultValue - Default value if preference doesn't exist
     * @returns {any} - Preference value
     */
    getUserPreference(key, defaultValue = null) {
        return this.userPreferences[key] !== undefined
            ? this.userPreferences[key]
            : defaultValue;
    }
    
    /**
     * Retrieve memories based on context
     * @param {Object} context - Context to match
     * @param {number} limit - Maximum number of memories to retrieve
     * @returns {Promise<Array>} - Array of relevant memories
     */
    async retrieveMemories(context, limit = 10) {
        // Combine all memories for searching
        const allMemories = [
            ...this.shortTermMemory,
            ...this.mediumTermMemory,
            ...this.longTermMemory
        ];
        
        // Score memories based on relevance to context
        const scoredMemories = allMemories.map(memory => {
            const relevanceScore = this.calculateRelevance(memory, context);
            return {
                ...memory,
                relevanceScore
            };
        });
        
        // Sort by relevance score (descending)
        scoredMemories.sort((a, b) => b.relevanceScore - a.relevanceScore);
        
        // Return top matches
        return scoredMemories.slice(0, limit);
    }
    
    /**
     * Calculate relevance score between memory and context
     * @param {Object} memory - Memory to evaluate
     * @param {Object} context - Context to match against
     * @returns {number} - Relevance score (0-1)
     */
    calculateRelevance(memory, context) {
        let score = 0;
        
        // Check for exact topic matches
        if (context.topic && memory.context && memory.context.topic) {
            if (context.topic === memory.context.topic) {
                score += 0.5;
            } else if (context.topic.includes(memory.context.topic) || 
                       memory.context.topic.includes(context.topic)) {
                score += 0.3;
            }
        }
        
        // Check for keyword matches in content
        if (context.keywords && context.keywords.length > 0 && memory.content) {
            const contentLower = memory.content.toLowerCase();
            const matchingKeywords = context.keywords.filter(keyword => 
                contentLower.includes(keyword.toLowerCase())
            );
            
            if (matchingKeywords.length > 0) {
                score += 0.3 * (matchingKeywords.length / context.keywords.length);
            }
        }
        
        // Check for recency (newer memories are more relevant)
        if (memory.timestamp) {
            const ageInHours = (Date.now() - memory.timestamp) / (60 * 60 * 1000);
            const recencyScore = Math.max(0, 1 - (ageInHours / (24 * 7))); // 1 week decay
            score += 0.2 * recencyScore;
        }
        
        // Check for importance
        if (memory.importance) {
            score += 0.2 * memory.importance;
        }
        
        // Check for entity matches
        if (context.entities && context.entities.length > 0 && 
            memory.context && memory.context.entities && memory.context.entities.length > 0) {
            
            const matchingEntities = context.entities.filter(entity => 
                memory.context.entities.some(memEntity => memEntity === entity)
            );
            
            if (matchingEntities.length > 0) {
                score += 0.3 * (matchingEntities.length / context.entities.length);
            }
        }
        
        // Normalize score to 0-1 range
        return Math.min(Math.max(score, 0), 1);
    }
    
    /**
     * Get conversation summary
     * @param {number} messageCount - Number of messages to include
     * @returns {Object} - Conversation summary
     */
    getConversationSummary(messageCount = 10) {
        // Get recent messages
        const recentMessages = this.shortTermMemory
            .filter(memory => memory.type === 'message')
            .slice(-messageCount);
        
        // Extract key topics
        const topics = this.extractTopics(recentMessages);
        
        // Extract entities
        const entities = this.extractEntities(recentMessages);
        
        // Calculate sentiment
        const sentiment = this.calculateSentiment(recentMessages);
        
        return {
            messageCount: recentMessages.length,
            topics,
            entities,
            sentiment,
            timestamp: Date.now()
        };
    }
    
    /**
     * Extract topics from messages
     * @param {Array} messages - Array of message memories
     * @returns {Array} - Array of topics
     */
    extractTopics(messages) {
        // Simple topic extraction based on content frequency
        const contentWords = messages
            .map(message => message.content.toLowerCase())
            .join(' ')
            .split(/\W+/)
            .filter(word => word.length > 3) // Filter out short words
            .filter(word => !this.isStopWord(word)); // Filter out stop words
        
        // Count word frequency
        const wordCounts = {};
        contentWords.forEach(word => {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        });
        
        // Convert to array and sort by frequency
        const sortedWords = Object.entries(wordCounts)
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0]);
        
        // Return top topics
        return sortedWords.slice(0, 5);
    }
    
    /**
     * Check if a word is a stop word
     * @param {string} word - Word to check
     * @returns {boolean} - True if word is a stop word
     */
    isStopWord(word) {
        const stopWords = [
            'the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this',
            'but', 'his', 'from', 'they', 'she', 'will', 'would', 'there',
            'their', 'what', 'about', 'which', 'when', 'make', 'like', 'time',
            'just', 'know', 'take', 'person', 'into', 'year', 'your', 'good',
            'some', 'could', 'them', 'than', 'then', 'look', 'only', 'come',
            'over', 'think', 'also', 'back', 'after', 'work', 'first', 'well',
            'even', 'want', 'because', 'these', 'give', 'most'
        ];
        
        return stopWords.includes(word);
    }
    
    /**
     * Extract entities from messages
     * @param {Array} messages - Array of message memories
     * @returns {Array} - Array of entities
     */
    extractEntities(messages) {
        // Simple entity extraction (names, places, etc.)
        const entities = [];
        
        // Look for explicit entities in context
        messages.forEach(message => {
            if (message.context && message.context.entities) {
                message.context.entities.forEach(entity => {
                    if (!entities.includes(entity)) {
                        entities.push(entity);
                    }
                });
            }
        });
        
        // Look for capitalized words that might be entities
        const potentialEntities = messages
            .map(message => {
                const matches = message.content.match(/\b[A-Z][a-z]+\b/g);
                return matches || [];
            })
            .flat();
        
        // Add unique potential entities
        potentialEntities.forEach(entity => {
            if (!entities.includes(entity)) {
                entities.push(entity);
            }
        });
        
        return entities;
    }
    
    /**
     * Calculate sentiment from messages
     * @param {Array} messages - Array of message memories
     * @returns {Object} - Sentiment object with score and label
     */
    calculateSentiment(messages) {
        // Simple sentiment analysis
        const positiveWords = [
            'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
            'happy', 'glad', 'positive', 'nice', 'love', 'like', 'enjoy',
            'pleased', 'thank', 'thanks', 'appreciated', 'awesome', 'best'
        ];
        
        const negativeWords = [
            'bad', 'terrible', 'awful', 'horrible', 'poor', 'negative',
            'sad', 'unhappy', 'angry', 'upset', 'hate', 'dislike', 'worst',
            'disappointed', 'sorry', 'problem', 'issue', 'wrong', 'fail'
        ];
        
        let positiveCount = 0;
        let negativeCount = 0;
        
        // Count positive and negative words
        messages.forEach(message => {
            const content = message.content.toLowerCase();
            const words = content.split(/\W+/);
            
            words.forEach(word => {
                if (positiveWords.includes(word)) {
                    positiveCount++;
                } else if (negativeWords.includes(word)) {
                    negativeCount++;
                }
            });
        });
        
        // Calculate sentiment score (-1 to 1)
        const totalWords = positiveCount + negativeCount;
        let score = 0;
        
        if (totalWords > 0) {
            score = (positiveCount - negativeCount) / totalWords;
        }
        
        // Determine sentiment label
        let label;
        if (score > 0.5) {
            label = 'very positive';
        } else if (score > 0.1) {
            label = 'positive';
        } else if (score > -0.1) {
            label = 'neutral';
        } else if (score > -0.5) {
            label = 'negative';
        } else {
            label = 'very negative';
        }
        
        return { score, label };
    }
    
    /**
     * Clear all memories (for testing or privacy)
     */
    async clearAllMemories() {
        // Clear memory arrays
        this.shortTermMemory = [];
        this.mediumTermMemory = [];
        this.longTermMemory = [];
        
        // Clear storage
        await this.storageManager.setSessionStorage('short-term-memory', []);
        await this.storageManager.clearStore('memory');
        
        console.log('All memories cleared');
    }
}

// Initialize the contextual memory system when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.contextualMemorySystem = new ContextualMemorySystem();
});
