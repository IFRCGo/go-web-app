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
    requiredListCondition,
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

function lessThanEqualToFourImagesCondition<T>(value: T[] | undefined) {
    return isDefined(value) && Array.isArray(value) && value.length > 4
        ? 'Maximum four images are allowed'
        : undefined;
}

export type FinalReportRequestBody = GoApiBody<'/api/v2/dref-final-report/{id}/', 'PATCH'>;

type NeedIdentifiedResponse = NonNullable<FinalReportRequestBody['needs_identified']>[number];
type NsActionResponse = NonNullable<FinalReportRequestBody['national_society_actions']>[number];
type InterventionResponse = NonNullable<FinalReportRequestBody['planned_interventions']>[number];
type IndicatorResponse = NonNullable<InterventionResponse['indicators']>[number];
type RiskSecurityResponse = NonNullable<FinalReportRequestBody['risk_security']>[number];
type ImagesFileResponse = NonNullable<FinalReportRequestBody['images_file']>[number];
type SourceInformationResponse = NonNullable<FinalReportRequestBody['source_information']>[number];

type NeedIdentifiedFormFields = NeedIdentifiedResponse & { client_id: string };
type NsActionFormFields = NsActionResponse & { client_id: string; }
type InterventionFormFields = InterventionResponse & { client_id: string };
type IndicatorFormFields = IndicatorResponse & { client_id: string };
type SourceInformationFormFields = SourceInformationResponse & { client_id: string };

type RiskSecurityFormFields = RiskSecurityResponse & { client_id: string; };
type ImagesFileFormFields = ImagesFileResponse & { client_id: string };

type EventMapFileResponse = NonNullable<FinalReportRequestBody['event_map_file']>;
type EventMapFileFormField = Omit<EventMapFileResponse, 'client_id'> & {
    client_id: string;
    id: number;
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
        >,
        SourceInformationResponse,
        SourceInformationFormFields
    >
);

export type PartialFinalReport = PartialForm<
    PurgeNull<FinalReportFormFields>,
    'client_id'
>;

type FinalReportFormSchema = ObjectSchema<PartialFinalReport>;
type FinalReportFormSchemaFields = ReturnType<FinalReportFormSchema['fields']>;

type EventMapFileFields = ReturnType<ObjectSchema<PartialFinalReport['event_map_file'], PartialFinalReport>['fields']>;
type CoverImageFileFields = ReturnType<ObjectSchema<PartialFinalReport['cover_image_file'], PartialFinalReport>['fields']>;
type ImageFileFields = ReturnType<ObjectSchema<NonNullable<PartialFinalReport['images_file']>[number], PartialFinalReport>['fields']>;
type NeedsIdentifiedFields = ReturnType<ObjectSchema<NonNullable<PartialFinalReport['needs_identified']>[number], PartialFinalReport>['fields']>;
type RiskSecurityFields = ReturnType<ObjectSchema<NonNullable<PartialFinalReport['risk_security']>[number], PartialFinalReport>['fields']>;
type SourceInformationFields = ReturnType<ObjectSchema<NonNullable<PartialFinalReport['source_information']>[number], PartialFinalReport>['fields']>;
type PlannedInterventionFields = ReturnType<ObjectSchema<NonNullable<PartialFinalReport['planned_interventions']>[number], PartialFinalReport>['fields']>;
type IndicatorFields = ReturnType<ObjectSchema<NonNullable<NonNullable<PartialFinalReport['planned_interventions']>[number]['indicators']>[number], PartialFinalReport>['fields']>;

