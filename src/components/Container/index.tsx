import { _cs } from '@togglecorp/fujs';

import Header, { Props as HeaderProps } from '#components/Header';
import Footer from '#components/Footer';
import { Props as HeadingProps } from '#components/Heading';
import type { SpacingType } from '#components/types';

import styles from './styles.module.css';

type NumColumn = 2 | 3 | 4 | 5;
const numColumnToClassNameMap: Record<NumColumn, string> = {
    2: styles.twoColumn,
    3: styles.threeColumn,
    4: styles.fourColumn,
    5: styles.fiveColumn,
};

const spacingTypeToClassNameMap: Record<SpacingType, string> = {
    none: styles.noSpacing,
    condensed: styles.condensedSpacing,
    compact: styles.compactSpacing,
    cozy: styles.cozySpacing,
    default: styles.defaultSpacing,
    comfortable: styles.comfortableSpacing,
    relaxed: styles.relaxedSpacing,
    loose: styles.looseSpacing,
};

export interface Props {
    actions?: React.ReactNode;
    actionsContainerClassName?: string;
    children: React.ReactNode;
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
    headerElementRef?: HeaderProps['elementRef'];
    heading?: React.ReactNode;
    headingClassName?: string;
    headingContainerClassName?: string;
    headingDescription?: React.ReactNode;
    headingDescriptionContainerClassName?: string;
    headingLevel?: HeadingProps['level'],
    headingSectionClassName?: string;
    icons?: React.ReactNode;
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
        numPreferredGridContentColumns = 2,
        spacing = 'default',
        withGridViewInFilter = false,
        withHeaderBorder = false,
        withInternalPadding = false,
        withoutWrapInHeading = false,
    } = props;

    const showFooter = footerIcons || footerContent || footerActions;
    const showHeader = heading || actions || icons || headerDescription || headingDescription;

    if (!showHeader && !filters && !children && !showFooter) {
        return null;
    }

    return (
        <div
            className={_cs(
                styles.container,
                spacingTypeToClassNameMap[spacing],
                withInternalPadding && styles.withInternalPadding,
                contentViewType === 'grid' && styles.withGridView,
                contentViewType === 'grid' && numColumnToClassNameMap[numPreferredGridContentColumns],
                contentViewType === 'vertical' && styles.withVerticalView,
                className,
            )}
        >
            {showHeader && (
                <Header
                    actions={actions}
                    className={_cs(styles.header, headerClassName)}
                    elementRef={headerElementRef}
                    actionsContainerClassName={actionsContainerClassName}
                    ellipsizeHeading={ellipsizeHeading}
                    heading={heading}
                    headingLevel={headingLevel}
                    icons={icons}
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
                        filtersContainerClassName,
                    )}
                >
                    {filters}
                </div>
            )}
            {children && (
                <div className={_cs(styles.content, childrenContainerClassName)}>
                    {children}
                </div>
            )}
            {showFooter && (
                <Footer
                    actions={footerActions}
                    icons={footerIcons}
                    childrenContainerClassName={footerContentClassName}
                    className={_cs(styles.footer, footerClassName)}
                    actionsContainerClassName={footerActionsContainerClassName}
                >
                    {footerContent}
                </Footer>
            )}
        </div>
    );
}

export default Container;
