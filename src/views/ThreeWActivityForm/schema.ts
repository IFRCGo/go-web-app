import {
    PartialForm,
    ObjectSchema,
    undefinedValue,
    ArraySchema,
    addCondition,
} from '@togglecorp/toggle-form';

import {
    positiveIntegerCondition,
    dateGreaterThanOrEqualCondition,
} from '#utils/form';
import { type DeepReplace } from '#utils/common';

import type { paths } from '#generated/types';

type ActivityResponseBody = paths['/api/v2/emergency-project/{id}/']['put']['requestBody']['content']['application/json'];
type RawActivityItem = NonNullable<ActivityResponseBody['activities']>[number];
type ActivityItem = NonNullable<ActivityResponseBody['activities']>[number] & {
    client_id: string;
};
type ActivityFormFields = DeepReplace<
    ActivityResponseBody,
    RawActivityItem,
    ActivityItem
>;

export type PartialActivityItem = PartialForm<ActivityItem, 'client_id'>;
type A = PartialActivityItem['custom_action'];

type FormFields = ActivityFormFields & {
    sectors: number[];
};

export type FormType = PartialForm<FormFields, 'client_id'>;

type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type ActivityItemSchema = ObjectSchema<PartialActivityItem, FormType>;
type ActivityItemSchemaFields = ReturnType<ActivityItemSchema['fields']>;

type ActivityItemsSchema = ArraySchema<PartialActivityItem, FormType>; // plural: Splits
type ActivityItemsSchemaMember = ReturnType<ActivityItemsSchema['member']>; // plural: Splits

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
            ['start_date', 'end_date'] as const,
            ['end_date'] as const,
            (props) => {
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
            ['activity_lead'] as const,
            [
                'reporting_ns',
                'reporting_ns_contact_name',
                'reporting_ns_contact_email',
                'reporting_ns_contact_role',
            ] as const,
            (props) => {
                if (props?.activity_lead === 'national_society') {
                    return {
                        reporting_ns: { required: true },
                        reporting_ns_contact_name: { required: true },
                        reporting_ns_contact_email: { required: true },
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
            (props) => {
                if ((props?.sectors?.length ?? 0) <= 0) {
                    return {
                        activities: { forceValue: undefinedValue },
                    };
                }
                return {
                    activities: {
                        keySelector: (activity) => activity.client_id as string,
                        member: (): ActivityItemsSchemaMember => ({
                            fields: (): ActivityItemSchemaFields => ({
                                // If you force it as undefined type
                                // it will not be sent to the server
                                client_id: { forceValue: undefinedValue },
                                id: {},
                                details: {},
                                is_simplified_report: { defaultValue: true },
                                has_no_data_on_people_reached: { defaultValue: undefinedValue },
                                amount: {
                                    validations: [positiveIntegerCondition],
                                },
                                sector: { required: true },
                                action: {},

                                // TODO: Add conditional validation for following fields
                                custom_action: {},
                                point_count: {},
                                is_disaggregated_for_disabled: { defaultValue: undefinedValue },

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

                                disabled_male_0_1_count: {},
                                disabled_male_2_5_count: {},
                                disabled_male_6_12_count: {},
                                disabled_male_13_17_count: {},
                                disabled_male_18_59_count: {},
                                disabled_male_60_plus_count: {},
                                disabled_male_unknown_age_count: {},
                                disabled_female_0_1_count: {},
                                disabled_female_2_5_count: {},
                                disabled_female_6_12_count: {},
                                disabled_female_13_17_count: {},
                                disabled_female_18_59_count: {},
                                disabled_female_60_plus_count: {},
                                disabled_female_unknown_age_count: {},
                                disabled_other_0_1_count: {},
                                disabled_other_2_5_count: {},
                                disabled_other_6_12_count: {},
                                disabled_other_13_17_count: {},
                                disabled_other_18_59_count: {},
                                disabled_other_60_plus_count: {},
                                disabled_other_unknown_age_count: {},
                            }),
                        }),
                    },
                };
            },
        );

        return schema;
    },
};

export default finalSchema;
