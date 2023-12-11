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
    urlCondition,
} from '@togglecorp/toggle-form';
import { isDefined } from '@togglecorp/fujs';
import { type DeepReplace } from '#utils/common';

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

// Why not use lengthLessThanCondition?
function max500CharCondition(value: string | undefined) {
    return isDefined(value) && value.length > 500
        ? 'Maximum 500 characters are allowed'
        : undefined;
}

function lessThanEqualToTwoImagesCondition<T>(value: T[] | undefined) {
    return isDefined(value) && Array.isArray(value) && value.length > 2
        ? 'Only two images are allowed'
        : undefined;
}

export type DrefResponse = GoApiResponse<'/api/v2/dref/{id}/'>;
export type DrefRequestBody = GoApiBody<'/api/v2/dref/{id}/', 'PATCH'>;
export type DrefRequestPostBody = GoApiBody<'/api/v2/dref/{id}/', 'POST'>;

type NeedIdentifiedResponse = NonNullable<DrefRequestBody['needs_identified']>[number];
type NsActionResponse = NonNullable<DrefRequestBody['national_society_actions']>[number];
type InterventionResponse = NonNullable<DrefRequestBody['planned_interventions']>[number];
type IndicatorResponse = NonNullable<InterventionResponse['indicators']>[number];
type RiskSecurityResponse = NonNullable<DrefRequestBody['risk_security']>[number];
type ImagesFileResponse = NonNullable<DrefRequestBody['images_file']>[number];
type SourceInformationResponse = NonNullable<DrefRequestBody['source_information']>[number];

type NeedIdentifiedFormFields = NeedIdentifiedResponse & { client_id: string };
type NsActionFormFields = NsActionResponse & { client_id: string; }
type InterventionFormFields = InterventionResponse & { client_id: string };
type IndicatorFormFields = IndicatorResponse & { client_id: string };
type SourceInformationFormFields = SourceInformationResponse & { client_id: string };

type RiskSecurityFormFields = RiskSecurityResponse & { client_id: string; };
type ImagesFileFormFields = ImagesFileResponse & { client_id: string };

type EventMapFileResponse = NonNullable<DrefRequestBody['event_map_file']>;
type EventMapFileFormField = Omit<EventMapFileResponse, 'client_id'> & {
    client_id: string;
    id: number;
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
        >,
    SourceInformationResponse,
    SourceInformationFormFields
>
);

export type PartialDref = PartialForm<
    PurgeNull<DrefFormFields>,
    'client_id'
>;

type DrefFormSchema = ObjectSchema<PartialDref>;
type DrefFormSchemaFields = ReturnType<DrefFormSchema['fields']>;

type EventMapFileFields = ReturnType<ObjectSchema<PartialDref['event_map_file'], PartialDref>['fields']>;
type CoverImageFileFields = ReturnType<ObjectSchema<PartialDref['cover_image_file'], PartialDref>['fields']>;
type ImageFileFields = ReturnType<ObjectSchema<NonNullable<PartialDref['images_file']>[number], PartialDref>['fields']>;
type NationalSocietyFields = ReturnType<ObjectSchema<NonNullable<PartialDref['national_society_actions']>[number], PartialDref>['fields']>;
type NeedsIdentifiedFields = ReturnType<ObjectSchema<NonNullable<PartialDref['needs_identified']>[number], PartialDref>['fields']>;
type RiskSecurityFields = ReturnType<ObjectSchema<NonNullable<PartialDref['risk_security']>[number], PartialDref>['fields']>;
type SourceInformationFields = ReturnType<ObjectSchema<NonNullable<PartialDref['source_information']>[number], PartialDref>['fields']>;
type PlannedInterventionFields = ReturnType<ObjectSchema<NonNullable<PartialDref['planned_interventions']>[number], PartialDref>['fields']>;
type IndicatorFields = ReturnType<ObjectSchema<NonNullable<NonNullable<PartialDref['planned_interventions']>[number]['indicators']>[number], PartialDref>['fields']>;

