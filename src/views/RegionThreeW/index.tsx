import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    DownloadFillIcon,
} from '@ifrc-go/icons';

import Link from '#components/Link';
import Button from '#components/Button';
import BlockLoading from '#components/BlockLoading';
import Container from '#components/Container';
import KeyFigure from '#components/KeyFigure';
import PieChart from '#components/PieChart';
import ProgressBar from '#components/ProgressBar';
import TextOutput from '#components/TextOutput';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';
import {
    numericCountSelector,
    stringNameSelector,
} from '#utils/selectors';

import MovementActivitiesMap from './MovementActivitiesMap';
import Filters, { type FilterValue } from './Filters';
import i18n from './i18n.json';
import styles from './styles.module.css';

const primaryRedColorShades = [
    'var(--go-ui-color-red-90)',
    'var(--go-ui-color-red-60)',
    'var(--go-ui-color-red-40)',
    'var(--go-ui-color-red-20)',
    'var(--go-ui-color-red-10)',
];

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { regionId } = useParams<{ regionId: string }>();

    const { deployments_project_status: projectStatus } = useGlobalEnums();

    const strings = useTranslation(i18n);

    const [filters, setFilters] = useState<FilterValue>({
        operation_type: [],
        programme_type: [],
        primary_sector: [],
        secondary_sectors: [],
        status: [],
    });

    const {
        response: regionProjectOverviewResponse,
        pending: regionProjectOverviewResponsePending,
    } = useRequest({
        url: '/api/v2/region-project/{id}/overview/',
        skip: isNotDefined(regionId),
        pathVariables: isDefined(regionId) ? {
            id: regionId,
        } : undefined,
    });

    const {
        response: regionalMovementActivitiesResponse,
        pending: regionalMovementActivitiesResponsePending,
    } = useRequest({
        url: '/api/v2/region-project/{id}/movement-activities/',
        skip: isNotDefined(regionId),
        pathVariables: isDefined(regionId) ? {
            id: regionId,
        } : undefined,
        query: filters, // TODO: fix typings
    });

    const projectByStatus = regionProjectOverviewResponse?.projects_by_status?.map((project) => {
        const name = projectStatus?.find((status) => (status.key === project.status))?.value;
        if (isDefined(name)) {
            return {
                count: project.count,
                name,
            };
        }
        return undefined;
    }).filter(isDefined);

    return (
        <div
            className={styles.regionThreeW}
        >
            {regionProjectOverviewResponsePending ? (
                <BlockLoading />
            ) : (
                <div className={styles.keyFigureCardList}>
                    <div className={styles.keyFigureCard}>
                        <KeyFigure
                            className={styles.keyFigure}
                            value={regionProjectOverviewResponse?.ns_with_ongoing_activities}
                            description={strings.nationalSocietyWithOngoingActivities}
                        />
                        <div className={styles.separator} />
                        <KeyFigure
                            className={styles.keyFigure}
                            value={regionProjectOverviewResponse?.total_budget}
                            description={strings.totalBuget}
                        />
                    </div>
                    <div className={styles.peopleReachedCard}>
                        <TextOutput
                            value={strings.totalPeopleReached}
                        />
                        <KeyFigure
                            className={styles.keyFigure}
                            value={regionProjectOverviewResponse?.reached_total}
                        />
                        {isDefined(regionProjectOverviewResponse?.reached_total)
                            && isDefined(regionProjectOverviewResponse?.target_total)
                            && (regionProjectOverviewResponse?.target_total ?? 0) > 0 && (
                            <ProgressBar
                                value={regionProjectOverviewResponse?.reached_total ?? 0}
                                totalValue={regionProjectOverviewResponse?.target_total}
                            />
                        )}
                        <TextOutput
                            valueType="number"
                            label={strings.targetedPopulation}
                            value={regionProjectOverviewResponse?.target_total}
                        />
                    </div>
                    <div className={styles.keyFigureCard}>
                        <KeyFigure
                            className={styles.keyFigure}
                            value={regionProjectOverviewResponse?.total_projects}
                            description={strings.totalProjects}
                        />
                        <div className={styles.separator} />
                        <div>
                            <TextOutput
                                value={strings.totalProjectsByStatus}
                            />
                            <PieChart
                                className={styles.pieChart}
                                data={projectByStatus}
                                valueSelector={numericCountSelector}
                                labelSelector={stringNameSelector}
                                keySelector={stringNameSelector}
                                colors={primaryRedColorShades}
                                pieRadius={40}
                                chartPadding={10}
                            />
                        </div>
                    </div>
                </div>
            )}
            <Container
                className={styles.movementActivities}
                childrenContainerClassName={styles.content}
                heading={strings.movementActivities}
                withHeaderBorder
                filters={(
                    <Filters
                        value={filters}
                        onChange={setFilters}
                    />
                )}
                actions={(
                    <>
                        <Button
                            variant="primary"
                            name={undefined}
                            icons={<DownloadFillIcon />}
                        >
                            {strings.export}
                        </Button>
                        <Link
                            to="newThreeWActivity"
                        >
                            {strings.addThreeW}
                        </Link>
                    </>
                )}
            >
                <MovementActivitiesMap
                    regionId={regionId}
                    movementActivitiesResponse={regionalMovementActivitiesResponse}
                />
            </Container>
        </div>
    );
}

Component.displayName = 'RegionThreeW';
