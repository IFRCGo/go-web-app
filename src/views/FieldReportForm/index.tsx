import {
    useState,
    useCallback,
    useMemo,
    useRef,
    type ElementRef,
} from 'react';
import {
    useParams,
    useLocation,
} from 'react-router-dom';
import {
    isDefined,
    isNotDefined,
    isFalsyString,
    listToGroupList,
} from '@togglecorp/fujs';
import {
    useForm,
    createSubmitHandler,
    removeNull,
} from '@togglecorp/toggle-form';

import useRouting from '#hooks/useRouting';
import {
    transformObjectError,
    matchArray,
    NUM,
} from '#utils/restRequest/error';
import Button from '#components/Button';
import NonFieldError from '#components/NonFieldError';
import Tab from '#components/Tabs/Tab';
import Tabs from '#components/Tabs';
import TabList from '#components/Tabs/TabList';
import TabPanel from '#components/Tabs/TabPanel';
import Page from '#components/Page';
import Message from '#components/Message';
import LanguageMismatchMessage from '#components/domain/LanguageMismatchMessage';
import FormFailedToLoadMessage from '#components/domain/FormFailedToLoadMessage';
import { type DistrictItem } from '#components/domain/DistrictSearchMultiSelectInput';
import { type EventItem } from '#components/domain/EventSearchSelectInput';
import useAlert from '#hooks/useAlert';
import useTranslation from '#hooks/useTranslation';
import useCountryRaw from '#hooks/domain/useCountryRaw';
import useDisasterType from '#hooks/domain/useDisasterType';
import useCurrentLanguage from '#hooks/domain/useCurrentLanguage';
import { resolveToString } from '#utils/translation';
import {
    formatDate,
} from '#utils/common';
import { useRequest, useLazyRequest } from '#utils/restRequest';
import {
    type FieldReportStatusEnum,
    type ReportType,
    type OrganizationType,
    FIELD_REPORT_STATUS_EARLY_WARNING,
    FIELD_REPORT_STATUS_EVENT,
    VISIBILITY_PUBLIC,
    BULLETIN_PUBLISHED_NO,
    DISASTER_TYPE_EPIDEMIC,
} from '#utils/constants';

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
    type FieldReportBody,
    type FieldReportPostBody,
    type PartialFormValue,
    type FormValue,
    type TabKeys,
    checkTabErrors,
} from './common';
import styles from './styles.module.css';
import i18n from './i18n.json';

