/**
 * Conversation Memory System for MeAI
 * 
 * Features:
 * - Short-term and long-term memory storage
 * - Context-aware conversation tracking
 * - Sentiment analysis for emotional understanding
 * - Topic extraction and relationship mapping
 * - Personalized user preference tracking
 */

class ConversationMemorySystem {
    constructor() {
        // Memory storage
        this.shortTermMemory = [];
        this.longTermMemory = [];
        this.userPreferences = {};
        
        // Context tracking
        this.currentContext = {
            topic: null,
            sentiment: 0, // -1 to 1 scale
            startTime: null,
            messageCount: 0
        };
        
        // Configuration
        this.shortTermMemoryLimit = 20; // Messages
        this.longTermMemoryLimit = 100; // Key memories
        this.sentimentThreshold = 0.5; // Threshold for significant sentiment
        
        // Storage keys
        this.storageKeys = {
            longTerm: 'meai_long_term_memory',
            preferences: 'meai_user_preferences'
        };
        
        // Common topics for classification
        this.commonTopics = [
            'personal', 'work', 'health', 'entertainment',
            'technology', 'philosophy', 'emotions', 'relationships',
            'education', 'news', 'science', 'arts', 'travel'
        ];
        
        // Sentiment keywords
        this.sentimentKeywords = {
            positive: [
                'happy', 'good', 'great', 'excellent', 'wonderful',
                'amazing', 'love', 'enjoy', 'like', 'pleased',
                'delighted', 'grateful', 'thankful', 'excited'
            ],
            negative: [
                'sad', 'bad', 'terrible', 'awful', 'horrible',
                'dislike', 'hate', 'upset', 'angry', 'frustrated',
                'disappointed', 'annoyed', 'worried', 'stressed'
            ]
        };
    }
    
    /**
     * Initialize the memory system
     */
    initialize() {
        // Load saved memories from storage
        this.loadFromStorage();
        
        // Initialize current context
        this.currentContext.startTime = new Date();
        
        console.log('Conversation Memory System initialized');
        return true;
    }
    
    /**
     * Process a new message
     * @param {Object} message Message object
     * @param {string} message.text Message content
     * @param {string} message.sender Message sender ('user' or 'meai')
     * @param {Date} message.timestamp Message timestamp
     * @returns {Object} Processing results with context information
     */
    processMessage(message) {
        // Ensure message has all required properties
        const processedMessage = {
            text: message.text || '',
            sender: message.sender || 'user',
            timestamp: message.timestamp || new Date(),
            sentiment: 0,
            topics: [],
            isQuestion: false,
            entities: [],
            keywords: []
        };
        
        // Analyze message
        this.analyzeMessage(processedMessage);
        
        // Update context
        this.updateContext(processedMessage);
        
        // Add to short-term memory
        this.addToShortTermMemory(processedMessage);
        
        // Check if message should be added to long-term memory
        if (this.isMemoryWorthy(processedMessage)) {
            this.addToLongTermMemory(processedMessage);
        }
        
        // Extract and update user preferences
        if (processedMessage.sender === 'user') {
            this.updateUserPreferences(processedMessage);
        }
        
        // Save to storage periodically
        if (Math.random() < 0.1) { // 10% chance to save on each message
            this.saveToStorage();
        }
        
        // Return current context and relevant memories
        return {
            currentContext: { ...this.currentContext },
            relevantMemories: this.findRelevantMemories(processedMessage),
            userPreferences: { ...this.userPreferences }
        };
    }
    
    /**
     * Analyze a message for sentiment, topics, etc.
     * @param {Object} message Message to analyze
     */
    analyzeMessage(message) {
        const text = message.text.toLowerCase();
        
        // Check if message is a question
        message.isQuestion = text.includes('?') || 
            /^(what|who|where|when|why|how|can|could|would|is|are|do|does|did)/i.test(text);
        
        // Extract keywords (simple implementation)
        message.keywords = this.extractKeywords(text);
        
        // Analyze sentiment
        message.sentiment = this.analyzeSentiment(text);
        
        // Extract topics
        message.topics = this.extractTopics(text);
        
        // Extract entities (simple implementation)
        message.entities = this.extractEntities(text);
    }
    
    /**
     * Extract keywords from text
     * @param {string} text Text to analyze
     * @returns {string[]} Extracted keywords
     */
    extractKeywords(text) {
        // Remove common stop words
        const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'as', 'of', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their'];
        
        // Tokenize and filter
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, '') // Remove punctuation
            .split(/\s+/) // Split by whitespace
            .filter(word => word.length > 2 && !stopWords.includes(word)); // Filter stop words and short words
        
        // Count word frequency
        const wordCounts = {};
        words.forEach(word => {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        });
        
