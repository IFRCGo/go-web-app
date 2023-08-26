import {
    ObjectSchema,
    PartialForm,
    PurgeNull,
} from '@togglecorp/toggle-form';

import type { paths } from '#generated/types';
import { DeepReplace } from '#utils/common';

type AssessmentRequestBody = paths['/api/v2/per-assessment/{id}/']['put']['requestBody']['content']['application/json'];
type AssessmentFormFields = PurgeNull<AssessmentRequestBody>

type AreaResponse = NonNullable<AssessmentFormFields['area_responses']>[number];
type ComponentResponse = NonNullable<AreaResponse['component_responses']>[number];
type QuestionResponse = NonNullable<ComponentResponse['question_responses']>[number];

type QuestionResponseFormFields = Omit<QuestionResponse, 'question'> & {
    question: NonNullable<QuestionResponse['question']>;
}

type ComponentResponseFormFields = DeepReplace<
    ComponentResponse,
    QuestionResponse,
    QuestionResponseFormFields
>;

type AreaResponseFormFields = DeepReplace<
    AreaResponse,
    ComponentResponse,
    ComponentResponseFormFields
>;

export type PartialAssessment = PartialForm<
    DeepReplace<
        AssessmentFormFields,
        AreaResponse,
        AreaResponseFormFields
    >,
    'area' | 'component' | 'question'
>;
type AssessmentSchema = ObjectSchema<PartialAssessment>
type AssessmentSchemaFields = ReturnType<AssessmentSchema['fields']>;

export const assessmentSchema: AssessmentSchema = {
    fields: (): AssessmentSchemaFields => ({
        is_draft: {},
        overview: {},
        area_responses: {
            keySelector: (areaResponse) => areaResponse.area,
            member: () => ({
                fields: () => ({
                    area: {},
                    component_responses: {
                        keySelector: (componentResponse) => componentResponse.component,
                        member: () => ({
                            fields: () => ({
                                component: {},
                                rating: {},
                                question_responses: {
                                    keySelector: (questionResponse) => questionResponse.question,
                                    member: () => ({
                                        fields: () => ({
                                            question: {},
                                            answer: {},
                                            notes: {},
                                        }),
                                    }),
                                },
                                urban_considerations: {},
                                epi_considerations: {},
                                climate_environmental_considerations: {},
                                notes: {},
                            }),
                        }),
                    },
                }),
            }),
        },
    }),
};
