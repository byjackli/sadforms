/**
 * Field management service extracted from Form.svelte
 * Handles field and group initialization and updates
 */

import { setFieldProp, getFieldProp, manageFieldStorage } from '../store/FormStore';
import { loadBlank, isGroup } from '../utils/formHelpers';
import type { Field, Group } from '../types/Form';
import { FormProps } from '$lib/constants';

/**
 * Loads and initializes a single field
 */
export async function loadField(
    uid: string, 
    field: Field, 
    group?: Group,
    saveToLocal: boolean = true,
    saveToCloud: boolean = false
): Promise<void> {
    let g = group?.meta;
    const dontSave = field.dontSave || g?.dontSave;

    if (!manageFieldStorage(uid, { action: "exists" }, field.uid, g?.uid)) {
        const fieldValue = field.defaultValue !== undefined && field.defaultValue !== null
            ? field.defaultValue
            : loadBlank(field.type);
        manageFieldStorage(
            uid,
            { dontSave, action: "init", fieldValue },
            field.uid,
            g?.uid
        );
        setFieldProp(uid, FormProps.FIELD_VALUES, fieldValue, field.uid, g?.uid);
        setFieldProp(uid, FormProps.DISPLAY_VALUES, fieldValue, field.uid, g?.uid);
    }
    
    if (field.onInput)
        setFieldProp(uid, FormProps.ON_INPUT, field.onInput, field.uid, g?.uid);

    if (field.redact || (g && g.redact)) {
        setFieldProp(
            uid,
            FormProps.REDACT,
            { redact: true, data: field.redact || g.redact },
            field.uid,
            g?.uid
        );
    } else {
        // Clear redaction when disabled
        setFieldProp(uid, FormProps.REDACT, false, field.uid, g?.uid);
    }

    if (field.required || (g && g.required)) {
        setFieldProp(uid, FormProps.REQUIRED, true, field.uid, g?.uid);
    }

    if (field.validity)
        setFieldProp(uid, FormProps.VALIDITY, field.validity, field.uid, g?.uid);
}

/**
 * Loads and initializes a field group
 */
export async function loadGroup(uid: string, group: Group): Promise<void> {
    setFieldProp(uid, FormProps.GROUP, group.meta, group.meta.uid);
}

/**
 * Loads all fields in the formFields
 */
export async function loadAllFields(
    uid: string,
    formFields: (Field | Group)[],
    saveToLocal: boolean = true,
    saveToCloud: boolean = false
): Promise<void> {
    for (const block of formFields) {
        if (isGroup(block)) {
            await loadGroup(uid, block);
            for (const [key, field] of Object.entries(block)) {
                if (key !== 'meta') {
                    await loadField(uid, field as Field, block, saveToLocal, saveToCloud);
                }
            }
        } else {
            await loadField(uid, block, undefined, saveToLocal, saveToCloud);
        }
    }
}