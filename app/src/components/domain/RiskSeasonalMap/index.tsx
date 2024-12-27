import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    BlockLoading,
    Container,
    LegendItem,
    Message,
    TextOutput,
    Tooltip,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    formatNumber,
    maxSafe,
    sumSafe,
} from '@ifrc-go/ui/utils';
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
import { MapBounds } from '@togglecorp/re-map';
import {
    type FillPaint,
    type LngLatBoundsLike,
    type LngLatLike,
} from 'mapbox-gl';

import GlobalMap, { type AdminZeroFeatureProperties } from '#components/domain/GlobalMap';
import Link from '#components/Link';
import MapContainerWithDisclaimer from '#components/MapContainerWithDisclaimer';
import MapPopup from '#components/MapPopup';
import WikiLink from '#components/WikiLink';
import useCountry from '#hooks/domain/useCountry';
import useInputState from '#hooks/useInputState';
import {
    CATEGORY_RISK_HIGH,
    CATEGORY_RISK_LOW,
    CATEGORY_RISK_MEDIUM,
    CATEGORY_RISK_VERY_HIGH,
    CATEGORY_RISK_VERY_LOW,
    COLOR_DARK_GREY,
    COLOR_LIGHT_BLUE,
    COLOR_LIGHT_GREY,
    COLOR_PRIMARY_RED,
    DEFAULT_MAP_PADDING,
    DURATION_MAP_ZOOM,
} from '#utils/constants';
import {
    applicableHazardsByRiskMetric,
    getDataWithTruthyHazardType,
    getDisplacementRiskCategory,
    getExposureRiskCategory,
    getFiRiskDataItem,
    getValueForSelectedMonths,
    hasSomeDefinedValue,
    type HazardType,
    type HazardTypeOption,
    hazardTypeToColorMap,
    type RiskDataItem,
    type RiskMetric,
    type RiskMetricOption,
    riskScoreToCategory,
} from '#utils/domain/risk';
import { useRiskRequest } from '#utils/restRequest';

import Filters, { type FilterValue } from './Filters';

import i18n from './i18n.json';
import styles from './styles.module.css';

const defaultFilterValue: FilterValue = {
    months: [],
    countries: [],
    riskMetric: 'riskScore',
    hazardTypes: [],
    normalizeByPopulation: false,
    includeCopingCapacity: false,
};

interface TooltipContentProps {
    selectedRiskMetric: RiskMetric,
    valueListByHazard: {
        value: number;
        riskCategory: number;
        hazard_type: HazardType;
        hazard_type_display: string;
    }[];
}

function TooltipContent(props: TooltipContentProps) {
    const {
        selectedRiskMetric,
        valueListByHazard,
    } = props;

    const strings = useTranslation(i18n);
    const riskCategoryToLabelMap: Record<number, string> = useMemo(
        () => ({
            [CATEGORY_RISK_VERY_LOW]: strings.riskCategoryVeryLow,
            [CATEGORY_RISK_LOW]: strings.riskCategoryLow,
            [CATEGORY_RISK_MEDIUM]: strings.riskCategoryMedium,
            [CATEGORY_RISK_HIGH]: strings.riskCategoryHigh,
            [CATEGORY_RISK_VERY_HIGH]: strings.riskCategoryVeryHigh,
        }),
        [
            strings.riskCategoryVeryLow,
            strings.riskCategoryLow,
            strings.riskCategoryMedium,
            strings.riskCategoryHigh,
            strings.riskCategoryVeryHigh,
        ],
    );

    const riskMetricLabelMap: Record<RiskMetric, string> = {
        riskScore: strings.riskScoreOptionLabel,
        displacement: strings.peopleAtRiskOptionLabel,
        exposure: strings.peopleExposedOptionLabel,
    };

    return valueListByHazard.map(
        ({
            hazard_type_display,
            hazard_type,
            riskCategory,
            value,
        }) => (
            <Container
                key={hazard_type}
                heading={hazard_type_display}
                headingLevel={5}
                spacing="condensed"
                icons={(
                    <div className={styles.tooltipHazardIndicator}>
                        <div
                            className={styles.color}
                            style={{ backgroundColor: hazardTypeToColorMap[hazard_type] }}
                        />
                    </div>
                )}
            >
                <TextOutput
                    label={strings.riskScoreOptionLabel}
                    strongValue
                    value={riskCategoryToLabelMap[riskCategory]}
                />
                {selectedRiskMetric !== 'riskScore' && (
                    <TextOutput
                        label={riskMetricLabelMap[selectedRiskMetric]}
                        strongValue
                        value={formatNumber(Math.ceil(value), { maximumFractionDigits: 0 })}
                    />
                )}
            </Container>
        ),
    );
}

