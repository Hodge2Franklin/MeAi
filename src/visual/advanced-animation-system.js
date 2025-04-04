/**
 * Advanced Animation System
 * 
 * This module provides a comprehensive animation system for the MeAI visualization,
 * including advanced particle effects, physics-based animations, and procedural
 * animation generation.
 */

import * as THREE from 'three';
import ShaderEffects from './shader-effects.js';

class AdvancedAnimationSystem {
    constructor() {
        // Core components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        
        // Animation state
        this.currentState = 'neutral';
        this.emotionalIntensity = 0.5;
        this.isActive = false;
        
        // Particle systems
        this.particleSystems = {};
        this.activeParticles = [];
        
        // Physics simulation
        this.physicsObjects = [];
        this.gravity = new THREE.Vector3(0, -0.05, 0);
        this.airResistance = 0.98;
        
        // Procedural animation
        this.animationSequences = {};
        this.currentSequence = null;
        this.sequenceTime = 0;
        
        // Performance monitoring
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fpsUpdateInterval = 500; // ms
        this.lastFpsUpdate = 0;
        this.fps = 0;
        
        // Event listeners
        this.setupEventListeners();
    }
    
    /**
     * Initialize the animation system with Three.js components
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {THREE.Camera} camera - The Three.js camera
     * @param {THREE.WebGLRenderer} renderer - The Three.js renderer
     */
    init(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        
        // Initialize particle systems
        this.initializeParticleSystems();
        
        // Initialize physics simulation
        this.initializePhysicsSimulation();
        
        // Initialize procedural animation
        this.initializeProceduralAnimation();
        
        // Start animation loop
        this.isActive = true;
        this.animate();
        
        console.log('Advanced Animation System initialized');
    }
    
    /**
     * Set up event listeners for animation system
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
    }
    
    /**
     * Initialize particle systems for different emotional states
     */
    initializeParticleSystems() {
        // Create particle textures
        const circleTexture = ShaderEffects.createParticleTexture('circle');
        const starTexture = ShaderEffects.createParticleTexture('star');
        const squareTexture = ShaderEffects.createParticleTexture('square');
        
        // Create particle materials with custom shaders
        const particleMaterial = new THREE.ShaderMaterial({
            uniforms: {
                particleTexture: { value: circleTexture },
                pixelColor: { value: new THREE.Color(0xffffff) },
                time: { value: 0.0 }
            },
            vertexShader: ShaderEffects.getParticleVertexShader(),
            fragmentShader: ShaderEffects.getParticleFragmentShader(),
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true
        });
        
        // Create particle systems for each emotional state
        this.createParticleSystem('joy', 500, particleMaterial.clone(), {
            texture: starTexture,
            color: new THREE.Color(0xffbe0b),
            size: { min: 0.1, max: 0.3 },
            speed: { min: 0.5, max: 1.5 },
            lifetime: { min: 1.0, max: 3.0 },
            turbulence: 0.8,
            emissionRate: 10,
            emissionShape: 'sphere',
            emissionRadius: 1.2
        });
        
        this.createParticleSystem('reflective', 300, particleMaterial.clone(), {
            texture: circleTexture,
            color: new THREE.Color(0x3a86ff),
            size: { min: 0.05, max: 0.2 },
            speed: { min: 0.2, max: 0.8 },
            lifetime: { min: 2.0, max: 5.0 },
            turbulence: 0.3,
            emissionRate: 5,
            emissionShape: 'hemisphere',
            emissionRadius: 1.5
        });
        
        this.createParticleSystem('curious', 400, particleMaterial.clone(), {
            texture: squareTexture,
            color: new THREE.Color(0x8338ec),
            size: { min: 0.05, max: 0.15 },
            speed: { min: 0.3, max: 1.0 },
            lifetime: { min: 1.5, max: 4.0 },
            turbulence: 0.5,
            emissionRate: 8,
            emissionShape: 'cone',
            emissionRadius: 1.0,
            emissionAngle: Math.PI / 4
        });
        
        this.createParticleSystem('excited', 600, particleMaterial.clone(), {
            texture: starTexture,
            color: new THREE.Color(0xff006e),
            size: { min: 0.1, max: 0.25 },
            speed: { min: 0.8, max: 2.0 },
            lifetime: { min: 0.8, max: 2.0 },
            turbulence: 1.0,
            emissionRate: 15,
            emissionShape: 'burst',
            emissionRadius: 0.8
        });
        
        this.createParticleSystem('empathetic', 350, particleMaterial.clone(), {
            texture: circleTexture,
            color: new THREE.Color(0x38b000),
            size: { min: 0.08, max: 0.2 },
            speed: { min: 0.3, max: 0.9 },
            lifetime: { min: 2.0, max: 4.0 },
            turbulence: 0.4,
            emissionRate: 7,
            emissionShape: 'torus',
            emissionRadius: 1.2,
            emissionThickness: 0.3
        });
        
        this.createParticleSystem('calm', 250, particleMaterial.clone(), {
            texture: circleTexture,
            color: new THREE.Color(0x00b4d8),
            size: { min: 0.05, max: 0.15 },
            speed: { min: 0.1, max: 0.5 },
            lifetime: { min: 3.0, max: 6.0 },
            turbulence: 0.2,
            emissionRate: 4,
            emissionShape: 'plane',
            emissionSize: { width: 2.0, height: 2.0 }
        });
        
        this.createParticleSystem('neutral', 200, particleMaterial.clone(), {
            texture: circleTexture,
            color: new THREE.Color(0xffffff),
            size: { min: 0.05, max: 0.1 },
            speed: { min: 0.2, max: 0.6 },
            lifetime: { min: 2.0, max: 4.0 },
            turbulence: 0.3,
            emissionRate: 3,
            emissionShape: 'point'
        });
        
        // Hide all particle systems initially
        Object.values(this.particleSystems).forEach(system => {
            system.visible = false;
            this.scene.add(system);
        });
    }
    
