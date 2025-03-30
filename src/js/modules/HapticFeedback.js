// HapticFeedback.js - Manages vibration patterns and haptic feedback

export default class HapticFeedback {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.isVibrationSupported = 'vibrate' in navigator;
    this.intensity = 1.0;
    this.isEnabled = true;
    this.visualFeedbackEnabled = !this.isVibrationSupported; // Enable visual feedback if vibration not supported
    
    // Define haptic patterns (durations in ms)
    this.patterns = {
      greeting: [50, 70, 80, 70, 120],
      listening: [20, 1000, 20],
      responding: [30, 50, 30],
      insight: [40, 40, 150],
      kairos: [60, 80, 100, 120, 140, 120, 100, 80, 60],
      farewell: [120, 70, 80, 70, 50],
      confirmation: [80, 0, 80],
      tap: [40],
      error: [20, 30, 20, 30, 20]
    };
  }

  init() {
    // Set up visual haptic indicator for iOS
    this.visualIndicator = document.getElementById('visual-haptic-indicator');
    
    // Listen for state changes
    this.stateManager.on('haptic.intensity', this.handleIntensityChange.bind(this));
    this.stateManager.on('haptic.enabled', this.handleEnabledChange.bind(this));
    
    console.log('HapticFeedback initialized, vibration supported:', this.isVibrationSupported);
  }

  handleIntensityChange({ newValue }) {
    this.intensity = newValue;
  }

  handleEnabledChange({ newValue }) {
    this.isEnabled = newValue;
  }

  playPattern(patternName) {
    if (!this.isEnabled) return false;
    
    const pattern = this.patterns[patternName];
    if (!pattern) {
      console.error(`Unknown haptic pattern: ${patternName}`);
      return false;
    }
    
    // Apply intensity to pattern
    const scaledPattern = this.scalePattern(pattern, this.intensity);
    
    // Play vibration if supported
    if (this.isVibrationSupported) {
      try {
        navigator.vibrate(scaledPattern);
      } catch (error) {
        console.warn('Vibration failed:', error);
        this.showVisualFeedback(patternName);
        return false;
      }
    } else {
      // Show visual feedback if vibration not supported (iOS)
      this.showVisualFeedback(patternName);
    }
    
    return true;
  }

  // Scale pattern based on intensity
  scalePattern(pattern, intensity) {
    return pattern.map((duration, index) => {
      // Only scale vibration durations (even indices), not pauses (odd indices)
      if (index % 2 === 0) {
        return Math.round(duration * intensity);
      }
      return duration;
    });
  }

  // Show visual feedback for haptic patterns (for iOS)
  showVisualFeedback(patternName) {
    if (!this.visualFeedbackEnabled || !this.visualIndicator) return;
    
    // Set color based on pattern
    let color = 'rgba(255, 255, 255, 0.3)';
    
    switch (patternName) {
      case 'greeting':
        color = 'rgba(52, 152, 219, 0.3)'; // Blue
        break;
      case 'listening':
        color = 'rgba(46, 204, 113, 0.3)'; // Green
        break;
      case 'responding':
        color = 'rgba(155, 89, 182, 0.3)'; // Purple
        break;
      case 'insight':
        color = 'rgba(241, 196, 15, 0.3)'; // Yellow
        break;
      case 'kairos':
        color = 'rgba(255, 255, 255, 0.3)'; // White
        break;
      case 'farewell':
        color = 'rgba(52, 73, 94, 0.3)'; // Dark blue
        break;
      case 'confirmation':
        color = 'rgba(46, 204, 113, 0.3)'; // Green
        break;
      case 'tap':
        color = 'rgba(231, 76, 60, 0.3)'; // Red
        break;
      case 'error':
        color = 'rgba(231, 76, 60, 0.3)'; // Red
        break;
    }
    
    this.visualIndicator.style.backgroundColor = color;
    this.visualIndicator.classList.remove('hidden');
    this.visualIndicator.classList.add('active');
    
    // Remove after animation completes
    setTimeout(() => {
      this.visualIndicator.classList.remove('active');
      this.visualIndicator.classList.add('hidden');
    }, 500);
  }

  // Play a simple vibration
  vibrate(duration) {
    if (!this.isEnabled) return false;
    
    const scaledDuration = Math.round(duration * this.intensity);
    
    if (this.isVibrationSupported) {
      try {
        navigator.vibrate(scaledDuration);
      } catch (error) {
        console.warn('Vibration failed:', error);
        this.showVisualFeedback('tap');
        return false;
      }
    } else {
      // Show visual feedback if vibration not supported (iOS)
      this.showVisualFeedback('tap');
    }
    
    return true;
  }

  // Stop any ongoing vibration
  stop() {
    if (this.isVibrationSupported) {
      try {
        navigator.vibrate(0);
      } catch (error) {
        console.warn('Failed to stop vibration:', error);
        return false;
      }
    }
    
    return true;
  }

  // Set haptic intensity
  setIntensity(intensity) {
    const clampedIntensity = Math.max(0, Math.min(2, intensity));
    this.stateManager.setState('haptic.intensity', clampedIntensity);
    return clampedIntensity;
  }

  // Enable or disable haptic feedback
  setEnabled(enabled) {
    this.stateManager.setState('haptic.enabled', enabled);
    return enabled;
  }

  // Enable or disable visual feedback
  setVisualFeedbackEnabled(enabled) {
    this.visualFeedbackEnabled = enabled;
    return enabled;
  }

  // Check if vibration is supported
  isSupported() {
    return this.isVibrationSupported;
  }

  // Get current intensity
  getIntensity() {
    return this.intensity;
  }

  // Get enabled state
  isHapticEnabled() {
    return this.isEnabled;
  }
}
