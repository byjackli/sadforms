import { writable } from 'svelte/store';
import { belongs, janitor } from '../tools/kit'
import type { Database } from '../types/Form'

const stored: Database = {};

export const FormStore = writable({ ...stored });

function lookup(formid: string, entry: string): Record<string, any> {
    if (!belongs(stored[formid], entry)) throw "[FormStore] stored does not have this property!";
    return stored[formid][entry];
}

export function updateSave(formid: string, saveToLocal: boolean, saveToCloud: boolean): void {
    const { data } = stored[formid];

    if (saveToLocal)
        localStorage.setItem(`[SadForms]:${formid}`, JSON.stringify(data));
}
export function clearSave(formid: string, saveToLocal: boolean, saveToCloud: boolean): void {
    if (saveToLocal) localStorage.removeItem(`[SadForms]:${formid}`);
}
export function loadSave(formid: string, saveToLocal: boolean, saveToCloud: boolean, clean: boolean = false): void {
    if (!stored[formid] || clean) {
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
    if (saveToLocal && !clean) {
        const saveData = localStorage.getItem(`[SadForms]:${formid}`);
        if (saveData) stored[formid].data = JSON.parse(saveData);
    }
}

export function existsEntry(formid: string, entry: string, fieldid: string, groupid?: string): boolean {
    const slot: Record<string, unknown> = lookup(formid, entry);
    if (groupid === undefined) return belongs(slot, fieldid);
    return belongs(slot, groupid) && belongs(slot[groupid], fieldid);
}

export function setEntry(formid: string, entry: string, data: unknown, fieldid: string, groupid?: string): any {
    const slot: Record<string, unknown> = lookup(formid, entry)
    if (slot === undefined) return undefined

    if (groupid !== undefined) {
        if (!belongs(slot, groupid)) slot[groupid] = {};
        slot[groupid][fieldid] = data;
    } else slot[fieldid] = data;

    FormStore.update(() => ({ ...stored }))
    return data;
}

export function getEntry(formid: string, entry: string, fieldid?: string, groupid?: string): any {
    const slot: Record<string, unknown> = lookup(formid, entry);
    if (slot === undefined) return undefined

    if (fieldid === undefined) return slot
    if (groupid !== undefined) return existsEntry(formid, entry, groupid) ? slot[groupid][fieldid] : undefined
    return existsEntry(formid, entry, fieldid) ? slot[fieldid] : undefined
}

export function clearEntry(formid: string, asap?: boolean, entry?: string, fieldid?: string, groupid?: string): boolean {
    const slot: Record<string, unknown> = lookup(formid, entry)
    if (slot === undefined) return false

    if (entry === undefined) janitor(stored[formid], asap)
    else if (fieldid === undefined) janitor(slot, asap)
    else if (groupid === undefined) janitor(slot[fieldid], asap)
    else janitor(slot[groupid][fieldid], asap)

    return true;
}

export default FormStore;