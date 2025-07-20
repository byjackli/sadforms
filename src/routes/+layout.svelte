<script lang="ts">
    import { default as NavMain } from "../components/Navbar.svelte";
    import { default as NavDocs } from "../components/Docs/Navbar.svelte";
    import { page } from '$app/stores';

    $: home = $page.data.home;
    $: doc = $page.data.doc;

    $: path = home;
    $: hash = doc;
</script>

{#if !(path === "/")}<NavMain {path} {hash} />{/if}
{#if path.match(/(\/docs)+\/*\b(?![%])/)} <NavDocs />{/if}

<slot />
