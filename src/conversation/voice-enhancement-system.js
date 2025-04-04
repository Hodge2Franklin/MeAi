/**
 * Voice Enhancement System
 * 
 * This system enhances the voice synthesis capabilities with more natural
 * speech patterns, emotional inflections, and voice customization options.
 */

class VoiceEnhancementSystem {
    constructor() {
        // Initialize dependencies
        this.storageManager = window.storageManager;
        this.eventSystem = window.eventSystem;
        
        // Voice options
        this.voices = {
            default: {
                name: "Default",
                voiceURI: null, // Will be set dynamically
                gender: "female",
                pitch: 1.0,
                rate: 1.0,
                volume: 1.0
            },
            calm: {
                name: "Calm",
                voiceURI: null,
                gender: "female",
                pitch: 0.9,
                rate: 0.9,
                volume: 0.9
            },
            energetic: {
                name: "Energetic",
                voiceURI: null,
                gender: "female",
                pitch: 1.1,
                rate: 1.1,
                volume: 1.0
            },
            thoughtful: {
                name: "Thoughtful",
                voiceURI: null,
                gender: "female",
                pitch: 0.95,
                rate: 0.85,
                volume: 0.95
            },
            friendly: {
                name: "Friendly",
                voiceURI: null,
                gender: "female",
                pitch: 1.05,
                rate: 1.0,
                volume: 1.0
            }
        };
        
        // Emotional inflections
        this.emotionalInflections = {
            joy: {
                pitchModifier: 1.1,
                rateModifier: 1.05,
                volumeModifier: 1.1,
                pauseModifier: 0.9
            },
            reflective: {
                pitchModifier: 0.95,
                rateModifier: 0.9,
                volumeModifier: 0.9,
                pauseModifier: 1.2
            },
            curious: {
                pitchModifier: 1.05,
                rateModifier: 1.0,
                volumeModifier: 1.0,
                pauseModifier: 1.1
            },
            excited: {
                pitchModifier: 1.15,
                rateModifier: 1.1,
                volumeModifier: 1.15,
                pauseModifier: 0.85
            },
            empathetic: {
                pitchModifier: 0.9,
                rateModifier: 0.95,
                volumeModifier: 0.95,
                pauseModifier: 1.1
            },
            calm: {
                pitchModifier: 0.9,
                rateModifier: 0.9,
                volumeModifier: 0.9,
                pauseModifier: 1.1
            },
            neutral: {
                pitchModifier: 1.0,
                rateModifier: 1.0,
                volumeModifier: 1.0,
                pauseModifier: 1.0
            }
        };
        
        // Speech patterns
        this.speechPatterns = {
            natural: {
                sentencePauseMultiplier: 1.5,
                commaPauseMultiplier: 1.2,
                emphasisPitchMultiplier: 1.1,
                questionIntonationMultiplier: 1.15,
                wordEmphasisProbability: 0.15
            },
            formal: {
                sentencePauseMultiplier: 1.3,
                commaPauseMultiplier: 1.1,
                emphasisPitchMultiplier: 1.05,
                questionIntonationMultiplier: 1.1,
                wordEmphasisProbability: 0.1
            },
            casual: {
                sentencePauseMultiplier: 1.2,
                commaPauseMultiplier: 1.3,
                emphasisPitchMultiplier: 1.15,
                questionIntonationMultiplier: 1.2,
                wordEmphasisProbability: 0.2
            },
            expressive: {
                sentencePauseMultiplier: 1.4,
                commaPauseMultiplier: 1.25,
                emphasisPitchMultiplier: 1.2,
                questionIntonationMultiplier: 1.25,
                wordEmphasisProbability: 0.25
            }
        };
        
        // State
        this.state = {
            initialized: false,
            speaking: false,
            paused: false,
            currentVoice: "default",
            currentEmotion: "neutral",
            currentPattern: "natural",
            volume: 1.0,
            pitch: 1.0,
            rate: 1.0,
            availableVoices: [],
            utteranceQueue: [],
            currentUtterance: null,
            wordBoundaryCallbacks: [],
            sentenceBoundaryCallbacks: []
        };
        
        // Initialize
        this.initialize();
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    /**
     * Initialize the voice enhancement system
     */
    async initialize() {
        try {
            // Check if speech synthesis is available
            if (!window.speechSynthesis) {
                throw new Error("Speech synthesis not supported");
            }
            
            // Load available voices
            await this.loadVoices();
            
            // Load user preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'voice-preferences');
            if (preferences) {
                if (preferences.voice !== undefined) {
                    this.state.currentVoice = preferences.voice;
                }
                
                if (preferences.volume !== undefined) {
                    this.state.volume = preferences.volume;
                }
                
                if (preferences.pitch !== undefined) {
                    this.state.pitch = preferences.pitch;
                }
                
                if (preferences.rate !== undefined) {
                    this.state.rate = preferences.rate;
                }
                
                if (preferences.pattern !== undefined) {
                    this.state.currentPattern = preferences.pattern;
                }
            }
            
            console.log('Voice Enhancement System initialized');
            
            // Notify system that voice enhancement is ready
            this.eventSystem.publish('voice-enhancement-ready', {
                voices: Object.keys(this.voices),
                currentVoice: this.state.currentVoice,
                emotions: Object.keys(this.emotionalInflections),
                patterns: Object.keys(this.speechPatterns)
            });
            
            this.state.initialized = true;
        } catch (error) {
            console.error('Error initializing voice enhancement system:', error);
        }
    }
    
    /**
     * Load available voices
     */
    async loadVoices() {
        return new Promise((resolve) => {
            // Function to process voices
            const processVoices = () => {
                // Get all available voices
                const availableVoices = window.speechSynthesis.getVoices();
                
                if (availableVoices.length > 0) {
                    this.state.availableVoices = availableVoices;
                    
                    // Find and set preferred voices for each voice type
                    this.setPreferredVoices();
                    
                    console.log(`Loaded ${availableVoices.length} voices`);
                    resolve();
                } else {
                    // If no voices available yet, wait and try again
                    setTimeout(processVoices, 100);
                }
            };
            
            // Chrome loads voices asynchronously
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = processVoices;
            }
            
            // Try immediately in case voices are already loaded
            processVoices();
        });
    }
    
