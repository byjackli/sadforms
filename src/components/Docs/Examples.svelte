<script lang="ts">
    import Form from "$lib/components/Form.svelte";
    import CodeBlock from "./CodeBlock.svelte";
    import Code from "./Code.svelte";

    import { onMount } from "svelte";

    const examples = ["ex0", "ex1", "ex2", "ex3", "ex4", "ex5"];
    let style: HTMLElement,
        active: string = "ex1";

    function updateExamples(event: MouseEvent): void {
        const id = (event.target as HTMLElement)
            .closest(".exampleID")
            .getAttribute("id");

        active = id;
        style.setAttribute("href", `/css/examples/${id}.css`);
    }

    onMount(() => (style = document.getElementById("examples")));
</script>

<div class="example">
    <CodeBlock
        sideA={{ icon: "science", text: "example" }}
        sideB={{ icon: "code", text: "CSS code" }}
    >
        <Form
            slot="a"
            uid="example"
            title="Example"
            fields={{
                mydividerid: {
                    name: "Create your account",
                    uid: "mydividerid",
                    type: "divider",
                    tooltip: "to see the latest memes!",
                    hide: {
                        label: true,
                    },
                    icon: "person",
                    spellcheck: false,
                },
                mygroupid: {
                    meta: {
                        uid: "mygroupid",
                        name: "group",
                    },
                    firstname: {
                        uid: "firstname",
                        name: "First name",
                        type: "text",
                        dontSave: true,
                    },
                    lastname: {
                        uid: "lastname",
                        name: "Last name",
                        type: "text",
                        dontSave: true,
                    },
                },
                mytextid: {
                    uid: "mytextid",
                    name: "Display Name",
                    type: "text",
                    placeholder: "Display Name",
                    dontSave: true,
                    validity: function (value) {
                        const len = value !== undefined && value.length;

                        return {
                            noSpecial: {
                                check:
                                    typeof value === "string" &&
                                    value.match(/^[a-zA-Z0-9]+$/) !== null,
                                true: "Special characters are not allowed",
                                false: "Special characters are not allowed 😞",
                            },
                            length: {
                                check: typeof value === "string" && 5 < len,
                                true: "Dispaly name length is just right 👨‍🍳",
                                false: `Length is too short, need ${
                                    6 - len
                                } more character(s)!`,
                            },
                        };
                    },
                },
                "751014b9-a6f1-42e0-a3f9-44877b8ebbec": {
                    name: "Did You Smile Today?",
                    uid: "751014b9-a6f1-42e0-a3f9-44877b8ebbec",
                    type: "checkbox",
                    tooltip: "",
                    hide: {},
                    placeholder: " ",
                    required: true,
                    validity: function (value) {
                        return {
                            condition1: {
                                check: !!value,
                                true: "Glad you smiled today 😊",
                                false: "Must accept to continue!",
                            },
                        };
                    },
                },
            }}
        />

        <Code slot="b" lang="css" />
    </CodeBlock>
    <div class="select-example" on:click={(event) => updateExamples(event)}>
        {#each examples as id (id)}
            <button
                class={`exampleID pill${id === active ? "" : " nofill"}`}
                {id}>{id}</button
            >
        {/each}
    </div>
</div>
