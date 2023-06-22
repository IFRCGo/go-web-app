import { _cs } from '@togglecorp/fujs';

import Heading, { Props as HeadingProps } from '#components/Heading';
import useBasicLayout from '#hooks/useBasicLayout';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    elementRef?: React.Ref<HTMLDivElement>;
    ellipsizeHeading?: boolean;

    actions?: React.ReactNode;
    actionsContainerClassName?: string;

    children?: React.ReactNode;
    childrenContainerClassName?: string;

    heading: React.ReactNode;
    headingLevel?: HeadingProps['level'];
    headingContainerClassName?: string;

    icons?: React.ReactNode;
    iconsContainerClassName?: string;
}

function Header(props: Props) {
    const {
        actions,
        actionsContainerClassName,
        children,
        childrenContainerClassName,
        className,
        elementRef,
        ellipsizeHeading,
        heading,
        headingLevel,
        icons,
        iconsContainerClassName,
        headingContainerClassName,
    } = props;

    const headingComp = heading ? (
        <Heading
            level={headingLevel}
            className={styles.heading}
        >
            {ellipsizeHeading ? (
                <div className={styles.overflowWrapper}>
                    {heading}
                </div>
            ) : heading}
        </Heading>
    ) : undefined;

    const {
        content,
        containerClassName,
    } = useBasicLayout({
        actions,
        actionsContainerClassName,
        children: headingComp,
        childrenContainerClassName: styles.headingContainer,
        className: headingContainerClassName,
        icons,
        iconsContainerClassName,
    });

    if (!content && !children) {
        return null;
    }

    return (
        <div
            className={_cs(
                styles.header,
                className,
                ellipsizeHeading && styles.headingEllipsized,
            )}
            ref={elementRef}
        >
            {content && (
                <div className={_cs(styles.headerContent, containerClassName)}>
                    {content}
                </div>
            )}
            {children && (
                <div className={_cs(styles.description, childrenContainerClassName)}>
                    {children}
                </div>
            )}
        </div>
    );
}

export default Header;