const schema: DrefFormSchema = {
    fields: (formValue): DrefFormSchemaFields => {
        let formFields: DrefFormSchemaFields = {
            // OVERVIEW
            national_society: { required: true },
            type_of_dref: { required: true },
            disaster_type: {},
            type_of_onset: { required: true },
            disaster_category: {},
            country: {},
            district: { defaultValue: [] },
            title: {
                required: true,
                requiredValidation: requiredStringCondition,
            },
            amount_requested: { validations: [positiveNumberCondition] },
            field_report: {}, // This value is set from CopyFieldReportSection

            // EVENT DETAILS
            num_affected: { validations: [positiveIntegerCondition] },
            num_assisted: { validations: [positiveIntegerCondition] },
            // none

            // ACTIONS

            // none

            // OPERATION

            // none

            // SUBMISSION
            ns_request_date: {},
            submission_to_geneva: {},
            date_of_approval: {},
            operation_timeframe: {
                validations: [
                    positiveIntegerCondition,
                    lessThanOrEqualToCondition(30),
                ],
            },
            appeal_code: {},
            ifrc_appeal_manager_name: {},
            ifrc_appeal_manager_email: { validations: [emailCondition] },
            ifrc_appeal_manager_phone_number: {},
            ifrc_appeal_manager_title: {},
            ifrc_project_manager_name: {},
            ifrc_project_manager_email: { validations: [emailCondition] },
            ifrc_project_manager_title: {},
            ifrc_project_manager_phone_number: {},
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
                    emergency_appeal_planned: { forceValue: nullValue },
                    event_map_file: { forceValue: nullValue }, // NOTE: check if this works
                    cover_image_file: { forceValue: nullValue },
                };
                if (val?.type_of_dref === TYPE_LOAN) {
                    return conditionalFields;
                }
                return {
                    ...conditionalFields,
                    emergency_appeal_planned: {},
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
            'people_in_need',
            'did_it_affect_same_area',
            'did_it_affect_same_population',
            'did_ns_respond',
            'did_ns_request_fund',
            'lessons_learned',
            'event_scope',
            'event_text',
            'anticipatory_actions',
            'supporting_document',
            'event_date',
            'event_description',
            'images_file',
            'source_information',
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
                    people_in_need: { forceValue: nullValue },
                    did_it_affect_same_area: { forceValue: nullValue },
                    did_it_affect_same_population: { forceValue: nullValue },
                    did_ns_respond: { forceValue: nullValue },
                    did_ns_request_fund: { forceValue: nullValue },
                    lessons_learned: { forceValue: nullValue },
                    event_scope: { forceValue: nullValue },
                    source_information: { forceValue: [] },
                    event_text: { forceValue: nullValue },
                    anticipatory_actions: { forceValue: nullValue },
                    supporting_document: { forceValue: nullValue },
                    event_date: { forceValue: nullValue },
                    event_description: { forceValue: nullValue },
                    images_file: { forceValue: [] },
                };

                if (
                    val?.type_of_dref !== TYPE_ASSESSMENT
                    && val?.type_of_dref !== TYPE_LOAN
                ) {
                    conditionalFields = {
                        ...conditionalFields,
                        did_it_affect_same_area: {},
                        did_it_affect_same_population: {},
                        did_ns_respond: {},
                        did_ns_request_fund: {},
                        lessons_learned: {},
                        event_scope: {},
                        people_in_need: { validations: [positiveIntegerCondition] },
                    };
                }

                if (val?.type_of_dref === TYPE_IMMINENT) {
                    conditionalFields = {
                        ...conditionalFields,
                        event_text: { validations: [max500CharCondition] },
                        anticipatory_actions: {},
                        supporting_document: {},
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
                                        requiredValidation: urlCondition,
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
                                    caption: {},
                                }),
                            }),
                            validations: [lessThanEqualToTwoImagesCondition],
                        },
                    };
                }

                return conditionalFields;
            },
        );

        formFields = addCondition(
            formFields,
            formValue,
            ['type_of_dref', 'did_ns_request_fund'],
            ['ns_request_text'],
            (val): Pick<DrefFormSchemaFields, 'ns_request_text'> => {
                if (
                    val?.type_of_dref !== TYPE_ASSESSMENT
                        && val?.type_of_dref !== TYPE_LOAN
                        && val?.did_ns_request_fund
                ) {
                    return {
                        ns_request_text: {},
                    };
                }
                return {
                    ns_request_text: { forceValue: nullValue },
                };
            },
        );

        formFields = addCondition(
            formFields,
            formValue,
            [
                'type_of_dref',
                'did_ns_request_fund',
                'did_ns_respond',
                'did_it_affect_same_population',
                'did_it_affect_same_area',
            ],
            ['dref_recurrent_text'],
            (val): Pick<DrefFormSchemaFields, 'dref_recurrent_text'> => {
                if (
                    val?.type_of_dref !== TYPE_ASSESSMENT
                    && val?.type_of_dref !== TYPE_LOAN
                    && val?.did_ns_request_fund
                    && val?.did_ns_respond
                    && val?.did_it_affect_same_population
                    && val?.did_it_affect_same_area
                ) {
                    return {
                        dref_recurrent_text: {},
                    };
                }
                return {
                    dref_recurrent_text: { forceValue: nullValue },
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
                    needs_identified: { forceValue: [] },
                    identified_gaps: { forceValue: nullValue },
                    did_national_society: { forceValue: nullValue },
                    national_society_actions: { forceValue: [] },
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
                            fields: (): NationalSocietyFields => ({
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
                    risk_security: { forceValue: [] },
                    risk_security_concern: { forceValue: nullValue },
                    budget_file: { forceValue: nullValue },
                    planned_interventions: { forceValue: [] },
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
                                    validations: [
                                        positiveIntegerCondition,
                                        lessThanOrEqualToCondition(MAX_INT_LIMIT),
                                    ],
                                },
                                person_targeted: {
                                    validations: [
                                        positiveIntegerCondition,
                                        lessThanOrEqualToCondition(MAX_INT_LIMIT),
                                    ],
                                },
                                description: {},
                                indicators: {
                                    keySelector: (indicator) => indicator.client_id,
                                    member: () => ({
                                        fields: (): IndicatorFields => ({
                                            client_id: {},
                                            title: {},
                                            target: { validations: [positiveNumberCondition] },
                                        }),
                                    }),
                                },
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
            'end_date',
            'publishing_date',
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
                    end_date: { forceValue: nullValue },
                    publishing_date: { forceValue: nullValue },
                    glide_code: { forceValue: nullValue },
                };

                if (val?.type_of_dref !== TYPE_LOAN) {
                    return {
                        ...baseSubmissionFields,
                        end_date: {},
                        publishing_date: {},
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
