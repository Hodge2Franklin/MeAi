/**
 * AudioManager.js
 * Comprehensive audio system for MeAi enhanced implementation
 * Handles ambient sound, speech synthesis, and audio effects
 */

class AudioManager {
  /**
   * Initialize the AudioManager
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    // Default options
    this.options = {
      enabled: true,
      volume: 0.5, // Master volume (0.0-1.0)
      ambientVolume: 0.3, // Ambient sound volume (0.0-1.0)
      speechVolume: 0.8, // Speech synthesis volume (0.0-1.0)
      effectsVolume: 0.6, // Sound effects volume (0.0-1.0)
      ...options
    };
    
    // Initialize audio context
    this.initAudioContext();
    
    // Initialize speech synthesis
    this.initSpeechSynthesis();
    
    // Track active sounds
    this.activeSounds = {
      ambient: null,
      effects: {}
    };
    
    // Audio buffers cache
    this.buffers = {};
    
    // Bind methods
    this.playAmbient = this.playAmbient.bind(this);
    this.stopAmbient = this.stopAmbient.bind(this);
    this.speak = this.speak.bind(this);
    this.playEffect = this.playEffect.bind(this);
  }
  
  /**
   * Initialize Web Audio API context
   * @private
   */
  initAudioContext() {
    try {
      // Create audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      
      // Create master gain node
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.options.volume;
      this.masterGain.connect(this.audioContext.destination);
      
      // Create separate gain nodes for different audio types
      this.ambientGain = this.audioContext.createGain();
      this.ambientGain.gain.value = this.options.ambientVolume;
      this.ambientGain.connect(this.masterGain);
      
      this.effectsGain = this.audioContext.createGain();
      this.effectsGain.gain.value = this.options.effectsVolume;
      this.effectsGain.connect(this.masterGain);
      
      this.audioSupported = true;
    } catch (error) {
      console.error('Audio context initialization failed:', error);
      this.audioSupported = false;
    }
  }
  
