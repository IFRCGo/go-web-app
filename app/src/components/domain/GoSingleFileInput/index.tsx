import { useCallback } from 'react';
import { DeleteBinLineIcon } from '@ifrc-go/icons';
import {
    type CommonRawFileInputProps,
    Description,
    IconButton,
    InputError,
    ListView,
    RawFileInput,
    type SingleRawFileInputProps,
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

export type SupportedPaths = '/api/v2/per-file/' | '/api/v2/dref-files/' | '/api/v2/flash-update-file/' | '/api/v2/per-document-upload/' | '/api/v2/eap-file/';

type Props<NAME> = Omit<CommonRawFileInputProps<NAME>, 'value'> & {
    name: NAME;
    clearable?: boolean;
    description?: React.ReactNode;
    error?: React.ReactNode;
    errorOnTooltip?: boolean;
    fileIdToUrlMap: Record<number, string>;
    onSuccess?: () => void;
    requestBody?: Record<string, string | number | boolean>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    url: SupportedPaths;
    urlQuery?: Record<string, string | number | boolean>;
    value: number | undefined | null;
    onChange: (value: number | undefined, name: NAME) => void;
    withoutPreview?: boolean;
    withoutStatus?: boolean;
    useCurrentLanguageForMutation?: boolean;
}

function GoSingleFileInput<const NAME>(props: Props<NAME>) {
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
        onSuccess,
        readOnly,
        requestBody,
        setFileIdToUrlMap,
        styleVariant = 'outline',
        url,
        urlQuery,
        value,
        withoutPreview,
        withoutStatus,
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
        query: urlQuery,
        method: 'POST',
        // FIXME: fix typing in server (low priority)
        // the server generated type for response and body is the same
        body: (body) => body as never,
        useCurrentLanguageForMutation,
        onSuccess: (response) => {
            const { id, file } = response;
            onChange(id, name);

            if (isDefined(onSuccess)) {
                onSuccess();
            }

            if (isDefined(file) && isDefined(id) && setFileIdToUrlMap) {
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

    const handleChange = useCallback<SingleRawFileInputProps<NAME>['onChange']>((file) => {
        if (isNotDefined(file)) {
            return;
        }

        if (isDefined(requestBody)) {
            triggerFileUpload({
                file,
                ...requestBody,
            });

            return;
        }

        triggerFileUpload({ file });
    }, [triggerFileUpload, requestBody]);

    const handleClearButtonClick = useCallback(() => {
        onChange(undefined, name);
    }, [onChange, name]);

    const disabled = disabledFromProps || pending || readOnly;
    const selectedFileUrl = isDefined(value) ? fileIdToUrlMap?.[value] : undefined;

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
                    colorVariant={colorVariant}
                    styleVariant={styleVariant}
                    before={before}
                    after={after}
                >
                    {children}
                </RawFileInput>
                {isNotDefined(selectedFileUrl) && !withoutStatus && (
                    <Description withLightText>
                        {strings.noFileSelected}
                    </Description>
                )}
                <ListView spacing="xs">
                    {!withoutPreview && isDefined(selectedFileUrl) && (
                        <Link
                            href={selectedFileUrl}
                            external
                        >
                            {selectedFileUrl.split('/').pop()}
                        </Link>
                    )}
                    {clearable && isDefined(value) && (
                        <IconButton
                            name={undefined}
                            onClick={handleClearButtonClick}
                            title={strings.removeFileButtonTitle}
                            ariaLabel={strings.removeFileButtonTitle}
                            spacing="none"
                            disabled={disabled}
                        >
                            <DeleteBinLineIcon />
                        </IconButton>
                    )}
                </ListView>
            </ListView>
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

export default GoSingleFileInput;
