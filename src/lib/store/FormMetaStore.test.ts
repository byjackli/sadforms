import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import FormMetaStore, {
    setTouched,
    setActive,
    setSubmitState,
    getMetaValue,
    clearMetaValue,
    hasMetaValue,
    initMetaStore,
    clearMetaStore
} from './FormMetaStore';
import { FormProps } from '../constants';

describe('FormMetaStore', () => {
    const formId = 'test-form';
    const fieldId = 'test-field';
    const groupId = 'test-group';

    beforeEach(() => {
        // Clear all meta data before each test
        clearMetaStore(formId);
    });

    describe('Store initialization', () => {
        it('should initialize with empty data', () => {
            const store = get(FormMetaStore);
            expect(store).toEqual({});
        });

        it('should initialize meta store for a form', () => {
            initMetaStore(formId);
            const store = get(FormMetaStore);
            expect(store[formId]).toBeDefined();
            expect(store[formId].touched).toEqual({});
            expect(store[formId].active).toEqual({});
            expect(store[formId].submit).toEqual({
                submitting: false,
                accepted: false,
                attempted: false
            });
        });
    });

    describe('setTouched', () => {
        beforeEach(() => {
            initMetaStore(formId);
        });

        it('should set touched state without group', () => {
            setTouched(formId, true, fieldId);
            
            const store = get(FormMetaStore);
            expect(store[formId].touched[fieldId]).toBe(true);
        });

        it('should set touched state with group', () => {
            setTouched(formId, true, fieldId, groupId);
            
            const store = get(FormMetaStore);
            expect(store[formId].touched[groupId][fieldId]).toBe(true);
        });

        it('should create group if it does not exist', () => {
            setTouched(formId, true, fieldId, groupId);
            
            const store = get(FormMetaStore);
            expect(store[formId].touched[groupId]).toBeDefined();
            expect(store[formId].touched[groupId][fieldId]).toBe(true);
        });

        it('should set touched to false', () => {
            setTouched(formId, false, fieldId);
            
            const store = get(FormMetaStore);
            expect(store[formId].touched[fieldId]).toBe(false);
        });

        it('should update existing touched state', () => {
            setTouched(formId, true, fieldId);
            setTouched(formId, false, fieldId);
            
            const store = get(FormMetaStore);
            expect(store[formId].touched[fieldId]).toBe(false);
        });

        it('should trigger store updates', () => {
            const mockUpdate = vi.fn();
            const unsubscribe = FormMetaStore.subscribe(mockUpdate);
            
            setTouched(formId, true, fieldId);
            
            expect(mockUpdate).toHaveBeenCalled();
            unsubscribe();
        });

        it('should handle multiple fields in same group', () => {
            setTouched(formId, true, 'field1', groupId);
            setTouched(formId, false, 'field2', groupId);
            
            const store = get(FormMetaStore);
            expect(store[formId].touched[groupId]['field1']).toBe(true);
            expect(store[formId].touched[groupId]['field2']).toBe(false);
        });
    });

    describe('setActive', () => {
        beforeEach(() => {
            initMetaStore(formId);
        });

        it('should set active state without group', () => {
            setActive(formId, true, fieldId);
            
            const store = get(FormMetaStore);
            expect(store[formId].active[fieldId]).toBe(true);
        });

        it('should set active state with group', () => {
            setActive(formId, true, fieldId, groupId);
            
            const store = get(FormMetaStore);
            expect(store[formId].active[groupId][fieldId]).toBe(true);
        });

        it('should create group if it does not exist', () => {
            setActive(formId, true, fieldId, groupId);
            
            const store = get(FormMetaStore);
            expect(store[formId].active[groupId]).toBeDefined();
            expect(store[formId].active[groupId][fieldId]).toBe(true);
        });

        it('should set active to false', () => {
            setActive(formId, false, fieldId);
            
            const store = get(FormMetaStore);
            expect(store[formId].active[fieldId]).toBe(false);
        });

        it('should update existing active state', () => {
            setActive(formId, true, fieldId);
            setActive(formId, false, fieldId);
            
            const store = get(FormMetaStore);
            expect(store[formId].active[fieldId]).toBe(false);
        });

        it('should trigger store updates', () => {
            const mockUpdate = vi.fn();
            const unsubscribe = FormMetaStore.subscribe(mockUpdate);
            
            setActive(formId, true, fieldId);
            
            expect(mockUpdate).toHaveBeenCalled();
            unsubscribe();
        });

        it('should handle multiple fields with different active states', () => {
            setActive(formId, true, 'field1');
            setActive(formId, false, 'field2');
            
            const store = get(FormMetaStore);
            expect(store[formId].active['field1']).toBe(true);
            expect(store[formId].active['field2']).toBe(false);
        });
    });

    describe('setSubmitState', () => {
        beforeEach(() => {
            initMetaStore(formId);
        });

        it('should set submitting state', () => {
            setSubmitState(formId, true, 'submitting');
            
            const store = get(FormMetaStore);
            expect(store[formId].submit.submitting).toBe(true);
        });

        it('should set accepted state', () => {
            setSubmitState(formId, true, 'accepted');
            
            const store = get(FormMetaStore);
            expect(store[formId].submit.accepted).toBe(true);
        });

        it('should set attempted state', () => {
            setSubmitState(formId, true, 'attempted');
            
            const store = get(FormMetaStore);
            expect(store[formId].submit.attempted).toBe(true);
        });

        it('should update existing submit state', () => {
            setSubmitState(formId, true, 'submitting');
            setSubmitState(formId, false, 'submitting');
            
            const store = get(FormMetaStore);
            expect(store[formId].submit.submitting).toBe(false);
        });

        it('should trigger store updates', () => {
            const mockUpdate = vi.fn();
            const unsubscribe = FormMetaStore.subscribe(mockUpdate);
            
            setSubmitState(formId, true, 'submitting');
            
            expect(mockUpdate).toHaveBeenCalled();
            unsubscribe();
        });

        it('should handle all submit states independently', () => {
            setSubmitState(formId, true, 'submitting');
            setSubmitState(formId, true, 'accepted');
            setSubmitState(formId, false, 'attempted');
            
            const store = get(FormMetaStore);
            expect(store[formId].submit.submitting).toBe(true);
            expect(store[formId].submit.accepted).toBe(true);
            expect(store[formId].submit.attempted).toBe(false);
        });
    });

    describe('getMetaValue', () => {
        beforeEach(() => {
            initMetaStore(formId);
            setTouched(formId, true, fieldId);
            setTouched(formId, false, 'group-field', groupId);
            setActive(formId, true, fieldId);
            setActive(formId, false, 'group-field', groupId);
            setSubmitState(formId, true, 'submitting');
            setSubmitState(formId, true, 'accepted');
        });

        it('should get touched value without group', () => {
            const value = getMetaValue(formId, FormProps.TOUCHED, fieldId);
            expect(value).toBe(true);
        });

        it('should get touched value with group', () => {
            const value = getMetaValue(formId, FormProps.TOUCHED, 'group-field', groupId);
            expect(value).toBe(false);
        });

        it('should get active value without group', () => {
            const value = getMetaValue(formId, FormProps.ACTIVE, fieldId);
            expect(value).toBe(true);
        });

        it('should get active value with group', () => {
            const value = getMetaValue(formId, FormProps.ACTIVE, 'group-field', groupId);
            expect(value).toBe(false);
        });

        it('should get entire submit state when no property specified', () => {
            const value = getMetaValue(formId, FormProps.SUBMIT);
            expect(value).toEqual({
                submitting: true,
                accepted: true,
                attempted: false
            });
        });

        it('should get specific submit property', () => {
            const submitting = getMetaValue(formId, FormProps.SUBMIT, 'submitting');
            const accepted = getMetaValue(formId, FormProps.SUBMIT, 'accepted');
            const attempted = getMetaValue(formId, FormProps.SUBMIT, 'attempted');
            
            expect(submitting).toBe(true);
            expect(accepted).toBe(true);
            expect(attempted).toBe(false);
        });

        it('should return undefined for non-existent field', () => {
            const value = getMetaValue(formId, FormProps.TOUCHED, 'non-existent');
            expect(value).toBeUndefined();
        });

        it('should return undefined for non-existent group', () => {
            const value = getMetaValue(formId, FormProps.TOUCHED, fieldId, 'non-existent-group');
            expect(value).toBeUndefined();
        });

        it('should return all touched values when no fieldId provided', () => {
            const values = getMetaValue(formId, FormProps.TOUCHED);
            expect(values).toBeDefined();
            expect(values[fieldId]).toBe(true);
        });

        it('should return all active values when no fieldId provided', () => {
            const values = getMetaValue(formId, FormProps.ACTIVE);
            expect(values).toBeDefined();
            expect(values[fieldId]).toBe(true);
        });
    });

    describe('hasMetaValue', () => {
        beforeEach(() => {
            initMetaStore(formId);
            setTouched(formId, true, fieldId);
            setTouched(formId, false, 'group-field', groupId);
            setActive(formId, true, fieldId);
            setActive(formId, false, 'group-field', groupId);
        });

        it('should return true for existing touched value without group', () => {
            const exists = hasMetaValue(formId, FormProps.TOUCHED, fieldId);
            expect(exists).toBe(true);
        });

        it('should return true for existing touched value with group', () => {
            const exists = hasMetaValue(formId, FormProps.TOUCHED, 'group-field', groupId);
            expect(exists).toBe(true);
        });

        it('should return true for existing active value without group', () => {
            const exists = hasMetaValue(formId, FormProps.ACTIVE, fieldId);
            expect(exists).toBe(true);
        });

        it('should return true for existing active value with group', () => {
            const exists = hasMetaValue(formId, FormProps.ACTIVE, 'group-field', groupId);
            expect(exists).toBe(true);
        });

        it('should return false for non-existent touched value', () => {
            const exists = hasMetaValue(formId, FormProps.TOUCHED, 'non-existent');
            expect(exists).toBe(false);
        });

        it('should return false for non-existent group', () => {
            const exists = hasMetaValue(formId, FormProps.TOUCHED, fieldId, 'non-existent-group');
            expect(exists).toBe(false);
        });

        it('should return false for non-existent active value', () => {
            const exists = hasMetaValue(formId, FormProps.ACTIVE, 'non-existent');
            expect(exists).toBe(false);
        });

        it('should return true even for false values', () => {
            setTouched(formId, false, 'false-field');
            const exists = hasMetaValue(formId, FormProps.TOUCHED, 'false-field');
            expect(exists).toBe(true);
        });
    });

    describe('clearMetaValue', () => {
        beforeEach(() => {
            initMetaStore(formId);
            setTouched(formId, true, fieldId);
            setTouched(formId, false, 'group-field', groupId);
            setActive(formId, true, fieldId);
            setActive(formId, false, 'group-field', groupId);
        });

        it('should clear touched value without group', () => {
            clearMetaValue(formId, FormProps.TOUCHED, fieldId);
            
            const exists = hasMetaValue(formId, FormProps.TOUCHED, fieldId);
            expect(exists).toBe(false);
        });

        it('should clear touched value with group', () => {
            clearMetaValue(formId, FormProps.TOUCHED, 'group-field', groupId);
            
            const exists = hasMetaValue(formId, FormProps.TOUCHED, 'group-field', groupId);
            expect(exists).toBe(false);
        });

        it('should clear active value without group', () => {
            clearMetaValue(formId, FormProps.ACTIVE, fieldId);
            
            const exists = hasMetaValue(formId, FormProps.ACTIVE, fieldId);
            expect(exists).toBe(false);
        });

        it('should clear active value with group', () => {
            clearMetaValue(formId, FormProps.ACTIVE, 'group-field', groupId);
            
            const exists = hasMetaValue(formId, FormProps.ACTIVE, 'group-field', groupId);
            expect(exists).toBe(false);
        });

        it('should not affect other fields when clearing', () => {
            clearMetaValue(formId, FormProps.TOUCHED, fieldId);
            
            const groupValue = getMetaValue(formId, FormProps.TOUCHED, 'group-field', groupId);
            expect(groupValue).toBe(false);
        });

        it('should trigger store updates', () => {
            const mockUpdate = vi.fn();
            const unsubscribe = FormMetaStore.subscribe(mockUpdate);
            
            clearMetaValue(formId, FormProps.TOUCHED, fieldId);
            
            expect(mockUpdate).toHaveBeenCalled();
            unsubscribe();
        });

        it('should handle clearing non-existent group gracefully', () => {
            expect(() => {
                clearMetaValue(formId, FormProps.TOUCHED, fieldId, 'non-existent-group');
            }).not.toThrow();
        });

        it('should handle clearing non-existent field gracefully', () => {
            expect(() => {
                clearMetaValue(formId, FormProps.TOUCHED, 'non-existent');
            }).not.toThrow();
        });
    });

    describe('clearMetaStore', () => {
        beforeEach(() => {
            initMetaStore(formId);
            setTouched(formId, true, fieldId);
            setActive(formId, true, fieldId);
            setSubmitState(formId, true, 'submitting');
        });

        it('should clear all meta data for a form', () => {
            clearMetaStore(formId);
            
            const store = get(FormMetaStore);
            expect(store[formId]).toBeUndefined();
        });

        it('should not affect other forms', () => {
            const otherFormId = 'other-form';
            initMetaStore(otherFormId);
            setTouched(otherFormId, true, 'other-field');
            
            clearMetaStore(formId);
            
            const store = get(FormMetaStore);
            expect(store[formId]).toBeUndefined();
            expect(store[otherFormId]).toBeDefined();
            expect(store[otherFormId].touched['other-field']).toBe(true);
        });
    });

    describe('Error handling', () => {
        it('should throw error for invalid prop', () => {
            initMetaStore(formId);
            
            expect(() => {
                getMetaValue(formId, 'INVALID_PROP' as any, fieldId);
            }).toThrow();
        });

        it('should auto-initialize meta data when accessing non-existent form', () => {
            const value = getMetaValue('new-form', FormProps.TOUCHED, 'some-field');
            expect(value).toBeUndefined();
            
            // Verify that accessing the form auto-initializes it
            const hasValue = hasMetaValue('new-form', FormProps.TOUCHED, 'some-field');
            expect(hasValue).toBe(false);
            
            const store = get(FormMetaStore);
            expect(store['new-form']).toBeDefined();
        });
    });

    describe('Complex scenarios', () => {
        beforeEach(() => {
            initMetaStore(formId);
        });

        it('should handle multiple fields in multiple groups', () => {
            setTouched(formId, true, 'field1', 'group1');
            setTouched(formId, false, 'field2', 'group1');
            setTouched(formId, true, 'field1', 'group2');
            setActive(formId, false, 'field1', 'group1');
            
            expect(getMetaValue(formId, FormProps.TOUCHED, 'field1', 'group1')).toBe(true);
            expect(getMetaValue(formId, FormProps.TOUCHED, 'field2', 'group1')).toBe(false);
            expect(getMetaValue(formId, FormProps.TOUCHED, 'field1', 'group2')).toBe(true);
            expect(getMetaValue(formId, FormProps.ACTIVE, 'field1', 'group1')).toBe(false);
        });

        it('should handle form submission workflow', () => {
            // Initial state
            expect(getMetaValue(formId, FormProps.SUBMIT)).toEqual({
                submitting: false,
                accepted: false,
                attempted: false
            });
            
            // Mark as attempted and submitting
            setSubmitState(formId, true, 'attempted');
            setSubmitState(formId, true, 'submitting');
            
            expect(getMetaValue(formId, FormProps.SUBMIT, 'attempted')).toBe(true);
            expect(getMetaValue(formId, FormProps.SUBMIT, 'submitting')).toBe(true);
            expect(getMetaValue(formId, FormProps.SUBMIT, 'accepted')).toBe(false);
            
            // Mark as accepted and stop submitting
            setSubmitState(formId, false, 'submitting');
            setSubmitState(formId, true, 'accepted');
            
            expect(getMetaValue(formId, FormProps.SUBMIT)).toEqual({
                submitting: false,
                accepted: true,
                attempted: true
            });
        });

        it('should maintain separate state for grouped and non-grouped fields with same ID', () => {
            setTouched(formId, true, fieldId); // Non-grouped
            setTouched(formId, false, fieldId, groupId); // Grouped
            
            expect(getMetaValue(formId, FormProps.TOUCHED, fieldId)).toBe(true);
            expect(getMetaValue(formId, FormProps.TOUCHED, fieldId, groupId)).toBe(false);
        });
    });

    describe('Store reactivity', () => {
        beforeEach(() => {
            initMetaStore(formId);
        });

        it('should trigger reactive updates when touched state changes', () => {
            let storeValue: any;
            const unsubscribe = FormMetaStore.subscribe(value => {
                storeValue = value;
            });
            
            setTouched(formId, true, fieldId);
            
            expect(storeValue[formId].touched[fieldId]).toBe(true);
            unsubscribe();
        });

        it('should trigger reactive updates when active state changes', () => {
            let storeValue: any;
            const unsubscribe = FormMetaStore.subscribe(value => {
                storeValue = value;
            });
            
            setActive(formId, true, fieldId);
            
            expect(storeValue[formId].active[fieldId]).toBe(true);
            unsubscribe();
        });

        it('should trigger reactive updates when submit state changes', () => {
            let storeValue: any;
            const unsubscribe = FormMetaStore.subscribe(value => {
                storeValue = value;
            });
            
            setSubmitState(formId, true, 'submitting');
            
            expect(storeValue[formId].submit.submitting).toBe(true);
            unsubscribe();
        });

        it('should trigger reactive updates when clearing meta data', () => {
            setTouched(formId, true, fieldId);
            
            let updateCount = 0;
            const unsubscribe = FormMetaStore.subscribe(() => {
                updateCount++;
            });
            
            clearMetaValue(formId, FormProps.TOUCHED, fieldId);
            
            expect(updateCount).toBeGreaterThan(0);
            unsubscribe();
        });
    });
});