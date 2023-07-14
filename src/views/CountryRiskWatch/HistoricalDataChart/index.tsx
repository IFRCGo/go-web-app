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
    StormIcon,
} from '@ifrc-go/icons';

import { useRequest } from '#utils/restRequest';
import type { paths } from '#generated/types';
import Container from '#components/Container';
import SelectInput from '#components/SelectInput';
import DropdownMenu from '#components/DropdownMenu';
import TextOutput from '#components/TextOutput';
import useTranslation from '#hooks/useTranslation';
import useInputState from '#hooks/useInputState';
import useSizeTracking from '#hooks/useSizeTracking';
import { numericKeySelector, stringLabelSelector } from '#utils/selectors';
import { getPrettyBreakableBounds, getScaleFunction } from '#utils/chart';
import { sumSafe } from '#utils/common';
import {
    COLOR_HAZARD_CYCLONE,
    COLOR_HAZARD_DROUGHT,
    COLOR_HAZARD_FLOOD,
    COLOR_HAZARD_FOOD_INSECURITY,
} from '#utils/constants';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetGoHistorical = paths['/api/v2/go-historical/']['get'];
type GoHistoricalQuery = GetGoHistorical['parameters']['query'];
type GoHistoricalResponse = GetGoHistorical['responses']['200']['content']['application/json'];
type EventItem = NonNullable<GoHistoricalResponse['results']>[number];
type PartialDisasterType = EventItem['dtype'];
type DisasterType = Omit<PartialDisasterType, 'name'> & {
    name: string;
}

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

    if (!validDisastersForChart[disaster.id]) {
        return false;
    }

    return true;
}

const hazardTypeToColorMap: Record<number, string> = {
    [DISASTER_FLOOD]: COLOR_HAZARD_FLOOD,
    [DISASTER_FLASH_FLOOD]: COLOR_HAZARD_FLOOD,
    [DISASTER_CYCLONE]: COLOR_HAZARD_CYCLONE,
    [DISASTER_FOOD_INSECURITY]: COLOR_HAZARD_FOOD_INSECURITY,
    [DISASTER_DROUGHT]: COLOR_HAZARD_DROUGHT,
};

const hazardTypeToIconMap: Record<number, React.ReactNode> = {
    [DISASTER_FLOOD]: <FloodIcon className={styles.hazardIcon} />,
    [DISASTER_FLASH_FLOOD]: <FloodIcon className={styles.hazardIcon} />,
    [DISASTER_CYCLONE]: <StormIcon className={styles.hazardIcon} />,
    [DISASTER_FOOD_INSECURITY]: <FoodSecurityIcon className={styles.hazardIcon} />,
    [DISASTER_DROUGHT]: <DroughtIcon className={styles.hazardIcon} />,
};

interface Props {
    countryId: number;
}

function HistoricalDataChart(props: Props) {
    const { countryId } = props;
    const [disasterFilter, setDisasterFilter] = useInputState<number | undefined>(undefined);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartBounds = useSizeTracking(chartContainerRef);
    const strings = useTranslation(i18n);

    const query = useMemo<GoHistoricalQuery>(
        () => ({ countries: [countryId] }),
        [countryId],
    );
    const { response: historicalDataResponse } = useRequest<GoHistoricalResponse>({
        skip: isNotDefined(countryId),
        url: 'api/v2/go-historical/',
        query,
    });

    const disasterOptions = unique(
        historicalDataResponse?.results?.map(
            (event) => {
                if (!isValidDisaster(event.dtype)) {
                    return undefined;
                }

                return {
                    key: event.dtype.id,
                    label: event.dtype.name,
                };
            },
        ).filter(isDefined) ?? [],
        (option) => option.key,
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

    const chartData = useMemo(
        () => {
            if (!filteredEvents) {
                return undefined;
            }

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

            const numAffectedList = filteredEvents.map(getNumAffected);
            const maxValue = Math.max(...numAffectedList);

            const xScale = getScaleFunction(
                { min: 0, max: 11 },
                { min: 0, max: chartBounds.width },
                { start: 20, end: 20 },
            );

            const yBounds = getPrettyBreakableBounds(
                { min: 0, max: maxValue },
            );

            const yScale = getScaleFunction(
                { min: 0, max: maxValue },
                { min: 0, max: chartBounds.height },
                { start: 20, end: 20 },
                true,
            );

            return filteredEvents.map(
                (event) => {
                    const disasterDate = new Date(event.disaster_start_date);
                    const numAffected = getNumAffected(event);

                    return {
                        key: event.id,
                        x: xScale(disasterDate.getMonth()),
                        y: yScale(numAffected),
                        numAffected,
                        disasterDate,
                        disasterType: event.dtype.id,
                        event,
                    };
                },
            );
        },
        [chartBounds, filteredEvents],
    );

    return (
        <Container
            className={styles.historicalDataChart}
            heading={strings.historicalChartHeading}
            withHeaderBorder
            headingContainerClassName={styles.header}
            actions={(
                <SelectInput
                    name={undefined}
                    placeholder={strings.hazardFilterPlaceholder}
                    value={disasterFilter}
                    onChange={setDisasterFilter}
                    options={disasterOptions}
                    keySelector={numericKeySelector}
                    labelSelector={stringLabelSelector}
                />
            )}
        >
            <div
                ref={chartContainerRef}
                className={styles.chartContainer}
            >
                {chartData?.map(
                    (point) => {
                        const funded = sumSafe(
                            point.event.appeals.map(
                                (appeal) => Number(appeal.amount_funded),
                            ),
                        ) ?? 0;
                        const requested = sumSafe(
                            point.event.appeals.map(
                                (appeal) => Number(appeal.amount_requested),
                            ),
                        ) ?? 0;

                        const coverage = requested === 0 ? undefined : 100 * (funded / requested);

                        return (
                            <div
                                key={point.key}
                                className={styles.point}
                                style={{
                                    left: `${point.x}px`,
                                    top: `${point.y}px`,
                                    backgroundColor: hazardTypeToColorMap[point.disasterType],
                                }}
                            >
                                <DropdownMenu
                                    label={hazardTypeToIconMap[point.disasterType]}
                                    variant="tertiary"
                                    hideDropdownIcon
                                >
                                    <Container
                                        className={styles.pointDetails}
                                        heading={point.event.dtype.name}
                                        withHeaderBorder
                                        headerDescription={(
                                            <TextOutput
                                                value={point.event.disaster_start_date}
                                                valueType="date"
                                                format="MMM yyyy"
                                            />
                                        )}
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
                                            description={strings.fundingCoverageLabel}
                                        />
                                    </Container>
                                </DropdownMenu>
                            </div>
                        );
                    },
                )}
            </div>
        </Container>
    );
}

export default HistoricalDataChart;
