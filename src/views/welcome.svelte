<script lang="ts">
    import DocsTemplate from "../components/Docs/DocsTemplate.svelte";
    import Section from "../components/Docs/Section.svelte";
    import Code from "../components/Docs/Code.svelte";
    import Note from "../components/Docs/Note.svelte";
</script>

<DocsTemplate title="welcome">
    <Section title="Project Motivation">
        <p>
            <strong>Sad Forms</strong> is an advanced form suite designed specifically
            for complex large-scale Svelte Projects.
        </p>
        <p>
            One of the biggest selling point of Sad Forms is the attention to
            detail on web accessibility. Explore other features by exploring the
            documentation or tinkering with the built-in form builder; see <a
                href="/edit#sample%7C">Sample Form</a
            > for an immediate example.
        </p>
        <p>
            This project is created and maintained <a
                href="https://twitter.com/byjackli">@byjackli</a
            >.
            <span
                >See <a href="/docs/roadmap">roadmap</a> for upcoming features and
                version log.</span
            >
        </p>
        <Note>
            <span slot="icon" class="material-icons">warning</span>
            <p>
                Do not create projects using the Sample Form; it <strong
                    ><em>resets</em></strong
                > after every session!
            </p>
        </Note>
    </Section>
    <Section title="Usability Testing">
        <p>Sad Forms was tested on the following software and hardware:</p>
        <ul>
            <li>Pixel 3 Android v12 Chrome (and with TalkBack)</li>
            <li>iPhone SE 2 iOS v15.3.1 v12 Chrome (and with VoiceOver)</li>
            <li>iPhone SE 2 iOS v15.3.1 v12 Safari (and with VoiceOver)</li>
            <li>Windows 11 Firefox (and with NVDA)</li>
            <li>Windows 11 Chrome (and with NVDA)</li>
            <li>Windows 11 Edge (and with NVDA)</li>
        </ul>
    </Section>
    <Section title="What is Svelte?">
        <p>
            Svelte is a front-end framework compiler. It is often compared to
            other popular front-end frameworks like React, Angular, and Vue.
        </p>
        <p>
            Having a Svelte project is a pre-requisite to setting up Sad Forms.
        </p>
        <p>
            To learn more about how to get started with Svelte, or if Svelte is
            the right choice for you, visit <a
                href="https://kit.svelte.dev"
                rel="noreferrer"
                target="_blank">kit.svelte.dev</a
            >.
        </p>
    </Section>
    <Section title="Project Setup">
        <Code>
            <span
                >npm install <span class="token important">sadforms</span>
            </span>
        </Code>
        <Code
            lang="svelte"
            code={`  
        \<script lang\=\"ts\"\>
            import Form from \"sadforms\"\;

            const data = {
                uid: "8310f3b8-f4ba-484e-a3fd-ea1eb3fc8fba",
                title: "Sample Form v2",
                fields: {
                    "8310f3b8-f4ba-484e-a3fd-ea1eb3fc8fba": {
                        "name": "First Name",
                        "uid": "8310f3b8-f4ba-484e-a3fd-ea1eb3fc8fba",
                        "type": "text",
                        "required": true,
                        "spellcheck": false,
                        "autocomplete": "name"
                    },
                    "a0b21c64-e6c1-476e-89dc-4ac7a5778720": {
                        "name": "Last Name",
                        "uid": "a0b21c64-e6c1-476e-89dc-4ac7a5778720",
                        "type": "text",
                        "spellcheck": false,
                        "autocomplete": "family-name"
                    },
                }
            }
        \<\/script\>

        <Form {...data} />
            `}
        />
    </Section>
    <Note>
        <span slot="icon" class="material-icons">task_alt</span>
        <div>
            <p>
                <span
                    >Next up, <em
                        ><strong
                            ><a href="/docs/components">Components</a></strong
                        ></em
                    >.</span
                >
                Discover all form and field configuration options!
            </p>
        </div>
    </Note>
</DocsTemplate>
