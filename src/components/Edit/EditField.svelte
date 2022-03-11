<script lang="ts">
    import type { SvelteComponent } from "svelte";
    import type { Edit, Field, Group } from "$lib/types/Form";
    import Form from "$lib/components/Form.svelte";

    import SadForms, {
        checkFunc,
        reviver,
        setRefresh,
        updateForm,
        updateSave,
    } from "../../store/SadForms";
    import {
        makeToData,
        makeToOptions,
        newType,
        parseHide,
    } from "../../presets";
    import { belongs, uuidV4 } from "$lib/tools/kit";

    export let main: SvelteComponent;

    let maData: Record<string, string>, maValue: string;

    $: data = $SadForms.data;
    $: fieldid = $SadForms.editing.fieldid;
    $: groupid = $SadForms.editing.groupid;
    $: fields = $SadForms && editFields();

    function groupFields(): Record<string, any> {
        const value = data.fields[groupid] as Group;

        return {
            header: {
                uid: "header",
                name: "Group Settings",
                type: "divider",
                icon: "table_rows",
                hide: { label: true },
            },
            name: {
                uid: "name",
                name: "Group Name",
                type: "text",
                required: true,
                defaultValue: value.meta.name,
            },
            tooltip: {
                uid: "tooltip",
                name: "group tooltip",
                type: "text",
                defaultValue: value.meta.tooltip,
            },
            required: {
                uid: "required",
                name: "Require All Fields",
                type: "checkbox",
                hide: { label: true },
                defaultValue: value.meta.required,
            },
            redact: {
                uid: "redact",
                name: "Mask All Data",
                type: "checkbox",
                hide: { label: true },
                defaultValue: value.meta.redact,
            },
            group: {
                uid: "group",
                name: "Group Options",
                type: "dropdown",
                multiple: true,
                options: [
                    { uid: "label", name: "Label" },
                    { uid: "feedback", name: "Feedback" },
                ],
                defaultValue: parseHide(value.meta.group),
            },
            dropdown: {
                uid: "dropdown",
                name: "add new field to group",
                placeholder: "add new field to group",
                type: "dropdown",
                data: maData,
                options: [
                    { uid: "option0", name: "textarea" },
                    { uid: "option1", name: "text" },
                    { uid: "option2", name: "email" },
                    { uid: "option3", name: "tel" },
                    { uid: "option4", name: "password" },
                    { uid: "option5", name: "number" },
                    { uid: "option6", name: "dropdown" },
                    { uid: "option7", name: "checkbox" },
                    { uid: "option8", name: "switch" },
                    { uid: "option9", name: "file" },
                    { uid: "option10", name: "time" },
                ],
                onInput: function input(target) {
                    if (!target.submit) return;

                    maData = target.value;
                    maValue = Object.values(maData)[0];
                    const uid = uuidV4(),
                        group = data.fields[groupid];

                    data.fields[groupid] = {
                        ...group,
                        [uid]: newType(maValue, uid),
                    };
                    updateForm(data);
                    updateSave();
                    main.refresh();
                },
                hide: { label: true },
            },
        };
    }
    function editFields(): Record<string, any> {
        const value = groupid
            ? data.fields[groupid][fieldid]
            : data.fields[fieldid];
        // value.type === "divider"
        // value.type === "switch"

        let basics = {
                header: {
                    uid: "header",
                    name: "Field Settings",
                    type: "divider",
                    icon: "crop_7_5",
                    hide: { label: true },
                },
                name: {
                    uid: "name",
                    name: "Label",
                    type: "text",
                    defaultValue: value.name,
                    placeholder: "🤔 something creative",
                    required: true,
                },
                uid: {
                    uid: "uid",
                    name: "Custom ID",
                    type: "text",
                    defaultValue: value.uid,
                    disabled: true,
                },
                type: {
                    uid: "type",
                    name: "field type",
                    defaultValue: value.type,
                    disabled: true,
                },
                tooltip: {
                    uid: "tooltip",
                    name: "Tooltip",
                    type: "text",
                    defaultValue: value.tooltip,
                    placeholder: "If the placeholder doesn't fit your needs.",
                },
                onInput: {
                    uid: "onInput",
                    name: "onInput",
                    type: "textarea",
                    defaultValue: value.onInput,
                    placeholder:
                        "Function is fired every time the field is changed.\n\nThe function has access to the field value, HTMLElement, and more.",
                    validity: checkFunc,
                },
                hide: {
                    uid: "hide",
                    name: "Hide Features",
                    type: "dropdown",
                    defaultValue: value.hide
                        ? parseHide(value.hide)
                        : undefined,
                    multiple: true,
                    options: [{ uid: "label", name: "Label" }],
                },
            },
            midware = {},
            plus = {};

        if (["divider"].includes(value.type)) {
            midware = {};
        } else {
            midware = {
                placeholder: {
                    uid: "placeholder",
                    name: "Placeholder",
                    type: "text",
                    defaultValue: value.placeholder,
                    placeholder: "Teach the user how to use the field.",
                },
                defaultValue: {
                    uid: "defaultValue",
                    name: "Default Value",
                    type: value.type,
                    defaultValue: value.defaultValue,
                    placeholder: "Motivate a response from the user.",
                    options: ["dropdown", "radio"].includes(value.type)
                        ? value.options
                        : undefined,
                    multiple: ["dropdown", "radio"].includes(value.type)
                        ? value.multiple
                        : undefined,
                    tooltip: ["dropdown", "radio"].includes(value.type)
                        ? "Help"
                        : undefined,
                },
                disabled: {
                    uid: "disabled",
                    name: "Disable Field",
                    type: "checkbox",
                    hide: { label: true },
                    defaultValue: value.disabled,
                },
                required: {
                    uid: "required",
                    name: "Require Field",
                    type: "checkbox",
                    hide: { label: true },
                    defaultValue: value.required,
                },
                redact: {
                    uid: "redact",
                    name: "Mask data",
                    type: "checkbox",
                    hide: { label: true },
                    defaultValue: value.redact,
                },
                dontSave: {
                    uid: "dontSave",
                    name: "Don't Save",
                    type: "checkbox",
                    hide: { label: true },
                    defaultValue: value.dontSave,
                    tooltip:
                        "If localSave is turned on, toggling this will reset your demo's local save.",
                },
                validity: {
                    uid: "validity",
                    name: "Validation",
                    type: "textarea",
                    defaultValue: value.validity,
                    placeholder:
                        "Function is fired every time the field is focused, blurred, and changed.\n\nThe function has access to the field value.",
                    validity: (value: string) => checkFunc(value, "Rule"),
                },
            };
        }

        if (value.type === "file")
            plus = {
                accept: {
                    uid: "accept",
                    name: "Accept Certain File Types",
                    type: "text",
                    defaultValue: value.accept,
                    tooltip: "[Common MIME Types]",
                },
                multiple: {
                    uid: "multiple",
                    name: "Accept Multiple Files",
                    type: "checkbox",
                    hide: { label: true },
                    defaultValue: value.multiple,
                    tooltip:
                        "If localSave is turned on, toggling this will reset your demo's local save.",
                },
                hide: {
                    uid: "hide",
                    name: "Hide Features",
                    type: "dropdown",
                    defaultValue: value.hide
                        ? parseHide(value.hide)
                        : undefined,
                    multiple: true,
                    options: [
                        { uid: "label", name: "Label" },
                        { uid: "preview", name: "Preview" },
                    ],
                },
            };
        else if (
            ["text", "textarea", "email", "tel", "password"].includes(
                value.type
            )
        ) {
            plus = {
                spellcheck: {
                    uid: "spellcheck",
                    name: "Spellcheck",
                    type: "checkbox",
                    hide: { label: true },
                    defaultValue: value.spellcheck,
                },
                autocomplete: {
                    uid: "autocomplete",
                    name: "Autocomplete",
                    type: "dropdown",
                    defaultValue: value.autocomplete
                        ? {
                              [value.autocomplete]: `${value.autocomplete}`,
                          }
                        : undefined,
                    options: [
                        { uid: "name", name: "name" },
                        {
                            uid: "honorific-prefix",
                            name: "honorific-prefix",
                        },
                        { uid: "given-name", name: "given-name" },
                        {
                            uid: "additional-name",
                            name: "additional-name",
                        },
                        { uid: "family-name", name: "family-name" },
                        {
                            uid: "honorific-suffix",
                            name: "honorific-suffix",
                        },
                        { uid: "nickname", name: "nickname" },
                        { uid: "email", name: "email" },
                        { uid: "username", name: "username" },
                        { uid: "new-password", name: "new-password" },
                        {
                            uid: "current-password",
                            name: "current-password",
                        },
                        {
                            uid: "one-time-code",
                            name: "one-time-code",
                        },
                        {
                            uid: "organization-title",
                            name: "organization-title",
                        },
                        { uid: "organization", name: "organization" },
                        {
                            uid: "street-address",
                            name: "street-address",
                        },
                        {
                            uid: "address-line1",
                            name: "address-line1",
                        },
                        {
                            uid: "address-line2",
                            name: "address-line2",
                        },
                        {
                            uid: "address-line3",
                            name: "address-line3",
                        },
                        {
                            uid: "address-level4",
                            name: "address-level4",
                        },
                        {
                            uid: "address-level3",
                            name: "address-level3",
                        },
                        {
                            uid: "address-level2",
                            name: "address-level2",
                        },
                        {
                            uid: "address-level1",
                            name: "address-level1",
                        },
                        { uid: "country", name: "country" },
                        { uid: "country-name", name: "country-name" },
                        { uid: "cc-name", name: "cc-name" },
                        {
                            uid: "cc-given-name",
                            name: "cc-given-name",
                        },
                        {
                            uid: "cc-additional-name",
                            name: "cc-additional-name",
                        },
                        {
                            uid: "cc-family-name",
                            name: "cc-family-name",
                        },
                        { uid: "cc-number", name: "cc-number" },
                        { uid: "cc-exp", name: "cc-exp" },
                        { uid: "cc-exp-month", name: "cc-exp-month" },
                        { uid: "cc-exp-year", name: "cc-exp-year" },
                        { uid: "cc-csc", name: "cc-csc" },
                        { uid: "cc-type", name: "cc-type" },
                        {
                            uid: "transaction-currency",
                            name: "transaction-currency",
                        },
                        { uid: "language", name: "language" },
                        { uid: "bday", name: "bday" },
                        { uid: "bday-day", name: "bday-day" },
                        { uid: "bday-month", name: "bday-month" },
                        { uid: "bday-year", name: "bday-year" },
                        { uid: "sex", name: "sex" },
                        { uid: "tel", name: "tel" },
                        {
                            uid: "tel-country-code",
                            name: "tel-country-code",
                        },
                        { uid: "tel-national", name: "tel-national" },
                        {
                            uid: "tel-area-code",
                            name: "tel-area-code",
                        },
                        { uid: "tel-local", name: "tel-local" },
                        {
                            uid: "tel-extension",
                            name: "tel-extension",
                        },
                        { uid: "impp", name: "impp" },
                        { uid: "url", name: "url" },
                        { uid: "photo", name: "photo" },
                        { uid: "on", name: "on" },
                        { uid: "off", name: "off" },
                    ],
                    tooltip: `Understand what each autocomplete means at [hyperlink].`,
                },
            };
        } else if (["dropdown", "radio"].includes(value.type)) {
            let options = value.options
                    ? Array.isArray(value.options)
                        ? value.options
                        : makeToOptions(value.options)
                    : [],
                i = 0;
            for (i = 0; i < options.length; i++)
                if (options[i].uid === "add") options.splice(i, 1);

            let dv = makeToData(options);

            plus = {
                options: {
                    uid: "options",
                    name: "options",
                    type: "dropdown",
                    multiple: true,
                    options,
                    defaultValue: dv,
                    compact: true,
                    edit: {
                        add: true,
                        remove: true,
                        limit: "undefined",
                        persist: true,
                    },
                },
                edit: {
                    meta: {
                        uid: "edit",
                        name: "Edit",
                        group: { label: true, feedback: true },
                    },
                    add: {
                        uid: "add",
                        name: "Add",
                        hide: { label: true },
                        required: true,
                        type: "text",
                        placeholder: `Max number of Add's allowed.`,
                        defaultValue: `${value.edit.add}`,
                        validity: function (value) {
                            return {
                                standard: {
                                    check:
                                        ["true", "false"].includes(
                                            value.toString()
                                        ) ||
                                        !isNaN(
                                            Number.parseInt(value.toString())
                                        ),
                                    true: "😉 add looks good!",
                                    false: `🤭 add must be "true", "false", or a Number!`,
                                },
                            };
                        },
                    },
                    remove: {
                        uid: "remove",
                        name: "Remove",
                        hide: { label: true },
                        required: true,
                        type: "text",
                        placeholder: `Max number of Remove's allowed.`,
                        defaultValue: `${value.edit.remove}`,
                        validity: function (value) {
                            return {
                                standard: {
                                    check:
                                        ["true", "false"].includes(
                                            value.toString()
                                        ) ||
                                        !isNaN(
                                            Number.parseInt(value.toString())
                                        ),
                                    true: "😉 remove looks good!",
                                    false: `🤭 remove must be "true", "false", or a Number!`,
                                },
                            };
                        },
                    },
                    limit: {
                        uid: "limit",
                        name: "Limit",
                        hide: { label: true },
                        required: true,
                        type: "text",
                        placeholder: `Max number of options allowed.`,
                        defaultValue: `${value.edit.limit}`,
                        validity: function (value) {
                            return {
                                standard: {
                                    check:
                                        ["undefined"].includes(
                                            value.toString()
                                        ) ||
                                        !isNaN(
                                            Number.parseInt(value.toString())
                                        ),
                                    true: "😉 limit looks good!",
                                    false: `🤭 limit must be "undefined" or a Number!`,
                                },
                            };
                        },
                    },
                    persist: {
                        uid: "persist",
                        name: "Persist",
                        hide: { label: true },
                        type: "checkbox",
                        placeholder: "Expose options",
                        tooltip: `See documentation on how you can use "Expose Options" to make your dropdown persistent`,
                        defaultValue: value.edit.persist
                            ? { persist: true }
                            : undefined,
                    },
                },
                multiple: {
                    uid: "multiple",
                    name: "Accept Multiple Answers",
                    type: "checkbox",
                    hide: { label: true },
                    defaultValue: value.multiple,
                },
                compact: {
                    uid: "compact",
                    name: "Compact Selected Answers",
                    type: "checkbox",
                    hide: { label: true },
                    defaultValue: value.compact,
                    tooltip: "Only works when accepting multiple answers.",
                },
            };
        } else if (value.type === "divider") {
            plus = {
                icon: {
                    uid: "icon",
                    name: "Icon (material icon)",
                    type: "text",
                    defaultValue: value.icon,
                },
            };
        } else if (value.type === "switch") {
            plus = {
                icon: {
                    meta: {
                        uid: "icon",
                        name: "icon",
                        group: { label: true, feedback: true },
                    },
                    off: {
                        uid: "off",
                        name: "Icon (material icon)",
                        type: "text",
                        placeholder: "off icon",
                        defaultValue: value?.icon?.off,
                        hide: { label: true },
                    },
                    on: {
                        uid: "on",
                        name: "Icon (material icon)",
                        type: "text",
                        placeholder: "on icon",
                        defaultValue: value?.icon?.on,
                        hide: { label: true },
                    },
                },
            };
        }

        return { ...basics, ...midware, ...plus };
    }

    function convertEdit(value: string, original: any): any {
        let res = original;
        if (value === "true") res = true;
        else if (value === "false") res = false;
        else if (value === "undefined") res = "undefined";
        else if (!isNaN(Number.parseInt(value))) res = Number.parseInt(value);

        if (res !== original) main.refresh();

        return res;
    }

    function groupOI(details): void {
        let base = data.fields[groupid] as Group;
        if (belongs(details.data, "header")) delete details.data.header;
        if (belongs(details.data, "dropdown")) delete details.data.dropdown;

        base.meta = { ...base.meta, ...details.data };
        base.meta.group = parseHide(base.meta.group, true);

        updateForm(data);
        updateSave(data);
        main.refresh();
    }
    function onInput(details): void {
        let base: Field | Group | Record<string, Field | Group> = groupid
                ? data.fields[groupid]
                : data.fields,
            oEdit: Edit;

        if (base[fieldid].edit)
            oEdit = {
                add: false,
                remove: false,
                limit: "undefined",
                persist: false,
                ...base[fieldid].edit,
            };
        base[fieldid] = details.data;

        if (belongs(base[fieldid], "header")) delete base[fieldid].header;

        if (
            details.data.autocomplete &&
            typeof details.data.autocomplete !== "string"
        )
            base[fieldid].autocomplete = Object.values(
                details.data.autocomplete
            )[0];

        if (
            details.data.onInput &&
            checkFunc(details.data.onInput).validFunc.check
        )
            base[fieldid].onInput = reviver("onInput", details.data.onInput);
        else delete base[fieldid].onInput;

        if (
            details.data.validity &&
            checkFunc(details.data.validity, "Rule").validFunc.check
        )
            base[fieldid].validity = reviver("validity", details.data.validity);
        else delete base[fieldid].validity;

        if (details.data.options) {
            const opts = Array.isArray(details.data.options)
                ? details.data.options
                : makeToOptions(details.data.options);

            let i = 0;
            for (i = opts.length - 1; 0 <= i; i--)
                if (opts[i].uid === "add") opts.splice(i, 1);

            base[fieldid].options = opts;

            base[fieldid].edit = {
                add: convertEdit(details.data.edit.add, oEdit.add),
                remove: convertEdit(details.data.edit.remove, oEdit.remove),
                limit: convertEdit(details.data.edit.limit, oEdit.limit),
                persist: !!details.data.edit.persist,
            };
        }
        base[fieldid].hide = parseHide(base[fieldid].hide, true);
        base[fieldid].spellcheck = !!base[fieldid].spellcheck;

        updateForm(data);
        updateSave(data);
        main.refresh();
    }
</script>

{#if groupid}
    <Form
        uid="group"
        title="Group Settings"
        caption="Some fields are temporarily disabled."
        hide={{ title: true, caption: true, submit: true, reset: true }}
        autocomplete={false}
        onInput={groupOI}
        fields={$SadForms && groupFields()}
        afterFormLoad={(refresh) => {
            if ($SadForms.refresh) {
                refresh(undefined, true);
                main.refresh();
            }
        }}
    />
{/if}

<Form
    uid="edit"
    title="edit"
    caption="Some fields are temporarily disabled."
    hide={{ title: true, caption: true, submit: true, reset: true }}
    autocomplete={false}
    {onInput}
    {fields}
    afterFormLoad={(refresh) => {
        if ($SadForms.refresh) {
            setRefresh(false);
            refresh(undefined, true);
            main.refresh();
        }
    }}
/>
