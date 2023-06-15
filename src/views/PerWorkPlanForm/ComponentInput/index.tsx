import { IoTrash } from 'react-icons/io5';
import {
    SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';
import { _cs } from '@togglecorp/fujs';
import { PartialWorkPlan, WorkPlanCustomItem } from '../common';
import Container from '#components/Container';
import TextArea from '#components/TextArea';
import DateInput from '#components/DateInput';
import SelectInput from '#components/SelectInput';
import Button from '#components/Button';

import styles from './styles.module.css';

type Value = NonNullable<PartialWorkPlan['component_responses']>[number];

interface Props {
    className?: string;
    component: WorkPlanCustomItem;
    onChange: (value: SetValueArg<Value>, index: number | undefined) => void;
    index: number | undefined;
    value: Value | undefined | null;
    workPlanStatusOptions: string;
}

function ComponentInput(props: Props) {
    const {
        className,
        onChange,
        index,
        value,
        component,
        workPlanStatusOptions,
    } = props;

    const setFieldValue = useFormObject(
        index,
        onChange,
        () => ({
            component: component_id.id,
        }),
    );

    return (
        <Container
            childrenContainerClassName={styles.workPlanTable}
        >
            Component 1:
            <TextArea
                name="actions"
                value={value?.actions}
                onChange={setFieldValue}
                placeholder="List the actions"
            />
            <DateInput
                name="due_date"
                value={value?.due_date}
                onChange={setFieldValue}
            />
            <SelectInput
                name="status"
                options={undefined}
                onChange={setFieldValue}
                keySelector={(d) => d.key}
                labelSelector={(d) => d.value}
                value={undefined}
            />
            <SelectInput
                name="status"
                options={workPlanStatusOptions}
                onChange={setFieldValue}
                keySelector={(d) => d.key}
                labelSelector={(d) => d.value}
                value={value?.status}
            />
            <Button
                className={styles.removeButton}
                name="select"
                // onRemove={onRemove}
                variant="tertiary"
            >
                <IoTrash />
            </Button>
        </Container>
    );
}

export default ComponentInput;