const RISK_LOW_COLOR = '#c7d3e0';
const RISK_HIGH_COLOR = '#f5333f';

interface ClickedPoint {
    properties: AdminZeroFeatureProperties;
    lngLat: LngLatLike;
}

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

function RiskSeasonalMap(props: Props) {
    const {
        className,
        bbox,
        regionId,
        variant,
    } = props;

    const [hazardTypeOptions, setHazardTypeOptions] = useInputState<HazardTypeOption[]>([]);
    const [
        clickedPointProperties,
        setClickedPointProperties,
    ] = useState<ClickedPoint | undefined>();
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

    const countryList = useCountry(
        variant === 'region'
            ? { region: regionId }
            : {},
    );

    const countryIso3ToIdMap = useMemo(
        () => (
            listToMap(
                countryList,
                ({ iso3 }) => iso3.toLowerCase(),
                ({ id }) => id,
            )
        ),
        [countryList],
    );

    const {
        response: riskScoreResponse,
        pending: riskScoreResponsePending,
    } = useRiskRequest({
        skip: variant === 'region' && isNotDefined(regionId),
        apiType: 'risk',
        url: '/api/v1/risk-score/',
        query: variant === 'region'
            ? {
                region: regionId,
                limit: 9999,
            } : { limit: 9999 },
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
                label: strings.peopleExposedOptionLabel,
                applicableHazards: applicableHazardsByRiskMetric.exposure,
            },
            {
                key: 'displacement',
                label: strings.peopleAtRiskOptionLabel,
                applicableHazards: applicableHazardsByRiskMetric.displacement,
            },
            {
                key: 'riskScore',
                label: strings.riskScoreOptionLabel,
                applicableHazards: applicableHazardsByRiskMetric.riskScore,
            },
        ]),
        [
            strings.peopleExposedOptionLabel,
            strings.peopleAtRiskOptionLabel,
            strings.riskScoreOptionLabel,
        ],
    );

    const availableHazards: Record<
        RiskMetric,
        { [key in HazardType]?: string }
    > | undefined = useMemo(
        () => {
            if (isNotDefined(data)) {
                return undefined;
            }

            return {
                exposure: {
                    ...listToMap(
                        data.exposure,
                        (item) => item.hazard_type,
                        (item) => item.hazard_type_display,
                    ),
                },
                displacement: {
                    ...listToMap(
                        data.displacement,
                        (item) => item.hazard_type,
                        (item) => item.hazard_type_display,
                    ),
                },
                riskScore: {
                    ...listToMap(
                        data.riskScore,
                        (item) => item.hazard_type,
                        (item) => item.hazard_type_display,
                    ),
                },
            };
        },
        [data],
    );

    const [filters, setFilters] = useInputState<FilterValue>(
        defaultFilterValue,
        (newValue, oldValue) => {
            // We only apply side effect when risk metric is changed
            if (newValue.riskMetric === oldValue.riskMetric) {
                return newValue;
            }

            const availableHazardsForSelectedRiskMetric = availableHazards?.[newValue.riskMetric];

            if (isNotDefined(availableHazardsForSelectedRiskMetric)) {
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
                    const hazard_type_display = availableHazardsForSelectedRiskMetric[hazardType];
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
            if (
                isNotDefined(availableHazards)
                || isNotDefined(availableHazards.riskScore)
                || isNotDefined(countryList)
            ) {
                return;
            }

            const riskMetric = riskMetricOptions.find(
                (option) => option.key === 'riskScore',
            );

            if (isNotDefined(riskMetric)) {
                return;
            }

            const newHazardTypeOptions = riskMetric.applicableHazards.map(
                (hazardType) => {
                    const hazard_type_display = availableHazards.riskScore[hazardType];
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
                    (hazardType) => isDefined(availableHazards[riskMetric.key]?.[hazardType]),
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
                    ) {
                        return undefined;
                    }

                    return {
                        iso3: item.country_details.iso3,
                        lcc: item.lcc,
                        population_in_thousands: item.population_in_thousands,
                    };
                },
            ).filter(isDefined);

            const populationListSafe = riskScoreList.map(
                (item) => (
                    isDefined(item.population_in_thousands)
                        ? {
                            iso3: item.iso3,
                            population_in_thousands: item.population_in_thousands,
                        } : undefined
                ),
            ).filter(isDefined);

            /*
            const maxPopulation = maxSafe(
                populationListSafe.map(
                    (item) => item.population_in_thousands,
                ),
            ) ?? 1;
            */

            const totalPopulation = Math.max(
                sumSafe(
                    populationListSafe.map(
                        (item) => item.population_in_thousands,
                    ),
                ) ?? 0,
                1,
            );

            const populationFactorMap = listToMap(
                populationListSafe,
                (result) => result.iso3,
                // FIXME: Let's try to update this logic later
                (result) => 1 - (result.population_in_thousands / totalPopulation) ** (1 / 4),
            );

            const populationMap = listToMap(
                riskScoreList,
                (result) => result.iso3,
                (result) => result.population_in_thousands,
            );

            const lccListSafe = riskScoreList.map(
                (item) => (
                    isDefined(item.lcc)
                        ? {
                            iso3: item.iso3,
                            lcc: item.lcc,
                        } : undefined
                ),
            ).filter(isDefined);

            const maxLcc = maxSafe(
                lccListSafe.map(
                    (item) => item.lcc,
                ),
            ) ?? 10;

            const lccMap = listToMap(
                lccListSafe,
                (item) => item.iso3,
                (item) => item.lcc,
            );

            const lccFactorMap = listToMap(
                lccListSafe,
                (item) => item.iso3,
                (item) => item.lcc / maxLcc,
            );

            return {
                lcc: lccMap,
                population: populationMap,
                populationFactor: populationFactorMap,
                lccFactor: lccFactorMap,
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
                                        value,
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

                                if (filters.normalizeByPopulation) {
                                    const populationFactor = mappings?.populationFactor[
                                        item.country_details.iso3
                                    ];

                                    if (isDefined(riskCategory) && isDefined(populationFactor)) {
                                        riskCategory = Math.ceil(riskCategory * populationFactor);
                                    }
                                }

                                if (filters.riskMetric === 'riskScore' && filters.includeCopingCapacity) {
                                    const lccFactor = mappings?.lccFactor[
                                        item.country_details.iso3
                                    ];

                                    if (isDefined(riskCategory) && isDefined(lccFactor)) {
                                        riskCategory = Math.ceil(riskCategory * lccFactor);
                                    }
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
                        const riskCategorySum = sumSafe(
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
                            riskCategorySum,
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
                ).sort((a, b) => compareNumber(a.riskCategorySum, b.riskCategorySum, -1));
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

                return transformedData;
            }

            return undefined;
        },
        [data, filters, mappings],
    );

    const MAX_RISK_SCORE = CATEGORY_RISK_VERY_HIGH;

    // NOTE: we need to generate the layerOptions because we cannot use MapState
    // The id in the vector tile does not match the id in GO
    // We also cannot use promoteId as it is a non-managed mapbox source
    const paintOptions = useMemo<FillPaint>(
        () => {
            if (isNotDefined(filteredData) || filteredData.length === 0) {
                return {
                    'fill-color': COLOR_LIGHT_GREY,
                };
            }

            return {
                'fill-color': [
                    'match',
                    ['get', 'iso3'],
                    ...filteredData.flatMap(
                        (item) => [
                            item.country_details.iso3.toUpperCase(),
                            [
                                'interpolate',
                                ['linear'],
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
                'fill-outline-color': [
                    'case',
                    ['boolean', ['feature-state', 'hovered'], false],
                    COLOR_DARK_GREY,
                    'transparent',
                ],
            };
        },
        [filteredData],
    );

    const handleCountryClick = useCallback(
        (properties: AdminZeroFeatureProperties, lngLat: LngLatLike) => {
            setClickedPointProperties({
                properties,
                lngLat,
            });
            return true;
        },
        [setClickedPointProperties],
    );

    const handlePointClose = useCallback(
        () => {
            setClickedPointProperties(undefined);
        },
        [setClickedPointProperties],
    );

    const riskPopupValue = useMemo(() => (
        filteredData?.find(
            (filter) => filter.iso3 === clickedPointProperties
                ?.properties.iso3.toLowerCase(),
        )
    ), [filteredData, clickedPointProperties]);

    return (
        <Container
            className={_cs(styles.riskSeasonalMapContainer, className)}
            heading={strings.riskSeasonalMapHeading}
            filters={(
                <Filters
                    regionId={Number(regionId)}
                    value={filters}
                    onChange={setFilters}
                    hazardTypeOptions={hazardTypeOptions}
                    riskMetricOptions={riskMetricOptions}
                />
            )}
            headerDescriptionContainerClassName={styles.headerDescription}
            headerDescription={(
                <>
                    <div>
                        {strings.seasonalEventsDescriptionOne}
                    </div>
                    <div>
                        {strings.seasonalEventsDescriptionTwo}
                    </div>
                </>
            )}
            actions={(
                <WikiLink
                    href="user_guide/risk_module#seasonal-risk"
                />
            )}
            childrenContainerClassName={styles.mainContent}
            withHeaderBorder
            footerClassName={styles.footer}
            footerContent={(
                <div className={styles.severityLegend}>
                    <div className={styles.legendLabel}>{strings.severityLegendLabel}</div>
                    <div className={styles.legendContent}>
                        <div
                            className={styles.severityGradient}
                            style={{ background: `linear-gradient(90deg, ${RISK_LOW_COLOR}, ${RISK_HIGH_COLOR})` }}
                        />
                        <div className={styles.labelList}>
                            <div>
                                {strings.severityLowLabel}
                            </div>
                            <div>
                                {strings.severityHighLabel}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            footerActionsContainerClassName={styles.footerActions}
            footerActions={(
                <div className={styles.typeOfHazardLegend}>
                    <div className={styles.legendLabel}>
                        {strings.hazardsTypeLegendLabel}
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
            <GlobalMap
                onAdminZeroFillClick={handleCountryClick}
                adminZeroFillPaint={paintOptions}
            >
                <MapContainerWithDisclaimer
                    className={styles.mapContainer}
                />
                <MapBounds
                    duration={DURATION_MAP_ZOOM}
                    bounds={bbox}
                    padding={DEFAULT_MAP_PADDING}
                />
                {clickedPointProperties?.lngLat && riskPopupValue && (
                    <MapPopup
                        coordinates={clickedPointProperties.lngLat}
                        onCloseButtonClick={handlePointClose}
                        heading={(
                            <Link
                                to="countriesLayout"
                                urlParams={{
                                    countryId: clickedPointProperties.properties.country_id,
                                }}
                                withUnderline
                            >
                                {clickedPointProperties.properties.name}
                            </Link>
                        )}
                        contentViewType="vertical"
                        childrenContainerClassName={styles.popupContent}
                    >
                        <TooltipContent
                            selectedRiskMetric={filters.riskMetric}
                            valueListByHazard={riskPopupValue.valueListByHazard}
                        />
                    </MapPopup>
                )}
            </GlobalMap>
            <Container
                className={styles.countryList}
                childrenContainerClassName={styles.content}
                withInternalPadding
                heading={strings.riskSeasonalCountriesByRiskHeading}
                headingLevel={4}
                withHeaderBorder
                contentViewType="vertical"
            >
                {dataPending && <BlockLoading />}
                {!dataPending && (isNotDefined(filteredData) || filteredData?.length === 0) && (
                    <Message
                        title={strings.riskDataNotAvailable}
                    />
                )}
                {/* FIXME: use List */}
                {!dataPending && filteredData?.map(
                    (dataItem) => {
                        const totalValuePercentage = 100 * dataItem.normalizedValue;
                        if (totalValuePercentage < 1) {
                            return null;
                        }

                        const countryId = countryIso3ToIdMap[dataItem.country_details.iso3];

                        return (
                            <div
                                key={dataItem.iso3}
                                className={styles.country}
                            >
                                <Link
                                    className={styles.name}
                                    to="countryProfileSeasonalRisks"
                                    urlParams={{ countryId }}
                                >
                                    {dataItem.country_details.name}
                                </Link>
                                <div className={styles.track}>
                                    {dataItem.valueListByHazard.map(
                                        ({
                                            hazard_type,
                                            riskCategory,
                                        }) => {
                                            // eslint-disable-next-line max-len
                                            const percentage = (100 * riskCategory) / (MAX_RISK_SCORE * filters.hazardTypes.length);

                                            if (percentage < 1) {
                                                return null;
                                            }

                                            return (
                                                <div
                                                    className={styles.bar}
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
                                <Tooltip
                                    title={dataItem.country_details.name}
                                    className={styles.barChartTooltip}
                                    description={(
                                        <TooltipContent
                                            selectedRiskMetric={filters.riskMetric}
                                            valueListByHazard={dataItem.valueListByHazard}
                                        />
                                    )}
                                />
                            </div>
                        );
                    },
                )}
            </Container>
        </Container>
    );
}

export default RiskSeasonalMap;
