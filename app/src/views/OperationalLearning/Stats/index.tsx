import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    BarChart,
    ColorPreview,
    Container,
    KeyFigureView,
    LegendItem,
    ListView,
    TextOutput,
    TimeSeriesChart,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
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
    useGoRequest,
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
const dataKeyToClassNameMap: Record<SourceType, string | undefined> = {
    dref: styles.dref,
    emergencyAppeal: styles.emergencyAppeal,
    others: styles.others,
};
const sourceClassNameSelector = (dataKey: SourceType) => dataKeyToClassNameMap[dataKey] ?? '';
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
    const { query } = props;

    const strings = useTranslation(i18n);
    const alert = useAlert();
    const [activePointKey, setActivePointKey] = useState<string>();

    const {
        response: learningStatsResponse,
        pending: learningStatsPending,
    } = useGoRequest({
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
            return [];
        }

        const dates = Object.keys(sourcesOverTimeData).map((year) => new Date(year));

        if (dates.length < 1) {
            return [];
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
        <Container pending={learningStatsPending}>
            <ListView
                layout="block"
                spacing="lg"
            >
                <ListView
                    layout="grid"
                    numPreferredGridColumns={4}
                >
                    <KeyFigureView
                        value={learningStatsResponse?.operations_included}
                        valueType="number"
                        label={strings.operationsIncluded}
                        withShadow
                    />
                    <KeyFigureView
                        value={learningStatsResponse?.sources_used}
                        valueType="number"
                        label={strings.sourcesUsed}
                        withShadow
                    />
                    <KeyFigureView
                        value={learningStatsResponse?.learning_extracts}
                        valueType="number"
                        label={strings.learningExtract}
                        withShadow
                    />
                    <KeyFigureView
                        value={learningStatsResponse?.sectors_covered}
                        valueType="number"
                        label={strings.sectorsCovered}
                        withShadow
                    />
                </ListView>
                <ListView
                    layout="grid"
                    withSidebar
                >
                    <OperationalLearningMap
                        learningByCountry={learningStatsResponse?.learning_by_country}
                    />
                    <ListView layout="block">
                        <Container
                            heading={strings.learningBySector}
                            withHeaderBorder
                            pending={learningStatsPending}
                            empty={isNotDefined(learningStatsResponse?.learning_by_sector)
                                || learningStatsResponse.learning_by_sector.length === 0}
                            withPadding
                            withShadow
                            withBackground
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
                            withHeaderBorder
                            pending={learningStatsPending}
                            empty={isNotDefined(learningStatsResponse?.learning_by_region)
                                || learningStatsResponse?.learning_by_region.length === 0}
                            withPadding
                            withShadow
                            withBackground
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
                            withHeaderBorder
                            pending={learningStatsPending}
                            empty={dateList.length === 0}
                            withPadding
                            withShadow
                            withBackground
                            footer={isDefined(activePointKey) ? (
                                <ListView
                                    withWrap
                                    spacing="sm"
                                    withSpacingOpticalCorrection
                                >
                                    <TextOutput
                                        value={activePointKey}
                                        valueType="date"
                                        format="yyyy"
                                        strongValue
                                    />
                                    <TextOutput
                                        icon={<ColorPreview value="var(--color-source-dref)" />}
                                        label={strings.sourceDREF}
                                        value={activePointData?.dref}
                                        valueType="number"
                                    />
                                    <TextOutput
                                        icon={<ColorPreview value="var(--color-source-emergency-appeal)" />}
                                        label={strings.sourceEmergencyAppeal}
                                        value={activePointData?.emergencyAppeal}
                                        valueType="number"
                                    />
                                    <TextOutput
                                        icon={<ColorPreview value="var(--color-source-emergency-appeal)" />}
                                        label={strings.sourceOthers}
                                        value={activePointData?.others}
                                        valueType="number"
                                    />
                                </ListView>
                            ) : (
                                <TextOutput
                                    label={strings.sourcesTypeLegendLabel}
                                    value={(
                                        <ListView
                                            withWrap
                                            spacing="sm"
                                            withSpacingOpticalCorrection
                                        >
                                            {sourceTypeOptions.map((source) => (
                                                <LegendItem
                                                    key={source.key}
                                                    label={source.label}
                                                    color={source.color}
                                                />
                                            ))}
                                        </ListView>
                                    )}
                                />
                            )}
                        >
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
                        </Container>
                    </ListView>
                </ListView>
            </ListView>
        </Container>
    );
}

export default Stats;
