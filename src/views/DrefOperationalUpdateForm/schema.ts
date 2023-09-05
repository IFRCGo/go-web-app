import {
    type PartialForm,
    type ObjectSchema,
    type PurgeNull,
    addCondition,
    undefinedValue,
    greaterThanOrEqualToCondition,
    requiredStringCondition,
    nullValue,
    lessThanOrEqualToCondition,
    emailCondition,
} from '@togglecorp/toggle-form';
import { isDefined } from '@togglecorp/fujs';
import { type DeepReplace, type DeepRemoveKeyPattern } from '#utils/common';

import {
    positiveNumberCondition,
    positiveIntegerCondition,
} from '#utils/form';
import { type GoApiResponse, type GoApiBody } from '#utils/restRequest';

import {
    DISASTER_FIRE,
    DISASTER_FLOOD,
    DISASTER_FLASH_FLOOD,
    TYPE_ASSESSMENT,
    TYPE_IMMINENT,
    TYPE_LOAN,
} from './common';

// FIXME: Do we need this limit?
// Is this a server side limit or client side limit?
// Shouldn't this be set for all integer types?
const MAX_INT_LIMIT = 2147483647;

/*
// Why not use lengthLessThanCondition?
function max500CharCondition(value: string | undefined) {
    return isDefined(value) && value.length > 500
        ? 'Maximum 500 characters are allowed'
        : undefined;
}
*/

function lessThanEqualToTwoImagesCondition<T>(value: T[] | undefined) {
    return isDefined(value) && Array.isArray(value) && value.length > 2
        ? 'Only two images are allowed'
        : undefined;
}

export type DrefResponse = GoApiResponse<'/api/v2/dref-op-update/{id}/'>;
export type DrefRequestBody = GoApiBody<'/api/v2/dref-op-update/{id}/', 'PUT'>;

type NeedIdentifiedResponse = NonNullable<DrefRequestBody['needs_identified']>[number];
type NsActionResponse = NonNullable<DrefRequestBody['national_society_actions']>[number];
type InterventionResponse = NonNullable<DrefRequestBody['planned_interventions']>[number];
type IndicatorResponse = NonNullable<InterventionResponse['indicators']>[number];
type RiskSecurityResponse = NonNullable<DrefRequestBody['risk_security']>[number];
type ImagesFileResponse = NonNullable<DrefRequestBody['images_file']>[number];

type NeedIdentifiedFormFields = NeedIdentifiedResponse & { client_id: string };
type NsActionFormFields = NsActionResponse & { client_id: string; }
type InterventionFormFields = InterventionResponse & { client_id: string };
type IndicatorFormFields = IndicatorResponse & { client_id: string };

type RiskSecurityFormFields = RiskSecurityResponse & { client_id: string; };
type ImagesFileFormFields = ImagesFileResponse & { client_id: string };

type EventMapFileResponse = NonNullable<DrefRequestBody['event_map_file']>;
type EventMapFileFormField = Omit<EventMapFileResponse, 'client_id'> & {
    client_id: string;
};

type DrefFormFields = (
    DeepReplace<
        DeepReplace<
            DeepReplace<
                DeepReplace<
                    DeepReplace<
                        DeepReplace<
                            DeepReplace<
                                DeepReplace<
                                    DrefRequestBody,
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
    >
);

export type PartialDref = PartialForm<
    PurgeNull<DeepRemoveKeyPattern<DrefFormFields, '_details' | '_display'>>,
    'client_id'
>;

type DrefFormSchema = ObjectSchema<PartialDref>;
type DrefFormSchemaFields = ReturnType<DrefFormSchema['fields']>;

