<script lang="ts">
    import NavMain from "../components/Navbar.svelte";
    import NavDocs from "../components/Docs/Navbar.svelte";
    import { page } from '$app/stores';

    const home = $derived($page.data.home);
    const doc = $derived($page.data.doc);

    const path = $derived(home);
    const hash = $derived(doc);
</script>

{#if !(path === "/")}<NavMain {path} {hash} />{/if}
{#if path.match(/(\/docs)+\/*\b(?![%])/)} <NavDocs />{/if}

<slot />
