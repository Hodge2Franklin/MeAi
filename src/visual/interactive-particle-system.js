/**
 * Interactive Particle System
 * 
 * This module enhances the particle system with advanced user interaction capabilities,
 * allowing particles to respond to user input in natural and engaging ways.
 */

import * as THREE from 'three';
import EnhancedPhysicsSystem from './enhanced-physics-system.js';
import ProceduralAnimationGenerator from './procedural-animation-generator.js';

class InteractiveParticleSystem {
    constructor() {
        // Core components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
        // Particle systems
        this.particleEmitters = [];
        this.interactionEmitters = [];
        
        // Interaction state
        this.mousePosition = new THREE.Vector2();
        this.normalizedMousePosition = new THREE.Vector2();
        this.worldMousePosition = new THREE.Vector3();
        this.isMouseDown = false;
        this.touchPositions = [];
        this.lastInteractionTime = 0;
        this.interactionIntensity = 0;
        
        // Audio analysis for particle reactivity
        this.audioAnalyzer = null;
        this.audioReactivity = {
            enabled: true,
            intensityFactor: 1.0,
            frequencyRanges: [
                { name: 'bass', min: 20, max: 150, influence: 1.0 },
                { name: 'midrange', min: 150, max: 2000, influence: 0.7 },
                { name: 'treble', min: 2000, max: 16000, influence: 0.5 }
            ],
            levels: {
                bass: 0,
                midrange: 0,
                treble: 0,
                overall: 0
            },
            history: []
        };
        
        // Emotional state
        this.currentState = 'neutral';
        this.emotionalIntensity = 0.5;
        
        // Configuration
        this.config = {
            maxParticles: 5000,
            maxEmitters: 10,
            interactionRadius: 2.0,
            interactionStrength: 1.0,
            interactionDecay: 0.95,
            mouseTrailEnabled: true,
            mouseTrailDensity: 0.5,
            touchEffectsEnabled: true,
            touchEffectSize: 1.0,
            audioReactivityEnabled: true,
            audioReactivityStrength: 1.0,
            emotionalInfluence: 0.8,
            performanceAdaptive: true,
            qualityLevel: 'high'
        };
        
        // Performance monitoring
        this.performance = {
            lastUpdateTime: 0,
            frameCount: 0,
            fps: 0,
            particleCount: 0,
            updateTimeAvg: 0,
            lastFpsUpdate: 0
        };
        
        // Initialize event listeners
        this.setupEventListeners();
    }
    
    /**
     * Initialize the interactive particle system
     * @param {THREE.Scene} scene - Three.js scene
     * @param {THREE.Camera} camera - Three.js camera
     * @param {THREE.WebGLRenderer} renderer - Three.js renderer
     */
    init(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        
        // Create default particle emitters
        this.createDefaultEmitters();
        
        // Initialize audio analyzer if Web Audio API is available
        this.initAudioAnalyzer();
        
        console.log('Interactive Particle System initialized');
    }
    
    /**
     * Set up event listeners for user interaction
     */
    setupEventListeners() {
        // Listen for emotional state changes
        window.eventSystem.subscribe('emotional-state-changed', (data) => {
            this.setEmotionalState(data.state, data.intensity || 0.5);
        });
        
        // Listen for audio data
        window.eventSystem.subscribe('audio-data', (data) => {
            this.processAudioData(data);
        });
        
        // Listen for quality setting changes
        window.eventSystem.subscribe('quality-changed', (data) => {
            this.setQualityLevel(data.quality);
        });
        
        // Listen for configuration changes
        window.eventSystem.subscribe('particle-config-changed', (data) => {
            this.updateConfig(data);
        });
        
        // Add DOM event listeners when initialized
        window.eventSystem.subscribe('visualization-integration-initialized', () => {
            this.addDOMEventListeners();
        });
    }
    
    /**
     * Add DOM event listeners for mouse and touch interaction
     */
    addDOMEventListeners() {
        if (!this.renderer || !this.renderer.domElement) return;
        
        const canvas = this.renderer.domElement;
        
        // Mouse events
        canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        
        // Touch events
        canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
        canvas.addEventListener('touchcancel', this.handleTouchEnd.bind(this));
        
        // Window resize
        window.addEventListener('resize', this.handleResize.bind(this));
        
        console.log('DOM event listeners added for interactive particles');
    }
    
    /**
     * Handle mouse move event
     * @param {MouseEvent} event - Mouse event
     */
    handleMouseMove(event) {
        // Update mouse position
        this.mousePosition.x = event.clientX;
        this.mousePosition.y = event.clientY;
        
        // Calculate normalized position (-1 to 1)
        this.normalizedMousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.normalizedMousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Update world position
        this.updateWorldMousePosition();
        
        // Create mouse trail particles if enabled
        if (this.config.mouseTrailEnabled && this.isMouseDown) {
            this.createMouseTrailParticles();
        }
        
        // Increase interaction intensity
        this.interactionIntensity = Math.min(1.0, this.interactionIntensity + 0.1);
        this.lastInteractionTime = Date.now();
        
        // Publish interaction event
        window.eventSystem.publish('user-interaction', {
            type: 'mousemove',
            position: this.worldMousePosition.clone(),
            intensity: this.interactionIntensity
        });
    }
    
