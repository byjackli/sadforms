import type Form from '$lib/types/Form';
import { writable } from 'svelte/store'
import { belongs, uuidV4 } from '$lib/tools/kit';

let data: Form, editing: { fieldid: string, groupid?: string }, refresh = false;

export function setRefresh(state: boolean): void {
    refresh = state
    SadForms.update(() => ({ data, editing, refresh }))
}

export function getForms(): [{ uid: string, title: string }] {
    const sample = { uid: "sample", title: "Sample Form" }, arr: [{ uid: string, title: string }] = [sample];
    if (!localStorage.getItem("SadForms:sample |")) loadSample()

    for (const [key, value] of Object.entries(localStorage))
        if (key.startsWith("SadForms") && key[46] === "|")
            arr.push({ uid: key.slice(9, 45), title: JSON.parse(value).title })

    return arr
}

export const SadForms = writable({ data, editing, refresh })
export function updateEditing(loaded: { fieldid: string, groupid?: string }) {
    editing = loaded
    SadForms.update(() => ({ data, editing, refresh }))
}
export function updateForm(loaded: Form): void {
    data = loaded
    SadForms.update(() => ({ data, editing, refresh }))
}
export function loadForm(uid: string): void {
    if (uid === "sample") loadSample()
    else {
        const saveData = localStorage.getItem(`SadForms:${uid} |`);
        if (saveData) data = JSON.parse(saveData, reviver);
    }

    SadForms.update(() => ({ data, editing, refresh }))
}
export function loadEmpty(custom?: { uid?: string, title?: string }): void {
    const uid = custom && custom.uid ? custom.uid : uuidV4(),
        title = custom && custom.title ? custom.title : "Untitled Form";

    data = {
        uid,
        title,
        saveToLocal: true,
        saveToCloud: false,
        save: { saveAuto: false, saveOnInput: true },
        fields: {}
    }

    SadForms.update(() => ({ data, editing, refresh }))
    updateSave()
}
export function updateSave(force?: any): void {
    localStorage.setItem(`SadForms:${data.uid} |`, JSON.stringify(force ? force : data, replacer))
}
export function deleteForm(custom?: { uid?: string }): void {
    const uid = custom && custom.uid ? custom.uid : data.uid;
    localStorage.removeItem(`SadForms:${uid} |`)
    localStorage.removeItem(`[SadForms]:${uid}`)
}

export function replacer(key: string, value: any, clean = false): any {
    if (["validity", "afterFormLoad", "onInput"].includes(key) && value)
        value = value.toString();
    return value
}
export function reviver(key: string, value: any): any {
    if (["validity", "afterFormLoad", "onInput"].includes(key))
        value = new Function("value", `return ${value}`)()
    return value
}
export function checkFunc(value: string, type?: string): Record<string, any> {
    let check = true;
    try {
        const res = reviver("validity", value)();

        // run additional checks
        if (type === "boolean" && typeof res !== "boolean") check = false
        else if (type === "Rule") {
            if (typeof res !== "object" || !Object.values(res).length) check = false
            else
                for (const rule of Object.values(res))
                    if (!(belongs(rule, "check") && belongs(rule, "true"))) check = false
        }

    } catch {
        check = value && 0 === value.length;
    }
    return {
        validFunc: {
            check,
            true: "💚 Healthy status.",
            false: "💔 This function will not be saved, one or more error was detected.",
        },
    };
}

