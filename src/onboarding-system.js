// Onboarding system for MeAI
class OnboardingSystem {
    constructor() {
        this.currentStep = 0;
        this.totalSteps = 4;
        this.isActive = false;
        this.onboardingComplete = false;
    }

    // Initialize the onboarding system
    initialize() {
        // Create onboarding overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'onboarding-overlay';
        
        // Create onboarding container
        this.container = document.createElement('div');
        this.container.className = 'onboarding-container';
        
        // Create steps
        this.createSteps();
        
        // Create navigation dots
        this.createNavigationDots();
        
        // Create navigation buttons
        this.createNavigationButtons();
        
        // Assemble the onboarding UI
        this.overlay.appendChild(this.container);
        document.body.appendChild(this.overlay);
        
        // Check if onboarding has been completed before
        const onboardingCompleted = localStorage.getItem('meai-onboarding-completed');
        if (onboardingCompleted) {
            this.hideOnboarding();
            this.onboardingComplete = true;
        } else {
            this.showStep(0);
            this.isActive = true;
        }
        
        // Create help button
        this.createHelpButton();
    }

    // Create onboarding steps
    createSteps() {
        const steps = [
            {
                title: "Welcome to MeAI",
                content: `
                    <p>Welcome to your enhanced MeAI experience! This guide will help you get started with your relational AI companion.</p>
                    <p>MeAI is designed for meaningful connection rather than utility. It's here to listen, reflect, and engage with you in a way that feels genuine and supportive.</p>
                    <p>Let's walk through the key features to help you get the most out of your experience.</p>
                `
            },
            {
                title: "Ambient Sound",
                content: `
                    <p>MeAI includes ambient background sound to create a peaceful atmosphere for your conversations.</p>
                    <p>You can control the ambient sound using the controls in the Ambient Sound section:</p>
                    <ul>
                        <li>Toggle the sound on/off with the Play/Stop buttons</li>
                        <li>Adjust the volume using the slider</li>
                    </ul>
                    <p>The ambient sound helps create a calming environment for deeper connection.</p>
                `
            },
            {
                title: "Voice Narration",
                content: `
                    <p>MeAI can speak to you with a gentle, goddess-like female voice.</p>
                    <p>The voice narration brings a more personal dimension to your conversations:</p>
                    <ul>
                        <li>Toggle voice output on/off</li>
                        <li>Adjust voice volume using the slider</li>
                        <li>Test the voice with the "Test Female Voice" button</li>
                    </ul>
                    <p>When voice is enabled, MeAI will speak its responses while also displaying them as text.</p>
                `
            },
            {
                title: "Starting a Conversation",
                content: `
                    <p>Starting a conversation with MeAI is simple:</p>
                    <ol>
                        <li>Type your message in the input field at the bottom of the conversation area</li>
                        <li>Press Enter or click the Send button</li>
                        <li>Alternatively, click the microphone button to speak your message</li>
                    </ol>
                    <p>MeAI will respond to you both in text and with voice (if enabled).</p>
                    <p>The pulsing pixel visualizes MeAI's state - it animates when MeAI is speaking.</p>
                    <p>You're now ready to begin your journey with MeAI!</p>
                `
            }
        ];
        
        // Create step elements
        this.steps = [];
        steps.forEach((step, index) => {
            const stepElement = document.createElement('div');
            stepElement.className = 'onboarding-step';
            stepElement.innerHTML = `
                <h2 class="onboarding-title">${step.title}</h2>
                <div class="onboarding-content">${step.content}</div>
            `;
            this.container.appendChild(stepElement);
            this.steps.push(stepElement);
        });
    }

    // Create navigation dots
    createNavigationDots() {
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'onboarding-dot-container';
        
        this.dots = [];
        for (let i = 0; i < this.totalSteps; i++) {
            const dot = document.createElement('div');
            dot.className = 'onboarding-dot';
            dot.addEventListener('click', () => this.showStep(i));
            dotsContainer.appendChild(dot);
            this.dots.push(dot);
        }
        
        this.container.appendChild(dotsContainer);
    }

