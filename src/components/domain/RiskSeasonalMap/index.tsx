import { useEffect, useMemo } from 'react';
import { type FillLayer, type LngLatBoundsLike } from 'mapbox-gl';
import {
    _cs,
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
    defaultNavControlPosition,
    defaultNavControlOptions,
} from '#utils/map';
import MapContainerWithDisclaimer from '#components/MapContainerWithDisclaimer';
import Container from '#components/Container';
import BlockLoading from '#components/BlockLoading';
import LegendItem from '#components/LegendItem';
import Link from '#components/Link';
import useInputState from '#hooks/useInputState';
import useCountryRaw from '#hooks/domain/useCountryRaw';
import useCountry from '#hooks/domain/useCountry';
import useTranslation from '#hooks/useTranslation';
import {
    getDataWithTruthyHazardType,
    getFiRiskDataItem,
    hasSomeDefinedValue,
    getValueForSelectedMonths,
    hazardTypeToColorMap,
    riskScoreToCategory,
    applicableHazardsByRiskMetric,
    type HazardType,
    type HazardTypeOption,
    type RiskDataItem,
    type RiskMetricOption,
    getExposureRiskCategory,
    getDisplacementRiskCategory,
} from '#utils/domain/risk';
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
    DURATION_MAP_ZOOM,
    DEFAULT_MAP_PADDING,
} from '#utils/constants';

import Filters, { type FilterValue } from './Filters';
import i18n from './i18n.json';
import styles from './styles.module.css';

const defaultFilterValue: FilterValue = {
    months: [],
    countries: [],
    riskMetric: 'exposure',
    hazardTypes: [],
    normalizeByPopulation: false,
    includeCopingCapacity: false,
};

type BaseProps = {
    className?: string;
    bbox: LngLatBoundsLike | undefined;
}

type Props = BaseProps & ({
    variant: 'global';
    regionId?: never;
} | {
    variant: 'region';
    regionId: number;
});

const RISK_LOW_COLOR = '#c7d3e0';
const RISK_HIGH_COLOR = '#f5333f';

