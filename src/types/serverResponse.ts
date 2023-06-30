import { ListResponse } from '#utils/restRequest';

interface NumericKeyStringValue {
    key: number;
    value: string;
}

interface StringKeyStringValue {
    key: string;
    value: string;
}

interface UserListResponseItem {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
}

interface DisasterTypeListResponseItem {
    id: number;
    name: string;
    summary: string;
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

interface DistrictListResponseItem {
    id: number;
    code: string;
    is_deprecated: boolean;
    is_enclave: boolean;
    name: string;
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
            id: number;
            question_responses: {
                answer: number;
                id: number;
                notes: string | null;
                question: number;
            }[];
            rating: number | null;
            rating_details: PerComponentRatingItem | null;
            urban_considerations: string | null;
            epi_considerations: string | null;
            climate_environmental_considerations: string | null;
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
    user_details: UserListResponseItem;
    workplan_development_date: string | null;
    workplan_revision_date: string | null
}

interface PerPrioritizationResponse {
    id: number
    overview: number;

    // FIXME: not implemented in the server yet
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
    id: number;
    overview: number;
    is_draft: boolean | null;
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
    overview_details: {
        id: number;
        user: number;
        user_details: UserListResponseItem;
        workplan_development_date: string | null;
    };
}

interface DrefOptionsResponse {
    disaster_category: NumericKeyStringValue[];
    national_society_actions: StringKeyStringValue[];
    needs_identified: StringKeyStringValue[];
    planned_interventions: StringKeyStringValue[];
    status: NumericKeyStringValue[];
    type_of_onset: NumericKeyStringValue[];
    type_of_dref: NumericKeyStringValue[];
    users: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        username: string;
    }[];
}

interface FileResponse {
    id: number;
    client_id: string | null;
    caption: string;
    file: string;
    created_by: number;
    created_by_details: {
        id: number;
        username: string;
        first_name: string;
        last_name: string;
    }
}

interface NeedIdentifiedResponse {
    description: string;
    id: number;
    image_url: string;
    title: string;
    title_display: string;
}

interface NsActionResponse {
    description: string;
    id: number;
    image_url: string;
    title: string;
    title_display: string;
}

interface InterventionResponse {
    budget: number;
    challenges: string | null;
    description: string;
    female: number | null;
    id: number;
    image_url: string;
    indicators: {
        actual: number;
        id: number;
        target: number;
        title: string;
    }[];
    lessons_learnt: string | null;
    male: number;
    narrative_description_of_achievements: string | null;
    person_assisted: number | null;
    person_targeted: number | null;
    progress_towards_outcome: string | null;
    title: string;
    title_display: string;
}

interface RiskSecurityResponse {
    id: string;
    client_id: string | null;
    mitigation: string;
    risk: string;
}

interface DrefResponse {
    did_it_affect_same_area: boolean;
    did_it_affect_same_population: boolean;
    did_it_affect_same_population_text: string;
    amount_requested: number;
    anticipatory_actions: string,
    appeal_code: string;
    boys: number;
    communication: string;
    community_involved: string;
    created_at: string;
    date_of_approval: string;
    disability_people_per: number;
    disaster_category: number;
    disaster_type: number;
    displaced_people: number;
    emergency_appeal_planned: boolean;
    end_date: string;
    event_date: string;
    field_report: number;
    images_file: FileResponse[];
    event_description: string;
    event_scope: string;
    event_text: string;
    girls: number;
    glide_code: string;
    go_field_report_date: string;
    government_requested_assistance: boolean;
    government_requested_assistance_date: string;
    human_resource: string;
    icrc: string;
    id: number;
    identified_gaps: string;
    ifrc: string;
    ifrc_appeal_manager_email: string;
    ifrc_appeal_manager_name: string;
    ifrc_appeal_manager_phone_number: string;
    ifrc_appeal_manager_title: string;
    ifrc_emergency_email: string;
    ifrc_emergency_name: string;
    ifrc_emergency_phone_number: string;
    ifrc_emergency_title: string;
    ifrc_project_manager_email: string;
    ifrc_project_manager_name: string;
    ifrc_project_manager_phone_number: string;
    ifrc_project_manager_title: string;
    lessons_learned: string;
    logistic_capacity_of_ns: string;
    major_coordination_mechanism: string;
    media_contact_email: string;
    media_contact_name: string;
    media_contact_phone_number: string;
    media_contact_title: string;
    men: number;
    modified_at: string;
    modified_by: number;
    national_authorities: string;
    national_society: number;
    national_society_actions: NsActionResponse[];
    national_society_contact_email: string;
    national_society_contact_name: string;
    national_society_contact_phone_number: string;
    national_society_contact_title: string;
    needs_identified: NeedIdentifiedResponse[];
    ns_request_date: string;
    did_ns_request_fund: boolean;
    ns_request_text: string;
    did_ns_respond: boolean;
    ns_respond_date: string;
    num_affected: number;
    num_assisted: number;
    operation_objective: string;
    operation_timeframe: number;
    originator_email: string;
    originator_name: string;
    originator_phone_number: string;
    originator_title: string;
    partner_national_society: string;
    people_assisted: string;
    people_per_urban: number;
    people_per_local: number;
    people_targeted_with_early_actions: number;
    budget_file: number;
    planned_interventions: InterventionResponse[];
    pmer: string;
    publishing_date: string;
    response_strategy: string;
    selection_criteria: string;
    start_date: string;
    status: number;
    submission_to_geneva: string;
    surge_personnel_deployed: string;
    title: string;
    type_of_onset: number;
    un_or_other: string;
    un_or_other_actor: string;
    women: number;
    dref_recurrent_text: string;
    total_targeted_population: number;
    users: number[];
    is_there_major_coordination_mechanism: boolean;
    is_surge_personnel_deployed: boolean;
    assessment_report: number;
    country: number;
    district: number[];
    country_details: CountryListResponseItem;
    people_in_need: number;
    did_national_society: boolean;
    supporting_document: number;
    risk_security: RiskSecurityResponse[];
    risk_security_concern: string;
    title_prefix: string;
    cover_image_file: FileResponse;
    event_map_file: FileResponse;
    is_man_made_event: boolean;
    is_assessment_report: boolean;
    type_of_dref: number;
    type_of_dref_display: string;
    user: number;
    district_details: DistrictListResponseItem[],
    budget_file_details: {
        id: number;
        file: string;
    };
    budget_file_preview: string,
    images_details: {
        id: number;
        file: string;
    }[];
    assessment_report_details: {
        id: number;
        file: string;
    };
    assessment_report_preview: string,
    event_map_details: FileResponse;
    disaster_type_details: {
        id: number;
        name: string;
        summary: string;
    };
    disaster_category_display: string;
    type_of_onset_display: string;
    supporting_document_details: {
        id: number;
        file: string;
    };
    operational_update_details: {
        id: number;
        is_published: boolean;
        operational_update_number: number;
        title: string;
    }[] | null;
    modified_by_details: UserListResponseItem;
    users_details: UserListResponseItem[];
}

export interface GET {
    'api/v2/country': ListResponse<CountryListResponseItem>;
    'api/v2/district': ListResponse<DistrictListResponseItem>;
    'api/v2/disaster_type': ListResponse<DisasterTypeListResponseItem>;
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
    'api/v2/dref-options': DrefOptionsResponse;
    'api/v2/dref/:id': DrefResponse;
}
