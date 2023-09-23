import React, { useCallback } from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';
import { nonFieldError } from '@togglecorp/toggle-form';

import InputError from '#components/InputError';
import { NameType } from '#components/types';
import Link from '#components/Link';
import type { ButtonVariant } from '#components/Button';
import RawFileInput, { RawFileInputProps } from '#components/RawFileInput';
import { useLazyRequest } from '#utils/restRequest';
import { transformObjectError } from '#utils/restRequest/error';
import useAlert from '#hooks/useAlert';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

export type SupportedPaths = '/api/v2/per-file/' | '/api/v2/dref-files/' | '/api/v2/flash-update-file/';

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
        body: (body: { file: File }) => body as never,
        onSuccess: (response) => {
            const { id, file } = response;
            onChange(id, name);

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
        if (file) {
            triggerFileUpload({ file });
        }
    }, [triggerFileUpload]);

    const disabled = disabledFromProps || pending || readOnly;
    const actions = (clearable && value && !readOnly && !disabled ? actionsFromProps : null);
    const selectedFileUrl = isDefined(value) ? fileIdToUrlMap?.[value] : undefined;

    return (
        <div className={_cs(styles.goSingleFileInput, className)}>
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
            {!withoutPreview && isDefined(selectedFileUrl) ? (
                <Link
                    href={selectedFileUrl}
                    external
                >
                    {strings.oneFileSelected}
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
