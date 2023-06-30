import { GET } from '#types/serverResponse';

export const ONSET_SLOW = 1;
export const ONSET_SUDDEN = 2;

export const TYPE_IMMINENT = 0;
export const TYPE_ASSESSMENT = 1;
export const TYPE_RESPONSE = 2;
export const TYPE_LOAN = 3;

export const DISASTER_FIRE = 15;
export const DISASTER_FLASH_FLOOD = 27;
export const DISASTER_FLOOD = 12;

type DrefFields = GET['api/v2/dref/:id'];

export const overviewFields: (keyof DrefFields)[] = [
    'users',
    'field_report',
    'title_prefix',
    'title',
    'national_society',
    'country',
    'district',
    'people_in_need',
    'disaster_type',
    'type_of_onset',
    'disaster_category',
    'num_affected',
    'amount_requested',
    'event_map_file',
    'cover_image_file',
    'emergency_appeal_planned',
    'is_man_made_event',
    'is_assessment_report',
    'type_of_dref',
];

export const eventDetailFields: (keyof DrefFields)[] = [
    'did_it_affect_same_population',
    'did_it_affect_same_area',
    'did_ns_respond',
    'did_ns_request_fund',
    'ns_request_text',
    'lessons_learned',
    'event_description',
    'event_scope',
    'images_file',
    'event_date',
    'event_text',
];

export const actionsFields: (keyof DrefFields)[] = [
    'national_society_actions',
    'ifrc',
    'icrc',
    'partner_national_society',
    'government_requested_assistance',
    'national_authorities',
    'un_or_other',
    'major_coordination_mechanism',
    'needs_identified',
    'identified_gaps',
    'ns_respond_date',
    'is_there_major_coordination_mechanism',
    'assessment_report',
];

export const operationFields: (keyof DrefFields)[] = [
    'people_assisted',
    'women',
    'men',
    'girls',
    'boys',
    'disability_people_per',
    'people_per_urban',
    'people_per_local',
    'displaced_people',
    'people_targeted_with_early_actions',
    'operation_objective',
    'response_strategy',
    'human_resource',
    'surge_personnel_deployed',
    'logistic_capacity_of_ns',
    'pmer',
    'communication',
    'budget_file',
    'planned_interventions',
    'is_surge_personnel_deployed',
    'risk_security',
    'risk_security_concern',
];

export const submissionFields: (keyof DrefFields)[] = [
    'ns_request_date',
    'start_date',
    'end_date',
    'submission_to_geneva',
    'date_of_approval',
    'operation_timeframe',
    'did_national_society',
    'appeal_code',
    'glide_code',
    'ifrc_appeal_manager_name',
    'ifrc_appeal_manager_email',
    'ifrc_appeal_manager_phone_number',
    'ifrc_appeal_manager_title',
    'ifrc_project_manager_name',
    'ifrc_project_manager_email',
    'ifrc_project_manager_phone_number',
    'ifrc_project_manager_title',
    'national_society_contact_name',
    'national_society_contact_email',
    'national_society_contact_phone_number',
    'national_society_contact_title',
    'ifrc_emergency_name',
    'ifrc_emergency_email',
    'ifrc_emergency_phone_number',
    'ifrc_emergency_title',
    'media_contact_name',
    'media_contact_email',
    'media_contact_phone_number',
    'media_contact_title',
];
