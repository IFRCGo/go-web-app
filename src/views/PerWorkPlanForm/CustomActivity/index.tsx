import { IoTrash } from 'react-icons/io5';
import {
    SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';
import { _cs } from '@togglecorp/fujs';
import { PartialWorkPlan, WorkPlanStatus } from '../common';
import Container from '#components/Container';
import DateInput from '#components/DateInput';
import SelectInput from '#components/SelectInput';
import Button from '#components/Button';
import { PerFormComponentItem } from '#views/PerPrioritizationForm/common';

import styles from './styles.module.css';
import TextInput from '#components/TextInput';

type Value = NonNullable<PartialWorkPlan['component_responses']>[number];

interface Props {
    value?: Value;
    onChange: (value: SetValueArg<Value>, index: number | undefined) => void;
    index: number;
    component: PerFormComponentItem;
    workPlanStatusOptions: WorkPlanStatus[];
}

function CustomActivity(props: Props) {
    const {
        onChange,
        index,
        value,
        component,
        workPlanStatusOptions,
    } = props;

    const onFieldChange = useFormObject(
        index,
        onChange,
        () => ({
            component: component.id,
        }),
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
                name="select"
                // onRemove={onRemove}
                variant="tertiary"
            >
                <IoTrash />
            </Button>
        </Container>
    );
}

export default CustomActivity;
