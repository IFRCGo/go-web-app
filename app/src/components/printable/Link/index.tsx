import {
    _cs,
    isFalsyString,
} from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
    className?: string;
    href: string | undefined | null;
    children: React.ReactNode;
}

function Link(props: Props) {
    const {
        className,
        href,
        children,
    } = props;

    if (isFalsyString(href)) {
        return null;
    }

    return (
        <a
            className={_cs(styles.link, className)}
            target="_blank"
            rel="noopener noreferrer"
            href={href}
        >
            {children}
        </a>
    );
}

export default Link;
