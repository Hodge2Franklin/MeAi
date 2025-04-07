/**
 * SensorManager.js
 * Comprehensive sensor integration for MeAi enhanced implementation
 * Handles device motion, orientation, and touch interactions
 */

class SensorManager {
  /**
   * Initialize the SensorManager
   * @param {Object} stateManager - StateManager instance
   * @param {Object} featureDetector - FeatureDetector instance
   * @param {Object} options - Configuration options
   */
  constructor(stateManager, featureDetector, options = {}) {
    this.stateManager = stateManager;
    this.featureDetector = featureDetector;
    
    // Default options
    this.options = {
      motionSamplingRate: 100, // ms between motion samples
      orientationSamplingRate: 100, // ms between orientation samples
      motionThreshold: 0.05, // minimum acceleration to register as motion
      attentionQualityDecayRate: 0.05, // rate at which attention quality decays
      ...options
    };
    
    // Sensor data
    this.sensorData = {
      motion: {
        acceleration: { x: 0, y: 0, z: 0 },
        rotationRate: { alpha: 0, beta: 0, gamma: 0 },
        interval: 0,
        timestamp: 0
      },
      orientation: {
        absolute: false,
        alpha: 0, // z-axis
        beta: 0,  // x-axis
        gamma: 0, // y-axis
        timestamp: 0
      },
      touch: {
        active: false,
        position: { x: 0, y: 0 },
        startPosition: { x: 0, y: 0 },
        duration: 0,
        pressure: 0,
        timestamp: 0
      },
      proximity: {
        near: false,
        timestamp: 0
      },
      light: {
        value: null,
        timestamp: 0
      }
    };
    
    // Derived metrics
    this.metrics = {
      motionIntensity: 0,
      stabilityScore: 1.0,
      attentionQuality: 0.5,
      interactionQuality: 0.5,
      presenceScore: 0.0,
      lastSignificantMotion: 0,
      lastSignificantTouch: 0
    };
    
    // Sensor intervals
    this.intervals = {};
    
    // Event listeners
    this.listeners = {};
    
    // Bind methods
    this.init = this.init.bind(this);
    this.destroy = this.destroy.bind(this);
    this.handleDeviceMotion = this.handleDeviceMotion.bind(this);
    this.handleDeviceOrientation = this.handleDeviceOrientation.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.updateMetrics = this.updateMetrics.bind(this);
  }
  
  /**
   * Initialize sensors
   * @returns {Promise} Resolves when sensors are initialized
   */
  async init() {
    // Check feature support
    const features = this.featureDetector.getFeatureSupport();
    
    // Request permissions if needed
    if (features.isIOS) {
      try {
        if (features.deviceMotion && 
            typeof DeviceMotionEvent.requestPermission === 'function') {
          const motionPermission = await DeviceMotionEvent.requestPermission();
          if (motionPermission === 'granted') {
            this.initMotionSensors();
          }
        }
        
        if (features.deviceOrientation && 
            typeof DeviceOrientationEvent.requestPermission === 'function') {
          const orientationPermission = await DeviceOrientationEvent.requestPermission();
          if (orientationPermission === 'granted') {
            this.initOrientationSensors();
          }
        }
      } catch (error) {
        console.error('Error requesting sensor permissions:', error);
      }
    } else {
      // Non-iOS devices don't need permission
      if (features.deviceMotion) {
        this.initMotionSensors();
      }
      
      if (features.deviceOrientation) {
        this.initOrientationSensors();
      }
    }
    
    // Initialize touch sensors (always available)
    this.initTouchSensors();
    
    // Start metrics update interval
    this.intervals.metrics = setInterval(
      this.updateMetrics, 
      this.options.motionSamplingRate
    );
    
    return true;
  }
  
  /**
   * Initialize motion sensors
   * @private
   */
  initMotionSensors() {
    // Add device motion event listener
    window.addEventListener('devicemotion', this.handleDeviceMotion);
    
    // Store listener reference for cleanup
    this.listeners.deviceMotion = this.handleDeviceMotion;
  }
  
