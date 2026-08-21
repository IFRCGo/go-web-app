import {
    type DeepReplace,
    formatNumber,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    addCondition,
    emailCondition,
    greaterThanOrEqualToCondition,
    lessThanOrEqualToCondition,
    type LiteralSchema,
    nullValue,
    type ObjectSchema,
    type PartialForm,
    type PurgeNull,
    requiredListCondition,
    requiredStringCondition,
    undefinedValue,
    urlCondition,
} from '@togglecorp/toggle-form';

import indicatorSchema from '#components/domain/EapIndicatorInput/schema';
import operationActivitySchema from '#components/domain/EapOperationActivityInput/schema';
import { lengthSmallerOrEqualToCondition } from '#utils/common';
import { positiveIntegerCondition } from '#utils/form';
import { type GoApiBody } from '#utils/restRequest';

import { wordLimits } from './common';

const MAX_BUDGET_LIMIT = 2147483647;

// FIXME: use translations
function maxBudgetCondition(label: string) {
    return (value: number | undefined) => (
        isDefined(value) && value > MAX_BUDGET_LIMIT
            ? `${label} cannot exceed ${formatNumber(MAX_BUDGET_LIMIT)} CHF`
            : undefined
    );
}

function lessThanEqualToFiveFilesCondition<T>(value: T[] | undefined) {
    return isDefined(value) && Array.isArray(value) && value.length > 5
        ? 'Maximum five files are allowed'
        : undefined;
}

type EapFullFormContext =
    | {
        isRevision: boolean;
        getIsSubmission: () => boolean;
    }
    | undefined;

type EapFullRequestBody = PurgeNull<GoApiBody<'/api/v2/full-eap/', 'POST'>>;

type PartnerContactsResponse = NonNullable<EapFullRequestBody['partner_contacts']>[number];

type PartnerContactsFormFields = PartnerContactsResponse & {
    client_id: string;
};

type KeyActorsResponse = NonNullable<EapFullRequestBody['key_actors']>[number];

type KeyActorsFields = KeyActorsResponse & { client_id: string };

type CoverImageFileResponse = NonNullable<
    EapFullRequestBody['cover_image_file']
>;
type CoverImageFileFields = CoverImageFileResponse & { client_id: string };

type HazardSelectionFilesResponse = NonNullable<
    EapFullRequestBody['hazard_selection_files']
>[number];
type HazardSelectionFilesFields = HazardSelectionFilesResponse & {
    client_id: string;
};

type ExposedElementAndVulnerabilityFilesResponse = NonNullable<
    EapFullRequestBody['exposed_element_and_vulnerability_factor_files']
>[number];
type ExposedElementAndVulnerabilityFields =
    ExposedElementAndVulnerabilityFilesResponse & { client_id: string };

type PrioritizedImpactFilesResponse = NonNullable<
    EapFullRequestBody['prioritized_impact_files']
>[number];
type PrioritizedImpactFilesFields = PrioritizedImpactFilesResponse & {
    client_id: string;
};

type RiskAnalysisSourceOfInformationResponse = NonNullable<
    EapFullRequestBody['risk_analysis_source_of_information']
>[number];

type RiskAnalysisSourceOfInformationFields =
    RiskAnalysisSourceOfInformationResponse & { client_id: string };

type TriggerStatementSourceOfInformationResponse = NonNullable<
    EapFullRequestBody['trigger_statement_source_of_information']
>[number];
type TriggerStatementSourceOfInformationFields =
    TriggerStatementSourceOfInformationResponse & { client_id: string };

type ForecastSelectionFilesResponse = NonNullable<
    EapFullRequestBody['forecast_selection_files']
>[number];
type ForecastSelectionFilesResponseFields = ForecastSelectionFilesResponse & {
    client_id: string;
};

type DefinitionAndJustificationFilesResponse = NonNullable<
    EapFullRequestBody['definition_and_justification_impact_level_files']
>[number];
type DefinitionAndJustificationFilesResponseFields =
    DefinitionAndJustificationFilesResponse & { client_id: string };

type IdentificationInterventionFilesResponse = NonNullable<
    EapFullRequestBody['identification_of_the_intervention_area_files']
>[number];
type IdentificationInterventionFilesResponseFields =
    IdentificationInterventionFilesResponse & { client_id: string };

type TriggerModelSourceOfInformationResponse = NonNullable<
    EapFullRequestBody['trigger_model_source_of_information']
>[number];
type TriggerModelSourceOfInformationResponseFields =
    TriggerModelSourceOfInformationResponse & { client_id: string };

