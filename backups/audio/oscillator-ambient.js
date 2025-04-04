// Generate ambient sound using Web Audio API
function createOscillatorAmbientSound(audioContext) {
    // Create oscillator nodes for base frequency and modulation
    const baseOscillator = audioContext.createOscillator();
    const modulationOscillator = audioContext.createOscillator();
    
    // Create gain nodes for volume control
    const baseGain = audioContext.createGain();
    const modulationGain = audioContext.createGain();
    const masterGain = audioContext.createGain();
    
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
    masterGain.connect(audioContext.destination);
    
    // Set master volume (low for ambient background)
    masterGain.gain.value = 0.1;
    
    // Start oscillators
    baseOscillator.start();
    modulationOscillator.start();
    
    // Return control object
    return {
        setVolume: (volume) => {
            masterGain.gain.value = volume * 0.3; // Scale for comfortable listening
        },
        stop: () => {
            baseOscillator.stop();
            modulationOscillator.stop();
        }
    };
}
