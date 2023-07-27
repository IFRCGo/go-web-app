import {
    useFormObject,
    ObjectError,
    getErrorObject,
    SetValueArg,
} from '@togglecorp/toggle-form';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import GoSingleFileInput from '#components/GoSingleFileInput';
import TextInput from '#components/TextInput';

import styles from './styles.module.css';

type Value = {
    id?: number | undefined;
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
}

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
    } = props;

    const setFieldValue = useFormObject(name, onChange, {});
    const error = getErrorObject(formError);
    const fileUrl = isDefined(value) && isDefined(value.id) ? fileIdToUrlMap[value.id] : undefined;

    return (
        <div className={_cs(styles.imageWithCaptionInput, className)}>
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
                />
            )}
        </div>
    );
}

export default ImageWithCaptionInput;
