import {
    ProgressBar as PureProgressBar,
    type ProgressBarProps,
} from '@ifrc-go/ui';

function ProgressBar(props: ProgressBarProps) {
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <PureProgressBar {...props} />
    );
}

export default ProgressBar;
