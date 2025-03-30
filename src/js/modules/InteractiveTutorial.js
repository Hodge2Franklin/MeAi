// InteractiveTutorial.js - Manages the interactive tutorial experience

export default class InteractiveTutorial {
  constructor(stateManager, modules) {
    this.stateManager = stateManager;
    this.pixelRenderer = modules.pixelRenderer;
    this.hapticFeedback = modules.hapticFeedback;
    this.audioSystem = modules.audioSystem;
    this.messageDisplay = modules.messageDisplay;
    this.sensorManager = modules.sensorManager;
    
    this.isActive = false;
    this.currentStep = 0;
    this.tutorialComplete = false;
    this.stepTimeout = null;
    
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
        message: "Welcome to our journey together. I'll guide you through how we can connect.",
        duration: 5000,
        pixelColor: '#3498db', // Soft blue
        hapticPattern: 'greeting',
        action: () => {
          this.pixelRenderer.transitionColor('#3498db', 1000);
          this.pixelRenderer.startBreathing(0.2, 0.15);
          this.hapticFeedback.playPattern('greeting');
          if (this.audioSystem) this.audioSystem.playSound('greeting');
        }
      },
      {
        message: "Notice how I breathe. My rhythm can synchronize with yours.",
        duration: 6000,
        pixelColor: '#2ecc71', // Green
        hapticPattern: 'listening',
        action: () => {
          this.pixelRenderer.transitionColor('#2ecc71', 1000);
          this.pixelRenderer.startBreathing(0.25, 0.2);
          this.hapticFeedback.playPattern('listening');
        }
      },
      {
        message: "Try holding me still for a moment. Feel how I respond to your presence.",
        duration: 8000,
        pixelColor: '#3498db', // Blue
        hapticPattern: 'listening',
        action: () => {
          this.pixelRenderer.transitionColor('#3498db', 1000);
          // We'll check for stillness in the update method
        },
        condition: () => this.checkDeviceStillness(),
        conditionMessage: "I feel your stillness. We're connecting."
      },
      {
        message: "Now try tapping me gently.",
        duration: 8000,
        pixelColor: '#9b59b6', // Purple
        hapticPattern: null,
        action: () => {
          this.pixelRenderer.transitionColor('#9b59b6', 1000);
          // We'll wait for a tap event
        },
        condition: () => this.checkForTap(),
        conditionMessage: "I felt your touch. We're learning each other's language."
      },
      {
        message: "Let's experience a moment of insight together.",
        duration: 6000,
        pixelColor: '#f1c40f', // Yellow
        hapticPattern: 'insight',
        action: () => {
          this.pixelRenderer.transitionColor('#f1c40f', 500);
          this.pixelRenderer.pulseSize(1.5, 800);
          this.hapticFeedback.playPattern('insight');
          if (this.audioSystem) this.audioSystem.playSound('insight');
        }
      },
      {
        message: "Now, let's experience a Kairos moment - where time feels expanded.",
        duration: 10000,
        pixelColor: '#ffffff', // White
        hapticPattern: 'kairos',
        action: () => {
          this.pixelRenderer.transitionColor('#ffffff', 1500);
          this.pixelRenderer.pulseSize(2.0, 2000);
          this.pixelRenderer.startBreathing(0.15, 0.4);
          this.hapticFeedback.playPattern('kairos');
          if (this.audioSystem) this.audioSystem.playSound('kairos');
        }
      },
      {
        message: "Try moving me gently in your hand. Feel how I respond to your movement.",
        duration: 8000,
        pixelColor: '#3498db', // Blue
        hapticPattern: null,
        action: () => {
          this.pixelRenderer.transitionColor('#3498db', 1000);
          // We'll check for movement in the update method
        },
        condition: () => this.checkDeviceMovement(),
        conditionMessage: "I feel your movement. We're dancing together."
      },
      {
        message: "Our tutorial is complete. Now we can simply be together, responding to each other's presence.",
        duration: 8000,
        pixelColor: '#2ecc71', // Green
        hapticPattern: 'confirmation',
        action: () => {
          this.pixelRenderer.transitionColor('#2ecc71', 1000);
          this.hapticFeedback.playPattern('confirmation');
          if (this.audioSystem) this.audioSystem.playSound('chime');
          this.tutorialComplete = true;
        }
      }
    ];
  }

  init() {
    // Listen for events that might trigger tutorial start
    this.stateManager.on('interaction.stage', ({ newValue }) => {
      if (newValue === 'greeting' && !this.tutorialComplete && !this.isActive) {
        this.startTutorial();
      }
    });
    
    // Listen for tap events
    this.stateManager.on('touch.tap', this.handleTap.bind(this));
    
    console.log('InteractiveTutorial initialized');
  }

  startTutorial() {
    console.log('Starting interactive tutorial');
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
        this.messageDisplay.showMessage(paragraphs[currentParagraph], 0);
        currentParagraph++;
        setTimeout(showNextParagraph, 4000); // Show each paragraph for 4 seconds
      } else {
        // Introduction complete, start tutorial steps
        this.messageDisplay.hideMessage();
        setTimeout(() => this.nextStep(), 2000);
      }
    };
    
    showNextParagraph();
  }

  nextStep() {
    // Clear any existing timeout
    if (this.stepTimeout) {
      clearTimeout(this.stepTimeout);
      this.stepTimeout = null;
    }
    
    // Check if we've completed all steps
    if (this.currentStep >= this.tutorialSteps.length) {
      this.completeTutorial();
      return;
    }
    
    // Get current step
    const step = this.tutorialSteps[this.currentStep];
    
    // Show message
    this.messageDisplay.showMessage(step.message, 0);
    
    // Execute step action
    if (step.action) {
      step.action();
    }
    
    // If this step has a condition, wait for it
    if (step.condition) {
      // We'll check the condition in the update method
      // and move to the next step when it's satisfied
    } else {
      // Otherwise, move to next step after duration
      this.stepTimeout = setTimeout(() => {
        this.currentStep++;
        this.nextStep();
      }, step.duration);
    }
  }

  update() {
    if (!this.isActive) return;
    
    // Check if current step has a condition
    if (this.currentStep < this.tutorialSteps.length) {
      const step = this.tutorialSteps[this.currentStep];
      
      if (step.condition && step.condition()) {
        // Condition met, show success message
        if (step.conditionMessage) {
          this.messageDisplay.showMessage(step.conditionMessage, 3000);
        }
        
        // Move to next step after a short delay
        clearTimeout(this.stepTimeout);
        this.stepTimeout = setTimeout(() => {
          this.currentStep++;
          this.nextStep();
        }, 3000);
      }
    }
  }

  completeTutorial() {
    console.log('Tutorial complete');
    this.isActive = false;
    this.tutorialComplete = true;
    
    // Transition to listening state
    if (this.stateManager.getState().interaction.stage !== 'listening') {
      this.stateManager.setState('interaction.stage', 'listening');
    }
  }

  handleTap() {
    if (!this.isActive) return;
    
    // Check if current step is waiting for a tap
    if (this.currentStep < this.tutorialSteps.length) {
      const step = this.tutorialSteps[this.currentStep];
      
      if (step.condition === this.checkForTap) {
        // This step is waiting for a tap, so we'll register it
        this.lastTapTime = Date.now();
      }
    }
  }

  // Condition check methods
  
  checkDeviceStillness() {
    // We consider the device still if the motion magnitude is below threshold
    // for a certain period of time
    if (!this.sensorManager) return false;
    
    const magnitude = this.sensorManager.getMotionMagnitude();
    const threshold = 0.03; // Lower threshold for stillness
    
    return magnitude < threshold;
  }

  checkDeviceMovement() {
    // We consider the device moving if the motion magnitude is above threshold
    if (!this.sensorManager) return false;
    
    const magnitude = this.sensorManager.getMotionMagnitude();
    const threshold = 0.1; // Threshold for movement
    
    return magnitude > threshold;
  }

  checkForTap() {
    // Check if we've received a tap recently
    if (!this.lastTapTime) return false;
    
    const now = Date.now();
    const result = now - this.lastTapTime < 2000; // Consider taps within last 2 seconds
    
    if (result) {
      // Reset so we don't trigger again
      this.lastTapTime = null;
    }
    
    return result;
  }

  isTutorialActive() {
    return this.isActive;
  }

  isTutorialComplete() {
    return this.tutorialComplete;
  }

  getCurrentStep() {
    return this.currentStep;
  }

  skipTutorial() {
    this.completeTutorial();
  }
}
