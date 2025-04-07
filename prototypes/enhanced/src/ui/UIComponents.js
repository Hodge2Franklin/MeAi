/**
 * UIComponents.js
 * User interface components for MeAi enhanced implementation
 * Handles text display, transitions, and visual feedback
 */

class UIComponents {
  /**
   * Initialize the UIComponents
   * @param {Object} stateManager - StateManager instance
   * @param {Object} options - Configuration options
   */
  constructor(stateManager, options = {}) {
    this.stateManager = stateManager;
    
    // Default options
    this.options = {
      textFadeInDuration: 1500,  // ms for text fade in
      textFadeOutDuration: 1000, // ms for text fade out
      textDisplayDuration: 5000, // ms to display text
      fontFamily: "'EB Garamond', 'Garamond', serif",
      textColor: '#FFFFFF',
      textOpacity: 0.7,
      ...options
    };
    
    // UI elements
    this.elements = {
      container: null,
      textContainer: null,
      choicesContainer: null,
      instructionsContainer: null
    };
    
    // Active timers
    this.timers = {};
    
    // Message queue
    this.messageQueue = [];
    
    // Processing state
    this.isProcessingQueue = false;
    
    // Bind methods
    this.init = this.init.bind(this);
    this.showText = this.showText.bind(this);
    this.showChoices = this.showChoices.bind(this);
    this.processMessageQueue = this.processMessageQueue.bind(this);
  }
  
  /**
   * Initialize UI components
   * @param {string} containerId - Container element ID
   * @returns {boolean} Whether initialization was successful
   */
  init(containerId) {
    // Get container element
    this.elements.container = document.getElementById(containerId);
    
    if (!this.elements.container) {
      console.error(`Container element with ID "${containerId}" not found`);
      return false;
    }
    
    // Create text container
    this.elements.textContainer = document.createElement('div');
    this.elements.textContainer.className = 'meai-text hidden';
    this.elements.textContainer.style.fontFamily = this.options.fontFamily;
    this.elements.textContainer.style.color = this.options.textColor;
    this.elements.textContainer.style.opacity = 0;
    
    // Create choices container
    this.elements.choicesContainer = document.createElement('div');
    this.elements.choicesContainer.className = 'meai-choices hidden';
    
    // Create instructions container
    this.elements.instructionsContainer = document.createElement('div');
    this.elements.instructionsContainer.className = 'meai-instructions hidden';
    
    // Add elements to container
    this.elements.container.appendChild(this.elements.textContainer);
    this.elements.container.appendChild(this.elements.choicesContainer);
    this.elements.container.appendChild(this.elements.instructionsContainer);
    
    // Listen for state changes
    this.stateManager.on('stateChange', (state) => {
      // Update UI based on state changes
      if (state.currentState === 'responding') {
        // Clear any existing timers
        this.clearTimers();
      }
    });
    
    return true;
  }
  
  /**
   * Show text message
   * @param {string} text - Text to display
   * @param {Object} options - Display options
   * @returns {Promise} Resolves when text is displayed and faded out
   */
  showText(text, options = {}) {
    return new Promise((resolve) => {
      // Default options
      const displayOptions = {
        duration: this.options.textDisplayDuration,
        fadeIn: this.options.textFadeInDuration,
        fadeOut: this.options.textFadeOutDuration,
        waitForFadeOut: true,
        className: '',
        ...options
      };
      
      // Set text content
      this.elements.textContainer.textContent = text;
      
      // Apply custom class if provided
      if (displayOptions.className) {
        this.elements.textContainer.classList.add(displayOptions.className);
      }
      
      // Show text container
      this.elements.textContainer.classList.remove('hidden');
      
      // Fade in
      this.elements.textContainer.style.transition = `opacity ${displayOptions.fadeIn}ms ease-in-out`;
      this.elements.textContainer.style.opacity = this.options.textOpacity;
      
      // Clear any existing text timer
      if (this.timers.text) {
        clearTimeout(this.timers.text);
      }
      
      // Set timer to fade out
      this.timers.text = setTimeout(() => {
        // Fade out
        this.elements.textContainer.style.transition = `opacity ${displayOptions.fadeOut}ms ease-in-out`;
        this.elements.textContainer.style.opacity = 0;
        
        // Remove custom class after fade out
        if (displayOptions.className) {
          setTimeout(() => {
            this.elements.textContainer.classList.remove(displayOptions.className);
          }, displayOptions.fadeOut);
        }
        
        // Resolve after fade out if waitForFadeOut is true
        if (displayOptions.waitForFadeOut) {
          setTimeout(resolve, displayOptions.fadeOut);
        }
      }, displayOptions.duration);
      
      // Resolve immediately if not waiting for fade out
      if (!displayOptions.waitForFadeOut) {
        resolve();
      }
    });
  }
  
