/**
 * Interaction Sound System
 * 
 * This system provides sound effects for various user interactions
 * and application events, enhancing the auditory experience.
 */

class InteractionSoundSystem {
    constructor() {
        // Initialize dependencies
        this.storageManager = window.storageManager;
        this.eventSystem = window.eventSystem;
        
        // Audio context
        this.audioContext = null;
        
        // Master gain node
        this.masterGain = null;
        
        // Sound categories and effects
        this.sounds = {
            ui: {
                click: {
                    url: '/audio/interactions/ui-click.mp3',
                    gain: 0.3,
                    description: 'Button click sound'
                },
                hover: {
                    url: '/audio/interactions/ui-hover.mp3',
                    gain: 0.15,
                    description: 'Element hover sound'
                },
                toggle: {
                    url: '/audio/interactions/ui-toggle.mp3',
                    gain: 0.25,
                    description: 'Toggle switch sound'
                },
                slide: {
                    url: '/audio/interactions/ui-slide.mp3',
                    gain: 0.2,
                    description: 'Slider movement sound'
                },
                notification: {
                    url: '/audio/interactions/ui-notification.mp3',
                    gain: 0.35,
                    description: 'Notification alert sound'
                },
                error: {
                    url: '/audio/interactions/ui-error.mp3',
                    gain: 0.4,
                    description: 'Error alert sound'
                }
            },
            feedback: {
                success: {
                    url: '/audio/interactions/feedback-success.mp3',
                    gain: 0.35,
                    description: 'Success feedback sound'
                },
                warning: {
                    url: '/audio/interactions/feedback-warning.mp3',
                    gain: 0.4,
                    description: 'Warning feedback sound'
                },
                info: {
                    url: '/audio/interactions/feedback-info.mp3',
                    gain: 0.3,
                    description: 'Information feedback sound'
                },
                complete: {
                    url: '/audio/interactions/feedback-complete.mp3',
                    gain: 0.4,
                    description: 'Task completion sound'
                }
            },
            conversation: {
                start: {
                    url: '/audio/interactions/conversation-start.mp3',
                    gain: 0.35,
                    description: 'Conversation start sound'
                },
                thinking: {
                    url: '/audio/interactions/conversation-thinking.mp3',
                    gain: 0.25,
                    loop: true,
                    description: 'AI thinking sound'
                },
                response: {
                    url: '/audio/interactions/conversation-response.mp3',
                    gain: 0.3,
                    description: 'AI response received sound'
                },
                emotion: {
                    joy: {
                        url: '/audio/interactions/emotion-joy.mp3',
                        gain: 0.3,
                        description: 'Joyful emotion sound'
                    },
                    curious: {
                        url: '/audio/interactions/emotion-curious.mp3',
                        gain: 0.3,
                        description: 'Curious emotion sound'
                    },
                    reflective: {
                        url: '/audio/interactions/emotion-reflective.mp3',
                        gain: 0.3,
                        description: 'Reflective emotion sound'
                    },
                    excited: {
                        url: '/audio/interactions/emotion-excited.mp3',
                        gain: 0.35,
                        description: 'Excited emotion sound'
                    },
                    empathetic: {
                        url: '/audio/interactions/emotion-empathetic.mp3',
                        gain: 0.3,
                        description: 'Empathetic emotion sound'
                    },
                    calm: {
                        url: '/audio/interactions/emotion-calm.mp3',
                        gain: 0.25,
                        description: 'Calm emotion sound'
                    }
                }
            },
            ambient: {
                transition: {
                    url: '/audio/interactions/ambient-transition.mp3',
                    gain: 0.3,
                    description: 'Ambient transition sound'
                },
                event: {
                    url: '/audio/interactions/ambient-event.mp3',
                    gain: 0.25,
                    description: 'Ambient event sound'
                },
                reveal: {
                    url: '/audio/interactions/ambient-reveal.mp3',
                    gain: 0.35,
                    description: 'Content reveal sound'
                }
            }
        };
        
        // Fallback sounds using oscillators
        this.fallbackSounds = {
            ui: {
                click: {
                    type: 'sine',
                    frequency: 800,
                    gain: 0.2,
                    duration: 80
                },
                hover: {
                    type: 'sine',
                    frequency: 600,
                    gain: 0.1,
                    duration: 50
                },
                toggle: {
                    type: 'square',
                    frequency: 500,
                    gain: 0.15,
                    duration: 100
                },
                slide: {
                    type: 'sine',
                    frequency: 400,
                    gain: 0.12,
                    duration: 70
                },
                notification: {
                    type: 'triangle',
                    frequency: 900,
                    gain: 0.25,
                    duration: 150
                },
                error: {
                    type: 'sawtooth',
                    frequency: 200,
                    gain: 0.3,
                    duration: 200
                }
            },
            feedback: {
                success: {
                    type: 'sine',
                    frequency: 800,
                    gain: 0.25,
                    duration: 200,
                    ramp: true
                },
                warning: {
                    type: 'triangle',
                    frequency: 400,
                    gain: 0.3,
                    duration: 250
                },
                info: {
                    type: 'sine',
                    frequency: 600,
                    gain: 0.2,
                    duration: 150
                },
                complete: {
                    type: 'sine',
                    frequency: [600, 800],
                    gain: 0.3,
                    duration: 300,
                    ramp: true
                }
            },
            conversation: {
                start: {
                    type: 'sine',
                    frequency: [400, 600],
                    gain: 0.25,
                    duration: 200,
                    ramp: true
                },
                thinking: {
                    type: 'sine',
                    frequency: 300,
                    gain: 0.15,
                    duration: 300,
                    loop: true,
                    interval: 600
                },
                response: {
                    type: 'sine',
                    frequency: [600, 400],
                    gain: 0.2,
                    duration: 200,
                    ramp: true
                }
            },
            ambient: {
                transition: {
                    type: 'sine',
                    frequency: [300, 500],
                    gain: 0.2,
                    duration: 400,
                    ramp: true
                },
                event: {
                    type: 'triangle',
                    frequency: 450,
                    gain: 0.15,
                    duration: 300
                },
                reveal: {
                    type: 'sine',
                    frequency: [200, 400],
                    gain: 0.25,
                    duration: 350,
                    ramp: true
                }
            }
        };
        
        // Audio buffer cache
        this.bufferCache = new Map();
        
        // Active sounds
        this.activeSounds = [];
        
        // State
        this.state = {
            initialized: false,
            enabled: true,
            volume: 0.7,
            muted: false,
            useFallback: false
        };
        
        // Initialize
        this.initialize();
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    /**
     * Initialize the interaction sound system
     */
    async initialize() {
        try {
            // Create audio context
            this.createAudioContext();
            
            // Load user preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'interaction-sound-preferences');
            if (preferences) {
                if (preferences.enabled !== undefined) {
                    this.state.enabled = preferences.enabled;
                }
                
                if (preferences.volume !== undefined) {
                    this.state.volume = preferences.volume;
                }
                
                if (preferences.muted !== undefined) {
                    this.state.muted = preferences.muted;
                }
            }
            
            // Apply volume setting
            this.setVolume(this.state.volume);
            
            // Apply mute setting
            if (this.state.muted) {
                this.mute();
            }
            
            console.log('Interaction Sound System initialized');
            
            // Notify system that interaction sounds are ready
            this.eventSystem.publish('interaction-sounds-ready', {
                enabled: this.state.enabled,
                volume: this.state.volume,
                muted: this.state.muted
            });
            
            this.state.initialized = true;
            
            // Preload common sounds
            this.preloadCommonSounds();
        } catch (error) {
            console.error('Error initializing interaction sound system:', error);
            
            // Fall back to oscillator-based sounds
            this.state.useFallback = true;
            console.log('Using fallback oscillator-based interaction sounds');
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
        this.eventSystem.subscribe('interaction-sound-volume-change', (data) => {
            this.setVolume(data.volume);
        });
        
        // Listen for mute toggle
        this.eventSystem.subscribe('interaction-sound-mute-toggle', (data) => {
            if (data.muted) {
                this.mute();
            } else {
                this.unmute();
            }
        });
        
        // Listen for enable/disable toggle
        this.eventSystem.subscribe('interaction-sound-toggle', (data) => {
            this.toggleSounds(data.enabled);
        });
        
        // Listen for UI events
        this.eventSystem.subscribe('ui-click', () => {
            this.playSound('ui', 'click');
        });
        
        this.eventSystem.subscribe('ui-hover', () => {
            this.playSound('ui', 'hover');
        });
        
        this.eventSystem.subscribe('ui-toggle', () => {
            this.playSound('ui', 'toggle');
        });
        
        this.eventSystem.subscribe('ui-slide', () => {
            this.playSound('ui', 'slide');
        });
        
        this.eventSystem.subscribe('ui-notification', () => {
            this.playSound('ui', 'notification');
        });
        
        this.eventSystem.subscribe('ui-error', () => {
            this.playSound('ui', 'error');
        });
        
        // Listen for feedback events
        this.eventSystem.subscribe('feedback-success', () => {
            this.playSound('feedback', 'success');
        });
        
        this.eventSystem.subscribe('feedback-warning', () => {
            this.playSound('feedback', 'warning');
        });
        
        this.eventSystem.subscribe('feedback-info', () => {
            this.playSound('feedback', 'info');
        });
        
        this.eventSystem.subscribe('feedback-complete', () => {
            this.playSound('feedback', 'complete');
        });
        
        // Listen for conversation events
        this.eventSystem.subscribe('conversation-start', () => {
            this.playSound('conversation', 'start');
        });
        
        this.eventSystem.subscribe('conversation-thinking-start', () => {
            this.playSound('conversation', 'thinking', true);
        });
        
        this.eventSystem.subscribe('conversation-thinking-stop', () => {
            this.stopSound('conversation', 'thinking');
        });
        
        this.eventSystem.subscribe('conversation-response', () => {
            this.playSound('conversation', 'response');
        });
        
        // Listen for emotional state changes
        this.eventSystem.subscribe('meai-emotional-state-change', (data) => {
            if (data.emotion && this.sounds.conversation.emotion[data.emotion]) {
                this.playSound('conversation', `emotion.${data.emotion}`);
            }
        });
        
        // Listen for ambient events
        this.eventSystem.subscribe('ambient-transition', () => {
            this.playSound('ambient', 'transition');
        });
        
        this.eventSystem.subscribe('ambient-event', () => {
            this.playSound('ambient', 'event');
        });
        
        this.eventSystem.subscribe('ambient-reveal', () => {
            this.playSound('ambient', 'reveal');
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
            const volumeSlider = document.getElementById('interaction-sound-volume');
            if (volumeSlider) {
                volumeSlider.value = this.state.volume;
                volumeSlider.addEventListener('input', (event) => {
                    this.setVolume(parseFloat(event.target.value));
                });
            }
            
            // Set up mute toggle
            const muteToggle = document.getElementById('interaction-sound-mute');
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
            
            // Set up enable/disable toggle
            const enableToggle = document.getElementById('interaction-sound-enable');
            if (enableToggle) {
                enableToggle.checked = this.state.enabled;
                enableToggle.addEventListener('change', (event) => {
                    this.toggleSounds(event.target.checked);
                });
            }
            
            // Add click sound to buttons
            document.querySelectorAll('button, .button, [role="button"]').forEach(button => {
                button.addEventListener('click', () => {
                    this.playSound('ui', 'click');
                });
                
                button.addEventListener('mouseenter', () => {
                    this.playSound('ui', 'hover');
                });
            });
            
            // Add toggle sound to checkboxes and radio buttons
            document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(input => {
                input.addEventListener('change', () => {
                    this.playSound('ui', 'toggle');
                });
            });
            
            // Add slide sound to range inputs
            document.querySelectorAll('input[type="range"]').forEach(input => {
                input.addEventListener('input', () => {
                    this.playSound('ui', 'slide');
                });
            });
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
            } catch (error) {
                console.error('Error resuming audio context:', error);
            }
        }
    }
    
    /**
     * Preload common sounds
     */
    async preloadCommonSounds() {
        try {
            // Preload UI sounds
            this.preloadSound('ui', 'click');
            this.preloadSound('ui', 'hover');
            this.preloadSound('ui', 'toggle');
            
            // Preload feedback sounds
            this.preloadSound('feedback', 'success');
            this.preloadSound('feedback', 'warning');
            
            // Preload conversation sounds
            this.preloadSound('conversation', 'start');
            this.preloadSound('conversation', 'thinking');
            this.preloadSound('conversation', 'response');
        } catch (error) {
            console.error('Error preloading common sounds:', error);
        }
    }
    
    /**
     * Preload a specific sound
     * @param {string} category - Sound category
     * @param {string} name - Sound name
     */
    async preloadSound(category, name) {
        try {
            // Skip if using fallback
            if (this.state.useFallback) return;
            
            // Get sound config
            const sound = this.getSoundConfig(category, name);
            if (!sound) return;
            
            // Load audio buffer
            await this.loadAudioBuffer(sound.url);
            
            console.log(`Preloaded sound: ${category}.${name}`);
        } catch (error) {
            console.error(`Error preloading sound (${category}.${name}):`, error);
        }
    }
    
    /**
     * Play a sound
     * @param {string} category - Sound category
     * @param {string} name - Sound name
     * @param {boolean} loop - Whether to loop the sound
     */
    async playSound(category, name, loop = false) {
        // Skip if not initialized, disabled, or muted
        if (!this.state.initialized || !this.state.enabled || this.state.muted) return;
        
        try {
            // Resume audio context if suspended
            if (this.audioContext && this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            // Get sound config
            const sound = this.getSoundConfig(category, name);
            if (!sound) return;
            
            // Use fallback if needed
            if (this.state.useFallback) {
                this.playFallbackSound(category, name, loop);
                return;
            }
            
            // Load audio buffer
            const buffer = await this.loadAudioBuffer(sound.url);
            
            // Create audio source
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            
            // Set loop if specified
            if (loop || sound.loop) {
                source.loop = true;
            }
            
            // Create gain node
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = sound.gain * this.state.volume;
            
            // Connect source to gain to master
            source.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            // Start playback
            source.start();
            
            // Store active sound if looping
            if (loop || sound.loop) {
                const activeSound = {
                    category,
                    name,
                    source,
                    gainNode
                };
                
                this.activeSounds.push(activeSound);
            } else {
                // Remove source when finished
                source.onended = () => {
                    source.disconnect();
                    gainNode.disconnect();
                };
            }
            
            return true;
        } catch (error) {
            console.error(`Error playing sound (${category}.${name}):`, error);
            
            // Try fallback
            this.playFallbackSound(category, name, loop);
            return false;
        }
    }
    
    /**
     * Stop a specific sound
     * @param {string} category - Sound category
     * @param {string} name - Sound name
     */
    stopSound(category, name) {
        // Find active sounds matching category and name
        const sounds = this.activeSounds.filter(
            sound => sound.category === category && sound.name === name
        );
        
        // Stop each matching sound
        sounds.forEach(({ source, gainNode }) => {
            try {
                // Fade out
                this.fadeGain(gainNode.gain, gainNode.gain.value, 0, 100);
                
                // Stop source after fade
                setTimeout(() => {
                    try {
                        source.stop();
                        source.disconnect();
                        gainNode.disconnect();
                    } catch (e) {
                        // Ignore errors if source already stopped
                    }
                }, 100);
            } catch (error) {
                // Ignore errors if source already stopped
            }
        });
        
        // Remove from active sounds
        this.activeSounds = this.activeSounds.filter(
            sound => !(sound.category === category && sound.name === name)
        );
    }
    
    /**
     * Stop all sounds
     */
    stopAllSounds() {
        // Stop all active sounds
        this.activeSounds.forEach(({ source, gainNode }) => {
            try {
                // Fade out
                this.fadeGain(gainNode.gain, gainNode.gain.value, 0, 100);
                
                // Stop source after fade
                setTimeout(() => {
                    try {
                        source.stop();
                        source.disconnect();
                        gainNode.disconnect();
                    } catch (e) {
                        // Ignore errors if source already stopped
                    }
                }, 100);
            } catch (error) {
                // Ignore errors if source already stopped
            }
        });
        
        // Clear active sounds
        this.activeSounds = [];
    }
    
    /**
     * Play fallback oscillator-based sound
     * @param {string} category - Sound category
     * @param {string} name - Sound name
     * @param {boolean} loop - Whether to loop the sound
     */
    playFallbackSound(category, name, loop = false) {
        try {
            // Get fallback sound config
            const config = this.getFallbackSoundConfig(category, name);
            if (!config) return false;
            
            // Create oscillator
            const oscillator = this.audioContext.createOscillator();
            oscillator.type = config.type;
            
            // Set frequency
            if (Array.isArray(config.frequency)) {
                // Start with first frequency
                oscillator.frequency.value = config.frequency[0];
            } else {
                oscillator.frequency.value = config.frequency;
            }
            
            // Create gain node
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = config.gain * this.state.volume;
            
            // Connect oscillator to gain to master
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            // Start oscillator
            oscillator.start();
            
            // Handle frequency ramp if specified
            if (config.ramp && Array.isArray(config.frequency)) {
                const startTime = this.audioContext.currentTime;
                const endTime = startTime + (config.duration / 1000);
                
                oscillator.frequency.setValueAtTime(config.frequency[0], startTime);
                oscillator.frequency.linearRampToValueAtTime(config.frequency[1], endTime);
            }
            
            // Handle looping
            if (loop || config.loop) {
                // For looping sounds, we need to create a pattern
                if (config.interval) {
                    // Stop after a short duration
                    setTimeout(() => {
                        try {
                            oscillator.stop();
                            oscillator.disconnect();
                            gainNode.disconnect();
                            
                            // Schedule next loop after interval
                            setTimeout(() => {
                                this.playFallbackSound(category, name, loop);
                            }, config.interval);
                        } catch (e) {
                            // Ignore errors if oscillator already stopped
                        }
                    }, config.duration);
                }
                
                // Store active sound
                const activeSound = {
                    category,
                    name,
                    source: oscillator,
                    gainNode
                };
                
                this.activeSounds.push(activeSound);
            } else {
                // Stop after duration
                setTimeout(() => {
                    try {
                        // Fade out
                        this.fadeGain(gainNode.gain, gainNode.gain.value, 0, 50);
                        
                        // Stop oscillator after fade
                        setTimeout(() => {
                            try {
                                oscillator.stop();
                                oscillator.disconnect();
                                gainNode.disconnect();
                            } catch (e) {
                                // Ignore errors if oscillator already stopped
                            }
                        }, 50);
                    } catch (error) {
                        // Ignore errors if oscillator already stopped
                    }
                }, config.duration);
            }
            
            return true;
        } catch (error) {
            console.error(`Error playing fallback sound (${category}.${name}):`, error);
            return false;
        }
    }
    
    /**
     * Get sound configuration
     * @param {string} category - Sound category
     * @param {string} name - Sound name
     * @returns {Object|null} - Sound configuration or null if not found
     */
    getSoundConfig(category, name) {
        // Handle nested properties with dot notation
        if (name.includes('.')) {
            const parts = name.split('.');
            let current = this.sounds[category];
            
            for (const part of parts) {
                if (!current[part]) return null;
                current = current[part];
            }
            
            return current;
        }
        
        // Handle direct properties
        return this.sounds[category] ? this.sounds[category][name] : null;
    }
    
    /**
     * Get fallback sound configuration
     * @param {string} category - Sound category
     * @param {string} name - Sound name
     * @returns {Object|null} - Fallback sound configuration or null if not found
     */
    getFallbackSoundConfig(category, name) {
        // Handle nested properties with dot notation
        if (name.includes('.')) {
            const parts = name.split('.');
            const baseName = parts[0];
            
            // For emotion sounds, use a generic fallback
            if (category === 'conversation' && baseName === 'emotion') {
                return this.fallbackSounds.conversation.response;
            }
            
            return null;
        }
        
        // Handle direct properties
        return this.fallbackSounds[category] ? this.fallbackSounds[category][name] : null;
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
            this.masterGain.gain.value = this.state.muted ? 0 : volume;
        }
        
        // Apply volume to active sounds
        this.activeSounds.forEach(({ gainNode, category, name }) => {
            const sound = this.getSoundConfig(category, name);
            if (sound) {
                gainNode.gain.value = this.state.muted ? 0 : (sound.gain * volume);
            }
        });
        
        // Save preference
        try {
            // Get current preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'interaction-sound-preferences') || {
                id: 'interaction-sound-preferences'
            };
            
            // Update volume preference
            preferences.volume = volume;
            
            // Save preferences
            await this.storageManager.setIndexedDB('preferences', preferences);
            
            // Publish event that volume changed
            this.eventSystem.publish('interaction-sound-volume-changed', {
                volume: volume
            });
            
            console.log(`Interaction sound volume set to: ${volume.toFixed(2)}`);
        } catch (error) {
            console.error('Error saving volume preference:', error);
        }
    }
    
    /**
     * Mute interaction sounds
     */
    async mute() {
        // Skip if already muted
        if (this.state.muted) return;
        
        // Update state
        this.state.muted = true;
        
        // Mute master gain
        if (this.masterGain) {
            this.masterGain.gain.value = 0;
        }
        
        // Save preference
        try {
            // Get current preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'interaction-sound-preferences') || {
                id: 'interaction-sound-preferences'
            };
            
            // Update mute preference
            preferences.muted = true;
            
            // Save preferences
            await this.storageManager.setIndexedDB('preferences', preferences);
            
            // Publish event that sound was muted
            this.eventSystem.publish('interaction-sound-muted');
            
            console.log('Interaction sounds muted');
        } catch (error) {
            console.error('Error saving mute preference:', error);
        }
    }
    
