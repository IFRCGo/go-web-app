import { Outlet } from 'react-router-dom';
import { NavigationTabList } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import NavigationTab from '#components/NavigationTab';
import TabPage from '#components/TabPage';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <TabPage>
            <NavigationTabList styleVariant="pill">
                <NavigationTab
                    to="accountMyFormsFieldReport"
                >
                    {strings.fieldReportTabTitle}
                </NavigationTab>
                <NavigationTab
                    to="accountMyFormsPer"
                >
                    {strings.perTabTitle}
                </NavigationTab>
                <NavigationTab
                    to="accountMyFormsDref"
                >
                    {strings.drefTabTitle}
                </NavigationTab>
                <NavigationTab
                    to="accountMyFormsThreeW"
                >
                    {strings.threeWTabTitle}
                </NavigationTab>
                <NavigationTab
                    to="accountMyFormsEap"
                >
                    {strings.eapApplications}
                </NavigationTab>
            </NavigationTabList>
            <Outlet />
        </TabPage>
    );
}

Component.displayName = 'AccountMyFormsLayout';
