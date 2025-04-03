/**
 * Dynamic Background System for MeAI
 * 
 * Features:
 * - Responsive starfield that reacts to conversation flow
 * - Color atmosphere shifts based on conversation tone
 * - Nebula-like elements that evolve over time
 * - Multiple parallax layers for depth and movement
 * - Background elements that respond to user interaction
 */

class DynamicBackgroundSystem {
    constructor(containerElement) {
        // Main container
        this.container = containerElement;
        
        // Canvas layers
        this.canvasLayers = [];
        this.contexts = [];
        this.layerCount = 3; // Background, stars, nebula
        
        // Stars
        this.stars = [];
        this.starCount = 150;
        this.starSpeeds = [0.2, 0.5, 1.0]; // Different speeds for parallax effect
        
        // Nebulae
        this.nebulae = [];
        this.nebulaCount = 3;
        
        // Color scheme
        this.colorSchemes = {
            neutral: {
                background: '#1a1155',
                stars: ['#ffffff', '#e0e0ff', '#d0d0ff'],
                nebula: ['rgba(0, 226, 255, 0.05)', 'rgba(191, 123, 253, 0.05)']
            },
            joy: {
                background: '#1a2055',
                stars: ['#ffffff', '#e0ffff', '#d0ffff'],
                nebula: ['rgba(105, 240, 174, 0.08)', 'rgba(0, 229, 255, 0.05)']
            },
            calm: {
                background: '#0d2b45',
                stars: ['#ffffff', '#e0e0ff', '#d0d0ff'],
                nebula: ['rgba(79, 195, 247, 0.05)', 'rgba(144, 202, 249, 0.05)']
            },
            curious: {
                background: '#2d1b4e',
                stars: ['#ffffff', '#fff8e0', '#ffecb3'],
                nebula: ['rgba(255, 213, 79, 0.05)', 'rgba(255, 183, 77, 0.05)']
            },
            reflective: {
                background: '#263238',
                stars: ['#ffffff', '#e0e0e0', '#b0bec5'],
                nebula: ['rgba(176, 190, 197, 0.05)', 'rgba(144, 164, 174, 0.05)']
            },
            excited: {
                background: '#37003c',
                stars: ['#ffffff', '#ffe0f0', '#ffb0d0'],
                nebula: ['rgba(255, 64, 129, 0.08)', 'rgba(224, 64, 251, 0.05)']
            },
            empathetic: {
                background: '#311b92',
                stars: ['#ffffff', '#e0e0ff', '#d0d0ff'],
                nebula: ['rgba(186, 104, 200, 0.05)', 'rgba(149, 117, 205, 0.05)']
            }
        };
        
        // Current state
        this.currentMood = 'neutral';
        this.currentColorScheme = { ...this.colorSchemes.neutral };
        this.targetColorScheme = { ...this.colorSchemes.neutral };
        this.mousePosition = { x: 0, y: 0 };
        this.activityLevel = 0; // 0-1 scale of conversation activity
        
        // Animation state
        this.animationFrame = null;
        this.lastFrameTime = 0;
        this.isTransitioning = false;
        this.transitionProgress = 0;
        this.transitionDuration = 5000; // 5 seconds
        this.transitionStartTime = 0;
    }
    
    /**
     * Initialize the background system
     */
    initialize() {
        // Create canvas layers
        for (let i = 0; i < this.layerCount; i++) {
            const canvas = document.createElement('canvas');
            canvas.className = `background-layer layer-${i}`;
            canvas.style.position = 'absolute';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.zIndex = `-${i + 1}`;
            
            this.container.appendChild(canvas);
            this.canvasLayers.push(canvas);
            this.contexts.push(canvas.getContext('2d'));
        }
        
        // Set container style
        this.container.style.position = 'relative';
        this.container.style.overflow = 'hidden';
        
        // Create stars
        this.createStars();
        
        // Create nebulae
        this.createNebulae();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start animation loop
        this.startAnimationLoop();
        
        // Set initial background color
        this.container.style.backgroundColor = this.currentColorScheme.background;
        
        console.log('Dynamic Background System initialized');
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Mouse movement for parallax effect
        this.container.addEventListener('mousemove', (event) => {
            const rect = this.container.getBoundingClientRect();
            this.mousePosition = {
                x: (event.clientX - rect.left) / rect.width,
                y: (event.clientY - rect.top) / rect.height
            };
        });
        
        // Resize handler
        window.addEventListener('resize', () => {
            this.resizeCanvases();
        });
        
        // Initial resize
        this.resizeCanvases();
    }
    
