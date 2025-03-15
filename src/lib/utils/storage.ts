/**
 * Modern storage utility that provides a safe wrapper around localStorage and sessionStorage
 * to avoid deprecated API warnings and handle errors gracefully.
 */

// Type for storage options
type StorageType = 'local' | 'session';

// Interface for storage items with expiration
interface StorageItemWithExpiry<T> {
  value: T;
  expiry?: number; // Optional expiration timestamp
}

/**
 * Safe storage utility that handles exceptions and provides type safety
 */
export const safeStorage = {
  /**
   * Set an item in storage with optional expiration
   */
  setItem: <T>(key: string, value: T, options?: { 
    storage?: StorageType;
    expiry?: number; // Time in milliseconds until expiration
  }): boolean => {
    try {
      const storageType = options?.storage || 'local';
      const storage = storageType === 'local' ? window.localStorage : window.sessionStorage;
      
      const item: StorageItemWithExpiry<T> = {
        value
      };
      
      // Add expiration if provided
      if (options?.expiry) {
        item.expiry = Date.now() + options.expiry;
      }
      
      storage.setItem(key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error(`Error setting ${key} in storage:`, error);
      return false;
    }
  },
  
  /**
   * Get an item from storage, respecting expiration if set
   */
  getItem: <T>(key: string, options?: {
    storage?: StorageType;
    defaultValue?: T;
  }): T | null => {
    try {
      const storageType = options?.storage || 'local';
      const storage = storageType === 'local' ? window.localStorage : window.sessionStorage;
      
      const itemStr = storage.getItem(key);
      if (!itemStr) return options?.defaultValue || null;
      
      const item: StorageItemWithExpiry<T> = JSON.parse(itemStr);
      
      // Check if the item has expired
      if (item.expiry && Date.now() > item.expiry) {
        storage.removeItem(key);
        return options?.defaultValue || null;
      }
      
      return item.value;
    } catch (error) {
      console.error(`Error getting ${key} from storage:`, error);
      return options?.defaultValue || null;
    }
  },
  
  /**
   * Remove an item from storage
   */
  removeItem: (key: string, options?: { storage?: StorageType }): boolean => {
    try {
      const storageType = options?.storage || 'local';
      const storage = storageType === 'local' ? window.localStorage : window.sessionStorage;
      
      storage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
      return false;
    }
  },
  
  /**
   * Clear all items from storage
   */
  clear: (options?: { storage?: StorageType }): boolean => {
    try {
      const storageType = options?.storage || 'local';
      const storage = storageType === 'local' ? window.localStorage : window.sessionStorage;
      
      storage.clear();
      return true;
    } catch (error) {
      console.error(`Error clearing storage:`, error);
      return false;
    }
  },
  
  /**
   * Check if storage is available
   */
  isAvailable: (type: StorageType = 'local'): boolean => {
    try {
      const storage = type === 'local' ? window.localStorage : window.sessionStorage;
      const testKey = `__storage_test__${Math.random()}`;
      
      storage.setItem(testKey, 'test');
      storage.removeItem(testKey);
      
      return true;
    } catch (e) {
      return false;
    }
  }
};

/**
 * Hook-compatible storage for React components
 */
export const createStorage = <T>(
  key: string, 
  initialValue: T, 
  options?: { 
    storage?: StorageType;
    expiry?: number;
  }
) => {
  return {
    get: (): T => {
      return safeStorage.getItem<T>(key, { 
        storage: options?.storage, 
        defaultValue: initialValue 
      }) as T;
    },
    set: (value: T): void => {
      safeStorage.setItem<T>(key, value, { 
        storage: options?.storage,
        expiry: options?.expiry
      });
    },
    remove: (): void => {
      safeStorage.removeItem(key, { storage: options?.storage });
    }
  };
};

export default safeStorage; 