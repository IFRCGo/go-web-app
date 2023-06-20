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
