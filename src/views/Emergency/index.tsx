import { useContext, useMemo } from 'react';
import { generatePath, useParams, Outlet } from 'react-router-dom';
import {
    FundingIcon,
    FundingCoverageIcon,
    TargetedPopulationIcon,
} from '@ifrc-go/icons';

import Page from '#components/Page';
import NavigationTabList from '#components/NavigationTabList';
import KeyFigure from '#components/KeyFigure';
import NavigationTab from '#components/NavigationTab';
import RouteContext from '#contexts/route';
import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';
import { sumSafe } from '#utils/common';
import type { EmergencyOutletContext } from '#utils/emergency';
import type { paths } from '#generated/types';

import i18n from './i18n.json';
import styles from './styles.module.css';

type EventResponse = paths['/api/v2/event/{id}/']['get']['responses']['200']['content']['application/json'];

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { emergencyId } = useParams<{ emergencyId: string }>();
    const strings = useTranslation(i18n);

    const {
        emergencyDetails: emergencyDetailsRoute,
        emergencyReportsAndDocuments: emergencyReportsAndDocumentsRoute,
        emergencyActivities: emergencyActivitiesRoute,
        emergencySurge: emergencySurgeRoute,
    } = useContext(RouteContext);

    const {
        // pending: emergencyPending,
        response: emergencyResponse,
    } = useRequest<EventResponse>({
        skip: !emergencyId,
        url: `api/v2/event/${emergencyId}/`,
    });

    const peopleTargeted = sumSafe(
        emergencyResponse?.appeals.map(
            (appeal) => appeal.num_beneficiaries,
        ),
    );
    const fundingRequirements = sumSafe(
        emergencyResponse?.appeals.map(
            (appeal) => Number(appeal.amount_requested),
        ),
    );
    const funding = sumSafe(
        emergencyResponse?.appeals.map(
            (appeal) => Number(appeal.amount_funded),
        ),
    );

    const outletContext = useMemo<EmergencyOutletContext>(
        () => ({
            emergencyResponse,
        }),
        [emergencyResponse],
    );

    return (
        <Page
            className={styles.emergency}
            title={strings.emergencyPageTitle}
            heading={emergencyResponse?.name ?? '--'}
            infoContainerClassName={styles.keyFigureList}
            info={(
                <>
                    <KeyFigure
                        icon={<TargetedPopulationIcon />}
                        className={styles.keyFigure}
                        value={peopleTargeted}
                        compactValue
                        description={strings.emergencyPeopleTargetedLabel}
                    />
                    <KeyFigure
                        icon={<FundingIcon />}
                        className={styles.keyFigure}
                        value={fundingRequirements}
                        compactValue
                        description={strings.emergencyFundingRequirementsLabel}
                    />
                    <KeyFigure
                        icon={<FundingCoverageIcon />}
                        className={styles.keyFigure}
                        value={funding}
                        compactValue
                        description={strings.emergencyFundingLabel}
                    />
                </>
            )}
        >
            <NavigationTabList>
                <NavigationTab
                    to={generatePath(
                        emergencyDetailsRoute.absolutePath,
                        { emergencyId },
                    )}
                >
                    {strings.emergencyTabDetails}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        emergencyReportsAndDocumentsRoute.absolutePath,
                        { emergencyId },
                    )}
                >
                    {strings.emergencyTabReports}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        emergencyActivitiesRoute.absolutePath,
                        { emergencyId },
                    )}
                >
                    {strings.emergencyTabActivities}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        emergencySurgeRoute.absolutePath,
                        { emergencyId },
                    )}
                >
                    {strings.emergencyTabSurge}
                </NavigationTab>
            </NavigationTabList>
            <Outlet
                context={outletContext}
            />
        </Page>
    );
}

Component.displayName = 'Emergency';
