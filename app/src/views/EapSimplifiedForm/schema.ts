import { type DeepReplace } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    emailCondition,
    type LiteralSchema,
    type ObjectSchema,
    type PartialForm,
    type PurgeNull,
    requiredStringCondition,
    undefinedValue,
} from '@togglecorp/toggle-form';

import indicatorSchema from '#components/domain/EapIndicatorInput/schema';
import operationActivitySchema from '#components/domain/EapOperationActivityInput/schema';
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

type EapSimplifiedFormContext = {
    isRevision: boolean;
} | undefined;

type EapSimplifiedRequestBody = PurgeNull<
    GoApiBody<'/api/v2/simplified-eap/', 'POST'>
>;

type EnableApproachesResponse = NonNullable<
    EapSimplifiedRequestBody['enabling_approaches']
>[number];
type ApproachEarlyActionResponse = NonNullable<
    EnableApproachesResponse['early_action_activities']
>[number];
type ApproachPrepositioningResponse = NonNullable<
    EnableApproachesResponse['prepositioning_activities']
>[number];
type ApproachReadinessResponse = NonNullable<
    EnableApproachesResponse['readiness_activities']
>[number];
type ApproachIndicatorResponse = NonNullable<
    EnableApproachesResponse['indicators']
>[number];

type PlannedOperationsResponse = NonNullable<
    EapSimplifiedRequestBody['planned_operations']
>[number];
type EarlyActionResponse = NonNullable<
    PlannedOperationsResponse['early_action_activities']
>[number];
type PrepositioningResponse = NonNullable<
    PlannedOperationsResponse['prepositioning_activities']
>[number];
type ReadinessResponse = NonNullable<
    PlannedOperationsResponse['readiness_activities']
>[number];
type IndicatorResponse = NonNullable<
    PlannedOperationsResponse['indicators']
>[number];

type CoverImageFileResponse = NonNullable<
    EapSimplifiedRequestBody['cover_image_file']
>;

type HazardImagesResponse = NonNullable<
    EapSimplifiedRequestBody['hazard_impact_images']
>[number];
type RiskImagesResponse = NonNullable<
    EapSimplifiedRequestBody['risk_selected_protocols_images']
>[number];
type EarlyActionImagesResponse = NonNullable<
    EapSimplifiedRequestBody['selected_early_actions_images']
>[number];

type PartnerContactsResponse = NonNullable<
    EapSimplifiedRequestBody['partner_contacts']
>[number];

type ApproachEarlyActionFormFields = ApproachEarlyActionResponse & {
    client_id: string;
};
type ApproachPrepositioningFormFields = ApproachPrepositioningResponse & {
    client_id: string;
};
type ApproachReadinessFormFields = ApproachReadinessResponse & {
    client_id: string;
};
type ApproachIndicatorFormFields = ApproachIndicatorResponse & {
    client_id: string;
};

type CoverImageFileFields = CoverImageFileResponse & { client_id: string };

type EarlyActionFormFields = EarlyActionResponse & { client_id: string };
type PrepositioningFormFields = PrepositioningResponse & { client_id: string };
type ReadinessFormFields = ReadinessResponse & { client_id: string };
type IndicatorFormFields = IndicatorResponse & { client_id: string };

type HazardImagesFormFields = HazardImagesResponse & { client_id: string };
type RiskImagesFormFields = RiskImagesResponse & { client_id: string };
type EarlyActionImagesFormFields = EarlyActionImagesResponse & {
    client_id: string;
};

type PartnerContactsFormFields = PartnerContactsResponse & {
    client_id: string;
};

type EnableApproachesResponseFormFields = DeepReplace<
    DeepReplace<
        DeepReplace<
            DeepReplace<
                EnableApproachesResponse,
                ApproachEarlyActionResponse,
                ApproachEarlyActionFormFields
            >,
            ApproachPrepositioningResponse,
            ApproachPrepositioningFormFields
        >,
        ApproachReadinessResponse,
        ApproachReadinessFormFields
    >,
    ApproachIndicatorResponse,
    ApproachIndicatorFormFields
>;

type OperationsResponseFormFields = DeepReplace<
    DeepReplace<
        DeepReplace<
            DeepReplace<
                PlannedOperationsResponse,
                EarlyActionResponse,
                EarlyActionFormFields
            >,
            PrepositioningResponse,
            PrepositioningFormFields
        >,
        ReadinessResponse,
        ReadinessFormFields
    >,
    IndicatorResponse,
    IndicatorFormFields
