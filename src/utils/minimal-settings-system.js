/**
 * Minimal Settings System
 * 
 * This system provides only the essential settings needed for the MeAI application,
 * focusing on simplicity and user experience without overwhelming options.
 */

class MinimalSettingsSystem {
    constructor() {
        // Initialize state
        this.state = {
            initialized: false,
            settings: {
                appearance: {
                    theme: 'auto', // 'light', 'dark', 'auto'
                    textSize: 'medium' // 'small', 'medium', 'large'
                },
                audio: {
                    enabled: true,
                    volume: 0.7 // 0-1
                },
                accessibility: {
                    reducedMotion: false,
                    highContrast: false
                },
                privacy: {
                    saveConversations: true,
                    analytics: true
                }
            },
            defaultSettings: null,
            settingsOpen: false
        };
        
        // Save default settings
        this.state.defaultSettings = JSON.parse(JSON.stringify(this.state.settings));
        
        // Initialize the system
        this.initialize();
    }
    
    /**
     * Initialize the minimal settings system
     */
    initialize() {
        try {
            console.log('Initializing Minimal Settings System...');
            
            // Create event system if not exists
            window.eventSystem = window.eventSystem || this.createEventSystem();
            
            // Load saved settings
            this.loadSettings();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Apply current settings
            this.applySettings();
            
            // Create minimal settings UI
            this.createSettingsUI();
            
            // Mark as initialized
            this.state.initialized = true;
            
            console.log('Minimal Settings System initialized successfully');
            
            return true;
        } catch (error) {
            console.error('Error initializing Minimal Settings System:', error);
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
     * Load settings from local storage
     */
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('meai-settings');
            
            if (savedSettings) {
                const parsedSettings = JSON.parse(savedSettings);
                
                // Merge saved settings with defaults (to handle new settings)
                this.state.settings = this.mergeSettings(this.state.defaultSettings, parsedSettings);
                
                console.log('Settings loaded from local storage');
            } else {
                // Apply system preferences for theme if no saved settings
                this.detectSystemPreferences();
                console.log('No saved settings found, using defaults with system preferences');
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            // Fallback to defaults
            this.state.settings = JSON.parse(JSON.stringify(this.state.defaultSettings));
        }
    }
    
    /**
     * Merge settings objects
     * @param {Object} defaults - Default settings
     * @param {Object} saved - Saved settings
     * @returns {Object} - Merged settings
     */
    mergeSettings(defaults, saved) {
        const merged = JSON.parse(JSON.stringify(defaults));
        
        // Merge each category
        for (const category in saved) {
            if (merged[category]) {
                for (const setting in saved[category]) {
                    if (merged[category][setting] !== undefined) {
                        merged[category][setting] = saved[category][setting];
                    }
                }
            }
        }
        
        return merged;
    }
    
    /**
     * Detect system preferences
     */
    detectSystemPreferences() {
        // Detect preferred color scheme
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.state.settings.appearance.theme = 'dark';
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            this.state.settings.appearance.theme = 'light';
        }
        
        // Detect reduced motion preference
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.state.settings.accessibility.reducedMotion = true;
        }
        
