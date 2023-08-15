import {
    useState,
    useContext,
    useCallback,
    useMemo,
    useRef,
    ElementRef,
} from 'react';
import {
    useParams,
    useNavigate,
    generatePath,
} from 'react-router-dom';
import {
    isDefined,
    isNotDefined,
    isFalsyString,
    listToGroupList,
    isTruthyString,
} from '@togglecorp/fujs';
import {
    useForm,
    createSubmitHandler,
    removeNull,
} from '@togglecorp/toggle-form';

import { useRequest, useLazyRequest } from '#utils/restRequest';
import Button from '#components/Button';
import NonFieldError from '#components/NonFieldError';
import Tab from '#components/Tabs/Tab';
import Tabs from '#components/Tabs';
import TabList from '#components/Tabs/TabList';
import TabPanel from '#components/Tabs/TabPanel';
import Page from '#components/Page';
import RouteContext from '#contexts/route';
import useAlert from '#hooks/useAlert';
import useTranslation from '#hooks/useTranslation';
import useCountryRaw from '#hooks/domain/useCountryRaw';
import useDisasterType from '#hooks/domain/useDisasterType';

import { type DistrictItem } from '#components/domain/DistrictSearchMultiSelectInput';
import { type EventItem } from '#components/domain/EventElasticSearchSelectInput';

import ContextFields from './ContextFields';
import RiskAnalysisFields from './RiskAnalysisFields';
import SituationFields from './SituationFields';
import EarlyActionsFields from './EarlyActionsFields';
import ActionsFields from './ActionsFields';
import ResponseFields from './ResponseFields';

import {
    reportSchema,
    transformAPIFieldsToFormFields,
    transformFormFieldsToAPIFields,
    type Status,
    type ReportType,
    type FieldReportBody,
    type PartialFormValue,
    type FormValue,
    type OrganizationType,
    STATUS_EARLY_WARNING,
    STATUS_EVENT,
    VISIBILITY_PUBLIC,
    BULLETIN_PUBLISHED_NO,
    DISASTER_TYPE_EPIDEMIC,
} from './common';
import styles from './styles.module.css';
import i18n from './i18n.json';

type TabKeys = 'context' | 'situation' | 'risk-analysis' | 'actions' | 'early-actions' | 'response';


