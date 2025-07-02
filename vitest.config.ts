import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: ['tests/**/*'] // Exclude Playwright E2E tests
  },
  resolve: {
    alias: {
      '$lib': '/src/lib'
    }
  }
});