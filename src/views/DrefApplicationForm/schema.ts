import {
    PartialForm,
    addCondition,
    undefinedValue,
    ObjectSchema,
    // greaterThanOrEqualToCondition,
    requiredStringCondition,
    PurgeNull,
    nullValue,
} from '@togglecorp/toggle-form';
import { isDefined } from '@togglecorp/fujs';

import {
    positiveNumberCondition,
    positiveIntegerCondition,
    emailCondition,
    lessThanOrEqualToCondition,
} from '#utils/form';
import { paths } from '#generated/types';
import { TYPE_ASSESSMENT } from './common';

const MAX_INT_LIMIT = 2147483647;

function max500CharCondition(value: string | undefined) {
    // FIXME: use translation
    return isDefined(value) && value.length > 500
        ? 'Maximum 500 characters are allowed'
        : undefined;
}

function lessThanEqualToTwoImagesCondition<T>(value: T[] | undefined) {
    // FIXME: use translation
    return isDefined(value) && Array.isArray(value) && value.length > 2
        ? 'Only two images are allowed'
        : undefined;
}

type GetDref = paths['/api/v2/dref/{id}/']['get'];
type DrefResponse = GetDref['responses']['200']['content']['application/json'];

type NeedIdentifiedResponse = NonNullable<DrefResponse['needs_identified']>[number];
type NsActionResponse = NonNullable<DrefResponse['national_society_actions']>[number];
type InterventionResponse = NonNullable<DrefResponse['planned_interventions']>[number];
type IndicatorResponse = NonNullable<InterventionResponse['indicators']>[number];
type RiskSecurityResponse = NonNullable<DrefResponse['risk_security']>[number];
type ImagesFileResponse = NonNullable<DrefResponse['images_file']>[number];

type EventMapFileResponse = NonNullable<DrefResponse['event_map_file']>;
type CoverImageFileResponse = NonNullable<DrefResponse['cover_image_file']>;

type NeedIdentifiedFormFields = Omit<NeedIdentifiedResponse, 'id' | 'image_url' | 'title_display'> & {
    client_id: string;
}
type NsActionFormFields = Omit<NsActionResponse, 'id' | 'image_url' | 'title_display'> & {
    client_id: string;
}
type InterventionFormFields = Pick<
    InterventionResponse,
    'title'
    | 'budget'
    | 'person_targeted'
    | 'description'
> & {
    client_id: string;
    indicators: (Pick<IndicatorResponse, 'title' | 'target'> & {
        client_id: string;
    })[];
}
type RiskSecurityFormFields = Omit<RiskSecurityResponse, 'id'> & {
    client_id: string;
}

type DrefFormFields = Omit<
    DrefResponse,
    'needs_identified'
    | 'national_society_actions'
    | 'planned_interventions'
    | 'risk_security'
    | 'event_map_file'
    | 'cover_image_file'
    | 'images_file'
> & {
    needs_identified: NeedIdentifiedFormFields[];
    national_society_actions: NsActionFormFields[];
    planned_interventions: InterventionFormFields[];
    risk_security:RiskSecurityFormFields[];
    event_map_file: Pick<EventMapFileResponse, 'id' | 'caption'>;
    cover_image_file: Pick<CoverImageFileResponse, 'id' | 'caption'>;
    images_file: (Pick<ImagesFileResponse, 'id' | 'caption'> & {
        client_id: string;
    })[];
};

export type PartialDref = PartialForm<PurgeNull<DrefFormFields>, 'client_id'>;
type DrefFormSchema = ObjectSchema<PartialDref>;
type DrefFormSchemaFields = ReturnType<DrefFormSchema['fields']>;

