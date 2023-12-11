import {
    type ArrayError,
    useFormObject,
    getErrorObject,
    type SetValueArg,
} from '@togglecorp/toggle-form';
import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import { randomString } from '@togglecorp/fujs';

import Button from '#components/Button';
import NonFieldError from '#components/NonFieldError';
import TextInput from '#components/TextInput';
import useTranslation from '#hooks/useTranslation';

import { type PartialDref } from '../../schema';
import i18n from './i18n.json';
import styles from './styles.module.css';

type SourceInformationFormFields = NonNullable<PartialDref['source_information']>[number];

interface Props {
    value: SourceInformationFormFields;
    error: ArrayError<SourceInformationFormFields> | undefined;
    onChange: (value: SetValueArg<SourceInformationFormFields>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    disabled?: boolean;
}

function SourceInformationInput(props: Props) {
    const {
        error: errorFromProps,
        onChange,
        value,
        index,
        onRemove,
        disabled,
    } = props;

    const strings = useTranslation(i18n);

    const onFieldChange = useFormObject(
        index,
        onChange,
        () => ({
            client_id: randomString(),
        }),
    );

    const error = (value && value.client_id && errorFromProps)
        ? getErrorObject(errorFromProps?.[value.client_id])
        : undefined;

    return (
        <div className={styles.sourceInformationInput}>
            <NonFieldError error={error} />
            <TextInput
                className={styles.input}
                label={strings.sourceInformationNameLabel}
                name="source_name"
                value={value.source_name}
                error={error?.source_name}
                onChange={onFieldChange}
                disabled={disabled}
            />
            <TextInput
                className={styles.input}
                label={strings.sourceInformationLinkLabel}
                name="source_link"
                value={value.source_link}
                error={error?.source_link}
                onChange={onFieldChange}
                disabled={disabled}
            />
            <Button
                className={styles.removeButton}
                name={index}
                onClick={onRemove}
                variant="tertiary"
                disabled={disabled}
                title={strings.sourceInformationDeleteButton}
            >
                <DeleteBinTwoLineIcon />
            </Button>
        </div>
    );
}

export default SourceInformationInput;
