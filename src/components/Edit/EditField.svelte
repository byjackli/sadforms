<script lang="ts">
    import type { SvelteComponent } from "svelte";
    import type { Edit, Field, Group } from "$lib/types/Form";
    import Form from "$lib/components/Form.svelte";

    import SadForms, {
        checkFunc,
        reviver,
        setRefresh,
        updateForm,
        updateSave,
    } from "../../store/SadForms";
    import {
        clearFieldFromStorage,
        updateSave as updateFormSave,
        hasFieldValue,
        getFieldValue,
        setFieldValue,
        clearSave,
    } from "$lib/store/FormFieldStore";
    import { setRedact } from "$lib/store/FormConfigStore";
    import { FormProps } from "$lib/constants";
    import {
        makeToOptions,
        newType,
        parseHide,
    } from "../../presets";
    import { belongs, uuidV4 } from "$lib/tools/kit";
    
    // Import the form builder services
    import { fieldConfigService } from "./services/fieldConfigService";
    import { formBuilderService } from "./services/formBuilderService";

    export let main: SvelteComponent;

    let maData: Record<string, string>, maValue: string;

    $: data = $SadForms.data;
    $: fieldid = $SadForms.editing.fieldid;
    $: groupid = $SadForms.editing.groupid;
    $: fields = $SadForms && fieldid && data && generateFieldConfig();

    /**
     * Generates field configuration using the new service
     */
    function generateFieldConfig(): Record<string, Field> {
        if (!fieldid || !data || !data.fields) return {};
        
        const field = groupid 
            ? data.fields[groupid]?.[fieldid] 
            : data.fields[fieldid];
        
        if (!field) return {};
        
        return fieldConfigService.generateFieldConfig(field);
    }

    /**
     * Generates group configuration using the new service
     */
    function generateGroupConfig(): Record<string, Field> {
        if (!groupid || !data || !data.fields) return {};
        
        const group = data.fields[groupid] as Group;
        if (!group) return {};
        
        return fieldConfigService.generateGroupConfig(group, maData, handleDropdownSubmit);
    }
    
    /**
     * Handles dropdown field submission for adding new fields to group
     */
    function handleDropdownSubmit(target: any) {
        if (!target.submit) return;

        maData = target.value;
        maValue = Object.values(maData)[0];
        const uid = uuidV4();
        const group = data.fields[groupid];

        data.fields[groupid] = {
            ...group,
            [uid]: newType(maValue, uid),
        };
        updateForm(data);
        updateSave();
        main.reload();
    }

    /**
     * Handles group input changes
     */
    function handleGroupInput(details: any): void {
        if (!details || !details.fieldValues) return;
        
        const formData = details.fieldValues;
        let base = data.fields[groupid] as Group;
        
        // Clean up form data
        if (belongs(formData, "header")) delete formData.header;
        if (belongs(formData, "dropdown")) delete formData.dropdown;

        // The dropdown field addition is handled by the field's own onInput function
        // in the form configuration, not here

        // Update group metadata
        base.meta = { ...base.meta, ...formData };
        base.meta.override = parseHide(base.meta.override, true);

        updateForm(data);
        updateSave(data);
        main.reload();
    }

    /**
     * Handles field input changes
     */
    function handleFieldInput(details: any): void {
        const formData = details.fieldValues || {};

        if (!formData || Object.keys(formData).length === 0) {
            console.error("onInput called with no field values:", details);
            return;
        }

        let base: Field | Group | Record<string, Field | Group> = groupid
                ? data.fields[groupid]
                : data.fields,
            originalEdit: Edit;

        // Preserve existing edit configuration
        if (base[fieldid]?.edit) {
            originalEdit = {
                add: false,
                remove: false,
                limit: "undefined",
                persist: false,
                ...base[fieldid].edit,
            };
        }

        // Update field data
        base[fieldid] = formData;
        const newDontSave = formData.dontSave;

        // Handle dontSave field changes
        const formId = data.uid;
        const hasDataInRegular = hasFieldValue(formId, FormProps.FIELD_VALUES, fieldid, groupid);
        const hasDataInSensitive = hasFieldValue(formId, FormProps.DONT_SAVE, fieldid, groupid);

        if (newDontSave && hasDataInRegular) {
            const currentValue = getFieldValue(formId, FormProps.FIELD_VALUES, fieldid, groupid);
            clearFieldFromStorage(formId, FormProps.FIELD_VALUES, fieldid, groupid);

            if (currentValue !== undefined && currentValue !== "") {
                setFieldValue(formId, FormProps.DONT_SAVE, String(currentValue), fieldid, groupid);
            }
            updateFormSave(formId);
        } else if (!newDontSave && hasDataInSensitive) {
            const currentValue = getFieldValue(formId, FormProps.DONT_SAVE, fieldid, groupid);
            clearFieldFromStorage(formId, FormProps.DONT_SAVE, fieldid, groupid);

            if (currentValue !== undefined && currentValue !== "") {
                setFieldValue(formId, FormProps.FIELD_VALUES, String(currentValue), fieldid, groupid);
            }
            updateFormSave(formId);
        }

        // Clean up form data
        if (belongs(base[fieldid], "header")) delete base[fieldid].header;

        // Handle autocomplete
        if (formData.autocomplete && typeof formData.autocomplete !== "string") {
            base[fieldid].autocomplete = Object.values(formData.autocomplete)[0];
        }

        // Handle function fields
        if (formData.onInput && checkFunc(formData.onInput).validFunc.check) {
            base[fieldid].onInput = reviver("onInput", formData.onInput);
        } else {
            delete base[fieldid].onInput;
        }

        if (formData.validity && checkFunc(formData.validity, "Rule").validFunc.check) {
            base[fieldid].validity = reviver("validity", formData.validity);
        } else {
            delete base[fieldid].validity;
        }

        // Handle options for dropdown fields
        if (formData.options) {
            const opts = Array.isArray(formData.options)
                ? formData.options
                : makeToOptions(formData.options);

            // Remove 'add' options
            const cleanOpts = opts.filter((opt: any) => opt.uid !== "add");
            base[fieldid].options = cleanOpts;

            // Handle edit configuration
            if (formData.edit && originalEdit) {
                base[fieldid].edit = {
                    add: formBuilderService.convertEditValue(formData.edit.add, originalEdit.add),
                    remove: formBuilderService.convertEditValue(formData.edit.remove, originalEdit.remove),
                    limit: formBuilderService.convertEditValue(formData.edit.limit, originalEdit.limit),
                    persist: !!formData.edit.persist,
                };
            }
        }

        // Handle field properties
        base[fieldid].hide = parseHide(base[fieldid].hide, true);
        base[fieldid].spellcheck = !!base[fieldid].spellcheck;

        updateForm(data);
        updateSave(data);

        // Handle redaction
        if (!formData.redact) {
            setRedact(formId, false, fieldid, groupid);
            const actualValue = getFieldValue(formId, FormProps.FIELD_VALUES, fieldid, groupid);
            setFieldValue(formId, FormProps.DISPLAY_VALUES, actualValue, fieldid, groupid);
        }

        main.reload();
    }
