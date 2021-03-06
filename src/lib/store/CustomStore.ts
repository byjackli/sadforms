import { writable } from 'svelte/store';
import { belongs } from '../tools/kit'

const names = {
    warn: 'warn',
    notEmpty_safe: "notEmpty_safe",
    redact: 'redact',
    label: 'sf:label/',
    blockHeader: 'sf:block/',
    visualHeader: 'sf:visual/',
    inputHeader: 'sf:input/',
    inputFeedback: 'sf:input-feedback/',
    inputPreview: 'sf:input-preview/',
    groupHeader: 'sf:group/',
    groupFeedback: 'sf:group-feedback/',
    optionHeader: 'option'
},
    icons = {
        tooltip: 'tips_and_updates'
    };

export const CustomStore = writable({ names, icons });

export function changeName(type: string, name: string): boolean {
    if (!belongs(names, type)) return false

    names[type] = name
    CustomStore.update(() => ({ names, icons }))

    return true
}

export default CustomStore;