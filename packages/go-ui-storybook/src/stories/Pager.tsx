import {
    Pager as PurePager,
    type PagerProps,
} from '@ifrc-go/ui';

function Pager(props: PagerProps) {
    return (
        <PurePager {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Pager;
