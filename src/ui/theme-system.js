/**
 * Theme System
 * 
 * This module provides an expanded theme library with customization options
 * for the MeAI visualization and interface.
 */

import { eventSystem } from '../utils/event-system.js';

class ThemeSystem {
    constructor() {
        // Theme state
        this.currentTheme = 'default';
        this.currentAccent = 'blue';
        this.currentMode = 'light';
        this.customTheme = null;
        
        // Theme definitions
        this.themes = {
            default: {
                name: 'Default',
                description: 'The standard MeAI theme with clean, modern aesthetics',
                modes: {
                    light: {
                        background: '#f8f9fa',
                        surface: '#ffffff',
                        primary: '#3a86ff',
                        secondary: '#8338ec',
                        text: '#212529',
                        textSecondary: '#6c757d',
                        accent: '#ff006e',
                        success: '#38b000',
                        warning: '#ffbe0b',
                        error: '#d00000',
                        info: '#00b4d8',
                        border: '#dee2e6',
                        shadow: 'rgba(0, 0, 0, 0.1)',
                        overlay: 'rgba(0, 0, 0, 0.5)',
                        visualBackground: '#f0f0f0',
                        particleColors: ['#3a86ff', '#8338ec', '#ff006e', '#ffbe0b', '#38b000']
                    },
                    dark: {
                        background: '#212529',
                        surface: '#343a40',
                        primary: '#3a86ff',
                        secondary: '#8338ec',
                        text: '#f8f9fa',
                        textSecondary: '#adb5bd',
                        accent: '#ff006e',
                        success: '#38b000',
                        warning: '#ffbe0b',
                        error: '#e5383b',
                        info: '#00b4d8',
                        border: '#495057',
                        shadow: 'rgba(0, 0, 0, 0.3)',
                        overlay: 'rgba(0, 0, 0, 0.7)',
                        visualBackground: '#1a1a1a',
                        particleColors: ['#3a86ff', '#8338ec', '#ff006e', '#ffbe0b', '#38b000']
                    }
                },
                accents: {
                    blue: {
                        primary: '#3a86ff',
                        secondary: '#8338ec',
                        accent: '#ff006e'
                    },
                    purple: {
                        primary: '#8338ec',
                        secondary: '#3a86ff',
                        accent: '#ff006e'
                    },
                    pink: {
                        primary: '#ff006e',
                        secondary: '#8338ec',
                        accent: '#3a86ff'
                    },
                    green: {
                        primary: '#38b000',
                        secondary: '#3a86ff',
                        accent: '#ffbe0b'
                    },
                    amber: {
                        primary: '#ffbe0b',
                        secondary: '#ff006e',
                        accent: '#3a86ff'
                    },
                    teal: {
                        primary: '#00b4d8',
                        secondary: '#3a86ff',
                        accent: '#ff006e'
                    }
                },
                fonts: {
                    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
                    secondary: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
                    monospace: "'Fira Code', 'SF Mono', 'Roboto Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
                },
                borderRadius: '8px',
                transitions: {
                    fast: '0.15s ease',
                    normal: '0.3s ease',
                    slow: '0.5s ease'
                },
                spacing: {
                    xs: '4px',
                    sm: '8px',
                    md: '16px',
                    lg: '24px',
                    xl: '32px',
                    xxl: '48px'
                },
                visualEffects: {
                    particleDensity: 1.0,
                    animationSpeed: 1.0,
                    glowIntensity: 1.0,
                    blurAmount: '10px',
                    useBlur: true,
                    useGlow: true
                }
            },
            minimal: {
                name: 'Minimal',
                description: 'A minimalist theme with subtle colors and clean lines',
                modes: {
                    light: {
                        background: '#ffffff',
                        surface: '#f8f9fa',
                        primary: '#0077b6',
                        secondary: '#0096c7',
                        text: '#212529',
                        textSecondary: '#6c757d',
                        accent: '#ef476f',
                        success: '#06d6a0',
                        warning: '#ffd166',
                        error: '#ef476f',
                        info: '#118ab2',
                        border: '#dee2e6',
                        shadow: 'rgba(0, 0, 0, 0.05)',
                        overlay: 'rgba(0, 0, 0, 0.3)',
                        visualBackground: '#f8f9fa',
                        particleColors: ['#0077b6', '#0096c7', '#ef476f', '#06d6a0', '#ffd166']
                    },
                    dark: {
                        background: '#121212',
                        surface: '#1e1e1e',
                        primary: '#0096c7',
                        secondary: '#0077b6',
                        text: '#f8f9fa',
                        textSecondary: '#adb5bd',
                        accent: '#ef476f',
                        success: '#06d6a0',
                        warning: '#ffd166',
                        error: '#ef476f',
                        info: '#118ab2',
                        border: '#333333',
                        shadow: 'rgba(0, 0, 0, 0.2)',
                        overlay: 'rgba(0, 0, 0, 0.5)',
                        visualBackground: '#121212',
                        particleColors: ['#0096c7', '#0077b6', '#ef476f', '#06d6a0', '#ffd166']
                    }
                },
                accents: {
                    blue: {
                        primary: '#0077b6',
                        secondary: '#0096c7',
                        accent: '#ef476f'
                    },
                    teal: {
                        primary: '#06d6a0',
                        secondary: '#118ab2',
                        accent: '#ef476f'
                    },
                    amber: {
                        primary: '#ffd166',
                        secondary: '#06d6a0',
                        accent: '#ef476f'
                    },
                    rose: {
                        primary: '#ef476f',
                        secondary: '#118ab2',
                        accent: '#06d6a0'
                    },
                    slate: {
                        primary: '#6c757d',
                        secondary: '#495057',
                        accent: '#ef476f'
                    },
                    indigo: {
                        primary: '#6610f2',
                        secondary: '#6f42c1',
                        accent: '#e83e8c'
                    }
                },
                fonts: {
                    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
                    secondary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
                    monospace: "'SF Mono', 'Roboto Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
                },
                borderRadius: '4px',
                transitions: {
                    fast: '0.1s ease',
                    normal: '0.2s ease',
                    slow: '0.3s ease'
                },
                spacing: {
                    xs: '4px',
                    sm: '8px',
                    md: '16px',
                    lg: '24px',
                    xl: '32px',
                    xxl: '48px'
                },
                visualEffects: {
                    particleDensity: 0.7,
                    animationSpeed: 0.8,
                    glowIntensity: 0.5,
                    blurAmount: '5px',
                    useBlur: true,
                    useGlow: false
                }
            },
            vibrant: {
                name: 'Vibrant',
                description: 'A bold, colorful theme with high contrast and vibrant colors',
                modes: {
                    light: {
                        background: '#ffffff',
                        surface: '#f8f9fa',
                        primary: '#6200ee',
                        secondary: '#03dac6',
                        text: '#000000',
                        textSecondary: '#555555',
                        accent: '#ff0266',
                        success: '#00c853',
                        warning: '#ffab00',
                        error: '#b00020',
                        info: '#2196f3',
                        border: '#e0e0e0',
                        shadow: 'rgba(0, 0, 0, 0.15)',
                        overlay: 'rgba(0, 0, 0, 0.4)',
                        visualBackground: '#f0f0f0',
                        particleColors: ['#6200ee', '#03dac6', '#ff0266', '#ffab00', '#00c853']
                    },
                    dark: {
                        background: '#121212',
                        surface: '#1e1e1e',
                        primary: '#bb86fc',
                        secondary: '#03dac6',
                        text: '#ffffff',
                        textSecondary: '#bbbbbb',
                        accent: '#ff0266',
                        success: '#00c853',
                        warning: '#ffab00',
                        error: '#cf6679',
                        info: '#2196f3',
                        border: '#333333',
                        shadow: 'rgba(0, 0, 0, 0.3)',
                        overlay: 'rgba(0, 0, 0, 0.6)',
                        visualBackground: '#121212',
                        particleColors: ['#bb86fc', '#03dac6', '#ff0266', '#ffab00', '#00c853']
                    }
                },
                accents: {
                    purple: {
                        primary: '#6200ee',
                        secondary: '#03dac6',
                        accent: '#ff0266'
                    },
                    teal: {
                        primary: '#03dac6',
                        secondary: '#6200ee',
                        accent: '#ff0266'
                    },
                    pink: {
                        primary: '#ff0266',
                        secondary: '#6200ee',
                        accent: '#03dac6'
                    },
                    amber: {
                        primary: '#ffab00',
                        secondary: '#03dac6',
                        accent: '#ff0266'
                    },
                    green: {
                        primary: '#00c853',
                        secondary: '#6200ee',
                        accent: '#ff0266'
                    },
                    blue: {
                        primary: '#2196f3',
                        secondary: '#03dac6',
                        accent: '#ff0266'
                    }
                },
                fonts: {
                    primary: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
                    secondary: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
                    monospace: "'Fira Code', 'SF Mono', 'Roboto Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
                },
                borderRadius: '12px',
                transitions: {
                    fast: '0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    normal: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    slow: '0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                },
                spacing: {
                    xs: '4px',
                    sm: '8px',
                    md: '16px',
                    lg: '24px',
                    xl: '32px',
                    xxl: '48px'
                },
                visualEffects: {
                    particleDensity: 1.3,
                    animationSpeed: 1.2,
                    glowIntensity: 1.5,
                    blurAmount: '15px',
                    useBlur: true,
                    useGlow: true
                }
            },
            retro: {
                name: 'Retro',
                description: 'A nostalgic theme inspired by retro computing and synthwave aesthetics',
                modes: {
                    light: {
                        background: '#f0ead6',
                        surface: '#ffffff',
                        primary: '#ff6b6b',
                        secondary: '#4ecdc4',
                        text: '#333333',
                        textSecondary: '#666666',
                        accent: '#a64ac9',
                        success: '#17c3b2',
                        warning: '#ffcb77',
                        error: '#fe5f55',
                        info: '#3d84a8',
                        border: '#ddd6c1',
                        shadow: 'rgba(0, 0, 0, 0.1)',
                        overlay: 'rgba(0, 0, 0, 0.4)',
                        visualBackground: '#f0ead6',
                        particleColors: ['#ff6b6b', '#4ecdc4', '#a64ac9', '#ffcb77', '#17c3b2']
                    },
                    dark: {
                        background: '#2b2b2b',
                        surface: '#3b3b3b',
                        primary: '#ff6b6b',
                        secondary: '#4ecdc4',
                        text: '#f0ead6',
                        textSecondary: '#cccccc',
                        accent: '#a64ac9',
                        success: '#17c3b2',
                        warning: '#ffcb77',
                        error: '#fe5f55',
                        info: '#3d84a8',
                        border: '#4b4b4b',
                        shadow: 'rgba(0, 0, 0, 0.3)',
                        overlay: 'rgba(0, 0, 0, 0.6)',
                        visualBackground: '#2b2b2b',
                        particleColors: ['#ff6b6b', '#4ecdc4', '#a64ac9', '#ffcb77', '#17c3b2']
                    }
                },
                accents: {
                    red: {
                        primary: '#ff6b6b',
                        secondary: '#4ecdc4',
                        accent: '#a64ac9'
                    },
                    teal: {
                        primary: '#4ecdc4',
                        secondary: '#ff6b6b',
                        accent: '#a64ac9'
                    },
                    purple: {
                        primary: '#a64ac9',
                        secondary: '#4ecdc4',
                        accent: '#ff6b6b'
                    },
                    amber: {
                        primary: '#ffcb77',
                        secondary: '#4ecdc4',
                        accent: '#a64ac9'
                    },
                    blue: {
                        primary: '#3d84a8',
                        secondary: '#ff6b6b',
                        accent: '#a64ac9'
                    }
                },
                fonts: {
                    primary: "'VT323', 'Courier New', monospace",
                    secondary: "'Press Start 2P', 'Courier New', monospace",
                    monospace: "'VT323', 'Courier New', monospace"
                },
                borderRadius: '2px',
                transitions: {
                    fast: '0.1s step-end',
                    normal: '0.2s step-end',
                    slow: '0.3s step-end'
                },
                spacing: {
                    xs: '4px',
                    sm: '8px',
                    md: '16px',
                    lg: '24px',
                    xl: '32px',
                    xxl: '48px'
                },
                visualEffects: {
                    particleDensity: 1.0,
                    animationSpeed: 0.8,
                    glowIntensity: 1.8,
                    blurAmount: '2px',
                    useBlur: false,
                    useGlow: true
                }
            },
            nature: {
                name: 'Nature',
                description: 'A calming theme inspired by natural elements and organic colors',
                modes: {
                    light: {
                        background: '#f5f5f5',
                        surface: '#ffffff',
                        primary: '#588157',
                        secondary: '#3a5a40',
                        text: '#344e41',
                        textSecondary: '#6c757d',
                        accent: '#a3b18a',
                        success: '#588157',
                        warning: '#dad7cd',
                        error: '#bc4749',
                        info: '#457b9d',
                        border: '#dad7cd',
                        shadow: 'rgba(0, 0, 0, 0.1)',
                        overlay: 'rgba(0, 0, 0, 0.3)',
                        visualBackground: '#f5f5f5',
                        particleColors: ['#588157', '#3a5a40', '#a3b18a', '#dad7cd', '#457b9d']
                    },
                    dark: {
                        background: '#1b1b1b',
                        surface: '#2b2b2b',
                        primary: '#588157',
                        secondary: '#3a5a40',
                        text: '#dad7cd',
                        textSecondary: '#adb5bd',
                        accent: '#a3b18a',
                        success: '#588157',
                        warning: '#dad7cd',
                        error: '#bc4749',
                        info: '#457b9d',
                        border: '#3a5a40',
                        shadow: 'rgba(0, 0, 0, 0.2)',
                        overlay: 'rgba(0, 0, 0, 0.5)',
                        visualBackground: '#1b1b1b',
                        particleColors: ['#588157', '#3a5a40', '#a3b18a', '#dad7cd', '#457b9d']
                    }
                },
                accents: {
                    green: {
                        primary: '#588157',
                        secondary: '#3a5a40',
                        accent: '#a3b18a'
                    },
                    sage: {
                        primary: '#a3b18a',
                        secondary: '#588157',
                        accent: '#3a5a40'
                    },
                    forest: {
                        primary: '#3a5a40',
                        secondary: '#588157',
                        accent: '#a3b18a'
                    },
                    earth: {
                        primary: '#6b705c',
                        secondary: '#588157',
                        accent: '#a3b18a'
                    },
                    stone: {
                        primary: '#dad7cd',
                        secondary: '#3a5a40',
                        accent: '#588157'
                    }
                },
                fonts: {
                    primary: "'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
                    secondary: "'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
                    monospace: "'Fira Code', 'SF Mono', 'Roboto Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
                },
                borderRadius: '16px',
                transitions: {
                    fast: '0.2s ease-in-out',
                    normal: '0.4s ease-in-out',
                    slow: '0.6s ease-in-out'
                },
                spacing: {
                    xs: '4px',
                    sm: '8px',
                    md: '16px',
                    lg: '24px',
                    xl: '32px',
                    xxl: '48px'
                },
                visualEffects: {
                    particleDensity: 0.8,
                    animationSpeed: 0.7,
                    glowIntensity: 0.6,
                    blurAmount: '8px',
                    useBlur: true,
                    useGlow: false
                }
            },
            futuristic: {
                name: 'Futuristic',
                description: 'A sleek, high-tech theme with a sci-fi aesthetic',
                modes: {
                    light: {
                        background: '#f0f2f5',
                        surface: '#ffffff',
                        primary: '#00bcd4',
                        secondary: '#7c4dff',
                        text: '#263238',
                        textSecondary: '#607d8b',
                        accent: '#ff4081',
                        success: '#00e676',
                        warning: '#ffea00',
                        error: '#ff1744',
                        info: '#00b0ff',
                        border: '#e0e0e0',
                        shadow: 'rgba(0, 0, 0, 0.1)',
                        overlay: 'rgba(0, 0, 0, 0.4)',
                        visualBackground: '#f0f2f5',
                        particleColors: ['#00bcd4', '#7c4dff', '#ff4081', '#00e676', '#00b0ff']
                    },
                    dark: {
                        background: '#0a0a0a',
                        surface: '#1a1a1a',
                        primary: '#00bcd4',
                        secondary: '#7c4dff',
                        text: '#eceff1',
                        textSecondary: '#b0bec5',
                        accent: '#ff4081',
                        success: '#00e676',
                        warning: '#ffea00',
                        error: '#ff1744',
                        info: '#00b0ff',
                        border: '#2a2a2a',
                        shadow: 'rgba(0, 0, 0, 0.3)',
                        overlay: 'rgba(0, 0, 0, 0.6)',
                        visualBackground: '#0a0a0a',
                        particleColors: ['#00bcd4', '#7c4dff', '#ff4081', '#00e676', '#00b0ff']
                    }
                },
                accents: {
                    cyan: {
                        primary: '#00bcd4',
                        secondary: '#7c4dff',
                        accent: '#ff4081'
                    },
                    purple: {
                        primary: '#7c4dff',
                        secondary: '#00bcd4',
                        accent: '#ff4081'
                    },
                    pink: {
                        primary: '#ff4081',
                        secondary: '#7c4dff',
                        accent: '#00bcd4'
                    },
                    green: {
                        primary: '#00e676',
                        secondary: '#00bcd4',
                        accent: '#ff4081'
                    },
                    blue: {
                        primary: '#00b0ff',
                        secondary: '#7c4dff',
                        accent: '#ff4081'
                    }
                },
                fonts: {
                    primary: "'Exo 2', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
                    secondary: "'Rajdhani', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
                    monospace: "'JetBrains Mono', 'Fira Code', 'SF Mono', 'Roboto Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
                },
                borderRadius: '4px',
                transitions: {
                    fast: '0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                    normal: '0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    slow: '0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                },
                spacing: {
                    xs: '4px',
                    sm: '8px',
                    md: '16px',
                    lg: '24px',
                    xl: '32px',
                    xxl: '48px'
                },
                visualEffects: {
                    particleDensity: 1.2,
                    animationSpeed: 1.3,
                    glowIntensity: 1.5,
                    blurAmount: '12px',
                    useBlur: true,
                    useGlow: true
                }
            }
        };
        
        // Font loading status
        this.fontsLoaded = {
            'Inter': false,
            'Poppins': false,
            'Montserrat': false,
            'Quicksand': false,
            'Exo 2': false,
            'Rajdhani': false,
            'VT323': false,
            'Press Start 2P': false,
            'Fira Code': false,
            'JetBrains Mono': false
        };
        
        // Initialize event listeners
        this.setupEventListeners();
    }
    
    /**
     * Initialize the theme system
     */
    init() {
        // Load saved theme preferences
        this.loadSavedPreferences();
        
        // Apply current theme
        this.applyTheme();
        
        // Preload fonts
        this.preloadFonts();
        
        console.log('Theme System initialized');
        
        // Publish theme initialized event
        eventSystem.publish('theme-system-initialized', {
            theme: this.currentTheme,
            mode: this.currentMode,
            accent: this.currentAccent
        });
        
        return true;
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for theme change events
        eventSystem.subscribe('theme-change', (data) => {
            this.setTheme(data.theme);
        });
        
        // Listen for mode change events
        eventSystem.subscribe('mode-change', (data) => {
            this.setMode(data.mode);
        });
        
        // Listen for accent change events
        eventSystem.subscribe('accent-change', (data) => {
            this.setAccent(data.accent);
        });
        
        // Listen for custom theme events
        eventSystem.subscribe('custom-theme-update', (data) => {
            this.updateCustomTheme(data.theme);
        });
        
        // Listen for theme reset events
        eventSystem.subscribe('theme-reset', () => {
            this.resetTheme();
        });
        
        // Listen for system preference changes
        if (window.matchMedia) {
            const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            // Set initial mode based on system preference if not already set
            if (!localStorage.getItem('meai-theme-mode')) {
                this.currentMode = darkModeMediaQuery.matches ? 'dark' : 'light';
            }
            
            // Listen for changes
            try {
                // Chrome & Firefox
                darkModeMediaQuery.addEventListener('change', (e) => {
                    if (!localStorage.getItem('meai-theme-mode')) {
                        this.setMode(e.matches ? 'dark' : 'light');
                    }
                });
            } catch (error) {
                try {
                    // Safari
                    darkModeMediaQuery.addListener((e) => {
                        if (!localStorage.getItem('meai-theme-mode')) {
                            this.setMode(e.matches ? 'dark' : 'light');
                        }
                    });
                } catch (error2) {
                    console.warn('Could not add listener for dark mode changes', error2);
                }
            }
        }
    }
    
    /**
     * Load saved theme preferences from localStorage
     */
    loadSavedPreferences() {
        try {
            // Load theme
            const savedTheme = localStorage.getItem('meai-theme');
            if (savedTheme) {
                this.currentTheme = savedTheme;
            }
            
            // Load mode
            const savedMode = localStorage.getItem('meai-theme-mode');
            if (savedMode) {
                this.currentMode = savedMode;
            }
            
            // Load accent
            const savedAccent = localStorage.getItem('meai-theme-accent');
            if (savedAccent) {
                this.currentAccent = savedAccent;
            }
            
            // Load custom theme
            const savedCustomTheme = localStorage.getItem('meai-custom-theme');
            if (savedCustomTheme) {
                try {
                    this.customTheme = JSON.parse(savedCustomTheme);
                } catch (error) {
                    console.error('Error parsing saved custom theme:', error);
                    this.customTheme = null;
                }
            }
            
            console.log('Loaded theme preferences:', {
                theme: this.currentTheme,
                mode: this.currentMode,
                accent: this.currentAccent,
                hasCustomTheme: !!this.customTheme
            });
        } catch (error) {
            console.error('Error loading saved theme preferences:', error);
        }
    }
    
    /**
     * Save current theme preferences to localStorage
     */
    savePreferences() {
        try {
            localStorage.setItem('meai-theme', this.currentTheme);
            localStorage.setItem('meai-theme-mode', this.currentMode);
            localStorage.setItem('meai-theme-accent', this.currentAccent);
            
            if (this.customTheme) {
                localStorage.setItem('meai-custom-theme', JSON.stringify(this.customTheme));
            } else {
                localStorage.removeItem('meai-custom-theme');
            }
        } catch (error) {
            console.error('Error saving theme preferences:', error);
        }
    }
    
    /**
     * Preload fonts used by themes
     */
    preloadFonts() {
        // List of fonts to preload
        const fontsToLoad = [
            { family: 'Inter', weights: [400, 500, 600, 700] },
            { family: 'Poppins', weights: [400, 500, 600, 700] },
            { family: 'Montserrat', weights: [400, 500, 600, 700] },
            { family: 'Quicksand', weights: [400, 500, 600, 700] },
            { family: 'Exo 2', weights: [400, 500, 600, 700] },
            { family: 'Rajdhani', weights: [400, 500, 600, 700] },
            { family: 'VT323', weights: [400] },
            { family: 'Press Start 2P', weights: [400] },
            { family: 'Fira Code', weights: [400, 500] },
            { family: 'JetBrains Mono', weights: [400, 500] }
        ];
        
        // Check if the browser supports the Font Loading API
        if ('FontFace' in window) {
            // Load each font
            for (const font of fontsToLoad) {
                for (const weight of font.weights) {
                    const fontFace = new FontFace(
                        font.family,
                        `url(https://fonts.googleapis.com/css2?family=${font.family.replace(' ', '+')}:wght@${weight}&display=swap)`
                    );
                    
                    fontFace.load().then(
                        (loadedFace) => {
                            document.fonts.add(loadedFace);
                            this.fontsLoaded[font.family] = true;
                            console.log(`Loaded font: ${font.family} (${weight})`);
                        },
                        (error) => {
                            console.error(`Error loading font ${font.family} (${weight}):`, error);
                        }
                    );
                }
            }
        } else {
            // Fallback for browsers without Font Loading API
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Quicksand:wght@400;500;600;700&family=Exo+2:wght@400;500;600;700&family=Rajdhani:wght@400;500;600;700&family=VT323&family=Press+Start+2P&family=Fira+Code:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap';
            document.head.appendChild(link);
            
            // Mark all fonts as loaded after a delay
            setTimeout(() => {
                for (const font in this.fontsLoaded) {
                    this.fontsLoaded[font] = true;
                }
            }, 2000);
        }
    }
    
    /**
     * Set the current theme
     * @param {string} themeName - Theme name
     * @returns {boolean} Success
     */
    setTheme(themeName) {
        // Check if theme exists
        if (themeName === 'custom') {
            if (!this.customTheme) {
                console.warn('Custom theme not defined');
                return false;
            }
        } else if (!this.themes[themeName]) {
            console.warn(`Theme not found: ${themeName}`);
            return false;
        }
        
        // Update current theme
        this.currentTheme = themeName;
        
        // Apply theme
        this.applyTheme();
        
        // Save preferences
        this.savePreferences();
        
        console.log(`Theme set to ${themeName}`);
        
        // Publish theme change event
        eventSystem.publish('theme-changed', {
            theme: themeName,
            mode: this.currentMode,
            accent: this.currentAccent
        });
        
        return true;
    }
    
    /**
     * Set the current mode (light/dark)
     * @param {string} mode - Mode name
     * @returns {boolean} Success
     */
    setMode(mode) {
        // Check if mode is valid
        if (mode !== 'light' && mode !== 'dark') {
            console.warn(`Invalid mode: ${mode}`);
            return false;
        }
        
        // Update current mode
        this.currentMode = mode;
        
        // Apply theme
        this.applyTheme();
        
        // Save preferences
        this.savePreferences();
        
        console.log(`Mode set to ${mode}`);
        
        // Publish mode change event
        eventSystem.publish('mode-changed', {
            theme: this.currentTheme,
            mode: mode,
            accent: this.currentAccent
        });
        
        return true;
    }
    
    /**
     * Set the current accent color
     * @param {string} accent - Accent name
     * @returns {boolean} Success
     */
    setAccent(accent) {
        // Get current theme
        const theme = this.currentTheme === 'custom' ? 
            this.customTheme : 
            this.themes[this.currentTheme];
        
        // Check if accent exists
        if (!theme.accents[accent]) {
            console.warn(`Accent not found in theme ${this.currentTheme}: ${accent}`);
            return false;
        }
        
        // Update current accent
        this.currentAccent = accent;
        
        // Apply theme
        this.applyTheme();
        
        // Save preferences
        this.savePreferences();
        
        console.log(`Accent set to ${accent}`);
        
        // Publish accent change event
        eventSystem.publish('accent-changed', {
            theme: this.currentTheme,
            mode: this.currentMode,
            accent: accent
        });
        
        return true;
    }
    
    /**
     * Update custom theme
     * @param {Object} themeData - Custom theme data
     * @returns {boolean} Success
     */
    updateCustomTheme(themeData) {
        try {
            // Validate theme data
            if (!themeData || !themeData.modes || !themeData.accents) {
                console.warn('Invalid custom theme data');
                return false;
            }
            
            // Update custom theme
            this.customTheme = themeData;
            
            // Switch to custom theme if not already
            if (this.currentTheme !== 'custom') {
                this.currentTheme = 'custom';
            }
            
            // Apply theme
            this.applyTheme();
            
            // Save preferences
            this.savePreferences();
            
            console.log('Custom theme updated');
            
            // Publish custom theme update event
            eventSystem.publish('custom-theme-updated', {
                theme: 'custom',
                mode: this.currentMode,
                accent: this.currentAccent
            });
            
            return true;
        } catch (error) {
            console.error('Error updating custom theme:', error);
            return false;
        }
    }
    
    /**
     * Reset theme to default
     * @returns {boolean} Success
     */
    resetTheme() {
        // Reset to default theme
        this.currentTheme = 'default';
        this.currentMode = 'light';
        this.currentAccent = 'blue';
        this.customTheme = null;
        
        // Apply theme
        this.applyTheme();
        
        // Save preferences
        this.savePreferences();
        
        console.log('Theme reset to default');
        
        // Publish theme reset event
        eventSystem.publish('theme-reset-complete', {
            theme: this.currentTheme,
            mode: this.currentMode,
            accent: this.currentAccent
        });
        
        return true;
    }
    
    /**
     * Apply the current theme to the document
     */
    applyTheme() {
        // Get current theme
        const theme = this.currentTheme === 'custom' ? 
            this.customTheme : 
            this.themes[this.currentTheme];
        
        if (!theme) {
            console.error(`Theme not found: ${this.currentTheme}`);
            return false;
        }
        
        // Get current mode
        const mode = theme.modes[this.currentMode];
        
        if (!mode) {
            console.error(`Mode not found in theme ${this.currentTheme}: ${this.currentMode}`);
            return false;
        }
        
        // Get current accent
        const accent = theme.accents[this.currentAccent];
        
        if (!accent) {
            console.error(`Accent not found in theme ${this.currentTheme}: ${this.currentAccent}`);
            return false;
        }
        
        // Create CSS variables
        const cssVars = {
            // Colors
            '--background': mode.background,
            '--surface': mode.surface,
            '--primary': accent.primary,
            '--secondary': accent.secondary,
            '--text': mode.text,
            '--text-secondary': mode.textSecondary,
            '--accent': accent.accent,
            '--success': mode.success,
            '--warning': mode.warning,
            '--error': mode.error,
            '--info': mode.info,
            '--border': mode.border,
            '--shadow': mode.shadow,
            '--overlay': mode.overlay,
            '--visual-background': mode.visualBackground,
            
            // Fonts
            '--font-primary': theme.fonts.primary,
            '--font-secondary': theme.fonts.secondary,
            '--font-monospace': theme.fonts.monospace,
            
            // Border radius
            '--border-radius': theme.borderRadius,
            
            // Transitions
            '--transition-fast': theme.transitions.fast,
            '--transition-normal': theme.transitions.normal,
            '--transition-slow': theme.transitions.slow,
            
            // Spacing
            '--spacing-xs': theme.spacing.xs,
            '--spacing-sm': theme.spacing.sm,
            '--spacing-md': theme.spacing.md,
            '--spacing-lg': theme.spacing.lg,
            '--spacing-xl': theme.spacing.xl,
            '--spacing-xxl': theme.spacing.xxl,
            
            // Visual effects
            '--particle-density': theme.visualEffects.particleDensity,
            '--animation-speed': theme.visualEffects.animationSpeed,
            '--glow-intensity': theme.visualEffects.glowIntensity,
            '--blur-amount': theme.visualEffects.blurAmount,
            '--use-blur': theme.visualEffects.useBlur ? '1' : '0',
            '--use-glow': theme.visualEffects.useGlow ? '1' : '0'
        };
        
        // Apply CSS variables to root element
        const root = document.documentElement;
        
        for (const [key, value] of Object.entries(cssVars)) {
            root.style.setProperty(key, value);
        }
        
        // Apply color scheme to meta tag
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        metaThemeColor.content = accent.primary;
        
        // Apply color scheme to body
        document.body.setAttribute('data-theme', this.currentTheme);
        document.body.setAttribute('data-mode', this.currentMode);
        document.body.setAttribute('data-accent', this.currentAccent);
        
        // Apply particle colors
        if (mode.particleColors && mode.particleColors.length > 0) {
            eventSystem.publish('particle-colors-changed', {
                colors: mode.particleColors
            });
        }
        
        // Apply visual effects settings
        eventSystem.publish('visual-effects-changed', {
            particleDensity: theme.visualEffects.particleDensity,
            animationSpeed: theme.visualEffects.animationSpeed,
            glowIntensity: theme.visualEffects.glowIntensity,
            blurAmount: theme.visualEffects.blurAmount,
            useBlur: theme.visualEffects.useBlur,
            useGlow: theme.visualEffects.useGlow
        });
        
        return true;
    }
    
    /**
     * Get the current theme data
     * @returns {Object} Theme data
     */
    getCurrentTheme() {
        // Get current theme
        const theme = this.currentTheme === 'custom' ? 
            this.customTheme : 
            this.themes[this.currentTheme];
        
        if (!theme) {
            console.error(`Theme not found: ${this.currentTheme}`);
            return null;
        }
        
        // Get current mode
        const mode = theme.modes[this.currentMode];
        
        if (!mode) {
            console.error(`Mode not found in theme ${this.currentTheme}: ${this.currentMode}`);
            return null;
        }
        
        // Get current accent
        const accent = theme.accents[this.currentAccent];
        
        if (!accent) {
            console.error(`Accent not found in theme ${this.currentTheme}: ${this.currentAccent}`);
            return null;
        }
        
        // Return combined theme data
        return {
            name: theme.name,
            description: theme.description,
            colors: {
                ...mode,
                ...accent
            },
            fonts: theme.fonts,
            borderRadius: theme.borderRadius,
            transitions: theme.transitions,
            spacing: theme.spacing,
            visualEffects: theme.visualEffects
        };
    }
    
    /**
     * Get all available themes
     * @returns {Object} Available themes
     */
    getAvailableThemes() {
        const availableThemes = {};
        
        // Add built-in themes
        for (const [key, theme] of Object.entries(this.themes)) {
            availableThemes[key] = {
                name: theme.name,
                description: theme.description
            };
        }
        
        // Add custom theme if available
        if (this.customTheme) {
            availableThemes.custom = {
                name: this.customTheme.name || 'Custom',
                description: this.customTheme.description || 'Your custom theme'
            };
        }
        
        return availableThemes;
    }
    
    /**
     * Get all available modes for the current theme
     * @returns {Array} Available modes
     */
    getAvailableModes() {
        // Get current theme
        const theme = this.currentTheme === 'custom' ? 
            this.customTheme : 
            this.themes[this.currentTheme];
        
        if (!theme) {
            console.error(`Theme not found: ${this.currentTheme}`);
            return [];
        }
        
        return Object.keys(theme.modes);
    }
    
    /**
     * Get all available accents for the current theme
     * @returns {Array} Available accents
     */
    getAvailableAccents() {
        // Get current theme
        const theme = this.currentTheme === 'custom' ? 
            this.customTheme : 
            this.themes[this.currentTheme];
        
        if (!theme) {
            console.error(`Theme not found: ${this.currentTheme}`);
            return [];
        }
        
        return Object.keys(theme.accents);
    }
    
    /**
     * Create a new custom theme based on an existing theme
     * @param {string} basedOn - Base theme name
     * @param {string} name - Custom theme name
     * @param {string} description - Custom theme description
     * @returns {Object} Custom theme data
     */
    createCustomTheme(basedOn = 'default', name = 'Custom', description = 'My custom theme') {
        // Get base theme
        const baseTheme = this.themes[basedOn];
        
        if (!baseTheme) {
            console.error(`Base theme not found: ${basedOn}`);
            return null;
        }
        
        // Create custom theme by cloning base theme
        const customTheme = JSON.parse(JSON.stringify(baseTheme));
        
        // Update name and description
        customTheme.name = name;
        customTheme.description = description;
        
        // Update custom theme
        this.customTheme = customTheme;
        
        // Switch to custom theme
        this.currentTheme = 'custom';
        
        // Apply theme
        this.applyTheme();
        
        // Save preferences
        this.savePreferences();
        
        console.log(`Custom theme created based on ${basedOn}`);
        
        // Publish custom theme created event
        eventSystem.publish('custom-theme-created', {
            theme: 'custom',
            basedOn: basedOn,
            mode: this.currentMode,
            accent: this.currentAccent
        });
        
        return customTheme;
    }
    
    /**
     * Update a specific color in the custom theme
     * @param {string} colorName - Color name
     * @param {string} colorValue - Color value
     * @param {string} mode - Mode to update (light/dark)
     * @returns {boolean} Success
     */
    updateCustomThemeColor(colorName, colorValue, mode = null) {
        // Check if custom theme exists
        if (!this.customTheme) {
            console.warn('Custom theme not defined');
            return false;
        }
        
        try {
            // Determine which mode to update
            const modeToUpdate = mode || this.currentMode;
            
            // Check if mode exists
            if (!this.customTheme.modes[modeToUpdate]) {
                console.warn(`Mode not found in custom theme: ${modeToUpdate}`);
                return false;
            }
            
            // Check if color is an accent color
            for (const [accentName, accentColors] of Object.entries(this.customTheme.accents)) {
                if (colorName in accentColors) {
                    this.customTheme.accents[accentName][colorName] = colorValue;
                    
                    // Apply theme
                    this.applyTheme();
                    
                    // Save preferences
                    this.savePreferences();
                    
                    console.log(`Updated accent color ${colorName} in custom theme`);
                    
                    // Publish custom theme updated event
                    eventSystem.publish('custom-theme-updated', {
                        theme: 'custom',
                        mode: this.currentMode,
                        accent: this.currentAccent,
                        updatedColor: colorName
                    });
                    
                    return true;
                }
            }
            
            // Update color in mode
            if (colorName in this.customTheme.modes[modeToUpdate]) {
                this.customTheme.modes[modeToUpdate][colorName] = colorValue;
                
                // Apply theme
                this.applyTheme();
                
                // Save preferences
                this.savePreferences();
                
                console.log(`Updated color ${colorName} in custom theme (${modeToUpdate} mode)`);
                
                // Publish custom theme updated event
                eventSystem.publish('custom-theme-updated', {
                    theme: 'custom',
                    mode: this.currentMode,
                    accent: this.currentAccent,
                    updatedColor: colorName
                });
                
                return true;
            }
            
            console.warn(`Color not found in custom theme: ${colorName}`);
            return false;
        } catch (error) {
            console.error('Error updating custom theme color:', error);
            return false;
        }
    }
    
    /**
     * Generate a theme preview
     * @param {string} themeName - Theme name
     * @param {string} mode - Mode (light/dark)
     * @param {string} accent - Accent name
     * @returns {Object} Theme preview data
     */
    generateThemePreview(themeName, mode = 'light', accent = 'blue') {
        // Get theme
        const theme = themeName === 'custom' ? 
            this.customTheme : 
            this.themes[themeName];
        
        if (!theme) {
            console.error(`Theme not found: ${themeName}`);
            return null;
        }
        
        // Get mode
        const modeData = theme.modes[mode];
        
        if (!modeData) {
            console.error(`Mode not found in theme ${themeName}: ${mode}`);
            return null;
        }
        
        // Get accent
        const accentData = theme.accents[accent];
        
        if (!accentData) {
            console.error(`Accent not found in theme ${themeName}: ${accent}`);
            return null;
        }
        
        // Generate preview data
        return {
            name: theme.name,
            description: theme.description,
            mode: mode,
            accent: accent,
            colors: {
                background: modeData.background,
                surface: modeData.surface,
                primary: accentData.primary,
                secondary: accentData.secondary,
                text: modeData.text,
                textSecondary: modeData.textSecondary,
                accent: accentData.accent,
                success: modeData.success,
                warning: modeData.warning,
                error: modeData.error,
                info: modeData.info,
                border: modeData.border
            },
            fonts: {
                primary: theme.fonts.primary.split(',')[0].replace(/'/g, ''),
                secondary: theme.fonts.secondary.split(',')[0].replace(/'/g, ''),
                monospace: theme.fonts.monospace.split(',')[0].replace(/'/g, '')
            },
            borderRadius: theme.borderRadius,
            visualEffects: theme.visualEffects
        };
    }
    
    /**
     * Generate CSS for a theme
     * @param {string} themeName - Theme name
     * @param {string} mode - Mode (light/dark)
     * @param {string} accent - Accent name
     * @returns {string} CSS code
     */
    generateThemeCSS(themeName, mode = 'light', accent = 'blue') {
        // Get theme preview data
        const preview = this.generateThemePreview(themeName, mode, accent);
        
        if (!preview) {
            return '';
        }
        
        // Generate CSS
        let css = `:root {\n`;
        
        // Add colors
        for (const [key, value] of Object.entries(preview.colors)) {
            css += `  --${key}: ${value};\n`;
        }
        
        // Add fonts
        for (const [key, value] of Object.entries(preview.fonts)) {
            css += `  --font-${key}: '${value}', sans-serif;\n`;
        }
        
        // Add border radius
        css += `  --border-radius: ${preview.borderRadius};\n`;
        
        // Add visual effects
        for (const [key, value] of Object.entries(preview.visualEffects)) {
            const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            css += `  --${cssKey}: ${value}${typeof value === 'string' ? '' : ''};\n`;
        }
        
        css += `}\n\n`;
        
        // Add body styles
        css += `body {\n`;
        css += `  background-color: var(--background);\n`;
        css += `  color: var(--text);\n`;
        css += `  font-family: var(--font-primary);\n`;
        css += `}\n`;
        
        return css;
    }
}

// Export the class
export default new ThemeSystem();
