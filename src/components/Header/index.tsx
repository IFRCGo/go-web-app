import { _cs } from '@togglecorp/fujs';

import Heading, { Props as HeadingProps } from '#components/Heading';
import useBasicLayout from '#hooks/useBasicLayout';

import styles from './styles.module.css';

export interface Props {
    actions?: React.ReactNode;
    actionsContainerClassName?: string;
    children?: React.ReactNode;
    childrenContainerClassName?: string;
    className?: string;
    elementRef?: React.Ref<HTMLDivElement>;
    ellipsizeHeading?: boolean;
    heading: React.ReactNode;
    headingLevel?: HeadingProps['level'];
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
        childrenContainerClassName: _cs(styles.headingContainer, childrenContainerClassName),
        className,
        icons,
        iconsContainerClassName,
    });

    if (!content && !children) {
        return null;
    }

    return (
        <header
            className={_cs(
                styles.header,
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
                <div className={styles.description}>
                    {children}
                </div>
            )}
        </header>
    );
}

export default Header;
