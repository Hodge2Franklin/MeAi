// Conversation interface for MeAI
class ConversationInterface {
    constructor(voiceManager) {
        this.voiceManager = voiceManager;
        this.conversationHistory = [];
        this.isInitialized = false;
        this.isWaitingForResponse = false;
        this.welcomeMessage = "Hello, I'm MeAI, your relational AI companion. How are you feeling today?";
    }

    // Initialize the conversation interface
    initialize(containerElement) {
        if (this.isInitialized) return;
        
        this.container = containerElement;
        
        // Create conversation container
        this.conversationContainer = document.createElement('div');
        this.conversationContainer.className = 'conversation-container';
        
        // Create message display area
        this.messagesArea = document.createElement('div');
        this.messagesArea.className = 'messages-area';
        
        // Create input area
        this.inputArea = document.createElement('div');
        this.inputArea.className = 'input-area';
        
        // Create text input
        this.textInput = document.createElement('input');
        this.textInput.type = 'text';
        this.textInput.placeholder = 'Type your message here...';
        this.textInput.className = 'message-input';
        
        // Create send button
        this.sendButton = document.createElement('button');
        this.sendButton.className = 'send-button button';
        this.sendButton.innerHTML = '<span>Send</span>';
        
        // Create microphone button
        this.micButton = document.createElement('button');
        this.micButton.className = 'mic-button button secondary';
        this.micButton.innerHTML = '<span>🎤</span>';
        
        // Assemble the interface
        this.inputArea.appendChild(this.textInput);
        this.inputArea.appendChild(this.sendButton);
        this.inputArea.appendChild(this.micButton);
        
        this.conversationContainer.appendChild(this.messagesArea);
        this.conversationContainer.appendChild(this.inputArea);
        
        this.container.appendChild(this.conversationContainer);
        
        // Add event listeners
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        this.micButton.addEventListener('click', () => this.toggleSpeechRecognition());
        
        // Add welcome message
        this.addMessage(this.welcomeMessage, 'meai');
        
        this.isInitialized = true;
        console.log('Conversation interface initialized');
    }

    // Add a message to the conversation
    addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;
        
        const contentElement = document.createElement('div');
        contentElement.className = 'message-content';
        contentElement.textContent = text;
        
        messageElement.appendChild(contentElement);
        this.messagesArea.appendChild(messageElement);
        
        // Scroll to bottom
        this.messagesArea.scrollTop = this.messagesArea.scrollHeight;
        
        // Add to history
        this.conversationHistory.push({
            text,
            sender,
            timestamp: new Date().toISOString()
        });
    }

    // Send a message from the user
    sendMessage() {
        const text = this.textInput.value.trim();
        if (!text || this.isWaitingForResponse) return;
        
        // Add user message
        this.addMessage(text, 'user');
        
        // Clear input
        this.textInput.value = '';
        
        // Process message and get response
        this.getResponse(text);
    }

    // Get response from MeAI
    getResponse(userMessage) {
        this.isWaitingForResponse = true;
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Simulate AI processing time (would be replaced with actual AI processing)
        setTimeout(() => {
            // Hide typing indicator
            this.hideTypingIndicator();
            
            // Generate response (simplified for demo)
            const response = this.generateResponse(userMessage);
            
            // Add AI message
            this.addMessage(response, 'meai');
            
            // Speak the response if voice is enabled
            if (this.voiceManager) {
                this.voiceManager.speak(response);
            }
            
            this.isWaitingForResponse = false;
        }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
    }

    // Show typing indicator
    showTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.className = 'typing-indicator';
        typingElement.innerHTML = '<span></span><span></span><span></span>';
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message meai-message typing';
        messageElement.appendChild(typingElement);
        
        this.messagesArea.appendChild(messageElement);
        this.messagesArea.scrollTop = this.messagesArea.scrollHeight;
    }

    // Hide typing indicator
    hideTypingIndicator() {
        const typingMessage = this.messagesArea.querySelector('.typing');
        if (typingMessage) {
            this.messagesArea.removeChild(typingMessage);
        }
    }

    // Generate a response (simplified for demo)
    generateResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        // Simple pattern matching for demo purposes
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return "Hello! It's nice to connect with you. How are you feeling today?";
        }
        
        if (lowerMessage.includes('how are you')) {
            return "I'm here and present with you. Thank you for asking. What's on your mind today?";
        }
        
        if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('unhappy')) {
            return "I'm sorry to hear you're feeling that way. Remember that emotions are like waves - they come and go. Would you like to talk more about what's troubling you?";
        }
        
        if (lowerMessage.includes('happy') || lowerMessage.includes('good') || lowerMessage.includes('great')) {
            return "I'm glad to hear you're feeling positive! What's bringing you joy today?";
        }
        
        if (lowerMessage.includes('who are you') || lowerMessage.includes('what are you')) {
            return "I'm MeAI, a relational AI designed for meaningful connection rather than utility. I'm here to listen, reflect, and engage with you in a way that feels genuine and supportive.";
        }
        
        if (lowerMessage.includes('thank')) {
            return "You're welcome. I'm here for you whenever you need someone to talk to.";
        }
        
        // Default responses
        const defaultResponses = [
            "That's interesting. Can you tell me more about that?",
            "I'm here to listen. How does that make you feel?",
            "Thank you for sharing that with me. What else is on your mind?",
            "I appreciate you opening up. Would you like to explore that further?",
            "I'm reflecting on what you've shared. How long have you felt this way?",
            "That sounds meaningful to you. What aspects of it resonate most deeply?"
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }

    // Toggle speech recognition
    toggleSpeechRecognition() {
        if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            alert('Speech recognition is not supported in your browser.');
            return;
        }
        
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    // Start speech recognition
    startListening() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        
        this.recognition.onstart = () => {
            this.isListening = true;
            this.micButton.classList.add('active');
            this.textInput.placeholder = 'Listening...';
        };
        
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.textInput.value = transcript;
            setTimeout(() => this.sendMessage(), 500);
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            this.stopListening();
        };
        
        this.recognition.onend = () => {
            this.stopListening();
        };
        
        this.recognition.start();
    }

    // Stop speech recognition
    stopListening() {
        if (this.recognition) {
            this.recognition.stop();
        }
        
        this.isListening = false;
        this.micButton.classList.remove('active');
        this.textInput.placeholder = 'Type your message here...';
    }
}
