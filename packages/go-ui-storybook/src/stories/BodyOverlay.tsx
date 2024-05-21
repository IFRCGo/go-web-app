import {
    BodyOverlay as PureBodyOverlay,
    BodyOverlayProps as PureBodyOverlayProps,
} from '@ifrc-go/ui';

interface BodyOverlayProps extends PureBodyOverlayProps {}

function WrappedBodyOverlay(props: BodyOverlayProps) {
    return (
        <PureBodyOverlay {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedBodyOverlay;
