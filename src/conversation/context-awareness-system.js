/**
 * Context Awareness System
 * 
 * This system enhances MeAI's ability to maintain context across longer conversations
 * and multiple sessions, with hierarchical importance tracking and reference resolution.
 */

class ContextAwarenessSystem {
    constructor(config = {}) {
        // Initialize dependencies
        this.eventSystem = window.eventSystem;
        this.storageManager = window.storageManager;
        this.longTermMemory = window.longTermMemorySystem;
        
        // Configuration
        this.config = {
            contextHistoryLength: 10,
            contextPersistenceDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
            referenceResolutionThreshold: 0.7,
            contextImportanceThresholds: {
                critical: 0.9,
                high: 0.7,
                medium: 0.5,
                low: 0.3
            },
            ...config
        };
        
        // Context state
        this.state = {
            initialized: false,
            activeContext: {
                id: null,
                name: null,
                level: 0,
                parent: null,
                children: [],
                references: {},
                entities: {},
                topics: [],
                startTime: null,
                lastUpdateTime: null,
                importance: 0.5
            },
            contextHistory: [],
            contextHierarchy: [],
            recentReferences: new Map(),
            sessionContexts: []
        };
    }
    
    /**
     * Initialize the context awareness system
     */
    async initialize() {
        try {
            console.log('Initializing Context Awareness System...');
            
            // Load previous contexts from storage
            await this.loadContexts();
            
            // Create a new session context
            this.createSessionContext();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Mark as initialized
            this.state.initialized = true;
            
            console.log('Context Awareness System initialized successfully');
            
            return true;
        } catch (error) {
            console.error('Error initializing Context Awareness System:', error);
            return false;
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for session end events
        this.eventSystem.subscribe('session-end', () => {
            this.persistCurrentContext();
        });
        
        // Listen for context switch events
        this.eventSystem.subscribe('context-switch-request', (data) => {
            this.switchContext(data.contextId).then(result => {
                this.eventSystem.publish('context-switch-response', {
                    requestId: data.requestId,
                    success: result.success,
                    context: result.context
                });
            });
        });
        
        // Listen for reference resolution requests
        this.eventSystem.subscribe('reference-resolution-request', (data) => {
            this.resolveReference(data.reference, data.context).then(result => {
                this.eventSystem.publish('reference-resolution-response', {
                    requestId: data.requestId,
                    reference: data.reference,
                    resolution: result
                });
            });
        });
    }
    
    /**
     * Load contexts from persistent storage
     */
    async loadContexts() {
        try {
            // Load context history
            const contextHistory = await this.storageManager.getIndexedDB('contexts', 'history');
            if (contextHistory && Array.isArray(contextHistory.items)) {
                this.state.contextHistory = contextHistory.items;
                
                // Filter out expired contexts
                const now = Date.now();
                this.state.contextHistory = this.state.contextHistory.filter(context => {
                    const age = now - context.lastUpdateTime;
                    return age < this.config.contextPersistenceDuration;
                });
            }
            
            // Load context hierarchy
            const contextHierarchy = await this.storageManager.getIndexedDB('contexts', 'hierarchy');
            if (contextHierarchy && Array.isArray(contextHierarchy.items)) {
                this.state.contextHierarchy = contextHierarchy.items;
            }
            
            // Load recent references
            const recentReferences = await this.storageManager.getIndexedDB('contexts', 'references');
            if (recentReferences && recentReferences.items) {
                this.state.recentReferences = new Map(Object.entries(recentReferences.items));
            }
            
            return true;
        } catch (error) {
            console.error('Error loading contexts:', error);
            
            // Initialize with empty arrays if loading fails
            this.state.contextHistory = [];
            this.state.contextHierarchy = [];
            this.state.recentReferences = new Map();
            
            return false;
        }
    }
    
    /**
     * Create a new session context
     */
    createSessionContext() {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const sessionContext = {
            id: sessionId,
            name: 'Current Session',
            level: 0,
            parent: null,
            children: [],
            references: {},
            entities: {},
            topics: [],
            startTime: Date.now(),
            lastUpdateTime: Date.now(),
            importance: 0.5
        };
        
        // Set as active context
        this.state.activeContext = sessionContext;
        
        // Add to session contexts
        this.state.sessionContexts.push(sessionContext);
        
        // Publish context creation event
        this.eventSystem.publish('context-created', {
            contextId: sessionId,
            contextType: 'session'
        });
        
        return sessionContext;
    }
    
    /**
     * Process a message to update context
     * @param {Object} messageData - The message data
     * @returns {Object} - The updated context
     */
    async processMessage(messageData) {
        try {
            // Update active context with message data
            const activeContext = this.state.activeContext;
            
            // Update last update time
            activeContext.lastUpdateTime = Date.now();
            
            // Extract entities from message
            const entities = await this.extractEntities(messageData.content);
            
            // Update entities in active context
            for (const [entity, data] of Object.entries(entities)) {
                activeContext.entities[entity] = {
                    ...activeContext.entities[entity],
                    ...data,
                    lastMentioned: Date.now()
                };
            }
            
            // Extract potential references
            const references = await this.extractReferences(messageData.content);
            
            // Update references in active context
            for (const [reference, resolution] of Object.entries(references)) {
                activeContext.references[reference] = resolution;
                this.state.recentReferences.set(reference, resolution);
            }
            
            // Check for context switches
            const contextSwitch = await this.detectContextSwitch(messageData);
            if (contextSwitch.detected) {
                await this.switchContext(contextSwitch.targetContextId);
            }
            
            // Calculate context importance
            activeContext.importance = this.calculateContextImportance(activeContext);
            
            // Publish context update event
            this.eventSystem.publish('context-updated', {
                contextId: activeContext.id,
                entities: Object.keys(entities),
                references: Object.keys(references),
                contextSwitch: contextSwitch.detected
            });
            
            return {
                success: true,
                activeContext: this.state.activeContext
            };
        } catch (error) {
            console.error('Error processing message for context:', error);
            
            return {
                success: false,
                error: error.message,
                activeContext: this.state.activeContext
            };
        }
    }
    
    /**
     * Extract entities from text
     * @param {string} text - The text to extract entities from
     * @returns {Object} - The extracted entities
     */
    async extractEntities(text) {
        // This would ideally use a more sophisticated NLP library
        // For now, we'll use a simple regex-based approach
        
        const entities = {};
        
        // Extract potential named entities (capitalized words)
        const namedEntityRegex = /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\b/g;
        const namedEntities = [...text.matchAll(namedEntityRegex)].map(match => match[1]);
        
        for (const entity of namedEntities) {
            entities[entity] = {
                type: 'named_entity',
                confidence: 0.7,
                occurrences: (entities[entity]?.occurrences || 0) + 1
            };
        }
        
        // Extract potential dates
        const dateRegex = /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}\b|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g;
        const dates = [...text.matchAll(dateRegex)].map(match => match[0]);
        
        for (const date of dates) {
            entities[date] = {
                type: 'date',
                confidence: 0.8,
                occurrences: (entities[date]?.occurrences || 0) + 1
            };
        }
        
        // Extract potential locations (simple approach)
        const locationIndicators = ['in', 'at', 'from', 'to'];
        const words = text.split(/\s+/);
        
        for (let i = 0; i < words.length - 1; i++) {
            if (locationIndicators.includes(words[i].toLowerCase()) && 
                words[i+1].match(/^[A-Z]/) && 
                !['I', 'A', 'An', 'The'].includes(words[i+1])) {
                
                const potentialLocation = words[i+1].replace(/[.,!?;:]/g, '');
                
                entities[potentialLocation] = {
                    type: 'location',
                    confidence: 0.6,
                    occurrences: (entities[potentialLocation]?.occurrences || 0) + 1
                };
            }
        }
        
        return entities;
    }
    
