/**
 * Simplified Onboarding System
 * 
 * This system provides a streamlined introduction to the MeAI application for new users,
 * focusing on essential features without overwhelming them with information.
 */

class SimplifiedOnboardingSystem {
    constructor() {
        // Initialize state
        this.state = {
            initialized: false,
            onboardingComplete: false,
            currentStep: 0,
            totalSteps: 4,
            onboardingVisible: false,
            hasSeenOnboarding: false
        };
        
        // Define onboarding steps
        this.onboardingSteps = [
            {
                title: "Welcome to MeAI",
                content: "Your personal AI assistant that understands and responds to you naturally.",
                image: "welcome-illustration.svg",
                action: null
            },
            {
                title: "Natural Conversations",
                content: "Just type or speak naturally. MeAI understands context and remembers your preferences.",
                image: "conversation-illustration.svg",
                action: this.demonstrateConversation
            },
            {
                title: "Visual Feedback",
                content: "MeAI provides visual feedback to help you understand its responses and emotional state.",
                image: "visual-illustration.svg",
                action: this.demonstrateVisualFeedback
            },
            {
                title: "Ready to Start",
                content: "You're all set! Ask MeAI anything or try some of the suggested prompts below.",
                image: "ready-illustration.svg",
                action: this.showSuggestedPrompts
            }
        ];
        
        // Initialize the system
        this.initialize();
    }
    
