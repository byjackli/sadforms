<script lang="ts">
    import Code from "../../components/Docs/Code.svelte";
    import CodeBlock from "../../components/Docs/CodeBlock.svelte";

    import DocsTemplate from "../../components/Docs/DocsTemplate.svelte";
</script>

<DocsTemplate title="components">
    <CodeBlock title="Form">
        <Code
            slot="source"
            lang="typescript"
            code={`
        export type Form = {
            uid: string,
            title: string,
            caption?: string,
            debug?: boolean,
            saveToLocal?: boolean,
            saveToCloud?: boolean,
            save: {
                saveAuto: false | number,
                saveOnInput: boolean
            },
            onInput?: Function,
            afterFormLoad?: Function,
            fields?: Record<string, (Field | Group)>,
            autocomplete?: boolean,
            fullscreen?: boolean,
            onSubmit?: Function,
            hide?: Hide
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

    <CodeBlock title="Field">
        <Code
            slot="source"
            lang="typescript"
            code={`
        export type Form = {
            uid: string,
            title: string,
            caption?: string,
            debug?: boolean,
            saveToLocal?: boolean,
            saveToCloud?: boolean,
            save: {
                saveAuto: false | number,
                saveOnInput: boolean
            },
            onInput?: Function,
            afterFormLoad?: Function,
            fields?: Record<string, (Field | Group)>,
            autocomplete?: boolean,
            fullscreen?: boolean,
            onSubmit?: Function,
            hide?: Hide
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

    <CodeBlock title="Dropdown">
        <Code
            slot="source"
            lang="typescript"
            code={`
        export type Form = {
            uid: string,
            title: string,
            caption?: string,
            debug?: boolean,
            saveToLocal?: boolean,
            saveToCloud?: boolean,
            save: {
                saveAuto: false | number,
                saveOnInput: boolean
            },
            onInput?: Function,
            afterFormLoad?: Function,
            fields?: Record<string, (Field | Group)>,
            autocomplete?: boolean,
            fullscreen?: boolean,
            onSubmit?: Function,
            hide?: Hide
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

    <CodeBlock title="Checkbox">
        <Code
            slot="source"
            lang="typescript"
            code={`
        export type Form = {
            uid: string,
            title: string,
            caption?: string,
            debug?: boolean,
            saveToLocal?: boolean,
            saveToCloud?: boolean,
            save: {
                saveAuto: false | number,
                saveOnInput: boolean
            },
            onInput?: Function,
            afterFormLoad?: Function,
            fields?: Record<string, (Field | Group)>,
            autocomplete?: boolean,
            fullscreen?: boolean,
            onSubmit?: Function,
            hide?: Hide
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

    <CodeBlock title="List">
        <Code
            slot="source"
            lang="typescript"
            code={`
        export type Form = {
            uid: string,
            title: string,
            caption?: string,
            debug?: boolean,
            saveToLocal?: boolean,
            saveToCloud?: boolean,
            save: {
                saveAuto: false | number,
                saveOnInput: boolean
            },
            onInput?: Function,
            afterFormLoad?: Function,
            fields?: Record<string, (Field | Group)>,
            autocomplete?: boolean,
            fullscreen?: boolean,
            onSubmit?: Function,
            hide?: Hide
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

    <CodeBlock title="Divider">
        <Code
            slot="source"
            lang="typescript"
            code={`
        export type Form = {
            uid: string,
            title: string,
            caption?: string,
            debug?: boolean,
            saveToLocal?: boolean,
            saveToCloud?: boolean,
            save: {
                saveAuto: false | number,
                saveOnInput: boolean
            },
            onInput?: Function,
            afterFormLoad?: Function,
            fields?: Record<string, (Field | Group)>,
            autocomplete?: boolean,
            fullscreen?: boolean,
            onSubmit?: Function,
            hide?: Hide
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
</DocsTemplate>
