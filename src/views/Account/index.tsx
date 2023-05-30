import { Outlet } from 'react-router-dom';
import { useContext } from 'react';

import Page from '#components/Page';
import NavigationTabList from '#components/NavigationTabList';
import NavigationTab from '#components/NavigationTab';
import useTranslation from '#hooks/useTranslation';
import UserContext from '#contexts/user';
import routes from '#routes';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { userDetails } = useContext(UserContext);
    /*
    const {
        pending: mePending,
        response: meResponse,
    } = useRequest({
        url: 'api/v2/user/me/',
    });
    */

    return (
        <Page
            title={strings.accountTitle}
            heading={userDetails?.displayName ?? '--'}
        >
            <NavigationTabList>
                <NavigationTab
                    to={routes.accountInformation.absolutePath}
                >
                    {strings.accountInformation}
                </NavigationTab>
                <NavigationTab
                    to={routes.accountNotifications.absolutePath}
                >
                    {strings.accountNotification}
                </NavigationTab>
                <NavigationTab
                    to={routes.accountPERForms.absolutePath}
                >
                    {strings.accountPerForms}
                </NavigationTab>
                <NavigationTab
                    to={routes.accountDREFApplications.absolutePath}
                >
                    {strings.accountMyDrefApplications}
                </NavigationTab>
                <NavigationTab
                    to={routes.accountThreeWForms.absolutePath}
                >
                    {strings.accountThreeWForms}
                </NavigationTab>
            </NavigationTabList>
            <Outlet />
        </Page>
    );
}

Component.displayName = 'Account';
