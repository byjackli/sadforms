<script context="module">
    export function load({ params }) {
        console.info({ params });
        return { props: { subpage: params.subpage } };
    }
</script>

<script lang="ts">
    import Welcome from "../../views/welcome.svelte";
    import Components from "../../views/components.svelte";
    import Supported from "../../views/supported.svelte";
    import Functions from "../../views/functions.svelte";
    import Styling from "../../views/styling.svelte";
    import Roadmap from "../../views/roadmap.svelte";

    export let subpage = "welcome";

    const views = {
        welcome: Welcome,
        components: Components,
        supported_fields: Supported,
        functions: Functions,
        styling: Styling,
        roadmap: Roadmap,
    };
</script>

<svelte:component this={views[subpage]} />
