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
