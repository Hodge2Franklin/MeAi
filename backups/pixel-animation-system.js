/**
 * Pixel Animation System for MeAI
 * 
 * Features:
 * - Emotionally expressive animations for the central pixel
 * - Multiple visual states reflecting different emotions
 * - Responsive animations that react to conversation
 * - Color variations to convey mood and energy
 * - Particle effects for significant moments
 */

class PixelAnimationSystem {
    constructor(pixelElement) {
        // Main pixel element
        this.pixel = pixelElement;
        
        // Canvas for advanced effects
        this.canvas = null;
        this.ctx = null;
        
        // Animation state
        this.currentState = 'idle';
        this.currentEmotion = 'neutral';
        this.animationFrame = null;
        this.lastFrameTime = 0;
        this.pulsePhase = 0;
        
        // Particle system
        this.particles = [];
        this.maxParticles = 30;
        
        // Emotional parameters
        this.emotionParams = {
            neutral: {
                baseColor: '#00e2ff',
                pulseSpeed: 1.0,
                pulseScale: 0.15,
                particleColor: '#00e2ff',
                particleRate: 0,
                transitionSpeed: 1.0
            },
            joy: {
                baseColor: '#69f0ae',
                pulseSpeed: 1.5,
                pulseScale: 0.25,
                particleColor: '#69f0ae',
                particleRate: 0.2,
                transitionSpeed: 1.2
            },
            calm: {
                baseColor: '#4fc3f7',
                pulseSpeed: 0.7,
                pulseScale: 0.1,
                particleColor: '#4fc3f7',
                particleRate: 0,
                transitionSpeed: 0.8
            },
            curious: {
                baseColor: '#ffd54f',
                pulseSpeed: 1.2,
                pulseScale: 0.2,
                particleColor: '#ffd54f',
                particleRate: 0.1,
                transitionSpeed: 1.1
            },
            reflective: {
                baseColor: '#b0bec5',
                pulseSpeed: 0.6,
                pulseScale: 0.12,
                particleColor: '#b0bec5',
                particleRate: 0.05,
                transitionSpeed: 0.7
            },
            excited: {
                baseColor: '#ff4081',
                pulseSpeed: 1.8,
                pulseScale: 0.3,
                particleColor: '#ff4081',
                particleRate: 0.3,
                transitionSpeed: 1.5
            },
            empathetic: {
                baseColor: '#ba68c8',
                pulseSpeed: 0.9,
                pulseScale: 0.18,
                particleColor: '#ba68c8',
                particleRate: 0.1,
                transitionSpeed: 1.0
            }
        };
        
        // Current emotion values (for transitions)
        this.currentValues = {
            baseColor: this.emotionParams.neutral.baseColor,
            pulseSpeed: this.emotionParams.neutral.pulseSpeed,
            pulseScale: this.emotionParams.neutral.pulseScale,
            particleColor: this.emotionParams.neutral.particleColor,
            particleRate: this.emotionParams.neutral.particleRate
        };
        
        // Target emotion values (for transitions)
        this.targetValues = { ...this.currentValues };
        
        // Transition state
        this.isTransitioning = false;
        this.transitionStartTime = 0;
        this.transitionDuration = 1000; // 1 second
        
        // State-specific animation parameters
        this.stateParams = {
            idle: {
                baseScale: 1.0,
                particleRate: 0
            },
            speaking: {
                baseScale: 1.1,
                particleRate: 0.1
            },
            listening: {
                baseScale: 0.95,
                particleRate: 0
            },
            thinking: {
                baseScale: 1.05,
                particleRate: 0.05
            },
            emphasizing: {
                baseScale: 1.2,
                particleRate: 0.2
            }
        };
    }
    
    /**
     * Initialize the pixel animation system
     */
    initialize() {
        // Create canvas for advanced effects
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'pixel-canvas';
        this.canvas.width = 300;
        this.canvas.height = 300;
        this.ctx = this.canvas.getContext('2d');
        
        // Insert canvas before the pixel element
        this.pixel.parentNode.insertBefore(this.canvas, this.pixel);
        
        // Set initial styles
        this.pixel.style.backgroundColor = this.currentValues.baseColor;
        
        // Start animation loop
        this.startAnimationLoop();
        
        console.log('Pixel Animation System initialized');
    }
    
