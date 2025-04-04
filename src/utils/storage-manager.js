/**
 * Storage Manager for MeAI
 * 
 * This utility provides persistent storage capabilities for the application,
 * handling local storage, session storage, and IndexedDB operations.
 */

class StorageManager {
    constructor() {
        this.dbName = 'MeAIDatabase';
        this.dbVersion = 1;
        this.db = null;
        
        // Initialize IndexedDB
        this.initIndexedDB();
    }
    
    /**
     * Initialize IndexedDB database
     * @returns {Promise} - Promise that resolves when DB is ready
     */
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                console.warn('IndexedDB not supported. Using localStorage fallback.');
                this.db = null;
                resolve(false);
                return;
            }
            
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = (event) => {
                console.error('IndexedDB error:', event.target.error);
                this.db = null;
                reject(event.target.error);
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('IndexedDB connected successfully');
                resolve(true);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                if (!db.objectStoreNames.contains('memory')) {
                    db.createObjectStore('memory', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('preferences')) {
                    db.createObjectStore('preferences', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('conversations')) {
                    const conversationStore = db.createObjectStore('conversations', { keyPath: 'id' });
                    conversationStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }
    
    /**
     * Store data in localStorage
     * @param {string} key - Storage key
     * @param {any} value - Value to store (will be JSON stringified)
     */
    setLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error storing in localStorage:', error);
            return false;
        }
    }
    
    /**
     * Retrieve data from localStorage
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if key doesn't exist
     * @returns {any} - Retrieved value (JSON parsed)
     */
    getLocalStorage(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.error('Error retrieving from localStorage:', error);
            return defaultValue;
        }
    }
    
    /**
     * Store data in sessionStorage
     * @param {string} key - Storage key
     * @param {any} value - Value to store (will be JSON stringified)
     */
    setSessionStorage(key, value) {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error storing in sessionStorage:', error);
            return false;
        }
    }
    
    /**
     * Retrieve data from sessionStorage
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if key doesn't exist
     * @returns {any} - Retrieved value (JSON parsed)
     */
    getSessionStorage(key, defaultValue = null) {
        try {
            const value = sessionStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.error('Error retrieving from sessionStorage:', error);
            return defaultValue;
        }
    }
    
    /**
     * Store data in IndexedDB
     * @param {string} storeName - Name of the object store
     * @param {Object} data - Data object to store
     * @returns {Promise} - Promise that resolves when data is stored
     */
    async setIndexedDB(storeName, data) {
        if (!this.db) {
            await this.initIndexedDB();
            if (!this.db) {
                // Fallback to localStorage if IndexedDB is not available
                return this.setLocalStorage(`${storeName}_${data.id}`, data);
            }
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);
            
            request.onsuccess = () => resolve(true);
            request.onerror = (event) => {
                console.error('Error storing in IndexedDB:', event.target.error);
                reject(event.target.error);
            };
        });
    }
    
    /**
     * Retrieve data from IndexedDB
     * @param {string} storeName - Name of the object store
     * @param {string} id - ID of the record to retrieve
     * @returns {Promise} - Promise that resolves with the retrieved data
     */
    async getIndexedDB(storeName, id) {
        if (!this.db) {
            await this.initIndexedDB();
            if (!this.db) {
                // Fallback to localStorage if IndexedDB is not available
                return this.getLocalStorage(`${storeName}_${id}`);
            }
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);
            
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = (event) => {
                console.error('Error retrieving from IndexedDB:', event.target.error);
                reject(event.target.error);
            };
        });
    }
    
    /**
     * Get all records from an IndexedDB object store
     * @param {string} storeName - Name of the object store
     * @returns {Promise} - Promise that resolves with array of all records
     */
    async getAllIndexedDB(storeName) {
        if (!this.db) {
            await this.initIndexedDB();
            if (!this.db) {
                // Fallback to localStorage if IndexedDB is not available
                return this.getAllLocalStorage(storeName);
            }
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = (event) => {
                console.error('Error retrieving all from IndexedDB:', event.target.error);
                reject(event.target.error);
            };
        });
    }
    
    /**
     * Delete a record from IndexedDB
     * @param {string} storeName - Name of the object store
     * @param {string} id - ID of the record to delete
     * @returns {Promise} - Promise that resolves when record is deleted
     */
    async deleteIndexedDB(storeName, id) {
        if (!this.db) {
            await this.initIndexedDB();
            if (!this.db) {
                // Fallback to localStorage if IndexedDB is not available
                localStorage.removeItem(`${storeName}_${id}`);
                return true;
            }
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);
            
            request.onsuccess = () => resolve(true);
            request.onerror = (event) => {
                console.error('Error deleting from IndexedDB:', event.target.error);
                reject(event.target.error);
            };
        });
    }
    
    /**
     * Get all localStorage items with a specific prefix
     * @param {string} prefix - Prefix to filter keys by
     * @returns {Object} - Object containing all matching key-value pairs
     */
    getAllLocalStorage(prefix) {
        const result = {};
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(prefix)) {
                try {
                    result[key] = JSON.parse(localStorage.getItem(key));
                } catch (error) {
                    result[key] = localStorage.getItem(key);
                }
            }
        }
        
        return result;
    }
    
    /**
     * Clear all data for a specific store
     * @param {string} storeName - Name of the store to clear
     * @returns {Promise} - Promise that resolves when store is cleared
     */
    async clearStore(storeName) {
        if (!this.db) {
            await this.initIndexedDB();
            if (!this.db) {
                // Fallback to localStorage if IndexedDB is not available
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith(`${storeName}_`)) {
                        keysToRemove.push(key);
                    }
                }
                
                keysToRemove.forEach(key => localStorage.removeItem(key));
                return true;
            }
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();
            
            request.onsuccess = () => resolve(true);
            request.onerror = (event) => {
                console.error('Error clearing store in IndexedDB:', event.target.error);
                reject(event.target.error);
            };
        });
    }
}

// Create singleton instance
const storageManager = new StorageManager();

// Export the singleton
window.storageManager = storageManager;
