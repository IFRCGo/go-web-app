import {
    Overlay as PureOverlay,
    OverlayProps as PureOverlayProps,
} from '@ifrc-go/ui';

interface OverlayProps extends PureOverlayProps {}

function Overlay(props: OverlayProps) {
    return (
        <PureOverlay {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Overlay;
