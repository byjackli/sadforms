import { writable } from 'svelte/store';
import { belongs } from '../tools/kit';
import type { Value } from '../types/Form';
import { FormProps, ERROR_MESSAGES } from '../constants';

// Type definition for field data structure
interface FieldData {
    fieldValues: Record<string, Value | Record<string, Value>>;
    displayValues: Record<string, unknown | Record<string, unknown>>;
    dontSave: Record<string, Value | Record<string, Value>>;
}

// Store data: formId -> field data
const fieldData: Record<string, FieldData> = {};

// Create the writable store
export const FormFieldStore = writable({ ...fieldData });

/**
 * Initialize field data for a form
 */
function initializeFieldData(formId: string): FieldData {
    if (!fieldData[formId]) {
        fieldData[formId] = {
            fieldValues: {},
            displayValues: {},
            dontSave: {}
        };
        // Trigger store update when new form is initialized
        FormFieldStore.update(() => ({ ...fieldData }));
    }
    return fieldData[formId];
}

/**
 * Get the appropriate field property storage
 */
function getFieldPropValue(formId: string, prop: FormProps.FIELD_VALUES | FormProps.DISPLAY_VALUES | FormProps.DONT_SAVE): Record<string, any> {
    const data = initializeFieldData(formId);
    switch (prop) {
        case FormProps.FIELD_VALUES:
            return data.fieldValues;
        case FormProps.DISPLAY_VALUES:
            return data.displayValues;
        case FormProps.DONT_SAVE:
            return data.dontSave;
        default:
            throw new Error(`${ERROR_MESSAGES.FORM_STORE_MISSING_PROP}: ${prop}`);
    }
}

/**
 * Check if a field value exists in the store
 */
export function hasFieldValue(formId: string, prop: FormProps.FIELD_VALUES | FormProps.DISPLAY_VALUES | FormProps.DONT_SAVE, fieldId: string, groupId?: string): boolean {
    const slot = getFieldPropValue(formId, prop);
    if (groupId === undefined) return belongs(slot, fieldId);
    return belongs(slot, groupId) && belongs(slot[groupId], fieldId);
}

/**
 * Set a field value in the store
 */
export function setFieldValue(
    formId: string, 
    prop: FormProps.FIELD_VALUES | FormProps.DISPLAY_VALUES | FormProps.DONT_SAVE, 
    fieldValue: unknown, 
    fieldId: string, 
    groupId?: string
): unknown {
    const slot = getFieldPropValue(formId, prop);
    
    if (groupId !== undefined) {
        if (!belongs(slot, groupId)) slot[groupId] = {};
        slot[groupId][fieldId] = fieldValue;
    } else {
        slot[fieldId] = fieldValue;
    }

    FormFieldStore.update(() => ({ ...fieldData }));
    return fieldValue;
}

/**
 * Get a field value from the store
 */
export function getFieldValue(
    formId: string, 
    prop: FormProps.FIELD_VALUES | FormProps.DISPLAY_VALUES | FormProps.DONT_SAVE, 
    fieldId?: string, 
    groupId?: string
): unknown {
    const slot = getFieldPropValue(formId, prop);
    
    if (fieldId === undefined) return slot;
    if (groupId !== undefined) return hasFieldValue(formId, prop, groupId) ? slot[groupId][fieldId] : undefined;
    return hasFieldValue(formId, prop, fieldId) ? slot[fieldId] : undefined;
}

/**
 * Clear a field value from the store
 */
export function clearFieldValue(
    formId: string, 
    prop: FormProps.FIELD_VALUES | FormProps.DISPLAY_VALUES | FormProps.DONT_SAVE, 
    fieldId: string, 
    groupId?: string
): void {
    const slot = getFieldPropValue(formId, prop);
    
    if (groupId !== undefined) {
        if (slot[groupId]) {
            delete slot[groupId][fieldId];
        }
    } else {
        delete slot[fieldId];
    }
    
    FormFieldStore.update(() => ({ ...fieldData }));
}

/**
 * Initialize field store for a form (called from formLifecycle)
 */
export function initFieldStore(formId: string): void {
    initializeFieldData(formId);
    FormFieldStore.update(() => ({ ...fieldData }));
}

/**
 * Clear all field data for a form
 */
export function clearFieldStore(formId: string): void {
    delete fieldData[formId];
    FormFieldStore.update(() => ({ ...fieldData }));
}

export default FormFieldStore;