import { test, expect } from '@playwright/test';

test.describe('Debug dontSave localStorage Issue', () => {
  test('should show form builder and debug console logs', async ({ page }) => {
    // Capture all console messages
    const logs: { type: string, text: string, timestamp: number }[] = [];
    page.on('console', msg => {
      logs.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: Date.now()
      });
    });

    // Navigate to form builder
    await page.goto('/new');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Take a screenshot to see what's on the page
    await page.screenshot({ path: 'debug-form-builder.png', fullPage: true });

    // Get page structure
    const pageInfo = await page.evaluate(() => ({
      title: document.title,
      url: location.href,
      forms: document.querySelectorAll('form').length,
      inputs: document.querySelectorAll('input').length,
      textareas: document.querySelectorAll('textarea').length,
      buttons: document.querySelectorAll('button').length,
      divs: document.querySelectorAll('div').length,
      mainContent: document.body.innerText.substring(0, 500),
      hasEditor: !!document.querySelector('#editor'),
      hasSideMenu: !!document.querySelector('#editor-sidemenu'),
      hasFormContainer: !!document.querySelector('.form-container'),
      sadFormsStore: typeof window !== 'undefined' && (window as any).SadForms
    }));

    console.log('=== PAGE INFO ===');
    console.log(JSON.stringify(pageInfo, null, 2));

    // Look for form builder UI elements
    const editorExists = await page.locator('#editor').isVisible().catch(() => false);
    const sideMenuExists = await page.locator('#editor-sidemenu').isVisible().catch(() => false);
    
    console.log('=== UI ELEMENTS ===');
    console.log('Editor visible:', editorExists);
    console.log('Side menu visible:', sideMenuExists);

    if (sideMenuExists) {
      // Try to interact with the form builder
      console.log('=== FORM BUILDER INTERACTION ===');
      
      // Look for field editing capabilities
      const editButton = page.locator('button:has-text("edit")');
      const settingsButton = page.locator('button:has-text("settings")');
      
      if (await editButton.isVisible()) {
        console.log('Found edit button, clicking...');
        await editButton.click();
        await page.waitForTimeout(1000);
      }
      
      if (await settingsButton.isVisible()) {
        console.log('Found settings button, clicking...');
        await settingsButton.click();
        await page.waitForTimeout(1000);
      }

      // Look for form fields or field creation options
      const fieldInputs = await page.locator('input').all();
      console.log(`Found ${fieldInputs.length} inputs`);
      
      for (let i = 0; i < Math.min(fieldInputs.length, 5); i++) {
        const input = fieldInputs[i];
        const type = await input.getAttribute('type');
        const id = await input.getAttribute('id');
        const name = await input.getAttribute('name');
        console.log(`Input ${i}: type=${type}, id=${id}, name=${name}`);
      }
    }

    // Print all console logs from the application
    console.log('=== CONSOLE LOGS ===');
    const relevantLogs = logs.filter(log => 
      log.text.includes('manageFieldStorage') ||
      log.text.includes('updateSave') ||
      log.text.includes('FormBuilder') ||
      log.text.includes('clearFieldFromStorage') ||
      log.text.includes('SadForms') ||
      log.text.includes('[') // Any log with brackets (our debug logs)
    );

    if (relevantLogs.length > 0) {
      relevantLogs.forEach(log => {
        console.log(`[${log.type}] ${log.text}`);
      });
    } else {
      console.log('No relevant logs found. All logs:');
      logs.forEach(log => {
        console.log(`[${log.type}] ${log.text}`);
      });
    }

    // Check localStorage state
    const localStorage = await page.evaluate(() => {
      const storage = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) {
          storage[key] = window.localStorage.getItem(key);
        }
      }
      return storage;
    });

    console.log('=== LOCALSTORAGE ===');
    console.log(JSON.stringify(localStorage, null, 2));

    // The test passes if we can see the interface - this is just for debugging
    expect(pageInfo.title).toBeTruthy();
  });

  test('should test sample form with dontSave fields', async ({ page }) => {
    // Try to load the sample form
    await page.goto('/edit#sample');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('manageFieldStorage') || 
          msg.text().includes('updateSave') ||
          msg.text().includes('dontSave')) {
        logs.push(msg.text());
      }
    });

    // Take screenshot
    await page.screenshot({ path: 'debug-sample-form.png', fullPage: true });

    // Check what's on the page
    const formInfo = await page.evaluate(() => ({
      forms: document.querySelectorAll('form').length,
      inputs: document.querySelectorAll('input').length,
      hasFormFields: !!document.querySelector('.sf'),
      content: document.body.innerText.substring(0, 1000)
    }));

    console.log('=== SAMPLE FORM INFO ===');
    console.log(JSON.stringify(formInfo, null, 2));
    
    console.log('=== SAMPLE FORM LOGS ===');
    logs.forEach(log => console.log(log));

    expect(formInfo).toBeTruthy();
  });
});