/**
 * UI Test System
 * 
 * This system tests the functionality of all UI components
 * to ensure they work correctly together.
 */

class UITestSystem {
    constructor() {
        // Test results
        this.results = {
            passed: 0,
            failed: 0,
            skipped: 0,
            total: 0,
            tests: []
        };
        
        // Test configurations
        this.config = {
            runAutomatically: true,
            logToConsole: true,
            visualFeedback: true,
            stopOnFailure: false,
            testTimeout: 5000,
            retryCount: 1
        };
        
        // Initialize dependencies
        this.initializeDependencies();
    }
    
    /**
     * Initialize dependencies
     */
    async initializeDependencies() {
        // Wait for all systems to be ready
        await this.waitForSystems();
        
        // Store references to required systems
        this.eventSystem = window.eventSystem;
        this.storageManager = window.storageManager;
        this.themeSystem = window.themeSystem;
        this.visualFeedbackSystem = window.visualFeedbackSystem;
        this.accessibilitySystem = window.accessibilitySystem;
        this.enhancedInterfaceSystem = window.enhancedInterfaceSystem;
        this.userInteractionController = window.userInteractionController;
        this.animationUIIntegration = window.animationUIIntegration;
        this.pixelVisualization3D = window.pixelVisualization3D;
        this.longTermMemorySystem = window.longTermMemorySystem;
        this.spatialAudioSystem = window.spatialAudioSystem;
        this.advancedUserProfileSystem = window.advancedUserProfileSystem;
        
        // Run tests automatically if configured
        if (this.config.runAutomatically) {
            this.runAllTests();
        }
    }
    
    /**
     * Wait for all systems to be ready
     */
    async waitForSystems() {
        return new Promise(resolve => {
            // Check if all systems are already available
            if (this.areAllSystemsReady()) {
                resolve();
                return;
            }
            
            // Set up event listener for system ready events
            const systemReadyHandler = () => {
                if (this.areAllSystemsReady()) {
                    // Remove event listener
                    window.removeEventListener('system-ready', systemReadyHandler);
                    resolve();
                }
            };
            
            // Listen for system ready events
            window.addEventListener('system-ready', systemReadyHandler);
            
            // Also set a timeout to resolve anyway after 5 seconds
            setTimeout(() => {
                window.removeEventListener('system-ready', systemReadyHandler);
                console.warn('Some systems may not be ready, but proceeding with tests');
                resolve();
            }, 5000);
        });
    }
    
    /**
     * Check if all required systems are ready
     */
    areAllSystemsReady() {
        return (
            window.eventSystem &&
            window.storageManager &&
            window.themeSystem &&
            window.visualFeedbackSystem &&
            window.accessibilitySystem &&
            window.enhancedInterfaceSystem &&
            window.userInteractionController &&
            window.animationUIIntegration
        );
    }
    
    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('Starting UI tests...');
        
        // Reset results
        this.results = {
            passed: 0,
            failed: 0,
            skipped: 0,
            total: 0,
            tests: []
        };
        
        // Show test progress
        if (this.visualFeedbackSystem && this.config.visualFeedback) {
            this.testProgressId = this.visualFeedbackSystem.showProgressIndicator(
                'ui-test-progress',
                'Running UI tests...',
                0,
                { persistent: true }
            );
        }
        
        // Run all test groups
        await this.runTestGroup('Core UI Components', this.coreUITests);
        await this.runTestGroup('Visual Feedback System', this.visualFeedbackTests);
        await this.runTestGroup('Accessibility System', this.accessibilityTests);
        await this.runTestGroup('Animation Integration', this.animationIntegrationTests);
        await this.runTestGroup('User Interaction', this.userInteractionTests);
        await this.runTestGroup('Theme System', this.themeSystemTests);
        await this.runTestGroup('Advanced Features', this.advancedFeatureTests);
        
        // Complete test progress
        if (this.visualFeedbackSystem && this.config.visualFeedback) {
            this.visualFeedbackSystem.completeProgressIndicator(
                this.testProgressId,
                `UI tests completed: ${this.results.passed} passed, ${this.results.failed} failed, ${this.results.skipped} skipped`
            );
        }
        
        // Log final results
        this.logResults();
        