    /**
     * Start the main animation loop
     */
    startAnimationLoop() {
        const animate = (timestamp) => {
            // Calculate delta time
            const deltaTime = this.lastFrameTime ? (timestamp - this.lastFrameTime) / 1000 : 0;
            this.lastFrameTime = timestamp;
            
            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Update transition if active
            if (this.isTransitioning) {
                this.updateTransition(timestamp);
            }
            
            // Update pulse animation
            this.updatePulse(deltaTime);
            
            // Update particles
            this.updateParticles(deltaTime);
            
            // Request next frame
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        // Start animation loop
        this.animationFrame = requestAnimationFrame(animate);
    }
    
    /**
     * Update pulse animation
     * @param {number} deltaTime Time since last frame in seconds
     */
    updatePulse(deltaTime) {
        // Update pulse phase
        this.pulsePhase += deltaTime * this.currentValues.pulseSpeed * Math.PI;
        
        // Calculate pulse scale
        const pulseValue = Math.sin(this.pulsePhase) * this.currentValues.pulseScale;
        const stateScale = this.stateParams[this.currentState].baseScale;
        const scale = stateScale + pulseValue;
        
        // Apply scale to pixel
        this.pixel.style.transform = `scale(${scale})`;
        
        // Apply color
        this.pixel.style.backgroundColor = this.currentValues.baseColor;
        this.pixel.style.boxShadow = `0 0 20px ${this.currentValues.baseColor}`;
    }
    
    /**
     * Update particles
     * @param {number} deltaTime Time since last frame in seconds
     */
    updateParticles(deltaTime) {
        // Calculate effective particle rate
        const stateRate = this.stateParams[this.currentState].particleRate;
        const emotionRate = this.currentValues.particleRate;
        const effectiveRate = stateRate + emotionRate;
        
        // Create new particles based on rate
        if (effectiveRate > 0) {
            const particleCount = Math.floor(effectiveRate * 60 * deltaTime);
            for (let i = 0; i < particleCount; i++) {
                if (this.particles.length < this.maxParticles) {
                    this.createParticle();
                }
            }
        }
        
        // Update existing particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update position
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            
            // Update lifetime
            particle.life -= deltaTime;
            
            // Remove dead particles
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            
            // Calculate opacity based on life
            const opacity = particle.life / particle.maxLife;
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${particle.r}, ${particle.g}, ${particle.b}, ${opacity})`;
            this.ctx.fill();
        }
    }
    
    /**
     * Create a new particle
     */
    createParticle() {
        // Get center of pixel
        const rect = this.pixel.getBoundingClientRect();
        const pixelCenterX = this.canvas.width / 2;
        const pixelCenterY = this.canvas.height / 2;
        
        // Parse color
        const color = this.currentValues.particleColor;
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        // Create particle with random properties
        const angle = Math.random() * Math.PI * 2;
        const speed = 20 + Math.random() * 30;
        const particle = {
            x: pixelCenterX,
            y: pixelCenterY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 1 + Math.random() * 3,
            life: 0.5 + Math.random() * 1.5,
            maxLife: 0.5 + Math.random() * 1.5,
            r, g, b
        };
        
        this.particles.push(particle);
    }
    
    /**
     * Update transition between emotional states
     * @param {number} timestamp Current animation timestamp
     */
    updateTransition(timestamp) {
        // Calculate progress (0 to 1)
        const elapsed = timestamp - this.transitionStartTime;
        const progress = Math.min(elapsed / this.transitionDuration, 1);
        
        // Interpolate values
        this.currentValues.baseColor = this.interpolateColor(
            this.currentValues.baseColor,
            this.targetValues.baseColor,
            progress
        );
        
        this.currentValues.pulseSpeed = this.lerp(
            this.currentValues.pulseSpeed,
            this.targetValues.pulseSpeed,
            progress
        );
        
        this.currentValues.pulseScale = this.lerp(
            this.currentValues.pulseScale,
            this.targetValues.pulseScale,
            progress
        );
        
        this.currentValues.particleColor = this.interpolateColor(
            this.currentValues.particleColor,
            this.targetValues.particleColor,
            progress
        );
        
        this.currentValues.particleRate = this.lerp(
            this.currentValues.particleRate,
            this.targetValues.particleRate,
            progress
        );
        
        // Check if transition is complete
        if (progress >= 1) {
            this.isTransitioning = false;
        }
    }
    
    /**
     * Set the emotional state of the pixel
     * @param {string} emotion Emotion name
     * @param {number} intensity Intensity of the emotion (0-1)
     * @param {number} transitionDuration Duration of transition in ms
     */
    setEmotion(emotion, intensity = 1.0, transitionDuration = null) {
        // Validate emotion
        if (!this.emotionParams[emotion]) {
            console.warn(`Unknown emotion: ${emotion}, defaulting to neutral`);
            emotion = 'neutral';
        }
        
        // Clamp intensity
        intensity = Math.max(0, Math.min(1, intensity));
        
        // Get emotion parameters
        const params = this.emotionParams[emotion];
        
        // Set target values
        this.targetValues.baseColor = params.baseColor;
        this.targetValues.pulseSpeed = params.pulseSpeed * intensity;
        this.targetValues.pulseScale = params.pulseScale * intensity;
        this.targetValues.particleColor = params.particleColor;
        this.targetValues.particleRate = params.particleRate * intensity;
        
        // Set transition duration
        this.transitionDuration = transitionDuration || (1000 / params.transitionSpeed);
        
        // Start transition
        this.isTransitioning = true;
        this.transitionStartTime = performance.now();
        this.currentEmotion = emotion;
        
        console.log(`Emotion set to ${emotion} with intensity ${intensity}`);
    }
    
    /**
     * Set the functional state of the pixel
     * @param {string} state State name (idle, speaking, listening, thinking, emphasizing)
     */
    setState(state) {
        // Validate state
        if (!this.stateParams[state]) {
            console.warn(`Unknown state: ${state}, defaulting to idle`);
            state = 'idle';
        }
        
        this.currentState = state;
        console.log(`State set to ${state}`);
    }
    
    /**
     * Emit particles from the pixel
     * @param {number} count Number of particles to emit
     * @param {string} color Particle color (hex)
     */
    emitParticles(count, color = null) {
        const particleColor = color || this.currentValues.particleColor;
        
        // Parse color
        const r = parseInt(particleColor.slice(1, 3), 16);
        const g = parseInt(particleColor.slice(3, 5), 16);
        const b = parseInt(particleColor.slice(5, 7), 16);
        
        // Get center of pixel
        const pixelCenterX = this.canvas.width / 2;
        const pixelCenterY = this.canvas.height / 2;
        
        // Create particles
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) break;
            
            const angle = Math.random() * Math.PI * 2;
            const speed = 30 + Math.random() * 50;
            const particle = {
                x: pixelCenterX,
                y: pixelCenterY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 4,
                life: 1 + Math.random() * 2,
                maxLife: 1 + Math.random() * 2,
                r, g, b
            };
            
            this.particles.push(particle);
        }
    }
    
    /**
     * Emphasize the pixel (temporary highlight)
     * @param {number} duration Duration in milliseconds
     */
    emphasize(duration = 500) {
        // Store original state
        const originalState = this.currentState;
        
        // Set to emphasizing state
        this.setState('emphasizing');
        
        // Emit particles
        this.emitParticles(10);
        
        // Return to original state after duration
        setTimeout(() => {
            this.setState(originalState);
        }, duration);
    }
    
    /**
     * Animate the pixel for speech
     * @param {string} text Text being spoken
     * @param {number} duration Duration of speech in milliseconds
     */
    animateSpeech(text, duration) {
        // Set to speaking state
        this.setState('speaking');
        
        // Analyze text for emotional content
        const emotion = this.analyzeTextEmotion(text);
        if (emotion) {
            this.setEmotion(emotion);
        }
        
        // Return to idle state after duration
        setTimeout(() => {
            this.setState('idle');
        }, duration);
    }
    
    /**
     * Animate the pixel for listening
     */
    animateListening() {
        this.setState('listening');
    }
    
    /**
     * Animate the pixel for thinking
     * @param {number} duration Duration of thinking in milliseconds
     */
    animateThinking(duration = 2000) {
        this.setState('thinking');
        
        // Return to idle state after duration
        setTimeout(() => {
            this.setState('idle');
        }, duration);
    }
    
    /**
     * Simple analysis of text for emotional content
     * @param {string} text Text to analyze
     * @returns {string|null} Detected emotion or null
     */
    analyzeTextEmotion(text) {
        const lowerText = text.toLowerCase();
        
        // Simple keyword matching
        if (/happy|joy|excite|wonderful|great|delighted/.test(lowerText)) {
            return 'joy';
        } else if (/calm|peaceful|serene|tranquil|gentle/.test(lowerText)) {
            return 'calm';
        } else if (/curious|wonder|interest|question|fascinating/.test(lowerText)) {
            return 'curious';
        } else if (/think|reflect|consider|ponder|contemplate/.test(lowerText)) {
            return 'reflective';
        } else if (/wow|amazing|incredible|awesome|fantastic/.test(lowerText)) {
            return 'excited';
        } else if (/understand|feel|empathize|connect|relate/.test(lowerText)) {
            return 'empathetic';
        }
        
        return null;
    }
    
    /**
     * Linear interpolation between two values
     * @param {number} a Start value
     * @param {number} b End value
     * @param {number} t Progress (0-1)
     * @returns {number} Interpolated value
     */
    lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    /**
     * Interpolate between two colors
     * @param {string} colorA Start color (hex)
     * @param {string} colorB End color (hex)
     * @param {number} t Progress (0-1)
     * @returns {string} Interpolated color (hex)
     */
    interpolateColor(colorA, colorB, t) {
        // Parse colors
        const r1 = parseInt(colorA.slice(1, 3), 16);
        const g1 = parseInt(colorA.slice(3, 5), 16);
        const b1 = parseInt(colorA.slice(5, 7), 16);
        
        const r2 = parseInt(colorB.slice(1, 3), 16);
        const g2 = parseInt(colorB.slice(3, 5), 16);
        const b2 = parseInt(colorB.slice(5, 7), 16);
        
        // Interpolate
        const r = Math.round(this.lerp(r1, r2, t));
        const g = Math.round(this.lerp(g1, g2, t));
        const b = Math.round(this.lerp(b1, b2, t));
        
        // Convert back to hex
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        // Stop animation loop
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        // Remove canvas
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        
        // Clear references
        this.particles = [];
        this.canvas = null;
        this.ctx = null;
        
        console.log('Pixel Animation System disposed');
    }
}
