import { test, expect } from '@playwright/test';
import JSON5 from 'json5';
import fs from 'fs';

// Load JSON5
const data = JSON5.parse(fs.readFileSync('eap_regis_data.json5', 'utf-8'));

// Function to fill contact fields
async function fillContact(page,prefix: string,contact: { name: string; title: string; email: string; phone: string })
{
  await page.fill(`input[name="${prefix}_name"]`, contact.name);
  await page.fill(`input[name="${prefix}_title"]`, contact.title);
  await page.fill(`input[name="${prefix}_email"]`, contact.email);
  await page.fill(`input[name="${prefix}_phone_number"]`, contact.phone);
}

// Helper to select dropdown/button by name
async function selectDropdown(page, fieldName: string, value: string) {
  await page.locator(`input[name="${fieldName}"]`).click();
  await page.getByRole('button', { name: value }).click();
}

//  Login
test.beforeEach(async ({ page }) => {
  await page.goto('https://alpha-3.ifrc-go.dev.togglecorp.com/login');
  await page.fill('input[name="username"]', data.username);
  await page.fill('input[name="password"]', data.password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForTimeout(1000);
});

//  Test 1: Successful EAP Registration
test('EAP Registration Flow', async ({ page }) => {
  const d = data.eapForm;

  await page.goto('https://alpha-3.ifrc-go.dev.togglecorp.com/eap-registration/new');

  await selectDropdown(page, 'national_society', d.national_society);
  await selectDropdown(page, 'country', d.country);
  await selectDropdown(page, 'disaster_type', d.disaster_type);

  await page.getByText(d.eap_type).click();
  await page.fill('input[name="expected_submission_time"]', d.expected_submission_time);

  await page.locator('input[name="partners"]').click();
  for (const partner of d.partners) {
    await page.getByRole('button', { name: partner }).click();
  }
  await page.getByRole('button', { name: 'Close' }).click();

  await fillContact(page, 'national_society_contact', d.national_society_contact);
  await fillContact(page, 'ifrc_contact', d.ifrc_contact);
  await fillContact(page, 'dref_focal_point', d.dref_focal_point);

  await page.getByRole('button', { name: 'Submit' }).click();
  await page.getByRole('button', { name: 'Ok' }).click();
});

//  Test 2: Validation errors on empty submit
test('EAP Registration Form - required field validations', async ({ page }) => {
  await page.goto('https://alpha-3.ifrc-go.dev.togglecorp.com/eap-registration/new');

  await page.getByRole('button', { name: 'Submit' }).click();
  await page.getByRole('button', { name: 'Ok' }).click();

  const main = page.getByRole('main');

  await page.getByText('The field is required').nth(3).click();
  await page.getByText('The field is required').nth(2).click();
  await page.getByText('The field is required').nth(1).click();
  await page.getByText('The field is required').first().click();
});
