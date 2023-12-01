import { isNotDefined, bound } from '@togglecorp/fujs';
import {
    type Error,
    analyzeErrors,
    getErrorObject,
} from '@togglecorp/toggle-form';
import { type components } from '#generated/types';

import { type PartialOpsUpdate } from './schema';

export type TypeOfDrefEnum = components<'read'>['schemas']['TypeOfDrefEnum'];
type TypeOfOnsetEnum = components<'read'>['schemas']['TypeOfOnsetEnum'];

// export const ONSET_SLOW = 1 satisfies TypeOfOnsetEnum;
export const ONSET_SUDDEN = 2 satisfies TypeOfOnsetEnum;

export const TYPE_IMMINENT = 0 satisfies TypeOfDrefEnum;
export const TYPE_ASSESSMENT = 1 satisfies TypeOfDrefEnum;
export const TYPE_RESPONSE = 2 satisfies TypeOfDrefEnum;
export const TYPE_LOAN = 3 satisfies TypeOfDrefEnum;

// FIXME: identify a way to store disaster
export const DISASTER_FIRE = 15;
export const DISASTER_FLASH_FLOOD = 27;
export const DISASTER_FLOOD = 12;

// TAB NAVIGATION

export type TabKeys = 'overview' | 'eventDetail' | 'actions' | 'operation' | 'submission';
type TabNumbers = 1 | 2 | 3 | 4 | 5;

export const tabStepMap: Record<TabKeys, TabNumbers> = {
    overview: 1,
    eventDetail: 2,
    actions: 3,
    operation: 4,
    submission: 5,
};

const tabByStepMap: Record<TabNumbers, TabKeys> = {
    1: 'overview',
    2: 'eventDetail',
    3: 'actions',
    4: 'operation',
    5: 'submission',
};

export function getNextStep(currentStep: TabKeys, minSteps: number, maxSteps: number) {
    const next = bound(tabStepMap[currentStep] + 1, minSteps, maxSteps) as TabNumbers;
    return tabByStepMap[next];
}

export function getPreviousStep(currentStep: TabKeys, minSteps: number, maxSteps: number) {
    const prev = bound(tabStepMap[currentStep] - 1, minSteps, maxSteps) as TabNumbers;
    return tabByStepMap[prev];
}

// FORM ERROR

const overviewFields: (keyof PartialOpsUpdate)[] = [
    'title',
    'national_society',
    'country',
    'district',
    'people_in_need',
    'disaster_type',
    'type_of_onset',
    'disaster_category',
    'event_map_file',
    'cover_image_file',
    'emergency_appeal_planned',
    'is_man_made_event',
    // 'is_assessment_report',
    'type_of_dref',
    'number_of_people_targeted',
    'number_of_people_affected',
    'additional_allocation',
    'dref_allocated_so_far',
    'total_dref_allocation',
] satisfies (keyof PartialOpsUpdate)[];

const eventDetailFields: (keyof PartialOpsUpdate)[] = [
    'event_description',
    'event_scope',
    'images_file',
    'event_date',
    'event_text',
    'anticipatory_actions',
    'summary_of_change',
    'changing_timeframe_operation',
    'changing_operation_strategy',
    'changing_budget',
    'changing_target_population_of_operation',
    'changing_geographic_location',
    'request_for_second_allocation',
    'has_forecasted_event_materialize',
    'specified_trigger_met',
] satisfies (keyof PartialOpsUpdate)[];

const actionsFields: (keyof PartialOpsUpdate)[] = [
    'national_society_actions',
    'ifrc',
    'icrc',
    'partner_national_society',
    'government_requested_assistance',
    'national_authorities',
    'un_or_other_actor',
    'major_coordination_mechanism',
    'needs_identified',
    'identified_gaps',
    'ns_respond_date',
    'is_there_major_coordination_mechanism',
    'assessment_report',
    'did_national_society',
    'photos_file',
] satisfies (keyof PartialOpsUpdate)[];

const operationFields: (keyof PartialOpsUpdate)[] = [
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
    'selection_criteria',
    'total_targeted_population',
] satisfies (keyof PartialOpsUpdate)[];

const submissionFields: (keyof PartialOpsUpdate)[] = [
    'ns_request_date',
    // 'start_date',
    'date_of_approval',
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
    'regional_focal_point_name',
    'regional_focal_point_title',
    'regional_focal_point_email',
    'regional_focal_point_phone_number',
    'media_contact_name',
    'media_contact_email',
    'media_contact_phone_number',
    'media_contact_title',
    'total_operation_timeframe',
    'new_operational_start_date',
    'new_operational_end_date',
    'reporting_start_date',
    'reporting_end_date',
] satisfies (keyof PartialOpsUpdate)[];

const tabToFieldsMap = {
    overview: overviewFields,
    eventDetail: eventDetailFields,
    actions: actionsFields,
    operation: operationFields,
    submission: submissionFields,
};

export function checkTabErrors(error: Error<PartialOpsUpdate> | undefined, tabKey: TabKeys) {
    if (isNotDefined(analyzeErrors(error))) {
        return false;
    }

    const fields = tabToFieldsMap[tabKey];
    const fieldErrors = getErrorObject(error);

    const hasErrorOnAnyField = fields.some(
        (field) => {
            const fieldError = fieldErrors?.[field];
            const isErrored = analyzeErrors<PartialOpsUpdate>(fieldError);
            return isErrored;
        },
    );

    return hasErrorOnAnyField;
}
