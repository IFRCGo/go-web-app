import { useMemo } from 'react';
import { IoTrash } from 'react-icons/io5';
import {
    SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';
import { randomString } from '@togglecorp/fujs';

import DateInput from '#components/DateInput';
import SelectInput from '#components/SelectInput';
import { LabelValue } from '#types/common';
import Button from '#components/Button';
import TextArea from '#components/TextArea';

import {
    numericValueSelector,
    stringLabelSelector,
    PartialWorkPlan,
} from '../common';

type Value = NonNullable<PartialWorkPlan['custom_component_responses']>[number];

interface Props {
    value: Value;
    onChange: (value: SetValueArg<Value>, index: number | undefined) => void;
    index: number;
    onRemove: (index: number) => void;
    workPlanStatusOptions: LabelValue[];
    nsOptions?: {
        label: string;
        value: number;
    }[];
}

function CustomComponentInput(props: Props) {
    const {
        onChange,
        index,
        onRemove,
        value,
        workPlanStatusOptions,
        nsOptions,
    } = props;

    const defaultValue = useMemo(
        () => ({
            client_id: randomString(),
        }),
        [],
    );

    const onFieldChange = useFormObject(
        index,
        onChange,
        defaultValue,
    );

    return (
        <>
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
                name="supported_by"
                placeholder="Select NS"
                options={nsOptions}
                onChange={onFieldChange}
                keySelector={numericValueSelector}
                labelSelector={stringLabelSelector}
                value={value?.supported_by}
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
            <div>
                <Button
                    name={index}
                    onClick={onRemove}
                    variant="secondary"
                    actions={<IoTrash />}
                >
                    Remove
                </Button>
            </div>
        </>
    );
}

export default CustomComponentInput;
