import { _cs } from '@togglecorp/fujs';

import Header, { Props as HeaderProps } from '#components/Header';
import Footer from '#components/Footer';
import { Props as HeadingProps } from '#components/Heading';
import type { SpacingType } from '#components/types';

import styles from './styles.module.css';

const spacingTypeToClassNameMap: Record<SpacingType, string> = {
    none: styles.noSpacing,
    compact: styles.compactSpacing,
    cozy: styles.cozySpacing,
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
    headingDescription?: React.ReactNode;
    headingDescriptionContainerClassName?: string;
    headerElementRef?: HeaderProps['elementRef'];
    heading?: React.ReactNode;
    headingClassName?: string;
    headingSectionClassName?: string;
    headingContainerClassName?: string;
    headingLevel?: HeadingProps['level'],
    icons?: React.ReactNode;
    spacing?: SpacingType;
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
        headingDescription,
        headingDescriptionContainerClassName,
        headerElementRef,
        heading,
        headingClassName,
        headingSectionClassName,
        headingContainerClassName,
        headingLevel,
        icons,
        spacing = 'comfortable',
        withHeaderBorder,
        withInternalPadding,
        withoutWrapInHeading = false,
    } = props;

    const showFooter = footerIcons || footerContent || footerActions;
    const showHeader = heading || actions || icons || headerDescription || headingDescription;

    return (
        <div
            className={_cs(
                styles.container,
                spacingTypeToClassNameMap[spacing],
                withInternalPadding && styles.withInternalPadding,
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
                >
                    {headerDescription}
                </Header>
            )}
            {withHeaderBorder && <div className={styles.border} />}
            {filters && (
                <div className={_cs(styles.filter, filtersContainerClassName)}>
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
