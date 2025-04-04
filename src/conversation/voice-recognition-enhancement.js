/**
 * Voice Recognition Enhancement System
 * 
 * This module provides advanced voice recognition capabilities for the MeAI system,
 * including noise cancellation, voice command processing, and natural language understanding.
 */

// Import required libraries
import { eventSystem } from '../utils/event-system.js';

class VoiceRecognitionEnhancement {
    constructor() {
        // Recognition state
        this.isListening = false;
        this.isProcessing = false;
        this.recognitionActive = false;
        this.continuousMode = true;
        
        // Recognition components
        this.recognition = null;
        this.audioContext = null;
        this.audioAnalyser = null;
        this.noiseReducer = null;
        
        // Recognition results
        this.interimResults = [];
        this.finalResults = [];
        this.confidenceThreshold = 0.7;
        
        // Command processing
        this.commandRegistry = new Map();
        this.commandHistory = [];
        this.commandConfidenceThreshold = 0.85;
        
        // Language settings
        this.currentLanguage = 'en-US';
        this.supportedLanguages = [
            { code: 'en-US', name: 'English (US)' },
            { code: 'en-GB', name: 'English (UK)' },
            { code: 'es-ES', name: 'Spanish' },
            { code: 'fr-FR', name: 'French' },
            { code: 'de-DE', name: 'German' },
            { code: 'it-IT', name: 'Italian' },
            { code: 'ja-JP', name: 'Japanese' },
            { code: 'ko-KR', name: 'Korean' },
            { code: 'zh-CN', name: 'Chinese (Simplified)' },
            { code: 'zh-TW', name: 'Chinese (Traditional)' },
            { code: 'ru-RU', name: 'Russian' },
            { code: 'pt-BR', name: 'Portuguese (Brazil)' }
        ];
        
        // Noise cancellation settings
        this.noiseCancellation = {
            enabled: true,
            level: 0.5, // 0.0 to 1.0
            adaptiveThreshold: true,
            noiseFloor: -50, // dB
            noiseProfile: null,
            calibrated: false
        };
        
        // Voice activity detection
        this.voiceActivityDetection = {
            enabled: true,
            threshold: 0.2, // 0.0 to 1.0
            minDuration: 0.3, // seconds
            holdTime: 1.5, // seconds
            active: false,
            lastActiveTime: 0
        };
        
        // Performance monitoring
        this.performance = {
            recognitionLatency: 0,
            processingTime: 0,
            commandLatency: 0,
            errorRate: 0,
            totalUtterances: 0,
            successfulUtterances: 0
        };
        
        // Initialize event listeners
        this.setupEventListeners();
    }
    
    /**
     * Initialize the voice recognition system
     */
    init() {
        // Check if browser supports speech recognition
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech recognition not supported in this browser');
            eventSystem.publish('voice-recognition-status', {
                available: false,
                error: 'Speech recognition not supported in this browser'
            });
            return false;
        }
        
        try {
            // Initialize Web Speech API
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            // Configure recognition
            this.recognition.continuous = this.continuousMode;
            this.recognition.interimResults = true;
            this.recognition.maxAlternatives = 3;
            this.recognition.lang = this.currentLanguage;
            
            // Set up recognition event handlers
            this.setupRecognitionEvents();
            
            // Initialize audio context for noise cancellation
            this.initAudioProcessing();
            
            // Register default commands
            this.registerDefaultCommands();
            
            console.log('Voice Recognition Enhancement System initialized');
            eventSystem.publish('voice-recognition-status', {
                available: true,
                initialized: true,
                language: this.currentLanguage
            });
            
            return true;
        } catch (error) {
            console.error('Error initializing voice recognition:', error);
            eventSystem.publish('voice-recognition-status', {
                available: false,
                error: error.message
            });
            
            return false;
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for language change events
        eventSystem.subscribe('language-changed', (data) => {
            this.setLanguage(data.language);
        });
        
        // Listen for noise cancellation settings changes
        eventSystem.subscribe('noise-cancellation-settings-changed', (data) => {
            this.updateNoiseCancellationSettings(data);
        });
        
        // Listen for voice activity detection settings changes
        eventSystem.subscribe('voice-activity-settings-changed', (data) => {
            this.updateVoiceActivitySettings(data);
        });
        
        // Listen for command registration
        eventSystem.subscribe('register-voice-command', (data) => {
            this.registerCommand(data.command, data.action, data.description, data.examples);
        });
        
        // Listen for calibration requests
        eventSystem.subscribe('calibrate-noise-cancellation', () => {
            this.calibrateNoiseCancellation();
        });
    }
    
