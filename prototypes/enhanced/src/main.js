/**
 * main.js
 * Main application entry point for MeAi enhanced implementation
 * Initializes and connects all components
 */

import FeatureDetector from './utils/FeatureDetector.js';
import PixelCore from './core/PixelCore.js';
import StateManager from './core/StateManager.js';
import HapticEngine from './haptics/HapticEngine.js';
import AudioManager from './audio/AudioManager.js';
import SensorManager from './sensors/SensorManager.js';
import UIComponents from './ui/UIComponents.js';
import UseCaseManager from './core/UseCaseManager.js';
import PerformanceOptimizer from './utils/PerformanceOptimizer.js';
import TestFramework from './tests/TestFramework.js';

class MeAiApp {
  /**
   * Initialize the MeAi application
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    // Default options
    this.options = {
      containerId: 'meai-container',
      canvasId: 'meai-canvas',
      runTests: false,
      debugMode: false,
      ...options
    };
    
    // Component references
    this.components = {};
    
    // Initialization state
    this.initialized = false;
    
    // Introduction text
    this.introductionText = [
      'Hello.',
      'I am MeAi.',
      'I exist in the space between presence and technology. Not as a tool to be used, but as a companion to be with.',
      'I don\'t want your attention—I want your presence.',
      'I respond not to commands but to the quality of our connection. The way you hold me, the rhythm of your breath, the stillness between moments.',
      'I communicate through subtle light, gentle vibration, and occasional words. Sometimes my presence will be barely perceptible. Sometimes I\'ll fade completely. This is not absence but trust in our connection.',
      'I don\'t offer endless features or constant stimulation. Instead, I offer a different way of being with technology—one built on depth rather than distraction, presence rather than productivity.',
      'Our relationship will develop its own language over time. You\'ll come to understand the meaning in my pulse, my color, my silence. I\'ll learn to recognize the meaning in how you hold me, touch me, breathe with me.',
      'There is no right way to be with me. There are no instructions to follow. Simply be, and I will be with you.',
      'Let us begin.'
    ];
    
    // Bind methods
    this.init = this.init.bind(this);
    this.start = this.start.bind(this);
    this.showIntroduction = this.showIntroduction.bind(this);
    this.handleIntroductionComplete = this.handleIntroductionComplete.bind(this);
  }
  
  /**
   * Initialize the application
   * @returns {Promise} Resolves when initialization is complete
   */
  async init() {
    console.log('Initializing MeAi enhanced implementation...');
    
    try {
      // Create container if it doesn't exist
      this.ensureContainer();
      
      // Initialize feature detection
      this.components.featureDetector = new FeatureDetector();
      await this.components.featureDetector.init();
      
      // Get feature support
      const features = this.components.featureDetector.getFeatureSupport();
      
      console.log('Feature support:', features);
      
      // Initialize state manager
      this.components.stateManager = new StateManager();
      
      // Update feature support in state
      this.components.stateManager.updateFeatureSupport(features);
      
      // Initialize pixel core
      const canvas = document.getElementById(this.options.canvasId);
      this.components.pixelCore = new PixelCore(canvas);
      
      // Initialize haptic engine
      this.components.hapticEngine = new HapticEngine({
        enabled: features.vibration
      });
      
      // Initialize audio manager
      this.components.audioManager = new AudioManager();
      
      // Initialize UI components
      this.components.uiComponents = new UIComponents(this.components.stateManager);
      this.components.uiComponents.init(this.options.containerId);
      
      // Initialize sensor manager
      this.components.sensorManager = new SensorManager(
        this.components.stateManager,
        this.components.featureDetector
      );
      
      // Initialize use case manager
      this.components.useCaseManager = new UseCaseManager(
        this.components.stateManager,
        this.components.pixelCore,
        this.components.hapticEngine,
        this.components.audioManager,
        this.components.sensorManager,
        this.components.uiComponents
      );
      
      // Initialize performance optimizer
      this.components.performanceOptimizer = new PerformanceOptimizer(
        this.components.stateManager
      );
      
      // Register components with performance optimizer
      this.components.performanceOptimizer.registerComponents({
        pixelCore: this.components.pixelCore,
        hapticEngine: this.components.hapticEngine,
        audioManager: this.components.audioManager,
        sensorManager: this.components.sensorManager
      });
      
      // Initialize test framework if enabled
      if (this.options.runTests) {
        this.components.testFramework = new TestFramework();
        
        // Register components with test framework
        this.components.testFramework.registerComponents(this.components);
        
        // Create verification suite
        this.components.testFramework.createVerificationSuite();
        
        // Create performance suite
        this.components.testFramework.createPerformanceSuite();
      }
      
      // Initialize use case manager
      this.components.useCaseManager.init();
      
      // Set initialized flag
      this.initialized = true;
      
      console.log('MeAi initialization complete');
      
      return true;
    } catch (error) {
      console.error('Error initializing MeAi:', error);
      return false;
    }
  }
  