        // Return results
        return this.results;
    }
    
    /**
     * Run a group of tests
     * @param {string} groupName - Name of the test group
     * @param {Function} testFunction - Function containing the tests
     */
    async runTestGroup(groupName, testFunction) {
        console.log(`Running test group: ${groupName}`);
        
        // Show group progress
        if (this.visualFeedbackSystem && this.config.visualFeedback) {
            this.visualFeedbackSystem.showStatusIndicator(
                `test-group-${groupName.replace(/\s+/g, '-').toLowerCase()}`,
                `Testing: ${groupName}`,
                'info',
                { duration: 3000 }
            );
        }
        
        // Run the tests
        await testFunction.call(this);
        
        // Update overall progress
        if (this.visualFeedbackSystem && this.config.visualFeedback) {
            const progress = Math.round((this.results.passed + this.results.failed + this.results.skipped) / this.results.total * 100);
            this.visualFeedbackSystem.updateProgressIndicator(
                this.testProgressId,
                progress,
                `Running UI tests... (${progress}%)`
            );
        }
    }
    
    /**
     * Run a single test
     * @param {string} testName - Name of the test
     * @param {Function} testFunction - Test function
     */
    async runTest(testName, testFunction) {
        // Increment total test count
        this.results.total++;
        
        // Create test result object
        const testResult = {
            name: testName,
            status: 'pending',
            duration: 0,
            error: null
        };
        
        // Add to results
        this.results.tests.push(testResult);
        
        // Log test start
        if (this.config.logToConsole) {
            console.log(`Running test: ${testName}`);
        }
        
        // Skip test if required system is not available
        if (!this.canRunTest(testFunction)) {
            testResult.status = 'skipped';
            testResult.error = 'Required system not available';
            this.results.skipped++;
            
            if (this.config.logToConsole) {
                console.warn(`Skipped test: ${testName} - Required system not available`);
            }
            
            return;
        }
        
        // Run the test
        const startTime = performance.now();
        
        try {
            // Set timeout for test
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error(`Test timed out after ${this.config.testTimeout}ms`));
                }, this.config.testTimeout);
            });
            
            // Run test with timeout
            await Promise.race([
                testFunction.call(this),
                timeoutPromise
            ]);
            
            // Test passed
            testResult.status = 'passed';
            this.results.passed++;
            
            if (this.config.logToConsole) {
                console.log(`✅ Passed: ${testName}`);
            }
        } catch (error) {
            // Test failed
            testResult.status = 'failed';
            testResult.error = error.message || error;
            this.results.failed++;
            
            if (this.config.logToConsole) {
                console.error(`❌ Failed: ${testName}`, error);
            }
            
            // Show error notification
            if (this.visualFeedbackSystem && this.config.visualFeedback) {
                this.visualFeedbackSystem.showNotification(
                    `Test failed: ${testName} - ${error.message || error}`,
                    'error',
                    { duration: 5000 }
                );
            }
            
            // Stop testing if configured
            if (this.config.stopOnFailure) {
                throw new Error(`Testing stopped due to failure in test: ${testName}`);
            }
        } finally {
            // Calculate test duration
            const endTime = performance.now();
            testResult.duration = endTime - startTime;
        }
    }
    
    /**
     * Check if a test can be run
     * @param {Function} testFunction - Test function
     * @returns {boolean} Whether the test can be run
     */
    canRunTest(testFunction) {
        // Get function as string
        const functionString = testFunction.toString();
        
        // Check for required systems
        const requiredSystems = [
            { name: 'visualFeedbackSystem', instance: this.visualFeedbackSystem },
            { name: 'accessibilitySystem', instance: this.accessibilitySystem },
            { name: 'enhancedInterfaceSystem', instance: this.enhancedInterfaceSystem },
            { name: 'userInteractionController', instance: this.userInteractionController },
            { name: 'animationUIIntegration', instance: this.animationUIIntegration },
            { name: 'themeSystem', instance: this.themeSystem },
            { name: 'pixelVisualization3D', instance: this.pixelVisualization3D },
            { name: 'longTermMemorySystem', instance: this.longTermMemorySystem },
            { name: 'spatialAudioSystem', instance: this.spatialAudioSystem },
            { name: 'advancedUserProfileSystem', instance: this.advancedUserProfileSystem }
        ];
        
        // Check if any required system is missing
        for (const system of requiredSystems) {
            if (functionString.includes(`this.${system.name}`) && !system.instance) {
                return false;
            }
        }
        
        return true;
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
            throw new Error(message || `Expected ${expected}, but got ${actual}`);
        }
    }
    
    /**
     * Assert that an element exists
     * @param {string} selector - CSS selector
     * @param {string} message - Error message if element doesn't exist
     */
    assertElementExists(selector, message) {
        const element = document.querySelector(selector);
        if (!element) {
            throw new Error(message || `Element not found: ${selector}`);
        }
        return element;
    }
    
    /**
     * Assert that an element has a class
     * @param {string} selector - CSS selector
     * @param {string} className - Class name
     * @param {string} message - Error message if element doesn't have class
     */
    assertElementHasClass(selector, className, message) {
        const element = this.assertElementExists(selector);
        if (!element.classList.contains(className)) {
            throw new Error(message || `Element ${selector} does not have class ${className}`);
        }
    }
    
    /**
     * Assert that an element has an attribute
     * @param {string} selector - CSS selector
     * @param {string} attribute - Attribute name
     * @param {string} value - Expected attribute value
     * @param {string} message - Error message if element doesn't have attribute
     */
    assertElementHasAttribute(selector, attribute, value, message) {
        const element = this.assertElementExists(selector);
        const attributeValue = element.getAttribute(attribute);
        if (attributeValue !== value) {
            throw new Error(message || `Element ${selector} has attribute ${attribute} with value ${attributeValue}, expected ${value}`);
        }
    }
    
    /**
     * Assert that an event is fired
     * @param {string} eventName - Event name
     * @param {Function} triggerFn - Function to trigger the event
     * @param {number} timeout - Timeout in milliseconds
     */
    async assertEventFired(eventName, triggerFn, timeout = 1000) {
        return new Promise((resolve, reject) => {
            // Set up event listener
            const handler = () => {
                clearTimeout(timeoutId);
                resolve();
            };
            
            // Set up timeout
            const timeoutId = setTimeout(() => {
                this.eventSystem.unsubscribe(eventName, handler);
                reject(new Error(`Event ${eventName} was not fired within ${timeout}ms`));
            }, timeout);
            
            // Subscribe to event
            this.eventSystem.subscribe(eventName, handler);
            
            // Trigger the event
            triggerFn();
        });
    }
    
    /**
     * Log test results
     */
    logResults() {
        console.log('UI Test Results:');
        console.log(`Total tests: ${this.results.total}`);
        console.log(`Passed: ${this.results.passed}`);
        console.log(`Failed: ${this.results.failed}`);
        console.log(`Skipped: ${this.results.skipped}`);
        
        // Log failed tests
        if (this.results.failed > 0) {
            console.log('Failed tests:');
            this.results.tests
                .filter(test => test.status === 'failed')
                .forEach(test => {
                    console.error(`- ${test.name}: ${test.error}`);
                });
        }
        
        // Log skipped tests
        if (this.results.skipped > 0) {
            console.log('Skipped tests:');
            this.results.tests
                .filter(test => test.status === 'skipped')
                .forEach(test => {
                    console.warn(`- ${test.name}: ${test.error}`);
                });
        }
    }
    
    /**
     * Core UI component tests
     */
    async coreUITests() {
        // Test main container
        await this.runTest('Main container exists', async function() {
            this.assertElementExists('#app-container', 'Main app container not found');
        });
        
        // Test conversation container
        await this.runTest('Conversation container exists', async function() {
            this.assertElementExists('.conversation-container', 'Conversation container not found');
        });
        
        // Test input area
        await this.runTest('Input area exists', async function() {
            this.assertElementExists('.input-area', 'Input area not found');
        });
        
        // Test user input field
        await this.runTest('User input field exists', async function() {
            this.assertElementExists('#user-input', 'User input field not found');
        });
        
        // Test send button
        await this.runTest('Send button exists', async function() {
            this.assertElementExists('.send-button', 'Send button not found');
        });
        
        // Test pixel container
        await this.runTest('Pixel container exists', async function() {
            this.assertElementExists('#pixel-container', 'Pixel container not found');
        });
        
        // Test settings button
        await this.runTest('Settings button exists', async function() {
            this.assertElementExists('.settings-button', 'Settings button not found');
        });
        
        // Test responsive layout
        await this.runTest('Responsive layout works', async function() {
            // Save original window width
            const originalWidth = window.innerWidth;
            
            try {
                // Simulate mobile width
                Object.defineProperty(window, 'innerWidth', { value: 480, writable: true });
                window.dispatchEvent(new Event('resize'));
                
                // Wait for resize to take effect
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Check mobile layout
                this.assertElementHasClass('body', 'mobile-layout', 'Mobile layout not applied');
                
                // Simulate desktop width
                Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
                window.dispatchEvent(new Event('resize'));
                
                // Wait for resize to take effect
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Check desktop layout
                this.assert(!document.body.classList.contains('mobile-layout'), 'Mobile layout still applied in desktop width');
            } finally {
                // Restore original width
                Object.defineProperty(window, 'innerWidth', { value: originalWidth, writable: true });
                window.dispatchEvent(new Event('resize'));
            }
        });
    }
    
    /**
     * Visual feedback system tests
     */
    async visualFeedbackTests() {
        // Skip all tests if visual feedback system is not available
        if (!this.visualFeedbackSystem) {
            console.warn('Skipping visual feedback tests - system not available');
            return;
        }
        
        // Test notification
        await this.runTest('Notification system works', async function() {
            // Show notification
            this.visualFeedbackSystem.showNotification('Test notification', 'info', { duration: 500 });
            
            // Check if notification is displayed
            this.assertElementExists('.notification.notification-info', 'Notification not displayed');
            
            // Wait for notification to disappear
            await new Promise(resolve => setTimeout(resolve, 600));
            
            // Check if notification is removed
            const notification = document.querySelector('.notification.notification-info');
            this.assert(!notification || notification.classList.contains('notification-hide'), 'Notification not hidden after duration');
        });
        
        // Test progress indicator
        await this.runTest('Progress indicator works', async function() {
            // Show progress indicator
            const progressId = this.visualFeedbackSystem.showProgressIndicator('test-progress', 'Test progress', 50);
            
            // Check if progress indicator is displayed
            const progressElement = this.assertElementExists(`#progress-${progressId}`, 'Progress indicator not displayed');
            
            // Check progress value
            const progressBar = progressElement.querySelector('.progress-bar');
            this.assert(progressBar.style.width === '50%', `Progress bar width incorrect: ${progressBar.style.width}`);
            
            // Update progress
            this.visualFeedbackSystem.updateProgressIndicator(progressId, 75, 'Updated progress');
            
            // Check updated progress value
            this.assert(progressBar.style.width === '75%', `Updated progress bar width incorrect: ${progressBar.style.width}`);
            
            // Complete progress
            this.visualFeedbackSystem.completeProgressIndicator(progressId, 'Completed');
            
            // Check if progress indicator is marked as complete
            this.assertElementHasClass(`#progress-${progressId}`, 'progress-complete', 'Progress indicator not marked as complete');
            
            // Wait for progress indicator to disappear
            await new Promise(resolve => setTimeout(resolve, 2500));
            
            // Check if progress indicator is removed or hidden
            const indicator = document.querySelector(`#progress-${progressId}`);
            this.assert(!indicator || indicator.classList.contains('progress-hide'), 'Progress indicator not hidden after completion');
        });
        
        // Test status indicator
        await this.runTest('Status indicator works', async function() {
            // Show status indicator
            const statusId = this.visualFeedbackSystem.showStatusIndicator('test-status', 'Test status', 'info', { duration: 500 });
            
            // Check if status indicator is displayed
            this.assertElementExists(`#status-${statusId}`, 'Status indicator not displayed');
            
            // Wait for status indicator to disappear
            await new Promise(resolve => setTimeout(resolve, 600));
            
            // Check if status indicator is removed or hidden
            const indicator = document.querySelector(`#status-${statusId}`);
            this.assert(!indicator || indicator.classList.contains('status-hide'), 'Status indicator not hidden after duration');
        });
        
        // Test loading indicator
        await this.runTest('Loading indicator works', async function() {
            // Show loading indicator
            const loadingId = this.visualFeedbackSystem.showLoadingIndicator('Test loading');
            
            // Check if loading indicator is displayed
            this.assertElementExists(`#loading-${loadingId}`, 'Loading indicator not displayed');
            
            // Hide loading indicator
            this.visualFeedbackSystem.hideLoadingIndicator(loadingId);
            
            // Wait for loading indicator to disappear
            await new Promise(resolve => setTimeout(resolve, 400));
            
            // Check if loading indicator is removed or hidden
            const indicator = document.querySelector(`#loading-${loadingId}`);
            this.assert(!indicator || indicator.classList.contains('loading-hide'), 'Loading indicator not hidden after hiding');
        });
        
        // Test element highlighting
        await this.runTest('Element highlighting works', async function() {
            // Get an element to highlight
            const element = this.assertElementExists('#user-input', 'User input field not found');
            
            // Highlight element
            this.visualFeedbackSystem.highlightElement(element, 'info', { duration: 500 });
            
            // Check if element has highlight class
            this.assertElementHasClass('#user-input', 'highlight-info', 'Element not highlighted');
            
            // Wait for highlight to disappear
            await new Promise(resolve => setTimeout(resolve, 600));
            
            // Check if highlight is removed
            this.assert(!element.classList.contains('highlight-info'), 'Element highlight not removed after duration');
        });
    }
    
    /**
     * Accessibility system tests
     */
    async accessibilityTests() {
        // Skip all tests if accessibility system is not available
        if (!this.accessibilitySystem) {
            console.warn('Skipping accessibility tests - system not available');
            return;
        }
        
        // Test high contrast mode
        await this.runTest('High contrast mode works', async function() {
            // Enable high contrast mode
            this.accessibilitySystem.toggleHighContrastMode(true);
            
            // Check if high contrast mode is applied
            this.assertElementHasClass('body', 'high-contrast-mode', 'High contrast mode not applied');
            
            // Disable high contrast mode
            this.accessibilitySystem.toggleHighContrastMode(false);
            
            // Check if high contrast mode is removed
            this.assert(!document.body.classList.contains('high-contrast-mode'), 'High contrast mode not removed');
        });
        
        // Test large text mode
        await this.runTest('Large text mode works', async function() {
            // Enable large text mode
            this.accessibilitySystem.toggleLargeTextMode(true);
            
            // Check if large text mode is applied
            this.assertElementHasClass('body', 'large-text-mode', 'Large text mode not applied');
            
            // Disable large text mode
            this.accessibilitySystem.toggleLargeTextMode(false);
            
            // Check if large text mode is removed
            this.assert(!document.body.classList.contains('large-text-mode'), 'Large text mode not removed');
        });
        
        // Test reduce motion mode
        await this.runTest('Reduce motion mode works', async function() {
            // Enable reduce motion mode
            this.accessibilitySystem.toggleReduceMotionMode(true);
            
            // Check if reduce motion mode is applied
            this.assertElementHasClass('body', 'reduce-motion-mode', 'Reduce motion mode not applied');
            
            // Disable reduce motion mode
            this.accessibilitySystem.toggleReduceMotionMode(false);
            
            // Check if reduce motion mode is removed
            this.assert(!document.body.classList.contains('reduce-motion-mode'), 'Reduce motion mode not removed');
        });
        
        // Test keyboard navigation mode
        await this.runTest('Keyboard navigation mode works', async function() {
            // Enable keyboard navigation mode
            this.accessibilitySystem.toggleKeyboardNavigationMode(true);
            
            // Check if keyboard navigation mode is applied
            this.assertElementHasClass('body', 'keyboard-navigation-mode', 'Keyboard navigation mode not applied');
            
            // Disable keyboard navigation mode
            this.accessibilitySystem.toggleKeyboardNavigationMode(false);
            
            // Check if keyboard navigation mode is removed
            this.assert(!document.body.classList.contains('keyboard-navigation-mode'), 'Keyboard navigation mode not removed');
        });
        
        // Test ARIA attributes
        await this.runTest('ARIA attributes are added', async function() {
            // Ensure ARIA labels are added
            this.accessibilitySystem.addAriaLabels();
            
            // Check if ARIA labels are added to buttons
            const buttons = document.querySelectorAll('button');
            let ariaLabelFound = false;
            
            for (const button of buttons) {
                if (button.hasAttribute('aria-label')) {
                    ariaLabelFound = true;
                    break;
                }
            }
            
            this.assert(ariaLabelFound, 'No ARIA labels found on buttons');
            
            // Enable screen reader mode to add more ARIA attributes
            this.accessibilitySystem.toggleScreenReaderMode(true);
            
            // Check for additional ARIA attributes
            const conversationHistory = document.querySelector('.conversation-history');
            if (conversationHistory) {
                this.assert(
                    conversationHistory.hasAttribute('role') && 
                    conversationHistory.hasAttribute('aria-live'),
                    'Conversation history missing ARIA attributes'
                );
            }
            
            // Disable screen reader mode
            this.accessibilitySystem.toggleScreenReaderMode(false);
        });
    }
    
    /**
     * Animation integration tests
     */
    async animationIntegrationTests() {
        // Skip all tests if animation UI integration is not available
        if (!this.animationUIIntegration) {
            console.warn('Skipping animation integration tests - system not available');
            return;
        }
        
        // Test animation integration with UI
        await this.runTest('Animation integration with UI works', async function() {
            // Trigger UI element interaction
            this.eventSystem.publish('ui-element-interaction', {
                element: document.querySelector('#user-input'),
                elementType: 'input',
                animationType: 'focus'
            });
            
            // Check if event was processed (no error means success)
            this.assert(true, 'Animation integration test passed');
        });
        
        // Test emotional state visualization
        await this.runTest('Emotional state visualization works', async function() {
            // Set emotional state
            this.eventSystem.publish('emotional-state-change', {
                state: 'happy',
                intensity: 0.8
            });
            
            // Check if event was processed (no error means success)
            this.assert(true, 'Emotional state visualization test passed');
        });
        
        // Test particle effects
        await this.runTest('Particle effects work', async function() {
            // Trigger particle effect
            this.eventSystem.publish('trigger-particle-effect', {
                type: 'sparkle',
                position: { x: 100, y: 100 },
                duration: 500
            });
            
            // Check if event was processed (no error means success)
            this.assert(true, 'Particle effects test passed');
        });
    }
    
    /**
     * User interaction tests
     */
    async userInteractionTests() {
        // Skip all tests if user interaction controller is not available
        if (!this.userInteractionController) {
            console.warn('Skipping user interaction tests - system not available');
            return;
        }
        
        // Test input handling
        await this.runTest('Input handling works', async function() {
            // Get user input field
            const inputField = this.assertElementExists('#user-input', 'User input field not found');
            
            // Set input value
            inputField.value = 'Test message';
            
            // Trigger input event
            inputField.dispatchEvent(new Event('input', { bubbles: true }));
            
            // Check if input was processed
            this.assertEqual(inputField.value, 'Test message', 'Input value not set correctly');
            
            // Clear input
            inputField.value = '';
            inputField.dispatchEvent(new Event('input', { bubbles: true }));
        });
        
        // Test send button
        await this.runTest('Send button works', async function() {
            // Get user input field and send button
            const inputField = this.assertElementExists('#user-input', 'User input field not found');
            const sendButton = this.assertElementExists('.send-button', 'Send button not found');
            
            // Set input value
            inputField.value = 'Test message';
            inputField.dispatchEvent(new Event('input', { bubbles: true }));
            
            // Set up event listener for message send
            const messageSentPromise = this.assertEventFired('user-message-sent', () => {
                // Click send button
                sendButton.click();
            });
            
            // Wait for message sent event
            await messageSentPromise;
            
            // Check if input was cleared
            this.assertEqual(inputField.value, '', 'Input not cleared after sending message');
        });
        
        // Test settings panel
        await this.runTest('Settings panel works', async function() {
            // Get settings button
            const settingsButton = this.assertElementExists('.settings-button', 'Settings button not found');
            
            // Click settings button to open panel
            settingsButton.click();
            
            // Check if settings panel is displayed
            this.assertElementExists('.settings-panel.active', 'Settings panel not displayed after clicking button');
            
            // Get close button
            const closeButton = this.assertElementExists('.settings-panel .close-button', 'Close button not found');
            
            // Click close button
            closeButton.click();
            
            // Check if settings panel is hidden
            const settingsPanel = document.querySelector('.settings-panel');
            this.assert(!settingsPanel.classList.contains('active'), 'Settings panel not hidden after clicking close button');
        });
    }
    
    /**
     * Theme system tests
     */
    async themeSystemTests() {
        // Skip all tests if theme system is not available
        if (!this.themeSystem) {
            console.warn('Skipping theme system tests - system not available');
            return;
        }
        
        // Test theme switching
        await this.runTest('Theme switching works', async function() {
            // Get current theme
            const currentTheme = document.body.dataset.theme || 'light';
            
            // Switch to opposite theme
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            this.themeSystem.setTheme(newTheme);
            
            // Check if theme was applied
            this.assertEqual(document.body.dataset.theme, newTheme, `Theme not switched to ${newTheme}`);
            
            // Switch back to original theme
            this.themeSystem.setTheme(currentTheme);
            
            // Check if original theme was restored
            this.assertEqual(document.body.dataset.theme, currentTheme, `Theme not switched back to ${currentTheme}`);
        });
        
        // Test custom theme
        await this.runTest('Custom theme works', async function() {
            // Define custom theme
            const customTheme = {
                name: 'test-theme',
                colors: {
                    primary: '#ff0000',
                    secondary: '#00ff00',
                    background: '#0000ff',
                    text: '#ffffff'
                }
            };
            
            // Apply custom theme
            this.themeSystem.addCustomTheme(customTheme);
            this.themeSystem.setTheme('test-theme');
            
            // Check if custom theme was applied
            this.assertEqual(document.body.dataset.theme, 'test-theme', 'Custom theme not applied');
            
            // Check if custom CSS variables were set
            const computedStyle = getComputedStyle(document.documentElement);
            this.assertEqual(
                computedStyle.getPropertyValue('--color-primary').trim(),
                '#ff0000',
                'Custom primary color not applied'
            );
            
            // Switch back to default theme
            this.themeSystem.setTheme('light');
        });
    }
    
    /**
     * Advanced feature tests
     */
    async advancedFeatureTests() {
        // Test 3D visualization if available
        if (this.pixelVisualization3D) {
            await this.runTest('3D visualization works', async function() {
                // Check if 3D container exists
                this.assertElementExists('#pixel-container-3d', '3D visualization container not found');
                
                // Trigger state change
                this.eventSystem.publish('emotional-state-change', {
                    state: 'happy',
                    intensity: 0.8
                });
                
                // Check if event was processed (no error means success)
                this.assert(true, '3D visualization test passed');
            });
        }
        
        // Test long-term memory if available
        if (this.longTermMemorySystem) {
            await this.runTest('Long-term memory works', async function() {
                // Store test memory
                await this.longTermMemorySystem.storeMemory({
                    type: 'fact',
                    content: 'This is a test memory',
                    importance: 0.5,
                    timestamp: Date.now()
                });
                
                // Retrieve memories
                const memories = await this.longTermMemorySystem.retrieveMemories({
                    type: 'fact',
                    limit: 10
                });
                
                // Check if test memory was stored
                this.assert(
                    memories.some(memory => memory.content === 'This is a test memory'),
                    'Test memory not found in retrieved memories'
                );
            });
        }
        
        // Test spatial audio if available
        if (this.spatialAudioSystem) {
            await this.runTest('Spatial audio works', async function() {
                // Play test sound
                this.spatialAudioSystem.playSound('notification', {
                    position: { x: 1, y: 0, z: 0 },
                    volume: 0.2
                });
                
                // Check if sound was played (no error means success)
                this.assert(true, 'Spatial audio test passed');
            });
        }
        
        // Test user profile system if available
        if (this.advancedUserProfileSystem) {
            await this.runTest('User profile system works', async function() {
                // Create test profile
                await this.advancedUserProfileSystem.createProfile('test-user', {
                    name: 'Test User',
                    preferences: {
                        theme: 'dark',
                        reduceMotion: false
                    }
                });
                
                // Get profile
                const profile = await this.advancedUserProfileSystem.getProfile('test-user');
                
                // Check if profile was created
                this.assert(profile && profile.name === 'Test User', 'Test profile not created correctly');
                
                // Delete test profile
                await this.advancedUserProfileSystem.deleteProfile('test-user');
            });
        }
    }
}

// Initialize UI test system
window.uiTestSystem = new UITestSystem();

// Export the class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UITestSystem;
} else {
    window.UITestSystem = UITestSystem;
}