</script>

<!-- Group Configuration Form -->
{#if groupid}
    <Form
        uid="group"
        title="Group Settings"
        caption="Some fields are temporarily disabled."
        hide={{ title: true, caption: true, submit: true, reset: true }}
        autocomplete={false}
        onInput={handleGroupInput}
        fields={$SadForms && generateGroupConfig()}
        afterFormLoad={(refresh) => {
            if ($SadForms.refresh) {
                refresh(true);
                main.reload();
            }
        }}
    />
{/if}

<!-- Field Configuration Form -->
{#key `${fieldid}-${groupid}`}
<Form
    uid={`edit-${fieldid}-${groupid || 'root'}`}
    title="edit"
    caption="Some fields are temporarily disabled."
    hide={{ title: true, caption: true, submit: true, reset: true }}
    autocomplete={false}
    onInput={handleFieldInput}
    {fields}
    afterFormLoad={(refresh) => {
        // Only clear localStorage, but preserve in-memory form state
        clearSave(`edit-${fieldid}-${groupid || 'root'}`);

        // Load all field values from defaultValue in configuration
        Object.entries(fields).forEach(([, field]) => {
            if (field.defaultValue !== undefined) {
                const { defaultValue } = field;
                setFieldValue(
                    `edit-${fieldid}-${groupid || 'root'}`,
                    FormProps.FIELD_VALUES,
                    defaultValue,
                    field.uid,
                );
                setFieldValue(
                    `edit-${fieldid}-${groupid || 'root'}`,
                    FormProps.DISPLAY_VALUES,
                    defaultValue,
                    field.uid,
                );
            }
        });

        if ($SadForms.refresh) {
            setRefresh(false);
            refresh(true);
            main.reload();
        }
    }}
/>
{/key}