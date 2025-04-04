// Advanced User Profiles System for MeAI
// This system enhances user personalization with comprehensive profiles and adaptive interfaces

class AdvancedUserProfileSystem {
    constructor() {
        this.initialized = false;
        this.currentProfile = null;
        this.defaultProfile = {
            id: 'default',
            name: 'Default User',
            preferences: {
                theme: 'default',
                volume: 0.8,
                speechRate: 1.0,
                accessibility: {
                    highContrast: false,
                    largeText: false,
                    reducedMotion: false,
                    screenReader: false,
                    colorBlindMode: 'none' // none, protanopia, deuteranopia, tritanopia
                }
            },
            interests: [],
            behavior: {
                sessionCount: 0,
                totalInteractionTime: 0,
                lastSession: null,
                frequentTopics: {},
                responsePreferences: {}
            },
            conversationStyle: 'balanced', // casual, balanced, formal
            notifications: {
                enabled: true,
                types: {
                    updates: true,
                    reminders: true,
                    suggestions: true
                }
            },
            created: Date.now(),
            lastModified: Date.now()
        };
        
        // Initialize system
        this.init();
    }
    
    async init() {
        try {
            // Check for storage support
            if (!window.localStorage) {
                console.warn('LocalStorage not supported. Using memory storage.');
                this.useMemoryStorage();
                return;
            }
            
            // Initialize storage
            this.storage = window.localStorage;
            
            // Load profiles
            await this.loadProfiles();
            
            // Load current profile
            await this.loadCurrentProfile();
            
            this.initialized = true;
            console.log('User profile system initialized');
            
            // Publish initialization event
            if (window.eventSystem) {
                window.eventSystem.publish('profile-system-initialized', { success: true });
            }
            
            // Apply current profile settings
            this.applyProfileSettings();
        } catch (error) {
            console.error('Error initializing user profile system:', error);
            this.useMemoryStorage();
        }
    }
    
    useMemoryStorage() {
        // Use in-memory storage as fallback
        this.memoryStorage = {
            profiles: {},
            currentProfileId: null
        };
        
        // Create default profile
        this.memoryStorage.profiles[this.defaultProfile.id] = this.defaultProfile;
        this.memoryStorage.currentProfileId = this.defaultProfile.id;
        this.currentProfile = this.defaultProfile;
        
        this.initialized = true;
        console.log('User profile system initialized with memory storage');
        
        // Publish initialization event
        if (window.eventSystem) {
            window.eventSystem.publish('profile-system-initialized', { 
                success: true, 
                memoryMode: true 
            });
        }
    }
    
    async loadProfiles() {
        try {
            // Get profiles from storage
            const profilesJson = this.storage.getItem('meai_profiles');
            
            if (profilesJson) {
                this.profiles = JSON.parse(profilesJson);
            } else {
                // Initialize with default profile
                this.profiles = {
                    [this.defaultProfile.id]: this.defaultProfile
                };
                
                // Save to storage
                this.storage.setItem('meai_profiles', JSON.stringify(this.profiles));
            }
            
            return true;
        } catch (error) {
            console.error('Error loading profiles:', error);
            
            // Initialize with default profile
            this.profiles = {
                [this.defaultProfile.id]: this.defaultProfile
            };
            
            return false;
        }
    }
    
    async loadCurrentProfile() {
        try {
            // Get current profile ID from storage
            const currentProfileId = this.storage.getItem('meai_current_profile');
            
            if (currentProfileId && this.profiles[currentProfileId]) {
                this.currentProfile = this.profiles[currentProfileId];
            } else {
                // Use default profile
                this.currentProfile = this.profiles[this.defaultProfile.id];
                
                // Save to storage
                this.storage.setItem('meai_current_profile', this.defaultProfile.id);
            }
            
            return true;
        } catch (error) {
            console.error('Error loading current profile:', error);
            
            // Use default profile
            this.currentProfile = this.profiles[this.defaultProfile.id];
            
            return false;
        }
    }
    
