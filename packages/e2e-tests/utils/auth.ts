export async function login(page, baseurl, username, password) {
    await page.goto(baseurl);
    await page.getByRole('link', { name: 'Login' }).click();
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.getByRole('button', { name: 'Login' }).click();
}