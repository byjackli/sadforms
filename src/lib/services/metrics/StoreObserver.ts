/**
 * Store observer for reactive metrics collection
 */

import { FormFieldStore } from '../../store/FormFieldStore';
import { FormValidationStore } from '../../store/FormValidationStore';
import { FormMetaStore } from '../../store/FormMetaStore';
import type { MetricEvent } from './types';

export class StoreObserver {
  private unsubscribeFunctions: (() => void)[] = [];
  private previousFieldState: Record<string, any> = {};
  private previousValidationState: Record<string, any> = {};
  private previousMetaState: Record<string, any> = {};

  constructor(private onMetricEvent: (event: MetricEvent) => void) {}

  setupStoreSubscriptions(): void {
    // Subscribe to field value changes
    const fieldStoreUnsubscribe = FormFieldStore.subscribe((stores) => {
      this.handleFieldStoreChange(stores);
    });
    
    // Subscribe to validation result changes
    const validationStoreUnsubscribe = FormValidationStore.subscribe((stores) => {
      this.handleValidationStoreChange(stores);
    });
    
    // Subscribe to meta state changes (touch, focus, etc.)
    const metaStoreUnsubscribe = FormMetaStore.subscribe((stores) => {
      this.handleMetaStoreChange(stores);
    });
    
    this.unsubscribeFunctions.push(
      fieldStoreUnsubscribe,
      validationStoreUnsubscribe,
      metaStoreUnsubscribe
    );
  }

  private handleFieldStoreChange(stores: Record<string, any>): void {
    for (const [formId, formData] of Object.entries(stores)) {
      const prevFormData = this.previousFieldState[formId];
      
      if (prevFormData && formData.fieldValues) {
        // Detect field value changes
        for (const [fieldId, value] of Object.entries(formData.fieldValues)) {
          if (prevFormData.fieldValues?.[fieldId] !== value) {
            this.onMetricEvent({
              name: 'form.field.input',
              type: 'counter',
              value: 1,
              timestamp: Date.now(),
              tags: {
                formId,
                fieldId,
                inputLength: String(value).length.toString()
              }
            });
          }
        }
      }
    }
    
    this.previousFieldState = JSON.parse(JSON.stringify(stores));
  }

  private handleValidationStoreChange(stores: Record<string, any>): void {
    for (const [formId, formData] of Object.entries(stores)) {
      const prevFormData = this.previousValidationState[formId];
      
      if (prevFormData && formData.validationResults) {
        // Detect validation result changes
        for (const [fieldId, result] of Object.entries(formData.validationResults)) {
          const prevResult = prevFormData.validationResults?.[fieldId];
          
          if (prevResult !== result) {
            // Track validation performance
            this.onMetricEvent({
              name: 'form.validation.duration',
              type: 'timing',
              value: 0, // Would need to track actual duration
              timestamp: Date.now(),
              tags: {
                formId,
                fieldId,
                validationType: 'input',
                success: result ? 'true' : 'false'
              }
            });
            
            // Track validation failures
            if (!result) {
              this.onMetricEvent({
                name: 'form.validation.failures',
                type: 'counter',
                value: 1,
                timestamp: Date.now(),
                tags: {
                  formId,
                  fieldId,
                  errorType: 'validation_failed'
                }
              });
            }
          }
        }
      }
    }
    
    this.previousValidationState = JSON.parse(JSON.stringify(stores));
  }

  private handleMetaStoreChange(stores: Record<string, any>): void {
    for (const [formId, formData] of Object.entries(stores)) {
      const prevFormData = this.previousMetaState[formId];
      
      if (prevFormData && formData.touchedFields) {
        // Detect focus events
        for (const [fieldId, touched] of Object.entries(formData.touchedFields)) {
          if (!prevFormData.touchedFields?.[fieldId] && touched) {
            this.onMetricEvent({
              name: 'form.field.focus',
              type: 'event',
              value: 1,
              timestamp: Date.now(),
              tags: {
                formId,
                fieldId
              }
            });
          }
        }
      }
      
      // Track active state changes for focus duration
      if (prevFormData && formData.activeFields) {
        for (const [fieldId, active] of Object.entries(formData.activeFields)) {
          const wasActive = prevFormData.activeFields?.[fieldId];
          
          if (wasActive && !active) {
            // Field lost focus - could calculate duration here
            this.onMetricEvent({
              name: 'form.field.focus_duration',
              type: 'timing',
              value: 0, // Would need to track actual duration
              timestamp: Date.now(),
              tags: {
                formId,
                fieldId
              }
            });
          }
        }
      }
    }
    
    this.previousMetaState = JSON.parse(JSON.stringify(stores));
  }

  destroy(): void {
    this.unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    this.unsubscribeFunctions = [];
  }
}