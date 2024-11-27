import { expect, test } from '@playwright/test';
import { login } from '#utils/auth';
test('should login', async ({ page }) => {
    await login(
        page,
        process.env.PLAYWRIGHT_USER_EMAIL,
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
        process.env.PLAYWRIGHT_USER_EMAIL,
        process.env.PLAYWRIGHT_USER_PASSWORD,
    );
    await page.waitForURL('/');
    const name = process.env.PLAYWRIGHT_USER_EMAIL.match(/^[^@]+(?=@)/);
    await page.getByRole('button', { name: name[0] }).click();
    await page.getByRole('button', { name: 'Logout' }).click();
    await page.getByRole('button', { name: 'Ok' }).click();
    await expect(page.getByRole('navigation')).toContainText('Login');
    await expect(page.getByRole('navigation')).toContainText('Register');
});
