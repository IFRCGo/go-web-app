import { useCallback } from 'react';
import {
    Image,
    ListView,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    randomString,
} from '@togglecorp/fujs';
import {
    getErrorObject,
    type ObjectError,
    type SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import GoSingleFileInput, { type SupportedPaths } from '#components/domain/GoSingleFileInput';
import NonFieldError from '#components/NonFieldError';

import i18n from './i18n.json';

type ImageWithCaptionValue = {
    id?: number;
    client_id: string;
    caption?: string | null;
};

type OutputValue = {
    id?: number;
    client_id: string;
    caption?: string;
}

interface Props<NAME> {
    className?: string;
    name: NAME;
    url: SupportedPaths;
    value: ImageWithCaptionValue | null | undefined;
    onChange: (value: SetValueArg<OutputValue> | undefined, name: NAME) => void;
    error: ObjectError<ImageWithCaptionValue> | undefined;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    label?: React.ReactNode;
    before?: React.ReactNode;
    after?: React.ReactNode;
    disabled?: boolean;
    readOnly?: boolean;
    useCurrentLanguageForMutation?: boolean;
}

// FIXME: Move this to components
function ImageWithCaptionInput<const N extends string | number>(props: Props<N>) {
    const strings = useTranslation(i18n);

    const {
        className,
        readOnly,
        name,
        value,
        url,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        onChange,
        error: formError,
        label = strings.defaultLabel,
        before,
        after,
        disabled,
        useCurrentLanguageForMutation,
    } = props;

    const setFieldValue = useFormObject(
        name,
        onChange,
        () => ({ client_id: randomString() }),
    );

    const error = getErrorObject(formError);

    const fileUrl = isDefined(value) && isDefined(value.id)
        ? fileIdToUrlMap[value.id]
        : undefined;

    const handleFileInputChange = useCallback((newFileId: number | undefined) => {
        if (!newFileId) {
            onChange(undefined, name);
        } else {
            setFieldValue(newFileId, 'id');
        }
    }, [
        setFieldValue,
        onChange,
        name,
    ]);

    return (
        <ListView
            className={className}
            layout="block"
            spacing="xs"
        >
            <NonFieldError
                error={error}
            />
            <GoSingleFileInput
                name="id"
                accept="image/*"
                value={value?.id}
                readOnly={readOnly}
                onChange={handleFileInputChange}
                url={url}
                fileIdToUrlMap={fileIdToUrlMap}
                setFileIdToUrlMap={setFileIdToUrlMap}
                before={before}
                after={after}
                disabled={disabled}
                // FIXME: Make Go single file input with preview
                description={isDefined(fileUrl) ? (
                    <Image
                        alt={strings.previewFallbackText}
                        src={fileUrl}
                        size="sm"
                    />
                ) : undefined}
                clearable
                useCurrentLanguageForMutation={useCurrentLanguageForMutation}
                error={error?.id}
            >
                {label}
            </GoSingleFileInput>
            {value?.id && isDefined(fileUrl) && (
                <TextInput
                    name="caption"
                    value={value?.caption}
                    readOnly={readOnly}
                    onChange={setFieldValue}
                    error={error?.caption}
                    placeholder={strings.captionInputPlaceholder}
                    disabled={disabled}
                />
            )}
        </ListView>
    );
}

export default ImageWithCaptionInput;
