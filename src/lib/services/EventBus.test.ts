import { describe, it, expect, vi, beforeEach } from 'vitest';
import EventBus, { createFormEvent, EVENT_TYPES } from './EventBus';

describe('EventBus', () => {
    let eventBus: EventBus;

    beforeEach(() => {
        eventBus = EventBus.getInstance();
        eventBus.clear(); // Clear all listeners before each test
    });

    describe('getInstance', () => {
        it('should return singleton instance', () => {
            const instance1 = EventBus.getInstance();
            const instance2 = EventBus.getInstance();
            expect(instance1).toBe(instance2);
        });
    });

    describe('on and emit', () => {
        it('should emit events to registered listeners', () => {
            const mockCallback = vi.fn();
            
            eventBus.on(EVENT_TYPES.FIELD_INPUT, mockCallback);
            
            const testEvent = createFormEvent(EVENT_TYPES.FIELD_INPUT, 'test-form', 'test-field');
            eventBus.emit(testEvent);
            
            expect(mockCallback).toHaveBeenCalledWith(testEvent);
        });

        it('should handle multiple listeners for same event', () => {
            const mockCallback1 = vi.fn();
            const mockCallback2 = vi.fn();
            
            eventBus.on(EVENT_TYPES.FIELD_INPUT, mockCallback1);
            eventBus.on(EVENT_TYPES.FIELD_INPUT, mockCallback2);
            
            const testEvent = createFormEvent(EVENT_TYPES.FIELD_INPUT, 'test-form');
            eventBus.emit(testEvent);
            
            expect(mockCallback1).toHaveBeenCalledWith(testEvent);
            expect(mockCallback2).toHaveBeenCalledWith(testEvent);
        });

        it('should return unsubscribe function', () => {
            const mockCallback = vi.fn();
            
            const unsubscribe = eventBus.on(EVENT_TYPES.FIELD_INPUT, mockCallback);
            unsubscribe();
            
            const testEvent = createFormEvent(EVENT_TYPES.FIELD_INPUT, 'test-form');
            eventBus.emit(testEvent);
            
            expect(mockCallback).not.toHaveBeenCalled();
        });
    });

    describe('once', () => {
        it('should execute callback only once', () => {
            const mockCallback = vi.fn();
            
            eventBus.once(EVENT_TYPES.FIELD_INPUT, mockCallback);
            
            const testEvent = createFormEvent(EVENT_TYPES.FIELD_INPUT, 'test-form');
            eventBus.emit(testEvent);
            eventBus.emit(testEvent); // Emit again
            
            expect(mockCallback).toHaveBeenCalledTimes(1);
        });
    });

    describe('error handling', () => {
        it('should catch errors in event handlers', () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const errorCallback = vi.fn(() => {
                throw new Error('Test error');
            });
            const normalCallback = vi.fn();
            
            eventBus.on(EVENT_TYPES.FIELD_INPUT, errorCallback);
            eventBus.on(EVENT_TYPES.FIELD_INPUT, normalCallback);
            
            const testEvent = createFormEvent(EVENT_TYPES.FIELD_INPUT, 'test-form');
            eventBus.emit(testEvent);
            
            expect(consoleErrorSpy).toHaveBeenCalled();
            expect(normalCallback).toHaveBeenCalled(); // Should still execute
            
            consoleErrorSpy.mockRestore();
        });

        it('should handle async callback errors', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const asyncErrorCallback = vi.fn(async () => {
                throw new Error('Async test error');
            });
            
            eventBus.on(EVENT_TYPES.FIELD_INPUT, asyncErrorCallback);
            
            const testEvent = createFormEvent(EVENT_TYPES.FIELD_INPUT, 'test-form');
            eventBus.emit(testEvent);
            
            // Wait a bit for async error to be caught
            await new Promise(resolve => setTimeout(resolve, 10));
            
            expect(consoleErrorSpy).toHaveBeenCalled();
            
            consoleErrorSpy.mockRestore();
        });
    });

    describe('utility methods', () => {
        it('should return event types', () => {
            eventBus.on(EVENT_TYPES.FIELD_INPUT, vi.fn());
            eventBus.on(EVENT_TYPES.FIELD_FOCUS, vi.fn());
            
            const eventTypes = eventBus.getEventTypes();
            expect(eventTypes).toContain(EVENT_TYPES.FIELD_INPUT);
            expect(eventTypes).toContain(EVENT_TYPES.FIELD_FOCUS);
        });

        it('should return listener count', () => {
            eventBus.on(EVENT_TYPES.FIELD_INPUT, vi.fn());
            eventBus.on(EVENT_TYPES.FIELD_INPUT, vi.fn());
            
            expect(eventBus.getListenerCount(EVENT_TYPES.FIELD_INPUT)).toBe(2);
            expect(eventBus.getListenerCount(EVENT_TYPES.FIELD_FOCUS)).toBe(0);
        });

        it('should clear all listeners', () => {
            eventBus.on(EVENT_TYPES.FIELD_INPUT, vi.fn());
            eventBus.on(EVENT_TYPES.FIELD_FOCUS, vi.fn());
            
            eventBus.clear();
            
            expect(eventBus.getEventTypes()).toHaveLength(0);
        });
    });
});

describe('createFormEvent', () => {
    it('should create form event with all properties', () => {
        const event = createFormEvent(EVENT_TYPES.FIELD_INPUT, 'form-1', 'field-1', 'group-1', { value: 'test' });
        
        expect(event.type).toBe(EVENT_TYPES.FIELD_INPUT);
        expect(event.formId).toBe('form-1');
        expect(event.fieldId).toBe('field-1');
        expect(event.groupId).toBe('group-1');
        expect(event.data).toEqual({ value: 'test' });
        expect(event.timestamp).toBeTypeOf('number');
        expect(event.timestamp).toBeGreaterThan(0);
    });

    it('should create event with optional parameters', () => {
        const event = createFormEvent(EVENT_TYPES.FORM_SUBMIT, 'form-1');
        
        expect(event.type).toBe(EVENT_TYPES.FORM_SUBMIT);
        expect(event.formId).toBe('form-1');
        expect(event.fieldId).toBeUndefined();
        expect(event.groupId).toBeUndefined();
        expect(event.data).toBeUndefined();
    });
});