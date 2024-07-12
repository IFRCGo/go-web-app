import { expect, test } from '@playwright/test';
import { formatNumber } from '#utils/common';
import fixtureData from './epidemic.json';

test.use({ storageState: 'playwright/.auth/user.json' });

test.describe('Field report flow', async () => {
    test('field report for epidemic type', async ({ page }) => {
        const {
            formName,
            country,
            region,
            disasterType,
            date,
            title,
            govRequest,
            nationalsocietyRequest,
            cases,
            suspectedCases,
            probableCases,
            confirmedCases,
            numDead,
            source,
            epiNotes,
            epiDate,
            otherSources,
            description,
            govNumAssisted,
            numAssisted,
            numLocalstaff,
            numVolunteers,
            numExpatsDelegates,
            actionVaccination,
            actionQuarantine,
            actionWater,
            actionSanitation,
            actionVector,
            actionAid,
            actionAmbulance,
            actionVolunteer,
            actionReadiness,
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
        await page.locator('input[name="districts"]').fill(region);
        await page.getByRole('button', { name: region }).click();
        await page.locator('input[name="dtype"]').fill(disasterType);
        await page.getByRole('button', { name: disasterType }).click();
        await expect(page.locator('input[name="dtype"]')).toHaveValue(
            disasterType,
        );
        await page.locator('input[name="start_date"]').fill(date);
        const newtitle = await page.inputValue('input[type="text"]');
        await page.locator('input[name="summary"]').fill(title);
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
        await page.locator('input[name="epi_cases"]').fill(cases);
        await page
            .locator('input[name="epi_suspected_cases"]')
            .fill(suspectedCases);
        await page
            .locator('input[name="epi_probable_cases"]')
            .fill(probableCases);
        await page
            .locator('input[name="epi_confirmed_cases"]')
            .fill(confirmedCases);
        await page.locator('input[name="epi_num_dead"]').fill(numDead);
        await page.locator('input[name="epi_figures_source"]').click();
        await page.getByRole('button', { name: source }).click();
        await page
            .locator('textarea[name="epi_notes_since_last_fr"]')
            .fill(epiNotes);
        await page.locator('input[name="sit_fields_date"]').fill(epiDate);
        await page.locator('textarea[name="other_sources"]').fill(otherSources);
        await page.locator('textarea[name="description"]').fill(description);
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
            .filter({ hasText: actionVaccination })
            .first()
            .click();
        await page
            .locator('label')
            .filter({ hasText: actionQuarantine })
            .first()
            .click();
        await page
            .locator('label')
            .filter({ hasText: actionWater })
            .first()
            .click();
        await page
            .getByPlaceholder('Brief description of the action')
            .first()
            .fill(nationalSocietySummary);
        // Action Taken by IFRC
        await page
            .locator('label')
            .filter({ hasText: actionSanitation })
            .nth(1)
            .click();
        await page
            .locator('label')
            .filter({ hasText: actionVector })
            .nth(1)
            .click();
        await page
            .locator('label')
            .filter({ hasText: actionAid })
            .nth(1)
            .click();
        await page
            .getByPlaceholder('Brief description of the')
            .nth(1)
            .fill(federationSummary);
        // Action Taken By any other RCRC movement actors
        await page
            .locator('label')
            .filter({ hasText: actionAmbulance })
            .nth(2)
            .click();
        await page
            .locator('label')
            .filter({ hasText: actionVolunteer })
            .nth(2)
            .click();
        await page
            .locator('label')
            .filter({ hasText: actionReadiness })
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
        const fields = [
            { label: 'Visibility', value: visibiltyOptTwo },
            { label: 'Start Date', value: date },
            { label: 'Date of Data', value: epiDate },
            { label: 'Source', value: source },
        ];
        for (const field of fields) {
            const element = page
                .getByText(field.label, { exact: true })
                .locator('..');
            await expect(element).toHaveText(field.label + field.value);
        }
        // Assertions to verify whether the data inserted on the form are displayed on the UI // Numeric Details
        const numericDetails = [
            { label: 'Cumulative Cases', value: formatNumber(cases) },
            { label: 'Suspected Cases', value: formatNumber(suspectedCases) },
            { label: 'Probable Cases', value: formatNumber(probableCases) },
            { label: 'Confirmed Cases', value: formatNumber(confirmedCases) },
            { label: 'Dead', value: formatNumber(numDead) },
            { label: 'Assisted (RC)', value: formatNumber(numAssisted) },
            {
                label: 'Assisted (Government)',
                value: formatNumber(govNumAssisted),
            },
            //  { label: 'Staff', value: formatNumber(num_localstaff)},
            //  { label: 'Volunteers', value: formatNumber(num_volunteers) },
            { label: 'Delegates', value: formatNumber(numExpatsDelegates) },
        ];
        for (const detail of numericDetails) {
            const parentElement = page.getByText(detail.label).locator('..');
            const textContent = parentElement.nth(0);
            await expect(textContent).toContainText(detail.value);
        }
        // Notes
        const noteChild = page.getByText('Notes', { exact: true });
        const noteParent = noteChild
            .locator('..')
            .locator('..')
            .locator('..')
            .locator('..');
        await expect(noteParent).toContainText(epiNotes);
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
        // Description
        const descriptionChild = page.getByText(
            'Sources for data marked as Other',
            { exact: true },
        );
        const descriptionParent = descriptionChild
            .locator('..')
            .locator('..')
            .locator('..')
            .locator('..');
        await expect(descriptionParent).toContainText(otherSources);
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
        // Assertions to Verify Action taken by National Society, RCRC and Federation
        const sections = [
            {
                childText: 'Actions taken by National Society',
                actions: [
                    actionVaccination,
                    actionQuarantine,
                    actionWater,
                    nationalSocietySummary,
                ],
            },
            {
                childText: 'Actions Taken by Federation',
                actions: [
                    actionSanitation,
                    actionVector,
                    actionAid,
                    federationSummary,
                ],
            },
            {
                childText: 'Actions Taken by RCRC',
                actions: [
                    actionAmbulance,
                    actionVolunteer,
                    actionReadiness,
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
        // Assertions for Actions taken by others
        const actionParent = page.getByText('Actions taken by others', {
            exact: true,
        });
        const actionChild = actionParent
            .locator('..')
            .locator('..')
            .locator('..')
            .locator('..');
        await expect(actionChild).toContainText(actionOther);
        // Assertions to verify Planned Intervention
        const interventions = [
            { label: 'DREF', value: interventionOptionOne },
            { label: 'Emergency Appeal', value: interventionOptionTwo },
            {
                label: 'Rapid Response Personnel',
                value: interventionOptionThree,
            },
            { label: 'Emergency Response Units', value: interventionOptionTwo },
        ];
        for (const intervention of interventions) {
            const element = page
                .getByText(intervention.label, { exact: true })
                .locator('..');
            await expect(element).toHaveText(
                intervention.label + intervention.value,
            );
        }
        // Assertions to verify Contacts
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
        const statusValue = page
            .locator('label')
            .filter({ hasText: 'EventFirst report for this disaster' });
        await expect(statusValue).toBeChecked();
        // Assertions for Country, Region, Disaster Type, Date and Title
        const countryValue = page.locator('input[name="country"]');
        await expect(countryValue).toHaveValue(country);
        const regionValue = page.locator('input[name="districts"]');
        await expect(regionValue).toHaveValue(region);
        const disasterValue = page.locator('input[name="dtype"]');
        await expect(disasterValue).toHaveValue(disasterType);
        const dateValue = page.locator('input[name="start_date"]');
        await expect(dateValue).toHaveValue(date);
        const titleValue = page.getByPlaceholder('Example: Cyclone Cody');
        await expect(titleValue).toHaveValue(`${newtitle} - ${title}`);
        // Government request international assistance
        const govReqValue = page
            .locator('label')
            .filter({ hasText: govRequest })
            .nth(1);
        await expect(govReqValue).toBeChecked();
        // National Society requests international assistance?
        const nsReqValue = page
            .locator('label')
            .filter({ hasText: nationalsocietyRequest })
            .nth(2);
        await expect(nsReqValue).toBeChecked();
        await page.getByRole('button', { name: 'Continue' }).click();
        // Situation Page
        // Assertion for Numeric Details Value
        const numericDetailCases = [
            { name: 'epi_cases', value: cases },
            { name: 'epi_suspected_cases', value: suspectedCases },
            { name: 'epi_probable_cases', value: probableCases },
            { name: 'epi_confirmed_cases', value: confirmedCases },
            { name: 'epi_num_dead', value: numDead },
        ];
        for (const caseData of numericDetailCases) {
            const locator = page.locator(`input[name="${caseData.name}"]`);
            await expect(locator).toHaveValue(caseData.value);
        }
        // Assertions for Source Value
        const sourceValue = page.locator('input[name="epi_figures_source"]');
        await expect(sourceValue).toHaveValue(source);
        // Assertions for Notes Value
        const notesValue = page.locator(
            'textarea[name="epi_notes_since_last_fr"]',
        );
        await expect(notesValue).toHaveValue(epiNotes);
        // Assertions for Date of Data Value
        const dataDateValue = page.locator('input[name="sit_fields_date"]');
        await expect(dataDateValue).toHaveValue(epiDate);
        // Assertions for Source Details Value
        const otherSourcesValue = page.locator(
            'textarea[name="other_sources"]',
        );
        await expect(otherSourcesValue).toHaveValue(otherSources);
        // Assertions for Situational Overview Value
        const overviewValue = page.locator('textarea[name="description"]');
        await expect(overviewValue).toHaveValue(description);
        await page.getByRole('button', { name: 'Continue' }).click();
        // Actions Page
        // Assertions for Actions Taken Value
        const inputValues = [
            { name: 'gov_num_assisted', value: govNumAssisted },
            { name: 'num_assisted', value: numAssisted },
            { name: 'num_localstaff', value: numLocalstaff },
            { name: 'num_volunteers', value: numVolunteers },
            { name: 'num_expats_delegates', value: numExpatsDelegates },
        ];
        for (const { name, value } of inputValues) {
            const inputValue = page.locator(`input[name="${name}"]`);
            await expect(inputValue).toHaveValue(value);
        }
        // Assertions for Actions Taken by National Red Cross Society Value
        const nsActions = [actionVaccination, actionQuarantine, actionWater];
        for (const action of nsActions) {
            const actionLocator = page
                .locator('label')
                .filter({ hasText: action })
                .first();
            await expect(actionLocator).toBeChecked();
        }
        const nsActionsValue = page.locator('textarea[name="summary"]').first();
        await expect(nsActionsValue).toHaveValue(nationalSocietySummary);
        // Assertions for Actions Taken by IFRC Value
        const ifrcActions = [actionSanitation, actionVector, actionAid];
        for (const action of ifrcActions) {
            const actionLocator = page
                .locator('label')
                .filter({ hasText: action })
                .nth(1);
            await expect(actionLocator).toBeChecked();
        }
        const ifrcActionsValue = page
            .locator('textarea[name="summary"]')
            .nth(1);
        await expect(ifrcActionsValue).toHaveValue(federationSummary);
        // Assertions for Actions Taken by Other RCRC Movements Actors Value
        const rcrcActions = [actionAmbulance, actionVolunteer, actionReadiness];
        for (const action of rcrcActions) {
            const actionLocator = page
                .locator('label')
                .filter({ hasText: action })
                .nth(2);
            await expect(actionLocator).toBeChecked();
        }
        const rcrcActionsValue = page
            .locator('textarea[name="summary"]')
            .nth(2);
        await expect(rcrcActionsValue).toHaveValue(rcrcSummary);
        // Assertions for Information Bulletin Value
        const informationBulletinValue = page
            .locator('label')
            .filter({ hasText: informationBulletin });
        await expect(informationBulletinValue).toBeChecked();
        // Actions Taken by Others
        const actionOthersValue = page.locator(
            'textarea[name="actions_others"]',
        );
        await expect(actionOthersValue).toHaveValue(actionOther);
        await page.getByRole('button', { name: 'Continue' }).click();
        // Response Page
        // Assertions for Planned Interventions Value
        // DREF Requested
        const drefValue = page
            .locator('label')
            .filter({ hasText: interventionOptionOne })
            .nth(0);
        await expect(drefValue).toBeChecked();
        const drefSummaryValue = page.locator('input[name="dref_amount"]');
        await expect(drefSummaryValue).toHaveValue(drefRequested);
        // Emmergency Appeal
        const emergencyAppealValue = page
            .locator('label')
            .filter({ hasText: interventionOptionTwo })
            .nth(1);
        await expect(emergencyAppealValue).toBeChecked();
        const emergencyAppealSummaryValue = page.locator(
            'input[name="appeal_amount"]',
        );
        await expect(emergencyAppealSummaryValue).toHaveValue(emergencyAppeal);
        // Rapid Response Personnel
        const rapidResponseValue = page
            .locator('label')
            .filter({ hasText: interventionOptionThree })
            .nth(2);
        await expect(rapidResponseValue).toBeChecked();
        const rapidResponseSummaryValue = page.locator(
            'input[name="num_fact"]',
        );
        await expect(rapidResponseSummaryValue).toHaveValue(rapidResponse);
        // Emergency Response Unit
        const emergencyResponseValue = page
            .locator('label')
            .filter({ hasText: interventionOptionTwo })
            .nth(3);
        await expect(emergencyResponseValue).toBeChecked();
        const emergencyResponseSummaryValue = page.locator(
            'input[name="num_ifrc_staff"]',
        );
        await expect(emergencyResponseSummaryValue).toHaveValue(
            emergencyResponse,
        );
        // Contacts
        // Assertion for Originator Contacts value
        const originatorValue = [
            { name: 'name', value: originatorName },
            { name: 'title', value: originatorTitle },
            { name: 'email', value: originatorEmail },
            { name: 'phone', value: originatorPhone },
        ];
        for (const { name, value } of originatorValue) {
            const locator = page.locator(`input[name="${name}"]`).nth(0);
            await expect(locator).toHaveValue(value);
        }
        // Assertion for National Society values
        const nationalValue = [
            { name: 'name', value: nationalName },
            { name: 'title', value: nationalTitle },
            { name: 'email', value: nationalEmail },
            { name: 'phone', value: nationalPhone },
        ];
        for (const { name, value } of nationalValue) {
            const locator = page.locator(`input[name="${name}"]`).nth(1);
            await expect(locator).toHaveValue(value);
        }
        // Assertions for IFRC Focal Points for the Emergency Values
        const ifrcValue = [
            { name: 'name', value: ifrcName },
            { name: 'title', value: ifrcTitle },
            { name: 'email', value: ifrcEmail },
            { name: 'phone', value: ifrcPhone },
        ];
        for (const { name, value } of ifrcValue) {
            const locator = page.locator(`input[name="${name}"]`).nth(2);
            await expect(locator).toHaveValue(value);
        }
        // Assertions for Emergency Response Units Values
        const mediaValue = [
            { name: 'name', value: mediaName },
            { name: 'title', value: mediaTitle },
            { name: 'email', value: mediaEmail },
            { name: 'phone', value: mediaPhone },
        ];
        for (const { name, value } of mediaValue) {
            const locator = page.locator(`input[name="${name}"]`).nth(3);
            await expect(locator).toHaveValue(value);
        }
        // Assertions for Field Report Visibility Value
        const frVisibilityValue = page
            .locator('label')
            .filter({ hasText: visibiltyOptTwo });
        await expect(frVisibilityValue).toBeChecked();
    });
});
