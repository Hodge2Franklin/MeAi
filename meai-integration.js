/**
 * MeAI Feature Integration Module
 * 
 * This module integrates all the advanced features into the main product,
 * ensuring they work together seamlessly.
 */

import { eventSystem } from './src/utils/event-system.js';
import multiLanguageSupport from './src/utils/multi-language-support.js';
import translationSystem from './src/utils/translation-system.js';
import localizedInterfaceComponents from './src/ui/localized-interface-components.js';
import offlineSupport from './src/utils/offline-support.js';
import offlineConversation from './src/conversation/offline-conversation.js';
import advancedAnimationSystem from './src/visual/advanced-animation-system.js';
import enhancedPhysicsSystem from './src/visual/enhanced-physics-system.js';
import proceduralAnimationGenerator from './src/visual/procedural-animation-generator.js';
import interactiveParticleSystem from './src/visual/interactive-particle-system.js';
import voiceRecognitionEnhancement from './src/conversation/voice-recognition-enhancement.js';
import themeSystem from './src/ui/theme-system.js';

class MeAIIntegration {
    constructor() {
        // State
        this.initialized = false;
        this.features = {
            advancedAnimation: false,
            voiceRecognition: false,
            themeSystem: false,
            offlineSupport: false,
            multiLanguage: false
        };
        this.initializationProgress = 0;
        this.initializationTotal = 5; // Total number of feature systems
        
        // Initialize event listeners
        this.setupEventListeners();
    }
    
