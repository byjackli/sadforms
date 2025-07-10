import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadBlank, getBase64, getData, getBlob, checkEmpty, validateFieldValue } from './formHelpers';
import { FIELD_TYPES, DEFAULTS } from '../constants';

describe('formHelpers', () => {
  describe('loadBlank', () => {
    it('should return blank options for option field types', () => {
      const result = loadBlank('dropdown');
      expect(result).toEqual(DEFAULTS.BLANK_OPTIONS);
    });

    it('should return blank checkbox for checkbox type', () => {
      const result = loadBlank(FIELD_TYPES.CHECKBOX);
      expect(result).toEqual(DEFAULTS.BLANK_CHECKBOX);
    });

    it('should return blank file for file type', () => {
      const result = loadBlank(FIELD_TYPES.FILE);
      expect(result).toEqual(DEFAULTS.BLANK_FILE);
    });

    it('should return blank text for text field types', () => {
      const result = loadBlank('text');
      expect(result).toEqual(DEFAULTS.BLANK_TEXT);
    });

    it('should return blank text for unknown field types', () => {
      const result = loadBlank('unknown');
      expect(result).toEqual(DEFAULTS.BLANK_TEXT);
    });
  });

  describe('getBase64', () => {
    it('should convert file to base64 string', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      
      // Mock FileReader
      const mockReader = {
        readAsDataURL: vi.fn(),
        onload: null,
        onerror: null,
        result: 'data:text/plain;base64,dGVzdCBjb250ZW50'
      };
      
      global.FileReader = vi.fn(() => mockReader) as any;
      
      const promise = getBase64(mockFile);
      
      // Trigger onload
      mockReader.onload!();
      
      const result = await promise;
      expect(result).toBe('data:text/plain;base64,dGVzdCBjb250ZW50');
      expect(mockReader.readAsDataURL).toHaveBeenCalledWith(mockFile);
    });

    it('should reject on file reader error', async () => {
      const mockFile = new File(['test'], 'test.txt');
      const mockError = new Error('Read error');
      
      const mockReader = {
        readAsDataURL: vi.fn(),
        onload: null,
        onerror: null,
        result: null
      };
      
      global.FileReader = vi.fn(() => mockReader) as any;
      
      const promise = getBase64(mockFile);
      
      // Trigger onerror
      mockReader.onerror!(mockError);
      
      await expect(promise).rejects.toThrow('Read error');
    });
  });

  describe('getData', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should process FileList into array of base64 data with metadata', async () => {
      const mockFile1 = new File(['content1'], 'file1.txt', { 
        type: 'text/plain',
        lastModified: 1234567890 
      });
      
      const mockFileList = [mockFile1] as any as FileList;
      
      // Mock FileReader for this test
      const mockReader = {
        readAsDataURL: vi.fn(),
        onload: null,
        onerror: null,
        result: 'data:text/plain;base64,Y29udGVudDE='
      };
      
      global.FileReader = vi.fn(() => mockReader) as any;
      
      const promise = getData(mockFileList);
      
      // Trigger the onload immediately
      setTimeout(() => {
        mockReader.onload!();
      }, 0);
      
      const result = await promise;
      
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        base64: 'data:text/plain;base64,Y29udGVudDE=',
        meta: {
          name: 'file1.txt',
          size: expect.any(Number),
          type: 'text/plain',
          lastModified: 1234567890
        }
      });
    });
  });

  describe('getBlob', () => {
    it('should convert base64 string to blob', async () => {
      const base64 = 'data:text/plain;base64,dGVzdA==';
      const mockBlob = new Blob(['test'], { type: 'text/plain' });
      
      global.fetch = vi.fn().mockResolvedValue({
        blob: () => Promise.resolve(mockBlob)
      });
      
      const result = await getBlob(base64);
      
      expect(fetch).toHaveBeenCalledWith(base64);
      expect(result).toBe(mockBlob);
    });
  });

  describe('checkEmpty', () => {
    it('should return true for undefined values', () => {
      expect(checkEmpty(undefined)).toBe(true);
    });

    it('should return true for null values', () => {
      expect(checkEmpty(null)).toBe(true);
    });

    it('should return true for empty strings', () => {
      expect(checkEmpty('')).toBe(true);
      expect(checkEmpty('   ')).toBe(true);
    });

    it('should return true for empty arrays', () => {
      expect(checkEmpty([])).toBe(true);
    });

    it('should return true for empty objects', () => {
      expect(checkEmpty({})).toBe(true);
    });

    it('should return true for file fields with no value', () => {
      expect(checkEmpty(null, FIELD_TYPES.FILE)).toBe(true);
      expect(checkEmpty(false, FIELD_TYPES.FILE)).toBe(true);
    });

    it('should return false for valid values', () => {
      expect(checkEmpty('hello')).toBe(false);
      expect(checkEmpty(['item'])).toBe(false);
      expect(checkEmpty({ key: 'value' })).toBe(false);
      expect(checkEmpty(42)).toBe(false);
      expect(checkEmpty(true)).toBe(false);
    });
  });

  describe('validateFieldValue', () => {
    it('should return false for required fields with empty values', () => {
      const field = { uid: 'test', name: 'Test', required: true, type: 'text' };
      expect(validateFieldValue('', field)).toBe(false);
      expect(validateFieldValue(null, field)).toBe(false);
      expect(validateFieldValue(undefined, field)).toBe(false);
    });

    it('should return true for required fields with valid values', () => {
      const field = { uid: 'test', name: 'Test', required: true, type: 'text' };
      expect(validateFieldValue('hello', field)).toBe(true);
    });

    it('should return true for non-required fields even with empty values', () => {
      const field = { uid: 'test', name: 'Test', required: false, type: 'text' };
      expect(validateFieldValue('', field)).toBe(true);
      expect(validateFieldValue(null, field)).toBe(true);
    });

    it('should return true for non-required fields with valid values', () => {
      const field = { uid: 'test', name: 'Test', required: false, type: 'text' };
      expect(validateFieldValue('hello', field)).toBe(true);
    });
  });
});