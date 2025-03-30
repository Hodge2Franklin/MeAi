// MeAiIntroduction.js - Manages the MeAi introduction sequence

export default class MeAiIntroduction {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.introContainer = null;
    this.introText = null;
    this.introButtons = null;
    this.nextButton = null;
    
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
  }

  init() {
    // Get introduction elements
    this.introContainer = document.getElementById('meai-intro-container');
    this.introText = document.getElementById('meai-intro-text');
    this.introButtons = document.getElementById('meai-intro-buttons');
    this.nextButton = document.getElementById('meai-intro-next');
    
    if (!this.introContainer || !this.introText || !this.introButtons || !this.nextButton) {
      console.error('Introduction elements not found');
      return;
    }
    
    // Set up event listeners with both click and touchend for iOS compatibility
    this.nextButton.addEventListener('click', this.handleNextClick.bind(this));
    this.nextButton.addEventListener('touchend', (e) => {
      e.preventDefault(); // Prevent default to avoid double-firing
      this.handleNextClick();
    });
    
    // Start introduction automatically
    setTimeout(() => {
      this.startIntroduction();
    }, 1000);
    
    console.log('MeAiIntroduction initialized');
  }

  startIntroduction() {
    console.log('Starting MeAi introduction');
    this.isActive = true;
    
    // Make sure intro container is visible
    this.introContainer.classList.add('visible');
    this.introContainer.classList.remove('hidden');
    
    // Split introduction into paragraphs
    const paragraphs = this.introductionText.split('\n\n');
    let currentParagraph = 0;
    
    const showNextParagraph = () => {
      if (currentParagraph < paragraphs.length) {
        this.introText.textContent = paragraphs[currentParagraph];
        
        if (currentParagraph === paragraphs.length - 1) {
          // Last paragraph, show next button
          this.introButtons.classList.remove('hidden');
        } else {
          // Hide next button for automatic progression
          this.introButtons.classList.add('hidden');
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

  handleNextClick() {
    console.log('Introduction next button clicked');
    this.completeIntroduction();
  }

  completeIntroduction() {
    console.log('Introduction complete');
    this.isActive = false;
    this.isComplete = true;
    
    // Hide introduction container
    this.introContainer.classList.remove('visible');
    this.introContainer.classList.add('hidden');
    
    // Emit event to start tutorial
    this.stateManager.emit('introduction.complete', {});
  }

  isIntroductionActive() {
    return this.isActive;
  }

  isIntroductionComplete() {
    return this.isComplete;
  }

  skipIntroduction() {
    this.completeIntroduction();
  }
}
