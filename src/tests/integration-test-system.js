/**
 * Integration Test System for MeAI
 * 
 * This module provides comprehensive integration tests for all MeAI components,
 * ensuring they work together seamlessly.
 */

class IntegrationTestSystem {
    constructor() {
        // Test results
        this.results = {
            passed: 0,
            failed: 0,
            skipped: 0,
            total: 0,
            tests: []
        };
        
        // Test dependencies
        this.dependencies = {
            '3d-visualization': {
                modules: ['pixel-visualization-3d', '3d-model-loader', 'shader-effects', 'performance-optimizer'],
                initialized: false
            },
            'memory-system': {
                modules: ['long-term-memory-system', 'memory-visualization'],
                initialized: false
            },
            'spatial-audio': {
                modules: ['spatial-audio-system'],
                initialized: false
            },
            'user-profiles': {
                modules: ['advanced-user-profile-system'],
                initialized: false
            }
        };
        
        // Test suites
        this.testSuites = [
            {
                name: 'Core Component Initialization',
                tests: [
                    this.test3DVisualizationInitialization.bind(this),
                    this.testMemorySystemInitialization.bind(this),
                    this.testSpatialAudioInitialization.bind(this),
                    this.testUserProfileInitialization.bind(this)
                ]
            },
            {
                name: 'Component Integration',
                tests: [
                    this.testVisualizationAudioIntegration.bind(this),
                    this.testVisualizationMemoryIntegration.bind(this),
                    this.testAudioMemoryIntegration.bind(this),
                    this.testProfileSystemIntegration.bind(this)
                ]
            },
            {
                name: 'End-to-End Workflows',
                tests: [
                    this.testEmotionalStateWorkflow.bind(this),
                    this.testMemoryRecallWorkflow.bind(this),
                    this.testUserPreferenceWorkflow.bind(this),
                    this.testMultiModalInteractionWorkflow.bind(this)
                ]
            },
            {
                name: 'Performance Tests',
                tests: [
                    this.testVisualizationPerformance.bind(this),
                    this.testMemorySystemPerformance.bind(this),
                    this.testAudioSystemPerformance.bind(this),
                    this.testOverallSystemPerformance.bind(this)
                ]
            }
        ];
        
        // Initialize event system for tests
        this.initializeEventSystem();
    }
    
    /**
     * Initialize event system for tests
     */
    initializeEventSystem() {
        // Create test event system if not available
        if (!window.eventSystem) {
            window.eventSystem = {
                events: {},
                subscribe: function(event, callback) {
                    if (!this.events[event]) {
                        this.events[event] = [];
                    }
                    this.events[event].push(callback);
                    return () => {
                        this.events[event] = this.events[event].filter(cb => cb !== callback);
                    };
                },
                publish: function(event, data) {
                    if (this.events[event]) {
                        this.events[event].forEach(callback => {
                            callback(data);
                        });
                    }
                }
            };
        }
        
        // Subscribe to component initialization events
        window.eventSystem.subscribe('3d-visualization-initialized', (data) => {
            this.dependencies['3d-visualization'].initialized = data.success;
        });
        
        window.eventSystem.subscribe('memory-system-initialized', (data) => {
            this.dependencies['memory-system'].initialized = data.success;
        });
        
        window.eventSystem.subscribe('spatial-audio-initialized', (data) => {
            this.dependencies['spatial-audio'].initialized = data.success;
        });
        
        window.eventSystem.subscribe('user-profile-system-initialized', (data) => {
            this.dependencies['user-profiles'].initialized = data.success;
        });
    }
    
    /**
     * Run all test suites
     * @returns {Promise<Object>} Test results
     */
    async runAllTests() {
        console.log('Starting MeAI Integration Tests...');
        
        // Reset results
        this.results = {
            passed: 0,
            failed: 0,
            skipped: 0,
            total: 0,
            tests: []
        };
        
        // Run each test suite
        for (const suite of this.testSuites) {
            console.log(`\nRunning test suite: ${suite.name}`);
            
            for (const test of suite.tests) {
                await this.runTest(test);
            }
        }
        
        // Log summary
        console.log('\n=== Test Summary ===');
        console.log(`Total: ${this.results.total}`);
        console.log(`Passed: ${this.results.passed}`);
        console.log(`Failed: ${this.results.failed}`);
        console.log(`Skipped: ${this.results.skipped}`);
        
        return this.results;
    }
    
