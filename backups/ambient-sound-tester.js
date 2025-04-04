// Test ambient sound with multiple approaches
class AmbientSoundTester {
    constructor() {
        this.testResults = [];
        this.audioContext = null;
        this.oscillatorNode = null;
        this.gainNode = null;
        this.audioElement = null;
        this.bufferSource = null;
    }

    // Run all tests
    async runAllTests() {
        console.log('Starting ambient sound tests...');
        
        // Test Web Audio API support
        await this.testWebAudioSupport();
        
        // Test oscillator-based ambient sound
        await this.testOscillatorSound();
        
        // Test HTML5 Audio element
        await this.testHtml5Audio();
        
        // Test AudioBuffer approach
        await this.testAudioBuffer();
        
        // Test audio formats compatibility
        await this.testAudioFormats();
        
        // Log results
        this.logResults();
        
        return this.testResults;
    }

    // Test Web Audio API support
    async testWebAudioSupport() {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            this.testResults.push({
                name: 'Web Audio API Support',
                result: 'PASS',
                details: `AudioContext created successfully. Sample rate: ${this.audioContext.sampleRate}Hz`
            });
            
            // Test resuming context
            if (this.audioContext.state === 'suspended') {
                try {
                    await this.audioContext.resume();
                    this.testResults.push({
                        name: 'AudioContext Resume',
                        result: 'PASS',
                        details: 'AudioContext resumed successfully'
                    });
                } catch (e) {
                    this.testResults.push({
                        name: 'AudioContext Resume',
                        result: 'FAIL',
                        details: `Failed to resume AudioContext: ${e.message}`
                    });
                }
            } else {
                this.testResults.push({
                    name: 'AudioContext State',
                    result: 'PASS',
                    details: `AudioContext state is ${this.audioContext.state}`
                });
            }
        } catch (e) {
            this.testResults.push({
                name: 'Web Audio API Support',
                result: 'FAIL',
                details: `Failed to create AudioContext: ${e.message}`
            });
        }
    }

    // Test oscillator-based ambient sound
    async testOscillatorSound() {
        if (!this.audioContext) return;
        
        try {
            // Create oscillator
            this.oscillatorNode = this.audioContext.createOscillator();
            this.gainNode = this.audioContext.createGain();
            
            // Configure oscillator
            this.oscillatorNode.type = 'sine';
            this.oscillatorNode.frequency.value = 60; // Low frequency
            
            // Set very low volume for testing
            this.gainNode.gain.value = 0.01; // Almost inaudible
            
            // Connect nodes
            this.oscillatorNode.connect(this.gainNode);
            this.gainNode.connect(this.audioContext.destination);
            
            // Start oscillator
            this.oscillatorNode.start();
            
            // Wait a short time to test
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Stop oscillator
            this.oscillatorNode.stop();
            
            this.testResults.push({
                name: 'Oscillator Sound',
                result: 'PASS',
                details: 'Oscillator created and played successfully'
            });
        } catch (e) {
            this.testResults.push({
                name: 'Oscillator Sound',
                result: 'FAIL',
                details: `Failed to create or play oscillator: ${e.message}`
            });
        }
    }

    // Test HTML5 Audio element
    async testHtml5Audio() {
        try {
            this.audioElement = new Audio();
            
            // Test if Audio element was created
            if (this.audioElement instanceof HTMLAudioElement) {
                this.testResults.push({
                    name: 'HTML5 Audio Support',
                    result: 'PASS',
                    details: 'Audio element created successfully'
                });
                
                // Test audio properties and methods
                if (typeof this.audioElement.play === 'function' &&
                    typeof this.audioElement.pause === 'function' &&
                    'volume' in this.audioElement) {
                    this.testResults.push({
                        name: 'HTML5 Audio Methods',
                        result: 'PASS',
                        details: 'Audio element has required methods and properties'
                    });
                } else {
                    this.testResults.push({
                        name: 'HTML5 Audio Methods',
                        result: 'FAIL',
                        details: 'Audio element missing required methods or properties'
                    });
                }
            } else {
                this.testResults.push({
                    name: 'HTML5 Audio Support',
                    result: 'FAIL',
                    details: 'Failed to create proper Audio element'
                });
            }
        } catch (e) {
            this.testResults.push({
                name: 'HTML5 Audio Support',
                result: 'FAIL',
                details: `Failed to create Audio element: ${e.message}`
            });
        }
    }

    // Test AudioBuffer approach
    async testAudioBuffer() {
        if (!this.audioContext) return;
        
        try {
            // Create a short buffer with a simple sine wave
            const sampleRate = this.audioContext.sampleRate;
            const buffer = this.audioContext.createBuffer(1, sampleRate, sampleRate);
            const data = buffer.getChannelData(0);
            
            // Fill with a simple sine wave
            for (let i = 0; i < sampleRate; i++) {
                data[i] = Math.sin(i * 2 * Math.PI * 440 / sampleRate);
            }
            
            // Create buffer source
            this.bufferSource = this.audioContext.createBufferSource();
            this.bufferSource.buffer = buffer;
            
            // Create gain node with very low volume
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = 0.01; // Almost inaudible
            
            // Connect nodes
            this.bufferSource.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Start playing
            this.bufferSource.start();
            
            // Wait a short time to test
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Stop playing
            this.bufferSource.stop();
            
            this.testResults.push({
                name: 'AudioBuffer Playback',
                result: 'PASS',
                details: 'AudioBuffer created and played successfully'
            });
        } catch (e) {
            this.testResults.push({
                name: 'AudioBuffer Playback',
                result: 'FAIL',
                details: `Failed to create or play AudioBuffer: ${e.message}`
            });
        }
    }

    // Test audio formats compatibility
    async testAudioFormats() {
        if (!this.audioElement) return;
        
        const formats = [
            { type: 'audio/mpeg', ext: 'mp3' },
            { type: 'audio/ogg', ext: 'ogg' },
            { type: 'audio/wav', ext: 'wav' },
            { type: 'audio/aac', ext: 'aac' },
            { type: 'audio/webm', ext: 'webm' }
        ];
        
        const results = {};
        
        formats.forEach(format => {
            const support = this.audioElement.canPlayType(format.type);
            results[format.ext] = support;
        });
        
        this.testResults.push({
            name: 'Audio Format Support',
            result: 'INFO',
            details: JSON.stringify(results)
        });
        
        // Determine best format
        let bestFormat = 'mp3'; // Default
        
        if (results.ogg === 'probably') {
            bestFormat = 'ogg';
        } else if (results.mp3 === 'probably') {
            bestFormat = 'mp3';
        } else if (results.wav === 'probably') {
            bestFormat = 'wav';
        }
        
        this.testResults.push({
            name: 'Best Audio Format',
            result: 'INFO',
            details: `Best supported format appears to be: ${bestFormat}`
        });
    }

    // Log test results
    logResults() {
        console.log('=== Ambient Sound Test Results ===');
        this.testResults.forEach(test => {
            console.log(`${test.name}: ${test.result}`);
            console.log(`  ${test.details}`);
        });
        console.log('=================================');
    }

    // Clean up resources
    dispose() {
        if (this.oscillatorNode) {
            try {
                this.oscillatorNode.stop();
            } catch (e) {
                // Ignore if already stopped
            }
        }
        
        if (this.bufferSource) {
            try {
                this.bufferSource.stop();
            } catch (e) {
                // Ignore if already stopped
            }
        }
        
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}
