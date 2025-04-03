/**
 * Audio File Manager for MeAI
 * 
 * Features:
 * - Manages loading and playback of audio files
 * - Provides fallback to oscillator-based sounds
 * - Handles browser compatibility issues
 * - Supports multiple audio formats
 * - Integrates with the Dynamic Ambient Sound System
 */

class AudioFileManager {
    constructor() {
        // Audio context and nodes
        this.audioContext = null;
        this.masterGain = null;
        
        // Audio sources
        this.audioSources = {};
        this.audioBuffers = {};
        this.audioElements = {};
        
        // Audio files configuration
        this.audioFiles = {
            cosmic: {
                base: '/audio/ambient/cosmic_base.mp3',
                texture: '/audio/ambient/cosmic_texture.mp3',
                accent: '/audio/ambient/cosmic_accent.mp3'
            },
            meditation: {
                base: '/audio/ambient/meditation_base.mp3',
                texture: '/audio/ambient/meditation_texture.mp3',
                accent: '/audio/ambient/meditation_accent.mp3'
            },
            nature: {
                base: '/audio/ambient/nature_base.mp3',
                texture: '/audio/ambient/nature_texture.mp3',
                accent: '/audio/ambient/nature_accent.mp3'
            },
            minimal: {
                base: '/audio/ambient/minimal_base.mp3',
                texture: '/audio/ambient/minimal_texture.mp3',
                accent: '/audio/ambient/minimal_accent.mp3'
            },
            ocean: {
                base: '/audio/ambient/ocean_base.mp3',
                texture: '/audio/ambient/ocean_texture.mp3',
                accent: '/audio/ambient/ocean_accent.mp3'
            },
            night: {
                base: '/audio/ambient/night_base.mp3',
                texture: '/audio/ambient/night_texture.mp3',
                accent: '/audio/ambient/night_accent.mp3'
            }
        };
        
        // State
        this.initialized = false;
        this.isPlaying = false;
        this.currentSoundscape = 'cosmic';
        this.volume = 0.5;
        this.useWebAudio = true;
        this.useHTML5Audio = true;
        this.useOscillator = true;
        
        // Callbacks
        this.onPlayStateChange = null;
        this.onLoadProgress = null;
        this.onError = null;
    }
    
    /**
     * Initialize the audio file manager
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
            this.masterGain.gain.value = this.volume;
            this.masterGain.connect(this.audioContext.destination);
            
            // Resume audio context if suspended
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            // Check for HTML5 Audio support
            this.useHTML5Audio = typeof Audio !== 'undefined';
            
            this.initialized = true;
            console.log('Audio File Manager initialized');
            
            return true;
        } catch (error) {
            console.error('Failed to initialize Audio File Manager:', error);
            if (this.onError) this.onError('initialization', error.message);
            return false;
        }
    }
    
    /**
     * Preload audio files for a specific soundscape
     * @param {string} soundscape Soundscape name
     * @returns {Promise<boolean>} Success status
     */
    async preloadSoundscape(soundscape) {
        if (!this.initialized) {
            const success = await this.initialize();
            if (!success) return false;
        }
        
        if (!this.audioFiles[soundscape]) {
            console.error(`Soundscape "${soundscape}" not found`);
            return false;
        }
        
        try {
            const files = this.audioFiles[soundscape];
            const layers = Object.keys(files);
            let loadedCount = 0;
            
            // Create promises for all layers
            const loadPromises = layers.map(layer => {
                return this.loadAudioFile(files[layer], `${soundscape}_${layer}`)
                    .then(() => {
                        loadedCount++;
                        if (this.onLoadProgress) {
                            this.onLoadProgress(soundscape, loadedCount / layers.length);
                        }
                    })
                    .catch(error => {
                        console.warn(`Failed to load ${layer} for ${soundscape}:`, error);
                        return null; // Continue despite errors
                    });
            });
            
            // Wait for all files to load (or fail)
            await Promise.all(loadPromises);
            
            console.log(`Preloaded soundscape: ${soundscape}`);
            return true;
        } catch (error) {
            console.error(`Error preloading soundscape ${soundscape}:`, error);
            if (this.onError) this.onError('preload', error.message);
            return false;
        }
    }
    