    /**
     * Initialize the simplified onboarding system
     */
    initialize() {
        try {
            console.log('Initializing Simplified Onboarding System...');
            
            // Create event system if not exists
            window.eventSystem = window.eventSystem || this.createEventSystem();
            
            // Check if user has completed onboarding
            this.checkOnboardingStatus();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Create onboarding UI
            this.createOnboardingUI();
            
            // Mark as initialized
            this.state.initialized = true;
            
            console.log('Simplified Onboarding System initialized successfully');
            
            // Show onboarding if needed
            this.showOnboardingIfNeeded();
            
            return true;
        } catch (error) {
            console.error('Error initializing Simplified Onboarding System:', error);
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
     * Check if user has completed onboarding
     */
    checkOnboardingStatus() {
        try {
            const onboardingStatus = localStorage.getItem('meai-onboarding-complete');
            
            if (onboardingStatus === 'true') {
                this.state.onboardingComplete = true;
                this.state.hasSeenOnboarding = true;
            } else {
                this.state.onboardingComplete = false;
                this.state.hasSeenOnboarding = false;
            }
        } catch (error) {
            console.error('Error checking onboarding status:', error);
            this.state.onboardingComplete = false;
            this.state.hasSeenOnboarding = false;
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for app initialization
        window.eventSystem.subscribe('app-initialized', () => {
            // Show onboarding after app is initialized
            setTimeout(() => {
                this.showOnboardingIfNeeded();
            }, 1000);
        });
        
        // Listen for skip onboarding
        window.eventSystem.subscribe('skip-onboarding', () => {
            this.completeOnboarding();
        });
        
        // Listen for restart onboarding
        window.eventSystem.subscribe('restart-onboarding', () => {
            this.restartOnboarding();
        });
    }
    
    /**
     * Create onboarding UI
     */
    createOnboardingUI() {
        // Check if onboarding container already exists
        if (document.getElementById('onboarding-container')) {
            return;
        }
        
        // Create onboarding container
        const onboardingContainer = document.createElement('div');
        onboardingContainer.id = 'onboarding-container';
        onboardingContainer.className = 'onboarding-container';
        onboardingContainer.style.display = 'none';
        
        // Create onboarding content
        onboardingContainer.innerHTML = `
            <div class="onboarding-overlay"></div>
            <div class="onboarding-modal">
                <div class="onboarding-header">
                    <div class="onboarding-progress">
                        <div class="onboarding-progress-bar" style="width: 0%"></div>
                    </div>
                    <button id="skip-onboarding" class="onboarding-skip-button">Skip</button>
                </div>
                
                <div class="onboarding-content">
                    <div class="onboarding-image-container">
                        <img id="onboarding-image" src="" alt="Onboarding illustration">
                    </div>
                    
                    <h2 id="onboarding-title"></h2>
                    <p id="onboarding-description"></p>
                </div>
                
                <div class="onboarding-footer">
                    <button id="onboarding-prev" class="onboarding-nav-button" disabled>Back</button>
                    <button id="onboarding-next" class="onboarding-nav-button">Next</button>
                </div>
            </div>
        `;
        
        // Add onboarding container to the document
        document.body.appendChild(onboardingContainer);
        
        // Add event listeners to onboarding elements
        this.addOnboardingEventListeners();
    }
    
    /**
     * Add event listeners to onboarding elements
     */
    addOnboardingEventListeners() {
        // Skip button
        const skipButton = document.getElementById('skip-onboarding');
        if (skipButton) {
            skipButton.addEventListener('click', () => {
                this.completeOnboarding();
            });
        }
        
        // Previous button
        const prevButton = document.getElementById('onboarding-prev');
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                this.navigateOnboarding(-1);
            });
        }
        
        // Next button
        const nextButton = document.getElementById('onboarding-next');
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                this.navigateOnboarding(1);
            });
        }
    }
    
    /**
     * Show onboarding if needed
     */
    showOnboardingIfNeeded() {
        if (!this.state.onboardingComplete && !this.state.onboardingVisible) {
            this.showOnboarding();
        }
    }
    
    /**
     * Show onboarding
     */
    showOnboarding() {
        const onboardingContainer = document.getElementById('onboarding-container');
        
        if (!onboardingContainer) {
            return;
        }
        
        // Show onboarding
        onboardingContainer.style.display = 'block';
        this.state.onboardingVisible = true;
        
        // Reset to first step
        this.state.currentStep = 0;
        
        // Update UI for current step
        this.updateOnboardingUI();
        
        // Publish event
        window.eventSystem.publish('onboarding-shown', {});
    }
    
    /**
     * Hide onboarding
     */
    hideOnboarding() {
        const onboardingContainer = document.getElementById('onboarding-container');
        
        if (!onboardingContainer) {
            return;
        }
        
        // Hide onboarding
        onboardingContainer.style.display = 'none';
        this.state.onboardingVisible = false;
        
        // Publish event
        window.eventSystem.publish('onboarding-hidden', {});
    }
    
    /**
     * Update onboarding UI for current step
     */
    updateOnboardingUI() {
        const currentStep = this.onboardingSteps[this.state.currentStep];
        
        if (!currentStep) {
            return;
        }
        
        // Update title and description
        const titleElement = document.getElementById('onboarding-title');
        const descriptionElement = document.getElementById('onboarding-description');
        const imageElement = document.getElementById('onboarding-image');
        
        if (titleElement) {
            titleElement.textContent = currentStep.title;
        }
        
        if (descriptionElement) {
            descriptionElement.textContent = currentStep.content;
        }
        
        if (imageElement) {
            // Set default path for images
            const imagePath = `/assets/onboarding/${currentStep.image}`;
            imageElement.src = imagePath;
            imageElement.alt = currentStep.title;
            
            // Handle image load error
            imageElement.onerror = () => {
                // Fallback to placeholder
                imageElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk5OSI+TWVBSTwvdGV4dD48L3N2Zz4=';
            };
        }
        
        // Update progress bar
        const progressBar = document.querySelector('.onboarding-progress-bar');
        if (progressBar) {
            const progress = ((this.state.currentStep + 1) / this.state.totalSteps) * 100;
            progressBar.style.width = `${progress}%`;
        }
        
        // Update navigation buttons
        const prevButton = document.getElementById('onboarding-prev');
        const nextButton = document.getElementById('onboarding-next');
        
        if (prevButton) {
            prevButton.disabled = this.state.currentStep === 0;
        }
        
        if (nextButton) {
            if (this.state.currentStep === this.state.totalSteps - 1) {
                nextButton.textContent = 'Get Started';
            } else {
                nextButton.textContent = 'Next';
            }
        }
        
        // Execute step action if exists
        if (currentStep.action) {
            currentStep.action.call(this);
        }
    }
    
    /**
     * Navigate onboarding steps
     * @param {number} direction - Direction to navigate (1 for next, -1 for previous)
     */
    navigateOnboarding(direction) {
        const newStep = this.state.currentStep + direction;
        
        // Check if step is valid
        if (newStep < 0 || newStep >= this.state.totalSteps) {
            return;
        }
        
        // Update current step
        this.state.currentStep = newStep;
        
        // Check if onboarding is complete
        if (this.state.currentStep === this.state.totalSteps - 1 && direction === 1) {
            // Last step, next will complete onboarding
            this.completeOnboarding();
            return;
        }
        
        // Update UI for current step
        this.updateOnboardingUI();
        
        // Publish event
        window.eventSystem.publish('onboarding-step-changed', {
            step: this.state.currentStep,
            totalSteps: this.state.totalSteps
        });
    }
    
    /**
     * Complete onboarding
     */
    completeOnboarding() {
        // Mark onboarding as complete
        this.state.onboardingComplete = true;
        this.state.hasSeenOnboarding = true;
        
        // Save status to local storage
        try {
            localStorage.setItem('meai-onboarding-complete', 'true');
        } catch (error) {
            console.error('Error saving onboarding status:', error);
        }
        
        // Hide onboarding
        this.hideOnboarding();
        
        // Publish event
        window.eventSystem.publish('onboarding-completed', {});
    }
    
    /**
     * Restart onboarding
     */
    restartOnboarding() {
        // Reset onboarding state
        this.state.onboardingComplete = false;
        this.state.currentStep = 0;
        
        // Show onboarding
        this.showOnboarding();
        
        // Publish event
        window.eventSystem.publish('onboarding-restarted', {});
    }
    
    /**
     * Demonstrate conversation (step 1 action)
     */
    demonstrateConversation() {
        // Simulate a simple conversation
        setTimeout(() => {
            // Show user message
            window.eventSystem.publish('demo-user-message', {
                text: "Hello, what can you help me with?"
            });
            
            // Show AI response after a short delay
            setTimeout(() => {
                window.eventSystem.publish('demo-ai-response', {
                    text: "Hi there! I'm MeAI, your personal AI assistant. I can help you with information, answer questions, have conversations, and much more. Just ask me anything!"
                });
            }, 1500);
        }, 500);
    }
    
    /**
     * Demonstrate visual feedback (step 2 action)
     */
    demonstrateVisualFeedback() {
        // Trigger visual feedback demonstration
        window.eventSystem.publish('demo-visual-feedback', {
            emotions: ['neutral', 'happy', 'thoughtful'],
            duration: 3000
        });
    }
    
    /**
     * Show suggested prompts (step 3 action)
     */
    showSuggestedPrompts() {
        // Create suggested prompts if they don't exist
        if (!document.getElementById('suggested-prompts')) {
            const suggestedPromptsContainer = document.createElement('div');
            suggestedPromptsContainer.id = 'suggested-prompts';
            suggestedPromptsContainer.className = 'suggested-prompts';
            
            // Add some suggested prompts
            const prompts = [
                "Tell me about yourself",
                "What can you help me with?",
                "How does your memory work?",
                "Show me something interesting"
            ];
            
            // Create prompt buttons
            prompts.forEach(prompt => {
                const promptButton = document.createElement('button');
                promptButton.className = 'suggested-prompt-button';
                promptButton.textContent = prompt;
                
                // Add click event
                promptButton.addEventListener('click', () => {
                    // Hide onboarding
                    this.completeOnboarding();
                    
                    // Send prompt to input
                    const inputField = document.getElementById('user-input');
                    if (inputField) {
                        inputField.value = prompt;
                        
                        // Trigger input event
                        const event = new Event('input', { bubbles: true });
                        inputField.dispatchEvent(event);
                    }
                    
                    // Submit prompt
                    window.eventSystem.publish('submit-message', {
                        text: prompt
                    });
                });
                
                suggestedPromptsContainer.appendChild(promptButton);
            });
            
            // Add to onboarding modal
            const onboardingContent = document.querySelector('.onboarding-content');
            if (onboardingContent) {
                onboardingContent.appendChild(suggestedPromptsContainer);
            }
        }
    }
    
    /**
     * Check if onboarding is complete
     * @returns {boolean} - True if onboarding is complete
     */
    isOnboardingComplete() {
        return this.state.onboardingComplete;
    }
    
    /**
     * Check if user has seen onboarding
     * @returns {boolean} - True if user has seen onboarding
     */
    hasUserSeenOnboarding() {
        return this.state.hasSeenOnboarding;
    }
}

// Create singleton instance
const simplifiedOnboardingSystem = new SimplifiedOnboardingSystem();

// Export the singleton
window.simplifiedOnboardingSystem = simplifiedOnboardingSystem;
