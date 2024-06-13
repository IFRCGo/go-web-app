import {
    Portal as PurePortal,
    PortalProps as PurePortalProps,
} from '@ifrc-go/ui';

interface PortalProps extends PurePortalProps {}

function Portal(props: PortalProps) {
    return (
        <PurePortal {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Portal;
