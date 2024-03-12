import {
    useCallback,
    useMemo,
} from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    type ArrayError,
    getErrorObject,
    type SetValueArg,
} from '@togglecorp/toggle-form';

import GoMultiFileInput, { type SupportedPaths } from '#components/domain/GoMultiFileInput';
import NonFieldError from '#components/NonFieldError';

import styles from './styles.module.css';

type Value = {
    client_id: string;
    id?: number;
    caption?: string;
};

interface Props<N> {
    className?: string;
    name: N;
    url: SupportedPaths;
    value: Value[] | null | undefined;
    onChange: (value: SetValueArg<Value[] | undefined>, name: N) => void;
    error: ArrayError<Value> | undefined;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    label: React.ReactNode;
    icons?: React.ReactNode;
    actions?: React.ReactNode;
    disabled?: boolean;
}

// FIXME: Move this to components
function DrefMultiFileInput<const N extends string | number>(props: Props<N>) {
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

    const error = getErrorObject(formError);

    const handleFileInputChange = useCallback(
        (newValue: number[] | undefined) => {
            if (isNotDefined(newValue)) {
                onChange(undefined, name);
                return;
            }

            const formValue = newValue.map(
                (fileId: number) => ({
                    client_id: String(fileId),
                    id: fileId,
                }),
            );

            onChange(formValue, name);
        },
        [name, onChange],
    );

    const fileInputValue = useMemo(() => (
        value
            ?.map((fileValue) => fileValue.id)
            .filter(isDefined)
    ), [value]);

    return (
        <div className={_cs(styles.multiFileInput, className)}>
            <NonFieldError error={error} />
            <GoMultiFileInput
                name={undefined}
                accept=".pdf, .docx, .pptx"
                value={fileInputValue}
                onChange={handleFileInputChange}
                url={url}
                fileIdToUrlMap={fileIdToUrlMap}
                setFileIdToUrlMap={setFileIdToUrlMap}
                icons={icons}
                actions={actions}
                disabled={disabled}
            >
                {label}
            </GoMultiFileInput>
        </div>
    );
}

export default DrefMultiFileInput;
