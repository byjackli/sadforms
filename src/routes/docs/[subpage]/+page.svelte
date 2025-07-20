<script lang="ts">
    import type { PageData } from './$types';
    import Welcome from "../../../views/welcome.svelte";
    import Form from "../../../views/form.svelte";
    import Supported from "../../../views/supported.svelte";
    import Functions from "../../../views/functions.svelte";
    import Styling from "../../../views/styling.svelte";
    import Roadmap from "../../../views/roadmap.svelte";

    export let data: PageData;
    $: subpage = data.subpage || "welcome";

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
