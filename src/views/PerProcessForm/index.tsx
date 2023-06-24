import { Outlet, useParams, generatePath } from 'react-router-dom';
import { useContext } from 'react';
import { isDefined, isNotDefined } from '@togglecorp/fujs';

import NavigationTab from '#components/NavigationTab';
import NavigationTabList from '#components/NavigationTabList';
import Page from '#components/Page';
import Button from '#components/Button';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';
import { useRequest } from '#utils/restRequest';
import {
    getCurrentPerProcessStep,
    STEP_WORKPLAN,
    STEP_PRIORITIZATION,
    STEP_ASSESSMENT,
    STEP_OVERVIEW,
} from '#utils/per';
import type { GET } from '#types/serverResponse';

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

    const {
        response: statusResponse,
        retrigger: refetchStatusResponse,
    } = useRequest<GET['api/v2/per-process-status/:id']>({
        skip: isNotDefined(perId),
        url: `api/v2/per-process-status/${perId}/`,
    });

    const currentStep = statusResponse?.phase
        ?? getCurrentPerProcessStep(statusResponse)
        ?? STEP_OVERVIEW;

    return (
        <Page
            className={styles.perProcessForm}
            title={strings.perFormTitle}
            heading={strings.perFormHeading}
            description={strings.perFormProcessDescription}
            actions={(
                <Button
                    name={undefined}
                >
                    Save
                </Button>
            )}
            info={(
                <NavigationTabList
                    className={styles.tabList}
                    variant="step"
                >
                    <NavigationTab
                        stepCompleted={currentStep > STEP_OVERVIEW}
                        to={isDefined(perId)
                            ? generatePath(perOverviewFormRoute.absolutePath, { perId })
                            : newPerOverviewFormRoute.absolutePath}
                    >
                        {strings.perFormTabOverviewLabel}
                    </NavigationTab>
                    <NavigationTab
                        stepCompleted={currentStep > STEP_ASSESSMENT}
                        to={isDefined(perId) && currentStep >= STEP_ASSESSMENT
                            ? generatePath(perAssessmentFormRoute.absolutePath, { perId })
                            : undefined}
                    >
                        {strings.perFormTabAssessmentLabel}
                    </NavigationTab>
                    <NavigationTab
                        stepCompleted={currentStep > STEP_PRIORITIZATION}
                        to={isDefined(perId) && currentStep >= STEP_PRIORITIZATION
                            ? generatePath(perPrioritizationFormRoute.absolutePath, { perId })
                            : undefined}
                    >
                        {strings.perFormTabPrioritizationLabel}
                    </NavigationTab>
                    <NavigationTab
                        stepCompleted={currentStep > STEP_WORKPLAN}
                        to={isDefined(perId) && currentStep >= STEP_WORKPLAN
                            ? generatePath(perWorkPlanFormRoute.absolutePath, { perId })
                            : undefined}
                    >
                        {strings.perFormTabWorkPlanLabel}
                    </NavigationTab>
                </NavigationTabList>
            )}
        >
            <Outlet
                context={{
                    statusResponse,
                    refetchStatusResponse,
                }}
            />
        </Page>
    );
}

Component.displayName = 'PerProcessForm';
