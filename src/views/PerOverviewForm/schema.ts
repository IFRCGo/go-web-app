import {
    ObjectSchema,
    PartialForm,
    addCondition,
    undefinedValue,
    emailCondition,
} from '@togglecorp/toggle-form';

import type { paths } from '#generated/types';
import { isDefined, isNotDefined } from '@togglecorp/fujs';

export type PerOverviewResponse = paths['/api/v2/per-overview/{id}/']['put']['responses']['200']['content']['application/json'];
export type PerOverviewRequestBody = paths['/api/v2/per-overview/{id}/']['put']['requestBody']['content']['application/json'];
export type PerOverviewFormFields = Omit<
    PerOverviewRequestBody,
    'id'
    | 'country_details'
    | 'type_of_assessment_details'
    | 'user'
    | 'user_details'
    | 'created_at'
    | 'modified_at'
    | 'orientation_documents_details'
>;

export type PartialOverviewFormFields = PartialForm<PerOverviewFormFields, 'id'>;
type OverviewFormSchema = ObjectSchema<PartialOverviewFormFields>;
type OverviewFormSchemaFields = ReturnType<OverviewFormSchema['fields']>;

export const overviewSchema: OverviewFormSchema = {
    fields: (formValue): OverviewFormSchemaFields => {
        let schema: OverviewFormSchemaFields = {
            is_draft: {},
            country: { required: true },
            date_of_orientation: {},
            orientation_documents: {
                defaultValue: [],
            },
            assess_preparedness_of_country: {},
            assess_urban_aspect_of_country: {},
            assess_climate_environment_of_country: {},
            assessment_number: { forceValue: undefinedValue },
            branches_involved: {},
            date_of_assessment: {},
            assessment_method: {},
            date_of_previous_assessment: { forceValue: undefinedValue },

            type_of_assessment: {},
            type_of_previous_assessment: { forceValue: undefinedValue },

            facilitator_name: {},
            facilitator_email: { validations: [emailCondition] },
            facilitator_phone: {},
            facilitator_contact: {},
            ns_focal_point_name: {},
            ns_focal_point_email: { validations: [emailCondition] },
            ns_focal_point_phone: {},
            partner_focal_point_name: {},
            partner_focal_point_email: { validations: [emailCondition] },
            partner_focal_point_phone: {},
            partner_focal_point_organization: {},
            ns_second_focal_point_name: {},
            ns_second_focal_point_email: {},
            ns_second_focal_point_phone: {},
        };

        schema = addCondition(
            schema,
            formValue,
            ['date_of_assessment'],
            ['date_of_orientation'],
            (val) => {
                if (isNotDefined(val?.date_of_assessment)) {
                    return {
                        date_of_orientation: {
                            required: true,
                        },
                    };
                }

                return {
                    date_of_orientation: {},
                };
            },
        );

        schema = addCondition(
            schema,
            formValue,
            ['date_of_orientation'],
            ['date_of_assessment'],
            (val) => {
                if (isNotDefined(val?.date_of_orientation)) {
                    return {
                        date_of_assessment: {
                            required: true,
                        },
                    };
                }

                return {
                    date_of_assessment: {},
                };
            },
        );

        schema = addCondition(
            schema,
            formValue,
            ['date_of_assessment'],
            ['type_of_assessment'],
            (val) => {
                if (isDefined(val?.date_of_assessment)) {
                    return {
                        type_of_assessment: {
                            required: true,
                        },
                    };
                }

                return {
                    type_of_assessment: {},
                };
            },
        );

        return schema;
    },
    validation: (value) => {
        if (isNotDefined(value?.date_of_orientation) && isNotDefined(value?.date_of_assessment)) {
            return 'Either date of orientation or date of assessment should be specified';
        }

        return undefined;
    },
};
