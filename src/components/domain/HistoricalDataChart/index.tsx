import {
    useMemo,
    useRef,
} from 'react';
import {
    isDefined,
    isFalsyString,
    isNotDefined,
    unique,
} from '@togglecorp/fujs';
import {
    DroughtIcon,
    FloodIcon,
    FoodSecurityIcon,
    CycloneIcon,
} from '@ifrc-go/icons';

import Container from '#components/Container';
import SelectInput from '#components/SelectInput';
import DropdownMenu from '#components/DropdownMenu';
import TextOutput from '#components/TextOutput';
import ChartAxes from '#components/ChartAxes';
import useTranslation from '#hooks/useTranslation';
import useInputState from '#hooks/useInputState';
import useSizeTracking from '#hooks/useSizeTracking';
import { useRequest } from '#utils/restRequest';
import type { GoApiResponse } from '#utils/restRequest';
import { numericIdSelector, stringNameSelector } from '#utils/selectors';
import { getPrettyBreakableBounds, getScaleFunction } from '#utils/chart';
import { formatNumber, getNumberOfDaysInMonth, sumSafe } from '#utils/common';
import {
    COLOR_HAZARD_CYCLONE,
    COLOR_HAZARD_DROUGHT,
    COLOR_HAZARD_FLOOD,
    COLOR_HAZARD_FOOD_INSECURITY,
} from '#utils/constants';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GoHistoricalResponse = GoApiResponse<'/api/v2/go-historical/'>;
type EventItem = NonNullable<GoHistoricalResponse['results']>[number];
type PartialDisasterType = EventItem['dtype'];

type DisasterType = Omit<PartialDisasterType, 'name'> & {
    name: string;
}

// FIXME: how can we guarantee that these disaster type ids do not change
// TODO: Add a flag in database to mark these disaster as risk hazards
const DISASTER_FLOOD = 12;
const DISASTER_FLASH_FLOOD = 27;
const DISASTER_CYCLONE = 4;
const DISASTER_FOOD_INSECURITY = 21;
const DISASTER_DROUGHT = 20;

const validDisastersForChart: Record<number, boolean> = {
    [DISASTER_FLOOD]: true,
    [DISASTER_FLASH_FLOOD]: true,
    [DISASTER_CYCLONE]: true,
    [DISASTER_FOOD_INSECURITY]: true,
    [DISASTER_DROUGHT]: true,
};

const X_AXIS_HEIGHT = 32;
const Y_AXIS_WIDTH = 48;
const CHART_OFFSET = 15;

const chartMargin = {
    left: Y_AXIS_WIDTH + CHART_OFFSET,
    top: CHART_OFFSET,
    right: CHART_OFFSET,
    bottom: X_AXIS_HEIGHT + CHART_OFFSET,
};

function isValidDisaster(
    disaster: PartialDisasterType | null | undefined,
): disaster is DisasterType {
    if (isNotDefined(disaster)) {
        return false;
    }
    if (isFalsyString(disaster.name)) {
        return false;
    }
    return validDisastersForChart[disaster.id];
}

const hazardIdToColorMap: Record<number, string> = {
    [DISASTER_FLOOD]: COLOR_HAZARD_FLOOD,
    [DISASTER_FLASH_FLOOD]: COLOR_HAZARD_FLOOD,
    [DISASTER_CYCLONE]: COLOR_HAZARD_CYCLONE,
    [DISASTER_FOOD_INSECURITY]: COLOR_HAZARD_FOOD_INSECURITY,
    [DISASTER_DROUGHT]: COLOR_HAZARD_DROUGHT,
};

const hazardIdToIconMap: Record<number, React.ReactNode> = {
    [DISASTER_FLOOD]: <FloodIcon className={styles.hazardIcon} />,
    [DISASTER_FLASH_FLOOD]: <FloodIcon className={styles.hazardIcon} />,
    [DISASTER_CYCLONE]: <CycloneIcon className={styles.hazardIcon} />,
    [DISASTER_FOOD_INSECURITY]: <FoodSecurityIcon className={styles.hazardIcon} />,
    [DISASTER_DROUGHT]: <DroughtIcon className={styles.hazardIcon} />,
};

