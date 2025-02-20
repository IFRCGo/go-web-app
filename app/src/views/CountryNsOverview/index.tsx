import {
    Outlet,
    useOutletContext,
} from 'react-router-dom';
import { NavigationTabList } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import NavigationTab from '#components/NavigationTab';
import { type CountryOutletContext } from '#utils/outletContext';

import i18n from './i18n.json';
import styles from './styles.module.css';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const outletContext = useOutletContext<CountryOutletContext>();
    const { countryId } = outletContext;
    const strings = useTranslation(i18n);

    return (
        <div className={styles.countryNsOverview}>
            <NavigationTabList variant="secondary">
                <NavigationTab
                    to="countryNsOverviewActivities"
                    urlParams={{ countryId }}
                >
                    {strings.nsActivitiesTabTitle}
                </NavigationTab>
                <NavigationTab
                    to="countryNsOverviewContextAndStructure"
                    urlParams={{ countryId }}
                >
                    {strings.contextAndStructureTabTitle}
                </NavigationTab>
                <NavigationTab
                    to="countryNsOverviewStrategicPriorities"
                    urlParams={{ countryId }}
                >
                    {strings.strategicPrioritiesTabTitle}
                </NavigationTab>
                <NavigationTab
                    to="countryNsOverviewCapacity"
                    urlParams={{ countryId }}
                >
                    {strings.capacityTabTitle}
                </NavigationTab>
                <NavigationTab
                    to="countryNsOverviewSupportingPartners"
                    urlParams={{ countryId }}
                >
                    {strings.partnersTabTitle}
                </NavigationTab>
            </NavigationTabList>
            <Outlet context={outletContext} />
        </div>
    );
}

Component.displayName = 'CountryNsOverview';
