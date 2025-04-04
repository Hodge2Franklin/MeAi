// Spatial Audio System for MeAI
// This system enhances the audio experience with 3D positioning and room acoustics

class SpatialAudioSystem {
    constructor() {
        this.initialized = false;
        this.sources = new Map();
        this.listeners = new Map();
        this.rooms = new Map();
        this.fallbackMode = false;
        
        // Audio context and master gain
        this.audioContext = null;
        this.masterGain = null;
        
        // Default room settings
        this.defaultRoom = {
            dimensions: { width: 10, height: 3, depth: 10 },
            materials: {
                left: 'concrete',
                right: 'concrete',
                front: 'concrete',
                back: 'concrete',
                floor: 'wood',
                ceiling: 'concrete'
            },
            reflectivity: 0.7,
            reverb: 'medium'
        };
        
        // Material absorption coefficients (simplified)
        this.materials = {
            concrete: { low: 0.1, mid: 0.2, high: 0.3 },
            wood: { low: 0.2, mid: 0.1, high: 0.05 },
            carpet: { low: 0.4, mid: 0.6, high: 0.8 },
            glass: { low: 0.1, mid: 0.05, high: 0.02 },
            curtain: { low: 0.3, mid: 0.5, high: 0.7 },
            audience: { low: 0.5, mid: 0.7, high: 0.9 }
        };
        
        // Reverb presets
        this.reverbPresets = {
            none: { duration: 0.1, decay: 0.01, wet: 0 },
            small: { duration: 1.0, decay: 0.2, wet: 0.2 },
            medium: { duration: 2.0, decay: 0.5, wet: 0.3 },
            large: { duration: 3.0, decay: 0.7, wet: 0.4 },
            hall: { duration: 4.0, decay: 0.9, wet: 0.5 },
            cathedral: { duration: 6.0, decay: 0.95, wet: 0.6 }
        };
        
        // Initialize system
        this.init();
    }
    
    async init() {
        try {
            // Check for Web Audio API support
            if (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') {
                console.warn('Web Audio API not supported. Using fallback audio system.');
                this.fallbackMode = true;
                this.initFallback();
                return;
            }
            
            // Create audio context
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContextClass();
            
            // Create master gain node
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.8; // Default volume
            this.masterGain.connect(this.audioContext.destination);
            
            // Create default room
            await this.createRoom('default', this.defaultRoom);
            
            // Create default listener
            this.createListener('default', { x: 0, y: 0, z: 0 });
            
            // Resume audio context if suspended (autoplay policy)
            if (this.audioContext.state === 'suspended') {
                const resumeAudio = async () => {
                    await this.audioContext.resume();
                    
                    // Remove event listeners once audio is resumed
                    document.removeEventListener('click', resumeAudio);
                    document.removeEventListener('touchstart', resumeAudio);
                    document.removeEventListener('keydown', resumeAudio);
                };
                
                document.addEventListener('click', resumeAudio);
                document.addEventListener('touchstart', resumeAudio);
                document.addEventListener('keydown', resumeAudio);
            }
            
            this.initialized = true;
            console.log('Spatial audio system initialized');
            
            // Publish initialization event
            if (window.eventSystem) {
                window.eventSystem.publish('spatial-audio-initialized', { success: true });
            }
        } catch (error) {
            console.error('Error initializing spatial audio system:', error);
            this.fallbackMode = true;
            this.initFallback();
        }
    }
    
    initFallback() {
        // Simple fallback using standard Audio elements
        this.initialized = true;
        console.log('Fallback audio system initialized');
        
        // Publish initialization event
        if (window.eventSystem) {
            window.eventSystem.publish('spatial-audio-initialized', { 
                success: true, 
                fallbackMode: true 
            });
        }
    }
    
    // Room Acoustics Methods
    
