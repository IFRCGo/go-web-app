import {
    useCallback,
    useContext,
    useMemo,
} from 'react';
import {
    Link as RouterLink,
    type LinkProps as RouterLinkProps,
    matchPath,
    useLocation,
} from 'react-router-dom';
import {
    ChevronRightLineIcon,
    ExternalLinkLineIcon,
} from '@ifrc-go/icons';
import {
    TabLayout,
    type TabLayoutProps,
} from '@ifrc-go/ui';
import { NavigationTabContext } from '@ifrc-go/ui/contexts';
import {
    isFalsyString,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';

import RouteContext from '#contexts/route';
import useLink from '#hooks/domain/useLink';
import { type UrlParams } from '#utils/domain/link';

import { type WrappedRoutes } from '../../App/routes';

import styles from './styles.module.css';

type CommonProps = Omit<TabLayoutProps, 'styleVariant' | 'colorVariant'> & {
    withEllipsizedContent?: boolean;
    withLinkIcon?: boolean;
    withUnderline?: boolean;
};

interface InternalLinkProps extends Omit<RouterLinkProps, 'to'> {
    external?: false | never;
    to: keyof WrappedRoutes | undefined | null;
    href?: never;
    urlParams?: UrlParams;
    urlSearch?: string;
    urlHash?: string;

    matchParam?: string;
    parentRoute?: boolean;
}

// TODO: add support for AnchorElement props
interface ExternalLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
    external: true;
    to?: never;
    href: string | undefined | null;
    urlParams?: never;
    urlSearch?: never;
    urlHash?: never;

    matchParam?: never;
    parentRoute?: never;
}

type Props = CommonProps & (InternalLinkProps | ExternalLinkProps);

function NavigationTab(props: Props) {
    const {
        className,
        spacing,
        spacingOffset,
        withoutPadding,
        children,
        before,
        after,
        disabled: disabledFromProps,
        stepCompleted,
        isFirstStep,
        isLastStep,

        external,
        to,
        href,
        urlParams,
        urlSearch,
        urlHash,
        matchParam,
        parentRoute,

        withLinkIcon,

        ...linkProps
    } = props;

    const {
        colorVariant,
        styleVariant,
    } = useContext(NavigationTabContext);

    const location = useLocation();
    const routes = useContext(RouteContext);

    const {
        disabled: disabledLink,
        to: toLink,
    } = useLink(
        external
            ? { href, external: true }
            : { to, external: false, urlParams },
    );

    const disabled = disabledFromProps || disabledLink;
    const nonLink = isFalsyString(toLink);

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

            const pathname = isTruthyString(location.hash)
                ? `${location.pathname}${location.hash}`
                : location.pathname;
            const { absolutePath } = routes[to];
            const testPath = isTruthyString(urlHash)
                ? `${absolutePath}#${urlHash}`
                : absolutePath;
            const match = matchPath(
                {
                    path: testPath,
                    end: !parentRoute,
                },
                pathname,
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
        [
            to,
            location.hash,
            location.pathname,
            routes,
            urlHash,
            parentRoute,
            matchParam,
            matchParamValue,
        ],
    );

    const content = (
        <TabLayout
            className={className}
            active={isActive}
            colorVariant={colorVariant}
            styleVariant={styleVariant}
            spacing={spacing}
            spacingOffset={spacingOffset}
            withoutPadding={withoutPadding}
            disabled={disabled}
            before={before}
            after={(
                <>
                    {after}
                    {withLinkIcon && external && (
                        <ExternalLinkLineIcon />
                    )}
                    {withLinkIcon && !external && (
                        <ChevronRightLineIcon />
                    )}
                </>
            )}
            stepCompleted={stepCompleted}
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
        >
            {children}
        </TabLayout>
    );

    if (nonLink) {
        return (
            <div className={styles.navigationTab}>
                {content}
            </div>
        );
    }

    if (external) {
        return (
            <a
                className={styles.navigationTab}
                target="_blank"
                rel="noopener noreferrer"
                href={toLink}
                onClick={handleClick}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...linkProps}
            >
                {content}
            </a>
        );
    }

    return (
        <RouterLink
            className={styles.navigationTab}
            onClick={handleClick}
            to={{
                pathname: toLink,
                search: urlSearch,
                hash: urlHash,
            }}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...linkProps}
        >
            {content}
        </RouterLink>
    );
}

export default NavigationTab;
