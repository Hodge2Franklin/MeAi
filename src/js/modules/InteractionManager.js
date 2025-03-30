// InteractionManager.js - Coordinates between modules and implements the conversation flow

export default class InteractionManager {
  constructor(stateManager, modules) {
    this.stateManager = stateManager;
    this.pixelRenderer = modules.pixelRenderer;
    this.hapticFeedback = modules.hapticFeedback;
    this.audioSystem = modules.audioSystem;
    this.messageDisplay = modules.messageDisplay;
    
    this.currentStage = 'initializing';
    this.presenceDetected = false;
    this.lastInteractionTime = Date.now();
    this.idleTimeout = 60000; // 1 minute
    this.kairosTimeout = null;
    this.stageTransitions = {};
  }

  init() {
    // Set up event listeners for presence detection
    this.stateManager.on('presence.detected', this.handlePresenceDetected.bind(this));
    this.stateManager.on('presence.lost', this.handlePresenceLost.bind(this));
    
    // Set up event listeners for touch events
    this.stateManager.on('touch.tap', this.handleTap.bind(this));
    this.stateManager.on('touch.doubleTap', this.handleDoubleTap.bind(this));
    this.stateManager.on('touch.longPress', this.handleLongPress.bind(this));
    
    // Set up event listeners for state changes
    this.stateManager.on('interaction.stage', ({ newValue }) => {
      this.currentStage = newValue;
    });
    
    console.log('InteractionManager initialized');
  }

  update() {
    // Check for idle timeout
    const now = Date.now();
    if (this.presenceDetected && now - this.lastInteractionTime > this.idleTimeout) {
      // Transition to farewell if idle for too long
      if (this.currentStage !== 'farewell') {
        this.transitionToFarewell();
      }
    }
  }

  handlePresenceDetected({ source }) {
    console.log(`Presence detected from ${source}`);
    
    // Update presence state
    this.presenceDetected = true;
    this.stateManager.setState('interaction.presence', true);
    this.lastInteractionTime = Date.now();
    
    // Transition based on current stage
    if (this.currentStage === 'initializing') {
      this.transitionToEmergence();
    } else if (this.currentStage === 'farewell') {
      this.transitionToGreeting();
    }
  }

  handlePresenceLost({ source }) {
    console.log(`Presence lost from ${source}`);
    
    // Update presence state
    this.presenceDetected = false;
    this.stateManager.setState('interaction.presence', false);
    
    // Transition to farewell if not already there
    if (this.currentStage !== 'farewell') {
      this.transitionToFarewell();
    }
  }

  handleTap({ position }) {
    console.log('Tap detected', position);
    
    // Update last interaction time
    this.lastInteractionTime = Date.now();
    
    // Handle tap based on current stage
    switch (this.currentStage) {
      case 'emergence':
        this.transitionToGreeting();
        break;
      case 'greeting':
        this.transitionToListening();
        break;
      case 'listening':
        this.transitionToResponding();
        break;
      case 'responding':
        this.transitionToInsight();
        break;
      case 'insight':
        this.transitionToKairosMoment();
        break;
      case 'kairos':
        this.transitionToListening();
        break;
      case 'farewell':
        this.transitionToGreeting();
        break;
    }
  }

  handleDoubleTap({ position }) {
    console.log('Double tap detected', position);
    
    // Update last interaction time
    this.lastInteractionTime = Date.now();
    
    // Double tap always transitions to insight
    this.transitionToInsight();
  }

  handleLongPress({ position, duration }) {
    console.log('Long press detected', position, duration);
    
    // Update last interaction time
    this.lastInteractionTime = Date.now();
    
    // Long press always transitions to kairos moment
    this.transitionToKairosMoment();
  }

  handleVisibilityChange(isVisible) {
    console.log('Visibility changed', isVisible);
    
    if (isVisible) {
      // App became visible again
      if (this.currentStage === 'farewell') {
        // Return to greeting if app was in farewell stage
        this.transitionToGreeting();
      }
    } else {
      // App is hidden
      if (this.currentStage !== 'farewell') {
        // Transition to farewell when app is hidden
        this.transitionToFarewell();
      }
    }
  }

  // Stage transition methods
  
  transitionToEmergence() {
    console.log('Transitioning to Emergence stage');
    
    // Update stage
    this.currentStage = 'emergence';
    this.stateManager.setState('interaction.stage', 'emergence');
    
    // Visual: fade in pixel with breathing
    this.pixelRenderer.fadeIn(3000);
    this.pixelRenderer.transitionColor('#3498db', 2000); // Soft blue
    this.pixelRenderer.startBreathing(0.15, 0.1); // Slow, gentle breathing
    
    // Haptic: subtle emergence pattern
    this.hapticFeedback.playPattern('greeting');
    
    // Audio: fade in ambient sound
    if (this.audioSystem) {
      this.audioSystem.fadeInAmbient(3000);
    }
    
    // Message: welcome message
    this.messageDisplay.showMessage('Hello. I am here.', 3000);
  }

