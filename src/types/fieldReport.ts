type OrganizationType = 'NTLS' | 'PNS' | 'FDRN';
type ContactType = 'Originator' | 'NationalSociety' | 'Federation' | 'Media';
type FieldReportType = 'EW' | 'EVT' | 'EPI' | 'COVID';

export interface ActionFields {
  category: string;
  field_report_types: FieldReportType[];
  id: number;
  name: string;
  organizations: OrganizationType[]
  tooltip_text: string | null;
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
