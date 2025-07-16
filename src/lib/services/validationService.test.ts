import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { checkValidity } from './validationService';
import * as FormFieldStore from '../store/FormFieldStore';
import * as FormValidationStore from '../store/FormValidationStore';
import * as FormConfigStore from '../store/FormConfigStore';
import * as CustomStore from '../store/CustomStore';
import { get } from 'svelte/store';

// Mock dependencies
vi.mock('../store/FormFieldStore');
vi.mock('../store/FormValidationStore');
vi.mock('../store/FormConfigStore');
vi.mock('../store/CustomStore');
vi.mock('svelte/store');

const mockFormFieldStore = FormFieldStore as any;
const mockFormValidationStore = FormValidationStore as any;
const mockFormConfigStore = FormConfigStore as any;
const mockGet = get as Mock;

describe('validationService', () => {
  const formId = 'test-form';
  const fieldId = 'test-field';
  const groupId = 'test-group';

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock CustomStore values
    mockGet.mockReturnValue({
      names: {
        inputFeedback: 'sf:input-feedback/',
        groupFeedback: 'sf:group-feedback/',
        blockHeader: 'sf:block/',
        groupHeader: 'sf:group/',
        inputPreview: 'sf:input-preview/',
        warn: 'warn'
      }
    });

    // Mock DOM methods
    global.document.getElementById = vi.fn();
    global.document.createElement = vi.fn();
    global.document.createTextNode = vi.fn();
  });

  describe('checkValidity', () => {
    it('should validate form-level when type is "form"', async () => {
      const mockVerdict = {
        field1: { verdict: true },
        field2: { verdict: true }
      };
      
      mockFormValidationStore.getValidationResult.mockReturnValue(mockVerdict);
      
      const result = await checkValidity(formId, 'form');
      
      expect(result.verdict).toBe(true);
      expect(mockFormValidationStore.getValidationResult).toHaveBeenCalledWith(formId, 'validationResult');
    });

    it('should return false for form with invalid fields', async () => {
      const mockVerdict = {
        field1: { verdict: true },
        field2: { verdict: false }
      };
      
      mockFormValidationStore.getValidationResult.mockReturnValue(mockVerdict);
      
      const result = await checkValidity(formId, 'form');
      
      expect(result.verdict).toBe(false);
    });

    it('should validate field-level for required fields', async () => {
      mockFormFieldStore.getFieldValue.mockReturnValue('');
      mockFormConfigStore.getConfigValue
        .mockReturnValueOnce(true) // required = true
        .mockReturnValueOnce(null); // validity function = null
      
      const result = await checkValidity(formId, 'field', fieldId);
      
      expect(result.verdict).toBe(false); // Empty required field should be invalid
      expect(mockFormValidationStore.setValidationResult).toHaveBeenCalledWith(
        formId, 
        { verdict: false, raw: [] }, 
        fieldId, 
        undefined
      );
    });

    it('should validate field-level for non-required fields', async () => {
      mockFormFieldStore.getFieldValue.mockReturnValue('');
      mockFormConfigStore.getConfigValue.mockReturnValue(false); // required = false
      
      const result = await checkValidity(formId, 'field', fieldId);
      
      expect(result.verdict).toBe(true); // Empty non-required field should be valid
    });

    it('should execute custom validation functions', async () => {
      const mockValidationFn = vi.fn().mockReturnValue({
        condition1: {
          check: true, // Make this synchronous for the test
          true: 'Valid message',
          false: 'Invalid message'
        }
      });
      
      mockFormFieldStore.getField.mockReturnValue('test-value');
      mockFormConfigStore.getConfigValue.mockReturnValueOnce(false); // required = false
      mockFormValidationStore.getValidationResult.mockReturnValueOnce(mockValidationFn); // validity function
      
      const result = await checkValidity(formId, 'field', fieldId);
      
      expect(mockValidationFn).toHaveBeenCalledWith('test-value');
      expect(result.raw).toEqual([{ verdict: true, feedback: 'Valid message' }]);
    });

    it('should handle group validation', async () => {
      const mockGroupVerdict = {
        field1: { verdict: true, raw: [] },
        field2: { verdict: false, raw: [{ verdict: false, feedback: 'Error' }] }
      };
      
      mockFormValidationStore.getValidationResult.mockReturnValue(mockGroupVerdict);
      
      const result = await checkValidity(formId, 'group', fieldId, groupId);
      
      expect(result.group.verdict).toBe(false);
      expect(result.group.raw).toEqual(expect.arrayContaining([{ verdict: false, feedback: 'Error' }]));
      expect(mockFormValidationStore.setValidationResult).toHaveBeenCalledWith(
        formId,
        expect.objectContaining({ verdict: false }),
        'group',
        groupId
      );
    });
  });

});