const schema: DrefFormSchema = {
    fields: (formValue): DrefFormSchemaFields => {
        let formFields: DrefFormSchemaFields = {
            // OVERVIEW
            users: { defaultValue: [] },
            national_society: { required: true },
            type_of_dref: { required: true },
            type_of_onset: { required: true },
            disaster_category: {},
            country: {},
            // FIXME: Do we need to chagne the defaultValue?
            // district: { defaultValue: [] },
            district: {},
            disaster_type: {},
            title: {
                required: true,
                requiredValidation: requiredStringCondition,
            },
            number_of_people_targeted: { validations: [positiveIntegerCondition] },
            number_of_people_affected: { validations: [positiveIntegerCondition] },
            additional_allocation: { validations: [positiveIntegerCondition] },
            dref_allocated_so_far: {},
            total_dref_allocation: {},

            // EVENT DETAILS

            // none

            // ACTIONS

            // none

            // OPERATION

            // none

            // SUBMISSION
            ns_request_date: {},
            date_of_approval: {},
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

            // NOT IN UI

            // government_requested_assistance_date: {}, // NOTE: Not found in the UI
            dref: {},
            has_event_occurred: {},
        };

        // OVERVIEW

        formFields = addCondition(
            formFields,
            formValue,
            ['disaster_type'],
            ['is_man_made_event'],
            (val): Pick<DrefFormSchemaFields, 'is_man_made_event'> => {
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
            'people_in_need',
            'emergency_appeal_planned',
            'event_map_file',
            'cover_image_file',
        ] as const;
        type OverviewDrefTypeRelatedFields = Pick<
            DrefFormSchemaFields,
            typeof overviewDrefTypeRelatedFields[number]
        >;
        formFields = addCondition(
            formFields,
            formValue,
            ['type_of_dref'],
            overviewDrefTypeRelatedFields,
            (val): OverviewDrefTypeRelatedFields => {
                const conditionalFields: OverviewDrefTypeRelatedFields = {
                    people_in_need: { forceValue: nullValue },
                    emergency_appeal_planned: { forceValue: nullValue },
                    event_map_file: { forceValue: nullValue },
                    cover_image_file: { forceValue: nullValue },
                };
                if (val?.type_of_dref === TYPE_LOAN) {
                    return conditionalFields;
                }
                return {
                    ...conditionalFields,
                    people_in_need: {},
                    emergency_appeal_planned: {},
                    event_map_file: {
                        fields: () => ({
                            client_id: {},
                            id: { defaultValue: undefinedValue },
                            caption: { defaultValue: undefinedValue },
                        }),
                    },
                    cover_image_file: {
                        fields: () => ({
                            client_id: {},
                            id: { defaultValue: undefinedValue },
                            caption: { defaultValue: undefinedValue },
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

            'summary_of_change',
            'changing_timeframe_operation',
            'changing_operation_strategy',
            'changing_budget',
            'changing_target_population_of_operation',
            'changing_geographic_location',
            'request_for_second_allocation',
            'has_forecasted_event_materialize',
        ] as const;
        type EventDetailDrefTypeRelatedFields = Pick<
            DrefFormSchemaFields,
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
                    event_text: { forceValue: nullValue },
                    anticipatory_actions: { forceValue: nullValue },
                    event_date: { forceValue: nullValue },
                    event_description: { forceValue: nullValue },
                    images_file: { forceValue: nullValue },

                    summary_of_change: { forceValue: nullValue },
                    changing_timeframe_operation: { forceValue: nullValue },
                    changing_operation_strategy: { forceValue: nullValue },
                    changing_budget: { forceValue: nullValue },
                    changing_target_population_of_operation: { forceValue: nullValue },
                    changing_geographic_location: { forceValue: nullValue },
                    request_for_second_allocation: { forceValue: nullValue },
                    has_forecasted_event_materialize: { forceValue: nullValue },
                };

                if (
                    val?.type_of_dref !== TYPE_ASSESSMENT
                    && val?.type_of_dref !== TYPE_LOAN
                ) {
                    conditionalFields = {
                        ...conditionalFields,
                        event_scope: {},
                    };
                }

                if (val?.type_of_dref === TYPE_IMMINENT) {
                    conditionalFields = {
                        ...conditionalFields,
                        // FIXME: Do we need to remove the validation?
                        // event_text: { validations: [max500CharCondition] },
                        event_text: {},
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
                        images_file: {
                            keySelector: (image_file) => image_file.client_id,
                            member: () => ({
                                fields: () => ({
                                    client_id: {},
                                    id: {},
                                    caption: {
                                        required: true,
                                        requiredValidation: requiredStringCondition,
                                    },
                                }),
                            }),
                            // FIXME: this is not defined on array schema type
                            defaultValue: [],
                            // FIXME: this is not defined on array schema type
                            validations: [lessThanEqualToTwoImagesCondition],
                        },
                        summary_of_change: {},
                        changing_timeframe_operation: {},
                        changing_operation_strategy: {},
                        changing_budget: {},
                        changing_target_population_of_operation: {},
                        changing_geographic_location: {},
                        request_for_second_allocation: {},
                        has_forecasted_event_materialize: {},
                    };
                }

                return conditionalFields;
            },
        );

        formFields = addCondition(
            formFields,
            formValue,
            ['type_of_dref', 'has_forecasted_event_materialize'],
            ['specified_trigger_met'],
            (val): Pick<DrefFormSchemaFields, 'has_forecasted_event_materialize'> => {
                if (val?.type_of_dref === TYPE_IMMINENT && val?.has_forecasted_event_materialize) {
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
            ['did_national_society', 'type_of_dref'],
            ['ns_respond_date'],
            (val): Pick<DrefFormSchemaFields, 'ns_respond_date'> => {
                if (val?.type_of_dref !== TYPE_LOAN && val?.did_national_society) {
                    return {
                        ns_respond_date: {},
                    };
                }
                return {
                    ns_respond_date: { forceValue: nullValue },
                };
            },
        );

        formFields = addCondition(
            formFields,
            formValue,
            ['is_there_major_coordination_mechanism', 'type_of_dref'],
            ['major_coordination_mechanism'],
            (val): Pick<DrefFormSchemaFields, 'major_coordination_mechanism'> => {
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
            'did_national_society',
            'national_society_actions',
            'ifrc',
            'icrc',
            'partner_national_society',
            'government_requested_assistance',
            'national_authorities',
            'un_or_other_actor',
            'is_there_major_coordination_mechanism',
            'photos_file',
        ] as const;
        type ActionsDrefTypeRelatedFields = Pick<
            DrefFormSchemaFields,
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
                    needs_identified: { forceValue: nullValue },
                    identified_gaps: { forceValue: nullValue },
                    did_national_society: { forceValue: nullValue },
                    national_society_actions: { forceValue: nullValue },
                    // FIXME: Should this be force array?
                    photos_file: { forceValue: nullValue },
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
                    did_national_society: {},
                    national_society_actions: {
                        keySelector: (nsAction) => nsAction.client_id,
                        member: () => ({
                            fields: () => ({
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
                    photos_file: { validations: [lessThanEqualToTwoImagesCondition] },
                    ifrc: {},
                    icrc: {},
                    partner_national_society: {},
                    government_requested_assistance: {},
                    national_authorities: {},
                    un_or_other_actor: {},
                    is_there_major_coordination_mechanism: {},
                };
                if (val?.type_of_dref !== TYPE_ASSESSMENT) {
                    conditionalFields = {
                        ...conditionalFields,
                        needs_identified: {
                            keySelector: (need) => need.client_id,
                            member: () => ({
                                fields: () => ({
                                    client_id: {},
                                    title: { required: true },
                                    description: { required: true },
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
            'budget_file',
            'planned_interventions',
            'human_resource',
            'is_surge_personnel_deployed',
        ] as const;
        type OperationDrefTypeRelatedFields = Pick<
            DrefFormSchemaFields,
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
                    risk_security: { forceValue: nullValue },
                    risk_security_concern: { forceValue: nullValue },
                    budget_file: { forceValue: nullValue },
                    planned_interventions: { forceValue: nullValue },
                    human_resource: { forceValue: nullValue },
                    is_surge_personnel_deployed: { forceValue: nullValue },
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
                        // FIXME: shouldn't these be integer?
                        validations: [
                            greaterThanOrEqualToCondition(0),
                            lessThanOrEqualToCondition(100),
                        ],
                    },
                    people_per_urban: {
                        // FIXME: shouldn't these be integer?
                        validations: [
                            greaterThanOrEqualToCondition(0),
                            lessThanOrEqualToCondition(100),
                        ],
                    },
                    people_per_local: {
                        // FIXME: shouldn't these be integer?
                        validations: [
                            greaterThanOrEqualToCondition(0),
                            lessThanOrEqualToCondition(100),
                        ],
                    },
                    displaced_people: { validations: [positiveIntegerCondition] },
                    risk_security: {
                        keySelector: (riskSecurity) => riskSecurity.client_id,
                        member: () => ({
                            fields: () => ({
                                client_id: {},
                                risk: { required: true },
                                mitigation: { required: true },
                            }),
                        }),
                    },
                    risk_security_concern: {},
                    budget_file: {}, // FIXME: may need to check if this exits
                    planned_interventions: {
                        keySelector: (n) => n.client_id,
                        member: () => ({
                            fields: () => ({
                                client_id: {},
                                title: { required: true },
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
                                progress_towards_outcome: {},
                                male: {},
                                female: {},
                                indicators: {
                                    keySelector: (indicator) => indicator.client_id,
                                    member: () => ({
                                        fields: () => ({
                                            client_id: {},
                                            title: {},
                                            target: { validations: [positiveNumberCondition] },
                                            actual: {},
                                        }),
                                    }),
                                },
                                description: {},
                            }),
                        }),
                    },
                    human_resource: {},
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
            (val): Pick<DrefFormSchemaFields, 'surge_personnel_deployed'> => {
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
            'regional_focal_point_name',
            'regional_focal_point_title',
            'regional_focal_point_email',
            'regional_focal_point_phone_number',
            'media_contact_name',
            'media_contact_title',
            'media_contact_email',
            'media_contact_phone_number',
            'glide_code',
        ] as const;
        type SubmissionDrefTypeRelatedFields = Pick<
            DrefFormSchemaFields,
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
                    regional_focal_point_name: { forceValue: nullValue },
                    regional_focal_point_title: { forceValue: nullValue },
                    regional_focal_point_email: { forceValue: nullValue },
                    regional_focal_point_phone_number: { forceValue: nullValue },
                    media_contact_name: { forceValue: nullValue },
                    media_contact_title: { forceValue: nullValue },
                    media_contact_email: { forceValue: nullValue },
                    media_contact_phone_number: { forceValue: nullValue },
                    glide_code: { forceValue: nullValue },
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

                return {
                    ...baseSubmissionFields,
                    regional_focal_point_name: {},
                    regional_focal_point_title: {},
                    regional_focal_point_email: { validations: [emailCondition] },
                    regional_focal_point_phone_number: {},
                };
            },
        );

        return formFields;
    },
};

export default schema;
