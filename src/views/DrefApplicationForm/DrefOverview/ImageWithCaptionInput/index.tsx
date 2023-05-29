import {
    PartialForm,
    useFormObject,
    Error,
    getErrorObject,
} from '@togglecorp/toggle-form';
import { _cs } from '@togglecorp/fujs';

import { SetValueArg } from '#types/common';
import TextInput from '#components/TextInput';
// import DREFFileInput from '#components/DREFFileInput';
import { SingleFileWithCaption } from '../../common';
import styles from './styles.module.css';

type Value = PartialForm<SingleFileWithCaption>;

interface Props<N> {
    className?: string;
    name: N;
    value: Value | null | undefined;
    onChange: (value: SetValueArg<Value> | undefined, name: N) => void;
    error: Error<Value>;
    // label?: React.ReactNode;
    // fileIdToUrlMap: Record<number, string>;
    // setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}

function ImageWithCaptionInput<N extends string | number>(props: Props<N>) {
    const {
        className,
        name,
        value,
        // FIXME
        // fileIdToUrlMap,
        // FIXME
        // setFileIdToUrlMap,
        onChange,
        error: formError,
        // FIXME
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        // label,
    } = props;

    const setFieldValue = useFormObject(name, onChange, {});
    const error = getErrorObject(formError);
    // eslint-disable-next-line no-console
    console.info(error);

    return (
        <div className={_cs(styles.imageInput, className)}>
            {/*
            <DREFFileInput
                accept="image/*"
                name="id"
                value={value?.id}
                onChange={setFieldValue}
                error={error?.id}
                fileIdToUrlMap={fileIdToUrlMap}
                setFileIdToUrlMap={setFileIdToUrlMap}
            >
                {label}
            </DREFFileInput>
             */}
            {value?.id && (
                <TextInput
                    className={styles.captionInput}
                    name="caption"
                    value={value?.caption}
                    onChange={setFieldValue}
                />
            )}
        </div>
    );
}

export default ImageWithCaptionInput;