  /**
   * Initialize speech synthesis
   * @private
   */
  initSpeechSynthesis() {
    this.speechSupported = 'speechSynthesis' in window;
    
    if (this.speechSupported) {
      // Get available voices
      this.voices = [];
      
      // Function to set voices
      const setVoices = () => {
        this.voices = window.speechSynthesis.getVoices();
      };
      
      // Set voices immediately if available
      setVoices();
      
      // Listen for voiceschanged event
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = setVoices;
      }
    }
  }
  
  /**
   * Resume audio context (must be called from user gesture)
   * @returns {Promise} Resolves when audio context is resumed
   */
  async resumeAudioContext() {
    if (!this.audioSupported || !this.audioContext) {
      return false;
    }
    
    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        return true;
      } catch (error) {
        console.error('Failed to resume audio context:', error);
        return false;
      }
    }
    
    return this.audioContext.state === 'running';
  }
  
  /**
   * Check if audio is supported
   * @returns {boolean} Whether audio is supported
   */
  isAudioSupported() {
    return this.audioSupported;
  }
  
  /**
   * Check if speech synthesis is supported
   * @returns {boolean} Whether speech synthesis is supported
   */
  isSpeechSupported() {
    return this.speechSupported;
  }
  
  /**
   * Set master volume
   * @param {number} volume - Volume level (0.0-1.0)
   */
  setVolume(volume) {
    // Clamp volume between 0 and 1
    this.options.volume = Math.max(0, Math.min(1, volume));
    
    if (this.audioSupported && this.masterGain) {
      this.masterGain.gain.value = this.options.volume;
    }
    
    return this;
  }
  
  /**
   * Set ambient sound volume
   * @param {number} volume - Volume level (0.0-1.0)
   */
  setAmbientVolume(volume) {
    // Clamp volume between 0 and 1
    this.options.ambientVolume = Math.max(0, Math.min(1, volume));
    
    if (this.audioSupported && this.ambientGain) {
      this.ambientGain.gain.value = this.options.ambientVolume;
    }
    
    return this;
  }
  
  /**
   * Set effects volume
   * @param {number} volume - Volume level (0.0-1.0)
   */
  setEffectsVolume(volume) {
    // Clamp volume between 0 and 1
    this.options.effectsVolume = Math.max(0, Math.min(1, volume));
    
    if (this.audioSupported && this.effectsGain) {
      this.effectsGain.gain.value = this.options.effectsVolume;
    }
    
    return this;
  }
  
  /**
   * Set speech synthesis volume
   * @param {number} volume - Volume level (0.0-1.0)
   */
  setSpeechVolume(volume) {
    // Clamp volume between 0 and 1
    this.options.speechVolume = Math.max(0, Math.min(1, volume));
    return this;
  }
  
  /**
   * Enable or disable audio
   * @param {boolean} enabled - Whether audio is enabled
   */
  setEnabled(enabled) {
    this.options.enabled = enabled;
    
    // Stop all audio if disabled
    if (!enabled) {
      this.stopAll();
    }
    
    return this;
  }
  
  /**
   * Load audio file
   * @param {string} url - Audio file URL
   * @param {string} id - Identifier for the audio buffer
   * @returns {Promise} Resolves with the loaded buffer
   */
  async loadAudio(url, id) {
    if (!this.audioSupported) {
      return null;
    }
    
    // Return cached buffer if available
    if (this.buffers[id]) {
      return this.buffers[id];
    }
    
    try {
      // Fetch audio file
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      
      // Decode audio data
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      // Cache buffer
      this.buffers[id] = audioBuffer;
      
      return audioBuffer;
    } catch (error) {
      console.error(`Failed to load audio ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Generate ambient sound
   * @private
   * @returns {AudioBufferSourceNode} Audio source node
   */
  generateAmbientSound() {
    if (!this.audioSupported) {
      return null;
    }
    
    try {
      // Create buffer for 5 seconds of audio
      const bufferSize = this.audioContext.sampleRate * 5;
      const buffer = this.audioContext.createBuffer(
        2, // Stereo
        bufferSize,
        this.audioContext.sampleRate
      );
      
      // Fill buffer with gentle noise
      for (let channel = 0; channel < 2; channel++) {
        const data = buffer.getChannelData(channel);
        
        for (let i = 0; i < bufferSize; i++) {
          // Generate soft noise with occasional gentle swells
          const phase = i / bufferSize;
          const noise = Math.random() * 2 - 1;
          const envelope = 0.03 + 0.02 * Math.sin(phase * Math.PI * 2);
          
          data[i] = noise * envelope;
        }
      }
      
      // Create source node
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      
      // Apply low-pass filter for softer sound
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 500;
      filter.Q.value = 1;
      
      // Connect nodes
      source.connect(filter);
      filter.connect(this.ambientGain);
      
      return source;
    } catch (error) {
      console.error('Failed to generate ambient sound:', error);
      return null;
    }
  }
  
  /**
   * Play ambient sound
   * @returns {boolean} Whether ambient sound was started successfully
   */
  playAmbient() {
    if (!this.audioSupported || !this.options.enabled) {
      return false;
    }
    
    // Stop current ambient sound if playing
    this.stopAmbient();
    
    try {
      // Generate ambient sound
      const source = this.generateAmbientSound();
      
      if (!source) {
        return false;
      }
      
      // Start playback
      source.start();
      
      // Store reference
      this.activeSounds.ambient = source;
      
      return true;
    } catch (error) {
      console.error('Failed to play ambient sound:', error);
      return false;
    }
  }
  
  /**
   * Stop ambient sound
   * @returns {boolean} Whether ambient sound was stopped successfully
   */
  stopAmbient() {
    if (!this.audioSupported || !this.activeSounds.ambient) {
      return false;
    }
    
    try {
      // Stop playback
      this.activeSounds.ambient.stop();
      this.activeSounds.ambient = null;
      
      return true;
    } catch (error) {
      console.error('Failed to stop ambient sound:', error);
      return false;
    }
  }
  
  /**
   * Generate harmonic sound
   * @param {number} frequency - Base frequency in Hz
   * @param {number} duration - Duration in seconds
   * @returns {AudioBufferSourceNode} Audio source node
   */
  generateHarmonicSound(frequency = 220, duration = 2) {
    if (!this.audioSupported) {
      return null;
    }
    
    try {
      // Create oscillator
      const oscillator = this.audioContext.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      
      // Create gain node for envelope
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = 0;
      
      // Set envelope
      const now = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.1);
      gainNode.gain.linearRampToValueAtTime(0.2, now + 0.3);
      gainNode.gain.linearRampToValueAtTime(0, now + duration);
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(this.effectsGain);
      
      // Start oscillator
      oscillator.start();
      oscillator.stop(now + duration);
      
      // Clean up after playback
      setTimeout(() => {
        oscillator.disconnect();
        gainNode.disconnect();
      }, duration * 1000);
      
      return oscillator;
    } catch (error) {
      console.error('Failed to generate harmonic sound:', error);
      return null;
    }
  }
  
  /**
   * Play sound effect
   * @param {string} id - Effect identifier or buffer ID
   * @param {Object} options - Playback options
   * @returns {string} Playback ID or null if failed
   */
  playEffect(id, options = {}) {
    if (!this.audioSupported || !this.options.enabled) {
      return null;
    }
    
    // Default options
    const defaultOptions = {
      loop: false,
      volume: 1.0,
      playbackRate: 1.0
    };
    
    const playbackOptions = { ...defaultOptions, ...options };
    
    try {
      let source;
      
      // Handle special effects
      if (id === 'harmonic') {
        source = this.generateHarmonicSound(
          options.frequency || 220,
          options.duration || 2
        );
      } else if (id === 'insight') {
        // Insight is a special harmonic sound with rising frequency
        source = this.generateHarmonicSound(330, 3);
      } else {
        // Use loaded buffer
        if (!this.buffers[id]) {
          console.error(`Audio buffer ${id} not found`);
          return null;
        }
        
        // Create source node
        source = this.audioContext.createBufferSource();
        source.buffer = this.buffers[id];
        source.loop = playbackOptions.loop;
        source.playbackRate.value = playbackOptions.playbackRate;
        
        // Create gain node for volume
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = playbackOptions.volume;
        
        // Connect nodes
        source.connect(gainNode);
        gainNode.connect(this.effectsGain);
        
        // Start playback
        source.start();
      }
      
      if (!source) {
        return null;
      }
      
      // Generate playback ID
      const playbackId = `effect_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      // Store reference
      this.activeSounds.effects[playbackId] = source;
      
      // Remove reference when playback ends
      if (!playbackOptions.loop) {
        const duration = options.duration || 
          (this.buffers[id] ? this.buffers[id].duration : 2);
        
        setTimeout(() => {
          delete this.activeSounds.effects[playbackId];
        }, duration * 1000);
      }
      
      return playbackId;
    } catch (error) {
      console.error(`Failed to play effect ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Stop sound effect
   * @param {string} playbackId - Playback ID
   * @returns {boolean} Whether effect was stopped successfully
   */
  stopEffect(playbackId) {
    if (!this.audioSupported || !this.activeSounds.effects[playbackId]) {
      return false;
    }
    
    try {
      // Stop playback
      this.activeSounds.effects[playbackId].stop();
      delete this.activeSounds.effects[playbackId];
      
      return true;
    } catch (error) {
      console.error(`Failed to stop effect ${playbackId}:`, error);
      return false;
    }
  }
  
  /**
   * Stop all audio
   */
  stopAll() {
    // Stop ambient sound
    this.stopAmbient();
    
    // Stop all effects
    Object.keys(this.activeSounds.effects).forEach(id => {
      this.stopEffect(id);
    });
    
    // Stop speech
    if (this.speechSupported) {
      window.speechSynthesis.cancel();
    }
  }
  
  /**
   * Speak text using speech synthesis
   * @param {string} text - Text to speak
   * @param {Object} options - Speech options
   * @returns {Promise} Resolves when speech completes or fails
   */
  speak(text, options = {}) {
    if (!this.speechSupported || !this.options.enabled) {
      return Promise.reject(new Error('Speech synthesis not supported'));
    }
    
    // Default options
    const defaultOptions = {
      voice: null, // Use default voice
      rate: 0.9,   // Slightly slower than normal
      pitch: 1.0,
      volume: this.options.speechVolume
    };
    
    const speechOptions = { ...defaultOptions, ...options };
    
    return new Promise((resolve, reject) => {
      try {
        // Create utterance
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set options
        utterance.rate = speechOptions.rate;
        utterance.pitch = speechOptions.pitch;
        utterance.volume = speechOptions.volume;
        
        // Set voice if specified
        if (speechOptions.voice) {
          const voice = this.voices.find(v => 
            v.name === speechOptions.voice || 
            v.voiceURI === speechOptions.voice
          );
          
          if (voice) {
            utterance.voice = voice;
          }
        }
        
        // Handle events
        utterance.onend = () => resolve();
        utterance.onerror = (event) => reject(new Error(`Speech error: ${event.error}`));
        
        // Start speaking
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Get available voices
   * @returns {Array} Available voices
   */
  getVoices() {
    return this.voices || [];
  }
  
  /**
   * Get preferred voice for language
   * @param {string} lang - Language code (e.g., 'en-US')
   * @returns {SpeechSynthesisVoice|null} Preferred voice or null if not found
   */
  getPreferredVoice(lang = 'en-US') {
    if (!this.speechSupported || !this.voices.length) {
      return null;
    }
    
    // Try to find a voice that matches the language
    const matchingVoices = this.voices.filter(voice => 
      voice.lang.startsWith(lang.split('-')[0])
    );
    
    if (!matchingVoices.length) {
      return null;
    }
    
    // Prefer voices with exact language match
    const exactMatch = matchingVoices.find(voice => 
      voice.lang.toLowerCase() === lang.toLowerCase()
    );
    
    if (exactMatch) {
      return exactMatch;
    }
    
    // Otherwise, prefer default voices
    const defaultVoice = matchingVoices.find(voice => voice.default);
    
    if (defaultVoice) {
      return defaultVoice;
    }
    
    // Fall back to first matching voice
    return matchingVoices[0];
  }
  
  /**
   * Check if audio context is running
   * @returns {boolean} Whether audio context is running
   */
  isAudioContextRunning() {
    return this.audioSupported && 
           this.audioContext && 
           this.audioContext.state === 'running';
  }
  
  /**
   * Get audio context state
   * @returns {string|null} Audio context state or null if not supported
   */
  getAudioContextState() {
    return this.audioSupported && this.audioContext
      ? this.audioContext.state
      : null;
  }
}

// Export for use in other modules
export default AudioManager;
