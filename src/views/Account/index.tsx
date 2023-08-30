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
            title={strings.accountTitle}
            heading={userDetails?.displayName ?? '--'}
        >
            <NavigationTabList>
                <NavigationTab
                    to="accountInformation"
                >
                    {strings.accountInformation}
                </NavigationTab>
                <NavigationTab
                    to="accountNotifications"
                >
                    {strings.accountNotification}
                </NavigationTab>
                <NavigationTab
                    to="accountPerForms"
                >
                    {strings.accountPerForms}
                </NavigationTab>
                <NavigationTab
                    to="accountDrefApplications"
                >
                    {strings.accountMyDrefApplications}
                </NavigationTab>
                <NavigationTab
                    to="accountThreeWForms"
                >
                    {strings.accountThreeWForms}
                </NavigationTab>
            </NavigationTabList>
            <Outlet />
        </Page>
    );
}

Component.displayName = 'Account';
