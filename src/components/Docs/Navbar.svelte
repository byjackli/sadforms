<script lang="ts">
    import { onMount } from "svelte";
    import { forceUpdatePrev } from "../../static/intersection";

    const pages = {
        0: {
            title: "WELCOME",
            nested: [
                "Project Motivation",
                "Usability Testing",
                "What is Svelte?",
                "Project Setup",
            ],
        },
        1: {
            title: "COMPONENTS",
            nested: [
                "Form",
                "Field",
                "Dropdown",
                "Checkbox",
                "List",
                "Divider",
            ],
        },
        2: {
            title: "SUPPORTED FIELDS",
            nested: [
                "TextArea",
                "Text",
                "Email",
                "Tel",
                "Password",
                "Number",
                "Dropdown",
                "Checkbox",
                "Switch",
                "File",
                "Group",
                "Divider",
            ],
        },
        3: {
            title: "FUNCTIONS",
            nested: [
                "FORM onInput",
                "FORM hook",
                "FORM onSubmit",
                "FIELD onInput",
                "FIELD validation",
            ],
        },
        4: {
            title: "STYLING",
            nested: ["Header Names", "CSS Profiles", "Ingenuity Tips"],
        },
        5: {
            title: "ROADMAP",
            nested: [
                "State of SadForms",
                "Update Log",
                "Known Issues",
                "Form Builder",
            ],
        },
    };

    onMount(() => forceUpdatePrev(undefined));
</script>

<nav id="docs">
    <div class="scrolltainer">
        {#each Object.values(pages) as page (page.title)}
            {@const h1 = page.title.toLowerCase().replace(/\s+/g, "_")}
            <a
                id={`/docs/${h1}`.replace(/[\/#?]/g, "-")}
                class="page-title"
                href="/docs/{h1}">{page.title}</a
            >
            <div class="page-sections">
                {#each page.nested as section (section)}
                    {@const h2 = section.toLowerCase().replace(/\s+/g, "_")}
                    <a
                        id={`/docs/${h1}#${h2}`.replace(/[\/#?]/g, "-")}
                        class="section-title"
                        href="/docs/{h1}#{h2}">{section}</a
                    >
                {/each}
            </div>
        {/each}
    </div>
</nav>
