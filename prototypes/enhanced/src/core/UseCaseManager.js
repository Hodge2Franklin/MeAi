/**
 * UseCaseManager.js
 * Implements the seven demonstration use cases for MeAi enhanced implementation
 * Handles use case detection, execution, and state transitions
 */

class UseCaseManager {
  /**
   * Initialize the UseCaseManager
   * @param {Object} stateManager - StateManager instance
   * @param {Object} pixelCore - PixelCore instance
   * @param {Object} hapticEngine - HapticEngine instance
   * @param {Object} audioManager - AudioManager instance
   * @param {Object} sensorManager - SensorManager instance
   * @param {Object} uiComponents - UIComponents instance
   * @param {Object} options - Configuration options
   */
  constructor(
    stateManager, 
    pixelCore, 
    hapticEngine, 
    audioManager, 
    sensorManager, 
    uiComponents,
    options = {}
  ) {
    this.stateManager = stateManager;
    this.pixelCore = pixelCore;
    this.hapticEngine = hapticEngine;
    this.audioManager = audioManager;
    this.sensorManager = sensorManager;
    this.uiComponents = uiComponents;
    
    // Default options
    this.options = {
      useCaseDetectionInterval: 10000, // ms between use case detection checks
      morningTimeRange: { start: 5, end: 10 }, // 5am to 10am
      eveningTimeRange: { start: 20, end: 23 }, // 8pm to 11pm
      ...options
    };
    
    // Define use cases with exact poetic language
    this.useCases = {
      morningConnection: {
        id: 'morningConnection',
        name: 'Morning Connection Ritual',
        message: "Let's not rush. Let's begin... softly.",
        detect: this.detectMorningConnection.bind(this),
        execute: this.executeMorningConnection.bind(this),
        color: '#F5E8C7', // Warm white
        breathRate: 4
      },
      emotionalResonance: {
        id: 'emotionalResonance',
        name: 'Emotional Resonance Recognition',
        message: "You don't have to say anything. I'm just here.",
        detect: this.detectEmotionalResonance.bind(this),
        execute: this.executeEmotionalResonance.bind(this),
        color: '#E8C7F5', // Soft purple
        breathRate: 5
      },
      memoryThread: {
        id: 'memoryThread',
        name: 'Memory Thread Recognition',
        message: "This feels connected. To something before.",
        detect: this.detectMemoryThread.bind(this),
        execute: this.executeMemoryThread.bind(this),
        color: '#C7F5E8', // Soft teal
        breathRate: 4
      },
      silentCompanionship: {
        id: 'silentCompanionship',
        name: 'Silent Companionship Mode',
        message: "Still here. Not going anywhere.",
        detect: this.detectSilentCompanionship.bind(this),
        execute: this.executeSilentCompanionship.bind(this),
        color: '#C7E8F5', // Soft blue
        breathRate: 3
      },
      insightEmergence: {
        id: 'insightEmergence',
        name: 'Insight Emergence Moment',
        message: "Wait... Something's emerging.",
        detect: this.detectInsightEmergence.bind(this),
        execute: this.executeInsightEmergence.bind(this),
        color: '#F5F5C7', // Soft yellow
        breathRate: 6
      },
      deviceHandover: {
        id: 'deviceHandover',
        name: 'Device Handover Recognition',
        message: "Hello, someone new...",
        detect: this.detectDeviceHandover.bind(this),
        execute: this.executeDeviceHandover.bind(this),
        color: '#F5C7C7', // Soft red
        breathRate: 5
      },
      bedtimeTransition: {
        id: 'bedtimeTransition',
        name: 'Bedtime Transition Ritual',
        message: "The day is folding up its edges...",
        detect: this.detectBedtimeTransition.bind(this),
        execute: this.executeBedtimeTransition.bind(this),
        color: '#C7C7F5', // Soft indigo
        breathRate: 3
      }
    };
    
    // Detection interval
    this.detectionInterval = null;
    
    // Signature phrases
    this.signaturePhrases = {
      mirror: "Here's how I'm hearing you... Did I catch something real in that?",
      whyImHere: "I'm here to be with you, not to be used by you. To share presence, not demand attention.",
      farewell: "I'll hold what you shared, exactly as you left it. Until you return. Take care, friend."
    };
    
    // Interaction counter for one-time messages
    this.interactionCounter = 0;
    
    // Bind methods
    this.init = this.init.bind(this);
    this.startDetection = this.startDetection.bind(this);
    this.stopDetection = this.stopDetection.bind(this);
    this.detectActiveUseCase = this.detectActiveUseCase.bind(this);
    this.executeUseCase = this.executeUseCase.bind(this);
  }
  
