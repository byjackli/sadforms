/**
 * Core types for the metrics service
 */

export interface MetricEvent {
  name: string;
  type: 'counter' | 'timing' | 'gauge' | 'event';
  value: number;
  timestamp: number;
  tags: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface TimingMetric extends Omit<MetricEvent, 'type'> {
  type: 'timing';
  duration: number;
  unit: 'ms' | 'seconds';
}

export interface CounterMetric extends Omit<MetricEvent, 'type'> {
  type: 'counter';
  increment: number;
}

export interface GaugeMetric extends Omit<MetricEvent, 'type'> {
  type: 'gauge';
  value: number;
}

export interface ProviderConfig {
  endpoint?: string;
  apiKey?: string;
  region?: string;
  batchSize?: number;
  flushInterval?: number;
  retryAttempts?: number;
  retryDelay?: number;
  eventFilters?: EventFilter[];
  [key: string]: any;
}

export interface EventFilter {
  eventType?: string;
  fieldPattern?: RegExp;
  formPattern?: RegExp;
  action: 'include' | 'exclude';
}

export interface MetricsProvider {
  readonly name: string;
  initialize(config: ProviderConfig): Promise<void>;
  trackEvent(event: MetricEvent): Promise<void>;
  trackTiming(metric: TimingMetric): Promise<void>;
  trackCounter(metric: CounterMetric): Promise<void>;
  trackGauge(metric: GaugeMetric): Promise<void>;
  trackBatch(events: MetricEvent[]): Promise<void>;
  flush(): Promise<void>;
  close(): Promise<void>;
  isHealthy(): Promise<boolean>;
}

export interface MetricsConfig {
  enabled: boolean;
  bufferConfig: {
    maxSize: number;
    flushInterval: number;
    maxRetries: number;
  };
  globalTags: Record<string, string>;
  eventFilters: EventFilter[];
  providers: ProviderConfiguration[];
  samplingRate: number;
}

export interface ProviderConfiguration {
  name: string;
  config: ProviderConfig;
}

export interface BufferConfig {
  maxSize: number;
  flushInterval: number;
  maxRetries: number;
}