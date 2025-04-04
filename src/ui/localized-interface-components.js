/**
 * Localized Interface Components for MeAI
 * 
 * This module provides UI components that adapt to different languages,
 * including handling RTL languages and localized formatting.
 */

import { eventSystem } from '../utils/event-system.js';
import multiLanguageSupport from '../utils/multi-language-support.js';
import translationSystem from '../utils/translation-system.js';

class LocalizedInterfaceComponents {
    constructor() {
        // State
        this.components = {};
        this.rtlAdjustments = {};
        this.currentLanguage = multiLanguageSupport.getCurrentLanguage().code;
        this.isRTL = multiLanguageSupport.isRTL();
        
        // Initialize event listeners
        this.setupEventListeners();
    }
    
    /**
     * Initialize the localized interface components
     */
    async init() {
        console.log('Initializing Localized Interface Components');
        
        // Register built-in components
        this.registerBuiltInComponents();
        
        // Apply RTL adjustments if needed
        if (this.isRTL) {
            this.applyRTLAdjustments();
        }
        
        console.log('Localized Interface Components initialized');
        
        // Publish initialization event
        eventSystem.publish('localized-interface-initialized', {
            language: this.currentLanguage,
            isRTL: this.isRTL,
            components: Object.keys(this.components)
        });
        
        return true;
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for language change events
        eventSystem.subscribe('language-changed', (data) => {
            this.handleLanguageChange(data.language);
        });
        
        // Listen for component registration events
        eventSystem.subscribe('register-localized-component', (data) => {
            this.registerComponent(data.id, data.component);
        });
        
        // Listen for UI update events
        eventSystem.subscribe('update-interface', () => {
            this.updateAllComponents();
        });
    }
    
    /**
     * Register built-in components
     */
    registerBuiltInComponents() {
        // Register date formatter component
        this.registerComponent('date-formatter', {
            render: (date, options = {}) => {
                return multiLanguageSupport.formatDate(date, options);
            }
        });
        
        // Register number formatter component
        this.registerComponent('number-formatter', {
            render: (number, options = {}) => {
                return multiLanguageSupport.formatNumber(number, options);
            }
        });
        
        // Register currency formatter component
        this.registerComponent('currency-formatter', {
            render: (amount, currency = 'USD') => {
                return multiLanguageSupport.formatCurrency(amount, currency);
            }
        });
        
        // Register language selector component
        this.registerComponent('language-selector', {
            render: (containerId, options = {}) => {
                this.renderLanguageSelector(containerId, options);
            }
        });
        
        // Register translation button component
        this.registerComponent('translation-button', {
            render: (containerId, options = {}) => {
                this.renderTranslationButton(containerId, options);
            }
        });
        
        // Register localized tooltip component
        this.registerComponent('localized-tooltip', {
            render: (element, key, options = {}) => {
                this.renderLocalizedTooltip(element, key, options);
            }
        });
        
        // Register RTL-aware layout component
        this.registerComponent('rtl-aware-layout', {
            render: (containerId, options = {}) => {
                this.renderRTLAwareLayout(containerId, options);
            }
        });
        
        // Register bidirectional text component
        this.registerComponent('bidi-text', {
            render: (text) => {
                return this.renderBidirectionalText(text);
            }
        });
    }
    
    /**
     * Register a localized component
     * @param {string} id - Component ID
     * @param {Object} component - Component object
     */
    registerComponent(id, component) {
        if (!id || !component) {
            console.error('Invalid component registration:', id);
            return false;
        }
        
        this.components[id] = component;
        console.log('Registered localized component:', id);
        
        return true;
    }
    
    /**
     * Handle language change
     * @param {string} language - Language code
     */
    handleLanguageChange(language) {
        const previousLanguage = this.currentLanguage;
        this.currentLanguage = language;
        
        // Check if RTL status changed
        const wasRTL = this.isRTL;
        this.isRTL = multiLanguageSupport.isRTL();
        
        if (wasRTL !== this.isRTL) {
            // RTL status changed, apply or remove RTL adjustments
            if (this.isRTL) {
                this.applyRTLAdjustments();
            } else {
                this.removeRTLAdjustments();
            }
        }
        
        // Update all components
        this.updateAllComponents();
        
        console.log('Language changed in localized interface:', language);
    }
    