const schema: FinalReportFormSchema = {
    fields: (formValue): FinalReportFormSchemaFields => {
        let formFields: FinalReportFormSchemaFields = {
            // OVERVIEW
            national_society: { required: true },
            type_of_dref: { required: true },
            disaster_type: {},
            type_of_onset: { required: true },
            disaster_category: {},
            country: { required: true },
            district: {
                required: true,
                requiredValidation: requiredListCondition,
                defaultValue: [],
            },
            title: {
                required: true,
                requiredValidation: requiredStringCondition,
            },
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
            main_donors: {
                validations: [max500CharCondition],
            },
            change_in_operational_strategy: {},
            financial_report: {},
            financial_report_description: {},

            // EVENT DETAILS
            number_of_people_affected: {
                validations: [positiveIntegerCondition],
            },
            estimated_number_of_affected_male: { validations: [positiveIntegerCondition] },
            estimated_number_of_affected_female: { validations: [positiveIntegerCondition] },
            estimated_number_of_affected_girls_under_18: {
                validations: [positiveIntegerCondition],
            },
            estimated_number_of_affected_boys_under_18: {
                validations: [positiveIntegerCondition],
            },
            people_in_need: { validations: [positiveIntegerCondition] },
            event_description: {},
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
            num_assisted: { validations: [positiveIntegerCondition] },
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
            total_dref_allocation: {},
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
            has_anti_fraud_corruption_policy: {},
            has_anti_sexual_harassment_policy: {},
            has_sexual_abuse_policy: {},
            has_whistleblower_protection_policy: {},
            has_child_protection_policy: {},
            has_child_safeguarding_risk_analysis_assessment: {},
            planned_interventions: {
                keySelector: (n) => n.client_id,
                member: () => ({
                    fields: (): PlannedInterventionFields => ({
                        client_id: {},
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
                        title: {
                            required: true,
                            requiredValidation: requiredStringCondition,
                        },
                        description: {},
                        narrative_description_of_achievements: {},
                        lessons_learnt: {},
                        challenges: {},
                        indicators: {
                            keySelector: (indicator) => indicator.client_id,
                            member: () => ({
                                fields: (): IndicatorFields => ({
                                    client_id: {},
                                    title: {
                                        required: true,
                                        requiredValidation: requiredStringCondition,
                                    },
                                    actual: {
                                        required: true,
                                        validations: [
                                            positiveNumberCondition,
                                        ],
                                    },
                                    target: { validations: [positiveNumberCondition] },
                                }),
                            }),
                        },
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
            national_society_integrity_contact_name: {},
            national_society_integrity_contact_title: {},
            national_society_integrity_contact_email: { validations: [emailCondition] },
            national_society_integrity_contact_phone_number: {},
            national_society_hotline_phone_number: {},
        };

        // OVERVIEW

        // none

        // EVENT DETAILS

        const eventDetailDrefTypeRelatedFields = [
            'event_text',
            'event_date',
            'source_information',
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

        type ActionsDrefTypeRelatedFields = Pick<FinalReportFormSchemaFields, 'needs_identified' | 'event_scope'>;
        formFields = addCondition(
            formFields,
            formValue,
            ['type_of_dref'],
            [
                'needs_identified',
                'event_scope',
            ],
            (val): ActionsDrefTypeRelatedFields => {
                if (val?.type_of_dref !== TYPE_ASSESSMENT) {
                    return {
                        event_scope: {},
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
                return {
                    event_scope: { forceValue: nullValue },
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
            'assisted_num_of_women',
            'assisted_num_of_men',
            'assisted_num_of_girls_under_18',
            'assisted_num_of_boys_under_18',
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
                    assisted_num_of_women: { forceValue: nullValue },
                    assisted_num_of_men: { forceValue: nullValue },
                    assisted_num_of_girls_under_18: { forceValue: nullValue },
                    assisted_num_of_boys_under_18: { forceValue: nullValue },
                    people_targeted_with_early_actions: { forceValue: nullValue },
                };
                if (val?.type_of_dref !== TYPE_ASSESSMENT) {
                    conditionalFields = {
                        ...conditionalFields,
                        assisted_num_of_women: { validations: [positiveIntegerCondition] },
                        assisted_num_of_men: { validations: [positiveIntegerCondition] },
                        assisted_num_of_girls_under_18: { validations: [positiveIntegerCondition] },
                        assisted_num_of_boys_under_18: { validations: [positiveIntegerCondition] },
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