  /**
   * Initialize orientation sensors
   * @private
   */
  initOrientationSensors() {
    // Add device orientation event listener
    window.addEventListener('deviceorientation', this.handleDeviceOrientation);
    
    // Store listener reference for cleanup
    this.listeners.deviceOrientation = this.handleDeviceOrientation;
  }
  
  /**
   * Initialize touch sensors
   * @private
   */
  initTouchSensors() {
    // Add touch event listeners
    document.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    document.addEventListener('touchmove', this.handleTouchMove, { passive: true });
    document.addEventListener('touchend', this.handleTouchEnd);
    document.addEventListener('touchcancel', this.handleTouchEnd);
    
    // Store listener references for cleanup
    this.listeners.touchStart = this.handleTouchStart;
    this.listeners.touchMove = this.handleTouchMove;
    this.listeners.touchEnd = this.handleTouchEnd;
  }
  
  /**
   * Handle device motion event
   * @param {DeviceMotionEvent} event - Device motion event
   */
  handleDeviceMotion(event) {
    // Extract acceleration data
    const acceleration = event.accelerationIncludingGravity || event.acceleration || { x: 0, y: 0, z: 0 };
    
    // Extract rotation rate data
    const rotationRate = event.rotationRate || { alpha: 0, beta: 0, gamma: 0 };
    
    // Update sensor data
    this.sensorData.motion = {
      acceleration: {
        x: acceleration.x || 0,
        y: acceleration.y || 0,
        z: acceleration.z || 0
      },
      rotationRate: {
        alpha: rotationRate.alpha || 0,
        beta: rotationRate.beta || 0,
        gamma: rotationRate.gamma || 0
      },
      interval: event.interval || 0,
      timestamp: Date.now()
    };
    
    // Calculate motion intensity
    const accel = this.sensorData.motion.acceleration;
    const rotation = this.sensorData.motion.rotationRate;
    
    // Combine acceleration and rotation for overall motion intensity
    const accelMagnitude = Math.sqrt(
      accel.x * accel.x + 
      accel.y * accel.y + 
      accel.z * accel.z
    );
    
    const rotationMagnitude = Math.sqrt(
      rotation.alpha * rotation.alpha + 
      rotation.beta * rotation.beta + 
      rotation.gamma * rotation.gamma
    ) / 360; // Normalize to 0-1 range
    
    // Weighted combination of acceleration and rotation
    this.metrics.motionIntensity = Math.min(
      1.0, 
      (accelMagnitude * 0.7 + rotationMagnitude * 0.3) / 10
    );
    
    // Update last significant motion timestamp if motion is above threshold
    if (this.metrics.motionIntensity > this.options.motionThreshold) {
      this.metrics.lastSignificantMotion = Date.now();
    }
  }
  
  /**
   * Handle device orientation event
   * @param {DeviceOrientationEvent} event - Device orientation event
   */
  handleDeviceOrientation(event) {
    // Update sensor data
    this.sensorData.orientation = {
      absolute: event.absolute || false,
      alpha: event.alpha || 0,
      beta: event.beta || 0,
      gamma: event.gamma || 0,
      timestamp: Date.now()
    };
    
    // Calculate stability score based on how level the device is
    // Beta is tilt front-to-back (0 when flat)
    // Gamma is tilt left-to-right (0 when flat)
    const betaStability = 1 - Math.min(1, Math.abs(this.sensorData.orientation.beta) / 45);
    const gammaStability = 1 - Math.min(1, Math.abs(this.sensorData.orientation.gamma) / 45);
    
    // Combined stability score (0-1, higher is more stable/level)
    this.metrics.stabilityScore = (betaStability + gammaStability) / 2;
  }
  
  /**
   * Handle touch start event
   * @param {TouchEvent} event - Touch event
   */
  handleTouchStart(event) {
    if (!event.touches || event.touches.length === 0) {
      return;
    }
    
    const touch = event.touches[0];
    
    // Update sensor data
    this.sensorData.touch = {
      active: true,
      position: {
        x: touch.clientX,
        y: touch.clientY
      },
      startPosition: {
        x: touch.clientX,
        y: touch.clientY
      },
      duration: 0,
      pressure: touch.force || touch.webkitForce || 1.0,
      timestamp: Date.now()
    };
    
    // Update metrics
    this.metrics.lastSignificantTouch = Date.now();
    
    // Increase attention quality on touch
    this.metrics.attentionQuality = Math.min(
      1.0, 
      this.metrics.attentionQuality + 0.2
    );
  }
  
