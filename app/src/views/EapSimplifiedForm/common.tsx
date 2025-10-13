import { isNotDefined } from '@togglecorp/fujs';
import {
    analyzeErrors,
    type Error,
    getErrorObject,
} from '@togglecorp/toggle-form';

import { type PartialSimplifiedEapType } from './schema';

export type TabKeys = 'overview' | 'riskAnalysis' | 'earlyAction' | 'plannedOperations' | 'enablingApproaches' | 'deliveryAndBudget';

type FormKeys = keyof PartialSimplifiedEapType;

const overviewTabFields = [
    'cover_image_file',
    'modified_at',
    'seap_timeframe',
    'national_society_contact_name',
    'national_society_contact_title',
    'national_society_contact_email',
    'national_society_contact_phone_number',
    'partners',
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
    'ifrc_head_of_delegation_name',
    'ifrc_head_of_delegation_title',
    'ifrc_head_of_delegation_email',
    'ifrc_head_of_delegation_phone_number',
] as const satisfies FormKeys[];

type OverviewKeys = typeof overviewTabFields[number];

const riskAnalysisTabFields = [
    'prioritized_hazard_and_impact',
    'hazard_impact_images',
    'risks_selected_protocols',
    'risk_selected_protocols_images',
    'selected_early_actions',
    'selected_early_actions_images',
] as const satisfies Exclude<FormKeys, OverviewKeys>[];

type RiskAnalysisKeys = typeof riskAnalysisTabFields[number];

const earlyActionTabFields = [
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
] as const satisfies Exclude<FormKeys, OverviewKeys | RiskAnalysisKeys>[];

type EarlyActionKeys = typeof earlyActionTabFields[number];

const plannedOperationsTabFields = [
    'planned_operations',
] as const satisfies Exclude<FormKeys, OverviewKeys | RiskAnalysisKeys | EarlyActionKeys>[];

type PlannedOperationsKeys = typeof plannedOperationsTabFields[number];

const enablingApproachesTabFields = [
    'enabling_approaches',
] as const satisfies Exclude<FormKeys,
    OverviewKeys | RiskAnalysisKeys | EarlyActionKeys | PlannedOperationsKeys>[];

type EnablingApproachesKeys = typeof enablingApproachesTabFields[number];

const deliveryAndBudgetTabFields = [
    'early_action_capability',
    'rcrc_movement_involvement',
    'total_budget',
    'readiness_budget',
    'pre_positioning_budget',
    'early_action_budget',
    'budget_file',
    'updated_checklist_file',
] as const satisfies Exclude<FormKeys,
    OverviewKeys
    | RiskAnalysisKeys
    | EarlyActionKeys
    | PlannedOperationsKeys
    | EnablingApproachesKeys
>[];

type DeliveryAndBudgetKeys = typeof deliveryAndBudgetTabFields[number];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const unusedKeys = [
    'parent',
    'diff_file',
    'created_by',
    'export_file',
    'modified_by',
    'eap_registration',
    'review_checklist_file',
] as const satisfies Exclude<FormKeys,
    OverviewKeys
    | RiskAnalysisKeys
    | EarlyActionKeys
    | PlannedOperationsKeys
    | EnablingApproachesKeys
    | DeliveryAndBudgetKeys
>[];

type UnusedKeys = typeof unusedKeys[number];

const remainingKeys: Exclude<FormKeys,
    OverviewKeys
    | RiskAnalysisKeys
    | EarlyActionKeys
    | PlannedOperationsKeys
    | EnablingApproachesKeys
    | DeliveryAndBudgetKeys
    | UnusedKeys
>[] = [];

remainingKeys[0]! satisfies never;

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

export const charLimits = {
    prioritized_hazard_and_impact: 500,
    risks_selected_protocols: 150,
    selected_early_actions: 150,
    overall_objective_intervention: 150,
    potential_geographical_high_risk_areas: 100,
    assisted_through_operation: 100,
    selection_criteria: 100,
    trigger_statement: 100,
    trigger_threshold_justification: 100,
    next_step_towards_full_eap: 100,
    early_action_capability: 500,
    rcrc_movement_involvement: 150,
    people_targeted: 2000,
} satisfies { [key in FormKeys]?: number };
