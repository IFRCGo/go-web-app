import {
    SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import { PerFormComponentItem } from '#views/PerPrioritizationForm/common';
import DateInput from '#components/DateInput';
import SelectInput from '#components/SelectInput';
import TextArea from '#components/TextArea';
import { LabelValue } from '#types/common';

import {
    PartialWorkPlan,
    numericValueSelector,
    stringLabelSelector,
} from '../common';

type Value = NonNullable<PartialWorkPlan['component_responses']>[number];

interface Props {
    value?: Value;
    onChange: (value: SetValueArg<Value>, index: number | undefined) => void;
    index: number;
    component: PerFormComponentItem;
    workPlanStatusOptions?: LabelValue[];
    nsOptions?: {
        label: string;
        value: number;
    }[];
}

function ComponentInput(props: Props) {
    const {
        onChange,
        index,
        value,
        component,
        workPlanStatusOptions,
        nsOptions,
    } = props;

    const onFieldChange = useFormObject(
        index,
        onChange,
        () => ({
            component: component.id,
        }),
    );

    return (
        <>
            <div>
                {`${component?.component_num}. ${component?.title}`}
            </div>
            <TextArea
                name="actions"
                value={value?.actions}
                onChange={onFieldChange}
                placeholder="List the actions"
                rows={2}
            />
            <DateInput
                name="due_date"
                value={value?.due_date}
                onChange={onFieldChange}
            />
            <SelectInput
                name="supported_by_id"
                placeholder="Select NS"
                options={nsOptions}
                onChange={onFieldChange}
                keySelector={numericValueSelector}
                labelSelector={stringLabelSelector}
                value={value?.supported_by_id}
            />
            <SelectInput
                name="status"
                placeholder="Select status"
                options={workPlanStatusOptions}
                onChange={onFieldChange}
                keySelector={numericValueSelector}
                labelSelector={stringLabelSelector}
                value={value?.status}
            />
        </>
    );
}

export default ComponentInput;
