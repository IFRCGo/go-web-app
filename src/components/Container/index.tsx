import { _cs } from '@togglecorp/fujs';

import Header, { Props as HeaderProps } from '#components/Header';
import Footer from '#components/Footer';
import { Props as HeadingProps } from '#components/Heading';

import styles from './styles.module.css';

type SpacingType = 'none' | 'compact' | 'cozy' | 'comfortable' | 'relaxed' | 'loose';

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
    headerDescriptionClassName?: string;
    headerElementRef?: HeaderProps['elementRef'];
    heading?: React.ReactNode;
    headingContainerClassName?: string;
    headingLevel?: HeadingProps['level'],
    icons?: React.ReactNode;
    spacing?: SpacingType;
    withHeaderBorder?: boolean;
    withInternalPadding?: boolean;
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
        headerDescriptionClassName,
        headerElementRef,
        heading,
        headingContainerClassName,
        headingLevel,
        icons,
        spacing = 'comfortable',
        withHeaderBorder,
        withInternalPadding,
    } = props;

    const showFooter = footerIcons || footerContent || footerActions;

    return (
        <div
            className={_cs(
                styles.container,
                spacingTypeToClassNameMap[spacing],
                withInternalPadding && styles.withInternalPadding,
                className,
            )}
        >
            <Header
                actions={actions}
                className={_cs(styles.header, headerClassName)}
                elementRef={headerElementRef}
                actionsContainerClassName={actionsContainerClassName}
                ellipsizeHeading={ellipsizeHeading}
                heading={heading}
                headingLevel={headingLevel}
                icons={icons}
                childrenContainerClassName={headerDescriptionClassName}
                headingContainerClassName={headingContainerClassName}
            >
                {headerDescription}
            </Header>
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
