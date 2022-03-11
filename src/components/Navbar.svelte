<script lang="ts">
    import Checkbox from "$lib/components/Checkbox.svelte";

    export let path: string = undefined,
        hash: string = undefined;

    let preview: HTMLElement = undefined,
        edit: HTMLElement = undefined;
</script>

<nav id="main">
    <div class="lhs-container">
        <a class="h3" href="/">Sad Forms</a>
        {#if ["/edit", "/preview"].includes(path)}
            <div class="sadforms" id="editpreview">
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
        <li class={path === "/docs" ? "active" : ""}>
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
