import {
    IconButton as PureIconButton,
    IconButtonProps,
} from '@ifrc-go/ui';

function IconButton<const N>(props: IconButtonProps<N>) {
    return (
        <PureIconButton {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default IconButton;
