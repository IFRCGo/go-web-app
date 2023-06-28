import {
    PartialForm,
    useFormObject,
    Error,
    getErrorObject,
} from '@togglecorp/toggle-form';
import { _cs } from '@togglecorp/fujs';

import { SetValueArg } from '#types/common';
import GoSingleFileInput from '#components/GoSingleFileInput';
import TextInput from '#components/TextInput';
import { SingleFileWithCaption } from '../../common';

import styles from './styles.module.css';

type Value = PartialForm<SingleFileWithCaption>;

interface Props<N> {
    className?: string;
    name: N;
    value: Value | null | undefined;
    onChange: (value: SetValueArg<Value> | undefined, name: N) => void;
    error: Error<Value>;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}

function ImageWithCaptionInput<N extends string | number>(props: Props<N>) {
    const {
        className,
        name,
        value,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        onChange,
        error: formError,
    } = props;

    const setFieldValue = useFormObject(name, onChange, {});
    const error = getErrorObject(formError);
    // eslint-disable-next-line no-console
    console.info(error);

    return (
        <div className={_cs(styles.imageInput, className)}>
            <GoSingleFileInput
                name="id"
                accept="image/*"
                value={value?.id}
                onChange={setFieldValue}
                url="api/v2/dref-files/"
                fileIdToUrlMap={fileIdToUrlMap}
                setFileIdToUrlMap={setFileIdToUrlMap}
            >
                Upload
            </GoSingleFileInput>
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
