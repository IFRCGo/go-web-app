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
import { isDefined } from '@togglecorp/fujs';
import {
    useForm,
    createSubmitHandler,
    ObjectSchema,
    PartialForm,
    PurgeNull,
    requiredStringCondition,
    addCondition,
    removeNull,
} from '@togglecorp/toggle-form';

import ServerEnumsContext from '#contexts/server-enums';
import {
    positiveIntegerCondition,
    nonZeroCondition,
} from '#utils/form';
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
import { paths, components } from '#generated/types';

// import ContextFields from './ContextFields';
// import RiskAnalysisFields from './RiskAnalysisFields';
// import SituationFields from './SituationFields';
// import EarlyActionsFields from './EarlyActionsFields';
// import ActionsFields from './ActionsFields';
// import ResponseFields from './ResponseFields';

import styles from './styles.module.css';
import i18n from './i18n.json';

function ContextFields() {
    return null;
}
function RiskAnalysisFields() {
    return null;
}
function SituationFields() {
    return null;
}
function EarlyActionsFields() {
    return null;
}
function ActionsFields() {
    return null;
}
function ResponseFields() {
    return null;
}

type TabKeys = 'context' | 'situation' | 'risk-analysis' | 'actions' | 'early-actions' | 'response';

type FieldReportResponse = paths['/api/v2/field_report/{id}/']['get']['responses']['200']['content']['application/json'];
type FieldReportBody = paths['/api/v2/update_field_report/{id}/']['put']['requestBody']['content']['application/json'];

type Status = components['schemas']['StatusBb2Enum'];
export type ReportType = components['schemas']['FieldReportTypesEnum'];
// type Bulletin = components['schemas']['BulletinEnum'];
// type Visibility = components['schemas']['VisibilityD1bEnum'];
// FIXME: Not sure as the labels don't match
// type EpiSource = components['schemas']['Key1d2Enum'];
// type OrganizationType = components['schemas']['Key1aeEnum'];

const STATUS_EARLY_WARNING = 8 satisfies Status;
const STATUS_EVENT = 10 satisfies Status;

// FIXME: we need to identify a typesafe way to get this value
const DISASTER_TYPE_EPIDEMIC = 1;

// FIXME:
// const SOURCE_RC = 'red-cross';
// const SOURCE_GOV = 'government';
// const SOURCE_OTHER = 'other';

// FIXME:
// type ContactType = 'Originator' | 'NationalSociety' | 'Federation' | 'Media';

type FormValue = Omit<FieldReportBody, 'countries'> & {
    country: number,
};
export type PartialFormValue = PurgeNull<PartialForm<FormValue, 'uuid' | 'ctype' | 'organization'>>;
type FormSchema = ObjectSchema<PartialFormValue>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

function validStatusCondition(value: number | string | null | undefined) {
    if (value === STATUS_EARLY_WARNING || value === STATUS_EVENT) {
        return undefined;
    }
    return 'Status should either be an Event or an Early Warning / Early Action';
}

function transformFormFieldsToAPIFields(
    formValues: FormValue,
): FieldReportBody {
    const {
        country,
        start_date,
        sit_fields_date,
        ...otherProps
    } = formValues;
    return {
        ...otherProps,
        countries: isDefined(country) ? [country] : [],
        start_date: isDefined(start_date)
            ? (new Date(start_date)).toISOString()
            : start_date,
        sit_fields_date: isDefined(sit_fields_date)
            ? (new Date(sit_fields_date)).toISOString()
            : sit_fields_date,
    };
}

function transformAPIFieldsToFormFields(
    response: PurgeNull<FieldReportResponse>,
): PartialFormValue {
    const {
        countries,
        start_date,
        sit_fields_date,
        districts,
        user,
        dtype,
        event,
        regions,
        external_partners,
        supported_activities,
        ...otherProps
    } = response;

    return {
        ...otherProps,
        user: user?.id,
        dtype: dtype?.id,
        event: event?.id,
        country: isDefined(countries) && countries.length > 0 ? countries[0]?.id : undefined,
        districts: districts?.map((d) => d.id) ?? [],
        regions: regions?.map((r) => r.id) ?? [],
        external_partners: external_partners?.map((e) => e.id) ?? [],
        supported_activities: supported_activities?.map((a) => a.id) ?? [],
        start_date: isDefined(start_date)
            ? start_date.split('T')[0]
            : start_date,
        sit_fields_date: isDefined(sit_fields_date)
            ? sit_fields_date.split('T')[0]
            : sit_fields_date,
    };
}