type MealSourceOfInformationResponse = NonNullable<
    EapFullRequestBody['meal_source_of_information']
>[number];
type MealSourceOfInformationResponseFields = MealSourceOfInformationResponse & {
    client_id: string;
};

type NSCapacitySourceOfInformationResponse = NonNullable<
    EapFullRequestBody['ns_capacity_source_of_information']
>[number];
type NSCapacitySourceOfInformationResponseFields =
    NSCapacitySourceOfInformationResponse & { client_id: string };

type EarlyActionImplementationFilesResponse = NonNullable<
    EapFullRequestBody['early_action_implementation_files']
>[number];
type EarlyActionImplementationFilesResponseFields =
    EarlyActionImplementationFilesResponse & { client_id: string };

type TriggerActivationSystemFilesResponse = NonNullable<
    EapFullRequestBody['trigger_activation_system_files']
>[number];
type TriggerActivationSystemFilesResponseFields =
    TriggerActivationSystemFilesResponse & { client_id: string };

type ActivationProcessSourceInformationResponse = NonNullable<
    EapFullRequestBody['activation_process_source_of_information']
>[number];
type ActivationProcessSourceInformationResponseFields =
    ActivationProcessSourceInformationResponse & { client_id: string };

type EarlyActionsSelectionFilesResponse = NonNullable<
    EapFullRequestBody['early_action_selection_process_files']
>[number];
type EarlyActionsSelectionFilesResponseFields =
    EarlyActionsSelectionFilesResponse & { client_id: string };

type EvidenceBaseSourceInformationResponse = NonNullable<
    EapFullRequestBody['evidence_base_source_of_information']
>[number];
type EvidenceBaseSourceInformationResponseFields =
    EvidenceBaseSourceInformationResponse & { client_id: string };

type PlannedOperationsResponse = NonNullable<EapFullRequestBody['planned_operations']>[number];

type EarlyActionResponse = NonNullable<PlannedOperationsResponse['early_action_activities']>[number];
type EarlyActionFormFields = EarlyActionResponse & { client_id: string };

type PrepositioningResponse = NonNullable<PlannedOperationsResponse['prepositioning_activities']>[number];
type PrepositioningFormFields = PrepositioningResponse & { client_id: string };

type ReadinessResponse = NonNullable<PlannedOperationsResponse['readiness_activities']>[number];
type ReadinessFormFields = ReadinessResponse & { client_id: string };

type IndicatorResponse = NonNullable<PlannedOperationsResponse['indicators']>[number];
type IndicatorFormFields = IndicatorResponse & { client_id: string };

type EarlyActionSelectionResponse = NonNullable<
    EapFullRequestBody['early_actions']
>[number];
type EarlyActionSelectionFormFields = EarlyActionSelectionResponse & {
    client_id: string;
};

type PrioritizedImpactResponse = NonNullable<
    EapFullRequestBody['prioritized_impacts']
>[number];
type PrioritizedImpactFormFields = PrioritizedImpactResponse & {
    client_id: string;
};

type PlannedOperationsResponseFields = DeepReplace<
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

type EnableApproachesResponse = NonNullable<
    EapFullRequestBody['enabling_approaches']
>[number];

type EarlyActionApproachesResponse = NonNullable<EnableApproachesResponse['early_action_activities']>[number];
type EarlyActionApproachesFormFields = EarlyActionApproachesResponse & {
    client_id: string;
};

type PrepositioningApproachesResponse = NonNullable<EnableApproachesResponse['prepositioning_activities']>[number];
type PrepositioningApproachesFormFields = PrepositioningApproachesResponse & {
    client_id: string;
};

type ReadinessApproachesResponse = NonNullable<EnableApproachesResponse['readiness_activities']>[number];
type ReadinessApproachesFormFields = ReadinessApproachesResponse & {
    client_id: string;
};

type IndicatorApproachesResponse = NonNullable<EnableApproachesResponse['indicators']>[number];
type IndicatorApproachesFormFields = IndicatorApproachesResponse & {
    client_id: string;
};

type EnableApproachesResponseFields = DeepReplace<
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
    >,
    IndicatorApproachesResponse,
    IndicatorApproachesFormFields
>;

