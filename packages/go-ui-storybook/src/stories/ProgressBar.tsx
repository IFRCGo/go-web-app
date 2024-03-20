import {
    ProgressBar as PureProgressBar,
    ProgressBarProps as PureProgressBarProps,
} from '@ifrc-go/ui';

interface ProgressBarProps extends PureProgressBarProps{}

function WrappedProgressBar(props: ProgressBarProps) {
    return (
    // eslint-disable-next-line react/jsx-props-no-spreading
        <PureProgressBar {...props} />
    );
}

export default WrappedProgressBar;
