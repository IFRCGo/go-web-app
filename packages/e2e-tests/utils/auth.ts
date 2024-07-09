import { type Page, expect } from '@playwright/test';
export async function login(page: Page, username: string, password: string) {
    await page.goto('/login');

    //FIXME: page.fill is discouraged. We should use locator based fill.
    // @ifrc/go-ui should be updated to support locators
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);

    await page.getByRole('button', { name: 'Login' }).click();
    // Wait until the page receives the cookies.
    // Sometimes login flow sets cookies in the process of several redirects.
    // Wait for the final URL to ensure that the cookies are actually set.
    await page.waitForURL('/');
    // Alternatively, you can wait until the page reaches a state where all cookies are set.
    await expect(page.getByRole('button', { name: 'Create a Report' })).toBeVisible();
}
