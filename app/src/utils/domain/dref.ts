import { type components } from '#generated/types';
import {
    DREF_TYPE_IMMINENT,
    type TypeOfDrefEnum,
} from '#utils/constants';

type PlannedIntervention = components<'read'>['schemas']['PlannedIntervention'];
type PlannedInterventionTitle = NonNullable<PlannedIntervention['title']>;
type IdentifiedNeeds = components<'read'>['schemas']['IdentifiedNeed'];
type IdentifiedNeedsTitle = NonNullable<IdentifiedNeeds['title']>;
type NsActions = components<'read'>['schemas']['NationalSocietyAction'];

export const plannedInterventionOrder: Record<PlannedInterventionTitle, number> = {
    shelter_housing_and_settlements: 1,
    livelihoods_and_basic_needs: 2,
    multi_purpose_cash: 3,
    health: 4,
    water_sanitation_and_hygiene: 5,
    protection_gender_and_inclusion: 6,
    education: 7,
    migration_and_displacement: 8,
    risk_reduction_climate_adaptation_and_recovery: 9,
    community_engagement_and_accountability: 10,
    environmental_sustainability: 11,
    coordination_and_partnerships: 12,
    secretariat_services: 13,
    national_society_strengthening: 14,
};

export const identifiedNeedsAndGapsOrder: Record<IdentifiedNeedsTitle, number> = {
    shelter_housing_and_settlements: 1,
    livelihoods_and_basic_needs: 2,
    multi_purpose_cash_grants: 3,
    health: 4,
    water_sanitation_and_hygiene: 5,
    protection_gender_and_inclusion: 6,
    education: 7,
    migration_and_displacement: 8,
    risk_reduction_climate_adaptation_and_recovery: 9,
    community_engagement_and_accountability: 10,
    environment_sustainability: 11,
};

export const nsActionsOrder: Record<NsActions['title'], number> = {
    shelter_housing_and_settlements: 1,
    livelihoods_and_basic_needs: 2,
    multi_purpose_cash: 3,
    health: 4,
    water_sanitation_and_hygiene: 5,
    protection_gender_and_inclusion: 6,
    education: 7,
    migration_and_displacement: 8,
    risk_reduction_climate_adaptation_and_recovery: 9,
    community_engagement_and_accountability: 10,
    environment_sustainability: 11,
    coordination: 12,
    national_society_readiness: 13,
    assessment: 14,
    resource_mobilization: 15,
    activation_of_contingency_plans: 16,
    national_society_eoc: 17,
    other: 18,
};

export type DrefSheetName = 'Operation Overview' | 'Event Detail' | 'Actions Needs' | 'Operation' | 'Timeframes and Contacts';
export const SHEET_OPERATION_OVERVIEW = 'Operation Overview' satisfies DrefSheetName;
export const SHEET_EVENT_DETAIL = 'Event Detail' satisfies DrefSheetName;
export const SHEET_ACTIONS_NEEDS = 'Actions Needs' satisfies DrefSheetName;
export const SHEET_OPERATION = 'Operation' satisfies DrefSheetName;
export const SHEET_TIMEFRAMES_AND_CONTACTS = 'Timeframes and Contacts' satisfies DrefSheetName;

export const DREF_OPTIONS_SHEET_NAME = 'options';

// DREF type embedded here on export, read back on import. Column is far beyond
// the option columns so it can't collide with them.
export const DREF_TYPE_CELL_ROW = 1;
export const DREF_TYPE_CELL_COLUMN = 100;

// Content worksheets per type; Imminent omits Actions/Needs.
export function getDrefSheetNames(typeOfDref: TypeOfDrefEnum): DrefSheetName[] {
    if (typeOfDref === DREF_TYPE_IMMINENT) {
        return [
            SHEET_OPERATION_OVERVIEW,
            SHEET_EVENT_DETAIL,
            SHEET_OPERATION,
            SHEET_TIMEFRAMES_AND_CONTACTS,
        ];
    }

    return [
        SHEET_OPERATION_OVERVIEW,
        SHEET_EVENT_DETAIL,
        SHEET_ACTIONS_NEEDS,
        SHEET_OPERATION,
        SHEET_TIMEFRAMES_AND_CONTACTS,
    ];
}
