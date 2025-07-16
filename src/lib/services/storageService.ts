/**
 * Storage service for SadForms - functional module pattern
 * Handles form persistence to localStorage and cloud providers
 */

import { getStorageConfig } from '../store/FormMetaStore';
import type { Value } from '../types/Form';

export interface StorageProvider {
  readonly name: string;
  initialize(): Promise<void>;
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  isAvailable(): boolean;
}

export interface FormData {
  formId: string;
  fieldValues: Record<string, Value>;
  metadata: {
    lastModified: number;
    version: number;
  };
}

export interface SaveOptions {
  sensitive?: boolean;     // Skip persistence entirely (memory only via stores)
}

export interface StorageConfig {
  primaryProvider: StorageProvider;      // localStorage
  secondaryProviders: StorageProvider[]; // cloud providers
}

export class StorageError extends Error {
  constructor(message: string, public provider?: string) {
    super(message);
    this.name = 'StorageError';
  }
}

// Module-level storage configuration
let storageConfig: StorageConfig | null = null;
let autoSaveTimer: NodeJS.Timeout | null = null;
let pendingChanges = new Set<string>();

/**
 * Initialize storage service with providers
 */
export async function initializeStorage(
  primaryProvider: StorageProvider,
  secondaryProviders: StorageProvider[] = []
): Promise<void> {
  storageConfig = { primaryProvider, secondaryProviders };
  
  // Initialize primary provider (localStorage)
  try {
    await primaryProvider.initialize();
  } catch (error) {
    console.warn('Primary provider (localStorage) failed:', error);
  }
  
  // Initialize secondary providers (cloud providers)
  for (const provider of secondaryProviders) {
    try {
      await provider.initialize();
    } catch (error) {
      console.warn(`Secondary provider (${provider.name}) failed:`, error);
    }
  }
}

/**
 * Save form data to configured providers
 */
export async function saveForm(
  formId: string, 
  formData: Record<string, Value>, 
  options?: SaveOptions
): Promise<void> {
  if (!storageConfig) {
    throw new Error('Storage service not initialized');
  }
  
  const key = formId;
  const value = JSON.stringify({
    formId,
    fieldValues: formData,
    metadata: {
      lastModified: Date.now(),
      version: 1
    }
  });
  
  // Skip persistence for sensitive data (stores handle memory)
  if (options?.sensitive) {
    return;
  }
  
  // Get storage configuration from FormMetaStore
  const { saveToLocal, saveToCloud } = getStorageConfig(formId);
  
  const promises: Promise<void>[] = [];
  
  // Save to primary provider (localStorage)
  if (saveToLocal) {
    promises.push(saveToProvider(storageConfig.primaryProvider, key, value));
  }
  
  // Save to all secondary providers (cloud providers)
  if (saveToCloud) {
    for (const provider of storageConfig.secondaryProviders) {
      promises.push(saveToProvider(provider, key, value));
    }
  }
  
  // Execute all saves in parallel
  await Promise.allSettled(promises);
}

/**
 * Load form data from available providers
 */
export async function getForm(formId: string): Promise<FormData | null> {
  if (!storageConfig) {
    throw new Error('Storage service not initialized');
  }
  
  const key = formId;
  
  // Try primary provider first (localStorage)
  if (storageConfig.primaryProvider.isAvailable()) {
    try {
      const value = await storageConfig.primaryProvider.get(key);
      if (value) {
        return JSON.parse(value);
      }
    } catch (error) {
      console.warn(`Primary provider get failed:`, error);
    }
  }
  
  // Try secondary providers (cloud providers)
  for (const provider of storageConfig.secondaryProviders) {
    if (provider.isAvailable()) {
      try {
        const value = await provider.get(key);
        if (value) {
          return JSON.parse(value);
        }
      } catch (error) {
        console.warn(`Secondary provider ${provider.name} get failed:`, error);
      }
    }
  }
  
  return null;
}

/**
 * Remove form data from all providers
 */
export async function removeForm(formId: string): Promise<void> {
  if (!storageConfig) {
    throw new Error('Storage service not initialized');
  }
  
  const key = formId;
  
  const promises: Promise<void>[] = [];
  
  // Remove from primary provider
  promises.push(removeFromProvider(storageConfig.primaryProvider, key));
  
  // Remove from all secondary providers
  for (const provider of storageConfig.secondaryProviders) {
    promises.push(removeFromProvider(provider, key));
  }
  
  await Promise.allSettled(promises);
}

/**
 * Schedule auto-save with debouncing
 */
export function scheduleAutoSave(formId: string, formData: Record<string, Value>): void {
  pendingChanges.add(formId);
  
  // Clear existing timer
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
  }
  
  // Debounce auto-save (wait 2 seconds after last change)
  autoSaveTimer = setTimeout(async () => {
    const pendingArray = Array.from(pendingChanges);
    for (const pendingFormId of pendingArray) {
      if (pendingFormId === formId) {
        await saveForm(formId, formData);
      }
    }
    pendingChanges.clear();
  }, 2000);
}

/**
 * Add a secondary provider at runtime
 */
export function addSecondaryProvider(provider: StorageProvider): void {
  if (!storageConfig) {
    throw new Error('Storage service not initialized');
  }
  storageConfig.secondaryProviders.push(provider);
}

/**
 * Remove a secondary provider by name
 */
export function removeSecondaryProvider(name: string): void {
  if (!storageConfig) {
    throw new Error('Storage service not initialized');
  }
  storageConfig.secondaryProviders = storageConfig.secondaryProviders.filter(p => p.name !== name);
}

/**
 * Get list of all provider names
 */
export function getProviderNames(): string[] {
  if (!storageConfig) {
    throw new Error('Storage service not initialized');
  }
  return [
    storageConfig.primaryProvider.name,
    ...storageConfig.secondaryProviders.map(p => p.name)
  ];
}

/**
 * Health check for all providers
 */
export async function healthCheck(): Promise<Record<string, boolean>> {
  if (!storageConfig) {
    throw new Error('Storage service not initialized');
  }
  
  const health: Record<string, boolean> = {};
  
  // Check primary provider
  health[storageConfig.primaryProvider.name] = storageConfig.primaryProvider.isAvailable();
  
  // Check secondary providers
  for (const provider of storageConfig.secondaryProviders) {
    health[provider.name] = provider.isAvailable();
  }
  
  return health;
}

// Helper functions
async function saveToProvider(provider: StorageProvider, key: string, value: string): Promise<void> {
  try {
    if (provider.isAvailable()) {
      await provider.set(key, value);
    }
  } catch (error) {
    console.warn(`Provider ${provider.name} set failed:`, error);
    // Don't throw - we want other providers to continue working
  }
}

async function removeFromProvider(provider: StorageProvider, key: string): Promise<void> {
  try {
    if (provider.isAvailable()) {
      await provider.remove(key);
    }
  } catch (error) {
    console.warn(`Provider ${provider.name} remove failed:`, error);
  }
}