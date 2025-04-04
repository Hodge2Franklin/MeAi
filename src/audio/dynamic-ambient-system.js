/**
 * Dynamic Ambient Sound System for MeAI
 * 
 * Features:
 * - Multiple ambient sound styles that change intermittently
 * - Smart transitions between sound styles
 * - High-quality audio with fallback mechanisms
 * - Unpredictable but pleasant variations
 * - Non-intrusive audio experience
 */

class DynamicAmbientSoundSystem {
    constructor() {
        // Audio context and nodes
        this.audioContext = null;
        this.masterGain = null;
        
        // Sound layers for each style
        this.layers = {
            base: { source: null, gain: null, playing: false, buffer: null },
            texture: { source: null, gain: null, playing: false, buffer: null },
            accent: { source: null, gain: null, playing: false, buffer: null }
        };
        
        // Available soundscapes
        this.soundscapes = {
            cosmic: {
                name: 'Cosmic',
                description: 'Deep space ambience with subtle stellar sounds',
                baseFreq: 60,
                textureFreq: 0.1,
                accentFreq: 220,
                baseType: 'sine',
                textureType: 'sine',
                accentType: 'sine',
                defaultMix: { base: 1.0, texture: 0.7, accent: 0.4 }
            },
            meditation: {
                name: 'Meditation',
                description: 'Calming tones for reflection and mindfulness',
                baseFreq: 80,
                textureFreq: 0.2,
                accentFreq: 320,
                baseType: 'sine',
                textureType: 'triangle',
                accentType: 'sine',
                defaultMix: { base: 1.0, texture: 0.8, accent: 0.3 }
            },
            nature: {
                name: 'Nature',
                description: 'Gentle forest and water sounds',
                baseFreq: 100,
                textureFreq: 0.15,
                accentFreq: 420,
                baseType: 'triangle',
                textureType: 'sine',
                accentType: 'triangle',
                defaultMix: { base: 1.0, texture: 0.9, accent: 0.5 }
            },
            minimal: {
                name: 'Minimal',
                description: 'Subtle, unobtrusive background tones',
                baseFreq: 40,
                textureFreq: 0.05,
                accentFreq: 180,
                baseType: 'sine',
                textureType: 'sine',
                accentType: 'sine',
                defaultMix: { base: 0.8, texture: 0.4, accent: 0.2 }
            },
            ocean: {
                name: 'Ocean',
                description: 'Deep ocean waves and underwater ambience',
                baseFreq: 50,
                textureFreq: 0.08,
                accentFreq: 200,
                baseType: 'sine',
                textureType: 'triangle',
                accentType: 'sine',
                defaultMix: { base: 0.9, texture: 0.6, accent: 0.3 }
            },
            night: {
                name: 'Night',
                description: 'Nocturnal atmosphere with cricket-like sounds',
                baseFreq: 70,
                textureFreq: 0.12,
                accentFreq: 800,
                baseType: 'sine',
                textureType: 'sine',
                accentType: 'sawtooth',
                defaultMix: { base: 0.7, texture: 0.5, accent: 0.2 }
            }
        };
        
        // Current state
        this.currentSoundscape = 'cosmic';
        this.previousSoundscape = null;
        this.masterVolume = 0.3;
        this.layerMix = { base: 1.0, texture: 0.7, accent: 0.4 };
        this.initialized = false;
        this.isPlaying = false;
        
        // Transition state
        this.isTransitioning = false;
        this.transitionProgress = 0;
        this.transitionDuration = 5000; // 5 seconds
        this.transitionStartTime = 0;
        
        // Auto-change settings
        this.autoChangeEnabled = true;
        this.minChangeInterval = 60000; // 1 minute
        this.maxChangeInterval = 180000; // 3 minutes
        this.nextChangeTime = 0;
        
        // Event callbacks
        this.onSoundscapeChange = null;
        this.onPlayStateChange = null;
        this.onVolumeChange = null;
    }
    
    /**
     * Initialize the audio system
     * @returns {Promise<boolean>} Success status
     */
    async initialize() {
        if (this.initialized) return true;
        
        try {
            // Create audio context
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // Create master gain node
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.masterVolume;
            this.masterGain.connect(this.audioContext.destination);
            
            // Create gain nodes for each layer
            for (const layer in this.layers) {
                this.layers[layer].gain = this.audioContext.createGain();
                this.layers[layer].gain.connect(this.masterGain);
                this.layers[layer].gain.gain.value = this.layerMix[layer];
            }
            
            // Resume audio context if suspended
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            this.initialized = true;
            console.log('Dynamic Ambient Sound System initialized');
            
            // Schedule first auto-change
            this.scheduleNextSoundscapeChange();
            
            return true;
        } catch (error) {
            console.error('Failed to initialize audio system:', error);
            return false;
        }
    }
    
