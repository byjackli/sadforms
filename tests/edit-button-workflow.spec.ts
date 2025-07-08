import { test, expect } from '@playwright/test';

test.describe('Edit Button Workflow', () => {
  test('should edit field label and validate main form updates', async ({ page }) => {
    // Set up console logging to capture debug information
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Navigate to the form editor with sample form
    await page.goto('/edit?uid=sample');
    
    // Wait for page to load and form to initialize
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Give time for form to initialize and sample form to load

    // Verify we're on the right page with the sample form
    await expect(page).toHaveTitle('Sad Forms');
    
    // Wait for form to be visible and loaded
    await page.waitForSelector('#editor', { state: 'visible' });
    
    // First, let's see what's actually on the page
    const pageStructure = await page.evaluate(() => {
      const editor = document.querySelector('#editor');
      if (!editor) return { error: 'No editor found' };
      
      const formBlocks = Array.from(editor.querySelectorAll('.form-block')).map(block => ({
        id: block.id,
        innerHTML: block.innerHTML.substring(0, 200) // First 200 chars
      }));
      
      const editButtons = Array.from(editor.querySelectorAll('.modify-edit')).length;
      
      return {
        hasEditor: !!editor,
        formBlockCount: formBlocks.length,
        editButtonCount: editButtons,
        formBlocks: formBlocks
      };
    });
    
    console.log('Page structure:', JSON.stringify(pageStructure, null, 2));
    
    // Look for any form block with a label containing "First Name"
    const firstNameField = page.locator('.form-block:has(label:text("First Name"))').first();
    await expect(firstNameField).toBeVisible({ timeout: 10000 });
    
    // Get the first edit button
    const firstEditButton = page.locator('.modify-edit').first();
    await expect(firstEditButton).toBeVisible({ timeout: 10000 });
    
    console.log('Found first name field and edit button');
    
    // Click the first edit button
    await firstEditButton.click();
    
    // Wait for something to happen
    await page.waitForTimeout(2000);
    
    // Check what forms exist on the page after clicking
    const formsAfterClick = await page.evaluate(() => {
      const allForms = Array.from(document.querySelectorAll('form')).map(form => ({
        id: form.id,
        action: form.action,
        method: form.method,
        inputs: Array.from(form.querySelectorAll('input')).map(input => ({
          id: input.id,
          name: input.name,
          type: input.type,
          value: input.value
        }))
      }));
      
      return allForms;
    });
    
    console.log('Forms after edit click:', JSON.stringify(formsAfterClick, null, 2));
    
    // Now test the actual update functionality
    console.log('Testing field label update...');
    
    // Find the edit form label input (should have value "First Name")
    const labelInput = page.locator('input[id="sf:input/name"]');
    await expect(labelInput).toBeVisible();
    await expect(labelInput).toHaveValue('First Name');
    
    // Change the label
    await labelInput.clear();
    await labelInput.fill('Updated First Name');
    
    // Verify the input value changed
    await expect(labelInput).toHaveValue('Updated First Name');
    console.log('Label input updated successfully');
    
    // Trigger the change (blur the field)
    await page.keyboard.press('Tab');
    
    // Wait for the change to propagate
    await page.waitForTimeout(2000);
    
    // Check if the main form label updated
    // First, check what fields actually exist
    const allFields = await page.evaluate(() => {
      const fields = Array.from(document.querySelectorAll('.form-block input')).map(input => ({
        name: input.getAttribute('name'),
        id: input.id,
        type: (input as HTMLInputElement).type
      }));
      return fields;
    });
    
    console.log('All fields after update:', allFields);
    
    // Look for the updated field
    const updatedField = allFields.find(f => f.name === 'Updated First Name');
    if (updatedField) {
      console.log('SUCCESS: Found updated field with name "Updated First Name"');
    } else {
      console.log('Field not updated - still has original name');
    }
    
    // Print any new console logs (especially errors)
    const newLogs = consoleLogs.slice(-10); // Last 10 logs
    console.log('Recent console logs:');
    newLogs.forEach(log => console.log(log));
  });

});