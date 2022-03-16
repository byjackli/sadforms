<script lang="ts">
    import { onMount } from "svelte";
    import SadForms, { loadForm } from "../store/SadForms";

    import Loading from "../components/Loading.svelte";
    import Form from "$lib/components/Form.svelte";

    $: SadForm = undefined;
    onMount(() => {
        const hash = window.location.hash,
            decoded = decodeURIComponent(hash.slice(1, hash.length));

        let uid = decoded[36] === "|" ? decoded.slice(0, 36) : "sample";

        loadForm(uid);
        SadForm = $SadForms.data;
    });
</script>

<main id="preview" class="fwfh">
    {#if SadForm}
        <Form {...SadForm} />
    {:else}
        <Loading />
    {/if}
</main>
