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

import useBasicLayout from '#hooks/useBasicLayout';

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
        content,
        containerClassName,
    } = useBasicLayout({
        className,
        icons,
        children,
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
        <div className={_cs(
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
