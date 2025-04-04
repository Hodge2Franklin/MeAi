/**
 * Theme System
 * 
 * This system provides multiple visual themes with customizable color palettes,
 * animation intensity controls, and layout variations.
 */

class ThemeSystem {
    constructor() {
        // Initialize dependencies
        this.storageManager = window.storageManager;
        this.eventSystem = window.eventSystem;
        
        // Available themes
        this.themes = {
            default: {
                name: 'Default',
                colors: {
                    primary: '#3a86ff',
                    secondary: '#8338ec',
                    background: '#0a0e17',
                    text: '#ffffff',
                    accent: '#ff006e',
                    containerBg: 'rgba(10, 14, 23, 0.8)',
                    inputBg: 'rgba(255, 255, 255, 0.1)',
                    buttonBg: '#3a86ff',
                    buttonHover: '#5a9aff',
                    pixelJoy: '#ffbe0b',
                    pixelReflective: '#3a86ff',
                    pixelCurious: '#8338ec',
                    pixelExcited: '#ff006e',
                    pixelEmpathetic: '#38b000',
                    pixelCalm: '#00b4d8',
                    pixelNeutral: '#ffffff'
                },
                animations: {
                    intensity: 1.0,
                    transitionFast: '0.2s',
                    transitionMedium: '0.5s',
                    transitionSlow: '1s'
                },
                layout: {
                    pixelSize: '40px',
                    borderRadius: {
                        small: '4px',
                        medium: '8px',
                        large: '16px',
                        circle: '50%'
                    },
                    spacing: {
                        xs: '4px',
                        sm: '8px',
                        md: '16px',
                        lg: '24px',
                        xl: '32px'
                    }
                }
            },
            cosmic: {
                name: 'Cosmic',
                colors: {
                    primary: '#00b4d8',
                    secondary: '#7209b7',
                    background: '#03071e',
                    text: '#f8f9fa',
                    accent: '#f72585',
                    containerBg: 'rgba(3, 7, 30, 0.8)',
                    inputBg: 'rgba(255, 255, 255, 0.1)',
                    buttonBg: '#00b4d8',
                    buttonHover: '#48cae4',
                    pixelJoy: '#ffbe0b',
                    pixelReflective: '#00b4d8',
                    pixelCurious: '#7209b7',
                    pixelExcited: '#f72585',
                    pixelEmpathetic: '#4cc9f0',
                    pixelCalm: '#4361ee',
                    pixelNeutral: '#f8f9fa'
                },
                animations: {
                    intensity: 1.2,
                    transitionFast: '0.2s',
                    transitionMedium: '0.5s',
                    transitionSlow: '1s'
                },
                layout: {
                    pixelSize: '45px',
                    borderRadius: {
                        small: '4px',
                        medium: '8px',
                        large: '16px',
                        circle: '50%'
                    },
                    spacing: {
                        xs: '4px',
                        sm: '8px',
                        md: '16px',
                        lg: '24px',
                        xl: '32px'
                    }
                }
            },
            forest: {
                name: 'Forest',
                colors: {
                    primary: '#2d6a4f',
                    secondary: '#1b4332',
                    background: '#081c15',
                    text: '#d8f3dc',
                    accent: '#52b788',
                    containerBg: 'rgba(8, 28, 21, 0.8)',
                    inputBg: 'rgba(255, 255, 255, 0.1)',
                    buttonBg: '#2d6a4f',
                    buttonHover: '#40916c',
                    pixelJoy: '#d9ed92',
                    pixelReflective: '#2d6a4f',
                    pixelCurious: '#52b788',
                    pixelExcited: '#b7e4c7',
                    pixelEmpathetic: '#95d5b2',
                    pixelCalm: '#1b4332',
                    pixelNeutral: '#d8f3dc'
                },
                animations: {
                    intensity: 0.8,
                    transitionFast: '0.3s',
                    transitionMedium: '0.6s',
                    transitionSlow: '1.2s'
                },
                layout: {
                    pixelSize: '40px',
                    borderRadius: {
                        small: '2px',
                        medium: '4px',
                        large: '8px',
                        circle: '50%'
                    },
                    spacing: {
                        xs: '4px',
                        sm: '8px',
                        md: '16px',
                        lg: '24px',
                        xl: '32px'
                    }
                }
            },
            ocean: {
                name: 'Ocean',
                colors: {
                    primary: '#0077b6',
                    secondary: '#023e8a',
                    background: '#03045e',
                    text: '#caf0f8',
                    accent: '#00b4d8',
                    containerBg: 'rgba(3, 4, 94, 0.8)',
                    inputBg: 'rgba(255, 255, 255, 0.1)',
                    buttonBg: '#0077b6',
                    buttonHover: '#0096c7',
                    pixelJoy: '#90e0ef',
                    pixelReflective: '#0077b6',
                    pixelCurious: '#023e8a',
                    pixelExcited: '#00b4d8',
                    pixelEmpathetic: '#48cae4',
                    pixelCalm: '#ade8f4',
                    pixelNeutral: '#caf0f8'
                },
                animations: {
                    intensity: 1.0,
                    transitionFast: '0.2s',
                    transitionMedium: '0.5s',
                    transitionSlow: '1s'
                },
                layout: {
                    pixelSize: '40px',
                    borderRadius: {
                        small: '8px',
                        medium: '12px',
                        large: '20px',
                        circle: '50%'
                    },
                    spacing: {
                        xs: '4px',
                        sm: '8px',
                        md: '16px',
                        lg: '24px',
                        xl: '32px'
                    }
                }
            },
            minimalist: {
                name: 'Minimalist',
                colors: {
                    primary: '#212529',
                    secondary: '#495057',
                    background: '#f8f9fa',
                    text: '#212529',
                    accent: '#6c757d',
                    containerBg: 'rgba(248, 249, 250, 0.8)',
                    inputBg: 'rgba(33, 37, 41, 0.1)',
                    buttonBg: '#212529',
                    buttonHover: '#343a40',
                    pixelJoy: '#ffd166',
                    pixelReflective: '#212529',
                    pixelCurious: '#495057',
                    pixelExcited: '#6c757d',
                    pixelEmpathetic: '#adb5bd',
                    pixelCalm: '#dee2e6',
                    pixelNeutral: '#212529'
                },
                animations: {
                    intensity: 0.6,
                    transitionFast: '0.15s',
                    transitionMedium: '0.3s',
                    transitionSlow: '0.6s'
                },
                layout: {
                    pixelSize: '35px',
                    borderRadius: {
                        small: '0px',
                        medium: '2px',
                        large: '4px',
                        circle: '50%'
                    },
                    spacing: {
                        xs: '4px',
                        sm: '8px',
                        md: '16px',
                        lg: '24px',
                        xl: '32px'
                    }
                }
            }
        };
        
        // Current theme
        this.currentTheme = 'default';
        this.animationIntensity = 1.0;
        
        // Initialize
        this.initialize();
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    /**
     * Initialize the theme system
     */
    async initialize() {
        try {
            // Load saved theme preference
            const preferences = await this.storageManager.getIndexedDB('preferences', 'user-preferences');
            if (preferences && preferences.theme) {
                this.currentTheme = preferences.theme;
            }
            
            // Load animation intensity preference
            if (preferences && preferences.animationIntensity !== undefined) {
                this.animationIntensity = preferences.animationIntensity;
            }
            
            // Apply the theme
            this.applyTheme(this.currentTheme);
            
            console.log('Theme System initialized with theme:', this.currentTheme);
            
            // Notify system that theme is ready
            this.eventSystem.publish('theme-system-ready', {
                theme: this.currentTheme,
                animationIntensity: this.animationIntensity
            });
        } catch (error) {
            console.error('Error initializing theme system:', error);
            // Apply default theme if there's an error
            this.applyTheme('default');
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for theme change requests
        this.eventSystem.subscribe('theme-change-request', (data) => {
            this.changeTheme(data.theme);
        });
        
        // Listen for animation intensity change requests
        this.eventSystem.subscribe('animation-intensity-change', (data) => {
            this.setAnimationIntensity(data.intensity);
        });
        
        // Set up DOM event listeners for theme selector
        document.addEventListener('DOMContentLoaded', () => {
            const themeSelector = document.getElementById('theme-selector');
            const themeToggle = document.getElementById('theme-toggle');
            
            if (themeToggle) {
                themeToggle.addEventListener('click', () => {
                    themeSelector.classList.toggle('hidden');
                });
            }
            
            // Add event listeners to theme options
            const themeOptions = document.querySelectorAll('.theme-option');
            themeOptions.forEach(option => {
                option.addEventListener('click', () => {
                    const theme = option.getAttribute('data-theme');
                    this.changeTheme(theme);
                    themeSelector.classList.add('hidden');
                });
            });
        });
    }
    
    /**
     * Change the current theme
     * @param {string} themeName - Name of the theme to apply
     */
    async changeTheme(themeName) {
        // Validate theme
        if (!this.themes[themeName]) {
            console.warn(`Unknown theme: ${themeName}, defaulting to default theme`);
            themeName = 'default';
        }
        
        // Update current theme
        this.currentTheme = themeName;
        
        // Apply the theme
        this.applyTheme(themeName);
        
        // Save preference
        try {
            // Get current preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'user-preferences') || {
                id: 'user-preferences'
            };
            
            // Update theme preference
            preferences.theme = themeName;
            
            // Save preferences
            await this.storageManager.setIndexedDB('preferences', preferences);
            
            // Publish event that theme was changed
            this.eventSystem.publish('theme-changed', {
                theme: themeName,
                themeData: this.themes[themeName]
            });
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    }
    
    /**
     * Apply a theme to the document
     * @param {string} themeName - Name of the theme to apply
     */
    applyTheme(themeName) {
        const theme = this.themes[themeName] || this.themes.default;
        const root = document.documentElement;
        
        // Apply colors
        for (const [key, value] of Object.entries(theme.colors)) {
            // Convert camelCase to kebab-case for CSS variables
            const cssVar = key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
            root.style.setProperty(`--${cssVar}`, value);
        }
        
        // Apply animations
        root.style.setProperty('--transition-fast', theme.animations.transitionFast);
        root.style.setProperty('--transition-medium', theme.animations.transitionMedium);
        root.style.setProperty('--transition-slow', theme.animations.transitionSlow);
        
        // Apply layout
        root.style.setProperty('--pixel-size', theme.layout.pixelSize);
        root.style.setProperty('--border-radius-sm', theme.layout.borderRadius.small);
        root.style.setProperty('--border-radius-md', theme.layout.borderRadius.medium);
        root.style.setProperty('--border-radius-lg', theme.layout.borderRadius.large);
        root.style.setProperty('--border-radius-circle', theme.layout.borderRadius.circle);
        
        root.style.setProperty('--spacing-xs', theme.layout.spacing.xs);
        root.style.setProperty('--spacing-sm', theme.layout.spacing.sm);
        root.style.setProperty('--spacing-md', theme.layout.spacing.md);
        root.style.setProperty('--spacing-lg', theme.layout.spacing.lg);
        root.style.setProperty('--spacing-xl', theme.layout.spacing.xl);
        
        // Apply animation intensity
        this.applyAnimationIntensity(this.animationIntensity);
        
        // Add theme class to body
        document.body.className = ''; // Clear existing theme classes
        document.body.classList.add(`theme-${themeName}`);
        
        console.log(`Applied theme: ${themeName}`);
    }
    
    /**
     * Set animation intensity
     * @param {number} intensity - Animation intensity (0-1)
     */
    async setAnimationIntensity(intensity) {
        // Validate and normalize intensity
        intensity = Math.max(0, Math.min(1, intensity));
        
        // Update animation intensity
        this.animationIntensity = intensity;
        
        // Apply animation intensity
        this.applyAnimationIntensity(intensity);
        
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
        } catch (error) {
            console.error('Error saving animation intensity preference:', error);
        }
    }
    
    /**
     * Apply animation intensity to CSS variables
     * @param {number} intensity - Animation intensity (0-1)
     */
    applyAnimationIntensity(intensity) {
        const root = document.documentElement;
        
        // Scale animation durations based on intensity
        // Lower intensity = slower animations
        const theme = this.themes[this.currentTheme] || this.themes.default;
        const baseIntensity = theme.animations.intensity;
        const scaledIntensity = baseIntensity * intensity;
        
        // Apply animation intensity as a CSS variable
        root.style.setProperty('--animation-intensity', scaledIntensity.toFixed(2));
        
        // Adjust animation durations based on intensity
        // Higher intensity = faster animations
        const intensityFactor = 1 / Math.max(0.1, intensity);
        
        // Parse base transition times
        const parseTime = (timeStr) => {
            return parseFloat(timeStr.replace('s', ''));
        };
        
        const baseFast = parseTime(theme.animations.transitionFast);
        const baseMedium = parseTime(theme.animations.transitionMedium);
        const baseSlow = parseTime(theme.animations.transitionSlow);
        
        // Calculate adjusted times
        const adjustedFast = (baseFast * intensityFactor).toFixed(2);
        const adjustedMedium = (baseMedium * intensityFactor).toFixed(2);
        const adjustedSlow = (baseSlow * intensityFactor).toFixed(2);
        
        // Apply adjusted times
        root.style.setProperty('--transition-fast', `${adjustedFast}s`);
        root.style.setProperty('--transition-medium', `${adjustedMedium}s`);
        root.style.setProperty('--transition-slow', `${adjustedSlow}s`);
    }
    
    /**
     * Get available themes
     * @returns {Object} - Object containing available themes
     */
    getAvailableThemes() {
        const themeList = {};
        
        for (const [key, theme] of Object.entries(this.themes)) {
            themeList[key] = {
                name: theme.name,
                primaryColor: theme.colors.primary
            };
        }
        
        return themeList;
    }
    
    /**
     * Get current theme
     * @returns {Object} - Current theme object
     */
    getCurrentTheme() {
        return {
            name: this.currentTheme,
            data: this.themes[this.currentTheme]
        };
    }
    
    /**
     * Get animation intensity
     * @returns {number} - Current animation intensity
     */
    getAnimationIntensity() {
        return this.animationIntensity;
    }
}

// Initialize the theme system when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.themeSystem = new ThemeSystem();
});
