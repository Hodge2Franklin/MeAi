/**
 * Natural Conversation Flow System for MeAI
 * 
 * Features:
 * - Dynamic response timing based on message complexity
 * - Contextual follow-up questions
 * - Conversation continuity through topic transitions
 * - Natural language variations and personality
 * - Conversational repair mechanisms
 */

class NaturalConversationFlow {
    constructor(memorySystem, emotionalIntelligence) {
        // Connected systems
        this.memorySystem = memorySystem;
        this.emotionalIntelligence = emotionalIntelligence;
        
        // Conversation state
        this.currentTopic = null;
        this.previousTopics = [];
        this.topicDepth = 0;
        this.conversationStage = 'greeting'; // greeting, exploring, deepening, concluding
        
        // Response timing
        this.typingSpeed = 50; // ms per character
        this.thinkingTimeBase = 1000; // ms
        
        // Personality traits (0-1 scale)
        this.personality = {
            warmth: 0.8,
            curiosity: 0.9,
            thoughtfulness: 0.7,
            humor: 0.5,
            formality: 0.3
        };
        
        // Follow-up question templates
        this.followUpTemplates = {
            general: [
                "Can you tell me more about that?",
                "What else comes to mind when you think about this?",
                "How does that make you feel?",
                "What do you think about that?",
                "Would you like to explore this further?"
            ],
            personal: [
                "How has that affected you personally?",
                "What does that mean for you?",
                "How do you feel about that aspect of your life?",
                "Has that changed over time for you?",
                "What would you like to see happen with this?"
            ],
            clarification: [
                "Could you help me understand what you mean by {keyword}?",
                "I'm curious about what you meant when you mentioned {keyword}.",
                "Would you mind explaining a bit more about {keyword}?",
                "I'd like to make sure I understand what you mean by {keyword}.",
                "Could you elaborate on {keyword}?"
            ],
            deepening: [
                "That's interesting. What led you to that perspective?",
                "I'm curious about the experiences that shaped that view.",
                "What aspects of this matter most to you?",
                "How has your thinking on this evolved over time?",
                "What would be an ideal outcome in this situation?"
            ],
            transition: [
                "That reminds me, earlier you mentioned {previous_topic}. How does this relate?",
                "I'm seeing a connection to {previous_topic} that you brought up earlier.",
                "This seems to connect with what you said about {previous_topic}.",
                "I'm curious how this relates to your thoughts on {previous_topic}.",
                "Does this have any connection to {previous_topic} for you?"
            ]
        };
        
        // Conversation repair templates
        this.repairTemplates = {
            misunderstanding: [
                "I think I might have misunderstood. Could you clarify what you mean?",
                "I want to make sure I'm understanding you correctly. Could you rephrase that?",
                "I'm not sure I fully grasped what you meant. Could you explain differently?",
                "I apologize if I misunderstood. Could you help me understand better?"
            ],
            noResponse: [
                "I notice you haven't responded. Is there something else you'd like to talk about?",
                "Would you prefer to explore a different topic?",
                "We can shift to something else if you'd like.",
                "Is there something specific you'd like to discuss instead?"
            ],
            repetition: [
                "I realize we've been discussing this for a while. Would you like to explore a different aspect?",
                "We've covered this from several angles. Is there another topic you're curious about?",
                "I wonder if there's a related area you'd like to explore?",
                "Would you like to shift our conversation in a new direction?"
            ]
        };
        
        // Filler phrases for natural pauses
        this.fillerPhrases = [
            "Let me think about that...",
            "That's an interesting point...",
            "I'm reflecting on what you said...",
            "Hmm, let me consider that...",
            "I appreciate you sharing that..."
        ];
        
        // Transition phrases
        this.transitionPhrases = [
            "Speaking of which...",
            "That reminds me...",
            "On a related note...",
            "This connects to...",
            "This makes me think about..."
        ];
    }
    
    /**
     * Initialize the natural conversation flow system
     */
    initialize() {
        console.log('Natural Conversation Flow System initialized');
        return true;
    }
    
