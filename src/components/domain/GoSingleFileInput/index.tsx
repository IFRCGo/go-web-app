import React, { useCallback } from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';

import { transformObjectError } from '#utils/restRequest/error';
import InputError from '#components/InputError';
import { NameType } from '#components/types';
import Link from '#components/Link';
import type { ButtonVariant } from '#components/Button';
import RawFileInput, { RawFileInputProps } from '#components/RawFileInput';
import { useLazyRequest } from '#utils/restRequest';
import { nonFieldError } from '@togglecorp/toggle-form';
import { paths } from '#generated/types';
import useAlert from '#hooks/useAlert';

import styles from './styles.module.css';

type supportedPaths = '/api/v2/per-file/' | '/api/v2/dref-files/' | '/api/v2/flash-update-file/';

type RequestBody = paths[supportedPaths]['post']['requestBody']['content']['application/json'];

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
    url: supportedPaths;
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

    const alert = useAlert();

    const {
        pending,
        trigger: triggerFileUpload,
    } = useLazyRequest({
        formData: true,
        url,
        method: 'POST',
        body: (body: RequestBody) => body,
        onSuccess: (responseUnsafe) => {
            // FIXME: typing should be fixed in the server
            const response = responseUnsafe as FileUploadResult;
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
                // FIXME use translation
                'Failed to upload the file!',
                {
                    variant: 'danger',
                    description: serverErrorMessage,
                },
            );
        },
    });

    const handleChange = useCallback((file: File | undefined) => {
        if (file) {
            // FIXME: typing should be fixed in the server
            triggerFileUpload({ file } as unknown as RequestBody);
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
            {!withoutPreview && isDefined(selectedFileUrl) ? (
                <Link
                    to={selectedFileUrl}
                    external
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
