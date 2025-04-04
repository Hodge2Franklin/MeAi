/**
 * Accessibility System
 * 
 * This system provides accessibility features including high contrast mode,
 * large text mode, color blindness accommodations, enhanced focus indicators,
 * and reduced motion options.
 */

class AccessibilitySystem {
    constructor() {
        // Initialize dependencies
        this.storageManager = window.storageManager;
        this.eventSystem = window.eventSystem;
        this.themeSystem = window.themeSystem;
        
        // Accessibility state
        this.state = {
            highContrastMode: false,
            largeTextMode: false,
            colorBlindnessMode: 'none', // none, protanopia, deuteranopia, tritanopia
            enhancedFocus: false,
            reducedMotion: false,
            screenReaderOptimized: false
        };
        
        // Color adjustments for color blindness modes
        this.colorAdjustments = {
            protanopia: {
                // Red-blind adjustments
                red: { r: 0.56667, g: 0.43333, b: 0 },
                green: { r: 0.55833, g: 0.44167, b: 0 },
                blue: { r: 0, g: 0.24167, b: 0.75833 }
            },
            deuteranopia: {
                // Green-blind adjustments
                red: { r: 0.625, g: 0.375, b: 0 },
                green: { r: 0.7, g: 0.3, b: 0 },
                blue: { r: 0, g: 0.3, b: 0.7 }
            },
            tritanopia: {
                // Blue-blind adjustments
                red: { r: 0.95, g: 0.05, b: 0 },
                green: { r: 0, g: 0.43333, b: 0.56667 },
                blue: { r: 0, g: 0.475, b: 0.525 }
            }
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
            // Check for system preferences
            this.checkSystemPreferences();
            
            // Load user preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'user-preferences');
            if (preferences) {
                if (preferences.highContrastMode !== undefined) {
                    this.state.highContrastMode = preferences.highContrastMode;
                }
                
                if (preferences.largeTextMode !== undefined) {
                    this.state.largeTextMode = preferences.largeTextMode;
                }
                
                if (preferences.colorBlindnessMode !== undefined) {
                    this.state.colorBlindnessMode = preferences.colorBlindnessMode;
                }
                
                if (preferences.enhancedFocus !== undefined) {
                    this.state.enhancedFocus = preferences.enhancedFocus;
                }
                
                if (preferences.reducedMotion !== undefined) {
                    this.state.reducedMotion = preferences.reducedMotion;
                }
                
                if (preferences.screenReaderOptimized !== undefined) {
                    this.state.screenReaderOptimized = preferences.screenReaderOptimized;
                }
            }
            
            // Apply accessibility settings
            this.applyAccessibilitySettings();
            
            console.log('Accessibility System initialized');
            
            // Notify system that accessibility is ready
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
        if (window.matchMedia) {
            // Check for prefers-reduced-motion
            const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            if (reducedMotionQuery.matches) {
                this.state.reducedMotion = true;
            }
            
            // Check for prefers-contrast
            const highContrastQuery = window.matchMedia('(prefers-contrast: more)');
            if (highContrastQuery.matches) {
                this.state.highContrastMode = true;
            }
            
            // Check for prefers-color-scheme
            const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            if (darkModeQuery.matches && this.themeSystem) {
                this.themeSystem.setTheme('dark');
            }
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for high contrast mode toggle
        this.eventSystem.subscribe('high-contrast-toggle', (data) => {
            this.toggleHighContrastMode(data.enabled);
        });
        
        // Listen for large text mode toggle
        this.eventSystem.subscribe('large-text-toggle', (data) => {
            this.toggleLargeTextMode(data.enabled);
        });
        
        // Listen for color blindness mode change
        this.eventSystem.subscribe('color-blindness-mode-change', (data) => {
            this.setColorBlindnessMode(data.mode);
        });
        
        // Listen for enhanced focus toggle
        this.eventSystem.subscribe('enhanced-focus-toggle', (data) => {
            this.toggleEnhancedFocus(data.enabled);
        });
        
        // Listen for reduced motion toggle
        this.eventSystem.subscribe('reduced-motion-toggle', (data) => {
            this.toggleReducedMotion(data.enabled);
        });
        
        // Listen for screen reader optimization toggle
        this.eventSystem.subscribe('screen-reader-toggle', (data) => {
            this.toggleScreenReaderOptimization(data.enabled);
        });
        
        // Listen for theme changes
        this.eventSystem.subscribe('theme-changed', () => {
            this.applyAccessibilitySettings();
        });
        
        // Set up DOM event listeners
        document.addEventListener('DOMContentLoaded', () => {
            // Set up high contrast toggle
            const highContrastToggle = document.getElementById('high-contrast-toggle');
            if (highContrastToggle) {
                highContrastToggle.checked = this.state.highContrastMode;
                highContrastToggle.addEventListener('change', (event) => {
                    this.toggleHighContrastMode(event.target.checked);
                });
            }
            
            // Set up large text toggle
            const largeTextToggle = document.getElementById('large-text-toggle');
            if (largeTextToggle) {
                largeTextToggle.checked = this.state.largeTextMode;
                largeTextToggle.addEventListener('change', (event) => {
                    this.toggleLargeTextMode(event.target.checked);
                });
            }
            
            // Set up color blindness mode selector
            const colorBlindnessSelector = document.getElementById('color-blindness-mode');
            if (colorBlindnessSelector) {
                colorBlindnessSelector.value = this.state.colorBlindnessMode;
                colorBlindnessSelector.addEventListener('change', (event) => {
                    this.setColorBlindnessMode(event.target.value);
                });
            }
            
            // Set up enhanced focus toggle
            const enhancedFocusToggle = document.getElementById('enhanced-focus-toggle');
            if (enhancedFocusToggle) {
                enhancedFocusToggle.checked = this.state.enhancedFocus;
                enhancedFocusToggle.addEventListener('change', (event) => {
                    this.toggleEnhancedFocus(event.target.checked);
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
            
            // Set up screen reader optimization toggle
            const screenReaderToggle = document.getElementById('screen-reader-toggle');
            if (screenReaderToggle) {
                screenReaderToggle.checked = this.state.screenReaderOptimized;
                screenReaderToggle.addEventListener('change', (event) => {
                    this.toggleScreenReaderOptimization(event.target.checked);
                });
            }
            
            // Add keyboard shortcut for accessibility panel
            document.addEventListener('keydown', (event) => {
                // Alt + A to toggle accessibility panel
                if (event.altKey && event.key === 'a') {
                    this.toggleAccessibilityPanel();
                }
            });
            
            // Enhance focus indicators for all focusable elements
            this.enhanceFocusIndicators();
        });
        
        // Listen for system preference changes
        if (window.matchMedia) {
            // Listen for reduced motion preference changes
            const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            reducedMotionQuery.addEventListener('change', () => {
                if (reducedMotionQuery.matches) {
                    this.toggleReducedMotion(true);
                }
            });
            
            // Listen for contrast preference changes
            const highContrastQuery = window.matchMedia('(prefers-contrast: more)');
            highContrastQuery.addEventListener('change', () => {
                if (highContrastQuery.matches) {
                    this.toggleHighContrastMode(true);
                }
            });
        }
    }
    
    /**
     * Apply accessibility settings based on current state
     */
    applyAccessibilitySettings() {
        const root = document.documentElement;
        
        // Apply high contrast mode
        if (this.state.highContrastMode) {
            document.body.classList.add('high-contrast');
            root.style.setProperty('--high-contrast-mode', '1');
        } else {
            document.body.classList.remove('high-contrast');
            root.style.setProperty('--high-contrast-mode', '0');
        }
        
        // Apply large text mode
        if (this.state.largeTextMode) {
            document.body.classList.add('large-text');
            root.style.setProperty('--large-text-mode', '1');
        } else {
            document.body.classList.remove('large-text');
            root.style.setProperty('--large-text-mode', '0');
        }
        
        // Apply color blindness mode
        document.body.classList.remove('protanopia', 'deuteranopia', 'tritanopia');
        if (this.state.colorBlindnessMode !== 'none') {
            document.body.classList.add(this.state.colorBlindnessMode);
            this.applyColorBlindnessFilter();
        } else {
            this.removeColorBlindnessFilter();
        }
        
        // Apply enhanced focus
        if (this.state.enhancedFocus) {
            document.body.classList.add('enhanced-focus');
            root.style.setProperty('--enhanced-focus', '1');
        } else {
            document.body.classList.remove('enhanced-focus');
            root.style.setProperty('--enhanced-focus', '0');
        }
        
        // Apply reduced motion
        if (this.state.reducedMotion) {
            document.body.classList.add('reduced-motion');
            root.style.setProperty('--reduced-motion', '1');
            
            // Notify animation system
            this.eventSystem.publish('reduced-motion-toggle', {
                enabled: true
            });
        } else {
            document.body.classList.remove('reduced-motion');
            root.style.setProperty('--reduced-motion', '0');
        }
        
        // Apply screen reader optimization
        if (this.state.screenReaderOptimized) {
            document.body.classList.add('screen-reader-optimized');
            root.style.setProperty('--screen-reader-optimized', '1');
            this.enhanceScreenReaderExperience();
        } else {
            document.body.classList.remove('screen-reader-optimized');
            root.style.setProperty('--screen-reader-optimized', '0');
        }
    }
    
    /**
     * Toggle high contrast mode
     * @param {boolean} enabled - Whether high contrast mode should be enabled
     */
    async toggleHighContrastMode(enabled) {
        // Update state
        this.state.highContrastMode = enabled;
        
        // Apply settings
        this.applyAccessibilitySettings();
        
        // Save preference
        try {
            // Get current preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'user-preferences') || {
                id: 'user-preferences'
            };
            
            // Update high contrast preference
            preferences.highContrastMode = enabled;
            
            // Save preferences
            await this.storageManager.setIndexedDB('preferences', preferences);
            
            // Publish event that high contrast was toggled
            this.eventSystem.publish('high-contrast-toggled', {
                enabled: enabled
            });
            
            console.log(`High contrast mode ${enabled ? 'enabled' : 'disabled'}`);
        } catch (error) {
            console.error('Error saving high contrast preference:', error);
        }
    }
    
    /**
     * Toggle large text mode
     * @param {boolean} enabled - Whether large text mode should be enabled
     */
    async toggleLargeTextMode(enabled) {
        // Update state
        this.state.largeTextMode = enabled;
        
        // Apply settings
        this.applyAccessibilitySettings();
        
        // Save preference
        try {
            // Get current preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'user-preferences') || {
                id: 'user-preferences'
            };
            
            // Update large text preference
            preferences.largeTextMode = enabled;
            
            // Save preferences
            await this.storageManager.setIndexedDB('preferences', preferences);
            
            // Publish event that large text was toggled
            this.eventSystem.publish('large-text-toggled', {
                enabled: enabled
            });
            
            console.log(`Large text mode ${enabled ? 'enabled' : 'disabled'}`);
        } catch (error) {
            console.error('Error saving large text preference:', error);
        }
    }
    
    /**
     * Set color blindness mode
     * @param {string} mode - Color blindness mode (none, protanopia, deuteranopia, tritanopia)
     */
    async setColorBlindnessMode(mode) {
        // Validate mode
        if (!['none', 'protanopia', 'deuteranopia', 'tritanopia'].includes(mode)) {
            console.warn(`Invalid color blindness mode: ${mode}, defaulting to none`);
            mode = 'none';
        }
        
        // Update state
        this.state.colorBlindnessMode = mode;
        
        // Apply settings
        this.applyAccessibilitySettings();
        
        // Save preference
        try {
            // Get current preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'user-preferences') || {
                id: 'user-preferences'
            };
            
            // Update color blindness preference
            preferences.colorBlindnessMode = mode;
            
            // Save preferences
            await this.storageManager.setIndexedDB('preferences', preferences);
            
            // Publish event that color blindness mode was changed
            this.eventSystem.publish('color-blindness-mode-changed', {
                mode: mode
            });
            
            console.log(`Color blindness mode set to: ${mode}`);
        } catch (error) {
            console.error('Error saving color blindness preference:', error);
        }
    }
    
    /**
     * Apply color blindness filter using SVG filter
     */
    applyColorBlindnessFilter() {
        // Remove any existing filter
        this.removeColorBlindnessFilter();
        
        // Skip if mode is none
        if (this.state.colorBlindnessMode === 'none') return;
        
        // Get color adjustments for selected mode
        const adjustments = this.colorAdjustments[this.state.colorBlindnessMode];
        if (!adjustments) return;
        
        // Create SVG filter element
        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('id', 'color-blindness-filter');
        svg.setAttribute('width', '0');
        svg.setAttribute('height', '0');
        svg.style.position = 'absolute';
        svg.style.zIndex = '-1000';
        
        // Create filter
        const filter = document.createElementNS(svgNS, 'filter');
        filter.setAttribute('id', 'color-filter');
        
        // Create color matrix
        const matrix = document.createElementNS(svgNS, 'feColorMatrix');
        matrix.setAttribute('type', 'matrix');
        matrix.setAttribute('in', 'SourceGraphic');
        
        // Set matrix values based on color blindness type
        const { red, green, blue } = adjustments;
        const values = [
            red.r, green.r, blue.r, 0, 0,
            red.g, green.g, blue.g, 0, 0,
            red.b, green.b, blue.b, 0, 0,
            0, 0, 0, 1, 0
        ].join(' ');
        
        matrix.setAttribute('values', values);
        
        // Assemble filter
        filter.appendChild(matrix);
        svg.appendChild(filter);
        
        // Add to document
        document.body.appendChild(svg);
        
        // Apply filter to body
        document.body.style.filter = 'url(#color-filter)';
    }
    
    /**
     * Remove color blindness filter
     */
    removeColorBlindnessFilter() {
        // Remove filter from body
        document.body.style.filter = '';
        
        // Remove SVG filter element
        const filterElement = document.getElementById('color-blindness-filter');
        if (filterElement) {
            filterElement.remove();
        }
    }
    
    /**
     * Toggle enhanced focus indicators
     * @param {boolean} enabled - Whether enhanced focus should be enabled
     */
    async toggleEnhancedFocus(enabled) {
        // Update state
        this.state.enhancedFocus = enabled;
        
        // Apply settings
        this.applyAccessibilitySettings();
        
        // Save preference
        try {
            // Get current preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'user-preferences') || {
                id: 'user-preferences'
            };
            
            // Update enhanced focus preference
            preferences.enhancedFocus = enabled;
            
            // Save preferences
            await this.storageManager.setIndexedDB('preferences', preferences);
            
            // Publish event that enhanced focus was toggled
            this.eventSystem.publish('enhanced-focus-toggled', {
                enabled: enabled
            });
            
            console.log(`Enhanced focus ${enabled ? 'enabled' : 'disabled'}`);
        } catch (error) {
            console.error('Error saving enhanced focus preference:', error);
        }
    }
    
    /**
     * Enhance focus indicators for all focusable elements
     */
    enhanceFocusIndicators() {
        // Add focus styles to all focusable elements
        const focusableElements = document.querySelectorAll(
            'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        focusableElements.forEach(element => {
            // Add focus event listener
            element.addEventListener('focus', () => {
                if (this.state.enhancedFocus) {
                    element.classList.add('enhanced-focus-visible');
                }
            });
            
            // Add blur event listener
            element.addEventListener('blur', () => {
                element.classList.remove('enhanced-focus-visible');
            });
        });
    }
    
