// import { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    PartialForm,
    ArrayError,
    useFormObject,
    getErrorObject,
} from '@togglecorp/toggle-form';

import { SetValueArg } from '#types/common';
import TextInput from '#components/TextInput';
import { FileWithCaption } from '#views/DrefApplicationForm/common';
// import { Preview } from '#components/GoFileInput';

import styles from './styles.module.css';

type GraphicsType = PartialForm<FileWithCaption>;
const defaultValue: GraphicsType = {};

interface Props {
    className?: string;
    value: GraphicsType;
    error: ArrayError<FileWithCaption> | undefined;
    onChange: (value: SetValueArg<GraphicsType>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    fileIdToUrlMap: Record<number, string>
}

function CaptionInput(props: Props) {
    const {
        value,
        error: errorFromProps,
        onChange,
        // onRemove,
        index,
        className,
        // fileIdToUrlMap,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultValue);
    const error = (value && value.client_id && errorFromProps)
        ? getErrorObject(errorFromProps?.[value.client_id])
        : undefined;

    /*
       const fileUrl = useMemo(
       () => (value?.id ? fileIdToUrlMap[value.id] : undefined),
       [value, fileIdToUrlMap],
       );
     */

    return (
        <div className={_cs(styles.imageInput, className)}>
            {/*
                <Preview
                id={index}
                file={fileUrl}
                onRemoveButtonClick={onRemove}
                />
              */}
            <TextInput
                className={styles.captionInput}
                name="caption"
                value={value?.caption}
                error={error?.caption}
                onChange={onFieldChange}
                placeholder="Enter a caption"
            />
        </div>
    );
}

export default CaptionInput;
