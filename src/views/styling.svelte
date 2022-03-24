<script lang="ts">
    import DocsTemplate from "../components/Docs/DocsTemplate.svelte";
    import Section from "../components/Docs/Section.svelte";
    import Code from "../components/Docs/Code.svelte";
    import Note from "../components/Docs/Note.svelte";
    import CodeBlock from "../components/Docs/CodeBlock.svelte";
    import Form from "$lib/components/Form.svelte";
</script>

<DocsTemplate title="Styling">
    <Section title="CSS Profiles"
        ><p>
            Sad Forms comes with many bells and whistles, but pre-styled CSS is
            not one of them; however, there are header names that help you adapt
            Sad Forms to your styleguide.
        </p>
        <p>
            If, in fact, you want a quick plug-and-play pre-styled CSS, you can
            <a href="/css/form.css" download>download</a> the same file used on this
            form builder tool.
        </p>
        <p>
            Styling is subjective; with that being said, this is an overview of
            the barebone necessities.
        </p>
        <CodeBlock hideButton>
            <Code
                slot="a"
                lang="css"
                code={`
        /*  FORM  */
        .sf { }                     /* form container */
        .sf h2 { }                  /* form title */
        .sf p { }                   /* form description */
        .sf form { }                /* form element */
        .sf .trailingButtons { }    /* form buttons (reset, submit) */


        /*  FIELD & GROUP CONTAINERS  */
        .sf .form-block { }         /* field container */
        .sf .form-group { }         /* group container */


        /*  FIELD  */
        .sf .field { }              /* FIELD  */
        .sf .disabled .field { }    /* FIELD: disabled */
        .sf .items .field { }       /* FIELD: within a group  */


        /*  FIELD - label  */
        .sf label, .sf legend { }
        .sf label *, .sf legend * { }


        /*  FIELD:placeholder  */
        .sf input::placeholder, .sf textarea::placeholder,
        .sf .dropdown-container .option-empty:not(.redact) { }


        /*  FIELD - switch  */
        .sf .switch-container { }                                                   /* switch: container */
        .sf .switch-container span { }                                              /* switch: on & off icon */
        .sf .switch[aria-checked="false"] .switch-container span:first-of-type { }  /* switch: off icon - off state */
        .sf .switch[aria-checked="true"] .switch-container span:last-of-type { }    /* switch: on icon - on state */
        .sf .switch .switch-state { }                                               /* switch: background & off state */
        .sf .switch[aria-checked="true"] .switch-state { }                          /* switch: background - on state */


        /*  FIELD - dropdown  */
        .sf .dropdown-container { }                     /* dropdown: container */
        .sf .dropdown-container.active { }              /* dropdown: container - active */
        .sf .dropdown > span:first-of-type { }          /* dropdown: preview of selected */
        .sf .option-container { }                       /* dropdown - option: container */
        .sf .option-container > div, .sf .option { }    /* dropdown - option */
        .sf .option > span { }                          /* dropdown - option: label */
        .sf .option.active,
        .sf input.option.active ~ .edit-details * { }   /* dropdown - option - active */


        /*  FIELD - dropdown - EDITING FEATURE  */
        .sf .option.adding-container { }                /* dropdown - option: add container */
        .sf .option.adding-container .edit-details { }  /* dropdown - option: add container: edit details */
        .sf div.option input { }                        /* dropdown - option: add */
        .sf div.option input::placeholder { }           /* dropdown - option: add: placeholder */
        .sf div.option input.active::placeholder { }    /* dropdown - option: add: placeholder - active */
        .sf .option-actions { }                         /* dropdown - option: add - actions */
        .sf .option-actions span { }                    /* dropdown - option: add - actions: icons */
        .sf .option-del { }                             /* dropdown - option: add - actions: delete */


        /*  FIELD - divider  */
        .sf .divider { }                            /* divider: container */
        .sf .divider span:first-of-type { }         /* divider: icon */
        .sf .divider span:last-of-type { }          /* divider: title */
        .sf .divider hr { }                         /* divider: line */


        /*  FIELD - feedback  */
        .sf .container-tooltip { }                  /* feedback: tooltip */

        .sf .container-validity { }                 /* feedback: validity */
        .sf .container-validity.active { }          /* feedback: validity - active */
        .sf .condition-true { }                     /* feedback: validity - condition true */
        .sf .condition-false { }                    /* feedback: validity - condition false */

        .sf .container-preview { }                  /* feedback: preview container */
        .sf .container-preview.active { }           /* feedback: preview - active */
        .sf .preview { }                            /* feedback: preview */

        .sf .container-preview.redact::after { }    /* feedback: redact preview */
        .sf .field.redact::after { }                /* feedback: redact checkbox */

        .sf .field.redact:hover::after, 
        .sf .field.redact:focus::after, 
        .sf .container-preview:hover::after,    
        .sf .container-preview:focus::after { } 


        .sf .form-block.warn .field { }             /* feedback: warn - field */
        .sf .form-group.warn .items { }             /* feedback: warn - group */
        .sf .warn label, .sf .warn legend,          
        .sf .warn label *, .sf .warn legend * { }   /* feedback: warn - labels */


        /*  FORM - hide aria  */
        .sf .for-aria { 
            max-width: 0;
            max-height: 0;
            margin: 0;
            padding: 0;
            position: fixed;
            top: 0;
            left: 0;
            overflow: hidden;
        }

`}
            />
        </CodeBlock>
    </Section>
    <Section title="Header Names">
        <p>
            Sad Forms also provides the option of styling specific fields and
            their associated components.
        </p>
        <p>
            These header names are scoped to the id attribute and have trailing
            unique fieldid's. The current list is as shown.
        </p>
        <ul class="language-highlight">
            <li><span class="token hilite1">sf:block/</span></li>
            <li><span class="token hilite2">sf:visual/</span></li>
            <li><span class="token hilite3">sf:group-feedback/</span></li>
            <li><span class="token hilite4">sf:group/</span></li>
            <li><span class="token hilite5">sf:input-feedback/</span></li>
            <li><span class="token hilite6">sf:input-preview/</span></li>
            <li><span class="token hilite7">sf:input/</span></li>
            <li><span class="token hilite8">sf:label/</span></li>
        </ul>
        <p>
            Group feedback has an <a href="/docs/supported_fields#group"
                >overriding feature</a
            > that allows the group to aggregate all input field feedback into one;
            meaning only one or the other can be present.
        </p>
        <CodeBlock
            sideA={{ icon: "code", text: "code" }}
            sideB={{ icon: "science", text: "demo" }}
        >
            <Code
                slot="a"
                lang="highlight"
                match={{
                    id: {
                        pattern: /(id=")+[\S]+\//,
                        inside: {
                            hilite1: /(sf:block\/)/,
                            hilite2: /(sf:visual\/)/,
                            hilite3: /(sf:group-feedback\/)/,
                            hilite4: /(sf:group\/)/,
                            hilite5: /(sf:input-feedback\/)/,
                            hilite6: /(sf:input-preview\/)/,
                            hilite7: /(sf:input\/)/,
                            hilite8: /(sf:label\/)/,
                        },
                    },
                }}
                code={`
        <div id="example" class="sf sf-container">
            <form autocomplete="on" tabindex="-1">
                <div class="form-block type:divider " id="sf:block/mydividerid"> 
                    <div class="divider" id="sf:visual/mydividerid">
                        <span aria-disabled="true" class="material-icons">person</span> 
                        <span>Profile Setup</span> 
                        <hr>
                    </div>
                    <div class="container-tooltip" aria-hidden="true">
                        <span aria-hidden="true" class="material-icons">tips_and_updates</span> 
                        <p>Choose a display name and profile picture! </p>
                    </div>  
                </div>
                <div class="form-group" role="group" id="sf:group/mygroupid">
                    <div class="items"> 
                        <div class="form-block type:text" id="sf:block/mytextid">
                            <label id="sf:label/mytextid" for="sf:input/mytextid">Display Name</label>
                            <input id="sf:input/mytextid" class="field " name="Display Name" type="text" placeholder="Display Name" spellcheck="undefined">  
                            <div class="container-validity active" id="sf:input-feedback/mytextid" aria-live="polite">
                                <p class="condition-true">
                                    <span class="for-aria">feedback 1 is valid;</span>Special characters are not allowed<span class="for-aria">.</span>
                                </p>
                                <p class="condition-true">
                                    <span class="for-aria">feedback 2 is valid;</span>Dispaly name length is just right 👨&zwj;🍳<span class="for-aria">.</span></p>
                            </div>
                        </div>
                        <div class="form-block type:file" id="sf:block/myfileid">
                            <label id="sf:label/myfileid" for="sf:input/myfileid">
                                Profile Picture 
                                <em aria-hidden="true">*required</em>
                                <span class="for-aria">required</span>
                            </label> 
                            <input id="sf:input/myfileid" class="field " name="Profile Picture" type="file" accept="image/jpeg, image/png, image/gif" placeholder="great" spellcheck="false">   
                            <div class="container-preview active" id="sf:input-preview/myfileid" aria-live="polite">
                                <div class="preview" title="ok.jpg">
                                    <span class="material-icons">image</span>
                                    <p>ok.jpg</p>
                                </div>
                            </div>
                        </div>
                    </div>  
                </div> 
                <div class="form-block type:checkbox warn" id="sf:block/751014b9-a6f1-42e0-a3f9-44877b8ebbec">
                    <label id="sf:label/751014b9-a6f1-42e0-a3f9-44877b8ebbec" for="sf:input/751014b9-a6f1-42e0-a3f9-44877b8ebbec">
                        Did You Smile Today? 
                        <em aria-hidden="true">*required</em>
                        <span class="for-aria">required</span> 
                    </label> 
                    <div class="field checkbox noselect " id="sf:input/751014b9-a6f1-42e0-a3f9-44877b8ebbec" name="Did You Smile Today?" disabled="false" aria-disabled="false" aria-labelledby="sf:label/751014b9-a6f1-42e0-a3f9-44877b8ebbec" aria-checked="false" role="checkbox" tabindex="0">
                        <span>Must accept before continuing!</span> 
                        <span aria-hidden="true" class="material-icons">check_box_outline_blank</span>
                    </div>
                    <div class="container-validity active" id="sf:input-feedback/751014b9-a6f1-42e0-a3f9-44877b8ebbec" aria-live="polite">
                        <p class="condition-false">
                            <span class="for-aria">feedback 1 is NOT valid;</span>Must accept to continue!<span class="for-aria">.</span>
                        </p>
                    </div>
                </div>
                <div class="trailingButtons"></div>
            </form>
        </div>`}
            />
            <Form
                slot="b"
                uid="example"
                title="example"
                fields={{
                    mydividerid: {
                        name: "Profile Setup",
                        uid: "mydividerid",
                        type: "divider",
                        tooltip: "Choose a display name and profile picture! ",
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
                                            value.match(/^[a-zA-Z0-9]+$/) !==
                                                null,
                                        true: "Special characters are not allowed",
                                        false: "Special characters are not allowed 😞",
                                    },
                                    length: {
                                        check:
                                            typeof value === "string" &&
                                            5 < len,
                                        true: "Dispaly name length is just right 👨‍🍳",
                                        false: `Length is too short, need ${
                                            6 - len
                                        } more character(s)!`,
                                    },
                                };
                            },
                        },
                        myfileid: {
                            name: "Profile Picture",
                            uid: "myfileid",
                            type: "file",
                            placeholder: "great",
                            required: true,
                            accept: "image/jpeg, image/png, image/gif",
                            spellcheck: false,
                        },
                    },
                    "751014b9-a6f1-42e0-a3f9-44877b8ebbec": {
                        name: "Did You Smile Today?",
                        uid: "751014b9-a6f1-42e0-a3f9-44877b8ebbec",
                        type: "checkbox",
                        tooltip: "",
                        hide: {},
                        placeholder: "Must accept before continuing!",
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
                hide={{ title: true, submit: true, reset: true }}
            />
        </CodeBlock></Section
    >
    <Section title="CSS Examples">
        <p>
            Utilize your CSS and HCI skills to take your form component to the
            next level!
        </p>
        <p>Some things you could try include BUT are not limited to:</p>
        <ul>
            <li>animations on hover state</li>
            <li>animations on click states</li>
            <li>reversing order of fields</li>
            <li>.. and so much more</li>
        </ul>
        <p>
            The following examples are all the same as the example from the
            previous sectionm with the only difference being the CSS files.
        </p>
        <p>
            Some forms may ressemble styleguides from larger companies, which is
            only done for demonstration purposes only.
        </p>

        <div>
            <Note
                ><span slot="icon">🙏</span>
                <p>
                    Please bear with me while I revise the Form component (which
                    will greatly increase the number of styling combinations)!
                </p>
                <br />
                <p>
                    <strong>tldr;</strong> BEAUTIFUL examples coming soon!!
                </p></Note
            >
            <!-- <CodeBlock
                sideA={{ icon: "code", text: "code" }}
                sideB={{ icon: "science", text: "demo" }}
            >
                <Form
                    slot="a"
                    uid="example-variant1"
                    title="example"
                    fields={{
                        mydividerid: {
                            name: "Profile Setup",
                            uid: "mydividerid",
                            type: "divider",
                            tooltip:
                                "Choose a display name and profile picture! ",
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
                            mytextid: {
                                uid: "mytextid",
                                name: "Display Name",
                                type: "text",
                                placeholder: "Display Name",
                                dontSave: true,
                                validity: function (value) {
                                    const len =
                                        value !== undefined && value.length;

                                    return {
                                        noSpecial: {
                                            check:
                                                typeof value === "string" &&
                                                value.match(
                                                    /^[a-zA-Z0-9]+$/
                                                ) !== null,
                                            true: "Special characters are not allowed",
                                            false: "Special characters are not allowed 😞",
                                        },
                                        length: {
                                            check:
                                                typeof value === "string" &&
                                                5 < len,
                                            true: "Dispaly name length is just right 👨‍🍳",
                                            false: `Length is too short, need ${
                                                6 - len
                                            } more character(s)!`,
                                        },
                                    };
                                },
                            },
                            myfileid: {
                                name: "Profile Picture",
                                uid: "myfileid",
                                type: "file",
                                placeholder: "great",
                                required: true,
                                accept: "image/jpeg, image/png, image/gif",
                                spellcheck: false,
                            },
                        },
                        "751014b9-a6f1-42e0-a3f9-44877b8ebbec": {
                            name: "Did You Smile Today?",
                            uid: "751014b9-a6f1-42e0-a3f9-44877b8ebbec",
                            type: "checkbox",
                            tooltip: "",
                            hide: {},
                            placeholder: "Must accept before continuing!",
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
                    hide={{ title: true, submit: true, reset: true }}
                />
                <Code slot="b" lang="css" />
            </CodeBlock> -->
        </div>
    </Section>
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
