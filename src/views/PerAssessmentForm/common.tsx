import {
    ObjectSchema,
    PartialForm,
} from '@togglecorp/toggle-form';
import {
    NumericValueOption,
    BooleanValueOption,
    StringValueOption,
} from '#types/common';

export const SELF_ASSESSMENT = 1;
export const SIMULATION_ASSESSMENT = 2;
export const OPERATIONAL_ASSESSMENT = 3;
export const POST_OPERATIONAL_ASSESSMENT = 4;

export interface FormComponentStatus {
    key: string;
    value: string;
}

export interface PerFormAnswer {
    id: string;
    text: string;
}

export type Option = NumericValueOption | BooleanValueOption | StringValueOption;

export const emptyOptionList: Option[] = [];
export const emptyStringOptionList: StringValueOption[] = [];
export const emptyNumericOptionList: NumericValueOption[] = [];
export const emptyBooleanOptionList: BooleanValueOption[] = [];

export const optionKeySelector = (o: Option) => o.value;
export const numericOptionKeySelector = (o: NumericValueOption) => o.value;
export const stringOptionKeySelector = (o: StringValueOption) => o.value;
export const booleanOptionKeySelector = (o: BooleanValueOption) => o.value;
export const optionLabelSelector = (o: Option) => o.label;

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

export interface Component {
    area: Area;
    title: string;
    component: string;
    component_letter: string;
    component_num: number;
    description: string;
    id: string;
    question: string;
    status: string;
}

interface PerArea {
    area_num: number;
    id: number;
    title: string;
}

export interface PerFormComponentItem {
    area: PerArea;
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

export interface Area {
    id: number;
    title: string;
    area_num: number;
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
