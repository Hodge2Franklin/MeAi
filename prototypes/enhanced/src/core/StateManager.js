/**
 * StateManager.js
 * Core state management system for MeAi enhanced implementation
 * Handles application state, transitions, and persistence
 */

class StateManager {
  /**
   * Initialize the StateManager
   * @param {Object} initialState - Initial state values
   * @param {Object} options - Configuration options
   */
  constructor(initialState = {}, options = {}) {
    // Default options
    this.options = {
      persistState: true,
      storageKey: 'meai_state',
      historySize: 10,
      ...options
    };
    
    // Default state
    this.defaultState = {
      currentState: 'initializing', // Current application state
      previousState: null,          // Previous application state
      
      // Pixel properties
      pixelProperties: {
        size: 2,
        opacity: 0.8,
        color: '#F5E8C7',
        breathRate: 4
      },
      
      // User interaction
      userPresence: {
        isPresent: false,
        lastInteraction: null,
        attentionQuality: 0.5,
        interactionDuration: 0
      },
      
      // Feedback settings
      hapticEnabled: true,
      hapticIntensity: 70,
      audioEnabled: true,
      audioVolume: 50,
      
      // Time context
      timeContext: {
        timeOfDay: 'unknown',
        isFirstMorningUse: false,
        isNightWindDown: false,
        lastInteractionDate: null
      },
      
      // Memory system
      memories: [],
      activeMemory: null,
      
      // Use case tracking
      activeUseCase: null,
      completedUseCases: {},
      
      // System status
      systemStatus: {
        initialized: false,
        featureSupport: {},
        performanceMetrics: {}
      }
    };
    
    // Initialize state with defaults and provided initial values
    this.state = this.mergeDeep({}, this.defaultState, initialState);
    
    // State history for undo/tracking
    this.stateHistory = [];
    
    // Event listeners
    this.listeners = {
      stateChange: [],
      transition: []
    };
    
    // Load persisted state if available
    if (this.options.persistState) {
      this.loadState();
    }
    
    // Bind methods
    this.updateState = this.updateState.bind(this);
    this.transition = this.transition.bind(this);
    this.saveState = this.saveState.bind(this);
    
    // Set initialized flag
    this.state.systemStatus.initialized = true;
  }
  
  /**
   * Deep merge objects
   * @private
   * @param {Object} target - Target object
   * @param {...Object} sources - Source objects
   * @returns {Object} Merged object
   */
  mergeDeep(target, ...sources) {
    if (!sources.length) return target;
    
    const source = sources.shift();
    
    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.mergeDeep(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }
    
    return this.mergeDeep(target, ...sources);
  }
  
