import { expect, test } from '@playwright/test';
import { formatNumber } from '#utils/common';
import fixtureData from './earlywarning.json';
test.use({ storageState: 'playwright/.auth/user.json' });
test.describe('Field Report', () => {
    test('test', async ({ page }) => {
        const {
            country,
            province,
            disasterType,
            date,
            title,
            govRequest,
            nationalSocietyRequest,
            potentiallyAffectedRc,
            potentiallyAffectedGov,
            potentiallyAffectedOther,
            peopleAtRiskRc,
            peopleAtRiskGov,
            peopleAtRiskOther,
            likelyToBeAffectedRc,
            likelyToBeAffectedGov,
            likelyToBeAffectedOther,
            sourceDetails,
            riskAnalysis,
            govNumAssisted,
            rcrcAssisted,
            actionWash,
            actionEvacuation,
            actionHealth,
            actionShelter,
            actionCash,
            actionNfi,
            actionMovement,
            actionMonitor,
            actionInteragency,
            generalSummary,
            fedSummary,
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
            forecastAction,
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
        // Context Page
        await page
            .locator('label')
            .filter({ hasText: 'Early Warning / Early Action' })
            .click();
        await page.locator('input[name="country"]').fill(country);
        await page.getByRole('button', { name: country }).click();
        await page.locator('input[name="districts"]').fill(province);
        await page.getByRole('button', { name: province }).click();
        await page.locator('input[name="dtype"]').fill(disasterType);
        await page.getByRole('button', { name: disasterType }).click();
        await expect(page.locator('input[name="dtype"]')).toHaveValue(
            disasterType,
        );
        await page.locator('input[name="start_date"]').fill(date);
        await page.getByPlaceholder('Example: Cyclone Cody').fill(title);
        const newtitle = await page.inputValue('input[type="text"]');
        await page
            .locator('label')
            .filter({ hasText: govRequest })
            .nth(1)
            .click();
        await page
            .locator('label')
            .filter({ hasText: nationalSocietyRequest })
            .nth(2)
            .click();
        await page.getByRole('button', { name: 'Continue' }).click();
        // Risk Analysis Page
        await page
            .locator('input[name="num_potentially_affected"]')
            .fill(potentiallyAffectedRc);
        await page
            .locator('input[name="gov_num_potentially_affected"]')
            .fill(potentiallyAffectedGov);
        await page
            .locator('input[name="other_num_potentially_affected"]')
            .fill(potentiallyAffectedOther);
        await page
            .locator('input[name="num_highest_risk"]')
            .fill(peopleAtRiskRc);
        await page
            .locator('input[name="gov_num_highest_risk"]')
            .fill(peopleAtRiskGov);
        await page
            .locator('input[name="other_num_highest_risk"]')
            .fill(peopleAtRiskOther);
        await page
            .locator('input[name="affected_pop_centres"]')
            .fill(likelyToBeAffectedRc);
        await page
            .locator('input[name="gov_affected_pop_centres"]')
            .fill(likelyToBeAffectedGov);
        await page
            .locator('input[name="other_affected_pop_centres"]')
            .fill(likelyToBeAffectedOther);
        await page
            .locator('textarea[name="other_sources"]')
            .fill(sourceDetails);
        await page.locator('textarea[name="description"]').fill(riskAnalysis);
        await page.getByRole('button', { name: 'Continue' }).click();
        // Early Action Page
        await page
            .locator('input[name="gov_num_assisted"]')
            .fill(govNumAssisted);
        await page.locator('input[name="num_assisted"]').fill(rcrcAssisted);
        await page
            .locator('label')
            .filter({ hasText: actionWash })
            .first()
            .click();
        await page
            .locator('label')
            .filter({ hasText: actionEvacuation })
            .first()
            .click();
        await page
            .locator('label')
            .filter({ hasText: actionHealth })
            .first()
            .click();
        await page
            .locator('textarea[name="summary"]')
            .first()
            .fill(generalSummary);
        await page.locator('label').filter({ hasText: actionMovement }).click();
        await page.locator('label').filter({ hasText: actionMonitor }).click();
        await page
            .locator('label')
            .filter({ hasText: actionInteragency })
            .click();
        await page.locator('textarea[name="summary"]').nth(1).fill(fedSummary);
        await page
            .locator('label')
            .filter({ hasText: actionShelter })
            .nth(1)
            .click();
        await page
            .locator('label')
            .filter({ hasText: actionCash })
            .nth(1)
            .click();
        await page
            .locator('label')
            .filter({ hasText: actionNfi })
            .nth(1)
            .click();
        await page.locator('textarea[name="summary"]').nth(2).fill(rcrcSummary);
        await page
            .locator('label')
            .filter({ hasText: informationBulletin })
            .click();
        await page.locator('textarea[name="actions_others"]').fill(actionOther);
        await page.getByRole('button', { name: 'Continue' }).click();
        // Response Page
        await page
            .locator('label')
            .filter({ hasText: interventionOptionOne })
            .first()
            .click();
        await page.locator('input[name="dref_amount"]').fill(drefRequested);
        await page
            .locator('label')
            .filter({ hasText: interventionOptionTwo })
            .nth(1)
            .click();
        await page.locator('input[name="appeal_amount"]').fill(emergencyAppeal);
        await page
            .locator('label')
            .filter({ hasText: interventionOptionThree })
            .nth(2)
            .click();
        await page.locator('input[name="num_fact"]').fill(rapidResponse);
        await page
            .locator('label')
            .filter({ hasText: interventionOptionOne })
            .nth(3)
            .click();
        await page
            .locator('input[name="num_ifrc_staff"]')
            .fill(emergencyResponse);
        await page
            .locator('label')
            .filter({ hasText: interventionOptionTwo })
            .nth(4)
            .click();
        await page
            .locator('input[name="forecast_based_action_amount"]')
            .fill(forecastAction);
        const contactDetails = [
            {
                name: originatorName,
                title: originatorTitle,
                email: originatorEmail,
                phone: originatorPhone,
            },
            {
                name: nationalName,
                title: nationalTitle,
                email: nationalEmail,
                phone: nationalPhone,
            },
            {
                name: ifrcName,
                title: ifrcTitle,
                email: ifrcEmail,
                phone: ifrcPhone,
            },
            {
                name: mediaName,
                title: mediaTitle,
                email: mediaEmail,
                phone: mediaPhone,
            },
        ];
        for (let i = 0; i < contactDetails.length; i++) {
            const details = contactDetails[i];
            await page.locator('input[name="name"]').nth(i).fill(details.name);
            await page
                .locator('input[name="title"]')
                .nth(i)
                .fill(details.title);
            await page
                .locator('input[name="email"]')
                .nth(i)
                .fill(details.email);
            await page
                .locator('input[name="phone"]')
                .nth(i)
                .fill(details.phone);
        }
        await page
            .locator('label')
            .filter({ hasText: visibiltyOptTwo })
            .click();
        await page.getByRole('button', { name: 'Submit' }).click();
        await expect(page.locator('h1')).toContainText(
            `${newtitle} - ${title}`,
        );
        // Assertion for Early Warning Type of Field Report
        const parentElement = page
            .getByText('Visibility')
            .locator('..')
            .locator('..')
            .locator('..')
            .locator('..');
        await expect(parentElement).toContainText(visibiltyOptTwo);
        const parent = page
            .getByText('Forecasted Date of Impact')
            .locator('..')
            .locator('..')
            .locator('..')
            .locator('..');
        await expect(parent).toContainText(date);
        // Assertions for Numeric Details
        const elements = [
            {
                text: 'Potentially Affected (RC)',
                expectedText: formatNumber(potentiallyAffectedRc),
            },
            {
                text: 'People at Highest Risk (Government)',
                expectedText: formatNumber(peopleAtRiskGov),
            },
            {
                text: 'Affected Pop Centres (RC)',
                expectedText: formatNumber(likelyToBeAffectedRc),
            },
            {
                text: 'Assisted (RC)',
                expectedText: formatNumber(rcrcAssisted),
            },
            {
                text: 'Potentially Affected (Government)',
                expectedText: formatNumber(potentiallyAffectedGov),
            },
            {
                text: 'People at Highest Risk (Other)',
                expectedText: formatNumber(peopleAtRiskOther),
            },
            {
                text: 'Affected (Government)',
                expectedText: formatNumber(likelyToBeAffectedGov),
            },
            {
                text: 'Assisted (Government)',
                expectedText: formatNumber(govNumAssisted),
            },
            {
                text: 'Potentially Affected (Other)',
                expectedText: formatNumber(potentiallyAffectedOther),
            },
            {
                text: 'People at Highest Risk (RC)',
                expectedText: formatNumber(peopleAtRiskRc),
            },
            {
                text: 'Affected Pop Centres (Other)',
                expectedText: formatNumber(likelyToBeAffectedOther),
            },
        ];
        for (const element of elements) {
            const pElement = await page
                .getByText(element.text, { exact: true })
                .locator('..');
            const cElement = await pElement.nth(0).innerText();
            await expect(cElement).toContain(element.expectedText);
        }
        // Assertions for Sources for data marked as other
        const sourceElement = page.getByText(
            'Sources for data marked as Other',
            { exact: true },
        );
        const sElement = sourceElement
            .locator('..')
            .locator('..')
            .locator('..')
            .locator('..');
        await expect(sElement).toContainText(sourceDetails);
        // Assertion for Risk Analysis
        const riskElement = page.getByText('Risk Analysis', { exact: true });
        const rElement = riskElement
            .locator('..')
            .locator('..')
            .locator('..')
            .locator('..');
        await expect(rElement).toContainText(riskAnalysis);
        //Assertion for Request for Assistance
        const govRequestElement = page
            .getByText('Government Requests International Assistance', {
                exact: true,
            })
            .locator('..');
        await expect(govRequestElement).toContainText(govRequest);
        const nsRequestElement = page
            .getByText('NS Requests International Assistance', { exact: true })
            .locator('..');
        await expect(nsRequestElement).toContainText(nationalSocietyRequest);
        // Assertions for Information Bulletion Published
        const infoElement = page.getByText('Information Bulletin Published', {
            exact: true,
        });
        const iElement = infoElement
            .locator('..')
            .locator('..')
            .locator('..')
            .locator('..');
        await expect(iElement).toContainText(informationBulletin);
        // Assertions for Action taken by National Society
        const actionNsElement = page
            .getByText('Actions taken by National Society', { exact: true })
            .locator('..')
            .locator('..')
            .locator('..')
            .locator('..');
        await expect(actionNsElement).toContainText(actionWash);
        await expect(actionNsElement).toContainText(actionEvacuation);
        await expect(actionNsElement).toContainText(actionHealth);
        await expect(actionNsElement).toContainText(generalSummary);
        // Assertion for Action Taken by Federation
        const actionFederationElement = page
            .getByText('Actions taken by Federation', { exact: true })
            .locator('..')
            .locator('..')
            .locator('..')
            .locator('..');
        await expect(actionFederationElement).toContainText(actionMovement);
        await expect(actionFederationElement).toContainText(actionMonitor);
        await expect(actionFederationElement).toContainText(actionInteragency);
        await expect(actionFederationElement).toContainText(fedSummary);
        // Assertion for Action Taken by RCRC
        const actionRcrcElement = page
            .getByText('Actions taken by RCRC', { exact: true })
            .locator('..')
            .locator('..')
            .locator('..')
            .locator('..');
        await expect(actionRcrcElement).toContainText(actionShelter);
        await expect(actionRcrcElement).toContainText(actionCash);
        await expect(actionRcrcElement).toContainText(actionNfi);
        await expect(actionRcrcElement).toContainText(rcrcSummary);
        // Assertions for Action Taken by Others
        const otherActionElement = page
            .getByText('Actions taken by others', { exact: true })
            .locator('..')
            .locator('..')
            .locator('..')
            .locator('..');
        await expect(otherActionElement).toContainText(actionOther);
        // Assertions for Planned International Response
        const interventions = [
            { label: 'DREF', value: interventionOptionOne },
            { label: 'Emergency Appeal', value: interventionOptionTwo },
            {
                label: 'Rapid Response Personnel',
                value: interventionOptionThree,
            },
            { label: 'Emergency Response Units', value: interventionOptionOne },
            { label: 'Forecast Based Action', value: interventionOptionTwo },
        ];
        for (const intervention of interventions) {
            const element = page
                .getByText(intervention.label, { exact: true })
                .locator('..');
            await expect(element).toHaveText(
                intervention.label + intervention.value,
            );
        }
        //Assertion for Contacts
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
        // Value Assertions
        await page.getByRole('link', { name: 'Edit Report' }).click();
        // Context Page
        const statusValue = page
            .locator('label')
            .filter({ hasText: 'Early Warning / Early Action' });
        await expect(statusValue).toBeChecked();
        // Assertions for Country, Region, Disaster Type, Date and Title value
        const countryValue = page.locator('input[name="country"]');
        await expect(countryValue).toHaveValue(country);
        const regionValue = page.locator('input[name="districts"]');
        await expect(regionValue).toHaveValue(province);
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
            .filter({ hasText: nationalSocietyRequest })
            .nth(2);
        await expect(nsReqValue).toBeChecked();
        await page.getByRole('button', { name: 'Continue' }).click();
        // Risk Analysis Page
        // Assertions for Numeric Details Value
        const fields = [
            { name: 'num_potentially_affected', value: potentiallyAffectedRc },
            {
                name: 'gov_num_potentially_affected',
                value: potentiallyAffectedGov,
            },
            {
                name: 'other_num_potentially_affected',
                value: potentiallyAffectedOther,
            },
            { name: 'num_highest_risk', value: peopleAtRiskRc },
            { name: 'gov_num_highest_risk', value: peopleAtRiskGov },
            { name: 'other_num_highest_risk', value: peopleAtRiskOther },
            { name: 'affected_pop_centres', value: likelyToBeAffectedRc },
            { name: 'gov_affected_pop_centres', value: likelyToBeAffectedGov },
            {
                name: 'other_affected_pop_centres',
                value: likelyToBeAffectedOther,
            },
        ];
        for (const field of fields) {
            const valueLocator = await page.locator(
                `input[name="${field.name}"]`,
            );
            await expect(valueLocator).toHaveValue(field.value);
        }
        // Assertions for Source Details Value
        const sourceValue = page.locator('textarea[name="other_sources"]');
        await expect(sourceValue).toHaveValue(sourceDetails);
        // Assertions for Risk Analysis Value
        const riskAnalysisValue = page.locator('textarea[name="description"]');
        await expect(riskAnalysisValue).toHaveValue(riskAnalysis);
        await page.getByRole('button', { name: 'Continue' }).click();
        // Early Actions Page
        // Assertions for Acton Taken Value
        const govNumAssistedValue = page.locator(
            'input[name="gov_num_assisted"]',
        );
        await expect(govNumAssistedValue).toHaveValue(govNumAssisted);
        const numAssistedValue = page.locator('input[name="num_assisted"]');
        await expect(numAssistedValue).toHaveValue(rcrcAssisted);
        // Assertion for Early Action Taken by NS Value
        const nsActions = [actionWash, actionEvacuation, actionHealth];
        for (const action of nsActions) {
            const actionLocator = page
                .locator('label')
                .filter({ hasText: action })
                .first();
            await expect(actionLocator).toBeChecked();
        }
        const nsActionsValue = page.locator('textarea[name="summary"]').first();
        await expect(nsActionsValue).toHaveValue(generalSummary);
        // Assertions for Early Actions Taken by IFRC Value
        const ifrcActions = [actionMovement, actionMonitor, actionInteragency];
        for (const action of ifrcActions) {
            const actionLocator = page
                .locator('label')
                .filter({ hasText: action });
            await expect(actionLocator).toBeChecked();
        }
        const ifrcActionsValue = page
            .locator('textarea[name="summary"]')
            .nth(1);
        await expect(ifrcActionsValue).toHaveValue(fedSummary);
        // Assertions for Early Action Taken by Other RCRC Movement Value
        const rcrcActions = [actionShelter, actionCash, actionNfi];
        for (const action of rcrcActions) {
            const actionLocator = page
                .locator('label')
                .filter({ hasText: action })
                .nth(1);
            await expect(actionLocator).toBeChecked();
        }
        const rcrcActionsValue = page
            .locator('textarea[name="summary"]')
            .nth(2);
        await expect(rcrcActionsValue).toHaveValue(rcrcSummary);
        // Assertions for Information Bulletion Value
        const informationBulletionValue = page
            .locator('label')
            .filter({ hasText: informationBulletin });
        await expect(informationBulletionValue).toBeChecked();
        // Assertions for Action Taken by Other Value
        const otherActionValue = page.locator(
            'textarea[name="actions_others"]',
        );
        await expect(otherActionValue).toHaveValue(actionOther);
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
            .filter({ hasText: interventionOptionOne })
            .nth(3);
        await expect(emergencyResponseValue).toBeChecked();
        const emergencyResponseSummaryValue = page.locator(
            'input[name="num_ifrc_staff"]',
        );
        await expect(emergencyResponseSummaryValue).toHaveValue(
            emergencyResponse,
        );
        // Forecast Based Action
        const forecastValue = page
            .locator('label')
            .filter({ hasText: interventionOptionTwo })
            .nth(4);
        await expect(forecastValue).toBeChecked();
        const forecastSummaryValue = page.locator(
            'input[name="forecast_based_action_amount"]',
        );
        await expect(forecastSummaryValue).toHaveValue(forecastAction);
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
