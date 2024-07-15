import {
    Button as PureButton,
    ButtonProps as PureButtonProps,
} from '@ifrc-go/ui';

interface ButtonProps<N> extends PureButtonProps<N> {}

function Button<const N>(props: ButtonProps<N>) {
    return (
        <PureButton {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Button;
