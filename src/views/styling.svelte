<script lang="ts">
    import DocsTemplate from "../components/Docs/DocsTemplate.svelte";
    import Section from "../components/Docs/Section.svelte";
    import Code from "../components/Docs/Code.svelte";
    import Note from "../components/Docs/Note.svelte";
</script>

<DocsTemplate title="Styling">
    <Section title="Header Names"><p>It's in the works..</p></Section>
    <Section title="CSS Profiles"><p>..hang in there..</p></Section>
    <Section title="Ingenuity Tips"><p>..coming really soon!</p></Section>
    <Note>
        <span slot="icon" class="material-icons">task_alt</span>
        <div>
            <p>
                If you're curious about the past OR the future, up next is <em
                    ><strong><a href="/docs/roadmap">Roadmap</a></strong></em
                >.
            </p>
        </div>
    </Note>
</DocsTemplate>
