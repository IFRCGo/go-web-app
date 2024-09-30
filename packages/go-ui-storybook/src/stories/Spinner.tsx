import {
    Spinner as PureSpinner,
    type SpinnerProps,
} from '@ifrc-go/ui';

function Spinner(props: SpinnerProps) {
    return (
        <PureSpinner {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Spinner;
