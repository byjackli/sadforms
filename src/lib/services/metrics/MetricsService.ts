/**
 * Main metrics service orchestrator
 */

import { MetricsBuffer } from './MetricsBuffer';
import { StoreObserver } from './StoreObserver';
import type { 
  MetricsProvider, 
  MetricEvent, 
  TimingMetric, 
  CounterMetric, 
  GaugeMetric, 
  MetricsConfig 
} from './types';

export class MetricsService {
  private providers: Map<string, MetricsProvider> = new Map();
  private buffer: MetricsBuffer;
  private storeObserver: StoreObserver;
  private config: MetricsConfig;

  constructor(config: MetricsConfig) {
    this.config = config;
    this.buffer = new MetricsBuffer(config.bufferConfig);
    this.storeObserver = new StoreObserver((event) => this.handleMetricEvent(event));
  }

  async addProvider(provider: MetricsProvider): Promise<void> {
    const providerConfig = this.config.providers.find(p => p.name === provider.name);
    if (providerConfig) {
      await provider.initialize(providerConfig.config);
    }
    
    this.providers.set(provider.name, provider);
    this.buffer.setProviders(Array.from(this.providers.values()));
  }

  async removeProvider(name: string): Promise<void> {
    const provider = this.providers.get(name);
    if (provider) {
      await provider.close();
      this.providers.delete(name);
      this.buffer.setProviders(Array.from(this.providers.values()));
    }
  }

  async track(event: MetricEvent): Promise<void> {
    if (!this.shouldTrack(event)) {
      return;
    }

    // Add global tags
    const enhancedEvent = {
      ...event,
      tags: { ...this.config.globalTags, ...event.tags }
    };

    this.buffer.add(enhancedEvent);
  }

  async trackTiming(name: string, duration: number, tags: Record<string, string> = {}): Promise<void> {
    const metric: TimingMetric = {
      name,
      type: 'timing',
      duration,
      unit: 'ms',
      value: duration,
      timestamp: Date.now(),
      tags
    };

    await this.track(metric);
  }

  async trackCounter(name: string, increment: number = 1, tags: Record<string, string> = {}): Promise<void> {
    const metric: CounterMetric = {
      name,
      type: 'counter',
      increment,
      value: increment,
      timestamp: Date.now(),
      tags
    };

    await this.track(metric);
  }

  async trackGauge(name: string, value: number, tags: Record<string, string> = {}): Promise<void> {
    const metric: GaugeMetric = {
      name,
      type: 'gauge',
      value,
      timestamp: Date.now(),
      tags
    };

    await this.track(metric);
  }

  async start(): Promise<void> {
    if (this.config.enabled) {
      this.storeObserver.setupStoreSubscriptions();
    }
  }

  async stop(): Promise<void> {
    this.storeObserver.destroy();
    await this.buffer.close();
    
    // Close all providers
    for (const provider of this.providers.values()) {
      await provider.close();
    }
  }

  async flush(): Promise<void> {
    await this.buffer.flush();
  }

  private handleMetricEvent(event: MetricEvent): void {
    this.track(event).catch(error => {
      console.warn('Failed to track metric event:', error);
    });
  }

  private shouldTrack(event: MetricEvent): boolean {
    if (!this.config.enabled) {
      return false;
    }

    if (!this.shouldSample()) {
      return false;
    }

    return this.shouldInclude(event);
  }

  private shouldSample(): boolean {
    return Math.random() < this.config.samplingRate;
  }

  private shouldInclude(event: MetricEvent): boolean {
    return this.config.eventFilters.every(filter => {
      const matches = this.matchesFilter(event, filter);
      
      if (filter.action === 'exclude') {
        return !matches;
      } else {
        return matches;
      }
    });
  }

  private matchesFilter(event: MetricEvent, filter: any): boolean {
    if (filter.eventType && event.type !== filter.eventType) {
      return false;
    }

    if (filter.fieldPattern && event.tags.fieldId) {
      if (!filter.fieldPattern.test(event.tags.fieldId)) {
        return false;
      }
    }

    if (filter.formPattern && event.tags.formId) {
      if (!filter.formPattern.test(event.tags.formId)) {
        return false;
      }
    }

    return true;
  }
}