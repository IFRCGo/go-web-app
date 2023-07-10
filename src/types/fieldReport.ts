type OrganizationType = 'NTLS' | 'PNS' | 'FDRN';
type ContactType = 'Originator' | 'NationalSociety' | 'Federation' | 'Media';
type FieldReportType = 'EW' | 'EVT' | 'EPI' | 'COVID';

interface ActionFields {
  category: string;
  field_report_types: FieldReportType[];
  id: number;
  name: string;
  organizations: OrganizationType[]
  tooltip_text: string | null;
}

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

export interface FieldReport {
    id: number,
    countries: Country[],
    dtype: {
        id: number,
        summary: string,
        name: string;
    };
    event: {
        dtype: number;
        id: number;
        parent_event: number | null;
        emergency_response_contact_email: null;
        countries_for_preview: number[];
        slug: null;
        name: string;
    };
    actions_taken: {
        organization: string;
        actions: ActionFields[];
        id: number;
        summary: string;
    }[];
    is_covid_report: boolean;
    rid: number | null;
    status: number;
    request_assistance: boolean;
    ns_request_assistance: boolean;
    num_injured: number | null;
    num_dead: number | null;
    num_missing: number | null;
    num_affected: number | null;
    num_displaced: number | null;
    num_assisted: number | null;
    num_localstaff: number | null;
    num_volunteers: number | null;
    num_expats_delegates: number | null;
    num_potentially_affected: number | null;
    num_highest_risk: number | null;
    affected_pop_centres: null;
    gov_num_injured: number | null;
    gov_num_dead: number | null;
    gov_num_missing: number | null;
    gov_num_affected: number | null;
    gov_num_displaced: number | null;
    gov_num_assisted: number | null;
    epi_cases: number | null;
    epi_suspected_cases: number | null;
    epi_probable_cases: number | null;
    epi_confirmed_cases: number | null;
    epi_num_dead: number | null;
    epi_figures_source: string | null;
    epi_cases_since_last_fr: number | null;
    epi_deaths_since_last_fr: number | null;
    epi_notes_since_last_fr: number | null;
    who_num_assisted: number | null;
    health_min_num_assisted: number | null;
    gov_num_potentially_affected: number | null;
    gov_num_highest_risk: number | null;
    gov_affected_pop_centres: string | null;
    other_num_injured: number | null;
    other_num_dead: number | null;
    other_num_missing: number | null;
    other_num_affected: number | null;
    other_num_displaced: number | null;
    other_num_assisted: number | null;
    other_num_potentially_affected: number | null;
    other_num_highest_risk: number | null;
    other_affected_pop_centres: string | null;
    sit_fields_date: string | null;
    visibility: number | null;
    bulletin: number | null;
    dref: number | null;
    dref_amount: number | null;
    appeal: number | null;
    appeal_amount: number | null;
    imminent_dref: number | null;
    imminent_dref_amount: number | null;
    forecast_based_action: number | null;
    forecast_based_action_amount: number | null;
    rdrt: number | null;
    num_rdrt: number | null;
    fact: number | null;
    num_fact: number | null;
    ifrc_staff: number | null;
    num_ifrc_staff: number | null;
    eru_base_camp: number | null;
    eru_base_camp_units: number | null;
    eru_basic_health_care: number | null;
    eru_basic_health_care_units: null;
    eru_it_telecom: number | null;
    eru_it_telecom_units: null;
    eru_logistics: number | null;
    eru_logistics_units: number | null;
    eru_deployment_hospital: number | null;
    eru_deployment_hospital_units: null;
    eru_referral_hospital: number | null;
    eru_referral_hospital_units: number | null;
    eru_relief: number | null;
    eru_relief_units: number | null;
    eru_water_sanitation_15: number | null;
    eru_water_sanitation_15_units: number | null;
    eru_water_sanitation_40: number | null;
    eru_water_sanitation_40_units: number | null;
    eru_water_sanitation_20: number | null;
    eru_water_sanitation_20_units: number | null;
    notes_health: string | null;
    notes_ns: string | null;
    notes_socioeco: string | null;
    recent_affected: number | null,
    start_date: string | null,
    report_date: string | null,
    created_at: string,
    updated_at: string | null,
    previous_update: string | null,
    user: number | null,
    districts: number[],
    regions: number[],
    external_partners: number[],
    supported_activities: number[],
    actions_others: null;
    description: string;
    summary: string;
    other_sources: string;
}

