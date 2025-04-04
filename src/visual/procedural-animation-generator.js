/**
 * Procedural Animation Generator
 * 
 * This module provides advanced procedural animation generation capabilities
 * for the MeAI visualization system, creating dynamic and non-repeating animations.
 */

import * as THREE from 'three';

class ProceduralAnimationGenerator {
    constructor() {
        // Animation parameters
        this.parameters = {
            complexity: 0.5,
            smoothness: 0.7,
            speed: 1.0,
            amplitude: 1.0,
            emotionalInfluence: 0.8,
            randomSeed: Math.random() * 1000
        };
        
        // Animation state
        this.currentState = 'neutral';
        this.emotionalIntensity = 0.5;
        this.time = 0;
        
        // Animation components
        this.baseAnimations = {};
        this.modifiers = {};
        this.sequences = {};
        
        // Noise generators
        this.noiseGenerators = {};
        
        // Initialize animation components
        this.initialize();
    }
    
    /**
     * Initialize the procedural animation generator
     */
    initialize() {
        // Create base animations
        this.createBaseAnimations();
        
        // Create animation modifiers
        this.createModifiers();
        
        // Create animation sequences
        this.createSequences();
        
        // Initialize noise generators
        this.initializeNoiseGenerators();
        
        console.log('Procedural Animation Generator initialized');
    }
    
