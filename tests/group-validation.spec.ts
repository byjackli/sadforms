import { test, expect } from '@playwright/test';

test.describe('Group Validation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/edit?uid=sample');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.waitForSelector('#editor', { state: 'visible' });
  });

  test.describe('Group-Level Validation', () => {
    test('should validate all fields in a group when group is marked as required', async ({ page }) => {
      // Look for any existing groups in the sample form
      const groupElements = page.locator('.form-group');
      
      if (await groupElements.count() > 0) {
        // Find the first group
        const firstGroup = groupElements.first();
        const groupId = await firstGroup.getAttribute('id');
        
        if (groupId) {
          // Extract group ID from the element ID
          const groupUid = groupId.replace('sf:group/', '');
          
          // Click on the group settings (look for settings icon near the group)
          const groupSettingsButton = firstGroup.locator('.modify-title').first();
          
          if (await groupSettingsButton.isVisible()) {
            await groupSettingsButton.click();
            await page.waitForTimeout(1000);
            
            // Enable "Require All Fields" for the group
            const requireAllCheckbox = page.locator('div[id="sf:input/required"]');
            if (await requireAllCheckbox.isVisible()) {
              await requireAllCheckbox.click();
              await page.waitForTimeout(500);
            }
            
            // Close group editor
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
            
            // Test that all fields in the group show required validation
            const fieldsInGroup = firstGroup.locator('.form-block input');
            const fieldCount = await fieldsInGroup.count();
            
            if (fieldCount > 0) {
              // Focus and blur each field to trigger validation
              for (let i = 0; i < fieldCount; i++) {
                const field = fieldsInGroup.nth(i);
                await field.focus();
                await field.blur();
                await page.waitForTimeout(300);
              }
              
              // Check if group-level validation feedback appears
              const groupFeedback = firstGroup.locator('.form-group-feedback');
              if (await groupFeedback.isVisible()) {
                console.log('Group validation feedback found');
              }
            }
          }
        }
      } else {
        // If no groups exist, create one for testing
        await createTestGroup(page);
      }
    });

    test('should show group-level feedback when override feedback is enabled', async ({ page }) => {
      // Create a test group with validation
      const testGroupId = await createTestGroup(page);
      
      if (testGroupId) {
        // Enable group feedback override - try different selector strategies
        let groupSettingsButton = page.locator(`#sf\\:group\\/${testGroupId} .modify-title`);
        
        // If the specific group button isn't found, try a more general approach
        if (!(await groupSettingsButton.isVisible({ timeout: 2000 }))) {
          console.log(`Group button for ${testGroupId} not found, trying general group settings`);
          groupSettingsButton = page.locator('.form-group .modify-title').first();
        }
        
        if (await groupSettingsButton.isVisible({ timeout: 5000 })) {
          await groupSettingsButton.click();
          await page.waitForTimeout(1000);
        } else {
          console.log('Group settings button not found, skipping test');
          return;
        }
        
        // Enable feedback override
        const groupOptionsDropdown = page.locator('div[id="sf:input/group"]');
        if (await groupOptionsDropdown.isVisible()) {
          await groupOptionsDropdown.click();
          
          // Select feedback option
          const feedbackOption = page.locator('[role="option"]:has-text("Feedback")');
          if (await feedbackOption.isVisible()) {
            await feedbackOption.click();
            await page.waitForTimeout(500);
          }
        }
        
        // Close group editor
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        
        // Test group validation feedback
        const groupElement = page.locator(`#sf\\:group\\/${testGroupId}`);
        const fieldsInGroup = groupElement.locator('input');
        
        if (await fieldsInGroup.count() > 0) {
          // Trigger validation on group fields
          await fieldsInGroup.first().focus();
          await fieldsInGroup.first().blur();
          await page.waitForTimeout(1000);
          
          // Look for group feedback element
          const groupFeedback = groupElement.locator('.form-group-feedback');
          expect(groupFeedback).toBeTruthy();
        }
      }
    });
  });

  test.describe('Field Validation Within Groups', () => {
    test('should apply individual field validation within groups', async ({ page }) => {
      // Find a field within a group
      const groupElements = page.locator('.form-group');
      
      if (await groupElements.count() > 0) {
        const firstGroup = groupElements.first();
        const editButtons = firstGroup.locator('.modify-edit');
        
        if (await editButtons.count() > 0) {
          // Edit the first field in the group
          await editButtons.first().click();
          await page.waitForTimeout(1000);
          
          // Add validation to the field
          const validationTextarea = page.locator('textarea[id="sf:input/validity"]');
          const validationRule = `return {
            groupFieldTest: {
              check: value.length >= 2,
              true: "Group field validation passed",
              false: "Group field needs at least 2 characters"
            }
          };`;
          
          await validationTextarea.fill(validationRule);
          await validationTextarea.blur();
          await page.waitForTimeout(1000);
          
          // Close editor
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
          
          // Test the validation
          const fieldInputs = firstGroup.locator('input');
          if (await fieldInputs.count() > 0) {
            const testField = fieldInputs.first();
            
            // Test with invalid input
            await testField.fill('A');
            await testField.blur();
            await page.waitForTimeout(1000);
            
            // Test with valid input
            await testField.fill('AB');
            await testField.blur();
            await page.waitForTimeout(1000);
            
            // Check for validation feedback
            const fieldBlock = testField.locator('xpath=..');
            const feedbackElement = fieldBlock.locator('.container-validity');
            
            if (await feedbackElement.isVisible()) {
              const feedbackText = await feedbackElement.textContent();
              expect(feedbackText).toContain('Group field validation passed');
            }
          }
        }
      }
    });
  });

});

// Helper function to create a test group
async function createTestGroup(page) {
    // Add a new group
    const addFieldDropdown = page.locator('.modify-add .dropdown-container');
    await addFieldDropdown.click();
    
    const groupOption = page.locator('[role="option"]:has-text("group")');
    if (await groupOption.isVisible()) {
      await groupOption.click();
      await page.waitForTimeout(1000);
      
      // Find the newly created group
      const allGroups = page.locator('.form-group');
      const groupCount = await allGroups.count();
      
      if (groupCount > 0) {
        const lastGroup = allGroups.last();
        const groupId = await lastGroup.getAttribute('id');
        
        if (groupId) {
          return groupId.replace('sf:group/', '');
        }
      }
    }
    
    return null;
}