    /**
     * Set up recognition event handlers
     */
    setupRecognitionEvents() {
        if (!this.recognition) return;
        
        // Result event
        this.recognition.onresult = (event) => {
            const startTime = performance.now();
            
            // Process results
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                const transcript = result[0].transcript.trim();
                const confidence = result[0].confidence;
                const isFinal = result.isFinal;
                
                if (isFinal) {
                    // Process final result
                    this.processFinalResult(transcript, confidence, event.results[i]);
                } else {
                    // Store interim result
                    this.processInterimResult(transcript, confidence);
                }
            }
            
            // Calculate processing time
            const endTime = performance.now();
            this.performance.processingTime = endTime - startTime;
        };
        
        // Start event
        this.recognition.onstart = () => {
            this.isListening = true;
            this.recognitionActive = true;
            console.log('Voice recognition started');
            
            eventSystem.publish('voice-recognition-state', {
                listening: true,
                active: true
            });
        };
        
        // End event
        this.recognition.onend = () => {
            this.isListening = false;
            this.recognitionActive = false;
            console.log('Voice recognition ended');
            
            eventSystem.publish('voice-recognition-state', {
                listening: false,
                active: false
            });
            
            // Restart if continuous mode is enabled
            if (this.continuousMode) {
                this.startListening();
            }
        };
        
        // Error event
        this.recognition.onerror = (event) => {
            console.error('Voice recognition error:', event.error);
            
            this.isListening = false;
            
            eventSystem.publish('voice-recognition-error', {
                error: event.error,
                message: this.getErrorMessage(event.error)
            });
            
            // Update error rate
            this.performance.errorRate = 
                (this.performance.totalUtterances > 0) ? 
                (1 - this.performance.successfulUtterances / this.performance.totalUtterances) : 
                0;
            
            // Restart after a short delay if continuous mode is enabled
            if (this.continuousMode) {
                setTimeout(() => {
                    this.startListening();
                }, 1000);
            }
        };
        
        // No match event
        this.recognition.onnomatch = () => {
            console.warn('Voice recognition: No match found');
            
            eventSystem.publish('voice-recognition-nomatch', {
                message: 'No match found for speech input'
            });
        };
        
        // Audio start event
        this.recognition.onaudiostart = () => {
            console.log('Voice recognition: Audio capturing started');
            
            eventSystem.publish('voice-recognition-audio', {
                capturing: true
            });
        };
        
        // Audio end event
        this.recognition.onaudioend = () => {
            console.log('Voice recognition: Audio capturing ended');
            
            eventSystem.publish('voice-recognition-audio', {
                capturing: false
            });
        };
        
        // Sound start event
        this.recognition.onsoundstart = () => {
            console.log('Voice recognition: Sound detected');
            
            eventSystem.publish('voice-recognition-sound', {
                detected: true
            });
        };
        
        // Sound end event
        this.recognition.onsoundend = () => {
            console.log('Voice recognition: Sound ended');
            
            eventSystem.publish('voice-recognition-sound', {
                detected: false
            });
        };
        
        // Speech start event
        this.recognition.onspeechstart = () => {
            console.log('Voice recognition: Speech detected');
            
            // Activate voice activity detection
            this.voiceActivityDetection.active = true;
            this.voiceActivityDetection.lastActiveTime = Date.now();
            
            eventSystem.publish('voice-recognition-speech', {
                detected: true
            });
        };
        
