<script lang="ts">
    import Section from "../Docs/Section.svelte";
    export let title: string;

    let viewSource = true,
        icon = "science",
        text = "example";
    function swap() {
        if (viewSource) {
            icon = "data_object";
            text = "obj type";
            viewSource = false;
        } else {
            icon = "science";
            text = "example";
            viewSource = true;
        }
    }
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
                >{icon}</span
            >
            <span>{text}</span>
        </button>
    </div>
</Section>
