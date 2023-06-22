import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';
import type { GET } from '#types/serverResponse';

export function booleanValueSelector<T extends { value: boolean }>(option: T) {
    return option.value;
}
export function numericValueSelector<T extends { value: number }>(option: T) {
    return option.value;
}
export function stringValueSelector<T extends { value: string }>(option: T) {
    return option.value;
}
export function stringLabelSelector<T extends { label: string }>(option: T) {
    return option.label;
}

type WorkPlanResponse = GET['api/v2/per-work-plan/:id'];
type ComponentResponse = WorkPlanResponse['component_responses'][number];
type CustomComponentResponse = WorkPlanResponse['custom_component_responses'][number];

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
        overview: {},
        component_responses: {
            keySelector: (componentResponse) => componentResponse.component,
            member: () => ({
                fields: () => ({
                    component: {},
                    actions: {},
                    due_date: {},
                    supported_by_id: {},
                    status: {},
                }),
            }),
        },
        custom_component_responses: {
            keySelector: (customComponentResponse) => customComponentResponse.client_id,
            member: () => ({
                fields: () => ({
                    client_id: {},
                    actions: {},
                    due_date: {},
                    supported_by_id: {},
                    status: {},
                }),
            }),
        },
    }),
};
