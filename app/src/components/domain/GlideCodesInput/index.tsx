import {
    useCallback,
    useMemo,
} from 'react';
import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import {
    Button,
    IconButton,
    InlineView,
    InputHint,
    ListView,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import {
    type Error,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import { MAX_GLIDE_CODE_LENGTH } from '#utils/constants';

import i18n from './i18n.json';

interface Props<NAME> {
    className?: string;
    name: NAME;
    value: string[] | undefined | null;
    error?: Error<string[]>;
    onChange: (newValue: string[] | undefined, name: NAME) => void;
    disabled?: boolean;
    readOnly?: boolean;
}

function GlideCodesInput<const NAME>(props: Props<NAME>) {
    const {
        className,
        name,
        value,
        error,
        onChange,
        disabled,
        readOnly,
    } = props;

    const strings = useTranslation(i18n);

    // NOTE: the schema validates the array as a whole, but the server rejects
    // single entries and keys those errors by index
    const errorObject = useMemo(() => getErrorObject(error), [error]);

    const handleGlideCodeChange = useCallback(
        (newGlideCode: string | undefined, index: number) => {
            const newValue = [...(value ?? [])];
            // NOTE: an emptied input reports undefined; the row is kept so
            // that it can be typed into again and is dropped on submit
            newValue[index] = newGlideCode ?? '';
            onChange(newValue, name);
        },
        [name, onChange, value],
    );

    const handleGlideCodeRemove = useCallback(
        (index: number) => {
            const newValue = [...(value ?? [])];
            newValue.splice(index, 1);
            onChange(newValue, name);
        },
        [name, onChange, value],
    );

    const handleGlideCodeAdd = useCallback(
        () => {
            onChange([...(value ?? []), ''], name);
        },
        [name, onChange, value],
    );

    return (
        <ListView
            layout="block"
            spacing="sm"
            className={className}
        >
            <NonFieldError error={getErrorString(error)} />
            <InputHint>
                {resolveToString(
                    strings.glideCodeHint,
                    { maxLength: MAX_GLIDE_CODE_LENGTH },
                )}
            </InputHint>
            {value?.map((glideCode, index) => (
                <InlineView
                    // NOTE: the codes are plain strings without a stable id;
                    // the inputs are controlled, so keying them by position is safe
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    spacing="xs"
                    after={(
                        <IconButton
                            name={index}
                            onClick={handleGlideCodeRemove}
                            styleVariant="action"
                            disabled={disabled || readOnly}
                            title={strings.removeGlideCodeButtonTitle}
                            ariaLabel={strings.removeGlideCodeButtonTitle}
                        >
                            <DeleteBinTwoLineIcon />
                        </IconButton>
                    )}
                >
                    <TextInput
                        name={index}
                        aria-label={strings.glideCodeInputLabel}
                        value={glideCode}
                        onChange={handleGlideCodeChange}
                        error={errorObject?.[index]}
                        maxLength={MAX_GLIDE_CODE_LENGTH}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                </InlineView>
            ))}
            <Button
                name={undefined}
                onClick={handleGlideCodeAdd}
                disabled={disabled || readOnly}
            >
                {strings.addGlideCodeButtonLabel}
            </Button>
        </ListView>
    );
}

export default GlideCodesInput;
