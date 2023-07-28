import { Fragment, useContext } from 'react';
import { useParams, generatePath } from 'react-router-dom';
import { isNotDefined } from '@togglecorp/fujs';

import useTranslation from '#hooks/useTranslation';
import Page from '#components/Page';
import Link from '#components/Link';
import RouteContext from '#contexts/route';
import DateOutput from '#components/DateOutput';
import Container from '#components/Container';
import TextOutput from '#components/TextOutput';
import { useRequest } from '#utils/restRequest';
import { resolveToComponent } from '#utils/translation';
import type { paths } from '#generated/types';

import i18n from './i18n.json';
import styles from './styles.module.css';

type FieldReportResponse = paths['/api/v2/field_report/{id}/']['get']['responses']['200']['content']['application/json'];

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { fieldReportId } = useParams<{ fieldReportId: string }>();

    const {
        country: countryRoute,
        emergencies: emergenciesRoute,
    } = useContext(RouteContext);

    const {
        response: fieldReportResponse,
    } = useRequest<FieldReportResponse>({
        skip: isNotDefined(fieldReportId),
        url: '/api/v2/field_report/{id}/',
        pathVariables: {
            id: fieldReportId,
        },
    });

    return (
        <Page
            mainSectionClassName={styles.fieldReportDetails}
            heading={fieldReportResponse?.summary}
        >
            <div className={styles.fieldReportSubtitle}>
                {fieldReportResponse?.dtype?.name}
                {fieldReportResponse?.countries?.map((country, i) => (
                    <>
                        <Link
                            className={styles.titleLink}
                            to={generatePath(
                                countryRoute.absolutePath,
                                { countryId: country.id },
                            )}
                        >
                            {country.name}
                        </Link>
                        {(i < (fieldReportResponse?.countries?.length) ?? 0 - 1)
                            && ', '}
                    </>
                ))}
                <Link
                    className={styles.titleLink}
                    to={generatePath(
                        emergenciesRoute.absolutePath,
                        { emergencyId: fieldReportResponse?.event.id },
                    )}
                >
                    {fieldReportResponse?.summary}
                </Link>
            </div>
            <Link
                className={styles.editLink}
                to="edit"
                withForwardIcon
            >
                {strings.editReport}
            </Link>
            <div className={styles.latestUpdatedDetail}>
                {resolveToComponent(strings.lastUpdatedByLabel, {
                    user: fieldReportResponse?.user?.username,
                    date: (
                        <DateOutput
                            value={fieldReportResponse?.created_at}
                            format="dd-MM-yyyy"
                        />
                    ),
                    region: fieldReportResponse?.regions?.map((region) => region.name).join(', '),
                    district: fieldReportResponse?.districts?.map((district) => district.name).join(', '),
                })}
            </div>
            <div className={styles.listOfDetail}>
                <Container
                    childrenContainerClassName={styles.numericDetails}
                    heading={strings.numericDetailsTitle}
                >
                    <TextOutput
                        label={strings.injuredRCLabel}
                        value={fieldReportResponse?.num_injured}
                    />
                    <TextOutput
                        label={strings.missingGovernmentLabel}
                        value={fieldReportResponse?.gov_num_injured}
                    />
                    <TextOutput
                        label={strings.injuredOtherLabel}
                        value={fieldReportResponse?.other_num_injured}
                    />
                    <TextOutput
                        label={strings.missingOtherFirstLabel}
                        value={fieldReportResponse?.num_missing}
                    />
                    <TextOutput
                        label={strings.missingGovernmentLabel}
                        value={fieldReportResponse?.gov_num_missing}
                    />
                    <TextOutput
                        label={strings.missingOtherSecondLabel}
                        value={fieldReportResponse?.other_num_missing}
                    />
                    <TextOutput
                        label={strings.deadOtherFirstLabel}
                        value={fieldReportResponse?.num_dead}
                    />
                    <TextOutput
                        label={strings.deadGovernmentLabel}
                        value={fieldReportResponse?.gov_num_dead}
                    />
                    <TextOutput
                        label={strings.deadOtherSecondLabel}
                        value={fieldReportResponse?.other_num_dead}
                    />
                    <TextOutput
                        label={strings.displacedRCLabel}
                        value={fieldReportResponse?.num_displaced}
                    />
                    <TextOutput
                        label={strings.displacedGovernmentLabel}
                        value={fieldReportResponse?.gov_num_displaced}
                    />
                    <TextOutput
                        label={strings.displacedGovernmentLabel}
                        value={fieldReportResponse?.other_num_displaced}
                    />
                    <TextOutput
                        label={strings.affectedRCLabel}
                        value={fieldReportResponse?.num_displaced}
                    />
                    <TextOutput
                        label={strings.affectedGovernmentLabel}
                        value={fieldReportResponse?.gov_num_displaced}
                    />
                    <TextOutput
                        label={strings.affectedOtherLabel}
                        value={fieldReportResponse?.other_num_displaced}
                    />
                    <TextOutput
                        label={strings.assistedRCLabel}
                        value={fieldReportResponse?.num_assisted}
                    />
                    <TextOutput
                        label={strings.assistedGovernmentLabel}
                        value={fieldReportResponse?.gov_num_assisted}
                    />
                    <TextOutput
                        label={strings.assistedOtherLabel}
                        value={fieldReportResponse?.other_num_assisted}
                    />
                    <TextOutput
                        label={strings.localStaffLabel}
                        value={fieldReportResponse?.num_localstaff}
                    />
                    <TextOutput
                        label={strings.volunteersLabel}
                        value={fieldReportResponse?.num_volunteers}
                    />
                    <TextOutput
                        label={strings.ifrcStaffLabel}
                        value={fieldReportResponse?.ifrc_staff}
                    />
                    <TextOutput
                        label={strings.delegatedLabel}
                        value={fieldReportResponse?.num_expats_delegates}
                    />
                </Container>
                <Container
                    childrenContainerClassName={styles.numericDetails}
                    heading={strings.descriptionTitle}
                >
                    <TextOutput
                        label={strings.visibilityLabel}
                        value={fieldReportResponse?.visibility_display}
                    />
                    <TextOutput
                        label={strings.startDateLabel}
                        value={fieldReportResponse?.start_date}
                        valueType="date"
                    />
                    <TextOutput
                        label={strings.reportDateLabel}
                        value={fieldReportResponse?.report_date}
                        valueType="date"
                    />
                </Container>
                <Container heading={strings.requestForAssistanceHeading}>
                    <TextOutput
                        label={strings.governmentRequestsInternationalAssistanceLabel}
                        value={fieldReportResponse?.request_assistance}
                    />
                    <TextOutput
                        label={strings.nSRequestsInternationalAssistanceLabel}
                        value={fieldReportResponse?.ns_request_assistance}
                    />
                </Container>
                <Container heading={strings.informationBulletinPublishedLabel}>
                    {fieldReportResponse?.bulletin}
                </Container>
                <Container heading={strings.actionsTakenByNationalSociety}>
                    {fieldReportResponse?.actions_taken?.map((action) => action?.organization)}
                </Container>
                <Container heading={strings.externalPartnersSupportedActivitiesLabel}>
                    {fieldReportResponse?.external_partners.map((partner) => partner?.name)}
                </Container>
                {fieldReportResponse?.contacts?.map((contact) => (
                    <Fragment key={contact.id}>
                        {contact.ctype}
                        <div className={styles.information}>
                            {contact.name}
                        </div>
                    </Fragment>
                ))}
            </div>
        </Page>
    );
}

Component.displayName = 'FieldReportFormDetails';
