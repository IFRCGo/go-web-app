import { expect, test } from '@playwright/test';
import { login } from '#utils/auth';
test('should login', async ({ page }) => {
    await login(
        page,
        process.env.PLAYWRIGHT_USER_NAME,
        process.env.PLAYWRIGHT_USER_PASSWORD,
    );
    await page.waitForURL('/');
    await expect(
        page.getByRole('button', { name: 'Create a Report' }),
    ).toBeVisible();
});

test('should logout', async ({ page }) => {
    await login(
        page,
        process.env.PLAYWRIGHT_USER_NAME,
        process.env.PLAYWRIGHT_USER_PASSWORD,
    );
    await page.waitForURL('/');
    await page
        .getByRole('button', { name: process.env.PLAYWRIGHT_USER_NAME })
        .click();
    await page.getByRole('button', { name: 'Logout' }).click();
    await page.getByRole('button', { name: 'Ok' }).click();
    await expect(page.getByRole('navigation')).toContainText('Login');
    await expect(page.getByRole('navigation')).toContainText('Register');
});
