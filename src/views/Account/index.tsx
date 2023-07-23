import { Outlet } from 'react-router-dom';
import { useContext } from 'react';

import Page from '#components/Page';
import NavigationTabList from '#components/NavigationTabList';
import NavigationTab from '#components/NavigationTab';
import useTranslation from '#hooks/useTranslation';
import UserContext from '#contexts/user';
import RouteContext from '#contexts/route';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { userAuth: userDetails } = useContext(UserContext);
    const {
        accountInformation: accountInformationRoute,
        accountNotifications: accountNotificationsRoute,
        accountPerForms: accountPERFormsRoute,
        accountDrefApplications: accountDREFApplicationsRoute,
        accountThreeWForms: accountThreeWFormsRoute,
    } = useContext(RouteContext);

    return (
        <Page
            title={strings.accountTitle}
            heading={userDetails?.displayName ?? '--'}
        >
            <NavigationTabList>
                <NavigationTab
                    to={accountInformationRoute.absolutePath}
                >
                    {strings.accountInformation}
                </NavigationTab>
                <NavigationTab
                    to={accountNotificationsRoute.absolutePath}
                >
                    {strings.accountNotification}
                </NavigationTab>
                <NavigationTab
                    to={accountPERFormsRoute.absolutePath}
                >
                    {strings.accountPerForms}
                </NavigationTab>
                <NavigationTab
                    to={accountDREFApplicationsRoute.absolutePath}
                >
                    {strings.accountMyDrefApplications}
                </NavigationTab>
                <NavigationTab
                    to={accountThreeWFormsRoute.absolutePath}
                >
                    {strings.accountThreeWForms}
                </NavigationTab>
            </NavigationTabList>
            <Outlet />
        </Page>
    );
}

Component.displayName = 'Account';
