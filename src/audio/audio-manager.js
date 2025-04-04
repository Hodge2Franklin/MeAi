// Self-hosted audio files for ambient sound
const AUDIO_FILES = {
    rain: {
        mp3: '/audio/gentle-rain.mp3',
        ogg: '/audio/gentle-rain.ogg',
        description: 'Gentle rain ambient sound'
    },
    space: {
        mp3: '/audio/space-ambient.mp3',
        ogg: '/audio/space-ambient.ogg',
        description: 'Deep space ambient sound'
    },
    forest: {
        mp3: '/audio/forest-ambient.mp3',
        ogg: '/audio/forest-ambient.ogg',
        description: 'Forest ambient sound'
    }
};

// Audio manager for handling all audio operations
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.gainNode = null;
        this.oscillatorSound = null;
        this.audioElement = null;
        this.currentSource = null;
        this.isPlaying = false;
        this.volume = 0.3;
        this.initialized = false;
        this.useOscillator = false;
    }

    // Initialize audio system
    async initialize() {
        if (this.initialized) return true;
        
        try {
            // Create audio context
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // Create master gain node
            this.gainNode = this.audioContext.createGain();
            this.gainNode.gain.value = this.volume;
            this.gainNode.connect(this.audioContext.destination);
            
            // Resume audio context if suspended
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            this.initialized = true;
            console.log('Audio system initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize audio system:', error);
            return false;
        }
    }

    // Set volume level (0-1)
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        if (this.gainNode) {
            this.gainNode.gain.value = this.volume;
        }
        
        if (this.audioElement) {
            this.audioElement.volume = this.volume;
        }
        
        if (this.oscillatorSound) {
            this.oscillatorSound.setVolume(this.volume);
        }
    }

    // Play ambient sound using HTML5 Audio
    async playAudioFile(type = 'rain') {
        if (this.useOscillator) {
            this.stopAmbientSound();
            this.useOscillator = false;
        }
        
        if (!this.initialized) {
            const success = await this.initialize();
            if (!success) return false;
        }
        
        try {
            // Stop any currently playing sound
            this.stopAmbientSound();
            
            // Create audio element if it doesn't exist
            if (!this.audioElement) {
                this.audioElement = new Audio();
                this.audioElement.loop = true;
                this.audioElement.volume = this.volume;
                
                // Connect to audio context for better control
                this.currentSource = this.audioContext.createMediaElementSource(this.audioElement);
                this.currentSource.connect(this.gainNode);
            }
            
            // Select audio format based on browser support
            const audioFile = this.getSupportedAudioFormat(type);
            if (!audioFile) {
                console.error('No supported audio format found');
                return this.playOscillatorSound(); // Fallback to oscillator
            }
            
            this.audioElement.src = audioFile;
            
            // Play the audio
            const playPromise = this.audioElement.play();
            
            if (playPromise !== undefined) {
                await playPromise;
                this.isPlaying = true;
                console.log(`Playing ambient sound: ${AUDIO_FILES[type].description}`);
                return true;
            }
        } catch (error) {
            console.error('Error playing audio file:', error);
            // Fallback to oscillator sound
            return this.playOscillatorSound();
        }
    }

    // Get supported audio format based on browser capabilities
    getSupportedAudioFormat(type) {
        if (!AUDIO_FILES[type]) {
            type = 'rain'; // Default to rain if type not found
        }
        
        const audio = new Audio();
        
        if (audio.canPlayType('audio/ogg') === 'probably' || 
            audio.canPlayType('audio/ogg') === 'maybe') {
            return AUDIO_FILES[type].ogg;
        }
        
        if (audio.canPlayType('audio/mpeg') === 'probably' || 
            audio.canPlayType('audio/mpeg') === 'maybe') {
            return AUDIO_FILES[type].mp3;
        }
        
        return null; // No supported format
    }

    // Play ambient sound using oscillator (fallback method)
    playOscillatorSound() {
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement = null;
        }
        
        if (!this.initialized) {
            const success = this.initialize();
            if (!success) return false;
        }
        
        try {
            // Stop any currently playing oscillator
            if (this.oscillatorSound) {
                this.oscillatorSound.stop();
            }
            
            // Create new oscillator sound
            this.oscillatorSound = this.createOscillatorAmbientSound();
            this.oscillatorSound.setVolume(this.volume);
            
            this.isPlaying = true;
            this.useOscillator = true;
            console.log('Playing oscillator-based ambient sound');
            return true;
        } catch (error) {
            console.error('Error playing oscillator sound:', error);
            return false;
        }
    }

    // Create oscillator-based ambient sound
    createOscillatorAmbientSound() {
        // Create oscillator nodes for base frequency and modulation
        const baseOscillator = this.audioContext.createOscillator();
        const modulationOscillator = this.audioContext.createOscillator();
        
        // Create gain nodes for volume control
        const baseGain = this.audioContext.createGain();
        const modulationGain = this.audioContext.createGain();
        const masterGain = this.audioContext.createGain();
        
        // Set up base oscillator (low frequency for ambient background)
        baseOscillator.type = 'sine';
        baseOscillator.frequency.value = 60; // Low frequency base
        baseGain.gain.value = 0.2;
        
        // Set up modulation oscillator (very slow modulation for natural feel)
        modulationOscillator.type = 'sine';
        modulationOscillator.frequency.value = 0.1; // Very slow modulation
        modulationGain.gain.value = 10; // Modulation amount
        
        // Connect modulation to base frequency
        modulationOscillator.connect(modulationGain);
        modulationGain.connect(baseOscillator.frequency);
        
        // Connect base oscillator to output
        baseOscillator.connect(baseGain);
        baseGain.connect(masterGain);
        masterGain.connect(this.gainNode);
        
        // Set master volume (low for ambient background)
        masterGain.gain.value = this.volume * 0.3; // Scale for comfortable listening
        
        // Start oscillators
        baseOscillator.start();
        modulationOscillator.start();
        
        // Return control object
        return {
            setVolume: (volume) => {
                masterGain.gain.value = volume * 0.3; // Scale for comfortable listening
            },
            stop: () => {
                try {
                    baseOscillator.stop();
                    modulationOscillator.stop();
                } catch (e) {
                    console.log('Oscillators already stopped');
                }
            }
        };
    }

    // Stop all ambient sounds
    stopAmbientSound() {
        if (this.audioElement) {
            this.audioElement.pause();
        }
        
        if (this.oscillatorSound) {
            this.oscillatorSound.stop();
            this.oscillatorSound = null;
        }
        
        this.isPlaying = false;
        console.log('Ambient sound stopped');
    }

    // Clean up resources
    dispose() {
        this.stopAmbientSound();
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        this.initialized = false;
    }
}