    // Create navigation buttons
    createNavigationButtons() {
        const navigationContainer = document.createElement('div');
        navigationContainer.className = 'onboarding-navigation';
        
        // Previous button
        this.prevButton = document.createElement('button');
        this.prevButton.className = 'button secondary';
        this.prevButton.innerHTML = '<span>Previous</span>';
        this.prevButton.addEventListener('click', () => this.previousStep());
        
        // Next/Finish button
        this.nextButton = document.createElement('button');
        this.nextButton.className = 'button';
        this.nextButton.innerHTML = '<span>Next</span>';
        this.nextButton.addEventListener('click', () => this.nextStep());
        
        navigationContainer.appendChild(this.prevButton);
        navigationContainer.appendChild(this.nextButton);
        
        this.container.appendChild(navigationContainer);
    }

    // Create help button
    createHelpButton() {
        const helpButton = document.createElement('button');
        helpButton.className = 'help-button';
        helpButton.textContent = '?';
        helpButton.setAttribute('data-tooltip', 'Show MeAI Guide');
        helpButton.addEventListener('click', () => this.showOnboarding());
        
        document.body.appendChild(helpButton);
    }

    // Show specific step
    showStep(stepIndex) {
        // Hide all steps
        this.steps.forEach(step => step.classList.remove('active'));
        this.dots.forEach(dot => dot.classList.remove('active'));
        
        // Show current step
        this.steps[stepIndex].classList.add('active');
        this.dots[stepIndex].classList.add('active');
        this.currentStep = stepIndex;
        
        // Update button states
        this.prevButton.style.visibility = stepIndex === 0 ? 'hidden' : 'visible';
        
        if (stepIndex === this.totalSteps - 1) {
            this.nextButton.innerHTML = '<span>Get Started</span>';
        } else {
            this.nextButton.innerHTML = '<span>Next</span>';
        }
    }

    // Go to next step
    nextStep() {
        if (this.currentStep < this.totalSteps - 1) {
            this.showStep(this.currentStep + 1);
        } else {
            this.completeOnboarding();
        }
    }

    // Go to previous step
    previousStep() {
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
        }
    }

    // Complete onboarding
    completeOnboarding() {
        this.hideOnboarding();
        localStorage.setItem('meai-onboarding-completed', 'true');
        this.onboardingComplete = true;
        
        // Show feature indicators
        this.showFeatureIndicators();
    }

    // Show onboarding
    showOnboarding() {
        this.overlay.style.display = 'flex';
        this.showStep(0);
        this.isActive = true;
    }

    // Hide onboarding
    hideOnboarding() {
        this.overlay.style.display = 'none';
        this.isActive = false;
    }

    // Show feature indicators
    showFeatureIndicators() {
        // Only show indicators if this is the first time
        if (localStorage.getItem('meai-feature-indicators-shown')) {
            return;
        }
        
        const indicators = [
            {
                text: "Type here to start talking with MeAI",
                targetSelector: ".message-input",
                position: { top: '-40px', left: '50%' },
                transform: 'translateX(-50%)'
            },
            {
                text: "Toggle ambient sound here",
                targetSelector: "#play-ambient",
                position: { top: '-40px', left: '50%' },
                transform: 'translateX(-50%)'
            },
            {
                text: "Click to test voice narration",
                targetSelector: "#test-voice",
                position: { top: '-40px', left: '50%' },
                transform: 'translateX(-50%)'
            }
        ];
        
        // Create and position indicators
        setTimeout(() => {
            indicators.forEach(indicator => {
                const target = document.querySelector(indicator.targetSelector);
                if (!target) return;
                
                const indicatorElement = document.createElement('div');
                indicatorElement.className = 'feature-indicator';
                indicatorElement.textContent = indicator.text;
                
                // Position relative to target
                const targetRect = target.getBoundingClientRect();
                Object.assign(indicatorElement.style, indicator.position);
                indicatorElement.style.transform = indicator.transform;
                
                // Add to target's parent with relative positioning
                const parent = target.parentElement;
                parent.style.position = 'relative';
                parent.appendChild(indicatorElement);
                
                // Remove after 10 seconds
                setTimeout(() => {
                    parent.removeChild(indicatorElement);
                }, 10000);
            });
            
            localStorage.setItem('meai-feature-indicators-shown', 'true');
        }, 1000);
    }
}
