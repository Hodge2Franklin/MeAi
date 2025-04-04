/**
 * Event System for MeAI
 * 
 * This utility provides a centralized event system for component communication
 * without tight coupling. Components can publish and subscribe to events.
 */

class EventSystem {
    constructor() {
        this.listeners = {};
    }
    
    /**
     * Subscribe to an event
     * @param {string} eventName - Name of the event to listen for
     * @param {Function} callback - Function to call when event is triggered
     * @returns {Function} - Unsubscribe function
     */
    subscribe(eventName, callback) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }
        
        this.listeners[eventName].push(callback);
        
        // Return unsubscribe function
        return () => {
            this.listeners[eventName] = this.listeners[eventName].filter(
                listener => listener !== callback
            );
        };
    }
    
    /**
     * Publish an event
     * @param {string} eventName - Name of the event to publish
     * @param {any} data - Data to pass to event listeners
     */
    publish(eventName, data) {
        if (!this.listeners[eventName]) {
            return;
        }
        
        this.listeners[eventName].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for ${eventName}:`, error);
            }
        });
    }
    
    /**
     * Dispatch a DOM CustomEvent
     * @param {string} eventName - Name of the event to dispatch
     * @param {any} detail - Event detail data
     */
    dispatchDOMEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }
    
    /**
     * Subscribe to a DOM event
     * @param {string} eventName - Name of the DOM event to listen for
     * @param {Function} callback - Function to call when event is triggered
     * @returns {Function} - Unsubscribe function
     */
    subscribeToDOMEvent(eventName, callback) {
        const wrappedCallback = (event) => callback(event.detail);
        document.addEventListener(eventName, wrappedCallback);
        
        // Return unsubscribe function
        return () => {
            document.removeEventListener(eventName, wrappedCallback);
        };
    }
}

// Create singleton instance
const eventSystem = new EventSystem();

// Export the singleton
window.eventSystem = eventSystem;
