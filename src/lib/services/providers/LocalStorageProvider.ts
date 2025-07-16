import { STORAGE_KEY_PREFIX } from '$lib/constants';
import type { StorageProvider } from '../storageService';
import { StorageError } from '../storageService';

export class LocalStorageProvider implements StorageProvider {
  readonly name = 'localStorage';
  private keyPrefix = STORAGE_KEY_PREFIX;
  
  async initialize(): Promise<void> {
    if (!this.isAvailable()) {
      throw new StorageError('localStorage is not available', this.name);
    }
  }
  
  async get(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(`${this.keyPrefix}${key}`);
    } catch (error) {
      console.warn('localStorage get failed:', error);
      return null;
    }
  }
  
  async set(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(`${this.keyPrefix}${key}`, value);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new StorageError('localStorage quota exceeded', this.name);
      }
      throw new StorageError('localStorage set failed', this.name);
    }
  }
  
  async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(`${this.keyPrefix}${key}`);
    } catch (error) {
      console.warn('localStorage remove failed:', error);
    }
  }
  
  async clear(): Promise<void> {
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith(this.keyPrefix)) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn('localStorage clear failed:', error);
    }
  }
  
  isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}