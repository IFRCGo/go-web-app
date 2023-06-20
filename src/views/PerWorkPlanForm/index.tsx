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
    WorkPlanCustomItem,
} from './common';
import Button from '#components/Button';
import ComponentInput from './ComponentInput';
import CustomActivity from './CustomActivity';

import i18n from './i18n.json';

import styles from './styles.module.css';

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

    const [inputs, setInputs] = useState(['']);
    const handleAddInput = () => {
        setInputs([...inputs, '']); // Add an empty input to the state
    };
    const handleChange = (index: any, value: any) => {
        const updatedInputs = [...inputs];
        updatedInputs[index] = value;
        setInputs(updatedInputs); // Update the input value in the state
    };

    const {
        pending: statusPending,
        response: statusResponse,
    } = useRequest<PerProcessStatusItem>({
        skip: isNotDefined(perId),
        url: `api/v2/per-process-status/${perId}`,
    });

    const {
        response: workPlanStatusResponse,
    } = useRequest<ListResponse<WorkPlanStatus>>({
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
        onSuccess: (response) => {

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
            workPlanStatusResponse?.results?.map((d) => ({
                key: d.key,
                value: d.value,
            })).sort() ?? []
        ),
        [workPlanStatusResponse],
    );

    const {
        setValue: setActivity
    } = useFormArray<'custom_component_responses', PartialForm<WorkPlanFormFields>>('custom_component_responses', setFieldValue);

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
        const newCustomActivity: PartialForm<WorkPlanCustomItem> = {
            clientId,
        };

        setFieldValue(
            (oldValue: PartialForm<WorkPlanCustomItem> | undefined) => {
                if (oldValue) {
                    return [
                        ...oldValue as any[],
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
            <Button
                name={undefined}
                variant="secondary"
                onClick={handleAddInput}
                icons={<IoAdd />}
            >
                Add row
            </Button>
            {inputs.map((input, index) => (
                <input
                    key={index}
                    value={input}
                    onChange={(e) => handleChange(index, e.target.value)}
                />
            ))}

            {value?.custom_component_responses?.map((component, index) => {
                <>
                    <input
                        key={index}
                        value={component}
                        onChange={(e) => handleChange(index, e.target.value)}
                    />
                    <CustomActivity
                        key={component.clientId}
                        index={index}
                        value={component}
                        onChange={setActivity}
                        onRemove={removeComponentValue}
                        workPlanStatusOptions={workPlanStatusOptions}
                    />
                </>
                return null;
            })}
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