        // Sort by frequency and take top 5
        return Object.entries(wordCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(entry => entry[0]);
    }
    
    /**
     * Analyze sentiment of text
     * @param {string} text Text to analyze
     * @returns {number} Sentiment score (-1 to 1)
     */
    analyzeSentiment(text) {
        const lowerText = text.toLowerCase();
        let score = 0;
        
        // Count positive and negative keywords
        let positiveCount = 0;
        let negativeCount = 0;
        
        // Check positive keywords
        this.sentimentKeywords.positive.forEach(keyword => {
            if (lowerText.includes(keyword)) {
                positiveCount++;
            }
        });
        
        // Check negative keywords
        this.sentimentKeywords.negative.forEach(keyword => {
            if (lowerText.includes(keyword)) {
                negativeCount++;
            }
        });
        
        // Check for negation words that flip sentiment
        const negationWords = ['not', 'no', "don't", "doesn't", "didn't", "won't", "wouldn't", "can't", "cannot", "couldn't"];
        let hasNegation = false;
        
        negationWords.forEach(word => {
            if (lowerText.includes(word)) {
                hasNegation = true;
            }
        });
        
        // Calculate score
        if (positiveCount > 0 || negativeCount > 0) {
            score = (positiveCount - negativeCount) / (positiveCount + negativeCount);
            
            // Flip score if negation is present
            if (hasNegation) {
                score = -score;
            }
        }
        
        return score;
    }
    
    /**
     * Extract topics from text
     * @param {string} text Text to analyze
     * @returns {string[]} Extracted topics
     */
    extractTopics(text) {
        const lowerText = text.toLowerCase();
        const topics = [];
        
        // Check for common topics
        this.commonTopics.forEach(topic => {
            // Create regex to match topic and related words
            let topicRegex;
            switch (topic) {
                case 'personal':
                    topicRegex = /\b(i|me|my|myself|personal|life|family|home)\b/;
                    break;
                case 'work':
                    topicRegex = /\b(work|job|career|office|business|professional)\b/;
                    break;
                case 'health':
                    topicRegex = /\b(health|healthy|fitness|exercise|diet|medical|doctor|sick|illness)\b/;
                    break;
                case 'entertainment':
                    topicRegex = /\b(movie|film|show|tv|television|music|game|play|fun|entertainment)\b/;
                    break;
                case 'technology':
                    topicRegex = /\b(tech|technology|computer|digital|software|hardware|app|internet|online|device)\b/;
                    break;
                case 'philosophy':
                    topicRegex = /\b(philosophy|meaning|purpose|life|existence|belief|think|thought|consciousness)\b/;
                    break;
                case 'emotions':
                    topicRegex = /\b(feel|feeling|emotion|happy|sad|angry|scared|anxious|love|hate|fear)\b/;
                    break;
                case 'relationships':
                    topicRegex = /\b(relationship|friend|family|partner|spouse|husband|wife|boyfriend|girlfriend|love|connection)\b/;
                    break;
                case 'education':
                    topicRegex = /\b(learn|education|school|college|university|study|student|teacher|knowledge|class)\b/;
                    break;
                case 'news':
                    topicRegex = /\b(news|current|event|politics|world|country|government|election|president)\b/;
                    break;
                case 'science':
                    topicRegex = /\b(science|scientific|research|discovery|physics|chemistry|biology|experiment)\b/;
                    break;
                case 'arts':
                    topicRegex = /\b(art|artist|creative|paint|draw|music|song|dance|performance|design)\b/;
                    break;
                case 'travel':
                    topicRegex = /\b(travel|trip|journey|vacation|visit|country|city|place|destination|tourism)\b/;
                    break;
                default:
                    topicRegex = new RegExp(`\\b${topic}\\b`);
            }
            
            if (topicRegex.test(lowerText)) {
                topics.push(topic);
            }
        });
        
        return topics;
    }
    
    /**
     * Extract entities from text
     * @param {string} text Text to analyze
     * @returns {Object[]} Extracted entities
     */
    extractEntities(text) {
        const entities = [];
        
        // Simple named entity extraction (very basic implementation)
        // Look for capitalized words that aren't at the start of sentences
        const words = text.split(/\s+/);
        
        for (let i = 1; i < words.length; i++) {
            const word = words[i].replace(/[^\w]/g, ''); // Remove punctuation
            
            if (word.length > 0 && word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase()) {
                // Check if it's not a common word that might be capitalized
                const commonWords = ['I', 'You', 'He', 'She', 'It', 'We', 'They', 'My', 'Your', 'His', 'Her', 'Its', 'Our', 'Their'];
                
                if (!commonWords.includes(word)) {
                    entities.push({
                        text: word,
                        type: 'unknown'
                    });
                }
            }
        }
        
        return entities;
    }
    