    async saveProfiles() {
        if (!this.initialized) {
            await this.waitForInitialization();
        }
        
        try {
            if (this.memoryStorage) {
                // Using memory storage
                this.memoryStorage.profiles = this.profiles;
                return true;
            } else {
                // Save to localStorage
                this.storage.setItem('meai_profiles', JSON.stringify(this.profiles));
                return true;
            }
        } catch (error) {
            console.error('Error saving profiles:', error);
            return false;
        }
    }
    
    async saveCurrentProfile() {
        if (!this.initialized) {
            await this.waitForInitialization();
        }
        
        try {
            if (this.memoryStorage) {
                // Using memory storage
                this.memoryStorage.currentProfileId = this.currentProfile.id;
                return true;
            } else {
                // Save to localStorage
                this.storage.setItem('meai_current_profile', this.currentProfile.id);
                return true;
            }
        } catch (error) {
            console.error('Error saving current profile:', error);
            return false;
        }
    }
    
    // Profile Management Methods
    
    async createProfile(profileData = {}) {
        if (!this.initialized) {
            await this.waitForInitialization();
        }
        
        try {
            // Generate unique ID
            const profileId = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Create new profile by merging with default
            const newProfile = {
                ...JSON.parse(JSON.stringify(this.defaultProfile)), // Deep copy
                ...profileData,
                id: profileId,
                created: Date.now(),
                lastModified: Date.now()
            };
            
            // Add to profiles
            this.profiles[profileId] = newProfile;
            
            // Save profiles
            await this.saveProfiles();
            
            console.log(`Created profile: ${profileId}`);
            
            // Publish profile created event
            if (window.eventSystem) {
                window.eventSystem.publish('profile-created', { 
                    profileId: profileId,
                    profileName: newProfile.name
                });
            }
            
            return profileId;
        } catch (error) {
            console.error('Error creating profile:', error);
            return null;
        }
    }
    
    async getProfile(profileId) {
        if (!this.initialized) {
            await this.waitForInitialization();
        }
        
        if (!profileId) {
            return null;
        }
        
        return this.profiles[profileId] || null;
    }
    
    async updateProfile(profileId, updates) {
        if (!this.initialized) {
            await this.waitForInitialization();
        }
        
        try {
            const profile = this.profiles[profileId];
            
            if (!profile) {
                console.error(`Profile ${profileId} not found`);
                return false;
            }
            
            // Apply updates
            this.deepMerge(profile, updates);
            
            // Update modification timestamp
            profile.lastModified = Date.now();
            
            // Save profiles
            await this.saveProfiles();
            
            // If updating current profile, apply settings
            if (this.currentProfile.id === profileId) {
                this.currentProfile = profile;
                this.applyProfileSettings();
            }
            
            console.log(`Updated profile: ${profileId}`);
            
            // Publish profile updated event
            if (window.eventSystem) {
                window.eventSystem.publish('profile-updated', { 
                    profileId: profileId,
                    profileName: profile.name
                });
            }
            
            return true;
        } catch (error) {
            console.error(`Error updating profile ${profileId}:`, error);
            return false;
        }
    }
    
    async deleteProfile(profileId) {
        if (!this.initialized) {
            await this.waitForInitialization();
        }
        
        try {
            // Check if profile exists
            if (!this.profiles[profileId]) {
                console.error(`Profile ${profileId} not found`);
                return false;
            }
            
            // Check if trying to delete default profile
            if (profileId === this.defaultProfile.id) {
                console.error('Cannot delete default profile');
                return false;
            }
            
            // Check if trying to delete current profile
            if (this.currentProfile.id === profileId) {
                // Switch to default profile
                this.currentProfile = this.profiles[this.defaultProfile.id];
                await this.saveCurrentProfile();
                this.applyProfileSettings();
            }
            
            // Delete profile
            delete this.profiles[profileId];
            
            // Save profiles
            await this.saveProfiles();
            
            console.log(`Deleted profile: ${profileId}`);
            
            // Publish profile deleted event
            if (window.eventSystem) {
                window.eventSystem.publish('profile-deleted', { 
                    profileId: profileId
                });
            }
            
            return true;
        } catch (error) {
            console.error(`Error deleting profile ${profileId}:`, error);
            return false;
        }
    }
    