export interface FieldReportAPIFields {
    // ------------------------------------------
    // Context
    // ------------------------------------------
    status: number;
    is_covid_report: boolean;
    event: number | undefined;
    summary: string;
    countries: number[];
    districts: number[];
    dtype: number;
    start_date: string;
    request_assistance: boolean | undefined;
    ns_request_assistance: boolean | undefined;

    // ------------------------------------------
    // Risk Analysis, Situation
    // ------------------------------------------

    // Potentially affected with source = "Red Cross / Red Cresent"
    num_potentially_affected: number | undefined;
    num_highest_risk: number | undefined;
    affected_pop_centres: string | undefined;
    num_injured: number | undefined;
    num_dead: number | undefined;
    num_missing: number | undefined;
    num_affected: number | undefined;
    num_displaced: number | undefined;

    // Potentially affected with source = "Government"
    gov_num_potentially_affected: number | undefined;
    gov_num_highest_risk: number | undefined;
    gov_affected_pop_centres: string | undefined;
    gov_num_injured: number | undefined;
    gov_num_dead: number | undefined;
    gov_num_missing: number | undefined;
    gov_num_affected: number | undefined;
    gov_num_displaced: number | undefined;

    // Potentially affected with source = "Other"
    other_num_potentially_affected: number | undefined;
    other_num_highest_risk: number | undefined;
    other_affected_pop_centres: string | undefined;
    other_num_injured: number | undefined;
    other_num_dead: number | undefined;
    other_num_missing: number | undefined;
    other_num_affected: number | undefined;
    other_num_displaced: number | undefined;

    epi_cases: number | undefined;
    epi_suspected_cases: number | undefined;
    epi_probable_cases: number | undefined;
    epi_confirmed_cases: number | undefined;
    epi_num_dead: number | undefined;
    epi_figures_source: string | undefined;
    epi_notes_since_last_fr: string | undefined;
    epi_cases_since_last_fr: number | undefined;
    epi_deaths_since_last_fr: number | undefined;

    // Date of Data for Epidemic
    sit_fields_date: string | undefined;

    // Source details
    other_sources: string | undefined;

    // Risk analysis or Situational Overview
    description: string | undefined;

    // ------------------------------------------
    // Actions
    // ------------------------------------------

    // Assisted by Government
    gov_num_assisted: number | undefined;

    // Assisted by RCRC Movements
    num_assisted: number | undefined;

    // Number of NS Staff Involved
    num_localstaff: number | undefined;

    // Number of NS Volunteers Involved
    num_volunteers: number | undefined;

    // Number of RCRC Partner Personnel Involved
    num_expats_delegates: number | undefined;

    actions_taken: {
        organization: OrganizationType;
        summary?: string;
        actions: number[];
    }[]

    notes_health: string | undefined;
    notes_ns: string | undefined;
    notes_socioeco: string | undefined;

    bulletin: number | undefined;
    actions_others: string | undefined;
    external_partners: number[] | undefined;
    supported_activities: number[] | undefined;

    // ------------------------------------------
    // Early Actions: Planned Interventions
    // ------------------------------------------
    dref: number | undefined;
    dref_amount: number | undefined;
    appeal: number | undefined;
    appeal_amount: number | undefined;

    // Rapid Response Personnel
    fact: number | undefined;
    num_fact: number | undefined;

    // Emergency Response Units
    ifrc_staff: number | undefined;
    num_ifrc_staff: number | undefined;

    forecast_based_action: number | undefined;
    forecast_based_action_amount: number | undefined;

    // ------------------------------------------
    // Early Actions: Contacts
    // ------------------------------------------
    contacts: {
        ctype: ContactType;
        name?: string;
        title?: string;
        email?: string;
        phone?: string;
    }[]
    visibility: number;
}

export interface FieldReportAPIResponseFields extends Omit<FieldReportAPIFields, 'user' | 'dtype' | 'event' | 'countries' | 'districts' | 'actions_taken'> {
    id: number;
    created_at: string;
    user: {
        id: number;
    };
    dtype: {
        id: number;
    };
    event: {
        id: number;
        name: string;
    };
    countries: {
        id: number;
    }[];
    districts: {
        id: number;
    }[];
    actions_taken: {
        id: number;
        organization: OrganizationType;
        summary?: string;
        actions: ActionFields[];
    }[];
}
