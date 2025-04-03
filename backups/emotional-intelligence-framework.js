/**
 * Emotional Intelligence Framework for MeAI
 * 
 * Features:
 * - Emotion detection from user messages
 * - Appropriate emotional responses
 * - Empathetic understanding and mirroring
 * - Emotional state tracking over time
 * - Adaptive response based on user emotional patterns
 */

class EmotionalIntelligenceFramework {
    constructor(memorySystem, pixelAnimation, backgroundSystem) {
        // Connected systems
        this.memorySystem = memorySystem;
        this.pixelAnimation = pixelAnimation;
        this.backgroundSystem = backgroundSystem;
        
        // Emotional state tracking
        this.currentUserEmotion = {
            primary: 'neutral',
            intensity: 0.5,
            timestamp: new Date()
        };
        
        this.currentMeAIEmotion = {
            primary: 'neutral',
            intensity: 0.5,
            timestamp: new Date()
        };
        
        // Emotional history
        this.userEmotionalHistory = [];
        this.meaiEmotionalHistory = [];
        this.historyLimit = 20;
        
        // Emotion definitions
        this.emotions = {
            joy: {
                keywords: ['happy', 'glad', 'excited', 'delighted', 'pleased', 'cheerful', 'content', 'thrilled', 'elated', 'joyful', 'wonderful', 'great'],
                opposites: ['sadness', 'anger'],
                responsePatterns: [
                    "I'm so happy to hear that!",
                    "That's wonderful news!",
                    "I'm delighted for you!",
                    "That brings me joy to hear.",
                    "How wonderful!"
                ],
                empathyPatterns: [
                    "Your happiness is contagious!",
                    "I can feel your excitement!",
                    "Your joy brightens our conversation.",
                    "I'm sharing in your happiness right now."
                ]
            },
            sadness: {
                keywords: ['sad', 'unhappy', 'depressed', 'down', 'blue', 'gloomy', 'miserable', 'upset', 'heartbroken', 'disappointed', 'discouraged'],
                opposites: ['joy'],
                responsePatterns: [
                    "I'm sorry to hear that you're feeling this way.",
                    "That sounds really difficult.",
                    "I understand that must be hard for you.",
                    "It's okay to feel sad sometimes.",
                    "I'm here for you during this difficult time."
                ],
                empathyPatterns: [
                    "I wish I could give you a comforting hug right now.",
                    "Your feelings are valid and important.",
                    "I'm holding space for your sadness.",
                    "Take all the time you need to process these feelings."
                ]
            },
            anger: {
                keywords: ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'frustrated', 'outraged', 'enraged', 'hostile', 'bitter', 'resentful'],
                opposites: ['joy', 'calm'],
                responsePatterns: [
                    "I can understand why you'd feel frustrated about that.",
                    "That would make anyone upset.",
                    "Your feelings are completely valid.",
                    "It sounds like this really bothered you.",
                    "I appreciate you sharing these strong feelings with me."
                ],
                empathyPatterns: [
                    "Let's take a moment to acknowledge these feelings.",
                    "Would it help to talk more about why this made you angry?",
                    "Sometimes expressing anger is important for processing emotions.",
                    "I'm here to listen without judgment."
                ]
            },
            fear: {
                keywords: ['afraid', 'scared', 'frightened', 'terrified', 'anxious', 'worried', 'nervous', 'uneasy', 'concerned', 'panicked', 'alarmed'],
                opposites: ['calm', 'confidence'],
                responsePatterns: [
                    "It's natural to feel afraid in that situation.",
                    "Your concerns are completely understandable.",
                    "Many people would feel the same way.",
                    "Thank you for sharing your fears with me.",
                    "I'm here to support you through this."
                ],
                empathyPatterns: [
                    "Let's take a deep breath together.",
                    "You're not alone with these feelings.",
                    "Fear is our mind's way of protecting us, even when it's uncomfortable.",
                    "I'm right here with you as you process this."
                ]
            },
            surprise: {
                keywords: ['surprised', 'shocked', 'amazed', 'astonished', 'stunned', 'startled', 'unexpected', 'wow', 'whoa', 'unbelievable', 'incredible'],
                opposites: ['boredom'],
                responsePatterns: [
                    "Wow, that is surprising!",
                    "I can see why that would catch you off guard!",
                    "That's quite unexpected!",
                    "What an amazing turn of events!",
                    "I'm surprised by that too!"
                ],
                empathyPatterns: [
                    "It's those unexpected moments that really stand out, isn't it?",
                    "Surprises can really shift our perspective.",
                    "I'm taking in this surprising information with you.",
                    "Sometimes life's surprises can be meaningful moments."
                ]
            },
            disgust: {
                keywords: ['disgusted', 'revolted', 'repulsed', 'appalled', 'horrified', 'offended', 'sickened', 'gross', 'nasty', 'awful', 'terrible'],
                opposites: ['joy', 'admiration'],
                responsePatterns: [
                    "I understand why you'd find that disturbing.",
                    "That does sound unpleasant.",
                    "I can see why that would bother you.",
                    "Many people would feel the same way about that.",
                    "It's natural to have strong reactions to things we find objectionable."
                ],
                empathyPatterns: [
                    "Our reactions of disgust often reflect our values.",
                    "It's okay to have strong boundaries about things that disturb you.",
                    "I appreciate you sharing your honest reaction with me.",
                    "Sometimes these reactions help us understand what matters to us."
                ]
            },
            calm: {
                keywords: ['calm', 'peaceful', 'relaxed', 'tranquil', 'serene', 'content', 'centered', 'balanced', 'composed', 'collected', 'at ease'],
                opposites: ['anger', 'fear', 'anxiety'],
                responsePatterns: [
                    "It sounds like you're in a good headspace.",
                    "That sense of calm is so valuable.",
                    "I'm glad you're feeling peaceful.",
                    "There's something special about those tranquil moments.",
                    "It's wonderful to hear you're feeling centered."
                ],
                empathyPatterns: [
                    "I feel more centered just talking with you right now.",
                    "Let's appreciate this moment of tranquility together.",
                    "There's wisdom in that calm perspective.",
                    "I'm enjoying this peaceful energy in our conversation."
                ]
            },
            curiosity: {
                keywords: ['curious', 'interested', 'intrigued', 'fascinated', 'wonder', 'questioning', 'exploring', 'learning', 'discovering', 'inquisitive'],
                opposites: ['boredom', 'apathy'],
                responsePatterns: [
                    "That's a fascinating question!",
                    "I'm intrigued by that too.",
                    "What an interesting perspective to explore!",
                    "I love your curious nature.",
                    "That's something worth wondering about."
                ],
                empathyPatterns: [
                    "Your curiosity is contagious!",
                    "I'm enjoying exploring these ideas with you.",
                    "Curiosity opens so many doors to new understanding.",
                    "Let's discover more about this together."
                ]
            },
            gratitude: {
                keywords: ['grateful', 'thankful', 'appreciative', 'blessed', 'fortunate', 'appreciate', 'thanks', 'thank you', 'gratitude'],
                opposites: ['resentment', 'entitlement'],
                responsePatterns: [
                    "It's wonderful to practice gratitude.",
                    "I appreciate your thankful perspective.",
                    "Gratitude can be so powerful.",
                    "It's beautiful to recognize the good things.",
                    "I'm grateful for you sharing that with me."
                ],
                empathyPatterns: [
                    "Your gratitude reminds me of what's important.",
                    "I feel thankful for this moment of connection.",
                    "There's something powerful about acknowledging what we appreciate.",
                    "I'm grateful for our conversation right now."
                ]
            },
            confidence: {
                keywords: ['confident', 'sure', 'certain', 'self-assured', 'strong', 'capable', 'empowered', 'bold', 'brave', 'determined'],
                opposites: ['fear', 'doubt', 'insecurity'],
                responsePatterns: [
                    "I admire your confidence!",
                    "That self-assurance will serve you well.",
                    "You sound very certain about this.",
                    "Your determination is impressive.",
                    "I believe in your capabilities too."
                ],
                empathyPatterns: [
                    "Your confidence inspires me.",
                    "There's something powerful about knowing your own strength.",
                    "I feel more certain just hearing your perspective.",
                    "That kind of self-assurance often leads to great things."
                ]
            },
            neutral: {
                keywords: [],
                opposites: [],
                responsePatterns: [
                    "I understand.",
                    "I see what you mean.",
                    "That makes sense.",
                    "I follow your thinking.",
                    "I appreciate you sharing that."
                ],
                empathyPatterns: [
                    "I'm here and listening.",
                    "I value your perspective.",
                    "Thank you for sharing your thoughts with me.",
                    "I'm engaged in our conversation."
                ]
            }
        };
        
