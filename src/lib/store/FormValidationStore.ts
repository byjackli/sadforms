import { writable } from 'svelte/store';
import { belongs } from '../tools/kit';
import type { ValidationResult, Validity } from '../types/Form';
import { FormProps, ERROR_MESSAGES } from '../constants';

// Type definition for validation data structure
interface ValidationData {
    validationResult: Record<string, ValidationResult | Record<string, ValidationResult>>;
    validity: Record<string, Validity | Record<string, Validity>>;
}

// Store data: formId -> validation data
const validationData: Record<string, ValidationData> = {};

// Create the writable store
export const FormValidationStore = writable({ ...validationData });

/**
 * Initialize validation data for a form
 */
function initializeValidationData(formId: string): ValidationData {
    if (!validationData[formId]) {
        validationData[formId] = {
            validationResult: {},
            validity: {}
        };
        // Trigger store update when new form is initialized
        FormValidationStore.update(() => ({ ...validationData }));
    }
    return validationData[formId];
}

/**
 * Get the appropriate validation property storage
 */
function getValidationPropValue(formId: string, prop: FormProps.VALIDATION_RESULT | FormProps.VALIDITY): Record<string, any> {
    const data = initializeValidationData(formId);
    switch (prop) {
        case FormProps.VALIDATION_RESULT:
            return data.validationResult;
        case FormProps.VALIDITY:
            return data.validity;
        default:
            throw new Error(`${ERROR_MESSAGES.FORM_STORE_MISSING_PROP}: ${prop}`);
    }
}

/**
 * Check if a validation result exists in the store
 */
export function hasValidationResult(formId: string, prop: FormProps.VALIDATION_RESULT | FormProps.VALIDITY, fieldId: string, groupId?: string): boolean {
    const slot = getValidationPropValue(formId, prop);
    if (groupId === undefined) return belongs(slot, fieldId);
    return belongs(slot, groupId) && belongs(slot[groupId], fieldId);
}

/**
 * Set a validation result in the store
 */
export function setValidationResult(
    formId: string, 
    result: ValidationResult, 
    fieldId: string, 
    groupId?: string
): void {
    const slot = getValidationPropValue(formId, FormProps.VALIDATION_RESULT);
    
    if (groupId !== undefined) {
        if (!belongs(slot, groupId)) slot[groupId] = {};
        slot[groupId][fieldId] = result;
    } else {
        slot[fieldId] = result;
    }
    
    FormValidationStore.update(() => ({ ...validationData }));
}

/**
 * Set a validity function in the store
 */
export function setValidity(
    formId: string, 
    validity: Validity, 
    fieldId: string, 
    groupId?: string
): void {
    const slot = getValidationPropValue(formId, FormProps.VALIDITY);
    
    if (groupId !== undefined) {
        if (!belongs(slot, groupId)) slot[groupId] = {};
        slot[groupId][fieldId] = validity;
    } else {
        slot[fieldId] = validity;
    }
    
    FormValidationStore.update(() => ({ ...validationData }));
}

/**
 * Get a validation result from the store
 */
export function getValidationResult(
    formId: string, 
    prop: FormProps.VALIDATION_RESULT | FormProps.VALIDITY, 
    fieldId?: string, 
    groupId?: string
): unknown {
    const slot = getValidationPropValue(formId, prop);
    
    if (fieldId === undefined) return slot;
    if (groupId !== undefined) return hasValidationResult(formId, prop, groupId) ? slot[groupId][fieldId] : undefined;
    return hasValidationResult(formId, prop, fieldId) ? slot[fieldId] : undefined;
}

/**
 * Clear a validation result from the store
 */
export function clearValidationResult(
    formId: string, 
    prop: FormProps.VALIDATION_RESULT | FormProps.VALIDITY, 
    fieldId: string, 
    groupId?: string
): void {
    const slot = getValidationPropValue(formId, prop);
    
    if (groupId !== undefined) {
        if (slot[groupId]) {
            delete slot[groupId][fieldId];
        }
    } else {
        delete slot[fieldId];
    }
    
    FormValidationStore.update(() => ({ ...validationData }));
}

/**
 * Initialize validation store for a form (called from formLifecycle)
 */
export function initValidationStore(formId: string): void {
    initializeValidationData(formId);
    FormValidationStore.update(() => ({ ...validationData }));
}

/**
 * Clear all validation data for a form
 */
export function clearValidationStore(formId: string): void {
    delete validationData[formId];
    FormValidationStore.update(() => ({ ...validationData }));
}

export default FormValidationStore;