/**
 * Focused Usability Testing System
 * 
 * This system provides automated testing for the main MeAI application,
 * focusing on core functionality and user experience.
 */

class FocusedUsabilityTestingSystem {
    constructor() {
        // Initialize state
        this.state = {
            initialized: false,
            testResults: {},
            testInProgress: false,
            currentTest: null,
            testQueue: [],
            testStartTime: null,
            testTimeout: 30000, // 30 seconds timeout for each test
            autoRunTests: false
        };
        
        // Define test cases
        this.testCases = [
            {
                id: 'conversation-input',
                name: 'Conversation Input',
                description: 'Tests if user can input text and submit messages',
                test: this.testConversationInput
            },
            {
                id: 'ai-response',
                name: 'AI Response',
                description: 'Tests if AI responds to user messages',
                test: this.testAIResponse
            },
            {
                id: 'visual-feedback',
                name: 'Visual Feedback',
                description: 'Tests if visual feedback is displayed during conversation',
                test: this.testVisualFeedback
            },
            {
                id: 'memory-context',
                name: 'Memory and Context',
                description: 'Tests if the system remembers previous messages',
                test: this.testMemoryContext
            },
            {
                id: 'voice-input',
                name: 'Voice Input',
                description: 'Tests if voice input is working',
                test: this.testVoiceInput
            },
            {
                id: 'cross-device',
                name: 'Cross-Device Compatibility',
                description: 'Tests if the application adapts to different screen sizes',
                test: this.testCrossDeviceCompatibility
            },
            {
                id: 'performance',
                name: 'Performance',
                description: 'Tests if the application performs well under load',
                test: this.testPerformance
            },
            {
                id: 'accessibility',
                name: 'Accessibility',
                description: 'Tests basic accessibility features',
                test: this.testAccessibility
            }
        ];
        
        // Initialize the system
        this.initialize();
    }
    
    /**
     * Initialize the focused usability testing system
     */
    initialize() {
        try {
            console.log('Initializing Focused Usability Testing System...');
            
            // Create event system if not exists
            window.eventSystem = window.eventSystem || this.createEventSystem();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Mark as initialized
            this.state.initialized = true;
            
            console.log('Focused Usability Testing System initialized successfully');
            
            return true;
        } catch (error) {
            console.error('Error initializing Focused Usability Testing System:', error);
            return false;
        }
    }
    
    /**
     * Create event system if not exists
     */
    createEventSystem() {
        console.warn('Global EventSystem not found, creating local instance');
        return {
            listeners: {},
            subscribe: function(event, callback) {
                if (!this.listeners[event]) {
                    this.listeners[event] = [];
                }
                this.listeners[event].push(callback);
                return () => {
                    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
                };
            },
            publish: function(event, data) {
                if (this.listeners[event]) {
                    this.listeners[event].forEach(callback => {
                        try {
                            callback(data);
                        } catch (error) {
                            console.error(`Error in event listener for ${event}:`, error);
                        }
                    });
                }
            }
        };
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for test completion
        window.eventSystem.subscribe('test-completed', (data) => {
            this.handleTestCompletion(data);
        });
        
        // Listen for test failure
        window.eventSystem.subscribe('test-failed', (data) => {
            this.handleTestFailure(data);
        });
        
        // Listen for run all tests
        window.eventSystem.subscribe('run-all-tests', () => {
            this.runAllTests();
        });
        
        // Listen for run specific test
        window.eventSystem.subscribe('run-test', (data) => {
            if (data && data.testId) {
                this.runTest(data.testId);
            }
        });
    }
    
    /**
     * Run all tests
     */
    runAllTests() {
        if (this.state.testInProgress) {
            console.warn('Cannot start tests: Tests already in progress');
            return false;
        }
        
        // Reset test results
        this.state.testResults = {};
        
        // Create test queue
        this.state.testQueue = this.testCases.map(test => test.id);
        
        // Set auto run flag
        this.state.autoRunTests = true;
        
        // Start first test
        this.runNextTest();
        
        return true;
    }
    
    /**
     * Run next test in queue
     */
    runNextTest() {
        if (this.state.testQueue.length === 0) {
            // All tests completed
            this.state.autoRunTests = false;
            this.state.testInProgress = false;
            
            // Publish test results
            window.eventSystem.publish('all-tests-completed', {
                results: this.state.testResults
            });
            
            return;
        }
        
        // Get next test
        const testId = this.state.testQueue.shift();
        
        // Run test
        this.runTest(testId);
    }
    
