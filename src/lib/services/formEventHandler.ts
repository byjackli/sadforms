/**
 * Form event handling service extracted from Form.svelte
 * Handles field updates, focus/blur events, and form interactions
 */

import { setField, setFieldValue, getField, hasField } from '../store/FormFieldStore';
import { setTouched, setActive } from '../store/FormMetaStore';
import { getConfigValue } from '../store/FormConfigStore';
import { get } from 'svelte/store';
import FormFieldStore from '../store/FormFieldStore';
import type { Value, Field, Group, FormInstance } from '../types/Form';
import { FormProps } from '$lib/constants';
import { isGroup } from '../utils/formHelpers';
import { validateField } from './validationService';

export interface FormEventConfig {
    formId: string;
    formFields: (Field | Group)[];
    onInput?: (formData: FormInstance) => void;
    save?: {
        saveOnInput?: boolean;
        saveAuto?: number | false;
    };
    debug: boolean;
    updateSave?: (formId: string) => Promise<void>;
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
    const { formId, formFields, onInput, save, updateDebug } = config;

    let fieldValue: Value = (event.target as HTMLInputElement).value;
    const localOnInput = getConfigValue(formId, FormProps.ON_INPUT, fieldId, groupId);

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

    // Store the field value in both FIELD_VALUES and DISPLAY_VALUES
    setField(formId, fieldId, fieldValue, groupId, dontSave);
    setFieldValue(formId, FormProps.DISPLAY_VALUES, fieldValue, fieldId, groupId);

    await validateField(formId, fieldId, groupId);

    // Execute form-level onInput callback
    if (typeof onInput === 'function') {
        const formStore = getFormStore(formId);
        onInput(formStore);
    }

    // Auto-save if configured
    if (save?.saveOnInput && config.updateSave) {
        config.updateSave(formId).catch((error: any) =>
            console.warn(`Save on input failed for form ${formId}:`, error)
        );
    }

    updateDebug && updateDebug();
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

    setTouched(formId, true, fieldId, groupId);
    setActive(formId, true, fieldId, groupId);

    // Handle redacted fields - restore original value for editing
    if (getConfigValue(formId, FormProps.REDACT, fieldId, groupId)) {
        const fieldValue = hasField(formId, fieldId, groupId) 
            ? getField(formId, fieldId, groupId) 
            : "";
        setFieldValue(formId, FormProps.DISPLAY_VALUES, fieldValue, fieldId, groupId);
    }


    validateField(formId, fieldId, groupId);
    updateDebug && updateDebug();
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

    setActive(formId, false, fieldId, groupId);

    // Re-redact field if necessary
    if (getConfigValue(formId, FormProps.REDACT, fieldId, groupId)) {
        setFieldValue(formId, FormProps.DISPLAY_VALUES, "[redacted]", fieldId, groupId);
    }

    // Trigger field blur validation directly
    validateField(formId, fieldId, groupId);

    updateDebug && updateDebug();
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
function getDontSaveFlag(fieldId: string, groupId: string | undefined, formFields: (Field | Group)[]): boolean {
    if (groupId) {
        const group = formFields.find(
            (item) => isGroup(item) && item.meta.uid === groupId
        );
        return group && isGroup(group) ? (group[fieldId] as Field)?.dontSave || false : false;
    } else {
        const field = formFields.find(
            (item) => !isGroup(item) && item.uid === fieldId
        );
        return field && !isGroup(field) ? field.dontSave || false : false;
    }
}

/**
 * Gets the current form field data for callbacks
 * NOTE: This now returns only field data, not the full FormInstance
 */
function getFormStore(formId: string): any {
    const store = get(FormFieldStore);
    return store[formId] || { fieldValues: {}, displayValues: {}, dontSave: {} };
}