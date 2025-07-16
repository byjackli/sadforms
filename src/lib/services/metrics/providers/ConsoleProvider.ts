/**
 * Console provider for development metrics
 */

import type { MetricsProvider, MetricEvent, TimingMetric, CounterMetric, GaugeMetric, ProviderConfig } from '../types';

export class ConsoleProvider implements MetricsProvider {
  readonly name = 'console';
  
  async initialize(_config: ProviderConfig): Promise<void> {
    // No initialization needed
  }
  
  async trackEvent(event: MetricEvent): Promise<void> {
    console.log(`[METRIC] ${event.type.toUpperCase()}: ${event.name}`, {
      value: event.value,
      tags: event.tags,
      timestamp: new Date(event.timestamp).toISOString()
    });
  }
  
  async trackTiming(metric: TimingMetric): Promise<void> {
    console.log(`[TIMING] ${metric.name}`, {
      duration: metric.duration,
      unit: metric.unit,
      tags: metric.tags,
      timestamp: new Date(metric.timestamp).toISOString()
    });
  }
  
  async trackCounter(metric: CounterMetric): Promise<void> {
    console.log(`[COUNTER] ${metric.name}`, {
      increment: metric.increment,
      tags: metric.tags,
      timestamp: new Date(metric.timestamp).toISOString()
    });
  }
  
  async trackGauge(metric: GaugeMetric): Promise<void> {
    console.log(`[GAUGE] ${metric.name}`, {
      value: metric.value,
      tags: metric.tags,
      timestamp: new Date(metric.timestamp).toISOString()
    });
  }
  
  async trackBatch(events: MetricEvent[]): Promise<void> {
    console.group(`[METRICS BATCH] ${events.length} events`);
    for (const event of events) {
      await this.trackEvent(event);
    }
    console.groupEnd();
  }
  
  async flush(): Promise<void> {
    // No buffering in console provider
  }
  
  async close(): Promise<void> {
    // No cleanup needed
  }
  
  async isHealthy(): Promise<boolean> {
    return true;
  }
}