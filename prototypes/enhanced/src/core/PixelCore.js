/**
 * PixelCore.js
 * Core implementation of the single pixel visualization for MeAi
 * Implements the exact specifications from the enhanced MeAi implementation document
 */

class PixelCore {
  /**
   * Initialize the PixelCore
   * @param {string|HTMLCanvasElement} canvas - Canvas element ID or reference
   * @param {Object} config - Configuration options
   */
  constructor(canvas, config = {}) {
    // Get canvas reference
    this.canvas = typeof canvas === 'string' 
      ? document.getElementById(canvas) 
      : canvas;
    
    if (!this.canvas) {
      throw new Error('Canvas element not found');
    }
    
    this.ctx = this.canvas.getContext('2d');
    
    // Default config values
    this.config = {
      color: '#F5E8C7',      // Warm white default
      size: 2,               // Default size in px
      pulseRate: 60,         // ms between pulse steps
      maxOpacity: 1.0,       // Maximum opacity
      minOpacity: 0.7,       // Minimum opacity while pulsing
      positionVariance: 0.5, // px of allowed drift
      ...config              // Override with passed config
    };
    
    // State management
    this.state = {
      currentOpacity: 0,     // Start invisible
      pulseDirection: 1,     // 1: increasing, -1: decreasing
      position: {            // Center position
        x: this.canvas.width / 2,
        y: this.canvas.height / 2
      },
      visible: false,
      breathing: false,
      breathRate: 4,         // Breaths per minute
      breathPhase: 0,        // Current phase of breath cycle (0-1)
      breathDirection: 1,    // 1: inhale, -1: exhale
      size: this.config.size // Current size
    };
    
    this.animator = null;    // Animation frame reference
    this.lastFrameTime = 0;  // For frame timing
    
    // Bind methods to maintain context
    this.animate = this.animate.bind(this);
    
    // Initialize canvas size to match display
    this.resizeCanvas();
    
    // Listen for window resize
    window.addEventListener('resize', this.resizeCanvas.bind(this));
  }
  
