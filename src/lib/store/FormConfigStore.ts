import { writable } from 'svelte/store';
import { belongs } from '../tools/kit';
import type { Group } from '../types/Form';
import { FormProps, ERROR_MESSAGES } from '../constants';

// Type definition for config data structure
interface ConfigData {
    required: Record<string, boolean | Record<string, boolean>>;
    onInput: Record<string, Function | Record<string, Function>>;
    redact: Record<string, boolean | Record<string, boolean>>;
    preview: Record<string, boolean | Record<string, boolean>>;
    group: Record<string, Group>;
}

// Store data: formId -> config data
const configData: Record<string, ConfigData> = {};

// Create the writable store
export const FormConfigStore = writable({ ...configData });

/**
 * Initialize config data for a form
 */
function initializeConfigData(formId: string): ConfigData {
    if (!configData[formId]) {
        configData[formId] = {
            required: {},
            onInput: {},
            redact: {},
            preview: {},
            group: {}
        };
        // Trigger store update when new form is initialized
        FormConfigStore.update(() => ({ ...configData }));
    }
    return configData[formId];
}

/**
 * Get the appropriate config property storage
 */
function getConfigPropValue(formId: string, prop: FormProps.REQUIRED | FormProps.ON_INPUT | FormProps.REDACT | FormProps.PREVIEW | FormProps.GROUP): Record<string, any> {
    const data = initializeConfigData(formId);
    switch (prop) {
        case FormProps.REQUIRED:
            return data.required;
        case FormProps.ON_INPUT:
            return data.onInput;
        case FormProps.REDACT:
            return data.redact;
        case FormProps.PREVIEW:
            return data.preview;
        case FormProps.GROUP:
            return data.group;
        default:
            throw new Error(`${ERROR_MESSAGES.FORM_STORE_MISSING_PROP}: ${prop}`);
    }
}

/**
 * Check if a config value exists in the store
 */
export function hasConfigValue(formId: string, prop: FormProps.REQUIRED | FormProps.ON_INPUT | FormProps.REDACT | FormProps.PREVIEW, fieldId: string, groupId?: string): boolean {
    const slot = getConfigPropValue(formId, prop);
    if (groupId === undefined) return belongs(slot, fieldId);
    return belongs(slot, groupId) && belongs(slot[groupId], fieldId);
}

/**
 * Set a required state in the store
 */
export function setRequired(
    formId: string, 
    required: boolean, 
    fieldId: string, 
    groupId?: string
): void {
    const slot = getConfigPropValue(formId, FormProps.REQUIRED);
    
    if (groupId !== undefined) {
        if (!belongs(slot, groupId)) slot[groupId] = {};
        slot[groupId][fieldId] = required;
    } else {
        slot[fieldId] = required;
    }
    
    FormConfigStore.update(() => ({ ...configData }));
}

/**
 * Set an onInput function in the store
 */
export function setOnInput(
    formId: string, 
    onInputFn: Function, 
    fieldId: string, 
    groupId?: string
): void {
    const slot = getConfigPropValue(formId, FormProps.ON_INPUT);
    
    if (groupId !== undefined) {
        if (!belongs(slot, groupId)) slot[groupId] = {};
        slot[groupId][fieldId] = onInputFn;
    } else {
        slot[fieldId] = onInputFn;
    }
    
    FormConfigStore.update(() => ({ ...configData }));
}

/**
 * Set a redact state in the store
 */
export function setRedact(
    formId: string, 
    redact: boolean, 
    fieldId: string, 
    groupId?: string
): void {
    const slot = getConfigPropValue(formId, FormProps.REDACT);
    
    if (groupId !== undefined) {
        if (!belongs(slot, groupId)) slot[groupId] = {};
        slot[groupId][fieldId] = redact;
    } else {
        slot[fieldId] = redact;
    }
    
    FormConfigStore.update(() => ({ ...configData }));
}

/**
 * Set a preview state in the store
 */
export function setPreview(
    formId: string, 
    preview: boolean, 
    fieldId: string, 
    groupId?: string
): void {
    const slot = getConfigPropValue(formId, FormProps.PREVIEW);
    
    if (groupId !== undefined) {
        if (!belongs(slot, groupId)) slot[groupId] = {};
        slot[groupId][fieldId] = preview;
    } else {
        slot[fieldId] = preview;
    }
    
    FormConfigStore.update(() => ({ ...configData }));
}

/**
 * Set a group in the store
 */
export function setGroup(
    formId: string, 
    group: Group, 
    groupId: string
): void {
    const slot = getConfigPropValue(formId, FormProps.GROUP);
    slot[groupId] = group;
    
    FormConfigStore.update(() => ({ ...configData }));
}

/**
 * Get a config value from the store
 */
export function getConfigValue(
    formId: string, 
    prop: FormProps.REQUIRED | FormProps.ON_INPUT | FormProps.REDACT | FormProps.PREVIEW | FormProps.GROUP, 
    fieldId?: string, 
    groupId?: string
): unknown {
    const slot = getConfigPropValue(formId, prop);
    
    if (fieldId === undefined) return slot;
    
    if (prop === FormProps.GROUP) {
        return slot[fieldId]; // fieldId is actually groupId for GROUP prop
    }
    
    if (groupId !== undefined) return hasConfigValue(formId, prop as FormProps.REQUIRED | FormProps.ON_INPUT | FormProps.REDACT | FormProps.PREVIEW, groupId) ? slot[groupId][fieldId] : undefined;
    return hasConfigValue(formId, prop as FormProps.REQUIRED | FormProps.ON_INPUT | FormProps.REDACT | FormProps.PREVIEW, fieldId) ? slot[fieldId] : undefined;
}

/**
 * Clear a config value from the store
 */
export function clearConfigValue(
    formId: string, 
    prop: FormProps.REQUIRED | FormProps.ON_INPUT | FormProps.REDACT | FormProps.PREVIEW, 
    fieldId: string, 
    groupId?: string
): void {
    const slot = getConfigPropValue(formId, prop);
    
    if (groupId !== undefined) {
        if (slot[groupId]) {
            delete slot[groupId][fieldId];
        }
    } else {
        delete slot[fieldId];
    }
    
    FormConfigStore.update(() => ({ ...configData }));
}

/**
 * Initialize config store for a form (called from formLifecycle)
 */
export function initConfigStore(formId: string): void {
    initializeConfigData(formId);
    FormConfigStore.update(() => ({ ...configData }));
}

/**
 * Clear all config data for a form
 */
export function clearConfigStore(formId: string): void {
    delete configData[formId];
    FormConfigStore.update(() => ({ ...configData }));
}

export default FormConfigStore;