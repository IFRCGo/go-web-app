import { type DeepReplace } from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';
import {
    emailCondition,
    type LiteralSchema,
    type ObjectSchema,
    type PartialForm,
    type PurgeNull,
    undefinedValue,
} from '@togglecorp/toggle-form';

import operationActivitySchema from '#components/domain/OperationActivityInput/schema';
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

type EapSimplifiedRequestBody = PurgeNull<GoApiBody<'/api/v2/simplified-eap/', 'POST'>>;

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
);

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
);

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

export type PartialSimplifiedEapType = PartialForm<FormFields, 'client_id' | 'sector' | 'approach'>;
type PlannedOperationalFields = ReturnType<ObjectSchema<NonNullable<PartialSimplifiedEapType['planned_operations']>[number], PartialSimplifiedEapType>['fields']>;
type EnableApproachesFields = ReturnType<ObjectSchema<NonNullable<PartialSimplifiedEapType['enable_approaches']>[number], PartialSimplifiedEapType>['fields']>;
type CoverImageFileFormFields = ReturnType<ObjectSchema<PartialSimplifiedEapType['cover_image_file'], PartialSimplifiedEapType>['fields']>;

type RiskProtocolsFileFields = ReturnType<ObjectSchema<NonNullable<PartialSimplifiedEapType['risk_selected_protocols_images']>[number], PartialSimplifiedEapType>['fields']>;
type HazardImpactFileFields = ReturnType<ObjectSchema<NonNullable<PartialSimplifiedEapType['hazard_impact_images']>[number], PartialSimplifiedEapType>['fields']>;
type EarlyActionFileFields = ReturnType<ObjectSchema<NonNullable<PartialSimplifiedEapType['selected_early_actions_images']>[number], PartialSimplifiedEapType>['fields']>;

type FormSchema = ObjectSchema<PartialSimplifiedEapType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type FieldKeys = keyof EapSimplifiedRequestBody;

type ContactFieldSuffix = 'name' | 'title' | 'email' | 'phone_number';
type ExtractContactPrefix<KEY extends FieldKeys> = KEY extends `${infer PREFIX}_name`
    ? `${PREFIX}_title` extends FieldKeys
        ? `${PREFIX}_email` extends FieldKeys
            ? `${PREFIX}_phone_number` extends FieldKeys
                ? PREFIX
                : never
            : never
        : never
    : never

export type ValidContactFieldPrefixes = ExtractContactPrefix<FieldKeys>;

function getContactSchema<KEY extends ValidContactFieldPrefixes>(key: KEY) {
    type ContactSchema = {
        [K in `${KEY}_${ContactFieldSuffix}`]: LiteralSchema<string | undefined, PartialSimplifiedEapType>
    }

    return {
        [`${key}_name`]: {},
        [`${key}_title`]: {},
        [`${key}_email`]: { validations: [emailCondition] },
        [`${key}_phone_number`]: {},
    } as ContactSchema;
}

export const formSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        // Overview

        // national_society: {},
        // country: {},
        // disaster_type: {},

        cover_image_file: {
            fields: (): CoverImageFileFormFields => ({
                client_id: {},
                caption: {},
                id: { defaultValue: undefinedValue },
            }),
        },
        seap_timeframe: { required: true },

        ...getContactSchema('national_society_contact'),
        ...getContactSchema('partner_ns'),
        ...getContactSchema('ifrc_delegation_focal_point'),
        ...getContactSchema('ifrc_head_of_delegation'),
        ...getContactSchema('dref_focal_point'),
        ...getContactSchema('ifrc_regional_focal_point'),
        ...getContactSchema('ifrc_regional_ops_manager'),
        ...getContactSchema('ifrc_regional_head_dcc'),
        ...getContactSchema('ifrc_global_ops_coordinator'),

        // Risk Analysis

        prioritized_hazard_and_impact: {},
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
        risks_selected_protocols: {},
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
        selected_early_actions: {},
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

        // Early Action Interventions

        overall_objective_intervention: {},
        potential_geographical_high_risk_areas: {},
        admin2: {},
        people_targeted: { required: true },
        assisted_through_operation: {},
        selection_criteria: {},
        trigger_statement: {},
        seap_lead_time: { required: true },
        seap_lead_timeframe_unit: { required: true },
        operational_timeframe: {
            required: true,
            validations: [maxOperationalTimeframeCondition],
        },
        operational_timeframe_unit: {},
        trigger_threshold_justification: {},
        next_step_towards_full_eap: { required: true },

        // Planned Operations

        planned_operations: {
            keySelector: (item) => item.sector,
            member: () => ({
                fields: (): PlannedOperationalFields => ({
                    id: { defaultValue: undefinedValue },
                    sector: {},
                    budget_per_sector: {},
                    ap_code: {},
                    people_targeted: {},
                    early_action_activities: {
                        keySelector: (item) => item.client_id,
                        member: () => operationActivitySchema,
                    },
                    readiness_activities: {
                        keySelector: (item) => item.client_id,
                        member: () => operationActivitySchema,
                    },
                    prepositioning_activities: {
                        keySelector: (item) => item.client_id,
                        member: () => operationActivitySchema,
                    },
                }),
            }),
        },

        // Enabling Approaches

        enable_approaches: {
            keySelector: (item) => item.approach,
            member: () => ({
                fields: (): EnableApproachesFields => ({
                    id: { defaultValue: undefinedValue },
                    approach: {},
                    budget_per_approach: {},
                    ap_code: {},
                    indicator_target: {},
                    early_action_activities: {
                        keySelector: (item) => item.client_id,
                        member: () => operationActivitySchema,
                    },
                    readiness_activities: {
                        keySelector: (item) => item.client_id,
                        member: () => operationActivitySchema,
                    },
                    prepositioning_activities: {
                        keySelector: (item) => item.client_id,
                        member: () => operationActivitySchema,
                    },
                }),
            }),
        },

        // Delivery & Budget

        early_action_capability: {},
        rcrc_movement_involvement: {},
        total_budget: { required: true },
        readiness_budget: { required: true },
        pre_positioning_budget: { required: true },
        early_action_budget: { required: true },
        budget_file: { required: true },
    }),
};
