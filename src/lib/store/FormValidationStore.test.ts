import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import FormValidationStore, {
    setValidationResult,
    setValidity,
    getValidationResult,
    clearValidationResult,
    hasValidationResult,
    initValidationStore,
    clearValidationStore
} from './FormValidationStore';
import { FormProps } from '../constants';
import type { ValidationResult, Validity } from '../types/Form';

describe('FormValidationStore', () => {
    const formId = 'test-form';
    const fieldId = 'test-field';
    const groupId = 'test-group';
    
    // Mock validation result and validity function
    const mockValidationResult: ValidationResult = {
        verdict: true,
        raw: ['Test validation passed']
    };
    
    const mockValidity: Validity = (value: any) => {
        return value ? { verdict: true, raw: [] } : { verdict: false, raw: ['Field is required'] };
    };

    beforeEach(() => {
        // Clear all validation data before each test
        clearValidationStore(formId);
    });

    describe('Store initialization', () => {
        it('should initialize with empty data', () => {
            const store = get(FormValidationStore);
            expect(store).toEqual({});
        });

        it('should initialize validation store for a form', () => {
            initValidationStore(formId);
            const store = get(FormValidationStore);
            expect(store[formId]).toBeDefined();
            expect(store[formId].validationResult).toEqual({});
            expect(store[formId].validity).toEqual({});
        });
    });

    describe('setValidationResult', () => {
        beforeEach(() => {
            initValidationStore(formId);
        });

        it('should set validation result without group', () => {
            setValidationResult(formId, mockValidationResult, fieldId);
            
            const store = get(FormValidationStore);
            expect(store[formId].validationResult[fieldId]).toEqual(mockValidationResult);
        });

        it('should set validation result with group', () => {
            setValidationResult(formId, mockValidationResult, fieldId, groupId);
            
            const store = get(FormValidationStore);
            expect(store[formId].validationResult[groupId][fieldId]).toEqual(mockValidationResult);
        });

        it('should create group if it does not exist', () => {
            setValidationResult(formId, mockValidationResult, fieldId, groupId);
            
            const store = get(FormValidationStore);
            expect(store[formId].validationResult[groupId]).toBeDefined();
            expect(store[formId].validationResult[groupId][fieldId]).toEqual(mockValidationResult);
        });

        it('should trigger store updates', () => {
            const mockUpdate = vi.fn();
            const unsubscribe = FormValidationStore.subscribe(mockUpdate);
            
            setValidationResult(formId, mockValidationResult, fieldId);
            
            expect(mockUpdate).toHaveBeenCalled();
            unsubscribe();
        });

        it('should handle different validation result types', () => {
            const failedResult: ValidationResult = {
                verdict: false,
                raw: ['Validation failed', 'Field is invalid']
            };
            
            setValidationResult(formId, failedResult, fieldId);
            
            const store = get(FormValidationStore);
            expect(store[formId].validationResult[fieldId]).toEqual(failedResult);
        });
    });

    describe('setValidity', () => {
        beforeEach(() => {
            initValidationStore(formId);
        });

        it('should set validity function without group', () => {
            setValidity(formId, mockValidity, fieldId);
            
            const store = get(FormValidationStore);
            expect(store[formId].validity[fieldId]).toBe(mockValidity);
        });

        it('should set validity function with group', () => {
            setValidity(formId, mockValidity, fieldId, groupId);
            
            const store = get(FormValidationStore);
            expect(store[formId].validity[groupId][fieldId]).toBe(mockValidity);
        });

        it('should create group if it does not exist', () => {
            setValidity(formId, mockValidity, fieldId, groupId);
            
            const store = get(FormValidationStore);
            expect(store[formId].validity[groupId]).toBeDefined();
            expect(store[formId].validity[groupId][fieldId]).toBe(mockValidity);
        });

        it('should trigger store updates', () => {
            const mockUpdate = vi.fn();
            const unsubscribe = FormValidationStore.subscribe(mockUpdate);
            
            setValidity(formId, mockValidity, fieldId);
            
            expect(mockUpdate).toHaveBeenCalled();
            unsubscribe();
        });

        it('should store different validity functions', () => {
            const emailValidity: Validity = (value: string) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(value) 
                    ? { verdict: true, raw: [] }
                    : { verdict: false, raw: ['Invalid email format'] };
            };
            
            setValidity(formId, emailValidity, 'email-field');
            
            const store = get(FormValidationStore);
            expect(store[formId].validity['email-field']).toBe(emailValidity);
        });
    });

    describe('getValidationResult', () => {
        beforeEach(() => {
            initValidationStore(formId);
            setValidationResult(formId, mockValidationResult, fieldId);
            setValidationResult(formId, { verdict: false, raw: ['Group validation failed'] }, 'group-field', groupId);
            setValidity(formId, mockValidity, fieldId);
            setValidity(formId, mockValidity, 'group-field', groupId);
        });

        it('should get validation result without group', () => {
            const result = getValidationResult(formId, FormProps.VALIDATION_RESULT, fieldId);
            expect(result).toEqual(mockValidationResult);
        });

        it('should get validation result with group', () => {
            const result = getValidationResult(formId, FormProps.VALIDATION_RESULT, 'group-field', groupId);
            expect(result).toEqual({ verdict: false, raw: ['Group validation failed'] });
        });

        it('should get validity function without group', () => {
            const validity = getValidationResult(formId, FormProps.VALIDITY, fieldId);
            expect(validity).toBe(mockValidity);
        });

        it('should get validity function with group', () => {
            const validity = getValidationResult(formId, FormProps.VALIDITY, 'group-field', groupId);
            expect(validity).toBe(mockValidity);
        });

        it('should return undefined for non-existent field', () => {
            const result = getValidationResult(formId, FormProps.VALIDATION_RESULT, 'non-existent');
            expect(result).toBeUndefined();
        });

        it('should return undefined for non-existent group', () => {
            const result = getValidationResult(formId, FormProps.VALIDATION_RESULT, fieldId, 'non-existent-group');
            expect(result).toBeUndefined();
        });

        it('should return all validation results when no fieldId provided', () => {
            const results = getValidationResult(formId, FormProps.VALIDATION_RESULT);
            expect(results).toBeDefined();
            expect(results[fieldId]).toEqual(mockValidationResult);
        });

        it('should return all validity functions when no fieldId provided', () => {
            const validities = getValidationResult(formId, FormProps.VALIDITY);
            expect(validities).toBeDefined();
            expect(validities[fieldId]).toBe(mockValidity);
        });
    });

    describe('hasValidationResult', () => {
        beforeEach(() => {
            initValidationStore(formId);
            setValidationResult(formId, mockValidationResult, fieldId);
            setValidationResult(formId, mockValidationResult, 'group-field', groupId);
            setValidity(formId, mockValidity, fieldId);
            setValidity(formId, mockValidity, 'group-field', groupId);
        });

        it('should return true for existing validation result without group', () => {
            const exists = hasValidationResult(formId, FormProps.VALIDATION_RESULT, fieldId);
            expect(exists).toBe(true);
        });

        it('should return true for existing validation result with group', () => {
            const exists = hasValidationResult(formId, FormProps.VALIDATION_RESULT, 'group-field', groupId);
            expect(exists).toBe(true);
        });

        it('should return true for existing validity function without group', () => {
            const exists = hasValidationResult(formId, FormProps.VALIDITY, fieldId);
            expect(exists).toBe(true);
        });

        it('should return true for existing validity function with group', () => {
            const exists = hasValidationResult(formId, FormProps.VALIDITY, 'group-field', groupId);
            expect(exists).toBe(true);
        });

        it('should return false for non-existent validation result', () => {
            const exists = hasValidationResult(formId, FormProps.VALIDATION_RESULT, 'non-existent');
            expect(exists).toBe(false);
        });

        it('should return false for non-existent group', () => {
            const exists = hasValidationResult(formId, FormProps.VALIDATION_RESULT, fieldId, 'non-existent-group');
            expect(exists).toBe(false);
        });

        it('should return false for non-existent validity function', () => {
            const exists = hasValidationResult(formId, FormProps.VALIDITY, 'non-existent');
            expect(exists).toBe(false);
        });
    });

    describe('clearValidationResult', () => {
        beforeEach(() => {
            initValidationStore(formId);
            setValidationResult(formId, mockValidationResult, fieldId);
            setValidationResult(formId, mockValidationResult, 'group-field', groupId);
            setValidity(formId, mockValidity, fieldId);
            setValidity(formId, mockValidity, 'group-field', groupId);
        });

        it('should clear validation result without group', () => {
            clearValidationResult(formId, FormProps.VALIDATION_RESULT, fieldId);
            
            const exists = hasValidationResult(formId, FormProps.VALIDATION_RESULT, fieldId);
            expect(exists).toBe(false);
        });

        it('should clear validation result with group', () => {
            clearValidationResult(formId, FormProps.VALIDATION_RESULT, 'group-field', groupId);
            
            const exists = hasValidationResult(formId, FormProps.VALIDATION_RESULT, 'group-field', groupId);
            expect(exists).toBe(false);
        });

        it('should clear validity function without group', () => {
            clearValidationResult(formId, FormProps.VALIDITY, fieldId);
            
            const exists = hasValidationResult(formId, FormProps.VALIDITY, fieldId);
            expect(exists).toBe(false);
        });

        it('should clear validity function with group', () => {
            clearValidationResult(formId, FormProps.VALIDITY, 'group-field', groupId);
            
            const exists = hasValidationResult(formId, FormProps.VALIDITY, 'group-field', groupId);
            expect(exists).toBe(false);
        });

        it('should not affect other fields when clearing', () => {
            clearValidationResult(formId, FormProps.VALIDATION_RESULT, fieldId);
            
            const groupResult = getValidationResult(formId, FormProps.VALIDATION_RESULT, 'group-field', groupId);
            expect(groupResult).toEqual(mockValidationResult);
        });

        it('should trigger store updates', () => {
            const mockUpdate = vi.fn();
            const unsubscribe = FormValidationStore.subscribe(mockUpdate);
            
            clearValidationResult(formId, FormProps.VALIDATION_RESULT, fieldId);
            
            expect(mockUpdate).toHaveBeenCalled();
            unsubscribe();
        });

        it('should handle clearing non-existent group gracefully', () => {
            expect(() => {
                clearValidationResult(formId, FormProps.VALIDATION_RESULT, fieldId, 'non-existent-group');
            }).not.toThrow();
        });

        it('should handle clearing non-existent field gracefully', () => {
            expect(() => {
                clearValidationResult(formId, FormProps.VALIDATION_RESULT, 'non-existent');
            }).not.toThrow();
        });
    });

    describe('clearValidationStore', () => {
        beforeEach(() => {
            initValidationStore(formId);
            setValidationResult(formId, mockValidationResult, fieldId);
            setValidity(formId, mockValidity, fieldId);
        });

        it('should clear all validation data for a form', () => {
            clearValidationStore(formId);
            
            const store = get(FormValidationStore);
            expect(store[formId]).toBeUndefined();
        });

        it('should not affect other forms', () => {
            const otherFormId = 'other-form';
            initValidationStore(otherFormId);
            setValidationResult(otherFormId, mockValidationResult, 'other-field');
            
            clearValidationStore(formId);
            
            const store = get(FormValidationStore);
            expect(store[formId]).toBeUndefined();
            expect(store[otherFormId]).toBeDefined();
            expect(store[otherFormId].validationResult['other-field']).toEqual(mockValidationResult);
        });
    });

    describe('Error handling', () => {
        it('should throw error for invalid prop', () => {
            initValidationStore(formId);
            
            expect(() => {
                getValidationResult(formId, 'INVALID_PROP' as any, fieldId);
            }).toThrow();
        });

        it('should auto-initialize validation data when accessing non-existent form', () => {
            const result = getValidationResult('new-form', FormProps.VALIDATION_RESULT, 'some-field');
            expect(result).toBeUndefined();
            
            // Verify that accessing the form auto-initializes it
            const hasResult = hasValidationResult('new-form', FormProps.VALIDATION_RESULT, 'some-field');
            expect(hasResult).toBe(false);
            
            const store = get(FormValidationStore);
            expect(store['new-form']).toBeDefined();
        });
    });

    describe('Complex validation scenarios', () => {
        beforeEach(() => {
            initValidationStore(formId);
        });

        it('should handle multiple validation results in the same group', () => {
            const result1: ValidationResult = { verdict: true, raw: ['Field 1 valid'] };
            const result2: ValidationResult = { verdict: false, raw: ['Field 2 invalid'] };
            
            setValidationResult(formId, result1, 'field1', groupId);
            setValidationResult(formId, result2, 'field2', groupId);
            
            const retrievedResult1 = getValidationResult(formId, FormProps.VALIDATION_RESULT, 'field1', groupId);
            const retrievedResult2 = getValidationResult(formId, FormProps.VALIDATION_RESULT, 'field2', groupId);
            
            expect(retrievedResult1).toEqual(result1);
            expect(retrievedResult2).toEqual(result2);
        });

        it('should handle validity functions that throw errors', () => {
            const throwingValidity: Validity = (value: any) => {
                if (value === 'throw') {
                    throw new Error('Test error');
                }
                return { verdict: true, raw: [] };
            };
            
            setValidity(formId, throwingValidity, fieldId);
            const retrievedValidity = getValidationResult(formId, FormProps.VALIDITY, fieldId) as Validity;
            
            expect(() => retrievedValidity('throw')).toThrow('Test error');
            expect(retrievedValidity('valid')).toEqual({ verdict: true, raw: [] });
        });

        it('should handle complex validation result structures', () => {
            const complexResult: ValidationResult = {
                verdict: false,
                raw: [
                    'Multiple validation errors',
                    { field: 'nested error', code: 'INVALID_FORMAT' },
                    ['array', 'of', 'errors']
                ]
            };
            
            setValidationResult(formId, complexResult, fieldId);
            const retrieved = getValidationResult(formId, FormProps.VALIDATION_RESULT, fieldId);
            
            expect(retrieved).toEqual(complexResult);
        });

        it('should maintain function references for validity functions', () => {
            const validityFn = (value: any) => ({ verdict: !!value, raw: [] });
            
            setValidity(formId, validityFn, fieldId);
            const retrieved = getValidationResult(formId, FormProps.VALIDITY, fieldId);
            
            expect(retrieved).toBe(validityFn); // Same reference
        });
    });

    describe('Store reactivity', () => {
        beforeEach(() => {
            initValidationStore(formId);
        });

        it('should trigger reactive updates when validation results change', () => {
            let storeValue: any;
            const unsubscribe = FormValidationStore.subscribe(value => {
                storeValue = value;
            });
            
            setValidationResult(formId, mockValidationResult, fieldId);
            
            expect(storeValue[formId].validationResult[fieldId]).toEqual(mockValidationResult);
            unsubscribe();
        });

        it('should trigger reactive updates when validity functions change', () => {
            let storeValue: any;
            const unsubscribe = FormValidationStore.subscribe(value => {
                storeValue = value;
            });
            
            setValidity(formId, mockValidity, fieldId);
            
            expect(storeValue[formId].validity[fieldId]).toBe(mockValidity);
            unsubscribe();
        });

        it('should trigger reactive updates when clearing validation data', () => {
            setValidationResult(formId, mockValidationResult, fieldId);
            
            let updateCount = 0;
            const unsubscribe = FormValidationStore.subscribe(() => {
                updateCount++;
            });
            
            clearValidationResult(formId, FormProps.VALIDATION_RESULT, fieldId);
            
            expect(updateCount).toBeGreaterThan(0);
            unsubscribe();
        });
    });
});