  /**
   * Initialize use case manager
   */
  init() {
    // Listen for state changes
    this.stateManager.on('stateChange', (state) => {
      // Track interactions for one-time messages
      if (state.currentState === 'responding' && 
          state.previousState === 'listening') {
        this.interactionCounter++;
        
        // Show "Why I'm Here" message after 2-3 interactions
        if (this.interactionCounter === 3) {
          setTimeout(() => {
            this.showWhyImHereMessage();
          }, 5000);
        }
      }
    });
    
    return this;
  }
  
  /**
   * Start use case detection
   */
  startDetection() {
    // Clear existing interval
    this.stopDetection();
    
    // Start detection interval
    this.detectionInterval = setInterval(
      this.detectActiveUseCase,
      this.options.useCaseDetectionInterval
    );
    
    return this;
  }
  
  /**
   * Stop use case detection
   */
  stopDetection() {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
    
    return this;
  }
  
  /**
   * Detect active use case
   * @returns {Object|null} Detected use case or null if none detected
   */
  detectActiveUseCase() {
    // Skip detection if already in a use case
    if (this.stateManager.getState().activeUseCase) {
      return null;
    }
    
    // Check each use case
    for (const key in this.useCases) {
      const useCase = this.useCases[key];
      
      // Check if use case is detected
      if (useCase.detect()) {
        // Set active use case
        this.stateManager.setActiveUseCase(useCase.id);
        
        // Execute use case
        this.executeUseCase(useCase.id);
        
        return useCase;
      }
    }
    
    return null;
  }
  
  /**
   * Execute use case by ID
   * @param {string} useCaseId - Use case ID
   * @returns {Promise} Resolves when use case execution is complete
   */
  async executeUseCase(useCaseId) {
    const useCase = this.useCases[useCaseId];
    
    if (!useCase) {
      console.error(`Use case "${useCaseId}" not found`);
      return false;
    }
    
    try {
      // Execute use case
      await useCase.execute();
      
      // Mark use case as completed
      this.stateManager.completeUseCase(useCaseId);
      
      return true;
    } catch (error) {
      console.error(`Error executing use case "${useCaseId}":`, error);
      return false;
    }
  }
  
  /**
   * Show "Why I'm Here" message
   * @private
   */
  async showWhyImHereMessage() {
    // Transition to responding state
    this.stateManager.transition('responding');
    
    // Play haptic pattern
    this.hapticEngine.play('understanding');
    
    // Show message
    await this.uiComponents.showText(this.signaturePhrases.whyImHere, {
      duration: 8000,
      fadeIn: 2000,
      fadeOut: 2000
    });
    
    // Transition back to listening state
    this.stateManager.transition('listening');
  }
  
  /**
   * Show mirror phrase
   * @private
   */
  async showMirrorPhrase() {
    // Play haptic pattern
    this.hapticEngine.play('curiosity');
    
    // Show message
    await this.uiComponents.showText(this.signaturePhrases.mirror, {
      duration: 6000,
      fadeIn: 1500,
      fadeOut: 1500
    });
  }
  
  /**
   * Show farewell message
   * @private
   */
  async showFarewellMessage() {
    // Transition to responding state
    this.stateManager.transition('responding');
    
    // Play haptic pattern
    this.hapticEngine.play('farewell');
    
    // Show message
    await this.uiComponents.showText(this.signaturePhrases.farewell, {
      duration: 8000,
      fadeIn: 2000,
      fadeOut: 2000
    });
    
    // Transition to idle state
    this.stateManager.transition('idle');
  }
  