    /**
     * Set preferred voices for each voice type
     */
    setPreferredVoices() {
        // Priority list for female voices (most browsers have these or similar)
        const femalePriority = [
            "Google UK English Female",
            "Microsoft Zira",
            "Samantha",
            "Victoria",
            "Karen",
            "Moira",
            "Tessa"
        ];
        
        // Priority list for male voices
        const malePriority = [
            "Google UK English Male",
            "Microsoft David",
            "Daniel",
            "Alex",
            "Tom"
        ];
        
        // Find best female voice
        let bestFemaleVoice = this.findBestVoice(femalePriority, "female");
        
        // Find best male voice
        let bestMaleVoice = this.findBestVoice(malePriority, "male");
        
        // Set voices based on gender preference
        for (const [key, voice] of Object.entries(this.voices)) {
            if (voice.gender === "female") {
                voice.voiceURI = bestFemaleVoice ? bestFemaleVoice.voiceURI : null;
            } else {
                voice.voiceURI = bestMaleVoice ? bestMaleVoice.voiceURI : null;
            }
        }
    }
    
    /**
     * Find best voice from priority list
     * @param {Array} priorityList - List of voice names in order of preference
     * @param {string} gender - Preferred gender
     * @returns {SpeechSynthesisVoice|null} - Best matching voice or null
     */
    findBestVoice(priorityList, gender) {
        // Try to find a voice from the priority list
        for (const voiceName of priorityList) {
            const voice = this.state.availableVoices.find(v => 
                v.name === voiceName || v.name.includes(voiceName)
            );
            
            if (voice) return voice;
        }
        
        // If no priority voice found, try to find any voice with the right language
        const langVoice = this.state.availableVoices.find(v => 
            v.lang.startsWith('en-')
        );
        
        if (langVoice) return langVoice;
        
        // If still no voice, return the first available voice
        return this.state.availableVoices.length > 0 ? this.state.availableVoices[0] : null;
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for voice change
        this.eventSystem.subscribe('voice-change', (data) => {
            this.changeVoice(data.voice);
        });
        
        // Listen for volume change
        this.eventSystem.subscribe('voice-volume-change', (data) => {
            this.setVolume(data.volume);
        });
        
        // Listen for pitch change
        this.eventSystem.subscribe('voice-pitch-change', (data) => {
            this.setPitch(data.pitch);
        });
        
        // Listen for rate change
        this.eventSystem.subscribe('voice-rate-change', (data) => {
            this.setRate(data.rate);
        });
        
        // Listen for pattern change
        this.eventSystem.subscribe('voice-pattern-change', (data) => {
            this.setPattern(data.pattern);
        });
        
        // Listen for emotional state changes
        this.eventSystem.subscribe('meai-emotional-state-change', (data) => {
            this.setEmotion(data.emotion);
        });
        
        // Listen for speak requests
        this.eventSystem.subscribe('speak-text', (data) => {
            this.speak(data.text, data.options);
        });
        
        // Listen for stop speaking requests
        this.eventSystem.subscribe('stop-speaking', () => {
            this.stopSpeaking();
        });
        
        // Listen for pause speaking requests
        this.eventSystem.subscribe('pause-speaking', () => {
            this.pauseSpeaking();
        });
        
        // Listen for resume speaking requests
        this.eventSystem.subscribe('resume-speaking', () => {
            this.resumeSpeaking();
        });
        
        // Set up DOM event listeners
        document.addEventListener('DOMContentLoaded', () => {
            // Set up voice selector
            const voiceSelector = document.getElementById('voice-selector');
            if (voiceSelector) {
                // Add options for each voice
                for (const [key, voice] of Object.entries(this.voices)) {
                    const option = document.createElement('option');
                    option.value = key;
                    option.textContent = voice.name;
                    voiceSelector.appendChild(option);
                }
                
                voiceSelector.value = this.state.currentVoice;
                voiceSelector.addEventListener('change', (event) => {
                    this.changeVoice(event.target.value);
                });
            }
            
            // Set up volume slider
            const volumeSlider = document.getElementById('voice-volume');
            if (volumeSlider) {
                volumeSlider.value = this.state.volume;
                volumeSlider.addEventListener('input', (event) => {
                    this.setVolume(parseFloat(event.target.value));
                });
            }
            
            // Set up pitch slider
            const pitchSlider = document.getElementById('voice-pitch');
            if (pitchSlider) {
                pitchSlider.value = this.state.pitch;
                pitchSlider.addEventListener('input', (event) => {
                    this.setPitch(parseFloat(event.target.value));
                });
            }
            
            // Set up rate slider
            const rateSlider = document.getElementById('voice-rate');
            if (rateSlider) {
                rateSlider.value = this.state.rate;
                rateSlider.addEventListener('input', (event) => {
                    this.setRate(parseFloat(event.target.value));
                });
            }
            
            // Set up pattern selector
            const patternSelector = document.getElementById('voice-pattern');
            if (patternSelector) {
                // Add options for each pattern
                for (const [key, pattern] of Object.entries(this.speechPatterns)) {
                    const option = document.createElement('option');
                    option.value = key;
                    option.textContent = key.charAt(0).toUpperCase() + key.slice(1);
                    patternSelector.appendChild(option);
                }
                
                patternSelector.value = this.state.currentPattern;
                patternSelector.addEventListener('change', (event) => {
                    this.setPattern(event.target.value);
                });
            }
        });
        
        // Handle visibility change to manage speech
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Page is hidden, pause speaking
                if (this.state.speaking && !this.state.paused) {
                    this.pauseSpeaking();
                    this.state.pausedByVisibility = true;
                }
            } else {
                // Page is visible again, resume speaking if paused by visibility
                if (this.state.pausedByVisibility) {
                    this.resumeSpeaking();
                    this.state.pausedByVisibility = false;
                }
            }
        });
    }
    
    /**
     * Change voice
     * @param {string} voiceKey - Voice key
     */
    async changeVoice(voiceKey) {
        // Validate voice
        if (!this.voices[voiceKey]) {
            console.warn(`Invalid voice: ${voiceKey}`);
            return;
        }
        
        // Update state
        this.state.currentVoice = voiceKey;
        
        // Save preference
        try {
            // Get current preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'voice-preferences') || {
                id: 'voice-preferences'
            };
            
            // Update voice preference
            preferences.voice = voiceKey;
            
            // Save preferences
            await this.storageManager.setIndexedDB('preferences', preferences);
            
            // Publish event that voice changed
            this.eventSystem.publish('voice-changed', {
                voice: voiceKey,
                name: this.voices[voiceKey].name
            });
            
            console.log(`Voice changed to: ${this.voices[voiceKey].name}`);
        } catch (error) {
            console.error('Error saving voice preference:', error);
        }
    }
    
    /**
     * Set volume
     * @param {number} volume - Volume level (0-1)
     */
    async setVolume(volume) {
        // Validate and normalize volume
        volume = Math.max(0, Math.min(1, volume));
        
        // Update state
        this.state.volume = volume;
        
        // Save preference
        try {
            // Get current preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'voice-preferences') || {
                id: 'voice-preferences'
            };
            
            // Update volume preference
            preferences.volume = volume;
            
            // Save preferences
            await this.storageManager.setIndexedDB('preferences', preferences);
            
            // Publish event that volume changed
            this.eventSystem.publish('voice-volume-changed', {
                volume: volume
            });
            
            console.log(`Voice volume set to: ${volume.toFixed(2)}`);
        } catch (error) {
            console.error('Error saving volume preference:', error);
        }
    }
    
    /**
     * Set pitch
     * @param {number} pitch - Pitch level (0.5-2)
     */
    async setPitch(pitch) {
        // Validate and normalize pitch
        pitch = Math.max(0.5, Math.min(2, pitch));
        
        // Update state
        this.state.pitch = pitch;
        
        // Save preference
        try {
            // Get current preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'voice-preferences') || {
                id: 'voice-preferences'
            };
            
            // Update pitch preference
            preferences.pitch = pitch;
            
            // Save preferences
            await this.storageManager.setIndexedDB('preferences', preferences);
            
            // Publish event that pitch changed
            this.eventSystem.publish('voice-pitch-changed', {
                pitch: pitch
            });
            
            console.log(`Voice pitch set to: ${pitch.toFixed(2)}`);
        } catch (error) {
            console.error('Error saving pitch preference:', error);
        }
    }
    
    /**
     * Set rate
     * @param {number} rate - Speech rate (0.5-2)
     */
    async setRate(rate) {
        // Validate and normalize rate
        rate = Math.max(0.5, Math.min(2, rate));
        
        // Update state
        this.state.rate = rate;
        
        // Save preference
        try {
            // Get current preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'voice-preferences') || {
                id: 'voice-preferences'
            };
            
            // Update rate preference
            preferences.rate = rate;
            
            // Save preferences
            await this.storageManager.setIndexedDB('preferences', preferences);
            
            // Publish event that rate changed
            this.eventSystem.publish('voice-rate-changed', {
                rate: rate
            });
            
            console.log(`Voice rate set to: ${rate.toFixed(2)}`);
        } catch (error) {
            console.error('Error saving rate preference:', error);
        }
    }
    
    /**
     * Set speech pattern
     * @param {string} pattern - Speech pattern key
     */
    async setPattern(pattern) {
        // Validate pattern
        if (!this.speechPatterns[pattern]) {
            console.warn(`Invalid speech pattern: ${pattern}`);
            return;
        }
        
        // Update state
        this.state.currentPattern = pattern;
        
        // Save preference
        try {
            // Get current preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'voice-preferences') || {
                id: 'voice-preferences'
            };
            
            // Update pattern preference
            preferences.pattern = pattern;
            
            // Save preferences
            await this.storageManager.setIndexedDB('preferences', preferences);
            
            // Publish event that pattern changed
            this.eventSystem.publish('voice-pattern-changed', {
                pattern: pattern
            });
            
            console.log(`Voice pattern set to: ${pattern}`);
        } catch (error) {
            console.error('Error saving pattern preference:', error);
        }
    }
    
    /**
     * Set emotional state
     * @param {string} emotion - Emotional state
     */
    setEmotion(emotion) {
        // Validate emotion
        if (!this.emotionalInflections[emotion]) {
            console.warn(`Invalid emotion: ${emotion}`);
            return;
        }
        
        // Update state
        this.state.currentEmotion = emotion;
        
        console.log(`Voice emotion set to: ${emotion}`);
    }
    
    /**
     * Speak text with enhanced voice features
     * @param {string} text - Text to speak
     * @param {Object} options - Speech options
     */
    speak(text, options = {}) {
        // Skip if not initialized or no text
        if (!this.state.initialized || !text) return;
        
        // Process text for enhanced speech
        const processedText = this.processTextForSpeech(text);
        
        // Create utterance
        const utterance = new SpeechSynthesisUtterance(processedText);
        
        // Get voice configuration
        const voiceConfig = this.voices[this.state.currentVoice];
        
        // Get emotion configuration
        const emotionConfig = this.emotionalInflections[this.state.currentEmotion];
        
        // Find voice object
        if (voiceConfig.voiceURI) {
            const voice = this.state.availableVoices.find(v => v.voiceURI === voiceConfig.voiceURI);
            if (voice) {
                utterance.voice = voice;
            }
        }
        
        // Apply base voice settings
        utterance.volume = this.state.volume * (options.volume || 1);
        utterance.pitch = this.state.pitch * voiceConfig.pitch * (options.pitch || 1) * emotionConfig.pitchModifier;
        utterance.rate = this.state.rate * voiceConfig.rate * (options.rate || 1) * emotionConfig.rateModifier;
        
        // Set up event handlers
        utterance.onstart = () => {
            this.state.speaking = true;
            this.eventSystem.publish('speech-started', { text: processedText });
        };
        
        utterance.onend = () => {
            this.state.speaking = false;
            this.state.currentUtterance = null;
            this.eventSystem.publish('speech-ended');
            
            // Process next utterance in queue
            this.processUtteranceQueue();
        };
        
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.state.speaking = false;
            this.state.currentUtterance = null;
            this.eventSystem.publish('speech-error', { error: event.error });
            
            // Process next utterance in queue
            this.processUtteranceQueue();
        };
        
        // Set up boundary callbacks for word highlighting
        utterance.onboundary = (event) => {
            if (event.name === 'word') {
                // Call word boundary callbacks
                this.state.wordBoundaryCallbacks.forEach(callback => {
                    try {
                        callback(event);
                    } catch (error) {
                        console.error('Error in word boundary callback:', error);
                    }
                });
                
                this.eventSystem.publish('speech-word-boundary', {
                    charIndex: event.charIndex,
                    charLength: event.charLength
                });
            } else if (event.name === 'sentence') {
                // Call sentence boundary callbacks
                this.state.sentenceBoundaryCallbacks.forEach(callback => {
                    try {
                        callback(event);
                    } catch (error) {
                        console.error('Error in sentence boundary callback:', error);
                    }
                });
                
                this.eventSystem.publish('speech-sentence-boundary', {
                    charIndex: event.charIndex,
                    charLength: event.charLength
                });
            }
        };
        
        // If already speaking, add to queue
        if (this.state.speaking) {
            this.state.utteranceQueue.push(utterance);
            return;
        }
        
        // Start speaking
        this.state.currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
    }
    
    /**
     * Process utterance queue
     */
    processUtteranceQueue() {
        // Skip if already speaking or queue is empty
        if (this.state.speaking || this.state.utteranceQueue.length === 0) return;
        
        // Get next utterance
        const utterance = this.state.utteranceQueue.shift();
        
        // Start speaking
        this.state.currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
    }
    
    /**
     * Stop speaking
     */
    stopSpeaking() {
        // Cancel current speech
        window.speechSynthesis.cancel();
        
        // Clear queue
        this.state.utteranceQueue = [];
        
        // Update state
        this.state.speaking = false;
        this.state.paused = false;
        this.state.currentUtterance = null;
        
        // Publish event
        this.eventSystem.publish('speech-stopped');
    }
    
    /**
     * Pause speaking
     */
    pauseSpeaking() {
        // Skip if not speaking or already paused
        if (!this.state.speaking || this.state.paused) return;
        
        // Pause speech
        window.speechSynthesis.pause();
        
        // Update state
        this.state.paused = true;
        
        // Publish event
        this.eventSystem.publish('speech-paused');
    }
    
    /**
     * Resume speaking
     */
    resumeSpeaking() {
        // Skip if not paused
        if (!this.state.paused) return;
        
        // Resume speech
        window.speechSynthesis.resume();
        
        // Update state
        this.state.paused = false;
        
        // Publish event
        this.eventSystem.publish('speech-resumed');
    }
    
    /**
     * Process text for enhanced speech
     * @param {string} text - Text to process
     * @returns {string} - Processed text
     */
    processTextForSpeech(text) {
        // Get current pattern
        const pattern = this.speechPatterns[this.state.currentPattern];
        
        // Add SSML for enhanced speech if browser supports it
        // Note: Most browsers don't fully support SSML yet, but this is future-proofing
        try {
            // Check if browser might support SSML
            const testUtterance = new SpeechSynthesisUtterance('<speak>Test</speak>');
            if (testUtterance.text === 'Test') {
                // Browser strips SSML tags, so it probably doesn't support them
                return this.addSpeechEnhancements(text, pattern);
            } else {
                // Browser might support SSML
                return this.addSSMLEnhancements(text, pattern);
            }
        } catch (error) {
            // Fallback to regular enhancements
            return this.addSpeechEnhancements(text, pattern);
        }
    }
    
    /**
     * Add speech enhancements without SSML
     * @param {string} text - Text to enhance
     * @param {Object} pattern - Speech pattern
     * @returns {string} - Enhanced text
     */
    addSpeechEnhancements(text, pattern) {
        // For browsers that don't support SSML, we can't do much
        // Just return the original text
        return text;
    }
    
    /**
     * Add SSML enhancements
     * @param {string} text - Text to enhance
     * @param {Object} pattern - Speech pattern
     * @returns {string} - SSML enhanced text
     */
    addSSMLEnhancements(text, pattern) {
        // Start SSML document
        let ssml = '<speak>';
        
        // Split text into sentences
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        
        // Process each sentence
        sentences.forEach((sentence, index) => {
            // Add prosody for the whole sentence based on emotion
            const emotion = this.emotionalInflections[this.state.currentEmotion];
            
            ssml += `<prosody rate="${emotion.rateModifier}" pitch="${emotion.pitchModifier * 100 - 100}%" volume="${emotion.volumeModifier * 100 - 100}%">`;
            
            // Add emphasis to some words
            const words = sentence.split(/\s+/);
            words.forEach(word => {
                // Randomly emphasize some words
                if (word.length > 4 && Math.random() < pattern.wordEmphasisProbability) {
                    ssml += `<emphasis level="moderate">${word}</emphasis> `;
                } else {
                    ssml += `${word} `;
                }
            });
            
            // Close prosody tag
            ssml += '</prosody>';
            
            // Add pause between sentences
            if (index < sentences.length - 1) {
                ssml += `<break time="${pattern.sentencePauseMultiplier * 500}ms"/>`;
            }
        });
        
        // End SSML document
        ssml += '</speak>';
        
        return ssml;
    }
    
    /**
     * Register word boundary callback
     * @param {Function} callback - Callback function
     * @returns {number} - Callback ID
     */
    registerWordBoundaryCallback(callback) {
        this.state.wordBoundaryCallbacks.push(callback);
        return this.state.wordBoundaryCallbacks.length - 1;
    }
    
    /**
     * Unregister word boundary callback
     * @param {number} id - Callback ID
     */
    unregisterWordBoundaryCallback(id) {
        this.state.wordBoundaryCallbacks[id] = null;
    }
    
    /**
     * Register sentence boundary callback
     * @param {Function} callback - Callback function
     * @returns {number} - Callback ID
     */
    registerSentenceBoundaryCallback(callback) {
        this.state.sentenceBoundaryCallbacks.push(callback);
        return this.state.sentenceBoundaryCallbacks.length - 1;
    }
    
    /**
     * Unregister sentence boundary callback
     * @param {number} id - Callback ID
     */
    unregisterSentenceBoundaryCallback(id) {
        this.state.sentenceBoundaryCallbacks[id] = null;
    }
    
    /**
     * Get available voices
     * @returns {Array} - Array of voice objects with name
     */
    getAvailableVoices() {
        return Object.entries(this.voices).map(([key, voice]) => ({
            id: key,
            name: voice.name
        }));
    }
    
    /**
     * Get available emotions
     * @returns {Array} - Array of emotion names
     */
    getAvailableEmotions() {
        return Object.keys(this.emotionalInflections);
    }
    
    /**
     * Get available speech patterns
     * @returns {Array} - Array of pattern names
     */
    getAvailableSpeechPatterns() {
        return Object.keys(this.speechPatterns);
    }
    
    /**
     * Get current voice settings
     * @returns {Object} - Current voice settings
     */
    getCurrentVoiceSettings() {
        return {
            voice: this.state.currentVoice,
            voiceName: this.voices[this.state.currentVoice].name,
            emotion: this.state.currentEmotion,
            pattern: this.state.currentPattern,
            volume: this.state.volume,
            pitch: this.state.pitch,
            rate: this.state.rate
        };
    }
}

// Initialize the voice enhancement system when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.voiceEnhancementSystem = new VoiceEnhancementSystem();
});
