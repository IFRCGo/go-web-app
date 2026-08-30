import {
    Outlet,
    useOutletContext,
} from 'react-router-dom';
import { NavigationTabList } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import NavigationTab from '#components/NavigationTab';
import TabPage from '#components/TabPage';
import { type CountryOutletContext } from '#utils/outletContext';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const outletContext = useOutletContext<CountryOutletContext>();
    const { countryId } = outletContext;
    const strings = useTranslation(i18n);

    return (
        <TabPage
            wikiLinkPathName="user_guide/Country_Pages#on-going-activities"
        >
            <NavigationTabList styleVariant="pill">
                <NavigationTab
                    to="countryOngoingActivitiesEmergencies"
                    urlParams={{ countryId }}
                >
                    {strings.ongoingEmergenciesTabTitle}
                </NavigationTab>
                <NavigationTab
                    to="countryOngoingActivitiesThreeWProjects"
                    urlParams={{ countryId }}
                >
                    {strings.threeWProjectsTabTitle}
                </NavigationTab>
            </NavigationTabList>
            <Outlet context={outletContext} />
        </TabPage>
    );
}

Component.displayName = 'CountryOngoingActivities';
