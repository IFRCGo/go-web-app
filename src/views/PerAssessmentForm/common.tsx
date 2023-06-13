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
    consideration_id: string;
    notes: string;
}

export interface QuestionResponse {
    question_id: number;
    answer_id: string;
    notes: string;
}

export interface ComponentResponse {
    component_id: number;
    rating_id: string;
    question_responses: QuestionResponse[];
    consideration_responses: ConsiderationResponses[];
}

export interface AreaResponse {
    area_id: number;
    component_responses: ComponentResponse[];
}

export interface Assessment {
    overview_id: number;
    is_draft: boolean;
    area_responses: AreaResponse[];
}
export type PartialAssessment = PartialForm<Assessment, 'area_id' | 'component_id' | 'question_id' | 'consideration_id'>;
type AssessmentSchema = ObjectSchema<PartialAssessment>
type AssessmentSchemaFields = ReturnType<AssessmentSchema['fields']>;

export const assessmentSchema: AssessmentSchema = {
    fields: (): AssessmentSchemaFields => ({
        overview_id: {},
        is_draft: {},
        area_responses: {
            keySelector: (areaResponse) => areaResponse.area_id,
            member: () => ({
                fields: () => ({
                    id: {},
                    area_id: {},
                    component_responses: {
                        keySelector: (componentResponse) => componentResponse.component_id,
                        member: () => ({
                            fields: () => ({
                                id: {},
                                component_id: {},
                                rating_id: {},
                                question_responses: {
                                    keySelector: (questionResponse) => questionResponse.question_id,
                                    member: () => ({
                                        fields: () => ({
                                            id: {},
                                            question_id: {},
                                            answer_id: {},
                                            notes: {},
                                        }),
                                    }),
                                },
                                consideration_responses: {
                                    keySelector: (considerationResponse) => (
                                        considerationResponse.consideration_id
                                    ),
                                    member: () => ({
                                        fields: () => ({
                                            id: {},
                                            consideration_id: {},
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