    /**
     * Create a particle system with specified parameters
     * @param {string} name - Name of the particle system
     * @param {number} count - Number of particles
     * @param {THREE.Material} material - Material for particles
     * @param {Object} params - Parameters for the particle system
     */
    createParticleSystem(name, count, material, params) {
        // Create geometry with custom attributes
        const geometry = new THREE.BufferGeometry();
        
        // Positions (initialized at origin, will be updated during emission)
        const positions = new Float32Array(count * 3);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        // Velocities (stored in userData for physics simulation)
        const velocities = new Float32Array(count * 3);
        
        // Sizes
        const sizes = new Float32Array(count);
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Colors
        const colors = new Float32Array(count * 3);
        geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
        
        // Alpha values
        const alphas = new Float32Array(count);
        geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
        
        // Lifetimes and ages (stored in userData)
        const lifetimes = new Float32Array(count);
        const ages = new Float32Array(count);
        
        // Initialize all particles as inactive
        for (let i = 0; i < count; i++) {
            positions[i * 3] = 0;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = 0;
            
            velocities[i * 3] = 0;
            velocities[i * 3 + 1] = 0;
            velocities[i * 3 + 2] = 0;
            
            sizes[i] = 0;
            
            colors[i * 3] = params.color.r;
            colors[i * 3 + 1] = params.color.g;
            colors[i * 3 + 2] = params.color.b;
            
            alphas[i] = 0;
            
            lifetimes[i] = 0;
            ages[i] = 0;
        }
        
        // Update material uniforms
        material.uniforms.particleTexture.value = params.texture;
        material.uniforms.pixelColor.value = params.color;
        
        // Create particle system
        const particleSystem = new THREE.Points(geometry, material);
        particleSystem.frustumCulled = false; // Prevent particles from disappearing at screen edges
        
        // Store parameters and additional data in userData
        particleSystem.userData = {
            params: params,
            velocities: velocities,
            lifetimes: lifetimes,
            ages: ages,
            activeParticles: 0,
            nextEmissionTime: 0
        };
        
        // Store in particle systems map
        this.particleSystems[name] = particleSystem;
        
        return particleSystem;
    }
    
    /**
     * Initialize physics simulation
     */
    initializePhysicsSimulation() {
        // Create physics world
        this.physicsWorld = {
            gravity: this.gravity,
            airResistance: this.airResistance,
            objects: this.physicsObjects,
            forces: [],
            constraints: []
        };
        
        // Add global forces
        this.addForce('gravity', (object, dt) => {
            return this.physicsWorld.gravity.clone().multiplyScalar(object.mass);
        });
        
        // Add global constraints
        this.addConstraint('boundary', (object) => {
            // Keep objects within a boundary
            const boundary = 10;
            let position = object.position;
            
            if (Math.abs(position.x) > boundary) {
                position.x = Math.sign(position.x) * boundary;
                object.velocity.x *= -0.8; // Bounce with energy loss
            }
            
            if (Math.abs(position.y) > boundary) {
                position.y = Math.sign(position.y) * boundary;
                object.velocity.y *= -0.8; // Bounce with energy loss
            }
            
            if (Math.abs(position.z) > boundary) {
                position.z = Math.sign(position.z) * boundary;
                object.velocity.z *= -0.8; // Bounce with energy loss
            }
        });
    }
    
    /**
     * Add a force to the physics simulation
     * @param {string} name - Name of the force
     * @param {Function} forceFn - Function that calculates the force
     */
    addForce(name, forceFn) {
        this.physicsWorld.forces.push({
            name: name,
            apply: forceFn
        });
    }
    
    /**
     * Add a constraint to the physics simulation
     * @param {string} name - Name of the constraint
     * @param {Function} constraintFn - Function that applies the constraint
     */
    addConstraint(name, constraintFn) {
        this.physicsWorld.constraints.push({
            name: name,
            apply: constraintFn
        });
    }
    
