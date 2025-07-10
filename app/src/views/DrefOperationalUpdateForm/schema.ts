import { type DeepReplace } from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';
import {
    addCondition,
    emailCondition,
    greaterThanOrEqualToCondition,
    lengthSmallerThanCondition,
    lessThanOrEqualToCondition,
    nullValue,
    type ObjectSchema,
    type PartialForm,
    type PurgeNull,
    requiredStringCondition,
    undefinedValue,
    urlCondition,
} from '@togglecorp/toggle-form';

import {
    positiveIntegerCondition,
    positiveNumberCondition,
} from '#utils/form';
import { type GoApiBody } from '#utils/restRequest';

import {
    DISASTER_FIRE,
    DISASTER_FLASH_FLOOD,
    DISASTER_FLOOD,
    TYPE_ASSESSMENT,
    TYPE_IMMINENT,
    TYPE_LOAN,
} from './common';

// FIXME: Do we need this limit?
// Is this a server side limit or client side limit?
// Shouldn't this be set for all integer types?
const MAX_INT_LIMIT = 2147483647;

// Why not use lengthLessThanCondition?
function max500CharCondition(value: string | undefined) {
    return isDefined(value) && value.length > 500
        ? 'Maximum 500 characters are allowed'
        : undefined;
}

function lessThanEqualToFourImagesCondition<T>(value: T[] | undefined) {
    return isDefined(value) && Array.isArray(value) && value.length > 4
        ? 'Maximum four images are allowed'
        : undefined;
}

export type OpsUpdateRequestBody = GoApiBody<'/api/v2/dref-op-update/{id}/', 'PATCH'> & {
    operational_update_number: number | undefined;
};

type NeedIdentifiedResponse = NonNullable<OpsUpdateRequestBody['needs_identified']>[number];
type NsActionResponse = NonNullable<OpsUpdateRequestBody['national_society_actions']>[number];
type InterventionResponse = NonNullable<OpsUpdateRequestBody['planned_interventions']>[number];
type IndicatorResponse = NonNullable<InterventionResponse['indicators']>[number];
type RiskSecurityResponse = NonNullable<OpsUpdateRequestBody['risk_security']>[number];
type ImagesFileResponse = NonNullable<OpsUpdateRequestBody['images_file']>[number];
type SourceInformationResponse = NonNullable<OpsUpdateRequestBody['source_information']>[number];

type NeedIdentifiedFormFields = NeedIdentifiedResponse & { client_id: string };
type NsActionFormFields = NsActionResponse & { client_id: string; }
type InterventionFormFields = InterventionResponse & { client_id: string };
type IndicatorFormFields = IndicatorResponse & { client_id: string };
type SourceInformationFormFields = SourceInformationResponse & { client_id: string };

type RiskSecurityFormFields = RiskSecurityResponse & { client_id: string; };
type ImagesFileFormFields = ImagesFileResponse & { client_id: string };

type EventMapFileResponse = NonNullable<OpsUpdateRequestBody['event_map_file']>;
type EventMapFileFormField = Omit<EventMapFileResponse, 'client_id'> & {
    client_id: string;
    id: number;
};

type OpsUpdateFormFields = (
    DeepReplace<
        DeepReplace<
            DeepReplace<
                DeepReplace<
                    DeepReplace<
                        DeepReplace<
                            DeepReplace<
                                DeepReplace<
                                    DeepReplace<
                                        OpsUpdateRequestBody,
                                        NeedIdentifiedResponse,
                                        NeedIdentifiedFormFields
                                    >,
                                    NsActionResponse,
                                    NsActionFormFields
                                >,
                                InterventionResponse,
                                InterventionFormFields
                            >,
                            IndicatorResponse,
                            IndicatorFormFields
                        >,
                        IndicatorResponse,
                        IndicatorFormFields
                    >,
                    RiskSecurityResponse,
                    RiskSecurityFormFields
                >,
                ImagesFileResponse,
                ImagesFileFormFields
            >,
            EventMapFileResponse,
            EventMapFileFormField
        >,
        SourceInformationResponse,
        SourceInformationFormFields
    >
);

