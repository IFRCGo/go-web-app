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
    LegendItem,
    TextOutput,
    TimeSeriesChart,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    formatDate,
    getDatesSeparatedByYear,
    getFormattedDateKey,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import { type components } from '#generated/types';
import useAlert from '#hooks/useAlert';
import {
    type GoApiResponse,
    type GoApiUrlQuery,
    useRequest,
} from '#utils/restRequest';

import OperationalLearningMap from './OperationalLearningMap';

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
interface SourceTypeOption {
    key: SourceType;
    label: string;
    color: string;
}

const dataKeys: SourceType[] = [
    'dref',
    'emergencyAppeal',
    'others',
];
const dataKeyToClassNameMap: Record<SourceType, string> = {
    dref: styles.dref,
    emergencyAppeal: styles.emergencyAppeal,
    others: styles.others,
};
const sourceClassNameSelector = (dataKey: SourceType) => dataKeyToClassNameMap[dataKey];
const xAxisFormatter = (date: Date) => date.toLocaleString(
    navigator.language,
    { year: 'numeric' },
);

type SourceTypeEnum = components<'read'>['schemas']['ApiAppealTypeEnumKey'];
const SOURCE_TYPE_EMERGENCY = 1 satisfies SourceTypeEnum;
const SOURCE_TYPE_DREF = 0 satisfies SourceTypeEnum;

const transformSourcesOverTimeData = (data: SourcesOverTimeItem[]) => (
    data.reduce<Record<string, Record<SourceType, number>>>((acc, entry) => {
        const year = getFormattedDateKey(entry.date);
        if (isNotDefined(acc[year])) {
            acc[year] = { dref: 0, emergencyAppeal: 0, others: 0 };
        }

        if (entry.atype === SOURCE_TYPE_DREF) {
            acc[year].dref += entry.count;
        } else if (entry.atype === SOURCE_TYPE_EMERGENCY) {
            acc[year].emergencyAppeal += entry.count;
        } else {
            acc[year].others += entry.count;
        }

        return acc;
    }, {})
);