    /**
     * Create a physics object
     * @param {THREE.Object3D} object - Three.js object to add physics to
     * @param {Object} params - Physics parameters
     * @returns {Object} Physics object
     */
    createPhysicsObject(object, params = {}) {
        const physicsObject = {
            object: object,
            position: object.position,
            velocity: new THREE.Vector3(),
            acceleration: new THREE.Vector3(),
            mass: params.mass || 1.0,
            restitution: params.restitution || 0.8,
            friction: params.friction || 0.1,
            isStatic: params.isStatic || false,
            collider: params.collider || {
                type: 'sphere',
                radius: 1.0
            }
        };
        
        this.physicsObjects.push(physicsObject);
        return physicsObject;
    }
    
    /**
     * Initialize procedural animation
     */
    initializeProceduralAnimation() {
        // Create animation sequences for each emotional state
        this.createAnimationSequence('joy', [
            { name: 'pulse', duration: 1.0, easing: 'easeInOutQuad', params: { scale: 1.2, frequency: 2.0 } },
            { name: 'rotate', duration: 2.0, easing: 'easeInOutSine', params: { axis: 'y', angle: Math.PI * 2 } },
            { name: 'pulse', duration: 1.0, easing: 'easeInOutQuad', params: { scale: 0.9, frequency: 2.0 } }
        ]);
        
        this.createAnimationSequence('reflective', [
            { name: 'sway', duration: 3.0, easing: 'easeInOutSine', params: { axis: 'z', angle: Math.PI / 8, frequency: 0.5 } },
            { name: 'pulse', duration: 2.0, easing: 'easeInOutQuad', params: { scale: 1.1, frequency: 0.5 } },
            { name: 'sway', duration: 3.0, easing: 'easeInOutSine', params: { axis: 'x', angle: Math.PI / 10, frequency: 0.5 } }
        ]);
        
        this.createAnimationSequence('curious', [
            { name: 'tilt', duration: 1.0, easing: 'easeOutBack', params: { axis: 'z', angle: Math.PI / 12 } },
            { name: 'rotate', duration: 1.5, easing: 'easeInOutQuad', params: { axis: 'y', angle: Math.PI / 2 } },
            { name: 'tilt', duration: 1.0, easing: 'easeInOutQuad', params: { axis: 'x', angle: -Math.PI / 12 } },
            { name: 'rotate', duration: 1.5, easing: 'easeInOutQuad', params: { axis: 'y', angle: -Math.PI / 2 } }
        ]);
        
        this.createAnimationSequence('excited', [
            { name: 'bounce', duration: 0.5, easing: 'easeOutBack', params: { height: 0.5, frequency: 3.0 } },
            { name: 'shake', duration: 0.8, easing: 'easeInOutQuad', params: { intensity: 0.2, frequency: 4.0 } },
            { name: 'rotate', duration: 1.0, easing: 'easeInOutQuad', params: { axis: 'y', angle: Math.PI * 2 } },
            { name: 'bounce', duration: 0.5, easing: 'easeOutBack', params: { height: 0.5, frequency: 3.0 } }
        ]);
        
        this.createAnimationSequence('empathetic', [
            { name: 'pulse', duration: 2.0, easing: 'easeInOutQuad', params: { scale: 1.15, frequency: 0.5 } },
            { name: 'sway', duration: 3.0, easing: 'easeInOutSine', params: { axis: 'z', angle: Math.PI / 16, frequency: 0.3 } },
            { name: 'pulse', duration: 2.0, easing: 'easeInOutQuad', params: { scale: 0.95, frequency: 0.5 } }
        ]);
        
        this.createAnimationSequence('calm', [
            { name: 'float', duration: 4.0, easing: 'easeInOutSine', params: { height: 0.2, frequency: 0.25 } },
            { name: 'rotate', duration: 6.0, easing: 'easeInOutSine', params: { axis: 'y', angle: Math.PI / 2 } },
            { name: 'float', duration: 4.0, easing: 'easeInOutSine', params: { height: 0.2, frequency: 0.25 } }
        ]);
        
        this.createAnimationSequence('neutral', [
            { name: 'float', duration: 3.0, easing: 'easeInOutSine', params: { height: 0.1, frequency: 0.3 } },
            { name: 'rotate', duration: 5.0, easing: 'easeInOutSine', params: { axis: 'y', angle: Math.PI / 4 } },
            { name: 'float', duration: 3.0, easing: 'easeInOutSine', params: { height: 0.1, frequency: 0.3 } }
        ]);
    }
    
    /**
     * Create an animation sequence
     * @param {string} name - Name of the animation sequence
     * @param {Array} steps - Array of animation steps
     */
    createAnimationSequence(name, steps) {
        // Calculate total duration
        let totalDuration = 0;
        steps.forEach(step => {
            totalDuration += step.duration;
        });
        
        // Store animation sequence
        this.animationSequences[name] = {
            steps: steps,
            totalDuration: totalDuration,
            currentStep: 0,
            stepTime: 0
        };
    }
    
