// AdminPanel.js - Provides testing and debugging capabilities

export default class AdminPanel {
  constructor(stateManager, modules) {
    this.stateManager = stateManager;
    this.pixelRenderer = modules.pixelRenderer;
    this.hapticFeedback = modules.hapticFeedback;
    this.audioSystem = modules.audioSystem;
    this.interactionManager = modules.interactionManager;
    this.sensorManager = modules.sensorManager;
    this.touchInterface = modules.touchInterface;
    
    this.isVisible = false;
    this.tapCount = 0;
    this.lastTapTime = 0;
    this.tapTimeout = null;
    this.tapThreshold = 500; // ms between taps
    this.requiredTaps = 4; // number of taps to show panel
  }

  init() {
    // Get panel element
    this.panel = document.getElementById('admin-panel');
    if (!this.panel) {
      console.error('Admin panel element not found');
      return;
    }
    
    // Set up event listeners for panel controls
    this.setupPixelControls();
    this.setupHapticControls();
    this.setupAudioControls();
    this.setupInteractionFlowControls();
    
    // Set up close button
    const closeButton = document.getElementById('close-admin');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.toggle());
    }
    
    // Set up tap detection for panel activation
    document.addEventListener('touchstart', this.handleTouchStart.bind(this));
    document.addEventListener('mousedown', this.handleMouseDown.bind(this));
    
    console.log('AdminPanel initialized');
  }

  setupPixelControls() {
    // Opacity control
    const opacitySlider = document.getElementById('pixel-opacity');
    const opacityValue = document.getElementById('opacity-value');
    
    if (opacitySlider && opacityValue) {
      opacitySlider.value = this.stateManager.getState().pixel.opacity;
      opacityValue.textContent = opacitySlider.value;
      
      opacitySlider.addEventListener('input', () => {
        const value = parseFloat(opacitySlider.value);
        this.stateManager.setState('pixel.opacity', value);
        opacityValue.textContent = value.toFixed(2);
      });
    }
    
    // Size control
    const sizeSlider = document.getElementById('pixel-size');
    const sizeValue = document.getElementById('size-value');
    
    if (sizeSlider && sizeValue) {
      sizeSlider.value = this.stateManager.getState().pixel.size;
      sizeValue.textContent = sizeSlider.value;
      
      sizeSlider.addEventListener('input', () => {
        const value = parseFloat(sizeSlider.value);
        this.stateManager.setState('pixel.size', value);
        sizeValue.textContent = value.toFixed(1);
      });
    }
    
    // Breathing rate control
    const breathingSlider = document.getElementById('breathing-rate');
    const breathingValue = document.getElementById('breathing-rate-value');
    
    if (breathingSlider && breathingValue) {
      breathingSlider.value = this.stateManager.getState().pixel.breathingRate;
      breathingValue.textContent = breathingSlider.value;
      
      breathingSlider.addEventListener('input', () => {
        const value = parseFloat(breathingSlider.value);
        this.stateManager.setState('pixel.breathingRate', value);
        breathingValue.textContent = value.toFixed(2);
        
        if (this.pixelRenderer) {
          this.pixelRenderer.startBreathing(value, this.stateManager.getState().pixel.breathingDepth);
        }
      });
    }
    
    // Color control
    const colorPicker = document.getElementById('pixel-color');
    
    if (colorPicker) {
      colorPicker.value = this.stateManager.getState().pixel.color;
      
      colorPicker.addEventListener('input', () => {
        this.stateManager.setState('pixel.color', colorPicker.value);
        
        if (this.pixelRenderer) {
          this.pixelRenderer.transitionColor(colorPicker.value, 500);
        }
      });
    }
  }

  setupHapticControls() {
    // Intensity control
    const intensitySlider = document.getElementById('haptic-intensity');
    const intensityValue = document.getElementById('intensity-value');
    
    if (intensitySlider && intensityValue) {
      intensitySlider.value = this.hapticFeedback ? this.hapticFeedback.intensityFactor : 1.0;
      intensityValue.textContent = intensitySlider.value;
      
      intensitySlider.addEventListener('input', () => {
        const value = parseFloat(intensitySlider.value);
        
        if (this.hapticFeedback) {
          this.hapticFeedback.setIntensity(value);
        }
        
        intensityValue.textContent = value.toFixed(1);
      });
    }
    
    // Test pattern buttons
    const testGreeting = document.getElementById('test-greeting');
    const testListening = document.getElementById('test-listening');
    const testInsight = document.getElementById('test-insight');
    const testFarewell = document.getElementById('test-farewell');
    
    if (testGreeting && this.hapticFeedback) {
      testGreeting.addEventListener('click', () => {
        this.hapticFeedback.playPattern('greeting');
      });
    }
    
    if (testListening && this.hapticFeedback) {
      testListening.addEventListener('click', () => {
        this.hapticFeedback.playPattern('listening');
      });
    }
    
    if (testInsight && this.hapticFeedback) {
      testInsight.addEventListener('click', () => {
        this.hapticFeedback.playPattern('insight');
      });
    }
    
    if (testFarewell && this.hapticFeedback) {
      testFarewell.addEventListener('click', () => {
        this.hapticFeedback.playPattern('farewell');
      });
    }
  }

  setupAudioControls() {
    // Volume control
    const volumeSlider = document.getElementById('master-volume');
    const volumeValue = document.getElementById('volume-value');
    
    if (volumeSlider && volumeValue && this.audioSystem) {
      volumeSlider.value = this.audioSystem.masterVolume;
      volumeValue.textContent = volumeSlider.value;
      
      volumeSlider.addEventListener('input', () => {
        const value = parseFloat(volumeSlider.value);
        
        if (this.audioSystem) {
          this.audioSystem.setMasterVolume(value);
        }
        
        volumeValue.textContent = value.toFixed(2);
      });
    }
    
    // Test sound buttons
    const testAmbient = document.getElementById('test-ambient');
    const testChime = document.getElementById('test-chime');
    const testPulse = document.getElementById('test-pulse');
    
    if (testAmbient && this.audioSystem) {
      testAmbient.addEventListener('click', () => {
        this.audioSystem.playAmbient('default');
      });
    }
    
    if (testChime && this.audioSystem) {
      testChime.addEventListener('click', () => {
        this.audioSystem.playSound('chime');
      });
    }
    
    if (testPulse && this.audioSystem) {
      testPulse.addEventListener('click', () => {
        this.audioSystem.playSound('pulse');
      });
    }
  }

  setupInteractionFlowControls() {
    // Flow stage buttons
    const flowEmergence = document.getElementById('flow-emergence');
    const flowGreeting = document.getElementById('flow-greeting');
    const flowListening = document.getElementById('flow-listening');
    const flowResponding = document.getElementById('flow-responding');
    const flowInsight = document.getElementById('flow-insight');
    const flowKairos = document.getElementById('flow-kairos');
    const flowFarewell = document.getElementById('flow-farewell');
    
    if (flowEmergence && this.interactionManager) {
      flowEmergence.addEventListener('click', () => {
        this.interactionManager.transitionToEmergence();
      });
    }
    
    if (flowGreeting && this.interactionManager) {
      flowGreeting.addEventListener('click', () => {
        this.interactionManager.transitionToGreeting();
      });
    }
    
    if (flowListening && this.interactionManager) {
      flowListening.addEventListener('click', () => {
        this.interactionManager.transitionToListening();
      });
    }
    
    if (flowResponding && this.interactionManager) {
      flowResponding.addEventListener('click', () => {
        this.interactionManager.transitionToResponding();
      });
    }
    
    if (flowInsight && this.interactionManager) {
      flowInsight.addEventListener('click', () => {
        this.interactionManager.transitionToInsight();
      });
    }
    
    if (flowKairos && this.interactionManager) {
      flowKairos.addEventListener('click', () => {
        this.interactionManager.transitionToKairosMoment();
      });
    }
    
    if (flowFarewell && this.interactionManager) {
      flowFarewell.addEventListener('click', () => {
        this.interactionManager.transitionToFarewell();
      });
    }
  }

  handleTouchStart(event) {
    // Get touch position
    const touch = event.touches[0];
    if (!touch) return;
    
    const x = touch.clientX;
    const y = touch.clientY;
    
    // Check if touch is in top-right corner (20% of screen width/height)
    const cornerWidth = window.innerWidth * 0.2;
    const cornerHeight = window.innerHeight * 0.2;
    
    if (x > window.innerWidth - cornerWidth && y < cornerHeight) {
      this.handleCornerTap();
    }
  }

  handleMouseDown(event) {
    const x = event.clientX;
    const y = event.clientY;
    
    // Check if click is in top-right corner (20% of screen width/height)
    const cornerWidth = window.innerWidth * 0.2;
    const cornerHeight = window.innerHeight * 0.2;
    
    if (x > window.innerWidth - cornerWidth && y < cornerHeight) {
      this.handleCornerTap();
    }
  }

  handleCornerTap() {
    const now = Date.now();
    
    // Reset tap count if too much time has passed
    if (now - this.lastTapTime > this.tapThreshold) {
      this.tapCount = 0;
      clearTimeout(this.tapTimeout);
    }
    
    // Increment tap count
    this.tapCount++;
    this.lastTapTime = now;
    
    // Clear existing timeout
    if (this.tapTimeout) {
      clearTimeout(this.tapTimeout);
    }
    
    // Set timeout to reset tap count
    this.tapTimeout = setTimeout(() => {
      this.tapCount = 0;
    }, this.tapThreshold);
    
    // Show panel if enough taps
    if (this.tapCount >= this.requiredTaps) {
      this.toggle();
      this.tapCount = 0;
    }
  }

  toggle() {
    this.isVisible = !this.isVisible;
    
    if (this.isVisible) {
      this.panel.classList.remove('hidden');
      this.updateSensorData();
      this.updateTouchData();
    } else {
      this.panel.classList.add('hidden');
    }
  }

  updateSensorData() {
    if (!this.isVisible) return;
    
    const motionValue = document.getElementById('motion-value');
    const orientationValue = document.getElementById('orientation-value');
    const holdingValue = document.getElementById('holding-value');
    
    if (motionValue && this.sensorManager) {
      const magnitude = this.sensorManager.getMotionMagnitude();
      motionValue.textContent = magnitude.toFixed(3);
    }
    
    if (orientationValue && this.sensorManager) {
      const orientation = this.sensorManager.getOrientation();
      orientationValue.textContent = `α: ${orientation.alpha.toFixed(0)}°, β: ${orientation.beta.toFixed(0)}°, γ: ${orientation.gamma.toFixed(0)}°`;
    }
    
    if (holdingValue && this.sensorManager) {
      holdingValue.textContent = this.sensorManager.isDeviceHeld() ? 'Yes' : 'No';
    }
  }

  updateTouchData() {
    if (!this.isVisible) return;
    
    const touchPosition = document.getElementById('touch-position');
    const gestureValue = document.getElementById('gesture-value');
    
    if (touchPosition && this.touchInterface) {
      const lastTouch = this.touchInterface.getLastTouchPosition();
      if (lastTouch) {
        touchPosition.textContent = `X: ${lastTouch.x.toFixed(0)}, Y: ${lastTouch.y.toFixed(0)}`;
      } else {
        touchPosition.textContent = 'None';
      }
    }
    
    if (gestureValue && this.touchInterface) {
      const lastGesture = this.touchInterface.getLastGesture();
      gestureValue.textContent = lastGesture || 'None';
    }
  }
}
