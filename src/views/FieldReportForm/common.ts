import { isDefined } from '@togglecorp/fujs';
import {
    type ArraySchema,
    type ObjectSchema,
    type PartialForm,
    type PurgeNull,
    requiredStringCondition,
    addCondition,
    nullValue,
} from '@togglecorp/toggle-form';

import {
    positiveIntegerCondition,
    nonZeroCondition,
} from '#utils/form';
import { type DeepReplace } from '#utils/common';
import {
    type ContactType,
    type FieldReportStatusEnum,
    FIELD_REPORT_STATUS_EARLY_WARNING,
    FIELD_REPORT_STATUS_EVENT,
    DISASTER_TYPE_EPIDEMIC,
} from '#utils/constants';
import { type GoApiResponse } from '#utils/restRequest';

// FORM

type FieldReportResponse = GoApiResponse<'/api/v2/field-report/{id}/'>;
export type FieldReportBody = GoApiResponse<'/api/v2/field-report/{id}/', 'PUT'>;

type ContactRaw = NonNullable<FieldReportBody['contacts']>[number];
type Contact = Omit<ContactRaw, 'ctype'> & {
    // FIXME: Fix this in the server later
    ctype: ContactType;
};

export type FormValue = Omit<
    DeepReplace<FieldReportBody, ContactRaw, Contact>,
    'countries'
> & {
    // FIXME: Why do we need to change countries to country
    // Fix this in the server later
    country: number,
};

export type PartialFormValue = PurgeNull<PartialForm<FormValue, 'uuid' | 'ctype' | 'organization'>>;
type FormSchema = ObjectSchema<PartialFormValue>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type ContactListSchema = ArraySchema<NonNullable<PartialFormValue['contacts']>[number], PartialFormValue>;
type ContactListMember = ReturnType<ContactListSchema['member']>;
type ContactSchema = ObjectSchema<NonNullable<PartialFormValue['contacts']>[number], PartialFormValue>;
type ContactField = ReturnType<ContactSchema['fields']>;

type ActionTakenListSchema = ArraySchema<NonNullable<PartialFormValue['actions_taken']>[number], PartialFormValue>;
type ActionTakenListMember = ReturnType<ActionTakenListSchema['member']>;
type ActionTakenSchema = ObjectSchema<NonNullable<PartialFormValue['actions_taken']>[number], PartialFormValue>;
type ActionTakenField = ReturnType<ActionTakenSchema['fields']>;

export function getReportType(
    status: FieldReportStatusEnum | undefined,
    is_covid_report: boolean | undefined,
    dtype: number | undefined,
) {
    if (status === FIELD_REPORT_STATUS_EARLY_WARNING) {
        return 'EW';
    }

    if (is_covid_report) {
        return 'COVID';
    }

    if (dtype === DISASTER_TYPE_EPIDEMIC) {
        return 'EPI';
    }

    return 'EVT';
}

export function transformFormFieldsToAPIFields(
    formValues: FormValue,
): FieldReportBody {
    const {
        country,
        start_date,
        sit_fields_date,
        contacts,
        ...otherProps
    } = formValues;
    return {
        ...otherProps,
        contacts,
        countries: isDefined(country) ? [country] : [],
        start_date: isDefined(start_date)
            ? (new Date(start_date)).toISOString()
            : start_date,
        sit_fields_date: isDefined(sit_fields_date)
            ? (new Date(sit_fields_date)).toISOString()
            : sit_fields_date,
    };
}

export function transformAPIFieldsToFormFields(
    response: PurgeNull<FieldReportResponse>,
): PartialFormValue {
    const {
        countries,
        start_date,
        sit_fields_date,
        contacts,
        ...otherProps
    } = response;

    // FIXME: fix for actions_taken
    return {
        ...otherProps,
        country: isDefined(countries) && countries.length > 0 ? countries[0] : undefined,
        start_date: isDefined(start_date)
            ? start_date.split('T')[0]
            : start_date,
        sit_fields_date: isDefined(sit_fields_date)
            ? sit_fields_date.split('T')[0]
            : sit_fields_date,
        contacts: contacts?.map((c) => ({
            ...c,
            // FIXME: Fix this in the server later
            ctype: c.ctype as ContactType,
        })),
    };
}

function validStatusCondition(value: number | string | null | undefined) {
    if (value === FIELD_REPORT_STATUS_EARLY_WARNING || value === FIELD_REPORT_STATUS_EVENT) {
        return undefined;
    }
    return 'Status should either be an Event or an Early Warning / Early Action';
}

