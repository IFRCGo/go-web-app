import { Outlet } from 'react-router-dom';
import { useContext } from 'react';

import Page from '#components/Page';
import NavigationTabList from '#components/NavigationTabList';
import NavigationTab from '#components/NavigationTab';
import useTranslation from '#hooks/useTranslation';
import UserContext from '#contexts/user';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { userAuth: userDetails } = useContext(UserContext);

    return (
        <Page
            title={strings.accountPageTitle}
            heading={userDetails?.displayName ?? '--'}
        >
            <NavigationTabList>
                <NavigationTab
                    to="accountDetails"
                >
                    {strings.accountDetailsTabTitle}
                </NavigationTab>
                <NavigationTab
                    to="accountMyFormsLayout"
                    parentRoute
                >
                    {strings.accountMyFormTabTitle}
                </NavigationTab>
                <NavigationTab
                    to="accountNotifications"
                >
                    {strings.accountNotificationTabTitle}
                </NavigationTab>
            </NavigationTabList>
            <Outlet />
        </Page>
    );
}

Component.displayName = 'Account';
