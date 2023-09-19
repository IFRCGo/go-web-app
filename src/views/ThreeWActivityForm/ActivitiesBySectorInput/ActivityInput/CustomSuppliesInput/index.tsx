import {
    useFormObject,
    getErrorObject,
    type SetValueArg,
    type ArrayError,
} from '@togglecorp/toggle-form';
import { DeleteBinLineIcon } from '@ifrc-go/icons';
import { randomString } from '@togglecorp/fujs';

import IconButton from '#components/IconButton';
import NonFieldError from '#components/NonFieldError';
import NumberInput from '#components/NumberInput';
import TextInput from '#components/TextInput';
import { type PartialCustomSupplyItem } from '../../../schema';

import styles from './styles.module.css';

interface Props {
    onChange: (value: SetValueArg<PartialCustomSupplyItem>, index: number) => void;
    index: number;
    value: PartialCustomSupplyItem;
    error: ArrayError<PartialCustomSupplyItem> | undefined;
    onRemove: (index: number) => void;
    disabled?: boolean;
}

function CustomSupplyInput(props: Props) {
    const {
        index,
        value,
        onChange,
        error: errorFromProps,
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
        <div className={styles.customSupplyInput}>
            <NonFieldError error={error} />
            <TextInput
                // FIXME: Add translation
                label="Supply"
                name="supply_label"
                value={value?.supply_label}
                error={error?.supply_label}
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
                title="Remove custom supply"
                // FIXME: Add translation
                ariaLabel="Remove custom supply"
                onClick={onRemove}
                disabled={disabled}
            >
                <DeleteBinLineIcon />
            </IconButton>
        </div>
    );
}

export default CustomSupplyInput;