function getNextStep(current: TabKeys, direction: 1 | -1, status: Status | undefined) {
    if (status === STATUS_EVENT && direction === 1) {
        const mapping: { [key in TabKeys]?: TabKeys } = {
            context: 'situation',
            situation: 'actions',
            actions: 'response',
        };
        return mapping[current];
    }
    if (status === STATUS_EVENT && direction === -1) {
        const mapping: { [key in TabKeys]?: TabKeys } = {
            response: 'actions',
            actions: 'situation',
            situation: 'context',
        };
        return mapping[current];
    }
    if (status === STATUS_EARLY_WARNING && direction === 1) {
        const mapping: { [key in TabKeys]?: TabKeys } = {
            context: 'risk-analysis',
            'risk-analysis': 'early-actions',
            'early-actions': 'response',
        };
        return mapping[current];
    }
    if (status === STATUS_EARLY_WARNING && direction === -1) {
        const mapping: { [key in TabKeys]?: TabKeys } = {
            response: 'early-actions',
            'early-actions': 'risk-analysis',
            'risk-analysis': 'context',
        };
        return mapping[current];
    }
    return undefined;
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { reportId } = useParams<{ reportId: string }>();

    const alert = useAlert();

    const navigate = useNavigate();

    const {
        // FIXME: navigate to field detail page
        allFieldReports: fieldReportFormEditRoute,
    } = useContext(RouteContext);

    const strings = useTranslation(i18n);

    const formContentRef = useRef<ElementRef<'div'>>(null);

    const [activeTab, setActiveTab] = useState<TabKeys>('context');
    const [eventOptions, setEventOptions] = useState<EventItem[] | null | undefined>([]);
    const [districtOptions, setDistrictOptions] = useState<DistrictItem[] | null | undefined>([]);

    const countries = useCountryRaw();

    const disasterTypeOptions = useDisasterType();

    const {
        value,
        error,
        setFieldValue: onValueChange,
        validate,
        setError: onErrorSet,
        setValue: onValueSet,
    } = useForm(
        reportSchema,
        {
            value: {
                status: STATUS_EVENT,
                is_covid_report: false,
                visibility: VISIBILITY_PUBLIC,
                bulletin: BULLETIN_PUBLISHED_NO,
            },
        },
    );

    const {
        response: actionsResponse,
    } = useRequest({
        url: '/api/v2/action/',
        query: { limit: 9999 },
    });

    const {
        response: externalPartnersResponse,
    } = useRequest({
        url: '/api/v2/external_partner/',
        query: { limit: 9999 },
    });

    const {
        response: supportedActivitiesResponse,
    } = useRequest({
        url: '/api/v2/supported_activity/',
        query: { limit: 9999 },
    });

    const {
        response: reviewCountryResponse,
    } = useRequest({
        // skip: !value.country,
        url: '/api/v2/review-country/',
    });

    const {
        response: eventResponse,
    } = useRequest({
        url: '/api/v2/event/{id}/',
        skip: isNotDefined(value.event),
        pathVariables: isDefined(value.event) ? {
            id: value.event,
        } : undefined,
    });

    const fieldReportNumber = useMemo(
        () => {
            if (isNotDefined(value.country)) {
                return 1;
            }
            const reports = eventResponse?.field_reports?.filter(
                (fieldReport) => (
                    !!fieldReport.countries.find((country) => country.id === value.country)
                ),
            );
            if (isNotDefined(reports)) {
                return 1;
            }
            return reports.length + 1;
        },
        [eventResponse, value.country],
    );

    const {
        pending: fieldReportPending,
    } = useRequest({
        url: '/api/v2/field-report/{id}/',
        skip: !reportId,
        pathVariables: reportId
            ? { id: Number(reportId) }
            : undefined,
        onSuccess: (response) => {
            const formValue = transformAPIFieldsToFormFields(
                removeNull(response),
            );
            const eventOption = response?.event_details;
            setEventOptions(
                eventOption
                    ? [{
                        ...eventOption,
                        name: eventOption.name ?? '?',
                    }]
                    : [],
            );
            setDistrictOptions(response?.districts_details);
            onValueSet(formValue);
        },
    });

    const {
        pending: fieldReportEditSubmitPending,
        trigger: editSubmitRequest,
    } = useLazyRequest({
        url: '/api/v2/field-report/{id}/',
        pathVariables: isDefined(reportId) ? { id: Number(reportId) } : undefined,
        method: 'PUT',
        body: (ctx: FieldReportBody) => ctx,
        onSuccess: (response) => {
            alert.show(
                strings.fieldReportFormRedirectMessage,
                { variant: 'success' },
            );
            navigate(generatePath(
                fieldReportFormEditRoute.absolutePath,
                { id: response.id },
            ));
        },
        onFailure: ({
            value: {
                messageForNotification,
                formErrors,
            },
            debugMessage,
        }) => {
            onErrorSet(formErrors);
            alert.show(
                <p>
                    {strings.fieldReportFormErrorLabel}
                    &nbsp;
                    <strong>
                        {messageForNotification}
                    </strong>
                </p>,
                {
                    variant: 'danger',
                    debugMessage,
                },
            );
        },
    });

    const {
        pending: fieldReportCreateSubmitPending,
        trigger: createSubmitRequest,
    } = useLazyRequest({
        url: '/api/v2/field-report/',
        method: 'POST',
        body: (ctx: FieldReportBody) => ctx,
        onSuccess: (response) => {
            alert.show(
                strings.fieldReportFormRedirectMessage,
                { variant: 'success' },
            );
            window.setTimeout(
                () => {
                    navigate(generatePath(
                        fieldReportFormEditRoute.absolutePath,
                        { id: response.id },
                    ));
                },
                250,
            );
        },
        onFailure: ({
            value: {
                messageForNotification,
                formErrors,
            },
            debugMessage,
        }) => {
            onErrorSet(formErrors);
            alert.show(
                <p>
                    {strings.fieldReportFormErrorLabel}
                    &nbsp;
                    <strong>
                        {messageForNotification}
                    </strong>
                </p>,
                {
                    variant: 'danger',
                    debugMessage,
                },
            );
        },
    });

    const countryIsoOptions = useMemo(
        () => (
            countries?.map((country) => {
                // FIXME: why are we using this filter for independent and record_type
                if (
                    !country.independent
                    || country.record_type !== 1
                    || isFalsyString(country.iso3)
                ) {
                    return undefined;
                }
                return {
                    ...country,
                    iso3: country.iso3,
                    independent: country.independent,
                    recort_type: country.record_type,
                };
            }).filter(isDefined)
        ),
        [countries],
    );

    const getSummary = useCallback(
        (
            country: number | null | undefined,
            is_covid_report: boolean | undefined,
            start_date: string | null | undefined,
            dtype: number | null | undefined,
            summary: string | null | undefined,
        ) => {
            const dateLabel = new Date().toISOString().slice(0, 10);
            const iso3Label = isDefined(country)
                ? countryIsoOptions.find((x) => x.id === country)?.iso3
                : undefined;

            // COVID-19
            if (is_covid_report) {
                return fieldReportNumber === undefined
                    ? `${iso3Label}: ${strings.fieldReportCOVID19}`
                    : `${iso3Label}: ${strings.fieldReportCOVID19} #${fieldReportNumber} (${dateLabel})`;
            }

            // NON-COVID-19
            const disasterLabel = isDefined(dtype)
                ? disasterTypeOptions?.find((x) => x.id === dtype)?.name
                : undefined;
            return fieldReportNumber === undefined
                ? `${iso3Label}: ${disasterLabel} - ${start_date?.substring(0, 7)} - ${summary}`
                : `${iso3Label}: ${disasterLabel} - ${start_date?.substring(0, 7)} - ${summary} #${fieldReportNumber} (${dateLabel})`;
        },
        [countryIsoOptions, disasterTypeOptions, fieldReportNumber, strings],
    );

    const titlePreview = useMemo(
        () => {
            if (
                isDefined(value.country)
                && isDefined(value.start_date)
                && isDefined(value.dtype)
                && isTruthyString(value.summary)
                && isNotDefined(reportId)
            ) {
                return getSummary(
                    value.country,
                    value.is_covid_report,
                    value.start_date,
                    value.dtype,
                    value.summary,
                );
            }
            return undefined;
        },
        [
            getSummary,
            reportId,
            value.country,
            value.is_covid_report,
            value.start_date,
            value.dtype,
            value.summary,
        ],
    );

    const handleTabChange = useCallback((newTab: TabKeys) => {
        formContentRef.current?.scrollIntoView();
        setActiveTab(newTab);
    }, []);

    const handleSubmit = useCallback(
        (formValues: PartialFormValue) => {
            formContentRef.current?.scrollIntoView();

            const sanitizedValues = transformFormFieldsToAPIFields(
                formValues as FormValue,
            );

            if (reportId) {
                editSubmitRequest({
                    ...sanitizedValues,
                } as FieldReportBody);
            } else {
                const summary = getSummary(
                    formValues.country,
                    sanitizedValues.is_covid_report,
                    sanitizedValues.start_date,
                    sanitizedValues.dtype,
                    sanitizedValues.summary,
                );

                createSubmitRequest({
                    ...sanitizedValues,
                    summary,
                } as FieldReportBody);
            }
        },
        [
            getSummary,
            reportId,
            editSubmitRequest,
            createSubmitRequest,
        ],
    );

    const handleFormSubmit = createSubmitHandler(validate, onErrorSet, handleSubmit);

    const pending = fieldReportPending
        || fieldReportEditSubmitPending
        || fieldReportCreateSubmitPending;

    const nextStep = getNextStep(activeTab, 1, value.status);
    const prevStep = getNextStep(activeTab, -1, value.status);

    const isReviewCountry = useMemo(() => {
        if (isNotDefined(value.country)) {
            return false;
        }

        const reviewCountryIndex = reviewCountryResponse
            ?.results
            ?.findIndex((review) => review.country === value.country);

        return reviewCountryIndex !== -1;
    }, [reviewCountryResponse, value.country]);

    const reportType: ReportType = useMemo(() => {
        if (value.status === STATUS_EARLY_WARNING) {
            return 'EW';
        }

        if (value.is_covid_report) {
            return 'COVID';
        }

        if (value.dtype === DISASTER_TYPE_EPIDEMIC) {
            return 'EPI';
        }

        return 'EVT';
    }, [value.status, value.dtype, value.is_covid_report]);

    type ActionOption = NonNullable<NonNullable<typeof actionsResponse>['results']>[number];

    const filterActions = useCallback(
        (action: ActionOption) => {
            const fieldReportTypes = action.field_report_types;
            if (isNotDefined(fieldReportTypes) || fieldReportTypes.length <= 0) {
                return false;
            }
            return fieldReportTypes.includes(reportType);
        },
        [reportType],
    );

    // FIXME: clear fields with actions when reportType is changed
    const actionsByOrganizationType = useMemo(
        () => {
            const actionsByReportType = actionsResponse?.results?.filter(filterActions);

            const flattenedActions = actionsByReportType?.flatMap(
                ({ organizations, ...other }) => organizations?.map((org) => ({
                    ...other,
                    organization: org,
                })),
            )?.filter(isDefined);

            return listToGroupList(
                flattenedActions,
                (item) => item.organization,
                (item) => item,
            ) as Record<OrganizationType, NonNullable<typeof flattenedActions>[number][]>;
        },
        [actionsResponse, filterActions],
    );

    return (
        <Tabs
            value={activeTab}
            // NOTE: not using handleTabChange here
            onChange={setActiveTab}
            variant="step"
        >
            <Page
                elementRef={formContentRef}
                className={styles.fieldReportForm}
                title={strings.fieldReportTitle}
                heading={(
                    isDefined(reportId)
                        ? strings.fieldReportUpdate
                        : strings.fieldReportCreate
                )}
                // FIXME: Add link to wiki
                info={(
                    <TabList className={styles.tabList}>
                        <Tab
                            name="context"
                            step={1}
                            disabled={pending}
                            // errored
                        >
                            {strings.fieldReportFormItemContextLabel}
                        </Tab>
                        {value.status === STATUS_EARLY_WARNING && (
                            <Tab
                                name="risk-analysis"
                                step={2}
                                disabled={pending}
                                // errored
                            >
                                {strings.fieldReportFormItemRiskAnalysisLabel}
                            </Tab>
                        )}
                        {value.status === STATUS_EVENT && (
                            <Tab
                                name="situation"
                                step={2}
                                disabled={pending}
                                // errored
                            >
                                {strings.fieldReportFormItemSituationLabel}
                            </Tab>
                        )}
                        {value.status === STATUS_EARLY_WARNING && (
                            <Tab
                                name="early-actions"
                                step={3}
                                disabled={pending}
                                // errored
                            >
                                {strings.fieldReportFormItemEarlyActionsLabel}
                            </Tab>
                        )}
                        {value.status === STATUS_EVENT && (
                            <Tab
                                name="actions"
                                step={3}
                                disabled={pending}
                                // errored
                            >
                                {strings.fieldReportFormItemActionsLabel}
                            </Tab>
                        )}
                        <Tab
                            name="response"
                            step={4}
                            disabled={pending}
                            // errored
                        >
                            {strings.fieldReportFormItemResponseLabel}
                        </Tab>
                    </TabList>
                )}
                withBackgroundColorInMainSection
                mainSectionClassName={styles.content}
            >
                <TabPanel name="context">
                    <ContextFields
                        error={error}
                        onValueChange={onValueChange}
                        value={value}
                        reportType={reportType}
                        setDistrictOptions={setDistrictOptions}
                        districtOptions={districtOptions}
                        setEventOptions={setEventOptions}
                        eventOptions={eventOptions}
                        disabled={pending}
                        titlePreview={titlePreview}
                    />
                </TabPanel>
                <TabPanel name="risk-analysis">
                    <RiskAnalysisFields
                        error={error}
                        onValueChange={onValueChange}
                        value={value}
                        disabled={pending}
                    />
                </TabPanel>
                <TabPanel name="situation">
                    <SituationFields
                        error={error}
                        onValueChange={onValueChange}
                        value={value}
                        reportType={reportType}
                        disabled={pending}
                    />
                </TabPanel>
                <TabPanel name="early-actions">
                    <EarlyActionsFields
                        reportType={reportType}
                        error={error}
                        onValueChange={onValueChange}
                        value={value}
                        actionOptions={actionsByOrganizationType}
                        disabled={pending}
                    />
                </TabPanel>
                <TabPanel name="actions">
                    <ActionsFields
                        reportType={reportType}
                        error={error}
                        onValueChange={onValueChange}
                        value={value}
                        actionOptions={actionsByOrganizationType}
                        externalPartnerOptions={externalPartnersResponse?.results}
                        supportedActivityOptions={supportedActivitiesResponse?.results}
                        disabled={pending}
                    />
                </TabPanel>
                <TabPanel name="response">
                    <ResponseFields
                        error={error}
                        onValueChange={onValueChange}
                        value={value}
                        reportType={reportType}
                        isReviewCountry={isReviewCountry}
                        disabled={pending}
                    />
                </TabPanel>
                <NonFieldError
                    error={error}
                    message={strings.fieldReportFormNonFieldError}
                />
                <div className={styles.actions}>
                    <div className={styles.pageActions}>
                        <Button
                            name={prevStep ?? activeTab}
                            onClick={handleTabChange}
                            disabled={!prevStep}
                            variant="secondary"
                        >
                            {strings.fieldReportBackButtonLabel}
                        </Button>
                        <Button
                            name={nextStep ?? activeTab}
                            onClick={handleTabChange}
                            disabled={!nextStep}
                            variant="secondary"
                        >
                            {strings.fieldReportContinue}
                        </Button>
                    </div>
                    <Button
                        name={undefined}
                        onClick={handleFormSubmit}
                        disabled={activeTab !== 'response'}
                    >
                        {strings.fieldReportSubmit}
                    </Button>
                </div>
            </Page>
        </Tabs>
    );
}
