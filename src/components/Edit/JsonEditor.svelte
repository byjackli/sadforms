<script lang="ts">
    import Form from "$lib/components/Form.svelte";
    
    export let formData: any;
    export let replacer: (key: string, value: any) => any;
    export let onInput: (event: any) => void;

    $: jsonText = JSON.stringify(formData, replacer, 2);
    
    // Form configuration for JSON editor using SadForms
    $: jsonEditorConfig = {
        uid: "json-editor",
        title: "JSON Editor",
        hide: { title: true, caption: true, submit: true, reset: true },
        autocomplete: false,
        fields: {
            jsonContent: {
                uid: "jsonContent",
                name: "Form JSON",
                type: "textarea",
                defaultValue: jsonText,
                placeholder: "Edit your form configuration as JSON...",
                hide: { label: true },
                spellcheck: false,
                onInput: handleJsonInput,
            }
        }
    };

    function handleJsonInput(details: any): void {
        // Pass through to parent component
        if (onInput) {
            onInput({ target: { value: details.fieldValues?.jsonContent } });
        }
    }
</script>

<div class="json-editor-container">
    <Form {...jsonEditorConfig} />
</div>

<style>
    .json-editor-container {
        width: 100%;
        height: 100%;
    }
    
    /* Additional JSON editor specific styles */
    :global(.json-editor-container .sf textarea) {
        font-family: var(--code) !important;
        font-size: 0.9em;
        line-height: 1.4;
        min-height: 300px;
        white-space: pre;
        word-wrap: normal;
        overflow-wrap: normal;
    }
</style>