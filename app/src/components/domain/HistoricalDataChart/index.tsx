import {
    CycloneIcon,
    DroughtIcon,
    FloodIcon,
    FoodSecurityIcon,
} from '@ifrc-go/icons';
import {
    ChartAxes,
    ChartContainer,
    Container,
    SelectInput,
    TextOutput,
    Tooltip,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    getPercentage,
    numericIdSelector,
    stringNameSelector,
    sumSafe,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isFalsyString,
    isNotDefined,
    unique,
} from '@togglecorp/fujs';

import useInputState from '#hooks/useInputState';
import useTemporalChartData from '#hooks/useTemporalChartData';
import {
    COLOR_HAZARD_CYCLONE,
    COLOR_HAZARD_DROUGHT,
    COLOR_HAZARD_FLOOD,
    COLOR_HAZARD_FOOD_INSECURITY,
    DEFAULT_Y_AXIS_WIDTH_WITH_LABEL,
} from '#utils/constants';
import type { GoApiResponse } from '#utils/restRequest';
import { useRequest } from '#utils/restRequest';

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

    const filteredEvents = historicalDataResponse?.results?.map(
        (event) => {
            if (!isValidDisaster(event.dtype)) {
                return undefined;
            }

            if (isDefined(disasterFilter) && disasterFilter !== event.dtype.id) {
                return undefined;
            }

            const numAffected = getNumAffected(event);

            if (isNotDefined(numAffected)) {
                return undefined;
            }

            return {
                ...event,
                dtype: event.dtype,
                num_affected: numAffected,
            };
        },
    ).filter(isDefined);

    const chartData = useTemporalChartData(
        filteredEvents,
        {
            keySelector: (datum) => datum.id,
            xValueSelector: (datum) => datum.disaster_start_date,
            yValueSelector: (datum) => datum.num_affected,
            yearlyChart: true,
            yAxisWidth: DEFAULT_Y_AXIS_WIDTH_WITH_LABEL,
        },
    );

    return (
        <Container
            className={styles.historicalDataChart}
            heading={strings.historicalChartHeading}
            withHeaderBorder
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
            <ChartContainer
                className={styles.chartContainer}
                chartData={chartData}
            >
                <ChartAxes
                    chartData={chartData}
                    yAxisLabel={strings.peopleExposed}
                />
                {chartData.chartPoints?.map(
                    (point) => {
                        const funded = sumSafe(
                            point.originalData.appeals.map(
                                (appeal) => appeal.amount_funded,
                            ),
                        ) ?? 0;
                        const requested = sumSafe(
                            point.originalData.appeals.map(
                                (appeal) => appeal.amount_requested,
                            ),
                        ) ?? 0;

                        const coverage = requested === 0
                            ? undefined
                            : getPercentage(funded, requested);

                        return (
                            <foreignObject
                                x={point.x}
                                y={point.y}
                                className={styles.pointContainer}
                                key={point.key}
                            >
                                <div
                                    className={styles.point}
                                    style={{
                                        backgroundColor: hazardIdToColorMap[
                                            point.originalData.dtype.id
                                        ],
                                    }}
                                >
                                    {hazardIdToIconMap[point.originalData.dtype.id]}
                                    <Tooltip
                                        title={point.originalData.dtype.name}
                                        description={(
                                            <>
                                                <TextOutput
                                                    label="Start date"
                                                    value={point.originalData.disaster_start_date}
                                                    valueType="date"
                                                    strongValue
                                                />
                                                <TextOutput
                                                    value={point.originalData.num_affected}
                                                    label={strings.peopleAffectedLabel}
                                                    valueType="number"
                                                    strongValue
                                                />
                                                <TextOutput
                                                    value={funded}
                                                    label={strings.fundedLabel}
                                                    valueType="number"
                                                    strongValue
                                                    maximumFractionDigits={0}
                                                />
                                                <TextOutput
                                                    value={coverage}
                                                    valueType="number"
                                                    suffix="%"
                                                    label={strings.fundingCoverageLabel}
                                                    strongValue
                                                />
                                            </>
                                        )}
                                    />
                                </div>
                            </foreignObject>
                        );
                    },
                )}
            </ChartContainer>
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