    /**
     * Set the current emotional state
     * @param {string} state - Emotional state
     * @param {number} intensity - Intensity of the emotion (0.0 to 1.0)
     */
    setEmotionalState(state, intensity = 0.5) {
        // Validate state
        if (!this.particleSystems[state]) {
            console.warn(`Unknown emotional state: ${state}`);
            state = 'neutral';
        }
        
        // Clamp intensity
        intensity = Math.max(0.0, Math.min(1.0, intensity));
        
        // Update state
        this.currentState = state;
        this.emotionalIntensity = intensity;
        
        // Update active particle system
        Object.keys(this.particleSystems).forEach(key => {
            this.particleSystems[key].visible = (key === state);
        });
        
        // Set current animation sequence
        this.currentSequence = this.animationSequences[state];
        this.sequenceTime = 0;
        
        // Publish state change event
        window.eventSystem.publish('animation-state-changed', {
            state: state,
            intensity: intensity
        });
        
        console.log(`Animation state set to ${state} (${intensity})`);
    }
    
    /**
     * Handle user interaction with the animation system
     * @param {string} type - Type of interaction
     * @param {Object} position - Position of interaction
     */
    handleUserInteraction(type, position) {
        if (type === 'click') {
            // Create a burst of particles at the click position
            this.createParticleBurst(position, 20, {
                color: new THREE.Color(0xffffff),
                size: { min: 0.05, max: 0.2 },
                speed: { min: 0.5, max: 1.5 },
                lifetime: { min: 0.5, max: 1.5 }
            });
        } else if (type === 'hover') {
            // Create a small emission of particles at the hover position
            this.createParticleBurst(position, 5, {
                color: new THREE.Color(0xcccccc),
                size: { min: 0.03, max: 0.1 },
                speed: { min: 0.2, max: 0.8 },
                lifetime: { min: 0.3, max: 1.0 }
            });
        }
    }
    
