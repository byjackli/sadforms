/**
 * Form lifecycle service extracted from Form.svelte
 * Handles form loading, initialization, field management, and cleanup
 */

import { hasField, setField, getField, updateSave, loadSave } from '../store/FormFieldStore';
import { setFieldValue, initFieldStore } from '../store/FormFieldStore';
import { setValidity, initValidationStore } from '../store/FormValidationStore';
import { setTouched, setActive, initMetaStore } from '../store/FormMetaStore';
import { setRequired, setOnInput, setRedact, setPreview, setGroup, initConfigStore } from '../store/FormConfigStore';
import { loadBlank } from '../utils/formHelpers';
import { FIELD_TYPES, BRANDING, FormProps } from '../constants';
import type { Field, Group, Value } from '../types/Form';

export interface FormLifecycleConfig {
    uid: string;
    fields: Record<string, Field | Group>;
    saveToLocal: boolean;
    saveToCloud: boolean;
    save?: {
        saveAuto: number | false;
        saveOnInput: boolean;
    };
    debug: boolean;
    fullscreen: boolean;
    afterFormLoad?: (refresh: () => void) => void;
}

export interface FormLifecycleState {
    loading: boolean;
    formFields: (Field | Group)[];
    autoSaveInterval?: NodeJS.Timeout;
    section?: Field | Group | null;
}

/**
 * Initializes a form with all its fields and settings
 */
export async function initializeForm(
    config: FormLifecycleConfig,
    state: FormLifecycleState,
    updateDebug: () => void,
    forceReset = false,
    isInitialLoad = false
): Promise<FormLifecycleState> {
    const { uid, fields, saveToLocal, saveToCloud, save, fullscreen } = config;

    if (isInitialLoad) {
        console.log(BRANDING.MESSAGE);
        // Initialize event-driven validation handler
    }

    // Create new state
    const newFormFields = Object.values(fields);
    const newState: FormLifecycleState = {
        ...state,
        formFields: newFormFields,
        loading: false
    };

    // Load saved data
    loadSave(uid, saveToLocal, saveToCloud, forceReset);

    // Initialize specialized stores
    initFieldStore(uid);
    initValidationStore(uid);
    initMetaStore(uid);
    initConfigStore(uid);

    // Initialize specialized stores
    initFieldStore(uid);
    initValidationStore(uid);
    initMetaStore(uid);
    initConfigStore(uid);

    // Initialize all fields
    await loadAllFields(uid, newState.formFields, saveToLocal, saveToCloud);

    // Save current state
    updateSave(uid, saveToLocal, saveToCloud);
    updateDebug();

    // Setup auto-save interval
    if (typeof save?.saveAuto === "number") {
        newState.autoSaveInterval = setInterval(
            () => updateSave(uid, saveToLocal, saveToCloud),
            save.saveAuto
        );
    }

    // Setup fullscreen mode
    if (fullscreen && newState.formFields.length > 0) {
        newState.section = newState.formFields[0];
    }

    return newState;
}

/**
 * Loads and initializes all fields in the form
 */
export async function loadAllFields(
    uid: string,
    formFields: (Field | Group)[],
    saveToLocal: boolean,
    saveToCloud: boolean
): Promise<void> {
    for (const block of formFields) {
        if ('meta' in block) {
            // This is a Group
            await loadGroup(uid, block);
            // Load all fields in the group (exclude the 'meta' property)
            for (const [key, field] of Object.entries(block)) {
                if (key !== 'meta' && field && typeof field === 'object' && 'uid' in field) {
                    await loadField(uid, field as Field, block, saveToLocal, saveToCloud);
                }
            }
        } else {
            // This is a standalone Field
            await loadField(uid, block, undefined, saveToLocal, saveToCloud);
        }
    }
}

/**
 * Loads and initializes a group
 */
export async function loadGroup(uid: string, group: Group): Promise<void> {
    setGroup(uid, group, group.meta.uid);
    setGroup(uid, group, group.meta.uid);
}

/**
 * Loads and initializes a single field
 */
