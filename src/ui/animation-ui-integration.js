/**
 * Animation-UI Integration System
 * 
 * This system integrates the advanced animation system with the UI,
 * providing seamless visual feedback and interactive animations.
 */

class AnimationUIIntegration {
    constructor() {
        // Initialize dependencies
        this.storageManager = window.storageManager;
        this.eventSystem = window.eventSystem;
        this.themeSystem = window.themeSystem;
        this.accessibilitySystem = window.accessibilitySystem;
        this.interfaceAnimationSystem = window.interfaceAnimationSystem;
        this.enhancedInterfaceSystem = window.enhancedInterfaceSystem;
        this.userInteractionController = window.userInteractionController;
        this.advancedAnimationSystem = window.advancedAnimationSystem;
        this.pixelVisualization3D = window.pixelVisualization3D;
        
        // Integration state
        this.state = {
            animationsEnabled: true,
            emotionalState: 'neutral',
            interactionMode: 'standard', // standard, responsive, minimal
            visualFeedbackLevel: 'medium', // low, medium, high
            particleEffectsEnabled: true,
            physicsEnabled: true,
            proceduralAnimationsEnabled: true,
            is3DMode: false,
            currentAnimations: new Map(),
            emotionTransitionInProgress: false,
            lastInteractionType: null,
            performanceMode: 'auto', // auto, performance, quality
            lastPerformanceCheck: Date.now(),
            fpsHistory: []
        };
        
        // Animation mappings
        this.animationMappings = {
            userInteractions: {
                'message-sent': {
                    emotion: 'excited',
                    animation: 'pulse',
                    particles: 'emit',
                    duration: 1000
                },
                'voice-input-started': {
                    emotion: 'curious',
                    animation: 'listen',
                    particles: 'voice',
                    duration: 0 // Continuous until stopped
                },
                'typing': {
                    emotion: 'attentive',
                    animation: 'subtle-pulse',
                    particles: 'none',
                    duration: 0 // Continuous until stopped
                }
            },
            systemResponses: {
                'thinking': {
                    emotion: 'reflective',
                    animation: 'float',
                    particles: 'thought',
                    duration: 0 // Continuous until stopped
                },
                'responding': {
                    emotion: 'empathetic',
                    animation: 'speak',
                    particles: 'emit',
                    duration: 0 // Continuous until stopped
                },
                'error': {
                    emotion: 'confused',
                    animation: 'shake',
                    particles: 'error',
                    duration: 1000
                }
            },
            emotionalStates: {
                'joy': {
                    animation: 'bounce',
                    particles: 'sparkle',
                    color: 'var(--pixel-joy)',
                    intensity: 1.2
                },
                'reflective': {
                    animation: 'float',
                    particles: 'thought',
                    color: 'var(--pixel-reflective)',
                    intensity: 0.8
                },
                'curious': {
                    animation: 'tilt',
                    particles: 'question',
                    color: 'var(--pixel-curious)',
                    intensity: 1.0
                },
                'excited': {
                    animation: 'bounce',
                    particles: 'burst',
                    color: 'var(--pixel-excited)',
                    intensity: 1.5
                },
                'empathetic': {
                    animation: 'pulse',
                    particles: 'heart',
                    color: 'var(--pixel-empathetic)',
                    intensity: 0.9
                },
                'calm': {
                    animation: 'breathe',
                    particles: 'gentle',
                    color: 'var(--pixel-calm)',
                    intensity: 0.7
                },
                'neutral': {
                    animation: 'idle',
                    particles: 'minimal',
                    color: 'var(--pixel-neutral)',
                    intensity: 1.0
                }
            },
            uiElements: {
                'button': {
                    hover: 'scale',
                    active: 'press',
                    particles: 'subtle'
                },
                'input': {
                    focus: 'glow',
                    active: 'pulse',
                    particles: 'none'
                },
                'message': {
                    appear: 'slide-in',
                    disappear: 'fade-out',
                    particles: 'trail'
                },
                'panel': {
                    open: 'expand',
                    close: 'collapse',
                    particles: 'none'
                }
            }
        };
        
        // Initialize
        this.initialize();
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    /**
     * Initialize the animation-UI integration
     */
    async initialize() {
        try {
            // Check if advanced animation system is available
            if (!this.advancedAnimationSystem) {
                console.warn('Advanced Animation System not found, falling back to basic animations');
            }
            
            // Check if 3D visualization is available
            if (!this.pixelVisualization3D) {
                console.warn('3D Visualization not found, using 2D visualization only');
            }
            
            // Load user preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'animation-ui');
            if (preferences) {
                if (preferences.animationsEnabled !== undefined) {
                    this.state.animationsEnabled = preferences.animationsEnabled;
                }
                
                if (preferences.emotionalState !== undefined) {
                    this.state.emotionalState = preferences.emotionalState;
                }
                
                if (preferences.interactionMode !== undefined) {
                    this.state.interactionMode = preferences.interactionMode;
                }
                
                if (preferences.visualFeedbackLevel !== undefined) {
                    this.state.visualFeedbackLevel = preferences.visualFeedbackLevel;
                }
                
                if (preferences.particleEffectsEnabled !== undefined) {
                    this.state.particleEffectsEnabled = preferences.particleEffectsEnabled;
                }
                
                if (preferences.physicsEnabled !== undefined) {
                    this.state.physicsEnabled = preferences.physicsEnabled;
                }
                
                if (preferences.proceduralAnimationsEnabled !== undefined) {
                    this.state.proceduralAnimationsEnabled = preferences.proceduralAnimationsEnabled;
                }
                
                if (preferences.is3DMode !== undefined) {
                    this.state.is3DMode = preferences.is3DMode;
                }
                
                if (preferences.performanceMode !== undefined) {
                    this.state.performanceMode = preferences.performanceMode;
                }
            }
            
            // Check system capabilities
            this.checkSystemCapabilities();
            
            // Initialize animation elements
            this.initializeAnimationElements();
            
            // Set initial emotional state
            this.setEmotionalState(this.state.emotionalState, false);
            
            // Set 3D mode if enabled
            if (this.state.is3DMode && this.pixelVisualization3D) {
                this.enable3DMode();
            }
            
            console.log('Animation-UI Integration initialized');
            
            // Notify system that animation-UI integration is ready
            this.eventSystem.publish('animation-ui-integration-ready', {
                ...this.state
            });
        } catch (error) {
            console.error('Error initializing animation-UI integration:', error);
        }
    }
    
    /**
     * Check system capabilities
     */
    checkSystemCapabilities() {
        // Check for WebGL support
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        const hasWebGL = !!gl;
        
        // Check for advanced animation capabilities
        const hasRequestAnimationFrame = typeof window.requestAnimationFrame === 'function';
        const hasTransform = 'transform' in document.documentElement.style;
        const hasWebAnimations = 'animate' in document.documentElement;
        
        // Determine performance mode based on capabilities
        if (this.state.performanceMode === 'auto') {
            if (!hasWebGL || !hasRequestAnimationFrame) {
                // Low-end device
                this.state.performanceMode = 'performance';
                this.state.particleEffectsEnabled = false;
                this.state.physicsEnabled = false;
                this.state.proceduralAnimationsEnabled = false;
                this.state.visualFeedbackLevel = 'low';
            } else if (!hasWebAnimations) {
                // Mid-range device
                this.state.performanceMode = 'balanced';
                this.state.particleEffectsEnabled = true;
                this.state.physicsEnabled = false;
                this.state.proceduralAnimationsEnabled = true;
                this.state.visualFeedbackLevel = 'medium';
            } else {
                // High-end device
                this.state.performanceMode = 'quality';
            }
        }
        
        // Disable 3D mode if WebGL is not supported
        if (!hasWebGL) {
            this.state.is3DMode = false;
        }
        
        // Log capabilities
        console.log('System capabilities:', {
            hasWebGL,
            hasRequestAnimationFrame,
            hasTransform,
            hasWebAnimations,
            performanceMode: this.state.performanceMode
        });
    }
    
    /**
     * Initialize animation elements
     */
    initializeAnimationElements() {
        // Get pixel container
        const pixelContainer = document.getElementById('pixel-container');
        if (!pixelContainer) return;
        
        // Get or create pixel element
        let pixelElement = document.getElementById('meai-pixel');
        if (!pixelElement) {
            pixelElement = document.createElement('div');
            pixelElement.id = 'meai-pixel';
            pixelElement.className = 'meai-pixel';
            pixelContainer.appendChild(pixelElement);
        }
        
        // Create particle container if it doesn't exist
        let particleContainer = document.getElementById('particle-container');
        if (!particleContainer) {
            particleContainer = document.createElement('div');
            particleContainer.id = 'particle-container';
            particleContainer.className = 'particle-container';
            pixelContainer.appendChild(particleContainer);
        }
        
        // Create 3D container if it doesn't exist
        if (this.pixelVisualization3D) {
            let container3D = document.getElementById('visualization-3d-container');
            if (!container3D) {
                container3D = document.createElement('div');
                container3D.id = 'visualization-3d-container';
                container3D.className = 'visualization-3d-container';
                container3D.style.display = this.state.is3DMode ? 'block' : 'none';
                pixelContainer.appendChild(container3D);
            }
        }
    }
    
    /**
     * Set emotional state
     * @param {string} emotion - Emotional state
     * @param {boolean} animate - Whether to animate the transition
     */
    setEmotionalState(emotion, animate = true) {
        // Validate emotion
        if (!this.animationMappings.emotionalStates[emotion]) {
            console.warn(`Unknown emotional state: ${emotion}, defaulting to neutral`);
            emotion = 'neutral';
        }
        
        // Skip if same emotion and transition is in progress
        if (emotion === this.state.emotionalState && this.state.emotionTransitionInProgress) {
            return;
        }
        
        const previousEmotion = this.state.emotionalState;
        this.state.emotionalState = emotion;
        
        // Get emotion configuration
        const emotionConfig = this.animationMappings.emotionalStates[emotion];
        
        // Apply to 2D visualization
        this.apply2DEmotionalState(emotion, emotionConfig, previousEmotion, animate);
        
        // Apply to 3D visualization if enabled
        if (this.state.is3DMode && this.pixelVisualization3D) {
            this.apply3DEmotionalState(emotion, emotionConfig, previousEmotion, animate);
        }
        
        // Save preference
        this.savePreferences();
        
        // Notify about emotional state change
        this.eventSystem.publish('emotional-state-changed', {
            emotion,
            previousEmotion,
            config: emotionConfig
        });
    }
    
    /**
     * Apply 2D emotional state
     * @param {string} emotion - Emotional state
     * @param {Object} config - Emotion configuration
     * @param {string} previousEmotion - Previous emotional state
     * @param {boolean} animate - Whether to animate the transition
     */
    apply2DEmotionalState(emotion, config, previousEmotion, animate) {
        const pixelElement = document.getElementById('meai-pixel');
        if (!pixelElement) return;
        
        // Set transition state
        this.state.emotionTransitionInProgress = animate;
        
        // Apply color
        pixelElement.style.backgroundColor = config.color;
        
        // Apply animation
        if (animate && this.state.animationsEnabled) {
            // Remove previous animation classes
            pixelElement.className = 'meai-pixel';
            
            // Add new animation class
            pixelElement.classList.add(`animation-${config.animation}`);
            
            // Add intensity class
            pixelElement.classList.add(`intensity-${Math.round(config.intensity * 10)}`);
            
            // Create particles if enabled
            if (this.state.particleEffectsEnabled && config.particles !== 'none') {
                this.createParticleEffect(config.particles, pixelElement, config.color);
            }
            
            // Reset transition state after animation
            setTimeout(() => {
                this.state.emotionTransitionInProgress = false;
            }, 1000);
        } else {
            // Just set the class without animation
            pixelElement.className = 'meai-pixel';
            pixelElement.classList.add(`emotion-${emotion}`);
            this.state.emotionTransitionInProgress = false;
        }
    }
    
    /**
     * Apply 3D emotional state
     * @param {string} emotion - Emotional state
     * @param {Object} config - Emotion configuration
     * @param {string} previousEmotion - Previous emotional state
     * @param {boolean} animate - Whether to animate the transition
     */
    apply3DEmotionalState(emotion, config, previousEmotion, animate) {
        if (!this.pixelVisualization3D) return;
        
        // Call 3D visualization system to change emotional state
        this.pixelVisualization3D.setEmotionalState(emotion, {
            animate,
            intensity: config.intensity,
            previousEmotion,
            particleEffect: this.state.particleEffectsEnabled ? config.particles : 'none',
            physics: this.state.physicsEnabled,
            procedural: this.state.proceduralAnimationsEnabled
        });
    }
    
    /**
     * Create particle effect
     * @param {string} effectType - Particle effect type
     * @param {HTMLElement} sourceElement - Source element
     * @param {string} color - Particle color
     */
    createParticleEffect(effectType, sourceElement, color) {
        if (!this.state.particleEffectsEnabled) return;
        
        const particleContainer = document.getElementById('particle-container');
        if (!particleContainer) return;
        
        // Get source element position
        const rect = sourceElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Particle configurations
        const particleConfigs = {
            'minimal': { count: 5, speed: 1, size: 3, lifespan: 1000, spread: 50 },
            'gentle': { count: 10, speed: 0.7, size: 4, lifespan: 2000, spread: 70 },
            'emit': { count: 15, speed: 1.5, size: 3, lifespan: 1500, spread: 100 },
            'burst': { count: 25, speed: 2, size: 4, lifespan: 1200, spread: 150 },
            'sparkle': { count: 20, speed: 1.2, size: 3, lifespan: 1800, spread: 120 },
            'thought': { count: 8, speed: 0.8, size: 5, lifespan: 2500, spread: 80 },
            'question': { count: 12, speed: 1, size: 4, lifespan: 1600, spread: 90 },
            'heart': { count: 10, speed: 1.1, size: 6, lifespan: 2000, spread: 100 },
            'error': { count: 15, speed: 1.8, size: 4, lifespan: 1000, spread: 120 },
            'voice': { count: 8, speed: 1, size: 4, lifespan: 1200, spread: 60 },
            'trail': { count: 10, speed: 0.9, size: 3, lifespan: 1400, spread: 40 },
            'subtle': { count: 5, speed: 0.6, size: 2, lifespan: 800, spread: 30 }
        };
        
        // Use default if effect type not found
        const config = particleConfigs[effectType] || particleConfigs.minimal;
        
        // Create particles
        for (let i = 0; i < config.count; i++) {
            this.createParticle(
                particleContainer,
                centerX,
                centerY,
                color,
                config.size,
                config.speed,
                config.lifespan,
                config.spread,
                effectType
            );
        }
    }
    
    /**
     * Create a single particle
     * @param {HTMLElement} container - Particle container
     * @param {number} x - Starting X position
     * @param {number} y - Starting Y position
     * @param {string} color - Particle color
     * @param {number} size - Particle size
     * @param {number} speed - Particle speed
     * @param {number} lifespan - Particle lifespan in ms
     * @param {number} spread - Particle spread radius
     * @param {string} effectType - Effect type for special shapes
     */
    createParticle(container, x, y, color, size, speed, lifespan, spread, effectType) {
        // Create particle element
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Set particle style
        particle.style.position = 'absolute';
        particle.style.backgroundColor = color;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.borderRadius = '50%';
        particle.style.opacity = '0.8';
        particle.style.pointerEvents = 'none';
        
        // Special shapes for certain effect types
        if (effectType === 'heart') {
            particle.style.backgroundColor = 'transparent';
            particle.style.boxShadow = 'none';
            particle.style.width = `${size * 2}px`;
            particle.style.height = `${size * 2}px`;
            particle.innerHTML = '❤️';
            particle.style.fontSize = `${size * 2}px`;
            particle.style.display = 'flex';
            particle.style.alignItems = 'center';
            particle.style.justifyContent = 'center';
        } else if (effectType === 'question') {
            particle.style.backgroundColor = 'transparent';
            particle.style.boxShadow = 'none';
            particle.style.width = `${size * 2}px`;
            particle.style.height = `${size * 2}px`;
            particle.innerHTML = ['❓', '❔', '🤔'][Math.floor(Math.random() * 3)];
            particle.style.fontSize = `${size * 2}px`;
            particle.style.display = 'flex';
            particle.style.alignItems = 'center';
            particle.style.justifyContent = 'center';
        } else if (effectType === 'sparkle') {
            particle.style.backgroundColor = 'transparent';
            particle.style.boxShadow = 'none';
            particle.style.width = `${size * 2}px`;
            particle.style.height = `${size * 2}px`;
            particle.innerHTML = ['✨', '🌟', '⭐'][Math.floor(Math.random() * 3)];
            particle.style.fontSize = `${size * 2}px`;
            particle.style.display = 'flex';
            particle.style.alignItems = 'center';
            particle.style.justifyContent = 'center';
        }
        
        // Add to container
        container.appendChild(particle);
        
        // Calculate random direction
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * spread;
        
        // Calculate end position
        const endX = x + Math.cos(angle) * distance;
        const endY = y + Math.sin(angle) * distance;
        
        // Set initial position
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        
        // Animate particle
        const startTime = Date.now();
        
        const animateParticle = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / lifespan, 1);
            
            // Calculate current position
            const currentX = x + (endX - x) * progress;
            const currentY = y + (endY - y) * progress;
            
            // Calculate opacity
            const opacity = 1 - progress;
            
            // Update particle style
            particle.style.left = `${currentX}px`;
            particle.style.top = `${currentY}px`;
            particle.style.opacity = opacity.toString();
            
            // Continue animation or remove particle
            if (progress < 1) {
                requestAnimationFrame(animateParticle);
            } else {
                container.removeChild(particle);
            }
        };
        
