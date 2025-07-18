/**
 * Form Builder Service
 * 
 * Handles business logic for form building operations.
 * Extracted from EditField.svelte to provide clean separation of concerns.
 */

import type { Field, Form, Group, Edit } from '../../../lib/types/Form';
import { uuidV4 } from '../../../lib/tools/kit';
import { newType } from '../../../presets';
import { updateForm, updateSave } from '../../../store/SadForms';

export interface FormBuilderService {
    // Form Operations
    createForm(template?: Partial<Form>): Form;
    updateForm(form: Form): void;
    
    // Field Operations
    addField(form: Form, fieldType: string, groupId?: string): Field;
    updateField(form: Form, fieldId: string, updates: Partial<Field>, groupId?: string): void;
    deleteField(form: Form, fieldId: string, groupId?: string): void;
    moveField(form: Form, fieldId: string, newPosition: number, groupId?: string): void;
    
    // Group Operations
    createGroup(form: Form, groupName: string): Group;
    addFieldToGroup(form: Form, fieldId: string, groupId: string): void;
    removeFieldFromGroup(form: Form, fieldId: string, groupId: string): void;
    
    // Utility Operations
    convertEditValue(value: string, original: string | number | boolean): string | number | boolean;
}

export class FormBuilderServiceImpl implements FormBuilderService {
    
    /**
     * Creates a new form with optional template
     */
    createForm(template?: Partial<Form>): Form {
        return {
            uid: uuidV4(),
            title: 'New Form',
            fields: {},
            saveToLocal: false,
            saveToCloud: false,
            ...template
        };
    }
    
    /**
     * Updates form and triggers save
     */
    updateForm(form: Form): void {
        updateForm(form);
        updateSave(form);
    }
    
    /**
     * Adds a new field to form or group
     */
    addField(form: Form, fieldType: string, groupId?: string): Field {
        const fieldId = uuidV4();
        const newField = newType(fieldType, fieldId);
        
        if (groupId && form.fields[groupId]) {
            const group = form.fields[groupId] as Group;
            group[fieldId] = newField;
        } else {
            form.fields[fieldId] = newField;
        }
        
        this.updateForm(form);
        return newField;
    }
    
    /**
     * Updates an existing field
     */
    updateField(form: Form, fieldId: string, updates: Partial<Field>, groupId?: string): void {
        let target: Field;
        
        if (groupId && form.fields[groupId]) {
            const group = form.fields[groupId] as Group;
            target = group[fieldId] as Field;
        } else {
            target = form.fields[fieldId] as Field;
        }
        
        if (target) {
            Object.assign(target, updates);
            this.updateForm(form);
        }
    }
    
    /**
     * Deletes a field from form or group
     */
    deleteField(form: Form, fieldId: string, groupId?: string): void {
        if (groupId && form.fields[groupId]) {
            const group = form.fields[groupId] as Group;
            delete group[fieldId];
        } else {
            delete form.fields[fieldId];
        }
        
        this.updateForm(form);
    }
    
    /**
     * Moves a field to a new position
     */
    moveField(form: Form, fieldId: string, newPosition: number, groupId?: string): void {
        // Implementation depends on how fields are ordered
        // This is a placeholder for the move logic
        console.log('Move field', fieldId, 'to position', newPosition);
        this.updateForm(form);
    }
    
    /**
     * Creates a new group
     */
    createGroup(form: Form, groupName: string): Group {
        const groupId = uuidV4();
        const newGroup: Group = {
            meta: {
                uid: groupId,
                name: groupName,
                required: false,
                redact: false,
                override: {}
            }
        };
        
        form.fields[groupId] = newGroup;
        this.updateForm(form);
        return newGroup;
    }
    
    /**
     * Adds a field to a group
     */
    addFieldToGroup(form: Form, fieldId: string, groupId: string): void {
        const field = form.fields[fieldId] as Field;
        const group = form.fields[groupId] as Group;
        
        if (field && group) {
            // Remove from form root
            delete form.fields[fieldId];
            // Add to group
            group[fieldId] = field;
            this.updateForm(form);
        }
    }
    
    /**
     * Removes a field from a group
     */
    removeFieldFromGroup(form: Form, fieldId: string, groupId: string): void {
        const group = form.fields[groupId] as Group;
        const field = group[fieldId] as Field;
        
        if (field && group) {
            // Remove from group
            delete group[fieldId];
            // Add to form root
            form.fields[fieldId] = field;
            this.updateForm(form);
        }
    }
    
    /**
     * Converts string values to appropriate types for edit fields
     */
    convertEditValue(value: string, original: string | number | boolean): string | number | boolean {
        let result: string | number | boolean = original;
        
        if (value === "true") {
            result = true;
        } else if (value === "false") {
            result = false;
        } else if (value === "undefined") {
            result = "undefined";
        } else if (!isNaN(Number.parseInt(value))) {
            result = Number.parseInt(value);
        }
        
        return result;
    }
}

// Export singleton instance
export const formBuilderService = new FormBuilderServiceImpl();