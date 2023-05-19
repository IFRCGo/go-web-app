import { _cs } from '@togglecorp/fujs';
import {
    Link as InternalLink,
    LinkProps as RouterLinkProps,
} from 'react-router-dom';

import useBasicLayout from '#hooks/useBasicLayout';

import styles from './styles.module.css';

export interface Props extends RouterLinkProps {
  actions?: React.ReactNode;
  actionsContainerClassName?: string;
  disabled?: boolean;
  external?: boolean;
  icons?: React.ReactNode;
  iconsContainerClassName?: string;
  linkElementClassName?: string;
  underline?: boolean;
}

function Link(props: Props) {
    const {
        actions,
        actionsContainerClassName,
        children,
        className,
        disabled,
        external,
        icons,
        iconsContainerClassName,
        linkElementClassName,
        to,
        underline,
        ...otherProps
    } = props;

    const link = external ? (
        <a
            className={_cs(
                linkElementClassName,
                styles.link,
            )}
            href={to as string}
            target="_blank"
            rel="noopener noreferrer"
            {...otherProps}
        >
            {children}
        </a>
    ) : (
        <InternalLink
            className={_cs(
                linkElementClassName,
                styles.link,
            )}
            to={to}
            {...otherProps}
        >
            {children}
        </InternalLink>
    );

    const {
        content,
        containerClassName,
    } = useBasicLayout({
        className,
        icons,
        children: link,
        actions,
        iconsContainerClassName,
        actionsContainerClassName,
    });

    return (
        <div className={_cs(
            styles.linkContainer,
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
