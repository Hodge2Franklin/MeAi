/**
 * Enhanced User Experience System
 * 
 * This system improves MeAI's user experience with intuitive onboarding,
 * feedback mechanisms, and customizable conversation flows.
 */

class EnhancedUserExperienceSystem {
    constructor(config = {}) {
        // Initialize dependencies
        this.eventSystem = window.eventSystem;
        this.storageManager = window.storageManager;
        this.advancedNLUSystem = null; // Will be set during initialization
        this.contextAwarenessSystem = null; // Will be set during initialization
        this.sentimentAnalysisSystem = null; // Will be set during initialization
        this.topicModelingSystem = null; // Will be set during initialization
        
        // Configuration
        this.config = {
            enableOnboarding: true,
            enableFeedbackCollection: true,
            enableCustomizableFlows: true,
            onboardingSteps: 5,
            feedbackFrequency: 10, // Ask for feedback every X interactions
            maxSuggestedResponses: 3,
            ...config
        };
        
        // User experience state
        this.state = {
            initialized: false,
            onboardingCompleted: false,
            onboardingStep: 0,
            interactionCount: 0,
            lastFeedbackTime: null,
            userPreferences: {
                responseStyle: 'balanced', // 'concise', 'balanced', 'detailed'
                suggestionsEnabled: true,
                topicSuggestions: true,
                conversationHistory: true
            },
            feedbackHistory: [],
            conversationFlows: {},
            activeFlow: null
        };
    }
    
