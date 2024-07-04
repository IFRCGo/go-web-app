import { expect, test } from '@playwright/test';
import { login } from '../../utils/auth.ts';
import { formatNumber } from '../../utils/common.ts';
import fixtureData from '../epidemic-field-report/epidemic.json';

test.describe('Field report flow', async () => {
    test.beforeEach('login credentials', async ({ page }) => {
        await login(
            page,
            process.env.APP_URL,
            process.env.PLAYWRIGHT_USER_NAME,
            process.env.PLAYWRIGHT_USER_PASSWORD,
        );
    });

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
            suspected_cases,
            probable_cases,
            confirmed_cases,
            num_dead,
            source,
            epi_notes,
            epi_date,
            other_sources,
            description,
            gov_num_assisted,
            num_assisted,
            num_localstaff,
            num_volunteers,
            num_expats_delegates,
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
            .fill(suspected_cases);
        await page
            .locator('input[name="epi_probable_cases"]')
            .fill(probable_cases);
        await page
            .locator('input[name="epi_confirmed_cases"]')
            .fill(confirmed_cases);
        await page.locator('input[name="epi_num_dead"]').fill(num_dead);
        await page.locator('input[name="epi_figures_source"]').click();
        await page.getByRole('button', { name: source }).click();
        await page
            .locator('textarea[name="epi_notes_since_last_fr"]')
            .fill(epi_notes);
        await page.locator('input[name="sit_fields_date"]').fill(epi_date);
        await page
            .locator('textarea[name="other_sources"]')
            .fill(other_sources);
        await page.locator('textarea[name="description"]').fill(description);
        await page.getByRole('button', { name: 'Continue' }).click();
        // Action Page
        await page
            .locator('input[name="gov_num_assisted"]')
            .fill(gov_num_assisted);
        await page.locator('input[name="num_assisted"]').fill(num_assisted);
        await page.locator('input[name="num_localstaff"]').fill(num_localstaff);
        await page.locator('input[name="num_volunteers"]').fill(num_volunteers);
        await page
            .locator('input[name="num_expats_delegates"]')
            .fill(num_expats_delegates);
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
            { label: 'Date of Data', value: epi_date },
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
            { label: 'Suspected Cases', value: formatNumber(suspected_cases) },
            { label: 'Probable Cases', value: formatNumber(probable_cases) },
            { label: 'Confirmed Cases', value: formatNumber(confirmed_cases) },
            { label: 'Dead', value: formatNumber(num_dead) },
            { label: 'Assisted (RC)', value: formatNumber(num_assisted) },
            {
                label: 'Assisted (Government)',
                value: formatNumber(gov_num_assisted),
            },
            //  { label: 'Staff', value: formatNumber(num_localstaff)},
            //  { label: 'Volunteers', value: formatNumber(num_volunteers) },
            { label: 'Delegates', value: formatNumber(num_expats_delegates) },
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
        await expect(noteParent).toContainText(epi_notes);
        // Source Marked as Others Assertions
        const sourceChild = page.getByText('Sources for data marked as Other', {
            exact: true,
        });
        const sourceParent = sourceChild
            .locator('..')
            .locator('..')
            .locator('..')
            .locator('..');
        await expect(sourceParent).toContainText(other_sources);
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
        await expect(descriptionParent).toContainText(other_sources);
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
    });
});