    async switchProfile(profileId) {
        if (!this.initialized) {
            await this.waitForInitialization();
        }
        
        try {
            // Check if profile exists
            if (!this.profiles[profileId]) {
                console.error(`Profile ${profileId} not found`);
                return false;
            }
            
            // Switch profile
            this.currentProfile = this.profiles[profileId];
            
            // Save current profile
            await this.saveCurrentProfile();
            
            // Apply profile settings
            this.applyProfileSettings();
            
            console.log(`Switched to profile: ${profileId}`);
            
            // Publish profile switched event
            if (window.eventSystem) {
                window.eventSystem.publish('profile-switched', { 
                    profileId: profileId,
                    profileName: this.currentProfile.name
                });
            }
            
            return true;
        } catch (error) {
            console.error(`Error switching to profile ${profileId}:`, error);
            return false;
        }
    }
    
    getCurrentProfile() {
        return this.currentProfile;
    }
    
    getAllProfiles() {
        return Object.values(this.profiles);
    }
    
    // Preference Management Methods
    
    async setPreference(key, value) {
        if (!this.initialized) {
            await this.waitForInitialization();
        }
        
        try {
            // Parse key path (e.g., "preferences.theme" -> ["preferences", "theme"])
            const keyPath = key.split('.');
            
            // Navigate to the correct object
            let target = this.currentProfile;
            for (let i = 0; i < keyPath.length - 1; i++) {
                const segment = keyPath[i];
                
                if (!target[segment]) {
                    target[segment] = {};
                }
                
                target = target[segment];
            }
            
            // Set the value
            const finalKey = keyPath[keyPath.length - 1];
            target[finalKey] = value;
            
            // Update modification timestamp
            this.currentProfile.lastModified = Date.now();
            
            // Save profiles
            await this.saveProfiles();
            
            // Apply settings if necessary
            this.applyProfileSettings();
            
            console.log(`Set preference ${key} to ${value}`);
            
            // Publish preference updated event
            if (window.eventSystem) {
                window.eventSystem.publish('preference-updated', { 
                    key: key,
                    value: value
                });
            }
            
            return true;
        } catch (error) {
            console.error(`Error setting preference ${key}:`, error);
            return false;
        }
    }
    
    async getPreference(key, defaultValue = null) {
        if (!this.initialized) {
            await this.waitForInitialization();
        }
        
        try {
            // Parse key path
            const keyPath = key.split('.');
            
            // Navigate to the value
            let target = this.currentProfile;
            for (const segment of keyPath) {
                if (target === undefined || target === null) {
                    return defaultValue;
                }
                
                target = target[segment];
            }
            
            return target !== undefined ? target : defaultValue;
        } catch (error) {
            console.error(`Error getting preference ${key}:`, error);
            return defaultValue;
        }
    }
    
    // Interest Tracking Methods
    
    async addInterest(interest) {
        if (!this.initialized) {
            await this.waitForInitialization();
        }
        
        try {
            // Ensure interests array exists
            if (!this.currentProfile.interests) {
                this.currentProfile.interests = [];
            }
            
            // Check if interest already exists
            if (!this.currentProfile.interests.includes(interest)) {
                // Add interest
                this.currentProfile.interests.push(interest);
                
                // Update modification timestamp
                this.currentProfile.lastModified = Date.now();
                
                // Save profiles
                await this.saveProfiles();
                
                console.log(`Added interest: ${interest}`);
                
                // Publish interest added event
                if (window.eventSystem) {
                    window.eventSystem.publish('interest-added', { 
                        interest: interest
                    });
                }
            }
            
            return true;
        } catch (error) {
            console.error(`Error adding interest ${interest}:`, error);
            return false;
        }
    }
    
