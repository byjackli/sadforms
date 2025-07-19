<script lang="ts">
    import { onMount } from "svelte";
    import Form from "$lib/components/Form.svelte";
    import type { Value } from "$lib/types/Form";
    import EditControls from "./EditControls.svelte";
    import AddFieldControls from "./AddFieldControls.svelte";
    
    import SadForms from "../../store/SadForms";

    export let togglePanel: Function;
    export let swapView: Function;
    export let setMain: Function;
    export let debugData: string = null;
    export let open: boolean;

    let main: any = undefined;
    let editControls: any = undefined;

    $: data = $SadForms.data;
    $: formOnInput = data.onInput as ((formData: Record<string, Value>) => void) | undefined;
    $: formOnSubmit = data.onSubmit as ((formData: Record<string, Value>, formId: string) => void | Promise<void>) | undefined;

    /**
     * Handles form loading and initializes edit controls
     */
    function handleFormLoad(): void {
        if (editControls) {
            editControls.loadEditControls();
        }
    }

    /**
     * Reloads the form and edit controls
     */
    function reload(): void {
        if (main) {
            main.reload();
        }
        // Edit controls will be reloaded automatically via handleFormLoad
    }

    // Expose the main component for external access
    onMount(() => {
        setMain({ reload });
    });
</script>

{#if $SadForms}
    <!-- Pure Preview Form -->
    <Form
        bind:this={main}
        bind:debugData
        {...data}
        onInput={formOnInput}
        onSubmit={formOnSubmit}
        afterFormLoad={handleFormLoad}
    />
    
    <!-- Edit Controls Overlay -->
    <EditControls 
        bind:this={editControls}
        {togglePanel}
        {swapView}
        {main}
        {open}
    />
    
    <!-- Add Field Controls -->
    <AddFieldControls 
        main={{ reload }}
    />
{/if}

<!-- Styles are handled by global CSS in /static/css/styles.css -->