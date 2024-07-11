import { test as setup } from '@playwright/test';
import { login } from '#utils/auth';
const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
    if (
        process.env.PLAYWRIGHT_USER_NAME &&
        process.env.PLAYWRIGHT_USER_PASSWORD
    ) {
        await login(
            page,
            process.env.PLAYWRIGHT_USER_NAME,
            process.env.PLAYWRIGHT_USER_PASSWORD,
        );
    }

    // End of authentication steps.
    await page.context().storageState({ path: authFile });
});
