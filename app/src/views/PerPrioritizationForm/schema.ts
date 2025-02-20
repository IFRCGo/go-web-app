import {
    type ObjectSchema,
    type PartialForm,
} from '@togglecorp/toggle-form';

import { type GoApiBody } from '#utils/restRequest';

export type PrioritizationRequestBody = GoApiBody<'/api/v2/per-prioritization/{id}/', 'PATCH'>;

type ComponentResponse = NonNullable<PrioritizationRequestBody['prioritized_action_responses']>[number];
type PrioritizationFormFields = Omit<PrioritizationRequestBody, 'id' | 'prioritized_action_responses'> & ({
    prioritized_action_responses: Omit<ComponentResponse, 'component_details'>[];
});
export type PartialPrioritization = PartialForm<PrioritizationFormFields, 'component'>
type PrioritizationSchema = ObjectSchema<PartialPrioritization>;
type PrioritizationSchemaFields = ReturnType<PrioritizationSchema['fields']>;

type PrioritizedActionResponseFields = ReturnType<ObjectSchema<NonNullable<PartialPrioritization['prioritized_action_responses']>[number], PartialPrioritization>['fields']>;

export const prioritizationSchema: PrioritizationSchema = {
    fields: (): PrioritizationSchemaFields => ({
        // FIXME: do we need to pass overview now that request is PATCH?
        overview: {},
        is_draft: {},
        prioritized_action_responses: {
            keySelector: (componentResponse) => componentResponse.component,
            member: () => ({
                fields: (): PrioritizedActionResponseFields => ({
                    component: {},
                    justification_text: {},
                }),
            }),
        },
    }),
};
