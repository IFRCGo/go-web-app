import {
    useFormObject,
    getErrorObject,
    type SetValueArg,
    type ArrayError,
} from '@togglecorp/toggle-form';
import { DeleteBinLineIcon } from '@ifrc-go/icons';
import { randomString } from '@togglecorp/fujs';

import IconButton from '#components/IconButton';
import NumberInput from '#components/NumberInput';
import NonFieldError from '#components/NonFieldError';
import SelectInput from '#components/SelectInput';
import { type PartialActionSupplyItem } from '../../../schema';

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
    disabled?: boolean;
}

function ActionSupplyInput(props: Props) {
    const {
        index,
        value,
        onChange,
        error: errorFromProps,
        options,
        onRemove,
        disabled,
    } = props;

    const setFieldValue = useFormObject(index, onChange, () => ({
        client_id: randomString(),
    }));

    const error = (value && value.client_id && errorFromProps)
        ? getErrorObject(errorFromProps[value.client_id])
        : undefined;

    return (
        <div className={styles.actionSupplyInput}>
            <NonFieldError error={error} />
            <SelectInput
                // FIXME: Add translation
                label="Supply"
                name="supply_action"
                value={value?.supply_action}
                error={error?.supply_action}
                options={options}
                keySelector={keySelector}
                labelSelector={labelSelector}
                onChange={setFieldValue}
                disabled={disabled}
                withAsterisk
            />
            <NumberInput
                // FIXME: Add translation
                label="Count"
                name="supply_value"
                value={value?.supply_value}
                error={error?.supply_value}
                onChange={setFieldValue}
                disabled={disabled}
                withAsterisk
            />
            <IconButton
                name={index}
                variant="tertiary"
                // FIXME: Add translation
                ariaLabel="Remove"
                // FIXME: Add translation
                title="Remove"
                onClick={onRemove}
                disabled={disabled}
            >
                <DeleteBinLineIcon />
            </IconButton>
        </div>
    );
}

export default ActionSupplyInput;
