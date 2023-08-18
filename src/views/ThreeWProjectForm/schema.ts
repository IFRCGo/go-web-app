import {
    PartialForm,
    ArraySchema,
    ObjectSchema,
    nullValue,
    addCondition,
    undefinedValue,
    requiredCondition,
    requiredStringCondition,
} from '@togglecorp/toggle-form';
import {
    positiveIntegerCondition,
    positiveNumberCondition,
    dateGreaterThanOrEqualCondition,
} from '#utils/form';
import {
    OPERATION_TYPE_PROGRAMME,
    OPERATION_TYPE_EMERGENCY,
    PROGRAMME_TYPE_MULTILATERAL,
    PROGRAMME_TYPE_DOMESTIC,
} from '#utils/constants';
import { type DeepReplace } from '#utils/common';

import type { paths } from '#generated/types';

export type ProjectResponseBody = paths['/api/v2/project/{id}/']['put']['requestBody']['content']['application/json'];

type AnnualSplitRaw = ProjectResponseBody['annual_split_detail'][number];
type AnnualSplit = AnnualSplitRaw & { client_id: string };
type ProjectFormFields = DeepReplace<ProjectResponseBody, AnnualSplitRaw, AnnualSplit>;

export type FormType = PartialForm<ProjectFormFields & {
    is_project_completed: boolean;
    is_annual_report: boolean;
}, 'client_id'>;

export type PartialAnnualType = NonNullable<FormType['annual_split_detail']>[number];

type FormSchema = ObjectSchema<PartialForm<FormType, 'client_id'>>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type AnnualSplitSchema = ObjectSchema<PartialForm<AnnualSplit, 'client_id'>, FormType>;
type AnnualSplitSchemaFields = ReturnType<AnnualSplitSchema['fields']>;

type AnnualSplitsSchema = ArraySchema<PartialForm<AnnualSplit, 'client_id'>, FormType>; // plural: Splits
type AnnualSplitsSchemaMember = ReturnType<AnnualSplitsSchema['member']>; // plural: Splits

