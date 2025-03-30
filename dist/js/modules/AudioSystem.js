// AudioSystem.js - Manages ambient sounds and audio feedback

export default class AudioSystem {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.audioContext = null;
    this.masterGain = null;
    this.masterVolume = 0.5;
    this.sounds = {};
    this.ambients = {};
    this.currentAmbient = null;
    this.isAudioSupported = false;
  }

  init() {
    // Check for Web Audio API support
    this.isAudioSupported = 'AudioContext' in window || 'webkitAudioContext' in window;
    
    if (!this.isAudioSupported) {
      console.warn('Web Audio API is not supported in this browser');
      return;
    }
    
    // Create audio context
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      
      // Create master gain node
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.masterVolume;
      this.masterGain.connect(this.audioContext.destination);
      
      // Create sounds
      this.createSounds();
      
      console.log('AudioSystem initialized');
    } catch (error) {
      console.error('Failed to initialize AudioSystem:', error);
      this.isAudioSupported = false;
    }
  }

  update() {
    // Nothing to update in audio system
  }

  createSounds() {
    // Create basic sounds using oscillators and filters
    
    // Greeting sound - gentle rising tone
    this.sounds.greeting = {
      play: () => this.createTone(220, 440, 1.0, 'sine', 0.5)
    };
    
    // Responding sound - quick double tone
    this.sounds.responding = {
      play: () => this.createDoubleTone(330, 0.1, 0.1, 'triangle', 0.4)
    };
    
    // Insight sound - bright chord
    this.sounds.insight = {
      play: () => this.createChord([261.63, 329.63, 392.0], 1.0, 'sine', 0.5)
    };
    
    // Kairos sound - complex evolving tone
    this.sounds.kairos = {
      play: () => this.createEvolvingTone(110, 220, 3.0, 'sine', 0.6)
    };
    
    // Farewell sound - gentle falling tone
    this.sounds.farewell = {
      play: () => this.createTone(440, 220, 1.5, 'sine', 0.4)
    };
    
    // Chime sound - simple bell-like sound
    this.sounds.chime = {
      play: () => this.createChime(880, 1.0, 0.7)
    };
    
    // Pulse sound - short percussive sound
    this.sounds.pulse = {
      play: () => this.createPulse(60, 0.1, 0.5)
    };
    
    // Create ambient soundscape
    this.ambients.default = {
      play: () => this.createAmbientSoundscape(60, 0.2)
    };
  }

  // Utility method to create a simple tone
  createTone(startFreq, endFreq, duration, type = 'sine', volume = 0.5) {
    if (!this.isAudioSupported || !this.audioContext) return;
    
    // Create oscillator
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(endFreq, this.audioContext.currentTime + duration);
    
    // Create gain node for envelope
    const gainNode = this.audioContext.createGain();
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    // Start and stop oscillator
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
    
    return {
      oscillator,
      gainNode
    };
  }

  // Utility method to create a double tone
  createDoubleTone(frequency, duration, interval, type = 'sine', volume = 0.5) {
    if (!this.isAudioSupported || !this.audioContext) return;
    
    this.createTone(frequency, frequency, duration, type, volume);
    
    setTimeout(() => {
      this.createTone(frequency * 1.5, frequency * 1.5, duration, type, volume);
    }, interval * 1000);
  }

  // Utility method to create a chord
  createChord(frequencies, duration, type = 'sine', volume = 0.5) {
    if (!this.isAudioSupported || !this.audioContext) return;
    
    // Create gain node for envelope
    const gainNode = this.audioContext.createGain();
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);
    
    // Create oscillators for each frequency
    const oscillators = frequencies.map(freq => {
      const oscillator = this.audioContext.createOscillator();
      oscillator.type = type;
      oscillator.frequency.value = freq;
      oscillator.connect(gainNode);
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + duration);
      return oscillator;
    });
    
    // Connect gain node to master
    gainNode.connect(this.masterGain);
    
    return {
      oscillators,
      gainNode
    };
  }

  // Utility method to create an evolving tone
  createEvolvingTone(startFreq, endFreq, duration, type = 'sine', volume = 0.5) {
    if (!this.isAudioSupported || !this.audioContext) return;
    
    // Create oscillator
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext.currentTime + duration);
    
    // Create filter
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, this.audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(4000, this.audioContext.currentTime + duration);
    filter.Q.setValueAtTime(1, this.audioContext.currentTime);
    filter.Q.linearRampToValueAtTime(10, this.audioContext.currentTime + duration);
    
    // Create gain node for envelope
    const gainNode = this.audioContext.createGain();
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.2);
    gainNode.gain.linearRampToValueAtTime(volume * 0.8, this.audioContext.currentTime + duration * 0.5);
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);
    
    // Connect nodes
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    // Start and stop oscillator
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
    
    return {
      oscillator,
      filter,
      gainNode
    };
  }

  // Utility method to create a chime sound
  createChime(frequency, duration, volume = 0.5) {
    if (!this.isAudioSupported || !this.audioContext) return;
    
    // Create oscillator
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    
    // Create gain node for envelope
    const gainNode = this.audioContext.createGain();
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    // Start and stop oscillator
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
    
    return {
      oscillator,
      gainNode
    };
  }

  // Utility method to create a pulse sound
  createPulse(frequency, duration, volume = 0.5) {
    if (!this.isAudioSupported || !this.audioContext) return;
    
    // Create oscillator
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = 'square';
    oscillator.frequency.value = frequency;
    
    // Create filter
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;
    
    // Create gain node for envelope
    const gainNode = this.audioContext.createGain();
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
    
    // Connect nodes
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    // Start and stop oscillator
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
    
    return {
      oscillator,
      filter,
      gainNode
    };
  }

  // Utility method to create ambient soundscape
  createAmbientSoundscape(baseFreq, volume = 0.2) {
    if (!this.isAudioSupported || !this.audioContext) return;
    
    // Stop current ambient if playing
    this.stopAmbient();
    
    // Create nodes
    const oscillators = [];
    const filters = [];
    const gainNodes = [];
    
    // Create master gain for ambient
    const ambientGain = this.audioContext.createGain();
    ambientGain.gain.value = 0;
    ambientGain.connect(this.masterGain);
    
    // Create multiple oscillators for rich texture
    const frequencies = [
      baseFreq,
      baseFreq * 1.5,
      baseFreq * 2,
      baseFreq * 3,
      baseFreq * 4
    ];
    
    for (let i = 0; i < frequencies.length; i++) {
      // Create oscillator
      const oscillator = this.audioContext.createOscillator();
      oscillator.type = i % 2 === 0 ? 'sine' : 'triangle';
      oscillator.frequency.value = frequencies[i];
      
      // Add slight detuning for movement
      oscillator.detune.value = Math.random() * 10 - 5;
      
      // Create filter
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = frequencies[i];
      filter.Q.value = 10;
      
      // Create gain node
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = volume * (1 - i * 0.15); // Decrease volume for higher frequencies
      
      // Connect nodes
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ambientGain);
      
      // Start oscillator
      oscillator.start();
      
      // Store references
      oscillators.push(oscillator);
      filters.push(filter);
      gainNodes.push(gainNode);
      
      // Add LFO for subtle movement
      this.createLFO(filter.frequency, frequencies[i], frequencies[i] * 1.02, 10 + i * 3);
    }
    
    // Fade in ambient
    ambientGain.gain.setValueAtTime(0, this.audioContext.currentTime);
    ambientGain.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + 2);
    
    // Store current ambient
    this.currentAmbient = {
      oscillators,
      filters,
      gainNodes,
      masterGain: ambientGain
    };
    
    return this.currentAmbient;
  }

  // Utility method to create an LFO (Low Frequency Oscillator)
  createLFO(audioParam, minValue, maxValue, rate) {
    if (!this.isAudioSupported || !this.audioContext) return;
    
    const lfo = this.audioContext.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = rate;
    
    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.value = (maxValue - minValue) / 2;
    
    lfo.connect(lfoGain);
    lfoGain.connect(audioParam);
    
    // Set the audio param to the center value
    audioParam.value = minValue + (maxValue - minValue) / 2;
    
    lfo.start();
    
    return {
      oscillator: lfo,
      gain: lfoGain
    };
  }

  playSound(soundName) {
    if (!this.isAudioSupported || !this.audioContext) return false;
    
    const sound = this.sounds[soundName];
    if (!sound) {
      console.error(`Unknown sound: ${soundName}`);
      return false;
    }
    
    // Resume audio context if suspended
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    // Play the sound
    sound.play();
    
    return true;
  }

  playAmbient(ambientName) {
    if (!this.isAudioSupported || !this.audioContext) return false;
    
    const ambient = this.ambients[ambientName];
    if (!ambient) {
      console.error(`Unknown ambient: ${ambientName}`);
      return false;
    }
    
    // Resume audio context if suspended
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    // Play the ambient
    ambient.play();
    
    return true;
  }

  stopAmbient() {
    if (!this.currentAmbient) return;
    
    // Fade out
    this.currentAmbient.masterGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1);
    
    // Stop oscillators after fade out
    setTimeout(() => {
      if (!this.currentAmbient) return;
      
      this.currentAmbient.oscillators.forEach(osc => {
        try {
          osc.stop();
        } catch (e) {
          // Ignore errors if already stopped
        }
      });
      
      this.currentAmbient = null;
    }, 1100);
  }

  fadeInAmbient(duration = 2000) {
    if (!this.currentAmbient) {
      this.playAmbient('default');
    }
    
    if (!this.currentAmbient) return;
    
    // Fade in
    this.currentAmbient.masterGain.gain.cancelScheduledValues(this.audioContext.currentTime);
    this.currentAmbient.masterGain.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.currentAmbient.masterGain.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + duration / 1000);
  }

  fadeOut(duration = 2000) {
    if (!this.currentAmbient) return;
    
    // Fade out
    this.currentAmbient.masterGain.gain.cancelScheduledValues(this.audioContext.currentTime);
    this.currentAmbient.masterGain.gain.setValueAtTime(this.currentAmbient.masterGain.gain.value, this.audioContext.currentTime);
    this.currentAmbient.masterGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration / 1000);
  }

  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    
    if (this.masterGain) {
      this.masterGain.gain.value = this.masterVolume;
    }
    
    return this.masterVolume;
  }

  adjustVolume(volume) {
    return this.setMasterVolume(volume);
  }

  isSoundSupported() {
    return this.isAudioSupported;
  }
}
