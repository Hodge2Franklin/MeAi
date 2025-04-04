// 3D Pixel Visualization System for MeAI
// This system enhances the existing pixel visualization with WebGL-based 3D rendering

class PixelVisualization3D {
    constructor(containerId = 'meai-pixel') {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.width = this.container.clientWidth || 100;
        this.height = this.container.clientHeight || 100;
        this.currentEmotion = 'neutral';
        this.transitionDuration = 1000; // ms
        this.isTransitioning = false;
        this.fallbackMode = false;
        
        // Emotion configuration
        this.emotions = {
            joy: {
                color: 0xffcc00,
                scale: 1.2,
                rotation: { x: 0, y: 0.5, z: 0 },
                particles: { count: 30, speed: 0.8, color: 0xffcc00, size: 0.1 }
            },
            reflective: {
                color: 0x9966cc,
                scale: 1.0,
                rotation: { x: 0.2, y: 0.1, z: 0.1 },
                particles: { count: 15, speed: 0.3, color: 0x9966cc, size: 0.08 }
            },
            curious: {
                color: 0x66ccff,
                scale: 1.1,
                rotation: { x: 0, y: 0.8, z: 0.2 },
                particles: { count: 20, speed: 0.5, color: 0x66ccff, size: 0.09 }
            },
            excited: {
                color: 0xff6600,
                scale: 1.3,
                rotation: { x: 0.3, y: 1.0, z: 0.3 },
                particles: { count: 40, speed: 1.0, color: 0xff6600, size: 0.12 }
            },
            empathetic: {
                color: 0x66cc99,
                scale: 1.1,
                rotation: { x: 0.1, y: 0.3, z: 0 },
                particles: { count: 25, speed: 0.4, color: 0x66cc99, size: 0.09 }
            },
            calm: {
                color: 0x3399cc,
                scale: 0.9,
                rotation: { x: 0, y: 0.2, z: 0 },
                particles: { count: 10, speed: 0.2, color: 0x3399cc, size: 0.07 }
            },
            neutral: {
                color: 0x4a90e2,
                scale: 1.0,
                rotation: { x: 0, y: 0.3, z: 0 },
                particles: { count: 15, speed: 0.4, color: 0x4a90e2, size: 0.08 }
            }
        };
        
        this.init();
    }
    
    init() {
        try {
            this.initThreeJS();
            this.createScene();
            this.createLights();
            this.createPixel();
            this.createParticleSystem();
            this.setupEventListeners();
            this.animate();
        } catch (error) {
            console.error('Error initializing 3D visualization:', error);
            this.fallbackMode = true;
            this.initFallback();
        }
    }
    
    initThreeJS() {
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Clear container and append renderer
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
        this.container.appendChild(this.renderer.domElement);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            50, // Field of view
            this.width / this.height, // Aspect ratio
            0.1, // Near clipping plane
            1000 // Far clipping plane
        );
        this.camera.position.z = 5;
        
        // Create scene
        this.scene = new THREE.Scene();
        
