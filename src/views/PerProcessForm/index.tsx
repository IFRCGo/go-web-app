import { Outlet, useParams, generatePath } from 'react-router-dom';
import { useContext } from 'react';
import { isDefined } from '@togglecorp/fujs';

import NavigationTab from '#components/NavigationTab';
import NavigationTabList from '#components/NavigationTabList';
import Page from '#components/Page';
import Button from '#components/Button';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';

import i18n from './i18n.json';
import styles from './styles.module.css';
import { perOverviewFields } from './common';

interface Props {
    className?: string;
}

// eslint-disable-next-line import/prefer-default-export
export function Component(props: Props) {
    const strings = useTranslation(i18n);
    const { perId } = useParams<{ perId: string }>();

    const {
        className,
    } = props;

    const {
        newPerOverviewForm: newPerOverviewFormRoute,
        perOverviewForm: perOverviewFormRoute,
        perAssessmentForm: perAssessmentFormRoute,
        perPrioritizationForm: perPrioritizationFormRoute,
    } = useContext(RouteContext);

    return (
        <Page
            className={className}
            actions={(
                <>
                    <Button
                        variant="secondary"
                        name={undefined}
                        onClick={undefined}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        name={undefined}
                        onClick={undefined}
                    >
                        Save and Close
                    </Button>
                </>
            )}
            title={strings.perFormTitle}
            heading={strings.perFormHeading}
            description={strings.perFormProcessDescription}
            info={(
                <NavigationTabList className={styles.tabList}>
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
                    <NavigationTab>
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
