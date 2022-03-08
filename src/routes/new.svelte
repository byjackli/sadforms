<script lang="ts">
    import { onMount } from "svelte";
    import SadForms, { loadEmpty } from "../store/SadForms";

    import Editor from "../components/Editor.svelte";
    import Loading from "../components/Loading.svelte";

    $: SadForm = undefined;
    onMount(() => {
        loadEmpty();
        SadForm = $SadForms;
    });
</script>

{#if SadForm}
    <Editor />
{:else}
    <Loading />
{/if}