        // Start animation
        requestAnimationFrame(animateParticle);
    }
    
    /**
     * Enable 3D mode
     */
    enable3DMode() {
        if (!this.pixelVisualization3D) {
            console.warn('3D Visualization not available');
            return;
        }
        
        // Update state
        this.state.is3DMode = true;
        
        // Hide 2D elements
        const pixelElement = document.getElementById('meai-pixel');
        if (pixelElement) {
            pixelElement.style.display = 'none';
        }
        
        // Show 3D container
        const container3D = document.getElementById('visualization-3d-container');
        if (container3D) {
            container3D.style.display = 'block';
        }
        
        // Initialize 3D visualization
        this.pixelVisualization3D.initialize(container3D);
        
        // Set current emotional state
        this.apply3DEmotionalState(
            this.state.emotionalState,
            this.animationMappings.emotionalStates[this.state.emotionalState],
            null,
            false
        );
        
        // Save preference
        this.savePreferences();
        
        // Notify about 3D mode change
        this.eventSystem.publish('3d-mode-changed', {
            enabled: true
        });
    }
    
    /**
     * Disable 3D mode
     */
    disable3DMode() {
        // Update state
        this.state.is3DMode = false;
        
        // Show 2D elements
        const pixelElement = document.getElementById('meai-pixel');
        if (pixelElement) {
            pixelElement.style.display = 'block';
        }
        
        // Hide 3D container
        const container3D = document.getElementById('visualization-3d-container');
        if (container3D) {
            container3D.style.display = 'none';
        }
        
        // Stop 3D visualization
        if (this.pixelVisualization3D) {
            this.pixelVisualization3D.stop();
        }
        
        // Save preference
        this.savePreferences();
        
        // Notify about 3D mode change
        this.eventSystem.publish('3d-mode-changed', {
            enabled: false
        });
    }
    
    /**
     * Toggle 3D mode
     */
    toggle3DMode() {
        if (this.state.is3DMode) {
            this.disable3DMode();
        } else {
            this.enable3DMode();
        }
    }
    
    /**
     * Trigger interaction animation
     * @param {string} interactionType - Interaction type
     * @param {Object} data - Interaction data
     */
    triggerInteractionAnimation(interactionType, data = {}) {
        if (!this.state.animationsEnabled) return;
        
        // Get interaction configuration
        let config;
        if (this.animationMappings.userInteractions[interactionType]) {
            config = this.animationMappings.userInteractions[interactionType];
        } else if (this.animationMappings.systemResponses[interactionType]) {
            config = this.animationMappings.systemResponses[interactionType];
        } else {
            console.warn(`Unknown interaction type: ${interactionType}`);
            return;
        }
        
        // Store last interaction type
        this.state.lastInteractionType = interactionType;
        
        // Apply temporary emotional state if different
        const previousEmotion = this.state.emotionalState;
        if (config.emotion && config.emotion !== previousEmotion) {
            this.setEmotionalState(config.emotion, true);
            
            // Restore previous emotion after duration
            if (config.duration > 0) {
                setTimeout(() => {
                    this.setEmotionalState(previousEmotion, true);
                }, config.duration);
            }
        }
        
        // Trigger animation
        if (config.animation) {
            this.triggerAnimation(config.animation, config.duration);
        }
        
        // Create particles
        if (config.particles && config.particles !== 'none') {
            const pixelElement = document.getElementById('meai-pixel');
            if (pixelElement) {
                const emotionConfig = this.animationMappings.emotionalStates[this.state.emotionalState];
                this.createParticleEffect(config.particles, pixelElement, emotionConfig.color);
            }
        }
        
        // Trigger 3D interaction if enabled
        if (this.state.is3DMode && this.pixelVisualization3D) {
            this.pixelVisualization3D.triggerInteraction(interactionType, {
                ...config,
                data,
                particleEffect: this.state.particleEffectsEnabled ? config.particles : 'none',
                physics: this.state.physicsEnabled,
                procedural: this.state.proceduralAnimationsEnabled
            });
        }
    }
    
    /**
     * Trigger animation
     * @param {string} animationType - Animation type
     * @param {number} duration - Animation duration
     */
    triggerAnimation(animationType, duration) {
        if (!this.state.animationsEnabled) return;
        
        const pixelElement = document.getElementById('meai-pixel');
        if (!pixelElement) return;
        
        // Remove any existing animation of this type
        if (this.state.currentAnimations.has(animationType)) {
            pixelElement.classList.remove(`animation-${animationType}`);
            
            // Clear timeout
            clearTimeout(this.state.currentAnimations.get(animationType));
            this.state.currentAnimations.delete(animationType);
        }
        
        // Add animation class
        pixelElement.classList.add(`animation-${animationType}`);
        
        // Set timeout to remove animation if duration is specified
        if (duration > 0) {
            const timeout = setTimeout(() => {
                pixelElement.classList.remove(`animation-${animationType}`);
                this.state.currentAnimations.delete(animationType);
            }, duration);
            
            // Store timeout
            this.state.currentAnimations.set(animationType, timeout);
        }
    }
    
    /**
     * Animate UI element
     * @param {HTMLElement} element - UI element
     * @param {string} elementType - Element type
     * @param {string} animationType - Animation type
     */
    animateUIElement(element, elementType, animationType) {
        if (!this.state.animationsEnabled || !element) return;
        
        // Get element configuration
        const config = this.animationMappings.uiElements[elementType];
        if (!config) {
            console.warn(`Unknown element type: ${elementType}`);
            return;
        }
        
        // Get animation
        const animation = config[animationType];
        if (!animation) {
            console.warn(`Unknown animation type for ${elementType}: ${animationType}`);
            return;
        }
        
        // Apply animation class
        element.classList.add(`animation-${animation}`);
        
        // Remove animation class after animation completes
        setTimeout(() => {
            element.classList.remove(`animation-${animation}`);
        }, 1000);
        
        // Create particles if enabled
        if (this.state.particleEffectsEnabled && config.particles && config.particles !== 'none') {
            const emotionConfig = this.animationMappings.emotionalStates[this.state.emotionalState];
            this.createParticleEffect(config.particles, element, emotionConfig.color);
        }
    }
    
    /**
     * Check performance
     */
    checkPerformance() {
        // Only check every 10 seconds
        const now = Date.now();
        if (now - this.state.lastPerformanceCheck < 10000) return;
        
        this.state.lastPerformanceCheck = now;
        
        // Calculate FPS
        const fps = this.calculateFPS();
        
        // Add to history
        this.state.fpsHistory.push(fps);
        
        // Limit history size
        if (this.state.fpsHistory.length > 10) {
            this.state.fpsHistory.shift();
        }
        
        // Calculate average FPS
        const avgFps = this.state.fpsHistory.reduce((sum, value) => sum + value, 0) / this.state.fpsHistory.length;
        
        // Adjust settings based on performance
        if (this.state.performanceMode === 'auto') {
            if (avgFps < 30) {
                // Low performance, reduce effects
                if (this.state.particleEffectsEnabled) {
                    this.state.particleEffectsEnabled = false;
                    console.log('Performance optimization: Disabled particle effects');
                } else if (this.state.physicsEnabled) {
                    this.state.physicsEnabled = false;
                    console.log('Performance optimization: Disabled physics');
                } else if (this.state.proceduralAnimationsEnabled) {
                    this.state.proceduralAnimationsEnabled = false;
                    console.log('Performance optimization: Disabled procedural animations');
                } else if (this.state.is3DMode) {
                    this.disable3DMode();
                    console.log('Performance optimization: Disabled 3D mode');
                }
            } else if (avgFps > 55) {
                // High performance, can increase effects
                if (!this.state.particleEffectsEnabled) {
                    this.state.particleEffectsEnabled = true;
                    console.log('Performance optimization: Enabled particle effects');
                } else if (!this.state.proceduralAnimationsEnabled) {
                    this.state.proceduralAnimationsEnabled = true;
                    console.log('Performance optimization: Enabled procedural animations');
                } else if (!this.state.physicsEnabled) {
                    this.state.physicsEnabled = true;
                    console.log('Performance optimization: Enabled physics');
                }
            }
        }
    }
    
    /**
     * Calculate FPS
     * @returns {number} Frames per second
     */
    calculateFPS() {
        // Use requestAnimationFrame to measure FPS
        let frameCount = 0;
        let lastTime = performance.now();
        let fps = 0;
        
        const countFrame = () => {
            const now = performance.now();
            frameCount++;
            
            if (now - lastTime >= 1000) {
                fps = frameCount;
                frameCount = 0;
                lastTime = now;
            }
            
            if (frameCount < 60) {
                requestAnimationFrame(countFrame);
            }
        };
        
        requestAnimationFrame(countFrame);
        
        // Wait for 1 second to get FPS
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(fps);
            }, 1000);
        });
    }
    
    /**
     * Save preferences
     */
    async savePreferences() {
        try {
            await this.storageManager.setIndexedDB('preferences', 'animation-ui', {
                animationsEnabled: this.state.animationsEnabled,
                emotionalState: this.state.emotionalState,
                interactionMode: this.state.interactionMode,
                visualFeedbackLevel: this.state.visualFeedbackLevel,
                particleEffectsEnabled: this.state.particleEffectsEnabled,
                physicsEnabled: this.state.physicsEnabled,
                proceduralAnimationsEnabled: this.state.proceduralAnimationsEnabled,
                is3DMode: this.state.is3DMode,
                performanceMode: this.state.performanceMode
            });
        } catch (error) {
            console.error('Error saving animation-UI preferences:', error);
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for emotional state changes
        this.eventSystem.subscribe('set-emotional-state', (data) => {
            if (data.state) {
                this.setEmotionalState(data.state, true);
            }
        });
        
        // Listen for update emotional state
        this.eventSystem.subscribe('update-emotional-state', (data) => {
            // Determine emotional state based on message and sentiment
            let emotion = 'neutral';
            
            if (data.sentiment === 'positive') {
                emotion = 'joy';
            } else if (data.sentiment === 'negative') {
                emotion = 'empathetic';
            } else {
                // Analyze message for keywords
                const message = data.message.toLowerCase();
                
                if (message.includes('help') || message.includes('assist')) {
                    emotion = 'empathetic';
                } else if (message.includes('why') || message.includes('how') || message.includes('what')) {
                    emotion = 'reflective';
                } else if (message.includes('cool') || message.includes('awesome') || message.includes('amazing')) {
                    emotion = 'excited';
                } else if (message.includes('think') || message.includes('consider')) {
                    emotion = 'reflective';
                } else if (message.includes('tell') || message.includes('show')) {
                    emotion = 'curious';
                }
            }
            
            // Set emotional state
            this.setEmotionalState(emotion, true);
        });
        
        // Listen for toggle 3D view
        this.eventSystem.subscribe('toggle-3d-view', () => {
            this.toggle3DMode();
        });
        
        // Listen for user interactions
        this.eventSystem.subscribe('message-sent', (data) => {
            this.triggerInteractionAnimation('message-sent', data);
        });
        
        this.eventSystem.subscribe('voice-input-started', () => {
            this.triggerInteractionAnimation('voice-input-started');
        });
        
        this.eventSystem.subscribe('voice-input-ended', () => {
            // Reset to previous state
            if (this.state.lastInteractionType === 'voice-input-started') {
                this.setEmotionalState('neutral', true);
            }
        });
        
        // Listen for system responses
        this.eventSystem.subscribe('thinking', () => {
            this.triggerInteractionAnimation('thinking');
        });
        
        this.eventSystem.subscribe('responding', (data) => {
            this.triggerInteractionAnimation('responding', data);
        });
        
        this.eventSystem.subscribe('error', (data) => {
            this.triggerInteractionAnimation('error', data);
        });
        
        // Listen for UI element interactions
        this.eventSystem.subscribe('ui-element-interaction', (data) => {
            if (data.element && data.elementType && data.animationType) {
                this.animateUIElement(data.element, data.elementType, data.animationType);
            }
        });
        
        // Listen for animation toggle
        this.eventSystem.subscribe('toggle-animations', (data) => {
            this.state.animationsEnabled = data.enabled;
            this.savePreferences();
        });
        
        // Listen for particle effects toggle
        this.eventSystem.subscribe('toggle-particle-effects', (data) => {
            this.state.particleEffectsEnabled = data.enabled;
            this.savePreferences();
        });
        
        // Listen for physics toggle
        this.eventSystem.subscribe('toggle-physics', (data) => {
            this.state.physicsEnabled = data.enabled;
            this.savePreferences();
        });
        
        // Listen for procedural animations toggle
        this.eventSystem.subscribe('toggle-procedural-animations', (data) => {
            this.state.proceduralAnimationsEnabled = data.enabled;
            this.savePreferences();
        });
        
        // Listen for performance mode change
        this.eventSystem.subscribe('set-performance-mode', (data) => {
            if (data.mode) {
                this.state.performanceMode = data.mode;
                this.savePreferences();
            }
        });
        
        // Set up DOM event listeners
        document.addEventListener('DOMContentLoaded', () => {
            // Toggle 3D button
            const toggle3DButton = document.getElementById('toggle-3d');
            if (toggle3DButton) {
                toggle3DButton.addEventListener('click', () => {
                    this.toggle3DMode();
                });
            }
            
            // Emotion buttons
            document.body.addEventListener('click', (event) => {
                const emotionButton = event.target.closest('.emotion-button');
                if (emotionButton) {
                    const emotion = emotionButton.getAttribute('data-emotion');
                    if (emotion) {
                        this.setEmotionalState(emotion, true);
                    }
                }
            });
            
            // Button hover animations
            document.body.addEventListener('mouseover', (event) => {
                const button = event.target.closest('button');
                if (button) {
                    this.animateUIElement(button, 'button', 'hover');
                }
            });
            
            // Input focus animations
            document.body.addEventListener('focus', (event) => {
                const input = event.target.closest('input, textarea');
                if (input) {
                    this.animateUIElement(input, 'input', 'focus');
                }
            }, true);
            
            // Start performance monitoring
            if (this.state.performanceMode === 'auto') {
                setInterval(() => {
                    this.checkPerformance();
                }, 10000);
            }
        });
    }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationUIIntegration;
} else {
    window.AnimationUIIntegration = AnimationUIIntegration;
}
