/**
 * 3D Visualization Integration
 * 
 * This module integrates the 3D pixel visualization system with the existing MeAI application,
 * handling initialization, fallback mechanisms, and communication with other components.
 */

import PixelVisualization3D from './pixel-visualization-3d.js';
import ModelLoader from './3d-model-loader.js';
import ShaderEffects from './shader-effects.js';
import PerformanceOptimizer from './performance-optimizer.js';

class VisualizationIntegration {
    constructor() {
        // Dependencies
        this.eventSystem = window.eventSystem;
        this.storageManager = window.storageManager;
        
        // Components
        this.visualization = null;
        this.modelLoader = null;
        this.performanceOptimizer = null;
        
        // State
        this.isInitialized = false;
        this.is3DSupported = false;
        this.currentState = 'neutral';
        this.fallbackMode = false;
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize the visualization system
     */
    async init() {
        // Check for WebGL support
        this.is3DSupported = PixelVisualization3D.isCompatible();
        
        if (this.is3DSupported) {
            try {
                // Initialize performance optimizer
                this.performanceOptimizer = new PerformanceOptimizer();
                
                // Initialize model loader
                this.modelLoader = new ModelLoader();
                
                // Initialize 3D visualization
                this.visualization = new PixelVisualization3D();
                
                // Set up event listeners
                this.setupEventListeners();
                
                this.isInitialized = true;
                
                // Publish initialization success event
                this.eventSystem.publish('3d-visualization-initialized', {
                    success: true
                });
                
                console.log('3D Visualization system initialized successfully');
            } catch (error) {
                console.error('Error initializing 3D Visualization:', error);
                this.fallbackToLegacyMode(error);
            }
        } else {
            console.warn('WebGL not supported, falling back to legacy visualization');
            this.fallbackToLegacyMode(new Error('WebGL not supported'));
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for emotional state changes
        this.eventSystem.subscribe('emotional-state-change', (data) => {
            this.setEmotionalState(data.state, data.intensity || 1.0);
        });
        
        // Listen for listening state changes
        this.eventSystem.subscribe('listening-state-change', (data) => {
            this.setListeningState(data.isListening);
        });
        
        // Listen for speaking state changes
        this.eventSystem.subscribe('speaking-state-change', (data) => {
            this.setSpeakingState(data.isSpeaking);
        });
        
        // Listen for theme changes
        this.eventSystem.subscribe('theme-change', (data) => {
            this.updateTheme(data.theme);
        });
        
        // Listen for quality setting changes
        this.eventSystem.subscribe('quality-setting-change', (data) => {
            if (this.performanceOptimizer) {
                this.performanceOptimizer.setQuality(data.quality);
            }
        });
        
        // Listen for debug mode toggle
        this.eventSystem.subscribe('debug-mode-change', (data) => {
            if (this.visualization) {
                this.visualization.setDebugMode(data.enabled);
            }
        });
    }
    
    /**
     * Set the emotional state of the visualization
     * @param {string} state - The emotional state to set
     * @param {number} intensity - The intensity of the emotion (0-1)
     */
    setEmotionalState(state, intensity = 1.0) {
        this.currentState = state;
        
        if (this.isInitialized && this.visualization) {
            this.visualization.setEmotionalState(state, intensity);
        } else if (this.fallbackMode) {
            // Publish event for legacy visualization
            this.eventSystem.publish('legacy-emotional-state-change', {
                state: state,
                intensity: intensity
            });
        }
    }
    
    /**
     * Set the listening state of the visualization
     * @param {boolean} isListening - Whether the system is listening
     */
    setListeningState(isListening) {
        if (this.isInitialized && this.visualization) {
            this.visualization.setListeningState(isListening);
        } else if (this.fallbackMode) {
            // Publish event for legacy visualization
            this.eventSystem.publish('legacy-listening-state-change', {
                isListening: isListening
            });
        }
    }
    
    /**
     * Set the speaking state of the visualization
     * @param {boolean} isSpeaking - Whether the system is speaking
     */
    setSpeakingState(isSpeaking) {
        if (this.isInitialized && this.visualization) {
            this.visualization.setSpeakingState(isSpeaking);
        } else if (this.fallbackMode) {
            // Publish event for legacy visualization
            this.eventSystem.publish('legacy-speaking-state-change', {
                isSpeaking: isSpeaking
            });
        }
    }
    
    /**
     * Update the theme of the visualization
     * @param {string} theme - The theme to set
     */
    updateTheme(theme) {
        if (this.isInitialized && this.visualization) {
            this.visualization.updateTheme(theme);
        }
    }
    
    /**
     * Fall back to legacy visualization mode
     * @param {Error} error - The error that caused the fallback
     */
    fallbackToLegacyMode(error) {
        this.fallbackMode = true;
        
        // Clean up any partially initialized 3D components
        this.cleanup();
        
        // Publish fallback event
        this.eventSystem.publish('3d-visualization-fallback', {
            error: error.message,
            currentState: this.currentState
        });
        
        console.warn('Falling back to legacy visualization mode:', error.message);
    }
    
    /**
     * Clean up resources
     */
    cleanup() {
        if (this.visualization) {
            this.visualization.dispose();
            this.visualization = null;
        }
        
        if (this.modelLoader) {
            this.modelLoader.dispose();
            this.modelLoader = null;
        }
        
        this.isInitialized = false;
    }
    
    /**
     * Get the current emotional state
     * @returns {string} The current emotional state
     */
    getCurrentState() {
        return this.currentState;
    }
    
    /**
     * Check if 3D visualization is supported
     * @returns {boolean} Whether 3D visualization is supported
     */
    isSupported() {
        return this.is3DSupported;
    }
    
    /**
     * Check if the system is in fallback mode
     * @returns {boolean} Whether the system is in fallback mode
     */
    isFallbackMode() {
        return this.fallbackMode;
    }
    
    /**
     * Get the performance optimizer
     * @returns {PerformanceOptimizer} The performance optimizer
     */
    getPerformanceOptimizer() {
        return this.performanceOptimizer;
    }
}

// Create and export singleton instance
const visualizationIntegration = new VisualizationIntegration();
export default visualizationIntegration;
