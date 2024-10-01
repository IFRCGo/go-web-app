import {
    Fragment,
    useMemo,
} from 'react';
import { useParams } from 'react-router-dom';
import { CheckboxCircleLineIcon } from '@ifrc-go/icons';
import {
    Container,
    DateOutput,
    HtmlOutput,
    Message,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    joinList,
    resolveToComponent,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isFalsyString,
    isNotDefined,
    isTruthyString,
    listToGroupList,
    listToMap,
    mapToList,
} from '@togglecorp/fujs';

import DetailsFailedToLoadMessage from '#components/domain/DetailsFailedToLoadMessage';
import GoBreadcrumbs from '#components/GoBreadcrumbs';
import Link, { type InternalLinkProps } from '#components/Link';
import Page from '#components/Page';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import {
    type CategoryType,
    DISASTER_TYPE_EPIDEMIC,
    FIELD_REPORT_STATUS_EARLY_WARNING,
    type ReportType,
} from '#utils/constants';
import { getUserName } from '#utils/domain/user';
import { useRequest } from '#utils/restRequest';

import CovidNumericDetails from './CovidNumericDetails';
import EarlyWarningNumericDetails from './EarlyWarningNumericDetails';
import EpidemicNumericDetails from './EpidemicNumericDetails';
import EventNumericDetails from './EventNumericDetails';

import i18n from './i18n.json';
import styles from './styles.module.css';