  /**
   * Check if value is an object
   * @private
   * @param {*} item - Value to check
   * @returns {boolean} Whether value is an object
   */
  isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
  }
  
  /**
   * Update state with new values
   * @param {Object} newState - New state values
   * @param {boolean} silent - Whether to suppress events
   * @returns {Object} Updated state
   */
  updateState(newState, silent = false) {
    // Add current state to history before updating
    this.addToHistory();
    
    // Deep merge new state
    this.state = this.mergeDeep({}, this.state, newState);
    
    // Persist state if enabled
    if (this.options.persistState && !silent) {
      this.saveState();
    }
    
    // Emit state change event
    if (!silent) {
      this.emit('stateChange', this.state);
    }
    
    return this.state;
  }
  
  /**
   * Transition to a new application state
   * @param {string} newState - New application state
   * @param {Object} stateData - Additional state data
   * @returns {Object} Updated state
   */
  transition(newState, stateData = {}) {
    // Skip if already in this state
    if (this.state.currentState === newState) {
      return this.state;
    }
    
    // Prepare transition data
    const transitionData = {
      from: this.state.currentState,
      to: newState,
      timestamp: Date.now()
    };
    
    // Update state
    this.updateState({
      currentState: newState,
      previousState: this.state.currentState,
      ...stateData
    }, true); // Silent update
    
    // Emit transition event
    this.emit('transition', transitionData);
    
    // Emit state change event
    this.emit('stateChange', this.state);
    
    // Persist state
    if (this.options.persistState) {
      this.saveState();
    }
    
    return this.state;
  }
  
  /**
   * Add current state to history
   * @private
   */
  addToHistory() {
    // Add current state to history
    this.stateHistory.push(JSON.parse(JSON.stringify(this.state)));
    
    // Limit history size
    if (this.stateHistory.length > this.options.historySize) {
      this.stateHistory.shift();
    }
  }
  
  /**
   * Undo last state change
   * @returns {Object} Previous state
   */
  undo() {
    if (this.stateHistory.length === 0) {
      return this.state;
    }
    
    // Get previous state
    const previousState = this.stateHistory.pop();
    
    // Set as current state
    this.state = previousState;
    
    // Emit state change event
    this.emit('stateChange', this.state);
    
    // Persist state
    if (this.options.persistState) {
      this.saveState();
    }
    
    return this.state;
  }
  
  /**
   * Reset state to default values
   * @param {boolean} preserveMemories - Whether to preserve memories
   * @returns {Object} Reset state
   */
  resetState(preserveMemories = true) {
    // Preserve memories if requested
    const memories = preserveMemories ? this.state.memories : [];
    
    // Reset to default state
    this.state = JSON.parse(JSON.stringify(this.defaultState));
    
    // Restore memories if preserved
    if (preserveMemories) {
      this.state.memories = memories;
    }
    
    // Emit state change event
    this.emit('stateChange', this.state);
    
    // Persist state
    if (this.options.persistState) {
      this.saveState();
    }
    
    return this.state;
  }
  
  /**
   * Save state to localStorage
   * @returns {boolean} Whether save was successful
   */
  saveState() {
    try {
      // Check if localStorage is available
      if (typeof localStorage === 'undefined') {
        return false;
      }
      
      // Serialize and save state
      localStorage.setItem(
        this.options.storageKey, 
        JSON.stringify(this.state)
      );
      
      return true;
    } catch (error) {
      console.error('Error saving state:', error);
      return false;
    }
  }
  
  /**
   * Load state from localStorage
   * @returns {boolean} Whether load was successful
   */
  loadState() {
    try {
      // Check if localStorage is available
      if (typeof localStorage === 'undefined') {
        return false;
      }
      
      // Get saved state
      const savedState = localStorage.getItem(this.options.storageKey);
      
      if (!savedState) {
        return false;
      }
      
      // Parse and merge with current state
      const parsedState = JSON.parse(savedState);
      this.state = this.mergeDeep({}, this.state, parsedState);
      
      return true;
    } catch (error) {
      console.error('Error loading state:', error);
      return false;
    }
  }
  
  /**
   * Clear persisted state
   * @returns {boolean} Whether clear was successful
   */
  clearPersistedState() {
    try {
      // Check if localStorage is available
      if (typeof localStorage === 'undefined') {
        return false;
      }
      
      // Remove saved state
      localStorage.removeItem(this.options.storageKey);
      
      return true;
    } catch (error) {
      console.error('Error clearing state:', error);
      return false;
    }
  }
  
  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    
    this.listeners[event].push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners[event] = this.listeners[event].filter(
        cb => cb !== callback
      );
    };
  }
  
  /**
   * Emit event
   * @private
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (!this.listeners[event]) {
      return;
    }
    
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    });
  }
  
  /**
   * Get current state
   * @returns {Object} Current state
   */
  getState() {
    return { ...this.state };
  }
  
  /**
   * Get state history
   * @returns {Array} State history
   */
  getHistory() {
    return [...this.stateHistory];
  }
  
  /**
   * Add memory
   * @param {Object} memory - Memory object
   * @returns {string} Memory ID
   */
  addMemory(memory) {
    // Generate ID if not provided
    const id = memory.id || `memory_${Date.now()}`;
    
    // Create memory object
    const memoryObject = {
      id,
      timestamp: Date.now(),
      ...memory
    };
    
    // Add to memories
    this.updateState({
      memories: [...this.state.memories, memoryObject]
    });
    
    return id;
  }
  
  /**
   * Get memory by ID
   * @param {string} id - Memory ID
   * @returns {Object|null} Memory object
   */
  getMemory(id) {
    return this.state.memories.find(memory => memory.id === id) || null;
  }
  
  /**
   * Set active memory
   * @param {string} id - Memory ID
   * @returns {Object|null} Memory object
   */
  setActiveMemory(id) {
    const memory = this.getMemory(id);
    
    if (memory) {
      this.updateState({
        activeMemory: id
      });
    }
    
    return memory;
  }
  
  /**
   * Get active memory
   * @returns {Object|null} Active memory object
   */
  getActiveMemory() {
    if (!this.state.activeMemory) {
      return null;
    }
    
    return this.getMemory(this.state.activeMemory);
  }
  
  /**
   * Update time context
   * @param {Object} timeContext - Time context data
   * @returns {Object} Updated time context
   */
  updateTimeContext(timeContext) {
    return this.updateState({
      timeContext: {
        ...this.state.timeContext,
        ...timeContext
      }
    }).timeContext;
  }
  
  /**
   * Update user presence
   * @param {Object} presence - User presence data
   * @returns {Object} Updated user presence
   */
  updateUserPresence(presence) {
    return this.updateState({
      userPresence: {
        ...this.state.userPresence,
        ...presence,
        lastInteraction: Date.now()
      }
    }).userPresence;
  }
  
  /**
   * Set active use case
   * @param {string} useCase - Use case name
   * @returns {Object} Updated state
   */
  setActiveUseCase(useCase) {
    return this.updateState({
      activeUseCase: useCase
    });
  }
  
  /**
   * Complete use case
   * @param {string} useCase - Use case name
   * @returns {Object} Updated state
   */
  completeUseCase(useCase) {
    const completedUseCases = {
      ...this.state.completedUseCases,
      [useCase]: {
        completedAt: Date.now(),
        count: (this.state.completedUseCases[useCase]?.count || 0) + 1
      }
    };
    
    return this.updateState({
      activeUseCase: null,
      completedUseCases
    });
  }
  
  /**
   * Update system status
   * @param {Object} status - System status data
   * @returns {Object} Updated system status
   */
  updateSystemStatus(status) {
    return this.updateState({
      systemStatus: {
        ...this.state.systemStatus,
        ...status
      }
    }).systemStatus;
  }
  
  /**
   * Update feature support
   * @param {Object} features - Feature support data
   * @returns {Object} Updated feature support
   */
  updateFeatureSupport(features) {
    return this.updateState({
      systemStatus: {
        ...this.state.systemStatus,
        featureSupport: {
          ...this.state.systemStatus.featureSupport,
          ...features
        }
      }
    }).systemStatus.featureSupport;
  }
  
  /**
   * Update performance metrics
   * @param {Object} metrics - Performance metrics data
   * @returns {Object} Updated performance metrics
   */
  updatePerformanceMetrics(metrics) {
    return this.updateState({
      systemStatus: {
        ...this.state.systemStatus,
        performanceMetrics: {
          ...this.state.systemStatus.performanceMetrics,
          ...metrics,
          lastUpdated: Date.now()
        }
      }
    }).systemStatus.performanceMetrics;
  }
}

// Export for use in other modules
export default StateManager;
