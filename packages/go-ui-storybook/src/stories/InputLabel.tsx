import {
    InputLabel as PureInputLabel,
    InputLabelProps as PureInputLabelProps,
} from '@ifrc-go/ui';

interface InputLabelProps extends PureInputLabelProps {}

function WrappedInputLabel(props: InputLabelProps) {
    return (
        <PureInputLabel {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedInputLabel;
