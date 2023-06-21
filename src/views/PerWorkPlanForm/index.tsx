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

import Button from '#components/Button';
import { compareLabel } from '#utils/common';
import {
    ListResponse,
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import useTranslation from '#hooks/useTranslation';
import useAlert from '#hooks/useAlert';
import {
    PartialWorkPlan,
    workplanSchema,
    WorkPlanFormFields,
    WorkPlanResponseFields,
    WorkPlanStatus,
    PerFormComponentItem,
    WorkPlanComponentItem,
    CustomWorkPlanComponentItem,
} from './common';
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

const defaultValue: PartialWorkPlan = {
};

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { perId } = useParams<{ perId: string }>();
    const navigate = useNavigate();
    const strings = useTranslation(i18n);

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
    } = useRequest<WorkPlanResponseFields>({
        skip: isNotDefined(statusResponse?.workplan),
        url: `api/v2/per-work-plan/${statusResponse?.workplan}`,
        query: {
            limit: 500,
        },
    });

    const {
        value,
        validate,
        setFieldValue,
        setError: onErrorSet,
    } = useForm(
        workplanSchema,
        { value: defaultValue },
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
        setValue: setCustomComponentValue,
        removeValue: removeCustomCompnentValue,
    } = useFormArray(
        'custom_component_responses',
        setFieldValue,
    );

    const handleSubmit = useCallback(
        (formValues: PartialWorkPlan) => {
            console.warn('Final Values', formValues as WorkPlanFormFields);
            if (isDefined(statusResponse?.workplan)) {
                savePerWorkPlan(formValues as WorkPlanFormFields);
            } else {
                console.error('Work-Plan id not defined');
            }
        },
        [savePerWorkPlan],
    );

    const handleAddCustomActivity = useCallback(() => {
        const newCustomActivity: PartialForm<WorkPlanComponentItem> = {
            client_id: randomString(),
        };

        setFieldValue(
            (oldValue?: PartialForm<CustomWorkPlanComponentItem>) => {
                if (oldValue) {
                    return [
                        ...oldValue,
                        newCustomActivity,
                    ];
                }

                return [newCustomActivity];
            },
            'custom_component_responses',
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

    const customComponentResponseMapping = listToMap(
        value?.custom_component_responses ?? [],
        (customComponentResponse) => customComponentResponse.client_id,
        (customComponentResponse, _, index) => ({
            index,
            value: customComponentResponse,
        }),
    );

    console.info(workPlanResponse);

    return (
        <form
            onSubmit={createSubmitHandler(validate, onErrorSet, handleSubmit)}
        >
            {workPlanResponse?.component_responses?.map((component) => (
                <ComponentInput
                    key={component.component}
                    index={componentResponseMapping[component.component]?.index}
                    value={componentResponseMapping[component.component]?.value}
                    onChange={setComponentValue}
                    component={component}
                    workPlanStatusOptions={workPlanStatusOptions}
                />
            ))}
            {value?.custom_component_responses?.map((customComponent) => (
                <CustomActivity
                    key={customComponent.client_id}
                    index={customComponentResponseMapping[customComponent.client_id]?.index}
                    value={customComponentResponseMapping[customComponent.client_id]?.value}
                    onChange={setCustomComponentValue}
                    onRemove={removeCustomCompnentValue}
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
