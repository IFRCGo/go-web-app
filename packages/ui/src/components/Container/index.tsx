import { useMemo } from 'react';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

import DefaultMessage from '#components/DefaultMessage';
import FilterBar from '#components/FilterBar';
import Footer from '#components/Footer';
import Header, { Props as HeaderProps } from '#components/Header';
import { Props as HeadingProps } from '#components/Heading';
import type { SpacingType } from '#components/types';
import useSpacingTokens from '#hooks/useSpacingTokens';

import styles from './styles.module.css';

type NumColumn = 2 | 3 | 4 | 5;
const numColumnToClassNameMap: Record<NumColumn, string> = {
    2: styles.twoColumns,
    3: styles.threeColumns,
    4: styles.fourColumns,
    5: styles.fiveColumns,
};

export interface Props {
    actions?: React.ReactNode;
    actionsContainerClassName?: string;
    children?: React.ReactNode;
    childrenContainerClassName?: string,
    className?: string;
    contentViewType?: 'grid' | 'vertical' | 'default';
    ellipsizeHeading?: boolean;
    filters?: React.ReactNode;
    filterActions?: React.ReactNode;
    footerActions?: React.ReactNode;
    footerActionsContainerClassName?: string;
    footerClassName?: string;
    footerContent?: React.ReactNode;
    footerContentClassName?: string;
    footerIcons?: React.ReactNode;
    headerClassName?: string;
    headerDescription?: React.ReactNode;
    headerDescriptionContainerClassName?: string;
    containerRef?: React.RefObject<HTMLDivElement>;
    headerElementRef?: HeaderProps['elementRef'];
    heading?: React.ReactNode;
    headingClassName?: string;
    headingContainerClassName?: string;
    headingDescription?: React.ReactNode;
    withCenteredHeaderDescription?: boolean;
    headingDescriptionContainerClassName?: string;
    headingLevel?: HeadingProps['level'],
    headingSectionClassName?: string;
    icons?: React.ReactNode;
    iconsContainerClassName?: string;
    numPreferredGridContentColumns?: NumColumn;
    spacing?: SpacingType;
    withHeaderBorder?: boolean;
    withFooterBorder?: boolean;
    withInternalPadding?: boolean;
    withOverflowInContent?: boolean;
    withoutWrapInHeading?: boolean;
    withoutWrapInFooter?: boolean;

    pending?: boolean;
    overlayPending?: boolean;
    empty?: boolean;
    errored?: boolean;
    filtered?: boolean;
    compactMessage?: boolean;

    emptyMessage?: React.ReactNode;
    pendingMessage?: React.ReactNode;
    errorMessage?: React.ReactNode;
    filteredEmptyMessage?: React.ReactNode;
}