  /**
   * Show choices
   * @param {Array} choices - Array of choice objects
   * @param {Object} options - Display options
   * @returns {Promise} Resolves with selected choice
   */
  showChoices(choices, options = {}) {
    return new Promise((resolve) => {
      // Default options
      const displayOptions = {
        fadeIn: this.options.textFadeInDuration,
        fadeOut: this.options.textFadeOutDuration,
        ...options
      };
      
      // Clear choices container
      this.elements.choicesContainer.innerHTML = '';
      
      // Create choice elements
      choices.forEach((choice) => {
        const choiceElement = document.createElement('div');
        choiceElement.className = 'meai-choice';
        choiceElement.textContent = choice.text;
        
        // Add custom class if provided
        if (choice.className) {
          choiceElement.classList.add(choice.className);
        }
        
        // Add click handler
        choiceElement.addEventListener('click', () => {
          // Fade out choices
          this.elements.choicesContainer.style.transition = `opacity ${displayOptions.fadeOut}ms ease-in-out`;
          this.elements.choicesContainer.style.opacity = 0;
          
          // Hide after fade out
          setTimeout(() => {
            this.elements.choicesContainer.classList.add('hidden');
          }, displayOptions.fadeOut);
          
          // Resolve with selected choice
          resolve(choice);
        });
        
        // Add to container
        this.elements.choicesContainer.appendChild(choiceElement);
      });
      
      // Show choices container
      this.elements.choicesContainer.classList.remove('hidden');
      
      // Fade in
      this.elements.choicesContainer.style.transition = `opacity ${displayOptions.fadeIn}ms ease-in-out`;
      this.elements.choicesContainer.style.opacity = 1;
    });
  }
  
  /**
   * Show instructions
   * @param {string} text - Instruction text
   * @param {Object} options - Display options
   */
  showInstructions(text, options = {}) {
    // Default options
    const displayOptions = {
      duration: 5000, // ms to display instructions
      fadeIn: 1000,   // ms for fade in
      fadeOut: 1000,  // ms for fade out
      ...options
    };
    
    // Set instruction text
    this.elements.instructionsContainer.textContent = text;
    
    // Show instructions container
    this.elements.instructionsContainer.classList.remove('hidden');
    
    // Fade in
    this.elements.instructionsContainer.style.transition = `opacity ${displayOptions.fadeIn}ms ease-in-out`;
    this.elements.instructionsContainer.style.opacity = 0.9;
    
    // Clear any existing instruction timer
    if (this.timers.instructions) {
      clearTimeout(this.timers.instructions);
    }
    
    // Set timer to fade out
    this.timers.instructions = setTimeout(() => {
      // Fade out
      this.elements.instructionsContainer.style.transition = `opacity ${displayOptions.fadeOut}ms ease-in-out`;
      this.elements.instructionsContainer.style.opacity = 0;
      
      // Hide after fade out
      setTimeout(() => {
        this.elements.instructionsContainer.classList.add('hidden');
      }, displayOptions.fadeOut);
    }, displayOptions.duration);
  }
  
  /**
   * Add message to queue
   * @param {string} text - Message text
   * @param {Object} options - Display options
   */
  queueMessage(text, options = {}) {
    // Add message to queue
    this.messageQueue.push({ text, options });
    
    // Start processing queue if not already processing
    if (!this.isProcessingQueue) {
      this.processMessageQueue();
    }
  }
  
