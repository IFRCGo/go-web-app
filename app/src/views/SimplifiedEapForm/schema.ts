import { type DeepReplace } from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';
import {
    emailCondition,
    type ObjectSchema,
    type PartialForm,
    undefinedValue,
} from '@togglecorp/toggle-form';

import { type GoApiBody } from '#utils/restRequest';

function lessThanEqualToFiveImagesCondition<T>(value: T[] | undefined) {
    return isDefined(value) && Array.isArray(value) && value.length > 5
        ? 'Maximum five images are allowed'
        : undefined;
}

function maxOperationalTimeframeCondition(value: number | undefined) {
    return typeof value === 'number' && value > 12
        ? 'Timeframe cannot be more than 12 months'
        : undefined;
}

type EapSimplifiedRequestBody = GoApiBody<'/api/v2/simplified-eap/', 'POST'>;

type EnableApproachesResponse = NonNullable<EapSimplifiedRequestBody['enable_approaches']>[number];
type EarlyActionApproachesResponse = NonNullable<EnableApproachesResponse['early_action_activities']>[number];
type PrepositioningApproachesResponse = NonNullable<EnableApproachesResponse['prepositioning_activities']>[number];
type ReadinessApproachesResponse = NonNullable<EnableApproachesResponse['readiness_activities']>[number];

type OperationsResponse = NonNullable<EapSimplifiedRequestBody['planned_operations']>[number];
type EarlyActionResponse = NonNullable<OperationsResponse['early_action_activities']>[number];
type PrepositioningResponse = NonNullable<OperationsResponse['prepositioning_activities']>[number];
type ReadinessResponse = NonNullable<OperationsResponse['readiness_activities']>[number];

type CoverImageFileResponse = NonNullable<EapSimplifiedRequestBody['cover_image_file']>;

type HazardImagesResponse = NonNullable<EapSimplifiedRequestBody['hazard_impact_images']>[number];
type RiskImagesResponse = NonNullable<EapSimplifiedRequestBody['risk_selected_protocols_images']>[number];
type EarlyActionImagesResponse = NonNullable<EapSimplifiedRequestBody['selected_early_actions_images']>[number];

type EarlyActionApproachesFormFields = EarlyActionApproachesResponse & { client_id: string };
type PrepositioningApproachesFormFields = PrepositioningApproachesResponse & { client_id: string };
type ReadinessApproachesFormFields = ReadinessApproachesResponse & { client_id: string };
type CoverImageFileFields = CoverImageFileResponse & { client_id: string };

type EarlyActionFormFields = EarlyActionResponse & { client_id: string };
type PrepositioningFormFields = PrepositioningResponse & { client_id: string };
type ReadinessFormFields = ReadinessResponse & { client_id: string };

type HazardImagesFormFields = HazardImagesResponse & { client_id: string };
type RiskImagesFormFields = RiskImagesResponse & { client_id: string };
type EarlyActionImagesFormFields = EarlyActionImagesResponse & { client_id: string };

type EnableApproachesResponseFormFields = (
    DeepReplace<
        DeepReplace<
            DeepReplace<
                EnableApproachesResponse,
                EarlyActionApproachesResponse,
                EarlyActionApproachesFormFields
            >,
            PrepositioningApproachesResponse,
            PrepositioningApproachesFormFields
        >,
        ReadinessApproachesResponse,
        ReadinessApproachesFormFields
    >
) & { client_id: string, title: number | undefined }

type OperationsResponseFormFields = (
    DeepReplace<
        DeepReplace<
            DeepReplace<
                OperationsResponse,
                EarlyActionResponse,
                EarlyActionFormFields
            >,
            PrepositioningResponse,
            PrepositioningFormFields
        >,
        ReadinessResponse,
        ReadinessFormFields
    >
) & { client_id: string, title: number | undefined }

