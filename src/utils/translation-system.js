/**
 * Translation System for MeAI
 * 
 * This module provides translation capabilities for the application,
 * allowing content to be translated between different languages.
 */

import { eventSystem } from '../utils/event-system.js';
import multiLanguageSupport from '../utils/multi-language-support.js';

class TranslationSystem {
    constructor() {
        // State
        this.translationProviders = {
            mock: {
                name: 'Mock Translator',
                enabled: true,
                translate: this.mockTranslate.bind(this)
            },
            browser: {
                name: 'Browser Translation API',
                enabled: typeof window.navigator.translation !== 'undefined',
                translate: this.browserTranslate.bind(this)
            }
        };
        this.activeProvider = 'mock';
        this.translationCache = {};
        this.pendingTranslations = new Map();
        this.translationHistory = [];
        this.maxHistoryLength = 100;
        this.maxCacheSize = 1000;
        
        // Initialize event listeners
        this.setupEventListeners();
    }
    
    /**
     * Initialize the translation system
     */
    async init() {
        console.log('Initializing Translation System');
        
        // Determine best translation provider
        this.selectBestProvider();
        
        // Load translation cache from localStorage
        this.loadTranslationCache();
        
        console.log('Translation System initialized with provider:', this.activeProvider);
        
        // Publish initialization event
        eventSystem.publish('translation-system-initialized', {
            provider: this.activeProvider,
            availableProviders: Object.keys(this.translationProviders).filter(
                key => this.translationProviders[key].enabled
            )
        });
        
        return true;
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for translation requests
        eventSystem.subscribe('request-translation', async (data) => {
            const translation = await this.translateText(
                data.text,
                data.targetLanguage,
                data.sourceLanguage
            );
            
            eventSystem.publish('translation-completed', {
                originalText: data.text,
                translatedText: translation,
                sourceLanguage: data.sourceLanguage,
                targetLanguage: data.targetLanguage,
                requestId: data.requestId
            });
        });
        
        // Listen for batch translation requests
        eventSystem.subscribe('request-batch-translation', async (data) => {
            const translations = await this.translateBatch(
                data.texts,
                data.targetLanguage,
                data.sourceLanguage
            );
            
            eventSystem.publish('batch-translation-completed', {
                originalTexts: data.texts,
                translatedTexts: translations,
                sourceLanguage: data.sourceLanguage,
                targetLanguage: data.targetLanguage,
                requestId: data.requestId
            });
        });
        
        // Listen for provider change requests
        eventSystem.subscribe('change-translation-provider', (data) => {
            this.setTranslationProvider(data.provider);
        });
        
        // Listen for cache clear requests
        eventSystem.subscribe('clear-translation-cache', () => {
            this.clearTranslationCache();
        });
    }
    
    /**
     * Select the best translation provider based on availability
     */
    selectBestProvider() {
        // Check if browser translation API is available
        if (this.translationProviders.browser.enabled) {
            this.activeProvider = 'browser';
            return;
        }
        
        // Fall back to mock provider
        this.activeProvider = 'mock';
    }
    
    /**
     * Set the active translation provider
     * @param {string} providerKey - Provider key
     * @returns {boolean} Success
     */
    setTranslationProvider(providerKey) {
        // Check if provider exists and is enabled
        if (
            this.translationProviders[providerKey] &&
            this.translationProviders[providerKey].enabled
        ) {
            this.activeProvider = providerKey;
            console.log('Translation provider set to:', providerKey);
            
            // Publish provider change event
            eventSystem.publish('translation-provider-changed', {
                provider: providerKey
            });
            
            return true;
        }
        
        console.warn(`Translation provider not available: ${providerKey}`);
        return false;
    }
    
    /**
     * Load translation cache from localStorage
     */
    loadTranslationCache() {
        try {
            const cachedData = localStorage.getItem('meai-translation-cache');
            
            if (cachedData) {
                this.translationCache = JSON.parse(cachedData);
                console.log('Loaded translation cache:', Object.keys(this.translationCache).length, 'entries');
            }
        } catch (error) {
            console.error('Error loading translation cache:', error);
            this.translationCache = {};
        }
    }
    
    /**
     * Save translation cache to localStorage
     */
    saveTranslationCache() {
        try {
            // Trim cache if it's too large
            this.trimCache();
            
            localStorage.setItem('meai-translation-cache', JSON.stringify(this.translationCache));
        } catch (error) {
            console.error('Error saving translation cache:', error);
        }
    }
    
    /**
     * Clear translation cache
     */
    clearTranslationCache() {
        this.translationCache = {};
        localStorage.removeItem('meai-translation-cache');
        console.log('Translation cache cleared');
        
        // Publish cache cleared event
        eventSystem.publish('translation-cache-cleared');
    }
    
    /**
     * Trim cache if it's too large
     */
    trimCache() {
        const cacheKeys = Object.keys(this.translationCache);
        
        if (cacheKeys.length > this.maxCacheSize) {
            // Remove oldest entries
            const keysToRemove = cacheKeys.slice(0, cacheKeys.length - this.maxCacheSize);
            
            keysToRemove.forEach(key => {
                delete this.translationCache[key];
            });
            
            console.log(`Trimmed translation cache: removed ${keysToRemove.length} entries`);
        }
    }
    
    /**
     * Add translation to history
     * @param {Object} translation - Translation data
     */
    addToHistory(translation) {
        this.translationHistory.unshift(translation);
        
        // Trim history if it's too long
        if (this.translationHistory.length > this.maxHistoryLength) {
            this.translationHistory = this.translationHistory.slice(0, this.maxHistoryLength);
        }
    }
    