const reportSchema: FormSchema = {
    validation: (value) => {
        if (
            value?.status === STATUS_EARLY_WARNING
            && value?.dtype === DISASTER_TYPE_EPIDEMIC
        ) {
            return 'Early Warning / Early action cannot be selected when disaster type is Epidemic or vice-versa';
        }
        return undefined;
    },
    fields: (value): FormSchemaFields => {
        let baseSchema: FormSchemaFields = ({
            status: { required: true, validations: [validStatusCondition] },
            is_covid_report: { required: true },
            dtype: { required: true },
            event: {},
            summary: { required: true, requiredValidation: requiredStringCondition },
            country: { required: true },
            districts: {},
            start_date: { required: true },
            request_assistance: {},
            ns_request_assistance: {},

            epi_cases: { validations: [positiveIntegerCondition] },
            epi_suspected_cases: { validations: [positiveIntegerCondition] },
            epi_probable_cases: { validations: [positiveIntegerCondition] },
            epi_confirmed_cases: { validations: [positiveIntegerCondition] },
            epi_num_dead: { validations: [positiveIntegerCondition] },

            epi_cases_since_last_fr: { validations: [positiveIntegerCondition] },
            epi_deaths_since_last_fr: { validations: [positiveIntegerCondition] },

            epi_figures_source: {},
            epi_notes_since_last_fr: {},
            sit_fields_date: {},
            other_sources: {},
            description: {},

            gov_num_assisted: { validations: [positiveIntegerCondition] },
            num_assisted: { validations: [positiveIntegerCondition] },
            num_localstaff: { validations: [positiveIntegerCondition] },
            num_volunteers: { validations: [positiveIntegerCondition] },
            num_expats_delegates: { validations: [positiveIntegerCondition] },

            // NOTE: array of 3 items
            // actions_ntls: {},
            // actions_ntls_desc: {},
            // actions_fdrn: {},
            // actions_fdrn_desc: {},
            // actions_pns: {},
            // actions_pns_desc: {},

            // actions_taken: {},

            bulletin: {},
            actions_others: {},

            notes_health: {},
            notes_ns: {},
            notes_socioeco: {},
            external_partners: {},
            supported_activities: {},

            // NOTE: array of 4 items
            // contact_originator_name: {},
            // contact_originator_title: {},
            // contact_originator_email: {},
            // contact_originator_phone: {},
            //
            // contact_nat_soc_name: {},
            // contact_nat_soc_title: {},
            // contact_nat_soc_email: {},
            // contact_nat_soc_phone: {},
            //
            // contact_federation_name: {},
            // contact_federation_title: {},
            // contact_federation_email: {},
            // contact_federation_phone: {},
            //
            // contact_media_name: {},
            // contact_media_title: {},
            // contact_media_email: {},
            // contact_media_phone: {},

            // contacts: {},

            visibility: { required: true },
        });

        baseSchema = addCondition(
            baseSchema,
            value,
            ['dref', 'dref_amount'],
            ['dref', 'dref_amount'],
            (val) => {
                if (isDefined(val?.dref) || isDefined(val?.dref_amount)) {
                    return {
                        dref: { required: true },
                        dref_amount: {
                            required: true,
                            validations: [positiveIntegerCondition, nonZeroCondition],
                        },
                    };
                }
                return {
                    dref: {},
                    dref_amount: {
                        validations: [positiveIntegerCondition, nonZeroCondition],
                    },
                };
            },
        );
        baseSchema = addCondition(
            baseSchema,
            value,
            ['appeal', 'appeal_amount'],
            ['appeal', 'appeal_amount'],
            (val) => {
                if (isDefined(val?.appeal) || isDefined(val?.appeal_amount)) {
                    return {
                        appeal: { required: true },
                        appeal_amount: {
                            required: true,
                            validations: [positiveIntegerCondition, nonZeroCondition],
                        },
                    };
                }
                return {
                    appeal: {},
                    appeal_amount: {
                        validations: [positiveIntegerCondition, nonZeroCondition],
                    },
                };
            },
        );
        baseSchema = addCondition(
            baseSchema,
            value,
            ['fact', 'num_fact'],
            ['fact', 'num_fact'],
            (val) => {
                if (isDefined(val?.fact) || isDefined(val?.num_fact)) {
                    return {
                        fact: { required: true },
                        num_fact: {
                            required: true,
                            validations: [positiveIntegerCondition, nonZeroCondition],
                        },
                    };
                }
                return {
                    fact: {},
                    num_fact: {
                        validations: [positiveIntegerCondition, nonZeroCondition],
                    },
                };
            },
        );
        baseSchema = addCondition(
            baseSchema,
            value,
            ['ifrc_staff', 'num_ifrc_staff'],
            ['ifrc_staff', 'num_ifrc_staff'],
            (val) => {
                if (isDefined(val?.ifrc_staff) || isDefined(val?.num_ifrc_staff)) {
                    return {
                        ifrc_staff: { required: true },
                        num_ifrc_staff: { required: true },
                    };
                }
                return {
                    ifrc_staff: {},
                    num_ifrc_staff: {},
                };
            },
        );
        baseSchema = addCondition(
            baseSchema,
            value,
            ['forecast_based_action', 'forecast_based_action_amount'],
            ['forecast_based_action', 'forecast_based_action_amount'],
            (val) => {
                if (
                    isDefined(val?.forecast_based_action)
                    || isDefined(val?.forecast_based_action_amount)
                ) {
                    return {
                        forecast_based_action: { required: true },
                        forecast_based_action_amount: {
                            required: true,
                            validations: [positiveIntegerCondition, nonZeroCondition],
                        },
                    };
                }
                return {
                    forecast_based_action: {},
                    forecast_based_action_amount: {
                        validations: [positiveIntegerCondition, nonZeroCondition],
                    },
                };
            },
        );

        return baseSchema;
    },
};

