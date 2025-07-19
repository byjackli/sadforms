import { test, expect } from '@playwright/test';

test.describe('Add Field Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/edit?uid=sample');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.waitForSelector('#editor', { state: 'visible' });
  });

  test('should create new fields with correct labels (not "new [object Object]")', async ({ page }) => {
    console.log('Starting add field test...');
    
    // Test adding different field types
    const fieldTypes = ['text', 'textarea', 'email', 'number', 'checkbox'];
    
    for (const fieldType of fieldTypes) {
      console.log(`Testing ${fieldType} field creation...`);
      
      // Find and click the add field dropdown
      const addFieldDropdown = page.locator('.modify-add .dropdown-container');
      await expect(addFieldDropdown).toBeVisible();
      await addFieldDropdown.click();
      await page.waitForTimeout(500);
      
      // Select the field type - use exact match to avoid conflicts
      const fieldOption = page.getByRole('option', { name: fieldType, exact: true });
      await expect(fieldOption).toBeVisible();
      await fieldOption.click();
      await page.waitForTimeout(1500);
      
      // Check that a new field was created with the correct label format
      // The field should have a label like "new text", "new textarea", etc.
      const expectedLabel = `new ${fieldType}`;
      
      // Look for the field label in the form
      const newFieldLabel = page.locator(`label:has-text("${expectedLabel}")`);
      await expect(newFieldLabel).toBeVisible({ timeout: 5000 });
      
      console.log(`✅ ${fieldType} field created with label: "${expectedLabel}"`);
      
      // Verify that we DON'T have the broken "[object Object]" label
      const brokenLabel = page.locator('label:has-text("new [object Object]")');
      await expect(brokenLabel).toHaveCount(0);
      
      // Also check that the field appears in the form preview
      const fieldInForm = page.locator(`input[name="${expectedLabel}"], textarea[name="${expectedLabel}"], select[name="${expectedLabel}"]`);
      if (fieldType !== 'checkbox') {
        await expect(fieldInForm).toBeVisible();
      }
    }
    
    console.log('✅ All field types created successfully with correct labels');
  });

  test('should add text field and verify it can be edited', async ({ page }) => {
    console.log('Testing text field creation and editing...');
    
    // Add a text field
    const addFieldDropdown = page.locator('.modify-add .dropdown-container');
    await addFieldDropdown.click();
    await page.waitForTimeout(500);
    
    const textOption = page.getByRole('option', { name: 'text', exact: true });
    await textOption.click();
    await page.waitForTimeout(1500);
    
    // Verify the field was created with correct label
    const newTextLabel = page.locator('label:has-text("new text")');
    await expect(newTextLabel).toBeVisible();
    
    // Find the edit button for the new field
    const fieldBlock = page.locator('.form-block:has(input[name="new text"])');
    await expect(fieldBlock).toBeVisible();
    
    const editButton = fieldBlock.locator('.modify-edit');
    await expect(editButton).toBeVisible();
    await editButton.click();
    await page.waitForTimeout(1000);
    
    // Verify the edit panel opens with the field configuration
    const labelInput = page.locator('input[id="sf:input/name"]');
    await expect(labelInput).toBeVisible();
    await expect(labelInput).toHaveValue('new text');
    
    // Change the field name
    await labelInput.fill('Custom Text Field');
    await labelInput.blur();
    await page.waitForTimeout(500);
    
    // Close the edit panel
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Verify the field name was updated in the form
    const updatedLabel = page.locator('label:has-text("Custom Text Field")');
    await expect(updatedLabel).toBeVisible();
    
    console.log('✅ Text field created, edited, and updated successfully');
  });

  test('should maintain field functionality after adding multiple fields', async ({ page }) => {
    console.log('Testing multiple field creation...');
    
    const fieldsToAdd = [
      { type: 'text', name: 'new text' },
      { type: 'email', name: 'new email' },
      { type: 'number', name: 'new number' }
    ];
    
    // Add multiple fields
    for (const field of fieldsToAdd) {
      const addFieldDropdown = page.locator('.modify-add .dropdown-container');
      await addFieldDropdown.click();
      await page.waitForTimeout(500);
      
      const fieldOption = page.getByRole('option', { name: field.type, exact: true });
      await fieldOption.click();
      await page.waitForTimeout(1000);
      
      // Verify field was added
      const fieldLabel = page.locator(`label:has-text("${field.name}")`);
      await expect(fieldLabel).toBeVisible();
    }
    
    // Verify all fields are present and functional
    for (const field of fieldsToAdd) {
      const fieldInput = page.locator(`input[name="${field.name}"]`);
      await expect(fieldInput).toBeVisible();
      
      // Test that we can interact with the field (use appropriate value for field type)
      const testValue = field.type === 'number' ? '123' : 'test value';
      await fieldInput.fill(testValue);
      await expect(fieldInput).toHaveValue(testValue);
      
      // Test that edit controls are present
      const fieldBlock = page.locator(`.form-block:has(input[name="${field.name}"])`);
      const editButton = fieldBlock.locator('.modify-edit');
      await expect(editButton).toBeVisible();
    }
    
    console.log('✅ Multiple fields added and all are functional');
  });
});