import { useCallback } from 'react';
import { randomString, _cs } from '@togglecorp/fujs';
import {
    PartialForm,
    createSubmitHandler,
    useForm,
} from '@togglecorp/toggle-form';
import { IoAdd, IoTrash } from 'react-icons/io5';

import Container from '#components/Container';
import DateInput from '#components/DateInput';
import SelectInput from '#components/SelectInput';
import Button from '#components/Button';
import TextArea from '#components/TextArea';

import { useRequest } from '#utils/restRequest';
import useTranslation from '#hooks/useTranslation';
import {
    PartialWorkPlan,
    workplanSchema,
    WorkPlanForm,
} from './common';
import i18n from './i18n.json';

import styles from './styles.module.css';

interface FormStatusOptions {
    workplanstatus: {
        key: number;
        value: string;
    }[];
}

interface Props {
    className?: string;
}

// eslint-disable-next-line import/prefer-default-export
export function Component(props: Props) {
    const strings = useTranslation(i18n);

    const {
        className,
    } = props;

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

    const {
        response: formOptions,
    } = useRequest<FormStatusOptions>({
        url: 'api/v2/per-options/',
    });

    const workPlanStatusOptions = formOptions?.workplanstatus;

    const handleSubmit = useCallback((finalValues: PartialWorkPlan) => {
        console.warn('finalValues', finalValues);
    }, []);

    const handleAddCustomActivity = useCallback(() => {
        const newList: PartialForm<WorkPlanForm> = {
        };
    }, []);

    return (
        <form
            onSubmit={createSubmitHandler(validate, onErrorSet, handleSubmit)}
        >
            <Container
                className={_cs(styles.strategicPrioritiesTable, className)}
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
                                />
                            </td>
                            <td>
                                <DateInput
                                    name="due_date"
                                    value={value?.due_date}
                                    onChange={setFieldValue}
                                />
                            </td>
                            <td>
                                <SelectInput
                                    name="status"
                                    options={undefined}
                                    onChange={setFieldValue}
                                    value={undefined}
                                />
                            </td>
                            <td>
                                <SelectInput
                                    name="status"
                                    options={workPlanStatusOptions}
                                    onChange={setFieldValue}
                                    keySelector={(d) => d.key}
                                    labelSelector={(d) => d.value}
                                    value={value?.status}
                                />
                            </td>

                            <td>
                                <Button
                                    className={styles.removeButton}
                                    name="select"
                                    // onRemove={onRemove}
                                    variant="tertiary"
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

Component.displayName = 'PerWorkPlan';