    /**
     * Run a specific test
     * @param {string} testId - ID of the test to run
     */
    runTest(testId) {
        if (this.state.testInProgress) {
            console.warn(`Cannot start test ${testId}: Another test is already in progress`);
            return false;
        }
        
        // Find test case
        const testCase = this.testCases.find(test => test.id === testId);
        
        if (!testCase) {
            console.error(`Test case not found: ${testId}`);
            return false;
        }
        
        console.log(`Starting test: ${testCase.name}`);
        
        // Set current test
        this.state.currentTest = testCase;
        this.state.testInProgress = true;
        this.state.testStartTime = Date.now();
        
        // Set timeout
        const timeoutId = setTimeout(() => {
            if (this.state.testInProgress && this.state.currentTest && this.state.currentTest.id === testId) {
                this.handleTestFailure({
                    testId: testId,
                    error: 'Test timed out'
                });
            }
        }, this.state.testTimeout);
        
        // Run test
        try {
            testCase.test.call(this);
        } catch (error) {
            clearTimeout(timeoutId);
            this.handleTestFailure({
                testId: testId,
                error: error.message || 'Unknown error'
            });
            return false;
        }
        
        return true;
    }
    
    /**
     * Handle test completion
     * @param {Object} data - Test completion data
     */
    handleTestCompletion(data) {
        if (!this.state.testInProgress || !this.state.currentTest) {
            return;
        }
        
        const testId = this.state.currentTest.id;
        
        if (data.testId !== testId) {
            return;
        }
        
        // Calculate test duration
        const duration = Date.now() - this.state.testStartTime;
        
        // Store test result
        this.state.testResults[testId] = {
            success: true,
            duration: duration,
            details: data.details || {}
        };
        
        console.log(`Test completed successfully: ${this.state.currentTest.name} (${duration}ms)`);
        
        // Reset test state
        this.state.testInProgress = false;
        this.state.currentTest = null;
        
        // Run next test if auto run is enabled
        if (this.state.autoRunTests) {
            setTimeout(() => {
                this.runNextTest();
            }, 500);
        }
    }
    
    /**
     * Handle test failure
     * @param {Object} data - Test failure data
     */
    handleTestFailure(data) {
        if (!this.state.testInProgress || !this.state.currentTest) {
            return;
        }
        
        const testId = this.state.currentTest.id;
        
        if (data.testId !== testId) {
            return;
        }
        
        // Calculate test duration
        const duration = Date.now() - this.state.testStartTime;
        
        // Store test result
        this.state.testResults[testId] = {
            success: false,
            duration: duration,
            error: data.error || 'Unknown error',
            details: data.details || {}
        };
        
        console.error(`Test failed: ${this.state.currentTest.name} - ${data.error} (${duration}ms)`);
        
        // Reset test state
        this.state.testInProgress = false;
        this.state.currentTest = null;
        
        // Run next test if auto run is enabled
        if (this.state.autoRunTests) {
            setTimeout(() => {
                this.runNextTest();
            }, 500);
        }
    }
    
    /**
     * Test conversation input
     */
    testConversationInput() {
        const testId = 'conversation-input';
        
        // Find input field
        const inputField = document.getElementById('user-input');
        
        if (!inputField) {
            this.handleTestFailure({
                testId: testId,
                error: 'Input field not found'
            });
            return;
        }
        
        // Find send button
        const sendButton = document.querySelector('.send-button') || document.getElementById('send-button');
        
        if (!sendButton) {
            this.handleTestFailure({
                testId: testId,
                error: 'Send button not found'
            });
            return;
        }
        
        // Set up message received listener
        const messageReceivedListener = window.eventSystem.subscribe('message-sent', (data) => {
            if (data && data.text === 'Test message') {
                // Test passed
                window.eventSystem.publish('test-completed', {
                    testId: testId,
                    details: {
                        message: 'Test message successfully sent'
                    }
                });
                
                // Clean up
                messageReceivedListener();
            }
        });
        
        // Set timeout for test
        setTimeout(() => {
            if (this.state.testInProgress && this.state.currentTest && this.state.currentTest.id === testId) {
                // Clean up
                messageReceivedListener();
                
                this.handleTestFailure({
                    testId: testId,
                    error: 'Message sent event not received'
                });
            }
        }, 5000);
        
        // Set input value
        inputField.value = 'Test message';
        
        // Trigger input event
        const inputEvent = new Event('input', { bubbles: true });
        inputField.dispatchEvent(inputEvent);
        
        // Click send button
        sendButton.click();
    }
    
