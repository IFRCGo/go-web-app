import { _cs } from '@togglecorp/fujs';

import useBasicLayout from '#hooks/useBasicLayout';

import styles from './styles.module.css';

interface Props {
    actions?: React.ReactNode;
    actionsContainerClassName?: string;
    children: React.ReactNode;
    childrenContainerClassName?: string;
    className?: string;
    icons?: React.ReactNode;
    iconsContainerClassName?: string;
}

function Footer(props: Props) {
    const {
        actions,
        actionsContainerClassName,
        children,
        childrenContainerClassName,
        className,
        icons,
        iconsContainerClassName,
    } = props;

    const {
        content,
        containerClassName,
    } = useBasicLayout({
        actions,
        actionsContainerClassName,
        children,
        childrenContainerClassName,
        className,
        icons,
        iconsContainerClassName,
    });

    return (
        <footer
            className={_cs(
                styles.footer,
            )}
        >
            <div className={_cs(styles.footerContent, containerClassName)}>
                {content}
            </div>
        </footer>
    );
}

export default Footer;
