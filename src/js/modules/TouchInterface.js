// TouchInterface.js - Handles touch events and gesture recognition

export default class TouchInterface {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.touchStartPosition = null;
    this.touchHistory = [];
    this.lastTouchPosition = null;
    this.lastGesture = null;
    this.lastTapTime = 0;
    this.lastTapPosition = null;
    
    // Constants for gesture recognition
    this.TAP_MAX_DURATION = 300; // ms
    this.TAP_MAX_DISTANCE = 20; // pixels
    this.DOUBLE_TAP_MAX_INTERVAL = 500; // ms
    this.LONG_PRESS_MIN_DURATION = 500; // ms
    this.SWIPE_MIN_DISTANCE = 50; // pixels
    this.SWIPE_MAX_TIME = 300; // ms
  }

  init() {
    // Set up touch event listeners
    document.addEventListener('touchstart', this.handleTouchStart.bind(this));
    document.addEventListener('touchmove', this.handleTouchMove.bind(this));
    document.addEventListener('touchend', this.handleTouchEnd.bind(this));
    
    // Set up mouse event listeners (for desktop testing)
    document.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    
    console.log('TouchInterface initialized');
  }

  update() {
    // Update touch data in admin panel if visible
    const touchPosition = document.getElementById('touch-position');
    const gestureValue = document.getElementById('gesture-value');
    
    if (touchPosition && this.lastTouchPosition) {
      touchPosition.textContent = `X: ${this.lastTouchPosition.x.toFixed(0)}, Y: ${this.lastTouchPosition.y.toFixed(0)}`;
    }
    
    if (gestureValue && this.lastGesture) {
      gestureValue.textContent = this.lastGesture;
    }
  }

  handleTouchStart(event) {
    event.preventDefault();
    
    const touch = event.touches[0];
    if (!touch) return;
    
    this.touchStartPosition = {
      x: touch.clientX,
      y: touch.clientY,
      time: performance.now()
    };
    
    this.touchHistory = [this.touchStartPosition];
    this.lastTouchPosition = this.touchStartPosition;
  }

  handleTouchMove(event) {
    event.preventDefault();
    
    const touch = event.touches[0];
    if (!touch) return;
    
    const position = {
      x: touch.clientX,
      y: touch.clientY,
      time: performance.now()
    };
    
    this.touchHistory.push(position);
    this.lastTouchPosition = position;
    
    // Limit history size
    if (this.touchHistory.length > 50) {
      this.touchHistory.shift();
    }
  }

  handleTouchEnd(event) {
    event.preventDefault();
    
    if (!this.touchStartPosition) return;
    
    const endTime = performance.now();
    const touchDuration = endTime - this.touchStartPosition.time;
    
    // Recognize gesture
    this.finalizeGesture(touchDuration);
    
    // Reset touch start position
    this.touchStartPosition = null;
  }

  handleMouseDown(event) {
    // Simulate touch events with mouse for desktop testing
    this.touchStartPosition = {
      x: event.clientX,
      y: event.clientY,
      time: performance.now()
    };
    
    this.touchHistory = [this.touchStartPosition];
    this.lastTouchPosition = this.touchStartPosition;
  }

  handleMouseMove(event) {
    // Only track if mouse is down
    if (!this.touchStartPosition) return;
    
    const position = {
      x: event.clientX,
      y: event.clientY,
      time: performance.now()
    };
    
    this.touchHistory.push(position);
    this.lastTouchPosition = position;
    
    // Limit history size
    if (this.touchHistory.length > 50) {
      this.touchHistory.shift();
    }
  }

  handleMouseUp(event) {
    // Only process if mouse was down
    if (!this.touchStartPosition) return;
    
    const endTime = performance.now();
    const touchDuration = endTime - this.touchStartPosition.time;
    
    // Recognize gesture
    this.finalizeGesture(touchDuration);
    
    // Reset touch start position
    this.touchStartPosition = null;
  }

  finalizeGesture(touchDuration) {
    // Get distance from start to end
    if (!this.touchStartPosition || this.touchHistory.length === 0) {
      return;
    }
    
    const lastPosition = this.touchHistory[this.touchHistory.length - 1];
    const dx = lastPosition.x - this.touchStartPosition.x;
    const dy = lastPosition.y - this.touchStartPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Detect tap
    if (touchDuration < this.TAP_MAX_DURATION && distance < this.TAP_MAX_DISTANCE) {
      const now = performance.now();
      
      // Check for double tap
      if (now - this.lastTapTime < this.DOUBLE_TAP_MAX_INTERVAL && this.lastTapPosition) {
        // Calculate distance between taps
        const tapDx = lastPosition.x - this.lastTapPosition.x;
        const tapDy = lastPosition.y - this.lastTapPosition.y;
        const tapDistance = Math.sqrt(tapDx * tapDx + tapDy * tapDy);
        
        if (tapDistance < this.TAP_MAX_DISTANCE * 2) {
          this.lastGesture = 'doubleTap';
          this.stateManager.emit('touch.doubleTap', { position: lastPosition });
          
          // Reset tap tracking
          this.lastTapTime = 0;
          this.lastTapPosition = null;
          return;
        }
      }
      
      // Single tap
      this.lastGesture = 'tap';
      this.stateManager.emit('touch.tap', { position: lastPosition });
      
      // Update tap tracking
      this.lastTapTime = now;
      this.lastTapPosition = { ...lastPosition };
      return;
    }
    
    // Detect long press
    if (touchDuration >= this.LONG_PRESS_MIN_DURATION && distance < this.TAP_MAX_DISTANCE) {
      this.lastGesture = 'longPress';
      this.stateManager.emit('touch.longPress', { 
        position: lastPosition,
        duration: touchDuration
      });
      return;
    }
    
    // Detect swipe
    if (distance >= this.SWIPE_MIN_DISTANCE && touchDuration < this.SWIPE_MAX_TIME) {
      // Determine swipe direction
      let direction;
      
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        direction = dx > 0 ? 'right' : 'left';
      } else {
        // Vertical swipe
        direction = dy > 0 ? 'down' : 'up';
      }
      
      this.lastGesture = `swipe${direction.charAt(0).toUpperCase() + direction.slice(1)}`;
      this.stateManager.emit('touch.swipe', { 
        position: lastPosition,
        direction,
        distance,
        duration: touchDuration
      });
      return;
    }
    
    // Check for circle gesture
    if (this.detectCircleGesture()) {
      this.lastGesture = 'circle';
      this.stateManager.emit('touch.circle', { position: lastPosition });
      return;
    }
    
    // No recognized gesture
    this.lastGesture = 'none';
  }

  detectCircleGesture() {
    // Need at least 10 points for a circle
    if (this.touchHistory.length < 10) {
      return false;
    }
    
    // Calculate center of points
    let sumX = 0;
    let sumY = 0;
    
    for (const point of this.touchHistory) {
      sumX += point.x;
      sumY += point.y;
    }
    
    const centerX = sumX / this.touchHistory.length;
    const centerY = sumY / this.touchHistory.length;
    
    // Calculate average distance from center (radius)
    let sumRadius = 0;
    
    for (const point of this.touchHistory) {
      const dx = point.x - centerX;
      const dy = point.y - centerY;
      sumRadius += Math.sqrt(dx * dx + dy * dy);
    }
    
    const avgRadius = sumRadius / this.touchHistory.length;
    
    // Calculate variance of radius
    let sumVariance = 0;
    
    for (const point of this.touchHistory) {
      const dx = point.x - centerX;
      const dy = point.y - centerY;
      const radius = Math.sqrt(dx * dx + dy * dy);
      sumVariance += Math.pow(radius - avgRadius, 2);
    }
    
    const variance = sumVariance / this.touchHistory.length;
    
    // Check if variance is low enough (consistent radius)
    if (variance > avgRadius * 0.3) {
      return false;
    }
    
    // Check if path covers enough of the circle
    // Calculate angles and check for sufficient coverage
    const angles = [];
    
    for (const point of this.touchHistory) {
      const dx = point.x - centerX;
      const dy = point.y - centerY;
      const angle = Math.atan2(dy, dx);
      angles.push(angle);
    }
    
    // Sort angles
    angles.sort();
    
    // Check for gaps
    let maxGap = 0;
    
    for (let i = 1; i < angles.length; i++) {
      const gap = angles[i] - angles[i - 1];
      maxGap = Math.max(maxGap, gap);
    }
    
    // Check gap between last and first angle (wrapping around)
    const lastGap = (angles[0] + 2 * Math.PI) - angles[angles.length - 1];
    maxGap = Math.max(maxGap, lastGap);
    
    // If max gap is less than 90 degrees (π/2 radians), consider it a circle
    return maxGap < Math.PI / 2;
  }

  getLastTouchPosition() {
    return this.lastTouchPosition;
  }

  getLastGesture() {
    return this.lastGesture;
  }

  getTouchHistory() {
    return this.touchHistory;
  }
}
