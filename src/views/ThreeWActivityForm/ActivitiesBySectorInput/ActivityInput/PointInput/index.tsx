import {
    useFormObject,
    getErrorObject,
    type SetValueArg,
    type ArrayError,
} from '@togglecorp/toggle-form';
import { DeleteBinLineIcon } from '@ifrc-go/icons';
import { randomString } from '@togglecorp/fujs';

import useTranslation from '#hooks/useTranslation';
import IconButton from '#components/IconButton';
import NonFieldError from '#components/NonFieldError';
import NumberInput from '#components/NumberInput';
import TextInput from '#components/TextInput';
import { type PartialPointItem } from '../../../schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    onChange: (value: SetValueArg<PartialPointItem>, index: number) => void;
    index: number;
    value: PartialPointItem;
    error: ArrayError<PartialPointItem> | undefined;
    onRemove: (index: number) => void;
    disabled?: boolean;
}

function PointInput(props: Props) {
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
        <div className={styles.pointInput}>
            <NonFieldError error={error} />
            <TextInput
                className={styles.descriptionInput}
                label={strings.descriptionLabel}
                name="description"
                value={value?.description}
                error={error?.description}
                onChange={setFieldValue}
                disabled={disabled}
                withAsterisk
            />
            <NumberInput
                className={styles.locationInput}
                label={strings.latitudeLabel}
                name="latitude"
                value={value?.latitude}
                error={error?.latitude}
                onChange={setFieldValue}
                disabled={disabled}
                withAsterisk
            />
            <NumberInput
                className={styles.locationInput}
                label={strings.longitudeLabel}
                name="longitude"
                value={value?.longitude}
                error={error?.longitude}
                onChange={setFieldValue}
                disabled={disabled}
                withAsterisk
            />
            <IconButton
                className={styles.removeButton}
                name={index}
                variant="tertiary"
                title={strings.removeLabel}
                ariaLabel={strings.removeLabel}
                onClick={onRemove}
                disabled={disabled}
            >
                <DeleteBinLineIcon />
            </IconButton>
        </div>
    );
}

export default PointInput;