    /**
     * Create a burst of particles at a specific position
     * @param {THREE.Vector3} position - Position for the burst
     * @param {number} count - Number of particles to emit
     * @param {Object} params - Parameters for the particles
     */
    createParticleBurst(position, count, params) {
        // Use the current particle system
        const system = this.particleSystems[this.currentState];
        if (!system) return;
        
        const geometry = system.geometry;
        const userData = system.userData;
        
        // Get attribute buffers
        const positions = geometry.attributes.position.array;
        const sizes = geometry.attributes.size.array;
        const colors = geometry.attributes.customColor.array;
        const alphas = geometry.attributes.alpha.array;
        
        // Get userData arrays
        const velocities = userData.velocities;
        const lifetimes = userData.lifetimes;
        const ages = userData.ages;
        
        // Find inactive particles
        let emitted = 0;
        for (let i = 0; i < positions.length / 3 && emitted < count; i++) {
            if (ages[i] >= lifetimes[i]) {
                // This particle is inactive, reactivate it
                
                // Position
                positions[i * 3] = position.x;
                positions[i * 3 + 1] = position.y;
                positions[i * 3 + 2] = position.z;
                
                // Velocity (random direction)
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI;
                const speed = params.speed.min + Math.random() * (params.speed.max - params.speed.min);
                
                velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
                velocities[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
                velocities[i * 3 + 2] = Math.cos(phi) * speed;
                
                // Size
                sizes[i] = params.size.min + Math.random() * (params.size.max - params.size.min);
                
                // Color
                colors[i * 3] = params.color.r;
                colors[i * 3 + 1] = params.color.g;
                colors[i * 3 + 2] = params.color.b;
                
                // Alpha
                alphas[i] = 1.0;
                
                // Lifetime
                lifetimes[i] = params.lifetime.min + Math.random() * (params.lifetime.max - params.lifetime.min);
                ages[i] = 0;
                
                emitted++;
            }
        }
        
        // Update buffers
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.size.needsUpdate = true;
        geometry.attributes.customColor.needsUpdate = true;
        geometry.attributes.alpha.needsUpdate = true;
        
        // Ensure the particle system is visible
        system.visible = true;
    }
    
    /**
     * Emit particles from the current particle system
     * @param {number} deltaTime - Time since last frame
     */
    emitParticles(deltaTime) {
        // Get current particle system
        const system = this.particleSystems[this.currentState];
        if (!system) return;
        
        const userData = system.userData;
        const params = userData.params;
        
        // Check if it's time to emit particles
        userData.nextEmissionTime -= deltaTime;
        if (userData.nextEmissionTime <= 0) {
            // Calculate number of particles to emit based on emission rate and intensity
            const emissionRate = params.emissionRate * this.emotionalIntensity;
            const particlesToEmit = Math.floor(emissionRate);
            
            // Emit particles
            this.emitParticlesFromSystem(system, particlesToEmit);
            
            // Reset emission timer
            userData.nextEmissionTime = 1.0 / emissionRate;
        }
    }
    
    /**
     * Emit particles from a specific particle system
     * @param {THREE.Points} system - Particle system
     * @param {number} count - Number of particles to emit
     */
    emitParticlesFromSystem(system, count) {
        const geometry = system.geometry;
        const userData = system.userData;
        const params = userData.params;
        
        // Get attribute buffers
        const positions = geometry.attributes.position.array;
        const sizes = geometry.attributes.size.array;
        const colors = geometry.attributes.customColor.array;
        const alphas = geometry.attributes.alpha.array;
        
        // Get userData arrays
        const velocities = userData.velocities;
        const lifetimes = userData.lifetimes;
        const ages = userData.ages;
        
        // Find inactive particles
        let emitted = 0;
        for (let i = 0; i < positions.length / 3 && emitted < count; i++) {
            if (ages[i] >= lifetimes[i]) {
                // This particle is inactive, reactivate it
                
                // Position based on emission shape
                let position = new THREE.Vector3();
                
                switch (params.emissionShape) {
                    case 'point':
                        position.set(0, 0, 0);
                        break;
                        
                    case 'sphere':
                        const theta = Math.random() * Math.PI * 2;
                        const phi = Math.random() * Math.PI;
                        const radius = params.emissionRadius * Math.random();
                        
                        position.x = Math.sin(phi) * Math.cos(theta) * radius;
                        position.y = Math.sin(phi) * Math.sin(theta) * radius;
                        position.z = Math.cos(phi) * radius;
                        break;
                        
                    case 'hemisphere':
                        const theta2 = Math.random() * Math.PI * 2;
                        const phi2 = Math.random() * Math.PI / 2;
                        const radius2 = params.emissionRadius * Math.random();
                        
                        position.x = Math.sin(phi2) * Math.cos(theta2) * radius2;
                        position.y = Math.sin(phi2) * Math.sin(theta2) * radius2;
                        position.z = Math.cos(phi2) * radius2;
                        break;
                        
                    case 'cone':
                        const theta3 = Math.random() * Math.PI * 2;
                        const radius3 = params.emissionRadius * Math.random();
                        const height = radius3 * Math.tan(params.emissionAngle);
                        
                        position.x = Math.cos(theta3) * radius3;
                        position.y = Math.sin(theta3) * radius3;
                        position.z = height;
                        break;
                        
                    case 'plane':
                        position.x = (Math.random() - 0.5) * params.emissionSize.width;
                        position.y = (Math.random() - 0.5) * params.emissionSize.height;
                        position.z = 0;
                        break;
                        
                    case 'torus':
                        const theta4 = Math.random() * Math.PI * 2;
                        const phi4 = Math.random() * Math.PI * 2;
                        const radius4 = params.emissionRadius;
                        const tubeRadius = params.emissionThickness;
                        
                        position.x = (radius4 + tubeRadius * Math.cos(phi4)) * Math.cos(theta4);
                        position.y = (radius4 + tubeRadius * Math.cos(phi4)) * Math.sin(theta4);
                        position.z = tubeRadius * Math.sin(phi4);
                        break;
                        
                    case 'burst':
                        const theta5 = Math.random() * Math.PI * 2;
                        const phi5 = Math.random() * Math.PI;
                        const radius5 = params.emissionRadius * 0.1; // Start close to center
                        
                        position.x = Math.sin(phi5) * Math.cos(theta5) * radius5;
                        position.y = Math.sin(phi5) * Math.sin(theta5) * radius5;
                        position.z = Math.cos(phi5) * radius5;
                        break;
                }
                
                // Apply position
                positions[i * 3] = position.x;
                positions[i * 3 + 1] = position.y;
                positions[i * 3 + 2] = position.z;
                
                // Velocity (based on emission shape)
                let velocity = new THREE.Vector3();
                
                switch (params.emissionShape) {
                    case 'burst':
                        // Burst particles move outward from center
                        velocity.copy(position).normalize();
                        break;
                        
                    case 'cone':
                        // Cone particles move along cone axis with some spread
                        velocity.set(0, 0, 1);
                        velocity.applyAxisAngle(new THREE.Vector3(1, 0, 0), (Math.random() - 0.5) * params.emissionAngle * 0.5);
                        velocity.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * Math.PI * 2);
                        break;
                        
                    default:
                        // Random direction with turbulence
                        const theta = Math.random() * Math.PI * 2;
                        const phi = Math.random() * Math.PI;
                        
                        velocity.x = Math.sin(phi) * Math.cos(theta);
                        velocity.y = Math.sin(phi) * Math.sin(theta);
                        velocity.z = Math.cos(phi);
                }
                
                // Apply speed
                const speed = params.speed.min + Math.random() * (params.speed.max - params.speed.min);
                velocity.multiplyScalar(speed);
                
                // Store velocity
                velocities[i * 3] = velocity.x;
                velocities[i * 3 + 1] = velocity.y;
                velocities[i * 3 + 2] = velocity.z;
                
                // Size
                sizes[i] = params.size.min + Math.random() * (params.size.max - params.size.min);
                
                // Alpha
                alphas[i] = 1.0;
                
                // Lifetime
                lifetimes[i] = params.lifetime.min + Math.random() * (params.lifetime.max - params.lifetime.min);
                ages[i] = 0;
                
                emitted++;
            }
        }
        
        // Update buffers
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.size.needsUpdate = true;
        geometry.attributes.alpha.needsUpdate = true;
    }
    
