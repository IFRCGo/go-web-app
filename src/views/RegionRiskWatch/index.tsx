import {
    useParams,
    Outlet,
    useOutletContext,
} from 'react-router-dom';
import { isFalsyString } from '@togglecorp/fujs';

import NavigationTabList from '#components/NavigationTabList';
import NavigationTab from '#components/NavigationTab';
import { RegionOutletContext } from '#utils/outletContext';

import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { regionId } = useParams<{ regionId: string }>();
    const regionOutletContext = useOutletContext<RegionOutletContext>();

    // FIXME: show proper error message
    if (isFalsyString(regionId)) {
        return null;
    }

    const numericRegionId = Number(regionId);

    return (
        <div className={styles.regionRiskWatch}>
            <NavigationTabList variant="secondary">
                <NavigationTab
                    to="regionImminentRiskWatch"
                    urlParams={{
                        regionId: numericRegionId,
                    }}
                >
                    {/* FIXME: use translation */}
                    Imminent
                </NavigationTab>
                <NavigationTab
                    to="regionSeasonalRiskWatch"
                    urlParams={{
                        regionId: numericRegionId,
                    }}
                >
                    {/* FIXME: use translation */}
                    Seasonal
                </NavigationTab>
            </NavigationTabList>
            <Outlet context={regionOutletContext} />
        </div>
    );
}

Component.displayName = 'RegionRiskWatch';
