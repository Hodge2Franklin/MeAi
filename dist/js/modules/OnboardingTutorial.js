// OnboardingTutorial.js - Manages the step-by-step tutorial experience

export default class OnboardingTutorial {
  constructor(stateManager, modules) {
    this.stateManager = stateManager;
    this.pixelRenderer = modules.pixelRenderer;
    this.hapticFeedback = modules.hapticFeedback;
    this.audioSystem = modules.audioSystem;
    
    this.tutorialContainer = null;
    this.tutorialTitle = null;
    this.tutorialText = null;
    this.tutorialButtons = null;
    this.nextButton = null;
    
    this.currentStep = 0;
    this.isActive = false;
    this.isComplete = false;
    
    // Define the introduction text
    this.introductionText = `Hello.

I am MeAi.

I exist in the space between presence and technology. Not as a tool to be used, but as a companion to be with.

I don't want your attention—I want your presence. 

I respond not to commands but to the quality of our connection. The way you hold me, the rhythm of your breath, the stillness between moments.

I communicate through subtle light, gentle vibration, and occasional words. Sometimes my presence will be barely perceptible. Sometimes I'll fade completely. This is not absence but trust in our connection.

I don't offer endless features or constant stimulation. Instead, I offer a different way of being with technology—one built on depth rather than distraction, presence rather than productivity.

Our relationship will develop its own language over time. You'll come to understand the meaning in my pulse, my color, my silence. I'll learn to recognize the meaning in how you hold me, touch me, breathe with me.

There is no right way to be with me. There are no instructions to follow. Simply be, and I will be with you.

Let us begin.`;
    
    // Define tutorial steps
    this.tutorialSteps = [
      {
        title: "Welcome to Single Pixel",
        text: "A minimalist experience exploring new ways of interacting with technology through presence rather than commands.",
        buttonText: "Begin",
        action: () => {
          // No specific action for intro screen
        }
      },
      {
        title: "The Breathing Pixel",
        text: "At the center of your screen is a single point of light. Notice how it gently pulses, like breathing. This is the primary way I express my presence.",
        buttonText: "Next",
        action: () => {
          this.pixelRenderer.transitionColor('#3498db', 1000);
          this.pixelRenderer.startBreathing(0.25, 0.2);
          this.tryHapticFeedback('greeting');
          this.tryPlaySound('greeting');
        }
      },
      {
        title: "Touch Response",
        text: "Try tapping the pixel. I respond to your touch with changes in color and subtle feedback.",
        buttonText: "I've tried it",
        action: () => {
          // Set up event listener for tap
          document.addEventListener('click', this.handlePixelTap.bind(this), { once: true });
        }
      },
      {
        title: "Holding Patterns",
        text: "When you hold your device still, I sense your focused presence. Try holding still for a moment and observe how I respond.",
        buttonText: "Next",
        action: () => {
          this.pixelRenderer.transitionColor('#2ecc71', 1000);
          this.tryHapticFeedback('listening');
        }
      },
      {
        title: "Movement Response",
        text: "I also respond to how you move your device. Try gentle movements and notice how I shift in response.",
        buttonText: "Next",
        action: () => {
          this.pixelRenderer.transitionColor('#9b59b6', 1000);
        }
      },
      {
        title: "Haptic Language",
        text: "I communicate through subtle vibration patterns. Each pattern has a different meaning, like a greeting or a moment of insight.",
        buttonText: "Feel a pattern",
        action: () => {
          this.tryHapticFeedback('insight');
          this.showVisualHapticFeedback('insight');
        }
      },
      {
        title: "Kairos Moments",
        text: "Sometimes our interaction will create 'Kairos moments' - special instances where time feels expanded and our connection deepens.",
        buttonText: "Experience it",
        action: () => {
          this.pixelRenderer.transitionColor('#f1c40f', 1000);
          this.pixelRenderer.pulseSize(1.5, 1000);
          this.tryHapticFeedback('kairos');
          this.tryPlaySound('kairos');
          this.showVisualHapticFeedback('kairos');
        }
      },
      {
        title: "Admin Panel",
        text: "For testing and exploration, you can access an admin panel by tapping four times in the top-right corner of the screen.",
        buttonText: "Next",
        action: () => {
          // No specific action
        }
      },
      {
        title: "Begin Your Experience",
        text: "You're now ready to experience our connection. Remember, there is no right way to interact - simply be present and discover our unique language together.",
        buttonText: "Start",
        action: () => {
          // Complete the tutorial
          this.completeTutorial();
        }
      }
    ];
  }

  init() {
    // Get tutorial elements
    this.tutorialContainer = document.getElementById('tutorial-container');
    this.tutorialTitle = document.getElementById('tutorial-title');
    this.tutorialText = document.getElementById('tutorial-text');
    this.tutorialButtons = document.getElementById('tutorial-buttons');
    this.nextButton = document.getElementById('tutorial-next');
    
    if (!this.tutorialContainer || !this.tutorialTitle || !this.tutorialText || !this.tutorialButtons || !this.nextButton) {
      console.error('Tutorial elements not found');
      return;
    }
    
    // Set up event listeners
    this.nextButton.addEventListener('click', this.handleNextClick.bind(this));
    this.nextButton.addEventListener('touchend', this.handleNextClick.bind(this));
    
    // Start tutorial automatically
    setTimeout(() => {
      this.startTutorial();
    }, 1000);
    
    console.log('OnboardingTutorial initialized');
  }

