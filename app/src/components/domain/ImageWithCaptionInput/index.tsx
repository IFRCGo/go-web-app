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

type Value = {
    id?: number | undefined;
    client_id: string;
    caption?: string | undefined | null;
};

interface Props<N> {
    className?: string;
    name: N;
    url: SupportedPaths;
    value: Value | null | undefined;
    onChange: (value: SetValueArg<Value> | undefined, name: N) => void;
    error: ObjectError<Value> | undefined;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    label: React.ReactNode;
    before?: React.ReactNode;
    after?: React.ReactNode;
    disabled?: boolean;
    readOnly?: boolean;
    useCurrentLanguageForMutation?: boolean;
}

// FIXME: Move this to components
function ImageWithCaptionInput<const N extends string | number>(props: Props<N>) {
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
        label,
        before,
        after,
        disabled,
        useCurrentLanguageForMutation,
    } = props;

    const strings = useTranslation(i18n);

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
                        alt={strings.imageWithCaptionPreview}
                        src={fileUrl}
                        size="sm"
                    />
                ) : undefined}
                clearable
                useCurrentLanguageForMutation={useCurrentLanguageForMutation}
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
                    placeholder={strings.imageWithCaptionEnterCaption}
                    disabled={disabled}
                />
            )}
        </ListView>
    );
}

export default ImageWithCaptionInput;
