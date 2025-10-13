import { useCallback } from 'react';
import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import {
    Button,
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
import { formatSourceLink } from '#utils/common';
import { type PartialDref } from '#views/DrefApplicationForm/schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

type SourceInformationFormFields = NonNullable<
    PartialDref['source_information']
>[number];

interface Props {
    value: SourceInformationFormFields;
    error: ArrayError<SourceInformationFormFields> | undefined;
    onChange: (
        value: SetValueArg<SourceInformationFormFields>,
        index: number
    ) => void;
    onRemove: (index: number) => void;
    index: number;
    disabled?: boolean;
    readOnly?: boolean;
}

function SourceInformationInput(props: Props) {
    const {
        error: errorFromProps,
        onChange,
        value,
        index,
        onRemove,
        disabled,
        readOnly,
    } = props;

    const strings = useTranslation(i18n);

    const onFieldChange = useFormObject(index, onChange, () => ({
        client_id: randomString(),
    }));

    const error = value && value.client_id && errorFromProps
        ? getErrorObject(errorFromProps?.[value.client_id])
        : undefined;

    const handleSourceFieldChange = useCallback(
        (linkValue: string | undefined) => {
            onFieldChange(formatSourceLink(linkValue), 'source_link');
        },
        [onFieldChange],
    );

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
                readOnly={readOnly}
                disabled={disabled}
            />
            <TextInput
                className={styles.input}
                label={strings.sourceInformationLinkLabel}
                name="source_link"
                value={value.source_link}
                error={error?.source_link}
                onChange={handleSourceFieldChange}
                readOnly={readOnly}
                disabled={disabled}
            />
            <Button
                className={styles.removeButton}
                name={index}
                onClick={onRemove}
                styleVariant="action"
                disabled={disabled || readOnly}
                title={strings.sourceInformationDeleteButton}
            >
                <DeleteBinTwoLineIcon />
            </Button>
        </div>
    );
}

export default SourceInformationInput;
