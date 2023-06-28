import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

import type { GET } from '#types/serverResponse';

export type AssessmentResponse = GET['api/v2/per-assessment/:id'];
type AreaResponse = AssessmentResponse['area_responses'][number];
type ComponentResponse = AreaResponse['component_responses'][number];
type ConsiderationResponse = ComponentResponse['consideration_responses'][number];

interface AssessmentFormFields extends Omit<AssessmentResponse, 'id' | 'user' | 'area_responses'>{
    area_responses: (Omit<AreaResponse, 'area_details' | 'id' | 'is_draft' | 'component_responses'> & {
        component_responses: (Omit<ComponentResponse, 'rating_details'> & {
            consideration_responses: (Omit<ConsiderationResponse, 'id'> & { client_id: string })[];
        })[];
    })[];
}

export type PartialAssessment = PartialForm<AssessmentFormFields, 'area' | 'component' | 'question' | 'consideration' | 'client_id'>;
type AssessmentSchema = ObjectSchema<PartialAssessment>
type AssessmentSchemaFields = ReturnType<AssessmentSchema['fields']>;

export const assessmentSchema: AssessmentSchema = {
    fields: (): AssessmentSchemaFields => ({
        overview: {},
        is_draft: {},
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
                                consideration_responses: {
                                    keySelector: (considerationResponse) => (
                                        considerationResponse.client_id
                                    ),
                                    member: () => ({
                                        fields: () => ({
                                            client_id: {},
                                            urban_considerations: {},
                                            epi_considerations: {},
                                            climate_environmental_considerations: {},
                                        }),
                                    }),
                                },
                            }),
                        }),
                    },
                }),
            }),
        },
    }),
};
