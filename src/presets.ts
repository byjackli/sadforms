import type { Field, Group, Options } from "$lib/types/Form"
import { uuidV4 } from "$lib/tools/kit"

export function parseHide(
    hide: Record<string, string | boolean>,
    bool?: boolean
): Record<string, string | boolean> {
    const res = {};
    for (const option of Object.keys(hide))
        res[option] = bool ? true : option;
    return res;
}
export function makeToOptions(object: Record<string, string>): Options {
    const options = [];
    for (const [key, value] of Object.entries(object))
        if (value) options.push({ uid: key, name: value })
    return options
}
export function makeToData(options: Options): Record<string, string> {
    const data = {}
    for (const option of options) data[option.uid] = option.name
    return data
}

export function newType(type: string, uid: string): Field | Group {
    const base: Field | Group = {
        uid,
        name: `new ${type}`,
        type,
    }

    if (["dropdown", "radio"].includes(type)) {
        base.edit = { add: false, remove: false, limit: "undefined", persist: false };
        base.options = [];
    }
    else if (["text", "textarea", "email", "tel", "password"].includes(type)) base.spellcheck = true
    else if (type === "group") {
        const textUID = uuidV4()
        return {
            meta: {
                uid,
                name: `new group`,
                group: { label: true, feedback: true },
            },
            [textUID]: {
                uid: textUID,
                name: "new text",
                type: "text",
                spellcheck: true
            }
        }
    }

    return base
}