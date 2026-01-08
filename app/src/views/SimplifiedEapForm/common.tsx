import { isNotDefined } from '@togglecorp/fujs';
import {
    analyzeErrors,
    type Error,
    getErrorObject,
} from '@togglecorp/toggle-form';

import { type PartialSimplifiedEapType } from './schema';

export type TabKeys = 'overview' | 'riskAnalysis' | 'earlyAction' | 'plannedOperations' | 'enablingApproaches' | 'deliveryAndBudget';

const overviewTabFields: (keyof PartialSimplifiedEapType)[] = [
    'cover_image_file',
    'seap_timeframe',
    'national_society_contact_name',
    'national_society_contact_title',
    'national_society_contact_email',
    'national_society_contact_phone_number',
    'partner_contacts',
    'dref_focal_point_name',
    'dref_focal_point_email',
    'dref_focal_point_phone_number',
    'ifrc_delegation_focal_point_name',
    'ifrc_delegation_focal_point_title',
    'ifrc_delegation_focal_point_email',
    'ifrc_delegation_focal_point_phone_number',
    'dref_focal_point_name',
    'dref_focal_point_title',
    'dref_focal_point_email',
    'dref_focal_point_phone_number',
    'ifrc_regional_focal_point_name',
    'ifrc_regional_focal_point_title',
    'ifrc_regional_focal_point_email',
    'ifrc_regional_focal_point_phone_number',
    'ifrc_regional_ops_manager_name',
    'ifrc_regional_ops_manager_title',
    'ifrc_regional_ops_manager_email',
    'ifrc_regional_ops_manager_phone_number',
    'ifrc_regional_head_dcc_name',
    'ifrc_regional_head_dcc_title',
    'ifrc_regional_head_dcc_email',
    'ifrc_regional_head_dcc_phone_number',
    'ifrc_global_ops_coordinator_name',
    'ifrc_global_ops_coordinator_title',
    'ifrc_global_ops_coordinator_email',
    'ifrc_global_ops_coordinator_phone_number',
] satisfies (keyof PartialSimplifiedEapType)[];

const riskAnalysisTabFields: (keyof PartialSimplifiedEapType)[] = [
    'prioritized_hazard_and_impact',
    'hazard_impact_images',
    'risks_selected_protocols',
    'risk_selected_protocols_images',
    'selected_early_actions',
    'selected_early_actions_images',
] satisfies (keyof PartialSimplifiedEapType)[];

const earlyActionTabFields: (keyof PartialSimplifiedEapType)[] = [
    'overall_objective_intervention',
    'potential_geographical_high_risk_areas',
    'admin2',
    'people_targeted',
    'assisted_through_operation',
    'selection_criteria',
    'trigger_statement',
    'seap_lead_time',
    'seap_lead_timeframe_unit',
    'operational_timeframe',
    'operational_timeframe_unit',
    'trigger_threshold_justification',
    'next_step_towards_full_eap',
] satisfies (keyof PartialSimplifiedEapType)[];

const plannedOperationsTabFields: (keyof PartialSimplifiedEapType)[] = [
    'planned_operations',
] satisfies (keyof PartialSimplifiedEapType)[];

const enablingApproachesTabFields: (keyof PartialSimplifiedEapType)[] = [
    'enable_approaches',
] satisfies (keyof PartialSimplifiedEapType)[];

const deliveryAndBudgetTabFields: (keyof PartialSimplifiedEapType)[] = [
    'early_action_capability',
    'rcrc_movement_involvement',
    'total_budget',
    'readiness_budget',
    'pre_positioning_budget',
    'early_action_budget',
    'budget_file',
    'updated_checklist_file',
] satisfies (keyof PartialSimplifiedEapType)[];

const tabToFieldsMap: Record<TabKeys, (keyof PartialSimplifiedEapType)[]> = {
    overview: overviewTabFields,
    riskAnalysis: riskAnalysisTabFields,
    earlyAction: earlyActionTabFields,
    plannedOperations: plannedOperationsTabFields,
    enablingApproaches: enablingApproachesTabFields,
    deliveryAndBudget: deliveryAndBudgetTabFields,
};

export function checkTabErrors(
    error: Error<PartialSimplifiedEapType> | undefined,
    tabKey: TabKeys,
) {
    if (isNotDefined(analyzeErrors(error))) {
        return false;
    }

    const fields = tabToFieldsMap[tabKey];
    const fieldErrors = getErrorObject(error);

    const hasErrorOnAnyField = fields.some(
        (field) => {
            const fieldError = fieldErrors?.[field];
            const isErrored = analyzeErrors<PartialSimplifiedEapType>(fieldError);
            return isErrored;
        },
    );

    return hasErrorOnAnyField;
}
