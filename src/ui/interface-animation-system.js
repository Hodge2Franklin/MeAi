/**
 * Interface Animation System
 * 
 * This system provides smooth, purposeful animations for UI elements,
 * with configurable animation types, timing, and accessibility options.
 */

class InterfaceAnimationSystem {
    constructor() {
        // Initialize dependencies
        this.storageManager = window.storageManager;
        this.eventSystem = window.eventSystem;
        this.themeSystem = window.themeSystem;
        
        // Animation configuration
        this.config = {
            // Animation types
            types: {
                fade: {
                    in: {
                        keyframes: [
                            { opacity: 0 },
                            { opacity: 1 }
                        ],
                        options: {
                            duration: 300,
                            easing: 'ease-in-out',
                            fill: 'forwards'
                        }
                    },
                    out: {
                        keyframes: [
                            { opacity: 1 },
                            { opacity: 0 }
                        ],
                        options: {
                            duration: 300,
                            easing: 'ease-in-out',
                            fill: 'forwards'
                        }
                    }
                },
                slide: {
                    in: {
                        keyframes: [
                            { transform: 'translateY(20px)', opacity: 0 },
                            { transform: 'translateY(0)', opacity: 1 }
                        ],
                        options: {
                            duration: 400,
                            easing: 'ease-out',
                            fill: 'forwards'
                        }
                    },
                    out: {
                        keyframes: [
                            { transform: 'translateY(0)', opacity: 1 },
                            { transform: 'translateY(20px)', opacity: 0 }
                        ],
                        options: {
                            duration: 400,
                            easing: 'ease-in',
                            fill: 'forwards'
                        }
                    }
                },
                scale: {
                    in: {
                        keyframes: [
                            { transform: 'scale(0.95)', opacity: 0 },
                            { transform: 'scale(1)', opacity: 1 }
                        ],
                        options: {
                            duration: 350,
                            easing: 'ease-out',
                            fill: 'forwards'
                        }
                    },
                    out: {
                        keyframes: [
                            { transform: 'scale(1)', opacity: 1 },
                            { transform: 'scale(0.95)', opacity: 0 }
                        ],
                        options: {
                            duration: 350,
                            easing: 'ease-in',
                            fill: 'forwards'
                        }
                    }
                },
                pulse: {
                    keyframes: [
                        { transform: 'scale(1)' },
                        { transform: 'scale(1.05)' },
                        { transform: 'scale(1)' }
                    ],
                    options: {
                        duration: 500,
                        easing: 'ease-in-out'
                    }
                },
                shake: {
                    keyframes: [
                        { transform: 'translateX(0)' },
                        { transform: 'translateX(-5px)' },
                        { transform: 'translateX(5px)' },
                        { transform: 'translateX(-5px)' },
                        { transform: 'translateX(5px)' },
                        { transform: 'translateX(0)' }
                    ],
                    options: {
                        duration: 500,
                        easing: 'ease-in-out'
                    }
                },
                bounce: {
                    keyframes: [
                        { transform: 'translateY(0)' },
                        { transform: 'translateY(-10px)' },
                        { transform: 'translateY(0)' },
                        { transform: 'translateY(-5px)' },
                        { transform: 'translateY(0)' }
                    ],
                    options: {
                        duration: 800,
                        easing: 'ease-in-out'
                    }
                }
            },
            
            // Element-specific animations
            elements: {
                message: {
                    enter: 'slide-in',
                    exit: 'fade-out'
                },
                button: {
                    hover: 'scale',
                    active: 'pulse'
                },
                input: {
                    focus: 'pulse',
                    error: 'shake'
                },
                notification: {
                    enter: 'slide-in',
                    exit: 'slide-out'
                },
                modal: {
                    enter: 'fade-in',
                    exit: 'fade-out'
                },
                pixel: {
                    stateChange: 'pulse',
                    emphasis: 'bounce'
                }
            },
            
            // Timing configuration
            timing: {
                stagger: 50, // ms between staggered animations
                delay: {
                    short: 100,
                    medium: 300,
                    long: 600
                }
            }
        };
        
        // Animation state
        this.state = {
            enabled: true,
            reducedMotion: false,
            intensity: 1.0,
            activeAnimations: new Map()
        };
        
        // Initialize
        this.initialize();
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    /**
     * Initialize the interface animation system
     */
    async initialize() {
        try {
            // Check for reduced motion preference
            this.checkReducedMotionPreference();
            
            // Load user preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'user-preferences');
            if (preferences) {
                if (preferences.animationsEnabled !== undefined) {
                    this.state.enabled = preferences.animationsEnabled;
                }
                
                if (preferences.reducedMotion !== undefined) {
                    this.state.reducedMotion = preferences.reducedMotion;
                }
                
                if (preferences.animationIntensity !== undefined) {
                    this.state.intensity = preferences.animationIntensity;
                }
            }
            
            // Apply animation settings
            this.applyAnimationSettings();
            
            console.log('Interface Animation System initialized');
            
            // Notify system that animations are ready
            this.eventSystem.publish('animation-system-ready', {
                enabled: this.state.enabled,
                reducedMotion: this.state.reducedMotion,
                intensity: this.state.intensity
            });
        } catch (error) {
            console.error('Error initializing interface animation system:', error);
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for animation requests
        this.eventSystem.subscribe('animate-element', (data) => {
            this.animateElement(data.element, data.animation, data.options);
        });
        
        // Listen for animation enable/disable
        this.eventSystem.subscribe('animation-toggle', (data) => {
            this.toggleAnimations(data.enabled);
        });
        
        // Listen for reduced motion toggle
        this.eventSystem.subscribe('reduced-motion-toggle', (data) => {
            this.toggleReducedMotion(data.enabled);
        });
        
        // Listen for animation intensity change
        this.eventSystem.subscribe('animation-intensity-change', (data) => {
            this.setAnimationIntensity(data.intensity);
        });
        
        // Listen for theme changes
        this.eventSystem.subscribe('theme-changed', () => {
            this.applyAnimationSettings();
        });
        
        // Listen for message events
        this.eventSystem.subscribe('user-message-received', (data) => {
            this.handleMessageReceived('user', data);
        });
        
        this.eventSystem.subscribe('ai-response-sent', (data) => {
            this.handleMessageReceived('ai', data);
        });
        
        // Listen for typing indicator events
        this.eventSystem.subscribe('typing-indicator-show', () => {
            this.showTypingIndicator();
        });
        
        this.eventSystem.subscribe('typing-indicator-hide', () => {
            this.hideTypingIndicator();
        });
        
        // Listen for emotional state changes
        this.eventSystem.subscribe('meai-emotional-state-change', (data) => {
            this.handleEmotionalStateChange(data.emotion, data.intensity);
        });
        
        // Set up DOM event listeners
        document.addEventListener('DOMContentLoaded', () => {
            // Set up animation toggle
            const animationToggle = document.getElementById('animation-toggle');
            if (animationToggle) {
                animationToggle.checked = this.state.enabled;
                animationToggle.addEventListener('change', (event) => {
                    this.toggleAnimations(event.target.checked);
                });
            }
            
            // Set up reduced motion toggle
            const reducedMotionToggle = document.getElementById('reduced-motion-toggle');
            if (reducedMotionToggle) {
                reducedMotionToggle.checked = this.state.reducedMotion;
                reducedMotionToggle.addEventListener('change', (event) => {
                    this.toggleReducedMotion(event.target.checked);
                });
            }
            
            // Set up animation intensity slider
            const intensitySlider = document.getElementById('animation-intensity');
            if (intensitySlider) {
                intensitySlider.value = this.state.intensity;
                intensitySlider.addEventListener('input', (event) => {
                    this.setAnimationIntensity(parseFloat(event.target.value));
                });
            }
            
            // Apply initial animations to elements
            this.applyInitialAnimations();
        });
        
        // Listen for reduced motion preference changes
        if (window.matchMedia) {
            const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            reducedMotionQuery.addEventListener('change', () => {
                this.checkReducedMotionPreference();
            });
        }
    }
    
    /**
     * Check system preference for reduced motion
     */
    checkReducedMotionPreference() {
        if (window.matchMedia) {
            const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            if (reducedMotionQuery.matches) {
                this.state.reducedMotion = true;
            }
        }
    }
    
    /**
     * Apply animation settings based on current state
     */
    applyAnimationSettings() {
        const root = document.documentElement;
        
        // Set CSS variables for animation settings
        root.style.setProperty('--animation-enabled', this.state.enabled ? '1' : '0');
        root.style.setProperty('--reduced-motion', this.state.reducedMotion ? '1' : '0');
        root.style.setProperty('--animation-intensity', this.state.intensity.toString());
        
        // Apply CSS classes to body
        if (this.state.enabled) {
            document.body.classList.add('animations-enabled');
            document.body.classList.remove('animations-disabled');
        } else {
            document.body.classList.add('animations-disabled');
            document.body.classList.remove('animations-enabled');
        }
        
        if (this.state.reducedMotion) {
            document.body.classList.add('reduced-motion');
        } else {
            document.body.classList.remove('reduced-motion');
        }
        
        // Update animation durations based on intensity
        this.updateAnimationDurations();
    }
    
    /**
     * Update animation durations based on intensity
     */
    updateAnimationDurations() {
        // Adjust durations based on intensity
        for (const type in this.config.types) {
            const animationType = this.config.types[type];
            
            // Handle animations with in/out variants
            if (animationType.in && animationType.out) {
                // Adjust in animation
                const originalInDuration = animationType.in.options.originalDuration || animationType.in.options.duration;
                animationType.in.options.originalDuration = originalInDuration;
                animationType.in.options.duration = Math.round(originalInDuration / this.state.intensity);
                
                // Adjust out animation
                const originalOutDuration = animationType.out.options.originalDuration || animationType.out.options.duration;
                animationType.out.options.originalDuration = originalOutDuration;
                animationType.out.options.duration = Math.round(originalOutDuration / this.state.intensity);
            } 
            // Handle single animations
            else if (animationType.options) {
                const originalDuration = animationType.options.originalDuration || animationType.options.duration;
                animationType.options.originalDuration = originalDuration;
                animationType.options.duration = Math.round(originalDuration / this.state.intensity);
            }
        }
    }
    
    /**
     * Apply initial animations to elements on page load
     */
    applyInitialAnimations() {
        if (!this.state.enabled) return;
        
        // Animate main container
        const mainContainer = document.querySelector('.main-container');
        if (mainContainer) {
            this.animateElement(mainContainer, 'fade-in', { delay: 100 });
        }
        
        // Animate header
        const header = document.querySelector('header');
        if (header) {
            this.animateElement(header, 'fade-in', { delay: 200 });
        }
        
        // Animate pixel
        const pixel = document.querySelector('.pixel');
        if (pixel) {
            this.animateElement(pixel, 'scale-in', { delay: 500 });
        }
        
        // Animate buttons with staggered delay
        const buttons = document.querySelectorAll('button');
        this.animateElementsSequentially(buttons, 'fade-in', { 
            delay: 300, 
            staggerDelay: this.config.timing.stagger 
        });
        
        // Set up hover animations for buttons
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                if (this.state.enabled) {
                    this.animateElement(button, 'pulse');
                }
            });
        });
        
        // Set up focus animations for inputs
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                if (this.state.enabled) {
                    this.animateElement(input, 'pulse');
                }
            });
        });
    }
    
    /**
     * Animate a single element
     * @param {HTMLElement|string} element - Element or selector to animate
     * @param {string} animationName - Name of animation to apply
     * @param {Object} options - Animation options
     */
    animateElement(element, animationName, options = {}) {
        // Skip if animations are disabled
        if (!this.state.enabled && !options.forceAnimation) return;
        
        // Get element if string selector was provided
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        // Skip if element doesn't exist
        if (!element) return;
        
        // Parse animation name (e.g., 'fade-in', 'slide-out')
        const [type, variant] = animationName.split('-');
        
        // Get animation configuration
        let animation;
        if (variant && (variant === 'in' || variant === 'out')) {
            animation = this.config.types[type]?.[variant];
        } else {
            animation = this.config.types[type];
        }
        
        // Skip if animation doesn't exist
        if (!animation) {
            console.warn(`Animation not found: ${animationName}`);
            return;
        }
        
        // Apply reduced motion if enabled
        let keyframes = [...animation.keyframes];
        let animOptions = { ...animation.options };
        
        if (this.state.reducedMotion && !options.ignoreReducedMotion) {
            // Simplify animation for reduced motion
            keyframes = this.simplifyForReducedMotion(keyframes);
            
            // Reduce duration
            animOptions.duration = Math.min(animOptions.duration, 200);
        }
        
        // Apply custom options
        if (options.duration) animOptions.duration = options.duration;
        if (options.delay) animOptions.delay = options.delay;
        if (options.easing) animOptions.easing = options.easing;
        if (options.iterations) animOptions.iterations = options.iterations;
        
        // Stop any active animation on this element
        this.stopAnimation(element);
        
        // Start animation with Web Animations API
        try {
            const animation = element.animate(keyframes, animOptions);
            
            // Store reference to active animation
            this.state.activeAnimations.set(element, animation);
            
            // Remove from active animations when complete
            animation.onfinish = () => {
                this.state.activeAnimations.delete(element);
                
                // Apply final state if needed
                if (options.applyFinalState) {
                    const finalKeyframe = keyframes[keyframes.length - 1];
                    for (const property in finalKeyframe) {
                        element.style[property] = finalKeyframe[property];
                    }
                }
                
                // Callback when animation finishes
                if (options.onComplete) {
                    options.onComplete(element);
                }
            };
            
            return animation;
        } catch (error) {
            console.error('Error animating element:', error);
            
            // Apply final state as fallback
            if (options.applyFinalState) {
                const finalKeyframe = keyframes[keyframes.length - 1];
                for (const property in finalKeyframe) {
                    element.style[property] = finalKeyframe[property];
                }
            }
        }
    }
    
    /**
     * Animate multiple elements sequentially with staggered delay
     * @param {NodeList|Array} elements - Elements to animate
     * @param {string} animationName - Name of animation to apply
     * @param {Object} options - Animation options
     */
    animateElementsSequentially(elements, animationName, options = {}) {
        // Skip if animations are disabled
        if (!this.state.enabled && !options.forceAnimation) return;
        
        // Convert NodeList to Array if needed
        const elementsArray = Array.from(elements);
        
        // Calculate base delay
        const baseDelay = options.delay || 0;
        const staggerDelay = options.staggerDelay || this.config.timing.stagger;
        
        // Animate each element with increasing delay
        elementsArray.forEach((element, index) => {
            const delay = baseDelay + (index * staggerDelay);
            this.animateElement(element, animationName, {
                ...options,
                delay: delay
            });
        });
    }
    
    /**
     * Stop active animation on an element
     * @param {HTMLElement} element - Element to stop animation on
     */
    stopAnimation(element) {
        if (this.state.activeAnimations.has(element)) {
            const animation = this.state.activeAnimations.get(element);
            animation.cancel();
            this.state.activeAnimations.delete(element);
        }
    }
    
    /**
     * Simplify keyframes for reduced motion
     * @param {Array} keyframes - Original keyframes
     * @returns {Array} - Simplified keyframes
     */
    simplifyForReducedMotion(keyframes) {
        // If only two keyframes (start and end), keep them
        if (keyframes.length <= 2) return keyframes;
        
        // Otherwise, just keep first and last keyframe
        return [keyframes[0], keyframes[keyframes.length - 1]];
    }
    
    /**
     * Toggle animations on/off
     * @param {boolean} enabled - Whether animations should be enabled
     */
    async toggleAnimations(enabled) {
        // Update state
        this.state.enabled = enabled;
        
        // Apply settings
        this.applyAnimationSettings();
        
        // Save preference
        try {
            // Get current preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'user-preferences') || {
                id: 'user-preferences'
            };
            
            // Update animations preference
            preferences.animationsEnabled = enabled;
            
            // Save preferences
            await this.storageManager.setIndexedDB('preferences', preferences);
            
            // Publish event that animations were toggled
            this.eventSystem.publish('animations-toggled', {
                enabled: enabled
            });
            
            console.log(`Animations ${enabled ? 'enabled' : 'disabled'}`);
        } catch (error) {
            console.error('Error saving animation preference:', error);
        }
    }
    
    /**
     * Toggle reduced motion setting
     * @param {boolean} enabled - Whether reduced motion should be enabled
     */
    async toggleReducedMotion(enabled) {
        // Update state
        this.state.reducedMotion = enabled;
        
        // Apply settings
        this.applyAnimationSettings();
        
        // Save preference
        try {
            // Get current preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'user-preferences') || {
                id: 'user-preferences'
            };
            
            // Update reduced motion preference
            preferences.reducedMotion = enabled;
            
            // Save preferences
            await this.storageManager.setIndexedDB('preferences', preferences);
            
            // Publish event that reduced motion was toggled
            this.eventSystem.publish('reduced-motion-toggled', {
                enabled: enabled
            });
            
            console.log(`Reduced motion ${enabled ? 'enabled' : 'disabled'}`);
        } catch (error) {
            console.error('Error saving reduced motion preference:', error);
        }
    }
    
    /**
     * Set animation intensity
     * @param {number} intensity - Animation intensity (0.5-2.0)
     */
    async setAnimationIntensity(intensity) {
        // Validate and normalize intensity
        intensity = Math.max(0.5, Math.min(2.0, intensity));
        
        // Update state
        this.state.intensity = intensity;
        
        // Apply settings
        this.applyAnimationSettings();
        
        // Save preference
        try {
            // Get current preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'user-preferences') || {
                id: 'user-preferences'
            };
            
            // Update animation intensity preference
            preferences.animationIntensity = intensity;
            
            // Save preferences
            await this.storageManager.setIndexedDB('preferences', preferences);
            
            // Publish event that animation intensity was changed
            this.eventSystem.publish('animation-intensity-changed', {
                intensity: intensity
            });
            
            console.log(`Animation intensity set to: ${intensity}`);
        } catch (error) {
            console.error('Error saving animation intensity preference:', error);
        }
    }
    
    /**
     * Handle new message received
     * @param {string} sender - Message sender ('user' or 'ai')
     * @param {Object} data - Message data
     */
    handleMessageReceived(sender, data) {
        // Skip if animations are disabled
        if (!this.state.enabled) return;
        
        // Find message container
        const messagesContainer = document.querySelector('.messages-container');
        if (!messagesContainer) return;
        
        // Wait for message element to be added to DOM
        setTimeout(() => {
            // Get the last message element
            const messageElement = messagesContainer.lastElementChild;
            if (!messageElement) return;
            
            // Add appropriate class
            messageElement.classList.add(`${sender}-message`);
            
            // Animate message appearance
            this.animateElement(messageElement, 'slide-in', {
                duration: 400,
                easing: 'ease-out'
            });
            
            // Scroll to bottom of messages container
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 10);
    }
    
    /**
     * Show typing indicator with animation
     */
    showTypingIndicator() {
        // Skip if animations are disabled
        if (!this.state.enabled) return;
        
        const typingIndicator = document.getElementById('typing-indicator');
        if (!typingIndicator) return;
        
        // Remove hidden class
        typingIndicator.classList.remove('hidden');
        
        // Animate appearance
        this.animateElement(typingIndicator, 'fade-in', {
            duration: 200,
            easing: 'ease-out'
        });
        
        // Animate dots
        const dots = typingIndicator.querySelectorAll('.typing-dot');
        if (dots.length > 0) {
            dots.forEach((dot, index) => {
                // Create bounce animation
                const bounceKeyframes = [
                    { transform: 'translateY(0)' },
                    { transform: 'translateY(-5px)' },
                    { transform: 'translateY(0)' }
                ];
                
                const bounceOptions = {
                    duration: 1000,
                    delay: index * 150,
                    iterations: Infinity,
                    easing: 'ease-in-out'
                };
                
                // Apply reduced motion if enabled
                if (this.state.reducedMotion) {
                    bounceOptions.duration = 1500;
                    bounceKeyframes[1].transform = 'translateY(-2px)';
                }
                
                // Animate dot
                const animation = dot.animate(bounceKeyframes, bounceOptions);
                
                // Store reference to active animation
                this.state.activeAnimations.set(dot, animation);
            });
        }
    }
    
    /**
     * Hide typing indicator with animation
     */
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (!typingIndicator) return;
        
        // Stop dot animations
        const dots = typingIndicator.querySelectorAll('.typing-dot');
        dots.forEach(dot => {
            this.stopAnimation(dot);
        });
        
        // Animate disappearance
        if (this.state.enabled) {
            this.animateElement(typingIndicator, 'fade-out', {
                duration: 200,
                easing: 'ease-out',
                onComplete: () => {
                    typingIndicator.classList.add('hidden');
                }
            });
        } else {
            typingIndicator.classList.add('hidden');
        }
    }
    
    /**
     * Handle emotional state change
     * @param {string} emotion - Emotional state
     * @param {number} intensity - Emotion intensity (0-1)
     */
    handleEmotionalStateChange(emotion, intensity) {
        // Skip if animations are disabled
        if (!this.state.enabled) return;
        
        // Find pixel element
        const pixel = document.querySelector('.pixel');
        if (!pixel) return;
        
        // Define animation based on emotion
        let animationName;
        switch (emotion) {
            case 'joy':
                animationName = 'bounce';
                break;
            case 'excited':
                animationName = 'pulse';
                break;
            case 'curious':
                animationName = 'pulse';
                break;
            case 'reflective':
                animationName = 'pulse';
                break;
            case 'empathetic':
                animationName = 'pulse';
                break;
            default:
                return; // No animation for other emotions
        }
        
        // Only animate if intensity is high enough
        if (intensity > 0.6) {
            this.animateElement(pixel, animationName, {
                duration: 600,
                easing: 'ease-in-out'
            });
        }
    }
}

// Initialize the interface animation system when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.interfaceAnimationSystem = new InterfaceAnimationSystem();
});