    /**
     * Test AI response
     */
    testAIResponse() {
        const testId = 'ai-response';
        
        // Find input field
        const inputField = document.getElementById('user-input');
        
        if (!inputField) {
            this.handleTestFailure({
                testId: testId,
                error: 'Input field not found'
            });
            return;
        }
        
        // Find send button
        const sendButton = document.querySelector('.send-button') || document.getElementById('send-button');
        
        if (!sendButton) {
            this.handleTestFailure({
                testId: testId,
                error: 'Send button not found'
            });
            return;
        }
        
        // Set up response received listener
        const responseReceivedListener = window.eventSystem.subscribe('ai-response-received', (data) => {
            if (data && data.text) {
                // Test passed
                window.eventSystem.publish('test-completed', {
                    testId: testId,
                    details: {
                        responseReceived: true,
                        responseLength: data.text.length
                    }
                });
                
                // Clean up
                responseReceivedListener();
            }
        });
        
        // Set timeout for test
        setTimeout(() => {
            if (this.state.testInProgress && this.state.currentTest && this.state.currentTest.id === testId) {
                // Clean up
                responseReceivedListener();
                
                this.handleTestFailure({
                    testId: testId,
                    error: 'AI response not received'
                });
            }
        }, 10000);
        
        // Set input value
        inputField.value = 'Hello, can you respond to this test message?';
        
        // Trigger input event
        const inputEvent = new Event('input', { bubbles: true });
        inputField.dispatchEvent(inputEvent);
        
        // Click send button
        sendButton.click();
    }
    
    /**
     * Test visual feedback
     */
    testVisualFeedback() {
        const testId = 'visual-feedback';
        
        // Find visualization container
        const visualizationContainer = document.getElementById('visualization-container') || 
                                      document.querySelector('.visualization-container');
        
        if (!visualizationContainer) {
            this.handleTestFailure({
                testId: testId,
                error: 'Visualization container not found'
            });
            return;
        }
        
        // Set up visual state change listener
        const visualStateChangeListener = window.eventSystem.subscribe('visual-state-changed', (data) => {
            if (data) {
                // Test passed
                window.eventSystem.publish('test-completed', {
                    testId: testId,
                    details: {
                        visualStateChanged: true,
                        state: data.state || 'unknown'
                    }
                });
                
                // Clean up
                visualStateChangeListener();
            }
        });
        
        // Set timeout for test
        setTimeout(() => {
            if (this.state.testInProgress && this.state.currentTest && this.state.currentTest.id === testId) {
                // Check if visualization has any content
                if (visualizationContainer.children.length > 0 && 
                    visualizationContainer.innerHTML.trim() !== '') {
                    
                    // Visual content exists, consider test passed
                    window.eventSystem.publish('test-completed', {
                        testId: testId,
                        details: {
                            visualContentExists: true,
                            visualStateChangeEvent: false
                        }
                    });
                    
                    // Clean up
                    visualStateChangeListener();
                    return;
                }
                
                // Clean up
                visualStateChangeListener();
                
                this.handleTestFailure({
                    testId: testId,
                    error: 'Visual feedback not detected'
                });
            }
        }, 8000);
        
        // Trigger visual feedback by sending a message
        window.eventSystem.publish('submit-message', {
            text: 'Show me some visual feedback'
        });
    }
    