    /**
     * Handle mouse down event
     * @param {MouseEvent} event - Mouse event
     */
    handleMouseDown(event) {
        this.isMouseDown = true;
        
        // Update mouse position
        this.mousePosition.x = event.clientX;
        this.mousePosition.y = event.clientY;
        
        // Calculate normalized position (-1 to 1)
        this.normalizedMousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.normalizedMousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Update world position
        this.updateWorldMousePosition();
        
        // Create click effect
        this.createClickEffect();
        
        // Set interaction intensity to maximum
        this.interactionIntensity = 1.0;
        this.lastInteractionTime = Date.now();
        
        // Publish interaction event
        window.eventSystem.publish('user-interaction', {
            type: 'mousedown',
            position: this.worldMousePosition.clone(),
            intensity: this.interactionIntensity
        });
    }
    
    /**
     * Handle mouse up event
     * @param {MouseEvent} event - Mouse event
     */
    handleMouseUp(event) {
        this.isMouseDown = false;
        
        // Update mouse position
        this.mousePosition.x = event.clientX;
        this.mousePosition.y = event.clientY;
        
        // Calculate normalized position (-1 to 1)
        this.normalizedMousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.normalizedMousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Update world position
        this.updateWorldMousePosition();
        
        // Gradually decrease interaction intensity
        this.interactionIntensity *= 0.8;
        this.lastInteractionTime = Date.now();
        
        // Publish interaction event
        window.eventSystem.publish('user-interaction', {
            type: 'mouseup',
            position: this.worldMousePosition.clone(),
            intensity: this.interactionIntensity
        });
    }
    
    /**
     * Handle mouse leave event
     * @param {MouseEvent} event - Mouse event
     */
    handleMouseLeave(event) {
        this.isMouseDown = false;
        
        // Gradually decrease interaction intensity
        this.interactionIntensity *= 0.5;
        
        // Publish interaction event
        window.eventSystem.publish('user-interaction', {
            type: 'mouseleave',
            intensity: this.interactionIntensity
        });
    }
    
    /**
     * Handle touch start event
     * @param {TouchEvent} event - Touch event
     */
    handleTouchStart(event) {
        event.preventDefault();
        
        // Store touch positions
        this.touchPositions = [];
        for (let i = 0; i < event.touches.length; i++) {
            const touch = event.touches[i];
            
            // Calculate normalized position (-1 to 1)
            const normalizedX = (touch.clientX / window.innerWidth) * 2 - 1;
            const normalizedY = -(touch.clientY / window.innerHeight) * 2 + 1;
            
            // Create world position
            const worldPosition = this.getWorldPositionFromNormalized(normalizedX, normalizedY);
            
            this.touchPositions.push({
                id: touch.identifier,
                clientX: touch.clientX,
                clientY: touch.clientY,
                normalizedX: normalizedX,
                normalizedY: normalizedY,
                worldPosition: worldPosition
            });
            
            // Create touch effect
            if (this.config.touchEffectsEnabled) {
                this.createTouchEffect(worldPosition);
            }
        }
        
        // Use first touch as primary
        if (this.touchPositions.length > 0) {
            this.mousePosition.x = this.touchPositions[0].clientX;
            this.mousePosition.y = this.touchPositions[0].clientY;
            this.normalizedMousePosition.x = this.touchPositions[0].normalizedX;
            this.normalizedMousePosition.y = this.touchPositions[0].normalizedY;
            this.worldMousePosition.copy(this.touchPositions[0].worldPosition);
        }
        
        // Set interaction intensity to maximum
        this.interactionIntensity = 1.0;
        this.lastInteractionTime = Date.now();
        
        // Publish interaction event
        window.eventSystem.publish('user-interaction', {
            type: 'touchstart',
            position: this.worldMousePosition.clone(),
            touchCount: this.touchPositions.length,
            intensity: this.interactionIntensity
        });
    }
    
    /**
     * Handle touch move event
     * @param {TouchEvent} event - Touch event
     */
    handleTouchMove(event) {
        event.preventDefault();
        
        // Update touch positions
        const updatedTouchPositions = [];
        for (let i = 0; i < event.touches.length; i++) {
            const touch = event.touches[i];
            
            // Calculate normalized position (-1 to 1)
            const normalizedX = (touch.clientX / window.innerWidth) * 2 - 1;
            const normalizedY = -(touch.clientY / window.innerHeight) * 2 + 1;
            
            // Create world position
            const worldPosition = this.getWorldPositionFromNormalized(normalizedX, normalizedY);
            
            updatedTouchPositions.push({
                id: touch.identifier,
                clientX: touch.clientX,
                clientY: touch.clientY,
                normalizedX: normalizedX,
                normalizedY: normalizedY,
                worldPosition: worldPosition
            });
            
            // Create touch trail particles if enabled
            if (this.config.touchEffectsEnabled && this.config.mouseTrailEnabled) {
                this.createTouchTrailParticles(worldPosition);
            }
        }
        
        this.touchPositions = updatedTouchPositions;
        
        // Use first touch as primary
        if (this.touchPositions.length > 0) {
            this.mousePosition.x = this.touchPositions[0].clientX;
            this.mousePosition.y = this.touchPositions[0].clientY;
            this.normalizedMousePosition.x = this.touchPositions[0].normalizedX;
            this.normalizedMousePosition.y = this.touchPositions[0].normalizedY;
            this.worldMousePosition.copy(this.touchPositions[0].worldPosition);
        }
        
        // Increase interaction intensity
        this.interactionIntensity = Math.min(1.0, this.interactionIntensity + 0.05);
        this.lastInteractionTime = Date.now();
        
        // Publish interaction event
        window.eventSystem.publish('user-interaction', {
            type: 'touchmove',
            position: this.worldMousePosition.clone(),
            touchCount: this.touchPositions.length,
            intensity: this.interactionIntensity
        });
    }
    
