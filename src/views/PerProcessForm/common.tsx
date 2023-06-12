import {
    NumericValueOption,
    BooleanValueOption,
    StringValueOption,
} from '#types/common';

export const SELF_ASSESSMENT = 1;
export const SIMULATION_ASSESSMENT = 2;
export const OPERATIONAL_ASSESSMENT = 3;
export const POST_OPERATIONAL_ASSESSMENT = 4;

export interface FormComponentStatus {
    key: string;
    value: string;
}

export interface PerFormAnswer {
    id: string;
    text: string;
}

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

export function answerKeySelector(answer: PerFormAnswer) {
    return answer.id;
}

export function answerLabelSelector(answer: PerFormAnswer) {
    return answer.text;
}

export interface TypeOfAssessment {
    id: string;
    name: string;
}

// --------------------------------------------------------------

// Queries
export interface Component {
    area: Area;
    title: string;
    component: string;
    component_letter: string;
    component_num: number;
    description: string;
    id: string;
    question: string;
    status: string;
}

// Mutations
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
    country_details: {
        iso: string;
        iso3: string;
        id: string;
        record_type: number;
        record_type_display: string;
        region: number;
        independent: boolean;
        is_deprecated: boolean;
        fdrs: string;
        average_household_size: boolean;
        name: string;
        society_name: string;
    };
    type_of_per_assessment: string;
}

interface PerArea {
    area_num: number;
    id: number;
    title: string;
}

export interface PerFormComponentItem {
    area: PerArea;
    id: number;
    component_id: number;
    component_num: number;
    title: string;
    question: string;
    benchmark_responses: {
        id: number | string;
        benchmark_id: number | string;
        notes: string;
    }
}

export interface PerFormQuestionItem {
    answers: PerFormAnswer[];
    component: PerFormComponentItem;
    description: string | null;
    id: number;
    is_benchmark: boolean;
    is_epi: boolean;
    question: string;
    question_num: number;
}

export interface PerFormPrioritizationItem {
    id: number;
    overview_id: number;
    questions: PerFormQuestionItem[];
    component: PerFormComponentItem[];
}

export interface Area {
    id: number;
    title: string;
    area_num: number;
}

export interface WorkPlanComponentItem {
    id: number;
    component_id: number;
    actions: string;
    due_date: string;
    supported_by_id: string;
    status: string;
}

export interface WorkPlanCustomItem {
    id: number;
    actions: string;
    due_date: string;
    supported_by_id: string;
    status: string;
}

export interface WorkPlanForm {
    overview_id: number,
    component_responses: WorkPlanComponentItem[];
    custom_component_responses: WorkPlanCustomItem[];
}

export const perOverviewFields: (keyof PerOverviewFields)[] = [
    'id',
    'type_of_assessment_details',
    'country_details',
    'date_of_orientation',
    'orientation_document',
    'assessment_number',
    'branches_involved',
    'method_asmt_used',
    'assess_urban_aspect_of_country',
    'assess_climate_environment_of_country',
    'date_of_previous_assessment',
    'facilitator_name',
    'facilitator_email',
    'facilitator_phone',
    'facilitator_contact',
    'is_epi',
    'ns_focal_point_name',
    'ns_focal_point_email',
    'ns_focal_point_phone',
    'partner_focal_point_name',
    'partner_focal_point_email',
    'partner_focal_point_phone',
    'partner_focal_point_organization',
    'type_of_assessment',
    'national_society',
    'workplan_development_date',
    'workplan_revision_date',
    'ns_second_focal_point_name',
    'ns_second_focal_point_email',
    'ns_second_focal_point_phone',
];

export const perWorkPlanFields: (keyof PerWorkPlanForm)[] = [
    'actions',
    'area',
    'component',
    'responsible_email',
    'responsible_name',
    'status',
    'due_date',
];