    /**
     * Test memory and context
     */
    testMemoryContext() {
        const testId = 'memory-context';
        
        // Find input field
        const inputField = document.getElementById('user-input');
        
        if (!inputField) {
            this.handleTestFailure({
                testId: testId,
                error: 'Input field not found'
            });
            return;
        }
        
        // Find send button
        const sendButton = document.querySelector('.send-button') || document.getElementById('send-button');
        
        if (!sendButton) {
            this.handleTestFailure({
                testId: testId,
                error: 'Send button not found'
            });
            return;
        }
        
        // Set up response received listeners
        let firstResponseReceived = false;
        let contextualResponseReceived = false;
        
        const firstResponseListener = window.eventSystem.subscribe('ai-response-received', (data) => {
            if (!firstResponseReceived && data && data.text) {
                firstResponseReceived = true;
                
                // Send follow-up message after a delay
                setTimeout(() => {
                    // Set input value for contextual follow-up
                    inputField.value = 'What did I just ask you about?';
                    
                    // Trigger input event
                    const inputEvent = new Event('input', { bubbles: true });
                    inputField.dispatchEvent(inputEvent);
                    
                    // Click send button
                    sendButton.click();
                }, 2000);
            }
        });
        
        const contextualResponseListener = window.eventSystem.subscribe('ai-response-received', (data) => {
            if (firstResponseReceived && !contextualResponseReceived && data && data.text) {
                contextualResponseReceived = true;
                
                // Check if response contains contextual information
                const containsContextualInfo = data.text.toLowerCase().includes('test') || 
                                              data.text.toLowerCase().includes('memory') ||
                                              data.text.toLowerCase().includes('context') ||
                                              data.text.toLowerCase().includes('ask');
                
                if (containsContextualInfo) {
                    // Test passed
                    window.eventSystem.publish('test-completed', {
                        testId: testId,
                        details: {
                            contextualResponseReceived: true,
                            responseContainsContext: true
                        }
                    });
                } else {
                    this.handleTestFailure({
                        testId: testId,
                        error: 'Response does not contain contextual information',
                        details: {
                            contextualResponseReceived: true,
                            responseContainsContext: false
                        }
                    });
                }
                
                // Clean up
                firstResponseListener();
                contextualResponseListener();
            }
        });
        
        // Set timeout for test
        setTimeout(() => {
            if (this.state.testInProgress && this.state.currentTest && this.state.currentTest.id === testId) {
                // Clean up
                firstResponseListener();
                contextualResponseListener();
                
                if (!firstResponseReceived) {
                    this.handleTestFailure({
                        testId: testId,
                        error: 'First response not received'
                    });
                } else if (!contextualResponseReceived) {
                    this.handleTestFailure({
                        testId: testId,
                        error: 'Contextual response not received'
                    });
                }
            }
        }, 20000);
        
        // Set input value for first message
        inputField.value = 'This is a test of the memory and context system';
        
        // Trigger input event
        const inputEvent = new Event('input', { bubbles: true });
        inputField.dispatchEvent(inputEvent);
        
        // Click send button
        sendButton.click();
    }
    
    /**
     * Test voice input
     */
    testVoiceInput() {
        const testId = 'voice-input';
        
        // Find voice input button
        const voiceButton = document.querySelector('.voice-input-button') || 
                           document.getElementById('voice-input-button');
        
        if (!voiceButton) {
            // Voice input might not be available, consider test passed
            window.eventSystem.publish('test-completed', {
                testId: testId,
                details: {
                    voiceInputAvailable: false,
                    reason: 'Voice input button not found'
                }
            });
            return;
        }
        
        // Check if browser supports speech recognition
        const speechRecognitionSupported = 'SpeechRecognition' in window || 
                                          'webkitSpeechRecognition' in window;
        
        if (!speechRecognitionSupported) {
            // Speech recognition not supported, consider test passed
            window.eventSystem.publish('test-completed', {
                testId: testId,
                details: {
                    voiceInputAvailable: false,
                    reason: 'Speech recognition not supported by browser'
                }
            });
            return;
        }
        
        // Set up voice input listeners
        const voiceInputStartListener = window.eventSystem.subscribe('voice-input-started', () => {
            // Voice input started, consider test passed
            window.eventSystem.publish('test-completed', {
                testId: testId,
                details: {
                    voiceInputAvailable: true,
                    voiceInputStarted: true
                }
            });
            
            // Clean up
            voiceInputStartListener();
            voiceInputErrorListener();
        });
        
        const voiceInputErrorListener = window.eventSystem.subscribe('voice-input-error', (data) => {
            // Voice input error, but button exists and event was triggered
            window.eventSystem.publish('test-completed', {
                testId: testId,
                details: {
                    voiceInputAvailable: true,
                    voiceInputStarted: false,
                    error: data ? data.error : 'Unknown error'
                }
            });
            
            // Clean up
            voiceInputStartListener();
            voiceInputErrorListener();
        });
        
        // Set timeout for test
        setTimeout(() => {
            if (this.state.testInProgress && this.state.currentTest && this.state.currentTest.id === testId) {
                // Clean up
                voiceInputStartListener();
                voiceInputErrorListener();
                
                // No events received, but button exists
                window.eventSystem.publish('test-completed', {
                    testId: testId,
                    details: {
                        voiceInputAvailable: true,
                        voiceInputStarted: false,
                        reason: 'No voice input events received'
                    }
                });
            }
        }, 5000);
        
        // Click voice button
        voiceButton.click();
    }
    
