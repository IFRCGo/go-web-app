import { sumSafe } from '@ifrc-go/ui/utils';
import { isNotDefined } from '@togglecorp/fujs';
import {
    analyzeErrors,
    type Error,
    getErrorObject,
} from '@togglecorp/toggle-form';

import { type components } from '#generated/types';
import { type GoApiResponse } from '#utils/restRequest';

import { type PartialDref } from './schema';

type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
export type TypeOfDrefEnum = components<'read'>['schemas']['DrefDrefDrefTypeEnumKey'];
type TypeOfOnsetEnum = components<'read'>['schemas']['DrefDrefOnsetTypeEnumKey'];
type ProposedActionOption = NonNullable<GlobalEnumsResponse['dref_proposed_action']>[number];
type DrefResponseType = GoApiResponse<'/api/v2/dref/{id}/'>;

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

export const SURGE_DEPLOYMENT_COST = 10000;
export const SURGE_INDIRECT_COST = 5800;
export const INDIRECT_COST = 5000;
export const SUB_TOTAL = 75000;

export const EARLY_ACTION = 1 satisfies ProposedActionOption['key'];
export const EARLY_RESPONSE = 2 satisfies ProposedActionOption['key'];
export const OPERATION_TIMEFRAME_IMMINENT = 45; // 45 days

// TAB NAVIGATION

type TabKeys = 'overview' | 'eventDetail' | 'actions' | 'operation' | 'submission';

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
    'event_map_file',
    'cover_image_file',
] satisfies (keyof PartialDref)[];

export const eventDetailTabFields: (keyof PartialDref)[] = [
    'did_it_affect_same_population',
    'did_it_affect_same_area',
    'did_ns_respond',
    'did_ns_request_fund',
    'ns_request_text',
    'dref_recurrent_text',
    'lessons_learned',
    'child_safeguarding_risk_level',
    'complete_child_safeguarding_risk',
    'event_date',
    'event_text',
    'num_affected',
    'estimated_number_of_affected_male',
    'estimated_number_of_affected_female',
    'estimated_number_of_affected_girls_under_18',
    'estimated_number_of_affected_boys_under_18',
    'people_in_need',
    'event_description',
    'event_scope',
    'source_information',
    'images_file',
    'hazard_vulnerabilities_and_risks',
    'scenario_analysis_supporting_document',
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
    'has_anti_fraud_corruption_policy',
    'has_sexual_abuse_policy',
    'has_child_protection_policy',
    'has_whistleblower_protection_policy',
    'has_anti_sexual_harassment_policy',
    'budget_file',
    'amount_requested',
    'planned_interventions',
    'human_resource',
    'is_volunteer_team_diverse',
    'is_surge_personnel_deployed',
    'surge_personnel_deployed',
    'logistic_capacity_of_ns',
    'pmer',
    'communication',
    'addressed_humanitarian_impacts',
    'contingency_plans_supporting_document',
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
    'national_society_integrity_contact_name',
    'national_society_integrity_contact_title',
    'national_society_integrity_contact_email',
    'national_society_integrity_contact_phone_number',
    'national_society_hotline_phone_number',
    'media_contact_title',
] satisfies (keyof PartialDref)[];

const tabToFieldsMap = {
    overview: overviewTabFields,
    eventDetail: eventDetailTabFields,
    actions: actionsTabFields,
    operation: operationTabFields,
    submission: timeframeAndContactsTabFields,
};

export const calculateProposedActionsCost = (val: PartialDref | DrefResponseType) => {
    const subTotal = sumSafe(
        val?.proposed_action?.map((pa) => pa.total_budget),
    ) ?? 0;

    // NOTE: if Surge Personnel are deployed,
    // the Surge Deployment cost will be CHF 10,000,
    // and the Indirect Costs will be CHF 5,800. Conversely,
    // if Surge Personnel are not deployed,
    // the Surge Deployment cost will not be applicable,
    // and the Indirect Costs will be CHF 5,000
    const surgeDeploymentCost = val.is_surge_personnel_deployed ? SURGE_DEPLOYMENT_COST : undefined;
    const indirectCost = val.is_surge_personnel_deployed ? SURGE_INDIRECT_COST : INDIRECT_COST;

    const total = sumSafe(
        [subTotal, indirectCost, surgeDeploymentCost],
    );
    return {
        sub_total_cost: subTotal,
        indirect_cost: indirectCost,
        surge_deployment_cost: surgeDeploymentCost,
        total_cost: total,
    };
};

export const calculateTotalTargetedPopulation = (val: PartialDref) => {
    const totalTargetedPopulation = sumSafe([
        val.boys,
        val.women,
        val.girls,
        val.men,
    ]) ?? 0;

    return totalTargetedPopulation;
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
