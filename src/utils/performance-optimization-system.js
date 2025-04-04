/**
 * Performance Optimization System
 * 
 * This system optimizes the performance of the MeAI application,
 * ensuring smooth operation across different devices and scenarios.
 */

class PerformanceOptimizationSystem {
    constructor() {
        // Initialize state
        this.state = {
            initialized: false,
            deviceCapabilities: {
                memory: 'unknown',
                cpu: 'unknown',
                gpu: 'unknown',
                connection: 'unknown'
            },
            performanceMetrics: {
                fps: 0,
                responseTime: 0,
                memoryUsage: 0,
                loadTime: 0
            },
            optimizationLevel: 'auto', // 'low', 'medium', 'high', 'auto'
            lastPerformanceCheck: 0,
            performanceCheckInterval: 10000, // 10 seconds
            isMonitoring: false
        };
        
        // Initialize the system
        this.initialize();
    }
    
    /**
     * Initialize the performance optimization system
     */
    initialize() {
        try {
            console.log('Initializing Performance Optimization System...');
            
            // Create event system if not exists
            window.eventSystem = window.eventSystem || this.createEventSystem();
            
            // Detect device capabilities
            this.detectDeviceCapabilities();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Start performance monitoring
            this.startPerformanceMonitoring();
            
            // Apply initial optimizations
            this.applyOptimizations();
            
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
     * Create event system if not exists
     */
    createEventSystem() {
        console.warn('Global EventSystem not found, creating local instance');
        return {
            listeners: {},
            subscribe: function(event, callback) {
                if (!this.listeners[event]) {
                    this.listeners[event] = [];
                }
                this.listeners[event].push(callback);
                return () => {
                    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
                };
            },
            publish: function(event, data) {
                if (this.listeners[event]) {
                    this.listeners[event].forEach(callback => {
                        try {
                            callback(data);
                        } catch (error) {
                            console.error(`Error in event listener for ${event}:`, error);
                        }
                    });
                }
            }
        };
    }
    
    /**
     * Detect device capabilities
     */
    detectDeviceCapabilities() {
        // Detect memory
        if (navigator.deviceMemory) {
            this.state.deviceCapabilities.memory = navigator.deviceMemory + 'GB';
        }
        
        // Detect CPU cores
        if (navigator.hardwareConcurrency) {
            this.state.deviceCapabilities.cpu = navigator.hardwareConcurrency + ' cores';
        }
        
        // Detect GPU (limited information available)
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                this.state.deviceCapabilities.gpu = renderer;
            } else {
                this.state.deviceCapabilities.gpu = 'WebGL supported';
            }
        } else {
            this.state.deviceCapabilities.gpu = 'WebGL not supported';
        }
        
        // Detect connection type
        if (navigator.connection) {
            this.state.deviceCapabilities.connection = navigator.connection.effectiveType || 'unknown';
            
            // Listen for connection changes
            navigator.connection.addEventListener('change', () => {
                this.state.deviceCapabilities.connection = navigator.connection.effectiveType || 'unknown';
                this.applyOptimizations();
            });
        }
        
        console.log('Device capabilities:', this.state.deviceCapabilities);
        
        // Determine optimization level based on capabilities
        this.determineOptimizationLevel();
    }
    
