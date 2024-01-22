import {
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
} from '@togglecorp/toggle-form';

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
                fields: (): PrioritizedActionResponseFields => ({
                    component: {},
                    actions: {},
                    due_date: {},
                    supported_by_organization_type: {
                        required: true,
                    },
                    supported_by: {},
                    status: {
                        required: true,
                    },
                }),
            }),
        },
        additional_action_responses: {
            keySelector: (customComponentResponse) => customComponentResponse.client_id,
            member: () => ({
                fields: (): AdditionalActionResponseFields => ({
                    client_id: {},
                    actions: {
                        required: true,
                        requiredValidation: requiredStringCondition,
                    },
                    due_date: {},
                    supported_by: {},
                    status: {
                        required: true,
                    },
                }),
            }),
        },
    }),
};
