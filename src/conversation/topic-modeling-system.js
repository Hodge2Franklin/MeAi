/**
 * Topic Modeling System
 * 
 * This system enhances MeAI's ability to identify, track, and respond to conversation topics
 * with hierarchical topic modeling and interest tracking.
 */

class TopicModelingSystem {
    constructor(config = {}) {
        // Initialize dependencies
        this.eventSystem = window.eventSystem;
        this.storageManager = window.storageManager;
        this.contextAwarenessSystem = null; // Will be set during initialization
        
        // Configuration
        this.config = {
            minTopicConfidence: 0.6,
            maxTopicsPerMessage: 5,
            maxSubtopicsPerTopic: 3,
            topicHistorySize: 50,
            interestDecayRate: 0.95, // 5% decay per day for interests
            enableHierarchicalModeling: true,
            enableInterestTracking: true,
            ...config
        };
        
        // Topic knowledge base
        this.knowledgeBase = {
            topics: {},
            relationships: {},
            synonyms: {}
        };
        
        // Topic state
        this.state = {
            initialized: false,
            currentTopics: [],
            topicHistory: [],
            userInterests: {},
            conversationFocus: null,
            topicHierarchy: {}
        };
    }
    
    /**
     * Initialize the topic modeling system
     */
    async initialize() {
        try {
            console.log('Initializing Topic Modeling System...');
            
            // Get context awareness system if available
            if (window.contextAwarenessSystem) {
                this.contextAwarenessSystem = window.contextAwarenessSystem;
            }
            
            // Load knowledge base
            await this.loadKnowledgeBase();
            
            // Load previous state if available
            await this.loadState();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Mark as initialized
            this.state.initialized = true;
            
            console.log('Topic Modeling System initialized successfully');
            
            return true;
        } catch (error) {
            console.error('Error initializing Topic Modeling System:', error);
            return false;
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for topic detection requests
        this.eventSystem.subscribe('topic-detection-request', (data) => {
            this.detectTopics(data.text).then(topics => {
                this.eventSystem.publish('topic-detection-response', {
                    requestId: data.requestId,
                    topics: topics
                });
            });
        });
        
        // Listen for user interest requests
        this.eventSystem.subscribe('user-interests-request', (data) => {
            this.getUserInterests().then(interests => {
                this.eventSystem.publish('user-interests-response', {
                    requestId: data.requestId,
                    interests: interests
                });
            });
        });
        
        // Listen for topic relationship requests
        this.eventSystem.subscribe('topic-relationship-request', (data) => {
            this.getRelatedTopics(data.topic).then(related => {
                this.eventSystem.publish('topic-relationship-response', {
                    requestId: data.requestId,
                    topic: data.topic,
                    related: related
                });
            });
        });
    }
    
    /**
     * Load topic knowledge base
     */
    async loadKnowledgeBase() {
        try {
            // In a real implementation, this would load from a database or API
            // For this implementation, we'll use a simplified built-in knowledge base
            
            // Define some common topics and their relationships
            this.knowledgeBase.topics = {
                // Technology topics
                'technology': {
                    keywords: ['tech', 'technology', 'digital', 'electronic', 'innovation'],
                    subtopics: ['computers', 'software', 'internet', 'ai', 'gadgets', 'programming']
                },
                'computers': {
                    keywords: ['computer', 'pc', 'laptop', 'desktop', 'mac', 'windows'],
                    subtopics: ['hardware', 'operating systems']
                },
                'software': {
                    keywords: ['software', 'app', 'application', 'program', 'code'],
                    subtopics: ['operating systems', 'applications', 'programming']
                },
                'internet': {
                    keywords: ['internet', 'web', 'online', 'network', 'cloud', 'website'],
                    subtopics: ['social media', 'web development', 'cybersecurity']
                },
                'ai': {
                    keywords: ['ai', 'artificial intelligence', 'machine learning', 'ml', 'neural network', 'deep learning'],
                    subtopics: ['natural language processing', 'computer vision', 'robotics']
                },
                
                // Entertainment topics
                'entertainment': {
                    keywords: ['entertainment', 'fun', 'leisure', 'amusement', 'recreation'],
                    subtopics: ['movies', 'music', 'games', 'books', 'sports', 'television']
                },
                'movies': {
                    keywords: ['movie', 'film', 'cinema', 'theater', 'hollywood', 'actor', 'actress', 'director'],
                    subtopics: ['genres', 'actors', 'directors']
                },
                'music': {
                    keywords: ['music', 'song', 'album', 'band', 'concert', 'musician', 'singer'],
                    subtopics: ['genres', 'artists', 'instruments']
                },
                'games': {
                    keywords: ['game', 'gaming', 'video game', 'play', 'player', 'console'],
                    subtopics: ['video games', 'board games', 'card games']
                },
                
                // Science topics
                'science': {
                    keywords: ['science', 'scientific', 'research', 'discovery', 'experiment'],
                    subtopics: ['physics', 'biology', 'chemistry', 'astronomy', 'mathematics']
                },
                'physics': {
                    keywords: ['physics', 'physical', 'physicist', 'quantum', 'relativity', 'mechanics'],
                    subtopics: ['quantum physics', 'astrophysics', 'mechanics']
                },
                'biology': {
                    keywords: ['biology', 'biological', 'biologist', 'organism', 'cell', 'gene'],
                    subtopics: ['genetics', 'ecology', 'evolution']
                },
                
                // Health topics
                'health': {
                    keywords: ['health', 'healthy', 'wellness', 'wellbeing', 'medical', 'healthcare'],
                    subtopics: ['fitness', 'nutrition', 'medicine', 'mental health']
                },
                'fitness': {
                    keywords: ['fitness', 'exercise', 'workout', 'gym', 'training', 'sport'],
                    subtopics: ['cardio', 'strength training', 'yoga']
                },
                'nutrition': {
                    keywords: ['nutrition', 'diet', 'food', 'eating', 'nutrient', 'vitamin'],
                    subtopics: ['diets', 'vitamins', 'supplements']
                },
                
                // Business topics
                'business': {
                    keywords: ['business', 'company', 'corporate', 'industry', 'market', 'firm'],
                    subtopics: ['finance', 'marketing', 'entrepreneurship', 'management']
                },
                'finance': {
                    keywords: ['finance', 'financial', 'money', 'investment', 'banking', 'economy'],
                    subtopics: ['investing', 'banking', 'economics']
                },
                'marketing': {
                    keywords: ['marketing', 'advertise', 'promotion', 'brand', 'market', 'customer'],
                    subtopics: ['digital marketing', 'branding', 'advertising']
                }
            };
            
            // Define topic relationships
            this.knowledgeBase.relationships = {
                'technology': ['science', 'business'],
                'computers': ['technology', 'software'],
                'software': ['computers', 'programming', 'technology'],
                'internet': ['technology', 'social media', 'business'],
                'ai': ['technology', 'science', 'software'],
                
                'entertainment': ['music', 'movies', 'games'],
                'movies': ['entertainment', 'art'],
                'music': ['entertainment', 'art'],
                'games': ['entertainment', 'technology'],
                
                'science': ['technology', 'education', 'health'],
                'physics': ['science', 'mathematics'],
                'biology': ['science', 'health'],
                
                'health': ['science', 'fitness', 'nutrition'],
                'fitness': ['health', 'sports'],
                'nutrition': ['health', 'food'],
                
                'business': ['finance', 'marketing', 'technology'],
                'finance': ['business', 'economics'],
                'marketing': ['business', 'psychology']
            };
            
            // Define topic synonyms
            this.knowledgeBase.synonyms = {
                'technology': ['tech', 'technological'],
                'computers': ['pc', 'computing', 'laptop', 'desktop'],
                'software': ['app', 'application', 'program'],
                'internet': ['web', 'online', 'cyberspace'],
                'ai': ['artificial intelligence', 'machine learning'],
                
                'entertainment': ['amusement', 'recreation', 'leisure'],
                'movies': ['film', 'cinema', 'motion picture'],
                'music': ['songs', 'tunes', 'audio'],
                'games': ['gaming', 'gameplay', 'video games'],
                
                'science': ['scientific', 'research'],
                'physics': ['physical science'],
                'biology': ['life science', 'biological science'],
                
                'health': ['wellness', 'wellbeing', 'healthcare'],
                'fitness': ['exercise', 'workout', 'training'],
                'nutrition': ['diet', 'dietary', 'food science'],
                
                'business': ['commerce', 'trade', 'industry'],
                'finance': ['financial', 'monetary', 'banking'],
                'marketing': ['advertising', 'promotion', 'market research']
            };
            
            return true;
        } catch (error) {
            console.error('Error loading topic knowledge base:', error);
            return false;
        }
    }
    
    /**
     * Load previous state from storage
     */
    async loadState() {
        try {
            const savedState = await this.storageManager.getIndexedDB('topics', 'current-state');
            if (savedState) {
                // Merge saved state with default state
                this.state = {
                    ...this.state,
                    ...savedState,
                    initialized: false // Will be set to true after full initialization
                };
            }
            
            // Load user interests
            const userInterests = await this.storageManager.getIndexedDB('topics', 'user-interests');
            if (userInterests) {
                this.state.userInterests = userInterests;
                
                // Apply interest decay based on last update time
                this.applyInterestDecay();
            }
            
            return true;
        } catch (error) {
            console.error('Error loading topic state:', error);
            return false;
        }
    }
    
    /**
     * Save current state to storage
     */
    async saveState() {
        try {
            await this.storageManager.setIndexedDB('topics', {
                id: 'current-state',
                currentTopics: this.state.currentTopics,
                topicHistory: this.state.topicHistory,
                conversationFocus: this.state.conversationFocus,
                topicHierarchy: this.state.topicHierarchy
            });
            
            // Save user interests separately
            await this.storageManager.setIndexedDB('topics', {
                id: 'user-interests',
                ...this.state.userInterests,
                lastUpdated: Date.now()
            });
            
            return true;
        } catch (error) {
            console.error('Error saving topic state:', error);
            return false;
        }
    }
    
    /**
     * Apply decay to user interests based on time elapsed
     */
    applyInterestDecay() {
        if (!this.state.userInterests.lastUpdated) {
            return;
        }
        
        const now = Date.now();
        const daysSinceUpdate = (now - this.state.userInterests.lastUpdated) / (24 * 60 * 60 * 1000);
        
        if (daysSinceUpdate < 1) {
            return; // Less than a day, no decay needed
        }
        
        // Calculate decay factor
        const decayFactor = Math.pow(this.config.interestDecayRate, daysSinceUpdate);
        
        // Apply decay to each interest
        for (const topic in this.state.userInterests) {
            if (topic !== 'lastUpdated') {
                this.state.userInterests[topic] *= decayFactor;
                
                // Remove interests that have decayed below threshold
                if (this.state.userInterests[topic] < 0.1) {
                    delete this.state.userInterests[topic];
                }
            }
        }
        
        // Update last updated timestamp
        this.state.userInterests.lastUpdated = now;
    }
    
    /**
     * Detect topics in a text
     * @param {string} text - The text to analyze
     * @returns {Object} - The detected topics
     */
    async detectTopics(text) {
        try {
            // Normalize text
            const normalizedText = text.toLowerCase();
            
            // Extract candidate topics
            const candidateTopics = this.extractCandidateTopics(normalizedText);
            
            // Score and rank topics
            const scoredTopics = this.scoreTopics(candidateTopics, normalizedText);
            
            // Filter by confidence threshold
            const detectedTopics = scoredTopics
                .filter(topic => topic.confidence >= this.config.minTopicConfidence)
                .slice(0, this.config.maxTopicsPerMessage);
            
            // Extract subtopics
            const topicsWithSubtopics = this.extractSubtopics(detectedTopics, normalizedText);
            
            // Update current topics
            this.state.currentTopics = topicsWithSubtopics;
            
            // Add to topic history
            this.state.topicHistory.unshift({
                timestamp: Date.now(),
                topics: topicsWithSubtopics,
                text: text.substring(0, 100) // Store a snippet for context
            });
            
            // Limit history size
            if (this.state.topicHistory.length > this.config.topicHistorySize) {
                this.state.topicHistory.pop();
            }
            
            // Update user interests
            this.updateUserInterests(topicsWithSubtopics);
            
            // Update conversation focus
            this.updateConversationFocus(topicsWithSubtopics);
            
            // Update topic hierarchy
            if (this.config.enableHierarchicalModeling) {
                this.updateTopicHierarchy(topicsWithSubtopics);
            }
            
            // Save state
            await this.saveState();
            
            // Publish topic update event
            this.eventSystem.publish('topics-updated', {
                topics: topicsWithSubtopics,
                conversationFocus: this.state.conversationFocus
            });
            
            return {
                text: text,
                topics: topicsWithSubtopics,
                conversationFocus: this.state.conversationFocus
            };
        } catch (error) {
            console.error('Error detecting topics:', error);
            
            return {
                text: text,
                error: error.message,
                topics: this.state.currentTopics
            };
        }
    }
    
    /**
     * Extract candidate topics from text
     * @param {string} text - The normalized text
     * @returns {Object} - Candidate topics with occurrences
     */
    extractCandidateTopics(text) {
        const candidates = {};
        
        // Check each topic in knowledge base
        for (const [topic, data] of Object.entries(this.knowledgeBase.topics)) {
            // Check topic name
            if (text.includes(topic)) {
                candidates[topic] = (candidates[topic] || 0) + 1;
            }
            
            // Check keywords
            for (const keyword of data.keywords) {
                if (text.includes(keyword)) {
                    candidates[topic] = (candidates[topic] || 0) + 1;
                }
            }
            
            // Check synonyms
            const synonyms = this.knowledgeBase.synonyms[topic] || [];
            for (const synonym of synonyms) {
                if (text.includes(synonym)) {
                    candidates[topic] = (candidates[topic] || 0) + 1;
                }
            }
        }
        
        return candidates;
    }
    
    /**
     * Score and rank topics
     * @param {Object} candidateTopics - Candidate topics with occurrences
     * @param {string} text - The normalized text
     * @returns {Array} - Scored and ranked topics
     */
    scoreTopics(candidateTopics, text) {
        const scoredTopics = [];
        
        // Calculate total occurrences
        const totalOccurrences = Object.values(candidateTopics).reduce((sum, count) => sum + count, 0);
        
        // Score each candidate topic
        for (const [topic, occurrences] of Object.entries(candidateTopics)) {
            // Base score from occurrences
            let score = occurrences / Math.max(1, totalOccurrences);
            
            // Adjust score based on user interests
            if (this.state.userInterests[topic]) {
                score *= (1 + this.state.userInterests[topic] * 0.5);
            }
            
            // Adjust score based on conversation focus
            if (this.state.conversationFocus === topic) {
                score *= 1.2;
            } else if (this.state.conversationFocus && 
                      this.knowledgeBase.relationships[this.state.conversationFocus] &&
                      this.knowledgeBase.relationships[this.state.conversationFocus].includes(topic)) {
                score *= 1.1;
            }
            
            // Adjust score based on topic history
            const recentTopics = this.state.topicHistory.slice(0, 3).flatMap(entry => entry.topics.map(t => t.name));
            if (recentTopics.includes(topic)) {
                score *= 1.1;
            }
            
            // Add to scored topics
            scoredTopics.push({
                name: topic,
                confidence: Math.min(1, score),
                occurrences: occurrences
            });
        }
        
        // Sort by confidence
        return scoredTopics.sort((a, b) => b.confidence - a.confidence);
    }
    
    /**
     * Extract subtopics for detected topics
     * @param {Array} detectedTopics - The detected topics
     * @param {string} text - The normalized text
     * @returns {Array} - Topics with subtopics
     */
    extractSubtopics(detectedTopics, text) {
        return detectedTopics.map(topic => {
            const subtopics = [];
            
            // Get potential subtopics from knowledge base
            const potentialSubtopics = this.knowledgeBase.topics[topic.name]?.subtopics || [];
            
            // Check each potential subtopic
            for (const subtopic of potentialSubtopics) {
                // Check if subtopic is mentioned in text
                if (text.includes(subtopic)) {
                    subtopics.push({
                        name: subtopic,
                        confidence: topic.confidence * 0.9 // Slightly lower confidence for subtopics
                    });
                } else {
                    // Check subtopic keywords
                    const subtopicData = this.knowledgeBase.topics[subtopic];
                    if (subtopicData) {
                        for (const keyword of subtopicData.keywords) {
                            if (text.includes(keyword)) {
                                subtopics.push({
                                    name: subtopic,
                                    confidence: topic.confidence * 0.8
                                });
                                break;
                            }
                        }
                    }
                }
            }
            
            // Limit number of subtopics
            const limitedSubtopics = subtopics
                .sort((a, b) => b.confidence - a.confidence)
                .slice(0, this.config.maxSubtopicsPerTopic);
            
            return {
                ...topic,
                subtopics: limitedSubtopics
            };
        });
    }
    
    /**
     * Update user interests based on detected topics
     * @param {Array} topics - The detected topics
     */
    updateUserInterests(topics) {
        if (!this.config.enableInterestTracking) {
            return;
        }
        
        // Initialize lastUpdated if not exists
        if (!this.state.userInterests.lastUpdated) {
            this.state.userInterests.lastUpdated = Date.now();
        }
        
        // Update interests for each topic
        for (const topic of topics) {
            const topicName = topic.name;
            const interestIncrease = topic.confidence * 0.1; // Small increment per mention
            
            // Update or initialize interest
            this.state.userInterests[topicName] = (this.state.userInterests[topicName] || 0) + interestIncrease;
            
            // Cap at 1.0
            this.state.userInterests[topicName] = Math.min(1, this.state.userInterests[topicName]);
            
            // Also update for subtopics with smaller increment
            for (const subtopic of topic.subtopics) {
                const subtopicName = subtopic.name;
                const subtopicIncrease = subtopic.confidence * 0.05;
                
                this.state.userInterests[subtopicName] = (this.state.userInterests[subtopicName] || 0) + subtopicIncrease;
                this.state.userInterests[subtopicName] = Math.min(1, this.state.userInterests[subtopicName]);
            }
        }
        
        // Update timestamp
        this.state.userInterests.lastUpdated = Date.now();
    }
    
    /**
     * Update conversation focus based on detected topics
     * @param {Array} topics - The detected topics
     */
    updateConversationFocus(topics) {
        if (topics.length === 0) {
            return;
        }
        
        // If no current focus, set to top topic
        if (!this.state.conversationFocus) {
            this.state.conversationFocus = topics[0].name;
            return;
        }
        
        // Check if current focus is still in topics
        const focusStillPresent = topics.some(topic => topic.name === this.state.conversationFocus);
        
        if (focusStillPresent) {
            // Focus is still relevant, keep it
            return;
        }
        
        // Check if any topic is related to current focus
        const relatedTopics = this.knowledgeBase.relationships[this.state.conversationFocus] || [];
        const relatedPresent = topics.some(topic => relatedTopics.includes(topic.name));
        
        if (relatedPresent) {
            // Related topic present, keep current focus
            return;
        }
        
        // If top topic has high confidence, switch focus
        if (topics[0].confidence > 0.8) {
            this.state.conversationFocus = topics[0].name;
            return;
        }
        
        // If multiple consecutive messages have same top topic, switch focus
        const recentTopTopics = this.state.topicHistory
            .slice(0, 3)
            .map(entry => entry.topics[0]?.name);
        
        if (recentTopTopics.length >= 3 && 
            recentTopTopics[0] === topics[0].name && 
            recentTopTopics[1] === topics[0].name) {
            this.state.conversationFocus = topics[0].name;
        }
    }
    
    /**
     * Update topic hierarchy based on detected topics
     * @param {Array} topics - The detected topics
     */
    updateTopicHierarchy(topics) {
        for (const topic of topics) {
            const topicName = topic.name;
            
            // Initialize topic in hierarchy if not exists
            if (!this.state.topicHierarchy[topicName]) {
                this.state.topicHierarchy[topicName] = {
                    mentions: 0,
                    lastMentioned: null,
                    subtopics: {},
                    relatedTopics: {}
                };
            }
            
            // Update topic data
            this.state.topicHierarchy[topicName].mentions++;
            this.state.topicHierarchy[topicName].lastMentioned = Date.now();
            
            // Update subtopics
            for (const subtopic of topic.subtopics) {
                const subtopicName = subtopic.name;
                
                if (!this.state.topicHierarchy[topicName].subtopics[subtopicName]) {
                    this.state.topicHierarchy[topicName].subtopics[subtopicName] = {
                        mentions: 0,
                        lastMentioned: null
                    };
                }
                
                this.state.topicHierarchy[topicName].subtopics[subtopicName].mentions++;
                this.state.topicHierarchy[topicName].subtopics[subtopicName].lastMentioned = Date.now();
            }
            
            // Update related topics
            const relatedTopics = this.knowledgeBase.relationships[topicName] || [];
            for (const relatedTopic of relatedTopics) {
                if (!this.state.topicHierarchy[topicName].relatedTopics[relatedTopic]) {
                    this.state.topicHierarchy[topicName].relatedTopics[relatedTopic] = {
                        mentions: 0,
                        lastMentioned: null
                    };
                }
            }
            
            // Check for co-occurrence with other topics in this message
            for (const otherTopic of topics) {
                if (otherTopic.name !== topicName) {
                    if (!this.state.topicHierarchy[topicName].relatedTopics[otherTopic.name]) {
                        this.state.topicHierarchy[topicName].relatedTopics[otherTopic.name] = {
                            mentions: 0,
                            lastMentioned: null
                        };
                    }
                    
                    this.state.topicHierarchy[topicName].relatedTopics[otherTopic.name].mentions++;
                    this.state.topicHierarchy[topicName].relatedTopics[otherTopic.name].lastMentioned = Date.now();
                }
            }
        }
    }
    
    /**
     * Get user interests
     * @returns {Object} - User interests
     */
    async getUserInterests() {
        try {
            // Apply interest decay
            this.applyInterestDecay();
            
            // Filter out metadata fields
            const interests = { ...this.state.userInterests };
            delete interests.lastUpdated;
            
            // Sort interests by strength
            const sortedInterests = Object.entries(interests)
                .sort((a, b) => b[1] - a[1])
                .reduce((obj, [key, value]) => {
                    obj[key] = value;
                    return obj;
                }, {});
            
            return {
                interests: sortedInterests,
                topInterests: Object.entries(sortedInterests)
                    .slice(0, 5)
                    .map(([topic, strength]) => ({ topic, strength }))
            };
        } catch (error) {
            console.error('Error getting user interests:', error);
            return {
                interests: {},
                topInterests: [],
                error: error.message
            };
        }
    }
    
    /**
     * Get related topics for a given topic
     * @param {string} topic - The topic to get related topics for
     * @returns {Object} - Related topics
     */
    async getRelatedTopics(topic) {
        try {
            const result = {
                topic: topic,
                knowledgeBaseRelated: [],
                hierarchyRelated: [],
                subtopics: []
            };
            
            // Get related topics from knowledge base
            result.knowledgeBaseRelated = this.knowledgeBase.relationships[topic] || [];
            
            // Get subtopics from knowledge base
            result.subtopics = this.knowledgeBase.topics[topic]?.subtopics || [];
            
            // Get related topics from hierarchy
            if (this.state.topicHierarchy[topic]) {
                result.hierarchyRelated = Object.entries(this.state.topicHierarchy[topic].relatedTopics)
                    .sort((a, b) => b[1].mentions - a[1].mentions)
                    .map(([relatedTopic, data]) => ({
                        topic: relatedTopic,
                        mentions: data.mentions,
                        lastMentioned: data.lastMentioned
                    }));
            }
            
            return result;
        } catch (error) {
            console.error('Error getting related topics:', error);
            return {
                topic: topic,
                error: error.message,
                knowledgeBaseRelated: [],
                hierarchyRelated: [],
                subtopics: []
            };
        }
    }
    
    /**
     * Get topic history
     * @param {number} limit - Maximum number of history entries to return
     * @returns {Array} - Topic history
     */
    getTopicHistory(limit = 10) {
        return this.state.topicHistory.slice(0, limit);
    }
    
    /**
     * Get the current state of the topic modeling system
     * @returns {Object} - The current state
     */
    getState() {
        return {
            initialized: this.state.initialized,
            currentTopics: this.state.currentTopics,
            topicHistoryLength: this.state.topicHistory.length,
            conversationFocus: this.state.conversationFocus,
            interestCount: Object.keys(this.state.userInterests).length - 1, // Exclude lastUpdated
            topicHierarchySize: Object.keys(this.state.topicHierarchy).length
        };
    }
}

// Export the class
window.TopicModelingSystem = TopicModelingSystem;
