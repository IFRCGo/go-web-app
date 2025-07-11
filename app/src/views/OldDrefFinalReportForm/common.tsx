import { sumSafe } from '@ifrc-go/ui/utils';
import { isNotDefined } from '@togglecorp/fujs';
import {
    analyzeErrors,
    type Error,
    getErrorObject,
} from '@togglecorp/toggle-form';

import { type components } from '#generated/types';

import { type PartialFinalReport } from './schema';

type TypeOfDrefEnum = components<'read'>['schemas']['DrefDrefDrefTypeEnumKey'];
type TypeOfOnsetEnum = components<'read'>['schemas']['DrefDrefOnsetTypeEnumKey'];

// export const ONSET_SLOW = 1 satisfies TypeOfOnsetEnum;
export const ONSET_SUDDEN = 2 satisfies TypeOfOnsetEnum;

export const TYPE_IMMINENT = 0 satisfies TypeOfDrefEnum;
export const TYPE_ASSESSMENT = 1 satisfies TypeOfDrefEnum;
// export const TYPE_RESPONSE = 2 satisfies TypeOfDrefEnum;
export const TYPE_LOAN = 3 satisfies TypeOfDrefEnum;

// FIXME: identify a way to store disaster
// const DISASTER_FIRE = 15;
// const DISASTER_FLASH_FLOOD = 27;
// const DISASTER_FLOOD = 12;

// TAB NAVIGATION

type TabKeys = 'overview' | 'eventDetail' | 'actions' | 'operation' | 'submission';

// FORM ERROR

const overviewFields: (keyof PartialFinalReport)[] = [
    'total_dref_allocation',
    'main_donors',
    'title',
    'national_society',
    'country',
    'district',
    'disaster_type',
    'type_of_onset',
    'disaster_category',
    'event_map_file',
    'cover_image_file',
    'type_of_dref',
] satisfies (keyof PartialFinalReport)[];

const eventDetailFields: (keyof PartialFinalReport)[] = [
    'number_of_people_affected',
    'num_assisted',
    'people_in_need',
    'estimated_number_of_affected_male',
    'estimated_number_of_affected_female',
    'estimated_number_of_affected_girls_under_18',
    'estimated_number_of_affected_boys_under_18',
    'event_description',
    'event_scope',
    'images_file',
    'source_information',
    'event_date',
    'event_text',
] satisfies (keyof PartialFinalReport)[];

const actionsFields: (keyof PartialFinalReport)[] = [
    'has_national_society_conducted',
    'national_society_conducted_description',
    'ifrc',
    'icrc',
    'partner_national_society',
    'government_requested_assistance',
    'national_authorities',
    'un_or_other_actor',
    'needs_identified',
    'is_there_major_coordination_mechanism',
] satisfies (keyof PartialFinalReport)[];

const operationFields: (keyof PartialFinalReport)[] = [
    'change_in_operational_strategy',
    'change_in_operational_strategy_text',
    'total_targeted_population',
    'financial_report',
    'financial_report_description',

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
    'planned_interventions',
    'risk_security',
    'risk_security_concern',
] satisfies (keyof PartialFinalReport)[];

const submissionFields: (keyof PartialFinalReport)[] = [
    'operation_start_date',
    'total_operation_timeframe',
    'operation_end_date',
    'date_of_publication',

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
    'national_society_integrity_contact_name',
    'national_society_integrity_contact_title',
    'national_society_integrity_contact_email',
    'national_society_integrity_contact_phone_number',
    'national_society_hotline_phone_number',
    'media_contact_title',
] satisfies (keyof PartialFinalReport)[];

const tabToFieldsMap = {
    overview: overviewFields,
    eventDetail: eventDetailFields,
    actions: actionsFields,
    operation: operationFields,
    submission: submissionFields,
};

export const calculateTotalAssistedPopulation = (val: PartialFinalReport) => {
    const totalAssistedPopulation = sumSafe([
        val?.assisted_num_of_women,
        val?.assisted_num_of_men,
        val?.assisted_num_of_girls_under_18,
        val?.assisted_num_of_boys_under_18,
    ]) ?? 0;

    return totalAssistedPopulation;
};

export function checkTabErrors(error: Error<PartialFinalReport> | undefined, tabKey: TabKeys) {
    if (isNotDefined(analyzeErrors(error))) {
        return false;
    }

    const fields = tabToFieldsMap[tabKey];
    const fieldErrors = getErrorObject(error);

    const hasErrorOnAnyField = fields.some(
        (field) => {
            const fieldError = fieldErrors?.[field];
            const isErrored = analyzeErrors<PartialFinalReport>(fieldError);
            return isErrored;
        },
    );

    return hasErrorOnAnyField;
}
