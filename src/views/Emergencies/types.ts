interface Country {
    average_household_size: number | null;
    fdrs: string;
    id: number;
    independent: boolean;
    is_deprecated: boolean;
    iso: string | null;
    iso3: string | null;
    name: string;
    record_type: number;
    record_type_display: string;
    region: number | null;
    society_name: string;
}

interface Appeal {
    aid: string;
    amount_funded: string;
    amount_requested: string;
    code: string;
    ind: number;
    num_beneficiaries: number;
    start_date: string;
    status: number;
    status_display: string;
}

export interface EventItem {
    active_deployments: number;
    appeals: Appeal[];
    auto_generated: boolean;
    countries: Country[];
    created_at: string;
    disaster_start_date: string;
    dtype: {
        id: number;
        name: string;
        summary: string;
    }
    emergency_response_contact_email: string | null;
    field_reports: {
        num_affected: number | null;
        updated_at: string,
    }[];
    glide: string;
    id: number;
    ifrc_severity_label: number;
    ifrc_severity_label_display: string;
    is_featured: boolean;
    is_featured_region: boolean;
    name: string;
    num_affected: number | null;
    parent_event: number | null;
    slug: string | null;
    summary: string;
    tab_one_title: string;
    tab_three_title: string | null;
    tab_two_title: string | null;
    updated_at: string;
}

export interface AggregateEventResponse {
    aggregate: {
        timespan: string;
        count: number;
    }[],
}

export interface HazardDetails {
    id: number;
    name: string;
    summary: string;
}

export interface CountryDistrict {
    id: number;
    country: number;
    district: number[];
    country_details: Country;
    district_details: {
        id: number;
    };
}

export interface Reference {
    id: number;
    date: string;
    source_description: string;
    url: string;
    document: number;
    document_details: {
        id: number;
        file: string;
    }
}

export type OrganizationType = 'NTLS' | 'PNS' | 'FDRN' | 'GOV';
export interface ActionOptionItem {
    id: number;
    category: string;
    name: string;
    organizations: OrganizationType[];
    tooltip_text: string;
}

export interface Action {
    client_id: string;
    actions: number[];
    organization: OrganizationType;
    summary: string;
}

export interface FlashUpdate {
    id: number,
    graphics_files: {
        id: number,
        caption: string | null,
        client_id: string | null,
        file: string;
    }[];
    map_files: {
        id: number,
        caption: string | null,
        client_id: string | null,
        file: string;
    }[];
    hazard_type_details: HazardDetails;
    actions_taken: (Action & {
        id: number;
        action_details: (ActionOptionItem & {
            client_id: string | null;
        })[];
        organization_display: string;
    })[];
    country_district: CountryDistrict[];
    hazard_type: number;
    title: string;
    situational_overview: string;
    references: Reference[];
    originator_name: string;
    originator_title: string;
    originator_email: string;
    originator_phone: string;

    ifrc_name: string;
    ifrc_title: string;
    ifrc_email: string;
    ifrc_phone: string;

    share_with: string;
    created_at: string;
}