    /**
     * Update conversation context based on a new message
     * @param {Object} message Processed message
     */
    updateContext(message) {
        // Increment message count
        this.currentContext.messageCount++;
        
        // Update sentiment (weighted average)
        const currentWeight = this.currentContext.messageCount - 1;
        const newWeight = 1;
        const totalWeight = currentWeight + newWeight;
        
        this.currentContext.sentiment = 
            (this.currentContext.sentiment * currentWeight + message.sentiment * newWeight) / totalWeight;
        
        // Update topic if message has topics
        if (message.topics.length > 0) {
            this.currentContext.topic = message.topics[0];
        }
    }
    
    /**
     * Add message to short-term memory
     * @param {Object} message Processed message
     */
    addToShortTermMemory(message) {
        // Add to short-term memory
        this.shortTermMemory.push({ ...message });
        
        // Trim if exceeding limit
        if (this.shortTermMemory.length > this.shortTermMemoryLimit) {
            const removedMessage = this.shortTermMemory.shift();
            
            // Check if removed message should be added to long-term memory
            if (this.isMemoryWorthy(removedMessage) && removedMessage.sender === 'user') {
                this.addToLongTermMemory(removedMessage);
            }
        }
    }
    
    /**
     * Add message to long-term memory
     * @param {Object} message Processed message
     */
    addToLongTermMemory(message) {
        // Create memory entry with additional metadata
        const memoryEntry = {
            ...message,
            context: { ...this.currentContext },
            importance: this.calculateImportance(message),
            lastRecalled: null,
            recallCount: 0
        };
        
        // Add to long-term memory
        this.longTermMemory.push(memoryEntry);
        
        // Trim if exceeding limit
        if (this.longTermMemory.length > this.longTermMemoryLimit) {
            // Sort by importance and remove least important
            this.longTermMemory.sort((a, b) => a.importance - b.importance);
            this.longTermMemory.shift();
        }
    }
    
