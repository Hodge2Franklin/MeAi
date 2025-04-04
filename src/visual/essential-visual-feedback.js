/**
 * Essential Visual Feedback System
 * 
 * This system provides visual feedback for user interactions and AI states,
 * enhancing the user experience with subtle, meaningful visual cues.
 */

class VisualFeedbackSystem {
    constructor() {
        // Initialize dependencies
        this.eventSystem = window.eventSystem || this.createEventSystem();
        
        // Initialize state
        this.state = {
            initialized: false,
            currentEmotion: 'neutral',
            isAnimating: false,
            visualizationMinimized: false,
            darkMode: false,
            reducedMotion: false
        };
        
        // DOM elements
        this.elements = {
            visualizationArea: null,
            dynamicBackground: null,
            pixelContainer: null,
            meaiPixel: null,
            conversationHistory: null
        };
        
        // Emotion colors
        this.emotionColors = {
            neutral: '#4a6fa5',
            happy: '#4CAF50',
            sad: '#5C6BC0',
            angry: '#F44336',
            surprised: '#FF9800',
            confused: '#9C27B0',
            thinking: '#607D8B'
        };
        
        // Animation timings
        this.animationTimings = {
            standard: 300,
            slow: 600,
            fast: 150
        };
        
        // Initialize the system
        this.initialize();
    }
    
    /**
     * Initialize the visual feedback system
     */
    initialize() {
        try {
            console.log('Initializing Visual Feedback System...');
            
            // Find DOM elements
            this.findDOMElements();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load settings
            this.loadSettings();
            
            // Initialize visualization
            this.initializeVisualization();
            
            // Mark as initialized
            this.state.initialized = true;
            
            console.log('Visual Feedback System initialized successfully');
            
            return true;
        } catch (error) {
            console.error('Error initializing Visual Feedback System:', error);
            return false;
        }
    }
    
    /**
     * Create a simple event system if the global one is not available
     */
    createEventSystem() {
        console.warn('Global EventSystem not found, creating local instance');
        return {
            listeners: {},
            subscribe: function(event, callback) {
                if (!this.listeners[event]) {
                    this.listeners[event] = [];
                }
                this.listeners[event].push(callback);
                return () => {
                    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
                };
            },
            publish: function(event, data) {
                if (this.listeners[event]) {
                    this.listeners[event].forEach(callback => {
                        try {
                            callback(data);
                        } catch (error) {
                            console.error(`Error in event listener for ${event}:`, error);
                        }
                    });
                }
            }
        };
    }
    
