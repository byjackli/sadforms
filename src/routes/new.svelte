<script lang="ts">
    import { onMount } from "svelte";
    import SadForms, { loadEmpty } from "../store/SadForms";

    import Editor from "../components/Edit/Editor.svelte";
    import Loading from "../components/Loading.svelte";

    $: SadForm = undefined;
    onMount(() => {
        loadEmpty();
        SadForm = $SadForms;
    });
</script>

<svelte:head>
    <title>✍ {$SadForms?.data?.title} - Sad Forms</title>
</svelte:head>

{#if SadForm}
    <Editor />
{:else}
    <Loading />
{/if}