    /**
     * Initialize the enhanced user experience system
     */
    async initialize() {
        try {
            console.log('Initializing Enhanced User Experience System...');
            
            // Get dependencies if available
            if (window.advancedNLUSystem) {
                this.advancedNLUSystem = window.advancedNLUSystem;
            }
            if (window.contextAwarenessSystem) {
                this.contextAwarenessSystem = window.contextAwarenessSystem;
            }
            if (window.sentimentAnalysisSystem) {
                this.sentimentAnalysisSystem = window.sentimentAnalysisSystem;
            }
            if (window.topicModelingSystem) {
                this.topicModelingSystem = window.topicModelingSystem;
            }
            
            // Load previous state if available
            await this.loadState();
            
            // Initialize default conversation flows
            this.initializeDefaultFlows();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Mark as initialized
            this.state.initialized = true;
            
            console.log('Enhanced User Experience System initialized successfully');
            
            return true;
        } catch (error) {
            console.error('Error initializing Enhanced User Experience System:', error);
            return false;
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for user interaction events
        this.eventSystem.subscribe('user-message-received', (data) => {
            this.handleUserInteraction(data);
        });
        
        // Listen for onboarding requests
        this.eventSystem.subscribe('onboarding-request', (data) => {
            this.getOnboardingStep().then(step => {
                this.eventSystem.publish('onboarding-response', {
                    requestId: data.requestId,
                    step: step
                });
            });
        });
        
        // Listen for feedback submission
        this.eventSystem.subscribe('feedback-submitted', (data) => {
            this.processFeedback(data.feedback).then(result => {
                this.eventSystem.publish('feedback-processed', {
                    requestId: data.requestId,
                    success: result.success
                });
            });
        });
        
        // Listen for preference update requests
        this.eventSystem.subscribe('preferences-update-request', (data) => {
            this.updateUserPreferences(data.preferences).then(result => {
                this.eventSystem.publish('preferences-update-response', {
                    requestId: data.requestId,
                    success: result.success,
                    preferences: result.preferences
                });
            });
        });
        
        // Listen for conversation flow requests
        this.eventSystem.subscribe('conversation-flow-request', (data) => {
            this.getConversationFlow(data.flowId).then(flow => {
                this.eventSystem.publish('conversation-flow-response', {
                    requestId: data.requestId,
                    flow: flow
                });
            });
        });
    }
    
    /**
     * Load previous state from storage
     */
    async loadState() {
        try {
            const savedState = await this.storageManager.getIndexedDB('user-experience', 'current-state');
            if (savedState) {
                // Merge saved state with default state
                this.state = {
                    ...this.state,
                    ...savedState,
                    initialized: false // Will be set to true after full initialization
                };
            }
            
            // Load user preferences
            const userPreferences = await this.storageManager.getIndexedDB('user-experience', 'user-preferences');
            if (userPreferences) {
                this.state.userPreferences = {
                    ...this.state.userPreferences,
                    ...userPreferences
                };
            }
            
            // Load feedback history
            const feedbackHistory = await this.storageManager.getIndexedDB('user-experience', 'feedback-history');
            if (feedbackHistory) {
                this.state.feedbackHistory = feedbackHistory;
            }
            
            // Load conversation flows
            const conversationFlows = await this.storageManager.getIndexedDB('user-experience', 'conversation-flows');
            if (conversationFlows) {
                this.state.conversationFlows = conversationFlows;
            }
            
            return true;
        } catch (error) {
            console.error('Error loading user experience state:', error);
            return false;
        }
    }
    
    /**
     * Save current state to storage
     */
    async saveState() {
        try {
            await this.storageManager.setIndexedDB('user-experience', {
                id: 'current-state',
                onboardingCompleted: this.state.onboardingCompleted,
                onboardingStep: this.state.onboardingStep,
                interactionCount: this.state.interactionCount,
                lastFeedbackTime: this.state.lastFeedbackTime,
                activeFlow: this.state.activeFlow
            });
            
            // Save user preferences separately
            await this.storageManager.setIndexedDB('user-experience', {
                id: 'user-preferences',
                ...this.state.userPreferences
            });
            
            // Save feedback history
            await this.storageManager.setIndexedDB('user-experience', {
                id: 'feedback-history',
                ...this.state.feedbackHistory
            });
            
            // Save conversation flows
            await this.storageManager.setIndexedDB('user-experience', {
                id: 'conversation-flows',
                ...this.state.conversationFlows
            });
            
            return true;
        } catch (error) {
            console.error('Error saving user experience state:', error);
            return false;
        }
    }
    
    /**
     * Initialize default conversation flows
     */
    initializeDefaultFlows() {
        // Only initialize if no flows exist
        if (Object.keys(this.state.conversationFlows).length > 0) {
            return;
        }
        
        this.state.conversationFlows = {
            'general': {
                id: 'general',
                name: 'General Conversation',
                description: 'A general-purpose conversation flow for everyday interactions',
                steps: [],
                isDefault: true,
                created: Date.now()
            },
            'technical-support': {
                id: 'technical-support',
                name: 'Technical Support',
                description: 'A guided conversation flow for technical support inquiries',
                steps: [
                    {
                        id: 'issue-identification',
                        prompt: 'What issue are you experiencing?',
                        responseType: 'open',
                        nextStep: 'troubleshooting'
                    },
                    {
                        id: 'troubleshooting',
                        prompt: 'Let me help you troubleshoot that issue. Have you tried restarting the application?',
                        responseType: 'boolean',
                        nextSteps: {
                            'yes': 'additional-steps',
                            'no': 'suggest-restart'
                        }
                    },
                    {
                        id: 'suggest-restart',
                        prompt: 'Please try restarting the application first, as this often resolves many issues. Let me know once you\'ve done that.',
                        responseType: 'acknowledgment',
                        nextStep: 'additional-steps'
                    },
                    {
                        id: 'additional-steps',
                        prompt: 'Let\'s try some additional troubleshooting steps. What happens when you...',
                        responseType: 'open',
                        nextStep: 'resolution'
                    },
                    {
                        id: 'resolution',
                        prompt: 'Based on your responses, I recommend the following solution...',
                        responseType: 'open',
                        nextStep: 'feedback'
                    },
                    {
                        id: 'feedback',
                        prompt: 'Did this solution resolve your issue?',
                        responseType: 'boolean',
                        nextSteps: {
                            'yes': 'completion',
                            'no': 'escalation'
                        }
                    },
                    {
                        id: 'escalation',
                        prompt: 'I\'m sorry the solution didn\'t work. Let me collect some additional information to help resolve this issue...',
                        responseType: 'open',
                        nextStep: 'completion'
                    },
                    {
                        id: 'completion',
                        prompt: 'Thank you for using our technical support service. Is there anything else I can help you with?',
                        responseType: 'boolean',
                        nextSteps: {
                            'yes': 'issue-identification',
                            'no': null
                        }
                    }
                ],
                isDefault: false,
                created: Date.now()
            },
            'onboarding': {
                id: 'onboarding',
                name: 'User Onboarding',
                description: 'A guided flow to introduce new users to MeAI',
                steps: [
                    {
                        id: 'welcome',
                        prompt: 'Welcome to MeAI! I\'m your personal AI assistant. I can help you with information, tasks, and conversations. Would you like a quick tour of my capabilities?',
                        responseType: 'boolean',
                        nextSteps: {
                            'yes': 'capabilities',
                            'no': 'skip-onboarding'
                        }
                    },
                    {
                        id: 'capabilities',
                        prompt: 'I can understand natural language, remember our conversations, recognize emotions, and adapt to your preferences. What interests you most about these capabilities?',
                        responseType: 'options',
                        options: ['Natural language', 'Memory', 'Emotions', 'Personalization'],
                        nextStep: 'personalization'
                    },
                    {
                        id: 'personalization',
                        prompt: 'I can personalize my responses to match your preferences. Do you prefer concise, balanced, or detailed responses?',
                        responseType: 'options',
                        options: ['Concise', 'Balanced', 'Detailed'],
                        nextStep: 'visualization'
                    },
                    {
                        id: 'visualization',
                        prompt: 'I have a visual representation that changes based on the conversation. You can see it reacting to different emotions and topics. Would you like to try it out?',
                        responseType: 'boolean',
                        nextSteps: {
                            'yes': 'try-visualization',
                            'no': 'privacy'
                        }
                    },
                    {
                        id: 'try-visualization',
                        prompt: 'Great! Try saying something happy, sad, or surprising, and watch how I react visually.',
                        responseType: 'open',
                        nextStep: 'privacy'
                    },
                    {
                        id: 'privacy',
                        prompt: 'Your privacy is important. I can remember our conversations to provide better responses, but you can clear my memory at any time. Would you like me to remember our conversations?',
                        responseType: 'boolean',
                        nextSteps: {
                            'yes': 'completion',
                            'no': 'disable-memory'
                        }
                    },
                    {
                        id: 'disable-memory',
                        prompt: 'I\'ve disabled my long-term memory. I\'ll only remember information within our current session. You can change this setting anytime.',
                        responseType: 'acknowledgment',
                        nextStep: 'completion'
                    },
                    {
                        id: 'skip-onboarding',
                        prompt: 'No problem! You can always access help by asking me about my capabilities or saying "help". Is there something specific I can assist you with now?',
                        responseType: 'open',
                        nextStep: null
                    },
                    {
                        id: 'completion',
                        prompt: 'That completes our quick tour! You\'re all set to start using MeAI. Feel free to ask me anything or tell me what you\'d like to talk about.',
                        responseType: 'acknowledgment',
                        nextStep: null
                    }
                ],
                isDefault: false,
                created: Date.now()
            }
        };
    }
    
    /**
     * Handle user interaction
     * @param {Object} data - The interaction data
     */
    async handleUserInteraction(data) {
        try {
            // Increment interaction count
            this.state.interactionCount++;
            
            // Check if onboarding is needed
            if (this.config.enableOnboarding && !this.state.onboardingCompleted) {
                // If first interaction, start onboarding
                if (this.state.interactionCount === 1) {
                    this.startOnboarding();
                    return;
                }
                
                // Process onboarding step if in progress
                if (this.state.onboardingStep > 0 && this.state.onboardingStep < this.config.onboardingSteps) {
                    this.processOnboardingStep(data);
                    return;
                }
            }
            
            // Check if feedback should be requested
            if (this.config.enableFeedbackCollection && 
                this.state.interactionCount % this.config.feedbackFrequency === 0) {
                this.requestFeedback();
            }
            
            // Process active conversation flow if any
            if (this.state.activeFlow) {
                this.processConversationFlow(data);
            }
            
            // Generate response suggestions based on user preferences
            if (this.state.userPreferences.suggestionsEnabled) {
                this.generateResponseSuggestions(data);
            }
            
            // Save state
            await this.saveState();
            
        } catch (error) {
            console.error('Error handling user interaction:', error);
        }
    }
    
    /**
     * Start the onboarding process
     */
    startOnboarding() {
        // Set onboarding step to 1
        this.state.onboardingStep = 1;
        
        // Set active flow to onboarding
        this.state.activeFlow = 'onboarding';
        
        // Publish onboarding started event
        this.eventSystem.publish('onboarding-started', {
            step: 1,
            totalSteps: this.config.onboardingSteps
        });
    }
    
    /**
     * Process an onboarding step
     * @param {Object} data - The interaction data
     */
    async processOnboardingStep(data) {
        try {
            // Get current step
            const currentStep = this.state.onboardingStep;
            
            // Process user response based on step
            switch (currentStep) {
                case 1: // Introduction and welcome
                    // Update preferences based on response
                    if (data.content.toLowerCase().includes('yes') || 
                        data.content.toLowerCase().includes('sure') ||
                        data.content.toLowerCase().includes('okay')) {
                        // User wants to continue onboarding
                        this.state.onboardingStep = 2;
                    } else {
                        // User wants to skip onboarding
                        this.completeOnboarding();
                        return;
                    }
                    break;
                    
                case 2: // Response style preference
                    // Detect preferred response style
                    if (data.content.toLowerCase().includes('concise') || 
                        data.content.toLowerCase().includes('brief') ||
                        data.content.toLowerCase().includes('short')) {
                        this.state.userPreferences.responseStyle = 'concise';
                    } else if (data.content.toLowerCase().includes('detailed') || 
                             data.content.toLowerCase().includes('thorough') ||
                             data.content.toLowerCase().includes('comprehensive')) {
                        this.state.userPreferences.responseStyle = 'detailed';
                    } else {
                        this.state.userPreferences.responseStyle = 'balanced';
                    }
                    
                    this.state.onboardingStep = 3;
                    break;
                    
                case 3: // Topic suggestions preference
                    if (data.content.toLowerCase().includes('yes') || 
                        data.content.toLowerCase().includes('sure') ||
                        data.content.toLowerCase().includes('okay')) {
                        this.state.userPreferences.topicSuggestions = true;
                    } else {
                        this.state.userPreferences.topicSuggestions = false;
                    }
                    
                    this.state.onboardingStep = 4;
                    break;
                    
                case 4: // Conversation history preference
                    if (data.content.toLowerCase().includes('yes') || 
                        data.content.toLowerCase().includes('sure') ||
                        data.content.toLowerCase().includes('okay')) {
                        this.state.userPreferences.conversationHistory = true;
                    } else {
                        this.state.userPreferences.conversationHistory = false;
                    }
                    
                    this.state.onboardingStep = 5;
                    break;
                    
                case 5: // Completion
                    this.completeOnboarding();
                    return;
            }
            
            // Publish onboarding step event
            this.eventSystem.publish('onboarding-step', {
                step: this.state.onboardingStep,
                totalSteps: this.config.onboardingSteps,
                preferences: this.state.userPreferences
            });
            
            // Save state
            await this.saveState();
            
        } catch (error) {
            console.error('Error processing onboarding step:', error);
        }
    }
    
    /**
     * Complete the onboarding process
     */
    async completeOnboarding() {
        try {
            // Mark onboarding as completed
            this.state.onboardingCompleted = true;
            this.state.onboardingStep = 0;
            
            // Reset active flow
            this.state.activeFlow = null;
            
            // Publish onboarding completed event
            this.eventSystem.publish('onboarding-completed', {
                preferences: this.state.userPreferences
            });
            
            // Save state
            await this.saveState();
            
        } catch (error) {
            console.error('Error completing onboarding:', error);
        }
    }
    
    /**
     * Get the current onboarding step
     * @returns {Object} - The current onboarding step
     */
    async getOnboardingStep() {
        try {
            return {
                completed: this.state.onboardingCompleted,
                currentStep: this.state.onboardingStep,
                totalSteps: this.config.onboardingSteps,
                preferences: this.state.userPreferences
            };
        } catch (error) {
            console.error('Error getting onboarding step:', error);
            return {
                error: error.message,
                completed: false,
                currentStep: 0,
                totalSteps: this.config.onboardingSteps
            };
        }
    }
    
    /**
     * Request feedback from the user
     */
    requestFeedback() {
        // Check if enough time has passed since last feedback
        const now = Date.now();
        if (this.state.lastFeedbackTime && 
            (now - this.state.lastFeedbackTime) < (24 * 60 * 60 * 1000)) {
            // Less than a day since last feedback, skip
            return;
        }
        
        // Publish feedback request event
        this.eventSystem.publish('feedback-request', {
            interactionCount: this.state.interactionCount,
            lastFeedbackTime: this.state.lastFeedbackTime
        });
    }
    
    /**
     * Process user feedback
     * @param {Object} feedback - The user feedback
     * @returns {Object} - The processing result
     */
    async processFeedback(feedback) {
        try {
            // Add timestamp to feedback
            const timestampedFeedback = {
                ...feedback,
                timestamp: Date.now()
            };
            
            // Add to feedback history
            this.state.feedbackHistory.push(timestampedFeedback);
            
            // Update last feedback time
            this.state.lastFeedbackTime = timestampedFeedback.timestamp;
            
            // Adjust user preferences based on feedback if applicable
            if (feedback.preferences) {
                this.state.userPreferences = {
                    ...this.state.userPreferences,
                    ...feedback.preferences
                };
            }
            
            // Save state
            await this.saveState();
            
            // Publish feedback processed event
            this.eventSystem.publish('feedback-processed-internal', {
                feedback: timestampedFeedback
            });
            
            return {
                success: true,
                feedback: timestampedFeedback
            };
        } catch (error) {
            console.error('Error processing feedback:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Update user preferences
     * @param {Object} preferences - The new preferences
     * @returns {Object} - The update result
     */
    async updateUserPreferences(preferences) {
        try {
            // Update preferences
            this.state.userPreferences = {
                ...this.state.userPreferences,
                ...preferences
            };
            
            // Save state
            await this.saveState();
            
            // Publish preferences updated event
            this.eventSystem.publish('preferences-updated', {
                preferences: this.state.userPreferences
            });
            
            return {
                success: true,
                preferences: this.state.userPreferences
            };
        } catch (error) {
            console.error('Error updating preferences:', error);
            return {
                success: false,
                error: error.message,
                preferences: this.state.userPreferences
            };
        }
    }
    
    /**
     * Process a conversation flow
     * @param {Object} data - The interaction data
     */
    async processConversationFlow(data) {
        try {
            // Get active flow
            const flowId = this.state.activeFlow;
            const flow = this.state.conversationFlows[flowId];
            
            if (!flow) {
                // Invalid flow, reset active flow
                this.state.activeFlow = null;
                return;
            }
            
            // Get current step from flow context
            const currentStepId = flow.currentStep || flow.steps[0]?.id;
            
            if (!currentStepId) {
                // No steps in flow, reset active flow
                this.state.activeFlow = null;
                return;
            }
            
            // Find current step
            const currentStep = flow.steps.find(step => step.id === currentStepId);
            
            if (!currentStep) {
                // Invalid step, reset active flow
                this.state.activeFlow = null;
                return;
            }
            
            // Process user response based on step type
            let nextStepId = null;
            
            switch (currentStep.responseType) {
                case 'boolean':
                    // Yes/No response
                    if (data.content.toLowerCase().includes('yes') || 
                        data.content.toLowerCase().includes('sure') ||
                        data.content.toLowerCase().includes('okay')) {
                        nextStepId = currentStep.nextSteps?.yes || null;
                    } else {
                        nextStepId = currentStep.nextSteps?.no || null;
                    }
                    break;
                    
                case 'options':
                    // Multiple choice response
                    const options = currentStep.options || [];
                    for (const option of options) {
                        if (data.content.toLowerCase().includes(option.toLowerCase())) {
                            nextStepId = currentStep.nextSteps?.[option] || currentStep.nextStep;
                            break;
                        }
                    }
                    
                    // If no match, use default next step
                    if (!nextStepId) {
                        nextStepId = currentStep.nextStep;
                    }
                    break;
                    
                case 'acknowledgment':
                case 'open':
                default:
                    // Any response, move to next step
                    nextStepId = currentStep.nextStep;
                    break;
            }
            
            // Update flow with next step
            if (nextStepId) {
                // Update current step
                flow.currentStep = nextStepId;
                
                // Find next step
                const nextStep = flow.steps.find(step => step.id === nextStepId);
                
                // Publish flow step event
                this.eventSystem.publish('conversation-flow-step', {
                    flowId: flowId,
                    step: nextStep
                });
            } else {
                // End of flow, reset active flow
                this.state.activeFlow = null;
                
                // Publish flow completed event
                this.eventSystem.publish('conversation-flow-completed', {
                    flowId: flowId
                });
            }
            
            // Update flow in state
            this.state.conversationFlows[flowId] = flow;
            
        } catch (error) {
            console.error('Error processing conversation flow:', error);
        }
    }
    
    /**
     * Start a conversation flow
     * @param {string} flowId - The ID of the flow to start
     * @returns {Object} - The result of starting the flow
     */
    async startConversationFlow(flowId) {
        try {
            // Check if flow exists
            if (!this.state.conversationFlows[flowId]) {
                return {
                    success: false,
                    error: 'Flow not found'
                };
            }
            
            // Set active flow
            this.state.activeFlow = flowId;
            
            // Reset flow to first step
            const flow = this.state.conversationFlows[flowId];
            flow.currentStep = flow.steps[0]?.id || null;
            
            // Update flow in state
            this.state.conversationFlows[flowId] = flow;
            
            // Get first step
            const firstStep = flow.steps[0] || null;
            
            // Publish flow started event
            this.eventSystem.publish('conversation-flow-started', {
                flowId: flowId,
                step: firstStep
            });
            
            // Save state
            await this.saveState();
            
            return {
                success: true,
                flowId: flowId,
                step: firstStep
            };
        } catch (error) {
            console.error('Error starting conversation flow:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Get a conversation flow
     * @param {string} flowId - The ID of the flow to get
     * @returns {Object} - The conversation flow
     */
    async getConversationFlow(flowId) {
        try {
            // If no flowId provided, return active flow
            if (!flowId && this.state.activeFlow) {
                flowId = this.state.activeFlow;
            }
            
            // If still no flowId, return all flows
            if (!flowId) {
                return {
                    flows: this.state.conversationFlows,
                    activeFlow: this.state.activeFlow
                };
            }
            
            // Get flow
            const flow = this.state.conversationFlows[flowId];
            
            if (!flow) {
                return {
                    error: 'Flow not found',
                    flowId: flowId
                };
            }
            
            return {
                flow: flow,
                isActive: this.state.activeFlow === flowId
            };
        } catch (error) {
            console.error('Error getting conversation flow:', error);
            return {
                error: error.message,
                flowId: flowId
            };
        }
    }
    
    /**
     * Create a new conversation flow
     * @param {Object} flow - The flow to create
     * @returns {Object} - The result of creating the flow
     */
    async createConversationFlow(flow) {
        try {
            // Generate ID if not provided
            if (!flow.id) {
                flow.id = `flow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            }
            
            // Add created timestamp
            flow.created = Date.now();
            
            // Add to flows
            this.state.conversationFlows[flow.id] = flow;
            
            // Save state
            await this.saveState();
            
            return {
                success: true,
                flow: flow
            };
        } catch (error) {
            console.error('Error creating conversation flow:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Generate response suggestions based on context
     * @param {Object} data - The interaction data
     */
    async generateResponseSuggestions(data) {
        try {
            // Skip if no NLU systems available
            if (!this.topicModelingSystem && !this.contextAwarenessSystem) {
                return;
            }
            
            const suggestions = [];
            
            // Generate topic-based suggestions
            if (this.state.userPreferences.topicSuggestions && this.topicModelingSystem) {
                const topicState = this.topicModelingSystem.getState();
                
                if (topicState.currentTopics && topicState.currentTopics.length > 0) {
                    // Get main topic
                    const mainTopic = topicState.currentTopics[0].name;
                    
                    // Get related topics
                    const relatedTopics = await this.topicModelingSystem.getRelatedTopics(mainTopic);
                    
                    // Add suggestion based on main topic
                    suggestions.push({
                        type: 'topic',
                        text: `Tell me more about ${mainTopic}.`,
                        confidence: 0.8
                    });
                    
                    // Add suggestion based on related topic
                    if (relatedTopics.knowledgeBaseRelated && relatedTopics.knowledgeBaseRelated.length > 0) {
                        const relatedTopic = relatedTopics.knowledgeBaseRelated[0];
                        suggestions.push({
                            type: 'related_topic',
                            text: `How is ${mainTopic} related to ${relatedTopic}?`,
                            confidence: 0.7
                        });
                    }
                    
                    // Add suggestion based on subtopic
                    if (relatedTopics.subtopics && relatedTopics.subtopics.length > 0) {
                        const subtopic = relatedTopics.subtopics[0];
                        suggestions.push({
                            type: 'subtopic',
                            text: `What about ${subtopic} specifically?`,
                            confidence: 0.6
                        });
                    }
                }
            }
            
            // Generate context-based suggestions
            if (this.contextAwarenessSystem) {
                const contextState = this.contextAwarenessSystem.getState();
                
                if (contextState.activeContext && contextState.activeContext.entities) {
                    // Get most recent entity
                    const entities = Object.entries(contextState.activeContext.entities)
                        .sort((a, b) => b[1].lastMentioned - a[1].lastMentioned);
                    
                    if (entities.length > 0) {
                        const [entity, entityData] = entities[0];
                        
                        suggestions.push({
                            type: 'entity',
                            text: `Tell me more about ${entity}.`,
                            confidence: 0.75
                        });
                    }
                }
            }
            
            // Generate sentiment-based suggestions
            if (this.sentimentAnalysisSystem) {
                const sentimentState = this.sentimentAnalysisSystem.getState();
                
                // If strong emotion detected, acknowledge it
                const emotions = sentimentState.currentEmotions;
                if (emotions) {
                    const strongestEmotion = Object.entries(emotions)
                        .sort((a, b) => b[1] - a[1])[0];
                    
                    if (strongestEmotion && strongestEmotion[1] > 0.7) {
                        const emotion = strongestEmotion[0];
                        
                        let suggestionText = '';
                        switch (emotion) {
                            case 'joy':
                                suggestionText = "I'm glad you're feeling happy! What's making you feel this way?";
                                break;
                            case 'sadness':
                                suggestionText = "I notice you seem a bit down. Would you like to talk about what's bothering you?";
                                break;
                            case 'anger':
                                suggestionText = "I sense you're frustrated. Is there something specific that's upsetting you?";
                                break;
                            case 'fear':
                                suggestionText = "You seem concerned about something. Would you like to discuss what's worrying you?";
                                break;
                            case 'surprise':
                                suggestionText = "That seems surprising! What did you find most unexpected?";
                                break;
                            default:
                                suggestionText = `I notice a strong sense of ${emotion}. Would you like to talk more about that?`;
                        }
                        
                        suggestions.push({
                            type: 'emotion',
                            text: suggestionText,
                            confidence: 0.85,
                            emotion: emotion
                        });
                    }
                }
            }
            
            // Sort by confidence and limit
            const sortedSuggestions = suggestions
                .sort((a, b) => b.confidence - a.confidence)
                .slice(0, this.config.maxSuggestedResponses);
            
            // Publish suggestions
            if (sortedSuggestions.length > 0) {
                this.eventSystem.publish('response-suggestions', {
                    suggestions: sortedSuggestions
                });
            }
            
        } catch (error) {
            console.error('Error generating response suggestions:', error);
        }
    }
    
    /**
     * Get the current state of the enhanced user experience system
     * @returns {Object} - The current state
     */
    getState() {
        return {
            initialized: this.state.initialized,
            onboardingCompleted: this.state.onboardingCompleted,
            onboardingStep: this.state.onboardingStep,
            interactionCount: this.state.interactionCount,
            lastFeedbackTime: this.state.lastFeedbackTime,
            userPreferences: this.state.userPreferences,
            feedbackHistoryLength: this.state.feedbackHistory.length,
            conversationFlowsCount: Object.keys(this.state.conversationFlows).length,
            activeFlow: this.state.activeFlow
        };
    }
}

// Export the class
window.EnhancedUserExperienceSystem = EnhancedUserExperienceSystem;
