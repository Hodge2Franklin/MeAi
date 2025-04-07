/**
 * TestFramework.js
 * Comprehensive testing framework for MeAi enhanced implementation
 * Handles unit tests, integration tests, and verification tests
 */

class TestFramework {
  /**
   * Initialize the TestFramework
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    // Default options
    this.options = {
      autoRun: false,
      logResults: true,
      stopOnFail: false,
      ...options
    };
    
    // Test suites
    this.suites = {};
    
    // Test results
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      suites: {}
    };
    
    // Component references
    this.components = {};
    
    // Bind methods
    this.addSuite = this.addSuite.bind(this);
    this.addTest = this.addTest.bind(this);
    this.runAll = this.runAll.bind(this);
    this.runSuite = this.runSuite.bind(this);
  }
  
  /**
   * Register components for testing
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
   * Add test suite
   * @param {string} name - Suite name
   * @param {Object} options - Suite options
   * @returns {Object} Suite object
   */
  addSuite(name, options = {}) {
    // Default suite options
    const suiteOptions = {
      description: '',
      setup: null,
      teardown: null,
      beforeEach: null,
      afterEach: null,
      ...options
    };
    
    // Create suite
    this.suites[name] = {
      name,
      options: suiteOptions,
      tests: []
    };
    
    // Initialize results
    this.results.suites[name] = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      tests: {}
    };
    
