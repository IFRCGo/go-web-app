import { Outlet } from 'react-router-dom';
import { NavigationTabList } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import NavigationTab from '#components/NavigationTab';
import Page from '#components/Page';

import i18n from './i18n.json';

/** @knipignore */
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
