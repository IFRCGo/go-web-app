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
import GoSingleFileInput from '#components/domain/GoSingleFileInput';
import TextInput from '#components/TextInput';

import styles from './styles.module.css';

// FIXME: is this type correct?
type Value = {
    id?: number | undefined;
    client_id: string;
    caption?: string | undefined;
};

interface Props<N> {
    className?: string;
    name: N;
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
        fileIdToUrlMap,
        setFileIdToUrlMap,
        onChange,
        error: formError,
        label,
        icons,
        actions,
        disabled,
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
                url="/api/v2/dref-files/"
                fileIdToUrlMap={fileIdToUrlMap}
                setFileIdToUrlMap={setFileIdToUrlMap}
                error={error?.id}
                icons={icons}
                actions={actions}
                disabled={disabled}
                // FIXME: create a component for preview, implement remove
                description={isDefined(fileUrl) ? (
                    <img
                        className={styles.preview}
                        alt="preview"
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
                    // FIXME: use translation
                    placeholder="Enter Caption"
                    disabled={disabled}
                />
            )}
        </div>
    );
}

export default ImageWithCaptionInput;
