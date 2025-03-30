/**
 * PerformanceOptimizer.js
 * Performance optimization utilities for MeAi enhanced implementation
 * Handles monitoring, optimization, and resource management
 */

class PerformanceOptimizer {
  /**
   * Initialize the PerformanceOptimizer
   * @param {Object} stateManager - StateManager instance
   * @param {Object} options - Configuration options
   */
  constructor(stateManager, options = {}) {
    this.stateManager = stateManager;
    
    // Default options
    this.options = {
      monitoringInterval: 5000, // ms between performance checks
      fpsTarget: 60,            // target frames per second
      memoryThreshold: 50,      // MB memory usage threshold
      batteryThreshold: 0.2,    // battery level threshold (0-1)
      optimizationLevels: {
        low: {
          animationFrameSkip: 0,
          effectsEnabled: true,
          ambientSoundEnabled: true,
          hapticIntensity: 1.0,
          pixelEffectsEnabled: true
        },
        medium: {
          animationFrameSkip: 1,
          effectsEnabled: true,
          ambientSoundEnabled: true,
          hapticIntensity: 0.8,
          pixelEffectsEnabled: true
        },
        high: {
          animationFrameSkip: 2,
          effectsEnabled: false,
          ambientSoundEnabled: false,
          hapticIntensity: 0.6,
          pixelEffectsEnabled: false
        }
      },
      ...options
    };
    
    // Performance metrics
    this.metrics = {
      fps: 0,
      frameTime: 0,
      memoryUsage: 0,
      batteryLevel: 1.0,
      batteryCharging: false,
      lastUpdateTime: 0,
      optimizationLevel: 'low'
    };
    
    // Monitoring interval
    this.monitoringInterval = null;
    
    // Frame counting
    this.frameCount = 0;
    this.lastFrameTime = 0;
    this.frameSkipCounter = 0;
    
    // Component references
    this.components = {
      pixelCore: null,
      hapticEngine: null,
      audioManager: null,
      sensorManager: null
    };
    
    // Bind methods
    this.startMonitoring = this.startMonitoring.bind(this);
    this.stopMonitoring = this.stopMonitoring.bind(this);
    this.updateMetrics = this.updateMetrics.bind(this);
    this.optimizePerformance = this.optimizePerformance.bind(this);
    this.shouldSkipFrame = this.shouldSkipFrame.bind(this);
    this.registerAnimationFrame = this.registerAnimationFrame.bind(this);
  }
  
  /**
   * Register components for optimization
   * @param {Object} components - Component references
   */
  registerComponents(components) {
    this.components = {
      ...this.components,
      ...components
    };
    
    return this;
  }
  
  /**
   * Start performance monitoring
   */
  startMonitoring() {
    // Clear existing interval
    this.stopMonitoring();
    
    // Start monitoring interval
    this.monitoringInterval = setInterval(
      this.updateMetrics,
      this.options.monitoringInterval
    );
    
    // Initial metrics update
    this.updateMetrics();
    
    return this;
  }
  
  /**
   * Stop performance monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    return this;
  }
  
  /**
   * Update performance metrics
   */
  async updateMetrics() {
    const now = performance.now();
    
    // Calculate FPS
    if (this.frameCount > 0 && this.lastFrameTime > 0) {
      const elapsed = now - this.metrics.lastUpdateTime;
      const fps = (this.frameCount / elapsed) * 1000;
      
      this.metrics.fps = Math.round(fps);
      this.frameCount = 0;
    }
    
    // Update last update time
    this.metrics.lastUpdateTime = now;
    
    // Get memory usage if available
    if (performance.memory) {
      this.metrics.memoryUsage = Math.round(
        performance.memory.usedJSHeapSize / (1024 * 1024)
      );
    }
    
    // Get battery info if available
    if (navigator.getBattery) {
      try {
        const battery = await navigator.getBattery();
        this.metrics.batteryLevel = battery.level;
        this.metrics.batteryCharging = battery.charging;
      } catch (error) {
        console.error('Error getting battery info:', error);
      }
    }
    
    // Update state manager with performance metrics
    this.stateManager.updatePerformanceMetrics({
      fps: this.metrics.fps,
      frameTime: this.metrics.frameTime,
      memoryUsage: this.metrics.memoryUsage,
      batteryLevel: this.metrics.batteryLevel,
      batteryCharging: this.metrics.batteryCharging,
      optimizationLevel: this.metrics.optimizationLevel
    });
    
    // Optimize performance based on metrics
    this.optimizePerformance();
  }
  
  /**
   * Optimize performance based on metrics
   */
  optimizePerformance() {
    let newLevel = 'low';
    
    // Determine optimization level based on metrics
    if (this.metrics.fps < 30 || 
        this.metrics.memoryUsage > this.options.memoryThreshold) {
      newLevel = 'high';
    } else if (this.metrics.fps < 45 || 
              (this.metrics.batteryLevel < this.options.batteryThreshold && 
               !this.metrics.batteryCharging)) {
      newLevel = 'medium';
    }
    
    // Skip if level hasn't changed
    if (newLevel === this.metrics.optimizationLevel) {
      return;
    }
    
    // Update optimization level
    this.metrics.optimizationLevel = newLevel;
    
    // Get optimization settings
    const settings = this.options.optimizationLevels[newLevel];
    
    // Apply optimization settings to components
    this.applyOptimizationSettings(settings);
    
    // Log optimization level change
    console.log(`Performance optimization level changed to: ${newLevel}`);
  }
  
