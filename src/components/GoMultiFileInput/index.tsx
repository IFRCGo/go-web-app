import React, { useCallback, useRef } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import InputError from '#components/InputError';
import Link from '#components/Link';
import { NameType } from '#components/types';
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

function getFileNameFromUrl(urlString: string) {
    const url = new URL(urlString);
    const splits = url.pathname.split('/');
    return splits[splits.length - 1];
}

export type Props<T extends NameType> = Omit<RawFileInputProps<T>, 'multiple' | 'value' | 'onChange' | 'children' | 'inputRef'> & {
    actions?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
    clearable?: boolean;
    icons?: React.ReactNode;
    onChange: (value: number[] | undefined, name: T) => void;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    url: string;
    value: number[] | undefined | null;
    variant?: ButtonVariant;
    hidePreview?: boolean;
    error?: React.ReactNode;
    description?: React.ReactNode;
}

function GoMultiFileInput<T extends NameType>(props: Props<T>) {
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
    } = useLazyRequest<FileUploadResult[], { files: File[] }>({
        formData: true,
        url,
        method: 'POST',
        body: (body) => {
            const formData = new FormData();

            body.files.forEach((file) => {
                formData.append('file', file);
            });

            return formData.getAll('file');
        },
        onSuccess: (response) => {
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
        onFailure: (e) => {
            const serverError = e?.value?.formErrors;
            const serverErrorMessage = String(serverError?.file ?? serverError?.[nonFieldError]);
            alert.show(
                // FIXME use translation
                'Failed to upload the file!',
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

    const disabled = disabledFromProps || pending || readOnly;
    const actions = (clearable && value && !readOnly && !disabled ? actionsFromProps : null);
    const valueUrls = isDefined(value) ? (
        value.map((fileId) => fileIdToUrlMap?.[fileId])
    ) : undefined;

    return (
        <div className={_cs(styles.goFileInput, className)}>
            <RawFileInput
                name={name}
                onChange={handleChange}
                accept={accept}
                disabled={disabled}
                readOnly={readOnly}
                inputProps={inputProps}
                inputRef={inputRef}
                variant={variant}
                icons={icons}
                actions={actions}
                multiple
            >
                {children}
            </RawFileInput>
            {!hidePreview && valueUrls && (
                <div className={styles.selectedFiles}>
                    {valueUrls.map(
                        (valueUrl) => (
                            <Link
                                key={valueUrl}
                                to={valueUrl}
                            >
                                {getFileNameFromUrl(valueUrl)}
                            </Link>
                        ),
                    )}
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
export default GoMultiFileInput;
