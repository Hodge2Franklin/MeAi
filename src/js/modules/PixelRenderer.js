// PixelRenderer.js - Handles the visual rendering of the single pixel

export default class PixelRenderer {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.canvas = null;
    this.ctx = null;
    this.width = 0;
    this.height = 0;
    this.centerX = 0;
    this.centerY = 0;
    this.isBreathing = false;
    this.breathingPhase = 0;
    this.breathingRate = 0.25; // cycles per second
    this.breathingDepth = 0.2; // amplitude of size variation
    this.baseSize = 20; // base pixel size in pixels
    this.currentSize = this.baseSize;
    this.targetColor = '#ffffff';
    this.currentColor = '#ffffff';
    this.colorTransition = null;
    this.sizeTransition = null;
    this.opacityTransition = null;
    this.particles = [];
    this.particleCount = 50;
  }

  init() {
    // Get canvas element
    this.canvas = document.getElementById('pixel-canvas');
    if (!this.canvas) {
      console.error('Canvas element not found');
      return;
    }

    // Get context
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) {
      console.error('Could not get canvas context');
      return;
    }

    // Set canvas size
    this.resizeCanvas();

    // Initialize particles
    this.initParticles();

    // Listen for state changes
    this.stateManager.on('pixel.size', ({ newValue }) => {
      this.currentSize = this.baseSize * newValue;
    });

    this.stateManager.on('pixel.color', ({ newValue }) => {
      this.targetColor = newValue;
    });

    this.stateManager.on('pixel.opacity', ({ newValue }) => {
      this.opacity = newValue;
    });

    this.stateManager.on('pixel.isBreathing', ({ newValue }) => {
      this.isBreathing = newValue;
    });

    this.stateManager.on('pixel.breathingRate', ({ newValue }) => {
      this.breathingRate = newValue;
    });

    this.stateManager.on('pixel.breathingDepth', ({ newValue }) => {
      this.breathingDepth = newValue;
    });

    // Handle window resize
    window.addEventListener('resize', () => this.resizeCanvas());

    // Start breathing by default
    this.startBreathing(this.breathingRate, this.breathingDepth);

    console.log('PixelRenderer initialized');
  }

  resizeCanvas() {
    // Set canvas size to match window
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    // Calculate center position
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;

    // Adjust base size based on screen dimensions
    const minDimension = Math.min(this.width, this.height);
    this.baseSize = minDimension * 0.05; // 5% of the smaller dimension
    this.currentSize = this.baseSize * this.stateManager.getState().pixel.size;

    // Reinitialize particles
    this.initParticles();
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.1
      });
    }
  }

  update() {
    // Update breathing phase
    if (this.isBreathing) {
      const state = this.stateManager.getState();
      const deltaTime = state.system.deltaTime / 1000; // Convert to seconds
      
      this.breathingPhase += deltaTime * this.breathingRate;
      if (this.breathingPhase > 1) {
        this.breathingPhase -= 1;
      }
      
      // Calculate breathing effect (sine wave)
      const breathingFactor = Math.sin(this.breathingPhase * Math.PI * 2) * this.breathingDepth + 1;
      this.stateManager.setState('pixel.size', breathingFactor);
    }

    // Update color transition
    if (this.colorTransition) {
      const now = performance.now();
      const elapsed = now - this.colorTransition.startTime;
      const progress = Math.min(elapsed / this.colorTransition.duration, 1);
      
      if (progress < 1) {
        // Interpolate color
        this.currentColor = this.interpolateColor(
          this.colorTransition.startColor,
          this.colorTransition.targetColor,
          progress
        );
      } else {
        // Transition complete
        this.currentColor = this.colorTransition.targetColor;
        this.colorTransition = null;
      }
    }

    // Update size transition
    if (this.sizeTransition) {
      const now = performance.now();
      const elapsed = now - this.sizeTransition.startTime;
      const progress = Math.min(elapsed / this.sizeTransition.duration, 1);
      
      if (progress < 1) {
        // Interpolate size
        const size = this.sizeTransition.startSize + 
          (this.sizeTransition.targetSize - this.sizeTransition.startSize) * progress;
        this.stateManager.setState('pixel.size', size);
      } else {
        // Transition complete
        this.stateManager.setState('pixel.size', this.sizeTransition.targetSize);
        this.sizeTransition = null;
      }
    }

    // Update opacity transition
    if (this.opacityTransition) {
      const now = performance.now();
      const elapsed = now - this.opacityTransition.startTime;
      const progress = Math.min(elapsed / this.opacityTransition.duration, 1);
      
      if (progress < 1) {
        // Interpolate opacity
        const opacity = this.opacityTransition.startOpacity + 
          (this.opacityTransition.targetOpacity - this.opacityTransition.startOpacity) * progress;
        this.stateManager.setState('pixel.opacity', opacity);
      } else {
        // Transition complete
        this.stateManager.setState('pixel.opacity', this.opacityTransition.targetOpacity);
        this.opacityTransition = null;
      }
    }

    // Update particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.speedX;
      p.y += p.speedY;
      
      // Wrap around edges
      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;
    }
  }

  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Get current state
    const state = this.stateManager.getState();
    const pixelState = state.pixel;
    
    // Draw background particles
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      this.ctx.globalAlpha = p.opacity * pixelState.opacity * 0.5;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    // Draw main pixel
    this.ctx.globalAlpha = pixelState.opacity;
    
    // Create gradient for pixel
    const gradient = this.ctx.createRadialGradient(
      this.centerX, this.centerY, 0,
      this.centerX, this.centerY, this.currentSize
    );
    gradient.addColorStop(0, this.currentColor);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, this.currentSize * 2, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Reset global alpha
    this.ctx.globalAlpha = 1.0;
  }

  startBreathing(rate, depth) {
    this.breathingRate = rate || this.breathingRate;
    this.breathingDepth = depth || this.breathingDepth;
    this.breathingPhase = 0;
    this.isBreathing = true;
    this.stateManager.setState('pixel.isBreathing', true);
    this.stateManager.setState('pixel.breathingRate', this.breathingRate);
    this.stateManager.setState('pixel.breathingDepth', this.breathingDepth);
  }

  stopBreathing() {
    this.isBreathing = false;
    this.stateManager.setState('pixel.isBreathing', false);
  }

  fadeIn(duration = 1000) {
    const currentOpacity = this.stateManager.getState().pixel.opacity;
    this.opacityTransition = {
      startTime: performance.now(),
      duration: duration,
      startOpacity: currentOpacity,
      targetOpacity: 1.0
    };
  }

  fadeOut(duration = 1000) {
    const currentOpacity = this.stateManager.getState().pixel.opacity;
    this.opacityTransition = {
      startTime: performance.now(),
      duration: duration,
      startOpacity: currentOpacity,
      targetOpacity: 0.0
    };
  }

  transitionColor(targetColor, duration = 1000) {
    const currentColor = this.currentColor;
    this.colorTransition = {
      startTime: performance.now(),
      duration: duration,
      startColor: currentColor,
      targetColor: targetColor
    };
    this.stateManager.setState('pixel.color', targetColor);
  }

  pulseSize(targetSize, duration = 500) {
    const currentSize = this.stateManager.getState().pixel.size;
    this.sizeTransition = {
      startTime: performance.now(),
      duration: duration,
      startSize: currentSize,
      targetSize: targetSize
    };
  }

  // Helper function to interpolate between colors
  interpolateColor(color1, color2, factor) {
    // Convert hex to RGB
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);
    
    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);
    
    // Interpolate
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}
