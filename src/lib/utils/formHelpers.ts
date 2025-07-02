/**
 * Form utility functions extracted from Form.svelte
 * Contains pure helper functions with no component dependencies
 */

import { FIELD_TYPES, OPTION_FIELD_TYPES, DEFAULTS } from '../constants';

/**
 * Generates blank/default values for different field types
 */
export function loadBlank(type: string): any {
    if (OPTION_FIELD_TYPES.includes(type as any)) return DEFAULTS.BLANK_OPTIONS;
    else if (type === FIELD_TYPES.CHECKBOX) return DEFAULTS.BLANK_CHECKBOX;
    else if (type === FIELD_TYPES.FILE) return DEFAULTS.BLANK_FILE;
    else return DEFAULTS.BLANK_TEXT;
}

/**
 * Converts a File object to base64 string
 */
export async function getBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
}

/**
 * Processes FileList into array of base64 data with metadata
 */
export async function getData(input: FileList): Promise<Array<{base64: string, meta: any}>> {
    const arr: Array<{base64: string, meta: any}> = [];

    for (const file of input) {
        const meta = {
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified,
            },
            base64 = await getBase64(file);
        arr.push({ base64, meta });
    }

    return arr;
}

/**
 * Converts base64 string to Blob object
 */
export async function getBlob(base64: string): Promise<Blob> {
    const res = await fetch(base64),
        blob = await res.blob();
    return blob;
}

/**
 * Checks if a field value is considered empty
 */
export function checkEmpty(value: any, fieldType?: string): boolean {
    if (value === undefined || value === null) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (fieldType === FIELD_TYPES.FILE && !value) return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (typeof value === 'object' && Object.keys(value).length === 0) return true;
    return false;
}

/**
 * Validates field value based on type and requirements
 */
export function validateFieldValue(value: any, field: any): boolean {
    if (field.required && checkEmpty(value, field.type)) return false;
    // Add more validation logic as needed
    return true;
}