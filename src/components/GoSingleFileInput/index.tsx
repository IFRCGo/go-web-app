import React, { useCallback } from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';

import InputError from '#components/InputError';
import { NameType } from '#components/types';
import Link from '#components/Link';
import type { ButtonVariant } from '#components/Button';
import RawFileInput, { RawFileInputProps } from '#components/RawFileInput';
import { useLazyRequest } from '#utils/restRequest';
import { nonFieldError } from '@togglecorp/toggle-form';
import useAlert from '#hooks/useAlert';

import styles from './styles.module.css';

interface FileUploadResult {
    id: number;
    file: string;
}

const keySelector = (d: FileUploadResult) => d.id;
const valueSelector = (d: FileUploadResult) => d.file;

export type Props<T extends NameType> = Omit<RawFileInputProps<T>, 'multiple' | 'value' | 'onChange' | 'children'| 'inputRef'> & {
    actions?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
    clearable?: boolean;
    icons?: React.ReactNode;
    onChange: (value: number | undefined, name: T) => void;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    url: string;
    value: number | undefined | null;
    variant?: ButtonVariant;
    hidePreview?: boolean;
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
        hidePreview,
        error,
        description,
    } = props;

    const alert = useAlert();

    const {
        pending,
        trigger: triggerFileUpload,
    } = useLazyRequest<FileUploadResult, { file: File }>({
        formData: true,
        url,
        method: 'POST',
        body: (body) => body,
        onSuccess: (response) => {
            const id = keySelector(response);
            const file = valueSelector(response);
            onChange(id, name);

            if (setFileIdToUrlMap) {
                setFileIdToUrlMap((oldMap) => {
                    const newMap = {
                        ...oldMap,
                    };

                    newMap[id] = file;
                    return newMap;
                });
            }
        },
        onFailure: (e) => {
            const serverError = e?.value?.formErrors;
            const message = `Failed to upload the file! ${serverError?.file ?? serverError?.[nonFieldError] ?? ''}`;
            alert.show(
                message,
                { variant: 'danger' },
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
            {/* FIXME: use translation, implement remove */}
            {!hidePreview && selectedFileUrl ? (
                <Link
                    to={selectedFileUrl}
                >
                    1 file selected
                </Link>
            ) : (
                <div className={styles.emptyMessage}>
                    No file selected
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
