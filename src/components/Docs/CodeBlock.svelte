<script lang="ts">
    import Section from "../Docs/Section.svelte";
    export let title: string,
        viewSource: boolean = true;

    let swap = () => (viewSource = !viewSource);
</script>

<Section {title}>
    <div class="codeblock">
        <div class="clip-scrollbar">
            <div class="code-container">
                {#if viewSource}
                    <slot name="source" />
                {:else}
                    <slot name="example" />
                {/if}
            </div>
        </div>
        <button class="pill" on:click={swap}>
            <span class={`material-icons${viewSource ? "" : "-outlined"}`}
                >{viewSource ?  "science":"data_object" }</span
            >
            <span>{viewSource ? "example": "obj type" }</span>
        </button>
    </div>
</Section>
