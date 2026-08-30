import {
    ButtonLayout as PureButtonLayout,
    ButtonLayoutProps,
} from '@ifrc-go/ui';

function ButtonLayout(props: ButtonLayoutProps) {
    return (
        <PureButtonLayout {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default ButtonLayout;
