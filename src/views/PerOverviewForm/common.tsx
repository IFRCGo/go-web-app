import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';
import { emailCondition } from '#utils/form';
import type { GET } from '#types/serverResponse';

export type PerOverviewFormFields = Omit<
    GET['api/v2/per-overview/:id'],
    'id'
    | 'country_details'
    | 'type_of_assessment_details'
    | 'user'
    | 'user_details'
    | 'created_at'
    | 'modified_at'
    | 'orientation_document_details'
>;

export type PartialOverviewFormFields = PartialForm<PerOverviewFormFields>;
type OverviewFormSchema = ObjectSchema<PartialOverviewFormFields>;
type OverviewFormSchemaFields = ReturnType<OverviewFormSchema['fields']>;

export const overviewSchema: OverviewFormSchema = {
    fields: (): OverviewFormSchemaFields => ({
        country: { required: true },
        date_of_orientation: {},
        orientation_documents_file: {},
        assessment_number: {},
        branches_involved: {},
        date_of_assessment: { required: true },
        method_asmt_used: {},
        assess_urban_aspect_of_country: {},
        assess_climate_environment_of_country: {},
        date_of_previous_assessment: {},
        type_of_assessment: {},
        facilitator_name: {},
        facilitator_email: { validations: [emailCondition] },
        facilitator_phone: {},
        facilitator_contact: {},
        is_epi: {},
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
    }),
};
