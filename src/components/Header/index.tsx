import { _cs } from '@togglecorp/fujs';

import Heading, { Props as HeadingProps } from '#components/Heading';
import useBasicLayout from '#hooks/useBasicLayout';

import styles from './styles.module.css';

interface Props {
    icons?: React.ReactNode;
    actions?: React.ReactNode;
    heading: React.ReactNode;
    headingLevel?: HeadingProps['level'];
    className?: string;
    children?: React.ReactNode;
    ellipsizeHeading?: boolean;
}

function Header(props: Props) {
    const {
        icons,
        actions,
        heading,
        className,
        headingLevel,
        children,
        ellipsizeHeading,
    } = props;

    const {
        content,
        containerClassName,
    } = useBasicLayout({
        icons,
        actions,
        childrenContainerClassName: styles.headingContainer,
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
        className,
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
