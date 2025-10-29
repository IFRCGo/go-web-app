import { type DeepReplace } from '@ifrc-go/ui/utils';
import {
    type ObjectSchema,
    type PartialForm,
    type PurgeNull,
    undefinedValue,
} from '@togglecorp/toggle-form';

import { type GoApiBody } from '#utils/restRequest';

type EapSimplifiedRequestBody = GoApiBody<'/api/v2/simplified-eap/', 'POST'>;

type OperationsResponse = NonNullable<EapSimplifiedRequestBody['planned_operations']>[number];
type EarlyActionResponse = NonNullable<OperationsResponse['early_action_activities']>[number];
type PrepositioningResponse = NonNullable<OperationsResponse['prepositioning_activities']>[number];
type ReadinessResponse = NonNullable<OperationsResponse['readiness_activities']>[number];

type HazardImagesResponse = NonNullable<EapSimplifiedRequestBody['hazard_impact_file']>[number];
type RiskImagesResponse = NonNullable<EapSimplifiedRequestBody['risk_selected_protocols_file']>[number];
type EarlyActionImagesResponse = NonNullable<EapSimplifiedRequestBody['selected_early_actions_file']>[number];

type OperationsFormFields = OperationsResponse & { client_id: string };
type EarlyActionFormFields = EarlyActionResponse & { client_id: string };
type PrepositioningFormFields = PrepositioningResponse & { client_id: string };
type ReadinessFormFields = ReadinessResponse & { client_id: string };

type HazardImagesFormFields = HazardImagesResponse & { client_id: string };
type RiskImagesFormFields = RiskImagesResponse & { client_id: string };
type EarlyActionImagesFormFields = EarlyActionImagesResponse & { client_id: string };

type FormFields = (
    DeepReplace<
        DeepReplace<
            DeepReplace<
                DeepReplace<
                    DeepReplace<
                        DeepReplace<
                            DeepReplace<
                                EapSimplifiedRequestBody,
                                OperationsResponse,
                                OperationsFormFields
                            >,
                            EarlyActionResponse,
                            EarlyActionFormFields
                        >,
                        PrepositioningResponse,
                        PrepositioningFormFields
                    >,
                    ReadinessResponse,
                    ReadinessFormFields
                >,
                HazardImagesResponse,
                HazardImagesFormFields
            >,
            RiskImagesResponse,
            RiskImagesFormFields
        >,
        EarlyActionImagesResponse,
        EarlyActionImagesFormFields
    >
);

export type PartialSimplifiedEapType = PartialForm<PurgeNull<FormFields>, 'client_id'>;
type PlannedOperationalFields = ReturnType<ObjectSchema<NonNullable<PartialSimplifiedEapType['planned_operations']>[number], PartialSimplifiedEapType>['fields']>;
type EarlyActionFields = ReturnType<ObjectSchema<NonNullable<NonNullable<PartialSimplifiedEapType['planned_operations']>[number]['early_action_activities']>[number], PartialSimplifiedEapType>['fields']>;
type PrepositioningFields = ReturnType<ObjectSchema<NonNullable<NonNullable<PartialSimplifiedEapType['planned_operations']>[number]['prepositioning_activities']>[number], PartialSimplifiedEapType>['fields']>;
type ReadinessFields = ReturnType<ObjectSchema<NonNullable<NonNullable<PartialSimplifiedEapType['planned_operations']>[number]['readiness_activities']>[number], PartialSimplifiedEapType>['fields']>;

type CoverImageFileFields = ReturnType<ObjectSchema<PartialSimplifiedEapType['cover_image'], PartialSimplifiedEapType>['fields']>;
type HazardImpactFileFields = ReturnType<ObjectSchema<HazardImagesFormFields, PartialSimplifiedEapType>['fields']>;
type RiskProtocolsFileFields = ReturnType<ObjectSchema<RiskImagesFormFields, PartialSimplifiedEapType>['fields']>;
type EarlyActionFileFields = ReturnType<ObjectSchema<EarlyActionImagesFormFields, PartialSimplifiedEapType>['fields']>;

type FormSchema = ObjectSchema<PartialSimplifiedEapType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

