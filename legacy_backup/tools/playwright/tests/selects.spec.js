const { test } = require('@playwright/test');

// Update these paths/URLs if your app serves from a different local server / file path.
const pages = [
  { name: 'Home', url: 'file:///' + process.cwd().replace(/\\/g, '/') + '/index.html' },
  { name: 'ToDo', url: 'file:///' + process.cwd().replace(/\\/g, '/') + '/apps/todo/index.html' },
  { name: 'Expense', url: 'file:///' + process.cwd().replace(/\\/g, '/') + '/apps/expense/index.html' }
];

for (const p of pages) {
  test.describe(p.name, () => {
    test(`capture ${p.name} page`, async ({ page }, testInfo) => {
      await page.goto(p.url);
      // wait for animations to settle
      await page.waitForTimeout(500);

      // Focus first select if present to capture open state (most browsers render native dropdowns out-of-process; Playwright will capture closed view)
      const sel = await page.$('select');
      if (sel) {
        await sel.focus();
        await page.waitForTimeout(250);
      }

      await page.screenshot({ path: `screenshots/${p.name.replace(/\s+/g,'_')}-${testInfo.project.name}.png`, fullPage: true });
    });
  });
}