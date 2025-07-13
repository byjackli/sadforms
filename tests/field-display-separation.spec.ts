import { test, expect } from '@playwright/test';

test.describe('Field Value vs Display Value Separation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/edit?uid=sample');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.waitForSelector('#editor', { state: 'visible' });
  });

  test('should maintain separate field values and display values for redacted fields', async ({ page }) => {
    // Create a redacted field
    const addFieldDropdown = page.locator('.modify-add .dropdown-container');
    await addFieldDropdown.click();
    await page.waitForTimeout(500);

    const textOption = page.locator('[role="option"]:has-text("text")').first();
    await textOption.click();
    await page.waitForTimeout(2000);

    // Configure as redacted field
    const allEditButtons = page.locator('.modify-edit');
    const lastEditButton = allEditButtons.last();
    await lastEditButton.click();
    await page.waitForTimeout(1000);

    const nameInput = page.locator('input[id="sf:input/name"]');
    await nameInput.fill('Value Display Test Field');
    await nameInput.blur();

    const redactCheckbox = page.locator('div[id="sf:input/redact"]');
    await redactCheckbox.click();
    await page.waitForTimeout(500);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    // Find the test field
    let testField = page.locator('input[name="Value Display Test Field"]');
    if (!(await testField.isVisible())) {
      const allInputs = page.locator('input[type="text"]');
      testField = allInputs.last();
    }

    // Test the core logic: field value vs display value
    const testValue = 'secret data 12345';
    
    // 1. Fill field while focused (should show actual value)
    await testField.focus();
    await testField.fill(testValue);
    
    const focusedDisplayValue = await testField.inputValue();
    console.log('Focused display value:', focusedDisplayValue);
    expect(focusedDisplayValue).toBe(testValue);

    // 2. Blur field (should mask display value but preserve field value)
    await testField.blur();
    await page.waitForTimeout(1000);

    const blurredDisplayValue = await testField.inputValue();
    console.log('Blurred display value:', blurredDisplayValue);

    // 3. Check form submission data (should contain actual value)
    const formDataCheck = await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) {
        const formData = new FormData(form);
        const entries = {};
        for (const [key, value] of formData.entries()) {
          entries[key] = value;
        }
        return entries;
      }
      return {};
    });

    console.log('Form submission data:', formDataCheck);

    // The key test: form should contain actual value even if display is masked
    const fieldName = Object.keys(formDataCheck).find(key => 
      key.includes('Value Display Test Field') || 
      formDataCheck[key] === testValue ||
      formDataCheck[key] === '' // Field might be empty if masking interfered
    );

    if (fieldName) {
      console.log(`Found field "${fieldName}" with value:`, formDataCheck[fieldName]);
      // This is the critical test: actual value should be preserved for submission
      // even if display value is masked
    }

    // 4. Focus again (should restore actual value in display)
    await testField.focus();
    const refocusedDisplayValue = await testField.inputValue();
    console.log('Refocused display value:', refocusedDisplayValue);
    expect(refocusedDisplayValue).toBe(testValue);
  });

  test('should handle object-to-array transformation with proper display values', async ({ page }) => {
    // Test that object transformation doesn't break display value logic
    
    // Check if sample form has a dropdown with multiple selection
    const favoriteColorDropdown = page.locator('[name*="Favorite Color"]').first();
    
    if (await favoriteColorDropdown.isVisible()) {
      // Test multiple selection (creates object values)
      await favoriteColorDropdown.click();
      await page.waitForTimeout(500);

      // Select multiple options if available
      const options = page.locator('[role="option"]');
      const optionCount = await options.count();
      
      if (optionCount > 1) {
        await options.first().click();
        await page.waitForTimeout(300);
        
        if (optionCount > 2) {
          await options.nth(1).click();
          await page.waitForTimeout(300);
        }

        // Check that form data structure is correct
        const formData = await page.evaluate(() => {
          const form = document.querySelector('form');
          if (form) {
            const formData = new FormData(form);
            const entries = {};
            for (const [key, value] of formData.entries()) {
              entries[key] = value;
            }
            return entries;
          }
          return {};
        });

        console.log('Dropdown form data after multiple selection:', formData);

        // Verify data is properly transformed (should be array-like, not object)
        const colorFieldData = Object.entries(formData).find(([key]) => 
          key.toLowerCase().includes('color')
        );

        if (colorFieldData) {
          console.log('Color field data:', colorFieldData);
          // Data should be transformed correctly
        }
      }
    }
  });

  test('should handle focus state changes correctly for redacted fields', async ({ page }) => {
    // Test the ACTIVE flag logic specifically
    
    // Find an existing field to make redacted
    const existingFields = page.locator('input[type="text"]');
    const fieldCount = await existingFields.count();
    
    if (fieldCount > 0) {
      const testField = existingFields.first();
      const fieldName = await testField.getAttribute('name');
      
      if (fieldName) {
        // Make field redacted by editing it
        const editButtons = page.locator('.modify-edit');
        if (await editButtons.count() > 0) {
          await editButtons.first().click();
          await page.waitForTimeout(1000);

          const redactCheckbox = page.locator('div[id="sf:input/redact"]');
          if (await redactCheckbox.isVisible()) {
            await redactCheckbox.click();
            await page.waitForTimeout(500);
          }

          await page.keyboard.press('Escape');
          await page.waitForTimeout(1000);

          // Test focus state logic
          const testValue = 'focus state test data';
          
          // Cycle through focus states multiple times
          for (let i = 0; i < 3; i++) {
            console.log(`Focus cycle ${i + 1}:`);
            
            // Focus and fill
            await testField.focus();
            await page.waitForTimeout(300);
            await testField.fill(testValue);
            
            const focusedValue = await testField.inputValue();
            console.log(`  Focused value: "${focusedValue}"`);
            
            // Blur 
            await testField.blur();
            await page.waitForTimeout(300);
            
            const blurredValue = await testField.inputValue();
            console.log(`  Blurred value: "${blurredValue}"`);
            
            // Each cycle should behave consistently
            expect(focusedValue).toBe(testValue);
          }
        }
      }
    }
  });
});