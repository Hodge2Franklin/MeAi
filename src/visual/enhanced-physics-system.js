/**
 * Enhanced Physics System
 * 
 * This module extends the physics capabilities of the Advanced Animation System
 * with more sophisticated physics-based animations, interactions, and effects.
 */

import * as THREE from 'three';

class EnhancedPhysicsSystem {
    constructor() {
        // Physics world configuration
        this.world = {
            gravity: new THREE.Vector3(0, -9.8, 0),
            airResistance: 0.98,
            objects: [],
            forces: [],
            constraints: [],
            collisionGroups: {},
            timeScale: 1.0,
            fixedTimeStep: 1/60,
            maxSubSteps: 3,
            enableSleeping: true
        };
        
        // Particle physics configuration
        this.particlePhysics = {
            enableWind: true,
            windDirection: new THREE.Vector3(1, 0, 0),
            windStrength: 0.1,
            windVariation: 0.2,
            windChangeSpeed: 0.05,
            enableTurbulence: true,
            turbulenceScale: 0.5,
            turbulenceStrength: 0.3,
            enableVortices: true,
            vortices: [],
            maxVortices: 3
        };
        
        // Soft body physics configuration
        this.softBodyPhysics = {
            enabled: true,
            iterations: 5,
            stiffness: 0.8,
            damping: 0.2,
            massPerNode: 1.0
        };
        
        // Fluid physics configuration
        this.fluidPhysics = {
            enabled: true,
            resolution: 32,
            viscosity: 0.1,
            diffusion: 0.01,
            iterations: 4
        };
        
        // Cloth physics configuration
        this.clothPhysics = {
            enabled: true,
            resolution: { x: 10, y: 10 },
            stiffness: 0.9,
            damping: 0.03,
            mass: 1.0
        };
        
        // Performance monitoring
        this.performance = {
            lastUpdateTime: 0,
            updateCount: 0,
            averageUpdateTime: 0,
            maxUpdateTime: 0,
            adaptivePhysics: true,
            qualityLevel: 'high'
        };
        
        // Initialize physics
        this.initialize();
    }
    
    /**
     * Initialize the enhanced physics system
     */
    initialize() {
        // Set up default forces
        this.addForce('gravity', (object, dt) => {
            if (object.mass <= 0 || object.isStatic) return new THREE.Vector3();
            return this.world.gravity.clone().multiplyScalar(object.mass);
        });
        
        this.addForce('air-resistance', (object, dt) => {
            if (object.mass <= 0 || object.isStatic) return new THREE.Vector3();
            return object.velocity.clone().negate().multiplyScalar(
                object.velocity.lengthSq() * 0.01 * (object.airFriction || 1.0)
            );
        });
        
        this.addForce('wind', (object, dt) => {
            if (object.mass <= 0 || object.isStatic || !this.particlePhysics.enableWind) 
                return new THREE.Vector3();
                
            // Calculate wind force based on object surface area and wind direction
            const surfaceArea = object.surfaceArea || 1.0;
            const windStrength = this.particlePhysics.windStrength * 
                (1.0 + (Math.sin(Date.now() * 0.001) * this.particlePhysics.windVariation));
                
            return this.particlePhysics.windDirection.clone()
                .multiplyScalar(windStrength * surfaceArea);
        });
        
        // Set up default constraints
        this.addConstraint('boundary', (object) => {
            if (object.isStatic) return;
            
            const boundary = 20;
            const position = object.position;
            const restitution = object.restitution || 0.8;
            
            // X-axis boundary
            if (Math.abs(position.x) > boundary) {
                position.x = Math.sign(position.x) * boundary;
                object.velocity.x *= -restitution;
            }
            
            // Y-axis boundary
            if (Math.abs(position.y) > boundary) {
                position.y = Math.sign(position.y) * boundary;
                object.velocity.y *= -restitution;
            }
            
            // Z-axis boundary
            if (Math.abs(position.z) > boundary) {
                position.z = Math.sign(position.z) * boundary;
                object.velocity.z *= -restitution;
            }
        });
        
        // Create vortices for particle effects
        this.createVortices();
        
        console.log('Enhanced Physics System initialized');
    }
    
    /**
     * Create vortices for particle motion
     */
    createVortices() {
        this.particlePhysics.vortices = [];
        
        for (let i = 0; i < this.particlePhysics.maxVortices; i++) {
            this.particlePhysics.vortices.push({
                position: new THREE.Vector3(
                    (Math.random() * 2 - 1) * 5,
                    (Math.random() * 2 - 1) * 5,
                    (Math.random() * 2 - 1) * 5
                ),
                axis: new THREE.Vector3(
                    Math.random() * 2 - 1,
                    Math.random() * 2 - 1,
                    Math.random() * 2 - 1
                ).normalize(),
                strength: Math.random() * 0.5 + 0.1,
                radius: Math.random() * 3 + 1,
                falloff: Math.random() * 1 + 1.5,
                movementSpeed: Math.random() * 0.02 + 0.01,
                rotationSpeed: Math.random() * 0.02 + 0.01
            });
        }
        
        // Add vortex force
        this.addForce('vortex', (object, dt) => {
            if (object.mass <= 0 || object.isStatic || !this.particlePhysics.enableVortices) 
                return new THREE.Vector3();
            
            const force = new THREE.Vector3();
            
            for (const vortex of this.particlePhysics.vortices) {
                // Vector from vortex to object
                const toObject = new THREE.Vector3().subVectors(object.position, vortex.position);
                
                // Distance to vortex axis
                const projection = toObject.dot(vortex.axis);
                const axisPoint = new THREE.Vector3().copy(vortex.axis).multiplyScalar(projection);
                const distanceVector = new THREE.Vector3().subVectors(toObject, axisPoint);
                const distance = distanceVector.length();
                
                // Skip if too far from vortex
                if (distance > vortex.radius * 3) continue;
                
                // Calculate force direction (perpendicular to both axis and distance vector)
                const forceDirection = new THREE.Vector3().crossVectors(vortex.axis, distanceVector).normalize();
                
                // Calculate force strength based on distance
                let strength = 0;
                if (distance < vortex.radius) {
                    // Inside core - force increases with distance
                    strength = vortex.strength * (distance / vortex.radius);
                } else {
                    // Outside core - force decreases with distance
                    strength = vortex.strength * Math.pow(vortex.radius / distance, vortex.falloff);
                }
                
                // Add to total force
                force.add(forceDirection.multiplyScalar(strength));
            }
            
            return force;
        });
    }
    
