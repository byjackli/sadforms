/**
 * Form event handling service extracted from Form.svelte
 * Handles field updates, focus/blur events, and form interactions
 */

import { manageFieldStorage } from '../store/FormStore';
import { setFieldValue } from '../store/FormFieldStore';
import { setTouched, setActive } from '../store/FormMetaStore';
import { getConfigValue } from '../store/FormConfigStore';
import { get } from 'svelte/store';
import FormStore from '../store/FormStore';
import type { Value, Field, Group, FormInstance } from '../types/Form';
import { FormProps } from '$lib/constants';
import { isGroup } from '../utils/formHelpers';
import EventBus, { createFormEvent, EVENT_TYPES } from './EventBus';

export interface FormEventConfig {
    formId: string;
    formFields: (Field | Group)[];
    onInput?: (formData: FormInstance) => void;
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

    // Store the field fieldValue
    manageFieldStorage(
        formId,
        { action: "set", fieldValue, dontSave },
        fieldId,
        groupId
    );

    // Update field value in store
    updateFieldValue(formId, fieldId, groupId);

    // Emit field input event for validation
    const eventBus = EventBus.getInstance();
    eventBus.emit(createFormEvent(EVENT_TYPES.FIELD_INPUT, formId, fieldId, groupId, { 
        value: fieldValue,
        originalEvent: event 
    }));

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

    setTouched(formId, true, fieldId, groupId);
    setActive(formId, true, fieldId, groupId);

    // Handle redacted fields
    if (getConfigValue(formId, FormProps.REDACT, fieldId, groupId)) {
        updateFieldValue(formId, fieldId, groupId);
    }

    // Emit field focus event
    const eventBus = EventBus.getInstance();
    eventBus.emit(createFormEvent(EVENT_TYPES.FIELD_FOCUS, formId, fieldId, groupId));

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

    setActive(formId, false, fieldId, groupId);

    // Re-redact field if necessary
    if (getConfigValue(formId, FormProps.REDACT, fieldId, groupId)) {
        setFieldValue(formId, FormProps.DISPLAY_VALUES, "[redacted]", fieldId, groupId);
    }

    // Emit field blur event
    const eventBus = EventBus.getInstance();
    eventBus.emit(createFormEvent(EVENT_TYPES.FIELD_BLUR, formId, fieldId, groupId));

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

    setFieldValue(formId, FormProps.FIELD_VALUES, fieldValue, fieldId, groupId);
    setFieldValue(formId, FormProps.DISPLAY_VALUES, fieldValue, fieldId, groupId);
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
 * Gets the current form store fieldValue
 */
function getFormStore(formId: string): FormInstance {
    const store = get(FormStore);
    return store[formId] || {} as FormInstance;
}