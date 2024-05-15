import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/IFRC GO/);
});

test('surge catalogue overview title', async ({ page }) => {
    await page.goto('/surge/catalogue/overview');
    // Expects page to have a heading with the name of Surge.
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Surge');
});