  /**
   * Process message queue
   * @private
   */
  async processMessageQueue() {
    // Set processing flag
    this.isProcessingQueue = true;
    
    // Process messages until queue is empty
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      
      // Display message and wait for completion
      await this.showText(message.text, message.options);
    }
    
    // Clear processing flag
    this.isProcessingQueue = false;
  }
  
  /**
   * Show introduction sequence
   * @param {Array} lines - Array of text lines
   * @param {Object} options - Display options
   * @returns {Promise} Resolves when introduction is complete
   */
  async showIntroduction(lines, options = {}) {
    // Default options
    const displayOptions = {
      lineDelay: 1000,       // ms between lines
      lineDuration: 5000,    // ms to display each line
      fadeIn: 1500,          // ms for fade in
      fadeOut: 1000,         // ms for fade out
      finalChoices: [        // Choices to show at end
        { text: 'Yes, gently', value: 'yes' },
        { text: 'Not now', value: 'no' }
      ],
      ...options
    };
    
    // Display each line sequentially
    for (let i = 0; i < lines.length; i++) {
      // Display line
      await this.showText(lines[i], {
        duration: displayOptions.lineDuration,
        fadeIn: displayOptions.fadeIn,
        fadeOut: displayOptions.fadeOut,
        waitForFadeOut: true
      });
      
      // Wait between lines
      if (i < lines.length - 1) {
        await new Promise(resolve => setTimeout(resolve, displayOptions.lineDelay));
      }
    }
    
    // Show final choices if provided
    if (displayOptions.finalChoices && displayOptions.finalChoices.length > 0) {
      return this.showChoices(displayOptions.finalChoices);
    }
    
    return null;
  }
  
  /**
   * Clear all timers
   */
  clearTimers() {
    // Clear all active timers
    Object.keys(this.timers).forEach(key => {
      clearTimeout(this.timers[key]);
    });
    
    this.timers = {};
  }
  
  /**
   * Create visual pulse effect
   * @param {Object} options - Pulse options
   */
  createPulseEffect(options = {}) {
    // Default options
    const pulseOptions = {
      duration: 1000,  // ms for pulse animation
      size: 100,       // px diameter
      color: '#FFFFFF',
      opacity: 0.3,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      ...options
    };
    
    // Create pulse element
    const pulseElement = document.createElement('div');
    pulseElement.className = 'meai-pulse';
    pulseElement.style.position = 'absolute';
    pulseElement.style.left = `${pulseOptions.x}px`;
    pulseElement.style.top = `${pulseOptions.y}px`;
    pulseElement.style.width = '10px';
    pulseElement.style.height = '10px';
    pulseElement.style.borderRadius = '50%';
    pulseElement.style.backgroundColor = pulseOptions.color;
    pulseElement.style.opacity = pulseOptions.opacity;
    pulseElement.style.transform = 'translate(-50%, -50%)';
    pulseElement.style.transition = `all ${pulseOptions.duration}ms ease-out`;
    
    // Add to container
    this.elements.container.appendChild(pulseElement);
    
    // Trigger animation
    setTimeout(() => {
      pulseElement.style.width = `${pulseOptions.size}px`;
      pulseElement.style.height = `${pulseOptions.size}px`;
      pulseElement.style.opacity = 0;
    }, 10);
    
    // Remove after animation
    setTimeout(() => {
      pulseElement.remove();
    }, pulseOptions.duration + 100);
  }
  
  /**
   * Create wave effect
   * @param {Object} options - Wave options
   */
  createWaveEffect(options = {}) {
    // Default options
    const waveOptions = {
      duration: 3000,   // ms for wave animation
      width: window.innerWidth,
      height: 100,
      color: 'rgba(255, 255, 255, 0.1)',
      y: window.innerHeight / 2,
      ...options
    };
    
    // Create wave element
    const waveElement = document.createElement('div');
    waveElement.className = 'meai-wave';
    waveElement.style.position = 'absolute';
    waveElement.style.left = '0';
    waveElement.style.top = `${waveOptions.y}px`;
    waveElement.style.width = '100%';
    waveElement.style.height = '0';
    waveElement.style.backgroundColor = waveOptions.color;
    waveElement.style.transform = 'translateY(-50%)';
    waveElement.style.transition = `height ${waveOptions.duration}ms ease-in-out`;
    
    // Add to container
    this.elements.container.appendChild(waveElement);
    
    // Trigger animation
    setTimeout(() => {
      waveElement.style.height = `${waveOptions.height}px`;
    }, 10);
    
    // Remove after animation
    setTimeout(() => {
      waveElement.remove();
    }, waveOptions.duration + 100);
  }
  
  /**
   * Show loading indicator
   * @param {string} text - Loading text
   * @param {Object} options - Display options
   * @returns {Object} Control object with stop method
   */
  showLoading(text = 'Loading...', options = {}) {
    // Default options
    const loadingOptions = {
      pulseInterval: 1000, // ms between pulses
      ...options
    };
    
    // Create loading container
    const loadingContainer = document.createElement('div');
    loadingContainer.className = 'meai-loading';
    loadingContainer.style.position = 'absolute';
    loadingContainer.style.left = '50%';
    loadingContainer.style.top = '50%';
    loadingContainer.style.transform = 'translate(-50%, -50%)';
    loadingContainer.style.textAlign = 'center';
    
    // Create loading indicator
    const indicator = document.createElement('div');
    indicator.className = 'meai-loading-indicator';
    indicator.style.width = '20px';
    indicator.style.height = '20px';
    indicator.style.borderRadius = '50%';
    indicator.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
    indicator.style.margin = '0 auto 20px';
    indicator.style.animation = `pulse ${loadingOptions.pulseInterval}ms infinite ease-in-out`;
    
    // Create loading text
    const loadingText = document.createElement('div');
    loadingText.className = 'meai-loading-text';
    loadingText.textContent = text;
    loadingText.style.color = this.options.textColor;
    loadingText.style.fontFamily = this.options.fontFamily;
    loadingText.style.opacity = this.options.textOpacity;
    
    // Add to loading container
    loadingContainer.appendChild(indicator);
    loadingContainer.appendChild(loadingText);
    
    // Add to main container
    this.elements.container.appendChild(loadingContainer);
    
    // Create control object
    const control = {
      stop: () => {
        // Fade out
        loadingContainer.style.transition = 'opacity 500ms ease-out';
        loadingContainer.style.opacity = 0;
        
        // Remove after fade out
        setTimeout(() => {
          loadingContainer.remove();
        }, 500);
      },
      updateText: (newText) => {
        loadingText.textContent = newText;
      }
    };
    
    return control;
  }
  
  /**
   * Create iOS audio button
   * @param {Function} onEnable - Callback when audio is enabled
   * @returns {HTMLElement} Button element
   */
  createIOSAudioButton(onEnable) {
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'ios-audio-button-container';
    
    // Create description
    const description = document.createElement('div');
    description.className = 'ios-audio-description';
    description.textContent = 'MeAi uses sound to create a more immersive experience. Tap the button below to enable audio.';
    
    // Create button
    const button = document.createElement('button');
    button.className = 'ios-audio-button';
    button.textContent = 'Enable Audio Experience';
    
    // Add click handler
    button.addEventListener('click', () => {
      // Call callback
      if (typeof onEnable === 'function') {
        onEnable();
      }
      
      // Fade out container
      buttonContainer.style.transition = 'opacity 500ms ease-out';
      buttonContainer.style.opacity = 0;
      
      // Remove after fade out
      setTimeout(() => {
        buttonContainer.remove();
      }, 500);
    });
    
    // Add to container
    buttonContainer.appendChild(description);
    buttonContainer.appendChild(button);
    
    // Add to main container
    this.elements.container.appendChild(buttonContainer);
    
    return buttonContainer;
  }
}

// Export for use in other modules
export default UIComponents;
