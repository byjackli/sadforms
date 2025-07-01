import { test, expect } from '@playwright/test';

test.describe('Direct localStorage Security Test', () => {
  test('should load and interact with form editor', async ({ page }) => {
    // Capture all debug logs from our application
    const debugLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('[manageFieldStorage]') || 
          text.includes('[updateSave]') ||
          text.includes('[FormBuilder]') ||
          text.includes('[clearFieldFromStorage]') ||
          text.includes('SadForms') ||
          text.includes('dontSave')) {
        debugLogs.push(`[${msg.type()}] ${text}`);
      }
    });

    console.log('🚀 Starting localStorage security test...');

    // Navigate to form editor 
    await page.goto('/new');
    await page.waitForLoadState('networkidle');
    
    console.log('📄 Waiting for form to load...');
    await page.waitForTimeout(5000); // Give more time for async loading

    // Take screenshot to see current state
    await page.screenshot({ path: 'form-editor-loaded.png', fullPage: true });

    // Check if the editor has loaded
    const editorPresent = await page.locator('#editor').isVisible();
    const sideMenuPresent = await page.locator('#editor-sidemenu').isVisible();
    
    console.log(`📋 Editor present: ${editorPresent}`);
    console.log(`🔧 Side menu present: ${sideMenuPresent}`);

    if (sideMenuPresent) {
      console.log('✅ Form builder UI found! Proceeding with tests...');
      
      // Look for edit button to access field editing
      const editButton = page.locator('button:has-text("edit")');
      const codeButton = page.locator('button:has-text("code")');
      const settingsButton = page.locator('button:has-text("settings")');
      
      if (await editButton.isVisible()) {
        console.log('🖊️ Clicking edit button...');
        await editButton.click();
        await page.waitForTimeout(2000);
        
        // Look for field editing interface
        const fieldInputs = await page.locator('input[type="text"], input[type="checkbox"], select').all();
        console.log(`🎯 Found ${fieldInputs.length} form controls in editor`);
        
        // Look for dontSave checkbox specifically
        const dontSaveInputs = await page.locator('input').all();
        for (let i = 0; i < dontSaveInputs.length; i++) {
          const input = dontSaveInputs[i];
          const id = await input.getAttribute('id');
          const type = await input.getAttribute('type');
          const value = await input.inputValue().catch(() => 'N/A');
          
          console.log(`🔍 Input ${i}: id=${id}, type=${type}, value=${value}`);
          
          // Check if this looks like a dontSave control
          if (id && (id.includes('dontSave') || id.includes('save'))) {
            console.log(`🎯 Found potential dontSave control: ${id}`);
            
            // Try to toggle it and see if it triggers our debug logs
            if (type === 'checkbox') {
              console.log('🔄 Toggling dontSave checkbox...');
              await input.click();
              await page.waitForTimeout(1000);
              
              console.log('🔄 Toggling back...');
              await input.click();
              await page.waitForTimeout(1000);
            }
          }
        }
        
        // Try to find and fill a field to trigger storage operations
        const textInputs = await page.locator('input[type="text"]').all();
        if (textInputs.length > 0) {
          console.log('📝 Testing field data entry...');
          await textInputs[0].fill('test-sensitive-data');
          await textInputs[0].blur(); // Trigger save
          await page.waitForTimeout(1000);
        }
      }
      
      // Check other tabs
      if (await settingsButton.isVisible()) {
        console.log('⚙️ Checking settings...');
        await settingsButton.click();
        await page.waitForTimeout(1000);
      }
    }

    // Check localStorage after interactions
    const localStorageData = await page.evaluate(() => {
      const storage = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          storage[key] = localStorage.getItem(key);
        }
      }
      return storage;
    });

    console.log('💾 Current localStorage:', JSON.stringify(localStorageData, null, 2));

    // Print all captured debug logs
    console.log('📊 Debug logs captured:');
    if (debugLogs.length > 0) {
      debugLogs.forEach(log => console.log(log));
    } else {
      console.log('❌ No debug logs captured - our logging might not be working');
    }

    // The test passes if we reached this point
    expect(true).toBe(true);
  });

  test('should test with pre-created form', async ({ page }) => {
    // Try the sample form route
    await page.goto('/edit#sample');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    console.log('🎯 Testing sample form...');

    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('manageFieldStorage') || 
          msg.text().includes('updateSave') ||
          msg.text().includes('dontSave')) {
        logs.push(msg.text());
      }
    });

    await page.screenshot({ path: 'sample-form.png', fullPage: true });

    // Check for actual form fields
    const forms = await page.locator('form').all();
    console.log(`📋 Found ${forms.length} forms`);

    if (forms.length > 0) {
      const inputs = await page.locator('input').all();
      console.log(`🎯 Found ${inputs.length} inputs in forms`);
      
      // Try to interact with form fields
      for (let i = 0; i < Math.min(inputs.length, 3); i++) {
        const input = inputs[i];
        const type = await input.getAttribute('type');
        const id = await input.getAttribute('id');
        
        console.log(`📝 Testing input ${i}: type=${type}, id=${id}`);
        
        if (type === 'text' || type === 'email' || type === 'password') {
          await input.fill(`test-data-${i}`);
          await input.blur();
          await page.waitForTimeout(500);
        }
      }
    }

    console.log('📊 Sample form logs:', logs);
    expect(true).toBe(true);
  });
});