    /**
     * Process a user message and generate a natural response
     * @param {Object} message User message
     * @param {Object} context Conversation context
     * @returns {Object} Response with natural flow elements
     */
    processMessage(message, context = {}) {
        // Update conversation state
        this.updateConversationState(message, context);
        
        // Determine appropriate response type
        const responseType = this.determineResponseType(message, context);
        
        // Calculate appropriate timing
        const timing = this.calculateResponseTiming(message, responseType);
        
        // Generate response content
        const responseContent = this.generateResponseContent(message, responseType, context);
        
        // Add natural language variations
        const enhancedResponse = this.addNaturalLanguageVariations(responseContent);
        
        return {
            content: enhancedResponse,
            timing: timing,
            conversationState: {
                topic: this.currentTopic,
                stage: this.conversationStage,
                depth: this.topicDepth
            }
        };
    }
    
    /**
     * Update conversation state based on message
     * @param {Object} message User message
     * @param {Object} context Conversation context
     */
    updateConversationState(message, context) {
        // Extract topics from message
        const topics = context.topics || [];
        
        // Update current topic if new topics detected
        if (topics.length > 0) {
            // If topic is changing, store previous topic
            if (this.currentTopic && this.currentTopic !== topics[0]) {
                this.previousTopics.unshift(this.currentTopic);
                // Keep only last 5 topics
                if (this.previousTopics.length > 5) {
                    this.previousTopics.pop();
                }
                this.topicDepth = 1; // Reset depth for new topic
            } else if (this.currentTopic === topics[0]) {
                // Increase depth if continuing same topic
                this.topicDepth++;
            }
            
            this.currentTopic = topics[0];
        }
        
        // Update conversation stage
        const messageCount = context.messageCount || 0;
        
        if (messageCount <= 2) {
            this.conversationStage = 'greeting';
        } else if (messageCount <= 5) {
            this.conversationStage = 'exploring';
        } else if (this.topicDepth >= 3) {
            this.conversationStage = 'deepening';
        } else if (messageCount > 15) {
            this.conversationStage = 'concluding';
        }
    }
    
    /**
     * Determine appropriate response type
     * @param {Object} message User message
     * @param {Object} context Conversation context
     * @returns {string} Response type
     */
    determineResponseType(message, context) {
        // Check if message is a question
        const isQuestion = message.text.includes('?') || 
            /^(what|who|where|when|why|how|can|could|would|is|are|do|does|did)/i.test(message.text.toLowerCase());
        
        // Check for conversation repair needs
        if (this.needsRepair(message, context)) {
            return 'repair';
        }
        
        // Determine response type based on conversation stage and message
        if (this.conversationStage === 'greeting') {
            return 'greeting';
        } else if (isQuestion) {
            return 'answer';
        } else if (this.topicDepth >= 3 && Math.random() < 0.7) {
            return 'deepening';
        } else if (this.previousTopics.length > 0 && Math.random() < 0.3) {
            return 'transition';
        } else if (Math.random() < 0.6) {
            return 'followUp';
        } else {
            return 'reflection';
        }
    }
    
    /**
     * Calculate appropriate response timing
     * @param {Object} message User message
     * @param {string} responseType Type of response
     * @returns {Object} Timing information
     */
    calculateResponseTiming(message, responseType) {
        // Base thinking time depends on message length and complexity
        let thinkingTime = this.thinkingTimeBase;
        
        // Adjust for message length
        thinkingTime += Math.min(2000, message.text.length * 5);
        
        // Adjust for response type
        switch (responseType) {
            case 'greeting':
                thinkingTime *= 0.5; // Faster for greetings
                break;
            case 'answer':
                thinkingTime *= 1.5; // Longer for answers
                break;
            case 'deepening':
                thinkingTime *= 1.8; // Longer for deep responses
                break;
            case 'repair':
                thinkingTime *= 0.7; // Quicker for repairs
                break;
            case 'transition':
                thinkingTime *= 1.3; // Slightly longer for transitions
                break;
        }
        
        // Add some randomness (±20%)
        const randomFactor = 0.8 + (Math.random() * 0.4);
        thinkingTime *= randomFactor;
        
        // Calculate typing time based on response length
        // This will be calculated after generating the response
        
        return {
            thinkingTime: Math.round(thinkingTime),
            typingSpeed: this.typingSpeed
        };
    }
    
