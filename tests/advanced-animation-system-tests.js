/**
 * Advanced Animation System Test Suite
 * Comprehensive tests for the particle effects, physics-based animations, and procedural generation
 */

class AdvancedAnimationSystemTests {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0
        };
        this.testContainer = null;
        this.animationSystem = null;
        this.visualizationIntegration = null;
    }

    /**
     * Initialize the test environment
     */
    async initialize() {
        console.log('Initializing Advanced Animation System Tests...');
        
        // Create test container
        this.testContainer = document.createElement('div');
        this.testContainer.id = 'animation-test-container';
        this.testContainer.style.width = '800px';
        this.testContainer.style.height = '600px';
        this.testContainer.style.position = 'relative';
        this.testContainer.style.backgroundColor = '#000';
        document.body.appendChild(this.testContainer);
        
        // Initialize event system if not already initialized
        if (!window.eventSystem) {
            window.eventSystem = {
                events: {},
                subscribe: function(eventName, callback) {
                    if (!this.events[eventName]) {
                        this.events[eventName] = [];
                    }
                    this.events[eventName].push(callback);
                    return () => {
                        this.events[eventName] = this.events[eventName].filter(
                            eventCallback => callback !== eventCallback
                        );
                    };
                },
                publish: function(eventName, data) {
                    if (this.events[eventName]) {
                        this.events[eventName].forEach(callback => {
                            callback(data);
                        });
                    }
                }
            };
        }
        
        // Initialize the animation system
        try {
            this.animationSystem = new AdvancedAnimationSystem(this.testContainer);
            this.visualizationIntegration = new VisualizationIntegration(this.testContainer);
            await this.animationSystem.initialize();
            await this.visualizationIntegration.initialize();
            console.log('Animation system initialized successfully');
        } catch (error) {
            console.error('Failed to initialize animation system:', error);
            this.logTestResult('System Initialization', false, error.message);
            return false;
        }
        
        return true;
    }
    
    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('Running all Advanced Animation System tests...');
        
        if (!await this.initialize()) {
            console.error('Test initialization failed. Aborting tests.');
            return this.testResults;
        }
        
        // Run individual test groups
        await this.testParticleEffects();
        await this.testPhysicsAnimations();
        await this.testProceduralGeneration();
        await this.testPerformance();
        await this.testIntegration();
        await this.testEmotionalStates();
        
        // Clean up
        this.cleanup();
        
        // Report results
        console.log(`Test Results: ${this.testResults.passed} passed, ${this.testResults.failed} failed, ${this.testResults.total} total`);
        return this.testResults;
    }
    
    /**
     * Test particle effects system
     */
    async testParticleEffects() {
        console.log('Testing Particle Effects System...');
        
        // Test particle creation
        try {
            const particleCount = 100;
            const particles = this.animationSystem.createParticles(particleCount);
            this.logTestResult(
                'Particle Creation', 
                particles.length === particleCount,
                `Expected ${particleCount} particles, got ${particles.length}`
            );
        } catch (error) {
            this.logTestResult('Particle Creation', false, error.message);
        }
        
        // Test particle emission shapes
        const emissionShapes = ['point', 'sphere', 'hemisphere', 'cone', 'plane', 'torus', 'burst'];
        for (const shape of emissionShapes) {
            try {
                const result = this.animationSystem.setEmissionShape(shape);
                this.logTestResult(
                    `Emission Shape: ${shape}`, 
                    result,
                    `Failed to set emission shape to ${shape}`
                );
            } catch (error) {
                this.logTestResult(`Emission Shape: ${shape}`, false, error.message);
            }
        }
        
        // Test particle parameters
        const particleParameters = {
            size: 2.0,
            speed: 1.5,
            lifetime: 3.0,
            turbulence: 0.5,
            emissionRate: 50
        };
        
        try {
            const result = this.animationSystem.setParticleParameters(particleParameters);
            this.logTestResult(
                'Particle Parameters', 
                result,
                'Failed to set particle parameters'
            );
        } catch (error) {
            this.logTestResult('Particle Parameters', false, error.message);
        }
        
        // Test custom shaders
        try {
            const result = this.animationSystem.useCustomShader('glow');
            this.logTestResult(
                'Custom Shader', 
                result,
                'Failed to apply custom shader'
            );
        } catch (error) {
            this.logTestResult('Custom Shader', false, error.message);
        }
        
        // Test adaptive particle count
        try {
            const lowQualityCount = this.animationSystem.getAdaptiveParticleCount('low');
            const highQualityCount = this.animationSystem.getAdaptiveParticleCount('high');
            this.logTestResult(
                'Adaptive Particle Count', 
                lowQualityCount < highQualityCount,
                `Low quality (${lowQualityCount}) should have fewer particles than high quality (${highQualityCount})`
            );
        } catch (error) {
            this.logTestResult('Adaptive Particle Count', false, error.message);
        }
    }
    
    /**
     * Test physics-based animations
     */
    async testPhysicsAnimations() {
        console.log('Testing Physics-Based Animations...');
        
        // Test force system
        const forces = ['gravity', 'wind', 'vortex', 'attraction', 'repulsion'];
        for (const force of forces) {
            try {
                const result = this.animationSystem.applyForce(force, 1.0);
                this.logTestResult(
                    `Force: ${force}`, 
                    result,
                    `Failed to apply ${force} force`
                );
            } catch (error) {
                this.logTestResult(`Force: ${force}`, false, error.message);
            }
        }
        
        // Test constraints
        const constraints = ['boundary', 'collision', 'distance', 'angle'];
        for (const constraint of constraints) {
            try {
                const result = this.animationSystem.applyConstraint(constraint);
                this.logTestResult(
                    `Constraint: ${constraint}`, 
                    result,
                    `Failed to apply ${constraint} constraint`
                );
            } catch (error) {
                this.logTestResult(`Constraint: ${constraint}`, false, error.message);
            }
        }
        
        // Test object properties
        try {
            const properties = {
                mass: 2.0,
                velocity: { x: 1.0, y: 0.5, z: 0.0 },
                acceleration: { x: 0.1, y: 0.0, z: 0.0 },
                restitution: 0.8
            };
            
            const result = this.animationSystem.setObjectProperties(properties);
            this.logTestResult(
                'Object Properties', 
                result,
                'Failed to set object properties'
            );
        } catch (error) {
            this.logTestResult('Object Properties', false, error.message);
        }
        
        // Test physics simulation step
        try {
            const initialState = this.animationSystem.getPhysicsState();
            this.animationSystem.simulatePhysicsStep(0.016); // 16ms timestep
            const newState = this.animationSystem.getPhysicsState();
            
            const stateChanged = JSON.stringify(initialState) !== JSON.stringify(newState);
            this.logTestResult(
                'Physics Simulation Step', 
                stateChanged,
                'Physics state did not change after simulation step'
            );
        } catch (error) {
            this.logTestResult('Physics Simulation Step', false, error.message);
        }
    }
    
    /**
     * Test procedural animation generation
     */
    async testProceduralGeneration() {
        console.log('Testing Procedural Animation Generation...');
        
        // Test animation sequences
        const emotionalStates = ['joy', 'reflective', 'curious', 'excited', 'empathetic', 'calm', 'neutral'];
        for (const state of emotionalStates) {
            try {
                const sequence = this.animationSystem.getAnimationSequence(state);
                this.logTestResult(
                    `Animation Sequence: ${state}`, 
                    sequence && sequence.length > 0,
                    `Failed to get animation sequence for ${state}`
                );
            } catch (error) {
                this.logTestResult(`Animation Sequence: ${state}`, false, error.message);
            }
        }
        
        // Test animation types
        const animationTypes = ['pulse', 'rotate', 'sway', 'tilt', 'bounce', 'shake', 'float'];
        for (const type of animationTypes) {
            try {
                const result = this.animationSystem.applyAnimationType(type);
                this.logTestResult(
                    `Animation Type: ${type}`, 
                    result,
                    `Failed to apply ${type} animation`
                );
            } catch (error) {
                this.logTestResult(`Animation Type: ${type}`, false, error.message);
            }
        }
        
        // Test easing functions
        const easingFunctions = ['linear', 'easeInQuad', 'easeOutQuad', 'easeInOutQuad', 'easeInCubic', 'easeOutCubic', 'easeInOutCubic'];
        for (const easing of easingFunctions) {
            try {
                const result = this.animationSystem.setEasingFunction(easing);
                this.logTestResult(
                    `Easing Function: ${easing}`, 
                    result,
                    `Failed to set easing function to ${easing}`
                );
            } catch (error) {
                this.logTestResult(`Easing Function: ${easing}`, false, error.message);
            }
        }
        
        // Test animation parameters
        try {
            const parameters = {
                duration: 2.0,
                intensity: 0.8,
                frequency: 0.5
            };
            
            const result = this.animationSystem.setAnimationParameters(parameters);
            this.logTestResult(
                'Animation Parameters', 
                result,
                'Failed to set animation parameters'
            );
        } catch (error) {
            this.logTestResult('Animation Parameters', false, error.message);
        }
        
        // Test procedural generation uniqueness
        try {
            const sequence1 = this.animationSystem.generateProceduralSequence('joy', 5);
            const sequence2 = this.animationSystem.generateProceduralSequence('joy', 5);
            
            // Check that sequences are different (procedural generation should create variation)
            let different = false;
            for (let i = 0; i < sequence1.length; i++) {
                if (JSON.stringify(sequence1[i]) !== JSON.stringify(sequence2[i])) {
                    different = true;
                    break;
                }
            }
            
            this.logTestResult(
                'Procedural Generation Uniqueness', 
                different,
                'Procedural sequences should be unique but were identical'
            );
        } catch (error) {
            this.logTestResult('Procedural Generation Uniqueness', false, error.message);
        }
    }
    
    /**
     * Test performance optimization
     */
    async testPerformance() {
        console.log('Testing Performance Optimization...');
        
        // Test adaptive quality settings
        const qualityLevels = ['low', 'medium', 'high', 'ultra'];
        for (const quality of qualityLevels) {
            try {
                const result = this.animationSystem.setQualityLevel(quality);
                this.logTestResult(
                    `Quality Level: ${quality}`, 
                    result,
                    `Failed to set quality level to ${quality}`
                );
            } catch (error) {
                this.logTestResult(`Quality Level: ${quality}`, false, error.message);
            }
        }
        
        // Test FPS monitoring
        try {
            const fps = this.animationSystem.getCurrentFPS();
            this.logTestResult(
                'FPS Monitoring', 
                fps > 0,
                `FPS should be greater than 0, got ${fps}`
            );
        } catch (error) {
            this.logTestResult('FPS Monitoring', false, error.message);
        }
        
        // Test level of detail
        try {
            const lodLevels = this.animationSystem.getLODLevels();
            this.logTestResult(
                'Level of Detail', 
                lodLevels.length > 0,
                'Should have at least one LOD level'
            );
        } catch (error) {
            this.logTestResult('Level of Detail', false, error.message);
        }
        
        // Test performance under load
        try {
            // Create a high load
            this.animationSystem.setQualityLevel('ultra');
            this.animationSystem.createParticles(5000);
            
            // Measure performance
            const startTime = performance.now();
            for (let i = 0; i < 10; i++) {
                this.animationSystem.update(0.016); // 16ms timestep
            }
            const endTime = performance.now();
            const timePerFrame = (endTime - startTime) / 10;
            
            // Check if performance is acceptable (less than 100ms per frame)
            this.logTestResult(
                'Performance Under Load', 
                timePerFrame < 100,
                `Time per frame should be less than 100ms, got ${timePerFrame.toFixed(2)}ms`
            );
        } catch (error) {
            this.logTestResult('Performance Under Load', false, error.message);
        }
    }
    
    /**
     * Test integration with other components
     */
    async testIntegration() {
        console.log('Testing Integration with Other Components...');
        
        // Test event system integration
        try {
            let eventReceived = false;
            const unsubscribe = window.eventSystem.subscribe('animation-state-changed', (data) => {
                eventReceived = true;
            });
            
            this.animationSystem.setEmotionalState('joy');
            
            // Wait a short time for event to propagate
            await new Promise(resolve => setTimeout(resolve, 100));
            
            unsubscribe();
            
            this.logTestResult(
                'Event System Integration', 
                eventReceived,
                'Animation state change event was not received'
            );
        } catch (error) {
            this.logTestResult('Event System Integration', false, error.message);
        }
        
        // Test visualization integration
        try {
            const result = this.visualizationIntegration.connectAnimationSystem(this.animationSystem);
            this.logTestResult(
                'Visualization Integration', 
                result,
                'Failed to connect animation system to visualization'
            );
        } catch (error) {
            this.logTestResult('Visualization Integration', false, error.message);
        }
        
        // Test post-processing effects
        const effects = ['bloom', 'colorGrading', 'emotionalFilter'];
        for (const effect of effects) {
            try {
                const result = this.visualizationIntegration.enablePostProcessing(effect);
                this.logTestResult(
                    `Post-Processing: ${effect}`, 
                    result,
                    `Failed to enable ${effect} post-processing effect`
                );
            } catch (error) {
                this.logTestResult(`Post-Processing: ${effect}`, false, error.message);
            }
        }
        
        // Test user interaction
        try {
            const result = this.visualizationIntegration.simulateUserInteraction({
                type: 'click',
                position: { x: 400, y: 300 }
            });
            
            this.logTestResult(
                'User Interaction', 
                result,
                'Failed to process user interaction'
            );
        } catch (error) {
            this.logTestResult('User Interaction', false, error.message);
        }
    }
    
    /**
     * Test emotional state visualization
     */
    async testEmotionalStates() {
        console.log('Testing Emotional State Visualization...');
        
        const emotionalStates = ['joy', 'reflective', 'curious', 'excited', 'empathetic', 'calm', 'neutral'];
        
        // Test each emotional state
        for (const state of emotionalStates) {
            try {
                // Set emotional state
                const result = this.animationSystem.setEmotionalState(state);
                
                // Check if state was set correctly
                const currentState = this.animationSystem.getCurrentEmotionalState();
                
                this.logTestResult(
                    `Emotional State: ${state}`, 
                    currentState === state,
                    `Failed to set emotional state to ${state}, got ${currentState}`
                );
                
                // Test state transition
                if (state !== 'neutral') {
                    const transitionResult = this.animationSystem.transitionToState('neutral', 0.5);
                    this.logTestResult(
                        `State Transition: ${state} to neutral`, 
                        transitionResult,
                        `Failed to transition from ${state} to neutral`
                    );
                }
            } catch (error) {
                this.logTestResult(`Emotional State: ${state}`, false, error.message);
            }
        }
        
        // Test emotional intensity
        try {
            const intensities = [0.2, 0.5, 0.8, 1.0];
            
            for (const intensity of intensities) {
                const result = this.animationSystem.setEmotionalIntensity(intensity);
                const currentIntensity = this.animationSystem.getCurrentEmotionalIntensity();
                
                this.logTestResult(
                    `Emotional Intensity: ${intensity}`, 
                    Math.abs(currentIntensity - intensity) < 0.01,
                    `Failed to set emotional intensity to ${intensity}, got ${currentIntensity}`
                );
            }
        } catch (error) {
            this.logTestResult('Emotional Intensity', false, error.message);
        }
    }
    
    /**
     * Log a test result
     */
    logTestResult(testName, passed, errorMessage = '') {
        this.testResults.total++;
        
        if (passed) {
            this.testResults.passed++;
            console.log(`✅ PASS: ${testName}`);
        } else {
            this.testResults.failed++;
            console.error(`❌ FAIL: ${testName} - ${errorMessage}`);
        }
    }
    
    /**
     * Clean up after tests
     */
    cleanup() {
        console.log('Cleaning up test environment...');
        
        if (this.animationSystem) {
            this.animationSystem.dispose();
        }
        
        if (this.visualizationIntegration) {
            this.visualizationIntegration.dispose();
        }
        
        if (this.testContainer && this.testContainer.parentNode) {
            this.testContainer.parentNode.removeChild(this.testContainer);
        }
    }
}

// Export the test class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedAnimationSystemTests;
} else {
    window.AdvancedAnimationSystemTests = AdvancedAnimationSystemTests;
}