    /**
     * Unmute interaction sounds
     */
    async unmute() {
        // Skip if not muted
        if (!this.state.muted) return;
        
        // Update state
        this.state.muted = false;
        
        // Unmute master gain
        if (this.masterGain) {
            this.masterGain.gain.value = this.state.volume;
        }
        
        // Unmute active sounds
        this.activeSounds.forEach(({ gainNode, category, name }) => {
            const sound = this.getSoundConfig(category, name);
            if (sound) {
                gainNode.gain.value = sound.gain * this.state.volume;
            }
        });
        
        // Save preference
        try {
            // Get current preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'interaction-sound-preferences') || {
                id: 'interaction-sound-preferences'
            };
            
            // Update mute preference
            preferences.muted = false;
            
            // Save preferences
            await this.storageManager.setIndexedDB('preferences', preferences);
            
            // Publish event that sound was unmuted
            this.eventSystem.publish('interaction-sound-unmuted');
            
            console.log('Interaction sounds unmuted');
        } catch (error) {
            console.error('Error saving mute preference:', error);
        }
    }
    
    /**
     * Toggle interaction sounds
     * @param {boolean} enabled - Whether sounds should be enabled
     */
    async toggleSounds(enabled) {
        // Update state
        this.state.enabled = enabled;
        
        // If disabled, stop all sounds
        if (!enabled) {
            this.stopAllSounds();
        }
        
        // Save preference
        try {
            // Get current preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'interaction-sound-preferences') || {
                id: 'interaction-sound-preferences'
            };
            
            // Update enabled preference
            preferences.enabled = enabled;
            
            // Save preferences
            await this.storageManager.setIndexedDB('preferences', preferences);
            
            // Publish event that sound was toggled
            this.eventSystem.publish('interaction-sound-toggled', {
                enabled: enabled
            });
            
            console.log(`Interaction sounds ${enabled ? 'enabled' : 'disabled'}`);
        } catch (error) {
            console.error('Error saving enabled preference:', error);
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
            
            if (toValue === 0) {
                param.linearRampToValueAtTime(
                    0.0001, // Avoid zero for exponentialRamp
                    currentTime + (duration / 1000)
                );
                
                // Set to actual zero after ramp
                param.setValueAtTime(0, currentTime + (duration / 1000));
            } else {
                param.exponentialRampToValueAtTime(
                    Math.max(toValue, 0.0001), // Avoid zero for exponentialRamp
                    currentTime + (duration / 1000)
                );
            }
        } catch (error) {
            // Fallback to direct setting if ramping fails
            param.value = toValue;
        }
    }
}

// Initialize the interaction sound system when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.interactionSoundSystem = new InteractionSoundSystem();
});
