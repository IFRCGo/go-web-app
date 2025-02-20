import { useCallback } from 'react';
import {
    Container,
    List,
} from '@ifrc-go/ui';
import { _cs } from '@togglecorp/fujs';

import Link, { type Props as LinkProps } from '#components/Link';

import styles from './styles.module.css';

export type LinkData = LinkProps & {
    title: string;
}

const catalogueInfoKeySelector = (item: LinkData) => item.title;
interface Props {
    className?: string;
    title: string;
    data: LinkData[];
    description?: string;
    descriptionClassName?: string;
}

function CatalogueInfoCard(props: Props) {
    const {
        className,
        title,
        data,
        description,
        descriptionClassName,
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
            className={_cs(styles.catalogueInfoCard, className)}
            heading={title}
            headingLevel={4}
            withHeaderBorder
            withInternalPadding
            headerDescriptionContainerClassName={descriptionClassName}
            headerDescription={description}
            spacing="comfortable"
        >
            <List
                className={styles.list}
                data={data}
                keySelector={catalogueInfoKeySelector}
                renderer={Link}
                errored={false}
                pending={false}
                filtered={false}
                rendererParams={rendererParams}
                compact
            />
        </Container>
    );
}

export default CatalogueInfoCard;
