/**
 * System Integration Manager
 * 
 * This system integrates all MeAI components and ensures they work together seamlessly.
 */

class SystemIntegrationManager {
    constructor(config = {}) {
        // Initialize dependencies
        this.eventSystem = window.eventSystem;
        this.storageManager = window.storageManager;
        
        // Configuration
        this.config = {
            enableAutoInitialization: true,
            initializationTimeout: 30000, // 30 seconds
            requiredSystems: [
                'eventSystem',
                'storageManager',
                'performanceOptimizationSystem'
            ],
            optionalSystems: [
                'advancedNLUSystem',
                'contextAwarenessSystem',
                'sentimentAnalysisSystem',
                'topicModelingSystem',
                'enhancedUserExperienceSystem',
                'pixelVisualization3D',
                'longTermMemorySystem',
                'spatialAudioSystem',
                'advancedUserProfileSystem',
                'themeSystem',
                'multiLanguageSupport',
                'offlineSupportSystem'
            ],
            ...config
        };
        
        // Integration state
        this.state = {
            initialized: false,
            systemStatus: {},
            initializationOrder: [],
            startTime: null,
            completionTime: null,
            errors: [],
            readyState: 'not_started', // 'not_started', 'initializing', 'ready', 'error'
            initializationPromises: {}
        };
    }
    
