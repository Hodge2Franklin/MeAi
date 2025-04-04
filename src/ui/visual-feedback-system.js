/**
 * Visual Feedback System
 * 
 * This system provides enhanced visual feedback for user interactions,
 * system events, and state changes throughout the application.
 */

class VisualFeedbackSystem {
    constructor() {
        // Initialize dependencies
        this.storageManager = window.storageManager;
        this.eventSystem = window.eventSystem;
        this.themeSystem = window.themeSystem;
        this.accessibilitySystem = window.accessibilitySystem;
        this.interfaceAnimationSystem = window.interfaceAnimationSystem;
        this.enhancedInterfaceSystem = window.enhancedInterfaceSystem;
        this.userInteractionController = window.userInteractionController;
        this.animationUIIntegration = window.animationUIIntegration;
        
        // Feedback state
        this.state = {
            feedbackLevel: 'medium', // low, medium, high
            animationsEnabled: true,
            highlightEnabled: true,
            soundFeedbackEnabled: true,
            hapticFeedbackEnabled: true,
            colorFeedbackEnabled: true,
            motionFeedbackEnabled: true,
            focusIndicatorsEnabled: true,
            progressIndicatorsEnabled: true,
            statusIndicatorsEnabled: true,
            errorIndicatorsEnabled: true,
            successIndicatorsEnabled: true,
            warningIndicatorsEnabled: true,
            infoIndicatorsEnabled: true,
            activeIndicators: new Map(),
            activeHighlights: new Map(),
            activeProgressBars: new Map(),
            activeStatusIndicators: new Map(),
            lastFeedbackTime: Date.now(),
            feedbackQueue: [],
            processingFeedback: false
        };
        
        // Feedback configurations
        this.feedbackConfigs = {
            button: {
                hover: {
                    highlight: 'soft-glow',
                    animation: 'scale-up',
                    sound: 'hover',
                    haptic: 'light'
                },
                active: {
                    highlight: 'bright-glow',
                    animation: 'press-down',
                    sound: 'click',
                    haptic: 'medium'
                },
                disabled: {
                    highlight: 'none',
                    animation: 'none',
                    sound: 'disabled',
                    haptic: 'none'
                }
            },
            input: {
                focus: {
                    highlight: 'focus-border',
                    animation: 'gentle-pulse',
                    sound: 'focus',
                    haptic: 'light'
                },
                valid: {
                    highlight: 'valid-border',
                    animation: 'none',
                    sound: 'none',
                    haptic: 'none'
                },
                invalid: {
                    highlight: 'invalid-border',
                    animation: 'shake',
                    sound: 'error',
                    haptic: 'error'
                }
            },
            message: {
                new: {
                    highlight: 'fade-in',
                    animation: 'slide-in',
                    sound: 'message',
                    haptic: 'light'
                },
                error: {
                    highlight: 'error-border',
                    animation: 'attention-shake',
                    sound: 'error',
                    haptic: 'error'
                },
                success: {
                    highlight: 'success-border',
                    animation: 'success-bounce',
                    sound: 'success',
                    haptic: 'success'
                }
            },
            notification: {
                info: {
                    highlight: 'info-glow',
                    animation: 'slide-in-fade',
                    sound: 'notification',
                    haptic: 'light'
                },
                warning: {
                    highlight: 'warning-glow',
                    animation: 'attention-pulse',
                    sound: 'warning',
                    haptic: 'warning'
                },
                error: {
                    highlight: 'error-glow',
                    animation: 'error-shake',
                    sound: 'error',
                    haptic: 'error'
                },
                success: {
                    highlight: 'success-glow',
                    animation: 'success-bounce',
                    sound: 'success',
                    haptic: 'success'
                }
            },
            system: {
                loading: {
                    highlight: 'pulse-glow',
                    animation: 'loading-spin',
                    sound: 'loading',
                    haptic: 'none'
                },
                processing: {
                    highlight: 'subtle-pulse',
                    animation: 'processing-dots',
                    sound: 'processing',
                    haptic: 'none'
                },
                complete: {
                    highlight: 'success-flash',
                    animation: 'complete-check',
                    sound: 'complete',
                    haptic: 'success'
                },
                error: {
                    highlight: 'error-flash',
                    animation: 'error-x',
                    sound: 'error',
                    haptic: 'error'
                }
            },
            navigation: {
                select: {
                    highlight: 'nav-highlight',
                    animation: 'nav-select',
                    sound: 'nav-select',
                    haptic: 'light'
                },
                change: {
                    highlight: 'nav-transition',
                    animation: 'nav-change',
                    sound: 'nav-change',
                    haptic: 'medium'
                }
            }
        };
        
        // Initialize
        this.initialize();
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    /**
     * Initialize the visual feedback system
     */
    async initialize() {
        try {
            // Load user preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'visual-feedback');
            if (preferences) {
                if (preferences.feedbackLevel !== undefined) {
                    this.state.feedbackLevel = preferences.feedbackLevel;
                }
                
                if (preferences.animationsEnabled !== undefined) {
                    this.state.animationsEnabled = preferences.animationsEnabled;
                }
                
                if (preferences.highlightEnabled !== undefined) {
                    this.state.highlightEnabled = preferences.highlightEnabled;
                }
                
                if (preferences.soundFeedbackEnabled !== undefined) {
                    this.state.soundFeedbackEnabled = preferences.soundFeedbackEnabled;
                }
                
                if (preferences.hapticFeedbackEnabled !== undefined) {
                    this.state.hapticFeedbackEnabled = preferences.hapticFeedbackEnabled;
                }
                
                if (preferences.colorFeedbackEnabled !== undefined) {
                    this.state.colorFeedbackEnabled = preferences.colorFeedbackEnabled;
                }
                
                if (preferences.motionFeedbackEnabled !== undefined) {
                    this.state.motionFeedbackEnabled = preferences.motionFeedbackEnabled;
                }
                
                if (preferences.focusIndicatorsEnabled !== undefined) {
                    this.state.focusIndicatorsEnabled = preferences.focusIndicatorsEnabled;
                }
                
                if (preferences.progressIndicatorsEnabled !== undefined) {
                    this.state.progressIndicatorsEnabled = preferences.progressIndicatorsEnabled;
                }
                
                if (preferences.statusIndicatorsEnabled !== undefined) {
                    this.state.statusIndicatorsEnabled = preferences.statusIndicatorsEnabled;
                }
            }
            
            // Apply accessibility settings
            if (this.accessibilitySystem) {
                const accessibilitySettings = await this.accessibilitySystem.getSettings();
                
                if (accessibilitySettings.reduceMotion) {
                    this.state.animationsEnabled = false;
                    this.state.motionFeedbackEnabled = false;
                }
                
                if (accessibilitySettings.highContrast) {
                    this.state.highlightEnabled = true;
                    this.state.colorFeedbackEnabled = true;
                    this.state.focusIndicatorsEnabled = true;
                }
            }
            
            // Initialize feedback elements
            this.initializeFeedbackElements();
            
            console.log('Visual Feedback System initialized');
            
            // Notify system that visual feedback system is ready
            this.eventSystem.publish('visual-feedback-system-ready', {
                ...this.state
            });
        } catch (error) {
            console.error('Error initializing visual feedback system:', error);
        }
    }
    
    /**
     * Initialize feedback elements
     */
    initializeFeedbackElements() {
        // Create feedback container if it doesn't exist
        let feedbackContainer = document.getElementById('visual-feedback-container');
        if (!feedbackContainer) {
            feedbackContainer = document.createElement('div');
            feedbackContainer.id = 'visual-feedback-container';
            feedbackContainer.className = 'visual-feedback-container';
            document.body.appendChild(feedbackContainer);
        }
        
        // Create progress container if it doesn't exist
        let progressContainer = document.getElementById('progress-indicator-container');
        if (!progressContainer) {
            progressContainer = document.createElement('div');
            progressContainer.id = 'progress-indicator-container';
            progressContainer.className = 'progress-indicator-container';
            document.body.appendChild(progressContainer);
        }
        
        // Create status container if it doesn't exist
        let statusContainer = document.getElementById('status-indicator-container');
        if (!statusContainer) {
            statusContainer = document.createElement('div');
            statusContainer.id = 'status-indicator-container';
            statusContainer.className = 'status-indicator-container';
            document.body.appendChild(statusContainer);
        }
    }
    
    /**
     * Provide element feedback
     * @param {HTMLElement} element - Target element
     * @param {string} elementType - Element type (button, input, etc.)
     * @param {string} feedbackType - Feedback type (hover, active, etc.)
     */
    provideElementFeedback(element, elementType, feedbackType) {
        if (!element) return;
        
        // Get feedback configuration
        const config = this.feedbackConfigs[elementType]?.[feedbackType];
        if (!config) {
            console.warn(`Unknown feedback configuration: ${elementType}.${feedbackType}`);
            return;
        }
        
        // Add to feedback queue
        this.queueFeedback(() => {
            // Apply highlight if enabled
            if (this.state.highlightEnabled && config.highlight && config.highlight !== 'none') {
                this.applyHighlight(element, config.highlight, elementType, feedbackType);
            }
            
            // Apply animation if enabled
            if (this.state.animationsEnabled && this.state.motionFeedbackEnabled && 
                config.animation && config.animation !== 'none') {
                this.applyAnimation(element, config.animation);
            }
            
            // Play sound if enabled
            if (this.state.soundFeedbackEnabled && config.sound && config.sound !== 'none') {
                this.eventSystem.publish('play-interaction-sound', { sound: config.sound });
            }
            
            // Apply haptic feedback if enabled
            if (this.state.hapticFeedbackEnabled && config.haptic && config.haptic !== 'none') {
                this.applyHapticFeedback(config.haptic);
            }
        });
    }
    
    /**
     * Apply highlight to element
     * @param {HTMLElement} element - Target element
     * @param {string} highlightType - Highlight type
     * @param {string} elementType - Element type
     * @param {string} feedbackType - Feedback type
     */
    applyHighlight(element, highlightType, elementType, feedbackType) {
        // Generate unique ID for this highlight
        const highlightId = `${elementType}-${feedbackType}-${Date.now()}`;
        
        // Remove existing highlight of same type
        const existingHighlight = this.state.activeHighlights.get(`${elementType}-${feedbackType}`);
        if (existingHighlight) {
            element.classList.remove(`highlight-${existingHighlight.type}`);
            this.state.activeHighlights.delete(`${elementType}-${feedbackType}`);
            
            // Clear timeout if exists
            if (existingHighlight.timeout) {
                clearTimeout(existingHighlight.timeout);
            }
        }
        
        // Apply highlight class
        element.classList.add(`highlight-${highlightType}`);
        
        // Store highlight
        const highlightInfo = {
            id: highlightId,
            element,
            type: highlightType,
            elementType,
            feedbackType,
            appliedAt: Date.now()
        };
        
        // Determine duration based on feedback type
        let duration = 0;
        
        switch (feedbackType) {
            case 'hover':
            case 'focus':
                // These should persist until removed
                duration = 0;
                break;
                
            case 'active':
            case 'press':
                duration = 300;
                break;
                
            case 'error':
            case 'invalid':
                duration = 3000;
                break;
                
            case 'success':
            case 'valid':
                duration = 2000;
                break;
                
            default:
                duration = 1000;
        }
        
        // Set timeout to remove highlight if duration is specified
        if (duration > 0) {
            highlightInfo.timeout = setTimeout(() => {
                this.removeHighlight(highlightId);
            }, duration);
        }
        
        // Store highlight info
        this.state.activeHighlights.set(`${elementType}-${feedbackType}`, highlightInfo);
    }
    
    /**
     * Remove highlight
     * @param {string} highlightId - Highlight ID
     */
    removeHighlight(highlightId) {
        // Find highlight by ID
        let targetKey = null;
        let highlightInfo = null;
        
        for (const [key, info] of this.state.activeHighlights.entries()) {
            if (info.id === highlightId) {
                targetKey = key;
                highlightInfo = info;
                break;
            }
        }
        
        if (targetKey && highlightInfo) {
            // Remove highlight class
            highlightInfo.element.classList.remove(`highlight-${highlightInfo.type}`);
            
            // Remove from active highlights
            this.state.activeHighlights.delete(targetKey);
            
            // Clear timeout if exists
            if (highlightInfo.timeout) {
                clearTimeout(highlightInfo.timeout);
            }
        }
    }
    
    /**
     * Apply animation to element
     * @param {HTMLElement} element - Target element
     * @param {string} animationType - Animation type
     */
    applyAnimation(element, animationType) {
        // Check if animations are enabled
        if (!this.state.animationsEnabled || !this.state.motionFeedbackEnabled) return;
        
        // Apply animation class
        element.classList.add(`animation-${animationType}`);
        
        // Remove animation class after animation completes
        setTimeout(() => {
            element.classList.remove(`animation-${animationType}`);
        }, 1000);
        
        // Notify animation system
        if (this.animationUIIntegration) {
            this.eventSystem.publish('ui-element-interaction', {
                element,
                elementType: element.tagName.toLowerCase(),
                animationType
            });
        }
    }
    
    /**
     * Apply haptic feedback
     * @param {string} intensity - Haptic intensity
     */
    applyHapticFeedback(intensity) {
        // Check if haptic feedback is supported and enabled
        if (!this.state.hapticFeedbackEnabled || !window.navigator.vibrate) return;
        
        // Determine vibration pattern based on intensity
        let pattern;
        
        switch (intensity) {
            case 'light':
                pattern = 10;
                break;
                
            case 'medium':
                pattern = 20;
                break;
                
            case 'heavy':
                pattern = 30;
                break;
                
            case 'success':
                pattern = [10, 30, 10];
                break;
                
            case 'error':
                pattern = [20, 40, 20];
                break;
                
            case 'warning':
                pattern = [15, 30, 15];
                break;
                
            default:
                pattern = 10;
        }
        
        // Apply vibration
        try {
            window.navigator.vibrate(pattern);
        } catch (error) {
            console.warn('Haptic feedback failed:', error);
        }
    }
    
    /**
     * Show notification with visual feedback
     * @param {string} message - Notification message
     * @param {string} type - Notification type (info, warning, error, success)
     * @param {Object} options - Additional options
     */
    showNotification(message, type = 'info', options = {}) {
        // Use enhanced interface system if available
        if (this.enhancedInterfaceSystem) {
            this.enhancedInterfaceSystem.showNotification(message, type, options);
        } else {
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.textContent = message;
            
            // Add to feedback container
            const container = document.getElementById('visual-feedback-container');
            if (container) {
                container.appendChild(notification);
                
                // Provide feedback
                this.provideElementFeedback(notification, 'notification', type);
                
                // Remove after duration
                setTimeout(() => {
                    notification.classList.add('notification-hide');
                    
                    // Remove from DOM after animation
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.parentNode.removeChild(notification);
                        }
                    }, 300);
                }, options.duration || 3000);
            }
        }
    }
    
    /**
     * Show progress indicator
     * @param {string} id - Progress indicator ID
     * @param {string} message - Progress message
     * @param {number} progress - Progress value (0-100)
     * @param {Object} options - Additional options
     * @returns {string} Progress indicator ID
     */
    showProgressIndicator(id, message, progress = 0, options = {}) {
        if (!this.state.progressIndicatorsEnabled) return id;
        
        // Generate ID if not provided
        const progressId = id || `progress-${Date.now()}`;
        
        // Get or create progress element
        let progressElement = document.getElementById(`progress-${progressId}`);
        const isNew = !progressElement;
        
        if (!progressElement) {
            progressElement = document.createElement('div');
            progressElement.id = `progress-${progressId}`;
            progressElement.className = 'progress-indicator';
            
            // Create message element
            const messageElement = document.createElement('div');
            messageElement.className = 'progress-message';
            messageElement.textContent = message;
            progressElement.appendChild(messageElement);
            
            // Create progress bar container
            const progressBarContainer = document.createElement('div');
            progressBarContainer.className = 'progress-bar-container';
            
            // Create progress bar
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            progressBar.style.width = `${progress}%`;
            progressBarContainer.appendChild(progressBar);
            
            // Create progress text
            const progressText = document.createElement('div');
            progressText.className = 'progress-text';
            progressText.textContent = `${Math.round(progress)}%`;
            progressBarContainer.appendChild(progressText);
            
            progressElement.appendChild(progressBarContainer);
            
            // Add to container
            const container = document.getElementById('progress-indicator-container');
            if (container) {
                container.appendChild(progressElement);
            }
        } else {
            // Update existing progress indicator
            const messageElement = progressElement.querySelector('.progress-message');
            if (messageElement && message) {
                messageElement.textContent = message;
            }
            
            const progressBar = progressElement.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
            
            const progressText = progressElement.querySelector('.progress-text');
            if (progressText) {
                progressText.textContent = `${Math.round(progress)}%`;
            }
        }
        
        // Store progress indicator
        this.state.activeProgressBars.set(progressId, {
            id: progressId,
            element: progressElement,
            progress,
            message,
            options,
            startTime: isNew ? Date.now() : this.state.activeProgressBars.get(progressId)?.startTime || Date.now()
        });
        
        // Apply visual feedback for new indicators
        if (isNew) {
            this.provideElementFeedback(progressElement, 'system', 'loading');
        }
        
        // Auto-complete if progress is 100%
        if (progress >= 100) {
            setTimeout(() => {
                this.completeProgressIndicator(progressId, options.completeMessage);
            }, 500);
        }
        
        return progressId;
    }
    
    /**
     * Update progress indicator
     * @param {string} id - Progress indicator ID
     * @param {number} progress - Progress value (0-100)
     * @param {string} message - Progress message
     */
    updateProgressIndicator(id, progress, message) {
        if (!id) return;
        
        // Show/update progress indicator
        this.showProgressIndicator(id, message, progress);
    }
    
    /**
     * Complete progress indicator
     * @param {string} id - Progress indicator ID
     * @param {string} message - Completion message
     */
    completeProgressIndicator(id, message) {
        if (!id) return;
        
        // Get progress indicator
        const progressInfo = this.state.activeProgressBars.get(id);
        if (!progressInfo) return;
        
        // Update to 100% if not already
        this.updateProgressIndicator(id, 100, message || progressInfo.message);
        
        // Get element
        const progressElement = document.getElementById(`progress-${id}`);
        if (!progressElement) return;
        
        // Add complete class
        progressElement.classList.add('progress-complete');
        
        // Provide feedback
        this.provideElementFeedback(progressElement, 'system', 'complete');
        
        // Remove after delay
        setTimeout(() => {
            progressElement.classList.add('progress-hide');
            
            // Remove from DOM after animation
            setTimeout(() => {
                if (progressElement.parentNode) {
                    progressElement.parentNode.removeChild(progressElement);
                }
                
                // Remove from active progress bars
                this.state.activeProgressBars.delete(id);
            }, 500);
        }, 2000);
    }
    
    /**
     * Show error for progress indicator
     * @param {string} id - Progress indicator ID
     * @param {string} errorMessage - Error message
     */
    errorProgressIndicator(id, errorMessage) {
        if (!id) return;
        
        // Get progress indicator
        const progressInfo = this.state.activeProgressBars.get(id);
        if (!progressInfo) return;
        
        // Get element
        const progressElement = document.getElementById(`progress-${id}`);
        if (!progressElement) return;
        
        // Update message
        const messageElement = progressElement.querySelector('.progress-message');
        if (messageElement && errorMessage) {
            messageElement.textContent = errorMessage;
        }
        
        // Add error class
        progressElement.classList.add('progress-error');
        
        // Provide feedback
        this.provideElementFeedback(progressElement, 'system', 'error');
        
        // Remove after delay
        setTimeout(() => {
            progressElement.classList.add('progress-hide');
            
            // Remove from DOM after animation
            setTimeout(() => {
                if (progressElement.parentNode) {
                    progressElement.parentNode.removeChild(progressElement);
                }
                
                // Remove from active progress bars
                this.state.activeProgressBars.delete(id);
            }, 500);
        }, 3000);
    }
    
    /**
     * Show status indicator
     * @param {string} id - Status indicator ID
     * @param {string} message - Status message
     * @param {string} type - Status type (info, warning, error, success)
     * @param {Object} options - Additional options
     * @returns {string} Status indicator ID
     */
    showStatusIndicator(id, message, type = 'info', options = {}) {
        if (!this.state.statusIndicatorsEnabled) return id;
        
        // Check if status type is enabled
        const typeEnabled = this.state[`${type}IndicatorsEnabled`];
        if (typeEnabled === false) return id;
        
        // Generate ID if not provided
        const statusId = id || `status-${Date.now()}`;
        
        // Get or create status element
        let statusElement = document.getElementById(`status-${statusId}`);
        const isNew = !statusElement;
        
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.id = `status-${statusId}`;
            statusElement.className = `status-indicator status-${type}`;
            
            // Create icon
            const icon = document.createElement('span');
            icon.className = 'status-icon';
            
            // Set icon based on type
            switch (type) {
                case 'info':
                    icon.innerHTML = '<span class="material-icons">info</span>';
                    break;
                    
                case 'warning':
                    icon.innerHTML = '<span class="material-icons">warning</span>';
                    break;
                    
                case 'error':
                    icon.innerHTML = '<span class="material-icons">error</span>';
                    break;
                    
                case 'success':
                    icon.innerHTML = '<span class="material-icons">check_circle</span>';
                    break;
                    
                default:
                    icon.innerHTML = '<span class="material-icons">info</span>';
            }
            
            statusElement.appendChild(icon);
            
            // Create message element
            const messageElement = document.createElement('div');
            messageElement.className = 'status-message';
            messageElement.textContent = message;
            statusElement.appendChild(messageElement);
            
            // Create close button if not persistent
            if (!options.persistent) {
                const closeButton = document.createElement('button');
                closeButton.className = 'status-close';
                closeButton.innerHTML = '<span class="material-icons">close</span>';
                closeButton.addEventListener('click', () => {
                    this.hideStatusIndicator(statusId);
                });
                statusElement.appendChild(closeButton);
            }
            
            // Add to container
            const container = document.getElementById('status-indicator-container');
            if (container) {
                container.appendChild(statusElement);
            }
        } else {
            // Update existing status indicator
            statusElement.className = `status-indicator status-${type}`;
            
            const messageElement = statusElement.querySelector('.status-message');
            if (messageElement && message) {
                messageElement.textContent = message;
            }
        }
        
        // Store status indicator
        this.state.activeStatusIndicators.set(statusId, {
            id: statusId,
            element: statusElement,
            type,
            message,
            options,
            startTime: isNew ? Date.now() : this.state.activeStatusIndicators.get(statusId)?.startTime || Date.now()
        });
        
        // Apply visual feedback for new indicators
        if (isNew) {
            this.provideElementFeedback(statusElement, 'notification', type);
        }
        
        // Auto-hide if not persistent
        if (!options.persistent && options.duration) {
            setTimeout(() => {
                this.hideStatusIndicator(statusId);
            }, options.duration);
        }
        
        return statusId;
    }
    
    /**
     * Hide status indicator
     * @param {string} id - Status indicator ID
     */
    hideStatusIndicator(id) {
        if (!id) return;
        
        // Get status indicator
        const statusInfo = this.state.activeStatusIndicators.get(id);
        if (!statusInfo) return;
        
        // Get element
        const statusElement = document.getElementById(`status-${id}`);
        if (!statusElement) return;
        
        // Add hide class
        statusElement.classList.add('status-hide');
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (statusElement.parentNode) {
                statusElement.parentNode.removeChild(statusElement);
            }
            
            // Remove from active status indicators
            this.state.activeStatusIndicators.delete(id);
        }, 300);
    }
    
    /**
     * Show focus indicator
     * @param {HTMLElement} element - Target element
     */
    showFocusIndicator(element) {
        if (!element || !this.state.focusIndicatorsEnabled) return;
        
        // Add focus indicator class
        element.classList.add('focus-indicator');
        
        // Provide feedback
        this.provideElementFeedback(element, 'input', 'focus');
    }
    
    /**
     * Hide focus indicator
     * @param {HTMLElement} element - Target element
     */
    hideFocusIndicator(element) {
        if (!element) return;
        
        // Remove focus indicator class
        element.classList.remove('focus-indicator');
    }
    
    /**
     * Show loading indicator
     * @param {string} message - Loading message
     * @param {Object} options - Additional options
     * @returns {string} Loading indicator ID
     */
    showLoadingIndicator(message, options = {}) {
        // Create progress indicator with indeterminate state
        const id = `loading-${Date.now()}`;
        
        // Create loading element
        const loadingElement = document.createElement('div');
        loadingElement.id = `loading-${id}`;
        loadingElement.className = 'loading-indicator';
        
        // Create spinner
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        loadingElement.appendChild(spinner);
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = 'loading-message';
        messageElement.textContent = message;
        loadingElement.appendChild(messageElement);
        
        // Add to container
        const container = document.getElementById('visual-feedback-container');
        if (container) {
            container.appendChild(loadingElement);
        }
        
        // Provide feedback
        this.provideElementFeedback(loadingElement, 'system', 'loading');
        
        // Store indicator
        this.state.activeIndicators.set(id, {
            id,
            element: loadingElement,
            type: 'loading',
            message,
            options,
            startTime: Date.now()
        });
        
        return id;
    }
    
    /**
     * Hide loading indicator
     * @param {string} id - Loading indicator ID
     */
    hideLoadingIndicator(id) {
        if (!id) return;
        
        // Get indicator
        const indicatorInfo = this.state.activeIndicators.get(id);
        if (!indicatorInfo) return;
        
        // Get element
        const loadingElement = document.getElementById(`loading-${id}`);
        if (!loadingElement) return;
        
        // Add hide class
        loadingElement.classList.add('loading-hide');
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (loadingElement.parentNode) {
                loadingElement.parentNode.removeChild(loadingElement);
            }
            
            // Remove from active indicators
            this.state.activeIndicators.delete(id);
        }, 300);
    }
    
    /**
     * Highlight element
     * @param {HTMLElement} element - Target element
     * @param {string} type - Highlight type (info, warning, error, success)
     * @param {Object} options - Additional options
     */
    highlightElement(element, type = 'info', options = {}) {
        if (!element || !this.state.highlightEnabled) return;
        
        // Add highlight class
        element.classList.add(`highlight-${type}`);
        
        // Provide feedback
        this.provideElementFeedback(element, 'notification', type);
        
        // Remove highlight after duration
        if (options.duration) {
            setTimeout(() => {
                element.classList.remove(`highlight-${type}`);
            }, options.duration);
        }
    }
    
    /**
     * Queue feedback
     * @param {Function} feedbackFn - Feedback function
     */
    queueFeedback(feedbackFn) {
        // Add to queue
        this.state.feedbackQueue.push(feedbackFn);
        
        // Process queue if not already processing
        if (!this.state.processingFeedback) {
            this.processFeedbackQueue();
        }
    }
    
    /**
     * Process feedback queue
     */
    processFeedbackQueue() {
        if (this.state.feedbackQueue.length === 0) {
            this.state.processingFeedback = false;
            return;
        }
        
        this.state.processingFeedback = true;
        
        // Get next feedback
        const feedbackFn = this.state.feedbackQueue.shift();
        
        // Execute feedback
        feedbackFn();
        
        // Update last feedback time
        this.state.lastFeedbackTime = Date.now();
        
        // Process next feedback after delay
        setTimeout(() => {
            this.processFeedbackQueue();
        }, 50); // Small delay to prevent feedback overload
    }
    
    /**
     * Save preferences
     */
    async savePreferences() {
        try {
            await this.storageManager.setIndexedDB('preferences', 'visual-feedback', {
                feedbackLevel: this.state.feedbackLevel,
                animationsEnabled: this.state.animationsEnabled,
                highlightEnabled: this.state.highlightEnabled,
                soundFeedbackEnabled: this.state.soundFeedbackEnabled,
                hapticFeedbackEnabled: this.state.hapticFeedbackEnabled,
                colorFeedbackEnabled: this.state.colorFeedbackEnabled,
                motionFeedbackEnabled: this.state.motionFeedbackEnabled,
                focusIndicatorsEnabled: this.state.focusIndicatorsEnabled,
                progressIndicatorsEnabled: this.state.progressIndicatorsEnabled,
                statusIndicatorsEnabled: this.state.statusIndicatorsEnabled
            });
        } catch (error) {
            console.error('Error saving visual feedback preferences:', error);
        }
    }
    
    /**
     * Set feedback level
     * @param {string} level - Feedback level (low, medium, high)
     */
    setFeedbackLevel(level) {
        if (!['low', 'medium', 'high'].includes(level)) {
            console.warn(`Invalid feedback level: ${level}`);
            return;
        }
        
        this.state.feedbackLevel = level;
        
        // Adjust settings based on level
        switch (level) {
            case 'low':
                this.state.animationsEnabled = false;
                this.state.highlightEnabled = true;
                this.state.soundFeedbackEnabled = false;
                this.state.hapticFeedbackEnabled = false;
                this.state.colorFeedbackEnabled = true;
                this.state.motionFeedbackEnabled = false;
                this.state.focusIndicatorsEnabled = true;
                this.state.progressIndicatorsEnabled = true;
                this.state.statusIndicatorsEnabled = true;
                break;
                
            case 'medium':
                this.state.animationsEnabled = true;
                this.state.highlightEnabled = true;
                this.state.soundFeedbackEnabled = true;
                this.state.hapticFeedbackEnabled = false;
                this.state.colorFeedbackEnabled = true;
                this.state.motionFeedbackEnabled = true;
                this.state.focusIndicatorsEnabled = true;
                this.state.progressIndicatorsEnabled = true;
                this.state.statusIndicatorsEnabled = true;
                break;
                
            case 'high':
                this.state.animationsEnabled = true;
                this.state.highlightEnabled = true;
                this.state.soundFeedbackEnabled = true;
                this.state.hapticFeedbackEnabled = true;
                this.state.colorFeedbackEnabled = true;
                this.state.motionFeedbackEnabled = true;
                this.state.focusIndicatorsEnabled = true;
                this.state.progressIndicatorsEnabled = true;
                this.state.statusIndicatorsEnabled = true;
                break;
        }
        
        // Save preferences
        this.savePreferences();
        
        // Notify about feedback level change
        this.eventSystem.publish('feedback-level-changed', {
            level,
            settings: {
                animationsEnabled: this.state.animationsEnabled,
                highlightEnabled: this.state.highlightEnabled,
                soundFeedbackEnabled: this.state.soundFeedbackEnabled,
                hapticFeedbackEnabled: this.state.hapticFeedbackEnabled,
                colorFeedbackEnabled: this.state.colorFeedbackEnabled,
                motionFeedbackEnabled: this.state.motionFeedbackEnabled,
                focusIndicatorsEnabled: this.state.focusIndicatorsEnabled,
                progressIndicatorsEnabled: this.state.progressIndicatorsEnabled,
                statusIndicatorsEnabled: this.state.statusIndicatorsEnabled
            }
        });
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for feedback level changes
        this.eventSystem.subscribe('set-feedback-level', (data) => {
            if (data.level) {
                this.setFeedbackLevel(data.level);
            }
        });
        
        // Listen for animation toggle
        this.eventSystem.subscribe('toggle-animations', (data) => {
            this.state.animationsEnabled = data.enabled;
            this.savePreferences();
        });
        
        // Listen for sound feedback toggle
        this.eventSystem.subscribe('toggle-sound-feedback', (data) => {
            this.state.soundFeedbackEnabled = data.enabled;
            this.savePreferences();
        });
        
        // Listen for haptic feedback toggle
        this.eventSystem.subscribe('toggle-haptic-feedback', (data) => {
            this.state.hapticFeedbackEnabled = data.enabled;
            this.savePreferences();
        });
        
        // Listen for notification requests
        this.eventSystem.subscribe('show-notification', (data) => {
            this.showNotification(data.message, data.type, data.options);
        });
        
        // Listen for progress indicator requests
        this.eventSystem.subscribe('show-progress', (data) => {
            this.showProgressIndicator(data.id, data.message, data.progress, data.options);
        });
        
        this.eventSystem.subscribe('update-progress', (data) => {
            this.updateProgressIndicator(data.id, data.progress, data.message);
        });
        
        this.eventSystem.subscribe('complete-progress', (data) => {
            this.completeProgressIndicator(data.id, data.message);
        });
        
        this.eventSystem.subscribe('error-progress', (data) => {
            this.errorProgressIndicator(data.id, data.message);
        });
        
        // Listen for status indicator requests
        this.eventSystem.subscribe('show-status', (data) => {
            this.showStatusIndicator(data.id, data.message, data.type, data.options);
        });
        
        this.eventSystem.subscribe('hide-status', (data) => {
            this.hideStatusIndicator(data.id);
        });
        
        // Listen for loading indicator requests
        this.eventSystem.subscribe('show-loading', (data) => {
            this.showLoadingIndicator(data.message, data.options);
        });
        
        this.eventSystem.subscribe('hide-loading', (data) => {
            this.hideLoadingIndicator(data.id);
        });
        
        // Listen for element highlight requests
        this.eventSystem.subscribe('highlight-element', (data) => {
            this.highlightElement(data.element, data.type, data.options);
        });
        
        // Set up DOM event listeners
        document.addEventListener('DOMContentLoaded', () => {
            // Button hover and active states
            document.body.addEventListener('mouseover', (event) => {
                const button = event.target.closest('button:not([disabled])');
                if (button) {
                    this.provideElementFeedback(button, 'button', 'hover');
                }
            });
            
            document.body.addEventListener('mousedown', (event) => {
                const button = event.target.closest('button:not([disabled])');
                if (button) {
                    this.provideElementFeedback(button, 'button', 'active');
                }
            });
            
            // Input focus and validation
            document.body.addEventListener('focus', (event) => {
                const input = event.target.closest('input, textarea, select');
                if (input) {
                    this.showFocusIndicator(input);
                    this.provideElementFeedback(input, 'input', 'focus');
                }
            }, true);
            
            document.body.addEventListener('blur', (event) => {
                const input = event.target.closest('input, textarea, select');
                if (input) {
                    this.hideFocusIndicator(input);
                    
                    // Check validation if applicable
                    if (input.checkValidity && !input.checkValidity()) {
                        this.provideElementFeedback(input, 'input', 'invalid');
                    } else if (input.value) {
                        this.provideElementFeedback(input, 'input', 'valid');
                    }
                }
            }, true);
            
            // Form submission
            document.body.addEventListener('submit', (event) => {
                const form = event.target;
                
                // Check if form is valid
                if (form.checkValidity()) {
                    this.showStatusIndicator(null, 'Form submitted successfully', 'success', { duration: 3000 });
                } else {
                    this.showStatusIndicator(null, 'Please correct the errors in the form', 'error', { duration: 5000 });
                    
                    // Highlight invalid fields
                    const invalidInputs = form.querySelectorAll(':invalid');
                    invalidInputs.forEach(input => {
                        this.provideElementFeedback(input, 'input', 'invalid');
                    });
                }
            });
            
            // Navigation
            document.body.addEventListener('click', (event) => {
                const navItem = event.target.closest('.nav-item');
                if (navItem) {
                    this.provideElementFeedback(navItem, 'navigation', 'select');
                }
            });
        });
    }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VisualFeedbackSystem;
} else {
    window.VisualFeedbackSystem = VisualFeedbackSystem;
}
