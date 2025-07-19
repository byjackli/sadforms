/**
 * Edit Controls Service
 * 
 * Provides utilities for managing edit controls in the form builder.
 * This service extracts business logic from EditControls.svelte to maintain
 * the separation of concerns and improve testability.
 */

export interface FormElement {
    id: string;
    fieldid: string;
    groupid: string | undefined;
    isTitle: boolean;
    element: Element;
}

export class EditControlsService {
    /**
     * Parses form elements and extracts edit control information
     */
    static parseFormElements(): FormElement[] {
        const formElements = Array.from(
            document.querySelectorAll("main#editor h2, main#editor div.form-block")
        );

        return formElements
            .filter(element => {
                // Skip elements that are part of the add field controls
                return !element.closest(".modify-add") && !element.closest(".form-container");
            })
            .map(element => {
                const fieldid = element.id.slice(element.id.indexOf("/") + 1);
                const groupElement = element.closest("div.form-group");
                const groupid = groupElement 
                    ? groupElement.id.slice(groupElement.id.indexOf("/") + 1)
                    : undefined;
                const isTitle = element.tagName === "H2";

                return {
                    id: element.id,
                    fieldid,
                    groupid,
                    isTitle,
                    element
                };
            });
    }

    /**
     * Removes all existing edit controls from the DOM
     */
    static removeExistingControls(): void {
        const existingControls = Array.from(document.querySelectorAll(".modify-block"));
        existingControls.forEach(control => control.remove());
    }

    /**
     * Gets the field type from element classes for styling purposes
     */
    static getFieldType(element: Element): string {
        const classList = Array.from(element.classList);
        const typeClass = classList.find(cls => cls.startsWith('type:'));
        return typeClass ? typeClass.split(':')[1] : 'unknown';
    }
}

export const editControlsService = EditControlsService;