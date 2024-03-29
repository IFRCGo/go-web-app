import { _cs } from '@togglecorp/fujs';

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
    filtersContainerClassName?: string;
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
    headingDescriptionContainerClassName?: string;
    headingLevel?: HeadingProps['level'],
    headingSectionClassName?: string;
    icons?: React.ReactNode;
    iconsContainerClassName?: string;
    numPreferredGridContentColumns?: NumColumn;
    spacing?: SpacingType;
    withGridViewInFilter?: boolean;
    withHeaderBorder?: boolean;
    withInternalPadding?: boolean;
    withoutWrapInHeading?: boolean;
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
        filtersContainerClassName,
        footerActions,
        footerActionsContainerClassName,
        footerClassName,
        footerContent,
        footerContentClassName,
        footerIcons,
        headerClassName,
        headerDescription,
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
        withGridViewInFilter = false,
        withHeaderBorder = false,
        withInternalPadding = false,
        withoutWrapInHeading = false,
    } = props;

    const showFooter = footerIcons || footerContent || footerActions;
    const showHeader = heading || actions || icons || headerDescription || headingDescription;
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
    const filterGapTokens = useSpacingTokens({
        spacing,
        mode: 'grid-gap',
    });

    if (!showHeader && !filters && !children && !showFooter) {
        return null;
    }

    return (
        <div
            ref={containerRef}
            className={_cs(
                styles.container,
                gapSpacingTokens,
                withInternalPadding && verticalPaddingSpacingTokens,
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
                    childrenContainerClassName={headerDescriptionContainerClassName}
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
            {filters && (
                <div
                    className={_cs(
                        styles.filter,
                        withGridViewInFilter && styles.withGridViewInFilter,
                        withGridViewInFilter && filterGapTokens,
                        filtersContainerClassName,
                        withInternalPadding && horizontalPaddingSpacingTokens,
                    )}
                >
                    {filters}
                </div>
            )}
            {children && (
                <div
                    className={_cs(
                        styles.content,
                        contentViewType !== 'default' && childrenGapTokens,
                        withInternalPadding && horizontalPaddingSpacingTokens,
                        childrenContainerClassName,
                    )}
                >
                    {children}
                </div>
            )}
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
                >
                    {footerContent}
                </Footer>
            )}
        </div>
    );
}

export default Container;
