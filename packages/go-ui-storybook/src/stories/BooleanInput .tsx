import {
    BooleanInput as PureBooleanInput,
    BooleanInputProps as PureBooleanInputProps,
} from '@ifrc-go/ui';

type WrappedBooleanInputProps = PureBooleanInputProps<string>;

function WrappedBooleanInput(props: WrappedBooleanInputProps) {
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <PureBooleanInput {...props} />
    );
}

export default WrappedBooleanInput;
