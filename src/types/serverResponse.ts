import { ListResponse } from '#utils/restRequest';

interface NumericKeyStringValue {
    key: number;
    value: string;
}

interface CountryListResponseItem {
    average_household_size: number | null;
    fdrs: string | null;
    id: number;
    independent: boolean | null;
    is_deprecated: boolean | null;
    iso: string | null;
    iso3: string | null;
    name: string;
    record_type: number;
    record_type_display: string;
    region: number;
    society_name: string;
}

interface PerProcessStatusItem {
    assessment: number | null;
    assessment_number: number;
    country: number;
    country_details: CountryListResponseItem;
    date_of_assessment: string;
    id: number;
    phase: number;
    phase_display: string;
    prioritization: number | null;
    workplan: number | null;
}

interface PerFormAnswerItem {
    id: number;
    text: string;
}

interface PerFormAreaItem {
    area_num: number;
    id: number;
    title: string;
}

interface PerFormComponentItem {
    area: number;
    component_letter: string;
    component_num: number;
    description: string;
    id: number;
    title: string;
}

interface PerFormQuestionItem {
    answers: PerFormAnswerItem[];
    component: {
        area: PerFormAreaItem;
        component_num: number;
        id: number;
        title: string;
    };
    description: string | null;
    id: number;
    is_benchmark: boolean;
    is_epi: boolean;
    question: string;
    question_num: number;
}

interface PerComponentRatingItem {
    id: number;
    title: string;
    value: number;
}

interface PerAssessmentResponse {
    id: number;
    is_draft: boolean;
    overview: number;
    user: number | null;
    area_responses: {
        // FIXME: this should not be here
        is_draft: boolean | null;

        id: number;
        area: number;
        area_details: PerFormAreaItem;
        component_responses: {
            component: number;
            consideration_responses: {
                id: number;
                urban_considerations: string | null;
                epi_considerations: string | null;
                climate_environmental_considerations: string | null;
            }[];
            id: number;
            question_responses: {
                answer: number;
                id: number;
                notes: string | null;
                question: number;
            }[];
            rating: number | null;
            rating_details: PerComponentRatingItem | null;
        }[];
    }[];
}

interface PerOverviewResponse {
    assess_climate_environment_of_country: boolean | null;
    assess_preparedness_of_country: boolean | null;
    assess_urban_aspect_of_country: boolean | null;
    assessment_number: number | null;
    branches_involved: string;
    country: number;
    country_details: CountryListResponseItem;
    created_at: string;
    date_of_assessment: string;
    date_of_mid_term_review: string | null;
    date_of_next_asmt: string | null;
    date_of_orientation: string;
    date_of_previous_assessment: string | null;
    facilitator_email: string;
    facilitator_contact: string;
    facilitator_name: string;
    facilitator_phone: string;
    id: number;
    is_draft: boolean | null;
    is_epi: boolean;
    is_finalized: boolean;
    method_asmt_used: string;
    ns_focal_point_email: string;
    ns_focal_point_name: string;
    ns_focal_point_phone: string;
    ns_second_focal_point_email: string;
    ns_second_focal_point_name: string;
    ns_second_focal_point_phone: string;
    orientation_documents_file: number[] | null;
    /*
    orientation_document_details: {
        caption: string | null;
        client_id: string | number | null;
        created_by: number;
        created_by_details: {
            id: number;
            username: string;
            first_name: string;
            last_name: string;
        };
        file: string;
        id: number;
    };
    */
    other_consideration: string;
    partner_focal_point_email: string;
    partner_focal_point_name: string;
    partner_focal_point_phone: string;
    partner_focal_point_organization: string;
    phase: number;
    type_of_assessment: number;
    type_of_assessment_details: {
        id: number;
        name: string;
    };
    updated_at: string;
    user: number;
    user_details: {
        id: number;
        username: string;
        first_name: string;
        last_name: string;
    }
    workplan_development_date: string | null;
    workplan_revision_date: string | null
}

interface PerPrioritizationResponse {
    id: number
    overview: number;

    // FIXME: note implemented in the server yet
    is_draft: boolean;

    component_responses: {
        component: number;
        component_details: {
            area: number;
            component_num: number;
            description: string;
            id: number;
            title: string;
        }
        is_prioritized: boolean | null
        justification_text: string | null;
    }[];
}

interface PerWorkPlanResponse {
    component_responses: {
        id: number | null;
        component: number;
        actions: string | null;
        due_date: string | null;
        supported_by: number | null;
        status: number | null;
    }[];
    custom_component_responses: {
        id: number | null;
        actions: string | null;
        due_date: string | null;
        supported_by: number | null;
        status: number | null;
    }[];
    id: number;
    overview: number;
    overview_details: {
        id: number;
        user: number;
        user_details: {
            id: number;
            username: string;
            first_name: string;
            last_name: string;
        }
        workplan_development_date: string | null;
    };
}

export interface GET {
    'api/v2/country': ListResponse<CountryListResponseItem>;
    'api/v2/per-formquestion': ListResponse<PerFormQuestionItem>;
    'api/v2/per-formcomponent': ListResponse<PerFormComponentItem>;
    'api/v2/per-options': {
        answers: PerFormAnswerItem[];
        componentratings: PerComponentRatingItem[];
        overviewassessmentmethods: {
            key: string;
            value: string;
        }[];
        overviewassessmenttypes: {
            id: number;
            name: string;
        }[];
        perphases: NumericKeyStringValue[];
        workplanstatus: NumericKeyStringValue[];
    };
    'api/v2/per-assessment/:id': PerAssessmentResponse;
    'api/v2/per-overview/:id': PerOverviewResponse;
    'api/v2/per-process-status/:id': PerProcessStatusItem;
    'api/v2/per-process-status': ListResponse<PerProcessStatusItem>;
    'api/v2/aggregated-per-process-status': ListResponse<PerProcessStatusItem>;
    'api/v2/per-assessmenttype': ListResponse<{
        id: number;
        name: string;
    }>;
    'api/v2/per-prioritization/:id': PerPrioritizationResponse;
    'api/v2/per-work-plan/:id': PerWorkPlanResponse;
}