const schema: DrefFormSchema = {
    fields: (formValue): DrefFormSchemaFields => {
        const baseSchema: DrefFormSchemaFields = {
            field_report: {},
            title: { required: true },
            national_society: { required: true },
            disaster_category: {},
            disaster_type: {},
            type_of_onset: { required: true },
            country: {},
            district: { defaultValue: [] },
            num_affected: { validations: [positiveIntegerCondition] },
            num_assisted: { validations: [positiveIntegerCondition] },
            amount_requested: { validations: [positiveNumberCondition] },
            emergency_appeal_planned: {},
            cover_image_file: {
                fields: () => ({
                    id: { defaultValue: undefinedValue },
                    caption: { defaultValue: undefinedValue },
                }),
            },
            event_map_file: {
                fields: () => ({
                    id: { defaultValue: undefinedValue },
                    caption: { defaultValue: undefinedValue },
                }),
            },
            event_date: {},
            event_text: { validations: [max500CharCondition] },
            anticipatory_actions: {},
            // go_field_report_date: {},
            ns_respond_date: {},
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
                defaultValue: [],
                validations: [lessThanEqualToTwoImagesCondition],
            },
            government_requested_assistance: {},
            government_requested_assistance_date: {},
            national_authorities: {},
            partner_national_society: {},
            ifrc: {},
            icrc: {},
            un_or_other_actor: {},
            major_coordination_mechanism: {},
            people_assisted: {},
            selection_criteria: {},
            community_involved: {},
            disability_people_per: {
                // FIXME: add these validations back
                // validations: [greaterThanOrEqualToCondition(0), lessThanOrEqualToCondition(100)],
            },
            people_per_urban: {
                // FIXME: add these validations back
                // validations: [greaterThanOrEqualToCondition(0), lessThanOrEqualToCondition(100)],
            },
            people_per_local: {
                // FIXME: add these validations back
                // validations: [greaterThanOrEqualToCondition(0), lessThanOrEqualToCondition(100)],
            },
            displaced_people: { validations: [positiveIntegerCondition] },
            people_targeted_with_early_actions: { validations: [positiveIntegerCondition] },
            total_targeted_population: { validations: [positiveIntegerCondition] },
            operation_objective: {},
            response_strategy: {},
            budget_file: {},
            ns_request_date: {},
            // start_date: {},
            submission_to_geneva: {},
            end_date: {},
            date_of_approval: {},
            publishing_date: {},
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
            media_contact_name: {},
            media_contact_title: {},
            media_contact_email: { validations: [emailCondition] },
            media_contact_phone_number: {},
            human_resource: {},
            surge_personnel_deployed: {},
            users: { defaultValue: [] },
            is_there_major_coordination_mechanism: {},
            is_surge_personnel_deployed: {},
            people_in_need: {},
            supporting_document: {},
            did_national_society: {},
            risk_security_concern: {},
            is_man_made_event: {},
            // is_assessment_report: {},
            type_of_dref: { required: true },
            operation_timeframe: {
                validations: [
                    positiveIntegerCondition,
                    lessThanOrEqualToCondition(30),
                ],
            },
            national_society_actions: {
                keySelector: (nsAction) => nsAction.client_id,
                member: () => ({
                    fields: () => ({
                        client_id: {},
                        title: { required: true },
                        description: { required: true },
                    }),
                }),
            },
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
        };

        const assessmentAffectedFields = [
            'did_it_affect_same_area',
            'did_it_affect_same_population',
            'did_ns_respond',
            'did_ns_request_fund',
            'ns_request_text',
            'lessons_learned',
            'dref_recurrent_text',
            'identified_gaps',
            'women',
            'men',
            'girls',
            'boys',
            'event_scope',
            'assessment_report',
            'logistic_capacity_of_ns',
            'pmer',
            'communication',
            'needs_identified',
        ] as const;

        // TODO: verify schema, add condition for loan type
        const schemaWithAssessmentCondition: DrefFormSchemaFields = addCondition(
            baseSchema,
            formValue,
            ['type_of_dref'],
            assessmentAffectedFields,
            () => {
                type ReturnType = Pick<
                    DrefFormSchemaFields,
                    (typeof assessmentAffectedFields)[number]
                >;

                if (formValue?.type_of_dref !== TYPE_ASSESSMENT) {
                    const schemaForNonAssessment: ReturnType = {
                        did_it_affect_same_area: {},
                        did_it_affect_same_population: {},
                        did_ns_respond: {},
                        did_ns_request_fund: {},
                        ns_request_text: {},
                        lessons_learned: {},
                        dref_recurrent_text: {},
                        identified_gaps: {},
                        women: { validations: [positiveIntegerCondition] },
                        men: { validations: [positiveIntegerCondition] },
                        girls: { validations: [positiveIntegerCondition] },
                        boys: { validations: [positiveIntegerCondition] },
                        event_scope: {},
                        assessment_report: {},
                        logistic_capacity_of_ns: {},
                        pmer: {},
                        communication: {},
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

                    return schemaForNonAssessment;
                }

                const schemaForAssessment: ReturnType = {
                    did_it_affect_same_area: { forceValue: nullValue },
                    did_it_affect_same_population: { forceValue: nullValue },
                    did_ns_respond: { forceValue: nullValue },
                    did_ns_request_fund: { forceValue: nullValue },
                    ns_request_text: { forceValue: nullValue },
                    lessons_learned: { forceValue: nullValue },
                    dref_recurrent_text: { forceValue: nullValue },
                    identified_gaps: { forceValue: nullValue },
                    women: { forceValue: nullValue },
                    men: { forceValue: nullValue },
                    girls: { forceValue: nullValue },
                    boys: { forceValue: nullValue },
                    event_scope: { forceValue: nullValue },
                    assessment_report: { forceValue: nullValue },
                    logistic_capacity_of_ns: { forceValue: nullValue },
                    pmer: { forceValue: nullValue },
                    communication: { forceValue: nullValue },
                    needs_identified: { forceValue: nullValue },
                };

                return schemaForAssessment;
            },
        );

        return schemaWithAssessmentCondition;
    },
};

export default schema;