    /**
     * Initialize all MeAI features
     */
    async init() {
        console.log('Initializing MeAI Integration System');
        
        // Show initialization UI
        this.showInitializationUI();
        
        try {
            // Initialize features in sequence
            await this.initAdvancedAnimation();
            await this.initVoiceRecognition();
            await this.initThemeSystem();
            await this.initOfflineSupport();
            await this.initMultiLanguageSupport();
            
            // Connect features together
            await this.connectFeatures();
            
            // Hide initialization UI
            this.hideInitializationUI();
            
            this.initialized = true;
            console.log('MeAI Integration System initialized successfully');
            
            // Publish initialization complete event
            eventSystem.publish('meai-integration-initialized', {
                features: this.features
            });
            
            return true;
        } catch (error) {
            console.error('Error initializing MeAI Integration System:', error);
            
            // Update initialization UI with error
            this.updateInitializationUI('error', error.message);
            
            return false;
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for feature-specific events
        eventSystem.subscribe('advanced-animation-initialized', () => {
            this.features.advancedAnimation = true;
            this.updateFeatureStatus('advancedAnimation', true);
        });
        
        eventSystem.subscribe('voice-recognition-initialized', () => {
            this.features.voiceRecognition = true;
            this.updateFeatureStatus('voiceRecognition', true);
        });
        
        eventSystem.subscribe('theme-system-initialized', () => {
            this.features.themeSystem = true;
            this.updateFeatureStatus('themeSystem', true);
        });
        
        eventSystem.subscribe('offline-support-initialized', () => {
            this.features.offlineSupport = true;
            this.updateFeatureStatus('offlineSupport', true);
        });
        
        eventSystem.subscribe('language-system-initialized', () => {
            this.features.multiLanguage = true;
            this.updateFeatureStatus('multiLanguage', true);
        });
        
        // Listen for user interaction events
        document.addEventListener('DOMContentLoaded', () => {
            this.setupUserInteractionListeners();
        });
    }
    
    /**
     * Set up user interaction listeners
     */
    setupUserInteractionListeners() {
        // Voice recognition toggle
        const voiceToggle = document.getElementById('voice-recognition-toggle');
        if (voiceToggle) {
            voiceToggle.addEventListener('click', () => {
                if (this.features.voiceRecognition) {
                    eventSystem.publish('toggle-voice-recognition');
                }
            });
        }
        
        // Theme selector
        const themeSelector = document.getElementById('theme-selector');
        if (themeSelector) {
            themeSelector.addEventListener('change', (event) => {
                if (this.features.themeSystem) {
                    eventSystem.publish('change-theme', {
                        theme: event.target.value
                    });
                }
            });
        }
        
        // Language selector
        const languageSelector = document.getElementById('language-selector');
        if (languageSelector) {
            // Language selector will be handled by the localized interface components
            localizedInterfaceComponents.getComponent('language-selector').render('language-selector', {
                showLabel: true,
                useNativeNames: true,
                showFlags: true
            });
        }
        
        // Offline mode indicator
        const offlineIndicator = document.getElementById('offline-indicator');
        if (offlineIndicator) {
            offlineIndicator.addEventListener('click', () => {
                if (this.features.offlineSupport) {
                    const status = offlineSupport.getOfflineStatus();
                    alert(`Offline Status: ${status.isOnline ? 'Online' : 'Offline'}\nPending Messages: ${status.pendingMessages}\nLast Sync: ${status.lastSyncTime || 'Never'}`);
                }
            });
        }
        
        // Animation controls
        const animationControls = document.getElementById('animation-controls');
        if (animationControls) {
            const playButton = animationControls.querySelector('.play-button');
            const pauseButton = animationControls.querySelector('.pause-button');
            const resetButton = animationControls.querySelector('.reset-button');
            
            if (playButton) {
                playButton.addEventListener('click', () => {
                    if (this.features.advancedAnimation) {
                        eventSystem.publish('animation-play');
                    }
                });
            }
            
            if (pauseButton) {
                pauseButton.addEventListener('click', () => {
                    if (this.features.advancedAnimation) {
                        eventSystem.publish('animation-pause');
                    }
                });
            }
            
            if (resetButton) {
                resetButton.addEventListener('click', () => {
                    if (this.features.advancedAnimation) {
                        eventSystem.publish('animation-reset');
                    }
                });
            }
        }
    }
    
    /**
     * Initialize advanced animation system
     */
    async initAdvancedAnimation() {
        this.updateInitializationUI('progress', 'Initializing Advanced Animation System...');
        
        try {
            // Initialize core animation system
            await advancedAnimationSystem.init();
            
            // Initialize physics system
            await enhancedPhysicsSystem.init();
            
            // Initialize procedural animation generator
            await proceduralAnimationGenerator.init();
            
            // Initialize interactive particle system
            await interactiveParticleSystem.init();
            
            this.features.advancedAnimation = true;
            this.updateInitializationProgress();
            
            console.log('Advanced Animation System initialized');
            return true;
        } catch (error) {
            console.error('Error initializing Advanced Animation System:', error);
            throw new Error('Failed to initialize Advanced Animation System: ' + error.message);
        }
    }
    
    /**
     * Initialize voice recognition system
     */
    async initVoiceRecognition() {
        this.updateInitializationUI('progress', 'Initializing Voice Recognition System...');
        
        try {
            // Initialize voice recognition enhancement
            await voiceRecognitionEnhancement.init();
            
            this.features.voiceRecognition = true;
            this.updateInitializationProgress();
            
            console.log('Voice Recognition System initialized');
            return true;
        } catch (error) {
            console.error('Error initializing Voice Recognition System:', error);
            throw new Error('Failed to initialize Voice Recognition System: ' + error.message);
        }
    }
    
    /**
     * Initialize theme system
     */
    async initThemeSystem() {
        this.updateInitializationUI('progress', 'Initializing Theme System...');
        
        try {
            // Initialize theme system
            await themeSystem.init();
            
            this.features.themeSystem = true;
            this.updateInitializationProgress();
            
            console.log('Theme System initialized');
            return true;
        } catch (error) {
            console.error('Error initializing Theme System:', error);
            throw new Error('Failed to initialize Theme System: ' + error.message);
        }
    }
    
    /**
     * Initialize offline support
     */
    async initOfflineSupport() {
        this.updateInitializationUI('progress', 'Initializing Offline Support...');
        
        try {
            // Initialize offline support
            await offlineSupport.init();
            
            // Initialize offline conversation
            await offlineConversation.init();
            
            this.features.offlineSupport = true;
            this.updateInitializationProgress();
            
            console.log('Offline Support initialized');
            return true;
        } catch (error) {
            console.error('Error initializing Offline Support:', error);
            throw new Error('Failed to initialize Offline Support: ' + error.message);
        }
    }
    
    /**
     * Initialize multi-language support
     */
    async initMultiLanguageSupport() {
        this.updateInitializationUI('progress', 'Initializing Multi-language Support...');
        
        try {
            // Initialize multi-language support
            await multiLanguageSupport.init();
            
            // Initialize translation system
            await translationSystem.init();
            
            // Initialize localized interface components
            await localizedInterfaceComponents.init();
            
            this.features.multiLanguage = true;
            this.updateInitializationProgress();
            
            console.log('Multi-language Support initialized');
            return true;
        } catch (error) {
            console.error('Error initializing Multi-language Support:', error);
            throw new Error('Failed to initialize Multi-language Support: ' + error.message);
        }
    }
    
    /**
     * Connect features together
     */
    async connectFeatures() {
        this.updateInitializationUI('progress', 'Connecting features together...');
        
        try {
            // Connect animation system with theme system
            eventSystem.subscribe('theme-changed', (data) => {
                if (this.features.advancedAnimation && this.features.themeSystem) {
                    advancedAnimationSystem.updateTheme(data.theme);
                }
            });
            
            // Connect voice recognition with offline support
            eventSystem.subscribe('voice-command-recognized', (data) => {
                if (this.features.voiceRecognition && this.features.offlineSupport) {
                    if (!navigator.onLine) {
                        // Store voice command for later processing
                        offlineSupport.storeOfflineAction({
                            type: 'voice-command',
                            command: data.command,
                            timestamp: new Date().toISOString()
                        });
                    }
                }
            });
            
            // Connect multi-language support with voice recognition
            eventSystem.subscribe('language-changed', (data) => {
                if (this.features.multiLanguage && this.features.voiceRecognition) {
                    voiceRecognitionEnhancement.setLanguage(data.language);
                }
            });
            
            // Connect theme system with multi-language support
            eventSystem.subscribe('language-changed', (data) => {
                if (this.features.themeSystem && this.features.multiLanguage) {
                    // Update theme labels and descriptions
                    themeSystem.updateLocalization();
                }
            });
            
            // Connect animation system with offline support
            eventSystem.subscribe('online-status-changed', (data) => {
                if (this.features.advancedAnimation && this.features.offlineSupport) {
                    // Adjust animation quality based on online status
                    advancedAnimationSystem.setHighPerformanceMode(data.isOnline);
                }
            });
            
            console.log('Features connected successfully');
            return true;
        } catch (error) {
            console.error('Error connecting features:', error);
            throw new Error('Failed to connect features: ' + error.message);
        }
    }
    
    /**
     * Show initialization UI
     */
    showInitializationUI() {
        // Create initialization overlay if it doesn't exist
        let overlay = document.getElementById('meai-initialization-overlay');
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'meai-initialization-overlay';
            overlay.className = 'meai-initialization-overlay';
            
            const content = document.createElement('div');
            content.className = 'meai-initialization-content';
            
            const title = document.createElement('h2');
            title.textContent = 'Initializing MeAI';
            content.appendChild(title);
            
            const progress = document.createElement('div');
            progress.className = 'meai-initialization-progress-container';
            
            const progressBar = document.createElement('div');
            progressBar.className = 'meai-initialization-progress-bar';
            progressBar.style.width = '0%';
            progress.appendChild(progressBar);
            
            const progressText = document.createElement('div');
            progressText.className = 'meai-initialization-progress-text';
            progressText.textContent = 'Starting initialization...';
            progress.appendChild(progressText);
            
            content.appendChild(progress);
            
            const featureStatus = document.createElement('div');
            featureStatus.className = 'meai-initialization-feature-status';
            
            // Add feature status indicators
            const features = [
                { id: 'advancedAnimation', name: 'Advanced Animation' },
                { id: 'voiceRecognition', name: 'Voice Recognition' },
                { id: 'themeSystem', name: 'Theme System' },
                { id: 'offlineSupport', name: 'Offline Support' },
                { id: 'multiLanguage', name: 'Multi-language Support' }
            ];
            
            features.forEach(feature => {
                const featureItem = document.createElement('div');
                featureItem.className = 'meai-initialization-feature-item';
                featureItem.id = `feature-status-${feature.id}`;
                
                const featureIcon = document.createElement('span');
                featureIcon.className = 'meai-initialization-feature-icon pending';
                featureIcon.innerHTML = '⏳';
                featureItem.appendChild(featureIcon);
                
                const featureName = document.createElement('span');
                featureName.className = 'meai-initialization-feature-name';
                featureName.textContent = feature.name;
                featureItem.appendChild(featureName);
                
                featureStatus.appendChild(featureItem);
            });
            
            content.appendChild(featureStatus);
            
            overlay.appendChild(content);
            document.body.appendChild(overlay);
        }
        
        // Show overlay
        overlay.style.display = 'flex';
    }
    
