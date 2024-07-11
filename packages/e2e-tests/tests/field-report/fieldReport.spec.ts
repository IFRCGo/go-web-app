import { expect, test } from '@playwright/test';
import { formatNumber } from '#utils/common';
import fixtureData from './fieldReport.json';

test.use({ storageState: 'playwright/.auth/user.json' });

test.describe('Field Report',  () => {
    test('should create a new event type field report', async ({ page }) => {
        const {
            formName,
            country,
            district,
            disasterType,
            date,
            title,
            govRequest,
            nationalsocietyRequest,
            numInjured,
            govNumInjured,
            otherNumInjured,
            numDead,
            govNumDead,
            otherNumDead,
            numMissing,
            govNumMissing,
            otherNumMissing,
            numAffected,
            govNumAffected,
            otherNumAffected,
            numDisplaced,
            otherNumDisplaced,
            govNumDisplaced,
            otherSources,
            govNumAssisted,
            numAssisted,
            numLocalstaff,
            numVolunteers,
            numExpatsDelegates,
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
            visibiltyOptTwo,
        } = fixtureData;

        await page.goto('/');
        await page.getByRole('button', { name: 'Create a Report' }).click();
        await page.getByRole('link', { name: 'New Field Report' }).click();
        await expect(page.locator('h1')).toContainText(formName);
        // Context Page
        await page.locator('input[name="country"]').fill(country);
        await page.getByRole('button', { name: country }).click();
        await page.locator('input[name="districts"]').fill(district);
        await page.getByRole('button', { name: district }).click();
        await page.locator('input[name="dtype"]').fill(disasterType);
        await page.getByRole('button', { name: disasterType }).click();
        await page.locator('input[name="start_date"]').fill(date);
        const newtitle = await page.inputValue('input[type="text"]');
        await page.getByPlaceholder('Example: Cyclone Cody').fill(title);
        await page
            .locator('label')
            .filter({ hasText: govRequest })
            .nth(1)
            .click();
        await page
            .locator('label')
            .filter({ hasText: nationalsocietyRequest })
            .nth(2)
            .click();
        await page.getByRole('button', { name: 'Continue' }).click();
        // Situation Page
        await page.locator('input[name="num_injured"]').fill(numInjured);
        await page
            .locator('input[name="gov_num_injured"]')
            .fill(govNumInjured);
        await page
            .locator('input[name="other_num_injured"]')
            .fill(otherNumInjured);
        await page.locator('input[name="num_dead"]').fill(numDead);
        await page.locator('input[name="gov_num_dead"]').fill(govNumDead);
        await page.locator('input[name="other_num_dead"]').fill(otherNumDead);
        await page.locator('input[name="num_missing"]').fill(numMissing);
        await page
            .locator('input[name="gov_num_missing"]')
            .fill(govNumMissing);
        await page
            .locator('input[name="other_num_missing"]')
            .fill(otherNumMissing);
        await page.locator('input[name="num_affected"]').fill(numAffected);
        await page
            .locator('input[name="gov_num_affected"]')
            .fill(govNumAffected);
        await page
            .locator('input[name="other_num_affected"]')
            .fill(otherNumAffected);
        await page.locator('input[name="num_displaced"]').fill(numDisplaced);
        await page
            .locator('input[name="gov_num_displaced"]')
            .fill(govNumDisplaced);
        await page
            .locator('input[name="other_num_displaced"]')
            .fill(otherNumDisplaced);
        await page
            .locator('textarea[name="other_sources"]')
            .fill(otherSources);
        // await page.frameLocator('iframe[title="Rich Text Area"]').locator('html').fill("Just the random data");
        // issue in Situational overview textbox
        await page.getByRole('button', { name: 'Continue' }).click();
        // Action Page
        await page
            .locator('input[name="gov_num_assisted"]')
            .fill(govNumAssisted);
        await page.locator('input[name="num_assisted"]').fill(numAssisted);
        await page.locator('input[name="num_localstaff"]').fill(numLocalstaff);
        await page.locator('input[name="num_volunteers"]').fill(numVolunteers);
        await page
            .locator('input[name="num_expats_delegates"]')
            .fill(numExpatsDelegates);
        // Action taken by National red cross society
        await page
            .locator('label')
            .filter({ hasText: actionHuman })
            .first()
            .click();
        await page
            .locator('label')
            .filter({ hasText: actionShelter })
            .first()
            .click();
        await page
            .locator('label')
            .filter({ hasText: actionEvacuation })
            .first()
            .click();
        await page
            .getByPlaceholder('Brief description of the action')
            .first()
            .fill(nationalSocietySummary);
        // Action Taken by IFRC
        await page
            .locator('label')
            .filter({ hasText: actionHealth })
            .nth(1)
            .click();
        await page
            .locator('label')
            .filter({ hasText: actionShelter })
            .nth(1)
            .click();
        await page
            .locator('label')
            .filter({ hasText: actionCamp })
            .nth(1)
            .click();
        await page
            .getByPlaceholder('Brief description of the')
            .nth(1)
            .fill(federationSummary);
        // Action Taken By any other RCRC movement actors
        await page
            .locator('label')
            .filter({ hasText: actionFirst })
            .nth(2)
            .click();
        await page
            .locator('label')
            .filter({ hasText: actionPsychosocial })
            .nth(2)
            .click();
        await page
            .locator('label')
            .filter({ hasText: actionFood })
            .nth(2)
            .click();
        await page
            .getByPlaceholder('Brief description of the')
            .nth(2)
            .fill(rcrcSummary);
        await page
            .locator('label')
            .filter({ hasText: informationBulletin })
            .click();
        await page.locator('textarea[name="actions_others"]').fill(actionOther);
        await page.getByRole('button', { name: 'Continue' }).click();
        // Response Page
        // DREF Requested
        await page
            .locator('label')
            .filter({ hasText: interventionOptionOne })
            .first()
            .click();
        await page.locator('input[name="dref_amount"]').fill(drefRequested);
        //Emergency Appeal
        await page
            .locator('label')
            .filter({ hasText: interventionOptionTwo })
            .nth(1)
            .click();
        await page.locator('input[name="appeal_amount"]').fill(emergencyAppeal);
        //Rapid Response Personnel
        await page
            .locator('label')
            .filter({ hasText: interventionOptionThree })
            .nth(2)
            .click();
        await page.locator('input[name="num_fact"]').fill(rapidResponse);
        // Emergency Response Units
        await page
            .locator('label')
            .filter({ hasText: interventionOptionTwo })
            .nth(3)
            .click();
        await page
            .locator('input[name="num_ifrc_staff"]')
            .fill(emergencyResponse);
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
        await page
            .locator('label')
            .filter({ hasText: visibiltyOptTwo })
            .click();
        await page.getByRole('button', { name: 'Submit' }).click();
        await expect(page.locator('body')).toContainText(
            'Field report updated, redirecting...',
        );
        // Title Assertion
        await expect(page.locator('h1')).toContainText(
            `${newtitle} - ${title}`,
        );
        // Data Assertion
        await expect(page.getByRole('banner')).toContainText(disasterType);
        await expect(page.getByRole('banner')).toContainText(country);
        const frVisibility = page
            .getByText('Visibility', { exact: true })
            .locator('..');
        await expect(frVisibility).toHaveText(`Visibility${visibiltyOptTwo}`);
        const frDate = page
            .getByText('Start Date', { exact: true })
            .locator('..');
        await expect(frDate).toHaveText(`Start Date${date}`);
        // Assertions to verify whether the data inserted on the form are displayed on the UI // Numeric Details
        const numericDetails = [
            { label: 'Injured (RC)', value: formatNumber(numInjured) },
            {
                label: 'Injured (Government)',
                value: formatNumber(govNumInjured),
            },
            {
                label: 'Injured (Other)',
                value: formatNumber(otherNumInjured),
            },
            { label: 'Missing (RC)', value: formatNumber(numMissing) },
            {
                label: 'Missing (Government)',
                value: formatNumber(govNumMissing),
            },
            {
                label: 'Missing (Other)',
                value: formatNumber(otherNumMissing),
            },
            { label: 'Dead (RC)', value: formatNumber(numDead) },
            { label: 'Dead (Government)', value: formatNumber(govNumDead) },
            { label: 'Dead (Other)', value: formatNumber(otherNumDead) },
            { label: 'Displaced (RC)', value: formatNumber(numDisplaced) },
            {
                label: 'Displaced (Government)',
                value: formatNumber(govNumDisplaced),
            },
            {
                label: 'Displaced (Other)',
                value: formatNumber(otherNumDisplaced),
            },
            { label: 'Affected (RC)', value: formatNumber(numAffected) },
            {
                label: 'Affected (Government)',
                value: formatNumber(govNumAffected),
            },
            {
                label: 'Affected (Other)',
                value: formatNumber(otherNumAffected),
            },
            { label: 'Assisted (RC)', value: formatNumber(numAssisted) },
            {
                label: 'Assisted (Government)',
                value: formatNumber(govNumAssisted),
            },
            { label: 'Local Staff', value: formatNumber(numLocalstaff) },
            { label: 'Volunteers', value: formatNumber(numVolunteers) },
            { label: 'IFRC Staff', value: formatNumber(emergencyResponse) },
            { label: 'Delegates', value: formatNumber(numExpatsDelegates) },
        ];
        for (const detail of numericDetails) {
            const parentElement = page.getByText(detail.label).locator('..');
            const textContent = parentElement.nth(0);
            await expect(textContent).toContainText(detail.value);
        }
        // Source Marked as Others Assertions
        const sourceChild = page.getByText('Sources for data marked as Other', {
            exact: true,
        });
        const sourceParent = sourceChild
            .locator('..')
            .locator('..')
            .locator('..')
            .locator('..');
        await expect(sourceParent).toContainText(otherSources);
        // Request for Assistance Assertions
        const govReq = page
            .getByText('Government Requests International Assistance', {
                exact: true,
            })
            .locator('..');
        await expect(govReq).toHaveText(
            `Government Requests International Assistance${govRequest}`,
        );
        const nsReq = page
            .getByText('NS Requests International Assistance', { exact: true })
            .locator('..');
        await expect(nsReq).toHaveText(
            `NS Requests International Assistance${nationalsocietyRequest}`,
        );
        // Information Bulletin Published Assertions
        const infoBulletin = page.getByText('Information Bulletin Published', {
            exact: true,
        });
        const bulletin = infoBulletin
            .locator('..')
            .locator('..')
            .locator('..')
            .locator('..');
        await expect(bulletin).toContainText(informationBulletin);
        // Assertions for actions taken by National Society, Federation and RCRC
        const sections = [
            {
                childText: 'Actions taken by National Society',
                actions: [
                    actionHuman,
                    actionShelter,
                    actionEvacuation,
                    nationalSocietySummary,
                ],
            },
            {
                childText: 'Actions Taken by Federation',
                actions: [
                    actionHealth,
                    actionShelter,
                    actionCamp,
                    federationSummary,
                ],
            },
            {
                childText: 'Actions Taken by RCRC',
                actions: [
                    actionFirst,
                    actionPsychosocial,
                    actionFood,
                    rcrcSummary,
                ],
            },
        ];

        for (const section of sections) {
            const sectionChild = page.getByText(section.childText);
            const sectionParent = sectionChild
                .locator('..')
                .locator('..')
                .locator('..')
                .locator('..');

            for (const action of section.actions) {
                await expect(sectionParent).toContainText(action);
            }
        }
        // Actions taken by others assertions
        const actionParent = page.getByText('Actions taken by others', {
            exact: true,
        });
        const actionChild = actionParent
            .locator('..')
            .locator('..')
            .locator('..')
            .locator('..');
        await expect(actionChild).toContainText(actionOther);
        // Planned Intervention Assertions
        const drefPI = page.getByText('DREF', { exact: true }).locator('..');
        await expect(drefPI).toHaveText(`DREF${interventionOptionOne}`);
        const emergencyPI = page
            .getByText('Emergency Appeal', { exact: true })
            .locator('..');
        await expect(emergencyPI).toHaveText(
            `Emergency Appeal${interventionOptionTwo}`,
        );
        const rapidPI = page
            .getByText('Rapid Response Personnel', { exact: true })
            .locator('..');
        await expect(rapidPI).toHaveText(
            `Rapid Response Personnel${interventionOptionThree}`,
        );
        const emergencyResponsePI = page
            .getByText('Emergency Response Units', { exact: true })
            .locator('..');
        await expect(emergencyResponsePI).toHaveText(
            `Emergency Response Units${interventionOptionTwo}`,
        );

        // Assertions to verify the contacts
        const details = [
            {
                label: 'Originator',
                name: originatorName,
                title: originatorTitle,
                email: originatorEmail,
                phone: originatorPhone,
            },
            {
                label: 'NationalSociety',
                name: nationalName,
                title: nationalTitle,
                email: nationalEmail,
                phone: nationalPhone,
            },
            {
                label: 'Federation',
                name: ifrcName,
                title: ifrcTitle,
                email: ifrcEmail,
                phone: ifrcPhone,
            },
            {
                label: 'Media',
                name: mediaName,
                title: mediaTitle,
                email: mediaEmail,
                phone: mediaPhone,
            },
        ];

        for (const detail of details) {
            const detailLocator = page
                .getByText(detail.label, { exact: true })
                .locator('..');
            await expect(detailLocator).toContainText(detail.name);
            await expect(detailLocator).toContainText(detail.title);
            await expect(detailLocator).toContainText(detail.email);
            await expect(detailLocator).toContainText(detail.phone);
        }
          await page.getByRole('link', { name: 'Edit Report' }).click();
        // Input Value Assertions
        // Context Page
        // Status
        const statusValue = page.locator('label').filter({ hasText: 'EventFirst report for this disaster' })
        await expect(statusValue).toBeChecked();
        // Assertions for Country, Region, Disaster Type, Date and Title
        const countryValue = page.locator('input[name="country"]');
        await expect(countryValue).toHaveValue(country);
        const regionValue = page.locator('input[name="districts"]')
        await expect(regionValue).toHaveValue(district);
        const disasterValue = page.locator('input[name="dtype"]');
        await expect(disasterValue).toHaveValue(disasterType);
        const dateValue = page.locator('input[name="start_date"]');
        await expect(dateValue).toHaveValue(date);
        const titleValue = page.getByPlaceholder('Example: Cyclone Cody');
        await expect(titleValue).toHaveValue(`${newtitle} - ${title}`,);
        // Government request international assistance
        const govReqValue = page.locator('label').filter({ hasText: govRequest }).nth(1)
        await expect(govReqValue).toBeChecked();
        // National Society requests international assistance?
        const nsReqValue = page.locator('label').filter({ hasText: nationalsocietyRequest }).nth(2)
        await expect(nsReqValue).toBeChecked();
        await page.getByRole('button', { name: 'Continue' }).click();
        // Situation Page
        // Assertions for Numeric Details Value
        const numericDetailValues = [
            { name: 'num_injured', value: numInjured },
            { name: 'gov_num_injured', value: govNumInjured },
            { name: 'other_num_injured', value: otherNumInjured },
            { name: 'num_dead', value: numDead },
            { name: 'gov_num_dead', value: govNumDead },
            { name: 'other_num_dead', value: otherNumDead },
            { name: 'num_missing', value: numMissing },
            { name: 'gov_num_missing', value: govNumMissing },
            { name: 'other_num_missing', value: otherNumMissing },
            { name: 'num_affected', value: numAffected },
            { name: 'gov_num_affected', value: govNumAffected },
            { name: 'other_num_affected', value: otherNumAffected },
            { name: 'num_displaced', value: numDisplaced },
            { name: 'gov_num_displaced', value: govNumDisplaced },
            { name: 'other_num_displaced', value: otherNumDisplaced }
        ];
        for (const { name, value } of numericDetailValues) {
            const inputValue = page.locator(`input[name="${name}"]`);
            await expect(inputValue).toHaveValue(value);
        }
        // Assertions for Source Details value
        const sourceValue = page.locator('textarea[name="other_sources"]');
        await expect(sourceValue).toHaveValue(otherSources);
        await page.getByRole('button', { name: 'Continue' }).click();
        // Actions Page
        // Assertions for Actions taken Value
        const assistedValues = [
            { name: 'gov_num_assisted', value: govNumAssisted },
            { name: 'num_assisted', value: numAssisted },
            { name: 'num_localstaff', value: numLocalstaff },
            { name: 'num_volunteers', value: numVolunteers },
            { name: 'num_expats_delegates', value: numExpatsDelegates }
        ];
        for (const { name, value } of assistedValues) {
            const inputValue = page.locator(`input[name="${name}"]`);
            await expect(inputValue).toHaveValue(value);
        }
        // Assertions for Actions Taken by National Society Red Cross Value
        const nsActions = [actionHuman, actionShelter, actionEvacuation];
        for (const action of nsActions) {
            const label = page.locator('label').filter({ hasText: action }).first();
            await expect(label).toBeChecked();
        }
        const nsValue = page.getByPlaceholder('Brief description of the action').first();
        await expect(nsValue).toHaveText(nationalSocietySummary);
        // Assertions for Actions Taken by IFRC Value
        const ifrcActions = [actionHealth, actionShelter, actionCamp];
        for (const action of ifrcActions) {
            const label = page.locator('label').filter({ hasText: action }).nth(1);
            await expect(label).toBeChecked();
        }
        const ifrcValue = page.getByPlaceholder('Brief description of the action').nth(1);
        await expect(ifrcValue).toHaveText(federationSummary);
        // Assertions for Actions Taken by RCRC Movements Value
        const rcrcActions = [actionFirst, actionPsychosocial, actionFood];
        for (const action of rcrcActions) {
            const label = page.locator('label').filter({ hasText: action }).nth(2);
            await expect(label).toBeChecked();
        }
        const rcrcValue = page.getByPlaceholder('Brief description of the action').nth(2);
        await expect(rcrcValue).toHaveText(rcrcSummary);
        // Assertions for Information Bulletin
        const bulletinValue = page.locator('label').filter({ hasText: informationBulletin });
        await expect(bulletinValue).toBeChecked();
        // Assertions for Actions Taken by Others Value
        const actionsOtherValue = page.locator('textarea[name="actions_others"]');
        await expect(actionsOtherValue).toHaveText(actionOther)
        
        });
});
