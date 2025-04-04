/**
 * Multi-language Support System for MeAI
 * 
 * This module provides localization capabilities,
 * allowing the application to be used in multiple languages.
 */

import { eventSystem } from '../utils/event-system.js';

class MultiLanguageSupport {
    constructor() {
        // State
        this.currentLanguage = 'en';
        this.supportedLanguages = [
            { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr' },
            { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr' },
            { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr' },
            { code: 'de', name: 'German', nativeName: 'Deutsch', direction: 'ltr' },
            { code: 'it', name: 'Italian', nativeName: 'Italiano', direction: 'ltr' },
            { code: 'pt', name: 'Portuguese', nativeName: 'Português', direction: 'ltr' },
            { code: 'ru', name: 'Russian', nativeName: 'Русский', direction: 'ltr' },
            { code: 'zh', name: 'Chinese', nativeName: '中文', direction: 'ltr' },
            { code: 'ja', name: 'Japanese', nativeName: '日本語', direction: 'ltr' },
            { code: 'ko', name: 'Korean', nativeName: '한국어', direction: 'ltr' },
            { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl' },
            { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr' }
        ];
        this.translations = {};
        this.detectedLanguage = null;
        this.translationCache = {};
        this.loadingTranslations = false;
        
        // Initialize event listeners
        this.setupEventListeners();
    }
    
    /**
     * Initialize the multi-language support system
     */
    async init() {
        console.log('Initializing Multi-language Support System');
        
        // Load saved language preference
        this.loadSavedLanguage();
        
        // Detect browser language if no preference is saved
        if (!localStorage.getItem('meai-language')) {
            this.detectBrowserLanguage();
        }
        
        // Load translations for current language
        await this.loadTranslations(this.currentLanguage);
        
        // Apply language to document
        this.applyLanguage();
        
        console.log('Multi-language Support System initialized with language:', this.currentLanguage);
        
        // Publish initialization event
        eventSystem.publish('language-system-initialized', {
            language: this.currentLanguage,
            supportedLanguages: this.supportedLanguages
        });
        
        return true;
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for language change events
        eventSystem.subscribe('language-change', (data) => {
            this.setLanguage(data.language);
        });
        
        // Listen for text translation requests
        eventSystem.subscribe('translate-text', async (data) => {
            const translation = await this.translateText(data.text, data.targetLanguage || this.currentLanguage, data.sourceLanguage);
            
            eventSystem.publish('text-translated', {
                originalText: data.text,
                translatedText: translation,
                sourceLanguage: data.sourceLanguage,
                targetLanguage: data.targetLanguage || this.currentLanguage,
                requestId: data.requestId
            });
        });
        
        // Listen for language detection requests
        eventSystem.subscribe('detect-language', async (data) => {
            const detectedLanguage = await this.detectLanguage(data.text);
            
            eventSystem.publish('language-detected', {
                text: data.text,
                detectedLanguage: detectedLanguage,
                requestId: data.requestId
            });
        });
    }
    
    /**
     * Load saved language preference
     */
    loadSavedLanguage() {
        const savedLanguage = localStorage.getItem('meai-language');
        
        if (savedLanguage && this.isLanguageSupported(savedLanguage)) {
            this.currentLanguage = savedLanguage;
            console.log('Loaded saved language preference:', savedLanguage);
        }
    }
    
    /**
     * Detect browser language
     */
    detectBrowserLanguage() {
        try {
            // Get browser language
            const browserLanguage = navigator.language || navigator.userLanguage;
            
            if (browserLanguage) {
                // Extract language code (e.g., 'en-US' -> 'en')
                const languageCode = browserLanguage.split('-')[0];
                
                // Check if language is supported
                if (this.isLanguageSupported(languageCode)) {
                    this.currentLanguage = languageCode;
                    console.log('Detected browser language:', languageCode);
                }
            }
        } catch (error) {
            console.error('Error detecting browser language:', error);
        }
    }
    
    /**
     * Check if a language is supported
     * @param {string} languageCode - Language code
     * @returns {boolean} Whether the language is supported
     */
    isLanguageSupported(languageCode) {
        return this.supportedLanguages.some(lang => lang.code === languageCode);
    }
    
    /**
     * Load translations for a language
     * @param {string} languageCode - Language code
     * @returns {Promise<Object>} Translations
     */
    async loadTranslations(languageCode) {
        // Skip if already loading
        if (this.loadingTranslations) {
            return this.translations[languageCode] || {};
        }
        
        // Skip if already loaded
        if (this.translations[languageCode]) {
            return this.translations[languageCode];
        }
        
        // Skip if language is not supported
        if (!this.isLanguageSupported(languageCode)) {
            console.warn(`Language not supported: ${languageCode}`);
            return {};
        }
        
        this.loadingTranslations = true;
        
        try {
            // Load translations from file
            const response = await fetch(`/assets/locales/${languageCode}.json`);
            
            if (!response.ok) {
                throw new Error(`Failed to load translations for ${languageCode}: ${response.status} ${response.statusText}`);
            }
            
            const translations = await response.json();
            
            // Store translations
            this.translations[languageCode] = translations;
            
            console.log(`Loaded translations for ${languageCode}:`, Object.keys(translations).length, 'keys');
            
            this.loadingTranslations = false;
            return translations;
        } catch (error) {
            console.error(`Error loading translations for ${languageCode}:`, error);
            
            // Create empty translations object
            this.translations[languageCode] = {};
            
            this.loadingTranslations = false;
            return {};
        }
    }
    
    /**
     * Set the current language
     * @param {string} languageCode - Language code
     * @returns {Promise<boolean>} Success
     */
    async setLanguage(languageCode) {
        // Skip if language is not supported
        if (!this.isLanguageSupported(languageCode)) {
            console.warn(`Language not supported: ${languageCode}`);
            return false;
        }
        
        // Skip if language is already set
        if (this.currentLanguage === languageCode) {
            return true;
        }
        
        // Load translations for new language
        await this.loadTranslations(languageCode);
        
        // Update current language
        this.currentLanguage = languageCode;
        
        // Save preference
        localStorage.setItem('meai-language', languageCode);
        
        // Apply language to document
        this.applyLanguage();
        
        console.log('Language set to:', languageCode);
        
        // Publish language change event
        eventSystem.publish('language-changed', {
            language: languageCode,
            previousLanguage: this.currentLanguage
        });
        
        return true;
    }
    
    /**
     * Apply language to document
     */
    applyLanguage() {
        // Set language attribute on html element
        document.documentElement.lang = this.currentLanguage;
        
        // Set direction attribute based on language
        const language = this.supportedLanguages.find(lang => lang.code === this.currentLanguage);
        if (language) {
            document.documentElement.dir = language.direction;
            
            // Add RTL class to body if needed
            if (language.direction === 'rtl') {
                document.body.classList.add('rtl');
            } else {
                document.body.classList.remove('rtl');
            }
        }
        
        // Translate all elements with data-i18n attribute
        this.translateElements();
    }
    
    /**
     * Translate all elements with data-i18n attribute
     */
    translateElements() {
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.translate(key);
            
            if (translation) {
                // Check if element has placeholder attribute
                if (element.hasAttribute('placeholder')) {
                    element.setAttribute('placeholder', translation);
                } else {
                    element.textContent = translation;
                }
            }
        });
        
        // Translate elements with data-i18n-attr attribute (for attributes)
        const attrElements = document.querySelectorAll('[data-i18n-attr]');
        
        attrElements.forEach(element => {
            const data = element.getAttribute('data-i18n-attr').split(',');
            
            data.forEach(item => {
                const [attr, key] = item.trim().split(':');
                const translation = this.translate(key);
                
                if (translation && attr) {
                    element.setAttribute(attr, translation);
                }
            });
        });
    }
    
    /**
     * Translate a key
     * @param {string} key - Translation key
     * @param {Object} params - Parameters for interpolation
     * @returns {string} Translated text
     */
    translate(key, params = {}) {
        // Get translations for current language
        const translations = this.translations[this.currentLanguage] || {};
        
        // Get translation
        let translation = translations[key];
        
        // Fall back to English if translation not found
        if (!translation && this.currentLanguage !== 'en') {
            const englishTranslations = this.translations['en'] || {};
            translation = englishTranslations[key];
        }
        
        // Fall back to key if translation not found
        if (!translation) {
            translation = key;
        }
        
        // Interpolate parameters
        if (params && Object.keys(params).length > 0) {
            Object.keys(params).forEach(param => {
                translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
            });
        }
        
        return translation;
    }
    
    /**
     * Detect language of text
     * @param {string} text - Text to detect
     * @returns {Promise<string>} Detected language code
     */
    async detectLanguage(text) {
        try {
            // Use browser's language detection API if available
            if (window.navigator.language && text.length < 5) {
                // For very short texts, browser language is a good guess
                return window.navigator.language.split('-')[0];
            }
            
            // Use a simple heuristic for common languages
            const languagePatterns = {
                en: /\b(the|and|is|in|to|of|that|for|with|you|this|have|are|on|not|be)\b/i,
                es: /\b(el|la|los|las|de|en|que|por|con|para|una|un|es|no|se)\b/i,
                fr: /\b(le|la|les|de|des|en|que|qui|pour|dans|un|une|est|et|pas)\b/i,
                de: /\b(der|die|das|und|ist|in|zu|den|für|mit|dem|nicht|ein|eine|von)\b/i,
                it: /\b(il|la|i|le|di|che|è|per|in|un|una|sono|non|con|mi)\b/i,
                pt: /\b(o|a|os|as|de|que|é|para|em|um|uma|com|não|se|na)\b/i,
                ru: /[а-яА-Я]{4,}/,
                zh: /[\u4e00-\u9fff]{2,}/,
                ja: /[\u3040-\u309f\u30a0-\u30ff]{2,}/,
                ko: /[\uac00-\ud7af]{2,}/,
                ar: /[\u0600-\u06ff]{2,}/,
                hi: /[\u0900-\u097f]{2,}/
            };
            
            // Count matches for each language
            const matches = {};
            
            for (const [lang, pattern] of Object.entries(languagePatterns)) {
                const match = text.match(pattern);
                matches[lang] = match ? match.length : 0;
            }
            
            // Find language with most matches
            let detectedLanguage = 'en'; // Default to English
            let maxMatches = 0;
            
            for (const [lang, count] of Object.entries(matches)) {
                if (count > maxMatches) {
                    maxMatches = count;
                    detectedLanguage = lang;
                }
            }
            
            // Store detected language
            this.detectedLanguage = detectedLanguage;
            
            return detectedLanguage;
        } catch (error) {
            console.error('Error detecting language:', error);
            return 'en'; // Default to English
        }
    }
    
    /**
     * Translate text to target language
     * @param {string} text - Text to translate
     * @param {string} targetLanguage - Target language code
     * @param {string} sourceLanguage - Source language code (optional)
     * @returns {Promise<string>} Translated text
     */
    async translateText(text, targetLanguage = this.currentLanguage, sourceLanguage = null) {
        // Skip if text is empty
        if (!text || text.trim() === '') {
            return text;
        }
        
        // Skip if target language is not supported
        if (!this.isLanguageSupported(targetLanguage)) {
            console.warn(`Target language not supported: ${targetLanguage}`);
            return text;
        }
        
        // Skip if source and target languages are the same
        if (sourceLanguage && sourceLanguage === targetLanguage) {
            return text;
        }
        
        // Check cache
        const cacheKey = `${sourceLanguage || 'auto'}-${targetLanguage}-${text}`;
        if (this.translationCache[cacheKey]) {
            return this.translationCache[cacheKey];
        }
        
        try {
            // Detect source language if not provided
            if (!sourceLanguage) {
                sourceLanguage = await this.detectLanguage(text);
            }
            
            // Skip if source and target languages are the same
            if (sourceLanguage === targetLanguage) {
                return text;
            }
            
            // In a real implementation, this would call a translation API
            // For this demo, we'll use a simple mock translation
            const translatedText = this.mockTranslation(text, sourceLanguage, targetLanguage);
            
            // Cache translation
            this.translationCache[cacheKey] = translatedText;
            
            return translatedText;
        } catch (error) {
            console.error('Error translating text:', error);
            return text;
        }
    }
    
    /**
     * Mock translation (for demo purposes)
     * @param {string} text - Text to translate
     * @param {string} sourceLanguage - Source language code
     * @param {string} targetLanguage - Target language code
     * @returns {string} Translated text
     */
    mockTranslation(text, sourceLanguage, targetLanguage) {
        // In a real implementation, this would call a translation API
        // For this demo, we'll add a prefix to indicate translation
        return `[${targetLanguage.toUpperCase()}] ${text}`;
    }
    
    /**
     * Get all supported languages
     * @returns {Array} Supported languages
     */
    getSupportedLanguages() {
        return this.supportedLanguages;
    }
    
    /**
     * Get current language
     * @returns {Object} Current language
     */
    getCurrentLanguage() {
        return this.supportedLanguages.find(lang => lang.code === this.currentLanguage);
    }
    
    /**
     * Format date according to current language
     * @param {Date|string|number} date - Date to format
     * @param {Object} options - Intl.DateTimeFormat options
     * @returns {string} Formatted date
     */
    formatDate(date, options = {}) {
        try {
            const dateObj = new Date(date);
            
            return new Intl.DateTimeFormat(this.currentLanguage, options).format(dateObj);
        } catch (error) {
            console.error('Error formatting date:', error);
            return String(date);
        }
    }
    
    /**
     * Format number according to current language
     * @param {number} number - Number to format
     * @param {Object} options - Intl.NumberFormat options
     * @returns {string} Formatted number
     */
    formatNumber(number, options = {}) {
        try {
            return new Intl.NumberFormat(this.currentLanguage, options).format(number);
        } catch (error) {
            console.error('Error formatting number:', error);
            return String(number);
        }
    }
    
    /**
     * Format currency according to current language
     * @param {number} amount - Amount to format
     * @param {string} currency - Currency code
     * @returns {string} Formatted currency
     */
    formatCurrency(amount, currency = 'USD') {
        try {
            return new Intl.NumberFormat(this.currentLanguage, {
                style: 'currency',
                currency: currency
            }).format(amount);
        } catch (error) {
            console.error('Error formatting currency:', error);
            return String(amount);
        }
    }
    
    /**
     * Get direction of current language
     * @returns {string} Text direction ('ltr' or 'rtl')
     */
    getTextDirection() {
        const language = this.supportedLanguages.find(lang => lang.code === this.currentLanguage);
        return language ? language.direction : 'ltr';
    }
    
    /**
     * Check if current language is RTL
     * @returns {boolean} Whether current language is RTL
     */
    isRTL() {
        return this.getTextDirection() === 'rtl';
    }
}

// Export singleton instance
export default new MultiLanguageSupport();
