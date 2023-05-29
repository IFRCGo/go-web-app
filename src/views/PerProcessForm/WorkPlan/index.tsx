import React, { useCallback } from 'react';
import { randomString, _cs } from '@togglecorp/fujs';
import {
    EntriesAsList,
    PartialForm,
    Error,
    SetBaseValueArg,
    createSubmitHandler,
    useForm,
} from '@togglecorp/toggle-form';
import { IoAdd, IoTrash } from 'react-icons/io5';

import Container from '#components/Container';
import DateInput from '#components/DateInput';
import SelectInput from '#components/SelectInput';
import Button from '#components/Button';
import { WorkPlanComponent } from '../common';
import TextArea from '#components/TextArea';

import usePerProcessOptions, { workplanSchema } from '../usePerProcessOptions';
import { useLazyRequest } from '#utils/restRequest';
import useAlertContext from '#hooks/useAlert';
import useTranslation from '#hooks/useTranslation';
import i18n from './i18n.json';

import styles from './styles.module.css';

type Value = PartialForm<WorkPlanComponent>;

interface Props {
    className?: string;
    error?: Error<Value> | undefined;
    onRemove?: (index: number) => void;
    index?: number;
    onValueSet: (value: SetBaseValueArg<Value>) => void;
    perId?: string;
    onValueChange: (...entries: EntriesAsList<Value>) => void;
}

function WorkPlanForm(props: Props) {
    const strings = useTranslation(i18n);

    const {
        className,
        onRemove,
        onValueChange,
        index,
        perId,
        onValueSet,
    } = props;

    const {
        value,
        error: formError,
        validate,
        setFieldValue,
        setError: onErrorSet,
    } = useForm(workplanSchema, { value: {} as PartialForm<WorkPlanComponent> });

    const {
        workPlanStatusOptions,
    } = usePerProcessOptions();

    const alert = useAlertContext();

    const {
        pending: perSubmitPending,
        trigger: submitRequest,
    } = useLazyRequest<WorkPlanComponent, Partial<WorkPlanComponent>>({
        url: perId ? `api/v2/per-prioritization/${perId}/` : 'api/v2/per-prioritization/',
        method: perId ? 'PUT' : 'POST',
        body: ctx => ctx,
        onSuccess: (response) => {
            alert.show(
                strings.perFormSaveRequestSuccessMessage,
                { variant: 'success' },
            );

        },
        onFailure: ({
            value: {
                messageForNotification,
                formErrors,
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

    const handleSubmit = useCallback((finalValues) => {
        console.warn('finalValues', finalValues);
        onValueSet(finalValues);
        submitRequest(finalValues);
    }, [onValueSet, submitRequest]);

    const handleAddCustomActivity = useCallback(() => {
        const newList: PartialForm<WorkPlanComponent> = {
            id: randomString(),
        };

        onValueChange(
            (oldValue: PartialForm<WorkPlanComponent>) => (
                [...(oldValue ?? []), newList]
            ),
            'component' as const,
        );
    }, [onValueChange]);

    console.warn('value', value);

    return (
        <form
            onSubmit={createSubmitHandler(validate, onErrorSet, handleSubmit)}
        >
            <Container
                className={_cs(styles.strategicPrioritiesTable, className)}
                contentClassName={styles.content}
            >
                <table>
                    <thead>
                        <tr>
                            <th>
                                {strings.perWorkPlanComponents}
                            </th>
                            <th>
                                {strings.perWorkPlanActions}
                            </th>
                            <th>
                                {strings.perWorkPlanDueDate}
                            </th>
                            <th>
                                {strings.perWorkPlanSupportedBy}
                            </th>
                            <th>
                                {strings.perWorkPlanStatus}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                Component 1:
                            </td>
                            <td>
                                <TextArea
                                    name="actions"
                                    value={value?.actions}
                                    onChange={setFieldValue}
                                    placeholder="List the actions"
                                >
                                </TextArea>
                            </td>
                            <td>
                                <DateInput
                                    name="due_date"
                                    value={value?.due_date}
                                    onChange={setFieldValue}
                                >
                                </DateInput>
                            </td>
                            <td>
                                <SelectInput
                                    name='status'
                                    options={undefined}
                                    keySelector={(d) => d.value}
                                    labelSelector={(d) => d.label}
                                    onChange={setFieldValue}
                                    value={value?.status}
                                />
                            </td>
                            <td>
                                <SelectInput
                                    name='status'
                                    options={workPlanStatusOptions}
                                    onChange={setFieldValue}
                                    keySelector={(d) => d.value}
                                    labelSelector={(d) => d.label}
                                    value={value?.status}
                                />
                            </td>

                            <td>
                                <Button
                                    className={styles.removeButton}
                                    name="select"
                                    // onRemove={onRemove}
                                    variant="action"
                                >
                                    <IoTrash />
                                </Button>
                            </td>
                        </tr>
                    </tbody>
                    <Button
                        name={undefined}
                        variant="secondary"
                        onClick={handleAddCustomActivity}
                        icons={<IoAdd />}
                    >
                        Add row
                    </Button>
                </table>
            </Container>
        </form>
    );
}

export default WorkPlanForm;
