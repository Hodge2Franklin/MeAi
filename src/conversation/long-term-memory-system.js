// Long-term Memory Architecture for MeAI
// This system enhances the existing contextual memory system with persistent storage and intelligent recall

class LongTermMemorySystem {
    constructor() {
        this.initialized = false;
        this.memoryTypes = {
            SHORT_TERM: 'short_term', // Lasts for current session only
            MEDIUM_TERM: 'medium_term', // Lasts for several sessions (days)
            LONG_TERM: 'long_term' // Permanent storage (until explicitly cleared)
        };
        
        this.memoryCategories = {
            CONVERSATION: 'conversation',
            FACT: 'fact',
            PREFERENCE: 'preference',
            BEHAVIOR: 'behavior',
            EMOTION: 'emotion'
        };
        
        // Memory retention settings (in days)
        this.retentionPeriods = {
            [this.memoryTypes.SHORT_TERM]: 0, // Session only
            [this.memoryTypes.MEDIUM_TERM]: 7, // One week
            [this.memoryTypes.LONG_TERM]: 365 // One year
        };
        
        // Memory importance thresholds
        this.importanceThresholds = {
            [this.memoryTypes.SHORT_TERM]: 0.1, // Low threshold for short-term
            [this.memoryTypes.MEDIUM_TERM]: 0.4, // Medium threshold
            [this.memoryTypes.LONG_TERM]: 0.7 // High threshold for long-term
        };
        
        // Initialize system
        this.init();
    }
    
