import { useMemo, useCallback } from 'react';
import {
    getErrorObject,
    useFormArray,
    type ArrayError,
    type SetValueArg,
} from '@togglecorp/toggle-form';
import { DeleteBinLineIcon } from '@ifrc-go/icons';
import {
    _cs,
    isDefined,
    isNotDefined,
    randomString,
} from '@togglecorp/fujs';

import IconButton from '#components/IconButton';
import NonFieldError from '#components/NonFieldError';
import GoMultiFileInput, {
    type SupportedPaths,
} from '#components/domain/GoMultiFileInput';
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
    url: SupportedPaths;
    value: Value[] | null | undefined;
    onChange: (value: SetValueArg<Value[] | undefined>, name: N) => void;
    error: ArrayError<Value> | undefined;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    label: React.ReactNode;
    icons?: React.ReactNode;
    disabled?: boolean;
    actions?: React.ReactNode;
}

function MultiImageWithCaptionInput<const N extends string | number>(props: Props<N>) {
    const {
        className,
        name,
        value,
        url,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        onChange,
        error: formError,
        label,
        icons,
        disabled,
        actions,
    } = props;

    const error = getErrorObject(formError);

    const {
        setValue: setFieldValue,
        removeValue,
    } = useFormArray(name, onChange);

    // NOTE: This is copied from DREF Application form, this component
    // should be reused
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

    const fileInputValue = useMemo(() => (
        value
            ?.map((fileValue) => fileValue.id)
            .filter(isDefined)
    ), [value]);

    return (
        <div className={_cs(styles.multiImageWithCaptionInput, className)}>
            <NonFieldError error={error} />
            <GoMultiFileInput
                name="id"
                accept="image/*"
                value={fileInputValue}
                onChange={handleFileInputChange}
                url={url}
                fileIdToUrlMap={fileIdToUrlMap}
                setFileIdToUrlMap={setFileIdToUrlMap}
                icons={icons}
                actions={actions}
                hidePreview
                disabled={disabled}
            >
                {label}
            </GoMultiFileInput>
            {value && value.length > 0 && (
                <div className={styles.fileList}>
                    {value?.map((fileValue, index) => {
                        // NOTE: Not sure why this is here, need to
                        // talk with @frozenhelium
                        if (isNotDefined(fileValue.id)) {
                            return null;
                        }

                        // TODO: improve styling
                        return (
                            <div
                                // FIXME: create a component for preview
                                className={styles.previewAndCaption}
                                key={fileValue.id}
                            >
                                <IconButton
                                    className={styles.removeButton}
                                    name={index}
                                    onClick={removeValue}
                                    // FIXME: Use translations
                                    title="Remove"
                                    // FIXME: Use translations
                                    ariaLabel="Remove"
                                    variant="secondary"
                                    spacing="none"
                                    disabled={disabled}
                                >
                                    <DeleteBinLineIcon />
                                </IconButton>
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
                                    disabled={disabled}
                                    error={getErrorObject(error?.[fileValue.client_id])?.caption}
                                    // FIXME: use translation
                                    placeholder="Enter Caption"
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
