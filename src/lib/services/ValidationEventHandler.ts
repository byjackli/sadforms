/**
 * Event-driven validation handler
 * Listens to field events and triggers validation as needed
 */

import { getValidationResult } from '../store/FormValidationStore';
import { getConfigValue } from '../store/FormConfigStore';
import { checkValidity } from './validationService';
import { FormProps } from '$lib/constants';
import EventBus, { EVENT_TYPES, type FormEvent } from './EventBus';

export class ValidationEventHandler {
    private eventBus: EventBus;
    private unsubscribeCallbacks: (() => void)[] = [];

    constructor() {
        this.eventBus = EventBus.getInstance();
        this.setupEventListeners();
    }

    /**
     * Setup event listeners for validation triggers
     */
    private setupEventListeners(): void {
        // Listen to field input events
        const unsubscribeInput = this.eventBus.on(EVENT_TYPES.FIELD_INPUT, (event) => {
            this.handleFieldValidation(event);
        });

        // Listen to field focus events
        const unsubscribeFocus = this.eventBus.on(EVENT_TYPES.FIELD_FOCUS, (event) => {
            this.handleFieldValidation(event);
        });

        // Listen to field blur events (optional - can validate on blur too)
        const unsubscribeBlur = this.eventBus.on(EVENT_TYPES.FIELD_BLUR, (event) => {
            // Only validate on blur if field has been touched and has validation rules
            this.handleFieldValidation(event);
        });

        // Store unsubscribe callbacks for cleanup
        this.unsubscribeCallbacks.push(unsubscribeInput, unsubscribeFocus, unsubscribeBlur);
    }

    /**
     * Handle field validation based on event
     */
    private async handleFieldValidation(event: FormEvent): Promise<void> {
        const { formId, fieldId, groupId } = event;
        
        if (!fieldId) return;

        // Check if field has validation rules
        const hasCustomValidation = getValidationResult(formId, FormProps.VALIDITY, fieldId, groupId);
        const isRequired = getConfigValue(formId, FormProps.REQUIRED, fieldId, groupId);

        if (hasCustomValidation || isRequired) {
            try {
                const result = await checkValidity(formId, "field", fieldId, groupId);
                
                // Emit validation completed event
                this.eventBus.emit({
                    type: EVENT_TYPES.VALIDATION_COMPLETED,
                    formId,
                    fieldId,
                    groupId,
                    data: { result },
                    timestamp: Date.now()
                });

                // Emit validation failed event if needed
                if (!result.verdict) {
                    this.eventBus.emit({
                        type: EVENT_TYPES.VALIDATION_FAILED,
                        formId,
                        fieldId,
                        groupId,
                        data: { result },
                        timestamp: Date.now()
                    });
                }
            } catch (error) {
                console.error('Validation error:', error);
                
                // Emit validation failed event for errors
                this.eventBus.emit({
                    type: EVENT_TYPES.VALIDATION_FAILED,
                    formId,
                    fieldId,
                    groupId,
                    data: { error },
                    timestamp: Date.now()
                });
            }
        }
    }

    /**
     * Cleanup event listeners
     */
    destroy(): void {
        this.unsubscribeCallbacks.forEach(unsubscribe => unsubscribe());
        this.unsubscribeCallbacks = [];
    }

    /**
     * Get validation statistics
     */
    getStats(): {
        listenersCount: number;
        eventTypes: string[];
    } {
        return {
            listenersCount: this.eventBus.getListenerCount(EVENT_TYPES.FIELD_INPUT) +
                          this.eventBus.getListenerCount(EVENT_TYPES.FIELD_FOCUS) +
                          this.eventBus.getListenerCount(EVENT_TYPES.FIELD_BLUR),
            eventTypes: this.eventBus.getEventTypes()
        };
    }
}

// Create singleton instance
let validationEventHandler: ValidationEventHandler | null = null;

/**
 * Initialize the validation event handler (call once during app startup)
 */
export function initializeValidationEventHandler(): ValidationEventHandler {
    if (!validationEventHandler) {
        validationEventHandler = new ValidationEventHandler();
    }
    return validationEventHandler;
}

/**
 * Get the current validation event handler instance
 */
export function getValidationEventHandler(): ValidationEventHandler | null {
    return validationEventHandler;
}

/**
 * Cleanup the validation event handler
 */
export function destroyValidationEventHandler(): void {
    if (validationEventHandler) {
        validationEventHandler.destroy();
        validationEventHandler = null;
    }
}

export default ValidationEventHandler;