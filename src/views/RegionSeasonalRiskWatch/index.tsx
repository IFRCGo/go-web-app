import { useEffect, useMemo } from 'react';
import type { FillLayer, LngLatBoundsLike } from 'mapbox-gl';
import { useOutletContext, useParams } from 'react-router-dom';
import getBbox from '@turf/bbox';
import {
    compareNumber,
    isDefined,
    isFalsyString,
    isNotDefined,
    isTruthyString,
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
import BlockLoading from '#components/BlockLoading';
import useInputState from '#hooks/useInputState';
import useCountry from '#hooks/useCountry';
import {
    getDataWithTruthyHazardType,
    getFiRiskDataItem,
    hasSomeDefinedValue,
    getValueForSelectedMonths,
    hazardTypeToColorMap,
    getWfRiskDataItem,
    riskScoreToCategory,
    applicableHazardsByRiskMetric,
    type HazardType,
    type HazardTypeOption,
    type RiskDataItem,
    type RiskMetricOption,
} from '#utils/risk';
import { useRiskRequest } from '#utils/restRequest';
import { formatNumber, maxSafe, sumSafe } from '#utils/common';
import {
    COLOR_LIGHT_BLUE,
    COLOR_LIGHT_GREY,
    COLOR_PRIMARY_RED,
    CATEGORY_RISK_HIGH,
    CATEGORY_RISK_LOW,
    CATEGORY_RISK_MEDIUM,
    CATEGORY_RISK_VERY_HIGH,
    CATEGORY_RISK_VERY_LOW,
} from '#utils/constants';
import { type RegionOutletContext } from '#utils/outletContext';

import Filters from './Filters';
import type { FilterValue } from './Filters';
import styles from './styles.module.css';

const defaultFilterValue: FilterValue = {
    months: [],
    countries: [],
    riskMetric: 'exposure',
    hazardTypes: [],
    normalizeByPopulation: false,
    includeCopingCapacity: false,
};

// TODO:
// - Find better risk category for exposure and displacement
// - Show map using absolute risk categories (Currently it's being normalized)

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { regionId } = useParams<{ regionId: string }>();
    const { regionResponse } = useOutletContext<RegionOutletContext>();
    const bbox = useMemo<LngLatBoundsLike | undefined>(
        () => (regionResponse ? getBbox(regionResponse.bbox) : undefined),
        [regionResponse],
    );

    const [hazardTypeOptions, setHazardTypeOptions] = useInputState<HazardTypeOption[]>([]);
    const {
        response: seasonalResponse,
        pending: seasonalResponsePending,
    } = useRiskRequest({
        skip: isNotDefined(regionId),
        apiType: 'risk',
        url: '/api/v1/seasonal/',
        query: {
            region: isDefined(regionId) ? Number(regionId) : undefined,
        },
    });

    const countryList = useCountry({
        region: isTruthyString(regionId) ? Number(regionId) : undefined,
    });

    const {
        response: riskScoreResponse,
        pending: riskScoreResponsePending,
    } = useRiskRequest({
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
    const dataPending = riskScoreResponsePending || seasonalResponsePending;

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

    const riskMetricOptions: RiskMetricOption[] = useMemo(
        () => ([
            {
                key: 'exposure',
                // FIXME: use translation
                label: 'People Exposed',
                applicableHazards: applicableHazardsByRiskMetric.exposure,
            },
            {
                key: 'displacement',
                // FIXME: use translation
                label: 'People at Risk of Displacement',
                applicableHazards: applicableHazardsByRiskMetric.displacement,
            },
            {
                key: 'riskScore',
                // FIXME: use translation
                label: 'Risk Score',
                applicableHazards: applicableHazardsByRiskMetric.riskScore,
            },
        ]),
        [],
    );

    const availableHazards: { [key in HazardType]?: string } | undefined = useMemo(
        () => {
            if (!data) {
                return undefined;
            }

            return {
                ...listToMap(
                    data.exposure,
                    (item) => item.hazard_type,
                    (item) => item.hazard_type_display,
                ),
                ...listToMap(
                    data.displacement,
                    (item) => item.hazard_type,
                    (item) => item.hazard_type_display,
                ),
                ...listToMap(
                    data.riskScore,
                    (item) => item.hazard_type,
                    (item) => item.hazard_type_display,
                ),
            };
        },
        [data],
    );

    const [filters, setFilters] = useInputState<FilterValue>(
        defaultFilterValue,
        (newValue, oldValue) => {
            // We only apply side effect when risk metric is changed
            if (newValue.riskMetric === oldValue.riskMetric || !availableHazards) {
                return newValue;
            }

            const selectedRiskMetricDetail = riskMetricOptions.find(
                (option) => option.key === newValue.riskMetric,
            );

            if (!selectedRiskMetricDetail) {
                return newValue;
            }

            const newHazardTypeOptions = selectedRiskMetricDetail.applicableHazards.map(
                (hazardType) => {
                    const hazard_type_display = availableHazards[hazardType];
                    if (isFalsyString(hazard_type_display)) {
                        return undefined;
                    }

                    return {
                        hazard_type: hazardType,
                        hazard_type_display,
                    };
                },
            ).filter(isDefined);

            setHazardTypeOptions(newHazardTypeOptions);

            return {
                ...newValue,
                hazardTypes: newHazardTypeOptions.map(({ hazard_type }) => hazard_type),
            };
        },
    );

    // NOTE: setting default values
    useEffect(
        () => {
            if (!availableHazards || !countryList) {
                return;
            }

            const riskMetric = riskMetricOptions.find(
                (option) => option.key === 'exposure',
            );

            if (!riskMetric) {
                return;
            }

            const newHazardTypeOptions = riskMetric.applicableHazards.map(
                (hazardType) => {
                    const hazard_type_display = availableHazards[hazardType];
                    if (isFalsyString(hazard_type_display)) {
                        return undefined;
                    }

                    return {
                        hazard_type: hazardType,
                        hazard_type_display,
                    };
                },
            ).filter(isDefined);

            setHazardTypeOptions(newHazardTypeOptions);

            setFilters({
                countries: countryList.map((country) => country.iso3),
                riskMetric: riskMetric.key,
                hazardTypes: riskMetric.applicableHazards.filter(
                    (hazardType) => !!availableHazards[hazardType],
                ),
                months: [new Date().getMonth()],
                normalizeByPopulation: false,
                includeCopingCapacity: false,
            });
        },
        [countryList, riskMetricOptions, availableHazards, setFilters, setHazardTypeOptions],
    );

    const mappings = useMemo(
        () => {
            if (!riskScoreResponse || !riskScoreResponse.results) {
                return undefined;
            }

            const riskScoreList = riskScoreResponse.results.map(
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
            ).filter(isDefined);

            const lcc = listToMap(
                riskScoreList,
                (item) => item.country_details.iso3,
                (item) => item.lcc,
            );

            const population = listToMap(
                riskScoreResponse.results.map(
                    (item) => {
                        // FIXME: reuse validation for country
                        if (!item.country_details
                            || isFalsyString(item.country_details.iso3)
                        ) {
                            return undefined;
                        }

                        return {
                            ...item,
                            country_details: {
                                ...item.country_details,
                                iso3: item.country_details.iso3,
                            },
                        };
                    },
                ).filter(isDefined),
                (item) => item.country_details.iso3,
                (item) => (item.population_in_thousands ?? 0) * 1000,
            );

            return {
                lcc,
                population,
            };
        },
        [riskScoreResponse],
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
                    (item) => item.country_details.iso3,
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

                        if (
                            isNotDefined(maxValue)
                            || maxValue === 0
                            || isNotDefined(sum)
                            || sum === 0
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

    // NOTE: we need to generate the layerOptions because we cannot use MapState
    // The id in the vector tile does not match the id in GO
    // We also cannot use promoteId as it is a non-managed mapbox source
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

    // FIXME: use translation
    const riskCategoryToLabelMap: Record<number, string> = useMemo(
        () => ({
            [CATEGORY_RISK_VERY_LOW]: 'Very Low',
            [CATEGORY_RISK_LOW]: 'Low',
            [CATEGORY_RISK_MEDIUM]: 'Medium',
            [CATEGORY_RISK_HIGH]: 'High',
            [CATEGORY_RISK_VERY_HIGH]: 'Very High',
        }),
        [],
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
                    hazardTypeOptions={hazardTypeOptions}
                    riskMetricOptions={riskMetricOptions}
                />
            )}
            childrenContainerClassName={styles.content}
            withHeaderBorder
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
                    // FIXME: use defined constants
                    duration={1000}
                    bounds={bbox}
                    padding={50}
                />
            </Map>
            <Container
                className={styles.countryList}
                childrenContainerClassName={styles.content}
                withInternalPadding
                // FIXME use translation
                heading="Countries"
                headingLevel={5}
                spacing="cozy"
                withHeaderBorder
            >
                {dataPending && <BlockLoading />}
                {!dataPending && filteredData?.map(
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
                                            title={`${hazard_type_display}: ${filters.riskMetric === 'riskScore' ? riskCategoryToLabelMap[value] : formatNumber(value)}`}
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
            </Container>
        </Container>
    );
}

Component.displayName = 'RegionSeasonalRiskWatch';