    async init() {
        try {
            // Check for IndexedDB support
            if (!window.indexedDB) {
                console.warn('IndexedDB not supported. Using fallback storage.');
                this.useFallbackStorage();
                return;
            }
            
            // Open database
            const dbRequest = indexedDB.open('MeAIMemoryDB', 1);
            
            // Handle database upgrade/creation
            dbRequest.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores for each memory type if they don't exist
                if (!db.objectStoreNames.contains(this.memoryTypes.SHORT_TERM)) {
                    const shortTermStore = db.createObjectStore(this.memoryTypes.SHORT_TERM, { keyPath: 'id' });
                    shortTermStore.createIndex('category', 'category', { unique: false });
                    shortTermStore.createIndex('timestamp', 'timestamp', { unique: false });
                    shortTermStore.createIndex('importance', 'importance', { unique: false });
                }
                
                if (!db.objectStoreNames.contains(this.memoryTypes.MEDIUM_TERM)) {
                    const mediumTermStore = db.createObjectStore(this.memoryTypes.MEDIUM_TERM, { keyPath: 'id' });
                    mediumTermStore.createIndex('category', 'category', { unique: false });
                    mediumTermStore.createIndex('timestamp', 'timestamp', { unique: false });
                    mediumTermStore.createIndex('importance', 'importance', { unique: false });
                }
                
                if (!db.objectStoreNames.contains(this.memoryTypes.LONG_TERM)) {
                    const longTermStore = db.createObjectStore(this.memoryTypes.LONG_TERM, { keyPath: 'id' });
                    longTermStore.createIndex('category', 'category', { unique: false });
                    longTermStore.createIndex('timestamp', 'timestamp', { unique: false });
                    longTermStore.createIndex('importance', 'importance', { unique: false });
                }
            };
            
            // Handle success
            dbRequest.onsuccess = (event) => {
                this.db = event.target.result;
                this.initialized = true;
                console.log('Memory system initialized with IndexedDB');
                
                // Run maintenance tasks
                this.runMaintenanceTasks();
                
                // Publish initialization event
                if (window.eventSystem) {
                    window.eventSystem.publish('memory-system-initialized', { success: true });
                }
            };
            
            // Handle errors
            dbRequest.onerror = (event) => {
                console.error('Error initializing memory database:', event.target.error);
                this.useFallbackStorage();
            };
        } catch (error) {
            console.error('Error in memory system initialization:', error);
            this.useFallbackStorage();
        }
    }
    
    useFallbackStorage() {
        // Use localStorage as fallback
        this.fallbackMode = true;
        this.fallbackStorage = {
            [this.memoryTypes.SHORT_TERM]: {},
            [this.memoryTypes.MEDIUM_TERM]: {},
            [this.memoryTypes.LONG_TERM]: {}
        };
        
        // Try to load existing data from localStorage
        try {
            const storedData = localStorage.getItem('MeAIMemoryFallback');
            if (storedData) {
                this.fallbackStorage = JSON.parse(storedData);
            }
        } catch (error) {
            console.error('Error loading fallback memory storage:', error);
        }
        
        this.initialized = true;
        console.log('Memory system initialized with fallback storage');
        
        // Publish initialization event
        if (window.eventSystem) {
            window.eventSystem.publish('memory-system-initialized', { 
                success: true, 
                fallbackMode: true 
            });
        }
    }
    
    // Memory Storage Methods
    
    async storeMemory(data, category, importance = 0.5) {
        if (!this.initialized) {
            await this.waitForInitialization();
        }
        
        // Create memory object
        const memoryObject = {
            id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            data: this.encryptSensitiveData(data),
            category: category,
            timestamp: Date.now(),
            importance: importance,
            accessCount: 0,
            lastAccessed: Date.now()
        };
        
        // Determine memory type based on importance
        let memoryType = this.memoryTypes.SHORT_TERM;
        
        if (importance >= this.importanceThresholds[this.memoryTypes.LONG_TERM]) {
            memoryType = this.memoryTypes.LONG_TERM;
        } else if (importance >= this.importanceThresholds[this.memoryTypes.MEDIUM_TERM]) {
            memoryType = this.memoryTypes.MEDIUM_TERM;
        }
        
        // Store memory
        if (this.fallbackMode) {
            return this.storeMemoryFallback(memoryObject, memoryType);
        } else {
            return this.storeMemoryIndexedDB(memoryObject, memoryType);
        }
    }
    
    async storeMemoryIndexedDB(memoryObject, memoryType) {
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction([memoryType], 'readwrite');
                const store = transaction.objectStore(memoryType);
                const request = store.add(memoryObject);
                
                request.onsuccess = () => {
                    resolve(memoryObject.id);
                };
                
                request.onerror = (event) => {
                    console.error('Error storing memory:', event.target.error);
                    reject(event.target.error);
                };
            } catch (error) {
                console.error('Error in storeMemoryIndexedDB:', error);
                reject(error);
            }
        });
    }
    
    storeMemoryFallback(memoryObject, memoryType) {
        try {
            // Add to in-memory storage
            this.fallbackStorage[memoryType][memoryObject.id] = memoryObject;
            
            // Persist to localStorage
            localStorage.setItem('MeAIMemoryFallback', JSON.stringify(this.fallbackStorage));
            
            return Promise.resolve(memoryObject.id);
        } catch (error) {
            console.error('Error in storeMemoryFallback:', error);
            return Promise.reject(error);
        }
    }
    
    // Memory Retrieval Methods
    
    async retrieveMemory(id, memoryType = null) {
        if (!this.initialized) {
            await this.waitForInitialization();
        }
        
        if (this.fallbackMode) {
            return this.retrieveMemoryFallback(id, memoryType);
        } else {
            return this.retrieveMemoryIndexedDB(id, memoryType);
        }
    }
    
    async retrieveMemoryIndexedDB(id, memoryType) {
        // If memory type is not specified, search in all types
        const typesToSearch = memoryType ? [memoryType] : Object.values(this.memoryTypes);
        
        for (const type of typesToSearch) {
            try {
                const memory = await new Promise((resolve, reject) => {
                    const transaction = this.db.transaction([type], 'readonly');
                    const store = transaction.objectStore(type);
                    const request = store.get(id);
                    
                    request.onsuccess = (event) => {
                        resolve(event.target.result);
                    };
                    
                    request.onerror = (event) => {
                        reject(event.target.error);
                    };
                });
                
                if (memory) {
                    // Update access statistics
                    this.updateMemoryAccess(memory, type);
                    
                    // Decrypt sensitive data
                    memory.data = this.decryptSensitiveData(memory.data);
                    
                    return memory;
                }
            } catch (error) {
                console.error(`Error retrieving memory from ${type}:`, error);
            }
        }
        
        return null;
    }
    
    retrieveMemoryFallback(id, memoryType) {
        try {
            // If memory type is not specified, search in all types
            const typesToSearch = memoryType ? [memoryType] : Object.values(this.memoryTypes);
            
            for (const type of typesToSearch) {
                const memory = this.fallbackStorage[type][id];
                
                if (memory) {
                    // Update access statistics
                    memory.accessCount += 1;
                    memory.lastAccessed = Date.now();
                    
                    // Persist changes
                    localStorage.setItem('MeAIMemoryFallback', JSON.stringify(this.fallbackStorage));
                    
                    // Decrypt sensitive data
                    const decryptedMemory = { ...memory };
                    decryptedMemory.data = this.decryptSensitiveData(memory.data);
                    
                    return Promise.resolve(decryptedMemory);
                }
            }
            
            return Promise.resolve(null);
        } catch (error) {
            console.error('Error in retrieveMemoryFallback:', error);
            return Promise.reject(error);
        }
    }
    
    // Context-based Memory Retrieval
    
    async retrieveMemoriesByCategory(category, limit = 10, memoryType = null) {
        if (!this.initialized) {
            await this.waitForInitialization();
        }
        
        if (this.fallbackMode) {
            return this.retrieveMemoriesByCategoryFallback(category, limit, memoryType);
        } else {
            return this.retrieveMemoriesByCategoryIndexedDB(category, limit, memoryType);
        }
    }
    
    async retrieveMemoriesByCategoryIndexedDB(category, limit, memoryType) {
        const memories = [];
        const typesToSearch = memoryType ? [memoryType] : Object.values(this.memoryTypes);
        
        for (const type of typesToSearch) {
            try {
                const typeMemories = await new Promise((resolve, reject) => {
                    const transaction = this.db.transaction([type], 'readonly');
                    const store = transaction.objectStore(type);
                    const index = store.index('category');
                    const request = index.getAll(category);
                    
                    request.onsuccess = (event) => {
                        resolve(event.target.result);
                    };
                    
                    request.onerror = (event) => {
                        reject(event.target.error);
                    };
                });
                
                memories.push(...typeMemories);
            } catch (error) {
                console.error(`Error retrieving memories from ${type}:`, error);
            }
        }
        
        // Sort by importance and timestamp (most important and recent first)
        memories.sort((a, b) => {
            // Primary sort by importance (descending)
            if (b.importance !== a.importance) {
                return b.importance - a.importance;
            }
            // Secondary sort by timestamp (descending)
            return b.timestamp - a.timestamp;
        });
        
        // Limit results
        const limitedMemories = memories.slice(0, limit);
        
        // Update access statistics for retrieved memories
        for (const memory of limitedMemories) {
            // Find memory type
            const memoryType = this.findMemoryType(memory.id);
            if (memoryType) {
                this.updateMemoryAccess(memory, memoryType);
            }
            
            // Decrypt sensitive data
            memory.data = this.decryptSensitiveData(memory.data);
        }
        
        return limitedMemories;
    }
    
    retrieveMemoriesByCategoryFallback(category, limit, memoryType) {
        try {
            const memories = [];
            const typesToSearch = memoryType ? [memoryType] : Object.values(this.memoryTypes);
            
            for (const type of typesToSearch) {
                const typeMemories = Object.values(this.fallbackStorage[type])
                    .filter(memory => memory.category === category);
                
                memories.push(...typeMemories);
            }
            
            // Sort by importance and timestamp (most important and recent first)
            memories.sort((a, b) => {
                // Primary sort by importance (descending)
                if (b.importance !== a.importance) {
                    return b.importance - a.importance;
                }
                // Secondary sort by timestamp (descending)
                return b.timestamp - a.timestamp;
            });
            
            // Limit results
            const limitedMemories = memories.slice(0, limit);
            
            // Update access statistics for retrieved memories
            for (const memory of limitedMemories) {
                memory.accessCount += 1;
                memory.lastAccessed = Date.now();
            }
            
            // Persist changes
            localStorage.setItem('MeAIMemoryFallback', JSON.stringify(this.fallbackStorage));
            
            // Decrypt sensitive data in returned memories
            const decryptedMemories = limitedMemories.map(memory => {
                const decryptedMemory = { ...memory };
                decryptedMemory.data = this.decryptSensitiveData(memory.data);
                return decryptedMemory;
            });
            
            return Promise.resolve(decryptedMemories);
        } catch (error) {
            console.error('Error in retrieveMemoriesByCategoryFallback:', error);
            return Promise.reject(error);
        }
    }
    
    // Fuzzy Memory Search
    
    async searchMemories(query, options = {}) {
        if (!this.initialized) {
            await this.waitForInitialization();
        }
        
        const defaultOptions = {
            categories: Object.values(this.memoryCategories),
            memoryTypes: Object.values(this.memoryTypes),
            limit: 10,
            threshold: 0.6, // Similarity threshold (0-1)
            includeMetadata: false
        };
        
        const searchOptions = { ...defaultOptions, ...options };
        
        if (this.fallbackMode) {
            return this.searchMemoriesFallback(query, searchOptions);
        } else {
            return this.searchMemoriesIndexedDB(query, searchOptions);
        }
    }
    
    async searchMemoriesIndexedDB(query, options) {
        const allMemories = [];
        
        // Retrieve all memories from specified types and categories
        for (const type of options.memoryTypes) {
            try {
                const memories = await new Promise((resolve, reject) => {
                    const transaction = this.db.transaction([type], 'readonly');
                    const store = transaction.objectStore(type);
                    const request = store.getAll();
                    
                    request.onsuccess = (event) => {
                        resolve(event.target.result);
                    };
                    
                    request.onerror = (event) => {
                        reject(event.target.error);
                    };
                });
                
                // Filter by category
                const filteredMemories = memories.filter(memory => 
                    options.categories.includes(memory.category)
                );
                
                allMemories.push(...filteredMemories);
            } catch (error) {
                console.error(`Error retrieving memories from ${type}:`, error);
            }
        }
        
        // Perform fuzzy search
        const results = this.performFuzzySearch(query, allMemories, options.threshold);
        
        // Sort by similarity score (descending)
        results.sort((a, b) => b.score - a.score);
        
        // Limit results
        const limitedResults = results.slice(0, options.limit);
        
        // Update access statistics for retrieved memories
        for (const result of limitedResults) {
            const memory = result.memory;
            const memoryType = this.findMemoryType(memory.id);
            
            if (memoryType) {
                this.updateMemoryAccess(memory, memoryType);
            }
            
            // Decrypt sensitive data
            memory.data = this.decryptSensitiveData(memory.data);
        }
        
        // Format results
        return limitedResults.map(result => {
            if (options.includeMetadata) {
                return {
                    memory: result.memory,
                    score: result.score
                };
            } else {
                return result.memory;
            }
        });
    }
    
    searchMemoriesFallback(query, options) {
        try {
            const allMemories = [];
            
            // Retrieve all memories from specified types and categories
            for (const type of options.memoryTypes) {
                const memories = Object.values(this.fallbackStorage[type])
                    .filter(memory => options.categories.includes(memory.category));
                
                allMemories.push(...memories);
            }
            
            // Perform fuzzy search
            const results = this.performFuzzySearch(query, allMemories, options.threshold);
            
            // Sort by similarity score (descending)
            results.sort((a, b) => b.score - a.score);
            
            // Limit results
            const limitedResults = results.slice(0, options.limit);
            
            // Update access statistics for retrieved memories
            for (const result of limitedResults) {
                result.memory.accessCount += 1;
                result.memory.lastAccessed = Date.now();
            }
            
            // Persist changes
            localStorage.setItem('MeAIMemoryFallback', JSON.stringify(this.fallbackStorage));
            
            // Format results with decrypted data
            return Promise.resolve(limitedResults.map(result => {
                const decryptedMemory = { ...result.memory };
                decryptedMemory.data = this.decryptSensitiveData(result.memory.data);
                
                if (options.includeMetadata) {
                    return {
                        memory: decryptedMemory,
                        score: result.score
                    };
                } else {
                    return decryptedMemory;
                }
            }));
        } catch (error) {
            console.error('Error in searchMemoriesFallback:', error);
            return Promise.reject(error);
        }
    }
    
    performFuzzySearch(query, memories, threshold) {
        const results = [];
        const queryLower = query.toLowerCase();
        
        for (const memory of memories) {
            // Convert memory data to string for searching
            let dataString = '';
            
            if (typeof memory.data === 'string') {
                dataString = memory.data;
            } else if (typeof memory.data === 'object') {
                dataString = JSON.stringify(memory.data);
            }
            
            const dataLower = dataString.toLowerCase();
            
            // Calculate similarity score
            let score = 0;
            
            // Exact match gets highest score
            if (dataLower.includes(queryLower)) {
                score = 1.0;
            } else {
                // Calculate Levenshtein distance-based similarity
                score = this.calculateStringSimilarity(queryLower, dataLower);
            }
            
            // Add to results if above threshold
            if (score >= threshold) {
                results.push({
                    memory: memory,
                    score: score
                });
            }
        }
        
        return results;
    }
    
    calculateStringSimilarity(str1, str2) {
        // Simple implementation of string similarity
        // For a real implementation, use a proper algorithm like Levenshtein distance
        
        // Check if str2 contains any part of str1
        for (let i = 0; i < str1.length; i++) {
            for (let j = i + 2; j <= str1.length; j++) {
                const substr = str1.substring(i, j);
                if (str2.includes(substr)) {
                    // Return score based on substring length relative to query length
                    return substr.length / str1.length;
                }
            }
        }
        
        return 0;
    }
    
    // Memory Maintenance Methods
    
    async runMaintenanceTasks() {
        if (!this.initialized) {
            await this.waitForInitialization();
        }
        
        console.log('Running memory maintenance tasks');
        
        // Clean up expired memories
        this.cleanupExpiredMemories();
        
        // Consolidate memories
        this.consolidateMemories();
        
        // Schedule next maintenance
        setTimeout(() => this.runMaintenanceTasks(), 24 * 60 * 60 * 1000); // Run daily
    }
    
    async cleanupExpiredMemories() {
        if (this.fallbackMode) {
            this.cleanupExpiredMemoriesFallback();
        } else {
            this.cleanupExpiredMemoriesIndexedDB();
        }
    }
    
    async cleanupExpiredMemoriesIndexedDB() {
        const now = Date.now();
        
        for (const [type, retentionDays] of Object.entries(this.retentionPeriods)) {
            if (retentionDays === 0) continue; // Skip permanent storage
            
            try {
                const transaction = this.db.transaction([type], 'readonly');
                const store = transaction.objectStore(type);
                const index = store.index('timestamp');
                const request = index.openCursor();
                
                const expiredIds = [];
                
                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        const memory = cursor.value;
                        const ageInDays = (now - memory.timestamp) / (1000 * 60 * 60 * 24);
                        
                        if (ageInDays > retentionDays) {
                            expiredIds.push(memory.id);
                        }
                        
                        cursor.continue();
                    } else {
                        // Delete expired memories
                        if (expiredIds.length > 0) {
                            const deleteTransaction = this.db.transaction([type], 'readwrite');
                            const deleteStore = deleteTransaction.objectStore(type);
                            
                            for (const id of expiredIds) {
                                deleteStore.delete(id);
                            }
                            
                            console.log(`Cleaned up ${expiredIds.length} expired memories from ${type}`);
                        }
                    }
                };
                
                request.onerror = (event) => {
                    console.error(`Error cleaning up expired memories from ${type}:`, event.target.error);
                };
            } catch (error) {
                console.error(`Error in cleanupExpiredMemoriesIndexedDB for ${type}:`, error);
            }
        }
    }
    
    cleanupExpiredMemoriesFallback() {
        try {
            const now = Date.now();
            let cleanupCount = 0;
            
            for (const [type, retentionDays] of Object.entries(this.retentionPeriods)) {
                if (retentionDays === 0) continue; // Skip permanent storage
                
                const memories = this.fallbackStorage[type];
                const expiredIds = [];
                
                for (const [id, memory] of Object.entries(memories)) {
                    const ageInDays = (now - memory.timestamp) / (1000 * 60 * 60 * 24);
                    
                    if (ageInDays > retentionDays) {
                        expiredIds.push(id);
                    }
                }
                
                // Delete expired memories
                for (const id of expiredIds) {
                    delete memories[id];
                    cleanupCount++;
                }
            }
            
            // Persist changes
            localStorage.setItem('MeAIMemoryFallback', JSON.stringify(this.fallbackStorage));
            
            console.log(`Cleaned up ${cleanupCount} expired memories from fallback storage`);
        } catch (error) {
            console.error('Error in cleanupExpiredMemoriesFallback:', error);
        }
    }
    
    async consolidateMemories() {
        // This would implement memory consolidation logic
        // For example, combining related memories, promoting important memories to longer-term storage, etc.
        // This is a placeholder for future implementation
        console.log('Memory consolidation not yet implemented');
    }
    
    // Helper Methods
    
    async updateMemoryAccess(memory, memoryType) {
        if (this.fallbackMode) return;
        
        try {
            // Update access count and timestamp
            memory.accessCount += 1;
            memory.lastAccessed = Date.now();
            
            // Recalculate importance based on access patterns
            this.recalculateImportance(memory);
            
            // Update in database
            const transaction = this.db.transaction([memoryType], 'readwrite');
            const store = transaction.objectStore(memoryType);
            store.put(memory);
            
            // Check if memory should be promoted to a higher tier
            this.checkForMemoryPromotion(memory, memoryType);
        } catch (error) {
            console.error('Error updating memory access:', error);
        }
    }
    
    recalculateImportance(memory) {
        // Simple importance calculation based on access count and recency
        // This could be made more sophisticated in a real implementation
        
        const accessFactor = Math.min(memory.accessCount / 10, 0.5); // Max 0.5 from access count
        
        const recencyFactor = Math.max(0, 0.5 - (Date.now() - memory.timestamp) / (1000 * 60 * 60 * 24 * 30) * 0.5); // Max 0.5 from recency
        
        // Combine with original importance (weighted at 50%)
        const originalImportance = memory.importance || 0.5;
        memory.importance = 0.5 * originalImportance + 0.5 * (accessFactor + recencyFactor);
        
        // Ensure importance is between 0 and 1
        memory.importance = Math.max(0, Math.min(1, memory.importance));
    }
    
    async checkForMemoryPromotion(memory, currentType) {
        // Check if memory should be promoted to a higher tier based on importance
        
        let targetType = null;
        
        if (currentType === this.memoryTypes.SHORT_TERM && 
            memory.importance >= this.importanceThresholds[this.memoryTypes.MEDIUM_TERM]) {
            targetType = this.memoryTypes.MEDIUM_TERM;
        } else if (currentType === this.memoryTypes.MEDIUM_TERM && 
                  memory.importance >= this.importanceThresholds[this.memoryTypes.LONG_TERM]) {
            targetType = this.memoryTypes.LONG_TERM;
        }
        
        if (targetType) {
            try {
                // Add to target store
                const addTransaction = this.db.transaction([targetType], 'readwrite');
                const addStore = addTransaction.objectStore(targetType);
                addStore.add(memory);
                
                // Remove from current store
                const deleteTransaction = this.db.transaction([currentType], 'readwrite');
                const deleteStore = deleteTransaction.objectStore(currentType);
                deleteStore.delete(memory.id);
                
                console.log(`Promoted memory ${memory.id} from ${currentType} to ${targetType}`);
            } catch (error) {
                console.error('Error promoting memory:', error);
            }
        }
    }
    
    findMemoryType(id) {
        if (this.fallbackMode) {
            for (const type of Object.values(this.memoryTypes)) {
                if (this.fallbackStorage[type][id]) {
                    return type;
                }
            }
        } else {
            // This would require checking each store, which is inefficient
            // In a real implementation, we might use a separate index or mapping
            return null;
        }
    }
    
    encryptSensitiveData(data) {
        // This is a placeholder for actual encryption
        // In a real implementation, this would use proper encryption
        
        // For now, just return the data as is
        return data;
    }
    
    decryptSensitiveData(data) {
        // This is a placeholder for actual decryption
        // In a real implementation, this would use proper decryption
        
        // For now, just return the data as is
        return data;
    }
    
    async waitForInitialization() {
        if (this.initialized) return;
        
        return new Promise(resolve => {
            const checkInterval = setInterval(() => {
                if (this.initialized) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        });
    }
    
    // Public API
    
    async storeFact(key, value, importance = 0.5) {
        return this.storeMemory(
            { key, value },
            this.memoryCategories.FACT,
            importance
        );
    }
    
    async retrieveFact(key) {
        const memories = await this.searchMemories(
            key,
            {
                categories: [this.memoryCategories.FACT],
                threshold: 0.9,
                limit: 1
            }
        );
        
        if (memories.length > 0 && memories[0].data.key === key) {
            return memories[0].data.value;
        }
        
        return null;
    }
    
    async storePreference(key, value, importance = 0.7) {
        return this.storeMemory(
            { key, value },
            this.memoryCategories.PREFERENCE,
            importance
        );
    }
    
    async retrievePreference(key) {
        const memories = await this.searchMemories(
            key,
            {
                categories: [this.memoryCategories.PREFERENCE],
                threshold: 0.9,
                limit: 1
            }
        );
        
        if (memories.length > 0 && memories[0].data.key === key) {
            return memories[0].data.value;
        }
        
        return null;
    }
    
    async storeConversation(userMessage, systemMessage, importance = 0.5) {
        return this.storeMemory(
            { user: userMessage, system: systemMessage },
            this.memoryCategories.CONVERSATION,
            importance
        );
    }
    
    async retrieveRecentConversations(limit = 10) {
        return this.retrieveMemoriesByCategory(
            this.memoryCategories.CONVERSATION,
            limit
        );
    }
    
    async clearMemory(memoryType = null) {
        if (!this.initialized) {
            await this.waitForInitialization();
        }
        
        if (memoryType) {
            // Clear specific memory type
            if (this.fallbackMode) {
                this.fallbackStorage[memoryType] = {};
                localStorage.setItem('MeAIMemoryFallback', JSON.stringify(this.fallbackStorage));
            } else {
                const transaction = this.db.transaction([memoryType], 'readwrite');
                const store = transaction.objectStore(memoryType);
                store.clear();
            }
            
            console.log(`Cleared ${memoryType} memory`);
        } else {
            // Clear all memory types
            for (const type of Object.values(this.memoryTypes)) {
                if (this.fallbackMode) {
                    this.fallbackStorage[type] = {};
                } else {
                    const transaction = this.db.transaction([type], 'readwrite');
                    const store = transaction.objectStore(type);
                    store.clear();
                }
            }
            
            if (this.fallbackMode) {
                localStorage.setItem('MeAIMemoryFallback', JSON.stringify(this.fallbackStorage));
            }
            
            console.log('Cleared all memory');
        }
        
        // Publish memory cleared event
        if (window.eventSystem) {
            window.eventSystem.publish('memory-cleared', { type: memoryType });
        }
    }
    
    async exportMemory() {
        if (!this.initialized) {
            await this.waitForInitialization();
        }
        
        const exportData = {
            version: '1.0',
            timestamp: Date.now(),
            memories: {}
        };
        
        if (this.fallbackMode) {
            exportData.memories = this.fallbackStorage;
        } else {
            for (const type of Object.values(this.memoryTypes)) {
                exportData.memories[type] = await new Promise((resolve, reject) => {
                    const transaction = this.db.transaction([type], 'readonly');
                    const store = transaction.objectStore(type);
                    const request = store.getAll();
                    
                    request.onsuccess = (event) => {
                        resolve(event.target.result);
                    };
                    
                    request.onerror = (event) => {
                        reject(event.target.error);
                    };
                });
            }
        }
        
        return exportData;
    }
    
    async importMemory(importData) {
        if (!this.initialized) {
            await this.waitForInitialization();
        }
        
        if (!importData || !importData.version || !importData.memories) {
            throw new Error('Invalid import data format');
        }
        
        // Clear existing memory
        await this.clearMemory();
        
        // Import memories
        if (this.fallbackMode) {
            this.fallbackStorage = importData.memories;
            localStorage.setItem('MeAIMemoryFallback', JSON.stringify(this.fallbackStorage));
        } else {
            for (const [type, memories] of Object.entries(importData.memories)) {
                if (!Array.isArray(memories)) continue;
                
                const transaction = this.db.transaction([type], 'readwrite');
                const store = transaction.objectStore(type);
                
                for (const memory of memories) {
                    store.add(memory);
                }
            }
        }
        
        console.log('Memory import completed');
        
        // Publish memory imported event
        if (window.eventSystem) {
            window.eventSystem.publish('memory-imported', { timestamp: Date.now() });
        }
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LongTermMemorySystem;
}
