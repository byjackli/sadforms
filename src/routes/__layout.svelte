<script context="module">
    export async function load(context) {
        return { props: { home: context.url.pathname, doc: context.url.hash } };
    }
</script>

<script lang="ts">
    import Navbar from "../components/Navbar.svelte";
    export let home: string, doc: string;

    $: path = home;
    $: hash = doc;
</script>

{#if !(path === "/")} <Navbar {path} {hash} />{/if}

<slot />
