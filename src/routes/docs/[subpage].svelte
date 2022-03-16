<script context="module">
    export function load({ params }) {
        return { props: { subpage: params.subpage } };
    }
</script>

<script lang="ts">
    import Welcome from "../../views/welcome.svelte";
    import Form from "../../views/form.svelte";
    import Supported from "../../views/supported.svelte";
    import Functions from "../../views/functions.svelte";
    import Styling from "../../views/styling.svelte";
    import Roadmap from "../../views/roadmap.svelte";

    export let subpage = "welcome";

    const views = {
        welcome: Welcome,
        form_types: Form,
        supported_fields: Supported,
        functions: Functions,
        styling: Styling,
        roadmap: Roadmap,
    };
</script>

<svelte:component this={views[subpage]} />
