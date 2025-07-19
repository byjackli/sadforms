import type { Field, Group } from "$lib/types/Form";
import { checkFunc } from "../../../store/SadForms";

export class SettingsConfigService {
    
    /**
     * Generates form configuration for form settings
     */
    static generateSettingsConfig(data: any): Record<string, Field | Group> {
        return {
            title: {
                uid: "title",
                name: "Title",
                type: "text",
                defaultValue: data.title,
                required: true,
                placeholder: "Title your form. ✍",
            },
            uid: {
                uid: "uid",
                name: "Custom ID",
                type: "text",
                defaultValue: data.uid,
                disabled: true,
                placeholder: "Inject your own UUID.",
            },
            caption: {
                uid: "caption",
                name: "Caption",
                type: "textarea",
                defaultValue: data.caption,
                placeholder:
                    "Describe your form. \n\nCurrently, clickable links are not supported.",
            },
            saveToCloud: {
                uid: "saveToCloud",
                name: "Save To Cloud",
                type: "checkbox",
                hide: { label: true },
                defaultValue: data.saveToCloud,
                disabled: true,
            },
            saveToLocal: {
                uid: "saveToLocal",
                name: "Save To Local",
                type: "checkbox",
                hide: { label: true },
                defaultValue: data.saveToLocal,
                tooltip:
                    "Highly discouraged when handling with sensitive data.",
            },
            save: {
                meta: {
                    uid: "save",
                    name: "save options",
                    override: { label: true, feedback: true },
                },
                saveAuto: {
                    uid: "saveAuto",
                    name: "auto save",
                    type: "text",
                    placeholder: `milliseconds interval OR "false" to disable`,
                    defaultValue: data?.save?.saveAuto,
                    hide: { label: true },
                },
                saveOnInput: {
                    uid: "saveOnInput",
                    name: "save on input",
                    type: "checkbox",
                    defaultValue: data?.save?.saveOnInput,
                    hide: { label: true },
                },
            },
            onInput: {
                uid: "onInput",
                name: "On Input",
                type: "textarea",
                defaultValue: data.onInput ? data.onInput.toString() : undefined,
                placeholder:
                    "Function is fired every time a field is changed.\n\nThe function has access to the Form object via parameter.",
                validity: checkFunc,
            },
            afterFormLoad: {
                uid: "afterFormLoad",
                name: "afterFormLoad",
                type: "textarea",
                defaultValue: data.afterFormLoad ? data.afterFormLoad.toString() : undefined,
                placeholder:
                    "Function is fired every time the form is re-rendered.\n\nThe function has access to the Form object via parameter.",
                validity: checkFunc,
            },
            autocomplete: {
                uid: "autocomplete",
                name: "Autocomplete",
                type: "checkbox",
                hide: { label: true },
                defaultValue:
                    data.autocomplete || data.autocomplete === undefined,
            },
            fullscreen: {
                uid: "fullscreen",
                name: "Fullscreen",
                type: "checkbox",
                hide: { label: true },
                defaultValue: data.fullscreen,
                disabled: true,
                tooltip:
                    "This is a planned feature! It is here to drum up hype.",
            },
            onSubmit: {
                uid: "onSubmit",
                name: "Submit Handler",
                type: "textarea",
                defaultValue: data.onSubmit ? data.onSubmit.toString() : undefined,
                placeholder: `Function is fired when one of the following is triggered: "Enter", "Space", "NumpadEnter", or submit button.\n\nThe function has access to the Form object via parameter.`,
                validity: (value: string) => checkFunc(value, "boolean"),
            },
            hide: {
                uid: "hide",
                name: "Hide Features",
                type: "dropdown",
                multiple: true,
                defaultValue: data.hide ? this.parseHide(data.hide) : undefined,
                placeholder: "Hide certain form features.",
                options: [
                    { uid: "title", name: "Title" },
                    { uid: "caption", name: "Caption" },
                    { uid: "submit", name: "Submit" },
                    { uid: "reset", name: "Reset" },
                ],
            },
            debug: {
                uid: "debug",
                name: "Debug",
                type: "checkbox",
                hide: { label: true },
                defaultValue: data.debug,
            },
        };
    }

    /**
     * Parses hide configuration
     */
    static parseHide(
        hide: Record<string, string | boolean>,
        bool?: boolean
    ): Record<string, string> {
        const res = {};
        for (const option of Object.keys(hide))
            res[option] = bool ? true : option;
        return res;
    }
}

export const settingsConfigService = SettingsConfigService;