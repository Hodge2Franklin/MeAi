/**
 * Service Worker for MeAI
 * 
 * This service worker provides offline support for the MeAI application.
 * It caches assets, API responses, and enables offline functionality.
 */

// Cache names
const STATIC_CACHE_NAME = 'meai-static-v1';
const DYNAMIC_CACHE_NAME = 'meai-dynamic-v1';
const CONVERSATION_CACHE_NAME = 'meai-conversations-v1';

// Resources to cache immediately on installation
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/styles.css',
  '/enhanced-ui.css',
  '/src/visual/pixel-visualization-3d.js',
  '/src/visual/advanced-animation-system.js',
  '/src/visual/enhanced-physics-system.js',
  '/src/visual/procedural-animation-generator.js',
  '/src/visual/interactive-particle-system.js',
  '/src/visual/shader-effects.js',
  '/src/visual/3d-model-loader.js',
  '/src/visual/performance-optimizer.js',
  '/src/visual/visualization-integration.js',
  '/src/visual/3d-visualization-integration.js',
  '/src/conversation/long-term-memory-system.js',
  '/src/conversation/memory-visualization.js',
  '/src/conversation/voice-recognition-enhancement.js',
  '/src/conversation/natural-conversation-flow.js',
  '/src/audio/spatial-audio-system.js',
  '/src/audio/multi-layered-ambient-system.js',
  '/src/audio/interaction-sound-system.js',
  '/src/ui/enhanced-interface-system.js',
  '/src/ui/user-interaction-controller.js',
  '/src/ui/animation-ui-integration.js',
  '/src/ui/visual-feedback-system.js',
  '/src/ui/accessibility-system.js',
  '/src/ui/theme-system.js',
  '/src/ui/interface-animation-system.js',
  '/src/utils/advanced-user-profile-system.js',
  '/src/utils/event-system.js',
  '/src/utils/storage-manager.js',
  '/src/utils/user-personalization-system.js',
  '/offline.html',
  '/offline.js',
  '/offline.css',
  '/assets/icons/favicon.ico',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  '/assets/sounds/notification.mp3',
  '/assets/sounds/error.mp3',
  '/assets/sounds/success.mp3'
];

// Maximum number of items in dynamic cache
const MAX_DYNAMIC_CACHE_ITEMS = 100;

// Install event - cache static resources
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching static resources');
        return cache.addAll(STATIC_RESOURCES);
      })
      .catch(error => {
        console.error('[Service Worker] Cache installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  
  // Claim clients to control all open pages
  event.waitUntil(clients.claim());
  
  // Clean up old caches
  event.waitUntil(
    caches.keys()
      .then(keyList => {
        return Promise.all(keyList.map(key => {
          if (
            key !== STATIC_CACHE_NAME && 
            key !== DYNAMIC_CACHE_NAME && 
            key !== CONVERSATION_CACHE_NAME
          ) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        }));
      })
  );
  
  return self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests and browser extensions
  if (event.request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Handle API requests
  if (url.pathname.includes('/api/')) {
    handleApiRequest(event);
    return;
  }
  
  // Handle conversation data
  if (url.pathname.includes('/conversations/')) {
    handleConversationRequest(event);
    return;
  }
  
  // Handle static assets
  if (
    url.pathname.endsWith('.js') || 
    url.pathname.endsWith('.css') || 
    url.pathname.endsWith('.html') || 
    url.pathname.endsWith('.ico') || 
    url.pathname.endsWith('.png') || 
    url.pathname.endsWith('.jpg') || 
    url.pathname.endsWith('.svg') || 
    url.pathname.endsWith('.mp3') || 
    url.pathname.endsWith('.woff2')
  ) {
    handleStaticAssetRequest(event);
    return;
  }
  
  // Handle other requests with network-first strategy
  handleNetworkFirstRequest(event);
});

/**
 * Handle API requests with network-first strategy and fallback
 * @param {FetchEvent} event - Fetch event
 */
function handleApiRequest(event) {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone the response to store in cache
        const clonedResponse = response.clone();
        
        // Store in dynamic cache
        caches.open(DYNAMIC_CACHE_NAME)
          .then(cache => {
            cache.put(event.request, clonedResponse);
            
            // Limit cache size
            limitCacheSize(DYNAMIC_CACHE_NAME, MAX_DYNAMIC_CACHE_ITEMS);
          });
        
        return response;
      })
      .catch(error => {
        console.log('[Service Worker] API fetch failed, trying cache', error);
        
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // If no cached response, return offline API response
            return createOfflineApiResponse(event.request);
          });
      })
  );
}