type FormFields = DeepReplace<
    DeepReplace<
        DeepReplace<
            DeepReplace<
                DeepReplace<
                    DeepReplace<
                        DeepReplace<
                            DeepReplace<
                                DeepReplace<
                                    DeepReplace<
                                        DeepReplace<
                                            DeepReplace<
                                                DeepReplace<
                                                    DeepReplace<
                                                        DeepReplace<
                                                            DeepReplace<
                                                                DeepReplace<
                                                                    DeepReplace<
                                                                        DeepReplace<
                                                                            DeepReplace<
                                                                                DeepReplace<
                                                                                    DeepReplace<
                                                                                        DeepReplace<
                                                                // eslint-disable-next-line max-len
                                                                                            EapFullRequestBody,
                                                                // eslint-disable-next-line max-len
                                                                                            KeyActorsResponse,
                                                                // eslint-disable-next-line max-len
                                                                                            KeyActorsFields
                                                                                        >,
                                                                // eslint-disable-next-line max-len
                                                                                        CoverImageFileResponse,
                                                                // eslint-disable-next-line max-len
                                                                                        CoverImageFileFields
                                                                                    >,
                                                                // eslint-disable-next-line max-len
                                                                                    HazardSelectionFilesResponse,
                                                                // eslint-disable-next-line max-len
                                                                                    HazardSelectionFilesFields
                                                                                >,
                                                                // eslint-disable-next-line max-len
                                                                                ExposedElementAndVulnerabilityFilesResponse,
                                                                // eslint-disable-next-line max-len
                                                                                ExposedElementAndVulnerabilityFields
                                                                            >,
                                                                            PartnerContactsResponse,
                                                                // eslint-disable-next-line max-len
                                                                            PartnerContactsFormFields
                                                                        >,
                                                                // eslint-disable-next-line max-len
                                                                        PrioritizedImpactFilesResponse,
                                                                        PrioritizedImpactFilesFields
                                                                    >,
                                                                // eslint-disable-next-line max-len
                                                                    RiskAnalysisSourceOfInformationResponse,
                                                                // eslint-disable-next-line max-len
                                                                    RiskAnalysisSourceOfInformationFields
                                                                >,
                                                                // eslint-disable-next-line max-len
                                                                TriggerStatementSourceOfInformationResponse,
                                                                // eslint-disable-next-line max-len
                                                                TriggerStatementSourceOfInformationFields
                                                            >,
                                                            ForecastSelectionFilesResponse,
                                                            ForecastSelectionFilesResponseFields
                                                        >,
                                                        DefinitionAndJustificationFilesResponse,
                                                        // eslint-disable-next-line max-len
                                                        DefinitionAndJustificationFilesResponseFields
                                                    >,
                                                    IdentificationInterventionFilesResponse,
                                                    IdentificationInterventionFilesResponseFields
                                                >,
                                                TriggerModelSourceOfInformationResponse,
                                                TriggerModelSourceOfInformationResponseFields
                                            >,
                                            MealSourceOfInformationResponse,
                                            MealSourceOfInformationResponseFields
                                        >,
                                        NSCapacitySourceOfInformationResponse,
                                        NSCapacitySourceOfInformationResponseFields
                                    >,
                                    EarlyActionImplementationFilesResponse,
                                    EarlyActionImplementationFilesResponseFields
                                >,
                                TriggerActivationSystemFilesResponse,
                                TriggerActivationSystemFilesResponseFields
                            >,
                            ActivationProcessSourceInformationResponse,
                            ActivationProcessSourceInformationResponseFields
                        >,
                        EarlyActionsSelectionFilesResponse,
                        EarlyActionsSelectionFilesResponseFields
                    >,
                    EvidenceBaseSourceInformationResponse,
                    EvidenceBaseSourceInformationResponseFields
                >,
                PlannedOperationsResponse,
                PlannedOperationsResponseFields
            >,
            EnableApproachesResponse,
            EnableApproachesResponseFields
        >,
        EarlyActionSelectionResponse,
        EarlyActionSelectionFormFields
    >,
    PrioritizedImpactResponse,
    PrioritizedImpactFormFields
>;

export type PartialEapFullFormType = PartialForm<
    FormFields,
    'client_id' | 'sector' | 'approach'
>;

type CoverImageFileFormFields = ReturnType<
    ObjectSchema<
        PartialEapFullFormType['cover_image_file'],
        PartialEapFullFormType,
        EapFullFormContext
    >['fields']
>;
type KeyActorsFormFields = ReturnType<
    ObjectSchema<
        NonNullable<PartialEapFullFormType['key_actors']>[number],
        PartialEapFullFormType,
        EapFullFormContext
    >['fields']
