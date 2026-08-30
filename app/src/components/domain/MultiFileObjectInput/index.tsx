import {
    useCallback,
    useMemo,
} from 'react';
import { DeleteBinLineIcon } from '@ifrc-go/icons';
import {
    Description,
    IconButton,
    Image,
    InlineLayout,
    ListView,
    type NameType,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    isTruthyString,
    randomString,
} from '@togglecorp/fujs';
import {
    type ArrayError,
    getErrorObject,
    type SetValueArg,
    useFormArray,
} from '@togglecorp/toggle-form';

import GoMultiFileInput, { type Props as GoMultiFileInputProps } from '#components/domain/GoMultiFileInput';
import Link from '#components/Link';
import NonFieldError from '#components/NonFieldError';
import {
    getFileNameFromUrl,
    isImageFile,
} from '#utils/common';

import i18n from './i18n.json';
import styles from './styles.module.css';

function getFileExtension(fileName: string | undefined) {
    if (isNotDefined(fileName)) {
        return undefined;
    }

    const [, extension] = fileName.match(/\.([^.]+)$/) ?? [];

    return extension?.toUpperCase();
}

type InputValue = {
    id?: number;
    client_id: string;
    caption?: string | null;
};

type OutputValue = {
    id?: number;
    client_id: string;
    caption?: string;
};

type Props<N extends NameType> = Omit<GoMultiFileInputProps<N>, 'value' | 'onChange' | 'error'> & {
    value: InputValue[] | null | undefined;
    onChange: (value: SetValueArg<OutputValue[] | undefined>, name: N) => void;
    error: ArrayError<InputValue> | undefined;
};

function MultiFileObjectInput<const N extends NameType>(props: Props<N>) {
    const {
        className,
        name,
        value,
        onChange,
        error: formError,
        fileIdToUrlMap,
        disabled,
        readOnly,
        accept,
        description,
        ...otherProps
    } = props;

    const strings = useTranslation(i18n);

    const error = getErrorObject(formError);

    const {
        setValue: setFieldValue,
        removeValue,
    } = useFormArray(name, onChange);

    const fileInputValue = useMemo(() => (
        value
            ?.map((fileValue) => fileValue.id)
            .filter(isDefined)
    ), [value]);

    const acceptedFileFormatsDescription = useMemo(
        () => {
            if (isNotDefined(accept)) {
                return undefined;
            }

            const fileFormats = accept
                .split(',')
                .map((fileFormat) => fileFormat.trim())
                .filter(isTruthyString)
                .map((fileFormat) => (
                    fileFormat === 'image/*'
                        ? strings.imageFilesLabel
                        : fileFormat.replace(/^\./, '').toUpperCase()
                ));

            if (fileFormats.length === 0) {
                return undefined;
            }

            return resolveToString(
                strings.acceptedFileFormatsDescription,
                { fileFormats: fileFormats.join(', ') },
            );
        },
        [accept, strings],
    );

    const handleFileInputChange = useCallback(
        (newValue: number[] | undefined, inputName: N) => {
            if (isNotDefined(newValue)) {
                onChange(undefined, inputName);
                return;
            }

            newValue.forEach(
                (fileId, index) => {
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
        },
        [value, setFieldValue, onChange],
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

    return (
        <ListView
            layout="block"
            className={className}
            withSpacingOpticalCorrection
        >
            <NonFieldError error={error} />
            <GoMultiFileInput
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
                name={name}
                value={fileInputValue}
                onChange={handleFileInputChange}
                fileIdToUrlMap={fileIdToUrlMap}
                disabled={disabled}
                readOnly={readOnly}
                accept={accept}
                description={(
                    <>
                        {description}
                        {isDefined(acceptedFileFormatsDescription) && (
                            <Description
                                textSize="xs"
                                className={styles.acceptedFileFormats}
                            >
                                {acceptedFileFormatsDescription}
                            </Description>
                        )}
                    </>
                )}
                withoutPreview
            />
            {isDefined(value) && value.length > 0 && (
                <ListView
                    layout="grid"
                    numPreferredGridColumns={3}
                    spacing="sm"
                >
                    {value.map((fileValue, index) => {
                        if (isNotDefined(fileValue.id)) {
                            return null;
                        }

                        const fileError = getErrorObject(error?.[fileValue.client_id]);
                        const fileUrl = fileIdToUrlMap?.[fileValue.id];
                        const fileName = getFileNameFromUrl(fileUrl);

                        // NOTE: only the images get a preview and a caption
                        if (!isImageFile(fileUrl)) {
                            const fileExtension = getFileExtension(fileName);

                            return (
                                <ListView
                                    key={fileValue.id}
                                    layout="block"
                                    spacing="xs"
                                    withSpacingOpticalCorrection
                                    withDarkBackground
                                    withPadding
                                >
                                    <InlineLayout
                                        className={styles.deleteButton}
                                        after={(
                                            <IconButton
                                                name={index}
                                                onClick={removeValue}
                                                title={strings.removeFileButtonTitle}
                                                ariaLabel={strings.removeFileButtonTitle}
                                                variant="secondary"
                                                spacing="none"
                                                disabled={disabled || readOnly}
                                            >
                                                <DeleteBinLineIcon />
                                            </IconButton>
                                        )}
                                    />
                                    <NonFieldError error={fileError} />
                                    <div className={styles.filePreview}>
                                        {isDefined(fileExtension) && (
                                            <div className={styles.fileExtension}>
                                                {fileExtension}
                                            </div>
                                        )}
                                    </div>
                                    <Link
                                        className={styles.fileName}
                                        href={fileUrl}
                                        external
                                        withEllipsizedContent
                                        withUnderline
                                    >
                                        {fileName}
                                    </Link>
                                </ListView>
                            );
                        }

                        return (
                            <ListView
                                key={fileValue.id}
                                layout="block"
                                spacing="xs"
                                withSpacingOpticalCorrection
                                withDarkBackground
                                withPadding
                            >
                                <InlineLayout
                                    className={styles.deleteButton}
                                    after={(
                                        <IconButton
                                            name={index}
                                            onClick={removeValue}
                                            title={strings.removeFileButtonTitle}
                                            ariaLabel={strings.removeFileButtonTitle}
                                            variant="secondary"
                                            spacing="none"
                                            disabled={disabled || readOnly}
                                        >
                                            <DeleteBinLineIcon />
                                        </IconButton>
                                    )}
                                />
                                <NonFieldError error={fileError} />
                                <Image
                                    alt={strings.imagePreviewFallbackText}
                                    src={fileUrl}
                                    size="sm"
                                />
                                <TextInput
                                    name={index}
                                    value={fileValue.caption}
                                    onChange={handleCaptionChange}
                                    error={fileError?.caption}
                                    placeholder={strings.captionInputPlaceholder}
                                    disabled={disabled}
                                    readOnly={readOnly}
                                />
                            </ListView>
                        );
                    })}
                </ListView>
            )}
        </ListView>
    );
}

export default MultiFileObjectInput;
