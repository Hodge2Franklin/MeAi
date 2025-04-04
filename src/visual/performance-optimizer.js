/**
 * Performance Optimizer for 3D Visualization
 * 
 * This module provides performance optimization techniques for the 3D visualization system,
 * including level of detail management, adaptive quality settings, and performance monitoring.
 */

class PerformanceOptimizer {
    constructor() {
        // Performance metrics
        this.fps = 0;
        this.frameTime = 0;
        this.frameCount = 0;
        this.lastTime = 0;
        this.fpsUpdateInterval = 500; // ms
        
        // Device capability detection
        this.deviceCapabilities = this.detectDeviceCapabilities();
        
        // Quality settings
        this.qualityLevels = {
            low: {
                particleCount: 100,
                shadowsEnabled: false,
                antialiasing: false,
                textureQuality: 0.5,
                maxLights: 2,
                postProcessing: false
            },
            medium: {
                particleCount: 300,
                shadowsEnabled: true,
                antialiasing: true,
                textureQuality: 0.75,
                maxLights: 4,
                postProcessing: false
            },
            high: {
                particleCount: 500,
                shadowsEnabled: true,
                antialiasing: true,
                textureQuality: 1.0,
                maxLights: 8,
                postProcessing: true
            }
        };
        
        // Set initial quality based on device capabilities
        this.currentQuality = this.determineOptimalQuality();
        
        // Adaptive performance settings
        this.targetFPS = 60;
        this.adaptiveQualityEnabled = true;
        this.adaptiveQualityCheckInterval = 2000; // ms
        this.lastAdaptiveCheck = 0;
        
        // Initialize
        this.setupEventListeners();
    }
    
    /**
     * Detect device capabilities
     * @returns {Object} Device capabilities
     */
    detectDeviceCapabilities() {
        const capabilities = {
            webgl2: false,
            maxTextureSize: 0,
            floatTextures: false,
            anisotropicFiltering: false,
            maxAnisotropy: 0,
            instancedArrays: false,
            gpuTier: 0 // 0: low, 1: medium, 2: high
        };
        
        // Check WebGL2 support
        const canvas = document.createElement('canvas');
        let gl = canvas.getContext('webgl2');
        
        if (gl) {
            capabilities.webgl2 = true;
            
            // Check max texture size
            capabilities.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
            
            // Check float texture support
            const ext = gl.getExtension('EXT_color_buffer_float');
            capabilities.floatTextures = !!ext;
            
            // Check anisotropic filtering
            const aniso = gl.getExtension('EXT_texture_filter_anisotropic');
            if (aniso) {
                capabilities.anisotropicFiltering = true;
                capabilities.maxAnisotropy = gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
            }
            
            // Check instanced arrays
            capabilities.instancedArrays = true; // WebGL2 always supports this
        } else {
            // Fallback to WebGL1
            gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (gl) {
                // Check max texture size
                capabilities.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
                
                // Check float texture support
                const ext = gl.getExtension('OES_texture_float');
                capabilities.floatTextures = !!ext;
                
                // Check anisotropic filtering
                const aniso = gl.getExtension('EXT_texture_filter_anisotropic');
                if (aniso) {
                    capabilities.anisotropicFiltering = true;
                    capabilities.maxAnisotropy = gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
                }
                
                // Check instanced arrays
                const instancing = gl.getExtension('ANGLE_instanced_arrays');
                capabilities.instancedArrays = !!instancing;
            }
        }
        
        // Determine GPU tier based on capabilities
        if (capabilities.webgl2 && capabilities.floatTextures && capabilities.maxTextureSize >= 8192) {
            capabilities.gpuTier = 2; // High
        } else if (capabilities.maxTextureSize >= 4096) {
            capabilities.gpuTier = 1; // Medium
        } else {
            capabilities.gpuTier = 0; // Low
        }
        
        // Check for mobile device
        capabilities.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Adjust GPU tier down for mobile devices
        if (capabilities.isMobile && capabilities.gpuTier > 0) {
            capabilities.gpuTier--;
        }
        
        return capabilities;
    }
    