    /**
     * Update particle systems
     * @param {number} deltaTime - Time since last frame
     */
    updateParticles(deltaTime) {
        // Update all particle systems
        Object.keys(this.particleSystems).forEach(key => {
            const system = this.particleSystems[key];
            if (!system.visible) return;
            
            const geometry = system.geometry;
            const userData = system.userData;
            const params = userData.params;
            
            // Get attribute buffers
            const positions = geometry.attributes.position.array;
            const sizes = geometry.attributes.size.array;
            const alphas = geometry.attributes.alpha.array;
            
            // Get userData arrays
            const velocities = userData.velocities;
            const lifetimes = userData.lifetimes;
            const ages = userData.ages;
            
            // Update time uniform for shader
            system.material.uniforms.time.value += deltaTime;
            
            // Update particles
            let activeCount = 0;
            
            for (let i = 0; i < positions.length / 3; i++) {
                // Skip inactive particles
                if (ages[i] >= lifetimes[i]) continue;
                
                // Update age
                ages[i] += deltaTime;
                
                // Calculate life progress (0 to 1)
                const lifeProgress = Math.min(ages[i] / lifetimes[i], 1.0);
                
                // Update position based on velocity
                positions[i * 3] += velocities[i * 3] * deltaTime;
                positions[i * 3 + 1] += velocities[i * 3 + 1] * deltaTime;
                positions[i * 3 + 2] += velocities[i * 3 + 2] * deltaTime;
                
                // Apply turbulence
                const turbulence = params.turbulence * this.emotionalIntensity;
                const turbFactor = Math.sin(ages[i] * 5.0) * turbulence * deltaTime;
                
                velocities[i * 3] += (Math.random() - 0.5) * turbFactor;
                velocities[i * 3 + 1] += (Math.random() - 0.5) * turbFactor;
                velocities[i * 3 + 2] += (Math.random() - 0.5) * turbFactor;
                
                // Apply gravity and air resistance
                velocities[i * 3 + 1] -= 0.1 * deltaTime; // Gravity
                velocities[i * 3] *= 0.99; // Air resistance
                velocities[i * 3 + 1] *= 0.99;
                velocities[i * 3 + 2] *= 0.99;
                
                // Update alpha based on life progress
                // Fade in quickly, then fade out slowly
                let alpha;
                if (lifeProgress < 0.1) {
                    // Fade in
                    alpha = lifeProgress / 0.1;
                } else if (lifeProgress > 0.7) {
                    // Fade out
                    alpha = 1.0 - ((lifeProgress - 0.7) / 0.3);
                } else {
                    // Full opacity
                    alpha = 1.0;
                }
                
                alphas[i] = alpha;
                
                // Count active particles
                activeCount++;
            }
            
            // Update buffers
            geometry.attributes.position.needsUpdate = true;
            geometry.attributes.alpha.needsUpdate = true;
            
            // Store active count
            userData.activeParticles = activeCount;
        });
    }
    
    /**
     * Update physics simulation
     * @param {number} deltaTime - Time since last frame
     */
    updatePhysics(deltaTime) {
        // Apply forces to all physics objects
        this.physicsObjects.forEach(object => {
            if (object.isStatic) return;
            
            // Reset acceleration
            object.acceleration.set(0, 0, 0);
            
            // Apply forces
            this.physicsWorld.forces.forEach(force => {
                const forceVector = force.apply(object, deltaTime);
                object.acceleration.add(forceVector.divideScalar(object.mass));
            });
            
            // Update velocity
            object.velocity.add(object.acceleration.clone().multiplyScalar(deltaTime));
            
            // Apply air resistance
            object.velocity.multiplyScalar(this.physicsWorld.airResistance);
            
            // Update position
            object.position.add(object.velocity.clone().multiplyScalar(deltaTime));
            
            // Apply constraints
            this.physicsWorld.constraints.forEach(constraint => {
                constraint.apply(object);
            });
        });
    }
    