>;
type PartnerContactFormFields = ReturnType<
    ObjectSchema<
        NonNullable<PartialEapFullFormType['partner_contacts']>[number],
        PartialEapFullFormType,
        EapFullFormContext
    >['fields']
>;
type HazardSelectionFilesFormFields = ReturnType<
    ObjectSchema<
        NonNullable<PartialEapFullFormType['hazard_selection_files']>[number],
        PartialEapFullFormType,
        EapFullFormContext
    >['fields']
>;
type ExposedElementAndVulnerabilityFilesFormFields = ReturnType<
    ObjectSchema<
        NonNullable<
            PartialEapFullFormType['exposed_element_and_vulnerability_factor_files']
        >[number],
        PartialEapFullFormType,
        EapFullFormContext
    >['fields']
>;
type PrioritizedImpactFilesFormFields = ReturnType<
    ObjectSchema<
        NonNullable<PartialEapFullFormType['prioritized_impact_files']>[number],
        PartialEapFullFormType,
        EapFullFormContext
    >['fields']
>;
type RiskAnalysisSourceOfInformationFormFields = ReturnType<
    ObjectSchema<
        NonNullable<
            PartialEapFullFormType['risk_analysis_source_of_information']
        >[number],
        PartialEapFullFormType,
        EapFullFormContext
    >['fields']
>;
type TriggerStatementSourceOfInformationFormFields = ReturnType<
    ObjectSchema<
        NonNullable<
            PartialEapFullFormType['trigger_statement_source_of_information']
        >[number],
        PartialEapFullFormType,
        EapFullFormContext
    >['fields']
>;
type ForecastSelectionFilesResponseFormFields = ReturnType<
    ObjectSchema<
        NonNullable<PartialEapFullFormType['forecast_selection_files']>[number],
        PartialEapFullFormType,
        EapFullFormContext
    >['fields']
>;
type DefinitionAndJustificationFilesResponseFormFields = ReturnType<
    ObjectSchema<
        NonNullable<
            PartialEapFullFormType['definition_and_justification_impact_level_files']
        >[number],
        PartialEapFullFormType,
        EapFullFormContext
    >['fields']
>;
type IdentificationInterventionFilesResponseFormFields = ReturnType<
    ObjectSchema<
        NonNullable<
            PartialEapFullFormType['identification_of_the_intervention_area_files']
        >[number],
        PartialEapFullFormType,
        EapFullFormContext
    >['fields']
>;
type TriggerModelSourceOfInformationResponseFormFields = ReturnType<
    ObjectSchema<
        NonNullable<
            PartialEapFullFormType['trigger_model_source_of_information']
        >[number],
        PartialEapFullFormType,
        EapFullFormContext
    >['fields']
>;
type MealSourceOfInformationResponseFormFields = ReturnType<
    ObjectSchema<
        NonNullable<PartialEapFullFormType['meal_source_of_information']>[number],
        PartialEapFullFormType,
        EapFullFormContext
    >['fields']
>;
type NSCapacitySourceOfInformationResponseFormFields = ReturnType<
    ObjectSchema<
        NonNullable<
            PartialEapFullFormType['ns_capacity_source_of_information']
        >[number],
        PartialEapFullFormType,
        EapFullFormContext
    >['fields']
>;
type EarlyActionFilesResponseFormFields = ReturnType<
    ObjectSchema<
        NonNullable<
            PartialEapFullFormType['early_action_implementation_files']
        >[number],
        PartialEapFullFormType,
        EapFullFormContext
    >['fields']
>;
type EarlyActionsSelectionResponseFormFields = ReturnType<
    ObjectSchema<
        NonNullable<PartialEapFullFormType['early_actions']>[number],
        PartialEapFullFormType,
        EapFullFormContext
    >['fields']
>;
type TriggerActivationFilesResponseFormFields = ReturnType<
    ObjectSchema<
        NonNullable<
            PartialEapFullFormType['early_action_implementation_files']
        >[number],
        PartialEapFullFormType,
        EapFullFormContext
    >['fields']
>;
type ActivationProcessSourceOfInformationResponseFormFields = ReturnType<
    ObjectSchema<
        NonNullable<
            PartialEapFullFormType['activation_process_source_of_information']
        >[number],
        PartialEapFullFormType,
        EapFullFormContext
    >['fields']
>;
type PlannedOperationalFields = ReturnType<
    ObjectSchema<
        NonNullable<PartialEapFullFormType['planned_operations']>[number],
        PartialEapFullFormType,
        EapFullFormContext
    >['fields']