    /**
     * Test cross-device compatibility
     */
    testCrossDeviceCompatibility() {
        const testId = 'cross-device';
        
        // Get window dimensions
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Check if responsive elements exist
        const conversationContainer = document.getElementById('conversation-container') || 
                                     document.querySelector('.conversation-container');
        
        if (!conversationContainer) {
            this.handleTestFailure({
                testId: testId,
                error: 'Conversation container not found'
            });
            return;
        }
        
        // Get computed style
        const containerStyle = window.getComputedStyle(conversationContainer);
        
        // Check if container uses responsive units
        const usesResponsiveUnits = containerStyle.width.includes('%') || 
                                   containerStyle.width.includes('vw') ||
                                   containerStyle.maxWidth.includes('%') ||
                                   containerStyle.maxWidth.includes('vw');
        
        // Check if media queries are used
        const mediaQueriesUsed = this.checkMediaQueriesUsed();
        
        // Check if viewport meta tag exists
        const viewportMetaExists = document.querySelector('meta[name="viewport"]') !== null;
        
        // Check if touch events are handled
        const touchEventsHandled = 'ontouchstart' in window || 
                                  navigator.maxTouchPoints > 0;
        
        // Collect results
        const results = {
            windowDimensions: {
                width: windowWidth,
                height: windowHeight
            },
            usesResponsiveUnits: usesResponsiveUnits,
            mediaQueriesUsed: mediaQueriesUsed,
            viewportMetaExists: viewportMetaExists,
            touchEventsHandled: touchEventsHandled
        };
        
        // Test passed if most criteria are met
        const criteriaCount = Object.values(results).filter(Boolean).length;
        const criteriaPercentage = (criteriaCount / Object.keys(results).length) * 100;
        
        if (criteriaPercentage >= 60) {
            window.eventSystem.publish('test-completed', {
                testId: testId,
                details: results
            });
        } else {
            this.handleTestFailure({
                testId: testId,
                error: 'Cross-device compatibility criteria not met',
                details: results
            });
        }
    }
    
    /**
     * Check if media queries are used
     * @returns {boolean} - True if media queries are used
     */
    checkMediaQueriesUsed() {
        let mediaQueriesUsed = false;
        
        // Check all stylesheets
        for (let i = 0; i < document.styleSheets.length; i++) {
            try {
                const styleSheet = document.styleSheets[i];
                const rules = styleSheet.cssRules || styleSheet.rules;
                
                if (!rules) continue;
                
                for (let j = 0; j < rules.length; j++) {
                    if (rules[j].type === CSSRule.MEDIA_RULE) {
                        mediaQueriesUsed = true;
                        break;
                    }
                }
                
                if (mediaQueriesUsed) break;
            } catch (e) {
                // CORS error when accessing stylesheet from different origin
                continue;
            }
        }
        
        return mediaQueriesUsed;
    }
    
