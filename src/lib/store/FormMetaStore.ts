import { writable } from 'svelte/store';
import { belongs } from '../tools/kit';
import { FormProps, ERROR_MESSAGES } from '../constants';

// Type definition for meta data structure
interface MetaData {
    touched: Record<string, boolean | Record<string, boolean>>;
    active: Record<string, boolean | Record<string, boolean>>;
    submit: { submitting: boolean; accepted: boolean; attempted: boolean };
    storage: { saveToLocal: boolean; saveToCloud: boolean };
}

// Store data: formId -> meta data
const metaData: Record<string, MetaData> = {};

// Create the writable store
export const FormMetaStore = writable({ ...metaData });

/**
 * Initialize meta data for a form
 */
function initializeMetaData(formId: string): MetaData {
    if (!metaData[formId]) {
        metaData[formId] = {
            touched: {},
            active: {},
            submit: { submitting: false, accepted: false, attempted: false },
            storage: { saveToLocal: true, saveToCloud: false }  // Default values
        };
        // Trigger store update when new form is initialized
        FormMetaStore.update(() => ({ ...metaData }));
    }
    return metaData[formId];
}

/**
 * Get the appropriate meta property storage
 */
function getMetaPropValue(formId: string, prop: FormProps.TOUCHED | FormProps.ACTIVE | FormProps.SUBMIT | FormProps.SAVE_TO_LOCAL | FormProps.SAVE_TO_CLOUD): Record<string, any> | any {
    const data = initializeMetaData(formId);
    switch (prop) {
        case FormProps.TOUCHED:
            return data.touched;
        case FormProps.ACTIVE:
            return data.active;
        case FormProps.SUBMIT:
            return data.submit;
        case FormProps.SAVE_TO_LOCAL:
            return data.storage.saveToLocal;
        case FormProps.SAVE_TO_CLOUD:
            return data.storage.saveToCloud;
        default:
            throw new Error(`${ERROR_MESSAGES.FORM_STORE_MISSING_PROP}: ${prop}`);
    }
}

/**
 * Check if a meta value exists in the store
 */
export function hasMetaValue(formId: string, prop: FormProps.TOUCHED | FormProps.ACTIVE, fieldId: string, groupId?: string): boolean {
    const slot = getMetaPropValue(formId, prop) as Record<string, any>;
    if (groupId === undefined) return belongs(slot, fieldId);
    return belongs(slot, groupId) && belongs(slot[groupId], fieldId);
}

/**
 * Set a touched state in the store
 */
export function setTouched(
    formId: string, 
    touched: boolean, 
    fieldId: string, 
    groupId?: string
): void {
    const slot = getMetaPropValue(formId, FormProps.TOUCHED) as Record<string, any>;
    
    if (groupId !== undefined) {
        if (!belongs(slot, groupId)) slot[groupId] = {};
        slot[groupId][fieldId] = touched;
    } else {
        slot[fieldId] = touched;
    }
    
    FormMetaStore.update(() => ({ ...metaData }));
}

/**
 * Set an active state in the store
 */
export function setActive(
    formId: string, 
    active: boolean, 
    fieldId: string, 
    groupId?: string
): void {
    const slot = getMetaPropValue(formId, FormProps.ACTIVE) as Record<string, any>;
    
    if (groupId !== undefined) {
        if (!belongs(slot, groupId)) slot[groupId] = {};
        slot[groupId][fieldId] = active;
    } else {
        slot[fieldId] = active;
    }
    
    FormMetaStore.update(() => ({ ...metaData }));
}

/**
 * Set submit state properties
 */
export function setSubmitState(
    formId: string, 
    value: boolean, 
    property: "submitting" | "accepted" | "attempted"
): void {
    const submitData = getMetaPropValue(formId, FormProps.SUBMIT) as MetaData['submit'];
    submitData[property] = value;
    
    FormMetaStore.update(() => ({ ...metaData }));
}

/**
 * Set storage configuration for a form
 */
export function setStorageConfig(
    formId: string, 
    saveToLocal: boolean, 
    saveToCloud: boolean
): void {
    const data = initializeMetaData(formId);
    data.storage.saveToLocal = saveToLocal;
    data.storage.saveToCloud = saveToCloud;
    
    FormMetaStore.update(() => ({ ...metaData }));
}

/**
 * Get storage configuration for a form
 */
export function getStorageConfig(formId: string): { saveToLocal: boolean; saveToCloud: boolean } {
    const data = initializeMetaData(formId);
    return {
        saveToLocal: data.storage.saveToLocal,
        saveToCloud: data.storage.saveToCloud
    };
}

/**
 * Get a meta value from the store
 */
export function getMetaValue(
    formId: string, 
    prop: FormProps.TOUCHED | FormProps.ACTIVE | FormProps.SUBMIT | FormProps.SAVE_TO_LOCAL | FormProps.SAVE_TO_CLOUD, 
    fieldId?: string, 
    groupId?: string
): unknown {
    const slot = getMetaPropValue(formId, prop);
    
    if (prop === FormProps.SUBMIT || prop === FormProps.SAVE_TO_LOCAL || prop === FormProps.SAVE_TO_CLOUD) {
        return fieldId ? (slot as any)[fieldId] : slot;
    }
    
    const record = slot as Record<string, any>;
    if (fieldId === undefined) return record;
    if (groupId !== undefined) return hasMetaValue(formId, prop as FormProps.TOUCHED | FormProps.ACTIVE, groupId) ? record[groupId][fieldId] : undefined;
    return hasMetaValue(formId, prop as FormProps.TOUCHED | FormProps.ACTIVE, fieldId) ? record[fieldId] : undefined;
}

/**
 * Clear a meta value from the store
 */
export function clearMetaValue(
    formId: string, 
    prop: FormProps.TOUCHED | FormProps.ACTIVE, 
    fieldId: string, 
    groupId?: string
): void {
    const slot = getMetaPropValue(formId, prop) as Record<string, any>;
    
    if (groupId !== undefined) {
        if (slot[groupId]) {
            delete slot[groupId][fieldId];
        }
    } else {
        delete slot[fieldId];
    }
    
    FormMetaStore.update(() => ({ ...metaData }));
}

/**
 * Initialize meta store for a form (called from formLifecycle)
 */
export function initMetaStore(formId: string): void {
    initializeMetaData(formId);
    FormMetaStore.update(() => ({ ...metaData }));
}

/**
 * Clear all meta data for a form
 */
export function clearMetaStore(formId: string): void {
    delete metaData[formId];
    FormMetaStore.update(() => ({ ...metaData }));
}

export default FormMetaStore;