    /**
     * Determine optimal quality settings based on device capabilities
     * @returns {string} Quality level (low, medium, high)
     */
    determineOptimalQuality() {
        const { gpuTier, isMobile } = this.deviceCapabilities;
        
        if (gpuTier === 2 && !isMobile) {
            return 'high';
        } else if (gpuTier === 1 || (gpuTier === 2 && isMobile)) {
            return 'medium';
        } else {
            return 'low';
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for quality setting changes
        window.eventSystem.subscribe('quality-setting-change', (data) => {
            this.setQuality(data.quality);
        });
        
        // Listen for adaptive quality toggle
        window.eventSystem.subscribe('adaptive-quality-toggle', (data) => {
            this.adaptiveQualityEnabled = data.enabled;
        });
    }
    
    /**
     * Set quality level
     * @param {string} quality - Quality level (low, medium, high)
     */
    setQuality(quality) {
        if (!this.qualityLevels[quality]) {
            console.warn(`Unknown quality level: ${quality}`);
            return;
        }
        
        this.currentQuality = quality;
        
        // Publish quality change event
        window.eventSystem.publish('quality-changed', {
            quality: quality,
            settings: this.qualityLevels[quality]
        });
    }
    
    /**
     * Get current quality settings
     * @returns {Object} Current quality settings
     */
    getQualitySettings() {
        return this.qualityLevels[this.currentQuality];
    }
    
    /**
     * Update performance metrics
     * @param {number} now - Current timestamp
     */
    updatePerformanceMetrics(now) {
        this.frameCount++;
        
        // Update FPS every interval
        if (now - this.lastTime >= this.fpsUpdateInterval) {
            this.fps = (this.frameCount * 1000) / (now - this.lastTime);
            this.frameTime = (now - this.lastTime) / this.frameCount;
            
            this.frameCount = 0;
            this.lastTime = now;
            
            // Publish performance metrics
            window.eventSystem.publish('performance-metrics', {
                fps: this.fps,
                frameTime: this.frameTime
            });
            
            // Check if adaptive quality adjustment is needed
            if (this.adaptiveQualityEnabled && now - this.lastAdaptiveCheck >= this.adaptiveQualityCheckInterval) {
                this.adjustQualityBasedOnPerformance();
                this.lastAdaptiveCheck = now;
            }
        }
    }
    
    /**
     * Adjust quality settings based on performance
     */
    adjustQualityBasedOnPerformance() {
        const qualityLevels = Object.keys(this.qualityLevels);
        const currentIndex = qualityLevels.indexOf(this.currentQuality);
        
        // If FPS is too low, decrease quality
        if (this.fps < this.targetFPS * 0.8 && currentIndex > 0) {
            this.setQuality(qualityLevels[currentIndex - 1]);
            console.log(`Decreased quality to ${this.currentQuality} due to low FPS (${this.fps.toFixed(1)})`);
        }
        // If FPS is high enough, increase quality
        else if (this.fps > this.targetFPS * 1.2 && currentIndex < qualityLevels.length - 1) {
            this.setQuality(qualityLevels[currentIndex + 1]);
            console.log(`Increased quality to ${this.currentQuality} due to high FPS (${this.fps.toFixed(1)})`);
        }
    }
    
    /**
     * Apply level of detail (LOD) based on distance
     * @param {THREE.Object3D} object - Object to apply LOD to
     * @param {number} distance - Distance from camera
     */
    applyLOD(object, distance) {
        // Skip if object doesn't have LOD levels
        if (!object.userData.lodLevels) {
            return;
        }
        
        const { lodLevels } = object.userData;
        const qualitySettings = this.getQualitySettings();
        
        // Determine appropriate LOD level based on distance and quality
        let lodLevel = 0; // Highest detail
        
        if (distance > lodLevels.mediumDistance) {
            lodLevel = 2; // Lowest detail
        } else if (distance > lodLevels.highDistance) {
            lodLevel = 1; // Medium detail
        }
        
        // Adjust LOD based on quality settings
        if (this.currentQuality === 'low') {
            lodLevel = Math.min(2, lodLevel + 1);
        } else if (this.currentQuality === 'high') {
            lodLevel = Math.max(0, lodLevel - 1);
        }
        
        // Apply LOD level
        for (let i = 0; i < object.children.length; i++) {
            if (object.children[i].userData.lodLevel !== undefined) {
                object.children[i].visible = (object.children[i].userData.lodLevel === lodLevel);
            }
        }
    }
    
    /**
     * Create LOD levels for an object
     * @param {THREE.Geometry} geometry - Original high-detail geometry
     * @returns {Array} Array of geometries with different detail levels
     */
    createLODLevels(geometry) {
        // Create three LOD levels
        const lodLevels = [];
        
        // Level 0: Original high-detail geometry
        lodLevels.push(geometry);
        
        // Level 1: Medium detail (50% reduction)
        const mediumDetail = geometry.clone();
        // Apply simplification algorithm here
        // For example, using SimplifyModifier from Three.js examples
        lodLevels.push(mediumDetail);
        
        // Level 2: Low detail (75% reduction)
        const lowDetail = geometry.clone();
        // Apply more aggressive simplification
        lodLevels.push(lowDetail);
        
        return lodLevels;
    }
    
    /**
     * Optimize scene for rendering
     * @param {THREE.Scene} scene - Scene to optimize
     */
    optimizeScene(scene) {
        const qualitySettings = this.getQualitySettings();
        
        // Apply frustum culling
        scene.traverse((object) => {
            if (object.isMesh) {
                object.frustumCulled = true;
            }
        });
        
        // Adjust shadow settings
        if (scene.traverse) {
            scene.traverse((object) => {
                if (object.isLight && object.shadow) {
                    object.castShadow = qualitySettings.shadowsEnabled;
                    
                    // Adjust shadow map size based on quality
                    if (object.shadow.mapSize) {
                        const mapSize = this.currentQuality === 'high' ? 2048 :
                                        this.currentQuality === 'medium' ? 1024 : 512;
                        object.shadow.mapSize.width = mapSize;
                        object.shadow.mapSize.height = mapSize;
                    }
                }
                
                if (object.isMesh) {
                    object.castShadow = qualitySettings.shadowsEnabled;
                    object.receiveShadow = qualitySettings.shadowsEnabled;
                }
            });
        }
    }
    
    /**
     * Optimize renderer settings
     * @param {THREE.WebGLRenderer} renderer - Renderer to optimize
     */
    optimizeRenderer(renderer) {
        const qualitySettings = this.getQualitySettings();
        
        // Set pixel ratio based on quality
        const pixelRatio = this.currentQuality === 'high' ? window.devicePixelRatio :
                          this.currentQuality === 'medium' ? Math.min(window.devicePixelRatio, 2) : 1;
        renderer.setPixelRatio(pixelRatio);
        
        // Set antialiasing
        renderer.antialias = qualitySettings.antialiasing;
        
        // Set shadow map settings
        renderer.shadowMap.enabled = qualitySettings.shadowsEnabled;
        renderer.shadowMap.type = this.currentQuality === 'high' ? 
                                THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
    }
    
    /**
     * Get particle count based on current quality
     * @returns {number} Particle count
     */
    getParticleCount() {
        return this.qualityLevels[this.currentQuality].particleCount;
    }
    
    /**
     * Check if post-processing should be enabled
     * @returns {boolean} Whether post-processing is enabled
     */
    isPostProcessingEnabled() {
        return this.qualityLevels[this.currentQuality].postProcessing;
    }
    
    /**
     * Get texture quality scale factor
     * @returns {number} Texture quality scale factor (0.0-1.0)
     */
    getTextureQualityFactor() {
        return this.qualityLevels[this.currentQuality].textureQuality;
    }
}

export default PerformanceOptimizer;