    /**
     * Extract references from text
     * @param {string} text - The text to extract references from
     * @returns {Object} - The extracted references
     */
    async extractReferences(text) {
        const references = {};
        
        // Extract pronouns
        const pronounRegex = /\b(he|she|it|they|his|her|its|their|them)\b/gi;
        const pronouns = [...text.matchAll(pronounRegex)].map(match => match[0].toLowerCase());
        
        // Resolve pronouns based on context
        for (const pronoun of pronouns) {
            const resolution = await this.resolveReference(pronoun, this.state.activeContext);
            if (resolution.entity) {
                references[pronoun] = resolution;
            }
        }
        
        // Extract demonstrative references (this, that, these, those)
        const demonstrativeRegex = /\b(this|that|these|those)\b/gi;
        const demonstratives = [...text.matchAll(demonstrativeRegex)].map(match => match[0].toLowerCase());
        
        for (const demonstrative of demonstratives) {
            const resolution = await this.resolveReference(demonstrative, this.state.activeContext);
            if (resolution.entity) {
                references[demonstrative] = resolution;
            }
        }
        
        return references;
    }
    
    /**
     * Resolve a reference to its entity
     * @param {string} reference - The reference to resolve
     * @param {Object} context - The context to resolve in
     * @returns {Object} - The resolved reference
     */
    async resolveReference(reference, context) {
        // Default resolution result
        const defaultResolution = {
            reference: reference,
            entity: null,
            confidence: 0,
            source: null
        };
        
        // Check if reference is already resolved in current context
        if (context.references[reference]) {
            return {
                ...context.references[reference],
                confidence: context.references[reference].confidence * 0.9, // Slightly reduce confidence for older references
                source: 'current_context'
            };
        }
        
        // Check recent references
        if (this.state.recentReferences.has(reference)) {
            const recentResolution = this.state.recentReferences.get(reference);
            return {
                ...recentResolution,
                confidence: recentResolution.confidence * 0.8, // Reduce confidence for recent references
                source: 'recent_references'
            };
        }
        
        // Attempt to resolve based on pronoun type
        const lowerRef = reference.toLowerCase();
        
        // Gender-specific pronouns
        if (['he', 'his', 'him'].includes(lowerRef)) {
            // Find most recent male entity
            const maleEntities = Object.entries(context.entities)
                .filter(([_, data]) => data.gender === 'male')
                .sort((a, b) => b[1].lastMentioned - a[1].lastMentioned);
            
            if (maleEntities.length > 0) {
                return {
                    reference: reference,
                    entity: maleEntities[0][0],
                    confidence: 0.7,
                    source: 'gender_match'
                };
            }
        }
        
        if (['she', 'her', 'hers'].includes(lowerRef)) {
            // Find most recent female entity
            const femaleEntities = Object.entries(context.entities)
                .filter(([_, data]) => data.gender === 'female')
                .sort((a, b) => b[1].lastMentioned - a[1].lastMentioned);
            
            if (femaleEntities.length > 0) {
                return {
                    reference: reference,
                    entity: femaleEntities[0][0],
                    confidence: 0.7,
                    source: 'gender_match'
                };
            }
        }
        
        // Neutral pronouns (it, its)
        if (['it', 'its'].includes(lowerRef)) {
            // Find most recent non-person entity
            const nonPersonEntities = Object.entries(context.entities)
                .filter(([_, data]) => data.type !== 'person')
                .sort((a, b) => b[1].lastMentioned - a[1].lastMentioned);
            
            if (nonPersonEntities.length > 0) {
                return {
                    reference: reference,
                    entity: nonPersonEntities[0][0],
                    confidence: 0.6,
                    source: 'type_match'
                };
            }
        }
        
        // Plural pronouns (they, them, their)
        if (['they', 'them', 'their', 'theirs'].includes(lowerRef)) {
            // Find most recent plural entity or group of entities
            const pluralEntities = Object.entries(context.entities)
                .filter(([_, data]) => data.isPlural || data.type === 'group')
                .sort((a, b) => b[1].lastMentioned - a[1].lastMentioned);
            
            if (pluralEntities.length > 0) {
                return {
                    reference: reference,
                    entity: pluralEntities[0][0],
                    confidence: 0.6,
                    source: 'plurality_match'
                };
            }
            
            // If no plural entity found, return the two most recently mentioned entities
            const recentEntities = Object.entries(context.entities)
                .sort((a, b) => b[1].lastMentioned - a[1].lastMentioned)
                .slice(0, 2)
                .map(entry => entry[0]);
            
            if (recentEntities.length >= 2) {
                return {
                    reference: reference,
                    entity: recentEntities,
                    confidence: 0.5,
                    source: 'recent_group'
                };
            }
        }
        
        // Demonstrative references (this, that, these, those)
        if (['this', 'that'].includes(lowerRef)) {
            // Find most recent singular entity
            const singularEntities = Object.entries(context.entities)
                .filter(([_, data]) => !data.isPlural)
                .sort((a, b) => b[1].lastMentioned - a[1].lastMentioned);
            
            if (singularEntities.length > 0) {
                return {
                    reference: reference,
                    entity: singularEntities[0][0],
                    confidence: 0.5,
                    source: 'demonstrative_singular'
                };
            }
        }
        
        if (['these', 'those'].includes(lowerRef)) {
            // Find most recent plural entities
            const pluralEntities = Object.entries(context.entities)
                .filter(([_, data]) => data.isPlural || data.type === 'group')
                .sort((a, b) => b[1].lastMentioned - a[1].lastMentioned);
            
            if (pluralEntities.length > 0) {
                return {
                    reference: reference,
                    entity: pluralEntities[0][0],
                    confidence: 0.5,
                    source: 'demonstrative_plural'
                };
            }
            
            // If no plural entity found, return the three most recently mentioned entities
            const recentEntities = Object.entries(context.entities)
                .sort((a, b) => b[1].lastMentioned - a[1].lastMentioned)
                .slice(0, 3)
                .map(entry => entry[0]);
            
            if (recentEntities.length >= 2) {
                return {
                    reference: reference,
                    entity: recentEntities,
                    confidence: 0.4,
                    source: 'demonstrative_group'
                };
            }
        }
        
        // If no resolution found, return default
        return defaultResolution;
    }
    
