/**
 * Offline Support System for MeAI
 * 
 * This module provides offline data synchronization capabilities,
 * allowing the application to function without an internet connection.
 */

import { eventSystem } from '../utils/event-system.js';

class OfflineSupport {
    constructor() {
        // State
        this.isOnline = navigator.onLine;
        this.syncPending = false;
        this.lastSyncTime = null;
        this.offlineMessages = [];
        this.offlineActions = [];
        this.serviceWorkerRegistration = null;
        
        // Initialize event listeners
        this.setupEventListeners();
    }
    
    /**
     * Initialize the offline support system
     */
    async init() {
        console.log('Initializing Offline Support System');
        
        // Register service worker
        await this.registerServiceWorker();
        
        // Initialize IndexedDB
        await this.initializeDatabase();
        
        // Check initial online status
        this.updateOnlineStatus();
        
        // Load any pending offline data
        await this.loadPendingOfflineData();
        
        console.log('Offline Support System initialized');
        
        // Publish initialization event
        eventSystem.publish('offline-support-initialized', {
            isOnline: this.isOnline,
            pendingMessages: this.offlineMessages.length,
            pendingActions: this.offlineActions.length
        });
        
        return true;
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Online/offline events
        window.addEventListener('online', () => this.handleOnlineStatusChange(true));
        window.addEventListener('offline', () => this.handleOnlineStatusChange(false));
        
        // Listen for message events
        eventSystem.subscribe('message-sent', (data) => {
            if (!this.isOnline) {
                this.storeOfflineMessage(data.message);
            }
        });
        
        // Listen for user action events
        eventSystem.subscribe('user-action', (data) => {
            if (!this.isOnline) {
                this.storeOfflineAction(data.action);
            }
        });
        
        // Listen for manual sync requests
        eventSystem.subscribe('request-sync', () => {
            this.syncOfflineData();
        });
        
        // Listen for service worker updates
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'sync-complete') {
                    this.handleSyncComplete(event.data);
                }
            });
        }
    }
    
    /**
     * Register service worker
     */
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                this.serviceWorkerRegistration = await navigator.serviceWorker.register('/service-worker.js', {
                    scope: '/'
                });
                
                console.log('Service Worker registered successfully:', this.serviceWorkerRegistration.scope);
                
                // Check if service worker is active
                if (this.serviceWorkerRegistration.active) {
                    console.log('Service Worker is active');
                } else {
                    // Wait for the service worker to become active
                    this.serviceWorkerRegistration.addEventListener('updatefound', () => {
                        const newWorker = this.serviceWorkerRegistration.installing;
                        
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'activated') {
                                console.log('Service Worker is now active');
                            }
                        });
                    });
                }
                
                return true;
            } catch (error) {
                console.error('Service Worker registration failed:', error);
                return false;
            }
        } else {
            console.warn('Service Workers are not supported in this browser');
            return false;
        }
    }
    
    /**
     * Initialize IndexedDB database
     */
    async initializeDatabase() {
        try {
            // Open database
            const db = await this.openDatabase();
            
            // Check if stores exist
            const storeNames = Array.from(db.objectStoreNames);
            
            if (!storeNames.includes('offlineMessages') || 
                !storeNames.includes('offlineActions') || 
                !storeNames.includes('syncStatus')) {
                
                // Close the database to allow upgrade
                db.close();
                
                // Upgrade database
                await this.upgradeDatabase();
            } else {
                db.close();
            }
            
            console.log('IndexedDB initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing IndexedDB:', error);
            return false;
        }
    }
    
    /**
     * Open IndexedDB database
     * @returns {Promise<IDBDatabase>} Database instance
     */
    openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('meai-offline-db', 1);
            
            request.onerror = (event) => {
                reject('Error opening database: ' + event.target.errorCode);
            };
            
            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores if they don't exist
                if (!db.objectStoreNames.contains('offlineMessages')) {
                    const messagesStore = db.createObjectStore('offlineMessages', { keyPath: 'id' });
                    messagesStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('offlineActions')) {
                    const actionsStore = db.createObjectStore('offlineActions', { keyPath: 'id' });
                    actionsStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('syncStatus')) {
                    const syncStore = db.createObjectStore('syncStatus', { keyPath: 'id' });
                }
                
                console.log('Database upgrade completed');
            };
        });
    }
    
    /**
     * Upgrade IndexedDB database
     */
    async upgradeDatabase() {
        // Increment version number to trigger onupgradeneeded
        const request = indexedDB.open('meai-offline-db', 2);
        
        return new Promise((resolve, reject) => {
            request.onerror = (event) => {
                reject('Error upgrading database: ' + event.target.errorCode);
            };
            
            request.onsuccess = (event) => {
                const db = event.target.result;
                db.close();
                resolve(true);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores if they don't exist
                if (!db.objectStoreNames.contains('offlineMessages')) {
                    const messagesStore = db.createObjectStore('offlineMessages', { keyPath: 'id' });
                    messagesStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('offlineActions')) {
                    const actionsStore = db.createObjectStore('offlineActions', { keyPath: 'id' });
                    actionsStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('syncStatus')) {
                    const syncStore = db.createObjectStore('syncStatus', { keyPath: 'id' });
                }
                
                console.log('Database upgrade completed');
            };
        });
    }
    
    /**
     * Handle online status change
     * @param {boolean} isOnline - Whether the device is online
     */
    handleOnlineStatusChange(isOnline) {
        const previousStatus = this.isOnline;
        this.isOnline = isOnline;
        
        console.log(`Online status changed: ${isOnline ? 'Online' : 'Offline'}`);
        
        // Publish status change event
        eventSystem.publish('online-status-changed', {
            isOnline: isOnline,
            previousStatus: previousStatus
        });
        
        // Update UI
        this.updateOfflineUI(isOnline);
        
        // If we just came back online, sync offline data
        if (isOnline && !previousStatus) {
            this.syncOfflineData();
        }
    }
    
    /**
     * Update online status
     */
    updateOnlineStatus() {
        this.isOnline = navigator.onLine;
        
        // Update UI
        this.updateOfflineUI(this.isOnline);
        
        return this.isOnline;
    }
    
    /**
     * Update UI based on offline status
     * @param {boolean} isOnline - Whether the device is online
     */
    updateOfflineUI(isOnline) {
        // Add/remove offline class from body
        if (isOnline) {
            document.body.classList.remove('offline-mode');
        } else {
            document.body.classList.add('offline-mode');
        }
        
        // Update offline indicator
        const offlineIndicator = document.getElementById('offline-indicator');
        if (offlineIndicator) {
            offlineIndicator.style.display = isOnline ? 'none' : 'block';
        } else {
            // Create offline indicator if it doesn't exist
            if (!isOnline) {
                const indicator = document.createElement('div');
                indicator.id = 'offline-indicator';
                indicator.className = 'offline-indicator';
                indicator.innerHTML = `
                    <div class="offline-indicator-content">
                        <span class="offline-icon">⚠️</span>
                        <span class="offline-text">You are offline. Some features may be limited.</span>
                    </div>
                `;
                document.body.appendChild(indicator);
            }
        }
        
        // Update sync status indicator
        this.updateSyncStatusIndicator();
    }
    
    /**
     * Update sync status indicator
     */
    updateSyncStatusIndicator() {
        const syncIndicator = document.getElementById('sync-status');
        
        if (syncIndicator) {
            if (this.syncPending) {
                syncIndicator.classList.add('sync-pending');
                syncIndicator.title = 'Sync pending';
            } else {
                syncIndicator.classList.remove('sync-pending');
                syncIndicator.title = this.isOnline ? 'Online' : 'Offline';
            }
        }
    }
    
    /**
     * Store offline message
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
            
            // Store in memory
            this.offlineMessages.push(message);
            
            // Store in IndexedDB
            const db = await this.openDatabase();
            const transaction = db.transaction(['offlineMessages'], 'readwrite');
            const store = transaction.objectStore('offlineMessages');
            
            await new Promise((resolve, reject) => {
                const request = store.add(message);
                
                request.onsuccess = () => resolve();
                request.onerror = (event) => reject('Error storing offline message: ' + event.target.errorCode);
            });
            
            db.close();
            
            // Update sync status
            this.syncPending = true;
            this.updateSyncStatusIndicator();
            
            // Publish event
            eventSystem.publish('offline-message-stored', {
                message: message,
                pendingCount: this.offlineMessages.length
            });
            
            console.log('Offline message stored:', message.id);
            return true;
        } catch (error) {
            console.error('Error storing offline message:', error);
            return false;
        }
    }
    
    /**
     * Store offline action
     * @param {Object} action - Action to store
     */
    async storeOfflineAction(action) {
        try {
            // Generate ID if not present
            if (!action.id) {
                action.id = 'act_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            }
            
            // Add timestamp if not present
            if (!action.timestamp) {
                action.timestamp = new Date().toISOString();
            }
            
            // Store in memory
            this.offlineActions.push(action);
            
            // Store in IndexedDB
            const db = await this.openDatabase();
            const transaction = db.transaction(['offlineActions'], 'readwrite');
            const store = transaction.objectStore('offlineActions');
            
            await new Promise((resolve, reject) => {
                const request = store.add(action);
                
                request.onsuccess = () => resolve();
                request.onerror = (event) => reject('Error storing offline action: ' + event.target.errorCode);
            });
            
            db.close();
            
            // Update sync status
            this.syncPending = true;
            this.updateSyncStatusIndicator();
            
            // Publish event
            eventSystem.publish('offline-action-stored', {
                action: action,
                pendingCount: this.offlineActions.length
            });
            
            console.log('Offline action stored:', action.id);
            return true;
        } catch (error) {
            console.error('Error storing offline action:', error);
            return false;
        }
    }
    
    /**
     * Load pending offline data from IndexedDB
     */
    async loadPendingOfflineData() {
        try {
            // Open database
            const db = await this.openDatabase();
            
            // Load offline messages
            const messagesTransaction = db.transaction(['offlineMessages'], 'readonly');
            const messagesStore = messagesTransaction.objectStore('offlineMessages');
            
            this.offlineMessages = await new Promise((resolve, reject) => {
                const request = messagesStore.getAll();
                
                request.onsuccess = () => resolve(request.result);
                request.onerror = (event) => reject('Error loading offline messages: ' + event.target.errorCode);
            });
            
            // Load offline actions
            const actionsTransaction = db.transaction(['offlineActions'], 'readonly');
            const actionsStore = actionsTransaction.objectStore('offlineActions');
            
            this.offlineActions = await new Promise((resolve, reject) => {
                const request = actionsStore.getAll();
                
                request.onsuccess = () => resolve(request.result);
                request.onerror = (event) => reject('Error loading offline actions: ' + event.target.errorCode);
            });
            
            // Load sync status
            const syncTransaction = db.transaction(['syncStatus'], 'readonly');
            const syncStore = syncTransaction.objectStore('syncStatus');
            
            const syncStatus = await new Promise((resolve, reject) => {
                const request = syncStore.get('lastSync');
                
                request.onsuccess = () => resolve(request.result);
                request.onerror = (event) => reject('Error loading sync status: ' + event.target.errorCode);
            });
            
            if (syncStatus) {
                this.lastSyncTime = new Date(syncStatus.timestamp);
            }
            
            db.close();
            
            // Update sync status
            this.syncPending = this.offlineMessages.length > 0 || this.offlineActions.length > 0;
            this.updateSyncStatusIndicator();
            
            console.log('Loaded pending offline data:', {
                messages: this.offlineMessages.length,
                actions: this.offlineActions.length,
                lastSync: this.lastSyncTime
            });
            
            return {
                messages: this.offlineMessages,
                actions: this.offlineActions,
                lastSync: this.lastSyncTime
            };
        } catch (error) {
            console.error('Error loading pending offline data:', error);
            return {
                messages: [],
                actions: [],
                lastSync: null
            };
        }
    }
    
    /**
     * Sync offline data with server
     */
    async syncOfflineData() {
        // Skip if already online or no pending data
        if (!this.isOnline) {
            console.log('Cannot sync offline data: device is offline');
            return false;
        }
        
        if (this.offlineMessages.length === 0 && this.offlineActions.length === 0) {
            console.log('No offline data to sync');
            return true;
        }
        
        console.log('Syncing offline data...');
        
        try {
            // Sync messages
            if (this.offlineMessages.length > 0) {
                await this.syncOfflineMessages();
            }
            
            // Sync actions
            if (this.offlineActions.length > 0) {
                await this.syncOfflineActions();
            }
            
            // Update sync status
            await this.updateSyncStatus();
            
            // Clear sync pending flag
            this.syncPending = false;
            this.updateSyncStatusIndicator();
            
            // Publish sync complete event
            eventSystem.publish('offline-sync-complete', {
                timestamp: new Date(),
                syncedMessages: this.offlineMessages.length,
                syncedActions: this.offlineActions.length
            });
            
            console.log('Offline data sync completed');
            return true;
        } catch (error) {
            console.error('Error syncing offline data:', error);
            
            // Publish sync error event
            eventSystem.publish('offline-sync-error', {
                timestamp: new Date(),
                error: error.message || 'Unknown error'
            });
            
            return false;
        }
    }
    
    /**
     * Sync offline messages with server
     */
    async syncOfflineMessages() {
        // Use Background Sync API if available
        if ('serviceWorker' in navigator && 'SyncManager' in window && this.serviceWorkerRegistration) {
            try {
                await this.serviceWorkerRegistration.sync.register('sync-messages');
                console.log('Background sync for messages registered');
                return true;
            } catch (error) {
                console.warn('Background sync registration failed, falling back to manual sync:', error);
                // Fall back to manual sync
            }
        }
        
        // Manual sync
        const messagesToSync = [...this.offlineMessages];
        const syncedMessages = [];
        
        for (const message of messagesToSync) {
            try {
                // Send message to server
                const response = await fetch('/api/conversation', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(message)
                });
                
                if (response.ok) {
                    // Message synced successfully
                    syncedMessages.push(message);
                    
                    // Remove from memory
                    this.offlineMessages = this.offlineMessages.filter(m => m.id !== message.id);
                    
                    // Remove from IndexedDB
                    await this.removeOfflineMessage(message.id);
                    
                    console.log('Synced offline message:', message.id);
                } else {
                    throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                }
            } catch (error) {
                console.error('Error syncing message:', message.id, error);
                // Keep message for retry
            }
        }
        
        // Publish event
        eventSystem.publish('offline-messages-synced', {
            syncedCount: syncedMessages.length,
            remainingCount: this.offlineMessages.length
        });
        
        return syncedMessages.length === messagesToSync.length;
    }
    
    /**
     * Sync offline actions with server
     */
    async syncOfflineActions() {
        // Use Background Sync API if available
        if ('serviceWorker' in navigator && 'SyncManager' in window && this.serviceWorkerRegistration) {
            try {
                await this.serviceWorkerRegistration.sync.register('sync-actions');
                console.log('Background sync for actions registered');
                return true;
            } catch (error) {
                console.warn('Background sync registration failed, falling back to manual sync:', error);
                // Fall back to manual sync
            }
        }
        
        // Manual sync
        const actionsToSync = [...this.offlineActions];
        const syncedActions = [];
        
        for (const action of actionsToSync) {
            try {
                // Send action to server
                const response = await fetch('/api/action', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(action)
                });
                
                if (response.ok) {
                    // Action synced successfully
                    syncedActions.push(action);
                    
                    // Remove from memory
                    this.offlineActions = this.offlineActions.filter(a => a.id !== action.id);
                    
                    // Remove from IndexedDB
                    await this.removeOfflineAction(action.id);
                    
                    console.log('Synced offline action:', action.id);
                } else {
                    throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                }
            } catch (error) {
                console.error('Error syncing action:', action.id, error);
                // Keep action for retry
            }
        }
        
        // Publish event
        eventSystem.publish('offline-actions-synced', {
            syncedCount: syncedActions.length,
            remainingCount: this.offlineActions.length
        });
        
        return syncedActions.length === actionsToSync.length;
    }
    
    /**
     * Remove offline message from IndexedDB
     * @param {string} id - Message ID
     */
    async removeOfflineMessage(id) {
        try {
            const db = await this.openDatabase();
            const transaction = db.transaction(['offlineMessages'], 'readwrite');
            const store = transaction.objectStore('offlineMessages');
            
            await new Promise((resolve, reject) => {
                const request = store.delete(id);
                
                request.onsuccess = () => resolve();
                request.onerror = (event) => reject('Error removing offline message: ' + event.target.errorCode);
            });
            
            db.close();
            return true;
        } catch (error) {
            console.error('Error removing offline message:', error);
            return false;
        }
    }
    
    /**
     * Remove offline action from IndexedDB
     * @param {string} id - Action ID
     */
    async removeOfflineAction(id) {
        try {
            const db = await this.openDatabase();
            const transaction = db.transaction(['offlineActions'], 'readwrite');
            const store = transaction.objectStore('offlineActions');
            
            await new Promise((resolve, reject) => {
                const request = store.delete(id);
                
                request.onsuccess = () => resolve();
                request.onerror = (event) => reject('Error removing offline action: ' + event.target.errorCode);
            });
            
            db.close();
            return true;
        } catch (error) {
            console.error('Error removing offline action:', error);
            return false;
        }
    }
    
    /**
     * Update sync status in IndexedDB
     */
    async updateSyncStatus() {
        try {
            const now = new Date();
            this.lastSyncTime = now;
            
            const db = await this.openDatabase();
            const transaction = db.transaction(['syncStatus'], 'readwrite');
            const store = transaction.objectStore('syncStatus');
            
            await new Promise((resolve, reject) => {
                const request = store.put({
                    id: 'lastSync',
                    timestamp: now.toISOString()
                });
                
                request.onsuccess = () => resolve();
                request.onerror = (event) => reject('Error updating sync status: ' + event.target.errorCode);
            });
            
            db.close();
            return true;
        } catch (error) {
            console.error('Error updating sync status:', error);
            return false;
        }
    }
    
    /**
     * Handle sync complete event from service worker
     * @param {Object} data - Sync complete data
     */
    handleSyncComplete(data) {
        console.log('Sync complete event received from service worker:', data);
        
        // Reload pending data
        this.loadPendingOfflineData()
            .then(() => {
                // Update UI
                this.syncPending = this.offlineMessages.length > 0 || this.offlineActions.length > 0;
                this.updateSyncStatusIndicator();
                
                // Publish event
                eventSystem.publish('offline-sync-complete', {
                    timestamp: new Date(),
                    syncedMessages: data.syncedMessages || 0,
                    syncedActions: data.syncedActions || 0
                });
            });
    }
    
    /**
     * Get offline status
     * @returns {Object} Offline status
     */
    getOfflineStatus() {
        return {
            isOnline: this.isOnline,
            syncPending: this.syncPending,
            lastSyncTime: this.lastSyncTime,
            pendingMessages: this.offlineMessages.length,
            pendingActions: this.offlineActions.length
        };
    }
    
    /**
     * Check if a feature is available offline
     * @param {string} featureId - Feature ID
     * @returns {boolean} Whether the feature is available offline
     */
    isFeatureAvailableOffline(featureId) {
        // List of features available offline
        const offlineFeatures = [
            'basic-conversation',
            'theme-switching',
            'visualization',
            'user-preferences',
            'conversation-history',
            'voice-synthesis'
        ];
        
        return offlineFeatures.includes(featureId);
    }
    
    /**
     * Get offline conversation data
     * @param {string} conversationId - Conversation ID
     * @returns {Promise<Object>} Conversation data
     */
    async getOfflineConversation(conversationId) {
        try {
            // Try to get from cache first
            const cachedResponse = await caches.match(`/api/conversations/${conversationId}`);
            
            if (cachedResponse) {
                return await cachedResponse.json();
            }
            
            // If not in cache, try IndexedDB
            const db = await this.openDatabase();
            
            // Create conversations store if it doesn't exist
            if (!db.objectStoreNames.contains('conversations')) {
                db.close();
                await this.upgradeDatabase();
                return null;
            }
            
            const transaction = db.transaction(['conversations'], 'readonly');
            const store = transaction.objectStore('conversations');
            
            const conversation = await new Promise((resolve, reject) => {
                const request = store.get(conversationId);
                
                request.onsuccess = () => resolve(request.result);
                request.onerror = (event) => reject('Error getting conversation: ' + event.target.errorCode);
            });
            
            db.close();
            
            return conversation;
        } catch (error) {
            console.error('Error getting offline conversation:', error);
            return null;
        }
    }
    
    /**
     * Save conversation data for offline use
     * @param {Object} conversation - Conversation data
     */
    async saveOfflineConversation(conversation) {
        try {
            // Generate ID if not present
            if (!conversation.id) {
                conversation.id = 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            }
            
            // Add timestamp if not present
            if (!conversation.timestamp) {
                conversation.timestamp = new Date().toISOString();
            }
            
            // Store in IndexedDB
            const db = await this.openDatabase();
            
            // Create conversations store if it doesn't exist
            if (!db.objectStoreNames.contains('conversations')) {
                db.close();
                await this.upgradeDatabase();
                
                // Reopen database
                const newDb = await this.openDatabase();
                const transaction = newDb.transaction(['conversations'], 'readwrite');
                const store = transaction.objectStore('conversations');
                
                await new Promise((resolve, reject) => {
                    const request = store.put(conversation);
                    
                    request.onsuccess = () => resolve();
                    request.onerror = (event) => reject('Error storing conversation: ' + event.target.errorCode);
                });
                
                newDb.close();
            } else {
                const transaction = db.transaction(['conversations'], 'readwrite');
                const store = transaction.objectStore('conversations');
                
                await new Promise((resolve, reject) => {
                    const request = store.put(conversation);
                    
                    request.onsuccess = () => resolve();
                    request.onerror = (event) => reject('Error storing conversation: ' + event.target.errorCode);
                });
                
                db.close();
            }
            
            // Also store in cache
            if ('caches' in window) {
                const cache = await caches.open(CONVERSATION_CACHE_NAME);
                
                // Create a response object
                const response = new Response(JSON.stringify(conversation), {
                    headers: { 'Content-Type': 'application/json' }
                });
                
                // Store in cache
                await cache.put(`/api/conversations/${conversation.id}`, response);
            }
            
            console.log('Conversation saved for offline use:', conversation.id);
            return true;
        } catch (error) {
            console.error('Error saving offline conversation:', error);
            return false;
        }
    }
    
    /**
     * Get all offline conversations
     * @returns {Promise<Array>} Array of conversations
     */
    async getAllOfflineConversations() {
        try {
            const db = await this.openDatabase();
            
            // Create conversations store if it doesn't exist
            if (!db.objectStoreNames.contains('conversations')) {
                db.close();
                return [];
            }
            
            const transaction = db.transaction(['conversations'], 'readonly');
            const store = transaction.objectStore('conversations');
            
            const conversations = await new Promise((resolve, reject) => {
                const request = store.getAll();
                
                request.onsuccess = () => resolve(request.result);
                request.onerror = (event) => reject('Error getting conversations: ' + event.target.errorCode);
            });
            
            db.close();
            
            return conversations;
        } catch (error) {
            console.error('Error getting offline conversations:', error);
            return [];
        }
    }
}

// Export singleton instance
export default new OfflineSupport();
