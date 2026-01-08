import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
  className?: string;
  children?: React.ReactNode;
  variant: 'warning' | 'negative' | 'positive' | 'information';
}

function TopBanner(props: Props) {
    const {
        className,
        children,
        variant = 'information',
    } = props;

    return (
        <div className={_cs(
            styles.topBanner,
            variant === 'negative' && styles.negative,
            variant === 'warning' && styles.warning,
            variant === 'positive' && styles.positive,
            variant === 'information' && styles.information,
            className,
        )}
        >
            {children}
        </div>
    );
}

export default TopBanner;
