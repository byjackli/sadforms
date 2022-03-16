<script lang="ts">
    import { onMount } from "svelte";
    import { highlight } from "../../static/vendor/prism";

    export let lang: string = undefined,
        code: string = "";

    let container = undefined;
    $: $$props.string && lang && highlight(container, false, undefined);

    // component made possible by Prism.js

    // in future, build
    // 1. plain english regex builder, then
    // 2. code highlighter from scratch
    onMount(() => lang && highlight(container, false, undefined));
</script>

<pre bind:this={container} class={`language-${lang}`}>
    <code class={`language-${lang}`}>
        {code}
        <slot />
    </code>
</pre>