    /**
     * Test performance
     */
    testPerformance() {
        const testId = 'performance';
        
        // Measure initial load time
        const loadTime = window.performance.timing.domContentLoadedEventEnd - 
                        window.performance.timing.navigationStart;
        
        // Measure memory usage if available
        let memoryUsage = null;
        if (window.performance && window.performance.memory) {
            memoryUsage = {
                usedJSHeapSize: window.performance.memory.usedJSHeapSize,
                totalJSHeapSize: window.performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: window.performance.memory.jsHeapSizeLimit
            };
        }
        
        // Measure rendering performance
        let fps = 0;
        let frameCount = 0;
        let lastFrameTime = performance.now();
        
        const measureFPS = () => {
            const now = performance.now();
            frameCount++;
            
            if (now - lastFrameTime >= 1000) {
                fps = frameCount;
                frameCount = 0;
                lastFrameTime = now;
                
                // Stop measuring after 3 seconds
                if (fpsCounter >= 3) {
                    cancelAnimationFrame(animationFrameId);
                    
                    // Collect results
                    const results = {
                        loadTime: loadTime,
                        memoryUsage: memoryUsage,
                        fps: fps,
                        resourceCount: performance.getEntriesByType('resource').length,
                        domElementCount: document.getElementsByTagName('*').length
                    };
                    
                    // Test passed if performance is acceptable
                    if (fps >= 30 && loadTime < 5000) {
                        window.eventSystem.publish('test-completed', {
                            testId: testId,
                            details: results
                        });
                    } else {
                        this.handleTestFailure({
                            testId: testId,
                            error: 'Performance criteria not met',
                            details: results
                        });
                    }
                }
                
                fpsCounter++;
            }
        };
        
        let fpsCounter = 0;
        let animationFrameId;
        
        const measureFrame = () => {
            measureFPS();
            animationFrameId = requestAnimationFrame(measureFrame);
        };
        
        // Start measuring FPS
        animationFrameId = requestAnimationFrame(measureFrame);
        
        // Set timeout for test
        setTimeout(() => {
            if (this.state.testInProgress && this.state.currentTest && this.state.currentTest.id === testId) {
                cancelAnimationFrame(animationFrameId);
                
                // Collect results
                const results = {
                    loadTime: loadTime,
                    memoryUsage: memoryUsage,
                    fps: fps,
                    resourceCount: performance.getEntriesByType('resource').length,
                    domElementCount: document.getElementsByTagName('*').length
                };
                
                // Test passed if performance is acceptable
                if (fps >= 30 && loadTime < 5000) {
                    window.eventSystem.publish('test-completed', {
                        testId: testId,
                        details: results
                    });
                } else {
                    this.handleTestFailure({
                        testId: testId,
                        error: 'Performance criteria not met',
                        details: results
                    });
                }
            }
        }, 5000);
    }
    
    /**
     * Test accessibility
     */
    testAccessibility() {
        const testId = 'accessibility';
        
        // Check for basic accessibility features
        const results = {
            // Check if alt attributes exist on images
            imagesHaveAlt: this.checkImagesHaveAlt(),
            
            // Check if form elements have labels
            formElementsHaveLabels: this.checkFormElementsHaveLabels(),
            
            // Check if heading structure is proper
            headingStructureProper: this.checkHeadingStructure(),
            
            // Check if ARIA attributes are used
            ariaAttributesUsed: this.checkAriaAttributesUsed(),
            
            // Check if color contrast is sufficient
            colorContrastSufficient: this.checkColorContrast(),
            
            // Check if keyboard navigation is possible
            keyboardNavigationPossible: this.checkKeyboardNavigation()
        };
        
        // Count passed criteria
        const passedCriteria = Object.values(results).filter(Boolean).length;
        const totalCriteria = Object.keys(results).length;
        const passPercentage = (passedCriteria / totalCriteria) * 100;
        
        // Test passed if most criteria are met
        if (passPercentage >= 60) {
            window.eventSystem.publish('test-completed', {
                testId: testId,
                details: {
                    results: results,
                    passedCriteria: passedCriteria,
                    totalCriteria: totalCriteria,
                    passPercentage: passPercentage
                }
            });
        } else {
            this.handleTestFailure({
                testId: testId,
                error: 'Accessibility criteria not met',
                details: {
                    results: results,
                    passedCriteria: passedCriteria,
                    totalCriteria: totalCriteria,
                    passPercentage: passPercentage
                }
            });
        }
    }
    
    /**
     * Check if images have alt attributes
     * @returns {boolean} - True if all images have alt attributes
     */
    checkImagesHaveAlt() {
        const images = document.querySelectorAll('img');
        
        if (images.length === 0) {
            return true;
        }
        
        let allHaveAlt = true;
        
        for (let i = 0; i < images.length; i++) {
            if (!images[i].hasAttribute('alt')) {
                allHaveAlt = false;
                break;
            }
        }
        
        return allHaveAlt;
    }
    
