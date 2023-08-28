import React from 'react';
import { randomString } from '@togglecorp/fujs';
import {
    useFormObject,
    getErrorObject,
    type SetValueArg,
    type ArrayError,
} from '@togglecorp/toggle-form';
import { DeleteBinLineIcon } from '@ifrc-go/icons';

import DateInput from '#components/DateInput';
import NonFieldError from '#components/NonFieldError';
import TextInput from '#components/TextInput';
import IconButton from '#components/IconButton';
import GoSingleFileInput from '#components/domain/GoSingleFileInput';
import useTranslation from '#hooks/useTranslation';

import { PartialReferenceType } from '../../schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    value: PartialReferenceType;
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
                />
                <TextInput
                    className={styles.inputName}
                    name="source_description"
                    value={value?.source_description}
                    onChange={onValueChange}
                    error={error?.source_description}
                    label={strings.flashUpdateFormContextReferenceNameLabel}
                    disabled={disabled}
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
                    disabled={disabled}
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
