import {
    CountryMini,
    DistrictMini,
} from './country';

interface UserDetails {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
}

export interface DrefOperationalUpdateResponse {
    id: number;
    national_society_actions: {
        title: string;
        description: string;
    }[];
    needs_identified: {
        title: string;
        description: string;
    }[];
    planned_interventions: {
        title: string;
        budget: number;
        person_targeted: number;
        indicator: string;
        description: string;
    }[];
    type_of_onset_display: string;
    disaster_category_display: string;
    created_by_details: UserDetails;
    images_details: {
        id: number;
        created_by_details: UserDetails;
        file: string;
        created_by: number;
    }[],
    modified_by_details: UserDetails | null;
    country_details: CountryMini;
    district_details: DistrictMini[];
    created_at: string;
    modified_at: string;
    title: string;
    type_of_onset: number;
    disaster_category: number;
    number_of_people_targated: number | null;
    number_of_people_affected: number | null;
    dref_allocated_so_far: number | null;
    additional_allocation: number | null;
    total_dref_allocation: number | null;
    emergency_appeal_planned: number | null;
    operational_update_number: number | null;
    reporting_timeframe: string | null;
    update_date: string | null;
    is_timeframe_extension_required: boolean | null;
    new_operational_end_date: string | null;
    total_operation_timeframe: string | null;
    date_of_approval: string | null;
    appeal_code: string | null;
    glide_code: string | null;
    ifrc_appeal_manager_name: string | null;
    ifrc_appeal_manager_email: string | null;
    ifrc_appeal_manager_title: string | null;
    ifrc_appeal_manager_phone_number: string | null;
    ifrc_project_manager_name: string | null;
    ifrc_project_manager_email: string | null;
    ifrc_project_manager_title: string | null;
    ifrc_project_manager_phone_number: string | null;
    national_society_contact_name: string | null;
    national_society_contact_email: string | null;
    national_society_contact_title: string | null;
    national_society_contact_phone_number: string | null;
    media_contact_name: string | null;
    media_contact_email: string | null;
    media_contact_title: string | null;
    media_contact_phone_number: string | null;
    ifrc_emergency_name: string | null;
    ifrc_emergency_email: string | null;
    ifrc_emergency_title: string | null;
    ifrc_emergency_phone_number: string | null;
    changing_timeframe_operation: boolean | null;
    changing_operation_strategy: boolean | null;
    changing_target_population_of_operation: boolean | null;
    changing_geographic_location: boolean | null;
    changing_budget: boolean | null;
    request_for_second_allocation: string | null;
    summary_of_change: string | null;
    change_since_request: string | null;
    ifrc: string | null;
    icrc: string | null;
    partner_national_society: string | null;
    government_requested_assistance: string | null;
    national_authorities: string | null;
    un_or_other_actor: string | null;
    major_coordination_mechanism: string | null;
    people_assisted: number | null;
    selection_criteria: string | null;
    community_involved: string | null;
    women: number | null;
    men: number | null;
    girls: number | null;
    boys: number | null;
    disability_people_per: number | null;
    people_per_urban: number | null;
    people_per_local: number | null;
    people_targeted_with_early_actions: number | null;
    displaced_people: number | null;
    operation_objective: string | null;
    response_strategy: string | null;
    is_published: boolean | false;
    created_by: number;
    modified_by: number | null;
    parent: number | null;
    dref: number;
    national_society: number | 123;
    disaster_type: number | 1;
    country: number | 123;
    images: number[];
    district: number[];
}
