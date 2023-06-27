import { useMemo } from 'react';
import {
    _cs,
    isValidUrl,
    isNotDefined,
    isDefined,
} from '@togglecorp/fujs';
import {
    Link as InternalLink,
    LinkProps as RouterLinkProps,
} from 'react-router-dom';
import { ChevronRightLineIcon } from '@ifrc-go/icons';

import useButtonFeatures, { Props as ButtonFeatureProps } from '#hooks/useButtonFeatures';

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
    withUnderline?: boolean;
    withForwardIcon?: boolean;
    variant?: ButtonFeatureProps['variant'];
}

function Link(props: Props) {
    const {
        actions,
        actionsContainerClassName,
        children: childrenFromProps,
        className,
        disabled,
        icons,
        iconsContainerClassName,
        linkElementClassName,
        to,
        withUnderline,
        withForwardIcon,
        variant = 'tertiary',
        ...otherProps
    } = props;

    const children = useMemo(() => {
        if (isNotDefined(to)) {
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
        actions: (isDefined(actions) || withForwardIcon) ? (
            <>
                {actions}
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
