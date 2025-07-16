import { test, expect } from '@playwright/test';

test.describe('Simple Validation Check', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/preview#sample');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000); // Allow form to fully load
    });

    test('should render form fields correctly', async ({ page }) => {
        // Check if the form exists
        const form = page.locator('form');
        await expect(form).toBeVisible();
        
        // Check if Display Name field exists
        const displayNameField = page.locator('input').filter({ hasText: /Display Name/ }).or(
            page.locator('input[id*="374ac078-376a-4b1e-b367-8dd0a4526c9d"]')
        );
        
        console.log('Looking for Display Name field...');
        await expect(displayNameField.first()).toBeVisible();
        
        // Log all input fields for debugging
        const allInputs = page.locator('input');
        const inputCount = await allInputs.count();
        console.log(`Found ${inputCount} input fields`);
        
        for (let i = 0; i < Math.min(inputCount, 5); i++) {
            const inputId = await allInputs.nth(i).getAttribute('id');
            const inputName = await allInputs.nth(i).getAttribute('name');
            const inputType = await allInputs.nth(i).getAttribute('type');
            console.log(`Input ${i}: id="${inputId}", name="${inputName}", type="${inputType}"`);
        }
    });

    test('should find validation feedback container', async ({ page }) => {
        // First, interact with the Display Name field to trigger validation
        const displayNameField = page.locator('input[id*="374ac078-376a-4b1e-b367-8dd0a4526c9d"]');
        await displayNameField.click();
        await displayNameField.fill('abc'); // Less than 6 characters to trigger validation error
        await displayNameField.blur(); // Blur to trigger validation
        
        // Wait a moment for validation to process
        await page.waitForTimeout(1000);
        
        // Now look for the feedback container
        const feedbackContainer = page.locator('[id*="374ac078-376a-4b1e-b367-8dd0a4526c9d"]').locator('.container-validity');
        await expect(feedbackContainer).toHaveClass(/active/);
        
        const containerClass = await feedbackContainer.getAttribute('class');
        console.log(`Feedback container class: "${containerClass}"`);
        
        const containerId = await feedbackContainer.getAttribute('id');
        console.log(`Feedback container id: "${containerId}"`);
    });

    test('should interact with Display Name field', async ({ page }) => {
        // Try different selectors to find the Display Name field
        let displayNameField = page.locator('input[id*="374ac078-376a-4b1e-b367-8dd0a4526c9d"]');
        
        if (await displayNameField.count() === 0) {
            // Try by aria-labelledby
            displayNameField = page.locator('input[aria-labelledby*="374ac078-376a-4b1e-b367-8dd0a4526c9d"]');
        }
        
        if (await displayNameField.count() === 0) {
            // Try by name attribute
            displayNameField = page.locator('input[name="Display Name"]');
        }
        
        console.log(`Found ${await displayNameField.count()} Display Name field(s)`);
        await expect(displayNameField.first()).toBeVisible();
        
        // Try to interact with it
        await displayNameField.first().click();
        await displayNameField.first().fill('test');
        
        const fieldValue = await displayNameField.first().inputValue();
        console.log(`Field value after input: "${fieldValue}"`);
        
        await expect(displayNameField.first()).toHaveValue('test');
    });
});