    /**
     * Update vortex positions and orientations
     * @param {number} dt - Delta time in seconds
     */
    updateVortices(dt) {
        for (const vortex of this.particlePhysics.vortices) {
            // Move vortex position
            vortex.position.x += Math.sin(Date.now() * vortex.movementSpeed * 0.001) * dt;
            vortex.position.y += Math.cos(Date.now() * vortex.movementSpeed * 0.002) * dt;
            vortex.position.z += Math.sin(Date.now() * vortex.movementSpeed * 0.003) * dt;
            
            // Rotate vortex axis
            const rotationAxis = new THREE.Vector3(
                Math.sin(Date.now() * 0.001),
                Math.cos(Date.now() * 0.001),
                Math.sin(Date.now() * 0.002)
            ).normalize();
            
            const rotationAngle = vortex.rotationSpeed * dt;
            vortex.axis.applyAxisAngle(rotationAxis, rotationAngle).normalize();
        }
    }
    
    /**
     * Add a force to the physics simulation
     * @param {string} name - Name of the force
     * @param {Function} forceFn - Function that calculates the force
     */
    addForce(name, forceFn) {
        // Remove existing force with the same name
        this.world.forces = this.world.forces.filter(force => force.name !== name);
        
        // Add new force
        this.world.forces.push({
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
        // Remove existing constraint with the same name
        this.world.constraints = this.world.constraints.filter(constraint => constraint.name !== name);
        
        // Add new constraint
        this.world.constraints.push({
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
            angularVelocity: new THREE.Vector3(),
            angularAcceleration: new THREE.Vector3(),
            mass: params.mass || 1.0,
            inverseMass: params.mass > 0 ? 1.0 / params.mass : 0,
            inertia: params.inertia || new THREE.Vector3(1, 1, 1),
            restitution: params.restitution || 0.8,
            friction: params.friction || 0.1,
            airFriction: params.airFriction || 1.0,
            surfaceArea: params.surfaceArea || 1.0,
            isStatic: params.isStatic || false,
            isSleeping: false,
            sleepThreshold: params.sleepThreshold || 0.1,
            sleepTime: 0,
            collisionGroup: params.collisionGroup || 'default',
            collidesWith: params.collidesWith || ['default'],
            collider: params.collider || {
                type: 'sphere',
                radius: 1.0
            },
            onCollision: params.onCollision || null,
            userData: params.userData || {}
        };
        
        // Add to physics world
        this.world.objects.push(physicsObject);
        
        // Add to collision group
        if (!this.world.collisionGroups[physicsObject.collisionGroup]) {
            this.world.collisionGroups[physicsObject.collisionGroup] = [];
        }
        this.world.collisionGroups[physicsObject.collisionGroup].push(physicsObject);
        
        return physicsObject;
    }
    
    /**
     * Create a soft body physics object
     * @param {THREE.Object3D} object - Three.js object to add soft body physics to
     * @param {Object} params - Soft body parameters
     * @returns {Object} Soft body physics object
     */
    createSoftBody(object, params = {}) {
        if (!this.softBodyPhysics.enabled) {
            console.warn('Soft body physics is disabled');
            return this.createPhysicsObject(object, params);
        }
        
        // Get or create geometry
        let geometry = object.geometry;
        if (!geometry) {
            console.warn('Object has no geometry, creating default sphere');
            geometry = new THREE.SphereGeometry(1, 16, 16);
            object.geometry = geometry;
        }
        
        // Create nodes for each vertex
        const nodes = [];
        const positions = geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            const position = new THREE.Vector3(
                positions[i],
                positions[i + 1],
                positions[i + 2]
            );
            
            nodes.push({
                originalPosition: position.clone(),
                position: position.clone(),
                previousPosition: position.clone(),
                velocity: new THREE.Vector3(),
                mass: params.massPerNode || this.softBodyPhysics.massPerNode,
                isFixed: false
            });
        }
        
        // Create connections between nodes
        const connections = [];
        const indices = geometry.index ? geometry.index.array : null;
        
        if (indices) {
            // Use indexed geometry to create connections
            for (let i = 0; i < indices.length; i += 3) {
                const a = indices[i];
                const b = indices[i + 1];
                const c = indices[i + 2];
                
                connections.push({
                    a: a,
                    b: b,
                    restLength: nodes[a].position.distanceTo(nodes[b].position),
                    stiffness: params.stiffness || this.softBodyPhysics.stiffness
                });
                
                connections.push({
                    a: b,
                    b: c,
                    restLength: nodes[b].position.distanceTo(nodes[c].position),
                    stiffness: params.stiffness || this.softBodyPhysics.stiffness
                });
                
                connections.push({
                    a: c,
                    b: a,
                    restLength: nodes[c].position.distanceTo(nodes[a].position),
                    stiffness: params.stiffness || this.softBodyPhysics.stiffness
                });
            }
        } else {
            // Non-indexed geometry, connect nearby vertices
            const maxDistance = params.connectionDistance || 0.5;
            
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const distance = nodes[i].position.distanceTo(nodes[j].position);
                    
                    if (distance < maxDistance) {
                        connections.push({
                            a: i,
                            b: j,
                            restLength: distance,
                            stiffness: params.stiffness || this.softBodyPhysics.stiffness
                        });
                    }
                }
            }
        }
        
        // Create soft body object
        const softBody = {
            object: object,
            nodes: nodes,
            connections: connections,
            damping: params.damping || this.softBodyPhysics.damping,
            iterations: params.iterations || this.softBodyPhysics.iterations,
            isStatic: params.isStatic || false,
            collisionGroup: params.collisionGroup || 'softBody',
            collidesWith: params.collidesWith || ['default'],
            onUpdate: params.onUpdate || null,
            userData: params.userData || {}
        };
        
        // Add to physics world
        this.world.objects.push(softBody);
        
        // Add to collision group
        if (!this.world.collisionGroups[softBody.collisionGroup]) {
            this.world.collisionGroups[softBody.collisionGroup] = [];
        }
        this.world.collisionGroups[softBody.collisionGroup].push(softBody);
        
        return softBody;
    }
    
