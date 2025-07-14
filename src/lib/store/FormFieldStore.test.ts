import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import FormFieldStore, {
    setFieldValue,
    getFieldValue,
    hasFieldValue,
    clearFieldValue,
    initFieldStore,
    clearFieldStore
} from './FormFieldStore';
import { FormProps } from '../constants';

describe('FormFieldStore', () => {
    const formId = 'test-form';
    const fieldId = 'test-field';
    const groupId = 'test-group';
    const testValue = 'test-value';

    beforeEach(() => {
        // Clear all form data before each test
        clearFieldStore(formId);
    });

    describe('Store initialization', () => {
        it('should initialize with empty data', () => {
            const store = get(FormFieldStore);
            expect(store).toEqual({});
        });

        it('should initialize field store for a form', () => {
            initFieldStore(formId);
            const store = get(FormFieldStore);
            expect(store[formId]).toBeDefined();
            expect(store[formId].fieldValues).toEqual({});
            expect(store[formId].displayValues).toEqual({});
            expect(store[formId].dontSave).toEqual({});
        });
    });

    describe('setFieldValue', () => {
        beforeEach(() => {
            initFieldStore(formId);
        });

        it('should set field values without group', () => {
            const result = setFieldValue(formId, FormProps.FIELD_VALUES, testValue, fieldId);
            
            expect(result).toBe(testValue);
            const store = get(FormFieldStore);
            expect(store[formId].fieldValues[fieldId]).toBe(testValue);
        });

        it('should set field values with group', () => {
            const result = setFieldValue(formId, FormProps.FIELD_VALUES, testValue, fieldId, groupId);
            
            expect(result).toBe(testValue);
            const store = get(FormFieldStore);
            expect(store[formId].fieldValues[groupId][fieldId]).toBe(testValue);
        });

        it('should set display values without group', () => {
            setFieldValue(formId, FormProps.DISPLAY_VALUES, testValue, fieldId);
            
            const store = get(FormFieldStore);
            expect(store[formId].displayValues[fieldId]).toBe(testValue);
        });

        it('should set display values with group', () => {
            setFieldValue(formId, FormProps.DISPLAY_VALUES, testValue, fieldId, groupId);
            
            const store = get(FormFieldStore);
            expect(store[formId].displayValues[groupId][fieldId]).toBe(testValue);
        });

        it('should set dontSave values without group', () => {
            setFieldValue(formId, FormProps.DONT_SAVE, testValue, fieldId);
            
            const store = get(FormFieldStore);
            expect(store[formId].dontSave[fieldId]).toBe(testValue);
        });

        it('should set dontSave values with group', () => {
            setFieldValue(formId, FormProps.DONT_SAVE, testValue, fieldId, groupId);
            
            const store = get(FormFieldStore);
            expect(store[formId].dontSave[groupId][fieldId]).toBe(testValue);
        });

        it('should create group if it does not exist', () => {
            setFieldValue(formId, FormProps.FIELD_VALUES, testValue, fieldId, groupId);
            
            const store = get(FormFieldStore);
            expect(store[formId].fieldValues[groupId]).toBeDefined();
            expect(store[formId].fieldValues[groupId][fieldId]).toBe(testValue);
        });

        it('should trigger store updates', () => {
            const mockUpdate = vi.fn();
            const unsubscribe = FormFieldStore.subscribe(mockUpdate);
            
            setFieldValue(formId, FormProps.FIELD_VALUES, testValue, fieldId);
            
            expect(mockUpdate).toHaveBeenCalled();
            unsubscribe();
        });
    });

    describe('getFieldValue', () => {
        beforeEach(() => {
            initFieldStore(formId);
            setFieldValue(formId, FormProps.FIELD_VALUES, testValue, fieldId);
            setFieldValue(formId, FormProps.FIELD_VALUES, 'group-value', 'group-field', groupId);
        });

        it('should get field value without group', () => {
            const value = getFieldValue(formId, FormProps.FIELD_VALUES, fieldId);
            expect(value).toBe(testValue);
        });

        it('should get field value with group', () => {
            const value = getFieldValue(formId, FormProps.FIELD_VALUES, 'group-field', groupId);
            expect(value).toBe('group-value');
        });

        it('should return undefined for non-existent field', () => {
            const value = getFieldValue(formId, FormProps.FIELD_VALUES, 'non-existent');
            expect(value).toBeUndefined();
        });

        it('should return undefined for non-existent group', () => {
            const value = getFieldValue(formId, FormProps.FIELD_VALUES, fieldId, 'non-existent-group');
            expect(value).toBeUndefined();
        });

        it('should return all field values when no fieldId provided', () => {
            const values = getFieldValue(formId, FormProps.FIELD_VALUES);
            expect(values).toBeDefined();
            expect(values[fieldId]).toBe(testValue);
        });

        it('should get display values', () => {
            setFieldValue(formId, FormProps.DISPLAY_VALUES, 'display-value', fieldId);
            const value = getFieldValue(formId, FormProps.DISPLAY_VALUES, fieldId);
            expect(value).toBe('display-value');
        });

        it('should get dontSave values', () => {
            setFieldValue(formId, FormProps.DONT_SAVE, 'sensitive-value', fieldId);
            const value = getFieldValue(formId, FormProps.DONT_SAVE, fieldId);
            expect(value).toBe('sensitive-value');
        });
    });

    describe('hasFieldValue', () => {
        beforeEach(() => {
            initFieldStore(formId);
            setFieldValue(formId, FormProps.FIELD_VALUES, testValue, fieldId);
            setFieldValue(formId, FormProps.FIELD_VALUES, 'group-value', 'group-field', groupId);
        });

        it('should return true for existing field without group', () => {
            const exists = hasFieldValue(formId, FormProps.FIELD_VALUES, fieldId);
            expect(exists).toBe(true);
        });

        it('should return true for existing field with group', () => {
            const exists = hasFieldValue(formId, FormProps.FIELD_VALUES, 'group-field', groupId);
            expect(exists).toBe(true);
        });

        it('should return false for non-existent field', () => {
            const exists = hasFieldValue(formId, FormProps.FIELD_VALUES, 'non-existent');
            expect(exists).toBe(false);
        });

        it('should return false for non-existent group', () => {
            const exists = hasFieldValue(formId, FormProps.FIELD_VALUES, fieldId, 'non-existent-group');
            expect(exists).toBe(false);
        });

        it('should check display values', () => {
            setFieldValue(formId, FormProps.DISPLAY_VALUES, 'display', fieldId);
            const exists = hasFieldValue(formId, FormProps.DISPLAY_VALUES, fieldId);
            expect(exists).toBe(true);
        });

        it('should check dontSave values', () => {
            setFieldValue(formId, FormProps.DONT_SAVE, 'sensitive', fieldId);
            const exists = hasFieldValue(formId, FormProps.DONT_SAVE, fieldId);
            expect(exists).toBe(true);
        });
    });

    describe('clearFieldValue', () => {
        beforeEach(() => {
            initFieldStore(formId);
            setFieldValue(formId, FormProps.FIELD_VALUES, testValue, fieldId);
            setFieldValue(formId, FormProps.FIELD_VALUES, 'group-value', 'group-field', groupId);
        });

        it('should clear field value without group', () => {
            clearFieldValue(formId, FormProps.FIELD_VALUES, fieldId);
            
            const exists = hasFieldValue(formId, FormProps.FIELD_VALUES, fieldId);
            expect(exists).toBe(false);
        });

        it('should clear field value with group', () => {
            clearFieldValue(formId, FormProps.FIELD_VALUES, 'group-field', groupId);
            
            const exists = hasFieldValue(formId, FormProps.FIELD_VALUES, 'group-field', groupId);
            expect(exists).toBe(false);
        });

        it('should not affect other fields when clearing', () => {
            clearFieldValue(formId, FormProps.FIELD_VALUES, fieldId);
            
            const groupValue = getFieldValue(formId, FormProps.FIELD_VALUES, 'group-field', groupId);
            expect(groupValue).toBe('group-value');
        });

        it('should trigger store updates', () => {
            const mockUpdate = vi.fn();
            const unsubscribe = FormFieldStore.subscribe(mockUpdate);
            
            clearFieldValue(formId, FormProps.FIELD_VALUES, fieldId);
            
            expect(mockUpdate).toHaveBeenCalled();
            unsubscribe();
        });

        it('should handle clearing non-existent group gracefully', () => {
            expect(() => {
                clearFieldValue(formId, FormProps.FIELD_VALUES, fieldId, 'non-existent-group');
            }).not.toThrow();
        });
    });

    describe('clearFieldStore', () => {
        beforeEach(() => {
            initFieldStore(formId);
            setFieldValue(formId, FormProps.FIELD_VALUES, testValue, fieldId);
        });

        it('should clear all data for a form', () => {
            clearFieldStore(formId);
            
            const store = get(FormFieldStore);
            expect(store[formId]).toBeUndefined();
        });

        it('should not affect other forms', () => {
            const otherFormId = 'other-form';
            initFieldStore(otherFormId);
            setFieldValue(otherFormId, FormProps.FIELD_VALUES, 'other-value', 'other-field');
            
            clearFieldStore(formId);
            
            const store = get(FormFieldStore);
            expect(store[formId]).toBeUndefined();
            expect(store[otherFormId]).toBeDefined();
            expect(store[otherFormId].fieldValues['other-field']).toBe('other-value');
        });
    });

    describe('Error handling', () => {
        it('should throw error for invalid prop', () => {
            initFieldStore(formId);
            
            expect(() => {
                setFieldValue(formId, 'INVALID_PROP' as any, testValue, fieldId);
            }).toThrow();
        });

        it('should auto-initialize form data when accessing non-existent form', () => {
            const value = getFieldValue('new-form', FormProps.FIELD_VALUES, 'some-field');
            expect(value).toBeUndefined();
            
            // Verify that accessing the form auto-initializes it
            const hasValue = hasFieldValue('new-form', FormProps.FIELD_VALUES, 'some-field');
            expect(hasValue).toBe(false);
            
            const store = get(FormFieldStore);
            expect(store['new-form']).toBeDefined();
        });
    });

    describe('Data types and edge cases', () => {
        beforeEach(() => {
            initFieldStore(formId);
        });

        it('should handle null values', () => {
            setFieldValue(formId, FormProps.FIELD_VALUES, null, fieldId);
            const value = getFieldValue(formId, FormProps.FIELD_VALUES, fieldId);
            expect(value).toBeNull();
        });

        it('should handle undefined values', () => {
            setFieldValue(formId, FormProps.FIELD_VALUES, undefined, fieldId);
            const value = getFieldValue(formId, FormProps.FIELD_VALUES, fieldId);
            expect(value).toBeUndefined();
        });

        it('should handle object values', () => {
            const objectValue = { foo: 'bar', nested: { value: 123 } };
            setFieldValue(formId, FormProps.FIELD_VALUES, objectValue, fieldId);
            const value = getFieldValue(formId, FormProps.FIELD_VALUES, fieldId);
            expect(value).toEqual(objectValue);
        });

        it('should handle array values', () => {
            const arrayValue = ['item1', 'item2', { key: 'value' }];
            setFieldValue(formId, FormProps.FIELD_VALUES, arrayValue, fieldId);
            const value = getFieldValue(formId, FormProps.FIELD_VALUES, fieldId);
            expect(value).toEqual(arrayValue);
        });

        it('should handle boolean values', () => {
            setFieldValue(formId, FormProps.FIELD_VALUES, true, fieldId);
            let value = getFieldValue(formId, FormProps.FIELD_VALUES, fieldId);
            expect(value).toBe(true);

            setFieldValue(formId, FormProps.FIELD_VALUES, false, fieldId);
            value = getFieldValue(formId, FormProps.FIELD_VALUES, fieldId);
            expect(value).toBe(false);
        });

        it('should handle numeric values', () => {
            setFieldValue(formId, FormProps.FIELD_VALUES, 42, fieldId);
            let value = getFieldValue(formId, FormProps.FIELD_VALUES, fieldId);
            expect(value).toBe(42);

            setFieldValue(formId, FormProps.FIELD_VALUES, 0, fieldId);
            value = getFieldValue(formId, FormProps.FIELD_VALUES, fieldId);
            expect(value).toBe(0);

            setFieldValue(formId, FormProps.FIELD_VALUES, -1, fieldId);
            value = getFieldValue(formId, FormProps.FIELD_VALUES, fieldId);
            expect(value).toBe(-1);
        });
    });
});