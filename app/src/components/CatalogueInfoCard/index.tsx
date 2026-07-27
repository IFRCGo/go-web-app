import { useCallback } from 'react';
import {
    Container,
    ListView,
    RawList,
} from '@ifrc-go/ui';

import Link, { type Props as LinkProps } from '#components/Link';

export type LinkData = LinkProps & {
    title: string;
}

const catalogueInfoKeySelector = (item: LinkData) => item.title;
interface Props {
    className?: string;
    title: string;
    data: LinkData[];
    description?: string;
}

function CatalogueInfoCard(props: Props) {
    const {
        className,
        title,
        data,
        description,
    } = props;

    const rendererParams = useCallback(
        (_: string, value: LinkData): LinkProps => {
            if (value.external) {
                return {
                    href: value.href,
                    children: value.title,
                    external: true,
                    withLinkIcon: value.withLinkIcon,
                };
            }

            return {
                to: value.to,
                urlParams: value.urlParams,
                urlSearch: value.urlSearch,
                urlHash: value.urlHash,
                children: value.title,
                withLinkIcon: value.withLinkIcon,
            };
        },
        [],
    );

    return (
        <Container
            className={className}
            heading={title}
            headingLevel={4}
            withHeaderBorder
            headerDescription={description}
            withPadding
            backgroundColor="foreground"
            boxShadow="md"
        >
            <ListView
                layout="block"
                spacing="sm"
                withSpacingOpticalCorrection
            >
                <RawList
                    data={data}
                    keySelector={catalogueInfoKeySelector}
                    renderer={Link}
                    rendererParams={rendererParams}
                />
            </ListView>
        </Container>
    );
}

export default CatalogueInfoCard;
