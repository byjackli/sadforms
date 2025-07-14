/**
 * Form submission service extracted from Form.svelte
 * Handles form validation and submission logic
 */

import { get } from 'svelte/store';
import FormStore from '../store/FormStore';
import { setSubmitState, setTouched, getMetaValue } from '../store/FormMetaStore';
import { checkValidity } from './validationService';
import { belongs } from '../tools/kit';
import type { Value } from '../types/Form';
import { FormProps } from '$lib/constants';
import EventBus, { createFormEvent, EVENT_TYPES } from './EventBus';

export interface SubmissionResult {
    success: boolean;
    errors?: string[];
}

export interface SubmissionConfig {
    formId: string;
    onSubmit?: (formData: Record<string, Value>, formId: string) => void | Promise<void>;
}

/**
 * Handles form submission with validation and callback execution
 */
export async function submitForm(config: SubmissionConfig): Promise<SubmissionResult> {
    const { formId, onSubmit } = config;
    
    const eventBus = EventBus.getInstance();
    
    // Emit form submit event
    eventBus.emit(createFormEvent(EVENT_TYPES.FORM_SUBMIT, formId, undefined, undefined, { config }));
    
    // Validate the entire form
    const validation = await checkValidity(formId, "form");
    const isValid = validation.verdict;

    // Mark submission state
    setSubmitState(formId, true, "submitting");
    setSubmitState(formId, true, "attempted");

    if (!isValid) {
        // Update feedback for all invalid fields
        await updateInvalidFieldFeedback(formId);
        setSubmitState(formId, false, "accepted");
        setSubmitState(formId, false, "submitting");
        
        // Emit form submit failed event
        eventBus.emit(createFormEvent(EVENT_TYPES.FORM_SUBMIT_FAILED, formId, undefined, undefined, { 
            reason: "validation",
            validation 
        }));
        
        return { success: false, errors: ["Form validation failed"] };
    } 

    // Form is valid, execute submission callback
    let submissionSuccess = true;
    if (onSubmit) {
        try {
            const formData = getFormData(formId);
            await onSubmit(formData, formId);
        } catch (error) {
            submissionSuccess = false;
            console.error('Form submission error:', error);
            
            // Emit form submit failed event for callback errors
            eventBus.emit(createFormEvent(EVENT_TYPES.FORM_SUBMIT_FAILED, formId, undefined, undefined, { 
                reason: "callback_error",
                error: error instanceof Error ? error.message : String(error)
            }));
        }
    }

    setSubmitState(formId, submissionSuccess, "accepted");
    setSubmitState(formId, false, "submitting");
    
    // Emit appropriate success/failure event
    if (submissionSuccess) {
        eventBus.emit(createFormEvent(EVENT_TYPES.FORM_SUBMIT_SUCCESS, formId, undefined, undefined, { 
            formData: getFormData(formId)
        }));
    }
    
    return { success: submissionSuccess };
}

/**
 * Updates feedback for all invalid fields in the form
 */
async function updateInvalidFieldFeedback(formId: string): Promise<void> {
    const formStore = get(FormStore);
    const verdicts = formStore[formId]?.validationResult;
    
    if (!verdicts) return;

    for (const [key, value] of Object.entries(verdicts)) {
        if (belongs(value, "group")) {
            // Handle grouped fields - revalidate any failing fields
            for (const [fieldId, fieldVerdict] of Object.entries(value as Record<string, any>)) {
                if (fieldId !== "group" && !fieldVerdict.verdict) {
                    // Mark field as touched so validation feedback shows
                    setTouched(formId, true, fieldId, key);
                    await checkValidity(formId, "field", fieldId, key);
                }
            }
        } else if (!(value as any).verdict) {
            // Handle individual fields
            // Mark field as touched so validation feedback shows
            setTouched(formId, true, key, undefined);
            await checkValidity(formId, "field", key, undefined);
        }
    }
}

/**
 * Extracts form data from the store
 */
function getFormData(formId: string): Record<string, Value> {
    const formStore = get(FormStore);
    const formData = formStore[formId]?.fieldValues;
    
    if (!formData) return {};
    
    // Flatten grouped and ungrouped data
    const result: Record<string, Value> = {};
    
    for (const [key, value] of Object.entries(formData)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            // This might be grouped data
            for (const [subKey, subValue] of Object.entries(value as Record<string, Value>)) {
                result[`${key}.${subKey}`] = subValue;
            }
        } else {
            result[key] = value as Value;
        }
    }
    
    return result;
}

/**
 * Checks if form is currently submitting
 */
export function isFormSubmitting(formId: string): boolean {
    return !!getMetaValue(formId, FormProps.SUBMIT, "submitting");
}

/**
 * Checks if form submission was attempted
 */
export function isFormSubmissionAttempted(formId: string): boolean {
    return !!getMetaValue(formId, FormProps.SUBMIT, "attempted");
}

/**
 * Checks if form submission was accepted/successful
 */
export function isFormSubmissionAccepted(formId: string): boolean {
    return !!getMetaValue(formId, FormProps.SUBMIT, "accepted");
}