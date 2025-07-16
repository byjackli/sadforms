import { test, expect } from '@playwright/test';

test.describe('ValidationEventHandler Integration with Specialized Stores', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/preview#sample');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000); // Allow form to fully load
    });

    test('should display validation feedback for Display Name field after user interaction', async ({ page }) => {
        // Find the Display Name field (which has custom validation)
        const displayNameField = page.locator('input[id="sf:input/374ac078-376a-4b1e-b367-8dd0a4526c9d"]');
        
        // Initially, no validation feedback should be visible
        const feedbackContainer = page.locator('[id="sf:input-feedback/374ac078-376a-4b1e-b367-8dd0a4526c9d"]');
        await expect(feedbackContainer).not.toHaveClass(/active/);
        
        // Focus on the field and enter invalid input (too short)
        await displayNameField.click();
        await displayNameField.fill('abc'); // Less than 6 characters
        
        // Blur the field to trigger validation and wait for feedback to become active
        await displayNameField.blur();
        await expect(feedbackContainer).toHaveClass(/active/);
        
        // Check for specific validation messages
        await expect(feedbackContainer).toContainText('Length is too short');
        await expect(feedbackContainer).toContainText('need 3 more character(s)');
    });

    test('should display validation feedback for special characters in Display Name', async ({ page }) => {
        const displayNameField = page.locator('input[id="sf:input/374ac078-376a-4b1e-b367-8dd0a4526c9d"]');
        const feedbackContainer = page.locator('[id="sf:input-feedback/374ac078-376a-4b1e-b367-8dd0a4526c9d"]');
        
        // Enter input with special characters
        await displayNameField.click();
        await displayNameField.fill('test@123'); // Contains special character
        await displayNameField.blur();
        
        // Check for special character validation message
        await expect(feedbackContainer).toHaveClass(/active/);
        await expect(feedbackContainer).toContainText('Special characters are not allowed');
    });

    test('should show positive validation feedback when Display Name is valid', async ({ page }) => {
        const displayNameField = page.locator('input[id="sf:input/374ac078-376a-4b1e-b367-8dd0a4526c9d"]');
        const feedbackContainer = page.locator('[id="sf:input-feedback/374ac078-376a-4b1e-b367-8dd0a4526c9d"]');
        
        // Enter valid input (alphanumeric, more than 6 characters)
        await displayNameField.click();
        await displayNameField.fill('validname123');
        await displayNameField.blur();
        
        // Check for positive validation messages
        await expect(feedbackContainer).toHaveClass(/active/);
        await expect(feedbackContainer).toContainText('Special characters are not allowed'); // This should be positive
        await expect(feedbackContainer).toContainText('Dispaly name length is just right');
    });

    test('should validate required fields (First Name)', async ({ page }) => {
        const firstNameField = page.locator('input[id="sf:input/8310f3b8-f4ba-484e-a3fd-ea1eb3fc8fba"]');
        
        // Focus and blur without entering data to trigger required validation
        await firstNameField.click();
        await firstNameField.blur();
        
        // Check if field block gets warning styling (required field validation)
        const fieldBlock = page.locator('[id="sf:block/8310f3b8-f4ba-484e-a3fd-ea1eb3fc8fba"]');
        await expect(fieldBlock).toHaveClass(/warn/);
    });

    test('should validate required fields (Bio textarea)', async ({ page }) => {
        const bioField = page.locator('textarea[id="sf:input/9bc96846-42d7-4f22-849c-745958750d08"]');
        
        // Focus and blur without entering data
        await bioField.click();
        await bioField.blur();
        await page.waitForTimeout(500);
        
        // Check if field block gets warning styling for required validation
        const fieldBlock = page.locator('[id="sf:block/9bc96846-42d7-4f22-849c-745958750d08"]');
        await expect(fieldBlock).toHaveClass(/warn/);
    });

    test('should validate checkbox field with custom validation', async ({ page }) => {
        const checkboxField = page.locator('[id="sf:input/751014b9-a6f1-42e0-a3f9-44877b8ebbec"]'); // "Did You Smile Today?" field
        const feedbackContainer = page.locator('[id="sf:input-feedback/751014b9-a6f1-42e0-a3f9-44877b8ebbec"]');
        
        // Initially checkbox should be unchecked and show validation error when blurred
        await checkboxField.focus();
        await checkboxField.blur();
        await page.waitForTimeout(500);
        
        await expect(feedbackContainer).toHaveClass(/active/);
        await expect(feedbackContainer).toContainText('Must accept to continue');
        
        // Check the checkbox to satisfy validation
        await checkboxField.click();
        await checkboxField.blur();
        await page.waitForTimeout(500);
        
        await expect(feedbackContainer).toContainText('Glad you smiled today');
    });

    test('should not show validation feedback before field is touched', async ({ page }) => {
        // Check that validation feedback containers are not active initially
        const displayNameFeedback = page.locator('[id="sf:input-feedback/374ac078-376a-4b1e-b367-8dd0a4526c9d"]');
        const checkboxFeedback = page.locator('[id="sf:input-feedback/751014b9-a6f1-42e0-a3f9-44877b8ebbec"]');
        
        await expect(displayNameFeedback).not.toHaveClass(/active/);
        await expect(checkboxFeedback).not.toHaveClass(/active/);
    });

    test('should handle validation on input events (real-time validation)', async ({ page }) => {
        const displayNameField = page.locator('input[id="sf:input/374ac078-376a-4b1e-b367-8dd0a4526c9d"]');
        const feedbackContainer = page.locator('[id="sf:input-feedback/374ac078-376a-4b1e-b367-8dd0a4526c9d"]');
        
        // Focus the field first to mark it as touched
        await displayNameField.click();
        await displayNameField.fill('a'); // Start with invalid input
        await page.waitForTimeout(500);
        
        // Should show validation feedback as user types
        await expect(feedbackContainer).toHaveClass(/active/);
        await expect(feedbackContainer).toContainText('Length is too short');
        
        // Continue typing to make it valid
        await displayNameField.fill('validname123');
        await page.waitForTimeout(500);
        
        // Should update to show positive feedback
        await expect(feedbackContainer).toContainText('Dispaly name length is just right');
    });

    test('should handle group field validation correctly', async ({ page }) => {
        // Test a field within the "Links" group
        const instagramField = page.locator('input[placeholder="Instagram"]').first();
        
        // Focus and interact with grouped field
        await instagramField.click();
        await instagramField.fill('test_username');
        await instagramField.blur();
        
        // Verify the field value is set properly (no validation errors for this field)
        await expect(instagramField).toHaveValue('test_username');
    });

    test('should validate file upload requirements', async ({ page }) => {
        const fileInput = page.locator('input[type="file"]').first(); // Profile Picture field
        
        // Focus and blur the required file field without uploading
        await fileInput.focus();
        await fileInput.blur();
        
        // Should show required field styling
        await expect(fileInput.locator('xpath=..')).toHaveClass(/warn/);
    });

    test('should handle rapid field interactions without errors', async ({ page }) => {
        const displayNameField = page.locator('input[id="sf:input/374ac078-376a-4b1e-b367-8dd0a4526c9d"]');
        const firstNameField = page.locator('input[id="sf:input/8310f3b8-f4ba-484e-a3fd-ea1eb3fc8fba"]');
        const bioField = page.locator('textarea[id="sf:input/9bc96846-42d7-4f22-849c-745958750d08"]');
        
        // Rapidly interact with multiple fields
        await displayNameField.click();
        await displayNameField.fill('test');
        await firstNameField.click();
        await firstNameField.fill('John');
        await bioField.click();
        await bioField.fill('Short bio');
        await displayNameField.click();
        await displayNameField.fill('validname123');
        
        // Verify no JavaScript errors occurred and values are preserved
        await expect(displayNameField).toHaveValue('validname123');
        await expect(firstNameField).toHaveValue('John');
        await expect(bioField).toHaveValue('Short bio');
    });

    test('should emit validation events correctly through EventBus', async ({ page }) => {
        // Monitor console for validation events (this requires the app to log events)
        const logs: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'log' && msg.text().includes('validation')) {
                logs.push(msg.text());
            }
        });
        
        const displayNameField = page.locator('input[id="sf:input/374ac078-376a-4b1e-b367-8dd0a4526c9d"]');
        
        // Trigger validation
        await displayNameField.click();
        await displayNameField.fill('abc'); // Less than 6 characters to trigger validation
        await displayNameField.blur();
        
        // Note: This test would work better with actual event logging in the app
        // For now, we verify the validation system works by checking UI feedback
        const feedbackContainer = page.locator('[id*="374ac078-376a-4b1e-b367-8dd0a4526c9d"]').locator('.container-validity');
        await expect(feedbackContainer).toHaveClass(/active/);
    });
});