    async createRoom(roomId, settings) {
        if (this.fallbackMode) return;
        
        try {
            // Merge with default settings
            const roomSettings = { ...this.defaultRoom, ...settings };
            
            // Create convolution reverb
            const reverbNode = this.audioContext.createConvolver();
            
            // Generate impulse response based on room settings
            const impulseResponse = await this.generateRoomImpulse(roomSettings);
            reverbNode.buffer = impulseResponse;
            
            // Create room acoustics processing chain
            const roomInput = this.audioContext.createGain();
            const dryGain = this.audioContext.createGain();
            const wetGain = this.audioContext.createGain();
            
            // Set wet/dry mix based on reverb preset
            const reverbPreset = this.reverbPresets[roomSettings.reverb] || this.reverbPresets.medium;
            dryGain.gain.value = 1 - reverbPreset.wet;
            wetGain.gain.value = reverbPreset.wet;
            
            // Connect nodes
            roomInput.connect(dryGain);
            roomInput.connect(reverbNode);
            reverbNode.connect(wetGain);
            dryGain.connect(this.masterGain);
            wetGain.connect(this.masterGain);
            
            // Store room configuration
            this.rooms.set(roomId, {
                settings: roomSettings,
                nodes: {
                    input: roomInput,
                    reverb: reverbNode,
                    dry: dryGain,
                    wet: wetGain
                }
            });
            
            console.log(`Created room: ${roomId}`);
            return roomId;
        } catch (error) {
            console.error(`Error creating room ${roomId}:`, error);
            return null;
        }
    }
    
    async generateRoomImpulse(roomSettings) {
        // Calculate room properties
        const { width, height, depth } = roomSettings.dimensions;
        const volume = width * height * depth;
        const totalSurfaceArea = 2 * (width * height + width * depth + height * depth);
        
        // Calculate average absorption coefficient
        let avgAbsorption = 0;
        const materials = roomSettings.materials;
        
        for (const surface in materials) {
            const material = this.materials[materials[surface]] || this.materials.concrete;
            avgAbsorption += (material.low + material.mid + material.high) / 3;
        }
        
        avgAbsorption /= Object.keys(materials).length;
        
        // Calculate reverb time (simplified Sabine formula)
        const reverbTime = 0.161 * volume / (avgAbsorption * totalSurfaceArea);
        
        // Get reverb preset or use calculated time
        const preset = this.reverbPresets[roomSettings.reverb] || this.reverbPresets.medium;
        const duration = preset.duration || reverbTime;
        const decay = preset.decay;
        
        // Generate impulse response
        return this.createImpulseResponse(duration, decay);
    }
    
    createImpulseResponse(duration, decay) {
        // Create impulse response buffer
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * duration;
        const impulseResponse = this.audioContext.createBuffer(2, length, sampleRate);
        
        // Fill buffer with noise and apply decay
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulseResponse.getChannelData(channel);
            
            for (let i = 0; i < length; i++) {
                // Random noise
                const noise = Math.random() * 2 - 1;
                
                // Apply decay curve
                const envelope = Math.pow(1 - i / length, decay);
                
                channelData[i] = noise * envelope;
            }
        }
        