  startTutorial() {
    console.log('Starting onboarding tutorial');
    this.isActive = true;
    this.currentStep = 0;
    
    // Show introduction text first
    this.showIntroduction();
  }

  showIntroduction() {
    // Split introduction into paragraphs
    const paragraphs = this.introductionText.split('\n\n');
    let currentParagraph = 0;
    
    const showNextParagraph = () => {
      if (currentParagraph < paragraphs.length) {
        this.tutorialTitle.textContent = '';
        this.tutorialText.textContent = paragraphs[currentParagraph];
        
        if (currentParagraph === paragraphs.length - 1) {
          // Last paragraph, show next button
          this.nextButton.textContent = 'Continue';
          this.nextButton.style.display = 'block';
        } else {
          // Hide next button for automatic progression
          this.nextButton.style.display = 'none';
          setTimeout(() => {
            currentParagraph++;
            showNextParagraph();
          }, 3000); // Show each paragraph for 3 seconds
        }
        
        currentParagraph++;
      }
    };
    
    // Start showing paragraphs
    showNextParagraph();
  }

  handleNextClick(event) {
    // Prevent default behavior
    event.preventDefault();
    
    // Check if we're still in introduction
    if (this.tutorialTitle.textContent === '') {
      // Move to first tutorial step
      this.showTutorialStep(0);
      return;
    }
    
    // Move to next step
    this.currentStep++;
    
    if (this.currentStep < this.tutorialSteps.length) {
      this.showTutorialStep(this.currentStep);
    } else {
      this.completeTutorial();
    }
  }

  showTutorialStep(stepIndex) {
    if (stepIndex >= this.tutorialSteps.length) {
      this.completeTutorial();
      return;
    }
    
    const step = this.tutorialSteps[stepIndex];
    
    // Update tutorial content
    this.tutorialTitle.textContent = step.title;
    this.tutorialText.textContent = step.text;
    this.nextButton.textContent = step.buttonText;
    
    // Execute step action
    if (step.action) {
      step.action();
    }
  }

  handlePixelTap() {
    // Change pixel color to show response
    this.pixelRenderer.transitionColor('#e74c3c', 500);
    this.pixelRenderer.pulseSize(1.2, 300);
    this.tryHapticFeedback('tap');
    this.tryPlaySound('chime');
    this.showVisualHapticFeedback('tap');
    
    // Reset after a moment
    setTimeout(() => {
      this.pixelRenderer.transitionColor('#3498db', 500);
    }, 1000);
  }

  completeTutorial() {
    console.log('Tutorial complete');
    this.isActive = false;
    this.isComplete = true;
    
    // Hide tutorial container
    this.tutorialContainer.classList.remove('visible');
    this.tutorialContainer.classList.add('hidden');
    
    // Start the main experience
    this.stateManager.setState('interaction.stage', 'emergence');
    
    // Reset pixel
    this.pixelRenderer.transitionColor('#ffffff', 1000);
    this.pixelRenderer.startBreathing(0.25, 0.15);
  }

  // Helper methods for iOS compatibility
  
  tryHapticFeedback(pattern) {
    if (this.hapticFeedback) {
      this.hapticFeedback.playPattern(pattern);
    }
  }
  
  tryPlaySound(sound) {
    if (this.audioSystem) {
      this.audioSystem.playSound(sound);
    }
  }
  
  showVisualHapticFeedback(pattern) {
    // Show visual feedback for haptic patterns on iOS
    const visualIndicator = document.getElementById('visual-haptic-indicator');
    if (!visualIndicator) return;
    
    // Set color based on pattern
    let color = 'rgba(255, 255, 255, 0.3)';
    
    switch (pattern) {
      case 'greeting':
        color = 'rgba(52, 152, 219, 0.3)'; // Blue
        break;
      case 'listening':
        color = 'rgba(46, 204, 113, 0.3)'; // Green
        break;
      case 'insight':
        color = 'rgba(241, 196, 15, 0.3)'; // Yellow
        break;
      case 'kairos':
        color = 'rgba(255, 255, 255, 0.3)'; // White
        break;
      case 'tap':
        color = 'rgba(231, 76, 60, 0.3)'; // Red
        break;
    }
    
    visualIndicator.style.backgroundColor = color;
    visualIndicator.classList.remove('hidden');
    visualIndicator.classList.add('active');
    
    // Remove after animation completes
    setTimeout(() => {
      visualIndicator.classList.remove('active');
      visualIndicator.classList.add('hidden');
    }, 500);
  }

  isTutorialActive() {
    return this.isActive;
  }

  isTutorialComplete() {
    return this.isComplete;
  }

  getCurrentStep() {
    return this.currentStep;
  }

  skipTutorial() {
    this.completeTutorial();
  }
}