// const sampleForm: Form = {
//     uid: "sample",
//     title: "Sample Form",
//     saveToLocal: true,
//     save: { saveAuto: false, saveOnInput: true },
//     onInput: undefined,
//     hide: { title: false, caption: false, submit: false, reset: false },
//     fields: {
//         'myemailfield': {
//             uid: 'myemailfield',
//             name: 'Your email -.-',
//             type: 'email',
//             defaultValue: 'hmm',
//             tooltip: 'haha good luck',
//             dontSave: true,
//             validity: function (value) {
//                 return {
//                     'first one': {
//                         check: true,
//                         true: 'good job, idrc, there are no sanity checks'
//                     },
//                     'second one': {
//                         check: value !== undefined && 0 < value.length,
//                         true: 'email is not empty'
//                     }
//                 };
//             }
//         },
//         'mynumberfield': {
//             uid: 'mynumberfield',
//             name: 'aye bruv, whats your fav numba?',
//             type: 'number',
//             defaultValue: '88888888',
//             tooltip: `there are no wrong answers!`,
//             validity: function (value) {
//                 return {
//                     'first one': {
//                         check: value !== undefined && value === '3474764944',
//                         true: 'sheeesh holla at me ;)',
//                         false: 'wrong! its my phone number.'
//                     }
//                 };
//             }
//         },
//         'mycolorfield': {
//             uid: 'mycolorfield',
//             name: 'wb your fav color?',
//             type: 'color',
//             tooltip: `stg, there are no wrong answers for this one.`,
//             validity: function (value) {
//                 return {
//                     'first one': {
//                         check: value !== undefined && value === '#000000',
//                         true: `just kidding 😭😭 you're  amazing`,
//                         false: 'WRONG, ITS PITCH BLACK LIKE YOUR SOUL'
//                     }
//                 };
//             }
//         },
//         'myfirstnamefield': {
//             uid: 'myfirstnamefield',
//             name: 'First Name',
//             type: 'text',
//             defaultValue: 'hmm',
//             required: true,
//             redact: true
//         },
//         'mylastnamefield': {
//             uid: 'mylastnamefield',
//             name: 'Last Name',
//             type: 'text',
//             defaultValue: 'hmm',
//             required: true,
//             redact: true
//         },
//         'singlefile': {
//             uid: 'singlefile',
//             name: 'upload 1 file',
//             type: 'file',
//             defaultValue: '',
//             dontSave: true
//         },
//         'multifiles': {
//             uid: 'multifiles',
//             name: 'uploading file(s)',
//             type: 'file',
//             defaultValue: '',
//             multiple: true,
//             dontSave: true,
//             redact: true
//         },
//         'justtextarea': {
//             uid: 'justtextarea',
//             name: 'some text block stuff',
//             type: 'textarea',
//             defaultValue: 'hmm',
//             required: true,
//             redact: true
//         },
//         'mytimefield': {
//             uid: 'mytimefield',
//             name: 'sooo what time are you available?',
//             type: 'time',
//             required: true,
//             disabled: true
//         },
//         'mytelfield': {
//             uid: 'mytelfield',
//             name: 'harddest question: what is your phone number? 😉',
//             type: 'tel',
//             tooltip: `10 digit number`,
//             required: true,
//             redact: true,
//             validity: function (value) {
//                 return {
//                     'first one': {
//                         check:
//                             value !== undefined &&
//                             value.match(/^[0-9]{10}$/) !== null &&
//                             value !== '3474764944',
//                         true: `uwu thanks ok bye!`,
//                         false: '<strong>bruv, fix this asap >:(</strong>'
//                     },
//                     bruh: {
//                         check: value !== undefined && value !== '3474764944',
//                         true: ``,
//                         false: 'dude.. you cant just put in my number lol'
//                     }
//                 };
//             }
//         },
//         "mydivider": {
//             uid: "mydivider",
//             name: "my custom components",
//             type: "divider",
//             icon: "architecture",
//             hide: { label: true },
//             tooltip: "Well sure, a divider can also have a tooltip. What's wrong with that? It's kinda like a divider description."
//         },
//         "smallgroup": {
//             meta: {
//                 uid: "smallgroup",
//                 name: "small group",
//                 group: { label: true, feedback: true }
//             },
//             "one": {
//                 uid: "one",
//                 name: "one",
//                 required: true,
//                 hide: { label: true },
//                 type: "text"
//             },
//             "two": {
//                 uid: "two",
//                 name: "two",
//                 required: true,
//                 hide: { label: false },
//                 type: "text"
//             },
//             "three": {
//                 uid: "three",
//                 name: "three",
//                 hide: { label: true },
//                 type: "text"
//             },
//             "four": {
//                 uid: "four",
//                 name: "four",
//                 hide: { label: true },
//                 type: "text"
//             }
//         },
//         'mycardinformationgroup': {
//             meta: {
//                 uid: 'mycardinformationgroup',
//                 name: 'Card information',
//                 required: true,
//                 redact: true,
//                 group: { label: true, feedback: true }
//             },
//             'ccnumber': {
//                 uid: 'ccnumber',
//                 name: 'Card number',
//                 hide: { label: true },
//                 type: 'text',
//                 placeholder: 'Card number',
//                 autocomplete: 'cc-number',
//                 dontSave: true,
//                 validity: function (value) {
//                     return {
//                         good: {
//                             check: value !== undefined && 0 < value.length,
//                             true: `CC number, is not empty`
//                         }
//                     };
//                 }
//             },
//             'ccexp': {
//                 uid: 'ccexp',
//                 name: 'Expiration Date',
//                 hide: { label: true },
//                 type: 'text',
//                 placeholder: 'Expiration Date',
//                 autocomplete: 'cc-exp',
//                 validity: function (value) {
//                     return {
//                         good: {
//                             check: value !== undefined && value.match(/^[0-9]{3}$/) !== null,
//                             true: `CC expire, is a 3 digit number`
//                         }
//                     };
//                 }
//             },
//             'cccsc': {
//                 uid: 'cccsc',
//                 name: 'CVC',
//                 hide: { label: true },
//                 type: 'text',
//                 placeholder: 'CVC',
//                 autocomplete: 'cc-csc',
//                 validity: function (value) {
//                     return {
//                         good: {
//                             check: value !== undefined && !!value.length,
//                             true: `👍 CVC is not empty`,
//                             false: `👎 CVC cannot be empty.`,
//                             loading: `⏳ confirming with the bank... please wait.`
//                         }
//                     };
//                 }
//             },
//             'ccname': {
//                 uid: 'ccname',
//                 name: 'Name on card',
//                 defaultValue: 'Bill Gates',
//                 hide: { label: true },
//                 type: 'text',
//                 placeholder: 'Name on card',
//                 autocomplete: 'cc-number'
//             }
//         },
//         'mydropdown': {
//             uid: 'mydropdown',
//             name: 'Favorite Ice Cream Brand(s)',
//             type: 'dropdown',
//             edit: { add: false, remove: false, limit: undefined, persist: false },
//             multiple: true,
//             dontSave: false,
//             required: true,
//             redact: true,
//             compact: true,
//             options: [
//                 { uid: 'option1', name: 'Klondike bar' },
//                 { uid: 'option2', name: "Ben & Jerry's" },
//                 { uid: 'option3', name: "Breyer's" },
//                 { uid: 'option4', name: 'Haagen-Dazs' },
//                 { uid: 'option5', name: 'Turkey Hill' },
//                 { uid: 'option6', name: 'Dairy Queen' }
//             ]
//         },
//         'mydropdown2': {
//             uid: 'mydropdown2',
//             name: 'Favorite Car',
//             type: 'dropdown',
//             edit: { add: false, remove: false, limit: undefined, persist: false },
//             dontSave: false,
//             required: true,
//             placeholder: 'You can only pick one.',
//             defaultValue: { option6: 'Nissan Altima' },
//             options: [
//                 { uid: 'option1', name: 'Honda Odyssey' },
//                 { uid: 'option2', name: 'Nissan GTR R34' },
//                 { uid: 'option3', name: 'Corvette CR1' },
//                 { uid: 'option4', name: 'Corvette CR4' },
//                 { uid: 'option5', name: 'F-150 Lightning' },
//                 { uid: 'option6', name: 'Nissan Altima' }
//             ]
//         },
//         'mycheckbox': {
//             uid: 'mycheckbox',
//             name: 'Should I bring my camera?',
//             type: 'checkbox',
//             redact: true,
//             placeholder: 'errrr',
//             options: [{ uid: 'ok', name: 'yes' }]
//         },
//         'myswitch': {
//             uid: 'myswitch',
//             name: 'This switch does nothing!',
//             type: 'switch',
//             placeholder: 'Toggle, Switch, whatever.',
//             icon: { on: "sentiment_very_satisfied", off: "sentiment_very_dissatisfied" },
//             options: [{ uid: 'ok', name: 'yes' }]
//         },
//         'dpWoption': {
//             uid: 'dpWoption',
//             name: 'How we spending the afternoon?',
//             type: 'dropdown',
//             edit: { add: true, remove: true, limit: undefined, persist: true },
//             multiple: true,
//             dontSave: false,
//             required: true,
//             redact: true,
//             options: [
//                 { uid: 'option1', name: 'The MET' },
//                 { uid: 'option2', name: "NYC Transit Museum" },
//                 { uid: 'option3', name: "Chinatown" },
//                 { uid: 'option4', name: 'Whitney' },
//                 { uid: 'option5', name: 'Central Park' },
//                 { uid: 'option6', name: 'Manhattan Bridge' }
//             ]
//         },
//         'dpWoptionOne': {
//             uid: 'dpWoptionOne',
//             name: 'What about the evening?',
//             tooltip: "can only pick one, so choose wisely",
//             type: 'dropdown',
//             edit: { add: 3, remove: true, limit: undefined, persist: true },
//             dontSave: false,
//             required: true,
//             redact: true,
//             options: [
//                 { uid: 'option1', name: 'NYC skyline from Roosevelt Island & LIC' },
//                 { uid: 'option2', name: "NYC skyline from Manhattan Bridge & Dumbo" },
//                 { uid: 'option3', name: "Cook and Disney+" },
//                 { uid: 'option4', name: 'Late night drive around NYC' },
//                 { uid: 'option5', name: 'Stroll at the beach (open to beach suggestions)' },
//                 { uid: 'option6', name: 'Wandering around the Financial District with a camera' }
//             ]
//         },
//     },
//     onSubmit: null
// }

