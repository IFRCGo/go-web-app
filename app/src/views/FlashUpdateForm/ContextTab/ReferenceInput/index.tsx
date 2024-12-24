import React from 'react';
import { DeleteBinLineIcon } from '@ifrc-go/icons';
import {
    DateInput,
    IconButton,
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

import GoSingleFileInput from '#components/domain/GoSingleFileInput';
import NonFieldError from '#components/NonFieldError';

import { type PartialReferenceType } from '../../schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    value: PartialReferenceType;
    // FIXME: Only pass error for this object
    error: ArrayError<PartialReferenceType> | undefined;
    onChange: (value: SetValueArg<PartialReferenceType>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    disabled?: boolean;
}

function ReferenceInput(props: Props) {
    const {
        error: errorFromProps,
        onChange,
        value,
        index,
        onRemove,
        disabled,
        fileIdToUrlMap,
        setFileIdToUrlMap,
    } = props;
    const strings = useTranslation(i18n);

    const onValueChange = useFormObject(index, onChange, () => ({
        client_id: randomString(),
    }));

    const error = (value && value?.client_id && errorFromProps)
        ? getErrorObject(errorFromProps?.[value?.client_id])
        : undefined;

    return (
        <div className={styles.reference}>
            <NonFieldError error={error} />
            <div className={styles.firstColumn}>
                <DateInput
                    className={styles.inputDate}
                    name="date"
                    value={value?.date}
                    onChange={onValueChange}
                    error={error?.date}
                    label={strings.flashUpdateFormContextReferenceDateLabel}
                    disabled={disabled}
                    withAsterisk
                />
                <TextInput
                    className={styles.inputName}
                    name="source_description"
                    value={value?.source_description}
                    onChange={onValueChange}
                    error={error?.source_description}
                    label={strings.flashUpdateFormContextReferenceNameLabel}
                    disabled={disabled}
                    withAsterisk
                />
                <TextInput
                    className={styles.inputUrl}
                    label={strings.flashUpdateFormContextReferenceUrlLabel}
                    name="url"
                    value={value?.url}
                    onChange={onValueChange}
                    error={error?.url}
                    disabled={disabled}
                />
            </div>
            <div className={styles.secondColumn}>
                <GoSingleFileInput
                    name="document"
                    url="/api/v2/flash-update-file/"
                    value={value?.document}
                    onChange={onValueChange}
                    fileIdToUrlMap={fileIdToUrlMap}
                    setFileIdToUrlMap={setFileIdToUrlMap}
                    error={error?.document}
                    disabled={disabled}
                    clearable
                >
                    {strings.uploadDocumentButtonTitle}
                </GoSingleFileInput>
            </div>
            <div className={styles.actions}>
                <IconButton
                    className={styles.removeButton}
                    name={index}
                    ariaLabel={strings.deleteButtonTitle}
                    title={strings.deleteButtonTitle}
                    onClick={onRemove}
                    variant="tertiary"
                    disabled={disabled}
                >
                    <DeleteBinLineIcon />
                </IconButton>
            </div>
        </div>
    );
}

export default ReferenceInput;
