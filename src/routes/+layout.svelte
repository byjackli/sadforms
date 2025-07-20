<script lang="ts">
    import NavMain from "../components/Navbar.svelte";
    import NavDocs from "../components/Docs/Navbar.svelte";
    import { page } from '$app/stores';

    $: home = $page.data.home;
    $: doc = $page.data.doc;

    $: path = home;
    $: hash = doc;
</script>

{#if !(path === "/")}<NavMain {path} {hash} />{/if}
{#if path.match(/(\/docs)+\/*\b(?![%])/)} <NavDocs />{/if}

<slot />
