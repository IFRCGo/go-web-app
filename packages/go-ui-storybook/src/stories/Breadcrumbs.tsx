import {
    Breadcrumbs as PureBreadcrumbs,
    BreadcrumbsProps as PureBreadcrumbsProps,
} from '@ifrc-go/ui';

interface BreadcrumbsProps extends PureBreadcrumbsProps {}

function Breadcrumbs(props: BreadcrumbsProps) {
    return (
        <PureBreadcrumbs {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Breadcrumbs;
