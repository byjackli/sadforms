/**
 * Constants and magic numbers used throughout the SadForms library
 */

// Storage Keys
export const STORAGE_KEY_PREFIX = '[SadForms]:';

// Field Types
export enum FIELD_TYPES {
  DIVIDER = 'divider',
  SWITCH = 'switch',
  DROPDOWN = 'dropdown',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  FILE = 'file',
  TEXT = 'text',
  TEXTAREA = 'textarea',
  EMAIL = 'email',
  TEL = 'tel',
  PASSWORD = 'password',
  NUMBER = 'number',
  TIME = 'time'
};

// Field Type Groups
export const TEXT_FIELD_TYPES = [
  FIELD_TYPES.TEXT,
  FIELD_TYPES.TEXTAREA,
  FIELD_TYPES.EMAIL,
  FIELD_TYPES.TEL,
  FIELD_TYPES.PASSWORD
] as const;

export const OPTION_FIELD_TYPES = [
  FIELD_TYPES.DROPDOWN,
  FIELD_TYPES.RADIO
] as const;

// Storage Properties
export enum FormProps {
  SUBMIT = 'submit',
  DONT_SAVE = 'dontSave',
  REQUIRED = 'required',
  ON_INPUT = 'onInput',
  VALIDITY = 'validity',
  VALIDATION_RESULT = 'validationResult',
  PREVIEW = 'preview',
  REDACT = 'redact',
  TOUCHED = 'touched',
  FIELD_VALUES = 'fieldValues',
  DISPLAY_VALUES = 'displayValues',
  ACTIVE = 'active',
  GROUP = 'group'
};

// Actions
export const STORAGE_ACTIONS = {
  SET: 'set',
  INIT: 'init',
  GET: 'get',
  EXISTS: 'exists'
} as const;

// Validation Messages
export const VALIDATION_MESSAGES = {
  FIELD_REQUIRED: 'This field is required',
  FUNCTION_INVALID: 'Function must be valid JavaScript',
  INVALID_VALUE: 'Invalid value provided'
} as const;

// Default Values
export const DEFAULTS = {
  FIELD_TYPE: FIELD_TYPES.TEXT,
  BLANK_CHECKBOX: false,
  BLANK_FILE: null,
  BLANK_TEXT: '',
  BLANK_OPTIONS: {}
} as const;

// Console Styling
export const CONSOLE_STYLES = {
  BRANDING: 'background-color: indigo; color: skyblue;',
  ERROR: 'background-color: red; color: white;',
  INFO: 'background-color: blue; color: white;'
} as const;

// Branding
export const BRANDING = {
  MESSAGE: 'This app takes advantage of Sad Forms.\nLearn more at https://sadforms.com',
  WEBSITE: 'https://sadforms.com'
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  FORM_STORE_MISSING_PROP: '[FormStore] stored does not have this property!',
  UNKNOWN_STORAGE_ACTION: 'Unknown action',
  FIELD_NOT_FOUND: 'Field not found'
} as const;