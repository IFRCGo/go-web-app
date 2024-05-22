import {
    Portal as PurePortal,
    PortalProps as PurePortalProps,
} from '@ifrc-go/ui';

interface PortalProps extends PurePortalProps {}

function WrappedPortal(props: PortalProps) {
    return (
        <PurePortal {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedPortal;