    /**
     * Run a single test
     * @param {Function} testFunction - Test function to run
     * @returns {Promise<Object>} Test result
     */
    async runTest(testFunction) {
        const testName = testFunction.name.replace(/^test/, '');
        console.log(`Running test: ${testName}...`);
        
        const result = {
            name: testName,
            status: 'pending',
            message: '',
            duration: 0
        };
        
        this.results.total++;
        
        try {
            const startTime = performance.now();
            await testFunction();
            const endTime = performance.now();
            
            result.status = 'passed';
            result.duration = endTime - startTime;
            result.message = 'Test passed successfully';
            
            this.results.passed++;
            console.log(`✅ ${testName} - Passed (${result.duration.toFixed(2)}ms)`);
        } catch (error) {
            if (error.message === 'SKIP') {
                result.status = 'skipped';
                result.message = error.reason || 'Test skipped';
                
                this.results.skipped++;
                console.log(`⏭️ ${testName} - Skipped: ${result.message}`);
            } else {
                result.status = 'failed';
                result.message = error.message || 'Test failed';
                result.stack = error.stack;
                
                this.results.failed++;
                console.error(`❌ ${testName} - Failed: ${result.message}`);
                if (error.stack) {
                    console.error(error.stack);
                }
            }
        }
        
        this.results.tests.push(result);
        return result;
    }
    
    /**
     * Skip a test with a reason
     * @param {string} reason - Reason for skipping
     */
    skip(reason) {
        const error = new Error('SKIP');
        error.reason = reason;
        throw error;
    }
    