    /**
     * Play the current soundscape
     * @returns {Promise<boolean>} Success status
     */
    async play() {
        if (!this.initialized) {
            const success = await this.initialize();
            if (!success) return false;
        }
        
        try {
            // Stop any currently playing sounds
            this.stop();
            
            // Create oscillator nodes for each layer
            this.createOscillatorLayers(this.currentSoundscape);
            
            this.isPlaying = true;
            
            // Notify play state change
            if (this.onPlayStateChange) {
                this.onPlayStateChange(true);
            }
            
            console.log(`Playing ${this.soundscapes[this.currentSoundscape].name} soundscape`);
            return true;
        } catch (error) {
            console.error('Error playing soundscape:', error);
            return false;
        }
    }
    
    /**
     * Stop all ambient sounds
     */
    stop() {
        // Stop all layer sources
        for (const layer in this.layers) {
            if (this.layers[layer].source) {
                try {
                    this.layers[layer].source.stop();
                    this.layers[layer].source.disconnect();
                    this.layers[layer].source = null;
                } catch (e) {
                    // Ignore if already stopped
                }
                this.layers[layer].playing = false;
            }
        }
        
        this.isPlaying = false;
        this.isTransitioning = false;
        
        // Notify play state change
        if (this.onPlayStateChange) {
            this.onPlayStateChange(false);
        }
        
        console.log('Ambient sound stopped');
    }
    
    /**
     * Set master volume level
     * @param {number} volume Volume level (0-1)
     */
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
        
        // Notify volume change
        if (this.onVolumeChange) {
            this.onVolumeChange(this.masterVolume);
        }
        