    /**
     * Determine if a message is worthy of long-term memory
     * @param {Object} message Processed message
     * @returns {boolean} Whether message should be stored in long-term memory
     */
    isMemoryWorthy(message) {
        // Check various factors to determine if message is significant
        
        // Strong sentiment (positive or negative)
        if (Math.abs(message.sentiment) > this.sentimentThreshold) {
            return true;
        }
        
        // Contains question
        if (message.isQuestion) {
            return true;
        }
        
        // Contains entities
        if (message.entities.length > 0) {
            return true;
        }
        
        // First message in conversation
        if (this.currentContext.messageCount <= 1) {
            return true;
        }
        
        // Contains multiple topics
        if (message.topics.length >= 2) {
            return true;
        }
        
        // Long message (likely significant)
        if (message.text.length > 100) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Calculate importance score for a memory
     * @param {Object} message Processed message
     * @returns {number} Importance score (0-1)
     */
    calculateImportance(message) {
        let score = 0;
        
        // Sentiment strength
        score += Math.abs(message.sentiment) * 0.3;
        
        // Question bonus
        if (message.isQuestion) {
            score += 0.2;
        }
        
        // Entity bonus
        score += Math.min(0.2, message.entities.length * 0.05);
        
        // Topic bonus
        score += Math.min(0.2, message.topics.length * 0.1);
        
        // Length bonus
        score += Math.min(0.1, message.text.length / 1000);
        
        return Math.min(1, score);
    }
    
    /**
     * Find memories relevant to the current message
     * @param {Object} message Current message
     * @returns {Object[]} Relevant memories
     */
    findRelevantMemories(message) {
        if (this.longTermMemory.length === 0) {
            return [];
        }
        
        // Score each memory for relevance
        const scoredMemories = this.longTermMemory.map(memory => {
            let score = 0;
            
            // Topic match
            const topicOverlap = message.topics.filter(topic => 
                memory.topics.includes(topic)
            ).length;
            score += topicOverlap * 0.3;
            
            // Keyword match
            const keywordOverlap = message.keywords.filter(keyword => 
                memory.text.toLowerCase().includes(keyword.toLowerCase())
            ).length;
            score += keywordOverlap * 0.2;
            
            // Entity match
            const entityOverlap = message.entities.filter(entity => 
                memory.entities.some(e => e.text.toLowerCase() === entity.text.toLowerCase())
            ).length;
            score += entityOverlap * 0.3;
            
            // Sentiment match (similar sentiment)
            const sentimentDiff = Math.abs(message.sentiment - memory.sentiment);
            score += (1 - sentimentDiff) * 0.1;
            
            // Recency bonus
            const recencyScore = 1 - (this.longTermMemory.length - this.longTermMemory.indexOf(memory)) / this.longTermMemory.length;
            score += recencyScore * 0.1;
            
            return {
                memory,
                score
            };
        });
        
        // Sort by score and take top 3
        scoredMemories.sort((a, b) => b.score - a.score);
        const relevantMemories = scoredMemories
            .filter(item => item.score > 0.2) // Minimum relevance threshold
            .slice(0, 3)
            .map(item => item.memory);
        
        // Update recall information for retrieved memories
        relevantMemories.forEach(memory => {
            memory.lastRecalled = new Date();
            memory.recallCount = (memory.recallCount || 0) + 1;
        });
        
        return relevantMemories;
    }
    
    /**
     * Update user preferences based on message
     * @param {Object} message Processed message
     */
    updateUserPreferences(message) {
        // Extract preferences from message
        const text = message.text.toLowerCase();
        
        // Check for explicit preferences
        const likeRegex = /i (like|love|enjoy|prefer) ([\w\s]+)/gi;
        const dislikeRegex = /i (dislike|hate|don't like|do not like) ([\w\s]+)/gi;
        
        // Extract likes
        let match;
        while ((match = likeRegex.exec(text)) !== null) {
            const preference = match[2].trim();
            this.userPreferences[preference] = (this.userPreferences[preference] || 0) + 1;
        }
        
        // Extract dislikes
        while ((match = dislikeRegex.exec(text)) !== null) {
            const preference = match[2].trim();
            this.userPreferences[preference] = (this.userPreferences[preference] || 0) - 1;
        }
        
        // Update topic preferences
        message.topics.forEach(topic => {
            const key = `topic_${topic}`;
            this.userPreferences[key] = (this.userPreferences[key] || 0) + 1;
        });
    }
    
    /**
     * Get user preferences sorted by strength
     * @returns {Object[]} Sorted preferences
     */
    getSortedPreferences() {
        return Object.entries(this.userPreferences)
            .map(([key, value]) => ({ key, value }))
            .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
    }
    
    /**
     * Save memory to local storage
     */
    saveToStorage() {
        try {
            // Save long-term memory
            localStorage.setItem(
                this.storageKeys.longTerm,
                JSON.stringify(this.longTermMemory)
            );
            
            // Save user preferences
            localStorage.setItem(
                this.storageKeys.preferences,
                JSON.stringify(this.userPreferences)
            );
            
            console.log('Memory saved to storage');
        } catch (error) {
            console.error('Error saving memory to storage:', error);
        }
    }
    
    /**
     * Load memory from local storage
     */
    loadFromStorage() {
        try {
            // Load long-term memory
            const longTermData = localStorage.getItem(this.storageKeys.longTerm);
            if (longTermData) {
                this.longTermMemory = JSON.parse(longTermData);
                
                // Convert string timestamps back to Date objects
                this.longTermMemory.forEach(memory => {
                    memory.timestamp = new Date(memory.timestamp);
                    if (memory.lastRecalled) {
                        memory.lastRecalled = new Date(memory.lastRecalled);
                    }
                });
            }
            
            // Load user preferences
            const preferencesData = localStorage.getItem(this.storageKeys.preferences);
            if (preferencesData) {
                this.userPreferences = JSON.parse(preferencesData);
            }
            
            console.log('Memory loaded from storage');
        } catch (error) {
            console.error('Error loading memory from storage:', error);
            
            // Reset to defaults on error
            this.longTermMemory = [];
            this.userPreferences = {};
        }
    }
    
    /**
     * Clear all memory
     */
    clearMemory() {
        // Clear memory arrays
        this.shortTermMemory = [];
        this.longTermMemory = [];
        this.userPreferences = {};
        
        // Reset context
        this.currentContext = {
            topic: null,
            sentiment: 0,
            startTime: new Date(),
            messageCount: 0
        };
        
        // Clear storage
        try {
            localStorage.removeItem(this.storageKeys.longTerm);
            localStorage.removeItem(this.storageKeys.preferences);
        } catch (error) {
            console.error('Error clearing memory storage:', error);
        }
        
        console.log('Memory cleared');
    }
    
    /**
     * Get memory statistics
     * @returns {Object} Memory statistics
     */
    getMemoryStats() {
        return {
            shortTermCount: this.shortTermMemory.length,
            longTermCount: this.longTermMemory.length,
            preferenceCount: Object.keys(this.userPreferences).length,
            topPreferences: this.getSortedPreferences().slice(0, 5),
            messageCount: this.currentContext.messageCount,
            currentTopic: this.currentContext.topic,
            currentSentiment: this.currentContext.sentiment,
            conversationDuration: new Date() - this.currentContext.startTime
        };
    }
}
