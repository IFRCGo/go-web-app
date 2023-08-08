import { useMemo, useState } from 'react';
import type { FillLayer, LngLatBoundsLike } from 'mapbox-gl';
import { useOutletContext, useParams } from 'react-router-dom';
import getBbox from '@turf/bbox';
import {
    compareNumber,
    isDefined,
    isFalsyString,
    isNotDefined,
    listToGroupList,
    listToMap,
    mapToList,
    unique,
} from '@togglecorp/fujs';
import Map, {
    MapSource,
    MapLayer,
    MapBounds,
} from '@togglecorp/re-map';
import {
    defaultMapStyle,
    defaultMapOptions,
    adminLabelLayerOptions,
} from '#utils/map';

import MapContainerWithDisclaimer from '#components/MapContainerWithDisclaimer';
import Container from '#components/Container';
import {
    getDataWithTruthyHazardType,
    getFiRiskDataItem,
    // getWfRiskDataItem,
    hasSomeDefinedValue,
    defaultApplicableHazards,
    getValueForSelectedMonths,
    hazardTypeToColorMap,
    getWfRiskDataItem,
    riskScoreToCategory,
} from '#utils/risk';
import type {
    HazardType,
    RiskDataItem,
    RiskMetric,
    RiskMetricOption,
} from '#utils/risk';
import { useRiskRequest } from '#utils/restRequest';
import { formatNumber, maxSafe, sumSafe } from '#utils/common';
import {
    COLOR_LIGHT_BLUE,
    COLOR_LIGHT_GREY,
    COLOR_PRIMARY_RED,
} from '#utils/constants';
import { type RegionOutletContext } from '#utils/outletContext';