function getNumAffected(event: EventItem) {
    if (isDefined(event.num_affected)) {
        return event.num_affected;
    }

    return sumSafe(
        event.appeals.map(
            (appeal) => appeal.num_beneficiaries,
        ),
    ) ?? 0;
}

interface ChartPoint {
    x: number;
    y: number;
    label: string | undefined;
}

function chartPointSelector(chartPoint: ChartPoint) {
    return chartPoint;
}

function localeFormatDate(date: Date) {
    return date.toLocaleString(
        navigator.language,
        { month: 'short' },
    );
}

type RegionProps = {
    variant: 'region';
    regionId: number;
    countryId?: never;
}

type CountryProps = {
    variant: 'country';
    countryId: number;
    regionId?: never;
}

type Props = RegionProps | CountryProps;

function HistoricalDataChart(props: Props) {
    const {
        countryId,
        regionId,
        variant,
    } = props;
    const strings = useTranslation(i18n);
    const [disasterFilter, setDisasterFilter] = useInputState<number | undefined>(undefined);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartBounds = useSizeTracking(chartContainerRef);

    const { response: historicalDataResponse } = useRequest({
        skip: variant === 'country' ? isNotDefined(countryId) : isNotDefined(regionId),
        url: '/api/v2/go-historical/',
        query: variant === 'country' ? {
            countries: [countryId],
        } : { region: regionId },
    });

    const disasterOptions = unique(
        historicalDataResponse?.results?.map(
            (event) => {
                if (!isValidDisaster(event.dtype)) {
                    return undefined;
                }

                return {
                    id: event.dtype.id,
                    name: event.dtype.name,
                };
            },
        ).filter(isDefined) ?? [],
        (option) => option.id,
    );

    const filteredEvents = historicalDataResponse?.results?.filter(
        (event) => {
            if (!isValidDisaster(event.dtype)) {
                return false;
            }

            if (isDefined(disasterFilter) && disasterFilter !== event.dtype.id) {
                return false;
            }

            return true;
        },
    );

    const maxValue = useMemo(
        () => {
            if (isNotDefined(filteredEvents)) {
                return 0;
            }

            const numAffectedList = filteredEvents.map(getNumAffected);

            if (numAffectedList.length === 0) {
                return 0;
            }

            return Math.max(...numAffectedList);
        },
        [filteredEvents],
    );

    const yScale = useMemo(
        () => {
            const yBounds = getPrettyBreakableBounds(
                { min: 0, max: maxValue },
            );

            return getScaleFunction(
                yBounds,
                { min: 0, max: chartBounds.height },
                { start: chartMargin.top, end: chartMargin.bottom },
                true,
            );
        },
        [maxValue, chartBounds],
    );

    const xScale = useMemo(
        () => (
            getScaleFunction(
                { min: 0, max: 12 },
                { min: 0, max: chartBounds.width },
                { start: chartMargin.left, end: chartMargin.right },
            )
        ),
        [chartBounds],
    );

    const chartData = useMemo(
        () => {
            if (!filteredEvents) {
                return undefined;
            }

            return filteredEvents.map(
                (event) => {
                    const disasterDate = new Date(event.disaster_start_date);
                    const date = disasterDate.getDate();
                    const month = disasterDate.getMonth();

                    const totalDays = getNumberOfDaysInMonth(
                        disasterDate.getFullYear(),
                        month,
                    );

                    const monthValue = month + date / totalDays;
                    const numAffected = getNumAffected(event);

                    return {
                        key: event.id,
                        x: xScale(monthValue),
                        y: yScale(numAffected),
                        numAffected,
                        disasterDate,
                        disasterType: event.dtype.id,
                        event,
                    };
                },
            );
        },
        [filteredEvents, xScale, yScale],
    );

    const yAxisPoints = useMemo(
        () => {
            if (isNotDefined(maxValue) || maxValue === 0) {
                return [];
            }

            const numYAxisPoints = 6;
            const diff = maxValue / (numYAxisPoints - 1);

            return Array.from(Array(numYAxisPoints).keys()).map(
                (key) => {
                    const value = diff * key;
                    return {
                        x: Y_AXIS_WIDTH,
                        y: yScale(value),
                        label: formatNumber(
                            value,
                            { compact: true, maximumFractionDigits: 0 },
                        ),
                    };
                },
            );
        },
        [maxValue, yScale],
    );

    const xAxisPoints = useMemo(
        () => {
            const currentYear = new Date().getFullYear();
            return Array.from(Array(12).keys()).map(
                (key) => {
                    const date = new Date(currentYear, key, 1);

                    return {
                        x: xScale(key),
                        y: chartBounds.height - X_AXIS_HEIGHT + CHART_OFFSET,
                        label: localeFormatDate(date),
                    };
                },
            );
        },
        [xScale, chartBounds],
    );

    return (
        <Container
            className={styles.historicalDataChart}
            heading={strings.historicalChartHeading}
            withHeaderBorder
            filtersContainerClassName={styles.filters}
            filters={(
                <SelectInput
                    name={undefined}
                    placeholder={strings.hazardFilterPlaceholder}
                    value={disasterFilter}
                    onChange={setDisasterFilter}
                    options={disasterOptions}
                    keySelector={numericIdSelector}
                    labelSelector={stringNameSelector}
                />
            )}
        >
            <div
                ref={chartContainerRef}
                className={styles.chartContainer}
            >
                <svg className={styles.svg}>
                    <text
                        className={styles.yAxisLabel}
                        textAnchor="middle"
                        transform={`translate(${(chartMargin.left - CHART_OFFSET) / 2},
                            ${(chartBounds.height - chartMargin.bottom - chartMargin.top) / 2})
                            rotate(-90)`}
                    >
                        {strings.peopleExposed}
                    </text>
                    <ChartAxes
                        xAxisPoints={xAxisPoints}
                        yAxisPoints={yAxisPoints}
                        chartOffset={CHART_OFFSET}
                        chartBounds={chartBounds}
                        chartMargin={chartMargin}
                        xAxisTickSelector={chartPointSelector}
                        yAxisTickSelector={chartPointSelector}
                    />
                </svg>
                {chartData?.map(
                    (point) => {
                        const funded = sumSafe(
                            point.event.appeals.map(
                                (appeal) => appeal.amount_funded,
                            ),
                        ) ?? 0;
                        const requested = sumSafe(
                            point.event.appeals.map(
                                (appeal) => appeal.amount_requested,
                            ),
                        ) ?? 0;

                        const coverage = requested === 0
                            ? undefined
                            : 100 * (funded / requested);

                        return (
                            <div
                                key={point.key}
                                className={styles.point}
                                style={{
                                    left: `${point.x}px`,
                                    top: `${point.y}px`,
                                    backgroundColor: hazardIdToColorMap[point.disasterType],
                                }}
                            >
                                <DropdownMenu
                                    label={hazardIdToIconMap[point.disasterType]}
                                    variant="tertiary"
                                    withoutDropdownIcon
                                    popupClassName={styles.popUp}
                                >
                                    <Container
                                        heading={point.event.dtype.name}
                                        headerDescription={(
                                            <TextOutput
                                                value={point.event.disaster_start_date}
                                                valueType="date"
                                                format="MMM yyyy"
                                            />
                                        )}
                                        withHeaderBorder
                                        withInternalPadding
                                    >
                                        <TextOutput
                                            value={point.numAffected}
                                            description={strings.peopleAffectedLabel}
                                            valueType="number"
                                        />
                                        <TextOutput
                                            value={funded}
                                            description={strings.fundedLabel}
                                            valueType="number"
                                        />
                                        <TextOutput
                                            value={coverage}
                                            valueType="number"
                                            suffix="%"
                                            description={strings.fundingCoverageLabel}
                                        />
                                    </Container>
                                </DropdownMenu>
                            </div>
                        );
                    },
                )}
            </div>
            <div className={styles.legend}>
                {disasterOptions.map(
                    (disaster) => (
                        <div
                            key={disaster.id}
                            className={styles.legendItem}
                        >
                            <div
                                className={styles.icon}
                                style={{
                                    backgroundColor: hazardIdToColorMap[disaster.id],
                                }}
                            >
                                {hazardIdToIconMap[disaster.id]}
                            </div>
                            <div className={styles.label}>
                                {disaster.name}
                            </div>
                        </div>
                    ),
                )}
            </div>
        </Container>
    );
}

export default HistoricalDataChart;