    /**
     * Toggle reduced motion setting
     * @param {boolean} enabled - Whether reduced motion should be enabled
     */
    async toggleReducedMotion(enabled) {
        // Update state
        this.state.reducedMotion = enabled;
        
        // Apply settings
        this.applyAccessibilitySettings();
        
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
     * Toggle screen reader optimization
     * @param {boolean} enabled - Whether screen reader optimization should be enabled
     */
    async toggleScreenReaderOptimization(enabled) {
        // Update state
        this.state.screenReaderOptimized = enabled;
        
        // Apply settings
        this.applyAccessibilitySettings();
        
        // Save preference
        try {
            // Get current preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'user-preferences') || {
                id: 'user-preferences'
            };
            
            // Update screen reader preference
            preferences.screenReaderOptimized = enabled;
            
            // Save preferences
            await this.storageManager.setIndexedDB('preferences', preferences);
            
            // Publish event that screen reader optimization was toggled
            this.eventSystem.publish('screen-reader-optimization-toggled', {
                enabled: enabled
            });
            
            console.log(`Screen reader optimization ${enabled ? 'enabled' : 'disabled'}`);
        } catch (error) {
            console.error('Error saving screen reader preference:', error);
        }
    }
    
    /**
     * Enhance screen reader experience
     */
    enhanceScreenReaderExperience() {
        // Add ARIA landmarks if not already present
        if (!document.querySelector('[role="main"]')) {
            const mainContent = document.querySelector('.main-container, main, #main');
            if (mainContent) {
                mainContent.setAttribute('role', 'main');
            }
        }
        
        if (!document.querySelector('[role="navigation"]')) {
            const navigation = document.querySelector('nav, .navigation, .nav');
            if (navigation) {
                navigation.setAttribute('role', 'navigation');
            }
        }
        
        // Add skip to content link if not already present
        if (!document.getElementById('skip-to-content')) {
            const skipLink = document.createElement('a');
            skipLink.id = 'skip-to-content';
            skipLink.href = '#main';
            skipLink.textContent = 'Skip to content';
            skipLink.className = 'skip-link';
            
            // Add to beginning of body
            document.body.insertBefore(skipLink, document.body.firstChild);
            
            // Add event listener to focus on main content
            skipLink.addEventListener('click', (event) => {
                event.preventDefault();
                const mainContent = document.querySelector('[role="main"]');
                if (mainContent) {
                    mainContent.tabIndex = -1;
                    mainContent.focus();
                }
            });
        }
        
        // Add ARIA labels to unlabeled interactive elements
        const unlabeledButtons = document.querySelectorAll('button:not([aria-label]):not(:has(*))');
        unlabeledButtons.forEach(button => {
            if (!button.textContent.trim()) {
                // Try to infer purpose from classes or nearby elements
                let label = '';
                
                if (button.classList.contains('close') || button.classList.contains('dismiss')) {
                    label = 'Close';
                } else if (button.classList.contains('menu') || button.classList.contains('hamburger')) {
                    label = 'Menu';
                } else if (button.classList.contains('search')) {
                    label = 'Search';
                } else {
                    label = 'Button';
                }
                
                button.setAttribute('aria-label', label);
            }
        });
        
        // Add ARIA labels to images without alt text
        const unlabeledImages = document.querySelectorAll('img:not([alt])');
        unlabeledImages.forEach(img => {
            // Try to infer purpose from src or nearby elements
            let alt = '';
            
            if (img.src) {
                // Extract filename from src
                const filename = img.src.split('/').pop().split('.')[0];
                alt = filename.replace(/[-_]/g, ' ');
            } else {
                alt = 'Image';
            }
            
            img.setAttribute('alt', alt);
        });
        
        // Add ARIA live regions for dynamic content
        const messagesContainer = document.querySelector('.messages-container');
        if (messagesContainer && !messagesContainer.hasAttribute('aria-live')) {
            messagesContainer.setAttribute('aria-live', 'polite');
            messagesContainer.setAttribute('aria-relevant', 'additions');
        }
        
        // Add role="status" to typing indicator
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.setAttribute('role', 'status');
            typingIndicator.setAttribute('aria-label', 'MeAI is typing');
        }
    }
    
    /**
     * Toggle accessibility panel visibility
     */
    toggleAccessibilityPanel() {
        const panel = document.getElementById('accessibility-panel');
        if (!panel) return;
        
        if (panel.classList.contains('hidden')) {
            panel.classList.remove('hidden');
            
            // Focus on first control in panel
            const firstControl = panel.querySelector('button, input, select');
            if (firstControl) {
                firstControl.focus();
            }
        } else {
            panel.classList.add('hidden');
        }
    }
    
    /**
     * Get accessibility settings
     * @returns {Object} - Current accessibility settings
     */
    getAccessibilitySettings() {
        return { ...this.state };
    }
}

// Initialize the accessibility system when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.accessibilitySystem = new AccessibilitySystem();
});