function getNextStep(
    current: TabKeys,
    direction: 1 | -1,
    status: FieldReportStatusEnum | undefined,
) {
    if (status === FIELD_REPORT_STATUS_EVENT && direction === 1) {
        const mapping: { [key in TabKeys]?: TabKeys } = {
            context: 'situation',
            situation: 'actions',
            actions: 'response',
        };
        return mapping[current];
    }
    if (status === FIELD_REPORT_STATUS_EVENT && direction === -1) {
        const mapping: { [key in TabKeys]?: TabKeys } = {
            response: 'actions',
            actions: 'situation',
            situation: 'context',
        };
        return mapping[current];
    }
    if (status === FIELD_REPORT_STATUS_EARLY_WARNING && direction === 1) {
        const mapping: { [key in TabKeys]?: TabKeys } = {
            context: 'risk-analysis',
            'risk-analysis': 'early-actions',
            'early-actions': 'response',
        };
        return mapping[current];
    }
    if (status === FIELD_REPORT_STATUS_EARLY_WARNING && direction === -1) {
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
    const { fieldReportId } = useParams<{ fieldReportId: string }>();
    const { navigate } = useRouting();
    const alert = useAlert();
    const strings = useTranslation(i18n);
    const formContentRef = useRef<ElementRef<'div'>>(null);
    const countries = useCountryRaw();
    const disasterTypeOptions = useDisasterType();
    const currentLanguage = useCurrentLanguage();
    const { state } = useLocation();

    const [activeTab, setActiveTab] = useState<TabKeys>('context');
    const [eventOptions, setEventOptions] = useState<EventItem[] | null | undefined>([]);
    const [districtOptions, setDistrictOptions] = useState<DistrictItem[] | null | undefined>([]);

    const status = !fieldReportId && state?.earlyWarning
        ? FIELD_REPORT_STATUS_EARLY_WARNING
        : FIELD_REPORT_STATUS_EVENT;

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
                status,
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
                    isDefined(fieldReport.countries.find((country) => country.id === value.country))
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
        error: fieldReportResponseError,
        response: fieldReportResponse,
    } = useRequest({
        // FIXME: need to check if fieldReportId can be ''
        url: '/api/v2/field-report/{id}/',
        skip: isNotDefined(fieldReportId),
        pathVariables: fieldReportId
            ? { id: Number(fieldReportId) }
            : undefined,
        onSuccess: (response) => {
            const formValue = transformAPIFieldsToFormFields(
                removeNull(response),
            );
            const eventOption = response?.event_details;
            setEventOptions(
                eventOption
                    ? [{
                        id: eventOption.id,
                        name: eventOption.name ?? '?',
                        dtype: eventOption.dtype_details,
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
        pathVariables: isDefined(fieldReportId) ? { id: Number(fieldReportId) } : undefined,
        method: 'PATCH',
        // NOTE: Field report can be submitted in non-english languages as well
        useCurrentLanguageForMutation: true,
        body: (ctx: FieldReportBody) => ctx,
        onSuccess: (response) => {
            alert.show(
                strings.formRedirectMessage,
                { variant: 'success' },
            );
            navigate(
                'fieldReportDetails',
                { params: { fieldReportId: response.id } },
            );
        },
        onFailure: ({
            value: {
                messageForNotification,
                formErrors,
            },
            debugMessage,
        }) => {
            onErrorSet(transformObjectError(
                formErrors,
                (locations) => {
                    let match = matchArray(locations, ['contacts', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.contacts?.[index]?.ctype;
                    }
                    match = matchArray(locations, ['actions_taken', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.actions_taken?.[index]?.organization;
                    }
                    return undefined;
                },
            ));

            alert.show(
                strings.formErrorLabel,
                {
                    description: messageForNotification,
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
        // NOTE: Field report can be submitted in non-english languages as well
        useCurrentLanguageForMutation: true,
        body: (ctx: FieldReportPostBody) => ctx,
        onSuccess: (response) => {
            alert.show(
                strings.formRedirectMessage,
                { variant: 'success' },
            );
            navigate(
                'fieldReportDetails',
                { params: { fieldReportId: response.id } },
            );
        },
        onFailure: ({
            value: {
                messageForNotification,
                formErrors,
            },
            debugMessage,
        }) => {
            onErrorSet(transformObjectError(
                formErrors,
                (locations) => {
                    let match = matchArray(locations, ['contacts', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.contacts?.[index]?.ctype;
                    }
                    match = matchArray(locations, ['actions_taken', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.actions_taken?.[index]?.organization;
                    }
                    return undefined;
                },
            ));
            alert.show(
                strings.formErrorLabel,
                {
                    description: messageForNotification,
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
                    // FIXME: Use named constant
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

    const getTitle = useCallback(
        (
            country: number | null | undefined,
            is_covid_report: boolean | undefined,
            start_date: string | null | undefined,
            dtype: number | null | undefined,
            summary: string | null | undefined,
        ) => {
            const dateLabel = formatDate(new Date(), 'yyyy-MM-dd');
            const iso3Label = isDefined(country)
                ? countryIsoOptions?.find(({ id }) => id === country)?.iso3
                : undefined;

            // COVID-19
            if (is_covid_report) {
                return isDefined(fieldReportNumber)
                    ? resolveToString(
                        strings.generatedTitleFormatForCovid,
                        {
                            iso3: iso3Label,
                            fieldReportNumber,
                            fullDate: dateLabel,
                        },
                    ) : resolveToString(
                        strings.generatedTitleFormatForCovidOld,
                        { iso3: iso3Label },
                    );
            }

            // NON-COVID-19
            const disasterLabel = isDefined(dtype)
                ? disasterTypeOptions?.find(({ id }) => id === dtype)?.name
                : undefined;

            const shortDate = formatDate(start_date, 'MM-yyyy');

            return isDefined(fieldReportNumber)
                ? resolveToString(
                    strings.generatedTitleFormat,
                    {
                        iso3: iso3Label,
                        disaster: disasterLabel,
                        shortDate,
                        summary,
                        fieldReportNumber,
                        fullDate: dateLabel,
                    },
                ) : resolveToString(
                    strings.generatedTitleFormatOld,
                    {
                        iso3: iso3Label,
                        disaster: disasterLabel,
                        shortDate,
                        summary,
                    },
                );
        },
        [countryIsoOptions, disasterTypeOptions, fieldReportNumber, strings],
    );

    const titlePreview = useMemo(
        () => {
            if (
                isDefined(value.country)
                && isDefined(value.start_date)
                && isDefined(value.dtype)
                && isNotDefined(fieldReportId)
            ) {
                return getTitle(
                    value.country,
                    value.is_covid_report,
                    value.start_date,
                    value.dtype,
                    value.summary ?? '',
                );
            }
            return undefined;
        },
        [
            getTitle,
            fieldReportId,
            value.country,
            value.is_covid_report,
            value.start_date,
            value.dtype,
            value.summary,
        ],
    );

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
        if (value.status === FIELD_REPORT_STATUS_EARLY_WARNING) {
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

    const handleFormError = useCallback(() => {
        formContentRef.current?.scrollIntoView();
    }, []);

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

            if (fieldReportId) {
                editSubmitRequest({
                    ...sanitizedValues,
                } as FieldReportBody);
            } else {
                const summary = getTitle(
                    formValues.country,
                    sanitizedValues.is_covid_report,
                    sanitizedValues.start_date,
                    sanitizedValues.dtype,
                    sanitizedValues.summary,
                );

                createSubmitRequest({
                    ...sanitizedValues,
                    summary,
                } as FieldReportPostBody);
            }
        },
        [
            getTitle,
            fieldReportId,
            editSubmitRequest,
            createSubmitRequest,
        ],
    );

    const handleFormSubmit = createSubmitHandler(
        validate,
        onErrorSet,
        handleSubmit,
        handleFormError,
    );

    const pending = fieldReportPending
        || fieldReportEditSubmitPending
        || fieldReportCreateSubmitPending;

    const nextStep = getNextStep(activeTab, 1, value.status);
    const prevStep = getNextStep(activeTab, -1, value.status);

    const languageMismatch = isDefined(fieldReportId)
        && isDefined(fieldReportResponse)
        && currentLanguage !== fieldReportResponse?.translation_module_original_language;
    const shouldHideForm = languageMismatch
        || fieldReportPending
        || isDefined(fieldReportResponseError);

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
                title={strings.title}
                heading={(
                    isDefined(fieldReportId)
                        ? strings.updateHeading
                        : strings.createHeading
                )}
                // FIXME: Add link to wiki
                info={!shouldHideForm && (
                    <TabList className={styles.tabList}>
                        <Tab
                            name="context"
                            step={1}
                            disabled={pending}
                            errored={checkTabErrors(error, 'context')}
                        >
                            {strings.formItemContextLabel}
                        </Tab>
                        {value.status === FIELD_REPORT_STATUS_EARLY_WARNING && (
                            <Tab
                                name="risk-analysis"
                                step={2}
                                disabled={pending}
                                errored={checkTabErrors(error, 'risk-analysis')}
                            >
                                {strings.formItemRiskAnalysisLabel}
                            </Tab>
                        )}
                        {value.status === FIELD_REPORT_STATUS_EVENT && (
                            <Tab
                                name="situation"
                                step={2}
                                disabled={pending}
                                errored={checkTabErrors(error, 'situation')}
                            >
                                {strings.formItemSituationLabel}
                            </Tab>
                        )}
                        {value.status === FIELD_REPORT_STATUS_EARLY_WARNING && (
                            <Tab
                                name="early-actions"
                                step={3}
                                disabled={pending}
                                errored={checkTabErrors(error, 'early-actions')}
                            >
                                {strings.formItemEarlyActionsLabel}
                            </Tab>
                        )}
                        {value.status === FIELD_REPORT_STATUS_EVENT && (
                            <Tab
                                name="actions"
                                step={3}
                                disabled={pending}
                                errored={checkTabErrors(error, 'actions')}
                            >
                                {strings.formItemActionsLabel}
                            </Tab>
                        )}
                        <Tab
                            name="response"
                            step={4}
                            disabled={pending}
                            errored={checkTabErrors(error, 'response')}
                        >
                            {strings.formItemResponseLabel}
                        </Tab>
                    </TabList>
                )}
                infoContainerClassName={styles.tabListContainer}
                withBackgroundColorInMainSection
                mainSectionClassName={styles.content}
            >
                {fieldReportPending && (
                    <Message
                        pending
                        title={strings.formLoadingMessage}
                    />
                )}
                {languageMismatch && (
                    <LanguageMismatchMessage
                        originalLanguage={fieldReportResponse.translation_module_original_language}
                    />
                )}
                {isDefined(fieldReportResponseError) && (
                    <FormFailedToLoadMessage
                        title={strings.formLoadErrorTitle}
                        description={fieldReportResponseError.value.messageForNotification}
                    />
                )}
                {!shouldHideForm && (
                    <>
                        <NonFieldError
                            error={error}
                            withFallbackError
                        />
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
                        <div className={styles.actions}>
                            <div className={styles.pageActions}>
                                <Button
                                    name={prevStep ?? activeTab}
                                    onClick={handleTabChange}
                                    disabled={isNotDefined(prevStep)}
                                    variant="secondary"
                                >
                                    {strings.backButtonLabel}
                                </Button>
                                <Button
                                    name={nextStep ?? activeTab}
                                    onClick={handleTabChange}
                                    disabled={isNotDefined(nextStep)}
                                    variant="secondary"
                                >
                                    {strings.continueButtonLabel}
                                </Button>
                            </div>
                            <Button
                                name={undefined}
                                onClick={handleFormSubmit}
                                disabled={activeTab !== 'response' || pending}
                            >
                                {strings.submitButtonLabel}
                            </Button>
                        </div>
                    </>
                )}
            </Page>
        </Tabs>
    );
}