function getNextStep(current: TabKeys, direction: 1 | -1, status: Status | undefined) {
    if (status === STATUS_EARLY_WARNING && direction === 1) {
        const mapping: { [key in TabKeys]?: TabKeys } = {
            context: 'situation',
            situation: 'actions',
            actions: 'response',
        };
        return mapping[current];
    }
    if (status === STATUS_EARLY_WARNING && direction === -1) {
        const mapping: { [key in TabKeys]?: TabKeys } = {
            response: 'actions',
            actions: 'situation',
            situation: 'context',
        };
        return mapping[current];
    }
    if (status === STATUS_EVENT && direction === 1) {
        const mapping: { [key in TabKeys]?: TabKeys } = {
            context: 'risk-analysis',
            'risk-analysis': 'early-actions',
            'early-actions': 'response',
        };
        return mapping[current];
    }
    if (status === STATUS_EVENT && direction === -1) {
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
        // FIXME: use view page route here
        fieldReportFormEdit: fieldReportFormEditRoute,
    } = useContext(RouteContext);
    const strings = useTranslation(i18n);
    const [activeTab, setActiveTab] = useState<TabKeys>('context');

    const formContentRef = useRef<ElementRef<'div'>>(null);

    const {
        api_field_report_status,
        api_request_choices, // FIXME: need to filter this
        api_episource_choices, // FIXME: the labels do not match
    } = useContext(ServerEnumsContext);

    const handleTabChange = useCallback((newTab: TabKeys) => {
        formContentRef.current?.scrollIntoView();
        setActiveTab(newTab);
    }, []);

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
                /*
                // FIXME:
                status: STATUS_EVENT,
                is_covid_report: false,
                visibility: VISIBILITY_PUBLIC,
                bulletin: BULLETIN_PUBLISHED_NO,
                */
            },
        },
    );

    const {
        pending: fieldReportPending,
    } = useRequest({
        url: '/api/v2/field_report/{id}/',
        skip: !reportId,
        pathVariables: reportId
            ? { id: Number(reportId) }
            : undefined,
        onSuccess: (response) => {
            const formValue = transformAPIFieldsToFormFields(
                removeNull(response),
            );
            onValueSet(formValue);
        },
    });

    const {
        pending: fieldReportEditSubmitPending,
        trigger: editSubmitRequest,
    } = useLazyRequest({
        url: '/api/v2/update_field_report/{id}/',
        pathVariables: isDefined(reportId) ? { id: reportId } : undefined,
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
        url: '/api/v2/create_field_report/',
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

    const handleSubmit = useCallback(
        (formValues: PartialFormValue) => {
            formContentRef.current?.scrollIntoView();

            const sanitizedValues = transformFormFieldsToAPIFields(
                removeNull(formValues) as FormValue,
            );

            function getSummary(
                country: number | null | undefined,
                event: number | null | undefined,
                is_covid_report: boolean | undefined,
                start_date: string | null | undefined,
                dtype: number,
                summary: string | null | undefined,
            ) {
                const dateLabel = new Date().toISOString().slice(0, 10);
                const iso3Label = countryIsoOptions.find((x) => x.value === country)?.label;
                const eventLabel = eventOptions.find((x) => x.value === event)?.label;
                // COVID-19
                if (is_covid_report) {
                    return eventLabel === undefined
                        ? `${iso3Label}: ${strings.fieldReportCOVID19}`
                        : `${iso3Label}: ${strings.fieldReportCOVID19} #${eventLabel} (${dateLabel})`;
                }

                const disasterLabel = disasterTypeOptions.find((x) => x.value === dtype)?.label;
                // NON-COVID-19
                return eventLabel === undefined
                    ? `${iso3Label}: ${disasterLabel} - ${start_date?.substring(0, 7)} - ${summary}`
                    : `${iso3Label}: ${disasterLabel} - ${start_date?.substring(0, 7)} - ${summary} #${eventLabel} (${dateLabel})`;
            }

            // FIXME: populate summary fields

            if (reportId) {
                editSubmitRequest(sanitizedValues as FieldReportBody);
            } else {
                const summary = getSummary(
                    formValues.country,
                    sanitizedValues.event,
                    sanitizedValues.is_covid_report,
                    sanitizedValues.start_date,
                    sanitizedValues.dtype,
                    sanitizedValues.summary,
                );

                createSubmitRequest({ ...sanitizedValues, summary } as FieldReportBody);
            }
        },
        [
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

    // statusOptions: api_field_report_status

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
            >
                <TabPanel name="context">
                    <ContextFields
                        error={error}
                        onValueChange={onValueChange}
                        value={value}
                        reportType={reportType}
                        reportId={reportId}
                        fetchingCountries={fetchingCountries}
                        fetchingDistricts={fetchingDistricts}
                        fetchingDisasterTypes={fetchingDisasterTypes}
                        // get this from server
                        statusOptions={statusOptions}
                        // FIXME: remove this
                        yesNoOptions={yesNoOptions}
                        // FIXME: use country select input
                        countryOptions={countryOptions}
                        // FIXME: use district select input / dependent on country
                        districtOptions={districtOptions}
                        // FIXME: use event select input. we can just use event options list
                        initialEventOptions={initialEventOptions}
                        // Needed for prefix api/v2/disaster_type/
                        disasterTypeOptions={disasterTypeOptions}
                        // FIXME: we can just use country options list
                        countryIsoOptions={countryIsoOptions}
                        // FIXME: we can just use event options list
                        eventOptions={eventOptions}
                    />
                </TabPanel>
                <TabPanel name="risk-analysis">
                    <RiskAnalysisFields
                        error={error}
                        onValueChange={onValueChange}
                        value={value}
                        // TODO: Hard coded
                        sourceOptions={sourceOptions}
                        disabled={pending}
                    />
                </TabPanel>
                <TabPanel name="situation">
                    <SituationFields
                        error={error}
                        onValueChange={onValueChange}
                        value={value}
                        reportType={reportType}
                        // TODO: Hard coded
                        sourceOptions={sourceOptions}
                        disabled={pending}
                    />
                </TabPanel>
                <TabPanel name="early-actions">
                    <EarlyActionsFields
                        error={error}
                        onValueChange={onValueChange}
                        value={value}
                        // we have a common enum
                        bulletinOptions={bulletinOptions}
                        // For action search select input /api/v2/action -> 80items
                        actionOptions={orgGroupedActionForCurrentReport}
                        disabled={pending}
                    />
                </TabPanel>
                <TabPanel name="actions">
                    <ActionsFields
                        reportType={reportType}
                        error={error}
                        onValueChange={onValueChange}
                        value={value}
                        fetchingExternalPartners={fetchingExternalPartners}
                        fetchingSupportedActivities={fetchingSupportedActivities}
                        // we have a common enum
                        bulletinOptions={bulletinOptions}
                        // For action search select input /api/v2/action
                        actionOptions={orgGroupedActionForCurrentReport}

                        // For external partner search select input api/v2/external_partner/
                        externalPartnerOptions={externalPartnerOptions}
                        // For supported activity select input api/v2/supported_activity/
                        supportedActivityOptions={supportedActivityOptions}
                        disabled={pending}
                    />
                </TabPanel>
                <TabPanel name="response">
                    <ResponseFields
                        error={error}
                        onValueChange={onValueChange}
                        value={value}
                        reportType={reportType}
                        // Need to get list from server or maybe use a filter
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
                        disabled={activeTab === 'response'}
                    >
                        {strings.fieldReportSubmit}
                    </Button>
                </div>
            </Page>
        </Tabs>
    );
}
