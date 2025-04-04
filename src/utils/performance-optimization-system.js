/**
 * Performance Optimization System
 * 
 * This system improves MeAI's performance with resource management,
 * adaptive loading, and device-specific optimizations.
 */

class PerformanceOptimizationSystem {
    constructor(config = {}) {
        // Initialize dependencies
        this.eventSystem = window.eventSystem;
        this.storageManager = window.storageManager;
        
        // Configuration
        this.config = {
            enableResourceMonitoring: true,
            enableAdaptiveLoading: true,
            enableProgressiveLoading: true,
            monitoringInterval: 5000, // 5 seconds
            memoryThreshold: 0.8, // 80% of available memory
            cpuThreshold: 0.7, // 70% CPU utilization
            lowEndDeviceThreshold: {
                memory: 4, // GB
                cpu: {
                    cores: 4,
                    speed: 2.0 // GHz
                }
            },
            ...config
        };
        
        // Performance state
        this.state = {
            initialized: false,
            deviceCapabilities: {
                memory: null,
                cpu: {
                    cores: null,
                    speed: null
                },
                gpu: null,
                connection: null,
                isLowEndDevice: null,
                isMobileDevice: null
            },
            resourceUsage: {
                memory: null,
                cpu: null,
                fps: null,
                loadTime: null,
                renderTime: null,
                lastUpdated: null
            },
            optimizationLevel: 'auto', // 'low', 'medium', 'high', 'ultra', 'auto'
            activeOptimizations: [],
            loadingStages: [],
            currentLoadingStage: null,
            monitoringIntervalId: null
        };
    }
    