function RiskSeasonalMap(props: Props) {
    const {
        className,
        bbox,
        regionId,
        variant,
    } = props;

    const [hazardTypeOptions, setHazardTypeOptions] = useInputState<HazardTypeOption[]>([]);
    const strings = useTranslation(i18n);

    const {
        response: seasonalResponse,
        pending: seasonalResponsePending,
    } = useRiskRequest({
        skip: variant === 'region' && isNotDefined(regionId),
        apiType: 'risk',
        url: '/api/v1/seasonal/',
        query: variant === 'region'
            ? { region: regionId }
            : undefined,
    });

    const rawCountryList = useCountryRaw();

    // NOTE: We are using CountryIsoMultiSelectInput in filter
    const countryList = useCountry(
        variant === 'region'
            ? { region: regionId }
            : {},
    );

    const countryIso3ToIdMap = useMemo(
        () => (
            listToMap(
                rawCountryList,
                ({ iso3 }) => (isFalsyString(iso3) ? '<no-key>' : iso3.toLowerCase()),
                ({ id }) => id,
            )
        ),
        [rawCountryList],
    );

    const {
        response: riskScoreResponse,
        pending: riskScoreResponsePending,
    } = useRiskRequest({
        skip: variant === 'region' && isNotDefined(regionId),
        apiType: 'risk',
        url: '/api/v1/risk-score/',
        query: variant === 'region'
            ? { region: regionId }
            : undefined,
    });

    // NOTE: We get single element as array in response
    const seasonalRiskData = seasonalResponse?.[0];
    const dataPending = riskScoreResponsePending || seasonalResponsePending;

    const data = useMemo(
        () => {
            if (isNotDefined(seasonalRiskData)) {
                return undefined;
            }

            const {
                idmc,
                ipc_displacement_data,
                raster_displacement_data,
                gwis_seasonal,
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
                    ...gwis_seasonal?.map(
                        (dataItem) => {
                            if (!hasSomeDefinedValue(dataItem)) {
                                return undefined;
                            }

                            return getDataWithTruthyHazardType(dataItem);
                        },
                    ) ?? [],
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
            if (isNotDefined(data)) {
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
            if (newValue.riskMetric === oldValue.riskMetric || isNotDefined(availableHazards)) {
                return newValue;
            }

            const selectedRiskMetricDetail = riskMetricOptions.find(
                (option) => option.key === newValue.riskMetric,
            );

            if (isNotDefined(selectedRiskMetricDetail)) {
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
            if (isNotDefined(availableHazards) || isNotDefined(countryList)) {
                return;
            }

            const riskMetric = riskMetricOptions.find(
                (option) => option.key === 'exposure',
            );

            if (isNotDefined(riskMetric)) {
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
                    (hazardType) => isDefined(availableHazards[hazardType]),
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
            if (isNotDefined(riskScoreResponse) || isNotDefined(riskScoreResponse.results)) {
                return undefined;
            }

            const riskScoreList = riskScoreResponse.results.map(
                (item) => {
                    if (
                        isNotDefined(item.country_details)
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
                        if (
                            isNotDefined(item.country_details)
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
                            if (
                                !selectedHazards[item.hazard_type]
                                || isNotDefined(country_details)
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

                                let riskCategory;
                                if (filters.riskMetric === 'exposure') {
                                    riskCategory = getExposureRiskCategory(newValue);
                                } else if (filters.riskMetric === 'displacement') {
                                    riskCategory = getDisplacementRiskCategory(newValue);
                                } else if (filters.riskMetric === 'riskScore') {
                                    riskCategory = newValue;
                                }

                                if (isNotDefined(riskCategory)) {
                                    return undefined;
                                }

                                return {
                                    value: newValue,
                                    riskCategory,
                                    hazard_type: item.hazard_type,
                                    hazard_type_display: item.hazard_type_display,
                                };
                            },
                        ).filter(isDefined).sort(
                            (a, b) => compareNumber(a.riskCategory, b.riskCategory, -1),
                        );

                        const maxValue = maxSafe(valueListByHazard.map(({ value }) => value));
                        const sum = sumSafe(valueListByHazard.map(({ value }) => value));
                        const maxRiskCategory = maxSafe(
                            valueListByHazard.map(({ riskCategory }) => riskCategory),
                        );

                        if (
                            isNotDefined(maxValue)
                                || maxValue === 0
                                || isNotDefined(sum)
                                || sum === 0
                                || isNotDefined(maxRiskCategory)
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
                            totalValue,
                            maxValue,
                            riskCategory: maxRiskCategory,
                            valueListByHazard: normalizedValueListByHazard,
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
            if (isNotDefined(filteredData) || filteredData.length === 0) {
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
                                    ['number', item.riskCategory],
                                    CATEGORY_RISK_VERY_LOW,
                                    COLOR_LIGHT_BLUE,
                                    CATEGORY_RISK_VERY_HIGH,
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
            className={_cs(styles.riskSeasonalMapContainer, className)}
            // FIXME: use translation
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
            childrenContainerClassName={styles.mainContent}
            withHeaderBorder
            footerClassName={styles.footer}
            footerContent={(
                <div className={styles.severityLegend}>
                    <div className={styles.legendLabel}>{strings.severity}</div>
                    <div className={styles.legendContent}>
                        <div
                            className={styles.severityGradient}
                            style={{ background: `linear-gradient(90deg, ${RISK_LOW_COLOR}, ${RISK_HIGH_COLOR})` }}
                        />
                        <div className={styles.labelList}>
                            <div>
                                {strings.severityLow}
                            </div>
                            <div>
                                {strings.severityHigh}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            footerActionsContainerClassName={styles.footerActions}
            footerActions={(
                <div className={styles.typeOfHazardLegend}>
                    <div className={styles.legendLabel}>
                        {strings.hazardsType}
                    </div>
                    <div className={styles.legendContent}>
                        {hazardTypeOptions.map((hazard) => (
                            <LegendItem
                                key={hazard.hazard_type}
                                label={hazard.hazard_type_display}
                                color={hazardTypeToColorMap[hazard.hazard_type]}
                            />
                        ))}
                    </div>
                </div>
            )}
        >
            <Map
                mapStyle={defaultMapStyle}
                mapOptions={defaultMapOptions}
                navControlShown
                navControlPosition={defaultNavControlPosition}
                navControlOptions={defaultNavControlOptions}
                scaleControlShown={false}
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
                    duration={DURATION_MAP_ZOOM}
                    bounds={bbox}
                    padding={DEFAULT_MAP_PADDING}
                />
            </Map>
            <Container
                className={styles.countryList}
                childrenContainerClassName={styles.content}
                withInternalPadding
                // FIXME use translation
                heading="Countries"
                headingLevel={4}
                withHeaderBorder
                contentViewType="vertical"
            >
                {dataPending && <BlockLoading />}
                {/* FIXME: use List */}
                {!dataPending && filteredData?.map(
                    (dataItem) => {
                        const totalValuePercentage = 100 * dataItem.normalizedValue;
                        if (totalValuePercentage < 1) {
                            return null;
                        }

                        const countryId = countryIso3ToIdMap?.[dataItem.country_details.iso3];

                        return (
                            <div
                                key={dataItem.iso3}
                                className={styles.country}
                            >
                                <Link
                                    className={styles.name}
                                    to="countryRiskWatch"
                                    urlParams={{ countryId }}
                                >
                                    {dataItem.country_details.name}
                                </Link>
                                <div className={styles.track}>
                                    {dataItem.valueListByHazard.map(
                                        ({
                                            normalizedValue,
                                            value,
                                            hazard_type,
                                            hazard_type_display,
                                        }) => {
                                            // eslint-disable-next-line max-len
                                            const percentage = 100 * normalizedValue * dataItem.normalizedValue;

                                            if (percentage < 1) {
                                                return null;
                                            }

                                            return (
                                                <div
                                                    className={styles.bar}
                                                    title={`${hazard_type_display}: ${filters.riskMetric === 'riskScore' ? riskCategoryToLabelMap[value] : formatNumber(value)}`}
                                                    key={hazard_type}
                                                    style={{
                                                        width: `${percentage}%`,
                                                        backgroundColor: hazardTypeToColorMap[
                                                            hazard_type
                                                        ],
                                                    }}
                                                />
                                            );
                                        },
                                    )}
                                </div>
                            </div>
                        );
                    },
                )}
            </Container>
        </Container>
    );
}

export default RiskSeasonalMap;
