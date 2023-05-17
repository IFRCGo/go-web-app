interface Appeal {
}

interface Country {
}

interface Disaster {
}

interface FieldReport {
}

export interface Emergency {
  active_deployments: number;
  appeals: Appeal[];
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
  update_at: string | null;
}

