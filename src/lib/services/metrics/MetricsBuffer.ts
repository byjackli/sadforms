/**
 * Batching and buffering system for metrics
 */

import type { MetricEvent, BufferConfig, MetricsProvider } from './types';

export class MetricsBuffer {
  private buffer: MetricEvent[] = [];
  private timer: NodeJS.Timeout | null = null;
  private providers: MetricsProvider[] = [];

  constructor(private config: BufferConfig) {}

  setProviders(providers: MetricsProvider[]): void {
    this.providers = providers;
  }

  add(event: MetricEvent): void {
    this.buffer.push(event);
    
    if (this.buffer.length >= this.config.maxSize) {
      this.flush();
    } else if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), this.config.flushInterval);
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;
    
    const events = this.buffer.splice(0);
    this.clearTimer();
    
    // Send to all providers in parallel
    const promises = this.providers.map(provider => 
      provider.trackBatch(events).catch(error => {
        console.warn(`Failed to send metrics to provider ${provider.name}:`, error);
      })
    );
    
    await Promise.allSettled(promises);
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  async close(): Promise<void> {
    this.clearTimer();
    await this.flush();
  }
}