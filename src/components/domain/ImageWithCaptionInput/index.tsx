import {
    useFormObject,
    type ObjectError,
    getErrorObject,
    type SetValueArg,
} from '@togglecorp/toggle-form';
import {
    _cs,
    isDefined,
    randomString,
} from '@togglecorp/fujs';

import NonFieldError from '#components/NonFieldError';
import GoSingleFileInput, {
    type SupportedPaths,
} from '#components/domain/GoSingleFileInput';
import TextInput from '#components/TextInput';
import useTranslation from '#hooks/useTranslation';

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
    onChange: (value: SetValueArg<Value>, name: N) => void;
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

    return (
        <div className={_cs(styles.imageWithCaptionInput, className)}>
            <NonFieldError
                error={error}
            />
            <GoSingleFileInput
                name="id"
                accept="image/*"
                value={value?.id}
                onChange={setFieldValue}
                // url="/api/v2/dref-files/"
                url={url}
                fileIdToUrlMap={fileIdToUrlMap}
                setFileIdToUrlMap={setFileIdToUrlMap}
                icons={icons}
                actions={actions}
                disabled={disabled}
                // FIXME: create a component for preview, implement remove
                description={isDefined(fileUrl) ? (
                    <img
                        className={styles.preview}
                        alt={strings.imageWithCaptionPreview}
                        src={fileUrl}
                    />
                ) : undefined}
            >
                {label}
            </GoSingleFileInput>
            {value?.id && (
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
