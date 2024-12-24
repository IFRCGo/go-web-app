import { type DeepReplace } from '@ifrc-go/ui/utils';
import {
    type ObjectSchema,
    type PartialForm,
    type PurgeNull,
} from '@togglecorp/toggle-form';

import { type GoApiResponse } from '#utils/restRequest';

type AssessmentRequestBody = GoApiResponse<'/api/v2/per-assessment/{id}/', 'PATCH'>;

type AssessmentFormFields = PurgeNull<AssessmentRequestBody>

type AreaResponse = NonNullable<AssessmentFormFields['area_responses']>[number];
type ComponentResponse = NonNullable<AreaResponse['component_responses']>[number];
type QuestionResponse = NonNullable<ComponentResponse['question_responses']>[number];

type QuestionResponseFormFields = Omit<QuestionResponse, 'question'> & {
    question: NonNullable<QuestionResponse['question']>;
}

export type PartialAssessment = PartialForm<
    DeepReplace<
        AssessmentFormFields,
        QuestionResponse,
        QuestionResponseFormFields
    >,
    'area' | 'component' | 'question'
>;
type AssessmentSchema = ObjectSchema<PartialAssessment>
type AssessmentSchemaFields = ReturnType<AssessmentSchema['fields']>;

type AssessmentResponseSchemaFields = ReturnType<ObjectSchema<NonNullable<PartialAssessment['area_responses']>[number], PartialAssessment>['fields']>;
type ComponentResponseSchemaFields = ReturnType<ObjectSchema<NonNullable<NonNullable<PartialAssessment['area_responses']>[number]['component_responses']>[number], PartialAssessment>['fields']>;
type QuestionResponseSchemaFields = ReturnType<ObjectSchema<NonNullable<NonNullable<NonNullable<PartialAssessment['area_responses']>[number]['component_responses']>[number]['question_responses']>[number], PartialAssessment>['fields']>;

export const assessmentSchema: AssessmentSchema = {
    fields: (): AssessmentSchemaFields => ({
        is_draft: {},
        // FIXME: do we need to pass overview now that request is PATCH?
        overview: {},
        area_responses: {
            keySelector: (areaResponse) => areaResponse.area,
            member: () => ({
                fields: (): AssessmentResponseSchemaFields => ({
                    area: {},
                    component_responses: {
                        keySelector: (componentResponse) => componentResponse.component,
                        member: () => ({
                            fields: (): ComponentResponseSchemaFields => ({
                                component: {},
                                rating: {},
                                question_responses: {
                                    keySelector: (questionResponse) => questionResponse.question,
                                    member: () => ({
                                        fields: (): QuestionResponseSchemaFields => ({
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