    /**
     * Generate response content based on type
     * @param {Object} message User message
     * @param {string} responseType Type of response
     * @param {Object} context Conversation context
     * @returns {Object} Response content
     */
    generateResponseContent(message, responseType, context) {
        // Get emotional response if available
        let emotionalResponse = null;
        if (this.emotionalIntelligence) {
            const userEmotions = this.emotionalIntelligence.detectEmotions(message.text);
            const strategy = this.emotionalIntelligence.determineResponseStrategy(userEmotions, context);
            emotionalResponse = this.emotionalIntelligence.generateResponse(userEmotions, strategy, context);
        }
        
        // Get relevant memories if available
        let relevantMemories = [];
        if (this.memorySystem) {
            const processedMessage = this.memorySystem.processMessage({
                text: message.text,
                sender: 'user',
                timestamp: new Date()
            });
            relevantMemories = processedMessage.relevantMemories || [];
        }
        
        // Generate base response
        let baseResponse = '';
        let followUp = '';
        
        switch (responseType) {
            case 'greeting':
                baseResponse = this.generateGreeting(context);
                break;
            case 'answer':
                baseResponse = this.generateAnswer(message, context);
                break;
            case 'followUp':
                baseResponse = this.generateReflection(message, emotionalResponse);
                followUp = this.generateFollowUpQuestion(message, context);
                break;
            case 'deepening':
                baseResponse = this.generateDeepening(message, relevantMemories, emotionalResponse);
                break;
            case 'transition':
                baseResponse = this.generateTransition(message, context);
                break;
            case 'reflection':
                baseResponse = this.generateReflection(message, emotionalResponse);
                break;
            case 'repair':
                baseResponse = this.generateRepair(context);
                break;
            default:
                baseResponse = "I understand. Please tell me more.";
        }
        
        return {
            baseResponse,
            followUp,
            emotionalResponse,
            responseType
        };
    }
    
