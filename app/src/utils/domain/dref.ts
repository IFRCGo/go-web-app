import { type components } from '#generated/types';
import {
    DREF_TYPE_IMMINENT,
    type TypeOfDrefEnum,
} from '#utils/constants';

type TypeOfOnsetEnum = components<'read'>['schemas']['DrefDrefOnsetTypeEnumKey'];

const GO_WIKI_DREF_GUIDELINES = 'https://go-wiki.ifrc.org/en/DREF/DREF_Guidelines_2026';

export const DREF_GUIDELINES_DROUGHT_URL = `${GO_WIKI_DREF_GUIDELINES}#dref-p126-response-dref-for-drought-specific-slow-onset-crises`;
export const DREF_GUIDELINES_READINESS_URL = `${GO_WIKI_DREF_GUIDELINES}#dref-p128-dref-support-for-readiness-actions`;
export const DREF_GUIDELINES_LOAN_URL = `${GO_WIKI_DREF_GUIDELINES}#dref-p130-dref-loan-for-red-category-emergencies`;
export const DREF_AA_MANUAL_URL = 'https://manual.anticipatory-action.org/en/';

// Per-outcome guidance targets used by the DREF decision tree.
export const DREF_GUIDELINES_RESPONSE_URL = `${GO_WIKI_DREF_GUIDELINES}#dref-p121-4-4-allocation-parameters-under-response-dref`;
export const DREF_GUIDELINES_IMMINENT_URL = `${GO_WIKI_DREF_GUIDELINES}#dref-p73-3-5-imminent-dref`;
export const DREF_GUIDELINES_EAP_ACTIVATION_URL = `${GO_WIKI_DREF_GUIDELINES}#dref-p59-s-eap-activation`;
export const DREF_GUIDELINES_EAP_DEVELOPMENT_URL = `${GO_WIKI_DREF_GUIDELINES}#dref-p48-3-4-2-s-eap-development-and-submission-process`;
export const DREF_GUIDELINES_ADVANCE_PAYMENT_URL = `${GO_WIKI_DREF_GUIDELINES}#dref-p161-review-approval-and-disbursement-with-emergency-advance-payment`;
export const DREF_GUIDELINES_RECURRENT_EVENTS_URL = `${GO_WIKI_DREF_GUIDELINES}#dref-p133-recurrent-events-and-accessing-dref-funding`;
// Emergency Appeals live outside GO; the decision tree points at the shared document folder.
export const EMERGENCY_APPEAL_RESOURCES_URL = 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/IgDOBQt_IudIR54zFy6L0L2tATWUZbUMzw9Migz9_WtoPA0?e=0ccrAd';

export const DREF_ANTICIPATORY_GUIDANCE_URL = `${GO_WIKI_DREF_GUIDELINES}#h-3-anticipatory-pillar`;
export const DREF_RESPONSE_GUIDANCE_URL: string | undefined = `${GO_WIKI_DREF_GUIDELINES}#h-4-response-pillar`;

// Key DREF resources. The SharePoint links are the ones supplied by the DREF team with
// their mail-session parameters (ct/or/ga/LOF/cid/ovuser/xsdata) stripped, leaving only
// the document identity. They still require an IFRC login.
export const DREF_PROCEDURES_URL: string | undefined = 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF%2FNew%20DREF%20Procedures%2FDREF%20Procedures%5Fsigned%2Dversion%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF%2FNew%20DREF%20Procedures';
export const DREF_GUIDELINES_URL: string | undefined = 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF%2FDREF%20Procedures%20and%20Guidelines%2FDREF%20Guidelines%202026%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FDREF%2FDREF%20Procedures%20and%20Guidelines';
export const DREF_RBM_URL: string | undefined = 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/IgBYYWWQVGHiS5rnwYXIX1ObAYFM5-IBl4BLsh_vSKwQwAE';
export const ANTICIPATION_HUB_URL: string | undefined = 'https://www.anticipation-hub.org/';
export const DREF_ERF_URL: string | undefined = 'https://www.ifrc.org/sites/default/files/2026-04/IFRC%20Emergency%20Response%20Framework.pdf';

// TODO: fill in once the form is published; until then DrefDocumentLink renders a
// disabled button.
export const DREF_ADVANCE_PAYMENT_FORM_URL: string | undefined = undefined;

// Router state consumed by DrefApplicationForm (via useLocation().state) to seed a
// NEW application. Entry points (pillar buttons, decision tree) declare intent only;
// the form derives the type-dependent fields (onset, proposed actions) on load.
interface NewDrefRouteState {
    type_of_dref: TypeOfDrefEnum;
    type_of_onset?: TypeOfOnsetEnum;
    disaster_type?: number;
}

export function getNewDrefRouteState(
    typeOfDref: TypeOfDrefEnum,
    typeOfOnset?: TypeOfOnsetEnum,
    disasterType?: number,
): NewDrefRouteState {
    return {
        type_of_dref: typeOfDref,
        type_of_onset: typeOfOnset,
        disaster_type: disasterType,
    };
}

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

// Name of the hidden worksheet that backs the data-validation dropdown lists.
export const DREF_OPTIONS_SHEET_NAME = 'options';

// The DREF type is embedded by the template export into a fixed cell on the
// hidden options sheet, and read back on import to pick the right schema and
// validate the worksheet set. The column is set far beyond the option columns
// (one column per option list, a small handful) so it can never collide.
export const DREF_TYPE_CELL_ROW = 1;
export const DREF_TYPE_CELL_COLUMN = 100;

// The content worksheets (and their order) a DREF import template has, per type.
// Imminent has no Actions/Needs section, so that sheet is omitted for it.
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