    /**
     * Update all components
     */
    updateAllComponents() {
        // Update all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = multiLanguageSupport.translate(key);
            
            if (translation) {
                // Check if element has placeholder attribute
                if (element.hasAttribute('placeholder')) {
                    element.setAttribute('placeholder', translation);
                } else {
                    element.textContent = translation;
                }
            }
        });
        
        // Update all elements with data-i18n-attr attribute (for attributes)
        const attrElements = document.querySelectorAll('[data-i18n-attr]');
        
        attrElements.forEach(element => {
            const data = element.getAttribute('data-i18n-attr').split(',');
            
            data.forEach(item => {
                const [attr, key] = item.trim().split(':');
                const translation = multiLanguageSupport.translate(key);
                
                if (translation && attr) {
                    element.setAttribute(attr, translation);
                }
            });
        });
        
        // Update all elements with data-i18n-html attribute (for HTML content)
        const htmlElements = document.querySelectorAll('[data-i18n-html]');
        
        htmlElements.forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            const translation = multiLanguageSupport.translate(key);
            
            if (translation) {
                element.innerHTML = translation;
            }
        });
        
        // Update all date elements
        const dateElements = document.querySelectorAll('[data-localized-date]');
        
        dateElements.forEach(element => {
            const date = element.getAttribute('data-date');
            const format = element.getAttribute('data-date-format') || {};
            
            if (date) {
                element.textContent = this.components['date-formatter'].render(date, JSON.parse(format));
            }
        });
        
        // Update all number elements
        const numberElements = document.querySelectorAll('[data-localized-number]');
        
        numberElements.forEach(element => {
            const number = element.getAttribute('data-number');
            const format = element.getAttribute('data-number-format') || {};
            
            if (number) {
                element.textContent = this.components['number-formatter'].render(number, JSON.parse(format));
            }
        });
        
        // Update all currency elements
        const currencyElements = document.querySelectorAll('[data-localized-currency]');
        
        currencyElements.forEach(element => {
            const amount = element.getAttribute('data-amount');
            const currency = element.getAttribute('data-currency') || 'USD';
            
            if (amount) {
                element.textContent = this.components['currency-formatter'].render(amount, currency);
            }
        });
        
        // Update language selectors
        const languageSelectors = document.querySelectorAll('.meai-language-selector');
        
        languageSelectors.forEach(selector => {
            const containerId = selector.id;
            const options = JSON.parse(selector.getAttribute('data-options') || '{}');
            
            this.components['language-selector'].render(containerId, options);
        });
        
        // Update RTL-aware layouts
        const rtlLayouts = document.querySelectorAll('.meai-rtl-aware-layout');
        
        rtlLayouts.forEach(layout => {
            const containerId = layout.id;
            const options = JSON.parse(layout.getAttribute('data-options') || '{}');
            
            this.components['rtl-aware-layout'].render(containerId, options);
        });
        
        // Publish update event
        eventSystem.publish('localized-interface-updated', {
            language: this.currentLanguage,
            isRTL: this.isRTL
        });
    }
    
    /**
     * Apply RTL adjustments to the interface
     */
    applyRTLAdjustments() {
        // Add RTL class to body
        document.body.classList.add('rtl');
        
        // Store original CSS values for later restoration
        this.rtlAdjustments = {
            bodyDir: document.body.dir,
            htmlDir: document.documentElement.dir
        };
        
        // Set direction attributes
        document.body.dir = 'rtl';
        document.documentElement.dir = 'rtl';
        
        // Adjust CSS for RTL layout
        const rtlStyle = document.createElement('style');
        rtlStyle.id = 'meai-rtl-styles';
        rtlStyle.textContent = `
            /* RTL adjustments */
            .meai-container {
                direction: rtl;
                text-align: right;
            }
            
            .meai-header {
                flex-direction: row-reverse;
            }
            
            .meai-sidebar {
                right: 0;
                left: auto;
            }
            
            .meai-main {
                margin-right: var(--sidebar-width, 250px);
                margin-left: 0;
            }
            
            .meai-button-icon {
                margin-right: 0;
                margin-left: 8px;
            }
            
            .meai-input {
                text-align: right;
            }
            
            .meai-dropdown {
                text-align: right;
            }
            
            .meai-message-bubble.user {
                margin-left: 0;
                margin-right: auto;
            }
            
            .meai-message-bubble.assistant {
                margin-right: 0;
                margin-left: auto;
            }
            
            .meai-settings-label {
                text-align: right;
            }
            
            /* Mirror icons that have direction */
            .meai-icon-direction {
                transform: scaleX(-1);
            }
        `;
        
        document.head.appendChild(rtlStyle);
        
        console.log('Applied RTL adjustments to interface');
    }
    
    /**
     * Remove RTL adjustments from the interface
     */
    removeRTLAdjustments() {
        // Remove RTL class from body
        document.body.classList.remove('rtl');
        
        // Restore original direction attributes
        if (this.rtlAdjustments.bodyDir) {
            document.body.dir = this.rtlAdjustments.bodyDir;
        } else {
            document.body.removeAttribute('dir');
        }
        
        if (this.rtlAdjustments.htmlDir) {
            document.documentElement.dir = this.rtlAdjustments.htmlDir;
        } else {
            document.documentElement.removeAttribute('dir');
        }
        
        // Remove RTL style
        const rtlStyle = document.getElementById('meai-rtl-styles');
        if (rtlStyle) {
            rtlStyle.remove();
        }
        
        console.log('Removed RTL adjustments from interface');
    }
    
    /**
     * Render language selector component
     * @param {string} containerId - Container element ID
     * @param {Object} options - Rendering options
     */
    renderLanguageSelector(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Container not found:', containerId);
            return;
        }
        
        // Get supported languages
        const languages = multiLanguageSupport.getSupportedLanguages();
        const currentLanguage = multiLanguageSupport.getCurrentLanguage().code;
        
        // Clear container
        container.innerHTML = '';
        
        // Create language selector
        const selector = document.createElement('select');
        selector.className = 'meai-language-selector-dropdown';
        selector.setAttribute('aria-label', multiLanguageSupport.translate('language_selector'));
        
        // Add languages
        languages.forEach(language => {
            const option = document.createElement('option');
            option.value = language.code;
            option.textContent = options.useNativeNames ? language.nativeName : language.name;
            option.selected = language.code === currentLanguage;
            selector.appendChild(option);
        });
        
        // Add change event listener
        selector.addEventListener('change', (event) => {
            const selectedLanguage = event.target.value;
            eventSystem.publish('language-change', {
                language: selectedLanguage
            });
        });
        
        // Add label if specified
        if (options.showLabel) {
            const label = document.createElement('label');
            label.className = 'meai-language-selector-label';
            label.textContent = multiLanguageSupport.translate('language');
            label.htmlFor = `${containerId}-select`;
            selector.id = `${containerId}-select`;
            container.appendChild(label);
        }
        
        // Add selector to container
        container.appendChild(selector);
        
        // Add flag icons if specified
        if (options.showFlags) {
            // Replace select with a custom dropdown
            selector.style.display = 'none';
            
            const customDropdown = document.createElement('div');
            customDropdown.className = 'meai-custom-language-dropdown';
            
            const selectedLanguageDisplay = document.createElement('div');
            selectedLanguageDisplay.className = 'meai-selected-language';
            
            // Add flag icon
            const flagIcon = document.createElement('span');
            flagIcon.className = `meai-flag-icon meai-flag-${currentLanguage}`;
            selectedLanguageDisplay.appendChild(flagIcon);
            
            // Add language name
            const languageName = document.createElement('span');
            languageName.className = 'meai-language-name';
            const currentLang = languages.find(lang => lang.code === currentLanguage);
            languageName.textContent = options.useNativeNames ? currentLang.nativeName : currentLang.name;
            selectedLanguageDisplay.appendChild(languageName);
            
            // Add dropdown arrow
            const dropdownArrow = document.createElement('span');
            dropdownArrow.className = 'meai-dropdown-arrow';
            dropdownArrow.innerHTML = '&#9662;';
            selectedLanguageDisplay.appendChild(dropdownArrow);
            
            customDropdown.appendChild(selectedLanguageDisplay);
            
            // Create dropdown options
            const dropdownOptions = document.createElement('div');
            dropdownOptions.className = 'meai-language-dropdown-options';
            
            languages.forEach(language => {
                const option = document.createElement('div');
                option.className = 'meai-language-option';
                option.setAttribute('data-value', language.code);
                
                // Add flag icon
                const flagIcon = document.createElement('span');
                flagIcon.className = `meai-flag-icon meai-flag-${language.code}`;
                option.appendChild(flagIcon);
                
                // Add language name
                const languageName = document.createElement('span');
                languageName.className = 'meai-language-name';
                languageName.textContent = options.useNativeNames ? language.nativeName : language.name;
                option.appendChild(languageName);
                
                // Add click event
                option.addEventListener('click', () => {
                    // Update select element
                    selector.value = language.code;
                    selector.dispatchEvent(new Event('change'));
                    
                    // Close dropdown
                    dropdownOptions.style.display = 'none';
                });
                
                dropdownOptions.appendChild(option);
            });
            
            customDropdown.appendChild(dropdownOptions);
            
            // Toggle dropdown on click
            selectedLanguageDisplay.addEventListener('click', () => {
                const isVisible = dropdownOptions.style.display === 'block';
                dropdownOptions.style.display = isVisible ? 'none' : 'block';
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (event) => {
                if (!customDropdown.contains(event.target)) {
                    dropdownOptions.style.display = 'none';
                }
            });
            
            container.appendChild(customDropdown);
        }
        
        // Store options for future updates
        container.setAttribute('data-options', JSON.stringify(options));
    }
    
    /**
     * Render translation button component
     * @param {string} containerId - Container element ID
     * @param {Object} options - Rendering options
     */
    renderTranslationButton(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Container not found:', containerId);
            return;
        }
        
        // Clear container
        container.innerHTML = '';
        
        // Create translation button
        const button = document.createElement('button');
        button.className = 'meai-translation-button';
        button.setAttribute('aria-label', multiLanguageSupport.translate('translate'));
        
        // Add icon
        const icon = document.createElement('span');
        icon.className = 'meai-translation-icon';
        icon.innerHTML = '🌐';
        button.appendChild(icon);
        
        // Add text if specified
        if (options.showText) {
            const text = document.createElement('span');
            text.className = 'meai-translation-text';
            text.textContent = multiLanguageSupport.translate('translate');
            button.appendChild(text);
        }
        
        // Add click event listener
        button.addEventListener('click', () => {
            // Get target element
            const targetElement = options.targetSelector 
                ? document.querySelector(options.targetSelector) 
                : null;
            
            if (!targetElement) {
                console.error('Translation target not found:', options.targetSelector);
                return;
            }
            
            // Get text to translate
            const textToTranslate = targetElement.textContent;
            
            // Get target language
            const targetLanguage = options.targetLanguage || multiLanguageSupport.getCurrentLanguage().code;
            
            // Show translation UI
            this.showTranslationUI(textToTranslate, targetLanguage, targetElement);
        });
        
        // Add button to container
        container.appendChild(button);
        
        // Store options for future updates
        container.setAttribute('data-options', JSON.stringify(options));
    }
    
    /**
     * Show translation UI
     * @param {string} text - Text to translate
     * @param {string} targetLanguage - Target language code
     * @param {Element} targetElement - Target element to update
     */
    showTranslationUI(text, targetLanguage, targetElement) {
        // Create translation dialog
        const dialog = document.createElement('div');
        dialog.className = 'meai-translation-dialog';
        
        // Add header
        const header = document.createElement('div');
        header.className = 'meai-translation-header';
        
        const title = document.createElement('h3');
        title.textContent = multiLanguageSupport.translate('translate_text');
        header.appendChild(title);
        
        const closeButton = document.createElement('button');
        closeButton.className = 'meai-translation-close';
        closeButton.innerHTML = '&times;';
        closeButton.setAttribute('aria-label', multiLanguageSupport.translate('close'));
        closeButton.addEventListener('click', () => {
            dialog.remove();
        });
        header.appendChild(closeButton);
        
        dialog.appendChild(header);
        
        // Add content
        const content = document.createElement('div');
        content.className = 'meai-translation-content';
        
        // Original text
        const originalContainer = document.createElement('div');
        originalContainer.className = 'meai-translation-original';
        
        const originalLabel = document.createElement('div');
        originalLabel.className = 'meai-translation-label';
        originalLabel.textContent = multiLanguageSupport.translate('original_text');
        originalContainer.appendChild(originalLabel);
        
        const originalText = document.createElement('div');
        originalText.className = 'meai-translation-text';
        originalText.textContent = text;
        originalContainer.appendChild(originalText);
        
        content.appendChild(originalContainer);
        
        // Translation
        const translationContainer = document.createElement('div');
        translationContainer.className = 'meai-translation-result';
        
        const translationLabel = document.createElement('div');
        translationLabel.className = 'meai-translation-label';
        translationLabel.textContent = multiLanguageSupport.translate('translation');
        translationContainer.appendChild(translationLabel);
        
        const translationText = document.createElement('div');
        translationText.className = 'meai-translation-text';
        translationText.textContent = multiLanguageSupport.translate('translating');
        translationContainer.appendChild(translationText);
        
        content.appendChild(translationContainer);
        
        dialog.appendChild(content);
        
        // Add footer
        const footer = document.createElement('div');
        footer.className = 'meai-translation-footer';
        
        // Language selector
        const languageSelector = document.createElement('select');
        languageSelector.className = 'meai-translation-language-selector';
        
        // Add languages
        const languages = multiLanguageSupport.getSupportedLanguages();
        languages.forEach(language => {
            const option = document.createElement('option');
            option.value = language.code;
            option.textContent = language.name;
            option.selected = language.code === targetLanguage;
            languageSelector.appendChild(option);
        });
        
        // Add change event listener
        languageSelector.addEventListener('change', async (event) => {
            const selectedLanguage = event.target.value;
            
            // Update translation
            translationText.textContent = multiLanguageSupport.translate('translating');
            
            const translation = await translationSystem.translateText(text, selectedLanguage);
            translationText.textContent = translation;
        });
        
        footer.appendChild(languageSelector);
        
        // Apply button
        const applyButton = document.createElement('button');
        applyButton.className = 'meai-translation-apply';
        applyButton.textContent = multiLanguageSupport.translate('apply_translation');
        applyButton.addEventListener('click', () => {
            // Update target element with translation
            targetElement.textContent = translationText.textContent;
            
            // Close dialog
            dialog.remove();
        });
        
        footer.appendChild(applyButton);
        
        dialog.appendChild(footer);
        
        // Add dialog to body
        document.body.appendChild(dialog);
        
        // Translate text
        translationSystem.translateText(text, targetLanguage)
            .then(translation => {
                translationText.textContent = translation;
            })
            .catch(error => {
                console.error('Translation error:', error);
                translationText.textContent = multiLanguageSupport.translate('translation_error');
            });
    }
    
    /**
     * Render localized tooltip component
     * @param {Element} element - Element to attach tooltip to
     * @param {string} key - Translation key
     * @param {Object} options - Rendering options
     */
    renderLocalizedTooltip(element, key, options = {}) {
        if (!element) {
            console.error('Element not found for tooltip');
            return;
        }
        
        // Get translation
        const tooltipText = multiLanguageSupport.translate(key);
        
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'meai-tooltip';
        tooltip.textContent = tooltipText;
        
        // Set position
        tooltip.style.position = 'absolute';
        tooltip.style.display = 'none';
        tooltip.style.zIndex = '1000';
        
        // Add tooltip to body
        document.body.appendChild(tooltip);
        
        // Show tooltip on hover/focus
        const showTooltip = () => {
            // Position tooltip
            const rect = element.getBoundingClientRect();
            const position = options.position || 'top';
            
            switch (position) {
                case 'top':
                    tooltip.style.bottom = `${window.innerHeight - rect.top + 5}px`;
                    tooltip.style.left = `${rect.left + rect.width / 2}px`;
                    tooltip.style.transform = 'translateX(-50%)';
                    break;
                case 'bottom':
                    tooltip.style.top = `${rect.bottom + 5}px`;
                    tooltip.style.left = `${rect.left + rect.width / 2}px`;
                    tooltip.style.transform = 'translateX(-50%)';
                    break;
                case 'left':
                    tooltip.style.top = `${rect.top + rect.height / 2}px`;
                    tooltip.style.right = `${window.innerWidth - rect.left + 5}px`;
                    tooltip.style.transform = 'translateY(-50%)';
                    break;
                case 'right':
                    tooltip.style.top = `${rect.top + rect.height / 2}px`;
                    tooltip.style.left = `${rect.right + 5}px`;
                    tooltip.style.transform = 'translateY(-50%)';
                    break;
            }
            
            // Show tooltip
            tooltip.style.display = 'block';
        };
        
        // Hide tooltip
        const hideTooltip = () => {
            tooltip.style.display = 'none';
        };
        
        // Add event listeners
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
        element.addEventListener('focus', showTooltip);
        element.addEventListener('blur', hideTooltip);
        
        // Store tooltip reference for cleanup
        element._meaiTooltip = tooltip;
        
        // Store key for updates
        element.setAttribute('data-tooltip-key', key);
        
        // Store options for updates
        if (options) {
            element.setAttribute('data-tooltip-options', JSON.stringify(options));
        }
    }
    
    /**
     * Render RTL-aware layout component
     * @param {string} containerId - Container element ID
     * @param {Object} options - Rendering options
     */
    renderRTLAwareLayout(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Container not found:', containerId);
            return;
        }
        
        // Set RTL-aware classes
        container.classList.add('meai-rtl-aware-layout');
        
        // Apply RTL-specific styles if needed
        if (this.isRTL) {
            container.classList.add('rtl');
            
            // Apply specific RTL adjustments based on layout type
            if (options.layoutType === 'sidebar') {
                // Adjust sidebar layout for RTL
                const sidebar = container.querySelector('.meai-sidebar');
                const main = container.querySelector('.meai-main');
                
                if (sidebar) {
                    sidebar.style.right = '0';
                    sidebar.style.left = 'auto';
                }
                
                if (main) {
                    main.style.marginRight = options.sidebarWidth || '250px';
                    main.style.marginLeft = '0';
                }
            } else if (options.layoutType === 'chat') {
                // Adjust chat layout for RTL
                const userMessages = container.querySelectorAll('.meai-message-bubble.user');
                const assistantMessages = container.querySelectorAll('.meai-message-bubble.assistant');
                
                userMessages.forEach(message => {
                    message.style.marginLeft = '0';
                    message.style.marginRight = 'auto';
                });
                
                assistantMessages.forEach(message => {
                    message.style.marginRight = '0';
                    message.style.marginLeft = 'auto';
                });
            }
        } else {
            container.classList.remove('rtl');
            
            // Remove RTL-specific styles
            if (options.layoutType === 'sidebar') {
                const sidebar = container.querySelector('.meai-sidebar');
                const main = container.querySelector('.meai-main');
                
                if (sidebar) {
                    sidebar.style.left = '0';
                    sidebar.style.right = 'auto';
                }
                
                if (main) {
                    main.style.marginLeft = options.sidebarWidth || '250px';
                    main.style.marginRight = '0';
                }
            } else if (options.layoutType === 'chat') {
                const userMessages = container.querySelectorAll('.meai-message-bubble.user');
                const assistantMessages = container.querySelectorAll('.meai-message-bubble.assistant');
                
                userMessages.forEach(message => {
                    message.style.marginRight = '0';
                    message.style.marginLeft = 'auto';
                });
                
                assistantMessages.forEach(message => {
                    message.style.marginLeft = '0';
                    message.style.marginRight = 'auto';
                });
            }
        }
        
        // Store options for future updates
        container.setAttribute('data-options', JSON.stringify(options));
    }
    
    /**
     * Render bidirectional text
     * @param {string} text - Text to render
     * @returns {string} Bidirectional text with appropriate markers
     */
    renderBidirectionalText(text) {
        if (!text) {
            return '';
        }
        
        // Add Unicode bidirectional markers
        if (this.isRTL) {
            // RTL marker
            return `\u200F${text}\u200F`;
        } else {
            // LTR marker
            return `\u200E${text}\u200E`;
        }
    }
    
    /**
     * Get a localized component
     * @param {string} id - Component ID
     * @returns {Object} Component object
     */
    getComponent(id) {
        return this.components[id];
    }
    
    /**
     * Get all localized components
     * @returns {Object} Components object
     */
    getAllComponents() {
        return this.components;
    }
}

// Export singleton instance
export default new LocalizedInterfaceComponents();