  /**
   * Apply optimization settings to components
   * @param {Object} settings - Optimization settings
   */
  applyOptimizationSettings(settings) {
    // Apply to pixel core
    if (this.components.pixelCore) {
      // Adjust pixel effects
      if (!settings.pixelEffectsEnabled) {
        this.components.pixelCore.setPositionVariance(0);
      } else {
        this.components.pixelCore.setPositionVariance(0.5);
      }
    }
    
    // Apply to haptic engine
    if (this.components.hapticEngine) {
      this.components.hapticEngine.setIntensity(settings.hapticIntensity);
    }
    
    // Apply to audio manager
    if (this.components.audioManager) {
      if (!settings.ambientSoundEnabled) {
        this.components.audioManager.stopAmbient();
      }
      
      // Adjust effects volume based on optimization level
      if (!settings.effectsEnabled) {
        this.components.audioManager.setEffectsVolume(0);
      } else {
        this.components.audioManager.setEffectsVolume(0.6);
      }
    }
  }
  
  /**
   * Register animation frame for FPS calculation
   * @param {number} timestamp - Current timestamp
   */
  registerAnimationFrame(timestamp) {
    // Increment frame count
    this.frameCount++;
    
    // Calculate frame time
    if (this.lastFrameTime > 0) {
      this.metrics.frameTime = timestamp - this.lastFrameTime;
    }
    
    // Update last frame time
    this.lastFrameTime = timestamp;
  }
  
  /**
   * Check if current frame should be skipped
   * @returns {boolean} Whether frame should be skipped
   */
  shouldSkipFrame() {
    // Get frame skip setting for current optimization level
    const frameSkip = this.options.optimizationLevels[
      this.metrics.optimizationLevel
    ].animationFrameSkip;
    
    // No frame skipping
    if (frameSkip === 0) {
      return false;
    }
    
    // Increment counter
    this.frameSkipCounter = (this.frameSkipCounter + 1) % (frameSkip + 1);
    
    // Skip frame if counter is not 0
    return this.frameSkipCounter !== 0;
  }
  
  /**
   * Get current performance metrics
   * @returns {Object} Current performance metrics
   */
  getMetrics() {
    return { ...this.metrics };
  }
  
  /**
   * Get current optimization level
   * @returns {string} Current optimization level
   */
  getOptimizationLevel() {
    return this.metrics.optimizationLevel;
  }
  
  /**
   * Force specific optimization level
   * @param {string} level - Optimization level ('low', 'medium', 'high')
   * @returns {boolean} Whether level was set successfully
   */
  forceOptimizationLevel(level) {
    if (!this.options.optimizationLevels[level]) {
      return false;
    }
    
    // Update optimization level
    this.metrics.optimizationLevel = level;
    
    // Apply optimization settings
    this.applyOptimizationSettings(
      this.options.optimizationLevels[level]
    );
    
    return true;
  }
  
  /**
   * Optimize image resources
   * @param {HTMLImageElement} image - Image element
   * @returns {HTMLCanvasElement} Optimized image canvas
   */
  optimizeImage(image) {
    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size based on optimization level
    let scale = 1;
    
    if (this.metrics.optimizationLevel === 'medium') {
      scale = 0.75;
    } else if (this.metrics.optimizationLevel === 'high') {
      scale = 0.5;
    }
    
    // Set canvas dimensions
    canvas.width = image.width * scale;
    canvas.height = image.height * scale;
    
    // Draw image to canvas
    ctx.drawImage(
      image, 
      0, 0, image.width, image.height,
      0, 0, canvas.width, canvas.height
    );
    
    return canvas;
  }
  
  /**
   * Optimize animation duration based on performance
   * @param {number} baseDuration - Base animation duration in ms
   * @returns {number} Optimized duration in ms
   */
  optimizeAnimationDuration(baseDuration) {
    // Adjust duration based on optimization level
    if (this.metrics.optimizationLevel === 'medium') {
      return baseDuration * 0.8; // 20% faster
    } else if (this.metrics.optimizationLevel === 'high') {
      return baseDuration * 0.6; // 40% faster
    }
    
    return baseDuration;
  }
  
  /**
   * Check if effect should be shown based on performance
   * @param {string} effectType - Type of effect
   * @returns {boolean} Whether effect should be shown
   */
  shouldShowEffect(effectType) {
    // Always show critical effects
    if (effectType === 'critical') {
      return true;
    }
    
    // Check based on optimization level
    if (this.metrics.optimizationLevel === 'high') {
      return false;
    } else if (this.metrics.optimizationLevel === 'medium') {
      // Only show important effects in medium optimization
      return effectType === 'important';
    }
    
    // Show all effects in low optimization
    return true;
  }
  
  /**
   * Create performance report
   * @returns {Object} Performance report
   */
  createPerformanceReport() {
    return {
      timestamp: Date.now(),
      metrics: { ...this.metrics },
      optimizationLevel: this.metrics.optimizationLevel,
      settings: this.options.optimizationLevels[this.metrics.optimizationLevel],
      recommendations: this.generateRecommendations()
    };
  }
  
  /**
   * Generate performance recommendations
   * @private
   * @returns {Array} Recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    
    // FPS recommendations
    if (this.metrics.fps < 30) {
      recommendations.push({
        type: 'critical',
        message: 'Low frame rate detected. Consider reducing visual effects.'
      });
    }
    
    // Memory recommendations
    if (this.metrics.memoryUsage > this.options.memoryThreshold) {
      recommendations.push({
        type: 'warning',
        message: 'High memory usage detected. Consider clearing unused resources.'
      });
    }
    
    // Battery recommendations
    if (this.metrics.batteryLevel < this.options.batteryThreshold && 
        !this.metrics.batteryCharging) {
      recommendations.push({
        type: 'info',
        message: 'Low battery detected. Power saving mode activated.'
      });
    }
    
    return recommendations;
  }
}

// Export for use in other modules
export default PerformanceOptimizer;
