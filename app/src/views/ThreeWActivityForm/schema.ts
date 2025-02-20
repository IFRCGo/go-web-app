import { type RefObject } from 'react';
import { getDuplicates } from '@ifrc-go/ui/utils';
import {
    type DeepReplace,
    sumSafe,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    type Maybe,
    unique,
} from '@togglecorp/fujs';
import {
    addCondition,
    type ArraySchema,
    emailCondition,
    lessThanOrEqualToCondition,
    nullValue,
    type ObjectSchema,
    type PartialForm,
    requiredStringCondition,
    undefinedValue,
} from '@togglecorp/toggle-form';

import {
    dateGreaterThanOrEqualCondition,
    positiveIntegerCondition,
} from '#utils/form';
import { type GoApiBody } from '#utils/restRequest';

function lengthEqualToCondition(count: number) {
    return (value: Maybe<number[]>) => {
        if (count !== (value?.length ?? 0)) {
            // FIXME: use translations
            return 'There should be at least one activity in selected sectors.';
        }
        return undefined;
    };
}

function hasValueCondition(x: number) {
    return (value: Maybe<boolean>) => {
        if (!value && x === 0) {
            // FIXME: use translations
            return 'If data is not available for people, please check "No data on people reached"';
        }
        if (value && x > 0) {
            // FIXME: use translations
            return 'If data is available for people, please uncheck "No data on people reached"';
        }
        return undefined;
    };
}

type CustomSupplyItem = {
    client_id: string;
    supply_label: string;
    supply_value: number;
}

type ActionSupplyItem = {
    client_id: string;
    supply_action: string;
    supply_value: number;
}

export type ActivityRequestBody = GoApiBody<'/api/v2/emergency-project/{id}/', 'PATCH'>;
export type ActivityRequestPostBody = GoApiBody<'/api/v2/emergency-project/{id}/', 'POST'>;

type RawActivityItem = NonNullable<ActivityRequestBody['activities']>[number];

type ActivityItem = Omit<RawActivityItem, 'points' | 'custom_supplies' | 'supplies'> & {
    client_id: string;
    points: (NonNullable<RawActivityItem['points']>[number] & { client_id: string })[]
    custom_supplies: CustomSupplyItem[];
    supplies: ActionSupplyItem[];
};

type ActivityFormFields = DeepReplace<
    ActivityRequestBody,
    RawActivityItem,
    ActivityItem
>;

export type PartialActivityItem = PartialForm<ActivityItem, 'client_id'>;

export type PartialPointItem = PartialForm<NonNullable<ActivityItem['points']>[number], 'client_id'>;
export type PartialCustomSupplyItem = PartialForm<CustomSupplyItem, 'client_id'>;
export type PartialActionSupplyItem = PartialForm<ActionSupplyItem, 'client_id'>;

export type FormFields = ActivityFormFields & {
    sectors: number[];
};

export type FormType = PartialForm<FormFields, 'client_id'>;

type FormContext = RefObject<boolean>;

type FormSchema = ObjectSchema<FormType, FormType, FormContext>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type ActivityItemSchema = ObjectSchema<PartialActivityItem, FormType, FormContext>;
type ActivityItemSchemaFields = ReturnType<ActivityItemSchema['fields']>;

type ActivityItemsSchema = ArraySchema<PartialActivityItem, FormType, FormContext>;
type ActivityItemsSchemaMember = ReturnType<ActivityItemsSchema['member']>;

type PointItemSchema = ObjectSchema<PartialPointItem, FormType, FormContext>;
type PointItemSchemaFields = ReturnType<PointItemSchema['fields']>;

type PointItemsSchema = ArraySchema<PartialPointItem, FormType, FormContext>;
type PointItemsSchemaMember = ReturnType<PointItemsSchema['member']>;

type CustomSupplyItemSchema = ObjectSchema<PartialCustomSupplyItem, FormType, FormContext>;
type CustomSupplyItemSchemaFields = ReturnType<CustomSupplyItemSchema['fields']>;

type CustomSupplyItemsSchema = ArraySchema<PartialCustomSupplyItem, FormType, FormContext>;
type CustomSupplyItemsSchemaMember = ReturnType<CustomSupplyItemsSchema['member']>;

