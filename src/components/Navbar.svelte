<script lang="ts">
    import Checkbox from "$lib/components/Checkbox.svelte";

    const { path = undefined, hash = undefined }: { path?: string; hash?: string } = $props();

    let preview: HTMLElement = $state(undefined);
    let edit: HTMLElement = $state(undefined);
</script>

<nav id="main">
    <div class="lhs-container">
        <a class="h3" href="/">Sad Forms</a>
        {#if ["/edit", "/preview"].includes(path)}
            <div class="sf" id="editpreview">
                <Checkbox
                    id="switch"
                    name="switch"
                    type="switch"
                    icon={{
                        off: "visibility",
                        on: "edit",
                    }}
                    data={path === "/edit"}
                    input={() => {
                        if (path === "/edit") preview.click();
                        else edit.click();
                    }}
                />
                <div class="for-aria" aria-disabled="true" disabled>
                    <a
                        bind:this={preview}
                        class="doc-mode"
                        tabindex="-1"
                        href={`/preview${hash}`}>Preview</a
                    >
                    <a
                        bind:this={edit}
                        class="doc-mode"
                        tabindex="-1"
                        href={`/edit${hash}`}>Edit</a
                    >
                </div>
            </div>
        {/if}
    </div>
    <ul>
        <li class={path === "/donate" ? "active" : ""}>
            <a href="/donate">donate</a>
        </li>
        <li class={path.match(/(\/docs)+\/*\b(?![%])/) ? "active" : ""}>
            <a href="/docs">documentation</a>
        </li>
        <li class={path === "/feedback" ? "active" : ""}>
            <a href="/feedback">feedback</a>
        </li>
        <li>
            <a
                href="https://github.com/byjackli/SadForms"
                rel="noreferrer"
                target="_blank">repo</a
            >
        </li>
    </ul>
</nav>
