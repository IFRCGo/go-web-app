import { type RefObject } from 'react';
import {
    type ArraySchema,
    type PartialForm,
    type ObjectSchema,
    undefinedValue,
    emailCondition,
    lessThanOrEqualToCondition,
    addCondition,
    nullValue,
} from '@togglecorp/toggle-form';
import {
    isDefined,
    unique,
    type Maybe,
} from '@togglecorp/fujs';

import {
    positiveIntegerCondition,
    dateGreaterThanOrEqualCondition,
} from '#utils/form';
import {
    type DeepReplace,
    sumSafe,
} from '#utils/common';
import { type GoApiBody } from '#utils/restRequest';

function lengthEqualToCondition(count: number) {
    return (value: Maybe<number[]>) => {
        if (count !== (value?.length ?? 0)) {
            // FIXME: Add translations
            return 'There should be at least one activity in selected sectors.';
        }
        return undefined;
    };
}

function hasValue(x: number) {
    return (value: Maybe<boolean>) => {
        if (!value && x === 0) {
            // FIXME: Add translations
            return 'If data is not available for people, please check "No data on people reached"';
        }
        if (value && x > 0) {
            // FIXME: Add translations
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

export type ActivityResponseBody = GoApiBody<'/api/v2/emergency-project/{id}/', 'PUT'>;
type RawActivityItem = NonNullable<ActivityResponseBody['activities']>[number];
type ActivityItem = NonNullable<ActivityResponseBody['activities']>[number] & {
    client_id: string;
    points?: (NonNullable<RawActivityItem['points']>[number] & { client_id: string })[]
    custom_supplies: CustomSupplyItem[];
    supplies: ActionSupplyItem[];
};
type ActivityFormFields = DeepReplace<
    ActivityResponseBody,
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
            title: { required: true },
            event: { required: true },
            activity_lead: { required: true },
            country: { required: true },
            districts: { defaultValue: [] },
            start_date: { required: true },
            status: {},
        };

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
                if (props?.activity_lead === 'national_society') {
                    return {
                        reporting_ns: { required: true },
                        reporting_ns_contact_name: { required: true },
                        reporting_ns_contact_email: {
                            required: true,
                            validations: [emailCondition],
                        },
                        reporting_ns_contact_role: { required: true },
                        deployed_eru: { forceValue: undefinedValue },
                    };
                }
                if (props?.activity_lead === 'deployed_eru') {
                    return {
                        reporting_ns: { forceValue: undefinedValue },
                        reporting_ns_contact_name: { forceValue: undefinedValue },
                        reporting_ns_contact_role: { forceValue: undefinedValue },
                        reporting_ns_contact_email: { forceValue: undefinedValue },
                        deployed_eru: { required: true },
                    };
                }
                return {
                    reporting_ns: { forceValue: undefinedValue },
                    deployed_eru: { forceValue: undefinedValue },
                    reporting_ns_contact_name: { forceValue: undefinedValue },
                    reporting_ns_contact_role: { forceValue: undefinedValue },
                    reporting_ns_contact_email: { forceValue: undefinedValue },
                };
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
                        activities: { forceValue: undefinedValue },
                    };
                }
                return {
                    activities: {
                        keySelector: (activity) => activity.client_id as string,
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
                                    id: {},
                                    details: {},
                                    is_simplified_report: { defaultValue: true },
                                    sector: { required: true },
                                    action: {},

                                    // TODO: write validation for duplicate labels
                                    custom_supplies: {
                                        keySelector: (supply) => supply.client_id as string,
                                        member: (): CustomSupplyItemsSchemaMember => ({
                                            fields: (): CustomSupplyItemSchemaFields => ({
                                                client_id: { forceValue: undefinedValue },
                                                supply_label: { required: true },
                                                supply_value: { required: true },
                                            }),
                                        }),
                                    },
                                };

                                activitySchema = addCondition(
                                    activitySchema,
                                    activityValue,
                                    [
                                        'is_simplified_report',
                                        'is_disaggregated_for_disabled',
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
                                                        hasValue(totalPeople),
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
                                                    hasValue(totalPeople),
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
                                                beneficiaries_count: {},
                                                amount: {
                                                    validations: [positiveIntegerCondition],
                                                },
                                                // TODO: write validation for duplicate labels
                                                supplies: {
                                                    keySelector: (supply) => (
                                                        supply.client_id as string
                                                    ),
                                                    member: (): ActionSupplyItemsSchemaMember => ({
                                                        fields: ():
                                                            ActionSupplyItemSchemaFields => ({
                                                            client_id: {
                                                                forceValue: undefinedValue,
                                                            },
                                                            supply_action: { required: true },
                                                            supply_value: { required: true },
                                                        }),
                                                    }),
                                                },
                                            };
                                        }
                                        return {
                                            custom_action: {},
                                            beneficiaries_count: { forceValue: nullValue },
                                            amount: { forceValue: nullValue },
                                            supplies: { forceValue: nullValue },
                                        };
                                    },
                                );

                                activitySchema = addCondition(
                                    activitySchema,
                                    activityValue,
                                    ['action', 'is_simplified_report'] as const,
                                    ['point_count'] as const,
                                    (val): Pick<ActivityItemSchemaFields, 'point_count'> => {
                                        if (isDefined(val?.action) && val?.is_simplified_report) {
                                            return {
                                                point_count: {},
                                            };
                                        }
                                        return {
                                            point_count: { forceValue: nullValue },
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
                                                male_0_1_count: {},
                                                male_2_5_count: {},
                                                male_6_12_count: {},
                                                male_13_17_count: {},
                                                male_18_59_count: {},
                                                male_60_plus_count: {},
                                                male_unknown_age_count: {},
                                                female_0_1_count: {},
                                                female_2_5_count: {},
                                                female_6_12_count: {},
                                                female_13_17_count: {},
                                                female_18_59_count: {},
                                                female_60_plus_count: {},
                                                female_unknown_age_count: {},
                                                other_0_1_count: {},
                                                other_2_5_count: {},
                                                other_6_12_count: {},
                                                other_13_17_count: {},
                                                other_18_59_count: {},
                                                other_60_plus_count: {},
                                                other_unknown_age_count: {},

                                                is_disaggregated_for_disabled: {
                                                    defaultValue: undefinedValue,
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

                                activitySchema = addCondition(
                                    activitySchema,
                                    activityValue,
                                    ['is_simplified_report'] as const,
                                    ['points'] as const,
                                    (val): Pick<ActivityItemSchemaFields, 'points'> => {
                                        if (!val?.is_simplified_report) {
                                            return {
                                                points: {
                                                    // FIXME: Have at least one point
                                                    keySelector: (point) => (
                                                        point.client_id as string
                                                    ),
                                                    member: (): PointItemsSchemaMember => ({
                                                        fields: (): PointItemSchemaFields => ({
                                                            client_id: {
                                                                forceValue: undefinedValue,
                                                            },
                                                            id: {},
                                                            longitude: { required: true },
                                                            latitude: { required: true },
                                                            description: { required: true },
                                                        }),
                                                    }),
                                                },
                                            };
                                        }
                                        return {
                                            points: { forceValue: [] },
                                        };
                                    },
                                );

                                // Disabled male
                                activitySchema = addCondition(
                                    activitySchema,
                                    activityValue,
                                    [
                                        'is_simplified_report',
                                        'is_disaggregated_for_disabled',
                                        'male_0_1_count',
                                    ] as const,
                                    ['disabled_male_0_1_count'] as const,
                                    (val): Pick<
                                        ActivityItemSchemaFields,
                                        'disabled_male_0_1_count'
                                    > => {
                                        if (
                                            val?.is_simplified_report
                                            || !val?.is_disaggregated_for_disabled
                                        ) {
                                            return {
                                                disabled_male_0_1_count: {
                                                    forceValue: nullValue,
                                                },
                                            };
                                        }
                                        return {
                                            disabled_male_0_1_count: {
                                                validations: [
                                                    lessThanOrEqualToCondition(
                                                        val?.male_0_1_count ?? 0,
                                                    ),
                                                    positiveIntegerCondition,
                                                ],
                                            },
                                        };
                                    },
                                );
                                activitySchema = addCondition(
                                    activitySchema,
                                    activityValue,
                                    [
                                        'is_simplified_report',
                                        'is_disaggregated_for_disabled',
                                        'male_2_5_count',
                                    ] as const,
                                    ['disabled_male_2_5_count'] as const,
                                    (val): Pick<
                                        ActivityItemSchemaFields,
                                        'disabled_male_2_5_count'
                                    > => {
                                        if (
                                            val?.is_simplified_report
                                            || !val?.is_disaggregated_for_disabled
                                        ) {
                                            return {
                                                disabled_male_2_5_count: {
                                                    forceValue: nullValue,
                                                },
                                            };
                                        }
                                        return {
                                            disabled_male_2_5_count: {
                                                validations: [
                                                    lessThanOrEqualToCondition(
                                                        val?.male_2_5_count ?? 0,
                                                    ),
                                                    positiveIntegerCondition,
                                                ],
                                            },
                                        };
                                    },
                                );
                                activitySchema = addCondition(
                                    activitySchema,
                                    activityValue,
                                    [
                                        'is_simplified_report',
                                        'is_disaggregated_for_disabled',
                                        'male_6_12_count',
                                    ] as const,
                                    ['disabled_male_6_12_count'] as const,
                                    (val): Pick<
                                        ActivityItemSchemaFields,
                                        'disabled_male_6_12_count'
                                    > => {
                                        if (
                                            val?.is_simplified_report
                                            || !val?.is_disaggregated_for_disabled
                                        ) {
                                            return {
                                                disabled_male_6_12_count: {
                                                    forceValue: nullValue,
                                                },
                                            };
                                        }
                                        return {
                                            disabled_male_6_12_count: {
                                                validations: [
                                                    lessThanOrEqualToCondition(
                                                        val?.male_6_12_count ?? 0,
                                                    ),
                                                    positiveIntegerCondition,
                                                ],
                                            },
                                        };
                                    },
                                );
                                activitySchema = addCondition(
                                    activitySchema,
                                    activityValue,
                                    [
                                        'is_simplified_report',
                                        'is_disaggregated_for_disabled',
                                        'male_13_17_count',
                                    ] as const,
                                    ['disabled_male_13_17_count'] as const,
                                    (val): Pick<
                                        ActivityItemSchemaFields,
                                        'disabled_male_13_17_count'
                                    > => {
                                        if (
                                            val?.is_simplified_report
                                            || !val?.is_disaggregated_for_disabled
                                        ) {
                                            return {
                                                disabled_male_13_17_count: {
                                                    forceValue: nullValue,
                                                },
                                            };
                                        }
                                        return {
                                            disabled_male_13_17_count: {
                                                validations: [
                                                    lessThanOrEqualToCondition(
                                                        val?.male_13_17_count ?? 0,
                                                    ),
                                                    positiveIntegerCondition,
                                                ],
                                            },
                                        };
                                    },
                                );
                                activitySchema = addCondition(
                                    activitySchema,
                                    activityValue,
                                    [
                                        'is_simplified_report',
                                        'is_disaggregated_for_disabled',
                                        'male_18_59_count',
                                    ] as const,
                                    ['disabled_male_18_59_count'] as const,
                                    (val): Pick<
                                        ActivityItemSchemaFields,
                                        'disabled_male_18_59_count'
                                    > => {
                                        if (
                                            val?.is_simplified_report
                                            || !val?.is_disaggregated_for_disabled
                                        ) {
                                            return {
                                                disabled_male_18_59_count: {
                                                    forceValue: nullValue,
                                                },
                                            };
                                        }
                                        return {
                                            disabled_male_18_59_count: {
                                                validations: [
                                                    lessThanOrEqualToCondition(
                                                        val?.male_18_59_count ?? 0,
                                                    ),
                                                    positiveIntegerCondition,
                                                ],
                                            },
                                        };
                                    },
                                );
                                activitySchema = addCondition(
                                    activitySchema,
                                    activityValue,
                                    [
                                        'is_simplified_report',
                                        'is_disaggregated_for_disabled',
                                        'male_60_plus_count',
                                    ] as const,
                                    ['disabled_male_60_plus_count'] as const,
                                    (val): Pick<
                                        ActivityItemSchemaFields,
                                        'disabled_male_60_plus_count'
                                    > => {
                                        if (
                                            val?.is_simplified_report
                                            || !val?.is_disaggregated_for_disabled
                                        ) {
                                            return {
                                                disabled_male_60_plus_count: {
                                                    forceValue: nullValue,
                                                },
                                            };
                                        }
                                        return {
                                            disabled_male_60_plus_count: {
                                                validations: [
                                                    lessThanOrEqualToCondition(
                                                        val?.male_60_plus_count ?? 0,
                                                    ),
                                                    positiveIntegerCondition,
                                                ],
                                            },
                                        };
                                    },
                                );
                                activitySchema = addCondition(
                                    activitySchema,
                                    activityValue,
                                    [
                                        'is_simplified_report',
                                        'is_disaggregated_for_disabled',
                                        'male_unknown_age_count',
                                    ] as const,
                                    ['disabled_male_unknown_age_count'] as const,
                                    (val): Pick<
                                        ActivityItemSchemaFields,
                                        'disabled_male_unknown_age_count'
                                    > => {
                                        if (
                                            val?.is_simplified_report
                                            || !val?.is_disaggregated_for_disabled
                                        ) {
                                            return {
                                                disabled_male_unknown_age_count: {
                                                    forceValue: nullValue,
                                                },
                                            };
                                        }
                                        return {
                                            disabled_male_unknown_age_count: {
                                                validations: [
                                                    lessThanOrEqualToCondition(
                                                        val?.male_unknown_age_count ?? 0,
                                                    ),
                                                    positiveIntegerCondition,
                                                ],
                                            },
                                        };
                                    },
                                );

                                // Disabled female
                                activitySchema = addCondition(
                                    activitySchema,
                                    activityValue,
                                    [
                                        'is_simplified_report',
                                        'is_disaggregated_for_disabled',
                                        'female_0_1_count',
                                    ] as const,
                                    ['disabled_female_0_1_count'] as const,
                                    (val): Pick<
                                        ActivityItemSchemaFields,
                                        'disabled_female_0_1_count'
                                    > => {
                                        if (
                                            val?.is_simplified_report
                                            || !val?.is_disaggregated_for_disabled
                                        ) {
                                            return {
                                                disabled_female_0_1_count: {
                                                    forceValue: nullValue,
                                                },
                                            };
                                        }
                                        return {
                                            disabled_female_0_1_count: {
                                                validations: [
                                                    lessThanOrEqualToCondition(
                                                        val?.female_0_1_count ?? 0,
                                                    ),
                                                    positiveIntegerCondition,
                                                ],
                                            },
                                        };
                                    },
                                );
                                activitySchema = addCondition(
                                    activitySchema,
                                    activityValue,
                                    [
                                        'is_simplified_report',
                                        'is_disaggregated_for_disabled',
                                        'female_2_5_count',
                                    ] as const,
                                    ['disabled_female_2_5_count'] as const,
                                    (val): Pick<
                                        ActivityItemSchemaFields,
                                        'disabled_female_2_5_count'
                                    > => {
                                        if (
                                            val?.is_simplified_report
                                            || !val?.is_disaggregated_for_disabled
                                        ) {
                                            return {
                                                disabled_female_2_5_count: {
                                                    forceValue: nullValue,
                                                },
                                            };
                                        }
                                        return {
                                            disabled_female_2_5_count: {
                                                validations: [
                                                    lessThanOrEqualToCondition(
                                                        val?.female_2_5_count ?? 0,
                                                    ),
                                                    positiveIntegerCondition,
                                                ],
                                            },
                                        };
                                    },
                                );
                                activitySchema = addCondition(
                                    activitySchema,
                                    activityValue,
                                    [
                                        'is_simplified_report',
                                        'is_disaggregated_for_disabled',
                                        'female_6_12_count',
                                    ] as const,
                                    ['disabled_female_6_12_count'] as const,
                                    (val): Pick<
                                        ActivityItemSchemaFields,
                                        'disabled_female_6_12_count'
                                    > => {
                                        if (
                                            val?.is_simplified_report
                                            || !val?.is_disaggregated_for_disabled
                                        ) {
                                            return {
                                                disabled_female_6_12_count: {
                                                    forceValue: nullValue,
                                                },
                                            };
                                        }
                                        return {
                                            disabled_female_6_12_count: {
                                                validations: [
                                                    lessThanOrEqualToCondition(
                                                        val?.female_6_12_count ?? 0,
                                                    ),
                                                    positiveIntegerCondition,
                                                ],
                                            },
                                        };
                                    },
                                );
                                activitySchema = addCondition(
                                    activitySchema,
                                    activityValue,
                                    [
                                        'is_simplified_report',
                                        'is_disaggregated_for_disabled',
                                        'female_13_17_count',
                                    ] as const,
                                    ['disabled_female_13_17_count'] as const,
                                    (val): Pick<
                                        ActivityItemSchemaFields,
                                        'disabled_female_13_17_count'
                                    > => {
                                        if (
                                            val?.is_simplified_report
                                            || !val?.is_disaggregated_for_disabled
                                        ) {
                                            return {
                                                disabled_female_13_17_count: {
                                                    forceValue: nullValue,
                                                },
                                            };
                                        }
                                        return {
                                            disabled_female_13_17_count: {
                                                validations: [
                                                    lessThanOrEqualToCondition(
                                                        val?.female_13_17_count ?? 0,
                                                    ),
                                                    positiveIntegerCondition,
                                                ],
                                            },
                                        };
                                    },
                                );
                                activitySchema = addCondition(
                                    activitySchema,
                                    activityValue,
                                    [
                                        'is_simplified_report',
                                        'is_disaggregated_for_disabled',
                                        'female_18_59_count',
                                    ] as const,
                                    ['disabled_female_18_59_count'] as const,
                                    (val): Pick<
                                        ActivityItemSchemaFields,
                                        'disabled_female_18_59_count'
                                    > => {
                                        if (
                                            val?.is_simplified_report
                                            || !val?.is_disaggregated_for_disabled
                                        ) {
                                            return {
                                                disabled_female_18_59_count: {
                                                    forceValue: nullValue,
                                                },
                                            };
                                        }
                                        return {
                                            disabled_female_18_59_count: {
                                                validations: [
                                                    lessThanOrEqualToCondition(
                                                        val?.female_18_59_count ?? 0,
                                                    ),
                                                    positiveIntegerCondition,
                                                ],
                                            },
                                        };
                                    },
                                );
                                activitySchema = addCondition(
                                    activitySchema,
                                    activityValue,
                                    [
                                        'is_simplified_report',
                                        'is_disaggregated_for_disabled',
                                        'female_60_plus_count',
                                    ] as const,
                                    ['disabled_female_60_plus_count'] as const,
                                    (val): Pick<
                                        ActivityItemSchemaFields,
                                        'disabled_female_60_plus_count'
                                    > => {
                                        if (
                                            val?.is_simplified_report
                                            || !val?.is_disaggregated_for_disabled
                                        ) {
                                            return {
                                                disabled_female_60_plus_count: {
                                                    forceValue: nullValue,
                                                },
                                            };
                                        }
                                        return {
                                            disabled_female_60_plus_count: {
                                                validations: [
                                                    lessThanOrEqualToCondition(
                                                        val?.female_60_plus_count ?? 0,
                                                    ),
                                                    positiveIntegerCondition,
                                                ],
                                            },
                                        };
                                    },
                                );
                                activitySchema = addCondition(
                                    activitySchema,
                                    activityValue,
                                    [
                                        'is_simplified_report',
                                        'is_disaggregated_for_disabled',
                                        'female_unknown_age_count',
                                    ] as const,
                                    ['disabled_female_unknown_age_count'] as const,
                                    (val): Pick<
                                        ActivityItemSchemaFields,
                                        'disabled_female_unknown_age_count'
                                    > => {
                                        if (
                                            val?.is_simplified_report
                                            || !val?.is_disaggregated_for_disabled
                                        ) {
                                            return {
                                                disabled_female_unknown_age_count: {
                                                    forceValue: nullValue,
                                                },
                                            };
                                        }
                                        return {
                                            disabled_female_unknown_age_count: {
                                                validations: [
                                                    lessThanOrEqualToCondition(
                                                        val?.female_unknown_age_count ?? 0,
                                                    ),
                                                    positiveIntegerCondition,
                                                ],
                                            },
                                        };
                                    },
                                );

                                // Disabled other
                                activitySchema = addCondition(
                                    activitySchema,
                                    activityValue,
                                    [
                                        'is_simplified_report',
                                        'is_disaggregated_for_disabled',
                                        'other_0_1_count',
                                    ] as const,
                                    ['disabled_other_0_1_count'] as const,
                                    (val): Pick<
                                        ActivityItemSchemaFields,
                                        'disabled_other_0_1_count'
                                    > => {
                                        if (
                                            val?.is_simplified_report
                                            || !val?.is_disaggregated_for_disabled
                                        ) {
                                            return {
                                                disabled_other_0_1_count: {
                                                    forceValue: nullValue,
                                                },
                                            };
                                        }
                                        return {
                                            disabled_other_0_1_count: {
                                                validations: [
                                                    lessThanOrEqualToCondition(
                                                        val?.other_0_1_count ?? 0,
                                                    ),
                                                    positiveIntegerCondition,
                                                ],
                                            },
                                        };
                                    },
                                );
                                activitySchema = addCondition(
                                    activitySchema,
                                    activityValue,
                                    [
                                        'is_simplified_report',
                                        'is_disaggregated_for_disabled',
                                        'other_2_5_count',
                                    ] as const,
                                    ['disabled_other_2_5_count'] as const,
                                    (val): Pick<
                                        ActivityItemSchemaFields,
                                        'disabled_other_2_5_count'
                                    > => {
                                        if (
                                            val?.is_simplified_report
                                            || !val?.is_disaggregated_for_disabled
                                        ) {
                                            return {
                                                disabled_other_2_5_count: {
                                                    forceValue: nullValue,
                                                },
                                            };
                                        }
                                        return {
                                            disabled_other_2_5_count: {
                                                validations: [
                                                    lessThanOrEqualToCondition(
                                                        val?.other_2_5_count ?? 0,
                                                    ),
                                                    positiveIntegerCondition,
                                                ],
                                            },
                                        };
                                    },
                                );
                                activitySchema = addCondition(
                                    activitySchema,
                                    activityValue,
                                    [
                                        'is_simplified_report',
                                        'is_disaggregated_for_disabled',
                                        'other_6_12_count',
                                    ] as const,
                                    ['disabled_other_6_12_count'] as const,
                                    (val): Pick<
                                        ActivityItemSchemaFields,
                                        'disabled_other_6_12_count'
                                    > => {
                                        if (
                                            val?.is_simplified_report
                                            || !val?.is_disaggregated_for_disabled
                                        ) {
                                            return {
                                                disabled_other_6_12_count: {
                                                    forceValue: nullValue,
                                                },
                                            };
                                        }
                                        return {
                                            disabled_other_6_12_count: {
                                                validations: [
                                                    lessThanOrEqualToCondition(
                                                        val?.other_6_12_count ?? 0,
                                                    ),
                                                    positiveIntegerCondition,
                                                ],
                                            },
                                        };
                                    },
                                );
                                activitySchema = addCondition(
                                    activitySchema,
                                    activityValue,
                                    [
                                        'is_simplified_report',
                                        'is_disaggregated_for_disabled',
                                        'other_13_17_count',
                                    ] as const,
                                    ['disabled_other_13_17_count'] as const,
                                    (val): Pick<
                                        ActivityItemSchemaFields,
                                        'disabled_other_13_17_count'
                                    > => {
                                        if (
                                            val?.is_simplified_report
                                            || !val?.is_disaggregated_for_disabled
                                        ) {
                                            return {
                                                disabled_other_13_17_count: {
                                                    forceValue: nullValue,
                                                },
                                            };
                                        }
                                        return {
                                            disabled_other_13_17_count: {
                                                validations: [
                                                    lessThanOrEqualToCondition(
                                                        val?.other_13_17_count ?? 0,
                                                    ),
                                                    positiveIntegerCondition,
                                                ],
                                            },
                                        };
                                    },
                                );
                                activitySchema = addCondition(
                                    activitySchema,
                                    activityValue,
                                    [
                                        'is_simplified_report',
                                        'is_disaggregated_for_disabled',
                                        'other_18_59_count',
                                    ] as const,
                                    ['disabled_other_18_59_count'] as const,
                                    (val): Pick<
                                        ActivityItemSchemaFields,
                                        'disabled_other_18_59_count'
                                    > => {
                                        if (
                                            val?.is_simplified_report
                                            || !val?.is_disaggregated_for_disabled
                                        ) {
                                            return {
                                                disabled_other_18_59_count: {
                                                    forceValue: nullValue,
                                                },
                                            };
                                        }
                                        return {
                                            disabled_other_18_59_count: {
                                                validations: [
                                                    lessThanOrEqualToCondition(
                                                        val?.other_18_59_count ?? 0,
                                                    ),
                                                    positiveIntegerCondition,
                                                ],
                                            },
                                        };
                                    },
                                );
                                activitySchema = addCondition(
                                    activitySchema,
                                    activityValue,
                                    [
                                        'is_simplified_report',
                                        'is_disaggregated_for_disabled',
                                        'other_60_plus_count',
                                    ] as const,
                                    ['disabled_other_60_plus_count'] as const,
                                    (val): Pick<
                                        ActivityItemSchemaFields,
                                        'disabled_other_60_plus_count'
                                    > => {
                                        if (
                                            val?.is_simplified_report
                                            || !val?.is_disaggregated_for_disabled
                                        ) {
                                            return {
                                                disabled_other_60_plus_count: {
                                                    forceValue: nullValue,
                                                },
                                            };
                                        }
                                        return {
                                            disabled_other_60_plus_count: {
                                                validations: [
                                                    lessThanOrEqualToCondition(
                                                        val?.other_60_plus_count ?? 0,
                                                    ),
                                                    positiveIntegerCondition,
                                                ],
                                            },
                                        };
                                    },
                                );
                                activitySchema = addCondition(
                                    activitySchema,
                                    activityValue,
                                    [
                                        'is_simplified_report',
                                        'is_disaggregated_for_disabled',
                                        'other_unknown_age_count',
                                    ] as const,
                                    ['disabled_other_unknown_age_count'] as const,
                                    (val): Pick<
                                        ActivityItemSchemaFields,
                                        'disabled_other_unknown_age_count'
                                    > => {
                                        if (
                                            val?.is_simplified_report
                                            || !val?.is_disaggregated_for_disabled
                                        ) {
                                            return {
                                                disabled_other_unknown_age_count: {
                                                    forceValue: nullValue,
                                                },
                                            };
                                        }
                                        return {
                                            disabled_other_unknown_age_count: {
                                                validations: [
                                                    lessThanOrEqualToCondition(
                                                        val?.other_unknown_age_count ?? 0,
                                                    ),
                                                    positiveIntegerCondition,
                                                ],
                                            },
                                        };
                                    },
                                );

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
