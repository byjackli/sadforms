import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { checkValidity, updateFeedback, updateWarn, updatePreview } from './validationService';
import * as FormStore from '../store/FormStore';
import * as CustomStore from '../store/CustomStore';
import { get } from 'svelte/store';

// Mock dependencies
vi.mock('../store/FormStore');
vi.mock('../store/CustomStore');
vi.mock('svelte/store');

const mockFormStore = FormStore as any;
const mockCustomStore = CustomStore as any;
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
      
      mockFormStore.getFieldProp.mockReturnValue(mockVerdict);
      
      const result = await checkValidity(formId, 'form');
      
      expect(result.verdict).toBe(true);
      expect(mockFormStore.getFieldProp).toHaveBeenCalledWith(formId, 'verdict');
    });

    it('should return false for form with invalid fields', async () => {
      const mockVerdict = {
        field1: { verdict: true },
        field2: { verdict: false }
      };
      
      mockFormStore.getFieldProp.mockReturnValue(mockVerdict);
      
      const result = await checkValidity(formId, 'form');
      
      expect(result.verdict).toBe(false);
    });

    it('should validate field-level for required fields', async () => {
      mockFormStore.manageFieldStorage.mockReturnValue('');
      mockFormStore.getFieldProp
        .mockReturnValueOnce(true) // required = true
        .mockReturnValueOnce(null); // validity function = null
      
      const result = await checkValidity(formId, 'field', fieldId);
      
      expect(result.verdict).toBe(false); // Empty required field should be invalid
      expect(mockFormStore.setFieldProp).toHaveBeenCalledWith(
        formId, 
        'verdict', 
        { verdict: false, raw: [] }, 
        fieldId, 
        undefined
      );
    });

    it('should validate field-level for non-required fields', async () => {
      mockFormStore.manageFieldStorage.mockReturnValue('');
      mockFormStore.getFieldProp.mockReturnValue(false); // required = false
      
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
      
      mockFormStore.manageFieldStorage.mockReturnValue('test-value');
      mockFormStore.getFieldProp
        .mockReturnValueOnce(false) // required = false
        .mockReturnValueOnce(mockValidationFn); // validity function
      
      const result = await checkValidity(formId, 'field', fieldId);
      
      expect(mockValidationFn).toHaveBeenCalledWith('test-value');
      expect(result.raw).toEqual([{ verdict: true, feedback: 'Valid message' }]);
    });

    it('should handle group validation', async () => {
      const mockGroupVerdict = {
        field1: { verdict: true, raw: [] },
        field2: { verdict: false, raw: [{ verdict: false, feedback: 'Error' }] }
      };
      
      mockFormStore.getFieldProp.mockReturnValue(mockGroupVerdict);
      
      const result = await checkValidity(formId, 'group', fieldId, groupId);
      
      expect(result.group.verdict).toBe(false);
      expect(result.group.raw).toEqual(expect.arrayContaining([{ verdict: false, feedback: 'Error' }]));
      expect(mockFormStore.setFieldProp).toHaveBeenCalledWith(
        formId,
        'verdict',
        expect.objectContaining({ verdict: false }),
        'group',
        groupId
      );
    });
  });

  describe('updateFeedback', () => {
    it('should update feedback display for regular fields', () => {
      const mockSpan = {
        setAttribute: vi.fn(),
        appendChild: vi.fn()
      };
      
      const mockParagraph = {
        classList: { add: vi.fn() },
        appendChild: vi.fn(),
        prepend: vi.fn(),
        append: vi.fn()
      };
      
      const mockElement = {
        classList: { contains: vi.fn().mockReturnValue(false), toggle: vi.fn() },
        innerHTML: '',
        appendChild: vi.fn()
      };
      
      global.document.getElementById = vi.fn().mockReturnValue(mockElement);
      global.document.createElement = vi.fn()
        .mockReturnValueOnce(mockParagraph)
        .mockReturnValueOnce(mockSpan)
        .mockReturnValueOnce(mockSpan);
      global.document.createTextNode = vi.fn().mockReturnValue({ nodeValue: 'test' });
      
      // Mock updateWarn function since it's called at the end
      const mockUpdateWarn = vi.fn();
      vi.doMock('./validationService', async () => {
        const actual = await vi.importActual('./validationService');
        return {
          ...actual,
          updateWarn: mockUpdateWarn
        };
      });
      
      const validation = {
        verdict: false,
        raw: [{ feedback: 'Test error', verdict: false }]
      };
      
      updateFeedback(formId, fieldId, undefined, validation);
      
      expect(global.document.getElementById).toHaveBeenCalledWith('sf:input-feedback/test-field');
      expect(mockElement.classList.toggle).toHaveBeenCalledWith('active');
    });

    it('should handle group feedback when groupOnly is true', () => {
      const mockSpan = {
        setAttribute: vi.fn(),
        appendChild: vi.fn()
      };
      
      const mockParagraph = {
        classList: { add: vi.fn() },
        appendChild: vi.fn(),
        prepend: vi.fn(),
        append: vi.fn()
      };
      
      const mockElement = {
        classList: { contains: vi.fn().mockReturnValue(false), toggle: vi.fn() },
        innerHTML: '',
        appendChild: vi.fn()
      };
      
      global.document.getElementById = vi.fn().mockReturnValue(mockElement);
      global.document.createElement = vi.fn()
        .mockReturnValueOnce(mockParagraph)
        .mockReturnValueOnce(mockSpan)
        .mockReturnValueOnce(mockSpan);
      global.document.createTextNode = vi.fn().mockReturnValue({ nodeValue: 'test' });
      
      mockFormStore.getFieldProp
        .mockReturnValueOnce({ override: { feedback: true } }) // group config
        .mockReturnValueOnce({ group: { raw: [{ feedback: 'Group error', verdict: false }] } }); // group verdict
      
      const validation = {
        verdict: false,
        raw: [{ feedback: 'Field error', verdict: false }]
      };
      
      updateFeedback(formId, fieldId, groupId, validation);
      
      expect(global.document.getElementById).toHaveBeenCalledWith('sf:group-feedback/test-group');
    });

    it('should do nothing if element is not found', () => {
      global.document.getElementById = vi.fn().mockReturnValue(null);
      
      const validation = { verdict: true, raw: [] };
      
      // Should not throw
      expect(() => updateFeedback(formId, fieldId, undefined, validation)).not.toThrow();
    });
  });

  describe('updateWarn', () => {
    it('should toggle warning class based on field verdict', () => {
      const mockElement = {
        classList: { contains: vi.fn().mockReturnValue(false), toggle: vi.fn() }
      };
      
      global.document.getElementById = vi.fn().mockReturnValue(mockElement);
      
      updateWarn(formId, fieldId, undefined, false);
      
      expect(global.document.getElementById).toHaveBeenCalledWith('sf:block/test-field');
      expect(mockElement.classList.toggle).toHaveBeenCalledWith('warn');
    });

    it('should handle group warnings for required groups', () => {
      const mockFieldElement = {
        classList: { contains: vi.fn().mockReturnValue(false), toggle: vi.fn() }
      };
      const mockGroupElement = {
        classList: { contains: vi.fn().mockReturnValue(false), toggle: vi.fn() }
      };
      
      global.document.getElementById = vi.fn()
        .mockReturnValueOnce(mockFieldElement) // field element
        .mockReturnValueOnce(mockGroupElement); // group element
      
      mockFormStore.getFieldProp
        .mockReturnValueOnce({ required: true }) // group config
        .mockReturnValueOnce({ group: { verdict: false } }); // group verdict
      
      updateWarn(formId, fieldId, groupId, false);
      
      expect(global.document.getElementById).toHaveBeenCalledWith('sf:group/test-group');
      expect(mockGroupElement.classList.toggle).toHaveBeenCalledWith('warn');
    });
  });

  describe('updatePreview', () => {
    it('should update file preview display', () => {
      const mockFiles = [
        {
          base64: 'data:image/png;base64,abc123',
          meta: { name: 'test.png' }
        }
      ];
      
      const mockElement = {
        classList: { contains: vi.fn().mockReturnValue(false), toggle: vi.fn() },
        innerHTML: ''
      };
      
      global.document.getElementById = vi.fn().mockReturnValue(mockElement);
      mockFormStore.manageFieldStorage.mockReturnValue(mockFiles);
      
      updatePreview(formId, fieldId, undefined);
      
      expect(global.document.getElementById).toHaveBeenCalledWith('sf:input-preview/test-field');
      expect(mockElement.classList.toggle).toHaveBeenCalledWith('active');
      expect(mockElement.innerHTML).toContain('test.png');
    });

    it('should handle empty file lists', () => {
      const mockElement = {
        classList: { contains: vi.fn().mockReturnValue(true), toggle: vi.fn() },
        innerHTML: 'previous content'
      };
      
      global.document.getElementById = vi.fn().mockReturnValue(mockElement);
      mockFormStore.manageFieldStorage.mockReturnValue([]);
      
      updatePreview(formId, fieldId, undefined);
      
      expect(mockElement.classList.toggle).toHaveBeenCalledWith('active');
      expect(mockElement.innerHTML).toBe('');
    });

    it('should do nothing if element is not found', () => {
      global.document.getElementById = vi.fn().mockReturnValue(null);
      mockFormStore.manageFieldStorage.mockReturnValue([]);
      
      // Should not throw
      expect(() => updatePreview(formId, fieldId, undefined)).not.toThrow();
    });
  });
});