import { useCallback, useContext } from 'react';
import { _cs, isNotDefined } from '@togglecorp/fujs';
import {
    NavLink,
    NavLinkProps,
} from 'react-router-dom';
import { CheckFillIcon } from '@ifrc-go/icons';

import NavigationTabContext from '#contexts/navigation-tab';

import styles from './styles.module.css';

interface Props {
    className?: string;
    children?: React.ReactNode;
    stepCompleted?: boolean;
    title?: string;
    to?: string;
    parentRoute?: boolean;
    disabled?: boolean;
}

function NavigationTab(props: Props) {
    const {
        children,
        to,
        className,
        title,
        stepCompleted,
        parentRoute = false,
        disabled,
    } = props;

    const {
        variant,
        className: classNameFromContext,
    } = useContext(NavigationTabContext);

    const defaultClassName = _cs(
        styles.navigationTab,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'tertiary' && styles.tertiary,
        variant === 'step' && styles.step,
        variant === 'vertical' && styles.vertical,
        stepCompleted && styles.completed,
        classNameFromContext,
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
                disabled && styles.disabled,
            );
        },
        [
            defaultClassName,
            disabled,
        ],
    );

    const navChild = (
        <>
            {variant === 'step' && (
                <div className={styles.visualElements}>
                    <div className={styles.progressBarStart} />
                    <div className={styles.stepCircle}>
                        <div className={styles.innerCircle}>
                            {stepCompleted && (
                                <CheckFillIcon className={styles.icon} />
                            )}
                        </div>
                    </div>
                    <div className={styles.progressBarEnd} />
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

    const handleClick = useCallback((
        event: React.MouseEvent<HTMLAnchorElement> | undefined,
    ) => {
        if (disabled) {
            event?.preventDefault();
        }
    }, [disabled]);

    if (isNotDefined(to)) {
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
            onClick={handleClick}
            end={!parentRoute}
            title={title}
        >
            {navChild}
        </NavLink>
    );
}

export default NavigationTab;