type FormFields = (
    DeepReplace<
        DeepReplace<
            DeepReplace<
                DeepReplace<
                    DeepReplace<
                        DeepReplace<
                            EapSimplifiedRequestBody,
                            OperationsResponse,
                            OperationsResponseFormFields
                        >,
                        EnableApproachesResponse,
                        EnableApproachesResponseFormFields
                    >,
                    CoverImageFileResponse,
                    CoverImageFileFields
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

export type PartialSimplifiedEapType = PartialForm<FormFields, 'client_id'>;
type PlannedOperationalFields = ReturnType<ObjectSchema<NonNullable<PartialSimplifiedEapType['planned_operations']>[number], PartialSimplifiedEapType>['fields']>;
type EarlyActionFields = ReturnType<ObjectSchema<NonNullable<NonNullable<PartialSimplifiedEapType['planned_operations']>[number]['early_action_activities']>[number], PartialSimplifiedEapType>['fields']>;
type PrepositioningFields = ReturnType<ObjectSchema<NonNullable<NonNullable<PartialSimplifiedEapType['planned_operations']>[number]['prepositioning_activities']>[number], PartialSimplifiedEapType>['fields']>;
type ReadinessFields = ReturnType<ObjectSchema<NonNullable<NonNullable<PartialSimplifiedEapType['planned_operations']>[number]['readiness_activities']>[number], PartialSimplifiedEapType>['fields']>;

type EnableApproachesFields = ReturnType<ObjectSchema<NonNullable<PartialSimplifiedEapType['enable_approaches']>[number], PartialSimplifiedEapType>['fields']>;
type EarlyActionApproachesFields = ReturnType<ObjectSchema<NonNullable<NonNullable<PartialSimplifiedEapType['enable_approaches']>[number]['early_action_activities']>[number], PartialSimplifiedEapType>['fields']>;
type PrepositioningApproachesFields = ReturnType<ObjectSchema<NonNullable<NonNullable<PartialSimplifiedEapType['enable_approaches']>[number]['prepositioning_activities']>[number], PartialSimplifiedEapType>['fields']>;
type ReadinessApproachesFields = ReturnType<ObjectSchema<NonNullable<NonNullable<PartialSimplifiedEapType['enable_approaches']>[number]['readiness_activities']>[number], PartialSimplifiedEapType>['fields']>;

type CoverImageFileFormFields = ReturnType<ObjectSchema<PartialSimplifiedEapType['cover_image_file'], PartialSimplifiedEapType>['fields']>;

type RiskProtocolsFileFields = ReturnType<ObjectSchema<NonNullable<PartialSimplifiedEapType['risk_selected_protocols_images']>[number], PartialSimplifiedEapType>['fields']>;
type HazardImpactFileFields = ReturnType<ObjectSchema<NonNullable<PartialSimplifiedEapType['hazard_impact_images']>[number], PartialSimplifiedEapType>['fields']>;
type EarlyActionFileFields = ReturnType<ObjectSchema<NonNullable<PartialSimplifiedEapType['selected_early_actions_images']>[number], PartialSimplifiedEapType>['fields']>;

type FormSchema = ObjectSchema<PartialSimplifiedEapType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

export const formSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        admin2: { },
        budget_file: { required: true },
        cover_image_file: {
            fields: (): CoverImageFileFormFields => ({
                client_id: {},
                caption: {},
                id: { defaultValue: undefinedValue },
            }),
        },
        hazard_impact_images: {
            keySelector: (item) => item.client_id,
            member: () => ({
                fields: (): HazardImpactFileFields => ({
                    client_id: {},
                    caption: {},
                    id: { defaultValue: undefinedValue },
                }),
            }),
            validation: lessThanEqualToFiveImagesCondition,
        },
        risk_selected_protocols_images: {
            keySelector: (item) => item.client_id,
            member: () => ({
                fields: (): RiskProtocolsFileFields => ({
                    client_id: {},
                    caption: {},
                    id: { defaultValue: undefinedValue },
                }),
            }),
            validation: lessThanEqualToFiveImagesCondition,
        },
        selected_early_actions_images: {
            keySelector: (item) => item.client_id,
            member: () => ({
                fields: (): EarlyActionFileFields => ({
                    client_id: {},
                    caption: {},
                    id: { defaultValue: undefinedValue },
                }),
            }),
            validation: lessThanEqualToFiveImagesCondition,
        },
        seap_timeframe: { required: true },
        assisted_through_operation: {},
        dref_focal_point_name: {},
        dref_focal_point_title: {},
        dref_focal_point_email: { validations: [emailCondition] },
        dref_focal_point_phone_number: {},
        eap_registration: {},
        early_action_budget: { required: true },
        early_action_capability: {},
        ifrc_delegation_focal_point_name: {},
        ifrc_delegation_focal_point_title: {},
        ifrc_delegation_focal_point_email: { validations: [emailCondition] },
        ifrc_delegation_focal_point_phone_number: {},
        ifrc_global_ops_coordinator_name: {},
        ifrc_global_ops_coordinator_title: {},
        ifrc_global_ops_coordinator_phone_number: {},
        ifrc_global_ops_coordinator_email: { validations: [emailCondition] },
        ifrc_head_of_delegation_name: {},
        ifrc_head_of_delegation_title: {},
        ifrc_head_of_delegation_email: { validations: [emailCondition] },
        ifrc_head_of_delegation_phone_number: {},
        ifrc_regional_focal_point_name: {},
        ifrc_regional_focal_point_title: {},
        ifrc_regional_focal_point_email: { validations: [emailCondition] },
        ifrc_regional_focal_point_phone_number: {},
        ifrc_regional_head_dcc_name: {},
        ifrc_regional_head_dcc_title: {},
        ifrc_regional_head_dcc_email: { validations: [emailCondition] },
        ifrc_regional_head_dcc_phone_number: {},
        ifrc_regional_ops_manager_name: {},
        ifrc_regional_ops_manager_title: {},
        ifrc_regional_ops_manager_phone_number: {},
        ifrc_regional_ops_manager_email: { validations: [emailCondition] },
        national_society_contact_name: {},
        national_society_contact_title: {},
        national_society_contact_email: { validations: [emailCondition] },
        national_society_contact_phone_number: {},
        operational_timeframe: {
            required: true,
            validations: [maxOperationalTimeframeCondition],
        },
        partner_ns_name: {},
        partner_ns_title: {},
        partner_ns_email: { validations: [emailCondition] },
        partner_ns_phone_number: {},
        people_targeted: { required: true },
        pre_positioning_budget: { required: true },
        readiness_budget: { required: true },
        seap_lead_time: { required: true },
        selected_early_actions: {},
        selection_criteria: {},
        trigger_threshold_justification: {},
        trigger_statement: {},
        total_budget: { required: true },
        prioritized_hazard_and_impact: {},
        risks_selected_protocols: {},
        seap_lead_timeframe_unit: { required: true },
        operational_timeframe_unit: {},
        next_step_towards_full_eap: { required: true },
        enable_approaches: {
            keySelector: (item) => item.client_id,
            member: () => ({
                fields: (): EnableApproachesFields => ({
                    client_id: {},
                    id: { defaultValue: undefinedValue },
                    title: {},
                    approach: {},
                    budget_per_approach: {},
                    ap_code: {},
                    indicator_target: {},
                    early_action_activities: {
                        keySelector: (item) => item.client_id,
                        member: () => ({
                            fields: (): EarlyActionApproachesFields => ({
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
                            fields: (): ReadinessApproachesFields => ({
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
                            fields: (): PrepositioningApproachesFields => ({
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
        planned_operations: {
            keySelector: (item) => item.client_id,
            member: () => ({
                fields: (): PlannedOperationalFields => ({
                    client_id: {},
                    id: { defaultValue: undefinedValue },
                    title: {},
                    sector: {},
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
