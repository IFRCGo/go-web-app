import { Outlet } from 'react-router-dom';
import { NavigationTabList } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import NavigationTab from '#components/NavigationTab';

import i18n from './i18n.json';
import styles from './styles.module.css';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <div className={styles.surgeOverview}>
            <NavigationTabList variant="secondary">
                <NavigationTab
                    to="rapidResponsePersonnel"
                >
                    {strings.rapidResponsePersonnelTitle}
                </NavigationTab>
                <NavigationTab
                    to="emergencyResponseUnit"
                >
                    {strings.emergencyResponseUnitTitle}
                </NavigationTab>
            </NavigationTabList>
            <Outlet />
        </div>
    );
}

Component.displayName = 'SurgeOverview';
