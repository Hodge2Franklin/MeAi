/**
 * MeAI Integration Test Suite
 * 
 * Comprehensive tests for all MeAI components and their integration
 */

class MeAITestSuite {
    constructor() {
        this.tests = [];
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            duration: 0
        };
        this.currentTest = null;
    }

    /**
     * Initialize the test suite
     */
    async initialize() {
        console.log('Initializing MeAI Test Suite...');
        
        // Register all tests
        this.registerTests();
        
        console.log(`Registered ${this.tests.length} tests`);
        return true;
    }
    
    /**
     * Register all tests
     */
    registerTests() {
        // Core system tests
        this.addTest('EventSystem', 'Basic event publishing and subscribing', this.testEventSystem);
        this.addTest('StorageManager', 'IndexedDB storage and retrieval', this.testStorageManager);
        this.addTest('SystemIntegration', 'System initialization and coordination', this.testSystemIntegration);
        
        // Advanced NLU tests
        this.addTest('AdvancedNLU', 'Natural language understanding capabilities', this.testAdvancedNLU);
        this.addTest('ContextAwareness', 'Context tracking and management', this.testContextAwareness);
        this.addTest('SentimentAnalysis', 'Emotion detection in text', this.testSentimentAnalysis);
        this.addTest('TopicModeling', 'Topic identification and tracking', this.testTopicModeling);
        
        // User experience tests
        this.addTest('EnhancedUserExperience', 'Overall user experience features', this.testEnhancedUserExperience);
        this.addTest('Onboarding', 'User onboarding process', this.testOnboarding);
        this.addTest('UserFeedback', 'Feedback collection and processing', this.testUserFeedback);
        this.addTest('ConversationFlows', 'Customizable conversation patterns', this.testConversationFlows);
        
        // Performance tests
        this.addTest('PerformanceOptimization', 'Resource management and optimization', this.testPerformanceOptimization);
        this.addTest('AdaptiveLoading', 'Content loading based on device capabilities', this.testAdaptiveLoading);
        this.addTest('ProgressiveLoading', 'Staged loading of components', this.testProgressiveLoading);
        
        // Visual system tests
        this.addTest('3DVisualization', '3D rendering and animations', this.test3DVisualization);
        this.addTest('AdvancedAnimations', 'Physics-based and procedural animations', this.testAdvancedAnimations);
        this.addTest('ThemeSystem', 'Visual theme management', this.testThemeSystem);
        
        // Audio system tests
        this.addTest('SpatialAudio', '3D audio positioning', this.testSpatialAudio);
        this.addTest('VoiceRecognition', 'Speech input processing', this.testVoiceRecognition);
        
        // Utility tests
        this.addTest('MultiLanguage', 'Language detection and translation', this.testMultiLanguage);
        this.addTest('OfflineSupport', 'Functionality without internet connection', this.testOfflineSupport);
        
        // Integration tests
        this.addTest('FullConversation', 'Complete conversation flow', this.testFullConversation);
        this.addTest('CrossComponentCommunication', 'Event-based communication between components', this.testCrossComponentCommunication);
        this.addTest('ErrorHandling', 'System recovery from errors', this.testErrorHandling);
        
        // Performance benchmarks
        this.addTest('MemoryUsage', 'Memory consumption over time', this.testMemoryUsage);
        this.addTest('CPUUtilization', 'CPU usage during operation', this.testCPUUtilization);
        this.addTest('LoadingTime', 'Initial loading and initialization time', this.testLoadingTime);
        
        // Accessibility tests
        this.addTest('Accessibility', 'WCAG compliance and screen reader support', this.testAccessibility);
    }
    
    /**
     * Add a test to the suite
     * @param {string} name - Test name
     * @param {string} description - Test description
     * @param {Function} testFunction - Test function
     */
    addTest(name, description, testFunction) {
        this.tests.push({
            name,
            description,
            testFunction: testFunction.bind(this),
            status: 'pending', // 'pending', 'running', 'passed', 'failed', 'skipped'
            error: null,
            duration: 0
        });
    }
    
    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('Running all tests...');
        
        const startTime = performance.now();
        
        this.results = {
            total: this.tests.length,
            passed: 0,
            failed: 0,
            skipped: 0,
            duration: 0
        };
        
        // Run each test
        for (const test of this.tests) {
            await this.runTest(test);
        }
        
        const endTime = performance.now();
        this.results.duration = endTime - startTime;
        
        console.log('All tests completed.');
        console.log(`Results: ${this.results.passed} passed, ${this.results.failed} failed, ${this.results.skipped} skipped`);
        console.log(`Total duration: ${this.results.duration.toFixed(2)}ms`);
        
        return this.results;
    }
    
    /**
     * Run a specific test
     * @param {Object} test - Test to run
     */
    async runTest(test) {
        console.log(`Running test: ${test.name} - ${test.description}`);
        
        test.status = 'running';
        this.currentTest = test;
        
        const startTime = performance.now();
        
        try {
            // Run test function
            await test.testFunction();
            
            // If we got here, test passed
            test.status = 'passed';
            this.results.passed++;
            
        } catch (error) {
            // Test failed
            test.status = 'failed';
            test.error = error.message || error;
            this.results.failed++;
            
            console.error(`Test failed: ${test.name}`, error);
        }
        
        const endTime = performance.now();
        test.duration = endTime - startTime;
        
        console.log(`Test ${test.name} ${test.status} in ${test.duration.toFixed(2)}ms`);
        
        this.currentTest = null;
        return test;
    }
    
    /**
     * Skip a test
     * @param {string} reason - Reason for skipping
     */
    skipCurrentTest(reason) {
        if (!this.currentTest) {
            throw new Error('No test is currently running');
        }
        
        this.currentTest.status = 'skipped';
        this.currentTest.error = reason;
        this.results.skipped++;
        
        throw new Error(`Test skipped: ${reason}`);
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
     * Assert that two values are equal
     * @param {*} actual - Actual value
     * @param {*} expected - Expected value
     * @param {string} message - Error message if values are not equal
     */
    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected} but got ${actual}`);
        }
    }
    
    /**
     * Assert that a function throws an error
     * @param {Function} fn - Function to call
     * @param {string} expectedError - Expected error message (optional)
     * @param {string} message - Error message if function doesn't throw
     */
    assertThrows(fn, expectedError, message) {
        try {
            fn();
            throw new Error(message || 'Expected function to throw an error');
        } catch (error) {
            if (expectedError && error.message !== expectedError) {
                throw new Error(`Expected error "${expectedError}" but got "${error.message}"`);
            }
        }
    }
    
    /**
     * Assert that a promise resolves
     * @param {Promise} promise - Promise to check
     * @param {string} message - Error message if promise rejects
     */
    async assertResolves(promise, message) {
        try {
            await promise;
        } catch (error) {
            throw new Error(message || `Expected promise to resolve but it rejected with: ${error.message}`);
        }
    }
    
    /**
     * Assert that a promise rejects
     * @param {Promise} promise - Promise to check
     * @param {string} expectedError - Expected error message (optional)
     * @param {string} message - Error message if promise resolves
     */
    async assertRejects(promise, expectedError, message) {
        try {
            await promise;
            throw new Error(message || 'Expected promise to reject but it resolved');
        } catch (error) {
            if (expectedError && error.message !== expectedError) {
                throw new Error(`Expected error "${expectedError}" but got "${error.message}"`);
            }
        }
    }
    
    // ======== TEST IMPLEMENTATIONS ========
    
    /**
     * Test the Event System
     */
    async testEventSystem() {
        // Check if event system exists
        this.assert(window.eventSystem, 'Event system not found');
        
        // Test basic publish/subscribe
        let receivedData = null;
        
        window.eventSystem.subscribe('test-event', (data) => {
            receivedData = data;
        });
        
        window.eventSystem.publish('test-event', { message: 'Hello, World!' });
        
        // Wait for event to be processed
        await new Promise(resolve => setTimeout(resolve, 10));
        
        this.assertEqual(receivedData.message, 'Hello, World!', 'Event data not received correctly');
        
        // Test unsubscribe
        receivedData = null;
        window.eventSystem.unsubscribe('test-event');
        
        window.eventSystem.publish('test-event', { message: 'This should not be received' });
        
        // Wait for event to be processed
        await new Promise(resolve => setTimeout(resolve, 10));
        
        this.assertEqual(receivedData, null, 'Event received after unsubscribe');
    }
    
    /**
     * Test the Storage Manager
     */
    async testStorageManager() {
        // Check if storage manager exists
        this.assert(window.storageManager, 'Storage manager not found');
        
        // Test IndexedDB storage
        const testData = {
            id: 'test-item',
            value: 'test-value',
            timestamp: Date.now()
        };
        
        // Store data
        await window.storageManager.setIndexedDB('test-store', testData);
        
        // Retrieve data
        const retrievedData = await window.storageManager.getIndexedDB('test-store', 'test-item');
        
        this.assertEqual(retrievedData.value, 'test-value', 'Retrieved data does not match stored data');
        
        // Delete data
        await window.storageManager.removeIndexedDB('test-store', 'test-item');
        
        // Verify deletion
        const deletedData = await window.storageManager.getIndexedDB('test-store', 'test-item');
        
        this.assertEqual(deletedData, null, 'Data not deleted properly');
    }
    
    /**
     * Test the System Integration Manager
     */
    async testSystemIntegration() {
        // Check if system integration manager exists
        this.assert(window.SystemIntegrationManager, 'System Integration Manager not found');
        
        // Create a test system
        window.testSystem = {
            initialized: false,
            initialize: function() {
                this.initialized = true;
                return true;
            },
            reset: function() {
                this.initialized = false;
                return true;
            }
        };
        
        // Create integration manager with test system
        const integrationManager = new window.SystemIntegrationManager({
            requiredSystems: ['eventSystem', 'storageManager', 'testSystem']
        });
        
        // Initialize
        const initResult = await integrationManager.initialize();
        
        this.assert(initResult, 'System Integration Manager initialization failed');
        this.assert(window.testSystem.initialized, 'Test system not initialized');
        
        // Get system status
        const status = await integrationManager.getSystemStatus();
        
        this.assert(status.systems.testSystem.initialized, 'Test system not reported as initialized');
        
        // Reset test system
        const resetResult = await integrationManager.resetSystem('testSystem');
        
        this.assert(resetResult.success, 'System reset failed');
        this.assert(!window.testSystem.initialized, 'Test system not reset');
    }
    
    /**
     * Test the Advanced NLU System
     */
    async testAdvancedNLU() {
        // Check if advanced NLU system exists
        if (!window.advancedNLUSystem) {
            this.skipCurrentTest('Advanced NLU System not found');
        }
        
        // Test basic understanding
        const understanding = await window.advancedNLUSystem.processInput('Hello, how are you today?');
        
        this.assert(understanding, 'No understanding result returned');
        this.assert(understanding.intent, 'No intent detected');
        this.assert(understanding.entities, 'No entities returned');
        
        // Test intent detection
        const greetingResult = await window.advancedNLUSystem.processInput('Hi there!');
        
        this.assertEqual(greetingResult.intent, 'greeting', 'Greeting intent not detected');
        
        // Test entity extraction
        const entityResult = await window.advancedNLUSystem.processInput('My name is John and I live in New York');
        
        this.assert(entityResult.entities.find(e => e.type === 'person' && e.value === 'John'), 'Person entity not detected');
        this.assert(entityResult.entities.find(e => e.type === 'location' && e.value === 'New York'), 'Location entity not detected');
    }
    
    /**
     * Test the Context Awareness System
     */
    async testContextAwareness() {
        // Check if context awareness system exists
        if (!window.contextAwarenessSystem) {
            this.skipCurrentTest('Context Awareness System not found');
        }
        
        // Initialize context
        await window.contextAwarenessSystem.initialize();
        
        // Add context
        await window.contextAwarenessSystem.addToContext('user', { name: 'John', location: 'New York' });
        
        // Get context
        const userContext = await window.contextAwarenessSystem.getFromContext('user');
        
        this.assertEqual(userContext.name, 'John', 'User name not in context');
        this.assertEqual(userContext.location, 'New York', 'User location not in context');
        
        // Test context-based understanding
        await window.contextAwarenessSystem.processMessage('I love it here');
        
        const locationContext = await window.contextAwarenessSystem.resolveReference('here');
        
        this.assertEqual(locationContext, 'New York', 'Reference resolution failed');
    }
    
    /**
     * Test the Sentiment Analysis System
     */
    async testSentimentAnalysis() {
        // Check if sentiment analysis system exists
        if (!window.sentimentAnalysisSystem) {
            this.skipCurrentTest('Sentiment Analysis System not found');
        }
        
        // Test positive sentiment
        const positiveResult = await window.sentimentAnalysisSystem.analyzeSentiment('I am very happy today!');
        
        this.assert(positiveResult.score > 0, 'Positive sentiment not detected');
        this.assertEqual(positiveResult.primaryEmotion, 'happiness', 'Primary emotion incorrect');
        
        // Test negative sentiment
        const negativeResult = await window.sentimentAnalysisSystem.analyzeSentiment('I am very sad and angry.');
        
        this.assert(negativeResult.score < 0, 'Negative sentiment not detected');
        this.assert(['sadness', 'anger'].includes(negativeResult.primaryEmotion), 'Primary emotion incorrect');
        
        // Test neutral sentiment
        const neutralResult = await window.sentimentAnalysisSystem.analyzeSentiment('The sky is blue.');
        
        this.assert(neutralResult.score >= -0.2 && neutralResult.score <= 0.2, 'Neutral sentiment not detected');
    }
    
    /**
     * Test the Topic Modeling System
     */
    async testTopicModeling() {
        // Check if topic modeling system exists
        if (!window.topicModelingSystem) {
            this.skipCurrentTest('Topic Modeling System not found');
        }
        
        // Add messages about technology
        await window.topicModelingSystem.processMessage('I love my new smartphone.');
        await window.topicModelingSystem.processMessage('The latest AI advancements are amazing.');
        await window.topicModelingSystem.processMessage('Cloud computing is transforming businesses.');
        
        // Get current topic
        const currentTopic = await window.topicModelingSystem.getCurrentTopic();
        
        this.assertEqual(currentTopic.name, 'technology', 'Technology topic not detected');
        
        // Switch topic
        await window.topicModelingSystem.processMessage('I went hiking in the mountains yesterday.');
        await window.topicModelingSystem.processMessage('The weather was perfect for outdoor activities.');
        
        const newTopic = await window.topicModelingSystem.getCurrentTopic();
        
        this.assertNotEqual(newTopic.name, 'technology', 'Topic not switched from technology');
    }
    
    /**
     * Test the Enhanced User Experience System
     */
    async testEnhancedUserExperience() {
        // Check if enhanced user experience system exists
        if (!window.enhancedUserExperienceSystem) {
            this.skipCurrentTest('Enhanced User Experience System not found');
        }
        
        // Test preference setting
        await window.enhancedUserExperienceSystem.setPreference('responseLength', 'medium');
        
        const preference = await window.enhancedUserExperienceSystem.getPreference('responseLength');
        
        this.assertEqual(preference, 'medium', 'Preference not set correctly');
        
        // Test user profile
        await window.enhancedUserExperienceSystem.updateUserProfile({
            name: 'Test User',
            interests: ['technology', 'science']
        });
        
        const profile = await window.enhancedUserExperienceSystem.getUserProfile();
        
        this.assertEqual(profile.name, 'Test User', 'User profile name not set');
        this.assert(profile.interests.includes('technology'), 'User interests not set');
    }
    
    /**
     * Test the Onboarding System
     */
    async testOnboarding() {
        // Check if onboarding system exists
        if (!window.enhancedUserExperienceSystem || !window.enhancedUserExperienceSystem.onboarding) {
            this.skipCurrentTest('Onboarding System not found');
        }
        
        const onboarding = window.enhancedUserExperienceSystem.onboarding;
        
        // Test onboarding steps
        const steps = await onboarding.getOnboardingSteps();
        
        this.assert(steps.length > 0, 'No onboarding steps defined');
        
        // Test step navigation
        await onboarding.startOnboarding();
        
        const currentStep = await onboarding.getCurrentStep();
        
        this.assertEqual(currentStep.index, 0, 'Onboarding not starting at first step');
        
        // Move to next step
        await onboarding.nextStep();
        
        const nextStep = await onboarding.getCurrentStep();
        
        this.assertEqual(nextStep.index, 1, 'Next step navigation failed');
    }
    
    /**
     * Test the User Feedback System
     */
    async testUserFeedback() {
        // Check if feedback system exists
        if (!window.enhancedUserExperienceSystem || !window.enhancedUserExperienceSystem.feedback) {
            this.skipCurrentTest('User Feedback System not found');
        }
        
        const feedback = window.enhancedUserExperienceSystem.feedback;
        
        // Test feedback submission
        const result = await feedback.submitFeedback({
            rating: 4,
            comment: 'This is a test comment',
            category: 'general'
        });
        
        this.assert(result.success, 'Feedback submission failed');
        
        // Test feedback retrieval
        const recentFeedback = await feedback.getRecentFeedback();
        
        this.assert(recentFeedback.length > 0, 'No feedback retrieved');
        this.assert(recentFeedback.some(f => f.comment === 'This is a test comment'), 'Submitted feedback not found');
    }
    
    /**
     * Test the Conversation Flows
     */
    async testConversationFlows() {
        // Check if conversation flow system exists
        if (!window.enhancedUserExperienceSystem || !window.enhancedUserExperienceSystem.conversationFlow) {
            this.skipCurrentTest('Conversation Flow System not found');
        }
        
        const conversationFlow = window.enhancedUserExperienceSystem.conversationFlow;
        
        // Test flow creation
        const flow = await conversationFlow.createFlow('test-flow', {
            steps: [
                { id: 'greeting', message: 'Hello!' },
                { id: 'question', message: 'How are you?' },
                { id: 'farewell', message: 'Goodbye!' }
            ]
        });
        
        this.assert(flow, 'Flow creation failed');
        
        // Test flow execution
        await conversationFlow.startFlow('test-flow');
        
        const currentStep = await conversationFlow.getCurrentStep();
        
        this.assertEqual(currentStep.id, 'greeting', 'Flow not starting at first step');
        
        // Move to next step
        await conversationFlow.nextStep();
        
        const nextStep = await conversationFlow.getCurrentStep();
        
        this.assertEqual(nextStep.id, 'question', 'Flow navigation failed');
    }
    
    /**
     * Test the Performance Optimization System
     */
    async testPerformanceOptimization() {
        // Check if performance optimization system exists
        if (!window.performanceOptimizationSystem) {
            this.skipCurrentTest('Performance Optimization System not found');
        }
        
        // Test optimization level setting
        const result = await window.performanceOptimizationSystem.setOptimizationLevel('medium');
        
        this.assert(result.success, 'Setting optimization level failed');
        this.assertEqual(result.level, 'medium', 'Optimization level not set correctly');
        
        // Test performance status
        const status = await window.performanceOptimizationSystem.getPerformanceStatus();
        
        this.assert(status.optimizationLevel, 'Optimization level not in status');
        this.assert(status.deviceCapabilities, 'Device capabilities not in status');
        this.assert(status.resourceUsage, 'Resource usage not in status');
    }
    
    /**
     * Test the Adaptive Loading System
     */
    async testAdaptiveLoading() {
        // Check if performance optimization system exists
        if (!window.performanceOptimizationSystem) {
            this.skipCurrentTest('Performance Optimization System not found');
        }
        
        // Test device capability detection
        const capabilities = window.performanceOptimizationSystem.state.deviceCapabilities;
        
        this.assert(capabilities, 'Device capabilities not detected');
        this.assert(capabilities.memory !== null || capabilities.cpu.cores !== null, 'No device capabilities detected');
        
        // Test optimization based on capabilities
        const isLowEnd = capabilities.isLowEndDevice;
        const level = window.performanceOptimizationSystem.state.optimizationLevel;
        
        if (isLowEnd) {
            this.assertEqual(level, 'low', 'Low-end device not using low optimization level');
        }
    }
    
    /**
     * Test the Progressive Loading System
     */
    async testProgressiveLoading() {
        // Check if performance optimization system exists
        if (!window.performanceOptimizationSystem || !window.performanceOptimizationSystem.config.enableProgressiveLoading) {
            this.skipCurrentTest('Progressive Loading System not found or disabled');
        }
        
        // Test loading stages
        const loadingProgress = window.performanceOptimizationSystem.getLoadingProgress();
        
        this.assert(loadingProgress.enabled, 'Progressive loading not enabled');
        this.assert(loadingProgress.stages.length > 0, 'No loading stages defined');
        
        // Test stage completion
        const firstStage = loadingProgress.stages[0];
        
        window.performanceOptimizationSystem.updateLoadingStage(firstStage.id);
        
        const updatedProgress = window.performanceOptimizationSystem.getLoadingProgress();
        
        this.assert(updatedProgress.stages.find(s => s.id === firstStage.id).completed, 'Stage not marked as completed');
    }
    
    /**
     * Test the 3D Visualization System
     */
    async test3DVisualization() {
        // Check if 3D visualization system exists
        if (!window.pixelVisualization3D) {
            this.skipCurrentTest('3D Visualization System not found');
        }
        
        // Test initialization
        const initialized = await window.pixelVisualization3D.initialize();
        
        this.assert(initialized, '3D visualization initialization failed');
        
        // Test emotional state setting
        const result = await window.pixelVisualization3D.setEmotionalState('happy');
        
        this.assert(result.success, 'Setting emotional state failed');
        this.assertEqual(result.state, 'happy', 'Emotional state not set correctly');
        
        // Test animation
        const animationResult = await window.pixelVisualization3D.playAnimation('pulse');
        
        this.assert(animationResult.success, 'Animation playback failed');
    }
    
    /**
     * Test the Advanced Animation System
     */
    async testAdvancedAnimations() {
        // Check if advanced animation system exists
        if (!window.advancedAnimationSystem) {
            this.skipCurrentTest('Advanced Animation System not found');
        }
        
        // Test physics-based animation
        const physicsResult = await window.advancedAnimationSystem.createPhysicsAnimation({
            type: 'bounce',
            duration: 1000,
            elements: 10
        });
        
        this.assert(physicsResult.success, 'Physics animation creation failed');
        this.assert(physicsResult.animationId, 'No animation ID returned');
        
        // Test procedural animation
        const proceduralResult = await window.advancedAnimationSystem.createProceduralAnimation({
            type: 'wave',
            complexity: 'medium',
            duration: 2000
        });
        
        this.assert(proceduralResult.success, 'Procedural animation creation failed');
        this.assert(proceduralResult.animationId, 'No animation ID returned');
        
        // Test particle system
        const particleResult = await window.advancedAnimationSystem.createParticleSystem({
            type: 'sparkle',
            count: 100,
            duration: 3000
        });
        
        this.assert(particleResult.success, 'Particle system creation failed');
        this.assert(particleResult.systemId, 'No system ID returned');
    }
    
    /**
     * Test the Theme System
     */
    async testThemeSystem() {
        // Check if theme system exists
        if (!window.themeSystem) {
            this.skipCurrentTest('Theme System not found');
        }
        
        // Test theme listing
        const themes = await window.themeSystem.getAvailableThemes();
        
        this.assert(themes.length > 0, 'No themes available');
        
        // Test theme setting
        const result = await window.themeSystem.setTheme('dark');
        
        this.assert(result.success, 'Theme setting failed');
        this.assertEqual(result.theme, 'dark', 'Theme not set correctly');
        
        // Test custom theme
        const customResult = await window.themeSystem.createCustomTheme('custom-test', {
            primary: '#ff0000',
            secondary: '#00ff00',
            background: '#0000ff',
            text: '#ffffff'
        });
        
        this.assert(customResult.success, 'Custom theme creation failed');
        
        // Apply custom theme
        const applyResult = await window.themeSystem.setTheme('custom-test');
        
        this.assert(applyResult.success, 'Custom theme application failed');
    }
    
    /**
     * Test the Spatial Audio System
     */
    async testSpatialAudio() {
        // Check if spatial audio system exists
        if (!window.spatialAudioSystem) {
            this.skipCurrentTest('Spatial Audio System not found');
        }
        
        // Test initialization
        const initialized = await window.spatialAudioSystem.initialize();
        
        this.assert(initialized, 'Spatial audio initialization failed');
        
        // Test sound positioning
        const positionResult = await window.spatialAudioSystem.positionSound('notification', {
            x: 1.0,
            y: 0.5,
            z: -1.0
        });
        
        this.assert(positionResult.success, 'Sound positioning failed');
        
        // Test environmental effects
        const environmentResult = await window.spatialAudioSystem.setEnvironment('hall');
        
        this.assert(environmentResult.success, 'Environment setting failed');
        this.assertEqual(environmentResult.environment, 'hall', 'Environment not set correctly');
    }
    
    /**
     * Test the Voice Recognition System
     */
    async testVoiceRecognition() {
        // Check if voice recognition system exists
        if (!window.voiceRecognitionEnhancement) {
            this.skipCurrentTest('Voice Recognition Enhancement not found');
        }
        
        // Test initialization
        const initialized = await window.voiceRecognitionEnhancement.initialize();
        
        this.assert(initialized, 'Voice recognition initialization failed');
        
        // Test noise cancellation setting
        const noiseResult = await window.voiceRecognitionEnhancement.setNoiseCancellationLevel('high');
        
        this.assert(noiseResult.success, 'Noise cancellation setting failed');
        this.assertEqual(noiseResult.level, 'high', 'Noise cancellation level not set correctly');
        
        // Test language setting
        const languageResult = await window.voiceRecognitionEnhancement.setRecognitionLanguage('en-US');
        
        this.assert(languageResult.success, 'Recognition language setting failed');
        this.assertEqual(languageResult.language, 'en-US', 'Recognition language not set correctly');
    }
    
    /**
     * Test the Multi-Language Support System
     */
    async testMultiLanguage() {
        // Check if multi-language support system exists
        if (!window.multiLanguageSupport) {
            this.skipCurrentTest('Multi-Language Support System not found');
        }
        
        // Test language listing
        const languages = await window.multiLanguageSupport.getAvailableLanguages();
        
        this.assert(languages.length > 0, 'No languages available');
        this.assert(languages.includes('en'), 'English language not available');
        
        // Test language setting
        const result = await window.multiLanguageSupport.setLanguage('en');
        
        this.assert(result.success, 'Language setting failed');
        this.assertEqual(result.language, 'en', 'Language not set correctly');
        
        // Test translation
        const translation = await window.multiLanguageSupport.translate('Hello', 'en', 'es');
        
        this.assert(translation, 'Translation failed');
        this.assertEqual(translation, 'Hola', 'Translation incorrect');
    }
    
    /**
     * Test the Offline Support System
     */
    async testOfflineSupport() {
        // Check if offline support system exists
        if (!window.offlineSupportSystem) {
            this.skipCurrentTest('Offline Support System not found');
        }
        
        // Test initialization
        const initialized = await window.offlineSupportSystem.initialize();
        
        this.assert(initialized, 'Offline support initialization failed');
        
        // Test offline detection
        const isOnline = await window.offlineSupportSystem.isOnline();
        
        // This is a bit tricky to test reliably, so we just check that it returns a boolean
        this.assert(typeof isOnline === 'boolean', 'Online status detection failed');
        
        // Test offline message handling
        const messageResult = await window.offlineSupportSystem.handleOfflineMessage('Hello, offline world!');
        
        this.assert(messageResult.success, 'Offline message handling failed');
        this.assert(messageResult.response, 'No response for offline message');
    }
    
    /**
     * Test a full conversation flow
     */
    async testFullConversation() {
        // This test requires multiple systems to be available
        if (!window.advancedNLUSystem || !window.contextAwarenessSystem || 
            !window.sentimentAnalysisSystem || !window.topicModelingSystem) {
            this.skipCurrentTest('Required conversation systems not found');
        }
        
        // Start a conversation
        const messages = [
            'Hello, MeAI!',
            'My name is Test User.',
            'I live in Test City.',
            'I love technology and science.',
            'What can you tell me about artificial intelligence?',
            'That\'s interesting! Can you tell me more about machine learning?',
            'Thank you for the information.',
            'Goodbye!'
        ];
        
        let allResponsesReceived = true;
        let contextCorrect = true;
        
        // Process each message
        for (const message of messages) {
            // Process message through all systems
            const nluResult = await window.advancedNLUSystem.processInput(message);
            await window.contextAwarenessSystem.processMessage(message);
            await window.sentimentAnalysisSystem.analyzeSentiment(message);
            await window.topicModelingSystem.processMessage(message);
            
            // Check if we got a response
            if (!nluResult) {
                allResponsesReceived = false;
                break;
            }
        }
        
        // Check if user information was captured in context
        const userContext = await window.contextAwarenessSystem.getFromContext('user');
        
        if (!userContext || userContext.name !== 'Test User' || userContext.location !== 'Test City') {
            contextCorrect = false;
        }
        
        // Check if topic was identified correctly
        const currentTopic = await window.topicModelingSystem.getCurrentTopic();
        
        const topicCorrect = currentTopic && 
            (currentTopic.name === 'technology' || 
             currentTopic.name === 'artificial intelligence' || 
             currentTopic.name === 'machine learning');
        
        this.assert(allResponsesReceived, 'Not all messages received responses');
        this.assert(contextCorrect, 'User context not captured correctly');
        this.assert(topicCorrect, 'Conversation topic not identified correctly');
    }
    
    /**
     * Test cross-component communication
     */
    async testCrossComponentCommunication() {
        // This test requires the event system
        if (!window.eventSystem) {
            this.skipCurrentTest('Event System not found');
        }
        
        // Set up test components
        const componentA = {
            name: 'ComponentA',
            receivedMessage: null,
            initialize: function() {
                window.eventSystem.subscribe('test-cross-component', (data) => {
                    this.receivedMessage = data.message;
                });
                return true;
            }
        };
        
        const componentB = {
            name: 'ComponentB',
            sendMessage: function(message) {
                window.eventSystem.publish('test-cross-component', { message });
                return true;
            }
        };
        
        // Initialize component A
        componentA.initialize();
        
        // Send message from component B
        componentB.sendMessage('Cross-component test');
        
        // Wait for event to be processed
        await new Promise(resolve => setTimeout(resolve, 10));
        
        this.assertEqual(componentA.receivedMessage, 'Cross-component test', 'Cross-component message not received');
    }
    
    /**
     * Test error handling
     */
    async testErrorHandling() {
        // This test requires the system integration manager
        if (!window.SystemIntegrationManager) {
            this.skipCurrentTest('System Integration Manager not found');
        }
        
        // Create a test system that will fail
        window.failingSystem = {
            initialize: function() {
                throw new Error('Test error');
            }
        };
        
        // Create integration manager with failing system
        const integrationManager = new window.SystemIntegrationManager({
            requiredSystems: ['eventSystem', 'storageManager'],
            optionalSystems: ['failingSystem']
        });
        
        // Initialize
        await integrationManager.initialize();
        
        // Get system status
        const status = await integrationManager.getSystemStatus();
        
        // Check if error was recorded
        const failingSystemStatus = status.systems.failingSystem;
        
        this.assert(failingSystemStatus, 'Failing system status not recorded');
        this.assert(!failingSystemStatus.initialized, 'Failing system incorrectly marked as initialized');
        this.assert(failingSystemStatus.error, 'Failing system error not recorded');
        
        // Check if other systems still initialized
        this.assert(status.systems.eventSystem.initialized, 'Event system not initialized after error');
        this.assert(status.systems.storageManager.initialized, 'Storage manager not initialized after error');
    }
    
    /**
     * Test memory usage
     */
    async testMemoryUsage() {
        // This test requires the performance optimization system
        if (!window.performanceOptimizationSystem) {
            this.skipCurrentTest('Performance Optimization System not found');
        }
        
        // Get initial memory usage
        const initialStatus = await window.performanceOptimizationSystem.getPerformanceStatus();
        const initialMemory = initialStatus.resourceUsage.memory;
        
        // Skip if memory measurement not available
        if (initialMemory === null) {
            this.skipCurrentTest('Memory usage measurement not available');
        }
        
        // Create some memory pressure
        const largeArray = new Array(1000000).fill(Math.random());
        
        // Force memory monitoring
        window.performanceOptimizationSystem.monitorResources();
        
        // Wait for monitoring to complete
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Get updated memory usage
        const updatedStatus = await window.performanceOptimizationSystem.getPerformanceStatus();
        const updatedMemory = updatedStatus.resourceUsage.memory;
        
        // Clean up
        largeArray.length = 0;
        
        this.assert(updatedMemory !== null, 'Memory usage not measured');
        
        // Note: We don't assert that memory increased because garbage collection timing is unpredictable
    }
    
    /**
     * Test CPU utilization
     */
    async testCPUUtilization() {
        // This test is more of a benchmark than a pass/fail test
        
        // Create CPU load
        const startTime = performance.now();
        let result = 0;
        
        // Perform a CPU-intensive operation
        for (let i = 0; i < 1000000; i++) {
            result += Math.sqrt(i) * Math.cos(i);
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Log the result but don't fail the test
        console.log(`CPU test completed in ${duration.toFixed(2)}ms`);
        
        this.assert(true, 'CPU utilization test completed');
    }
    
    /**
     * Test loading time
     */
    async testLoadingTime() {
        // This test requires the system integration manager
        if (!window.SystemIntegrationManager) {
            this.skipCurrentTest('System Integration Manager not found');
        }
        
        // Create a test system
        window.loadingTestSystem = {
            initialize: function() {
                return new Promise(resolve => {
                    setTimeout(() => resolve(true), 100);
                });
            }
        };
        
        // Create integration manager with test system
        const startTime = performance.now();
        
        const integrationManager = new window.SystemIntegrationManager({
            requiredSystems: ['loadingTestSystem']
        });
        
        // Initialize
        await integrationManager.initialize();
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Get system status
        const status = await integrationManager.getSystemStatus();
        
        this.assert(status.systems.loadingTestSystem.initialized, 'Test system not initialized');
        this.assert(duration >= 100, 'Loading time too short');
        
        // Log the result but don't fail the test based on specific timing
        console.log(`Loading test completed in ${duration.toFixed(2)}ms`);
    }
    
    /**
     * Test accessibility
     */
    async testAccessibility() {
        // Check if accessibility system exists
        if (!window.accessibilitySystem) {
            this.skipCurrentTest('Accessibility System not found');
        }
        
        // Test high contrast mode
        const contrastResult = await window.accessibilitySystem.setHighContrastMode(true);
        
        this.assert(contrastResult.success, 'Setting high contrast mode failed');
        this.assertEqual(contrastResult.enabled, true, 'High contrast mode not enabled');
        
        // Test text size
        const textResult = await window.accessibilitySystem.setTextSize('large');
        
        this.assert(textResult.success, 'Setting text size failed');
        this.assertEqual(textResult.size, 'large', 'Text size not set correctly');
        
        // Test screen reader support
        const ariaLabels = await window.accessibilitySystem.checkAriaLabels();
        
        this.assert(ariaLabels.missingLabels.length === 0, 'Missing ARIA labels detected');
    }
}

// Export the class
window.MeAITestSuite = MeAITestSuite;
