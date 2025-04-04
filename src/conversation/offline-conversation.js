/**
 * Offline Conversation System for MeAI
 * 
 * This module provides offline conversation capabilities,
 * allowing users to continue conversations without an internet connection.
 */

import { eventSystem } from '../utils/event-system.js';
import offlineSupport from '../utils/offline-support.js';

class OfflineConversation {
    constructor() {
        // State
        this.isOfflineMode = !navigator.onLine;
        this.pendingMessages = [];
        this.currentConversationId = null;
        this.offlineResponses = null;
        
        // Initialize event listeners
        this.setupEventListeners();
        
        // Load offline response templates
        this.loadOfflineResponseTemplates();
    }
    
    /**
     * Initialize the offline conversation system
     */
    async init() {
        console.log('Initializing Offline Conversation System');
        
        // Load any pending messages
        await this.loadPendingMessages();
        
        // Check if we have a current conversation
        this.currentConversationId = localStorage.getItem('meai-current-conversation-id');
        
        console.log('Offline Conversation System initialized');
        
        // Publish initialization event
        eventSystem.publish('offline-conversation-initialized', {
            isOfflineMode: this.isOfflineMode,
            pendingMessages: this.pendingMessages.length,
            currentConversationId: this.currentConversationId
        });
        
        return true;
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for online/offline events
        eventSystem.subscribe('online-status-changed', (data) => {
            this.handleOnlineStatusChange(data.isOnline);
        });
        
        // Listen for message events
        eventSystem.subscribe('message-sent', (data) => {
            if (!navigator.onLine) {
                this.handleOfflineMessage(data.message);
            }
        });
        
        // Listen for conversation change events
        eventSystem.subscribe('conversation-changed', (data) => {
            this.currentConversationId = data.conversationId;
            localStorage.setItem('meai-current-conversation-id', data.conversationId);
        });
        
        // Listen for sync complete events
        eventSystem.subscribe('offline-sync-complete', () => {
            this.handleSyncComplete();
        });
    }
    
    /**
     * Load offline response templates
     */
    loadOfflineResponseTemplates() {
        // These templates are used to generate contextually appropriate
        // responses when the user is offline
        this.offlineResponses = {
            greeting: [
                "Hello! I'm currently in offline mode, but I can still help with basic tasks.",
                "Hi there! I'm operating offline right now, but I'm still here to assist you.",
                "Welcome! I'm in offline mode, but I can still chat with you."
            ],
            acknowledgment: [
                "I've received your message and will process it when we're back online.",
                "Got it! I'll remember this and respond properly when we reconnect.",
                "Message received. I'll sync this conversation when we're online again."
            ],
            apology: [
                "I apologize, but this feature requires an internet connection. I'll save your request for when we're back online.",
                "Sorry, I can't perform this action while offline. I'll remember your request for later.",
                "I'm sorry, but I need to be online to do that. I've saved your request for when connectivity is restored."
            ],
            smalltalk: [
                "Even though we're offline, we can still have a conversation. How are you doing?",
                "While we wait for connectivity, we can still chat. What's on your mind?",
                "Offline mode doesn't mean we can't talk! How's your day going?"
            ],
            help: [
                "While offline, I can still help with basic conversations, show your conversation history, and adjust interface settings. What would you like to do?",
                "In offline mode, I can chat with you, show previous conversations, and change appearance settings. How can I help?",
                "Even offline, I can assist with simple conversations, access your saved history, and modify interface preferences. What do you need?"
            ]
        };
    }
    
    /**
     * Handle online status change
     * @param {boolean} isOnline - Whether the device is online
     */
    handleOnlineStatusChange(isOnline) {
        this.isOfflineMode = !isOnline;
        
        if (isOnline && this.pendingMessages.length > 0) {
            // We're back online and have pending messages
            this.syncPendingMessages();
        }
    }
    
    /**
     * Handle offline message
     * @param {Object} message - User message
     */
    async handleOfflineMessage(message) {
        console.log('Handling offline message:', message);
        
        // Store the message for later syncing
        await this.storeOfflineMessage(message);
        
        // Generate an offline response
        const response = this.generateOfflineResponse(message);
        
        // Add to current conversation
        if (this.currentConversationId) {
            const conversation = await offlineSupport.getOfflineConversation(this.currentConversationId) || {
                id: this.currentConversationId,
                messages: []
            };
            
            // Add user message
            conversation.messages.push({
                role: 'user',
                content: message.content,
                timestamp: message.timestamp || new Date().toISOString()
            });
            
            // Add AI response
            conversation.messages.push({
                role: 'assistant',
                content: response.content,
                timestamp: new Date().toISOString(),
                offline: true
            });
            
            // Update timestamp
            conversation.timestamp = new Date().toISOString();
            
            // Save updated conversation
            await offlineSupport.saveOfflineConversation(conversation);
        }
        
        // Publish response event
        eventSystem.publish('message-received', {
            message: response,
            offline: true
        });
    }
    
