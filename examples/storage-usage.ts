/**
 * Example usage of the simplified StorageService
 */

import { initializeStorage, saveForm, getForm, scheduleAutoSave, addSecondaryProvider, removeSecondaryProvider, getProviderNames, healthCheck } from '../src/lib/services/storageService';
import { LocalStorageProvider } from '../src/lib/services/providers/LocalStorageProvider';
import { CloudProvider } from '../src/lib/services/providers/CloudProvider';

// Setup with multiple cloud providers
const localStorage = new LocalStorageProvider();
const awsProvider = new CloudProvider('aws-s3', {
  apiEndpoint: 'https://your-aws-api.com',
  apiKey: 'your-aws-key',
  timeout: 3000
});

const firebaseProvider = new CloudProvider('firebase', {
  apiEndpoint: 'https://your-firebase-api.com',
  apiKey: 'your-firebase-key'
});

const customProvider = new CloudProvider('custom-backend', {
  apiEndpoint: 'https://your-custom-api.com',
  apiKey: 'your-custom-key'
});

// Initialize with primary + multiple secondary providers
await initializeStorage(localStorage, [awsProvider, firebaseProvider, customProvider]);

// Usage examples
async function examples() {
  // Save form data (uses FormMetaStore config for saveToLocal/saveToCloud)
  await saveForm('user-registration', {
    email: 'user@example.com',
    name: 'John Doe',
    preferences: { theme: 'dark' }
  });

  // Load form data (tries localStorage first, then cloud providers)
  const formData = await getForm('user-registration');
  if (formData) {
    console.log('Loaded form:', formData.fieldValues);
  }

  // Auto-save with debouncing
  const updatedFormData = { email: 'updated@example.com', name: 'Jane Doe' };
  scheduleAutoSave('user-registration', updatedFormData);

  // Handle sensitive data (skips all persistence)
  await saveForm('payment-form', {
    creditCard: '****-****-****-1234',
    cvv: '***'
  }, { sensitive: true });

  // Dynamic provider management
  const newProvider = new CloudProvider('dropbox', {
    apiEndpoint: 'https://dropbox-api.com',
    apiKey: 'dropbox-key'
  });
  
  addSecondaryProvider(newProvider);
  removeSecondaryProvider('firebase');

  // Health check
  const health = await healthCheck();
  console.log('Provider health:', health);
  // Output: { localStorage: true, aws-s3: true, firebase: false, custom-backend: true }

  // Get all provider names
  console.log('Active providers:', getProviderNames());
  // Output: ['localStorage', 'aws-s3', 'firebase', 'custom-backend']
}

// Form configuration examples (set in FormMetaStore)
// saveToLocal=true, saveToCloud=false → saves to localStorage only
// saveToLocal=true, saveToCloud=true → saves to localStorage + all cloud providers
// saveToLocal=false, saveToCloud=true → saves to cloud providers only
// saveToLocal=false, saveToCloud=false → no persistence (stores handle memory)