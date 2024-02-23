import {
    Breadcrumbs as PureBreadcrumbs,
    BreadcrumbsProps as PureBreadcrumbsProps,
} from '@ifrc-go/ui';

interface BreadcrumbsProps extends PureBreadcrumbsProps {}

function WrappedBreadcrumbs(props: BreadcrumbsProps) {
    return (
        <PureBreadcrumbs {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedBreadcrumbs;