    /**
     * Handle touch end event
     * @param {TouchEvent} event - Touch event
     */
    handleTouchEnd(event) {
        event.preventDefault();
        
        // Update touch positions
        const remainingTouches = [];
        const endedTouches = [];
        
        // Find remaining touches
        for (const storedTouch of this.touchPositions) {
            let found = false;
            
            for (let i = 0; i < event.touches.length; i++) {
                if (event.touches[i].identifier === storedTouch.id) {
                    found = true;
                    break;
                }
            }
            
            if (found) {
                remainingTouches.push(storedTouch);
            } else {
                endedTouches.push(storedTouch);
            }
        }
        
        this.touchPositions = remainingTouches;
        
        // Create end effects for ended touches
        for (const touch of endedTouches) {
            if (this.config.touchEffectsEnabled) {
                this.createTouchEndEffect(touch.worldPosition);
            }
        }
        
        // Use first remaining touch as primary, or reset if none left
        if (this.touchPositions.length > 0) {
            this.mousePosition.x = this.touchPositions[0].clientX;
            this.mousePosition.y = this.touchPositions[0].clientY;
            this.normalizedMousePosition.x = this.touchPositions[0].normalizedX;
            this.normalizedMousePosition.y = this.touchPositions[0].normalizedY;
            this.worldMousePosition.copy(this.touchPositions[0].worldPosition);
        }
        
        // Gradually decrease interaction intensity
        this.interactionIntensity *= 0.8;
        this.lastInteractionTime = Date.now();
        
        // Publish interaction event
        window.eventSystem.publish('user-interaction', {
            type: 'touchend',
            position: this.worldMousePosition.clone(),
            touchCount: this.touchPositions.length,
            intensity: this.interactionIntensity
        });
    }
    
    /**
     * Handle window resize event
     */
    handleResize() {
        // Update world mouse position
        this.updateWorldMousePosition();
    }
    
    /**
     * Update the world position of the mouse
     */
    updateWorldMousePosition() {
        // Create a ray from the camera through the mouse position
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(this.normalizedMousePosition, this.camera);
        
        // Calculate intersection with a plane at z=0
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const intersection = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, intersection);
        
