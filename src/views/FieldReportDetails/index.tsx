import { Fragment } from 'react';

import { useParams } from 'react-router-dom';
import { isNotDefined } from '@togglecorp/fujs';
import { useRequest } from '#utils/restRequest';

import type { paths } from '#generated/types';
import useTranslation from '#hooks/useTranslation';
import Page from '#components/Page';
import Link from '#components/Link';
import Header from '#components/Header';
import DateOutput from '#components/DateOutput';
import TextOutput from '#components/TextOutput';

import i18n from './i18n.json';
import styles from './styles.module.css';

type FieldReportResponse = paths['/api/v2/field_report/{id}/']['get']['responses']['200']['content']['application/json'];

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { fieldReportId } = useParams<{ fieldReportId: string }>();

    const {
        response: fieldReportResponse,
    } = useRequest<FieldReportResponse>({
        skip: isNotDefined(fieldReportId),
        url: '/api/v2/field_report/{id}/',
        pathVariables: {
            id: fieldReportId,
        },
    });
    const countries = fieldReportResponse?.countries;
    const country = (countries ?? [])[0];

    return (
        <Page
            mainSectionClassName={styles.fieldReportDetails}
        >
            <Header
                heading={fieldReportResponse?.summary}
                headingLevel={1}
            />
            <div className={styles.fieldReportSubtitle}>
                {strings.populationMovementSubtitle}
                {country
                    && (
                        <Link
                            className={styles.titleLink}
                            to={`/countries/${country.id}#operations`}
                        >
                            {country.name}
                        </Link>
                    )}
                |
                <Link
                    className={styles.titleLink}
                    to={`/emergencies/${fieldReportResponse?.event?.id}`}
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
            <div className={styles.keyFigures}>
                <div className={styles.keyFigure}>
                    {strings.lastUpdatedByLabel}
                    {fieldReportResponse?.user?.username}
                    {strings.onLabel}
                    <DateOutput
                        value={fieldReportResponse?.created_at}
                        format="dd-MM-yyyy"
                    />
                    (
                    {fieldReportResponse?.regions?.map((region) => region.name).join(',')}
                    -
                    {fieldReportResponse?.districts?.map((district) => district.name).join(',')}
                    )
                </div>
                <Header
                    heading={strings.numericDetailsTitle}
                    headingLevel={3}
                />
                <div className={styles.fieldReportDetail}>
                    <TextOutput
                        labelClassName={styles.fieldReportLabel}
                        label={strings.injuredRCLabel}
                        value={fieldReportResponse?.num_injured}
                    />
                    <TextOutput
                        labelClassName={styles.fieldReportLabel}
                        label={strings.missingGovernmentLabel}
                        value={fieldReportResponse?.gov_num_injured}
                    />
                    <TextOutput
                        labelClassName={styles.fieldReportLabel}
                        label={strings.injuredOtherLabel}
                        value={fieldReportResponse?.other_num_injured}
                    />
                    <TextOutput
                        labelClassName={styles.fieldReportLabel}
                        label={strings.missingOtherFirstLabel}
                        value={fieldReportResponse?.num_missing}
                    />
                    <TextOutput
                        labelClassName={styles.fieldReportLabel}
                        label={strings.missingGovernmentLabel}
                        value={fieldReportResponse?.gov_num_missing}
                    />
                    <TextOutput
                        labelClassName={styles.fieldReportLabel}
                        label={strings.missingOtherSecondLabel}
                        value={fieldReportResponse?.other_num_missing}
                    />
                    <TextOutput
                        labelClassName={styles.fieldReportLabel}
                        label={strings.deadOtherFirstLabel}
                        value={fieldReportResponse?.num_dead}
                    />
                    <TextOutput
                        labelClassName={styles.fieldReportLabel}
                        label={strings.deadGovernmentLabel}
                        value={fieldReportResponse?.gov_num_dead}
                    />
                    <TextOutput
                        labelClassName={styles.fieldReportLabel}
                        label={strings.deadOtherSecondLabel}
                        value={fieldReportResponse?.other_num_dead}
                    />
                    <TextOutput
                        labelClassName={styles.fieldReportLabel}
                        label={strings.displacedRCLabel}
                        value={fieldReportResponse?.num_displaced}
                    />
                    <TextOutput
                        labelClassName={styles.fieldReportLabel}
                        label={strings.displacedGovernmentLabel}
                        value={fieldReportResponse?.gov_num_displaced}
                    />
                    <TextOutput
                        labelClassName={styles.fieldReportLabel}
                        label={strings.displacedGovernmentLabel}
                        value={fieldReportResponse?.other_num_displaced}
                    />
                    <TextOutput
                        labelClassName={styles.fieldReportLabel}
                        label={strings.affectedRCLabel}
                        value={fieldReportResponse?.num_displaced}
                    />
                    <TextOutput
                        labelClassName={styles.fieldReportLabel}
                        label={strings.affectedGovernmentLabel}
                        value={fieldReportResponse?.gov_num_displaced}
                    />
                    <TextOutput
                        labelClassName={styles.fieldReportLabel}
                        label={strings.affectedOtherLabel}
                        value={fieldReportResponse?.other_num_displaced}
                    />
                    <TextOutput
                        labelClassName={styles.fieldReportLabel}
                        label={strings.assistedRCLabel}
                        value={fieldReportResponse?.num_assisted}
                    />
                    <TextOutput
                        labelClassName={styles.fieldReportLabel}
                        label={strings.assistedGovernmentLabel}
                        value={fieldReportResponse?.gov_num_assisted}
                    />
                    <TextOutput
                        labelClassName={styles.fieldReportLabel}
                        label={strings.assistedOtherLabel}
                        value={fieldReportResponse?.other_num_assisted}
                    />
                    <TextOutput
                        labelClassName={styles.fieldReportLabel}
                        label={strings.localStaffLabel}
                        value={fieldReportResponse?.num_localstaff}
                    />
                    <TextOutput
                        labelClassName={styles.fieldReportLabel}
                        label={strings.volunteersLabel}
                        value={fieldReportResponse?.num_volunteers}
                    />
                    <TextOutput
                        labelClassName={styles.fieldReportLabel}
                        label={strings.ifrcStaffLabel}
                        value={fieldReportResponse?.ifrc_staff}
                    />
                    <TextOutput
                        labelClassName={styles.fieldReportLabel}
                        label={strings.delegatedLabel}
                        value={fieldReportResponse?.num_expats_delegates}
                    />
                </div>
                <Header
                    heading={strings.descriptionTitle}
                    headingLevel={3}
                />
                <div className={styles.descriptionDetails}>
                    <TextOutput
                        className={styles.descriptionValue}
                        labelClassName={styles.descriptionLabel}
                        label={strings.visibilityLabel}
                        value={fieldReportResponse?.visibility_display}
                    />
                    <TextOutput
                        className={styles.descriptionValue}
                        labelClassName={styles.descriptionLabel}
                        label={strings.startDateLabel}
                        value={fieldReportResponse?.start_date}
                        valueType="date"
                    />
                    <TextOutput
                        className={styles.descriptionValue}
                        labelClassName={styles.descriptionLabel}
                        label={strings.reportDateLabel}
                        value={fieldReportResponse?.report_date}
                        valueType="date"
                    />
                </div>
                <Header
                    heading={strings.requestForAssistanceHeading}
                    headingLevel={4}
                />
                <TextOutput
                    className={styles.assistanceValue}
                    labelClassName={styles.assistanceLabel}
                    label={strings.governmentRequestsInternationalAssistanceLabel}
                    value={fieldReportResponse?.request_assistance}
                />
                <TextOutput
                    className={styles.assistanceValue}
                    labelClassName={styles.assistanceLabel}
                    label={strings.nSRequestsInternationalAssistanceLabel}
                    value={fieldReportResponse?.ns_request_assistance}
                />
                <Header
                    heading={strings.informationBulletinPublishedLabel}
                    headingLevel={4}
                />
                <div className={styles.information}>
                    {fieldReportResponse?.bulletin}
                </div>
                <Header
                    heading={strings.externalPartnersSupportedActivitiesLabel}
                    headingLevel={4}
                />
                <Header
                    heading={strings.contactTitle}
                    headingLevel={4}
                />
                {fieldReportResponse?.contacts?.map((contact) => (
                    <Fragment key={contact.id}>
                        <Header
                            heading={contact.ctype}
                            headingLevel={4}
                        />
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
