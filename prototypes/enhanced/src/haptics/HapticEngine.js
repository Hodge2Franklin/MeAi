/**
 * HapticEngine.js
 * Comprehensive haptic feedback system for MeAi enhanced implementation
 * Implements precise haptic patterns as specified in the documentation
 */

class HapticEngine {
  /**
   * Initialize the HapticEngine
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    // Check if vibration API is supported
    this.supported = 'vibrate' in navigator;
    
    // Default options
    this.options = {
      enabled: true,
      intensity: 1.0, // Intensity multiplier (0.0-2.0)
      ...options
    };
    
    // Define haptic patterns exactly as specified
    this.patterns = {
      greeting: [50, 70, 80, 70, 120],
      listening: [30],
      understanding: [40, 30, 60, 30, 80, 30, 60, 30, 40],
      insight: [40, 30, 40, 30, 150],
      affirmation: [100],
      curiosity: [30, 20, 30, 20, 30, 20, 30],
      transition: [50, 20, 70, 20, 100, 20, 70, 20, 50],
      farewell: [120, 30, 80, 30, 50]
    };
    
    // Track repeating patterns
    this.intervals = {};
    
    // Bind methods
    this.play = this.play.bind(this);
    this.startRepeating = this.startRepeating.bind(this);
    this.stopRepeating = this.stopRepeating.bind(this);
    this.stopAll = this.stopAll.bind(this);
  }
  
  /**
   * Check if haptic feedback is supported
   * @returns {boolean} Whether haptic feedback is supported
   */
  checkSupport() {
    return this.supported;
  }
  
  /**
   * Enable or disable haptic feedback
   * @param {boolean} enabled - Whether haptic feedback is enabled
   */
  setEnabled(enabled) {
    this.options.enabled = enabled;
    
    // Stop all haptics if disabled
    if (!enabled) {
      this.stopAll();
    }
    
    return this;
  }
  
  /**
   * Set haptic intensity
   * @param {number} intensity - Intensity multiplier (0.0-2.0)
   */
  setIntensity(intensity) {
    // Clamp intensity between 0 and 2
    this.options.intensity = Math.max(0, Math.min(2, intensity));
    return this;
  }
  
  /**
   * Apply intensity to pattern
   * @private
   * @param {Array} pattern - Haptic pattern
   * @returns {Array} Adjusted pattern
   */
  applyIntensity(pattern) {
    // If intensity is 1.0, return original pattern
    if (this.options.intensity === 1.0) {
      return [...pattern];
    }
    
    // Apply intensity to each value in pattern
    return pattern.map((value, index) => {
      // Only apply intensity to vibration durations (even indices)
      if (index % 2 === 0) {
        return Math.round(value * this.options.intensity);
      }
      return value;
    });
  }
  
  /**
   * Play a single haptic pattern
   * @param {string|Array} pattern - Pattern name or custom pattern array
   * @returns {boolean} Whether pattern was played successfully
   */
  play(pattern) {
    // Check if haptics are supported and enabled
    if (!this.supported || !this.options.enabled) {
      return false;
    }
    
    // Get pattern array
    const patternArray = Array.isArray(pattern) 
      ? pattern 
      : this.patterns[pattern];
    
    // Check if pattern exists
    if (!patternArray) {
      console.error(`Haptic pattern "${pattern}" not found`);
      return false;
    }
    
    // Apply intensity to pattern
    const adjustedPattern = this.applyIntensity(patternArray);
    
    try {
      // Play pattern
      navigator.vibrate(adjustedPattern);
      return true;
    } catch (e) {
      console.error('Haptic error:', e);
      return false;
    }
  }
  
  /**
   * Play a repeating pattern at interval
   * @param {string|Array} pattern - Pattern name or custom pattern array
   * @param {number} intervalMs - Interval between repetitions in ms
   * @returns {boolean} Whether pattern was started successfully
   */
  startRepeating(pattern, intervalMs = 2000) {
    // Check if already repeating
    if (this.intervals[pattern]) {
      return false;
    }
    
    // Check if haptics are supported and enabled
    if (!this.supported || !this.options.enabled) {
      return false;
    }
    
    // Play immediately
    this.play(pattern);
    
    // Setup interval
    this.intervals[pattern] = setInterval(() => {
      this.play(pattern);
    }, intervalMs);
    
    return true;
  }
  
