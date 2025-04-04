/**
 * Shader Effects for 3D Visualization
 * 
 * This module provides GLSL shaders for creating advanced visual effects
 * in the 3D pixel visualization system.
 */

class ShaderEffects {
    /**
     * Get vertex shader for particle effects
     * @returns {string} Vertex shader code
     */
    static getParticleVertexShader() {
        return `
            attribute float size;
            attribute float alpha;
            attribute vec3 customColor;
            
            varying vec3 vColor;
            varying float vAlpha;
            
            uniform float time;
            
            void main() {
                vColor = customColor;
                vAlpha = alpha;
                
                // Animate particles based on time
                vec3 pos = position;
                
                // Different animation patterns based on particle type
                float speed = 0.5;
                float amplitude = 0.2;
                
                // Unique movement pattern based on initial position
                float uniqueOffset = position.x * position.y * position.z;
                
                pos.x += sin(time * speed + uniqueOffset * 5.0) * amplitude;
                pos.y += cos(time * speed + uniqueOffset * 3.0) * amplitude;
                pos.z += sin(time * speed + uniqueOffset * 7.0) * amplitude;
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                
                // Size attenuation based on distance
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `;
    }
    
    /**
     * Get fragment shader for particle effects
     * @returns {string} Fragment shader code
     */
    static getParticleFragmentShader() {
        return `
            varying vec3 vColor;
            varying float vAlpha;
            
            uniform sampler2D particleTexture;
            uniform vec3 pixelColor;
            
            void main() {
                // Sample particle texture
                vec4 texColor = texture2D(particleTexture, gl_PointCoord);
                
                // Blend particle color with pixel color
                vec3 color = mix(vColor, pixelColor, 0.5);
                
                // Apply texture alpha and particle alpha
                float alpha = texColor.a * vAlpha;
                
                // Discard transparent pixels
                if (alpha < 0.1) discard;
                
                gl_FragColor = vec4(color, alpha);
            }
        `;
    }
    
    /**
     * Get vertex shader for glow effect
     * @returns {string} Vertex shader code
     */
    static getGlowVertexShader() {
        return `
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            
            void main() {
                vNormal = normalize(normalMatrix * normal);
                
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;
                
                gl_Position = projectionMatrix * mvPosition;
            }
        `;
    }
    
    /**
     * Get fragment shader for glow effect
     * @returns {string} Fragment shader code
     */
    static getGlowFragmentShader() {
        return `
            uniform vec3 glowColor;
            uniform float intensity;
            uniform float power;
            
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            
            void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDirection = normalize(vViewPosition);
                
                float rimFactor = dot(normal, viewDirection);
                rimFactor = 1.0 - rimFactor;
                rimFactor = pow(rimFactor, power);
                
                vec3 finalColor = glowColor * intensity * rimFactor;
                gl_FragColor = vec4(finalColor, rimFactor);
            }
        `;
    }
    
    /**
     * Get vertex shader for emotional state transitions
     * @returns {string} Vertex shader code
     */
    static getTransitionVertexShader() {
        return `
            uniform float transitionProgress;
            
            attribute vec3 targetPosition;
            attribute vec3 targetNormal;
            
            varying vec3 vNormal;
            varying vec2 vUv;
            
            void main() {
                // Interpolate between current and target positions
                vec3 pos = mix(position, targetPosition, transitionProgress);
                
                // Interpolate between current and target normals
                vNormal = normalize(normalMatrix * mix(normal, targetNormal, transitionProgress));
                
                vUv = uv;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `;
    }
    
    /**
     * Get fragment shader for emotional state transitions
     * @returns {string} Fragment shader code
     */
    static getTransitionFragmentShader() {
        return `
            uniform vec3 currentColor;
            uniform vec3 targetColor;
            uniform float transitionProgress;
            uniform float emissiveIntensity;
            
            varying vec3 vNormal;
            varying vec2 vUv;
            
            void main() {
                // Interpolate between current and target colors
                vec3 color = mix(currentColor, targetColor, transitionProgress);
                
                // Calculate lighting
                vec3 normal = normalize(vNormal);
                vec3 light = normalize(vec3(1.0, 1.0, 1.0));
                float diffuse = max(dot(normal, light), 0.0);
                
                // Add emissive glow
                vec3 emissive = color * emissiveIntensity;
                
                // Combine diffuse and emissive
                vec3 finalColor = color * diffuse + emissive;
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
    }
    
    /**
     * Get vertex shader for environment effects
     * @returns {string} Vertex shader code
     */
    static getEnvironmentVertexShader() {
        return `
            varying vec3 vWorldPosition;
            
            void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
    }
    
    /**
     * Get fragment shader for environment effects
     * @returns {string} Fragment shader code
     */
    static getEnvironmentFragmentShader() {
        return `
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            uniform float offset;
            uniform float exponent;
            
            varying vec3 vWorldPosition;
            
            void main() {
                float h = normalize(vWorldPosition + offset).y;
                float t = max(pow(max(h, 0.0), exponent), 0.0);
                
                gl_FragColor = vec4(mix(bottomColor, topColor, t), 1.0);
            }
        `;
    }
    
    /**
     * Create a particle texture for use with shaders
     * @param {string} type - Type of particle texture to create
     * @returns {THREE.Texture} Generated texture
     */
    static createParticleTexture(type = 'circle') {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        
        const context = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = canvas.width / 2;
        
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        if (type === 'circle') {
            // Create circular particle
            const gradient = context.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, radius
            );
            
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            context.fillStyle = gradient;
            context.beginPath();
            context.arc(centerX, centerY, radius, 0, Math.PI * 2, false);
            context.fill();
        } else if (type === 'star') {
            // Create star-shaped particle
            context.fillStyle = 'rgba(255, 255, 255, 1)';
            context.beginPath();
            
            const spikes = 5;
            const outerRadius = radius;
            const innerRadius = radius / 2;
            
            for (let i = 0; i < spikes * 2; i++) {
                const r = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = Math.PI * i / spikes;
                
                const x = centerX + Math.cos(angle) * r;
                const y = centerY + Math.sin(angle) * r;
                
                if (i === 0) {
                    context.moveTo(x, y);
                } else {
                    context.lineTo(x, y);
                }
            }
            
            context.closePath();
            context.fill();
            
            // Add glow
            const gradient = context.createRadialGradient(
                centerX, centerY, innerRadius,
                centerX, centerY, outerRadius
            );
            
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            context.globalCompositeOperation = 'destination-over';
            context.fillStyle = gradient;
            context.beginPath();
            context.arc(centerX, centerY, outerRadius, 0, Math.PI * 2, false);
            context.fill();
        } else if (type === 'square') {
            // Create square particle with soft edges
            const size = radius * 1.5;
            
            context.fillStyle = 'rgba(255, 255, 255, 1)';
            context.fillRect(centerX - size/2, centerY - size/2, size, size);
            
            // Add glow
            const gradient = context.createRadialGradient(
                centerX, centerY, size/2,
                centerX, centerY, radius
            );
            
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            context.globalCompositeOperation = 'destination-over';
            context.fillStyle = gradient;
            context.beginPath();
            context.arc(centerX, centerY, radius, 0, Math.PI * 2, false);
            context.fill();
        }
        
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    }
}

export default ShaderEffects;
