import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    BarChart,
    BlockLoading,
    Container,
    KeyFigure,
    TimeSeriesChart,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { getDatesSeparatedByYear } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import useAlert from '#hooks/useAlert';
import {
    type GoApiResponse,
    type GoApiUrlQuery,
    useRequest,
} from '#utils/restRequest';

import OperationalLearningMap from '../OperationalLearningMap';

import i18n from './i18n.json';
import styles from './styles.module.css';

type OpsLearningQuery = GoApiUrlQuery<'/api/v2/ops-learning/'>;
type OpsLearningSummaryResponse = GoApiResponse<'/api/v2/ops-learning/stats/'>;
type SectorStatItem = NonNullable<OpsLearningSummaryResponse['learning_by_sector']>[number];
type RegionStatItem = NonNullable<OpsLearningSummaryResponse['learning_by_region']>[number];
type SourcesOverTimeItem = NonNullable<OpsLearningSummaryResponse['sources_overtime']>[number];

const sectorKeySelector = (datum: SectorStatItem) => datum.sector_id;
const sectorValueSelector = (datum: SectorStatItem) => datum.count;
const sectorLabelSelector = (datum: SectorStatItem) => datum.title;

const regionKeySelector = (datum: RegionStatItem) => datum.region_id;
const regionValueSelector = (datum: RegionStatItem) => datum.count;
const regionLabelSelector = (datum: RegionStatItem) => datum.region_name;

type SourceType = 'dref' | 'emergencyAppeal' | 'others';
const dataKeyToClassNameMap: Record<SourceType, string> = {
    dref: styles.dref,
    emergencyAppeal: styles.emergencyAppeal,
    others: styles.others,
};
const dataKeys: SourceType[] = [
    'dref',
    'emergencyAppeal',
    'others',
];
const sourceClassNameSelector = (dataKey: SourceType) => dataKeyToClassNameMap[dataKey];
const xAxisFormatter = (date: Date) => date.toLocaleString(
    navigator.language,
    { year: 'numeric' },
);

interface Props {
    query: OpsLearningQuery | undefined
}

const transformSourcesOverTimeData = (data: SourcesOverTimeItem[]) => {
    const groupedData: Record<string, Record<SourceType, number>> = {};

    data.forEach((entry) => {
        const year = new Date(entry.date).getFullYear().toString();
        if (!groupedData[year]) {
            groupedData[year] = { dref: 0, emergencyAppeal: 0, others: 0 };
        }
        if (entry.type_display === 'DREF') {
            groupedData[year].dref += entry.count;
        } else if (entry.type_display === 'Emergency Appeal') {
            groupedData[year].emergencyAppeal += entry.count;
        } else {
            groupedData[year].others += entry.count;
        }
    });

    return groupedData;
};

function Stats(props: Props) {
    const {
        query,
    } = props;

    const strings = useTranslation(i18n);
    const alert = useAlert();
    const [activePointKey, setActivePointKey] = useState<string>();

    const {
        response: learningStatsResponse,
        pending: learningStatsPending,
    } = useRequest({
        url: '/api/v2/ops-learning/stats/',
        query,
        onFailure: () => {
            alert.show(
                strings.failedToFetchStats,
                { variant: 'danger' },
            );
        },
    });

    const sourcesOverTimeData = useMemo(
        () => {
            if (isNotDefined(learningStatsResponse)) {
                return undefined;
            }
            return transformSourcesOverTimeData(learningStatsResponse.sources_overtime);
        },
        [learningStatsResponse],
    );
    const dateList = useMemo(() => {
        if (isNotDefined(sourcesOverTimeData)) {
            return undefined;
        }
        const dates = Object.keys(sourcesOverTimeData).map((year) => new Date(Number(year), 0, 1));
        const oldestDate = new Date(Math.min(...dates.map((date) => date.getTime())));
        const latestDate = new Date(Math.max(...dates.map((date) => date.getTime())));
        return getDatesSeparatedByYear(oldestDate, latestDate);
    }, [sourcesOverTimeData]);

    const sourcesOverTimeValueSelector = useCallback(
        (key: SourceType, date: Date) => {
            const value = sourcesOverTimeData?.[date.getFullYear()]?.[key];
            if (isDefined(value) && value > 0) {
                return value;
            }
            return undefined;
        },
        [sourcesOverTimeData],
    );

    return (
        <div className={styles.stats}>
            {learningStatsPending && <BlockLoading />}
            <div className={styles.keyFigureCard}>
                <KeyFigure
                    className={styles.keyFigure}
                    value={learningStatsResponse?.operations_included}
                    label={strings.operationsIncluded}
                    labelClassName={styles.keyFigureDescription}
                />
                <div className={styles.separator} />
                <KeyFigure
                    className={styles.keyFigure}
                    value={learningStatsResponse?.sources_used}
                    label={strings.sourcesUsed}
                    labelClassName={styles.keyFigureDescription}
                />
                <div className={styles.separator} />
                <KeyFigure
                    className={styles.keyFigure}
                    value={learningStatsResponse?.learning_extracts}
                    label={strings.learningExtract}
                    labelClassName={styles.keyFigureDescription}
                />
                <div className={styles.separator} />
                <KeyFigure
                    className={styles.keyFigure}
                    value={learningStatsResponse?.sectors_covered}
                    label={strings.sectorsCovered}
                    labelClassName={styles.keyFigureDescription}
                />
            </div>
            <div className={styles.learningOverview}>
                <OperationalLearningMap
                    learning={learningStatsResponse}
                />
                <div className={styles.charts}>
                    <Container
                        heading={strings.learningBySector}
                        className={styles.learningChart}
                        withHeaderBorder
                        withInternalPadding
                        compactMessage
                        empty={isDefined(learningStatsResponse?.learning_by_sector) && (
                            learningStatsResponse?.learning_by_sector.length < 1
                        )}
                    >
                        <BarChart
                            data={learningStatsResponse?.learning_by_sector}
                            keySelector={sectorKeySelector}
                            valueSelector={sectorValueSelector}
                            labelSelector={sectorLabelSelector}
                        />
                    </Container>
                    <Container
                        heading={strings.learningByRegions}
                        className={styles.learningChart}
                        withHeaderBorder
                        withInternalPadding
                        compactMessage
                        empty={isDefined(learningStatsResponse?.learning_by_region) && (
                            learningStatsResponse?.learning_by_region?.length < 1
                        )}
                    >
                        <BarChart
                            data={learningStatsResponse?.learning_by_region}
                            keySelector={regionKeySelector}
                            valueSelector={regionValueSelector}
                            labelSelector={regionLabelSelector}
                        />
                    </Container>
                    <Container
                        heading={strings.sourcesOverTime}
                        className={styles.learningChart}
                        withHeaderBorder
                        withInternalPadding
                        compactMessage
                        empty={isDefined(learningStatsResponse?.sources_overtime) && (
                            learningStatsResponse?.sources_overtime?.length < 1
                        )}
                    >
                        {isDefined(dateList) && (
                            <TimeSeriesChart
                                className={styles.timeSeriesChart}
                                timePoints={dateList}
                                dataKeys={dataKeys}
                                valueSelector={sourcesOverTimeValueSelector}
                                classNameSelector={sourceClassNameSelector}
                                activePointKey={activePointKey}
                                onTimePointClick={setActivePointKey}
                                xAxisFormatter={xAxisFormatter}
                            />
                        )}

                    </Container>
                </div>
            </div>
        </div>
    );
}

export default Stats;
