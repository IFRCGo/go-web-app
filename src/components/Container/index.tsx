import { _cs } from '@togglecorp/fujs';

import useBasicLayout from '#hooks/useBasicLayout';
import Heading, { Props as HeadingProps } from '#components/Heading';
import styles from './styles.module.css';

interface Props {
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
    childrenContainerClassName?: string,
    withHeaderBorder?: boolean;
}

function Container(props: Props) {
    const {
        className,
        icons,
        heading,
        headingLevel,
        actions,
        children,
        childrenContainerClassName,
        footerIcons,
        footerContent,
        footerContentClassName,
        footerClassName,
        footerActions,
        withHeaderBorder,
    } = props;

    const {
        containerClassName: headerClassName,
        content: header,
    } = useBasicLayout({
        icons,
        children: (
            <Heading level={headingLevel}>
                {heading}
            </Heading>
        ),
        actions,
    });

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

    return (
        <div className={_cs(styles.container, className)}>
            <header className={headerClassName}>
                {header}
            </header>
            {withHeaderBorder && <div className={styles.border} />}
            <div className={childrenContainerClassName}>
                {children}
            </div>
            <footer className={footerContainerClassName}>
                {footer}
            </footer>
        </div>
    );
}

export default Container;