    async removeInterest(interest) {
        if (!this.initialized) {
            await this.waitForInitialization();
        }
        
        try {
            // Ensure interests array exists
            if (!this.currentProfile.interests) {
                return true;
            }
            
            // Find interest index
            const index = this.currentProfile.interests.indexOf(interest);
            
            if (index !== -1) {
                // Remove interest
                this.currentProfile.interests.splice(index, 1);
                
                // Update modification timestamp
                this.currentProfile.lastModified = Date.now();
                
                // Save profiles
                await this.saveProfiles();
                
                console.log(`Removed interest: ${interest}`);
                
                // Publish interest removed event
                if (window.eventSystem) {
                    window.eventSystem.publish('interest-removed', { 
                        interest: interest
                    });
                }
            }
            
            return true;
        } catch (error) {
            console.error(`Error removing interest ${interest}:`, error);
            return false;
        }
    }
    
    async getInterests() {
        if (!this.initialized) {
            await this.waitForInitialization();
        }
        
        return this.currentProfile.interests || [];
    }
    
    // Behavior Tracking Methods
    
    async trackBehavior(action, data = {}) {
        if (!this.initialized) {
            await this.waitForInitialization();
        }
        
        try {
            // Ensure behavior object exists
            if (!this.currentProfile.behavior) {
                this.currentProfile.behavior = {
                    sessionCount: 0,
                    totalInteractionTime: 0,
                    lastSession: null,
                    frequentTopics: {},
                    responsePreferences: {}
                };
            }
            
            const behavior = this.currentProfile.behavior;
            
            // Handle different action types
            switch (action) {
                case 'session_start':
                    behavior.sessionCount++;
                    behavior.lastSession = Date.now();
                    break;
                    
                case 'session_end':
                    if (behavior.lastSession) {
                        const sessionDuration = (Date.now() - behavior.lastSession) / 1000; // in seconds
                        behavior.totalInteractionTime += sessionDuration;
                    }
                    break;
                    
                case 'topic_discussed':
                    if (data.topic) {
                        if (!behavior.frequentTopics[data.topic]) {
                            behavior.frequentTopics[data.topic] = 0;
                        }
                        behavior.frequentTopics[data.topic]++;
                    }
                    break;
                    
                case 'response_preference':
                    if (data.type && data.value !== undefined) {
                        if (!behavior.responsePreferences[data.type]) {
                            behavior.responsePreferences[data.type] = 0;
                        }
                        behavior.responsePreferences[data.type] += data.value;
                    }
                    break;
                    
                default:
                    // Custom behavior tracking
                    if (!behavior.custom) {
                        behavior.custom = {};
                    }
                    
                    behavior.custom[action] = data;
                    break;
            }
            
            // Update modification timestamp
            this.currentProfile.lastModified = Date.now();
            
            // Save profiles
            await this.saveProfiles();
            
            return true;
        } catch (error) {
            console.error(`Error tracking behavior ${action}:`, error);
            return false;
        }
    }
    
    async getBehaviorInsights() {
        if (!this.initialized) {
            await this.waitForInitialization();
        }
        
        try {
            const behavior = this.currentProfile.behavior || {};
            
            // Calculate insights
            const insights = {
                engagementLevel: this.calculateEngagementLevel(behavior),
                topInterests: this.getTopInterests(behavior),
                interactionStyle: this.determineInteractionStyle(behavior),
                sessionFrequency: this.calculateSessionFrequency(behavior),
                recommendedTopics: this.generateRecommendedTopics(behavior)
            };
            
            return insights;
        } catch (error) {
            console.error('Error getting behavior insights:', error);
            return {};
        }
    }
    
    calculateEngagementLevel(behavior) {
        // Simple engagement calculation based on session count and total time
        if (!behavior.sessionCount) {
            return 'new';
        }
        
        const avgSessionTime = behavior.totalInteractionTime / behavior.sessionCount;
        
        if (behavior.sessionCount < 3) {
            return 'beginner';
        } else if (behavior.sessionCount < 10) {
            return avgSessionTime < 60 ? 'casual' : 'regular';
        } else {
            return avgSessionTime < 300 ? 'regular' : 'engaged';
        }
    }
    
