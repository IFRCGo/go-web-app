import { useMemo } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';

import NavigationTab from '#components/NavigationTab';
import NavigationTabList from '#components/NavigationTabList';
import useTranslation from '#hooks/useTranslation';
import { CountryOutletContext } from '#utils/outletContext';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const {
        countryId,
        countryResponse,
        countryResponsePending,
    } = useOutletContext<CountryOutletContext>();

    const strings = useTranslation(i18n);

    const outletContext = useMemo<CountryOutletContext>(
        () => ({
            countryId,
            countryResponse,
            countryResponsePending,
        }),
        [
            countryId,
            countryResponse,
            countryResponsePending,
        ],
    );
    return (
        <div className={styles.countryOngoingActivities}>
            <NavigationTabList variant="secondary">
                <NavigationTab
                    to="countryOngoingActivitiesEmergencies"
                    urlParams={{ countryId }}
                >
                    {strings.ongoingEmergenciesTabTitle}
                </NavigationTab>
                <NavigationTab
                    to="countryOngoingActivitiesThreeWActivities"
                    urlParams={{ countryId }}
                >
                    {strings.threeWActivitiesTabTitle}
                </NavigationTab>
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
