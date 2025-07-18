/**
 * Form Builder Configuration Definitions
 * 
 * This file contains the extracted form definitions from EditField.svelte
 * These form configurations power the dogfooding approach where the form builder
 * uses SadForms components to build SadForms.
 */

import type { Field, Form, Group } from '../../../lib/types/Form';
import { checkFunc } from '../../../store/SadForms';
import { parseHide } from '../../../presets';

/**
 * Configuration form for group settings
 */
export function createGroupConfigForm(group: Group, maData: Record<string, string>, onDropdownSubmit?: (value: string) => void): Record<string, Field> {
    const value = group;
    
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
        uid: {
            uid: "uid",
            name: "Group UID",
            type: "text",
            required: true,
            disabled: true,
            defaultValue: value.meta.uid,
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
            defaultValue: parseHide(value.meta.override),
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
            onInput: onDropdownSubmit,
            hide: { label: true },
        },
    };
}

/**
 * Basic field configuration that applies to all field types
 */
export function createBasicFieldConfig(field: Field): Record<string, Field> {
    return {
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
            defaultValue: field.name,
            placeholder: "🤔 something creative",
            required: true,
        },
        uid: {
            uid: "uid",
            name: "Custom ID",
            type: "text",
            defaultValue: field.uid,
            disabled: true,
        },
        type: {
            uid: "type",
            name: "field type",
            type: "text",
            defaultValue: field.type,
            disabled: true,
        },
        tooltip: {
            uid: "tooltip",
            name: "Tooltip",
            type: "text",
            defaultValue: field.tooltip,
            placeholder: "If the placeholder doesn't fit your needs.",
        },
        onInput: {
            uid: "onInput",
            name: "onInput",
            type: "textarea",
            defaultValue: field.onInput ? field.onInput.toString() : undefined,
            placeholder: "Function is fired every time the field is changed.\n\nThe function has access to the field value, HTMLElement, and more.",
            validity: checkFunc,
        },
        hide: {
            uid: "hide",
            name: "Hide Features",
            type: "dropdown",
            defaultValue: field.hide ? parseHide(field.hide) : undefined,
            multiple: true,
            options: [{ uid: "label", name: "Label" }],
        },
    };
}

/**
 * Standard field configuration for most field types
 */
export function createStandardFieldConfig(field: Field): Record<string, Field> {
    return {
        placeholder: {
            uid: "placeholder",
            name: "Placeholder",
            type: "text",
            defaultValue: field.placeholder,
            placeholder: "Teach the user how to use the field.",
        },
        defaultValue: {
            uid: "defaultValue",
            name: "Default Value",
            type: field.type,
            defaultValue: field.defaultValue,
            placeholder: "Motivate a response from the user.",
            options: ["dropdown", "radio"].includes(field.type) ? field.options : undefined,
            multiple: ["dropdown", "radio"].includes(field.type) ? field.multiple : undefined,
            tooltip: ["dropdown", "radio"].includes(field.type) ? "Help" : undefined,
        },
        disabled: {
            uid: "disabled",
            name: "Disable Field",
            type: "checkbox",
            hide: { label: true },
            defaultValue: field.disabled,
        },
        required: {
            uid: "required",
            name: "Require Field",
            type: "checkbox",
            hide: { label: true },
            defaultValue: field.required,
        },
        redact: {
            uid: "redact",
            name: "Mask data",
            type: "checkbox",
            hide: { label: true },
            defaultValue: field.redact,
        },
        dontSave: {
            uid: "dontSave",
            name: "Don't Save",
            type: "checkbox",
            hide: { label: true },
            defaultValue: field.dontSave,
            tooltip: "If localSave is turned on, toggling this will reset your demo's local save.",
        },
        validity: {
            uid: "validity",
            name: "Validation",
            type: "textarea",
            defaultValue: field.validity ? field.validity.toString() : undefined,
            placeholder: "Function is fired every time the field is focused, blurred, and changed.\n\nThe function has access to the field value.",
            validity: (value: string) => checkFunc(value, "Rule"),
        },
    };
}

/**
 * File field specific configuration
 */
export function createFileFieldConfig(field: Field): Record<string, Field> {
    return {
        accept: {
            uid: "accept",
            name: "Accept Certain File Types",
            type: "text",
            defaultValue: field.accept,
            tooltip: "[Common MIME Types]",
        },
        multiple: {
            uid: "multiple",
            name: "Accept Multiple Files",
            type: "checkbox",
            hide: { label: true },
            defaultValue: field.multiple,
            tooltip: "If localSave is turned on, toggling this will reset your demo's local save.",
        },
        hide: {
            uid: "hide",
            name: "Hide Features",
            type: "dropdown",
            defaultValue: field.hide ? parseHide(field.hide) : undefined,
            multiple: true,
            options: [
                { uid: "label", name: "Label" },
                { uid: "preview", name: "Preview" },
            ],
        },
    };
}

