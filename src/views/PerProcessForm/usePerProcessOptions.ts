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
