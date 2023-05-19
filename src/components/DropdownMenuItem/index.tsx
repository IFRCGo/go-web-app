import { useMemo } from 'react';
import {
    _cs,
    isValidUrl,
} from '@togglecorp/fujs';
import { Link } from 'react-router-dom';

import RawButton, {
    Props as RawButtonProps,
} from '#components/RawButton';

import styles from './styles.module.css';

interface BaseProps {
  className?: string;
  icon?: React.ReactNode;
  label?: React.ReactNode;
  disabled?: boolean;
}

type Props<N> = BaseProps & ({
  name?: N;
  onClick: RawButtonProps<N>['onClick'];
  href?: never;
  state?: never;
} | {
  href: string;
  hash?: string;
  state?: unknown;
  onClick?: never;
  name?: never;
})

function DropdownMenuItem<N>(props: Props<N>) {
    const {
        className: classNameFromProps,
        icon,
        label,
        disabled,
    } = props;

    const isExternalLink = useMemo(() => (
        props.href
    && typeof props.href === 'string'
    && (isValidUrl(props.href)
      || props.href.startsWith('mailto:'))
    ), [props.href]);

    const className = _cs(
        styles.dropdownMenuItem,
        disabled && styles.disabled,
        classNameFromProps,
    );

    const children = (
        <>
            <div className={styles.iconContainer}>
                {icon}
            </div>
            <div className={styles.label}>
                {label}
            </div>
        </>
    );

    if (props.href) {
        if (isExternalLink) {
            return (
                <a
                    className={_cs(styles.externalLink, className)}
                    href={props.href}
                    target="_blank"
                    rel="noreferrer"
                >
                    {children}
                </a>
            );
        }

        return (
            <Link
                className={_cs(styles.internalLink, className)}
                to={{
                    pathname: props.href,
                    hash: props.hash,
                }}
                state={props.state}
            >
                {children}
            </Link>
        );
    }

    if (props.name) {
        return (
            <RawButton
                name={props.name}
                className={className}
                onClick={props.onClick}
                disabled={disabled}
            >
                {children}
            </RawButton>
        );
    }

    return (
        <RawButton<undefined>
            name={undefined}
            className={className}
            onClick={props.onClick as RawButtonProps<undefined>['onClick']}
            disabled={disabled}
        >
            {children}
        </RawButton>
    );
}

export default DropdownMenuItem;