    getTopInterests(behavior) {
        const topics = behavior.frequentTopics || {};
        
        // Sort topics by frequency
        return Object.entries(topics)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(entry => entry[0]);
    }
    
    determineInteractionStyle(behavior) {
        const preferences = behavior.responsePreferences || {};
        
        // Calculate scores for different styles
        let conciseScore = preferences.concise || 0;
        let detailedScore = preferences.detailed || 0;
        let casualScore = preferences.casual || 0;
        let formalScore = preferences.formal || 0;
        
        // Determine primary style
        if (conciseScore > detailedScore && conciseScore > casualScore && conciseScore > formalScore) {
            return 'concise';
        } else if (detailedScore > conciseScore && detailedScore > casualScore && detailedScore > formalScore) {
            return 'detailed';
        } else if (casualScore > conciseScore && casualScore > detailedScore && casualScore > formalScore) {
            return 'casual';
        } else if (formalScore > conciseScore && formalScore > detailedScore && formalScore > casualScore) {
            return 'formal';
        } else {
            return 'balanced';
        }
    }
    
    calculateSessionFrequency(behavior) {
        if (!behavior.sessionCount || !behavior.lastSession) {
            return 'new';
        }
        
        const daysSinceLastSession = (Date.now() - behavior.lastSession) / (1000 * 60 * 60 * 24);
        const totalDays = Math.max(1, daysSinceLastSession);
        const sessionsPerDay = behavior.sessionCount / totalDays;
        
        if (sessionsPerDay < 0.1) {
            return 'rare';
        } else if (sessionsPerDay < 0.5) {
            return 'occasional';
        } else if (sessionsPerDay < 1) {
            return 'regular';
        } else {
            return 'frequent';
        }
    }
    
    generateRecommendedTopics(behavior) {
        // This would implement a recommendation algorithm based on user behavior
        // For now, return a simple placeholder
        return ['AI advancements', 'Personalization', 'Voice interfaces', 'Ambient computing', 'Digital wellbeing'];
    }
    
    // UI Adaptation Methods
    
    applyProfileSettings() {
        if (!this.initialized || !this.currentProfile) {
            return;
        }
        
        try {
            // Apply theme
            this.applyTheme(this.currentProfile.preferences.theme);
            
            // Apply accessibility settings
            this.applyAccessibilitySettings(this.currentProfile.preferences.accessibility);
            
            // Apply audio settings
            this.applyAudioSettings(this.currentProfile.preferences.volume, this.currentProfile.preferences.speechRate);
            
            // Apply conversation style
            this.applyConversationStyle(this.currentProfile.conversationStyle);
            
            console.log('Applied profile settings');
            
            // Publish settings applied event
            if (window.eventSystem) {
                window.eventSystem.publish('profile-settings-applied', { 
                    profileId: this.currentProfile.id,
                    profileName: this.currentProfile.name
                });
            }
        } catch (error) {
            console.error('Error applying profile settings:', error);
        }
    }
    
    applyTheme(theme) {
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', theme);
        
        // Publish theme change event
        if (window.eventSystem) {
            window.eventSystem.publish('theme-changed', { theme });
        }
    }
    
    applyAccessibilitySettings(settings) {
        if (!settings) return;
        
        // Apply high contrast
        if (settings.highContrast) {
            document.documentElement.classList.add('high-contrast');
        } else {
            document.documentElement.classList.remove('high-contrast');
        }
        
        // Apply large text
        if (settings.largeText) {
            document.documentElement.classList.add('large-text');
        } else {
            document.documentElement.classList.remove('large-text');
        }
        
        // Apply reduced motion
        if (settings.reducedMotion) {
            document.documentElement.classList.add('reduced-motion');
        } else {
            document.documentElement.classList.remove('reduced-motion');
        }
        
        // Apply color blind mode
        document.documentElement.setAttribute('data-color-blind', settings.colorBlindMode || 'none');
        
        // Apply screen reader optimizations
        if (settings.screenReader) {
            document.documentElement.classList.add('screen-reader-optimized');
        } else {
            document.documentElement.classList.remove('screen-reader-optimized');
        }
        
        // Publish accessibility settings change event
        if (window.eventSystem) {
            window.eventSystem.publish('accessibility-settings-changed', settings);
        }
    }
    
