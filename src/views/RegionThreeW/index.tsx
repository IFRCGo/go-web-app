import { RefObject, useMemo, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    isDefined,
    isNotDefined,
    listToGroupList,
    listToMap,
    mapToList,
} from '@togglecorp/fujs';

import { RegionOutletContext } from '#utils/outletContext';
import { useRequest } from '#utils/restRequest';
import { maxSafe, sumSafe } from '#utils/common';
import useSizeTracking from '#hooks/useSizeTracking';
import { getScaleFunction } from '#utils/chart';

import styles from './styles.module.css';

const chartMargin = {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
};

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { regionResponse } = useOutletContext<RegionOutletContext>();
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartBounds = useSizeTracking(chartContainerRef);

    const { response } = useRequest({
        skip: isNotDefined(regionResponse?.id),
        url: '/api/v2/region-project/{id}/movement-activities/',
        pathVariables: isDefined(regionResponse)
            ? { id: String(regionResponse.id) }
            : undefined,
    });

    const data = useMemo(
        () => {
            if (!response) {
                return undefined;
            }

            const activities = response.country_ns_sector_count.flatMap(
                (activity) => {
                    const {
                        reporting_national_societies,
                        id: activityId,
                        name: activityName,
                    } = activity;

                    const where = { id: activityId, name: activityName };

                    return reporting_national_societies.flatMap(
                        (ns) => {
                            const {
                                sectors,
                                id: nsId,
                                name: nsName,
                            } = ns;

                            const who = { id: nsId, name: nsName };

                            return sectors.map(
                                (sector) => {
                                    const {
                                        id: sectorId,
                                        sector: sectorName,
                                        count,
                                    } = sector;

                                    const what = { id: sectorId, name: sectorName };

                                    return {
                                        who,
                                        what,
                                        where,
                                        count,
                                    };
                                },
                            );
                        },
                    );
                },
            );

            const who = mapToList(
                listToGroupList(
                    activities,
                    (activity) => activity.who.id,
                ),
                (value) => {
                    const totalCount = sumSafe(value.map(({ count }) => count));
                    if (isNotDefined(totalCount)) {
                        return undefined;
                    }

                    const first = value[0];
                    return {
                        id: first.who.id,
                        name: first.who.name,
                        count: totalCount,
                        whoWhatWhereList: value,
                    };
                },
            ).filter(isDefined);

            const what = mapToList(
                listToGroupList(
                    activities,
                    (activity) => activity.what.id,
                ),
                (value) => {
                    const totalCount = sumSafe(value.map(({ count }) => count));
                    if (isNotDefined(totalCount)) {
                        return undefined;
                    }

                    const first = value[0];
                    return {
                        id: first.what.id,
                        name: first.what.name,
                        count: totalCount,
                        whoWhatWhereList: value,
                    };
                },
            ).filter(isDefined);

            const where = mapToList(
                listToGroupList(
                    activities,
                    (activity) => activity.where.id,
                ),
                (value) => {
                    const totalCount = sumSafe(value.map(({ count }) => count));
                    if (isNotDefined(totalCount)) {
                        return undefined;
                    }

                    const first = value[0];
                    return {
                        id: first.where.id,
                        name: first.where.name,
                        count: totalCount,
                        whoWhatWhereList: value,
                    };
                },
            ).filter(isDefined);

            return {
                activities,
                who,
                what,
                where,
            };
        },
        [response],
    );

    const chartData = useMemo(
        () => {
            if (isNotDefined(data)) {
                return undefined;
            }

            const countList = data.who.map(({ count }) => count);
            const totalCount = sumSafe(countList);
            const maxCountValue = maxSafe(countList);

            if (isNotDefined(totalCount) || isNotDefined(maxCountValue)) {
                return undefined;
            }

            const gapSize = 10;

            const whoAvailableHeight = chartBounds.height - (data.who.length + 1) * gapSize;
            const whoCountScale = getScaleFunction(
                { min: 0, max: totalCount },
                { min: 0, max: whoAvailableHeight },
                { start: chartMargin.top, end: chartMargin.bottom },
            );

            let whoYSoFar = 0;
            const whoList = data.who.map(
                (activity) => {
                    const {
                        id,
                        count,
                        name,
                        whoWhatWhereList,
                    } = activity;

                    const startY = whoYSoFar + gapSize;
                    const h = whoCountScale(count);

                    whoYSoFar = startY + h;

                    return {
                        id,
                        x: 100,
                        y: startY,
                        w: 10,
                        h,
                        name,
                        count,
                        whatList: whoWhatWhereList.filter(
                            ({ who }) => who.id === id,
                        ),
                    };
                },
            );

            const whatAvailableHeight = chartBounds.height - (data.what.length + 1) * gapSize;
            const whatCountScale = getScaleFunction(
                { min: 0, max: totalCount },
                { min: 0, max: whatAvailableHeight },
                { start: chartMargin.top, end: chartMargin.bottom },
            );
            let whatYSoFar = 0;
            const whatList = data.what.map(
                (activity) => {
                    const {
                        id,
                        count,
                        name,
                    } = activity;

                    const startY = whatYSoFar + gapSize;
                    const h = whatCountScale(count);

                    whatYSoFar = startY + h;

                    return {
                        id,
                        x: 600,
                        y: startY,
                        w: 10,
                        h,
                        name,
                        count,
                    };
                },
            );

            const whatPointMap = listToMap(
                whatList,
                ({ id }) => id,
            );

            const whatTopMap = listToMap(
                whatList,
                ({ id }) => id,
                ({ y }) => y,
            );

            function getQ(x1: number, y1: number, x2: number, y2: number) {
                const mid = chartBounds.height / 2;
                const sign = y1 > mid ? 1 : -1;

                const offset = Math.log10(Math.abs(y2 - y1));

                const cx = (x1 + x2) / 2;
                const qx = x2 > x1 ? cx / 2 : cx + cx / 2;

                const cy = (y1 + y2) / 2;
                const qy = y1 + sign * offset;

                return `Q${qx} ${qy} ${cx} ${cy} T${x2} ${y2}`;
            }

            const whoWhat = whoList.flatMap(
                (whoPoint) => {
                    let whoTop = whoPoint.y;

                    return whoPoint.whatList.map(
                        ({ what, count: whatCount }) => {
                            const whatPoint = whatPointMap[what.id];

                            const whatRatio = (whatCount ?? 0) / whatPoint.count;
                            const whoRatio = (whatCount ?? 0) / whoPoint.count;

                            const whoHeight = whoPoint.h * whoRatio;
                            const whatHeight = whatPoint.h * whatRatio;

                            const whoStartX = whoPoint.x + whoPoint.w;
                            const whatStartX = whatPoint.x;

                            const whoStartY = whoTop;
                            const whoEndY = whoStartY + whoHeight;

                            const whatStartY = whatTopMap[what.id];
                            const whatEndY = whatStartY + whatHeight;

                            whatTopMap[what.id] = whatEndY;
                            whoTop = whoEndY;

                            const pathData = `M${whoStartX} ${whoStartY} ${getQ(whoStartX, whoStartY, whatStartX, whatStartY)} L${whatStartX} ${whatEndY} ${getQ(whatStartX, whatEndY, whoStartX, whoEndY)} Z`;

                            return pathData;
                        },
                    );
                },
            );

            return {
                who: whoList,
                what: whatList,
                whoWhat,
            };
        },
        [data, chartBounds],
    );

    return (
        <div className={styles.regionThreeW}>
            <div
                className={styles.chartContainer}
                ref={chartContainerRef}
            >
                <svg className={styles.svg}>
                    {chartData?.who.map(
                        (point) => (
                            <g key={point.id}>
                                <rect
                                    className={styles.rect}
                                    x={point.x}
                                    y={point.y}
                                    width={point.w}
                                    height={point.h}
                                />
                                <text
                                    x={point.x + 20}
                                    y={point.y + point.h / 2}
                                    className={styles.text}
                                >
                                    {`${point.name} (${point.count})`}
                                </text>
                            </g>
                        ),
                    )}
                    {chartData?.what.map(
                        (point) => (
                            <g key={point.id}>
                                <rect
                                    className={styles.rect}
                                    x={point.x}
                                    y={point.y}
                                    width={point.w}
                                    height={point.h}
                                />
                                <text
                                    x={point.x + 20}
                                    y={point.y + point.h / 2}
                                    className={styles.text}
                                >
                                    {`${point.name} (${point.count})`}
                                </text>
                            </g>
                        ),
                    )}
                    {chartData?.whoWhat.map(
                        (pathData) => (
                            <path
                                key={pathData}
                                className={styles.path}
                                d={pathData}
                            />
                        ),
                    )}
                </svg>
            </div>
        </div>
    );
}

Component.displayName = 'RegionThreeW';