    /**
     * Detect if a context switch is needed
     * @param {Object} messageData - The message data
     * @returns {Object} - Detection result
     */
    async detectContextSwitch(messageData) {
        // Default result
        const defaultResult = {
            detected: false,
            confidence: 0,
            targetContextId: null,
            reason: null
        };
        
        // Check for explicit context switch indicators
        const explicitSwitchRegex = /\b(?:let's talk about|speaking of|regarding|about|on the topic of|switching to)\b/i;
        if (explicitSwitchRegex.test(messageData.content)) {
            // Extract the topic after the switch indicator
            const match = messageData.content.match(explicitSwitchRegex);
            if (match) {
                const switchIndicator = match[0];
                const afterIndicator = messageData.content.substring(messageData.content.indexOf(switchIndicator) + switchIndicator.length).trim();
                
                // Extract the first noun phrase after the indicator
                const nounPhraseRegex = /\b([A-Za-z]+(?:\s+[A-Za-z]+){0,3})\b/;
                const nounMatch = afterIndicator.match(nounPhraseRegex);
                
                if (nounMatch) {
                    const topic = nounMatch[1];
                    
                    // Check if this topic exists in context history
                    const existingContext = this.state.contextHistory.find(context => 
                        context.topics.some(t => t.toLowerCase() === topic.toLowerCase())
                    );
                    
                    if (existingContext) {
                        return {
                            detected: true,
                            confidence: 0.8,
                            targetContextId: existingContext.id,
                            reason: 'explicit_topic_mention'
                        };
                    } else {
                        // Create a new context for this topic
                        const newContextId = `context_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                        
                        const newContext = {
                            id: newContextId,
                            name: topic,
                            level: this.state.activeContext.level + 1,
                            parent: this.state.activeContext.id,
                            children: [],
                            references: {},
                            entities: {},
                            topics: [topic],
                            startTime: Date.now(),
                            lastUpdateTime: Date.now(),
                            importance: 0.5
                        };
                        
                        // Add to context hierarchy
                        this.state.contextHierarchy.push(newContext);
                        
                        // Add as child to current context
                        this.state.activeContext.children.push(newContextId);
                        
                        return {
                            detected: true,
                            confidence: 0.7,
                            targetContextId: newContextId,
                            reason: 'new_topic_creation'
                        };
                    }
                }
            }
        }
        
        // Check for significant topic change
        if (messageData.content.length > 50) {
            // This would ideally use more sophisticated topic modeling
            // For now, we'll use a simple approach
            
            // Extract potential topics
            const topics = await this.extractTopics(messageData.content);
            
            // Check if any topic is significantly different from current context
            const currentTopics = this.state.activeContext.topics;
            
            let topicOverlap = 0;
            if (currentTopics.length > 0 && topics.length > 0) {
                const matchingTopics = topics.filter(topic => 
                    currentTopics.some(currentTopic => 
                        currentTopic.toLowerCase().includes(topic.toLowerCase()) ||
                        topic.toLowerCase().includes(currentTopic.toLowerCase())
                    )
                );
                
                topicOverlap = matchingTopics.length / Math.max(topics.length, currentTopics.length);
            }
            
            // If low topic overlap, check for existing context or create new one
            if (topicOverlap < 0.3 && topics.length > 0) {
                // Check if a context exists for the main topic
                const mainTopic = topics[0];
                
                const existingContext = this.state.contextHistory.find(context => 
                    context.topics.some(t => t.toLowerCase() === mainTopic.toLowerCase())
                );
                
                if (existingContext) {
                    return {
                        detected: true,
                        confidence: 0.6,
                        targetContextId: existingContext.id,
                        reason: 'topic_shift_existing'
                    };
                } else if (topics.length > 1) {
                    // Create a new context for this topic
                    const newContextId = `context_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    
                    const newContext = {
                        id: newContextId,
                        name: mainTopic,
                        level: this.state.activeContext.level + 1,
                        parent: this.state.activeContext.id,
                        children: [],
                        references: {},
                        entities: {},
                        topics: topics,
                        startTime: Date.now(),
                        lastUpdateTime: Date.now(),
                        importance: 0.5
                    };
                    
                    // Add to context hierarchy
                    this.state.contextHierarchy.push(newContext);
                    
                    // Add as child to current context
                    this.state.activeContext.children.push(newContextId);
                    
                    return {
                        detected: true,
                        confidence: 0.5,
                        targetContextId: newContextId,
                        reason: 'topic_shift_new'
                    };
                }
            }
        }
        
        return defaultResult;
    }
    
    /**
     * Extract topics from text
     * @param {string} text - The text to extract topics from
     * @returns {Array} - The extracted topics
     */
    async extractTopics(text) {
        // This would ideally use a more sophisticated topic modeling approach
        // For now, we'll use a simple keyword extraction
        
        // Remove common stop words
        const stopWords = ['a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 
                          'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
                          'to', 'from', 'in', 'out', 'on', 'off', 'over', 'under', 'again',
                          'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
                          'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other',
                          'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
                          'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don',
                          'should', 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren',
                          'couldn', 'didn', 'doesn', 'hadn', 'hasn', 'haven', 'isn', 'ma',
                          'mightn', 'mustn', 'needn', 'shan', 'shouldn', 'wasn', 'weren', 'won',
                          'wouldn', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
                          'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his',
                          'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself',
                          'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who',
                          'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was',
                          'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do',
                          'does', 'did', 'doing', 'would', 'should', 'could', 'ought', 'i\'m',
                          'you\'re', 'he\'s', 'she\'s', 'it\'s', 'we\'re', 'they\'re', 'i\'ve',
                          'you\'ve', 'we\'ve', 'they\'ve', 'i\'d', 'you\'d', 'he\'d', 'she\'d',
                          'we\'d', 'they\'d', 'i\'ll', 'you\'ll', 'he\'ll', 'she\'ll', 'we\'ll',
                          'they\'ll', 'isn\'t', 'aren\'t', 'wasn\'t', 'weren\'t', 'hasn\'t',
                          'haven\'t', 'hadn\'t', 'doesn\'t', 'don\'t', 'didn\'t', 'won\'t',
                          'wouldn\'t', 'shan\'t', 'shouldn\'t', 'can\'t', 'cannot', 'couldn\'t',
                          'mustn\'t', 'let\'s', 'that\'s', 'who\'s', 'what\'s', 'here\'s',
                          'there\'s', 'when\'s', 'where\'s', 'why\'s', 'how\'s'];
        
        // Tokenize and clean text
        const tokens = text.toLowerCase()
            .replace(/[^\w\s]/g, '') // Remove punctuation
            .split(/\s+/) // Split on whitespace
            .filter(word => word.length > 2 && !stopWords.includes(word)); // Remove stop words and short words
        
        // Count word frequencies
        const wordFreq = {};
        tokens.forEach(word => {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        });
        
        // Sort by frequency
        const sortedWords = Object.entries(wordFreq)
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0]);
        
        // Extract top words as topics
        const topics = sortedWords.slice(0, 5);
        
        // Try to extract noun phrases (simple approach)
        const nounPhrases = [];
        const words = text.split(/\s+/);
        
        for (let i = 0; i < words.length - 1; i++) {
            // Look for adjective + noun or noun + noun patterns
            if (words[i].match(/^[A-Za-z]+$/) && words[i+1].match(/^[A-Za-z]+$/)) {
                const phrase = `${words[i]} ${words[i+1]}`.toLowerCase().replace(/[^\w\s]/g, '');
                if (!stopWords.includes(words[i].toLowerCase()) && 
                    !stopWords.includes(words[i+1].toLowerCase())) {
                    nounPhrases.push(phrase);
                }
            }
        }
        
        // Add most frequent noun phrases
        const phraseFreq = {};
        nounPhrases.forEach(phrase => {
            phraseFreq[phrase] = (phraseFreq[phrase] || 0) + 1;
        });
        
        const sortedPhrases = Object.entries(phraseFreq)
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0]);
        
        // Combine single words and phrases, prioritizing phrases
        const combinedTopics = [...sortedPhrases.slice(0, 3), ...topics.filter(topic => 
            !sortedPhrases.slice(0, 3).some(phrase => phrase.includes(topic))
        )].slice(0, 5);
        
        return combinedTopics;
    }
    
    /**
     * Switch to a different context
     * @param {string} contextId - The ID of the context to switch to
     * @returns {Object} - The result of the switch
     */
    async switchContext(contextId) {
        try {
            // Save current context
            await this.persistCurrentContext();
            
            // Find target context
            let targetContext = this.state.contextHierarchy.find(context => context.id === contextId);
            
            // If not found in hierarchy, check history
            if (!targetContext) {
                targetContext = this.state.contextHistory.find(context => context.id === contextId);
            }
            
            // If still not found, return error
            if (!targetContext) {
                return {
                    success: false,
                    error: 'Context not found',
                    context: this.state.activeContext
                };
            }
            
            // Update target context
            targetContext.lastUpdateTime = Date.now();
            
            // Set as active context
            this.state.activeContext = targetContext;
            
            // Publish context switch event
            this.eventSystem.publish('context-switched', {
                previousContextId: contextId,
                newContextId: targetContext.id
            });
            
            return {
                success: true,
                context: targetContext
            };
        } catch (error) {
            console.error('Error switching context:', error);
            
            return {
                success: false,
                error: error.message,
                context: this.state.activeContext
            };
        }
    }
    
    /**
     * Persist the current context to storage
     */
    async persistCurrentContext() {
        try {
            const activeContext = this.state.activeContext;
            
            // Calculate importance
            activeContext.importance = this.calculateContextImportance(activeContext);
            
            // Add to context history if important enough
            if (activeContext.importance >= this.config.contextImportanceThresholds.low) {
                // Check if already exists in history
                const existingIndex = this.state.contextHistory.findIndex(
                    context => context.id === activeContext.id
                );
                
                if (existingIndex >= 0) {
                    // Update existing context
                    this.state.contextHistory[existingIndex] = activeContext;
                } else {
                    // Add to history
                    this.state.contextHistory.push(activeContext);
                }
                
                // Limit history size
                if (this.state.contextHistory.length > 100) {
                    // Sort by importance and remove least important
                    this.state.contextHistory.sort((a, b) => a.importance - b.importance);
                    this.state.contextHistory = this.state.contextHistory.slice(-100);
                }
                
                // Save to storage
                await this.storageManager.setIndexedDB('contexts', {
                    id: 'history',
                    items: this.state.contextHistory
                });
            }
            
            // Update context hierarchy
            const hierarchyIndex = this.state.contextHierarchy.findIndex(
                context => context.id === activeContext.id
            );
            
            if (hierarchyIndex >= 0) {
                // Update existing context
                this.state.contextHierarchy[hierarchyIndex] = activeContext;
            } else if (activeContext.level > 0) {
                // Add to hierarchy if not root
                this.state.contextHierarchy.push(activeContext);
            }
            
            // Save hierarchy to storage
            await this.storageManager.setIndexedDB('contexts', {
                id: 'hierarchy',
                items: this.state.contextHierarchy
            });
            
            // Save references
            await this.storageManager.setIndexedDB('contexts', {
                id: 'references',
                items: Object.fromEntries(this.state.recentReferences)
            });
            
            return true;
        } catch (error) {
            console.error('Error persisting context:', error);
            return false;
        }
    }
    
    /**
     * Calculate the importance of a context
     * @param {Object} context - The context to calculate importance for
     * @returns {number} - The importance score (0-1)
     */
    calculateContextImportance(context) {
        let importance = 0.5; // Default importance
        
        // Factors that increase importance
        const positiveFactors = [
            // Number of entities
            Math.min(Object.keys(context.entities).length / 10, 1) * 0.2,
            
            // Number of topics
            Math.min(context.topics.length / 5, 1) * 0.2,
            
            // Context duration (up to 10 minutes)
            Math.min((context.lastUpdateTime - context.startTime) / (10 * 60 * 1000), 1) * 0.1,
            
            // Recency (inverse of age, up to 1 day)
            Math.max(1 - (Date.now() - context.lastUpdateTime) / (24 * 60 * 60 * 1000), 0) * 0.3,
            
            // Number of children contexts
            Math.min(context.children.length / 3, 1) * 0.1
        ];
        
        // Add positive factors
        importance += positiveFactors.reduce((sum, factor) => sum + factor, 0);
        
        // Cap at 0-1 range
        return Math.max(0, Math.min(1, importance));
    }
    
    /**
     * Retrieve context based on a query
     * @param {string} query - The query to retrieve context for
     * @returns {Object} - The retrieved context
     */
    async retrieveContext(query) {
        try {
            // Extract topics from query
            const queryTopics = await this.extractTopics(query);
            
            // Find contexts that match the topics
            const matchingContexts = this.state.contextHistory.filter(context => 
                context.topics.some(topic => 
                    queryTopics.some(queryTopic => 
                        topic.toLowerCase().includes(queryTopic.toLowerCase()) ||
                        queryTopic.toLowerCase().includes(topic.toLowerCase())
                    )
                )
            );
            
            // Score contexts based on relevance
            const scoredContexts = matchingContexts.map(context => {
                // Calculate topic overlap
                const topicMatches = context.topics.filter(topic => 
                    queryTopics.some(queryTopic => 
                        topic.toLowerCase().includes(queryTopic.toLowerCase()) ||
                        queryTopic.toLowerCase().includes(topic.toLowerCase())
                    )
                ).length;
                
                const topicOverlap = topicMatches / Math.max(context.topics.length, queryTopics.length);
                
                // Calculate recency score (higher for more recent contexts)
                const recencyScore = Math.max(1 - (Date.now() - context.lastUpdateTime) / (7 * 24 * 60 * 60 * 1000), 0);
                
                // Calculate importance score
                const importanceScore = context.importance;
                
                // Combined score
                const score = (topicOverlap * 0.5) + (recencyScore * 0.3) + (importanceScore * 0.2);
                
                return {
                    context,
                    score
                };
            });
            
            // Sort by score
            scoredContexts.sort((a, b) => b.score - a.score);
            
            // Return top contexts
            return {
                query,
                results: scoredContexts.slice(0, 3).map(item => ({
                    context: item.context,
                    relevance: item.score
                }))
            };
        } catch (error) {
            console.error('Error retrieving context:', error);
            
            return {
                query,
                results: [],
                error: error.message
            };
        }
    }
    
    /**
     * Get the current state of the context system
     * @returns {Object} - The current state
     */
    getState() {
        return {
            initialized: this.state.initialized,
            activeContext: this.state.activeContext,
            contextHistoryCount: this.state.contextHistory.length,
            contextHierarchyCount: this.state.contextHierarchy.length,
            recentReferencesCount: this.state.recentReferences.size
        };
    }
}

// Export the class
window.ContextAwarenessSystem = ContextAwarenessSystem;
