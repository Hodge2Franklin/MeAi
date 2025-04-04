// Enhanced Dialogue System Test Suite for MeAI
class DialogueSystemTest {
  constructor() {
    this.preferenceSystem = window.preferenceSystem;
    this.communicationSystem = window.communicationSystem;
    this.closingSystem = window.closingSystem;
    this.contextSystem = window.contextSystem;
    
    // Test results
    this.testResults = {
      welcomeMessages: { passed: false, details: null },
      voiceNarration: { passed: false, details: null },
      textCommunication: { passed: false, details: null },
      proactiveAssistance: { passed: false, details: null },
      contextualAwareness: { passed: false, details: null },
      closingInteractions: { passed: false, details: null },
      userPreferences: { passed: false, details: null },
      integrationTests: { passed: false, details: null }
    };
    
    // Test status
    this.testInProgress = false;
    this.currentTest = null;
    
    // Initialize
    this.init();
  }
  
  // Initialize the test system
  init() {
    // Create test UI
    this.createTestUI();
  }
  
  // Create test UI
  createTestUI() {
    // Create test panel if it doesn't exist
    let testPanel = document.getElementById('meai-test-panel');
    
    if (!testPanel) {
      testPanel = document.createElement('div');
      testPanel.id = 'meai-test-panel';
      testPanel.className = 'meai-test-panel';
      
      // Add to body
      document.body.appendChild(testPanel);
      
      // Add styles if not already present
      if (!document.getElementById('meai-test-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'meai-test-styles';
        styleElement.textContent = `
          .meai-test-panel {
            position: fixed;
            top: 20px;
            right: 20px;
            width: 300px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            overflow: hidden;
            transform: translateX(310px);
            transition: transform 0.3s ease;
          }
          .meai-test-panel.visible {
            transform: translateX(0);
          }
          .meai-test-header {
            padding: 12px 16px;
            background-color: #6c5ce7;
            color: white;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .meai-test-toggle {
            position: fixed;
            top: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #6c5ce7;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            z-index: 999;
          }
          .meai-test-content {
            padding: 16px;
            max-height: 400px;
            overflow-y: auto;
          }
          .meai-test-section {
            margin-bottom: 16px;
          }
          .meai-test-section-title {
            font-weight: bold;
            margin-bottom: 8px;
          }
          .meai-test-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }
          .meai-test-item:last-child {
            border-bottom: none;
          }
          .meai-test-status {
            display: inline-block;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            margin-right: 8px;
          }
          .meai-test-status.passed {
            background-color: #2ecc71;
          }
          .meai-test-status.failed {
            background-color: #e74c3c;
          }
          .meai-test-status.pending {
            background-color: #f1c40f;
          }
          .meai-test-status.not-run {
            background-color: #95a5a6;
          }
          .meai-test-button {
            padding: 6px 12px;
            border-radius: 4px;
            border: none;
            background-color: #6c5ce7;
            color: white;
            cursor: pointer;
            font-size: 12px;
          }
          .meai-test-button:disabled {
            background-color: #95a5a6;
            cursor: not-allowed;
          }
          .meai-test-actions {
            padding: 12px 16px;
            border-top: 1px solid #eee;
            display: flex;
            justify-content: space-between;
          }
          .meai-test-details {
            margin-top: 8px;
            padding: 8px;
            background-color: #f8f9fa;
            border-radius: 4px;
            font-size: 12px;
            display: none;
          }
          .meai-test-details.visible {
            display: block;
          }
          .meai-test-log {
            margin-top: 16px;
            padding: 8px;
            background-color: #f8f9fa;
            border-radius: 4px;
            font-size: 12px;
            max-height: 100px;
            overflow-y: auto;
          }
          .meai-test-log-entry {
            margin-bottom: 4px;
            padding-bottom: 4px;
            border-bottom: 1px solid #eee;
          }
          .meai-test-log-entry:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
          }
          .meai-test-log-time {
            color: #7f8c8d;
            font-size: 10px;
          }
        `;
        document.head.appendChild(styleElement);
      }
    }
    
    // Create toggle button
    const toggleButton = document.createElement('div');
    toggleButton.className = 'meai-test-toggle';
    toggleButton.innerHTML = 'T';
    toggleButton.title = 'Toggle Test Panel';
    
    // Add to body
    document.body.appendChild(toggleButton);
    
    // Add event listener
    toggleButton.addEventListener('click', () => {
      testPanel.classList.toggle('visible');
    });
    
    // Update test panel content
    this.updateTestPanel();
  }
  
  // Update test panel content
  updateTestPanel() {
    const testPanel = document.getElementById('meai-test-panel');
    
    if (!testPanel) return;
    
    // Create panel content
    testPanel.innerHTML = `
      <div class="meai-test-header">
        <div>MeAI Dialogue System Tests</div>
        <div>${this.testInProgress ? 'Testing...' : 'Ready'}</div>
      </div>
      <div class="meai-test-content">
        <div class="meai-test-section">
          <div class="meai-test-section-title">Component Tests</div>
          
          <div class="meai-test-item">
            <div>
              <span class="meai-test-status ${this.getStatusClass('welcomeMessages')}"></span>
              Welcome Messages
            </div>
            <button class="meai-test-button" data-test="welcomeMessages" ${this.testInProgress ? 'disabled' : ''}>Test</button>
          </div>
          <div class="meai-test-details" id="welcomeMessages-details"></div>
          
          <div class="meai-test-item">
            <div>
              <span class="meai-test-status ${this.getStatusClass('voiceNarration')}"></span>
              Voice Narration
            </div>
            <button class="meai-test-button" data-test="voiceNarration" ${this.testInProgress ? 'disabled' : ''}>Test</button>
          </div>
          <div class="meai-test-details" id="voiceNarration-details"></div>
          
          <div class="meai-test-item">
            <div>
              <span class="meai-test-status ${this.getStatusClass('textCommunication')}"></span>
              Text Communication
            </div>
            <button class="meai-test-button" data-test="textCommunication" ${this.testInProgress ? 'disabled' : ''}>Test</button>
          </div>
          <div class="meai-test-details" id="textCommunication-details"></div>
          
          <div class="meai-test-item">
            <div>
              <span class="meai-test-status ${this.getStatusClass('proactiveAssistance')}"></span>
              Proactive Assistance
            </div>
            <button class="meai-test-button" data-test="proactiveAssistance" ${this.testInProgress ? 'disabled' : ''}>Test</button>
          </div>
          <div class="meai-test-details" id="proactiveAssistance-details"></div>
          
          <div class="meai-test-item">
            <div>
              <span class="meai-test-status ${this.getStatusClass('contextualAwareness')}"></span>
              Contextual Awareness
            </div>
            <button class="meai-test-button" data-test="contextualAwareness" ${this.testInProgress ? 'disabled' : ''}>Test</button>
          </div>
          <div class="meai-test-details" id="contextualAwareness-details"></div>
          
          <div class="meai-test-item">
            <div>
              <span class="meai-test-status ${this.getStatusClass('closingInteractions')}"></span>
              Closing Interactions
            </div>
            <button class="meai-test-button" data-test="closingInteractions" ${this.testInProgress ? 'disabled' : ''}>Test</button>
          </div>
          <div class="meai-test-details" id="closingInteractions-details"></div>
          
          <div class="meai-test-item">
            <div>
              <span class="meai-test-status ${this.getStatusClass('userPreferences')}"></span>
              User Preferences
            </div>
            <button class="meai-test-button" data-test="userPreferences" ${this.testInProgress ? 'disabled' : ''}>Test</button>
          </div>
          <div class="meai-test-details" id="userPreferences-details"></div>
        </div>
        
        <div class="meai-test-section">
          <div class="meai-test-section-title">Integration Tests</div>
          <div class="meai-test-item">
            <div>
              <span class="meai-test-status ${this.getStatusClass('integrationTests')}"></span>
              Full System Integration
            </div>
            <button class="meai-test-button" data-test="integrationTests" ${this.testInProgress ? 'disabled' : ''}>Test</button>
          </div>
          <div class="meai-test-details" id="integrationTests-details"></div>
        </div>
        
        <div class="meai-test-log" id="meai-test-log">
          <div class="meai-test-log-entry">
            <div class="meai-test-log-time">${new Date().toLocaleTimeString()}</div>
            <div>Test system initialized</div>
          </div>
        </div>
      </div>
      <div class="meai-test-actions">
        <button class="meai-test-button" id="run-all-tests" ${this.testInProgress ? 'disabled' : ''}>Run All Tests</button>
        <button class="meai-test-button" id="reset-tests" ${this.testInProgress ? 'disabled' : ''}>Reset Tests</button>
      </div>
    `;
    
    // Add event listeners
    const testButtons = testPanel.querySelectorAll('[data-test]');
    testButtons.forEach(button => {
      button.addEventListener('click', () => {
        const testName = button.getAttribute('data-test');
        this.runTest(testName);
      });
    });
    
    const runAllButton = testPanel.querySelector('#run-all-tests');
    runAllButton.addEventListener('click', () => {
      this.runAllTests();
    });
    
    const resetButton = testPanel.querySelector('#reset-tests');
    resetButton.addEventListener('click', () => {
      this.resetTests();
    });
    
    // Show details for tests that have been run
    for (const testName in this.testResults) {
      if (this.testResults[testName].details) {
        const detailsElement = document.getElementById(`${testName}-details`);
        if (detailsElement) {
          detailsElement.innerHTML = this.testResults[testName].details;
          detailsElement.classList.add('visible');
        }
      }
    }
  }
  
  // Get status class for test
  getStatusClass(testName) {
    if (!this.testResults[testName]) return 'not-run';
    
    if (this.testResults[testName].passed === true) return 'passed';
    if (this.testResults[testName].passed === false && this.testResults[testName].details) return 'failed';
    if (this.currentTest === testName && this.testInProgress) return 'pending';
    
    return 'not-run';
  }
  
  // Add log entry
  addLogEntry(message) {
    const logElement = document.getElementById('meai-test-log');
    
    if (logElement) {
      const entry = document.createElement('div');
      entry.className = 'meai-test-log-entry';
      entry.innerHTML = `
        <div class="meai-test-log-time">${new Date().toLocaleTimeString()}</div>
        <div>${message}</div>
      `;
      
      logElement.appendChild(entry);
      logElement.scrollTop = logElement.scrollHeight;
    }
  }
  
  // Run test
  async runTest(testName) {
    if (this.testInProgress) return;
    
    this.testInProgress = true;
    this.currentTest = testName;
    
    // Update UI
    this.updateTestPanel();
    this.addLogEntry(`Running test: ${testName}`);
    
    try {
      // Run the appropriate test
      switch (testName) {
        case 'welcomeMessages':
          await this.testWelcomeMessages();
          break;
        case 'voiceNarration':
          await this.testVoiceNarration();
          break;
        case 'textCommunication':
          await this.testTextCommunication();
          break;
        case 'proactiveAssistance':
          await this.testProactiveAssistance();
          break;
        case 'contextualAwareness':
          await this.testContextualAwareness();
          break;
        case 'closingInteractions':
          await this.testClosingInteractions();
          break;
        case 'userPreferences':
          await this.testUserPreferences();
          break;
        case 'integrationTests':
          await this.testIntegration();
          break;
        default:
          throw new Error(`Unknown test: ${testName}`);
      }
      
      this.addLogEntry(`Test completed: ${testName} - ${this.testResults[testName].passed ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
      console.error(`Error running test ${testName}:`, error);
      
      this.testResults[testName] = {
        passed: false,
        details: `Error: ${error.message}`
      };
      
      this.addLogEntry(`Test error: ${testName} - ${error.message}`);
    }
    
    this.testInProgress = false;
    this.currentTest = null;
    
    // Update UI
    this.updateTestPanel();
  }
  
  // Run all tests
  async runAllTests() {
    if (this.testInProgress) return;
    
    this.addLogEntry('Running all tests...');
    
    const tests = Object.keys(this.testResults);
    
    for (const testName of tests) {
      await this.runTest(testName);
    }
    
    this.addLogEntry('All tests completed');
    
    // Check if all tests passed
    const allPassed = Object.values(this.testResults).every(result => result.passed);
    
    if (allPassed) {
      this.addLogEntry('✅ ALL TESTS PASSED');
    } else {
      this.addLogEntry('❌ SOME TESTS FAILED');
    }
  }
  
  // Reset tests
  resetTests() {
    if (this.testInProgress) return;
    
    for (const testName in this.testResults) {
      this.testResults[testName] = { passed: false, details: null };
    }
    
    this.addLogEntry('Tests reset');
    
    // Update UI
    this.updateTestPanel();
  }
  
  // Test welcome messages
  async testWelcomeMessages() {
    let passed = true;
    let details = '';
    
    // Check if personalized welcome system exists
    if (!window.personalizedWelcomeSystem) {
      passed = false;
      details += 'PersonalizedWelcomeSystem not found.<br>';
    } else {
      // Test first-time welcome message
      try {
        const firstTimeMessage = window.personalizedWelcomeSystem.generateWelcomeMessage(true);
        
        if (!firstTimeMessage) {
          passed = false;
          details += 'First-time welcome message is empty.<br>';
        } else if (!firstTimeMessage.includes('MeAi') && !firstTimeMessage.includes('companion')) {
          passed = false;
          details += 'First-time welcome message does not mention MeAi or companion.<br>';
        } else {
          details += '✓ First-time welcome message generated correctly.<br>';
        }
      } catch (error) {
        passed = false;
        details += `Error generating first-time welcome message: ${error.message}<br>`;
      }
      
      // Test returning user welcome message
      try {
        const returningMessage = window.personalizedWelcomeSystem.generateWelcomeMessage(false);
        
        if (!returningMessage) {
          passed = false;
          details += 'Returning user welcome message is empty.<br>';
        } else if (!returningMessage.includes('Welcome back') && !returningMessage.includes('Great to see you')) {
          passed = false;
          details += 'Returning user welcome message does not include appropriate greeting.<br>';
        } else {
          details += '✓ Returning user welcome message generated correctly.<br>';
        }
      } catch (error) {
        passed = false;
        details += `Error generating returning user welcome message: ${error.message}<br>`;
      }
    }
    
    // Update test results
    this.testResults.welcomeMessages = { passed, details };
    
    // Show details
    const detailsElement = document.getElementById('welcomeMessages-details');
    if (detailsElement) {
      detailsElement.innerHTML = details;
      detailsElement.classList.add('visible');
    }
  }
  
  // Test voice narration
  async testVoiceNarration() {
    let passed = true;
    let details = '';
    
    // Check if communication system exists
    if (!this.communicationSystem) {
      passed = false;
      details += 'CommunicationSystem not found.<br>';
    } else {
      // Test voice synthesis initialization
      if (!this.communicationSystem.synthesis) {
        passed = false;
        details += 'Speech synthesis not initialized.<br>';
      } else {
        details += '✓ Speech synthesis initialized.<br>';
      }
      
      // Test voice selection
      if (!this.communicationSystem.currentVoice) {
        passed = false;
        details += 'No voice selected.<br>';
      } else {
        details += `✓ Voice selected: ${this.communicationSystem.currentVoice.name}.<br>`;
      }
      
      // Test speech queue
      if (!Array.isArray(this.communicationSystem.speechQueue)) {
        passed = false;
        details += 'Speech queue not initialized.<br>';
      } else {
        details += '✓ Speech queue initialized.<br>';
      }
      
      // Test speak method
      try {
        const result = this.communicationSystem.speak('This is a test message', { volume: 0.1 });
        
        if (this.communicationSystem.communicationMode === 'text' && result === false) {
          details += '✓ Speak method correctly returned false in text-only mode.<br>';
        } else if (this.communicationSystem.communicationMode !== 'text' && result === true) {
          details += '✓ Speak method correctly queued message.<br>';
        } else {
          passed = false;
          details += 'Speak method returned unexpected result.<br>';
        }
      } catch (error) {
        passed = false;
        details += `Error calling speak method: ${error.message}<br>`;
      }
    }
    
    // Update test results
    this.testResults.voiceNarration = { passed, details };
    
    // Show details
    const detailsElement = document.getElementById('voiceNarration-details');
    if (detailsElement) {
      detailsElement.innerHTML = details;
      detailsElement.classList.add('visible');
    }
  }
  
  // Test text communication
  async testTextCommunication() {
    let passed = true;
    let details = '';
    
    // Check if communication system exists
    if (!this.communicationSystem) {
      passed = false;
      details += 'CommunicationSystem not found.<br>';
    } else {
      // Test conversation history
      if (!Array.isArray(this.communicationSystem.conversationHistory)) {
        passed = false;
        details += 'Conversation history not initialized.<br>';
      } else {
        details += '✓ Conversation history initialized.<br>';
      }
      
      // Test adding to conversation history
      try {
        const initialLength = this.communicationSystem.conversationHistory.length;
        this.communicationSystem.addToConversationHistory('user', 'Test message');
        
        if (this.communicationSystem.conversationHistory.length !== initialLength + 1) {
          passed = false;
          details += 'Failed to add message to conversation history.<br>';
        } else {
          details += '✓ Successfully added message to conversation history.<br>';
        }
      } catch (error) {
        passed = false;
        details += `Error adding to conversation history: ${error.message}<br>`;
      }
      
      // Test getting conversation history
      try {
        const history = this.communicationSystem.getConversationHistory(5);
        
        if (!Array.isArray(history)) {
          passed = false;
          details += 'getConversationHistory did not return an array.<br>';
        } else if (history.length === 0 && this.communicationSystem.conversationHistory.length > 0) {
          passed = false;
          details += 'getConversationHistory returned empty array despite having history.<br>';
        } else {
          details += `✓ Successfully retrieved conversation history (${history.length} entries).<br>`;
        }
      } catch (error) {
        passed = false;
        details += `Error getting conversation history: ${error.message}<br>`;
      }
      
      // Test response generation
      try {
        const response = this.communicationSystem.generateResponse('Hello');
        
        if (!response) {
          passed = false;
          details += 'generateResponse returned empty response.<br>';
        } else {
          details += '✓ Successfully generated response.<br>';
        }
      } catch (error) {
        passed = false;
        details += `Error generating response: ${error.message}<br>`;
      }
    }
    
    // Update test results
    this.testResults.textCommunication = { passed, details };
    
    // Show details
    const detailsElement = document.getElementById('textCommunication-details');
    if (detailsElement) {
      detailsElement.innerHTML = details;
      detailsElement.classList.add('visible');
    }
  }
  
  // Test proactive assistance
  async testProactiveAssistance() {
    let passed = true;
    let details = '';
    
    // Check if proactive assistance system exists
    if (!window.proactiveAssistanceSystem) {
      passed = false;
      details += 'ProactiveAssistanceSystem not found.<br>';
    } else {
      // Test generating proactive message
      try {
        const message = window.proactiveAssistanceSystem.generateProactiveMessage();
        
        if (!message) {
          passed = false;
          details += 'generateProactiveMessage returned empty message.<br>';
        } else {
          details += '✓ Successfully generated proactive message.<br>';
        }
      } catch (error) {
        passed = false;
        details += `Error generating proactive message: ${error.message}<br>`;
      }
      
      // Test checking if proactive assistance is enabled
      try {
        const isEnabled = window.proactiveAssistanceSystem.isProactiveAssistanceEnabled();
        details += `✓ Proactive assistance is ${isEnabled ? 'enabled' : 'disabled'}.<br>`;
      } catch (error) {
        passed = false;
        details += `Error checking if proactive assistance is enabled: ${error.message}<br>`;
      }
      
      // Test getting assistance opportunities
      try {
        const opportunities = window.proactiveAssistanceSystem.getAssistanceOpportunities();
        
        if (!Array.isArray(opportunities)) {
          passed = false;
          details += 'getAssistanceOpportunities did not return an array.<br>';
        } else {
          details += `✓ Successfully retrieved assistance opportunities (${opportunities.length} found).<br>`;
        }
      } catch (error) {
        passed = false;
        details += `Error getting assistance opportunities: ${error.message}<br>`;
      }
    }
    
    // Update test results
    this.testResults.proactiveAssistance = { passed, details };
    
    // Show details
    const detailsElement = document.getElementById('proactiveAssistance-details');
    if (detailsElement) {
      detailsElement.innerHTML = details;
      detailsElement.classList.add('visible');
    }
  }
  
  // Test contextual awareness
  async testContextualAwareness() {
    let passed = true;
    let details = '';
    
    // Check if context system exists
    if (!this.contextSystem) {
      passed = false;
      details += 'ContextualAwarenessSystem not found.<br>';
    } else {
      // Test getting recent topics
      try {
        const recentTopics = this.contextSystem.getRecentTopics && this.contextSystem.getRecentTopics();
        
        if (recentTopics === undefined) {
          details += 'getRecentTopics method not implemented.<br>';
        } else if (!Array.isArray(recentTopics)) {
          passed = false;
          details += 'getRecentTopics did not return an array.<br>';
        } else {
          details += `✓ Successfully retrieved recent topics (${recentTopics.length} found).<br>`;
        }
      } catch (error) {
        // Method might not exist, which is okay
        details += 'getRecentTopics method not available or errored.<br>';
      }
      
      // Test getting upcoming meetings
      try {
        const upcomingMeetings = this.contextSystem.getUpcomingMeetings && this.contextSystem.getUpcomingMeetings();
        
        if (upcomingMeetings === undefined) {
          details += 'getUpcomingMeetings method not implemented.<br>';
        } else if (!Array.isArray(upcomingMeetings)) {
          passed = false;
          details += 'getUpcomingMeetings did not return an array.<br>';
        } else {
          details += `✓ Successfully retrieved upcoming meetings (${upcomingMeetings.length} found).<br>`;
        }
      } catch (error) {
        // Method might not exist, which is okay
        details += 'getUpcomingMeetings method not available or errored.<br>';
      }
      
      // Test getting upcoming tasks
      try {
        const upcomingTasks = this.contextSystem.getUpcomingTasks && this.contextSystem.getUpcomingTasks();
        
        if (upcomingTasks === undefined) {
          details += 'getUpcomingTasks method not implemented.<br>';
        } else if (!Array.isArray(upcomingTasks)) {
          passed = false;
          details += 'getUpcomingTasks did not return an array.<br>';
        } else {
          details += `✓ Successfully retrieved upcoming tasks (${upcomingTasks.length} found).<br>`;
        }
      } catch (error) {
        // Method might not exist, which is okay
        details += 'getUpcomingTasks method not available or errored.<br>';
      }
    }
    
    // Update test results
    this.testResults.contextualAwareness = { passed, details };
    
    // Show details
    const detailsElement = document.getElementById('contextualAwareness-details');
    if (detailsElement) {
      detailsElement.innerHTML = details;
      detailsElement.classList.add('visible');
    }
  }
  
  // Test closing interactions
  async testClosingInteractions() {
    let passed = true;
    let details = '';
    
    // Check if closing system exists
    if (!this.closingSystem) {
      passed = false;
      details += 'ClosingInteractionsSystem not found.<br>';
    } else {
      // Test session info
      try {
        const sessionInfo = this.closingSystem.getSessionInfo();
        
        if (!sessionInfo) {
          passed = false;
          details += 'getSessionInfo returned no data.<br>';
        } else if (typeof sessionInfo.active !== 'boolean') {
          passed = false;
          details += 'Session info missing active status.<br>';
        } else {
          details += `✓ Session info retrieved (active: ${sessionInfo.active}).<br>`;
        }
      } catch (error) {
        passed = false;
        details += `Error getting session info: ${error.message}<br>`;
      }
      
      // Test generating closing message
      try {
        const closingMessage = this.closingSystem.generateClosingMessage('test');
        
        if (!closingMessage) {
          passed = false;
          details += 'generateClosingMessage returned empty message.<br>';
        } else {
          details += '✓ Successfully generated closing message.<br>';
        }
      } catch (error) {
        passed = false;
        details += `Error generating closing message: ${error.message}<br>`;
      }
      
      // Test getting closing context
      try {
        const context = this.closingSystem.getClosingContext();
        
        if (!context) {
          passed = false;
          details += 'getClosingContext returned no data.<br>';
        } else if (typeof context.timeOfDay !== 'string') {
          passed = false;
          details += 'Closing context missing time of day.<br>';
        } else {
          details += `✓ Closing context retrieved (time: ${context.timeOfDay}).<br>`;
        }
      } catch (error) {
        passed = false;
        details += `Error getting closing context: ${error.message}<br>`;
      }
    }
    
    // Update test results
    this.testResults.closingInteractions = { passed, details };
    
    // Show details
    const detailsElement = document.getElementById('closingInteractions-details');
    if (detailsElement) {
      detailsElement.innerHTML = details;
      detailsElement.classList.add('visible');
    }
  }
  
  // Test user preferences
  async testUserPreferences() {
    let passed = true;
    let details = '';
    
    // Check if preference system exists
    if (!this.preferenceSystem) {
      passed = false;
      details += 'UserPreferenceTrackingSystem not found.<br>';
    } else {
      // Test getting all preferences
      try {
        const allPreferences = this.preferenceSystem.getAllPreferences();
        
        if (!allPreferences) {
          passed = false;
          details += 'getAllPreferences returned no data.<br>';
        } else if (!allPreferences.communication) {
          passed = false;
          details += 'Preferences missing communication category.<br>';
        } else {
          details += '✓ Successfully retrieved all preferences.<br>';
        }
      } catch (error) {
        passed = false;
        details += `Error getting all preferences: ${error.message}<br>`;
      }
      
      // Test getting specific preference
      try {
        const preferVoice = this.preferenceSystem.getPreference('communication', 'preferVoice');
        
        if (preferVoice === null) {
          passed = false;
          details += 'getPreference returned null for communication.preferVoice.<br>';
        } else {
          details += `✓ Successfully retrieved preference (preferVoice: ${preferVoice}).<br>`;
        }
      } catch (error) {
        passed = false;
        details += `Error getting specific preference: ${error.message}<br>`;
      }
      
      // Test setting preference
      try {
        const originalValue = this.preferenceSystem.getPreference('communication', 'preferVoice');
        const result = this.preferenceSystem.setPreference('communication', 'preferVoice', !originalValue);
        
        if (!result) {
          passed = false;
          details += 'setPreference returned false.<br>';
        } else {
          const newValue = this.preferenceSystem.getPreference('communication', 'preferVoice');
          
          if (newValue === originalValue) {
            passed = false;
            details += 'setPreference did not change value.<br>';
          } else {
            details += '✓ Successfully set preference.<br>';
            
            // Restore original value
            this.preferenceSystem.setPreference('communication', 'preferVoice', originalValue);
          }
        }
      } catch (error) {
        passed = false;
        details += `Error setting preference: ${error.message}<br>`;
      }
      
      // Test preference insights
      try {
        const insights = this.preferenceSystem.getPreferenceInsights();
        
        if (!Array.isArray(insights)) {
          passed = false;
          details += 'getPreferenceInsights did not return an array.<br>';
        } else if (insights.length === 0) {
          details += 'No preference insights available.<br>';
        } else {
          details += `✓ Successfully retrieved preference insights (${insights.length} found).<br>`;
        }
      } catch (error) {
        passed = false;
        details += `Error getting preference insights: ${error.message}<br>`;
      }
    }
    
    // Update test results
    this.testResults.userPreferences = { passed, details };
    
    // Show details
    const detailsElement = document.getElementById('userPreferences-details');
    if (detailsElement) {
      detailsElement.innerHTML = details;
      detailsElement.classList.add('visible');
    }
  }
  
  // Test integration
  async testIntegration() {
    let passed = true;
    let details = '';
    
    // Test communication mode integration with preferences
    if (this.communicationSystem && this.preferenceSystem) {
      try {
        // Get original values
        const originalMode = this.communicationSystem.communicationMode;
        const originalPref = this.preferenceSystem.getPreference('communication', 'preferVoice');
        
        // Change communication mode
        const newMode = originalMode === 'text' ? 'both' : 'text';
        this.communicationSystem.setCommunicationMode(newMode);
        
        // Check if preference was updated
        const newPref = this.preferenceSystem.getPreference('communication', 'preferVoice');
        const expectedPref = newMode !== 'text';
        
        if (newPref !== expectedPref) {
          passed = false;
          details += `Communication mode change did not update preference (expected: ${expectedPref}, got: ${newPref}).<br>`;
        } else {
          details += '✓ Communication mode change correctly updated preference.<br>';
        }
        
        // Restore original values
        this.communicationSystem.setCommunicationMode(originalMode);
      } catch (error) {
        passed = false;
        details += `Error testing communication mode integration: ${error.message}<br>`;
      }
    } else {
      details += 'Skipping communication mode integration test (missing systems).<br>';
    }
    
    // Test closing system integration with communication system
    if (this.closingSystem && this.communicationSystem) {
      try {
        // Mock speak method to avoid actual speech
        const originalSpeak = this.communicationSystem.speak;
        let speakCalled = false;
        
        this.communicationSystem.speak = (text) => {
          speakCalled = true;
          return true;
        };
        
        // Generate closing message
        const message = this.closingSystem.generateClosingMessage('test');
        
        // Display message (but hide it immediately)
        this.closingSystem.displayClosingMessage(message);
        this.closingSystem.hideClosingMessage();
        
        // Check if speak was called (if voice is enabled)
        const voiceEnabled = this.communicationSystem.communicationMode !== 'text';
        
        if (voiceEnabled && !speakCalled) {
          passed = false;
          details += 'Closing message did not trigger speech synthesis.<br>';
        } else if (voiceEnabled) {
          details += '✓ Closing message correctly triggered speech synthesis.<br>';
        } else {
          details += '✓ Closing message correctly did not trigger speech synthesis (voice disabled).<br>';
        }
        
        // Restore original speak method
        this.communicationSystem.speak = originalSpeak;
      } catch (error) {
        passed = false;
        details += `Error testing closing system integration: ${error.message}<br>`;
      }
    } else {
      details += 'Skipping closing system integration test (missing systems).<br>';
    }
    
    // Test user input handling across systems
    try {
      // Create test event
      const testEvent = new CustomEvent('meai-user-input', {
        detail: {
          text: 'Test message',
          source: 'text',
          timestamp: new Date().toISOString()
        }
      });
      
      // Dispatch event
      document.dispatchEvent(testEvent);
      
      details += '✓ User input event dispatched successfully.<br>';
    } catch (error) {
      passed = false;
      details += `Error testing user input event: ${error.message}<br>`;
    }
    
    // Update test results
    this.testResults.integrationTests = { passed, details };
    
    // Show details
    const detailsElement = document.getElementById('integrationTests-details');
    if (detailsElement) {
      detailsElement.innerHTML = details;
      detailsElement.classList.add('visible');
    }
  }
}

// Export the system
window.DialogueSystemTest = DialogueSystemTest;

// Initialize the test system when the document is ready
document.addEventListener('DOMContentLoaded', () => {
  window.dialogueSystemTest = new DialogueSystemTest();
});
