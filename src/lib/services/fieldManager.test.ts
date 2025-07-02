import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { loadField, loadGroup, loadAllFields } from './fieldManager';
import * as FormStore from '../store/FormStore';
import * as FormHelpers from '../utils/formHelpers';

// Mock dependencies
vi.mock('../store/FormStore');
vi.mock('../utils/formHelpers');

const mockFormStore = FormStore as any;
const mockFormHelpers = FormHelpers as any;

describe('fieldManager', () => {
  const uid = 'test-form';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadGroup', () => {
    it('should set group field properties', async () => {
      const group = {
        meta: {
          uid: 'group-1',
          name: 'Test Group',
          required: true
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
      const field = {
        uid: 'field-1',
        type: 'text',
        defaultValue: undefined,
        dontSave: false
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
        { dontSave: undefined, action: 'init', data: 'default-value' },
        field.uid,
        undefined
      );

      expect(mockFormStore.setFieldProp).toHaveBeenCalledWith(
        uid,
        'value',
        'default-value',
        field.uid,
        undefined
      );
    });

    it('should use field defaultValue when provided', async () => {
      const field = {
        uid: 'field-1',
        type: 'text',
        defaultValue: 'custom-default',
        dontSave: false
      };

      mockFormStore.manageFieldStorage.mockReturnValue(false);

      await loadField(uid, field);

      expect(mockFormStore.manageFieldStorage).toHaveBeenCalledWith(
        uid,
        { dontSave: undefined, action: 'init', data: 'custom-default' },
        field.uid,
        undefined
      );
    });

    it('should set dontSave from group meta when available', async () => {
      const field = {
        uid: 'field-1',
        type: 'text',
        dontSave: false
      };

      const group = {
        meta: {
          uid: 'group-1',
          dontSave: true
        }
      };

      mockFormStore.manageFieldStorage.mockReturnValue(false);

      await loadField(uid, field, group);

      expect(mockFormStore.manageFieldStorage).toHaveBeenCalledWith(
        uid,
        { dontSave: true, action: 'init', data: 'default-value' },
        field.uid,
        group.meta.uid
      );
    });

    it('should set onInput handler when provided', async () => {
      const onInputHandler = vi.fn();
      const field = {
        uid: 'field-1',
        type: 'text',
        onInput: onInputHandler
      };

      mockFormStore.manageFieldStorage.mockReturnValue(true); // field exists

      await loadField(uid, field);

      expect(mockFormStore.setFieldProp).toHaveBeenCalledWith(
        uid,
        'onInput',
        onInputHandler,
        field.uid,
        undefined
      );
    });

    it('should set redact property for redacted fields', async () => {
      const field = {
        uid: 'field-1',
        type: 'text',
        redact: true
      };

      mockFormStore.manageFieldStorage.mockReturnValue(true);

      await loadField(uid, field);

      expect(mockFormStore.setFieldProp).toHaveBeenCalledWith(
        uid,
        'redact',
        { redact: true, data: true },
        field.uid,
        undefined
      );
    });

    it('should inherit redact from group when group is redacted', async () => {
      const field = {
        uid: 'field-1',
        type: 'text',
        redact: false
      };

      const group = {
        meta: {
          uid: 'group-1',
          redact: 'sensitive'
        }
      };

      mockFormStore.manageFieldStorage.mockReturnValue(true);

      await loadField(uid, field, group);

      expect(mockFormStore.setFieldProp).toHaveBeenCalledWith(
        uid,
        'redact',
        { redact: true, data: 'sensitive' },
        field.uid,
        group.meta.uid
      );
    });

    it('should set required property for required fields', async () => {
      const field = {
        uid: 'field-1',
        type: 'text',
        required: true
      };

      mockFormStore.manageFieldStorage.mockReturnValue(true);

      await loadField(uid, field);

      expect(mockFormStore.setFieldProp).toHaveBeenCalledWith(
        uid,
        'required',
        true,
        field.uid,
        undefined
      );
    });

    it('should inherit required from group when group is required', async () => {
      const field = {
        uid: 'field-1',
        type: 'text',
        required: false
      };

      const group = {
        meta: {
          uid: 'group-1',
          required: true
        }
      };

      mockFormStore.manageFieldStorage.mockReturnValue(true);

      await loadField(uid, field, group);

      expect(mockFormStore.setFieldProp).toHaveBeenCalledWith(
        uid,
        'required',
        true,
        field.uid,
        group.meta.uid
      );
    });

    it('should set validity function when provided', async () => {
      const validityFn = vi.fn();
      const field = {
        uid: 'field-1',
        type: 'text',
        validity: validityFn
      };

      mockFormStore.manageFieldStorage.mockReturnValue(true);

      await loadField(uid, field);

      expect(mockFormStore.setFieldProp).toHaveBeenCalledWith(
        uid,
        'validity',
        validityFn,
        field.uid,
        undefined
      );
    });

    it('should skip storage initialization when field already exists', async () => {
      const field = {
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
      const fieldsArr = [
        { uid: 'field-1', type: 'text' },
        { uid: 'field-2', type: 'email' }
      ];

      // Mock field storage to not exist
      mockFormStore.manageFieldStorage.mockReturnValue(false);
      
      await loadAllFields(uid, fieldsArr);

      // Verify setFieldProp was called for each field
      expect(mockFormStore.setFieldProp).toHaveBeenCalledWith(
        uid, 'value', 'default-value', 'field-1', undefined
      );
      expect(mockFormStore.setFieldProp).toHaveBeenCalledWith(
        uid, 'value', 'default-value', 'field-2', undefined
      );
    });

    it('should process groups and their fields correctly', async () => {
      const fieldsArr = [
        {
          meta: { uid: 'group-1', name: 'Group 1' },
          'field-1': { uid: 'field-1', type: 'text' },
          'field-2': { uid: 'field-2', type: 'email' }
        }
      ];

      mockFormStore.manageFieldStorage.mockReturnValue(false);
      
      await loadAllFields(uid, fieldsArr);

      // Verify group was set
      expect(mockFormStore.setFieldProp).toHaveBeenCalledWith(
        uid, 'group', fieldsArr[0].meta, 'group-1'
      );
      
      // Verify fields were processed
      expect(mockFormStore.setFieldProp).toHaveBeenCalledWith(
        uid, 'value', 'default-value', 'field-1', 'group-1'
      );
      expect(mockFormStore.setFieldProp).toHaveBeenCalledWith(
        uid, 'value', 'default-value', 'field-2', 'group-1'
      );
    });

    it('should handle mixed individual fields and groups correctly', async () => {
      const fieldsArr = [
        { uid: 'field-1', type: 'text' },
        {
          meta: { uid: 'group-1', name: 'Group 1' },
          'field-2': { uid: 'field-2', type: 'email' }
        },
        { uid: 'field-3', type: 'password' }
      ];

      mockFormStore.manageFieldStorage.mockReturnValue(false);
      
      await loadAllFields(uid, fieldsArr);

      // Verify all fields were processed
      expect(mockFormStore.setFieldProp).toHaveBeenCalledWith(
        uid, 'value', 'default-value', 'field-1', undefined
      );
      expect(mockFormStore.setFieldProp).toHaveBeenCalledWith(
        uid, 'value', 'default-value', 'field-2', 'group-1'
      );
      expect(mockFormStore.setFieldProp).toHaveBeenCalledWith(
        uid, 'value', 'default-value', 'field-3', undefined
      );
    });
  });
});