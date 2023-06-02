import { useMemo } from 'react';
import { _cs, isValidUrl, isNotDefined } from '@togglecorp/fujs';
import {
    Link as InternalLink,
    LinkProps as RouterLinkProps,
} from 'react-router-dom';

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
    underline?: boolean;
    to?: RouterLinkProps['to'];
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
        underline,
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
                        styles.link,
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
                    styles.link,
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
        actions,
        iconsContainerClassName,
        actionsContainerClassName,
    });

    return (
        <div className={_cs(
            styles.linkContainer,
            isNotDefined(to) && styles.nonLink,
            containerClassName,
            underline && styles.underline,
            disabled && styles.disabled,
        )}
        >
            {content}
        </div>
    );
}
export default Link;