const finalSchema: FormSchema = {
    fields: (value): FormSchemaFields => {
        let schema: FormSchemaFields = {
            dtype: { required: true },
            is_project_completed: {},
            name: { required: true, validations: [requiredStringCondition] },
            description: {},
            operation_type: { required: true },
            primary_sector: { required: true },
            programme_type: { required: true },
            project_country: { required: true },
            project_districts: { defaultValue: [] },
            reporting_ns: { required: true },
            reporting_ns_contact_name: {},
            reporting_ns_contact_role: {},
            reporting_ns_contact_email: {},
            secondary_sectors: {},
            start_date: { required: true },
            // Note: Even though status is required field,
            // it's not marked required in the schema
            // because it is calculated automatically
            // using value of other required fields
            status: {},
            visibility: { required: true },
            is_annual_report: {},
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
            ['operation_type'] as const,
            ['dtype'] as const,
            (props) => (
                props?.operation_type === OPERATION_TYPE_PROGRAMME ? {
                    dtype: {},
                } : {
                    dtype: { required: true },
                }
            ),
        );

        schema = addCondition(
            schema,
            value,
            ['operation_type', 'programme_type'] as const,
            ['event'] as const,
            (props) => (
                (
                    props?.operation_type === OPERATION_TYPE_EMERGENCY
                    && (
                        props?.programme_type === PROGRAMME_TYPE_MULTILATERAL
                        || props?.programme_type === PROGRAMME_TYPE_DOMESTIC
                    )
                ) ? {
                        event: { required: true },
                    } : {
                        event: { forceValue: nullValue },
                    }
            ),
        );

        schema = addCondition(
            schema,
            value,
            ['is_annual_report'] as const,
            ['annual_split_detail'] as const,
            (props) => (props?.is_annual_report ? {
                annual_split_detail: {
                    keySelector: (split) => split.client_id as string,
                    member: (): AnnualSplitsSchemaMember => ({
                        fields: (): AnnualSplitSchemaFields => ({
                            // If you force it as undefined type it will not be sent to the server
                            client_id: { forceValue: undefinedValue },
                            year: { validations: [requiredCondition, positiveIntegerCondition] },
                            id: {}, // can arrive from db, useful for update
                            budget_amount: { validations: [positiveNumberCondition] },
                            target_male: { validations: [positiveIntegerCondition] },
                            target_female: { validations: [positiveIntegerCondition] },
                            target_other: { validations: [positiveIntegerCondition] },
                            target_total: {
                                validations: [
                                    positiveIntegerCondition,
                                    requiredCondition,
                                ],
                            },
                            reached_male: { validations: [positiveIntegerCondition] },
                            reached_female: { validations: [positiveIntegerCondition] },
                            reached_other: { validations: [positiveIntegerCondition] },
                            reached_total: {
                                validations: [positiveIntegerCondition, requiredCondition],
                            },
                        }),
                    }),
                },
            } : {
                annual_split_detail: {
                    forceValue: nullValue,
                },
            }),
        );

        const peopleCountFields = [
            'target_male',
            'target_female',
            'target_other',
            'reached_male',
            'reached_female',
            'reached_other',
        ] as const;

        type PeopleCountSchema = Pick<FormSchemaFields, (typeof peopleCountFields)[number]>;

        schema = addCondition(
            schema,
            value,
            ['is_annual_report'] as const,
            peopleCountFields,
            (val): PeopleCountSchema => {
                if (val?.is_annual_report) {
                    return {
                        reached_female: { forceValue: nullValue },
                        reached_male: { forceValue: nullValue },
                        reached_other: { forceValue: nullValue },
                        target_female: { forceValue: nullValue },
                        target_male: { forceValue: nullValue },
                        target_other: { forceValue: nullValue },
                    };
                }
                return {
                    reached_female: { validations: [positiveIntegerCondition] },
                    reached_male: { validations: [positiveIntegerCondition] },
                    reached_other: { validations: [positiveIntegerCondition] },
                    target_female: { validations: [positiveIntegerCondition] },
                    target_male: { validations: [positiveIntegerCondition] },
                    target_other: { validations: [positiveIntegerCondition] },
                };
            },
        );

        const totalCountFields = [
            'target_total',
            'reached_total',
        ] as const;

        type TotalCountSchema = Pick<FormSchemaFields, (typeof totalCountFields)[number]>;

        schema = addCondition(
            schema,
            value,
            ['is_project_completed'] as const,
            ['actual_expenditure', 'budget_amount'] as const,
            (props) => {
                if (props?.is_project_completed) {
                    return ({
                        actual_expenditure: {
                            required: true,
                            validations: [positiveIntegerCondition],
                        },
                        budget_amount: {
                            forceValue: nullValue,
                        },
                    });
                }
                return ({
                    budget_amount: {
                        validations: [positiveIntegerCondition],
                    },
                    actual_expenditure: {
                        forceValue: nullValue,
                    },
                });
            },
        );

        schema = addCondition(
            schema,
            value,
            ['is_annual_report', 'is_project_completed'] as const,
            totalCountFields,
            (val): TotalCountSchema => {
                if (val?.is_annual_report) {
                    return {
                        reached_total: { forceValue: nullValue },
                        target_total: { forceValue: nullValue },
                    };
                }
                if (val?.is_project_completed) {
                    return {
                        reached_total: {
                            validations: [positiveIntegerCondition],
                        },
                        target_total: {
                            validations: [positiveIntegerCondition],
                        },
                    };
                }
                return {
                    target_total: {
                        required: true,
                        validations: [positiveIntegerCondition],
                    },
                    reached_total: {
                        required: true,
                        validations: [positiveIntegerCondition],
                    },
                };
            },
        );

        return schema;
    },
};

export default finalSchema;
