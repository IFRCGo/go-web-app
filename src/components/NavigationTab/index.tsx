import { useCallback, useContext } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    NavLink,
    NavLinkProps,
} from 'react-router-dom';

import NavigationTabContext from '#contexts/navigation-tab';

import styles from './styles.module.css';

interface Props {
    className?: string;
    children?: React.ReactNode;
    to: string;
}

function NavigationTab(props: Props) {
    const {
        children,
        to,
        className,
    } = props;

    const { variant } = useContext(NavigationTabContext);

    const getClassName: Exclude<NavLinkProps['className'], string | undefined> = useCallback(
        ({ isActive }) => {
            const defaultClassName = _cs(
                styles.navigationTab,
                variant === 'primary' && styles.primary,
                variant === 'secondary' && styles.secondary,
                className,
            );

            if (!isActive) {
                return defaultClassName;
            }

            return _cs(
                styles.active,
                defaultClassName,
            );
        },
        [variant, className],
    );

    return (
        <NavLink
            to={to}
            className={getClassName}
        >
            <div className={styles.dummy} />
            <div className={styles.childrenWrapper}>
                {children}
            </div>
            <div className={styles.dummy} />
        </NavLink>
    );
}

export default NavigationTab;
