interface Country {
    id: number;
    iso3: string;
}

interface Region {
}

interface Disaster {
}

interface FieldReport {
}

export interface Appeal {
    aid: string;
    amount_funded: string;
    amount_requested: string;
    atype: number;
    atype_display: string;
    code: string;
    country: Country;
    created_at: string;
    dtype: Disaster;
    end_date: string;
    event: number | null;
    id: string;
    modified_at: string;
    name: string;
    needs_confirmation: boolean;
    num_beneficiaries: number;
    real_data_update: string;
    region: Region;
    sector: string;
    start_date: string;
    status: number;
    status_display: string;
}

export interface AppealMini {
    aid: string;
    amount_funded: string;
    amount_requested: string;
    code: string;
    id: number;
    num_beneficiaries: number;
    start_date: string;
    status: number;
    status_display: string;
}

export interface Emergency {
  active_deployments: number;
  appeals: AppealMini[];
  auto_generated: boolean;
  countries: Country[];
  created_at: string;
  disaster_start_date: string;
  dtype: Disaster;
  emergency_response_contact_email: string | null;
  field_reports: FieldReport[];
  glide: string;
  id: number;
  ifrc_severity_level: number;
  ifrc_serverity_level_display: string;
  is_featured: boolean;
  is_featured_region: boolean;
  name: string;
  num_affected: number | null;
  parent_event: number | null;
  slug: string | null;
  summary: string | null;
  tab_one_title: string | null;
  tab_two_title: string | null;
  tab_three_title: string | null;
  updated_at: string | null;
}