        // Speech end event
        this.recognition.onspeechend = () => {
            console.log('Voice recognition: Speech ended');
            
            // Deactivate voice activity detection after hold time
            setTimeout(() => {
                this.voiceActivityDetection.active = false;
            }, this.voiceActivityDetection.holdTime * 1000);
            
            eventSystem.publish('voice-recognition-speech', {
                detected: false
            });
        };
    }
    
    /**
     * Initialize audio processing for noise cancellation
     */
    initAudioProcessing() {
        // Check if Web Audio API is available
        if (!window.AudioContext && !window.webkitAudioContext) {
            console.warn('Web Audio API not supported, noise cancellation unavailable');
            return;
        }
        
        try {
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // Create analyzer
            this.audioAnalyser = this.audioContext.createAnalyser();
            this.audioAnalyser.fftSize = 2048;
            this.audioAnalyser.smoothingTimeConstant = 0.8;
            
            // Create noise reducer (script processor node)
            this.noiseReducer = this.audioContext.createScriptProcessor(4096, 1, 1);
            this.noiseReducer.onaudioprocess = this.processAudio.bind(this);
            
            console.log('Audio processing initialized for noise cancellation');
        } catch (error) {
            console.error('Error initializing audio processing:', error);
        }
    }
    
    /**
     * Process audio for noise cancellation
     * @param {AudioProcessingEvent} event - Audio processing event
     */
    processAudio(event) {
        // Skip if noise cancellation is disabled
        if (!this.noiseCancellation.enabled) return;
        
        // Get input and output buffers
        const inputBuffer = event.inputBuffer;
        const outputBuffer = event.outputBuffer;
        const inputData = inputBuffer.getChannelData(0);
        const outputData = outputBuffer.getChannelData(0);
        
        // Apply noise cancellation
        this.applyNoiseCancellation(inputData, outputData);
        
        // Detect voice activity
        if (this.voiceActivityDetection.enabled) {
            this.detectVoiceActivity(inputData);
        }
    }
    
    /**
     * Apply noise cancellation to audio data
     * @param {Float32Array} inputData - Input audio data
     * @param {Float32Array} outputData - Output audio data
     */
    applyNoiseCancellation(inputData, outputData) {
        // Get noise floor
        const noiseFloor = this.noiseCancellation.noiseFloor;
        
        // Get noise cancellation level
        const level = this.noiseCancellation.level;
        
        // Apply spectral subtraction if we have a noise profile
        if (this.noiseCancellation.noiseProfile) {
            // Convert to frequency domain
            const fft = new Float32Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
                fft[i] = inputData[i];
            }
            
            // Apply FFT
            // Note: In a real implementation, we would use a proper FFT library
            // This is a simplified placeholder
            
            // Subtract noise profile
            for (let i = 0; i < fft.length; i++) {
                fft[i] = Math.max(0, fft[i] - this.noiseCancellation.noiseProfile[i] * level);
            }
            
            // Convert back to time domain
            // Note: In a real implementation, we would use a proper IFFT
            // This is a simplified placeholder
            for (let i = 0; i < outputData.length; i++) {
                outputData[i] = fft[i];
            }
        } else {
            // Simple noise gate if no profile is available
            for (let i = 0; i < inputData.length; i++) {
                // Convert to dB
                const amplitude = Math.abs(inputData[i]);
                const db = 20 * Math.log10(amplitude);
                
                // Apply noise gate
                if (db < noiseFloor) {
                    outputData[i] = 0;
                } else {
                    // Apply soft knee
                    const knee = 6; // dB
                    if (db < noiseFloor + knee) {
                        const ratio = (db - noiseFloor) / knee;
                        outputData[i] = inputData[i] * ratio;
                    } else {
                        outputData[i] = inputData[i];
                    }
                }
            }
        }
    }
    
    /**
     * Detect voice activity in audio data
     * @param {Float32Array} audioData - Audio data
     * @returns {boolean} True if voice activity is detected
     */
    detectVoiceActivity(audioData) {
        // Calculate RMS (Root Mean Square) of audio data
        let sum = 0;
        for (let i = 0; i < audioData.length; i++) {
            sum += audioData[i] * audioData[i];
        }
        const rms = Math.sqrt(sum / audioData.length);
        
        // Convert to dB
        const db = 20 * Math.log10(rms);
        
        // Check if above threshold
        const threshold = this.voiceActivityDetection.threshold;
        const isActive = db > threshold;
        
        // Update voice activity state
        if (isActive) {
            this.voiceActivityDetection.active = true;
            this.voiceActivityDetection.lastActiveTime = Date.now();
            
            eventSystem.publish('voice-activity-detected', {
                active: true,
                level: db
            });
        } else {
            // Check if we've exceeded the hold time
            const timeSinceActive = (Date.now() - this.voiceActivityDetection.lastActiveTime) / 1000;
            if (timeSinceActive > this.voiceActivityDetection.holdTime) {
                this.voiceActivityDetection.active = false;
                
                eventSystem.publish('voice-activity-detected', {
                    active: false,
                    level: db
                });
            }
        }
        
        return isActive;
    }
    
    /**
     * Calibrate noise cancellation
     * @param {number} duration - Calibration duration in seconds
     * @returns {Promise} Promise that resolves when calibration is complete
     */
    calibrateNoiseCancellation(duration = 3) {
        return new Promise((resolve, reject) => {
            // Check if audio context is available
            if (!this.audioContext || !this.audioAnalyser) {
                reject(new Error('Audio context not available'));
                return;
            }
            
            // Notify calibration start
            eventSystem.publish('noise-calibration-status', {
                status: 'started',
                duration: duration
            });
            
            console.log(`Starting noise calibration for ${duration} seconds...`);
            
            // Create buffer for noise profile
            const bufferLength = this.audioAnalyser.frequencyBinCount;
            const noiseProfile = new Float32Array(bufferLength);
            
            // Initialize with zeros
            for (let i = 0; i < bufferLength; i++) {
                noiseProfile[i] = 0;
            }
            
            // Number of samples to collect
            const sampleCount = 10;
            let samplesCollected = 0;
            
            // Collect samples
            const collectSample = () => {
                // Get frequency data
                const frequencyData = new Float32Array(bufferLength);
                this.audioAnalyser.getFloatFrequencyData(frequencyData);
                
                // Add to noise profile
                for (let i = 0; i < bufferLength; i++) {
                    noiseProfile[i] += frequencyData[i];
                }
                
                samplesCollected++;
                
                // Update progress
                eventSystem.publish('noise-calibration-status', {
                    status: 'progress',
                    progress: samplesCollected / sampleCount,
                    duration: duration
                });
                
                // Check if we've collected enough samples
                if (samplesCollected >= sampleCount) {
                    // Average the samples
                    for (let i = 0; i < bufferLength; i++) {
                        noiseProfile[i] /= sampleCount;
                    }
                    
                    // Store noise profile
                    this.noiseCancellation.noiseProfile = noiseProfile;
                    this.noiseCancellation.calibrated = true;
                    
                    // Calculate noise floor
                    let sum = 0;
                    for (let i = 0; i < bufferLength; i++) {
                        sum += noiseProfile[i];
                    }
                    this.noiseCancellation.noiseFloor = sum / bufferLength;
                    
                    console.log('Noise calibration complete');
                    
                    // Notify calibration complete
                    eventSystem.publish('noise-calibration-status', {
                        status: 'completed',
                        noiseFloor: this.noiseCancellation.noiseFloor
                    });
                    
                    resolve(noiseProfile);
                } else {
                    // Collect another sample after a delay
                    setTimeout(collectSample, duration * 1000 / sampleCount);
                }
            };
            
            // Start collecting samples
            collectSample();
        });
    }
    
    /**
     * Start listening for voice input
     */
    startListening() {
        if (!this.recognition) {
            if (!this.init()) {
                return false;
            }
        }
        
        if (this.isListening) {
            return true;
        }
        
        try {
            this.recognition.start();
            this.isListening = true;
            
            console.log('Voice recognition started');
            eventSystem.publish('voice-recognition-state', {
                listening: true
            });
            
            return true;
        } catch (error) {
            console.error('Error starting voice recognition:', error);
            
            eventSystem.publish('voice-recognition-error', {
                error: 'start_error',
                message: error.message
            });
            
            return false;
        }
    }
    
    /**
     * Stop listening for voice input
     */
    stopListening() {
        if (!this.recognition || !this.isListening) {
            return true;
        }
        
        try {
            this.recognition.stop();
            this.isListening = false;
            
            console.log('Voice recognition stopped');
            eventSystem.publish('voice-recognition-state', {
                listening: false
            });
            
            return true;
        } catch (error) {
            console.error('Error stopping voice recognition:', error);
            
            eventSystem.publish('voice-recognition-error', {
                error: 'stop_error',
                message: error.message
            });
            
            return false;
        }
    }
    
    /**
     * Toggle listening state
     * @returns {boolean} New listening state
     */
    toggleListening() {
        if (this.isListening) {
            return !this.stopListening();
        } else {
            return this.startListening();
        }
    }
    
    /**
     * Process interim recognition result
     * @param {string} transcript - Recognized text
     * @param {number} confidence - Recognition confidence (0-1)
     */
    processInterimResult(transcript, confidence) {
        // Store interim result
        this.interimResults = [{
            transcript: transcript,
            confidence: confidence,
            timestamp: Date.now()
        }];
        
        // Publish interim result
        eventSystem.publish('voice-recognition-interim', {
            transcript: transcript,
            confidence: confidence
        });
    }
    
    /**
     * Process final recognition result
     * @param {string} transcript - Recognized text
     * @param {number} confidence - Recognition confidence (0-1)
     * @param {SpeechRecognitionResult} result - Full recognition result
     */
    processFinalResult(transcript, confidence, result) {
        // Clear interim results
        this.interimResults = [];
        
        // Store final result
        this.finalResults.push({
            transcript: transcript,
            confidence: confidence,
            timestamp: Date.now(),
            alternatives: Array.from(result).map(alt => ({
                transcript: alt.transcript.trim(),
                confidence: alt.confidence
            }))
        });
        
        // Limit history size
        if (this.finalResults.length > 10) {
            this.finalResults.shift();
        }
        
        // Update performance metrics
        this.performance.totalUtterances++;
        if (confidence >= this.confidenceThreshold) {
            this.performance.successfulUtterances++;
        }
        
        // Check for commands
        const isCommand = this.checkForCommands(transcript, confidence, result);
        
        // Publish final result
        eventSystem.publish('voice-recognition-final', {
            transcript: transcript,
            confidence: confidence,
            isCommand: isCommand,
            alternatives: Array.from(result).map(alt => ({
                transcript: alt.transcript.trim(),
                confidence: alt.confidence
            }))
        });
        
        // Process with natural language understanding if not a command
        if (!isCommand && confidence >= this.confidenceThreshold) {
            this.processWithNLU(transcript, confidence);
        }
    }
    
    /**
     * Check if the transcript contains any registered commands
     * @param {string} transcript - Recognized text
     * @param {number} confidence - Recognition confidence (0-1)
     * @param {SpeechRecognitionResult} result - Full recognition result
     * @returns {boolean} True if a command was found and executed
     */
    checkForCommands(transcript, confidence, result) {
        // Skip if confidence is too low
        if (confidence < this.commandConfidenceThreshold) {
            return false;
        }
        
        // Normalize transcript
        const normalizedTranscript = transcript.toLowerCase().trim();
        
        // Check each command
        for (const [commandName, commandData] of this.commandRegistry.entries()) {
            // Check if command matches
            if (this.matchCommand(normalizedTranscript, commandData)) {
                console.log(`Voice command detected: ${commandName}`);
                
                // Extract parameters
                const params = this.extractCommandParameters(normalizedTranscript, commandData);
                
                // Execute command
                try {
                    const startTime = performance.now();
                    
                    commandData.action(params);
                    
                    const endTime = performance.now();
                    this.performance.commandLatency = endTime - startTime;
                    
                    // Add to command history
                    this.commandHistory.push({
                        command: commandName,
                        transcript: transcript,
                        params: params,
                        timestamp: Date.now()
                    });
                    
                    // Limit history size
                    if (this.commandHistory.length > 20) {
                        this.commandHistory.shift();
                    }
                    
                    // Publish command event
                    eventSystem.publish('voice-command-executed', {
                        command: commandName,
                        transcript: transcript,
                        params: params
                    });
                    
                    return true;
                } catch (error) {
                    console.error(`Error executing voice command ${commandName}:`, error);
                    
                    eventSystem.publish('voice-command-error', {
                        command: commandName,
                        error: error.message
                    });
                }
            }
        }
        
        return false;
    }
    
    /**
     * Check if a transcript matches a command
     * @param {string} transcript - Normalized transcript
     * @param {Object} commandData - Command data
     * @returns {boolean} True if the transcript matches the command
     */
    matchCommand(transcript, commandData) {
        // Check exact phrases
        if (commandData.phrases) {
            for (const phrase of commandData.phrases) {
                if (transcript === phrase.toLowerCase()) {
                    return true;
                }
            }
        }
        
        // Check patterns
        if (commandData.patterns) {
            for (const pattern of commandData.patterns) {
                if (pattern.test(transcript)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * Extract parameters from a command transcript
     * @param {string} transcript - Normalized transcript
     * @param {Object} commandData - Command data
     * @returns {Object} Extracted parameters
     */
    extractCommandParameters(transcript, commandData) {
        const params = {};
        
        // Extract parameters using patterns
        if (commandData.patterns && commandData.parameterNames) {
            for (let i = 0; i < commandData.patterns.length; i++) {
                const pattern = commandData.patterns[i];
                const match = transcript.match(pattern);
                
                if (match && match.groups) {
                    // Extract named groups
                    for (const [name, value] of Object.entries(match.groups)) {
                        params[name] = value;
                    }
                    break;
                } else if (match && match.length > 1 && commandData.parameterNames[i]) {
                    // Extract by position
                    const paramNames = commandData.parameterNames[i];
                    for (let j = 0; j < paramNames.length && j + 1 < match.length; j++) {
                        params[paramNames[j]] = match[j + 1];
                    }
                    break;
                }
            }
        }
        
        return params;
    }
    
    /**
     * Process transcript with natural language understanding
     * @param {string} transcript - Recognized text
     * @param {number} confidence - Recognition confidence (0-1)
     */
    processWithNLU(transcript, confidence) {
        // Skip if confidence is too low
        if (confidence < this.confidenceThreshold) {
            return;
        }
        
        // Analyze sentiment
        const sentiment = this.analyzeSentiment(transcript);
        
        // Extract entities
        const entities = this.extractEntities(transcript);
        
        // Determine intent
        const intent = this.determineIntent(transcript);
        
        // Publish NLU results
        eventSystem.publish('voice-nlu-results', {
            transcript: transcript,
            confidence: confidence,
            sentiment: sentiment,
            entities: entities,
            intent: intent
        });
    }
    
    /**
     * Analyze sentiment of text
     * @param {string} text - Text to analyze
     * @returns {Object} Sentiment analysis result
     */
    analyzeSentiment(text) {
        // Simple sentiment analysis based on keyword matching
        // In a real implementation, this would use a more sophisticated approach
        
        const positiveWords = [
            'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
            'happy', 'glad', 'pleased', 'love', 'like', 'enjoy', 'thanks',
            'thank you', 'appreciate', 'awesome', 'brilliant', 'perfect'
        ];
        
        const negativeWords = [
            'bad', 'terrible', 'awful', 'horrible', 'poor', 'disappointing',
            'sad', 'unhappy', 'angry', 'upset', 'hate', 'dislike', 'sorry',
            'problem', 'issue', 'wrong', 'fail', 'failed', 'not working'
        ];
        
        // Normalize text
        const normalizedText = text.toLowerCase();
        const words = normalizedText.split(/\s+/);
        
        // Count positive and negative words
        let positiveCount = 0;
        let negativeCount = 0;
        
        for (const word of words) {
            if (positiveWords.includes(word)) {
                positiveCount++;
            } else if (negativeWords.includes(word)) {
                negativeCount++;
            }
        }
        
        // Calculate sentiment score (-1 to 1)
        const totalWords = words.length;
        const sentimentScore = totalWords > 0 ? 
            (positiveCount - negativeCount) / Math.sqrt(totalWords) : 0;
        
        // Determine sentiment label
        let sentiment;
        if (sentimentScore > 0.3) {
            sentiment = 'positive';
        } else if (sentimentScore < -0.3) {
            sentiment = 'negative';
        } else {
            sentiment = 'neutral';
        }
        
        return {
            score: sentimentScore,
            sentiment: sentiment,
            positive: positiveCount,
            negative: negativeCount
        };
    }
    
    /**
     * Extract entities from text
     * @param {string} text - Text to analyze
     * @returns {Array} Extracted entities
     */
    extractEntities(text) {
        // Simple entity extraction based on pattern matching
        // In a real implementation, this would use a more sophisticated approach
        
        const entities = [];
        
        // Extract dates
        const datePatterns = [
            // MM/DD/YYYY
            /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g,
            // Today, tomorrow, yesterday
            /\b(today|tomorrow|yesterday)\b/gi,
            // Day of week
            /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
            // Month and day
            /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(st|nd|rd|th)?\b/gi
        ];
        
        for (const pattern of datePatterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                entities.push({
                    type: 'date',
                    value: match[0],
                    index: match.index
                });
            }
        }
        
        // Extract times
        const timePatterns = [
            // HH:MM
            /(\d{1,2}):(\d{2})(\s*(am|pm))?/gi,
            // X o'clock
            /(\d{1,2})\s+o'clock(\s*(am|pm))?/gi,
            // X AM/PM
            /(\d{1,2})(\s*(am|pm))/gi
        ];
        
        for (const pattern of timePatterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                entities.push({
                    type: 'time',
                    value: match[0],
                    index: match.index
                });
            }
        }
        
        // Extract numbers
        const numberPattern = /\b(\d+(\.\d+)?)\b/g;
        let match;
        while ((match = numberPattern.exec(text)) !== null) {
            entities.push({
                type: 'number',
                value: parseFloat(match[1]),
                index: match.index
            });
        }
        
        return entities;
    }
    
    /**
     * Determine intent from text
     * @param {string} text - Text to analyze
     * @returns {Object} Intent analysis result
     */
    determineIntent(text) {
        // Simple intent detection based on keyword matching
        // In a real implementation, this would use a more sophisticated approach
        
        const intents = [
            {
                name: 'greeting',
                keywords: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'],
                threshold: 0.8
            },
            {
                name: 'farewell',
                keywords: ['goodbye', 'bye', 'see you', 'later', 'good night', 'farewell'],
                threshold: 0.8
            },
            {
                name: 'question',
                keywords: ['what', 'when', 'where', 'who', 'why', 'how', 'can you', 'could you', 'would you'],
                threshold: 0.6
            },
            {
                name: 'command',
                keywords: ['set', 'change', 'update', 'modify', 'create', 'delete', 'remove', 'add', 'show', 'display', 'open', 'close'],
                threshold: 0.7
            },
            {
                name: 'confirmation',
                keywords: ['yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'correct', 'right', 'confirm'],
                threshold: 0.8
            },
            {
                name: 'rejection',
                keywords: ['no', 'nope', 'not', 'don\'t', 'do not', 'negative', 'incorrect', 'wrong'],
                threshold: 0.7
            },
            {
                name: 'thanks',
                keywords: ['thanks', 'thank you', 'appreciate', 'grateful'],
                threshold: 0.8
            }
        ];
        
        // Normalize text
        const normalizedText = text.toLowerCase();
        
        // Check each intent
        const matches = [];
        
        for (const intent of intents) {
            let matchCount = 0;
            
            for (const keyword of intent.keywords) {
                if (normalizedText.includes(keyword)) {
                    matchCount++;
                }
            }
            
            const confidence = matchCount / intent.keywords.length;
            
            if (confidence >= intent.threshold) {
                matches.push({
                    intent: intent.name,
                    confidence: confidence
                });
            }
        }
        
        // Sort by confidence
        matches.sort((a, b) => b.confidence - a.confidence);
        
        // Return top intent or unknown
        if (matches.length > 0) {
            return {
                intent: matches[0].intent,
                confidence: matches[0].confidence,
                alternatives: matches.slice(1)
            };
        } else {
            return {
                intent: 'unknown',
                confidence: 0,
                alternatives: []
            };
        }
    }
    
    /**
     * Register a voice command
     * @param {string} command - Command name
     * @param {Function} action - Command action
     * @param {string} description - Command description
     * @param {Array} examples - Example phrases
     */
    registerCommand(command, action, description = '', examples = []) {
        // Create patterns from examples
        const patterns = [];
        const parameterNames = [];
        
        for (const example of examples) {
            // Convert example to regex pattern
            // Replace {param} with named capture groups
            const pattern = example.replace(/{(\w+)}/g, (match, name) => {
                return `(?<${name}>.+)`;
            });
            
            // Extract parameter names
            const params = [];
            let match;
            const paramRegex = /{(\w+)}/g;
            while ((match = paramRegex.exec(example)) !== null) {
                params.push(match[1]);
            }
            
            // Add to patterns and parameter names
            patterns.push(new RegExp(`^${pattern}$`, 'i'));
            parameterNames.push(params);
        }
        
        // Register command
        this.commandRegistry.set(command, {
            action: action,
            description: description,
            phrases: examples.map(e => e.replace(/{(\w+)}/g, 'something')),
            patterns: patterns,
            parameterNames: parameterNames,
            examples: examples
        });
        
        console.log(`Voice command registered: ${command}`);
        
        // Publish command registration
        eventSystem.publish('voice-command-registered', {
            command: command,
            description: description,
            examples: examples
        });
    }
    
    /**
     * Register default commands
     */
    registerDefaultCommands() {
        // Start listening command
        this.registerCommand(
            'startListening',
            () => this.startListening(),
            'Start voice recognition',
            ['start listening', 'listen to me', 'begin voice recognition']
        );
        
        // Stop listening command
        this.registerCommand(
            'stopListening',
            () => this.stopListening(),
            'Stop voice recognition',
            ['stop listening', 'stop voice recognition', 'end voice recognition']
        );
        
        // Set language command
        this.registerCommand(
            'setLanguage',
            (params) => {
                if (params.language) {
                    this.setLanguage(params.language);
                }
            },
            'Change recognition language',
            ['set language to {language}', 'change language to {language}', 'switch to {language}']
        );
        
        // Toggle noise cancellation command
        this.registerCommand(
            'toggleNoiseCancellation',
            () => {
                this.noiseCancellation.enabled = !this.noiseCancellation.enabled;
                eventSystem.publish('noise-cancellation-status', {
                    enabled: this.noiseCancellation.enabled
                });
            },
            'Toggle noise cancellation',
            ['toggle noise cancellation', 'turn noise cancellation on', 'turn noise cancellation off']
        );
        
        // Calibrate noise cancellation command
        this.registerCommand(
            'calibrateNoiseCancellation',
            () => this.calibrateNoiseCancellation(),
            'Calibrate noise cancellation',
            ['calibrate noise cancellation', 'calibrate noise', 'start noise calibration']
        );
    }
    
    /**
     * Set recognition language
     * @param {string} language - Language code (e.g., 'en-US')
     */
    setLanguage(language) {
        // Check if language is supported
        const isSupported = this.supportedLanguages.some(lang => 
            lang.code.toLowerCase() === language.toLowerCase() || 
            lang.name.toLowerCase() === language.toLowerCase()
        );
        
        if (!isSupported) {
            console.warn(`Language not supported: ${language}`);
            
            eventSystem.publish('voice-recognition-error', {
                error: 'language_not_supported',
                message: `Language not supported: ${language}`
            });
            
            return false;
        }
        
        // Find language code
        let languageCode = language;
        
        for (const lang of this.supportedLanguages) {
            if (lang.name.toLowerCase() === language.toLowerCase()) {
                languageCode = lang.code;
                break;
            }
        }
        
        // Update language
        this.currentLanguage = languageCode;
        
        // Update recognition if initialized
        if (this.recognition) {
            this.recognition.lang = languageCode;
            
            // Restart recognition if active
            if (this.isListening) {
                this.stopListening();
                this.startListening();
            }
        }
        
        console.log(`Voice recognition language set to ${languageCode}`);
        
        eventSystem.publish('voice-recognition-language', {
            language: languageCode
        });
        
        return true;
    }
    
    /**
     * Update noise cancellation settings
     * @param {Object} settings - Noise cancellation settings
     */
    updateNoiseCancellationSettings(settings) {
        // Update settings
        if (settings.enabled !== undefined) {
            this.noiseCancellation.enabled = settings.enabled;
        }
        
        if (settings.level !== undefined) {
            this.noiseCancellation.level = Math.max(0, Math.min(1, settings.level));
        }
        
        if (settings.adaptiveThreshold !== undefined) {
            this.noiseCancellation.adaptiveThreshold = settings.adaptiveThreshold;
        }
        
        if (settings.noiseFloor !== undefined) {
            this.noiseCancellation.noiseFloor = settings.noiseFloor;
        }
        
        console.log('Noise cancellation settings updated');
        
        eventSystem.publish('noise-cancellation-status', {
            enabled: this.noiseCancellation.enabled,
            level: this.noiseCancellation.level,
            adaptiveThreshold: this.noiseCancellation.adaptiveThreshold,
            noiseFloor: this.noiseCancellation.noiseFloor,
            calibrated: this.noiseCancellation.calibrated
        });
    }
    
    /**
     * Update voice activity detection settings
     * @param {Object} settings - Voice activity detection settings
     */
    updateVoiceActivitySettings(settings) {
        // Update settings
        if (settings.enabled !== undefined) {
            this.voiceActivityDetection.enabled = settings.enabled;
        }
        
        if (settings.threshold !== undefined) {
            this.voiceActivityDetection.threshold = settings.threshold;
        }
        
        if (settings.minDuration !== undefined) {
            this.voiceActivityDetection.minDuration = settings.minDuration;
        }
        
        if (settings.holdTime !== undefined) {
            this.voiceActivityDetection.holdTime = settings.holdTime;
        }
        
        console.log('Voice activity detection settings updated');
        
        eventSystem.publish('voice-activity-settings', {
            enabled: this.voiceActivityDetection.enabled,
            threshold: this.voiceActivityDetection.threshold,
            minDuration: this.voiceActivityDetection.minDuration,
            holdTime: this.voiceActivityDetection.holdTime
        });
    }
    
    /**
     * Get error message for recognition error
     * @param {string} error - Error code
     * @returns {string} Error message
     */
    getErrorMessage(error) {
        switch (error) {
            case 'no-speech':
                return 'No speech was detected.';
            case 'aborted':
                return 'Speech recognition was aborted.';
            case 'audio-capture':
                return 'Audio capture failed.';
            case 'network':
                return 'Network error occurred.';
            case 'not-allowed':
                return 'Microphone access not allowed.';
            case 'service-not-allowed':
                return 'Speech recognition service not allowed.';
            case 'bad-grammar':
                return 'Bad grammar configuration.';
            case 'language-not-supported':
                return 'Language not supported.';
            default:
                return `Unknown error: ${error}`;
        }
    }
    
    /**
     * Get recognition status
     * @returns {Object} Recognition status
     */
    getStatus() {
        return {
            initialized: !!this.recognition,
            listening: this.isListening,
            language: this.currentLanguage,
            noiseCancellation: {
                enabled: this.noiseCancellation.enabled,
                level: this.noiseCancellation.level,
                calibrated: this.noiseCancellation.calibrated
            },
            voiceActivity: {
                enabled: this.voiceActivityDetection.enabled,
                active: this.voiceActivityDetection.active
            },
            performance: this.performance,
            commandCount: this.commandRegistry.size,
            supportedLanguages: this.supportedLanguages
        };
    }
    
    /**
     * Get registered commands
     * @returns {Array} Registered commands
     */
    getCommands() {
        const commands = [];
        
        for (const [name, data] of this.commandRegistry.entries()) {
            commands.push({
                name: name,
                description: data.description,
                examples: data.examples
            });
        }
        
        return commands;
    }
    
    /**
     * Get command history
     * @returns {Array} Command history
     */
    getCommandHistory() {
        return this.commandHistory;
    }
    
    /**
     * Get recognition results
     * @returns {Object} Recognition results
     */
    getResults() {
        return {
            interim: this.interimResults,
            final: this.finalResults
        };
    }
}

// Export the class
export default new VoiceRecognitionEnhancement();
