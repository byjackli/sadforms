/**
 * Example usage of the MetricsService
 */

import { MetricsService, ConsoleProvider } from '../src/lib/services/metrics';
import type { MetricsConfig } from '../src/lib/services/metrics';

// Basic development configuration
const developmentConfig: MetricsConfig = {
  enabled: true,
  samplingRate: 0.1, // Sample 10% of events
  bufferConfig: {
    maxSize: 100,
    flushInterval: 5000,
    maxRetries: 1
  },
  globalTags: {
    environment: 'development',
    version: '1.0.0'
  },
  eventFilters: [],
  providers: [
    { name: 'console', config: {} }
  ]
};

// Production configuration example
const productionConfig: MetricsConfig = {
  enabled: true,
  samplingRate: 1.0,
  bufferConfig: {
    maxSize: 5000,
    flushInterval: 30000,
    maxRetries: 3
  },
  globalTags: {
    environment: 'production',
    version: '1.0.0'
  },
  eventFilters: [
    {
      action: 'exclude',
      fieldPattern: /password|secret|token/i
    }
  ],
  providers: [
    { name: 'console', config: {} }
    // Would add CloudWatch, DataDog, etc. here
  ]
};

// Initialize metrics service
const metricsService = new MetricsService(developmentConfig);

async function setupMetrics() {
  // Add providers
  await metricsService.addProvider(new ConsoleProvider());
  
  // Start collecting metrics (sets up store subscriptions)
  await metricsService.start();
  
  console.log('Metrics service started');
}

// Example custom metrics
async function trackCustomMetrics() {
  // Track custom business metrics
  await metricsService.trackCounter('form.conversions', 1, {
    formType: 'registration',
    source: 'landing-page'
  });
  
  // Track performance metrics
  await metricsService.trackTiming('form.render_time', 150, {
    formId: 'user-signup',
    fieldCount: '12'
  });
  
  // Track gauge metrics
  await metricsService.trackGauge('form.active_users', 45, {
    formId: 'contact-form'
  });
}

// Cleanup
async function cleanup() {
  await metricsService.stop();
  console.log('Metrics service stopped');
}

// Usage
setupMetrics()
  .then(() => trackCustomMetrics())
  .then(() => {
    // Simulate some delay
    setTimeout(cleanup, 10000);
  })
  .catch(console.error);

export { metricsService };