import {
    InputHint as PureInputHint,
    InputHintProps as PureInputHintProps,
} from '@ifrc-go/ui';

interface InputHintProps extends PureInputHintProps {}

function WrappedInputHint(props: InputHintProps) {
    return (
        <PureInputHint {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedInputHint;
