import {
    TopBanner as PureTopBanner,
    TopBannerProps as PureTopBannerProps,
} from '@ifrc-go/ui';

interface TopBannerProps extends PureTopBannerProps {}

function WrappedTopBanner(props: TopBannerProps) {
    return (
        <PureTopBanner variant="warning" {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedTopBanner;
