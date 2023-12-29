import { DeleteBinLineIcon } from '@ifrc-go/icons';
import {
    IconButton,
    NumberInput,
    SelectInput,
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

import { type PartialActionSupplyItem } from '../../../schema';

import i18n from './i18n.json';
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

    const strings = useTranslation(i18n);

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
                label={strings.actionSupplyLabel}
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
                label={strings.actionSupplyValueLabel}
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
                ariaLabel={strings.actionRemoveLabel}
                title={strings.actionRemoveLabel}
                onClick={onRemove}
                disabled={disabled}
            >
                <DeleteBinLineIcon />
            </IconButton>
        </div>
    );
}

export default ActionSupplyInput;