type ActionSupplyItemSchema = ObjectSchema<PartialActionSupplyItem, FormType, FormContext>;
type ActionSupplyItemSchemaFields = ReturnType<ActionSupplyItemSchema['fields']>;

type ActionSupplyItemsSchema = ArraySchema<PartialActionSupplyItem, FormType, FormContext>;
type ActionSupplyItemsSchemaMember = ReturnType<ActionSupplyItemsSchema['member']>;

// TODO: Conditional schema dependent on data other than data within the form is not added
const finalSchema: FormSchema = {
    fields: (value): FormSchemaFields => {
        let schema: FormSchemaFields = {
            event: { required: true },
            country: { required: true },
            districts: { defaultValue: [] },
            start_date: { required: true },
            // Note: Even though status is required field,
            // it's not marked required in the schema
            // because it is calculated automatically
            // using value start_date and end_date
            status: {},
            title: { required: true, requiredValidation: requiredStringCondition },
            activity_lead: { required: true },
        };

        schema = addCondition(
            schema,
            value,
            ['start_date', 'end_date'] as const,
            ['end_date'] as const,
            (props): Pick<FormSchemaFields, 'end_date'> => {
                if (props?.start_date) {
                    return {
                        end_date: {
                            required: true,
                            validations: [dateGreaterThanOrEqualCondition(props.start_date)],
                        },
                    };
                }
                return {
                    end_date: { required: true },
                };
            },
        );

        schema = addCondition(
            schema,
            value,
            ['activities', 'sectors'] as const,
            ['sectors'] as const,
            (val): Pick<FormSchemaFields, 'sectors'> => {
                const sectorsInActivities = unique(
                    val?.activities?.map((activity) => activity.sector).filter(isDefined) ?? [],
                    (item) => item,
                );

                return {
                    sectors: {
                        forceValue: undefinedValue,
                        validations: [
                            lengthEqualToCondition(sectorsInActivities?.length ?? 0),
                        ],
                    },
                };
            },
        );

        const reportingNsFields = [
            'reporting_ns',
            'reporting_ns_contact_name',
            'reporting_ns_contact_email',
            'reporting_ns_contact_role',
            'deployed_eru',
        ] as const;
        type ReportingNsSchema = Pick<FormSchemaFields, (typeof reportingNsFields)[number]>;
        schema = addCondition(
            schema,
            value,
            ['activity_lead'] as const,
            reportingNsFields,
            (props): ReportingNsSchema => {
                const baseReportingNsSchema: ReportingNsSchema = {
                    reporting_ns: { forceValue: nullValue },
                    reporting_ns_contact_name: { forceValue: nullValue },
                    reporting_ns_contact_role: { forceValue: nullValue },
                    reporting_ns_contact_email: { forceValue: nullValue },
                    deployed_eru: { forceValue: nullValue },
                };
                if (props?.activity_lead === 'national_society') {
                    return {
                        ...baseReportingNsSchema,
                        reporting_ns: { required: true },
                        reporting_ns_contact_name: {
                            required: true,
                            requiredValidation: requiredStringCondition,
                        },
                        reporting_ns_contact_role: {
                            required: true,
                            requiredValidation: requiredStringCondition,
                        },
                        reporting_ns_contact_email: {
                            required: true,
                            requiredValidation: requiredStringCondition,
                            validations: [emailCondition],
                        },
                    };
                }
                if (props?.activity_lead === 'deployed_eru') {
                    return {
                        ...baseReportingNsSchema,
                        deployed_eru: { required: true },
                    };
                }
                return baseReportingNsSchema;
            },
        );

        schema = addCondition(
            schema,
            value,
            ['sectors'] as const,
            ['activities'] as const,
            (props): Pick<FormSchemaFields, 'activities'> => {
                if ((props?.sectors?.length ?? 0) <= 0) {
                    return {
                        activities: { forceValue: [] },
                    };
                }
                return {
                    activities: {
                        keySelector: (activity) => activity.client_id,
                        member: (): ActivityItemsSchemaMember => ({
                            fields: (
                                activityValue,
                                _,
                                beforeSubmitRef,
                            ): ActivityItemSchemaFields => {
                                let activitySchema: ActivityItemSchemaFields = {
                                    // If you force it as undefined type
                                    // it will not be sent to the server
                                    client_id: { forceValue: undefinedValue },
                                    // id: {},
                                    details: {},
                                    is_simplified_report: { defaultValue: false },
                                    sector: { required: true },
                                    action: {},

                                    custom_supplies: {
                                        keySelector: (supply) => supply.client_id,
                                        member: (): CustomSupplyItemsSchemaMember => ({
                                            fields: (): CustomSupplyItemSchemaFields => ({
                                                client_id: { forceValue: undefinedValue },
                                                supply_label: {
                                                    required: true,
                                                    requiredValidation: requiredStringCondition,
                                                },
                                                supply_value: {
                                                    required: true,
                                                    validations: [
                                                        positiveIntegerCondition,
                                                    ],
                                                },
                                            }),
                                        }),
                                        validation: (val) => {
                                            const dups = getDuplicates(
                                                // eslint-disable-next-line max-len
                                                (val ?? []).map((item) => item.supply_label).filter(isDefined),
                                                (item) => item,
                                                (count) => count > 1,
                                            );
                                            if (dups.length >= 1) {
                                                return 'Duplicate supply items are not allowed';
                                            }

                                            return undefined;
                                        },
                                    },
                                };

                                activitySchema = addCondition(
                                    activitySchema,
                                    activityValue,
                                    [
                                        'is_simplified_report',
                                        'people_count',
                                        'household_count',
                                        'male_0_1_count',
                                        'male_2_5_count',
                                        'male_6_12_count',
                                        'male_13_17_count',
                                        'male_18_59_count',
                                        'male_60_plus_count',
                                        'male_unknown_age_count',
                                        'female_0_1_count',
                                        'female_2_5_count',
                                        'female_6_12_count',
                                        'female_13_17_count',
                                        'female_18_59_count',
                                        'female_60_plus_count',
                                        'female_unknown_age_count',
                                        'other_0_1_count',
                                        'other_2_5_count',
                                        'other_6_12_count',
                                        'other_13_17_count',
                                        'other_18_59_count',
                                        'other_60_plus_count',
                                        'other_unknown_age_count',
                                    ] as const,
                                    ['has_no_data_on_people_reached'] as const,
                                    (val): Pick<
                                        ActivityItemSchemaFields,
                                        'has_no_data_on_people_reached'
                                    > => {
                                        // NOTE: Do not show error before first submission
                                        // We set this value just before submission
                                        if (beforeSubmitRef.current) {
                                            return {
                                                has_no_data_on_people_reached: {},
                                            };
                                        }
                                        if (val?.is_simplified_report) {
                                            const totalPeople = sumSafe([
                                                val?.people_count,
                                                val?.household_count,
                                            ]) ?? 0;
                                            return {
                                                has_no_data_on_people_reached: {
                                                    defaultValue: undefinedValue,
                                                    validations: [
                                                        hasValueCondition(totalPeople),
                                                    ],
                                                },
                                            };
                                        }
                                        const totalPeople = sumSafe([
                                            val?.male_0_1_count,
                                            val?.female_0_1_count,
                                            val?.other_0_1_count,
                                            val?.male_2_5_count,
                                            val?.female_2_5_count,
                                            val?.other_2_5_count,
                                            val?.male_6_12_count,
                                            val?.female_6_12_count,
                                            val?.other_6_12_count,
                                            val?.male_13_17_count,
                                            val?.female_13_17_count,
                                            val?.other_13_17_count,
                                            val?.male_18_59_count,
                                            val?.female_18_59_count,
                                            val?.other_18_59_count,
                                            val?.male_60_plus_count,
                                            val?.female_60_plus_count,
                                            val?.other_60_plus_count,
                                            val?.male_unknown_age_count,
                                            val?.female_unknown_age_count,
                                            val?.other_unknown_age_count,
                                        ]) ?? 0;
                                        return {
                                            has_no_data_on_people_reached: {
                                                defaultValue: undefinedValue,
                                                validations: [
                                                    hasValueCondition(totalPeople),
                                                ],
                                            },
                                        };
                                    },
                                );

                                const actionSpecificFields = [
                                    'custom_action',
                                    'beneficiaries_count',
                                    'amount',
                                    'supplies',
                                ] as const;
                                type ActionSpecificFields = Pick<
                                    ActivityItemSchemaFields, (typeof actionSpecificFields)[number]
                                >;
                                activitySchema = addCondition(
                                    activitySchema,
                                    activityValue,
                                    ['action'] as const,
                                    actionSpecificFields,
                                    (val): ActionSpecificFields => {
                                        if (isDefined(val?.action)) {
                                            return {
                                                custom_action: { forceValue: nullValue },
                                                beneficiaries_count: {
                                                    validations: [positiveIntegerCondition],
                                                },
                                                amount: {
                                                    validations: [positiveIntegerCondition],
                                                },
                                                // FIXME: write validation for duplicate labels
                                                supplies: {
                                                    keySelector: (supply) => supply.client_id,
                                                    member: (): ActionSupplyItemsSchemaMember => ({
                                                        fields: ():
                                                            ActionSupplyItemSchemaFields => ({
                                                            client_id: {
                                                                forceValue: undefinedValue,
                                                            },
                                                            supply_action: { required: true },
                                                            supply_value: {
                                                                required: true,
                                                                validations: [
                                                                    positiveIntegerCondition,
                                                                ],
                                                            },
                                                        }),
                                                    }),
                                                    validation: (actionItem) => {
                                                        const dups = getDuplicates(
                                                            // eslint-disable-next-line max-len
                                                            (actionItem ?? []).map((item) => item.supply_action).filter(isDefined),
                                                            (item) => item,
                                                            (count) => count > 1,
                                                        );
                                                        if (dups.length >= 1) {
                                                            return 'Duplicate supply items are not allowed';
                                                        }

                                                        return undefined;
                                                    },
                                                },
                                            };
                                        }
                                        return {
                                            custom_action: {},
                                            beneficiaries_count: { forceValue: nullValue },
                                            amount: { forceValue: nullValue },
                                            supplies: { forceValue: [] },
                                        };
                                    },
                                );

                                const countFields = [
                                    'people_count',
                                    'male_count',
                                    'female_count',
                                    'people_households',
                                    'household_count',
                                ] as const;
                                type CountSchema = Pick<
                                    ActivityItemSchemaFields, (typeof countFields)[number]
                                >;
                                activitySchema = addCondition(
                                    activitySchema,
                                    activityValue,
                                    [
                                        'is_simplified_report',
                                        'people_households',
                                    ] as const,
                                    countFields,
                                    (val): CountSchema => {
                                        const fields: CountSchema = {
                                            people_count: {
                                                forceValue: nullValue,
                                            },
                                            male_count: {
                                                forceValue: nullValue,
                                            },
                                            female_count: {
                                                forceValue: nullValue,
                                            },
                                            household_count: {
                                                forceValue: nullValue,
                                            },
                                            people_households: {
                                                forceValue: nullValue,
                                            },
                                        };
                                        if (!val?.is_simplified_report) {
                                            return fields;
                                        }
                                        if (val?.people_households === 'households') {
                                            return {
                                                ...fields,
                                                household_count: {
                                                    validations: [positiveIntegerCondition],
                                                },
                                                people_households: {
                                                    required: true,
                                                },
                                            };
                                        }
                                        if (val?.people_households === 'people') {
                                            return {
                                                ...fields,
                                                people_count: {
                                                    validations: [positiveIntegerCondition],
                                                },
                                                male_count: {
                                                    validations: [positiveIntegerCondition],
                                                },
                                                female_count: {
                                                    validations: [positiveIntegerCondition],
                                                },
                                                people_households: {
                                                    required: true,
                                                },
                                            };
                                        }
                                        return fields;
                                    },
                                );

                                const locationFields = [
                                    'points',
                                    'point_count',
                                ] as const;
                                type LocationSchema = Pick<
                                    ActivityItemSchemaFields, (typeof locationFields)[number]
                                >;
                                activitySchema = addCondition(
                                    activitySchema,
                                    activityValue,
                                    ['is_simplified_report'],
                                    locationFields,
                                    (val): LocationSchema => {
                                        if (val?.is_simplified_report) {
                                            return {
                                                point_count: {},
                                                points: { forceValue: [] },
                                            };
                                        }
                                        return {
                                            point_count: { forceValue: nullValue },
                                            points: {
                                                // FIXME: Have at least one point
                                                keySelector: (point) => point.client_id,
                                                member: (): PointItemsSchemaMember => ({
                                                    fields: (): PointItemSchemaFields => ({
                                                        client_id: {
                                                            forceValue: undefinedValue,
                                                        },
                                                        // id: {},
                                                        longitude: { required: true },
                                                        latitude: { required: true },
                                                        description: {
                                                            required: true,
                                                            // eslint-disable-next-line max-len
                                                            requiredValidation: requiredStringCondition,
                                                        },
                                                    }),
                                                }),
                                            },
                                        };
                                    },
                                );

                                const disaggregationFields = [
                                    'male_0_1_count',
                                    'male_2_5_count',
                                    'male_6_12_count',
                                    'male_13_17_count',
                                    'male_18_59_count',
                                    'male_60_plus_count',
                                    'male_unknown_age_count',
                                    'female_0_1_count',
                                    'female_2_5_count',
                                    'female_6_12_count',
                                    'female_13_17_count',
                                    'female_18_59_count',
                                    'female_60_plus_count',
                                    'female_unknown_age_count',
                                    'other_0_1_count',
                                    'other_2_5_count',
                                    'other_6_12_count',
                                    'other_13_17_count',
                                    'other_18_59_count',
                                    'other_60_plus_count',
                                    'other_unknown_age_count',
                                    'is_disaggregated_for_disabled',
                                ] as const;
                                type DisaggregationSchema = Pick<
                                    ActivityItemSchemaFields, (typeof disaggregationFields)[number]
                                >;
                                activitySchema = addCondition(
                                    activitySchema,
                                    activityValue,
                                    ['is_simplified_report'] as const,
                                    disaggregationFields,
                                    (val): DisaggregationSchema => {
                                        if (!val?.is_simplified_report) {
                                            return {
                                                male_0_1_count: {
                                                    validations: [positiveIntegerCondition],
                                                },
                                                male_2_5_count: {
                                                    validations: [positiveIntegerCondition],
                                                },
                                                male_6_12_count: {
                                                    validations: [positiveIntegerCondition],
                                                },
                                                male_13_17_count: {
                                                    validations: [positiveIntegerCondition],
                                                },
                                                male_18_59_count: {
                                                    validations: [positiveIntegerCondition],
                                                },
                                                male_60_plus_count: {
                                                    validations: [positiveIntegerCondition],
                                                },
                                                male_unknown_age_count: {
                                                    validations: [positiveIntegerCondition],
                                                },
                                                female_0_1_count: {
                                                    validations: [positiveIntegerCondition],
                                                },
                                                female_2_5_count: {
                                                    validations: [positiveIntegerCondition],
                                                },
                                                female_6_12_count: {
                                                    validations: [positiveIntegerCondition],
                                                },
                                                female_13_17_count: {
                                                    validations: [positiveIntegerCondition],
                                                },
                                                female_18_59_count: {
                                                    validations: [positiveIntegerCondition],
                                                },
                                                female_60_plus_count: {
                                                    validations: [positiveIntegerCondition],
                                                },
                                                female_unknown_age_count: {
                                                    validations: [positiveIntegerCondition],
                                                },
                                                other_0_1_count: {
                                                    validations: [positiveIntegerCondition],
                                                },
                                                other_2_5_count: {
                                                    validations: [positiveIntegerCondition],
                                                },
                                                other_6_12_count: {
                                                    validations: [positiveIntegerCondition],
                                                },
                                                other_13_17_count: {
                                                    validations: [positiveIntegerCondition],
                                                },
                                                other_18_59_count: {
                                                    validations: [positiveIntegerCondition],
                                                },
                                                other_60_plus_count: {
                                                    validations: [positiveIntegerCondition],
                                                },
                                                other_unknown_age_count: {
                                                    validations: [positiveIntegerCondition],
                                                },

                                                is_disaggregated_for_disabled: {
                                                    defaultValue: false,
                                                },
                                            };
                                        }
                                        return {
                                            male_0_1_count: { forceValue: nullValue },
                                            male_2_5_count: { forceValue: nullValue },
                                            male_6_12_count: { forceValue: nullValue },
                                            male_13_17_count: { forceValue: nullValue },
                                            male_18_59_count: { forceValue: nullValue },
                                            male_60_plus_count: { forceValue: nullValue },
                                            male_unknown_age_count: { forceValue: nullValue },
                                            female_0_1_count: { forceValue: nullValue },
                                            female_2_5_count: { forceValue: nullValue },
                                            female_6_12_count: { forceValue: nullValue },
                                            female_13_17_count: { forceValue: nullValue },
                                            female_18_59_count: { forceValue: nullValue },
                                            female_60_plus_count: { forceValue: nullValue },
                                            female_unknown_age_count: { forceValue: nullValue },
                                            other_0_1_count: { forceValue: nullValue },
                                            other_2_5_count: { forceValue: nullValue },
                                            other_6_12_count: { forceValue: nullValue },
                                            other_13_17_count: { forceValue: nullValue },
                                            other_18_59_count: { forceValue: nullValue },
                                            other_60_plus_count: { forceValue: nullValue },
                                            other_unknown_age_count: { forceValue: nullValue },

                                            is_disaggregated_for_disabled: {
                                                forceValue: nullValue,
                                            },
                                        };
                                    },
                                );

                                const disaggregationCountDeps = [
                                    ['male_0_1_count', 'disabled_male_0_1_count'],
                                    ['male_2_5_count', 'disabled_male_2_5_count'],
                                    ['male_6_12_count', 'disabled_male_6_12_count'],
                                    ['male_13_17_count', 'disabled_male_13_17_count'],
                                    ['male_18_59_count', 'disabled_male_18_59_count'],
                                    ['male_60_plus_count', 'disabled_male_60_plus_count'],
                                    ['male_unknown_age_count', 'disabled_male_unknown_age_count'],
                                    ['female_0_1_count', 'disabled_female_0_1_count'],
                                    ['female_2_5_count', 'disabled_female_2_5_count'],
                                    ['female_6_12_count', 'disabled_female_6_12_count'],
                                    ['female_13_17_count', 'disabled_female_13_17_count'],
                                    ['female_18_59_count', 'disabled_female_18_59_count'],
                                    ['female_60_plus_count', 'disabled_female_60_plus_count'],
                                    ['female_unknown_age_count', 'disabled_female_unknown_age_count'],
                                    ['other_0_1_count', 'disabled_other_0_1_count'],
                                    ['other_2_5_count', 'disabled_other_2_5_count'],
                                    ['other_6_12_count', 'disabled_other_6_12_count'],
                                    ['other_13_17_count', 'disabled_other_13_17_count'],
                                    ['other_18_59_count', 'disabled_other_18_59_count'],
                                    ['other_60_plus_count', 'disabled_other_60_plus_count'],
                                    ['other_unknown_age_count', 'disabled_other_unknown_age_count'],
                                ] as const;

                                type DependentOn = (typeof disaggregationCountDeps)[number][0];
                                type Dependent = (typeof disaggregationCountDeps)[number][1];
                                function updateSchemaForDisabledDisaggregation(
                                    dependentOn: DependentOn,
                                    dependent: Dependent,
                                ) {
                                    return addCondition(
                                        activitySchema,
                                        activityValue,
                                        [
                                            'is_simplified_report',
                                            'is_disaggregated_for_disabled',
                                            dependentOn,
                                        ] as const,
                                        [dependent] as const,
                                        (val): Pick<
                                            ActivityItemSchemaFields,
                                            typeof dependent
                                        > => {
                                            if (
                                                val?.is_simplified_report
                                                || !val?.is_disaggregated_for_disabled
                                            ) {
                                                return {
                                                    [dependent]: {
                                                        forceValue: nullValue,
                                                    },
                                                };
                                            }
                                            return {
                                                [dependent]: {
                                                    validations: [
                                                        lessThanOrEqualToCondition(
                                                            val?.[dependentOn] ?? 0,
                                                        ),
                                                        positiveIntegerCondition,
                                                    ],
                                                },
                                            };
                                        },
                                    );
                                }
                                disaggregationCountDeps.forEach(([dependentOn, dependent]) => {
                                    // eslint-disable-next-line max-len
                                    activitySchema = updateSchemaForDisabledDisaggregation(dependentOn, dependent);
                                });

                                return activitySchema;
                            },
                        }),
                    },
                };
            },
        );

        return schema;
    },
};

export default finalSchema;
