import { useContext } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';

import NavigationTabList from '#components/NavigationTabList';
import NavigationTab from '#components/NavigationTab';
import RouteContext from '#contexts/route';
import { RegionOutletContext } from '#utils/outletContext';

import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const regionOutletContext = useOutletContext<RegionOutletContext>();
    const {
        regionImminentRiskWatch,
        regionSeasonalRiskWatch,
    } = useContext(RouteContext);

    return (
        <div className={styles.regionRiskWatch}>
            <NavigationTabList variant="secondary">
                <NavigationTab to={regionImminentRiskWatch.path}>
                    Imminent
                </NavigationTab>
                <NavigationTab to={regionSeasonalRiskWatch.path}>
                    Seasonal
                </NavigationTab>
            </NavigationTabList>
            <Outlet context={regionOutletContext} />
        </div>
    );
}

Component.displayName = 'RegionRiskWatch';
