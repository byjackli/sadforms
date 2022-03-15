<script context="module">
    export async function load(context) {
        return { props: { home: context.url.pathname, doc: context.url.hash } };
    }
</script>

<script lang="ts">
    import { default as NavMain } from "../components/Navbar.svelte";
    import { default as NavDocs } from "../components/Docs/Navbar.svelte";

    export let home: string, doc: string;

    $: path = home;
    $: hash = doc;
</script>

{#if !(path === "/")} <NavMain {path} {hash} />{/if}
{#if path.match(/(\/docs)+\/*\b(?![%])/)} <NavDocs />{/if}

<slot />