    /**
     * Initialize the performance optimization system
     */
    async initialize() {
        try {
            console.log('Initializing Performance Optimization System...');
            
            // Detect device capabilities
            await this.detectDeviceCapabilities();
            
            // Load previous state if available
            await this.loadState();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Start resource monitoring if enabled
            if (this.config.enableResourceMonitoring) {
                this.startResourceMonitoring();
            }
            
            // Set initial optimization level based on device capabilities
            this.setInitialOptimizationLevel();
            
            // Set up progressive loading stages if enabled
            if (this.config.enableProgressiveLoading) {
                this.setupProgressiveLoading();
            }
            
            // Mark as initialized
            this.state.initialized = true;
            
            console.log('Performance Optimization System initialized successfully');
            
            return true;
        } catch (error) {
            console.error('Error initializing Performance Optimization System:', error);
            return false;
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for optimization level change requests
        this.eventSystem.subscribe('optimization-level-request', (data) => {
            this.setOptimizationLevel(data.level).then(result => {
                this.eventSystem.publish('optimization-level-response', {
                    requestId: data.requestId,
                    success: result.success,
                    level: result.level
                });
            });
        });
        
        // Listen for performance status requests
        this.eventSystem.subscribe('performance-status-request', (data) => {
            this.getPerformanceStatus().then(status => {
                this.eventSystem.publish('performance-status-response', {
                    requestId: data.requestId,
                    status: status
                });
            });
        });
        
        // Listen for loading stage updates
        this.eventSystem.subscribe('loading-stage-update', (data) => {
            this.updateLoadingStage(data.stage);
        });
        
        // Listen for resource usage updates from other components
        this.eventSystem.subscribe('resource-usage-update', (data) => {
            this.updateResourceUsage(data);
        });
    }
    
    /**
     * Load previous state from storage
     */
    async loadState() {
        try {
            const savedState = await this.storageManager.getIndexedDB('performance', 'current-state');
            if (savedState) {
                // Merge saved state with default state
                this.state = {
                    ...this.state,
                    optimizationLevel: savedState.optimizationLevel || this.state.optimizationLevel,
                    activeOptimizations: savedState.activeOptimizations || this.state.activeOptimizations,
                    initialized: false // Will be set to true after full initialization
                };
            }
            
            return true;
        } catch (error) {
            console.error('Error loading performance state:', error);
            return false;
        }
    }
    
    /**
     * Save current state to storage
     */
    async saveState() {
        try {
            await this.storageManager.setIndexedDB('performance', {
                id: 'current-state',
                optimizationLevel: this.state.optimizationLevel,
                activeOptimizations: this.state.activeOptimizations,
                deviceCapabilities: this.state.deviceCapabilities
            });
            
            return true;
        } catch (error) {
            console.error('Error saving performance state:', error);
            return false;
        }
    }
    
    /**
     * Detect device capabilities
     */
    async detectDeviceCapabilities() {
        try {
            // Detect memory
            if (navigator.deviceMemory) {
                this.state.deviceCapabilities.memory = navigator.deviceMemory;
            }
            
            // Detect CPU
            if (navigator.hardwareConcurrency) {
                this.state.deviceCapabilities.cpu.cores = navigator.hardwareConcurrency;
            }
            
            // Estimate CPU speed using a benchmark
            this.state.deviceCapabilities.cpu.speed = await this.estimateCpuSpeed();
            
            // Detect GPU capabilities
            this.state.deviceCapabilities.gpu = await this.detectGpuCapabilities();
            
            // Detect connection type
            if (navigator.connection) {
                this.state.deviceCapabilities.connection = {
                    type: navigator.connection.effectiveType,
                    downlink: navigator.connection.downlink,
                    rtt: navigator.connection.rtt,
                    saveData: navigator.connection.saveData
                };
            }
            
            // Detect if mobile device
            this.state.deviceCapabilities.isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            // Determine if low-end device
            this.state.deviceCapabilities.isLowEndDevice = this.isLowEndDevice();
            
            console.log('Device capabilities detected:', this.state.deviceCapabilities);
            
            return true;
        } catch (error) {
            console.error('Error detecting device capabilities:', error);
            return false;
        }
    }
    
    /**
     * Estimate CPU speed using a benchmark
     * @returns {number} - Estimated CPU speed in GHz
     */
    async estimateCpuSpeed() {
        try {
            const startTime = performance.now();
            let result = 0;
            
            // Simple benchmark: perform a large number of calculations
            const iterations = 10000000;
            for (let i = 0; i < iterations; i++) {
                result += Math.sqrt(i) * Math.cos(i) / (1 + Math.sin(i));
            }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // Normalize to get an approximate GHz value
            // This is a very rough estimate and not accurate
            const estimatedSpeed = iterations / duration / 10000;
            
            return Math.min(Math.max(estimatedSpeed, 0.5), 5.0); // Clamp between 0.5 and 5.0 GHz
        } catch (error) {
            console.error('Error estimating CPU speed:', error);
            return 2.0; // Default to 2.0 GHz
        }
    }
    
    /**
     * Detect GPU capabilities
     * @returns {Object} - GPU capabilities
     */
    async detectGpuCapabilities() {
        try {
            // Create a canvas and get WebGL context
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!gl) {
                return {
                    supported: false,
                    webglVersion: 0,
                    renderer: 'Unknown',
                    vendor: 'Unknown',
                    extensions: []
                };
            }
            
            // Get WebGL version
            let webglVersion = 1;
            if (canvas.getContext('webgl2')) {
                webglVersion = 2;
            }
            
            // Get renderer and vendor
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            let renderer = 'Unknown';
            let vendor = 'Unknown';
            
            if (debugInfo) {
                renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            }
            
            // Get supported extensions
            const extensions = gl.getSupportedExtensions();
            
            return {
                supported: true,
                webglVersion: webglVersion,
                renderer: renderer,
                vendor: vendor,
                extensions: extensions || []
            };
        } catch (error) {
            console.error('Error detecting GPU capabilities:', error);
            return {
                supported: false,
                webglVersion: 0,
                renderer: 'Unknown',
                vendor: 'Unknown',
                extensions: []
            };
        }
    }
    