  /**
   * Handle touch move event
   * @param {TouchEvent} event - Touch event
   */
  handleTouchMove(event) {
    if (!event.touches || event.touches.length === 0 || !this.sensorData.touch.active) {
      return;
    }
    
    const touch = event.touches[0];
    
    // Update position and pressure
    this.sensorData.touch.position = {
      x: touch.clientX,
      y: touch.clientY
    };
    
    this.sensorData.touch.pressure = touch.force || touch.webkitForce || 1.0;
    
    // Update duration
    this.sensorData.touch.duration = Date.now() - this.sensorData.touch.timestamp;
  }
  
  /**
   * Handle touch end event
   * @param {TouchEvent} event - Touch event
   */
  handleTouchEnd() {
    // Update sensor data
    this.sensorData.touch.active = false;
    this.sensorData.touch.duration = Date.now() - this.sensorData.touch.timestamp;
    
    // Long touch increases attention quality more
    if (this.sensorData.touch.duration > 1000) {
      this.metrics.attentionQuality = Math.min(
        1.0, 
        this.metrics.attentionQuality + 0.1
      );
    }
  }
  
  /**
   * Update derived metrics
   */
  updateMetrics() {
    const now = Date.now();
    
    // Calculate time since last significant interaction
    const timeSinceMotion = now - this.metrics.lastSignificantMotion;
    const timeSinceTouch = now - this.metrics.lastSignificantTouch;
    const timeSinceInteraction = Math.min(timeSinceMotion, timeSinceTouch);
    
    // Decay attention quality over time
    if (timeSinceInteraction > 5000) { // 5 seconds
      this.metrics.attentionQuality = Math.max(
        0.1, 
        this.metrics.attentionQuality - this.options.attentionQualityDecayRate
      );
    }
    
    // Calculate presence score
    // Higher when device is stable and attention quality is high
    this.metrics.presenceScore = 
      this.metrics.stabilityScore * 0.4 + 
      this.metrics.attentionQuality * 0.6;
    
    // Calculate interaction quality
    // Higher when presence is high and motion is low-to-moderate
    const optimalMotion = 0.2; // Optimal motion intensity
    const motionFactor = 1 - Math.abs(this.metrics.motionIntensity - optimalMotion) / optimalMotion;
    
    this.metrics.interactionQuality = 
      this.metrics.presenceScore * 0.7 + 
      motionFactor * 0.3;
    
    // Update state manager with user presence data
    this.stateManager.updateUserPresence({
      isPresent: this.metrics.presenceScore > 0.3,
      attentionQuality: this.metrics.attentionQuality,
      interactionQuality: this.metrics.interactionQuality,
      lastInteraction: Math.max(
        this.metrics.lastSignificantMotion,
        this.metrics.lastSignificantTouch
      )
    });
  }
  
  /**
   * Detect device handover
   * @returns {boolean} Whether device handover was detected
   */
  detectDeviceHandover() {
    // Device handover is characterized by:
    // 1. Significant motion spike
    // 2. Followed by new stable orientation
    // 3. Possibly new touch patterns
    
    // This is a simplified implementation
    const motionSpike = this.metrics.motionIntensity > 0.7;
    const recentMotion = Date.now() - this.metrics.lastSignificantMotion < 2000;
    const newStability = this.metrics.stabilityScore > 0.7;
    
    return motionSpike && recentMotion && newStability;
  }
  
  /**
   * Detect breathing pattern
   * @returns {Object|null} Breathing pattern data or null if not detected
   */
  detectBreathingPattern() {
    // This would require a more sophisticated algorithm
    // analyzing motion patterns over time to detect rhythmic
    // breathing movements
    
    // Simplified implementation that looks for gentle rhythmic motion
    const isGentle = this.metrics.motionIntensity < 0.2 && this.metrics.motionIntensity > 0.05;
    const isStable = this.metrics.stabilityScore > 0.8;
    
    if (isGentle && isStable) {
      // Analyze motion data for rhythmic patterns
      // This is a placeholder for a more sophisticated algorithm
      return {
        detected: true,
        rate: 12, // breaths per minute (placeholder)
        regularity: 0.8, // 0-1 scale (placeholder)
        depth: 0.6 // 0-1 scale (placeholder)
      };
    }
    
    return null;
  }
  
