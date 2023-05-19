import React from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import PageContainer from '#components/PageContainer';
import Heading from '#components/Heading';
import useBasicLayout from '#hooks/useBasicLayout';
import styles from './styles.module.css';

interface Props {
    className?: string;
    title?: string;
    actions?: React.ReactNode;
    heading?: React.ReactNode;
    description?: React.ReactNode;
    breadCrumbs?: React.ReactNode;
    info?: React.ReactNode;
    children?: React.ReactNode;
    mainSectionClassName?: string;
    infoContainerClassName?: string;
    withMainContentBackground?: boolean;
    wikiLink?: React.ReactNode;
}

function Page(props: Props) {
    const {
        className,
        title,
        actions,
        heading,
        description,
        breadCrumbs,
        info,
        children,
        mainSectionClassName,
        infoContainerClassName,
        withMainContentBackground,
        wikiLink,
    } = props;

    React.useEffect(() => {
        if (isDefined(title)) {
            document.title = title;
        }
    }, [title]);

    const {
        containerClassName: headerClassName,
        content: headerContent,
    } = useBasicLayout({
        icons: breadCrumbs,
        actions: (
            <>
                {actions}
                {wikiLink}
            </>
        ),
        childrenContainerClassName: styles.headingSection,
        children: (
            <>
                <Heading
                    level={1}
                    className={styles.heading}
                >
                    { heading }
                </Heading>
                {description && (
                    <div className={styles.description}>
                        { description }
                    </div>
                )}
                <div className={infoContainerClassName}>
                    {info}
                </div>
            </>
        ),
    });

    const showPageContainer = !!breadCrumbs || !!heading || !!description || !!info || !!actions || !!wikiLink;

    return (
        <div
            className={_cs(
                styles.page,
                withMainContentBackground && styles.withMainContentBackground,
                className,
            )}
        >
            {showPageContainer && (
                <PageContainer
                    contentAs="header"
                    className={_cs(
                        styles.pageHeader,
                        className,
                    )}
                    contentClassName={headerClassName}
                >
                    {headerContent}
                </PageContainer>
            )}
            <PageContainer
                contentAs="main"
                contentClassName={_cs(
                    styles.mainSection,
                    mainSectionClassName,
                )}
            >
                { children }
            </PageContainer>
        </div>
    );
}

export default Page;
