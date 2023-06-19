import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

export interface WorkPlanComponentItem {
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

export interface WorkPlanCustomItem {
    clientId: string;
    actions: string;
    due_date: string;
    component: string;
    supported_by_id: string;
    status: string;
}

export interface WorkPlanFormFields {
    overview: number;
    component_responses: WorkPlanComponentItem[];
    custom_component_responses: WorkPlanCustomItem[];
}

export interface WorkPlanResponseFields extends WorkPlanFormFields {
    id: number;
}

export interface WorkPlanStatus {
    key: number;
    value: string;
}

export type PartialWorkPlan = PartialForm<WorkPlanFormFields, 'component' | 'clientId'>;
export type WorkPlanFormScheme = ObjectSchema<PartialWorkPlan>;
export type WorkPlanFormSchemeFields = ReturnType<WorkPlanFormScheme['fields']>;

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
            keySelector: (customResponse) => customResponse.clientId,
            member: () => ({
                fields: () => ({
                    clientId: {},
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
