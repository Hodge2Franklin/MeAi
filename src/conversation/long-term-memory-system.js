/**
 * Long-term Memory Architecture
 * 
 * This system provides persistent storage for conversation history with
 * importance-based memory retention, sophisticated retrieval algorithms,
 * and memory visualization capabilities.
 */

class LongTermMemorySystem {
    constructor() {
        // Dependencies
        this.eventSystem = window.eventSystem;
        
        // Database
        this.db = null;
        this.dbName = 'MeAI_LongTermMemory';
        this.dbVersion = 1;
        
        // Memory stores
        this.memoryStores = {
            facts: 'facts',           // Persistent facts about the user
            conversations: 'conversations', // Conversation history
            topics: 'topics',         // Topic tracking
            preferences: 'preferences', // User preferences
            relationships: 'relationships' // Relationship context
        };
        
        // Memory retrieval cache
        this.memoryCache = {
            facts: new Map(),
            conversations: new Map(),
            topics: new Map(),
            preferences: new Map(),
            relationships: new Map()
        };
        
        // Memory importance thresholds
        this.importanceThresholds = {
            critical: 0.9,  // Never forget (e.g., user name, critical preferences)
            high: 0.7,      // Long retention (e.g., important life events)
            medium: 0.5,    // Medium retention (e.g., regular preferences)
            low: 0.3,       // Short retention (e.g., casual conversation details)
            transient: 0.1  // Very short retention (e.g., contextual references)
        };
        
        // Memory retention periods (in milliseconds)
        this.retentionPeriods = {
            critical: Infinity,                      // Never expire
            high: 365 * 24 * 60 * 60 * 1000,         // 1 year
            medium: 30 * 24 * 60 * 60 * 1000,        // 30 days
            low: 7 * 24 * 60 * 60 * 1000,            // 7 days
            transient: 24 * 60 * 60 * 1000           // 1 day
        };
        
        // Memory consolidation settings
        this.consolidationInterval = 24 * 60 * 60 * 1000; // 24 hours
        this.lastConsolidationTime = 0;
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize the memory system
     */
    async init() {
        try {
            // Open IndexedDB database
            await this.openDatabase();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Check if memory consolidation is needed
            await this.checkMemoryConsolidation();
            
            // Publish initialization success event
            this.eventSystem.publish('long-term-memory-initialized', {
                success: true
            });
            
            console.log('Long-term Memory System initialized successfully');
        } catch (error) {
            console.error('Error initializing Long-term Memory System:', error);
            
            // Publish initialization failure event
            this.eventSystem.publish('long-term-memory-initialized', {
                success: false,
                error: error.message
            });
        }
    }
    
    /**
     * Open the IndexedDB database
     * @returns {Promise} Promise that resolves when the database is opened
     */
    openDatabase() {
        return new Promise((resolve, reject) => {
            // Check if IndexedDB is supported
            if (!window.indexedDB) {
                reject(new Error('IndexedDB is not supported in this browser'));
                return;
            }
            
            // Open database
            const request = window.indexedDB.open(this.dbName, this.dbVersion);
            
            // Handle database upgrade (called when database is created or version is upgraded)
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores for each memory type if they don't exist
                if (!db.objectStoreNames.contains(this.memoryStores.facts)) {
                    const factStore = db.createObjectStore(this.memoryStores.facts, { keyPath: 'key' });
                    factStore.createIndex('importance', 'importance', { unique: false });
                    factStore.createIndex('timestamp', 'timestamp', { unique: false });
                    factStore.createIndex('expirationTime', 'expirationTime', { unique: false });
                }
                
                if (!db.objectStoreNames.contains(this.memoryStores.conversations)) {
                    const conversationStore = db.createObjectStore(this.memoryStores.conversations, { keyPath: 'id' });
                    conversationStore.createIndex('timestamp', 'timestamp', { unique: false });
                    conversationStore.createIndex('importance', 'importance', { unique: false });
                    conversationStore.createIndex('expirationTime', 'expirationTime', { unique: false });
                    conversationStore.createIndex('topic', 'topic', { unique: false });
                }
                
                if (!db.objectStoreNames.contains(this.memoryStores.topics)) {
                    const topicStore = db.createObjectStore(this.memoryStores.topics, { keyPath: 'name' });
                    topicStore.createIndex('lastDiscussed', 'lastDiscussed', { unique: false });
                    topicStore.createIndex('frequency', 'frequency', { unique: false });
                    topicStore.createIndex('importance', 'importance', { unique: false });
                }
                
                if (!db.objectStoreNames.contains(this.memoryStores.preferences)) {
                    const preferenceStore = db.createObjectStore(this.memoryStores.preferences, { keyPath: 'key' });
                    preferenceStore.createIndex('category', 'category', { unique: false });
                    preferenceStore.createIndex('importance', 'importance', { unique: false });
                    preferenceStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                if (!db.objectStoreNames.contains(this.memoryStores.relationships)) {
                    const relationshipStore = db.createObjectStore(this.memoryStores.relationships, { keyPath: 'name' });
                    relationshipStore.createIndex('type', 'type', { unique: false });
                    relationshipStore.createIndex('importance', 'importance', { unique: false });
                    relationshipStore.createIndex('lastMentioned', 'lastMentioned', { unique: false });
                }
            };
            
            // Handle success
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };
            
            // Handle error
            request.onerror = (event) => {
                reject(new Error(`Database error: ${event.target.error}`));
            };
        });
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for conversation events
        this.eventSystem.subscribe('conversation-message', (data) => {
            this.processConversationMessage(data);
        });
        
        // Listen for fact storage requests
        this.eventSystem.subscribe('store-fact', (data) => {
            this.storeFact(data.key, data.value, data.importance, data.category);
        });
        
        // Listen for preference updates
        this.eventSystem.subscribe('update-preference', (data) => {
            this.storePreference(data.key, data.value, data.category, data.importance);
        });
        
        // Listen for memory visualization requests
        this.eventSystem.subscribe('request-memory-visualization', (data) => {
            this.generateMemoryVisualization(data.type, data.filter);
        });
        
        // Listen for memory export requests
        this.eventSystem.subscribe('request-memory-export', () => {
            this.exportMemory();
        });
        
        // Listen for memory import requests
        this.eventSystem.subscribe('request-memory-import', (data) => {
            this.importMemory(data.memoryData);
        });
    }
    
