export type Form = {
    uid: string,
    title: string,
    caption?: string,
    debug?: boolean,
    saveToLocal?: boolean,
    saveToCloud?: boolean,
    save: {
        saveAuto: false | number,
        saveOnInput: boolean
    },
    onInput?: Function,
    afterFormLoad?: Function,
    fields?: Record<string, (Field | Group)>,
    autocomplete?: boolean,
    fullscreen?: boolean,
    onSubmit?: Function,
    hide?: Hide
}

export type Field = {
    uid: string,
    name: string,
    type: string,
    defaultValue?: string | boolean | Record<string, string>,
    placeholder?: string,
    tooltip?: string,
    hide?: {
        label?: boolean,
        preview?: boolean
    }
    disabled?: boolean,
    hidden?: boolean,
    required?: boolean,
    dontSave?: boolean,
    redact?: boolean,
    autocomplete?: string,
    spellcheck?: boolean,
    multiple?: boolean,
    compact?: boolean,
    options?: Options,
    accept?: string,
    custom?: boolean,
    body?: unknown[],
    edit?: Edit,
    validity?: Validity,
    onInput?: Function,
    icon?: string | { on: string, off: string }

}
export type Hide = {
    title?: boolean,
    caption?: boolean,
    submit?: boolean,
    reset?: boolean
}

export type Group = {
    meta: {
        uid: string,
        name: string,
        tooltip?: string,
        required?: boolean,
        dontSave?: boolean,
        redact?: boolean,
        override: { label?: boolean, feedback?: boolean }
        spellcheck?: string,
    },
    [key: string]: unknown
}

export type Options = { uid: string, name: string }[]
export type Edit = {
    add: boolean | number,
    remove: boolean | number,
    limit: number | "undefined",
    persist: boolean,
}

export type Database = Record<string, Data>

type Data = {
    submit: { submitting: boolean, accepted: boolean, attempted: boolean },
    data: Record<string, (Field | Record<string, Field>)>,
    required: Record<string, (boolean | Record<string, boolean>)>,
    onInput: Record<string, (Function | Record<string, Function>)>,
    validity: Record<string, (Validity | Record<string, Validity>)>,
    verdict: Record<string, (Verdict | Record<string, Verdict>)>,
    preview: Record<string, (boolean | Record<string, boolean>)>,
    redact: Record<string, (boolean | Record<string, boolean>)>,
    touched: Record<string, (boolean | Record<string, boolean>)>,
    value: Record<string, (unknown | Record<string, unknown>)>,
    active: Record<string, (boolean | Record<string, boolean>)>,
    dontSave: Record<string, (DontSave | Record<string, DontSave>)>,
    group: Record<string, Group>
}

export type Rule = {
    check: boolean,
    true: string,
    false?: string,
    loading?: string
}
export type Validity = ((value: string) => Record<string, Rule>) | boolean
export type Verdict = {
    verdict: boolean,
    raw?: { verdict: boolean, feedback: string }[]
}
export type DontSave = {
    verdict?: boolean,
    data?: unknown,
    action: string
}

export default Form