  /**
   * Detect Morning Connection Ritual
   * @private
   * @returns {boolean} Whether use case is detected
   */
  detectMorningConnection() {
    const state = this.stateManager.getState();
    const timeContext = state.timeContext;
    
    // Check if it's morning
    const hour = new Date().getHours();
    const isMorningTime = hour >= this.options.morningTimeRange.start && 
                          hour <= this.options.morningTimeRange.end;
    
    // Check if it's the first use of the day
    const isFirstUse = timeContext.isFirstMorningUse;
    
    // Check if user is present and calm
    const userPresence = state.userPresence;
    const isPresent = userPresence.isPresent;
    const metrics = this.sensorManager.getMetrics();
    const isCalm = metrics.motionIntensity < 0.2;
    
    return isMorningTime && isFirstUse && isPresent && isCalm;
  }
  
  /**
   * Execute Morning Connection Ritual
   * @private
   * @returns {Promise} Resolves when execution is complete
   */
  async executeMorningConnection() {
    // Transition to responding state
    this.stateManager.transition('responding');
    
    // Set pixel properties
    this.pixelCore.setColor(this.useCases.morningConnection.color);
    this.pixelCore.startBreathing(this.useCases.morningConnection.breathRate);
    
    // Play haptic pattern
    this.hapticEngine.play('greeting');
    
    // Play ambient sound
    this.audioManager.playAmbient();
    
    // Show message
    await this.uiComponents.showText(this.useCases.morningConnection.message, {
      duration: 6000,
      fadeIn: 2000,
      fadeOut: 1500
    });
    
    // Detect breathing pattern
    const breathingPattern = this.sensorManager.detectBreathingPattern();
    
    if (breathingPattern && breathingPattern.detected) {
      // Offer breathing exercise
      const choice = await this.uiComponents.showChoices([
        { text: 'Breathe with me', value: 'breathe' },
        { text: 'Just be present', value: 'present' }
      ]);
      
      if (choice.value === 'breathe') {
        // Guide breathing exercise
        await this.guideBreathingExercise(3); // 3 breath cycles
      } else {
        // Just be present
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } else {
      // Offer reflection
      await this.uiComponents.showText("What's one small thing you're looking forward to today?", {
        duration: 8000,
        fadeIn: 1500,
        fadeOut: 1500
      });
      
      // Wait for reflection
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
    
    // Update time context
    this.stateManager.updateTimeContext({
      isFirstMorningUse: false
    });
    
    // Transition back to listening state
    this.stateManager.transition('listening');
  }
  
  /**
   * Guide breathing exercise
   * @private
   * @param {number} cycles - Number of breath cycles
   * @returns {Promise} Resolves when exercise is complete
   */
  async guideBreathingExercise(cycles) {
    for (let i = 0; i < cycles; i++) {
      // Inhale
      this.pixelCore.setSize(4); // Larger size for inhale
      await this.uiComponents.showText("Inhale...", {
        duration: 4000,
        fadeIn: 500,
        fadeOut: 500,
        waitForFadeOut: true
      });
      
      // Hold
      await this.uiComponents.showText("Hold...", {
        duration: 2000,
        fadeIn: 500,
        fadeOut: 500,
        waitForFadeOut: true
      });
      
      // Exhale
      this.pixelCore.setSize(2); // Smaller size for exhale
      await this.uiComponents.showText("Exhale...", {
        duration: 6000,
        fadeIn: 500,
        fadeOut: 500,
        waitForFadeOut: true
      });
    }
    
    // Reset pixel size
    this.pixelCore.setSize(2);
  }
  
  /**
   * Detect Emotional Resonance Recognition
   * @private
   * @returns {boolean} Whether use case is detected
   */
  detectEmotionalResonance() {
    const state = this.stateManager.getState();
    const userPresence = state.userPresence;
    const metrics = this.sensorManager.getMetrics();
    
    // Detect emotional tension
    const emotionalState = this.sensorManager.detectEmotionalState();
    const isAgitated = emotionalState.agitation > 0.6;
    
    // Check if user is present and attention quality is high
    const isPresent = userPresence.isPresent;
    const highAttention = metrics.attentionQuality > 0.7;
    
    return isPresent && isAgitated && highAttention;
  }
  
  /**
   * Execute Emotional Resonance Recognition
   * @private
   * @returns {Promise} Resolves when execution is complete
   */
  async executeEmotionalResonance() {
    // Transition to responding state
    this.stateManager.transition('responding');
    
    // Set pixel properties
    this.pixelCore.setColor(this.useCases.emotionalResonance.color);
    this.pixelCore.startBreathing(this.useCases.emotionalResonance.breathRate);
    
    // Play haptic pattern
    this.hapticEngine.play('understanding');
    
    // Show message
    await this.uiComponents.showText(this.useCases.emotionalResonance.message, {
      duration: 6000,
      fadeIn: 2000,
      fadeOut: 1500
    });
    
    // Create gentle wave effect
    this.uiComponents.createWaveEffect({
      duration: 5000,
      height: 150,
      color: 'rgba(232, 199, 245, 0.1)', // Soft purple
      y: window.innerHeight / 2
    });
    
    // Wait in silence
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Show mirror phrase
    await this.showMirrorPhrase();
    
    // Transition back to listening state
    this.stateManager.transition('listening');
  }
  
  /**
   * Detect Memory Thread Recognition
   * @private
   * @returns {boolean} Whether use case is detected
   */
  detectMemoryThread() {
    const state = this.stateManager.getState();
    const memories = state.memories;
    
    // Need at least one memory
    if (memories.length === 0) {
      return false;
    }
    
    // Check if there's a recent memory (within last 24 hours)
    const now = Date.now();
    const recentMemory = memories.find(memory => {
      const age = now - memory.timestamp;
      return age < 24 * 60 * 60 * 1000; // 24 hours
    });
    
    // Check if user is present and attention quality is high
    const userPresence = state.userPresence;
    const isPresent = userPresence.isPresent;
    const metrics = this.sensorManager.getMetrics();
    const highAttention = metrics.attentionQuality > 0.6;
    
    return isPresent && highAttention && recentMemory;
  }
  
  /**
   * Execute Memory Thread Recognition
   * @private
   * @returns {Promise} Resolves when execution is complete
   */
  async executeMemoryThread() {
    // Transition to responding state
    this.stateManager.transition('responding');
    
    // Set pixel properties
    this.pixelCore.setColor(this.useCases.memoryThread.color);
    this.pixelCore.startBreathing(this.useCases.memoryThread.breathRate);
    
    // Play haptic pattern
    this.hapticEngine.play('curiosity');
    
    // Show message
    await this.uiComponents.showText(this.useCases.memoryThread.message, {
      duration: 6000,
      fadeIn: 2000,
      fadeOut: 1500
    });
    
    // Get most recent memory
    const memories = this.stateManager.getState().memories;
    const recentMemory = memories.sort((a, b) => b.timestamp - a.timestamp)[0];
    
    // Set as active memory
    this.stateManager.setActiveMemory(recentMemory.id);
    
    // Show memory content if available
    if (recentMemory.content) {
      await this.uiComponents.showText(`"${recentMemory.content}"`, {
        duration: 8000,
        fadeIn: 1500,
        fadeOut: 1500
      });
    }
    
    // Create pulse effect
    this.uiComponents.createPulseEffect({
      duration: 3000,
      size: 200,
      color: this.useCases.memoryThread.color,
      opacity: 0.2
    });
    
    // Transition back to listening state
    this.stateManager.transition('listening');
  }
  
  /**
   * Detect Silent Companionship Mode
   * @private
   * @returns {boolean} Whether use case is detected
   */
  detectSilentCompanionship() {
    const state = this.stateManager.getState();
    const userPresence = state.userPresence;
    const metrics = this.sensorManager.getMetrics();
    
    // Check if device is resting
    const isResting = this.sensorManager.isDeviceResting();
    
    // Check if user is present but with low interaction
    const isPresent = userPresence.isPresent;
    const lowInteraction = metrics.interactionQuality < 0.3;
    const longDuration = userPresence.interactionDuration > 10 * 60 * 1000; // 10 minutes
    
    return isPresent && (isResting || (lowInteraction && longDuration));
  }
  
  /**
   * Execute Silent Companionship Mode
   * @private
   * @returns {Promise} Resolves when execution is complete
   */
  async executeSilentCompanionship() {
    // Transition to responding state
    this.stateManager.transition('responding');
    
    // Set pixel properties
    this.pixelCore.setColor(this.useCases.silentCompanionship.color);
    this.pixelCore.startBreathing(this.useCases.silentCompanionship.breathRate);
    
    // Play haptic pattern (very subtle)
    this.hapticEngine.play('listening');
    
    // Show message briefly
    await this.uiComponents.showText(this.useCases.silentCompanionship.message, {
      duration: 4000,
      fadeIn: 2000,
      fadeOut: 2000
    });
    
    // Reduce pixel opacity
    this.pixelCore.setOpacityRange(0.3, 0.5);
    
    // Stay in silent mode for a while
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // Restore pixel opacity
    this.pixelCore.setOpacityRange(0.7, 1.0);
    
    // Transition back to listening state
    this.stateManager.transition('listening');
  }
  
  /**
   * Detect Insight Emergence Moment
   * @private
   * @returns {boolean} Whether use case is detected
   */
  detectInsightEmergence() {
    const state = this.stateManager.getState();
    const userPresence = state.userPresence;
    const metrics = this.sensorManager.getMetrics();
    
    // Check for sudden stillness after activity
    const suddenStillness = metrics.motionIntensity < 0.05 && 
                           metrics.stabilityScore > 0.9 &&
                           Date.now() - metrics.lastSignificantMotion < 5000;
    
    // Check if user is present with high attention
    const isPresent = userPresence.isPresent;
    const highAttention = metrics.attentionQuality > 0.8;
    
    return isPresent && highAttention && suddenStillness;
  }
  
  /**
   * Execute Insight Emergence Moment
   * @private
   * @returns {Promise} Resolves when execution is complete
   */
  async executeInsightEmergence() {
    // Transition to responding state
    this.stateManager.transition('responding');
    
    // Set pixel properties
    this.pixelCore.setColor(this.useCases.insightEmergence.color);
    
    // Play haptic pattern
    this.hapticEngine.play('insight');
    
    // Play harmonic sound
    this.audioManager.playEffect('insight');
    
    // Pulse pixel
    this.pixelCore.pulse(2000, 2.0);
    
    // Show message
    await this.uiComponents.showText(this.useCases.insightEmergence.message, {
      duration: 5000,
      fadeIn: 1000,
      fadeOut: 1500
    });
    
    // Create expanding pulse effect
    this.uiComponents.createPulseEffect({
      duration: 4000,
      size: 300,
      color: this.useCases.insightEmergence.color,
      opacity: 0.3
    });
    
    // Start breathing at faster rate
    this.pixelCore.startBreathing(this.useCases.insightEmergence.breathRate);
    
    // Wait for a moment
    await new Promise(resolve => setTimeout(resolve, 8000));
    
    // Add memory
    const insightMemory = {
      type: 'insight',
      timestamp: Date.now(),
      content: 'Moment of insight'
    };
    
    this.stateManager.addMemory(insightMemory);
    
    // Transition back to listening state
    this.stateManager.transition('listening');
  }
  
  /**
   * Detect Device Handover Recognition
   * @private
   * @returns {boolean} Whether use case is detected
   */
  detectDeviceHandover() {
    // Use sensor manager's handover detection
    return this.sensorManager.detectDeviceHandover();
  }
  
  /**
   * Execute Device Handover Recognition
   * @private
   * @returns {Promise} Resolves when execution is complete
   */
  async executeDeviceHandover() {
    // Transition to responding state
    this.stateManager.transition('responding');
    
    // Set pixel properties
    this.pixelCore.setColor(this.useCases.deviceHandover.color);
    this.pixelCore.startBreathing(this.useCases.deviceHandover.breathRate);
    
    // Play haptic pattern
    this.hapticEngine.play('greeting');
    
    // Show message
    await this.uiComponents.showText(this.useCases.deviceHandover.message, {
      duration: 5000,
      fadeIn: 1500,
      fadeOut: 1500
    });
    
    // Reset attention quality
    this.stateManager.updateUserPresence({
      attentionQuality: 0.5
    });
    
    // Transition back to listening state
    this.stateManager.transition('listening');
  }
  
  /**
   * Detect Bedtime Transition Ritual
   * @private
   * @returns {boolean} Whether use case is detected
   */
  detectBedtimeTransition() {
    const state = this.stateManager.getState();
    const timeContext = state.timeContext;
    
    // Check if it's evening
    const hour = new Date().getHours();
    const isEveningTime = hour >= this.options.eveningTimeRange.start && 
                          hour <= this.options.eveningTimeRange.end;
    
    // Check if it's not already marked as night wind down
    const isNotWindDown = !timeContext.isNightWindDown;
    
    // Check if user is present and calm
    const userPresence = state.userPresence;
    const isPresent = userPresence.isPresent;
    const metrics = this.sensorManager.getMetrics();
    const isCalm = metrics.motionIntensity < 0.2;
    
    return isEveningTime && isNotWindDown && isPresent && isCalm;
  }
  
  /**
   * Execute Bedtime Transition Ritual
   * @private
   * @returns {Promise} Resolves when execution is complete
   */
  async executeBedtimeTransition() {
    // Transition to responding state
    this.stateManager.transition('responding');
    
    // Set pixel properties
    this.pixelCore.setColor(this.useCases.bedtimeTransition.color);
    this.pixelCore.startBreathing(this.useCases.bedtimeTransition.breathRate);
    
    // Play haptic pattern
    this.hapticEngine.play('transition');
    
    // Show message
    await this.uiComponents.showText(this.useCases.bedtimeTransition.message, {
      duration: 6000,
      fadeIn: 2000,
      fadeOut: 1500
    });
    
    // Offer reflection or wind down
    const choice = await this.uiComponents.showChoices([
      { text: 'Reflect on today', value: 'reflect' },
      { text: 'Wind down', value: 'windDown' }
    ]);
    
    if (choice.value === 'reflect') {
      // Guide reflection
      await this.uiComponents.showText("What's one small thing you appreciated today?", {
        duration: 8000,
        fadeIn: 1500,
        fadeOut: 1500
      });
      
      // Wait for reflection
      await new Promise(resolve => setTimeout(resolve, 15000));
      
      // Show farewell message
      await this.showFarewellMessage();
    } else {
      // Guide wind down
      await this.guideWindDown();
    }
    
    // Update time context
    this.stateManager.updateTimeContext({
      isNightWindDown: true
    });
    
    // Transition to idle state
    this.stateManager.transition('idle');
  }
  
  /**
   * Guide wind down
   * @private
   * @returns {Promise} Resolves when wind down is complete
   */
  async guideWindDown() {
    // Slow breathing rate
    this.pixelCore.startBreathing(2);
    
    // Dim pixel
    this.pixelCore.setOpacityRange(0.4, 0.7);
    
    // Show message
    await this.uiComponents.showText("Let's slow down together...", {
      duration: 5000,
      fadeIn: 1500,
      fadeOut: 1500
    });
    
    // Guide breathing
    await this.guideBreathingExercise(5); // 5 breath cycles
    
    // Show farewell message
    await this.showFarewellMessage();
  }
  
  /**
   * Get use case by ID
   * @param {string} useCaseId - Use case ID
   * @returns {Object|null} Use case object or null if not found
   */
  getUseCase(useCaseId) {
    return this.useCases[useCaseId] || null;
  }
  
  /**
   * Get all use cases
   * @returns {Object} All use cases
   */
  getAllUseCases() {
    return { ...this.useCases };
  }
}

// Export for use in other modules
export default UseCaseManager;