>;

type FormFields = DeepReplace<
    DeepReplace<
        DeepReplace<
            DeepReplace<
                DeepReplace<
                    DeepReplace<
                        DeepReplace<
                            EapSimplifiedRequestBody,
                            PlannedOperationsResponse,
                            OperationsResponseFormFields
                        >,
                        PartnerContactsResponse,
                        PartnerContactsFormFields
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
>;

export type PartialSimplifiedEapType = PartialForm<
    FormFields,
    'client_id' | 'sector' | 'approach'
>;

type PlannedOperationalFields = ReturnType<
    ObjectSchema<
        NonNullable<PartialSimplifiedEapType['planned_operations']>[number],
        PartialSimplifiedEapType,
        EapSimplifiedFormContext
    >['fields']
>;
type EnableApproachesFields = ReturnType<
    ObjectSchema<
        NonNullable<PartialSimplifiedEapType['enabling_approaches']>[number],
        PartialSimplifiedEapType,
        EapSimplifiedFormContext
    >['fields']
>;
type CoverImageFileFormFields = ReturnType<
    ObjectSchema<
        PartialSimplifiedEapType['cover_image_file'],
        PartialSimplifiedEapType,
        EapSimplifiedFormContext
    >['fields']
>;

type RiskProtocolsFileFields = ReturnType<
    ObjectSchema<
        NonNullable<
            PartialSimplifiedEapType['risk_selected_protocols_images']
        >[number],
        PartialSimplifiedEapType,
        EapSimplifiedFormContext
    >['fields']
>;
type HazardImpactFileFields = ReturnType<
    ObjectSchema<
        NonNullable<PartialSimplifiedEapType['hazard_impact_images']>[number],
        PartialSimplifiedEapType,
        EapSimplifiedFormContext
    >['fields']
>;
type EarlyActionFileFields = ReturnType<
    ObjectSchema<
        NonNullable<
            PartialSimplifiedEapType['selected_early_actions_images']
        >[number],
        PartialSimplifiedEapType,
        EapSimplifiedFormContext
    >['fields']
>;

type PartnerContactFields = ReturnType<
    ObjectSchema<
        NonNullable<PartialSimplifiedEapType['partner_contacts']>[number],
        PartialSimplifiedEapType,
        EapSimplifiedFormContext
    >['fields']
>;

type FormSchema = ObjectSchema<
    PartialSimplifiedEapType,
    PartialSimplifiedEapType,
    EapSimplifiedFormContext
>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type FieldKeys = keyof EapSimplifiedRequestBody;

type ContactFieldSuffix = 'name' | 'title' | 'email' | 'phone_number';
type ExtractContactPrefix<KEY extends FieldKeys> =
    KEY extends `${infer PREFIX}_name`
        ? `${PREFIX}_title` extends FieldKeys
            ? `${PREFIX}_email` extends FieldKeys
                ? `${PREFIX}_phone_number` extends FieldKeys
                    ? PREFIX
                    : never
                : never
            : never
        : never;

type ValidContactFieldPrefixes = ExtractContactPrefix<FieldKeys>;

function getContactSchema<KEY extends ValidContactFieldPrefixes>(key: KEY, required = false) {
    type ContactSchema = {
        [K in `${KEY}_${ContactFieldSuffix}`]: LiteralSchema<
            string | undefined,
            PartialSimplifiedEapType,
            EapSimplifiedFormContext
        >;
    };

    return {
        [`${key}_name`]: {
            required,
            requiredValidation: requiredStringCondition,
        },
        [`${key}_title`]: {},
        [`${key}_email`]: {
            required,
            requiredValidation: requiredStringCondition,
            validations: [emailCondition],
        },
        [`${key}_phone_number`]: {},
    } as ContactSchema;
}

