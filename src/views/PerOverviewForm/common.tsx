import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';
import {
    NumericValueOption,
    BooleanValueOption,
    StringValueOption,
} from '#types/common';
import {
    emailCondition,
} from '#utils/form';

export const SELF_ASSESSMENT = 1;
export const SIMULATION_ASSESSMENT = 2;
export const OPERATIONAL_ASSESSMENT = 3;
export const POST_OPERATIONAL_ASSESSMENT = 4;

export type Option = NumericValueOption | BooleanValueOption | StringValueOption;
export const emptyOptionList: Option[] = [];
export const emptyStringOptionList: StringValueOption[] = [];
export const emptyNumericOptionList: NumericValueOption[] = [];
export const emptyBooleanOptionList: BooleanValueOption[] = [];

export const optionKeySelector = (o: Option) => o.value;
export const numericOptionKeySelector = (o: NumericValueOption) => o.value;
export const stringOptionKeySelector = (o: StringValueOption) => o.value;
export const booleanOptionKeySelector = (o: BooleanValueOption) => o.value;
export const optionLabelSelector = (o: Option) => o.label;

export interface TypeOfAssessment {
    id: string;
    name: string;
}

export interface PerOverviewFields {
    id: string;
    national_society: number;
    date_of_orientation: string;
    date_of_assessment: string;
    orientation_document: File;
    type_of_assessment_details: TypeOfAssessment;
    date_of_previous_assessment: string;
    type_of_assessment: string;
    branches_involved: string;
    method_asmt_used: string;
    is_epi: boolean;
    assess_urban_aspect_of_country: boolean;
    assess_climate_environment_of_country: boolean;
    assessment_number: number;
    workplan_development_date: string;
    workplan_revision_date: string;
    ns_focal_point_name: string;
    ns_focal_point_email: string;
    ns_focal_point_phone: string;
    ns_second_focal_point_name: string;
    ns_second_focal_point_email: string;
    ns_second_focal_point_phone: string;
    partner_focal_point_name: string;
    partner_focal_point_email: string;
    partner_focal_point_phone: string;
    partner_focal_point_organization: string;
    facilitator_name: string;
    facilitator_email: string;
    facilitator_phone: string;
    facilitator_contact: string;
    type_of_per_assessment: string;
}

export type OverviewFormSchema = ObjectSchema<PartialForm<PerOverviewFields>>;
export type OverviewFormSchemaFields = ReturnType<OverviewFormSchema['fields']>;

export const overviewSchema: OverviewFormSchema = {
    fields: (): OverviewFormSchemaFields => ({
        id: {},
        type_of_assessment_details: {},
        date_of_orientation: {},
        orientation_document: {},
        assessment_number: {},
        branches_involved: {},
        date_of_assessment: { required: true },
        method_asmt_used: {},
        assess_urban_aspect_of_country: {},
        assess_climate_environment_of_country: {},
        date_of_previous_assessment: {},
        type_of_per_assessment: {},
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
        type_of_assessment: {},
        national_society: { required: true },
        ns_second_focal_point_name: {},
        ns_second_focal_point_email: {},
        ns_second_focal_point_phone: {},
    }),
};
