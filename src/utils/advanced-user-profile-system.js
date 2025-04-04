/**
 * Advanced User Profile System
 * 
 * This module provides sophisticated user profiling capabilities with preference learning,
 * adaptive personalization, and multi-user support.
 */

class AdvancedUserProfileSystem {
    constructor() {
        // Dependencies
        this.eventSystem = window.eventSystem;
        this.storageManager = window.storageManager;
        this.longTermMemorySystem = window.longTermMemorySystem;
        
        // User profiles
        this.profiles = new Map();
        this.activeProfile = null;
        
        // Default profile template
        this.defaultProfileTemplate = {
            id: null,
            name: 'Default User',
            created: Date.now(),
            lastAccessed: Date.now(),
            preferences: {
                theme: 'default',
                voiceType: 'neutral',
                responseLength: 'medium',
                formality: 'casual',
                humor: 'moderate',
                audioEnabled: true,
                visualizationQuality: 'auto',
                notificationsEnabled: true
            },
            interests: [],
            dislikedTopics: [],
            learningPreferences: {
                adaptationRate: 0.3,  // How quickly to adapt to user preferences (0-1)
                confidenceThreshold: 0.6,  // Confidence required to apply learned preferences
                explorationRate: 0.2  // Rate of exploring new options vs. exploiting known preferences
            },
            accessibility: {
                highContrast: false,
                largeText: false,
                reducedMotion: false,
                screenReader: false,
                captionsEnabled: false
            },
            conversationStyle: {
                pace: 'moderate',
                detailLevel: 'balanced',
                technicalLevel: 'adaptive',
                emotionalTone: 'balanced'
            },
            privacySettings: {
                dataCollection: 'minimal',
                historyRetention: '30days',
                thirdPartySharing: false
            },
            learnedPreferences: {},
            interactionHistory: {
                totalSessions: 0,
                totalInteractions: 0,
                averageSessionLength: 0,
                lastSessionTimestamp: null,
                sessionLengths: []
            }
        };
        
        // Preference learning models
        this.preferenceModels = {};
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize the user profile system
     */
    async init() {
        try {
            // Load profiles from storage
            await this.loadProfiles();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initialize preference learning models
            this.initializePreferenceModels();
            
            // Publish initialization success event
            this.eventSystem.publish('user-profile-system-initialized', {
                success: true,
                profileCount: this.profiles.size,
                activeProfile: this.activeProfile ? this.activeProfile.id : null
            });
            
            console.log('Advanced User Profile System initialized successfully');
        } catch (error) {
            console.error('Error initializing Advanced User Profile System:', error);
            
            // Publish initialization failure event
            this.eventSystem.publish('user-profile-system-initialized', {
                success: false,
                error: error.message
            });
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for preference update events
        this.eventSystem.subscribe('update-user-preference', (data) => {
            this.updatePreference(data.category, data.key, data.value);
        });
        
        // Listen for profile switch events
        this.eventSystem.subscribe('switch-user-profile', (data) => {
            this.switchProfile(data.profileId);
        });
        
        // Listen for profile creation events
        this.eventSystem.subscribe('create-user-profile', (data) => {
            this.createProfile(data.name, data.initialPreferences);
        });
        
        // Listen for profile deletion events
        this.eventSystem.subscribe('delete-user-profile', (data) => {
            this.deleteProfile(data.profileId);
        });
        
        // Listen for session start events
        this.eventSystem.subscribe('session-started', () => {
            this.recordSessionStart();
        });
        
        // Listen for session end events
        this.eventSystem.subscribe('session-ended', (data) => {
            this.recordSessionEnd(data.duration);
        });
        
        // Listen for interaction events
        this.eventSystem.subscribe('user-interaction', (data) => {
            this.processInteraction(data);
        });
        
        // Listen for preference learning events
        this.eventSystem.subscribe('learn-user-preference', (data) => {
            this.learnPreference(data.category, data.key, data.value, data.context);
        });
        
        // Listen for profile export events
        this.eventSystem.subscribe('export-user-profile', () => {
            this.exportActiveProfile();
        });
        
        // Listen for profile import events
        this.eventSystem.subscribe('import-user-profile', (data) => {
            this.importProfile(data.profileData);
        });
    }
    
    /**
     * Load profiles from storage
     */
    async loadProfiles() {
        try {
            // Get profiles from storage
            const profilesData = await this.storageManager.get('userProfiles');
            
            if (profilesData) {
                // Parse profiles
                const parsedProfiles = JSON.parse(profilesData);
                
                // Load profiles into map
                for (const profile of parsedProfiles) {
                    this.profiles.set(profile.id, profile);
                }
                
                // Get active profile ID
                const activeProfileId = await this.storageManager.get('activeProfileId');
                
                if (activeProfileId && this.profiles.has(activeProfileId)) {
                    // Set active profile
                    this.activeProfile = this.profiles.get(activeProfileId);
                    this.activeProfile.lastAccessed = Date.now();
                } else if (this.profiles.size > 0) {
                    // Set first profile as active
                    const firstProfileId = this.profiles.keys().next().value;
                    this.activeProfile = this.profiles.get(firstProfileId);
                    this.activeProfile.lastAccessed = Date.now();
                } else {
                    // Create default profile
                    await this.createDefaultProfile();
                }
            } else {
                // No profiles found, create default
                await this.createDefaultProfile();
            }
            
            // Save updated profiles
            await this.saveProfiles();
        } catch (error) {
            console.error('Error loading profiles:', error);
            
            // Create default profile as fallback
            await this.createDefaultProfile();
        }
    }
    
    /**
     * Save profiles to storage
     */
    async saveProfiles() {
        try {
            // Convert profiles map to array
            const profilesArray = Array.from(this.profiles.values());
            
            // Save profiles to storage
            await this.storageManager.set('userProfiles', JSON.stringify(profilesArray));
            
            // Save active profile ID
            if (this.activeProfile) {
                await this.storageManager.set('activeProfileId', this.activeProfile.id);
            }
        } catch (error) {
            console.error('Error saving profiles:', error);
            throw error;
        }
    }
    
    /**
     * Create default profile
     */
    async createDefaultProfile() {
        // Create profile with default template
        const defaultProfile = { ...this.defaultProfileTemplate };
        defaultProfile.id = this.generateProfileId();
        
        // Add to profiles map
        this.profiles.set(defaultProfile.id, defaultProfile);
        
        // Set as active profile
        this.activeProfile = defaultProfile;
        
        // Save profiles
        await this.saveProfiles();
        
        return defaultProfile;
    }
    
    /**
     * Generate a unique profile ID
     * @returns {string} Unique profile ID
     */
    generateProfileId() {
        return 'profile_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Create a new user profile
     * @param {string} name - Profile name
     * @param {Object} initialPreferences - Initial preferences
     * @returns {Promise<Object>} Created profile
     */
    async createProfile(name, initialPreferences = {}) {
        try {
            // Create profile with default template
            const profile = { ...this.defaultProfileTemplate };
            profile.id = this.generateProfileId();
            profile.name = name || profile.name;
            profile.created = Date.now();
            profile.lastAccessed = Date.now();
            
            // Apply initial preferences
            if (initialPreferences) {
                for (const category in initialPreferences) {
                    if (profile[category] && typeof profile[category] === 'object') {
                        profile[category] = { ...profile[category], ...initialPreferences[category] };
                    } else {
                        profile[category] = initialPreferences[category];
                    }
                }
            }
            
            // Add to profiles map
            this.profiles.set(profile.id, profile);
            
            // Set as active profile
            this.activeProfile = profile;
            
            // Save profiles
            await this.saveProfiles();
            
            // Publish profile created event
            this.eventSystem.publish('user-profile-created', {
                profileId: profile.id,
                name: profile.name
            });
            
            return profile;
        } catch (error) {
            console.error('Error creating profile:', error);
            throw error;
        }
    }
    
    /**
     * Switch to a different user profile
     * @param {string} profileId - ID of the profile to switch to
     * @returns {Promise<boolean>} Whether the switch was successful
     */
    async switchProfile(profileId) {
        try {
            // Check if profile exists
            if (!this.profiles.has(profileId)) {
                console.error(`Profile ${profileId} not found`);
                return false;
            }
            
            // Get profile
            const profile = this.profiles.get(profileId);
            
            // Update last accessed timestamp
            profile.lastAccessed = Date.now();
            
            // Set as active profile
            this.activeProfile = profile;
            
            // Save profiles
            await this.saveProfiles();
            
            // Publish profile switched event
            this.eventSystem.publish('user-profile-switched', {
                profileId: profile.id,
                name: profile.name
            });
            
            // Apply profile settings
            this.applyProfileSettings(profile);
            
            return true;
        } catch (error) {
            console.error('Error switching profile:', error);
            return false;
        }
    }
    
    /**
     * Apply profile settings to the system
     * @param {Object} profile - User profile
     */
    applyProfileSettings(profile) {
        try {
            // Apply theme
            this.eventSystem.publish('theme-change', {
                theme: profile.preferences.theme
            });
            
            // Apply voice settings
            this.eventSystem.publish('voice-type-change', {
                voiceType: profile.preferences.voiceType
            });
            
            // Apply visualization quality
            this.eventSystem.publish('quality-setting-change', {
                quality: profile.preferences.visualizationQuality
            });
            
            // Apply audio settings
            this.eventSystem.publish('audio-mute-change', {
                muted: !profile.preferences.audioEnabled
            });
            
            // Apply accessibility settings
            this.eventSystem.publish('accessibility-settings-change', {
                settings: profile.accessibility
            });
            
            // Apply conversation style
            this.eventSystem.publish('conversation-style-change', {
                style: profile.conversationStyle
            });
            
            // Apply privacy settings
            this.eventSystem.publish('privacy-settings-change', {
                settings: profile.privacySettings
            });
        } catch (error) {
            console.error('Error applying profile settings:', error);
        }
    }
    
    /**
     * Delete a user profile
     * @param {string} profileId - ID of the profile to delete
     * @returns {Promise<boolean>} Whether the deletion was successful
     */
    async deleteProfile(profileId) {
        try {
            // Check if profile exists
            if (!this.profiles.has(profileId)) {
                console.error(`Profile ${profileId} not found`);
                return false;
            }
            
            // Check if it's the only profile
            if (this.profiles.size === 1) {
                console.error('Cannot delete the only profile');
                return false;
            }
            
            // Check if it's the active profile
            if (this.activeProfile && this.activeProfile.id === profileId) {
                // Find another profile to switch to
                for (const [id, profile] of this.profiles.entries()) {
                    if (id !== profileId) {
                        // Switch to this profile
                        await this.switchProfile(id);
                        break;
                    }
                }
            }
            
            // Delete profile
            this.profiles.delete(profileId);
            
            // Save profiles
            await this.saveProfiles();
            
            // Publish profile deleted event
            this.eventSystem.publish('user-profile-deleted', {
                profileId
            });
            
            return true;
        } catch (error) {
            console.error('Error deleting profile:', error);
            return false;
        }
    }
    
    /**
     * Update a user preference
     * @param {string} category - Preference category
     * @param {string} key - Preference key
     * @param {*} value - Preference value
     * @returns {Promise<boolean>} Whether the update was successful
     */
    async updatePreference(category, key, value) {
        try {
            // Check if active profile exists
            if (!this.activeProfile) {
                console.error('No active profile');
                return false;
            }
            
            // Update preference
            if (category === 'preferences' || category === 'accessibility' || 
                category === 'conversationStyle' || category === 'privacySettings') {
                
                // Check if category exists
                if (!this.activeProfile[category]) {
                    this.activeProfile[category] = {};
                }
                
                // Update value
                this.activeProfile[category][key] = value;
                
                // Save profiles
                await this.saveProfiles();
                
                // Apply setting
                if (category === 'preferences') {
                    if (key === 'theme') {
                        this.eventSystem.publish('theme-change', { theme: value });
                    } else if (key === 'voiceType') {
                        this.eventSystem.publish('voice-type-change', { voiceType: value });
                    } else if (key === 'visualizationQuality') {
                        this.eventSystem.publish('quality-setting-change', { quality: value });
                    } else if (key === 'audioEnabled') {
                        this.eventSystem.publish('audio-mute-change', { muted: !value });
                    }
                } else if (category === 'accessibility') {
                    this.eventSystem.publish('accessibility-settings-change', { 
                        settings: this.activeProfile.accessibility 
                    });
                } else if (category === 'conversationStyle') {
                    this.eventSystem.publish('conversation-style-change', { 
                        style: this.activeProfile.conversationStyle 
                    });
                } else if (category === 'privacySettings') {
                    this.eventSystem.publish('privacy-settings-change', { 
                        settings: this.activeProfile.privacySettings 
                    });
                }
                
                // Publish preference updated event
                this.eventSystem.publish('user-preference-updated', {
                    category,
                    key,
                    value
                });
                
                return true;
            } else if (category === 'interests' || category === 'dislikedTopics') {
                // Handle array preferences
                if (Array.isArray(this.activeProfile[category])) {
                    // Check if adding or removing
                    if (value === true && !this.activeProfile[category].includes(key)) {
                        // Add to array
                        this.activeProfile[category].push(key);
                    } else if (value === false && this.activeProfile[category].includes(key)) {
                        // Remove from array
                        this.activeProfile[category] = this.activeProfile[category].filter(item => item !== key);
                    }
                    
                    // Save profiles
                    await this.saveProfiles();
                    
                    // Publish preference updated event
                    this.eventSystem.publish('user-preference-updated', {
                        category,
                        key,
                        value
                    });
                    
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            console.error('Error updating preference:', error);
            return false;
        }
    }
    
    /**
     * Get the active user profile
     * @returns {Object|null} Active user profile or null if none
     */
    getActiveProfile() {
        return this.activeProfile;
    }
    
    /**
     * Get a specific user profile
     * @param {string} profileId - ID of the profile to get
     * @returns {Object|null} User profile or null if not found
     */
    getProfile(profileId) {
        return this.profiles.get(profileId) || null;
    }
    
    /**
     * Get all user profiles
     * @returns {Array} Array of user profiles
     */
    getAllProfiles() {
        return Array.from(this.profiles.values());
    }
    
    /**
     * Record the start of a session
     */
    recordSessionStart() {
        if (!this.activeProfile) return;
        
        // Record session start time
        this.sessionStartTime = Date.now();
        
        // Increment total sessions
        this.activeProfile.interactionHistory.totalSessions++;
        
        // Save profiles
        this.saveProfiles();
    }
    
    /**
     * Record the end of a session
     * @param {number} duration - Session duration in milliseconds
     */
    async recordSessionEnd(duration) {
        if (!this.activeProfile) return;
        
        try {
            // Calculate session duration if not provided
            if (!duration && this.sessionStartTime) {
                duration = Date.now() - this.sessionStartTime;
            }
            
            if (duration) {
                // Convert to minutes
                const durationMinutes = duration / 60000;
                
                // Update session history
                const history = this.activeProfile.interactionHistory;
                
                // Add to session lengths
                history.sessionLengths.push(durationMinutes);
                
                // Keep only the last 20 sessions
                if (history.sessionLengths.length > 20) {
                    history.sessionLengths.shift();
                }
                
                // Calculate average session length
                const totalLength = history.sessionLengths.reduce((sum, length) => sum + length, 0);
                history.averageSessionLength = totalLength / history.sessionLengths.length;
                
                // Update last session timestamp
                history.lastSessionTimestamp = Date.now();
                
                // Reset session start time
                this.sessionStartTime = null;
                
                // Save profiles
                await this.saveProfiles();
            }
        } catch (error) {
            console.error('Error recording session end:', error);
        }
    }
    
    /**
     * Process a user interaction
     * @param {Object} data - Interaction data
     */
    async processInteraction(data) {
        if (!this.activeProfile) return;
        
        try {
            // Increment total interactions
            this.activeProfile.interactionHistory.totalInteractions++;
            
            // Extract topics from interaction
            if (data.message) {
                const topics = await this.extractTopics(data.message);
                
                // Update interest model based on topics
                for (const topic of topics) {
                    // Check if topic is in disliked topics
                    if (this.activeProfile.dislikedTopics.includes(topic)) {
                        continue;
                    }
                    
                    // Update interest model
                    this.updateInterestModel(topic, data.sentiment || 0);
                }
            }
            
            // Process interaction for preference learning
            if (data.context) {
                this.processInteractionForLearning(data);
            }
            
            // Save profiles periodically (every 10 interactions)
            if (this.activeProfile.interactionHistory.totalInteractions % 10 === 0) {
                await this.saveProfiles();
            }
        } catch (error) {
            console.error('Error processing interaction:', error);
        }
    }
    
    /**
     * Extract topics from text
     * @param {string} text - Text to extract topics from
     * @returns {Promise<string[]>} Array of topics
     */
    async extractTopics(text) {
        try {
            // Use memory system's topic extraction if available
            if (this.longTermMemorySystem && typeof this.longTermMemorySystem.extractTopics === 'function') {
                return await this.longTermMemorySystem.extractTopics(text);
            }
            
            // Simple keyword-based topic extraction
            const topicKeywords = {
                'weather': ['weather', 'rain', 'sunny', 'temperature', 'forecast', 'climate'],
                'health': ['health', 'doctor', 'sick', 'illness', 'disease', 'medicine', 'exercise', 'diet'],
                'technology': ['technology', 'computer', 'software', 'hardware', 'app', 'device', 'internet', 'digital'],
                'entertainment': ['movie', 'film', 'show', 'music', 'song', 'concert', 'artist', 'actor', 'actress', 'entertainment'],
                'food': ['food', 'eat', 'restaurant', 'recipe', 'cook', 'meal', 'dinner', 'lunch', 'breakfast'],
                'travel': ['travel', 'trip', 'vacation', 'journey', 'flight', 'hotel', 'destination', 'tourism'],
                'work': ['work', 'job', 'career', 'office', 'business', 'professional', 'employment'],
                'education': ['education', 'school', 'college', 'university', 'learn', 'study', 'student', 'teacher', 'professor'],
                'family': ['family', 'parent', 'child', 'mother', 'father', 'son', 'daughter', 'brother', 'sister'],
                'emotions': ['happy', 'sad', 'angry', 'excited', 'nervous', 'anxious', 'calm', 'stressed', 'feeling', 'emotion']
            };
            
            const lowerText = text.toLowerCase();
            const detectedTopics = [];
            
            for (const [topic, keywords] of Object.entries(topicKeywords)) {
                for (const keyword of keywords) {
                    if (lowerText.includes(keyword)) {
                        detectedTopics.push(topic);
                        break;
                    }
                }
            }
            
            // If no topics were detected, use 'general'
            if (detectedTopics.length === 0) {
                detectedTopics.push('general');
            }
            
            return detectedTopics;
        } catch (error) {
            console.error('Error extracting topics:', error);
            return ['general'];
        }
    }
    
    /**
     * Update interest model based on topic
     * @param {string} topic - Topic to update
     * @param {number} sentiment - Sentiment score (-1 to 1)
     */
    updateInterestModel(topic, sentiment = 0) {
        if (!this.activeProfile) return;
        
        try {
            // Initialize learned preferences if needed
            if (!this.activeProfile.learnedPreferences.interests) {
                this.activeProfile.learnedPreferences.interests = {};
            }
            
            const interests = this.activeProfile.learnedPreferences.interests;
            
            // Initialize topic if needed
            if (!interests[topic]) {
                interests[topic] = {
                    score: 0,
                    count: 0,
                    lastUpdated: Date.now()
                };
            }
            
            // Update topic score
            const topicData = interests[topic];
            
            // Calculate update weight (more recent interactions have more weight)
            const timeSinceLastUpdate = Date.now() - topicData.lastUpdated;
            const daysSinceLastUpdate = timeSinceLastUpdate / (1000 * 60 * 60 * 24);
            const recencyWeight = Math.max(0.5, 1 - (daysSinceLastUpdate / 30)); // Decay over 30 days
            
            // Calculate learning rate
            const learningRate = this.activeProfile.learningPreferences.adaptationRate * recencyWeight;
            
            // Update score with sentiment influence
            const sentimentInfluence = sentiment * 0.3; // Scale sentiment influence
            const update = learningRate * (1 + sentimentInfluence);
            
            // Apply update
            topicData.score = (topicData.score * topicData.count + update) / (topicData.count + 1);
            topicData.count++;
            topicData.lastUpdated = Date.now();
            
            // Check if topic should be added to interests
            if (topicData.score > this.activeProfile.learningPreferences.confidenceThreshold && 
                topicData.count >= 3 && 
                !this.activeProfile.interests.includes(topic)) {
                
                // Add to interests
                this.activeProfile.interests.push(topic);
                
                // Publish interest added event
                this.eventSystem.publish('user-interest-detected', {
                    topic,
                    score: topicData.score,
                    count: topicData.count
                });
            }
        } catch (error) {
            console.error('Error updating interest model:', error);
        }
    }
    
    /**
     * Initialize preference learning models
     */
    initializePreferenceModels() {
        // Initialize models for different preference categories
        this.preferenceModels = {
            responseLength: this.createCategoricalModel(['short', 'medium', 'long']),
            formality: this.createCategoricalModel(['casual', 'neutral', 'formal']),
            humor: this.createCategoricalModel(['minimal', 'moderate', 'frequent']),
            detailLevel: this.createCategoricalModel(['concise', 'balanced', 'detailed']),
            technicalLevel: this.createCategoricalModel(['simple', 'moderate', 'technical']),
            emotionalTone: this.createCategoricalModel(['neutral', 'empathetic', 'enthusiastic'])
        };
    }
    
    /**
     * Create a categorical preference model
     * @param {string[]} categories - Possible categories
     * @returns {Object} Categorical model
     */
    createCategoricalModel(categories) {
        const model = {
            categories,
            counts: {},
            total: 0,
            lastUpdated: Date.now()
        };
        
        // Initialize counts
        for (const category of categories) {
            model.counts[category] = 0;
        }
        
        return model;
    }
    
    /**
     * Process interaction for preference learning
     * @param {Object} data - Interaction data
     */
    processInteractionForLearning(data) {
        if (!this.activeProfile || !data.context) return;
        
        try {
            // Extract context features
            const context = data.context;
            
            // Check for explicit feedback
            if (context.feedback) {
                const feedback = context.feedback;
                
                // Process feedback for different aspects
                for (const aspect in feedback) {
                    if (this.preferenceModels[aspect]) {
                        this.updatePreferenceModel(aspect, feedback[aspect], 0.8); // High weight for explicit feedback
                    }
                }
            }
            
            // Check for implicit feedback
            if (context.userResponse) {
                const response = context.userResponse;
                
                // Check engagement signals
                if (response.engagementTime) {
                    // Longer engagement time suggests preference for current style
                    const engagementScore = Math.min(1, response.engagementTime / 60000); // Cap at 1 minute
                    
                    // Update models based on current settings
                    if (context.currentSettings) {
                        for (const aspect in context.currentSettings) {
                            if (this.preferenceModels[aspect]) {
                                this.updatePreferenceModel(aspect, context.currentSettings[aspect], engagementScore * 0.3);
                            }
                        }
                    }
                }
                
                // Check sentiment
                if (response.sentiment) {
                    const sentiment = response.sentiment;
                    const sentimentScore = (sentiment + 1) / 2; // Convert -1:1 to 0:1
                    
                    // Update models based on current settings with sentiment weight
                    if (context.currentSettings) {
                        for (const aspect in context.currentSettings) {
                            if (this.preferenceModels[aspect]) {
                                this.updatePreferenceModel(aspect, context.currentSettings[aspect], sentimentScore * 0.2);
                            }
                        }
                    }
                }
            }
            
            // Apply learned preferences periodically
            this.applyLearnedPreferences();
        } catch (error) {
            console.error('Error processing interaction for learning:', error);
        }
    }
    
    /**
     * Update a preference model
     * @param {string} aspect - Preference aspect
     * @param {string} value - Preference value
     * @param {number} weight - Update weight (0-1)
     */
    updatePreferenceModel(aspect, value, weight = 0.5) {
        if (!this.preferenceModels[aspect]) return;
        
        const model = this.preferenceModels[aspect];
        
        // Check if value is valid
        if (!model.categories.includes(value)) return;
        
        // Update counts
        model.counts[value] += weight;
        model.total += weight;
        model.lastUpdated = Date.now();
        
        // Initialize learned preferences if needed
        if (!this.activeProfile.learnedPreferences[aspect]) {
            this.activeProfile.learnedPreferences[aspect] = {
                value: null,
                confidence: 0,
                lastUpdated: Date.now()
            };
        }
        
        // Calculate probabilities
        const probs = {};
        let maxProb = 0;
        let maxCategory = null;
        
        for (const category of model.categories) {
            probs[category] = model.counts[category] / model.total;
            
            if (probs[category] > maxProb) {
                maxProb = probs[category];
                maxCategory = category;
            }
        }
        
        // Update learned preference
        const learnedPref = this.activeProfile.learnedPreferences[aspect];
        learnedPref.value = maxCategory;
        learnedPref.confidence = maxProb;
        learnedPref.lastUpdated = Date.now();
    }
    
    /**
     * Apply learned preferences to active profile
     */
    applyLearnedPreferences() {
        if (!this.activeProfile) return;
        
        try {
            // Check if we have enough data
            const threshold = this.activeProfile.learningPreferences.confidenceThreshold;
            
            // Apply learned preferences to conversation style
            const style = this.activeProfile.conversationStyle;
            
            // Check each aspect
            for (const aspect in this.preferenceModels) {
                if (this.activeProfile.learnedPreferences[aspect]) {
                    const learned = this.activeProfile.learnedPreferences[aspect];
                    
                    // Apply if confidence is high enough
                    if (learned.confidence >= threshold) {
                        // Map aspect to the appropriate category
                        if (aspect === 'responseLength' || aspect === 'formality' || 
                            aspect === 'humor') {
                            // These go in preferences
                            if (this.activeProfile.preferences[aspect] !== learned.value) {
                                this.activeProfile.preferences[aspect] = learned.value;
                                
                                // Publish preference updated event
                                this.eventSystem.publish('learned-preference-applied', {
                                    category: 'preferences',
                                    key: aspect,
                                    value: learned.value,
                                    confidence: learned.confidence
                                });
                            }
                        } else if (aspect === 'detailLevel' || aspect === 'technicalLevel' || 
                                  aspect === 'emotionalTone') {
                            // These go in conversationStyle
                            if (style[aspect] !== learned.value) {
                                style[aspect] = learned.value;
                                
                                // Publish preference updated event
                                this.eventSystem.publish('learned-preference-applied', {
                                    category: 'conversationStyle',
                                    key: aspect,
                                    value: learned.value,
                                    confidence: learned.confidence
                                });
                            }
                        }
                    }
                }
            }
            
            // Apply conversation style changes
            this.eventSystem.publish('conversation-style-change', {
                style: this.activeProfile.conversationStyle
            });
        } catch (error) {
            console.error('Error applying learned preferences:', error);
        }
    }
    
    /**
     * Learn a specific preference
     * @param {string} category - Preference category
     * @param {string} key - Preference key
     * @param {*} value - Preference value
     * @param {Object} context - Learning context
     */
    learnPreference(category, key, value, context = {}) {
        if (!this.activeProfile) return;
        
        try {
            // Calculate weight based on context
            let weight = 0.5; // Default weight
            
            if (context.explicit) {
                // Explicit learning has higher weight
                weight = 0.8;
            } else if (context.sentiment) {
                // Adjust weight based on sentiment
                weight = 0.3 + (context.sentiment * 0.2);
            }
            
            // Check if this is a categorical preference with a model
            if (this.preferenceModels[key]) {
                this.updatePreferenceModel(key, value, weight);
            } else {
                // Direct learning for other preferences
                if (!this.activeProfile.learnedPreferences[category]) {
                    this.activeProfile.learnedPreferences[category] = {};
                }
                
                if (!this.activeProfile.learnedPreferences[category][key]) {
                    this.activeProfile.learnedPreferences[category][key] = {
                        value: value,
                        confidence: weight,
                        lastUpdated: Date.now()
                    };
                } else {
                    // Update existing preference
                    const pref = this.activeProfile.learnedPreferences[category][key];
                    
                    // If value is the same, increase confidence
                    if (pref.value === value) {
                        pref.confidence = Math.min(1, pref.confidence + (weight * 0.2));
                    } else {
                        // If value is different, adjust based on weights
                        const oldWeight = pref.confidence;
                        const newWeight = weight;
                        const totalWeight = oldWeight + newWeight;
                        
                        if (newWeight > oldWeight) {
                            // New value wins
                            pref.value = value;
                            pref.confidence = newWeight / totalWeight;
                        } else {
                            // Old value retained but confidence reduced
                            pref.confidence = oldWeight / totalWeight;
                        }
                    }
                    
                    pref.lastUpdated = Date.now();
                }
                
                // Apply if confidence is high enough
                if (this.activeProfile.learnedPreferences[category][key].confidence >= 
                    this.activeProfile.learningPreferences.confidenceThreshold) {
                    
                    // Apply learned preference
                    this.updatePreference(category, key, value);
                    
                    // Publish learned preference applied event
                    this.eventSystem.publish('learned-preference-applied', {
                        category,
                        key,
                        value,
                        confidence: this.activeProfile.learnedPreferences[category][key].confidence
                    });
                }
            }
        } catch (error) {
            console.error('Error learning preference:', error);
        }
    }
    
    /**
     * Get user interests
     * @param {number} limit - Maximum number of interests to return
     * @returns {string[]} Array of interests
     */
    getUserInterests(limit = 0) {
        if (!this.activeProfile) return [];
        
        // Get explicit interests
        const explicitInterests = [...this.activeProfile.interests];
        
        // Get learned interests
        const learnedInterests = [];
        
        if (this.activeProfile.learnedPreferences.interests) {
            // Convert to array of [topic, score] pairs
            const interestPairs = Object.entries(this.activeProfile.learnedPreferences.interests)
                .map(([topic, data]) => [topic, data.score])
                .filter(([topic, score]) => 
                    score >= this.activeProfile.learningPreferences.confidenceThreshold && 
                    !explicitInterests.includes(topic) &&
                    !this.activeProfile.dislikedTopics.includes(topic)
                )
                .sort((a, b) => b[1] - a[1]);
            
            // Extract topics
            learnedInterests.push(...interestPairs.map(pair => pair[0]));
        }
        
        // Combine interests
        const allInterests = [...explicitInterests, ...learnedInterests];
        
        // Limit if specified
        if (limit > 0 && allInterests.length > limit) {
            return allInterests.slice(0, limit);
        }
        
        return allInterests;
    }
    
    /**
     * Get disliked topics
     * @returns {string[]} Array of disliked topics
     */
    getDislikedTopics() {
        if (!this.activeProfile) return [];
        
        return [...this.activeProfile.dislikedTopics];
    }
    
    /**
     * Get user preference
     * @param {string} category - Preference category
     * @param {string} key - Preference key
     * @returns {*} Preference value or null if not found
     */
    getPreference(category, key) {
        if (!this.activeProfile) return null;
        
        if (this.activeProfile[category] && this.activeProfile[category][key] !== undefined) {
            return this.activeProfile[category][key];
        }
        
        return null;
    }
    
    /**
     * Get all preferences in a category
     * @param {string} category - Preference category
     * @returns {Object|null} Preferences object or null if category not found
     */
    getPreferenceCategory(category) {
        if (!this.activeProfile) return null;
        
        if (this.activeProfile[category]) {
            return { ...this.activeProfile[category] };
        }
        
        return null;
    }
    
    /**
     * Export active profile
     * @returns {string} JSON string of profile data
     */
    exportActiveProfile() {
        if (!this.activeProfile) return null;
        
        try {
            // Create export object
            const exportData = {
                profile: { ...this.activeProfile },
                exportTime: Date.now(),
                version: '1.0'
            };
            
            // Convert to JSON
            const jsonData = JSON.stringify(exportData, null, 2);
            
            // Publish export data
            this.eventSystem.publish('user-profile-exported', {
                profileId: this.activeProfile.id,
                name: this.activeProfile.name,
                data: jsonData
            });
            
            return jsonData;
        } catch (error) {
            console.error('Error exporting profile:', error);
            return null;
        }
    }
    
    /**
     * Import a user profile
     * @param {string|Object} profileData - Profile data to import
     * @returns {Promise<Object|null>} Imported profile or null if import failed
     */
    async importProfile(profileData) {
        try {
            // Parse data if it's a string
            const data = typeof profileData === 'string' ? JSON.parse(profileData) : profileData;
            
            // Validate data
            if (!data.profile || !data.profile.id) {
                throw new Error('Invalid profile data');
            }
            
            // Check if profile already exists
            const existingProfile = this.profiles.get(data.profile.id);
            
            if (existingProfile) {
                // Generate a new ID for the imported profile
                data.profile.id = this.generateProfileId();
                data.profile.name += ' (Imported)';
            }
            
            // Add profile
            this.profiles.set(data.profile.id, data.profile);
            
            // Save profiles
            await this.saveProfiles();
            
            // Publish profile imported event
            this.eventSystem.publish('user-profile-imported', {
                profileId: data.profile.id,
                name: data.profile.name
            });
            
            return data.profile;
        } catch (error) {
            console.error('Error importing profile:', error);
            
            // Publish import error event
            this.eventSystem.publish('user-profile-import-error', {
                error: error.message
            });
            
            return null;
        }
    }
    
    /**
     * Reset user profile to defaults
     * @param {string} profileId - ID of the profile to reset
     * @returns {Promise<boolean>} Whether the reset was successful
     */
    async resetProfile(profileId) {
        try {
            // Check if profile exists
            if (!this.profiles.has(profileId)) {
                console.error(`Profile ${profileId} not found`);
                return false;
            }
            
            // Get profile
            const profile = this.profiles.get(profileId);
            
            // Create new profile with defaults but keep ID and name
            const defaultProfile = { ...this.defaultProfileTemplate };
            defaultProfile.id = profile.id;
            defaultProfile.name = profile.name;
            defaultProfile.created = profile.created;
            defaultProfile.lastAccessed = Date.now();
            
            // Replace profile
            this.profiles.set(profileId, defaultProfile);
            
            // Update active profile if needed
            if (this.activeProfile && this.activeProfile.id === profileId) {
                this.activeProfile = defaultProfile;
                
                // Apply default settings
                this.applyProfileSettings(defaultProfile);
            }
            
            // Save profiles
            await this.saveProfiles();
            
            // Publish profile reset event
            this.eventSystem.publish('user-profile-reset', {
                profileId,
                name: defaultProfile.name
            });
            
            return true;
        } catch (error) {
            console.error('Error resetting profile:', error);
            return false;
        }
    }
    
    /**
     * Get personalized response parameters
     * @returns {Object} Personalized parameters for response generation
     */
    getPersonalizedResponseParams() {
        if (!this.activeProfile) {
            return {
                responseLength: 'medium',
                formality: 'casual',
                humor: 'moderate',
                detailLevel: 'balanced',
                technicalLevel: 'adaptive',
                emotionalTone: 'balanced',
                interests: [],
                dislikedTopics: []
            };
        }
        
        // Get preferences
        const prefs = this.activeProfile.preferences;
        const style = this.activeProfile.conversationStyle;
        
        // Get interests and disliked topics
        const interests = this.getUserInterests();
        const dislikedTopics = this.getDislikedTopics();
        
        return {
            responseLength: prefs.responseLength || 'medium',
            formality: prefs.formality || 'casual',
            humor: prefs.humor || 'moderate',
            detailLevel: style.detailLevel || 'balanced',
            technicalLevel: style.technicalLevel || 'adaptive',
            emotionalTone: style.emotionalTone || 'balanced',
            interests,
            dislikedTopics
        };
    }
    
    /**
     * Get user session statistics
     * @returns {Object} Session statistics
     */
    getSessionStats() {
        if (!this.activeProfile) {
            return {
                totalSessions: 0,
                totalInteractions: 0,
                averageSessionLength: 0,
                lastSessionTimestamp: null
            };
        }
        
        const history = this.activeProfile.interactionHistory;
        
        return {
            totalSessions: history.totalSessions,
            totalInteractions: history.totalInteractions,
            averageSessionLength: history.averageSessionLength,
            lastSessionTimestamp: history.lastSessionTimestamp
        };
    }
}

// Create and export singleton instance
const advancedUserProfileSystem = new AdvancedUserProfileSystem();
export default advancedUserProfileSystem;
