import {
    IconButton as PureIconButton,
    IconButtonProps as PureIconButtonProps,
} from '@ifrc-go/ui';

interface IconButtonProps<N> extends PureIconButtonProps<N> {}

function WrappedIconButton<const N>(props: IconButtonProps<N>) {
    return (
        <PureIconButton {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedIconButton;
