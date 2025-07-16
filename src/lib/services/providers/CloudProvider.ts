import type { StorageProvider } from '../storageService';
import { StorageError } from '../storageService';

export interface CloudProviderConfig {
  apiEndpoint: string;
  apiKey: string;
  timeout?: number;
}

export class CloudProvider implements StorageProvider {
  readonly name: string;
  private config: CloudProviderConfig;
  
  constructor(name: string, config: CloudProviderConfig) {
    this.name = name;
    this.config = {
      timeout: 5000, // 5 second default timeout
      ...config
    };
  }
  
  async initialize(): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
      
      const response = await fetch(`${this.config.apiEndpoint}/health`, {
        headers: { 'Authorization': `Bearer ${this.config.apiKey}` },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new StorageError(`Cloud provider health check failed: ${response.status}`, this.name);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new StorageError(`Cloud provider initialization timeout`, this.name);
      }
      throw new StorageError(`Cloud provider initialization failed: ${error.message}`, this.name);
    }
  }
  
  async get(key: string): Promise<string | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
      
      const response = await fetch(`${this.config.apiEndpoint}/storage/${key}`, {
        headers: { 'Authorization': `Bearer ${this.config.apiKey}` },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        throw new StorageError(`Cloud get failed: ${response.status}`, this.name);
      }
      
      const data = await response.json();
      return data.value || null;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn(`Cloud provider ${this.name} get timeout`);
        return null;
      }
      console.warn(`Cloud provider ${this.name} get failed:`, error);
      return null;
    }
  }
  
  async set(key: string, value: string): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
      
      const response = await fetch(`${this.config.apiEndpoint}/storage/${key}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ value }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new StorageError(`Cloud set failed: ${response.status}`, this.name);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new StorageError(`Cloud provider set timeout`, this.name);
      }
      throw new StorageError(`Cloud provider set failed: ${error.message}`, this.name);
    }
  }
  
  async remove(key: string): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
      
      const response = await fetch(`${this.config.apiEndpoint}/storage/${key}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${this.config.apiKey}` },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok && response.status !== 404) {
        throw new StorageError(`Cloud remove failed: ${response.status}`, this.name);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new StorageError(`Cloud provider remove timeout`, this.name);
      }
      throw new StorageError(`Cloud provider remove failed: ${error.message}`, this.name);
    }
  }
  
  async clear(): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
      
      const response = await fetch(`${this.config.apiEndpoint}/storage`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${this.config.apiKey}` },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new StorageError(`Cloud clear failed: ${response.status}`, this.name);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new StorageError(`Cloud provider clear timeout`, this.name);
      }
      throw new StorageError(`Cloud provider clear failed: ${error.message}`, this.name);
    }
  }
  
  isAvailable(): boolean {
    return !!this.config.apiEndpoint && !!this.config.apiKey;
  }
}