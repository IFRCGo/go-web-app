import { useCallback, useContext, useMemo } from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';
import {
    matchPath,
    NavLink,
    useLocation,
} from 'react-router-dom';
import { CheckFillIcon } from '@ifrc-go/icons';

import NavigationTabContext from '#contexts/navigation-tab';
import RouteContext from '#contexts/route';
import { useLink, type UrlParams } from '#components/Link';

import { type WrappedRoutes } from '../../App/routes';
import styles from './styles.module.css';

interface Props {
    className?: string;
    children?: React.ReactNode;
    stepCompleted?: boolean;
    title?: string;
    parentRoute?: boolean;
    disabled?: boolean;

    to: keyof WrappedRoutes | undefined | null;

    urlParams?: UrlParams;
    urlSearch?: string;
    urlHash?: string;
}

function NavigationTab(props: Props) {
    const {
        children,
        to,
        urlParams,
        urlSearch,
        urlHash,
        className,
        title,
        stepCompleted,
        parentRoute = false,
        disabled: disabledFromProps,
    } = props;

    const {
        variant,
        className: classNameFromContext,
    } = useContext(NavigationTabContext);

    const location = useLocation();

    const routes = useContext(RouteContext);

    const {
        disabled: disabledLink,
        to: toLink,
    } = useLink({
        to,
        external: false,
        urlParams,
    });

    const disabled = disabledLink || disabledFromProps;

    const handleClick = useCallback((
        event: React.MouseEvent<HTMLAnchorElement> | undefined,
    ) => {
        if (disabled) {
            event?.preventDefault();
        }
    }, [disabled]);

    const isActive = isDefined(to) && matchPath(
        {
            // eslint-disable-next-line react/destructuring-assignment
            path: routes[to].absolutePath,
            end: !parentRoute,
        },
        location.pathname,
    );

    const linkClassName = useMemo(
        () => {
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
                disabled && styles.disabled,
            );

            if (!isActive) {
                return defaultClassName;
            }

            return _cs(
                styles.active,
                defaultClassName,
            );
        },
        [
            className,
            classNameFromContext,
            stepCompleted,
            variant,
            isActive,
            disabled,
        ],
    );

    return (
        <NavLink
            to={{
                pathname: toLink,
                search: urlSearch,
                hash: urlHash,
            }}
            className={linkClassName}
            onClick={handleClick}
            title={title}
        >
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
        </NavLink>
    );
}

export default NavigationTab;