    applyAudioSettings(volume, speechRate) {
        // Apply volume if spatial audio system exists
        if (window.spatialAudioSystem) {
            window.spatialAudioSystem.setMasterVolume(volume);
        }
        
        // Apply speech rate if voice synthesis exists
        if (window.voiceSynthesis) {
            window.voiceSynthesis.setRate(speechRate);
        }
        
        // Publish audio settings change event
        if (window.eventSystem) {
            window.eventSystem.publish('audio-settings-changed', { 
                volume, 
                speechRate 
            });
        }
    }
    
    applyConversationStyle(style) {
        // Publish conversation style change event
        if (window.eventSystem) {
            window.eventSystem.publish('conversation-style-changed', { style });
        }
    }
    
    // Adaptive UI Methods
    
    getAdaptiveUIRecommendations() {
        if (!this.initialized || !this.currentProfile) {
            return {};
        }
        
        try {
            // Get behavior insights
            const behavior = this.currentProfile.behavior || {};
            const preferences = this.currentProfile.preferences || {};
            
            // Generate UI recommendations
            const recommendations = {
                layoutComplexity: this.recommendLayoutComplexity(behavior, preferences),
                informationDensity: this.recommendInformationDensity(behavior, preferences),
                interactionMode: this.recommendInteractionMode(behavior, preferences),
                visualElements: this.recommendVisualElements(behavior, preferences),
                contentPriorities: this.recommendContentPriorities(behavior, preferences)
            };
            
            return recommendations;
        } catch (error) {
            console.error('Error generating adaptive UI recommendations:', error);
            return {};
        }
    }
    
    recommendLayoutComplexity(behavior, preferences) {
        // Determine appropriate layout complexity based on user behavior and preferences
        
        // Check accessibility preferences first
        if (preferences.accessibility && (preferences.accessibility.largeText || preferences.accessibility.screenReader)) {
            return 'simple';
        }
        
        // Check engagement level
        const engagementLevel = this.calculateEngagementLevel(behavior);
        
        if (engagementLevel === 'new' || engagementLevel === 'beginner') {
            return 'simple';
        } else if (engagementLevel === 'casual') {
            return 'moderate';
        } else {
            return 'advanced';
        }
    }
    
    recommendInformationDensity(behavior, preferences) {
        // Determine appropriate information density
        
        // Check accessibility preferences first
        if (preferences.accessibility && (preferences.accessibility.largeText || preferences.accessibility.screenReader)) {
            return 'low';
        }
        
        // Check interaction style
        const interactionStyle = this.determineInteractionStyle(behavior);
        
        if (interactionStyle === 'concise') {
            return 'high';
        } else if (interactionStyle === 'detailed') {
            return 'medium';
        } else {
            return 'adaptive'; // Adjust based on context
        }
    }
    
    recommendInteractionMode(behavior, preferences) {
        // Determine preferred interaction mode
        
        // Check accessibility preferences first
        if (preferences.accessibility && preferences.accessibility.screenReader) {
            return 'voice';
        }
        
        // Default to multi-modal
        return 'multi-modal';
    }
    
    recommendVisualElements(behavior, preferences) {
        // Determine appropriate visual elements
        
        // Check accessibility preferences first
        if (preferences.accessibility && preferences.accessibility.reducedMotion) {
            return {
                animations: 'minimal',
                transitions: 'simple',
                effects: 'none'
            };
        }
        
        // Check theme
        const theme = preferences.theme || 'default';
        
        if (theme === 'minimal') {
            return {
                animations: 'subtle',
                transitions: 'simple',
                effects: 'minimal'
            };
        } else if (theme === 'vibrant') {
            return {
                animations: 'dynamic',
                transitions: 'elaborate',
                effects: 'full'
            };
        } else {
            return {
                animations: 'moderate',
                transitions: 'smooth',
                effects: 'standard'
            };
        }
    }
    
