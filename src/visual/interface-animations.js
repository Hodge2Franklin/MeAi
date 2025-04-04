/**
 * Interface Animations and Transitions for MeAI
 * 
 * Features:
 * - Smooth transitions between interface states
 * - Animated message appearance and typing indicators
 * - Responsive hover and click effects
 * - Loading and progress animations
 * - Accessibility-friendly motion controls
 */

class InterfaceAnimations {
    constructor() {
        // Animation settings
        this.settings = {
            duration: {
                short: 200,
                medium: 500,
                long: 1000
            },
            easing: {
                default: 'ease',
                bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
                decelerate: 'cubic-bezier(0, 0, 0.2, 1)'
            },
            typing: {
                speed: 50, // ms per character
                variance: 0.3 // random variance in typing speed
            },
            enabled: true, // Global toggle for animations
            reducedMotion: false // Respect user's reduced motion preference
        };
        
        // Animation states
        this.states = {
            isTyping: false,
            currentAnimation: null,
            messageQueue: []
        };
        
        // Element references
        this.elements = {
            container: null,
            conversationHistory: null,
            messageInput: null,
            sendButton: null,
            micButton: null,
            pixel: null
        };
    }
    
    /**
     * Initialize the animation system
     * @param {Object} elements References to DOM elements
     */
    initialize(elements) {
        // Store element references
        this.elements = { ...this.elements, ...elements };
        
        // Check for reduced motion preference
        this.checkReducedMotion();
        
        // Add event listeners for animation triggers
        this.setupEventListeners();
        
        // Add initial animations
        this.animateInitialLoad();
        
        console.log('Interface Animations initialized');
        return true;
    }
    
    /**
     * Check if user prefers reduced motion
     */
    checkReducedMotion() {
        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.settings.reducedMotion = reducedMotionQuery.matches;
        
        // Listen for changes to the prefers-reduced-motion media query
        reducedMotionQuery.addEventListener('change', () => {
            this.settings.reducedMotion = reducedMotionQuery.matches;
        });
    }
    
