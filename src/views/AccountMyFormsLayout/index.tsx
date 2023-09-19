import { Outlet } from 'react-router-dom';

import NavigationTabList from '#components/NavigationTabList';
import NavigationTab from '#components/NavigationTab';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <div className={styles.accountMyFormsLayout}>
            <NavigationTabList variant="secondary">
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
            </NavigationTabList>
            <Outlet />
        </div>
    );
}

Component.displayName = 'AccountMyFormsLayout';