        console.log(`Master volume set to ${this.masterVolume}`);
    }
    
    /**
     * Set layer mix levels
     * @param {Object} mix Layer mix levels {base, texture, accent}
     */
    setLayerMix(mix) {
        for (const layer in mix) {
            if (this.layers[layer] && this.layers[layer].gain) {
                this.layerMix[layer] = Math.max(0, Math.min(1, mix[layer]));
                this.layers[layer].gain.gain.value = this.layerMix[layer];
            }
        }
        
        console.log('Layer mix updated:', this.layerMix);
    }
    
    /**
     * Change to a specific soundscape
     * @param {string} soundscapeName Name of soundscape to change to
     * @param {boolean} withTransition Whether to transition smoothly
     * @returns {Promise<boolean>} Success status
     */
    async changeSoundscape(soundscapeName, withTransition = true) {
        if (!this.soundscapes[soundscapeName]) {
            console.error(`Soundscape "${soundscapeName}" not found`);
            return false;
        }
        
        // Don't change if it's the same soundscape
        if (soundscapeName === this.currentSoundscape) {
            return true;
        }
        
        this.previousSoundscape = this.currentSoundscape;
        this.currentSoundscape = soundscapeName;
        
        // If not playing, just update the current soundscape
        if (!this.isPlaying) {
            // Notify soundscape change
            if (this.onSoundscapeChange) {
                this.onSoundscapeChange(this.currentSoundscape);
            }
            
            console.log(`Soundscape changed to ${this.soundscapes[soundscapeName].name}`);
            return true;
        }
        
        // If transition not requested, just play the new soundscape
        if (!withTransition) {
            return this.play();
        }
        
        // Start transition
        return this.startTransition();
    }
    
    /**
     * Start transition between soundscapes
     * @returns {Promise<boolean>} Success status
     */
    async startTransition() {
        if (!this.initialized) {
            const success = await this.initialize();
            if (!success) return false;
        }
        
        try {
            // Create new oscillator layers for target soundscape
            const targetLayers = {};
            const targetSoundscape = this.soundscapes[this.currentSoundscape];
            
            for (const layer in this.layers) {
                // Create gain node for new layer
                const newGain = this.audioContext.createGain();
                newGain.gain.value = 0; // Start at zero volume
                newGain.connect(this.masterGain);
                
                // Create oscillator
                const oscillator = this.audioContext.createOscillator();
                oscillator.type = targetSoundscape[`${layer}Type`];
                oscillator.frequency.value = targetSoundscape[`${layer}Freq`];
                
                // Add modulation for texture layer
                if (layer === 'texture') {
                    const modGain = this.audioContext.createGain();
                    modGain.gain.value = 10; // Modulation amount
                    
                    const modOsc = this.audioContext.createOscillator();
                    modOsc.type = 'sine';
                    modOsc.frequency.value = 0.1; // Very slow modulation
                    
                    modOsc.connect(modGain);
                    modGain.connect(oscillator.frequency);
                    modOsc.start();
                    
                    targetLayers[`${layer}Mod`] = modOsc;
                }
                
                // Connect and start oscillator
                oscillator.connect(newGain);
                oscillator.start();
                
                // Store references
                targetLayers[layer] = {
                    oscillator,
                    gain: newGain
                };
            }
            
            // Start transition
            this.isTransitioning = true;
            this.transitionStartTime = this.audioContext.currentTime;
            
            // Perform the transition
            await this.performTransition(targetLayers);
            
            // Notify soundscape change
            if (this.onSoundscapeChange) {
                this.onSoundscapeChange(this.currentSoundscape);
            }
            
            console.log(`Transitioned to ${this.soundscapes[this.currentSoundscape].name} soundscape`);
            return true;
        } catch (error) {
            console.error('Error during soundscape transition:', error);
            return false;
        }
    }
    
    /**
     * Perform the actual transition between soundscapes
     * @param {Object} targetLayers Target oscillator layers
     * @returns {Promise<void>}
     */
    async performTransition(targetLayers) {
        return new Promise((resolve) => {
            const startTime = this.audioContext.currentTime;
            const duration = this.transitionDuration / 1000; // Convert to seconds
            
            // Fade out current layers
            for (const layer in this.layers) {
                if (this.layers[layer].gain) {
                    this.layers[layer].gain.gain.setValueAtTime(
                        this.layers[layer].gain.gain.value,
                        startTime
                    );
                    this.layers[layer].gain.gain.linearRampToValueAtTime(
                        0,
                        startTime + duration
                    );
                }
            }
            
            // Fade in new layers
            for (const layer in targetLayers) {
                if (layer.includes('Mod')) continue; // Skip modulation oscillators
                
                const targetVolume = this.layerMix[layer] || 0.5;
                targetLayers[layer].gain.gain.setValueAtTime(0, startTime);
                targetLayers[layer].gain.gain.linearRampToValueAtTime(
                    targetVolume,
                    startTime + duration
                );
            }
            
            // Wait for transition to complete
            setTimeout(() => {
                // Stop old layers
                for (const layer in this.layers) {
                    if (this.layers[layer].source) {
                        try {
                            this.layers[layer].source.stop();
                            this.layers[layer].source.disconnect();
                        } catch (e) {
                            // Ignore if already stopped
                        }
                    }
                }
                
                // Update layers with new oscillators
                for (const layer in this.layers) {
                    if (targetLayers[layer]) {
                        this.layers[layer].source = targetLayers[layer].oscillator;
                        this.layers[layer].gain = targetLayers[layer].gain;
                        this.layers[layer].playing = true;
                    }
                }
                
                this.isTransitioning = false;
                resolve();
            }, this.transitionDuration);
        });
    }
    
    /**
     * Create oscillator layers for a soundscape
     * @param {string} soundscapeName Name of soundscape
     */
    createOscillatorLayers(soundscapeName) {
        const soundscape = this.soundscapes[soundscapeName];
        
        // Base layer (low frequency foundation)
        const baseOscillator = this.audioContext.createOscillator();
        baseOscillator.type = soundscape.baseType;
        baseOscillator.frequency.value = soundscape.baseFreq;
        baseOscillator.connect(this.layers.base.gain);
        baseOscillator.start();
        this.layers.base.source = baseOscillator;
        this.layers.base.playing = true;
        
        // Texture layer (slow modulation for movement)
        const textureOscillator = this.audioContext.createOscillator();
        textureOscillator.type = soundscape.textureType;
        textureOscillator.frequency.value = soundscape.baseFreq * 1.5;
        
        // Add modulation to texture layer
        const modOscillator = this.audioContext.createOscillator();
        const modGain = this.audioContext.createGain();
        modOscillator.type = 'sine';
        modOscillator.frequency.value = soundscape.textureFreq;
        modGain.gain.value = 10; // Modulation amount
        
        modOscillator.connect(modGain);
        modGain.connect(textureOscillator.frequency);
        textureOscillator.connect(this.layers.texture.gain);
        
        modOscillator.start();
        textureOscillator.start();
        
        this.layers.texture.source = textureOscillator;
        this.layers.texture.modSource = modOscillator;
        this.layers.texture.playing = true;
        
        // Accent layer (higher frequency details)
        const accentOscillator = this.audioContext.createOscillator();
        accentOscillator.type = soundscape.accentType;
        accentOscillator.frequency.value = soundscape.accentFreq;
        
        // Add subtle randomness to accent layer
        const randomMod = this.audioContext.createOscillator();
        const randomGain = this.audioContext.createGain();
        randomMod.type = 'triangle';
        randomMod.frequency.value = 0.2 + (Math.random() * 0.3); // Random slow modulation
        randomGain.gain.value = 20 + (Math.random() * 30); // Random modulation amount
        
        randomMod.connect(randomGain);
        randomGain.connect(accentOscillator.frequency);
        accentOscillator.connect(this.layers.accent.gain);
        
        randomMod.start();
        accentOscillator.start();
        
        this.layers.accent.source = accentOscillator;
        this.layers.accent.modSource = randomMod;
        this.layers.accent.playing = true;
    }
    
    /**
     * Toggle auto-change feature
     * @param {boolean} enabled Whether auto-change should be enabled
     */
    setAutoChange(enabled) {
        this.autoChangeEnabled = enabled;
        
        if (enabled) {
            this.scheduleNextSoundscapeChange();
        }
        
        console.log(`Auto-change ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Schedule the next automatic soundscape change
     */
    scheduleNextSoundscapeChange() {
        if (!this.autoChangeEnabled) return;
        
        // Clear any existing timeout
        if (this.changeTimeout) {
            clearTimeout(this.changeTimeout);
        }
        
        // Calculate random interval within min-max range
        const interval = this.minChangeInterval + 
            Math.random() * (this.maxChangeInterval - this.minChangeInterval);
        
        this.nextChangeTime = Date.now() + interval;
        
        this.changeTimeout = setTimeout(() => {
            this.changeToRandomSoundscape();
        }, interval);
        
        console.log(`Next soundscape change scheduled in ${Math.round(interval / 1000)} seconds`);
    }
    
    /**
     * Change to a random soundscape different from the current one
     */
    changeToRandomSoundscape() {
        // Get all soundscape names except current
        const availableSoundscapes = Object.keys(this.soundscapes)
            .filter(name => name !== this.currentSoundscape);
        
        if (availableSoundscapes.length === 0) return;
        
        // Select random soundscape
        const randomIndex = Math.floor(Math.random() * availableSoundscapes.length);
        const newSoundscape = availableSoundscapes[randomIndex];
        
        // Change to new soundscape
        this.changeSoundscape(newSoundscape, true)
            .then(() => {
                // Schedule next change
                this.scheduleNextSoundscapeChange();
            });
    }
    
    /**
     * Set auto-change interval range
     * @param {number} minSeconds Minimum seconds between changes
     * @param {number} maxSeconds Maximum seconds between changes
     */
    setChangeInterval(minSeconds, maxSeconds) {
        this.minChangeInterval = minSeconds * 1000;
        this.maxChangeInterval = maxSeconds * 1000;
        
        // Reschedule next change with new interval
        if (this.autoChangeEnabled) {
            this.scheduleNextSoundscapeChange();
        }
        
        console.log(`Change interval set to ${minSeconds}-${maxSeconds} seconds`);
    }
    
    /**
     * Get information about current state
     * @returns {Object} Current state information
     */
    getState() {
        return {
            initialized: this.initialized,
            isPlaying: this.isPlaying,
            isTransitioning: this.isTransitioning,
            currentSoundscape: this.currentSoundscape,
            previousSoundscape: this.previousSoundscape,
            soundscapeName: this.soundscapes[this.currentSoundscape]?.name || 'Unknown',
            masterVolume: this.masterVolume,
            layerMix: { ...this.layerMix },
            autoChangeEnabled: this.autoChangeEnabled,
            nextChangeIn: this.nextChangeTime ? Math.max(0, Math.round((this.nextChangeTime - Date.now()) / 1000)) : 0,
            availableSoundscapes: Object.keys(this.soundscapes).map(key => ({
                id: key,
                name: this.soundscapes[key].name,
                description: this.soundscapes[key].description
            }))
        };
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        this.stop();
        
        if (this.changeTimeout) {
            clearTimeout(this.changeTimeout);
        }
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        this.initialized = false;
        console.log('Dynamic Ambient Sound System disposed');
    }
}