        // Listen for changes in system preferences
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                if (this.state.settings.appearance.theme === 'auto') {
                    this.updateTheme(e.matches ? 'dark' : 'light');
                }
            });
            
            window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => {
                if (e.matches) {
                    this.updateSetting('accessibility', 'reducedMotion', true);
                }
            });
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for settings toggle
        window.eventSystem.subscribe('toggle-settings', () => {
            this.toggleSettings();
        });
        
        // Listen for setting changes
        window.eventSystem.subscribe('update-setting', (data) => {
            if (data.category && data.setting && data.value !== undefined) {
                this.updateSetting(data.category, data.setting, data.value);
            }
        });
        
        // Listen for reset settings
        window.eventSystem.subscribe('reset-settings', () => {
            this.resetSettings();
        });
    }
    
    /**
     * Apply current settings
     */
    applySettings() {
        // Apply theme
        this.applyTheme();
        
        // Apply text size
        this.applyTextSize();
        
        // Apply audio settings
        this.applyAudioSettings();
        
        // Apply accessibility settings
        this.applyAccessibilitySettings();
        
        // Apply privacy settings
        this.applyPrivacySettings();
        
        // Save settings to local storage
        this.saveSettings();
        
        // Publish event
        window.eventSystem.publish('settings-applied', {
            settings: this.state.settings
        });
    }
    
    /**
     * Apply theme setting
     */
    applyTheme() {
        let theme = this.state.settings.appearance.theme;
        
        // Handle auto theme
        if (theme === 'auto') {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                theme = 'dark';
            } else {
                theme = 'light';
            }
        }
        
        // Apply theme class to body
        document.body.classList.remove('theme-light', 'theme-dark');
        document.body.classList.add(`theme-${theme}`);
        
        // Set CSS variables for theme colors
        if (theme === 'dark') {
            document.documentElement.style.setProperty('--background-color', '#121212');
            document.documentElement.style.setProperty('--text-color', '#ffffff');
            document.documentElement.style.setProperty('--primary-color', '#bb86fc');
            document.documentElement.style.setProperty('--secondary-color', '#03dac6');
            document.documentElement.style.setProperty('--surface-color', '#1e1e1e');
            document.documentElement.style.setProperty('--error-color', '#cf6679');
        } else {
            document.documentElement.style.setProperty('--background-color', '#ffffff');
            document.documentElement.style.setProperty('--text-color', '#121212');
            document.documentElement.style.setProperty('--primary-color', '#6200ee');
            document.documentElement.style.setProperty('--secondary-color', '#03dac6');
            document.documentElement.style.setProperty('--surface-color', '#f5f5f5');
            document.documentElement.style.setProperty('--error-color', '#b00020');
        }
    }
    
    /**
     * Apply text size setting
     */
    applyTextSize() {
        const textSize = this.state.settings.appearance.textSize;
        
        // Remove existing text size classes
        document.body.classList.remove('text-small', 'text-medium', 'text-large');
        
        // Add appropriate class
        document.body.classList.add(`text-${textSize}`);
        
        // Set base font size
        let baseFontSize = '16px';
        
        switch (textSize) {
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
     * Apply audio settings
     */
    applyAudioSettings() {
        const { enabled, volume } = this.state.settings.audio;
        
        // Set global audio state
        window.audioEnabled = enabled;
        window.audioVolume = volume;
        
        // Publish audio settings
        window.eventSystem.publish('audio-settings-changed', {
            enabled: enabled,
            volume: volume
        });
        
        // Apply to existing audio elements
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
            audio.volume = volume;
            if (!enabled) {
                audio.pause();
            }
        });
    }
    
    /**
     * Apply accessibility settings
     */
    applyAccessibilitySettings() {
        const { reducedMotion, highContrast } = this.state.settings.accessibility;
        
        // Apply reduced motion
        if (reducedMotion) {
            document.body.classList.add('reduced-motion');
            document.documentElement.style.setProperty('--transition-duration', '0s');
            document.documentElement.style.setProperty('--animation-duration', '0s');
        } else {
            document.body.classList.remove('reduced-motion');
            document.documentElement.style.setProperty('--transition-duration', '0.3s');
            document.documentElement.style.setProperty('--animation-duration', '1s');
        }
        
        // Apply high contrast
        if (highContrast) {
            document.body.classList.add('high-contrast');
            document.documentElement.style.setProperty('--contrast-factor', '1.5');
        } else {
            document.body.classList.remove('high-contrast');
            document.documentElement.style.setProperty('--contrast-factor', '1');
        }
        
        // Publish accessibility settings
        window.eventSystem.publish('accessibility-settings-changed', {
            reducedMotion: reducedMotion,
            highContrast: highContrast
        });
    }
    
    /**
     * Apply privacy settings
     */
    applyPrivacySettings() {
        const { saveConversations, analytics } = this.state.settings.privacy;
        
        // Set global privacy state
        window.saveConversations = saveConversations;
        window.analyticsEnabled = analytics;
        
        // Publish privacy settings
        window.eventSystem.publish('privacy-settings-changed', {
            saveConversations: saveConversations,
            analytics: analytics
        });
    }
    
    /**
     * Save settings to local storage
     */
    saveSettings() {
        try {
            localStorage.setItem('meai-settings', JSON.stringify(this.state.settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }
    
    /**
     * Create minimal settings UI
     */
    createSettingsUI() {
        // Check if settings container already exists
        if (document.getElementById('settings-container')) {
            return;
        }
        
        // Create settings button
        const settingsButton = document.createElement('button');
        settingsButton.id = 'settings-button';
        settingsButton.className = 'settings-button';
        settingsButton.setAttribute('aria-label', 'Settings');
        settingsButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
        `;
        
        // Add click event
        settingsButton.addEventListener('click', () => {
            this.toggleSettings();
        });
        
        // Create settings container
        const settingsContainer = document.createElement('div');
        settingsContainer.id = 'settings-container';
        settingsContainer.className = 'settings-container';
        settingsContainer.style.display = 'none';
        
        // Create settings content
        settingsContainer.innerHTML = `
            <div class="settings-header">
                <h2>Settings</h2>
                <button id="close-settings" aria-label="Close settings">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            
            <div class="settings-section">
                <h3>Appearance</h3>
                
                <div class="setting-item">
                    <label for="theme-setting">Theme</label>
                    <select id="theme-setting" data-category="appearance" data-setting="theme">
                        <option value="auto">Auto (System)</option>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                </div>
                
                <div class="setting-item">
                    <label for="text-size-setting">Text Size</label>
                    <select id="text-size-setting" data-category="appearance" data-setting="textSize">
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                    </select>
                </div>
            </div>
            
            <div class="settings-section">
                <h3>Audio</h3>
                
                <div class="setting-item">
                    <label for="audio-enabled-setting">Enable Audio</label>
                    <input type="checkbox" id="audio-enabled-setting" data-category="audio" data-setting="enabled">
                </div>
                
                <div class="setting-item">
                    <label for="audio-volume-setting">Volume</label>
                    <input type="range" id="audio-volume-setting" min="0" max="1" step="0.1" data-category="audio" data-setting="volume">
                </div>
            </div>
            
            <div class="settings-section">
                <h3>Accessibility</h3>
                
                <div class="setting-item">
                    <label for="reduced-motion-setting">Reduced Motion</label>
                    <input type="checkbox" id="reduced-motion-setting" data-category="accessibility" data-setting="reducedMotion">
                </div>
                
                <div class="setting-item">
                    <label for="high-contrast-setting">High Contrast</label>
                    <input type="checkbox" id="high-contrast-setting" data-category="accessibility" data-setting="highContrast">
                </div>
            </div>
            
            <div class="settings-section">
                <h3>Privacy</h3>
                
                <div class="setting-item">
                    <label for="save-conversations-setting">Save Conversations</label>
                    <input type="checkbox" id="save-conversations-setting" data-category="privacy" data-setting="saveConversations">
                </div>
                
                <div class="setting-item">
                    <label for="analytics-setting">Allow Analytics</label>
                    <input type="checkbox" id="analytics-setting" data-category="privacy" data-setting="analytics">
                </div>
            </div>
            
            <div class="settings-footer">
                <button id="reset-settings">Reset to Defaults</button>
            </div>
        `;
        
        // Add settings elements to the document
        document.body.appendChild(settingsButton);
        document.body.appendChild(settingsContainer);
        
        // Add event listeners to settings elements
        this.addSettingsEventListeners();
        
        // Update UI to reflect current settings
        this.updateSettingsUI();
    }
    
    /**
     * Add event listeners to settings elements
     */
    addSettingsEventListeners() {
        // Close settings button
        const closeButton = document.getElementById('close-settings');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.toggleSettings(false);
            });
        }
        
        // Reset settings button
        const resetButton = document.getElementById('reset-settings');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.resetSettings();
            });
        }
        
        // Setting inputs
        const settingInputs = document.querySelectorAll('[data-category][data-setting]');
        settingInputs.forEach(input => {
            const category = input.dataset.category;
            const setting = input.dataset.setting;
            
            if (input.type === 'checkbox') {
                input.addEventListener('change', () => {
                    this.updateSetting(category, setting, input.checked);
                });
            } else if (input.type === 'range') {
                input.addEventListener('input', () => {
                    this.updateSetting(category, setting, parseFloat(input.value));
                });
            } else if (input.tagName === 'SELECT') {
                input.addEventListener('change', () => {
                    this.updateSetting(category, setting, input.value);
                });
            }
        });
    }
    
    /**
     * Update settings UI to reflect current settings
     */
    updateSettingsUI() {
        // Update each setting input
        for (const category in this.state.settings) {
            for (const setting in this.state.settings[category]) {
                const input = document.querySelector(`[data-category="${category}"][data-setting="${setting}"]`);
                
                if (input) {
                    const value = this.state.settings[category][setting];
                    
                    if (input.type === 'checkbox') {
                        input.checked = value;
                    } else if (input.type === 'range') {
                        input.value = value;
                    } else if (input.tagName === 'SELECT') {
                        input.value = value;
                    }
                }
            }
        }
    }
    
    /**
     * Toggle settings panel
     * @param {boolean} [show] - Force show/hide
     */
    toggleSettings(show) {
        const settingsContainer = document.getElementById('settings-container');
        
        if (!settingsContainer) {
            return;
        }
        
        if (show === undefined) {
            show = settingsContainer.style.display === 'none';
        }
        
        if (show) {
            settingsContainer.style.display = 'block';
            this.state.settingsOpen = true;
            
            // Update UI to reflect current settings
            this.updateSettingsUI();
        } else {
            settingsContainer.style.display = 'none';
            this.state.settingsOpen = false;
        }
    }
    
    /**
     * Update a setting
     * @param {string} category - Setting category
     * @param {string} setting - Setting name
     * @param {any} value - Setting value
     */
    updateSetting(category, setting, value) {
        // Check if category and setting exist
        if (!this.state.settings[category] || this.state.settings[category][setting] === undefined) {
            console.error(`Invalid setting: ${category}.${setting}`);
            return;
        }
        
        // Update setting
        this.state.settings[category][setting] = value;
        
        // Apply settings
        this.applySettings();
        
        // Update UI
        this.updateSettingsUI();
        
        // Publish event
        window.eventSystem.publish('setting-updated', {
            category: category,
            setting: setting,
            value: value
        });
    }
    
    /**
     * Update theme
     * @param {string} theme - Theme name
     */
    updateTheme(theme) {
        this.updateSetting('appearance', 'theme', theme);
    }
    
    /**
     * Reset settings to defaults
     */
    resetSettings() {
        // Reset to defaults
        this.state.settings = JSON.parse(JSON.stringify(this.state.defaultSettings));
        
        // Apply settings
        this.applySettings();
        
        // Update UI
        this.updateSettingsUI();
        
        // Publish event
        window.eventSystem.publish('settings-reset', {});
    }
    
    /**
     * Get all settings
     * @returns {Object} - All settings
     */
    getSettings() {
        return JSON.parse(JSON.stringify(this.state.settings));
    }
    
    /**
     * Get a specific setting
     * @param {string} category - Setting category
     * @param {string} setting - Setting name
     * @returns {any} - Setting value
     */
    getSetting(category, setting) {
        if (this.state.settings[category] && this.state.settings[category][setting] !== undefined) {
            return this.state.settings[category][setting];
        }
        return null;
    }
}

// Create singleton instance
const minimalSettingsSystem = new MinimalSettingsSystem();

// Export the singleton
window.minimalSettingsSystem = minimalSettingsSystem;
