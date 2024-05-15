import {
    Pager as PurePager,
    PagerProps as PurePagerProps,
} from '@ifrc-go/ui';

interface PagerProps extends PurePagerProps {}

function WrappedPager(props: PagerProps) {
    return (
        <PurePager {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedPager;
