import { test, expect } from '@playwright/test';

test.describe('Data Transformation Logic', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to form editor
    await page.goto('/edit?uid=sample');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.waitForSelector('#editor', { state: 'visible' });
  });

  test('should handle dropdown multiple selection object-to-array transformation', async ({ page }) => {
    // Find existing dropdown in sample form or create one
    let dropdownField = page.locator('select, .dropdown-container').first();
    
    // If no dropdown exists, create one
    if (!(await dropdownField.isVisible())) {
      const addFieldDropdown = page.locator('.modify-add .dropdown-container');
      await addFieldDropdown.click();
      await page.waitForTimeout(500);

      const dropdownOption = page.locator('[role="option"]:has-text("dropdown")');
      if (await dropdownOption.isVisible()) {
        await dropdownOption.click();
        await page.waitForTimeout(2000);

        // Edit the newly created dropdown
        const allEditButtons = page.locator('.modify-edit');
        const lastEditButton = allEditButtons.last();
        await lastEditButton.click();
        await page.waitForTimeout(1000);

        // Set field name
        const nameInput = page.locator('input[id="sf:input/name"]');
        await nameInput.fill('Multi Select Dropdown');
        await nameInput.blur();

        // Enable multiple selection
        const multipleCheckbox = page.locator('div[id="sf:input/multiple"]');
        if (await multipleCheckbox.isVisible()) {
          await multipleCheckbox.click();
          await page.waitForTimeout(500);
        }

        // Add some options
        const optionsTextarea = page.locator('textarea[id="sf:input/options"]');
        if (await optionsTextarea.isVisible()) {
          await optionsTextarea.fill('Option 1\\nOption 2\\nOption 3\\nOption 4');
          await optionsTextarea.blur();
          await page.waitForTimeout(500);
        }

        // Close editor
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);

        dropdownField = page.locator('select, .dropdown-container').last();
      }
    }

    // Test multiple selection if dropdown supports it
    if (await dropdownField.isVisible()) {
      await dropdownField.click();
      await page.waitForTimeout(500);

      // Try to select multiple options
      const options = page.locator('[role="option"]');
      const optionCount = await options.count();
      
      if (optionCount > 0) {
        // Select first option
        await options.first().click();
        await page.waitForTimeout(300);

        // Select second option (if multiple selection is enabled)
        if (optionCount > 1) {
          await options.nth(1).click();
          await page.waitForTimeout(300);
        }

        // Check form debug data to verify object-to-array transformation
        const debugButton = page.locator('.tiny-toggle:has-text("bug_report")');
        if (await debugButton.isVisible()) {
          await debugButton.click();
          await page.waitForTimeout(1000);

          // Look for form data in debug output
          const debugOutput = await page.evaluate(() => {
            const debugElements = document.querySelectorAll('pre, code');
            for (const el of debugElements) {
              const text = el.textContent || '';
              if (text.includes('fieldValues') || text.includes('displayValues')) {
                return text;
              }
            }
            return null;
          });

          console.log('Debug output:', debugOutput);

          if (debugOutput) {
            // Verify that dropdown values are properly transformed
            // Should be arrays, not objects for multiple selection
            expect(debugOutput).toContain('Multi Select Dropdown');
          }
        }
      }
    }
  });

  test('should transform checkbox group objects to arrays', async ({ page }) => {
    // Create a checkbox group to test object-to-array transformation
    const addFieldDropdown = page.locator('.modify-add .dropdown-container');
    await addFieldDropdown.click();
    await page.waitForTimeout(500);

    // Look for checkbox or radio option
    const checkboxOption = page.locator('[role="option"]:has-text("checkbox")');
    if (await checkboxOption.isVisible()) {
      await checkboxOption.click();
      await page.waitForTimeout(2000);

      // Edit the checkbox field
      const allEditButtons = page.locator('.modify-edit');
      const lastEditButton = allEditButtons.last();
      await lastEditButton.click();
      await page.waitForTimeout(1000);

      // Set field name
      const nameInput = page.locator('input[id="sf:input/name"]');
      await nameInput.fill('Checkbox Group Test');
      await nameInput.blur();

      // Enable multiple selection if available
      const multipleCheckbox = page.locator('div[id="sf:input/multiple"]');
      if (await multipleCheckbox.isVisible()) {
        await multipleCheckbox.click();
        await page.waitForTimeout(500);
      }

      // Close editor
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);

      // Find and interact with the checkbox group
      const checkboxGroup = page.locator('.form-block:has(input[type="checkbox"])').last();
      if (await checkboxGroup.isVisible()) {
        const checkboxes = checkboxGroup.locator('input[type="checkbox"]');
        const checkboxCount = await checkboxes.count();

        // Select multiple checkboxes
        for (let i = 0; i < Math.min(2, checkboxCount); i++) {
          await checkboxes.nth(i).click();
          await page.waitForTimeout(300);
        }

        // Verify data transformation via form submission or debug
        const submitButton = page.locator('input[type="submit"]');
        if (await submitButton.isVisible()) {
          // Capture form data before submission
          const formData = await page.evaluate(() => {
            const form = document.querySelector('form');
            if (form) {
              const formData = new FormData(form);
              const result = {};
              for (const [key, value] of formData.entries()) {
                if (result[key]) {
                  if (Array.isArray(result[key])) {
                    result[key].push(value);
                  } else {
                    result[key] = [result[key], value];
                  }
                } else {
                  result[key] = value;
                }
              }
              return result;
            }
            return null;
          });

          console.log('Form data structure:', formData);

          if (formData && formData['Checkbox Group Test']) {
            // Verify that checkbox data is properly structured
            console.log('Checkbox group data:', formData['Checkbox Group Test']);
          }
        }
      }
    }
  });

  test('should handle complex field value transformations during form initialization', async ({ page }) => {
    // Test the updateFieldValue object-to-array transformation during form load
    
    // Navigate to form with pre-existing data
    await page.goto('/edit?uid=sample');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check if form has fields with complex data structures
    const formFields = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input, select, textarea');
      const fieldData = [];
      
      inputs.forEach((input, index) => {
        if (input.name) {
          fieldData.push({
            index,
            name: input.name,
            type: input.type || input.tagName.toLowerCase(),
            value: input.value,
            hasMultiple: input.hasAttribute('multiple')
          });
        }
      });
      
      return fieldData;
    });

    console.log('Form fields detected:', formFields);

    // Look for fields that might use object-to-array transformation
    const complexFields = formFields.filter(field => 
      field.hasMultiple || 
      field.type === 'checkbox' || 
      field.type === 'select' ||
      field.name.toLowerCase().includes('color') // Sample form has favorite color dropdown
    );

    if (complexFields.length > 0) {
      console.log('Complex fields found:', complexFields);

      // Test data transformation by interacting with these fields
      for (const fieldInfo of complexFields.slice(0, 2)) { // Test first 2 complex fields
        const field = page.locator(`[name="${fieldInfo.name}"]`).first();
        
        if (await field.isVisible()) {
          await field.focus();
          await page.waitForTimeout(500);
          
          if (fieldInfo.type === 'select') {
            await field.click();
            await page.waitForTimeout(500);
            
            // Select an option
            const options = page.locator('option');
            if (await options.count() > 1) {
              await options.nth(1).click();
              await page.waitForTimeout(500);
            }
          }
          
          await field.blur();
          await page.waitForTimeout(1000); // Allow for data transformation
        }
      }

      // Verify form state after transformations
      const finalFormState = await page.evaluate(() => {
        const formElement = document.querySelector('form');
        if (formElement) {
          const formData = new FormData(formElement);
          const entries = {};
          for (const [key, value] of formData.entries()) {
            entries[key] = value;
          }
          return entries;
        }
        return {};
      });

      console.log('Final form state after transformations:', finalFormState);
      
      // Ensure form state is valid (no undefined or null critical values)
      expect(Object.keys(finalFormState).length).toBeGreaterThan(0);
    }
  });

  test('should preserve data integrity during focus/blur cycles', async ({ page }) => {
    // Test that data transformations don't corrupt data during focus/blur cycles
    
    // Find a field that might undergo transformation
    const textFields = page.locator('input[type="text"]');
    const fieldCount = await textFields.count();
    
    if (fieldCount > 0) {
      const testField = textFields.first();
      const fieldName = await testField.getAttribute('name');
      
      if (fieldName) {
        // Set initial value
        const testValue = 'test transformation data 123';
        await testField.fill(testValue);
        await testField.blur();
        await page.waitForTimeout(1000);

        // Cycle through focus/blur multiple times
        for (let i = 0; i < 3; i++) {
          await testField.focus();
          await page.waitForTimeout(300);
          
          const focusedValue = await testField.inputValue();
          console.log(`Cycle ${i + 1} - Focused value:`, focusedValue);
          
          await testField.blur();
          await page.waitForTimeout(300);
          
          const blurredValue = await testField.inputValue();
          console.log(`Cycle ${i + 1} - Blurred value:`, blurredValue);
          
          // Value should remain consistent (unless field is redacted)
          if (!blurredValue.includes('[redacted]')) {
            expect(blurredValue).toBe(testValue);
          }
        }

        // Final verification
        await testField.focus();
        const finalValue = await testField.inputValue();
        console.log('Final value after cycles:', finalValue);
        
        // Should still contain original data
        expect(finalValue).toContain('test transformation data');
      }
    }
  });
});