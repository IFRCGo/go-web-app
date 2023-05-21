import { _cs } from '@togglecorp/fujs';

import useBasicLayout from '#hooks/useBasicLayout';
import Header from '#components/Header';
import { Props as HeadingProps } from '#components/Heading';
import styles from './styles.module.css';

export interface Props {
    className?: string;
    icons?: React.ReactNode;
    heading?: React.ReactNode;
    headingLevel?: HeadingProps['level'],
    actions?: React.ReactNode;
    children: React.ReactNode;
    footerIcons?: React.ReactNode;
    footerContent?: React.ReactNode;
    footerContentClassName?: string;
    footerClassName?: string;
    footerActions?: React.ReactNode;
    headerDescription?: React.ReactNode;
    headerDescriptionClassName?: string;
    childrenContainerClassName?: string,
    withHeaderBorder?: boolean;
    ellipsizeHeading?: boolean;
}

function Container(props: Props) {
    const {
        className,
        icons,
        heading,
        headingLevel,
        actions,
        children,
        headerDescription,
        headerDescriptionClassName,
        childrenContainerClassName,
        footerIcons,
        footerContent,
        footerContentClassName,
        footerClassName,
        footerActions,
        withHeaderBorder,
        ellipsizeHeading,
    } = props;

    const {
        containerClassName: footerContainerClassName,
        content: footer,
    } = useBasicLayout({
        icons: footerIcons,
        children: footerContent,
        actions: footerActions,
        childrenContainerClassName: footerContentClassName,
        className: footerClassName,
    });

    const showFooter = footerIcons || footerContent || footerActions;

    return (
        <div className={_cs(styles.container, className)}>
            <Header
                className={styles.header}
                headingLevel={headingLevel}
                heading={heading}
                actions={actions}
                icons={icons}
                ellipsizeHeading={ellipsizeHeading}
            />
            {headerDescription && (
                <div className={_cs(headerDescriptionClassName)}>
                    {headerDescription}
                </div>
            )}
            {withHeaderBorder && <div className={styles.border} />}
            <div className={_cs(styles.content, childrenContainerClassName)}>
                {children}
            </div>
            {showFooter && (
                <footer
                    className={_cs(styles.footer, footerContainerClassName)}
                >
                    {footer}
                </footer>
            )}
        </div>
    );
}

export default Container;
