import { useMemo, useContext } from 'react';
import {
    _cs,
    isNotDefined,
    isDefined,
    isFalsyString,
} from '@togglecorp/fujs';
import {
    Link as InternalLink,
    LinkProps as RouterLinkProps,
    generatePath,
} from 'react-router-dom';
import {
    ChevronRightLineIcon,
    ExternalLinkLineIcon,
} from '@ifrc-go/icons';

import usePermissions from '#hooks/domain/usePermissions';
import useAuth from '#hooks/domain/useAuth';
import RouteContext from '#contexts/route';
import { useButtonFeatures } from '#components/Button';
import type { ButtonFeatureProps } from '#components/Button';

import { type WrappedRoutes } from '../../App/routes';
import styles from './styles.module.css';

export interface UrlParams {
    [key: string]: string | number | null | undefined;
}

// eslint-disable-next-line react-refresh/only-export-components
export function resolvePath(
    to: keyof WrappedRoutes,
    routes: WrappedRoutes,
    urlParams: UrlParams | undefined,
) {
    const route = routes[to];
    try {
        const resolvedPath = generatePath(route.absoluteForwardPath, urlParams);
        return {
            ...route,
            resolvedPath,
        };
    } catch (ex) {
        return {
            ...route,
            resolvedPath: undefined,
        };
    }
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLink(props: {
    external: true,
    href: string | undefined | null,
    to?: never,
    urlParams?: never,
} | {
    external: false | undefined,
    to: keyof WrappedRoutes | undefined | null,
    urlParams?: UrlParams,
    href?: never,
}) {
    const { isAuthenticated } = useAuth();
    const routes = useContext(RouteContext);
    const perms = usePermissions();

    if (props.external) {
        if (isNotDefined(props.href)) {
            return { disabled: true, to: undefined };
        }
        return { disabled: false, to: props.href };
    }

    if (isNotDefined(props.to)) {
        return { disabled: true, to: undefined };
    }

    // eslint-disable-next-line react/destructuring-assignment
    const route = resolvePath(props.to, routes, props.urlParams);
    const { resolvedPath } = route;

    if (isNotDefined(resolvedPath)) {
        return { disabled: true, to: undefined };
    }

    return {
        disabled: (
            (route.visibility === 'is-authenticated' && !isAuthenticated)
            || (route.visibility === 'is-not-authenticated' && isAuthenticated)
            || (route.permissions && !route.permissions(perms, props.urlParams))
        ),
        to: resolvedPath,
    };
}

export type Props<OMISSION extends string = never> = Omit<RouterLinkProps, 'to' | OMISSION> & Omit<{
    actions?: React.ReactNode;
    actionsContainerClassName?: string;
    disabled?: boolean;
    icons?: React.ReactNode;
    iconsContainerClassName?: string;
    linkElementClassName?: string;
    // to?: RouterLinkProps['to'];
    variant?: ButtonFeatureProps['variant'];
    withLinkIcon?: boolean;
    withUnderline?: boolean;
    ellipsize?: boolean;
    spacing?: ButtonFeatureProps['spacing'];
}, OMISSION> & ({
    external?: never;
    to: keyof WrappedRoutes | undefined | null;
    urlParams?: UrlParams;
    urlSearch?: string;
    urlHash?: string;
    href?: never;
} | {
    external: true;
    href: string | undefined | null;
    urlParams?: never;
    urlSearch?: never;
    urlHash?: never;
    to?: never;
})

function Link(props: Props) {
    const {
        actions,
        actionsContainerClassName,
        children: childrenFromProps,
        className,
        disabled: disabledFromProps,
        icons,
        iconsContainerClassName,
        linkElementClassName,
        withUnderline,
        withLinkIcon,
        variant = 'tertiary',
        ellipsize,
        spacing,

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        external,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        to,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        urlParams,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        urlSearch,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        urlHash,
        ...otherProps
    } = props;

    const {
        disabled: disabledLink,
        to: toLink,
    } = useLink(
        // eslint-disable-next-line react/destructuring-assignment
        props.external
            // eslint-disable-next-line react/destructuring-assignment
            ? { href: props.href, external: true }
            // eslint-disable-next-line react/destructuring-assignment
            : { to: props.to, external: false, urlParams: props.urlParams },
    );

    // eslint-disable-next-line react/destructuring-assignment
    const disabled = disabledFromProps || disabledLink;

    // eslint-disable-next-line react/destructuring-assignment
    const nonLink = isFalsyString(toLink);

    const {
        children: content,
        className: containerClassName,
    } = useButtonFeatures({
        className: styles.content,
        icons,
        children: childrenFromProps,
        variant,
        ellipsize,
        disabled,
        spacing,
        actions: (isDefined(actions) || withLinkIcon) ? (
            <>
                {actions}
                {withLinkIcon && external && (
                    <ExternalLinkLineIcon />
                )}
                {withLinkIcon && !external && (
                    <ChevronRightLineIcon className={styles.forwardIcon} />
                )}
            </>
        ) : null,
        iconsContainerClassName,
        actionsContainerClassName,
    });

    const children = useMemo(
        () => {
            if (isNotDefined(toLink)) {
                return (
                    <div className={containerClassName}>
                        {content}
                    </div>
                );
            }
            // eslint-disable-next-line react/destructuring-assignment
            if (props.external) {
                return (
                    <a
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...otherProps}
                        className={_cs(
                            linkElementClassName,
                            styles.linkElement,
                            containerClassName,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        href={toLink}
                    >
                        {content}
                    </a>
                );
            }

            return (
                <InternalLink
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...otherProps}
                    className={_cs(
                        linkElementClassName,
                        styles.linkElement,
                        containerClassName,
                    )}
                    to={{
                        pathname: toLink,
                        // eslint-disable-next-line react/destructuring-assignment
                        search: props.urlSearch,
                        // eslint-disable-next-line react/destructuring-assignment
                        hash: props.urlHash,
                    }}
                >
                    {content}
                </InternalLink>
            );
        },
        [
            linkElementClassName,
            containerClassName,
            content,
            otherProps,
            toLink,
            // eslint-disable-next-line react/destructuring-assignment
            props.urlSearch,
            // eslint-disable-next-line react/destructuring-assignment
            props.urlHash,
            // eslint-disable-next-line react/destructuring-assignment
            props.external,
        ],
    );

    return (
        <div
            className={_cs(
                styles.link,
                nonLink && styles.nonLink,
                withUnderline && styles.underline,
                disabled && styles.disabled,
                variant === 'dropdown-item' && styles.dropdownItem,
                variant === 'tertiary' && styles.tertiary,
                ellipsize && styles.ellipsized,
                className,
            )}
        >
            {children}
        </div>
    );
}
export default Link;
