<script lang="ts">
    import Note from "../components/Docs/Note.svelte";
    import Section from "../components/Docs/Section.svelte";
    import Code from "../components/Docs/Code.svelte";
    import CodeBlock from "../components/Docs/CodeBlock.svelte";
    import DocsTemplate from "../components/Docs/DocsTemplate.svelte";
</script>

<DocsTemplate title="types">
    <Section title="Form">
        <CodeBlock>
            <Code
                slot="a"
                lang="typescript"
                code={`
        export type Form = {
            uid: string,                // unique identifier
            title: string,              // human-readable title
            caption?: string,           // description about the form
            debug?: boolean,            // actively stringify form Data object
            saveToLocal?: boolean,      // save to localStorage
            saveToCloud?: boolean,      // ⛔ NOT PRODUCTION READY ⛔ (custom save function)
            save: {                     // custom "save" function run settings
                saveAuto: false | number,   // run "save" function every x milliseconds, or false to turn off
                saveOnInput: boolean        // run "save" function everytime onInput function is fired
            },
            onInput?: Function,         // custom function runs whenever the field changes  
            afterFormLoad?: Function,   // custom function runs after form loads
            fields?:                    // list of fields belonging to this form
                Record<string, (Field | Group)>,
            autocomplete?: boolean,     // instruct browser to autofill if available
            fullscreen?: boolean,       // ⛔ NOT PRODUCTION READY ⛔ (full immersion mode with animations) 
            onSubmit?: Function,        // custom "submit" function runs when form is submitted
            hide?: Hide                 // hide certain form features from the user
        }

    `}
            />

            <Code
                slot="b"
                lang="svelte"
                code={`
        <script>
            const data = {
                uid: "sample",
                title: "Sample Form v2",
                caption: "This is an updated version of the sample form.\\n\\n⛔ WARNING!! ⛔\\nThis form resets after EVERY session. For persistent edits, create a new form at the homepage.",
                debug: true
                saveToLocal: true,
                saveToCloud: false,
                save: {
                    saveAuto: false,
                    saveOnInput: true
                },
                onInput: undefined,
                afterFormLoad: undefined,
                fields: {{}},
                autocomplete: true,
                fullscreen: false,
                onSubmit: undefined,
                hide: {},
            },
        <\/script>

        <Form {...data}/>
        `}
            />
        </CodeBlock>
    </Section>
    <Section title="Field">
        <CodeBlock hideButton>
            <Code
                slot="a"
                lang="typescript"
                code={`
        export type Field = {
            uid: string,                // unique identifier
            class?: string,             // custom class name(s)
            name: string,               // human-readable title
            type: string,               // input field type
            defaultValue?: Value,       // pre-filled field that the user can change
            placeholder?: string,       // really short description on how to use field
            tooltip?: string,           // description on how to use field
            hide?: {                    // hide certain features from the user
                label?: boolean,            // hide field label
                preview?: boolean           // hide file previews
            },
            disabled?: boolean,         // prevent users from accessing field
            required?: boolean,         // check if field is empty
            dontSave?: boolean,         // do not save data to localStorage
            redact?: boolean,           // hide data when field is inactive
            autocomplete?: string,      // instruct browser to autofill if available
            spellcheck?: boolean,       // toggle browser spellcheck
            multiple?: boolean,         // accept more than one value (or files)
            compact?: boolean,          // display number of selected instead of name of every selected
            options?: Options,          // list of possible dropdown choices
            accept?: string,            // accept certain file type(s), see MIME types
            edit?: Edit,                // dropdown editing features
            validity?: Validity,        // custom function checks the input value
            onInput?: Function,         // custom function runs whenever the field changes
            icon?: string | {           // material themed icon to add aesthetic value
                on: string,                 // material icon for on-state
                off: string                 // material icon for off-state
            }
        }

        // improper combinations of Field options will break the form.
        // see SUPPORTED FIELDS for proper configuration standards.
    `}
            />
        </CodeBlock>
    </Section>
    <Section title="Group">
        <CodeBlock hideButton>
            <Code
                slot="a"
                lang="typescript"
                code={`
        export type Group = {
            meta: {                     // group settings
                uid: string,                // unique identifier
                name: string,               // human-readable title
                tooltip?: string,           // description attached to the group
                required?: boolean,         // check if all fields are empty
                dontSave?: boolean,         // do not save any data to localStorage
                redact?: boolean,           // hide all data when field is inactive
                override: {                 // additional group settings
                    label?: boolean,            // display group label
                    feedback?: boolean          // aggregate all field feedback into one
                }
                spellcheck?: string,        // toggle browser spellcheck for all fields
            },
            [key: string]: unknown      // add additional fields like you would when adding to a form
        }
    `}
            />
        </CodeBlock>
    </Section>
    <Section title="Value">
        <CodeBlock hideButton>
            <Code
                slot="a"
                lang="typescript"
                code={`
        export type Value = 
            boolean |                   // returned by type checkbox and switch
            number |                    // returned by type number
            Record<string, string> |    // returned by ype dropdown
            string                      // returned by all other supported fields
    `}
            />
        </CodeBlock>
    </Section>
    <Section title="Hide">
        <CodeBlock hideButton>
            <Code
                slot="a"
                lang="typescript"
                code={`
        export type Hide = {
            title?: boolean,            // hide form title
            caption?: boolean,          // hide form caption
            submit?: boolean,           // hide form submit button
            reset?: boolean             // hide form reset button
        }
    `}
            />
        </CodeBlock>
    </Section>
    <Section title="Options">
        <CodeBlock hideButton>
            <Code
                slot="a"
                lang="typescript"
                code={`
        export type Options = 
            {                           // a collection of the following object:
                uid: string,                // unique identifier
                name: string                // title of option
            }[]
    `}
            />
        </CodeBlock>
    </Section>
    <Section title="Edit">
        <CodeBlock hideButton>
            <Code
                slot="a"
                lang="typescript"
                code={`
        export type Edit = {
            add:                        // permission for user to add dropdown choice 
                boolean |                   // true = unlimited add, false = disallow add
                number,                     // number = add up to specified amount  
            remove:                     // permission for user to remove dropdown choice
                boolean |                   // true = unlimited remove, false = disallow remove
                number,                     // number = remove up to specified amount
            limit:                      // limit the total amount of dropdown choices
                "undefined" |               // "undefined" = unlimited number of choices
                number,                     //  number = can have up to specified amount of options
            persist: boolean,           // expose "options" to custom onInput function
        }
    `}
            />
        </CodeBlock>
    </Section>
    <Section title="Data">
        <CodeBlock hideButton>
            <Code
                slot="a"
                lang="typescript"
                code={`
        type Data = {
            // submit state of the form
            submit: { submitting: boolean, accepted: boolean, attempted: boolean },

            // record of all data of fields with "dontSave" disabled
            data: Record<string, (Value | Record<string, Value>)>,

            // record of all fields with "required" enabled
            required: Record<string, (boolean | Record<string, boolean>)>,

            // record of all fields with a custom onInput function
            onInput: Record<string, (Function | Record<string, Function>)>,

            //  record of all fields with a custom validity function
            validity: Record<string, (Validity | Record<string, Validity>)>,

            // record of each field and group passing or failing required check and validity check
            verdict: Record<string, (Verdict | Record<string, Verdict>)>,

            //  record of all fields with "preview" enabled
            preview: Record<string, (boolean | Record<string, boolean>)>,

            // record of all fields with "redact" enabled
            redact: Record<string, (boolean | Record<string, boolean>)>,

            // record of all fields that have been clicked on
            touched: Record<string, (boolean | Record<string, boolean>)>,

            // record of what the user sees on the input field
            value: Record<string, (unknown | Record<string, unknown>)>,

            // record of fields that are currently in focus
            active: Record<string, (boolean | Record<string, boolean>)>,

            // record of all data of fields with "dontSave" enabled
            dontSave: Record<string, (DontSave | Record<string, DontSave>)>,

            // record of all groups
            group: Record<string, Group>
        }
    `}
            />
        </CodeBlock>
    </Section>
    <Section title="Verdict">
        <CodeBlock hideButton>
            <Code
                slot="a"
                lang="typescript"
                code={`
        export type Verdict = {
            verdict: boolean,           // overall condition of field or group, based on required and validity
            raw?: {                     // list of each condition, based on rules from custom validity function
                verdict: boolean,           // result based on applying value to condition
                feedback: string            // feedback for user based on verdict
            }[]
        }
    `}
            />
        </CodeBlock>
    </Section>
    <Section title="Validity">
        <CodeBlock hideButton>
            <Code
                slot="a"
                lang="typescript"
                code={`
        export type Validity = ((value: string) => Record<string, Rule>)
        // see FUNCTIONS > FIELD validation for more information
    `}
            />
        </CodeBlock>
    </Section>
    <Section title="Rule">
        <CodeBlock hideButton>
            <Code
                slot="a"
                lang="typescript"
                code={`
        export type Rule = {
            check: boolean,             // condition that results to a boolean value
            true: string,               // feedback for user (general or specific to if condition is true)
            false?: string,             // feedback for user if condition is false
            loading?: string            // feedback for user while "check" condition is evaluating
        }
    `}
            />
        </CodeBlock>
    </Section>

    <Note>
        <span slot="icon" class="material-icons">task_alt</span>
        <div>
            <p>
                Next up, <em
                    ><strong
                        ><a href="/docs/supported_fields">Supported Fields</a
                        ></strong
                    ></em
                >. Since "Field" is so broad, find out what options are
                important to you.
            </p>
        </div>
    </Note>
</DocsTemplate>
