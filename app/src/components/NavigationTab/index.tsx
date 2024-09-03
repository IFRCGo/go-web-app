import {
    useCallback,
    useContext,
    useMemo,
} from 'react';
import {
    matchPath,
    NavLink,
    useLocation,
} from 'react-router-dom';
import { CheckFillIcon } from '@ifrc-go/icons';
import { NavigationTabContext } from '@ifrc-go/ui/contexts';
import {
    _cs,
    isFalsyString,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';

import {
    type UrlParams,
    useLink,
} from '#components/Link';
import RouteContext from '#contexts/route';

import { type WrappedRoutes } from '../../App/routes';

import styles from './styles.module.css';

interface Props {
    className?: string;
    children?: React.ReactNode;
    stepCompleted?: boolean;
    title?: string;
    disabled?: boolean;

    parentRoute?: boolean;
    matchParam?: string;

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
        disabled: disabledFromProps,
        parentRoute = false,
        matchParam,
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

    const matchParamValue = isTruthyString(matchParam)
        ? urlParams?.[matchParam]
        : undefined;

    const isActive = useMemo(
        () => {
            if (isNotDefined(to)) {
                return false;
            }

            const match = matchPath(
                {
                    // eslint-disable-next-line react/destructuring-assignment
                    path: routes[to].absolutePath,
                    end: !parentRoute,
                },
                location.pathname,
            );

            if (isNotDefined(match)) {
                return false;
            }

            if (isTruthyString(matchParam)) {
                const paramValue = match.params[matchParam];

                if (isFalsyString(paramValue)) {
                    return false;
                }

                return matchParamValue === paramValue;
            }

            return true;
        },
        [to, routes, location.pathname, matchParam, parentRoute, matchParamValue],
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
                <div className={styles.activeChildrenBorder} />
            </div>
            {variant === 'primary' && (
                <div className={styles.dummy} />
            )}
        </NavLink>
    );
}

export default NavigationTab;
