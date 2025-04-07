/**
 * FeatureDetector.js
 * Comprehensive feature detection framework for MeAi enhanced implementation
 * Provides detection and fallbacks for critical browser features
 */

class FeatureDetector {
  constructor() {
    // Initialize detection results object
    this.features = {
      // Core features
      canvas: false,
      webgl: false,
      localStorage: false,
      indexedDB: false,
      
      // Sensor APIs
      deviceMotion: false,
      deviceOrientation: false,
      touchEvents: false,
      
      // Feedback APIs
      vibration: false,
      audioContext: false,
      speechSynthesis: false,
      
      // Performance APIs
      performanceAPI: false,
      requestAnimationFrame: false,
      
      // Device characteristics
      isMobile: false,
      isIOS: false,
      isAndroid: false,
      
      // Accessibility preferences
      prefersReducedMotion: false,
      prefersHighContrast: false
    };
    
    // Run detection on initialization
    this.detectFeatures();
  }
  
  /**
   * Run all feature detection tests
   */
  detectFeatures() {
    // Core features
    this.detectCanvas();
    this.detectWebGL();
    this.detectStorage();
    
    // Sensor APIs
    this.detectSensorAPIs();
    
    // Feedback APIs
    this.detectFeedbackAPIs();
    
    // Performance APIs
    this.detectPerformanceAPIs();
    
    // Device characteristics
    this.detectDeviceCharacteristics();
    
    // Accessibility preferences
    this.detectAccessibilityPreferences();
    
    console.log('Feature detection complete:', this.features);
  }
  
  /**
   * Detect canvas and related features
   */
  detectCanvas() {
    // Test for basic canvas support
    const canvas = document.createElement('canvas');
    this.features.canvas = !!(canvas.getContext && canvas.getContext('2d'));
    
    // Test for WebGL support
    if (this.features.canvas) {
      try {
        this.features.webgl = !!(
          canvas.getContext('webgl') || 
          canvas.getContext('experimental-webgl')
        );
      } catch (e) {
        this.features.webgl = false;
      }
    }
  }
  
  /**
   * Detect storage APIs
   */
  detectStorage() {
    // Test for localStorage
    try {
      localStorage.setItem('meai_test', 'test');
      localStorage.removeItem('meai_test');
      this.features.localStorage = true;
    } catch (e) {
      this.features.localStorage = false;
    }
    
    // Test for indexedDB
    this.features.indexedDB = !!window.indexedDB;
  }
  
  /**
   * Detect sensor APIs
   */
  detectSensorAPIs() {
    // Device motion
    this.features.deviceMotion = 'DeviceMotionEvent' in window;
    
    // Device orientation
    this.features.deviceOrientation = 'DeviceOrientationEvent' in window;
    
    // Touch events
    this.features.touchEvents = 'ontouchstart' in window || 
                               navigator.maxTouchPoints > 0;
  }
  
  /**
   * Detect feedback APIs
   */
  detectFeedbackAPIs() {
    // Vibration API
    this.features.vibration = 'vibrate' in navigator;
    
    // Audio Context
    this.features.audioContext = !!(
      window.AudioContext || window.webkitAudioContext
    );
    
    // Speech Synthesis
    this.features.speechSynthesis = 'speechSynthesis' in window;
  }
  
  /**
   * Detect performance APIs
   */
  detectPerformanceAPIs() {
    // Performance API
    this.features.performanceAPI = 'performance' in window;
    
    // requestAnimationFrame
    this.features.requestAnimationFrame = !!(
      window.requestAnimationFrame || 
      window.webkitRequestAnimationFrame || 
      window.mozRequestAnimationFrame
    );
  }
  
  /**
   * Detect device characteristics
   */
  detectDeviceCharacteristics() {
    // Mobile detection
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    this.features.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    this.features.isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    this.features.isAndroid = /Android/i.test(userAgent);
  }
  
  /**
   * Detect accessibility preferences
   */
  detectAccessibilityPreferences() {
    // Prefers reduced motion
    if (window.matchMedia) {
      this.features.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.features.prefersHighContrast = window.matchMedia('(prefers-contrast: more)').matches;
    }
  }
  
  /**
   * Request permissions for critical features
   * @returns {Promise} Resolves with an object containing permission statuses
   */
  async requestPermissions() {
    const permissions = {};
    
    // Request device motion/orientation permission (iOS 13+)
    if (this.features.isIOS && this.features.deviceMotion && 
        typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const motionPermission = await DeviceMotionEvent.requestPermission();
        permissions.deviceMotion = motionPermission === 'granted';
      } catch (e) {
        permissions.deviceMotion = false;
        console.error('Error requesting device motion permission:', e);
      }
    }
    
    if (this.features.isIOS && this.features.deviceOrientation && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const orientationPermission = await DeviceOrientationEvent.requestPermission();
        permissions.deviceOrientation = orientationPermission === 'granted';
      } catch (e) {
        permissions.deviceOrientation = false;
        console.error('Error requesting device orientation permission:', e);
      }
    }
    
    return permissions;
  }
  
  /**
   * Get all feature support information
   * @returns {Object} Feature support status
   */
  getFeatureSupport() {
    return { ...this.features };
  }
  
  /**
   * Check if a specific feature is supported
   * @param {string} featureName Name of the feature to check
   * @returns {boolean} Whether the feature is supported
   */
  isFeatureSupported(featureName) {
    return !!this.features[featureName];
  }
  
  /**
   * Get recommended fallback for unsupported feature
   * @param {string} featureName Name of the feature
   * @returns {string} Fallback strategy
   */
  getFallbackStrategy(featureName) {
    const fallbacks = {
      webgl: 'Use Canvas 2D API instead',
      deviceMotion: 'Use manual input for motion detection',
      deviceOrientation: 'Use touch gestures instead',
      vibration: 'Use visual feedback instead',
      speechSynthesis: 'Use text display instead',
      localStorage: 'Use in-memory storage with session warning',
      indexedDB: 'Use localStorage with size limitations'
    };
    
    return fallbacks[featureName] || 'No fallback available';
  }
  
  /**
   * Check if device meets minimum requirements for core experience
   * @returns {boolean} Whether device meets minimum requirements
   */
  meetsMinimumRequirements() {
    // Core requirements for basic functionality
    return this.features.canvas && 
           (this.features.localStorage || this.features.indexedDB) &&
           this.features.requestAnimationFrame;
  }
  
  /**
   * Get device capability profile
   * @returns {string} Capability profile ('high', 'medium', 'low')
   */
  getCapabilityProfile() {
    // Count supported features
    const supportedCount = Object.values(this.features)
      .filter(Boolean).length;
    
    // Calculate percentage of supported features
    const supportPercentage = supportedCount / Object.keys(this.features).length;
    
    if (supportPercentage > 0.8) return 'high';
    if (supportPercentage > 0.5) return 'medium';
    return 'low';
  }
}

// Export for use in other modules
export default FeatureDetector;
