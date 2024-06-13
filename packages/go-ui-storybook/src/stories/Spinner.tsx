import {
    Spinner as PureSpinner,
    SpinnerProps as PureSpinnerProps,
} from '@ifrc-go/ui';

interface SpinnerProps extends PureSpinnerProps {}

function Spinner(props: SpinnerProps) {
    return (
        <PureSpinner {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Spinner;
