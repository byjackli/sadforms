import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';

export default [
  js.configs.recommended,
  {
    ignores: [
      'node_modules/**',
      'dist/**', 
      'build/**',
      '.svelte-kit/**',
      'coverage/**',
      '**/*.d.ts'
    ]
  },
  {
    files: ['src/**/*.{js,ts}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
      },
      globals: {
        console: 'readonly',
        localStorage: 'readonly',
        document: 'readonly',
        window: 'readonly',
        navigator: 'readonly',
        HTMLElement: 'readonly',
        MouseEvent: 'readonly',
        KeyboardEvent: 'readonly',
        Element: 'readonly',
        Event: 'readonly',
        HTMLInputElement: 'readonly',
        DragEvent: 'readonly',
        NodeJS: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        performance: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        FileList: 'readonly',
        Blob: 'readonly',
        Worker: 'readonly',
        module: 'readonly',
        global: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      'no-unused-vars': 'warn'
    }
  },
  {
    files: ['src/test/**/*.{js,ts}', 'tests/**/*.{js,ts}', '**/*.test.{js,ts}', '**/*.spec.{js,ts}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
      },
      globals: {
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        global: 'writable',
        vi: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        describe: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly'
      }
    },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off'
    }
  },
  {
    files: ['src/**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tsparser
      },
      globals: {
        console: 'readonly',
        localStorage: 'readonly',
        document: 'readonly',
        window: 'readonly',
        navigator: 'readonly',
        HTMLElement: 'readonly',
        MouseEvent: 'readonly',
        KeyboardEvent: 'readonly',
        Element: 'readonly',
        Event: 'readonly',
        HTMLInputElement: 'readonly',
        DragEvent: 'readonly',
        NodeJS: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        performance: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        FileList: 'readonly',
        Blob: 'readonly',
        Worker: 'readonly',
        module: 'readonly',
        global: 'readonly'
      }
    },
    plugins: {
      svelte
    },
    rules: {
      ...svelte.configs.recommended.rules,
      'no-unused-vars': 'warn',
      'no-useless-escape': 'off',
      'no-inner-declarations': 'off'
    }
  }
];