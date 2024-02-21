import { useCallback } from 'react';
import { TextInput } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    _cs,
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
import styles from './styles.module.css';

type Value = {
    id?: number | undefined;
    client_id: string;
    caption?: string | undefined;
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
    icons?: React.ReactNode;
    actions?: React.ReactNode;
    disabled?: boolean;
}

// FIXME: Move this to components
function ImageWithCaptionInput<const N extends string | number>(props: Props<N>) {
    const {
        className,
        name,
        value,
        url,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        onChange,
        error: formError,
        label,
        icons,
        actions,
        disabled,
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
        <div className={_cs(styles.imageWithCaptionInput, className)}>
            <NonFieldError
                error={error}
            />
            <GoSingleFileInput
                name="id"
                accept="image/*"
                value={value?.id}
                onChange={handleFileInputChange}
                url={url}
                fileIdToUrlMap={fileIdToUrlMap}
                setFileIdToUrlMap={setFileIdToUrlMap}
                icons={icons}
                actions={actions}
                disabled={disabled}
                // FIXME: Make Go single file input with preview
                description={isDefined(fileUrl) ? (
                    <img
                        className={styles.preview}
                        alt={strings.imageWithCaptionPreview}
                        src={fileUrl}
                    />
                ) : undefined}
                clearable
            >
                {label}
            </GoSingleFileInput>
            {value?.id && isDefined(fileUrl) && (
                <TextInput
                    className={styles.captionInput}
                    name="caption"
                    value={value?.caption}
                    onChange={setFieldValue}
                    error={error?.caption}
                    placeholder={strings.imageWithCaptionEnterCaption}
                    disabled={disabled}
                />
            )}
        </div>
    );
}

export default ImageWithCaptionInput;