    recommendContentPriorities(behavior, preferences) {
        // Determine content priorities based on interests and behavior
        
        // Get top interests
        const topInterests = this.getTopInterests(behavior);
        
        // Map interests to content categories
        const contentPriorities = {
            primary: topInterests[0] || 'general',
            secondary: topInterests.slice(1, 3),
            tertiary: topInterests.slice(3)
        };
        
        return contentPriorities;
    }
    
    // Synchronization Methods
    
    async exportProfiles() {
        if (!this.initialized) {
            await this.waitForInitialization();
        }
        
        try {
            // Create export data
            const exportData = {
                version: '1.0',
                timestamp: Date.now(),
                profiles: this.profiles,
                currentProfileId: this.currentProfile.id
            };
            
            // Convert to JSON
            return JSON.stringify(exportData);
        } catch (error) {
            console.error('Error exporting profiles:', error);
            return null;
        }
    }
    
    async importProfiles(importData) {
        if (!this.initialized) {
            await this.waitForInitialization();
        }
        
        try {
            // Parse import data
            const data = typeof importData === 'string' ? JSON.parse(importData) : importData;
            
            // Validate data
            if (!data || !data.version || !data.profiles) {
                throw new Error('Invalid import data format');
            }
            
            // Import profiles
            this.profiles = data.profiles;
            
            // Ensure default profile exists
            if (!this.profiles[this.defaultProfile.id]) {
                this.profiles[this.defaultProfile.id] = this.defaultProfile;
            }
            
            // Set current profile
            if (data.currentProfileId && this.profiles[data.currentProfileId]) {
                this.currentProfile = this.profiles[data.currentProfileId];
            } else {
                this.currentProfile = this.profiles[this.defaultProfile.id];
            }
            
            // Save to storage
            await this.saveProfiles();
            await this.saveCurrentProfile();
            
            // Apply profile settings
            this.applyProfileSettings();
            
            console.log('Profiles imported successfully');
            
            // Publish profiles imported event
            if (window.eventSystem) {
                window.eventSystem.publish('profiles-imported', { 
                    timestamp: Date.now(),
                    profileCount: Object.keys(this.profiles).length
                });
            }
            
            return true;
        } catch (error) {
            console.error('Error importing profiles:', error);
            return false;
        }
    }
    
    async syncWithCloud(userId, authToken) {
        // This would implement cloud synchronization
        // For now, return a placeholder
        console.log('Cloud synchronization not implemented');
        return false;
    }
    
    // Utility Methods
    
    deepMerge(target, source) {
        // Deep merge two objects
        for (const key in source) {
            if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
                this.deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
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
    
    async getTheme() {
        return this.getPreference('preferences.theme', 'default');
    }
    
    async setTheme(theme) {
        return this.setPreference('preferences.theme', theme);
    }
    
    async getAccessibilitySettings() {
        return this.getPreference('preferences.accessibility', {});
    }
    
    async setAccessibilitySetting(setting, value) {
        return this.setPreference(`preferences.accessibility.${setting}`, value);
    }
    
    async getVolume() {
        return this.getPreference('preferences.volume', 0.8);
    }
    
    async setVolume(volume) {
        return this.setPreference('preferences.volume', volume);
    }
    
    async getSpeechRate() {
        return this.getPreference('preferences.speechRate', 1.0);
    }
    
    async setSpeechRate(rate) {
        return this.setPreference('preferences.speechRate', rate);
    }
    
    async getConversationStyle() {
        return this.getPreference('conversationStyle', 'balanced');
    }
    
    async setConversationStyle(style) {
        return this.setPreference('conversationStyle', style);
    }
    
    async startSession() {
        return this.trackBehavior('session_start');
    }
    
    async endSession() {
        return this.trackBehavior('session_end');
    }
    
    async trackTopic(topic) {
        return this.trackBehavior('topic_discussed', { topic });
    }
    
    async trackResponsePreference(type, value) {
        return this.trackBehavior('response_preference', { type, value });
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedUserProfileSystem;
}
