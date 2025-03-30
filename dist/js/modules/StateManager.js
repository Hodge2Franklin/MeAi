// StateManager.js - Manages application state and provides event-based communication

export default class StateManager {
  constructor() {
    this.state = {};
    this.listeners = {};
    this.eventListeners = {};
  }

  // Get the entire state or a specific path
  getState(path) {
    if (!path) {
      return this.state;
    }
    
    return this.getNestedProperty(this.state, path);
  }

  // Set a value at a specific path
  setState(path, value) {
    if (!path) {
      console.error('Path is required for setState');
      return;
    }
    
    const oldValue = this.getNestedProperty(this.state, path);
    this.setNestedProperty(this.state, path, value);
    
    // Notify listeners
    this.notifyListeners(path, oldValue, value);
  }

  // Subscribe to state changes
  on(event, callback) {
    if (event.includes('.')) {
      // This is a state path listener
      if (!this.listeners[event]) {
        this.listeners[event] = [];
      }
      this.listeners[event].push(callback);
    } else {
      // This is an event listener
      if (!this.eventListeners[event]) {
        this.eventListeners[event] = [];
      }
      this.eventListeners[event].push(callback);
    }
  }

  // Unsubscribe from state changes
  off(event, callback) {
    if (event.includes('.')) {
      // This is a state path listener
      if (this.listeners[event]) {
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
      }
    } else {
      // This is an event listener
      if (this.eventListeners[event]) {
        this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
      }
    }
  }

  // Emit an event
  emit(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Notify listeners of state changes
  notifyListeners(path, oldValue, newValue) {
    // Skip if value hasn't changed
    if (JSON.stringify(oldValue) === JSON.stringify(newValue)) {
      return;
    }
    
    // Notify exact path listeners
    if (this.listeners[path]) {
      this.listeners[path].forEach(callback => {
        try {
          callback({
            path,
            oldValue,
            newValue
          });
        } catch (error) {
          console.error(`Error in state listener for ${path}:`, error);
        }
      });
    }
    
    // Notify parent path listeners
    const pathParts = path.split('.');
    while (pathParts.length > 1) {
      pathParts.pop();
      const parentPath = pathParts.join('.');
      
      if (this.listeners[parentPath]) {
        const parentOldValue = this.getNestedProperty(this.state, parentPath);
        
        this.listeners[parentPath].forEach(callback => {
          try {
            callback({
              path: parentPath,
              oldValue: parentOldValue,
              newValue: parentOldValue,
              changedPath: path
            });
          } catch (error) {
            console.error(`Error in state listener for ${parentPath}:`, error);
          }
        });
      }
    }
  }

  // Helper method to get a nested property
  getNestedProperty(obj, path) {
    const pathParts = path.split('.');
    let current = obj;
    
    for (const part of pathParts) {
      if (current === undefined || current === null) {
        return undefined;
      }
      current = current[part];
    }
    
    return current;
  }

  // Helper method to set a nested property
  setNestedProperty(obj, path, value) {
    const pathParts = path.split('.');
    let current = obj;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      
      if (current[part] === undefined || current[part] === null) {
        current[part] = {};
      }
      
      current = current[part];
    }
    
    current[pathParts[pathParts.length - 1]] = value;
  }
}
