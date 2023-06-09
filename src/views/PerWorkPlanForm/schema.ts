import {
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
} from '@togglecorp/toggle-form';
import { paths } from '#generated/types';

type WorkPlanResponse = paths['/api/v2/per-work-plan/{id}/']['put']['requestBody']['content']['application/json'];
type ComponentResponse = NonNullable<WorkPlanResponse['component_responses']>[number];
type CustomComponentResponse = NonNullable<WorkPlanResponse['custom_component_responses']>[number];

type WorkPlanFormFields = Omit<WorkPlanResponse, 'id' | 'component_responses' | 'custom_component_responses'> & {
    component_responses: Omit<ComponentResponse, 'id'>[];
    custom_component_responses: (Omit<CustomComponentResponse, 'id'> & {
        client_id: string;
    })[];
}

export type PartialWorkPlan = PartialForm<WorkPlanFormFields, 'component' | 'client_id'>;
type WorkPlanFormScheme = ObjectSchema<PartialWorkPlan>;
type WorkPlanFormSchemeFields = ReturnType<WorkPlanFormScheme['fields']>;

export const workplanSchema: WorkPlanFormScheme = {
    fields: (): WorkPlanFormSchemeFields => ({
        is_draft: {},
        overview: {},
        component_responses: {
            keySelector: (componentResponse) => componentResponse.component,
            member: () => ({
                fields: () => ({
                    component: {},
                    actions: {},
                    due_date: {},
                    supported_by: {},
                    status: {
                        required: true,
                    },
                }),
            }),
        },
        custom_component_responses: {
            keySelector: (customComponentResponse) => customComponentResponse.client_id,
            member: () => ({
                fields: () => ({
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