    /**
     * Create a cloth physics object
     * @param {THREE.Object3D} object - Three.js object to add cloth physics to
     * @param {Object} params - Cloth parameters
     * @returns {Object} Cloth physics object
     */
    createCloth(object, params = {}) {
        if (!this.clothPhysics.enabled) {
            console.warn('Cloth physics is disabled');
            return this.createPhysicsObject(object, params);
        }
        
        // Get cloth dimensions
        const width = params.width || 10;
        const height = params.height || 10;
        const segmentsX = params.segmentsX || this.clothPhysics.resolution.x;
        const segmentsY = params.segmentsY || this.clothPhysics.resolution.y;
        
        // Create cloth geometry if not provided
        if (!object.geometry) {
            const geometry = new THREE.PlaneGeometry(width, height, segmentsX, segmentsY);
            object.geometry = geometry;
        }
        
        // Create nodes for each vertex
        const nodes = [];
        const positions = object.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            const position = new THREE.Vector3(
                positions[i],
                positions[i + 1],
                positions[i + 2]
            );
            
            // Determine if this node should be fixed (e.g., top edge)
            const vertexIndex = i / 3;
            const x = vertexIndex % (segmentsX + 1);
            const y = Math.floor(vertexIndex / (segmentsX + 1));
            
            const isFixed = params.fixedNodes ? 
                params.fixedNodes(x, y, segmentsX, segmentsY) : 
                (y === segmentsY); // Default: fix top edge
            
            nodes.push({
                originalPosition: position.clone(),
                position: position.clone(),
                previousPosition: position.clone(),
                velocity: new THREE.Vector3(),
                mass: params.mass || this.clothPhysics.mass,
                isFixed: isFixed
            });
        }
        
        // Create connections between nodes
        const connections = [];
        
        // Structural connections (grid)
        for (let y = 0; y <= segmentsY; y++) {
            for (let x = 0; x <= segmentsX; x++) {
                const index = y * (segmentsX + 1) + x;
                
                // Connect to right neighbor
                if (x < segmentsX) {
                    connections.push({
                        a: index,
                        b: index + 1,
                        restLength: nodes[index].position.distanceTo(nodes[index + 1].position),
                        stiffness: params.stiffness || this.clothPhysics.stiffness
                    });
                }
                
                // Connect to bottom neighbor
                if (y < segmentsY) {
                    connections.push({
                        a: index,
                        b: index + (segmentsX + 1),
                        restLength: nodes[index].position.distanceTo(nodes[index + (segmentsX + 1)].position),
                        stiffness: params.stiffness || this.clothPhysics.stiffness
                    });
                }
                
                // Connect to bottom-right neighbor (diagonal)
                if (x < segmentsX && y < segmentsY) {
                    connections.push({
                        a: index,
                        b: index + (segmentsX + 1) + 1,
                        restLength: nodes[index].position.distanceTo(nodes[index + (segmentsX + 1) + 1].position),
                        stiffness: (params.stiffness || this.clothPhysics.stiffness) * 0.5 // Diagonals are less stiff
                    });
                }
                
                // Connect to bottom-left neighbor (diagonal)
                if (x > 0 && y < segmentsY) {
                    connections.push({
                        a: index,
                        b: index + (segmentsX + 1) - 1,
                        restLength: nodes[index].position.distanceTo(nodes[index + (segmentsX + 1) - 1].position),
                        stiffness: (params.stiffness || this.clothPhysics.stiffness) * 0.5 // Diagonals are less stiff
                    });
                }
            }
        }
        
        // Create cloth object
        const cloth = {
            object: object,
            nodes: nodes,
            connections: connections,
            damping: params.damping || this.clothPhysics.damping,
            iterations: params.iterations || this.clothPhysics.iterations,
            isStatic: false,
            collisionGroup: params.collisionGroup || 'cloth',
            collidesWith: params.collidesWith || ['default'],
            onUpdate: params.onUpdate || null,
            userData: params.userData || {}
        };
        
        // Add to physics world
        this.world.objects.push(cloth);
        
        // Add to collision group
        if (!this.world.collisionGroups[cloth.collisionGroup]) {
            this.world.collisionGroups[cloth.collisionGroup] = [];
        }
        this.world.collisionGroups[cloth.collisionGroup].push(cloth);
        
