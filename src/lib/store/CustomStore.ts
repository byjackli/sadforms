import { writable } from 'svelte/store';
import { belongs } from '../tools/kit'

const names = {
    warn: 'warn',
    redact: 'redact',
    label: 'label',
    blockHeader: 'form:block/',
    visualHeader: 'form:visual/',
    inputHeader: 'form:input/',
    inputFeedback: 'form:input-feedback/',
    inputPreview: 'form:input-preview/',
    groupHeader: 'form:group/',
    groupFeedback: 'form:group-feedback/',
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