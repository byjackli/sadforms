/**
 * Form event handling service extracted from Form.svelte
 * Handles field updates, focus/blur events, and form interactions
 */

import { setFieldProp, getFieldProp, manageFieldStorage } from '../store/FormStore';
import { checkValidity, updateFeedback, updateWarn, updatePreview } from './validationService';
import { get } from 'svelte/store';
import FormStore from '../store/FormStore';
import type { Value } from '../types/Form';
import { FormProps } from '$lib/constants';

export interface FormEventConfig {
    formId: string;
    formFields: any[];
    onInput?: (formData: any) => void;
    save?: {
        saveOnInput?: boolean;
        saveAuto?: number | false;
    };
    saveToLocal: boolean;
    saveToCloud: boolean;
    debug: boolean;
    updateSave?: (formId: string, saveToLocal: boolean, saveToCloud: boolean) => void;
    updateDebug?: () => void;
}

/**
 * Handles field update events (input, change, drop, etc.)
 */
export async function handleFieldUpdate(
    event: Event,
    fieldId: string,
    groupId: string | undefined,
    config: FormEventConfig
): Promise<void> {
    const { formId, formFields, onInput, save, saveToLocal, saveToCloud, updateSave, updateDebug } = config;

    let fieldValue: Value = (event.target as HTMLInputElement).value;
    const localOnInput = getFieldProp(formId, FormProps.ON_INPUT, fieldId, groupId);

    // Determine if field should not be saved
    const dontSave = getDontSaveFlag(fieldId, groupId, formFields);

    // Execute field-level onInput callback
    if (localOnInput && typeof localOnInput === 'function') {
        localOnInput(event.target);
    }

    // Handle file uploads
    if (event.type === "drop" || (event.target as HTMLInputElement)?.files) {
        fieldValue = await handleFileUpload(event);
    }

    // Store the field fieldValue
    manageFieldStorage(
        formId,
        { action: "set", fieldValue, dontSave },
        fieldId,
        groupId
    );

    // Update field value in store
    updateFieldValue(formId, fieldId, groupId);

    // Update preview if needed
    if (getFieldProp(formId, FormProps.PREVIEW, fieldId, groupId)) {
        updatePreview(formId, fieldId, groupId);
    }

    // Handle validation and feedback
    await handleFieldValidation(formId, fieldId, groupId);

    // Execute form-level onInput callback
    if (typeof onInput === 'function') {
        const formStore = getFormStore(formId);
        onInput(formStore);
    }

    // Auto-save if configured
    if (save?.saveOnInput && updateSave) {
        updateSave(formId, saveToLocal, saveToCloud);
    }

    // Update debug info
    if (updateDebug) {
        updateDebug();
    }
}

/**
 * Handles field focus events
 */
export async function handleFieldFocus(
    fieldId: string,
    groupId: string | undefined,
    config: FormEventConfig
): Promise<void> {
    const { formId, updateDebug } = config;

    setFieldProp(formId, FormProps.TOUCHED, true, fieldId, groupId);
    setFieldProp(formId, FormProps.ACTIVE, true, fieldId, groupId);

    // Handle redacted fields
    if (getFieldProp(formId, FormProps.REDACT, fieldId, groupId)) {
        updateFieldValue(formId, fieldId, groupId);
    }

    // Handle validation on focus
    await handleFieldValidation(formId, fieldId, groupId);

    if (updateDebug) {
        updateDebug();
    }
}

/**
 * Handles field blur events
 */
export function handleFieldBlur(
    fieldId: string,
    groupId: string | undefined,
    config: FormEventConfig
): void {
    const { formId, updateDebug } = config;

    setFieldProp(formId, FormProps.ACTIVE, false, fieldId, groupId);

    // Re-redact field if necessary
    if (getFieldProp(formId, FormProps.REDACT, fieldId, groupId)) {
        setFieldProp(formId, FormProps.DISPLAY_VALUES, "[redacted]", fieldId, groupId);
    }

    if (updateDebug) {
        updateDebug();
    }
}

/**
 * Updates field value from storage
 */
function updateFieldValue(formId: string, fieldId: string, groupId?: string, dontSave?: boolean): void {
    const exists = manageFieldStorage(
        formId,
        { dontSave, action: "exists" },
        fieldId,
        groupId
    );

    let fieldValue: Value;

    if (exists) {
        fieldValue = manageFieldStorage(
            formId,
            { dontSave, action: "get" },
            fieldId,
            groupId
        ) as Value;

        // Handle object fieldValue (convert to array if needed)
        if (typeof fieldValue === "object" && fieldValue !== null && !Array.isArray(fieldValue)) {
            fieldValue = Object.values(fieldValue);
        }
    } else {
        fieldValue = "";
    }

    setFieldProp(formId, FormProps.FIELD_VALUES, fieldValue, fieldId, groupId);
    setFieldProp(formId, FormProps.DISPLAY_VALUES, fieldValue, fieldId, groupId);
}

/**
 * Handles field validation and updates feedback/warnings
 */
async function handleFieldValidation(formId: string, fieldId: string, groupId?: string): Promise<void> {
    const hasCustomValidation = getFieldProp(formId, FormProps.VALIDITY, fieldId, groupId);
    const isRequired = getFieldProp(formId, FormProps.REQUIRED, fieldId, groupId);

    if (hasCustomValidation) {
        const result = await checkValidity(formId, "field", fieldId, groupId);
        updateFeedback(formId, fieldId, groupId, result);
    } else if (isRequired) {
        const result = await checkValidity(formId, "field", fieldId, groupId);
        updateWarn(formId, fieldId, groupId, result.verdict);
    }
}

/**
 * Handles file upload processing
 */
async function handleFileUpload(event: Event): Promise<Value> {
    const { getData } = await import("../utils/formHelpers");

    if (event.type === "drop") {
        const dropEvent = event as DragEvent;
        return dropEvent.dataTransfer?.files?.[0] || "";
    } else {
        const inputEvent = event as Event;
        const files = (inputEvent.target as HTMLInputElement)?.files;
        return files ? await getData(files) : "";
    }
}

/**
 * Determines if a field should not be saved based on its configuration
 */
function getDontSaveFlag(fieldId: string, groupId: string | undefined, formFields: any[]): boolean {
    if (groupId) {
        const group = formFields.find(
            (item) => item.meta && item.meta.uid === groupId
        );
        return group?.[fieldId]?.dontSave || false;
    } else {
        const field = formFields.find(
            (item) => !item.meta && item.uid === fieldId
        );
        return field?.dontSave || false;
    }
}

/**
 * Gets the current form store fieldValue
 */
function getFormStore(formId: string): any {
    const store = get(FormStore);
    return store[formId] || {};
}