    /**
     * Resize canvases to match container
     */
    resizeCanvases() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        for (let i = 0; i < this.layerCount; i++) {
            const canvas = this.canvasLayers[i];
            canvas.width = width;
            canvas.height = height;
        }
        
        // Recreate stars and nebulae for new size
        this.createStars();
        this.createNebulae();
    }
    
    /**
     * Create stars with different properties
     */
    createStars() {
        this.stars = [];
        
        // Calculate star count based on screen size
        const area = this.canvasLayers[0].width * this.canvasLayers[0].height;
        const adjustedStarCount = Math.min(300, Math.max(50, Math.floor(area / 5000)));
        
        for (let i = 0; i < adjustedStarCount; i++) {
            // Determine which layer this star belongs to
            const layerIndex = Math.floor(Math.random() * this.starSpeeds.length);
            
            this.stars.push({
                x: Math.random() * this.canvasLayers[layerIndex].width,
                y: Math.random() * this.canvasLayers[layerIndex].height,
                size: 0.5 + Math.random() * 2,
                opacity: 0.5 + Math.random() * 0.5,
                twinkleSpeed: 0.5 + Math.random() * 2,
                twinklePhase: Math.random() * Math.PI * 2,
                layerIndex: layerIndex,
                speed: this.starSpeeds[layerIndex],
                color: this.currentColorScheme.stars[Math.floor(Math.random() * this.currentColorScheme.stars.length)]
            });
        }
    }
    
    /**
     * Create nebula-like elements
     */
    createNebulae() {
        this.nebulae = [];
        
        for (let i = 0; i < this.nebulaCount; i++) {
            const width = this.canvasLayers[0].width;
            const height = this.canvasLayers[0].height;
            
            this.nebulae.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: 100 + Math.random() * 200,
                opacity: 0.1 + Math.random() * 0.2,
                color: this.currentColorScheme.nebula[i % this.currentColorScheme.nebula.length],
                speed: 0.02 + Math.random() * 0.05,
                angle: Math.random() * Math.PI * 2,
                pulseSpeed: 0.2 + Math.random() * 0.3,
                pulsePhase: Math.random() * Math.PI * 2
            });
        }
    }
    
    /**
     * Start the main animation loop
     */
    startAnimationLoop() {
        const animate = (timestamp) => {
            // Calculate delta time
            const deltaTime = this.lastFrameTime ? (timestamp - this.lastFrameTime) / 1000 : 0;
            this.lastFrameTime = timestamp;
            
            // Update transition if active
            if (this.isTransitioning) {
                this.updateTransition(timestamp);
            }
            
            // Clear all canvases
            for (let i = 0; i < this.layerCount; i++) {
                this.contexts[i].clearRect(0, 0, this.canvasLayers[i].width, this.canvasLayers[i].height);
            }
            
            // Draw background elements
            this.drawNebulae(deltaTime);
            this.drawStars(deltaTime);
            
            // Request next frame
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        // Start animation loop
        this.animationFrame = requestAnimationFrame(animate);
    }
    
    /**
     * Draw stars with twinkling effect
     * @param {number} deltaTime Time since last frame in seconds
     */
    drawStars(deltaTime) {
        for (const star of this.stars) {
            const ctx = this.contexts[star.layerIndex];
            
            // Calculate twinkle effect
            star.twinklePhase += deltaTime * star.twinkleSpeed;
            const twinkle = 0.7 + 0.3 * Math.sin(star.twinklePhase);
            
            // Apply parallax effect based on mouse position
            const parallaxX = (this.mousePosition.x - 0.5) * 20 * star.speed;
            const parallaxY = (this.mousePosition.y - 0.5) * 20 * star.speed;
            
            // Draw star
            ctx.beginPath();
            ctx.arc(
                star.x + parallaxX,
                star.y + parallaxY,
                star.size * twinkle,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = star.color;
            ctx.globalAlpha = star.opacity * twinkle;
            ctx.fill();
            
            // Reset global alpha
            ctx.globalAlpha = 1;
        }
    }
    
    /**
     * Draw nebula-like elements
     * @param {number} deltaTime Time since last frame in seconds
     */
    drawNebulae(deltaTime) {
        const ctx = this.contexts[2]; // Use the bottom layer for nebulae
        
        for (const nebula of this.nebulae) {
            // Update position
            nebula.x += Math.cos(nebula.angle) * nebula.speed * deltaTime * 10;
            nebula.y += Math.sin(nebula.angle) * nebula.speed * deltaTime * 10;
            
            // Wrap around edges
            if (nebula.x < -nebula.size) nebula.x = this.canvasLayers[2].width + nebula.size;
            if (nebula.x > this.canvasLayers[2].width + nebula.size) nebula.x = -nebula.size;
            if (nebula.y < -nebula.size) nebula.y = this.canvasLayers[2].height + nebula.size;
            if (nebula.y > this.canvasLayers[2].height + nebula.size) nebula.y = -nebula.size;
            
            // Update pulse
            nebula.pulsePhase += deltaTime * nebula.pulseSpeed;
            const pulse = 0.8 + 0.2 * Math.sin(nebula.pulsePhase);
            
            // Apply parallax effect based on mouse position
            const parallaxX = (this.mousePosition.x - 0.5) * 10;
            const parallaxY = (this.mousePosition.y - 0.5) * 10;
            
            // Create gradient
            const gradient = ctx.createRadialGradient(
                nebula.x + parallaxX,
                nebula.y + parallaxY,
                0,
                nebula.x + parallaxX,
                nebula.y + parallaxY,
                nebula.size * pulse
            );
            
            // Parse color to get base color
            const baseColor = nebula.color.replace(/rgba?\(|\)/g, '').split(',');
            const r = parseInt(baseColor[0].trim());
            const g = parseInt(baseColor[1].trim());
            const b = parseInt(baseColor[2].trim());
            const a = parseFloat(baseColor[3] ? baseColor[3].trim() : '1');
            
            // Add gradient stops
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${a * pulse})`);
            gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${a * 0.5 * pulse})`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            
            // Draw nebula
            ctx.beginPath();
            ctx.fillStyle = gradient;
            ctx.arc(
                nebula.x + parallaxX,
                nebula.y + parallaxY,
                nebula.size * pulse,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }
    
    /**
     * Update transition between color schemes
     * @param {number} timestamp Current animation timestamp
     */
    updateTransition(timestamp) {
        // Calculate progress (0 to 1)
        const elapsed = timestamp - this.transitionStartTime;
        const progress = Math.min(elapsed / this.transitionDuration, 1);
        
        // Interpolate background color
        const bgColor = this.interpolateColor(
            this.currentColorScheme.background,
            this.targetColorScheme.background,
            progress
        );
        this.container.style.backgroundColor = bgColor;
        
        // Update star colors gradually
        for (let i = 0; i < this.stars.length; i++) {
            // Only update some stars each frame for a more natural transition
            if (Math.random() < 0.01) {
                const starColorIndex = Math.floor(Math.random() * this.targetColorScheme.stars.length);
                this.stars[i].color = this.targetColorScheme.stars[starColorIndex];
            }
        }
        
        // Update nebula colors gradually
        for (let i = 0; i < this.nebulae.length; i++) {
            const nebulaColorIndex = i % this.targetColorScheme.nebula.length;
            this.nebulae[i].color = this.targetColorScheme.nebula[nebulaColorIndex];
        }
        
        // Check if transition is complete
        if (progress >= 1) {
            this.isTransitioning = false;
            this.currentColorScheme = { ...this.targetColorScheme };
        }
    }
    
    /**
     * Set the mood of the background
     * @param {string} mood Mood name
     * @param {number} transitionDuration Duration of transition in ms
     */
    setMood(mood, transitionDuration = null) {
        // Validate mood
        if (!this.colorSchemes[mood]) {
            console.warn(`Unknown mood: ${mood}, defaulting to neutral`);
            mood = 'neutral';
        }
        
        // Set target color scheme
        this.targetColorScheme = { ...this.colorSchemes[mood] };
        
        // Set transition duration
        this.transitionDuration = transitionDuration || 5000;
        
        // Start transition
        this.isTransitioning = true;
        this.transitionStartTime = performance.now();
        this.currentMood = mood;
        
        console.log(`Background mood set to ${mood}`);
    }
    
    /**
     * Set the activity level of the background
     * @param {number} level Activity level (0-1)
     */
    setActivityLevel(level) {
        // Clamp level
        this.activityLevel = Math.max(0, Math.min(1, level));
        
        // Adjust star twinkling based on activity
        for (const star of this.stars) {
            star.twinkleSpeed = 0.5 + Math.random() * 2 + this.activityLevel * 3;
        }
        
        // Adjust nebula movement based on activity
        for (const nebula of this.nebulae) {
            nebula.speed = 0.02 + Math.random() * 0.05 + this.activityLevel * 0.1;
            nebula.pulseSpeed = 0.2 + Math.random() * 0.3 + this.activityLevel * 0.5;
        }
    }
    
    /**
     * Respond to audio input
     * @param {number} frequency Dominant frequency
     * @param {number} amplitude Audio amplitude
     */
    respondToAudio(frequency, amplitude) {
        // Scale amplitude to a reasonable range (0-1)
        const scaledAmplitude = Math.min(1, amplitude / 100);
        
        // Adjust star twinkling based on amplitude
        for (const star of this.stars) {
            star.twinkleSpeed = 0.5 + Math.random() * 2 + scaledAmplitude * 5;
        }
        
        // Create new stars based on amplitude (audio visualization)
        if (scaledAmplitude > 0.5 && Math.random() < 0.2) {
            const count = Math.floor(scaledAmplitude * 5);
            this.createAudioStars(count, frequency);
        }
    }
    
    /**
     * Create temporary stars in response to audio
     * @param {number} count Number of stars to create
     * @param {number} frequency Audio frequency
     */
    createAudioStars(count, frequency) {
        // Map frequency to color (lower = red, higher = blue)
        const hue = Math.min(270, Math.max(0, frequency / 30));
        const color = `hsl(${hue}, 100%, 80%)`;
        
        // Create stars at random positions
        for (let i = 0; i < count; i++) {
            const x = Math.random() * this.canvasLayers[0].width;
            const y = Math.random() * this.canvasLayers[0].height;
            
            // Create temporary star
            const tempStar = {
                x,
                y,
                size: 1 + Math.random() * 3,
                opacity: 0.7 + Math.random() * 0.3,
                twinkleSpeed: 3 + Math.random() * 5,
                twinklePhase: Math.random() * Math.PI * 2,
                layerIndex: 0, // Always on top layer
                speed: 1.5,
                color,
                life: 1 + Math.random() * 2, // Lifetime in seconds
                maxLife: 1 + Math.random() * 2
            };
            
            this.stars.push(tempStar);
            
            // Remove after lifetime
            setTimeout(() => {
                const index = this.stars.indexOf(tempStar);
                if (index !== -1) {
                    this.stars.splice(index, 1);
                }
            }, tempStar.life * 1000);
        }
    }
    
    /**
     * Create a ripple effect at a specific position
     * @param {number} x X coordinate
     * @param {number} y Y coordinate
     * @param {string} color Ripple color (hex or rgba)
     */
    createRipple(x, y, color = 'rgba(255, 255, 255, 0.3)') {
        const ctx = this.contexts[0]; // Use top layer for ripples
        
        // Create ripple animation
        let size = 0;
        const maxSize = 100;
        const duration = 1000; // ms
        const startTime = performance.now();
        
        const animateRipple = (timestamp) => {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Calculate current size and opacity
            size = maxSize * progress;
            const opacity = 1 - progress;
            
            // Draw ripple
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = opacity;
            ctx.stroke();
            ctx.globalAlpha = 1;
            
            // Continue animation until complete
            if (progress < 1) {
                requestAnimationFrame(animateRipple);
            }
        };
        
        requestAnimationFrame(animateRipple);
    }
    
    /**
     * Add a shooting star effect
     * @param {string} color Star color (hex or rgba)
     */
    addShootingStar(color = '#ffffff') {
        const canvas = this.canvasLayers[0];
        const ctx = this.contexts[0];
        
        // Random starting position (always from top half of screen)
        const startX = Math.random() * canvas.width;
        const startY = Math.random() * (canvas.height / 2);
        
        // Random angle (downward trajectory)
        const angle = Math.PI / 4 + Math.random() * (Math.PI / 2);
        
        // Calculate end position
        const distance = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);
        const endX = startX + Math.cos(angle) * distance;
        const endY = startY + Math.sin(angle) * distance;
        
        // Animation parameters
        const duration = 1000 + Math.random() * 1000; // 1-2 seconds
        const startTime = performance.now();
        const tailLength = 100 + Math.random() * 100;
        
        const animateStar = (timestamp) => {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Calculate current position
            const x = startX + (endX - startX) * progress;
            const y = startY + (endY - startY) * progress;
            
            // Clear previous frame (only the area around the star)
            ctx.clearRect(
                x - tailLength - 10,
                y - tailLength - 10,
                tailLength + 20,
                tailLength + 20
            );
            
            // Draw tail
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(
                x - Math.cos(angle) * tailLength * (0.5 + progress * 0.5),
                y - Math.sin(angle) * tailLength * (0.5 + progress * 0.5)
            );
            
            // Create gradient for tail
            const gradient = ctx.createLinearGradient(
                x, y,
                x - Math.cos(angle) * tailLength,
                y - Math.sin(angle) * tailLength
            );
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw star
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            
            // Continue animation until complete
            if (progress < 1) {
                requestAnimationFrame(animateStar);
            } else {
                // Create burst effect at end
                this.createStarBurst(x, y, color);
            }
        };
        
        requestAnimationFrame(animateStar);
    }
    
    /**
     * Create a star burst effect
     * @param {number} x X coordinate
     * @param {number} y Y coordinate
     * @param {string} color Burst color
     */
    createStarBurst(x, y, color) {
        const ctx = this.contexts[0];
        const particleCount = 10 + Math.floor(Math.random() * 10);
        const particles = [];
        
        // Create particles
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 100;
            particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 1 + Math.random() * 2,
                life: 0.5 + Math.random() * 0.5,
                maxLife: 0.5 + Math.random() * 0.5
            });
        }
        
        // Animation parameters
        const startTime = performance.now();
        
        const animateBurst = (timestamp) => {
            const elapsed = (timestamp - startTime) / 1000; // Convert to seconds
            
            // Clear previous frame
            ctx.clearRect(x - 100, y - 100, 200, 200);
            
            // Update and draw particles
            let allDead = true;
            
            for (const particle of particles) {
                // Update life
                particle.life -= elapsed / 10;
                
                if (particle.life > 0) {
                    allDead = false;
                    
                    // Update position
                    particle.x += particle.vx * elapsed;
                    particle.y += particle.vy * elapsed;
                    
                    // Calculate opacity based on life
                    const opacity = particle.life / particle.maxLife;
                    
                    // Draw particle
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fillStyle = color;
                    ctx.globalAlpha = opacity;
                    ctx.fill();
                }
            }
            
            ctx.globalAlpha = 1;
            
            // Continue animation until all particles are dead
            if (!allDead) {
                requestAnimationFrame(animateBurst);
            }
        };
        
        requestAnimationFrame(animateBurst);
    }
    
    /**
     * Interpolate between two colors
     * @param {string} colorA Start color (hex)
     * @param {string} colorB End color (hex)
     * @param {number} t Progress (0-1)
     * @returns {string} Interpolated color (hex)
     */
    interpolateColor(colorA, colorB, t) {
        // Parse colors
        const r1 = parseInt(colorA.slice(1, 3), 16);
        const g1 = parseInt(colorA.slice(3, 5), 16);
        const b1 = parseInt(colorA.slice(5, 7), 16);
        
        const r2 = parseInt(colorB.slice(1, 3), 16);
        const g2 = parseInt(colorB.slice(3, 5), 16);
        const b2 = parseInt(colorB.slice(5, 7), 16);
        
        // Interpolate
        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);
        
        // Convert back to hex
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        // Stop animation loop
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        // Remove canvases
        for (const canvas of this.canvasLayers) {
            if (canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
            }
        }
        
        // Clear references
        this.canvasLayers = [];
        this.contexts = [];
        this.stars = [];
        this.nebulae = [];
        
        console.log('Dynamic Background System disposed');
    }
}