const sampleForm: Form = {
    "uid": "sample",
    "title": "Sample Form v2",
    "saveToLocal": true,
    "saveToCloud": false,
    "save": {
        "saveAuto": false,
        "saveOnInput": true
    },
    "fields": {
        "8310f3b8-f4ba-484e-a3fd-ea1eb3fc8fba": {
            "name": "First Name",
            "uid": "8310f3b8-f4ba-484e-a3fd-ea1eb3fc8fba",
            "type": "text",
            "tooltip": "",
            "hide": {},
            "placeholder": "",
            "defaultValue": "",
            "required": true,
            "spellcheck": false,
            "autocomplete": "name"
        },
        "a0b21c64-e6c1-476e-89dc-4ac7a5778720": {
            "name": "Last Name",
            "uid": "a0b21c64-e6c1-476e-89dc-4ac7a5778720",
            "type": "text",
            "tooltip": "",
            "hide": {},
            "placeholder": "",
            "defaultValue": "",
            "spellcheck": false,
            "autocomplete": "family-name"
        },
        "374ac078-376a-4b1e-b367-8dd0a4526c9d": {
            "name": "Display Name",
            "uid": "374ac078-376a-4b1e-b367-8dd0a4526c9d",
            "type": "text",
            "tooltip": "This can be changed later on.",
            "hide": {},
            "placeholder": "",
            "defaultValue": "",
            "required": true,
            "validity": function (value) {
                const len = value !== undefined && value.length

                return {
                    noSpecial: {
                        check: typeof value === "string" && value.match(/^[a-zA-Z0-9]+$/) !== null,
                        true: "Special characters are not allowed",
                        false: "Special characters are not allowed 😞"
                    },
                    length: {
                        check: typeof value === "string" && 5 < len,
                        true: "Dispaly name length is just right 👨‍🍳",
                        false: `Length is too short, need ${6 - len} more character(s)!`
                    },
                }
            },
            "spellcheck": false
        },
        "9bc96846-42d7-4f22-849c-745958750d08": {
            "name": "Bio",
            "uid": "9bc96846-42d7-4f22-849c-745958750d08",
            "type": "textarea",
            "tooltip": "",
            "hide": {},
            "placeholder": "Short description about yourself.",
            "defaultValue": "",
            "required": true,
            "spellcheck": false
        },
        "bff03105-eb5c-4edb-a52b-5f3d34b1013d": {
            "name": "Profile Picture",
            "uid": "bff03105-eb5c-4edb-a52b-5f3d34b1013d",
            "type": "file",
            "tooltip": "",
            "hide": {},
            "placeholder": "",
            "required": true,
            "accept": "image/jpeg, image/png, image/gif",
            "spellcheck": false
        },
        "ab3f205b-17be-469d-b8e3-1774c2ed3cef": {
            "meta": {
                "uid": "ab3f205b-17be-469d-b8e3-1774c2ed3cef",
                "name": "Links",
                "group": {
                    "label": true,
                    "feedback": true
                },
                "tooltip": ""
            },
            "fc09262a-25f9-43c8-b139-f40903cee807": {
                "name": "Instagram",
                "uid": "fc09262a-25f9-43c8-b139-f40903cee807",
                "type": "text",
                "tooltip": "",
                "hide": {
                    "label": true
                },
                "placeholder": "Instagram",
                "defaultValue": "",
                "spellcheck": false
            },
            "4f4950e1-fea5-404d-b931-48382b4658f5": {
                "name": "Twitter",
                "uid": "4f4950e1-fea5-404d-b931-48382b4658f5",
                "type": "text",
                "tooltip": "",
                "hide": {
                    "label": true
                },
                "placeholder": "Twitter",
                "defaultValue": "",
                "spellcheck": false
            },
            "728db017-4fae-4e93-89ad-3d8672b290e7": {
                "name": "LinkedIn",
                "uid": "728db017-4fae-4e93-89ad-3d8672b290e7",
                "type": "text",
                "tooltip": "",
                "hide": {
                    "label": true
                },
                "placeholder": "LinkedIn",
                "defaultValue": "",
                "spellcheck": false
            },
            "7d867159-a9fa-4e55-8737-010ba95f4fea": {
                "name": "Website",
                "uid": "7d867159-a9fa-4e55-8737-010ba95f4fea",
                "type": "text",
                "tooltip": "",
                "hide": {
                    "label": true
                },
                "placeholder": "Website",
                "defaultValue": "",
                "spellcheck": false
            }
        },
        "9e924573-617b-4c8a-8268-dae640a32825": {
            "name": "Email Settings",
            "uid": "9e924573-617b-4c8a-8268-dae640a32825",
            "type": "divider",
            "tooltip": "Determine the frequency of our emails.",
            "hide": {
                "label": true
            },
            "icon": "email",
            "spellcheck": false
        },
        "dba4dce0-517f-4250-a6f2-5a7f856529a6": {
            "name": "All Email",
            "uid": "dba4dce0-517f-4250-a6f2-5a7f856529a6",
            "type": "switch",
            "tooltip": "",
            "hide": {
                "label": true
            },
            "placeholder": "All Email",
            "defaultValue": true,
            "icon": {
                "off": "unsubscribe",
                "on": "mark_email_unread"
            },
            "spellcheck": false
        },
        "031300af-f2e8-4bbd-b5f2-5fc30d116526": {
            "meta": {
                "uid": "031300af-f2e8-4bbd-b5f2-5fc30d116526",
                "name": "Specific Email Settings",
                "group": {
                    "feedback": true
                },
                "tooltip": ""
            },
            "580c5142-f137-4633-a39e-cc77b59b5044": {
                "name": "Last Minute Deals",
                "uid": "580c5142-f137-4633-a39e-cc77b59b5044",
                "type": "switch",
                "tooltip": "",
                "hide": {
                    "label": true
                },
                "placeholder": "Last Minute Deals",
                "defaultValue": true,
                "icon": {
                    "off": "",
                    "on": ""
                }
            },
            "e6434124-4cdf-4248-b2c9-e63cc401ebd0": {
                "name": "Monthly Newsletter",
                "uid": "e6434124-4cdf-4248-b2c9-e63cc401ebd0",
                "type": "switch",
                "tooltip": "",
                "hide": {
                    "label": true
                },
                "placeholder": "Monthly Newsletter",
                "defaultValue": true,
                "icon": {
                    "off": "",
                    "on": ""
                },
                "spellcheck": false
            },
            "d8396627-3759-48cf-bec3-0001ed55dbc2": {
                "name": "Notifications",
                "uid": "d8396627-3759-48cf-bec3-0001ed55dbc2",
                "type": "switch",
                "tooltip": "",
                "hide": {
                    "label": true
                },
                "placeholder": "Notifications",
                "defaultValue": true,
                "icon": {
                    "off": "",
                    "on": ""
                },
                "spellcheck": false
            }
        },
        "ec32eeeb-d352-458f-a979-ac3fb9afad2a": {
            "name": "Fun Facts",
            "uid": "ec32eeeb-d352-458f-a979-ac3fb9afad2a",
            "type": "divider",
            "tooltip": "",
            "hide": {
                "label": true
            },
            "icon": "sentiment_very_satisfied",
            "spellcheck": false
        },
        "f6554b77-7fd9-441c-90cc-3be40cdc2ec1": {
            "name": "Favorite Number",
            "uid": "f6554b77-7fd9-441c-90cc-3be40cdc2ec1",
            "type": "number",
            "tooltip": "",
            "hide": {},
            "placeholder": "",
            "defaultValue": "",
            "spellcheck": false
        },
        "79862f08-c4aa-4957-a99b-3e8b57beb0af": {
            "name": "Favorite Color",
            "uid": "79862f08-c4aa-4957-a99b-3e8b57beb0af",
            "type": "dropdown",
            "tooltip": "",
            "hide": {},
            "placeholder": "",
            "defaultValue": {
                "7f47e54f-420e-4020-9a07-d03219a0b06e": "Red",
                "88546d5d-57f7-47b4-bb1e-a7ce8e087469": "Orange",
                "3a39f871-0181-44de-9317-f2e7e7cd0268": "Yellow",
                "fbeebdb4-9432-463a-9503-25ede1a71999": "Green",
                "b9f7999a-a8bb-4d06-bfe2-ec2de0715f37": "Blue",
                "fe4b1e68-d7ac-4b03-a881-701b4ac8734b": "Purple"
            },
            "options": [
                {
                    "uid": "7f47e54f-420e-4020-9a07-d03219a0b06e",
                    "name": "Red"
                },
                {
                    "uid": "88546d5d-57f7-47b4-bb1e-a7ce8e087469",
                    "name": "Orange"
                },
                {
                    "uid": "3a39f871-0181-44de-9317-f2e7e7cd0268",
                    "name": "Yellow"
                },
                {
                    "uid": "fbeebdb4-9432-463a-9503-25ede1a71999",
                    "name": "Green"
                },
                {
                    "uid": "b9f7999a-a8bb-4d06-bfe2-ec2de0715f37",
                    "name": "Blue"
                },
                {
                    "uid": "fe4b1e68-d7ac-4b03-a881-701b4ac8734b",
                    "name": "Purple"
                }
            ],
            "edit": {
                "add": true,
                "remove": true,
                "limit": "undefined",
                "persist": false
            },
            "multiple": true,
            "compact": true,
            "spellcheck": false,
            "header": ""
        },
        "751014b9-a6f1-42e0-a3f9-44877b8ebbec": {
            "name": "Did You Smile Today?",
            "uid": "751014b9-a6f1-42e0-a3f9-44877b8ebbec",
            "type": "checkbox",
            "tooltip": "",
            "hide": {},
            "placeholder": "Must accept before continuing!",
            "required": true,
            "validity": function (value) {
                return {
                    condition1: {
                        check: !!value,
                        true: "Glad you smiled today 😊",
                        false: "Must accept to continue!"
                    }
                }
            }
        }
    },
    "caption": "This is an updated version of the sample form.\n\n⛔ WARNING!! ⛔\nThis form resets after EVERY session. For persistent edits, create a new form at the homepage.",
    "autocomplete": true,
    "fullscreen": false,
    "onSubmit": undefined,
    "hide": {},
    "debug": true
}
function loadSample(): void {
    data = sampleForm

    SadForms.update(() => ({ data, editing, refresh }))
    updateSave()
}


export default SadForms