export const formSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        admin2: { required: true },
        cover_image: {
            fields: (): CoverImageFileFields => ({
                client_id: {},
                caption: {},
                id: { defaultValue: undefinedValue },
            }),
        },
        hazard_impact_file: {
            keySelector: (item) => item.client_id,
            member: () => ({
                fields: (): HazardImpactFileFields => ({
                    client_id: {},
                    caption: {},
                    id: { defaultValue: undefinedValue },
                }),
            }),
        },
        risk_selected_protocols_file: {
            keySelector: (item) => item.client_id,
            member: () => ({
                fields: (): RiskProtocolsFileFields => ({
                    client_id: {},
                    caption: {},
                    id: { defaultValue: undefinedValue },
                }),
            }),
        },
        selected_early_actions_file: {
            keySelector: (item) => item.client_id,
            member: () => ({
                fields: (): EarlyActionFileFields => ({
                    client_id: {},
                    caption: {},
                    id: { defaultValue: undefinedValue },
                }),
            }),
        },
        assisted_through_operation: {},
        dref_focal_point_name: {},
        dref_focal_point_title: {},
        dref_focal_point_email: {},
        dref_focal_point_phone_number: {},
        eap_registration: {},
        early_action_budget: {},
        early_action_capability: {},
        ifrc_delegation_focal_point_name: {},
        ifrc_delegation_focal_point_title: {},
        ifrc_delegation_focal_point_email: {},
        ifrc_delegation_focal_point_phone_number: {},
        ifrc_global_ops_coordinator_name: {},
        ifrc_global_ops_coordinator_title: {},
        ifrc_global_ops_coordinator_phone_number: {},
        ifrc_global_ops_coordinator_email: {},
        ifrc_head_of_delegation_name: {},
        ifrc_head_of_delegation_title: {},
        ifrc_head_of_delegation_email: {},
        ifrc_head_of_delegation_phone_number: {},
        ifrc_regional_focal_point_name: {},
        ifrc_regional_focal_point_title: {},
        ifrc_regional_focal_point_email: {},
        ifrc_regional_focal_point_phone_number: {},
        ifrc_regional_head_dcc_name: {},
        ifrc_regional_head_dcc_title: {},
        ifrc_regional_head_dcc_email: {},
        ifrc_regional_head_dcc_phone_number: {},
        ifrc_regional_ops_manager_name: {},
        ifrc_regional_ops_manager_title: {},
        ifrc_regional_ops_manager_phone_number: {},
        ifrc_regional_ops_manager_email: {},
        national_society_contact_name: {},
        national_society_contact_title: {},
        national_society_contact_email: {},
        national_society_contact_phone_number: {},
        operational_timeframe: { required: true },
        partner_ns_name: {},
        partner_ns_title: {},
        partner_ns_email: {},
        partner_ns_phone_number: {},
        people_targeted: { },
        pre_positioning_budget: { required: true },
        readiness_budget: { required: true },
        seap_lead_time: {},
        selected_early_actions: {},
        selection_criteria: {},
        trigger_threshold_justification: {},
        trigger_statement: {},
        total_budget: { required: true },
        prioritized_hazard_and_impact: {},
        risks_selected_protocols: {},
        planned_operations: {
            keySelector: (item) => item.client_id,
            member: () => ({
                fields: (): PlannedOperationalFields => ({
                    client_id: {},
                    id: { defaultValue: undefinedValue },
                    sector: { required: true },
                    budget_per_sector: {},
                    ap_code: {},
                    people_targeted: {},
                    early_action_activities: {
                        keySelector: (item) => item.client_id,
                        member: () => ({
                            fields: (): EarlyActionFields => ({
                                client_id: { forceValue: undefinedValue },
                                id: { defaultValue: undefinedValue },
                                activity: {},
                                timeframe: {},
                                time_value: {},
                            }),
                        }),
                    },
                    readiness_activities: {
                        keySelector: (item) => item.client_id,
                        member: () => ({
                            fields: (): ReadinessFields => ({
                                client_id: { forceValue: undefinedValue },
                                id: { defaultValue: undefinedValue },
                                activity: {},
                                timeframe: {},
                                time_value: {},
                            }),
                        }),
                    },
                    prepositioning_activities: {
                        keySelector: (item) => item.client_id,
                        member: () => ({
                            fields: (): PrepositioningFields => ({
                                client_id: { forceValue: undefinedValue },
                                id: { defaultValue: undefinedValue },
                                activity: {},
                                timeframe: {},
                                time_value: {},
                            }),
                        }),
                    },
                }),
            }),
        },
    }),
};