    /**
     * Determine if device is low-end
     * @returns {boolean} - Whether the device is low-end
     */
    isLowEndDevice() {
        const { memory, cpu, connection } = this.state.deviceCapabilities;
        
        // Check memory
        if (memory && memory < this.config.lowEndDeviceThreshold.memory) {
            return true;
        }
        
        // Check CPU
        if (cpu.cores && cpu.cores < this.config.lowEndDeviceThreshold.cpu.cores) {
            return true;
        }
        
        if (cpu.speed && cpu.speed < this.config.lowEndDeviceThreshold.cpu.speed) {
            return true;
        }
        
        // Check connection
        if (connection && (connection.type === '2g' || connection.type === 'slow-2g')) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Set initial optimization level based on device capabilities
     */
    setInitialOptimizationLevel() {
        // If optimization level is already set (from saved state), keep it
        if (this.state.optimizationLevel !== 'auto') {
            return;
        }
        
        const { isLowEndDevice, isMobileDevice } = this.state.deviceCapabilities;
        
        if (isLowEndDevice) {
            this.state.optimizationLevel = 'low';
        } else if (isMobileDevice) {
            this.state.optimizationLevel = 'medium';
        } else {
            this.state.optimizationLevel = 'high';
        }
        
        // Apply optimizations for the selected level
        this.applyOptimizations(this.state.optimizationLevel);
    }
    
    /**
     * Set optimization level
     * @param {string} level - The optimization level to set
     * @returns {Object} - The result of setting the level
     */
    async setOptimizationLevel(level) {
        try {
            // Validate level
            const validLevels = ['low', 'medium', 'high', 'ultra', 'auto'];
            if (!validLevels.includes(level)) {
                return {
                    success: false,
                    error: 'Invalid optimization level',
                    level: this.state.optimizationLevel
                };
            }
            
            // If auto, determine level based on device capabilities
            if (level === 'auto') {
                const { isLowEndDevice, isMobileDevice } = this.state.deviceCapabilities;
                
                if (isLowEndDevice) {
                    level = 'low';
                } else if (isMobileDevice) {
                    level = 'medium';
                } else {
                    level = 'high';
                }
            }
            
            // Set level
            this.state.optimizationLevel = level;
            
            // Apply optimizations for the selected level
            this.applyOptimizations(level);
            
            // Save state
            await this.saveState();
            
            // Publish optimization level changed event
            this.eventSystem.publish('optimization-level-changed', {
                level: level,
                activeOptimizations: this.state.activeOptimizations
            });
            
            return {
                success: true,
                level: level,
                activeOptimizations: this.state.activeOptimizations
            };
        } catch (error) {
            console.error('Error setting optimization level:', error);
            return {
                success: false,
                error: error.message,
                level: this.state.optimizationLevel
            };
        }
    }
    
    /**
     * Apply optimizations for the selected level
     * @param {string} level - The optimization level
     */
    applyOptimizations(level) {
        // Reset active optimizations
        this.state.activeOptimizations = [];
        
        // Apply optimizations based on level
        switch (level) {
            case 'low':
                // Minimal visual effects
                this.state.activeOptimizations.push('disable_animations');
                this.state.activeOptimizations.push('reduce_particle_count');
                this.state.activeOptimizations.push('disable_shadows');
                this.state.activeOptimizations.push('reduce_texture_quality');
                this.state.activeOptimizations.push('disable_post_processing');
                this.state.activeOptimizations.push('reduce_audio_quality');
                this.state.activeOptimizations.push('limit_memory_usage');
                break;
                
            case 'medium':
                // Balanced optimizations
                this.state.activeOptimizations.push('reduce_animation_complexity');
                this.state.activeOptimizations.push('reduce_particle_count');
                this.state.activeOptimizations.push('simplify_shadows');
                this.state.activeOptimizations.push('medium_texture_quality');
                this.state.activeOptimizations.push('basic_post_processing');
                this.state.activeOptimizations.push('standard_audio_quality');
                this.state.activeOptimizations.push('optimize_memory_usage');
                break;
                
            case 'high':
                // Full visual quality with some optimizations
                this.state.activeOptimizations.push('standard_animation_quality');
                this.state.activeOptimizations.push('standard_particle_count');
                this.state.activeOptimizations.push('high_quality_shadows');
                this.state.activeOptimizations.push('high_texture_quality');
                this.state.activeOptimizations.push('standard_post_processing');
                this.state.activeOptimizations.push('high_audio_quality');
                this.state.activeOptimizations.push('optimize_memory_usage');
                break;
                
            case 'ultra':
                // Maximum visual quality
                this.state.activeOptimizations.push('complex_animations');
                this.state.activeOptimizations.push('maximum_particle_count');
                this.state.activeOptimizations.push('ultra_quality_shadows');
                this.state.activeOptimizations.push('ultra_texture_quality');
                this.state.activeOptimizations.push('advanced_post_processing');
                this.state.activeOptimizations.push('ultra_audio_quality');
                break;
        }
        
        // Apply device-specific optimizations
        if (this.state.deviceCapabilities.isMobileDevice) {
            this.state.activeOptimizations.push('mobile_optimizations');
        }
        
        // Apply connection-specific optimizations
        if (this.state.deviceCapabilities.connection) {
            if (this.state.deviceCapabilities.connection.type === '2g' || 
                this.state.deviceCapabilities.connection.type === 'slow-2g') {
                this.state.activeOptimizations.push('low_bandwidth_mode');
            } else if (this.state.deviceCapabilities.connection.saveData) {
                this.state.activeOptimizations.push('data_saver_mode');
            }
        }
        
        // Publish active optimizations
        this.eventSystem.publish('optimizations-applied', {
            level: level,
            optimizations: this.state.activeOptimizations
        });
    }
    
    /**
     * Start resource monitoring
     */
    startResourceMonitoring() {
        // Clear existing interval if any
        if (this.state.monitoringIntervalId) {
            clearInterval(this.state.monitoringIntervalId);
        }
        
        // Set up monitoring interval
        this.state.monitoringIntervalId = setInterval(() => {
            this.monitorResources();
        }, this.config.monitoringInterval);
        
        // Initial monitoring
        this.monitorResources();
    }
    
    /**
     * Stop resource monitoring
     */
    stopResourceMonitoring() {
        if (this.state.monitoringIntervalId) {
            clearInterval(this.state.monitoringIntervalId);
            this.state.monitoringIntervalId = null;
        }
    }
    
    /**
     * Monitor system resources
     */
    async monitorResources() {
        try {
            // Update FPS
            this.updateFPS();
            
            // Measure memory usage if available
            if (performance.memory) {
                const memoryUsage = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
                this.state.resourceUsage.memory = memoryUsage;
                
                // Check if memory usage exceeds threshold
                if (memoryUsage > this.config.memoryThreshold) {
                    this.handleHighMemoryUsage(memoryUsage);
                }
            }
            
            // Update timestamp
            this.state.resourceUsage.lastUpdated = Date.now();
            
            // Publish resource usage update
            this.eventSystem.publish('resource-usage-internal', {
                usage: this.state.resourceUsage
            });
            
        } catch (error) {
            console.error('Error monitoring resources:', error);
        }
    }
    
    /**
     * Update FPS measurement
     */
    updateFPS() {
        if (!this.fpsData) {
            this.fpsData = {
                frameCount: 0,
                lastTime: performance.now(),
                fps: 0
            };
            
            // Set up requestAnimationFrame loop for FPS counting
            const countFrame = () => {
                this.fpsData.frameCount++;
                requestAnimationFrame(countFrame);
            };
            
            requestAnimationFrame(countFrame);
        }
        
        const now = performance.now();
        const elapsed = now - this.fpsData.lastTime;
        
        if (elapsed >= 1000) { // Update every second
            this.fpsData.fps = Math.round((this.fpsData.frameCount * 1000) / elapsed);
            this.fpsData.frameCount = 0;
            this.fpsData.lastTime = now;
            
            // Update state
            this.state.resourceUsage.fps = this.fpsData.fps;
            
            // Check if FPS is too low
            if (this.fpsData.fps < 30 && this.state.optimizationLevel !== 'low') {
                this.handleLowFPS(this.fpsData.fps);
            }
        }
    }
    
    /**
     * Handle high memory usage
     * @param {number} memoryUsage - Current memory usage ratio
     */
    async handleHighMemoryUsage(memoryUsage) {
        console.warn(`High memory usage detected: ${Math.round(memoryUsage * 100)}%`);
        
        // If already at low optimization level, try to free memory
        if (this.state.optimizationLevel === 'low') {
            this.freeMemory();
            return;
        }
        
        // Otherwise, lower optimization level
        let newLevel;
        switch (this.state.optimizationLevel) {
            case 'ultra':
                newLevel = 'high';
                break;
            case 'high':
                newLevel = 'medium';
                break;
            case 'medium':
                newLevel = 'low';
                break;
            default:
                newLevel = 'low';
        }
        
        await this.setOptimizationLevel(newLevel);
        console.log(`Lowered optimization level to ${newLevel} due to high memory usage`);
    }
    
    /**
     * Handle low FPS
     * @param {number} fps - Current FPS
     */
    async handleLowFPS(fps) {
        console.warn(`Low FPS detected: ${fps}`);
        
        // If already at low optimization level, nothing more to do
        if (this.state.optimizationLevel === 'low') {
            return;
        }
        
        // Otherwise, lower optimization level
        let newLevel;
        switch (this.state.optimizationLevel) {
            case 'ultra':
                newLevel = 'high';
                break;
            case 'high':
                newLevel = 'medium';
                break;
            case 'medium':
                newLevel = 'low';
                break;
            default:
                newLevel = 'low';
        }
        
        await this.setOptimizationLevel(newLevel);
        console.log(`Lowered optimization level to ${newLevel} due to low FPS`);
    }
    
    /**
     * Free memory by cleaning up resources
     */
    freeMemory() {
        // Publish memory cleanup request
        this.eventSystem.publish('memory-cleanup-request', {
            severity: 'high',
            currentUsage: this.state.resourceUsage.memory
        });
        
        // Force garbage collection if available (only works in some environments)
        if (window.gc) {
            window.gc();
        }
    }
    
    /**
     * Update resource usage from external sources
     * @param {Object} data - Resource usage data
     */
    updateResourceUsage(data) {
        // Update CPU usage if provided
        if (data.cpu !== undefined) {
            this.state.resourceUsage.cpu = data.cpu;
            
            // Check if CPU usage exceeds threshold
            if (data.cpu > this.config.cpuThreshold) {
                this.handleHighCpuUsage(data.cpu);
            }
        }
        
        // Update render time if provided
        if (data.renderTime !== undefined) {
            this.state.resourceUsage.renderTime = data.renderTime;
        }
        
        // Update load time if provided
        if (data.loadTime !== undefined) {
            this.state.resourceUsage.loadTime = data.loadTime;
        }
    }
    
    /**
     * Handle high CPU usage
     * @param {number} cpuUsage - Current CPU usage ratio
     */
    async handleHighCpuUsage(cpuUsage) {
        console.warn(`High CPU usage detected: ${Math.round(cpuUsage * 100)}%`);
        
        // If already at low optimization level, nothing more to do
        if (this.state.optimizationLevel === 'low') {
            return;
        }
        
        // Otherwise, lower optimization level
        let newLevel;
        switch (this.state.optimizationLevel) {
            case 'ultra':
                newLevel = 'high';
                break;
            case 'high':
                newLevel = 'medium';
                break;
            case 'medium':
                newLevel = 'low';
                break;
            default:
                newLevel = 'low';
        }
        
        await this.setOptimizationLevel(newLevel);
        console.log(`Lowered optimization level to ${newLevel} due to high CPU usage`);
    }
    
    /**
     * Set up progressive loading stages
     */
    setupProgressiveLoading() {
        if (!this.config.enableProgressiveLoading) {
            return;
        }
        
        // Define loading stages
        this.state.loadingStages = [
            {
                id: 'core',
                name: 'Core System',
                priority: 1,
                components: ['eventSystem', 'storageManager', 'uiCore'],
                completed: false
            },
            {
                id: 'ui',
                name: 'User Interface',
                priority: 2,
                components: ['visualFeedback', 'inputHandler', 'accessibilitySystem'],
                completed: false
            },
            {
                id: 'conversation',
                name: 'Conversation System',
                priority: 3,
                components: ['naturalConversation', 'contextualMemory', 'voiceSystem'],
                completed: false
            },
            {
                id: 'visual',
                name: 'Visual System',
                priority: 4,
                components: ['pixelVisualization', 'animationSystem', 'themeSystem'],
                completed: false
            },
            {
                id: 'audio',
                name: 'Audio System',
                priority: 5,
                components: ['ambientAudio', 'spatialAudio', 'interactionSounds'],
                completed: false
            },
            {
                id: 'advanced',
                name: 'Advanced Features',
                priority: 6,
                components: ['advancedNLU', 'sentimentAnalysis', 'topicModeling'],
                completed: false
            }
        ];
        
        // Set current loading stage to first stage
        this.state.currentLoadingStage = this.state.loadingStages[0].id;
        
        // Publish loading stages
        this.eventSystem.publish('loading-stages-initialized', {
            stages: this.state.loadingStages,
            currentStage: this.state.currentLoadingStage
        });
    }
    
    /**
     * Update loading stage
     * @param {string} stageId - The ID of the stage to update
     */
    updateLoadingStage(stageId) {
        try {
            // Find stage
            const stageIndex = this.state.loadingStages.findIndex(stage => stage.id === stageId);
            
            if (stageIndex === -1) {
                console.error(`Loading stage not found: ${stageId}`);
                return;
            }
            
            // Mark stage as completed
            this.state.loadingStages[stageIndex].completed = true;
            
            // Update current stage to next incomplete stage
            const nextIncompleteStage = this.state.loadingStages.find(stage => !stage.completed);
            
            if (nextIncompleteStage) {
                this.state.currentLoadingStage = nextIncompleteStage.id;
            } else {
                // All stages completed
                this.state.currentLoadingStage = null;
            }
            
            // Calculate loading progress
            const completedStages = this.state.loadingStages.filter(stage => stage.completed).length;
            const totalStages = this.state.loadingStages.length;
            const progress = completedStages / totalStages;
            
            // Publish loading progress
            this.eventSystem.publish('loading-progress', {
                stage: stageId,
                currentStage: this.state.currentLoadingStage,
                completedStages: completedStages,
                totalStages: totalStages,
                progress: progress
            });
            
        } catch (error) {
            console.error('Error updating loading stage:', error);
        }
    }
    
    /**
     * Get performance status
     * @returns {Object} - Current performance status
     */
    async getPerformanceStatus() {
        try {
            return {
                deviceCapabilities: this.state.deviceCapabilities,
                resourceUsage: this.state.resourceUsage,
                optimizationLevel: this.state.optimizationLevel,
                activeOptimizations: this.state.activeOptimizations,
                loadingProgress: this.getLoadingProgress()
            };
        } catch (error) {
            console.error('Error getting performance status:', error);
            return {
                error: error.message
            };
        }
    }
    
    /**
     * Get loading progress
     * @returns {Object} - Current loading progress
     */
    getLoadingProgress() {
        if (!this.config.enableProgressiveLoading) {
            return {
                enabled: false
            };
        }
        
        const completedStages = this.state.loadingStages.filter(stage => stage.completed).length;
        const totalStages = this.state.loadingStages.length;
        
        return {
            enabled: true,
            currentStage: this.state.currentLoadingStage,
            completedStages: completedStages,
            totalStages: totalStages,
            progress: completedStages / totalStages,
            stages: this.state.loadingStages
        };
    }
    
    /**
     * Get the current state of the performance optimization system
     * @returns {Object} - The current state
     */
    getState() {
        return {
            initialized: this.state.initialized,
            deviceCapabilities: {
                isLowEndDevice: this.state.deviceCapabilities.isLowEndDevice,
                isMobileDevice: this.state.deviceCapabilities.isMobileDevice,
                memory: this.state.deviceCapabilities.memory,
                cpuCores: this.state.deviceCapabilities.cpu.cores
            },
            resourceUsage: {
                memory: this.state.resourceUsage.memory,
                cpu: this.state.resourceUsage.cpu,
                fps: this.state.resourceUsage.fps,
                lastUpdated: this.state.resourceUsage.lastUpdated
            },
            optimizationLevel: this.state.optimizationLevel,
            activeOptimizationsCount: this.state.activeOptimizations.length,
            monitoringActive: !!this.state.monitoringIntervalId
        };
    }
}

// Export the class
window.PerformanceOptimizationSystem = PerformanceOptimizationSystem;
