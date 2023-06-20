import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

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

export interface WorkPlanComponentItem {
    client_id: string;
    component: number;
    actions: string;
    due_date: string;
    supported_by_id: string;
    status: string;
}

export interface PerFormComponentItem {
    area: number;
    component_letter: string;
    component_num: number;
    description: string;
    id: number;
    title: string;
}

export interface WorkPlanFormFields {
    overview: number;
    component_responses: WorkPlanComponentItem[];
    custom_component_responses: WorkPlanComponentItem[];
}

export interface WorkPlanResponseFields extends WorkPlanFormFields {
    id: number;
}

export interface WorkPlanStatus {
    workplanstatus: {
        key: number;
        value: string;
    }[];
}

export type PartialWorkPlan = PartialForm<WorkPlanFormFields, 'component' | 'client_id'>;
export type WorkPlanFormScheme = ObjectSchema<PartialWorkPlan>;
export type WorkPlanFormSchemeFields = ReturnType<WorkPlanFormScheme['fields']>;

export const workplanSchema: WorkPlanFormScheme = {
    fields: (): WorkPlanFormSchemeFields => ({
        overview: {},
        component_responses: {
            keySelector: (componentResponse) => componentResponse.component,
            member: () => ({
                fields: () => ({
                    client_id: {},
                    component: {},
                    actions: {},
                    due_date: {},
                    supported_by_id: {},
                    status: {},
                }),
            }),
        },
        custom_component_responses: {
            keySelector: (customResponse) => customResponse.client_id,
            member: () => ({
                fields: () => ({
                    client_id: {},
                    component: {},
                    actions: {},
                    due_date: {},
                    supported_by_id: {},
                    status: {},
                }),
            }),
        },
    }),
};