        // Update world mouse position
        this.worldMousePosition.copy(intersection);
    }
    
    /**
     * Get world position from normalized screen coordinates
     * @param {number} normalizedX - Normalized X coordinate (-1 to 1)
     * @param {number} normalizedY - Normalized Y coordinate (-1 to 1)
     * @returns {THREE.Vector3} World position
     */
    getWorldPositionFromNormalized(normalizedX, normalizedY) {
        // Create a ray from the camera through the normalized position
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(normalizedX, normalizedY), this.camera);
        
        // Calculate intersection with a plane at z=0
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const intersection = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, intersection);
        
        return intersection;
    }
    
    /**
     * Create default particle emitters
     */
    createDefaultEmitters() {
        // Create ambient particle emitter
        this.createAmbientEmitter();
        
        // Create emotional state emitters
        this.createEmotionalStateEmitters();
    }
    
    /**
     * Create ambient particle emitter
     */
    createAmbientEmitter() {
        // Create ambient emitter
        const ambientEmitter = EnhancedPhysicsSystem.createParticleEmitter({
            position: new THREE.Vector3(0, 0, -5),
            direction: new THREE.Vector3(0, 1, 0),
            spread: Math.PI / 2,
            rate: 5,
            lifetime: { min: 3, max: 6 },
            speed: { min: 0.2, max: 0.5 },
            size: { min: 0.05, max: 0.15 },
            color: new THREE.Color(0x3a86ff),
            opacity: { min: 0.3, max: 0.6 },
            opacityEnd: { min: 0, max: 0 },
            emitterShape: 'sphere',
            emitterRadius: 5.0,
            drag: 0.05,
            gravity: 0.1,
            usePhysics: true,
            scene: this.scene
        });
        
        // Add to emitters list
        this.particleEmitters.push({
            emitter: ambientEmitter,
            type: 'ambient',
            active: true
        });
    }
    
    /**
     * Create emotional state emitters
     */
    createEmotionalStateEmitters() {
        // Create emitter for each emotional state
        const emotionalStates = [
            {
                name: 'joy',
                color: new THREE.Color(0xffbe0b),
                rate: 8,
                size: { min: 0.1, max: 0.2 },
                speed: { min: 0.5, max: 1.0 },
                emitterShape: 'sphere',
                emitterRadius: 3.0,
                gravity: -0.05
            },
            {
                name: 'reflective',
                color: new THREE.Color(0x3a86ff),
                rate: 4,
                size: { min: 0.05, max: 0.15 },
                speed: { min: 0.2, max: 0.6 },
                emitterShape: 'sphere',
                emitterRadius: 4.0,
                gravity: 0.02
            },
            {
                name: 'curious',
                color: new THREE.Color(0x8338ec),
                rate: 6,
                size: { min: 0.05, max: 0.15 },
                speed: { min: 0.3, max: 0.8 },
                emitterShape: 'sphere',
                emitterRadius: 3.5,
                gravity: 0.01
            },
            {
                name: 'excited',
                color: new THREE.Color(0xff006e),
                rate: 10,
                size: { min: 0.1, max: 0.2 },
                speed: { min: 0.6, max: 1.2 },
                emitterShape: 'sphere',
                emitterRadius: 3.0,
                gravity: -0.08
            },
            {
                name: 'empathetic',
                color: new THREE.Color(0x38b000),
                rate: 5,
                size: { min: 0.08, max: 0.18 },
                speed: { min: 0.3, max: 0.7 },
                emitterShape: 'sphere',
                emitterRadius: 3.5,
                gravity: 0.03
            },
            {
                name: 'calm',
                color: new THREE.Color(0x00b4d8),
                rate: 3,
                size: { min: 0.05, max: 0.15 },
                speed: { min: 0.1, max: 0.4 },
                emitterShape: 'sphere',
                emitterRadius: 4.0,
                gravity: 0.05
            },
            {
                name: 'neutral',
                color: new THREE.Color(0xffffff),
                rate: 2,
                size: { min: 0.05, max: 0.1 },
                speed: { min: 0.2, max: 0.5 },
                emitterShape: 'sphere',
                emitterRadius: 3.0,
                gravity: 0.02
            }
        ];
        
        // Create emitters
        for (const state of emotionalStates) {
            const emitter = EnhancedPhysicsSystem.createParticleEmitter({
                position: new THREE.Vector3(0, 0, -3),
                direction: new THREE.Vector3(0, 1, 0),
                spread: Math.PI * 2,
                rate: state.rate,
                lifetime: { min: 2, max: 5 },
                speed: state.speed,
                size: state.size,
                color: state.color,
                opacity: { min: 0.4, max: 0.7 },
                opacityEnd: { min: 0, max: 0 },
                emitterShape: state.emitterShape,
                emitterRadius: state.emitterRadius,
                drag: 0.05,
                gravity: state.gravity,
                usePhysics: true,
                scene: this.scene,
                isActive: state.name === this.currentState
            });
            
            // Add to emitters list
            this.particleEmitters.push({
                emitter: emitter,
                type: 'emotional',
                state: state.name,
                active: state.name === this.currentState
            });
        }
    }
    
    /**
     * Create mouse trail particles
     */
    createMouseTrailParticles() {
        // Skip if no scene or too soon after last emission
        if (!this.scene || Date.now() - this.lastInteractionTime < 50 / this.config.mouseTrailDensity) return;
        
        // Create emitter if needed
        if (!this.interactionEmitters.mouseTrail) {
            const emitter = EnhancedPhysicsSystem.createParticleEmitter({
                position: this.worldMousePosition.clone(),
                direction: new THREE.Vector3(0, 1, 0),
                spread: Math.PI / 2,
                rate: 0, // Burst mode
                burstCount: 0,
                lifetime: { min: 0.5, max: 1.5 },
                speed: { min: 0.1, max: 0.3 },
                size: { min: 0.05, max: 0.15 },
                color: new THREE.Color(0xffffff),
                opacity: { min: 0.5, max: 0.8 },
                opacityEnd: { min: 0, max: 0 },
                emitterShape: 'point',
                drag: 0.1,
                gravity: -0.05,
                usePhysics: true,
                scene: this.scene
            });
            
            this.interactionEmitters.mouseTrail = emitter;
        }
        
        // Update emitter position
        this.interactionEmitters.mouseTrail.position.copy(this.worldMousePosition);
        
        // Determine color based on emotional state
        let color;
        switch (this.currentState) {
            case 'joy': color = new THREE.Color(0xffbe0b); break;
            case 'reflective': color = new THREE.Color(0x3a86ff); break;
            case 'curious': color = new THREE.Color(0x8338ec); break;
            case 'excited': color = new THREE.Color(0xff006e); break;
            case 'empathetic': color = new THREE.Color(0x38b000); break;
            case 'calm': color = new THREE.Color(0x00b4d8); break;
            default: color = new THREE.Color(0xffffff);
        }
        
        // Update emitter properties
        this.interactionEmitters.mouseTrail.color = color;
        this.interactionEmitters.mouseTrail.burstCount = Math.floor(3 * this.config.mouseTrailDensity * this.interactionIntensity);
        
        // Emit particles
        EnhancedPhysicsSystem.emitParticles(this.interactionEmitters.mouseTrail, this.interactionEmitters.mouseTrail.burstCount);
    }
    
    /**
     * Create touch trail particles
     * @param {THREE.Vector3} position - World position of touch
     */
    createTouchTrailParticles(position) {
        // Skip if no scene or too soon after last emission
        if (!this.scene || Date.now() - this.lastInteractionTime < 50 / this.config.mouseTrailDensity) return;
        
        // Create emitter if needed
        if (!this.interactionEmitters.touchTrail) {
            const emitter = EnhancedPhysicsSystem.createParticleEmitter({
                position: position.clone(),
                direction: new THREE.Vector3(0, 1, 0),
                spread: Math.PI / 2,
                rate: 0, // Burst mode
                burstCount: 0,
                lifetime: { min: 0.5, max: 1.5 },
                speed: { min: 0.1, max: 0.3 },
                size: { min: 0.05, max: 0.15 },
                color: new THREE.Color(0xffffff),
                opacity: { min: 0.5, max: 0.8 },
                opacityEnd: { min: 0, max: 0 },
                emitterShape: 'point',
                drag: 0.1,
                gravity: -0.05,
                usePhysics: true,
                scene: this.scene
            });
            
            this.interactionEmitters.touchTrail = emitter;
        }
        
        // Update emitter position
        this.interactionEmitters.touchTrail.position.copy(position);
        
        // Determine color based on emotional state
        let color;
        switch (this.currentState) {
            case 'joy': color = new THREE.Color(0xffbe0b); break;
            case 'reflective': color = new THREE.Color(0x3a86ff); break;
            case 'curious': color = new THREE.Color(0x8338ec); break;
            case 'excited': color = new THREE.Color(0xff006e); break;
            case 'empathetic': color = new THREE.Color(0x38b000); break;
            case 'calm': color = new THREE.Color(0x00b4d8); break;
            default: color = new THREE.Color(0xffffff);
        }
        
        // Update emitter properties
        this.interactionEmitters.touchTrail.color = color;
        this.interactionEmitters.touchTrail.burstCount = Math.floor(2 * this.config.mouseTrailDensity * this.interactionIntensity);
        
        // Emit particles
        EnhancedPhysicsSystem.emitParticles(this.interactionEmitters.touchTrail, this.interactionEmitters.touchTrail.burstCount);
    }
    
    /**
     * Create click effect
     */
    createClickEffect() {
        // Skip if no scene
        if (!this.scene) return;
        
        // Create emitter if needed
        if (!this.interactionEmitters.click) {
            const emitter = EnhancedPhysicsSystem.createParticleEmitter({
                position: this.worldMousePosition.clone(),
                direction: new THREE.Vector3(0, 0, 1),
                spread: Math.PI,
                rate: 0, // Burst mode
                burstCount: 0,
                lifetime: { min: 0.8, max: 1.5 },
                speed: { min: 0.5, max: 1.5 },
                size: { min: 0.1, max: 0.2 },
                color: new THREE.Color(0xffffff),
                opacity: { min: 0.6, max: 0.9 },
                opacityEnd: { min: 0, max: 0 },
                emitterShape: 'point',
                drag: 0.05,
                gravity: -0.02,
                usePhysics: true,
                scene: this.scene
            });
            
            this.interactionEmitters.click = emitter;
        }
        
        // Update emitter position
        this.interactionEmitters.click.position.copy(this.worldMousePosition);
        
        // Determine color based on emotional state
        let color;
        switch (this.currentState) {
            case 'joy': color = new THREE.Color(0xffbe0b); break;
            case 'reflective': color = new THREE.Color(0x3a86ff); break;
            case 'curious': color = new THREE.Color(0x8338ec); break;
            case 'excited': color = new THREE.Color(0xff006e); break;
            case 'empathetic': color = new THREE.Color(0x38b000); break;
            case 'calm': color = new THREE.Color(0x00b4d8); break;
            default: color = new THREE.Color(0xffffff);
        }
        
        // Update emitter properties
        this.interactionEmitters.click.color = color;
        this.interactionEmitters.click.burstCount = 20;
        
        // Emit particles
        EnhancedPhysicsSystem.emitParticles(this.interactionEmitters.click, this.interactionEmitters.click.burstCount);
        
        // Create ripple effect
        this.createRippleEffect(this.worldMousePosition.clone(), color);
    }
    
    /**
     * Create touch effect
     * @param {THREE.Vector3} position - World position of touch
     */
    createTouchEffect(position) {
        // Skip if no scene
        if (!this.scene) return;
        
        // Create emitter if needed
        if (!this.interactionEmitters.touch) {
            const emitter = EnhancedPhysicsSystem.createParticleEmitter({
                position: position.clone(),
                direction: new THREE.Vector3(0, 0, 1),
                spread: Math.PI,
                rate: 0, // Burst mode
                burstCount: 0,
                lifetime: { min: 0.8, max: 1.5 },
                speed: { min: 0.5, max: 1.5 },
                size: { min: 0.1, max: 0.2 },
                color: new THREE.Color(0xffffff),
                opacity: { min: 0.6, max: 0.9 },
                opacityEnd: { min: 0, max: 0 },
                emitterShape: 'point',
                drag: 0.05,
                gravity: -0.02,
                usePhysics: true,
                scene: this.scene
            });
            
            this.interactionEmitters.touch = emitter;
        }
        
        // Update emitter position
        this.interactionEmitters.touch.position.copy(position);
        
        // Determine color based on emotional state
        let color;
        switch (this.currentState) {
            case 'joy': color = new THREE.Color(0xffbe0b); break;
            case 'reflective': color = new THREE.Color(0x3a86ff); break;
            case 'curious': color = new THREE.Color(0x8338ec); break;
            case 'excited': color = new THREE.Color(0xff006e); break;
            case 'empathetic': color = new THREE.Color(0x38b000); break;
            case 'calm': color = new THREE.Color(0x00b4d8); break;
            default: color = new THREE.Color(0xffffff);
        }
        
        // Update emitter properties
        this.interactionEmitters.touch.color = color;
        this.interactionEmitters.touch.burstCount = Math.floor(15 * this.config.touchEffectSize);
        
        // Emit particles
        EnhancedPhysicsSystem.emitParticles(this.interactionEmitters.touch, this.interactionEmitters.touch.burstCount);
        
        // Create ripple effect
        this.createRippleEffect(position.clone(), color);
    }
    
    /**
     * Create touch end effect
     * @param {THREE.Vector3} position - World position of touch
     */
    createTouchEndEffect(position) {
        // Skip if no scene
        if (!this.scene) return;
        
        // Create emitter if needed
        if (!this.interactionEmitters.touchEnd) {
            const emitter = EnhancedPhysicsSystem.createParticleEmitter({
                position: position.clone(),
                direction: new THREE.Vector3(0, 1, 0),
                spread: Math.PI / 3,
                rate: 0, // Burst mode
                burstCount: 0,
                lifetime: { min: 0.5, max: 1.2 },
                speed: { min: 0.3, max: 0.8 },
                size: { min: 0.05, max: 0.15 },
                color: new THREE.Color(0xffffff),
                opacity: { min: 0.4, max: 0.7 },
                opacityEnd: { min: 0, max: 0 },
                emitterShape: 'point',
                drag: 0.1,
                gravity: 0.05,
                usePhysics: true,
                scene: this.scene
            });
            
            this.interactionEmitters.touchEnd = emitter;
        }
        
        // Update emitter position
        this.interactionEmitters.touchEnd.position.copy(position);
        
        // Determine color based on emotional state
        let color;
        switch (this.currentState) {
            case 'joy': color = new THREE.Color(0xffbe0b); break;
            case 'reflective': color = new THREE.Color(0x3a86ff); break;
            case 'curious': color = new THREE.Color(0x8338ec); break;
            case 'excited': color = new THREE.Color(0xff006e); break;
            case 'empathetic': color = new THREE.Color(0x38b000); break;
            case 'calm': color = new THREE.Color(0x00b4d8); break;
            default: color = new THREE.Color(0xffffff);
        }
        
        // Update emitter properties
        this.interactionEmitters.touchEnd.color = color;
        this.interactionEmitters.touchEnd.burstCount = Math.floor(10 * this.config.touchEffectSize);
        
        // Emit particles
        EnhancedPhysicsSystem.emitParticles(this.interactionEmitters.touchEnd, this.interactionEmitters.touchEnd.burstCount);
    }
    
    /**
     * Create ripple effect
     * @param {THREE.Vector3} position - World position of ripple center
     * @param {THREE.Color} color - Ripple color
     */
    createRippleEffect(position, color) {
        // Skip if no scene
        if (!this.scene) return;
        
        // Create ripple geometry
        const geometry = new THREE.RingGeometry(0.1, 0.2, 32);
        
        // Create ripple material
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        // Create ripple mesh
        const ripple = new THREE.Mesh(geometry, material);
        ripple.position.copy(position);
        ripple.rotation.x = -Math.PI / 2; // Lay flat
        
        // Add to scene
        this.scene.add(ripple);
        
        // Animate ripple
        const startTime = Date.now();
        const duration = 1000; // 1 second
        const maxRadius = 3.0;
        
        const animateRipple = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1.0);
            
            // Scale ripple
            const scale = progress * maxRadius;
            ripple.scale.set(scale, scale, scale);
            
            // Fade out
            material.opacity = 0.7 * (1 - progress);
            
            // Continue animation or remove
            if (progress < 1.0) {
                requestAnimationFrame(animateRipple);
            } else {
                this.scene.remove(ripple);
                geometry.dispose();
                material.dispose();
            }
        };
        
        // Start animation
        animateRipple();
    }
    
    /**
     * Initialize audio analyzer
     */
    initAudioAnalyzer() {
        // Check if Web Audio API is available
        if (!window.AudioContext && !window.webkitAudioContext) {
            console.warn('Web Audio API not supported');
            return;
        }
        
        try {
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();
            
            // Create analyzer
            const analyzer = audioContext.createAnalyser();
            analyzer.fftSize = 2048;
            analyzer.smoothingTimeConstant = 0.8;
            
            // Create buffer
            const bufferLength = analyzer.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            // Store analyzer
            this.audioAnalyzer = {
                context: audioContext,
                analyzer: analyzer,
                bufferLength: bufferLength,
                dataArray: dataArray
            };
            
            console.log('Audio analyzer initialized');
            
            // Publish event
            window.eventSystem.publish('audio-analyzer-initialized', {
                success: true
            });
        } catch (error) {
            console.error('Error initializing audio analyzer:', error);
        }
    }
    
    /**
     * Process audio data
     * @param {Object} data - Audio data
     */
    processAudioData(data) {
        if (!this.config.audioReactivityEnabled) return;
        
        // Extract frequency data
        const frequencyData = data.frequencyData;
        if (!frequencyData) return;
        
        // Calculate levels for each frequency range
        const ranges = this.audioReactivity.frequencyRanges;
        const sampleRate = data.sampleRate || 44100;
        const binCount = frequencyData.length;
        const binSize = sampleRate / (binCount * 2);
        
        // Reset levels
        let overallLevel = 0;
        
        for (const range of ranges) {
            // Calculate bin indices for this range
            const startBin = Math.floor(range.min / binSize);
            const endBin = Math.min(Math.floor(range.max / binSize), binCount - 1);
            
            // Calculate average level
            let sum = 0;
            let count = 0;
            
            for (let i = startBin; i <= endBin; i++) {
                sum += frequencyData[i] / 255; // Normalize to 0-1
                count++;
            }
            
            const level = count > 0 ? sum / count : 0;
            
            // Apply smoothing
            const prevLevel = this.audioReactivity.levels[range.name] || 0;
            const smoothedLevel = prevLevel * 0.7 + level * 0.3;
            
            // Store level
            this.audioReactivity.levels[range.name] = smoothedLevel;
            
            // Add to overall level with influence factor
            overallLevel += smoothedLevel * range.influence;
        }
        
        // Normalize overall level
        const totalInfluence = ranges.reduce((sum, range) => sum + range.influence, 0);
        overallLevel = totalInfluence > 0 ? overallLevel / totalInfluence : 0;
        
        // Store overall level
        this.audioReactivity.levels.overall = overallLevel;
        
        // Store in history
        this.audioReactivity.history.push(overallLevel);
        if (this.audioReactivity.history.length > 60) {
            this.audioReactivity.history.shift();
        }
        
        // Apply audio reactivity to particle emitters
        this.applyAudioReactivity();
    }
    
    /**
     * Apply audio reactivity to particle emitters
     */
    applyAudioReactivity() {
        if (!this.config.audioReactivityEnabled) return;
        
        // Get audio levels
        const bassLevel = this.audioReactivity.levels.bass || 0;
        const midrangeLevel = this.audioReactivity.levels.midrange || 0;
        const trebleLevel = this.audioReactivity.levels.treble || 0;
        const overallLevel = this.audioReactivity.levels.overall || 0;
        
        // Apply to each emitter
        for (const emitterData of this.particleEmitters) {
            if (!emitterData.active) continue;
            
            const emitter = emitterData.emitter;
            
            // Skip if emitter is not active
            if (!emitter.isActive) continue;
            
            // Adjust emission rate based on audio level
            if (emitterData.type === 'emotional') {
                // Different frequency ranges affect different emotional states
                let reactivityFactor = 0;
                
                switch (emitterData.state) {
                    case 'joy':
                    case 'excited':
                        // More affected by bass and midrange
                        reactivityFactor = bassLevel * 0.6 + midrangeLevel * 0.4;
                        break;
                    case 'reflective':
                    case 'calm':
                        // More affected by midrange and treble
                        reactivityFactor = midrangeLevel * 0.6 + trebleLevel * 0.4;
                        break;
                    case 'curious':
                    case 'empathetic':
                        // Balanced effect
                        reactivityFactor = bassLevel * 0.3 + midrangeLevel * 0.4 + trebleLevel * 0.3;
                        break;
                    default:
                        // Default to overall level
                        reactivityFactor = overallLevel;
                }
                
                // Scale by intensity factor
                reactivityFactor *= this.audioReactivity.intensityFactor;
                
                // Apply to emitter
                const baseRate = emitter.rate;
                emitter.rate = baseRate * (1 + reactivityFactor * this.config.audioReactivityStrength);
                
                // Also affect particle size and speed
                const baseSizeMin = emitter.size.min;
                const baseSizeMax = emitter.size.max;
                const baseSpeedMin = emitter.speed.min;
                const baseSpeedMax = emitter.speed.max;
                
                emitter.size.min = baseSizeMin * (1 + reactivityFactor * 0.5 * this.config.audioReactivityStrength);
                emitter.size.max = baseSizeMax * (1 + reactivityFactor * 0.5 * this.config.audioReactivityStrength);
                emitter.speed.min = baseSpeedMin * (1 + reactivityFactor * 0.3 * this.config.audioReactivityStrength);
                emitter.speed.max = baseSpeedMax * (1 + reactivityFactor * 0.3 * this.config.audioReactivityStrength);
            } else if (emitterData.type === 'ambient') {
                // Ambient emitter reacts to overall level
                const baseRate = emitter.rate;
                emitter.rate = baseRate * (1 + overallLevel * 2 * this.config.audioReactivityStrength);
            }
        }
        
        // Create audio pulse effect on strong beats
        this.createAudioPulseEffect();
    }
    
    /**
     * Create audio pulse effect on strong beats
     */
    createAudioPulseEffect() {
        // Skip if no scene or audio reactivity disabled
        if (!this.scene || !this.config.audioReactivityEnabled) return;
        
        // Get audio history
        const history = this.audioReactivity.history;
        if (history.length < 3) return;
        
        // Check for beat (current level significantly higher than recent average)
        const currentLevel = history[history.length - 1];
        const previousLevel = history[history.length - 2];
        const recentAverage = history.slice(-10, -2).reduce((sum, val) => sum + val, 0) / 8;
        
        // Detect beat
        const beatThreshold = 0.15;
        const isBeat = currentLevel > recentAverage + beatThreshold && currentLevel > previousLevel;
        
        if (isBeat) {
            // Create pulse emitter if needed
            if (!this.interactionEmitters.audioPulse) {
                const emitter = EnhancedPhysicsSystem.createParticleEmitter({
                    position: new THREE.Vector3(0, 0, -2),
                    direction: new THREE.Vector3(0, 0, 1),
                    spread: Math.PI * 2,
                    rate: 0, // Burst mode
                    burstCount: 0,
                    lifetime: { min: 0.8, max: 1.5 },
                    speed: { min: 0.5, max: 1.5 },
                    size: { min: 0.1, max: 0.2 },
                    color: new THREE.Color(0xffffff),
                    opacity: { min: 0.6, max: 0.9 },
                    opacityEnd: { min: 0, max: 0 },
                    emitterShape: 'sphere',
                    emitterRadius: 1.0,
                    drag: 0.05,
                    gravity: -0.02,
                    usePhysics: true,
                    scene: this.scene
                });
                
                this.interactionEmitters.audioPulse = emitter;
            }
            
            // Determine color based on emotional state
            let color;
            switch (this.currentState) {
                case 'joy': color = new THREE.Color(0xffbe0b); break;
                case 'reflective': color = new THREE.Color(0x3a86ff); break;
                case 'curious': color = new THREE.Color(0x8338ec); break;
                case 'excited': color = new THREE.Color(0xff006e); break;
                case 'empathetic': color = new THREE.Color(0x38b000); break;
                case 'calm': color = new THREE.Color(0x00b4d8); break;
                default: color = new THREE.Color(0xffffff);
            }
            
            // Update emitter properties
            this.interactionEmitters.audioPulse.color = color;
            this.interactionEmitters.audioPulse.burstCount = Math.floor(20 * currentLevel * this.config.audioReactivityStrength);
            
            // Emit particles
            EnhancedPhysicsSystem.emitParticles(this.interactionEmitters.audioPulse, this.interactionEmitters.audioPulse.burstCount);
            
            // Create ripple effect
            this.createRippleEffect(new THREE.Vector3(0, 0, -2), color);
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
        
        // Update active emitters
        for (const emitterData of this.particleEmitters) {
            if (emitterData.type === 'emotional') {
                emitterData.active = emitterData.state === state;
                emitterData.emitter.isActive = emitterData.active;
            }
        }
        
        console.log(`Interactive Particle System: Emotional state set to ${state} (${intensity})`);
    }
    
    /**
     * Set quality level
     * @param {string} level - Quality level ('low', 'medium', 'high')
     */
    setQualityLevel(level) {
        if (!['low', 'medium', 'high'].includes(level)) {
            console.warn(`Unknown quality level: ${level}`);
            return;
        }
        
        this.config.qualityLevel = level;
        
        // Adjust particle counts based on quality
        switch (level) {
            case 'low':
                this.config.maxParticles = 1000;
                this.config.maxEmitters = 5;
                this.config.mouseTrailDensity = 0.3;
                break;
            case 'medium':
                this.config.maxParticles = 3000;
                this.config.maxEmitters = 8;
                this.config.mouseTrailDensity = 0.5;
                break;
            case 'high':
                this.config.maxParticles = 5000;
                this.config.maxEmitters = 10;
                this.config.mouseTrailDensity = 0.8;
                break;
        }
        
        console.log(`Interactive Particle System: Quality level set to ${level}`);
    }
    
    /**
     * Update configuration
     * @param {Object} config - Configuration object
     */
    updateConfig(config) {
        // Update config properties
        for (const key in config) {
            if (this.config.hasOwnProperty(key)) {
                this.config[key] = config[key];
            }
        }
        
        console.log('Interactive Particle System: Configuration updated');
    }
    
    /**
     * Update the interactive particle system
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Skip if not initialized
        if (!this.scene || !this.camera || !this.renderer) return;
        
        // Start performance monitoring
        const startTime = performance.now();
        
        // Update interaction intensity decay
        if (Date.now() - this.lastInteractionTime > 100) {
            this.interactionIntensity *= this.config.interactionDecay;
        }
        
        // Update particle emitters
        let totalParticles = 0;
        
        for (const emitterData of this.particleEmitters) {
            if (emitterData.active) {
                EnhancedPhysicsSystem.updateParticleEmitter(emitterData.emitter, deltaTime);
                totalParticles += emitterData.emitter.particles.length;
            }
        }
        
        // Update interaction emitters
        for (const key in this.interactionEmitters) {
            const emitter = this.interactionEmitters[key];
            EnhancedPhysicsSystem.updateParticleEmitter(emitter, deltaTime);
            totalParticles += emitter.particles.length;
        }
        
        // Update performance monitoring
        this.performance.particleCount = totalParticles;
        this.performance.frameCount++;
        
        const endTime = performance.now();
        const updateTime = endTime - startTime;
        
        this.performance.updateTimeAvg = 
            (this.performance.updateTimeAvg * 0.9 + updateTime * 0.1);
            
        // Update FPS counter every second
        if (Date.now() - this.performance.lastFpsUpdate > 1000) {
            this.performance.fps = this.performance.frameCount;
            this.performance.frameCount = 0;
            this.performance.lastFpsUpdate = Date.now();
            
            // Adaptive quality if enabled
            if (this.config.performanceAdaptive) {
                this.adaptQuality();
            }
        }
    }
    
    /**
     * Adapt quality based on performance
     */
    adaptQuality() {
        // Skip if not enabled
        if (!this.config.performanceAdaptive) return;
        
        // Check FPS and update time
        const fps = this.performance.fps;
        const updateTime = this.performance.updateTimeAvg;
        
        // Adjust quality if needed
        if (fps < 30 || updateTime > 16) {
            // Reduce quality
            if (this.config.qualityLevel === 'high') {
                this.setQualityLevel('medium');
            } else if (this.config.qualityLevel === 'medium') {
                this.setQualityLevel('low');
            }
        } else if (fps > 55 && updateTime < 8) {
            // Increase quality
            if (this.config.qualityLevel === 'low') {
                this.setQualityLevel('medium');
            } else if (this.config.qualityLevel === 'medium') {
                this.setQualityLevel('high');
            }
        }
    }
}

// Export the class
export default new InteractiveParticleSystem();
