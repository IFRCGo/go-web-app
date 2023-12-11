import { components } from '#generated/types';

type PlannedIntervention = components<'read'>['schemas']['PlannedIntervention'];
type IdentifiedNeedsAndGaps = components<'read'>['schemas']['IdentifiedNeed'];
type NsActions = components<'read'>['schemas']['NationalSocietyAction'];

const plannedInterventionSortedList: Record<NonNullable<PlannedIntervention['title']>, number> = {
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

const identifiedNeedsAndGapsSortedList: Record<NonNullable<IdentifiedNeedsAndGaps['title']>, number> = {
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

const nsActionsSortedList: Record<NsActions['title'], number> = {
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

export {
    plannedInterventionSortedList,
    identifiedNeedsAndGapsSortedList,
    nsActionsSortedList,
};
