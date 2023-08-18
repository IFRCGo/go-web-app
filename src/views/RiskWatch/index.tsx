import { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Page from '#components/Page';
import useTranslation from '#hooks/useTranslation';
import NavigationTabList from '#components/NavigationTabList';
import NavigationTab from '#components/NavigationTab';
import RouteContext from '#contexts/route';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const {
        regionImminentRiskWatch,
        regionSeasonalRiskWatch,
    } = useContext(RouteContext);

    return (
        <Page
            title={strings.riskPageTitle}
        >
            <NavigationTabList variant="secondary">
                <NavigationTab to={regionImminentRiskWatch.path}>
                    {strings.imminentTabLabel}
                </NavigationTab>
                <NavigationTab to={regionSeasonalRiskWatch.path}>
                    {strings.seasonalTabLabel}
                </NavigationTab>
            </NavigationTabList>
            <Outlet />
        </Page>
    );
}

Component.displayName = 'RiskWatch';
