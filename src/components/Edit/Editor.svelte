<script lang="ts">
    import { genSubmit } from "$lib/tools/kit";
    import { editorViewService, type ViewState } from "./services/editorViewService";
    import JsonEditor from "./JsonEditor.svelte";
    import SadForms, {
        replacer,
        updateForm,
        updateSave,
    } from "../../store/SadForms";
    import EditPreview from "./EditPreview.svelte";
    import EditField from "./EditField.svelte";
    import EditSettings from "./EditSettings.svelte";
    import Form from "$lib/components/Form.svelte";

    let viewState: ViewState = editorViewService.getInitialState();
    let toggler: HTMLElement;
    let main: any = undefined;
    let debugData: string | null = undefined;

    $: formData = $SadForms.data;
    $: copyButtonConfig = editorViewService.getCopyButtonConfig(viewState.currentView);
    
    // Debug form configuration using SadForms dogfooding approach
    $: debugFormConfig = {
        uid: "debug-toggle",
        title: "Debug Controls",
        hide: { title: true, caption: true, submit: true, reset: true },
        autocomplete: false,
        fields: {
            debug: {
                uid: "debug",
                name: "Debug",
                type: "checkbox",
                hide: { label: true },
                defaultValue: formData.debug,
                onInput: handleDebugToggle,
            }
        }
    };

    function swapView(view: string): void {
        viewState = editorViewService.updateViewState(
            viewState, 
            view as any, 
            togglePanel
        );
        toggler.focus();
    }
    
    function togglePanel(): void {
        viewState = editorViewService.togglePanelState(viewState);
        editorViewService.updatePanelPosition(viewState.open);
        if (viewState.open) {
            toggler.focus();
        }
    }
    function getManageFieldStorage(): Record<string, string> {
        const { fieldid, groupid } = $SadForms.editing,
            base = groupid ? formData.fields[groupid] : formData.fields;
        return base[fieldid];
    }
    
    function copyToClipboard(): void {
        const data = viewState.open && viewState.currentView === "edit" ? getManageFieldStorage() : formData;
        let clipboard = JSON.stringify(data, replacer, 2);
        navigator.clipboard.writeText(clipboard);
    }

    function save(event: KeyboardEvent): void {
        if (event.ctrlKey && event.altKey && event.key === "s") updateSave();
        else if (event.ctrlKey && event.altKey && event.key === "c")
            copyToClipboard();
    }

    function handleJsonInput(_event: any): void {
        // Handle JSON editor input - could add validation here
        // console.log('JSON updated:', event.target.value);
    }
    
    function handleDebugToggle(details: any): void {
        formData.debug = details.fieldValues?.debug || false;
        updateForm(formData);
        updateSave(formData);
    }
    
    function setMain(element: HTMLElement): void {
        main = element;
    }
</script>

<svelte:window on:keydown={(event) => save(event)} />

<main id="editor">
    <EditPreview bind:debugData {togglePanel} {swapView} {setMain} open={viewState.open} />
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
            aria-label={`${viewState.aria} editor panel`}
            role="button"
            on:click={togglePanel}
            on:keydown={(event) => genSubmit(event, togglePanel)}
        >
            <span aria-hidden="true" class="material-icons">{viewState.icon}</span>
        </div>
        <div
            id="editor-sidemenu-toggle"
            class="noselect tiny-toggle"
            tabindex="0"
            aria-label="form debug"
            role="button"
            on:click={() => {
                if (!viewState.open) togglePanel();
                swapView("debug");
            }}
            on:keydown={(event) =>
                genSubmit(event, () => {
                    if (!viewState.open) togglePanel();
                    swapView("debug");
                })}
        >
            <span aria-hidden="true" class="material-icons">bug_report</span>
        </div>
    </div>
    {#if viewState.open}
        <div id="editor-sidemenu">
            <div id="playground">
                {#if viewState.currentView === "code"}
                    <JsonEditor 
                        {formData} 
                        {replacer} 
                        onInput={handleJsonInput} 
                    />
                {:else if viewState.currentView === "settings"}
                    <EditSettings />
                {:else if $SadForms && viewState.currentView === "edit"}
                    <EditField {main} />
                {:else if viewState.currentView === "debug"}
                    <div class="form-container">
                        <div class="sf isolated">
                            <Form {...debugFormConfig} />
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
                        class={viewState.currentView === "code" ? "active" : ""}
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
                        class={viewState.currentView === "settings" ? "active" : ""}
                        aria-label="form settings"
                        on:click={() => swapView("settings")}
                        on:keydown={(event) =>
                            genSubmit(event, () => swapView("settings"))}
                    >
                        <span aria-hidden="true" class="material-icons"
                            >settings</span
                        >
                    </button>
                    {#if viewState.editing}
                        <button
                            class={viewState.currentView === "edit" ? "active" : ""}
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
                    aria-label={copyButtonConfig.label}
                >
                    <span aria-hidden="true" class="material-icons">
                        {copyButtonConfig.icon}
                    </span>
                    <span aria-hidden="true">
                        {copyButtonConfig.text}
                    </span>
                </button>
            </nav>
        </div>
    {/if}
</aside>