    /**
     * Set up event listeners for animation triggers
     */
    setupEventListeners() {
        // Add hover animations to buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => this.animateButtonHover(button, true));
            button.addEventListener('mouseleave', () => this.animateButtonHover(button, false));
            button.addEventListener('click', () => this.animateButtonClick(button));
        });
        
        // Add focus animations to input
        if (this.elements.messageInput) {
            this.elements.messageInput.addEventListener('focus', () => this.animateInputFocus(true));
            this.elements.messageInput.addEventListener('blur', () => this.animateInputFocus(false));
        }
    }
    
    /**
     * Animate the initial page load
     */
    animateInitialLoad() {
        if (!this.settings.enabled || this.settings.reducedMotion) return;
        
        // Fade in the container
        const container = this.elements.container || document.querySelector('.container');
        if (container) {
            container.style.opacity = '0';
            container.style.transform = 'translateY(20px)';
            container.style.transition = `opacity ${this.settings.duration.medium}ms ${this.settings.easing.default}, transform ${this.settings.duration.medium}ms ${this.settings.easing.default}`;
            
            // Trigger animation after a small delay
            setTimeout(() => {
                container.style.opacity = '1';
                container.style.transform = 'translateY(0)';
            }, 100);
        }
        
        // Animate the pixel appearance
        if (this.elements.pixel) {
            this.elements.pixel.style.opacity = '0';
            this.elements.pixel.style.transform = 'scale(0.5)';
            this.elements.pixel.style.transition = `opacity ${this.settings.duration.medium}ms ${this.settings.easing.bounce}, transform ${this.settings.duration.medium}ms ${this.settings.easing.bounce}`;
            
            setTimeout(() => {
                this.elements.pixel.style.opacity = '1';
                this.elements.pixel.style.transform = 'scale(1)';
            }, 500);
        }
    }
    
    /**
     * Animate button hover state
     * @param {HTMLElement} button Button element
     * @param {boolean} isHovering Whether the button is being hovered
     */
    animateButtonHover(button, isHovering) {
        if (!this.settings.enabled) return;
        
        if (isHovering) {
            button.style.transform = 'scale(1.05)';
            button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        } else {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        }
    }
    
    /**
     * Animate button click
     * @param {HTMLElement} button Button element
     */
    animateButtonClick(button) {
        if (!this.settings.enabled) return;
        
        // Create ripple effect
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        button.appendChild(ripple);
        
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = `${size}px`;
        
        // Position ripple at click point
        ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
        
        // Remove ripple after animation completes
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    /**
     * Animate input focus state
     * @param {boolean} isFocused Whether the input is focused
     */
    animateInputFocus(isFocused) {
        if (!this.settings.enabled || !this.elements.messageInput) return;
        
        const inputContainer = this.elements.messageInput.closest('.input-container');
        if (!inputContainer) return;
        
        if (isFocused) {
            inputContainer.style.boxShadow = '0 0 0 2px rgba(0, 226, 255, 0.5)';
            inputContainer.style.transform = 'translateY(-2px)';
        } else {
            inputContainer.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            inputContainer.style.transform = 'translateY(0)';
        }
    }
    
    /**
     * Animate message addition to conversation
     * @param {HTMLElement} messageElement Message element to animate
     * @param {string} sender Message sender ('user' or 'meai')
     */
    animateMessageAddition(messageElement, sender) {
        if (!this.settings.enabled) {
            messageElement.style.opacity = '1';
            return;
        }
        
        // Set initial state
        messageElement.style.opacity = '0';
        messageElement.style.transform = sender === 'user' 
            ? 'translateX(20px)' 
            : 'translateX(-20px)';
        messageElement.style.transition = `opacity ${this.settings.duration.medium}ms ${this.settings.easing.default}, transform ${this.settings.duration.medium}ms ${this.settings.easing.default}`;
        
        // Trigger animation
        setTimeout(() => {
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateX(0)';
        }, 10);
        
        // Scroll to bottom of conversation
        if (this.elements.conversationHistory) {
            this.elements.conversationHistory.scrollTop = this.elements.conversationHistory.scrollHeight;
        }
    }
    
    /**
     * Show typing indicator
     * @returns {HTMLElement} Typing indicator element
     */
    showTypingIndicator() {
        if (!this.elements.conversationHistory) return null;
        
        // Create typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('typing-indicator');
        
        // Create dots
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            typingIndicator.appendChild(dot);
        }
        
        // Add to conversation
        this.elements.conversationHistory.appendChild(typingIndicator);
        
        // Animate dots
        const dots = typingIndicator.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.style.animationDelay = `${index * 0.2}s`;
        });
        
        // Scroll to bottom
        this.elements.conversationHistory.scrollTop = this.elements.conversationHistory.scrollHeight;
        
        return typingIndicator;
    }
    
    /**
     * Hide typing indicator
     * @param {HTMLElement} typingIndicator Typing indicator element
     */
    hideTypingIndicator(typingIndicator) {
        if (!typingIndicator) return;
        
        // Fade out
        typingIndicator.style.opacity = '0';
        
        // Remove after animation
        setTimeout(() => {
            if (typingIndicator.parentNode) {
                typingIndicator.parentNode.removeChild(typingIndicator);
            }
        }, 300);
    }
    
    /**
     * Animate typing effect for a message
     * @param {HTMLElement} messageElement Message element
     * @param {string} text Full text to type
     * @param {Function} callback Callback function when typing is complete
     */
    animateTyping(messageElement, text, callback) {
        if (!this.settings.enabled || this.settings.reducedMotion) {
            messageElement.textContent = text;
            if (callback) callback();
            return;
        }
        
        // If already typing, queue this message
        if (this.states.isTyping) {
            this.states.messageQueue.push({ messageElement, text, callback });
            return;
        }
        
        this.states.isTyping = true;
        
        // Clear message content
        messageElement.textContent = '';
        
        let charIndex = 0;
        const typeNextChar = () => {
            if (charIndex < text.length) {
                // Add next character
                messageElement.textContent += text.charAt(charIndex);
                charIndex++;
                
                // Calculate delay for next character
                const baseDelay = this.settings.typing.speed;
                const variance = baseDelay * this.settings.typing.variance;
                const delay = baseDelay + (Math.random() * variance * 2 - variance);
                
                // Add longer pause for punctuation
                const punctuation = ['.', '!', '?', ',', ';', ':'];
                if (punctuation.includes(text.charAt(charIndex - 1))) {
                    setTimeout(typeNextChar, delay * 4);
                } else {
                    setTimeout(typeNextChar, delay);
                }
                
                // Scroll to bottom as typing progresses
                if (this.elements.conversationHistory) {
                    this.elements.conversationHistory.scrollTop = this.elements.conversationHistory.scrollHeight;
                }
            } else {
                // Typing complete
                this.states.isTyping = false;
                
                // Call callback if provided
                if (callback) callback();
                
                // Process next message in queue
                if (this.states.messageQueue.length > 0) {
                    const nextMessage = this.states.messageQueue.shift();
                    this.animateTyping(nextMessage.messageElement, nextMessage.text, nextMessage.callback);
                }
            }
        };
        
        // Start typing
        typeNextChar();
    }
    
    /**
     * Animate microphone activation
     * @param {boolean} isActive Whether the microphone is active
     */
    animateMicrophone(isActive) {
        if (!this.settings.enabled || !this.elements.micButton) return;
        
        if (isActive) {
            // Pulse animation
            this.elements.micButton.classList.add('mic-active');
            
            // Add ripple effect
            const ripple = document.createElement('span');
            ripple.classList.add('mic-ripple');
            this.elements.micButton.appendChild(ripple);
        } else {
            // Remove active class
            this.elements.micButton.classList.remove('mic-active');
            
            // Remove ripple
            const ripple = this.elements.micButton.querySelector('.mic-ripple');
            if (ripple) {
                ripple.style.opacity = '0';
                setTimeout(() => {
                    if (ripple.parentNode) {
                        ripple.parentNode.removeChild(ripple);
                    }
                }, 300);
            }
        }
    }
    
    /**
     * Animate page transition
     * @param {Function} callback Callback function when transition is complete
     */
    animatePageTransition(callback) {
        if (!this.settings.enabled || this.settings.reducedMotion) {
            if (callback) callback();
            return;
        }
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.classList.add('page-transition-overlay');
        document.body.appendChild(overlay);
        
        // Animate overlay in
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 10);
        
        // Execute callback after transition
        setTimeout(() => {
            if (callback) callback();
            
            // Animate overlay out
            overlay.style.opacity = '0';
            
            // Remove overlay
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, this.settings.duration.medium);
        }, this.settings.duration.medium);
    }
    
    /**
     * Animate notification
     * @param {string} message Notification message
     * @param {string} type Notification type ('info', 'success', 'error')
     * @param {number} duration Duration in milliseconds
     */
    showNotification(message, type = 'info', duration = 3000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.classList.add('notification', `notification-${type}`);
        notification.textContent = message;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateY(0)';
            notification.style.opacity = '1';
        }, 10);
        
        // Animate out after duration
        setTimeout(() => {
            notification.style.transform = 'translateY(-20px)';
            notification.style.opacity = '0';
            
            // Remove after animation
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, this.settings.duration.medium);
        }, duration);
        
        return notification;
    }
    
    /**
     * Toggle animation settings
     * @param {boolean} enabled Whether animations are enabled
     */
    setAnimationsEnabled(enabled) {
        this.settings.enabled = enabled;
        
        // Add or remove class from body
        if (enabled) {
            document.body.classList.remove('animations-disabled');
        } else {
            document.body.classList.add('animations-disabled');
        }
        
        console.log(`Animations ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Update animation settings
     * @param {Object} settings New settings
     */
    updateSettings(settings) {
        this.settings = { ...this.settings, ...settings };
        console.log('Animation settings updated:', this.settings);
    }
}