>;
type EnableApproachesFields = ReturnType<
    ObjectSchema<
        NonNullable<PartialEapFullFormType['enabling_approaches']>[number],
        PartialEapFullFormType,
        EapFullFormContext
    >['fields']
>;
type EvidenceBaseSourceOfInformationResponseFormFields = ReturnType<
    ObjectSchema<
        NonNullable<
            PartialEapFullFormType['evidence_base_source_of_information']
        >[number],
        PartialEapFullFormType,
        EapFullFormContext
    >['fields']
>;

type PrioritizedImpactsFields = ReturnType<
    ObjectSchema<
        NonNullable<PartialEapFullFormType['prioritized_impacts']>[number],
        PartialEapFullFormType,
        EapFullFormContext
    >['fields']
>;

type EapFullFormSchema = ObjectSchema<
    PartialEapFullFormType,
    PartialEapFullFormType,
    EapFullFormContext
>;
type EapFullFormSchemaFields = ReturnType<EapFullFormSchema['fields']>;

type FieldKeys = keyof EapFullRequestBody;

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

function getContactSchema<KEY extends ValidContactFieldPrefixes>(
    key: KEY,
    required?: boolean,
    requiredTitle?: boolean,
) {
    type ContactSchema = {
        [K in `${KEY}_${ContactFieldSuffix}`]: LiteralSchema<
            string | undefined,
            PartialEapFullFormType,
            EapFullFormContext
        >;
    };

    return {
        [`${key}_name`]: {
            required,
            requiredValidation: requiredStringCondition,
        },
        [`${key}_title`]: {
            required: requiredTitle,
            requiredValidation: requiredStringCondition,
        },
        [`${key}_email`]: {
            required,
            requiredValidation: requiredStringCondition,
            validations: [emailCondition],
        },
        [`${key}_phone_number`]: {},
    } as ContactSchema;
}

