// SensorManager.js - Integrates device motion, orientation, and other sensors

export default class SensorManager {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.isMotionSupported = false;
    this.isOrientationSupported = false;
    this.motionBuffer = [];
    this.motionBufferSize = 20;
    this.motionThreshold = 0.05; // threshold for detecting holding
    this.isHeld = false;
    this.batteryLevel = 1.0;
    this.isBatterySupported = false;
  }

  init() {
    // Check for motion and orientation support
    this.isMotionSupported = 'DeviceMotionEvent' in window;
    this.isOrientationSupported = 'DeviceOrientationEvent' in window;
    this.isBatterySupported = 'getBattery' in navigator;
    
    if (!this.isMotionSupported) {
      console.warn('Device motion is not supported in this browser');
    }
    
    if (!this.isOrientationSupported) {
      console.warn('Device orientation is not supported in this browser');
    }
    
    // Initialize motion buffer
    for (let i = 0; i < this.motionBufferSize; i++) {
      this.motionBuffer.push({
        acceleration: { x: 0, y: 0, z: 0 },
        timestamp: Date.now()
      });
    }
    
    // Set up motion event listener
    if (this.isMotionSupported) {
      window.addEventListener('devicemotion', this.handleMotion.bind(this));
    }
    
    // Set up orientation event listener
    if (this.isOrientationSupported) {
      window.addEventListener('deviceorientation', this.handleOrientation.bind(this));
    }
    
    // Set up battery monitoring
    if (this.isBatterySupported) {
      this.initBattery();
    }
    
    console.log('SensorManager initialized');
  }

  async initBattery() {
    try {
      const battery = await navigator.getBattery();
      
      // Update initial battery level
      this.batteryLevel = battery.level;
      this.stateManager.setState('device.batteryLevel', this.batteryLevel);
      
      // Listen for battery level changes
      battery.addEventListener('levelchange', () => {
        this.batteryLevel = battery.level;
        this.stateManager.setState('device.batteryLevel', this.batteryLevel);
      });
      
      console.log('Battery monitoring initialized');
    } catch (error) {
      console.warn('Battery monitoring failed:', error);
    }
  }

  handleMotion(event) {
    // Skip if no acceleration data
    if (!event.acceleration) {
      return;
    }
    
    // Add new motion data to buffer
    this.motionBuffer.push({
      acceleration: {
        x: event.acceleration.x || 0,
        y: event.acceleration.y || 0,
        z: event.acceleration.z || 0
      },
      timestamp: Date.now()
    });
    
    // Remove oldest entry if buffer is full
    if (this.motionBuffer.length > this.motionBufferSize) {
      this.motionBuffer.shift();
    }
    
    // Calculate motion magnitude
    const accel = event.acceleration;
    const magnitude = Math.sqrt(
      (accel.x || 0) * (accel.x || 0) +
      (accel.y || 0) * (accel.y || 0) +
      (accel.z || 0) * (accel.z || 0)
    );
    
    // Update state
    this.stateManager.setState('device.motionMagnitude', magnitude);
  }

  handleOrientation(event) {
    // Update orientation state
    this.stateManager.setState('device.orientation', {
      alpha: event.alpha || 0,
      beta: event.beta || 0,
      gamma: event.gamma || 0
    });
  }

  update() {
    // Detect if device is being held
    this.detectHolding();
    
    // Update admin panel data if it exists
    const adminPanel = document.getElementById('sensor-data');
    if (adminPanel) {
      const motionValue = document.getElementById('motion-value');
      const orientationValue = document.getElementById('orientation-value');
      const holdingValue = document.getElementById('holding-value');
      
      if (motionValue) {
        const magnitude = this.stateManager.getState().device.motionMagnitude || 0;
        motionValue.textContent = magnitude.toFixed(3);
      }
      
      if (orientationValue) {
        const orientation = this.stateManager.getState().device.orientation;
        orientationValue.textContent = `α: ${orientation.alpha.toFixed(0)}°, β: ${orientation.beta.toFixed(0)}°, γ: ${orientation.gamma.toFixed(0)}°`;
      }
      
      if (holdingValue) {
        holdingValue.textContent = this.isHeld ? 'Yes' : 'No';
      }
    }
  }

  detectHolding() {
    // Skip if motion is not supported
    if (!this.isMotionSupported) {
      return;
    }
    
    // Calculate motion magnitude over recent samples
    let totalMagnitude = 0;
    
    for (let i = 1; i < this.motionBuffer.length; i++) {
      const prev = this.motionBuffer[i - 1].acceleration;
      const curr = this.motionBuffer[i].acceleration;
      
      // Calculate change in acceleration
      const deltaX = curr.x - prev.x;
      const deltaY = curr.y - prev.y;
      const deltaZ = curr.z - prev.z;
      
      // Magnitude of change
      const magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
      totalMagnitude += magnitude;
    }
    
    // Average magnitude
    const avgMagnitude = totalMagnitude / (this.motionBuffer.length - 1);
    
    // Determine if device is being held
    const wasHeld = this.isHeld;
    this.isHeld = avgMagnitude < this.motionThreshold;
    
    // Update state if changed
    if (wasHeld !== this.isHeld) {
      this.stateManager.setState('device.isHeld', this.isHeld);
      
      // Emit presence change event
      if (this.isHeld) {
        this.stateManager.emit('presence.detected', { source: 'motion' });
      } else {
        this.stateManager.emit('presence.lost', { source: 'motion' });
      }
    }
  }

  getMotionMagnitude() {
    return this.stateManager.getState().device.motionMagnitude || 0;
  }

  getOrientation() {
    return this.stateManager.getState().device.orientation;
  }

  isDeviceHeld() {
    return this.isHeld;
  }

  getBatteryLevel() {
    return this.batteryLevel;
  }

  // Utility method to detect significant movement
  detectSignificantMovement(threshold = 0.5) {
    const magnitude = this.getMotionMagnitude();
    return magnitude > threshold;
  }

  // Utility method to detect device orientation change
  detectOrientationChange(prevOrientation, threshold = 15) {
    if (!prevOrientation) {
      return false;
    }
    
    const currOrientation = this.getOrientation();
    
    // Calculate difference in orientation
    const alphaDiff = Math.abs(currOrientation.alpha - prevOrientation.alpha);
    const betaDiff = Math.abs(currOrientation.beta - prevOrientation.beta);
    const gammaDiff = Math.abs(currOrientation.gamma - prevOrientation.gamma);
    
    // Check if any angle changed more than threshold
    return alphaDiff > threshold || betaDiff > threshold || gammaDiff > threshold;
  }

  // Utility method to detect device shake
  detectShake(threshold = 1.5) {
    // Need at least 4 samples to detect shake
    if (this.motionBuffer.length < 4) {
      return false;
    }
    
    // Count direction changes above threshold
    let directionChanges = 0;
    let prevDirection = null;
    
    for (let i = 1; i < this.motionBuffer.length; i++) {
      const prev = this.motionBuffer[i - 1].acceleration;
      const curr = this.motionBuffer[i].acceleration;
      
      // Calculate magnitude of acceleration
      const prevMag = Math.sqrt(prev.x * prev.x + prev.y * prev.y + prev.z * prev.z);
      const currMag = Math.sqrt(curr.x * curr.x + curr.y * curr.y + curr.z * curr.z);
      
      // Skip if magnitude is below threshold
      if (prevMag < threshold || currMag < threshold) {
        continue;
      }
      
      // Calculate dot product to determine direction
      const dotProduct = prev.x * curr.x + prev.y * curr.y + prev.z * curr.z;
      const direction = dotProduct > 0;
      
      // Check for direction change
      if (prevDirection !== null && direction !== prevDirection) {
        directionChanges++;
      }
      
      prevDirection = direction;
    }
    
    // Return true if enough direction changes
    return directionChanges >= 2;
  }
}
