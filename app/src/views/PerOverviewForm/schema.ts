import { type RefObject } from 'react';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    addCondition,
    emailCondition,
    type ObjectSchema,
    type PartialForm,
    undefinedValue,
} from '@togglecorp/toggle-form';

import { type GoApiBody } from '#utils/restRequest';

type FormContext = RefObject<boolean>;

export type PerOverviewRequestBody = GoApiBody<'/api/v2/per-overview/{id}/', 'PATCH'>;
type PerOverviewFormFields = Omit<
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
// eslint-disable-next-line max-len
type OverviewFormSchema = ObjectSchema<PartialOverviewFormFields, PartialOverviewFormFields, FormContext>;
type OverviewFormSchemaFields = ReturnType<OverviewFormSchema['fields']>;

export const overviewSchema: OverviewFormSchema = {
    fields: (formValue, _, isSettingUpProcess): OverviewFormSchemaFields => {
        let schema: OverviewFormSchemaFields = {
            is_draft: {},

            orientation_documents: {
                defaultValue: [],
            },

            date_of_previous_assessment: { forceValue: undefinedValue },
            type_of_previous_assessment: { forceValue: undefinedValue },

            assessment_number: { forceValue: undefinedValue },

            workplan_development_date: {},
            workplan_revision_date: {},

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

        const partiallyReadonlyFields = [
            'country',
            'branches_involved',
            'assessment_method',
            'assess_preparedness_of_country',
            'assess_urban_aspect_of_country',
            'assess_climate_environment_of_country',
        ] as const;
        schema = addCondition(
            schema,
            formValue,
            ['is_draft'],
            partiallyReadonlyFields,
            (val): Pick<OverviewFormSchemaFields, (typeof partiallyReadonlyFields)[number]> => {
                if (val?.is_draft === false) {
                    return {
                        country: { forceValue: undefinedValue },
                        branches_involved: { forceValue: undefinedValue },
                        assessment_method: { forceValue: undefinedValue },
                        assess_preparedness_of_country: { forceValue: undefinedValue },
                        assess_urban_aspect_of_country: { forceValue: undefinedValue },
                        assess_climate_environment_of_country: { forceValue: undefinedValue },
                    };
                }
                return {
                    country: { required: true },
                    branches_involved: {},
                    assessment_method: {},
                    assess_preparedness_of_country: {},
                    assess_urban_aspect_of_country: {},
                    assess_climate_environment_of_country: {},
                };
            },
        );

        schema = addCondition(
            schema,
            formValue,
            ['date_of_assessment', 'is_draft'],
            ['date_of_orientation'],
            (val): Pick<OverviewFormSchemaFields, 'date_of_orientation'> => {
                if (val?.is_draft === false) {
                    return {
                        date_of_orientation: { forceValue: undefinedValue },
                    };
                }
                if (isNotDefined(val?.date_of_assessment)) {
                    return {
                        date_of_orientation: { required: true },
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
            ['date_of_orientation', 'is_draft'],
            ['date_of_assessment'],
            (val): Pick<OverviewFormSchemaFields, 'date_of_assessment'> => {
                if (val?.is_draft === false) {
                    return {
                        date_of_assessment: { forceValue: undefinedValue },
                    };
                }
                if (isNotDefined(val?.date_of_orientation) || isSettingUpProcess.current) {
                    return {
                        date_of_assessment: { required: true },
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
            ['date_of_assessment', 'is_draft'],
            ['type_of_assessment'],
            (val): Pick<OverviewFormSchemaFields, 'type_of_assessment'> => {
                if (val?.is_draft === false) {
                    return {
                        type_of_assessment: { forceValue: undefinedValue },
                    };
                }
                if (isDefined(val?.date_of_assessment) || isSettingUpProcess.current) {
                    return {
                        type_of_assessment: { required: true },
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