/**
 * Handle conversation data requests with cache-first strategy
 * @param {FetchEvent} event - Fetch event
 */
function handleConversationRequest(event) {
  event.respondWith(
    caches.open(CONVERSATION_CACHE_NAME)
      .then(cache => {
        return cache.match(event.request)
          .then(cachedResponse => {
            // Return cached response if available
            if (cachedResponse) {
              // Try to update cache in background
              updateConversationCache(event.request, cache);
              return cachedResponse;
            }
            
            // If not in cache, fetch from network
            return fetchAndCacheConversation(event.request, cache);
          });
      })
  );
}

/**
 * Handle static asset requests with cache-first strategy
 * @param {FetchEvent} event - Fetch event
 */
function handleStaticAssetRequest(event) {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // If not in cache, fetch from network and cache
        return fetch(event.request)
          .then(response => {
            // Clone the response to store in cache
            const clonedResponse = response.clone();
            
            // Store in static cache
            caches.open(STATIC_CACHE_NAME)
              .then(cache => {
                cache.put(event.request, clonedResponse);
              });
            
            return response;
          })
          .catch(error => {
            console.log('[Service Worker] Static asset fetch failed', error);
            
            // For HTML requests, return offline page
            if (event.request.headers.get('Accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
            
            // For other assets, return empty response
            return new Response('', { status: 408, statusText: 'Request timed out' });
          });
      })
  );
}

/**
 * Handle other requests with network-first strategy
 * @param {FetchEvent} event - Fetch event
 */
function handleNetworkFirstRequest(event) {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone the response to store in cache
        const clonedResponse = response.clone();
        
        // Store in dynamic cache
        caches.open(DYNAMIC_CACHE_NAME)
          .then(cache => {
            cache.put(event.request, clonedResponse);
            
            // Limit cache size
            limitCacheSize(DYNAMIC_CACHE_NAME, MAX_DYNAMIC_CACHE_ITEMS);
          });
        
        return response;
      })
      .catch(error => {
        console.log('[Service Worker] Network fetch failed, trying cache', error);
        
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // For HTML requests, return offline page
            if (event.request.headers.get('Accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
            
            // For other requests, return empty response
            return new Response('', { status: 408, statusText: 'Request timed out' });
          });
      })
  );
}

/**
 * Update conversation cache in background
 * @param {Request} request - Original request
 * @param {Cache} cache - Cache object
 */
function updateConversationCache(request, cache) {
  fetch(request)
    .then(response => {
      if (response.ok) {
        cache.put(request, response);
      }
    })
    .catch(error => {
      console.log('[Service Worker] Background conversation update failed', error);
    });
}

/**
 * Fetch and cache conversation data
 * @param {Request} request - Original request
 * @param {Cache} cache - Cache object
 * @returns {Promise<Response>} Response
 */
function fetchAndCacheConversation(request, cache) {
  return fetch(request)
    .then(response => {
      // Clone the response to store in cache
      const clonedResponse = response.clone();
      
      // Store in conversation cache
      cache.put(request, clonedResponse);
      
      return response;
    })
    .catch(error => {
      console.log('[Service Worker] Conversation fetch failed', error);
      
      // Return offline conversation data
      return createOfflineConversationResponse(request);
    });
}

/**
 * Create offline API response
 * @param {Request} request - Original request
 * @returns {Response} Offline response
 */