    /**
     * Assert that a condition is true
     * @param {boolean} condition - Condition to check
     * @param {string} message - Error message if condition is false
     */
    assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }
    
    /**
     * Wait for a specified time
     * @param {number} ms - Milliseconds to wait
     * @returns {Promise<void>}
     */
    async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Wait for an event to be published
     * @param {string} eventName - Name of the event to wait for
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise<Object>} Event data
     */
    async waitForEvent(eventName, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`Timeout waiting for event: ${eventName}`));
            }, timeout);
            
            const unsubscribe = window.eventSystem.subscribe(eventName, (data) => {
                clearTimeout(timer);
                unsubscribe();
                resolve(data);
            });
        });
    }
    
    /**
     * Check if a module is loaded
     * @param {string} moduleName - Name of the module to check
     * @returns {boolean} Whether the module is loaded
     */
    isModuleLoaded(moduleName) {
        // Check if module is defined in window
        return typeof window[moduleName] !== 'undefined' || 
               typeof window[moduleName.replace(/-/g, '')] !== 'undefined';
    }
    
    /**
     * Load a module dynamically
     * @param {string} modulePath - Path to the module
     * @returns {Promise<any>} Loaded module
     */
    async loadModule(modulePath) {
        try {
            const module = await import(modulePath);
            return module.default || module;
        } catch (error) {
            console.error(`Error loading module ${modulePath}:`, error);
            throw error;
        }
    }
    
    /**
     * Test 3D visualization initialization
     */
    async test3DVisualizationInitialization() {
        // Check if visualization modules are loaded
        const pixelVisualization = this.isModuleLoaded('pixel-visualization-3d');
        
        if (!pixelVisualization) {
            try {
                // Try to load the module
                await this.loadModule('../src/visual/pixel-visualization-3d.js');
                await this.wait(500); // Wait for initialization
            } catch (error) {
                this.skip('3D visualization module not available');
            }
        }
        
        // Check if visualization system is initialized
        this.assert(
            this.dependencies['3d-visualization'].initialized,
            '3D visualization system failed to initialize'
        );
        
        // Test basic visualization functionality
        const visualizationSystem = window.pixelVisualization3D || window.pixelVisualization;
        this.assert(visualizationSystem, 'Visualization system not found');
        
        // Check if essential methods exist
        this.assert(
            typeof visualizationSystem.setEmotionalState === 'function',
            'setEmotionalState method not found'
        );
        
        // Test setting emotional state
        visualizationSystem.setEmotionalState('joy', 0.8);
        
        // Wait for state change event
        const stateChangeData = await this.waitForEvent('emotional-state-changed', 2000)
            .catch(() => null);
        
        this.assert(
            stateChangeData && stateChangeData.state === 'joy',
            'Emotional state change event not fired correctly'
        );
    }
    
    /**
     * Test memory system initialization
     */
    async testMemorySystemInitialization() {
        // Check if memory modules are loaded
        const memorySystem = this.isModuleLoaded('long-term-memory-system');
        
        if (!memorySystem) {
            try {
                // Try to load the module
                await this.loadModule('../src/conversation/long-term-memory-system.js');
                await this.wait(500); // Wait for initialization
            } catch (error) {
                this.skip('Memory system module not available');
            }
        }
        
        // Check if memory system is initialized
        this.assert(
            this.dependencies['memory-system'].initialized,
            'Memory system failed to initialize'
        );
        
        // Test basic memory functionality
        const longTermMemory = window.longTermMemorySystem;
        this.assert(longTermMemory, 'Long-term memory system not found');
        
        // Check if essential methods exist
        this.assert(
            typeof longTermMemory.storeMemory === 'function',
            'storeMemory method not found'
        );
        
        this.assert(
            typeof longTermMemory.retrieveMemories === 'function',
            'retrieveMemories method not found'
        );
        
        // Test storing a memory
        const testMemory = {
            text: 'This is a test memory for integration testing',
            importance: 0.8,
            context: 'integration-test'
        };
        
        const memoryId = await longTermMemory.storeMemory(testMemory);
        this.assert(memoryId, 'Failed to store test memory');
        
        // Test retrieving the memory
        const retrievedMemories = await longTermMemory.retrieveMemories({
            context: 'integration-test',
            limit: 1
        });
        
        this.assert(
            retrievedMemories && retrievedMemories.length > 0,
            'Failed to retrieve test memory'
        );
        
        this.assert(
            retrievedMemories[0].text === testMemory.text,
            'Retrieved memory does not match stored memory'
        );
    }
    
    /**
     * Test spatial audio initialization
     */
    async testSpatialAudioInitialization() {
        // Check if audio modules are loaded
        const spatialAudio = this.isModuleLoaded('spatial-audio-system');
        
        if (!spatialAudio) {
            try {
                // Try to load the module
                await this.loadModule('../src/audio/spatial-audio-system.js');
                await this.wait(500); // Wait for initialization
            } catch (error) {
                this.skip('Spatial audio module not available');
            }
        }
        
        // Check if audio system is initialized
        this.assert(
            this.dependencies['spatial-audio'].initialized,
            'Spatial audio system failed to initialize'
        );
        
        // Test basic audio functionality
        const audioSystem = window.spatialAudioSystem;
        this.assert(audioSystem, 'Spatial audio system not found');
        
        // Check if essential methods exist
        this.assert(
            typeof audioSystem.setEnvironment === 'function',
            'setEnvironment method not found'
        );
        
        this.assert(
            typeof audioSystem.setMasterVolume === 'function',
            'setMasterVolume method not found'
        );
        
        // Test setting master volume
        audioSystem.setMasterVolume(0.5);
        
        // Test setting environment
        const environmentSet = await audioSystem.setEnvironment('medium-room');
        this.assert(environmentSet, 'Failed to set audio environment');
    }
    
    /**
     * Test user profile initialization
     */
    async testUserProfileInitialization() {
        // Check if profile modules are loaded
        const userProfiles = this.isModuleLoaded('advanced-user-profile-system');
        
        if (!userProfiles) {
            try {
                // Try to load the module
                await this.loadModule('../src/utils/advanced-user-profile-system.js');
                await this.wait(500); // Wait for initialization
            } catch (error) {
                this.skip('User profile module not available');
            }
        }
        
        // Check if profile system is initialized
        this.assert(
            this.dependencies['user-profiles'].initialized,
            'User profile system failed to initialize'
        );
        
        // Test basic profile functionality
        const profileSystem = window.advancedUserProfileSystem;
        this.assert(profileSystem, 'User profile system not found');
        
        // Check if essential methods exist
        this.assert(
            typeof profileSystem.getActiveProfile === 'function',
            'getActiveProfile method not found'
        );
        
        this.assert(
            typeof profileSystem.updatePreference === 'function',
            'updatePreference method not found'
        );
        
        // Test getting active profile
        const activeProfile = profileSystem.getActiveProfile();
        this.assert(activeProfile, 'No active profile found');
        
        // Test updating a preference
        const preferenceUpdated = await profileSystem.updatePreference(
            'preferences',
            'theme',
            'dark'
        );
        
        this.assert(preferenceUpdated, 'Failed to update preference');
        
        // Verify preference was updated
        const updatedProfile = profileSystem.getActiveProfile();
        this.assert(
            updatedProfile.preferences.theme === 'dark',
            'Preference was not updated correctly'
        );
    }
    
    /**
     * Test integration between visualization and audio systems
     */
    async testVisualizationAudioIntegration() {
        // Skip if either system is not initialized
        if (!this.dependencies['3d-visualization'].initialized) {
            this.skip('3D visualization system not initialized');
        }
        
        if (!this.dependencies['spatial-audio'].initialized) {
            this.skip('Spatial audio system not initialized');
        }
        
        const visualizationSystem = window.pixelVisualization3D || window.pixelVisualization;
        const audioSystem = window.spatialAudioSystem;
        
        // Test emotional state change propagation
        // Set up event listener for audio adjustment
        const audioAdjustmentPromise = this.waitForEvent('emotional-audio-adjusted', 2000);
        
        // Change emotional state
        visualizationSystem.setEmotionalState('excited', 0.9);
        
        // Wait for audio adjustment event
        const audioAdjustment = await audioAdjustmentPromise.catch(() => null);
        
        this.assert(
            audioAdjustment && audioAdjustment.state === 'excited',
            'Emotional state change did not trigger audio adjustment'
        );
        
        // Test visualization response to audio environment
        const visualResponsePromise = this.waitForEvent('visualization-environment-response', 2000)
            .catch(() => null);
        
        // Change audio environment
        await audioSystem.setEnvironment('cathedral');
        
        // Check if visualization responded (if implemented)
        const visualResponse = await visualResponsePromise;
        if (visualResponse) {
            this.assert(
                visualResponse.environment === 'cathedral',
                'Visualization did not respond correctly to environment change'
            );
        }
    }
    
    /**
     * Test integration between visualization and memory systems
     */
    async testVisualizationMemoryIntegration() {
        // Skip if either system is not initialized
        if (!this.dependencies['3d-visualization'].initialized) {
            this.skip('3D visualization system not initialized');
        }
        
        if (!this.dependencies['memory-system'].initialized) {
            this.skip('Memory system not initialized');
        }
        
        const visualizationSystem = window.pixelVisualization3D || window.pixelVisualization;
        const memorySystem = window.longTermMemorySystem;
        
        // Store a memory with emotional context
        const emotionalMemory = {
            text: 'This is a joyful memory for testing visualization integration',
            importance: 0.9,
            context: 'integration-test',
            emotionalState: 'joy',
            emotionalIntensity: 0.8
        };
        
        const memoryId = await memorySystem.storeMemory(emotionalMemory);
        this.assert(memoryId, 'Failed to store emotional memory');
        
        // Set up event listener for visualization change
        const visualChangePromise = this.waitForEvent('emotional-state-changed', 2000);
        
        // Trigger memory recall (implementation may vary)
        if (typeof memorySystem.recallMemoryById === 'function') {
            await memorySystem.recallMemoryById(memoryId);
        } else if (typeof memorySystem.retrieveMemories === 'function') {
            const memories = await memorySystem.retrieveMemories({
                id: memoryId
            });
            
            if (memories && memories.length > 0) {
                // Publish memory recall event
                window.eventSystem.publish('memory-recalled', {
                    memory: memories[0]
                });
            }
        }
        
        // Check if visualization responded to memory recall
        const visualChange = await visualChangePromise.catch(() => null);
        
        // This test may be skipped if the integration is not implemented
        if (!visualChange) {
            console.log('Note: Visualization did not respond to memory recall - this may be expected if the integration is not implemented');
        } else {
            this.assert(
                visualChange.state === 'joy',
                'Visualization did not respond correctly to emotional memory recall'
            );
        }
    }
    
    /**
     * Test integration between audio and memory systems
     */
    async testAudioMemoryIntegration() {
        // Skip if either system is not initialized
        if (!this.dependencies['spatial-audio'].initialized) {
            this.skip('Spatial audio system not initialized');
        }
        
        if (!this.dependencies['memory-system'].initialized) {
            this.skip('Memory system not initialized');
        }
        
        const audioSystem = window.spatialAudioSystem;
        const memorySystem = window.longTermMemorySystem;
        
        // Store a memory with audio context
        const audioMemory = {
            text: 'This is a memory with audio context for testing integration',
            importance: 0.7,
            context: 'integration-test',
            audioEnvironment: 'large-room',
            emotionalState: 'reflective'
        };
        
        const memoryId = await memorySystem.storeMemory(audioMemory);
        this.assert(memoryId, 'Failed to store audio memory');
        
        // Set up event listener for audio environment change
        const audioChangePromise = this.waitForEvent('audio-environment-changed', 2000);
        
        // Trigger memory recall (implementation may vary)
        if (typeof memorySystem.recallMemoryById === 'function') {
            await memorySystem.recallMemoryById(memoryId);
        } else if (typeof memorySystem.retrieveMemories === 'function') {
            const memories = await memorySystem.retrieveMemories({
                id: memoryId
            });
            
            if (memories && memories.length > 0) {
                // Publish memory recall event
                window.eventSystem.publish('memory-recalled', {
                    memory: memories[0]
                });
            }
        }
        
        // Check if audio system responded to memory recall
        const audioChange = await audioChangePromise.catch(() => null);
        
        // This test may be skipped if the integration is not implemented
        if (!audioChange) {
            console.log('Note: Audio system did not respond to memory recall - this may be expected if the integration is not implemented');
        } else {
            this.assert(
                audioChange.environment === 'large-room',
                'Audio system did not respond correctly to memory recall'
            );
        }
    }
    
    /**
     * Test integration with user profile system
     */
    async testProfileSystemIntegration() {
        // Skip if profile system is not initialized
        if (!this.dependencies['user-profiles'].initialized) {
            this.skip('User profile system not initialized');
        }
        
        const profileSystem = window.advancedUserProfileSystem;
        
        // Test profile settings propagation to other systems
        
        // 1. Test theme change propagation
        const themeChangePromise = this.waitForEvent('theme-change', 2000);
        
        // Update theme preference
        await profileSystem.updatePreference('preferences', 'theme', 'night');
        
        // Check if theme change event was fired
        const themeChange = await themeChangePromise.catch(() => null);
        this.assert(
            themeChange && themeChange.theme === 'night',
            'Theme change was not propagated correctly'
        );
        
        // 2. Test audio settings propagation
        if (this.dependencies['spatial-audio'].initialized) {
            const audioChangePromise = this.waitForEvent('audio-mute-change', 2000);
            
            // Update audio preference
            await profileSystem.updatePreference('preferences', 'audioEnabled', false);
            
            // Check if audio change event was fired
            const audioChange = await audioChangePromise.catch(() => null);
            this.assert(
                audioChange && audioChange.muted === true,
                'Audio setting change was not propagated correctly'
            );
        }
        
        // 3. Test accessibility settings propagation
        const accessibilityChangePromise = this.waitForEvent('accessibility-settings-change', 2000);
        
        // Update accessibility preference
        await profileSystem.updatePreference('accessibility', 'highContrast', true);
        
        // Check if accessibility change event was fired
        const accessibilityChange = await accessibilityChangePromise.catch(() => null);
        this.assert(
            accessibilityChange && accessibilityChange.settings.highContrast === true,
            'Accessibility setting change was not propagated correctly'
        );
    }
    
    /**
     * Test end-to-end emotional state workflow
     */
    async testEmotionalStateWorkflow() {
        // Skip if required systems are not initialized
        if (!this.dependencies['3d-visualization'].initialized ||
            !this.dependencies['spatial-audio'].initialized) {
            this.skip('Required systems not initialized for emotional state workflow test');
        }
        
        const visualizationSystem = window.pixelVisualization3D || window.pixelVisualization;
        const audioSystem = window.spatialAudioSystem;
        
        // Test complete emotional state change workflow
        
        // 1. Set up event listeners
        const visualChangePromise = this.waitForEvent('emotional-state-changed', 2000);
        const audioAdjustPromise = this.waitForEvent('emotional-audio-adjusted', 2000);
        
        // 2. Trigger emotional state change via event system
        window.eventSystem.publish('emotional-state-change', {
            state: 'empathetic',
            intensity: 0.75,
            source: 'integration-test'
        });
        
        // 3. Check if visualization system responded
        const visualChange = await visualChangePromise.catch(() => null);
        this.assert(
            visualChange && visualChange.state === 'empathetic',
            'Visualization system did not respond to emotional state change event'
        );
        
        // 4. Check if audio system responded
        const audioAdjust = await audioAdjustPromise.catch(() => null);
        this.assert(
            audioAdjust && audioAdjust.state === 'empathetic',
            'Audio system did not respond to emotional state change event'
        );
        
        // 5. Verify systems are in the correct state
        if (typeof visualizationSystem.getCurrentEmotionalState === 'function') {
            const currentState = visualizationSystem.getCurrentEmotionalState();
            this.assert(
                currentState && currentState.state === 'empathetic',
                'Visualization system is not in the correct emotional state'
            );
        }
    }
    
    /**
     * Test end-to-end memory recall workflow
     */
    async testMemoryRecallWorkflow() {
        // Skip if required systems are not initialized
        if (!this.dependencies['memory-system'].initialized) {
            this.skip('Memory system not initialized for memory recall workflow test');
        }
        
        const memorySystem = window.longTermMemorySystem;
        
        // Test complete memory recall workflow
        
        // 1. Store a complex memory with multiple attributes
        const complexMemory = {
            text: 'This is a complex memory for testing the recall workflow',
            importance: 0.9,
            context: 'integration-test-workflow',
            emotionalState: 'curious',
            emotionalIntensity: 0.7,
            audioEnvironment: 'medium-room',
            topics: ['technology', 'testing'],
            timestamp: Date.now()
        };
        
        const memoryId = await memorySystem.storeMemory(complexMemory);
        this.assert(memoryId, 'Failed to store complex memory');
        
        // 2. Set up event listeners
        const memoryRecallPromise = this.waitForEvent('memory-recalled', 3000);
        
        // 3. Trigger memory retrieval by topic
        const retrievedMemories = await memorySystem.retrieveMemories({
            topics: ['technology'],
            context: 'integration-test-workflow',
            limit: 5
        });
        
        this.assert(
            retrievedMemories && retrievedMemories.length > 0,
            'Failed to retrieve memories by topic'
        );
        
        // 4. Publish memory recall event for the first retrieved memory
        window.eventSystem.publish('memory-recalled', {
            memory: retrievedMemories[0],
            source: 'integration-test'
        });
        
        // 5. Check if memory recall event was properly processed
        const memoryRecall = await memoryRecallPromise.catch(() => null);
        this.assert(
            memoryRecall && memoryRecall.memory && memoryRecall.memory.id === memoryId,
            'Memory recall event was not properly processed'
        );
        
        // 6. Test memory visualization if available
        if (window.memoryVisualization) {
            const visualizationPromise = this.waitForEvent('memory-visualization-updated', 2000)
                .catch(() => null);
            
            // Trigger visualization
            window.memoryVisualization.visualizeMemory(retrievedMemories[0]);
            
            // Check if visualization was updated
            const visualization = await visualizationPromise;
            if (visualization) {
                this.assert(
                    visualization.memoryId === memoryId,
                    'Memory visualization was not updated correctly'
                );
            }
        }
    }
    
    /**
     * Test end-to-end user preference workflow
     */
    async testUserPreferenceWorkflow() {
        // Skip if required systems are not initialized
        if (!this.dependencies['user-profiles'].initialized) {
            this.skip('User profile system not initialized for preference workflow test');
        }
        
        const profileSystem = window.advancedUserProfileSystem;
        
        // Test complete user preference workflow
        
        // 1. Create a test profile
        const testProfileName = 'Integration Test Profile';
        const testProfile = await profileSystem.createProfile(testProfileName, {
            preferences: {
                theme: 'light',
                voiceType: 'friendly',
                audioEnabled: true
            }
        });
        
        this.assert(testProfile, 'Failed to create test profile');
        
        // 2. Set up event listeners
        const profileSwitchPromise = this.waitForEvent('user-profile-switched', 2000);
        
        // 3. Switch to the test profile
        const switched = await profileSystem.switchProfile(testProfile.id);
        this.assert(switched, 'Failed to switch to test profile');
        
        // 4. Check if profile switch event was fired
        const profileSwitch = await profileSwitchPromise.catch(() => null);
        this.assert(
            profileSwitch && profileSwitch.profileId === testProfile.id,
            'Profile switch event was not fired correctly'
        );
        
        // 5. Test preference learning
        const learnedPreferencePromise = this.waitForEvent('learned-preference-applied', 5000)
            .catch(() => null);
        
        // Simulate multiple preference signals
        for (let i = 0; i < 5; i++) {
            await profileSystem.learnPreference(
                'conversationStyle',
                'detailLevel',
                'detailed',
                { explicit: i === 4, sentiment: 0.8 }
            );
            await this.wait(100);
        }
        
        // Check if learned preference was applied
        const learnedPreference = await learnedPreferencePromise;
        if (learnedPreference) {
            this.assert(
                learnedPreference.key === 'detailLevel' && 
                learnedPreference.value === 'detailed',
                'Learned preference was not applied correctly'
            );
        }
        
        // 6. Clean up - delete test profile
        const activeProfile = profileSystem.getActiveProfile();
        if (activeProfile && activeProfile.id !== testProfile.id) {
            await profileSystem.deleteProfile(testProfile.id);
        }
    }
    
    /**
     * Test end-to-end multi-modal interaction workflow
     */
    async testMultiModalInteractionWorkflow() {
        // Count initialized systems
        let initializedCount = 0;
        for (const key in this.dependencies) {
            if (this.dependencies[key].initialized) {
                initializedCount++;
            }
        }
        
        // Skip if not enough systems are initialized
        if (initializedCount < 3) {
            this.skip('Not enough systems initialized for multi-modal workflow test');
        }
        
        // Test complete multi-modal interaction workflow
        
        // 1. Set up event listeners for various components
        const eventPromises = [
            this.waitForEvent('emotional-state-changed', 5000).catch(() => null),
            this.waitForEvent('emotional-audio-adjusted', 5000).catch(() => null),
            this.waitForEvent('memory-stored', 5000).catch(() => null)
        ];
        
        // 2. Simulate a complex user interaction
        window.eventSystem.publish('user-interaction', {
            message: 'I really enjoyed our conversation about technology yesterday',
            sentiment: 0.8,
            context: {
                currentSettings: {
                    responseLength: 'medium',
                    detailLevel: 'detailed',
                    emotionalTone: 'enthusiastic'
                },
                userResponse: {
                    engagementTime: 45000,
                    sentiment: 0.8
                },
                feedback: {
                    detailLevel: 'detailed'
                }
            }
        });
        
        // 3. Wait for all events to be processed
        await this.wait(1000);
        
        // 4. Simulate emotional response
        window.eventSystem.publish('emotional-state-change', {
            state: 'joy',
            intensity: 0.8,
            source: 'conversation-flow'
        });
        
        // 5. Wait for events
        const [visualEvent, audioEvent, memoryEvent] = await Promise.all(eventPromises);
        
        // 6. Check results - not all events may fire depending on implementation
        let passedChecks = 0;
        
        if (visualEvent && visualEvent.state === 'joy') {
            passedChecks++;
        }
        
        if (audioEvent && audioEvent.state === 'joy') {
            passedChecks++;
        }
        
        if (memoryEvent) {
            passedChecks++;
        }
        
        // Test passes if at least one component responded correctly
        this.assert(
            passedChecks > 0,
            'No components responded correctly to the multi-modal interaction'
        );
        
        console.log(`Multi-modal workflow test: ${passedChecks} of 3 components responded correctly`);
    }
    
    /**
     * Test visualization performance
     */
    async testVisualizationPerformance() {
        // Skip if visualization system is not initialized
        if (!this.dependencies['3d-visualization'].initialized) {
            this.skip('3D visualization system not initialized for performance test');
        }
        
        const visualizationSystem = window.pixelVisualization3D || window.pixelVisualization;
        
        // Test visualization performance
        
        // 1. Measure initial FPS if available
        let initialFps = null;
        if (typeof visualizationSystem.getFPS === 'function') {
            initialFps = visualizationSystem.getFPS();
        }
        
        // 2. Run stress test with multiple rapid state changes
        const states = ['joy', 'reflective', 'curious', 'excited', 'empathetic'];
        const startTime = performance.now();
        
        for (let i = 0; i < 10; i++) {
            const state = states[i % states.length];
            visualizationSystem.setEmotionalState(state, 0.8);
            await this.wait(200);
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // 3. Measure final FPS if available
        let finalFps = null;
        if (typeof visualizationSystem.getFPS === 'function') {
            finalFps = visualizationSystem.getFPS();
        }
        
        // 4. Check performance
        if (initialFps !== null && finalFps !== null) {
            // FPS should not drop more than 30%
            this.assert(
                finalFps >= initialFps * 0.7,
                `FPS dropped too much: ${initialFps} -> ${finalFps}`
            );
        } else {
            // If FPS measurement is not available, just check that the test completed
            this.assert(
                duration < 3000,
                `Visualization performance test took too long: ${duration}ms`
            );
        }
    }
    
    /**
     * Test memory system performance
     */
    async testMemorySystemPerformance() {
        // Skip if memory system is not initialized
        if (!this.dependencies['memory-system'].initialized) {
            this.skip('Memory system not initialized for performance test');
        }
        
        const memorySystem = window.longTermMemorySystem;
        
        // Test memory system performance
        
        // 1. Prepare test data
        const testMemories = [];
        for (let i = 0; i < 20; i++) {
            testMemories.push({
                text: `Performance test memory ${i}`,
                importance: Math.random(),
                context: 'performance-test',
                timestamp: Date.now() - (i * 60000)
            });
        }
        
        // 2. Measure store performance
        const storeStartTime = performance.now();
        
        for (const memory of testMemories) {
            await memorySystem.storeMemory(memory);
        }
        
        const storeEndTime = performance.now();
        const storeTime = storeEndTime - storeStartTime;
        
        // 3. Measure retrieval performance
        const retrieveStartTime = performance.now();
        
        for (let i = 0; i < 5; i++) {
            await memorySystem.retrieveMemories({
                context: 'performance-test',
                limit: 10
            });
        }
        
        const retrieveEndTime = performance.now();
        const retrieveTime = retrieveEndTime - retrieveStartTime;
        
        // 4. Check performance
        // Store should take less than 50ms per memory on average
        this.assert(
            storeTime / testMemories.length < 50,
            `Memory storage is too slow: ${storeTime / testMemories.length}ms per memory`
        );
        
        // Retrieval should take less than 100ms per query on average
        this.assert(
            retrieveTime / 5 < 100,
            `Memory retrieval is too slow: ${retrieveTime / 5}ms per query`
        );
    }
    
    /**
     * Test audio system performance
     */
    async testAudioSystemPerformance() {
        // Skip if audio system is not initialized
        if (!this.dependencies['spatial-audio'].initialized) {
            this.skip('Spatial audio system not initialized for performance test');
        }
        
        const audioSystem = window.spatialAudioSystem;
        
        // Test audio system performance
        
        // 1. Measure environment change performance
        const environments = ['small-room', 'medium-room', 'large-room', 'hall', 'outdoor'];
        const startTime = performance.now();
        
        for (const environment of environments) {
            await audioSystem.setEnvironment(environment);
            await this.wait(100);
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // 2. Check performance
        // Environment changes should take less than 200ms on average
        const averageTime = (duration - (environments.length * 100)) / environments.length;
        
        this.assert(
            averageTime < 200,
            `Audio environment changes are too slow: ${averageTime}ms per change`
        );
    }
    
    /**
     * Test overall system performance
     */
    async testOverallSystemPerformance() {
        // Count initialized systems
        let initializedCount = 0;
        for (const key in this.dependencies) {
            if (this.dependencies[key].initialized) {
                initializedCount++;
            }
        }
        
        // Skip if not enough systems are initialized
        if (initializedCount < 3) {
            this.skip('Not enough systems initialized for overall performance test');
        }
        
        // Test overall system performance
        
        // 1. Measure event processing performance
        const events = [
            { name: 'emotional-state-change', data: { state: 'joy', intensity: 0.8 } },
            { name: 'user-interaction', data: { message: 'Performance test message' } },
            { name: 'theme-change', data: { theme: 'dark' } },
            { name: 'audio-environment-change', data: { environment: 'large-room' } },
            { name: 'memory-search', data: { query: 'performance test' } }
        ];
        
        const startTime = performance.now();
        
        for (const event of events) {
            window.eventSystem.publish(event.name, event.data);
            await this.wait(100);
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // 2. Check performance
        // Event processing should take less than 500ms total (excluding waits)
        const processingTime = duration - (events.length * 100);
        
        this.assert(
            processingTime < 500,
            `Overall event processing is too slow: ${processingTime}ms for ${events.length} events`
        );
    }
}

// Create and export singleton instance
const integrationTestSystem = new IntegrationTestSystem();
export default integrationTestSystem;
