<script lang="ts">
    import DocsTemplate from "../components/Docs/DocsTemplate.svelte";
    import Section from "../components/Docs/Section.svelte";
    import Code from "../components/Docs/Code.svelte";
    import Note from "../components/Docs/Note.svelte";
</script>

<DocsTemplate title="Functions">
    <Section title="placeholder" />
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
