import {
    ArrayError,
    useFormObject,
    SetValueArg,
    getErrorObject,
} from '@togglecorp/toggle-form';
import { DeleteBinLineIcon } from '@ifrc-go/icons';
import { randomString } from '@togglecorp/fujs';

import Button from '#components/Button';
import NumberInput from '#components/NumberInput';
import SelectInput from '#components/SelectInput';
import { PartialActionSupplyItem } from '../../../schema';

import styles from './styles.module.css';

const keySelector = (item: { id: number }) => String(item.id);
const labelSelector = (item: { title: string }) => item.title;

interface Props {
    onChange: (value: SetValueArg<PartialActionSupplyItem>, index: number) => void;
    index: number;
    value: PartialActionSupplyItem;
    options: {
        id: number;
        title: string;
    }[] | undefined;
    error: ArrayError<PartialActionSupplyItem> | undefined;
    onRemove: (index: number) => void;
}

function ActionSupplyInput(props: Props) {
    const {
        index,
        value,
        onChange,
        error: errorFromProps,
        options,
        onRemove,
    } = props;

    const setFieldValue = useFormObject(index, onChange, {
        client_id: randomString(),
    });
    const error = (value && value.client_id && errorFromProps)
        ? getErrorObject(errorFromProps[value.client_id])
        : undefined;

    return (
        <div className={styles.actionSupplyInput}>
            <SelectInput
                label="Supply"
                name="supply_action"
                value={value?.supply_action ? String(value?.supply_action) : undefined}
                error={error?.supply_action}
                options={options}
                keySelector={keySelector}
                labelSelector={labelSelector}
                onChange={setFieldValue}
            />
            <NumberInput
                label="Count"
                name="supply_value"
                value={value?.supply_value}
                error={error?.supply_value}
                onChange={setFieldValue}
            />
            <Button
                name={index}
                variant="tertiary"
                onClick={onRemove}
            >
                <DeleteBinLineIcon />
            </Button>
        </div>
    );
}

export default ActionSupplyInput;
