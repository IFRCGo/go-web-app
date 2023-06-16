import { useCallback } from 'react';
import { IoAdd } from 'react-icons/io5';
import { useNavigate, useParams } from 'react-router-dom';
import { _cs, isDefined, isNotDefined, listToMap } from '@togglecorp/fujs';
import {
    PartialForm,
    createSubmitHandler,
    useForm,
    useFormArray,
} from '@togglecorp/toggle-form';

import useAlert from '#hooks/useAlert';
import { ListResponse, useLazyRequest, useRequest } from '#utils/restRequest';
import useTranslation from '#hooks/useTranslation';
import {
    PartialWorkPlan,
    workplanSchema,
    WorkPlanFormFields,
    WorkPlanResponseFields,
    WorkPlanStatus,
} from './common';
import Button from '#components/Button';
import ComponentInput from './ComponentInput';

import i18n from './i18n.json';

import styles from './styles.module.css';

interface PerProcessStatusItem {
    id: number;
    assessment: number | null;
    prioritization: number | null;
    workplan: number | null;
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { perId } = useParams<{ perId: string }>();
    const navigate = useNavigate();

    const {
        pending: perProcessStatusPending,
        response: perProcessStatusResponse,
    } = useRequest<PerProcessStatusItem>({
        skip: isNotDefined(perId),
        url: `api/v2/per-process-status/${perId}`,
    });

    const {
        response: formOptionsResponse,
    } = useRequest<WorkPlanStatus>({
        url: 'api/v2/per-options/',
    });

    const {
        response: workPlanResponse,
    } = useRequest<ListResponse<WorkPlanFormFields>>({
        url: `api/v2/per-prioritization/`,
        query: {
            limit: 500,
        },
    });

    console.warn('per', workPlanResponse?.results?.map((i) => i.component_responses));

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
        url: `api/v2/per-work-plan/${perProcessStatusResponse?.workplan}`,
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
    } = useFormArray('component_responses', setFieldValue);

    const workPlanStatusOptions = formOptionsResponse?.value;

    const handleSubmit = useCallback(
        (formValues: PartialWorkPlan) => {
            console.warn('Final Values', formValues as WorkPlanFormFields);
            if (isDefined(perProcessStatusResponse?.workplan)) {
                savePerWorkPlan(formValues as WorkPlanFormFields);
            }
        }, [savePerWorkPlan]);

    const handleAddCustomActivity = useCallback(() => {
        const newList: PartialForm<WorkPlanFormFields> = {
        };
    }, []);

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
        </form>
    );
}

Component.displayName = 'PerWorkPlan';
