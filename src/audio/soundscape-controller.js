/**
 * Soundscape Controller for MeAI
 * 
 * Features:
 * - Integrates dynamic ambient sound system with audio file manager
 * - Manages intermittent style changes with smart transitions
 * - Provides high-quality audio experience with fallbacks
 * - Creates unpredictable but pleasant variations
 * - Ensures ambient sound is never intrusive
 */

class SoundscapeController {
    constructor() {
        // Core components
        this.dynamicSystem = null;
        this.fileManager = null;
        
        // State
        this.initialized = false;
        this.isPlaying = false;
        this.currentSoundscape = 'cosmic';
        this.volume = 0.3; // Default to lower volume to be non-intrusive
        this.useFileAudio = true;
        this.useOscillatorAudio = true;
        
        // Style change settings
        this.autoChangeEnabled = true;
        this.minChangeInterval = 60; // 1 minute
        this.maxChangeInterval = 180; // 3 minutes
        this.nextChangeTime = 0;
        this.changeTimeout = null;
        
        // Transition settings
        this.transitionDuration = 5000; // 5 seconds
        
        // Available soundscapes
        this.soundscapes = [
            'cosmic',
            'meditation',
            'nature',
            'minimal',
            'ocean',
            'night'
        ];
        
        // Event callbacks
        this.onSoundscapeChange = null;
        this.onPlayStateChange = null;
        this.onVolumeChange = null;
        this.onError = null;
    }
    
    /**
     * Initialize the soundscape controller
     * @returns {Promise<boolean>} Success status
     */
    async initialize() {
        if (this.initialized) return true;
        
        try {
            // Create dynamic ambient sound system
            this.dynamicSystem = new DynamicAmbientSoundSystem();
            
            // Create audio file manager
            this.fileManager = new AudioFileManager();
            
            // Set up event handlers
            this.dynamicSystem.onSoundscapeChange = (soundscape) => {
                if (this.onSoundscapeChange) {
                    this.onSoundscapeChange(soundscape);
                }
            };
            
            this.dynamicSystem.onPlayStateChange = (isPlaying) => {
                this.isPlaying = isPlaying;
                if (this.onPlayStateChange) {
                    this.onPlayStateChange(isPlaying);
                }
            };
            
            this.fileManager.onPlayStateChange = (isPlaying) => {
                this.isPlaying = isPlaying;
                if (this.onPlayStateChange) {
                    this.onPlayStateChange(isPlaying);
                }
            };
            
            this.fileManager.onError = (type, message) => {
                console.warn(`Audio file error (${type}): ${message}`);
                
                // If file playback fails, fall back to oscillator
                if (type === 'play' && this.useOscillatorAudio) {
                    console.log('Falling back to oscillator-based audio');
                    this.playOscillatorSound();
                }
                
                if (this.onError) {
                    this.onError(type, message);
                }
            };
            
            // Initialize both systems
            const dynamicInitialized = await this.dynamicSystem.initialize();
            const fileInitialized = await this.fileManager.initialize();
            
            // Generate synthetic audio for testing if needed
            if (fileInitialized) {
                // Check if audio files exist
                const fileCheck = await this.fileManager.checkSoundscapeFiles('cosmic');
                if (!fileCheck.exists) {
                    console.log('No audio files found, generating synthetic audio');
                    for (const soundscape of this.soundscapes) {
                        await this.fileManager.generateSyntheticAudio(soundscape);
                    }
                }
            }
            
            this.initialized = dynamicInitialized || fileInitialized;
            
            if (this.initialized) {
                console.log('Soundscape Controller initialized successfully');
                
                // Configure auto-change settings
                this.dynamicSystem.setChangeInterval(this.minChangeInterval, this.maxChangeInterval);
                this.scheduleNextSoundscapeChange();
            } else {
                console.error('Failed to initialize Soundscape Controller');
            }
            
            return this.initialized;
        } catch (error) {
            console.error('Error initializing Soundscape Controller:', error);
            if (this.onError) {
                this.onError('initialization', error.message);
            }
            return false;
        }
    }
    