    /**
     * Generate offline response based on user message
     * @param {Object} message - User message
     * @returns {Object} AI response
     */
    generateOfflineResponse(message) {
        const content = message.content.toLowerCase();
        let responseType = 'acknowledgment';
        
        // Determine response type based on message content
        if (content.includes('hello') || content.includes('hi ') || content.includes('hey') || content.match(/^hi$/)) {
            responseType = 'greeting';
        } else if (content.includes('help') || content.includes('what can you do') || content.includes('how do i')) {
            responseType = 'help';
        } else if (content.includes('how are you') || content.includes('what\'s up') || content.includes('how\'s it going')) {
            responseType = 'smalltalk';
        } else if (
            content.includes('search') || 
            content.includes('find') || 
            content.includes('show me') || 
            content.includes('look up') ||
            content.includes('analyze') ||
            content.includes('process')
        ) {
            responseType = 'apology';
        }
        
        // Get random response of the determined type
        const responses = this.offlineResponses[responseType];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        // Add offline indicator
        const offlineIndicator = "[OFFLINE MODE] ";
        
        return {
            id: 'offline_' + Date.now(),
            role: 'assistant',
            content: offlineIndicator + randomResponse,
            timestamp: new Date().toISOString(),
            offline: true
        };
    }
    
    /**
     * Store offline message for later syncing
     * @param {Object} message - Message to store
     */
    async storeOfflineMessage(message) {
        try {
            // Generate ID if not present
            if (!message.id) {
                message.id = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            }
            
            // Add timestamp if not present
            if (!message.timestamp) {
                message.timestamp = new Date().toISOString();
            }
            
            // Add to pending messages
            this.pendingMessages.push(message);
            
            // Store in IndexedDB
            await offlineSupport.storeOfflineMessage(message);
            
            console.log('Stored offline message for later syncing:', message.id);
            return true;
        } catch (error) {
            console.error('Error storing offline message:', error);
            return false;
        }
    }
    
    /**
     * Load pending messages from storage
     */
    async loadPendingMessages() {
        try {
            // Get pending messages from offline support
            const offlineData = await offlineSupport.loadPendingOfflineData();
            this.pendingMessages = offlineData.messages || [];
            
            console.log('Loaded pending messages:', this.pendingMessages.length);
            return this.pendingMessages;
        } catch (error) {
            console.error('Error loading pending messages:', error);
            return [];
        }
    }
    
    /**
     * Sync pending messages when back online
     */
    async syncPendingMessages() {
        if (this.pendingMessages.length === 0) {
            console.log('No pending messages to sync');
            return true;
        }
        
        console.log('Syncing pending messages:', this.pendingMessages.length);
        
        // Use offline support to sync messages
        await offlineSupport.syncOfflineData();
        
        // Clear pending messages after sync
        this.pendingMessages = [];
        
        return true;
    }
    
    /**
     * Handle sync complete event
     */
    async handleSyncComplete() {
        // Reload pending messages
        await this.loadPendingMessages();
        
        // Reload current conversation if available
        if (this.currentConversationId) {
            // Publish event to reload conversation
            eventSystem.publish('reload-conversation', {
                conversationId: this.currentConversationId
            });
        }
    }
    
    /**
     * Get conversation history while offline
     * @returns {Promise<Array>} Array of conversations
     */
    async getOfflineConversationHistory() {
        try {
            // Get all offline conversations
            const conversations = await offlineSupport.getAllOfflineConversations();
            
            // Sort by timestamp (newest first)
            conversations.sort((a, b) => {
                const timeA = new Date(a.timestamp).getTime();
                const timeB = new Date(b.timestamp).getTime();
                return timeB - timeA;
            });
            
            return conversations;
        } catch (error) {
            console.error('Error getting offline conversation history:', error);
            return [];
        }
    }
    
    /**
     * Get a specific conversation while offline
     * @param {string} conversationId - Conversation ID
     * @returns {Promise<Object>} Conversation data
     */
    async getOfflineConversation(conversationId) {
        try {
            return await offlineSupport.getOfflineConversation(conversationId);
        } catch (error) {
            console.error('Error getting offline conversation:', error);
            return null;
        }
    }
    
    /**
     * Create a new conversation while offline
     * @returns {Promise<Object>} New conversation data
     */
    async createOfflineConversation() {
        try {
            // Generate a new conversation ID
            const conversationId = 'offline_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            // Create conversation object
            const conversation = {
                id: conversationId,
                title: 'Offline Conversation',
                messages: [{
                    role: 'assistant',
                    content: this.offlineResponses.greeting[0],
                    timestamp: new Date().toISOString(),
                    offline: true
                }],
                timestamp: new Date().toISOString(),
                offline: true
            };
            
            // Save to offline storage
            await offlineSupport.saveOfflineConversation(conversation);
            
            // Update current conversation ID
            this.currentConversationId = conversationId;
            localStorage.setItem('meai-current-conversation-id', conversationId);
            
            // Publish event
            eventSystem.publish('conversation-created', {
                conversationId: conversationId,
                offline: true
            });
            
            return conversation;
        } catch (error) {
            console.error('Error creating offline conversation:', error);
            return null;
        }
    }
    
    /**
     * Check if offline conversation capabilities are available
     * @returns {boolean} Whether offline conversation is available
     */
    isOfflineConversationAvailable() {
        // Check if IndexedDB is supported
        if (!window.indexedDB) {
            return false;
        }
        
        // Check if localStorage is supported
        if (!window.localStorage) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Get offline conversation status
     * @returns {Object} Offline conversation status
     */
    getOfflineConversationStatus() {
        return {
            isOfflineMode: this.isOfflineMode,
            pendingMessages: this.pendingMessages.length,
            currentConversationId: this.currentConversationId,
            isAvailable: this.isOfflineConversationAvailable()
        };
    }
}

// Export singleton instance
export default new OfflineConversation();