export const formSchema: FormSchema = {
    fields: (_, __, context): FormSchemaFields => {
        const defaultSchema: FormSchemaFields = {
            // Overview

            // national_society: {},
            // country: {},
            // disaster_type: {},

            cover_image_file: {
                fields: (): CoverImageFileFormFields => ({
                    client_id: {},
                    caption: {},
                    id: {
                        defaultValue: undefinedValue,
                        required: true,
                    },
                }),
            },
            seap_timeframe: {
                required: true,
            },
            partner_contacts: {
                keySelector: (item) => item.client_id,
                member: () => ({
                    fields: (): PartnerContactFields => ({
                        client_id: {},
                        id: { defaultValue: undefinedValue },
                        name: {},
                        email: { validations: [emailCondition] },
                        phone_number: {},
                        title: {},
                    }),
                }),
            },
            ...getContactSchema('national_society_contact', true),
            ...getContactSchema('ifrc_delegation_focal_point', true),
            ...getContactSchema('ifrc_head_of_delegation', true),
            ...getContactSchema('dref_focal_point'),
            ...getContactSchema('ifrc_regional_focal_point'),
            ...getContactSchema('ifrc_regional_ops_manager'),
            ...getContactSchema('ifrc_regional_head_dcc'),
            ...getContactSchema('ifrc_global_ops_coordinator'),

            // Risk Analysis

            prioritized_hazard_and_impact: {
                required: true,
                requiredValidation: requiredStringCondition,
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
            risks_selected_protocols: {
                required: true,
                requiredValidation: requiredStringCondition,
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
            selected_early_actions: {
                required: true,
                requiredValidation: requiredStringCondition,
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

            // Early Action Interventions

            overall_objective_intervention: {
                required: true,
                requiredValidation: requiredStringCondition,
            },
            // FIXME: add required condition
            admin2: {
                defaultValue: [],
            },
            potential_geographical_high_risk_areas: {
                required: true,
                requiredValidation: requiredStringCondition,
            },
            people_targeted: { required: true },
            assisted_through_operation: {
                required: true,
                requiredValidation: requiredStringCondition,
            },
            selection_criteria: {
                required: true,
                requiredValidation: requiredStringCondition,
            },
            trigger_statement: {
                required: true,
                requiredValidation: requiredStringCondition,
            },
            seap_lead_time: { required: true },
            seap_lead_timeframe_unit: { required: true },
            operational_timeframe: {
                required: true,
                validations: [maxOperationalTimeframeCondition],
            },
            operational_timeframe_unit: {},
            trigger_threshold_justification: {
                required: true,
                requiredValidation: requiredStringCondition,
            },
            next_step_towards_full_eap: {},

            // Planned Operations

            planned_operations: {
                keySelector: (item) => item.sector,
                member: () => ({
                    fields: (): PlannedOperationalFields => ({
                        id: { defaultValue: undefinedValue },
                        sector: {},
                        people_targeted: { required: true },
                        budget_per_sector: { required: true },
                        ap_code: { required: true },
                        indicators: {
                            keySelector: (indicator) => indicator.client_id,
                            member: () => indicatorSchema,
                            validation: (indicators) => {
                                if (isNotDefined(indicators) || indicators.length === 0) {
                                    return 'This field is required';
                                }

                                return undefined;
                            },
                        },
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
                validation: (plannedOperations) => {
                    if (isNotDefined(plannedOperations) || plannedOperations.length === 0) {
                        return 'This field is required';
                    }

                    return undefined;
                },
            },

            // Enabling Approaches

            enabling_approaches: {
                keySelector: (item) => item.approach,
                member: () => ({
                    fields: (): EnableApproachesFields => ({
                        id: { defaultValue: undefinedValue },
                        approach: {},
                        budget_per_approach: {},
                        ap_code: {},
                        indicators: {
                            keySelector: (indicator) => indicator.client_id,
                            member: () => indicatorSchema,
                            validation: (indicators) => {
                                if (isNotDefined(indicators) || indicators.length === 0) {
                                    return 'This field is required';
                                }

                                return undefined;
                            },
                        },
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
                validation: (enablingApproaches) => {
                    if (isNotDefined(enablingApproaches) || enablingApproaches.length === 0) {
                        return 'This field is required';
                    }

                    return undefined;
                },
            },

            // Delivery & Budget

            early_action_capability: {
                required: true,
                requiredValidation: requiredStringCondition,
            },
            rcrc_movement_involvement: {
                required: true,
                requiredValidation: requiredStringCondition,
            },
            total_budget: { required: true },
            readiness_budget: { required: true },
            pre_positioning_budget: { required: true },
            early_action_budget: { required: true },
            budget_file: { required: true },
        };

        if (isNotDefined(context) || !context.isRevision) {
            return defaultSchema;
        }

        return {
            ...defaultSchema,

            // Delivery & Budget
            updated_checklist_file: {
                required: true,
            },
        } satisfies FormSchemaFields;
    },
};
