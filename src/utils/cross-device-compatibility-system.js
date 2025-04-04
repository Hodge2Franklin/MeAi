/**
 * Cross-Device Compatibility System
 * 
 * This system ensures the MeAI application works well across different devices,
 * screen sizes, and input methods, providing a consistent user experience.
 */

class CrossDeviceCompatibilitySystem {
    constructor() {
        // Initialize state
        this.state = {
            initialized: false,
            deviceType: 'unknown', // 'mobile', 'tablet', 'desktop'
            orientation: 'unknown', // 'portrait', 'landscape'
            touchEnabled: false,
            screenSize: {
                width: 0,
                height: 0,
                category: 'unknown' // 'small', 'medium', 'large'
            },
            inputMethods: {
                touch: false,
                mouse: false,
                keyboard: false
            },
            adaptationsApplied: false
        };
        
        // Initialize the system
        this.initialize();
    }
    
    /**
     * Initialize the cross-device compatibility system
     */
    initialize() {
        try {
            console.log('Initializing Cross-Device Compatibility System...');
            
            // Create event system if not exists
            window.eventSystem = window.eventSystem || this.createEventSystem();
            
            // Detect device characteristics
            this.detectDeviceCharacteristics();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Apply adaptations
            this.applyAdaptations();
            
            // Add responsive meta tag if not present
            this.ensureResponsiveMetaTag();
            
            // Mark as initialized
            this.state.initialized = true;
            
            console.log('Cross-Device Compatibility System initialized successfully');
            
            return true;
        } catch (error) {
            console.error('Error initializing Cross-Device Compatibility System:', error);
            return false;
        }
    }
    
    /**
     * Create event system if not exists
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
     * Detect device characteristics
     */
    detectDeviceCharacteristics() {
        // Detect screen size
        this.updateScreenSize();
        
        // Detect device type
        this.detectDeviceType();
        
        // Detect orientation
        this.detectOrientation();
        
        // Detect touch capability
        this.state.touchEnabled = ('ontouchstart' in window) || 
                                 (navigator.maxTouchPoints > 0) || 
                                 (navigator.msMaxTouchPoints > 0);
        
        // Detect input methods
        this.state.inputMethods.touch = this.state.touchEnabled;
        this.state.inputMethods.mouse = !this.isMobileDevice();
        this.state.inputMethods.keyboard = !this.isMobileDevice() || this.isTabletDevice();
        
        console.log('Device characteristics:', {
            deviceType: this.state.deviceType,
            orientation: this.state.orientation,
            touchEnabled: this.state.touchEnabled,
            screenSize: this.state.screenSize,
            inputMethods: this.state.inputMethods
        });
    }
    
    /**
     * Update screen size information
     */
    updateScreenSize() {
        // Get current dimensions
        this.state.screenSize.width = window.innerWidth;
        this.state.screenSize.height = window.innerHeight;
        
        // Determine size category
        if (this.state.screenSize.width < 576) {
            this.state.screenSize.category = 'small';
        } else if (this.state.screenSize.width < 992) {
            this.state.screenSize.category = 'medium';
        } else {
            this.state.screenSize.category = 'large';
        }
    }
    
    /**
     * Detect device type
     */
    detectDeviceType() {
        // Check for mobile device
        if (this.isMobileDevice()) {
            // Differentiate between phone and tablet
            if (this.isTabletDevice()) {
                this.state.deviceType = 'tablet';
            } else {
                this.state.deviceType = 'mobile';
            }
        } else {
            this.state.deviceType = 'desktop';
        }
    }
    
