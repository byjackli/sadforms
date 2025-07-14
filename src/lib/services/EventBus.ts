/**
 * Event-driven communication hub for form services
 * Reduces tight coupling between services by using events
 */

export interface FormEvent {
    type: string;
    formId: string;
    fieldId?: string;
    groupId?: string;
    data?: any;
    timestamp: number;
}

export type EventCallback = (event: FormEvent) => void | Promise<void>;

export class EventBus {
    private static instance: EventBus;
    private listeners = new Map<string, Array<EventCallback>>();

    static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    /**
     * Emit an event to all registered listeners
     */
    emit(event: FormEvent): void {
        const callbacks = this.listeners.get(event.type) || [];
        callbacks.forEach(callback => {
            try {
                const result = callback(event);
                // Handle async callbacks
                if (result instanceof Promise) {
                    result.catch(error => {
                        console.error(`Async error in event handler for ${event.type}:`, error);
                    });
                }
            } catch (error) {
                console.error(`Error in event handler for ${event.type}:`, error);
            }
        });
    }

    /**
     * Register an event listener
     * @returns Unsubscribe function
     */
    on(eventType: string, callback: EventCallback): () => void {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        this.listeners.get(eventType)!.push(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.listeners.get(eventType);
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        };
    }

    /**
     * Register a one-time event listener
     */
    once(eventType: string, callback: EventCallback): () => void {
        const wrappedCallback = (event: FormEvent) => {
            unsubscribe();
            callback(event);
        };
        
        const unsubscribe = this.on(eventType, wrappedCallback);
        return unsubscribe;
    }

    /**
     * Remove all listeners for an event type
     */
    off(eventType: string): void {
        this.listeners.delete(eventType);
    }

    /**
     * Remove all listeners
     */
    clear(): void {
        this.listeners.clear();
    }

    /**
     * Get list of registered event types
     */
    getEventTypes(): string[] {
        return Array.from(this.listeners.keys());
    }

    /**
     * Get number of listeners for an event type
     */
    getListenerCount(eventType: string): number {
        return this.listeners.get(eventType)?.length || 0;
    }
}

// Predefined event types for type safety
export const EVENT_TYPES = {
    FIELD_INPUT: 'field.input',
    FIELD_FOCUS: 'field.focus', 
    FIELD_BLUR: 'field.blur',
    VALIDATION_COMPLETED: 'validation.completed',
    VALIDATION_FAILED: 'validation.failed',
    FORM_SUBMIT: 'form.submit',
    FORM_SUBMIT_SUCCESS: 'form.submit.success',
    FORM_SUBMIT_FAILED: 'form.submit.failed',
    AUTO_SAVE: 'save.auto',
    SAVE_COMPLETED: 'save.completed',
    SAVE_FAILED: 'save.failed'
} as const;

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];

// Helper function to create form events with consistent structure
export function createFormEvent(
    type: EventType | string,
    formId: string,
    fieldId?: string,
    groupId?: string,
    data?: any
): FormEvent {
    return {
        type,
        formId,
        fieldId,
        groupId,
        data,
        timestamp: Date.now()
    };
}

export default EventBus;