import {
    InputError as PureInputError,
    InputErrorProps as PureInputErrorProps,
} from '@ifrc-go/ui';

interface InputErrorProps extends PureInputErrorProps {}

function InputError(props: InputErrorProps) {
    return (
        <PureInputError {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default InputError;
