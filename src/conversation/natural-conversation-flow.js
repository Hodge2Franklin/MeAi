/**
 * Natural Conversation Flow System
 * 
 * This system provides dynamic response timing, contextual follow-ups,
 * and adaptive conversation styles for more human-like interactions.
 */

class NaturalConversationFlow {
    constructor() {
        // Initialize dependencies
        this.storageManager = window.storageManager;
        this.eventSystem = window.eventSystem;
        this.contextualMemory = window.contextualMemorySystem;
        
        // Conversation state
        this.conversationState = {
            currentTopic: null,
            lastResponseTime: 0,
            messageCount: 0,
            userMessageCount: 0,
            aiMessageCount: 0,
            conversationStartTime: Date.now(),
            lastUserActivity: Date.now(),
            followUpPending: false,
            followUpTimeout: null,
            typingIndicatorActive: false,
            responseQueue: [],
            processingResponse: false,
            conversationPace: 'normal', // slow, normal, fast
            conversationStyle: 'balanced', // concise, balanced, elaborate
            emotionalTone: 'neutral' // neutral, warm, professional, enthusiastic
        };
        
        // Response timing configuration
        this.timingConfig = {
            // Base thinking time before responding (ms)
            baseThinkingTime: {
                short: 500,
                medium: 1200,
                long: 2000
            },
            
            // Additional time per character in response (ms)
            timePerCharacter: {
                fast: 0.5,
                normal: 1.0,
                slow: 2.0
            },
            
            // Variation in timing (percentage)
            timingVariation: 0.2,
            
            // Follow-up timing (ms)
            followUpTiming: {
                min: 8000,
                max: 15000
            },
            
            // Idle conversation restart (ms)
            idleRestartTiming: {
                min: 60000, // 1 minute
                max: 180000 // 3 minutes
            }
        };
        
        // Conversation style templates
        this.styleTemplates = {
            concise: {
                description: 'Brief and to-the-point responses',
                responseLengthMultiplier: 0.7,
                followUpProbability: 0.2,
                pauseFrequency: 0.1,
                elaborationLevel: 0.3
            },
            balanced: {
                description: 'Natural balance of detail and brevity',
                responseLengthMultiplier: 1.0,
                followUpProbability: 0.4,
                pauseFrequency: 0.2,
                elaborationLevel: 0.6
            },
            elaborate: {
                description: 'Detailed and comprehensive responses',
                responseLengthMultiplier: 1.3,
                followUpProbability: 0.6,
                pauseFrequency: 0.3,
                elaborationLevel: 0.9
            }
        };
        
        // Emotional tone templates
        this.toneTemplates = {
            neutral: {
                description: 'Balanced and objective tone',
                emotionalWords: 0.2,
                personalPronounFrequency: 0.3,
                exclamationFrequency: 0.1,
                questionFrequency: 0.2
            },
            warm: {
                description: 'Friendly and approachable tone',
                emotionalWords: 0.6,
                personalPronounFrequency: 0.7,
                exclamationFrequency: 0.4,
                questionFrequency: 0.3
            },
            professional: {
                description: 'Formal and precise tone',
                emotionalWords: 0.1,
                personalPronounFrequency: 0.2,
                exclamationFrequency: 0.05,
                questionFrequency: 0.15
            },
            enthusiastic: {
                description: 'Energetic and positive tone',
                emotionalWords: 0.8,
                personalPronounFrequency: 0.6,
                exclamationFrequency: 0.7,
                questionFrequency: 0.4
            }
        };
        
        // Follow-up templates
        this.followUpTemplates = [
            {
                type: 'clarification',
                templates: [
                    "I'm curious, could you elaborate on what you meant by {topic}?",
                    "Just to make sure I understand, when you mentioned {topic}, did you mean {interpretation}?",
                    "I'd like to understand better - what aspects of {topic} are most important to you?"
                ]
            },
            {
                type: 'expansion',
                templates: [
                    "Building on our discussion about {topic}, I wonder if you've considered {related_concept}?",
                    "That reminds me - have you explored how {topic} connects with {related_concept}?",
                    "Your thoughts on {topic} are interesting. Have you also thought about {related_concept}?"
                ]
            },
            {
                type: 'personal',
                templates: [
                    "I'm curious about your experience with {topic}. Has it changed how you think about things?",
                    "How has your perspective on {topic} evolved over time?",
                    "What first sparked your interest in {topic}?"
                ]
            },
            {
                type: 'application',
                templates: [
                    "How might you apply what we've discussed about {topic} in your own context?",
                    "Do you see any practical ways to implement these ideas about {topic}?",
                    "I wonder how these concepts around {topic} might be useful for you specifically?"
                ]
            }
        ];
        
        // Contextual transition phrases
        this.transitionPhrases = {
            contrast: [
                "On the other hand,",
                "However,",
                "That said,",
                "Interestingly though,",
                "By contrast,"
            ],
            addition: [
                "Additionally,",
                "Furthermore,",
                "Moreover,",
                "Building on that,",
                "In addition,"
            ],
            example: [
                "For instance,",
                "As an example,",
                "To illustrate,",
                "Consider this:",
                "Specifically,"
            ],
            conclusion: [
                "In conclusion,",
                "To sum up,",
                "Ultimately,",
                "All things considered,",
                "In essence,"
            ],
            emphasis: [
                "Importantly,",
                "Notably,",
                "Significantly,",
                "It's worth highlighting that",
                "I want to emphasize that"
            ]
        };
        
        // Initialize
        this.initialize();
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    /**
     * Initialize the natural conversation flow system
     */
    async initialize() {
        try {
            // Load user preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'user-preferences');
            if (preferences) {
                if (preferences.conversationPace) {
                    this.conversationState.conversationPace = preferences.conversationPace;
                }
                
                if (preferences.conversationStyle) {
                    this.conversationState.conversationStyle = preferences.conversationStyle;
                }
                
                if (preferences.emotionalTone) {
                    this.conversationState.emotionalTone = preferences.emotionalTone;
                }
            }
            
            console.log('Natural Conversation Flow System initialized');
            
            // Notify system that conversation flow is ready
            this.eventSystem.publish('conversation-flow-ready', {
                pace: this.conversationState.conversationPace,
                style: this.conversationState.conversationStyle,
                tone: this.conversationState.emotionalTone
            });
        } catch (error) {
            console.error('Error initializing natural conversation flow system:', error);
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for user messages
        this.eventSystem.subscribe('user-message-received', (data) => {
            this.handleUserMessage(data);
        });
        
        // Listen for AI response requests
        this.eventSystem.subscribe('ai-response-request', (data) => {
            this.queueAiResponse(data);
        });
        
        // Listen for conversation pace change
        this.eventSystem.subscribe('conversation-pace-change', (data) => {
            this.setConversationPace(data.pace);
        });
        
        // Listen for conversation style change
        this.eventSystem.subscribe('conversation-style-change', (data) => {
            this.setConversationStyle(data.style);
        });
        
        // Listen for emotional tone change
        this.eventSystem.subscribe('emotional-tone-change', (data) => {
            this.setEmotionalTone(data.tone);
        });
        
        // Listen for user activity
        document.addEventListener('click', () => {
            this.updateUserActivity();
        });
        
        document.addEventListener('keydown', () => {
            this.updateUserActivity();
        });
        
        // Set up DOM event listeners
        document.addEventListener('DOMContentLoaded', () => {
            const paceSelector = document.getElementById('conversation-pace');
            const styleSelector = document.getElementById('conversation-style');
            const toneSelector = document.getElementById('emotional-tone');
            
            if (paceSelector) {
                paceSelector.addEventListener('change', (event) => {
                    this.eventSystem.publish('conversation-pace-change', {
                        pace: event.target.value
                    });
                });
                
                // Set initial value
                paceSelector.value = this.conversationState.conversationPace;
            }
            
            if (styleSelector) {
                styleSelector.addEventListener('change', (event) => {
                    this.eventSystem.publish('conversation-style-change', {
                        style: event.target.value
                    });
                });
                
                // Set initial value
                styleSelector.value = this.conversationState.conversationStyle;
            }
            
            if (toneSelector) {
                toneSelector.addEventListener('change', (event) => {
                    this.eventSystem.publish('emotional-tone-change', {
                        tone: event.target.value
                    });
                });
                
                // Set initial value
                toneSelector.value = this.conversationState.emotionalTone;
            }
        });
    }
    
    /**
     * Handle incoming user message
     * @param {Object} data - Message data
     */
    handleUserMessage(data) {
        // Update conversation state
        this.conversationState.lastUserActivity = Date.now();
        this.conversationState.messageCount++;
        this.conversationState.userMessageCount++;
        
        // Extract topic from message
        const topic = this.extractTopic(data.message);
        if (topic) {
            this.conversationState.currentTopic = topic;
        }
        
        // Cancel any pending follow-ups
        this.cancelPendingFollowUp();
        
        // Cancel idle restart if scheduled
        this.cancelIdleRestart();
        
        // Show typing indicator for AI response
        this.showTypingIndicator();
        
        // Add message to contextual memory
        if (this.contextualMemory) {
            this.contextualMemory.addMemory({
                type: 'message',
                content: data.message,
                sender: 'user',
                context: {
                    topic: this.conversationState.currentTopic,
                    timestamp: Date.now()
                }
            });
        }
        
        console.log(`User message received: "${data.message.substring(0, 30)}..."`);
    }
    
    /**
     * Queue AI response for processing
     * @param {Object} data - Response data
     */
    queueAiResponse(data) {
        // Add to response queue
        this.conversationState.responseQueue.push(data);
        
        // Process queue if not already processing
        if (!this.conversationState.processingResponse) {
            this.processResponseQueue();
        }
    }
    
    /**
     * Process response queue with natural timing
     */
    async processResponseQueue() {
        if (this.conversationState.responseQueue.length === 0) {
            this.conversationState.processingResponse = false;
            return;
        }
        
        this.conversationState.processingResponse = true;
        
        // Get next response from queue
        const responseData = this.conversationState.responseQueue.shift();
        
        // Calculate thinking time
        const thinkingTime = this.calculateThinkingTime(responseData.message);
        
        // Show typing indicator during thinking time
        this.showTypingIndicator();
        
        // Wait for thinking time
        await this.delay(thinkingTime);
        
        // Calculate typing time
        const typingTime = this.calculateTypingTime(responseData.message);
        
        // Wait for typing time
        await this.delay(typingTime);
        
        // Hide typing indicator
        this.hideTypingIndicator();
        
        // Send the response
        this.sendAiResponse(responseData);
        
        // Process next response in queue
        if (this.conversationState.responseQueue.length > 0) {
            this.processResponseQueue();
        } else {
            this.conversationState.processingResponse = false;
            
            // Schedule follow-up if appropriate
            this.scheduleFollowUp();
            
            // Schedule idle restart if appropriate
            this.scheduleIdleRestart();
        }
    }
    
    /**
     * Send AI response with natural flow
     * @param {Object} data - Response data
     */
    sendAiResponse(data) {
        // Update conversation state
        this.conversationState.lastResponseTime = Date.now();
        this.conversationState.messageCount++;
        this.conversationState.aiMessageCount++;
        
        // Extract topic from message
        const topic = this.extractTopic(data.message);
        if (topic) {
            this.conversationState.currentTopic = topic;
        }
        
        // Add message to contextual memory
        if (this.contextualMemory) {
            this.contextualMemory.addMemory({
                type: 'message',
                content: data.message,
                sender: 'ai',
                context: {
                    topic: this.conversationState.currentTopic,
                    timestamp: Date.now()
                }
            });
        }
        
        // Publish response event
        this.eventSystem.publish('ai-response-sent', {
            message: data.message,
            topic: this.conversationState.currentTopic,
            style: this.conversationState.conversationStyle,
            tone: this.conversationState.emotionalTone
        });
        
        console.log(`AI response sent: "${data.message.substring(0, 30)}..."`);
    }
    
    /**
     * Calculate thinking time before response
     * @param {string} message - Response message
     * @returns {number} - Thinking time in milliseconds
     */
    calculateThinkingTime(message) {
        // Determine base thinking time based on message complexity
        let baseTime;
        const wordCount = message.split(/\s+/).length;
        
        if (wordCount < 20) {
            baseTime = this.timingConfig.baseThinkingTime.short;
        } else if (wordCount < 50) {
            baseTime = this.timingConfig.baseThinkingTime.medium;
        } else {
            baseTime = this.timingConfig.baseThinkingTime.long;
        }
        
        // Adjust for conversation pace
        let paceMultiplier;
        switch (this.conversationState.conversationPace) {
            case 'slow':
                paceMultiplier = 1.5;
                break;
            case 'fast':
                paceMultiplier = 0.7;
                break;
            default: // normal
                paceMultiplier = 1.0;
        }
        
        // Apply pace multiplier
        baseTime *= paceMultiplier;
        
        // Add variation
        const variation = baseTime * this.timingConfig.timingVariation;
        const randomVariation = (Math.random() * variation * 2) - variation;
        
        // Calculate final thinking time
        const thinkingTime = Math.max(300, baseTime + randomVariation);
        
        return thinkingTime;
    }
    
    /**
     * Calculate typing time for response
     * @param {string} message - Response message
     * @returns {number} - Typing time in milliseconds
     */
    calculateTypingTime(message) {
        // Base time per character
        let timePerChar;
        switch (this.conversationState.conversationPace) {
            case 'slow':
                timePerChar = this.timingConfig.timePerCharacter.slow;
                break;
            case 'fast':
                timePerChar = this.timingConfig.timePerCharacter.fast;
                break;
            default: // normal
                timePerChar = this.timingConfig.timePerCharacter.normal;
        }
        
        // Calculate base typing time
        const charCount = message.length;
        let typingTime = charCount * timePerChar;
        
        // Add variation
        const variation = typingTime * this.timingConfig.timingVariation;
        const randomVariation = (Math.random() * variation * 2) - variation;
        
        // Calculate final typing time
        typingTime = Math.max(500, typingTime + randomVariation);
        
        // Cap maximum typing time
        const maxTypingTime = 5000; // 5 seconds max
        typingTime = Math.min(typingTime, maxTypingTime);
        
        return typingTime;
    }
    
    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        if (!this.conversationState.typingIndicatorActive) {
            this.conversationState.typingIndicatorActive = true;
            
            // Publish event to show typing indicator
            this.eventSystem.publish('typing-indicator-show');
            
            // Update UI
            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator) {
                typingIndicator.classList.remove('hidden');
            }
        }
    }
    
