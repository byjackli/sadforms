import { writable } from "svelte/store"
const dropdown = {
    listening: false,
    expanded: false,
    id: undefined,
    callback: undefined
}

export const DropdownStore = writable({ ...dropdown });

function clickListener(event: KeyboardEvent | MouseEvent): void {
    const closest = (event.target as HTMLElement).closest(".dropdown-container")
    if (!closest || closest.getAttribute("id") !== dropdown.id) {
        updateDropdown(false, undefined)
    }
}

export function updateCallback(callback: Function): void {
    dropdown.callback = callback
    DropdownStore.update(() => ({ ...dropdown }))
}

export function updateDropdown(status: boolean, id: string): void {
    if (dropdown.callback) dropdown.callback(status);

    if (!dropdown.listening) {
        window.addEventListener("keydown", clickListener);
        window.addEventListener("click", clickListener);
    }
    else {
        window.removeEventListener("keydown", clickListener);
        window.removeEventListener("click", clickListener);
    }

    dropdown.listening = status;
    dropdown.expanded = status;
    dropdown.id = id

    DropdownStore.update(() => ({ ...dropdown }))
}

export default DropdownStore;