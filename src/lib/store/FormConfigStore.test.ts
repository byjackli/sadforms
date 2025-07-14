import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import FormConfigStore, {
    setRequired,
    setOnInput,
    setRedact,
    setPreview,
    setGroup,
    getConfigValue,
    clearConfigValue,
    hasConfigValue,
    initConfigStore,
    clearConfigStore
} from './FormConfigStore';
import { FormProps } from '../constants';
import type { Group } from '../types/Form';

describe('FormConfigStore', () => {
    const formId = 'test-form';
    const fieldId = 'test-field';
    const groupId = 'test-group';
    
    // Mock group object
    const mockGroup: Group = {
        meta: {
            uid: groupId,
            name: 'Test Group',
            tooltip: 'Test group tooltip',
            required: false,
            dontSave: false,
            redact: false,
            override: {
                label: false,
                feedback: false
            }
        },
        // Group would contain fields here, but we're just testing the meta
    };

    // Mock onInput function
    const mockOnInput = vi.fn();

    beforeEach(() => {
        // Clear all config data before each test
        clearConfigStore(formId);
        vi.clearAllMocks();
    });

    describe('Store initialization', () => {
        it('should initialize with empty data', () => {
            const store = get(FormConfigStore);
            expect(store).toEqual({});
        });

        it('should initialize config store for a form', () => {
            initConfigStore(formId);
            const store = get(FormConfigStore);
            expect(store[formId]).toBeDefined();
            expect(store[formId].required).toEqual({});
            expect(store[formId].onInput).toEqual({});
            expect(store[formId].redact).toEqual({});
            expect(store[formId].preview).toEqual({});
            expect(store[formId].group).toEqual({});
        });
    });

    describe('setRequired', () => {
        beforeEach(() => {
            initConfigStore(formId);
        });

        it('should set required state without group', () => {
            setRequired(formId, true, fieldId);
            
            const store = get(FormConfigStore);
            expect(store[formId].required[fieldId]).toBe(true);
        });

        it('should set required state with group', () => {
            setRequired(formId, true, fieldId, groupId);
            
            const store = get(FormConfigStore);
            expect(store[formId].required[groupId][fieldId]).toBe(true);
        });

        it('should create group if it does not exist', () => {
            setRequired(formId, true, fieldId, groupId);
            
            const store = get(FormConfigStore);
            expect(store[formId].required[groupId]).toBeDefined();
            expect(store[formId].required[groupId][fieldId]).toBe(true);
        });

        it('should set required to false', () => {
            setRequired(formId, false, fieldId);
            
            const store = get(FormConfigStore);
            expect(store[formId].required[fieldId]).toBe(false);
        });

        it('should update existing required state', () => {
            setRequired(formId, true, fieldId);
            setRequired(formId, false, fieldId);
            
            const store = get(FormConfigStore);
            expect(store[formId].required[fieldId]).toBe(false);
        });

        it('should trigger store updates', () => {
            const mockUpdate = vi.fn();
            const unsubscribe = FormConfigStore.subscribe(mockUpdate);
            
            setRequired(formId, true, fieldId);
            
            expect(mockUpdate).toHaveBeenCalled();
            unsubscribe();
        });
    });

    describe('setOnInput', () => {
        beforeEach(() => {
            initConfigStore(formId);
        });

        it('should set onInput function without group', () => {
            setOnInput(formId, mockOnInput, fieldId);
            
            const store = get(FormConfigStore);
            expect(store[formId].onInput[fieldId]).toBe(mockOnInput);
        });

        it('should set onInput function with group', () => {
            setOnInput(formId, mockOnInput, fieldId, groupId);
            
            const store = get(FormConfigStore);
            expect(store[formId].onInput[groupId][fieldId]).toBe(mockOnInput);
        });

        it('should create group if it does not exist', () => {
            setOnInput(formId, mockOnInput, fieldId, groupId);
            
            const store = get(FormConfigStore);
            expect(store[formId].onInput[groupId]).toBeDefined();
            expect(store[formId].onInput[groupId][fieldId]).toBe(mockOnInput);
        });

        it('should trigger store updates', () => {
            const mockUpdate = vi.fn();
            const unsubscribe = FormConfigStore.subscribe(mockUpdate);
            
            setOnInput(formId, mockOnInput, fieldId);
            
            expect(mockUpdate).toHaveBeenCalled();
            unsubscribe();
        });

        it('should store different onInput functions for different fields', () => {
            const onInput1 = vi.fn();
            const onInput2 = vi.fn();
            
            setOnInput(formId, onInput1, 'field1');
            setOnInput(formId, onInput2, 'field2');
            
            const store = get(FormConfigStore);
            expect(store[formId].onInput['field1']).toBe(onInput1);
            expect(store[formId].onInput['field2']).toBe(onInput2);
        });
    });

    describe('setRedact', () => {
        beforeEach(() => {
            initConfigStore(formId);
        });

        it('should set redact state without group', () => {
            setRedact(formId, true, fieldId);
            
            const store = get(FormConfigStore);
            expect(store[formId].redact[fieldId]).toBe(true);
        });

        it('should set redact state with group', () => {
            setRedact(formId, true, fieldId, groupId);
            
            const store = get(FormConfigStore);
            expect(store[formId].redact[groupId][fieldId]).toBe(true);
        });

        it('should create group if it does not exist', () => {
            setRedact(formId, true, fieldId, groupId);
            
            const store = get(FormConfigStore);
            expect(store[formId].redact[groupId]).toBeDefined();
            expect(store[formId].redact[groupId][fieldId]).toBe(true);
        });

        it('should set redact to false', () => {
            setRedact(formId, false, fieldId);
            
            const store = get(FormConfigStore);
            expect(store[formId].redact[fieldId]).toBe(false);
        });

        it('should trigger store updates', () => {
            const mockUpdate = vi.fn();
            const unsubscribe = FormConfigStore.subscribe(mockUpdate);
            
            setRedact(formId, true, fieldId);
            
            expect(mockUpdate).toHaveBeenCalled();
            unsubscribe();
        });
    });

    describe('setPreview', () => {
        beforeEach(() => {
            initConfigStore(formId);
        });

        it('should set preview state without group', () => {
            setPreview(formId, true, fieldId);
            
            const store = get(FormConfigStore);
            expect(store[formId].preview[fieldId]).toBe(true);
        });

        it('should set preview state with group', () => {
            setPreview(formId, true, fieldId, groupId);
            
            const store = get(FormConfigStore);
            expect(store[formId].preview[groupId][fieldId]).toBe(true);
        });

        it('should create group if it does not exist', () => {
            setPreview(formId, true, fieldId, groupId);
            
            const store = get(FormConfigStore);
            expect(store[formId].preview[groupId]).toBeDefined();
            expect(store[formId].preview[groupId][fieldId]).toBe(true);
        });

        it('should set preview to false', () => {
            setPreview(formId, false, fieldId);
            
            const store = get(FormConfigStore);
            expect(store[formId].preview[fieldId]).toBe(false);
        });

        it('should trigger store updates', () => {
            const mockUpdate = vi.fn();
            const unsubscribe = FormConfigStore.subscribe(mockUpdate);
            
            setPreview(formId, true, fieldId);
            
            expect(mockUpdate).toHaveBeenCalled();
            unsubscribe();
        });
    });

    describe('setGroup', () => {
        beforeEach(() => {
            initConfigStore(formId);
        });

        it('should set group data', () => {
            setGroup(formId, mockGroup, groupId);
            
            const store = get(FormConfigStore);
            expect(store[formId].group[groupId]).toEqual(mockGroup);
        });

        it('should update existing group data', () => {
            const updatedGroup: Group = {
                ...mockGroup,
                meta: {
                    ...mockGroup.meta,
                    name: 'Updated Group Name'
                }
            };
            
            setGroup(formId, mockGroup, groupId);
            setGroup(formId, updatedGroup, groupId);
            
            const store = get(FormConfigStore);
            expect(store[formId].group[groupId]).toEqual(updatedGroup);
        });

        it('should trigger store updates', () => {
            const mockUpdate = vi.fn();
            const unsubscribe = FormConfigStore.subscribe(mockUpdate);
            
            setGroup(formId, mockGroup, groupId);
            
            expect(mockUpdate).toHaveBeenCalled();
            unsubscribe();
        });

        it('should handle multiple groups', () => {
            const group2: Group = {
                meta: {
                    uid: 'group2',
                    name: 'Second Group',
                    tooltip: 'Second group tooltip',
                    required: true,
                    dontSave: true,
                    redact: true,
                    override: {
                        label: true,
                        feedback: true
                    }
                }
            };
            
            setGroup(formId, mockGroup, groupId);
            setGroup(formId, group2, 'group2');
            
            const store = get(FormConfigStore);
            expect(store[formId].group[groupId]).toEqual(mockGroup);
            expect(store[formId].group['group2']).toEqual(group2);
        });
    });

    describe('getConfigValue', () => {
        beforeEach(() => {
            initConfigStore(formId);
            setRequired(formId, true, fieldId);
            setRequired(formId, false, 'group-field', groupId);
            setOnInput(formId, mockOnInput, fieldId);
            setRedact(formId, true, fieldId);
            setPreview(formId, false, fieldId);
            setGroup(formId, mockGroup, groupId);
        });

        it('should get required value without group', () => {
            const value = getConfigValue(formId, FormProps.REQUIRED, fieldId);
            expect(value).toBe(true);
        });

        it('should get required value with group', () => {
            const value = getConfigValue(formId, FormProps.REQUIRED, 'group-field', groupId);
            expect(value).toBe(false);
        });

        it('should get onInput function without group', () => {
            const value = getConfigValue(formId, FormProps.ON_INPUT, fieldId);
            expect(value).toBe(mockOnInput);
        });

        it('should get redact value without group', () => {
            const value = getConfigValue(formId, FormProps.REDACT, fieldId);
            expect(value).toBe(true);
        });

        it('should get preview value without group', () => {
            const value = getConfigValue(formId, FormProps.PREVIEW, fieldId);
            expect(value).toBe(false);
        });

        it('should get group data', () => {
            const value = getConfigValue(formId, FormProps.GROUP, groupId);
            expect(value).toEqual(mockGroup);
        });

        it('should return undefined for non-existent field', () => {
            const value = getConfigValue(formId, FormProps.REQUIRED, 'non-existent');
            expect(value).toBeUndefined();
        });

        it('should return undefined for non-existent group', () => {
            const value = getConfigValue(formId, FormProps.REQUIRED, fieldId, 'non-existent-group');
            expect(value).toBeUndefined();
        });

        it('should return all values when no fieldId provided', () => {
            const values = getConfigValue(formId, FormProps.REQUIRED);
            expect(values).toBeDefined();
            expect(values[fieldId]).toBe(true);
        });

        it('should return all onInput functions when no fieldId provided', () => {
            const values = getConfigValue(formId, FormProps.ON_INPUT);
            expect(values).toBeDefined();
            expect(values[fieldId]).toBe(mockOnInput);
        });

        it('should return all groups when no fieldId provided', () => {
            const values = getConfigValue(formId, FormProps.GROUP);
            expect(values).toBeDefined();
            expect(values[groupId]).toEqual(mockGroup);
        });
    });

    describe('hasConfigValue', () => {
        beforeEach(() => {
            initConfigStore(formId);
            setRequired(formId, true, fieldId);
            setRequired(formId, false, 'group-field', groupId);
            setOnInput(formId, mockOnInput, fieldId);
            setRedact(formId, true, fieldId);
            setPreview(formId, false, fieldId);
        });

        it('should return true for existing required value without group', () => {
            const exists = hasConfigValue(formId, FormProps.REQUIRED, fieldId);
            expect(exists).toBe(true);
        });

        it('should return true for existing required value with group', () => {
            const exists = hasConfigValue(formId, FormProps.REQUIRED, 'group-field', groupId);
            expect(exists).toBe(true);
        });

        it('should return true for existing onInput function without group', () => {
            const exists = hasConfigValue(formId, FormProps.ON_INPUT, fieldId);
            expect(exists).toBe(true);
        });

        it('should return true for existing redact value without group', () => {
            const exists = hasConfigValue(formId, FormProps.REDACT, fieldId);
            expect(exists).toBe(true);
        });

        it('should return true for existing preview value without group', () => {
            const exists = hasConfigValue(formId, FormProps.PREVIEW, fieldId);
            expect(exists).toBe(true);
        });

        it('should return false for non-existent required value', () => {
            const exists = hasConfigValue(formId, FormProps.REQUIRED, 'non-existent');
            expect(exists).toBe(false);
        });

        it('should return false for non-existent group', () => {
            const exists = hasConfigValue(formId, FormProps.REQUIRED, fieldId, 'non-existent-group');
            expect(exists).toBe(false);
        });

        it('should return true even for false values', () => {
            setRequired(formId, false, 'false-field');
            const exists = hasConfigValue(formId, FormProps.REQUIRED, 'false-field');
            expect(exists).toBe(true);
        });
    });

    describe('clearConfigValue', () => {
        beforeEach(() => {
            initConfigStore(formId);
            setRequired(formId, true, fieldId);
            setRequired(formId, false, 'group-field', groupId);
            setOnInput(formId, mockOnInput, fieldId);
            setRedact(formId, true, fieldId);
            setPreview(formId, false, fieldId);
        });

        it('should clear required value without group', () => {
            clearConfigValue(formId, FormProps.REQUIRED, fieldId);
            
            const exists = hasConfigValue(formId, FormProps.REQUIRED, fieldId);
            expect(exists).toBe(false);
        });

        it('should clear required value with group', () => {
            clearConfigValue(formId, FormProps.REQUIRED, 'group-field', groupId);
            
            const exists = hasConfigValue(formId, FormProps.REQUIRED, 'group-field', groupId);
            expect(exists).toBe(false);
        });

        it('should clear onInput function without group', () => {
            clearConfigValue(formId, FormProps.ON_INPUT, fieldId);
            
            const exists = hasConfigValue(formId, FormProps.ON_INPUT, fieldId);
            expect(exists).toBe(false);
        });

        it('should clear redact value without group', () => {
            clearConfigValue(formId, FormProps.REDACT, fieldId);
            
            const exists = hasConfigValue(formId, FormProps.REDACT, fieldId);
            expect(exists).toBe(false);
        });

        it('should clear preview value without group', () => {
            clearConfigValue(formId, FormProps.PREVIEW, fieldId);
            
            const exists = hasConfigValue(formId, FormProps.PREVIEW, fieldId);
            expect(exists).toBe(false);
        });

        it('should not affect other fields when clearing', () => {
            clearConfigValue(formId, FormProps.REQUIRED, fieldId);
            
            const groupValue = getConfigValue(formId, FormProps.REQUIRED, 'group-field', groupId);
            expect(groupValue).toBe(false);
        });

        it('should trigger store updates', () => {
            const mockUpdate = vi.fn();
            const unsubscribe = FormConfigStore.subscribe(mockUpdate);
            
            clearConfigValue(formId, FormProps.REQUIRED, fieldId);
            
            expect(mockUpdate).toHaveBeenCalled();
            unsubscribe();
        });

        it('should handle clearing non-existent group gracefully', () => {
            expect(() => {
                clearConfigValue(formId, FormProps.REQUIRED, fieldId, 'non-existent-group');
            }).not.toThrow();
        });

        it('should handle clearing non-existent field gracefully', () => {
            expect(() => {
                clearConfigValue(formId, FormProps.REQUIRED, 'non-existent');
            }).not.toThrow();
        });
    });

    describe('clearConfigStore', () => {
        beforeEach(() => {
            initConfigStore(formId);
            setRequired(formId, true, fieldId);
            setOnInput(formId, mockOnInput, fieldId);
            setGroup(formId, mockGroup, groupId);
        });

        it('should clear all config data for a form', () => {
            clearConfigStore(formId);
            
            const store = get(FormConfigStore);
            expect(store[formId]).toBeUndefined();
        });

        it('should not affect other forms', () => {
            const otherFormId = 'other-form';
            initConfigStore(otherFormId);
            setRequired(otherFormId, true, 'other-field');
            
            clearConfigStore(formId);
            
            const store = get(FormConfigStore);
            expect(store[formId]).toBeUndefined();
            expect(store[otherFormId]).toBeDefined();
            expect(store[otherFormId].required['other-field']).toBe(true);
        });
    });

    describe('Error handling', () => {
        it('should throw error for invalid prop', () => {
            initConfigStore(formId);
            
            expect(() => {
                getConfigValue(formId, 'INVALID_PROP' as any, fieldId);
            }).toThrow();
        });

        it('should auto-initialize config data when accessing non-existent form', () => {
            const value = getConfigValue('new-form', FormProps.REQUIRED, 'some-field');
            expect(value).toBeUndefined();
            
            // Verify that accessing the form auto-initializes it
            const hasValue = hasConfigValue('new-form', FormProps.REQUIRED, 'some-field');
            expect(hasValue).toBe(false);
            
            const store = get(FormConfigStore);
            expect(store['new-form']).toBeDefined();
        });
    });

    describe('Complex scenarios', () => {
        beforeEach(() => {
            initConfigStore(formId);
        });

        it('should handle multiple config properties for same field', () => {
            setRequired(formId, true, fieldId);
            setOnInput(formId, mockOnInput, fieldId);
            setRedact(formId, true, fieldId);
            setPreview(formId, false, fieldId);
            
            expect(getConfigValue(formId, FormProps.REQUIRED, fieldId)).toBe(true);
            expect(getConfigValue(formId, FormProps.ON_INPUT, fieldId)).toBe(mockOnInput);
            expect(getConfigValue(formId, FormProps.REDACT, fieldId)).toBe(true);
            expect(getConfigValue(formId, FormProps.PREVIEW, fieldId)).toBe(false);
        });

        it('should handle mixed grouped and non-grouped fields', () => {
            setRequired(formId, true, fieldId); // Non-grouped
            setRequired(formId, false, fieldId, groupId); // Grouped
            
            expect(getConfigValue(formId, FormProps.REQUIRED, fieldId)).toBe(true);
            expect(getConfigValue(formId, FormProps.REQUIRED, fieldId, groupId)).toBe(false);
        });

        it('should handle multiple fields in same group', () => {
            setRequired(formId, true, 'field1', groupId);
            setRequired(formId, false, 'field2', groupId);
            setOnInput(formId, mockOnInput, 'field1', groupId);
            
            expect(getConfigValue(formId, FormProps.REQUIRED, 'field1', groupId)).toBe(true);
            expect(getConfigValue(formId, FormProps.REQUIRED, 'field2', groupId)).toBe(false);
            expect(getConfigValue(formId, FormProps.ON_INPUT, 'field1', groupId)).toBe(mockOnInput);
        });

        it('should handle function reference preservation', () => {
            const customFunction = (value: any) => console.log(value);
            setOnInput(formId, customFunction, fieldId);
            
            const retrieved = getConfigValue(formId, FormProps.ON_INPUT, fieldId);
            expect(retrieved).toBe(customFunction); // Same reference
        });

        it('should handle complex group metadata', () => {
            const complexGroup: Group = {
                meta: {
                    uid: 'complex-group',
                    name: 'Complex Group',
                    tooltip: 'This is a complex group with all properties',
                    required: true,
                    dontSave: true,
                    redact: true,
                    override: {
                        label: true,
                        feedback: false
                    },
                    spellcheck: 'true'
                }
            };
            
            setGroup(formId, complexGroup, 'complex-group');
            const retrieved = getConfigValue(formId, FormProps.GROUP, 'complex-group');
            
            expect(retrieved).toEqual(complexGroup);
        });
    });

    describe('Store reactivity', () => {
        beforeEach(() => {
            initConfigStore(formId);
        });

        it('should trigger reactive updates when required state changes', () => {
            let storeValue: any;
            const unsubscribe = FormConfigStore.subscribe(value => {
                storeValue = value;
            });
            
            setRequired(formId, true, fieldId);
            
            expect(storeValue[formId].required[fieldId]).toBe(true);
            unsubscribe();
        });

        it('should trigger reactive updates when onInput function changes', () => {
            let storeValue: any;
            const unsubscribe = FormConfigStore.subscribe(value => {
                storeValue = value;
            });
            
            setOnInput(formId, mockOnInput, fieldId);
            
            expect(storeValue[formId].onInput[fieldId]).toBe(mockOnInput);
            unsubscribe();
        });

        it('should trigger reactive updates when group changes', () => {
            let storeValue: any;
            const unsubscribe = FormConfigStore.subscribe(value => {
                storeValue = value;
            });
            
            setGroup(formId, mockGroup, groupId);
            
            expect(storeValue[formId].group[groupId]).toEqual(mockGroup);
            unsubscribe();
        });

        it('should trigger reactive updates when clearing config data', () => {
            setRequired(formId, true, fieldId);
            
            let updateCount = 0;
            const unsubscribe = FormConfigStore.subscribe(() => {
                updateCount++;
            });
            
            clearConfigValue(formId, FormProps.REQUIRED, fieldId);
            
            expect(updateCount).toBeGreaterThan(0);
            unsubscribe();
        });
    });
});