function Container(props: Props) {
    const {
        actions,
        actionsContainerClassName,
        children,
        childrenContainerClassName,
        className,
        containerRef,
        contentViewType = 'default',
        ellipsizeHeading,
        filters,
        filterActions,
        footerActions,
        footerActionsContainerClassName,
        footerClassName,
        footerContent,
        footerContentClassName,
        footerIcons,
        headerClassName,
        headerDescription: headerDescriptionFromProps,
        withCenteredHeaderDescription,
        headerDescriptionContainerClassName,
        headerElementRef,
        heading,
        headingClassName,
        headingContainerClassName,
        headingDescription,
        headingDescriptionContainerClassName,
        headingLevel,
        headingSectionClassName,
        icons,
        iconsContainerClassName,
        numPreferredGridContentColumns = 2,
        spacing = 'default',
        withHeaderBorder = false,
        withFooterBorder = false,
        withOverflowInContent = false,
        withInternalPadding = false,
        withoutWrapInHeading = false,
        withoutWrapInFooter = false,

        pending = false,
        overlayPending = false,
        empty = false,
        errored = false,
        filtered = false,
        compactMessage = false,

        errorMessage,
        emptyMessage,
        pendingMessage,
        filteredEmptyMessage,
    } = props;

    const showFooter = footerIcons || footerContent || footerActions;
    const showHeader = heading
        || actions
        || icons
        || headerDescriptionFromProps
        || headingDescription;
    const gapSpacingTokens = useSpacingTokens({ spacing });
    const horizontalPaddingSpacingTokens = useSpacingTokens({
        spacing,
        mode: 'padding-h',
    });
    const verticalPaddingSpacingTokens = useSpacingTokens({
        spacing,
        mode: 'padding-v',
    });
    const childrenGapTokens = useSpacingTokens({
        spacing,
        mode: 'gap',
        inner: true,
    });

    const headerDescription = useMemo(
        () => {
            if (isNotDefined(headerDescriptionFromProps)) {
                return null;
            }

            if (!withCenteredHeaderDescription) {
                return headerDescriptionFromProps;
            }

            return (
                <div className={styles.centeredDescription}>
                    {headerDescriptionFromProps}
                </div>
            );
        },
        [headerDescriptionFromProps, withCenteredHeaderDescription],
    );

    if (
        !showHeader
            && !filters
            && !children
            && !showFooter
            && !empty
            && !pending
            && !errored
            && !filtered
    ) {
        return null;
    }

    return (
        <div
            ref={containerRef}
            className={_cs(
                styles.container,
                gapSpacingTokens,
                withInternalPadding && verticalPaddingSpacingTokens,
                withOverflowInContent && styles.withOverflowInContent,
                contentViewType === 'grid' && styles.withGridView,
                contentViewType === 'grid' && numColumnToClassNameMap[numPreferredGridContentColumns],
                contentViewType === 'vertical' && styles.withVerticalView,
                className,
            )}
        >
            {showHeader && (
                <Header
                    actions={actions}
                    className={_cs(
                        styles.header,
                        withInternalPadding && horizontalPaddingSpacingTokens,
                        headerClassName,
                    )}
                    elementRef={headerElementRef}
                    actionsContainerClassName={actionsContainerClassName}
                    ellipsizeHeading={ellipsizeHeading}
                    heading={heading}
                    headingLevel={headingLevel}
                    icons={icons}
                    iconsContainerClassName={iconsContainerClassName}
                    childrenContainerClassName={_cs(
                        withCenteredHeaderDescription && styles.centeredHeaderDescriptionContainer,
                        headerDescriptionContainerClassName,
                    )}
                    headingSectionClassName={headingSectionClassName}
                    headingClassName={headingClassName}
                    headingContainerClassName={headingContainerClassName}
                    wrapHeadingContent={!withoutWrapInHeading}
                    headingDescription={headingDescription}
                    headingDescriptionContainerClassName={headingDescriptionContainerClassName}
                    spacing={spacing}
                >
                    {headerDescription}
                </Header>
            )}
            {withHeaderBorder && <div className={styles.border} />}
            <FilterBar
                filters={filters}
                filterActions={filterActions}
                spacing={spacing}
                className={_cs(withInternalPadding && horizontalPaddingSpacingTokens)}
            />
            {(children || empty || pending || errored || filtered) && (
                <div
                    className={_cs(
                        styles.content,
                        contentViewType !== 'default' && childrenGapTokens,
                        withInternalPadding && horizontalPaddingSpacingTokens,
                        overlayPending && pending && styles.pendingOverlaid,
                        childrenContainerClassName,
                    )}
                >
                    <DefaultMessage
                        className={styles.message}
                        pending={pending}
                        filtered={filtered}
                        errored={errored}
                        empty={empty}
                        compact={compactMessage}
                        overlayPending={overlayPending}
                        emptyMessage={emptyMessage}
                        filteredEmptyMessage={filteredEmptyMessage}
                        pendingMessage={pendingMessage}
                        errorMessage={errorMessage}
                    />
                    {!empty && !errored && (!pending || overlayPending) && children}
                </div>
            )}
            {showFooter && withFooterBorder && <div className={styles.border} />}
            {showFooter && (
                <Footer
                    actions={footerActions}
                    icons={footerIcons}
                    childrenContainerClassName={footerContentClassName}
                    className={_cs(
                        styles.footer,
                        withInternalPadding && horizontalPaddingSpacingTokens,
                        footerClassName,
                    )}
                    actionsContainerClassName={footerActionsContainerClassName}
                    spacing={spacing}
                    withoutWrap={withoutWrapInFooter}
                >
                    {footerContent}
                </Footer>
            )}
        </div>
    );
}

export default Container;
