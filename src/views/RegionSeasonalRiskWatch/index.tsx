import { useOutletContext } from 'react-router-dom';

import { RegionOutletContext } from '#utils/outletContext';

import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { regionResponse } = useOutletContext<RegionOutletContext>();

    return (
        <div className={styles.regionSeasonalRiskWatch}>
            {regionResponse?.region_name}
        </div>
    );
}

Component.displayName = 'RegionSeasonalRiskWatch';
