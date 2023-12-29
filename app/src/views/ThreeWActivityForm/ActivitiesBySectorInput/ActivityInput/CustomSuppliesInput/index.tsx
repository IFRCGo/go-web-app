import { DeleteBinLineIcon } from '@ifrc-go/icons';
import {
    IconButton,
    NumberInput,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { randomString } from '@togglecorp/fujs';
import {
    type ArrayError,
    getErrorObject,
    type SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';

import { type PartialCustomSupplyItem } from '../../../schema';

import i18n from './i18n.json';
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

    const strings = useTranslation(i18n);

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
                label={strings.supplyLabel}
                name="supply_label"
                value={value?.supply_label}
                error={error?.supply_label}
                onChange={setFieldValue}
                disabled={disabled}
                withAsterisk
            />
            <NumberInput
                label={strings.supplyValueLabel}
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
                title={strings.removeCustomSupplyLabel}
                ariaLabel={strings.removeCustomSupplyLabel}
                onClick={onRemove}
                disabled={disabled}
            >
                <DeleteBinLineIcon />
            </IconButton>
        </div>
    );
}

export default CustomSupplyInput;
