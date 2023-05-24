import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { NameType } from '#components/types';
import { CloseLineIcon } from '@ifrc-go/icons';
import IconButton, { Props as IconButtonProps } from '#components/IconButton';
import Button, { ButtonVariant, Props as ButtonProps } from '#components/Button';
import RawFileInput, { RawFileInputProps } from '#components/RawFileInput';
import { useLazyRequest } from '#utils/restRequest';
import { nonFieldError } from '@togglecorp/toggle-form';
import useAlert from '#hooks/useAlert';

import styles from './styles.module.css';

interface Option {
    id: number;
    file: string;
}

export type Props<T extends NameType> = Omit<RawFileInputProps<T>, 'multiple' | 'value' | 'onChange' | 'children'> & {
    actions?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
    clearButtonProps?: IconButtonProps<T>;
    clearable?: boolean;
    icons?: React.ReactNode;
    iconsClassName?: string;
    onChange: (value: number | undefined | null, name: T) => void;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    url: string;
    value: number | undefined | null;
    variant: ButtonVariant;
    buttonProps: ButtonProps<T>;
}

function GoSingleFileInput<T extends NameType>(props: Props<T>) {
    const {
        icons,
        accept,
        actions: actionsFromProps,
        capture,
        children,
        className,
        clearButtonProps,
        clearable,
        disabled: disabledFromProps,
        form,
        inputProps,
        name,
        onChange,
        readOnly,
        setFileIdToUrlMap,
        url,
        value,
        variant = 'primary',
        buttonProps,
    } = props;

    const alert = useAlert();

    const {
        pending,
        trigger: triggerFileUpload,
    } = useLazyRequest<Option, { file: File }>({
        formData: true,
        url,
        method: 'POST',
        body: (body) => body,
        onSuccess: (response) => {
            const { id, file } = response;
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

    const handleChange = useCallback((file: File | null) => {
        if (file) {
            triggerFileUpload({ file });
        }
    }, [triggerFileUpload]);

    const handleClear = useCallback(() => {
        onChange(null, name);
    }, [onChange, name]);

    const disabled = disabledFromProps || pending || readOnly;

    const actions = (clearable && value && !readOnly && !disabled ? (
        <>
            {actionsFromProps}
            <IconButton
                {...clearButtonProps} // eslint-disable-line react/jsx-props-no-spreading
                name="clear-button"
                variant="tertiary"
                ariaLabel="clear"
                onClick={handleClear}
                className={styles.clearButton}
            >
                <CloseLineIcon />
            </IconButton>
        </>
    ) : null);

    return (
        <div className={_cs(styles.goFileInput, className)}>
            <RawFileInput
                onChange={handleChange}
                accept={accept}
                name={name}
                form={form}
                disabled={disabled}
                readOnly={readOnly}
                capture={capture}
                inputProps={inputProps}
            >
                {(fileButtonProps) => (
                    <Button
                        {...buttonProps} // eslint-disable-line react/jsx-props-no-spreading
                        {...fileButtonProps} // eslint-disable-line react/jsx-props-no-spreading
                        name={undefined}
                        variant={variant}
                        disabled={disabled}
                        icons={icons}
                    >
                        {children}
                    </Button>
                )}
            </RawFileInput>
            {actions}
        </div>
    );
}
export default GoSingleFileInput;