  /**
   * Detect emotional state from sensor data
   * @returns {Object} Emotional state data
   */
  detectEmotionalState() {
    // This is a simplified implementation
    // A real implementation would use more sophisticated
    // analysis of motion patterns, touch behavior, etc.
    
    // Detect agitation
    const isAgitated = this.metrics.motionIntensity > 0.4;
    
    // Detect calmness
    const isCalm = this.metrics.motionIntensity < 0.1 && this.metrics.stabilityScore > 0.9;
    
    // Detect engagement
    const isEngaged = this.metrics.attentionQuality > 0.7;
    
    // Determine primary emotional state
    let primaryState = 'neutral';
    let intensity = 0.5;
    
    if (isAgitated) {
      primaryState = 'agitated';
      intensity = this.metrics.motionIntensity;
    } else if (isCalm) {
      primaryState = 'calm';
      intensity = this.metrics.stabilityScore;
    } else if (isEngaged) {
      primaryState = 'engaged';
      intensity = this.metrics.attentionQuality;
    }
    
    return {
      primaryState,
      intensity,
      agitation: isAgitated ? this.metrics.motionIntensity : 0,
      calmness: isCalm ? this.metrics.stabilityScore : 0,
      engagement: this.metrics.attentionQuality
    };
  }
  
  /**
   * Get current sensor data
   * @returns {Object} Current sensor data
   */
  getSensorData() {
    return { ...this.sensorData };
  }
  
  /**
   * Get current metrics
   * @returns {Object} Current metrics
   */
  getMetrics() {
    return { ...this.metrics };
  }
  
  /**
   * Check if device is being held
   * @returns {boolean} Whether device is being held
   */
  isDeviceHeld() {
    // Device is considered held if:
    // 1. There is some minimal motion (but not too much)
    // 2. Device is relatively stable
    // 3. Recent touch activity
    
    const gentleMotion = this.metrics.motionIntensity > 0.05 && this.metrics.motionIntensity < 0.3;
    const isStable = this.metrics.stabilityScore > 0.6;
    const recentTouch = Date.now() - this.metrics.lastSignificantTouch < 30000; // 30 seconds
    
    return gentleMotion && isStable && recentTouch;
  }
  
  /**
   * Check if device is resting on surface
   * @returns {boolean} Whether device is resting on surface
   */
  isDeviceResting() {
    // Device is considered resting if:
    // 1. Very little motion
    // 2. High stability score
    // 3. No recent touch activity
    
    const minimalMotion = this.metrics.motionIntensity < 0.05;
    const highStability = this.metrics.stabilityScore > 0.9;
    const noRecentTouch = Date.now() - this.metrics.lastSignificantTouch > 10000; // 10 seconds
    
    return minimalMotion && highStability && noRecentTouch;
  }
  
  /**
   * Destroy sensor manager and clean up
   */
  destroy() {
    // Remove event listeners
    if (this.listeners.deviceMotion) {
      window.removeEventListener('devicemotion', this.listeners.deviceMotion);
    }
    
    if (this.listeners.deviceOrientation) {
      window.removeEventListener('deviceorientation', this.listeners.deviceOrientation);
    }
    
    if (this.listeners.touchStart) {
      document.removeEventListener('touchstart', this.listeners.touchStart);
      document.removeEventListener('touchmove', this.listeners.touchMove);
      document.removeEventListener('touchend', this.listeners.touchEnd);
      document.removeEventListener('touchcancel', this.listeners.touchEnd);
    }
    
    // Clear intervals
    Object.keys(this.intervals).forEach(key => {
      clearInterval(this.intervals[key]);
    });
    
    this.intervals = {};
  }
}

// Export for use in other modules
export default SensorManager;