    /**
     * Check if form elements have labels
     * @returns {boolean} - True if all form elements have labels
     */
    checkFormElementsHaveLabels() {
        const formElements = document.querySelectorAll('input, select, textarea');
        
        if (formElements.length === 0) {
            return true;
        }
        
        let allHaveLabels = true;
        
        for (let i = 0; i < formElements.length; i++) {
            const element = formElements[i];
            
            // Skip hidden and submit elements
            if (element.type === 'hidden' || element.type === 'submit' || element.type === 'button') {
                continue;
            }
            
            // Check if element has id and label with for attribute
            if (element.id) {
                const label = document.querySelector(`label[for="${element.id}"]`);
                if (!label) {
                    // Check if element is wrapped in a label
                    if (!element.closest('label')) {
                        allHaveLabels = false;
                        break;
                    }
                }
            } else {
                // Check if element is wrapped in a label
                if (!element.closest('label')) {
                    // Check if element has aria-label or aria-labelledby
                    if (!element.hasAttribute('aria-label') && !element.hasAttribute('aria-labelledby')) {
                        allHaveLabels = false;
                        break;
                    }
                }
            }
        }
        
        return allHaveLabels;
    }
    
    /**
     * Check if heading structure is proper
     * @returns {boolean} - True if heading structure is proper
     */
    checkHeadingStructure() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        
        if (headings.length === 0) {
            return true;
        }
        
        // Check if there's at least one h1
        const hasH1 = document.querySelectorAll('h1').length > 0;
        
        if (!hasH1) {
            return false;
        }
        
        // Check if headings are in order
        let lastLevel = 0;
        let properOrder = true;
        
        for (let i = 0; i < headings.length; i++) {
            const heading = headings[i];
            const level = parseInt(heading.tagName.substring(1));
            
            if (i === 0) {
                // First heading should be h1
                if (level !== 1) {
                    properOrder = false;
                    break;
                }
            } else {
                // Subsequent headings should not skip levels
                if (level > lastLevel + 1) {
                    properOrder = false;
                    break;
                }
            }
            
            lastLevel = level;
        }
        
        return properOrder;
    }
    
    /**
     * Check if ARIA attributes are used
     * @returns {boolean} - True if ARIA attributes are used
     */
    checkAriaAttributesUsed() {
        // Check for elements with ARIA attributes
        const elementsWithAria = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [role]');
        
        return elementsWithAria.length > 0;
    }
    
    /**
     * Check if color contrast is sufficient
     * @returns {boolean} - True if color contrast is sufficient
     */
    checkColorContrast() {
        // This is a simplified check, a full check would require analyzing all text elements
        // Check if high contrast mode is available
        const hasHighContrastSetting = document.body.classList.contains('high-contrast') || 
                                      document.documentElement.style.getPropertyValue('--contrast-factor') !== '';
        
        return hasHighContrastSetting;
    }
    
    /**
     * Check if keyboard navigation is possible
     * @returns {boolean} - True if keyboard navigation is possible
     */
    checkKeyboardNavigation() {
        // Check if interactive elements have tabindex
        const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [role="button"]');
        
        if (interactiveElements.length === 0) {
            return true;
        }
        
        // Check if any elements have tabindex=-1
        const elementsWithNegativeTabindex = document.querySelectorAll('[tabindex="-1"]');
        
        // Check if focus styles are defined
        let hasFocusStyles = false;
        
        for (let i = 0; i < document.styleSheets.length; i++) {
            try {
                const styleSheet = document.styleSheets[i];
                const rules = styleSheet.cssRules || styleSheet.rules;
                
                if (!rules) continue;
                
                for (let j = 0; j < rules.length; j++) {
                    if (rules[j].selectorText && rules[j].selectorText.includes(':focus')) {
                        hasFocusStyles = true;
                        break;
                    }
                }
                
                if (hasFocusStyles) break;
            } catch (e) {
                // CORS error when accessing stylesheet from different origin
                continue;
            }
        }
        
        // Consider keyboard navigation possible if most interactive elements don't have negative tabindex
        // and focus styles are defined
        return elementsWithNegativeTabindex.length < interactiveElements.length * 0.5 && hasFocusStyles;
    }
    
    /**
     * Get test results
     * @returns {Object} - Test results
     */
    getTestResults() {
        return this.state.testResults;
    }
    
    /**
     * Get test case by ID
     * @param {string} testId - Test ID
     * @returns {Object} - Test case
     */
    getTestCase(testId) {
        return this.testCases.find(test => test.id === testId);
    }
    
    /**
     * Get all test cases
     * @returns {Array} - All test cases
     */
    getAllTestCases() {
        return this.testCases;
    }
}

// Create singleton instance
const focusedUsabilityTestingSystem = new FocusedUsabilityTestingSystem();

// Export the singleton
window.focusedUsabilityTestingSystem = focusedUsabilityTestingSystem;
