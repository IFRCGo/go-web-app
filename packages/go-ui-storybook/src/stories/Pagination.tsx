import {
    Pagination as PurePagination,
    PaginationProps,
} from '@ifrc-go/ui';

function Pagination(props: PaginationProps) {
    return (
        <PurePagination {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Pagination;