        // Create clock for animations
        this.clock = new THREE.Clock();
    }
    
    createScene() {
        // Add subtle ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);
    }
    
    createLights() {
        // Main directional light
        this.mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.mainLight.position.set(5, 5, 5);
        this.mainLight.castShadow = true;
        
        // Configure shadow properties
        this.mainLight.shadow.mapSize.width = 512;
        this.mainLight.shadow.mapSize.height = 512;
        this.mainLight.shadow.camera.near = 0.5;
        this.mainLight.shadow.camera.far = 20;
        
        this.scene.add(this.mainLight);
        
        // Add a soft fill light from the opposite direction
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-5, -2, -5);
        this.scene.add(fillLight);
    }
    
    createPixel() {
        // Create geometry for the pixel (sphere for 3D)
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        
        // Create material with initial emotion (neutral)
        const emotion = this.emotions[this.currentEmotion];
        const material = new THREE.MeshPhongMaterial({
            color: emotion.color,
            emissive: new THREE.Color(emotion.color).multiplyScalar(0.2),
            specular: 0x050505,
            shininess: 100,
            reflectivity: 0.3
        });
        
        // Create mesh and add to scene
        this.pixel = new THREE.Mesh(geometry, material);
        this.pixel.castShadow = true;
        this.pixel.receiveShadow = true;
        this.pixel.scale.set(
            emotion.scale,
            emotion.scale,
            emotion.scale
        );
        this.scene.add(this.pixel);
        
        // Add subtle animation
        this.pixelAnimation = {
            rotationSpeed: 0.005,
            pulseSpeed: 0.003,
            pulseAmount: 0.05
        };
    }
    
    createParticleSystem() {
        // Create particle system for emotional expression
        const emotion = this.emotions[this.currentEmotion];
        const particleCount = emotion.particles.count;
        
        // Create geometry and material
        const particleGeometry = new THREE.BufferGeometry();
        const particleMaterial = new THREE.PointsMaterial({
            color: emotion.particles.color,
            size: emotion.particles.size,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        
        // Create particle positions
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];
        
        for (let i = 0; i < particleCount; i++) {
            // Random position in sphere around pixel
            const radius = 1.5 + Math.random() * 1.5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);
            
            // Random velocity
            velocities.push({
                x: (Math.random() - 0.5) * emotion.particles.speed,
                y: (Math.random() - 0.5) * emotion.particles.speed,
                z: (Math.random() - 0.5) * emotion.particles.speed
            });
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        // Create particle system
        this.particles = new THREE.Points(particleGeometry, particleMaterial);
        this.particles.velocities = velocities;
        this.scene.add(this.particles);
    }
    
    updateParticles() {
        if (!this.particles) return;
        
        const positions = this.particles.geometry.attributes.position.array;
        const velocities = this.particles.velocities;
        const particleCount = velocities.length;
        const emotion = this.emotions[this.currentEmotion];
        
        for (let i = 0; i < particleCount; i++) {
            // Update position based on velocity
            positions[i * 3] += velocities[i].x;
            positions[i * 3 + 1] += velocities[i].y;
            positions[i * 3 + 2] += velocities[i].z;
            
            // Check if particle is too far from center
            const distance = Math.sqrt(
                positions[i * 3] ** 2 +
                positions[i * 3 + 1] ** 2 +
                positions[i * 3 + 2] ** 2
            );
            
            if (distance > 4) {
                // Reset particle position
                const radius = 1.5 + Math.random() * 0.5;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI;
                
                positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
                positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
                positions[i * 3 + 2] = radius * Math.cos(phi);
                
                // Reset velocity
                velocities[i] = {
                    x: (Math.random() - 0.5) * emotion.particles.speed,
                    y: (Math.random() - 0.5) * emotion.particles.speed,
                    z: (Math.random() - 0.5) * emotion.particles.speed
                };
            }
        }
        
        this.particles.geometry.attributes.position.needsUpdate = true;
    }
    
    animate() {
        if (this.fallbackMode) return;
        
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        
        // Animate pixel
        if (this.pixel) {
            // Subtle rotation
            this.pixel.rotation.x += this.pixelAnimation.rotationSpeed * delta * 60;
            this.pixel.rotation.y += this.pixelAnimation.rotationSpeed * 1.5 * delta * 60;
            
            // Subtle pulsing
            const pulseScale = Math.sin(Date.now() * this.pixelAnimation.pulseSpeed) * this.pixelAnimation.pulseAmount;
            const emotion = this.emotions[this.currentEmotion];
            const baseScale = emotion.scale;
            
            this.pixel.scale.set(
                baseScale + pulseScale,
                baseScale + pulseScale,
                baseScale + pulseScale
            );
        }
        
        // Update particles
        this.updateParticles();
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
    
    setEmotion(emotion) {
        if (!this.emotions[emotion] || this.currentEmotion === emotion || this.isTransitioning) {
            return;
        }
        
        if (this.fallbackMode) {
            this.setFallbackEmotion(emotion);
            return;
        }
        
        this.isTransitioning = true;
        const startEmotion = this.emotions[this.currentEmotion];
        const targetEmotion = this.emotions[emotion];
        const startTime = Date.now();
        
        // Store current values
        const startColor = new THREE.Color(this.pixel.material.color.getHex());
        const startEmissive = new THREE.Color(this.pixel.material.emissive.getHex());
        const startScale = this.pixel.scale.x;
        const targetColor = new THREE.Color(targetEmotion.color);
        const targetEmissive = new THREE.Color(targetEmotion.color).multiplyScalar(0.2);
        
        // Update particle system
        this.scene.remove(this.particles);
        this.createParticleSystem();
        
        // Transition animation
        const transitionAnimation = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / this.transitionDuration, 1);
            
            // Easing function (cubic ease in-out)
            const eased = progress < 0.5
                ? 4 * progress ** 3
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            
            // Interpolate color
            const currentColor = new THREE.Color().lerpColors(startColor, targetColor, eased);
            const currentEmissive = new THREE.Color().lerpColors(startEmissive, targetEmissive, eased);
            
            // Interpolate scale
            const currentScale = startScale + (targetEmotion.scale - startScale) * eased;
            
            // Apply interpolated values
            this.pixel.material.color.set(currentColor);
            this.pixel.material.emissive.set(currentEmissive);
            this.pixel.scale.set(currentScale, currentScale, currentScale);
            
            // Continue animation if not complete
            if (progress < 1) {
                requestAnimationFrame(transitionAnimation);
            } else {
                this.currentEmotion = emotion;
                this.isTransitioning = false;
            }
        };
        
        // Start transition animation
        transitionAnimation();
    }
    
    initFallback() {
        console.log('Using 2D fallback for pixel visualization');
        
        // Create fallback element
        this.fallbackElement = document.createElement('div');
        this.fallbackElement.className = 'meai-pixel-fallback';
        this.fallbackElement.style.width = '100%';
        this.fallbackElement.style.height = '100%';
        this.fallbackElement.style.borderRadius = '50%';
        this.fallbackElement.style.backgroundColor = this.rgbToHex(this.emotions[this.currentEmotion].color);
        this.fallbackElement.style.transition = 'all 0.5s ease';
        
        // Clear container and append fallback
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
        this.container.appendChild(this.fallbackElement);
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            .meai-pixel-fallback {
                animation: pulse 3s infinite ease-in-out;
            }
        `;
        document.head.appendChild(style);
    }
    
    setFallbackEmotion(emotion) {
        if (!this.fallbackElement) return;
        
        const targetEmotion = this.emotions[emotion];
        this.fallbackElement.style.backgroundColor = this.rgbToHex(targetEmotion.color);
        this.fallbackElement.style.transform = `scale(${targetEmotion.scale})`;
        this.currentEmotion = emotion;
    }
    
    rgbToHex(color) {
        // Convert THREE.js color to hex string
        if (typeof color === 'number') {
            return '#' + color.toString(16).padStart(6, '0');
        }
        return '#4a90e2'; // Default color
    }
    
    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.fallbackMode) return;
            
            this.width = this.container.clientWidth || 100;
            this.height = this.container.clientHeight || 100;
            
            this.camera.aspect = this.width / this.height;
            this.camera.updateProjectionMatrix();
            
            this.renderer.setSize(this.width, this.height);
        });
        
        // Listen for emotion change events
        window.eventSystem.subscribe('meai-emotional-state-change', (data) => {
            if (data.emotion && this.emotions[data.emotion]) {
                this.setEmotion(data.emotion);
            }
        });
    }
    
    // Public API
    getEmotionalState() {
        return this.currentEmotion;
    }
    
    setEmotionalState(emotion) {
        this.setEmotion(emotion);
    }
    
    getAvailableEmotions() {
        return Object.keys(this.emotions);
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PixelVisualization3D;
}
