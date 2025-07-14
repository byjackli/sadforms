/**
 * Validation service extracted from Form.svelte
 * Handles field validation, feedback, and preview functionality
 */

import { manageFieldStorage } from '../store/FormStore';
import { setValidationResult, getValidationResult } from '../store/FormValidationStore';
import { getConfigValue } from '../store/FormConfigStore';
import { FormProps } from '$lib/constants';
import type { ValidationResult, Rule, Validity } from '$lib/types/Form';

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
        const validationResults = getValidationResult(formId, FormProps.VALIDATION_RESULT) || {};
        for (const block of Object.values(validationResults)) {
            const verdict = (block as ValidationResult).group
                ? (block as ValidationResult).group!.verdict
                : (block as ValidationResult).verdict;
            if (!verdict) return { verdict };
        }
        return { verdict: true };
    }

    const isEmpty = checkEmpty(formId, fieldid, groupid),
        isRequired = getConfigValue(formId, FormProps.REQUIRED, fieldid, groupid);

    let verdict = isRequired ? !(isRequired && isEmpty) : true,
        raw: { verdict: boolean, feedback: string }[] = [],
        group: { verdict: boolean, raw: { verdict: boolean, feedback: string }[] } | undefined = undefined;

    // Handle field-level validation
    if (type === "field") {
        const func = getValidationResult(formId, FormProps.VALIDITY, fieldid, groupid) as Validity;
        if (func && typeof func === 'function') {
            const conditions = func(
                manageFieldStorage(formId, { action: "get" }, fieldid, groupid) as string
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

    setValidationResult(formId, { verdict, raw }, fieldid, groupid);

    // Handle group-level validation
    if (groupid || type === "group") {
        group = { verdict: true, raw: [] };

        const groupValidationResults = getValidationResult(formId, FormProps.VALIDATION_RESULT, undefined, groupid) || {};
        for (const [key, value] of Object.entries(groupValidationResults)) {
            if (key === "group") continue;
            group.verdict = group.verdict && (value as ValidationResult).verdict;
            if (Array.isArray((value as ValidationResult).raw)) group.raw.push(...(value as ValidationResult).raw!);
        }
        setValidationResult(formId, group, "group", groupid);
    }

    return { verdict, raw, group };
}
