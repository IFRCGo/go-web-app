import { Outlet, useOutletContext } from 'react-router-dom';

import NavigationTab from '#components/NavigationTab';
import NavigationTabList from '#components/NavigationTabList';
import useTranslation from '#hooks/useTranslation';
import { CountryOutletContext } from '#utils/outletContext';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const outletContext = useOutletContext<CountryOutletContext>();
    const { countryId } = outletContext;
    const strings = useTranslation(i18n);

    return (
        <div className={styles.countryProfile}>
            <NavigationTabList variant="secondary">
                <NavigationTab
                    to="countryProfileOverview"
                    urlParams={{ countryId }}
                >
                    {strings.overviewTabTitle}
                </NavigationTab>
                <NavigationTab
                    to="countryProfileSupportingPartners"
                    urlParams={{ countryId }}
                >
                    {strings.supportingPartnersTabTitle}
                </NavigationTab>
                <NavigationTab
                    to="countryProfilePreviousEvents"
                    urlParams={{ countryId }}
                >
                    {strings.previousEventsTabTitle}
                </NavigationTab>
                <NavigationTab
                    to="countryProfileSeasonalRisks"
                    urlParams={{ countryId }}
                >
                    {strings.seasonalRisksTabTitle}
                </NavigationTab>
            </NavigationTabList>
            <Outlet context={outletContext} />
        </div>
    );
}

Component.displayName = 'CountryProfile';
