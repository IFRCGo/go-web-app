import { useCallback } from 'react';
import { Breadcrumbs } from '@ifrc-go/ui';

import Link, { type InternalLinkProps } from '../Link';

interface RouteData {
    to: InternalLinkProps['to'];
    label: React.ReactNode;
    urlParams?: Record<string, string | number | null | undefined>;
}

interface GoBreadcrumbsProps {
    routeData: RouteData[]
}

function GoBreadcrumbs(props: GoBreadcrumbsProps) {
    const { routeData } = props;

    const rendererParams = useCallback((_: RouteData['to'], item: RouteData)
    : InternalLinkProps => (
        {
            to: item.to,
            urlParams: item.urlParams,
        }
    ), []);

    return (
        <Breadcrumbs
            <
                RouteData['to'],
                RouteData,
                (InternalLinkProps & { children: React.ReactNode })
            >
            data={routeData}
            keySelector={(datum) => datum.to}
            labelSelector={(datum) => datum.label}
            renderer={Link}
            rendererParams={rendererParams}
        />
    );
}

export default GoBreadcrumbs;