    /**
     * Hide initialization UI
     */
    hideInitializationUI() {
        const overlay = document.getElementById('meai-initialization-overlay');
        
        if (overlay) {
            // Add completion class
            overlay.classList.add('complete');
            
            // Hide after animation
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 1500);
        }
    }
    
    /**
     * Update initialization UI
     * @param {string} type - Update type ('progress', 'error')
     * @param {string} message - Update message
     */
    updateInitializationUI(type, message) {
        const overlay = document.getElementById('meai-initialization-overlay');
        
        if (!overlay) {
            return;
        }
        
        const progressText = overlay.querySelector('.meai-initialization-progress-text');
        
        if (progressText) {
            progressText.textContent = message;
        }
        
        if (type === 'error') {
            overlay.classList.add('error');
            
            // Create error message if it doesn't exist
            let errorMessage = overlay.querySelector('.meai-initialization-error');
            
            if (!errorMessage) {
                errorMessage = document.createElement('div');
                errorMessage.className = 'meai-initialization-error';
                overlay.querySelector('.meai-initialization-content').appendChild(errorMessage);
            }
            
            errorMessage.textContent = `Error: ${message}`;
            errorMessage.style.display = 'block';
        }
    }
    
    /**
     * Update initialization progress
     */
    updateInitializationProgress() {
        this.initializationProgress++;
        
        const overlay = document.getElementById('meai-initialization-overlay');
        
        if (!overlay) {
            return;
        }
        
        const progressBar = overlay.querySelector('.meai-initialization-progress-bar');
        
        if (progressBar) {
            const percentage = (this.initializationProgress / this.initializationTotal) * 100;
            progressBar.style.width = `${percentage}%`;
        }
    }
    
    /**
     * Update feature status in UI
     * @param {string} featureId - Feature ID
     * @param {boolean} status - Feature status
     */
    updateFeatureStatus(featureId, status) {
        const featureItem = document.getElementById(`feature-status-${featureId}`);
        
        if (!featureItem) {
            return;
        }
        
        const featureIcon = featureItem.querySelector('.meai-initialization-feature-icon');
        
        if (featureIcon) {
            featureIcon.classList.remove('pending');
            
            if (status) {
                featureIcon.classList.add('success');
                featureIcon.innerHTML = '✅';
            } else {
                featureIcon.classList.add('error');
                featureIcon.innerHTML = '❌';
            }
        }
    }
    
    /**
     * Get feature status
     * @returns {Object} Feature status
     */
    getFeatureStatus() {
        return {
            initialized: this.initialized,
            features: this.features
        };
    }
}

// Create and export singleton instance
const meaiIntegration = new MeAIIntegration();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    meaiIntegration.init();
});

export default meaiIntegration;
