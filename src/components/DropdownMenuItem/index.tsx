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
    to?: never;
    state?: never;
} | {
    to: string;
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
        // eslint-disable-next-line react/destructuring-assignment
        props.to
        // eslint-disable-next-line react/destructuring-assignment
        && typeof props.to === 'string'
        // eslint-disable-next-line react/destructuring-assignment
        && (isValidUrl(props.to) || props.to.startsWith('mailto:'))
    ), [
        // eslint-disable-next-line react/destructuring-assignment
        props.to,
    ]);

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

    // eslint-disable-next-line react/destructuring-assignment
    if (props.to) {
        if (isExternalLink) {
            return (
                <a
                    className={_cs(styles.externalLink, className)}
                    // eslint-disable-next-line react/destructuring-assignment
                    href={props.to}
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
                    // eslint-disable-next-line react/destructuring-assignment
                    pathname: props.to,
                    // eslint-disable-next-line react/destructuring-assignment
                    hash: props.hash,
                }}
                // eslint-disable-next-line react/destructuring-assignment
                state={props.state}
            >
                {children}
            </Link>
        );
    }

    // eslint-disable-next-line react/destructuring-assignment
    if (props.name) {
        return (
            <RawButton
                // eslint-disable-next-line react/destructuring-assignment
                name={props.name}
                className={className}
                // eslint-disable-next-line react/destructuring-assignment
                onClick={props.onClick}
                disabled={disabled}
            >
                {children}
            </RawButton>
        );
    }

    return (
        <RawButton
            name={undefined}
            className={className}
            // eslint-disable-next-line react/destructuring-assignment
            onClick={props.onClick as RawButtonProps<undefined>['onClick']}
            disabled={disabled}
        >
            {children}
        </RawButton>
    );
}

export default DropdownMenuItem;
