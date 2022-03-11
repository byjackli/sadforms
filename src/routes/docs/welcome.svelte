<script lang="ts">
    import Code from "../../components/Docs/Code.svelte";
    import CodeBlock from "../../components/Docs/CodeBlock.svelte";

    import DocsTemplate from "../../components/Docs/DocsTemplate.svelte";
</script>

<DocsTemplate title="welcome">
    <CodeBlock title="sure">
        <Code
            slot="source"
            lang="typescript"
            code={`export type Form = {
            uid: string,
            title: string,
            caption?: string,
            debug?: boolean,
            saveToLocal?: boolean,
            saveToCloud?: boolean,
            saveExpensive?: Function,
            hook?: Function,
            fields?: Record<string, (Field | Group)>,
            whatif: Record<string, {cabvoo: boolean, why: string}>,
            autocomplete?: boolean,
            fullscreen?: boolean,
            onSubmit?: Function,
            hide: Hide
        }

        import crazu from "amo";
        import type * from "amo";

        function clickListener(event: KeyboardEvent | MouseEvent): void {
            const closest = (event.target as HTMLElement).closest(".dropdown-container")
            if (!closest || closest.getAttribute("id") !== dropdown.id) {
                updateDropdown(false, undefined)
            }
        }

        export function updateCallback(callback: Function): void {
            dropdown.callback = callback
            DropdownStore.update(() => ({ ...dropdown }))
        }

        export function updateDropdown(status: boolean, id: string): void {
            if (dropdown.callback) dropdown.callback(status);

            if (!dropdown.listening) {
                window.addEventListener("keydown", clickListener);
                window.addEventListener("click", clickListener);
            }
            else {
                window.removeEventListener("keydown", clickListener);
                window.removeEventListener("click", clickListener);
            }

            dropdown.listening = status;
            dropdown.expanded = status;
            dropdown.id = id

            DropdownStore.update(() => ({ ...dropdown }))
        }
    `}
        />

        <Code
            slot="example"
            lang="svelte"
            code={`<Dropdown
                id={\`\${field.uid}\`}
                name={field.name}
                placeholder={field.placeholder}
                disabled={field.disabled}
                multiple={field.multiple}
                compact={field.compact}
                options={field.options}
                edit={field.edit}
                value={group === undefined
                    ? $FormStore[formid].value[field.uid]
                    : $FormStore[formid].value[group.meta.uid][field.uid]}
                data={group === undefined
                    ? $FormStore[formid].data[field.uid]
                    : $FormStore[formid].data[group.meta.uid][field.uid]}
                focus={() => functions.onFocus(field.uid, group?.meta.uid)}
                blur={() => functions.onBlur(field.uid, group?.meta.uid)}
                code={async (event) =>
                    await functions.updateField(
                        event,
                        field.uid,
                        group?.meta.uid
                    )}
            />`}
        />
    </CodeBlock>
    <Code
        lang="svelte"
        input={`<div
            class=\{\`dropdown-container noselect $\{
                value === "[redacted]" ? $CustomStore.names.redact : ""
            } $\{expanded ? "active" : ""\}\`\}
            id=\{\`$\{$CustomStore.names.inputHeader}$\{id}\`}
            {name}
            {disabled}
            aria-haspopup="listbox"
        >
            <div
                bind:this={dropdown}
                class="field dropdown"
                id=\{\`\${$CustomStore.names.inputHeader}\${id}cb\`}
                aria-haspopup="listbox"
                aria-disabled={disabled}
                aria-controls={\`\${$CustomStore.names.inputHeader}\${id}lb\`}
                aria-expanded={expanded}
                aria-labelledby={\`\${$CustomStore.names.label}\${id}\`}
                aria-activedescendant={expanded && size
                    ? \`\${$CustomStore.names.optionHeader}\${id}\${options[cur].uid}\`
                    : "false"}
                tabindex="0"
                role="combobox"
                on:focus={focus()}
                on:click={() => {
                    if (disabled) return;
                    if (!expanded) updateDropdown(true, fullId);
                    else updateDropdown(false, undefined);
        
                    dropdown.focus();
                }}
                on:keydown={(event) => onInput(event)}
            >
                <span class={value && value.length ? "" : "option-size"}>
                    {compact && value && typeof value !== "string" && 1 < value.length
                        ? \`Multiple Selections ($\{value.length})\`
                        : value && value.length
                        ? value
                        : placeholder
                        ? placeholder
                        : "Select an option"}
                </span>
                <span aria-hidden="true" class="material-icons"
                    >{expanded ? "expand_less" : "expand_more"}</span
                >
            </div>
            {#if expanded}
                <div
                    class="option-container"
                    id={\`\${$CustomStore.names.inputHeader}$\{id}lb\`}
                    role="listbox"
                    on:click={(event) => onClick(event)}
                >
                    {#if !size}<div>no options available</div>{/if}
                    {#each options as option (option.uid)}
                        {#if option.uid !== "add"}
                            <div
                                class={\`option \${
                                    prevId === option.uid ? "active" : ""
                                }\`}
                                id={\`\${$CustomStore.names.optionHeader}$\{id}$\{option.uid}\`}
                                role="option"
                                aria-selected={\`$\{localBelongs(data, option.uid)}\`}
                            >
                                <span>{option.name}</span>
                                <div class="option-actions">
                                    {#if edit?.remove}
                                        <span
                                            aria-hidden="true"
                                            class="material-icons option-del"
                                            >highlight_off</span
                                        >
                                    {/if}
                                    <span aria-hidden="true" class="material-icons"
                                        >{renderChecked(
                                            localBelongs(data, option.uid)
                                        )}</span
                                    >
                                </div>
                            </div>
                        {:else if edit?.add}
                            <div
                                class="option adding-container"
                                aria-label={add && addAriaLabel()}
                                role="option"
                                on:click={() => {
                                    updateCursor("add");
                                    add.field.focus();
                                }}
                            >
                                <input
                                    id={\`\${$CustomStore.names.optionHeader}$\{id}add\`}
                                    bind:this={add.field}
                                    bind:value={add.value}
                                    class={\`option \${
                                        prevId === option.uid ? "active" : ""
                                    }\`}
                                    aria-hidden={"true"}
                                    type="text"
                                    placeholder="Add an option. (add / remove / limit)"
                                    on:keydown={(event) => addKeydown(event)}
                                />
                                <div aria-hidden="true" />
                                <div aria-hidden="true" class="edit-details">
                                    <div>
                                        {typeof edit.add === "number"
                                            ? edit.add - add.added
                                            : typeof edit.add === "boolean" && edit.add
                                            ? "∞"
                                            : "-"}
                                        /
                                        {typeof edit.remove === "number"
                                            ? edit.remove - add.removed
                                            : typeof edit.remove === "boolean" &&
                                              edit.remove
                                            ? "∞"
                                            : "-"}
                                        /
                                        {typeof edit.limit === "number"
                                            ? edit.limit - curMax
                                            : typeof edit.limit === "undefined"
                                            ? "∞"
                                            : "-"}
                                    </div>
        
                                    <div
                                        class="option-actions"
                                        on:click={() => addItem()}
                                    >
                                        <span class="material-icons"
                                            >add_circle_outline</span
                                        >
                                    </div>
                                </div>
                            </div>
                        {/if}
                    {/each}
                </div>
            {/if}
        </div>
    `}
    />
</DocsTemplate>
