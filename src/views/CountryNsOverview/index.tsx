import { Outlet, useOutletContext } from 'react-router-dom';

import NavigationTab from '#components/NavigationTab';
import NavigationTabList from '#components/NavigationTabList';
import useTranslation from '#hooks/useTranslation';
import { CountryOutletContext } from '#utils/outletContext';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { countryId } = useOutletContext<CountryOutletContext>();
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
            </NavigationTabList>
            <Outlet />
        </div>
    );
}

Component.displayName = 'CountryNsOverview';
