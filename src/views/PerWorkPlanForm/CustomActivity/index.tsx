import { IoTrash } from 'react-icons/io5';
import {
    PartialForm,
    SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';
import { _cs } from '@togglecorp/fujs';
import { WorkPlanCustomItem, WorkPlanStatus } from '../common';
import Container from '#components/Container';
import DateInput from '#components/DateInput';
import SelectInput from '#components/SelectInput';
import Button from '#components/Button';
import TextInput from '#components/TextInput';

import styles from './styles.module.css';
import { useMemo } from 'react';

type Value = PartialForm<WorkPlanCustomItem>;

interface Props {
    value?: Value;
    onChange: (value: SetValueArg<Value>, index: number | undefined) => void;
    index: number;
    onRemove: (index: number) => void;
    workPlanStatusOptions: WorkPlanStatus[];
}

function CustomActivity(props: Props) {
    const {
        onChange,
        index,
        onRemove,
        value,
        workPlanStatusOptions,
    } = props;

    const defaultValue = useMemo(
        () => ({
            action: value?.actions
        }),
        [value?.actions],
    );
    const onFieldChange = useFormObject(
        index,
        onChange,
        defaultValue,
    );

    return (
        <Container
            childrenContainerClassName={styles.workPlanTable}
        >
            <TextInput
                name="actions"
                value={value?.actions}
                onChange={onFieldChange}
                placeholder="List the actions"
            />
            <DateInput
                name="due_date"
                value={value?.due_date}
                onChange={onFieldChange}
            />
            {/* <SelectInput
                name="status"
                options={undefined}
                onChange={onFieldChange}
                keySelector={(d) => d.key}
                labelSelector={(d) => d.value}
                value={undefined}
            /> */}
            <SelectInput
                name="status"
                options={workPlanStatusOptions}
                onChange={onFieldChange}
                keySelector={(d) => d.key}
                labelSelector={(d) => d.value}
                value={value?.status}
            />
            <Button
                className={styles.removeButton}
                name={index}
                onClick={onRemove}
                variant="tertiary"
            >
                <IoTrash />
            </Button>
        </Container>
    );
}

export default CustomActivity;