export async function loadField(
    uid: string,
    field: Field,
    group?: Group,
    saveToLocal = true,
    saveToCloud = false
): Promise<void> {
    const groupMeta = group?.meta;
    const dontSave = field.dontSave || groupMeta?.dontSave;

    // Initialize field data if it doesn't exist
    if (!hasField(uid, field.uid, groupMeta?.uid)) {
        const defaultFieldValue = field.defaultValue !== undefined && field.defaultValue !== null
            ? field.defaultValue
            : loadBlank(field.type);
            
        setField(uid, field.uid, defaultFieldValue, groupMeta?.uid, dontSave);
        setFieldValue(uid, FormProps.FIELD_VALUES, defaultFieldValue, field.uid, groupMeta?.uid);
        setFieldValue(uid, FormProps.DISPLAY_VALUES, defaultFieldValue, field.uid, groupMeta?.uid);
    } else {
        // Field exists in storage, but we still need to ensure displayValues are set
        updateFieldValue(uid, field.uid, groupMeta?.uid, dontSave);
    }

    // Setup field callbacks
    if (field.onInput) {
        setOnInput(uid, field.onInput, field.uid, groupMeta?.uid);
        setOnInput(uid, field.onInput, field.uid, groupMeta?.uid);
    }

    // Handle redacted fields
    if (field.redact || groupMeta?.redact) {
        setRedact(uid, groupMeta?.redact || field.redact, field.uid, groupMeta?.uid);
        setFieldValue(uid, FormProps.DISPLAY_VALUES, "[redacted]", field.uid, groupMeta?.uid);
        setRedact(uid, groupMeta?.redact || field.redact, field.uid, groupMeta?.uid);
        setFieldValue(uid, FormProps.DISPLAY_VALUES, "[redacted]", field.uid, groupMeta?.uid);
    }

    // Initialize field state
    setActive(uid, false, field.uid, groupMeta?.uid);
    setActive(uid, false, field.uid, groupMeta?.uid);

    // Setup required field validation (don't validate on init - wait for user interaction)
    if (field.required || groupMeta?.required) {
        const isRequired = groupMeta?.required || field.required;
        setRequired(uid, isRequired, field.uid, groupMeta?.uid);
        setRequired(uid, isRequired, field.uid, groupMeta?.uid);
    }

    // Setup custom validation (don't validate on init - wait for user interaction)
    if (field.validity) {
        setValidity(uid, field.validity, field.uid, groupMeta?.uid);
        setValidity(uid, field.validity, field.uid, groupMeta?.uid);
    }

    // Setup file preview for file fields
    if (field.type === FIELD_TYPES.FILE && !field.hide?.preview) {
        setPreview(uid, true, field.uid, groupMeta?.uid);
        setPreview(uid, true, field.uid, groupMeta?.uid);
    }
}

/**
 * Updates field value from storage
 */
export function updateFieldValue(uid: string, fieldId: string, groupId?: string, dontSave?: boolean): void {
    const exists = hasField(uid, fieldId, groupId);

    let fieldValue: Value;

    if (exists) {
        fieldValue = getField(uid, fieldId, groupId) as Value;

        // Convert object to array if needed
        if (typeof fieldValue === "object" && fieldValue !== null && !Array.isArray(fieldValue)) {
            fieldValue = Object.values(fieldValue);
        }
    } else {
        fieldValue = "";
    }

    setFieldValue(uid, FormProps.FIELD_VALUES, fieldValue, fieldId, groupId);
    setFieldValue(uid, FormProps.DISPLAY_VALUES, fieldValue, fieldId, groupId);
    setFieldValue(uid, FormProps.FIELD_VALUES, fieldValue, fieldId, groupId);
    setFieldValue(uid, FormProps.DISPLAY_VALUES, fieldValue, fieldId, groupId);
}

/**
 * Cleans up form lifecycle resources
 */
export function cleanupForm(state: FormLifecycleState): void {
    if (state.autoSaveInterval) {
        clearInterval(state.autoSaveInterval);
        state.autoSaveInterval = undefined;
    }
}

/**
 * Resets form to initial state
 */
export async function resetForm(
    config: FormLifecycleConfig,
    state: FormLifecycleState,
    updateDebug: () => void
): Promise<FormLifecycleState> {
    return await initializeForm(config, state, updateDebug, true, false);
}

/**
 * Checks if form is currently loading
 */
export function isFormLoading(state: FormLifecycleState): boolean {
    return state.loading;
}

/**
 * Gets the current fields array
 */
export function getFormFields(state: FormLifecycleState): (Field | Group)[] {
    return state.formFields;
}