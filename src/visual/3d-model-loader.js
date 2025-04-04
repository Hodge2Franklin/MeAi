/**
 * 3D Model Loader
 * 
 * This module handles loading and caching of 3D models for the MeAI visualization system.
 * It provides optimized model loading with fallback mechanisms for different device capabilities.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

class ModelLoader {
    constructor() {
        // Initialize loaders
        this.gltfLoader = new GLTFLoader();
        this.textureLoader = new THREE.TextureLoader();
        
        // Set up Draco compression loader
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath('/src/visual/lib/draco/');
        this.gltfLoader.setDRACOLoader(this.dracoLoader);
        
        // Model cache
        this.modelCache = new Map();
        this.textureCache = new Map();
        
        // Loading manager for tracking progress
        this.loadingManager = new THREE.LoadingManager();
        this.setupLoadingManager();
    }
    
    /**
     * Set up the loading manager with progress tracking
     */
    setupLoadingManager() {
        this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
            const progress = itemsLoaded / itemsTotal;
            // Publish loading progress event
            window.eventSystem.publish('model-loading-progress', {
                url: url,
                progress: progress,
                loaded: itemsLoaded,
                total: itemsTotal
            });
        };
        
        this.loadingManager.onError = (url) => {
            console.error('Error loading:', url);
            // Publish loading error event
            window.eventSystem.publish('model-loading-error', {
                url: url
            });
        };
    }
    
    /**
     * Load a GLTF model with caching
     * @param {string} url - URL of the model to load
     * @returns {Promise<THREE.Group>} - Promise resolving to the loaded model
     */
    loadModel(url) {
        // Check cache first
        if (this.modelCache.has(url)) {
            return Promise.resolve(this.modelCache.get(url).clone());
        }
        
        // Load model
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                url,
                (gltf) => {
                    const model = gltf.scene;
                    // Cache the model
                    this.modelCache.set(url, model.clone());
                    resolve(model);
                },
                (progress) => {
                    // Loading progress
                    const percentComplete = (progress.loaded / progress.total) * 100;
                    console.log(`Loading model: ${Math.round(percentComplete)}%`);
                },
                (error) => {
                    console.error('Error loading model:', error);
                    reject(error);
                }
            );
        });
    }
    
    /**
     * Load a texture with caching
     * @param {string} url - URL of the texture to load
     * @returns {Promise<THREE.Texture>} - Promise resolving to the loaded texture
     */
    loadTexture(url) {
        // Check cache first
        if (this.textureCache.has(url)) {
            return Promise.resolve(this.textureCache.get(url).clone());
        }
        
        // Load texture
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                url,
                (texture) => {
                    // Cache the texture
                    this.textureCache.set(url, texture);
                    resolve(texture);
                },
                undefined,
                (error) => {
                    console.error('Error loading texture:', error);
                    reject(error);
                }
            );
        });
    }
    
    /**
     * Create a fallback model when 3D models can't be loaded
     * @param {string} type - Type of fallback model to create
     * @returns {THREE.Mesh} - Fallback mesh
     */
    createFallbackModel(type = 'sphere') {
        let geometry;
        
        switch (type) {
            case 'joy':
                geometry = new THREE.IcosahedronGeometry(1, 2);
                break;
            case 'reflective':
                geometry = new THREE.SphereGeometry(1, 32, 32);
                break;
            case 'curious':
                geometry = new THREE.TorusKnotGeometry(0.8, 0.2, 64, 16);
                break;
            case 'excited':
                geometry = new THREE.OctahedronGeometry(1, 2);
                break;
            case 'empathetic':
                geometry = new THREE.SphereGeometry(1, 32, 32);
                break;
            case 'calm':
                geometry = new THREE.SphereGeometry(1, 64, 64);
                break;
            case 'neutral':
            default:
                geometry = new THREE.SphereGeometry(1, 32, 32);
                break;
        }
        
        const material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.3,
            metalness: 0.7
        });
        
        return new THREE.Mesh(geometry, material);
    }
    
    /**
     * Clear the model and texture caches
     */
    clearCache() {
        this.modelCache.clear();
        this.textureCache.clear();
    }
    
    /**
     * Dispose of all resources
     */
    dispose() {
        this.clearCache();
        this.dracoLoader.dispose();
    }
}

export default ModelLoader;