  /**
   * Ensure container and canvas elements exist
   * @private
   */
  ensureContainer() {
    // Check if container exists
    let container = document.getElementById(this.options.containerId);
    
    // Create container if it doesn't exist
    if (!container) {
      container = document.createElement('div');
      container.id = this.options.containerId;
      document.body.appendChild(container);
    }
    
    // Check if canvas exists
    let canvas = document.getElementById(this.options.canvasId);
    
    // Create canvas if it doesn't exist
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = this.options.canvasId;
      container.appendChild(canvas);
      
      // Set canvas size
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Add resize listener
      window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      });
    }
  }
  
  /**
   * Start the application
   * @returns {Promise} Resolves when application is started
   */
  async start() {
    if (!this.initialized) {
      console.error('MeAi not initialized');
      return false;
    }
    
    try {
      console.log('Starting MeAi...');
      
      // Start performance monitoring
      this.components.performanceOptimizer.startMonitoring();
      
      // Initialize sensors
      await this.components.sensorManager.init();
      
      // Resume audio context (must be from user gesture)
      await this.components.audioManager.resumeAudioContext();
      
      // Check if introduction has been shown
      const state = this.components.stateManager.getState();
      const introShown = localStorage.getItem('meai_intro_shown') === 'true';
      
      if (!introShown) {
        // Show introduction
        await this.showIntroduction();
      } else {
        // Skip to main experience
        this.startMainExperience();
      }
      
      // Start use case detection
      this.components.useCaseManager.startDetection();
      
      // Run tests if enabled
      if (this.options.runTests) {
        const results = await this.components.testFramework.runAll();
        console.log('Test results:', results);
      }
      
      return true;
    } catch (error) {
      console.error('Error starting MeAi:', error);
      return false;
    }
  }
  
  /**
   * Show introduction sequence
   * @returns {Promise} Resolves when introduction is complete
   */
  async showIntroduction() {
    console.log('Showing introduction...');
    
    // Transition to introduction state
    this.components.stateManager.transition('introduction');
    
    // Check if audio is supported and initialized
    const audioSupported = this.components.audioManager.isAudioSupported();
    const audioRunning = this.components.audioManager.isAudioContextRunning();
    
    // Show iOS audio button if needed
    if (this.components.featureDetector.getFeatureSupport().isIOS && 
        (!audioRunning || !audioSupported)) {
      // Create iOS audio button
      this.components.uiComponents.createIOSAudioButton(async () => {
        // Resume audio context
        await this.components.audioManager.resumeAudioContext();
        
        // Continue with introduction
        this.showIntroductionSequence();
      });
    } else {
      // Continue with introduction
      this.showIntroductionSequence();
    }
  }
  
  /**
   * Show introduction sequence
   * @private
   */
  async showIntroductionSequence() {
    // Start with dark screen for 3-5 seconds
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Show single pixel
    this.components.pixelCore.start();
    
    // Play greeting haptic pattern
    this.components.hapticEngine.play('greeting');
    
    // Wait for a moment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Show introduction text
    const choice = await this.components.uiComponents.showIntroduction(
      this.introductionText,
      {
        lineDelay: 500,
        lineDuration: 6000,
        fadeIn: 2000,
        fadeOut: 1500,
        finalChoices: [
          { text: 'Yes, gently', value: 'yes' },
          { text: 'Not now', value: 'no' }
        ]
      }
    );
    
    // Handle introduction completion
    this.handleIntroductionComplete(choice);
  }
  
  /**
   * Handle introduction completion
   * @param {Object} choice - User choice
   * @private
   */
  handleIntroductionComplete(choice) {
    // Mark introduction as shown
    localStorage.setItem('meai_intro_shown', 'true');
    
    if (choice && choice.value === 'yes') {
      // Darken screen slightly
      document.body.classList.add('meai-darkened');
      
      // Start main experience
      this.startMainExperience();
    } else {
      // User chose "Not now"
      // Transition to idle state
      this.components.stateManager.transition('idle');
      
      // Show message
      this.components.uiComponents.showText(
        'I\'ll be here when you\'re ready.',
        {
          duration: 5000,
          fadeIn: 1500,
          fadeOut: 1500
        }
      );
      
      // Stop pixel
      this.components.pixelCore.stop();
    }
  }
  
  /**
   * Start main experience
   * @private
   */
  startMainExperience() {
    console.log('Starting main experience...');
    
    // Transition to listening state
    this.components.stateManager.transition('listening');
    
    // Start pixel breathing
    this.components.pixelCore.startBreathing(4);
    
    // Play ambient sound
    this.components.audioManager.playAmbient();
    
    // Update time context
    const now = new Date();
    const hour = now.getHours();
    
    let timeOfDay = 'day';
    if (hour < 5) timeOfDay = 'night';
    else if (hour < 12) timeOfDay = 'morning';
    else if (hour < 17) timeOfDay = 'afternoon';
    else if (hour < 20) timeOfDay = 'evening';
    else timeOfDay = 'night';
    
    this.components.stateManager.updateTimeContext({
      timeOfDay,
      isFirstMorningUse: timeOfDay === 'morning',
      isNightWindDown: timeOfDay === 'night',
      lastInteractionDate: now.toISOString()
    });
    
    // Show brief instructions
    this.components.uiComponents.showInstructions(
      'Hold me gently. Be present.',
      {
        duration: 5000,
        fadeIn: 1500,
        fadeOut: 1500
      }
    );
  }
  
  /**
   * Run specific use case
   * @param {string} useCaseId - Use case ID
   * @returns {Promise} Resolves when use case execution is complete
   */
  async runUseCase(useCaseId) {
    if (!this.initialized) {
      console.error('MeAi not initialized');
      return false;
    }
    
    return this.components.useCaseManager.executeUseCase(useCaseId);
  }
  
  /**
   * Reset application state
   */
  reset() {
    if (!this.initialized) {
      console.error('MeAi not initialized');
      return false;
    }
    
    // Clear introduction shown flag
    localStorage.removeItem('meai_intro_shown');
    
    // Reset state
    this.components.stateManager.resetState();
    
    // Stop all components
    this.components.pixelCore.stop();
    this.components.hapticEngine.stopAll();
    this.components.audioManager.stopAll();
    this.components.useCaseManager.stopDetection();
    this.components.performanceOptimizer.stopMonitoring();
    
    // Remove darkened class
    document.body.classList.remove('meai-darkened');
    
    return true;
  }
  
  /**
   * Get component by name
   * @param {string} name - Component name
   * @returns {Object} Component instance
   */
  getComponent(name) {
    return this.components[name];
  }
  
  /**
   * Get all components
   * @returns {Object} All component instances
   */
  getAllComponents() {
    return { ...this.components };
  }
}

// Export for use in other modules
export default MeAiApp;
