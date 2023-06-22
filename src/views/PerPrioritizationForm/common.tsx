import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import type { GET } from '#types/serverResponse';

type PrioritizationResponse = GET['api/v2/per-prioritization/:id'];
type ComponentResponse = PrioritizationResponse['component_responses'][number];
export type PrioritizationFormFields = Omit<PrioritizationResponse, 'id' | 'component_responses'> & ({
    component_responses: Omit<ComponentResponse, 'component_details'>[];
});
export type PartialPrioritization = PartialForm<PrioritizationFormFields, 'component'>
type PrioritizationSchema = ObjectSchema<PartialPrioritization>;
type PrioritizationSchemaFields = ReturnType<PrioritizationSchema['fields']>;

export const prioritizationSchema: PrioritizationSchema = {
    fields: (): PrioritizationSchemaFields => ({
        overview: {},
        component_responses: {
            keySelector: (componentResponse) => componentResponse.component,
            member: () => ({
                fields: () => ({
                    component: {},
                    justification_text: {},
                }),
            }),
        },
    }),
};
