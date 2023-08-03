import { Fragment, useContext, useMemo } from 'react';
import { useParams, generatePath } from 'react-router-dom';
import {
    isDefined,
    isNotDefined,
    isTruthyString,
    isFalsyString,
    listToMap,
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
import {
    FIELD_REPORT_STATUS_EARLY_WARNING,
    DISASTER_TYPE_EPIDEMIC,
    type ReportType,
} from '#utils/constants';
import { joinList } from '#utils/common';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';

import EarlyWarningNumericDetails from './EarlyWarningNumericDetails';
import CovidNumericDetails from './CovidNumericDetails';
import EpidemicNumericDetails from './EpidemicNumericDetails';
import EventNumericDetails from './EventNumericDetails';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { fieldReportId } = useParams<{ fieldReportId: string }>();

    const {
        country: countryRoute,
        // FIXME: need to change to emergency page
        emergencies: emergenciesRoute,
        fieldReportFormEdit: fieldReportEditRoute,
    } = useContext(RouteContext);

    const {
        api_region_name,
        api_request_choices,
        api_action_org,
    } = useGlobalEnums();

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
        url: '/api/v2/field-report/{id}/',
        pathVariables: {
            id: Number(fieldReportId),
        },
    });

    // ALWAYS

    const disasterType = fieldReportResponse?.dtype_details?.name;
    const actionsTaken = fieldReportResponse?.actions_taken;
    const countries = fieldReportResponse?.countries_details;
    const districts = fieldReportResponse?.districts_details;
    const event = fieldReportResponse?.event;
    const summary = fieldReportResponse?.summary;
    const contacts = fieldReportResponse?.contacts;
    const requestAssistance = fieldReportResponse?.request_assistance;
    const nsRequestAssistance = fieldReportResponse?.ns_request_assistance;
    const visibility = fieldReportResponse?.visibility_display;
    const startDate = fieldReportResponse?.start_date;
    const otherSources = fieldReportResponse?.other_sources;
    const description = fieldReportResponse?.description;

    // NOTE: Only in EPIDEMIC or EVENT or EARLY WARNING

    const bulletin = fieldReportResponse?.bulletin;

    // NOTE: Only in EPIDEMIC or COVID

    const epiNotesSinceLastFr = fieldReportResponse?.epi_notes_since_last_fr;
    const sitFieldsDate = fieldReportResponse?.sit_fields_date;

    // NOTE: Only in COVID
    const externalPartners = fieldReportResponse?.external_partners_details;

    // NOTE: Not coming from form
    const regions = fieldReportResponse?.regions_details;
    const reportDate = fieldReportResponse?.report_date;
    const user = fieldReportResponse?.user_details?.username;
    const lastTouchedAt = fieldReportResponse?.updated_at ?? fieldReportResponse?.created_at;

    const reportType: ReportType = useMemo(() => {
        if (fieldReportResponse?.status === FIELD_REPORT_STATUS_EARLY_WARNING) {
            return 'EW';
        }

        if (fieldReportResponse?.is_covid_report) {
            return 'COVID';
        }

        if (fieldReportResponse?.dtype === DISASTER_TYPE_EPIDEMIC) {
            return 'EPI';
        }

        return 'EVT';
    }, [fieldReportResponse]);

    // FIXME: Translation Warning Banner should be shown

    return (
        <Page
            title={strings.fieldReportDetailsHeading}
            className={styles.fieldReportDetails}
            heading={summary}
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
                            {disasterType}
                        </div>
                        <div className={styles.separator} />
                        <div>
                            {countries?.map((country, i) => (
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
                                    {i !== countries.length - 1 ? ', ' : null}
                                </Fragment>
                            ))}
                        </div>
                        <div className={styles.separator} />

                        <Link
                            className={styles.titleLink}
                            to={isDefined(event)
                                ? generatePath(
                                    emergenciesRoute.absolutePath,
                                    { emergencyId: event },
                                )
                                : undefined}
                        >
                            {/* FIXME: Shouldn't this be event name? */}
                            {summary}
                        </Link>
                    </div>
                    <div className={styles.latestUpdatedDetail}>
                        {resolveToComponent(strings.lastUpdatedByLabel, {
                            user: user || '?',
                            date: (
                                <DateOutput
                                    value={lastTouchedAt}
                                />
                            ),
                            region: regions
                                ?.map((region) => (
                                    isDefined(region.name)
                                        ? regionNameMap?.[region.name]
                                        : undefined
                                ))
                                .filter(isDefined)
                                .join(', ') || '?',
                            district: districts
                                ?.map((district) => district.name)
                                .join(', ') || '?',
                        })}
                    </div>
                </>
            )}
            mainSectionClassName={styles.content}
        >
            <div className={styles.basicDetails}>
                <TextOutput
                    label={strings.visibilityLabel}
                    value={visibility}
                    strongValue
                />
                <TextOutput
                    label={strings.startDateLabel}
                    value={startDate}
                    valueType="date"
                    strongValue
                />
                <TextOutput
                    label={strings.reportDateLabel}
                    value={reportDate}
                    valueType="date"
                    strongValue
                />
            </div>
            <Container
                childrenContainerClassName={styles.numericDetails}
                heading={strings.numericDetailsTitle}
                withHeaderBorder
            >
                {reportType === 'COVID' && (
                    <CovidNumericDetails
                        value={fieldReportResponse}
                    />
                )}
                {reportType === 'EPI' && (
                    <EpidemicNumericDetails
                        value={fieldReportResponse}
                    />
                )}
                {reportType === 'EVT' && (
                    <EventNumericDetails
                        value={fieldReportResponse}
                    />
                )}
                {reportType === 'EW' && (
                    <EarlyWarningNumericDetails
                        value={fieldReportResponse}
                    />
                )}
            </Container>
            {/* FIXME: there was no condition in old details */}
            {(reportType === 'EPI' || reportType === 'COVID') && isTruthyString(epiNotesSinceLastFr) && (
                <Container
                    heading={strings.notesLabel}
                    withHeaderBorder
                    childrenContainerClassName={styles.requestForAssistanceContent}
                >
                    <HtmlOutput
                        value={epiNotesSinceLastFr}
                    />
                </Container>
            )}
            {isTruthyString(otherSources) && (
                <Container
                    heading={strings.sourcesForDataMarkedLabel}
                    withHeaderBorder
                    childrenContainerClassName={styles.requestForAssistanceContent}
                >
                    <HtmlOutput
                        value={otherSources}
                    />
                </Container>
            )}
            {/* NOTE: In old, only COVID was checked */}
            {(reportType === 'EPI' || reportType === 'COVID') && isTruthyString(sitFieldsDate) && (
                <Container
                    heading={strings.dateOfData}
                    withHeaderBorder
                    childrenContainerClassName={styles.requestForAssistanceContent}
                >
                    <DateOutput
                        value={sitFieldsDate}
                    />
                </Container>
            )}
            {isTruthyString(description) && (
                <Container
                    childrenContainerClassName={styles.numericDetails}
                    heading
                >
                    <HtmlOutput
                        value={description}
                    />
                </Container>
            )}
            <Container
                heading={strings.requestForAssistanceHeading}
                withHeaderBorder
                childrenContainerClassName={styles.requestForAssistanceContent}
            >
                <TextOutput
                    label={strings.governmentAssistanceLabel}
                    value={requestAssistance}
                    valueType="boolean"
                    strongValue
                />
                <TextOutput
                    label={strings.nsAssistanceLabel}
                    value={nsRequestAssistance}
                    valueType="boolean"
                    strongValue
                />
            </Container>
            {isDefined(bulletin) && reportType !== 'COVID' && (
                <Container
                    heading={strings.informationBulletinPublishedLabel}
                    withHeaderBorder
                >
                    {requestChoiceMap?.[bulletin] ?? '--'}
                </Container>
            )}
            {/* FIXME: iterate by NTLS, FDRN, PNS */}
            {/* FIXME: display in that order */}
            {/* FIXME: then group by category */}
            {/* FIXME: show notes using data.notes_health, data.notes_ns and data.notes_socioeco */}
            {/* FIXME: weird logic to show category and action name */}
            {actionsTaken?.map((actionTaken) => {
                if (actionTaken.actions_details.length <= 0 || isFalsyString(actionTaken.summary)) {
                    return null;
                }
                return (
                    <Container
                        key={actionTaken.id}
                        heading={resolveToComponent(
                            strings.actionsTakenHeading,
                            { organization: organizationMap?.[actionTaken.organization] },
                        )}
                        withHeaderBorder
                        className={styles.actionsTaken}
                    >
                        {actionTaken.actions_details?.map((value) => (
                            <div
                                key={value.id}
                                className={styles.actionCategory}
                            >
                                <CheckboxCircleLineIcon className={styles.icon} />
                                <div className={styles.label}>
                                    {value.name}
                                </div>
                            </div>
                        ))}
                        {actionTaken.summary}
                    </Container>
                );
            })}
            {/* FIXME: actions_other missing */}
            {isDefined(contacts) && contacts.length > 0 && (
                <Container
                    heading={strings.contactTitle}
                    withHeaderBorder
                    childrenContainerClassName={styles.contactList}
                >
                    {contacts?.map((contact) => (
                        <div
                            key={contact.id}
                            className={styles.contact}
                        >
                            <div className={styles.type}>
                                {contact.ctype}
                            </div>
                            <div className={styles.information}>
                                {/* FIXME: We can skip joinList */}
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
            )}
            {/* FIXME: There was not condition on external partners */}
            {isDefined(externalPartners) && externalPartners.length > 0 && reportType === 'COVID' && (
                <Container
                    heading={strings.externalPartnersSupportedActivitiesLabel}
                    withHeaderBorder
                >
                    {externalPartners.map((partner) => (
                        <div key={partner.id}>
                            {partner?.name}
                        </div>
                    ))}
                </Container>
            )}
            {/* FIXME: dref, appeal, rdrt, fact, ifrc_staff, forecast_based_response,
            forecast_based_action missing  */}
            {/* FIXME: supported_activities missing */}
            {/* FIXME: sources missing */}
        </Page>
    );
}

Component.displayName = 'FieldReportDetails';
