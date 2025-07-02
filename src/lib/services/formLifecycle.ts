/**
 * Form lifecycle service extracted from Form.svelte
 * Handles form loading, initialization, field management, and cleanup
 */

import { setFieldProp, manageFieldStorage, updateSave, clearSave, loadSave } from '../store/FormStore';
import { checkValidity, updatePreview } from './validationService';
import { loadBlank } from '../utils/formHelpers';
import { FIELD_TYPES, BRANDING } from '../constants';
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
    fieldsArr: (Field | Group)[];
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
    }

    // Create new state
    const newFieldsArr = Object.values(fields);
    const newState: FormLifecycleState = {
        ...state,
        fieldsArr: newFieldsArr,
        loading: false
    };

    // Load saved data
    loadSave(uid, saveToLocal, saveToCloud, forceReset);

    // Initialize all fields
    await loadAllFields(uid, newState.fieldsArr, saveToLocal, saveToCloud);

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
    if (fullscreen && newState.fieldsArr.length > 0) {
        newState.section = newState.fieldsArr[0];
    }

    return newState;
}

/**
 * Loads and initializes all fields in the form
 */
export async function loadAllFields(
    uid: string,
    fieldsArr: (Field | Group)[],
    saveToLocal: boolean,
    saveToCloud: boolean
): Promise<void> {
    for (const block of fieldsArr) {
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
    setFieldProp(uid, "group", group.meta, group.meta.uid);
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
    if (!manageFieldStorage(uid, { action: "exists" }, field.uid, groupMeta?.uid)) {
        const defaultData = field.defaultValue !== undefined && field.defaultValue !== null
            ? field.defaultValue
            : loadBlank(field.type);
            
        manageFieldStorage(
            uid,
            { dontSave, action: "init", data: defaultData },
            field.uid,
            groupMeta?.uid
        );
        setFieldProp(uid, "value", defaultData, field.uid, groupMeta?.uid);
    }

    // Setup field callbacks
    if (field.onInput) {
        setFieldProp(uid, "onInput", field.onInput, field.uid, groupMeta?.uid);
    }

    // Handle redacted fields
    if (field.redact || groupMeta?.redact) {
        setFieldProp(
            uid,
            "redact",
            groupMeta?.redact || field.redact,
            field.uid,
            groupMeta?.uid
        );
        setFieldProp(uid, "value", "[redacted]", field.uid, groupMeta?.uid);
    } else {
        updateFieldValue(uid, field.uid, groupMeta?.uid, dontSave);
    }

    // Initialize field state
    setFieldProp(uid, "active", false, field.uid, groupMeta?.uid);

    // Setup required field validation
    if (field.required || groupMeta?.required) {
        const isRequired = groupMeta?.required || field.required;
        setFieldProp(uid, "required", isRequired, field.uid, groupMeta?.uid);
        await checkValidity(uid, "field", field.uid, groupMeta?.uid);
    }

    // Setup custom validation
    if (field.validity) {
        setFieldProp(uid, "validity", field.validity, field.uid, groupMeta?.uid);
        await checkValidity(uid, "field", field.uid, groupMeta?.uid);
    }

    // Setup file preview for file fields
    if (field.type === FIELD_TYPES.FILE && !field.hide?.preview) {
        setFieldProp(uid, "preview", true, field.uid, groupMeta?.uid);
        const hasFiles = manageFieldStorage(uid, { action: "get" }, field.uid, groupMeta?.uid);
        if (hasFiles) {
            updatePreview(uid, field.uid, groupMeta?.uid);
        }
    }
}

/**
 * Updates field value from storage
 */
function updateFieldValue(uid: string, fieldId: string, groupId?: string, dontSave?: boolean): void {
    const exists = manageFieldStorage(
        uid,
        { dontSave, action: "exists" },
        fieldId,
        groupId
    );

    let data: Value;

    if (exists) {
        data = manageFieldStorage(
            uid,
            { dontSave, action: "get" },
            fieldId,
            groupId
        ) as Value;

        // Convert object to array if needed
        if (typeof data === "object" && data !== null && !Array.isArray(data)) {
            data = Object.values(data);
        }
    } else {
        data = "";
    }

    setFieldProp(uid, "value", data, fieldId, groupId);
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
export function getFieldsArray(state: FormLifecycleState): (Field | Group)[] {
    return state.fieldsArr;
}