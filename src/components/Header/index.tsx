import { _cs } from '@togglecorp/fujs';

import Heading, { Props as HeadingProps } from '#components/Heading';
import useBasicLayout from '#hooks/useBasicLayout';

import styles from './styles.module.css';

interface Props {
    actions?: React.ReactNode;
    actionsContainerClassName?: string;
    children?: React.ReactNode;
    childrenContainerClassName?: string;
    className?: string;
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
        ellipsizeHeading,
        heading,
        headingLevel,
        icons,
        iconsContainerClassName,
    } = props;

    const {
        content,
        containerClassName,
    } = useBasicLayout({
        actions,
        actionsContainerClassName,
        children: (
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
        ),
        childrenContainerClassName: _cs(styles.headingContainer, childrenContainerClassName),
        className,
        icons,
        iconsContainerClassName,
    });

    return (
        <header
            className={_cs(
                styles.header,
                ellipsizeHeading && styles.headingEllipsized,
            )}
        >
            <div className={_cs(styles.headerContent, containerClassName)}>
                {content}
            </div>
            <div className={styles.description}>
                {children}
            </div>
        </header>
    );
}

export default Header;
