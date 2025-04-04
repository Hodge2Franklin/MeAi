// Voice synthesis manager for MeAI
class VoiceSynthesisManager {
    constructor() {
        this.voices = [];
        this.selectedVoice = null;
        this.volume = 0.7;
        this.rate = 0.9;  // Slightly slower for goddess-like quality
        this.pitch = 1.2; // Slightly higher for feminine tone
        this.isSpeaking = false;
        this.initialized = false;
        this.pixel = null;
    }

    // Initialize voice synthesis
    initialize(pixelElement) {
        if (!('speechSynthesis' in window)) {
            console.error('Speech synthesis not supported');
            return false;
        }
        
        // Set pixel reference for animation
        this.pixel = pixelElement;
        
        // Load available voices
        this.loadVoices();
        
        // Handle voices changed event
        speechSynthesis.onvoiceschanged = () => this.loadVoices();
        
        this.initialized = true;
        return true;
    }

    // Load available voices and select appropriate female voice
    loadVoices() {
        this.voices = speechSynthesis.getVoices();
        
        if (this.voices.length === 0) {
            console.warn('No voices available yet, will retry');
            return;
        }
        
        console.log(`Loaded ${this.voices.length} voices`);
        
        // Try to find a good female voice in this priority order:
        // 1. English female voice with "female" in the name
        // 2. Any English female voice
        // 3. Any female voice
        // 4. Default voice
        
        // Priority 1: English female voice with "female" in the name
        this.selectedVoice = this.voices.find(voice => 
            voice.name.toLowerCase().includes('female') && 
            voice.lang.startsWith('en')
        );
        
        // Priority 2: Any English female voice
        if (!this.selectedVoice) {
            this.selectedVoice = this.voices.find(voice => 
                voice.name.toLowerCase().includes('female') || 
                voice.name.toLowerCase().includes('woman') ||
                voice.name.toLowerCase().includes('girl') ||
                (voice.name.toLowerCase().includes('samantha') && voice.lang.startsWith('en'))
            );
        }
        
        // Priority 3: Any female voice
        if (!this.selectedVoice) {
            this.selectedVoice = this.voices.find(voice => 
                voice.name.toLowerCase().includes('female') || 
                voice.name.toLowerCase().includes('woman') ||
                voice.name.toLowerCase().includes('girl') ||
                voice.name.toLowerCase().includes('samantha')
            );
        }
        
        // Priority 4: Default to first English voice or any voice
        if (!this.selectedVoice) {
            this.selectedVoice = this.voices.find(voice => voice.lang.startsWith('en')) || this.voices[0];
        }
        
        console.log(`Selected voice: ${this.selectedVoice ? this.selectedVoice.name : 'None'}`);
    }

    // Set volume level (0-1)
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    // Speak text with selected voice
    speak(text) {
        if (!this.initialized || !text) return false;
        
        // Cancel any current speech
        this.stop();
        
        try {
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Set voice properties
            if (this.selectedVoice) {
                utterance.voice = this.selectedVoice;
            }
            
            utterance.volume = this.volume;
            utterance.rate = this.rate;
            utterance.pitch = this.pitch;
            
            // Set event handlers
            utterance.onstart = () => {
                this.isSpeaking = true;
                if (this.pixel) {
                    this.pixel.classList.add('speaking');
                }
                console.log('Started speaking');
            };
            
            utterance.onend = () => {
                this.isSpeaking = false;
                if (this.pixel) {
                    this.pixel.classList.remove('speaking');
                }
                console.log('Finished speaking');
            };
            
            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event);
                this.isSpeaking = false;
                if (this.pixel) {
                    this.pixel.classList.remove('speaking');
                }
            };
            
            // Start speaking
            speechSynthesis.speak(utterance);
            return true;
        } catch (error) {
            console.error('Error speaking:', error);
            return false;
        }
    }

    // Stop speaking
    stop() {
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
            this.isSpeaking = false;
            if (this.pixel) {
                this.pixel.classList.remove('speaking');
            }
        }
    }

    // Test voice with a sample message
    testVoice() {
        const testMessages = [
            "Hello, I'm MeAI, your relational AI companion.",
            "I'm here to connect with you in a meaningful way.",
            "How are you feeling today? I'm here to listen.",
            "My voice is designed to be gentle and soothing, like a goddess speaking to you."
        ];
        
        const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)];
        return this.speak(randomMessage);
    }
}