    /**
     * Determine optimization level
     */
    determineOptimizationLevel() {
        if (this.state.optimizationLevel !== 'auto') {
            return; // Manual setting takes precedence
        }
        
        // Parse memory
        let memory = 4; // Default assumption: 4GB
        if (this.state.deviceCapabilities.memory !== 'unknown') {
            memory = parseFloat(this.state.deviceCapabilities.memory);
        }
        
        // Parse CPU
        let cpuCores = 4; // Default assumption: 4 cores
        if (this.state.deviceCapabilities.cpu !== 'unknown') {
            cpuCores = parseInt(this.state.deviceCapabilities.cpu);
        }
        
        // Check GPU
        const hasGoodGPU = this.state.deviceCapabilities.gpu !== 'WebGL not supported' && 
                          !this.state.deviceCapabilities.gpu.includes('Intel');
        
        // Check connection
        const hasGoodConnection = this.state.deviceCapabilities.connection === '4g' || 
                                 this.state.deviceCapabilities.connection === 'unknown';
        
        // Determine level
        if (memory >= 8 && cpuCores >= 8 && hasGoodGPU && hasGoodConnection) {
            this.state.optimizationLevel = 'low'; // High-end device, minimal optimization needed
        } else if (memory >= 4 && cpuCores >= 4 && hasGoodConnection) {
            this.state.optimizationLevel = 'medium'; // Mid-range device
        } else {
            this.state.optimizationLevel = 'high'; // Low-end device, aggressive optimization needed
        }
        
        console.log('Optimization level set to:', this.state.optimizationLevel);
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for settings changes
        window.eventSystem.subscribe('settings-updated', (data) => {
            if (data.performanceMode !== undefined) {
                this.state.optimizationLevel = data.performanceMode;
                this.applyOptimizations();
            }
        });
        
        // Listen for performance issues
        window.eventSystem.subscribe('performance-issue', (data) => {
            this.handlePerformanceIssue(data);
        });
        
        // Listen for app initialization
        window.eventSystem.subscribe('app-initialized', () => {
            // Record load time
            this.state.performanceMetrics.loadTime = performance.now();
            
            // Apply optimizations after a short delay
            setTimeout(() => {
                this.applyOptimizations();
            }, 1000);
        });
    }
    
    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring() {
        if (this.state.isMonitoring) {
            return;
        }
        
        this.state.isMonitoring = true;
        
        // Monitor FPS
        let frameCount = 0;
        let lastFrameTime = performance.now();
        
        const monitorFPS = () => {
            frameCount++;
            const now = performance.now();
            const elapsed = now - lastFrameTime;
            
            if (elapsed >= 1000) { // Update every second
                this.state.performanceMetrics.fps = Math.round(frameCount * 1000 / elapsed);
                frameCount = 0;
                lastFrameTime = now;
                
                // Check for performance issues
                this.checkPerformance();
            }
            
            if (this.state.isMonitoring) {
                requestAnimationFrame(monitorFPS);
            }
        };
        
        requestAnimationFrame(monitorFPS);
        
        // Monitor memory usage if available
        if (performance.memory) {
            setInterval(() => {
                this.state.performanceMetrics.memoryUsage = Math.round(performance.memory.usedJSHeapSize / (1024 * 1024));
            }, 2000);
        }
        
        // Monitor response time
        window.eventSystem.subscribe('user-message', () => {
            this.responseStartTime = performance.now();
        });
        
        window.eventSystem.subscribe('ai-response', () => {
            if (this.responseStartTime) {
                this.state.performanceMetrics.responseTime = performance.now() - this.responseStartTime;
                this.responseStartTime = null;
            }
        });
    }
    
    /**
     * Check performance
     */
    checkPerformance() {
        const now = performance.now();
        
        // Only check periodically
        if (now - this.state.lastPerformanceCheck < this.state.performanceCheckInterval) {
            return;
        }
        
        this.state.lastPerformanceCheck = now;
        
        // Check FPS
        if (this.state.performanceMetrics.fps < 30) {
            this.handlePerformanceIssue({
                type: 'low-fps',
                value: this.state.performanceMetrics.fps
            });
        }
        
        // Check memory usage
        if (this.state.performanceMetrics.memoryUsage > 500) { // 500MB threshold
            this.handlePerformanceIssue({
                type: 'high-memory',
                value: this.state.performanceMetrics.memoryUsage
            });
        }
        
        // Check response time
        if (this.state.performanceMetrics.responseTime > 2000) { // 2 second threshold
            this.handlePerformanceIssue({
                type: 'slow-response',
                value: this.state.performanceMetrics.responseTime
            });
        }
    }
    
    /**
     * Handle performance issue
     * @param {Object} data - Issue data
     */
    handlePerformanceIssue(data) {
        console.warn('Performance issue detected:', data);
        
        // Increase optimization level if on auto
        if (this.state.optimizationLevel === 'auto' || this.state.optimizationLevel === 'low') {
            this.state.optimizationLevel = 'medium';
            this.applyOptimizations();
        } else if (this.state.optimizationLevel === 'medium') {
            this.state.optimizationLevel = 'high';
            this.applyOptimizations();
        }
        
        // Publish event
        window.eventSystem.publish('performance-optimization-applied', {
            reason: data.type,
            level: this.state.optimizationLevel
        });
    }
    
