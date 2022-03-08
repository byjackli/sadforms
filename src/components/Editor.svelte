<script lang="ts">
    import { genSubmit } from "$lib/tools/kit";
    import SadForms, {
        replacer,
        updateForm,
        updateSave,
    } from "../store/SadForms";
    import EditPreview from "../components/EditPreview.svelte";
    import EditField from "../components/EditField.svelte";
    import EditSettings from "../components/EditSettings.svelte";
    import Checkbox from "$lib/components/Checkbox.svelte";

    let curView = "code",
        open = true,
        aria = "close",
        icon = "chevron_right",
        toggler: HTMLElement,
        editing: boolean;

    $: formData = $SadForms.data;
    $: main = undefined;
    $: debugData = undefined;

    function swapView(view: string): void {
        curView = view;
        if (view === "edit") editing = true;
        if (!open) togglePanel();
        toggler.focus();
    }
    function togglePanel(): void {
        const ss = document.documentElement.style,
            vw = window
                .getComputedStyle(document.documentElement)
                .getPropertyValue(`--w-editor`);

        if (open) {
            open = false;
            aria = "open";
            icon = "chevron_left";
            ss.setProperty("--p-editor", vw);
        } else {
            open = true;
            aria = "close";
            icon = "chevron_right";
            ss.setProperty("--p-editor", "0vw");
            toggler.focus();
        }
    }
    function getFieldData(): Record<string, string> {
        const { fieldid, groupid } = $SadForms.editing,
            base = groupid ? formData.fields[groupid] : formData.fields;
        console.info({ fieldid, groupid, base });
        return base[fieldid];
    }
    function copyToClipboard(): void {
        const data = open && curView === "edit" ? getFieldData() : formData;
        let clipboard = JSON.stringify(data, replacer, 2);
        navigator.clipboard.writeText(clipboard);
    }

    function save(event: KeyboardEvent): void {
        if (event.ctrlKey && event.altKey && event.key === "s") updateSave();
        else if (event.ctrlKey && event.altKey && event.key === "c")
            copyToClipboard();
    }

    function inputChange(event): void {
        // check function that validates code
        // JSON.stringify(event.target.value, null, 2);
    }
    function setMain(element: HTMLElement): void {
        main = element;
    }
</script>

<svelte:window on:keydown={(event) => save(event)} />

<main id="editor">
    <EditPreview bind:debugData {togglePanel} {swapView} {setMain} {open} />
</main>

<aside
    id="editor-sidemenu-container"
    aria-label="View code, change settings, edit fields, and copy all code or code snippets."
>
    <div id="editor-sidemenu-toggle-container">
        <div
            bind:this={toggler}
            id="editor-sidemenu-toggle"
            class="noselect"
            tabindex="0"
            aria-label={`${aria} editor panel`}
            role="button"
            on:click={togglePanel}
            on:keydown={(event) => genSubmit(event, togglePanel)}
        >
            <span aria-hidden="true" class="material-icons">{icon}</span>
        </div>
        <div
            id="editor-sidemenu-toggle"
            class="noselect tiny-toggle"
            tabindex="0"
            aria-label="form debug"
            role="button"
            on:click={() => {
                if (!open) togglePanel();
                swapView("debug");
            }}
            on:keydown={(event) =>
                genSubmit(event, () => {
                    if (!open) togglePanel();
                    swapView("debug");
                })}
        >
            <span aria-hidden="true" class="material-icons">bug_report</span>
        </div>
    </div>
    {#if open}
        <div id="editor-sidemenu">
            <div id="playground">
                {#if curView === "code"}
                    <div
                        contentEditable
                        class="code"
                        on:input={(event) => inputChange(event)}
                    >
                        {JSON.stringify(
                            formData,
                            (k, v) => replacer(k, v, true),
                            2
                        )}
                    </div>
                {:else if curView === "settings"}
                    <EditSettings />
                {:else if $SadForms && curView === "edit"}
                    <EditField {main} />
                {:else if curView === "debug"}
                    <div class="form-container">
                        <div class="sadforms isolated">
                            <Checkbox
                                type="checkbox"
                                id="toggleDebug"
                                name="Debug"
                                data={formData.debug}
                                input={() => {
                                    formData.debug = !formData.debug;
                                    updateForm(formData);
                                    updateSave(formData);
                                }}
                            />
                        </div>
                    </div>
                    {#if formData.debug}
                        <code>
                            {debugData}
                        </code>
                    {/if}
                {/if}
            </div>
            <nav id="editor-nav" aria-label="Editor">
                <div id="en3" aria-label="toggle between the different views">
                    <button
                        class={curView === "code" ? "active" : ""}
                        aria-label="code view of entire form"
                        on:click={() => swapView("code")}
                        on:keydown={(event) =>
                            genSubmit(event, () => swapView("code"))}
                    >
                        <span aria-hidden="true" class="material-icons"
                            >integration_instructions</span
                        >
                        <span aria-hidden="true">code</span>
                    </button>
                    <button
                        class={curView === "settings" ? "active" : ""}
                        aria-label="form settings"
                        on:click={() => swapView("settings")}
                        on:keydown={(event) =>
                            genSubmit(event, () => swapView("settings"))}
                    >
                        <span aria-hidden="true" class="material-icons"
                            >settings</span
                        >
                    </button>
                    {#if editing}
                        <button
                            class={curView === "edit" ? "active" : ""}
                            aria-label="edit view of selected field"
                            on:click={() => swapView("edit")}
                            on:keydown={(event) =>
                                genSubmit(event, () => swapView("edit"))}
                        >
                            <span aria-hidden="true" class="material-icons"
                                >edit</span
                            >
                            <span aria-hidden="true">edit</span>
                        </button>
                    {/if}
                </div>
                <button
                    id="copy-code"
                    on:click={copyToClipboard}
                    on:keydown={(event) => genSubmit(event, copyToClipboard)}
                    aria-label={`Copy Code for ${
                        curView === "code"
                            ? "Entire Form"
                            : "This Particular Field"
                    }`}
                >
                    <span aria-hidden="true" class="material-icons">
                        {curView !== "edit" ? "copy_all" : "code"}
                    </span>
                    <span aria-hidden="true">
                        {curView !== "edit" ? "copy all" : "copy code"}
                    </span>
                </button>
            </nav>
        </div>
    {/if}
</aside>