    /**
     * Check if device is mobile
     * @returns {boolean} - True if mobile device
     */
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (this.state.touchEnabled && this.state.screenSize.width < 992);
    }
    
    /**
     * Check if device is tablet
     * @returns {boolean} - True if tablet device
     */
    isTabletDevice() {
        return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent) ||
               (this.state.touchEnabled && this.state.screenSize.width >= 768 && this.state.screenSize.width < 1200);
    }
    
    /**
     * Detect orientation
     */
    detectOrientation() {
        if (window.matchMedia("(orientation: portrait)").matches) {
            this.state.orientation = 'portrait';
        } else {
            this.state.orientation = 'landscape';
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for resize events
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Listen for orientation change
        window.addEventListener('orientationchange', () => {
            this.handleOrientationChange();
        });
        
        // Listen for input method detection
        window.addEventListener('touchstart', () => {
            if (!this.state.inputMethods.touch) {
                this.state.inputMethods.touch = true;
                this.applyInputMethodAdaptations();
            }
        }, { once: true });
        
        window.addEventListener('mousemove', () => {
            if (!this.state.inputMethods.mouse) {
                this.state.inputMethods.mouse = true;
                this.applyInputMethodAdaptations();
            }
        }, { once: true });
        
        window.addEventListener('keydown', () => {
            if (!this.state.inputMethods.keyboard) {
                this.state.inputMethods.keyboard = true;
                this.applyInputMethodAdaptations();
            }
        }, { once: true });
        
        // Listen for app initialization
        window.eventSystem.subscribe('app-initialized', () => {
            // Reapply adaptations after app is initialized
            setTimeout(() => {
                this.applyAdaptations();
            }, 500);
        });
    }
    
    /**
     * Handle resize event
     */
    handleResize() {
        // Update screen size
        this.updateScreenSize();
        
        // Detect orientation
        this.detectOrientation();
        
        // Reapply adaptations
        this.applyAdaptations();
        
        // Publish event
        window.eventSystem.publish('device-characteristics-changed', {
            screenSize: this.state.screenSize,
            orientation: this.state.orientation
        });
    }
    
    /**
     * Handle orientation change
     */
    handleOrientationChange() {
        // Wait for orientation change to complete
        setTimeout(() => {
            // Update screen size
            this.updateScreenSize();
            
            // Detect orientation
            this.detectOrientation();
            
            // Reapply adaptations
            this.applyAdaptations();
            
            // Publish event
            window.eventSystem.publish('orientation-changed', {
                orientation: this.state.orientation,
                screenSize: this.state.screenSize
            });
        }, 300);
    }
    
    /**
     * Ensure responsive meta tag is present
     */
    ensureResponsiveMetaTag() {
        // Check if viewport meta tag exists
        let viewportMeta = document.querySelector('meta[name="viewport"]');
        
        // Create it if it doesn't exist
        if (!viewportMeta) {
            viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            document.head.appendChild(viewportMeta);
        }
        
        // Set appropriate content
        viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }
    
    /**
     * Apply adaptations based on device characteristics
     */
    applyAdaptations() {
        // Apply device type class to body
        document.body.classList.remove('device-mobile', 'device-tablet', 'device-desktop');
        document.body.classList.add(`device-${this.state.deviceType}`);
        
        // Apply screen size class to body
        document.body.classList.remove('screen-small', 'screen-medium', 'screen-large');
        document.body.classList.add(`screen-${this.state.screenSize.category}`);
        
        // Apply orientation class to body
        document.body.classList.remove('orientation-portrait', 'orientation-landscape');
        document.body.classList.add(`orientation-${this.state.orientation}`);
        
        // Apply touch capability class to body
        if (this.state.touchEnabled) {
            document.body.classList.add('touch-enabled');
        } else {
            document.body.classList.remove('touch-enabled');
        }
        
        // Apply specific adaptations
        this.applyLayoutAdaptations();
        this.applyInputMethodAdaptations();
        this.applyInteractionAdaptations();
        
        // Mark adaptations as applied
        this.state.adaptationsApplied = true;
        
        // Publish event
        window.eventSystem.publish('adaptations-applied', {
            deviceType: this.state.deviceType,
            screenSize: this.state.screenSize.category,
            orientation: this.state.orientation,
            touchEnabled: this.state.touchEnabled
        });
    }
    
    /**
     * Apply layout adaptations
     */
    applyLayoutAdaptations() {
        // Adjust layout based on device type and screen size
        switch (this.state.deviceType) {
            case 'mobile':
                this.applyMobileLayout();
                break;
            case 'tablet':
                this.applyTabletLayout();
                break;
            case 'desktop':
                this.applyDesktopLayout();
                break;
        }
        
        // Adjust for orientation
        if (this.state.orientation === 'portrait' && (this.state.deviceType === 'mobile' || this.state.deviceType === 'tablet')) {
            this.applyPortraitLayout();
        } else if (this.state.orientation === 'landscape' && (this.state.deviceType === 'mobile' || this.state.deviceType === 'tablet')) {
            this.applyLandscapeLayout();
        }
    }
    
    /**
     * Apply mobile layout
     */
    applyMobileLayout() {
        // Find main containers
        const conversationContainer = document.getElementById('conversation-container');
        const visualizationArea = document.getElementById('visualization-area');
        const inputContainer = document.getElementById('input-container');
        
        // Adjust conversation container
        if (conversationContainer) {
            conversationContainer.style.maxHeight = '60vh';
            conversationContainer.style.width = '100%';
        }
        
        // Adjust visualization area
        if (visualizationArea) {
            visualizationArea.style.height = '30vh';
            visualizationArea.style.width = '100%';
        }
        
        // Adjust input container
        if (inputContainer) {
            inputContainer.style.position = 'fixed';
            inputContainer.style.bottom = '0';
            inputContainer.style.width = '100%';
            inputContainer.style.padding = '10px';
        }
        
        // Hide non-essential elements
        const nonEssentialElements = document.querySelectorAll('.non-essential-mobile');
        nonEssentialElements.forEach(element => {
            element.style.display = 'none';
        });
        
        // Show mobile-specific elements
        const mobileElements = document.querySelectorAll('.mobile-only');
        mobileElements.forEach(element => {
            element.style.display = 'block';
        });
    }
    
    /**
     * Apply tablet layout
     */
    applyTabletLayout() {
        // Find main containers
        const conversationContainer = document.getElementById('conversation-container');
        const visualizationArea = document.getElementById('visualization-area');
        const inputContainer = document.getElementById('input-container');
        
        // Adjust conversation container
        if (conversationContainer) {
            conversationContainer.style.maxHeight = '65vh';
            conversationContainer.style.width = '100%';
        }
        
        // Adjust visualization area
        if (visualizationArea) {
            visualizationArea.style.height = '25vh';
            visualizationArea.style.width = '100%';
        }
        
        // Adjust input container
        if (inputContainer) {
            inputContainer.style.position = 'fixed';
            inputContainer.style.bottom = '0';
            inputContainer.style.width = '100%';
            inputContainer.style.padding = '15px';
        }
        
        // Show tablet-specific elements
        const tabletElements = document.querySelectorAll('.tablet-only');
        tabletElements.forEach(element => {
            element.style.display = 'block';
        });
    }
    
    /**
     * Apply desktop layout
     */
    applyDesktopLayout() {
        // Find main containers
        const conversationContainer = document.getElementById('conversation-container');
        const visualizationArea = document.getElementById('visualization-area');
        const inputContainer = document.getElementById('input-container');
        
        // Adjust conversation container
        if (conversationContainer) {
            conversationContainer.style.maxHeight = '70vh';
            conversationContainer.style.width = '60%';
            conversationContainer.style.margin = '0 auto';
        }
        
        // Adjust visualization area
        if (visualizationArea) {
            visualizationArea.style.height = '30vh';
            visualizationArea.style.width = '40%';
            visualizationArea.style.position = 'fixed';
            visualizationArea.style.right = '20px';
            visualizationArea.style.top = '20px';
        }
        
        // Adjust input container
        if (inputContainer) {
            inputContainer.style.position = 'relative';
            inputContainer.style.width = '60%';
            inputContainer.style.margin = '20px auto';
            inputContainer.style.padding = '15px';
        }
        
        // Show desktop-specific elements
        const desktopElements = document.querySelectorAll('.desktop-only');
        desktopElements.forEach(element => {
            element.style.display = 'block';
        });
    }
    
    /**
     * Apply portrait layout
     */
    applyPortraitLayout() {
        // Find main containers
        const conversationContainer = document.getElementById('conversation-container');
        const visualizationArea = document.getElementById('visualization-area');
        
        // Stack elements vertically
        if (conversationContainer && visualizationArea) {
            visualizationArea.style.position = 'relative';
            visualizationArea.style.width = '100%';
            visualizationArea.style.right = 'auto';
            visualizationArea.style.top = 'auto';
        }
    }
    
    /**
     * Apply landscape layout
     */
    applyLandscapeLayout() {
        // Find main containers
        const conversationContainer = document.getElementById('conversation-container');
        const visualizationArea = document.getElementById('visualization-area');
        
        // Arrange elements side by side
        if (conversationContainer && visualizationArea && this.state.deviceType === 'tablet') {
            conversationContainer.style.width = '60%';
            conversationContainer.style.float = 'left';
            
            visualizationArea.style.width = '35%';
            visualizationArea.style.float = 'right';
            visualizationArea.style.height = '60vh';
        }
    }
    
    /**
     * Apply input method adaptations
     */
    applyInputMethodAdaptations() {
        // Adjust for touch input
        if (this.state.inputMethods.touch) {
            // Increase touch target sizes
            document.body.classList.add('touch-input');
            
            // Add touch-specific styles
            const style = document.createElement('style');
            style.id = 'touch-input-styles';
            style.textContent = `
                .button, .clickable, input, select {
                    min-height: 44px;
                    min-width: 44px;
                }
                
                .button, .clickable {
                    padding: 12px;
                }
                
                input, select {
                    font-size: 16px; /* Prevents zoom on iOS */
                }
            `;
            
            // Add style if not already present
            if (!document.getElementById('touch-input-styles')) {
                document.head.appendChild(style);
            }
        } else {
            document.body.classList.remove('touch-input');
            
            // Remove touch-specific styles
            const touchStyles = document.getElementById('touch-input-styles');
            if (touchStyles) {
                touchStyles.remove();
            }
        }
        
        // Adjust for keyboard input
        if (this.state.inputMethods.keyboard) {
            // Add keyboard shortcuts
            this.setupKeyboardShortcuts();
            
            // Show keyboard shortcut hints
            const shortcutHints = document.querySelectorAll('.keyboard-shortcut-hint');
            shortcutHints.forEach(hint => {
                hint.style.display = 'inline';
            });
        } else {
            // Hide keyboard shortcut hints
            const shortcutHints = document.querySelectorAll('.keyboard-shortcut-hint');
            shortcutHints.forEach(hint => {
                hint.style.display = 'none';
            });
        }
    }
    
    /**
     * Apply interaction adaptations
     */
    applyInteractionAdaptations() {
        // Adjust for touch devices
        if (this.state.touchEnabled) {
            // Add swipe handlers
            this.setupSwipeHandlers();
            
            // Ensure sufficient spacing between interactive elements
            const interactiveElements = document.querySelectorAll('button, a, input, select, .clickable');
            interactiveElements.forEach(element => {
                element.style.margin = '8px';
            });
        }
        
        // Adjust font sizes based on screen size
        let baseFontSize = '16px';
        
        switch (this.state.screenSize.category) {
            case 'small':
                baseFontSize = '14px';
                break;
            case 'medium':
                baseFontSize = '16px';
                break;
            case 'large':
                baseFontSize = '18px';
                break;
        }
        
        document.documentElement.style.fontSize = baseFontSize;
    }
    
    /**
     * Set up keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        // Remove existing listener to prevent duplicates
        document.removeEventListener('keydown', this.handleKeyboardShortcut);
        
        // Add keyboard shortcut handler
        document.addEventListener('keydown', this.handleKeyboardShortcut);
    }
    
    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyboardShortcut = (event) => {
        // Only process if not in an input field
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // Process shortcuts
        switch (event.key) {
            case '/':
                // Focus on input field
                const inputField = document.getElementById('user-input');
                if (inputField) {
                    event.preventDefault();
                    inputField.focus();
                }
                break;
            case 'Escape':
                // Clear input or close modal
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    event.preventDefault();
                    window.eventSystem.publish('close-modal', {});
                }
                break;
            case 'c':
                // Clear conversation (with Ctrl/Cmd)
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    window.eventSystem.publish('clear-conversation', {});
                }
                break;
        }
    }
    
    /**
     * Set up swipe handlers
     */
    setupSwipeHandlers() {
        // Remove existing listeners to prevent duplicates
        document.removeEventListener('touchstart', this.handleTouchStart);
        document.removeEventListener('touchmove', this.handleTouchMove);
        document.removeEventListener('touchend', this.handleTouchEnd);
        
        // Add touch event handlers
        document.addEventListener('touchstart', this.handleTouchStart, false);
        document.addEventListener('touchmove', this.handleTouchMove, false);
        document.addEventListener('touchend', this.handleTouchEnd, false);
    }
    
    // Touch handling variables
    touchStartX = 0;
    touchStartY = 0;
    touchEndX = 0;
    touchEndY = 0;
    
    /**
     * Handle touch start
     * @param {TouchEvent} event - Touch event
     */
    handleTouchStart = (event) => {
        this.touchStartX = event.changedTouches[0].screenX;
        this.touchStartY = event.changedTouches[0].screenY;
    }
    
    /**
     * Handle touch move
     * @param {TouchEvent} event - Touch event
     */
    handleTouchMove = (event) => {
        // Update end position
        this.touchEndX = event.changedTouches[0].screenX;
        this.touchEndY = event.changedTouches[0].screenY;
    }
    
    /**
     * Handle touch end
     * @param {TouchEvent} event - Touch event
     */
    handleTouchEnd = (event) => {
        this.touchEndX = event.changedTouches[0].screenX;
        this.touchEndY = event.changedTouches[0].screenY;
        
        // Calculate swipe distance
        const horizontalDistance = this.touchEndX - this.touchStartX;
        const verticalDistance = this.touchEndY - this.touchStartY;
        
        // Determine if it's a swipe (minimum distance threshold)
        const minSwipeDistance = 100;
        
        if (Math.abs(horizontalDistance) > minSwipeDistance || Math.abs(verticalDistance) > minSwipeDistance) {
            // Determine swipe direction
            if (Math.abs(horizontalDistance) > Math.abs(verticalDistance)) {
                // Horizontal swipe
                if (horizontalDistance > 0) {
                    // Right swipe
                    this.handleRightSwipe(event.target);
                } else {
                    // Left swipe
                    this.handleLeftSwipe(event.target);
                }
            } else {
                // Vertical swipe
                if (verticalDistance > 0) {
                    // Down swipe
                    this.handleDownSwipe(event.target);
                } else {
                    // Up swipe
                    this.handleUpSwipe(event.target);
                }
            }
        }
    }
    
    /**
     * Handle right swipe
     * @param {Element} target - Swipe target element
     */
    handleRightSwipe(target) {
        // Check if swipe is on conversation container
        if (target.closest('#conversation-container') || target.id === 'conversation-container') {
            // Show visualization if minimized
            const visualizationArea = document.getElementById('visualization-area');
            if (visualizationArea && visualizationArea.classList.contains('minimized')) {
                window.eventSystem.publish('toggle-visualization', { show: true });
            }
        }
    }
    
    /**
     * Handle left swipe
     * @param {Element} target - Swipe target element
     */
    handleLeftSwipe(target) {
        // Check if swipe is on visualization area
        if (target.closest('#visualization-area') || target.id === 'visualization-area') {
            // Minimize visualization
            window.eventSystem.publish('toggle-visualization', { show: false });
        }
    }
    
    /**
     * Handle up swipe
     * @param {Element} target - Swipe target element
     */
    handleUpSwipe(target) {
        // Check if swipe is near bottom of screen
        const viewportHeight = window.innerHeight;
        const touchY = this.touchStartY;
        
        if (viewportHeight - touchY < 150) {
            // Swipe up from bottom - focus on input
            const inputField = document.getElementById('user-input');
            if (inputField) {
                inputField.focus();
            }
        }
    }
    
    /**
     * Handle down swipe
     * @param {Element} target - Swipe target element
     */
    handleDownSwipe(target) {
        // Check if swipe is on input container
        if (target.closest('#input-container') || target.id === 'input-container') {
            // Blur input field
            const inputField = document.getElementById('user-input');
            if (inputField && document.activeElement === inputField) {
                inputField.blur();
            }
        }
    }
    
    /**
     * Get device type
     * @returns {string} - Device type
     */
    getDeviceType() {
        return this.state.deviceType;
    }
    
    /**
     * Get screen size
     * @returns {Object} - Screen size information
     */
    getScreenSize() {
        return this.state.screenSize;
    }
    
    /**
     * Get orientation
     * @returns {string} - Orientation
     */
    getOrientation() {
        return this.state.orientation;
    }
    
    /**
     * Check if touch is enabled
     * @returns {boolean} - True if touch is enabled
     */
    isTouchEnabled() {
        return this.state.touchEnabled;
    }
    
    /**
     * Get available input methods
     * @returns {Object} - Input methods
     */
    getInputMethods() {
        return this.state.inputMethods;
    }
}

// Create singleton instance
const crossDeviceCompatibilitySystem = new CrossDeviceCompatibilitySystem();

// Export the singleton
window.crossDeviceCompatibilitySystem = crossDeviceCompatibilitySystem;
