import {
    useCallback,
    useMemo,
} from 'react';
import { DeleteBinLineIcon } from '@ifrc-go/icons';
import {
    IconButton,
    Image,
    InlineLayout,
    ListView,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
    randomString,
} from '@togglecorp/fujs';
import {
    type ArrayError,
    getErrorObject,
    type SetValueArg,
    useFormArray,
} from '@togglecorp/toggle-form';

import GoMultiFileInput, { type SupportedPaths } from '#components/domain/GoMultiFileInput';
import NonFieldError from '#components/NonFieldError';

import i18n from './i18n.json';
import styles from './styles.module.css';

type InputValue = {
    id?: number;
    client_id: string;
    caption?: string | null;
};

type OutputValue = {
    id?: number;
    client_id: string;
    caption?: string;
}

interface Props<N> {
    className?: string;
    name: N;
    url: SupportedPaths;
    value: InputValue[] | null | undefined;
    onChange: (value: SetValueArg<OutputValue[] | undefined>, name: N) => void;
    error: ArrayError<InputValue> | undefined;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    label?: React.ReactNode;
    readOnly?: boolean;
    before?: React.ReactNode;
    after?: React.ReactNode;
    disabled?: boolean;
    description?: React.ReactNode;
    useCurrentLanguageForMutation?: boolean;
}

// FIXME: Move this to components
function MultiImageWithCaptionInput<const N extends string | number>(props: Props<N>) {
    const strings = useTranslation(i18n);

    const {
        className,
        name,
        value,
        url,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        onChange,
        error: formError,
        label = strings.defaultLabel,
        readOnly,
        before,
        after,
        disabled,
        description,
        useCurrentLanguageForMutation = false,
    } = props;

    const error = getErrorObject(formError);

    const {
        setValue: setFieldValue,
        removeValue,
    } = useFormArray(name, onChange);

    const handleFileInputChange = useCallback(
        (newValue: number[] | undefined) => {
            if (isDefined(newValue)) {
                newValue.forEach(
                    (fileId: number, index: number) => {
                        const oldValue = value?.[index];

                        if (isNotDefined(oldValue)) {
                            setFieldValue(
                                {
                                    client_id: String(fileId),
                                    id: fileId,
                                },
                                index,
                            );
                        }
                    },
                );
            }
        },
        [value, setFieldValue],
    );

    const handleCaptionChange = useCallback(
        (newValue: string | undefined, index: number) => {
            setFieldValue(
                (prevValue) => {
                    if (isNotDefined(prevValue)) {
                        return {
                            client_id: randomString(),
                            caption: newValue,
                        };
                    }

                    return {
                        ...prevValue,
                        caption: newValue,
                    };
                },
                index,
            );
        },
        [setFieldValue],
    );

    const fileInputValue = useMemo(() => (
        value
            ?.map((fileValue) => fileValue.id)
            .filter(isDefined)
    ), [value]);

    return (
        <ListView
            layout="block"
            className={className}
            withSpacingOpticalCorrection
        >
            <NonFieldError error={error} />
            <GoMultiFileInput
                name={undefined}
                accept="image/*"
                value={fileInputValue}
                onChange={handleFileInputChange}
                url={url}
                fileIdToUrlMap={fileIdToUrlMap}
                setFileIdToUrlMap={setFileIdToUrlMap}
                before={before}
                after={after}
                withoutPreview
                readOnly={readOnly}
                disabled={disabled}
                useCurrentLanguageForMutation={useCurrentLanguageForMutation}
                description={description}
            >
                {label}
            </GoMultiFileInput>
            {value && value.length > 0 && (
                <ListView
                    layout="grid"
                    numPreferredGridColumns={3}
                    spacing="sm"
                >
                    {value?.map((fileValue, index) => {
                        // NOTE: Not sure why this is here, need to
                        // TODO: talk with @frozenhelium
                        if (isNotDefined(fileValue.id)) {
                            return null;
                        }

                        const imageError = getErrorObject(error?.[fileValue.client_id]);

                        return (
                            <ListView
                                key={fileValue.id}
                                layout="block"
                                spacing="xs"
                                withSpacingOpticalCorrection
                                withDarkBackground
                                withPadding
                            >
                                <InlineLayout
                                    className={styles.deleteButton}
                                    after={(
                                        <IconButton
                                            name={index}
                                            onClick={removeValue}
                                            title={strings.removeImageButtonTitle}
                                            ariaLabel={strings.removeImageButtonTitle}
                                            variant="secondary"
                                            spacing="none"
                                            disabled={disabled || readOnly}
                                        >
                                            <DeleteBinLineIcon />
                                        </IconButton>
                                    )}
                                />
                                <NonFieldError error={imageError} />
                                <Image
                                    alt={strings.imagePreviewFallbackText}
                                    src={fileIdToUrlMap[fileValue.id]}
                                    size="sm"
                                />
                                <TextInput
                                    name={index}
                                    value={fileValue?.caption}
                                    onChange={handleCaptionChange}
                                    error={imageError?.caption}
                                    placeholder={strings.captionInputPlaceholder}
                                    readOnly={readOnly}
                                    disabled={disabled}
                                />
                            </ListView>
                        );
                    })}
                </ListView>
            )}
        </ListView>
    );
}

export default MultiImageWithCaptionInput;
