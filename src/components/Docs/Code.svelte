<script lang="ts">
    import { onMount } from "svelte";
    import { highlight } from "../../static/vendor/prism";

    export let lang: string = "javascript",
        code: string = "";

    let container = undefined;
    $: $$props.string && highlight(container, false, undefined);

    // component made possible by Prism.js

    // in future, build
    // 1. plain english regex builder, then
    // 2. code highlighter from scratch
    onMount(() => highlight(container, false, undefined));
</script>

<pre bind:this={container} class={`language-${lang}`}>
    <code class={`language-${lang}`}>
        {code}
    </code>
</pre>
