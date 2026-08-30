import {
    Outlet,
    useOutletContext,
    useParams,
} from 'react-router-dom';
import { NavigationTabList } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { isFalsyString } from '@togglecorp/fujs';

import NavigationTab from '#components/NavigationTab';
import TabPage from '#components/TabPage';
import { type RegionOutletContext } from '#utils/outletContext';

import i18n from './i18n.json';

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
        <TabPage
            wikiLinkPathName="user_guide/risk_module"
        >
            <NavigationTabList styleVariant="pill">
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
        </TabPage>
    );
}

Component.displayName = 'RegionRiskWatch';
