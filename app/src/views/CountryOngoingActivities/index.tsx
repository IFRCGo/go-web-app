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
        <div className={styles.countryOngoingActivities}>
            <NavigationTabList variant="secondary">
                <NavigationTab
                    to="countryOngoingActivitiesEmergencies"
                    urlParams={{ countryId }}
                >
                    {strings.ongoingEmergenciesTabTitle}
                </NavigationTab>
                {/* Hide for now, as per the client./}
                {/* <NavigationTab
                    to="countryOngoingActivitiesThreeWActivities"
                    urlParams={{ countryId }}
                >
                    {strings.threeWActivitiesTabTitle}
                </NavigationTab> */}
                <NavigationTab
                    to="countryOngoingActivitiesThreeWProjects"
                    urlParams={{ countryId }}
                >
                    {strings.threeWProjectsTabTitle}
                </NavigationTab>
            </NavigationTabList>
            <Outlet context={outletContext} />
        </div>
    );
}

Component.displayName = 'CountryOngoingActivities';
