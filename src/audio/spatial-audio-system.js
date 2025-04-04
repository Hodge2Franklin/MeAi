/**
 * Spatial Audio System
 * 
 * This module provides immersive spatial audio capabilities using the Web Audio API,
 * allowing for 3D positioning of sound sources, environmental effects, and
 * dynamic audio experiences based on user interaction and AI state.
 */

class SpatialAudioSystem {
    constructor() {
        // Dependencies
        this.eventSystem = window.eventSystem;
        
        // Audio Context
        this.audioContext = null;
        this.masterGain = null;
        this.listener = null;
        
        // Sound sources
        this.sources = new Map();
        
        // Environmental effects
        this.reverbNode = null;
        this.convolverBuffer = null;
        
        // Presets for different environments
        this.environmentPresets = {
            'small-room': {
                reverbTime: 0.3,
                dampening: 3000,
                dryWet: 0.2
            },
            'medium-room': {
                reverbTime: 0.6,
                dampening: 2000,
                dryWet: 0.3
            },
            'large-room': {
                reverbTime: 1.2,
                dampening: 1000,
                dryWet: 0.4
            },
            'hall': {
                reverbTime: 2.0,
                dampening: 500,
                dryWet: 0.5
            },
            'cathedral': {
                reverbTime: 4.0,
                dampening: 100,
                dryWet: 0.6
            },
            'outdoor': {
                reverbTime: 0.5,
                dampening: 5000,
                dryWet: 0.1
            },
            'none': {
                reverbTime: 0.01,
                dampening: 10000,
                dryWet: 0
            }
        };
        
        // Current environment
        this.currentEnvironment = 'medium-room';
        
        // Audio buffer cache
        this.bufferCache = new Map();
        
        // System state
        this.isInitialized = false;
        this.isMuted = false;
        this.masterVolume = 0.8;
        
        // Spatial configuration
        this.spatialConfig = {
            distanceModel: 'inverse',
            maxDistance: 10000,
            refDistance: 1,
            rolloffFactor: 1,
            coneInnerAngle: 360,
            coneOuterAngle: 360,
            coneOuterGain: 0
        };
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize the spatial audio system
     */
    async init() {
        try {
            // Create audio context
            this.createAudioContext();
            
            // Set up master gain
            this.setupMasterGain();
            
            // Set up listener
            this.setupListener();
            
            // Set up environmental effects
            await this.setupEnvironmentalEffects();
            
            // Set up event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            
            // Publish initialization success event
            this.eventSystem.publish('spatial-audio-initialized', {
                success: true
            });
            
            console.log('Spatial Audio System initialized successfully');
        } catch (error) {
            console.error('Error initializing Spatial Audio System:', error);
            
            // Publish initialization failure event
            this.eventSystem.publish('spatial-audio-initialized', {
                success: false,
                error: error.message
            });
        }
    }
    
    /**
     * Create the Web Audio API context
     */
    createAudioContext() {
        // Check if Web Audio API is supported
        if (!window.AudioContext && !window.webkitAudioContext) {
            throw new Error('Web Audio API is not supported in this browser');
        }
        
        // Create audio context
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
        
        // Resume audio context if it's suspended (autoplay policy)
        if (this.audioContext.state === 'suspended') {
            const resumeAudio = () => {
                this.audioContext.resume();
                
                // Remove event listeners once audio is resumed
                document.removeEventListener('click', resumeAudio);
                document.removeEventListener('touchstart', resumeAudio);
                document.removeEventListener('keydown', resumeAudio);
            };
            
            document.addEventListener('click', resumeAudio);
            document.addEventListener('touchstart', resumeAudio);
            document.addEventListener('keydown', resumeAudio);
        }
    }
    
    /**
     * Set up master gain node
     */
    setupMasterGain() {
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = this.masterVolume;
        this.masterGain.connect(this.audioContext.destination);
    }
    
    /**
     * Set up audio listener
     */
    setupListener() {
        this.listener = this.audioContext.listener;
        
        // Set initial listener position (center)
        if (this.listener.positionX) {
            // Modern API
            this.listener.positionX.value = 0;
            this.listener.positionY.value = 0;
            this.listener.positionZ.value = 0;
            
            // Forward orientation
            this.listener.forwardX.value = 0;
            this.listener.forwardY.value = 0;
            this.listener.forwardZ.value = -1;
            
            // Up orientation
            this.listener.upX.value = 0;
            this.listener.upY.value = 1;
            this.listener.upZ.value = 0;
        } else {
            // Legacy API
            this.listener.setPosition(0, 0, 0);
            this.listener.setOrientation(0, 0, -1, 0, 1, 0);
        }
    }
    
    /**
     * Set up environmental effects
     */
    async setupEnvironmentalEffects() {
        // Create reverb node
        this.reverbNode = this.audioContext.createConvolver();
        
        // Connect reverb to master gain
        this.reverbNode.connect(this.masterGain);
        
        // Generate initial reverb impulse response
        await this.setEnvironment(this.currentEnvironment);
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for volume change events
        this.eventSystem.subscribe('master-volume-change', (data) => {
            this.setMasterVolume(data.volume);
        });
        
        // Listen for mute events
        this.eventSystem.subscribe('audio-mute-change', (data) => {
            this.setMute(data.muted);
        });
        
        // Listen for environment change events
        this.eventSystem.subscribe('audio-environment-change', (data) => {
            this.setEnvironment(data.environment);
        });
        
        // Listen for listener position change events
        this.eventSystem.subscribe('listener-position-change', (data) => {
            this.setListenerPosition(data.x, data.y, data.z);
        });
        
        // Listen for listener orientation change events
        this.eventSystem.subscribe('listener-orientation-change', (data) => {
            this.setListenerOrientation(
                data.forwardX, data.forwardY, data.forwardZ,
                data.upX, data.upY, data.upZ
            );
        });
        
        // Listen for emotional state changes
        this.eventSystem.subscribe('emotional-state-change', (data) => {
            this.adjustAudioForEmotionalState(data.state, data.intensity || 1.0);
        });
    }
    
    /**
     * Load and cache an audio buffer
     * @param {string} url - URL of the audio file
     * @returns {Promise<AudioBuffer>} The loaded audio buffer
     */
    async loadAudioBuffer(url) {
        // Check cache first
        if (this.bufferCache.has(url)) {
            return this.bufferCache.get(url);
        }
        
        try {
            // Fetch the audio file
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load audio file: ${response.status} ${response.statusText}`);
            }
            
            // Get array buffer
            const arrayBuffer = await response.arrayBuffer();
            
            // Decode audio data
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            // Cache the buffer
            this.bufferCache.set(url, audioBuffer);
            
            return audioBuffer;
        } catch (error) {
            console.error(`Error loading audio file ${url}:`, error);
            throw error;
        }
    }
    
    /**
     * Create a spatial sound source
     * @param {string} id - Unique identifier for the sound source
     * @param {Object} options - Configuration options
     * @param {string} options.url - URL of the audio file
     * @param {number} options.x - X position
     * @param {number} options.y - Y position
     * @param {number} options.z - Z position
     * @param {boolean} options.loop - Whether to loop the sound
     * @param {number} options.volume - Volume of the sound (0-1)
     * @param {boolean} options.autoplay - Whether to play the sound immediately
     * @param {boolean} options.useReverb - Whether to apply reverb to the sound
     * @returns {Promise<Object>} The created sound source
     */
    async createSpatialSound(id, options) {
        if (!this.isInitialized) {
            throw new Error('Spatial Audio System is not initialized');
        }
        
        // Default options
        const defaultOptions = {
            x: 0,
            y: 0,
            z: 0,
            loop: false,
            volume: 1,
            autoplay: false,
            useReverb: true
        };
        
        // Merge options
        const config = { ...defaultOptions, ...options };
        
        try {
            // Load audio buffer
            const buffer = await this.loadAudioBuffer(config.url);
            
            // Create source node
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.loop = config.loop;
            
            // Create gain node
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = config.volume;
            
            // Create panner node
            const pannerNode = this.audioContext.createPanner();
            
            // Configure panner
            pannerNode.distanceModel = this.spatialConfig.distanceModel;
            pannerNode.maxDistance = this.spatialConfig.maxDistance;
            pannerNode.refDistance = this.spatialConfig.refDistance;
            pannerNode.rolloffFactor = this.spatialConfig.rolloffFactor;
            pannerNode.coneInnerAngle = this.spatialConfig.coneInnerAngle;
            pannerNode.coneOuterAngle = this.spatialConfig.coneOuterAngle;
            pannerNode.coneOuterGain = this.spatialConfig.coneOuterGain;
            
            // Set position
            if (pannerNode.positionX) {
                // Modern API
                pannerNode.positionX.value = config.x;
                pannerNode.positionY.value = config.y;
                pannerNode.positionZ.value = config.z;
            } else {
                // Legacy API
                pannerNode.setPosition(config.x, config.y, config.z);
            }
            
            // Create dry/wet nodes for reverb
            const dryGainNode = this.audioContext.createGain();
            const wetGainNode = this.audioContext.createGain();
            
            // Set dry/wet mix based on environment
            const preset = this.environmentPresets[this.currentEnvironment];
            dryGainNode.gain.value = 1 - (config.useReverb ? preset.dryWet : 0);
            wetGainNode.gain.value = config.useReverb ? preset.dryWet : 0;
            
            // Connect nodes
            source.connect(gainNode);
            gainNode.connect(pannerNode);
            
            // Split for dry/wet paths
            pannerNode.connect(dryGainNode);
            pannerNode.connect(wetGainNode);
            
            // Connect dry path to master
            dryGainNode.connect(this.masterGain);
            
            // Connect wet path to reverb
            wetGainNode.connect(this.reverbNode);
            
            // Create sound object
            const sound = {
                id,
                source,
                gainNode,
                pannerNode,
                dryGainNode,
                wetGainNode,
                buffer,
                config,
                startTime: null,
                isPlaying: false,
                duration: buffer.duration
            };
            
            // Store sound
            this.sources.set(id, sound);
            
            // Autoplay if specified
            if (config.autoplay) {
                this.playSound(id);
            }
            
            return sound;
        } catch (error) {
            console.error(`Error creating spatial sound ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Play a sound
     * @param {string} id - ID of the sound to play
     * @param {Object} options - Playback options
     * @param {number} options.offset - Start offset in seconds
     * @param {number} options.duration - Duration to play in seconds
     * @returns {boolean} Whether the sound was successfully played
     */
    playSound(id, options = {}) {
        if (!this.isInitialized) {
            return false;
        }
        
        const sound = this.sources.get(id);
        if (!sound) {
            console.error(`Sound ${id} not found`);
            return false;
        }
        
        // If already playing, stop first
        if (sound.isPlaying) {
            this.stopSound(id);
            
            // Recreate source node (can't reuse after stopping)
            sound.source = this.audioContext.createBufferSource();
            sound.source.buffer = sound.buffer;
            sound.source.loop = sound.config.loop;
            
            // Reconnect
            sound.source.connect(sound.gainNode);
        }
        
        // Set up ended callback
        sound.source.onended = () => {
            sound.isPlaying = false;
            
            // Publish sound ended event
            this.eventSystem.publish('sound-ended', {
                id,
                duration: sound.duration
            });
        };
        
        // Start playback
        const offset = options.offset || 0;
        const duration = options.duration || sound.duration - offset;
        
        try {
            if (options.duration) {
                sound.source.start(0, offset, duration);
            } else {
                sound.source.start(0, offset);
            }
            
            sound.startTime = this.audioContext.currentTime - offset;
            sound.isPlaying = true;
            
            // Publish sound started event
            this.eventSystem.publish('sound-started', {
                id,
                offset,
                duration
            });
            
            return true;
        } catch (error) {
            console.error(`Error playing sound ${id}:`, error);
            return false;
        }
    }
    
    /**
     * Stop a sound
     * @param {string} id - ID of the sound to stop
     * @returns {boolean} Whether the sound was successfully stopped
     */
    stopSound(id) {
        if (!this.isInitialized) {
            return false;
        }
        
        const sound = this.sources.get(id);
        if (!sound || !sound.isPlaying) {
            return false;
        }
        
        try {
            sound.source.stop();
            sound.isPlaying = false;
            
            // Publish sound stopped event
            this.eventSystem.publish('sound-stopped', {
                id
            });
            
            return true;
        } catch (error) {
            console.error(`Error stopping sound ${id}:`, error);
            return false;
        }
    }
    
    /**
     * Pause a sound (stop and remember position)
     * @param {string} id - ID of the sound to pause
     * @returns {boolean} Whether the sound was successfully paused
     */
    pauseSound(id) {
        if (!this.isInitialized) {
            return false;
        }
        
        const sound = this.sources.get(id);
        if (!sound || !sound.isPlaying) {
            return false;
        }
        
        try {
            // Calculate current position
            const currentTime = this.audioContext.currentTime;
            const elapsed = currentTime - sound.startTime;
            sound.pausePosition = elapsed % sound.duration;
            
            // Stop the sound
            sound.source.stop();
            sound.isPlaying = false;
            
            // Publish sound paused event
            this.eventSystem.publish('sound-paused', {
                id,
                position: sound.pausePosition
            });
            
            return true;
        } catch (error) {
            console.error(`Error pausing sound ${id}:`, error);
            return false;
        }
    }
    
    /**
     * Resume a paused sound
     * @param {string} id - ID of the sound to resume
     * @returns {boolean} Whether the sound was successfully resumed
     */
    resumeSound(id) {
        if (!this.isInitialized) {
            return false;
        }
        
        const sound = this.sources.get(id);
        if (!sound || sound.isPlaying || sound.pausePosition === undefined) {
            return false;
        }
        
        return this.playSound(id, { offset: sound.pausePosition });
    }
    
    /**
     * Set the volume of a sound
     * @param {string} id - ID of the sound
     * @param {number} volume - Volume level (0-1)
     * @param {number} fadeTime - Time to fade to new volume in seconds
     * @returns {boolean} Whether the volume was successfully set
     */
    setSoundVolume(id, volume, fadeTime = 0) {
        if (!this.isInitialized) {
            return false;
        }
        
        const sound = this.sources.get(id);
        if (!sound) {
            return false;
        }
        
        try {
            const gainNode = sound.gainNode;
            const currentTime = this.audioContext.currentTime;
            
            // Clamp volume
            volume = Math.max(0, Math.min(1, volume));
            
            if (fadeTime > 0) {
                // Fade to new volume
                gainNode.gain.cancelScheduledValues(currentTime);
                gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime);
                gainNode.gain.linearRampToValueAtTime(volume, currentTime + fadeTime);
            } else {
                // Set immediately
                gainNode.gain.setValueAtTime(volume, currentTime);
            }
            
            // Update config
            sound.config.volume = volume;
            
            return true;
        } catch (error) {
            console.error(`Error setting volume for sound ${id}:`, error);
            return false;
        }
    }
    
    /**
     * Set the position of a sound
     * @param {string} id - ID of the sound
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} z - Z position
     * @returns {boolean} Whether the position was successfully set
     */
    setSoundPosition(id, x, y, z) {
        if (!this.isInitialized) {
            return false;
        }
        
        const sound = this.sources.get(id);
        if (!sound) {
            return false;
        }
        
        try {
            const pannerNode = sound.pannerNode;
            
            if (pannerNode.positionX) {
                // Modern API
                pannerNode.positionX.value = x;
                pannerNode.positionY.value = y;
                pannerNode.positionZ.value = z;
            } else {
                // Legacy API
                pannerNode.setPosition(x, y, z);
            }
            
            // Update config
            sound.config.x = x;
            sound.config.y = y;
            sound.config.z = z;
            
            return true;
        } catch (error) {
            console.error(`Error setting position for sound ${id}:`, error);
            return false;
        }
    }
    
    /**
     * Set the orientation of a sound
     * @param {string} id - ID of the sound
     * @param {number} forwardX - Forward X direction
     * @param {number} forwardY - Forward Y direction
     * @param {number} forwardZ - Forward Z direction
     * @returns {boolean} Whether the orientation was successfully set
     */
    setSoundOrientation(id, forwardX, forwardY, forwardZ) {
        if (!this.isInitialized) {
            return false;
        }
        
        const sound = this.sources.get(id);
        if (!sound) {
            return false;
        }
        
        try {
            const pannerNode = sound.pannerNode;
            
            if (pannerNode.orientationX) {
                // Modern API
                pannerNode.orientationX.value = forwardX;
                pannerNode.orientationY.value = forwardY;
                pannerNode.orientationZ.value = forwardZ;
            } else {
                // Legacy API
                pannerNode.setOrientation(forwardX, forwardY, forwardZ);
            }
            
            return true;
        } catch (error) {
            console.error(`Error setting orientation for sound ${id}:`, error);
            return false;
        }
    }
    
    /**
     * Remove a sound
     * @param {string} id - ID of the sound to remove
     * @returns {boolean} Whether the sound was successfully removed
     */
    removeSound(id) {
        if (!this.isInitialized) {
            return false;
        }
        
        const sound = this.sources.get(id);
        if (!sound) {
            return false;
        }
        
        try {
            // Stop if playing
            if (sound.isPlaying) {
                sound.source.stop();
            }
            
            // Disconnect nodes
            sound.gainNode.disconnect();
            sound.pannerNode.disconnect();
            sound.dryGainNode.disconnect();
            sound.wetGainNode.disconnect();
            
            // Remove from sources
            this.sources.delete(id);
            
            return true;
        } catch (error) {
            console.error(`Error removing sound ${id}:`, error);
            return false;
        }
    }
    
    /**
     * Set master volume
     * @param {number} volume - Volume level (0-1)
     */
    setMasterVolume(volume) {
        if (!this.isInitialized) {
            return;
        }
        
        // Clamp volume
        volume = Math.max(0, Math.min(1, volume));
        
        try {
            const currentTime = this.audioContext.currentTime;
            this.masterGain.gain.setValueAtTime(volume, currentTime);
            this.masterVolume = volume;
            
            // Publish volume change event
            this.eventSystem.publish('master-volume-changed', {
                volume
            });
        } catch (error) {
            console.error('Error setting master volume:', error);
        }
    }
    
    /**
     * Set mute state
     * @param {boolean} muted - Whether audio should be muted
     */
    setMute(muted) {
        if (!this.isInitialized) {
            return;
        }
        
        try {
            const currentTime = this.audioContext.currentTime;
            
            if (muted && !this.isMuted) {
                // Mute
                this.masterGain.gain.setValueAtTime(0, currentTime);
                this.isMuted = true;
            } else if (!muted && this.isMuted) {
                // Unmute
                this.masterGain.gain.setValueAtTime(this.masterVolume, currentTime);
                this.isMuted = false;
            }
            
            // Publish mute change event
            this.eventSystem.publish('audio-mute-changed', {
                muted: this.isMuted
            });
        } catch (error) {
            console.error('Error setting mute state:', error);
        }
    }
    
    /**
     * Set listener position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} z - Z position
     */
    setListenerPosition(x, y, z) {
        if (!this.isInitialized) {
            return;
        }
        
        try {
            if (this.listener.positionX) {
                // Modern API
                this.listener.positionX.value = x;
                this.listener.positionY.value = y;
                this.listener.positionZ.value = z;
            } else {
                // Legacy API
                this.listener.setPosition(x, y, z);
            }
        } catch (error) {
            console.error('Error setting listener position:', error);
        }
    }
    
    /**
     * Set listener orientation
     * @param {number} forwardX - Forward X direction
     * @param {number} forwardY - Forward Y direction
     * @param {number} forwardZ - Forward Z direction
     * @param {number} upX - Up X direction
     * @param {number} upY - Up Y direction
     * @param {number} upZ - Up Z direction
     */
    setListenerOrientation(forwardX, forwardY, forwardZ, upX, upY, upZ) {
        if (!this.isInitialized) {
            return;
        }
        
        try {
            if (this.listener.forwardX) {
                // Modern API
                this.listener.forwardX.value = forwardX;
                this.listener.forwardY.value = forwardY;
                this.listener.forwardZ.value = forwardZ;
                this.listener.upX.value = upX;
                this.listener.upY.value = upY;
                this.listener.upZ.value = upZ;
            } else {
                // Legacy API
                this.listener.setOrientation(forwardX, forwardY, forwardZ, upX, upY, upZ);
            }
        } catch (error) {
            console.error('Error setting listener orientation:', error);
        }
    }
    
    /**
     * Set audio environment
     * @param {string} environment - Environment preset name
     * @returns {Promise<boolean>} Whether the environment was successfully set
     */
    async setEnvironment(environment) {
        if (!this.isInitialized) {
            return false;
        }
        
        // Check if preset exists
        if (!this.environmentPresets[environment]) {
            console.error(`Environment preset ${environment} not found`);
            return false;
        }
        
        try {
            // Get preset
            const preset = this.environmentPresets[environment];
            
            // Generate impulse response
            const impulseResponse = await this.generateImpulseResponse(
                preset.reverbTime,
                preset.dampening
            );
            
            // Set convolver buffer
            this.reverbNode.buffer = impulseResponse;
            
            // Update dry/wet mix for all sounds
            for (const [id, sound] of this.sources.entries()) {
                if (sound.config.useReverb) {
                    sound.dryGainNode.gain.value = 1 - preset.dryWet;
                    sound.wetGainNode.gain.value = preset.dryWet;
                }
            }
            
            // Update current environment
            this.currentEnvironment = environment;
            
            // Publish environment change event
            this.eventSystem.publish('audio-environment-changed', {
                environment,
                preset
            });
            
            return true;
        } catch (error) {
            console.error(`Error setting environment ${environment}:`, error);
            return false;
        }
    }
    
    /**
     * Generate impulse response for reverb
     * @param {number} duration - Duration in seconds
     * @param {number} decay - Decay frequency
     * @returns {Promise<AudioBuffer>} Generated impulse response
     */
    async generateImpulseResponse(duration, decay) {
        return new Promise((resolve) => {
            // Create buffer
            const sampleRate = this.audioContext.sampleRate;
            const length = sampleRate * duration;
            const impulse = this.audioContext.createBuffer(2, length, sampleRate);
            
            // Get channel data
            const leftChannel = impulse.getChannelData(0);
            const rightChannel = impulse.getChannelData(1);
            
            // Fill with noise and apply decay
            for (let i = 0; i < length; i++) {
                const n = (Math.random() * 2) - 1;
                const t = i / sampleRate;
                
                // Apply decay curve
                const envelope = Math.pow(1 - t / duration, decay);
                
                leftChannel[i] = n * envelope;
                rightChannel[i] = n * envelope;
            }
            
            resolve(impulse);
        });
    }
    
    /**
     * Create a dynamic ambient soundscape
     * @param {string} id - Unique identifier for the soundscape
     * @param {Object} options - Configuration options
     * @returns {Promise<Object>} The created soundscape
     */
    async createAmbientSoundscape(id, options = {}) {
        if (!this.isInitialized) {
            throw new Error('Spatial Audio System is not initialized');
        }
        
        // Default options
        const defaultOptions = {
            baseUrl: 'audio/ambient/',
            layers: [
                { file: 'ambient_base.mp3', volume: 0.5, loop: true },
                { file: 'ambient_texture.mp3', volume: 0.3, loop: true }
            ],
            accents: [
                { file: 'accent_1.mp3', minInterval: 5, maxInterval: 15, volume: 0.4 },
                { file: 'accent_2.mp3', minInterval: 8, maxInterval: 20, volume: 0.3 }
            ],
            spatialSpread: 120, // degrees
            distance: 5,
            autoplay: true,
            useReverb: true
        };
        
        // Merge options
        const config = { ...defaultOptions, ...options };
        
        try {
            // Create soundscape object
            const soundscape = {
                id,
                config,
                layers: [],
                accents: [],
                accentTimers: [],
                isPlaying: false
            };
            
            // Create layer sounds
            for (let i = 0; i < config.layers.length; i++) {
                const layer = config.layers[i];
                const layerId = `${id}_layer_${i}`;
                
                // Calculate position based on spatial spread
                const angle = (i / config.layers.length) * config.spatialSpread - (config.spatialSpread / 2);
                const radians = angle * (Math.PI / 180);
                const x = Math.sin(radians) * config.distance;
                const z = -Math.cos(radians) * config.distance;
                
                // Create spatial sound
                const sound = await this.createSpatialSound(layerId, {
                    url: config.baseUrl + layer.file,
                    x,
                    y: 0,
                    z,
                    loop: layer.loop !== false,
                    volume: layer.volume || 0.5,
                    autoplay: false,
                    useReverb: config.useReverb
                });
                
                soundscape.layers.push({
                    id: layerId,
                    sound,
                    config: layer
                });
            }
            
            // Create accent sounds
            for (let i = 0; i < config.accents.length; i++) {
                const accent = config.accents[i];
                const accentId = `${id}_accent_${i}`;
                
                // Create spatial sound
                const sound = await this.createSpatialSound(accentId, {
                    url: config.baseUrl + accent.file,
                    x: 0,
                    y: 0,
                    z: 0,
                    loop: false,
                    volume: accent.volume || 0.4,
                    autoplay: false,
                    useReverb: config.useReverb
                });
                
                soundscape.accents.push({
                    id: accentId,
                    sound,
                    config: accent,
                    lastPlayed: 0
                });
            }
            
            // Store soundscape
            this.soundscapes = this.soundscapes || new Map();
            this.soundscapes.set(id, soundscape);
            
            // Autoplay if specified
            if (config.autoplay) {
                this.playSoundscape(id);
            }
            
            return soundscape;
        } catch (error) {
            console.error(`Error creating ambient soundscape ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Play a soundscape
     * @param {string} id - ID of the soundscape to play
     * @returns {boolean} Whether the soundscape was successfully played
     */
    playSoundscape(id) {
        if (!this.isInitialized || !this.soundscapes) {
            return false;
        }
        
        const soundscape = this.soundscapes.get(id);
        if (!soundscape) {
            console.error(`Soundscape ${id} not found`);
            return false;
        }
        
        try {
            // Play all layer sounds
            for (const layer of soundscape.layers) {
                this.playSound(layer.id);
            }
            
            // Set up accent timers
            soundscape.accentTimers = soundscape.accents.map((accent, index) => {
                const playAccent = () => {
                    // Randomize position for each accent
                    const angle = Math.random() * 360;
                    const radians = angle * (Math.PI / 180);
                    const distance = soundscape.config.distance * (0.5 + Math.random() * 0.5);
                    const x = Math.sin(radians) * distance;
                    const z = -Math.cos(radians) * distance;
                    
                    // Set position
                    this.setSoundPosition(accent.id, x, 0, z);
                    
                    // Play sound
                    this.playSound(accent.id);
                    accent.lastPlayed = Date.now();
                    
                    // Schedule next play
                    const minInterval = accent.config.minInterval || 5;
                    const maxInterval = accent.config.maxInterval || 15;
                    const interval = (minInterval + Math.random() * (maxInterval - minInterval)) * 1000;
                    
                    return setTimeout(playAccent, interval);
                };
                
                // Initial delay
                const initialDelay = Math.random() * 5000;
                return setTimeout(playAccent, initialDelay);
            });
            
            soundscape.isPlaying = true;
            
            // Publish soundscape started event
            this.eventSystem.publish('soundscape-started', {
                id
            });
            
            return true;
        } catch (error) {
            console.error(`Error playing soundscape ${id}:`, error);
            return false;
        }
    }
    
    /**
     * Stop a soundscape
     * @param {string} id - ID of the soundscape to stop
     * @returns {boolean} Whether the soundscape was successfully stopped
     */
    stopSoundscape(id) {
        if (!this.isInitialized || !this.soundscapes) {
            return false;
        }
        
        const soundscape = this.soundscapes.get(id);
        if (!soundscape || !soundscape.isPlaying) {
            return false;
        }
        
        try {
            // Stop all layer sounds
            for (const layer of soundscape.layers) {
                this.stopSound(layer.id);
            }
            
            // Clear accent timers
            for (const timer of soundscape.accentTimers) {
                clearTimeout(timer);
            }
            soundscape.accentTimers = [];
            
            soundscape.isPlaying = false;
            
            // Publish soundscape stopped event
            this.eventSystem.publish('soundscape-stopped', {
                id
            });
            
            return true;
        } catch (error) {
            console.error(`Error stopping soundscape ${id}:`, error);
            return false;
        }
    }
    
    /**
     * Remove a soundscape
     * @param {string} id - ID of the soundscape to remove
     * @returns {boolean} Whether the soundscape was successfully removed
     */
    removeSoundscape(id) {
        if (!this.isInitialized || !this.soundscapes) {
            return false;
        }
        
        const soundscape = this.soundscapes.get(id);
        if (!soundscape) {
            return false;
        }
        
        try {
            // Stop if playing
            if (soundscape.isPlaying) {
                this.stopSoundscape(id);
            }
            
            // Remove all layer sounds
            for (const layer of soundscape.layers) {
                this.removeSound(layer.id);
            }
            
            // Remove all accent sounds
            for (const accent of soundscape.accents) {
                this.removeSound(accent.id);
            }
            
            // Remove from soundscapes
            this.soundscapes.delete(id);
            
            return true;
        } catch (error) {
            console.error(`Error removing soundscape ${id}:`, error);
            return false;
        }
    }
    
    /**
     * Create a spatial voice
     * @param {string} id - Unique identifier for the voice
     * @param {Object} options - Configuration options
     * @returns {Object} The created voice
     */
    createSpatialVoice(id, options = {}) {
        if (!this.isInitialized) {
            throw new Error('Spatial Audio System is not initialized');
        }
        
        // Default options
        const defaultOptions = {
            x: 0,
            y: 0,
            z: -1,
            volume: 1,
            useReverb: true
        };
        
        // Merge options
        const config = { ...defaultOptions, ...options };
        
        try {
            // Create gain node
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = config.volume;
            
            // Create panner node
            const pannerNode = this.audioContext.createPanner();
            
            // Configure panner
            pannerNode.distanceModel = this.spatialConfig.distanceModel;
            pannerNode.maxDistance = this.spatialConfig.maxDistance;
            pannerNode.refDistance = this.spatialConfig.refDistance;
            pannerNode.rolloffFactor = this.spatialConfig.rolloffFactor;
            pannerNode.coneInnerAngle = this.spatialConfig.coneInnerAngle;
            pannerNode.coneOuterAngle = this.spatialConfig.coneOuterAngle;
            pannerNode.coneOuterGain = this.spatialConfig.coneOuterGain;
            
            // Set position
            if (pannerNode.positionX) {
                // Modern API
                pannerNode.positionX.value = config.x;
                pannerNode.positionY.value = config.y;
                pannerNode.positionZ.value = config.z;
            } else {
                // Legacy API
                pannerNode.setPosition(config.x, config.y, config.z);
            }
            
            // Create dry/wet nodes for reverb
            const dryGainNode = this.audioContext.createGain();
            const wetGainNode = this.audioContext.createGain();
            
            // Set dry/wet mix based on environment
            const preset = this.environmentPresets[this.currentEnvironment];
            dryGainNode.gain.value = 1 - (config.useReverb ? preset.dryWet : 0);
            wetGainNode.gain.value = config.useReverb ? preset.dryWet : 0;
            
            // Connect nodes
            gainNode.connect(pannerNode);
            
            // Split for dry/wet paths
            pannerNode.connect(dryGainNode);
            pannerNode.connect(wetGainNode);
            
            // Connect dry path to master
            dryGainNode.connect(this.masterGain);
            
            // Connect wet path to reverb
            wetGainNode.connect(this.reverbNode);
            
            // Create voice object
            const voice = {
                id,
                gainNode,
                pannerNode,
                dryGainNode,
                wetGainNode,
                config,
                isActive: false
            };
            
            // Store voice
            this.voices = this.voices || new Map();
            this.voices.set(id, voice);
            
            return voice;
        } catch (error) {
            console.error(`Error creating spatial voice ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Connect an audio source to a spatial voice
     * @param {string} id - ID of the voice
     * @param {AudioNode} sourceNode - Audio source node to connect
     * @returns {boolean} Whether the source was successfully connected
     */
    connectToVoice(id, sourceNode) {
        if (!this.isInitialized || !this.voices) {
            return false;
        }
        
        const voice = this.voices.get(id);
        if (!voice) {
            console.error(`Voice ${id} not found`);
            return false;
        }
        
        try {
            // Connect source to voice gain node
            sourceNode.connect(voice.gainNode);
            voice.isActive = true;
            
            return true;
        } catch (error) {
            console.error(`Error connecting source to voice ${id}:`, error);
            return false;
        }
    }
    
    /**
     * Set the position of a voice
     * @param {string} id - ID of the voice
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} z - Z position
     * @returns {boolean} Whether the position was successfully set
     */
    setVoicePosition(id, x, y, z) {
        if (!this.isInitialized || !this.voices) {
            return false;
        }
        
        const voice = this.voices.get(id);
        if (!voice) {
            return false;
        }
        
        try {
            const pannerNode = voice.pannerNode;
            
            if (pannerNode.positionX) {
                // Modern API
                pannerNode.positionX.value = x;
                pannerNode.positionY.value = y;
                pannerNode.positionZ.value = z;
            } else {
                // Legacy API
                pannerNode.setPosition(x, y, z);
            }
            
            // Update config
            voice.config.x = x;
            voice.config.y = y;
            voice.config.z = z;
            
            return true;
        } catch (error) {
            console.error(`Error setting position for voice ${id}:`, error);
            return false;
        }
    }
    
    /**
     * Set the volume of a voice
     * @param {string} id - ID of the voice
     * @param {number} volume - Volume level (0-1)
     * @param {number} fadeTime - Time to fade to new volume in seconds
     * @returns {boolean} Whether the volume was successfully set
     */
    setVoiceVolume(id, volume, fadeTime = 0) {
        if (!this.isInitialized || !this.voices) {
            return false;
        }
        
        const voice = this.voices.get(id);
        if (!voice) {
            return false;
        }
        
        try {
            const gainNode = voice.gainNode;
            const currentTime = this.audioContext.currentTime;
            
            // Clamp volume
            volume = Math.max(0, Math.min(1, volume));
            
            if (fadeTime > 0) {
                // Fade to new volume
                gainNode.gain.cancelScheduledValues(currentTime);
                gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime);
                gainNode.gain.linearRampToValueAtTime(volume, currentTime + fadeTime);
            } else {
                // Set immediately
                gainNode.gain.setValueAtTime(volume, currentTime);
            }
            
            // Update config
            voice.config.volume = volume;
            
            return true;
        } catch (error) {
            console.error(`Error setting volume for voice ${id}:`, error);
            return false;
        }
    }
    
    /**
     * Remove a voice
     * @param {string} id - ID of the voice to remove
     * @returns {boolean} Whether the voice was successfully removed
     */
    removeVoice(id) {
        if (!this.isInitialized || !this.voices) {
            return false;
        }
        
        const voice = this.voices.get(id);
        if (!voice) {
            return false;
        }
        
        try {
            // Disconnect nodes
            voice.gainNode.disconnect();
            voice.pannerNode.disconnect();
            voice.dryGainNode.disconnect();
            voice.wetGainNode.disconnect();
            
            // Remove from voices
            this.voices.delete(id);
            
            return true;
        } catch (error) {
            console.error(`Error removing voice ${id}:`, error);
            return false;
        }
    }
    
    /**
     * Create a spatial audio analyzer
     * @param {string} id - Unique identifier for the analyzer
     * @param {Object} options - Configuration options
     * @returns {Object} The created analyzer
     */
    createAnalyzer(id, options = {}) {
        if (!this.isInitialized) {
            throw new Error('Spatial Audio System is not initialized');
        }
        
        // Default options
        const defaultOptions = {
            fftSize: 2048,
            smoothingTimeConstant: 0.8,
            minDecibels: -100,
            maxDecibels: -30
        };
        
        // Merge options
        const config = { ...defaultOptions, ...options };
        
        try {
            // Create analyzer node
            const analyzerNode = this.audioContext.createAnalyser();
            
            // Configure analyzer
            analyzerNode.fftSize = config.fftSize;
            analyzerNode.smoothingTimeConstant = config.smoothingTimeConstant;
            analyzerNode.minDecibels = config.minDecibels;
            analyzerNode.maxDecibels = config.maxDecibels;
            
            // Create data arrays
            const frequencyData = new Uint8Array(analyzerNode.frequencyBinCount);
            const timeData = new Uint8Array(analyzerNode.fftSize);
            
            // Create analyzer object
            const analyzer = {
                id,
                analyzerNode,
                frequencyData,
                timeData,
                config
            };
            
            // Store analyzer
            this.analyzers = this.analyzers || new Map();
            this.analyzers.set(id, analyzer);
            
            return analyzer;
        } catch (error) {
            console.error(`Error creating analyzer ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Connect an audio source to an analyzer
     * @param {string} id - ID of the analyzer
     * @param {AudioNode} sourceNode - Audio source node to connect
     * @returns {boolean} Whether the source was successfully connected
     */
    connectToAnalyzer(id, sourceNode) {
        if (!this.isInitialized || !this.analyzers) {
            return false;
        }
        
        const analyzer = this.analyzers.get(id);
        if (!analyzer) {
            console.error(`Analyzer ${id} not found`);
            return false;
        }
        
        try {
            // Connect source to analyzer node
            sourceNode.connect(analyzer.analyzerNode);
            
            return true;
        } catch (error) {
            console.error(`Error connecting source to analyzer ${id}:`, error);
            return false;
        }
    }
    
    /**
     * Get frequency data from an analyzer
     * @param {string} id - ID of the analyzer
     * @returns {Uint8Array|null} Frequency data or null if analyzer not found
     */
    getFrequencyData(id) {
        if (!this.isInitialized || !this.analyzers) {
            return null;
        }
        
        const analyzer = this.analyzers.get(id);
        if (!analyzer) {
            return null;
        }
        
        try {
            // Get frequency data
            analyzer.analyzerNode.getByteFrequencyData(analyzer.frequencyData);
            return analyzer.frequencyData;
        } catch (error) {
            console.error(`Error getting frequency data from analyzer ${id}:`, error);
            return null;
        }
    }
    
    /**
     * Get time domain data from an analyzer
     * @param {string} id - ID of the analyzer
     * @returns {Uint8Array|null} Time domain data or null if analyzer not found
     */
    getTimeData(id) {
        if (!this.isInitialized || !this.analyzers) {
            return null;
        }
        
        const analyzer = this.analyzers.get(id);
        if (!analyzer) {
            return null;
        }
        
        try {
            // Get time domain data
            analyzer.analyzerNode.getByteTimeDomainData(analyzer.timeData);
            return analyzer.timeData;
        } catch (error) {
            console.error(`Error getting time domain data from analyzer ${id}:`, error);
            return null;
        }
    }
    
    /**
     * Remove an analyzer
     * @param {string} id - ID of the analyzer to remove
     * @returns {boolean} Whether the analyzer was successfully removed
     */
    removeAnalyzer(id) {
        if (!this.isInitialized || !this.analyzers) {
            return false;
        }
        
        const analyzer = this.analyzers.get(id);
        if (!analyzer) {
            return false;
        }
        
        try {
            // Disconnect node
            analyzer.analyzerNode.disconnect();
            
            // Remove from analyzers
            this.analyzers.delete(id);
            
            return true;
        } catch (error) {
            console.error(`Error removing analyzer ${id}:`, error);
            return false;
        }
    }
    
    /**
     * Adjust audio parameters based on emotional state
     * @param {string} state - Emotional state
     * @param {number} intensity - Intensity of the emotion (0-1)
     */
    adjustAudioForEmotionalState(state, intensity = 1.0) {
        if (!this.isInitialized) {
            return;
        }
        
        try {
            // Define emotional state audio mappings
            const emotionalAudioMappings = {
                'joy': {
                    environment: 'medium-room',
                    reverbAdjustment: -0.1,
                    spatialSpread: 120
                },
                'reflective': {
                    environment: 'large-room',
                    reverbAdjustment: 0.1,
                    spatialSpread: 90
                },
                'curious': {
                    environment: 'medium-room',
                    reverbAdjustment: 0,
                    spatialSpread: 150
                },
                'excited': {
                    environment: 'small-room',
                    reverbAdjustment: -0.2,
                    spatialSpread: 180
                },
                'empathetic': {
                    environment: 'medium-room',
                    reverbAdjustment: 0.1,
                    spatialSpread: 60
                },
                'calm': {
                    environment: 'large-room',
                    reverbAdjustment: 0.2,
                    spatialSpread: 30
                },
                'neutral': {
                    environment: 'medium-room',
                    reverbAdjustment: 0,
                    spatialSpread: 90
                }
            };
            
            // Get mapping for the current state or use neutral
            const mapping = emotionalAudioMappings[state] || emotionalAudioMappings.neutral;
            
            // Apply environment
            this.setEnvironment(mapping.environment);
            
            // Adjust reverb based on intensity
            const preset = this.environmentPresets[mapping.environment];
            const reverbAdjustment = mapping.reverbAdjustment * intensity;
            
            // Apply to all sounds
            for (const [id, sound] of this.sources.entries()) {
                if (sound.config.useReverb) {
                    const dryWet = Math.max(0, Math.min(1, preset.dryWet + reverbAdjustment));
                    sound.dryGainNode.gain.value = 1 - dryWet;
                    sound.wetGainNode.gain.value = dryWet;
                }
            }
            
            // Apply to all voices
            if (this.voices) {
                for (const [id, voice] of this.voices.entries()) {
                    if (voice.config.useReverb) {
                        const dryWet = Math.max(0, Math.min(1, preset.dryWet + reverbAdjustment));
                        voice.dryGainNode.gain.value = 1 - dryWet;
                        voice.wetGainNode.gain.value = dryWet;
                    }
                }
            }
            
            // Apply to all soundscapes
            if (this.soundscapes) {
                for (const [id, soundscape] of this.soundscapes.entries()) {
                    if (soundscape.isPlaying) {
                        // Adjust spatial spread
                        const spatialSpread = mapping.spatialSpread;
                        
                        // Reposition layer sounds
                        for (let i = 0; i < soundscape.layers.length; i++) {
                            const layer = soundscape.layers[i];
                            
                            // Calculate new position based on spatial spread
                            const angle = (i / soundscape.layers.length) * spatialSpread - (spatialSpread / 2);
                            const radians = angle * (Math.PI / 180);
                            const x = Math.sin(radians) * soundscape.config.distance;
                            const z = -Math.cos(radians) * soundscape.config.distance;
                            
                            // Set position
                            this.setSoundPosition(layer.id, x, 0, z);
                        }
                    }
                }
            }
            
            // Publish emotional audio adjustment event
            this.eventSystem.publish('emotional-audio-adjusted', {
                state,
                intensity,
                mapping
            });
        } catch (error) {
            console.error(`Error adjusting audio for emotional state ${state}:`, error);
        }
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        if (!this.isInitialized) {
            return;
        }
        
        try {
            // Stop and remove all sounds
            for (const [id, sound] of this.sources.entries()) {
                if (sound.isPlaying) {
                    sound.source.stop();
                }
                sound.gainNode.disconnect();
                sound.pannerNode.disconnect();
                sound.dryGainNode.disconnect();
                sound.wetGainNode.disconnect();
            }
            this.sources.clear();
            
            // Stop and remove all soundscapes
            if (this.soundscapes) {
                for (const [id, soundscape] of this.soundscapes.entries()) {
                    if (soundscape.isPlaying) {
                        this.stopSoundscape(id);
                    }
                }
                this.soundscapes.clear();
            }
            
            // Remove all voices
            if (this.voices) {
                for (const [id, voice] of this.voices.entries()) {
                    voice.gainNode.disconnect();
                    voice.pannerNode.disconnect();
                    voice.dryGainNode.disconnect();
                    voice.wetGainNode.disconnect();
                }
                this.voices.clear();
            }
            
            // Remove all analyzers
            if (this.analyzers) {
                for (const [id, analyzer] of this.analyzers.entries()) {
                    analyzer.analyzerNode.disconnect();
                }
                this.analyzers.clear();
            }
            
            // Disconnect nodes
            this.reverbNode.disconnect();
            this.masterGain.disconnect();
            
            // Close audio context
            if (this.audioContext.state !== 'closed') {
                this.audioContext.close();
            }
            
            this.isInitialized = false;
            
            console.log('Spatial Audio System disposed');
        } catch (error) {
            console.error('Error disposing Spatial Audio System:', error);
        }
    }
}

// Create and export singleton instance
const spatialAudioSystem = new SpatialAudioSystem();
export default spatialAudioSystem;
