import { useCallback, useMemo, useState } from 'react';
import { IoAdd } from 'react-icons/io5';
import { useNavigate, useParams } from 'react-router-dom';
import {
    _cs,
    isDefined,
    isNotDefined,
    listToMap,
    randomString,
} from '@togglecorp/fujs';

import {
    PartialForm,
    createSubmitHandler,
    useForm,
    useFormArray,
} from '@togglecorp/toggle-form';

import { compareLabel } from '#utils/common';
import useAlert from '#hooks/useAlert';
import { ListResponse, useLazyRequest, useRequest } from '#utils/restRequest';
import useTranslation from '#hooks/useTranslation';
import { NumericKeyValuePair, StringKeyValuePair } from '#types/common';
import {
    PartialWorkPlan,
    workplanSchema,
    WorkPlanFormFields,
    WorkPlanResponseFields,
    WorkPlanStatus,
    PerFormComponentItem,
    WorkPlanComponentItem,
} from './common';
import Button from '#components/Button';
import CustomActivity from './CustomActivity';

import i18n from './i18n.json';

import styles from './styles.module.css';
import ComponentInput from './ComponentInput';

interface PerProcessStatusItem {
    id: number;
    assessment: number | null;
    prioritization: number | null;
    workplan: number | null;
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

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { perId } = useParams<{ perId: string }>();
    const navigate = useNavigate();

    const {
        pending: statusPending,
        response: statusResponse,
    } = useRequest<PerProcessStatusItem>({
        skip: isNotDefined(perId),
        url: `api/v2/per-process-status/${perId}`,
    });

    const {
        response: workPlanStatusResponse,
    } = useRequest<WorkPlanStatus>({
        url: 'api/v2/per-options/',
    });

    const {
        response: workPlanResponse,
    } = useRequest<ListResponse<PerFormComponentItem>>({
        url: `api/v2/per-work-plan/`,
        query: {
            limit: 500,
        },
    });

    const strings = useTranslation(i18n);

    const {
        value,
        validate,
        setFieldValue,
        setError: onErrorSet,
    } = useForm(
        workplanSchema,
        {
            value: {},
        },
    );

    const alert = useAlert();

    const {
        trigger: savePerWorkPlan,
    } = useLazyRequest<WorkPlanResponseFields, Partial<WorkPlanFormFields>>({
        url: `api/v2/per-work-plan/${statusResponse?.workplan}`,
        method: 'POST',
        body: (ctx) => ctx,
        onSuccess: () => {

            alert.show(
                strings.perFormSaveRequestSuccessMessage,
                { variant: 'success' },
            );
        },
        onFailure: ({
            value: {
                messageForNotification,
                // formErrors,
            },
            debugMessage,
        }) => {
            alert.show(
                <p>
                    {strings.perFormSaveRequestFailureMessage}
                    &nbsp;
                    <strong>
                        {messageForNotification}
                    </strong>
                </p>,
                {
                    variant: 'danger',
                    debugMessage,
                },
            );
        },
    });

    const {
        setValue: setComponentValue,
        removeValue: removeComponentValue,
    } = useFormArray('component_responses', setFieldValue);

    const workPlanStatusOptions = useMemo(
        () => (
            workPlanStatusResponse?.workplanstatus.map((d) => ({
                value: d.key,
                label: d.value,
            })).sort(compareLabel) ?? []
        ),
        [workPlanStatusResponse],
    );

    const {
        setValue,
        removeValue,
    } = useFormArray(
        'custom_component_responses', setFieldValue
    );

    const handleSubmit = useCallback(
        (formValues: PartialWorkPlan) => {
            console.warn('Final Values', formValues as WorkPlanFormFields);
            if (isDefined(statusResponse?.workplan)) {
                savePerWorkPlan(formValues as WorkPlanFormFields);
            } else {
                console.error('Work-Plan id not defined');
            }
        }, [savePerWorkPlan]);

    const handleAddCustomActivity = useCallback(() => {
        const clientId = randomString();
        const newCustomActivity: PartialForm<WorkPlanComponentItem> = {
            client_id: clientId,
        };

        setFieldValue(
            (oldValue?: PartialForm<WorkPlanComponentItem>) => {
                if (oldValue) {
                    return [
                        ...oldValue,
                        newCustomActivity,
                    ];
                }

                return [newCustomActivity];
            },
            'custom_component_responses'
        );
    }, [setFieldValue]);

    const componentResponseMapping = listToMap(
        value?.component_responses ?? [],
        (componentResponse) => componentResponse.component,
        (componentResponse, _, index) => ({
            index,
            value: componentResponse,
        }),
    );

    return (
        <form
            onSubmit={createSubmitHandler(validate, onErrorSet, handleSubmit)}
        >
            {workPlanResponse?.results?.map((component) => (
                <ComponentInput
                    key={component.id}
                    index={componentResponseMapping[component.id]?.index}
                    value={componentResponseMapping[component.id]?.value}
                    onChange={setComponentValue}
                    component={component}
                    workPlanStatusOptions={workPlanStatusOptions}
                    onRemove={removeComponentValue}
                />
            ))}
            {value?.custom_component_responses?.map((input, index) => (
                <CustomActivity
                    key={input.client_id}
                    index={index}
                    value={input}
                    onChange={setValue}
                    onRemove={removeValue}
                    workPlanStatusOptions={workPlanStatusOptions}
                />
            ))}
            <Button
                name={undefined}
                variant="secondary"
                onClick={handleAddCustomActivity}
                icons={<IoAdd />}
            >
                Add row
            </Button>
            <div className={styles.submit}>
                <Button
                    name="submit"
                    type="submit"
                    variant="secondary"
                >
                    {strings.perFormSaveAndFinalizeWorkPlan}
                </Button>
            </div>
        </form>
    );
}

Component.displayName = 'PerWorkPlan';
