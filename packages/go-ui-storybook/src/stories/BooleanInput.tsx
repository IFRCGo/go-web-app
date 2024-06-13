import {
    BooleanInput as PureBooleanInput,
    BooleanInputProps as PureBooleanInputProps,
} from '@ifrc-go/ui';

type WrappedBooleanInputProps = PureBooleanInputProps<string>;

function BooleanInput(props: WrappedBooleanInputProps) {
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <PureBooleanInput {...props} />
    );
}

export default BooleanInput;
