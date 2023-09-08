import { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import Container from '#components/Container';
import Link, { Props as LinkProps } from '#components/Link';
import List from '#components/List';

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
                    to: value.to,
                    children: value.title,
                    external: true,
                    withExternalLinkIcon: value.withExternalLinkIcon,
                    withForwardIcon: value.withForwardIcon,
                };
            }

            return {
                to: value.to,
                urlParams: value.urlParams,
                urlSearch: value.urlSearch,
                urlHash: value.urlHash,
                children: value.title,
                withExternalLinkIcon: value.withExternalLinkIcon,
                withForwardIcon: value.withForwardIcon,
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