        return cloth;
    }
    
    /**
     * Create a particle emitter with physics
     * @param {Object} params - Emitter parameters
     * @returns {Object} Particle emitter
     */
    createParticleEmitter(params = {}) {
        const emitter = {
            position: params.position || new THREE.Vector3(),
            direction: params.direction || new THREE.Vector3(0, 1, 0),
            spread: params.spread || Math.PI / 6,
            rate: params.rate || 10, // particles per second
            burstCount: params.burstCount || 0,
            lifetime: params.lifetime || { min: 1, max: 3 },
            speed: params.speed || { min: 1, max: 3 },
            size: params.size || { min: 0.1, max: 0.3 },
            color: params.color || new THREE.Color(1, 1, 1),
            colorEnd: params.colorEnd || null,
            opacity: params.opacity || { min: 1, max: 1 },
            opacityEnd: params.opacityEnd || { min: 0, max: 0 },
            rotation: params.rotation || { min: 0, max: 0 },
            rotationSpeed: params.rotationSpeed || { min: 0, max: 0 },
            gravity: params.gravity !== undefined ? params.gravity : 1.0,
            drag: params.drag || 0.1,
            wiggle: params.wiggle || 0,
            texture: params.texture || null,
            blending: params.blending || THREE.AdditiveBlending,
            emitterShape: params.emitterShape || 'point', // point, sphere, box, disc
            emitterRadius: params.emitterRadius || 1.0,
            emitterSize: params.emitterSize || new THREE.Vector3(1, 1, 1),
            isActive: params.isActive !== undefined ? params.isActive : true,
            usePhysics: params.usePhysics !== undefined ? params.usePhysics : true,
            collisionGroup: params.collisionGroup || 'particle',
            collidesWith: params.collidesWith || [],
            onParticleCreate: params.onParticleCreate || null,
            onParticleUpdate: params.onParticleUpdate || null,
            onParticleDie: params.onParticleDie || null,
            
            // Internal properties
            particles: [],
            nextEmitTime: 0,
            scene: params.scene || null
        };
        
        // Create particle material if texture is provided
        if (emitter.texture) {
            const material = new THREE.SpriteMaterial({
                map: emitter.texture,
                color: emitter.color,
                blending: emitter.blending,
                transparent: true
            });
            emitter.material = material;
        }
        
        return emitter;
    }
    
    /**
     * Emit particles from an emitter
     * @param {Object} emitter - Particle emitter
     * @param {number} count - Number of particles to emit
     */
    emitParticles(emitter, count) {
        if (!emitter.isActive || !emitter.scene) return;
        
        for (let i = 0; i < count; i++) {
            // Create particle geometry and material
            let particle;
            
            if (emitter.material) {
                // Use sprite for textured particles
                particle = new THREE.Sprite(emitter.material.clone());
            } else {
                // Use mesh for untextured particles
                const geometry = new THREE.SphereGeometry(1, 8, 8);
                const material = new THREE.MeshBasicMaterial({
                    color: emitter.color,
                    transparent: true,
                    blending: emitter.blending
                });
                particle = new THREE.Mesh(geometry, material);
            }
            
            // Set initial position based on emitter shape
            let position = new THREE.Vector3();
            
            switch (emitter.emitterShape) {
                case 'sphere':
                    // Random position in sphere
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.acos(2 * Math.random() - 1);
                    const r = emitter.emitterRadius * Math.cbrt(Math.random()); // Cube root for uniform distribution
                    
                    position.set(
                        r * Math.sin(phi) * Math.cos(theta),
                        r * Math.sin(phi) * Math.sin(theta),
                        r * Math.cos(phi)
                    );
                    break;
                    
                case 'box':
                    // Random position in box
                    position.set(
                        (Math.random() * 2 - 1) * emitter.emitterSize.x / 2,
                        (Math.random() * 2 - 1) * emitter.emitterSize.y / 2,
                        (Math.random() * 2 - 1) * emitter.emitterSize.z / 2
                    );
                    break;
                    
                case 'disc':
                    // Random position on disc
                    const radius = Math.sqrt(Math.random()) * emitter.emitterRadius; // Square root for uniform distribution
                    const angle = Math.random() * Math.PI * 2;
                    
                    position.set(
                        radius * Math.cos(angle),
                        0,
                        radius * Math.sin(angle)
                    );
                    break;
                    
                default: // 'point'
                    // All particles start at the same point
                    position.set(0, 0, 0);
                    break;
            }
            
            // Add emitter position
            position.add(emitter.position);
            particle.position.copy(position);
            
            // Set initial size
            const size = emitter.size.min + Math.random() * (emitter.size.max - emitter.size.min);
            particle.scale.set(size, size, size);
            
            // Set initial rotation
            const rotation = emitter.rotation.min + Math.random() * (emitter.rotation.max - emitter.rotation.min);
            particle.rotation.z = rotation;
            
            // Set initial color and opacity
            const opacity = emitter.opacity.min + Math.random() * (emitter.opacity.max - emitter.opacity.min);
            
            if (particle.material) {
                particle.material.opacity = opacity;
            }
            
            // Calculate initial velocity
            const direction = new THREE.Vector3().copy(emitter.direction);
            
            // Add spread
            if (emitter.spread > 0) {
                const spreadX = (Math.random() * 2 - 1) * emitter.spread;
                const spreadY = (Math.random() * 2 - 1) * emitter.spread;
                
                direction.x += spreadX;
                direction.y += spreadY;
                direction.normalize();
            }
            
            // Set speed
            const speed = emitter.speed.min + Math.random() * (emitter.speed.max - emitter.speed.min);
            const velocity = direction.clone().multiplyScalar(speed);
            
            // Set lifetime
            const lifetime = emitter.lifetime.min + Math.random() * (emitter.lifetime.max - emitter.lifetime.min);
            
            // Create particle data
            const particleData = {
                object: particle,
                position: particle.position,
                velocity: velocity,
                acceleration: new THREE.Vector3(),
                age: 0,
                lifetime: lifetime,
                size: size,
                sizeStart: size,
                sizeEnd: size * 0.1, // Default to 10% of original size at end of life
                rotation: rotation,
                rotationSpeed: emitter.rotationSpeed.min + Math.random() * (emitter.rotationSpeed.max - emitter.rotationSpeed.min),
                color: emitter.color.clone(),
                colorEnd: emitter.colorEnd ? emitter.colorEnd.clone() : emitter.color.clone(),
                opacity: opacity,
                opacityEnd: emitter.opacityEnd.min + Math.random() * (emitter.opacityEnd.max - emitter.opacityEnd.min),
                gravity: emitter.gravity,
                drag: emitter.drag,
                wiggle: emitter.wiggle,
                wiggleOffset: Math.random() * 100, // Random offset for wiggle effect
                usePhysics: emitter.usePhysics,
                collisionGroup: emitter.collisionGroup,
                collidesWith: emitter.collidesWith,
                hasCollided: false
            };
            
            // Add to scene
            emitter.scene.add(particle);
            
            // Add to particles array
            emitter.particles.push(particleData);
            
            // Call onParticleCreate callback
            if (emitter.onParticleCreate) {
                emitter.onParticleCreate(particleData);
            }
        }
    }
    
    /**
     * Update particle emitter
     * @param {Object} emitter - Particle emitter
     * @param {number} dt - Delta time in seconds
     */
    updateParticleEmitter(emitter, dt) {
        if (!emitter.isActive) return;
        
        // Emit new particles
        if (emitter.rate > 0) {
            emitter.nextEmitTime -= dt;
            
            if (emitter.nextEmitTime <= 0) {
                const count = Math.floor(emitter.rate * Math.abs(emitter.nextEmitTime) + 1);
                this.emitParticles(emitter, count);
                emitter.nextEmitTime = 1 / emitter.rate;
            }
        }
        
        // Emit burst particles
        if (emitter.burstCount > 0) {
            this.emitParticles(emitter, emitter.burstCount);
            emitter.burstCount = 0;
        }
        
        // Update existing particles
        for (let i = emitter.particles.length - 1; i >= 0; i--) {
            const particle = emitter.particles[i];
            
            // Update age
            particle.age += dt;
            
            // Remove if lifetime exceeded
            if (particle.age >= particle.lifetime) {
                // Call onParticleDie callback
                if (emitter.onParticleDie) {
                    emitter.onParticleDie(particle);
                }
                
                // Remove from scene
                emitter.scene.remove(particle.object);
                
                // Remove from particles array
                emitter.particles.splice(i, 1);
                continue;
            }
            
            // Calculate life progress (0 to 1)
            const progress = particle.age / particle.lifetime;
            
            // Update physics
            if (particle.usePhysics) {
                // Apply gravity
                particle.acceleration.y = -this.world.gravity.y * particle.gravity;
                
                // Apply drag
                particle.velocity.multiplyScalar(1 - particle.drag * dt);
                
                // Apply wiggle
                if (particle.wiggle > 0) {
                    const wiggleTime = particle.age + particle.wiggleOffset;
                    particle.velocity.x += Math.sin(wiggleTime * 10) * particle.wiggle * dt;
                    particle.velocity.z += Math.cos(wiggleTime * 10) * particle.wiggle * dt;
                }
                
                // Update velocity and position
                particle.velocity.add(particle.acceleration.clone().multiplyScalar(dt));
                particle.position.add(particle.velocity.clone().multiplyScalar(dt));
            }
            
            // Update visual properties
            
            // Size
            const size = particle.sizeStart + (particle.sizeEnd - particle.sizeStart) * progress;
            particle.object.scale.set(size, size, size);
            
            // Rotation
            particle.object.rotation.z += particle.rotationSpeed * dt;
            
            // Color
            if (particle.object.material && particle.colorEnd) {
                const r = particle.color.r + (particle.colorEnd.r - particle.color.r) * progress;
                const g = particle.color.g + (particle.colorEnd.g - particle.color.g) * progress;
                const b = particle.color.b + (particle.colorEnd.b - particle.color.b) * progress;
                
                particle.object.material.color.setRGB(r, g, b);
            }
            
            // Opacity
            if (particle.object.material) {
                const opacity = particle.opacity + (particle.opacityEnd - particle.opacity) * progress;
                particle.object.material.opacity = opacity;
            }
            
            // Call onParticleUpdate callback
            if (emitter.onParticleUpdate) {
                emitter.onParticleUpdate(particle, progress);
            }
        }
    }
    
    /**
     * Update the physics simulation
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        // Start performance monitoring
        const startTime = performance.now();
        
        // Scale time if needed
        dt *= this.world.timeScale;
        
        // Use fixed time step if enabled
        if (this.world.fixedTimeStep > 0) {
            const subSteps = Math.min(Math.ceil(dt / this.world.fixedTimeStep), this.world.maxSubSteps);
            const subDt = dt / subSteps;
            
            for (let i = 0; i < subSteps; i++) {
                this.stepSimulation(subDt);
            }
        } else {
            this.stepSimulation(dt);
        }
        
        // Update vortices
        this.updateVortices(dt);
        
        // End performance monitoring
        const endTime = performance.now();
        const updateTime = endTime - startTime;
        
        this.performance.lastUpdateTime = updateTime;
        this.performance.updateCount++;
        this.performance.averageUpdateTime = 
            (this.performance.averageUpdateTime * (this.performance.updateCount - 1) + updateTime) / 
            this.performance.updateCount;
        this.performance.maxUpdateTime = Math.max(this.performance.maxUpdateTime, updateTime);
        
        // Adjust physics quality if adaptive physics is enabled
        if (this.performance.adaptivePhysics && this.performance.updateCount % 60 === 0) {
            this.adjustPhysicsQuality();
        }
    }
    
    /**
     * Perform a single step of the physics simulation
     * @param {number} dt - Delta time in seconds
     */
    stepSimulation(dt) {
        // Update rigid bodies
        for (const object of this.world.objects) {
            // Skip static objects and soft bodies
            if (object.isStatic || object.nodes) continue;
            
            // Skip sleeping objects
            if (object.isSleeping) continue;
            
            // Reset acceleration
            object.acceleration.set(0, 0, 0);
            object.angularAcceleration.set(0, 0, 0);
            
            // Apply forces
            for (const force of this.world.forces) {
                const forceVector = force.apply(object, dt);
                if (forceVector && forceVector.lengthSq() > 0) {
                    // Apply linear force
                    object.acceleration.add(forceVector.clone().multiplyScalar(object.inverseMass));
                }
            }
            
            // Update velocity and position
            object.velocity.add(object.acceleration.clone().multiplyScalar(dt));
            object.position.add(object.velocity.clone().multiplyScalar(dt));
            
            // Update rotation
            object.object.rotation.x += object.angularVelocity.x * dt;
            object.object.rotation.y += object.angularVelocity.y * dt;
            object.object.rotation.z += object.angularVelocity.z * dt;
            
            // Apply constraints
            for (const constraint of this.world.constraints) {
                constraint.apply(object);
            }
            
            // Check for sleeping
            if (this.world.enableSleeping) {
                const movementSq = object.velocity.lengthSq() + object.angularVelocity.lengthSq();
                
                if (movementSq < object.sleepThreshold) {
                    object.sleepTime += dt;
                    
                    if (object.sleepTime > 1.0) {
                        object.isSleeping = true;
                    }
                } else {
                    object.sleepTime = 0;
                    object.isSleeping = false;
                }
            }
        }
        
        // Update soft bodies
        for (const object of this.world.objects) {
            // Skip non-soft bodies
            if (!object.nodes) continue;
            
            // Skip static objects
            if (object.isStatic) continue;
            
            // Apply forces to each node
            for (const node of object.nodes) {
                // Skip fixed nodes
                if (node.isFixed) continue;
                
                // Save previous position
                node.previousPosition.copy(node.position);
                
                // Apply gravity
                node.velocity.y -= this.world.gravity.y * dt;
                
                // Apply air resistance
                node.velocity.multiplyScalar(this.world.airResistance);
                
                // Update position
                node.position.add(node.velocity.clone().multiplyScalar(dt));
            }
            
            // Apply constraints (multiple iterations for stability)
            for (let iteration = 0; iteration < object.iterations; iteration++) {
                // Apply connection constraints
                for (const connection of object.connections) {
                    const nodeA = object.nodes[connection.a];
                    const nodeB = object.nodes[connection.b];
                    
                    // Skip if either node is fixed
                    if (nodeA.isFixed && nodeB.isFixed) continue;
                    
                    // Calculate current distance
                    const delta = new THREE.Vector3().subVectors(nodeB.position, nodeA.position);
                    const distance = delta.length();
                    
                    // Skip if distance is zero
                    if (distance === 0) continue;
                    
                    // Calculate correction
                    const difference = (distance - connection.restLength) / distance;
                    const correction = delta.multiplyScalar(difference * connection.stiffness);
                    
                    // Apply correction
                    if (!nodeA.isFixed) {
                        nodeA.position.add(correction.clone().multiplyScalar(0.5));
                    }
                    
                    if (!nodeB.isFixed) {
                        nodeB.position.sub(correction.clone().multiplyScalar(0.5));
                    }
                }
            }
            
            // Update velocities
            for (const node of object.nodes) {
                // Skip fixed nodes
                if (node.isFixed) continue;
                
                // Calculate new velocity
                node.velocity.subVectors(node.position, node.previousPosition).divideScalar(dt);
                
                // Apply damping
                node.velocity.multiplyScalar(1 - object.damping);
            }
            
            // Update geometry if needed
            if (object.object.geometry) {
                const positions = object.object.geometry.attributes.position.array;
                
                for (let i = 0; i < object.nodes.length; i++) {
                    positions[i * 3] = object.nodes[i].position.x;
                    positions[i * 3 + 1] = object.nodes[i].position.y;
                    positions[i * 3 + 2] = object.nodes[i].position.z;
                }
                
                object.object.geometry.attributes.position.needsUpdate = true;
                object.object.geometry.computeVertexNormals();
            }
            
            // Call onUpdate callback
            if (object.onUpdate) {
                object.onUpdate(object);
            }
        }
        
        // Detect and resolve collisions
        this.detectCollisions();
    }
    
    /**
     * Detect and resolve collisions between physics objects
     */
    detectCollisions() {
        // Check collisions between collision groups
        for (const groupName in this.world.collisionGroups) {
            const group = this.world.collisionGroups[groupName];
            
            for (const object of group) {
                // Skip if object doesn't collide with anything
                if (!object.collidesWith || object.collidesWith.length === 0) continue;
                
                // Check collisions with other groups
                for (const targetGroupName of object.collidesWith) {
                    if (!this.world.collisionGroups[targetGroupName]) continue;
                    
                    const targetGroup = this.world.collisionGroups[targetGroupName];
                    
                    for (const targetObject of targetGroup) {
                        // Skip self-collision
                        if (object === targetObject) continue;
                        
                        // Check collision
                        const collision = this.checkCollision(object, targetObject);
                        
                        if (collision) {
                            // Resolve collision
                            this.resolveCollision(object, targetObject, collision);
                            
                            // Call collision callbacks
                            if (object.onCollision) {
                                object.onCollision(targetObject, collision);
                            }
                            
                            if (targetObject.onCollision) {
                                targetObject.onCollision(object, {
                                    point: collision.point,
                                    normal: collision.normal.clone().negate(),
                                    depth: collision.depth
                                });
                            }
                        }
                    }
                }
            }
        }
    }
    
    /**
     * Check for collision between two physics objects
     * @param {Object} objectA - First physics object
     * @param {Object} objectB - Second physics object
     * @returns {Object|null} Collision data or null if no collision
     */
    checkCollision(objectA, objectB) {
        // Handle soft body collisions differently
        if (objectA.nodes || objectB.nodes) {
            return this.checkSoftBodyCollision(objectA, objectB);
        }
        
        // Get colliders
        const colliderA = objectA.collider;
        const colliderB = objectB.collider;
        
        // Only sphere-sphere collisions for now
        if (colliderA.type === 'sphere' && colliderB.type === 'sphere') {
            const distance = objectA.position.distanceTo(objectB.position);
            const minDistance = colliderA.radius + colliderB.radius;
            
            if (distance < minDistance) {
                // Calculate collision normal
                const normal = new THREE.Vector3().subVectors(objectB.position, objectA.position).normalize();
                
                // Calculate collision depth
                const depth = minDistance - distance;
                
                // Calculate collision point
                const point = new THREE.Vector3().copy(objectA.position).add(
                    normal.clone().multiplyScalar(colliderA.radius)
                );
                
                return {
                    point: point,
                    normal: normal,
                    depth: depth
                };
            }
        }
        
        return null;
    }
    
    /**
     * Check for collision between a soft body and another object
     * @param {Object} objectA - First physics object
     * @param {Object} objectB - Second physics object
     * @returns {Object|null} Collision data or null if no collision
     */
    checkSoftBodyCollision(objectA, objectB) {
        // Determine which object is the soft body
        const softBody = objectA.nodes ? objectA : objectB;
        const rigidBody = objectA.nodes ? objectB : objectA;
        
        // Only handle sphere colliders for rigid bodies for now
        if (rigidBody.collider.type !== 'sphere') return null;
        
        // Check each node of the soft body
        let hasCollision = false;
        const collisions = [];
        
        for (const node of softBody.nodes) {
            const distance = node.position.distanceTo(rigidBody.position);
            const minDistance = rigidBody.collider.radius;
            
            if (distance < minDistance) {
                // Calculate collision normal
                const normal = new THREE.Vector3().subVectors(node.position, rigidBody.position).normalize();
                
                // Calculate collision depth
                const depth = minDistance - distance;
                
                // Calculate collision point
                const point = new THREE.Vector3().copy(rigidBody.position).add(
                    normal.clone().multiplyScalar(rigidBody.collider.radius)
                );
                
                collisions.push({
                    node: node,
                    point: point,
                    normal: normal,
                    depth: depth
                });
                
                hasCollision = true;
            }
        }
        
        if (hasCollision) {
            // Find deepest collision
            let deepestCollision = collisions[0];
            
            for (let i = 1; i < collisions.length; i++) {
                if (collisions[i].depth > deepestCollision.depth) {
                    deepestCollision = collisions[i];
                }
            }
            
            return {
                point: deepestCollision.point,
                normal: deepestCollision.normal.clone(),
                depth: deepestCollision.depth,
                collisions: collisions
            };
        }
        
        return null;
    }
    
    /**
     * Resolve collision between two physics objects
     * @param {Object} objectA - First physics object
     * @param {Object} objectB - Second physics object
     * @param {Object} collision - Collision data
     */
    resolveCollision(objectA, objectB, collision) {
        // Handle soft body collisions differently
        if (objectA.nodes || objectB.nodes) {
            this.resolveSoftBodyCollision(objectA, objectB, collision);
            return;
        }
        
        // Skip if either object is static
        if (objectA.isStatic && objectB.isStatic) return;
        
        // Calculate relative velocity
        const relativeVelocity = new THREE.Vector3().subVectors(
            objectB.velocity,
            objectA.velocity
        );
        
        // Calculate relative velocity along normal
        const normalVelocity = relativeVelocity.dot(collision.normal);
        
        // Skip if objects are moving away from each other
        if (normalVelocity > 0) return;
        
        // Calculate restitution (bounciness)
        const restitution = Math.min(objectA.restitution, objectB.restitution);
        
        // Calculate impulse scalar
        let impulseScalar = -(1 + restitution) * normalVelocity;
        impulseScalar /= objectA.inverseMass + objectB.inverseMass;
        
        // Apply impulse
        const impulse = collision.normal.clone().multiplyScalar(impulseScalar);
        
        if (!objectA.isStatic) {
            objectA.velocity.sub(impulse.clone().multiplyScalar(objectA.inverseMass));
        }
        
        if (!objectB.isStatic) {
            objectB.velocity.add(impulse.clone().multiplyScalar(objectB.inverseMass));
        }
        
        // Resolve penetration
        const percent = 0.2; // Penetration resolution strength (0.2 = 20%)
        const slop = 0.01; // Penetration allowance
        
        let correction = Math.max(collision.depth - slop, 0) * percent / 
            (objectA.inverseMass + objectB.inverseMass);
            
        correction = collision.normal.clone().multiplyScalar(correction);
        
        if (!objectA.isStatic) {
            objectA.position.sub(correction.clone().multiplyScalar(objectA.inverseMass));
        }
        
        if (!objectB.isStatic) {
            objectB.position.add(correction.clone().multiplyScalar(objectB.inverseMass));
        }
        
        // Wake up sleeping objects
        if (this.world.enableSleeping) {
            objectA.isSleeping = false;
            objectA.sleepTime = 0;
            
            objectB.isSleeping = false;
            objectB.sleepTime = 0;
        }
    }
    
    /**
     * Resolve collision between a soft body and another object
     * @param {Object} objectA - First physics object
     * @param {Object} objectB - Second physics object
     * @param {Object} collision - Collision data
     */
    resolveSoftBodyCollision(objectA, objectB, collision) {
        // Determine which object is the soft body
        const softBody = objectA.nodes ? objectA : objectB;
        const rigidBody = objectA.nodes ? objectB : objectA;
        
        // Skip if rigid body is static
        if (rigidBody.isStatic) return;
        
        // Resolve each collision
        for (const nodeCollision of collision.collisions) {
            const node = nodeCollision.node;
            
            // Skip if node is fixed
            if (node.isFixed) continue;
            
            // Calculate relative velocity
            const relativeVelocity = new THREE.Vector3().subVectors(
                rigidBody.velocity,
                node.velocity
            );
            
            // Calculate relative velocity along normal
            const normalVelocity = relativeVelocity.dot(nodeCollision.normal);
            
            // Skip if objects are moving away from each other
            if (normalVelocity > 0) continue;
            
            // Calculate restitution (bounciness)
            const restitution = 0.3; // Lower restitution for soft bodies
            
            // Calculate impulse scalar
            let impulseScalar = -(1 + restitution) * normalVelocity;
            impulseScalar /= 1 + rigidBody.inverseMass; // Assume node mass of 1
            
            // Apply impulse
            const impulse = nodeCollision.normal.clone().multiplyScalar(impulseScalar);
            
            node.velocity.add(impulse);
            
            if (!rigidBody.isStatic) {
                rigidBody.velocity.sub(impulse.clone().multiplyScalar(rigidBody.inverseMass));
            }
            
            // Resolve penetration
            const percent = 0.1; // Lower penetration resolution for soft bodies
            const slop = 0.01;
            
            let correction = Math.max(nodeCollision.depth - slop, 0) * percent / 
                (1 + rigidBody.inverseMass);
                
            correction = nodeCollision.normal.clone().multiplyScalar(correction);
            
            node.position.add(correction);
            
            if (!rigidBody.isStatic) {
                rigidBody.position.sub(correction.clone().multiplyScalar(rigidBody.inverseMass));
            }
        }
        
        // Wake up sleeping rigid body
        if (this.world.enableSleeping && !rigidBody.isStatic) {
            rigidBody.isSleeping = false;
            rigidBody.sleepTime = 0;
        }
    }
    
    /**
     * Adjust physics quality based on performance
     */
    adjustPhysicsQuality() {
        // Skip if not enough data
        if (this.performance.updateCount < 60) return;
        
        // Check if performance is poor
        if (this.performance.averageUpdateTime > 16) { // More than 16ms per update (less than 60fps)
            if (this.performance.qualityLevel === 'high') {
                this.setPhysicsQuality('medium');
            } else if (this.performance.qualityLevel === 'medium') {
                this.setPhysicsQuality('low');
            }
        } 
        // Check if performance is good
        else if (this.performance.averageUpdateTime < 8) { // Less than 8ms per update
            if (this.performance.qualityLevel === 'low') {
                this.setPhysicsQuality('medium');
            } else if (this.performance.qualityLevel === 'medium' && this.performance.maxUpdateTime < 12) {
                this.setPhysicsQuality('high');
            }
        }
    }
    
    /**
     * Set physics quality level
     * @param {string} level - Quality level ('low', 'medium', 'high')
     */
    setPhysicsQuality(level) {
        if (this.performance.qualityLevel === level) return;
        
        console.log(`Adjusting physics quality to ${level}`);
        
        switch (level) {
            case 'low':
                this.world.fixedTimeStep = 1/30;
                this.world.maxSubSteps = 2;
                this.softBodyPhysics.iterations = 2;
                this.fluidPhysics.resolution = 16;
                this.fluidPhysics.iterations = 2;
                this.clothPhysics.resolution = { x: 5, y: 5 };
                this.particlePhysics.maxVortices = 1;
                break;
                
            case 'medium':
                this.world.fixedTimeStep = 1/45;
                this.world.maxSubSteps = 3;
                this.softBodyPhysics.iterations = 3;
                this.fluidPhysics.resolution = 24;
                this.fluidPhysics.iterations = 3;
                this.clothPhysics.resolution = { x: 8, y: 8 };
                this.particlePhysics.maxVortices = 2;
                break;
                
            case 'high':
                this.world.fixedTimeStep = 1/60;
                this.world.maxSubSteps = 4;
                this.softBodyPhysics.iterations = 5;
                this.fluidPhysics.resolution = 32;
                this.fluidPhysics.iterations = 4;
                this.clothPhysics.resolution = { x: 10, y: 10 };
                this.particlePhysics.maxVortices = 3;
                break;
                
            default:
                return;
        }
        
        this.performance.qualityLevel = level;
        
        // Reset performance metrics
        this.performance.updateCount = 0;
        this.performance.averageUpdateTime = 0;
        this.performance.maxUpdateTime = 0;
        
        // Update vortices
        this.createVortices();
    }
}

// Export the class
export default new EnhancedPhysicsSystem();
