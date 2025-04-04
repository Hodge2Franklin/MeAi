/**
 * Sentiment Analysis System
 * 
 * This system enhances MeAI's ability to detect and respond to user emotions
 * with multi-dimensional emotion modeling and cultural context awareness.
 */

class SentimentAnalysisSystem {
    constructor(config = {}) {
        // Initialize dependencies
        this.eventSystem = window.eventSystem;
        this.storageManager = window.storageManager;
        
        // Configuration
        this.config = {
            sentimentAnalysisThreshold: 0.6,
            emotionTrackingWindow: 10, // Number of messages to track for trends
            culturalContextEnabled: true,
            multiDimensionalEmotions: true,
            ...config
        };
        
        // Sentiment lexicons
        this.lexicons = {
            positive: [],
            negative: [],
            emotions: {
                joy: [],
                sadness: [],
                anger: [],
                fear: [],
                surprise: [],
                disgust: [],
                trust: [],
                anticipation: []
            },
            intensifiers: [],
            negators: [],
            culturalContexts: {}
        };
        
        // Sentiment state
        this.state = {
            initialized: false,
            currentSentiment: {
                positive: 0.5,
                negative: 0.5,
                neutral: 0.0,
                compound: 0.0
            },
            currentEmotions: {
                joy: 0.0,
                sadness: 0.0,
                anger: 0.0,
                fear: 0.0,
                surprise: 0.0,
                disgust: 0.0,
                trust: 0.0,
                anticipation: 0.0
            },
            emotionHistory: [],
            detectedCulturalContext: null
        };
    }
    
