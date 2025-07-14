import { test, expect } from '@playwright/test';

test.describe('Validation Debug', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/preview#sample');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
    });

    test('should debug validation flow step by step', async ({ page }) => {
        // Enable console logging
        const logs: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'log' || msg.type() === 'error' || msg.type() === 'warn') {
                logs.push(`${msg.type()}: ${msg.text()}`);
            }
        });

        // Find the Display Name field
        const displayNameField = page.locator('input[id="sf:input/374ac078-376a-4b1e-b367-8dd0a4526c9d"]');
        await expect(displayNameField).toBeVisible();

        // Inject debug code to monitor validation events
        await page.evaluate(() => {
            // Access the ValidationEventHandler if it exists
            console.log('=== VALIDATION DEBUG START ===');
            
            // Check if EventBus is available
            const eventBusCheck = window.EventBus || window.sadFormsEventBus;
            console.log('EventBus available:', !!eventBusCheck);
            
            // Check form stores
            const stores = {
                FormFieldStore: window.FormFieldStore,
                FormValidationStore: window.FormValidationStore,
                FormMetaStore: window.FormMetaStore,
                FormConfigStore: window.FormConfigStore
            };
            
            Object.entries(stores).forEach(([name, store]) => {
                console.log(`${name} available:`, !!store);
            });
        });

        // Focus the field - this should emit FIELD_FOCUS event
        console.log('=== FOCUSING FIELD ===');
        await displayNameField.focus();
        await page.waitForTimeout(500);

        // Input text - this should emit FIELD_INPUT event
        console.log('=== INPUTTING TEXT ===');
        await displayNameField.fill('test');
        await page.waitForTimeout(500);

        // Blur the field - this should emit FIELD_BLUR event
        console.log('=== BLURRING FIELD ===');
        await displayNameField.blur();
        await page.waitForTimeout(1000);

        // Check if field is marked as touched
        const fieldBlock = page.locator('[id*="374ac078-376a-4b1e-b367-8dd0a4526c9d"]').first();
        const hasWarnClass = await fieldBlock.getAttribute('class');
        console.log(`Field block classes: "${hasWarnClass}"`);

        // Check feedback container state
        const feedbackContainer = page.locator('[id="sf:input-feedback/374ac078-376a-4b1e-b367-8dd0a4526c9d"]');
        const feedbackClass = await feedbackContainer.getAttribute('class');
        const feedbackContent = await feedbackContainer.textContent();
        console.log(`Feedback container class: "${feedbackClass}"`);
        console.log(`Feedback container content: "${feedbackContent}"`);

        // Check if validation was triggered by inspecting stores
        const validationState = await page.evaluate(() => {
            const formId = 'sample';
            const fieldId = '374ac078-376a-4b1e-b367-8dd0a4526c9d';
            
            return {
                fieldValue: window.FormFieldStore?.[formId]?.displayValues?.[fieldId],
                touchedState: window.FormMetaStore?.[formId]?.touched?.[fieldId],
                validationResult: window.FormValidationStore?.[formId]?.validationResult?.[fieldId],
                requiredConfig: window.FormConfigStore?.[formId]?.required?.[fieldId]
            };
        });
        
        console.log('Store states:', JSON.stringify(validationState, null, 2));

        // Print all collected logs
        console.log('=== BROWSER LOGS ===');
        logs.forEach(log => console.log(log));

        // The test doesn't need to pass/fail - it's for debugging
        expect(displayNameField).toHaveValue('test');
    });
});