export type PartialOpsUpdate = PartialForm<
    PurgeNull<OpsUpdateFormFields>,
    'client_id'
>;

type OpsUpdateFormSchema = ObjectSchema<PartialOpsUpdate>;
type OpsUpdateFormSchemaFields = ReturnType<OpsUpdateFormSchema['fields']>;

type EventMapFileFields = ReturnType<ObjectSchema<PartialOpsUpdate['event_map_file'], PartialOpsUpdate>['fields']>;
type CoverImageFileFields = ReturnType<ObjectSchema<PartialOpsUpdate['cover_image_file'], PartialOpsUpdate>['fields']>;
type ImageFileFields = ReturnType<ObjectSchema<NonNullable<PartialOpsUpdate['images_file']>[number], PartialOpsUpdate>['fields']>;
type NeedsIdentifiedFields = ReturnType<ObjectSchema<NonNullable<PartialOpsUpdate['needs_identified']>[number], PartialOpsUpdate>['fields']>;
type RiskSecurityFields = ReturnType<ObjectSchema<NonNullable<PartialOpsUpdate['risk_security']>[number], PartialOpsUpdate>['fields']>;
type SourceInformationFields = ReturnType<ObjectSchema<NonNullable<PartialOpsUpdate['source_information']>[number], PartialOpsUpdate>['fields']>;
type PlannedInterventionFields = ReturnType<ObjectSchema<NonNullable<PartialOpsUpdate['planned_interventions']>[number], PartialOpsUpdate>['fields']>;
type IndicatorFields = ReturnType<ObjectSchema<NonNullable<NonNullable<PartialOpsUpdate['planned_interventions']>[number]['indicators']>[number], PartialOpsUpdate>['fields']>;