    /**
     * Translate text using the active provider
     * @param {string} text - Text to translate
     * @param {string} targetLanguage - Target language code
     * @param {string} sourceLanguage - Source language code (optional)
     * @returns {Promise<string>} Translated text
     */
    async translateText(text, targetLanguage, sourceLanguage = null) {
        // Skip if text is empty
        if (!text || text.trim() === '') {
            return text;
        }
        
        // Skip if target language is not supported
        if (!multiLanguageSupport.isLanguageSupported(targetLanguage)) {
            console.warn(`Target language not supported: ${targetLanguage}`);
            return text;
        }
        
        // Detect source language if not provided
        if (!sourceLanguage) {
            sourceLanguage = await multiLanguageSupport.detectLanguage(text);
        }
        
        // Skip if source and target languages are the same
        if (sourceLanguage === targetLanguage) {
            return text;
        }
        
        // Check cache
        const cacheKey = `${sourceLanguage}-${targetLanguage}-${text}`;
        if (this.translationCache[cacheKey]) {
            return this.translationCache[cacheKey];
        }
        
        try {
            // Get active provider
            const provider = this.translationProviders[this.activeProvider];
            
            if (!provider || !provider.enabled) {
                throw new Error(`Translation provider not available: ${this.activeProvider}`);
            }
            
            // Translate text
            const translatedText = await provider.translate(text, sourceLanguage, targetLanguage);
            
            // Cache translation
            this.translationCache[cacheKey] = translatedText;
            this.saveTranslationCache();
            
            // Add to history
            this.addToHistory({
                originalText: text,
                translatedText: translatedText,
                sourceLanguage: sourceLanguage,
                targetLanguage: targetLanguage,
                timestamp: new Date().toISOString(),
                provider: this.activeProvider
            });
            
            return translatedText;
        } catch (error) {
            console.error('Error translating text:', error);
            return text;
        }
    }
    
    /**
     * Translate a batch of texts
     * @param {Array<string>} texts - Texts to translate
     * @param {string} targetLanguage - Target language code
     * @param {string} sourceLanguage - Source language code (optional)
     * @returns {Promise<Array<string>>} Translated texts
     */
    async translateBatch(texts, targetLanguage, sourceLanguage = null) {
        // Skip if texts array is empty
        if (!texts || texts.length === 0) {
            return texts;
        }
        
        // Skip if target language is not supported
        if (!multiLanguageSupport.isLanguageSupported(targetLanguage)) {
            console.warn(`Target language not supported: ${targetLanguage}`);
            return texts;
        }
        
        // Detect source language if not provided (using first text)
        if (!sourceLanguage && texts[0]) {
            sourceLanguage = await multiLanguageSupport.detectLanguage(texts[0]);
        }
        
        // Skip if source and target languages are the same
        if (sourceLanguage === targetLanguage) {
            return texts;
        }
        
        try {
            // Translate each text
            const translatedTexts = await Promise.all(
                texts.map(text => this.translateText(text, targetLanguage, sourceLanguage))
            );
            
            return translatedTexts;
        } catch (error) {
            console.error('Error translating batch:', error);
            return texts;
        }
    }
    
    /**
     * Mock translation (for demo purposes)
     * @param {string} text - Text to translate
     * @param {string} sourceLanguage - Source language code
     * @param {string} targetLanguage - Target language code
     * @returns {Promise<string>} Translated text
     */
    async mockTranslate(text, sourceLanguage, targetLanguage) {
        // In a real implementation, this would call a translation API
        // For this demo, we'll add a prefix to indicate translation
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Generate mock translation
        const languageNames = {
            en: 'English',
            es: 'Spanish',
            fr: 'French',
            de: 'German',
            it: 'Italian',
            pt: 'Portuguese',
            ru: 'Russian',
            zh: 'Chinese',
            ja: 'Japanese',
            ko: 'Korean',
            ar: 'Arabic',
            hi: 'Hindi'
        };
        
        const targetName = languageNames[targetLanguage] || targetLanguage.toUpperCase();
        
        // For demo purposes, we'll add a prefix to the text
        return `[${targetName}] ${text}`;
    }
    
    /**
     * Browser translation API (if available)
     * @param {string} text - Text to translate
     * @param {string} sourceLanguage - Source language code
     * @param {string} targetLanguage - Target language code
     * @returns {Promise<string>} Translated text
     */
    async browserTranslate(text, sourceLanguage, targetLanguage) {
        // Check if browser translation API is available
        if (typeof window.navigator.translation === 'undefined') {
            throw new Error('Browser translation API not available');
        }
        
        try {
            // Use browser translation API
            const result = await window.navigator.translation.translate(text, {
                from: sourceLanguage,
                to: targetLanguage
            });
            
            return result.translated;
        } catch (error) {
            console.error('Error using browser translation API:', error);
            
            // Fall back to mock translation
            return this.mockTranslate(text, sourceLanguage, targetLanguage);
        }
    }
    
    /**
     * Get translation history
     * @returns {Array} Translation history
     */
    getTranslationHistory() {
        return this.translationHistory;
    }
    
    /**
     * Get available translation providers
     * @returns {Object} Available providers
     */
    getAvailableProviders() {
        const providers = {};
        
        Object.keys(this.translationProviders).forEach(key => {
            if (this.translationProviders[key].enabled) {
                providers[key] = this.translationProviders[key].name;
            }
        });
        
        return providers;
    }
    
    /**
     * Get active translation provider
     * @returns {string} Active provider key
     */
    getActiveProvider() {
        return this.activeProvider;
    }
}

// Export singleton instance
export default new TranslationSystem();
