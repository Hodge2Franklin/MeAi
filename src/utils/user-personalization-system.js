/**
 * User Personalization System
 * 
 * This system allows users to personalize their MeAI experience with
 * custom settings, preferences, and profiles.
 */

class UserPersonalizationSystem {
    constructor() {
        // Initialize dependencies
        this.storageManager = window.storageManager;
        this.eventSystem = window.eventSystem;
        this.themeSystem = window.themeSystem;
        
        // Default user profile
        this.defaultProfile = {
            id: 'default',
            name: 'Default',
            preferences: {
                theme: 'default',
                voicePreferences: {
                    voice: 'default',
                    volume: 1.0,
                    pitch: 1.0,
                    rate: 1.0,
                    pattern: 'natural'
                },
                audioPreferences: {
                    ambientVolume: 0.5,
                    interactionSoundsEnabled: true,
                    interactionSoundsVolume: 0.7,
                    preferredAmbientType: 'cosmic'
                },
                visualPreferences: {
                    pixelAnimationSpeed: 1.0,
                    backgroundIntensity: 0.8,
                    interfaceAnimationsEnabled: true,
                    highContrastMode: false,
                    reducedMotion: false,
                    largeText: false,
                    colorBlindMode: 'none'
                },
                conversationPreferences: {
                    responseLength: 'medium',
                    conversationStyle: 'balanced',
                    memoryRetention: 'medium',
                    emotionalResponsiveness: 0.7
                },
                notificationPreferences: {
                    soundEnabled: true,
                    visualEnabled: true,
                    notifyOnResponse: true
                }
            },
            history: {
                lastInteraction: null,
                interactionCount: 0,
                favoriteTopics: [],
                savedConversations: []
            },
            created: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };
        
        // State
        this.state = {
            initialized: false,
            currentProfile: 'default',
            profiles: {},
            activePreferences: JSON.parse(JSON.stringify(this.defaultProfile.preferences)),
            unsavedChanges: false
        };
        
        // Initialize
        this.initialize();
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    /**
     * Initialize the user personalization system
     */
    async initialize() {
        try {
            // Load profiles from storage
            await this.loadProfiles();
            
            // Load last active profile
            const lastActiveProfile = await this.storageManager.getLocalStorage('lastActiveProfile');
            if (lastActiveProfile && this.state.profiles[lastActiveProfile]) {
                this.state.currentProfile = lastActiveProfile;
            }
            
            // Apply current profile preferences
            await this.applyProfilePreferences(this.state.currentProfile);
            
            console.log('User Personalization System initialized');
            
            // Notify system that personalization is ready
            this.eventSystem.publish('personalization-ready', {
                profiles: Object.keys(this.state.profiles),
                currentProfile: this.state.currentProfile
            });
            
            this.state.initialized = true;
        } catch (error) {
            console.error('Error initializing user personalization system:', error);
        }
    }
    
    /**
     * Load profiles from storage
     */
    async loadProfiles() {
        try {
            // Get profiles from IndexedDB
            const profiles = await this.storageManager.getAllIndexedDB('profiles');
            
            // If no profiles found, create default profile
            if (!profiles || profiles.length === 0) {
                // Create default profile
                await this.storageManager.setIndexedDB('profiles', this.defaultProfile);
                
                // Set default profile
                this.state.profiles[this.defaultProfile.id] = this.defaultProfile;
            } else {
                // Process profiles
                profiles.forEach(profile => {
                    this.state.profiles[profile.id] = profile;
                });
            }
            
            console.log(`Loaded ${Object.keys(this.state.profiles).length} profiles`);
        } catch (error) {
            console.error('Error loading profiles:', error);
            
            // Set default profile if error
            this.state.profiles[this.defaultProfile.id] = this.defaultProfile;
        }
    }
    
    /**
     * Apply profile preferences
     * @param {string} profileId - Profile ID
     */
    async applyProfilePreferences(profileId) {
        // Get profile
        const profile = this.state.profiles[profileId];
        
        // If profile not found, use default
        if (!profile) {
            console.warn(`Profile not found: ${profileId}, using default`);
            profileId = 'default';
        }
        
        // Update current profile
        this.state.currentProfile = profileId;
        
        // Save last active profile
        this.storageManager.setLocalStorage('lastActiveProfile', profileId);
        
        // Get preferences
        const preferences = this.state.profiles[profileId].preferences;
        
        // Apply theme
        if (preferences.theme) {
            this.eventSystem.publish('theme-change', { theme: preferences.theme });
        }
        
        // Apply voice preferences
        if (preferences.voicePreferences) {
            const vp = preferences.voicePreferences;
            
            if (vp.voice) {
                this.eventSystem.publish('voice-change', { voice: vp.voice });
            }
            
            if (vp.volume !== undefined) {
                this.eventSystem.publish('voice-volume-change', { volume: vp.volume });
            }
            
            if (vp.pitch !== undefined) {
                this.eventSystem.publish('voice-pitch-change', { pitch: vp.pitch });
            }
            
            if (vp.rate !== undefined) {
                this.eventSystem.publish('voice-rate-change', { rate: vp.rate });
            }
            
            if (vp.pattern) {
                this.eventSystem.publish('voice-pattern-change', { pattern: vp.pattern });
            }
        }
        
        // Apply audio preferences
        if (preferences.audioPreferences) {
            const ap = preferences.audioPreferences;
            
            if (ap.ambientVolume !== undefined) {
                this.eventSystem.publish('ambient-volume-change', { volume: ap.ambientVolume });
            }
            
            if (ap.interactionSoundsEnabled !== undefined) {
                this.eventSystem.publish('interaction-sounds-toggle', { enabled: ap.interactionSoundsEnabled });
            }
            
            if (ap.interactionSoundsVolume !== undefined) {
                this.eventSystem.publish('interaction-sounds-volume-change', { volume: ap.interactionSoundsVolume });
            }
            
            if (ap.preferredAmbientType) {
                this.eventSystem.publish('ambient-type-change', { type: ap.preferredAmbientType });
            }
        }
        
        // Apply visual preferences
        if (preferences.visualPreferences) {
            const vp = preferences.visualPreferences;
            
            if (vp.pixelAnimationSpeed !== undefined) {
                this.eventSystem.publish('pixel-animation-speed-change', { speed: vp.pixelAnimationSpeed });
            }
            
            if (vp.backgroundIntensity !== undefined) {
                this.eventSystem.publish('background-intensity-change', { intensity: vp.backgroundIntensity });
            }
            
            if (vp.interfaceAnimationsEnabled !== undefined) {
                this.eventSystem.publish('interface-animations-toggle', { enabled: vp.interfaceAnimationsEnabled });
            }
            
            if (vp.highContrastMode !== undefined) {
                this.eventSystem.publish('high-contrast-toggle', { enabled: vp.highContrastMode });
            }
            
            if (vp.reducedMotion !== undefined) {
                this.eventSystem.publish('reduced-motion-toggle', { enabled: vp.reducedMotion });
            }
            
            if (vp.largeText !== undefined) {
                this.eventSystem.publish('large-text-toggle', { enabled: vp.largeText });
            }
            
            if (vp.colorBlindMode) {
                this.eventSystem.publish('color-blind-mode-change', { mode: vp.colorBlindMode });
            }
        }
        
        // Apply conversation preferences
        if (preferences.conversationPreferences) {
            const cp = preferences.conversationPreferences;
            
            if (cp.responseLength) {
                this.eventSystem.publish('response-length-change', { length: cp.responseLength });
            }
            
            if (cp.conversationStyle) {
                this.eventSystem.publish('conversation-style-change', { style: cp.conversationStyle });
            }
            
            if (cp.memoryRetention) {
                this.eventSystem.publish('memory-retention-change', { retention: cp.memoryRetention });
            }
            
            if (cp.emotionalResponsiveness !== undefined) {
                this.eventSystem.publish('emotional-responsiveness-change', { level: cp.emotionalResponsiveness });
            }
        }
        
        // Apply notification preferences
        if (preferences.notificationPreferences) {
            const np = preferences.notificationPreferences;
            
            if (np.soundEnabled !== undefined) {
                this.eventSystem.publish('notification-sound-toggle', { enabled: np.soundEnabled });
            }
            
            if (np.visualEnabled !== undefined) {
                this.eventSystem.publish('notification-visual-toggle', { enabled: np.visualEnabled });
            }
            
            if (np.notifyOnResponse !== undefined) {
                this.eventSystem.publish('notification-response-toggle', { enabled: np.notifyOnResponse });
            }
        }
        
        // Update active preferences
        this.state.activePreferences = JSON.parse(JSON.stringify(preferences));
        
        // Reset unsaved changes flag
        this.state.unsavedChanges = false;
        
        // Publish event that profile was applied
        this.eventSystem.publish('profile-applied', {
            profileId: profileId,
            profileName: this.state.profiles[profileId].name
        });
        
        console.log(`Applied profile: ${this.state.profiles[profileId].name}`);
        
        // Update profile history
        this.updateProfileHistory(profileId);
    }
    
    /**
     * Update profile history
     * @param {string} profileId - Profile ID
     */
    async updateProfileHistory(profileId) {
        try {
            // Get profile
            const profile = this.state.profiles[profileId];
            
            // Update last interaction
            profile.history.lastInteraction = new Date().toISOString();
            
            // Increment interaction count
            profile.history.interactionCount++;
            
            // Update last modified
            profile.lastModified = new Date().toISOString();
            
            // Save profile
            await this.storageManager.setIndexedDB('profiles', profile);
            
            // Update local state
            this.state.profiles[profileId] = profile;
        } catch (error) {
            console.error('Error updating profile history:', error);
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for theme change
        this.eventSystem.subscribe('theme-change', (data) => {
            this.updatePreference('theme', data.theme);
        });
        
        // Listen for voice preference changes
        this.eventSystem.subscribe('voice-change', (data) => {
            this.updateNestedPreference('voicePreferences', 'voice', data.voice);
        });
        
        this.eventSystem.subscribe('voice-volume-change', (data) => {
            this.updateNestedPreference('voicePreferences', 'volume', data.volume);
        });
        
        this.eventSystem.subscribe('voice-pitch-change', (data) => {
            this.updateNestedPreference('voicePreferences', 'pitch', data.pitch);
        });
        
        this.eventSystem.subscribe('voice-rate-change', (data) => {
            this.updateNestedPreference('voicePreferences', 'rate', data.rate);
        });
        
        this.eventSystem.subscribe('voice-pattern-change', (data) => {
            this.updateNestedPreference('voicePreferences', 'pattern', data.pattern);
        });
        
        // Listen for audio preference changes
        this.eventSystem.subscribe('ambient-volume-change', (data) => {
            this.updateNestedPreference('audioPreferences', 'ambientVolume', data.volume);
        });
        
        this.eventSystem.subscribe('interaction-sounds-toggle', (data) => {
            this.updateNestedPreference('audioPreferences', 'interactionSoundsEnabled', data.enabled);
        });
        
        this.eventSystem.subscribe('interaction-sounds-volume-change', (data) => {
            this.updateNestedPreference('audioPreferences', 'interactionSoundsVolume', data.volume);
        });
        
        this.eventSystem.subscribe('ambient-type-change', (data) => {
            this.updateNestedPreference('audioPreferences', 'preferredAmbientType', data.type);
        });
        
        // Listen for visual preference changes
        this.eventSystem.subscribe('pixel-animation-speed-change', (data) => {
            this.updateNestedPreference('visualPreferences', 'pixelAnimationSpeed', data.speed);
        });
        
        this.eventSystem.subscribe('background-intensity-change', (data) => {
            this.updateNestedPreference('visualPreferences', 'backgroundIntensity', data.intensity);
        });
        
        this.eventSystem.subscribe('interface-animations-toggle', (data) => {
            this.updateNestedPreference('visualPreferences', 'interfaceAnimationsEnabled', data.enabled);
        });
        
        this.eventSystem.subscribe('high-contrast-toggle', (data) => {
            this.updateNestedPreference('visualPreferences', 'highContrastMode', data.enabled);
        });
        
        this.eventSystem.subscribe('reduced-motion-toggle', (data) => {
            this.updateNestedPreference('visualPreferences', 'reducedMotion', data.enabled);
        });
        
        this.eventSystem.subscribe('large-text-toggle', (data) => {
            this.updateNestedPreference('visualPreferences', 'largeText', data.enabled);
        });
        
        this.eventSystem.subscribe('color-blind-mode-change', (data) => {
            this.updateNestedPreference('visualPreferences', 'colorBlindMode', data.mode);
        });
        
        // Listen for conversation preference changes
        this.eventSystem.subscribe('response-length-change', (data) => {
            this.updateNestedPreference('conversationPreferences', 'responseLength', data.length);
        });
        
        this.eventSystem.subscribe('conversation-style-change', (data) => {
            this.updateNestedPreference('conversationPreferences', 'conversationStyle', data.style);
        });
        
        this.eventSystem.subscribe('memory-retention-change', (data) => {
            this.updateNestedPreference('conversationPreferences', 'memoryRetention', data.retention);
        });
        
        this.eventSystem.subscribe('emotional-responsiveness-change', (data) => {
            this.updateNestedPreference('conversationPreferences', 'emotionalResponsiveness', data.level);
        });
        
        // Listen for notification preference changes
        this.eventSystem.subscribe('notification-sound-toggle', (data) => {
            this.updateNestedPreference('notificationPreferences', 'soundEnabled', data.enabled);
        });
        
        this.eventSystem.subscribe('notification-visual-toggle', (data) => {
            this.updateNestedPreference('notificationPreferences', 'visualEnabled', data.enabled);
        });
        
        this.eventSystem.subscribe('notification-response-toggle', (data) => {
            this.updateNestedPreference('notificationPreferences', 'notifyOnResponse', data.enabled);
        });
        
        // Listen for save profile request
        this.eventSystem.subscribe('save-profile', () => {
            this.saveCurrentProfile();
        });
        
        // Listen for create profile request
        this.eventSystem.subscribe('create-profile', (data) => {
            this.createProfile(data.name);
        });
        
        // Listen for delete profile request
        this.eventSystem.subscribe('delete-profile', (data) => {
            this.deleteProfile(data.profileId);
        });
        
        // Listen for switch profile request
        this.eventSystem.subscribe('switch-profile', (data) => {
            this.switchProfile(data.profileId);
        });
        
        // Listen for reset profile request
        this.eventSystem.subscribe('reset-profile', () => {
            this.resetCurrentProfile();
        });
        
        // Listen for save conversation request
        this.eventSystem.subscribe('save-conversation', (data) => {
            this.saveConversation(data.conversation);
        });
        
        // Listen for favorite topic request
        this.eventSystem.subscribe('favorite-topic', (data) => {
            this.addFavoriteTopic(data.topic);
        });
        
        // Set up DOM event listeners
        document.addEventListener('DOMContentLoaded', () => {
            // Set up profile selector
            const profileSelector = document.getElementById('profile-selector');
            if (profileSelector) {
                // Update profile selector
                this.updateProfileSelector(profileSelector);
                
                profileSelector.addEventListener('change', (event) => {
                    this.switchProfile(event.target.value);
                });
            }
            
            // Set up save profile button
            const saveProfileButton = document.getElementById('save-profile-button');
            if (saveProfileButton) {
                saveProfileButton.addEventListener('click', () => {
                    this.saveCurrentProfile();
                });
            }
            
            // Set up create profile button
            const createProfileButton = document.getElementById('create-profile-button');
            if (createProfileButton) {
                createProfileButton.addEventListener('click', () => {
                    const profileName = prompt('Enter profile name:');
                    if (profileName) {
                        this.createProfile(profileName);
                    }
                });
            }
            
            // Set up delete profile button
            const deleteProfileButton = document.getElementById('delete-profile-button');
            if (deleteProfileButton) {
                deleteProfileButton.addEventListener('click', () => {
                    if (confirm('Are you sure you want to delete this profile?')) {
                        this.deleteProfile(this.state.currentProfile);
                    }
                });
            }
            
            // Set up reset profile button
            const resetProfileButton = document.getElementById('reset-profile-button');
            if (resetProfileButton) {
                resetProfileButton.addEventListener('click', () => {
                    if (confirm('Are you sure you want to reset this profile to default settings?')) {
                        this.resetCurrentProfile();
                    }
                });
            }
        });
        
        // Handle beforeunload to warn about unsaved changes
        window.addEventListener('beforeunload', (event) => {
            if (this.state.unsavedChanges) {
                const message = 'You have unsaved changes. Are you sure you want to leave?';
                event.returnValue = message;
                return message;
            }
        });
    }
    
    /**
     * Update profile selector
     * @param {HTMLElement} selector - Profile selector element
     */
    updateProfileSelector(selector) {
        // Clear existing options
        selector.innerHTML = '';
        
        // Add options for each profile
        for (const [profileId, profile] of Object.entries(this.state.profiles)) {
            const option = document.createElement('option');
            option.value = profileId;
            option.textContent = profile.name;
            selector.appendChild(option);
        }
        
        // Set current profile
        selector.value = this.state.currentProfile;
    }
    
    /**
     * Update preference
     * @param {string} key - Preference key
     * @param {*} value - Preference value
     */
    updatePreference(key, value) {
        // Skip if not initialized
        if (!this.state.initialized) return;
        
        // Update active preferences
        this.state.activePreferences[key] = value;
        
        // Set unsaved changes flag
        this.state.unsavedChanges = true;
        
        // Publish event that preference was updated
        this.eventSystem.publish('preference-updated', {
            key: key,
            value: value
        });
    }
    
    /**
     * Update nested preference
     * @param {string} category - Preference category
     * @param {string} key - Preference key
     * @param {*} value - Preference value
     */
    updateNestedPreference(category, key, value) {
        // Skip if not initialized
        if (!this.state.initialized) return;
        
        // Ensure category exists
        if (!this.state.activePreferences[category]) {
            this.state.activePreferences[category] = {};
        }
        
        // Update active preferences
        this.state.activePreferences[category][key] = value;
        
        // Set unsaved changes flag
        this.state.unsavedChanges = true;
        
        // Publish event that preference was updated
        this.eventSystem.publish('nested-preference-updated', {
            category: category,
            key: key,
            value: value
        });
    }
    
    /**
     * Save current profile
     */
    async saveCurrentProfile() {
        try {
            // Get current profile
            const profile = this.state.profiles[this.state.currentProfile];
            
            // Update preferences
            profile.preferences = JSON.parse(JSON.stringify(this.state.activePreferences));
            
            // Update last modified
            profile.lastModified = new Date().toISOString();
            
            // Save profile
            await this.storageManager.setIndexedDB('profiles', profile);
            
            // Update local state
            this.state.profiles[this.state.currentProfile] = profile;
            
            // Reset unsaved changes flag
            this.state.unsavedChanges = false;
            
            // Publish event that profile was saved
            this.eventSystem.publish('profile-saved', {
                profileId: this.state.currentProfile,
                profileName: profile.name
            });
            
            console.log(`Saved profile: ${profile.name}`);
        } catch (error) {
            console.error('Error saving profile:', error);
        }
    }
    
    /**
     * Create new profile
     * @param {string} name - Profile name
     */
    async createProfile(name) {
        try {
            // Generate unique ID
            const profileId = 'profile_' + Date.now();
            
            // Create new profile
            const profile = {
                id: profileId,
                name: name,
                preferences: JSON.parse(JSON.stringify(this.state.activePreferences)),
                history: {
                    lastInteraction: new Date().toISOString(),
                    interactionCount: 1,
                    favoriteTopics: [],
                    savedConversations: []
                },
                created: new Date().toISOString(),
                lastModified: new Date().toISOString()
            };
            
            // Save profile
            await this.storageManager.setIndexedDB('profiles', profile);
            
            // Update local state
            this.state.profiles[profileId] = profile;
            
            // Switch to new profile
            await this.switchProfile(profileId);
            
            // Update profile selector
            const profileSelector = document.getElementById('profile-selector');
            if (profileSelector) {
                this.updateProfileSelector(profileSelector);
            }
            
            // Publish event that profile was created
            this.eventSystem.publish('profile-created', {
                profileId: profileId,
                profileName: name
            });
            
            console.log(`Created profile: ${name}`);
        } catch (error) {
            console.error('Error creating profile:', error);
        }
    }
    
    /**
     * Delete profile
     * @param {string} profileId - Profile ID
     */
    async deleteProfile(profileId) {
        try {
            // Skip if trying to delete default profile
            if (profileId === 'default') {
                console.warn('Cannot delete default profile');
                return;
            }
            
            // Skip if profile not found
            if (!this.state.profiles[profileId]) {
                console.warn(`Profile not found: ${profileId}`);
                return;
            }
            
            // Get profile name for event
            const profileName = this.state.profiles[profileId].name;
            
            // Delete profile from storage
            await this.storageManager.deleteIndexedDB('profiles', profileId);
            
            // Delete from local state
            delete this.state.profiles[profileId];
            
            // Switch to default profile if current profile was deleted
            if (this.state.currentProfile === profileId) {
                await this.switchProfile('default');
            }
            
            // Update profile selector
            const profileSelector = document.getElementById('profile-selector');
            if (profileSelector) {
                this.updateProfileSelector(profileSelector);
            }
            
            // Publish event that profile was deleted
            this.eventSystem.publish('profile-deleted', {
                profileId: profileId,
                profileName: profileName
            });
            
            console.log(`Deleted profile: ${profileName}`);
        } catch (error) {
            console.error('Error deleting profile:', error);
        }
    }
    
    /**
     * Switch profile
     * @param {string} profileId - Profile ID
     */
    async switchProfile(profileId) {
        // Skip if profile not found
        if (!this.state.profiles[profileId]) {
            console.warn(`Profile not found: ${profileId}`);
            return;
        }
        
        // Check for unsaved changes
        if (this.state.unsavedChanges) {
            // Ask user if they want to save changes
            const saveChanges = confirm('You have unsaved changes. Would you like to save them before switching profiles?');
            
            if (saveChanges) {
                await this.saveCurrentProfile();
            }
        }
        
        // Apply profile preferences
        await this.applyProfilePreferences(profileId);
        
        // Update profile selector
        const profileSelector = document.getElementById('profile-selector');
        if (profileSelector) {
            profileSelector.value = profileId;
        }
    }
    
    /**
     * Reset current profile to default settings
     */
    async resetCurrentProfile() {
        try {
            // Get current profile
            const profile = this.state.profiles[this.state.currentProfile];
            
            // Reset preferences to default
            profile.preferences = JSON.parse(JSON.stringify(this.defaultProfile.preferences));
            
            // Update last modified
            profile.lastModified = new Date().toISOString();
            
            // Save profile
            await this.storageManager.setIndexedDB('profiles', profile);
            
            // Update local state
            this.state.profiles[this.state.currentProfile] = profile;
            
            // Apply reset preferences
            await this.applyProfilePreferences(this.state.currentProfile);
            
            // Publish event that profile was reset
            this.eventSystem.publish('profile-reset', {
                profileId: this.state.currentProfile,
                profileName: profile.name
            });
            
            console.log(`Reset profile: ${profile.name}`);
        } catch (error) {
            console.error('Error resetting profile:', error);
        }
    }
    
    /**
     * Save conversation to current profile
     * @param {Object} conversation - Conversation object
     */
    async saveConversation(conversation) {
        try {
            // Get current profile
            const profile = this.state.profiles[this.state.currentProfile];
            
            // Add conversation to saved conversations
            profile.history.savedConversations.push({
                id: 'conv_' + Date.now(),
                title: conversation.title || 'Conversation ' + (profile.history.savedConversations.length + 1),
                summary: conversation.summary || '',
                messages: conversation.messages || [],
                timestamp: new Date().toISOString()
            });
            
            // Limit to 20 saved conversations
            if (profile.history.savedConversations.length > 20) {
                profile.history.savedConversations.shift();
            }
            
            // Update last modified
            profile.lastModified = new Date().toISOString();
            
            // Save profile
            await this.storageManager.setIndexedDB('profiles', profile);
            
            // Update local state
            this.state.profiles[this.state.currentProfile] = profile;
            
            // Publish event that conversation was saved
            this.eventSystem.publish('conversation-saved', {
                profileId: this.state.currentProfile,
                profileName: profile.name,
                conversationId: profile.history.savedConversations[profile.history.savedConversations.length - 1].id
            });
            
            console.log(`Saved conversation to profile: ${profile.name}`);
        } catch (error) {
            console.error('Error saving conversation:', error);
        }
    }
    
    /**
     * Add favorite topic to current profile
     * @param {string} topic - Topic to add
     */
    async addFavoriteTopic(topic) {
        try {
            // Get current profile
            const profile = this.state.profiles[this.state.currentProfile];
            
            // Skip if topic already exists
            if (profile.history.favoriteTopics.includes(topic)) {
                return;
            }
            
            // Add topic to favorite topics
            profile.history.favoriteTopics.push(topic);
            
            // Limit to 10 favorite topics
            if (profile.history.favoriteTopics.length > 10) {
                profile.history.favoriteTopics.shift();
            }
            
            // Update last modified
            profile.lastModified = new Date().toISOString();
            
            // Save profile
            await this.storageManager.setIndexedDB('profiles', profile);
            
            // Update local state
            this.state.profiles[this.state.currentProfile] = profile;
            
            // Publish event that topic was added
            this.eventSystem.publish('favorite-topic-added', {
                profileId: this.state.currentProfile,
                profileName: profile.name,
                topic: topic
            });
            
            console.log(`Added favorite topic to profile: ${topic}`);
        } catch (error) {
            console.error('Error adding favorite topic:', error);
        }
    }
    
    /**
     * Get current profile
     * @returns {Object} - Current profile
     */
    getCurrentProfile() {
        return this.state.profiles[this.state.currentProfile];
    }
    
    /**
     * Get all profiles
     * @returns {Object} - All profiles
     */
    getAllProfiles() {
        return this.state.profiles;
    }
    
    /**
     * Get active preferences
     * @returns {Object} - Active preferences
     */
    getActivePreferences() {
        return this.state.activePreferences;
    }
    
    /**
     * Get saved conversations
     * @returns {Array} - Saved conversations
     */
    getSavedConversations() {
        return this.state.profiles[this.state.currentProfile].history.savedConversations;
    }
    
    /**
     * Get favorite topics
     * @returns {Array} - Favorite topics
     */
    getFavoriteTopics() {
        return this.state.profiles[this.state.currentProfile].history.favoriteTopics;
    }
    
    /**
     * Check if there are unsaved changes
     * @returns {boolean} - True if there are unsaved changes
     */
    hasUnsavedChanges() {
        return this.state.unsavedChanges;
    }
}

// Initialize the user personalization system when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.userPersonalizationSystem = new UserPersonalizationSystem();
});