    /**
     * Find DOM elements
     */
    findDOMElements() {
        this.elements.visualizationArea = document.getElementById('visualization-area');
        this.elements.dynamicBackground = document.getElementById('dynamic-background');
        this.elements.pixelContainer = document.getElementById('pixel-container');
        this.elements.meaiPixel = document.getElementById('meai-pixel');
        this.elements.conversationHistory = document.getElementById('conversation-history');
        
        if (!this.elements.visualizationArea || !this.elements.dynamicBackground || 
            !this.elements.pixelContainer || !this.elements.meaiPixel || !this.elements.conversationHistory) {
            console.warn('Some UI elements not found, will attempt to find them later');
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Retry finding elements if they weren't available initially
        if (!this.elements.visualizationArea || !this.elements.dynamicBackground || 
            !this.elements.pixelContainer || !this.elements.meaiPixel || !this.elements.conversationHistory) {
            window.addEventListener('DOMContentLoaded', () => {
                this.findDOMElements();
                this.initializeVisualization();
            });
        }
        
        // Listen for user messages
        this.eventSystem.subscribe('user-message', () => {
            this.animateUserMessage();
        });
        
        // Listen for AI thinking
        this.eventSystem.subscribe('ai-thinking', () => {
            this.setEmotion('thinking');
        });
        
        // Listen for AI responses
        this.eventSystem.subscribe('ai-response', (data) => {
            this.handleAIResponse(data);
        });
        
        // Listen for voice listening start
        this.eventSystem.subscribe('voice-listening-start', () => {
            this.animateVoiceListening(true);
        });
        
        // Listen for voice listening end
        this.eventSystem.subscribe('voice-listening-end', () => {
            this.animateVoiceListening(false);
        });
        
        // Listen for settings changes
        this.eventSystem.subscribe('settings-updated', (data) => {
            this.handleSettingsUpdate(data);
        });
        
        // Listen for visualization toggle
        if (this.elements.visualizationArea) {
            const toggleButton = document.getElementById('visualization-toggle');
            if (toggleButton) {
                toggleButton.addEventListener('click', () => {
                    this.toggleVisualization();
                });
            }
        }
    }
    
    /**
     * Load settings
     */
    loadSettings() {
        try {
            // Check for dark mode
            const darkMode = localStorage.getItem('dark-mode') === 'true';
            this.state.darkMode = darkMode;
            
            // Check for reduced motion
            const reducedMotion = localStorage.getItem('reduced-motion') === 'true';
            this.state.reducedMotion = reducedMotion;
            
            // Check for visualization state
            const visualizationMinimized = localStorage.getItem('visualization-minimized') === 'true';
            this.state.visualizationMinimized = visualizationMinimized;
            
            // Apply settings
            this.applySettings();
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }
    
    /**
     * Apply settings
     */
    applySettings() {
        // Apply dark mode
        if (this.state.darkMode) {
            document.body.setAttribute('data-theme', 'dark');
        } else {
            document.body.removeAttribute('data-theme');
        }
        
        // Apply reduced motion
        if (this.state.reducedMotion) {
            document.body.classList.add('reduced-motion');
        } else {
            document.body.classList.remove('reduced-motion');
        }
        
        // Apply visualization state
        if (this.elements.visualizationArea) {
            if (this.state.visualizationMinimized) {
                this.elements.visualizationArea.classList.add('minimized');
                
                // Update toggle button icon if it exists
                const toggleButton = document.getElementById('visualization-toggle');
                if (toggleButton) {
                    toggleButton.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"></path></svg>';
                }
            } else {
                this.elements.visualizationArea.classList.remove('minimized');
                
                // Update toggle button icon if it exists
                const toggleButton = document.getElementById('visualization-toggle');
                if (toggleButton) {
                    toggleButton.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"></path></svg>';
                }
            }
        }
    }
    
    /**
     * Initialize visualization
     */
    initializeVisualization() {
        if (!this.elements.meaiPixel || !this.elements.dynamicBackground) {
            return;
        }
        
        // Set initial emotion
        this.setEmotion('neutral');
        
        // Create dynamic background
        this.createDynamicBackground();
    }
    
    /**
     * Create dynamic background
     */
    createDynamicBackground() {
        if (!this.elements.dynamicBackground) {
            return;
        }
        
        // Clear existing background
        this.elements.dynamicBackground.innerHTML = '';
        
        // Check if reduced motion is enabled
        if (this.state.reducedMotion) {
            // Create simple gradient background
            this.elements.dynamicBackground.style.background = 'linear-gradient(135deg, var(--secondary-color) 0%, var(--primary-color) 100%)';
            return;
        }
        
        // Create canvas for dynamic background
        const canvas = document.createElement('canvas');
        canvas.width = this.elements.dynamicBackground.offsetWidth || 300;
        canvas.height = this.elements.dynamicBackground.offsetHeight || 150;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        this.elements.dynamicBackground.appendChild(canvas);
        
        // Get canvas context
        const ctx = canvas.getContext('2d');
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, this.getEmotionColor(this.state.currentEmotion, 0.7));
        gradient.addColorStop(1, this.getEmotionColor(this.state.currentEmotion, 0.3));
        
        // Fill background
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add subtle particles
        this.addBackgroundParticles(canvas, ctx);
    }
    
    /**
     * Add background particles
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    addBackgroundParticles(canvas, ctx) {
        // Create particles
        const particles = [];
        const particleCount = Math.min(20, Math.floor(canvas.width * canvas.height / 5000));
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 3 + 1,
                color: this.getEmotionColor(this.state.currentEmotion, 0.2),
                speedX: Math.random() * 0.5 - 0.25,
                speedY: Math.random() * 0.5 - 0.25
            });
        }
        
        // Animate particles
        const animate = () => {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Redraw gradient
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, this.getEmotionColor(this.state.currentEmotion, 0.7));
            gradient.addColorStop(1, this.getEmotionColor(this.state.currentEmotion, 0.3));
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Update and draw particles
            particles.forEach(particle => {
                // Update position
                particle.x += particle.speedX;
                particle.y += particle.speedY;
                
                // Wrap around edges
                if (particle.x < 0) particle.x = canvas.width;
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = canvas.height;
                if (particle.y > canvas.height) particle.y = 0;
                
                // Draw particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fillStyle = particle.color;
                ctx.fill();
            });
            
            // Continue animation if not minimized
            if (!this.state.visualizationMinimized && !this.state.reducedMotion) {
                requestAnimationFrame(animate);
            }
        };
        
        // Start animation if not minimized
        if (!this.state.visualizationMinimized && !this.state.reducedMotion) {
            animate();
        }
    }
    
    /**
     * Set emotion
     * @param {string} emotion - Emotion to set
     */
    setEmotion(emotion) {
        if (!this.elements.meaiPixel) {
            return;
        }
        
        // Update state
        this.state.currentEmotion = emotion;
        
        // Get emotion color
        const color = this.getEmotionColor(emotion);
        
        // Apply color to pixel
        this.elements.meaiPixel.style.backgroundColor = color;
        
        // Update dynamic background
        this.updateDynamicBackground();
        
        // Animate pixel
        this.animatePixel(emotion);
    }
    
    /**
     * Get emotion color
     * @param {string} emotion - Emotion
     * @param {number} opacity - Optional opacity
     * @returns {string} - Color value
     */
    getEmotionColor(emotion, opacity = 1) {
        // Get base color
        const baseColor = this.emotionColors[emotion] || this.emotionColors.neutral;
        
        // If opacity is 1, return base color
        if (opacity === 1) {
            return baseColor;
        }
        
        // Convert hex to rgba
        const r = parseInt(baseColor.slice(1, 3), 16);
        const g = parseInt(baseColor.slice(3, 5), 16);
        const b = parseInt(baseColor.slice(5, 7), 16);
        
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    /**
     * Update dynamic background
     */
    updateDynamicBackground() {
        if (!this.elements.dynamicBackground) {
            return;
        }
        
        // If reduced motion is enabled, just update the gradient
        if (this.state.reducedMotion) {
            this.elements.dynamicBackground.style.background = `linear-gradient(135deg, ${this.getEmotionColor(this.state.currentEmotion, 0.7)} 0%, ${this.getEmotionColor(this.state.currentEmotion, 0.3)} 100%)`;
            return;
        }
        
        // Otherwise recreate the dynamic background
        this.createDynamicBackground();
    }
    
    /**
     * Animate pixel
     * @param {string} emotion - Emotion to animate
     */
    animatePixel(emotion) {
        if (!this.elements.meaiPixel || this.state.reducedMotion) {
            return;
        }
        
        // Clear any existing animations
        this.elements.meaiPixel.style.animation = 'none';
        this.elements.meaiPixel.offsetHeight; // Trigger reflow
        
        // Apply animation based on emotion
        switch (emotion) {
            case 'happy':
                this.elements.meaiPixel.style.animation = 'pulse 1.5s ease-in-out infinite';
                break;
            case 'sad':
                this.elements.meaiPixel.style.animation = 'breathe 3s ease-in-out infinite';
                break;
            case 'angry':
                this.elements.meaiPixel.style.animation = 'shake 0.5s ease-in-out infinite';
                break;
            case 'surprised':
                this.elements.meaiPixel.style.animation = 'bounce 1s ease-in-out';
                break;
            case 'confused':
                this.elements.meaiPixel.style.animation = 'wobble 2s ease-in-out infinite';
                break;
            case 'thinking':
                this.elements.meaiPixel.style.animation = 'pulse 2s ease-in-out infinite';
                break;
            default:
                this.elements.meaiPixel.style.animation = 'float 3s ease-in-out infinite';
                break;
        }
    }
    
    /**
     * Animate user message
     */
    animateUserMessage() {
        if (!this.elements.meaiPixel || this.state.reducedMotion) {
            return;
        }
        
        // Brief scale animation
        this.elements.meaiPixel.style.transform = 'scale(1.1)';
        setTimeout(() => {
            this.elements.meaiPixel.style.transform = 'scale(1)';
        }, this.animationTimings.fast);
        
        // Set emotion to thinking after a short delay
        setTimeout(() => {
            this.setEmotion('thinking');
        }, this.animationTimings.standard);
    }
    
    /**
     * Handle AI response
     * @param {Object} data - Response data
     */
    handleAIResponse(data) {
        // Determine emotion from sentiment if available
        let emotion = 'neutral';
        
        if (data.sentiment) {
            if (data.sentiment.positive > 0.7) {
                emotion = 'happy';
            } else if (data.sentiment.negative > 0.7) {
                emotion = 'sad';
            } else if (data.sentiment.neutral > 0.7) {
                emotion = 'neutral';
            }
        }
        
        // Set emotion
        this.setEmotion(emotion);
        
        // Animate response
        this.animateAIResponse();
        
        // Highlight new message
        this.highlightNewMessage();
    }
    
    /**
     * Animate AI response
     */
    animateAIResponse() {
        if (!this.elements.meaiPixel || this.state.reducedMotion) {
            return;
        }
        
        // Brief scale animation
        this.elements.meaiPixel.style.transform = 'scale(1.2)';
        setTimeout(() => {
            this.elements.meaiPixel.style.transform = 'scale(1)';
        }, this.animationTimings.standard);
    }
    
    /**
     * Highlight new message
     */
    highlightNewMessage() {
        if (!this.elements.conversationHistory || this.state.reducedMotion) {
            return;
        }
        
        // Get the last message
        const messages = this.elements.conversationHistory.querySelectorAll('.message');
        if (messages.length === 0) {
            return;
        }
        
        const lastMessage = messages[messages.length - 1];
        
        // Add highlight class
        lastMessage.classList.add('highlight');
        
        // Remove highlight after animation
        setTimeout(() => {
            lastMessage.classList.remove('highlight');
        }, this.animationTimings.slow);
    }
    
    /**
     * Animate voice listening
     * @param {boolean} isListening - Whether voice is listening
     */
    animateVoiceListening(isListening) {
        if (!this.elements.meaiPixel) {
            return;
        }
        
        if (isListening) {
            // Set emotion to listening
            this.setEmotion('surprised');
            
            // Add listening animation if not reduced motion
            if (!this.state.reducedMotion) {
                this.elements.meaiPixel.style.animation = 'pulse 1s ease-in-out infinite';
            }
        } else {
            // Reset to neutral
            this.setEmotion('neutral');
        }
    }
    
    /**
     * Toggle visualization
     */
    toggleVisualization() {
        if (!this.elements.visualizationArea) {
            return;
        }
        
        // Toggle minimized state
        this.state.visualizationMinimized = !this.state.visualizationMinimized;
        
        // Apply state
        if (this.state.visualizationMinimized) {
            this.elements.visualizationArea.classList.add('minimized');
        } else {
            this.elements.visualizationArea.classList.remove('minimized');
            
            // Recreate dynamic background if not minimized
            this.createDynamicBackground();
        }
        
        // Update toggle button icon if it exists
        const toggleButton = document.getElementById('visualization-toggle');
        if (toggleButton) {
            if (this.state.visualizationMinimized) {
                toggleButton.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"></path></svg>';
            } else {
                toggleButton.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"></path></svg>';
            }
        }
        
        // Save state
        localStorage.setItem('visualization-minimized', this.state.visualizationMinimized);
    }
    
    /**
     * Handle settings update
     * @param {Object} data - Settings data
     */
    handleSettingsUpdate(data) {
        let settingsChanged = false;
        
        // Update dark mode
        if (data.darkTheme !== undefined && data.darkTheme !== this.state.darkMode) {
            this.state.darkMode = data.darkTheme;
            settingsChanged = true;
        }
        
        // Update reduced motion
        if (data.reducedMotion !== undefined && data.reducedMotion !== this.state.reducedMotion) {
            this.state.reducedMotion = data.reducedMotion;
            settingsChanged = true;
        }
        
        // Apply settings if changed
        if (settingsChanged) {
            this.applySettings();
            
            // Recreate visualization with new settings
            this.createDynamicBackground();
            this.animatePixel(this.state.currentEmotion);
        }
    }
    
    /**
     * Add CSS keyframes for animations
     */
    addAnimationKeyframes() {
        // Check if keyframes already exist
        if (document.getElementById('meai-animation-keyframes')) {
            return;
        }
        
        // Create style element
        const style = document.createElement('style');
        style.id = 'meai-animation-keyframes';
        
        // Add keyframes
        style.textContent = `
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            
            @keyframes breathe {
                0% { transform: scale(1); }
                25% { transform: scale(0.95); }
                50% { transform: scale(1); }
                75% { transform: scale(0.95); }
                100% { transform: scale(1); }
            }
            
            @keyframes shake {
                0% { transform: translateX(0); }
                25% { transform: translateX(-3px); }
                50% { transform: translateX(0); }
                75% { transform: translateX(3px); }
                100% { transform: translateX(0); }
            }
            
            @keyframes bounce {
                0% { transform: translateY(0); }
                25% { transform: translateY(-10px); }
                50% { transform: translateY(0); }
                75% { transform: translateY(-5px); }
                100% { transform: translateY(0); }
            }
            
            @keyframes wobble {
                0% { transform: rotate(0); }
                25% { transform: rotate(5deg); }
                50% { transform: rotate(0); }
                75% { transform: rotate(-5deg); }
                100% { transform: rotate(0); }
            }
            
            @keyframes float {
                0% { transform: translateY(0); }
                50% { transform: translateY(-5px); }
                100% { transform: translateY(0); }
            }
            
            .highlight {
                animation: highlight 1s ease-out;
            }
            
            @keyframes highlight {
                0% { box-shadow: 0 0 0 0 var(--accent-color); }
                70% { box-shadow: 0 0 0 10px transparent; }
                100% { box-shadow: 0 0 0 0 transparent; }
            }
        `;
        
        // Add to document
        document.head.appendChild(style);
    }
}

// Add animation keyframes
document.addEventListener('DOMContentLoaded', () => {
    // Create style element
    const style = document.createElement('style');
    style.id = 'meai-animation-keyframes';
    
    // Add keyframes
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        @keyframes breathe {
            0% { transform: scale(1); }
            25% { transform: scale(0.95); }
            50% { transform: scale(1); }
            75% { transform: scale(0.95); }
            100% { transform: scale(1); }
        }
        
        @keyframes shake {
            0% { transform: translateX(0); }
            25% { transform: translateX(-3px); }
            50% { transform: translateX(0); }
            75% { transform: translateX(3px); }
            100% { transform: translateX(0); }
        }
        
        @keyframes bounce {
            0% { transform: translateY(0); }
            25% { transform: translateY(-10px); }
            50% { transform: translateY(0); }
            75% { transform: translateY(-5px); }
            100% { transform: translateY(0); }
        }
        
        @keyframes wobble {
            0% { transform: rotate(0); }
            25% { transform: rotate(5deg); }
            50% { transform: rotate(0); }
            75% { transform: rotate(-5deg); }
            100% { transform: rotate(0); }
        }
        
        @keyframes float {
            0% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
            100% { transform: translateY(0); }
        }
        
        .highlight {
            animation: highlight 1s ease-out;
        }
        
        @keyframes highlight {
            0% { box-shadow: 0 0 0 0 var(--accent-color); }
            70% { box-shadow: 0 0 0 10px transparent; }
            100% { box-shadow: 0 0 0 0 transparent; }
        }
    `;
    
    // Add to document
    document.head.appendChild(style);
});

// Create singleton instance
const visualFeedbackSystem = new VisualFeedbackSystem();

// Export the singleton
window.visualFeedbackSystem = visualFeedbackSystem;
