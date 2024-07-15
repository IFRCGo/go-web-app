import {
    ConfirmButton as PureConfirmButton,
    ConfirmButtonProps,
} from '@ifrc-go/ui';

function ConfirmButton<const N>(props: ConfirmButtonProps<N>) {
    return (
        <PureConfirmButton {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default ConfirmButton;