    /**
     * Play ambient sound
     * @returns {Promise<boolean>} Success status
     */
    async play() {
        if (!this.initialized) {
            const success = await this.initialize();
            if (!success) return false;
        }
        
        try {
            let success = false;
            
            // Try to play audio files first if enabled
            if (this.useFileAudio) {
                success = await this.playFileSound();
            }
            
            // Fall back to oscillator if file playback failed
            if (!success && this.useOscillatorAudio) {
                success = await this.playOscillatorSound();
            }
            
            if (success) {
                this.isPlaying = true;
                console.log(`Playing ${this.currentSoundscape} soundscape`);
            } else {
                console.error('Failed to play any ambient sound');
                if (this.onError) {
                    this.onError('play', 'Failed to play any ambient sound');
                }
            }
            
            return success;
        } catch (error) {
            console.error('Error playing ambient sound:', error);
            if (this.onError) {
                this.onError('play', error.message);
            }
            return false;
        }
    }
    
    /**
     * Play audio file-based sound
     * @returns {Promise<boolean>} Success status
     */
    async playFileSound() {
        try {
            // Preload the soundscape first
            await this.fileManager.preloadSoundscape(this.currentSoundscape);
            
            // Play the soundscape
            const success = await this.fileManager.playSoundscape(this.currentSoundscape, {
                base: 1.0,
                texture: 0.7,
                accent: 0.4,
                fadeIn: 2.0
            });
            
            return success;
        } catch (error) {
            console.error('Error playing file sound:', error);
            return false;
        }
    }
    
    /**
     * Play oscillator-based sound
     * @returns {Promise<boolean>} Success status
     */
    async playOscillatorSound() {
        try {
            const success = await this.dynamicSystem.play();
            return success;
        } catch (error) {
            console.error('Error playing oscillator sound:', error);
            return false;
        }
    }
    
    /**
     * Stop ambient sound
     */
    stop() {
        if (this.fileManager) {
            this.fileManager.stop();
        }
        
        if (this.dynamicSystem) {
            this.dynamicSystem.stop();
        }
        
        this.isPlaying = false;
        
        // Clear any pending change
        if (this.changeTimeout) {
            clearTimeout(this.changeTimeout);
            this.changeTimeout = null;
        }
        
        console.log('Ambient sound stopped');
    }
    
    /**
     * Set master volume level
     * @param {number} volume Volume level (0-1)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        if (this.fileManager) {
            this.fileManager.setVolume(this.volume);
        }
        
        if (this.dynamicSystem) {
            this.dynamicSystem.setVolume(this.volume);
        }
        
        if (this.onVolumeChange) {
            this.onVolumeChange(this.volume);
        }
        
        console.log(`Master volume set to ${this.volume}`);
    }
    
    /**
     * Change to a specific soundscape
     * @param {string} soundscape Soundscape name
     * @param {boolean} withTransition Whether to transition smoothly
     * @returns {Promise<boolean>} Success status
     */
    async changeSoundscape(soundscape, withTransition = true) {
        if (!this.soundscapes.includes(soundscape)) {
            console.error(`Soundscape "${soundscape}" not found`);
            return false;
        }
        
        // Don't change if it's the same soundscape
        if (soundscape === this.currentSoundscape) {
            return true;
        }
        
        const previousSoundscape = this.currentSoundscape;
        this.currentSoundscape = soundscape;
        
        // If not playing, just update the current soundscape
        if (!this.isPlaying) {
            if (this.onSoundscapeChange) {
                this.onSoundscapeChange(soundscape);
            }
            
            console.log(`Soundscape changed to ${soundscape}`);
            return true;
        }
        
        try {
            let success = false;
            
            // Update dynamic system first (even if not using it)
            if (this.dynamicSystem) {
                await this.dynamicSystem.changeSoundscape(soundscape, withTransition);
            }
            
            // If using file audio, handle transition
            if (this.useFileAudio) {
                if (withTransition) {
                    // Preload the new soundscape
                    await this.fileManager.preloadSoundscape(soundscape);
                    
                    // Fade out current audio
                    // (This would be better with proper crossfading, but simplified for now)
                    this.fileManager.stop();
                    
                    // Play new soundscape with fade-in
                    success = await this.fileManager.playSoundscape(soundscape, {
                        base: 1.0,
                        texture: 0.7,
                        accent: 0.4,
                        fadeIn: 2.0
                    });
                } else {
                    // Just stop and play
                    this.fileManager.stop();
                    success = await this.fileManager.playSoundscape(soundscape);
                }
            } else if (this.useOscillatorAudio) {
                // Dynamic system already handled the change
                success = true;
            }
            
            if (success) {
                if (this.onSoundscapeChange) {
                    this.onSoundscapeChange(soundscape);
                }
                
                console.log(`Soundscape changed to ${soundscape}`);
                
                // Schedule next change
                this.scheduleNextSoundscapeChange();
            } else {
                // Revert to previous soundscape on failure
                this.currentSoundscape = previousSoundscape;
                console.error(`Failed to change to ${soundscape} soundscape`);
                
                if (this.onError) {
                    this.onError('change', `Failed to change to ${soundscape} soundscape`);
                }
            }
            
            return success;
        } catch (error) {
            console.error(`Error changing soundscape to ${soundscape}:`, error);
            
            // Revert to previous soundscape on error
            this.currentSoundscape = previousSoundscape;
            
            if (this.onError) {
                this.onError('change', error.message);
            }
            
            return false;
        }
    }
    
