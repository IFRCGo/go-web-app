import { Outlet } from 'react-router-dom';
import { NavigationTabList } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import NavigationTab from '#components/NavigationTab';
import Page from '#components/Page';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <Page
            heading={strings.eapHeading}
            description={strings.eapDescription}
        >
            <NavigationTabList>
                <NavigationTab
                    to="drefDetail"
                >
                    {strings.eapProcessDrefTab}
                </NavigationTab>
                <NavigationTab
                    to="eapDetail"
                >
                    {strings.eapProcessEapTab}
                </NavigationTab>
            </NavigationTabList>
            <Outlet />
        </Page>
    );
}

Component.displayName = 'DrefProcess';
