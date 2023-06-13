import { Outlet, useParams, generatePath } from 'react-router-dom';
import { useContext } from 'react';
import { isDefined } from '@togglecorp/fujs';

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
    const { perId } = useParams<{ perId: string }>();
    const {
        newPerOverviewForm: newPerOverviewFormRoute,
        perOverviewForm: perOverviewFormRoute,
        perAssessmentForm: perAssessmentFormRoute,
        perPrioritizationForm: perPrioritizationFormRoute,
        perWorkPlanForm: perWorkPlanFormRoute,
    } = useContext(RouteContext);

    return (
        <Page
            className={styles.perProcessForm}
            title={strings.perFormTitle}
            heading={strings.perFormHeading}
            description={strings.perFormProcessDescription}
            info={(
                <NavigationTabList
                    className={styles.tabList}
                    variant="step"
                >
                    <NavigationTab
                        to={isDefined(perId)
                            ? generatePath(perOverviewFormRoute.absolutePath, { perId })
                            : newPerOverviewFormRoute.absolutePath}
                    >
                        {strings.perFormTabOverviewLabel}
                    </NavigationTab>
                    <NavigationTab
                        to={isDefined(perId)
                            ? generatePath(perAssessmentFormRoute.absolutePath, { perId })
                            : undefined}
                    >
                        {strings.perFormTabAssessmentLabel}
                    </NavigationTab>
                    <NavigationTab
                        to={isDefined(perId)
                            ? generatePath(perPrioritizationFormRoute.absolutePath, { perId })
                            : undefined}
                    >
                        {strings.perFormTabPrioritizationLabel}
                    </NavigationTab>
                    <NavigationTab
                        to={isDefined(perId)
                            ? generatePath(perWorkPlanFormRoute.absolutePath, { perId })
                            : undefined}
                    >
                        {strings.perFormTabWorkPlanLabel}
                    </NavigationTab>
                </NavigationTabList>
            )}
        >
            <Outlet />
        </Page>
    );
}

Component.displayName = 'PerProcessForm';