    /**
     * Create base animations
     */
    createBaseAnimations() {
        // Pulse animation (scale changes)
        this.baseAnimations.pulse = (target, params, time, emotionalState) => {
            const frequency = params.frequency || 1.0;
            const amplitude = params.amplitude || 0.2;
            const offset = params.offset || 0;
            
            const scale = 1.0 + amplitude * Math.sin((time + offset) * frequency * Math.PI * 2);
            
            target.scale.set(scale, scale, scale);
            
            return { type: 'scale', value: scale };
        };
        
        // Rotate animation (rotation changes)
        this.baseAnimations.rotate = (target, params, time, emotionalState) => {
            const axis = params.axis || 'y';
            const speed = params.speed || 1.0;
            const amplitude = params.amplitude || 1.0;
            
            const rotation = (time * speed * Math.PI * 2) % (Math.PI * 2);
            
            if (axis === 'x') {
                target.rotation.x = rotation * amplitude;
            } else if (axis === 'y') {
                target.rotation.y = rotation * amplitude;
            } else if (axis === 'z') {
                target.rotation.z = rotation * amplitude;
            } else if (axis === 'xyz') {
                target.rotation.x = rotation * amplitude * 0.5;
                target.rotation.y = rotation * amplitude;
                target.rotation.z = rotation * amplitude * 0.3;
            }
            
            return { type: 'rotation', axis: axis, value: rotation * amplitude };
        };
        
        // Float animation (position changes)
        this.baseAnimations.float = (target, params, time, emotionalState) => {
            const height = params.height || 0.5;
            const frequency = params.frequency || 0.5;
            const horizontalMotion = params.horizontalMotion || 0;
            
            const y = height * Math.sin(time * frequency * Math.PI * 2);
            const x = horizontalMotion * Math.cos(time * frequency * Math.PI * 2 * 0.7);
            const z = horizontalMotion * Math.sin(time * frequency * Math.PI * 2 * 0.5);
            
            target.position.y = y;
            target.position.x = x;
            target.position.z = z;
            
            return { type: 'position', value: new THREE.Vector3(x, y, z) };
        };
        
        // Sway animation (rotation oscillation)
        this.baseAnimations.sway = (target, params, time, emotionalState) => {
            const axis = params.axis || 'z';
            const angle = params.angle || (Math.PI / 8);
            const frequency = params.frequency || 0.7;
            
            const rotation = angle * Math.sin(time * frequency * Math.PI * 2);
            
            if (axis === 'x') {
                target.rotation.x = rotation;
            } else if (axis === 'y') {
                target.rotation.y = rotation;
            } else if (axis === 'z') {
                target.rotation.z = rotation;
            }
            
            return { type: 'rotation', axis: axis, value: rotation };
        };
        
        // Bounce animation (position with bounce effect)
        this.baseAnimations.bounce = (target, params, time, emotionalState) => {
            const height = params.height || 0.5;
            const frequency = params.frequency || 1.0;
            const damping = params.damping || 0.3;
            
            // Create bouncing effect using absolute sine
            const phase = (time * frequency) % 1;
            const bounce = Math.abs(Math.sin(phase * Math.PI));
            
            // Add damping for more realistic bounce
            const dampedBounce = bounce * (1 - damping * (1 - bounce));
            
            target.position.y = height * dampedBounce;
            
            return { type: 'position', axis: 'y', value: height * dampedBounce };
        };
        
        // Shake animation (rapid small movements)
        this.baseAnimations.shake = (target, params, time, emotionalState) => {
            const intensity = params.intensity || 0.1;
            const frequency = params.frequency || 10.0;
            const decay = params.decay || 0;
            
            // Calculate decay factor
            const decayFactor = decay > 0 ? Math.max(0, 1 - time * decay) : 1;
            
            // Generate random offsets using noise for smoother shaking
            const xOffset = this.noise(time * frequency, 0, 0) * 2 - 1;
            const yOffset = this.noise(0, time * frequency, 0) * 2 - 1;
            const zOffset = this.noise(0, 0, time * frequency) * 2 - 1;
            
            const x = xOffset * intensity * decayFactor;
            const y = yOffset * intensity * decayFactor;
            const z = zOffset * intensity * decayFactor;
            
            target.position.x = x;
            target.position.y = y;
            target.position.z = z;
            
            return { type: 'position', value: new THREE.Vector3(x, y, z) };
        };
        
        // Morph animation (shape morphing)
        this.baseAnimations.morph = (target, params, time, emotionalState) => {
            const influence = params.influence || 0.5;
            const frequency = params.frequency || 0.3;
            const morphTargets = params.morphTargets || [];
            
            if (target.morphTargetInfluences && morphTargets.length > 0) {
                const phase = (Math.sin(time * frequency * Math.PI * 2) + 1) / 2; // 0 to 1
                
                for (let i = 0; i < morphTargets.length; i++) {
                    const targetIndex = morphTargets[i];
                    if (targetIndex < target.morphTargetInfluences.length) {
                        target.morphTargetInfluences[targetIndex] = phase * influence;
                    }
                }
                
                return { type: 'morph', value: phase * influence };
            }
            
            return null;
        };
        
        // Wave animation (wave-like deformation)
        this.baseAnimations.wave = (target, params, time, emotionalState) => {
            const amplitude = params.amplitude || 0.2;
            const frequency = params.frequency || 1.0;
            const speed = params.speed || 1.0;
            const axis = params.axis || 'y';
            
            if (target.geometry && target.geometry.attributes.position) {
                const positions = target.geometry.attributes.position.array;
                const originalPositions = target.geometry.userData.originalPositions;
                
                // Store original positions if not already stored
                if (!originalPositions) {
                    target.geometry.userData.originalPositions = new Float32Array(positions.length);
                    for (let i = 0; i < positions.length; i++) {
                        target.geometry.userData.originalPositions[i] = positions[i];
                    }
                }
                
                // Apply wave deformation
                for (let i = 0; i < positions.length; i += 3) {
                    const x = originalPositions[i];
                    const y = originalPositions[i + 1];
                    const z = originalPositions[i + 2];
                    
                    let deformation = 0;
                    
                    if (axis === 'x') {
                        deformation = amplitude * Math.sin(y * frequency + time * speed);
                        positions[i] = x + deformation;
                    } else if (axis === 'y') {
                        deformation = amplitude * Math.sin(x * frequency + time * speed);
                        positions[i + 1] = y + deformation;
                    } else if (axis === 'z') {
                        deformation = amplitude * Math.sin(x * frequency + time * speed);
                        positions[i + 2] = z + deformation;
                    }
                }
                
                target.geometry.attributes.position.needsUpdate = true;
                target.geometry.computeVertexNormals();
                
                return { type: 'wave', value: amplitude };
            }
            
            return null;
        };
        
        // Spiral animation (spiral movement)
        this.baseAnimations.spiral = (target, params, time, emotionalState) => {
            const radius = params.radius || 1.0;
            const height = params.height || 0.5;
            const frequency = params.frequency || 0.5;
            const direction = params.direction || 1;
            
            const angle = time * frequency * Math.PI * 2 * direction;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = height * Math.sin(time * frequency * Math.PI);
            
            target.position.set(x, y, z);
            
            // Make object face direction of movement
            if (params.faceDirection) {
                target.rotation.y = angle + Math.PI / 2;
            }
            
            return { type: 'position', value: new THREE.Vector3(x, y, z) };
        };
        
        // Orbit animation (circular movement around a point)
        this.baseAnimations.orbit = (target, params, time, emotionalState) => {
            const radius = params.radius || 2.0;
            const frequency = params.frequency || 0.3;
            const center = params.center || new THREE.Vector3(0, 0, 0);
            const axis = params.axis || 'xz';
            
            const angle = time * frequency * Math.PI * 2;
            let x = center.x;
            let y = center.y;
            let z = center.z;
            
            if (axis === 'xz' || axis === 'zx') {
                x += Math.cos(angle) * radius;
                z += Math.sin(angle) * radius;
            } else if (axis === 'xy' || axis === 'yx') {
                x += Math.cos(angle) * radius;
                y += Math.sin(angle) * radius;
            } else if (axis === 'yz' || axis === 'zy') {
                y += Math.cos(angle) * radius;
                z += Math.sin(angle) * radius;
            }
            
            target.position.set(x, y, z);
            
            // Make object face center
            if (params.faceCenter) {
                target.lookAt(center);
            }
            
            return { type: 'position', value: new THREE.Vector3(x, y, z) };
        };
    }
    
