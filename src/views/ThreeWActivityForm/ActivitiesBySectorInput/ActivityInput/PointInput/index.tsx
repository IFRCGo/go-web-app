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
import TextInput from '#components/TextInput';
import { PartialPointItem } from '../../../schema';

import styles from './styles.module.css';

interface Props {
    onChange: (value: SetValueArg<PartialPointItem>, index: number) => void;
    index: number;
    value: PartialPointItem;
    error: ArrayError<PartialPointItem> | undefined;
    onRemove: (index: number) => void;
}

function PointInput(props: Props) {
    const {
        index,
        value,
        onChange,
        error: errorFromProps,
        onRemove,
    } = props;

    const setFieldValue = useFormObject(index, onChange, {
        client_id: randomString(),
    });
    const error = (value && value.client_id && errorFromProps)
        ? getErrorObject(errorFromProps[value.client_id])
        : undefined;

    return (
        <div className={styles.pointInput}>
            <TextInput
                className={styles.descriptionInput}
                label="Description"
                name="description"
                value={value?.description}
                error={error?.description}
                onChange={setFieldValue}
            />
            <NumberInput
                className={styles.locationInput}
                label="Latitude"
                name="latitude"
                value={value?.latitude}
                error={error?.latitude}
                onChange={setFieldValue}
            />
            <NumberInput
                className={styles.locationInput}
                label="Longitude"
                name="longitude"
                value={value?.longitude}
                error={error?.longitude}
                onChange={setFieldValue}
            />
            <Button
                className={styles.removeButton}
                name={index}
                variant="tertiary"
                onClick={onRemove}
            >
                <DeleteBinLineIcon />
            </Button>
        </div>
    );
}

export default PointInput;
