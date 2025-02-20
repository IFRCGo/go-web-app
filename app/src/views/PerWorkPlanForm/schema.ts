import {
    addCondition,
    nullValue,
    type ObjectSchema,
    type PartialForm,
    requiredStringCondition,
} from '@togglecorp/toggle-form';

import { NATIONAL_SOCIETY } from '#utils/constants';
import { type GoApiBody } from '#utils/restRequest';

export type WorkPlanBody = GoApiBody<'/api/v2/per-work-plan/{id}/', 'PATCH'>;
type ComponentResponse = NonNullable<WorkPlanBody['prioritized_action_responses']>[number];
type CustomComponentResponse = NonNullable<WorkPlanBody['additional_action_responses']>[number];

// FIXME: we need to use DeepReplace here
type WorkPlanFormFields = Omit<WorkPlanBody, 'id' | 'prioritized_action_responses' | 'additional_action_responses'> & {
    prioritized_action_responses: Omit<ComponentResponse, 'id'>[];
    additional_action_responses: (Omit<CustomComponentResponse, 'id'> & {
        client_id: string;
    })[];
}

export type PartialWorkPlan = PartialForm<WorkPlanFormFields, 'component' | 'client_id'>;
type WorkPlanFormScheme = ObjectSchema<PartialWorkPlan>;
type WorkPlanFormSchemeFields = ReturnType<WorkPlanFormScheme['fields']>;

type PrioritizedActionResponseFields = ReturnType<ObjectSchema<NonNullable<PartialWorkPlan['prioritized_action_responses']>[number], PartialWorkPlan>['fields']>;
type AdditionalActionResponseFields = ReturnType<ObjectSchema<NonNullable<PartialWorkPlan['additional_action_responses']>[number], PartialWorkPlan>['fields']>;

export const workplanSchema: WorkPlanFormScheme = {
    fields: (): WorkPlanFormSchemeFields => ({
        is_draft: {},
        // FIXME: do we need to pass overview now that request is PATCH?
        overview: {},
        prioritized_action_responses: {
            keySelector: (componentResponse) => componentResponse.component,
            member: () => ({
                fields: (prioritizedActionFormValue): PrioritizedActionResponseFields => {
                    let prioritizedActionFormFields: PrioritizedActionResponseFields = {
                        component: {},
                        actions: {},
                        due_date: {},
                        supported_by_organization_type: {},
                        supported_by: {},
                        status: {
                            required: true,
                        },
                    };
                    prioritizedActionFormFields = addCondition(
                        prioritizedActionFormFields,
                        prioritizedActionFormValue,
                        ['supported_by_organization_type'] as const,
                        ['supported_by'] as const,
                        (): Pick<PrioritizedActionResponseFields, 'supported_by'> => {
                            if (prioritizedActionFormValue
                                ?.supported_by_organization_type !== NATIONAL_SOCIETY
                            ) {
                                return {
                                    supported_by: {
                                        forceValue: nullValue,
                                    },
                                };
                            }
                            return {
                                supported_by: {},
                            };
                        },
                    );
                    return prioritizedActionFormFields;
                },
            }),
        },
        additional_action_responses: {
            keySelector: (customComponentResponse) => customComponentResponse.client_id,
            member: () => ({
                fields: (additionalActionFormValue): AdditionalActionResponseFields => {
                    let additionalActionFormFields: AdditionalActionResponseFields = {
                        client_id: {},
                        actions: {
                            required: true,
                            requiredValidation: requiredStringCondition,
                        },
                        due_date: {},
                        supported_by_organization_type: {},
                        supported_by: {},
                        status: {
                            required: true,
                        },
                    };

                    additionalActionFormFields = addCondition(
                        additionalActionFormFields,
                        additionalActionFormValue,
                        ['supported_by_organization_type'] as const,
                        ['supported_by'] as const,
                        (): Pick<AdditionalActionResponseFields, 'supported_by'> => {
                            if (additionalActionFormValue
                                ?.supported_by_organization_type !== NATIONAL_SOCIETY
                            ) {
                                return {
                                    supported_by: {
                                        forceValue: nullValue,
                                    },
                                };
                            }
                            return {
                                supported_by: {},
                            };
                        },
                    );

                    return additionalActionFormFields;
                },
            }),
        },
    }),
};
