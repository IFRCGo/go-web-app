import {
    StackedProgressBar as PureStackedProgressBar,
    StackedProgressBarProps as PureStackedProgressBarProps,
} from '@ifrc-go/ui';

interface StackedProgressBarProps<N> extends PureStackedProgressBarProps<N> {}

function ProgressBar<const N>(props: StackedProgressBarProps<N>) {
    return (
        <PureStackedProgressBar {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default ProgressBar;
