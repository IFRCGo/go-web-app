import {
    StackedProgressBar as PureStackedProgressBar,
    StackedProgressBarProps,
} from '@ifrc-go/ui';

function StackedProgressBar<const N>(props: StackedProgressBarProps<N>) {
    return (
        <PureStackedProgressBar {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default StackedProgressBar;