const schema: OpsUpdateFormSchema = {
    fields: (formValue): OpsUpdateFormSchemaFields => {
        let formFields: OpsUpdateFormSchemaFields = {
            operational_update_number: { forceValue: undefinedValue },

            // OVERVIEW
            national_society: { required: true },
            type_of_dref: { required: true },
            type_of_onset: { required: true },
            disaster_category: {},
            country: {},
            district: { defaultValue: [] },
            disaster_type: {},
            title: {
                required: true,
                requiredValidation: requiredStringCondition,
            },
            // EVENT DETAILS
            number_of_people_affected: { validations: [positiveIntegerCondition] },
            estimated_number_of_affected_male: { validations: [positiveIntegerCondition] },
            estimated_number_of_affected_female: { validations: [positiveIntegerCondition] },
            estimated_number_of_affected_girls_under_18: {
                validations: [positiveIntegerCondition],
            },
            estimated_number_of_affected_boys_under_18: {
                validations: [positiveIntegerCondition],
            },

            // none

            // ACTIONS

            // none

            // OPERATION
            dref_allocated_so_far: {},
            additional_allocation: { validations: [positiveIntegerCondition] },
            total_dref_allocation: {},

            // none

            // SUBMISSION
            appeal_code: {},
            ifrc_appeal_manager_name: {},
            ifrc_appeal_manager_email: { validations: [emailCondition] },
            ifrc_appeal_manager_phone_number: {},
            ifrc_appeal_manager_title: {},
            ifrc_project_manager_name: {},
            ifrc_project_manager_email: { validations: [emailCondition] },
            ifrc_project_manager_title: {},
            ifrc_project_manager_phone_number: {},
            total_operation_timeframe: {},
            regional_focal_point_name: {},
            regional_focal_point_title: {},
            regional_focal_point_email: { validations: [emailCondition] },
            regional_focal_point_phone_number: {},
        };

        // OVERVIEW

        formFields = addCondition(
            formFields,
            formValue,
            ['disaster_type'],
            ['is_man_made_event'],
            (val): Pick<OpsUpdateFormSchemaFields, 'is_man_made_event'> => {
                if (
                    val?.disaster_type === DISASTER_FIRE
                    || val?.disaster_type === DISASTER_FLOOD
                    || val?.disaster_type === DISASTER_FLASH_FLOOD
                ) {
                    return {
                        is_man_made_event: {},
                    };
                }
                return {
                    is_man_made_event: { forceValue: nullValue },
                };
            },
        );

        const overviewDrefTypeRelatedFields = [
            'event_map_file',
            'cover_image_file',
            'ns_request_date',
            'date_of_approval',
        ] as const;
        type OverviewDrefTypeRelatedFields = Pick<
            OpsUpdateFormSchemaFields,
            typeof overviewDrefTypeRelatedFields[number]
        >;
        formFields = addCondition(
            formFields,
            formValue,
            ['type_of_dref'],
            overviewDrefTypeRelatedFields,
            (val): OverviewDrefTypeRelatedFields => {
                const conditionalFields: OverviewDrefTypeRelatedFields = {
                    event_map_file: { forceValue: nullValue },
                    cover_image_file: { forceValue: nullValue },
                    ns_request_date: { forceValue: nullValue },
                    date_of_approval: { forceValue: nullValue },
                };
                if (val?.type_of_dref === TYPE_LOAN) {
                    return {
                        ...conditionalFields,
                        ns_request_date: {},
                        date_of_approval: {},
                    };
                }
                return {
                    ...conditionalFields,
                    event_map_file: {
                        fields: (): EventMapFileFields => ({
                            client_id: {},
                            id: { defaultValue: undefinedValue },
                            caption: {},
                        }),
                    },
                    cover_image_file: {
                        fields: (): CoverImageFileFields => ({
                            client_id: {},
                            id: { defaultValue: undefinedValue },
                            caption: {},
                        }),
                    },
                };
            },
        );

        // EVENT DETAILS

        const eventDetailDrefTypeRelatedFields = [
            'event_scope',
            'event_text',
            'anticipatory_actions',
            'event_date',
            'event_description',
            'images_file',
            'people_in_need',

            'summary_of_change',
            'changing_timeframe_operation',
            'changing_operation_strategy',
            'changing_budget',
            'changing_target_population_of_operation',
            'changing_geographic_location',
            'request_for_second_allocation',
            'source_information',
        ] as const;
        type EventDetailDrefTypeRelatedFields = Pick<
            OpsUpdateFormSchemaFields,
            typeof eventDetailDrefTypeRelatedFields[number]
        >;
        formFields = addCondition(
            formFields,
            formValue,
            ['type_of_dref'],
            eventDetailDrefTypeRelatedFields,
            (val): EventDetailDrefTypeRelatedFields => {
                let conditionalFields: EventDetailDrefTypeRelatedFields = {
                    event_scope: { forceValue: nullValue },
                    source_information: { forceValue: [] },
                    event_text: { forceValue: nullValue },
                    anticipatory_actions: { forceValue: nullValue },
                    event_date: { forceValue: nullValue },
                    event_description: { forceValue: nullValue },
                    images_file: { forceValue: [] },
                    people_in_need: { forceValue: nullValue },

                    summary_of_change: { forceValue: nullValue },
                    changing_timeframe_operation: { forceValue: nullValue },
                    changing_operation_strategy: { forceValue: nullValue },
                    changing_budget: { forceValue: nullValue },
                    changing_target_population_of_operation: { forceValue: nullValue },
                    changing_geographic_location: { forceValue: nullValue },
                    request_for_second_allocation: { forceValue: nullValue },
                };

                if (
                    val?.type_of_dref !== TYPE_ASSESSMENT
                    && val?.type_of_dref !== TYPE_LOAN
                ) {
                    conditionalFields = {
                        ...conditionalFields,
                        event_scope: {},
                        people_in_need: { validations: [positiveIntegerCondition] },
                    };
                }

                if (val?.type_of_dref === TYPE_IMMINENT) {
                    conditionalFields = {
                        ...conditionalFields,
                        event_text: { validations: [max500CharCondition] },
                        anticipatory_actions: {},
                    };
                } else {
                    conditionalFields = {
                        ...conditionalFields,
                        event_date: {},
                    };
                }

                if (val?.type_of_dref !== TYPE_LOAN) {
                    conditionalFields = {
                        ...conditionalFields,
                        event_description: {},
                        source_information: {
                            keySelector: (source) => source.client_id,
                            member: () => ({
                                fields: (): SourceInformationFields => ({
                                    client_id: {},
                                    source_name: {
                                        required: true,
                                        requiredValidation: requiredStringCondition,
                                    },
                                    source_link: {
                                        required: true,
                                        validations: [urlCondition],
                                    },
                                }),
                            }),
                        },
                        images_file: {
                            keySelector: (image_file) => image_file.client_id,
                            member: () => ({
                                fields: (): ImageFileFields => ({
                                    client_id: {},
                                    id: { defaultValue: undefinedValue },
                                    caption: {
                                        validations: [lengthSmallerThanCondition(80)],
                                    },
                                }),
                            }),
                            validation: lessThanEqualToFourImagesCondition,
                        },
                        summary_of_change: {},
                        changing_timeframe_operation: {},
                        changing_operation_strategy: {},
                        changing_budget: {},
                        changing_target_population_of_operation: {},
                        changing_geographic_location: {},
                        request_for_second_allocation: {},
                    };
                }

                return conditionalFields;
            },
        );

        // NOTE: @samshara can you confirm this logic?
        formFields = addCondition(
            formFields,
            formValue,
            ['type_of_dref'],
            ['specified_trigger_met'],
            (val): Pick<OpsUpdateFormSchemaFields, 'specified_trigger_met'> => {
                if (val?.type_of_dref === TYPE_IMMINENT) {
                    return {
                        specified_trigger_met: {},
                    };
                }
                return {
                    specified_trigger_met: { forceValue: nullValue },
                };
            },
        );

        // ACTIONS

        formFields = addCondition(
            formFields,
            formValue,
            ['is_there_major_coordination_mechanism', 'type_of_dref'],
            ['major_coordination_mechanism'],
            (val): Pick<OpsUpdateFormSchemaFields, 'major_coordination_mechanism'> => {
                if (val?.type_of_dref !== TYPE_LOAN && val?.is_there_major_coordination_mechanism) {
                    return {
                        major_coordination_mechanism: {},
                    };
                }
                return {
                    major_coordination_mechanism: { forceValue: nullValue },
                };
            },
        );

        const actionsDrefTypeRelatedFields = [
            'assessment_report',
            'needs_identified',
            'identified_gaps',
            'ifrc',
            'icrc',
            'partner_national_society',
            'government_requested_assistance',
            'national_authorities',
            'un_or_other_actor',
            'is_there_major_coordination_mechanism',
            'major_coordination_mechanism',
        ] as const;
        type ActionsDrefTypeRelatedFields = Pick<
            OpsUpdateFormSchemaFields,
            typeof actionsDrefTypeRelatedFields[number]
        >;
        formFields = addCondition(
            formFields,
            formValue,
            ['type_of_dref'],
            actionsDrefTypeRelatedFields,
            (val): ActionsDrefTypeRelatedFields => {
                let conditionalFields: ActionsDrefTypeRelatedFields = {
                    assessment_report: { forceValue: nullValue },
                    needs_identified: { forceValue: [] },
                    identified_gaps: { forceValue: nullValue },
                    ifrc: { forceValue: nullValue },
                    icrc: { forceValue: nullValue },
                    partner_national_society: { forceValue: nullValue },
                    government_requested_assistance: { forceValue: nullValue },
                    national_authorities: { forceValue: nullValue },
                    un_or_other_actor: { forceValue: nullValue },
                    is_there_major_coordination_mechanism: { forceValue: nullValue },
                };
                if (val?.type_of_dref === TYPE_LOAN) {
                    return conditionalFields;
                }
                conditionalFields = {
                    ...conditionalFields,
                    ifrc: {},
                    icrc: {},
                    partner_national_society: {},
                    government_requested_assistance: {},
                    national_authorities: {},
                    is_there_major_coordination_mechanism: {},
                    major_coordination_mechanism: {},
                    un_or_other_actor: {},
                };
                if (val?.type_of_dref !== TYPE_ASSESSMENT) {
                    conditionalFields = {
                        ...conditionalFields,
                        needs_identified: {
                            keySelector: (need) => need.client_id,
                            member: () => ({
                                fields: (): NeedsIdentifiedFields => ({
                                    client_id: {},
                                    title: {
                                        required: true,
                                        requiredValidation: requiredStringCondition,
                                    },
                                    description: {
                                        required: true,
                                        requiredValidation: requiredStringCondition,
                                    },
                                }),
                            }),
                        },
                    };
                }
                if (
                    val?.type_of_dref !== TYPE_ASSESSMENT
                    && val?.type_of_dref !== TYPE_IMMINENT
                ) {
                    conditionalFields = {
                        ...conditionalFields,
                        assessment_report: {},
                        identified_gaps: {},
                    };
                }
                return conditionalFields;
            },
        );

        // OPERATION

        const operationDrefTypeRelatedFields = [
            'women',
            'men',
            'girls',
            'boys',
            'people_targeted_with_early_actions',
            'logistic_capacity_of_ns',
            'pmer',
            'communication',
            'operation_objective',
            'response_strategy',
            'people_assisted',
            'selection_criteria',
            'total_targeted_population',
            'disability_people_per',
            'people_per_urban',
            'people_per_local',
            'displaced_people',
            'risk_security',
            'risk_security_concern',
            'has_anti_fraud_corruption_policy',
            'has_sexual_abuse_policy',
            'has_child_protection_policy',
            'has_whistleblower_protection_policy',
            'has_anti_sexual_harassment_policy',
            'budget_file',
            'planned_interventions',
            'human_resource',
            'is_volunteer_team_diverse',
            'is_surge_personnel_deployed',
            'has_child_safeguarding_risk_analysis_assessment',
        ] as const;
        type OperationDrefTypeRelatedFields = Pick<
            OpsUpdateFormSchemaFields,
            typeof operationDrefTypeRelatedFields[number]
        >;
        formFields = addCondition(
            formFields,
            formValue,
            ['type_of_dref'],
            operationDrefTypeRelatedFields,
            (val): OperationDrefTypeRelatedFields => {
                let conditionalFields: OperationDrefTypeRelatedFields = {
                    women: { forceValue: nullValue },
                    men: { forceValue: nullValue },
                    girls: { forceValue: nullValue },
                    boys: { forceValue: nullValue },
                    people_targeted_with_early_actions: { forceValue: nullValue },
                    logistic_capacity_of_ns: { forceValue: nullValue },
                    pmer: { forceValue: nullValue },
                    communication: { forceValue: nullValue },
                    operation_objective: { forceValue: nullValue },
                    response_strategy: { forceValue: nullValue },
                    people_assisted: { forceValue: nullValue },
                    selection_criteria: { forceValue: nullValue },
                    total_targeted_population: { forceValue: nullValue },
                    disability_people_per: { forceValue: nullValue },
                    people_per_urban: { forceValue: nullValue },
                    people_per_local: { forceValue: nullValue },
                    displaced_people: { forceValue: nullValue },
                    risk_security: { forceValue: [] },
                    risk_security_concern: { forceValue: nullValue },
                    has_anti_fraud_corruption_policy: {},
                    has_anti_sexual_harassment_policy: {},
                    has_sexual_abuse_policy: {},
                    has_whistleblower_protection_policy: {},
                    has_child_protection_policy: {},
                    budget_file: { forceValue: nullValue },
                    planned_interventions: { forceValue: [] },
                    human_resource: { forceValue: nullValue },
                    is_volunteer_team_diverse: { forceValue: nullValue },
                    is_surge_personnel_deployed: { forceValue: nullValue },
                    has_child_safeguarding_risk_analysis_assessment: { forceValue: nullValue },
                };
                if (val?.type_of_dref === TYPE_LOAN) {
                    return conditionalFields;
                }
                conditionalFields = {
                    ...conditionalFields,

                    operation_objective: {},
                    response_strategy: {},
                    people_assisted: {},
                    selection_criteria: {},
                    total_targeted_population: { validations: [positiveIntegerCondition] },
                    disability_people_per: {
                        validations: [
                            greaterThanOrEqualToCondition(0),
                            lessThanOrEqualToCondition(100),
                        ],
                    },
                    people_per_urban: {
                        validations: [
                            greaterThanOrEqualToCondition(0),
                            lessThanOrEqualToCondition(100),
                        ],
                    },
                    people_per_local: {
                        validations: [
                            greaterThanOrEqualToCondition(0),
                            lessThanOrEqualToCondition(100),
                        ],
                    },
                    displaced_people: { validations: [positiveIntegerCondition] },
                    risk_security: {
                        keySelector: (riskSecurity) => riskSecurity.client_id,
                        member: () => ({
                            fields: (): RiskSecurityFields => ({
                                client_id: {},
                                risk: {
                                    required: true,
                                    requiredValidation: requiredStringCondition,
                                },
                                mitigation: {
                                    required: true,
                                    requiredValidation: requiredStringCondition,
                                },
                            }),
                        }),
                    },
                    risk_security_concern: {},
                    has_child_safeguarding_risk_analysis_assessment: {},
                    budget_file: {},
                    planned_interventions: {
                        keySelector: (n) => n.client_id,
                        member: () => ({
                            fields: (): PlannedInterventionFields => ({
                                client_id: {},
                                title: {
                                    required: true,
                                    requiredValidation: requiredStringCondition,
                                },
                                budget: {
                                    required: true,
                                    validations: [
                                        positiveIntegerCondition,
                                        lessThanOrEqualToCondition(MAX_INT_LIMIT),
                                    ],
                                },
                                person_targeted: {
                                    required: true,
                                    validations: [
                                        positiveIntegerCondition,
                                        lessThanOrEqualToCondition(MAX_INT_LIMIT),
                                    ],
                                },
                                male: {
                                    validations: [
                                        positiveIntegerCondition,
                                        lessThanOrEqualToCondition(MAX_INT_LIMIT),
                                    ],
                                },
                                female: {
                                    validations: [
                                        positiveIntegerCondition,
                                        lessThanOrEqualToCondition(MAX_INT_LIMIT),
                                    ],
                                },
                                description: {},
                                progress_towards_outcome: {},
                                indicators: {
                                    keySelector: (indicator) => indicator.client_id,
                                    member: () => ({
                                        fields: (): IndicatorFields => ({
                                            client_id: {},
                                            title: {},
                                            target: { validations: [positiveNumberCondition] },
                                            actual: {
                                                required: true,
                                                validations: [
                                                    positiveNumberCondition,
                                                ],
                                            },
                                        }),
                                    }),
                                },
                            }),
                        }),
                    },
                    human_resource: {},
                    is_volunteer_team_diverse: {},
                    is_surge_personnel_deployed: {},
                };
                if (val?.type_of_dref !== TYPE_ASSESSMENT) {
                    conditionalFields = {
                        ...conditionalFields,
                        women: { validations: [positiveIntegerCondition] },
                        men: { validations: [positiveIntegerCondition] },
                        girls: { validations: [positiveIntegerCondition] },
                        boys: { validations: [positiveIntegerCondition] },
                        logistic_capacity_of_ns: {},
                        pmer: {},
                        communication: {},
                    };
                }
                if (val?.type_of_dref === TYPE_IMMINENT) {
                    conditionalFields = {
                        ...conditionalFields,
                        people_targeted_with_early_actions: {
                            validations: [positiveIntegerCondition],
                        },
                    };
                }
                return conditionalFields;
            },
        );

        formFields = addCondition(
            formFields,
            formValue,
            ['type_of_dref', 'is_surge_personnel_deployed'],
            ['surge_personnel_deployed'],
            (val): Pick<OpsUpdateFormSchemaFields, 'surge_personnel_deployed'> => {
                if (val?.type_of_dref !== TYPE_LOAN && val?.is_surge_personnel_deployed) {
                    return {
                        surge_personnel_deployed: {},
                    };
                }
                return {
                    surge_personnel_deployed: { forceValue: nullValue },
                };
            },
        );

        // SUBMISSION

        const submissionDrefTypeRelatedFields = [
            'new_operational_start_date',
            'new_operational_end_date',
            'reporting_start_date',
            'reporting_end_date',
            'national_society_contact_name',
            'national_society_contact_title',
            'national_society_contact_email',
            'national_society_contact_phone_number',
            'ifrc_emergency_name',
            'ifrc_emergency_title',
            'ifrc_emergency_email',
            'ifrc_emergency_phone_number',
            'media_contact_name',
            'media_contact_title',
            'media_contact_email',
            'media_contact_phone_number',
            'national_society_integrity_contact_name',
            'national_society_integrity_contact_title',
            'national_society_integrity_contact_email',
            'national_society_integrity_contact_phone_number',
            'national_society_hotline_phone_number',
            'glide_code',
        ] as const;
        type SubmissionDrefTypeRelatedFields = Pick<
            OpsUpdateFormSchemaFields,
            typeof submissionDrefTypeRelatedFields[number]
        >;
        formFields = addCondition(
            formFields,
            formValue,
            ['type_of_dref'],
            submissionDrefTypeRelatedFields,
            (val): SubmissionDrefTypeRelatedFields => {
                const baseSubmissionFields: SubmissionDrefTypeRelatedFields = {
                    new_operational_start_date: { forceValue: nullValue },
                    new_operational_end_date: { forceValue: nullValue },
                    reporting_start_date: { forceValue: nullValue },
                    reporting_end_date: { forceValue: nullValue },
                    national_society_contact_name: { forceValue: nullValue },
                    national_society_contact_title: { forceValue: nullValue },
                    national_society_contact_email: { forceValue: nullValue },
                    national_society_contact_phone_number: { forceValue: nullValue },
                    ifrc_emergency_name: { forceValue: nullValue },
                    ifrc_emergency_title: { forceValue: nullValue },
                    ifrc_emergency_email: { forceValue: nullValue },
                    ifrc_emergency_phone_number: { forceValue: nullValue },
                    media_contact_name: { forceValue: nullValue },
                    media_contact_title: { forceValue: nullValue },
                    media_contact_email: { forceValue: nullValue },
                    media_contact_phone_number: { forceValue: nullValue },
                    glide_code: { forceValue: nullValue },
                    national_society_integrity_contact_name: {},
                    national_society_integrity_contact_title: {},
                    national_society_integrity_contact_email: { validations: [emailCondition] },
                    national_society_integrity_contact_phone_number: {},
                    national_society_hotline_phone_number: {},
                };

                if (val?.type_of_dref !== TYPE_LOAN) {
                    return {
                        ...baseSubmissionFields,
                        new_operational_start_date: {},
                        new_operational_end_date: {},
                        reporting_start_date: {},
                        reporting_end_date: {},
                        glide_code: {},
                        national_society_contact_name: {},
                        national_society_contact_title: {},
                        national_society_contact_email: { validations: [emailCondition] },
                        national_society_contact_phone_number: {},
                        ifrc_emergency_name: {},
                        ifrc_emergency_title: {},
                        ifrc_emergency_email: { validations: [emailCondition] },
                        ifrc_emergency_phone_number: {},
                        media_contact_name: {},
                        media_contact_title: {},
                        media_contact_email: { validations: [emailCondition] },
                        media_contact_phone_number: {},
                    };
                }

                return baseSubmissionFields;
            },
        );

        return formFields;
    },
};

export default schema;
