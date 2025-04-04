/**
 * Accessibility System
 * 
 * This system enhances the application's accessibility features,
 * ensuring it's usable by people with various disabilities.
 */

class AccessibilitySystem {
    constructor() {
        // Initialize dependencies
        this.storageManager = window.storageManager;
        this.eventSystem = window.eventSystem;
        this.themeSystem = window.themeSystem;
        this.enhancedInterfaceSystem = window.enhancedInterfaceSystem;
        this.visualFeedbackSystem = window.visualFeedbackSystem;
        
        // Accessibility state
        this.state = {
            highContrastMode: false,
            largeTextMode: false,
            reduceMotionMode: false,
            screenReaderMode: false,
            keyboardNavigationMode: false,
            focusIndicatorsEnabled: true,
            alternativeTextEnabled: true,
            colorAdjustmentsEnabled: false,
            textToSpeechEnabled: false,
            speechRecognitionEnabled: false,
            simplifiedInterfaceMode: false,
            readingGuideEnabled: false,
            dyslexiaFriendlyFont: false,
            customAccessibilitySettings: {},
            currentFocusElement: null,
            tabIndex: 0,
            ariaLabelsAdded: false,
            colorFilters: 'none', // none, protanopia, deuteranopia, tritanopia, grayscale
            textToSpeechInstance: null,
            speechRecognitionInstance: null,
            readingGuideElement: null,
            readingGuideVisible: false,
            readingGuidePosition: { x: 0, y: 0 }
        };
        
        // Initialize
        this.initialize();
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    /**
     * Initialize the accessibility system
     */
    async initialize() {
        try {
            // Load user preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'accessibility');
            if (preferences) {
                if (preferences.highContrastMode !== undefined) {
                    this.state.highContrastMode = preferences.highContrastMode;
                }
                
                if (preferences.largeTextMode !== undefined) {
                    this.state.largeTextMode = preferences.largeTextMode;
                }
                
                if (preferences.reduceMotionMode !== undefined) {
                    this.state.reduceMotionMode = preferences.reduceMotionMode;
                }
                
                if (preferences.screenReaderMode !== undefined) {
                    this.state.screenReaderMode = preferences.screenReaderMode;
                }
                
                if (preferences.keyboardNavigationMode !== undefined) {
                    this.state.keyboardNavigationMode = preferences.keyboardNavigationMode;
                }
                
                if (preferences.focusIndicatorsEnabled !== undefined) {
                    this.state.focusIndicatorsEnabled = preferences.focusIndicatorsEnabled;
                }
                
                if (preferences.alternativeTextEnabled !== undefined) {
                    this.state.alternativeTextEnabled = preferences.alternativeTextEnabled;
                }
                
                if (preferences.colorAdjustmentsEnabled !== undefined) {
                    this.state.colorAdjustmentsEnabled = preferences.colorAdjustmentsEnabled;
                }
                
                if (preferences.textToSpeechEnabled !== undefined) {
                    this.state.textToSpeechEnabled = preferences.textToSpeechEnabled;
                }
                
                if (preferences.speechRecognitionEnabled !== undefined) {
                    this.state.speechRecognitionEnabled = preferences.speechRecognitionEnabled;
                }
                
                if (preferences.simplifiedInterfaceMode !== undefined) {
                    this.state.simplifiedInterfaceMode = preferences.simplifiedInterfaceMode;
                }
                
                if (preferences.readingGuideEnabled !== undefined) {
                    this.state.readingGuideEnabled = preferences.readingGuideEnabled;
                }
                
                if (preferences.dyslexiaFriendlyFont !== undefined) {
                    this.state.dyslexiaFriendlyFont = preferences.dyslexiaFriendlyFont;
                }
                
                if (preferences.colorFilters !== undefined) {
                    this.state.colorFilters = preferences.colorFilters;
                }
                
                if (preferences.customAccessibilitySettings !== undefined) {
                    this.state.customAccessibilitySettings = preferences.customAccessibilitySettings;
                }
            }
            
            // Check for system preferences
            this.checkSystemPreferences();
            
            // Apply initial accessibility settings
            this.applyAccessibilitySettings();
            
            // Initialize text-to-speech if enabled
            if (this.state.textToSpeechEnabled) {
                this.initializeTextToSpeech();
            }
            
            // Initialize speech recognition if enabled
            if (this.state.speechRecognitionEnabled) {
                this.initializeSpeechRecognition();
            }
            
            // Add ARIA labels to elements
            this.addAriaLabels();
            
            // Create reading guide if enabled
            if (this.state.readingGuideEnabled) {
                this.createReadingGuide();
            }
            
            console.log('Accessibility System initialized');
            
            // Notify system that accessibility system is ready
            this.eventSystem.publish('accessibility-system-ready', {
                ...this.state
            });
        } catch (error) {
            console.error('Error initializing accessibility system:', error);
        }
    }
    
    /**
     * Check system preferences for accessibility settings
     */
    checkSystemPreferences() {
        // Check for prefers-reduced-motion
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.state.reduceMotionMode = true;
        }
        
        // Check for prefers-contrast
        if (window.matchMedia && window.matchMedia('(prefers-contrast: more)').matches) {
            this.state.highContrastMode = true;
        }
        
        // Check for prefers-color-scheme
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            // Notify theme system to switch to dark mode
            this.eventSystem.publish('theme-change', { theme: 'dark' });
        }
    }
    
    /**
     * Apply accessibility settings
     */
    applyAccessibilitySettings() {
        // Apply high contrast mode
        if (this.state.highContrastMode) {
            document.body.classList.add('high-contrast-mode');
            
            // Notify theme system
            this.eventSystem.publish('high-contrast-mode', { enabled: true });
        } else {
            document.body.classList.remove('high-contrast-mode');
            
            // Notify theme system
            this.eventSystem.publish('high-contrast-mode', { enabled: false });
        }
        
        // Apply large text mode
        if (this.state.largeTextMode) {
            document.body.classList.add('large-text-mode');
        } else {
            document.body.classList.remove('large-text-mode');
        }
        
        // Apply reduce motion mode
        if (this.state.reduceMotionMode) {
            document.body.classList.add('reduce-motion-mode');
            
            // Notify animation systems
            this.eventSystem.publish('toggle-animations', { enabled: false });
            this.eventSystem.publish('toggle-motion-feedback', { enabled: false });
        } else {
            document.body.classList.remove('reduce-motion-mode');
        }
        
        // Apply screen reader mode
        if (this.state.screenReaderMode) {
            document.body.classList.add('screen-reader-mode');
            
            // Add additional ARIA attributes
            this.enhanceAriaSupport();
        } else {
            document.body.classList.remove('screen-reader-mode');
        }
        
        // Apply keyboard navigation mode
        if (this.state.keyboardNavigationMode) {
            document.body.classList.add('keyboard-navigation-mode');
            
            // Enhance focus indicators
            this.enhanceFocusIndicators();
        } else {
            document.body.classList.remove('keyboard-navigation-mode');
        }
        
        // Apply simplified interface mode
        if (this.state.simplifiedInterfaceMode) {
            document.body.classList.add('simplified-interface-mode');
            
            // Hide non-essential elements
            this.simplifyInterface();
        } else {
            document.body.classList.remove('simplified-interface-mode');
        }
        
        // Apply dyslexia friendly font
        if (this.state.dyslexiaFriendlyFont) {
            document.body.classList.add('dyslexia-friendly-font');
        } else {
            document.body.classList.remove('dyslexia-friendly-font');
        }
        
        // Apply color filters
        this.applyColorFilters(this.state.colorFilters);
    }
    
    /**
     * Add ARIA labels to elements
     */
    addAriaLabels() {
        if (this.state.ariaLabelsAdded) return;
        
        // Add ARIA labels to buttons without text
        const iconButtons = document.querySelectorAll('button:not([aria-label])');
        iconButtons.forEach(button => {
            const buttonText = button.textContent.trim();
            if (!buttonText && button.querySelector('.material-icons')) {
                const iconText = button.querySelector('.material-icons').textContent.trim();
                let ariaLabel = '';
                
                // Map icon names to meaningful labels
                switch (iconText) {
                    case 'send':
                        ariaLabel = 'Send message';
                        break;
                    case 'mic':
                        ariaLabel = 'Start voice input';
                        break;
                    case 'settings':
                        ariaLabel = 'Open settings';
                        break;
                    case 'close':
                        ariaLabel = 'Close';
                        break;
                    case 'menu':
                        ariaLabel = 'Open menu';
                        break;
                    case 'search':
                        ariaLabel = 'Search';
                        break;
                    case 'help':
                        ariaLabel = 'Help';
                        break;
                    case 'info':
                        ariaLabel = 'Information';
                        break;
                    case 'warning':
                        ariaLabel = 'Warning';
                        break;
                    case 'error':
                        ariaLabel = 'Error';
                        break;
                    case 'check_circle':
                        ariaLabel = 'Success';
                        break;
                    case 'attachment':
                        ariaLabel = 'Add attachment';
                        break;
                    case 'emoji_emotions':
                        ariaLabel = 'Add emoji';
                        break;
                    default:
                        ariaLabel = iconText.replace(/_/g, ' ');
                }
                
                button.setAttribute('aria-label', ariaLabel);
            }
        });
        
        // Add ARIA labels to inputs without labels
        const inputs = document.querySelectorAll('input:not([aria-label])');
        inputs.forEach(input => {
            const inputId = input.id;
            const label = document.querySelector(`label[for="${inputId}"]`);
            
            if (!label) {
                let ariaLabel = '';
                
                // Try to determine purpose from placeholder or name
                if (input.placeholder) {
                    ariaLabel = input.placeholder;
                } else if (input.name) {
                    ariaLabel = input.name.replace(/[-_]/g, ' ');
                } else {
                    ariaLabel = `Input field ${input.type}`;
                }
                
                input.setAttribute('aria-label', ariaLabel);
            }
        });
        
        // Add roles to common elements
        const conversationHistory = document.querySelector('.conversation-history');
        if (conversationHistory) {
            conversationHistory.setAttribute('role', 'log');
            conversationHistory.setAttribute('aria-live', 'polite');
            conversationHistory.setAttribute('aria-relevant', 'additions');
        }
        
        const inputArea = document.querySelector('.input-area');
        if (inputArea) {
            inputArea.setAttribute('role', 'form');
            inputArea.setAttribute('aria-label', 'Message input');
        }
        
        const userInput = document.getElementById('user-input');
        if (userInput) {
            userInput.setAttribute('aria-label', 'Type your message');
        }
        
        // Mark state as updated
        this.state.ariaLabelsAdded = true;
    }
    
    /**
     * Enhance ARIA support for screen readers
     */
    enhanceAriaSupport() {
        // Add additional ARIA attributes for better screen reader support
        
        // Add live regions for dynamic content
        const notificationContainer = document.getElementById('visual-feedback-container');
        if (notificationContainer) {
            notificationContainer.setAttribute('aria-live', 'assertive');
            notificationContainer.setAttribute('aria-atomic', 'true');
        }
        
        // Add descriptions to complex elements
        const pixelContainer = document.getElementById('pixel-container');
        if (pixelContainer) {
            pixelContainer.setAttribute('aria-label', 'MeAI visualization');
            pixelContainer.setAttribute('role', 'img');
            
            // Add description based on emotional state
            const emotionalState = this.eventSystem.getState?.('emotionalState') || 'neutral';
            pixelContainer.setAttribute('aria-description', `MeAI is currently in a ${emotionalState} state.`);
        }
        
        // Improve navigation landmarks
        const header = document.querySelector('header');
        if (header) {
            header.setAttribute('role', 'banner');
        }
        
        const nav = document.querySelector('nav');
        if (nav) {
            nav.setAttribute('role', 'navigation');
        }
        
        const main = document.querySelector('main');
        if (main) {
            main.setAttribute('role', 'main');
        }
        
        const footer = document.querySelector('footer');
        if (footer) {
            footer.setAttribute('role', 'contentinfo');
        }
        
        // Add ARIA properties to messages
        const messages = document.querySelectorAll('.message');
        messages.forEach((message, index) => {
            const isUser = message.classList.contains('user-message');
            message.setAttribute('role', 'article');
            message.setAttribute('aria-label', `${isUser ? 'You' : 'MeAI'} said`);
            message.setAttribute('aria-posinset', index + 1);
            message.setAttribute('aria-setsize', messages.length);
        });
    }
    
    /**
     * Enhance focus indicators for keyboard navigation
     */
    enhanceFocusIndicators() {
        // Add tabindex to elements that should be focusable
        const focusableElements = document.querySelectorAll('button, a, input, textarea, select, [role="button"]');
        focusableElements.forEach((element, index) => {
            if (!element.hasAttribute('tabindex')) {
                element.setAttribute('tabindex', '0');
            }
        });
        
        // Add focus styles
        const styleElement = document.getElementById('accessibility-focus-styles');
        if (!styleElement) {
            const style = document.createElement('style');
            style.id = 'accessibility-focus-styles';
            style.textContent = `
                :focus {
                    outline: 3px solid var(--focus-color, #4d90fe) !important;
                    outline-offset: 2px !important;
                    box-shadow: 0 0 0 2px rgba(77, 144, 254, 0.5) !important;
                }
                
                .keyboard-navigation-mode :focus {
                    outline: 4px solid var(--focus-color, #4d90fe) !important;
                    outline-offset: 3px !important;
                    box-shadow: 0 0 0 3px rgba(77, 144, 254, 0.7) !important;
                }
                
                .high-contrast-mode :focus {
                    outline: 4px solid var(--high-contrast-focus-color, #ffff00) !important;
                    outline-offset: 3px !important;
                    box-shadow: 0 0 0 3px rgba(255, 255, 0, 0.7) !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * Simplify interface for simplified mode
     */
    simplifyInterface() {
        // Hide non-essential elements
        const nonEssentialElements = document.querySelectorAll('.decorative, .advanced-feature, .secondary-control');
        nonEssentialElements.forEach(element => {
            element.style.display = 'none';
        });
        
        // Simplify complex elements
        const complexElements = document.querySelectorAll('.complex-control');
        complexElements.forEach(element => {
            element.classList.add('simplified');
        });
        
        // Add simplified styles
        const styleElement = document.getElementById('simplified-interface-styles');
        if (!styleElement) {
            const style = document.createElement('style');
            style.id = 'simplified-interface-styles';
            style.textContent = `
                .simplified-interface-mode {
                    --spacing-multiplier: 1.5;
                }
                
                .simplified-interface-mode button,
                .simplified-interface-mode input,
                .simplified-interface-mode select,
                .simplified-interface-mode textarea {
                    padding: calc(var(--spacing-base) * var(--spacing-multiplier)) !important;
                    margin: calc(var(--spacing-base) * var(--spacing-multiplier)) !important;
                }
                
                .simplified-interface-mode .button-group {
                    display: flex;
                    flex-direction: column;
                }
                
                .simplified-interface-mode .complex-control.simplified {
                    display: flex;
                    flex-direction: column;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * Apply color filters for color vision deficiencies
     * @param {string} filterType - Filter type
     */
    applyColorFilters(filterType) {
        // Remove existing filter
        document.body.style.filter = '';
        
        // Apply selected filter
        switch (filterType) {
            case 'protanopia':
                document.body.style.filter = 'url(#protanopia-filter)';
                this.ensureColorFilterSVG();
                break;
                
            case 'deuteranopia':
                document.body.style.filter = 'url(#deuteranopia-filter)';
                this.ensureColorFilterSVG();
                break;
                
            case 'tritanopia':
                document.body.style.filter = 'url(#tritanopia-filter)';
                this.ensureColorFilterSVG();
                break;
                
            case 'grayscale':
                document.body.style.filter = 'grayscale(100%)';
                break;
                
            case 'none':
            default:
                document.body.style.filter = '';
                break;
        }
        
        // Update state
        this.state.colorFilters = filterType;
    }
    
    /**
     * Ensure color filter SVG exists in the document
     */
    ensureColorFilterSVG() {
        if (document.getElementById('color-filters-svg')) return;
        
        // Create SVG element with color vision deficiency filters
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.id = 'color-filters-svg';
        svg.style.position = 'absolute';
        svg.style.width = '0';
        svg.style.height = '0';
        svg.style.pointerEvents = 'none';
        svg.setAttribute('aria-hidden', 'true');
        
        // Add filters
        svg.innerHTML = `
            <defs>
                <!-- Protanopia (red-blind) -->
                <filter id="protanopia-filter">
                    <feColorMatrix
                        in="SourceGraphic"
                        type="matrix"
                        values="0.567, 0.433, 0,     0, 0
                                0.558, 0.442, 0,     0, 0
                                0,     0.242, 0.758, 0, 0
                                0,     0,     0,     1, 0"/>
                </filter>
                
                <!-- Deuteranopia (green-blind) -->
                <filter id="deuteranopia-filter">
                    <feColorMatrix
                        in="SourceGraphic"
                        type="matrix"
                        values="0.625, 0.375, 0,   0, 0
                                0.7,   0.3,   0,   0, 0
                                0,     0.3,   0.7, 0, 0
                                0,     0,     0,   1, 0"/>
                </filter>
                
                <!-- Tritanopia (blue-blind) -->
                <filter id="tritanopia-filter">
                    <feColorMatrix
                        in="SourceGraphic"
                        type="matrix"
                        values="0.95, 0.05,  0,     0, 0
                                0,    0.433, 0.567, 0, 0
                                0,    0.475, 0.525, 0, 0
                                0,    0,     0,     1, 0"/>
                </filter>
            </defs>
        `;
        
        // Add to document
        document.body.appendChild(svg);
    }
    
    /**
     * Initialize text-to-speech
     */
    initializeTextToSpeech() {
        // Check if speech synthesis is supported
        if (!window.speechSynthesis) {
            console.warn('Speech synthesis not supported in this browser');
            return;
        }
        
        // Initialize speech synthesis
        this.state.textToSpeechInstance = window.speechSynthesis;
        
        // Get available voices
        let voices = this.state.textToSpeechInstance.getVoices();
        
        // If voices aren't loaded yet, wait for them
        if (voices.length === 0) {
            window.speechSynthesis.addEventListener('voiceschanged', () => {
                voices = this.state.textToSpeechInstance.getVoices();
            });
        }
        
        console.log('Text-to-speech initialized');
    }
    
    /**
     * Speak text using text-to-speech
     * @param {string} text - Text to speak
     * @param {Object} options - Speech options
     */
    speak(text, options = {}) {
        if (!this.state.textToSpeechEnabled || !this.state.textToSpeechInstance) {
            console.warn('Text-to-speech is not enabled or initialized');
            return;
        }
        
        // Cancel any current speech
        this.state.textToSpeechInstance.cancel();
        
        // Create utterance
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set options
        if (options.voice) {
            const voices = this.state.textToSpeechInstance.getVoices();
            const voice = voices.find(v => v.name === options.voice);
            if (voice) {
                utterance.voice = voice;
            }
        }
        
        if (options.rate) {
            utterance.rate = options.rate;
        }
        
        if (options.pitch) {
            utterance.pitch = options.pitch;
        }
        
        if (options.volume) {
            utterance.volume = options.volume;
        }
        
        // Set event handlers
        utterance.onstart = () => {
            this.eventSystem.publish('speech-started', { text });
        };
        
        utterance.onend = () => {
            this.eventSystem.publish('speech-ended', { text });
        };
        
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.eventSystem.publish('speech-error', { error: event.error });
        };
        
        // Speak the text
        this.state.textToSpeechInstance.speak(utterance);
    }
    
    /**
     * Stop speaking
     */
    stopSpeaking() {
        if (this.state.textToSpeechInstance) {
            this.state.textToSpeechInstance.cancel();
        }
    }
    
    /**
     * Initialize speech recognition
     */
    initializeSpeechRecognition() {
        // Check if speech recognition is supported
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech recognition not supported in this browser');
            return;
        }
        
        // Initialize speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.state.speechRecognitionInstance = new SpeechRecognition();
        
        // Configure speech recognition
        this.state.speechRecognitionInstance.continuous = false;
        this.state.speechRecognitionInstance.interimResults = true;
        this.state.speechRecognitionInstance.lang = 'en-US';
        
        // Set up event handlers
        this.state.speechRecognitionInstance.onstart = () => {
            this.eventSystem.publish('recognition-started');
        };
        
        this.state.speechRecognitionInstance.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            
            this.eventSystem.publish('recognition-result', { transcript });
        };
        
        this.state.speechRecognitionInstance.onend = () => {
            this.eventSystem.publish('recognition-ended');
        };
        
        this.state.speechRecognitionInstance.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.eventSystem.publish('recognition-error', { error: event.error });
        };
        
        console.log('Speech recognition initialized');
    }
    
    /**
     * Start speech recognition
     */
    startListening() {
        if (!this.state.speechRecognitionEnabled || !this.state.speechRecognitionInstance) {
            console.warn('Speech recognition is not enabled or initialized');
            return;
        }
        
        try {
            this.state.speechRecognitionInstance.start();
        } catch (error) {
            console.error('Error starting speech recognition:', error);
        }
    }
    
    /**
     * Stop speech recognition
     */
    stopListening() {
        if (this.state.speechRecognitionInstance) {
            try {
                this.state.speechRecognitionInstance.stop();
            } catch (error) {
                console.error('Error stopping speech recognition:', error);
            }
        }
    }
    
    /**
     * Create reading guide
     */
    createReadingGuide() {
        if (this.state.readingGuideElement) return;
        
        // Create reading guide element
        const readingGuide = document.createElement('div');
        readingGuide.className = 'reading-guide';
        readingGuide.style.position = 'absolute';
        readingGuide.style.height = '30px';
        readingGuide.style.backgroundColor = 'rgba(255, 255, 0, 0.2)';
        readingGuide.style.borderTop = '1px solid rgba(255, 255, 0, 0.5)';
        readingGuide.style.borderBottom = '1px solid rgba(255, 255, 0, 0.5)';
        readingGuide.style.left = '0';
        readingGuide.style.right = '0';
        readingGuide.style.pointerEvents = 'none';
        readingGuide.style.zIndex = '9999';
        readingGuide.style.display = 'none';
        
        // Add to document
        document.body.appendChild(readingGuide);
        
        // Store reference
        this.state.readingGuideElement = readingGuide;
    }
    
    /**
     * Show reading guide
     */
    showReadingGuide() {
        if (!this.state.readingGuideElement) {
            this.createReadingGuide();
        }
        
        this.state.readingGuideElement.style.display = 'block';
        this.state.readingGuideVisible = true;
        
        // Position guide at mouse position
        document.addEventListener('mousemove', this.handleMouseMove);
    }
    
    /**
     * Hide reading guide
     */
    hideReadingGuide() {
        if (this.state.readingGuideElement) {
            this.state.readingGuideElement.style.display = 'none';
        }
        
        this.state.readingGuideVisible = false;
        
        // Remove event listener
        document.removeEventListener('mousemove', this.handleMouseMove);
    }
    
    /**
     * Handle mouse move for reading guide
     * @param {MouseEvent} event - Mouse event
     */
    handleMouseMove = (event) => {
        if (!this.state.readingGuideVisible || !this.state.readingGuideElement) return;
        
        // Update guide position
        this.state.readingGuidePosition.y = event.clientY;
        this.state.readingGuideElement.style.top = `${event.clientY - 15}px`;
    }
    
    /**
     * Toggle high contrast mode
     * @param {boolean} enabled - Whether high contrast mode is enabled
     */
    toggleHighContrastMode(enabled) {
        this.state.highContrastMode = enabled;
        this.applyAccessibilitySettings();
        this.savePreferences();
        
        // Notify about high contrast mode change
        this.eventSystem.publish('high-contrast-mode-changed', {
            enabled
        });
    }
    
    /**
     * Toggle large text mode
     * @param {boolean} enabled - Whether large text mode is enabled
     */
    toggleLargeTextMode(enabled) {
        this.state.largeTextMode = enabled;
        this.applyAccessibilitySettings();
        this.savePreferences();
        
        // Notify about large text mode change
        this.eventSystem.publish('large-text-mode-changed', {
            enabled
        });
    }
    
    /**
     * Toggle reduce motion mode
     * @param {boolean} enabled - Whether reduce motion mode is enabled
     */
    toggleReduceMotionMode(enabled) {
        this.state.reduceMotionMode = enabled;
        this.applyAccessibilitySettings();
        this.savePreferences();
        
        // Notify about reduce motion mode change
        this.eventSystem.publish('reduce-motion-mode-changed', {
            enabled
        });
    }
    
    /**
     * Toggle screen reader mode
     * @param {boolean} enabled - Whether screen reader mode is enabled
     */
    toggleScreenReaderMode(enabled) {
        this.state.screenReaderMode = enabled;
        this.applyAccessibilitySettings();
        this.savePreferences();
        
        // Notify about screen reader mode change
        this.eventSystem.publish('screen-reader-mode-changed', {
            enabled
        });
    }
    
    /**
     * Toggle keyboard navigation mode
     * @param {boolean} enabled - Whether keyboard navigation mode is enabled
     */
    toggleKeyboardNavigationMode(enabled) {
        this.state.keyboardNavigationMode = enabled;
        this.applyAccessibilitySettings();
        this.savePreferences();
        
        // Notify about keyboard navigation mode change
        this.eventSystem.publish('keyboard-navigation-mode-changed', {
            enabled
        });
    }
    
    /**
     * Toggle text-to-speech
     * @param {boolean} enabled - Whether text-to-speech is enabled
     */
    toggleTextToSpeech(enabled) {
        this.state.textToSpeechEnabled = enabled;
        
        if (enabled && !this.state.textToSpeechInstance) {
            this.initializeTextToSpeech();
        }
        
        this.savePreferences();
        
        // Notify about text-to-speech change
        this.eventSystem.publish('text-to-speech-changed', {
            enabled
        });
    }
    
    /**
     * Toggle speech recognition
     * @param {boolean} enabled - Whether speech recognition is enabled
     */
    toggleSpeechRecognition(enabled) {
        this.state.speechRecognitionEnabled = enabled;
        
        if (enabled && !this.state.speechRecognitionInstance) {
            this.initializeSpeechRecognition();
        }
        
        this.savePreferences();
        
        // Notify about speech recognition change
        this.eventSystem.publish('speech-recognition-changed', {
            enabled
        });
    }
    
    /**
     * Toggle simplified interface mode
     * @param {boolean} enabled - Whether simplified interface mode is enabled
     */
    toggleSimplifiedInterfaceMode(enabled) {
        this.state.simplifiedInterfaceMode = enabled;
        this.applyAccessibilitySettings();
        this.savePreferences();
        
        // Notify about simplified interface mode change
        this.eventSystem.publish('simplified-interface-mode-changed', {
            enabled
        });
    }
    
    /**
     * Toggle reading guide
     * @param {boolean} enabled - Whether reading guide is enabled
     */
    toggleReadingGuide(enabled) {
        this.state.readingGuideEnabled = enabled;
        
        if (enabled) {
            this.showReadingGuide();
        } else {
            this.hideReadingGuide();
        }
        
        this.savePreferences();
        
        // Notify about reading guide change
        this.eventSystem.publish('reading-guide-changed', {
            enabled
        });
    }
    
    /**
     * Toggle dyslexia friendly font
     * @param {boolean} enabled - Whether dyslexia friendly font is enabled
     */
    toggleDyslexiaFriendlyFont(enabled) {
        this.state.dyslexiaFriendlyFont = enabled;
        this.applyAccessibilitySettings();
        this.savePreferences();
        
        // Notify about dyslexia friendly font change
        this.eventSystem.publish('dyslexia-friendly-font-changed', {
            enabled
        });
    }
    
    /**
     * Set color filters
     * @param {string} filterType - Filter type
     */
    setColorFilters(filterType) {
        this.applyColorFilters(filterType);
        this.savePreferences();
        
        // Notify about color filters change
        this.eventSystem.publish('color-filters-changed', {
            filterType
        });
    }
    
    /**
     * Get accessibility settings
     * @returns {Object} Accessibility settings
     */
    getSettings() {
        return {
            highContrastMode: this.state.highContrastMode,
            largeTextMode: this.state.largeTextMode,
            reduceMotion: this.state.reduceMotionMode,
            screenReaderMode: this.state.screenReaderMode,
            keyboardNavigationMode: this.state.keyboardNavigationMode,
            textToSpeechEnabled: this.state.textToSpeechEnabled,
            speechRecognitionEnabled: this.state.speechRecognitionEnabled,
            simplifiedInterfaceMode: this.state.simplifiedInterfaceMode,
            readingGuideEnabled: this.state.readingGuideEnabled,
            dyslexiaFriendlyFont: this.state.dyslexiaFriendlyFont,
            colorFilters: this.state.colorFilters
        };
    }
    
    /**
     * Save preferences
     */
    async savePreferences() {
        try {
            await this.storageManager.setIndexedDB('preferences', 'accessibility', {
                highContrastMode: this.state.highContrastMode,
                largeTextMode: this.state.largeTextMode,
                reduceMotionMode: this.state.reduceMotionMode,
                screenReaderMode: this.state.screenReaderMode,
                keyboardNavigationMode: this.state.keyboardNavigationMode,
                focusIndicatorsEnabled: this.state.focusIndicatorsEnabled,
                alternativeTextEnabled: this.state.alternativeTextEnabled,
                colorAdjustmentsEnabled: this.state.colorAdjustmentsEnabled,
                textToSpeechEnabled: this.state.textToSpeechEnabled,
                speechRecognitionEnabled: this.state.speechRecognitionEnabled,
                simplifiedInterfaceMode: this.state.simplifiedInterfaceMode,
                readingGuideEnabled: this.state.readingGuideEnabled,
                dyslexiaFriendlyFont: this.state.dyslexiaFriendlyFont,
                colorFilters: this.state.colorFilters,
                customAccessibilitySettings: this.state.customAccessibilitySettings
            });
        } catch (error) {
            console.error('Error saving accessibility preferences:', error);
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for high contrast mode toggle
        this.eventSystem.subscribe('toggle-high-contrast-mode', (data) => {
            this.toggleHighContrastMode(data.enabled);
        });
        
        // Listen for large text mode toggle
        this.eventSystem.subscribe('toggle-large-text-mode', (data) => {
            this.toggleLargeTextMode(data.enabled);
        });
        
        // Listen for reduce motion mode toggle
        this.eventSystem.subscribe('toggle-reduce-motion-mode', (data) => {
            this.toggleReduceMotionMode(data.enabled);
        });
        
        // Listen for screen reader mode toggle
        this.eventSystem.subscribe('toggle-screen-reader-mode', (data) => {
            this.toggleScreenReaderMode(data.enabled);
        });
        
        // Listen for keyboard navigation mode toggle
        this.eventSystem.subscribe('toggle-keyboard-navigation-mode', (data) => {
            this.toggleKeyboardNavigationMode(data.enabled);
        });
        
        // Listen for text-to-speech toggle
        this.eventSystem.subscribe('toggle-text-to-speech', (data) => {
            this.toggleTextToSpeech(data.enabled);
        });
        
        // Listen for speech recognition toggle
        this.eventSystem.subscribe('toggle-speech-recognition', (data) => {
            this.toggleSpeechRecognition(data.enabled);
        });
        
        // Listen for simplified interface mode toggle
        this.eventSystem.subscribe('toggle-simplified-interface-mode', (data) => {
            this.toggleSimplifiedInterfaceMode(data.enabled);
        });
        
        // Listen for reading guide toggle
        this.eventSystem.subscribe('toggle-reading-guide', (data) => {
            this.toggleReadingGuide(data.enabled);
        });
        
        // Listen for dyslexia friendly font toggle
        this.eventSystem.subscribe('toggle-dyslexia-friendly-font', (data) => {
            this.toggleDyslexiaFriendlyFont(data.enabled);
        });
        
        // Listen for color filters change
        this.eventSystem.subscribe('set-color-filters', (data) => {
            this.setColorFilters(data.filterType);
        });
        
        // Listen for speak requests
        this.eventSystem.subscribe('speak-text', (data) => {
            this.speak(data.text, data.options);
        });
        
        // Listen for stop speaking requests
        this.eventSystem.subscribe('stop-speaking', () => {
            this.stopSpeaking();
        });
        
        // Listen for start listening requests
        this.eventSystem.subscribe('start-listening', () => {
            this.startListening();
        });
        
        // Listen for stop listening requests
        this.eventSystem.subscribe('stop-listening', () => {
            this.stopListening();
        });
        
        // Listen for new messages to speak them if text-to-speech is enabled
        this.eventSystem.subscribe('message-received', (data) => {
            if (this.state.textToSpeechEnabled && this.state.screenReaderMode) {
                this.speak(`MeAI says: ${data.message}`);
            }
        });
        
        // Set up DOM event listeners
        document.addEventListener('DOMContentLoaded', () => {
            // Track focus for keyboard navigation
            document.addEventListener('focusin', (event) => {
                this.state.currentFocusElement = event.target;
                
                // Show focus indicator if enabled
                if (this.state.focusIndicatorsEnabled && this.visualFeedbackSystem) {
                    this.visualFeedbackSystem.showFocusIndicator(event.target);
                }
            });
            
            // Handle keyboard navigation
            document.addEventListener('keydown', (event) => {
                // Check if keyboard navigation mode is enabled
                if (!this.state.keyboardNavigationMode) return;
                
                // Handle Tab key for improved focus management
                if (event.key === 'Tab') {
                    this.state.tabIndex = event.shiftKey ? this.state.tabIndex - 1 : this.state.tabIndex + 1;
                }
                
                // Handle Escape key to exit dialogs
                if (event.key === 'Escape') {
                    const dialogs = document.querySelectorAll('dialog[open], .modal.active');
                    if (dialogs.length > 0) {
                        const lastDialog = dialogs[dialogs.length - 1];
                        
                        // Close dialog
                        if (lastDialog.tagName === 'DIALOG') {
                            lastDialog.close();
                        } else {
                            lastDialog.classList.remove('active');
                        }
                        
                        event.preventDefault();
                    }
                }
                
                // Handle Alt+1 through Alt+9 for quick navigation
                if (event.altKey && event.key >= '1' && event.key <= '9') {
                    const index = parseInt(event.key) - 1;
                    const navItems = document.querySelectorAll('nav a, nav button');
                    
                    if (navItems.length > index) {
                        navItems[index].focus();
                        navItems[index].click();
                        event.preventDefault();
                    }
                }
            });
            
            // Add accessibility controls to settings panel
            const settingsPanel = document.querySelector('.settings-panel');
            if (settingsPanel && !document.getElementById('accessibility-settings')) {
                this.addAccessibilityControls(settingsPanel);
            }
        });
    }
    
    /**
     * Add accessibility controls to settings panel
     * @param {HTMLElement} settingsPanel - Settings panel element
     */
    addAccessibilityControls(settingsPanel) {
        // Create accessibility settings section
        const accessibilitySection = document.createElement('div');
        accessibilitySection.id = 'accessibility-settings';
        accessibilitySection.className = 'settings-section';
        
        // Add heading
        const heading = document.createElement('h2');
        heading.textContent = 'Accessibility';
        accessibilitySection.appendChild(heading);
        
        // Add description
        const description = document.createElement('p');
        description.textContent = 'Customize accessibility settings to make MeAI work better for you.';
        accessibilitySection.appendChild(description);
        
        // Add settings
        const settings = [
            {
                id: 'high-contrast-mode',
                label: 'High Contrast Mode',
                description: 'Increases contrast for better visibility',
                checked: this.state.highContrastMode,
                onChange: (checked) => this.toggleHighContrastMode(checked)
            },
            {
                id: 'large-text-mode',
                label: 'Large Text Mode',
                description: 'Increases text size for better readability',
                checked: this.state.largeTextMode,
                onChange: (checked) => this.toggleLargeTextMode(checked)
            },
            {
                id: 'reduce-motion-mode',
                label: 'Reduce Motion',
                description: 'Reduces animations and motion effects',
                checked: this.state.reduceMotionMode,
                onChange: (checked) => this.toggleReduceMotionMode(checked)
            },
            {
                id: 'screen-reader-mode',
                label: 'Screen Reader Support',
                description: 'Enhances compatibility with screen readers',
                checked: this.state.screenReaderMode,
                onChange: (checked) => this.toggleScreenReaderMode(checked)
            },
            {
                id: 'keyboard-navigation-mode',
                label: 'Keyboard Navigation',
                description: 'Improves navigation using keyboard',
                checked: this.state.keyboardNavigationMode,
                onChange: (checked) => this.toggleKeyboardNavigationMode(checked)
            },
            {
                id: 'text-to-speech',
                label: 'Text-to-Speech',
                description: 'Reads messages aloud',
                checked: this.state.textToSpeechEnabled,
                onChange: (checked) => this.toggleTextToSpeech(checked)
            },
            {
                id: 'speech-recognition',
                label: 'Speech Recognition',
                description: 'Control MeAI using voice commands',
                checked: this.state.speechRecognitionEnabled,
                onChange: (checked) => this.toggleSpeechRecognition(checked)
            },
            {
                id: 'simplified-interface-mode',
                label: 'Simplified Interface',
                description: 'Simplifies the interface for easier use',
                checked: this.state.simplifiedInterfaceMode,
                onChange: (checked) => this.toggleSimplifiedInterfaceMode(checked)
            },
            {
                id: 'reading-guide',
                label: 'Reading Guide',
                description: 'Shows a guide to help with reading',
                checked: this.state.readingGuideEnabled,
                onChange: (checked) => this.toggleReadingGuide(checked)
            },
            {
                id: 'dyslexia-friendly-font',
                label: 'Dyslexia-Friendly Font',
                description: 'Uses a font that is easier to read for people with dyslexia',
                checked: this.state.dyslexiaFriendlyFont,
                onChange: (checked) => this.toggleDyslexiaFriendlyFont(checked)
            }
        ];
        
        // Create settings controls
        settings.forEach(setting => {
            const settingContainer = document.createElement('div');
            settingContainer.className = 'setting-item';
            
            // Create switch
            const label = document.createElement('label');
            label.className = 'switch-label';
            label.setAttribute('for', setting.id);
            
            const switchContainer = document.createElement('div');
            switchContainer.className = 'switch-container';
            
            const switchInput = document.createElement('input');
            switchInput.type = 'checkbox';
            switchInput.id = setting.id;
            switchInput.className = 'switch-input';
            switchInput.checked = setting.checked;
            switchInput.addEventListener('change', () => {
                setting.onChange(switchInput.checked);
            });
            
            const switchSlider = document.createElement('span');
            switchSlider.className = 'switch-slider';
            
            switchContainer.appendChild(switchInput);
            switchContainer.appendChild(switchSlider);
            
            // Create label text
            const labelText = document.createElement('div');
            labelText.className = 'setting-label';
            
            const labelTitle = document.createElement('div');
            labelTitle.className = 'setting-title';
            labelTitle.textContent = setting.label;
            
            const labelDescription = document.createElement('div');
            labelDescription.className = 'setting-description';
            labelDescription.textContent = setting.description;
            
            labelText.appendChild(labelTitle);
            labelText.appendChild(labelDescription);
            
            // Assemble setting
            label.appendChild(switchContainer);
            label.appendChild(labelText);
            settingContainer.appendChild(label);
            
            accessibilitySection.appendChild(settingContainer);
        });
        
        // Add color filter selector
        const colorFilterContainer = document.createElement('div');
        colorFilterContainer.className = 'setting-item';
        
        const colorFilterLabel = document.createElement('div');
        colorFilterLabel.className = 'setting-label';
        
        const colorFilterTitle = document.createElement('div');
        colorFilterTitle.className = 'setting-title';
        colorFilterTitle.textContent = 'Color Filters';
        
        const colorFilterDescription = document.createElement('div');
        colorFilterDescription.className = 'setting-description';
        colorFilterDescription.textContent = 'Adjust colors for different types of color vision';
        
        colorFilterLabel.appendChild(colorFilterTitle);
        colorFilterLabel.appendChild(colorFilterDescription);
        
        const colorFilterSelect = document.createElement('select');
        colorFilterSelect.id = 'color-filter-select';
        colorFilterSelect.className = 'setting-select';
        colorFilterSelect.value = this.state.colorFilters;
        
        const filterOptions = [
            { value: 'none', label: 'None' },
            { value: 'protanopia', label: 'Protanopia (Red-Blind)' },
            { value: 'deuteranopia', label: 'Deuteranopia (Green-Blind)' },
            { value: 'tritanopia', label: 'Tritanopia (Blue-Blind)' },
            { value: 'grayscale', label: 'Grayscale' }
        ];
        
        filterOptions.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            optionElement.selected = option.value === this.state.colorFilters;
            colorFilterSelect.appendChild(optionElement);
        });
        
        colorFilterSelect.addEventListener('change', () => {
            this.setColorFilters(colorFilterSelect.value);
        });
        
        colorFilterContainer.appendChild(colorFilterLabel);
        colorFilterContainer.appendChild(colorFilterSelect);
        
        accessibilitySection.appendChild(colorFilterContainer);
        
        // Add to settings panel
        settingsPanel.appendChild(accessibilitySection);
    }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilitySystem;
} else {
    window.AccessibilitySystem = AccessibilitySystem;
}
