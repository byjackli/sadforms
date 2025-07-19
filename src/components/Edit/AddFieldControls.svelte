<script lang="ts">
    import Form from "$lib/components/Form.svelte";
    import { uuidV4 } from "$lib/tools/kit";
    import { newType } from "../../presets";
    import SadForms, { updateForm, updateSave } from "../../store/SadForms";

    export let main: any;

    $: data = $SadForms.data;

    /**
     * Form configuration for adding new fields
     */
    const addFieldForm = {
        uid: "add-field",
        title: "Add New Field",
        hide: { title: true, caption: true, submit: true, reset: true },
        autocomplete: false,
        fields: {
            fieldType: {
                uid: "fieldType",
                name: "create new field",
                type: "dropdown",
                placeholder: "create new field",
                options: [
                    { uid: "textarea", name: "textarea" },
                    { uid: "text", name: "text" },
                    { uid: "email", name: "email" },
                    { uid: "tel", name: "tel" },
                    { uid: "password", name: "password" },
                    { uid: "number", name: "number" },
                    { uid: "dropdown", name: "dropdown" },
                    { uid: "checkbox", name: "checkbox" },
                    { uid: "switch", name: "switch" },
                    { uid: "file", name: "file" },
                    { uid: "time", name: "time" },
                    { uid: "group", name: "group" },
                    { uid: "divider", name: "divider" },
                ],
            }
        }
    };

    /**
     * Handles adding a new field when dropdown is selected
     */
    function handleAddField(details: any): void {
        if (!details?.fieldValues?.fieldType) return;

        const fieldTypeValue = details.fieldValues.fieldType;
        
        // Extract the actual field type string from the dropdown selection
        // The dropdown returns an object, so we need to get the first value
        const fieldType = typeof fieldTypeValue === 'object' 
            ? Object.values(fieldTypeValue)[0] 
            : fieldTypeValue;
            
        if (!fieldType || typeof fieldType !== 'string') {
            console.error('Invalid field type selected:', fieldTypeValue);
            return;
        }

        const uid = uuidV4();

        // Create new field using the field type string
        data.fields[uid] = newType(fieldType, uid);
        
        // Update form and save
        updateForm(data);
        updateSave();
        
        // Reload the main form to show the new field
        main.reload();
    }
</script>

<div class="form-container">
    <div class="sf modify-add">
        <Form
            {...addFieldForm}
            onInput={handleAddField}
        />
    </div>
</div>

<!-- Styles are handled by global CSS in /static/css/styles.css -->