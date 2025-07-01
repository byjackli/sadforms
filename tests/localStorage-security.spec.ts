import { test, expect } from '@playwright/test';

test.describe('localStorage Security Tests', () => {
  test('should not save dontSave fields to localStorage', async ({ page }) => {
    // Navigate to the form editor/builder
    await page.goto('/new');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Give time for form to initialize
    
    // Listen to console logs to capture our debugging output
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log' && (
        msg.text().includes('[manageFieldStorage]') ||
        msg.text().includes('[updateSave]') ||
        msg.text().includes('[FormBuilder]') ||
        msg.text().includes('[clearFieldFromStorage]')
      )) {
        consoleLogs.push(msg.text());
      }
    });
    
    // Create a test form with sensitive and non-sensitive fields
    await page.evaluate(() => {
      // This should create a form through the normal flow
      // We'll need to check how forms are created in your app
      console.log('Setting up test form...');
    });
    
    // Check if there are any forms or form builders on the page
    const formBuilder = await page.locator('[data-testid="form-builder"]').first();
    const forms = await page.locator('form').first();
    
    if (await formBuilder.isVisible()) {
      console.log('Found form builder');
      
      // Create a form with sensitive fields through the builder
      // This will depend on your UI structure
      
    } else if (await forms.isVisible()) {
      console.log('Found existing form');
      
      // Test with existing form structure
      // Look for password or sensitive input fields
      const passwordInput = await page.locator('input[type="password"]').first();
      
      if (await passwordInput.isVisible()) {
        // Enter sensitive data
        await passwordInput.fill('secret123');
        
        // Trigger any save operations
        await page.keyboard.press('Tab'); // Blur the field
        await page.waitForTimeout(100); // Allow async operations
        
        // Check localStorage
        const localStorageData = await page.evaluate(() => {
          const results = {};
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('[SadForms]')) {
              results[key] = localStorage.getItem(key);
            }
          }
          return results;
        });
        
        console.log('localStorage data:', localStorageData);
        console.log('Console logs:', consoleLogs);
        
        // Check that sensitive data is not in localStorage
        const localStorageValues = Object.values(localStorageData).join('');
        expect(localStorageValues).not.toContain('secret123');
        
      } else {
        console.log('No password field found, checking for other inputs');
        
        // Look for any inputs and their configuration
        const inputs = await page.locator('input').all();
        for (const input of inputs) {
          const type = await input.getAttribute('type');
          const id = await input.getAttribute('id');
          console.log(`Found input: type=${type}, id=${id}`);
        }
      }
    }
    
    // Print debugging information
    console.log('All console logs captured:');
    consoleLogs.forEach(log => console.log(log));
    
    // Print current localStorage state
    const finalLocalStorage = await page.evaluate(() => {
      const results = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          results[key] = localStorage.getItem(key);
        }
      }
      return results;
    });
    
    console.log('Final localStorage state:', JSON.stringify(finalLocalStorage, null, 2));
  });
  
  test('should capture routing decisions in manageFieldStorage', async ({ page }) => {
    // Navigate to form editor
    await page.goto('/new');
    await page.waitForLoadState('networkidle');
    
    // Capture all console logs for detailed analysis
    const allLogs: { type: string, text: string }[] = [];
    page.on('console', msg => {
      allLogs.push({ type: msg.type(), text: msg.text() });
    });
    
    // Wait for any form to be available
    await page.waitForTimeout(2000);
    
    // Check what's on the page
    const pageContent = await page.evaluate(() => {
      return {
        forms: document.querySelectorAll('form').length,
        inputs: document.querySelectorAll('input').length,
        title: document.title,
        url: window.location.href
      };
    });
    
    console.log('Page content:', pageContent);
    
    // Print all logs for analysis
    console.log('All captured logs:');
    allLogs.forEach(log => {
      if (log.type === 'log' || log.type === 'warn' || log.type === 'error') {
        console.log(`[${log.type}] ${log.text}`);
      }
    });
  });
});