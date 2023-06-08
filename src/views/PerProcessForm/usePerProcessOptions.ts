import { useMemo } from 'react';
import {
    ObjectSchema,
    PartialForm,
    Schema,
} from '@togglecorp/toggle-form';

import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';
import {
    StringKeyValuePair,
    NumericKeyValuePair,
} from '#types/common';
import {
    emailCondition,
} from '#utils/form';

import {
    PerAssessmentForm,
    emptyNumericOptionList,
    PerOverviewFields,
    PerWorkPlanForm,
    emptyStringOptionList,
} from './common';
import i18n from './i18n.json';

export type OverviewFormSchema = ObjectSchema<PartialForm<PerOverviewFields>>;
export type OverviewFormSchemaFields = ReturnType<OverviewFormSchema['fields']>;

export type AssessmentFormScheme = ObjectSchema<PartialForm<PerAssessmentForm>>;
export type AssessmentFormSchemeFields = ReturnType<AssessmentFormScheme['fields']>;

export type WorkPlanFormScheme = ObjectSchema<PartialForm<PerWorkPlanForm>>;
export type WorkPlanFormSchemeFields = ReturnType<WorkPlanFormScheme['fields']>;

export type FormStatusScheme = ObjectSchema<PartialForm<FormStatusOptions>>;
export type FormStatusSchemeFields = ReturnType<FormStatusScheme['fields']>;

interface FormStatusOptions {
    formcomponentstatus: StringKeyValuePair[];
    workplanstatus: NumericKeyValuePair[];
}

function transformKeyValueToLabelValue<O extends NumericKeyValuePair | StringKeyValuePair>(o: O): {
    label: string;
    value: O['key'];
} {
    return {
        value: o.key,
        label: o.value,
    };
}

export const overviewSchema: OverviewFormSchema = {
    fields: (): OverviewFormSchemaFields => ({
        id: {},
        type_of_assessment_details: {},
        country_details: {},
        date_of_orientation: {},
        orientation_document: {},
        assessment_number: {},
        branches_involved: {},
        date_of_assessment: { required: true },
        method_asmt_used: {},
        assess_urban_aspect_of_country: {},
        assess_climate_environment_of_country: {},
        date_of_previous_assessment: {},
        type_of_per_assessment: {},
        facilitator_name: {},
        facilitator_email: { validations: [emailCondition] },
        facilitator_phone: {},
        facilitator_contact: {},
        is_epi: {},
        ns_focal_point_name: {},
        ns_focal_point_email: { validations: [emailCondition] },
        ns_focal_point_phone: {},
        partner_focal_point_name: {},
        partner_focal_point_email: { validations: [emailCondition] },
        partner_focal_point_phone: {},
        partner_focal_point_organization: {},
        type_of_assessment: {},
        national_society: { required: true },
        ns_second_focal_point_name: {},
        ns_second_focal_point_email: {},
        ns_second_focal_point_phone: {},
    }),
};

export interface AreaResponse {
    area_id: string;
    component_responses: ComponentResponse[];
}

export interface ComponentResponse {
    component_id: string;
    rating_id: string;
    question_responses: QuestionResponse[];
    consideration_responses: ConsiderationResponses[];
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

export interface Assessment {
    overview_id: string;
    is_draft: string;
    area_responses: AreaResponse[];
}

export type PartialAssessment = PartialForm<Assessment, 'area_id' | 'component_id' | 'answer_id' | 'question_id' | 'consideration_id'>;

export const assessmentSchema2: Schema<PartialAssessment> = {
    overview_id: {},
    is_draft: {},
    area_responses: {
        keySelector: (n) => n.area_id,
        member: () => ({
            fields: () => ({
                id: {},
                area_id: {},
                component_responses: {
                    keySelector: (n) => n.component_id,
                    member: () => ({
                        fields: () => ({
                            id: {},
                            component_id: {},
                            rating_id: {},
                            question_responses: {
                                keySelector: (n) => n.question_id,
                                member: () => ({
                                    fields: () => ({
                                        id: {},
                                        question_id: {},
                                        answer_id: {},
                                        notes: {},
                                    })
                                })
                            },
                            consideration_responses: {
                                keySelector: (n) => n.consideration_id,
                                member: () => ({
                                    fields: () => ({
                                        id: {},
                                        consideration_id: {},
                                        notes: {},
                                    }),
                                })
                            }
                        })
                    })
                }
            })
        })
    }
}

export const assessmentSchema: AssessmentFormScheme = {
    fields: (): AssessmentFormSchemeFields => ({
        id: {},
        status: {},
        question: {},
        description: {},
        title: {},
        answer: {},

        selected_answer: {},
        notes: {},
        selected_answer_details: {},

        component_responses: {
            keySelector: (val) => val.component_id as string,
            member: () => ({
                fields: () => ({
                    id: {},
                    component_num: {},
                    title: {},
                    status: {},
                    componentId: {},
                    question: {},
                    benchmark_responses: {
                        keySelector: (n) => n.benchmark_id as string,
                        member: () => ({
                            fields: () => ({
                                id: {},
                                benchmarkId: {},
                                notes: {},
                                answer: {},
                            }),
                        }),
                    },
                }),
            }),
        },
    }),
};

export const workplanSchema: WorkPlanFormScheme = {
    fields: (): WorkPlanFormSchemeFields => ({
        actions: {},
        area: {},
        component: {},
        responsible_email: {},
        responsible_name: {},
        status: {},
        due_date: {},
    }),
};

function usePerProcessOptions() {
    const strings = useTranslation(i18n);

    const {
        response: formOptions,
    } = useRequest<FormStatusOptions>({
        url: 'api/v2/per-options/',
    });

    const [
        formStatusOptions,
        workPlanStatusOptions,
    ] = useMemo(
        () => {
            if (!formOptions) {
                return [
                    emptyStringOptionList,
                    emptyNumericOptionList,
                ];
            }

            return [
                formOptions.formcomponentstatus.map(transformKeyValueToLabelValue),
                formOptions.workplanstatus.map(transformKeyValueToLabelValue),
            ];
        },
        [formOptions],
    );

    const yesNoOptions = useMemo(
        () => [
            { value: true, label: strings.yesLabel },
            { value: false, label: strings.noLabel },
        ],
        [strings],
    );

    return {
        yesNoOptions,
        formStatusOptions,
        workPlanStatusOptions,
    };
}

export default usePerProcessOptions;
