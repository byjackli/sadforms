/**
 * Field management service extracted from Form.svelte
 * Handles field and group initialization and updates
 */

import { setFieldProp, getFieldProp, manageFieldStorage } from '../store/FormStore';
import { loadBlank } from '../utils/formHelpers';
import type { Field, Group } from '../types/Form';

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
        const data = field.defaultValue !== undefined && field.defaultValue !== null
            ? field.defaultValue
            : loadBlank(field.type);
        manageFieldStorage(
            uid,
            { dontSave, action: "init", data },
            field.uid,
            g?.uid
        );
        setFieldProp(uid, "value", data, field.uid, g?.uid);
    }
    
    if (field.onInput)
        setFieldProp(uid, "onInput", field.onInput, field.uid, g?.uid);

    if (field.redact || (g && g.redact)) {
        setFieldProp(
            uid,
            "redact",
            { redact: true, data: field.redact || g.redact },
            field.uid,
            g?.uid
        );
    }

    if (field.required || (g && g.required)) {
        setFieldProp(uid, "required", true, field.uid, g?.uid);
    }

    if (field.validity)
        setFieldProp(uid, "validity", field.validity, field.uid, g?.uid);
}

/**
 * Loads and initializes a field group
 */
export async function loadGroup(uid: string, group: Group): Promise<void> {
    setFieldProp(uid, "group", group.meta, group.meta.uid);
}

/**
 * Loads all fields in the fieldsArr
 */
export async function loadAllFields(
    uid: string,
    fieldsArr: any[],
    saveToLocal: boolean = true,
    saveToCloud: boolean = false
): Promise<void> {
    fieldsArr.forEach((block) => {
        if (block.meta) {
            Object.values(block).forEach((field: any, i) => {
                if (i) loadField(uid, field, block, saveToLocal, saveToCloud);
                else loadGroup(uid, block);
            });
        } else loadField(uid, block, undefined, saveToLocal, saveToCloud);
    });
}