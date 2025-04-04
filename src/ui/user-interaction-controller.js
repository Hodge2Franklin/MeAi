/**
 * User Interaction Controller
 * 
 * This system enhances user interaction with advanced input methods,
 * gesture recognition, voice commands, and adaptive response mechanisms.
 */

class UserInteractionController {
    constructor() {
        // Initialize dependencies
        this.storageManager = window.storageManager;
        this.eventSystem = window.eventSystem;
        this.themeSystem = window.themeSystem;
        this.accessibilitySystem = window.accessibilitySystem;
        this.interfaceAnimationSystem = window.interfaceAnimationSystem;
        this.enhancedInterfaceSystem = window.enhancedInterfaceSystem;
        this.contextualMemorySystem = window.contextualMemorySystem;
        
        // Interaction state
        this.state = {
            voiceInputActive: false,
            voiceRecognition: null,
            typingTimeout: null,
            typingIndicator: false,
            lastInteraction: Date.now(),
            idleTimeout: 300000, // 5 minutes
            idleCheckInterval: null,
            gestureEnabled: true,
            keyboardShortcutsEnabled: true,
            multiTouchEnabled: true,
            dragAndDropEnabled: true,
            currentSuggestions: [],
            interactionHistory: [],
            interactionPatterns: {},
            adaptiveMode: true
        };
        
        // Initialize
        this.initialize();
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    /**
     * Initialize the user interaction controller
     */
    async initialize() {
        try {
            // Load user preferences
            const preferences = await this.storageManager.getIndexedDB('preferences', 'user-interaction');
            if (preferences) {
                if (preferences.gestureEnabled !== undefined) {
                    this.state.gestureEnabled = preferences.gestureEnabled;
                }
                
                if (preferences.keyboardShortcutsEnabled !== undefined) {
                    this.state.keyboardShortcutsEnabled = preferences.keyboardShortcutsEnabled;
                }
                
                if (preferences.multiTouchEnabled !== undefined) {
                    this.state.multiTouchEnabled = preferences.multiTouchEnabled;
                }
                
                if (preferences.dragAndDropEnabled !== undefined) {
                    this.state.dragAndDropEnabled = preferences.dragAndDropEnabled;
                }
                
                if (preferences.adaptiveMode !== undefined) {
                    this.state.adaptiveMode = preferences.adaptiveMode;
                }
            }
            
            // Initialize voice recognition if supported
            this.initializeVoiceRecognition();
            
            // Start idle checker
            this.startIdleChecker();
            
            // Initialize drag and drop if enabled
            if (this.state.dragAndDropEnabled) {
                this.initializeDragAndDrop();
            }
            
            // Load interaction patterns
            await this.loadInteractionPatterns();
            
            console.log('User Interaction Controller initialized');
            
            // Notify system that interaction controller is ready
            this.eventSystem.publish('interaction-controller-ready', {
                ...this.state
            });
        } catch (error) {
            console.error('Error initializing user interaction controller:', error);
        }
    }
    
    /**
     * Initialize voice recognition
     */
    initializeVoiceRecognition() {
        // Check if browser supports speech recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.state.voiceRecognition = new SpeechRecognition();
            
            // Configure speech recognition
            this.state.voiceRecognition.continuous = false;
            this.state.voiceRecognition.interimResults = true;
            this.state.voiceRecognition.lang = 'en-US';
            
            // Set up event handlers
            this.state.voiceRecognition.onstart = () => {
                this.state.voiceInputActive = true;
                this.eventSystem.publish('voice-input-started');
                
                // Show voice input indicator
                this.showVoiceInputIndicator();
            };
            
            this.state.voiceRecognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                
                // Update input field with transcript
                const userInput = document.getElementById('user-input');
                if (userInput) {
                    userInput.value = transcript;
                }
                
                // Show in voice input indicator
                this.updateVoiceInputIndicator(transcript);
            };
            
            this.state.voiceRecognition.onend = () => {
                this.state.voiceInputActive = false;
                this.eventSystem.publish('voice-input-ended');
                
                // Hide voice input indicator
                this.hideVoiceInputIndicator();
                
                // If we have a transcript, send the message
                const userInput = document.getElementById('user-input');
                if (userInput && userInput.value.trim()) {
                    // Small delay to allow user to see the final transcript
                    setTimeout(() => {
                        this.sendUserMessage();
                    }, 500);
                }
            };
            
            this.state.voiceRecognition.onerror = (event) => {
                console.error('Voice recognition error:', event.error);
                this.eventSystem.publish('voice-input-error', { error: event.error });
                
                // Show error notification
                if (this.enhancedInterfaceSystem) {
                    this.enhancedInterfaceSystem.showNotification(
                        `Voice input error: ${event.error}`, 
                        'error'
                    );
                }
                
                // Hide voice input indicator
                this.hideVoiceInputIndicator();
            };
        } else {
            console.warn('Speech recognition not supported in this browser');
        }
    }
    
    /**
     * Start voice input
     */
    startVoiceInput() {
        if (!this.state.voiceRecognition) {
            console.warn('Voice recognition not available');
            
            // Show notification
            if (this.enhancedInterfaceSystem) {
                this.enhancedInterfaceSystem.showNotification(
                    'Voice input is not supported in your browser', 
                    'warning'
                );
            }
            return;
        }
        
        if (this.state.voiceInputActive) {
            // Already active, stop it
            this.state.voiceRecognition.stop();
        } else {
            // Start voice recognition
            try {
                this.state.voiceRecognition.start();
                
                // Play start sound
                this.eventSystem.publish('play-interaction-sound', { sound: 'voice-start' });
            } catch (error) {
                console.error('Error starting voice recognition:', error);
                
                // Show error notification
                if (this.enhancedInterfaceSystem) {
                    this.enhancedInterfaceSystem.showNotification(
                        'Could not start voice input. Please try again.', 
                        'error'
                    );
                }
            }
        }
    }
    
    /**
     * Show voice input indicator
     */
    showVoiceInputIndicator() {
        // Check if indicator already exists
        let indicator = document.getElementById('voice-input-indicator');
        
        if (!indicator) {
            // Create indicator
            indicator = document.createElement('div');
            indicator.id = 'voice-input-indicator';
            indicator.className = 'voice-input-indicator';
            
            // Add visualization
            const visualization = document.createElement('div');
            visualization.className = 'voice-visualization';
            
            // Add 5 bars
            for (let i = 0; i < 5; i++) {
                const bar = document.createElement('div');
                bar.className = 'voice-bar';
                visualization.appendChild(bar);
            }
            
            // Add text
            const text = document.createElement('div');
            text.className = 'voice-text';
            text.textContent = 'Listening...';
            
            // Add cancel button
            const cancelButton = document.createElement('button');
            cancelButton.className = 'voice-cancel';
            cancelButton.innerHTML = '<span class="material-icons">close</span>';
            cancelButton.addEventListener('click', () => {
                if (this.state.voiceRecognition) {
                    this.state.voiceRecognition.stop();
                }
            });
            
            // Assemble indicator
            indicator.appendChild(visualization);
            indicator.appendChild(text);
            indicator.appendChild(cancelButton);
            
            // Add to body
            document.body.appendChild(indicator);
            
            // Animate in
            setTimeout(() => {
                indicator.classList.add('active');
            }, 10);
            
            // Start animation
            this.animateVoiceVisualization();
        }
    }
    
    /**
     * Update voice input indicator
     * @param {string} transcript - Voice transcript
     */
    updateVoiceInputIndicator(transcript) {
        const indicator = document.getElementById('voice-input-indicator');
        if (indicator) {
            const text = indicator.querySelector('.voice-text');
            if (text) {
                text.textContent = transcript || 'Listening...';
            }
        }
    }
    
    /**
     * Hide voice input indicator
     */
    hideVoiceInputIndicator() {
        const indicator = document.getElementById('voice-input-indicator');
        if (indicator) {
            // Animate out
            indicator.classList.remove('active');
            
            // Remove after animation
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.parentNode.removeChild(indicator);
                }
            }, 300);
        }
    }
    
    /**
     * Animate voice visualization
     */
    animateVoiceVisualization() {
        const indicator = document.getElementById('voice-input-indicator');
        if (!indicator) return;
        
        const bars = indicator.querySelectorAll('.voice-bar');
        if (!bars.length) return;
        
        // Animate bars while voice input is active
        const animate = () => {
            if (!this.state.voiceInputActive) return;
            
            // Randomize bar heights
            bars.forEach(bar => {
                const height = 5 + Math.random() * 20;
                bar.style.height = `${height}px`;
            });
            
            // Continue animation
            requestAnimationFrame(animate);
        };
        
        // Start animation
        animate();
    }
    
    /**
     * Send user message
     */
    sendUserMessage() {
        const userInput = document.getElementById('user-input');
        if (!userInput || !userInput.value.trim()) return;
        
        const message = userInput.value.trim();
        
        // Clear input
        userInput.value = '';
        
        // Resize textarea if it's a textarea
        if (userInput.tagName.toLowerCase() === 'textarea') {
            this.resizeTextarea(userInput);
        }
        
        // Add to conversation
        this.addUserMessage(message);
        
        // Process message
        this.processUserMessage(message);
        
        // Play send sound
        this.eventSystem.publish('play-interaction-sound', { sound: 'message-sent' });
        
        // Record interaction
        this.recordInteraction('send-message', { message });
    }
    
    /**
     * Add user message to conversation
     * @param {string} message - User message
     */
    addUserMessage(message) {
        const conversationHistory = document.querySelector('.conversation-history');
        if (!conversationHistory) return;
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = 'message user-message';
        
        // Add message text
        messageElement.textContent = message;
        
        // Add timestamp
        const timestamp = document.createElement('div');
        timestamp.className = 'message-timestamp';
        timestamp.textContent = this.formatTime(new Date());
        messageElement.appendChild(timestamp);
        
        // Add message actions
        const actions = document.createElement('div');
        actions.className = 'message-actions';
        
        const copyButton = document.createElement('button');
        copyButton.className = 'message-action-button';
        copyButton.setAttribute('aria-label', 'Copy message');
        copyButton.setAttribute('data-tooltip', 'Copy');
        copyButton.innerHTML = '<span class="material-icons">content_copy</span>';
        copyButton.addEventListener('click', () => {
            navigator.clipboard.writeText(message);
            
            // Show notification
            if (this.enhancedInterfaceSystem) {
                this.enhancedInterfaceSystem.showNotification(
                    'Message copied to clipboard', 
                    'success'
                );
            }
        });
        
        actions.appendChild(copyButton);
        messageElement.appendChild(actions);
        
        // Add to conversation
        conversationHistory.appendChild(messageElement);
        
        // Scroll to bottom
        conversationHistory.scrollTop = conversationHistory.scrollHeight;
    }
    
    /**
     * Add system message to conversation
     * @param {string} message - System message
     * @param {boolean} isTyping - Whether to show typing indicator
     */
    addSystemMessage(message, isTyping = false) {
        const conversationHistory = document.querySelector('.conversation-history');
        if (!conversationHistory) return;
        
        if (isTyping) {
            // Show typing indicator
            this.showTypingIndicator();
            
            // Set timeout to show message
            this.state.typingTimeout = setTimeout(() => {
                // Hide typing indicator
                this.hideTypingIndicator();
                
                // Add actual message
                this.addSystemMessage(message, false);
            }, message.length * 20 + 500); // Simulate typing speed
            
            return;
        }
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = 'message ai-message';
        
        // Add message text
        messageElement.textContent = message;
        
        // Add timestamp
        const timestamp = document.createElement('div');
        timestamp.className = 'message-timestamp';
        timestamp.textContent = this.formatTime(new Date());
        messageElement.appendChild(timestamp);
        
        // Add message actions
        const actions = document.createElement('div');
        actions.className = 'message-actions';
        
        const copyButton = document.createElement('button');
        copyButton.className = 'message-action-button';
        copyButton.setAttribute('aria-label', 'Copy message');
        copyButton.setAttribute('data-tooltip', 'Copy');
        copyButton.innerHTML = '<span class="material-icons">content_copy</span>';
        copyButton.addEventListener('click', () => {
            navigator.clipboard.writeText(message);
            
            // Show notification
            if (this.enhancedInterfaceSystem) {
                this.enhancedInterfaceSystem.showNotification(
                    'Message copied to clipboard', 
                    'success'
                );
            }
        });
        
        actions.appendChild(copyButton);
        messageElement.appendChild(actions);
        
        // Add to conversation
        conversationHistory.appendChild(messageElement);
        
        // Scroll to bottom
        conversationHistory.scrollTop = conversationHistory.scrollHeight;
        
        // Play receive sound
        this.eventSystem.publish('play-interaction-sound', { sound: 'message-received' });
    }
    
    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        const conversationHistory = document.querySelector('.conversation-history');
        if (!conversationHistory) return;
        
        // Check if indicator already exists
        let indicator = document.getElementById('typing-indicator');
        
        if (!indicator) {
            // Create indicator
            indicator = document.createElement('div');
            indicator.id = 'typing-indicator';
            indicator.className = 'message ai-message typing-indicator';
            
            // Add dots
            const dots = document.createElement('div');
            dots.className = 'typing-dots';
            
            for (let i = 0; i < 3; i++) {
                const dot = document.createElement('span');
                dot.className = 'typing-dot';
                dots.appendChild(dot);
            }
            
            indicator.appendChild(dots);
            
            // Add to conversation
            conversationHistory.appendChild(indicator);
            
            // Scroll to bottom
            conversationHistory.scrollTop = conversationHistory.scrollHeight;
        }
        
        this.state.typingIndicator = true;
    }
    
    /**
     * Hide typing indicator
     */
    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.parentNode.removeChild(indicator);
        }
        
        this.state.typingIndicator = false;
    }
    
    /**
     * Process user message
     * @param {string} message - User message
     */
    processUserMessage(message) {
        // Check for commands
        if (this.processCommand(message)) {
            return;
        }
        
        // Generate response
        this.generateResponse(message);
    }
    
    /**
     * Process command
     * @param {string} message - User message
     * @returns {boolean} Whether message was a command
     */
    processCommand(message) {
        // Check for commands
        const commandPatterns = [
            { 
                pattern: /^\/clear$/i, 
                action: () => this.clearConversation() 
            },
            { 
                pattern: /^\/theme\s+(\w+)$/i, 
                action: (match) => this.changeTheme(match[1]) 
            },
            { 
                pattern: /^\/help$/i, 
                action: () => this.showHelp() 
            },
            { 
                pattern: /^\/export$/i, 
                action: () => this.exportConversation() 
            },
            { 
                pattern: /^\/settings$/i, 
                action: () => this.openSettings() 
            },
            { 
                pattern: /^\/emotion\s+(\w+)$/i, 
                action: (match) => this.changeEmotion(match[1]) 
            }
        ];
        
        for (const command of commandPatterns) {
            const match = message.match(command.pattern);
            if (match) {
                command.action(match);
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Generate response
     * @param {string} message - User message
     */
    generateResponse(message) {
        // Show typing indicator
        this.showTypingIndicator();
        
        // Analyze message sentiment
        const sentiment = this.analyzeSentiment(message);
        
        // Update emotional state based on message
        this.eventSystem.publish('update-emotional-state', { 
            message, 
            sentiment 
        });
        
        // Get contextual memory
        const context = this.contextualMemorySystem ? 
            this.contextualMemorySystem.getRelevantMemories(message) : 
            [];
        
        // Generate response (simulated)
        setTimeout(() => {
            // Hide typing indicator
            this.hideTypingIndicator();
            
            // Generate response based on message, sentiment and context
            let response;
            
            if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
                response = "Hello! How can I help you today?";
            } else if (message.toLowerCase().includes('how are you')) {
                response = "I'm doing well, thank you for asking! How about you?";
            } else if (message.toLowerCase().includes('help')) {
                response = "I'm here to help! You can ask me questions, have a conversation, or use commands like /help, /clear, or /theme to control the interface.";
            } else if (message.toLowerCase().includes('thank')) {
                response = "You're welcome! Is there anything else I can help you with?";
            } else if (sentiment === 'positive') {
                response = "I'm glad to hear that! Is there anything specific you'd like to talk about?";
            } else if (sentiment === 'negative') {
                response = "I'm sorry to hear that. Would you like to talk more about what's bothering you?";
            } else {
                response = "That's interesting. Tell me more about your thoughts on this.";
            }
            
            // Add system message
            this.addSystemMessage(response, true);
            
            // Store in memory
            if (this.contextualMemorySystem) {
                this.contextualMemorySystem.storeInteraction({
                    user: message,
                    system: response,
                    timestamp: new Date(),
                    sentiment
                });
            }
            
            // Generate suggestions based on conversation
            this.generateSuggestions(message, response);
        }, 1000 + Math.random() * 1000); // Random delay for realism
    }
    
    /**
     * Analyze sentiment
     * @param {string} message - User message
     * @returns {string} Sentiment (positive, negative, neutral)
     */
    analyzeSentiment(message) {
        // Simple sentiment analysis
        const positiveWords = ['good', 'great', 'excellent', 'amazing', 'happy', 'love', 'like', 'thanks', 'thank', 'awesome', 'wonderful'];
        const negativeWords = ['bad', 'terrible', 'awful', 'sad', 'hate', 'dislike', 'sorry', 'unfortunate', 'disappointed', 'angry', 'upset'];
        
        const lowerMessage = message.toLowerCase();
        
        let positiveScore = 0;
        let negativeScore = 0;
        
        positiveWords.forEach(word => {
            if (lowerMessage.includes(word)) {
                positiveScore++;
            }
        });
        
        negativeWords.forEach(word => {
            if (lowerMessage.includes(word)) {
                negativeScore++;
            }
        });
        
        if (positiveScore > negativeScore) {
            return 'positive';
        } else if (negativeScore > positiveScore) {
            return 'negative';
        } else {
            return 'neutral';
        }
    }
    
    /**
     * Generate suggestions
     * @param {string} userMessage - User message
     * @param {string} systemResponse - System response
     */
    generateSuggestions(userMessage, systemResponse) {
        // Generate suggestions based on conversation
        const suggestions = [];
        
        // Add suggestions based on user message
        if (userMessage.toLowerCase().includes('help')) {
            suggestions.push('Show me available commands');
            suggestions.push('What can you do?');
        } else if (userMessage.toLowerCase().includes('weather')) {
            suggestions.push('What\'s the weather like tomorrow?');
            suggestions.push('Will it rain this weekend?');
        } else if (userMessage.toLowerCase().includes('music')) {
            suggestions.push('What music do you recommend?');
            suggestions.push('Play some relaxing music');
        } else {
            // Default suggestions
            suggestions.push('Tell me more about MeAI');
            suggestions.push('How can you help me?');
            suggestions.push('What features do you have?');
        }
        
        // Store suggestions
        this.state.currentSuggestions = suggestions;
        
        // Show suggestions
        this.showSuggestions(suggestions);
    }
    
    /**
     * Show suggestions
     * @param {Array} suggestions - Suggestion list
     */
    showSuggestions(suggestions) {
        // Check if suggestions container exists
        let suggestionsContainer = document.getElementById('suggestions-container');
        
        if (!suggestionsContainer) {
            // Create container
            suggestionsContainer = document.createElement('div');
            suggestionsContainer.id = 'suggestions-container';
            suggestionsContainer.className = 'suggestions-container';
            
            // Add to input area
            const inputArea = document.querySelector('.input-area');
            if (inputArea) {
                inputArea.parentNode.insertBefore(suggestionsContainer, inputArea);
            }
        }
        
        // Clear existing suggestions
        suggestionsContainer.innerHTML = '';
        
        // Add suggestions
        suggestions.forEach(suggestion => {
            const suggestionButton = document.createElement('button');
            suggestionButton.className = 'suggestion-button';
            suggestionButton.textContent = suggestion;
            
            suggestionButton.addEventListener('click', () => {
                // Set input value
                const userInput = document.getElementById('user-input');
                if (userInput) {
                    userInput.value = suggestion;
                    
                    // Send message
                    this.sendUserMessage();
                }
                
                // Hide suggestions
                this.hideSuggestions();
            });
            
            suggestionsContainer.appendChild(suggestionButton);
        });
        
        // Show container
        suggestionsContainer.classList.add('visible');
    }
    
    /**
     * Hide suggestions
     */
    hideSuggestions() {
        const suggestionsContainer = document.getElementById('suggestions-container');
        if (suggestionsContainer) {
            suggestionsContainer.classList.remove('visible');
        }
    }
    
    /**
     * Clear conversation
     */
    clearConversation() {
        const conversationHistory = document.querySelector('.conversation-history');
        if (conversationHistory) {
            // Clear conversation
            conversationHistory.innerHTML = '';
            
            // Add system message
            this.addSystemMessage('Conversation cleared.');
            
            // Play sound
            this.eventSystem.publish('play-interaction-sound', { sound: 'clear' });
            
            // Show notification
            if (this.enhancedInterfaceSystem) {
                this.enhancedInterfaceSystem.showNotification(
                    'Conversation cleared', 
                    'info'
                );
            }
        }
    }
    
    /**
     * Change theme
     * @param {string} theme - Theme name
     */
    changeTheme(theme) {
        // Publish theme change event
        this.eventSystem.publish('theme-change', { theme });
        
        // Add system message
        this.addSystemMessage(`Theme changed to ${theme}.`);
        
        // Play sound
        this.eventSystem.publish('play-interaction-sound', { sound: 'theme-change' });
        
        // Show notification
        if (this.enhancedInterfaceSystem) {
            this.enhancedInterfaceSystem.showNotification(
                `Theme changed to ${theme}`, 
                'success'
            );
        }
    }
    
    /**
     * Show help
     */
    showHelp() {
        const helpMessage = `
Available commands:
- /clear - Clear the conversation
- /theme [name] - Change the theme (e.g., /theme dark)
- /help - Show this help message
- /export - Export the conversation
- /settings - Open settings panel
- /emotion [name] - Change emotional state (e.g., /emotion happy)

You can also use voice input by clicking the microphone button.
        `.trim();
        
        // Add system message
        this.addSystemMessage(helpMessage);
    }
    
    /**
     * Export conversation
     */
    exportConversation() {
        const conversationHistory = document.querySelector('.conversation-history');
        if (!conversationHistory) return;
        
        // Get all messages
        const messages = [];
        const messageElements = conversationHistory.querySelectorAll('.message');
        
        messageElements.forEach(element => {
            const isUser = element.classList.contains('user-message');
            const text = element.childNodes[0].textContent.trim();
            const timestamp = element.querySelector('.message-timestamp')?.textContent || '';
            
            messages.push({
                sender: isUser ? 'User' : 'MeAI',
                text,
                timestamp
            });
        });
        
        // Create export data
        const exportData = {
            conversation: messages,
            exportDate: new Date().toISOString(),
            version: '3.0.0'
        };
        
        // Convert to JSON
        const jsonData = JSON.stringify(exportData, null, 2);
        
        // Create download link
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `meai-conversation-${new Date().toISOString().slice(0, 10)}.json`;
        
        // Trigger download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Add system message
        this.addSystemMessage('Conversation exported successfully.');
        
        // Play sound
        this.eventSystem.publish('play-interaction-sound', { sound: 'export' });
        
        // Show notification
        if (this.enhancedInterfaceSystem) {
            this.enhancedInterfaceSystem.showNotification(
                'Conversation exported successfully', 
                'success'
            );
        }
    }
    
    /**
     * Open settings
     */
    openSettings() {
        // Change view to settings
        if (this.enhancedInterfaceSystem) {
            this.enhancedInterfaceSystem.setActiveView('settings');
            
            // Show notification
            this.enhancedInterfaceSystem.showNotification(
                'Settings panel opened', 
                'info'
            );
        } else {
            // Add system message
            this.addSystemMessage('Settings panel is not available.');
        }
    }
    
    /**
     * Change emotion
     * @param {string} emotion - Emotion name
     */
    changeEmotion(emotion) {
        // Validate emotion
        const validEmotions = ['joy', 'reflective', 'curious', 'excited', 'empathetic', 'calm', 'neutral'];
        
        if (!validEmotions.includes(emotion.toLowerCase())) {
            // Add system message
            this.addSystemMessage(`Invalid emotion. Valid emotions are: ${validEmotions.join(', ')}`);
            return;
        }
        
        // Publish emotion change event
        this.eventSystem.publish('set-emotional-state', { state: emotion.toLowerCase() });
        
        // Add system message
        this.addSystemMessage(`Emotional state changed to ${emotion}.`);
        
        // Play sound
        this.eventSystem.publish('play-interaction-sound', { sound: 'emotion-change' });
        
        // Show notification
        if (this.enhancedInterfaceSystem) {
            this.enhancedInterfaceSystem.showNotification(
                `Emotional state changed to ${emotion}`, 
                'success'
            );
        }
    }
    
    /**
     * Start idle checker
     */
    startIdleChecker() {
        // Clear existing interval
        if (this.state.idleCheckInterval) {
            clearInterval(this.state.idleCheckInterval);
        }
        
        // Set up interval
        this.state.idleCheckInterval = setInterval(() => {
            const now = Date.now();
            const idleTime = now - this.state.lastInteraction;
            
            if (idleTime >= this.state.idleTimeout) {
                // User is idle
                this.handleUserIdle();
            }
        }, 60000); // Check every minute
    }
    
    /**
     * Handle user idle
     */
    handleUserIdle() {
        // Add system message suggesting interaction
        this.addSystemMessage("I noticed you've been quiet for a while. Is there anything I can help you with?");
        
        // Play sound
        this.eventSystem.publish('play-interaction-sound', { sound: 'idle-reminder' });
        
        // Reset idle timer
        this.state.lastInteraction = Date.now();
    }
    
    /**
     * Initialize drag and drop
     */
    initializeDragAndDrop() {
        // Set up file drop zone
        const dropZone = document.querySelector('.conversation-area');
        if (!dropZone) return;
        
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        // Highlight drop zone when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, unhighlight, false);
        });
        
        function highlight() {
            dropZone.classList.add('drag-highlight');
        }
        
        function unhighlight() {
            dropZone.classList.remove('drag-highlight');
        }
        
        // Handle dropped files
        dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            
            if (files.length) {
                this.handleDroppedFiles(files);
            }
        });
    }
    
    /**
     * Handle dropped files
     * @param {FileList} files - Dropped files
     */
    handleDroppedFiles(files) {
        // Process each file
        Array.from(files).forEach(file => {
            // Check file type
            if (file.type.startsWith('image/')) {
                // Handle image
                this.handleDroppedImage(file);
            } else if (file.type === 'application/json') {
                // Handle JSON (possibly exported conversation)
                this.handleDroppedJson(file);
            } else if (file.type === 'text/plain') {
                // Handle text
                this.handleDroppedText(file);
            } else {
                // Unsupported file type
                if (this.enhancedInterfaceSystem) {
                    this.enhancedInterfaceSystem.showNotification(
                        `Unsupported file type: ${file.type}`, 
                        'warning'
                    );
                }
            }
        });
    }
    
    /**
     * Handle dropped image
     * @param {File} file - Image file
     */
    handleDroppedImage(file) {
        // Create file reader
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const imageUrl = e.target.result;
            
            // Add system message
            this.addSystemMessage(`Image received: ${file.name}`);
            
            // Show image preview
            this.showImagePreview(imageUrl, file.name);
            
            // Play sound
            this.eventSystem.publish('play-interaction-sound', { sound: 'file-received' });
        };
        
        reader.readAsDataURL(file);
    }
    
    /**
     * Show image preview
     * @param {string} imageUrl - Image URL
     * @param {string} fileName - File name
     */
    showImagePreview(imageUrl, fileName) {
        const conversationHistory = document.querySelector('.conversation-history');
        if (!conversationHistory) return;
        
        // Create preview element
        const previewElement = document.createElement('div');
        previewElement.className = 'message user-message image-preview';
        
        // Add image
        const image = document.createElement('img');
        image.src = imageUrl;
        image.alt = fileName;
        image.className = 'preview-image';
        
        // Add file name
        const fileNameElement = document.createElement('div');
        fileNameElement.className = 'file-name';
        fileNameElement.textContent = fileName;
        
        // Add timestamp
        const timestamp = document.createElement('div');
        timestamp.className = 'message-timestamp';
        timestamp.textContent = this.formatTime(new Date());
        
        // Assemble preview
        previewElement.appendChild(image);
        previewElement.appendChild(fileNameElement);
        previewElement.appendChild(timestamp);
        
        // Add to conversation
        conversationHistory.appendChild(previewElement);
        
        // Scroll to bottom
        conversationHistory.scrollTop = conversationHistory.scrollHeight;
    }
    
    /**
     * Handle dropped JSON
     * @param {File} file - JSON file
     */
    handleDroppedJson(file) {
        // Create file reader
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Check if it's a conversation export
                if (data.conversation && Array.isArray(data.conversation)) {
                    // Import conversation
                    this.importConversation(data);
                } else {
                    // Just show the JSON data
                    this.addUserMessage(`Shared JSON data: ${file.name}`);
                }
                
                // Play sound
                this.eventSystem.publish('play-interaction-sound', { sound: 'file-received' });
            } catch (error) {
                console.error('Error parsing JSON:', error);
                
                // Show error notification
                if (this.enhancedInterfaceSystem) {
                    this.enhancedInterfaceSystem.showNotification(
                        'Error parsing JSON file', 
                        'error'
                    );
                }
            }
        };
        
        reader.readAsText(file);
    }
    
    /**
     * Import conversation
     * @param {Object} data - Conversation data
     */
    importConversation(data) {
        // Ask for confirmation
        if (confirm('Import this conversation? This will replace your current conversation.')) {
            // Clear current conversation
            this.clearConversation();
            
            // Add each message
            data.conversation.forEach(message => {
                if (message.sender === 'User') {
                    this.addUserMessage(message.text);
                } else {
                    this.addSystemMessage(message.text);
                }
            });
            
            // Add system message
            this.addSystemMessage('Conversation imported successfully.');
            
            // Show notification
            if (this.enhancedInterfaceSystem) {
                this.enhancedInterfaceSystem.showNotification(
                    'Conversation imported successfully', 
                    'success'
                );
            }
        }
    }
    
    /**
     * Handle dropped text
     * @param {File} file - Text file
     */
    handleDroppedText(file) {
        // Create file reader
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const text = e.target.result;
            
            // Add user message with text
            this.addUserMessage(text.length > 500 ? text.substring(0, 500) + '...' : text);
            
            // Process message
            this.processUserMessage(text);
            
            // Play sound
            this.eventSystem.publish('play-interaction-sound', { sound: 'file-received' });
        };
        
        reader.readAsText(file);
    }
    
    /**
     * Format time
     * @param {Date} date - Date object
     * @returns {string} Formatted time
     */
    formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    /**
     * Resize textarea
     * @param {HTMLTextAreaElement} textarea - Textarea element
     */
    resizeTextarea(textarea) {
        // Reset height
        textarea.style.height = 'auto';
        
        // Set new height based on content
        const newHeight = Math.min(textarea.scrollHeight, 120);
        textarea.style.height = `${newHeight}px`;
    }
    
    /**
     * Record interaction
     * @param {string} type - Interaction type
     * @param {Object} data - Interaction data
     */
    recordInteraction(type, data = {}) {
        // Update last interaction time
        this.state.lastInteraction = Date.now();
        
        // Add to interaction history
        this.state.interactionHistory.push({
            type,
            data,
            timestamp: new Date()
        });
        
        // Limit history size
        if (this.state.interactionHistory.length > 100) {
            this.state.interactionHistory.shift();
        }
        
        // Update interaction patterns if adaptive mode is enabled
        if (this.state.adaptiveMode) {
            this.updateInteractionPatterns(type, data);
        }
    }
    
    /**
     * Update interaction patterns
     * @param {string} type - Interaction type
     * @param {Object} data - Interaction data
     */
    updateInteractionPatterns(type, data) {
        // Initialize pattern if it doesn't exist
        if (!this.state.interactionPatterns[type]) {
            this.state.interactionPatterns[type] = {
                count: 0,
                frequency: 0,
                lastUsed: null,
                data: []
            };
        }
        
        const pattern = this.state.interactionPatterns[type];
        
        // Update pattern
        pattern.count++;
        pattern.lastUsed = new Date();
        pattern.data.push(data);
        
        // Limit data size
        if (pattern.data.length > 10) {
            pattern.data.shift();
        }
        
        // Calculate frequency (interactions per hour)
        const oldestInteraction = this.state.interactionHistory[0];
        if (oldestInteraction) {
            const hoursSinceOldest = (Date.now() - new Date(oldestInteraction.timestamp).getTime()) / (1000 * 60 * 60);
            pattern.frequency = pattern.count / hoursSinceOldest;
        }
        
        // Save patterns
        this.saveInteractionPatterns();
    }
    
    /**
     * Save interaction patterns
     */
    async saveInteractionPatterns() {
        try {
            await this.storageManager.setIndexedDB('interaction-patterns', 'patterns', this.state.interactionPatterns);
        } catch (error) {
            console.error('Error saving interaction patterns:', error);
        }
    }
    
    /**
     * Load interaction patterns
     */
    async loadInteractionPatterns() {
        try {
            const patterns = await this.storageManager.getIndexedDB('interaction-patterns', 'patterns');
            if (patterns) {
                this.state.interactionPatterns = patterns;
            }
        } catch (error) {
            console.error('Error loading interaction patterns:', error);
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for user input events
        this.eventSystem.subscribe('send-message', (data) => {
            if (data.message) {
                // Set input value
                const userInput = document.getElementById('user-input');
                if (userInput) {
                    userInput.value = data.message;
                }
                
                // Send message
                this.sendUserMessage();
            }
        });
        
        // Listen for voice input requests
        this.eventSystem.subscribe('start-voice-input', () => {
            this.startVoiceInput();
        });
        
        // Listen for clear conversation requests
        this.eventSystem.subscribe('clear-conversation', () => {
            this.clearConversation();
        });
        
        // Listen for theme change requests
        this.eventSystem.subscribe('theme-change', (data) => {
            if (data.theme) {
                this.changeTheme(data.theme);
            }
        });
        
        // Listen for export conversation requests
        this.eventSystem.subscribe('export-conversation', () => {
            this.exportConversation();
        });
        
        // Listen for user activity
        this.eventSystem.subscribe('user-activity', () => {
            this.state.lastInteraction = Date.now();
        });
        
        // Set up DOM event listeners
        document.addEventListener('DOMContentLoaded', () => {
            // Send button
            const sendButton = document.getElementById('send-button');
            if (sendButton) {
                sendButton.addEventListener('click', () => {
                    this.sendUserMessage();
                });
            }
            
            // User input (Enter key)
            const userInput = document.getElementById('user-input');
            if (userInput) {
                // Handle input events
                userInput.addEventListener('keypress', (e) => {
                    // Record interaction
                    this.recordInteraction('input-keypress');
                    
                    // Check for Enter key
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        this.sendUserMessage();
                    }
                });
                
                // Handle input changes for textarea resizing
                userInput.addEventListener('input', () => {
                    // Record interaction
                    this.recordInteraction('input-change');
                    
                    // Resize if it's a textarea
                    if (userInput.tagName.toLowerCase() === 'textarea') {
                        this.resizeTextarea(userInput);
                    }
                });
                
                // Handle focus
                userInput.addEventListener('focus', () => {
                    // Record interaction
                    this.recordInteraction('input-focus');
                });
            }
            
            // Voice input button
            const voiceInputButton = document.getElementById('voice-input-button');
            if (voiceInputButton) {
                voiceInputButton.addEventListener('click', () => {
                    this.startVoiceInput();
                    
                    // Record interaction
                    this.recordInteraction('voice-input-button');
                });
            }
            
            // Attachment button
            const attachmentButton = document.getElementById('attachment-button');
            if (attachmentButton) {
                attachmentButton.addEventListener('click', () => {
                    // Create file input
                    const fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.accept = 'image/*,application/json,text/plain';
                    fileInput.multiple = true;
                    
                    // Handle file selection
                    fileInput.addEventListener('change', () => {
                        if (fileInput.files.length) {
                            this.handleDroppedFiles(fileInput.files);
                        }
                    });
                    
                    // Trigger file selection
                    fileInput.click();
                    
                    // Record interaction
                    this.recordInteraction('attachment-button');
                });
            }
            
            // Emoji button
            const emojiButton = document.getElementById('emoji-button');
            if (emojiButton) {
                emojiButton.addEventListener('click', () => {
                    // Show emoji picker (simplified)
                    alert('Emoji picker would appear here');
                    
                    // Record interaction
                    this.recordInteraction('emoji-button');
                });
            }
            
            // Clear conversation button
            const clearConversationButton = document.getElementById('clear-conversation');
            if (clearConversationButton) {
                clearConversationButton.addEventListener('click', () => {
                    this.clearConversation();
                    
                    // Record interaction
                    this.recordInteraction('clear-conversation-button');
                });
            }
            
            // Export conversation button
            const exportConversationButton = document.getElementById('export-conversation');
            if (exportConversationButton) {
                exportConversationButton.addEventListener('click', () => {
                    this.exportConversation();
                    
                    // Record interaction
                    this.recordInteraction('export-conversation-button');
                });
            }
            
            // Search button
            const searchButton = document.querySelector('.search-button');
            if (searchButton) {
                searchButton.addEventListener('click', () => {
                    const searchInput = document.getElementById('conversation-search');
                    if (searchInput && searchInput.value.trim()) {
                        this.searchConversation(searchInput.value.trim());
                    }
                    
                    // Record interaction
                    this.recordInteraction('search-button');
                });
            }
            
            // Search input
            const searchInput = document.getElementById('conversation-search');
            if (searchInput) {
                searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.searchConversation(searchInput.value.trim());
                        
                        // Record interaction
                        this.recordInteraction('search-input-enter');
                    }
                });
            }
            
            // Track user activity
            ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(eventType => {
                document.addEventListener(eventType, () => {
                    this.state.lastInteraction = Date.now();
                    
                    // Publish user activity event
                    this.eventSystem.publish('user-activity');
                });
            });
            
            // Set up keyboard shortcuts if enabled
            if (this.state.keyboardShortcutsEnabled) {
                this.setupKeyboardShortcuts();
            }
        });
    }
    
    /**
     * Search conversation
     * @param {string} query - Search query
     */
    searchConversation(query) {
        if (!query) return;
        
        const conversationHistory = document.querySelector('.conversation-history');
        if (!conversationHistory) return;
        
        // Get all messages
        const messages = conversationHistory.querySelectorAll('.message');
        
        // Clear previous highlights
        messages.forEach(message => {
            message.classList.remove('search-highlight');
            
            // Restore original text
            const originalText = message.getAttribute('data-original-text');
            if (originalText) {
                message.childNodes[0].textContent = originalText;
                message.removeAttribute('data-original-text');
            }
        });
        
        // Count matches
        let matchCount = 0;
        let firstMatch = null;
        
        // Search and highlight
        messages.forEach(message => {
            const text = message.childNodes[0].textContent;
            
            if (text.toLowerCase().includes(query.toLowerCase())) {
                // Highlight message
                message.classList.add('search-highlight');
                matchCount++;
                
                // Store first match
                if (!firstMatch) {
                    firstMatch = message;
                }
                
                // Store original text
                message.setAttribute('data-original-text', text);
                
                // Highlight matching text
                const highlightedText = text.replace(
                    new RegExp(query, 'gi'),
                    match => `<span class="search-match">${match}</span>`
                );
                
                // Replace text with highlighted version
                message.childNodes[0].innerHTML = highlightedText;
            }
        });
        
        // Scroll to first match
        if (firstMatch) {
            firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // Show notification
        if (this.enhancedInterfaceSystem) {
            this.enhancedInterfaceSystem.showNotification(
                `Found ${matchCount} matches for "${query}"`, 
                matchCount > 0 ? 'success' : 'info'
            );
        }
    }
    
    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Check if target is input or textarea
            const isInputActive = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
            
            // Global shortcuts (work even when input is focused)
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'Enter':
                        // Ctrl+Enter to send message
                        if (isInputActive) {
                            e.preventDefault();
                            this.sendUserMessage();
                            
                            // Record interaction
                            this.recordInteraction('keyboard-shortcut', { shortcut: 'ctrl+enter' });
                        }
                        break;
                        
                    case 'l':
                        // Ctrl+L to clear conversation
                        e.preventDefault();
                        this.clearConversation();
                        
                        // Record interaction
                        this.recordInteraction('keyboard-shortcut', { shortcut: 'ctrl+l' });
                        break;
                        
                    case 'e':
                        // Ctrl+E to export conversation
                        e.preventDefault();
                        this.exportConversation();
                        
                        // Record interaction
                        this.recordInteraction('keyboard-shortcut', { shortcut: 'ctrl+e' });
                        break;
                        
                    case 'f':
                        // Ctrl+F to focus search
                        e.preventDefault();
                        const searchInput = document.getElementById('conversation-search');
                        if (searchInput) {
                            searchInput.focus();
                        }
                        
                        // Record interaction
                        this.recordInteraction('keyboard-shortcut', { shortcut: 'ctrl+f' });
                        break;
                }
            }
            
            // Shortcuts that only work when input is not focused
            if (!isInputActive) {
                switch (e.key) {
                    case '/':
                        // / to focus input
                        e.preventDefault();
                        const userInput = document.getElementById('user-input');
                        if (userInput) {
                            userInput.focus();
                        }
                        
                        // Record interaction
                        this.recordInteraction('keyboard-shortcut', { shortcut: '/' });
                        break;
                        
                    case 'm':
                        // M to toggle voice input
                        e.preventDefault();
                        this.startVoiceInput();
                        
                        // Record interaction
                        this.recordInteraction('keyboard-shortcut', { shortcut: 'm' });
                        break;
                        
                    case 'Escape':
                        // Escape to close any open panels
                        if (this.enhancedInterfaceSystem) {
                            this.enhancedInterfaceSystem.hideContextMenu();
                            this.enhancedInterfaceSystem.hideTooltip();
                        }
                        
                        // Record interaction
                        this.recordInteraction('keyboard-shortcut', { shortcut: 'escape' });
                        break;
                }
            }
        });
    }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserInteractionController;
} else {
    window.UserInteractionController = UserInteractionController;
}
