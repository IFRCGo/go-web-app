import React, {
    useCallback,
    useRef,
} from 'react';
import {
    DeleteBinFillIcon,
    DeleteBinLineIcon,
} from '@ifrc-go/icons';
import {
    Button,
    type CommonRawFileInputProps,
    Description,
    IconButton,
    InlineLayout,
    InputError,
    ListView,
    type NameType,
    RawFileInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { nonFieldError } from '@togglecorp/toggle-form';

import Link from '#components/Link';
import useAlert from '#hooks/useAlert';
import { useLazyRequest } from '#utils/restRequest';
import { transformObjectError } from '#utils/restRequest/error';

import i18n from './i18n.json';

export type SupportedPaths = '/api/v2/per-file/multiple/' | '/api/v2/dref-files/multiple/' | '/api/v2/flash-update-file/multiple/' | '/api/v2/eap-file/multiple/';

interface FileUploadResult {
    id: number;
    file: string;
}

const keySelector = (d: FileUploadResult) => d.id;
const valueSelector = (d: FileUploadResult) => d.file;

function getFileNameFromUrl(urlString: string | undefined) {
    if (isNotDefined(urlString)) {
        return undefined;
    }

    const url = new URL(urlString);
    const splits = url.pathname.split('/');
    return splits[splits.length - 1];
}

type Props<NAME> = Omit<CommonRawFileInputProps<NAME>, 'value'> & {
    name: NAME;
    clearable?: boolean;
    description?: React.ReactNode;
    error?: React.ReactNode;
    errorOnTooltip?: boolean;
    fileIdToUrlMap: Record<number, string>;
    onChange: (value: number[] | undefined, name: NAME) => void;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    url: SupportedPaths;
    value: number[] | undefined | null;
    withoutPreview?: boolean;
    useCurrentLanguageForMutation?: boolean;
}

function GoMultiFileInput<T extends NameType>(props: Props<T>) {
    const {
        accept,
        after,
        before,
        children,
        className,
        clearable,
        colorVariant = 'primary',
        description,
        disabled: disabledFromProps,
        error,
        errorOnTooltip,
        fileIdToUrlMap,
        inputProps,
        name,
        onChange,
        readOnly,
        setFileIdToUrlMap,
        styleVariant = 'outline',
        url,
        value,
        withoutPreview,
        useCurrentLanguageForMutation = false,
    } = props;

    const strings = useTranslation(i18n);
    const alert = useAlert();

    const {
        pending,
        trigger: triggerFileUpload,
    } = useLazyRequest({
        formData: true,
        url,
        method: 'POST',
        useCurrentLanguageForMutation,
        body: (body: { files: File[] }) => {
            const formData = new FormData();

            body.files.forEach((file) => {
                formData.append('file', file);
            });

            // FIXME: fix typing in server (low priority)
            // the server generated type for response and body is the same
            return formData.getAll('file') as never;
        },
        onSuccess: (responseUnsafe) => {
            // FIXME: fix typing in server (medium priority)
            const response = responseUnsafe as unknown as FileUploadResult[];

            const ids = response.map((val) => keySelector(val));

            if (setFileIdToUrlMap) {
                setFileIdToUrlMap((oldMap) => {
                    const newMap = {
                        ...oldMap,
                    };

                    response.forEach((val) => {
                        newMap[keySelector(val)] = valueSelector(val);
                    });

                    return newMap;
                });
            }
            onChange([...(value ?? []), ...ids], name);
        },
        onFailure: ({
            value: {
                formErrors,
            },
        }) => {
            const err = transformObjectError(formErrors, () => undefined);
            // NOTE: could not use getErrorObject
            const serverErrorMessage = err?.[nonFieldError] || (
                typeof err?.file === 'object'
                    ? err[nonFieldError]
                    : err?.file
            );
            alert.show(
                strings.goMultiFailedUploadMessage,
                {
                    variant: 'danger',
                    description: serverErrorMessage,
                },
            );
        },
    });

    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = useCallback((files: File[] | undefined) => {
        if (files) {
            triggerFileUpload({ files });
        }
    }, [triggerFileUpload]);

    const handleClearButtonClick = useCallback(() => {
        onChange(undefined, name);
    }, [onChange, name]);

    const disabled = disabledFromProps || pending || readOnly;
    const valueUrls = (isDefined(value) && value.length > 0) ? (
        value.map((fileId) => ({ id: fileId, url: fileIdToUrlMap?.[fileId] }))
    ) : undefined;

    const handleFileRemove = useCallback(
        (id: number) => {
            if (isNotDefined(value)) {
                return;
            }

            const fileIndex = value.findIndex((fileId) => fileId === id);
            if (fileIndex !== -1) {
                const newValue = [...value];
                newValue.splice(fileIndex, 1);
                onChange(newValue, name);
            }
        },
        [value, onChange, name],
    );

    return (
        <ListView
            layout="block"
            spacing="sm"
            className={className}
        >
            <ListView
                withWrap
                spacing="sm"
                withSpacingOpticalCorrection
            >
                <RawFileInput
                    name={name}
                    onChange={handleChange}
                    accept={accept}
                    disabled={disabled}
                    readOnly={readOnly}
                    inputProps={inputProps}
                    inputRef={inputRef}
                    colorVariant={colorVariant}
                    styleVariant={styleVariant}
                    before={before}
                    after={after}
                    multiple
                >
                    {children}
                </RawFileInput>
                {clearable && value && value.length > 0 && (
                    <IconButton
                        name={undefined}
                        onClick={handleClearButtonClick}
                        // FIXME: use translations
                        title="Clear selected files"
                        // FIXME: use translations
                        ariaLabel="Clear selected files"
                        // title={strings.removeFileButtonTitle}
                        // ariaLabel={strings.removeFileButtonTitle}
                        spacing="none"
                        disabled={disabled}
                    >
                        <DeleteBinLineIcon />
                    </IconButton>
                )}
                {isNotDefined(valueUrls) && (
                    <Description withLightText>
                        {strings.noFileSelected}
                    </Description>
                )}
            </ListView>
            {!withoutPreview && isDefined(valueUrls) && valueUrls.length > 0 && (
                <ListView
                    layout="grid"
                    numPreferredGridColumns={3}
                    spacing="xs"
                >
                    {valueUrls.map(
                        (valueUrl) => (
                            <InlineLayout
                                key={valueUrl.id}
                                after={(
                                    <Button
                                        name={valueUrl.id}
                                        styleVariant="action"
                                        onClick={handleFileRemove}
                                        title={strings.goMultiDeleteButton}
                                    >
                                        <DeleteBinFillIcon />
                                    </Button>
                                )}
                            >
                                <Link
                                    href={valueUrl.url}
                                    external
                                >
                                    {getFileNameFromUrl(valueUrl.url)}
                                </Link>
                            </InlineLayout>
                        ),
                    )}
                </ListView>
            )}
            {description && (
                <Description withLightText>
                    {description}
                </Description>
            )}
            {error && (
                <InputError
                    disabled={disabled}
                    floating={errorOnTooltip}
                >
                    {error}
                </InputError>
            )}
        </ListView>
    );
}
export default GoMultiFileInput;