    /**
     * Initialize the sentiment analysis system
     */
    async initialize() {
        try {
            console.log('Initializing Sentiment Analysis System...');
            
            // Load lexicons
            await this.loadLexicons();
            
            // Load previous state if available
            await this.loadState();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Mark as initialized
            this.state.initialized = true;
            
            console.log('Sentiment Analysis System initialized successfully');
            
            return true;
        } catch (error) {
            console.error('Error initializing Sentiment Analysis System:', error);
            return false;
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for sentiment analysis requests
        this.eventSystem.subscribe('sentiment-analysis-request', (data) => {
            this.analyzeSentiment(data.text).then(sentiment => {
                this.eventSystem.publish('sentiment-analysis-response', {
                    requestId: data.requestId,
                    sentiment: sentiment
                });
            });
        });
        
        // Listen for emotion tracking requests
        this.eventSystem.subscribe('emotion-tracking-request', (data) => {
            this.getEmotionTrends().then(trends => {
                this.eventSystem.publish('emotion-tracking-response', {
                    requestId: data.requestId,
                    trends: trends
                });
            });
        });
    }
    
    /**
     * Load sentiment lexicons
     */
    async loadLexicons() {
        try {
            // In a real implementation, these would be loaded from files or a database
            // For this implementation, we'll use simplified built-in lexicons
            
            // Positive words
            this.lexicons.positive = [
                'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
                'terrific', 'outstanding', 'superb', 'brilliant', 'awesome',
                'happy', 'glad', 'pleased', 'delighted', 'satisfied', 'content',
                'joyful', 'cheerful', 'thrilled', 'excited', 'ecstatic',
                'love', 'like', 'enjoy', 'appreciate', 'adore', 'admire',
                'beautiful', 'lovely', 'gorgeous', 'attractive', 'stunning',
                'perfect', 'ideal', 'flawless', 'impeccable', 'exceptional',
                'helpful', 'useful', 'beneficial', 'valuable', 'advantageous',
                'impressive', 'remarkable', 'extraordinary', 'incredible', 'marvelous',
                'pleasant', 'agreeable', 'nice', 'delightful', 'charming',
                'positive', 'optimistic', 'hopeful', 'encouraging', 'uplifting',
                'successful', 'accomplished', 'achieved', 'victorious', 'triumphant',
                'right', 'correct', 'accurate', 'precise', 'exact',
                'safe', 'secure', 'protected', 'sheltered', 'guarded',
                'healthy', 'fit', 'well', 'robust', 'vigorous',
                'smart', 'intelligent', 'clever', 'bright', 'brilliant',
                'wise', 'sage', 'insightful', 'perceptive', 'discerning',
                'kind', 'gentle', 'tender', 'compassionate', 'caring',
                'generous', 'giving', 'charitable', 'benevolent', 'altruistic',
                'honest', 'truthful', 'sincere', 'genuine', 'authentic',
                'loyal', 'faithful', 'devoted', 'dedicated', 'committed',
                'brave', 'courageous', 'valiant', 'heroic', 'fearless',
                'calm', 'peaceful', 'serene', 'tranquil', 'relaxed',
                'interesting', 'engaging', 'captivating', 'fascinating', 'intriguing',
                'fun', 'entertaining', 'amusing', 'enjoyable', 'pleasurable'
            ];
            
            // Negative words
            this.lexicons.negative = [
                'bad', 'terrible', 'horrible', 'awful', 'dreadful', 'abysmal',
                'poor', 'inferior', 'substandard', 'inadequate', 'deficient',
                'sad', 'unhappy', 'miserable', 'depressed', 'gloomy', 'downcast',
                'angry', 'mad', 'furious', 'enraged', 'irate', 'livid',
                'afraid', 'scared', 'frightened', 'terrified', 'fearful', 'anxious',
                'hate', 'dislike', 'detest', 'despise', 'loathe', 'abhor',
                'ugly', 'hideous', 'grotesque', 'repulsive', 'revolting',
                'broken', 'damaged', 'defective', 'faulty', 'flawed',
                'useless', 'worthless', 'pointless', 'futile', 'vain',
                'disappointing', 'discouraging', 'disheartening', 'frustrating', 'annoying',
                'unpleasant', 'disagreeable', 'offensive', 'objectionable', 'repugnant',
                'negative', 'pessimistic', 'cynical', 'skeptical', 'doubtful',
                'failed', 'unsuccessful', 'defeated', 'thwarted', 'foiled',
                'wrong', 'incorrect', 'inaccurate', 'mistaken', 'erroneous',
                'dangerous', 'hazardous', 'perilous', 'risky', 'treacherous',
                'sick', 'ill', 'unwell', 'diseased', 'infected',
                'stupid', 'dumb', 'idiotic', 'foolish', 'moronic',
                'ignorant', 'uninformed', 'unaware', 'oblivious', 'clueless',
                'cruel', 'mean', 'harsh', 'brutal', 'vicious',
                'selfish', 'greedy', 'stingy', 'miserly', 'self-centered',
                'dishonest', 'deceitful', 'deceptive', 'untruthful', 'fraudulent',
                'disloyal', 'unfaithful', 'treacherous', 'traitorous', 'backstabbing',
                'cowardly', 'fearful', 'timid', 'spineless', 'gutless',
                'agitated', 'restless', 'tense', 'nervous', 'stressed',
                'boring', 'dull', 'tedious', 'monotonous', 'uninteresting',
                'difficult', 'hard', 'challenging', 'complicated', 'complex'
            ];
            
            // Emotion-specific words
            this.lexicons.emotions.joy = [
                'happy', 'joyful', 'delighted', 'ecstatic', 'elated',
                'glad', 'cheerful', 'jubilant', 'thrilled', 'overjoyed',
                'pleased', 'content', 'satisfied', 'gratified', 'blissful',
                'merry', 'jolly', 'gleeful', 'jovial', 'chipper',
                'exuberant', 'euphoric', 'radiant', 'beaming', 'grinning',
                'laugh', 'smile', 'celebrate', 'rejoice', 'delight'
            ];
            
            this.lexicons.emotions.sadness = [
                'sad', 'unhappy', 'sorrowful', 'miserable', 'depressed',
                'gloomy', 'downcast', 'downhearted', 'melancholy', 'despondent',
                'dismal', 'heartbroken', 'forlorn', 'dejected', 'crestfallen',
                'disappointed', 'discouraged', 'disheartened', 'dispirited', 'demoralized',
                'blue', 'down', 'low', 'glum', 'woeful',
                'cry', 'weep', 'sob', 'mourn', 'grieve'
            ];
            
            this.lexicons.emotions.anger = [
                'angry', 'mad', 'furious', 'enraged', 'irate',
                'livid', 'incensed', 'indignant', 'outraged', 'infuriated',
                'irritated', 'annoyed', 'aggravated', 'agitated', 'exasperated',
                'vexed', 'irked', 'peeved', 'piqued', 'provoked',
                'resentful', 'bitter', 'hostile', 'antagonistic', 'belligerent',
                'rage', 'fury', 'wrath', 'ire', 'temper'
            ];
            
            this.lexicons.emotions.fear = [
                'afraid', 'scared', 'frightened', 'terrified', 'fearful',
                'anxious', 'worried', 'concerned', 'nervous', 'apprehensive',
                'uneasy', 'tense', 'on edge', 'jittery', 'jumpy',
                'panicky', 'alarmed', 'startled', 'spooked', 'petrified',
                'horrified', 'aghast', 'daunted', 'intimidated', 'threatened',
                'fear', 'dread', 'terror', 'horror', 'fright'
            ];
            
            this.lexicons.emotions.surprise = [
                'surprised', 'astonished', 'amazed', 'astounded', 'stunned',
                'shocked', 'startled', 'dumbfounded', 'flabbergasted', 'thunderstruck',
                'taken aback', 'bewildered', 'perplexed', 'confused', 'baffled',
                'unexpected', 'unanticipated', 'unforeseen', 'sudden', 'abrupt',
                'wonder', 'awe', 'disbelief', 'incredulity', 'amazement'
            ];
            
            this.lexicons.emotions.disgust = [
                'disgusted', 'revolted', 'repulsed', 'sickened', 'nauseated',
                'appalled', 'repelled', 'offended', 'outraged', 'scandalized',
                'grossed out', 'turned off', 'put off', 'repugnant', 'distasteful',
                'offensive', 'objectionable', 'obnoxious', 'odious', 'vile',
                'disgust', 'revulsion', 'repugnance', 'aversion', 'distaste'
            ];
            
            this.lexicons.emotions.trust = [
                'trusting', 'confident', 'assured', 'certain', 'convinced',
                'reliable', 'dependable', 'trustworthy', 'credible', 'believable',
                'faithful', 'loyal', 'devoted', 'dedicated', 'committed',
                'secure', 'safe', 'protected', 'sheltered', 'guarded',
                'trust', 'faith', 'belief', 'confidence', 'reliance'
            ];
            
            this.lexicons.emotions.anticipation = [
                'anticipating', 'expecting', 'awaiting', 'looking forward', 'hopeful',
                'eager', 'keen', 'avid', 'enthusiastic', 'excited',
                'ready', 'prepared', 'primed', 'poised', 'geared up',
                'expectant', 'anticipatory', 'forward-looking', 'optimistic', 'positive',
                'anticipation', 'expectation', 'prospect', 'outlook', 'hope'
            ];
            
            // Intensifiers
            this.lexicons.intensifiers = [
                'very', 'extremely', 'incredibly', 'remarkably', 'exceptionally',
                'exceedingly', 'immensely', 'tremendously', 'hugely', 'vastly',
                'highly', 'thoroughly', 'completely', 'entirely', 'totally',
                'utterly', 'absolutely', 'perfectly', 'fully', 'wholly',
                'deeply', 'profoundly', 'intensely', 'strongly', 'severely',
                'terribly', 'awfully', 'dreadfully', 'frightfully', 'horribly',
                'super', 'really', 'so', 'too', 'quite',
                'rather', 'somewhat', 'fairly', 'pretty', 'moderately'
            ];
            
            // Negators
            this.lexicons.negators = [
                'not', 'no', 'never', 'none', 'nobody',
                'nothing', 'nowhere', 'neither', 'nor', 'hardly',
                'scarcely', 'barely', 'rarely', 'seldom', 'few',
                'little', 'isn\'t', 'aren\'t', 'wasn\'t', 'weren\'t',
                'hasn\'t', 'haven\'t', 'hadn\'t', 'doesn\'t', 'don\'t',
                'didn\'t', 'won\'t', 'wouldn\'t', 'can\'t', 'cannot',
                'couldn\'t', 'shouldn\'t', 'mustn\'t', 'without', 'lack'
            ];
            
            // Cultural context modifiers
            this.lexicons.culturalContexts = {
                'western': {
                    positiveModifier: 1.0,
                    negativeModifier: 1.0,
                    emotionModifiers: {
                        joy: 1.0,
                        sadness: 1.0,
                        anger: 1.0,
                        fear: 1.0,
                        surprise: 1.0,
                        disgust: 1.0,
                        trust: 1.0,
                        anticipation: 1.0
                    }
                },
                'eastern': {
                    positiveModifier: 0.9,
                    negativeModifier: 0.9,
                    emotionModifiers: {
                        joy: 0.9,
                        sadness: 0.8,
                        anger: 0.7, // Less direct expression of anger in some Eastern cultures
                        fear: 0.8,
                        surprise: 1.0,
                        disgust: 0.8,
                        trust: 1.1, // Group harmony often valued
                        anticipation: 0.9
                    }
                },
                'high_context': {
                    positiveModifier: 0.8, // Understated expressions
                    negativeModifier: 0.7, // Indirect negative expressions
                    emotionModifiers: {
                        joy: 0.8,
                        sadness: 0.7,
                        anger: 0.6, // Often masked or indirect
                        fear: 0.7,
                        surprise: 0.9,
                        disgust: 0.7,
                        trust: 1.0,
                        anticipation: 0.9
                    }
                },
                'low_context': {
                    positiveModifier: 1.2, // More explicit expressions
                    negativeModifier: 1.1, // More direct negative expressions
                    emotionModifiers: {
                        joy: 1.2,
                        sadness: 1.1,
                        anger: 1.2, // More direct expression
                        fear: 1.1,
                        surprise: 1.1,
                        disgust: 1.2,
                        trust: 1.0,
                        anticipation: 1.1
                    }
                }
            };
            
            return true;
        } catch (error) {
            console.error('Error loading sentiment lexicons:', error);
            return false;
        }
    }
    
    /**
     * Load previous state from storage
     */
    async loadState() {
        try {
            const savedState = await this.storageManager.getIndexedDB('sentiment', 'current-state');
            if (savedState) {
                // Merge saved state with default state
                this.state = {
                    ...this.state,
                    ...savedState,
                    initialized: false // Will be set to true after full initialization
                };
            }
            
            return true;
        } catch (error) {
            console.error('Error loading sentiment state:', error);
            return false;
        }
    }
    
    /**
     * Save current state to storage
     */
    async saveState() {
        try {
            await this.storageManager.setIndexedDB('sentiment', {
                id: 'current-state',
                ...this.state,
                // Don't save the initialized flag
                initialized: undefined
            });
            
            return true;
        } catch (error) {
            console.error('Error saving sentiment state:', error);
            return false;
        }
    }
    
    /**
     * Analyze sentiment of a text
     * @param {string} text - The text to analyze
     * @returns {Object} - The sentiment analysis result
     */
    async analyzeSentiment(text) {
        try {
            // Normalize text
            const normalizedText = this.normalizeText(text);
            
            // Tokenize
            const tokens = this.tokenize(normalizedText);
            
            // Detect cultural context
            const culturalContext = this.detectCulturalContext(text);
            this.state.detectedCulturalContext = culturalContext;
            
            // Get cultural modifiers
            const culturalModifiers = this.lexicons.culturalContexts[culturalContext] || 
                                     this.lexicons.culturalContexts['western']; // Default to western
            
            // Basic sentiment analysis
            const basicSentiment = this.analyzeBasicSentiment(tokens, culturalModifiers);
            
            // Emotion analysis
            const emotions = this.analyzeEmotions(tokens, culturalModifiers);
            
            // Update current sentiment and emotions
            this.state.currentSentiment = basicSentiment;
            this.state.currentEmotions = emotions;
            
            // Add to emotion history
            this.state.emotionHistory.push({
                timestamp: Date.now(),
                sentiment: basicSentiment,
                emotions: emotions,
                text: text.substring(0, 100) // Store a snippet for context
            });
            
            // Limit history size
            if (this.state.emotionHistory.length > this.config.emotionTrackingWindow) {
                this.state.emotionHistory.shift();
            }
            
            // Save state
            await this.saveState();
            
            // Combine results
            const result = {
                text: text,
                sentiment: basicSentiment,
                emotions: emotions,
                culturalContext: culturalContext,
                emotionTrends: this.calculateEmotionTrends()
            };
            
            // Publish sentiment update event
            this.eventSystem.publish('sentiment-updated', {
                sentiment: basicSentiment,
                emotions: emotions
            });
            
            return result;
        } catch (error) {
            console.error('Error analyzing sentiment:', error);
            
            return {
                text: text,
                error: error.message,
                sentiment: this.state.currentSentiment,
                emotions: this.state.currentEmotions
            };
        }
    }
    
    /**
     * Normalize text for analysis
     * @param {string} text - The text to normalize
     * @returns {string} - The normalized text
     */
    normalizeText(text) {
        return text.toLowerCase()
            .replace(/[^\w\s.,!?']/g, ' ') // Keep some punctuation for sentence boundaries
            .replace(/\s+/g, ' ')
            .trim();
    }
    
    /**
     * Tokenize text into words and sentences
     * @param {string} text - The text to tokenize
     * @returns {Object} - Tokenized text
     */
    tokenize(text) {
        // Split into sentences
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        
        // Split each sentence into words
        const sentenceTokens = sentences.map(sentence => {
            return sentence.trim().split(/\s+/).filter(w => w.length > 0);
        });
        
        // All words
        const words = sentenceTokens.flat();
        
        return {
            sentences,
            sentenceTokens,
            words
        };
    }
    
    /**
     * Detect cultural context from text
     * @param {string} text - The text to analyze
     * @returns {string} - The detected cultural context
     */
    detectCulturalContext(text) {
        // This would ideally use more sophisticated analysis
        // For now, we'll use a simple approach based on language patterns
        
        const lowerText = text.toLowerCase();
        
        // Check for high-context communication patterns
        const highContextIndicators = [
            'perhaps', 'maybe', 'possibly', 'might', 'could be',
            'seems like', 'appears to', 'somewhat', 'rather',
            'if it\'s not too much trouble', 'if you don\'t mind',
            'sorry to bother', 'excuse me', 'if I may'
        ];
        
        // Check for low-context communication patterns
        const lowContextIndicators = [
            'definitely', 'absolutely', 'certainly', 'without a doubt',
            'clearly', 'obviously', 'directly', 'straight',
            'bottom line', 'get to the point', 'exactly',
            'specifically', 'precisely', 'explicitly'
        ];
        
        // Count indicators
        let highContextCount = 0;
        let lowContextCount = 0;
        
        highContextIndicators.forEach(indicator => {
            if (lowerText.includes(indicator)) {
                highContextCount++;
            }
        });
        
        lowContextIndicators.forEach(indicator => {
            if (lowerText.includes(indicator)) {
                lowContextCount++;
            }
        });
        
        // Determine context type
        if (highContextCount > lowContextCount) {
            return 'high_context';
        } else if (lowContextCount > highContextCount) {
            return 'low_context';
        } else {
            // Default to western if no clear indicators
            return 'western';
        }
    }
    
    /**
     * Analyze basic sentiment (positive/negative/neutral)
     * @param {Object} tokens - Tokenized text
     * @param {Object} culturalModifiers - Cultural context modifiers
     * @returns {Object} - Basic sentiment scores
     */
    analyzeBasicSentiment(tokens, culturalModifiers) {
        const words = tokens.words;
        
        let positiveScore = 0;
        let negativeScore = 0;
        
        // Analyze each word
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const prevWord = i > 0 ? words[i-1] : null;
            
            // Check if word is in positive lexicon
            if (this.lexicons.positive.includes(word)) {
                let score = 1.0;
                
                // Apply intensifiers
                if (prevWord && this.lexicons.intensifiers.includes(prevWord)) {
                    score *= 1.5;
                }
                
                // Apply negators
                if (prevWord && this.lexicons.negators.includes(prevWord)) {
                    // Negated positive becomes negative
                    negativeScore += score;
                } else {
                    positiveScore += score;
                }
            }
            
            // Check if word is in negative lexicon
            if (this.lexicons.negative.includes(word)) {
                let score = 1.0;
                
                // Apply intensifiers
                if (prevWord && this.lexicons.intensifiers.includes(prevWord)) {
                    score *= 1.5;
                }
                
                // Apply negators
                if (prevWord && this.lexicons.negators.includes(prevWord)) {
                    // Negated negative becomes positive
                    positiveScore += score * 0.8; // Slightly reduced effect
                } else {
                    negativeScore += score;
                }
            }
        }
        
        // Apply cultural modifiers
        positiveScore *= culturalModifiers.positiveModifier;
        negativeScore *= culturalModifiers.negativeModifier;
        
        // Normalize scores
        const total = positiveScore + negativeScore;
        let normalizedPositive = 0.5;
        let normalizedNegative = 0.5;
        
        if (total > 0) {
            normalizedPositive = positiveScore / total;
            normalizedNegative = negativeScore / total;
        }
        
        // Calculate compound score (-1 to 1)
        const compound = (normalizedPositive - normalizedNegative) * (1 - (1 / (total + 1)));
        
        // Calculate neutral score
        const neutral = Math.max(0, 1 - (normalizedPositive + normalizedNegative));
        
        return {
            positive: normalizedPositive,
            negative: normalizedNegative,
            neutral: neutral,
            compound: compound
        };
    }
    
    /**
     * Analyze emotions in text
     * @param {Object} tokens - Tokenized text
     * @param {Object} culturalModifiers - Cultural context modifiers
     * @returns {Object} - Emotion scores
     */
    analyzeEmotions(tokens, culturalModifiers) {
        const words = tokens.words;
        const emotions = {
            joy: 0.0,
            sadness: 0.0,
            anger: 0.0,
            fear: 0.0,
            surprise: 0.0,
            disgust: 0.0,
            trust: 0.0,
            anticipation: 0.0
        };
        
        // Count emotion words
        let totalEmotionWords = 0;
        
        // Analyze each word
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const prevWord = i > 0 ? words[i-1] : null;
            
            // Check each emotion category
            for (const [emotion, lexicon] of Object.entries(this.lexicons.emotions)) {
                if (lexicon.includes(word)) {
                    let score = 1.0;
                    
                    // Apply intensifiers
                    if (prevWord && this.lexicons.intensifiers.includes(prevWord)) {
                        score *= 1.5;
                    }
                    
                    // Apply negators
                    if (prevWord && this.lexicons.negators.includes(prevWord)) {
                        // Negated emotion has reduced effect
                        score *= 0.3;
                    }
                    
                    // Apply cultural modifiers
                    score *= culturalModifiers.emotionModifiers[emotion] || 1.0;
                    
                    emotions[emotion] += score;
                    totalEmotionWords++;
                }
            }
        }
        
        // Normalize emotion scores
        if (totalEmotionWords > 0) {
            for (const emotion in emotions) {
                emotions[emotion] = emotions[emotion] / totalEmotionWords;
            }
        }
        
        // If no emotions detected, use previous emotions with decay
        if (totalEmotionWords === 0 && this.state.emotionHistory.length > 0) {
            const previousEmotions = this.state.emotionHistory[this.state.emotionHistory.length - 1].emotions;
            const decayFactor = 0.8; // 20% decay
            
            for (const emotion in emotions) {
                emotions[emotion] = previousEmotions[emotion] * decayFactor;
            }
        }
        
        return emotions;
    }
    
    /**
     * Calculate emotion trends over time
     * @returns {Object} - Emotion trends
     */
    calculateEmotionTrends() {
        if (this.state.emotionHistory.length < 2) {
            return {
                sentiment: {
                    trend: 'stable',
                    change: 0
                },
                emotions: {
                    joy: { trend: 'stable', change: 0 },
                    sadness: { trend: 'stable', change: 0 },
                    anger: { trend: 'stable', change: 0 },
                    fear: { trend: 'stable', change: 0 },
                    surprise: { trend: 'stable', change: 0 },
                    disgust: { trend: 'stable', change: 0 },
                    trust: { trend: 'stable', change: 0 },
                    anticipation: { trend: 'stable', change: 0 }
                }
            };
        }
        
        // Get first and last entries
        const first = this.state.emotionHistory[0];
        const last = this.state.emotionHistory[this.state.emotionHistory.length - 1];
        
        // Calculate sentiment trend
        const sentimentChange = last.sentiment.compound - first.sentiment.compound;
        const sentimentTrend = this.getTrendLabel(sentimentChange);
        
        // Calculate emotion trends
        const emotionTrends = {};
        
        for (const emotion in first.emotions) {
            const change = last.emotions[emotion] - first.emotions[emotion];
            emotionTrends[emotion] = {
                trend: this.getTrendLabel(change),
                change: change
            };
        }
        
        return {
            sentiment: {
                trend: sentimentTrend,
                change: sentimentChange
            },
            emotions: emotionTrends
        };
    }
    
    /**
     * Get trend label based on change value
     * @param {number} change - The change value
     * @returns {string} - Trend label
     */
    getTrendLabel(change) {
        if (change > 0.2) {
            return 'strongly_increasing';
        } else if (change > 0.05) {
            return 'increasing';
        } else if (change < -0.2) {
            return 'strongly_decreasing';
        } else if (change < -0.05) {
            return 'decreasing';
        } else {
            return 'stable';
        }
    }
    
    /**
     * Get emotion trends over time
     * @returns {Object} - Emotion trends
     */
    async getEmotionTrends() {
        return this.calculateEmotionTrends();
    }
    
    /**
     * Get the current state of the sentiment analysis system
     * @returns {Object} - The current state
     */
    getState() {
        return {
            initialized: this.state.initialized,
            currentSentiment: this.state.currentSentiment,
            currentEmotions: this.state.currentEmotions,
            emotionHistoryLength: this.state.emotionHistory.length,
            detectedCulturalContext: this.state.detectedCulturalContext
        };
    }
}

// Export the class
window.SentimentAnalysisSystem = SentimentAnalysisSystem;
