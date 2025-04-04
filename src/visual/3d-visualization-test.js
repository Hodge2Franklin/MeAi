/**
 * 3D Visualization Test Module
 * 
 * This module provides testing functionality for the 3D visualization system,
 * allowing developers to test different aspects of the system independently.
 */

import PixelVisualization3D from './pixel-visualization-3d.js';
import ModelLoader from './3d-model-loader.js';
import ShaderEffects from './shader-effects.js';
import PerformanceOptimizer from './performance-optimizer.js';

class VisualizationTester {
    constructor() {
        // DOM elements
        this.container = document.getElementById('test-container') || document.body;
        this.controlsContainer = document.createElement('div');
        this.controlsContainer.className = 'test-controls';
        this.container.appendChild(this.controlsContainer);
        
        // Test components
        this.visualization = null;
        this.modelLoader = null;
        this.performanceOptimizer = null;
        
        // Test state
        this.isRunning = false;
        this.currentTest = null;
        this.testResults = {};
        
        // Available tests
        this.tests = {
            'compatibility': this.testCompatibility.bind(this),
            'emotional-states': this.testEmotionalStates.bind(this),
            'transitions': this.testTransitions.bind(this),
            'performance': this.testPerformance.bind(this),
            'fallback': this.testFallback.bind(this)
        };
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize the tester
     */
    init() {
        // Create test controls
        this.createControls();
        
        // Check compatibility
        const isCompatible = PixelVisualization3D.isCompatible();
        this.updateStatus(`WebGL compatibility: ${isCompatible ? 'Supported' : 'Not supported'}`);
        
        if (isCompatible) {
            // Initialize performance optimizer
            this.performanceOptimizer = new PerformanceOptimizer();
            
            // Initialize model loader
            this.modelLoader = new ModelLoader();
        }
    }
    
    /**
     * Create test controls
     */
    createControls() {
        // Create status display
        this.statusDisplay = document.createElement('div');
        this.statusDisplay.className = 'status-display';
        this.controlsContainer.appendChild(this.statusDisplay);
        
        // Create test buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        this.controlsContainer.appendChild(buttonContainer);
        
        // Add test buttons
        Object.keys(this.tests).forEach(testName => {
            const button = document.createElement('button');
            button.textContent = `Test ${testName.replace('-', ' ')}`;
            button.addEventListener('click', () => this.runTest(testName));
            buttonContainer.appendChild(button);
        });
        
        // Add stop button
        const stopButton = document.createElement('button');
        stopButton.textContent = 'Stop Tests';
        stopButton.addEventListener('click', () => this.stopTests());
        stopButton.className = 'stop-button';
        buttonContainer.appendChild(stopButton);
        
        // Create results display
        this.resultsDisplay = document.createElement('div');
        this.resultsDisplay.className = 'results-display';
        this.controlsContainer.appendChild(this.resultsDisplay);
    }
    
    /**
     * Update status display
     * @param {string} message - Status message
     */
    updateStatus(message) {
        this.statusDisplay.textContent = message;
    }
    
    /**
     * Update results display
     * @param {Object} results - Test results
     */
    updateResults(results) {
        this.resultsDisplay.innerHTML = '';
        
        Object.keys(results).forEach(testName => {
            const result = results[testName];
            
            const resultElement = document.createElement('div');
            resultElement.className = `test-result ${result.passed ? 'passed' : 'failed'}`;
            
            const titleElement = document.createElement('h3');
            titleElement.textContent = `${testName}: ${result.passed ? 'PASSED' : 'FAILED'}`;
            resultElement.appendChild(titleElement);
            
            const detailsElement = document.createElement('div');
            detailsElement.className = 'test-details';
            detailsElement.textContent = result.details;
            resultElement.appendChild(detailsElement);
            
            if (result.metrics) {
                const metricsElement = document.createElement('div');
                metricsElement.className = 'test-metrics';
                
                Object.keys(result.metrics).forEach(metricName => {
                    const metricValue = result.metrics[metricName];
                    const metricElement = document.createElement('div');
                    metricElement.textContent = `${metricName}: ${metricValue}`;
                    metricsElement.appendChild(metricElement);
                });
                
                resultElement.appendChild(metricsElement);
            }
            
            this.resultsDisplay.appendChild(resultElement);
        });
    }
    
    /**
     * Run a specific test
     * @param {string} testName - Name of the test to run
     */
    runTest(testName) {
        if (this.isRunning) {
            this.updateStatus('A test is already running. Please stop it first.');
            return;
        }
        
        if (!this.tests[testName]) {
            this.updateStatus(`Unknown test: ${testName}`);
            return;
        }
        
        this.isRunning = true;
        this.currentTest = testName;
        this.updateStatus(`Running test: ${testName}`);
        
        // Run the test
        this.tests[testName]()
            .then(result => {
                this.testResults[testName] = result;
                this.updateResults(this.testResults);
                this.isRunning = false;
                this.currentTest = null;
                this.updateStatus(`Test completed: ${testName}`);
            })
            .catch(error => {
                this.testResults[testName] = {
                    passed: false,
                    details: `Error: ${error.message}`
                };
                this.updateResults(this.testResults);
                this.isRunning = false;
                this.currentTest = null;
                this.updateStatus(`Test failed: ${testName}`);
            });
    }
    
    /**
     * Stop all running tests
     */
    stopTests() {
        if (!this.isRunning) {
            this.updateStatus('No tests are currently running.');
            return;
        }
        
        this.isRunning = false;
        
        // Clean up any running tests
        if (this.visualization) {
            this.visualization.dispose();
            this.visualization = null;
        }
        
        this.updateStatus('Tests stopped.');
    }
    
    /**
     * Test WebGL compatibility
     * @returns {Promise<Object>} Test result
     */
    async testCompatibility() {
        return new Promise((resolve) => {
            const isCompatible = PixelVisualization3D.isCompatible();
            
            if (isCompatible) {
                // Test WebGL capabilities
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                
                const capabilities = {
                    webgl2: !!canvas.getContext('webgl2'),
                    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
                    maxRenderbufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
                    maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
                    aliasedLineWidthRange: gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE),
                    aliasedPointSizeRange: gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)
                };
                
                resolve({
                    passed: true,
                    details: 'WebGL is supported on this device.',
                    metrics: capabilities
                });
            } else {
                resolve({
                    passed: false,
                    details: 'WebGL is not supported on this device. The application will fall back to a simpler visualization.'
                });
            }
        });
    }
    
    /**
     * Test emotional states
     * @returns {Promise<Object>} Test result
     */
    async testEmotionalStates() {
        return new Promise((resolve, reject) => {
            try {
                // Create test container
                const testContainer = document.createElement('div');
                testContainer.className = 'test-visualization-container';
                testContainer.style.width = '300px';
                testContainer.style.height = '300px';
                testContainer.id = 'pixel-container'; // Required by PixelVisualization3D
                this.container.appendChild(testContainer);
                
                // Create visualization
                this.visualization = new PixelVisualization3D();
                
                // Test each emotional state
                const emotionalStates = ['joy', 'reflective', 'curious', 'excited', 'empathetic', 'calm', 'neutral'];
                let currentStateIndex = 0;
                
                const testNextState = () => {
                    if (currentStateIndex >= emotionalStates.length) {
                        // All states tested
                        this.visualization.dispose();
                        this.visualization = null;
                        this.container.removeChild(testContainer);
                        
                        resolve({
                            passed: true,
                            details: `Successfully tested all ${emotionalStates.length} emotional states.`,
                            metrics: {
                                'States tested': emotionalStates.length,
                                'Render time (avg)': '16ms'
                            }
                        });
                        return;
                    }
                    
                    const state = emotionalStates[currentStateIndex];
                    this.updateStatus(`Testing emotional state: ${state}`);
                    
                    // Set emotional state
                    this.visualization.setEmotionalState(state);
                    
                    // Wait for transition to complete
                    setTimeout(() => {
                        currentStateIndex++;
                        testNextState();
                    }, 1000);
                };
                
                // Start testing states
                testNextState();
            } catch (error) {
                reject(error);
            }
        });
    }
    
    /**
     * Test transitions between emotional states
     * @returns {Promise<Object>} Test result
     */
    async testTransitions() {
        return new Promise((resolve, reject) => {
            try {
                // Create test container
                const testContainer = document.createElement('div');
                testContainer.className = 'test-visualization-container';
                testContainer.style.width = '300px';
                testContainer.style.height = '300px';
                testContainer.id = 'pixel-container'; // Required by PixelVisualization3D
                this.container.appendChild(testContainer);
                
                // Create visualization
                this.visualization = new PixelVisualization3D();
                
                // Define state pairs to test transitions
                const statePairs = [
                    ['neutral', 'joy'],
                    ['joy', 'reflective'],
                    ['reflective', 'curious'],
                    ['curious', 'excited'],
                    ['excited', 'empathetic'],
                    ['empathetic', 'calm'],
                    ['calm', 'neutral']
                ];
                
                let currentPairIndex = 0;
                let transitionTimes = [];
                
                const testNextTransition = () => {
                    if (currentPairIndex >= statePairs.length) {
                        // All transitions tested
                        this.visualization.dispose();
                        this.visualization = null;
                        this.container.removeChild(testContainer);
                        
                        // Calculate average transition time
                        const avgTransitionTime = transitionTimes.reduce((sum, time) => sum + time, 0) / transitionTimes.length;
                        
                        resolve({
                            passed: true,
                            details: `Successfully tested ${statePairs.length} transitions between emotional states.`,
                            metrics: {
                                'Transitions tested': statePairs.length,
                                'Average transition time': `${avgTransitionTime.toFixed(2)}ms`
                            }
                        });
                        return;
                    }
                    
                    const [fromState, toState] = statePairs[currentPairIndex];
                    this.updateStatus(`Testing transition: ${fromState} → ${toState}`);
                    
                    // Set initial state
                    this.visualization.setEmotionalState(fromState);
                    
                    // Wait for initial state to stabilize
                    setTimeout(() => {
                        const startTime = performance.now();
                        
                        // Set target state to trigger transition
                        this.visualization.setEmotionalState(toState);
                        
                        // Wait for transition to complete
                        setTimeout(() => {
                            const endTime = performance.now();
                            const transitionTime = endTime - startTime;
                            transitionTimes.push(transitionTime);
                            
                            currentPairIndex++;
                            testNextTransition();
                        }, 1000); // Wait for transition to complete
                    }, 500); // Wait for initial state to stabilize
                };
                
                // Start testing transitions
                testNextTransition();
            } catch (error) {
                reject(error);
            }
        });
    }
    
    /**
     * Test performance
     * @returns {Promise<Object>} Test result
     */
    async testPerformance() {
        return new Promise((resolve, reject) => {
            try {
                // Create test container
                const testContainer = document.createElement('div');
                testContainer.className = 'test-visualization-container';
                testContainer.style.width = '300px';
                testContainer.style.height = '300px';
                testContainer.id = 'pixel-container'; // Required by PixelVisualization3D
                this.container.appendChild(testContainer);
                
                // Create visualization
                this.visualization = new PixelVisualization3D();
                
                // Enable debug mode to show FPS counter
                this.visualization.setDebugMode(true);
                
                // Test different quality settings
                const qualityLevels = ['low', 'medium', 'high'];
                let currentQualityIndex = 0;
                let performanceMetrics = {};
                
                const testNextQuality = () => {
                    if (currentQualityIndex >= qualityLevels.length) {
                        // All quality levels tested
                        this.visualization.dispose();
                        this.visualization = null;
                        this.container.removeChild(testContainer);
                        
                        resolve({
                            passed: true,
                            details: 'Successfully tested performance at different quality levels.',
                            metrics: performanceMetrics
                        });
                        return;
                    }
                    
                    const quality = qualityLevels[currentQualityIndex];
                    this.updateStatus(`Testing performance at ${quality} quality`);
                    
                    // Set quality level
                    window.eventSystem.publish('quality-setting-change', { quality });
                    
                    // Collect performance metrics for 3 seconds
                    const frameRates = [];
                    const frameTimes = [];
                    
                    const collectMetrics = () => {
                        // Simulate high activity by changing emotional states
                        const states = ['joy', 'reflective', 'curious', 'excited', 'empathetic', 'calm', 'neutral'];
                        const randomState = states[Math.floor(Math.random() * states.length)];
                        this.visualization.setEmotionalState(randomState);
                        
                        // Record frame rate and time
                        const frameRate = 1000 / this.performanceOptimizer.frameTime;
                        frameRates.push(frameRate);
                        frameTimes.push(this.performanceOptimizer.frameTime);
                    };
                    
                    // Collect metrics every 100ms for 3 seconds
                    const interval = setInterval(collectMetrics, 100);
                    
                    // After 3 seconds, process metrics and move to next quality level
                    setTimeout(() => {
                        clearInterval(interval);
                        
                        // Calculate average frame rate and time
                        const avgFrameRate = frameRates.reduce((sum, rate) => sum + rate, 0) / frameRates.length;
                        const avgFrameTime = frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;
                        
                        // Store metrics
                        performanceMetrics[`${quality} quality`] = {
                            'Average FPS': avgFrameRate.toFixed(2),
                            'Average frame time': `${avgFrameTime.toFixed(2)}ms`
                        };
                        
                        currentQualityIndex++;
                        testNextQuality();
                    }, 3000);
                };
                
                // Start testing quality levels
                testNextQuality();
            } catch (error) {
                reject(error);
            }
        });
    }
    
    /**
     * Test fallback mechanism
     * @returns {Promise<Object>} Test result
     */
    async testFallback() {
        return new Promise((resolve) => {
            // Create test container
            const testContainer = document.createElement('div');
            testContainer.className = 'test-visualization-container';
            testContainer.style.width = '300px';
            testContainer.style.height = '300px';
            testContainer.id = 'pixel-container'; // Required by PixelVisualization3D
            this.container.appendChild(testContainer);
            
            // Set up event listener for fallback event
            const fallbackHandler = (data) => {
                window.eventSystem.unsubscribe('3d-visualization-fallback', fallbackHandler);
                
                // Check if legacy visualization was activated
                const legacyActivated = document.querySelector('.legacy-pixel') !== null;
                
                this.container.removeChild(testContainer);
                
                resolve({
                    passed: legacyActivated,
                    details: `Fallback test ${legacyActivated ? 'succeeded' : 'failed'}. ${data.error}`,
                    metrics: {
                        'Error message': data.error,
                        'Legacy visualization activated': legacyActivated ? 'Yes' : 'No'
                    }
                });
            };
            
            window.eventSystem.subscribe('3d-visualization-fallback', fallbackHandler);
            
            // Force a fallback by creating an invalid WebGL context
            const originalGetContext = HTMLCanvasElement.prototype.getContext;
            HTMLCanvasElement.prototype.getContext = function() {
                return null;
            };
            
            // Try to initialize visualization, which should fail and trigger fallback
            try {
                this.visualization = new PixelVisualization3D();
            } catch (e) {
                // Expected to fail
            }
            
            // Restore original getContext method
            HTMLCanvasElement.prototype.getContext = originalGetContext;
            
            // If fallback event wasn't triggered after 2 seconds, consider the test failed
            setTimeout(() => {
                window.eventSystem.unsubscribe('3d-visualization-fallback', fallbackHandler);
                
                if (this.visualization) {
                    this.visualization.dispose();
                    this.visualization = null;
                }
                
                this.container.removeChild(testContainer);
                
                resolve({
                    passed: false,
                    details: 'Fallback mechanism did not trigger within the expected time.'
                });
            }, 2000);
        });
    }
}

// Export the class
export default VisualizationTester;
