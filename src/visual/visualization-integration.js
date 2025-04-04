/**
 * 3D Visualization Integration
 * 
 * This module integrates the Advanced Animation System with the existing 3D visualization components,
 * providing a seamless connection between the emotional state system and the enhanced visual effects.
 */

import * as THREE from 'three';
import PixelVisualization3D from './pixel-visualization-3d.js';
import AdvancedAnimationSystem from './advanced-animation-system.js';
import ShaderEffects from './shader-effects.js';
import PerformanceOptimizer from './performance-optimizer.js';

class VisualizationIntegration {
    constructor() {
        // Core components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.container = null;
        
        // State
        this.isInitialized = false;
        this.currentState = 'neutral';
        this.emotionalIntensity = 0.5;
        
        // Post-processing effects
        this.composer = null;
        this.effectPass = null;
        
        // Event listeners
        this.setupEventListeners();
    }
    
    /**
     * Initialize the visualization integration
     * @param {HTMLElement} container - Container element for the visualization
     */
    async init(container) {
        if (this.isInitialized) return;
        
        this.container = container;
        
        try {
            // Initialize base 3D visualization
            await PixelVisualization3D.init(container);
            
            // Get Three.js components from base visualization
            this.scene = PixelVisualization3D.scene;
            this.camera = PixelVisualization3D.camera;
            this.renderer = PixelVisualization3D.renderer;
            
            // Initialize advanced animation system
            AdvancedAnimationSystem.init(this.scene, this.camera, this.renderer);
            
            // Set up post-processing effects
            this.setupPostProcessing();
            
            // Set initial state
            this.setEmotionalState('neutral', 0.5);
            
            this.isInitialized = true;
            console.log('Visualization Integration initialized');
            
            // Publish initialization event
            window.eventSystem.publish('visualization-integration-initialized', {
                success: true
            });
            
            return true;
        } catch (error) {
            console.error('Error initializing visualization integration:', error);
            
            // Publish error event
            window.eventSystem.publish('visualization-integration-error', {
                error: error.message
            });
            
            return false;
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for emotional state changes
        window.eventSystem.subscribe('emotional-state-changed', (data) => {
            this.setEmotionalState(data.state, data.intensity || 0.5);
        });
        
        // Listen for user interaction events
        window.eventSystem.subscribe('user-interaction', (data) => {
            this.handleUserInteraction(data.type, data.position);
        });
        
        // Listen for quality setting changes
        window.eventSystem.subscribe('quality-changed', (data) => {
            this.adjustQuality(data.quality, data.settings);
        });
        
        // Listen for animation performance updates
        window.eventSystem.subscribe('animation-performance', (data) => {
            this.handlePerformanceUpdate(data);
        });
    }
    
    /**
     * Set up post-processing effects
     */
    setupPostProcessing() {
        try {
            // Import post-processing modules
            const { EffectComposer } = require('three/examples/jsm/postprocessing/EffectComposer.js');
            const { RenderPass } = require('three/examples/jsm/postprocessing/RenderPass.js');
            const { ShaderPass } = require('three/examples/jsm/postprocessing/ShaderPass.js');
            const { BloomPass } = require('three/examples/jsm/postprocessing/BloomPass.js');
            const { UnrealBloomPass } = require('three/examples/jsm/postprocessing/UnrealBloomPass.js');
            
            // Create effect composer
            this.composer = new EffectComposer(this.renderer);
            
            // Add render pass
            const renderPass = new RenderPass(this.scene, this.camera);
            this.composer.addPass(renderPass);
            
            // Add bloom pass for glow effect
            const bloomPass = new UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                1.5,  // strength
                0.4,  // radius
                0.85  // threshold
            );
            this.composer.addPass(bloomPass);
            
            // Add custom shader pass for emotional effects
            const emotionalEffectShader = {
                uniforms: {
                    'tDiffuse': { value: null },
                    'emotionalState': { value: 0 },  // 0: neutral, 1: joy, 2: reflective, etc.
                    'intensity': { value: 0.5 },
                    'time': { value: 0.0 }
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform sampler2D tDiffuse;
                    uniform float emotionalState;
                    uniform float intensity;
                    uniform float time;
                    varying vec2 vUv;
                    
                    void main() {
                        vec4 texel = texture2D(tDiffuse, vUv);
                        
                        // Apply different effects based on emotional state
                        if (emotionalState == 1.0) {
                            // Joy: Warm, vibrant colors
                            float brightness = 1.0 + 0.2 * intensity * sin(time * 2.0);
                            texel.rgb *= brightness;
                            texel.r *= 1.0 + 0.1 * intensity;
                            texel.b *= 1.0 - 0.05 * intensity;
                        } 
                        else if (emotionalState == 2.0) {
                            // Reflective: Subtle blue tint
                            texel.b *= 1.0 + 0.1 * intensity;
                            texel.r *= 1.0 - 0.05 * intensity;
                            texel.g *= 1.0 - 0.02 * intensity;
                        }
                        else if (emotionalState == 3.0) {
                            // Curious: Purple hue
                            texel.r *= 1.0 + 0.05 * intensity;
                            texel.b *= 1.0 + 0.1 * intensity;
                            texel.g *= 1.0 - 0.05 * intensity;
                        }
                        else if (emotionalState == 4.0) {
                            // Excited: Pulsing effect
                            float pulse = 1.0 + 0.15 * intensity * sin(time * 4.0);
                            texel.rgb *= pulse;
                            texel.r *= 1.0 + 0.15 * intensity;
                        }
                        else if (emotionalState == 5.0) {
                            // Empathetic: Soft green glow
                            texel.g *= 1.0 + 0.1 * intensity;
                            texel.r *= 1.0 - 0.02 * intensity;
                            texel.b *= 1.0 - 0.02 * intensity;
                        }
                        else if (emotionalState == 6.0) {
                            // Calm: Subtle blue-cyan
                            texel.g *= 1.0 + 0.05 * intensity;
                            texel.b *= 1.0 + 0.1 * intensity;
                            texel.r *= 1.0 - 0.05 * intensity;
                        }
                        
                        gl_FragColor = texel;
                    }
                `
            };
            
            const emotionalPass = new ShaderPass(emotionalEffectShader);
            emotionalPass.renderToScreen = true;
            this.composer.addPass(emotionalPass);
            this.effectPass = emotionalPass;
            
            // Update composer size on window resize
            window.addEventListener('resize', () => {
                this.composer.setSize(window.innerWidth, window.innerHeight);
            });
            
            console.log('Post-processing effects initialized');
            return true;
        } catch (error) {
            console.error('Error setting up post-processing:', error);
            
            // Fallback to standard rendering
            console.log('Falling back to standard rendering without post-processing');
            return false;
        }
    }
    
    /**
     * Set the current emotional state
     * @param {string} state - Emotional state
     * @param {number} intensity - Intensity of the emotion (0.0 to 1.0)
     */
    setEmotionalState(state, intensity = 0.5) {
        // Validate state
        const validStates = ['joy', 'reflective', 'curious', 'excited', 'empathetic', 'calm', 'neutral'];
        if (!validStates.includes(state)) {
            console.warn(`Unknown emotional state: ${state}`);
            state = 'neutral';
        }
        
        // Clamp intensity
        intensity = Math.max(0.0, Math.min(1.0, intensity));
        
        // Update state
        this.currentState = state;
        this.emotionalIntensity = intensity;
        
        // Update base visualization
        PixelVisualization3D.setEmotionalState(state, intensity);
        
        // Update advanced animation system
        AdvancedAnimationSystem.setEmotionalState(state, intensity);
        
        // Update post-processing effects
        if (this.effectPass) {
            // Map state to numeric value for shader
            const stateMap = {
                'joy': 1.0,
                'reflective': 2.0,
                'curious': 3.0,
                'excited': 4.0,
                'empathetic': 5.0,
                'calm': 6.0,
                'neutral': 0.0
            };
            
            this.effectPass.uniforms.emotionalState.value = stateMap[state];
            this.effectPass.uniforms.intensity.value = intensity;
        }
        
        // Publish state change event
        window.eventSystem.publish('visualization-state-changed', {
            state: state,
            intensity: intensity
        });
        
        console.log(`Visualization state set to ${state} (${intensity})`);
    }
    
    /**
     * Handle user interaction with the visualization
     * @param {string} type - Type of interaction
     * @param {Object} position - Position of interaction
     */
    handleUserInteraction(type, position) {
        // Convert 2D screen position to 3D world position
        const worldPosition = this.screenToWorld(position.x, position.y);
        
        // Forward to advanced animation system
        AdvancedAnimationSystem.handleUserInteraction(type, worldPosition);
        
        // Create ripple effect at interaction point
        this.createInteractionRipple(worldPosition, type);
    }
    
    /**
     * Convert screen coordinates to world coordinates
     * @param {number} x - Screen X coordinate
     * @param {number} y - Screen Y coordinate
     * @returns {THREE.Vector3} World position
     */
    screenToWorld(x, y) {
        // Normalize screen coordinates
        const normalizedX = (x / window.innerWidth) * 2 - 1;
        const normalizedY = -(y / window.innerHeight) * 2 + 1;
        
        // Create raycaster
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(normalizedX, normalizedY), this.camera);
        
        // Calculate world position at a fixed distance
        const distance = 5;
        const worldPosition = new THREE.Vector3();
        raycaster.ray.at(distance, worldPosition);
        
        return worldPosition;
    }
    
    /**
     * Create a ripple effect at the interaction point
     * @param {THREE.Vector3} position - World position
     * @param {string} type - Type of interaction
     */
    createInteractionRipple(position, type) {
        // Create ripple geometry
        const geometry = new THREE.RingGeometry(0.1, 0.2, 32);
        
        // Create ripple material
        const material = new THREE.MeshBasicMaterial({
            color: type === 'click' ? 0xffffff : 0xaaaaaa,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        // Create ripple mesh
        const ripple = new THREE.Mesh(geometry, material);
        ripple.position.copy(position);
        ripple.lookAt(this.camera.position);
        
        // Add to scene
        this.scene.add(ripple);
        
        // Animate ripple
        const startTime = Date.now();
        const duration = type === 'click' ? 1000 : 500;
        const maxScale = type === 'click' ? 3.0 : 1.5;
        
        const animateRipple = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1.0);
            
            // Scale up
            const scale = progress * maxScale;
            ripple.scale.set(scale, scale, scale);
            
            // Fade out
            material.opacity = 0.8 * (1.0 - progress);
            
            if (progress < 1.0) {
                requestAnimationFrame(animateRipple);
            } else {
                // Remove from scene
                this.scene.remove(ripple);
                geometry.dispose();
                material.dispose();
            }
        };
        
        // Start animation
        animateRipple();
    }
    
    /**
     * Adjust quality settings
     * @param {string} quality - Quality level (low, medium, high)
     * @param {Object} settings - Quality settings
     */
    adjustQuality(quality, settings) {
        // Update post-processing effects based on quality
        if (this.composer && this.effectPass) {
            // Adjust bloom strength and radius
            const bloomPass = this.composer.passes.find(pass => pass.name === 'UnrealBloomPass');
            if (bloomPass) {
                switch (quality) {
                    case 'low':
                        bloomPass.strength = 1.0;
                        bloomPass.radius = 0.5;
                        bloomPass.threshold = 0.9;
                        break;
                    case 'medium':
                        bloomPass.strength = 1.5;
                        bloomPass.radius = 0.4;
                        bloomPass.threshold = 0.85;
                        break;
                    case 'high':
                        bloomPass.strength = 2.0;
                        bloomPass.radius = 0.3;
                        bloomPass.threshold = 0.8;
                        break;
                }
            }
        }
        
        console.log(`Visualization quality adjusted to ${quality}`);
    }
    
    /**
     * Handle performance updates from animation system
     * @param {Object} data - Performance data
     */
    handlePerformanceUpdate(data) {
        // Check if performance is below threshold
        if (data.fps < 30) {
            // Reduce particle count
            const currentQuality = PerformanceOptimizer.currentQuality;
            const qualityLevels = Object.keys(PerformanceOptimizer.qualityLevels);
            const currentIndex = qualityLevels.indexOf(currentQuality);
            
            // If not already at lowest quality, reduce quality
            if (currentIndex > 0) {
                const newQuality = qualityLevels[currentIndex - 1];
                PerformanceOptimizer.setQuality(newQuality);
                console.log(`Reduced quality to ${newQuality} due to low FPS (${data.fps.toFixed(1)})`);
            }
        }
    }
    
    /**
     * Get current FPS
     * @returns {number} Current FPS
     */
    getFPS() {
        return AdvancedAnimationSystem.getFPS();
    }
    
    /**
     * Render the visualization
     * This method is called by the base visualization's render loop
     */
    render() {
        // Update time uniform for shader effects
        if (this.effectPass) {
            this.effectPass.uniforms.time.value += 0.016; // Approximately 60fps
        }
        
        // Use composer for rendering if available
        if (this.composer) {
            this.composer.render();
        }
    }
    
    /**
     * Dispose of all resources
     */
    dispose() {
        // Dispose of advanced animation system
        AdvancedAnimationSystem.dispose();
        
        // Dispose of post-processing effects
        if (this.composer) {
            this.composer.passes.forEach(pass => {
                if (pass.dispose) pass.dispose();
            });
        }
        
        this.isInitialized = false;
        console.log('Visualization Integration disposed');
    }
}

export default new VisualizationIntegration();
