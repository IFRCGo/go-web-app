import {
    ProgressBar as PureProgressBar,
    ProgressBarProps as PureProgressBarProps,
} from '@ifrc-go/ui';

interface ProgressBarProps extends PureProgressBarProps{}

function WrappedButton(props: ProgressBarProps) {
    return (
        <PureProgressBar {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedButton;
