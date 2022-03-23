<script lang="ts">
    import { onMount, SvelteComponent } from "svelte";
    import Form from "$lib/components/Form.svelte";
    import Dropdown from "$lib/components/Dropdown.svelte";
    import { genSubmit, uuidV4 } from "$lib/tools/kit";

    import { newType } from "../../presets";
    import SadForms, {
        setRefresh,
        updateEditing,
        updateForm,
        updateSave,
    } from "../../store/SadForms";

    export let togglePanel: Function,
        swapView: Function,
        setMain: Function,
        debugData: string = null,
        open: boolean;

    let main: SvelteComponent = undefined,
        maData: Record<string, string> = {},
        maValue: string = "";

    $: data = $SadForms.data;

    function modifyField(fieldid: string, groupid: string, event: any): void {
        genSubmit(event, () => {
            event.preventDefault();
            const list = (event.target as Element)?.closest(
                ".button"
            )?.classList;

            if (list.contains("modify-edit")) {
                if (!open) togglePanel();
                updateEditing({ fieldid, groupid });
                swapView("edit");
                setRefresh(true);
            } else if (list.contains("modify-delete")) {
                if (open) togglePanel();
                if (groupid === undefined) delete data.fields[fieldid];
                else {
                    delete data.fields[groupid][fieldid];
                    if (Object.keys(data.fields[groupid]).length === 1)
                        delete data.fields[groupid];
                }
                updateForm(data);
                updateSave();
                main.refresh();
            } else if (list.contains("modify-title")) {
                if (!open) togglePanel();
                swapView("settings");
            }
        });
    }
    function createModify(
        fieldid: string,
        groupid: string,
        title?: boolean
    ): HTMLElement {
        if (title) {
            const container = document.createElement("div"),
                setBtn = document.createElement("div"),
                setIco = document.createElement("div"),
                setTxt = document.createTextNode("settings");

            setIco.setAttribute("class", "material-icons");
            setBtn.setAttribute("class", "button modify-title");
            setBtn.setAttribute("role", "button");
            setBtn.setAttribute("tabindex", "0");
            container.setAttribute("class", "modify-block");

            setIco.appendChild(setTxt);
            setBtn.appendChild(setIco);
            container.appendChild(setBtn);

            container.addEventListener("click", (event) =>
                modifyField(fieldid, groupid, event)
            );
            container.addEventListener("keydown", (event) =>
                modifyField(fieldid, groupid, event)
            );

            return container;
        }
        const container = document.createElement("div"),
            modBtn = document.createElement("div"),
            delBtn = document.createElement("div"),
            modIco = document.createElement("span"),
            delIco = document.createElement("span"),
            modTxt = document.createTextNode("edit"),
            delTxt = document.createTextNode("delete_forever");

        modIco.setAttribute("class", "material-icons");
        delIco.setAttribute("class", "material-icons");
        modBtn.setAttribute("class", "button modify-edit");
        delBtn.setAttribute("class", "button modify-delete");
        modBtn.setAttribute("role", "button");
        delBtn.setAttribute("role", "button");
        modBtn.setAttribute("tabindex", "0");
        delBtn.setAttribute("tabindex", "0");
        container.setAttribute("class", "modify-block");

        modIco.appendChild(modTxt);
        delIco.appendChild(delTxt);
        modBtn.appendChild(modIco);
        delBtn.appendChild(delIco);
        container.appendChild(modBtn);
        container.appendChild(delBtn);

        container.addEventListener("click", (event) =>
            modifyField(fieldid, groupid, event)
        );
        container.addEventListener("keydown", (event) =>
            modifyField(fieldid, groupid, event)
        );

        return container;
    }
    function loadModify(): void {
        const oldChunks = Array.from(
                document.querySelectorAll(".modify-block")
            ),
            chunks = Array.from(
                document.querySelectorAll(
                    "main#editor h2, main#editor div.form-block"
                )
            );

        if (oldChunks) oldChunks.forEach((oldChunk) => oldChunk.remove());

        for (const blockChunk of chunks) {
            const fieldid = blockChunk.id.slice(
                    blockChunk.id.indexOf("/") + 1,
                    blockChunk.id.length
                ),
                groupChunk = blockChunk.closest("div.form-group"),
                groupid = groupChunk
                    ? groupChunk.id.slice(
                          groupChunk.id.indexOf("/") + 1,
                          groupChunk.id.length
                      )
                    : undefined,
                modify = createModify(
                    fieldid,
                    groupid,
                    blockChunk.tagName === "H2"
                );

            blockChunk.appendChild(modify);
        }
    }

    onMount(() => {
        setMain(main);
    });
</script>

{#if $SadForms}
    <Form
        bind:this={main}
        bind:debugData
        {...data}
        afterFormLoad={loadModify}
    />
    <div class="form-container">
        <div class="sf modify-add">
            <Dropdown
                id="add"
                name="create new field"
                placeholder="create new field"
                data={maData}
                value={maValue}
                options={[
                    { uid: "option0", name: "textarea" },
                    { uid: "option1", name: "text" },
                    { uid: "option2", name: "email" },
                    { uid: "option3", name: "tel" },
                    { uid: "option4", name: "password" },
                    { uid: "option5", name: "number" },
                    { uid: "option6", name: "dropdown" },
                    { uid: "option7", name: "checkbox" },
                    { uid: "option8", name: "switch" },
                    { uid: "option9", name: "file" },
                    { uid: "option10", name: "time" },
                    { uid: "option11", name: "group" },
                    { uid: "option12", name: "divider" },
                ]}
                focus={() => null}
                blur={() => null}
                input={(event) => {
                    if (!event.target.submit) return;

                    maData = event.target.value;
                    maValue = Object.values(maData)[0];
                    const uid = uuidV4();

                    data.fields[uid] = newType(maValue, uid);
                    updateForm(data);
                    updateSave();
                    main.refresh();
                }}
            />
        </div>
    </div>
{/if}