interface Props {
    query: OpsLearningQuery | undefined
}

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

        const dates = Object.keys(sourcesOverTimeData).map((year) => new Date(year));

        if (dates.length < 1) {
            return undefined;
        }

        const oldestDate = new Date(Math.min(...dates.map((date) => date.getTime())));
        const latestDate = new Date(Math.max(...dates.map((date) => date.getTime())));

        return getDatesSeparatedByYear(oldestDate, latestDate);
    }, [sourcesOverTimeData]);

    const sourcesOverTimeValueSelector = useCallback(
        (key: SourceType, date: Date) => {
            const value = sourcesOverTimeData?.[getFormattedDateKey(date)]?.[key];
            return isDefined(value) && value > 0 ? value : undefined;
        },
        [sourcesOverTimeData],
    );

    const sourceTypeOptions: SourceTypeOption[] = useMemo(() => ([
        {
            key: 'dref',
            label: strings.sourceDREF,
            color: 'var(--color-source-dref)',
        },
        {
            key: 'emergencyAppeal',
            label: strings.sourceEmergencyAppeal,
            color: 'var(--color-source-emergency-appeal)',
        },
        {
            key: 'others',
            label: strings.sourceOthers,
            color: 'var(--color-source-others)',
        },
    ]), [
        strings.sourceDREF,
        strings.sourceEmergencyAppeal,
        strings.sourceOthers,
    ]);

    const activePointData = isDefined(activePointKey)
        ? sourcesOverTimeData?.[activePointKey] : undefined;

    return (
        <div className={styles.stats}>
            {learningStatsPending && <BlockLoading />}
            <Container
                contentViewType="grid"
                numPreferredGridContentColumns={4}
                spacing="compact"
            >
                <KeyFigure
                    className={styles.keyFigure}
                    value={learningStatsResponse?.operations_included}
                    label={strings.operationsIncluded}
                    labelClassName={styles.keyFigureDescription}
                />
                <KeyFigure
                    className={styles.keyFigure}
                    value={learningStatsResponse?.sources_used}
                    label={strings.sourcesUsed}
                    labelClassName={styles.keyFigureDescription}
                />
                <KeyFigure
                    className={styles.keyFigure}
                    value={learningStatsResponse?.learning_extracts}
                    label={strings.learningExtract}
                    labelClassName={styles.keyFigureDescription}
                />
                <KeyFigure
                    className={styles.keyFigure}
                    value={learningStatsResponse?.sectors_covered}
                    label={strings.sectorsCovered}
                    labelClassName={styles.keyFigureDescription}
                />
            </Container>
            <div className={styles.learningOverview}>
                <OperationalLearningMap
                    learningByCountry={learningStatsResponse?.learning_by_country}
                />
                <div className={styles.charts}>
                    <Container
                        heading={strings.learningBySector}
                        className={styles.chart}
                        withHeaderBorder
                        withInternalPadding
                        compactMessage
                        pending={learningStatsPending}
                        empty={isDefined(learningStatsResponse?.learning_by_sector) && (
                            (learningStatsResponse?.learning_by_sector.length ?? 0) < 1
                        )}
                    >
                        <BarChart
                            barClassName={styles.bar}
                            data={learningStatsResponse?.learning_by_sector}
                            keySelector={sectorKeySelector}
                            valueSelector={sectorValueSelector}
                            labelSelector={sectorLabelSelector}
                        />
                    </Container>
                    <Container
                        heading={strings.learningByRegions}
                        className={styles.chart}
                        withHeaderBorder
                        withInternalPadding
                        compactMessage
                        pending={learningStatsPending}
                        empty={isDefined(learningStatsResponse?.learning_by_region) && (
                            (learningStatsResponse?.learning_by_region.length ?? 0) < 1
                        )}
                    >
                        <BarChart
                            barClassName={styles.bar}
                            data={learningStatsResponse?.learning_by_region}
                            keySelector={regionKeySelector}
                            valueSelector={regionValueSelector}
                            labelSelector={regionLabelSelector}
                        />
                    </Container>
                    <Container
                        heading={strings.sourcesOverTime}
                        className={styles.chart}
                        withHeaderBorder
                        withInternalPadding
                        compactMessage
                        pending={learningStatsPending}
                        childrenContainerClassName={styles.chartContainer}
                        empty={isDefined(learningStatsResponse?.sources_overtime) && (
                            (learningStatsResponse?.sources_overtime.length ?? 0) < 1
                        )}
                    >
                        {isDefined(dateList) && (
                            <>
                                <TimeSeriesChart
                                    className={styles.timeSeriesChart}
                                    xAxisTickClassName={styles.xAxisTick}
                                    timePoints={dateList}
                                    dataKeys={dataKeys}
                                    valueSelector={sourcesOverTimeValueSelector}
                                    classNameSelector={sourceClassNameSelector}
                                    activePointKey={activePointKey}
                                    onTimePointClick={setActivePointKey}
                                    xAxisFormatter={xAxisFormatter}
                                />
                                {isDefined(activePointKey) ? (
                                    <div
                                        className={styles.legend}
                                    >
                                        <TextOutput
                                            value={formatDate(activePointKey, 'yyyy') ?? '--'}
                                            strongValue
                                        />
                                        <TextOutput
                                            label={(
                                                <LegendItem
                                                    label={strings.sourceDREF}
                                                    color="var(--color-source-dref)"
                                                />
                                            )}
                                            withoutLabelColon
                                            value={activePointData?.dref}
                                            valueType="number"
                                        />
                                        <TextOutput
                                            label={(
                                                <LegendItem
                                                    label={strings.sourceEmergencyAppeal}
                                                    color="var(--color-source-emergency-appeal)"
                                                />
                                            )}
                                            withoutLabelColon
                                            value={activePointData?.emergencyAppeal}
                                            valueType="number"
                                        />
                                        <TextOutput
                                            label={(
                                                <LegendItem
                                                    label={strings.sourceOthers}
                                                    color="var(--color-source-emergency-appeal)"
                                                />
                                            )}
                                            withoutLabelColon
                                            value={activePointData?.others}
                                            valueType="number"
                                        />
                                    </div>
                                ) : (
                                    <div className={styles.typeOfSourceLegend}>
                                        <div className={styles.legendLabel}>
                                            {strings.sourcesTypeLegendLabel}
                                        </div>
                                        <div className={styles.legendContent}>
                                            {sourceTypeOptions.map((source) => (
                                                <LegendItem
                                                    key={source.key}
                                                    label={source.label}
                                                    color={source.color}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>

                        )}

                    </Container>
                </div>
            </div>
        </div>
    );
}

export default Stats;