function createOfflineApiResponse(request) {
  const url = new URL(request.url);
  
  // Create appropriate offline response based on API endpoint
  if (url.pathname.includes('/api/conversation')) {
    return new Response(JSON.stringify({
      success: false,
      offline: true,
      message: 'You are currently offline. Your message has been saved and will be processed when you reconnect.',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (url.pathname.includes('/api/user')) {
    return new Response(JSON.stringify({
      success: true,
      offline: true,
      message: 'Using cached user data while offline.',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Default offline API response
  return new Response(JSON.stringify({
    success: false,
    offline: true,
    message: 'You are currently offline. This feature requires an internet connection.',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Create offline conversation response
 * @param {Request} request - Original request
 * @returns {Response} Offline response
 */
function createOfflineConversationResponse(request) {
  return new Response(JSON.stringify({
    id: 'offline-' + new Date().getTime(),
    messages: [{
      role: 'system',
      content: 'You are currently offline. Your conversation history will be available when you reconnect.',
      timestamp: new Date().toISOString()
    }],
    offline: true,
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Limit the size of a cache
 * @param {string} cacheName - Name of the cache
 * @param {number} maxItems - Maximum number of items
 */
function limitCacheSize(cacheName, maxItems) {
  caches.open(cacheName)
    .then(cache => {
      cache.keys()
        .then(keys => {
          if (keys.length > maxItems) {
            // Delete oldest items (first in the array)
            cache.delete(keys[0])
              .then(() => limitCacheSize(cacheName, maxItems));
          }
        });
    });
}

// Sync event - handle background sync
self.addEventListener('sync', event => {
  console.log('[Service Worker] Background Sync', event.tag);
  
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
  
  if (event.tag === 'sync-user-data') {
    event.waitUntil(syncUserData());
  }
});

/**
 * Sync pending messages from IndexedDB
 * @returns {Promise} Sync result
 */
function syncMessages() {
  return idbHelper.getPendingMessages()
    .then(messages => {
      return Promise.all(messages.map(message => {
        return fetch('/api/conversation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(message)
        })
        .then(response => {
          if (response.ok) {
            return idbHelper.deleteMessage(message.id);
          }
          throw new Error('Message sync failed');
        })
        .catch(error => {
          console.error('[Service Worker] Message sync error:', error);
        });
      }));
    });
}

/**
 * Sync user data from IndexedDB
 * @returns {Promise} Sync result
 */
function syncUserData() {
  return idbHelper.getPendingUserData()
    .then(userData => {
      return Promise.all(userData.map(data => {
        return fetch('/api/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
        .then(response => {
          if (response.ok) {
            return idbHelper.deleteUserData(data.id);
          }
          throw new Error('User data sync failed');
        })
        .catch(error => {
          console.error('[Service Worker] User data sync error:', error);
        });
      }));
    });
}

// Push event - handle push notifications
self.addEventListener('push', event => {
  console.log('[Service Worker] Push Received', event);
  
  let notificationData = {
    title: 'MeAI Update',
    body: 'Something new happened in your MeAI application.',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    tag: 'meai-notification',
    data: {
      url: '/'
    }
  };
  
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      notificationData.body = event.data.text();
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      vibrate: [100, 50, 100],
      renotify: true,
      requireInteraction: true
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification click', event);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data && event.notification.data.url ? 
    event.notification.data.url : '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(windowClients => {
        // Check if there is already a window/tab open with the target URL
        for (const client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no window/tab is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// IndexedDB helper for offline data
const idbHelper = {
  /**
   * Open IndexedDB database
   * @returns {Promise<IDBDatabase>} Database instance
   */
  openDB: function() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('meai-offline-db', 1);
      
      request.onupgradeneeded = event => {
        const db = event.target.result;
        
        // Create messages store
        if (!db.objectStoreNames.contains('messages')) {
          const messagesStore = db.createObjectStore('messages', { keyPath: 'id' });
          messagesStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        // Create user data store
        if (!db.objectStoreNames.contains('userData')) {
          const userDataStore = db.createObjectStore('userData', { keyPath: 'id' });
          userDataStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        // Create conversations store
        if (!db.objectStoreNames.contains('conversations')) {
          const conversationsStore = db.createObjectStore('conversations', { keyPath: 'id' });
          conversationsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
      
      request.onsuccess = event => {
        resolve(event.target.result);
      };
      
      request.onerror = event => {
        reject('IndexedDB error: ' + event.target.errorCode);
      };
    });
  },
  
  /**
   * Save message to IndexedDB
   * @param {Object} message - Message to save
   * @returns {Promise} Save result
   */
  saveMessage: function(message) {
    return this.openDB()
      .then(db => {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction('messages', 'readwrite');
          const store = transaction.objectStore('messages');
          
          // Add timestamp if not present
          if (!message.timestamp) {
            message.timestamp = new Date().toISOString();
          }
          
          // Add unique ID if not present
          if (!message.id) {
            message.id = 'msg_' + new Date().getTime();
          }
          
          const request = store.add(message);
          
          request.onsuccess = event => {
            resolve(event.target.result);
          };
          
          request.onerror = event => {
            reject('Error saving message: ' + event.target.errorCode);
          };
        });
      });
  },
  
  /**
   * Get all pending messages from IndexedDB
   * @returns {Promise<Array>} Array of pending messages
   */
  getPendingMessages: function() {
    return this.openDB()
      .then(db => {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction('messages', 'readonly');
          const store = transaction.objectStore('messages');
          const request = store.getAll();
          
          request.onsuccess = event => {
            resolve(event.target.result);
          };
          
          request.onerror = event => {
            reject('Error getting messages: ' + event.target.errorCode);
          };
        });
      });
  },
  
  /**
   * Delete message from IndexedDB
   * @param {string} id - Message ID
   * @returns {Promise} Delete result
   */
  deleteMessage: function(id) {
    return this.openDB()
      .then(db => {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction('messages', 'readwrite');
          const store = transaction.objectStore('messages');
          const request = store.delete(id);
          
          request.onsuccess = event => {
            resolve(event.target.result);
          };
          
          request.onerror = event => {
            reject('Error deleting message: ' + event.target.errorCode);
          };
        });
      });
  },
  
  /**
   * Save user data to IndexedDB
   * @param {Object} userData - User data to save
   * @returns {Promise} Save result
   */
  saveUserData: function(userData) {
    return this.openDB()
      .then(db => {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction('userData', 'readwrite');
          const store = transaction.objectStore('userData');
          
          // Add timestamp if not present
          if (!userData.timestamp) {
            userData.timestamp = new Date().toISOString();
          }
          
          // Add unique ID if not present
          if (!userData.id) {
            userData.id = 'user_' + new Date().getTime();
          }
          
          const request = store.add(userData);
          
          request.onsuccess = event => {
            resolve(event.target.result);
          };
          
          request.onerror = event => {
            reject('Error saving user data: ' + event.target.errorCode);
          };
        });
      });
  },
  
  /**
   * Get all pending user data from IndexedDB
   * @returns {Promise<Array>} Array of pending user data
   */
  getPendingUserData: function() {
    return this.openDB()
      .then(db => {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction('userData', 'readonly');
          const store = transaction.objectStore('userData');
          const request = store.getAll();
          
          request.onsuccess = event => {
            resolve(event.target.result);
          };
          
          request.onerror = event => {
            reject('Error getting user data: ' + event.target.errorCode);
          };
        });
      });
  },
  
  /**
   * Delete user data from IndexedDB
   * @param {string} id - User data ID
   * @returns {Promise} Delete result
   */
  deleteUserData: function(id) {
    return this.openDB()
      .then(db => {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction('userData', 'readwrite');
          const store = transaction.objectStore('userData');
          const request = store.delete(id);
          
          request.onsuccess = event => {
            resolve(event.target.result);
          };
          
          request.onerror = event => {
            reject('Error deleting user data: ' + event.target.errorCode);
          };
        });
      });
  },
  
  /**
   * Save conversation to IndexedDB
   * @param {Object} conversation - Conversation to save
   * @returns {Promise} Save result
   */
  saveConversation: function(conversation) {
    return this.openDB()
      .then(db => {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction('conversations', 'readwrite');
          const store = transaction.objectStore('conversations');
          
          // Add timestamp if not present
          if (!conversation.timestamp) {
            conversation.timestamp = new Date().toISOString();
          }
          
          const request = store.put(conversation);
          
          request.onsuccess = event => {
            resolve(event.target.result);
          };
          
          request.onerror = event => {
            reject('Error saving conversation: ' + event.target.errorCode);
          };
        });
      });
  },
  
  /**
   * Get conversation from IndexedDB
   * @param {string} id - Conversation ID
   * @returns {Promise<Object>} Conversation data
   */
  getConversation: function(id) {
    return this.openDB()
      .then(db => {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction('conversations', 'readonly');
          const store = transaction.objectStore('conversations');
          const request = store.get(id);
          
          request.onsuccess = event => {
            resolve(event.target.result);
          };
          
          request.onerror = event => {
            reject('Error getting conversation: ' + event.target.errorCode);
          };
        });
      });
  },
  
  /**
   * Get all conversations from IndexedDB
   * @returns {Promise<Array>} Array of conversations
   */
  getAllConversations: function() {
    return this.openDB()
      .then(db => {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction('conversations', 'readonly');
          const store = transaction.objectStore('conversations');
          const request = store.getAll();
          
          request.onsuccess = event => {
            resolve(event.target.result);
          };
          
          request.onerror = event => {
            reject('Error getting conversations: ' + event.target.errorCode);
          };
        });
      });
  }
};

// Log service worker initialization
console.log('[Service Worker] Initialized');
