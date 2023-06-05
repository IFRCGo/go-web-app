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
