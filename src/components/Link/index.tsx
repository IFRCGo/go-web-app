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

import UserContext from '#contexts/user';
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
    to: string | undefined | null,
    urlParams?: never,
} | {
    external: false | undefined,
    to: keyof WrappedRoutes | undefined | null,
    urlParams?: UrlParams,
}) {
    const { userAuth: userDetails } = useContext(UserContext);
    const routes = useContext(RouteContext);

    if (isNotDefined(props.to)) {
        return { disabled: true, to: undefined };
    }

    if (props.external) {
        return { disabled: false, to: props.to };
    }

    // eslint-disable-next-line react/destructuring-assignment
    const route = resolvePath(props.to, routes, props.urlParams);
    const { resolvedPath } = route;

    if (isNotDefined(resolvedPath)) {
        return { disabled: true, to: undefined };
    }

    return {
    // NOTE: disabling links if authentication is required
        disabled: (
            (route.visibility === 'is-authenticated' && isNotDefined(userDetails))
            || (route.visibility === 'is-not-authenticated' && isDefined(userDetails))
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
    // FIXME: Do we need this when we have external?
    withExternalLinkIcon?: boolean;
    withForwardIcon?: boolean;
    withUnderline?: boolean;
}, OMISSION> & ({
    external?: never;
    to: keyof WrappedRoutes | undefined | null;
    urlParams?: UrlParams;
    urlSearch?: string;
    urlHash?: string;
} | {
    external: true;
    to: string | undefined | null;
    urlParams?: never;
    urlSearch?: never;
    urlHash?: never;
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
        withForwardIcon,
        withExternalLinkIcon,
        variant = 'tertiary',

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
            ? { to: props.to, external: props.external, urlParams: undefined }
            // eslint-disable-next-line react/destructuring-assignment
            : { to: props.to, external: props.external, urlParams: props.urlParams },
    );

    // eslint-disable-next-line react/destructuring-assignment
    const disabled = isFalsyString(toLink) || disabledFromProps || disabledLink;

    const {
        children: content,
        className: containerClassName,
    } = useButtonFeatures({
        className: styles.content,
        icons,
        children: childrenFromProps,
        variant,
        disabled,
        actions: (isDefined(actions) || withForwardIcon || withExternalLinkIcon) ? (
            <>
                {actions}
                {withExternalLinkIcon && (
                    <ExternalLinkLineIcon className={styles.externalLinkIcon} />
                )}
                {withForwardIcon && <ChevronRightLineIcon className={styles.forwardIcon} />}
            </>
        ) : null,
        iconsContainerClassName,
        actionsContainerClassName,
    });

    const children = useMemo(
        () => {
            if (isNotDefined(toLink)) {
                return content;
            }
            // eslint-disable-next-line react/destructuring-assignment
            if (props.external) {
                return (
                    <a
                        className={_cs(
                            linkElementClassName,
                            styles.linkElement,
                            containerClassName,
                        )}
                        href={toLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...otherProps}
                    >
                        {content}
                    </a>
                );
            }

            return (
                <InternalLink
                    className={_cs(
                        linkElementClassName,
                        styles.linkElement,
                        containerClassName,
                    )}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...otherProps}
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
                className,
                styles.link,
                // eslint-disable-next-line react/destructuring-assignment
                isNotDefined(props.to) && styles.nonLink,
                withUnderline && styles.underline,
                disabled && styles.disabled,
                variant === 'dropdown-item' && styles.dropdownItem,
                variant === 'tertiary' && styles.tertiary,
            )}
        >
            {children}
        </div>
    );
}
export default Link;
