import { expect, test } from '@playwright/test';
import { login } from '../utils/auth';

test('Login', async ({ page }) => {
    await login(
        page,
        process.env.PLAYWRIGHT_APP_BASE_URL,
        process.env.PLAYWRIGHT_USER_NAME,
        process.env.PLAYWRIGHT_USER_PASSWORD,
    );
    await expect(page.getByRole('navigation')).toContainText(
        process.env.PLAYWRIGHT_USER_NAME,
    );
    await page
        .getByRole('button', { name: process.env.PLAYWRIGHT_USER_NAME })
        .click();
});

test('logout', async ({ page }) => {
    await login(
        page,
        process.env.PLAYWRIGHT_APP_BASE_URL,
        process.env.PLAYWRIGHT_USER_NAME,
        process.env.PLAYWRIGHT_USER_PASSWORD,
    );
    await expect(page.getByRole('navigation')).toContainText(
        process.env.PLAYWRIGHT_USER_NAME,
    );
    await page
        .getByRole('button', { name: process.env.PLAYWRIGHT_USER_NAME })
        .click();
    await page.getByRole('button', { name: 'Logout' }).click();
    await page.getByRole('button', { name: 'Ok' }).click();
    await expect(page.getByRole('navigation')).toContainText('Login');
    await expect(page.getByRole('navigation')).toContainText('Register');
});