    /**
     * Create animation modifiers
     */
    createModifiers() {
        // Ease modifier (applies easing functions)
        this.modifiers.ease = (value, params, time, emotionalState) => {
            const type = params.type || 'inOutQuad';
            const t = params.t !== undefined ? params.t : (time % 1); // Normalized time (0-1)
            
            let easedT;
            
            switch (type) {
                case 'inQuad':
                    easedT = t * t;
                    break;
                case 'outQuad':
                    easedT = t * (2 - t);
                    break;
                case 'inOutQuad':
                    easedT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                    break;
                case 'inCubic':
                    easedT = t * t * t;
                    break;
                case 'outCubic':
                    easedT = (--t) * t * t + 1;
                    break;
                case 'inOutCubic':
                    easedT = t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
                    break;
                case 'inElastic':
                    easedT = t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * ((2 * Math.PI) / 3));
                    break;
                case 'outElastic':
                    easedT = t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
                    break;
                case 'inOutElastic':
                    easedT = t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ?
                        -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * ((2 * Math.PI) / 4.5))) / 2 :
                        (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * ((2 * Math.PI) / 4.5))) / 2 + 1;
                    break;
                case 'inBack':
                    const s1 = 1.70158;
                    easedT = t * t * ((s1 + 1) * t - s1);
                    break;
                case 'outBack':
                    const s2 = 1.70158;
                    easedT = (t - 1) * (t - 1) * ((s2 + 1) * (t - 1) + s2) + 1;
                    break;
                case 'inOutBack':
                    const s3 = 1.70158 * 1.525;
                    easedT = t < 0.5 ?
                        (Math.pow(2 * t, 2) * ((s3 + 1) * 2 * t - s3)) / 2 :
                        (Math.pow(2 * t - 2, 2) * ((s3 + 1) * (t * 2 - 2) + s3) + 2) / 2;
                    break;
                case 'inBounce':
                    easedT = 1 - this.outBounce(1 - t);
                    break;
                case 'outBounce':
                    easedT = this.outBounce(t);
                    break;
                case 'inOutBounce':
                    easedT = t < 0.5 ?
                        (1 - this.outBounce(1 - 2 * t)) / 2 :
                        (1 + this.outBounce(2 * t - 1)) / 2;
                    break;
                default:
                    easedT = t;
            }
            
            // If value is a number, apply easing directly
            if (typeof value === 'number') {
                return value * easedT;
            }
            
            // If value is a Vector3, apply easing to each component
            if (value instanceof THREE.Vector3) {
                return value.clone().multiplyScalar(easedT);
            }
            
            return value;
        };
        
        // Noise modifier (adds noise to animation)
        this.modifiers.noise = (value, params, time, emotionalState) => {
            const amplitude = params.amplitude || 0.1;
            const frequency = params.frequency || 1.0;
            const octaves = params.octaves || 1;
            
            let noiseValue = 0;
            let maxValue = 0;
            let amp = 1;
            
            // Sum multiple octaves of noise
            for (let i = 0; i < octaves; i++) {
                noiseValue += amp * this.noise(
                    time * frequency * Math.pow(2, i),
                    i * 100,
                    i * 200
                );
                maxValue += amp;
                amp *= 0.5;
            }
            
            // Normalize
            noiseValue /= maxValue;
            
            // Scale to -1 to 1 range
            noiseValue = noiseValue * 2 - 1;
            
            // Apply amplitude
            noiseValue *= amplitude;
            
            // If value is a number, add noise
            if (typeof value === 'number') {
                return value + noiseValue;
            }
            
            // If value is a Vector3, add noise to each component
            if (value instanceof THREE.Vector3) {
                return value.clone().add(new THREE.Vector3(
                    this.noise(time * frequency, 0, 0) * 2 - 1,
                    this.noise(0, time * frequency, 0) * 2 - 1,
                    this.noise(0, 0, time * frequency) * 2 - 1
                ).multiplyScalar(amplitude));
            }
            
            return value;
        };
        
        // Emotional modifier (adjusts animation based on emotional state)
        this.modifiers.emotional = (value, params, time, emotionalState) => {
            const emotionMap = params.emotionMap || {
                'joy': { scale: 1.2, speed: 1.5 },
                'reflective': { scale: 0.9, speed: 0.7 },
                'curious': { scale: 1.1, speed: 1.2 },
                'excited': { scale: 1.3, speed: 1.8 },
                'empathetic': { scale: 1.0, speed: 0.9 },
                'calm': { scale: 0.8, speed: 0.6 },
                'neutral': { scale: 1.0, speed: 1.0 }
            };
            
            const state = emotionalState.state || 'neutral';
            const intensity = emotionalState.intensity || 0.5;
            
            const emotionParams = emotionMap[state] || emotionMap.neutral;
            const scale = 1.0 + (emotionParams.scale - 1.0) * intensity;
            
            // If value is a number, scale it
            if (typeof value === 'number') {
                return value * scale;
            }
            
            // If value is a Vector3, scale it
            if (value instanceof THREE.Vector3) {
                return value.clone().multiplyScalar(scale);
            }
            
            return value;
        };
        
        // Blend modifier (blends between two animations)
        this.modifiers.blend = (value, params, time, emotionalState) => {
            const blendFactor = params.factor !== undefined ? params.factor : 0.5;
            const targetValue = params.targetValue;
            
            if (targetValue === undefined) return value;
            
            // If both values are numbers, blend them
            if (typeof value === 'number' && typeof targetValue === 'number') {
                return value * (1 - blendFactor) + targetValue * blendFactor;
            }
            
            // If both values are Vector3, blend them
            if (value instanceof THREE.Vector3 && targetValue instanceof THREE.Vector3) {
                return value.clone().lerp(targetValue, blendFactor);
            }
            
            return value;
        };
        
        // Delay modifier (delays animation by a specified amount)
        this.modifiers.delay = (value, params, time, emotionalState) => {
            const delay = params.delay || 0;
            const delayedTime = Math.max(0, time - delay);
            
            // If original value is a function, call it with delayed time
            if (typeof params.originalFn === 'function') {
                return params.originalFn(delayedTime);
            }
            
            return value;
        };
    }
    
    /**
     * Create animation sequences
     */
    createSequences() {
        // Joy sequence
        this.sequences.joy = [
            {
                animation: 'pulse',
                params: { frequency: 2.0, amplitude: 0.15 },
                duration: 1.0,
                modifiers: [
                    { type: 'ease', params: { type: 'inOutQuad' } }
                ]
            },
            {
                animation: 'rotate',
                params: { axis: 'y', speed: 0.5 },
                duration: 2.0,
                modifiers: [
                    { type: 'ease', params: { type: 'inOutSine' } }
                ]
            },
            {
                animation: 'bounce',
                params: { height: 0.3, frequency: 2.0 },
                duration: 1.5,
                modifiers: [
                    { type: 'ease', params: { type: 'outBack' } },
                    { type: 'noise', params: { amplitude: 0.05, frequency: 2.0 } }
                ]
            }
        ];
        
        // Reflective sequence
        this.sequences.reflective = [
            {
                animation: 'float',
                params: { height: 0.2, frequency: 0.3, horizontalMotion: 0.1 },
                duration: 3.0,
                modifiers: [
                    { type: 'ease', params: { type: 'inOutSine' } }
                ]
            },
            {
                animation: 'sway',
                params: { axis: 'z', angle: Math.PI / 16, frequency: 0.4 },
                duration: 2.5,
                modifiers: [
                    { type: 'ease', params: { type: 'inOutSine' } }
                ]
            },
            {
                animation: 'pulse',
                params: { frequency: 0.3, amplitude: 0.05 },
                duration: 2.0,
                modifiers: [
                    { type: 'ease', params: { type: 'inOutQuad' } }
                ]
            }
        ];
        
        // Curious sequence
        this.sequences.curious = [
            {
                animation: 'sway',
                params: { axis: 'z', angle: Math.PI / 12, frequency: 0.6 },
                duration: 1.5,
                modifiers: [
                    { type: 'ease', params: { type: 'inOutBack' } }
                ]
            },
            {
                animation: 'rotate',
                params: { axis: 'y', speed: 0.3 },
                duration: 2.0,
                modifiers: [
                    { type: 'ease', params: { type: 'inOutQuad' } }
                ]
            },
            {
                animation: 'float',
                params: { height: 0.15, frequency: 0.5, horizontalMotion: 0.15 },
                duration: 1.5,
                modifiers: [
                    { type: 'noise', params: { amplitude: 0.08, frequency: 1.0 } }
                ]
            }
        ];
        
        // Excited sequence
        this.sequences.excited = [
            {
                animation: 'bounce',
                params: { height: 0.4, frequency: 2.5 },
                duration: 1.0,
                modifiers: [
                    { type: 'ease', params: { type: 'outBack' } }
                ]
            },
            {
                animation: 'shake',
                params: { intensity: 0.1, frequency: 3.0 },
                duration: 0.8,
                modifiers: [
                    { type: 'ease', params: { type: 'inOutQuad' } }
                ]
            },
            {
                animation: 'rotate',
                params: { axis: 'y', speed: 1.0 },
                duration: 1.2,
                modifiers: [
                    { type: 'ease', params: { type: 'inOutQuad' } },
                    { type: 'noise', params: { amplitude: 0.1, frequency: 2.0 } }
                ]
            }
        ];
        
        // Empathetic sequence
        this.sequences.empathetic = [
            {
                animation: 'pulse',
                params: { frequency: 0.5, amplitude: 0.1 },
                duration: 2.0,
                modifiers: [
                    { type: 'ease', params: { type: 'inOutQuad' } }
                ]
            },
            {
                animation: 'sway',
                params: { axis: 'z', angle: Math.PI / 20, frequency: 0.3 },
                duration: 2.5,
                modifiers: [
                    { type: 'ease', params: { type: 'inOutSine' } }
                ]
            },
            {
                animation: 'float',
                params: { height: 0.1, frequency: 0.4 },
                duration: 2.0,
                modifiers: [
                    { type: 'ease', params: { type: 'inOutSine' } }
                ]
            }
        ];
        
        // Calm sequence
        this.sequences.calm = [
            {
                animation: 'float',
                params: { height: 0.1, frequency: 0.2 },
                duration: 3.0,
                modifiers: [
                    { type: 'ease', params: { type: 'inOutSine' } }
                ]
            },
            {
                animation: 'pulse',
                params: { frequency: 0.2, amplitude: 0.05 },
                duration: 3.0,
                modifiers: [
                    { type: 'ease', params: { type: 'inOutQuad' } }
                ]
            },
            {
                animation: 'rotate',
                params: { axis: 'y', speed: 0.1 },
                duration: 4.0,
                modifiers: [
                    { type: 'ease', params: { type: 'inOutSine' } }
                ]
            }
        ];
        
        // Neutral sequence
        this.sequences.neutral = [
            {
                animation: 'float',
                params: { height: 0.05, frequency: 0.3 },
                duration: 2.5,
                modifiers: [
                    { type: 'ease', params: { type: 'inOutSine' } }
                ]
            },
            {
                animation: 'rotate',
                params: { axis: 'y', speed: 0.2 },
                duration: 3.0,
                modifiers: [
                    { type: 'ease', params: { type: 'inOutSine' } }
                ]
            },
            {
                animation: 'pulse',
                params: { frequency: 0.3, amplitude: 0.03 },
                duration: 2.0,
                modifiers: [
                    { type: 'ease', params: { type: 'inOutQuad' } }
                ]
            }
        ];
    }
    
    /**
     * Initialize noise generators
     */
    initializeNoiseGenerators() {
        // Simplex noise implementation
        this.noiseGenerators.simplex = {
            // Permutation table
            perm: (() => {
                const p = new Uint8Array(512);
                const seed = this.parameters.randomSeed || Math.random() * 1000;
                
                // Initialize permutation with values 0-255
                for (let i = 0; i < 256; i++) {
                    p[i] = i;
                }
                
                // Shuffle permutation
                for (let i = 255; i > 0; i--) {
                    const j = Math.floor((seed * (i + 1)) % (i + 1));
                    [p[i], p[j]] = [p[j], p[i]]; // Swap
                }
                
                // Duplicate permutation to avoid overflow
                for (let i = 0; i < 256; i++) {
                    p[i + 256] = p[i];
                }
                
                return p;
            })(),
            
            // Gradient table
            grad3: [
                [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
                [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
                [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
            ],
            
            // Dot product of gradient and distance vector
            dot: (g, x, y, z) => {
                return g[0] * x + g[1] * y + g[2] * z;
            },
            
            // Noise function
            noise: (x, y, z) => {
                const perm = this.noiseGenerators.simplex.perm;
                const grad3 = this.noiseGenerators.simplex.grad3;
                const dot = this.noiseGenerators.simplex.dot;
                
                // Skew input space to determine simplex cell
                const F3 = 1/3;
                const s = (x + y + z) * F3;
                const i = Math.floor(x + s);
                const j = Math.floor(y + s);
                const k = Math.floor(z + s);
                
                const G3 = 1/6;
                const t = (i + j + k) * G3;
                const X0 = i - t;
                const Y0 = j - t;
                const Z0 = k - t;
                
                const x0 = x - X0;
                const y0 = y - Y0;
                const z0 = z - Z0;
                
                // Determine which simplex we're in
                let i1, j1, k1;
                let i2, j2, k2;
                
                if (x0 >= y0) {
                    if (y0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; } // X Y Z order
                    else if (x0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; } // X Z Y order
                    else { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; } // Z X Y order
                } else {
                    if (y0 < z0) { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; } // Z Y X order
                    else if (x0 < z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; } // Y Z X order
                    else { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; } // Y X Z order
                }
                
                // Offsets for corners
                const x1 = x0 - i1 + G3;
                const y1 = y0 - j1 + G3;
                const z1 = z0 - k1 + G3;
                const x2 = x0 - i2 + 2*G3;
                const y2 = y0 - j2 + 2*G3;
                const z2 = z0 - k2 + 2*G3;
                const x3 = x0 - 1 + 3*G3;
                const y3 = y0 - 1 + 3*G3;
                const z3 = z0 - 1 + 3*G3;
                
                // Hash coordinates of the corners
                const ii = i & 255;
                const jj = j & 255;
                const kk = k & 255;
                
                const gi0 = perm[ii + perm[jj + perm[kk]]] % 12;
                const gi1 = perm[ii + i1 + perm[jj + j1 + perm[kk + k1]]] % 12;
                const gi2 = perm[ii + i2 + perm[jj + j2 + perm[kk + k2]]] % 12;
                const gi3 = perm[ii + 1 + perm[jj + 1 + perm[kk + 1]]] % 12;
                
                // Calculate contribution from each corner
                let n0, n1, n2, n3;
                
                // Corner 0
                let t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
                if (t0 < 0) n0 = 0;
                else {
                    t0 *= t0;
                    n0 = t0 * t0 * dot(grad3[gi0], x0, y0, z0);
                }
                
                // Corner 1
                let t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
                if (t1 < 0) n1 = 0;
                else {
                    t1 *= t1;
                    n1 = t1 * t1 * dot(grad3[gi1], x1, y1, z1);
                }
                
                // Corner 2
                let t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
                if (t2 < 0) n2 = 0;
                else {
                    t2 *= t2;
                    n2 = t2 * t2 * dot(grad3[gi2], x2, y2, z2);
                }
                
                // Corner 3
                let t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
                if (t3 < 0) n3 = 0;
                else {
                    t3 *= t3;
                    n3 = t3 * t3 * dot(grad3[gi3], x3, y3, z3);
                }
                
                // Sum contributions from each corner
                // Scale to range [0, 1]
                return (32 * (n0 + n1 + n2 + n3) + 1) * 0.5;
            }
        };
    }
    
    /**
     * Helper function for outBounce easing
     * @param {number} t - Time parameter (0-1)
     * @returns {number} Eased value
     */
    outBounce(t) {
        if (t < 1/2.75) {
            return 7.5625 * t * t;
        } else if (t < 2/2.75) {
            return 7.5625 * (t -= 1.5/2.75) * t + 0.75;
        } else if (t < 2.5/2.75) {
            return 7.5625 * (t -= 2.25/2.75) * t + 0.9375;
        } else {
            return 7.5625 * (t -= 2.625/2.75) * t + 0.984375;
        }
    }
    
    /**
     * Simplex noise function
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} z - Z coordinate
     * @returns {number} Noise value (0-1)
     */
    noise(x, y, z) {
        return this.noiseGenerators.simplex.noise(x, y, z);
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
        
        console.log(`Procedural Animation Generator: Emotional state set to ${state} (${intensity})`);
    }
    
    /**
     * Generate a procedural animation for a target object
     * @param {THREE.Object3D} target - Target object to animate
     * @param {Object} params - Animation parameters
     * @returns {Function} Animation update function
     */
    generateAnimation(target, params = {}) {
        // Store original properties
        const originalPosition = target.position.clone();
        const originalRotation = new THREE.Euler().copy(target.rotation);
        const originalScale = target.scale.clone();
        
        // Create animation state
        const animationState = {
            target: target,
            originalPosition: originalPosition,
            originalRotation: originalRotation,
            originalScale: originalScale,
            currentSequence: null,
            currentStep: 0,
            stepTime: 0,
            totalTime: 0,
            params: Object.assign({}, this.parameters, params)
        };
        
        // Return update function
        return (deltaTime) => {
            return this.updateAnimation(animationState, deltaTime);
        };
    }
    
    /**
     * Update a procedural animation
     * @param {Object} state - Animation state
     * @param {number} deltaTime - Time since last update in seconds
     * @returns {Object} Animation result
     */
    updateAnimation(state, deltaTime) {
        // Update time
        state.totalTime += deltaTime * state.params.speed;
        state.stepTime += deltaTime * state.params.speed;
        
        // Get current sequence based on emotional state
        const sequenceName = this.currentState;
        const sequence = this.sequences[sequenceName] || this.sequences.neutral;
        
        // Check if we need to update the current step
        if (state.currentSequence !== sequenceName || 
            state.currentStep >= sequence.length ||
            state.stepTime >= sequence[state.currentStep].duration) {
            
            // Reset target to original state if changing sequences
            if (state.currentSequence !== sequenceName) {
                state.target.position.copy(state.originalPosition);
                state.target.rotation.copy(state.originalRotation);
                state.target.scale.copy(state.originalScale);
            }
            
            // Update sequence and step
            state.currentSequence = sequenceName;
            state.currentStep = (state.currentStep + 1) % sequence.length;
            state.stepTime = 0;
        }
        
        // Get current animation step
        const step = sequence[state.currentStep];
        
        // Get animation function
        const animationFn = this.baseAnimations[step.animation];
        if (!animationFn) return null;
        
        // Create a copy of the target for animation
        const targetCopy = {
            position: state.target.position.clone(),
            rotation: new THREE.Euler().copy(state.target.rotation),
            scale: state.target.scale.clone()
        };
        
        // Apply animation
        const result = animationFn(targetCopy, step.params, state.stepTime, {
            state: this.currentState,
            intensity: this.emotionalIntensity
        });
        
        // Apply modifiers
        let modifiedResult = result;
        if (step.modifiers) {
            for (const modifier of step.modifiers) {
                const modifierFn = this.modifiers[modifier.type];
                if (modifierFn) {
                    modifiedResult = modifierFn(modifiedResult, modifier.params, state.stepTime, {
                        state: this.currentState,
                        intensity: this.emotionalIntensity
                    });
                }
            }
        }
        
        // Apply emotional influence
        if (state.params.emotionalInfluence > 0) {
            const emotionalModifier = this.modifiers.emotional;
            modifiedResult = emotionalModifier(modifiedResult, {}, state.stepTime, {
                state: this.currentState,
                intensity: this.emotionalIntensity * state.params.emotionalInfluence
            });
        }
        
        // Apply result to target
        state.target.position.copy(targetCopy.position);
        state.target.rotation.copy(targetCopy.rotation);
        state.target.scale.copy(targetCopy.scale);
        
        return {
            animation: step.animation,
            result: modifiedResult,
            progress: state.stepTime / step.duration,
            sequence: state.currentSequence,
            step: state.currentStep
        };
    }
    
    /**
     * Generate a random animation sequence
     * @param {string} emotionalState - Base emotional state for the sequence
     * @param {number} complexity - Complexity level (0-1)
     * @param {number} duration - Total duration of the sequence
     * @returns {Array} Animation sequence
     */
    generateRandomSequence(emotionalState = 'neutral', complexity = 0.5, duration = 10.0) {
        // Get base sequence for the emotional state
        const baseSequence = this.sequences[emotionalState] || this.sequences.neutral;
        
        // Determine number of steps based on complexity
        const minSteps = 3;
        const maxSteps = 8;
        const steps = Math.floor(minSteps + complexity * (maxSteps - minSteps));
        
        // Available animations and modifiers
        const animations = Object.keys(this.baseAnimations);
        const modifiers = Object.keys(this.modifiers);
        
        // Generate random sequence
        const sequence = [];
        let remainingDuration = duration;
        
        for (let i = 0; i < steps; i++) {
            // Determine step duration
            const isLastStep = i === steps - 1;
            const stepDuration = isLastStep ? 
                remainingDuration : 
                remainingDuration * (0.2 + Math.random() * 0.3);
            
            remainingDuration -= stepDuration;
            
            // Select animation (with higher probability for base sequence animations)
            let animation;
            if (Math.random() < 0.7 && baseSequence.length > 0) {
                const baseStep = baseSequence[Math.floor(Math.random() * baseSequence.length)];
                animation = baseStep.animation;
            } else {
                animation = animations[Math.floor(Math.random() * animations.length)];
            }
            
            // Generate parameters based on animation type
            let params = {};
            switch (animation) {
                case 'pulse':
                    params = {
                        frequency: 0.5 + Math.random() * 2.0,
                        amplitude: 0.05 + Math.random() * 0.15
                    };
                    break;
                case 'rotate':
                    params = {
                        axis: ['x', 'y', 'z', 'xyz'][Math.floor(Math.random() * 4)],
                        speed: 0.2 + Math.random() * 0.8
                    };
                    break;
                case 'float':
                    params = {
                        height: 0.05 + Math.random() * 0.2,
                        frequency: 0.2 + Math.random() * 0.6,
                        horizontalMotion: Math.random() * 0.2
                    };
                    break;
                case 'sway':
                    params = {
                        axis: ['x', 'y', 'z'][Math.floor(Math.random() * 3)],
                        angle: (Math.PI / 20) + Math.random() * (Math.PI / 10),
                        frequency: 0.3 + Math.random() * 0.5
                    };
                    break;
                case 'bounce':
                    params = {
                        height: 0.1 + Math.random() * 0.4,
                        frequency: 0.5 + Math.random() * 2.0
                    };
                    break;
                case 'shake':
                    params = {
                        intensity: 0.05 + Math.random() * 0.15,
                        frequency: 1.0 + Math.random() * 3.0
                    };
                    break;
                case 'spiral':
                    params = {
                        radius: 0.5 + Math.random() * 1.5,
                        height: 0.2 + Math.random() * 0.5,
                        frequency: 0.3 + Math.random() * 0.5,
                        direction: Math.random() > 0.5 ? 1 : -1
                    };
                    break;
                case 'orbit':
                    params = {
                        radius: 1.0 + Math.random() * 2.0,
                        frequency: 0.2 + Math.random() * 0.4,
                        axis: ['xy', 'xz', 'yz'][Math.floor(Math.random() * 3)]
                    };
                    break;
                default:
                    params = {};
            }
            
            // Determine number of modifiers based on complexity
            const modifierCount = Math.floor(Math.random() * (complexity * 3 + 1));
            const stepModifiers = [];
            
            for (let j = 0; j < modifierCount; j++) {
                const modifierType = modifiers[Math.floor(Math.random() * modifiers.length)];
                let modifierParams = {};
                
                switch (modifierType) {
                    case 'ease':
                        const easeTypes = [
                            'inQuad', 'outQuad', 'inOutQuad',
                            'inCubic', 'outCubic', 'inOutCubic',
                            'inElastic', 'outElastic', 'inOutElastic',
                            'inBack', 'outBack', 'inOutBack',
                            'inBounce', 'outBounce', 'inOutBounce'
                        ];
                        modifierParams = {
                            type: easeTypes[Math.floor(Math.random() * easeTypes.length)]
                        };
                        break;
                    case 'noise':
                        modifierParams = {
                            amplitude: 0.05 + Math.random() * 0.1,
                            frequency: 0.5 + Math.random() * 1.5,
                            octaves: 1 + Math.floor(Math.random() * 3)
                        };
                        break;
                    case 'emotional':
                        // No additional parameters needed
                        break;
                    case 'blend':
                        // Skip blend modifier in random generation as it requires a target value
                        continue;
                    case 'delay':
                        modifierParams = {
                            delay: Math.random() * stepDuration * 0.5
                        };
                        break;
                }
                
                stepModifiers.push({
                    type: modifierType,
                    params: modifierParams
                });
            }
            
            // Add step to sequence
            sequence.push({
                animation: animation,
                params: params,
                duration: stepDuration,
                modifiers: stepModifiers
            });
        }
        
        return sequence;
    }
    
    /**
     * Update the procedural animation generator
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Update time
        this.time += deltaTime * this.parameters.speed;
        
        // Update noise parameters
        this.parameters.randomSeed += deltaTime * 0.1;
    }
}

// Export the class
export default new ProceduralAnimationGenerator();