    /**
     * Update procedural animation
     * @param {number} deltaTime - Time since last frame
     */
    updateProceduralAnimation(deltaTime) {
        if (!this.currentSequence) return;
        
        // Update sequence time
        this.sequenceTime += deltaTime;
        if (this.sequenceTime > this.currentSequence.totalDuration) {
            // Loop animation
            this.sequenceTime %= this.currentSequence.totalDuration;
        }
        
        // Find current step
        let currentTime = 0;
        let currentStep = null;
        let stepProgress = 0;
        
        for (let i = 0; i < this.currentSequence.steps.length; i++) {
            const step = this.currentSequence.steps[i];
            
            if (this.sequenceTime >= currentTime && this.sequenceTime < currentTime + step.duration) {
                currentStep = step;
                stepProgress = (this.sequenceTime - currentTime) / step.duration;
                break;
            }
            
            currentTime += step.duration;
        }
        
        // Apply current animation step
        if (currentStep) {
            // Apply easing function
            const easedProgress = this.applyEasing(stepProgress, currentStep.easing);
            
            // Apply animation based on type
            switch (currentStep.name) {
                case 'pulse':
                    this.applyPulseAnimation(easedProgress, currentStep.params);
                    break;
                    
                case 'rotate':
                    this.applyRotateAnimation(easedProgress, currentStep.params);
                    break;
                    
                case 'sway':
                    this.applySwayAnimation(easedProgress, currentStep.params);
                    break;
                    
                case 'tilt':
                    this.applyTiltAnimation(easedProgress, currentStep.params);
                    break;
                    
                case 'bounce':
                    this.applyBounceAnimation(easedProgress, currentStep.params);
                    break;
                    
                case 'shake':
                    this.applyShakeAnimation(easedProgress, currentStep.params);
                    break;
                    
                case 'float':
                    this.applyFloatAnimation(easedProgress, currentStep.params);
                    break;
            }
        }
    }
    
    /**
     * Apply easing function to animation progress
     * @param {number} t - Linear progress (0 to 1)
     * @param {string} easingName - Name of easing function
     * @returns {number} Eased progress
     */
    applyEasing(t, easingName) {
        switch (easingName) {
            case 'linear':
                return t;
                
            case 'easeInQuad':
                return t * t;
                
            case 'easeOutQuad':
                return t * (2 - t);
                
            case 'easeInOutQuad':
                return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                
            case 'easeInCubic':
                return t * t * t;
                
            case 'easeOutCubic':
                return (--t) * t * t + 1;
                
            case 'easeInOutCubic':
                return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
                
            case 'easeInSine':
                return 1 - Math.cos(t * Math.PI / 2);
                
            case 'easeOutSine':
                return Math.sin(t * Math.PI / 2);
                
            case 'easeInOutSine':
                return -(Math.cos(Math.PI * t) - 1) / 2;
                
            case 'easeOutBack':
                const c1 = 1.70158;
                const c3 = c1 + 1;
                return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
                
            default:
                return t;
        }
    }
    
    /**
     * Apply pulse animation to current model
     * @param {number} progress - Animation progress (0 to 1)
     * @param {Object} params - Animation parameters
     */
    applyPulseAnimation(progress, params) {
        // Get current model
        const model = this.particleSystems[this.currentState];
        if (!model) return;
        
        // Calculate scale based on sine wave
        const frequency = params.frequency || 1.0;
        const scale = 1.0 + (params.scale - 1.0) * Math.sin(progress * Math.PI * 2 * frequency);
        
        // Apply scale
        model.scale.set(scale, scale, scale);
    }
    
    /**
     * Apply rotation animation to current model
     * @param {number} progress - Animation progress (0 to 1)
     * @param {Object} params - Animation parameters
     */
    applyRotateAnimation(progress, params) {
        // Get current model
        const model = this.particleSystems[this.currentState];
        if (!model) return;
        
        // Calculate rotation angle
        const angle = params.angle * progress;
        
        // Apply rotation based on axis
        switch (params.axis) {
            case 'x':
                model.rotation.x = angle;
                break;
                
            case 'y':
                model.rotation.y = angle;
                break;
                
            case 'z':
                model.rotation.z = angle;
                break;
        }
    }
    
    /**
     * Apply sway animation to current model
     * @param {number} progress - Animation progress (0 to 1)
     * @param {Object} params - Animation parameters
     */
    applySwayAnimation(progress, params) {
        // Get current model
        const model = this.particleSystems[this.currentState];
        if (!model) return;
        
        // Calculate sway angle based on sine wave
        const frequency = params.frequency || 1.0;
        const angle = params.angle * Math.sin(progress * Math.PI * 2 * frequency);
        
        // Apply rotation based on axis
        switch (params.axis) {
            case 'x':
                model.rotation.x = angle;
                break;
                
            case 'y':
                model.rotation.y = angle;
                break;
                
            case 'z':
                model.rotation.z = angle;
                break;
        }
    }
    
    /**
     * Apply tilt animation to current model
     * @param {number} progress - Animation progress (0 to 1)
     * @param {Object} params - Animation parameters
     */
    applyTiltAnimation(progress, params) {
        // Get current model
        const model = this.particleSystems[this.currentState];
        if (!model) return;
        
        // Calculate tilt angle
        const angle = params.angle * progress;
        
        // Apply rotation based on axis
        switch (params.axis) {
            case 'x':
                model.rotation.x = angle;
                break;
                
            case 'y':
                model.rotation.y = angle;
                break;
                
            case 'z':
                model.rotation.z = angle;
                break;
        }
    }
    
