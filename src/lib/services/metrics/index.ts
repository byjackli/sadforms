/**
 * Main exports for metrics service
 */

export { MetricsService } from './MetricsService';
export { ConsoleProvider } from './providers/ConsoleProvider';
export { MetricsBuffer } from './MetricsBuffer';
export { StoreObserver } from './StoreObserver';

export type {
  MetricEvent,
  TimingMetric,
  CounterMetric,
  GaugeMetric,
  MetricsProvider,
  MetricsConfig,
  ProviderConfig,
  EventFilter,
  ProviderConfiguration,
  BufferConfig
} from './types';