    /**
     * Hide typing indicator
     */
    hideTypingIndicator() {
        if (this.conversationState.typingIndicatorActive) {
            this.conversationState.typingIndicatorActive = false;
            
            // Publish event to hide typing indicator
            this.eventSystem.publish('typing-indicator-hide');
            
            // Update UI
            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator) {
                typingIndicator.classList.add('hidden');
            }
        }
    }
    
    /**
     * Schedule a follow-up message if appropriate
     */
    scheduleFollowUp() {
        // Cancel any existing follow-up
        this.cancelPendingFollowUp();
        
        // Determine if follow-up is appropriate
        const styleTemplate = this.styleTemplates[this.conversationState.conversationStyle];
        const followUpProbability = styleTemplate ? styleTemplate.followUpProbability : 0.4;
        
        // Only schedule follow-up if probability threshold is met
        if (Math.random() > followUpProbability) {
            return;
        }
        
        // Calculate delay for follow-up
        const minDelay = this.timingConfig.followUpTiming.min;
        const maxDelay = this.timingConfig.followUpTiming.max;
        const delay = Math.random() * (maxDelay - minDelay) + minDelay;
        
        // Schedule follow-up
        this.conversationState.followUpPending = true;
        this.conversationState.followUpTimeout = setTimeout(() => {
            this.sendFollowUp();
        }, delay);
        
        console.log(`Follow-up scheduled in ${Math.round(delay / 1000)} seconds`);
    }
    
    /**
     * Cancel any pending follow-up
     */
    cancelPendingFollowUp() {
        if (this.conversationState.followUpPending) {
            clearTimeout(this.conversationState.followUpTimeout);
            this.conversationState.followUpPending = false;
            this.conversationState.followUpTimeout = null;
        }
    }
    
    /**
     * Send a contextual follow-up message
     */
    async sendFollowUp() {
        // Reset follow-up state
        this.conversationState.followUpPending = false;
        
        // Only send follow-up if no recent user activity
        const timeSinceLastActivity = Date.now() - this.conversationState.lastUserActivity;
        if (timeSinceLastActivity < 5000) {
            return;
        }
        
        try {
            // Generate follow-up based on current topic and conversation history
            const followUp = await this.generateFollowUp();
            
            if (followUp) {
                // Show typing indicator
                this.showTypingIndicator();
                
                // Calculate typing time
                const typingTime = this.calculateTypingTime(followUp);
                
                // Wait for typing time
                await this.delay(typingTime);
                
                // Hide typing indicator
                this.hideTypingIndicator();
                
                // Send follow-up
                this.eventSystem.publish('ai-response-sent', {
                    message: followUp,
                    isFollowUp: true,
                    topic: this.conversationState.currentTopic
                });
                
                // Update conversation state
                this.conversationState.lastResponseTime = Date.now();
                this.conversationState.messageCount++;
                this.conversationState.aiMessageCount++;
                
                console.log(`Follow-up sent: "${followUp.substring(0, 30)}..."`);
            }
        } catch (error) {
            console.error('Error sending follow-up:', error);
        }
    }
    
    /**
     * Generate a contextual follow-up message
     * @returns {Promise<string>} - Follow-up message
     */
    async generateFollowUp() {
        // Get current topic
        const topic = this.conversationState.currentTopic || 'our conversation';
        
        // Select random follow-up type
        const followUpTypes = this.followUpTemplates;
        const randomType = followUpTypes[Math.floor(Math.random() * followUpTypes.length)];
        
        // Select random template from type
        const templates = randomType.templates;
        const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
        
        // Get related concept if needed
        let relatedConcept = '';
        if (randomTemplate.includes('{related_concept}')) {
            relatedConcept = await this.getRelatedConcept(topic);
        }
        
        // Generate interpretation if needed
        let interpretation = '';
        if (randomTemplate.includes('{interpretation}')) {
            interpretation = await this.generateInterpretation(topic);
        }
        
        // Fill in template
        let followUp = randomTemplate
            .replace('{topic}', topic)
            .replace('{related_concept}', relatedConcept)
            .replace('{interpretation}', interpretation);
        
        return followUp;
    }
    
    /**
     * Get a concept related to the given topic
     * @param {string} topic - Current topic
     * @returns {Promise<string>} - Related concept
     */
    async getRelatedConcept(topic) {
        // Simple related concepts for common topics
        const relatedConceptsMap = {
            'artificial intelligence': ['machine learning', 'neural networks', 'ethics in AI', 'AI applications'],
            'technology': ['innovation', 'digital transformation', 'tech ethics', 'future trends'],
            'music': ['composition', 'music theory', 'favorite artists', 'music history'],
            'art': ['creative process', 'art history', 'digital art', 'artistic inspiration'],
            'science': ['scientific method', 'recent discoveries', 'interdisciplinary research', 'science communication'],
            'books': ['favorite authors', 'literary analysis', 'reading habits', 'book recommendations'],
            'movies': ['film analysis', 'directors', 'cinematography', 'favorite genres'],
            'travel': ['destinations', 'travel experiences', 'cultural immersion', 'travel planning'],
            'food': ['cooking techniques', 'cuisine preferences', 'food culture', 'recipes'],
            'health': ['wellness practices', 'mental health', 'fitness routines', 'nutrition'],
            'education': ['learning methods', 'educational technology', 'lifelong learning', 'skill development'],
            'work': ['productivity', 'work-life balance', 'career development', 'workplace culture'],
            'philosophy': ['ethical frameworks', 'philosophical traditions', 'thought experiments', 'practical philosophy'],
            'psychology': ['cognitive processes', 'behavioral patterns', 'emotional intelligence', 'psychological well-being']
        };
        
        // Check if we have related concepts for this topic
        const lowerTopic = topic.toLowerCase();
        for (const [key, concepts] of Object.entries(relatedConceptsMap)) {
            if (lowerTopic.includes(key)) {
                // Return random related concept
                return concepts[Math.floor(Math.random() * concepts.length)];
            }
        }
        
        // If no match, try to get related concept from memory
        if (this.contextualMemory) {
            try {
                const memories = await this.contextualMemory.retrieveMemories({
                    topic: topic,
                    keywords: [topic],
                    limit: 5
                });
                
                if (memories && memories.length > 0) {
                    // Extract potential related concepts from memories
                    const potentialConcepts = [];
                    
                    for (const memory of memories) {
                        if (memory.context && memory.context.entities) {
                            potentialConcepts.push(...memory.context.entities);
                        }
                    }
                    
                    if (potentialConcepts.length > 0) {
                        // Filter out the current topic
                        const filteredConcepts = potentialConcepts.filter(
                            concept => !concept.toLowerCase().includes(lowerTopic)
                        );
                        
                        if (filteredConcepts.length > 0) {
                            // Return random related concept
                            return filteredConcepts[Math.floor(Math.random() * filteredConcepts.length)];
                        }
                    }
                }
            } catch (error) {
                console.error('Error retrieving related concept from memory:', error);
            }
        }
        
        // Default related concepts if no match found
        const defaultRelatedConcepts = [
            'different perspectives',
            'practical applications',
            'underlying principles',
            'recent developments',
            'personal experiences'
        ];
        
        return defaultRelatedConcepts[Math.floor(Math.random() * defaultRelatedConcepts.length)];
    }
    
    /**
     * Generate an interpretation of the given topic
     * @param {string} topic - Current topic
     * @returns {Promise<string>} - Interpretation
     */
    async generateInterpretation(topic) {
        // Simple interpretations for common topics
        const interpretationsMap = {
            'artificial intelligence': [
                'systems that can perform tasks requiring human intelligence',
                'the simulation of human intelligence in machines',
                'technology that enables computers to learn and problem-solve'
            ],
            'technology': [
                'tools and innovations that solve practical problems',
                'the application of scientific knowledge for practical purposes',
                'digital systems that enhance human capabilities'
            ],
            'music': [
                'an art form using sound as a medium',
                'organized sound that evokes emotional responses',
                'a universal language that transcends cultural boundaries'
            ],
            'art': [
                'creative expression that communicates ideas or emotions',
                'works created with aesthetic and imaginative intent',
                'a reflection of culture and human experience'
            ],
            'science': [
                'a systematic approach to understanding the natural world',
                'knowledge obtained through observation and experimentation',
                'the pursuit of explanations for natural phenomena'
            ]
        };
        
        // Check if we have interpretations for this topic
        const lowerTopic = topic.toLowerCase();
        for (const [key, interpretations] of Object.entries(interpretationsMap)) {
            if (lowerTopic.includes(key)) {
                // Return random interpretation
                return interpretations[Math.floor(Math.random() * interpretations.length)];
            }
        }
        
        // Default interpretations if no match found
        const defaultInterpretations = [
            `the core concepts behind ${topic}`,
            `your personal perspective on ${topic}`,
            `how ${topic} impacts everyday life`,
            `the broader implications of ${topic}`
        ];
        
        return defaultInterpretations[Math.floor(Math.random() * defaultInterpretations.length)];
    }
    
    /**
     * Extract topic from message
     * @param {string} message - Message text
     * @returns {string|null} - Extracted topic or null
     */
    extractTopic(message) {
        if (!message) return null;
        
        // Simple topic extraction based on keywords and phrases
        const topicIndicators = [
            'about', 'regarding', 'concerning', 'on the subject of',
            'talking about', 'discussing', 'thinking about', 'interested in'
        ];
        
        for (const indicator of topicIndicators) {
            const regex = new RegExp(`${indicator}\\s+([\\w\\s]+)`, 'i');
            const match = message.match(regex);
            
            if (match && match[1]) {
                // Clean up extracted topic
                let topic = match[1].trim();
                
                // Remove trailing punctuation
                topic = topic.replace(/[.,;:!?]$/, '');
                
                // Limit length
                if (topic.length > 30) {
                    topic = topic.substring(0, 30);
                }
                
                return topic;
            }
        }
        
        // If no topic indicator found, try to extract noun phrases
        const words = message.split(/\s+/);
        if (words.length >= 3) {
            // Extract 2-3 word phrases that might be topics
            const potentialTopics = [];
            
            for (let i = 0; i < words.length - 1; i++) {
                // Skip short words and common stop words
                if (words[i].length < 4 || this.isStopWord(words[i])) continue;
                
                // Check for capitalized words (proper nouns)
                if (words[i][0] === words[i][0].toUpperCase()) {
                    potentialTopics.push(words[i]);
                }
                
                // Check for 2-word phrases
                if (i < words.length - 1 && words[i+1].length >= 4) {
                    potentialTopics.push(`${words[i]} ${words[i+1]}`);
                }
                
                // Check for 3-word phrases
                if (i < words.length - 2 && words[i+1].length >= 3 && words[i+2].length >= 3) {
                    potentialTopics.push(`${words[i]} ${words[i+1]} ${words[i+2]}`);
                }
            }
            
            if (potentialTopics.length > 0) {
                // Return the longest potential topic
                potentialTopics.sort((a, b) => b.length - a.length);
                return potentialTopics[0];
            }
        }
        
        return null;
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
        
        return stopWords.includes(word.toLowerCase());
    }
    
    /**
     * Update user activity timestamp
     */
    updateUserActivity() {
        this.conversationState.lastUserActivity = Date.now();
        
        // Cancel any pending follow-ups
        this.cancelPendingFollowUp();
        
        // Cancel idle restart if scheduled
        this.cancelIdleRestart();
    }
    
    /**
     * Schedule idle conversation restart
     */
    scheduleIdleRestart() {
        // Only schedule if conversation has started
        if (this.conversationState.messageCount < 2) {
            return;
        }
        
        // Calculate delay for idle restart
        const minDelay = this.timingConfig.idleRestartTiming.min;
        const maxDelay = this.timingConfig.idleRestartTiming.max;
        const delay = Math.random() * (maxDelay - minDelay) + minDelay;
        
        // Schedule idle restart
        this.conversationState.idleRestartTimeout = setTimeout(() => {
            this.sendIdleRestart();
        }, delay);
        
        console.log(`Idle restart scheduled in ${Math.round(delay / 1000)} seconds`);
    }
    
    /**
     * Cancel idle restart
     */
    cancelIdleRestart() {
        if (this.conversationState.idleRestartTimeout) {
            clearTimeout(this.conversationState.idleRestartTimeout);
            this.conversationState.idleRestartTimeout = null;
        }
    }
    
    /**
     * Send idle conversation restart message
     */
    async sendIdleRestart() {
        // Only send if still idle
        const timeSinceLastActivity = Date.now() - this.conversationState.lastUserActivity;
        if (timeSinceLastActivity < this.timingConfig.idleRestartTiming.min) {
            return;
        }
        
        try {
            // Generate restart message based on conversation history
            const restartMessage = await this.generateIdleRestartMessage();
            
            if (restartMessage) {
                // Show typing indicator
                this.showTypingIndicator();
                
                // Calculate typing time
                const typingTime = this.calculateTypingTime(restartMessage);
                
                // Wait for typing time
                await this.delay(typingTime);
                
                // Hide typing indicator
                this.hideTypingIndicator();
                
                // Send restart message
                this.eventSystem.publish('ai-response-sent', {
                    message: restartMessage,
                    isIdleRestart: true,
                    topic: this.conversationState.currentTopic
                });
                
                // Update conversation state
                this.conversationState.lastResponseTime = Date.now();
                this.conversationState.messageCount++;
                this.conversationState.aiMessageCount++;
                
                console.log(`Idle restart sent: "${restartMessage.substring(0, 30)}..."`);
            }
        } catch (error) {
            console.error('Error sending idle restart:', error);
        }
    }
    
    /**
     * Generate idle restart message
     * @returns {Promise<string>} - Restart message
     */
    async generateIdleRestartMessage() {
        // Get current topic
        const topic = this.conversationState.currentTopic;
        
        // Template for idle restart messages
        const restartTemplates = [
            `I was thinking more about ${topic || 'our conversation'}. Would you like to explore this topic further?`,
            `I'm curious if you have any more thoughts about ${topic || 'what we were discussing'}?`,
            `I found our discussion about ${topic || 'this topic'} interesting. Is there anything else you'd like to add?`,
            `I've been reflecting on ${topic || 'our conversation'}. Would you like to continue where we left off?`,
            `I wonder if you've had any new insights about ${topic || 'our previous discussion'}?`
        ];
        
        // Select random template
        const randomTemplate = restartTemplates[Math.floor(Math.random() * restartTemplates.length)];
        
        return randomTemplate;
    }
    
    /**
     * Set conversation pace
     * @param {string} pace - Conversation pace (slow, normal, fast)
     */
    async setConversationPace(pace) {
        // Validate pace
        if (!['slow', 'normal', 'fast'].includes(pace)) {
            console.warn(`Invalid conversation pace: ${pace}, defaulting to normal`);
            pace = 'normal';
        }
        
        // Update pace
        this.conversationState.conversationPace = pace;
        
        // Save preference
        try {
            // Get current preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'user-preferences') || {
                id: 'user-preferences'
            };
            
            // Update pace preference
            preferences.conversationPace = pace;
            
            // Save preferences
            await this.storageManager.setIndexedDB('preferences', preferences);
            
            // Publish event that pace was changed
            this.eventSystem.publish('conversation-pace-changed', {
                pace: pace
            });
            
            console.log(`Conversation pace set to: ${pace}`);
        } catch (error) {
            console.error('Error saving conversation pace preference:', error);
        }
    }
    
    /**
     * Set conversation style
     * @param {string} style - Conversation style (concise, balanced, elaborate)
     */
    async setConversationStyle(style) {
        // Validate style
        if (!['concise', 'balanced', 'elaborate'].includes(style)) {
            console.warn(`Invalid conversation style: ${style}, defaulting to balanced`);
            style = 'balanced';
        }
        
        // Update style
        this.conversationState.conversationStyle = style;
        
        // Save preference
        try {
            // Get current preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'user-preferences') || {
                id: 'user-preferences'
            };
            
            // Update style preference
            preferences.conversationStyle = style;
            
            // Save preferences
            await this.storageManager.setIndexedDB('preferences', preferences);
            
            // Publish event that style was changed
            this.eventSystem.publish('conversation-style-changed', {
                style: style,
                styleData: this.styleTemplates[style]
            });
            
            console.log(`Conversation style set to: ${style}`);
        } catch (error) {
            console.error('Error saving conversation style preference:', error);
        }
    }
    
    /**
     * Set emotional tone
     * @param {string} tone - Emotional tone (neutral, warm, professional, enthusiastic)
     */
    async setEmotionalTone(tone) {
        // Validate tone
        if (!['neutral', 'warm', 'professional', 'enthusiastic'].includes(tone)) {
            console.warn(`Invalid emotional tone: ${tone}, defaulting to neutral`);
            tone = 'neutral';
        }
        
        // Update tone
        this.conversationState.emotionalTone = tone;
        
        // Save preference
        try {
            // Get current preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'user-preferences') || {
                id: 'user-preferences'
            };
            
            // Update tone preference
            preferences.emotionalTone = tone;
            
            // Save preferences
            await this.storageManager.setIndexedDB('preferences', preferences);
            
            // Publish event that tone was changed
            this.eventSystem.publish('emotional-tone-changed', {
                tone: tone,
                toneData: this.toneTemplates[tone]
            });
            
            console.log(`Emotional tone set to: ${tone}`);
        } catch (error) {
            console.error('Error saving emotional tone preference:', error);
        }
    }
    
    /**
     * Get conversation flow statistics
     * @returns {Object} - Conversation statistics
     */
    getConversationStats() {
        const now = Date.now();
        const conversationDuration = now - this.conversationState.conversationStartTime;
        const minutesActive = Math.round(conversationDuration / 60000);
        
        return {
            messageCount: this.conversationState.messageCount,
            userMessageCount: this.conversationState.userMessageCount,
            aiMessageCount: this.conversationState.aiMessageCount,
            minutesActive: minutesActive,
            currentTopic: this.conversationState.currentTopic,
            conversationPace: this.conversationState.conversationPace,
            conversationStyle: this.conversationState.conversationStyle,
            emotionalTone: this.conversationState.emotionalTone
        };
    }
    
    /**
     * Utility function to create a delay
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} - Promise that resolves after delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the natural conversation flow system when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.naturalConversationFlow = new NaturalConversationFlow();
});
