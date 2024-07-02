import { test, expect } from "@playwright/test";
import { login } from "../../utils/auth";

test("Login", async ({ page }) => {
  await login(
    page,
    process.env.APP_URL,
    process.env.USER_NAME,
    process.env.PASSWORD
  );
  await expect(page.getByRole("navigation")).toContainText(
    process.env.USER_NAME
  );
  await page.getByRole("button", { name: process.env.USER_NAME }).click();
});

test("logout", async ({ page }) => {
  await login(
    page,
    process.env.APP_URL,
    process.env.USER_NAME,
    process.env.PASSWORD
  );
  await expect(page.getByRole("navigation")).toContainText(
    process.env.USER_NAME
  );
  await page.getByRole("button", { name: process.env.USER_NAME }).click();
  await page.getByRole("button", { name: "Logout" }).click();
  await page.getByRole("button", { name: "Ok" }).click();
  await expect(page.getByRole("navigation")).toContainText("Login");
  await expect(page.getByRole("navigation")).toContainText("Register");
});
