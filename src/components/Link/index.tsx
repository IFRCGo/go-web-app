import { useMemo } from 'react';
import {
    _cs,
    isValidUrl,
    isNotDefined,
    isDefined,
    isFalsyString,
} from '@togglecorp/fujs';
import {
    Link as InternalLink,
    LinkProps as RouterLinkProps,
} from 'react-router-dom';
import {
    ChevronRightLineIcon,
    ExternalLinkLineIcon,
} from '@ifrc-go/icons';

import { useButtonFeatures } from '#components/Button';
import type { ButtonFeatureProps } from '#components/Button';

import styles from './styles.module.css';

function isExternalLink(to: RouterLinkProps['to'] | undefined): to is string {
    return !!(to && typeof to === 'string' && (isValidUrl(to) || to.startsWith('mailto:')));
}

export interface Props extends Omit<RouterLinkProps, 'to'> {
    actions?: React.ReactNode;
    actionsContainerClassName?: string;
    disabled?: boolean;
    icons?: React.ReactNode;
    iconsContainerClassName?: string;
    linkElementClassName?: string;
    to?: RouterLinkProps['to'];
    variant?: ButtonFeatureProps['variant'];
    withExternalLinkIcon?: boolean;
    withForwardIcon?: boolean;
    withUnderline?: boolean;
}

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
        to,
        withUnderline,
        withForwardIcon,
        withExternalLinkIcon,
        variant = 'tertiary',
        ...otherProps
    } = props;

    const disabled = isFalsyString(to) || disabledFromProps;

    const children = useMemo(() => {
        if (isFalsyString(to)) {
            return childrenFromProps;
        }

        const external = isExternalLink(to);
        if (external) {
            return (
                <a
                    className={_cs(
                        linkElementClassName,
                        styles.linkElement,
                    )}
                    href={to}
                    target="_blank"
                    rel="noopener noreferrer"
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...otherProps}
                >
                    {childrenFromProps}
                </a>
            );
        }

        return (
            <InternalLink
                className={_cs(
                    linkElementClassName,
                    styles.linkElement,
                )}
                to={to}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
            >
                {childrenFromProps}
            </InternalLink>
        );
    }, [to, linkElementClassName, childrenFromProps, otherProps]);

    const {
        children: content,
        className: containerClassName,
    } = useButtonFeatures({
        className,
        icons,
        children,
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

    return (
        <div
            className={_cs(
                styles.link,
                isNotDefined(to) && styles.nonLink,
                withUnderline && styles.underline,
                disabled && styles.disabled,
                containerClassName,
            )}
        >
            {content}
        </div>
    );
}
export default Link;