        return impulseResponse;
    }
    
    // Sound Source Methods
    
    createSource(sourceId, options = {}) {
        if (!this.initialized) {
            console.warn('Spatial audio system not initialized');
            return null;
        }
        
        const defaultOptions = {
            position: { x: 0, y: 0, z: 0 },
            orientation: { x: 0, y: 0, z: 1 },
            directivity: 1, // 0 = omnidirectional, 1 = cardioid
            maxDistance: 20,
            refDistance: 1,
            rolloffFactor: 1,
            coneInnerAngle: 360,
            coneOuterAngle: 360,
            coneOuterGain: 0,
            roomId: 'default',
            autoplay: false,
            loop: false
        };
        
        const settings = { ...defaultOptions, ...options };
        
        if (this.fallbackMode) {
            return this.createFallbackSource(sourceId, settings);
        }
        
        try {
            // Create source nodes
            const sourceGain = this.audioContext.createGain();
            
            // Create panner for 3D positioning
            const panner = this.audioContext.createPanner();
            panner.panningModel = 'HRTF'; // Use HRTF for better 3D audio
            panner.distanceModel = 'inverse';
            panner.refDistance = settings.refDistance;
            panner.maxDistance = settings.maxDistance;
            panner.rolloffFactor = settings.rolloffFactor;
            panner.coneInnerAngle = settings.coneInnerAngle;
            panner.coneOuterAngle = settings.coneOuterAngle;
            panner.coneOuterGain = settings.coneOuterGain;
            
            // Set position and orientation
            this.setSourcePosition(panner, settings.position);
            this.setSourceOrientation(panner, settings.orientation);
            
            // Connect to room or directly to master
            const room = this.rooms.get(settings.roomId);
            sourceGain.connect(panner);
            
            if (room) {
                panner.connect(room.nodes.input);
            } else {
                panner.connect(this.masterGain);
            }
            
            // Store source configuration
            this.sources.set(sourceId, {
                settings: settings,
                nodes: {
                    gain: sourceGain,
                    panner: panner
                },
                bufferSource: null,
                audioElement: null,
                state: 'created'
            });
            
            console.log(`Created audio source: ${sourceId}`);
            return sourceId;
        } catch (error) {
            console.error(`Error creating audio source ${sourceId}:`, error);
            return null;
        }
    }
    
    createFallbackSource(sourceId, settings) {
        try {
            // Create audio element
            const audioElement = new Audio();
            audioElement.loop = settings.loop;
            audioElement.volume = 1.0; // Will be adjusted based on distance
            
            // Store source configuration
            this.sources.set(sourceId, {
                settings: settings,
                audioElement: audioElement,
                state: 'created'
            });
            
            console.log(`Created fallback audio source: ${sourceId}`);
            return sourceId;
        } catch (error) {
            console.error(`Error creating fallback audio source ${sourceId}:`, error);
            return null;
        }
    }
    
    async loadSound(sourceId, url) {
        if (!this.initialized) {
            console.warn('Spatial audio system not initialized');
            return false;
        }
        
        const source = this.sources.get(sourceId);
        if (!source) {
            console.error(`Source ${sourceId} not found`);
            return false;
        }
        
        if (this.fallbackMode) {
            return this.loadFallbackSound(source, url);
        }
        
        try {
            // Fetch audio data
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            
            // Decode audio data
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            // Store audio buffer
            source.buffer = audioBuffer;
            source.state = 'loaded';
            
            // Autoplay if specified
            if (source.settings.autoplay) {
                this.playSound(sourceId);
            }
            
            console.log(`Loaded sound for source ${sourceId}`);
            return true;
        } catch (error) {
            console.error(`Error loading sound for source ${sourceId}:`, error);
            return false;
        }
    }
    
    loadFallbackSound(source, url) {
        try {
            // Set audio source
            source.audioElement.src = url;
            
            // Set up event listeners
            source.audioElement.oncanplaythrough = () => {
                source.state = 'loaded';
                
                // Autoplay if specified
                if (source.settings.autoplay) {
                    source.audioElement.play().catch(error => {
                        console.warn(`Autoplay prevented for source: ${error}`);
                    });
                }
            };
            
            source.audioElement.onerror = (error) => {
                console.error(`Error loading fallback sound: ${error}`);
                source.state = 'error';
            };
            
            // Start loading
            source.audioElement.load();
            return true;
        } catch (error) {
            console.error(`Error loading fallback sound: ${error}`);
            return false;
        }
    }
    
    playSound(sourceId, options = {}) {
        if (!this.initialized) {
            console.warn('Spatial audio system not initialized');
            return false;
        }
        
        const source = this.sources.get(sourceId);
        if (!source) {
            console.error(`Source ${sourceId} not found`);
            return false;
        }
        
        if (source.state !== 'loaded') {
            console.warn(`Source ${sourceId} not loaded`);
            return false;
        }
        
        const defaultOptions = {
            loop: source.settings.loop,
            offset: 0,
            duration: undefined
        };
        
        const playOptions = { ...defaultOptions, ...options };
        
        if (this.fallbackMode) {
            return this.playFallbackSound(source, playOptions);
        }
        
        try {
            // Stop any currently playing sound
            if (source.bufferSource) {
                this.stopSound(sourceId);
            }
            
            // Create new buffer source
            const bufferSource = this.audioContext.createBufferSource();
            bufferSource.buffer = source.buffer;
            bufferSource.loop = playOptions.loop;
            
            // Connect to source gain node
            bufferSource.connect(source.nodes.gain);
            
            // Set up ended event
            bufferSource.onended = () => {
                if (source.state === 'playing') {
                    source.state = 'stopped';
                    
                    // Publish sound ended event
                    if (window.eventSystem) {
                        window.eventSystem.publish('sound-ended', { sourceId });
                    }
                }
            };
            
            // Start playback
            bufferSource.start(0, playOptions.offset, playOptions.duration);
            
            // Store buffer source and update state
            source.bufferSource = bufferSource;
            source.state = 'playing';
            
            console.log(`Playing sound for source ${sourceId}`);
            return true;
        } catch (error) {
            console.error(`Error playing sound for source ${sourceId}:`, error);
            return false;
        }
    }
    
    playFallbackSound(source, options) {
        try {
            // Reset audio element
            source.audioElement.currentTime = options.offset || 0;
            source.audioElement.loop = options.loop;
            
            // Start playback
            const playPromise = source.audioElement.play();
            
            if (playPromise) {
                playPromise.catch(error => {
                    console.warn(`Playback prevented for fallback source: ${error}`);
                });
            }
            
            // Update state
            source.state = 'playing';
            
            // Set up ended event if not looping
            if (!options.loop) {
                source.audioElement.onended = () => {
                    source.state = 'stopped';
                    
                    // Publish sound ended event
                    if (window.eventSystem) {
                        window.eventSystem.publish('sound-ended', { sourceId: source.id });
                    }
                };
            }
            
            return true;
        } catch (error) {
            console.error(`Error playing fallback sound: ${error}`);
            return false;
        }
    }
    
    stopSound(sourceId) {
        if (!this.initialized) {
            console.warn('Spatial audio system not initialized');
            return false;
        }
        
        const source = this.sources.get(sourceId);
        if (!source) {
            console.error(`Source ${sourceId} not found`);
            return false;
        }
        
        if (source.state !== 'playing') {
            return true; // Already stopped
        }
        
        if (this.fallbackMode) {
            return this.stopFallbackSound(source);
        }
        
        try {
            // Stop buffer source
            if (source.bufferSource) {
                source.bufferSource.stop();
                source.bufferSource.onended = null;
                source.bufferSource = null;
            }
            
            // Update state
            source.state = 'stopped';
            
            console.log(`Stopped sound for source ${sourceId}`);
            return true;
        } catch (error) {
            console.error(`Error stopping sound for source ${sourceId}:`, error);
            return false;
        }
    }
    
    stopFallbackSound(source) {
        try {
            // Pause audio element
            source.audioElement.pause();
            source.audioElement.currentTime = 0;
            
            // Update state
            source.state = 'stopped';
            
            return true;
        } catch (error) {
            console.error(`Error stopping fallback sound: ${error}`);
            return false;
        }
    }
    
    setSourcePosition(panner, position) {
        if (panner.positionX) {
            // Modern API
            panner.positionX.value = position.x;
            panner.positionY.value = position.y;
            panner.positionZ.value = position.z;
        } else {
            // Legacy API
            panner.setPosition(position.x, position.y, position.z);
        }
    }
    
    setSourceOrientation(panner, orientation) {
        if (panner.orientationX) {
            // Modern API
            panner.orientationX.value = orientation.x;
            panner.orientationY.value = orientation.y;
            panner.orientationZ.value = orientation.z;
        } else {
            // Legacy API
            panner.setOrientation(orientation.x, orientation.y, orientation.z);
        }
    }
    
    updateSourcePosition(sourceId, position) {
        if (!this.initialized) {
            console.warn('Spatial audio system not initialized');
            return false;
        }
        
        const source = this.sources.get(sourceId);
        if (!source) {
            console.error(`Source ${sourceId} not found`);
            return false;
        }
        
        if (this.fallbackMode) {
            return this.updateFallbackSourcePosition(source, position);
        }
        
        try {
            // Update panner position
            this.setSourcePosition(source.nodes.panner, position);
            
            // Update settings
            source.settings.position = position;
            
            return true;
        } catch (error) {
            console.error(`Error updating position for source ${sourceId}:`, error);
            return false;
        }
    }
    
    updateFallbackSourcePosition(source, position) {
        try {
            // Store position
            source.settings.position = position;
            
            // Update volume based on distance from listener
            const listener = this.listeners.get('default');
            if (listener && source.audioElement) {
                const distance = this.calculateDistance(position, listener.position);
                const volume = this.calculateDistanceGain(distance, source.settings);
                source.audioElement.volume = volume;
            }
            
            return true;
        } catch (error) {
            console.error(`Error updating fallback source position: ${error}`);
            return false;
        }
    }
    
    calculateDistance(pos1, pos2) {
        return Math.sqrt(
            Math.pow(pos1.x - pos2.x, 2) +
            Math.pow(pos1.y - pos2.y, 2) +
            Math.pow(pos1.z - pos2.z, 2)
        );
    }
    
    calculateDistanceGain(distance, settings) {
        // Simplified inverse distance model
        if (distance < settings.refDistance) {
            return 1;
        } else if (distance > settings.maxDistance) {
            return 0;
        } else {
            return settings.refDistance / (settings.refDistance + settings.rolloffFactor * (distance - settings.refDistance));
        }
    }
    
    // Listener Methods
    
    createListener(listenerId, position = { x: 0, y: 0, z: 0 }) {
        if (!this.initialized || this.fallbackMode) {
            // Store listener position for fallback mode
            this.listeners.set(listenerId, {
                position: position,
                orientation: { forward: { x: 0, y: 0, z: -1 }, up: { x: 0, y: 1, z: 0 } }
            });
            return listenerId;
        }
        
        try {
            // Get audio context listener
            const listener = this.audioContext.listener;
            
            // Set initial position
            this.setListenerPosition(listener, position);
            
            // Set default orientation (looking forward, up is +Y)
            const orientation = {
                forward: { x: 0, y: 0, z: -1 },
                up: { x: 0, y: 1, z: 0 }
            };
            this.setListenerOrientation(listener, orientation);
            
            // Store listener configuration
            this.listeners.set(listenerId, {
                position: position,
                orientation: orientation
            });
            
            console.log(`Created listener: ${listenerId}`);
            return listenerId;
        } catch (error) {
            console.error(`Error creating listener ${listenerId}:`, error);
            return null;
        }
    }
    
    setListenerPosition(listener, position) {
        if (listener.positionX) {
            // Modern API
            listener.positionX.value = position.x;
            listener.positionY.value = position.y;
            listener.positionZ.value = position.z;
        } else {
            // Legacy API
            listener.setPosition(position.x, position.y, position.z);
        }
    }
    
    setListenerOrientation(listener, orientation) {
        const forward = orientation.forward;
        const up = orientation.up;
        
        if (listener.forwardX) {
            // Modern API
            listener.forwardX.value = forward.x;
            listener.forwardY.value = forward.y;
            listener.forwardZ.value = forward.z;
            listener.upX.value = up.x;
            listener.upY.value = up.y;
            listener.upZ.value = up.z;
        } else {
            // Legacy API
            listener.setOrientation(
                forward.x, forward.y, forward.z,
                up.x, up.y, up.z
            );
        }
    }
    
    updateListenerPosition(listenerId, position) {
        if (!this.initialized) {
            console.warn('Spatial audio system not initialized');
            return false;
        }
        
        const listenerConfig = this.listeners.get(listenerId);
        if (!listenerConfig) {
            console.error(`Listener ${listenerId} not found`);
            return false;
        }
        
        try {
            // Update position
            listenerConfig.position = position;
            
            if (this.fallbackMode) {
                // Update all source volumes based on new listener position
                this.updateFallbackSourceVolumes();
            } else {
                // Update audio context listener
                this.setListenerPosition(this.audioContext.listener, position);
            }
            
            return true;
        } catch (error) {
            console.error(`Error updating position for listener ${listenerId}:`, error);
            return false;
        }
    }
    
    updateListenerOrientation(listenerId, orientation) {
        if (!this.initialized) {
            console.warn('Spatial audio system not initialized');
            return false;
        }
        
        const listenerConfig = this.listeners.get(listenerId);
        if (!listenerConfig) {
            console.error(`Listener ${listenerId} not found`);
            return false;
        }
        
        try {
            // Update orientation
            listenerConfig.orientation = orientation;
            
            if (!this.fallbackMode) {
                // Update audio context listener
                this.setListenerOrientation(this.audioContext.listener, orientation);
            }
            
            return true;
        } catch (error) {
            console.error(`Error updating orientation for listener ${listenerId}:`, error);
            return false;
        }
    }
    
    updateFallbackSourceVolumes() {
        if (!this.fallbackMode) return;
        
        const listener = this.listeners.get('default');
        if (!listener) return;
        
        // Update volume for all sources based on distance
        for (const [sourceId, source] of this.sources.entries()) {
            if (source.audioElement) {
                const distance = this.calculateDistance(source.settings.position, listener.position);
                const volume = this.calculateDistanceGain(distance, source.settings);
                source.audioElement.volume = volume;
            }
        }
    }
    
    // Audio Zone Methods
    
    createAudioZone(zoneId, options = {}) {
        const defaultOptions = {
            position: { x: 0, y: 0, z: 0 },
            dimensions: { width: 5, height: 3, depth: 5 },
            roomId: 'default',
            fadeDistance: 1, // Distance over which to fade in/out
            sources: [] // Array of source IDs to include in this zone
        };
        
        const settings = { ...defaultOptions, ...options };
        
        // Store zone configuration
        this.zones = this.zones || new Map();
        this.zones.set(zoneId, {
            settings: settings,
            active: true
        });
        
        console.log(`Created audio zone: ${zoneId}`);
        return zoneId;
    }
    
    updateZones() {
        if (!this.initialized || !this.zones) return;
        
        const listener = this.listeners.get('default');
        if (!listener) return;
        
        // Check each zone
        for (const [zoneId, zone] of this.zones.entries()) {
            if (!zone.active) continue;
            
            const settings = zone.settings;
            const position = settings.position;
            const dimensions = settings.dimensions;
            
            // Check if listener is inside zone
            const inside = this.isPointInBox(
                listener.position,
                position,
                dimensions
            );
            
            // Calculate distance to zone boundary
            const distance = inside ? 
                this.distanceToBoxBoundary(listener.position, position, dimensions) :
                -this.distanceToBox(listener.position, position, dimensions);
            
            // Normalize distance by fade distance
            const normalizedDistance = Math.min(1, Math.max(0, distance / settings.fadeDistance));
            
            // Apply zone effects
            this.applyZoneEffects(zone, normalizedDistance);
        }
    }
    
    isPointInBox(point, boxCenter, boxDimensions) {
        return (
            point.x >= boxCenter.x - boxDimensions.width / 2 &&
            point.x <= boxCenter.x + boxDimensions.width / 2 &&
            point.y >= boxCenter.y - boxDimensions.height / 2 &&
            point.y <= boxCenter.y + boxDimensions.height / 2 &&
            point.z >= boxCenter.z - boxDimensions.depth / 2 &&
            point.z <= boxCenter.z + boxDimensions.depth / 2
        );
    }
    
    distanceToBoxBoundary(point, boxCenter, boxDimensions) {
        // Calculate distance to each boundary
        const distanceToXMin = point.x - (boxCenter.x - boxDimensions.width / 2);
        const distanceToXMax = (boxCenter.x + boxDimensions.width / 2) - point.x;
        const distanceToYMin = point.y - (boxCenter.y - boxDimensions.height / 2);
        const distanceToYMax = (boxCenter.y + boxDimensions.height / 2) - point.y;
        const distanceToZMin = point.z - (boxCenter.z - boxDimensions.depth / 2);
        const distanceToZMax = (boxCenter.z + boxDimensions.depth / 2) - point.z;
        
        // Return minimum distance to any boundary
        return Math.min(
            distanceToXMin, distanceToXMax,
            distanceToYMin, distanceToYMax,
            distanceToZMin, distanceToZMax
        );
    }
    
    distanceToBox(point, boxCenter, boxDimensions) {
        // Calculate closest point on box
        const closestX = Math.max(
            boxCenter.x - boxDimensions.width / 2,
            Math.min(point.x, boxCenter.x + boxDimensions.width / 2)
        );
        const closestY = Math.max(
            boxCenter.y - boxDimensions.height / 2,
            Math.min(point.y, boxCenter.y + boxDimensions.height / 2)
        );
        const closestZ = Math.max(
            boxCenter.z - boxDimensions.depth / 2,
            Math.min(point.z, boxCenter.z + boxDimensions.depth / 2)
        );
        
        // Calculate distance to closest point
        return Math.sqrt(
            Math.pow(point.x - closestX, 2) +
            Math.pow(point.y - closestY, 2) +
            Math.pow(point.z - closestZ, 2)
        );
    }
    
    applyZoneEffects(zone, normalizedDistance) {
        if (this.fallbackMode) return;
        
        const settings = zone.settings;
        const room = this.rooms.get(settings.roomId);
        
        if (!room) return;
        
        // Apply room effects based on distance
        if (normalizedDistance > 0) {
            // Inside zone or transition area
            for (const sourceId of settings.sources) {
                const source = this.sources.get(sourceId);
                if (source && source.nodes && source.nodes.panner) {
                    // Connect to zone room
                    if (source.currentRoom !== settings.roomId) {
                        source.nodes.panner.disconnect();
                        source.nodes.panner.connect(room.nodes.input);
                        source.currentRoom = settings.roomId;
                    }
                }
            }
            
            // Adjust wet/dry mix based on distance
            room.nodes.dry.gain.value = 1 - normalizedDistance * room.settings.reflectivity;
            room.nodes.wet.gain.value = normalizedDistance * room.settings.reflectivity;
        } else {
            // Outside zone
            for (const sourceId of settings.sources) {
                const source = this.sources.get(sourceId);
                if (source && source.nodes && source.nodes.panner && source.currentRoom === settings.roomId) {
                    // Connect to default room or master
                    const defaultRoom = this.rooms.get('default');
                    source.nodes.panner.disconnect();
                    
                    if (defaultRoom) {
                        source.nodes.panner.connect(defaultRoom.nodes.input);
                        source.currentRoom = 'default';
                    } else {
                        source.nodes.panner.connect(this.masterGain);
                        source.currentRoom = null;
                    }
                }
            }
        }
    }
    
    // Utility Methods
    
    setMasterVolume(volume) {
        if (!this.initialized) {
            console.warn('Spatial audio system not initialized');
            return false;
        }
        
        try {
            if (this.fallbackMode) {
                // Store master volume for fallback mode
                this.fallbackMasterVolume = Math.max(0, Math.min(1, volume));
                
                // Apply to all audio elements
                for (const source of this.sources.values()) {
                    if (source.audioElement) {
                        // Combine master volume with distance-based volume
                        const distance = this.calculateDistance(
                            source.settings.position,
                            this.listeners.get('default').position
                        );
                        const distanceGain = this.calculateDistanceGain(distance, source.settings);
                        source.audioElement.volume = distanceGain * this.fallbackMasterVolume;
                    }
                }
            } else {
                // Set master gain
                this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
            }
            
            return true;
        } catch (error) {
            console.error('Error setting master volume:', error);
            return false;
        }
    }
    
    getMasterVolume() {
        if (!this.initialized) {
            console.warn('Spatial audio system not initialized');
            return 0;
        }
        
        if (this.fallbackMode) {
            return this.fallbackMasterVolume || 0.8;
        } else {
            return this.masterGain.gain.value;
        }
    }
    
    setSourceVolume(sourceId, volume) {
        if (!this.initialized) {
            console.warn('Spatial audio system not initialized');
            return false;
        }
        
        const source = this.sources.get(sourceId);
        if (!source) {
            console.error(`Source ${sourceId} not found`);
            return false;
        }
        
        try {
            if (this.fallbackMode) {
                if (source.audioElement) {
                    // Store source volume
                    source.volume = Math.max(0, Math.min(1, volume));
                    
                    // Apply volume (combined with distance-based attenuation)
                    const distance = this.calculateDistance(
                        source.settings.position,
                        this.listeners.get('default').position
                    );
                    const distanceGain = this.calculateDistanceGain(distance, source.settings);
                    source.audioElement.volume = distanceGain * source.volume * (this.fallbackMasterVolume || 0.8);
                }
            } else {
                // Set source gain
                source.nodes.gain.gain.value = Math.max(0, Math.min(1, volume));
            }
            
            return true;
        } catch (error) {
            console.error(`Error setting volume for source ${sourceId}:`, error);
            return false;
        }
    }
    
    getSourceVolume(sourceId) {
        if (!this.initialized) {
            console.warn('Spatial audio system not initialized');
            return 0;
        }
        
        const source = this.sources.get(sourceId);
        if (!source) {
            console.error(`Source ${sourceId} not found`);
            return 0;
        }
        
        if (this.fallbackMode) {
            return source.volume || 1.0;
        } else {
            return source.nodes.gain.gain.value;
        }
    }
    
    getSourceState(sourceId) {
        if (!this.initialized) {
            console.warn('Spatial audio system not initialized');
            return 'unknown';
        }
        
        const source = this.sources.get(sourceId);
        if (!source) {
            console.error(`Source ${sourceId} not found`);
            return 'unknown';
        }
        
        return source.state;
    }
    
    // Cleanup Methods
    
    removeSource(sourceId) {
        if (!this.initialized) {
            console.warn('Spatial audio system not initialized');
            return false;
        }
        
        const source = this.sources.get(sourceId);
        if (!source) {
            console.error(`Source ${sourceId} not found`);
            return false;
        }
        
        try {
            // Stop sound if playing
            if (source.state === 'playing') {
                this.stopSound(sourceId);
            }
            
            if (this.fallbackMode) {
                // Clean up audio element
                if (source.audioElement) {
                    source.audioElement.src = '';
                    source.audioElement.oncanplaythrough = null;
                    source.audioElement.onerror = null;
                    source.audioElement.onended = null;
                }
            } else {
                // Disconnect nodes
                if (source.nodes) {
                    if (source.nodes.gain) {
                        source.nodes.gain.disconnect();
                    }
                    if (source.nodes.panner) {
                        source.nodes.panner.disconnect();
                    }
                }
            }
            
            // Remove from sources map
            this.sources.delete(sourceId);
            
            console.log(`Removed audio source: ${sourceId}`);
            return true;
        } catch (error) {
            console.error(`Error removing audio source ${sourceId}:`, error);
            return false;
        }
    }
    
    removeRoom(roomId) {
        if (!this.initialized || this.fallbackMode) {
            return true;
        }
        
        const room = this.rooms.get(roomId);
        if (!room) {
            console.error(`Room ${roomId} not found`);
            return false;
        }
        
        try {
            // Disconnect nodes
            if (room.nodes) {
                if (room.nodes.input) {
                    room.nodes.input.disconnect();
                }
                if (room.nodes.reverb) {
                    room.nodes.reverb.disconnect();
                }
                if (room.nodes.dry) {
                    room.nodes.dry.disconnect();
                }
                if (room.nodes.wet) {
                    room.nodes.wet.disconnect();
                }
            }
            
            // Remove from rooms map
            this.rooms.delete(roomId);
            
            console.log(`Removed room: ${roomId}`);
            return true;
        } catch (error) {
            console.error(`Error removing room ${roomId}:`, error);
            return false;
        }
    }
    
    dispose() {
        if (!this.initialized) {
            return;
        }
        
        try {
            // Clean up all sources
            for (const sourceId of this.sources.keys()) {
                this.removeSource(sourceId);
            }
            
            // Clean up all rooms
            if (!this.fallbackMode) {
                for (const roomId of this.rooms.keys()) {
                    this.removeRoom(roomId);
                }
                
                // Close audio context
                if (this.audioContext && this.audioContext.state !== 'closed') {
                    this.audioContext.close();
                }
            }
            
            // Clear maps
            this.sources.clear();
            this.listeners.clear();
            this.rooms.clear();
            if (this.zones) {
                this.zones.clear();
            }
            
            this.initialized = false;
            console.log('Spatial audio system disposed');
        } catch (error) {
            console.error('Error disposing spatial audio system:', error);
        }
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpatialAudioSystem;
}