    /**
     * Process a conversation message for memory storage
     * @param {Object} data - Message data
     */
    async processConversationMessage(data) {
        try {
            // Extract message data
            const { message, isUser, timestamp } = data;
            
            // Skip empty messages
            if (!message || message.trim() === '') {
                return;
            }
            
            // Generate a unique ID for the message
            const id = `msg_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Analyze message for importance
            const importance = await this.analyzeMessageImportance(message, isUser);
            
            // Determine expiration time based on importance
            const expirationTime = this.calculateExpirationTime(importance);
            
            // Analyze message for topics
            const topics = await this.extractTopics(message);
            
            // Store the message in the conversations store
            await this.storeInObjectStore(this.memoryStores.conversations, {
                id,
                message,
                isUser,
                timestamp,
                importance,
                expirationTime,
                topic: topics.length > 0 ? topics[0] : 'general',
                allTopics: topics
            });
            
            // Update topic information
            for (const topic of topics) {
                await this.updateTopic(topic, timestamp, importance);
            }
            
            // Extract and store facts from the message
            if (isUser) {
                await this.extractAndStoreFacts(message, importance);
            }
            
            // Extract and store relationships from the message
            await this.extractAndStoreRelationships(message, importance);
        } catch (error) {
            console.error('Error processing conversation message:', error);
        }
    }
    
    /**
     * Analyze message importance
     * @param {string} message - The message to analyze
     * @param {boolean} isUser - Whether the message is from the user
     * @returns {Promise<number>} Importance score (0-1)
     */
    async analyzeMessageImportance(message, isUser) {
        // Base importance - user messages are generally more important
        let importance = isUser ? 0.5 : 0.3;
        
        // Increase importance for longer, more substantive messages
        const wordCount = message.split(/\s+/).length;
        if (wordCount > 20) {
            importance += 0.1;
        }
        
        // Check for importance indicators
        const importanceIndicators = [
            { pattern: /\b(always|never|hate|love|favorite|important|significant)\b/i, value: 0.1 },
            { pattern: /\b(remember|forget|remind me|don't forget)\b/i, value: 0.2 },
            { pattern: /\b(my name is|I am|I'm|call me)\b/i, value: 0.3 },
            { pattern: /\b(password|secret|private|confidential)\b/i, value: 0.4 },
            { pattern: /[!?]{2,}/, value: 0.05 },
            { pattern: /\b(must|have to|need to|should)\b/i, value: 0.05 }
        ];
        
        for (const indicator of importanceIndicators) {
            if (indicator.pattern.test(message)) {
                importance += indicator.value;
            }
        }
        
        // Check for personal information
        const personalInfoPatterns = [
            { pattern: /\b(my|I|me|mine)\b/i, value: 0.05 },
            { pattern: /\b(we|our|us)\b/i, value: 0.03 },
            { pattern: /\b(family|friend|partner|spouse|wife|husband|child|son|daughter)\b/i, value: 0.1 }
        ];
        
        for (const pattern of personalInfoPatterns) {
            if (pattern.pattern.test(message)) {
                importance += pattern.value;
            }
        }
        
        // Cap importance at 1.0
        return Math.min(1.0, importance);
    }
    
    /**
     * Calculate expiration time based on importance
     * @param {number} importance - Importance score (0-1)
     * @returns {number} Expiration timestamp (milliseconds since epoch)
     */
    calculateExpirationTime(importance) {
        let retentionPeriod;
        
        if (importance >= this.importanceThresholds.critical) {
            retentionPeriod = this.retentionPeriods.critical;
        } else if (importance >= this.importanceThresholds.high) {
            retentionPeriod = this.retentionPeriods.high;
        } else if (importance >= this.importanceThresholds.medium) {
            retentionPeriod = this.retentionPeriods.medium;
        } else if (importance >= this.importanceThresholds.low) {
            retentionPeriod = this.retentionPeriods.low;
        } else {
            retentionPeriod = this.retentionPeriods.transient;
        }
        
        // If retention period is Infinity, return null (never expires)
        if (retentionPeriod === Infinity) {
            return null;
        }
        
        return Date.now() + retentionPeriod;
    }
    
    /**
     * Extract topics from a message
     * @param {string} message - The message to analyze
     * @returns {Promise<string[]>} Array of topics
     */
    async extractTopics(message) {
        // Simple keyword-based topic extraction
        const topicKeywords = {
            'weather': ['weather', 'rain', 'sunny', 'temperature', 'forecast', 'climate'],
            'health': ['health', 'doctor', 'sick', 'illness', 'disease', 'medicine', 'exercise', 'diet'],
            'technology': ['technology', 'computer', 'software', 'hardware', 'app', 'device', 'internet', 'digital'],
            'entertainment': ['movie', 'film', 'show', 'music', 'song', 'concert', 'artist', 'actor', 'actress', 'entertainment'],
            'food': ['food', 'eat', 'restaurant', 'recipe', 'cook', 'meal', 'dinner', 'lunch', 'breakfast'],
            'travel': ['travel', 'trip', 'vacation', 'journey', 'flight', 'hotel', 'destination', 'tourism'],
            'work': ['work', 'job', 'career', 'office', 'business', 'professional', 'employment'],
            'education': ['education', 'school', 'college', 'university', 'learn', 'study', 'student', 'teacher', 'professor'],
            'family': ['family', 'parent', 'child', 'mother', 'father', 'son', 'daughter', 'brother', 'sister'],
            'emotions': ['happy', 'sad', 'angry', 'excited', 'nervous', 'anxious', 'calm', 'stressed', 'feeling', 'emotion']
        };
        
        const lowerMessage = message.toLowerCase();
        const detectedTopics = [];
        
        for (const [topic, keywords] of Object.entries(topicKeywords)) {
            for (const keyword of keywords) {
                if (lowerMessage.includes(keyword)) {
                    detectedTopics.push(topic);
                    break;
                }
            }
        }
        
        // If no topics were detected, use 'general'
        if (detectedTopics.length === 0) {
            detectedTopics.push('general');
        }
        
        return detectedTopics;
    }
    
    /**
     * Update topic information
     * @param {string} topicName - Name of the topic
     * @param {number} timestamp - Timestamp of the message
     * @param {number} importance - Importance of the message
     */
    async updateTopic(topicName, timestamp, importance) {
        try {
            // Get existing topic data or create new
            const existingTopic = await this.getFromObjectStore(this.memoryStores.topics, topicName);
            
            if (existingTopic) {
                // Update existing topic
                const updatedTopic = {
                    ...existingTopic,
                    lastDiscussed: timestamp,
                    frequency: existingTopic.frequency + 1,
                    importance: Math.max(existingTopic.importance, importance)
                };
                
                await this.storeInObjectStore(this.memoryStores.topics, updatedTopic);
            } else {
                // Create new topic
                const newTopic = {
                    name: topicName,
                    lastDiscussed: timestamp,
                    frequency: 1,
                    importance: importance,
                    firstDiscussed: timestamp
                };
                
                await this.storeInObjectStore(this.memoryStores.topics, newTopic);
            }
        } catch (error) {
            console.error(`Error updating topic ${topicName}:`, error);
        }
    }
    
    /**
     * Extract and store facts from a message
     * @param {string} message - The message to analyze
     * @param {number} importance - Base importance of the message
     */
    async extractAndStoreFacts(message, importance) {
        // Simple fact extraction patterns
        const factPatterns = [
            {
                pattern: /my name is (\w+)/i,
                key: 'user_name',
                importance: 0.9,
                category: 'personal'
            },
            {
                pattern: /I am (\d+) years old/i,
                key: 'user_age',
                importance: 0.7,
                category: 'personal'
            },
            {
                pattern: /I live in ([^.,:;!?]+)/i,
                key: 'user_location',
                importance: 0.8,
                category: 'personal'
            },
            {
                pattern: /my favorite (\w+) is ([^.,:;!?]+)/i,
                keyFn: (matches) => `favorite_${matches[1]}`,
                valueFn: (matches) => matches[2],
                importance: 0.6,
                category: 'preferences'
            },
            {
                pattern: /I (like|love|enjoy) ([^.,:;!?]+)/i,
                keyFn: (matches) => `likes_${matches[2].replace(/\s+/g, '_').toLowerCase()}`,
                valueFn: (matches) => matches[2],
                importance: 0.5,
                category: 'preferences'
            },
            {
                pattern: /I (hate|dislike|don't like) ([^.,:;!?]+)/i,
                keyFn: (matches) => `dislikes_${matches[2].replace(/\s+/g, '_').toLowerCase()}`,
                valueFn: (matches) => matches[2],
                importance: 0.5,
                category: 'preferences'
            }
        ];
        
        for (const factPattern of factPatterns) {
            const matches = message.match(factPattern.pattern);
            
            if (matches) {
                let key, value;
                
                if (factPattern.keyFn) {
                    key = factPattern.keyFn(matches);
                } else {
                    key = factPattern.key;
                }
                
                if (factPattern.valueFn) {
                    value = factPattern.valueFn(matches);
                } else {
                    value = matches[1];
                }
                
                // Combine pattern importance with message importance
                const factImportance = Math.min(1.0, factPattern.importance + (importance * 0.2));
                
                await this.storeFact(key, value, factImportance, factPattern.category);
            }
        }
    }
    
    /**
     * Extract and store relationships from a message
     * @param {string} message - The message to analyze
     * @param {number} importance - Base importance of the message
     */
    async extractAndStoreRelationships(message, importance) {
        // Simple relationship extraction patterns
        const relationshipPatterns = [
            {
                pattern: /my (friend|buddy|pal) (\w+)/i,
                typeFn: () => 'friend',
                nameFn: (matches) => matches[2]
            },
            {
                pattern: /my (mother|mom|father|dad|parent) (\w+)?/i,
                typeFn: (matches) => matches[1].toLowerCase().replace(/mother/, 'mom').replace(/father/, 'dad'),
                nameFn: (matches) => matches[2] || matches[1]
            },
            {
                pattern: /my (sister|brother|sibling) (\w+)?/i,
                typeFn: (matches) => matches[1].toLowerCase(),
                nameFn: (matches) => matches[2] || matches[1]
            },
            {
                pattern: /my (wife|husband|spouse|partner) (\w+)?/i,
                typeFn: (matches) => matches[1].toLowerCase(),
                nameFn: (matches) => matches[2] || matches[1]
            },
            {
                pattern: /my (son|daughter|child) (\w+)?/i,
                typeFn: (matches) => matches[1].toLowerCase(),
                nameFn: (matches) => matches[2] || matches[1]
            },
            {
                pattern: /my (boss|coworker|colleague) (\w+)?/i,
                typeFn: (matches) => matches[1].toLowerCase(),
                nameFn: (matches) => matches[2] || matches[1]
            }
        ];
        
        for (const relationshipPattern of relationshipPatterns) {
            const matches = message.match(relationshipPattern.pattern);
            
            if (matches) {
                const type = relationshipPattern.typeFn(matches);
                const name = relationshipPattern.nameFn(matches);
                
                // Skip if name is missing
                if (!name) continue;
                
                // Relationships are generally important
                const relationshipImportance = Math.min(1.0, 0.7 + (importance * 0.2));
                
                await this.storeRelationship(name, type, relationshipImportance);
            }
        }
    }
    
    /**
     * Store a fact in the memory system
     * @param {string} key - Fact key
     * @param {*} value - Fact value
     * @param {number} importance - Importance of the fact (0-1)
     * @param {string} category - Category of the fact
     */
    async storeFact(key, value, importance = 0.5, category = 'general') {
        try {
            // Get existing fact if it exists
            const existingFact = await this.getFromObjectStore(this.memoryStores.facts, key);
            
            const timestamp = Date.now();
            const expirationTime = this.calculateExpirationTime(importance);
            
            if (existingFact) {
                // Update existing fact
                const updatedFact = {
                    ...existingFact,
                    value,
                    timestamp,
                    // Keep the higher importance
                    importance: Math.max(existingFact.importance, importance),
                    category,
                    expirationTime,
                    updateCount: (existingFact.updateCount || 0) + 1
                };
                
                await this.storeInObjectStore(this.memoryStores.facts, updatedFact);
                
                // Update cache
                this.memoryCache.facts.set(key, updatedFact);
            } else {
                // Create new fact
                const newFact = {
                    key,
                    value,
                    timestamp,
                    importance,
                    category,
                    expirationTime,
                    updateCount: 0
                };
                
                await this.storeInObjectStore(this.memoryStores.facts, newFact);
                
                // Update cache
                this.memoryCache.facts.set(key, newFact);
            }
            
            // Publish fact stored event
            this.eventSystem.publish('fact-stored', {
                key,
                value,
                importance,
                category
            });
        } catch (error) {
            console.error(`Error storing fact ${key}:`, error);
        }
    }
    
    /**
     * Store a preference in the memory system
     * @param {string} key - Preference key
     * @param {*} value - Preference value
     * @param {string} category - Category of the preference
     * @param {number} importance - Importance of the preference (0-1)
     */
    async storePreference(key, value, category = 'general', importance = 0.6) {
        try {
            // Get existing preference if it exists
            const existingPreference = await this.getFromObjectStore(this.memoryStores.preferences, key);
            
            const timestamp = Date.now();
            const expirationTime = this.calculateExpirationTime(importance);
            
            if (existingPreference) {
                // Update existing preference
                const updatedPreference = {
                    ...existingPreference,
                    value,
                    timestamp,
                    // Keep the higher importance
                    importance: Math.max(existingPreference.importance, importance),
                    category,
                    expirationTime,
                    updateCount: (existingPreference.updateCount || 0) + 1
                };
                
                await this.storeInObjectStore(this.memoryStores.preferences, updatedPreference);
                
                // Update cache
                this.memoryCache.preferences.set(key, updatedPreference);
            } else {
                // Create new preference
                const newPreference = {
                    key,
                    value,
                    timestamp,
                    importance,
                    category,
                    expirationTime,
                    updateCount: 0
                };
                
                await this.storeInObjectStore(this.memoryStores.preferences, newPreference);
                
                // Update cache
                this.memoryCache.preferences.set(key, newPreference);
            }
            
            // Publish preference stored event
            this.eventSystem.publish('preference-stored', {
                key,
                value,
                importance,
                category
            });
        } catch (error) {
            console.error(`Error storing preference ${key}:`, error);
        }
    }
    
    /**
     * Store a relationship in the memory system
     * @param {string} name - Name of the person
     * @param {string} type - Type of relationship
     * @param {number} importance - Importance of the relationship (0-1)
     */
    async storeRelationship(name, type, importance = 0.7) {
        try {
            // Get existing relationship if it exists
            const existingRelationship = await this.getFromObjectStore(this.memoryStores.relationships, name);
            
            const timestamp = Date.now();
            
            if (existingRelationship) {
                // Update existing relationship
                const updatedRelationship = {
                    ...existingRelationship,
                    type,
                    lastMentioned: timestamp,
                    // Keep the higher importance
                    importance: Math.max(existingRelationship.importance, importance),
                    mentionCount: (existingRelationship.mentionCount || 0) + 1
                };
                
                await this.storeInObjectStore(this.memoryStores.relationships, updatedRelationship);
                
                // Update cache
                this.memoryCache.relationships.set(name, updatedRelationship);
            } else {
                // Create new relationship
                const newRelationship = {
                    name,
                    type,
                    firstMentioned: timestamp,
                    lastMentioned: timestamp,
                    importance,
                    mentionCount: 1
                };
                
                await this.storeInObjectStore(this.memoryStores.relationships, newRelationship);
                
                // Update cache
                this.memoryCache.relationships.set(name, newRelationship);
            }
            
            // Publish relationship stored event
            this.eventSystem.publish('relationship-stored', {
                name,
                type,
                importance
            });
        } catch (error) {
            console.error(`Error storing relationship ${name}:`, error);
        }
    }
    
    /**
     * Retrieve a fact from memory
     * @param {string} key - Fact key
     * @returns {Promise<*>} Fact value or null if not found
     */
    async retrieveFact(key) {
        try {
            // Check cache first
            if (this.memoryCache.facts.has(key)) {
                const cachedFact = this.memoryCache.facts.get(key);
                
                // Check if fact has expired
                if (cachedFact.expirationTime && cachedFact.expirationTime < Date.now()) {
                    // Fact has expired, remove from cache
                    this.memoryCache.facts.delete(key);
                    return null;
                }
                
                return cachedFact.value;
            }
            
            // Not in cache, check database
            const fact = await this.getFromObjectStore(this.memoryStores.facts, key);
            
            if (!fact) {
                return null;
            }
            
            // Check if fact has expired
            if (fact.expirationTime && fact.expirationTime < Date.now()) {
                // Fact has expired
                return null;
            }
            
            // Add to cache
            this.memoryCache.facts.set(key, fact);
            
            return fact.value;
        } catch (error) {
            console.error(`Error retrieving fact ${key}:`, error);
            return null;
        }
    }
    
    /**
     * Retrieve a preference from memory
     * @param {string} key - Preference key
     * @returns {Promise<*>} Preference value or null if not found
     */
    async retrievePreference(key) {
        try {
            // Check cache first
            if (this.memoryCache.preferences.has(key)) {
                const cachedPreference = this.memoryCache.preferences.get(key);
                
                // Check if preference has expired
                if (cachedPreference.expirationTime && cachedPreference.expirationTime < Date.now()) {
                    // Preference has expired, remove from cache
                    this.memoryCache.preferences.delete(key);
                    return null;
                }
                
                return cachedPreference.value;
            }
            
            // Not in cache, check database
            const preference = await this.getFromObjectStore(this.memoryStores.preferences, key);
            
            if (!preference) {
                return null;
            }
            
            // Check if preference has expired
            if (preference.expirationTime && preference.expirationTime < Date.now()) {
                // Preference has expired
                return null;
            }
            
            // Add to cache
            this.memoryCache.preferences.set(key, preference);
            
            return preference.value;
        } catch (error) {
            console.error(`Error retrieving preference ${key}:`, error);
            return null;
        }
    }
    
    /**
     * Retrieve conversation history
     * @param {Object} options - Retrieval options
     * @param {number} options.limit - Maximum number of messages to retrieve
     * @param {string} options.topic - Filter by topic
     * @param {number} options.minImportance - Minimum importance threshold
     * @param {number} options.startTime - Start time for retrieval window
     * @param {number} options.endTime - End time for retrieval window
     * @returns {Promise<Array>} Array of conversation messages
     */
    async retrieveConversationHistory(options = {}) {
        const {
            limit = 50,
            topic = null,
            minImportance = 0,
            startTime = 0,
            endTime = Date.now()
        } = options;
        
        try {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.memoryStores.conversations], 'readonly');
                const store = transaction.objectStore(this.memoryStores.conversations);
                
                // Use an index based on the filter criteria
                let index, range;
                
                if (topic) {
                    index = store.index('topic');
                    range = IDBKeyRange.only(topic);
                } else {
                    index = store.index('timestamp');
                    range = IDBKeyRange.bound(startTime, endTime);
                }
                
                const messages = [];
                
                index.openCursor(range, 'prev').onsuccess = (event) => {
                    const cursor = event.target.result;
                    
                    if (cursor && messages.length < limit) {
                        const message = cursor.value;
                        
                        // Apply additional filters
                        if (message.importance >= minImportance) {
                            // Check if message has expired
                            if (!message.expirationTime || message.expirationTime > Date.now()) {
                                messages.push(message);
                            }
                        }
                        
                        cursor.continue();
                    } else {
                        resolve(messages);
                    }
                };
                
                transaction.onerror = (event) => {
                    reject(new Error(`Error retrieving conversation history: ${event.target.error}`));
                };
            });
        } catch (error) {
            console.error('Error retrieving conversation history:', error);
            return [];
        }
    }
    
    /**
     * Search memory for relevant information
     * @param {string} query - Search query
     * @param {Object} options - Search options
     * @param {string[]} options.stores - Memory stores to search
     * @param {number} options.limit - Maximum number of results per store
     * @param {number} options.minImportance - Minimum importance threshold
     * @returns {Promise<Object>} Search results grouped by store
     */
    async searchMemory(query, options = {}) {
        const {
            stores = Object.values(this.memoryStores),
            limit = 10,
            minImportance = 0.3
        } = options;
        
        const results = {};
        const searchTerms = query.toLowerCase().split(/\s+/);
        
        try {
            // Search each specified store
            for (const storeName of stores) {
                results[storeName] = [];
                
                // Get all items from the store
                const items = await this.getAllFromObjectStore(storeName);
                
                // Filter and score items based on search terms
                const scoredItems = items
                    .map(item => {
                        let score = 0;
                        let matchCount = 0;
                        
                        // Skip items below minimum importance
                        if (item.importance < minImportance) {
                            return { item, score: 0 };
                        }
                        
                        // Skip expired items
                        if (item.expirationTime && item.expirationTime < Date.now()) {
                            return { item, score: 0 };
                        }
                        
                        // Convert item to string representation for searching
                        const itemString = JSON.stringify(item).toLowerCase();
                        
                        // Score based on term matches
                        for (const term of searchTerms) {
                            if (itemString.includes(term)) {
                                score += 1;
                                matchCount++;
                            }
                        }
                        
                        // Bonus for matching all terms
                        if (matchCount === searchTerms.length) {
                            score *= 2;
                        }
                        
                        // Factor in importance
                        score *= (0.5 + item.importance);
                        
                        return { item, score };
                    })
                    .filter(({ score }) => score > 0)
                    .sort((a, b) => b.score - a.score)
                    .slice(0, limit)
                    .map(({ item }) => item);
                
                results[storeName] = scoredItems;
            }
            
            return results;
        } catch (error) {
            console.error('Error searching memory:', error);
            return {};
        }
    }
    
    /**
     * Generate context-aware memory retrieval
     * @param {string} currentMessage - Current message for context
     * @param {Object} options - Retrieval options
     * @returns {Promise<Object>} Relevant memory items for context
     */
    async generateContextAwareMemory(currentMessage, options = {}) {
        try {
            // Extract topics from current message
            const topics = await this.extractTopics(currentMessage);
            
            // Get recent conversation history
            const recentMessages = await this.retrieveConversationHistory({
                limit: 10,
                minImportance: 0.3
            });
            
            // Search for relevant facts and preferences
            const searchResults = await this.searchMemory(currentMessage, {
                stores: [this.memoryStores.facts, this.memoryStores.preferences],
                limit: 5,
                minImportance: 0.4
            });
            
            // Get topic-related conversations
            const topicMessages = [];
            for (const topic of topics) {
                const messages = await this.retrieveConversationHistory({
                    limit: 5,
                    topic,
                    minImportance: 0.4
                });
                
                topicMessages.push(...messages);
            }
            
            // Deduplicate messages
            const seenIds = new Set();
            const uniqueTopicMessages = topicMessages.filter(msg => {
                if (seenIds.has(msg.id)) {
                    return false;
                }
                seenIds.add(msg.id);
                return true;
            });
            
            return {
                recentMessages,
                topicMessages: uniqueTopicMessages,
                relevantFacts: searchResults[this.memoryStores.facts] || [],
                relevantPreferences: searchResults[this.memoryStores.preferences] || [],
                topics
            };
        } catch (error) {
            console.error('Error generating context-aware memory:', error);
            return {
                recentMessages: [],
                topicMessages: [],
                relevantFacts: [],
                relevantPreferences: [],
                topics: []
            };
        }
    }
    
    /**
     * Generate memory visualization data
     * @param {string} type - Type of visualization (topics, timeline, relationships, etc.)
     * @param {Object} filter - Filter criteria
     */
    async generateMemoryVisualization(type, filter = {}) {
        try {
            let visualizationData;
            
            switch (type) {
                case 'topics':
                    visualizationData = await this.generateTopicVisualization(filter);
                    break;
                case 'timeline':
                    visualizationData = await this.generateTimelineVisualization(filter);
                    break;
                case 'relationships':
                    visualizationData = await this.generateRelationshipVisualization(filter);
                    break;
                case 'facts':
                    visualizationData = await this.generateFactVisualization(filter);
                    break;
                case 'importance':
                    visualizationData = await this.generateImportanceVisualization(filter);
                    break;
                default:
                    visualizationData = { error: `Unknown visualization type: ${type}` };
            }
            
            // Publish visualization data
            this.eventSystem.publish('memory-visualization-data', {
                type,
                data: visualizationData
            });
        } catch (error) {
            console.error(`Error generating ${type} visualization:`, error);
            
            // Publish error
            this.eventSystem.publish('memory-visualization-data', {
                type,
                error: error.message
            });
        }
    }
    
    /**
     * Generate topic visualization data
     * @param {Object} filter - Filter criteria
     * @returns {Promise<Object>} Visualization data
     */
    async generateTopicVisualization(filter) {
        const topics = await this.getAllFromObjectStore(this.memoryStores.topics);
        
        // Apply filters
        let filteredTopics = topics;
        
        if (filter.minFrequency) {
            filteredTopics = filteredTopics.filter(topic => topic.frequency >= filter.minFrequency);
        }
        
        if (filter.minImportance) {
            filteredTopics = filteredTopics.filter(topic => topic.importance >= filter.minImportance);
        }
        
        if (filter.timeRange) {
            const { start, end } = filter.timeRange;
            filteredTopics = filteredTopics.filter(topic => 
                topic.lastDiscussed >= start && topic.lastDiscussed <= end
            );
        }
        
        // Sort by frequency or importance
        if (filter.sortBy === 'importance') {
            filteredTopics.sort((a, b) => b.importance - a.importance);
        } else {
            filteredTopics.sort((a, b) => b.frequency - a.frequency);
        }
        
        // Limit results
        if (filter.limit) {
            filteredTopics = filteredTopics.slice(0, filter.limit);
        }
        
        // Format for visualization
        return {
            topics: filteredTopics.map(topic => ({
                name: topic.name,
                frequency: topic.frequency,
                importance: topic.importance,
                lastDiscussed: new Date(topic.lastDiscussed).toISOString(),
                firstDiscussed: new Date(topic.firstDiscussed).toISOString()
            }))
        };
    }
    
    /**
     * Generate timeline visualization data
     * @param {Object} filter - Filter criteria
     * @returns {Promise<Object>} Visualization data
     */
    async generateTimelineVisualization(filter) {
        const conversations = await this.getAllFromObjectStore(this.memoryStores.conversations);
        
        // Apply filters
        let filteredConversations = conversations;
        
        if (filter.minImportance) {
            filteredConversations = filteredConversations.filter(msg => msg.importance >= filter.minImportance);
        }
        
        if (filter.topic) {
            filteredConversations = filteredConversations.filter(msg => 
                msg.topic === filter.topic || (msg.allTopics && msg.allTopics.includes(filter.topic))
            );
        }
        
        if (filter.timeRange) {
            const { start, end } = filter.timeRange;
            filteredConversations = filteredConversations.filter(msg => 
                msg.timestamp >= start && msg.timestamp <= end
            );
        }
        
        // Sort by timestamp
        filteredConversations.sort((a, b) => a.timestamp - b.timestamp);
        
        // Limit results
        if (filter.limit) {
            filteredConversations = filteredConversations.slice(0, filter.limit);
        }
        
        // Format for visualization
        return {
            timeline: filteredConversations.map(msg => ({
                id: msg.id,
                message: msg.message,
                isUser: msg.isUser,
                timestamp: new Date(msg.timestamp).toISOString(),
                importance: msg.importance,
                topic: msg.topic
            }))
        };
    }
    
    /**
     * Generate relationship visualization data
     * @param {Object} filter - Filter criteria
     * @returns {Promise<Object>} Visualization data
     */
    async generateRelationshipVisualization(filter) {
        const relationships = await this.getAllFromObjectStore(this.memoryStores.relationships);
        
        // Apply filters
        let filteredRelationships = relationships;
        
        if (filter.type) {
            filteredRelationships = filteredRelationships.filter(rel => rel.type === filter.type);
        }
        
        if (filter.minImportance) {
            filteredRelationships = filteredRelationships.filter(rel => rel.importance >= filter.minImportance);
        }
        
        if (filter.minMentions) {
            filteredRelationships = filteredRelationships.filter(rel => rel.mentionCount >= filter.minMentions);
        }
        
        // Sort by importance or mention count
        if (filter.sortBy === 'mentions') {
            filteredRelationships.sort((a, b) => b.mentionCount - a.mentionCount);
        } else {
            filteredRelationships.sort((a, b) => b.importance - a.importance);
        }
        
        // Limit results
        if (filter.limit) {
            filteredRelationships = filteredRelationships.slice(0, filter.limit);
        }
        
        // Format for visualization
        return {
            relationships: filteredRelationships.map(rel => ({
                name: rel.name,
                type: rel.type,
                importance: rel.importance,
                mentionCount: rel.mentionCount,
                lastMentioned: new Date(rel.lastMentioned).toISOString(),
                firstMentioned: new Date(rel.firstMentioned).toISOString()
            }))
        };
    }
    
    /**
     * Generate fact visualization data
     * @param {Object} filter - Filter criteria
     * @returns {Promise<Object>} Visualization data
     */
    async generateFactVisualization(filter) {
        const facts = await this.getAllFromObjectStore(this.memoryStores.facts);
        
        // Apply filters
        let filteredFacts = facts;
        
        if (filter.category) {
            filteredFacts = filteredFacts.filter(fact => fact.category === filter.category);
        }
        
        if (filter.minImportance) {
            filteredFacts = filteredFacts.filter(fact => fact.importance >= filter.minImportance);
        }
        
        if (filter.timeRange) {
            const { start, end } = filter.timeRange;
            filteredFacts = filteredFacts.filter(fact => 
                fact.timestamp >= start && fact.timestamp <= end
            );
        }
        
        // Sort by importance or timestamp
        if (filter.sortBy === 'timestamp') {
            filteredFacts.sort((a, b) => b.timestamp - a.timestamp);
        } else {
            filteredFacts.sort((a, b) => b.importance - a.importance);
        }
        
        // Limit results
        if (filter.limit) {
            filteredFacts = filteredFacts.slice(0, filter.limit);
        }
        
        // Format for visualization
        return {
            facts: filteredFacts.map(fact => ({
                key: fact.key,
                value: fact.value,
                category: fact.category,
                importance: fact.importance,
                timestamp: new Date(fact.timestamp).toISOString(),
                updateCount: fact.updateCount || 0
            }))
        };
    }
    
    /**
     * Generate importance visualization data
     * @param {Object} filter - Filter criteria
     * @returns {Promise<Object>} Visualization data
     */
    async generateImportanceVisualization(filter) {
        // Get data from all stores
        const facts = await this.getAllFromObjectStore(this.memoryStores.facts);
        const conversations = await this.getAllFromObjectStore(this.memoryStores.conversations);
        const preferences = await this.getAllFromObjectStore(this.memoryStores.preferences);
        const relationships = await this.getAllFromObjectStore(this.memoryStores.relationships);
        
        // Group items by importance range
        const importanceRanges = [
            { min: 0.9, max: 1.0, label: 'Critical' },
            { min: 0.7, max: 0.9, label: 'High' },
            { min: 0.5, max: 0.7, label: 'Medium' },
            { min: 0.3, max: 0.5, label: 'Low' },
            { min: 0.0, max: 0.3, label: 'Transient' }
        ];
        
        const distribution = importanceRanges.map(range => {
            const factsInRange = facts.filter(item => 
                item.importance >= range.min && item.importance < range.max
            ).length;
            
            const conversationsInRange = conversations.filter(item => 
                item.importance >= range.min && item.importance < range.max
            ).length;
            
            const preferencesInRange = preferences.filter(item => 
                item.importance >= range.min && item.importance < range.max
            ).length;
            
            const relationshipsInRange = relationships.filter(item => 
                item.importance >= range.min && item.importance < range.max
            ).length;
            
            return {
                range: range.label,
                facts: factsInRange,
                conversations: conversationsInRange,
                preferences: preferencesInRange,
                relationships: relationshipsInRange,
                total: factsInRange + conversationsInRange + preferencesInRange + relationshipsInRange
            };
        });
        
        return {
            distribution,
            totals: {
                facts: facts.length,
                conversations: conversations.length,
                preferences: preferences.length,
                relationships: relationships.length,
                total: facts.length + conversations.length + preferences.length + relationships.length
            }
        };
    }
    
    /**
     * Check if memory consolidation is needed
     */
    async checkMemoryConsolidation() {
        const now = Date.now();
        
        // Check if enough time has passed since last consolidation
        if (now - this.lastConsolidationTime >= this.consolidationInterval) {
            await this.consolidateMemory();
            this.lastConsolidationTime = now;
        }
    }
    
    /**
     * Consolidate memory by removing expired items and optimizing storage
     */
    async consolidateMemory() {
        try {
            console.log('Starting memory consolidation...');
            
            // Remove expired items from each store
            await this.removeExpiredItems(this.memoryStores.facts);
            await this.removeExpiredItems(this.memoryStores.conversations);
            await this.removeExpiredItems(this.memoryStores.preferences);
            
            // Clear memory cache
            this.clearMemoryCache();
            
            console.log('Memory consolidation completed');
            
            // Publish consolidation event
            this.eventSystem.publish('memory-consolidated', {
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Error during memory consolidation:', error);
        }
    }
    
    /**
     * Remove expired items from a store
     * @param {string} storeName - Name of the store
     */
    async removeExpiredItems(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            
            // Get all items with expiration time
            const index = store.index('expirationTime');
            const now = Date.now();
            
            // Range for expired items (not null and less than now)
            const range = IDBKeyRange.upperBound(now);
            
            let count = 0;
            
            index.openCursor(range).onsuccess = (event) => {
                const cursor = event.target.result;
                
                if (cursor) {
                    // Skip items with null expiration time (never expire)
                    if (cursor.value.expirationTime !== null) {
                        // Delete expired item
                        store.delete(cursor.primaryKey);
                        count++;
                    }
                    
                    cursor.continue();
                }
            };
            
            transaction.oncomplete = () => {
                console.log(`Removed ${count} expired items from ${storeName}`);
                resolve(count);
            };
            
            transaction.onerror = (event) => {
                reject(new Error(`Error removing expired items from ${storeName}: ${event.target.error}`));
            };
        });
    }
    
    /**
     * Clear memory cache
     */
    clearMemoryCache() {
        Object.values(this.memoryCache).forEach(cache => cache.clear());
    }
    
    /**
     * Export memory data
     */
    async exportMemory() {
        try {
            const exportData = {};
            
            // Export data from each store
            for (const storeName of Object.values(this.memoryStores)) {
                exportData[storeName] = await this.getAllFromObjectStore(storeName);
            }
            
            // Add metadata
            exportData.metadata = {
                exportTime: Date.now(),
                version: this.dbVersion,
                dbName: this.dbName
            };
            
            // Convert to JSON string
            const exportJson = JSON.stringify(exportData, null, 2);
            
            // Publish export data
            this.eventSystem.publish('memory-export-data', {
                data: exportJson,
                metadata: exportData.metadata
            });
            
            return exportJson;
        } catch (error) {
            console.error('Error exporting memory:', error);
            
            // Publish export error
            this.eventSystem.publish('memory-export-data', {
                error: error.message
            });
            
            throw error;
        }
    }
    
    /**
     * Import memory data
     * @param {string|Object} memoryData - Memory data to import
     */
    async importMemory(memoryData) {
        try {
            // Parse data if it's a string
            const data = typeof memoryData === 'string' ? JSON.parse(memoryData) : memoryData;
            
            // Validate data
            if (!data.metadata) {
                throw new Error('Invalid memory data: missing metadata');
            }
            
            // Import data to each store
            for (const storeName of Object.values(this.memoryStores)) {
                if (data[storeName]) {
                    await this.importToObjectStore(storeName, data[storeName]);
                }
            }
            
            // Clear memory cache
            this.clearMemoryCache();
            
            // Publish import success event
            this.eventSystem.publish('memory-import-completed', {
                success: true,
                metadata: data.metadata
            });
            
            console.log('Memory import completed successfully');
        } catch (error) {
            console.error('Error importing memory:', error);
            
            // Publish import error event
            this.eventSystem.publish('memory-import-completed', {
                success: false,
                error: error.message
            });
            
            throw error;
        }
    }
    
    /**
     * Import data to an object store
     * @param {string} storeName - Name of the store
     * @param {Array} items - Items to import
     */
    async importToObjectStore(storeName, items) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            
            let count = 0;
            
            // Process each item
            for (const item of items) {
                const request = store.put(item);
                
                request.onsuccess = () => {
                    count++;
                };
                
                request.onerror = (event) => {
                    console.error(`Error importing item to ${storeName}:`, event.target.error);
                };
            }
            
            transaction.oncomplete = () => {
                console.log(`Imported ${count} items to ${storeName}`);
                resolve(count);
            };
            
            transaction.onerror = (event) => {
                reject(new Error(`Error importing to ${storeName}: ${event.target.error}`));
            };
        });
    }
    
    /**
     * Store an item in an object store
     * @param {string} storeName - Name of the store
     * @param {Object} item - Item to store
     * @returns {Promise} Promise that resolves when the item is stored
     */
    storeInObjectStore(storeName, item) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            
            const request = store.put(item);
            
            request.onsuccess = () => {
                resolve();
            };
            
            request.onerror = (event) => {
                reject(new Error(`Error storing item in ${storeName}: ${event.target.error}`));
            };
        });
    }
    
    /**
     * Get an item from an object store
     * @param {string} storeName - Name of the store
     * @param {string|number} key - Key of the item
     * @returns {Promise<Object>} Promise that resolves with the item or null if not found
     */
    getFromObjectStore(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            
            const request = store.get(key);
            
            request.onsuccess = () => {
                resolve(request.result || null);
            };
            
            request.onerror = (event) => {
                reject(new Error(`Error getting item from ${storeName}: ${event.target.error}`));
            };
        });
    }
    
    /**
     * Get all items from an object store
     * @param {string} storeName - Name of the store
     * @returns {Promise<Array>} Promise that resolves with an array of items
     */
    getAllFromObjectStore(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            
            const request = store.getAll();
            
            request.onsuccess = () => {
                resolve(request.result || []);
            };
            
            request.onerror = (event) => {
                reject(new Error(`Error getting all items from ${storeName}: ${event.target.error}`));
            };
        });
    }
}

// Create and export singleton instance
const longTermMemorySystem = new LongTermMemorySystem();
export default longTermMemorySystem;