import Filters from './Filters';
import type { FilterValue } from './Filters';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { regionResponse } = useOutletContext<RegionOutletContext>();
    const bbox = useMemo<LngLatBoundsLike | undefined>(
        () => (regionResponse ? getBbox(regionResponse.bbox) : undefined),
        [regionResponse],
    );

    const { regionId } = useParams<{ regionId: string }>();
    const [filters, setFilters] = useState<FilterValue>({
        months: [],
        countries: [],
        riskMetric: 'exposure',
        hazardTypes: [],
        normalizeByPopulation: false,
        includeCopingCapacity: false,
    });

    const { response: seasonalResponse } = useRiskRequest({
        skip: isNotDefined(regionId),
        apiType: 'risk',
        url: '/api/v1/seasonal/',
        query: { region: regionId },
    });

    const { response: riskScoreResponse } = useRiskRequest({
        skip: isNotDefined(regionId),
        apiType: 'risk',
        url: '/api/v1/risk-score/',
        query: {
            region: isDefined(regionId) ? Number(regionId) : undefined,
            limit: 500,
        },
    });

    // NOTE: We get single element as array in response
    const seasonalRiskData = seasonalResponse?.[0];

    const mappings = useMemo(
        () => {
            if (!riskScoreResponse || !riskScoreResponse.results) {
                return undefined;
            }

            const lcc = listToMap(
                riskScoreResponse.results.map(
                    (item) => {
                        if (!item.country_details
                            || isFalsyString(item.country_details.iso3)
                            || isNotDefined(item.lcc)
                        ) {
                            return undefined;
                        }

                        return {
                            ...item,
                            lcc: item.lcc,
                            country_details: {
                                ...item.country_details,
                                iso3: item.country_details.iso3,
                            },
                        };
                    },
                ).filter(isDefined),
                (item) => item.country_details.iso3 ?? '',
                (item) => item.lcc,
            );

            const population = listToMap(
                riskScoreResponse.results,
                (item) => item.country_details.iso3 ?? '',
                (item) => (item.population_in_thousands ?? 0) * 1000,
            );

            return {
                lcc,
                population,
            };
        },
        [riskScoreResponse],
    );

    const riskMetricOptions: RiskMetricOption[] = useMemo(
        () => ([
            {
                key: 'exposure',
                // FIXME: use translation
                label: 'Exposure',
                applicableHazards: {
                    ...defaultApplicableHazards,
                    TC: true,
                    FL: true,
                    FI: true,
                },
            },
            {
                key: 'displacement',
                // FIXME: use translation
                label: 'Displacement',
                applicableHazards: {
                    ...defaultApplicableHazards,
                    TC: true,
                    FL: true,
                    SS: true,
                },
            },
            {
                key: 'riskScore',
                // FIXME: use translation
                label: 'Risk Score',
                applicableHazards: {
                    ...defaultApplicableHazards,
                    DR: true,
                    TC: true,
                    FL: true,
                    WF: true,
                },
            },
        ]),
        [],
    );

    const selectedRiskMetricDetail = useMemo(
        () => riskMetricOptions.find(
            (option) => option.key === filters.riskMetric,
        ) ?? riskMetricOptions[0],
        [filters.riskMetric, riskMetricOptions],
    );

    const data = useMemo(
        () => {
            if (!seasonalRiskData) {
                return undefined;
            }

            const {
                idmc,
                ipc_displacement_data,
                raster_displacement_data,
                gwis,
            } = seasonalRiskData;

            const displacement = idmc?.map(
                (dataItem) => {
                    if (!hasSomeDefinedValue(dataItem)) {
                        return undefined;
                    }

                    return getDataWithTruthyHazardType(dataItem);
                },
            ).filter(isDefined) ?? [];

            const groupedIpc = Object.values(
                listToGroupList(
                    ipc_displacement_data ?? [],
                    (ipcDataItem) => ipcDataItem.country,
                ),
            );

            const exposure = [
                ...raster_displacement_data?.map(
                    (dataItem) => {
                        if (!hasSomeDefinedValue(dataItem)) {
                            return undefined;
                        }

                        return getDataWithTruthyHazardType(dataItem);
                    },
                ) ?? [],
                ...groupedIpc.map(getFiRiskDataItem),
            ].filter(isDefined);

            const groupedGwis = Object.values(
                listToGroupList(
                    gwis ?? [],
                    (gwisDataItem) => gwisDataItem.country,
                ),
            );

            const riskScore = unique(
                [
                    ...riskScoreResponse?.results?.map(
                        (dataItem) => {
                            if (!hasSomeDefinedValue(dataItem)) {
                                return undefined;
                            }

                            return getDataWithTruthyHazardType(dataItem);
                        },
                    ) ?? [],
                    ...groupedGwis.map(getWfRiskDataItem),
                ].filter(isDefined),
                (item) => `${item.country_details.iso3}-${item.hazard_type}`,
            );

            return {
                displacement,
                exposure,
                riskScore,
            };
        },
        [seasonalRiskData, riskScoreResponse],
    );

    const hazardTypeList = useMemo(
        () => {
            if (!data) {
                return [];
            }

            const availableHazards: Record<RiskMetric, Record<HazardType, boolean>> = {
                exposure: listToMap(
                    data.exposure,
                    (item) => item.hazard_type,
                    () => true,
                ),
                displacement: listToMap(
                    data.displacement,
                    (item) => item.hazard_type,
                    () => true,
                ),
                riskScore: listToMap(
                    data.riskScore,
                    (item) => item.hazard_type,
                    () => true,
                ),
            };

            return unique(
                [
                    ...data.displacement,
                    ...data.exposure,
                    ...data.riskScore,
                ].map(getDataWithTruthyHazardType).filter(isDefined),
                (item) => item.hazard_type,
            ).map((combinedData) => ({
                hazard_type: combinedData.hazard_type,
                hazard_type_display: combinedData.hazard_type_display,
            })).filter(
                ({ hazard_type: hazard }) => (
                    selectedRiskMetricDetail?.applicableHazards[hazard]
                        && !availableHazards[selectedRiskMetricDetail.key][hazard]
                ),
            );
        },
        [data, selectedRiskMetricDetail],
    );

    const filteredData = useMemo(
        () => {
            const selectedHazards = listToMap(
                filters.hazardTypes,
                (hazardType) => hazardType,
                () => true,
            );

            const selectedCountries = listToMap(
                filters.countries,
                (iso3) => iso3.toLowerCase(),
                () => true,
            );

            const selectedMonths = listToMap(
                filters.months,
                (monthKey) => monthKey,
                () => true,
            );

            type RiskDataItemWithHazard = RiskDataItem & {
                hazard_type: HazardType;
                hazard_type_display: string;
                country_details: {
                    id: number;
                    name?: string | null;
                    iso3?: string | null;
                }
            }

            function groupByCountry(riskDataList: RiskDataItemWithHazard[] | undefined) {
                return listToGroupList(
                    riskDataList?.map(
                        (item) => {
                            const { country_details } = item;
                            if (!selectedHazards[item.hazard_type]
                                || !country_details
                                || isFalsyString(country_details.iso3)
                                || !selectedCountries[country_details.iso3]
                                || isFalsyString(country_details.name)
                            ) {
                                return undefined;
                            }

                            return {
                                ...item,
                                country_details: {
                                    id: country_details.id,
                                    iso3: country_details.iso3,
                                    name: country_details.name,
                                },
                            };
                        },
                    ).filter(isDefined) ?? [],
                    (item) => item.country_details.iso3 ?? '',
                );
            }

            function transformRiskData(
                riskDataList: RiskDataItemWithHazard[] | undefined,
                mode: 'sum' | 'max' = 'sum',
            ) {
                const transformedList = mapToList(
                    groupByCountry(riskDataList),
                    (itemList, key) => {
                        const firstItem = itemList[0];
                        const valueListByHazard = itemList.map(
                            (item) => {
                                const value = getValueForSelectedMonths(
                                    selectedMonths,
                                    item,
                                    mode,
                                );

                                if (isNotDefined(value)) {
                                    return undefined;
                                }

                                const newValue = filters.riskMetric === 'riskScore'
                                    ? riskScoreToCategory(
                                        item.hazard_type === 'WF' ? value : (value / 10),
                                        item.hazard_type,
                                    ) : value;

                                if (isNotDefined(newValue)) {
                                    return undefined;
                                }

                                return {
                                    value: newValue,
                                    hazard_type: item.hazard_type,
                                    hazard_type_display: item.hazard_type_display,
                                };
                            },
                        ).filter(isDefined).sort(
                            (a, b) => compareNumber(a.value, b.value, -1),
                        );

                        const maxValue = maxSafe(valueListByHazard.map(({ value }) => value));
                        const sum = sumSafe(valueListByHazard.map(({ value }) => value));

                        if (isNotDefined(maxValue) || maxValue === 0
                            || isNotDefined(sum) || sum === 0
                        ) {
                            return undefined;
                        }

                        const totalValue = sum;
                        const normalizedValueListByHazard = valueListByHazard.map(
                            (item) => ({
                                ...item,
                                normalizedValue: item.value / totalValue,
                            }),
                        );

                        return {
                            iso3: key,
                            valueListByHazard: normalizedValueListByHazard,
                            totalValue,
                            maxValue,
                            country_details: firstItem.country_details,
                        };
                    },
                ).filter(isDefined);

                const maxValue = maxSafe(transformedList.map((item) => item.totalValue));
                if (isNotDefined(maxValue) || maxValue === 0) {
                    return undefined;
                }

                return transformedList.map(
                    (item) => ({
                        ...item,
                        normalizedValue: item.totalValue / maxValue,
                        maxValue,
                    }),
                ).sort((a, b) => compareNumber(a.totalValue, b.totalValue, -1));
            }

            if (filters.riskMetric === 'displacement') {
                return transformRiskData(
                    data?.displacement,
                );
            }

            if (filters.riskMetric === 'exposure') {
                return transformRiskData(
                    data?.exposure,
                );
            }

            if (filters.riskMetric === 'riskScore') {
                const transformedData = transformRiskData(
                    data?.riskScore,
                    'max',
                );

                const maxPopulation = maxSafe(
                    filters.countries.map(
                        (iso3) => mappings?.population[iso3.toLowerCase()],
                    ).filter(isDefined),
                );

                const maxLackOfCopingCapacity = maxSafe(
                    filters.countries.map(
                        (iso3) => mappings?.lcc[iso3.toLowerCase()],
                    ).filter(isDefined),
                );

                return transformedData?.map(
                    (item) => {
                        let newNormalizedValue = item.normalizedValue;
                        let newTotalValue = item.totalValue;

                        if (filters.normalizeByPopulation
                            && isDefined(maxPopulation)
                            && maxPopulation > 0
                        ) {
                            const population = mappings?.population[item.iso3] ?? 0;
                            newNormalizedValue *= (population / maxPopulation);
                            newTotalValue *= (population / maxPopulation);
                        }

                        if (filters.includeCopingCapacity
                            && isDefined(maxLackOfCopingCapacity)
                            && maxLackOfCopingCapacity > 0
                        ) {
                            const lcc = mappings?.lcc[item.iso3] ?? 0;
                            newNormalizedValue *= (lcc / maxLackOfCopingCapacity);
                            newTotalValue *= (lcc / maxLackOfCopingCapacity);
                        }

                        return {
                            ...item,
                            totalValue: newTotalValue,
                            normalizedValue: newNormalizedValue,
                        };
                    },
                ).sort((a, b) => compareNumber(a.totalValue, b.totalValue, -1));
            }

            return undefined;
        },
        [data, filters, mappings],
    );

    // NOTE: we cannot use mapstate since the tile id don't match that of country
    // and we cannout use promote id for the
    const layerOptions = useMemo<Omit<FillLayer, 'id'>>(
        () => {
            if (!filteredData || filteredData.length === 0) {
                return {
                    type: 'fill',
                    paint: {
                        'fill-color': COLOR_LIGHT_GREY,
                    },
                };
            }

            return {
                type: 'fill',
                paint: {
                    'fill-color': [
                        'match',
                        ['get', 'iso3'],
                        ...filteredData.flatMap(
                            (item) => [
                                item.country_details.iso3.toUpperCase(),
                                [
                                    'interpolate',
                                    ['exponential', 1],
                                    ['number', item.normalizedValue],
                                    0,
                                    COLOR_LIGHT_BLUE,
                                    1,
                                    COLOR_PRIMARY_RED,
                                ],
                            ],
                        ),
                        COLOR_LIGHT_GREY,
                    ],
                },
            };
        },
        [filteredData],
    );

    return (
        <Container
            className={styles.regionSeasonalRiskWatch}
            heading="Risk Map"
            filters={(
                <Filters
                    regionId={Number(regionId)}
                    value={filters}
                    onChange={setFilters}
                    hazardTypeOptions={hazardTypeList}
                    riskMetricOptions={riskMetricOptions}
                />
            )}
            childrenContainerClassName={styles.content}
        >
            <Map
                mapStyle={defaultMapStyle}
                mapOptions={defaultMapOptions}
                navControlShown
                navControlPosition="top-right"
            >
                <MapContainerWithDisclaimer
                    className={styles.mapContainer}
                />
                <MapSource
                    sourceKey="composite"
                    managed={false}
                >
                    <MapLayer
                        layerKey="admin-0"
                        hoverable
                        layerOptions={layerOptions}
                        // onClick={handleCountryClick}
                    />
                    <MapLayer
                        layerKey="admin-0-label"
                        layerOptions={adminLabelLayerOptions}
                    />
                    <MapLayer
                        layerKey="admin-0-label-priority"
                        layerOptions={adminLabelLayerOptions}
                    />
                </MapSource>
                <MapBounds
                    bounds={bbox}
                />
            </Map>
            <div className={styles.countryList}>
                {filteredData?.map(
                    (dataItem) => (
                        <div
                            key={dataItem.iso3}
                            className={styles.country}
                        >
                            <div className={styles.name}>
                                {dataItem.country_details.name}
                            </div>
                            <div className={styles.track}>
                                {dataItem.valueListByHazard.map(
                                    ({
                                        normalizedValue,
                                        value,
                                        hazard_type,
                                        hazard_type_display,
                                    }) => (
                                        <div
                                            className={styles.bar}
                                            title={`${hazard_type_display}: ${formatNumber(value)}`}
                                            key={hazard_type}
                                            style={{
                                                width: `${100 * normalizedValue * dataItem.normalizedValue}%`,
                                                backgroundColor: hazardTypeToColorMap[hazard_type],
                                            }}
                                        />
                                    ),
                                )}
                            </div>
                        </div>
                    ),
                )}
            </div>
        </Container>
    );
}

Component.displayName = 'RegionSeasonalRiskWatch';
