import {
    useCallback,
    useMemo,
} from 'react';
import { DeleteBinLineIcon } from '@ifrc-go/icons';
import {
    IconButton,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    _cs,
    isDefined,
    isNotDefined,
    randomString,
} from '@togglecorp/fujs';
import {
    type ArrayError,
    getErrorObject,
    type SetValueArg,
    useFormArray,
} from '@togglecorp/toggle-form';

import GoMultiFileInput, { type SupportedPaths } from '#components/domain/GoMultiFileInput';
import NonFieldError from '#components/NonFieldError';

import i18n from './i18n.json';
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
    actions?: React.ReactNode;
    disabled?: boolean;
}

// FIXME: Move this to components
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
        actions,
        disabled,
    } = props;

    const strings = useTranslation(i18n);

    const error = getErrorObject(formError);

    const {
        setValue: setFieldValue,
        removeValue,
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

    const fileInputValue = useMemo(() => (
        value
            ?.map((fileValue) => fileValue.id)
            .filter(isDefined)
    ), [value]);

    return (
        <div className={_cs(styles.multiImageWithCaptionInput, className)}>
            <NonFieldError error={error} />
            <GoMultiFileInput
                name={undefined}
                accept="image/*"
                value={fileInputValue}
                onChange={handleFileInputChange}
                url={url}
                fileIdToUrlMap={fileIdToUrlMap}
                setFileIdToUrlMap={setFileIdToUrlMap}
                icons={icons}
                actions={actions}
                withoutPreview
                disabled={disabled}
            >
                {label}
            </GoMultiFileInput>
            {value && value.length > 0 && (
                <div className={styles.fileList}>
                    {value?.map((fileValue, index) => {
                        // NOTE: Not sure why this is here, need to
                        // TODO: talk with @frozenhelium
                        if (isNotDefined(fileValue.id)) {
                            return null;
                        }

                        const imageError = getErrorObject(error?.[fileValue.client_id]);

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
                                    title={strings.removeImagesButtonTitle}
                                    ariaLabel={strings.removeImagesButtonTitle}
                                    variant="secondary"
                                    spacing="none"
                                    disabled={disabled}
                                >
                                    <DeleteBinLineIcon />
                                </IconButton>
                                <NonFieldError
                                    error={imageError}
                                />
                                <img
                                    className={styles.preview}
                                    alt={strings.imagePreviewAlt}
                                    src={fileIdToUrlMap[fileValue.id]}
                                />
                                <TextInput
                                    className={styles.captionInput}
                                    name={index}
                                    value={fileValue?.caption}
                                    onChange={handleCaptionChange}
                                    error={imageError?.caption}
                                    placeholder={strings.enterCaptionPlaceholder}
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