    /**
     * Apply bounce animation to current model
     * @param {number} progress - Animation progress (0 to 1)
     * @param {Object} params - Animation parameters
     */
    applyBounceAnimation(progress, params) {
        // Get current model
        const model = this.particleSystems[this.currentState];
        if (!model) return;
        
        // Calculate bounce height based on absolute sine wave
        const frequency = params.frequency || 1.0;
        const height = params.height * Math.abs(Math.sin(progress * Math.PI * 2 * frequency));
        
        // Apply position
        model.position.y = height;
    }
    
    /**
     * Apply shake animation to current model
     * @param {number} progress - Animation progress (0 to 1)
     * @param {Object} params - Animation parameters
     */
    applyShakeAnimation(progress, params) {
        // Get current model
        const model = this.particleSystems[this.currentState];
        if (!model) return;
        
        // Calculate shake intensity
        const intensity = params.intensity * (1 - progress); // Fade out
        const frequency = params.frequency || 1.0;
        
        // Apply random position offset
        model.position.x = (Math.random() - 0.5) * 2 * intensity * Math.sin(progress * Math.PI * 2 * frequency);
        model.position.y = (Math.random() - 0.5) * 2 * intensity * Math.sin(progress * Math.PI * 2 * frequency);
        model.position.z = (Math.random() - 0.5) * 2 * intensity * Math.sin(progress * Math.PI * 2 * frequency);
    }
    
    /**
     * Apply float animation to current model
     * @param {number} progress - Animation progress (0 to 1)
     * @param {Object} params - Animation parameters
     */
    applyFloatAnimation(progress, params) {
        // Get current model
        const model = this.particleSystems[this.currentState];
        if (!model) return;
        
        // Calculate float height based on sine wave
        const frequency = params.frequency || 1.0;
        const height = params.height * Math.sin(progress * Math.PI * 2 * frequency);
        
        // Apply position
        model.position.y = height;
    }
    
    /**
     * Adjust quality settings based on performance
     * @param {string} quality - Quality level (low, medium, high)
     * @param {Object} settings - Quality settings
     */
    adjustQuality(quality, settings) {
        // Adjust particle count based on quality
        Object.keys(this.particleSystems).forEach(key => {
            const system = this.particleSystems[key];
            const userData = system.userData;
            
            // Adjust emission rate based on quality
            userData.params.emissionRate = userData.params.emissionRate * (settings.particleCount / 300);
        });
        
        console.log(`Animation quality adjusted to ${quality}`);
    }
    
    /**
     * Main animation loop
     */
    animate() {
        if (!this.isActive) return;
        
        // Request next frame
        requestAnimationFrame(() => this.animate());
        
        // Calculate delta time
        const deltaTime = this.clock.getDelta();
        
        // Update performance metrics
        this.updatePerformanceMetrics();
        
        // Emit particles
        this.emitParticles(deltaTime);
        
        // Update particles
        this.updateParticles(deltaTime);
        
        // Update physics
        this.updatePhysics(deltaTime);
        
        // Update procedural animation
        this.updateProceduralAnimation(deltaTime);
    }
    
    /**
     * Update performance metrics
     */
    updatePerformanceMetrics() {
        const now = performance.now();
        this.frameCount++;
        
        // Update FPS every interval
        if (now - this.lastFpsUpdate > this.fpsUpdateInterval) {
            this.fps = (this.frameCount * 1000) / (now - this.lastFpsUpdate);
            this.frameCount = 0;
            this.lastFpsUpdate = now;
            
            // Publish performance metrics
            window.eventSystem.publish('animation-performance', {
                fps: this.fps,
                particleCount: this.getActiveParticleCount()
            });
        }
    }
    
    /**
     * Get the total number of active particles
     * @returns {number} Active particle count
     */
    getActiveParticleCount() {
        let count = 0;
        Object.values(this.particleSystems).forEach(system => {
            count += system.userData.activeParticles;
        });
        return count;
    }
    
    /**
     * Get current FPS
     * @returns {number} Current FPS
     */
    getFPS() {
        return this.fps;
    }
    
    /**
     * Dispose of all resources
     */
    dispose() {
        this.isActive = false;
        
        // Dispose of particle systems
        Object.values(this.particleSystems).forEach(system => {
            system.geometry.dispose();
            system.material.dispose();
            if (system.material.uniforms.particleTexture.value) {
                system.material.uniforms.particleTexture.value.dispose();
            }
            this.scene.remove(system);
        });
        
        this.particleSystems = {};
        this.physicsObjects = [];
        
        console.log('Advanced Animation System disposed');
    }
}

export default new AdvancedAnimationSystem();
