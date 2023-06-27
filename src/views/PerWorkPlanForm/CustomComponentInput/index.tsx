import { useMemo } from 'react';
import { DeleteBinLineIcon } from '@ifrc-go/icons';
import {
    SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';
import { randomString } from '@togglecorp/fujs';

import useTranslation from '#hooks/useTranslation';
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

import i18n from '../i18n.json';

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

    const strings = useTranslation(i18n);

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
                placeholder={strings.perFormActionsPlaceholder}
                rows={2}
            />
            <DateInput
                name="due_date"
                value={value?.due_date}
                onChange={onFieldChange}
            />
            <SelectInput
                name="supported_by"
                placeholder={strings.perFormSelectNSPlaceholder}
                options={nsOptions}
                onChange={onFieldChange}
                keySelector={numericValueSelector}
                labelSelector={stringLabelSelector}
                value={value?.supported_by}
            />
            <SelectInput
                name="status"
                placeholder={strings.perFormSelectStatusLabel}
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
                    actions={<DeleteBinLineIcon />}
                >
                    {strings.perFormRemoveButton}
                </Button>
            </div>
        </>
    );
}

export default CustomComponentInput;
