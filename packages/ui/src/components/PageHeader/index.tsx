import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Description from '#components/Description';
import Heading, { Props as HeadingProps } from '#components/Heading';
import InlineView from '#components/InlineView';
import ListView from '#components/ListView';
import PageContainer from '#components/PageContainer';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    heading?: React.ReactNode;
    description?: React.ReactNode;
    actions?: React.ReactNode;
    breadCrumbs?: React.ReactNode;
    info?: React.ReactNode;
    wikiLink?: React.ReactNode;
    background?: React.ReactNode;
    headingColorVariant?: HeadingProps['colorVariant'];
}

function PageHeader(props: Props) {
    const {
        className,
        heading,
        description,
        actions,
        breadCrumbs,
        info,
        wikiLink,
        background,
        headingColorVariant,
    } = props;

    if (!(actions || breadCrumbs || info || description || heading)) {
        return null;
    }

    return (
        <PageContainer
            containerAs="header"
            className={_cs(
                styles.pageHeader,
                className,
            )}
            background={background}
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
                    <Heading
                        level={1}
                        className={styles.heading}
                        colorVariant={headingColorVariant}
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
