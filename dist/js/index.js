// Update index.js to include the MeAiIntroduction module

// Import modules
import FeatureDetector from './modules/FeatureDetector.js';
import StateManager from './modules/StateManager.js';
import PixelRenderer from './modules/PixelRenderer.js';
import HapticFeedback from './modules/HapticFeedback.js';
import SensorManager from './modules/SensorManager.js';
import TouchInterface from './modules/TouchInterface.js';
import AudioSystem from './modules/AudioSystem.js';
import InteractionManager from './modules/InteractionManager.js';
import MessageDisplay from './modules/MessageDisplay.js';
import AdminPanel from './modules/AdminPanel.js';
import OnboardingTutorial from './modules/OnboardingTutorial.js';
import MeAiIntroduction from './modules/MeAiIntroduction.js';

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  console.log('Single Pixel + Haptic Mobile Web Prototype initializing...');
  
  // Create state manager (central state management)
  const stateManager = new StateManager();
  
  // Initialize system state
  stateManager.setState('system', {
    isInitialized: false,
    lastFrameTime: 0,
    deltaTime: 0,
    isVisible: true,
    isActive: true
  });
  
  // Initialize pixel state
  stateManager.setState('pixel', {
    opacity: 1.0,
    size: 1.0,
    color: '#ffffff',
    isBreathing: false,
    breathingRate: 0.25,
    breathingDepth: 0.2
  });
  
  // Initialize device state
  stateManager.setState('device', {
    isHeld: false,
    motionMagnitude: 0,
    orientation: { alpha: 0, beta: 0, gamma: 0 },
    batteryLevel: 1.0
  });
  
  // Initialize interaction state
  stateManager.setState('interaction', {
    stage: 'initializing', // initializing, emergence, greeting, listening, responding, insight, kairos, farewell
    presence: false,
    lastInteractionTime: Date.now(),
    message: '',
    messageVisible: false
  });
  
  // Initialize haptic state
  stateManager.setState('haptic', {
    intensity: 1.0,
    enabled: true
  });
  
  // Initialize modules
  const featureDetector = new FeatureDetector(stateManager);
  const pixelRenderer = new PixelRenderer(stateManager);
  const hapticFeedback = new HapticFeedback(stateManager);
  const sensorManager = new SensorManager(stateManager);
  const touchInterface = new TouchInterface(stateManager);
  const audioSystem = new AudioSystem(stateManager);
  const messageDisplay = new MessageDisplay(stateManager);
  const interactionManager = new InteractionManager(stateManager, {
    pixelRenderer,
    hapticFeedback,
    audioSystem,
    messageDisplay
  });
  const adminPanel = new AdminPanel(stateManager, {
    pixelRenderer,
    hapticFeedback,
    audioSystem,
    interactionManager,
    sensorManager,
    touchInterface
  });
  const onboardingTutorial = new OnboardingTutorial(stateManager, {
    pixelRenderer,
    hapticFeedback,
    audioSystem
  });
  const meAiIntroduction = new MeAiIntroduction(stateManager);
  
  // Store module references in state
  stateManager.setState('modules', {
    featureDetector,
    pixelRenderer,
    hapticFeedback,
    sensorManager,
    touchInterface,
    audioSystem,
    messageDisplay,
    interactionManager,
    adminPanel,
    onboardingTutorial,
    meAiIntroduction
  });
  
  // Fix for iOS touch events
  const fixIOSTouchEvents = () => {
    // Add touch event listeners to all buttons
    const addTouchListeners = (elements) => {
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        
        // Prevent default behavior to avoid double-firing
        element.addEventListener('touchstart', (e) => {
          e.preventDefault();
          element.classList.add('active');
        });
        
        element.addEventListener('touchend', (e) => {
          e.preventDefault();
          element.classList.remove('active');
          
          // Trigger click event
          const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
          });
          element.dispatchEvent(clickEvent);
        });
      }
    };
    
    // Add listeners to all buttons
    addTouchListeners(document.querySelectorAll('.intro-button'));
    addTouchListeners(document.querySelectorAll('.tutorial-button'));
    addTouchListeners(document.querySelectorAll('.admin-button'));
    
    // Fix range inputs for iOS
    const rangeInputs = document.querySelectorAll('input[type="range"]');
    for (let i = 0; i < rangeInputs.length; i++) {
      const input = rangeInputs[i];
      
      input.addEventListener('touchstart', (e) => {
        // Don't prevent default here to allow slider interaction
        updateRangeValue(e, input);
      });
      
      input.addEventListener('touchmove', (e) => {
        updateRangeValue(e, input);
      });
    }
    
    // Helper to update range input values on touch
    const updateRangeValue = (e, input) => {
      const touch = e.touches[0];
      const rect = input.getBoundingClientRect();
      const width = rect.width;
      const x = touch.clientX - rect.left;
      const min = parseFloat(input.min) || 0;
      const max = parseFloat(input.max) || 100;
      const step = parseFloat(input.step) || 1;
      
      // Calculate value based on touch position
      let percent = Math.max(0, Math.min(1, x / width));
      let value = min + percent * (max - min);
      
      // Apply step
      value = Math.round(value / step) * step;
      
      // Update input value
      input.value = value;
      
      // Trigger input and change events
      const inputEvent = new Event('input', { bubbles: true });
      const changeEvent = new Event('change', { bubbles: true });
      input.dispatchEvent(inputEvent);
      input.dispatchEvent(changeEvent);
    };
  };
  
  // Connect introduction to tutorial
  stateManager.on('introduction.complete', () => {
    console.log('Introduction complete, starting tutorial');
    // Show tutorial after introduction
    document.getElementById('tutorial-container').classList.remove('hidden');
    document.getElementById('tutorial-container').classList.add('visible');
    onboardingTutorial.init();
  });
  
  // Initialize application
  const init = async () => {
    try {
      // Detect features and request permissions
      await featureDetector.detectFeatures();
      await featureDetector.requestPermissions();
      
      // Initialize all modules
      pixelRenderer.init();
      hapticFeedback.init();
      sensorManager.init();
      touchInterface.init();
      audioSystem.init();
      messageDisplay.init();
      interactionManager.init();
      adminPanel.init();
      meAiIntroduction.init(); // Initialize MeAi introduction first
      
      // Apply iOS touch event fixes
      fixIOSTouchEvents();
      
      // Start animation loop
      requestAnimationFrame(animationLoop);
      
      // Set initialization complete
      stateManager.setState('system.isInitialized', true);
      console.log('Initialization complete');
    } catch (error) {
      console.error('Initialization failed:', error);
      messageDisplay.showMessage('Could not initialize all features. Some functionality may be limited.', 5000);
    }
  };
  
  // Main animation loop
  const animationLoop = (timestamp) => {
    // Calculate delta time
    const state = stateManager.getState();
    const lastFrameTime = state.system.lastFrameTime || timestamp;
    const deltaTime = timestamp - lastFrameTime;
    
    // Update system state
    stateManager.setState('system.lastFrameTime', timestamp);
    stateManager.setState('system.deltaTime', deltaTime);
    
    // Update modules
    pixelRenderer.update();
    sensorManager.update();
    touchInterface.update();
    audioSystem.update();
    interactionManager.update();
    
    // Render frame
    pixelRenderer.render();
    
    // Continue loop
    requestAnimationFrame(animationLoop);
  };
  
  // Handle visibility changes
  document.addEventListener('visibilitychange', () => {
    const isVisible = document.visibilityState === 'visible';
    stateManager.setState('system.isVisible', isVisible);
    interactionManager.handleVisibilityChange(isVisible);
  });
  
  // Start initialization
  init();
});