    return this.suites[name];
  }
  
  /**
   * Add test to suite
   * @param {string} suiteName - Suite name
   * @param {string} testName - Test name
   * @param {Function} testFn - Test function
   * @param {Object} options - Test options
   * @returns {Object} Test object
   */
  addTest(suiteName, testName, testFn, options = {}) {
    // Check if suite exists
    if (!this.suites[suiteName]) {
      console.error(`Test suite "${suiteName}" not found`);
      return null;
    }
    
    // Default test options
    const testOptions = {
      description: '',
      timeout: 5000,
      skip: false,
      ...options
    };
    
    // Create test
    const test = {
      name: testName,
      fn: testFn,
      options: testOptions
    };
    
    // Add to suite
    this.suites[suiteName].tests.push(test);
    
    // Initialize results
    this.results.suites[suiteName].tests[testName] = {
      status: 'pending',
      duration: 0,
      error: null
    };
    
    // Update totals
    this.results.total++;
    this.results.suites[suiteName].total++;
    
    return test;
  }
  
  /**
   * Run all test suites
   * @returns {Promise} Resolves with test results
   */
  async runAll() {
    console.log('Running all test suites...');
    
    // Reset results
    this.resetResults();
    
    const startTime = performance.now();
    
    // Run each suite
    for (const suiteName in this.suites) {
      await this.runSuite(suiteName);
    }
    
    // Calculate total duration
    this.results.duration = performance.now() - startTime;
    
    // Log results if enabled
    if (this.options.logResults) {
      this.logResults();
    }
    
    return this.results;
  }
  
  /**
   * Run specific test suite
   * @param {string} suiteName - Suite name
   * @returns {Promise} Resolves with suite results
   */
  async runSuite(suiteName) {
    // Check if suite exists
    if (!this.suites[suiteName]) {
      console.error(`Test suite "${suiteName}" not found`);
      return null;
    }
    
    const suite = this.suites[suiteName];
    const results = this.results.suites[suiteName];
    
    console.log(`Running test suite: ${suiteName}`);
    
    const startTime = performance.now();
    
    // Run setup if defined
    if (typeof suite.options.setup === 'function') {
      try {
        await suite.options.setup(this.components);
      } catch (error) {
        console.error(`Error in suite setup: ${error.message}`);
        
        // Mark all tests as skipped
        suite.tests.forEach(test => {
          results.tests[test.name].status = 'skipped';
          results.skipped++;
          this.results.skipped++;
        });
        
        return results;
      }
    }
    
    // Run each test
    for (const test of suite.tests) {
      // Skip test if marked to skip
      if (test.options.skip) {
        results.tests[test.name].status = 'skipped';
        results.skipped++;
        this.results.skipped++;
        continue;
      }
      
      // Run beforeEach if defined
      if (typeof suite.options.beforeEach === 'function') {
        try {
          await suite.options.beforeEach(this.components);
        } catch (error) {
          console.error(`Error in beforeEach: ${error.message}`);
          
          // Mark test as failed
          results.tests[test.name].status = 'failed';
          results.tests[test.name].error = error.message;
          results.failed++;
          this.results.failed++;
          
          // Skip to next test
          continue;
        }
      }
      
      // Run test
      const testStartTime = performance.now();
      
      try {
        // Create timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Test timed out after ${test.options.timeout}ms`));
          }, test.options.timeout);
        });
        
        // Run test with timeout
        await Promise.race([
          test.fn(this.components),
          timeoutPromise
        ]);
        
        // Test passed
        results.tests[test.name].status = 'passed';
        results.passed++;
        this.results.passed++;
      } catch (error) {
        // Test failed
        results.tests[test.name].status = 'failed';
        results.tests[test.name].error = error.message;
        results.failed++;
        this.results.failed++;
        
        // Stop on fail if enabled
        if (this.options.stopOnFail) {
          break;
        }
      }
      
      // Calculate test duration
      results.tests[test.name].duration = performance.now() - testStartTime;
      
      // Run afterEach if defined
      if (typeof suite.options.afterEach === 'function') {
        try {
          await suite.options.afterEach(this.components);
        } catch (error) {
          console.error(`Error in afterEach: ${error.message}`);
        }
      }
    }
    
    // Run teardown if defined
    if (typeof suite.options.teardown === 'function') {
      try {
        await suite.options.teardown(this.components);
      } catch (error) {
        console.error(`Error in suite teardown: ${error.message}`);
      }
    }
    
    // Calculate suite duration
    results.duration = performance.now() - startTime;
    
    return results;
  }
  
  /**
   * Reset test results
   */
  resetResults() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      suites: {}
    };
    
    // Initialize suite results
    for (const suiteName in this.suites) {
      this.results.suites[suiteName] = {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0,
        tests: {}
      };
      
      // Initialize test results
      this.suites[suiteName].tests.forEach(test => {
        this.results.suites[suiteName].tests[test.name] = {
          status: 'pending',
          duration: 0,
          error: null
        };
        
        // Update totals
        this.results.total++;
        this.results.suites[suiteName].total++;
      });
    }
  }
  
  /**
   * Log test results
   */
  logResults() {
    console.log('\n--- Test Results ---');
    console.log(`Total: ${this.results.total}`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(`Skipped: ${this.results.skipped}`);
    console.log(`Duration: ${Math.round(this.results.duration)}ms`);
    
    // Log suite results
    for (const suiteName in this.results.suites) {
      const suite = this.results.suites[suiteName];
      
      console.log(`\nSuite: ${suiteName}`);
      console.log(`  Passed: ${suite.passed}/${suite.total}`);
      console.log(`  Duration: ${Math.round(suite.duration)}ms`);
      
      // Log failed tests
      const failedTests = Object.entries(suite.tests)
        .filter(([, test]) => test.status === 'failed');
      
      if (failedTests.length > 0) {
        console.log('  Failed Tests:');
        
        failedTests.forEach(([testName, test]) => {
          console.log(`    - ${testName}: ${test.error}`);
        });
      }
    }
  }
  
  /**
   * Create HTML report
   * @returns {string} HTML report
   */
  createHTMLReport() {
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>MeAi Test Results</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .summary { margin-bottom: 20px; }
          .suite { margin-bottom: 30px; border: 1px solid #ddd; border-radius: 5px; padding: 10px; }
          .suite-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .test { margin: 5px 0; padding: 5px; border-radius: 3px; }
          .passed { background-color: #dff0d8; }
          .failed { background-color: #f2dede; }
          .skipped { background-color: #fcf8e3; }
          .error { color: #a94442; margin-top: 5px; font-family: monospace; }
        </style>
      </head>
      <body>
        <h1>MeAi Test Results</h1>
        
        <div class="summary">
          <h2>Summary</h2>
          <p>
            Total: ${this.results.total} |
            Passed: ${this.results.passed} |
            Failed: ${this.results.failed} |
            Skipped: ${this.results.skipped} |
            Duration: ${Math.round(this.results.duration)}ms
          </p>
        </div>
    `;
    
    // Add suite results
    for (const suiteName in this.results.suites) {
      const suite = this.results.suites[suiteName];
      const suiteInfo = this.suites[suiteName];
      
      html += `
        <div class="suite">
          <div class="suite-header">
            <h3>${suiteName}</h3>
            <span>
              Passed: ${suite.passed}/${suite.total} |
              Duration: ${Math.round(suite.duration)}ms
            </span>
          </div>
          
          <p>${suiteInfo.options.description || ''}</p>
          
          <div class="tests">
      `;
      
      // Add test results
      for (const testName in suite.tests) {
        const test = suite.tests[testName];
        const testInfo = suiteInfo.tests.find(t => t.name === testName);
        
        html += `
          <div class="test ${test.status}">
            <div class="test-header">
              <strong>${testName}</strong>
              <span>${test.status} (${Math.round(test.duration)}ms)</span>
            </div>
            
            <p>${testInfo?.options.description || ''}</p>
            
            ${test.error ? `<div class="error">${test.error}</div>` : ''}
          </div>
        `;
      }
      
      html += `
          </div>
        </div>
      `;
    }
    
    html += `
      </body>
      </html>
    `;
    
    return html;
  }
  
  /**
   * Create verification test suite
   * @returns {Object} Verification test suite
   */
  createVerificationSuite() {
    // Create verification suite
    const suite = this.addSuite('verification', {
      description: 'Verification tests for MeAi enhanced implementation',
      setup: async (components) => {
        // Initialize components for testing
        if (components.stateManager) {
          components.stateManager.resetState();
        }
      }
    });
    
    // Add feature detection tests
    this.addTest('verification', 'featureDetection', async (components) => {
      const featureDetector = components.featureDetector;
      
      if (!featureDetector) {
        throw new Error('FeatureDetector component not registered');
      }
      
      // Check if feature detection methods exist
      if (typeof featureDetector.checkSupport !== 'function') {
        throw new Error('checkSupport method not found');
      }
      
      if (typeof featureDetector.getFeatureSupport !== 'function') {
        throw new Error('getFeatureSupport method not found');
      }
      
      // Get feature support
      const features = featureDetector.getFeatureSupport();
      
      // Verify feature object structure
      if (!features || typeof features !== 'object') {
        throw new Error('Invalid feature support object');
      }
      
      // Check for required feature properties
      const requiredFeatures = [
        'deviceMotion',
        'deviceOrientation',
        'touchEvents',
        'webAudio',
        'speechSynthesis',
        'localStorage',
        'vibration'
      ];
      
      for (const feature of requiredFeatures) {
        if (typeof features[feature] !== 'boolean') {
          throw new Error(`Feature "${feature}" not properly detected`);
        }
      }
    }, {
      description: 'Verifies feature detection functionality'
    });
    
    // Add pixel core tests
    this.addTest('verification', 'pixelCore', async (components) => {
      const pixelCore = components.pixelCore;
      
      if (!pixelCore) {
        throw new Error('PixelCore component not registered');
      }
      
      // Check if core methods exist
      if (typeof pixelCore.start !== 'function') {
        throw new Error('start method not found');
      }
      
      if (typeof pixelCore.stop !== 'function') {
        throw new Error('stop method not found');
      }
      
      if (typeof pixelCore.setColor !== 'function') {
        throw new Error('setColor method not found');
      }
      
      // Test color setting
      pixelCore.setColor('#FF0000');
      const config = pixelCore.getConfig();
      
      if (config.color !== '#FF0000') {
        throw new Error('Color not set correctly');
      }
      
      // Test breathing
      if (typeof pixelCore.startBreathing !== 'function') {
        throw new Error('startBreathing method not found');
      }
      
      pixelCore.startBreathing(4);
      const state = pixelCore.getState();
      
      if (!state.breathing || state.breathRate !== 4) {
        throw new Error('Breathing not started correctly');
      }
      
      // Test stopping breathing
      pixelCore.stopBreathing();
      const newState = pixelCore.getState();
      
      if (newState.breathing) {
        throw new Error('Breathing not stopped correctly');
      }
    }, {
      description: 'Verifies pixel core functionality'
    });
    
    // Add state manager tests
    this.addTest('verification', 'stateManager', async (components) => {
      const stateManager = components.stateManager;
      
      if (!stateManager) {
        throw new Error('StateManager component not registered');
      }
      
      // Check if state manager methods exist
      if (typeof stateManager.updateState !== 'function') {
        throw new Error('updateState method not found');
      }
      
      if (typeof stateManager.transition !== 'function') {
        throw new Error('transition method not found');
      }
      
      // Test state update
      stateManager.updateState({
        pixelProperties: {
          color: '#00FF00'
        }
      });
      
      const state = stateManager.getState();
      
      if (state.pixelProperties.color !== '#00FF00') {
        throw new Error('State not updated correctly');
      }
      
      // Test state transition
      stateManager.transition('listening');
      const newState = stateManager.getState();
      
      if (newState.currentState !== 'listening') {
        throw new Error('State transition not working correctly');
      }
    }, {
      description: 'Verifies state manager functionality'
    });
    
    // Add haptic engine tests
    this.addTest('verification', 'hapticEngine', async (components) => {
      const hapticEngine = components.hapticEngine;
      
      if (!hapticEngine) {
        throw new Error('HapticEngine component not registered');
      }
      
      // Check if haptic engine methods exist
      if (typeof hapticEngine.play !== 'function') {
        throw new Error('play method not found');
      }
      
      if (typeof hapticEngine.setIntensity !== 'function') {
        throw new Error('setIntensity method not found');
      }
      
      // Test pattern verification
      const verificationResults = hapticEngine.runVerificationTests();
      
      // Check if all patterns are verified
      const patterns = [
        'greeting',
        'listening',
        'understanding',
        'insight',
        'affirmation',
        'curiosity',
        'transition',
        'farewell'
      ];
      
      for (const pattern of patterns) {
        if (!verificationResults[pattern]) {
          throw new Error(`Pattern "${pattern}" verification failed`);
        }
      }
      
      // Test intensity setting
      hapticEngine.setIntensity(0.5);
      
      // Create custom pattern
      const created = hapticEngine.createPattern('test', [100, 50, 100]);
      
      if (!created) {
        throw new Error('Failed to create custom pattern');
      }
      
      const pattern = hapticEngine.getPattern('test');
      
      if (!pattern || pattern.length !== 3 || pattern[0] !== 100) {
        throw new Error('Custom pattern not created correctly');
      }
    }, {
      description: 'Verifies haptic engine functionality'
    });
    
    // Add audio manager tests
    this.addTest('verification', 'audioManager', async (components) => {
      const audioManager = components.audioManager;
      
      if (!audioManager) {
        throw new Error('AudioManager component not registered');
      }
      
      // Check if audio manager methods exist
      if (typeof audioManager.setVolume !== 'function') {
        throw new Error('setVolume method not found');
      }
      
      if (typeof audioManager.speak !== 'function') {
        throw new Error('speak method not found');
      }
      
      // Test volume setting
      audioManager.setVolume(0.7);
      
      // Check audio context state
      const state = audioManager.getAudioContextState();
      
      if (!state) {
        throw new Error('Audio context state not available');
      }
      
      // Test speech synthesis
      if (audioManager.isSpeechSupported()) {
        const voices = audioManager.getVoices();
        
        if (!Array.isArray(voices)) {
          throw new Error('getVoices should return an array');
        }
      }
    }, {
      description: 'Verifies audio manager functionality'
    });
    
    // Add sensor manager tests
    this.addTest('verification', 'sensorManager', async (components) => {
      const sensorManager = components.sensorManager;
      
      if (!sensorManager) {
        throw new Error('SensorManager component not registered');
      }
      
      // Check if sensor manager methods exist
      if (typeof sensorManager.getSensorData !== 'function') {
        throw new Error('getSensorData method not found');
      }
      
      if (typeof sensorManager.getMetrics !== 'function') {
        throw new Error('getMetrics method not found');
      }
      
      // Get sensor data
      const sensorData = sensorManager.getSensorData();
      
      // Verify sensor data structure
      if (!sensorData || typeof sensorData !== 'object') {
        throw new Error('Invalid sensor data object');
      }
      
      // Check for required sensor data properties
      const requiredProperties = [
        'motion',
        'orientation',
        'touch'
      ];
      
      for (const property of requiredProperties) {
        if (!sensorData[property] || typeof sensorData[property] !== 'object') {
          throw new Error(`Sensor data property "${property}" not properly structured`);
        }
      }
      
      // Get metrics
      const metrics = sensorManager.getMetrics();
      
      // Verify metrics structure
      if (!metrics || typeof metrics !== 'object') {
        throw new Error('Invalid metrics object');
      }
      
      // Check for required metrics properties
      const requiredMetrics = [
        'motionIntensity',
        'stabilityScore',
        'attentionQuality',
        'interactionQuality',
        'presenceScore'
      ];
      
      for (const metric of requiredMetrics) {
        if (typeof metrics[metric] !== 'number') {
          throw new Error(`Metric "${metric}" not properly structured`);
        }
      }
    }, {
      description: 'Verifies sensor manager functionality'
    });
    
    // Add UI components tests
    this.addTest('verification', 'uiComponents', async (components) => {
      const uiComponents = components.uiComponents;
      
      if (!uiComponents) {
        throw new Error('UIComponents component not registered');
      }
      
      // Check if UI components methods exist
      if (typeof uiComponents.showText !== 'function') {
        throw new Error('showText method not found');
      }
      
      if (typeof uiComponents.showChoices !== 'function') {
        throw new Error('showChoices method not found');
      }
      
      if (typeof uiComponents.createPulseEffect !== 'function') {
        throw new Error('createPulseEffect method not found');
      }
      
      // Test message queue
      if (typeof uiComponents.queueMessage !== 'function') {
        throw new Error('queueMessage method not found');
      }
      
      // Test iOS audio button
      if (typeof uiComponents.createIOSAudioButton !== 'function') {
        throw new Error('createIOSAudioButton method not found');
      }
    }, {
      description: 'Verifies UI components functionality'
    });
    
    // Add use case manager tests
    this.addTest('verification', 'useCaseManager', async (components) => {
      const useCaseManager = components.useCaseManager;
      
      if (!useCaseManager) {
        throw new Error('UseCaseManager component not registered');
      }
      
      // Check if use case manager methods exist
      if (typeof useCaseManager.executeUseCase !== 'function') {
        throw new Error('executeUseCase method not found');
      }
      
      if (typeof useCaseManager.detectActiveUseCase !== 'function') {
        throw new Error('detectActiveUseCase method not found');
      }
      
      // Get all use cases
      const useCases = useCaseManager.getAllUseCases();
      
      // Verify use cases structure
      if (!useCases || typeof useCases !== 'object') {
        throw new Error('Invalid use cases object');
      }
      
      // Check for required use cases
      const requiredUseCases = [
        'morningConnection',
        'emotionalResonance',
        'memoryThread',
        'silentCompanionship',
        'insightEmergence',
        'deviceHandover',
        'bedtimeTransition'
      ];
      
      for (const useCase of requiredUseCases) {
        if (!useCases[useCase] || typeof useCases[useCase] !== 'object') {
          throw new Error(`Use case "${useCase}" not properly structured`);
        }
        
        // Check for required use case properties
        const requiredProperties = [
          'id',
          'name',
          'message',
          'detect',
          'execute'
        ];
        
        for (const property of requiredProperties) {
          if (property === 'detect' || property === 'execute') {
            if (typeof useCases[useCase][property] !== 'function') {
              throw new Error(`Use case "${useCase}" property "${property}" should be a function`);
            }
          } else if (!useCases[useCase][property]) {
            throw new Error(`Use case "${useCase}" property "${property}" not found`);
          }
        }
      }
    }, {
      description: 'Verifies use case manager functionality'
    });
    
    // Add performance optimizer tests
    this.addTest('verification', 'performanceOptimizer', async (components) => {
      const performanceOptimizer = components.performanceOptimizer;
      
      if (!performanceOptimizer) {
        throw new Error('PerformanceOptimizer component not registered');
      }
      
      // Check if performance optimizer methods exist
      if (typeof performanceOptimizer.getMetrics !== 'function') {
        throw new Error('getMetrics method not found');
      }
      
      if (typeof performanceOptimizer.forceOptimizationLevel !== 'function') {
        throw new Error('forceOptimizationLevel method not found');
      }
      
      // Get metrics
      const metrics = performanceOptimizer.getMetrics();
      
      // Verify metrics structure
      if (!metrics || typeof metrics !== 'object') {
        throw new Error('Invalid metrics object');
      }
      
      // Check for required metrics properties
      const requiredMetrics = [
        'fps',
        'frameTime',
        'optimizationLevel'
      ];
      
      for (const metric of requiredMetrics) {
        if (metric === 'optimizationLevel') {
          if (typeof metrics[metric] !== 'string') {
            throw new Error(`Metric "${metric}" should be a string`);
          }
        } else if (typeof metrics[metric] !== 'number') {
          throw new Error(`Metric "${metric}" should be a number`);
        }
      }
      
      // Test optimization level setting
      const result = performanceOptimizer.forceOptimizationLevel('medium');
      
      if (!result) {
        throw new Error('Failed to set optimization level');
      }
      
      const newMetrics = performanceOptimizer.getMetrics();
      
      if (newMetrics.optimizationLevel !== 'medium') {
        throw new Error('Optimization level not set correctly');
      }
    }, {
      description: 'Verifies performance optimizer functionality'
    });
    
    // Add integration tests
    this.addTest('verification', 'integration', async (components) => {
      const {
        stateManager,
        pixelCore,
        hapticEngine,
        audioManager,
        useCaseManager
      } = components;
      
      if (!stateManager || !pixelCore || !hapticEngine || 
          !audioManager || !useCaseManager) {
        throw new Error('Required components not registered for integration test');
      }
      
      // Test state transitions affecting pixel
      stateManager.transition('listening');
      
      // Verify pixel is visible
      if (!pixelCore.getState().visible) {
        throw new Error('Pixel should be visible in listening state');
      }
      
      // Test use case execution
      const morningConnection = useCaseManager.getUseCase('morningConnection');
      
      if (!morningConnection) {
        throw new Error('Morning connection use case not found');
      }
      
      // Set active use case
      stateManager.setActiveUseCase('morningConnection');
      
      // Verify state
      const state = stateManager.getState();
      
      if (state.activeUseCase !== 'morningConnection') {
        throw new Error('Active use case not set correctly');
      }
      
      // Complete use case
      stateManager.completeUseCase('morningConnection');
      
      // Verify completion
      const newState = stateManager.getState();
      
      if (newState.activeUseCase !== null) {
        throw new Error('Active use case not cleared after completion');
      }
      
      if (!newState.completedUseCases.morningConnection) {
        throw new Error('Use case not marked as completed');
      }
    }, {
      description: 'Verifies integration between components'
    });
    
    return suite;
  }
  
  /**
   * Create performance test suite
   * @returns {Object} Performance test suite
   */
  createPerformanceSuite() {
    // Create performance suite
    const suite = this.addSuite('performance', {
      description: 'Performance tests for MeAi enhanced implementation'
    });
    
    // Add rendering performance test
    this.addTest('performance', 'renderingPerformance', async (components) => {
      const pixelCore = components.pixelCore;
      const performanceOptimizer = components.performanceOptimizer;
      
      if (!pixelCore || !performanceOptimizer) {
        throw new Error('Required components not registered for performance test');
      }
      
      // Start pixel animation
      pixelCore.start();
      
      // Measure FPS for 2 seconds
      const startTime = performance.now();
      let frames = 0;
      
      while (performance.now() - startTime < 2000) {
        // Register frame
        performanceOptimizer.registerAnimationFrame(performance.now());
        frames++;
        
        // Wait for next frame
        await new Promise(resolve => requestAnimationFrame(resolve));
      }
      
      // Stop pixel animation
      pixelCore.stop();
      
      // Calculate FPS
      const duration = performance.now() - startTime;
      const fps = Math.round((frames / duration) * 1000);
      
      // Verify FPS is acceptable
      if (fps < 30) {
        throw new Error(`FPS too low: ${fps}`);
      }
    }, {
      description: 'Verifies rendering performance',
      timeout: 10000
    });
    
    // Add memory usage test
    this.addTest('performance', 'memoryUsage', async (components) => {
      const performanceOptimizer = components.performanceOptimizer;
      
      if (!performanceOptimizer) {
        throw new Error('PerformanceOptimizer component not registered');
      }
      
      // Skip test if memory API not available
      if (!performance.memory) {
        console.log('Memory API not available, skipping test');
        return;
      }
      
      // Get initial memory usage
      const initialMemory = performance.memory.usedJSHeapSize;
      
      // Create some objects to increase memory usage
      const objects = [];
      for (let i = 0; i < 1000; i++) {
        objects.push(new Array(1000).fill(Math.random()));
      }
      
      // Get final memory usage
      const finalMemory = performance.memory.usedJSHeapSize;
      
      // Calculate memory increase
      const memoryIncrease = (finalMemory - initialMemory) / (1024 * 1024);
      
      // Verify memory increase is reasonable
      if (memoryIncrease > 50) {
        throw new Error(`Memory increase too high: ${memoryIncrease.toFixed(2)}MB`);
      }
      
      // Clean up
      objects.length = 0;
    }, {
      description: 'Verifies memory usage',
      skip: typeof performance.memory === 'undefined'
    });
    
    // Add optimization test
    this.addTest('performance', 'optimization', async (components) => {
      const performanceOptimizer = components.performanceOptimizer;
      
      if (!performanceOptimizer) {
        throw new Error('PerformanceOptimizer component not registered');
      }
      
      // Force high optimization level
      performanceOptimizer.forceOptimizationLevel('high');
      
      // Verify optimization level
      const metrics = performanceOptimizer.getMetrics();
      
      if (metrics.optimizationLevel !== 'high') {
        throw new Error('Failed to set optimization level');
      }
      
      // Check if frame should be skipped
      const shouldSkip = performanceOptimizer.shouldSkipFrame();
      
      // Verify frame skipping is working
      if (typeof shouldSkip !== 'boolean') {
        throw new Error('shouldSkipFrame should return a boolean');
      }
      
      // Create performance report
      const report = performanceOptimizer.createPerformanceReport();
      
      // Verify report structure
      if (!report || typeof report !== 'object') {
        throw new Error('Invalid performance report');
      }
      
      if (!report.metrics || !report.settings || !report.recommendations) {
        throw new Error('Performance report missing required sections');
      }
    }, {
      description: 'Verifies performance optimization'
    });
    
    return suite;
  }
}

// Export for use in other modules
export default TestFramework;