    /**
     * Apply optimizations
     */
    applyOptimizations() {
        console.log('Applying performance optimizations at level:', this.state.optimizationLevel);
        
        // Apply different optimizations based on level
        switch (this.state.optimizationLevel) {
            case 'low':
                this.applyLowOptimizations();
                break;
            case 'medium':
                this.applyMediumOptimizations();
                break;
            case 'high':
                this.applyHighOptimizations();
                break;
            case 'auto':
                // Determine level first
                this.determineOptimizationLevel();
                this.applyOptimizations();
                break;
        }
    }
    
    /**
     * Apply low-level optimizations
     */
    applyLowOptimizations() {
        // Minimal optimizations for high-end devices
        
        // Enable all visual effects
        document.body.classList.remove('reduced-effects');
        document.body.classList.remove('minimal-effects');
        
        // Enable animations
        document.body.style.setProperty('--animation-speed-multiplier', '1');
        
        // Set high-quality visuals
        this.setVisualQuality('high');
        
        // Enable background particles
        this.setBackgroundParticles(true);
        
        // Publish event
        window.eventSystem.publish('optimization-level-changed', {
            level: 'low',
            effects: 'full'
        });
    }
    
    /**
     * Apply medium-level optimizations
     */
    applyMediumOptimizations() {
        // Moderate optimizations for mid-range devices
        
        // Reduce some visual effects
        document.body.classList.add('reduced-effects');
        document.body.classList.remove('minimal-effects');
        
        // Slow down animations slightly
        document.body.style.setProperty('--animation-speed-multiplier', '0.8');
        
        // Set medium-quality visuals
        this.setVisualQuality('medium');
        
        // Reduce background particles
        this.setBackgroundParticles(true, 0.5);
        
        // Optimize images
        this.optimizeImages();
        
        // Limit history length
        this.limitHistoryLength(50);
        
        // Publish event
        window.eventSystem.publish('optimization-level-changed', {
            level: 'medium',
            effects: 'reduced'
        });
    }
    
    /**
     * Apply high-level optimizations
     */
    applyHighOptimizations() {
        // Aggressive optimizations for low-end devices
        
        // Minimize visual effects
        document.body.classList.add('reduced-effects');
        document.body.classList.add('minimal-effects');
        
        // Minimize animations
        document.body.style.setProperty('--animation-speed-multiplier', '0.5');
        
        // Set low-quality visuals
        this.setVisualQuality('low');
        
        // Disable background particles
        this.setBackgroundParticles(false);
        
        // Optimize images
        this.optimizeImages(true);
        
        // Limit history length
        this.limitHistoryLength(20);
        
        // Disable advanced features
        this.disableAdvancedFeatures();
        
        // Publish event
        window.eventSystem.publish('optimization-level-changed', {
            level: 'high',
            effects: 'minimal'
        });
    }
    
    /**
     * Set visual quality
     * @param {string} quality - Quality level ('low', 'medium', 'high')
     */
    setVisualQuality(quality) {
        // Set quality class on body
        document.body.classList.remove('quality-low', 'quality-medium', 'quality-high');
        document.body.classList.add(`quality-${quality}`);
        
        // Apply specific quality settings
        switch (quality) {
            case 'low':
                document.body.style.setProperty('--shadow-strength', '0');
                document.body.style.setProperty('--blur-strength', '0');
                document.body.style.setProperty('--transition-duration', '0.1s');
                break;
            case 'medium':
                document.body.style.setProperty('--shadow-strength', '0.5');
                document.body.style.setProperty('--blur-strength', '5px');
                document.body.style.setProperty('--transition-duration', '0.2s');
                break;
            case 'high':
                document.body.style.setProperty('--shadow-strength', '1');
                document.body.style.setProperty('--blur-strength', '10px');
                document.body.style.setProperty('--transition-duration', '0.3s');
                break;
        }
        
        // Notify visualization systems
        window.eventSystem.publish('visual-quality-changed', {
            quality: quality
        });
    }
    
    /**
     * Set background particles
     * @param {boolean} enabled - Whether particles are enabled
     * @param {number} density - Particle density multiplier (0-1)
     */
    setBackgroundParticles(enabled, density = 1) {
        // Notify visualization systems
        window.eventSystem.publish('background-particles-changed', {
            enabled: enabled,
            density: density
        });
        
        // Apply to existing particles if possible
        const particleContainers = document.querySelectorAll('.particle-container');
        particleContainers.forEach(container => {
            if (!enabled) {
                container.style.display = 'none';
            } else {
                container.style.display = 'block';
                
                // Adjust particle count if possible
                const particles = container.querySelectorAll('.particle');
                for (let i = 0; i < particles.length; i++) {
                    if (i < particles.length * density) {
                        particles[i].style.display = 'block';
                    } else {
                        particles[i].style.display = 'none';
                    }
                }
            }
        });
    }
    
