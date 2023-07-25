import { useCallback, useContext } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    NavLink,
    NavLinkProps,
} from 'react-router-dom';
import { CheckLineIcon } from '@ifrc-go/icons';

import NavigationTabContext from '#contexts/navigation-tab';

import styles from './styles.module.css';

interface Props {
    className?: string;
    children?: React.ReactNode;
    stepCompleted?: boolean;
    title?: string;
    to?: string;
    parentRoute?: boolean;
}

function NavigationTab(props: Props) {
    const {
        children,
        to,
        className,
        title,
        stepCompleted,
        parentRoute = false,
    } = props;

    const { variant } = useContext(NavigationTabContext);

    const defaultClassName = _cs(
        styles.navigationTab,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'tertiary' && styles.tertiary,
        variant === 'step' && styles.step,
        variant === 'vertical' && styles.vertical,
        stepCompleted && styles.completed,
        className,
    );

    const getClassName: Exclude<NavLinkProps['className'], string | undefined> = useCallback(
        ({ isActive }) => {
            if (!isActive) {
                return defaultClassName;
            }

            return _cs(
                styles.active,
                defaultClassName,
            );
        },
        [defaultClassName],
    );

    const navChild = (
        <>
            {variant === 'step' && (
                <div className={styles.stepCircle}>
                    <div className={styles.innerCircle}>
                        {stepCompleted && (
                            <CheckLineIcon className={styles.icon} />
                        )}
                    </div>
                </div>
            )}
            {variant === 'primary' && (
                <div className={styles.dummy} />
            )}
            <div className={styles.childrenWrapper}>
                {children}
            </div>
            {variant === 'primary' && (
                <div className={styles.dummy} />
            )}
        </>
    );

    if (!to) {
        return (
            <div className={_cs(defaultClassName, styles.disabled)}>
                {navChild}
            </div>
        );
    }

    return (
        <NavLink
            to={to}
            className={getClassName}
            end={!parentRoute}
            title={title}
        >
            {navChild}
        </NavLink>
    );
}

export default NavigationTab;
