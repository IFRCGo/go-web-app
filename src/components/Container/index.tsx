import { _cs } from '@togglecorp/fujs';

import Header, { Props as HeaderProps } from '#components/Header';
import Footer from '#components/Footer';
import { Props as HeadingProps } from '#components/Heading';
import styles from './styles.module.css';

export interface Props {
    className?: string;
    icons?: React.ReactNode;
    heading?: React.ReactNode;
    headingLevel?: HeadingProps['level'],
    headingContainerClassName?: string;
    actions?: React.ReactNode;
    actionsContainerClassName?: string;
    children: React.ReactNode;
    footerIcons?: React.ReactNode;
    footerContent?: React.ReactNode;
    footerContentClassName?: string;
    footerClassName?: string;
    footerActions?: React.ReactNode;
    footerActionsContainerClassName?: string;
    headerClassName?: string;
    headerDescription?: React.ReactNode;
    headerDescriptionClassName?: string;
    headerElementRef?: HeaderProps['elementRef'];
    childrenContainerClassName?: string,
    withHeaderBorder?: boolean;
    ellipsizeHeading?: boolean;
}

function Container(props: Props) {
    const {
        actions,
        actionsContainerClassName,
        children,
        childrenContainerClassName,
        className,
        ellipsizeHeading,
        footerActions,
        footerActionsContainerClassName,
        footerClassName,
        footerContent,
        footerContentClassName,
        footerIcons,
        headerClassName,
        headingContainerClassName,
        headerDescription,
        headerDescriptionClassName,
        headerElementRef,
        heading,
        headingLevel,
        icons,
        withHeaderBorder,
    } = props;

    const showFooter = footerIcons || footerContent || footerActions;

    return (
        <div className={_cs(styles.container, className)}>
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
