import { test, expect } from '@playwright/test';


// Adding fields
test.describe("placeholder", () => {
  test('test', async ({ page }) => {
    await page.goto('/new');

    // Click text=post_add new form

    // Click text=create new field expand_more
    await page.locator('text=create new field expand_more').click();

    // Click text=textarea radio_button_checked
    await page.locator('text=textarea radio_button_checked').click();

    // Click text=textarea expand_more
    await page.locator('text=textarea expand_more').click();

    // Click #optionaddoption1 >> text=text
    await page.locator('#optionaddoption1 >> text=text').click();

    // Click span:has-text("text")
    await page.locator('span:has-text("text")').click();

    // Click text=email
    await page.locator('text=email').click();

    // Click span:has-text("email")
    await page.locator('span:has-text("email")').click();

    // Click text=tel
    await page.locator('text=tel').click();

    // Click span:has-text("tel")
    await page.locator('span:has-text("tel")').click();

    // Click text=password radio_button_unchecked
    await page.locator('text=password radio_button_unchecked').click();

    // Click span:has-text("password")
    await page.locator('span:has-text("password")').click();

    // Click text=number radio_button_unchecked
    await page.locator('text=number radio_button_unchecked').click();

    // Click span:has-text("number")
    await page.locator('span:has-text("number")').click();

    // Click text=dropdown
    await page.locator('text=dropdown').click();

    // Click span:has-text("dropdown")
    await page.locator('span:has-text("dropdown")').click();

    // Click text=checkbox
    await page.locator('text=checkbox').click();

    // Click text=checkbox >> nth=2
    await page.locator('text=checkbox').nth(2).click();

    // Click text=switch radio_button_unchecked
    await page.locator('text=switch radio_button_unchecked').click();

    // Click span:has-text("switch")
    await page.locator('span:has-text("switch")').click();

    // Click text=file
    await page.locator('text=file').click();

    // Click span:has-text("file")
    await page.locator('span:has-text("file")').click();

    // Click text=time
    await page.locator('text=time').click();

    // Click span:has-text("time")
    await page.locator('span:has-text("time")').click();

    // Click text=group
    await page.locator('text=group').click();

    // Click span:has-text("group")
    await page.locator('span:has-text("group")').click();

    // Click text=divider
    await page.locator('text=divider').click();

  });

});