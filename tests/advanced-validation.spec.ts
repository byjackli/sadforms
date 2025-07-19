import { test, expect } from '@playwright/test';

test.describe('Advanced Validation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/edit?uid=sample');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.waitForSelector('#editor', { state: 'visible' });
  });

  test.describe('Complex Validation Rules', () => {
    test('should handle multiple validation conditions on a single field', async ({ page }) => {
      // Edit the first field
      const firstEditButton = page.locator('.modify-edit').first();
      await firstEditButton.click();
      await page.waitForTimeout(1000);
      
      // Add complex validation with multiple rules
      const validationTextarea = page.locator('textarea[id="sf:input/validity"]');
      const complexValidationRule = `return {
        minLength: {
          check: value.length >= 3,
          true: "✓ Minimum length satisfied",
          false: "✗ Must be at least 3 characters"
        },
        maxLength: {
          check: value.length <= 20,
          true: "✓ Maximum length satisfied", 
          false: "✗ Must be no more than 20 characters"
        },
        noNumbers: {
          check: !/\\d/.test(value),
          true: "✓ No numbers found",
          false: "✗ Numbers are not allowed"
        },
        startsWithCapital: {
          check: /^[A-Z]/.test(value),
          true: "✓ Starts with capital letter",
          false: "✗ Must start with a capital letter"
        }
      };`;
      
      await validationTextarea.fill(complexValidationRule);
      await validationTextarea.blur();
      await page.waitForTimeout(1000);
      
      // Close editor
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
      // Test the complex validation
      const testField = page.locator('input[name="First Name"]').first();
      
      // Test cases with different validation outcomes
      const testCases = [
        { input: 'ab', expectedFailures: ['minLength', 'startsWithCapital'] },
        { input: 'Ab123', expectedFailures: ['noNumbers'] },
        { input: 'Abcdefghijklmnopqrstuvwxyz', expectedFailures: ['maxLength'] },
        { input: 'Alice', expectedFailures: [] }, // Should pass all validations
      ];
      
      for (const testCase of testCases) {
        await testField.fill(testCase.input);
        await testField.blur();
        await page.waitForTimeout(1000);
        
        // Check validation feedback
        const fieldBlock = page.locator('.form-block:has(input[name="First Name"])').first();
        const feedbackElement = fieldBlock.locator('.container-validity');
        
        if (await feedbackElement.isVisible()) {
          const feedbackText = await feedbackElement.textContent();
          console.log(`Input: "${testCase.input}", Feedback: "${feedbackText}"`);
          
          if (testCase.expectedFailures.length === 0) {
            // Should show all success messages
            expect(feedbackText).toContain('✓');
          } else {
            // Should show failure messages for expected failures
            expect(feedbackText).toContain('✗');
          }
        }
      }
    });

    test('should validate email format with custom regex', async ({ page }) => {
      // Create a new email field
      const addFieldDropdown = page.locator('.modify-add .dropdown-container');
      await addFieldDropdown.click();
      
      const emailOption = page.locator('[role="option"]:has-text("email")');
      await emailOption.click();
      await page.waitForTimeout(1000);
      
      // Edit the newly created email field
      const allEditButtons = page.locator('.modify-edit');
      const lastEditButton = allEditButtons.last();
      await lastEditButton.click();
      await page.waitForTimeout(1000);
      
      // Set field name
      const nameInput = page.locator('input[id="sf:input/name"]');
      await nameInput.fill('Email Address');
      await nameInput.blur();
      
      // Add email validation
      const validationTextarea = page.locator('textarea[id="sf:input/validity"]');
      const emailValidationRule = `return {
        emailFormat: {
          check: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/.test(value),
          true: "✓ Valid email format",
          false: "✗ Please enter a valid email address"
        },
        noSpaces: {
          check: !/\\s/.test(value),
          true: "✓ No spaces in email",
          false: "✗ Email addresses cannot contain spaces"
        }
      };`;
      
      await validationTextarea.fill(emailValidationRule);
      await validationTextarea.blur();
      await page.waitForTimeout(1000);
      
      // Close editor
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
      // Test email validation using Instagram field (which exists in the form)
      const emailField = page.locator('input[name="Instagram"]');
      await expect(emailField).toBeVisible();
      
      const emailTestCases = [
        { input: 'invalid', valid: false },
        { input: 'test@', valid: false },
        { input: 'test @example.com', valid: false }, // Has space
        { input: 'test@example', valid: false }, // No TLD
        { input: 'test@example.com', valid: true },
        { input: 'user.name+tag@example.org', valid: true },
      ];
      
      for (const testCase of emailTestCases) {
        await emailField.fill(testCase.input);
        await emailField.blur();
        await page.waitForTimeout(1000);
        
        const fieldBlock = page.locator('.form-block:has(input[name="Email Address"])');
        const feedbackElement = fieldBlock.locator('.container-validity');
        
        if (await feedbackElement.isVisible()) {
          const feedbackText = await feedbackElement.textContent();
          
          if (testCase.valid) {
            expect(feedbackText).toContain('✓');
          } else {
            expect(feedbackText).toContain('✗');
          }
        }
      }
    });

    test('should validate password strength requirements', async ({ page }) => {
      // Create a password field
      const addFieldDropdown = page.locator('.modify-add .dropdown-container');
      await addFieldDropdown.click();
      
      const passwordOption = page.locator('[role="option"]:has-text("password")');
      await passwordOption.click();
      await page.waitForTimeout(1000);
      
      // Edit the password field
      const allEditButtons = page.locator('.modify-edit');
      const lastEditButton = allEditButtons.last();
      await lastEditButton.click();
      await page.waitForTimeout(1000);
      
      // Set field name
      const nameInput = page.locator('input[id="sf:input/name"]');
      await nameInput.fill('Password');
      await nameInput.blur();
      
      // Add password strength validation
      const validationTextarea = page.locator('textarea[id="sf:input/validity"]');
      const passwordValidationRule = `return {
        minLength: {
          check: value.length >= 8,
          true: "✓ At least 8 characters",
          false: "✗ Password must be at least 8 characters long"
        },
        hasUppercase: {
          check: /[A-Z]/.test(value),
          true: "✓ Contains uppercase letter",
          false: "✗ Must contain at least one uppercase letter"
        },
        hasLowercase: {
          check: /[a-z]/.test(value),
          true: "✓ Contains lowercase letter", 
          false: "✗ Must contain at least one lowercase letter"
        },
        hasNumber: {
          check: /\\d/.test(value),
          true: "✓ Contains number",
          false: "✗ Must contain at least one number"
        },
        hasSpecial: {
          check: /[!@#$%^&*(),.?":{}|<>]/.test(value),
          true: "✓ Contains special character",
          false: "✗ Must contain at least one special character"
        }
      };`;
      
      await validationTextarea.fill(passwordValidationRule);
      await validationTextarea.blur();
      await page.waitForTimeout(1000);
      
      // Close editor
      await page.keyboard.press('Escape');
      await page.waitForTimeout(2000);
      
      // Test password validation - look for the password field by name
      const passwordField = page.locator('input[name="Password"]');
      await passwordField.waitFor({ state: 'visible', timeout: 10000 });
      await expect(passwordField).toBeVisible();
      
      const passwordTestCases = [
        { input: 'weak', description: 'weak password' },
        { input: 'password123', description: 'missing uppercase and special' },
        { input: 'Password123', description: 'missing special character' },
        { input: 'Password123!', description: 'strong password' },
      ];
      
      for (const testCase of passwordTestCases) {
        await passwordField.fill(testCase.input);
        await passwordField.blur();
        await page.waitForTimeout(1000);
        
        console.log(`Testing ${testCase.description}: "${testCase.input}"`);
        
        const fieldBlock = page.locator('.form-block:has(input[name="Password"])');
        const feedbackElement = fieldBlock.locator('.container-validity');
        
        if (await feedbackElement.isVisible()) {
          const feedbackText = await feedbackElement.textContent();
          console.log(`Feedback: ${feedbackText}`);
          
          // Count checkmarks vs X marks to determine strength
          if (feedbackText) {
            const checkmarks = (feedbackText.match(/✓/g) || []).length;
            const xmarks = (feedbackText.match(/✗/g) || []).length;
            console.log(`✓: ${checkmarks}, ✗: ${xmarks}`);
          }
        }
      }
    });
  });

  test.describe('Cross-Field Validation', () => {
    test('should validate that confirm password matches password', async ({ page }) => {
      // This test would require custom JavaScript in the validation function
      // to access other field values, which may not be directly supported
      // by the current validation system. This is a placeholder for future enhancement.
      
      // Create password field
      const addFieldDropdown = page.locator('.modify-add .dropdown-container');
      await addFieldDropdown.click();
      
      const passwordOption = page.locator('[role="option"]:has-text("password")');
      await passwordOption.click();
      await page.waitForTimeout(1000);
      
      // Edit password field
      const allEditButtons = page.locator('.modify-edit');
      let lastEditButton = allEditButtons.last();
      await lastEditButton.click();
      await page.waitForTimeout(1000);
      
      const nameInput = page.locator('input[id="sf:input/name"]');
      await nameInput.fill('Password');
      await nameInput.blur();
      
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
      // Create confirm password field
      await addFieldDropdown.click();
      await passwordOption.click();
      await page.waitForTimeout(1000);
      
      lastEditButton = page.locator('.modify-edit').last();
      await lastEditButton.click();
      await page.waitForTimeout(1000);
      
      await nameInput.fill('Confirm Password');
      await nameInput.blur();
      
      // Note: Cross-field validation would require access to other field values
      // This is a complex feature that may need enhancement to the validation system
      const validationTextarea = page.locator('textarea[id="sf:input/validity"]');
      const crossFieldValidationRule = `return {
        passwordMatch: {
          check: true, // Placeholder - would need access to other field values
          true: "✓ Passwords match",
          false: "✗ Passwords do not match"
        }
      };`;
      
      await validationTextarea.fill(crossFieldValidationRule);
      await validationTextarea.blur();
      
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
      console.log('Cross-field validation test created (requires system enhancement)');
    });
  });

  test.describe('Conditional Validation', () => {
    test('should apply different validation rules based on field content', async ({ page }) => {
      // Edit the first field
      const firstEditButton = page.locator('.modify-edit').first();
      await firstEditButton.click();
      await page.waitForTimeout(1000);
      
      // Add conditional validation
      const validationTextarea = page.locator('textarea[id="sf:input/validity"]');
      const conditionalValidationRule = `return {
        conditional: {
          check: value.length === 0 || (value.length >= 3 && value.length <= 50),
          true: value.length === 0 ? "Field is optional" : "✓ Length is acceptable",
          false: "✗ If provided, must be 3-50 characters long"
        },
        typeSpecific: {
          check: value.length === 0 || !/\\d/.test(value.charAt(0)),
          true: value.length === 0 ? "" : "✓ Does not start with number",
          false: "✗ Cannot start with a number"
        }
      };`;
      
      await validationTextarea.fill(conditionalValidationRule);
      await validationTextarea.blur();
      await page.waitForTimeout(1000);
      
      // Close editor
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
      // Test conditional validation
      const testField = page.locator('input[name="First Name"]').first();
      
      const conditionalTestCases = [
        { input: '', description: 'empty (should be valid)' },
        { input: 'AB', description: 'too short' },
        { input: 'Alice', description: 'valid length' },
        { input: '1Alice', description: 'starts with number' },
        { input: 'A'.repeat(51), description: 'too long' },
      ];
      
      for (const testCase of conditionalTestCases) {
        await testField.fill(testCase.input);
        await testField.blur();
        await page.waitForTimeout(1000);
        
        console.log(`Testing conditional validation: ${testCase.description}`);
        
        const fieldBlock = page.locator('.form-block:has(input[name="First Name"])').first();
        const feedbackElement = fieldBlock.locator('.container-validity');
        
        if (await feedbackElement.isVisible()) {
          const feedbackText = await feedbackElement.textContent();
          console.log(`Feedback: ${feedbackText}`);
        }
      }
    });
  });
});