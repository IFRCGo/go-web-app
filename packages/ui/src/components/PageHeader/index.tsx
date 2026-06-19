import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Description from '#components/Description';
import Heading from '#components/Heading';
import InlineView from '#components/InlineView';
import ListView from '#components/ListView';
import PageContainer from '#components/PageContainer';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    /** Red uppercase eyebrow shown above the heading. */
    overline?: React.ReactNode;
    heading?: React.ReactNode;
    description?: React.ReactNode;
    actions?: React.ReactNode;
    breadCrumbs?: React.ReactNode;
    info?: React.ReactNode;
    wikiLink?: React.ReactNode;
}

function PageHeader(props: Props) {
    const {
        className,
        overline,
        heading,
        description,
        actions,
        breadCrumbs,
        info,
        wikiLink,
    } = props;

    if (!(actions || breadCrumbs || info || description || heading || overline)) {
        return null;
    }

    return (
        <PageContainer
            containerAs="header"
            className={_cs(
                styles.pageHeader,
                className,
            )}
        >
            <ListView
                layout="block"
                spacing="xl"
            >
                <InlineView
                    after={(actions || wikiLink) && (
                        <ListView
                            withWrap
                            spacing="sm"
                        >
                            {actions}
                            {wikiLink}
                        </ListView>
                    )}
                    wrapBreakpoint="lg"
                >
                    {breadCrumbs}
                </InlineView>
                <ListView
                    layout="block"
                >
                    {overline && (
                        <div className={styles.overline}>
                            {overline}
                        </div>
                    )}
                    <Heading
                        level={1}
                        className={styles.heading}
                    >
                        { heading }
                    </Heading>
                    {description && (
                        <Description withCenteredContent>
                            { description }
                        </Description>
                    )}
                </ListView>
                {info}
            </ListView>
        </PageContainer>
    );
}

export default PageHeader;
