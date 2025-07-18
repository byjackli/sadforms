/**
 * Field Configuration Service
 * 
 * Handles field configuration generation and validation.
 * Provides a clean interface for generating field editor configurations.
 */

import type { Field, Group } from '../../../lib/types/Form';
import { 
    createBasicFieldConfig, 
    createStandardFieldConfig, 
    createFileFieldConfig, 
    createTextFieldConfig, 
    createDropdownFieldConfig, 
    createDividerFieldConfig, 
    createSwitchFieldConfig,
    createGroupConfigForm
} from './formBuilderConfigs';
import { makeToOptions, makeToData } from '../../../presets';

export interface FieldConfigService {
    // Configuration Generation
    generateFieldConfig(field: Field): Record<string, Field>;
    generateGroupConfig(group: Group, maData: Record<string, string>): Record<string, Field>;
    
    // Field Type Management
    getSupportedFieldTypes(): string[];
    getFieldTypeCategory(fieldType: string): 'text' | 'dropdown' | 'file' | 'divider' | 'switch' | 'other';
    
    // Validation
    validateFieldConfig(field: Field): boolean;
}

export class FieldConfigServiceImpl implements FieldConfigService {
    
    private readonly supportedFieldTypes = [
        'text', 'textarea', 'email', 'tel', 'password', 'number',
        'dropdown', 'radio', 'checkbox', 'switch', 'file', 'time', 'divider'
    ];
    
    /**
     * Generates complete field configuration based on field type
     */
    generateFieldConfig(field: Field): Record<string, Field> {
        const basics = createBasicFieldConfig(field);
        
        // For divider fields, only basic config is needed
        if (field.type === 'divider') {
            return {
                ...basics,
                ...createDividerFieldConfig(field)
            };
        }
        
        // For other fields, add standard config
        const standard = createStandardFieldConfig(field);
        let typeSpecific = {};
        
        // Add type-specific configuration
        switch (this.getFieldTypeCategory(field.type)) {
            case 'file':
                typeSpecific = createFileFieldConfig(field);
                break;
            case 'text':
                typeSpecific = createTextFieldConfig(field);
                break;
            case 'dropdown':
                typeSpecific = this.generateDropdownConfig(field);
                break;
            case 'switch':
                typeSpecific = createSwitchFieldConfig(field);
                break;
            default:
                typeSpecific = {};
        }
        
        return {
            ...basics,
            ...standard,
            ...typeSpecific
        };
    }
    
    /**
     * Generates dropdown/radio specific configuration
     */
    private generateDropdownConfig(field: Field): Record<string, Field> {
        const options = field.options 
            ? Array.isArray(field.options) 
                ? field.options 
                : makeToOptions(field.options)
            : [];
        
        // Remove 'add' options if present
        const cleanOptions = options.filter(option => option.uid !== 'add');
        const defaultValue = makeToData(cleanOptions);
        
        const baseConfig = createDropdownFieldConfig(field);
        
        return {
            ...baseConfig,
            options: {
                uid: "options",
                name: "options",
                type: "dropdown",
                multiple: true,
                options: cleanOptions,
                defaultValue: defaultValue,
                compact: true,
                edit: {
                    add: true,
                    remove: true,
                    limit: "undefined",
                    persist: true,
                },
            },
            edit: this.generateEditConfig(field)
        };
    }
    
    /**
     * Generates edit configuration for dropdown fields
     */
    private generateEditConfig(field: Field): any {
        const edit = field.edit || { add: false, remove: false, limit: "undefined", persist: false };
        
        return {
            meta: {
                uid: "edit",
                name: "Edit",
                override: { label: true, feedback: true },
            },
            add: {
                uid: "add",
                name: "Add",
                hide: { label: true },
                required: true,
                type: "text",
                placeholder: "Max number of Add's allowed.",
                defaultValue: `${edit.add}`,
                validity: this.createEditValidation('add')
            },
            remove: {
                uid: "remove",
                name: "Remove",
                hide: { label: true },
                required: true,
                type: "text",
                placeholder: "Max number of Remove's allowed.",
                defaultValue: `${edit.remove}`,
                validity: this.createEditValidation('remove')
            },
            limit: {
                uid: "limit",
                name: "Limit",
                hide: { label: true },
                required: true,
                type: "text",
                placeholder: "Max number of options allowed.",
                defaultValue: `${edit.limit}`,
                validity: this.createEditValidation('limit')
            },
            persist: {
                uid: "persist",
                name: "Persist",
                hide: { label: true },
                type: "checkbox",
                placeholder: "Expose options",
                tooltip: "See documentation on how you can use \"Expose Options\" to make your dropdown persistent",
                defaultValue: edit.persist ? { persist: true } : undefined,
            },
        };
    }
    
    /**
     * Creates validation function for edit configuration
     */
    private createEditValidation(type: 'add' | 'remove' | 'limit') {
        return function (value: string) {
            const isValidBoolean = ["true", "false"].includes(value.toString());
            const isValidNumber = !isNaN(Number.parseInt(value.toString()));
            const isValidUndefined = type === 'limit' && value.toString() === 'undefined';
            
            const check = isValidBoolean || isValidNumber || isValidUndefined;
            
            return {
                standard: {
                    check,
                    true: `😉 ${type} looks good!`,
                    false: type === 'limit' 
                        ? `🤭 ${type} must be "undefined" or a Number!`
                        : `🤭 ${type} must be "true", "false", or a Number!`,
                },
            };
        };
    }
    
    /**
     * Generates group configuration
     */
    generateGroupConfig(group: Group, maData: Record<string, string>, onDropdownSubmit?: (value: any) => void): Record<string, Field> {
        return createGroupConfigForm(group, maData, onDropdownSubmit);
    }
    
    /**
     * Returns all supported field types
     */
    getSupportedFieldTypes(): string[] {
        return [...this.supportedFieldTypes];
    }
    
    /**
     * Categorizes field types for configuration purposes
     */
    getFieldTypeCategory(fieldType: string): 'text' | 'dropdown' | 'file' | 'divider' | 'switch' | 'other' {
        if (['text', 'textarea', 'email', 'tel', 'password'].includes(fieldType)) {
            return 'text';
        }
        if (['dropdown', 'radio'].includes(fieldType)) {
            return 'dropdown';
        }
        if (fieldType === 'file') {
            return 'file';
        }
        if (fieldType === 'divider') {
            return 'divider';
        }
        if (fieldType === 'switch') {
            return 'switch';
        }
        return 'other';
    }
    
    /**
     * Validates field configuration
     */
    validateFieldConfig(field: Field): boolean {
        if (!field.uid || !field.name || !field.type) {
            return false;
        }
        
        if (!this.supportedFieldTypes.includes(field.type)) {
            return false;
        }
        
        // Add more validation logic as needed
        return true;
    }
}

// Export singleton instance
export const fieldConfigService = new FieldConfigServiceImpl();