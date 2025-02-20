import {
    Outlet,
    useOutletContext,
    useParams,
} from 'react-router-dom';
import { NavigationTabList } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { isFalsyString } from '@togglecorp/fujs';

import NavigationTab from '#components/NavigationTab';
import WikiLink from '#components/WikiLink';
import { type RegionOutletContext } from '#utils/outletContext';

import i18n from './i18n.json';
import styles from './styles.module.css';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { regionId } = useParams<{ regionId: string }>();
    const regionOutletContext = useOutletContext<RegionOutletContext>();

    // FIXME: show proper error message
    if (isFalsyString(regionId)) {
        return null;
    }

    const numericRegionId = Number(regionId);

    return (
        <div className={styles.regionRiskWatch}>
            <WikiLink
                className={styles.wikiLink}
                href="user_guide/risk_module"
            />
            <NavigationTabList variant="secondary">
                <NavigationTab
                    to="regionImminentRiskWatch"
                    urlParams={{
                        regionId: numericRegionId,
                    }}
                >
                    {strings.regionRiskWatchImminent}
                </NavigationTab>
                <NavigationTab
                    to="regionSeasonalRiskWatch"
                    urlParams={{
                        regionId: numericRegionId,
                    }}
                >
                    {strings.regionRiskWatchSeasonal}
                </NavigationTab>
            </NavigationTabList>
            <Outlet context={regionOutletContext} />
        </div>
    );
}

Component.displayName = 'RegionRiskWatch';