    /**
     * Load an audio file into buffer
     * @param {string} url Audio file URL
     * @param {string} id Identifier for the audio file
     * @returns {Promise<AudioBuffer>} Loaded audio buffer
     */
    async loadAudioFile(url, id) {
        if (!this.initialized) {
            const success = await this.initialize();
            if (!success) throw new Error('Audio system not initialized');
        }
        
        // Check if already loaded
        if (this.audioBuffers[id]) {
            return this.audioBuffers[id];
        }
        
        try {
            // Fetch the audio file
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Get array buffer from response
            const arrayBuffer = await response.arrayBuffer();
            
            // Decode audio data
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            // Store in buffers
            this.audioBuffers[id] = audioBuffer;
            
            console.log(`Loaded audio file: ${id}`);
            return audioBuffer;
        } catch (error) {
            console.error(`Error loading audio file ${url}:`, error);
            
            // Create fallback HTML5 Audio element
            if (this.useHTML5Audio) {
                try {
                    const audio = new Audio(url);
                    await new Promise((resolve, reject) => {
                        audio.addEventListener('canplaythrough', resolve);
                        audio.addEventListener('error', reject);
                        audio.load();
                    });
                    
                    this.audioElements[id] = audio;
                    console.log(`Loaded audio file using HTML5 Audio: ${id}`);
                    return null; // No buffer, but HTML5 Audio is available
                } catch (htmlError) {
                    console.error(`Error loading HTML5 Audio ${url}:`, htmlError);
                }
            }
            
            if (this.onError) this.onError('load', `Failed to load ${id}: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Play audio for a specific soundscape
     * @param {string} soundscape Soundscape name
     * @param {Object} options Playback options
     * @returns {Promise<boolean>} Success status
     */
    async playSoundscape(soundscape, options = {}) {
        if (!this.initialized) {
            const success = await this.initialize();
            if (!success) return false;
        }
        
        if (!this.audioFiles[soundscape]) {
            console.error(`Soundscape "${soundscape}" not found`);
            return false;
        }
        
        // Stop any currently playing audio
        this.stop();
        
        try {
            const files = this.audioFiles[soundscape];
            const layers = Object.keys(files);
            let successCount = 0;
            
            // Try to play each layer
            for (const layer of layers) {
                const id = `${soundscape}_${layer}`;
                const volume = options[layer] || 1.0;
                
                // Try Web Audio API first
                if (this.useWebAudio && this.audioBuffers[id]) {
                    const success = this.playBufferSource(id, {
                        loop: true,
                        volume,
                        fadeIn: options.fadeIn
                    });
                    
                    if (success) {
                        successCount++;
                        continue;
                    }
                }
                
                // Try HTML5 Audio as fallback
                if (this.useHTML5Audio && this.audioElements[id]) {
                    const success = this.playHtmlAudio(id, {
                        loop: true,
                        volume
                    });
                    
                    if (success) {
                        successCount++;
                        continue;
                    }
                }
                
                console.warn(`Could not play ${layer} for ${soundscape}`);
            }
            
            // Update state
            this.currentSoundscape = soundscape;
            this.isPlaying = successCount > 0;
            
            // Notify play state change
            if (this.onPlayStateChange) {
                this.onPlayStateChange(this.isPlaying);
            }
            
            console.log(`Playing soundscape: ${soundscape} (${successCount}/${layers.length} layers)`);
            return successCount > 0;
        } catch (error) {
            console.error(`Error playing soundscape ${soundscape}:`, error);
            if (this.onError) this.onError('play', error.message);
            return false;
        }
    }
    
    /**
     * Play audio buffer source
     * @param {string} id Audio buffer ID
     * @param {Object} options Playback options
     * @returns {boolean} Success status
     */
    playBufferSource(id, options = {}) {
        if (!this.audioBuffers[id]) return false;
        
        try {
            // Create buffer source
            const source = this.audioContext.createBufferSource();
            source.buffer = this.audioBuffers[id];
            source.loop = options.loop || false;
            
            // Create gain node for this source
            const gainNode = this.audioContext.createGain();
            
            // Set initial volume (possibly 0 for fade-in)
            const initialVolume = options.fadeIn ? 0 : (options.volume || 1.0);
            gainNode.gain.value = initialVolume * this.volume;
            
            // Connect nodes
            source.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            // Start playback
            source.start(0);
            
            // Store source
            this.audioSources[id] = {
                source,
                gainNode,
                type: 'buffer'
            };
            
            // Handle fade-in if requested
            if (options.fadeIn) {
                const targetVolume = options.volume || 1.0;
                const fadeTime = typeof options.fadeIn === 'number' ? options.fadeIn : 2.0;
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(
                    targetVolume * this.volume,
                    this.audioContext.currentTime + fadeTime
                );
            }
            
            return true;
        } catch (error) {
            console.error(`Error playing buffer source ${id}:`, error);
            return false;
        }
    }
    
    /**
     * Play HTML5 Audio element
     * @param {string} id Audio element ID
     * @param {Object} options Playback options
     * @returns {boolean} Success status
     */
    playHtmlAudio(id, options = {}) {
        if (!this.audioElements[id]) return false;
        
        try {
            const audio = this.audioElements[id];
            
            // Configure audio element
            audio.loop = options.loop || false;
            audio.volume = (options.volume || 1.0) * this.volume;
            
            // Play audio
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error(`Error playing HTML5 Audio ${id}:`, error);
                });
            }
            
            // Store source
            this.audioSources[id] = {
                element: audio,
                type: 'html5'
            };
            
            return true;
        } catch (error) {
            console.error(`Error playing HTML5 Audio ${id}:`, error);
            return false;
        }
    }
    
    /**
     * Stop all playing audio
     */
    stop() {
        // Stop all buffer sources
        for (const id in this.audioSources) {
            const source = this.audioSources[id];
            
            if (source.type === 'buffer' && source.source) {
                try {
                    source.source.stop();
                    source.source.disconnect();
                } catch (e) {
                    // Ignore if already stopped
                }
            } else if (source.type === 'html5' && source.element) {
                try {
                    source.element.pause();
                    source.element.currentTime = 0;
                } catch (e) {
                    // Ignore if already stopped
                }
            }
        }
        
        // Clear sources
        this.audioSources = {};
        this.isPlaying = false;
        
        // Notify play state change
        if (this.onPlayStateChange) {
            this.onPlayStateChange(false);
        }
        
        console.log('All audio stopped');
    }
    
    /**
     * Set master volume level
     * @param {number} volume Volume level (0-1)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        // Update Web Audio API volume
        if (this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }
        
        // Update HTML5 Audio volumes
        for (const id in this.audioSources) {
            const source = this.audioSources[id];
            if (source.type === 'html5' && source.element) {
                source.element.volume = this.volume;
            }
        }
        
        console.log(`Master volume set to ${this.volume}`);
    }
    
    /**
     * Check if audio files exist for a soundscape
     * @param {string} soundscape Soundscape name
     * @returns {Promise<Object>} Status of each layer
     */
    async checkSoundscapeFiles(soundscape) {
        if (!this.audioFiles[soundscape]) {
            return { exists: false, layers: {} };
        }
        
        const files = this.audioFiles[soundscape];
        const layers = Object.keys(files);
        const results = { exists: false, layers: {} };
        let existCount = 0;
        
        for (const layer of layers) {
            const url = files[layer];
            try {
                const response = await fetch(url, { method: 'HEAD' });
                results.layers[layer] = response.ok;
                if (response.ok) existCount++;
            } catch (error) {
                results.layers[layer] = false;
            }
        }
        
        results.exists = existCount > 0;
        return results;
    }
    
    /**
     * Generate synthetic audio files for testing
     * @param {string} soundscape Soundscape name
     * @returns {Promise<boolean>} Success status
     */
    async generateSyntheticAudio(soundscape) {
        if (!this.initialized) {
            const success = await this.initialize();
            if (!success) return false;
        }
        
        if (!this.audioFiles[soundscape]) {
            console.error(`Soundscape "${soundscape}" not found`);
            return false;
        }
        
        try {
            const files = this.audioFiles[soundscape];
            const layers = Object.keys(files);
            
            for (const layer of layers) {
                const id = `${soundscape}_${layer}`;
                
                // Create offline audio context for rendering
                const offlineCtx = new OfflineAudioContext(
                    2, // Stereo
                    44100 * 10, // 10 seconds
                    44100 // Sample rate
                );
                
                // Create oscillator based on layer
                const oscillator = offlineCtx.createOscillator();
                const gainNode = offlineCtx.createGain();
                
                // Configure based on layer
                if (layer === 'base') {
                    oscillator.type = 'sine';
                    oscillator.frequency.value = 60 + (soundscape.charCodeAt(0) % 40); // Vary by soundscape
                    gainNode.gain.value = 0.3;
                } else if (layer === 'texture') {
                    oscillator.type = 'triangle';
                    oscillator.frequency.value = 120 + (soundscape.charCodeAt(0) % 60);
                    gainNode.gain.value = 0.2;
                    
                    // Add modulation
                    const modOsc = offlineCtx.createOscillator();
                    const modGain = offlineCtx.createGain();
                    modOsc.frequency.value = 0.1;
                    modGain.gain.value = 10;
                    modOsc.connect(modGain);
                    modGain.connect(oscillator.frequency);
                    modOsc.start();
                } else if (layer === 'accent') {
                    oscillator.type = 'sine';
                    oscillator.frequency.value = 240 + (soundscape.charCodeAt(0) % 100);
                    gainNode.gain.value = 0.1;
                }
                
                // Connect and start
                oscillator.connect(gainNode);
                gainNode.connect(offlineCtx.destination);
                oscillator.start();
                
                // Render audio
                const renderedBuffer = await offlineCtx.startRendering();
                
                // Store in buffers
                this.audioBuffers[id] = renderedBuffer;
                
                console.log(`Generated synthetic audio for ${id}`);
            }
            
            return true;
        } catch (error) {
            console.error(`Error generating synthetic audio for ${soundscape}:`, error);
            if (this.onError) this.onError('generate', error.message);
            return false;
        }
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        this.stop();
        
        // Clear audio buffers
        this.audioBuffers = {};
        
        // Clear audio elements
        for (const id in this.audioElements) {
            const audio = this.audioElements[id];
            audio.src = '';
        }
        this.audioElements = {};
        
        // Close audio context
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        this.initialized = false;
        console.log('Audio File Manager disposed');
    }
}
