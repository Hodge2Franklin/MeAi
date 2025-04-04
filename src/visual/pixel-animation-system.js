/**
 * Enhanced Pixel Visualization System
 * 
 * This system provides a sophisticated visual representation of the MeAI entity
 * with advanced emotional expression states, responsive animations, color transitions,
 * and particle effects.
 */

class PixelAnimationSystem {
    constructor() {
        // DOM elements
        this.pixelElement = document.getElementById('pixel');
        this.pixelContainer = document.getElementById('pixel-container');
        
        // Emotional state configuration
        this.emotionalStates = {
            joy: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--pixel-joy').trim(),
                pulseSpeed: 0.8, // seconds per pulse cycle
                sizeVariation: 1.2, // max size multiplier
                particleEmission: 'sparkle',
                particleColor: '#ffbe0b',
                particleFrequency: 0.8 // 0-1 scale
            },
            reflective: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--pixel-reflective').trim(),
                pulseSpeed: 2.5,
                sizeVariation: 1.1,
                particleEmission: 'wave',
                particleColor: '#3a86ff',
                particleFrequency: 0.3
            },
            curious: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--pixel-curious').trim(),
                pulseSpeed: 1.5,
                sizeVariation: 1.15,
                particleEmission: 'orbit',
                particleColor: '#8338ec',
                particleFrequency: 0.5
            },
            excited: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--pixel-excited').trim(),
                pulseSpeed: 0.6,
                sizeVariation: 1.25,
                particleEmission: 'burst',
                particleColor: '#ff006e',
                particleFrequency: 0.9
            },
            empathetic: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--pixel-empathetic').trim(),
                pulseSpeed: 1.2,
                sizeVariation: 1.15,
                particleEmission: 'pulse',
                particleColor: '#38b000',
                particleFrequency: 0.6
            },
            calm: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--pixel-calm').trim(),
                pulseSpeed: 3.0,
                sizeVariation: 1.05,
                particleEmission: 'gentle',
                particleColor: '#00b4d8',
                particleFrequency: 0.2
            },
            neutral: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--pixel-neutral').trim(),
                pulseSpeed: 2.0,
                sizeVariation: 1.1,
                particleEmission: 'minimal',
                particleColor: '#ffffff',
                particleFrequency: 0.1
            }
        };
        
        // Current state
        this.currentState = 'neutral';
        this.isListening = false;
        this.isSpeaking = false;
        this.intensity = 1.0; // 0-1 scale for emotion intensity
        this.transitionInProgress = false;
        
        // Animation properties
        this.animationFrame = null;
        this.pulsePhase = 0;
        this.particles = [];
        this.maxParticles = 50;
        
        // Canvas for particle effects
        this.setupParticleCanvas();
        
        // Initialize
        this.setState('neutral');
        this.startAnimation();
        
        // Event listeners
        this.setupEventListeners();
    }
    
    /**
     * Set up the canvas for particle effects
     */
    setupParticleCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'particle-canvas';
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '0';
        this.pixelContainer.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    /**
     * Resize the canvas to match the container
     */
    resizeCanvas() {
        const rect = this.pixelContainer.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }
    
    /**
     * Set up event listeners for system events
     */
    setupEventListeners() {
        // Listen for emotional state change events
        document.addEventListener('meai-emotional-state-change', (event) => {
            const { emotion, intensity } = event.detail;
            this.setEmotionalState(emotion, intensity);
        });
        
        // Listen for listening state changes
        document.addEventListener('meai-listening-start', () => {
            this.setListeningState(true);
        });
        
        document.addEventListener('meai-listening-end', () => {
            this.setListeningState(false);
        });
        
        // Listen for speaking state changes
        document.addEventListener('meai-speaking-start', () => {
            this.setSpeakingState(true);
        });
        
        document.addEventListener('meai-speaking-end', () => {
            this.setSpeakingState(false);
        });
        
        // Listen for accessibility settings changes
        document.addEventListener('meai-a11y-reduced-motion', (event) => {
            this.handleReducedMotion(event.detail.enabled);
        });
    }
    
    /**
     * Set the emotional state of the pixel
     * @param {string} emotion - The emotional state to set
     * @param {number} intensity - The intensity of the emotion (0-1)
     */
    setEmotionalState(emotion, intensity = 1.0) {
        // Validate emotion
        if (!this.emotionalStates[emotion]) {
            console.warn(`Unknown emotional state: ${emotion}, defaulting to neutral`);
            emotion = 'neutral';
        }
        
        // Clamp intensity
        intensity = Math.max(0, Math.min(1, intensity));
        
        // If same emotion but different intensity, just update intensity
        if (emotion === this.currentState && intensity !== this.intensity) {
            this.intensity = intensity;
            return;
        }
        
        // Start transition to new state
        this.transitionToState(emotion, intensity);
    }
    
    /**
     * Transition smoothly to a new emotional state
     * @param {string} newState - The new emotional state
     * @param {number} intensity - The intensity of the emotion
     */
    transitionToState(newState, intensity) {
        if (this.transitionInProgress) return;
        
        this.transitionInProgress = true;
        const previousState = this.currentState;
        const previousColor = this.emotionalStates[previousState].color;
        const targetColor = this.emotionalStates[newState].color;
        
        // Create transition animation
        const transitionDuration = 1000; // ms
        const startTime = performance.now();
        
        const animateTransition = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / transitionDuration, 1);
            
            // Interpolate color
            const currentColor = this.interpolateColor(previousColor, targetColor, progress);
            this.pixelElement.style.backgroundColor = currentColor;
            
            // Continue animation if not complete
            if (progress < 1) {
                requestAnimationFrame(animateTransition);
            } else {
                // Transition complete
                this.currentState = newState;
                this.intensity = intensity;
                this.transitionInProgress = false;
                
                // Emit event that transition is complete
                const event = new CustomEvent('meai-emotional-transition-complete', {
                    detail: { emotion: newState, intensity: intensity }
                });
                document.dispatchEvent(event);
            }
        };
        
        requestAnimationFrame(animateTransition);
    }
    
    /**
     * Interpolate between two colors
     * @param {string} color1 - Starting color in hex or rgb format
     * @param {string} color2 - Ending color in hex or rgb format
     * @param {number} progress - Progress from 0 to 1
     * @returns {string} - Interpolated color in rgb format
     */
    interpolateColor(color1, color2, progress) {
        // Convert colors to RGB
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        
        // Interpolate each channel
        const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * progress);
        const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * progress);
        const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * progress);
        
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    /**
     * Convert hex color to RGB object
     * @param {string} hex - Hex color string
     * @returns {Object} - RGB object with r, g, b properties
     */
    hexToRgb(hex) {
        // Check if already in rgb format
        if (hex.startsWith('rgb')) {
            const match = hex.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (match) {
                return {
                    r: parseInt(match[1]),
                    g: parseInt(match[2]),
                    b: parseInt(match[3])
                };
            }
        }
        
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Handle shorthand hex
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        
        // Parse hex values
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return { r, g, b };
    }
    
    /**
     * Set the listening state of the pixel
     * @param {boolean} isListening - Whether the pixel is in listening state
     */
    setListeningState(isListening) {
        this.isListening = isListening;
        
        if (isListening) {
            // Add listening animation class
            this.pixelElement.classList.add('listening');
            
            // Emit more particles while listening
            this.emitParticles('listen', 5);
        } else {
            // Remove listening animation class
            this.pixelElement.classList.remove('listening');
        }
    }
    
    /**
     * Set the speaking state of the pixel
     * @param {boolean} isSpeaking - Whether the pixel is in speaking state
     */
    setSpeakingState(isSpeaking) {
        this.isSpeaking = isSpeaking;
        
        if (isSpeaking) {
            // Add speaking animation class
            this.pixelElement.classList.add('speaking');
            
            // Emit particles in rhythm with speech
            this.startSpeechParticles();
        } else {
            // Remove speaking animation class
            this.pixelElement.classList.remove('speaking');
            
            // Stop speech particle emission
            this.stopSpeechParticles();
        }
    }
    
    /**
     * Start the main animation loop
     */
    startAnimation() {
        const animate = () => {
            this.updatePixelAnimation();
            this.updateParticles();
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        this.animationFrame = requestAnimationFrame(animate);
    }
    
    /**
     * Stop the animation loop
     */
    stopAnimation() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }
    
    /**
     * Update the pixel animation based on current state
     */
    updatePixelAnimation() {
        if (this.transitionInProgress) return;
        
        const state = this.emotionalStates[this.currentState];
        const now = performance.now() / 1000; // Convert to seconds
        
        // Calculate pulse based on state's pulse speed
        this.pulsePhase = now % state.pulseSpeed / state.pulseSpeed;
        
        // Calculate size based on pulse phase (using sine wave)
        const baseSize = 40; // Base pixel size in px
        const pulseAmount = Math.sin(this.pulsePhase * Math.PI * 2) * 0.5 + 0.5; // 0 to 1
        const sizeVariation = state.sizeVariation - 1; // Convert to delta
        const sizeMultiplier = 1 + (sizeVariation * pulseAmount * this.intensity);
        const size = baseSize * sizeMultiplier;
        
        // Apply size
        this.pixelElement.style.width = `${size}px`;
        this.pixelElement.style.height = `${size}px`;
        
        // Apply shadow based on state and intensity
        const shadowSize = 20 * this.intensity;
        const shadowColor = state.color;
        this.pixelElement.style.boxShadow = `0 0 ${shadowSize}px ${shadowColor}`;
        
        // Randomly emit particles based on state's particle frequency
        if (Math.random() < state.particleFrequency * this.intensity * 0.1) {
            this.emitParticles(state.particleEmission, 1);
        }
        
        // Additional animations for listening/speaking states
        if (this.isListening) {
            // Listening animation - gentle pulsing with different rhythm
            const listenPulse = Math.sin(now * 5) * 0.1 + 1;
            this.pixelElement.style.transform = `scale(${listenPulse})`;
        } else if (this.isSpeaking) {
            // Speaking animation - more dynamic size changes
            const speakPulse = Math.sin(now * 10) * 0.15 * this.intensity + 1;
            this.pixelElement.style.transform = `scale(${speakPulse})`;
        } else {
            // Normal state - subtle movement
            const idlePulse = Math.sin(now * 0.5) * 0.03 + 1;
            this.pixelElement.style.transform = `scale(${idlePulse})`;
        }
    }
    
    /**
     * Emit particles based on the specified pattern
     * @param {string} pattern - The particle emission pattern
     * @param {number} count - Number of particles to emit
     */
    emitParticles(pattern, count) {
        const state = this.emotionalStates[this.currentState];
        const pixelRect = this.pixelElement.getBoundingClientRect();
        const containerRect = this.pixelContainer.getBoundingClientRect();
        
        // Calculate pixel center relative to container
        const centerX = pixelRect.left - containerRect.left + pixelRect.width / 2;
        const centerY = pixelRect.top - containerRect.top + pixelRect.height / 2;
        
        for (let i = 0; i < count; i++) {
            // Don't exceed max particles
            if (this.particles.length >= this.maxParticles) break;
            
            // Create particle with properties based on pattern
            const particle = {
                x: centerX,
                y: centerY,
                size: Math.random() * 4 + 2,
                color: state.particleColor,
                alpha: 1,
                speed: Math.random() * 2 + 1,
                angle: Math.random() * Math.PI * 2,
                life: 0,
                maxLife: Math.random() * 2 + 1, // 1-3 seconds
                pattern: pattern
            };
            
            // Customize particle based on pattern
            switch (pattern) {
                case 'sparkle':
                    particle.speed = Math.random() * 3 + 2;
                    particle.size = Math.random() * 3 + 1;
                    particle.maxLife = Math.random() * 1 + 0.5; // 0.5-1.5 seconds
                    break;
                    
                case 'wave':
                    particle.speed = Math.random() * 1 + 0.5;
                    particle.waveAmplitude = Math.random() * 10 + 5;
                    particle.waveFrequency = Math.random() * 5 + 2;
                    break;
                    
                case 'orbit':
                    particle.orbitRadius = Math.random() * 30 + 20;
                    particle.orbitSpeed = Math.random() * 2 + 1;
                    particle.startAngle = Math.random() * Math.PI * 2;
                    break;
                    
                case 'burst':
                    particle.speed = Math.random() * 5 + 3;
                    particle.maxLife = Math.random() * 0.5 + 0.3; // 0.3-0.8 seconds
                    break;
                    
                case 'pulse':
                    particle.maxLife = Math.random() * 1.5 + 1;
                    particle.pulseFrequency = Math.random() * 3 + 2;
                    break;
                    
                case 'gentle':
                    particle.speed = Math.random() * 0.8 + 0.2;
                    particle.maxLife = Math.random() * 3 + 2; // 2-5 seconds
                    break;
                    
                case 'minimal':
                    particle.speed = Math.random() * 0.5 + 0.1;
                    particle.size = Math.random() * 2 + 0.5;
                    break;
                    
                case 'listen':
                    particle.speed = Math.random() * 1 + 0.5;
                    particle.size = Math.random() * 2 + 1;
                    particle.color = '#ffffff';
                    break;
            }
            
            this.particles.push(particle);
        }
    }
    
    /**
     * Start emitting particles in rhythm with speech
     */
    startSpeechParticles() {
        this.speechParticleInterval = setInterval(() => {
            const state = this.emotionalStates[this.currentState];
            this.emitParticles(state.particleEmission, Math.floor(Math.random() * 3) + 1);
        }, 100);
    }
    
    /**
     * Stop speech particle emission
     */
    stopSpeechParticles() {
        if (this.speechParticleInterval) {
            clearInterval(this.speechParticleInterval);
            this.speechParticleInterval = null;
        }
    }
    
    /**
     * Update and render all particles
     */
    updateParticles() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw each particle
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Update life
            p.life += 1/60; // Assuming 60fps
            
            // Remove dead particles
            if (p.life >= p.maxLife) {
                this.particles.splice(i, 1);
                continue;
            }
            
            // Calculate life progress (0 to 1)
            const lifeProgress = p.life / p.maxLife;
            
            // Update alpha based on life (fade out towards end)
            p.alpha = lifeProgress < 0.7 ? 1 : 1 - ((lifeProgress - 0.7) / 0.3);
            
            // Update position based on pattern
            switch (p.pattern) {
                case 'sparkle':
                    // Move outward from center
                    p.x += Math.cos(p.angle) * p.speed;
                    p.y += Math.sin(p.angle) * p.speed;
                    // Sparkle effect - vary size
                    p.size = (Math.sin(p.life * 10) * 0.5 + 1) * p.size;
                    break;
                    
                case 'wave':
                    // Move in wave pattern
                    p.x += Math.cos(p.angle) * p.speed;
                    p.y += Math.sin(p.angle) * p.speed;
                    // Add wave motion perpendicular to movement
                    const perpAngle = p.angle + Math.PI/2;
                    p.x += Math.cos(perpAngle) * Math.sin(p.life * p.waveFrequency) * p.waveAmplitude * 0.1;
                    p.y += Math.sin(perpAngle) * Math.sin(p.life * p.waveFrequency) * p.waveAmplitude * 0.1;
                    break;
                    
                case 'orbit':
                    // Orbit around center
                    const orbitAngle = p.startAngle + p.life * p.orbitSpeed;
                    const pixelRect = this.pixelElement.getBoundingClientRect();
                    const containerRect = this.pixelContainer.getBoundingClientRect();
                    const centerX = pixelRect.left - containerRect.left + pixelRect.width / 2;
                    const centerY = pixelRect.top - containerRect.top + pixelRect.height / 2;
                    p.x = centerX + Math.cos(orbitAngle) * p.orbitRadius;
                    p.y = centerY + Math.sin(orbitAngle) * p.orbitRadius;
                    break;
                    
                case 'burst':
                    // Fast movement outward
                    p.x += Math.cos(p.angle) * p.speed * (1 + lifeProgress);
                    p.y += Math.sin(p.angle) * p.speed * (1 + lifeProgress);
                    break;
                    
                case 'pulse':
                    // Slow movement with pulsing size
                    p.x += Math.cos(p.angle) * p.speed;
                    p.y += Math.sin(p.angle) * p.speed;
                    p.size = (Math.sin(p.life * p.pulseFrequency * Math.PI) * 0.5 + 1) * p.size;
                    break;
                    
                case 'gentle':
                    // Very slow, gentle movement
                    p.x += Math.cos(p.angle) * p.speed * 0.5;
                    p.y += Math.sin(p.angle) * p.speed * 0.5;
                    // Slight drift
                    p.angle += Math.sin(p.life) * 0.05;
                    break;
                    
                case 'minimal':
                    // Minimal movement, mostly fading
                    p.x += Math.cos(p.angle) * p.speed * 0.3;
                    p.y += Math.sin(p.angle) * p.speed * 0.3;
                    break;
                    
                case 'listen':
                    // Circular pattern around pixel
                    const listenAngle = p.angle + p.life * 2;
                    p.x += Math.cos(listenAngle) * p.speed;
                    p.y += Math.sin(listenAngle) * p.speed;
                    break;
                    
                default:
                    // Default movement
                    p.x += Math.cos(p.angle) * p.speed;
                    p.y += Math.sin(p.angle) * p.speed;
            }
            
            // Draw particle
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Reset global alpha
        this.ctx.globalAlpha = 1;
    }
    
    /**
     * Handle reduced motion accessibility setting
     * @param {boolean} enabled - Whether reduced motion is enabled
     */
    handleReducedMotion(enabled) {
        if (enabled) {
            // Reduce animation effects
            this.maxParticles = 10;
            // Slow down animations
            for (const state in this.emotionalStates) {
                this.emotionalStates[state].pulseSpeed *= 2;
                this.emotionalStates[state].particleFrequency *= 0.3;
                this.emotionalStates[state].sizeVariation = 1 + (this.emotionalStates[state].sizeVariation - 1) * 0.5;
            }
        } else {
            // Restore normal animation effects
            this.maxParticles = 50;
            // Reset animation speeds
            for (const state in this.emotionalStates) {
                this.emotionalStates[state].pulseSpeed /= 2;
                this.emotionalStates[state].particleFrequency /= 0.3;
                this.emotionalStates[state].sizeVariation = 1 + (this.emotionalStates[state].sizeVariation - 1) * 2;
            }
        }
    }
    
    /**
     * Set the current state directly (without transition)
     * @param {string} state - The state to set
     */
    setState(state) {
        if (!this.emotionalStates[state]) {
            console.warn(`Unknown state: ${state}, defaulting to neutral`);
            state = 'neutral';
        }
        
        this.currentState = state;
        this.pixelElement.style.backgroundColor = this.emotionalStates[state].color;
    }
    
    /**
     * Clean up resources when the system is destroyed
     */
    destroy() {
        this.stopAnimation();
        this.stopSpeechParticles();
        
        // Remove event listeners
        document.removeEventListener('meai-emotional-state-change', this.handleEmotionalStateChange);
        document.removeEventListener('meai-listening-start', this.handleListeningStart);
        document.removeEventListener('meai-listening-end', this.handleListeningEnd);
        document.removeEventListener('meai-speaking-start', this.handleSpeakingStart);
        document.removeEventListener('meai-speaking-end', this.handleSpeakingEnd);
        document.removeEventListener('meai-a11y-reduced-motion', this.handleReducedMotion);
        
        // Remove canvas
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Initialize the pixel animation system when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pixelAnimationSystem = new PixelAnimationSystem();
    
    // For testing purposes, cycle through emotions
    if (window.location.search.includes('test-emotions')) {
        const emotions = ['joy', 'reflective', 'curious', 'excited', 'empathetic', 'calm', 'neutral'];
        let index = 0;
        
        setInterval(() => {
            const emotion = emotions[index];
            console.log(`Setting emotion to ${emotion}`);
            
            // Dispatch event to change emotion
            const event = new CustomEvent('meai-emotional-state-change', {
                detail: { emotion, intensity: Math.random() * 0.5 + 0.5 }
            });
            document.dispatchEvent(event);
            
            index = (index + 1) % emotions.length;
        }, 3000);
    }
});
