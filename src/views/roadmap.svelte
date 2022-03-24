<script lang="ts">
    import DocsTemplate from "../components/Docs/DocsTemplate.svelte";
    import Section from "../components/Docs/Section.svelte";
    import Code from "../components/Docs/Code.svelte";
    import Note from "../components/Docs/Note.svelte";
</script>

<DocsTemplate title="Roadmap">
    <Section title="State of Sad Forms">
        <div>
            <h3 class="h4">03 March Goals</h3>
            <ul>
                <li>
                    <span
                        class="material-icons animate-hammer"
                        aria-hidden="true">hardware</span
                    >Refactor classes to imrpove Form styling
                </li>
                <li>Revisit File Input Type</li>
            </ul>
        </div>
        <div>
            <h3 class="h4">04 April Goals</h3>
            <ul>
                <li>Implement testing library</li>
                <li>Dropdown "remove option" mobile accessibility feature</li>
                <li>Dropdown WCAG/keyboard support for Printable characters</li>
            </ul>
        </div>
        <div>
            <h3 class="h4">05 May Goals</h3>
            <ul>
                <li>Add list feature</li>
            </ul>
        </div>
    </Section>
    <Section title="Update Log">
        <div>
            <h3 class="h4">version 0.0.5</h3>
            <ul />
        </div>
        <div>
            <h3 class="h4">version 0.0.4</h3>
            <ul />
        </div>
        <div>
            <h3 class="h4">version 0.0.3</h3>
            <ul />
        </div>
        <div>
            <h3 class="h4">version 0.0.2</h3>
            <ul />
        </div>
        <div>
            <h3 class="h4">version 0.0.1</h3>
            <ul />
        </div>
        <div>
            <h3 class="h4">version 0.0.0</h3>
            <ul />
        </div>
    </Section>
    <Section title="Form Builder">
        <div>
            <h3 class="h4">03 March Goals</h3>
            <ul>
                <li>
                    <del>Responsive CSS</del>
                </li>
                <li>
                    <span
                        class="material-icons animate-hammer"
                        aria-hidden="true">hardware</span
                    >create examples for /docs/css-examples
                </li>
                <li><del>GitHub README gif update</del></li>
                <li><del>GitHub Reporting Issues Guideline</del></li>
                <li><del>GitHub Contribution Guideline</del></li>
                <li><del>GitHub Code of Conduct</del></li>
                <li>Automate "Roadmap" documentation</li>
                <li>Improve "Form Types" docmentation</li>
                <li>Improve "Functions" docmentation</li>
                <li>Improve "Supported Fields" docmentation</li>
            </ul>
        </div>
        <div>
            <h3 class="h4">04 April Goals</h3>
            <ul>
                <li>Implement testing library</li>
                <li>CSS editor panel</li>
                <li>GitHub release action</li>
            </ul>
        </div>
    </Section>
    <Section title="Known Issues">
        <div>
            <h3 class="h4">Sad Forms</h3>
            <ul>
                <li>There is no proper documentation</li>
                <li>
                    Currently 1 autosave setting, saves at every keydown, click,
                    focus, and blur event (very expensive).
                </li>
                <li>There is no list feature</li>
                <li>
                    Dropdown/Radios missing WCAG/keyboard support for Printable
                    characters
                </li>
                <li>File Input requires revisiting</li>
            </ul>
        </div>
        <div>
            <h3 class="h4">Sad Forms - Form Builder</h3>
            <ul>
                <li><del>CANNOT edit group settings</del></li>
                <li><del>CANNOT add options to Dropdown</del></li>
                <li>CANNOT reorder fields</li>
                <li><del>CANNOT copy snippet</del></li>
                <li>editing on "code" tab isn't saved</li>
                <li><del>Documentation Page is NOT setup</del></li>
                <li>Feedback Page is NOT setup</li>
                <li>and most importantly, the Donate Page is NOT setup</li>
                <li>
                    <del
                        >vErY uNproFeSsiOnAl wOrDiNG, TeXT, aNd SamPlE FoRm.</del
                    >
                </li>
            </ul>
        </div>
    </Section>
</DocsTemplate>
