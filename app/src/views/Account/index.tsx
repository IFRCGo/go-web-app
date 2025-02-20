import { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { NavigationTabList } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import NavigationTab from '#components/NavigationTab';
import Page from '#components/Page';
import WikiLink from '#components/WikiLink';
import UserContext from '#contexts/user';
import useUserMe from '#hooks/domain/useUserMe';
import { getUserName } from '#utils/domain/user';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { userAuth: userDetails } = useContext(UserContext);
    const userMe = useUserMe();

    return (
        <Page
            title={strings.accountPageTitle}
            actions={(
                <WikiLink
                    href="user_guide/account"
                />
            )}
            heading={
                userMe
                    ? getUserName(userMe)
                    : userDetails?.displayName ?? '--'
            }
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
