import { writable } from 'svelte/store';
import { belongs, janitor } from '../tools/kit'
import type { Database } from '../types/Form'

const stored: Database = {};

export const FormStore = writable({ ...stored });

function getFieldPropValue(formid: string, prop: string): Record<string, any> {
    if (!belongs(stored[formid], prop)) throw "[FormStore] stored does not have this property!";
    return stored[formid][prop];
}

export function updateSave(formid: string, saveToLocal: boolean, saveToCloud: boolean): void {
    if (!saveToLocal) return;
    
    const { data } = stored[formid];    
    localStorage.setItem(`[SadForms]:${formid}`, JSON.stringify(data));
}
export function clearSave(formid: string, saveToLocal: boolean, saveToCloud: boolean): void {
    if (saveToLocal) localStorage.removeItem(`[SadForms]:${formid}`);
}
export function loadSave(formid: string, saveToLocal: boolean, saveToCloud: boolean, forceReset: boolean = false): void {
    if (!stored[formid] || forceReset) {
        stored[formid] = {
            submit: { submitting: false, accepted: false, attempted: false },
            data: {},
            dontSave: {},
            required: {},
            onInput: {},
            validity: {},
            verdict: {},
            preview: {},
            redact: {},
            touched: {},
            value: {},
            active: {},
            group: {}
        }
    }
    if (saveToLocal && !forceReset) {
        const saveData = localStorage.getItem(`[SadForms]:${formid}`);
        if (saveData) stored[formid].data = JSON.parse(saveData);
    }
}

// Type definitions for manageFieldStorage
type ManageFieldStorageAction = "set" | "init" | "get" | "exists";
type ManageFieldStoragePayload = {
    action: ManageFieldStorageAction;
    data?: any;
    dontSave?: boolean;
};

/**
 * Clears a field from specified storage type, handling both grouped and ungrouped fields
 * @param formid - Form identifier
 * @param storageType - Storage type ("data" or "dontSave")
 * @param fieldid - Field identifier
 * @param groupid - Optional group identifier
 */
export function clearFieldFromStorage(formid: string, storageType: string, fieldid: string, groupid?: string): void {
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
 * @param payload - Field data payload
 * @param dontSaveExists - Whether field currently exists in dontSave storage (fallback only)
 * @returns Boolean indicating whether to use dontSave storage
 */
function getStorageRouting(payload: ManageFieldStoragePayload, dontSaveExists: boolean): boolean {
    // Payload.dontSave comes from immutable field configuration - always trust it
    return payload.dontSave !== undefined ? payload.dontSave : dontSaveExists;
}

/**
 * Manages field data storage with support for sensitive data routing.
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
    const dontSaveExists = hasFieldProp(uid, "dontSave", fieldid, groupid);
    const useDontSave = getStorageRouting(payload, dontSaveExists);

    switch (payload.action) {
        case "set":
        case "init":
            return handleSetAction(uid, payload, fieldid, groupid, useDontSave);
        
        case "get":
            return handleGetAction(uid, fieldid, groupid, useDontSave);
        
        case "exists":
            return handleExistsAction(uid, fieldid, groupid, useDontSave);
        
        default:
            throw new Error(`[manageFieldStorage] Unknown action: ${payload.action}`);
    }
}

function handleSetAction(uid: string, payload: ManageFieldStoragePayload, fieldid: string, groupid: string | undefined, useDontSave: boolean): any {
    return useDontSave
        ? setFieldProp(uid, "dontSave", { dontSave: true, data: payload.data }, fieldid, groupid)
        : setFieldProp(uid, "data", payload.data, fieldid, groupid);
}

function handleGetAction(uid: string, fieldid: string, groupid: string | undefined, useDontSave: boolean): any {
    return useDontSave
        ? getFieldProp(uid, "dontSave", fieldid, groupid)?.data
        : getFieldProp(uid, "data", fieldid, groupid);
}

function handleExistsAction(uid: string, fieldid: string, groupid: string | undefined, useDontSave: boolean): boolean {
    return useDontSave
        ? hasFieldProp(uid, "dontSave", fieldid, groupid)
        : hasFieldProp(uid, "data", fieldid, groupid);
}
export function hasFieldProp(formid: string, prop: string, fieldid: string, groupid?: string): boolean {
    const slot: Record<string, unknown> = getFieldPropValue(formid, prop);
    if (groupid === undefined) return belongs(slot, fieldid);
    return belongs(slot, groupid) && belongs(slot[groupid], fieldid);
}

export function setFieldProp(formid: string, prop: string, data: unknown, fieldid: string, groupid?: string): any {
    const slot: Record<string, unknown> = getFieldPropValue(formid, prop)
    if (slot === undefined) return undefined

    if (groupid !== undefined) {
        if (!belongs(slot, groupid)) slot[groupid] = {};
        slot[groupid][fieldid] = data;
    } else slot[fieldid] = data;

    FormStore.update(() => ({ ...stored }))
    return data;
}

export function getFieldProp(formid: string, prop: string, fieldid?: string, groupid?: string): any {
    const slot: Record<string, unknown> = getFieldPropValue(formid, prop);
    if (slot === undefined) return undefined

    if (fieldid === undefined) return slot
    if (groupid !== undefined) return hasFieldProp(formid, prop, groupid) ? slot[groupid][fieldid] : undefined
    return hasFieldProp(formid, prop, fieldid) ? slot[fieldid] : undefined
}

export function clearProp(formid: string, asap?: boolean, prop?: string, fieldid?: string, groupid?: string): boolean {
    const slot: Record<string, unknown> = getFieldPropValue(formid, prop)
    if (slot === undefined) return false

    if (prop === undefined) janitor(stored[formid], asap)
    else if (fieldid === undefined) janitor(slot, asap)
    else if (groupid === undefined) janitor(slot[fieldid], asap)
    else janitor(slot[groupid][fieldid], asap)

    return true;
}

export default FormStore;