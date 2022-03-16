<script lang="ts">
    import { onMount } from "svelte";
    import SadForms, { loadForm } from "../store/SadForms";

    import Editor from "../components/Edit/Editor.svelte";
    import Loading from "../components/Loading.svelte";

    $: SadForm = undefined;
    onMount(() => {
        const hash = window.location.hash,
            decoded = decodeURIComponent(hash.slice(1, hash.length));

        let uid = decoded[36] === "|" ? decoded.slice(0, 36) : "sample";

        loadForm(uid);
        SadForm = $SadForms;
    });
</script>

{#if SadForm}
    <Editor />
{:else}
    <Loading />
{/if}
