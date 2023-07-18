import { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import Link, { Props as LinkProps } from '#components/Link';
import List from '#components/List';
import Header from '#components/Header';

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
        (_: string, value: LinkProps) => ({
            to: value.to,
            children: value.title,
            className: styles.link,
            withExternalLinkIcon: value.withExternalLinkIcon,
            withForwardIcon: value.withForwardIcon,
        }),
        [],
    );

    return (
        <div className={_cs(styles.catalogueInfoCard, className)}>
            <Header
                className={styles.header}
                heading={title}
                headingLevel={4}
            />
            <div className={styles.divider} />
            {description && (
                <div className={_cs(styles.description, descriptionClassName)}>
                    {description}
                </div>
            )}
            <List
                data={data}
                keySelector={catalogueInfoKeySelector}
                renderer={Link}
                errored={false}
                pending={false}
                filtered={false}
                rendererParams={rendererParams}
            />
        </div>
    );
}

export default CatalogueInfoCard;
