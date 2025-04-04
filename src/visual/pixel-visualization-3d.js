/**
 * 3D Pixel Visualization System
 * 
 * This system provides a WebGL-based 3D rendering of the MeAI entity
 * with sophisticated emotional expressions, smooth transitions, and
 * optimized performance across devices.
 */

import * as THREE from 'three';

class PixelVisualization3D {
    constructor() {
        // DOM elements
        this.container = document.getElementById('pixel-container');
        
        // Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.models = {};
        this.currentModel = null;
        this.targetModel = null;
        this.mixer = null;
        this.clock = new THREE.Clock();
        
        // Emotional state configuration
        this.emotionalStates = {
            joy: {
                color: 0xffbe0b,
                emissiveIntensity: 0.8,
                pulseSpeed: 0.8,
                particleSystem: 'sparkle',
                animationSpeed: 1.2
            },
            reflective: {
                color: 0x3a86ff,
                emissiveIntensity: 0.5,
                pulseSpeed: 0.4,
                particleSystem: 'wave',
                animationSpeed: 0.7
            },
            curious: {
                color: 0x8338ec,
                emissiveIntensity: 0.6,
                pulseSpeed: 0.6,
                particleSystem: 'orbit',
                animationSpeed: 0.9
            },
            excited: {
                color: 0xff006e,
                emissiveIntensity: 0.9,
                pulseSpeed: 1.0,
                particleSystem: 'burst',
                animationSpeed: 1.4
            },
            empathetic: {
                color: 0x38b000,
                emissiveIntensity: 0.7,
                pulseSpeed: 0.5,
                particleSystem: 'pulse',
                animationSpeed: 0.8
            },
            calm: {
                color: 0x00b4d8,
                emissiveIntensity: 0.4,
                pulseSpeed: 0.3,
                particleSystem: 'gentle',
                animationSpeed: 0.6
            },
            neutral: {
                color: 0xffffff,
                emissiveIntensity: 0.5,
                pulseSpeed: 0.5,
                particleSystem: 'minimal',
                animationSpeed: 1.0
            }
        };
        
        // Current state
        this.currentState = 'neutral';
        this.transitionProgress = 0;
        this.isTransitioning = false;
        this.transitionDuration = 1.0; // seconds
        this.transitionStartTime = 0;
        this.isListening = false;
        this.isSpeaking = false;
        
        // Performance monitoring
        this.fpsCounter = document.createElement('div');
        this.fpsCounter.style.position = 'absolute';
        this.fpsCounter.style.bottom = '5px';
        this.fpsCounter.style.right = '5px';
        this.fpsCounter.style.fontSize = '12px';
        this.fpsCounter.style.color = 'rgba(255, 255, 255, 0.5)';
        this.fpsCounter.style.display = 'none'; // Hidden by default
        this.container.appendChild(this.fpsCounter);
        
        // Particle systems
        this.particles = {};
        this.activeParticles = [];
        
        // Initialize
        this.init();
        this.createModels();
        this.setupEventListeners();
        this.animate();
    }
    
    /**
     * Initialize the Three.js scene, camera, and renderer
     */
    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        this.scene.background.alpha = 0; // Transparent background
        
