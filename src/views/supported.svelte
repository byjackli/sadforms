<script lang="ts">
    import DocsTemplate from "../components/Docs/DocsTemplate.svelte";
    import Section from "../components/Docs/Section.svelte";
    import CodeBlock from "../components/Docs/CodeBlock.svelte";
    import Code from "../components/Docs/Code.svelte";
    import Note from "../components/Docs/Note.svelte";
    import Form from "$lib/components/Form.svelte";
    import Checkbox from "$lib/components/Checkbox.svelte";
</script>

<DocsTemplate title="Supported Fields">
    <CodeBlock title="TextArea" viewSource={false}>
        <Code
            slot="source"
            lang="javascript"
            code={`
        textarea: {
            name: "textarea",       // (required) human-readable title
            uid: "textarea",        // (required) unique identifier
            type: "textarea",       // (required) input field type
            tooltip:                // description on how to use field
                "any character, number, and line breaks. Also preserves spaces!",
            onInput: undefined,     // custom function runs whenever the field changes
            hide: {                 // hide certain features from the user
                label: false            // hide field label
            },
            placeholder:            // really short description on how to use field
                "most versitile field, can accept...",
            defaultValue: undefined,// pre-filled field that the user can change
            disabled: false,        // prevent user from accessing field
            required: false,        // check if field is empty
            redact: false,          // hide data when field is inactive
            dontSave: true,         // do not save data to localStorage
            validity: undefined,    // custom function checks the input value
            spellcheck: false,      // toggle browser spellcheck
            autocomplete: "off",   // instruct browser to autofill if available
        },
            `}
        />
        <Form
            slot="example"
            uid="textarea"
            title="textarea"
            fields={{
                textarea: {
                    name: "textarea",
                    uid: "textarea",
                    type: "textarea",
                    tooltip:
                        "any character, number, and line breaks. Also preserves spaces!",
                    onInput: undefined,
                    hide: { label: false },
                    placeholder: "most versitile field, can accept...",
                    defaultValue: undefined,
                    disabled: false,
                    required: false,
                    redact: false,
                    dontSave: true,
                    validity: undefined,
                    spellcheck: false,
                },
            }}
            hide={{ title: true, submit: true, reset: true }}
        />
    </CodeBlock>
    <CodeBlock title="Text" viewSource={false}>
        <Code
            slot="source"
            lang="javascript"
            code={`
        text: {
            name: "text",           // (required) human-readable title
            uid: "text",            // (required) unique identifier
            type: "text",           // (required) input field type
            tooltip:                // description on how to use field
                "the text field doesn't allow line breaks.",
            onInput: undefined,     // custom function runs whenever the field changes
            hide: {                 // hide certain features from the user
                label: false            // hide field label
            },
            placeholder:            // really short description on how to use field
                "very similar to textarea, but...",
            defaultValue: undefined,// pre-filled field that the user can change
            disabled: false,        // prevent user from accessing field
            required: false,        // check if field is empty
            redact: false,          // hide data when field is inactive
            dontSave: true,         // do not save data to localStorage
            validity: undefined,    // custom function checks the input value
            spellcheck: false,      // toggle browser spellcheck
            autocomplete: "off",   // instruct browser to autofill if available
        },
            `}
        />
        <Form
            slot="example"
            uid="text"
            title="text"
            fields={{
                text: {
                    name: "text",
                    uid: "text",
                    type: "text",
                    tooltip: "the text field doesn't allow line breaks.",
                    onInput: undefined,
                    hide: { label: false },
                    placeholder: "very similar to textarea, but...",
                    defaultValue: undefined,
                    disabled: false,
                    required: false,
                    redact: false,
                    dontSave: true,
                    validity: undefined,
                    spellcheck: false,
                    autocomplete: "off",
                },
            }}
            hide={{ title: true, submit: true, reset: true }}
        />
    </CodeBlock>
    <CodeBlock title="Email" viewSource={false}>
        <Code
            slot="source"
            lang="javascript"
            code={`
        email: {
            name: "email",          // (required) human-readable title
            uid: "email",           // (required) unique identifier
            type: "email",          // (required) input field type
            tooltip: undefined      // description on how to use field,
            onInput: undefined,     // custom function runs whenever the field changes
            hide: {                 // hide certain features from the user
                label: false            // hide field label
            },
            placeholder:            // really short description on how to use field
                "only checks for proper email formatting",
            defaultValue: undefined,// pre-filled field that the user can change
            disabled: false,        // prevent user from accessing field
            required: false,        // check if field is empty
            redact: false,          // hide data when field is inactive
            dontSave: true,         // do not save data to localStorage
            validity: undefined,    // custom function checks the input value
            spellcheck: false,      // toggle browser spellcheck
            autocomplete: "off",   // instruct browser to autofill if available
        },
            `}
        />
        <Form
            slot="example"
            uid="email"
            title="email"
            fields={{
                email: {
                    name: "email",
                    uid: "email",
                    type: "email",
                    tooltip: undefined,
                    onInput: undefined,
                    hide: { label: false },
                    placeholder: "only checks for proper email formatting",
                    defaultValue: undefined,
                    disabled: false,
                    required: false,
                    redact: false,
                    dontSave: true,
                    validity: undefined,
                    spellcheck: false,
                    autocomplete: "off",
                },
            }}
            hide={{ title: true, submit: true, reset: true }}
        />
    </CodeBlock>
    <CodeBlock title="Tel" viewSource={false}>
        <Code
            slot="source"
            lang="javascript"
            code={`
        tel: {
            name: "tel",            // (required) human-readable title
            uid: "tel",             // (required) unique identifier
            type: "tel",            // (required) input field type
            tooltip:                // description on how to use field
            "may improve input experience for users with browsers that support 'tel' type",
            onInput: undefined,     // custom function runs whenever the field changes
            hide: {                 // hide certain features from the user
                label: false            // hide field label
            },
            placeholder:            // really short description on how to use field
            "does NOT automatically enforce proper telephone format",
            defaultValue: undefined,// pre-filled field that the user can change
            disabled: false,        // prevent user from accessing field
            required: false,        // check if field is empty
            redact: false,          // hide data when field is inactive
            dontSave: true,         // do not save data to localStorage
            validity: undefined,    // custom function checks the input value
            spellcheck: false,      // toggle browser spellcheck
            autocomplete: "off",   // instruct browser to autofill if available
        },
            `}
        />
        <Form
            slot="example"
            uid="tel"
            title="tel"
            fields={{
                tel: {
                    name: "tel",
                    uid: "tel",
                    type: "tel",
                    tooltip:
                        "may improve input experience for users with browsers that support 'tel' type",
                    onInput: undefined,
                    hide: { label: false },
                    placeholder: "doesn't automatically enforce format",
                    defaultValue: undefined,
                    disabled: false,
                    required: false,
                    redact: false,
                    dontSave: true,
                    validity: undefined,
                    spellcheck: false,
                    autocomplete: "off",
                },
            }}
            hide={{ title: true, submit: true, reset: true }}
        />
    </CodeBlock>
    <CodeBlock title="Password" viewSource={false}>
        <Code
            slot="source"
            lang="javascript"
            code={`
        password: {
            name: "password",       // (required) human-readable title
            uid: "password",        // (required) unique identifier
            type: "password",       // (required) input field type
            tooltip:                // description on how to use field
                "the text field allows auto-complete and blocks line breaks and space preservation",
            onInput: undefined,     // custom function runs whenever the field changes
            hide: {                 // hide certain features from the user
                label: false            // hide field label
            },
            placeholder:            // really short description on how to use field
                "very similar to textarea, but...",
            defaultValue: undefined,// pre-filled field that the user can change
            disabled: false,        // prevent user from accessing field
            required: false,        // check if field is empty
            redact: false,          // hide data when field is inactive
            dontSave: true,         // do not save data to localStorage
            validity: undefined,    // custom function checks the input value
            spellcheck: false,      // toggle browser spellcheck
            autocomplete: "off",   // instruct browser to autofill if available
        },
            `}
        />
        <Form
            slot="example"
            uid="password"
            title="password"
            fields={{
                password: {
                    name: "password",
                    uid: "password",
                    type: "password",
                    tooltip:
                        "the text field allows auto-complete and blocks line breaks and space preservation",
                    onInput: undefined,
                    hide: { label: false },
                    placeholder: "very similar to textarea, but...",
                    defaultValue: undefined,
                    disabled: false,
                    required: false,
                    redact: false,
                    dontSave: true,
                    validity: undefined,
                    spellcheck: false,
                    autocomplete: "off",
                },
            }}
            hide={{ title: true, submit: true, reset: true }}
        />
    </CodeBlock>
    <CodeBlock title="Number" viewSource={false}>
        <Code
            slot="source"
            lang="javascript"
            code={`
        number: {
            name: "number",         // (required) human-readable title
            uid: "number",          // (required) unique identifier
            type: "number",         // (required) input field type
            tooltip: undefined      // description on how to use field
            onInput: undefined,     // custom function runs whenever the field changes
            hide: {                 // hide certain features from the user
                label: false            // hide field label
            },
            placeholder:            // really short description on how to use field
                "can only accept a numerical value",
            defaultValue: undefined,// pre-filled field that the user can change
            disabled: false,        // prevent user from accessing field
            required: false,        // check if field is empty
            redact: false,          // hide data when field is inactive
            dontSave: true,         // do not save data to localStorage
            validity: undefined,    // custom function checks the input value
            spellcheck: false,      // toggle browser spellcheck
            autocomplete: "off",   // instruct browser to autofill if available
        },
            `}
        />
        <Form
            slot="example"
            uid="number"
            title="number"
            fields={{
                number: {
                    name: "number",
                    uid: "number",
                    type: "number",
                    tooltip: undefined,
                    onInput: undefined,
                    hide: { label: false },
                    placeholder: "can only accept a numerical value",
                    defaultValue: undefined,
                    disabled: false,
                    required: false,
                    redact: false,
                    dontSave: true,
                    validity: undefined,
                    spellcheck: false,
                    autocomplete: "off",
                },
            }}
            hide={{ title: true, submit: true, reset: true }}
        />
    </CodeBlock>
    <CodeBlock title="Dropdown" viewSource={false}>
        <Code
            slot="source"
            lang="javascript"
            code={`
        dropdown: {
            name: "dropdown",       // (required) human-readable title
            uid: "dropdown",        // (required) unique identifier
            type: "dropdown",       // (required) input field type
            tooltip: undefined,     // description on how to use field
            onInput: undefined,     // custom function runs whenever the field changes
            hide: {                 // hide certain features from the user 
                label: false            // hide field label
            },
            placeholder: undefined, // really short description on how to use field
            defaultValue: {         // pre-filled field that the user can change
                option0: "this doesn't really matter", 
                option4: "option 5"
            },
            disabled: false,        // prevent user from accessing field
            required: false,        // check if field is empty
            redact: false,          // hide data when field is inactive
            dontSave: true,         // do not save data to localStorage
            validity: undefined,    // custom function checks the input value
            options: [              // (required) list of possible dropdown choices
                { uid: "option0", name: "option 1" },
                { uid: "option1", name: "option 2" },
                { uid: "option2", name: "option 3" },
                { uid: "option3", name: "option 4" },
                { uid: "option4", name: "option 5" },
                { uid: "option5", name: "option 6" },
                { uid: "option6", name: "option 7" },
                { uid: "option7", name: "option 8" },
                { uid: "option8", name: "option 9" },
            ],
            edit: {                 // dropdown editing features
                add: true,              // (required) permission for user to add dropdown choice (true = unlimited, number = fixed quantity)
                remove: true,           // (required) permission for user to remove dropdown choice (true = unlimited, number = fixed quantity)
                limit: "undefined",     // (required) limit the total amount of dropdown choices ("undefined" = unlimited, number = fixed quantity)
                persist: false          // (required) expose "options" to onInput function
            },
            multiple: true,         // accept more than one value
            compact: true,          // display number of selected instead of name of every selected
        },
            `}
        />
        <Form
            slot="example"
            uid="dropdown"
            title="dropdown"
            fields={{
                dropdown: {
                    name: "dropdown",
                    uid: "dropdown",
                    type: "dropdown",
                    tooltip:
                        "the text field allows auto-complete and blocks line breaks and space preservation",
                    onInput: undefined,
                    hide: { label: false },
                    placeholder: undefined,
                    defaultValue: {
                        option0: "this doesn't really matter",
                        option4: "option 5",
                    },
                    disabled: false,
                    required: false,
                    redact: false,
                    dontSave: true,
                    validity: undefined,
                    options: [
                        { uid: "option0", name: "option 1" },
                        { uid: "option1", name: "option 2" },
                        { uid: "option2", name: "option 3" },
                        { uid: "option3", name: "option 4" },
                        { uid: "option4", name: "option 5" },
                        { uid: "option5", name: "option 6" },
                        { uid: "option6", name: "option 7" },
                        { uid: "option7", name: "option 8" },
                        { uid: "option8", name: "option 9" },
                    ],
                    edit: {
                        add: true,
                        remove: true,
                        limit: "undefined",
                        persist: false,
                    },
                    multiple: true,
                    compact: true,
                },
            }}
            hide={{ title: true, submit: true, reset: true }}
        />
    </CodeBlock>
    <CodeBlock title="Checkbox" viewSource={false}>
        <Code
            slot="source"
            lang="javascript"
            code={`
        text: {
            name: "checkbox",       // (required) human-readable title
            uid: "checkbox",        // (required) unique identifier
            type: "checkbox",       // (required) input field type
            tooltip: undefined,     // description on how to use field
            onInput: undefined,     // custom function runs whenever the field changes
            hide: {                 // hide certain features from the user
                label: false            // hide field label
            },
            placeholder:            // really short description on how to use field
                "Test Checkbox",
            defaultValue: undefined,// pre-filled field that the user can change
            disabled: false,        // prevent user from accessing field
            required: false,        // check if field is empty
            redact: false,          // hide data when field is inactive
            dontSave: true,         // do not save data to localStorage
            validity: undefined,    // custom function checks the input value
        },
            `}
        />
        <Form
            slot="example"
            uid="checkbox"
            title="checkbox"
            fields={{
                checkbox: {
                    name: "checkbox",
                    uid: "checkbox",
                    type: "checkbox",
                    tooltip: undefined,
                    onInput: undefined,
                    hide: { label: false },
                    placeholder: "Test Checkbox",
                    defaultValue: undefined,
                    disabled: false,
                    required: false,
                    redact: false,
                    dontSave: true,
                    validity: undefined,
                },
            }}
            hide={{ title: true, submit: true, reset: true }}
        />
    </CodeBlock>
    <CodeBlock title="Switch" viewSource={false}>
        <Code
            slot="source"
            lang="javascript"
            code={`
        text: {
            name: "switch",         // (required) human-readable title
            uid: "switch",          // (required) unique identifier
            type: "switch",         // (required) input field type
            tooltip: undefined,     // description on how to use field
            onInput: undefined,     // custom function runs whenever the field changes
            hide: {                 // hide certain features from the user
                label: false            // hide field label
            },
            placeholder:            // really short description on how to use field
                "Test switch",
            defaultValue: undefined,// pre-filled field that the user can change
            disabled: false,        // prevent user from accessing field
            required: false,        // check if field is empty
            redact: false,          // hide data when field is inactive
            dontSave: true,         // do not save data to localStorage
            validity: undefined,    // custom function checks the input value
            icon: {                 // material themed icon to add aesthetic value
                on:                     // (required) material icon for on-state
                    "sentiment_satisfied",
                off:                    // (required) material icon for off-state
                    "sentiment_dissatisfied",
            },
        },
            `}
        />
        <Form
            slot="example"
            uid="switch"
            title="switch"
            fields={{
                switch: {
                    name: "switch",
                    uid: "switch",
                    type: "switch",
                    tooltip: undefined,
                    onInput: undefined,
                    hide: { label: false },
                    placeholder: "Test Switch",
                    defaultValue: undefined,
                    disabled: false,
                    required: false,
                    redact: false,
                    dontSave: true,
                    validity: undefined,
                    icon: {
                        on: "sentiment_very_satisfied",
                        off: "sentiment_very_dissatisfied",
                    },
                },
            }}
            hide={{ title: true, submit: true, reset: true }}
        />
    </CodeBlock>
    <CodeBlock title="File" viewSource={false}>
        <Code
            slot="source"
            lang="javascript"
            code={`
        text: {
            name: "file",           // (required) human-readable title
            uid: "file",            // (required) unique identifier
            type: "file",           // (required) input field type
            tooltip: undefined,     // description on how to use field
            onInput: undefined,     // custom function runs whenever the field changes
            hide: {                 // hide certain features from the user
                label: false,           // hide field label
                preview: false          // hide file previews
            },
            placeholder:            // really short description on how to use field
                "Test file",
            defaultValue: undefined,// pre-filled field that the user can change
            disabled: false,        // prevent user from accessing field
            required: false,        // check if field is empty
            redact: false,          // hide data when field is inactive
            dontSave: true,         // do not save data to localStorage
            validity: undefined,    // custom function checks the input value,
            accept: "image",        // accept certain file type(s), see MIME types
            multiple: true,         // accept more than one file
        },
            `}
        />
        <Form
            slot="example"
            uid="file"
            title="file"
            fields={{
                file: {
                    name: "file",
                    uid: "file",
                    type: "file",
                    tooltip: undefined,
                    onInput: undefined,
                    hide: { label: false, preview: false },
                    placeholder: "Test file",
                    defaultValue: undefined,
                    disabled: false,
                    required: false,
                    redact: false,
                    dontSave: true,
                    validity: undefined,
                    accept: "image",
                    multiple: true,
                },
            }}
            hide={{ title: true, submit: true, reset: true }}
        />
    </CodeBlock>
    <CodeBlock title="Group" viewSource={false}>
        <Code
            slot="source"
            lang="javascript"
            code={`
        group: {
            meta: {                 // (required) group settings
                name: "group",      // (required) human-readable title
                uid: "group",       // (required) unique identifier
                type: "group",      // (required) input field type
                override: {         // (required) additional group settings
                    label: true,        // display group label
                    feedback: true,     // aggregate all field feedback into one
                },
                tooltip:            // description attached to the group
                    "Do not try to nest groups within groups. This has not been tested and will NOT be an upcoming feature.",
            },

            // add additional fields like you would when adding to a form. 
            // below is just an example of adding an email and password field

            emailg1: {
                name: "email",
                uid: "emailg1",
                type: "email",
                hide: { label: true },
                placeholder: "email field inside a group",
                autocomplete: "off",
            },
            passwordg1: {
                name: "password",
                uid: "passwordg1",
                type: "password",
                hide: { label: true },
                placeholder: "password field inside a group",
                autocomplete: "off",
            },
        },
            `}
        />
        <Form
            slot="example"
            uid="group"
            title="group"
            fields={{
                group: {
                    meta: {
                        name: "group",
                        uid: "group",
                        type: "group",
                        override: {
                            label: true,
                            feedback: true,
                        },
                        tooltip:
                            "Do not try to nest groups within groups. This has not been tested and will NOT be an upcoming feature.",
                    },
                    emailg1: {
                        name: "email",
                        uid: "emailg1",
                        type: "email",
                        hide: { label: true },
                        placeholder: "email field inside a group",
                        autocomplete: "off",
                    },
                    passwordg1: {
                        name: "password",
                        uid: "passwordg1",
                        type: "password",
                        hide: { label: true },
                        placeholder: "password field inside a group",
                        autocomplete: "off",
                    },
                },
            }}
            hide={{ title: true, submit: true, reset: true }}
        />
    </CodeBlock>
    <CodeBlock title="Divider" viewSource={false}>
        <Code
            slot="source"
            lang="javascript"
            code={`
        divider: {
            name: "divider",        // (required) human-readable title
            uid: "divider",         // (required) unique identifier
            type: "divider",        // (required) input field type
            tooltip:                // description on how to use field
                "Some say the divider looks best when the label is hidden (which is what I've done)",
            onInput: undefined,     // custom function runs whenever the field changes
            hide: {                 // hide certail features from the user 
                label: true             // hide field label
            },
            icon: "phonelink"       // material themed icon to add aesthetic value
        },
            `}
        />
        <Form
            slot="example"
            uid="divider"
            title="divider"
            fields={{
                divider: {
                    name: "divider",
                    uid: "divider",
                    type: "divider",
                    tooltip:
                        "Some say the divider looks best when the label is hidden (which is what I've done)",
                    onInput: undefined,
                    hide: { label: true },
                    icon: "phonelink",
                },
            }}
            hide={{ title: true, submit: true, reset: true }}
        />
    </CodeBlock>
    <Note>
        <span slot="icon" class="material-icons">task_alt</span>
        <div>
            <p>
                <span
                    >Next up, <em
                        ><strong><a href="/docs/functions">Functions</a></strong
                        ></em
                    >.</span
                >
                Learn how to control form data with the functions we've come across!
            </p>
        </div>
    </Note>
</DocsTemplate>
