import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    children?: React.ReactNode;
    /** Semantic status of the banner */
    variant?: 'brand' | 'warning' | 'negative' | 'positive' | 'information';
}

/**
 * TopBanner is a full-width announcement strip shown at the top of a
 * page (e.g. maintenance or degraded-service notices).
 * Specific layer: exposes a single semantic `variant` prop.
 */
function TopBanner(props: Props) {
    const {
        className,
        children,
        variant = 'information',
    } = props;

    return (
        <div
            // NOTE: page-level announcement -> polite live region
            role="status"
            className={_cs(
                styles.topBanner,
                variant === 'brand' && styles.brand,
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