type BreadcrumbsDataType = {
        to: InternalLinkProps['to'];
        label: string;
        urlParams?: Record<string, string | number | null | undefined>;
};

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { fieldReportId } = useParams<{ fieldReportId: string }>();

    const {
        api_region_name,
        api_action_org,
        api_field_report_bulletin,
        api_request_choices,
    } = useGlobalEnums();

    const requestChoicesMap = listToMap(
        api_request_choices,
        // NOTE: we are converting the type of option.key to number
        (option) => Number(option.key),
        (option) => option.value,
    );

    const regionNameMap = listToMap(
        api_region_name,
        (option) => option.key,
        (option) => option.value,
    );

    const bulletinMap = listToMap(
        api_field_report_bulletin,
        (option) => option.key,
        (option) => option.value,
    );

    const organizationMap = listToMap(
        api_action_org,
        (option) => option.key,
        (option) => option.value,
    );

    const {
        pending: fetchingFieldReport,
        response: fieldReportResponse,
        error: fieldReportResponseError,
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
    const eventDetails = fieldReportResponse?.event_details;
    const summary = fieldReportResponse?.summary;
    const contacts = fieldReportResponse?.contacts;
    const requestAssistance = fieldReportResponse?.request_assistance;
    const nsRequestAssistance = fieldReportResponse?.ns_request_assistance;
    const visibility = fieldReportResponse?.visibility_display;
    const startDate = fieldReportResponse?.start_date;
    const otherSources = fieldReportResponse?.other_sources;
    const description = fieldReportResponse?.description;
    const actionsOthers = fieldReportResponse?.actions_others;
    const sources = fieldReportResponse?.sources;

    // NOTE: Only in EPIDEMIC or EVENT or EARLY WARNING

    const bulletin = fieldReportResponse?.bulletin;

    // NOTE: Only in EPIDEMIC or COVID

    const epiNotesSinceLastFr = fieldReportResponse?.epi_notes_since_last_fr;
    const sitFieldsDate = fieldReportResponse?.sit_fields_date;

    // NOTE: Only in COVID
    const externalPartners = fieldReportResponse?.external_partners_details;
    const supportedActivities = fieldReportResponse?.supported_activities_details;
    const notesHealth = fieldReportResponse?.notes_health;
    const notesNs = fieldReportResponse?.notes_ns;
    const notesSocioeco = fieldReportResponse?.notes_socioeco;
    const dref = fieldReportResponse?.dref;
    const appeal = fieldReportResponse?.appeal;
    const fact = fieldReportResponse?.fact;
    const ifrcStaff = fieldReportResponse?.ifrc_staff;

    // NOTE: Only in EW

    const forecastBasedAction = fieldReportResponse?.forecast_based_action;
    // const forecastBasedResponse: number | undefined = fieldReportResponse
    //     ?.forecast_based_response;

    // NOTE: Not coming from form
    const regions = fieldReportResponse?.regions_details;
    const reportDate = fieldReportResponse?.report_date;

    const user = getUserName(fieldReportResponse?.user_details);

    const lastTouchedAt = fieldReportResponse?.updated_at ?? fieldReportResponse?.created_at;
    const rdrt = fieldReportResponse?.rdrt;
    const epiSources = fieldReportResponse?.epi_figures_source_display;

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

    const plannedResponses = [
        {
            key: 'dref',
            title: strings.fieldReportDREFTitle,
            value: reportType !== 'COVID' ? dref : undefined,
        },
        {
            key: 'appeal',
            title: strings.fieldReportEmergencyAppealTitle,
            value: reportType !== 'COVID' ? appeal : undefined,
        },
        {
            key: 'rdrt',
            title: strings.fieldReportRDRTTitle,
            // FIXME: We do not know when to hide this field
            value: rdrt,
        },
        {
            key: 'fact',
            title: strings.fieldReportRapidResponseTitle,
            value: reportType !== 'COVID' ? fact : undefined,
        },
        {
            key: 'ifrc-staff',
            title: strings.fieldReportEmergencyResponseTitle,
            value: reportType !== 'COVID' ? ifrcStaff : undefined,
        },
        /*
        {
            key: 'forecast-based-response',
            title: 'Forecast Based Response',
            // FIXME: We do not know when to hide this field
            value: forecastBasedResponse,
        },
        */
        {
            key: 'forecast-based-action',
            title: strings.fieldReportForecastBasedTitle,
            value: reportType === 'EW' ? forecastBasedAction : undefined,
        },
    ].filter((plannedResponse) => isDefined(plannedResponse.value) && plannedResponse.value !== 0);

    const breadCrumbsData: BreadcrumbsDataType[] = useMemo(() => ([
        {
            to: 'home',
            label: strings.home,
        },
        {
            to: 'emergencies',
            label: strings.emergencies,
        },
        {
            to: 'fieldReportDetails',
            label: fieldReportResponse?.summary ?? '-',
            urlParams: {
                fieldReportId,
            },
        },
    ]), [
        strings.home,
        strings.emergencies,
        fieldReportResponse?.summary,
        fieldReportId,
    ]);

    // FIXME: Translation Warning Banner should be shown

    const shouldHideDetails = fetchingFieldReport
        || isDefined(fieldReportResponseError);

    return (
        <Page
            title={strings.fieldReportTitle}
            className={styles.fieldReportDetails}
            heading={shouldHideDetails ? strings.fieldReportDefaultHeading : summary}
            breadCrumbs={(
                <GoBreadcrumbs routeData={breadCrumbsData} />
            )}
            actions={(
                <Link
                    className={styles.editLink}
                    to="fieldReportFormEdit"
                    urlParams={{ fieldReportId }}
                    variant="secondary"
                    disabled={shouldHideDetails}
                >
                    {strings.editReportButtonLabel}
                </Link>
            )}
            descriptionContainerClassName={styles.description}
            description={!shouldHideDetails && (
                <>
                    <div className={styles.basicInfo}>
                        <span>
                            {disasterType}
                        </span>
                        <span className={styles.separator} />
                        <span>
                            {countries?.map((country, i) => (
                                <Fragment key={country.id}>
                                    <Link
                                        className={styles.titleLink}
                                        to="countriesLayout"
                                        urlParams={{ countryId: country.id }}
                                    >
                                        {country.name}
                                    </Link>
                                    {i !== countries.length - 1 ? ', ' : null}
                                </Fragment>
                            ))}
                        </span>
                        {eventDetails && (
                            <>
                                <span className={styles.separator} />
                                <Link
                                    className={styles.titleLink}
                                    to="emergenciesLayout"
                                    urlParams={{ emergencyId: eventDetails.id }}
                                >
                                    {eventDetails.name}
                                </Link>
                            </>
                        )}
                    </div>
                    <div className={styles.latestUpdatedDetail}>
                        {resolveToComponent(strings.lastUpdatedByLabel, {
                            user: user || '--',
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
                                .join(', ') || '--',
                            district: districts
                                ?.map((district) => district.name)
                                .join(', ') || '--',
                        })}
                    </div>
                </>
            )}
            mainSectionClassName={styles.content}
            contentOriginalLanguage={fieldReportResponse?.translation_module_original_language}
        >
            {fetchingFieldReport && (
                <Message
                    pending
                />
            )}
            {isDefined(fieldReportResponseError) && (
                <DetailsFailedToLoadMessage
                    description={fieldReportResponseError.value.messageForNotification}
                />
            )}
            {!shouldHideDetails && (
                <>
                    <div className={styles.basicDetails}>
                        <TextOutput
                            label={strings.visibilityLabel}
                            value={visibility}
                            strongValue
                        />
                        {reportType === 'EW' ? (
                            <TextOutput
                                label={strings.forecastedDateLabel}
                                value={startDate}
                                valueType="date"
                                strongValue
                            />
                        ) : (
                            <TextOutput
                                label={strings.startDateLabel}
                                value={startDate}
                                valueType="date"
                                strongValue
                            />
                        )}
                        <TextOutput
                            label={strings.reportDateLabel}
                            value={reportDate}
                            valueType="date"
                            strongValue
                        />
                        {reportType === 'COVID' && (
                            <TextOutput
                                label={strings.covidFieldReportLabel}
                                value
                                valueType="boolean"
                                strongValue
                            />
                        )}
                    </div>
                    <Container
                        childrenContainerClassName={styles.numericDetails}
                        heading={strings.numericDetailsTitle}
                        withHeaderBorder
                        headerDescription={(
                            <>
                                {(reportType === 'EPI' || reportType === 'COVID') && isTruthyString(sitFieldsDate) && (
                                    <TextOutput
                                        label={strings.dateOfData}
                                        value={sitFieldsDate}
                                        valueType="date"
                                    />
                                )}
                                {(reportType === 'EPI' || reportType === 'COVID') && isTruthyString(epiSources) && (
                                    <TextOutput
                                        label={strings.epiSource}
                                        value={epiSources}
                                    />
                                )}
                                {/* FIXME: We need to add more content here */}
                                <div />
                            </>
                        )}
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
                    {/* NOTE: there was no condition in old details */}
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

                    {isTruthyString(description) && (
                        <Container
                            heading={reportType === 'EW' ? strings.riskAnalysisTitle : strings.descriptionTitle}
                            withHeaderBorder
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
                            {bulletinMap?.[bulletin] ?? '--'}
                        </Container>
                    )}
                    {actionsTaken?.map((actionTaken) => {
                        if (
                            actionTaken.actions_details.length <= 0
                            && isFalsyString(actionTaken.summary)
                        ) {
                            return null;
                        }

                        const actionsGroupedByCategory = listToGroupList(
                            actionTaken.actions_details,
                            (item) => item.category ?? '<no-key>',
                            (item) => item,
                        );
                        const categoryItems = mapToList(
                            actionsGroupedByCategory,
                            (item, key) => ({
                                category: key as CategoryType,
                                actions: item,
                            }),
                        );

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
                                {categoryItems?.map((value) => (
                                    <Container
                                        key={value.category}
                                        heading={value.category}
                                        headingLevel={5}
                                        spacing="compact"
                                    >
                                        {value.actions.map((action) => (
                                            <div
                                                key={action.id}
                                                className={styles.actionCategory}
                                            >
                                                <CheckboxCircleLineIcon className={styles.icon} />
                                                <div className={styles.label}>
                                                    {action.name}
                                                </div>
                                            </div>
                                        ))}
                                        {reportType === 'COVID' && value.category === 'Health' && (
                                            <TextOutput
                                                label={strings.fieldReportDetailsNotes}
                                                value={notesHealth}
                                            />
                                        )}
                                        {reportType === 'COVID' && value.category === 'NS Institutional Strengthening' && (
                                            <TextOutput
                                                label={strings.fieldReportDetailsNotes}
                                                value={notesNs}
                                            />
                                        )}
                                        {reportType === 'COVID' && value.category === 'Socioeconomic Interventions' && (
                                            <TextOutput
                                                label={strings.fieldReportDetailsNotes}
                                                value={notesSocioeco}
                                            />
                                        )}
                                    </Container>
                                ))}
                                <TextOutput
                                    label={strings.fieldReportDetailsSummary}
                                    value={actionTaken.summary}
                                />
                            </Container>
                        );
                    })}
                    {isTruthyString(actionsOthers) && (
                        <Container
                            heading={strings.actionsTakenByOthersHeading}
                            withHeaderBorder
                        >
                            <HtmlOutput
                                value={actionsOthers}
                            />
                        </Container>
                    )}
                    {/* NOTE: There was not condition on old details */}
                    {isDefined(externalPartners) && externalPartners.length > 0 && reportType === 'COVID' && (
                        <Container
                            heading={strings.externalPartnersLabel}
                            withHeaderBorder
                        >
                            <ul>
                                {externalPartners.map((partner) => (
                                    <li key={partner.id}>
                                        {partner?.name || '--'}
                                    </li>
                                ))}
                            </ul>
                        </Container>
                    )}
                    {/* NOTE: There was not condition on old details */}
                    {isDefined(supportedActivities) && supportedActivities.length > 0 && reportType === 'COVID' && (
                        <Container
                            heading={strings.supportedActivitiesLabel}
                            withHeaderBorder
                        >
                            <ul>
                                {supportedActivities.map((supportedActivity) => (
                                    <li key={supportedActivity.id}>
                                        {supportedActivity?.name || '--'}
                                    </li>
                                ))}
                            </ul>
                        </Container>
                    )}
                    {plannedResponses.length > 0 && (
                        <Container
                            heading={strings.plannedResponsesLabel}
                            withHeaderBorder
                        >
                            {plannedResponses.map((plannedResponse) => (
                                <TextOutput
                                    key={plannedResponse.key}
                                    label={plannedResponse.title}
                                    value={isDefined(plannedResponse.value)
                                        ? requestChoicesMap?.[plannedResponse.value]
                                        : undefined}
                                />
                            ))}
                        </Container>
                    )}
                    {isDefined(sources) && sources.length > 0 && (
                        <Container
                            heading={strings.sourcesTitle}
                            withHeaderBorder
                        >
                            {sources.map((source) => (
                                <TextOutput
                                    key={source.id}
                                    label={source.stype}
                                    value={source.spec}
                                />
                            ))}
                        </Container>
                    )}
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
                                        {joinList([
                                            isTruthyString(contact.name)
                                                ? contact.name
                                                : undefined,
                                            isTruthyString(contact.title)
                                                ? contact.title
                                                : undefined,
                                            isTruthyString(contact.email) ? (
                                                <Link
                                                    href={`mailto:${contact.email}`}
                                                    external
                                                >
                                                    {contact.email}
                                                </Link>
                                            ) : undefined,
                                            isTruthyString(contact.phone) ? (
                                                <Link
                                                    href={`tel:${contact.phone}`}
                                                    external
                                                >
                                                    {contact.phone}
                                                </Link>
                                            ) : undefined,
                                        ].filter(isDefined), ', ')}
                                    </div>
                                </div>
                            ))}
                        </Container>
                    )}
                </>
            )}
        </Page>
    );
}

Component.displayName = 'FieldReportDetails';