    /**
     * Toggle auto-change feature
     * @param {boolean} enabled Whether auto-change should be enabled
     */
    setAutoChange(enabled) {
        this.autoChangeEnabled = enabled;
        
        if (this.dynamicSystem) {
            this.dynamicSystem.setAutoChange(enabled);
        }
        
        if (enabled) {
            this.scheduleNextSoundscapeChange();
        } else if (this.changeTimeout) {
            clearTimeout(this.changeTimeout);
            this.changeTimeout = null;
        }
        
        console.log(`Auto-change ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Set auto-change interval range
     * @param {number} minSeconds Minimum seconds between changes
     * @param {number} maxSeconds Maximum seconds between changes
     */
    setChangeInterval(minSeconds, maxSeconds) {
        this.minChangeInterval = minSeconds;
        this.maxChangeInterval = maxSeconds;
        
        if (this.dynamicSystem) {
            this.dynamicSystem.setChangeInterval(minSeconds, maxSeconds);
        }
        
        // Reschedule next change with new interval
        if (this.autoChangeEnabled) {
            this.scheduleNextSoundscapeChange();
        }
        
        console.log(`Change interval set to ${minSeconds}-${maxSeconds} seconds`);
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
        const interval = (this.minChangeInterval + 
            Math.random() * (this.maxChangeInterval - this.minChangeInterval)) * 1000;
        
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
        const availableSoundscapes = this.soundscapes.filter(name => 
            name !== this.currentSoundscape
        );
        
        if (availableSoundscapes.length === 0) return;
        
        // Select random soundscape
        const randomIndex = Math.floor(Math.random() * availableSoundscapes.length);
        const newSoundscape = availableSoundscapes[randomIndex];
        
        // Change to new soundscape
        this.changeSoundscape(newSoundscape, true)
            .then(() => {
                // Schedule next change (if not already scheduled by changeSoundscape)
                if (!this.changeTimeout) {
                    this.scheduleNextSoundscapeChange();
                }
            });
    }
    
    /**
     * Get information about current state
     * @returns {Object} Current state information
     */
    getState() {
        return {
            initialized: this.initialized,
            isPlaying: this.isPlaying,
            currentSoundscape: this.currentSoundscape,
            soundscapeName: this.getSoundscapeName(this.currentSoundscape),
            volume: this.volume,
            autoChangeEnabled: this.autoChangeEnabled,
            nextChangeIn: this.nextChangeTime ? Math.max(0, Math.round((this.nextChangeTime - Date.now()) / 1000)) : 0,
            availableSoundscapes: this.soundscapes.map(id => ({
                id,
                name: this.getSoundscapeName(id)
            })),
            usingFileAudio: this.useFileAudio && this.fileManager?.initialized,
            usingOscillatorAudio: this.useOscillatorAudio && this.dynamicSystem?.initialized
        };
    }
    
    /**
     * Get human-readable name for a soundscape
     * @param {string} soundscape Soundscape ID
     * @returns {string} Soundscape name
     */
    getSoundscapeName(soundscape) {
        if (this.dynamicSystem?.soundscapes[soundscape]) {
            return this.dynamicSystem.soundscapes[soundscape].name;
        }
        
        // Fallback names if dynamic system not available
        const names = {
            cosmic: 'Cosmic',
            meditation: 'Meditation',
            nature: 'Nature',
            minimal: 'Minimal',
            ocean: 'Ocean',
            night: 'Night'
        };
        
        return names[soundscape] || soundscape;
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        this.stop();
        
        if (this.changeTimeout) {
            clearTimeout(this.changeTimeout);
            this.changeTimeout = null;
        }
        
        if (this.fileManager) {
            this.fileManager.dispose();
            this.fileManager = null;
        }
        
        if (this.dynamicSystem) {
            this.dynamicSystem.dispose();
            this.dynamicSystem = null;
        }
        
        this.initialized = false;
        console.log('Soundscape Controller disposed');
    }
}