    /**
     * Initialize the system integration manager
     */
    async initialize() {
        try {
            console.log('Initializing System Integration Manager...');
            
            // Set start time
            this.state.startTime = performance.now();
            
            // Set ready state
            this.state.readyState = 'initializing';
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initialize required systems
            await this.initializeRequiredSystems();
            
            // Initialize optional systems
            await this.initializeOptionalSystems();
            
            // Check if all required systems are initialized
            const allRequiredInitialized = this.config.requiredSystems.every(
                system => this.state.systemStatus[system]?.initialized
            );
            
            if (!allRequiredInitialized) {
                throw new Error('Not all required systems were initialized');
            }
            
            // Set completion time
            this.state.completionTime = performance.now();
            
            // Calculate initialization duration
            const duration = this.state.completionTime - this.state.startTime;
            
            // Set ready state
            this.state.readyState = 'ready';
            
            // Mark as initialized
            this.state.initialized = true;
            
            console.log(`System Integration Manager initialized successfully in ${duration.toFixed(2)}ms`);
            
            // Publish initialization complete event
            this.eventSystem.publish('system-initialization-complete', {
                duration: duration,
                initializedSystems: Object.keys(this.state.systemStatus).filter(
                    system => this.state.systemStatus[system]?.initialized
                ),
                errors: this.state.errors
            });
            
            return true;
        } catch (error) {
            console.error('Error initializing System Integration Manager:', error);
            
            // Set ready state
            this.state.readyState = 'error';
            
            // Add error to errors list
            this.state.errors.push({
                system: 'SystemIntegrationManager',
                error: error.message,
                timestamp: Date.now()
            });
            
            // Publish initialization error event
            this.eventSystem.publish('system-initialization-error', {
                system: 'SystemIntegrationManager',
                error: error.message,
                errors: this.state.errors
            });
            
            return false;
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for system status requests
        this.eventSystem.subscribe('system-status-request', (data) => {
            this.getSystemStatus().then(status => {
                this.eventSystem.publish('system-status-response', {
                    requestId: data.requestId,
                    status: status
                });
            });
        });
        
        // Listen for system initialization requests
        this.eventSystem.subscribe('system-initialize-request', (data) => {
            this.initializeSystem(data.system).then(result => {
                this.eventSystem.publish('system-initialize-response', {
                    requestId: data.requestId,
                    system: data.system,
                    success: result.success,
                    error: result.error
                });
            });
        });
        
        // Listen for system reset requests
        this.eventSystem.subscribe('system-reset-request', (data) => {
            this.resetSystem(data.system).then(result => {
                this.eventSystem.publish('system-reset-response', {
                    requestId: data.requestId,
                    system: data.system,
                    success: result.success,
                    error: result.error
                });
            });
        });
    }
    
    /**
     * Initialize required systems
     */
    async initializeRequiredSystems() {
        try {
            // Create initialization promises for all required systems
            const initPromises = this.config.requiredSystems.map(system => 
                this.initializeSystem(system)
            );
            
            // Wait for all required systems to initialize with timeout
            const results = await Promise.race([
                Promise.all(initPromises),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Initialization timeout')), 
                    this.config.initializationTimeout)
                )
            ]);
            
            // Check results
            const failedSystems = results
                .filter(result => !result.success)
                .map(result => result.system);
            
            if (failedSystems.length > 0) {
                throw new Error(`Failed to initialize required systems: ${failedSystems.join(', ')}`);
            }
            
            return true;
        } catch (error) {
            console.error('Error initializing required systems:', error);
            
            // Add error to errors list
            this.state.errors.push({
                system: 'RequiredSystems',
                error: error.message,
                timestamp: Date.now()
            });
            
            return false;
        }
    }
    
    /**
     * Initialize optional systems
     */
    async initializeOptionalSystems() {
        try {
            // Create initialization promises for all optional systems
            const initPromises = this.config.optionalSystems.map(system => 
                this.initializeSystem(system)
            );
            
            // Wait for all optional systems to initialize (don't fail if some fail)
            const results = await Promise.allSettled(initPromises);
            
            // Log results
            const successfulSystems = results
                .filter(result => result.status === 'fulfilled' && result.value.success)
                .map(result => result.value.system);
            
            const failedSystems = results
                .filter(result => result.status === 'rejected' || !result.value.success)
                .map(result => result.status === 'rejected' ? 
                    result.reason.system : result.value.system);
            
            console.log(`Successfully initialized optional systems: ${successfulSystems.join(', ')}`);
            
            if (failedSystems.length > 0) {
                console.warn(`Failed to initialize optional systems: ${failedSystems.join(', ')}`);
            }
            
            return true;
        } catch (error) {
            console.error('Error initializing optional systems:', error);
            
            // Add error to errors list
            this.state.errors.push({
                system: 'OptionalSystems',
                error: error.message,
                timestamp: Date.now()
            });
            
            return false;
        }
    }
    
    /**
     * Initialize a specific system
     * @param {string} systemName - The name of the system to initialize
     * @returns {Object} - The result of initialization
     */
    async initializeSystem(systemName) {
        try {
            // Check if system is already being initialized
            if (this.state.initializationPromises[systemName]) {
                return await this.state.initializationPromises[systemName];
            }
            
            // Create initialization promise
            this.state.initializationPromises[systemName] = (async () => {
                try {
                    console.log(`Initializing system: ${systemName}`);
                    
                    // Check if system exists
                    const system = window[systemName];
                    if (!system) {
                        throw new Error(`System not found: ${systemName}`);
                    }
                    
                    // Check if system is already initialized
                    if (this.state.systemStatus[systemName]?.initialized) {
                        return {
                            success: true,
                            system: systemName,
                            message: 'System already initialized'
                        };
                    }
                    
                    // Initialize system
                    let result;
                    if (typeof system.initialize === 'function') {
                        // System has initialize method
                        result = await system.initialize();
                    } else if (typeof system === 'function') {
                        // System is a constructor
                        window[systemName] = new system();
                        if (typeof window[systemName].initialize === 'function') {
                            result = await window[systemName].initialize();
                        } else {
                            result = true;
                        }
                    } else {
                        // System is already initialized
                        result = true;
                    }
                    
                    // Update system status
                    this.state.systemStatus[systemName] = {
                        initialized: result === true,
                        timestamp: Date.now(),
                        error: result !== true ? result : null
                    };
                    
                    // Add to initialization order
                    this.state.initializationOrder.push(systemName);
                    
                    // Publish system initialized event
                    this.eventSystem.publish('system-initialized', {
                        system: systemName,
                        success: result === true
                    });
                    
                    if (result !== true) {
                        throw new Error(`System initialization failed: ${result}`);
                    }
                    
                    return {
                        success: true,
                        system: systemName
                    };
                } catch (error) {
                    console.error(`Error initializing system ${systemName}:`, error);
                    
                    // Update system status
                    this.state.systemStatus[systemName] = {
                        initialized: false,
                        timestamp: Date.now(),
                        error: error.message
                    };
                    
                    // Add error to errors list
                    this.state.errors.push({
                        system: systemName,
                        error: error.message,
                        timestamp: Date.now()
                    });
                    
                    // Publish system initialization error event
                    this.eventSystem.publish('system-initialization-error', {
                        system: systemName,
                        error: error.message
                    });
                    
                    return {
                        success: false,
                        system: systemName,
                        error: error.message
                    };
                }
            })();
            
            // Wait for initialization to complete
            const result = await this.state.initializationPromises[systemName];
            
            // Clean up promise
            delete this.state.initializationPromises[systemName];
            
            return result;
        } catch (error) {
            console.error(`Error in initializeSystem for ${systemName}:`, error);
            
            // Clean up promise
            delete this.state.initializationPromises[systemName];
            
            return {
                success: false,
                system: systemName,
                error: error.message
            };
        }
    }
    
    /**
     * Reset a specific system
     * @param {string} systemName - The name of the system to reset
     * @returns {Object} - The result of reset
     */
    async resetSystem(systemName) {
        try {
            console.log(`Resetting system: ${systemName}`);
            
            // Check if system exists
            const system = window[systemName];
            if (!system) {
                throw new Error(`System not found: ${systemName}`);
            }
            
            // Reset system
            let result;
            if (typeof system.reset === 'function') {
                // System has reset method
                result = await system.reset();
            } else {
                // System doesn't have reset method
                throw new Error(`System does not support reset: ${systemName}`);
            }
            
            // Update system status
            this.state.systemStatus[systemName] = {
                initialized: result === true,
                timestamp: Date.now(),
                error: result !== true ? result : null
            };
            
            // Publish system reset event
            this.eventSystem.publish('system-reset', {
                system: systemName,
                success: result === true
            });
            
            if (result !== true) {
                throw new Error(`System reset failed: ${result}`);
            }
            
            return {
                success: true,
                system: systemName
            };
        } catch (error) {
            console.error(`Error resetting system ${systemName}:`, error);
            
            // Add error to errors list
            this.state.errors.push({
                system: systemName,
                error: error.message,
                timestamp: Date.now()
            });
            
            // Publish system reset error event
            this.eventSystem.publish('system-reset-error', {
                system: systemName,
                error: error.message
            });
            
            return {
                success: false,
                system: systemName,
                error: error.message
            };
        }
    }
    
    /**
     * Get system status
     * @returns {Object} - Current system status
     */
    async getSystemStatus() {
        try {
            const allSystems = [...this.config.requiredSystems, ...this.config.optionalSystems];
            
            // Get status for all systems
            const systemStatus = {};
            for (const system of allSystems) {
                systemStatus[system] = this.state.systemStatus[system] || {
                    initialized: false,
                    timestamp: null,
                    error: null
                };
            }
            
            return {
                readyState: this.state.readyState,
                initialized: this.state.initialized,
                startTime: this.state.startTime,
                completionTime: this.state.completionTime,
                duration: this.state.completionTime ? 
                    this.state.completionTime - this.state.startTime : null,
                initializationOrder: this.state.initializationOrder,
                errors: this.state.errors,
                systems: systemStatus
            };
        } catch (error) {
            console.error('Error getting system status:', error);
            return {
                error: error.message,
                readyState: this.state.readyState,
                initialized: this.state.initialized,
                errors: this.state.errors
            };
        }
    }
    
    /**
     * Get the current state of the system integration manager
     * @returns {Object} - The current state
     */
    getState() {
        return {
            initialized: this.state.initialized,
            readyState: this.state.readyState,
            systemsInitialized: Object.keys(this.state.systemStatus).filter(
                system => this.state.systemStatus[system]?.initialized
            ).length,
            totalSystems: this.config.requiredSystems.length + this.config.optionalSystems.length,
            errorsCount: this.state.errors.length
        };
    }
}

// Export the class
window.SystemIntegrationManager = SystemIntegrationManager;
