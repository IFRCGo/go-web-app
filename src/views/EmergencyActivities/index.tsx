import { useState, useMemo } from 'react';
import { sumSafe } from '#utils/common';
import { useOutletContext } from 'react-router-dom';
import { InformationLineIcon } from '@ifrc-go/icons';

import BlockLoading from '#components/BlockLoading';
import Button from '#components/Button';
import Container from '#components/Container';
import KeyFigure from '#components/KeyFigure';
import PieChart from '#components/PieChart';
import Tooltip from '#components/Tooltip';
import type { EmergencyOutletContext } from '#utils/outletContext';
import useTranslation from '#hooks/useTranslation';
import { type GoApiResponse } from '#utils/restRequest';
import { useRequest } from '#utils/restRequest';
import {
    numericCountSelector,
    stringTitleSelector,
} from '#utils/selectors';

import useProjectStats from './useProjectStats';
import i18n from './i18n.json';
import styles from './styles.module.css';
import { compareNumber, isDefined, isNotDefined } from '@togglecorp/fujs';
import TextOutput from '#components/TextOutput';

type EmergencyProjectResponse = GoApiResponse<'/api/v2/emergency-project/'>;
type EmergencyProject = NonNullable<EmergencyProjectResponse['results']>[number];

const MAX_ITEMS = 4;

const primaryRedColorShades = [
    'var(--go-ui-color-red-90)',
    'var(--go-ui-color-red-60)',
    'var(--go-ui-color-red-40)',
    'var(--go-ui-color-red-20)',
    'var(--go-ui-color-red-10)',
];

function getAggregatedValues(values: { title: string, count: number}[]) {
    const sortedValues = [...values].sort((a, b) => compareNumber(b.count, a.count));

    if (sortedValues.length <= MAX_ITEMS) {
        return sortedValues;
    }

    const remains = sortedValues.splice(
        MAX_ITEMS - 1,
        sortedValues.length - (MAX_ITEMS - 1),
    );
    const otherCount = sumSafe(remains.map(d => d.count));
    if (isDefined(otherCount) && otherCount > 0) {
        sortedValues.push({
            title: 'Others',
            count: otherCount,
        });
    }

    return sortedValues;
}
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const { emergencyResponse } = useOutletContext<EmergencyOutletContext>();
    const [filteredProjectList, setFilteredProjectList] = useState<EmergencyProject[]>([]);

    const {
        response: projectListResponse,
        pending: projectListResponsePending,
    } = useRequest({
        url: '/api/v2/emergency-project/',
        preserveResponse: true,
        skip: (isNotDefined(emergencyResponse?.id)),
        query: isDefined(emergencyResponse) ? {
            event: [emergencyResponse.id],
            limit: 100,
        } : undefined,
    });

    const {
        projectCountByDistrict,
        uniqueEruCount,
        uniqueNsCount,
        uniqueSectorCount,
        peopleReached,
        projectCountListBySector,
        projectCountListByStatus,
        sectorGroupedProjectList,
    } = useProjectStats(
        projectListResponse?.results,
        filteredProjectList,
    );

    const aggreatedProjectCountListBySector = useMemo(() => (
        getAggregatedValues(projectCountListBySector)
    ), [projectCountListBySector]);

    const aggreatedProjectCountListByStatus = useMemo(() => (
        getAggregatedValues(projectCountListByStatus)
    ), [projectCountListByStatus]);

    return (
        <div className={styles.emergencyActivities}>
            <Container
                withHeaderBorder
                footerContent={(
                    <div className={styles.chartDescription}>
                        <InformationLineIcon />
                        {strings.chartDescription}
                    </div>
                )}
                actions={(
                    <Button
                        variant="secondary"
                        name={undefined}
                        title={strings.addThreeWActivity}
                    >
                        {strings.addThreeWActivity}
                    </Button>
                )}
            >
                {projectListResponsePending && <BlockLoading />}
                {!projectListResponsePending && (
                    <div className={styles.keyFigureCardList}>
                        <div className={styles.keyFigureCard}>
                            <KeyFigure
                                className={styles.keyFigure}
                                value={(uniqueNsCount + uniqueEruCount)}
                                description={strings.uniqueEruAndNationalSocietyCount}
                            />
                            <div className={styles.separator} />
                            <div className={styles.keyFigure}>
                                <KeyFigure
                                    className={styles.keyFigure}
                                    value={peopleReached}
                                    description={strings.peopleReached}
                                />
                                <Tooltip className={styles.tooltip}>
                                    {strings.peopleReachedTooltip}
                                </Tooltip>
                            </div>
                        </div>
                        <div className={styles.keyFigureCard}>
                            <KeyFigure
                                className={styles.keyFigure}
                                value={uniqueSectorCount}
                                description={strings.uniqueSectorCount}
                            />
                            <div className={styles.separator} />
                            <div className={styles.pieChartContainer}>
                                <TextOutput
                                    value={strings.activitySectors}
                                />
                                <PieChart
                                    className={styles.pieChart}
                                    data={aggreatedProjectCountListBySector}
                                    valueSelector={numericCountSelector}
                                    labelSelector={stringTitleSelector}
                                    keySelector={stringTitleSelector}
                                    colors={primaryRedColorShades}
                                    pieRadius={40}
                                    chartPadding={10}
                                />
                            </div>
                        </div>
                        <div className={styles.keyFigureCard}>
                            <KeyFigure
                                className={styles.keyFigure}
                                value={projectListResponse?.count}
                                description={strings.totalActivities}
                            />
                            <div className={styles.separator} />
                            <div className={styles.pieChartContainer}>
                                <TextOutput
                                    value={strings.activityStatus}
                                />
                                <PieChart
                                    className={styles.pieChart}
                                    data={aggreatedProjectCountListByStatus}
                                    valueSelector={numericCountSelector}
                                    labelSelector={stringTitleSelector}
                                    keySelector={stringTitleSelector}
                                    colors={primaryRedColorShades}
                                    pieRadius={40}
                                    chartPadding={10}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </Container>
        </div>
    );
}

Component.displayName = 'EmergencyActivities';
