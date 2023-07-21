import { useContext } from 'react';
import { Outlet, generatePath } from 'react-router-dom';
import useTranslation from '#hooks/useTranslation';

import RouteContext from '#contexts/route';
import NavigationTabList from '#components/NavigationTabList';
import NavigationTab from '#components/NavigationTab';

import i18n from './i18n.json';
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const {
        catalogueService: catalogueServiceRoute,
        catalogueEmergency: catalogueEmergencyRoute,
        catalogueBasecamp: catalogueBasecampRoute,
    } = useContext(RouteContext);

    const strings = useTranslation(i18n);

    return (
        <div>
            <NavigationTabList>
                <NavigationTab
                    to={generatePath(
                        catalogueServiceRoute.absolutePath,
                    )}
                >
                    {strings.catalogueService}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        catalogueEmergencyRoute.absolutePath,
                    )}
                >
                    {strings.catalogueEmergency}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        catalogueBasecampRoute.absolutePath,
                    )}
                >
                    {strings.catalogueBasecamp}
                </NavigationTab>
            </NavigationTabList>
            <Outlet />
        </div>
    );
}

Component.displayName = 'SurgeCatalogue';