  /**
   * Resize canvas to match display size
   */
  resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    
    // Set canvas size accounting for device pixel ratio
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    
    // Update pixel position to center
    this.state.position = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2
    };
    
    // Redraw if visible
    if (this.state.visible) {
      this.draw();
    }
  }
  
  /**
   * Start pixel animation
   */
  start() {
    this.state.visible = true;
    
    // Start animation loop if not already running
    if (!this.animator) {
      this.lastFrameTime = performance.now();
      this.animate();
    }
    
    return this;
  }
  
  /**
   * Stop pixel animation
   */
  stop() {
    this.state.visible = false;
    
    // Cancel animation frame
    if (this.animator) {
      cancelAnimationFrame(this.animator);
      this.animator = null;
    }
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    return this;
  }
  
  /**
   * Frame animation function
   * @param {number} timestamp - Current timestamp
   */
  animate(timestamp = performance.now()) {
    // Calculate delta time
    const deltaTime = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;
    
    // Update state based on delta time
    this.updateState(deltaTime);
    
    // Draw pixel
    this.draw();
    
    // Request next frame
    this.animator = requestAnimationFrame(this.animate);
  }
  
  /**
   * Update pixel state based on config and delta time
   * @param {number} deltaTime - Time since last frame in ms
   */
  updateState(deltaTime) {
    if (!this.state.visible) return;
    
    // Update opacity for pulse effect
    const opacityStep = 0.001 * deltaTime;
    this.state.currentOpacity += opacityStep * this.state.pulseDirection;
    
    // Reverse direction at boundaries
    if (this.state.currentOpacity >= this.config.maxOpacity) {
      this.state.pulseDirection = -1;
    } else if (this.state.currentOpacity <= this.config.minOpacity) {
      this.state.pulseDirection = 1;
    }
    
    // Clamp opacity
    this.state.currentOpacity = Math.max(
      this.config.minOpacity, 
      Math.min(this.config.maxOpacity, this.state.currentOpacity)
    );
    
    // Update breathing if enabled
    if (this.state.breathing) {
      this.updateBreathing(deltaTime);
    }
    
    // Subtle position drift (10% chance per frame)
    if (Math.random() > 0.9) {
      this.state.position.x += (Math.random() - 0.5) * 
        this.config.positionVariance;
      this.state.position.y += (Math.random() - 0.5) * 
        this.config.positionVariance;
    }
  }
  
  /**
   * Update breathing animation
   * @param {number} deltaTime - Time since last frame in ms
   */
  updateBreathing(deltaTime) {
    // Calculate breath cycle progress
    // Convert breath rate from breaths per minute to phase change per ms
    const phaseStep = (this.state.breathRate / 60) * (deltaTime / 1000);
    
    // Update breath phase
    this.state.breathPhase += phaseStep * this.state.breathDirection;
    
    // Handle breath cycle completion
    if (this.state.breathPhase >= 1) {
      this.state.breathPhase = 1;
      this.state.breathDirection = -1; // Start exhale
    } else if (this.state.breathPhase <= 0) {
      this.state.breathPhase = 0;
      this.state.breathDirection = 1;  // Start inhale
    }
    
    // Calculate size based on breath phase
    // Use sine wave for smooth breathing
    const breathSine = Math.sin(this.state.breathPhase * Math.PI);
    const sizeVariation = this.config.size * 0.5; // 50% size variation
    
    this.state.size = this.config.size + (breathSine * sizeVariation);
  }
  
  /**
   * Render pixel to canvas
   */
  draw() {
    if (!this.state.visible) return;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw pixel
    this.ctx.beginPath();
    this.ctx.arc(
      this.state.position.x,
      this.state.position.y,
      this.state.size,
      0, 
      Math.PI * 2
    );
    
    // Set fill style with current opacity
    this.ctx.fillStyle = this.hexToRgba(
      this.config.color, 
      this.state.currentOpacity
    );
    
    this.ctx.fill();
  }
  
  /**
   * Convert hex color to rgba
   * @param {string} hex - Hex color code
   * @param {number} alpha - Alpha value (0-1)
   * @returns {string} RGBA color string
   */
  hexToRgba(hex, alpha) {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Return rgba string
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  /**
   * Start breathing animation
   * @param {number} rate - Breaths per minute
   */
  startBreathing(rate = 4) {
    this.state.breathing = true;
    this.state.breathRate = rate;
    this.state.breathPhase = 0;
    this.state.breathDirection = 1;
    
    return this;
  }
  
  /**
   * Stop breathing animation
   */
  stopBreathing() {
    this.state.breathing = false;
    this.state.size = this.config.size;
    
    return this;
  }
  
  /**
   * Set pixel color
   * @param {string} newColor - Hex color code
   */
  setColor(newColor) {
    this.config.color = newColor;
    return this;
  }
  
  /**
   * Set pixel size
   * @param {number} newSize - Size in pixels
   */
  setSize(newSize) {
    this.config.size = newSize;
    if (!this.state.breathing) {
      this.state.size = newSize;
    }
    return this;
  }
  
  /**
   * Set pulse rate
   * @param {number} newRate - Pulse rate in ms
   */
  setPulseRate(newRate) {
    this.config.pulseRate = newRate;
    return this;
  }
  
  /**
   * Set opacity range
   * @param {number} min - Minimum opacity (0-1)
   * @param {number} max - Maximum opacity (0-1)
   */
  setOpacityRange(min, max) {
    this.config.minOpacity = min;
    this.config.maxOpacity = max;
    return this;
  }
  
  /**
   * Set position variance
   * @param {number} variance - Position variance in pixels
   */
  setPositionVariance(variance) {
    this.config.positionVariance = variance;
    return this;
  }
  
  /**
   * Perform a pulse animation
   * @param {number} duration - Duration in ms
   * @param {number} intensity - Intensity multiplier
   */
  pulse(duration = 500, intensity = 1.5) {
    // Store original size
    const originalSize = this.config.size;
    
    // Increase size
    this.setSize(originalSize * intensity);
    
    // Reset after duration
    setTimeout(() => {
      this.setSize(originalSize);
    }, duration);
    
    return this;
  }
  
  /**
   * Perform a fade in animation
   * @param {number} duration - Duration in ms
   */
  fadeIn(duration = 1000) {
    // Store original opacity range
    const originalMin = this.config.minOpacity;
    const originalMax = this.config.maxOpacity;
    
    // Start from zero
    this.state.currentOpacity = 0;
    this.setOpacityRange(0, originalMax);
    
    // Animate to original values
    setTimeout(() => {
      this.setOpacityRange(originalMin, originalMax);
    }, duration);
    
    return this;
  }
  
  /**
   * Perform a fade out animation
   * @param {number} duration - Duration in ms
   */
  fadeOut(duration = 1000) {
    // Store original opacity range
    const originalMin = this.config.minOpacity;
    const originalMax = this.config.maxOpacity;
    
    // Animate to zero
    this.setOpacityRange(0, this.state.currentOpacity);
    
    // Reset after duration
    setTimeout(() => {
      this.setOpacityRange(originalMin, originalMax);
    }, duration);
    
    return this;
  }
  
  /**
   * Get current state
   * @returns {Object} Current state
   */
  getState() {
    return { ...this.state };
  }
  
  /**
   * Get current configuration
   * @returns {Object} Current configuration
   */
  getConfig() {
    return { ...this.config };
  }
  
  /**
   * Get performance metrics
   * @returns {Object} Performance metrics
   */
  getPerformanceMetrics() {
    return {
      fps: 1000 / (performance.now() - this.lastFrameTime),
      lastFrameTime: this.lastFrameTime,
      animationActive: !!this.animator
    };
  }
}

// Export for use in other modules
export default PixelCore;