export const formSchema: EapFullFormSchema = {
    fields: (formValue, __, context): EapFullFormSchemaFields => {
        const isSubmit = context?.getIsSubmission() ?? false;
        let formFields: EapFullFormSchemaFields = {
            // ------------Overview-----------------
            expected_submission_time: { required: isSubmit },
            objective: { required: isSubmit },
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
            partners: {
                required: isSubmit,
            },
            include_rcrc_climate_center: { defaultValue: false },
            partner_contacts: {
                keySelector: (item) => item.client_id,
                member: () => ({
                    fields: (): PartnerContactFormFields => ({
                        client_id: {},
                        id: { defaultValue: undefinedValue },
                        name: {},
                        email: { validations: [emailCondition] },
                        phone_number: {},
                        title: {},
                    }),
                }),
            },
            ...getContactSchema('national_society_contact', isSubmit, isSubmit),
            ...getContactSchema('dref_focal_point'),
            ...getContactSchema('ifrc_regional_focal_point'),
            ...getContactSchema('ifrc_regional_ops_manager'),
            ...getContactSchema('ifrc_regional_head_dcc'),

            // Stakeholders
            is_worked_with_government: { required: isSubmit },
            worked_with_government_description: {
                required: isSubmit,
                requiredValidation: requiredStringCondition,
            },

            key_actors: {
                validation: isSubmit ? requiredListCondition : undefined,
                keySelector: (item) => item.client_id,
                member: () => ({
                    fields: (): KeyActorsFormFields => ({
                        client_id: {},
                        id: { defaultValue: undefinedValue },
                        description: {
                            required: isSubmit,
                            requiredValidation: requiredStringCondition,
                            validations: [lengthSmallerOrEqualToCondition(wordLimits.key_actors)],
                        },
                        partner: { required: isSubmit },
                    }),
                }),
            },

            is_technical_working_groups: { required: isSubmit },
            technical_working_groups_in_place_description: {
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(
                    wordLimits.technical_working_groups_in_place_description,
                )],
            },

            // ------------Risk Analysis-----------------
            hazard_selection: {
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(wordLimits.hazard_selection)],
            },

            hazard_selection_files: {
                keySelector: (item) => item.client_id,
                member: () => ({
                    fields: (): HazardSelectionFilesFormFields => ({
                        client_id: {},
                        caption: {},
                        id: {},
                    }),
                }),
                validation: lessThanEqualToFiveFilesCondition,
            },

            exposed_element_and_vulnerability_factor: {
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(
                    wordLimits.exposed_element_and_vulnerability_factor,
                )],
            },
            exposed_element_and_vulnerability_factor_files: {
                keySelector: (item) => item.client_id,
                member: () => ({
                    fields: (): ExposedElementAndVulnerabilityFilesFormFields => ({
                        client_id: {},
                        caption: {},
                        id: { defaultValue: undefinedValue },
                    }),
                }),
                validation: lessThanEqualToFiveFilesCondition,
            },

            prioritized_impact: {
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(
                    wordLimits.prioritized_impact,
                )],
            },
            prioritized_impact_files: {
                keySelector: (item) => item.client_id,
                member: () => ({
                    fields: (): PrioritizedImpactFilesFormFields => ({
                        client_id: {},
                        caption: {},
                        id: { defaultValue: undefinedValue },
                    }),
                }),
                validation: lessThanEqualToFiveFilesCondition,
            },
            prioritized_impacts: {
                keySelector: (item) => item.client_id,
                validation: isSubmit ? requiredListCondition : undefined,
                member: () => ({
                    fields: (): PrioritizedImpactsFields => ({
                        client_id: {},
                        id: { defaultValue: undefinedValue },
                        impact: {
                            required: isSubmit,
                            requiredValidation: requiredStringCondition,
                        },
                    }),
                }),
            },

            risk_analysis_relevant_files: { defaultValue: [] },
            risk_analysis_source_of_information: {
                keySelector: (item) => item.client_id,
                member: () => ({
                    fields: (): RiskAnalysisSourceOfInformationFormFields => ({
                        client_id: {},
                        id: { defaultValue: undefinedValue },
                        source_name: {
                            required: isSubmit,
                            requiredValidation: requiredStringCondition,
                        },
                        source_link: {
                            validations: [urlCondition],
                        },
                    }),
                }),
            },

            // -------------Trigger Model--------------------
            trigger_statement: {
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(wordLimits.trigger_statement)],
            },
            trigger_statement_source_of_information: {
                keySelector: (item) => item.client_id,
                member: () => ({
                    fields: (): TriggerStatementSourceOfInformationFormFields => ({
                        client_id: {},
                        id: { defaultValue: undefinedValue },
                        source_name: {
                            required: isSubmit,
                            requiredValidation: requiredStringCondition,
                        },
                        source_link: {
                            validations: [urlCondition],
                        },
                    }),
                }),
            },
            lead_time: { required: isSubmit },
            lead_timeframe_unit: { required: isSubmit },

            forecast_selection: {
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(wordLimits.forecast_selection)],
            },
            forecast_selection_files: {
                keySelector: (item) => item.client_id,
                member: () => ({
                    fields: (): ForecastSelectionFilesResponseFormFields => ({
                        client_id: {},
                        caption: {},
                        id: { defaultValue: undefinedValue },
                    }),
                }),
                validation: lessThanEqualToFiveFilesCondition,
            },
            forecast_table_file: { required: isSubmit },

            definition_and_justification_impact_level: {
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(
                    wordLimits.definition_and_justification_impact_level,
                )],
            },
            definition_and_justification_impact_level_files: {
                keySelector: (item) => item.client_id,
                member: () => ({
                    fields: (): DefinitionAndJustificationFilesResponseFormFields => ({
                        client_id: {},
                        caption: {},
                        id: { defaultValue: undefinedValue },
                    }),
                }),
                validation: lessThanEqualToFiveFilesCondition,
            },

            identification_of_the_intervention_area: {
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(
                    wordLimits.identification_of_the_intervention_area,
                )],
            },
            identification_of_the_intervention_area_files: {
                keySelector: (item) => item.client_id,
                member: () => ({
                    fields: (): IdentificationInterventionFilesResponseFormFields => ({
                        client_id: {},
                        caption: {},
                        id: { defaultValue: undefinedValue },
                    }),
                }),
                validation: lessThanEqualToFiveFilesCondition,
            },
            admin2: {
                defaultValue: [],
            },

            trigger_model_relevant_files: { defaultValue: [] },
            trigger_model_source_of_information: {
                keySelector: (item) => item.client_id,
                member: () => ({
                    fields: (): TriggerModelSourceOfInformationResponseFormFields => ({
                        client_id: {},
                        id: { defaultValue: undefinedValue },
                        source_name: {
                            required: isSubmit,
                            requiredValidation: requiredStringCondition,
                        },
                        source_link: {
                            validations: [urlCondition],
                        },
                    }),
                }),
            },

            // ---------Selection Of Actions
            early_actions: {
                keySelector: (item) => item.client_id,
                member: () => ({
                    fields: (): EarlyActionsSelectionResponseFormFields => ({
                        client_id: {},
                        id: { defaultValue: undefinedValue },
                        action: { required: isSubmit },
                    }),
                }),
            },
            early_action_selection_process: {
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(
                    wordLimits.early_action_selection_process,
                )],
            },
            early_action_selection_process_files: {
                keySelector: (item) => item.client_id,
                member: () => ({
                    fields: (): IdentificationInterventionFilesResponseFormFields => ({
                        client_id: {},
                        caption: {},
                        id: { defaultValue: undefinedValue },
                    }),
                }),
                validation: lessThanEqualToFiveFilesCondition,
            },
            theory_of_change_table_file: { required: isSubmit },

            evidence_base: {
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(
                    wordLimits.evidence_base,
                )],
            },
            evidence_base_relevant_files: { defaultValue: [] },
            evidence_base_source_of_information: {
                keySelector: (item) => item.client_id,
                member: () => ({
                    fields: (): EvidenceBaseSourceOfInformationResponseFormFields => ({
                        client_id: {},
                        id: { defaultValue: undefinedValue },
                        source_name: {
                            required: isSubmit,
                            requiredValidation: requiredStringCondition,
                        },
                        source_link: {
                            validations: [urlCondition],
                        },
                    }),
                }),
            },

            // Planned Operations
            planned_operations: {
                keySelector: (item) => item.sector,
                member: () => ({
                    fields: (): PlannedOperationalFields => ({
                        id: { defaultValue: undefinedValue },
                        sector: {},
                        budget_per_sector: {
                            required: isSubmit,
                        },
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
                        people_targeted: {
                            required: isSubmit,
                            validations: [
                                positiveIntegerCondition,
                            ],
                        },
                        early_action_activities: {
                            keySelector: (item) => item.client_id,
                            member: () => operationActivitySchema(isSubmit, 'early_action_activities'),
                        },
                        readiness_activities: {
                            keySelector: (item) => item.client_id,
                            member: () => operationActivitySchema(isSubmit, 'readiness_activities'),
                        },
                        prepositioning_activities: {
                            keySelector: (item) => item.client_id,
                            member: () => operationActivitySchema(isSubmit, 'prepositioning_activities'),
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
                        budget_per_approach: {
                            required: isSubmit,
                        },
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
                            member: () => operationActivitySchema(isSubmit, 'early_action_activities'),
                        },
                        readiness_activities: {
                            keySelector: (item) => item.client_id,
                            member: () => operationActivitySchema(isSubmit, 'readiness_activities'),
                        },
                        prepositioning_activities: {
                            keySelector: (item) => item.client_id,
                            member: () => operationActivitySchema(isSubmit, 'prepositioning_activities'),
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

            usefulness_of_actions: {
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(
                    wordLimits.usefulness_of_actions,
                )],
            },
            feasibility: {
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(
                    wordLimits.feasibility,
                )],
            },

            // ----------EAP Activation Process---------
            early_action_implementation_process: {
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(
                    wordLimits.early_action_implementation_process,
                )],
            },
            early_action_implementation_files: {
                keySelector: (item) => item.client_id,
                member: () => ({
                    fields: (): EarlyActionFilesResponseFormFields => ({
                        client_id: {},
                        caption: {},
                        id: { defaultValue: undefinedValue },
                    }),
                }),
                validation: lessThanEqualToFiveFilesCondition,
            },

            trigger_activation_system: {
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(
                    wordLimits.trigger_activation_system,
                )],
            },
            trigger_activation_system_files: {
                keySelector: (item) => item.client_id,
                member: () => ({
                    fields: (): TriggerActivationFilesResponseFormFields => ({
                        client_id: {},
                        caption: {},
                        id: { defaultValue: undefinedValue },
                    }),
                }),
                validation: lessThanEqualToFiveFilesCondition,
            },

            total_people_targeted: {
                required: isSubmit,
                validations: [
                    greaterThanOrEqualToCondition(wordLimits.total_people_targeted),
                    lessThanOrEqualToCondition(wordLimits.max_total_people_targeted),
                    positiveIntegerCondition,
                ],
            },
            selection_of_target_population: {
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(
                    wordLimits.selection_of_target_population,
                )],
            },
            stop_mechanism: {
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(
                    wordLimits.stop_mechanism,
                )],
            },

            activation_process_relevant_files: { defaultValue: [] },
            activation_process_source_of_information: {
                keySelector: (item) => item.client_id,
                member: () => ({
                    fields:
                        (): ActivationProcessSourceOfInformationResponseFormFields => ({
                            client_id: {},
                            id: { defaultValue: undefinedValue },
                            source_name: {
                                required: isSubmit,
                                requiredValidation: requiredStringCondition,
                            },
                            source_link: {
                                validations: [urlCondition],
                            },
                        }),
                }),
            },

            // --------------Meal-------------
            meal: {
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(
                    wordLimits.meal,
                )],
            },
            meal_relevant_files: { defaultValue: [] },
            meal_source_of_information: {
                keySelector: (item) => item.client_id,
                member: () => ({
                    fields: (): MealSourceOfInformationResponseFormFields => ({
                        client_id: {},
                        id: { defaultValue: undefinedValue },
                        source_name: {
                            required: isSubmit,
                            requiredValidation: requiredStringCondition,
                        },
                        source_link: {
                            validations: [urlCondition],
                        },
                    }),
                }),
            },

            // -----------National Society Capacity-----------
            operational_administrative_capacity: {
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(
                    wordLimits.operational_administrative_capacity,
                )],
            },
            strategies_and_plans: {
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(
                    wordLimits.strategies_and_plans,
                )],
            },
            advance_financial_capacity: {
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(
                    wordLimits.advance_financial_capacity,
                )],
            },
            capacity_relevant_files: { defaultValue: [] },
            ns_capacity_source_of_information: {
                keySelector: (item) => item.client_id,
                member: () => ({
                    fields: (): NSCapacitySourceOfInformationResponseFormFields => ({
                        client_id: {},
                        id: { defaultValue: undefinedValue },
                        source_name: {
                            required: isSubmit,
                            requiredValidation: requiredStringCondition,
                        },
                        source_link: {
                            validations: [urlCondition],
                        },
                    }),
                }),
            },

            // ------------Finance and Logistics----------------
            total_budget: {
                required: isSubmit,
                validations: [
                    positiveIntegerCondition,
                    maxBudgetCondition('Total budget'),
                ],
            },
            budget_description: {
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(
                    wordLimits.budget_description,
                )],
            },
            budget_file: { required: isSubmit },
            readiness_budget: {
                required: isSubmit,
                validations: [
                    positiveIntegerCondition,
                    maxBudgetCondition('Readiness budget'),
                ],
            },
            readiness_cost_description: {
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(
                    wordLimits.readiness_cost_description,
                )],
            },
            pre_positioning_budget: {
                required: isSubmit,
                validations: [
                    positiveIntegerCondition,
                    maxBudgetCondition('Prepositioning budget'),
                ],
            },
            prepositioning_cost_description: {
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(
                    wordLimits.prepositioning_cost_description,
                )],
            },
            early_action_budget: {
                required: isSubmit,
                validations: [
                    positiveIntegerCondition,
                    maxBudgetCondition('Early action budget'),
                ],
            },
            early_action_cost_description: {
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(
                    wordLimits.early_action_cost_description,
                )],
            },
            eap_endorsement: {
                required: isSubmit,
                requiredValidation: requiredStringCondition,
                validations: [lengthSmallerOrEqualToCondition(
                    wordLimits.eap_endorsement,
                )],
            },
        };

        formFields = addCondition(
            formFields,
            formValue,
            ['is_technical_working_groups'],
            ['technically_working_group_title', 'technical_working_groups_in_place_description'],
            (val) => {
                if (val?.is_technical_working_groups) {
                    return {
                        technically_working_group_title: { required: isSubmit },
                        technical_working_groups_in_place_description: {
                            required: isSubmit,
                            requiredValidation: requiredStringCondition,
                        },
                    };
                }

                return {
                    technically_working_group_title: { forceValue: nullValue },
                    technical_working_groups_in_place_description: { forceValue: nullValue },
                };
            },
        );

        formFields = addCondition(
            formFields,
            formValue,
            ['is_worked_with_government'],
            ['worked_with_government_description'],
            (val) => {
                if (val?.is_worked_with_government) {
                    return {
                        worked_with_government_description: {
                            required: isSubmit,
                            requiredValidation: requiredStringCondition,
                        },
                    };
                }
                return {
                    worked_with_government_description: { forceValue: nullValue },
                };
            },
        );

        if (isNotDefined(context) || !context.isRevision) {
            return formFields;
        }

        return {
            ...formFields,

            // ------------Finance and Logistics----------------
            updated_checklist_file: {
                required: isSubmit,
            },
        } satisfies EapFullFormSchemaFields;
    },
};
