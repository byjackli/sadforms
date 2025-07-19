<script lang="ts">
    import { onMount } from "svelte";
    import { editControlsService } from "./services/editControlsService";
    import SadForms, {
        setRefresh,
        updateEditing,
        updateForm,
        updateSave,
    } from "../../store/SadForms";

    export let togglePanel: Function;
    export let swapView: Function;
    export let main: any;
    export let open: boolean;

    $: data = $SadForms.data;

    /**
     * Handles field modification actions (edit, delete, settings)
     */
    function handleFieldAction(fieldid: string, groupid: string | undefined, action: string): void {
        if (action === "edit") {
            if (!open) togglePanel();
            updateEditing({ fieldid, groupid });
            swapView("edit");
            setRefresh(true);
        } else if (action === "delete") {
            if (open) togglePanel();
            if (groupid === undefined) {
                delete data.fields[fieldid];
            } else {
                delete data.fields[groupid][fieldid];
                if (Object.keys(data.fields[groupid]).length === 1) {
                    delete data.fields[groupid];
                }
            }
            updateForm(data);
            updateSave();
            main.reload();
        } else if (action === "title") {
            if (!open) togglePanel();
            swapView("settings");
        }
    }

    /**
     * Creates edit control elements using a more reliable DOM approach
     */
    function createEditControlElements(): void {
        const formElements = editControlsService.parseFormElements();
        
        formElements.forEach(formElement => {
            const container = document.createElement('div');
            container.className = 'modify-block';
            
            if (formElement.isTitle) {
                // Create settings button
                const button = createButton('settings', 'button modify-title', () => {
                    handleFieldAction(formElement.fieldid, formElement.groupid, 'title');
                });
                container.appendChild(button);
            } else {
                // Create edit and delete buttons
                const editButton = createButton('edit', 'button modify-edit', () => {
                    handleFieldAction(formElement.fieldid, formElement.groupid, 'edit');
                });
                const deleteButton = createButton('delete_forever', 'button modify-delete', () => {
                    handleFieldAction(formElement.fieldid, formElement.groupid, 'delete');
                });
                container.appendChild(editButton);
                container.appendChild(deleteButton);
            }
            
            formElement.element.appendChild(container);
        });
    }
    
    /**
     * Creates a button element with icon and event handlers
     */
    function createButton(iconName: string, className: string, onClick: () => void): HTMLElement {
        const button = document.createElement('div');
        const icon = document.createElement('span');
        
        button.className = className;
        button.setAttribute('role', 'button');
        button.setAttribute('tabindex', '0');
        
        icon.className = 'material-icons';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = iconName;
        
        button.appendChild(icon);
        
        // Add click handler
        button.addEventListener('click', (event) => {
            event.preventDefault();
            onClick();
        });
        
        // Add keyboard handler
        button.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick();
            }
        });
        
        return button;
    }

    /**
     * Loads edit controls for all form fields
     */
    function loadEditControls(): void {
        // Remove existing edit controls first
        editControlsService.removeExistingControls();
        // Create new edit controls
        createEditControlElements();
    }

    /**
     * Initialize edit controls when component mounts
     */
    onMount(() => {
        loadEditControls();
    });

    /**
     * Expose loadEditControls for external use
     */
    export { loadEditControls };
</script>

<!-- This component manages edit controls by creating DOM elements -->
<!-- and attaching them to form elements programmatically -->