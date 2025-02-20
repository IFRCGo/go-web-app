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
        <div className={styles.countryProfile}>
            <NavigationTabList variant="secondary">
                <NavigationTab
                    to="countryProfileOverview"
                    urlParams={{ countryId }}
                >
                    {strings.overviewTabTitle}
                </NavigationTab>
                <NavigationTab
                    to="countryProfileSeasonalRisks"
                    urlParams={{ countryId }}
                >
                    {strings.riskWatchTabTitle}
                </NavigationTab>
                <NavigationTab
                    to="countryProfilePreviousEvents"
                    urlParams={{ countryId }}
                >
                    {strings.previousEventsTabTitle}
                </NavigationTab>
            </NavigationTabList>
            <Outlet context={outletContext} />
        </div>
    );
}

Component.displayName = 'CountryProfile';
