import React from 'react';
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

  const isExternalLink = React.useMemo(() => (
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
          className={className}
          href={props.href}
          target="_blank"
        >
          {children}
        </a>
      );
    }

    return (
      <Link
        className={className}
        to={{
          pathname: props.href,
          state: props.state,
          hash: props.hash,
        }}
      >
        {children}
      </Link>
    );
  }

  if (props.name) {
    return (
      <RawButton
        className={className}
        name={props.name}
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
    >
      {children}
    </RawButton>
  );
}

export default DropdownMenuItem;
