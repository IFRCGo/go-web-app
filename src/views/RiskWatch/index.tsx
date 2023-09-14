import { Outlet } from 'react-router-dom';
import Page from '#components/Page';
import useTranslation from '#hooks/useTranslation';
import NavigationTabList from '#components/NavigationTabList';
import NavigationTab from '#components/NavigationTab';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <Page
            title={strings.riskPageTitle}
            heading={strings.riskPageHeading}
            description={(
                <NavigationTabList variant="secondary">
                    <NavigationTab
                        to="riskWatchImminent"
                    >
                        {strings.imminentTabLabel}
                    </NavigationTab>
                    <NavigationTab
                        to="riskWatchSeasonal"
                    >
                        {strings.seasonalTabLabel}
                    </NavigationTab>
                </NavigationTabList>
            )}
        >
            <Outlet />
        </Page>
    );
}

Component.displayName = 'RiskWatch';
