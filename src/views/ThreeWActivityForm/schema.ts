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
                // FIXME: Add missing details
                // 'reporting_ns_contact_name',
                // 'reporting_ns_contact_email',
                // 'reporting_ns_contact_role',
            ] as const,
            (props) => {
                if (props?.activity_lead === 'national_society') {
                    return {
                        reporting_ns: { required: true },
                        deployed_eru: { forceValue: undefinedValue },
                    };
                }
                if (props?.activity_lead === 'deployed_eru') {
                    return {
                        reporting_ns: { forceValue: undefinedValue },
                        deployed_eru: { required: true },
                    };
                }
                return {
                    reporting_ns: { forceValue: undefinedValue },
                    deployed_eru: { forceValue: undefinedValue },
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
                                is_simplified_report: { defaultValue: undefinedValue },
                                has_no_data_on_people_reached: { defaultValue: undefinedValue },
                                amount: {
                                    validations: [positiveIntegerCondition],
                                },
                                sector: { required: true },
                                action: {},

                                // TODO: Add conditional validation for following fields
                                custom_action: {},
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
