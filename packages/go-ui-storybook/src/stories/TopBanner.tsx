import {
    TopBanner as PureTopBanner,
    TopBannerProps,
} from '@ifrc-go/ui';

function TopBanner(props: TopBannerProps) {
    return (
        <PureTopBanner {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default TopBanner;
