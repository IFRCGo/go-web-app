import {
    type PartialForm,
    type ObjectSchema,
    type PurgeNull,
    addCondition,
    undefinedValue,
    greaterThanOrEqualToCondition,
    requiredStringCondition,
    requiredListCondition,
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
    TYPE_ASSESSMENT,
    TYPE_IMMINENT,
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

export type FinalReportResponse = GoApiResponse<'/api/v2/dref-final-report/{id}/'>;
export type FinalReportRequestBody = GoApiBody<'/api/v2/dref-final-report/{id}/', 'PUT'>;

type NeedIdentifiedResponse = NonNullable<FinalReportRequestBody['needs_identified']>[number];
type NsActionResponse = NonNullable<FinalReportRequestBody['national_society_actions']>[number];
type InterventionResponse = NonNullable<FinalReportRequestBody['planned_interventions']>[number];
type IndicatorResponse = NonNullable<InterventionResponse['indicators']>[number];
type RiskSecurityResponse = NonNullable<FinalReportRequestBody['risk_security']>[number];
type ImagesFileResponse = NonNullable<FinalReportRequestBody['images_file']>[number];

type NeedIdentifiedFormFields = NeedIdentifiedResponse & { client_id: string };
type NsActionFormFields = NsActionResponse & { client_id: string; }
type InterventionFormFields = InterventionResponse & { client_id: string };
type IndicatorFormFields = IndicatorResponse & { client_id: string };

type RiskSecurityFormFields = RiskSecurityResponse & { client_id: string; };
type ImagesFileFormFields = ImagesFileResponse & { client_id: string };

type EventMapFileResponse = NonNullable<FinalReportRequestBody['event_map_file']>;
type EventMapFileFormField = Omit<EventMapFileResponse, 'client_id'> & {
    client_id: string;
};

type FinalReportFormFields = (
    DeepReplace<
        DeepReplace<
            DeepReplace<
                DeepReplace<
                    DeepReplace<
                        DeepReplace<
                            DeepReplace<
                                DeepReplace<
                                    FinalReportRequestBody,
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

export type PartialFinalReport = PartialForm<
    PurgeNull<DeepRemoveKeyPattern<FinalReportFormFields, '_details' | '_display'>>,
    'client_id'
>;

type FinalReportFormSchema = ObjectSchema<PartialFinalReport>;
type FinalReportFormSchemaFields = ReturnType<FinalReportFormSchema['fields']>;

const schema: FinalReportFormSchema = {
    fields: (formValue): FinalReportFormSchemaFields => {
        let formFields: FinalReportFormSchemaFields = {
            // OVERVIEW
            national_society: { required: true },
            type_of_dref: { required: true },
            type_of_onset: { required: true },
            disaster_category: {},
            country: { required: true },
            district: {
                required: true,
                requiredValidation: requiredListCondition,
                defaultValue: [],
            },
            disaster_type: {},
            title: {
                required: true,
                requiredValidation: requiredStringCondition,
            },
            num_assisted: { validations: [positiveIntegerCondition] },
            people_in_need: { validations: [positiveIntegerCondition] },
            event_map_file: {
                fields: () => ({
                    client_id: {},
                    id: { defaultValue: undefinedValue },
                    caption: {},
                }),
            },
            cover_image_file: {
                fields: () => ({
                    client_id: {},
                    id: { defaultValue: undefinedValue },
                    caption: {},
                }),
            },
            number_of_people_affected: {
                validations: [positiveIntegerCondition],
            },
            number_of_people_targeted: {
                validations: [positiveIntegerCondition],
            },
            total_dref_allocation: {
                validations: [],
            },
            main_donors: {
                validations: [max500CharCondition],
            },
            change_in_operational_strategy: {},
            financial_report: {},
            financial_report_description: {},

            // EVENT DETAILS

            event_scope: {},
            event_description: {},
            images_file: {
                keySelector: (image_file) => image_file.client_id,
                member: () => ({
                    fields: () => ({
                        client_id: {},
                        id: { defaultValue: undefinedValue },
                        caption: {
                            required: true,
                            requiredValidation: requiredStringCondition,
                        },
                    }),
                }),
                validations: [lessThanEqualToTwoImagesCondition],
            },

            // ACTIONS

            ifrc: {},
            icrc: {},
            partner_national_society: {},
            government_requested_assistance: {},
            national_authorities: {},
            un_or_other_actor: {},
            is_there_major_coordination_mechanism: {},
            has_national_society_conducted: {},

            // OPERATION

            operation_objective: {},
            response_strategy: {},
            people_assisted: {},
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
            planned_interventions: {
                keySelector: (n) => n.client_id,
                member: () => ({
                    fields: () => ({
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
                        person_assisted: {
                            required: true,
                            validations: [
                                positiveIntegerCondition,
                                lessThanOrEqualToCondition(MAX_INT_LIMIT),
                            ],
                        },
                        male: {
                            validations: [positiveIntegerCondition],
                        },
                        female: {
                            validations: [positiveIntegerCondition],
                        },
                        narrative_description_of_achievements: {},
                        lessons_learnt: {},
                        challenges: {},
                        indicators: {
                            keySelector: (indicator) => indicator.client_id,
                            member: () => ({
                                fields: () => ({
                                    client_id: {},
                                    title: {
                                        required: true,
                                        requiredValidation: requiredStringCondition,
                                    },
                                    actual: { validations: [positiveNumberCondition] },
                                    target: { validations: [positiveNumberCondition] },
                                }),
                            }),
                        },
                        description: {},
                    }),
                }),
            },

            // SUBMISSION
            operation_start_date: {},
            total_operation_timeframe: { validations: [positiveNumberCondition] },
            operation_end_date: {},
            date_of_publication: {},
            appeal_code: {},
            glide_code: {},
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
            regional_focal_point_name: {},
            regional_focal_point_title: {},
            regional_focal_point_email: { validations: [emailCondition] },
            regional_focal_point_phone_number: {},
            media_contact_name: {},
            media_contact_title: {},
            media_contact_email: { validations: [emailCondition] },
            media_contact_phone_number: {},

            // government_requested_assistance_date: {}, // NOTE: Not found in the UI
            // community_involved: {}, // NOTE: Not found in the UI
        };

        // OVERVIEW

        // none

        // EVENT DETAILS

        const eventDetailDrefTypeRelatedFields = [
            'event_text',
            'event_date',
        ] as const;
        type EventDetailDrefTypeRelatedFields = Pick<
            FinalReportFormSchemaFields,
            typeof eventDetailDrefTypeRelatedFields[number]
        >;
        formFields = addCondition(
            formFields,
            formValue,
            ['type_of_dref'],
            eventDetailDrefTypeRelatedFields,
            (val): EventDetailDrefTypeRelatedFields => {
                const conditionalFields: EventDetailDrefTypeRelatedFields = {
                    event_text: { forceValue: nullValue },
                    event_date: { forceValue: nullValue },
                };

                if (val?.type_of_dref === TYPE_IMMINENT) {
                    return {
                        ...conditionalFields,
                        event_text: { validations: [max500CharCondition] },
                    };
                }
                return {
                    ...conditionalFields,
                    event_date: {},
                };
            },
        );

        // ACTIONS

        formFields = addCondition(
            formFields,
            formValue,
            ['is_there_major_coordination_mechanism', 'type_of_dref'],
            ['major_coordination_mechanism'],
            (val): Pick<FinalReportFormSchemaFields, 'major_coordination_mechanism'> => {
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
            ['has_national_society_conducted'],
            ['national_society_conducted_description'],
            (val): Pick<FinalReportFormSchemaFields, 'national_society_conducted_description'> => {
                if (val?.has_national_society_conducted) {
                    return {
                        national_society_conducted_description: {},
                    };
                }
                return {
                    national_society_conducted_description: { forceValue: nullValue },
                };
            },
        );

        type ActionsDrefTypeRelatedFields = Pick<FinalReportFormSchemaFields, 'needs_identified'>;
        formFields = addCondition(
            formFields,
            formValue,
            ['type_of_dref'],
            ['needs_identified'],
            (val): ActionsDrefTypeRelatedFields => {
                if (val?.type_of_dref !== TYPE_ASSESSMENT) {
                    return {
                        needs_identified: {
                            keySelector: (need) => need.client_id,
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
                    };
                }
                return {
                    needs_identified: { forceValue: [] },
                };
            },
        );

        // OPERATION

        formFields = addCondition(
            formFields,
            formValue,
            ['change_in_operational_strategy'],
            ['change_in_operational_strategy_text'],
            (val): Pick<FinalReportFormSchemaFields, 'change_in_operational_strategy_text'> => {
                if (val?.change_in_operational_strategy) {
                    return {
                        change_in_operational_strategy_text: {},
                    };
                }
                return {
                    change_in_operational_strategy_text: { forceValue: nullValue },
                };
            },
        );

        const operationDrefTypeRelatedFields = [
            'women',
            'men',
            'girls',
            'boys',
            'people_targeted_with_early_actions',
        ] as const;
        type OperationDrefTypeRelatedFields = Pick<
            FinalReportFormSchemaFields,
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
                }
                return conditionalFields;
            },
        );

        // SUBMISSION

        // none

        return formFields;
    },
};

export default schema;
