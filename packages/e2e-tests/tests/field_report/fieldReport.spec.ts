import { test, expect } from "@playwright/test";
import { login } from "../../utils/auth.ts"
import { formatNumber } from '../../utils/common.ts';
import fixtureData from "./fieldReport.json";

test.describe("test suite for Field report", async () => {
  test.beforeEach("login credentials", async ({ page }) => {
    await login(
      page,
      process.env.APP_URL,
      process.env.PLAYWRIGHT_USER_NAME,
      process.env.PLAYWRIGHT_USER_PASSWORD
    );
  });

  test("Field report for Event", async ({ page }) => {

    const {
      formName,
      country,
      district,
      disasterType,
      date,
      title,
      govRequest,
      nationalsocietyRequest,
      num_injured,
      gov_num_injured,
      other_num_injured,
      num_dead,
      gov_num_dead,
      other_num_dead,
      num_missing,
      gov_num_missing,
      other_num_missing,
      num_affected,
      gov_num_affected,
      other_num_affected,
      num_displaced,
      other_num_displaced,
      gov_num_displaced,
      other_sources,
      gov_num_assisted,
      num_assisted,
      num_localstaff,
      num_volunteers,
      num_expats_delegates,
      actionHuman,
      actionEvacuation,
      actionHealth,
      actionShelter,
      actionCamp,
      actionFirst,
      actionPsychosocial,
      actionFood,
      nationalSocietySummary,
      federationSummary,
      rcrcSummary,
      informationBulletin,
      actionOther,
      interventionOptionOne,
      interventionOptionTwo,
      interventionOptionThree,
      drefRequested,
      emergencyAppeal,
      rapidResponse,
      emergencyResponse,
      originatorName,
      originatorTitle,
      originatorEmail,
      originatorPhone,
      nationalName,
      nationalTitle,
      nationalEmail,
      nationalPhone,
      ifrcName,
      ifrcTitle,
      ifrcEmail,
      ifrcPhone,
      mediaName,
      mediaTitle,
      mediaEmail,
      mediaPhone,
      visibiltyOptOne,
      visibiltyOptTwo
     } = fixtureData;
    
    await page.getByRole("button", { name: "Create a Report" }).click();
    await page.getByRole("link", { name: "New Field Report" }).click();
    await expect(page.locator('h1')).toContainText(formName);
    // Context Page
    await page.locator('input[name="country"]').fill(country);
    await page.getByRole("button", { name: country }).click();
    await page.locator('input[name="districts"]').fill(district);
    await page.getByRole("button", { name: district }).click();
    await page.locator('input[name="dtype"]').fill(disasterType);
    await page.getByRole("button", { name: disasterType }).click();
    await page.locator('input[name="start_date"]').fill(date);
    const newtitle = await page.inputValue('input[type="text"]'); 
    await page.getByPlaceholder("Example: Cyclone Cody").fill(title);
    await page.locator('label').filter({ hasText: govRequest }).nth(1).click();
    await page.locator('label').filter({ hasText: nationalsocietyRequest }).nth(2).click();
    await page.getByRole("button", { name: "Continue" }).click();
    // Situation Page
    await page.locator('input[name="num_injured"]').fill(num_injured);
    await page.locator('input[name="gov_num_injured"]').fill(gov_num_injured);
    await page.locator('input[name="other_num_injured"]').fill(other_num_injured);
    await page.locator('input[name="num_dead"]').fill(num_dead);
    await page.locator('input[name="gov_num_dead"]').fill(gov_num_dead);
    await page.locator('input[name="other_num_dead"]').fill(other_num_dead);
    await page.locator('input[name="num_missing"]').fill(num_missing);
    await page.locator('input[name="gov_num_missing"]').fill(gov_num_missing);
    await page.locator('input[name="other_num_missing"]').fill(other_num_missing);
    await page.locator('input[name="num_affected"]').fill(num_affected);
    await page.locator('input[name="gov_num_affected"]').fill(gov_num_affected);
    await page.locator('input[name="other_num_affected"]').fill(other_num_affected);
    await page.locator('input[name="num_displaced"]').fill(num_displaced);
    await page.locator('input[name="gov_num_displaced"]').fill(gov_num_displaced);
    await page.locator('input[name="other_num_displaced"]').fill(other_num_displaced);
    await page.locator('textarea[name="other_sources"]').fill(other_sources);
    // await page.frameLocator('iframe[title="Rich Text Area"]').locator('html').fill("Just the random data");
    // issue in Situational overview textbox
    await page.getByRole("button", { name: "Continue" }).click();
    // Action Page
    await page.locator('input[name="gov_num_assisted"]').fill(gov_num_assisted);
    await page.locator('input[name="num_assisted"]').fill(num_assisted);
    await page.locator('input[name="num_localstaff"]').fill(num_localstaff);
    await page.locator('input[name="num_volunteers"]').fill(num_volunteers);
    await page.locator('input[name="num_expats_delegates"]').fill(num_expats_delegates);
    // Action taken by National red cross society
    await page.locator('label').filter({ hasText: actionHuman }).first().click();
    await page.locator('label').filter({ hasText: actionShelter }).first().click();
    await page.locator('label').filter({ hasText: actionEvacuation }).first().click();
    await page.getByPlaceholder('Brief description of the action').first()
      .fill(nationalSocietySummary);
    // Action Taken by IFRC
    await page.locator('label').filter({ hasText: actionHealth }).nth(1).click();
    await page.locator('label').filter({ hasText: actionShelter }).nth(1).click();
    await page.locator('label').filter({ hasText: actionCamp  }).nth(1).click();
    await page.getByPlaceholder('Brief description of the').nth(1).fill(federationSummary);
    // Action Taken By any other RCRC movement actors
    await page.locator('label').filter({ hasText: actionFirst }).nth(2).click();
    await page.locator('label').filter({ hasText: actionPsychosocial }).nth(2).click();
    await page.locator('label').filter({ hasText: actionFood }).nth(2).click();
    await page.getByPlaceholder('Brief description of the').nth(2).fill(rcrcSummary);
    await page.locator('label').filter({ hasText: informationBulletin }).click();
    await page.locator('textarea[name="actions_others"]').fill(actionOther);
    await page.getByRole("button", { name: "Continue" }).click();
    // Response Page
    // DREF Requested
    await page.locator('label').filter({ hasText: interventionOptionOne }).first().click();
    await page.locator('input[name="dref_amount"]').fill(drefRequested);
    //Emergency Appeal
    await page.locator('label').filter({ hasText: interventionOptionTwo }).nth(1).click();
    await page.locator('input[name="appeal_amount"]').fill(emergencyAppeal);
    //Rapid Response Personnel
    await page.locator('label').filter({ hasText: interventionOptionThree }).nth(2).click();
    await page.locator('input[name="num_fact"]').fill(rapidResponse);
    // Emergency Response Units
    await page.locator('label').filter({ hasText: interventionOptionTwo }).nth(3).click();
    await page.locator('input[name="num_ifrc_staff"]').fill(emergencyResponse);
    // Originator
    await page.locator('input[name="name"]').nth(0).fill(originatorName);
    await page.locator('input[name="title"]').nth(0).fill(originatorTitle);
    await page.locator('input[name="email"]').nth(0).fill(originatorEmail);
    await page.locator('input[name="phone"]').nth(0).fill(originatorPhone);
    // National Society Contact
    await page.locator('input[name="name"]').nth(1).fill(nationalName);
    await page.locator('input[name="title"]').nth(1).fill(nationalTitle);
    await page.locator('input[name="email"]').nth(1).fill(nationalEmail);
    await page.locator('input[name="phone"]').nth(1).fill(nationalPhone);
    // IFRC Focal Point for the Emergency
    await page.locator('input[name="name"]').nth(2).fill(ifrcName);
    await page.locator('input[name="title"]').nth(2).fill(ifrcTitle);
    await page.locator('input[name="email"]').nth(2).fill(ifrcEmail);
    await page.locator('input[name="phone"]').nth(2).fill(ifrcPhone);
    // Media Contact
    await page.locator('input[name="name"]').nth(3).fill(mediaName);
    await page.locator('input[name="title"]').nth(3).fill(mediaTitle);
    await page.locator('input[name="email"]').nth(3).fill(mediaEmail);
    await page.locator('input[name="phone"]').nth(3).fill(mediaPhone);
    // Field report visible 
    await page.locator('label').filter({ hasText: visibiltyOptTwo }).click();
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.locator("body")).toContainText(
       "Field report updated, redirecting..."
     );
    // Title Assertion
    await expect(page.locator('h1')).toContainText(newtitle + " - " + title);
    // Data Assertion
    await expect(page.getByRole('banner')).toContainText(disasterType);
    await expect(page.getByRole('banner')).toContainText(country);
    const frVisibility = page.getByText('Visibility', { exact: true }).locator('..');
    await expect(frVisibility).toHaveText("Visibility" + visibiltyOptTwo);
    const frDate = page.getByText('Start Date', { exact: true }).locator('..');
    await expect(frDate).toHaveText("Start Date" + date);
    // Assertions to verify whether the data inserted on the form are displayed on the UI // Numeric Details
    const numericDetails = [
      { label: 'Injured (RC)', value: formatNumber(num_injured) },
      { label: 'Injured (Government)', value: formatNumber(gov_num_injured)},
      { label: 'Injured (Other)', value: formatNumber(other_num_injured)},
      { label: 'Missing (RC)', value: formatNumber(num_missing)},
      { label: 'Missing (Government)', value: formatNumber(gov_num_missing)},
      { label: 'Missing (Other)', value: formatNumber(other_num_missing)},
      { label: 'Dead (RC)', value: formatNumber(num_dead)},
      { label: 'Dead (Government)', value: formatNumber(gov_num_dead)},
      { label: 'Dead (Other)', value: formatNumber(other_num_dead) },
      { label: 'Displaced (RC)', value: formatNumber(num_displaced) },
      { label: 'Displaced (Government)', value: formatNumber(gov_num_displaced) },
      { label: 'Displaced (Other)', value: formatNumber(other_num_displaced) },
      { label: 'Affected (RC)', value: formatNumber(num_affected) },
      { label: 'Affected (Government)', value: formatNumber(gov_num_affected) },
      { label: 'Affected (Other)', value: formatNumber(other_num_affected) },
      { label: 'Assisted (RC)', value: formatNumber(num_assisted) },
      { label: 'Assisted (Government)', value: formatNumber(gov_num_assisted) },
      { label: 'Local Staff', value: formatNumber(num_localstaff) },
      { label: 'Volunteers', value: formatNumber(num_volunteers) },
      { label: 'IFRC Staff', value: formatNumber(emergencyResponse) },
      { label: 'Delegates', value: formatNumber(num_expats_delegates) }
    ];
    for (const detail of numericDetails) {
      const parentElement = page.getByText(detail.label).locator('..');
      const textContent = parentElement.nth(0);
      await expect(textContent).toContainText(detail.value);
    }
    // Source Marked as Others Assertions
    const sourceChild = page.getByText('Sources for data marked as Other', {exact: true});
    const sourceParent = sourceChild.locator('..').locator('..').locator('..').locator('..');
    await expect (sourceParent).toContainText(other_sources);
    // Request for Assistance Assertions
    const govReq = page.getByText('Government Requests International Assistance', { exact: true }).locator('..');
    await expect(govReq).toHaveText("Government Requests International Assistance" + govRequest);    
    const nsReq = page.getByText('NS Requests International Assistance', { exact: true }).locator('..');
    await expect(nsReq).toHaveText("NS Requests International Assistance" + nationalsocietyRequest);    
    // Information Bulletin Published Assertions
    const infoBulletin = page.getByText('Information Bulletin Published', { exact: true });
    const bulletin = infoBulletin.locator('..').locator('..').locator('..').locator('..');
    await expect(bulletin).toContainText(informationBulletin);
    // Assertions for actions taken by National Society, Federation and RCRC
    const sections = [
      {
        childText: 'Actions taken by National Society',
        actions: [actionHuman, actionShelter, actionEvacuation, nationalSocietySummary]
      },
      {
        childText: 'Actions Taken by Federation',
        actions: [actionHealth, actionShelter, actionCamp, federationSummary]
      },
      {
        childText: 'Actions Taken by RCRC',
        actions: [actionFirst, actionPsychosocial, actionFood, rcrcSummary]
      }
    ];
    
    for (const section of sections) {
      const sectionChild = page.getByText(section.childText);
      const sectionParent = sectionChild.locator('..').locator('..').locator('..').locator('..');
      
      for (const action of section.actions) {
        await expect(sectionParent).toContainText(action);
      }
    }
   // Actions taken by others assertions
    const actionParent = page.getByText('Actions taken by others', {exact: true});
    const actionChild = actionParent.locator('..').locator('..').locator('..').locator('..');
    await expect(actionChild).toContainText(actionOther);
   // Planned Intervention Assertions
    const drefPI = page.getByText('DREF', { exact: true }).locator('..');
    await expect(drefPI).toHaveText("DREF" + interventionOptionOne);    
    const emergencyPI = page.getByText('Emergency Appeal', { exact: true }).locator('..');
    await expect(emergencyPI).toHaveText("Emergency Appeal" + interventionOptionTwo);    
    const rapidPI = page.getByText('Rapid Response Personnel', { exact: true }).locator('..');
    await expect(rapidPI).toHaveText("Rapid Response Personnel" + interventionOptionThree);
    const emergencyResponsePI = page.getByText('Emergency Response Units', { exact: true }).locator('..');
    await expect(emergencyResponsePI).toHaveText("Emergency Response Units" + interventionOptionTwo);

  // Assertions to verify the contacts
    const details = [
      { label: 'Originator', name: originatorName, title: originatorTitle, email: originatorEmail, phone: originatorPhone },
      { label: 'NationalSociety', name: nationalName, title: nationalTitle, email: nationalEmail, phone: nationalPhone },
      { label: 'Federation', name: ifrcName, title: ifrcTitle, email: ifrcEmail, phone: ifrcPhone },
      { label: 'Media', name: mediaName, title: mediaTitle, email: mediaEmail, phone: mediaPhone }
    ];
  
    for (const detail of details) {
      const detailLocator = page.getByText(detail.label, { exact: true }).locator('..');
      await expect(detailLocator).toContainText(detail.name);
      await expect(detailLocator).toContainText(detail.title);
      await expect(detailLocator).toContainText(detail.email);
      await expect(detailLocator).toContainText(detail.phone);
  }
  

  });
});




