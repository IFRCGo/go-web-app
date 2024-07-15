import {
    Breadcrumbs as PureBreadcrumbs,
    BreadcrumbsProps,
} from '@ifrc-go/ui';

function Breadcrumbs(props: BreadcrumbsProps) {
    return (
        <PureBreadcrumbs {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Breadcrumbs;
