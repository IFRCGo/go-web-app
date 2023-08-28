import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import type { paths } from '#generated/types';

export type PrioritizationRequestBody = paths['/api/v2/per-prioritization/{id}/']['put']['requestBody']['content']['application/json'];

type ComponentResponse = NonNullable<PrioritizationRequestBody['prioritized_action_responses']>[number];
export type PrioritizationFormFields = Omit<PrioritizationRequestBody, 'id' | 'prioritized_action_responses'> & ({
    prioritized_action_responses: Omit<ComponentResponse, 'component_details'>[];
});
export type PartialPrioritization = PartialForm<PrioritizationFormFields, 'component'>
type PrioritizationSchema = ObjectSchema<PartialPrioritization>;
type PrioritizationSchemaFields = ReturnType<PrioritizationSchema['fields']>;

export const prioritizationSchema: PrioritizationSchema = {
    fields: (): PrioritizationSchemaFields => ({
        overview: {},
        is_draft: {},
        prioritized_action_responses: {
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