        // Create camera
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.z = 5;
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.container.appendChild(this.renderer.domElement);
        
        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    /**
     * Create 3D models for each emotional state
     */
    createModels() {
        // Create base geometries for each emotional state
        const joyGeometry = this.createJoyGeometry();
        const reflectiveGeometry = this.createReflectiveGeometry();
        const curiousGeometry = this.createCuriousGeometry();
        const excitedGeometry = this.createExcitedGeometry();
        const empatheticGeometry = this.createEmpatheticGeometry();
        const calmGeometry = this.createCalmGeometry();
        const neutralGeometry = this.createNeutralGeometry();
        
        // Create materials with emissive properties
        const createMaterial = (color, emissiveIntensity) => {
            return new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: emissiveIntensity,
                roughness: 0.3,
                metalness: 0.7,
                transparent: true,
                opacity: 0.9
            });
        };
        
        // Create meshes for each emotional state
        this.models.joy = new THREE.Mesh(
            joyGeometry, 
            createMaterial(this.emotionalStates.joy.color, this.emotionalStates.joy.emissiveIntensity)
        );
        
        this.models.reflective = new THREE.Mesh(
            reflectiveGeometry, 
            createMaterial(this.emotionalStates.reflective.color, this.emotionalStates.reflective.emissiveIntensity)
        );
        
        this.models.curious = new THREE.Mesh(
            curiousGeometry, 
            createMaterial(this.emotionalStates.curious.color, this.emotionalStates.curious.emissiveIntensity)
        );
        
        this.models.excited = new THREE.Mesh(
            excitedGeometry, 
            createMaterial(this.emotionalStates.excited.color, this.emotionalStates.excited.emissiveIntensity)
        );
        
        this.models.empathetic = new THREE.Mesh(
            empatheticGeometry, 
            createMaterial(this.emotionalStates.empathetic.color, this.emotionalStates.empathetic.emissiveIntensity)
        );
        
        this.models.calm = new THREE.Mesh(
            calmGeometry, 
            createMaterial(this.emotionalStates.calm.color, this.emotionalStates.calm.emissiveIntensity)
        );
        
        this.models.neutral = new THREE.Mesh(
            neutralGeometry, 
            createMaterial(this.emotionalStates.neutral.color, this.emotionalStates.neutral.emissiveIntensity)
        );
        
        // Hide all models initially
        Object.values(this.models).forEach(model => {
            model.visible = false;
            this.scene.add(model);
        });
        
        // Set initial model
        this.currentModel = this.models.neutral;
        this.currentModel.visible = true;
        
        // Create particle systems
        this.createParticleSystems();
    }
    
    /**
     * Create geometry for joy emotional state
     * A bright, expanding sphere with irregular surface
     */
    createJoyGeometry() {
        const geometry = new THREE.IcosahedronGeometry(1, 2);
        
        // Modify vertices to create irregular, joyful shape
        const positionAttribute = geometry.getAttribute('position');
        const vertex = new THREE.Vector3();
        
        for (let i = 0; i < positionAttribute.count; i++) {
            vertex.fromBufferAttribute(positionAttribute, i);
            
            // Add some randomness to create a more organic, joyful shape
            const noise = 0.2 * Math.sin(5 * vertex.x) * Math.sin(5 * vertex.y) * Math.sin(5 * vertex.z);
            vertex.normalize().multiplyScalar(1 + noise);
            
            positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
        
        geometry.computeVertexNormals();
        return geometry;
    }
    
    /**
     * Create geometry for reflective emotional state
     * A smooth, slightly pulsating sphere with gentle waves
     */
    createReflectiveGeometry() {
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        
        // Modify vertices to create a more reflective, thoughtful shape
        const positionAttribute = geometry.getAttribute('position');
        const vertex = new THREE.Vector3();
        
        for (let i = 0; i < positionAttribute.count; i++) {
            vertex.fromBufferAttribute(positionAttribute, i);
            
            // Add gentle waves for a reflective appearance
            const noise = 0.1 * Math.sin(3 * vertex.y);
            vertex.normalize().multiplyScalar(1 + noise);
            
            positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
        
        geometry.computeVertexNormals();
        return geometry;
    }
    
    /**
     * Create geometry for curious emotional state
     * An asymmetrical shape with protrusions representing curiosity
     */
    createCuriousGeometry() {
        const geometry = new THREE.SphereGeometry(0.9, 24, 24);
        
        // Modify vertices to create a curious, inquisitive shape
        const positionAttribute = geometry.getAttribute('position');
        const vertex = new THREE.Vector3();
        
        for (let i = 0; i < positionAttribute.count; i++) {
            vertex.fromBufferAttribute(positionAttribute, i);
            
            // Create small protrusions in random directions
            const theta = Math.atan2(vertex.y, vertex.x);
            const noise = 0.2 * Math.sin(4 * theta) * Math.sin(3 * vertex.z);
            vertex.normalize().multiplyScalar(1 + noise);
            
            positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
        
        geometry.computeVertexNormals();
        return geometry;
    }
    
    /**
     * Create geometry for excited emotional state
     * A spiky, energetic shape with rapid movement
     */
    createExcitedGeometry() {
        const geometry = new THREE.IcosahedronGeometry(0.8, 1);
        
        // Modify vertices to create an excited, energetic shape
        const positionAttribute = geometry.getAttribute('position');
        const vertex = new THREE.Vector3();
        
        for (let i = 0; i < positionAttribute.count; i++) {
            vertex.fromBufferAttribute(positionAttribute, i);
            
            // Create spiky protrusions for an excited appearance
            const noise = 0.3 * (0.5 + 0.5 * Math.sin(10 * vertex.x) * Math.sin(10 * vertex.y) * Math.sin(10 * vertex.z));
            vertex.normalize().multiplyScalar(1 + noise);
            
            positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
        
        geometry.computeVertexNormals();
        return geometry;
    }
    
    /**
     * Create geometry for empathetic emotional state
     * A heart-like shape with gentle curves
     */
    createEmpatheticGeometry() {
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        
        // Modify vertices to create an empathetic, caring shape
        const positionAttribute = geometry.getAttribute('position');
        const vertex = new THREE.Vector3();
        
        for (let i = 0; i < positionAttribute.count; i++) {
            vertex.fromBufferAttribute(positionAttribute, i);
            
            // Create a heart-like shape for empathy
            if (vertex.y > 0) {
                vertex.y *= 1.1;
                
                // Create a dip at the top
                if (vertex.y > 0.7) {
                    vertex.y -= 0.2 * Math.pow(vertex.x, 2);
                }
            } else {
                // Create a point at the bottom
                vertex.y *= 1.2;
            }
            
            positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
        
        geometry.computeVertexNormals();
        return geometry;
    }
    
    /**
     * Create geometry for calm emotional state
     * A smooth, gently pulsating sphere
     */
    createCalmGeometry() {
        const geometry = new THREE.SphereGeometry(1, 64, 64);
        
        // Modify vertices to create a calm, serene shape
        const positionAttribute = geometry.getAttribute('position');
        const vertex = new THREE.Vector3();
        
        for (let i = 0; i < positionAttribute.count; i++) {
            vertex.fromBufferAttribute(positionAttribute, i);
            
            // Add very subtle variations for a calm appearance
            const noise = 0.05 * Math.sin(2 * vertex.x) * Math.sin(2 * vertex.y) * Math.sin(2 * vertex.z);
            vertex.normalize().multiplyScalar(1 + noise);
            
            positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
        
        geometry.computeVertexNormals();
        return geometry;
    }
    
    /**
     * Create geometry for neutral emotional state
     * A perfect sphere with minimal variation
     */
    createNeutralGeometry() {
        return new THREE.SphereGeometry(1, 32, 32);
    }
    
    /**
     * Create particle systems for each emotional state
     */
    createParticleSystems() {
        // Create particle geometries and materials
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 500;
        
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        const color = new THREE.Color();
        
        for (let i = 0; i < particleCount; i++) {
            // Random positions in a sphere
            const radius = 3 + Math.random() * 2;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);
            
            // Default color (will be updated based on emotional state)
            color.set(0xffffff);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
            
            // Random sizes
            sizes[i] = Math.random() * 0.1;
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Create particle material with custom shader
        const particleMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pixelColor: { value: new THREE.Color(0xffffff) }
            },
            vertexShader: `
                attribute float size;
                varying vec3 vColor;
                uniform float time;
                
                void main() {
                    vColor = color;
                    
                    // Animate particles
                    vec3 pos = position;
                    float speed = 0.2;
                    float amplitude = 0.1;
                    
                    pos.x += sin(time * speed + position.z * 5.0) * amplitude;
                    pos.y += cos(time * speed + position.x * 5.0) * amplitude;
                    pos.z += sin(time * speed + position.y * 5.0) * amplitude;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                uniform vec3 pixelColor;
                
                void main() {
                    // Calculate distance from center of point
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float dist = length(center);
                    
                    // Discard pixels outside of circle
                    if (dist > 0.5) discard;
                    
                    // Blend particle color with pixel color
                    vec3 color = mix(vColor, pixelColor, 0.7);
                    
                    // Fade out towards edges
                    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true,
            vertexColors: true
        });
        
        // Create particle systems for each emotional state
        Object.keys(this.emotionalStates).forEach(state => {
            const particles = new THREE.Points(particleGeometry.clone(), particleMaterial.clone());
            particles.visible = false;
            particles.userData = {
                state: state,
                time: 0,
                speed: this.emotionalStates[state].pulseSpeed
            };
            
            // Set color based on emotional state
            particles.material.uniforms.pixelColor.value.set(this.emotionalStates[state].color);
            
            this.scene.add(particles);
            this.particles[state] = particles;
        });
    }
    
    /**
     * Set up event listeners for system events
     */
    setupEventListeners() {
        // Listen for emotional state changes
        window.eventSystem.subscribe('emotional-state-change', (data) => {
            this.setEmotionalState(data.state, data.intensity || 1.0);
        });
        
        // Listen for listening state changes
        window.eventSystem.subscribe('listening-state-change', (data) => {
            this.setListeningState(data.isListening);
        });
        
        // Listen for speaking state changes
        window.eventSystem.subscribe('speaking-state-change', (data) => {
            this.setSpeakingState(data.isSpeaking);
        });
        
        // Listen for debug mode toggle
        window.eventSystem.subscribe('debug-mode-change', (data) => {
            this.setDebugMode(data.enabled);
        });
        
        // Listen for theme changes
        window.eventSystem.subscribe('theme-change', (data) => {
            this.updateTheme(data.theme);
        });
    }
    
    /**
     * Set the emotional state of the pixel
     * @param {string} state - The emotional state to set
     * @param {number} intensity - The intensity of the emotion (0-1)
     */
    setEmotionalState(state, intensity = 1.0) {
        if (!this.emotionalStates[state]) {
            console.warn(`Unknown emotional state: ${state}`);
            state = 'neutral';
        }
        
        if (state === this.currentState) {
            return;
        }
        
        // Start transition to new state
        this.targetModel = this.models[state];
        this.isTransitioning = true;
        this.transitionProgress = 0;
        this.transitionStartTime = this.clock.getElapsedTime();
        
        // Update particle system
        Object.values(this.particles).forEach(particles => {
            particles.visible = false;
        });
        
        this.particles[state].visible = true;
        this.activeParticles = [this.particles[state]];
        
        // If transitioning from one state to another, show both particle systems
        if (this.currentState !== state) {
            this.particles[this.currentState].visible = true;
            this.activeParticles.push(this.particles[this.currentState]);
        }
        
        this.currentState = state;
        
        // Publish event for other systems
        window.eventSystem.publish('pixel-state-changed', {
            state: state,
            intensity: intensity
        });
    }
    
    /**
     * Set the listening state of the pixel
     * @param {boolean} isListening - Whether the pixel is listening
     */
    setListeningState(isListening) {
        this.isListening = isListening;
        
        // Add visual indicator for listening state
        if (isListening) {
            // Pulse effect when listening
            this.currentModel.scale.set(1.1, 1.1, 1.1);
        } else {
            this.currentModel.scale.set(1.0, 1.0, 1.0);
        }
    }
    
    /**
     * Set the speaking state of the pixel
     * @param {boolean} isSpeaking - Whether the pixel is speaking
     */
    setSpeakingState(isSpeaking) {
        this.isSpeaking = isSpeaking;
    }
    
    /**
     * Enable or disable debug mode
     * @param {boolean} enabled - Whether debug mode is enabled
     */
    setDebugMode(enabled) {
        this.fpsCounter.style.display = enabled ? 'block' : 'none';
    }
    
    /**
     * Update the theme colors
     * @param {string} theme - The theme name
     */
    updateTheme(theme) {
        // Theme-specific adjustments could be made here
        // For now, we'll keep the emotional state colors consistent
    }
    
    /**
     * Handle window resize events
     */
    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }
    
    /**
     * Animation loop
     */
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();
        
        // Handle state transitions
        if (this.isTransitioning) {
            const timeElapsed = elapsedTime - this.transitionStartTime;
            this.transitionProgress = Math.min(timeElapsed / this.transitionDuration, 1.0);
            
            if (this.transitionProgress >= 1.0) {
                // Transition complete
                this.isTransitioning = false;
                this.currentModel.visible = false;
                this.currentModel = this.targetModel;
                this.currentModel.visible = true;
                
                // Update particle systems
                if (this.activeParticles.length > 1) {
                    this.activeParticles[1].visible = false;
                    this.activeParticles = [this.activeParticles[0]];
                }
            } else {
                // During transition, show both models with opacity based on progress
                this.currentModel.visible = true;
                this.targetModel.visible = true;
                
                // Fade out current model
                this.currentModel.material.opacity = 1.0 - this.transitionProgress;
                
                // Fade in target model
                this.targetModel.material.opacity = this.transitionProgress;
                
                // Interpolate position and rotation
                this.targetModel.position.copy(this.currentModel.position);
                this.targetModel.rotation.copy(this.currentModel.rotation);
            }
        }
        
        // Update current model animation
        if (this.currentModel) {
            // Rotate slowly
            this.currentModel.rotation.y += 0.005;
            
            // Pulse effect based on emotional state
            const state = this.emotionalStates[this.currentState];
            const pulseAmount = 0.05 * Math.sin(elapsedTime * state.pulseSpeed * Math.PI);
            
            // Apply pulse to scale
            const baseScale = this.isListening ? 1.1 : 1.0;
            this.currentModel.scale.set(
                baseScale + pulseAmount,
                baseScale + pulseAmount,
                baseScale + pulseAmount
            );
            
            // Speaking animation
            if (this.isSpeaking) {
                const speakPulse = 0.1 * Math.sin(elapsedTime * 15);
                this.currentModel.scale.y += speakPulse;
            }
        }
        
        // Update particle systems
        this.activeParticles.forEach(particles => {
            particles.userData.time += delta;
            particles.material.uniforms.time.value = elapsedTime;
            
            // Rotate particle system
            particles.rotation.y += 0.001 * particles.userData.speed;
            particles.rotation.z += 0.0005 * particles.userData.speed;
        });
        
        // Update FPS counter if debug mode is enabled
        if (this.fpsCounter.style.display !== 'none') {
            this.fpsCounter.textContent = `FPS: ${Math.round(1 / delta)}`;
        }
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
    
    /**
     * Get the current emotional state
     * @returns {string} The current emotional state
     */
    getEmotionalState() {
        return this.currentState;
    }
    
    /**
     * Check if the system is WebGL compatible
     * @returns {boolean} Whether the system is compatible
     */
    static isCompatible() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Dispose of all Three.js resources
     */
    dispose() {
        // Stop animation loop
        cancelAnimationFrame(this.animationFrame);
        
        // Dispose of geometries and materials
        Object.values(this.models).forEach(model => {
            model.geometry.dispose();
            model.material.dispose();
        });
        
        Object.values(this.particles).forEach(particles => {
            particles.geometry.dispose();
            particles.material.dispose();
        });
        
        // Remove renderer from DOM
        if (this.renderer) {
            this.container.removeChild(this.renderer.domElement);
            this.renderer.dispose();
        }
        
        // Remove event listeners
        window.removeEventListener('resize', this.onWindowResize);
    }
}

// Export the class
export default PixelVisualization3D;
