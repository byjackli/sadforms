<script context="module">
    export function load({ params }) {
        return { props: { subpage: params.subpage } };
    }
</script>

<script lang="ts">
    import Welcome from "../../views/welcome.svelte";
    import Components from "../../views/components.svelte";

    export let subpage = "welcome";

    const views = {
        welcome: Welcome,
        components: Components,
    };
</script>

<svelte:component this={views[subpage]} />
