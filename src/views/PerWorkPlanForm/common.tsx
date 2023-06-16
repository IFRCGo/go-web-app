import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

export interface WorkPlanComponentItem {
    id: number;
    component: number;
    actions: string;
    due_date: string;
    supported_by_id: string;
    status: string;
}

export interface WorkPlanCustomItem {
    id: number;
    actions: string;
    due_date: string;
    component: string;
    supported_by_id: string;
    status: string;
}

export interface WorkPlanFormFields {
    id: number;
    overview_id: number;
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

export type PartialWorkPlan = PartialForm<WorkPlanFormFields, 'component' | 'supported_by_id'>;
export type WorkPlanFormScheme = ObjectSchema<PartialWorkPlan>;
export type WorkPlanFormSchemeFields = ReturnType<WorkPlanFormScheme['fields']>;

export const workplanSchema: WorkPlanFormScheme = {
    fields: (): WorkPlanFormSchemeFields => ({
        overview_id: {},
        component_responses: {
            keySelector: (componentResponse) => componentResponse.component,
            member: () => ({
                fields: () => ({
                    id: {},
                    component: {},
                    actions: {},
                    due_date: {},
                    supported_by_id: {},
                    status: {},
                }),
            }),
        },
        custom_component_responses: {
            keySelector: (customResponse) => customResponse.supported_by_id,
            member: () => ({
                fields: () => ({
                    id: {},
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
