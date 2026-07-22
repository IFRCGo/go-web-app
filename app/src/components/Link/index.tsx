import {
    Link as RouterLink,
    type LinkProps as RouterLinkProps,
} from 'react-router-dom';
import {
    ArrowRightUpLineIcon,
    ChevronRightLineIcon,
} from '@ifrc-go/icons';
import {
    ButtonLayout,
    type ButtonLayoutProps,
} from '@ifrc-go/ui';
import {
    _cs,
    isFalsyString,
} from '@togglecorp/fujs';

import useLink from '#hooks/domain/useLink';
import { type UrlParams } from '#utils/domain/link';

import { type WrappedRoutes } from '../../App/routes';

import styles from './styles.module.css';

const IFRC_SHAREPOINT_HOST = 'ifrcorg.sharepoint.com';
const SURGE_CATALOGUE_PATH_PREFIX = '/surge/catalogue';

function shouldApplySurgeCatalogueDownloadMetadata(url: string) {
    if (typeof window === 'undefined') {
        return false;
    }

    if (!window.location.pathname.startsWith(SURGE_CATALOGUE_PATH_PREFIX)) {
        return false;
    }

    try {
        const parsedUrl = new URL(url.trim(), window.location.href);
        return parsedUrl.hostname.toLowerCase() === IFRC_SHAREPOINT_HOST;
    } catch {
        return false;
    }
}

type PickedButtonLayoutProps =
    | 'className'
    | 'colorVariant'
    | 'styleVariant'
    | 'spacing'
    | 'spacingOffset'
    | 'withoutPadding'
    | 'withFullWidth'
    | 'children'
    | 'before'
    | 'after'
    | 'textSize'
    | 'disabled';

type CommonLinkProps = Pick<ButtonLayoutProps, PickedButtonLayoutProps> & {
    withEllipsizedContent?: boolean;
    withLinkIcon?: boolean;
    withUnderline?: boolean;
};

interface InternalLinkProps extends Omit<RouterLinkProps, 'to'> {
    external?: never;
    to: keyof WrappedRoutes | undefined | null;
    href?: never;
    urlParams?: UrlParams;
    urlSearch?: string;
    urlHash?: string;
}

interface ExternalLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
    external: true;
    href: string | undefined | null;
    to?: never;
    urlParams?: never;
    urlSearch?: never;
    urlHash?: never;
}

export type Props = CommonLinkProps & (InternalLinkProps | ExternalLinkProps);

function Link(props: Props) {
    const {
        className,
        colorVariant = 'text',
        styleVariant = 'action',
        spacing,
        spacingOffset = styleVariant === 'action' ? -5 : -3,
        withoutPadding,
        withFullWidth,
        children,
        before,
        after,
        textSize,
        disabled: disabledFromProps,

        external,
        to,
        href,
        urlParams,
        urlSearch,
        urlHash,

        withEllipsizedContent,
        withLinkIcon,
        withUnderline,

        ...linkProps
    } = props;

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

    const content = (
        <ButtonLayout
            // elementRef={layoutElementRef}
            className={_cs(className, styles.layout, withUnderline && styles.withUnderline)}
            withEllipsizedContent={withEllipsizedContent}
            colorVariant={colorVariant}
            styleVariant={styleVariant}
            spacing={spacing}
            spacingOffset={spacingOffset}
            withoutPadding={withoutPadding}
            withFullWidth={withFullWidth}
            disabled={disabled}
            textSize={textSize}
            before={before}
            after={(
                <>
                    {after}
                    {withLinkIcon && external && (
                        <ArrowRightUpLineIcon className={styles.linkIcon} />
                    )}
                    {withLinkIcon && !external && (
                        <ChevronRightLineIcon className={styles.linkIcon} />
                    )}
                </>
            )}
        >
            {children}
        </ButtonLayout>
    );

    if (nonLink) {
        return (
            <div className={styles.link}>
                {content}
            </div>
        );
    }

    if (external) {
        const externalDownloadMetadata = shouldApplySurgeCatalogueDownloadMetadata(toLink)
            ? {
                'data-document-type': 'surge_catalogue_resource',
            }
            : undefined;

        return (
            <a
                className={styles.link}
                target="_blank"
                rel="noopener noreferrer"
                href={toLink}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...externalDownloadMetadata}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...linkProps}
            >
                {content}
            </a>
        );
    }

    return (
        <RouterLink
            className={styles.link}
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
export default Link;
