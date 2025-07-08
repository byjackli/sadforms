/**
 * Main form configuration
 */
export type Form = {
    /** Unique form identifier */
    uid: string,
    /** Form title */
    title: string,
    /** Optional form description */
    caption?: string,
    /** Enable debug mode */
    debug?: boolean,
    /** Save form data to localStorage */
    saveToLocal?: boolean,
    /** Save form data to cloud */
    saveToCloud?: boolean,
    /** Auto-save configuration */
    save: {
        /** Auto-save interval in ms, or false to disable */
        saveAuto: false | number,
        /** Save on every input change */
        saveOnInput: boolean
    },
    /** Global input event handler */
    onInput?: Function,
    /** Callback after form loads */
    afterFormLoad?: Function,
    /** Form fields and groups */
    fields?: Record<string, (Field | Group)>,
    /** Enable browser autocomplete */
    autocomplete?: boolean,
    /** Display form in fullscreen mode */
    fullscreen?: boolean,
    /** Form submission handler */
    onSubmit?: Function,
    /** UI element visibility settings */
    hide?: Hide
}

/**
 * Individual form field configuration
 */
export type Field = {
    /** Unique field identifier */
    uid: string,
    /** Field display name */
    name: string,
    /** HTML input type */
    type: string,
    /** Initial field value */
    defaultValue?: Value,
    /** Input placeholder text */
    placeholder?: string,
    /** Help text tooltip */
    tooltip?: string,
    /** Element visibility settings */
    hide?: {
        /** Hide field label */
        label?: boolean,
        /** Hide file preview */
        preview?: boolean
    },
    /** Disable field interaction */
    disabled?: boolean,
    /** Hide field from view */
    hidden?: boolean,
    /** Field is required for submission */
    required?: boolean,
    /** Exclude from save operations */
    dontSave?: boolean,
    /** Mask field value when inactive */
    redact?: boolean,
    /** Browser autocomplete attribute */
    autocomplete?: string,
    /** Enable spellcheck */
    spellcheck?: boolean,
    /** Allow multiple selections/files */
    multiple?: boolean,
    /** Use compact display mode */
    compact?: boolean,
    /** Dropdown/select options */
    options?: Options,
    /** File input accepted types */
    accept?: string,
    /** Enable custom option creation */
    custom?: boolean,
    /** Custom field content */
    body?: unknown[],
    /** Dynamic field editing settings */
    edit?: Edit,
    /** Field validation rules */
    validity?: Validity,
    /** Field-specific input handler */
    onInput?: Function,
    /** Field icon configuration */
    icon?: string | { on: string, off: string }
}
/** Possible field value types */
export type Value = string | number | boolean | Record<string, string> | File | { base64: string; meta: any }[] | string[]
/**
 * UI element visibility configuration
 */
export type Hide = {
    /** Hide form title */
    title?: boolean,
    /** Hide form caption */
    caption?: boolean,
    /** Hide submit button */
    submit?: boolean,
    /** Hide reset button */
    reset?: boolean
}

/**
 * Field group configuration
 */
export type Group = {
    /** Group metadata */
    meta: {
        /** Unique group identifier */
        uid: string,
        /** Group display name */
        name: string,
        /** Group help text */
        tooltip?: string,
        /** Group is required */
        required?: boolean,
        /** Exclude group from saves */
        dontSave?: boolean,
        /** Mask group values when inactive */
        redact?: boolean,
        /** Override field display settings */
        override: { label?: boolean, feedback?: boolean }
        /** Group spellcheck setting */
        spellcheck?: string,
    },
    /** Dynamic group fields */
    [key: string]: unknown
}

/** Dropdown/select option list */
export type Options = { uid: string, name: string }[]
/**
 * Dynamic field editing configuration
 */
export type Edit = {
    /** Allow adding new instances */
    add: boolean | number,
    /** Allow removing instances */
    remove: boolean | number,
    /** Maximum number of instances */
    limit: number | "undefined",
    /** Persist changes across sessions */
    persist: boolean,
}

/**
 * Validation rule definition
 */
export type Rule = {
    /** Validation condition result */
    check: boolean,
    /** Message when validation passes */
    true: string,
    /** Message when validation fails */
    false?: string,
    /** Message during async validation */
    loading?: string
}

/** Field validation function or simple boolean */
export type Validity = ((value: string) => Record<string, Rule>) | boolean

export type RuleFeedback = { verdict: boolean, feedback: string }
export type RuleFeedbackCollection = RuleFeedback[]

/**
 * Validation result
 */
export type ValidationResult = {
    /** Overall validation result */
    verdict: boolean,
    /** Detailed validation feedback */
    raw?: RuleFeedbackCollection,
    /** Group validation result (present when validating groups) */
    group?: { verdict: boolean, raw: RuleFeedbackCollection }
}

/**
 * Internal form data structure that stores all form state
 */
type FormInstance = {
    /** Form submission state */
    submit: { submitting: boolean, accepted: boolean, attempted: boolean },
    /** Fields excluded from saving */
    dontSave: Record<string, (Value | Record<string, Value>)>,
    /** Required field flags */
    required: Record<string, (boolean | Record<string, boolean>)>,
    /** Input event handlers */
    onInput: Record<string, (Function | Record<string, Function>)>,
    /** Validation functions */
    validity: Record<string, (Validity | Record<string, Validity>)>,
    /** Validation results */
    validationResult: Record<string, (ValidationResult | Record<string, ValidationResult>)>,
    /** Preview visibility flags */
    preview: Record<string, (boolean | Record<string, boolean>)>,
    /** Redaction flags for sensitive fields */
    redact: Record<string, (boolean | Record<string, boolean>)>,
    /** User interaction tracking */
    touched: Record<string, (boolean | Record<string, boolean>)>,
    /** Field values storage */
    fieldValues: Record<string, (Value | Record<string, Value>)>,
    /** Display values shown to user (may be redacted/masked when inactive) */
    displayValues: Record<string, (unknown | Record<string, unknown>)>,
    /** Active/focus state */
    active: Record<string, (boolean | Record<string, boolean>)>,
    /** Group configurations */
    group: Record<string, Group>
}

/** Form database storing all form instances */
export type Database = Record<string, FormInstance>

export default Form