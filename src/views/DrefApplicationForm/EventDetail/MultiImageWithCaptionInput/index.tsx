import { useCallback } from 'react';
import {
    type ArrayError,
    getErrorObject,
    useFormArray,
    type SetValueArg,
} from '@togglecorp/toggle-form';
import {
    _cs,
    isDefined,
    isNotDefined,
    randomString,
} from '@togglecorp/fujs';

import NonFieldError from '#components/NonFieldError';
import GoMultiFileInput from '#components/domain/GoMultiFileInput';
import TextInput from '#components/TextInput';

import styles from './styles.module.css';

type Value = {
    client_id: string;
    id?: number;
    caption?: string;
};

interface Props<N> {
    className?: string;
    name: N;
    value: Value[] | null | undefined;
    onChange: (value: SetValueArg<Value[] | undefined>, name: N) => void;
    error: ArrayError<Value> | undefined;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    label: React.ReactNode;
    icons?: React.ReactNode;
    actions?: React.ReactNode;
    disabled?: boolean;
}

// FIXME: Move this to components
function MultiImageWithCaptionInput<const N extends string | number>(props: Props<N>) {
    const {
        className,
        name,
        value,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        onChange,
        error: formError,
        label,
        icons,
        actions,
        disabled,
    } = props;

    const error = getErrorObject(formError);

    const {
        setValue: setFieldValue,
    } = useFormArray(name, onChange);

    const handleFileInputChange = useCallback(
        (newValue: number[] | undefined) => {
            if (isDefined(newValue)) {
                newValue.forEach(
                    (fileId: number, index: number) => {
                        const oldValue = value?.[index];

                        if (isNotDefined(oldValue)) {
                            setFieldValue(
                                {
                                    client_id: String(fileId),
                                    id: fileId,
                                },
                                index,
                            );
                        }
                    },
                );
            }
        },
        [value, setFieldValue],
    );

    const handleCaptionChange = useCallback(
        (newValue: string | undefined, index: number) => {
            setFieldValue(
                (prevValue) => {
                    if (isNotDefined(prevValue)) {
                        return {
                            client_id: randomString(),
                            caption: newValue,
                        };
                    }

                    return {
                        ...prevValue,
                        caption: newValue,
                    };
                },
                index,
            );
        },
        [setFieldValue],
    );

    const fileInputValue = value?.map((v) => v.id).filter(isDefined);

    return (
        <div className={_cs(styles.multiImageWithCaptionInput, className)}>
            <NonFieldError
                error={error}
            />
            <GoMultiFileInput
                name={undefined}
                accept="image/*"
                value={fileInputValue}
                onChange={handleFileInputChange}
                url="/api/v2/dref-files/multiple/"
                fileIdToUrlMap={fileIdToUrlMap}
                setFileIdToUrlMap={setFileIdToUrlMap}
                icons={icons}
                actions={actions}
                withoutPreview
                disabled={disabled}
            >
                {label}
            </GoMultiFileInput>
            {value && (
                <div className={styles.fileList}>
                    {value?.map((fileValue, index) => {
                        if (isNotDefined(fileValue.id)) {
                            return null;
                        }

                        // TODO: improve styling
                        return (
                            <div
                                // FIXME: create a component for preview, implement remove
                                className={styles.previewAndCaption}
                                key={fileValue.id}
                            >
                                <img
                                    className={styles.preview}
                                    alt="preview"
                                    src={fileIdToUrlMap[fileValue.id]}
                                />
                                <TextInput
                                    className={styles.captionInput}
                                    name={index}
                                    value={fileValue?.caption}
                                    onChange={handleCaptionChange}
                                    error={getErrorObject(error?.[fileValue.client_id])?.caption}
                                    // FIXME: use translation
                                    placeholder="Enter Caption"
                                    disabled={disabled}
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default MultiImageWithCaptionInput;