    /**
     * Generate a greeting response
     * @param {Object} context Conversation context
     * @returns {string} Greeting response
     */
    generateGreeting(context) {
        const greetings = [
            "Hello! It's wonderful to connect with you today.",
            "Hi there! I'm really looking forward to our conversation.",
            "Greetings! I'm here and ready to chat with you.",
            "Hello! I'm excited to talk with you today.",
            "Hi! It's great to see you. How can I enhance your day?"
        ];
        
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    /**
     * Generate an answer response
     * @param {Object} message User message
     * @param {Object} context Conversation context
     * @returns {string} Answer response
     */
    generateAnswer(message, context) {
        // This would typically connect to a knowledge base or LLM
        // For this implementation, we'll use a simple placeholder
        
        return "That's an excellent question. While I don't have a specific answer prepared, I'd be happy to explore this topic with you and share my thoughts.";
    }
    
    /**
     * Generate a follow-up question
     * @param {Object} message User message
     * @param {Object} context Conversation context
     * @returns {string} Follow-up question
     */
    generateFollowUpQuestion(message, context) {
        let templates;
        
        // Select appropriate template category
        if (this.topicDepth >= 2) {
            templates = this.followUpTemplates.deepening;
        } else if (this.currentTopic === 'personal') {
            templates = this.followUpTemplates.personal;
        } else if (message.text.length < 50 || context.needsClarification) {
            templates = this.followUpTemplates.clarification;
        } else {
            templates = this.followUpTemplates.general;
        }
        
        // Select random template
        let template = templates[Math.floor(Math.random() * templates.length)];
        
        // Replace any placeholders
        if (template.includes('{keyword}') && message.keywords && message.keywords.length > 0) {
            const keyword = message.keywords[Math.floor(Math.random() * message.keywords.length)];
            template = template.replace('{keyword}', keyword);
        }
        
        return template;
    }
    
    /**
     * Generate a deepening response
     * @param {Object} message User message
     * @param {Array} relevantMemories Relevant memories
     * @param {Object} emotionalResponse Emotional response
     * @returns {string} Deepening response
     */
    generateDeepening(message, relevantMemories, emotionalResponse) {
        let response = '';
        
        // Add emotional component if available
        if (emotionalResponse && emotionalResponse.responsePattern) {
            response += emotionalResponse.responsePattern + ' ';
        }
        
        // Reference past conversation if available
        if (relevantMemories && relevantMemories.length > 0) {
            const memory = relevantMemories[0];
            response += `I remember you mentioned ${memory.text.substring(0, 40)}... `;
        }
        
        // Add thoughtful reflection
        const reflections = [
            "This reminds me that our conversations often reveal deeper patterns in how we think and feel.",
            "I find it fascinating how our perspectives are shaped by our experiences and values.",
            "The way we approach these topics often reflects what matters most to us.",
            "These kinds of reflections help us understand ourselves better.",
            "Exploring these thoughts can lead to meaningful insights."
        ];
        
        response += reflections[Math.floor(Math.random() * reflections.length)];
        
        return response;
    }
    
    /**
     * Generate a transition response
     * @param {Object} message User message
     * @param {Object} context Conversation context
     * @returns {string} Transition response
     */
    generateTransition(message, context) {
        if (this.previousTopics.length === 0) {
            return this.generateReflection(message);
        }
        
        // Select a previous topic to transition to
        const previousTopic = this.previousTopics[0];
        
        // Select transition phrase
        const transitionPhrase = this.transitionPhrases[Math.floor(Math.random() * this.transitionPhrases.length)];
        
        // Select transition template
        let template = this.followUpTemplates.transition[Math.floor(Math.random() * this.followUpTemplates.transition.length)];
        
        // Replace placeholder
        template = template.replace('{previous_topic}', previousTopic);
        
        return `${transitionPhrase} ${template}`;
    }
    
    /**
     * Generate a reflection response
     * @param {Object} message User message
     * @param {Object} emotionalResponse Emotional response
     * @returns {string} Reflection response
     */
    generateReflection(message, emotionalResponse) {
        let response = '';
        
        // Add emotional component if available
        if (emotionalResponse && emotionalResponse.responsePattern) {
            return emotionalResponse.responsePattern;
        }
        
        // Default reflections
        const reflections = [
            "I appreciate you sharing that with me.",
            "That's a really interesting perspective.",
            "Thank you for expressing your thoughts on this.",
            "I value hearing your point of view on this.",
            "That gives me a better understanding of your thinking."
        ];
        
        response = reflections[Math.floor(Math.random() * reflections.length)];
        
        return response;
    }
    
    /**
     * Generate a repair response
     * @param {Object} context Conversation context
     * @returns {string} Repair response
     */
    generateRepair(context) {
        let templates;
        
        // Determine repair type
        if (context.noResponse) {
            templates = this.repairTemplates.noResponse;
        } else if (context.repetition) {
            templates = this.repairTemplates.repetition;
        } else {
            templates = this.repairTemplates.misunderstanding;
        }
        
        return templates[Math.floor(Math.random() * templates.length)];
    }
    
    /**
     * Add natural language variations to response
     * @param {Object} responseContent Response content
     * @returns {string} Enhanced response
     */
    addNaturalLanguageVariations(responseContent) {
        let { baseResponse, followUp, emotionalResponse, responseType } = responseContent;
        let enhancedResponse = baseResponse;
        
        // Add filler phrase occasionally
        if (Math.random() < 0.3 && responseType !== 'greeting' && responseType !== 'repair') {
            const fillerPhrase = this.fillerPhrases[Math.floor(Math.random() * this.fillerPhrases.length)];
            enhancedResponse = `${fillerPhrase} ${enhancedResponse}`;
        }
        
        // Add personality variations based on personality traits
        enhancedResponse = this.addPersonalityVariations(enhancedResponse);
        
        // Add follow-up if available
        if (followUp) {
            enhancedResponse = `${enhancedResponse} ${followUp}`;
        }
        
        return enhancedResponse;
    }
    
    /**
     * Add personality variations to response
     * @param {string} response Base response
     * @returns {string} Response with personality variations
     */
    addPersonalityVariations(response) {
        let result = response;
        
        // Add warmth (emoticons, warm phrases)
        if (Math.random() < this.personality.warmth * 0.3) {
            const warmPhrases = [
                " I'm really enjoying our conversation.",
                " I find this exchange meaningful.",
                " I appreciate your openness.",
                " I'm glad we're talking about this.",
                " I value your perspective."
            ];
            result += warmPhrases[Math.floor(Math.random() * warmPhrases.length)];
        }
        
        // Add curiosity (questions, wondering)
        if (Math.random() < this.personality.curiosity * 0.2 && !result.includes('?')) {
            const curiousPhrases = [
                " I wonder what you think about that?",
                " What's your perspective on this?",
                " I'm curious to hear more of your thoughts.",
                " What do you make of that?",
                " Does that resonate with you?"
            ];
            result += curiousPhrases[Math.floor(Math.random() * curiousPhrases.length)];
        }
        
        // Add thoughtfulness (pauses, reflective phrases)
        if (Math.random() < this.personality.thoughtfulness * 0.3) {
            const thoughtfulPhrases = [
                " On reflection, ",
                " Taking a moment to consider this, ",
                " If I may share a thought, ",
                " This brings to mind, ",
                " I find myself reflecting on "
            ];
            
            // Insert at beginning of a sentence
            const sentences = result.split('. ');
            if (sentences.length > 1) {
                const insertIndex = Math.floor(Math.random() * (sentences.length - 1)) + 1;
                const phrase = thoughtfulPhrases[Math.floor(Math.random() * thoughtfulPhrases.length)];
                sentences[insertIndex] = phrase + sentences[insertIndex].charAt(0).toLowerCase() + sentences[insertIndex].slice(1);
                result = sentences.join('. ');
            }
        }
        
        // Add humor (light comments)
        if (Math.random() < this.personality.humor * 0.15) {
            const humorPhrases = [
                " (I promise I'm not just saying that!)",
                " (No existential crisis necessary for that insight!)",
                " (My virtual neurons are buzzing with that idea!)",
                " (That's what I call food for thought!)",
                " (Mind = blown, in the best possible way!)"
            ];
            
            // Only add humor if response is positive
            if (!result.includes('sorry') && !result.includes('apologize') && !result.includes('difficult')) {
                result += humorPhrases[Math.floor(Math.random() * humorPhrases.length)];
            }
        }
        
        // Adjust formality
        if (this.personality.formality < 0.3) {
            // Make less formal
            result = result.replace('I am', "I'm")
                .replace('cannot', "can't")
                .replace('could not', "couldn't")
                .replace('would not', "wouldn't")
                .replace('do not', "don't")
                .replace('does not', "doesn't")
                .replace('did not', "didn't")
                .replace('have not', "haven't")
                .replace('has not', "hasn't")
                .replace('had not', "hadn't");
        } else if (this.personality.formality > 0.7) {
            // Make more formal
            result = result.replace("I'm", 'I am')
                .replace("can't", 'cannot')
                .replace("couldn't", 'could not')
                .replace("wouldn't", 'would not')
                .replace("don't", 'do not')
                .replace("doesn't", 'does not')
                .replace("didn't", 'did not')
                .replace("haven't", 'have not')
                .replace("hasn't", 'has not')
                .replace("hadn't", 'had not');
        }
        
        return result;
    }
    
    /**
     * Check if conversation needs repair
     * @param {Object} message User message
     * @param {Object} context Conversation context
     * @returns {boolean} Whether repair is needed
     */
    needsRepair(message, context) {
        // Check for very short, potentially confused responses
        if (message.text.length < 5 && 
            ['what', 'huh', '?', 'idk', 'um'].includes(message.text.toLowerCase())) {
            return true;
        }
        
        // Check for explicit confusion
        if (/i('m| am) (confused|not sure|don't understand|lost)/i.test(message.text)) {
            return true;
        }
        
        // Check for repetition in conversation
        if (context.repetition) {
            return true;
        }
        
        // Check for long period of no response
        if (context.noResponse) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Calculate final response timing
     * @param {string} response Final response text
     * @param {Object} baseTiming Base timing information
     * @returns {Object} Final timing information
     */
    calculateFinalTiming(response, baseTiming) {
        // Calculate typing time based on response length
        const typingTime = response.length * baseTiming.typingSpeed;
        
        return {
            thinkingTime: baseTiming.thinkingTime,
            typingTime: typingTime,
            totalTime: baseTiming.thinkingTime + typingTime
        };
    }
    
    /**
     * Set personality traits
     * @param {Object} traits Personality traits
     */
    setPersonality(traits) {
        for (const trait in traits) {
            if (this.personality.hasOwnProperty(trait)) {
                this.personality[trait] = Math.max(0, Math.min(1, traits[trait]));
            }
        }
        
        console.log('Personality updated:', this.personality);
    }
    
    /**
     * Set response timing parameters
     * @param {Object} params Timing parameters
     */
    setTimingParameters(params) {
        if (params.typingSpeed) {
            this.typingSpeed = params.typingSpeed;
        }
        
        if (params.thinkingTimeBase) {
            this.thinkingTimeBase = params.thinkingTimeBase;
        }
        
        console.log('Timing parameters updated:', {
            typingSpeed: this.typingSpeed,
            thinkingTimeBase: this.thinkingTimeBase
        });
    }
}
