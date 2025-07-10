import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { loadField, loadGroup, loadAllFields } from './fieldManager';
import * as FormStore from '../store/FormStore';
import * as FormHelpers from '../utils/formHelpers';
import { FormProps } from '$lib/constants';
import { Field, Group } from '$lib/types/Form';

// Mock dependencies
vi.mock('../store/FormStore');
vi.mock('../utils/formHelpers', () => ({
  loadBlank: vi.fn(),
  isGroup: vi.fn()
}));

const mockFormStore = FormStore as any;
const mockFormHelpers = FormHelpers as any;

describe('fieldManager', () => {
  const uid = 'test-form';

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up default mock behavior for isGroup
    mockFormHelpers.isGroup.mockImplementation((block: any) => {
      return 'meta' in block && block.meta !== undefined;
    });
  });

  describe('loadGroup', () => {
    it('should set group field properties', async () => {
      const group: Group = {
        meta: {
          uid: 'group-1',
          name: 'Test Group',
          required: true,
          override: {
            label: false,
            feedback: false
          }
        }
      };

      await loadGroup(uid, group);

      expect(mockFormStore.setFieldProp).toHaveBeenCalledWith(
        uid,
        'group',
        group.meta,
        group.meta.uid
      );
    });
  });

  describe('loadField', () => {
    beforeEach(() => {
      mockFormHelpers.loadBlank.mockReturnValue('default-value');
    });

    it('should initialize field storage when field does not exist', async () => {
      const field: Field = {
        name: 'Field1',
        uid: 'field-1',
        type: 'text',
        defaultValue: undefined,
        dontSave: false,
      };

      mockFormStore.manageFieldStorage.mockReturnValue(false); // field doesn't exist

      await loadField(uid, field);

      expect(mockFormStore.manageFieldStorage).toHaveBeenCalledWith(
        uid,
        { action: 'exists' },
        field.uid,
        undefined
      );

      expect(mockFormStore.manageFieldStorage).toHaveBeenCalledWith(
        uid,
        { dontSave: undefined, action: 'init', fieldValue: 'default-value' },
        field.uid,
        undefined
      );

      expect(mockFormStore.setFieldProp).toHaveBeenCalledWith(
        uid,
        FormProps.FIELD_VALUES,
        'default-value',
        field.uid,
        undefined
      );
    });

    it('should use field defaultValue when provided', async () => {
      const field: Field = {
        name: 'Field1',
        uid: 'field-1',
        type: 'text',
        defaultValue: 'custom-default',
        dontSave: false
      };

      mockFormStore.manageFieldStorage.mockReturnValue(false);

      await loadField(uid, field);

      expect(mockFormStore.manageFieldStorage).toHaveBeenCalledWith(
        uid,
        { dontSave: undefined, action: 'init', fieldValue: 'custom-default' },
        field.uid,
        undefined
      );
    });

    it('should set dontSave from group meta when available', async () => {
      const field: Field = {
        name: "Field1",
        uid: 'field-1',
        type: 'text',
        dontSave: false
      };

      const group: Group = {
        meta: {
          name: 'Group1',
          uid: 'group-1',
          dontSave: true,
          override: {
            label: false,
            feedback: false
          }
        }
      };

      mockFormStore.manageFieldStorage.mockReturnValue(false);

      await loadField(uid, field, group);

      expect(mockFormStore.manageFieldStorage).toHaveBeenCalledWith(
        uid,
        { dontSave: true, action: 'init', fieldValue: 'default-value' },
        field.uid,
        group.meta.uid
      );
    });

    it('should set onInput handler when provided', async () => {
      const onInputHandler = vi.fn();
      const field: Field = {
        name: "Field1",
        uid: 'field-1',
        type: 'text',
        onInput: onInputHandler
      };

      mockFormStore.manageFieldStorage.mockReturnValue(true); // field exists

      await loadField(uid, field);

      expect(mockFormStore.setFieldProp).toHaveBeenCalledWith(
        uid,
        FormProps.ON_INPUT,
        onInputHandler,
        field.uid,
        undefined
      );
    });

    it('should set redact property for redacted fields', async () => {
      const field: Field = {
        name: 'Field1',
        uid: 'field-1',
        type: 'text',
        redact: true,
      };

      mockFormStore.manageFieldStorage.mockReturnValue(true);

      await loadField(uid, field);

      expect(mockFormStore.setFieldProp).toHaveBeenCalledWith(
        uid,
        FormProps.REDACT,
        { redact: true, data: true },
        field.uid,
        undefined
      );
    });

    it('should inherit redact from group when group is redacted', async () => {
      const field: Field = {
        name: 'Field1',
        uid: 'field-1',
        type: 'text',
        redact: false
      };

      const group: Group = {
        meta: {
          name: "Group1",
          uid: 'group-1',
          redact: true,
          override: {
            label: false,
            feedback: false
          }
        }
      };

      mockFormStore.manageFieldStorage.mockReturnValue(true);

      await loadField(uid, field, group);

      expect(mockFormStore.setFieldProp).toHaveBeenCalledWith(
        uid,
        FormProps.REDACT,
        { redact: true, data: true },
        field.uid,
        group.meta.uid
      );
    });

    it('should set required property for required fields', async () => {
      const field: Field = {
        name: 'Field1',
        uid: 'field-1',
        type: 'text',
        required: true
      };

      mockFormStore.manageFieldStorage.mockReturnValue(true);

      await loadField(uid, field);

      expect(mockFormStore.setFieldProp).toHaveBeenCalledWith(
        uid,
        FormProps.REQUIRED,
        true,
        field.uid,
        undefined
      );
    });

    it('should inherit required from group when group is required', async () => {
      const field: Field = {
        name: "Field1",
        uid: 'field-1',
        type: 'text',
        required: false
      };

      const group: Group = {
        meta: {
          name: 'Group1',
          uid: 'group-1',
          required: true,
          override: {
            label: false,
            feedback: false
          }
        }
      };

      mockFormStore.manageFieldStorage.mockReturnValue(true);

      await loadField(uid, field, group);

      expect(mockFormStore.setFieldProp).toHaveBeenCalledWith(
        uid,
        FormProps.REQUIRED,
        true,
        field.uid,
        group.meta.uid
      );
    });

    it('should set validity function when provided', async () => {
      const validityFn = vi.fn();
      const field: Field = {
        name: 'Field1',
        uid: 'field-1',
        type: 'text',
        validity: validityFn,
      };

      mockFormStore.manageFieldStorage.mockReturnValue(true);

      await loadField(uid, field);

      expect(mockFormStore.setFieldProp).toHaveBeenCalledWith(
        uid,
        FormProps.VALIDITY,
        validityFn,
        field.uid,
        undefined
      );
    });

    it('should skip storage initialization when field already exists', async () => {
      const field: Field = {
        name: 'Field1',
        uid: 'field-1',
        type: 'text'
      };

      mockFormStore.manageFieldStorage.mockReturnValue(true); // field exists

      await loadField(uid, field);

      // Should check existence but not initialize
      expect(mockFormStore.manageFieldStorage).toHaveBeenCalledWith(
        uid,
        { action: 'exists' },
        field.uid,
        undefined
      );

      // Should not call init
      expect(mockFormStore.manageFieldStorage).not.toHaveBeenCalledWith(
        uid,
        expect.objectContaining({ action: 'init' }),
        expect.anything(),
        expect.anything()
      );
    });
  });

  describe('loadAllFields', () => {
    it('should process individual fields correctly', async () => {
      const formFields = [
        { uid: 'field-1', name: 'Field 1', type: 'text' },
        { uid: 'field-2', name: 'Field 2', type: 'email' }
      ];

      // Mock field storage to not exist
      mockFormStore.manageFieldStorage.mockReturnValue(false);

      await loadAllFields(uid, formFields);

      // Verify setFieldProp was called for each field
      expect(mockFormStore.setFieldProp).toHaveBeenCalledWith(
        uid, FormProps.FIELD_VALUES, 'default-value', 'field-1', undefined
      );
      expect(mockFormStore.setFieldProp).toHaveBeenCalledWith(
        uid, FormProps.FIELD_VALUES, 'default-value', 'field-2', undefined
      );
    });

    it('should process groups and their fields correctly', async () => {
      const formFields = [
        {
          meta: { 
            uid: 'group-1', 
            name: 'Group 1',
            required: false,
            override: { label: false, feedback: false }
          },
          'field-1': { uid: 'field-1', name: 'Field 1', type: 'text' },
          'field-2': { uid: 'field-2', name: 'Field 2', type: 'email' }
        }
      ];

      mockFormStore.manageFieldStorage.mockReturnValue(false);

      await loadAllFields(uid, formFields);

      // The test expects specific call patterns, let's check all calls
      const allCalls = mockFormStore.setFieldProp.mock.calls;
      
      // Check that group was set
      expect(allCalls).toContainEqual([
        uid, FormProps.GROUP, formFields[0].meta, 'group-1'
      ]);

      // Check that fields were processed with group context
      expect(allCalls).toContainEqual([
        uid, FormProps.FIELD_VALUES, 'default-value', 'field-1', 'group-1'
      ]);
      expect(allCalls).toContainEqual([
        uid, FormProps.FIELD_VALUES, 'default-value', 'field-2', 'group-1'
      ]);
    });

    it('should handle mixed individual fields and groups correctly', async () => {
      const formFields = [
        { uid: 'field-1', name: 'Field 1', type: 'text' },
        {
          meta: { 
            uid: 'group-1', 
            name: 'Group 1',
            required: false,
            override: { label: false, feedback: false }
          },
          'field-2': { uid: 'field-2', name: 'Field 2', type: 'email' }
        },
        { uid: 'field-3', name: 'Field 3', type: 'password' }
      ];

      mockFormStore.manageFieldStorage.mockReturnValue(false);

      await loadAllFields(uid, formFields);

      // Check all calls to verify proper processing
      const allCalls = mockFormStore.setFieldProp.mock.calls;
      
      // Verify all fields were processed
      expect(allCalls).toContainEqual([
        uid, FormProps.FIELD_VALUES, 'default-value', 'field-1', undefined
      ]);
      expect(allCalls).toContainEqual([
        uid, FormProps.FIELD_VALUES, 'default-value', 'field-2', 'group-1'
      ]);
      expect(allCalls).toContainEqual([
        uid, FormProps.FIELD_VALUES, 'default-value', 'field-3', undefined
      ]);
    });
  });
});