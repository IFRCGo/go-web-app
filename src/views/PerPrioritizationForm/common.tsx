import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

export interface PerFormQuestionItem {
    question: string;
}

export interface PerFormComponentItem {
    area: number;
    component_letter: string;
    component_num: number;
    description: string;
    id: number;
    title: string;
}

export interface Prioritization {
    overview_id: number;
    component_responses: {
        id: number;
        component_id: number;
        justification: string;
    }[];
}

export interface PrioritizationResponseFields extends Prioritization {
    id: number;
}

export type PartialPrioritization = PartialForm<Prioritization, 'component_id'>
export type PrioritizationSchema = ObjectSchema<PartialPrioritization>;
export type PrioritizationSchemaFields = ReturnType<PrioritizationSchema['fields']>;

export const prioritizationSchema: PrioritizationSchema = {
    fields: (): PrioritizationSchemaFields => ({
        overview_id: {},
        component_responses: {
            keySelector: (componentResponse) => componentResponse.component_id,
            member: () => ({
                fields: () => ({
                    id: {},
                    component_id: {},
                    justification: {},
                }),
            }),
        },
    }),
};
