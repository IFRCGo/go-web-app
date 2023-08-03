import { Fragment, useContext } from 'react';
import { useParams, generatePath } from 'react-router-dom';
import {
    isDefined,
    isNotDefined,
    isTruthyString,
    listToGroupList,
    listToMap,
    mapToList,
} from '@togglecorp/fujs';
import { CheckboxCircleLineIcon } from '@ifrc-go/icons';

import useTranslation from '#hooks/useTranslation';
import Page from '#components/Page';
import Link from '#components/Link';
import DateOutput from '#components/DateOutput';
import Container from '#components/Container';
import TextOutput from '#components/TextOutput';
import HtmlOutput from '#components/HtmlOutput';
import { useRequest } from '#utils/restRequest';
import { resolveToComponent } from '#utils/translation';
import RouteContext from '#contexts/route';
import ServerEnumsContext from '#contexts/server-enums';
import {
    FIELD_REPORT_STATUS_EARLY_WARNING,
    FIELD_REPORT_STATUS_EVENT,
} from '#utils/constants';
import { joinList } from '#utils/common';
import EarlyWarningNumericDetails from './EarlyWarningNumericDetails';
import EventNumericDetails from './EventNumericDetails';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { fieldReportId } = useParams<{ fieldReportId: string }>();

    const {
        country: countryRoute,
        emergencies: emergenciesRoute,
        fieldReportsFormEdit: fieldReportEditRoute,
    } = useContext(RouteContext);

    const {
        api_region_name,
        api_request_choices,
        api_action_org,
    } = useContext(ServerEnumsContext);

    const regionNameMap = listToMap(
        api_region_name,
        (option) => option.key,
        (option) => option.value,
    );

    const requestChoiceMap = listToMap(
        api_request_choices,
        (option) => option.key,
        (option) => option.value,
    );

    const organizationMap = listToMap(
        api_action_org,
        (option) => option.key,
        (option) => option.value,
    );

    const {
        response: fieldReportResponse,
    } = useRequest({
        skip: isNotDefined(fieldReportId),
        url: '/api/v2/field_report/{id}/',
        pathVariables: {
            id: Number(fieldReportId),
        },
    });

    return (
        <Page
            title={strings.fieldReportDetailsHeading}
            className={styles.fieldReportDetails}
            heading={fieldReportResponse?.summary}
            actions={(
                <Link
                    className={styles.editLink}
                    to={generatePath(
                        fieldReportEditRoute.absolutePath,
                        { fieldReportId },
                    )}
                    variant="secondary"
                >
                    {strings.editReportButtonLabel}
                </Link>
            )}
            descriptionContainerClassName={styles.description}
            description={(
                <>
                    <div className={styles.basicInfo}>
                        <div>
                            {fieldReportResponse?.dtype?.name}
                        </div>
                        <div className={styles.separator} />
                        <div>
                            {fieldReportResponse?.countries?.map((country, i) => (
                                <Fragment key={country.id}>
                                    <Link
                                        className={styles.titleLink}
                                        to={generatePath(
                                            countryRoute.absolutePath,
                                            { countryId: country.id },
                                        )}
                                    >
                                        {country.name}
                                    </Link>
                                    {i < ((fieldReportResponse?.countries?.length ?? 0) - 1) && ', '}
                                </Fragment>
                            ))}
                        </div>
                        <div className={styles.separator} />
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
                    <div className={styles.latestUpdatedDetail}>
                        {resolveToComponent(strings.lastUpdatedByLabel, {
                            user: fieldReportResponse?.user?.username ?? '',
                            date: (
                                <DateOutput
                                    value={fieldReportResponse?.created_at}
                                />
                            ),
                            region: fieldReportResponse?.regions?.map(
                                (region) => (isDefined(region.name)
                                    ? regionNameMap?.[region.name]
                                    : undefined),
                            ).filter(isDefined).join(', ') ?? '',
                            district: fieldReportResponse?.districts?.map((district) => district.name).join(', ') ?? '',
                        })}
                    </div>
                </>
            )}
            mainSectionClassName={styles.content}
        >
            <div className={styles.basicDetails}>
                <TextOutput
                    label={strings.visibilityLabel}
                    value={fieldReportResponse?.visibility_display}
                    strongValue
                />
                <TextOutput
                    label={strings.startDateLabel}
                    value={fieldReportResponse?.start_date}
                    valueType="date"
                    strongValue
                />
                <TextOutput
                    label={strings.reportDateLabel}
                    value={fieldReportResponse?.report_date}
                    valueType="date"
                    strongValue
                />
            </div>
            <Container
                childrenContainerClassName={styles.numericDetails}
                heading={strings.numericDetailsTitle}
                withHeaderBorder
            >
                {fieldReportResponse?.status === FIELD_REPORT_STATUS_EVENT && (
                    <EventNumericDetails
                        value={fieldReportResponse}
                    />
                )}
                {fieldReportResponse?.status === FIELD_REPORT_STATUS_EARLY_WARNING && (
                    <EarlyWarningNumericDetails
                        value={fieldReportResponse}
                    />
                )}
            </Container>
            {fieldReportResponse?.status === FIELD_REPORT_STATUS_EARLY_WARNING && (
                <>
                    <Container
                        heading={strings.notesLabel}
                        withHeaderBorder
                        childrenContainerClassName={styles.requestForAssistanceContent}
                    >
                        <HtmlOutput
                            value={fieldReportResponse?.epi_notes_since_last_fr}
                        />
                    </Container>
                    <Container
                        heading={strings.sourcesForDataMarkedLabel}
                        withHeaderBorder
                        childrenContainerClassName={styles.requestForAssistanceContent}
                    >
                        <HtmlOutput
                            value={fieldReportResponse?.other_sources}
                        />
                    </Container>
                    <Container
                        heading={strings.dateOfData}
                        withHeaderBorder
                        childrenContainerClassName={styles.requestForAssistanceContent}
                    >
                        <DateOutput
                            value={fieldReportResponse?.sit_fields_date}
                        />
                    </Container>
                </>
            )}
            <Container
                childrenContainerClassName={styles.numericDetails}
                heading
            >
                <HtmlOutput
                    value={fieldReportResponse?.description}
                />
            </Container>
            <Container
                heading={strings.requestForAssistanceHeading}
                withHeaderBorder
                childrenContainerClassName={styles.requestForAssistanceContent}
            >
                <TextOutput
                    label={strings.governmentAssistanceLabel}
                    value={fieldReportResponse?.request_assistance}
                    valueType="boolean"
                    strongValue
                />
                <TextOutput
                    label={strings.nsAssistanceLabel}
                    value={fieldReportResponse?.ns_request_assistance}
                    valueType="boolean"
                    strongValue
                />
            </Container>
            <Container
                heading={strings.informationBulletinPublishedLabel}
                withHeaderBorder
            >
                {fieldReportResponse && isDefined(fieldReportResponse.bulletin)
                    ? requestChoiceMap?.[fieldReportResponse?.bulletin]
                    : undefined}
            </Container>
            {fieldReportResponse?.actions_taken?.map(
                (actionTaken) => (
                    <Container
                        key={actionTaken.id}
                        heading={resolveToComponent(
                            strings.actionsTakenHeading,
                            { organization: organizationMap?.[actionTaken.organization] },
                        )}
                        withHeaderBorder
                        className={styles.actionsTaken}
                    >
                        {mapToList(listToGroupList(actionTaken?.actions, (d) => d.category ?? ''))?.map(
                            (value) => (
                                <div className={styles.actionList}>
                                    {value?.map(
                                        (action) => (
                                            <div
                                                key={action.id}
                                                className={styles.actionCategory}
                                            >
                                                <CheckboxCircleLineIcon className={styles.icon} />
                                                <div className={styles.label}>
                                                    {action.name}
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            ),
                        )}
                        {actionTaken.summary}
                    </Container>
                ),
            )}
            <Container
                heading={strings.contactTitle}
                withHeaderBorder
                childrenContainerClassName={styles.contactList}
            >
                {fieldReportResponse?.contacts?.map((contact) => (
                    <div
                        key={contact.id}
                        className={styles.contact}
                    >
                        <div className={styles.type}>
                            {contact.ctype}
                        </div>
                        <div className={styles.information}>
                            {joinList([
                                isTruthyString(contact.name) ? contact.name : undefined,
                                isTruthyString(contact.title) ? contact.title : undefined,
                                isTruthyString(contact.email) ? (
                                    <Link
                                        to={`mailto:${contact.email}`}
                                    >
                                        {contact.email}
                                    </Link>
                                ) : undefined,
                            ].filter(isDefined), ', ')}
                        </div>
                    </div>
                ))}
            </Container>
            <Container
                heading={strings.externalPartnersSupportedActivitiesLabel}
                withHeaderBorder
            >
                {fieldReportResponse?.external_partners.map(
                    (partner) => (
                        <div key={partner.id}>
                            {partner?.name}
                        </div>
                    ),
                )}
            </Container>
        </Page>
    );
}

Component.displayName = 'FieldReportDetails';
