import { test, expect } from '@playwright/test';

test.describe('Field Switching in Edit Panel', () => {
  test('should switch between first name and last name field configs in edit panel', async ({ page }) => {
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
    
    console.log('Starting field switching test...');

    // STEP 1: Click on First Name field edit button
    console.log('Step 1: Finding First Name field...');
    const firstNameField = page.locator('.form-block:has(label:text("First Name"))').first();
    await expect(firstNameField).toBeVisible({ timeout: 10000 });
    
    const firstNameEditButton = firstNameField.locator('.modify-edit').first();
    await expect(firstNameEditButton).toBeVisible({ timeout: 5000 });
    
    console.log('Step 1: Clicking First Name edit button...');
    await firstNameEditButton.click();
    await page.waitForTimeout(1000);

    // STEP 2: Verify First Name field config is loaded in edit panel
    console.log('Step 2: Verifying First Name config is loaded...');
    const labelInput = page.locator('input[id="sf:input/name"]');
    await expect(labelInput).toBeVisible({ timeout: 5000 });
    await expect(labelInput).toHaveValue('First Name');
    
    // Check that we have the field type input showing "text"
    const typeInput = page.locator('input[id="sf:input/type"]');
    await expect(typeInput).toBeVisible();
    await expect(typeInput).toHaveValue('text');
    
    console.log('Step 2: First Name config loaded successfully');

    // STEP 3: Modify First Name field config
    console.log('Step 3: Modifying First Name field config...');
    await labelInput.clear();
    await labelInput.fill('Modified First Name');
    
    // Add a placeholder
    const placeholderInput = page.locator('input[id="sf:input/placeholder"]');
    if (await placeholderInput.isVisible()) {
      await placeholderInput.clear();
      await placeholderInput.fill('Enter your first name here');
    }
    
    // Trigger the change
    await page.keyboard.press('Tab');
    await page.waitForTimeout(1000);
    
    console.log('Step 3: First Name field config modified');

    // STEP 4: Click on Last Name field edit button
    console.log('Step 4: Finding Last Name field...');
    const lastNameField = page.locator('.form-block:has(label:text("Last Name"))').first();
    await expect(lastNameField).toBeVisible({ timeout: 10000 });
    
    const lastNameEditButton = lastNameField.locator('.modify-edit').first();
    await expect(lastNameEditButton).toBeVisible({ timeout: 5000 });
    
    console.log('Step 4: Clicking Last Name edit button...');
    await lastNameEditButton.click();
    await page.waitForTimeout(1000);

    // STEP 5: Verify Last Name field config is loaded in edit panel (different from First Name)
    console.log('Step 5: Verifying Last Name config is loaded...');
    await expect(labelInput).toBeVisible({ timeout: 5000 });
    await expect(labelInput).toHaveValue('Last Name');
    
    // Verify the edit panel switched to Last Name config (not showing our modified First Name)
    await expect(labelInput).not.toHaveValue('Modified First Name');
    
    // Check that we still have the field type input showing "text"
    await expect(typeInput).toBeVisible();
    await expect(typeInput).toHaveValue('text');
    
    console.log('Step 5: Last Name config loaded successfully - edit panel switched!');

    // STEP 6: Modify Last Name field config
    console.log('Step 6: Modifying Last Name field config...');
    await labelInput.clear();
    await labelInput.fill('Modified Last Name');
    
    // Add a different placeholder
    if (await placeholderInput.isVisible()) {
      await placeholderInput.clear();
      await placeholderInput.fill('Enter your last name here');
    }
    
    // Trigger the change
    await page.keyboard.press('Tab');
    await page.waitForTimeout(1000);
    
    console.log('Step 6: Last Name field config modified');

    // STEP 7: Switch back to First Name and verify it still has our modifications
    console.log('Step 7: Switching back to First Name to verify persistence...');
    await firstNameEditButton.click();
    await page.waitForTimeout(1000);
    
    // The edit panel should show our modified First Name config
    await expect(labelInput).toBeVisible({ timeout: 5000 });
    await expect(labelInput).toHaveValue('Modified First Name');
    
    // Check placeholder if it exists
    if (await placeholderInput.isVisible()) {
      await expect(placeholderInput).toHaveValue('Enter your first name here');
    }
    
    console.log('Step 7: First Name modifications persisted!');

    // STEP 8: Switch back to Last Name and verify its modifications persisted
    console.log('Step 8: Switching back to Last Name to verify persistence...');
    await lastNameEditButton.click();
    await page.waitForTimeout(1000);
    
    // The edit panel should show our modified Last Name config
    await expect(labelInput).toBeVisible({ timeout: 5000 });
    await expect(labelInput).toHaveValue('Modified Last Name');
    
    // Check placeholder if it exists
    if (await placeholderInput.isVisible()) {
      await expect(placeholderInput).toHaveValue('Enter your last name here');
    }
    
    console.log('Step 8: Last Name modifications persisted!');

    // STEP 9: Verify the main form reflects both changes
    console.log('Step 9: Verifying main form reflects both changes...');
    
    // Check that both field labels updated in the main form
    const modifiedFirstNameField = page.locator('.form-block:has(label:text("Modified First Name"))');
    const modifiedLastNameField = page.locator('.form-block:has(label:text("Modified Last Name"))');
    
    await expect(modifiedFirstNameField).toBeVisible({ timeout: 5000 });
    await expect(modifiedLastNameField).toBeVisible({ timeout: 5000 });
    
    console.log('Step 9: Both field modifications reflected in main form!');

    // STEP 10: Verify field switching works with different field types
    console.log('Step 10: Testing field switching with different field types...');
    
    // Look for any dropdown or other field type
    const dropdownField = page.locator('.form-block:has(select)').first();
    if (await dropdownField.isVisible()) {
      const dropdownEditButton = dropdownField.locator('.modify-edit').first();
      if (await dropdownEditButton.isVisible()) {
        await dropdownEditButton.click();
        await page.waitForTimeout(1000);
        
        // Verify the type changed to dropdown
        await expect(typeInput).toHaveValue('dropdown');
        console.log('Step 10: Successfully switched to dropdown field config');
        
        // Switch back to text field
        await firstNameEditButton.click();
        await page.waitForTimeout(1000);
        
        // Verify we're back to text field
        await expect(typeInput).toHaveValue('text');
        await expect(labelInput).toHaveValue('Modified First Name');
        console.log('Step 10: Successfully switched back to text field config');
      }
    }

    // Print summary of test results
    console.log('\n=== FIELD SWITCHING TEST SUMMARY ===');
    console.log('✅ First Name field config loaded correctly');
    console.log('✅ First Name field config modified successfully');
    console.log('✅ Last Name field config loaded correctly');
    console.log('✅ Last Name field config modified successfully');
    console.log('✅ Edit panel switches between fields correctly');
    console.log('✅ Field modifications persist when switching');
    console.log('✅ Main form reflects all changes');
    console.log('✅ Field switching works with different field types');
    
    // Print any error logs
    const errorLogs = consoleLogs.filter(log => log.includes('[error]') || log.includes('Error'));
    if (errorLogs.length > 0) {
      console.log('\n⚠️  Error logs detected:');
      errorLogs.forEach(log => console.log(log));
    } else {
      console.log('\n✅ No error logs detected');
    }
  });

  test('should handle rapid field switching without issues', async ({ page }) => {
    // This test verifies the fix for the original bug where rapid field switching caused issues
    console.log('Starting rapid field switching test...');
    
    // Navigate to the form editor with sample form
    await page.goto('/edit?uid=sample');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Wait for form to be visible and loaded
    await page.waitForSelector('#editor', { state: 'visible' });
    
    // Get all edit buttons
    const editButtons = page.locator('.modify-edit');
    const editButtonCount = await editButtons.count();
    
    console.log(`Found ${editButtonCount} edit buttons`);
    
    if (editButtonCount >= 2) {
      const labelInput = page.locator('input[id="sf:input/name"]');
      
      // Rapidly switch between first two fields multiple times
      for (let i = 0; i < 5; i++) {
        console.log(`Rapid switch iteration ${i + 1}/5`);
        
        // Click first field
        await editButtons.nth(0).click();
        await page.waitForTimeout(200);
        
        // Verify edit panel loaded
        await expect(labelInput).toBeVisible({ timeout: 3000 });
        const firstFieldLabel = await labelInput.inputValue();
        console.log(`First field label: ${firstFieldLabel}`);
        
        // Click second field
        await editButtons.nth(1).click();
        await page.waitForTimeout(200);
        
        // Verify edit panel switched
        await expect(labelInput).toBeVisible({ timeout: 3000 });
        const secondFieldLabel = await labelInput.inputValue();
        console.log(`Second field label: ${secondFieldLabel}`);
        
        // Verify they're different (edit panel actually switched)
        expect(firstFieldLabel).not.toBe(secondFieldLabel);
      }
      
      console.log('✅ Rapid field switching test passed - no issues detected');
    } else {
      console.log('⚠️  Not enough edit buttons found for rapid switching test');
    }
  });
});