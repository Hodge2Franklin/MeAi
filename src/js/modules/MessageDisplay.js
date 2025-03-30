// MessageDisplay.js - Shows text messages to the user

export default class MessageDisplay {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.container = null;
    this.textElement = null;
    this.isVisible = false;
    this.hideTimeout = null;
  }

  init() {
    // Get message container
    this.container = document.getElementById('message-container');
    this.textElement = document.getElementById('message-text');
    
    if (!this.container || !this.textElement) {
      console.error('Message container or text element not found');
      return;
    }
    
    // Listen for state changes
    this.stateManager.on('interaction.message', this.handleMessageChange.bind(this));
    this.stateManager.on('interaction.messageVisible', this.handleVisibilityChange.bind(this));
    
    console.log('MessageDisplay initialized');
  }

  handleMessageChange({ newValue }) {
    if (!this.textElement) return;
    
    // Update message text
    this.textElement.textContent = newValue;
  }

  handleVisibilityChange({ newValue }) {
    if (!this.container) return;
    
    this.isVisible = newValue;
    
    if (this.isVisible) {
      this.container.classList.remove('hidden');
      this.container.classList.add('visible');
    } else {
      this.container.classList.remove('visible');
      this.container.classList.add('hidden');
    }
  }

  showMessage(text, duration = 3000) {
    if (!this.container || !this.textElement) return;
    
    // Clear any existing timeout
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    
    // Update state
    this.stateManager.setState('interaction.message', text);
    this.stateManager.setState('interaction.messageVisible', true);
    
    // Set timeout to hide message
    if (duration > 0) {
      this.hideTimeout = setTimeout(() => {
        this.hideMessage();
      }, duration);
    }
  }

  hideMessage() {
    // Update state
    this.stateManager.setState('interaction.messageVisible', false);
    
    // Clear timeout
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  updateMessage(text) {
    // Update state
    this.stateManager.setState('interaction.message', text);
  }

  isMessageVisible() {
    return this.isVisible;
  }

  getCurrentMessage() {
    return this.stateManager.getState().interaction.message;
  }
}
