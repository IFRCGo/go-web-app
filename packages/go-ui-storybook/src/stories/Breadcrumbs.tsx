import {
    Breadcrumbs as PureBreadcrumbs,
    BreadcrumbsProps,
} from '@ifrc-go/ui';

function Breadcrumbs<KEY, DATUM, RENDERER_PROPS extends { children: React.ReactNode }>(
    props: BreadcrumbsProps<KEY, DATUM, RENDERER_PROPS>,
) {
    return (
        <PureBreadcrumbs {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Breadcrumbs;