/**
 * Text field specific configuration (text, textarea, email, tel, password)
 */
export function createTextFieldConfig(field: Field): Record<string, Field> {
    return {
        spellcheck: {
            uid: "spellcheck",
            name: "Spellcheck",
            type: "checkbox",
            hide: { label: true },
            defaultValue: field.spellcheck,
        },
        autocomplete: {
            uid: "autocomplete",
            name: "Autocomplete",
            type: "dropdown",
            defaultValue: field.autocomplete ? { [field.autocomplete]: field.autocomplete } : undefined,
            options: [
                { uid: "name", name: "name" },
                { uid: "honorific-prefix", name: "honorific-prefix" },
                { uid: "given-name", name: "given-name" },
                { uid: "additional-name", name: "additional-name" },
                { uid: "family-name", name: "family-name" },
                { uid: "honorific-suffix", name: "honorific-suffix" },
                { uid: "nickname", name: "nickname" },
                { uid: "email", name: "email" },
                { uid: "username", name: "username" },
                { uid: "new-password", name: "new-password" },
                { uid: "current-password", name: "current-password" },
                { uid: "one-time-code", name: "one-time-code" },
                { uid: "organization-title", name: "organization-title" },
                { uid: "organization", name: "organization" },
                { uid: "street-address", name: "street-address" },
                { uid: "address-line1", name: "address-line1" },
                { uid: "address-line2", name: "address-line2" },
                { uid: "address-line3", name: "address-line3" },
                { uid: "address-level4", name: "address-level4" },
                { uid: "address-level3", name: "address-level3" },
                { uid: "address-level2", name: "address-level2" },
                { uid: "address-level1", name: "address-level1" },
                { uid: "country", name: "country" },
                { uid: "country-name", name: "country-name" },
                { uid: "cc-name", name: "cc-name" },
                { uid: "cc-given-name", name: "cc-given-name" },
                { uid: "cc-additional-name", name: "cc-additional-name" },
                { uid: "cc-family-name", name: "cc-family-name" },
                { uid: "cc-number", name: "cc-number" },
                { uid: "cc-exp", name: "cc-exp" },
                { uid: "cc-exp-month", name: "cc-exp-month" },
                { uid: "cc-exp-year", name: "cc-exp-year" },
                { uid: "cc-csc", name: "cc-csc" },
                { uid: "cc-type", name: "cc-type" },
                { uid: "transaction-currency", name: "transaction-currency" },
                { uid: "language", name: "language" },
                { uid: "bday", name: "bday" },
                { uid: "bday-day", name: "bday-day" },
                { uid: "bday-month", name: "bday-month" },
                { uid: "bday-year", name: "bday-year" },
                { uid: "sex", name: "sex" },
                { uid: "tel", name: "tel" },
                { uid: "tel-country-code", name: "tel-country-code" },
                { uid: "tel-national", name: "tel-national" },
                { uid: "tel-area-code", name: "tel-area-code" },
                { uid: "tel-local", name: "tel-local" },
                { uid: "tel-extension", name: "tel-extension" },
                { uid: "impp", name: "impp" },
                { uid: "url", name: "url" },
                { uid: "photo", name: "photo" },
                { uid: "on", name: "on" },
                { uid: "off", name: "off" },
            ],
            tooltip: "Understand what each autocomplete means at [hyperlink].",
        },
    };
}

/**
 * Dropdown/Radio field specific configuration
 */
export function createDropdownFieldConfig(field: Field): Record<string, Field> {
    return {
        multiple: {
            uid: "multiple",
            name: "Accept Multiple Answers",
            type: "checkbox",
            hide: { label: true },
            defaultValue: field.multiple,
        },
        compact: {
            uid: "compact",
            name: "Compact Selected Answers",
            type: "checkbox",
            hide: { label: true },
            defaultValue: field.compact,
            tooltip: "Only works when accepting multiple answers.",
        },
    };
}

/**
 * Divider field specific configuration
 */
export function createDividerFieldConfig(field: Field): Record<string, Field> {
    return {
        icon: {
            uid: "icon",
            name: "Icon (material icon)",
            type: "text",
            defaultValue: field.icon,
        },
    };
}

/**
 * Switch field specific configuration
 */
export function createSwitchFieldConfig(field: Field): Record<string, Field> {
    return {
        icon: {
            meta: {
                uid: "icon",
                name: "icon",
                override: { label: true, feedback: true },
            },
            off: {
                uid: "off",
                name: "Icon (material icon)",
                type: "text",
                placeholder: "off icon",
                defaultValue: field?.icon?.off,
                hide: { label: true },
            },
            on: {
                uid: "on",
                name: "Icon (material icon)",
                type: "text",
                placeholder: "on icon",
                defaultValue: field?.icon?.on,
                hide: { label: true },
            },
        },
    };
}