  /**
   * Stop a repeating pattern
   * @param {string} pattern - Pattern name
   * @returns {boolean} Whether pattern was stopped successfully
   */
  stopRepeating(pattern) {
    if (!this.intervals[pattern]) {
      return false;
    }
    
    // Clear interval
    clearInterval(this.intervals[pattern]);
    delete this.intervals[pattern];
    
    return true;
  }
  
  /**
   * Stop all haptic feedback
   */
  stopAll() {
    if (!this.supported) {
      return;
    }
    
    // Clear all intervals
    Object.keys(this.intervals).forEach(key => {
      clearInterval(this.intervals[key]);
      delete this.intervals[key];
    });
    
    // Cancel any ongoing vibration
    navigator.vibrate(0);
  }
  
  /**
   * Create a custom pattern
   * @param {string} name - Pattern name
   * @param {Array} pattern - Pattern array
   * @returns {boolean} Whether pattern was created successfully
   */
  createPattern(name, pattern) {
    // Validate pattern
    if (!Array.isArray(pattern) || pattern.length === 0) {
      console.error('Invalid haptic pattern');
      return false;
    }
    
    // Add pattern
    this.patterns[name] = pattern;
    return true;
  }
  
  /**
   * Get all available patterns
   * @returns {Object} Available patterns
   */
  getPatterns() {
    return { ...this.patterns };
  }
  
  /**
   * Get a specific pattern
   * @param {string} name - Pattern name
   * @returns {Array|null} Pattern array or null if not found
   */
  getPattern(name) {
    return this.patterns[name] || null;
  }
  
  /**
   * Play a sequence of patterns
   * @param {Array} sequence - Array of pattern names or arrays
   * @param {number} delay - Delay between patterns in ms
   * @returns {Promise} Resolves when sequence completes
   */
  async playSequence(sequence, delay = 500) {
    // Check if haptics are supported and enabled
    if (!this.supported || !this.options.enabled) {
      return false;
    }
    
    // Play each pattern in sequence
    for (let i = 0; i < sequence.length; i++) {
      // Play pattern
      this.play(sequence[i]);
      
      // Wait for pattern to complete plus delay
      const pattern = Array.isArray(sequence[i]) 
        ? sequence[i] 
        : this.patterns[sequence[i]];
      
      if (pattern) {
        // Calculate total duration of pattern
        const patternDuration = pattern.reduce((sum, val) => sum + val, 0);
        
        // Wait for pattern to complete plus delay
        await new Promise(resolve => setTimeout(resolve, patternDuration + delay));
      } else {
        // If pattern not found, just wait for delay
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return true;
  }
  
  /**
   * Verify a pattern matches expected values
   * @param {string} patternName - Pattern name
   * @param {Array} expectedPattern - Expected pattern array
   * @returns {boolean} Whether pattern matches expected values
   */
  verifyPattern(patternName, expectedPattern) {
    const pattern = this.patterns[patternName];
    
    if (!pattern) {
      return false;
    }
    
    // Compare pattern with expected
    if (pattern.length !== expectedPattern.length) {
      return false;
    }
    
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] !== expectedPattern[i]) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Run verification tests for all patterns
   * @returns {Object} Test results
   */
  runVerificationTests() {
    const expectedPatterns = {
      greeting: [50, 70, 80, 70, 120],
      listening: [30],
      understanding: [40, 30, 60, 30, 80, 30, 60, 30, 40],
      insight: [40, 30, 40, 30, 150],
      affirmation: [100],
      curiosity: [30, 20, 30, 20, 30, 20, 30],
      transition: [50, 20, 70, 20, 100, 20, 70, 20, 50],
      farewell: [120, 30, 80, 30, 50]
    };
    
    const results = {};
    
    // Test each pattern
    Object.keys(expectedPatterns).forEach(patternName => {
      results[patternName] = this.verifyPattern(
        patternName, 
        expectedPatterns[patternName]
      );
    });
    
    return results;
  }
}

// Export for use in other modules
export default HapticEngine;
