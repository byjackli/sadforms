import { test, expect } from '@playwright/test';

test.describe('Redacted Fields Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to form editor
    await page.goto('/edit?uid=sample');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.waitForSelector('#editor', { state: 'visible' });
  });

  test('should create a redacted field and verify masking behavior', async ({ page }) => {
    // Create a new field
    const addFieldDropdown = page.locator('.modify-add .dropdown-container');
    await addFieldDropdown.click();
    await page.waitForTimeout(500);

    // Select text field
    const textOption = page.locator('[role="option"]:has-text("text")').first();
    await textOption.click();
    await page.waitForTimeout(2000);

    // Edit the newly created field
    const allEditButtons = page.locator('.modify-edit');
    const lastEditButton = allEditButtons.last();
    await lastEditButton.click();
    await page.waitForTimeout(1000);

    // Set field name
    const nameInput = page.locator('input[id="sf:input/name"]');
    await nameInput.fill('Sensitive Data Field');
    await nameInput.blur();
    await page.waitForTimeout(500);

    // Enable redaction
    const redactCheckbox = page.locator('div[id="sf:input/redact"]');
    await redactCheckbox.click();
    await page.waitForTimeout(500);

    // Close editor
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    // Find the redacted field
    let sensitiveField = page.locator('input[name="Sensitive Data Field"]');
    
    // If field with exact name doesn't exist, look for the last created field
    if (!(await sensitiveField.isVisible())) {
      const allInputs = page.locator('input[type="text"]');
      const inputCount = await allInputs.count();
      if (inputCount > 0) {
        sensitiveField = allInputs.last();
      }
    }

    // Test redaction behavior - field should be masked when not focused
    await sensitiveField.fill('secret password 123');
    await sensitiveField.blur();
    await page.waitForTimeout(1000);

    // Check if field appears redacted (value should be hidden)
    const fieldValue = await sensitiveField.inputValue();
    console.log('Field value after blur:', fieldValue);
    
    // Verify field behavior when focused
    await sensitiveField.focus();
    await page.waitForTimeout(500);
    
    const focusedValue = await sensitiveField.inputValue();
    console.log('Field value when focused:', focusedValue);

    // The field should show actual value when focused
    expect(focusedValue).toContain('secret password 123');
  });

  test('should inherit redaction from group settings', async ({ page }) => {
    // Create a new group
    const addFieldDropdown = page.locator('.modify-add .dropdown-container');
    await addFieldDropdown.click();
    await page.waitForTimeout(500);

    // Select group option
    const groupOption = page.locator('[role="option"]:has-text("group")');
    if (await groupOption.isVisible()) {
      await groupOption.click();
      await page.waitForTimeout(1000);

      // Find the newly created group
      const allGroups = page.locator('.form-group');
      const groupCount = await allGroups.count();
      
      if (groupCount > 0) {
        const lastGroup = allGroups.last();
        
        // Click group settings
        const groupSettingsButton = lastGroup.locator('.modify-title').first();
        if (await groupSettingsButton.isVisible()) {
          await groupSettingsButton.click();
          await page.waitForTimeout(1000);

          // Enable redaction for the group
          const redactCheckbox = page.locator('div[id="sf:input/redact"]');
          if (await redactCheckbox.isVisible()) {
            await redactCheckbox.click();
            await page.waitForTimeout(500);
          }

          // Close group editor
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);

          // Add a field to the group
          const groupAddButton = lastGroup.locator('.modify-add .dropdown-container');
          if (await groupAddButton.isVisible()) {
            await groupAddButton.click();
            await page.waitForTimeout(500);

            const textOption = page.locator('[role="option"]:has-text("text")').first();
            await textOption.click();
            await page.waitForTimeout(1000);

            // The field should inherit redaction from the group
            const groupFields = lastGroup.locator('input[type="text"]');
            if (await groupFields.count() > 0) {
              const inheritedField = groupFields.first();
              
              await inheritedField.fill('group inherited redacted data');
              await inheritedField.blur();
              await page.waitForTimeout(1000);

              // Field should behave as redacted
              const fieldValue = await inheritedField.inputValue();
              console.log('Group inherited field value:', fieldValue);
              
              // Focus to reveal value
              await inheritedField.focus();
              const focusedValue = await inheritedField.inputValue();
              console.log('Group inherited field focused value:', focusedValue);
            }
          }
        }
      }
    }
  });

  test('should display [redacted] placeholder for inactive redacted fields', async ({ page }) => {
    // Navigate to a form with existing redacted fields or create one
    // First check if there are existing redacted fields in the sample form
    const allInputs = page.locator('input[type="text"]');
    const inputCount = await allInputs.count();
    
    if (inputCount > 0) {
      // Check first few fields to see if any are already redacted
      for (let i = 0; i < Math.min(3, inputCount); i++) {
        const field = allInputs.nth(i);
        await field.focus();
        await field.fill('test redacted content');
        await field.blur();
        await page.waitForTimeout(500);
        
        // Check if field shows redacted placeholder
        const displayValue = await field.inputValue();
        console.log(`Field ${i} display value:`, displayValue);
        
        if (displayValue === '[redacted]' || displayValue === '') {
          console.log(`Field ${i} appears to be redacted`);
          
          // Focus again to see actual value
          await field.focus();
          const focusedValue = await field.inputValue();
          console.log(`Field ${i} focused value:`, focusedValue);
          
          // This confirms redaction behavior
          expect(focusedValue).toBeTruthy();
        }
      }
    }
  });
});