    /**
     * Optimize images
     * @param {boolean} aggressive - Whether to use aggressive optimization
     */
    optimizeImages(aggressive = false) {
        // Find all images
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            // Skip already processed images
            if (img.dataset.optimized) {
                return;
            }
            
            // Save original src
            if (!img.dataset.originalSrc) {
                img.dataset.originalSrc = img.src;
            }
            
            // Apply optimization
            if (aggressive) {
                // Very low quality or hide non-essential
                if (img.classList.contains('decorative')) {
                    img.style.display = 'none';
                } else {
                    this.loadLowQualityImage(img);
                }
            } else {
                // Medium quality
                this.loadMediumQualityImage(img);
            }
            
            // Mark as optimized
            img.dataset.optimized = true;
        });
    }
    
    /**
     * Load low quality image
     * @param {HTMLImageElement} img - Image element
     */
    loadLowQualityImage(img) {
        const originalSrc = img.dataset.originalSrc || img.src;
        
        // Check if src contains size parameters
        if (originalSrc.includes('width=') || originalSrc.includes('size=')) {
            // Modify size parameters
            let newSrc = originalSrc
                .replace(/width=\d+/g, 'width=100')
                .replace(/height=\d+/g, 'height=100')
                .replace(/size=\d+/g, 'size=100');
            
            img.src = newSrc;
        } else if (img.width > 100) {
            // Set max dimensions
            img.style.maxWidth = '100px';
            img.style.maxHeight = '100px';
        }
    }
    
    /**
     * Load medium quality image
     * @param {HTMLImageElement} img - Image element
     */
    loadMediumQualityImage(img) {
        const originalSrc = img.dataset.originalSrc || img.src;
        
        // Check if src contains size parameters
        if (originalSrc.includes('width=') || originalSrc.includes('size=')) {
            // Modify size parameters
            let newSrc = originalSrc
                .replace(/width=\d+/g, 'width=300')
                .replace(/height=\d+/g, 'height=300')
                .replace(/size=\d+/g, 'size=300');
            
            img.src = newSrc;
        } else if (img.width > 300) {
            // Set max dimensions
            img.style.maxWidth = '300px';
            img.style.maxHeight = '300px';
        }
    }
    
    /**
     * Limit history length
     * @param {number} length - Maximum history length
     */
    limitHistoryLength(length) {
        // Notify memory system
        window.eventSystem.publish('limit-history-length', {
            maxLength: length
        });
        
        // Apply to DOM if needed
        const historyContainer = document.getElementById('conversation-history');
        if (historyContainer) {
            const messages = historyContainer.querySelectorAll('.message');
            if (messages.length > length) {
                // Remove oldest messages
                for (let i = 0; i < messages.length - length; i++) {
                    messages[i].remove();
                }
            }
        }
    }
    
    /**
     * Disable advanced features
     */
    disableAdvancedFeatures() {
        // Notify systems
        window.eventSystem.publish('disable-advanced-features', {
            reason: 'performance'
        });
        
        // Hide advanced UI elements
        const advancedElements = document.querySelectorAll('.advanced-feature');
        advancedElements.forEach(element => {
            element.style.display = 'none';
        });
    }
    
    /**
     * Get performance metrics
     * @returns {Object} - Performance metrics
     */
    getPerformanceMetrics() {
        return this.state.performanceMetrics;
    }
    
    /**
     * Get device capabilities
     * @returns {Object} - Device capabilities
     */
    getDeviceCapabilities() {
        return this.state.deviceCapabilities;
    }
    
    /**
     * Get optimization level
     * @returns {string} - Optimization level
     */
    getOptimizationLevel() {
        return this.state.optimizationLevel;
    }
    
    /**
     * Set optimization level
     * @param {string} level - Optimization level ('low', 'medium', 'high', 'auto')
     */
    setOptimizationLevel(level) {
        if (['low', 'medium', 'high', 'auto'].includes(level)) {
            this.state.optimizationLevel = level;
            this.applyOptimizations();
            return true;
        }
        return false;
    }
}

// Create singleton instance
const performanceOptimizationSystem = new PerformanceOptimizationSystem();

// Export the singleton
window.performanceOptimizationSystem = performanceOptimizationSystem;
