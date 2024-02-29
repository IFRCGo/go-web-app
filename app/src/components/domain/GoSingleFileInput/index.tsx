import React, { useCallback } from 'react';
import { DeleteBinLineIcon } from '@ifrc-go/icons';
import {
    ButtonVariant,
    IconButton,
    InputError,
    type NameType,
    RawFileInput,
    type RawFileInputProps,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { nonFieldError } from '@togglecorp/toggle-form';

import Link from '#components/Link';
import useAlert from '#hooks/useAlert';
import { useLazyRequest } from '#utils/restRequest';
import { transformObjectError } from '#utils/restRequest/error';

import i18n from './i18n.json';
import styles from './styles.module.css';

export type SupportedPaths = '/api/v2/per-file/' | '/api/v2/dref-files/' | '/api/v2/flash-update-file/' | '/api/v2/per-document-upload/';

export type Props<T extends NameType> = Omit<RawFileInputProps<T>, 'multiple' | 'value' | 'onChange' | 'children'| 'inputRef'> & {
    actions?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
    clearable?: boolean;
    icons?: React.ReactNode;
    onChange: (value: number | undefined, name: T) => void;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    url: SupportedPaths;
    value: number | undefined | null;
    variant?: ButtonVariant;
    withoutPreview?: boolean;
    error?: React.ReactNode;
    description?: React.ReactNode;
    countryId?: string | undefined | null;
    onSuccess?: () => void;
}

function GoSingleFileInput<T extends NameType>(props: Props<T>) {
    const {
        accept,
        actions: actionsFromProps,
        children,
        className,
        clearable,
        disabled: disabledFromProps,
        icons,
        inputProps,
        name,
        onChange,
        readOnly,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        url,
        value,
        variant = 'secondary',
        withoutPreview,
        error,
        description,
        countryId,
        onSuccess,
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
        // FIXME: fix typing in server (low priority)
        // the server generated type for response and body is the same
        body: (body) => body as never,
        onSuccess: (response) => {
            const { id, file } = response;
            onChange(id, name);
            if (isDefined(countryId) && isDefined(onSuccess)) {
                onSuccess();
            }

            if (isDefined(file) && setFileIdToUrlMap) {
                setFileIdToUrlMap((oldMap) => {
                    const newMap = {
                        ...oldMap,
                    };
                    newMap[id] = file;
                    return newMap;
                });
            }
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
                strings.failedUploadMessage,
                {
                    variant: 'danger',
                    description: serverErrorMessage,
                },
            );
        },
    });

    const handleChange = useCallback((file: File | undefined) => {
        if (file && isNotDefined(countryId)) {
            triggerFileUpload({ file });
        }
        if (file && isDefined(countryId)) {
            triggerFileUpload({ country: Number(countryId), file });
        }
    }, [triggerFileUpload, countryId]);

    const disabled = disabledFromProps || pending || readOnly;
    const actions = (!readOnly && !disabled ? actionsFromProps : null);
    const selectedFileUrl = isDefined(value) ? fileIdToUrlMap?.[value] : undefined;

    const handleClearButtonClick = useCallback(() => {
        onChange(undefined, name);
    }, [onChange, name]);

    return (
        <div className={_cs(styles.goSingleFileInput, className)}>
            <div className={styles.inputContainer}>
                <RawFileInput
                    name={name}
                    onChange={handleChange}
                    accept={accept}
                    disabled={disabled}
                    readOnly={readOnly}
                    inputProps={inputProps}
                    variant={variant}
                    icons={icons}
                    actions={actions}
                >
                    {children}
                </RawFileInput>
                {clearable && value && isNotDefined(countryId) && (
                    <IconButton
                        className={styles.removeButton}
                        name={undefined}
                        onClick={handleClearButtonClick}
                        title={strings.removeFileButtonTitle}
                        ariaLabel={strings.removeFileButtonTitle}
                        variant="tertiary"
                        spacing="none"
                        disabled={disabled}
                    >
                        <DeleteBinLineIcon />
                    </IconButton>
                )}
            </div>
            {!withoutPreview && isDefined(selectedFileUrl) ? (
                <Link
                    href={selectedFileUrl}
                    external
                >
                    {selectedFileUrl.split('/').pop()}
                </Link>
            ) : (
                <div className={styles.emptyMessage}>
                    {strings.noFileSelected}
                </div>
            )}
            {description && (
                <div>
                    {description}
                </div>
            )}
            <InputError>
                {error}
            </InputError>
        </div>
    );
}

export default GoSingleFileInput;
