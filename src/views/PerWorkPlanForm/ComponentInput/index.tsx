import {
    SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';
import { _cs } from '@togglecorp/fujs';

import { PerFormComponentItem } from '#views/PerPrioritizationForm/common';
import Container from '#components/Container';
import DateInput from '#components/DateInput';
import SelectInput from '#components/SelectInput';
import TextInput from '#components/TextInput';
import { LabelValue } from '#types/common';

import {
    PartialWorkPlan,
    numericValueSelector,
    stringLabelSelector,
} from '../common';
import styles from './styles.module.css';

type Value = NonNullable<PartialWorkPlan['component_responses']>[number];

interface Props {
    value?: Value;
    onChange: (value: SetValueArg<Value>, index: number | undefined) => void;
    index: number;
    component: PerFormComponentItem;
    workPlanStatusOptions?: LabelValue[];
}

function ComponentInput(props: Props) {
    const {
        onChange,
        index,
        value,
        component,
        workPlanStatusOptions,
    } = props;

    console.info('componnent', component);

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
            <div>
                {`${component?.component_num} ${component?.title}`}
            </div>
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
            <SelectInput
                name="status"
                options={workPlanStatusOptions}
                onChange={onFieldChange}
                keySelector={numericValueSelector}
                labelSelector={stringLabelSelector}
                value={value?.status}
            />
        </Container>
    );
}

export default ComponentInput;
