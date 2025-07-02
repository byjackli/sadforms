/**
 * Validation service extracted from Form.svelte
 * Handles field validation, feedback, and preview functionality
 */

import { setFieldProp, getFieldProp, manageFieldStorage } from '../store/FormStore';
import Extensions from '../static/extensions.json';
import { get } from 'svelte/store';
import CustomStore from '../store/CustomStore';

/**
 * Checks if a field is empty based on its current value
 */
function checkEmpty(formId: string, fieldid: string, groupid?: string): boolean {
    const field = manageFieldStorage(formId, { action: "get" }, fieldid, groupid);
    return (
        field === "" ||
        field === undefined ||
        field === null ||
        (typeof field === "object" && Object.entries(field).length === 0)
    );
}

/**
 * Main validation function that validates fields, groups, or entire forms
 */
export async function checkValidity(
    formId: string,
    type: string,
    fieldid?: string,
    groupid?: string
): Promise<any> {
    // Handle form-level validation
    if (type === "form" || fieldid === undefined) {
        for (const block of Object.values(getFieldProp(formId, "verdict"))) {
            const verdict = (block as any).group
                ? (block as any).group.verdict
                : (block as any).verdict;
            if (!verdict) return { verdict };
        }
        return { verdict: true };
    }

    const isEmpty = checkEmpty(formId, fieldid, groupid),
        isRequired = getFieldProp(formId, "required", fieldid, groupid);

    let verdict = isRequired ? !(isRequired && isEmpty) : true,
        raw: any[] = [],
        group: any = undefined;

    // Handle field-level validation
    if (type === "field") {
        const func = getFieldProp(formId, "validity", fieldid, groupid);
        if (func) {
            const conditions = func(
                manageFieldStorage(formId, { action: "get" }, fieldid, groupid)
            );
            for (const condition of Object.values(conditions)) {
                const expression = await (condition as any).check,
                    feedback =
                        (condition as any)[expression] === undefined
                            ? (condition as any).true
                            : (condition as any)[expression];

                verdict = verdict && expression;
                raw.push({ verdict: expression, feedback });
            }
        }
    }
    
    setFieldProp(formId, "verdict", { verdict, raw }, fieldid, groupid);

    // Handle group-level validation
    if (groupid || type === "group") {
        group = { verdict: true, raw: [] };

        for (const [key, value] of Object.entries(
            getFieldProp(formId, "verdict", groupid)
        )) {
            if (key === "group") continue;
            group.verdict = group.verdict && (value as any).verdict;
            if (Array.isArray((value as any).raw)) group.raw.push(...(value as any).raw);
        }
        setFieldProp(formId, "verdict", group, "group", groupid);
    }

    return { verdict, raw, group };
}

/**
 * Updates field feedback display
 */
export function updateFeedback(
    formId: string,
    fieldid: string,
    groupid: string | undefined,
    validation: any
): void {
    const customStore = get(CustomStore);
    const groupOnly =
        groupid && getFieldProp(formId, "group", groupid)?.override?.feedback;
    let { verdict, raw } = validation,
        block = document.getElementById(
            `${customStore.names.inputFeedback}${fieldid}`
        ),
        count = 1;

    if (groupOnly) {
        block = document.getElementById(
            `${customStore.names.groupFeedback}${groupid}`
        );
        raw = getFieldProp(formId, "verdict", groupid).group.raw;
    }
    if (!block) return;

    if (!block?.classList.contains("active"))
        block.classList.toggle("active");

    function build(feedback: string, expression: boolean) {
        const p = document.createElement("p"),
            t = document.createTextNode(feedback),
            aria = document.createElement("span"),
            ariaSays = document.createTextNode(
                `feedback ${count} ${expression ? `is` : `is NOT`} valid;`
            ),
            breathe = document.createElement("span"),
            punc = document.createTextNode(".");
        count++;

        p.classList.add(`condition-${expression}`);
        p.appendChild(t);

        aria.setAttribute("class", "for-aria");
        aria.appendChild(ariaSays);

        breathe.setAttribute("class", "for-aria");
        breathe.appendChild(punc);

        p.prepend(aria);
        p.append(breathe);
        return p;
    }

    block.innerHTML = "";
    for (const { feedback, verdict } of raw)
        block.appendChild(build(feedback, verdict));
    updateWarn(formId, fieldid, groupid, verdict);
}

/**
 * Updates warning display for required fields
 */
export function updateWarn(
    formId: string,
    fieldid: string,
    groupid: string | undefined,
    fieldVerdict: boolean
): void {
    const customStore = get(CustomStore);
    const block = document.getElementById(
            `${customStore.names.blockHeader}${fieldid}`
        ),
        blockWarned = block?.classList.contains(customStore.names.warn);

    if (fieldVerdict === blockWarned)
        block.classList.toggle(customStore.names.warn);
    if (groupid && getFieldProp(formId, "group", groupid).required) {
        const group = document.getElementById(
                `${customStore.names.groupHeader}${groupid}`
            ),
            groupWarned = group.classList.contains(customStore.names.warn),
            groupVerdict = getFieldProp(formId, "verdict", groupid).group.verdict;

        if (
            (!groupWarned && !groupVerdict) ||
            (groupWarned && groupVerdict)
        )
            group.classList.toggle(customStore.names.warn);
    }
}

/**
 * Updates file preview display
 */
export function updatePreview(
    formId: string,
    fieldid: string,
    groupid: string | undefined
): void {
    const customStore = get(CustomStore);
    const files = manageFieldStorage(formId, { action: "get" }, fieldid, groupid),
        block = document.getElementById(
            `${customStore.names.inputPreview}${fieldid}`
        ),
        active = block?.classList.contains("active");

    if ((!active && files?.length) || (active && !files?.length))
        block?.classList.toggle("active");

    let strings = ``;
    if (files && Array.isArray(files)) {
        for (const { base64, meta } of files) {
            let ext = meta.name.split(".");
            ext = (Extensions as any)[ext[ext.length - 1]];

            if (ext === undefined) ext = "insert_drive_file";
            strings += `<div class="preview" title="${meta.name}"><span class="material-icons">${ext}</span><p>${meta.name}</p></div>`;
        }
    }

    if (block) {
        block.innerHTML = strings;
    }
}