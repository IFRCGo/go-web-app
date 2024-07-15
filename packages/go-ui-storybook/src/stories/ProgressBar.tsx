import {
    ProgressBar as PureProgressBar,
    ProgressBarProps,
} from '@ifrc-go/ui';

function ProgressBar(props: ProgressBarProps) {
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <PureProgressBar {...props} />
    );
}

export default ProgressBar;
