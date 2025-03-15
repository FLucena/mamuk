/**
 * A modern storage utility for safely interacting with localStorage and sessionStorage
 * with proper error handling, type safety, and fallbacks for private browsing mode
 */

type StorageType = 'local' | 'session';

interface StorageOptions {
  /**
   * Storage type to use
   * @default 'local'
   */
  type?: StorageType;
  
  /**
   * Expiration time in milliseconds
   * @default undefined (no expiration)
   */
  expiry?: number;
}

interface StoredValue<T> {
  value: T;
  expiry?: number;
}

/**
 * Check if storage is available
 */
const isStorageAvailable = (type: StorageType): boolean => {
  const storage = type === 'local' ? window.localStorage : window.sessionStorage;
  
  try {
    const testKey = '__storage_test__';
    storage.setItem(testKey, 'test');
    storage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Memory fallback when storage is not available
 */
class MemoryStorage {
  private static store = new Map<string, string>();
  
  static getItem(key: string): string | null {
    return MemoryStorage.store.get(key) || null;
  }
  
  static setItem(key: string, value: string): void {
    MemoryStorage.store.set(key, value);
  }
  
  static removeItem(key: string): void {
    MemoryStorage.store.delete(key);
  }
  
  static clear(): void {
    MemoryStorage.store.clear();
  }
}

/**
 * Get the appropriate storage object
 */
const getStorage = (type: StorageType) => {
  if (typeof window === 'undefined') {
    return MemoryStorage;
  }
  
  const isAvailable = isStorageAvailable(type);
  if (!isAvailable) {
    console.warn(`${type}Storage is not available, using memory fallback`);
    return MemoryStorage;
  }
  
  return type === 'local' ? window.localStorage : window.sessionStorage;
};

/**
 * Set a value in storage with optional expiration
 */
export const setStorageItem = <T>(
  key: string,
  value: T,
  options: StorageOptions = {}
): void => {
  try {
    const { type = 'local', expiry } = options;
    const storage = getStorage(type);
    
    const item: StoredValue<T> = {
      value,
    };
    
    // Add expiration if specified
    if (expiry) {
      item.expiry = Date.now() + expiry;
    }
    
    storage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error(`Error setting ${key} in storage:`, error);
  }
};

/**
 * Get a value from storage, respecting expiration
 */
export const getStorageItem = <T>(
  key: string,
  options: StorageOptions = {}
): T | null => {
  try {
    const { type = 'local' } = options;
    const storage = getStorage(type);
    
    const item = storage.getItem(key);
    if (!item) return null;
    
    const parsedItem: StoredValue<T> = JSON.parse(item);
    
    // Check if the item has expired
    if (parsedItem.expiry && Date.now() > parsedItem.expiry) {
      storage.removeItem(key);
      return null;
    }
    
    return parsedItem.value;
  } catch (error) {
    console.error(`Error getting ${key} from storage:`, error);
    return null;
  }
};

/**
 * Remove a value from storage
 */
export const removeStorageItem = (
  key: string,
  options: StorageOptions = {}
): void => {
  try {
    const { type = 'local' } = options;
    const storage = getStorage(type);
    storage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from storage:`, error);
  }
};

/**
 * Clear all values from storage
 */
export const clearStorage = (options: StorageOptions = {}): void => {
  try {
    const { type = 'local' } = options;
    const storage = getStorage(type);
    storage.clear();
  } catch (error) {
    console.error(`Error clearing ${options.type || 'local'} storage:`, error);
  }
};

/**
 * Get all keys from storage
 */
export const getStorageKeys = (options: StorageOptions = {}): string[] => {
  try {
    const { type = 'local' } = options;
    const storage = getStorage(type);
    
    if (storage === MemoryStorage) {
      // Access the private store through a method to avoid linter errors
      return Array.from((MemoryStorage as any).store?.keys() || []);
    }
    
    return Object.keys(storage);
  } catch (error) {
    console.error(`Error getting keys from ${options.type || 'local'} storage:`, error);
    return [];
  }
};

/**
 * Check if a key exists in storage
 */
export const hasStorageItem = (
  key: string,
  options: StorageOptions = {}
): boolean => {
  try {
    const { type = 'local' } = options;
    const storage = getStorage(type);
    
    if (storage === MemoryStorage) {
      // Access the private store through a method to avoid linter errors
      return !!(MemoryStorage as any).store?.has(key);
    }
    
    return storage.getItem(key) !== null;
  } catch (error) {
    console.error(`Error checking if ${key} exists in storage:`, error);
    return false;
  }
};

/**
 * Storage hook for React components
 */
export const createStorageUtil = (defaultOptions: StorageOptions = {}) => {
  return {
    getItem: <T>(key: string, options?: StorageOptions): T | null => 
      getStorageItem<T>(key, { ...defaultOptions, ...options }),
    
    setItem: <T>(key: string, value: T, options?: StorageOptions): void => 
      setStorageItem<T>(key, value, { ...defaultOptions, ...options }),
    
    removeItem: (key: string, options?: StorageOptions): void => 
      removeStorageItem(key, { ...defaultOptions, ...options }),
    
    clear: (options?: StorageOptions): void => 
      clearStorage({ ...defaultOptions, ...options }),
    
    getKeys: (options?: StorageOptions): string[] => 
      getStorageKeys({ ...defaultOptions, ...options }),
    
    hasItem: (key: string, options?: StorageOptions): boolean => 
      hasStorageItem(key, { ...defaultOptions, ...options }),
  };
};

// Create default instances
export const localStorage = createStorageUtil({ type: 'local' });
export const sessionStorage = createStorageUtil({ type: 'session' });

export default {
  setItem: setStorageItem,
  getItem: getStorageItem,
  removeItem: removeStorageItem,
  clear: clearStorage,
  getKeys: getStorageKeys,
  hasItem: hasStorageItem,
  createUtil: createStorageUtil,
  local: localStorage,
  session: sessionStorage,
}; 