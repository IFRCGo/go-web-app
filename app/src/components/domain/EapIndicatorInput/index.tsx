import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import {
    IconButton,
    InlineLayout,
    ListView,
    NumberInput,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    type ArrayError,
    getErrorObject,
    type LeafError,
    type PartialForm,
    type SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import { type components } from '#generated/types';

import i18n from './i18n.json';

type Indicator = components<'write'>['schemas']['Indicator'] & { client_id: string };
type IndicatorFormFields = PartialForm<Indicator, 'client_id'>;

const defaultIndicatorValue: IndicatorFormFields = {
    client_id: '-1',
};

interface Props {
    value: IndicatorFormFields;
    error: ArrayError<IndicatorFormFields> | LeafError | undefined;
    onChange: (value: SetValueArg<IndicatorFormFields>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    disabled?: boolean;
    readOnly?: boolean;
}

function EapIndicatorInput(props: Props) {
    const {
        error: errorFromProps,
        readOnly,
        onChange,
        value,
        index,
        onRemove,
        disabled,
    } = props;

    const strings = useTranslation(i18n);

    const onFieldChange = useFormObject(index, onChange, defaultIndicatorValue);

    const error = value && value.client_id && errorFromProps
        ? getErrorObject(getErrorObject(errorFromProps)?.[value.client_id])
        : undefined;

    return (
        <InlineLayout
            after={(
                <IconButton
                    name={index}
                    onClick={onRemove}
                    title={strings.removeButtonTitle}
                    ariaLabel={strings.removeButtonTitle}
                    disabled={disabled || readOnly}
                >
                    <DeleteBinTwoLineIcon />
                </IconButton>
            )}
            spacing="sm"
        >
            <ListView
                layout="grid"
                spacing="sm"
            >
                <TextInput
                    label={strings.titleInputLabel}
                    name="title"
                    value={value.title}
                    onChange={onFieldChange}
                    error={error?.title}
                    disabled={disabled}
                    readOnly={readOnly}
                    required
                />
                <NumberInput
                    label={strings.targetInputLabel}
                    name="target"
                    value={value.target}
                    onChange={onFieldChange}
                    error={error?.target}
                    disabled={disabled}
                    readOnly={readOnly}
                    required
                />
            </ListView>
        </InlineLayout>
    );
}

export default EapIndicatorInput;
