import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';

export interface PerFormAnswer {
    id: string;
    text: string;
}

export function answerKeySelector(answer: PerFormAnswer) {
    return answer.id;
}

export function answerLabelSelector(answer: PerFormAnswer) {
    return answer.text;
}

export interface TypeOfAssessment {
    id: string;
    name: string;
}

export interface PerFormArea {
    id: number;
    title: string;
    area_num: number;
}

export interface PerFormComponentItem {
    area: PerFormArea;
    id: number;
    component_id: number;
    component_num: number;
    title: string;
    question: string;
    benchmark_responses: {
        id: number | string;
        benchmark_id: number | string;
        notes: string;
    }
}

export interface PerFormQuestionItem {
    answers: PerFormAnswer[];
    component: PerFormComponentItem;
    description: string | null;
    id: number;
    is_benchmark: boolean;
    is_epi: boolean;
    question: string;
    question_num: number;
}

export interface ConsiderationResponses {
    consideration: string;
    notes: string;
}

export interface QuestionResponse {
    question: number;
    answer: string;
    notes: string;
}

export interface ComponentResponse {
    component: number;
    rating: string;
    question_responses: QuestionResponse[];
    consideration_responses: ConsiderationResponses[];
}

export interface AreaResponse {
    area: number;
    component_responses: ComponentResponse[];
}

export interface AssessmentResponse {
    overview: number;
    is_draft: boolean;
    area_responses: AreaResponse[];
}

export interface PerAssessmentResponseFields extends AssessmentResponse {
    id: number;
}

export type PartialAssessment = PartialForm<AssessmentResponse, 'area' | 'component' | 'question' | 'consideration'>;
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
                                        considerationResponse.consideration
                                    ),
                                    member: () => ({
                                        fields: () => ({
                                            consideration: {},
                                            notes: {},
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
