/**
 * Multi-layered Ambient Sound System
 * 
 * This system provides complex, dynamic ambient soundscapes with multiple
 * layers that change intermittently and respond to conversation context.
 */

class MultiLayeredAmbientSystem {
    constructor() {
        // Initialize dependencies
        this.storageManager = window.storageManager;
        this.eventSystem = window.eventSystem;
        
        // Audio context
        this.audioContext = null;
        
        // Master gain node
        this.masterGain = null;
        
        // Soundscape configuration
        this.soundscapes = {
            cosmic: {
                name: "Cosmic",
                description: "Deep space ambient sounds with subtle stellar events",
                baseLayer: {
                    url: "/audio/ambient/cosmic-base.mp3",
                    gain: 0.4,
                    loop: true
                },
                midLayers: [
                    {
                        url: "/audio/ambient/cosmic-mid-1.mp3",
                        gain: 0.25,
                        loop: true,
                        playbackRate: 1.0
                    },
                    {
                        url: "/audio/ambient/cosmic-mid-2.mp3",
                        gain: 0.2,
                        loop: true,
                        playbackRate: 0.95
                    }
                ],
                topLayers: [
                    {
                        url: "/audio/ambient/cosmic-event-1.mp3",
                        gain: 0.3,
                        loop: false,
                        minInterval: 20000,
                        maxInterval: 45000
                    },
                    {
                        url: "/audio/ambient/cosmic-event-2.mp3",
                        gain: 0.25,
                        loop: false,
                        minInterval: 30000,
                        maxInterval: 60000
                    },
                    {
                        url: "/audio/ambient/cosmic-event-3.mp3",
                        gain: 0.3,
                        loop: false,
                        minInterval: 40000,
                        maxInterval: 90000
                    }
                ],
                spatialEffects: {
                    enabled: true,
                    panningRange: 0.8
                }
            },
            nature: {
                name: "Nature",
                description: "Peaceful forest and water sounds with occasional wildlife",
                baseLayer: {
                    url: "/audio/ambient/nature-base.mp3",
                    gain: 0.35,
                    loop: true
                },
                midLayers: [
                    {
                        url: "/audio/ambient/nature-mid-1.mp3",
                        gain: 0.25,
                        loop: true,
                        playbackRate: 1.0
                    },
                    {
                        url: "/audio/ambient/nature-mid-2.mp3",
                        gain: 0.2,
                        loop: true,
                        playbackRate: 1.0
                    }
                ],
                topLayers: [
                    {
                        url: "/audio/ambient/nature-event-1.mp3",
                        gain: 0.4,
                        loop: false,
                        minInterval: 15000,
                        maxInterval: 40000
                    },
                    {
                        url: "/audio/ambient/nature-event-2.mp3",
                        gain: 0.35,
                        loop: false,
                        minInterval: 25000,
                        maxInterval: 50000
                    },
                    {
                        url: "/audio/ambient/nature-event-3.mp3",
                        gain: 0.3,
                        loop: false,
                        minInterval: 30000,
                        maxInterval: 70000
                    }
                ],
                spatialEffects: {
                    enabled: true,
                    panningRange: 0.6
                }
            },
            meditation: {
                name: "Meditation",
                description: "Gentle tones and resonant frequencies for focus and calm",
                baseLayer: {
                    url: "/audio/ambient/meditation-base.mp3",
                    gain: 0.3,
                    loop: true
                },
                midLayers: [
                    {
                        url: "/audio/ambient/meditation-mid-1.mp3",
                        gain: 0.25,
                        loop: true,
                        playbackRate: 1.0
                    },
                    {
                        url: "/audio/ambient/meditation-mid-2.mp3",
                        gain: 0.2,
                        loop: true,
                        playbackRate: 0.98
                    }
                ],
                topLayers: [
                    {
                        url: "/audio/ambient/meditation-event-1.mp3",
                        gain: 0.3,
                        loop: false,
                        minInterval: 30000,
                        maxInterval: 60000
                    },
                    {
                        url: "/audio/ambient/meditation-event-2.mp3",
                        gain: 0.25,
                        loop: false,
                        minInterval: 45000,
                        maxInterval: 90000
                    }
                ],
                spatialEffects: {
                    enabled: true,
                    panningRange: 0.4
                }
            },
            urban: {
                name: "Urban",
                description: "Subtle city ambience with distant sounds of life",
                baseLayer: {
                    url: "/audio/ambient/urban-base.mp3",
                    gain: 0.25,
                    loop: true
                },
                midLayers: [
                    {
                        url: "/audio/ambient/urban-mid-1.mp3",
                        gain: 0.2,
                        loop: true,
                        playbackRate: 1.0
                    },
                    {
                        url: "/audio/ambient/urban-mid-2.mp3",
                        gain: 0.15,
                        loop: true,
                        playbackRate: 1.0
                    }
                ],
                topLayers: [
                    {
                        url: "/audio/ambient/urban-event-1.mp3",
                        gain: 0.3,
                        loop: false,
                        minInterval: 10000,
                        maxInterval: 30000
                    },
                    {
                        url: "/audio/ambient/urban-event-2.mp3",
                        gain: 0.25,
                        loop: false,
                        minInterval: 20000,
                        maxInterval: 45000
                    },
                    {
                        url: "/audio/ambient/urban-event-3.mp3",
                        gain: 0.2,
                        loop: false,
                        minInterval: 25000,
                        maxInterval: 60000
                    }
                ],
                spatialEffects: {
                    enabled: true,
                    panningRange: 0.7
                }
            }
        };
        
        // Fallback oscillator configuration (used when audio files can't be loaded)
        this.oscillatorConfig = {
            cosmic: {
                base: { type: 'sine', frequency: 55, gain: 0.1 },
                mid1: { type: 'sine', frequency: 110, gain: 0.05 },
                mid2: { type: 'triangle', frequency: 220, gain: 0.03 },
                events: [
                    { type: 'sine', frequency: 440, gain: 0.08, duration: 2000 },
                    { type: 'sawtooth', frequency: 330, gain: 0.06, duration: 1500 }
                ]
            },
            nature: {
                base: { type: 'triangle', frequency: 65, gain: 0.08 },
                mid1: { type: 'sine', frequency: 130, gain: 0.04 },
                mid2: { type: 'sine', frequency: 195, gain: 0.03 },
                events: [
                    { type: 'sine', frequency: 520, gain: 0.07, duration: 1000 },
                    { type: 'triangle', frequency: 390, gain: 0.05, duration: 1200 }
                ]
            },
            meditation: {
                base: { type: 'sine', frequency: 60, gain: 0.09 },
                mid1: { type: 'sine', frequency: 120, gain: 0.05 },
                mid2: { type: 'sine', frequency: 180, gain: 0.03 },
                events: [
                    { type: 'sine', frequency: 432, gain: 0.06, duration: 3000 },
                    { type: 'sine', frequency: 528, gain: 0.05, duration: 2500 }
                ]
            },
            urban: {
                base: { type: 'triangle', frequency: 70, gain: 0.07 },
                mid1: { type: 'sawtooth', frequency: 140, gain: 0.03 },
                mid2: { type: 'triangle', frequency: 210, gain: 0.02 },
                events: [
                    { type: 'triangle', frequency: 280, gain: 0.05, duration: 800 },
                    { type: 'sawtooth', frequency: 350, gain: 0.04, duration: 1000 }
                ]
            }
        };
        
        // Audio state
        this.state = {
            initialized: false,
            currentSoundscape: null,
            previousSoundscape: null,
            volume: 0.5,
            muted: false,
            autoplay: true,
            useFallback: false,
            activeSources: [],
            activeOscillators: [],
            eventTimers: [],
            styleChangeTimer: null,
            crossfadeDuration: 3000, // ms
            styleChangeDuration: {
                min: 120000, // 2 minutes
                max: 300000  // 5 minutes
            }
        };
        
        // Audio buffer cache
        this.bufferCache = new Map();
        
        // Initialize
        this.initialize();
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    /**
     * Initialize the multi-layered ambient sound system
     */
    async initialize() {
        try {
            // Create audio context
            this.createAudioContext();
            
            // Load user preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'audio-preferences');
            if (preferences) {
                if (preferences.volume !== undefined) {
                    this.state.volume = preferences.volume;
                }
                
                if (preferences.muted !== undefined) {
                    this.state.muted = preferences.muted;
                }
                
                if (preferences.autoplay !== undefined) {
                    this.state.autoplay = preferences.autoplay;
                }
                
                if (preferences.soundscape !== undefined) {
                    this.state.currentSoundscape = preferences.soundscape;
                }
            }
            
            // Set default soundscape if none is set
            if (!this.state.currentSoundscape) {
                this.state.currentSoundscape = 'cosmic';
            }
            
            // Apply volume setting
            this.setVolume(this.state.volume);
            
            // Apply mute setting
            if (this.state.muted) {
                this.mute();
            }
            
            // Start ambient sound if autoplay is enabled
            if (this.state.autoplay) {
                this.startAmbientSound();
            }
            
            // Schedule intermittent style changes
            this.scheduleStyleChange();
            
            console.log('Multi-layered Ambient Sound System initialized');
            
            // Notify system that ambient sound is ready
            this.eventSystem.publish('ambient-sound-ready', {
                soundscapes: Object.keys(this.soundscapes),
                currentSoundscape: this.state.currentSoundscape,
                volume: this.state.volume,
                muted: this.state.muted
            });
            
            this.state.initialized = true;
        } catch (error) {
            console.error('Error initializing multi-layered ambient sound system:', error);
            
            // Fall back to oscillator-based ambient sound
            this.state.useFallback = true;
            this.startFallbackAmbientSound();
        }
    }
    
    /**
     * Create audio context
     */
    createAudioContext() {
        try {
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // Create master gain node
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.state.volume;
            this.masterGain.connect(this.audioContext.destination);
            
            return true;
        } catch (error) {
            console.error('Error creating audio context:', error);
            return false;
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for volume change
        this.eventSystem.subscribe('ambient-volume-change', (data) => {
            this.setVolume(data.volume);
        });
        
        // Listen for mute toggle
        this.eventSystem.subscribe('ambient-mute-toggle', (data) => {
            if (data.muted) {
                this.mute();
            } else {
                this.unmute();
            }
        });
        
        // Listen for soundscape change
        this.eventSystem.subscribe('ambient-soundscape-change', (data) => {
            this.changeSoundscape(data.soundscape);
        });
        
        // Listen for emotional state changes
        this.eventSystem.subscribe('meai-emotional-state-change', (data) => {
            this.adjustToEmotionalState(data.emotion, data.intensity);
        });
        
        // Listen for conversation topic changes
        this.eventSystem.subscribe('conversation-topic-change', (data) => {
            this.adjustToConversationTopic(data.topic);
        });
        
        // Listen for user interaction to resume audio context if suspended
        document.addEventListener('click', () => {
            this.resumeAudioContext();
        });
        
        document.addEventListener('keydown', () => {
            this.resumeAudioContext();
        });
        
        // Set up DOM event listeners
        document.addEventListener('DOMContentLoaded', () => {
            // Set up volume slider
            const volumeSlider = document.getElementById('ambient-volume');
            if (volumeSlider) {
                volumeSlider.value = this.state.volume;
                volumeSlider.addEventListener('input', (event) => {
                    this.setVolume(parseFloat(event.target.value));
                });
            }
            
            // Set up mute toggle
            const muteToggle = document.getElementById('ambient-mute');
            if (muteToggle) {
                muteToggle.checked = this.state.muted;
                muteToggle.addEventListener('change', (event) => {
                    if (event.target.checked) {
                        this.mute();
                    } else {
                        this.unmute();
                    }
                });
            }
            
            // Set up soundscape selector
            const soundscapeSelector = document.getElementById('ambient-soundscape');
            if (soundscapeSelector) {
                // Add options for each soundscape
                for (const [key, soundscape] of Object.entries(this.soundscapes)) {
                    const option = document.createElement('option');
                    option.value = key;
                    option.textContent = soundscape.name;
                    soundscapeSelector.appendChild(option);
                }
                
                soundscapeSelector.value = this.state.currentSoundscape;
                soundscapeSelector.addEventListener('change', (event) => {
                    this.changeSoundscape(event.target.value);
                });
            }
        });
        
        // Listen for visibility change to manage audio
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Page is hidden, reduce volume
                this.reduceVolumeWhenHidden();
            } else {
                // Page is visible again, restore volume
                this.restoreVolumeWhenVisible();
            }
        });
        
