import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import {
    Button,
    InlineLayout,
    ListView,
    NumberInput,
    TextInput,
} from '@ifrc-go/ui';
import {
    type ArrayError,
    getErrorObject,
    type PartialForm,
    type SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import { type components } from '#generated/types';

type Indicator = components['schemas']['Indicator'] & { client_id: string };
type IndicatorFormFields = PartialForm<Indicator, 'client_id'>

const defaultIndicatorValue: IndicatorFormFields = {
    client_id: '-1',
};

interface Props {
    value: IndicatorFormFields;
    error: ArrayError<IndicatorFormFields> | undefined;
    onChange: (value: SetValueArg<IndicatorFormFields>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    disabled?: boolean;
    readOnly?: boolean;
}

function IndicatorInput(props: Props) {
    const {
        error: errorFromProps,
        readOnly,
        onChange,
        value,
        index,
        onRemove,
        disabled,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultIndicatorValue);

    const error = (value && value.client_id && errorFromProps)
        ? getErrorObject(errorFromProps?.[value.client_id])
        : undefined;

    return (
        <InlineLayout
            after={(
                <Button
                    name={index}
                    onClick={onRemove}
                    styleVariant="action"
                    // FIXME: use translation
                    title="Remove"
                    disabled={disabled || readOnly}
                >
                    <DeleteBinTwoLineIcon />
                </Button>
            )}
            spacing="sm"
        >
            <ListView
                layout="grid"
                spacing="sm"
            >
                <TextInput
                    // FIXME: use strings
                    label="Title"
                    name="title"
                    value={value.title}
                    onChange={onFieldChange}
                    error={error?.title}
                    disabled={disabled}
                    readOnly={readOnly}
                />
                <NumberInput
                    // FIXME: use strings
                    label="Target"
                    name="target"
                    value={value.target}
                    onChange={onFieldChange}
                    error={error?.target}
                    disabled={disabled}
                    readOnly={readOnly}
                />
            </ListView>
        </InlineLayout>
    );
}

export default IndicatorInput;
