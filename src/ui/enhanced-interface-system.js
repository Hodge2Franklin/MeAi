/**
 * Enhanced Interface System
 * 
 * This system provides an improved user interface with advanced controls,
 * better visual feedback, and enhanced user interaction capabilities.
 */

class EnhancedInterfaceSystem {
    constructor() {
        // Initialize dependencies
        this.storageManager = window.storageManager;
        this.eventSystem = window.eventSystem;
        this.themeSystem = window.themeSystem;
        this.accessibilitySystem = window.accessibilitySystem;
        this.interfaceAnimationSystem = window.interfaceAnimationSystem;
        this.pixelVisualization3D = window.pixelVisualization3D;
        this.advancedAnimationSystem = window.advancedAnimationSystem;
        
        // Interface state
        this.state = {
            currentView: 'conversation', // conversation, settings, memory, visualization
            isMobile: window.innerWidth < 768,
            isMenuOpen: false,
            isFullscreen: false,
            activePanel: null,
            notifications: [],
            tooltipsEnabled: true,
            gesturesEnabled: true,
            darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
            lastInteraction: Date.now()
        };
        
        // UI Components registry
        this.components = {
            mainContainer: null,
            visualizationArea: null,
            conversationArea: null,
            controlsPanel: null,
            notificationArea: null,
            contextMenu: null,
            tooltipContainer: null,
            quickActions: null
        };
        
        // Initialize
        this.initialize();
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    /**
     * Initialize the enhanced interface system
     */
    async initialize() {
        try {
            // Load user preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'user-interface');
            if (preferences) {
                if (preferences.tooltipsEnabled !== undefined) {
                    this.state.tooltipsEnabled = preferences.tooltipsEnabled;
                }
                
                if (preferences.gesturesEnabled !== undefined) {
                    this.state.gesturesEnabled = preferences.gesturesEnabled;
                }
                
                if (preferences.darkMode !== undefined) {
                    this.state.darkMode = preferences.darkMode;
                }
            }
            
            // Create enhanced UI components
            this.createEnhancedUIComponents();
            
            // Apply interface settings
            this.applyInterfaceSettings();
            
            // Initialize responsive behavior
            this.initializeResponsiveBehavior();
            
            console.log('Enhanced Interface System initialized');
            
            // Notify system that interface is ready
            this.eventSystem.publish('enhanced-interface-ready', {
                ...this.state
            });
        } catch (error) {
            console.error('Error initializing enhanced interface system:', error);
        }
    }
    
    /**
     * Create enhanced UI components
     */
    createEnhancedUIComponents() {
        // Create notification area
        this.createNotificationArea();
        
        // Create context menu
        this.createContextMenu();
        
        // Create tooltip container
        this.createTooltipContainer();
        
        // Create quick actions panel
        this.createQuickActionsPanel();
        
        // Enhance existing components
        this.enhanceExistingComponents();
    }
    
    /**
     * Create notification area
     */
    createNotificationArea() {
        const notificationArea = document.createElement('div');
        notificationArea.id = 'notification-area';
        notificationArea.className = 'notification-area';
        document.body.appendChild(notificationArea);
        
        this.components.notificationArea = notificationArea;
    }
    
    /**
     * Create context menu
     */
    createContextMenu() {
        const contextMenu = document.createElement('div');
        contextMenu.id = 'context-menu';
        contextMenu.className = 'context-menu hidden';
        document.body.appendChild(contextMenu);
        
        this.components.contextMenu = contextMenu;
    }
    
    /**
     * Create tooltip container
     */
    createTooltipContainer() {
        const tooltipContainer = document.createElement('div');
        tooltipContainer.id = 'tooltip-container';
        tooltipContainer.className = 'tooltip-container';
        document.body.appendChild(tooltipContainer);
        
        this.components.tooltipContainer = tooltipContainer;
    }
    
    /**
     * Create quick actions panel
     */
    createQuickActionsPanel() {
        const quickActions = document.createElement('div');
        quickActions.id = 'quick-actions';
        quickActions.className = 'quick-actions';
        
        // Add quick action buttons
        const actions = [
            { id: 'toggle-theme', icon: 'brightness_medium', tooltip: 'Toggle Theme' },
            { id: 'toggle-sound', icon: 'volume_up', tooltip: 'Toggle Sound' },
            { id: 'clear-chat', icon: 'delete_sweep', tooltip: 'Clear Chat' },
            { id: 'toggle-fullscreen', icon: 'fullscreen', tooltip: 'Toggle Fullscreen' }
        ];
        
        actions.forEach(action => {
            const button = document.createElement('button');
            button.id = action.id;
            button.className = 'quick-action-button';
            button.setAttribute('aria-label', action.tooltip);
            button.setAttribute('data-tooltip', action.tooltip);
            
            // Use Material Icons
            button.innerHTML = `<span class="material-icons">${action.icon}</span>`;
            
            quickActions.appendChild(button);
        });
        
        document.body.appendChild(quickActions);
        this.components.quickActions = quickActions;
    }
    
    /**
     * Enhance existing components
     */
    enhanceExistingComponents() {
        // Get main container
        const mainContainer = document.querySelector('.container');
        if (mainContainer) {
            this.components.mainContainer = mainContainer;
            mainContainer.classList.add('enhanced');
        }
        
        // Get visualization area
        const visualizationArea = document.querySelector('.visualization-area');
        if (visualizationArea) {
            this.components.visualizationArea = visualizationArea;
            visualizationArea.classList.add('enhanced');
            
            // Add 3D toggle button
            const toggle3DButton = document.createElement('button');
            toggle3DButton.id = 'toggle-3d';
            toggle3DButton.className = 'toggle-3d-button';
            toggle3DButton.setAttribute('aria-label', 'Toggle 3D View');
            toggle3DButton.innerHTML = '<span class="material-icons">view_in_ar</span>';
            visualizationArea.appendChild(toggle3DButton);
            
            // Add visualization controls
            const visualizationControls = document.createElement('div');
            visualizationControls.className = 'visualization-controls';
            
            // Add emotion selector
            const emotionSelector = document.createElement('div');
            emotionSelector.className = 'emotion-selector';
            
            const emotions = [
                { id: 'joy', label: 'Joy', icon: 'sentiment_very_satisfied' },
                { id: 'reflective', label: 'Reflective', icon: 'psychology' },
                { id: 'curious', label: 'Curious', icon: 'explore' },
                { id: 'excited', label: 'Excited', icon: 'celebration' },
                { id: 'empathetic', label: 'Empathetic', icon: 'volunteer_activism' },
                { id: 'calm', label: 'Calm', icon: 'spa' },
                { id: 'neutral', label: 'Neutral', icon: 'sentiment_neutral' }
            ];
            
            emotions.forEach(emotion => {
                const button = document.createElement('button');
                button.className = 'emotion-button';
                button.setAttribute('data-emotion', emotion.id);
                button.setAttribute('aria-label', emotion.label);
                button.setAttribute('data-tooltip', emotion.label);
                button.innerHTML = `<span class="material-icons">${emotion.icon}</span>`;
                emotionSelector.appendChild(button);
            });
            
            visualizationControls.appendChild(emotionSelector);
            visualizationArea.appendChild(visualizationControls);
        }
        
        // Get conversation area
        const conversationArea = document.querySelector('.conversation-area');
        if (conversationArea) {
            this.components.conversationArea = conversationArea;
            conversationArea.classList.add('enhanced');
            
            // Enhance conversation history
            const conversationHistory = document.querySelector('.conversation-history');
            if (conversationHistory) {
                // Add conversation toolbar
                const conversationToolbar = document.createElement('div');
                conversationToolbar.className = 'conversation-toolbar';
                
                // Add search input
                const searchContainer = document.createElement('div');
                searchContainer.className = 'search-container';
                
                const searchInput = document.createElement('input');
                searchInput.type = 'text';
                searchInput.id = 'conversation-search';
                searchInput.placeholder = 'Search conversation...';
                searchInput.setAttribute('aria-label', 'Search conversation');
                
                const searchButton = document.createElement('button');
                searchButton.className = 'search-button';
                searchButton.setAttribute('aria-label', 'Search');
                searchButton.innerHTML = '<span class="material-icons">search</span>';
                
                searchContainer.appendChild(searchInput);
                searchContainer.appendChild(searchButton);
                conversationToolbar.appendChild(searchContainer);
                
                // Add toolbar buttons
                const toolbarButtons = document.createElement('div');
                toolbarButtons.className = 'toolbar-buttons';
                
                const exportButton = document.createElement('button');
                exportButton.id = 'export-conversation';
                exportButton.className = 'toolbar-button';
                exportButton.setAttribute('aria-label', 'Export Conversation');
                exportButton.setAttribute('data-tooltip', 'Export Conversation');
                exportButton.innerHTML = '<span class="material-icons">file_download</span>';
                
                const clearButton = document.createElement('button');
                clearButton.id = 'clear-conversation';
                clearButton.className = 'toolbar-button';
                clearButton.setAttribute('aria-label', 'Clear Conversation');
                clearButton.setAttribute('data-tooltip', 'Clear Conversation');
                clearButton.innerHTML = '<span class="material-icons">delete</span>';
                
                toolbarButtons.appendChild(exportButton);
                toolbarButtons.appendChild(clearButton);
                conversationToolbar.appendChild(toolbarButtons);
                
                // Insert toolbar before conversation history
                conversationHistory.parentNode.insertBefore(conversationToolbar, conversationHistory);
            }
            
            // Enhance input area
            const inputArea = document.querySelector('.input-area');
            if (inputArea) {
                inputArea.classList.add('enhanced');
                
                // Add attachment button
                const attachmentButton = document.createElement('button');
                attachmentButton.id = 'attachment-button';
                attachmentButton.className = 'input-button';
                attachmentButton.setAttribute('aria-label', 'Add attachment');
                attachmentButton.innerHTML = '<span class="material-icons">attach_file</span>';
                
                // Add emoji button
                const emojiButton = document.createElement('button');
                emojiButton.id = 'emoji-button';
                emojiButton.className = 'input-button';
                emojiButton.setAttribute('aria-label', 'Add emoji');
                emojiButton.innerHTML = '<span class="material-icons">emoji_emotions</span>';
                
                // Insert buttons before user input
                const userInput = document.getElementById('user-input');
                if (userInput) {
                    inputArea.insertBefore(attachmentButton, userInput);
                    
                    // Replace input with textarea for multi-line support
                    const textarea = document.createElement('textarea');
                    textarea.id = 'user-input';
                    textarea.placeholder = 'Type your message...';
                    textarea.setAttribute('aria-label', 'Type your message');
                    textarea.rows = 1;
                    textarea.className = 'enhanced-input';
                    
                    userInput.parentNode.replaceChild(textarea, userInput);
                    
                    // Add emoji button after textarea
                    inputArea.insertBefore(emojiButton, textarea.nextSibling);
                }
            }
        }
        
        // Get controls panel
        const controlsPanel = document.querySelector('.controls-panel');
        if (controlsPanel) {
            this.components.controlsPanel = controlsPanel;
            controlsPanel.classList.add('enhanced');
            
            // Add panel header with close button
            const panelSections = controlsPanel.querySelectorAll('.panel-section');
            panelSections.forEach(section => {
                const header = section.querySelector('h3');
                if (header) {
                    const headerContainer = document.createElement('div');
                    headerContainer.className = 'panel-header';
                    
                    // Move header to container
                    header.parentNode.insertBefore(headerContainer, header);
                    headerContainer.appendChild(header);
                    
                    // Add toggle button
                    const toggleButton = document.createElement('button');
                    toggleButton.className = 'panel-toggle';
                    toggleButton.setAttribute('aria-label', 'Toggle section');
                    toggleButton.innerHTML = '<span class="material-icons">expand_more</span>';
                    headerContainer.appendChild(toggleButton);
                }
            });
            
            // Add new user profile section
            const userProfileSection = document.createElement('div');
            userProfileSection.className = 'panel-section';
            
            const userProfileHeader = document.createElement('div');
            userProfileHeader.className = 'panel-header';
            
            const userProfileTitle = document.createElement('h3');
            userProfileTitle.textContent = 'User Profile';
            
            const userProfileToggle = document.createElement('button');
            userProfileToggle.className = 'panel-toggle';
            userProfileToggle.setAttribute('aria-label', 'Toggle section');
            userProfileToggle.innerHTML = '<span class="material-icons">expand_more</span>';
            
            userProfileHeader.appendChild(userProfileTitle);
            userProfileHeader.appendChild(userProfileToggle);
            userProfileSection.appendChild(userProfileHeader);
            
            const userProfileContent = document.createElement('div');
            userProfileContent.className = 'user-profile-content';
            
            // Add profile selector
            const profileSelector = document.createElement('div');
            profileSelector.className = 'profile-selector';
            
            const profileLabel = document.createElement('label');
            profileLabel.setAttribute('for', 'profile-select');
            profileLabel.textContent = 'Active Profile:';
            
            const profileSelect = document.createElement('select');
            profileSelect.id = 'profile-select';
            
            const defaultOption = document.createElement('option');
            defaultOption.value = 'default';
            defaultOption.textContent = 'Default Profile';
            
            const newProfileOption = document.createElement('option');
            newProfileOption.value = 'new';
            newProfileOption.textContent = '+ Create New Profile';
            
            profileSelect.appendChild(defaultOption);
            profileSelect.appendChild(newProfileOption);
            
            profileSelector.appendChild(profileLabel);
            profileSelector.appendChild(profileSelect);
            
            // Add profile actions
            const profileActions = document.createElement('div');
            profileActions.className = 'profile-actions';
            
            const editProfileButton = document.createElement('button');
            editProfileButton.id = 'edit-profile';
            editProfileButton.textContent = 'Edit Profile';
            
            const exportProfileButton = document.createElement('button');
            exportProfileButton.id = 'export-profile';
            exportProfileButton.textContent = 'Export Profile';
            
            profileActions.appendChild(editProfileButton);
            profileActions.appendChild(exportProfileButton);
            
            userProfileContent.appendChild(profileSelector);
            userProfileContent.appendChild(profileActions);
            userProfileSection.appendChild(userProfileContent);
            
            // Add user profile section to controls panel
            controlsPanel.appendChild(userProfileSection);
        }
    }
    
    /**
     * Apply interface settings
     */
    applyInterfaceSettings() {
        // Apply dark mode
        if (this.state.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        // Apply tooltips setting
        if (this.state.tooltipsEnabled) {
            document.body.classList.add('tooltips-enabled');
        } else {
            document.body.classList.remove('tooltips-enabled');
        }
        
        // Apply gestures setting
        if (this.state.gesturesEnabled) {
            document.body.classList.add('gestures-enabled');
        } else {
            document.body.classList.remove('gestures-enabled');
        }
    }
    
    /**
     * Initialize responsive behavior
     */
    initializeResponsiveBehavior() {
        // Set initial state
        this.updateResponsiveState();
        
        // Listen for window resize
        window.addEventListener('resize', () => {
            this.updateResponsiveState();
        });
    }
    
    /**
     * Update responsive state
     */
    updateResponsiveState() {
        const wasMobile = this.state.isMobile;
        this.state.isMobile = window.innerWidth < 768;
        
        // If state changed, update UI
        if (wasMobile !== this.state.isMobile) {
            if (this.state.isMobile) {
                document.body.classList.add('mobile-view');
                this.setupMobileView();
            } else {
                document.body.classList.remove('mobile-view');
                this.setupDesktopView();
            }
            
            // Notify about responsive state change
            this.eventSystem.publish('responsive-state-changed', {
                isMobile: this.state.isMobile
            });
        }
    }
    
    /**
     * Setup mobile view
     */
    setupMobileView() {
        // Add mobile navigation
        if (!document.getElementById('mobile-nav')) {
            const mobileNav = document.createElement('div');
            mobileNav.id = 'mobile-nav';
            mobileNav.className = 'mobile-nav';
            
            const navItems = [
                { id: 'nav-chat', icon: 'chat', label: 'Chat', view: 'conversation' },
                { id: 'nav-visual', icon: 'visibility', label: 'Visual', view: 'visualization' },
                { id: 'nav-settings', icon: 'settings', label: 'Settings', view: 'settings' },
                { id: 'nav-memory', icon: 'memory', label: 'Memory', view: 'memory' }
            ];
            
            navItems.forEach(item => {
                const navButton = document.createElement('button');
                navButton.id = item.id;
                navButton.className = 'nav-button';
                navButton.setAttribute('data-view', item.view);
                navButton.setAttribute('aria-label', item.label);
                
                navButton.innerHTML = `
                    <span class="material-icons">${item.icon}</span>
                    <span class="nav-label">${item.label}</span>
                `;
                
                mobileNav.appendChild(navButton);
            });
            
            document.body.appendChild(mobileNav);
            
            // Set active view
            this.setActiveView('conversation');
        }
    }
    
    /**
     * Setup desktop view
     */
    setupDesktopView() {
        // Remove mobile navigation if it exists
        const mobileNav = document.getElementById('mobile-nav');
        if (mobileNav) {
            mobileNav.remove();
        }
        
        // Reset view
        this.setActiveView('conversation');
    }
    
    /**
     * Set active view
     * @param {string} view - View name
     */
    setActiveView(view) {
        this.state.currentView = view;
        
        // Update body class
        document.body.className = document.body.className.replace(/view-\w+/g, '');
        document.body.classList.add(`view-${view}`);
        
        // Update navigation buttons
        const navButtons = document.querySelectorAll('.nav-button');
        navButtons.forEach(button => {
            if (button.getAttribute('data-view') === view) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // Notify about view change
        this.eventSystem.publish('view-changed', { view });
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for view change requests
        this.eventSystem.subscribe('change-view', (data) => {
            this.setActiveView(data.view);
        });
        
        // Listen for fullscreen toggle
        this.eventSystem.subscribe('toggle-fullscreen', () => {
            this.toggleFullscreen();
        });
        
        // Listen for theme toggle
        this.eventSystem.subscribe('toggle-theme', () => {
            this.toggleDarkMode();
        });
        
        // Listen for notification requests
        this.eventSystem.subscribe('show-notification', (data) => {
            this.showNotification(data.message, data.type, data.duration);
        });
        
        // Listen for tooltip requests
        this.eventSystem.subscribe('show-tooltip', (data) => {
            this.showTooltip(data.text, data.element, data.position);
        });
        
        // Listen for context menu requests
        this.eventSystem.subscribe('show-context-menu', (data) => {
            this.showContextMenu(data.items, data.x, data.y);
        });
        
        // Set up DOM event listeners
        document.addEventListener('DOMContentLoaded', () => {
            // Quick action buttons
            const toggleThemeButton = document.getElementById('toggle-theme');
            if (toggleThemeButton) {
                toggleThemeButton.addEventListener('click', () => {
                    this.toggleDarkMode();
                });
            }
            
            const toggleSoundButton = document.getElementById('toggle-sound');
            if (toggleSoundButton) {
                toggleSoundButton.addEventListener('click', () => {
                    this.eventSystem.publish('toggle-sound');
                });
            }
            
            const clearChatButton = document.getElementById('clear-chat');
            if (clearChatButton) {
                clearChatButton.addEventListener('click', () => {
                    this.eventSystem.publish('clear-conversation');
                });
            }
            
            const toggleFullscreenButton = document.getElementById('toggle-fullscreen');
            if (toggleFullscreenButton) {
                toggleFullscreenButton.addEventListener('click', () => {
                    this.toggleFullscreen();
                });
            }
            
            // Mobile navigation
            document.body.addEventListener('click', (event) => {
                const navButton = event.target.closest('.nav-button');
                if (navButton) {
                    const view = navButton.getAttribute('data-view');
                    if (view) {
                        this.setActiveView(view);
                    }
                }
            });
            
            // Panel toggles
            document.body.addEventListener('click', (event) => {
                const panelToggle = event.target.closest('.panel-toggle');
                if (panelToggle) {
                    const panelSection = panelToggle.closest('.panel-section');
                    if (panelSection) {
                        panelSection.classList.toggle('collapsed');
                        
                        // Update toggle icon
                        const icon = panelToggle.querySelector('.material-icons');
                        if (icon) {
                            icon.textContent = panelSection.classList.contains('collapsed') ? 'expand_more' : 'expand_less';
                        }
                    }
                }
            });
            
            // 3D toggle
            const toggle3DButton = document.getElementById('toggle-3d');
            if (toggle3DButton) {
                toggle3DButton.addEventListener('click', () => {
                    this.eventSystem.publish('toggle-3d-view');
                });
            }
            
            // Emotion buttons
            document.body.addEventListener('click', (event) => {
                const emotionButton = event.target.closest('.emotion-button');
                if (emotionButton) {
                    const emotion = emotionButton.getAttribute('data-emotion');
                    if (emotion) {
                        this.eventSystem.publish('set-emotional-state', { state: emotion });
                    }
                }
            });
            
            // Context menu
            document.addEventListener('contextmenu', (event) => {
                // Prevent default context menu
                event.preventDefault();
                
                // Show custom context menu
                const element = event.target;
                const contextItems = this.getContextMenuItems(element);
                
                if (contextItems.length > 0) {
                    this.showContextMenu(contextItems, event.clientX, event.clientY);
                }
            });
            
            // Close context menu on click outside
            document.addEventListener('click', () => {
                this.hideContextMenu();
            });
            
            // Tooltip handling
            document.body.addEventListener('mouseover', (event) => {
                if (!this.state.tooltipsEnabled) return;
                
                const element = event.target.closest('[data-tooltip]');
                if (element) {
                    const tooltipText = element.getAttribute('data-tooltip');
                    if (tooltipText) {
                        this.showTooltip(tooltipText, element);
                    }
                }
            });
            
            document.body.addEventListener('mouseout', (event) => {
                const element = event.target.closest('[data-tooltip]');
                if (element) {
                    this.hideTooltip();
                }
            });
            
            // Track user activity
            document.addEventListener('mousemove', () => {
                this.state.lastInteraction = Date.now();
            });
            
            document.addEventListener('keydown', () => {
                this.state.lastInteraction = Date.now();
            });
            
            document.addEventListener('touchstart', () => {
                this.state.lastInteraction = Date.now();
            });
            
            // Setup gesture recognition if enabled
            if (this.state.gesturesEnabled) {
                this.setupGestureRecognition();
            }
        });
    }
    
    /**
     * Toggle dark mode
     */
    toggleDarkMode() {
        this.state.darkMode = !this.state.darkMode;
        
        if (this.state.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        // Save preference
        this.storageManager.setIndexedDB('preferences', 'user-interface', {
            ...this.state
        });
        
        // Notify about theme change
        this.eventSystem.publish('dark-mode-changed', {
            darkMode: this.state.darkMode
        });
    }
    
    /**
     * Toggle fullscreen
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
            this.state.isFullscreen = true;
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                this.state.isFullscreen = false;
            }
        }
        
        // Update button icon
        const fullscreenButton = document.getElementById('toggle-fullscreen');
        if (fullscreenButton) {
            const icon = fullscreenButton.querySelector('.material-icons');
            if (icon) {
                icon.textContent = this.state.isFullscreen ? 'fullscreen_exit' : 'fullscreen';
            }
        }
    }
    
    /**
     * Show notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (info, success, warning, error)
     * @param {number} duration - Duration in milliseconds
     */
    showNotification(message, type = 'info', duration = 3000) {
        if (!this.components.notificationArea) return;
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Add icon based on type
        let icon = 'info';
        switch (type) {
            case 'success': icon = 'check_circle'; break;
            case 'warning': icon = 'warning'; break;
            case 'error': icon = 'error'; break;
        }
        
        notification.innerHTML = `
            <span class="material-icons notification-icon">${icon}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" aria-label="Close notification">
                <span class="material-icons">close</span>
            </button>
        `;
        
        // Add to notification area
        this.components.notificationArea.appendChild(notification);
        
        // Add to state
        const notificationId = Date.now();
        this.state.notifications.push({
            id: notificationId,
            element: notification,
            type,
            message
        });
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('visible');
        }, 10);
        
        // Add close button handler
        const closeButton = notification.querySelector('.notification-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.removeNotification(notification, notificationId);
            });
        }
        
        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification, notificationId);
            }, duration);
        }
        
        return notificationId;
    }
    
    /**
     * Remove notification
     * @param {HTMLElement} notification - Notification element
     * @param {number} id - Notification ID
     */
    removeNotification(notification, id) {
        // Animate out
        notification.classList.remove('visible');
        
        // Remove after animation
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            
            // Remove from state
            this.state.notifications = this.state.notifications.filter(n => n.id !== id);
        }, 300);
    }
    
    /**
     * Show tooltip
     * @param {string} text - Tooltip text
     * @param {HTMLElement} element - Target element
     * @param {string} position - Tooltip position (top, bottom, left, right)
     */
    showTooltip(text, element, position = 'top') {
        if (!this.components.tooltipContainer || !this.state.tooltipsEnabled) return;
        
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = `tooltip tooltip-${position}`;
        tooltip.textContent = text;
        
        // Add to container
        this.components.tooltipContainer.innerHTML = '';
        this.components.tooltipContainer.appendChild(tooltip);
        
        // Position tooltip
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let top, left;
        
        switch (position) {
            case 'top':
                top = rect.top - tooltipRect.height - 8;
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'bottom':
                top = rect.bottom + 8;
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'left':
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.left - tooltipRect.width - 8;
                break;
            case 'right':
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.right + 8;
                break;
        }
        
        // Ensure tooltip stays within viewport
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        
        if (top < 10) top = 10;
        if (top + tooltipRect.height > window.innerHeight - 10) {
            top = window.innerHeight - tooltipRect.height - 10;
        }
        
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        
        // Show tooltip
        setTimeout(() => {
            tooltip.classList.add('visible');
        }, 10);
    }
    
    /**
     * Hide tooltip
     */
    hideTooltip() {
        if (!this.components.tooltipContainer) return;
        
        const tooltip = this.components.tooltipContainer.querySelector('.tooltip');
        if (tooltip) {
            tooltip.classList.remove('visible');
            
            // Remove after animation
            setTimeout(() => {
                this.components.tooltipContainer.innerHTML = '';
            }, 200);
        }
    }
    
    /**
     * Get context menu items for element
     * @param {HTMLElement} element - Target element
     * @returns {Array} Context menu items
     */
    getContextMenuItems(element) {
        const items = [];
        
        // Default items
        items.push({ label: 'Refresh', icon: 'refresh', action: 'refresh' });
        
        // Element-specific items
        if (element.closest('.conversation-history')) {
            items.push(
                { label: 'Copy', icon: 'content_copy', action: 'copy' },
                { label: 'Select All', icon: 'select_all', action: 'select-all' },
                { label: 'Clear Conversation', icon: 'delete_sweep', action: 'clear-conversation' }
            );
        }
        
        if (element.closest('.message')) {
            items.push(
                { label: 'Copy Message', icon: 'content_copy', action: 'copy-message' },
                { label: 'Delete Message', icon: 'delete', action: 'delete-message' }
            );
        }
        
        if (element.closest('.visualization-area')) {
            items.push(
                { label: 'Toggle 3D View', icon: 'view_in_ar', action: 'toggle-3d-view' },
                { label: 'Take Screenshot', icon: 'photo_camera', action: 'take-screenshot' }
            );
        }
        
        return items;
    }
    
    /**
     * Show context menu
     * @param {Array} items - Menu items
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    showContextMenu(items, x, y) {
        if (!this.components.contextMenu) return;
        
        // Clear existing menu
        this.components.contextMenu.innerHTML = '';
        
        // Create menu items
        items.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'context-menu-item';
            menuItem.setAttribute('data-action', item.action);
            
            menuItem.innerHTML = `
                <span class="material-icons">${item.icon || 'chevron_right'}</span>
                <span class="context-menu-label">${item.label}</span>
            `;
            
            menuItem.addEventListener('click', (event) => {
                event.stopPropagation();
                this.handleContextMenuAction(item.action, item.data);
                this.hideContextMenu();
            });
            
            this.components.contextMenu.appendChild(menuItem);
        });
        
        // Position menu
        const menuRect = this.components.contextMenu.getBoundingClientRect();
        
        let posX = x;
        let posY = y;
        
        // Ensure menu stays within viewport
        if (posX + menuRect.width > window.innerWidth - 10) {
            posX = window.innerWidth - menuRect.width - 10;
        }
        
        if (posY + menuRect.height > window.innerHeight - 10) {
            posY = window.innerHeight - menuRect.height - 10;
        }
        
        this.components.contextMenu.style.left = `${posX}px`;
        this.components.contextMenu.style.top = `${posY}px`;
        
        // Show menu
        this.components.contextMenu.classList.remove('hidden');
    }
    
    /**
     * Hide context menu
     */
    hideContextMenu() {
        if (!this.components.contextMenu) return;
        this.components.contextMenu.classList.add('hidden');
    }
    
    /**
     * Handle context menu action
     * @param {string} action - Action name
     * @param {any} data - Action data
     */
    handleContextMenuAction(action, data) {
        switch (action) {
            case 'refresh':
                window.location.reload();
                break;
            case 'copy':
                document.execCommand('copy');
                break;
            case 'select-all':
                document.execCommand('selectAll');
                break;
            case 'clear-conversation':
                this.eventSystem.publish('clear-conversation');
                break;
            case 'copy-message':
                if (data && data.message) {
                    navigator.clipboard.writeText(data.message);
                    this.showNotification('Message copied to clipboard', 'success');
                }
                break;
            case 'delete-message':
                if (data && data.messageId) {
                    this.eventSystem.publish('delete-message', { messageId: data.messageId });
                }
                break;
            case 'toggle-3d-view':
                this.eventSystem.publish('toggle-3d-view');
                break;
            case 'take-screenshot':
                this.eventSystem.publish('take-screenshot');
                break;
            default:
                // Forward unknown actions to event system
                this.eventSystem.publish(action, data);
        }
    }
    
    /**
     * Setup gesture recognition
     */
    setupGestureRecognition() {
        // Track touch start position
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;
        
        document.addEventListener('touchstart', (event) => {
            if (event.touches.length === 1) {
                touchStartX = event.touches[0].clientX;
                touchStartY = event.touches[0].clientY;
                touchStartTime = Date.now();
            }
        }, { passive: true });
        
        document.addEventListener('touchend', (event) => {
            if (!this.state.gesturesEnabled) return;
            
            const touchEndX = event.changedTouches[0].clientX;
            const touchEndY = event.changedTouches[0].clientY;
            const touchEndTime = Date.now();
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            const deltaTime = touchEndTime - touchStartTime;
            
            // Minimum distance for swipe
            const minDistance = 100;
            // Maximum time for swipe
            const maxTime = 500;
            
            // Check if it's a swipe
            if (deltaTime < maxTime) {
                // Horizontal swipe
                if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minDistance) {
                    if (deltaX > 0) {
                        // Right swipe
                        this.handleGesture('swipe-right');
                    } else {
                        // Left swipe
                        this.handleGesture('swipe-left');
                    }
                }
                // Vertical swipe
                else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > minDistance) {
                    if (deltaY > 0) {
                        // Down swipe
                        this.handleGesture('swipe-down');
                    } else {
                        // Up swipe
                        this.handleGesture('swipe-up');
                    }
                }
            }
        }, { passive: true });
        
        // Double tap detection
        let lastTap = 0;
        document.addEventListener('touchend', (event) => {
            if (!this.state.gesturesEnabled) return;
            
            const currentTime = Date.now();
            const tapLength = currentTime - lastTap;
            
            if (tapLength < 300 && tapLength > 0) {
                // Double tap detected
                this.handleGesture('double-tap', {
                    x: event.changedTouches[0].clientX,
                    y: event.changedTouches[0].clientY
                });
                event.preventDefault();
            }
            
            lastTap = currentTime;
        });
        
        // Pinch gesture
        let initialPinchDistance = 0;
        
        document.addEventListener('touchstart', (event) => {
            if (event.touches.length === 2) {
                initialPinchDistance = Math.hypot(
                    event.touches[0].clientX - event.touches[1].clientX,
                    event.touches[0].clientY - event.touches[1].clientY
                );
            }
        }, { passive: true });
        
        document.addEventListener('touchmove', (event) => {
            if (!this.state.gesturesEnabled) return;
            
            if (event.touches.length === 2) {
                const currentPinchDistance = Math.hypot(
                    event.touches[0].clientX - event.touches[1].clientX,
                    event.touches[0].clientY - event.touches[1].clientY
                );
                
                if (initialPinchDistance > 0) {
                    if (currentPinchDistance - initialPinchDistance > 50) {
                        // Pinch out (zoom in)
                        this.handleGesture('pinch-out');
                        initialPinchDistance = currentPinchDistance;
                    } else if (initialPinchDistance - currentPinchDistance > 50) {
                        // Pinch in (zoom out)
                        this.handleGesture('pinch-in');
                        initialPinchDistance = currentPinchDistance;
                    }
                }
            }
        }, { passive: true });
    }
    
    /**
     * Handle gesture
     * @param {string} gesture - Gesture type
     * @param {Object} data - Gesture data
     */
    handleGesture(gesture, data = {}) {
        // Handle based on current view and gesture
        switch (this.state.currentView) {
            case 'conversation':
                if (gesture === 'swipe-left') {
                    // Switch to visualization view
                    this.setActiveView('visualization');
                } else if (gesture === 'swipe-right') {
                    // Open settings
                    this.setActiveView('settings');
                } else if (gesture === 'swipe-up') {
                    // Scroll conversation history
                    const history = document.querySelector('.conversation-history');
                    if (history) {
                        history.scrollTop += 100;
                    }
                } else if (gesture === 'swipe-down') {
                    // Scroll conversation history
                    const history = document.querySelector('.conversation-history');
                    if (history) {
                        history.scrollTop -= 100;
                    }
                }
                break;
                
            case 'visualization':
                if (gesture === 'swipe-right') {
                    // Switch to conversation view
                    this.setActiveView('conversation');
                } else if (gesture === 'swipe-left') {
                    // Switch to settings view
                    this.setActiveView('settings');
                } else if (gesture === 'pinch-out') {
                    // Zoom in visualization
                    this.eventSystem.publish('visualization-zoom', { direction: 'in' });
                } else if (gesture === 'pinch-in') {
                    // Zoom out visualization
                    this.eventSystem.publish('visualization-zoom', { direction: 'out' });
                }
                break;
                
            case 'settings':
                if (gesture === 'swipe-right') {
                    // Switch to visualization view
                    this.setActiveView('visualization');
                } else if (gesture === 'swipe-left') {
                    // Switch to memory view
                    this.setActiveView('memory');
                }
                break;
                
            case 'memory':
                if (gesture === 'swipe-right') {
                    // Switch to settings view
                    this.setActiveView('settings');
                } else if (gesture === 'swipe-left') {
                    // Switch to conversation view
                    this.setActiveView('conversation');
                }
                break;
        }
        
        // Publish gesture event
        this.eventSystem.publish('gesture-detected', {
            gesture,
            view: this.state.currentView,
            ...data
        });
    }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedInterfaceSystem;
} else {
    window.EnhancedInterfaceSystem = EnhancedInterfaceSystem;
}
