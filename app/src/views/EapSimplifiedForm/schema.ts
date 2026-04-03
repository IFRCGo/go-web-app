import { type DeepReplace } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    emailCondition,
    greaterThanOrEqualToCondition,
    type LiteralSchema,
    type ObjectSchema,
    type PartialForm,
    type PurgeNull,
    requiredStringCondition,
    undefinedValue,
} from '@togglecorp/toggle-form';

import indicatorSchema from '#components/domain/EapIndicatorInput/schema';
import operationActivitySchema from '#components/domain/EapOperationActivityInput/schema';
import { lengthSmallerOrEqualToCondition } from '#utils/common';
import { positiveIntegerCondition } from '#utils/form';
import { type GoApiBody } from '#utils/restRequest';

import { charLimits } from './common';

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
    getIsSubmission: () => boolean;
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
        const isSubmit = context?.getIsSubmission() ?? false;
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
                        required: isSubmit,
                    },
                }),
            },
            seap_timeframe: {
                required: isSubmit,
            },
            partners: {
                required: isSubmit,
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
            ...getContactSchema('national_society_contact', isSubmit),
            ...getContactSchema('ifrc_delegation_focal_point', isSubmit),
            ...getContactSchema('ifrc_head_of_delegation', isSubmit),
            ...getContactSchema('dref_focal_point'),
            ...getContactSchema('ifrc_regional_focal_point'),
            ...getContactSchema('ifrc_regional_ops_manager'),
            ...getContactSchema('ifrc_regional_head_dcc'),
            ...getContactSchema('ifrc_global_ops_coordinator'),

            // Risk Analysis

            prioritized_hazard_and_impact: {
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(
                    charLimits.prioritized_hazard_and_impact,
                )],
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
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(
                    charLimits.risks_selected_protocols,
                )],
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
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(
                    charLimits.selected_early_actions,
                )],
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
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(
                    charLimits.overall_objective_intervention,
                )],
            },
            // FIXME: add required condition
            admin2: {
                defaultValue: [],
            },
            potential_geographical_high_risk_areas: {
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(
                    charLimits.potential_geographical_high_risk_areas,
                )],
            },
            people_targeted: {
                required: isSubmit,
                validations: [
                    positiveIntegerCondition,
                    greaterThanOrEqualToCondition(charLimits.people_targeted),
                ],
            },
            assisted_through_operation: {
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(
                    charLimits.assisted_through_operation,
                )],
            },
            selection_criteria: {
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(
                    charLimits.selection_criteria,
                )],
            },
            trigger_statement: {
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(
                    charLimits.trigger_statement,
                )],
            },
            seap_lead_time: { required: isSubmit },
            seap_lead_timeframe_unit: { required: isSubmit },
            operational_timeframe: {
                required: isSubmit,
                validations: [maxOperationalTimeframeCondition],
            },
            operational_timeframe_unit: {},
            trigger_threshold_justification: {
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(
                    charLimits.trigger_threshold_justification,
                )],
            },
            next_step_towards_full_eap: {
                required: isSubmit,
                validations: [lengthSmallerOrEqualToCondition(
                    charLimits.next_step_towards_full_eap,
                )],
            },

            // Planned Operations

            planned_operations: {
                keySelector: (item) => item.sector,
                member: () => ({
                    fields: (): PlannedOperationalFields => ({
                        id: { defaultValue: undefinedValue },
                        sector: {},
                        people_targeted: { required: isSubmit },
                        budget_per_sector: { required: isSubmit },
                        indicators: {
                            keySelector: (indicator) => indicator.client_id,
                            member: () => indicatorSchema(isSubmit),
                            validation: (indicators) => {
                                if (isSubmit && (isNotDefined(indicators)
                                    || indicators.length === 0)) {
                                    return 'This field is required';
                                }

                                return undefined;
                            },
                        },
                        early_action_activities: {
                            keySelector: (item) => item.client_id,
                            member: () => operationActivitySchema(isSubmit),
                        },
                        readiness_activities: {
                            keySelector: (item) => item.client_id,
                            member: () => operationActivitySchema(isSubmit),
                        },
                        prepositioning_activities: {
                            keySelector: (item) => item.client_id,
                            member: () => operationActivitySchema(isSubmit),
                        },
                    }),
                }),
                validation: (plannedOperations) => {
                    if (isSubmit
                        && (isNotDefined(plannedOperations)
                        || plannedOperations.length === 0)) {
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
                        budget_per_approach: { required: isSubmit },
                        indicators: {
                            keySelector: (indicator) => indicator.client_id,
                            member: () => indicatorSchema(isSubmit),
                            validation: (indicators) => {
                                if (isSubmit
                                    && (isNotDefined(indicators)
                                        || indicators.length === 0)) {
                                    return 'This field is required';
                                }

                                return undefined;
                            },
                        },
                        early_action_activities: {
                            keySelector: (item) => item.client_id,
                            member: () => operationActivitySchema(isSubmit),
                        },
                        readiness_activities: {
                            keySelector: (item) => item.client_id,
                            member: () => operationActivitySchema(isSubmit),
                        },
                        prepositioning_activities: {
                            keySelector: (item) => item.client_id,
                            member: () => operationActivitySchema(isSubmit),
                        },
                    }),
                }),
                validation: (enablingApproaches) => {
                    if (isSubmit
                        && (isNotDefined(enablingApproaches)
                        || enablingApproaches.length === 0)) {
                        return 'This field is required';
                    }

                    return undefined;
                },
            },

            // Delivery & Budget

            early_action_capability: {
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(
                    charLimits.early_action_capability,
                )],
            },
            rcrc_movement_involvement: {
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(
                    charLimits.rcrc_movement_involvement,
                )],
            },
            total_budget: { required: isSubmit },
            readiness_budget: { required: isSubmit },
            pre_positioning_budget: { required: isSubmit },
            early_action_budget: { required: isSubmit },
            budget_file: { required: isSubmit },
        };

        if (isNotDefined(context) || !context.isRevision) {
            return defaultSchema;
        }

        return {
            ...defaultSchema,

            // Delivery & Budget
            updated_checklist_file: {
                required: isSubmit,
            },
        } satisfies FormSchemaFields;
    },
};
