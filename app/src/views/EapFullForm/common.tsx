import { isNotDefined } from '@togglecorp/fujs';
import {
    analyzeErrors,
    type Error,
    getErrorObject,
} from '@togglecorp/toggle-form';

import { type PartialEapFullFormType } from './schema';

export type TabKeys =
    | 'overview'
    | 'riskAnalysis'
    | 'triggerModel'
    | 'selectionActions'
    | 'eapActivation'
    | 'meal'
    | 'nationalSocietyCapacity'
    | 'financeLogistics';

const overviewTabFields: (keyof PartialEapFullFormType)[] = [
    'expected_submission_time',
    'modified_at',
    'objective',
    'cover_image_file',
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
    'is_worked_with_government',
    'worked_with_government_description',
    'key_actors',
    'is_technical_working_groups',
    'technically_working_group_title',
    'technical_working_groups_in_place_description',
];

const riskAnalysisTabFields: (keyof PartialEapFullFormType)[] = [
    'hazard_selection_images',
    'hazard_selection',
    'exposed_element_and_vulnerability_factor',
    'exposed_element_and_vulnerability_factor_images',
    'prioritized_impacts',
    'prioritized_impact_images',
    'risk_analysis_relevant_files',
    'risk_analysis_source_of_information',
];

const triggerModelTabFields: (keyof PartialEapFullFormType)[] = [
    'trigger_statement',
    'lead_time',
    'trigger_statement_source_of_information',
    'forecast_selection',
    'forecast_selection_images',
    'forecast_table_file',
    'definition_and_justification_impact_level',
    'definition_and_justification_impact_level_images',
    'identification_of_the_intervention_area',
    'identification_of_the_intervention_area_images',
    'admin2',
    'trigger_model_source_of_information',
    'trigger_model_relevant_files',
];

const selectionActionsTabFields: (keyof PartialEapFullFormType)[] = [
    'early_actions',
    'early_action_selection_process',
    'early_action_selection_process_images',
    'theory_of_change_table_file',
    'evidence_base',
    'evidence_base_source_of_information',
    'evidence_base_relevant_files',
    'planned_operations',
    'enabling_approaches',
    'usefulness_of_actions',
    'feasibility',
];

const eapActivationTabFields: (keyof PartialEapFullFormType)[] = [
    'early_action_implementation_process',
    'early_action_implementation_images',
    'trigger_activation_system_images',
    'trigger_activation_system',
    'people_targeted',
    'selection_of_target_population',
    'stop_mechanism',
    'activation_process_relevant_files',
    'activation_process_source_of_information',
];

const mealTabFields: (keyof PartialEapFullFormType)[] = [
    'meal',
    'meal_relevant_files',
];

const nationalSocietyTabFields: (keyof PartialEapFullFormType)[] = [
    'operational_administrative_capacity',
    'strategies_and_plans',
    'advance_financial_capacity',
    'capacity_relevant_files',
];

const financeLogisticsTabFields: (keyof PartialEapFullFormType)[] = [
    'total_budget',
    'budget_file',
    'budget_description',
    'readiness_budget',
    'readiness_cost_description',
    'pre_positioning_budget',
    'prepositioning_cost_description',
    'early_action_budget',
    'early_action_cost_description',
    'eap_endorsement',
    'updated_checklist_file',
];

const tabToFieldsMap: Record<TabKeys, (keyof PartialEapFullFormType)[]> = {
    overview: overviewTabFields,
    riskAnalysis: riskAnalysisTabFields,
    triggerModel: triggerModelTabFields,
    selectionActions: selectionActionsTabFields,
    eapActivation: eapActivationTabFields,
    meal: mealTabFields,
    nationalSocietyCapacity: nationalSocietyTabFields,
    financeLogistics: financeLogisticsTabFields,
};

export function checkTabErrors(
    error: Error<PartialEapFullFormType> | undefined,
    tabKey: TabKeys,
) {
    if (isNotDefined(analyzeErrors(error))) {
        return false;
    }

    const fields = tabToFieldsMap[tabKey];
    const fieldErrors = getErrorObject(error);

    const hasErrorOnAnyField = fields.some((field) => {
        const fieldError = fieldErrors?.[field];
        const isErrored = analyzeErrors<PartialEapFullFormType>(fieldError);
        return isErrored;
    });

    return hasErrorOnAnyField;
}
