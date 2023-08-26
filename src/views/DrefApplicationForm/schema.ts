import {
    PartialForm,
    addCondition,
    undefinedValue,
    ObjectSchema,
    greaterThanOrEqualToCondition,
    requiredStringCondition,
    PurgeNull,
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
export type DrefRequestBody = GoApiBody<'/api/v2/dref/{id}/', 'PUT'>;

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
            district: { defaultValue: [] },
            disaster_type: {},
            title: {
                required: true,
                requiredValidation: requiredStringCondition,
            },
            num_affected: { validations: [positiveIntegerCondition] },
            num_assisted: { validations: [positiveIntegerCondition] },
            field_report: {}, // This value is set from CopyFieldReportSection

            // EVENT DETAILS

            // ACTIONS

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
            ifrc: {},
            icrc: {},
            partner_national_society: {},
            government_requested_assistance: {},
            national_authorities: {},
            un_or_other_actor: {},
            is_there_major_coordination_mechanism: {},

            // OPERATION

            operation_objective: {},
            response_strategy: {},
            people_assisted: {},
            selection_criteria: {},
            total_targeted_population: { validations: [positiveIntegerCondition] },
            disability_people_per: {
                // FIXME: shouldn't these be integer?
                validations: [greaterThanOrEqualToCondition(0), lessThanOrEqualToCondition(100)],
            },
            people_per_urban: {
                // FIXME: shouldn't these be integer?
                validations: [greaterThanOrEqualToCondition(0), lessThanOrEqualToCondition(100)],
            },
            people_per_local: {
                // FIXME: shouldn't these be integer?
                validations: [greaterThanOrEqualToCondition(0), lessThanOrEqualToCondition(100)],
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
                        indicators: {
                            keySelector: (indicator) => indicator.client_id,
                            member: () => ({
                                fields: () => ({
                                    client_id: {},
                                    title: {},
                                    target: { validations: [positiveNumberCondition] },
                                }),
                            }),
                        },
                        description: {},
                    }),
                }),
            },
            human_resource: {},
            is_surge_personnel_deployed: {},

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
            end_date: {},
            publishing_date: {},
            glide_code: {},

            // government_requested_assistance_date: {}, // NOTE: Not found in the UI
            // community_involved: {}, // NOTE: Not found in the UI
        };

        // OVERVIEW

        formFields = addCondition(
            formFields,
            formValue,
            ['disaster_type'],
            ['is_man_made_event'],
            (val) => {
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

        formFields = addCondition(
            formFields,
            formValue,
            ['type_of_dref'],
            [
                'people_in_need',
                'amount_requested',
                'emergency_appeal_planned',
                'event_map_file',
                'cover_image_file',
            ],
            (val) => {
                const conditionalFields: DrefFormSchemaFields = {
                    people_in_need: { forceValue: nullValue },
                    amount_requested: { forceValue: nullValue },
                    emergency_appeal_planned: { forceValue: nullValue },
                    event_map_file: { forceValue: nullValue },
                    cover_image_file: { forceValue: nullValue },
                };
                if (val?.type_of_dref === TYPE_LOAN) {
                    return conditionalFields;
                }
                return {
                    ...conditionalFields,
                    // OVERVIEW
                    people_in_need: {},
                    amount_requested: { validations: [positiveNumberCondition] },
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

        formFields = addCondition(
            formFields,
            formValue,
            ['type_of_dref'],
            [
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
            ],
            (val) => {
                let conditionalFields: DrefFormSchemaFields = {
                    did_it_affect_same_area: { forceValue: nullValue },
                    did_it_affect_same_population: { forceValue: nullValue },
                    did_ns_respond: { forceValue: nullValue },
                    did_ns_request_fund: { forceValue: nullValue },
                    lessons_learned: { forceValue: nullValue },
                    event_scope: { forceValue: nullValue },
                    event_text: { forceValue: nullValue },
                    anticipatory_actions: { forceValue: nullValue },
                    supporting_document: { forceValue: nullValue },
                    event_date: { forceValue: nullValue },
                    event_description: { forceValue: nullValue },
                    images_file: { forceValue: nullValue },
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
                            // FIXME: this is not defined on array type
                            defaultValue: [],
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
            (val) => {
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
            (val) => {
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
            ['did_national_society'],
            ['ns_respond_date'],
            (val) => {
                if (val?.did_national_society) {
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
            ['is_there_major_coordination_mechanism'],
            ['major_coordination_mechanism'],
            (val) => {
                if (val?.is_there_major_coordination_mechanism) {
                    return {
                        major_coordination_mechanism: {},
                    };
                }
                return {
                    major_coordination_mechanism: { forceValue: nullValue },
                };
            },
        );

        formFields = addCondition(
            formFields,
            formValue,
            ['type_of_dref'],
            [
                'assessment_report',
                'needs_identified',
                'identified_gaps',
            ],
            (val) => {
                let conditionalFields: DrefFormSchemaFields = {
                    assessment_report: { forceValue: nullValue },
                    needs_identified: { forceValue: nullValue },
                    identified_gaps: { forceValue: nullValue },
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

        formFields = addCondition(
            formFields,
            formValue,
            ['type_of_dref'],
            [
                'women',
                'men',
                'girls',
                'boys',
                'people_targeted_with_early_actions',
                'logistic_capacity_of_ns',
                'pmer',
                'communication',
            ],
            (val) => {
                let conditionalFields: DrefFormSchemaFields = {
                    women: { forceValue: nullValue },
                    men: { forceValue: nullValue },
                    girls: { forceValue: nullValue },
                    boys: { forceValue: nullValue },
                    people_targeted_with_early_actions: { forceValue: nullValue },
                    logistic_capacity_of_ns: { forceValue: nullValue },
                    pmer: { forceValue: nullValue },
                    communication: { forceValue: nullValue },
                };
                if (val?.type_of_dref !== TYPE_ASSESSMENT) {
                    conditionalFields = {
                        ...conditionalFields,
                        women: { validations: [positiveIntegerCondition] },
                        men: { validations: [positiveIntegerCondition] },
                        girls: { validations: [positiveIntegerCondition] },
                        boys: { validations: [positiveIntegerCondition] },
                    };
                }
                if (val?.type_of_dref === TYPE_IMMINENT) {
                    conditionalFields = {
                        ...conditionalFields,
                        people_targeted_with_early_actions: {
                            validations: [positiveIntegerCondition],
                        },
                    };
                } else {
                    conditionalFields = {
                        ...conditionalFields,
                        logistic_capacity_of_ns: {},
                        pmer: {},
                        communication: {},
                    };
                }
                return conditionalFields;
            },
        );

        formFields = addCondition(
            formFields,
            formValue,
            ['is_surge_personnel_deployed'],
            ['surge_personnel_deployed'],
            (val) => {
                if (val?.is_surge_personnel_deployed) {
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

        return formFields;
    },
};

export default schema;