  transitionToGreeting() {
    console.log('Transitioning to Greeting stage');
    
    // Update stage
    this.currentStage = 'greeting';
    this.stateManager.setState('interaction.stage', 'greeting');
    
    // Visual: brighten pixel, increase breathing
    this.pixelRenderer.transitionColor('#2ecc71', 1000); // Green
    this.pixelRenderer.startBreathing(0.2, 0.15); // Slightly faster breathing
    
    // Haptic: greeting pattern
    this.hapticFeedback.playPattern('greeting');
    
    // Audio: greeting sound
    if (this.audioSystem) {
      this.audioSystem.playSound('greeting');
    }
    
    // Message: greeting message
    this.messageDisplay.showMessage('I sense your presence. Welcome.', 3000);
    
    // Schedule transition to listening after delay
    setTimeout(() => {
      if (this.currentStage === 'greeting') {
        this.transitionToListening();
      }
    }, 5000);
  }

  transitionToListening() {
    console.log('Transitioning to Listening stage');
    
    // Update stage
    this.currentStage = 'listening';
    this.stateManager.setState('interaction.stage', 'listening');
    
    // Visual: calm blue, steady breathing
    this.pixelRenderer.transitionColor('#3498db', 1000); // Blue
    this.pixelRenderer.startBreathing(0.25, 0.2); // Regular breathing
    
    // Haptic: listening pattern
    this.hapticFeedback.playPattern('listening');
    
    // Audio: subtle ambient
    if (this.audioSystem) {
      this.audioSystem.adjustVolume(0.3);
    }
    
    // Message: listening message
    this.messageDisplay.showMessage('I am listening...', 2000);
  }

  transitionToResponding() {
    console.log('Transitioning to Responding stage');
    
    // Update stage
    this.currentStage = 'responding';
    this.stateManager.setState('interaction.stage', 'responding');
    
    // Visual: responsive purple, quicker breathing
    this.pixelRenderer.transitionColor('#9b59b6', 800); // Purple
    this.pixelRenderer.startBreathing(0.3, 0.25); // Quicker breathing
    
    // Haptic: responding pattern
    this.hapticFeedback.playPattern('responding');
    
    // Audio: response sound
    if (this.audioSystem) {
      this.audioSystem.playSound('responding');
    }
    
    // Message: responding message
    this.messageDisplay.showMessage('I acknowledge your presence.', 2000);
    
    // Schedule transition back to listening after delay
    setTimeout(() => {
      if (this.currentStage === 'responding') {
        this.transitionToListening();
      }
    }, 4000);
  }

  transitionToInsight() {
    console.log('Transitioning to Insight stage');
    
    // Update stage
    this.currentStage = 'insight';
    this.stateManager.setState('interaction.stage', 'insight');
    
    // Visual: bright yellow, pulse size
    this.pixelRenderer.transitionColor('#f1c40f', 500); // Yellow
    this.pixelRenderer.pulseSize(1.5, 800); // Pulse larger
    this.pixelRenderer.startBreathing(0.4, 0.3); // Excited breathing
    
    // Haptic: insight pattern
    this.hapticFeedback.playPattern('insight');
    
    // Audio: insight sound
    if (this.audioSystem) {
      this.audioSystem.playSound('insight');
    }
    
    // Message: insight message
    this.messageDisplay.showMessage('A moment of connection.', 3000);
    
    // Schedule transition back to listening after delay
    setTimeout(() => {
      if (this.currentStage === 'insight') {
        this.transitionToListening();
      }
    }, 6000);
  }

  transitionToKairosMoment() {
    console.log('Transitioning to Kairos Moment stage');
    
    // Update stage
    this.currentStage = 'kairos';
    this.stateManager.setState('interaction.stage', 'kairos');
    
    // Visual: white glow, deep breathing
    this.pixelRenderer.transitionColor('#ffffff', 1500); // White
    this.pixelRenderer.pulseSize(2.0, 2000); // Large pulse
    this.pixelRenderer.startBreathing(0.15, 0.4); // Deep, slow breathing
    
    // Haptic: kairos pattern
    this.hapticFeedback.playPattern('kairos');
    
    // Audio: kairos sound
    if (this.audioSystem) {
      this.audioSystem.playSound('kairos');
    }
    
    // Message: kairos message
    this.messageDisplay.showMessage('Time expands in this moment of significance.', 5000);
    
    // Schedule transition back to listening after extended delay
    this.kairosTimeout = setTimeout(() => {
      if (this.currentStage === 'kairos') {
        this.transitionToListening();
      }
    }, 15000); // Extended duration for kairos moment
  }

  transitionToFarewell() {
    console.log('Transitioning to Farewell stage');
    
    // Clear any pending timeouts
    if (this.kairosTimeout) {
      clearTimeout(this.kairosTimeout);
      this.kairosTimeout = null;
    }
    
    // Update stage
    this.currentStage = 'farewell';
    this.stateManager.setState('interaction.stage', 'farewell');
    
    // Visual: fade out pixel
    this.pixelRenderer.transitionColor('#34495e', 2000); // Dark blue
    this.pixelRenderer.startBreathing(0.1, 0.1); // Slow, shallow breathing
    this.pixelRenderer.fadeOut(5000);
    
    // Haptic: farewell pattern
    this.hapticFeedback.playPattern('farewell');
    
    // Audio: fade out
    if (this.audioSystem) {
      this.audioSystem.fadeOut(3000);
    }
    
    // Message: farewell message
    this.messageDisplay.showMessage('Farewell. I will be here when you return.', 4000);
  }
}
