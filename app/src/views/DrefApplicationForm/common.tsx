import {
    bound,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    analyzeErrors,
    type Error,
    getErrorObject,
} from '@togglecorp/toggle-form';

import { type components } from '#generated/types';

import { type PartialDref } from './schema';

export type TypeOfDrefEnum = components<'read'>['schemas']['DrefDrefDrefTypeEnumKey'];
type TypeOfOnsetEnum = components<'read'>['schemas']['TypeValidatedEnum'];

// export const ONSET_SLOW = 1 satisfies TypeOfOnsetEnum;
export const ONSET_SUDDEN = 2 satisfies TypeOfOnsetEnum;

export const TYPE_IMMINENT = 0 satisfies TypeOfDrefEnum;
export const TYPE_ASSESSMENT = 1 satisfies TypeOfDrefEnum;
// export const TYPE_RESPONSE = 2 satisfies TypeOfDrefEnum;
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

export const overviewTabFields: (keyof PartialDref)[] = [
    'national_society',
    'field_report',
    'type_of_dref',
    'disaster_type',
    'is_man_made_event',
    'type_of_onset',
    'disaster_category',
    'country',
    'district',
    'title_prefix',
    'title',
    'emergency_appeal_planned',
    'event_map_file',
    'cover_image_file',
] satisfies (keyof PartialDref)[];

export const eventDetailTabFields: (keyof PartialDref)[] = [
    'did_it_affect_same_population',
    'did_it_affect_same_area',
    'did_ns_respond',
    'did_ns_request_fund',
    'ns_request_text',
    'lessons_learned',
    'event_date',
    'event_text',
    'num_affected',
    'people_in_need',
    'event_description',
    'event_scope',
    'source_information',
    'images_file',
] satisfies (keyof PartialDref)[];

export const actionsTabFields: (keyof PartialDref)[] = [
    'did_national_society',
    'ns_respond_date',
    'national_society_actions',
    'ifrc',
    'partner_national_society',
    'icrc',
    'government_requested_assistance',
    'national_authorities',
    'un_or_other_actor',
    'is_there_major_coordination_mechanism',
    'major_coordination_mechanism',
    'assessment_report',
    'needs_identified',
    'identified_gaps',
] satisfies (keyof PartialDref)[];

export const operationTabFields: (keyof PartialDref)[] = [
    'operation_objective',
    'response_strategy',
    'people_assisted',
    'selection_criteria',
    'targeting_strategy_support_file',
    'women',
    'men',
    'girls',
    'boys',
    'total_targeted_population',
    'disability_people_per',
    'people_per_urban',
    'people_per_local',
    'displaced_people',
    'people_targeted_with_early_actions',
    'risk_security',
    'risk_security_concern',
    'has_child_safeguarding_risk_analysis_assessment',
    'budget_file',
    'amount_requested',
    'planned_interventions',
    'human_resource',
    'is_surge_personnel_deployed',
    'surge_personnel_deployed',
    'logistic_capacity_of_ns',
    'pmer',
    'communication',
] satisfies (keyof PartialDref)[];

export const timeframeAndContactsTabFields: (keyof PartialDref)[] = [
    'ns_request_date',
    'submission_to_geneva',
    'date_of_approval',
    'operation_timeframe',
    'end_date',
    'publishing_date',
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
] satisfies (keyof PartialDref)[];

const tabToFieldsMap = {
    overview: overviewTabFields,
    eventDetail: eventDetailTabFields,
    actions: actionsTabFields,
    operation: operationTabFields,
    submission: timeframeAndContactsTabFields,
};

export function checkTabErrors(error: Error<PartialDref> | undefined, tabKey: TabKeys) {
    if (isNotDefined(analyzeErrors(error))) {
        return false;
    }

    const fields = tabToFieldsMap[tabKey];
    const fieldErrors = getErrorObject(error);

    const hasErrorOnAnyField = fields.some(
        (field) => {
            const fieldError = fieldErrors?.[field];
            const isErrored = analyzeErrors<PartialDref>(fieldError);
            return isErrored;
        },
    );

    return hasErrorOnAnyField;
}
