/**
 * Validation service extracted from Form.svelte
 * Handles field validation, feedback, and preview functionality
 */

import { setFieldProp, getFieldProp, manageFieldStorage } from '../store/FormStore';
import Extensions from '../static/extensions.json';
import { get } from 'svelte/store';
import CustomStore from '../store/CustomStore';
import { FormProps } from '$lib/constants';
import type { ValidationResult, Rule } from '$lib/types/Form';

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
): Promise<ValidationResult> {
    // Handle form-level validation
    if (type === "form" || fieldid === undefined) {
        for (const block of Object.values(getFieldProp(formId, FormProps.VALIDATION_RESULT))) {
            const verdict = (block as ValidationResult).group
                ? (block as ValidationResult).group!.verdict
                : (block as ValidationResult).verdict;
            if (!verdict) return { verdict };
        }
        return { verdict: true };
    }

    const isEmpty = checkEmpty(formId, fieldid, groupid),
        isRequired = getFieldProp(formId, FormProps.REQUIRED, fieldid, groupid);

    let verdict = isRequired ? !(isRequired && isEmpty) : true,
        raw: { verdict: boolean, feedback: string }[] = [],
        group: { verdict: boolean, raw: { verdict: boolean, feedback: string }[] } | undefined = undefined;

    // Handle field-level validation
    if (type === "field") {
        const func = getFieldProp(formId, FormProps.VALIDITY, fieldid, groupid);
        if (func) {
            const conditions = func(
                manageFieldStorage(formId, { action: "get" }, fieldid, groupid)
            );
            for (const condition of Object.values(conditions)) {
                const rule = condition as Rule;
                const expression = await rule.check;
                const feedback = expression ? rule.true : (rule.false || rule.true);

                verdict = verdict && expression;
                raw.push({ verdict: expression, feedback });
            }
        }
    }

    setFieldProp(formId, FormProps.VALIDATION_RESULT, { verdict, raw }, fieldid, groupid);

    // Handle group-level validation
    if (groupid || type === "group") {
        group = { verdict: true, raw: [] };

        for (const [key, value] of Object.entries(
            getFieldProp(formId, FormProps.VALIDATION_RESULT, groupid)
        )) {
            if (key === "group") continue;
            group.verdict = group.verdict && (value as ValidationResult).verdict;
            if (Array.isArray((value as ValidationResult).raw)) group.raw.push(...(value as ValidationResult).raw!);
        }
        setFieldProp(formId, FormProps.VALIDATION_RESULT, group, "group", groupid);
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
        groupid && getFieldProp(formId, FormProps.GROUP, groupid)?.override?.feedback;
    let { verdict, raw } = validation,
        block = document.getElementById(
            `${customStore.names.inputFeedback}${fieldid}`
        ),
        count = 1;

    if (groupOnly) {
        block = document.getElementById(
            `${customStore.names.groupFeedback}${groupid}`
        );
        raw = getFieldProp(formId, FormProps.VALIDATION_RESULT, groupid).group.raw;
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
    if (groupid && getFieldProp(formId, FormProps.GROUP, groupid).required) {
        const group = document.getElementById(
            `${customStore.names.groupHeader}${groupid}`
        ),
            groupWarned = group.classList.contains(customStore.names.warn),
            groupVerdict = getFieldProp(formId, FormProps.VALIDATION_RESULT, groupid).group.verdict;

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