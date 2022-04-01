import { test, expect } from '@playwright/test';


/* TEST LEVEL1 ROUTING
  ? main component updates according to current page
  ? title updates according current page 
*/
test.describe("routing", () => {

  // Routing to Homepage
  test("home page exists", async ({ page }) => {
    await Promise.all([
      page.goto('/'),
      page.waitForNavigation({ url: '/' }),
      expect(page.locator("main"), "should be home page").toHaveId("home"),
      expect(page, "missing title").toHaveTitle("Sad Forms"),
    ]);
  })

  // Routing to new form
  test("new form page exists", async ({ page }) => {
    await Promise.all([
      page.goto('/new'),
      page.waitForNavigation({ url: '/new' }),
      expect(page.locator("main"), "should be new page with editor id").toHaveId("editor"),
      expect(page, "missing title").toHaveTitle(/(✍ )+[\W\S]+( - Sad Forms)/)
    ]);
  })

  // Routing to edit (sample) form 
  test("edit form page exists", async ({ page }) => {
    await Promise.all([
      page.goto('/edit#sample%7C'),
      page.waitForNavigation({ url: '/edit#sample%7C' }),
      expect(page.locator("main"), "should be editor page").toHaveId("editor"),
      expect(page, "missing title").toHaveTitle(/(✏ )+[\W\S]+( - Sad Forms)/)
    ]);
  })

  // Routing to preview (sample) form 
  test("preview form page exists", async ({ page }) => {
    await Promise.all([
      page.goto('/preview#sample%7C'),
      page.waitForNavigation({ url: '/preview#sample%7C' }),
      expect(page.locator("main"), "should be preview page").toHaveId("preview"),
      expect(page, "missing title").toHaveTitle(/(👁 )+[\W\S]+( - Sad Forms)/)
    ]);
  })

  // Routing to Donate
  test("donate exists", async ({ page }) => {
    await Promise.all([
      page.goto('/donate'),
      page.waitForNavigation({ url: '/donate' }),
      expect(page.locator("main"), "should be donate page").toHaveId("donate"),
      expect(page, "missing title").toHaveTitle("❤ Donate - Sad Forms")
    ]);
  })

  // Routing to Feedback
  test("feedback exists", async ({ page }) => {
    await Promise.all([
      page.goto('/feedback'),
      page.waitForNavigation({ url: '/feedback' }),
      expect(page.locator("main"), "should be feedback page").toHaveId("feedback"),
      expect(page, "missing title").toHaveTitle("💬 Feedback - Sad Forms")
    ]);
  })


  // Routing to Documentation
  test("docs exists", async ({ page }) => {
    await Promise.all([
      page.goto('/docs'),
      page.waitForNavigation({ url: '/docs' }),
      expect(page.locator("main"), "should be docs page").toHaveId("docs"),
      expect(page, "missing title").toHaveTitle("📃 Docs - Sad Forms")
    ]);
  })


  // Routing to Random page (does not exist)
  test("random page does not exist", async ({ page }) => {
    await Promise.all([
      page.goto('/this-page-does-not-exist-404'),
      page.waitForNavigation({ url: '/this-page-does-not-exist-404' }),
      expect(page, "missing title").toHaveTitle("Sad Forms")
    ]);
  })
})


/* TEST NESTED ROUTING IN DOCS
  ? main component updates according to subpage
  ? title contains name of current subpage
*/
test.describe("docs routing", () => {

})


/* TEST SECTION UPDATES IN DOCS
  ? current section is visible
  ? title contains name of current section
*/
test.describe("docs section", () => {

})