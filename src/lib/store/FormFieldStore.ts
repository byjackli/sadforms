import { writable } from 'svelte/store';
import { belongs } from '../tools/kit';
import type { Value } from '../types/Form';
import { FormProps, ERROR_MESSAGES } from '../constants';
import { saveForm, getForm, removeForm } from '../services/storageService';

// Type definition for field data structure
interface FieldData {
    fieldValues: Record<string, Value | Record<string, Value>>;
    displayValues: Record<string, unknown | Record<string, unknown>>;
    dontSave: Record<string, Value | Record<string, Value>>;
}

// Simplified storage types
type StorageTypes = FormProps.FIELD_VALUES | FormProps.DONT_SAVE;

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

/**
 * Simple field storage functions - replaces complex manageFieldStorage
 */

/**
 * Set a field value (with automatic sensitive data routing)
 */
export function setField(formId: string, fieldId: string, value: Value, groupId?: string, dontSave = false): Value {
    const prop = dontSave ? FormProps.DONT_SAVE : FormProps.FIELD_VALUES;
    return setFieldValue(formId, prop, value, fieldId, groupId) as Value;
}

/**
 * Get a field value (checks both regular and sensitive storage)
 */
export function getField(formId: string, fieldId: string, groupId?: string): Value | undefined {
    // Try regular storage first, then dontSave storage if not found
    return getFieldValue(formId, FormProps.FIELD_VALUES, fieldId, groupId) as Value ??
           getFieldValue(formId, FormProps.DONT_SAVE, fieldId, groupId) as Value;
}

/**
 * Check if a field exists (in either regular or sensitive storage)
 */
export function hasField(formId: string, fieldId: string, groupId?: string): boolean {
    return hasFieldValue(formId, FormProps.FIELD_VALUES, fieldId, groupId) ||
           hasFieldValue(formId, FormProps.DONT_SAVE, fieldId, groupId);
}


/**
 * Clears a field from specified storage type, handling both grouped and ungrouped fields
 * MOVED FROM FormStore.ts
 * @param formid - Form identifier
 * @param storageType - Storage type ("fieldValues" or "dontSave")
 * @param fieldid - Field identifier
 * @param groupid - Optional group identifier
 */
export function clearFieldFromStorage(formid: string, storageType: StorageTypes, fieldid: string, groupid?: string): void {
    try {
        const slot = getFieldPropValue(formid, storageType);

        if (groupid !== undefined) {
            if (slot[groupid]) {
                delete slot[groupid][fieldid];
            }
        } else {
            delete slot[fieldid];
        }

        FormFieldStore.update(() => ({ ...fieldData }));
    } catch (error) {
        // Storage doesn't exist yet, which is fine
    }
}

/**
 * Save field values using StorageService
 * MOVED FROM FormStore.ts - now only handles field data
 */
export async function updateSave(formid: string): Promise<void> {
    const data = initializeFieldData(formid);
    
    try {
        await saveForm(formid, data.fieldValues as Record<string, Value>);
    } catch (error) {
        console.warn(`Failed to save form ${formid}:`, error);
    }
}

/**
 * Clear saved field values using StorageService
 * MOVED FROM FormStore.ts - now only handles field data
 */
export async function clearSave(formid: string): Promise<void> {
    try {
        await removeForm(formid);
    } catch (error) {
        console.warn(`Failed to clear form ${formid}:`, error);
    }
}

/**
 * Load saved field values using StorageService and initialize field store
 * MOVED FROM FormStore.ts - now only handles field data, other stores handle their own initialization
 */
export async function loadSave(formid: string, forceReset: boolean = false): Promise<void> {
    // Initialize field data structure
    if (!fieldData[formid] || forceReset) {
        fieldData[formid] = {
            fieldValues: {},
            displayValues: {},
            dontSave: {}
        };
    }
    
    // Load field values from StorageService if available
    if (!forceReset) {
        try {
            const formData = await getForm(formid);
            if (formData) {
                fieldData[formid].fieldValues = formData.fieldValues;
            }
        } catch (error) {
            console.warn(`Failed to load saved data for form ${formid}:`, error);
            fieldData[formid].fieldValues = {};
        }
    }
    
    FormFieldStore.update(() => ({ ...fieldData }));
}

export default FormFieldStore;