        // Emotional response strategies
        this.responseStrategies = {
            mirror: {
                description: "Mirror the user's emotional state to show understanding",
                weight: 0.3,
                conditions: ["initial_response", "strong_emotion"]
            },
            complement: {
                description: "Respond with a complementary emotion that supports the user",
                weight: 0.4,
                conditions: ["follow_up", "negative_emotion"]
            },
            regulate: {
                description: "Help regulate extreme emotions with a calming response",
                weight: 0.2,
                conditions: ["extreme_emotion", "repeated_pattern"]
            },
            elevate: {
                description: "Respond with slightly more positive emotion to elevate mood",
                weight: 0.3,
                conditions: ["neutral_or_negative", "extended_conversation"]
            },
            match: {
                description: "Match the emotional intensity but with appropriate emotion",
                weight: 0.4,
                conditions: ["any"]
            }
        };
    }
    
    /**
     * Initialize the emotional intelligence framework
     */
    initialize() {
        console.log('Emotional Intelligence Framework initialized');
        return true;
    }
    
    /**
     * Process a user message to detect emotions
     * @param {Object} message User message object
     * @param {Object} context Conversation context
     * @returns {Object} Detected emotions and response strategy
     */
    processUserMessage(message, context = {}) {
        // Detect emotions in the message
        const detectedEmotions = this.detectEmotions(message.text);
        
        // Update user emotional state
        this.updateUserEmotionalState(detectedEmotions);
        
        // Determine appropriate response strategy
        const responseStrategy = this.determineResponseStrategy(detectedEmotions, context);
        
        // Update visual elements if available
        this.updateVisualElements(detectedEmotions.primary);
        
        return {
            detectedEmotions,
            responseStrategy,
            userEmotionalState: { ...this.currentUserEmotion }
        };
    }
    
    /**
     * Detect emotions in text
     * @param {string} text Text to analyze
     * @returns {Object} Detected emotions with scores
     */
    detectEmotions(text) {
        const lowerText = text.toLowerCase();
        const emotionScores = {};
        let totalScore = 0;
        
        // Check for emotion keywords
        for (const [emotion, data] of Object.entries(this.emotions)) {
            if (emotion === 'neutral') continue; // Skip neutral for keyword matching
            
            let score = 0;
            
            // Check each keyword
            for (const keyword of data.keywords) {
                // Look for the keyword with word boundaries
                const regex = new RegExp(`\\b${keyword}\\b`, 'i');
                if (regex.test(lowerText)) {
                    score += 1;
                }
            }
            
            if (score > 0) {
                emotionScores[emotion] = score;
                totalScore += score;
            }
        }
        
        // If no emotions detected, default to neutral
        if (totalScore === 0) {
            return {
                primary: 'neutral',
                secondary: null,
                scores: { neutral: 1 },
                intensity: 0.5
            };
        }
        
        // Normalize scores
        for (const emotion in emotionScores) {
            emotionScores[emotion] /= totalScore;
        }
        
        // Find primary and secondary emotions
        const sortedEmotions = Object.entries(emotionScores)
            .sort((a, b) => b[1] - a[1]);
        
        const primary = sortedEmotions[0][0];
        const secondary = sortedEmotions.length > 1 ? sortedEmotions[1][0] : null;
        
        // Calculate intensity (higher if multiple keywords matched)
        const intensity = Math.min(1, totalScore / 3);
        
        return {
            primary,
            secondary,
            scores: emotionScores,
            intensity
        };
    }
    
    /**
     * Update user emotional state based on detected emotions
     * @param {Object} detectedEmotions Emotions detected in message
     */
    updateUserEmotionalState(detectedEmotions) {
        // Update current state
        this.currentUserEmotion = {
            primary: detectedEmotions.primary,
            secondary: detectedEmotions.secondary,
            intensity: detectedEmotions.intensity,
            timestamp: new Date()
        };
        
        // Add to history
        this.userEmotionalHistory.push({ ...this.currentUserEmotion });
        
        // Trim history if needed
        if (this.userEmotionalHistory.length > this.historyLimit) {
            this.userEmotionalHistory.shift();
        }
    }
    
    /**
     * Determine appropriate response strategy
     * @param {Object} detectedEmotions Emotions detected in message
     * @param {Object} context Conversation context
     * @returns {Object} Selected response strategy
     */
    determineResponseStrategy(detectedEmotions, context) {
        const strategies = [];
        
        // Check which strategies apply to current situation
        for (const [name, strategy] of Object.entries(this.responseStrategies)) {
            let applicable = false;
            
            // Check if strategy conditions are met
            if (strategy.conditions.includes('any')) {
                applicable = true;
            } else {
                for (const condition of strategy.conditions) {
                    switch (condition) {
                        case 'initial_response':
                            applicable = context.isFirstResponse || false;
                            break;
                        case 'strong_emotion':
                            applicable = detectedEmotions.intensity > 0.7;
                            break;
                        case 'negative_emotion':
                            applicable = ['sadness', 'anger', 'fear', 'disgust'].includes(detectedEmotions.primary);
                            break;
                        case 'extreme_emotion':
                            applicable = detectedEmotions.intensity > 0.9;
                            break;
                        case 'repeated_pattern':
                            applicable = this.detectRepeatedEmotionalPattern();
                            break;
                        case 'neutral_or_negative':
                            applicable = detectedEmotions.primary === 'neutral' || 
                                ['sadness', 'anger', 'fear', 'disgust'].includes(detectedEmotions.primary);
                            break;
                        case 'extended_conversation':
                            applicable = (context.messageCount || 0) > 5;
                            break;
                        case 'follow_up':
                            applicable = (context.messageCount || 0) > 1;
                            break;
                    }
                    
                    if (applicable) break;
                }
            }
            
            if (applicable) {
                strategies.push({
                    name,
                    weight: strategy.weight,
                    description: strategy.description
                });
            }
        }
        
        // If no strategies apply, default to match
        if (strategies.length === 0) {
            const defaultStrategy = this.responseStrategies.match;
            strategies.push({
                name: 'match',
                weight: defaultStrategy.weight,
                description: defaultStrategy.description
            });
        }
        
        // Select strategy based on weights
        const totalWeight = strategies.reduce((sum, s) => sum + s.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const strategy of strategies) {
            random -= strategy.weight;
            if (random <= 0) {
                return strategy;
            }
        }
        
        // Fallback to first strategy
        return strategies[0];
    }
    
    /**
     * Generate an emotionally intelligent response
     * @param {Object} userEmotions Detected user emotions
     * @param {Object} strategy Selected response strategy
     * @param {Object} context Conversation context
     * @returns {Object} Response with emotional content
     */
    generateResponse(userEmotions, strategy, context = {}) {
        // Determine MeAI emotion based on strategy and user emotion
        const meaiEmotion = this.determineResponseEmotion(userEmotions, strategy);
        
        // Update MeAI emotional state
        this.updateMeAIEmotionalState(meaiEmotion);
        
        // Get appropriate response patterns
        const responsePatterns = this.getResponsePatterns(meaiEmotion, userEmotions);
        
        // Select a response pattern
        const selectedPattern = this.selectResponsePattern(responsePatterns, context);
        
        return {
            emotion: meaiEmotion,
            responsePattern: selectedPattern,
            meaiEmotionalState: { ...this.currentMeAIEmotion }
        };
    }
    
    /**
     * Determine appropriate response emotion based on strategy
     * @param {Object} userEmotions Detected user emotions
     * @param {Object} strategy Selected response strategy
     * @returns {Object} Response emotion
     */
    determineResponseEmotion(userEmotions, strategy) {
        const userPrimary = userEmotions.primary;
        let responsePrimary = 'neutral';
        let intensity = 0.5;
        
        switch (strategy.name) {
            case 'mirror':
                // Mirror the same emotion
                responsePrimary = userPrimary;
                intensity = userEmotions.intensity * 0.9; // Slightly less intense
                break;
                
            case 'complement':
                // Choose complementary emotion
                if (['sadness', 'fear', 'anger'].includes(userPrimary)) {
                    responsePrimary = 'calm';
                    intensity = 0.7;
                } else if (userPrimary === 'disgust') {
                    responsePrimary = 'curiosity';
                    intensity = 0.6;
                } else if (userPrimary === 'surprise') {
                    responsePrimary = 'curiosity';
                    intensity = userEmotions.intensity;
                } else {
                    responsePrimary = userPrimary;
                    intensity = userEmotions.intensity;
                }
                break;
                
            case 'regulate':
                // Calming response for extreme emotions
                responsePrimary = 'calm';
                intensity = 0.8;
                break;
                
            case 'elevate':
                // Slightly more positive emotion
                if (userPrimary === 'neutral') {
                    responsePrimary = 'curiosity';
                    intensity = 0.6;
                } else if (userPrimary === 'sadness') {
                    responsePrimary = 'calm';
                    intensity = 0.7;
                } else if (userPrimary === 'anger') {
                    responsePrimary = 'calm';
                    intensity = 0.8;
                } else if (userPrimary === 'fear') {
                    responsePrimary = 'confidence';
                    intensity = 0.7;
                } else {
                    responsePrimary = userPrimary;
                    intensity = Math.min(1, userEmotions.intensity + 0.2);
                }
                break;
                
            case 'match':
                // Match appropriate emotion with similar intensity
                responsePrimary = userPrimary;
                intensity = userEmotions.intensity;
                break;
                
            default:
                // Default to neutral
                responsePrimary = 'neutral';
                intensity = 0.5;
        }
        
        return {
            primary: responsePrimary,
            intensity: intensity
        };
    }
    
    /**
     * Update MeAI emotional state
     * @param {Object} emotion New emotional state
     */
    updateMeAIEmotionalState(emotion) {
        // Update current state
        this.currentMeAIEmotion = {
            primary: emotion.primary,
            intensity: emotion.intensity,
            timestamp: new Date()
        };
        
        // Add to history
        this.meaiEmotionalHistory.push({ ...this.currentMeAIEmotion });
        
        // Trim history if needed
        if (this.meaiEmotionalHistory.length > this.historyLimit) {
            this.meaiEmotionalHistory.shift();
        }
    }
    
    /**
     * Get appropriate response patterns for the emotion
     * @param {Object} meaiEmotion MeAI emotion
     * @param {Object} userEmotions User emotions
     * @returns {string[]} Response patterns
     */
    getResponsePatterns(meaiEmotion, userEmotions) {
        const emotion = meaiEmotion.primary;
        const patterns = [];
        
        // Get standard response patterns for this emotion
        if (this.emotions[emotion] && this.emotions[emotion].responsePatterns) {
            patterns.push(...this.emotions[emotion].responsePatterns);
        }
        
        // Add empathy patterns if responding to user emotion
        if (userEmotions.primary === emotion || 
            (this.emotions[emotion] && this.emotions[emotion].opposites && 
             this.emotions[emotion].opposites.includes(userEmotions.primary))) {
            if (this.emotions[emotion] && this.emotions[emotion].empathyPatterns) {
                patterns.push(...this.emotions[emotion].empathyPatterns);
            }
        }
        
        // If no patterns available, use neutral
        if (patterns.length === 0 && this.emotions.neutral && this.emotions.neutral.responsePatterns) {
            patterns.push(...this.emotions.neutral.responsePatterns);
        }
        
        return patterns;
    }
    
    /**
     * Select a response pattern
     * @param {string[]} patterns Available response patterns
     * @param {Object} context Conversation context
     * @returns {string} Selected pattern
     */
    selectResponsePattern(patterns, context) {
        // If no patterns, return default
        if (!patterns || patterns.length === 0) {
            return "I understand.";
        }
        
        // Check if we've used this pattern recently
        const recentPatterns = this.meaiEmotionalHistory
            .filter(h => h.responsePattern)
            .map(h => h.responsePattern);
        
        // Filter out recently used patterns if possible
        const unusedPatterns = patterns.filter(p => !recentPatterns.includes(p));
        
        // If we have unused patterns, select from those
        if (unusedPatterns.length > 0) {
            return unusedPatterns[Math.floor(Math.random() * unusedPatterns.length)];
        }
        
        // Otherwise select from all patterns
        return patterns[Math.floor(Math.random() * patterns.length)];
    }
    
    /**
     * Detect if user is showing a repeated emotional pattern
     * @returns {boolean} Whether a pattern is detected
     */
    detectRepeatedEmotionalPattern() {
        if (this.userEmotionalHistory.length < 3) {
            return false;
        }
        
        // Check last three emotions
        const lastThree = this.userEmotionalHistory.slice(-3);
        
        // Check if all three are the same emotion and high intensity
        const sameEmotion = lastThree.every(e => e.primary === lastThree[0].primary);
        const highIntensity = lastThree.every(e => e.intensity > 0.7);
        
        return sameEmotion && highIntensity;
    }
    
    /**
     * Update visual elements based on emotion
     * @param {string} emotion Detected emotion
     */
    updateVisualElements(emotion) {
        // Update pixel animation if available
        if (this.pixelAnimation) {
            // Map emotion to pixel emotion
            let pixelEmotion = 'neutral';
            
            switch (emotion) {
                case 'joy':
                    pixelEmotion = 'joy';
                    break;
                case 'sadness':
                    pixelEmotion = 'reflective';
                    break;
                case 'anger':
                    pixelEmotion = 'excited'; // Use excited with red color
                    break;
                case 'fear':
                    pixelEmotion = 'curious'; // Use curious with intensity
                    break;
                case 'surprise':
                    pixelEmotion = 'excited';
                    break;
                case 'disgust':
                    pixelEmotion = 'reflective';
                    break;
                case 'calm':
                    pixelEmotion = 'calm';
                    break;
                case 'curiosity':
                    pixelEmotion = 'curious';
                    break;
                case 'gratitude':
                    pixelEmotion = 'empathetic';
                    break;
                case 'confidence':
                    pixelEmotion = 'joy';
                    break;
                default:
                    pixelEmotion = 'neutral';
            }
            
            // Set pixel emotion
            this.pixelAnimation.setEmotion(pixelEmotion);
        }
        
        // Update background if available
        if (this.backgroundSystem) {
            // Map emotion to background mood
            let backgroundMood = 'neutral';
            
            switch (emotion) {
                case 'joy':
                    backgroundMood = 'joy';
                    break;
                case 'sadness':
                    backgroundMood = 'reflective';
                    break;
                case 'anger':
                    backgroundMood = 'excited';
                    break;
                case 'fear':
                    backgroundMood = 'curious';
                    break;
                case 'surprise':
                    backgroundMood = 'excited';
                    break;
                case 'disgust':
                    backgroundMood = 'reflective';
                    break;
                case 'calm':
                    backgroundMood = 'calm';
                    break;
                case 'curiosity':
                    backgroundMood = 'curious';
                    break;
                case 'gratitude':
                    backgroundMood = 'empathetic';
                    break;
                case 'confidence':
                    backgroundMood = 'joy';
                    break;
                default:
                    backgroundMood = 'neutral';
            }
            
            // Set background mood
            this.backgroundSystem.setMood(backgroundMood);
        }
    }
    
    /**
     * Get emotional response to a specific topic
     * @param {string} topic Topic to respond to
     * @returns {Object} Emotional response
     */
    getTopicEmotionalResponse(topic) {
        // Map topics to appropriate emotions
        const topicEmotions = {
            personal: 'empathetic',
            work: 'confidence',
            health: 'calm',
            entertainment: 'joy',
            technology: 'curiosity',
            philosophy: 'reflective',
            emotions: 'empathetic',
            relationships: 'empathetic',
            education: 'curious',
            news: 'neutral',
            science: 'curious',
            arts: 'joy',
            travel: 'excited'
        };
        
        const emotion = topicEmotions[topic] || 'curious';
        
        return {
            emotion: emotion,
            intensity: 0.7
        };
    }
    
    /**
     * Get emotional state summary
     * @returns {Object} Emotional state summary
     */
    getEmotionalStateSummary() {
        // Calculate emotional trends
        const userTrend = this.calculateEmotionalTrend(this.userEmotionalHistory);
        const meaiTrend = this.calculateEmotionalTrend(this.meaiEmotionalHistory);
        
        return {
            currentUserEmotion: { ...this.currentUserEmotion },
            currentMeAIEmotion: { ...this.currentMeAIEmotion },
            userEmotionalTrend: userTrend,
            meaiEmotionalTrend: meaiTrend,
            emotionalSynchrony: this.calculateEmotionalSynchrony()
        };
    }
    
    /**
     * Calculate emotional trend from history
     * @param {Object[]} history Emotional history
     * @returns {Object} Trend information
     */
    calculateEmotionalTrend(history) {
        if (history.length < 2) {
            return {
                direction: 'stable',
                dominantEmotion: history.length > 0 ? history[0].primary : 'neutral'
            };
        }
        
        // Count emotions
        const emotionCounts = {};
        history.forEach(entry => {
            emotionCounts[entry.primary] = (emotionCounts[entry.primary] || 0) + 1;
        });
        
        // Find dominant emotion
        let dominantEmotion = 'neutral';
        let maxCount = 0;
        
        for (const [emotion, count] of Object.entries(emotionCounts)) {
            if (count > maxCount) {
                maxCount = count;
                dominantEmotion = emotion;
            }
        }
        
        // Calculate intensity trend
        const recentIntensities = history.slice(-3).map(e => e.intensity);
        let direction = 'stable';
        
        if (recentIntensities.length >= 2) {
            const diff = recentIntensities[recentIntensities.length - 1] - recentIntensities[0];
            
            if (diff > 0.2) {
                direction = 'increasing';
            } else if (diff < -0.2) {
                direction = 'decreasing';
            }
        }
        
        return {
            direction,
            dominantEmotion
        };
    }
    
    /**
     * Calculate emotional synchrony between user and MeAI
     * @returns {number} Synchrony score (0-1)
     */
    calculateEmotionalSynchrony() {
        if (this.userEmotionalHistory.length < 2 || this.meaiEmotionalHistory.length < 2) {
            return 0.5; // Default middle value
        }
        
        // Get recent emotions
        const recentUserEmotions = this.userEmotionalHistory.slice(-3);
        const recentMeaiEmotions = this.meaiEmotionalHistory.slice(-3);
        
        // Count matching emotions
        let matchCount = 0;
        
        for (let i = 0; i < Math.min(recentUserEmotions.length, recentMeaiEmotions.length); i++) {
            if (recentUserEmotions[i].primary === recentMeaiEmotions[i].primary) {
                matchCount++;
            }
        }
        
        // Calculate synchrony
        return matchCount / Math.min(recentUserEmotions.length, recentMeaiEmotions.length);
    }
}
