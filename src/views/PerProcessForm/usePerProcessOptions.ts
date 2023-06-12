import { useMemo } from 'react';
import {
    ObjectSchema,
    PartialForm,
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
    emptyNumericOptionList,
    PerOverviewFields,
    WorkPlanForm,
    emptyStringOptionList,
} from './common';
import i18n from './i18n.json';

export type OverviewFormSchema = ObjectSchema<PartialForm<PerOverviewFields>>;
export type OverviewFormSchemaFields = ReturnType<OverviewFormSchema['fields']>;

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
    area_id: number;
    component_responses: ComponentResponse[];
}

export interface ComponentResponse {
    component_id: number;
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
    overview_id: number;
    is_draft: boolean;
    area_responses: AreaResponse[];
}

export interface Prioritization {
    overview_id: number;
    component_responses: {
        id: number;
        component_id: number;
        justification: string;
    }[];
}

export type PartialAssessment = PartialForm<Assessment, 'area_id' | 'component_id' | 'question_id' | 'consideration_id'>;
type AssessmentSchema = ObjectSchema<PartialAssessment>
type AssessmentSchemaFields = ReturnType<AssessmentSchema['fields']>;

export const assessmentSchema2: AssessmentSchema = {
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

export type PartialPrioritization = PartialForm<Prioritization, 'component_id'>
export type PrioritizationScheme = ObjectSchema<PartialPrioritization>;
export type PrioritizationSchemeFields = ReturnType<PrioritizationScheme['fields']>;

export const prioritizationSchema: PrioritizationScheme = {
    fields: (): PrioritizationSchemeFields => ({
        overview_id: {},
        component_responses: {
            keySelector: (componentResponse) => componentResponse.component_id,
            member: () => ({
                fields: () => ({
                    id: {},
                    component_id: {},
                    justification: {},
                }),
            }),
        },
    }),
};

export type PartialWorkPlan = PartialForm<WorkPlanForm, 'component_id' | 'supported_by_id'>;
export type WorkPlanFormScheme = ObjectSchema<PartialWorkPlan>;
export type WorkPlanFormSchemeFields = ReturnType<WorkPlanFormScheme['fields']>;

export const workplanSchema: WorkPlanFormScheme = {
    fields: (): WorkPlanFormSchemeFields => ({
        overview_id: {},
        component_responses: {
            keySelector: (componentResponse) => componentResponse.component_id,
            member: () => ({
                fields: () => ({
                    id: {},
                    component_id: {},
                    actions: {},
                    due_date: {},
                    supported_by_id: {},
                    status: {},
                }),
            }),
        },
        custom_component_responses: {
            keySelector: (customResponse) => customResponse.supported_by_id,
            member: () => ({
                fields: () => ({
                    id: {},
                    actions: {},
                    due_date: {},
                    supported_by_id: {},
                    status: {},
                }),
            }),
        },
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
