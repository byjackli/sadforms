/**
 * Form submission service extracted from Form.svelte
 * Handles form validation and submission logic
 */

import { get } from 'svelte/store';
import FormStore, { setFieldProp, getFieldProp } from '../store/FormStore';
import { checkValidity, updateFeedback } from './validationService';
import { belongs } from '../tools/kit';
import type { Value } from '../types/Form';
import { FormProps } from '$lib/constants';

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
    
    // Validate the entire form
    const validation = await checkValidity(formId, "form");
    const isValid = validation.verdict;

    // Mark submission state
    setFieldProp(formId, FormProps.SUBMIT, true, "submitting");
    setFieldProp(formId, FormProps.SUBMIT, true, "attempted");

    if (!isValid) {
        // Update feedback for all invalid fields
        await updateInvalidFieldFeedback(formId);
        setFieldProp(formId, FormProps.SUBMIT, false, "accepted");
        
        setFieldProp(formId, FormProps.SUBMIT, false, "submitting");
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
        }
    }

    setFieldProp(formId, FormProps.SUBMIT, submissionSuccess, "accepted");
    setFieldProp(formId, FormProps.SUBMIT, false, "submitting");
    
    return { success: submissionSuccess };
}

/**
 * Updates feedback for all invalid fields in the form
 */
async function updateInvalidFieldFeedback(formId: string): Promise<void> {
    const formStore = get(FormStore);
    const verdicts = formStore[formId]?.verdict;
    
    if (!verdicts) return;

    for (const [key, value] of Object.entries(verdicts)) {
        if (belongs(value, "group")) {
            // Handle grouped fields
            for (const [fieldId, fieldVerdict] of Object.entries(value as Record<string, any>)) {
                if (fieldId !== "group" && !fieldVerdict.verdict) {
                    updateFeedback(formId, fieldId, key, fieldVerdict);
                }
            }
        } else if (!(value as any).verdict) {
            // Handle individual fields
            const fieldValidation = await checkValidity(formId, "field", key, undefined);
            updateFeedback(formId, key, undefined, fieldValidation);
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
    return !!getFieldProp(formId, FormProps.SUBMIT, "submitting");
}

/**
 * Checks if form submission was attempted
 */
export function isFormSubmissionAttempted(formId: string): boolean {
    return !!getFieldProp(formId, FormProps.SUBMIT, "attempted");
}

/**
 * Checks if form submission was accepted/successful
 */
export function isFormSubmissionAccepted(formId: string): boolean {
    return !!getFieldProp(formId, FormProps.SUBMIT, "accepted");
}