        // Listen for page unload to clean up resources
        window.addEventListener('beforeunload', () => {
            this.stopAmbientSound();
        });
    }
    
    /**
     * Resume audio context if suspended
     */
    async resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                console.log('Audio context resumed');
                
                // Restart ambient sound if it was playing
                if (this.state.autoplay && !this.state.activeSources.length && !this.state.activeOscillators.length) {
                    this.startAmbientSound();
                }
            } catch (error) {
                console.error('Error resuming audio context:', error);
            }
        }
    }
    
    /**
     * Start ambient sound
     */
    async startAmbientSound() {
        // Skip if already playing or audio context not available
        if (!this.audioContext || this.state.activeSources.length > 0) return;
        
        try {
            // Resume audio context if suspended
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            // Get current soundscape
            const soundscape = this.soundscapes[this.state.currentSoundscape];
            if (!soundscape) return;
            
            console.log(`Starting ${soundscape.name} ambient sound`);
            
            // Start base layer
            await this.startLayer(soundscape.baseLayer, 'base');
            
            // Start mid layers with slight delay
            for (let i = 0; i < soundscape.midLayers.length; i++) {
                const delay = 500 + (i * 300);
                setTimeout(async () => {
                    await this.startLayer(soundscape.midLayers[i], 'mid');
                }, delay);
            }
            
            // Schedule top layer events
            this.scheduleTopLayerEvents(soundscape.topLayers);
            
            // Publish event that ambient sound started
            this.eventSystem.publish('ambient-sound-started', {
                soundscape: this.state.currentSoundscape
            });
        } catch (error) {
            console.error('Error starting ambient sound:', error);
            
            // Fall back to oscillator-based ambient sound
            this.state.useFallback = true;
            this.startFallbackAmbientSound();
        }
    }
    
    /**
     * Start a single audio layer
     * @param {Object} layer - Layer configuration
     * @param {string} type - Layer type (base, mid, top)
     */
    async startLayer(layer, type) {
        try {
            // Load audio buffer
            const buffer = await this.loadAudioBuffer(layer.url);
            
            // Create audio source
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            
            // Set playback rate if specified
            if (layer.playbackRate) {
                source.playbackRate.value = layer.playbackRate;
            }
            
            // Set loop if specified
            if (layer.loop) {
                source.loop = true;
            }
            
            // Create gain node
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = 0; // Start silent for fade-in
            
            // Create panner if spatial effects are enabled
            let pannerNode = null;
            const soundscape = this.soundscapes[this.state.currentSoundscape];
            
            if (soundscape.spatialEffects && soundscape.spatialEffects.enabled) {
                pannerNode = this.audioContext.createStereoPanner();
                
                // Set random panning position
                const panningRange = soundscape.spatialEffects.panningRange;
                const panPosition = (Math.random() * 2 - 1) * panningRange;
                pannerNode.pan.value = panPosition;
                
                // Connect source to panner to gain to master
                source.connect(pannerNode);
                pannerNode.connect(gainNode);
            } else {
                // Connect source directly to gain to master
                source.connect(gainNode);
            }
            
            // Connect gain to master
            gainNode.connect(this.masterGain);
            
            // Start playback
            source.start();
            
            // Fade in
            this.fadeGain(gainNode.gain, 0, layer.gain, 2000);
            
            // Store active source
            this.state.activeSources.push({
                source,
                gainNode,
                pannerNode,
                type,
                config: layer
            });
            
            return true;
        } catch (error) {
            console.error(`Error starting layer (${layer.url}):`, error);
            return false;
        }
    }
    
    /**
     * Schedule top layer events
     * @param {Array} topLayers - Top layer configurations
     */
    scheduleTopLayerEvents(topLayers) {
        // Clear any existing event timers
        this.clearEventTimers();
        
        // Schedule each top layer
        topLayers.forEach((layer, index) => {
            const scheduleEvent = () => {
                // Calculate random interval
                const interval = Math.random() * (layer.maxInterval - layer.minInterval) + layer.minInterval;
                
                // Schedule event
                const timer = setTimeout(async () => {
                    // Play event sound
                    await this.playEventSound(layer);
                    
                    // Schedule next event
                    scheduleEvent();
                }, interval);
                
                // Store timer ID
                this.state.eventTimers.push(timer);
            };
            
            // Schedule first event with initial delay
            const initialDelay = Math.random() * 10000 + (index * 5000);
            const timer = setTimeout(() => {
                scheduleEvent();
            }, initialDelay);
            
            // Store timer ID
            this.state.eventTimers.push(timer);
        });
    }
    
    /**
     * Play a single event sound
     * @param {Object} layer - Event layer configuration
     */
    async playEventSound(layer) {
        try {
            // Load audio buffer
            const buffer = await this.loadAudioBuffer(layer.url);
            
            // Create audio source
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            
            // Create gain node
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = 0; // Start silent for fade-in
            
            // Create panner for spatial effect
            const pannerNode = this.audioContext.createStereoPanner();
            
            // Set random panning position
            const panPosition = Math.random() * 2 - 1;
            pannerNode.pan.value = panPosition;
            
            // Connect source to panner to gain to master
            source.connect(pannerNode);
            pannerNode.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            // Start playback
            source.start();
            
            // Fade in
            this.fadeGain(gainNode.gain, 0, layer.gain, 500);
            
            // Fade out before end
            const duration = buffer.duration * 1000;
            setTimeout(() => {
                this.fadeGain(gainNode.gain, gainNode.gain.value, 0, 1000);
            }, duration - 1000);
            
            // Remove source when finished
            source.onended = () => {
                source.disconnect();
                gainNode.disconnect();
                pannerNode.disconnect();
            };
            
            return true;
        } catch (error) {
            console.error(`Error playing event sound (${layer.url}):`, error);
            return false;
        }
    }
    
    /**
     * Clear all event timers
     */
    clearEventTimers() {
        this.state.eventTimers.forEach(timer => {
            clearTimeout(timer);
        });
        
        this.state.eventTimers = [];
    }
    
    /**
     * Stop ambient sound
     */
    stopAmbientSound() {
        // Stop all active sources
        this.state.activeSources.forEach(({ source, gainNode }) => {
            try {
                // Fade out
                this.fadeGain(gainNode.gain, gainNode.gain.value, 0, 500);
                
                // Stop source after fade
                setTimeout(() => {
                    try {
                        source.stop();
                    } catch (e) {
                        // Ignore errors if source already stopped
                    }
                }, 500);
            } catch (error) {
                // Ignore errors if source already stopped
            }
        });
        
        // Clear active sources
        this.state.activeSources = [];
        
        // Clear event timers
        this.clearEventTimers();
        
        // Stop fallback oscillators if active
        this.stopFallbackAmbientSound();
        
        // Publish event that ambient sound stopped
        this.eventSystem.publish('ambient-sound-stopped');
    }
    
    /**
     * Change soundscape with crossfade
     * @param {string} soundscape - Soundscape name
     */
    async changeSoundscape(soundscape) {
        // Validate soundscape
        if (!this.soundscapes[soundscape]) {
            console.warn(`Invalid soundscape: ${soundscape}`);
            return;
        }
        
        // Skip if already playing this soundscape
        if (soundscape === this.state.currentSoundscape && this.state.activeSources.length > 0) {
            return;
        }
        
        console.log(`Changing soundscape to ${this.soundscapes[soundscape].name}`);
        
        // Store previous soundscape
        this.state.previousSoundscape = this.state.currentSoundscape;
        
        // Update current soundscape
        this.state.currentSoundscape = soundscape;
        
        // Save preference
        try {
            // Get current preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'audio-preferences') || {
                id: 'audio-preferences'
            };
            
            // Update soundscape preference
            preferences.soundscape = soundscape;
            
            // Save preferences
            await this.storageManager.setIndexedDB('preferences', preferences);
        } catch (error) {
            console.error('Error saving soundscape preference:', error);
        }
        
        // If using fallback, switch to fallback for new soundscape
        if (this.state.useFallback) {
            this.stopFallbackAmbientSound();
            this.startFallbackAmbientSound();
            return;
        }
        
        // If no active sources, just start new soundscape
        if (this.state.activeSources.length === 0) {
            this.startAmbientSound();
            return;
        }
        
        // Crossfade to new soundscape
        this.crossfadeSoundscapes();
        
        // Publish event that soundscape changed
        this.eventSystem.publish('ambient-soundscape-changed', {
            soundscape: soundscape,
            name: this.soundscapes[soundscape].name
        });
    }
    
    /**
     * Crossfade between soundscapes
     */
    async crossfadeSoundscapes() {
        try {
            // Fade out current soundscape
            const currentSources = [...this.state.activeSources];
            
            currentSources.forEach(({ gainNode }) => {
                this.fadeGain(gainNode.gain, gainNode.gain.value, 0, this.state.crossfadeDuration);
            });
            
            // Start new soundscape
            const soundscape = this.soundscapes[this.state.currentSoundscape];
            
            // Start base layer
            await this.startLayer(soundscape.baseLayer, 'base');
            
            // Start mid layers with slight delay
            for (let i = 0; i < soundscape.midLayers.length; i++) {
                const delay = 500 + (i * 300);
                setTimeout(async () => {
                    await this.startLayer(soundscape.midLayers[i], 'mid');
                }, delay);
            }
            
            // Schedule top layer events
            this.scheduleTopLayerEvents(soundscape.topLayers);
            
            // Remove old sources after crossfade
            setTimeout(() => {
                currentSources.forEach(({ source }) => {
                    try {
                        source.stop();
                    } catch (e) {
                        // Ignore errors if source already stopped
                    }
                });
                
                // Filter out old sources from active sources
                this.state.activeSources = this.state.activeSources.filter(
                    source => !currentSources.includes(source)
                );
            }, this.state.crossfadeDuration + 500);
        } catch (error) {
            console.error('Error during soundscape crossfade:', error);
        }
    }
    
    /**
     * Schedule intermittent style changes
     */
    scheduleStyleChange() {
        // Clear any existing timer
        if (this.state.styleChangeTimer) {
            clearTimeout(this.state.styleChangeTimer);
        }
        
        // Calculate random interval
        const interval = Math.random() * 
            (this.state.styleChangeDuration.max - this.state.styleChangeDuration.min) + 
            this.state.styleChangeDuration.min;
        
        // Schedule style change
        this.state.styleChangeTimer = setTimeout(() => {
            this.changeToRandomSoundscape();
            
            // Schedule next style change
            this.scheduleStyleChange();
        }, interval);
        
        console.log(`Scheduled soundscape change in ${Math.round(interval / 1000)} seconds`);
    }
    
    /**
     * Change to a random soundscape
     */
    changeToRandomSoundscape() {
        // Get all soundscape keys
        const soundscapeKeys = Object.keys(this.soundscapes);
        
        // Filter out current soundscape
        const availableSoundscapes = soundscapeKeys.filter(
            key => key !== this.state.currentSoundscape
        );
        
        // Select random soundscape
        const randomIndex = Math.floor(Math.random() * availableSoundscapes.length);
        const randomSoundscape = availableSoundscapes[randomIndex];
        
        // Change to random soundscape
        this.changeSoundscape(randomSoundscape);
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
        
        // Apply volume to master gain
        if (this.masterGain) {
            this.fadeGain(this.masterGain.gain, this.masterGain.gain.value, this.state.muted ? 0 : volume, 300);
        }
        
        // Apply volume to fallback oscillators
        this.state.activeOscillators.forEach(({ gainNode }) => {
            this.fadeGain(gainNode.gain, gainNode.gain.value, this.state.muted ? 0 : (volume * gainNode.baseGain), 300);
        });
        
        // Save preference
        try {
            // Get current preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'audio-preferences') || {
                id: 'audio-preferences'
            };
            
            // Update volume preference
            preferences.volume = volume;
            
            // Save preferences
            await this.storageManager.setIndexedDB('preferences', preferences);
            
            // Publish event that volume changed
            this.eventSystem.publish('ambient-volume-changed', {
                volume: volume
            });
            
            console.log(`Ambient volume set to: ${volume.toFixed(2)}`);
        } catch (error) {
            console.error('Error saving volume preference:', error);
        }
    }
    
    /**
     * Mute ambient sound
     */
    async mute() {
        // Skip if already muted
        if (this.state.muted) return;
        
        // Update state
        this.state.muted = true;
        
        // Mute master gain
        if (this.masterGain) {
            this.fadeGain(this.masterGain.gain, this.masterGain.gain.value, 0, 300);
        }
        
        // Mute fallback oscillators
        this.state.activeOscillators.forEach(({ gainNode }) => {
            this.fadeGain(gainNode.gain, gainNode.gain.value, 0, 300);
        });
        
        // Save preference
        try {
            // Get current preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'audio-preferences') || {
                id: 'audio-preferences'
            };
            
            // Update mute preference
            preferences.muted = true;
            
            // Save preferences
            await this.storageManager.setIndexedDB('preferences', preferences);
            
            // Publish event that sound was muted
            this.eventSystem.publish('ambient-muted');
            
            console.log('Ambient sound muted');
        } catch (error) {
            console.error('Error saving mute preference:', error);
        }
    }
    
    /**
     * Unmute ambient sound
     */
    async unmute() {
        // Skip if not muted
        if (!this.state.muted) return;
        
        // Update state
        this.state.muted = false;
        
        // Unmute master gain
        if (this.masterGain) {
            this.fadeGain(this.masterGain.gain, 0, this.state.volume, 300);
        }
        
        // Unmute fallback oscillators
        this.state.activeOscillators.forEach(({ gainNode }) => {
            this.fadeGain(gainNode.gain, 0, this.state.volume * gainNode.baseGain, 300);
        });
        
        // Save preference
        try {
            // Get current preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'audio-preferences') || {
                id: 'audio-preferences'
            };
            
            // Update mute preference
            preferences.muted = false;
            
            // Save preferences
            await this.storageManager.setIndexedDB('preferences', preferences);
            
            // Publish event that sound was unmuted
            this.eventSystem.publish('ambient-unmuted');
            
            console.log('Ambient sound unmuted');
        } catch (error) {
            console.error('Error saving mute preference:', error);
        }
    }
    
    /**
     * Reduce volume when page is hidden
     */
    reduceVolumeWhenHidden() {
        // Store current volume
        this.state.visibilityVolume = this.masterGain ? this.masterGain.gain.value : this.state.volume;
        
        // Reduce volume
        if (this.masterGain) {
            this.fadeGain(this.masterGain.gain, this.masterGain.gain.value, this.state.visibilityVolume * 0.3, 1000);
        }
    }
    
    /**
     * Restore volume when page becomes visible
     */
    restoreVolumeWhenVisible() {
        // Restore volume if we have stored visibility volume
        if (this.state.visibilityVolume !== undefined && this.masterGain) {
            this.fadeGain(this.masterGain.gain, this.masterGain.gain.value, this.state.visibilityVolume, 1000);
        }
    }
    
    /**
     * Adjust ambient sound to emotional state
     * @param {string} emotion - Emotional state
     * @param {number} intensity - Emotion intensity (0-1)
     */
    adjustToEmotionalState(emotion, intensity) {
        // Skip if not initialized
        if (!this.state.initialized) return;
        
        // Adjust based on emotion
        switch (emotion) {
            case 'joy':
            case 'excited':
                // For joyful/excited emotions, consider changing to more energetic soundscape
                if (intensity > 0.7 && Math.random() > 0.5) {
                    if (this.state.currentSoundscape !== 'cosmic') {
                        this.changeSoundscape('cosmic');
                    }
                }
                break;
                
            case 'reflective':
            case 'empathetic':
                // For reflective/empathetic emotions, consider changing to calmer soundscape
                if (intensity > 0.6 && Math.random() > 0.5) {
                    if (this.state.currentSoundscape !== 'meditation') {
                        this.changeSoundscape('meditation');
                    }
                }
                break;
                
            case 'curious':
                // For curious emotion, consider changing to nature soundscape
                if (intensity > 0.6 && Math.random() > 0.7) {
                    if (this.state.currentSoundscape !== 'nature') {
                        this.changeSoundscape('nature');
                    }
                }
                break;
                
            case 'calm':
            case 'neutral':
                // For calm/neutral emotions, subtle adjustments to current soundscape
                // Adjust playback rate of mid layers
                this.state.activeSources.forEach(({ source, type }) => {
                    if (type === 'mid' && source.playbackRate) {
                        const newRate = 0.95 + (Math.random() * 0.1);
                        this.smoothlyChangePlaybackRate(source.playbackRate, newRate, 3000);
                    }
                });
                break;
        }
    }
    
    /**
     * Adjust ambient sound to conversation topic
     * @param {string} topic - Conversation topic
     */
    adjustToConversationTopic(topic) {
        // Skip if not initialized or no topic
        if (!this.state.initialized || !topic) return;
        
        // Simple topic-based soundscape selection
        const topicLower = topic.toLowerCase();
        
        // Space-related topics
        if (topicLower.includes('space') || 
            topicLower.includes('star') || 
            topicLower.includes('universe') || 
            topicLower.includes('galaxy') || 
            topicLower.includes('cosmos')) {
            
            if (this.state.currentSoundscape !== 'cosmic' && Math.random() > 0.7) {
                this.changeSoundscape('cosmic');
            }
        }
        // Nature-related topics
        else if (topicLower.includes('nature') || 
                 topicLower.includes('forest') || 
                 topicLower.includes('animal') || 
                 topicLower.includes('plant') || 
                 topicLower.includes('tree') ||
                 topicLower.includes('ocean') ||
                 topicLower.includes('river')) {
            
            if (this.state.currentSoundscape !== 'nature' && Math.random() > 0.7) {
                this.changeSoundscape('nature');
            }
        }
        // Meditation/mindfulness topics
        else if (topicLower.includes('meditation') || 
                 topicLower.includes('mindful') || 
                 topicLower.includes('relax') || 
                 topicLower.includes('calm') || 
                 topicLower.includes('peace')) {
            
            if (this.state.currentSoundscape !== 'meditation' && Math.random() > 0.7) {
                this.changeSoundscape('meditation');
            }
        }
        // Urban/city topics
        else if (topicLower.includes('city') || 
                 topicLower.includes('urban') || 
                 topicLower.includes('street') || 
                 topicLower.includes('building') || 
                 topicLower.includes('traffic')) {
            
            if (this.state.currentSoundscape !== 'urban' && Math.random() > 0.7) {
                this.changeSoundscape('urban');
            }
        }
    }
    
    /**
     * Start fallback oscillator-based ambient sound
     */
    startFallbackAmbientSound() {
        // Skip if audio context not available
        if (!this.audioContext) {
            try {
                this.createAudioContext();
            } catch (error) {
                console.error('Cannot create audio context for fallback sound:', error);
                return;
            }
        }
        
        // Skip if already playing
        if (this.state.activeOscillators.length > 0) return;
        
        console.log('Starting fallback oscillator-based ambient sound');
        
        try {
            // Get oscillator config for current soundscape
            const config = this.oscillatorConfig[this.state.currentSoundscape];
            if (!config) return;
            
            // Create base oscillator
            this.createOscillator(config.base, 'base', true);
            
            // Create mid oscillators
            setTimeout(() => {
                this.createOscillator(config.mid1, 'mid', true);
            }, 500);
            
            setTimeout(() => {
                this.createOscillator(config.mid2, 'mid', true);
            }, 1000);
            
            // Schedule event oscillators
            this.scheduleOscillatorEvents(config.events);
            
            // Publish event that ambient sound started
            this.eventSystem.publish('ambient-sound-started', {
                soundscape: this.state.currentSoundscape,
                fallback: true
            });
        } catch (error) {
            console.error('Error starting fallback ambient sound:', error);
        }
    }
    
    /**
     * Create oscillator
     * @param {Object} config - Oscillator configuration
     * @param {string} type - Oscillator type (base, mid, event)
     * @param {boolean} loop - Whether oscillator should loop
     * @returns {Object} - Oscillator object
     */
    createOscillator(config, type, loop = false) {
        try {
            // Create oscillator
            const oscillator = this.audioContext.createOscillator();
            oscillator.type = config.type;
            oscillator.frequency.value = config.frequency;
            
            // Create gain node
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = 0; // Start silent for fade-in
            gainNode.baseGain = config.gain; // Store base gain for reference
            
            // Connect oscillator to gain to master
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            // Start oscillator
            oscillator.start();
            
            // Fade in
            this.fadeGain(gainNode.gain, 0, this.state.muted ? 0 : (config.gain * this.state.volume), 2000);
            
            // Store active oscillator
            const oscillatorObj = {
                oscillator,
                gainNode,
                type,
                config
            };
            
            this.state.activeOscillators.push(oscillatorObj);
            
            // Set up cleanup for non-looping oscillators
            if (!loop && config.duration) {
                setTimeout(() => {
                    // Fade out
                    this.fadeGain(gainNode.gain, gainNode.gain.value, 0, 1000);
                    
                    // Stop oscillator after fade
                    setTimeout(() => {
                        try {
                            oscillator.stop();
                            oscillator.disconnect();
                            gainNode.disconnect();
                            
                            // Remove from active oscillators
                            const index = this.state.activeOscillators.indexOf(oscillatorObj);
                            if (index !== -1) {
                                this.state.activeOscillators.splice(index, 1);
                            }
                        } catch (e) {
                            // Ignore errors if oscillator already stopped
                        }
                    }, 1000);
                }, config.duration);
            }
            
            return oscillatorObj;
        } catch (error) {
            console.error('Error creating oscillator:', error);
            return null;
        }
    }
    
    /**
     * Schedule oscillator events
     * @param {Array} events - Event configurations
     */
    scheduleOscillatorEvents(events) {
        // Clear any existing event timers
        this.clearEventTimers();
        
        // Schedule each event
        events.forEach((event, index) => {
            const scheduleEvent = () => {
                // Calculate random interval
                const interval = Math.random() * 20000 + 10000;
                
                // Schedule event
                const timer = setTimeout(() => {
                    // Create event oscillator
                    this.createOscillator(event, 'event', false);
                    
                    // Schedule next event
                    scheduleEvent();
                }, interval);
                
                // Store timer ID
                this.state.eventTimers.push(timer);
            };
            
            // Schedule first event with initial delay
            const initialDelay = Math.random() * 10000 + (index * 5000);
            const timer = setTimeout(() => {
                scheduleEvent();
            }, initialDelay);
            
            // Store timer ID
            this.state.eventTimers.push(timer);
        });
    }
    
    /**
     * Stop fallback oscillator-based ambient sound
     */
    stopFallbackAmbientSound() {
        // Stop all active oscillators
        this.state.activeOscillators.forEach(({ oscillator, gainNode }) => {
            try {
                // Fade out
                this.fadeGain(gainNode.gain, gainNode.gain.value, 0, 500);
                
                // Stop oscillator after fade
                setTimeout(() => {
                    try {
                        oscillator.stop();
                        oscillator.disconnect();
                        gainNode.disconnect();
                    } catch (e) {
                        // Ignore errors if oscillator already stopped
                    }
                }, 500);
            } catch (error) {
                // Ignore errors if oscillator already stopped
            }
        });
        
        // Clear active oscillators
        this.state.activeOscillators = [];
        
        // Clear event timers
        this.clearEventTimers();
    }
    
    /**
     * Load audio buffer from URL
     * @param {string} url - Audio file URL
     * @returns {Promise<AudioBuffer>} - Audio buffer
     */
    async loadAudioBuffer(url) {
        // Check cache first
        if (this.bufferCache.has(url)) {
            return this.bufferCache.get(url);
        }
        
        try {
            // Fetch audio file
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch audio file: ${response.status} ${response.statusText}`);
            }
            
            // Get array buffer
            const arrayBuffer = await response.arrayBuffer();
            
            // Decode audio data
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            // Cache buffer
            this.bufferCache.set(url, audioBuffer);
            
            return audioBuffer;
        } catch (error) {
            console.error(`Error loading audio buffer (${url}):`, error);
            throw error;
        }
    }
    
    /**
     * Fade audio parameter (e.g., gain) from one value to another
     * @param {AudioParam} param - Audio parameter to fade
     * @param {number} fromValue - Starting value
     * @param {number} toValue - Target value
     * @param {number} duration - Fade duration in milliseconds
     */
    fadeGain(param, fromValue, toValue, duration) {
        try {
            const currentTime = this.audioContext.currentTime;
            param.setValueAtTime(fromValue, currentTime);
            param.exponentialRampToValueAtTime(
                Math.max(toValue, 0.0001), // Avoid zero for exponentialRamp
                currentTime + (duration / 1000)
            );
            
            // If target is actually zero, set to zero after ramp
            if (toValue === 0) {
                param.setValueAtTime(0, currentTime + (duration / 1000));
            }
        } catch (error) {
            // Fallback to direct setting if ramping fails
            param.value = toValue;
        }
    }
    
    /**
     * Smoothly change playback rate
     * @param {AudioParam} rateParam - Playback rate parameter
     * @param {number} newRate - Target playback rate
     * @param {number} duration - Transition duration in milliseconds
     */
    smoothlyChangePlaybackRate(rateParam, newRate, duration) {
        try {
            const currentTime = this.audioContext.currentTime;
            rateParam.linearRampToValueAtTime(
                newRate,
                currentTime + (duration / 1000)
            );
        } catch (error) {
            // Fallback to direct setting if ramping fails
            rateParam.value = newRate;
        }
    }
    
    /**
     * Get available soundscapes
     * @returns {Array} - Array of soundscape objects with name and description
     */
    getAvailableSoundscapes() {
        return Object.entries(this.soundscapes).map(([key, soundscape]) => ({
            id: key,
            name: soundscape.name,
            description: soundscape.description
        }));
    }
    
    /**
     * Get current soundscape
     * @returns {Object} - Current soundscape info
     */
    getCurrentSoundscape() {
        const soundscape = this.soundscapes[this.state.currentSoundscape];
        return {
            id: this.state.currentSoundscape,
            name: soundscape.name,
            description: soundscape.description,
            fallback: this.state.useFallback
        };
    }
}

// Initialize the multi-layered ambient sound system when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.multiLayeredAmbientSystem = new MultiLayeredAmbientSystem();
});
