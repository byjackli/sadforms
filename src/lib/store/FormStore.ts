import { writable } from 'svelte/store';
import { belongs, janitor } from '../tools/kit'
import type { Database } from '../types/Form'
import { STORAGE_KEY_PREFIX, FormProps, STORAGE_ACTIONS, ERROR_MESSAGES } from '../constants'

const stored: Database = {};

export const FormStore = writable({ ...stored });

function getFieldPropValue(formid: string, prop: FormProps): Record<string, any> {
    if (!belongs(stored[formid], prop)) throw ERROR_MESSAGES.FORM_STORE_MISSING_PROP;
    return stored[formid][prop];
}

export function updateSave(formid: string, saveToLocal: boolean, saveToCloud: boolean): void {
    if (!saveToLocal) return;

    const { fieldValues } = stored[formid];
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${formid}`, JSON.stringify(fieldValues));
}
export function clearSave(formid: string, saveToLocal: boolean, saveToCloud: boolean): void {
    if (saveToLocal) localStorage.removeItem(`${STORAGE_KEY_PREFIX}${formid}`);
}
export function loadSave(formid: string, saveToLocal: boolean, saveToCloud: boolean, forceReset: boolean = false): void {
    if (!stored[formid] || forceReset) {
        stored[formid] = {
            submit: { submitting: false, accepted: false, attempted: false },
            dontSave: {},
            required: {},
            onInput: {},
            validity: {},
            verdict: {},
            preview: {},
            redact: {},
            touched: {},
            fieldValues: {},
            displayValues: {},
            active: {},
            group: {}
        }
    }
    if (saveToLocal && !forceReset) {
        const saveFieldValue = localStorage.getItem(`${STORAGE_KEY_PREFIX}${formid}`);
        if (saveFieldValue) stored[formid].fieldValues = JSON.parse(saveFieldValue);
    }
}

// Type definitions for manageFieldStorage
type ManageFieldStorageAction = "set" | "init" | "get" | "exists";
type ManageFieldStoragePayload = {
    action: ManageFieldStorageAction;
    fieldValue?: any;
    dontSave?: boolean;
};
type StorageTypes = FormProps.FIELD_VALUES | FormProps.DONT_SAVE;

/**
 * Clears a field from specified storage type, handling both grouped and ungrouped fields
 * @param formid - Form identifier
 * @param storageType - Storage type ("fieldValues" or "dontSave")
 * @param fieldid - Field identifier
 * @param groupid - Optional group identifier
 */
export function clearFieldFromStorage(formid: string, storageType: StorageTypes, fieldid: string, groupid?: string): void {
    try {
        const slot = getFieldPropValue(formid, storageType);

        if (groupid !== undefined) {
            if (slot[groupid]) {
                delete slot[groupid][fieldid];
            }
        } else {
            delete slot[fieldid];
        }

        FormStore.update(() => ({ ...stored }));
    } catch (error) {
        // Storage doesn't exist yet, which is fine
    }
}

/**
 * Determines storage routing based on field configuration
 * Always uses payload.dontSave when provided (immutable field config)
 * Only falls back to storage history when no config is provided (backward compatibility)
 * @param payload - Field fieldValue payload
 * @param dontSaveExists - Whether field currently exists in dontSave storage (fallback only)
 * @returns Boolean indicating whether to use dontSave storage
 */
function getStorageRouting(payload: ManageFieldStoragePayload, dontSaveExists: boolean): boolean {
    // Payload.dontSave comes from immutable field configuration - always trust it
    return payload.dontSave !== undefined ? payload.dontSave : dontSaveExists;
}

/**
 * Manages field fieldValue storage with support for sensitive data routing.
 * 
 * @param uid - Form identifier
 * @param payload - Action payload containing action type, data, and dontSave flag
 * @param fieldid - Field identifier
 * @param groupid - Optional group identifier for grouped fields
 * @returns Stored data for set/init, retrieved data for get, existence boolean for exists
 * 
 */
export function manageFieldStorage(uid: string, payload: ManageFieldStoragePayload, fieldid: string, groupid?: string): any {
    // Determine storage routing based on current configuration
    const dontSaveExists = hasFieldProp(uid, FormProps.DONT_SAVE, fieldid, groupid);
    const useDontSave = getStorageRouting(payload, dontSaveExists);

    switch (payload.action) {
        case STORAGE_ACTIONS.SET:
        case STORAGE_ACTIONS.INIT:
            return handleSetAction(uid, payload, fieldid, groupid, useDontSave);

        case STORAGE_ACTIONS.GET:
            return handleGetAction(uid, fieldid, groupid, useDontSave);

        case STORAGE_ACTIONS.EXISTS:
            return handleExistsAction(uid, fieldid, groupid, useDontSave);

        default:
            throw new Error(`[manageFieldStorage] ${ERROR_MESSAGES.UNKNOWN_STORAGE_ACTION}: ${payload.action}`);
    }
}

function handleSetAction(uid: string, payload: ManageFieldStoragePayload, fieldid: string, groupid: string | undefined, useDontSave: boolean): any {
    return useDontSave
        ? setFieldProp(uid, FormProps.DONT_SAVE, { dontSave: true, fieldValue: payload.fieldValue }, fieldid, groupid)
        : setFieldProp(uid, FormProps.FIELD_VALUES, payload.fieldValue, fieldid, groupid);
}

function handleGetAction(uid: string, fieldid: string, groupid: string | undefined, useDontSave: boolean): any {
    return useDontSave
        ? getFieldProp(uid, FormProps.DONT_SAVE, fieldid, groupid)?.fieldValue
        : getFieldProp(uid, FormProps.FIELD_VALUES, fieldid, groupid);
}

function handleExistsAction(uid: string, fieldid: string, groupid: string | undefined, useDontSave: boolean): boolean {
    return useDontSave
        ? hasFieldProp(uid, FormProps.DONT_SAVE, fieldid, groupid)
        : hasFieldProp(uid, FormProps.FIELD_VALUES, fieldid, groupid);
}
export function hasFieldProp(formid: string, prop: FormProps, fieldid: string, groupid?: string): boolean {
    const slot: Record<string, unknown> = getFieldPropValue(formid, prop);
    if (groupid === undefined) return belongs(slot, fieldid);
    return belongs(slot, groupid) && belongs(slot[groupid], fieldid);
}

export function setFieldProp(formid: string, prop: FormProps, fieldValue: unknown, fieldid: string, groupid?: string): any {
    const slot: Record<string, unknown> = getFieldPropValue(formid, prop)
    if (slot === undefined) return undefined

    if (groupid !== undefined) {
        if (!belongs(slot, groupid)) slot[groupid] = {};
        slot[groupid][fieldid] = fieldValue;
    } else slot[fieldid] = fieldValue;

    FormStore.update(() => ({ ...stored }))
    return fieldValue;
}

export function getFieldProp(formid: string, prop: FormProps, fieldid?: string, groupid?: string): any {
    const slot: Record<string, unknown> = getFieldPropValue(formid, prop);
    if (slot === undefined) return undefined

    if (fieldid === undefined) return slot
    if (groupid !== undefined) return hasFieldProp(formid, prop, groupid) ? slot[groupid][fieldid] : undefined
    return hasFieldProp(formid, prop, fieldid) ? slot[fieldid] : undefined
}

export function clearProp(formid: string, asap?: boolean, prop?: FormProps, fieldid?: string, groupid?: string): boolean {
    const slot: Record<string, unknown> = getFieldPropValue(formid, prop)
    if (slot === undefined) return false

    if (prop === undefined) janitor(stored[formid], asap)
    else if (fieldid === undefined) janitor(slot, asap)
    else if (groupid === undefined) janitor(slot[fieldid], asap)
    else janitor(slot[groupid][fieldid], asap)

    return true;
}

export default FormStore;