<script lang="ts">
    import DocsTemplate from "../components/Docs/DocsTemplate.svelte";
    import Section from "../components/Docs/Section.svelte";
    import CodeBlock from "../components/Docs/CodeBlock.svelte";
    import Code from "../components/Docs/Code.svelte";
    import Note from "../components/Docs/Note.svelte";
</script>

<DocsTemplate title="Functions">
    <Section title="FORM onInput">
        <div class="split">
            <CodeBlock
                hideButton
                side="b"
                sideA={{ icon: "data_object", text: "param" }}
                sideB={{ icon: "psychology", text: "function" }}
            >
                <Code
                    slot="b"
                    lang="typescript"
                    code={`
        function onInput(formData: Data): void {
            // your code goes here
        }
        `}
                />
                <Code
                    slot="a"
                    lang="typescript"
                    code={`
        export type Data = {
            submit: { submitting: boolean, accepted: boolean, attempted: boolean },
            data: Record<string, (Field | Record<string, Field>)>,
            required: Record<string, (boolean | Record<string, boolean>)>,
            onInput: Record<string, (Function | Record<string, Function>)>,
            validity: Record<string, (Validity | Record<string, Validity>)>,
            verdict: Record<string, (Verdict | Record<string, Verdict>)>,
            preview: Record<string, (boolean | Record<string, boolean>)>,
            redact: Record<string, (boolean | Record<string, boolean>)>,
            touched: Record<string, (boolean | Record<string, boolean>)>,
            value: Record<string, (unknown | Record<string, unknown>)>,
            active: Record<string, (boolean | Record<string, boolean>)>,
            dontSave: Record<string, (DontSave | Record<string, DontSave>)>,
            group: Record<string, Group>
        }
        `}
                />
            </CodeBlock>
            <div class="details-container">
                <div class="details-chunk">
                    <h3 class="h4">When is it fired?</h3>
                    <ul>
                        <li>on submit</li>
                        <li>on focus</li>
                        <li>on blur</li>
                        <li>on click</li>
                        <li>on keydown</li>
                    </ul>
                </div>
                <div class="details-chunk">
                    <h3 class="h4">What is accessible?</h3>
                    <ul>
                        <li><a href="/docs/form_types#data">Data</a> object</li>
                    </ul>
                </div>
            </div>
        </div>
    </Section>
    <Section title="FORM afterFormLoad">
        <div class="split">
            <CodeBlock
                hideButton
                side="b"
                sideA={{ icon: "data_object", text: "param" }}
                sideB={{ icon: "psychology", text: "function" }}
            >
                <Code
                    slot="b"
                    lang="typescript"
                    code={`
        function afterFormLoad(refresh: function): void {
            // your code goes here
        }

        function refresh(clean: boolean): void {
            // if clean === "true" will reset the form after form load
            // otherwise form will reload without resetting the form 

            // *note: if refresh is called, 
            // ensure there is a breaking condition
            // otherwise the form will be trapped in a loop
        }
        `}
                />
            </CodeBlock>
            <div class="details-container">
                <div class="details-chunk">
                    <h3 class="h4">When is it fired?</h3>
                    <ul>
                        <li>after form loads</li>
                    </ul>
                </div>
                <div class="details-chunk">
                    <h3 class="h4">What is accessible?</h3>
                    <ul>
                        <li>refresh function</li>
                    </ul>
                </div>
            </div>
        </div>
    </Section>
    <Section title="FORM onSubmit">
        <div class="split">
            <CodeBlock
                hideButton
                side="b"
                sideA={{ icon: "data_object", text: "param" }}
                sideB={{ icon: "psychology", text: "function" }}
            >
                <Code
                    slot="b"
                    lang="typescript"
                    code={`
        function onSubmit(formData: Data): void {
            // your code goes here
        }
        `}
                />
            </CodeBlock>
            <div class="details-container">
                <div class="details-chunk">
                    <h3 class="h4">When is it fired?</h3>
                    <ul>
                        <li>on submit</li>
                    </ul>
                </div>
                <div class="details-chunk">
                    <h3 class="h4">What is accessible?</h3>
                    <ul>
                        <li><a href="/docs/form_types#data">Data</a> object</li>
                    </ul>
                </div>
            </div>
        </div>
    </Section>
    <Section title="FIELD onInput">
        <div class="split">
            <CodeBlock
                hideButton
                side="b"
                sideA={{ icon: "data_object", text: "param" }}
                sideB={{ icon: "psychology", text: "function" }}
            >
                <Code
                    slot="b"
                    lang="typescript"
                    code={`
        function onInput(fieldData: any): void {
            // your code goes here

            // fieldData = {
            //      value: Value
            //
            //  (following are only preset in type Dropdown)
            //      submit?: boolean    
            //      persist?: Record<string, string> (if persist is true)
            // }
        }
        `}
                />
            </CodeBlock>
            <div class="details-container">
                <div class="details-chunk">
                    <h3 class="h4">When is it fired?</h3>
                    <ul>
                        <li>on submit</li>
                        <li>on focus</li>
                        <li>on blur</li>
                        <li>on click</li>
                        <li>on keydown</li>
                    </ul>
                </div>
            </div>
        </div>
    </Section>
    <Section title="FIELD validation">
        <div class="split">
            <CodeBlock
                hideButton
                side="b"
                sideA={{ icon: "data_object", text: "param" }}
                sideB={{ icon: "psychology", text: "function" }}
            >
                <Code
                    slot="b"
                    lang="typescript"
                    code={`
        function validity(value: Value): void {
            // your code goes here

            // **RECOMMENDED: check for typeof value
            // field type checkbox & switch -> value: (boolean | undefined)
            // field type number            -> value: number
            // field type dropdown          -> value: Record<string, string>
            // all other supported fields   -> value: string
        }
        `}
                />
            </CodeBlock>
            <div class="details-container">
                <div class="details-chunk">
                    <h3 class="h4">When is it fired?</h3>
                    <ul>
                        <li>on submit</li>
                        <li>on focus</li>
                        <li>on blur</li>
                        <li>on click</li>
                        <li>on keydown</li>
                    </ul>
                </div>
                <div class="details-chunk">
                    <h3 class="h4">What is accessible?</h3>
                    <ul>
                        <li>
                            <a href="/docs/form_types#data">Value</a> object
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </Section>
    <Note>
        <span slot="icon" class="material-icons">task_alt</span>
        <div>
            <p>
                Next up, <em
                    ><strong><a href="/docs/styling">Styling</a></strong></em
                >. Load your own color palette and design language to create a
                seamless design.
            </p>
        </div>
    </Note>
</DocsTemplate>
