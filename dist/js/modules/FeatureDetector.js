// FeatureDetector.js - Detects device capabilities and requests necessary permissions

export default class FeatureDetector {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.features = {
      vibration: false,
      deviceMotion: false,
      deviceOrientation: false,
      touchEvents: false,
      webAudio: false,
      battery: false
    };
  }

  async detectFeatures() {
    console.log('Detecting device features...');
    
    // Check vibration support
    this.features.vibration = 'vibrate' in navigator;
    
    // Check device motion support
    this.features.deviceMotion = 'DeviceMotionEvent' in window;
    
    // Check device orientation support
    this.features.deviceOrientation = 'DeviceOrientationEvent' in window;
    
    // Check touch events support
    this.features.touchEvents = 'ontouchstart' in window;
    
    // Check Web Audio API support
    this.features.webAudio = 'AudioContext' in window || 'webkitAudioContext' in window;
    
    // Check Battery API support
    this.features.battery = 'getBattery' in navigator;
    
    // Update state with detected features
    this.stateManager.setState('features', this.features);
    
    console.log('Feature detection complete:', this.features);
    return this.features;
  }

  async requestPermissions() {
    console.log('Requesting necessary permissions...');
    
    const permissions = {
      deviceMotion: false,
      deviceOrientation: false
    };
    
    // Request device motion permission if needed
    if (this.features.deviceMotion && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const motionPermission = await DeviceMotionEvent.requestPermission();
        permissions.deviceMotion = motionPermission === 'granted';
      } catch (error) {
        console.warn('Could not request device motion permission:', error);
      }
    } else if (this.features.deviceMotion) {
      // Assume permission granted if requestPermission is not available
      permissions.deviceMotion = true;
    }
    
    // Request device orientation permission if needed
    if (this.features.deviceOrientation && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const orientationPermission = await DeviceOrientationEvent.requestPermission();
        permissions.deviceOrientation = orientationPermission === 'granted';
      } catch (error) {
        console.warn('Could not request device orientation permission:', error);
      }
    } else if (this.features.deviceOrientation) {
      // Assume permission granted if requestPermission is not available
      permissions.deviceOrientation = true;
    }
    
    // Update state with permissions
    this.stateManager.setState('permissions', permissions);
    
    console.log('Permission requests complete:', permissions);
    return permissions;
  }

  isFeatureSupported(featureName) {
    return this.features[featureName] || false;
  }

  getUnsupportedFeatures() {
    return Object.keys(this.features).filter(feature => !this.features[feature]);
  }

  getSupportedFeatures() {
    return Object.keys(this.features).filter(feature => this.features[feature]);
  }
}
