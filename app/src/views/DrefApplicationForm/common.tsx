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

export type TypeOfDrefEnum = components['schemas']['DrefDrefDrefTypeEnumKey'];
type TypeOfOnsetEnum = components['schemas']['TypeValidatedEnum'];

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

const overviewFields: (keyof PartialDref)[] = [
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
    // 'is_assessment_report',
    'type_of_dref',
] satisfies (keyof PartialDref)[];

const eventDetailFields: (keyof PartialDref)[] = [
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
] satisfies (keyof PartialDref)[];

const actionsFields: (keyof PartialDref)[] = [
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
] satisfies (keyof PartialDref)[];

const operationFields: (keyof PartialDref)[] = [
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
] satisfies (keyof PartialDref)[];

const submissionFields: (keyof PartialDref)[] = [
    'ns_request_date',
    // 'start_date',
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
] satisfies (keyof PartialDref)[];

const tabToFieldsMap = {
    overview: overviewFields,
    eventDetail: eventDetailFields,
    actions: actionsFields,
    operation: operationFields,
    submission: submissionFields,
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
