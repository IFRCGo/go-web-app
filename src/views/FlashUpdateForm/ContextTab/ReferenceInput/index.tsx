import React from 'react';
import { randomString } from '@togglecorp/fujs';
import {
    ArrayError,
    useFormObject,
    type SetValueArg,
    getErrorObject,
} from '@togglecorp/toggle-form';
import { DeleteBinLineIcon } from '@ifrc-go/icons';

import DateInput from '#components/DateInput';
import TextInput from '#components/TextInput';
import IconButton from '#components/IconButton';
import GoSingleFileInput from '#components/domain/GoSingleFileInput';
import useTranslation from '#hooks/useTranslation';

import { PartialReferenceType } from '../../schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

const defaultFormValues: PartialReferenceType = {
    client_id: randomString(),
};

interface Props {
    value: PartialReferenceType;
    error: ArrayError<PartialReferenceType> | undefined;
    onChange: (value: SetValueArg<PartialReferenceType>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}

function ReferenceInput(props: Props) {
    const {
        error: errorFromProps,
        onChange,
        value,
        index,
        onRemove,
        fileIdToUrlMap,
        setFileIdToUrlMap,
    } = props;
    const strings = useTranslation(i18n);

    const onValueChange = useFormObject(index, onChange, defaultFormValues);
    const error = (value && value?.client_id && errorFromProps)
        ? getErrorObject(errorFromProps?.[value?.client_id])
        : undefined;

    return (
        <div className={styles.reference}>
            <div className={styles.firstColumn}>
                <DateInput
                    className={styles.inputDate}
                    name="date"
                    value={value?.date}
                    onChange={onValueChange}
                    error={error?.date}
                    label={strings.flashUpdateFormContextReferenceDateLabel}
                />
                <TextInput
                    className={styles.inputName}
                    name="source_description"
                    value={value?.source_description}
                    onChange={onValueChange}
                    error={error?.source_description}
                    label={strings.flashUpdateFormContextReferenceNameLabel}
                />
                <TextInput
                    className={styles.inputUrl}
                    label={strings.flashUpdateFormContextReferenceUrlLabel}
                    name="url"
                    value={value?.url}
                    onChange={onValueChange}
                    error={error?.url}
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
                >
                    <DeleteBinLineIcon />
                </IconButton>
            </div>
        </div>
    );
}

export default ReferenceInput;