export const reportSchema: FormSchema = {
    validation: (value) => {
        if (
            value?.status === FIELD_REPORT_STATUS_EARLY_WARNING
            && value?.dtype === DISASTER_TYPE_EPIDEMIC
        ) {
            return 'Early Warning / Early action cannot be selected when disaster type is Epidemic or vice-versa';
        }
        return undefined;
    },
    fields: (value): FormSchemaFields => {
        let baseSchema: FormSchemaFields = ({
            // CONTEXT
            status: { required: true, validations: [validStatusCondition] },
            is_covid_report: { required: true },
            event: {},
            country: { required: true },
            districts: {},
            dtype: { required: true },
            start_date: { required: true },
            summary: { required: true, requiredValidation: requiredStringCondition },
            request_assistance: {},
            ns_request_assistance: {},

            // RESPONSE

            contacts: {
                keySelector: (item) => item.ctype,
                member: (): ContactListMember => ({
                    fields: (): ContactField => ({
                        ctype: { required: true },
                        name: {},
                        title: {},
                        email: {},
                        phone: {},
                    }),
                }),
            },
            visibility: { required: true },
        });

        // SITUATION / RISK ANALYSIS

        const situationFields = [
            'affected_pop_centres',
            'description',
            'epi_cases',
            'epi_cases_since_last_fr',
            'epi_confirmed_cases',
            'epi_deaths_since_last_fr',
            'epi_figures_source',
            'epi_notes_since_last_fr',
            'epi_num_dead',
            'epi_probable_cases',
            'epi_suspected_cases',
            'gov_affected_pop_centres',
            'gov_num_affected',
            'gov_num_dead',
            'gov_num_displaced',
            'gov_num_highest_risk',
            'gov_num_injured',
            'gov_num_missing',
            'gov_num_potentially_affected',
            'num_affected',
            'num_dead',
            'num_displaced',
            'num_highest_risk',
            'num_injured',
            'num_missing',
            'num_potentially_affected',
            'other_affected_pop_centres',
            'other_num_affected',
            'other_num_dead',
            'other_num_displaced',
            'other_num_highest_risk',
            'other_num_injured',
            'other_num_missing',
            'other_num_potentially_affected',
            'other_sources',
            'sit_fields_date',
        ] as const;
        type SituationSchema = Pick<FormSchemaFields, (typeof situationFields)[number]>;

        baseSchema = addCondition(
            baseSchema,
            value,
            ['status', 'is_covid_report', 'dtype'],
            situationFields,
            (val): SituationSchema => {
                const reportType = getReportType(val?.status, val?.is_covid_report, val?.dtype);

                const baseSchemaTwo: SituationSchema = {
                    description: {},
                    other_sources: {},

                    affected_pop_centres: { forceValue: nullValue },
                    epi_cases: { forceValue: nullValue },
                    epi_cases_since_last_fr: { forceValue: nullValue },
                    epi_confirmed_cases: { forceValue: nullValue },
                    epi_deaths_since_last_fr: { forceValue: nullValue },
                    epi_figures_source: { forceValue: nullValue },
                    epi_notes_since_last_fr: { forceValue: nullValue },
                    epi_num_dead: { forceValue: nullValue },
                    epi_probable_cases: { forceValue: nullValue },
                    epi_suspected_cases: { forceValue: nullValue },
                    gov_affected_pop_centres: { forceValue: nullValue },
                    gov_num_affected: { forceValue: nullValue },
                    gov_num_dead: { forceValue: nullValue },
                    gov_num_displaced: { forceValue: nullValue },
                    gov_num_highest_risk: { forceValue: nullValue },
                    gov_num_injured: { forceValue: nullValue },
                    gov_num_missing: { forceValue: nullValue },
                    gov_num_potentially_affected: { forceValue: nullValue },
                    num_affected: { forceValue: nullValue },
                    num_dead: { forceValue: nullValue },
                    num_displaced: { forceValue: nullValue },
                    num_highest_risk: { forceValue: nullValue },
                    num_injured: { forceValue: nullValue },
                    num_missing: { forceValue: nullValue },
                    num_potentially_affected: { forceValue: nullValue },
                    other_affected_pop_centres: { forceValue: nullValue },
                    other_num_affected: { forceValue: nullValue },
                    other_num_dead: { forceValue: nullValue },
                    other_num_displaced: { forceValue: nullValue },
                    other_num_highest_risk: { forceValue: nullValue },
                    other_num_injured: { forceValue: nullValue },
                    other_num_missing: { forceValue: nullValue },
                    other_num_potentially_affected: { forceValue: nullValue },
                    sit_fields_date: { forceValue: nullValue },
                };
                // RISK ANALYSIS
                if (reportType === 'EW') {
                    return {
                        ...baseSchemaTwo,
                        num_potentially_affected: {},
                        gov_num_potentially_affected: {},
                        other_num_potentially_affected: {},
                        num_highest_risk: {},
                        gov_num_highest_risk: {},
                        other_num_highest_risk: {},
                        affected_pop_centres: {},
                        gov_affected_pop_centres: {},
                        other_affected_pop_centres: {},
                    };
                }
                // SITUATION - COVID
                if (reportType === 'COVID') {
                    return {
                        ...baseSchemaTwo,
                        epi_cases: { validations: [positiveIntegerCondition] },
                        epi_num_dead: { validations: [positiveIntegerCondition] },
                        epi_cases_since_last_fr: { validations: [positiveIntegerCondition] },
                        epi_deaths_since_last_fr: { validations: [positiveIntegerCondition] },
                        epi_figures_source: {},
                        epi_notes_since_last_fr: {},
                        sit_fields_date: {},
                    };
                }
                // SITUATION - EPI
                if (reportType === 'EPI') {
                    return {
                        ...baseSchemaTwo,
                        epi_cases: { validations: [positiveIntegerCondition] },
                        epi_suspected_cases: { validations: [positiveIntegerCondition] },
                        epi_probable_cases: { validations: [positiveIntegerCondition] },
                        epi_confirmed_cases: { validations: [positiveIntegerCondition] },
                        epi_num_dead: { validations: [positiveIntegerCondition] },
                        epi_figures_source: {},
                        epi_notes_since_last_fr: {},
                        sit_fields_date: {},
                    };
                }
                // SITUATION - EVT
                return {
                    ...baseSchemaTwo,
                    num_injured: { validations: [positiveIntegerCondition] },
                    gov_num_injured: { validations: [positiveIntegerCondition] },
                    other_num_injured: { validations: [positiveIntegerCondition] },
                    num_dead: { validations: [positiveIntegerCondition] },
                    gov_num_dead: { validations: [positiveIntegerCondition] },
                    other_num_dead: { validations: [positiveIntegerCondition] },
                    num_missing: { validations: [positiveIntegerCondition] },
                    gov_num_missing: { validations: [positiveIntegerCondition] },
                    other_num_missing: { validations: [positiveIntegerCondition] },
                    num_affected: { validations: [positiveIntegerCondition] },
                    gov_num_affected: { validations: [positiveIntegerCondition] },
                    other_num_affected: { validations: [positiveIntegerCondition] },
                    num_displaced: { validations: [positiveIntegerCondition] },
                    gov_num_displaced: { validations: [positiveIntegerCondition] },
                    other_num_displaced: { validations: [positiveIntegerCondition] },
                };
            },
        );

        // ACTIONS / EARLY ACTIONS

        const actionFields = [
            'actions_others',
            'actions_taken',
            'bulletin',
            'external_partners',
            'gov_num_assisted',
            'notes_health',
            'notes_ns',
            'notes_socioeco',
            'num_assisted',
            'num_expats_delegates',
            'num_localstaff',
            'num_volunteers',
            'supported_activities',
        ] as const;
        type ActionSchema = Pick<FormSchemaFields, (typeof actionFields)[number]>;

        baseSchema = addCondition(
            baseSchema,
            value,
            ['status', 'is_covid_report', 'dtype'],
            actionFields,
            (val): ActionSchema => {
                const reportType = getReportType(val?.status, val?.is_covid_report, val?.dtype);

                const baseSchemaTwo: ActionSchema = {
                    actions_others: {},
                    gov_num_assisted: { validations: [positiveIntegerCondition] },
                    num_assisted: { validations: [positiveIntegerCondition] },

                    actions_taken: { forceValue: nullValue },
                    bulletin: { forceValue: nullValue },
                    external_partners: { forceValue: [] },
                    notes_health: { forceValue: nullValue },
                    notes_ns: { forceValue: nullValue },
                    notes_socioeco: { forceValue: nullValue },
                    num_expats_delegates: { forceValue: nullValue },
                    num_localstaff: { forceValue: nullValue },
                    num_volunteers: { forceValue: nullValue },
                    supported_activities: { forceValue: [] },
                };

                // EARLY ACTIONS
                if (reportType === 'EW') {
                    return {
                        ...baseSchemaTwo,
                        actions_taken: {
                            keySelector: (item) => item.organization,
                            member: (): ActionTakenListMember => ({
                                fields: (): ActionTakenField => ({
                                    organization: { required: true },
                                    actions: {},
                                    id: {},
                                    summary: {},
                                }),
                            }),
                        },
                        bulletin: {},
                    };
                }
                // ACTIONS - COVID
                if (reportType === 'COVID') {
                    return {
                        ...baseSchemaTwo,
                        actions_taken: {
                            keySelector: (item) => item.organization,
                            member: (): ActionTakenListMember => ({
                                fields: (): ActionTakenField => {
                                    const baseThree = {
                                        organization: { required: true },
                                        actions: {},
                                        id: {},
                                        summary: {},
                                    };
                                    // TODO:
                                    // Add condition on the actions.
                                    // The actions should only be submittable
                                    // when organization is NTLS
                                    return baseThree;
                                },
                            }),
                        },
                        num_localstaff: { validations: [positiveIntegerCondition] },
                        num_volunteers: { validations: [positiveIntegerCondition] },
                        notes_health: {},
                        notes_ns: {},
                        notes_socioeco: {},
                        external_partners: { defaultValue: [] },
                        supported_activities: { defaultValue: [] },
                    };
                }
                // ACTIONS - EPI / EVT
                return {
                    ...baseSchemaTwo,
                    actions_taken: {
                        keySelector: (item) => item.organization,
                        member: (): ActionTakenListMember => ({
                            fields: (): ActionTakenField => ({
                                organization: { required: true },
                                actions: {},
                                id: {},
                                summary: {},
                            }),
                        }),
                    },
                    num_localstaff: { validations: [positiveIntegerCondition] },
                    num_volunteers: { validations: [positiveIntegerCondition] },
                    num_expats_delegates: { validations: [positiveIntegerCondition] },
                    bulletin: {},
                };
            },
        );

        // RESPONSE

        baseSchema = addCondition(
            baseSchema,
            value,
            ['dref', 'dref_amount', 'status', 'is_covid_report', 'dtype'],
            ['dref', 'dref_amount'],
            (val) => {
                const reportType = getReportType(val?.status, val?.is_covid_report, val?.dtype);
                if (reportType === 'COVID') {
                    return {
                        dref: { forceValue: nullValue },
                        dref_amount: { forceValue: nullValue },
                    };
                }
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
            ['appeal', 'appeal_amount', 'status', 'is_covid_report', 'dtype'],
            ['appeal', 'appeal_amount'],
            (val) => {
                const reportType = getReportType(val?.status, val?.is_covid_report, val?.dtype);
                if (reportType === 'COVID') {
                    return {
                        appeal: { forceValue: nullValue },
                        appeal_amount: { forceValue: nullValue },
                    };
                }
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
            ['fact', 'num_fact', 'status', 'is_covid_report', 'dtype'],
            ['fact', 'num_fact'],
            (val) => {
                const reportType = getReportType(val?.status, val?.is_covid_report, val?.dtype);
                if (reportType === 'COVID') {
                    return {
                        fact: { forceValue: nullValue },
                        num_fact: { forceValue: nullValue },
                    };
                }
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
            ['ifrc_staff', 'num_ifrc_staff', 'status', 'is_covid_report', 'dtype'],
            ['ifrc_staff', 'num_ifrc_staff'],
            (val) => {
                const reportType = getReportType(val?.status, val?.is_covid_report, val?.dtype);
                if (reportType === 'COVID') {
                    return {
                        ifrc_staff: { forceValue: nullValue },
                        num_ifrc_staff: { forceValue: nullValue },
                    };
                }
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
            ['forecast_based_action', 'forecast_based_action_amount', 'status', 'is_covid_report', 'dtype'],
            ['forecast_based_action', 'forecast_based_action_amount'],
            (val) => {
                const reportType = getReportType(val?.status, val?.is_covid_report, val?.dtype);
                if (reportType !== 'EW') {
                    return {
                        forecast_based_action: { forceValue: nullValue },
                        forecast_based_action_amount: { forceValue: nullValue },
                    };
                }
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
