import React, { useCallback, useRef } from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { nonFieldError } from '@togglecorp/toggle-form';

import InputError from '#components/InputError';
import Link from '#components/Link';
import { NameType } from '#components/types';
import type { ButtonVariant } from '#components/Button';
import RawFileInput, { RawFileInputProps } from '#components/RawFileInput';
import { useLazyRequest } from '#utils/restRequest';
import { paths } from '#generated/types';
import useAlert from '#hooks/useAlert';

import { DeleteBinFillIcon } from '@ifrc-go/icons';
import Button from '#components/Button';

import styles from './styles.module.css';

type supportedPaths = '/api/v2/per-file/multiple/' | '/api/v2/dref-files/multiple/' | '/api/v2/flash-update-file/multiple/';

type RequestBody = paths[supportedPaths]['post']['requestBody']['content']['application/json'];

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
    url: supportedPaths;
    value: number[] | undefined | null;
    variant?: ButtonVariant;
    withoutPreview?: boolean;
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
        body: (body: { files: File[] }) => {
            const formData = new FormData();

            body.files.forEach((file) => {
                formData.append('file', file);
            });

            // FIXME: typing should be fixed in the server
            return formData.getAll('file') as unknown as RequestBody;
        },
        onSuccess: (responseUnsafe) => {
            // FIXME: typing should be fixed in the server
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
            {!withoutPreview && isDefined(valueUrls) && valueUrls.length > 0 && (
                <div className={styles.selectedFiles}>
                    {valueUrls.map(
                        (valueUrl) => (
                            <div
                                className={styles.file}
                                key={valueUrl.id}
                            >
                                <Link to={valueUrl.url}>
                                    {getFileNameFromUrl(valueUrl.url)}
                                </Link>
                                <Button
                                    name={valueUrl.id}
                                    variant="tertiary"
                                    className={styles.deleteIcon}
                                    onClick={handleFileRemove}
                                >
                                    <DeleteBinFillIcon />
                                </Button>
                            </div>
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
