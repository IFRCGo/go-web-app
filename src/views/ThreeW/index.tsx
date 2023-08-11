import { useContext } from 'react';
import { isDefined } from '@togglecorp/fujs';
import {
    Outlet,
    useParams,
} from 'react-router-dom';

import NavigationTab from '#components/NavigationTab';
import NavigationTabList from '#components/NavigationTabList';
import Page from '#components/Page';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const {
        projectId,
        activityId,
    } = useParams<{
        projectId: string,
        activityId: string,
    }>();

    const {
        newThreeWProject: newThreeWProjectRoute,
        newThreeWActivity: newThreeWActivityRoute,
    } = useContext(RouteContext);

    return (
        <Page
            className={styles.perProcessForm}
            title={strings.threeWFormTitle}
            heading={strings.threeWFormHeading}
            description={strings.threeWFormDescription}
            withBackgroundColorInMainSection
            info={(
                <NavigationTabList
                    className={styles.tabList}
                    variant="secondary"
                >
                    <NavigationTab
                        to={newThreeWProjectRoute.absolutePath}
                        disabled={isDefined(projectId) || isDefined(activityId)}
                    >
                        {strings.newThreeWProjectTabLabel}
                    </NavigationTab>
                    <NavigationTab
                        to={newThreeWActivityRoute.absolutePath}
                        disabled={isDefined(projectId) || isDefined(activityId)}
                    >
                        {strings.newThreeWActivityTabLabel}
                    </NavigationTab>
                </NavigationTabList>
            )}
        >
            <Outlet />
        </Page>
    );
}

Component.displayName = 'ThreeW';
