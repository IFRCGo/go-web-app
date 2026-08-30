import {
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import {
    generatePath,
    Navigate,
    useOutletContext,
} from 'react-router-dom';
import {
    Container,
    LegendItem,
    ListView,
    Pager,
    RadioInput,
    Table,
    TextOutput,
} from '@ifrc-go/ui';
import { SortContext } from '@ifrc-go/ui/contexts';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createDateColumn,
    createProgressColumn,
    createStringColumn,
    getPercentage,
    hasSomeDefinedValue,
    resolveToComponent,
    sumSafe,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    listToGroupList,
    mapToMap,
    unique,
} from '@togglecorp/fujs';
import {
    MapBounds,
    MapLayer,
    MapSource,
} from '@togglecorp/re-map';
import { type LngLatBoundsLike } from 'mapbox-gl';

import {
    APPEAL_TYPE_DREF,
    APPEAL_TYPE_EAP,
    APPEAL_TYPE_EMERGENCY,
    APPEAL_TYPE_MULTIPLE,
    basePointLayerOptions,
    COLOR_DREF,
    COLOR_EAP,
    COLOR_EMERGENCY_APPEAL,
    COLOR_MULTIPLE_TYPES,
    optionKeySelector,
    optionLabelSelector,
    outerCircleLayerOptionsForFinancialRequirements,
    outerCircleLayerOptionsForPeopleTargeted,
    type ScaleOption,
} from '#components/domain/ActiveOperationMap/utils';
import GlobalMap, { type AdminZeroFeatureProperties } from '#components/domain/GlobalMap';
import HighlightedOperations from '#components/domain/HighlightedOperations';
import GoMapContainer from '#components/GoMapContainer';
import Link from '#components/Link';
import MapPopup from '#components/MapPopup';
import TabPage from '#components/TabPage';
import RouteContext from '#contexts/route';
import useCountryRaw from '#hooks/domain/useCountryRaw';
import useFilterState from '#hooks/useFilterState';
import useInputState from '#hooks/useInputState';
import {
    DEFAULT_MAP_PADDING,
    DURATION_MAP_ZOOM,
} from '#utils/constants';
import {
    createAppealCodeColumn,
    createBudgetColumn,
    createDisasterTypeColumn,
    createEventColumn,
} from '#utils/domain/tableHelpers';
import { getGeoJsonBounds } from '#utils/geo';
import { type CountryOutletContext } from '#utils/outletContext';
import type {
    GoApiResponse,
    GoApiUrlQuery,
} from '#utils/restRequest';
import { useRequest } from '#utils/restRequest';

import CountryKeyFigures from './CountryKeyFigures';
import Filters from './Filters';

import i18n from './i18n.json';

type AppealQueryParams = GoApiUrlQuery<'/api/v2/appeal/'>;
type AppealResponse = GoApiResponse<'/api/v2/appeal/'>;
type AppealListItem = NonNullable<AppealResponse['results']>[number];

type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type AppealTypeOption = NonNullable<GlobalEnumsResponse['api_appeal_type']>[number];

const appealKeySelector = (option: AppealListItem) => option.id;
const sourceOptions: mapboxgl.GeoJSONSourceRaw = {
    type: 'geojson',
};

const now = new Date().toISOString();

interface ClickedPoint {
    properties: AdminZeroFeatureProperties;
    lngLat: mapboxgl.LngLatLike;
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { countryOngoingActivitiesEmergencies } = useContext(RouteContext);
    const [presentationMode, setPresentationMode] = useState(false);

    const strings = useTranslation(i18n);

    const {
        countryId,
        countryResponse,
    } = useOutletContext<CountryOutletContext>();
    const countryRawResponse = useCountryRaw();

    const {
        filter,
        filtered,
        limit,
        page,
        rawFilter,
        setFilter,
        setFilterField,
        setPage,
        sortState,
    } = useFilterState<{
        appeal?: AppealTypeOption['key'],
        district?: number[],
        displacement?: number,
        startDateAfter?: string,
        startDateBefore?: string,
    }>({
        filter: {},
        pageSize: 5,
    });

    const countryBounds = useMemo<LngLatBoundsLike | undefined>(() => (
        (countryResponse && countryResponse.bbox)
            ? getGeoJsonBounds(countryResponse.bbox)
            : undefined
    ), [countryResponse]);

    const query = useMemo<AppealQueryParams>(
        () => {
            const baseQuery: AppealQueryParams = {
                atype: filter.appeal,
                dtype: filter.displacement,
                district: hasSomeDefinedValue(filter.district) ? filter.district : undefined,
                end_date__gt: now,
                start_date__gte: filter.startDateAfter,
                start_date__lte: filter.startDateBefore,
                limit,
            };

            return {
                ...baseQuery,
                region: undefined,
                country: countryId ? [Number(countryId)] : undefined,
            };
        },
        [filter, limit, countryId],
    );

    const [
        clickedPointProperties,
        setClickedPointProperties,
    ] = useState<ClickedPoint | undefined>();
    const isFiltered = hasSomeDefinedValue(rawFilter);

    const [scaleBy, setScaleBy] = useInputState<ScaleOption['value']>('peopleTargeted');

    const {
        pending: aggregatedAppealPending,
        response: aggregatedAppealResponse,
        error: aggregatedAppealError,
    } = useRequest({
        skip: isNotDefined(countryId),
        url: '/api/v2/appeal/aggregated',
        query: { country: Number(countryId) },
    });

    const {
        pending: appealsPending,
        response: appealsResponse,
        error: appealsResponseError,
    } = useRequest({
        url: '/api/v2/appeal/',
        preserveResponse: true,
        query,
    });

    const heading = resolveToComponent(
        strings.countryOngoingActiveOperationsTitle,
        { numAppeals: appealsResponse?.count ?? '--' },
    );

    const columns = useMemo(
        () => ([
            createDateColumn<AppealListItem, string>(
                'start_date',
                strings.appealsTableStartDate,
                (item) => item.start_date,
                { sortable: true },
            ),
            createStringColumn<AppealListItem, string>(
                'atype',
                strings.appealsTableType,
                (item) => item.atype_display,
                { sortable: true },
            ),
            createAppealCodeColumn<AppealListItem, string>(
                'code',
                strings.appealsTableCode,
                (item) => item.code,
            ),
            createEventColumn<AppealListItem, string>(
                'operation',
                strings.appealsTableOperation,
                (item) => item.name,
                (item) => ({
                    to: 'emergenciesLayout',
                    urlParams: { emergencyId: item.event },
                }),
            ),
            createDisasterTypeColumn<AppealListItem, string>(
                'dtype',
                strings.appealsTableDisasterType,
                (item) => item.dtype?.name,
                { sortable: true },
            ),
            createBudgetColumn<AppealListItem, string>(
                'amount_requested',
                strings.appealsTableRequestedAmount,
                (item) => item.amount_requested,
                { sortable: true },
            ),
            createProgressColumn<AppealListItem, string>(
                'amount_funded',
                strings.appealsTableFundedAmount,
                // FIXME: use progress function
                (item) => (
                    getPercentage(
                        item.amount_funded,
                        item.amount_requested,
                    )
                ),
                { sortable: true },
            ),
        ].filter(isDefined)),
        [
            strings.appealsTableStartDate,
            strings.appealsTableType,
            strings.appealsTableCode,
            strings.appealsTableOperation,
            strings.appealsTableDisasterType,
            strings.appealsTableRequestedAmount,
            strings.appealsTableFundedAmount,
        ],
    );

    const countryGroupedAppeal = useMemo(() => (
        listToGroupList(
            appealsResponse?.results ?? [],
            (appeal) => appeal.country.iso3 ?? '<no-key>',
        )
    ), [appealsResponse]);

    const countryCentroidGeoJson = useMemo(
        (): GeoJSON.FeatureCollection<GeoJSON.Geometry> => {
            const countryToOperationTypeMap = mapToMap(
                countryGroupedAppeal,
                (key) => key,
                (appealList) => {
                    const uniqueAppealList = unique(
                        appealList.map((appeal) => appeal.atype),
                    );

                    const peopleTargeted = sumSafe(
                        appealList.map((appeal) => appeal.num_beneficiaries),
                    );
                    const financialRequirements = sumSafe(
                        appealList.map((appeal) => appeal.amount_requested),
                    );

                    if (uniqueAppealList.length > 1) {
                        // multiple types
                        return {
                            appealType: APPEAL_TYPE_MULTIPLE,
                            peopleTargeted,
                            financialRequirements,
                        };
                    }

                    return {
                        appealType: uniqueAppealList[0],
                        peopleTargeted,
                        financialRequirements,
                    };
                },
            );
            return {
                type: 'FeatureCollection' as const,
                features: countryRawResponse
                    ?.map((country) => {
                        if (
                            (!country.independent && isNotDefined(country.record_type))
                            || isNotDefined(country.centroid)
                            || isNotDefined(country.iso3)
                        ) {
                            return undefined;
                        }

                        const operation = countryToOperationTypeMap[country.iso3];
                        if (isNotDefined(operation)) {
                            return undefined;
                        }

                        return {
                            type: 'Feature' as const,
                            geometry: country.centroid as {
                                type: 'Point',
                                coordinates: [number, number],
                            },
                            properties: {
                                id: country.iso3,
                                appealType: operation.appealType,
                                peopleTargeted: operation.peopleTargeted,
                                financialRequirements: operation.financialRequirements,
                            },
                        };
                    }).filter(isDefined) ?? [],
            };
        },
        [countryRawResponse, countryGroupedAppeal],
    );

    const allAppealsType = useMemo(() => {
        if (isDefined(countryId)) {
            return {
                searchParam: `country=${countryId}`,
                title: strings.operationMapViewAllInCountry,
            };
        }
        return {
            searchParam: undefined,
            title: strings.operationMapViewAll,
        };
    }, [
        countryId,
        strings.operationMapViewAllInCountry,
        strings.operationMapViewAll,
    ]);

    const handleCountryClick = useCallback((
        properties: AdminZeroFeatureProperties,
        lngLat: mapboxgl.LngLatLike,
    ) => {
        setClickedPointProperties({
            properties,
            lngLat,
        });
        return false;
    }, []);

    const handlePointClose = useCallback(
        () => {
            setClickedPointProperties(undefined);
        },
        [setClickedPointProperties],
    );

    const scaleOptions: ScaleOption[] = useMemo(() => ([
        { value: 'peopleTargeted', label: strings.explanationBubblePopulationLabel },
        { value: 'financialRequirements', label: strings.explanationBubbleAmountLabel },
    ]), [
        strings.explanationBubblePopulationLabel,
        strings.explanationBubbleAmountLabel,
    ]);

    const legendOptions = useMemo(() => ([
        {
            value: APPEAL_TYPE_EMERGENCY,
            label: strings.explanationBubbleEmergencyAppeal,
            color: COLOR_EMERGENCY_APPEAL,
        },
        {
            value: APPEAL_TYPE_DREF,
            label: strings.explanationBubbleDref,
            color: COLOR_DREF,
        },
        {
            value: APPEAL_TYPE_EAP,
            label: strings.explanationBubbleEAP,
            color: COLOR_EAP,
        },
        {
            value: APPEAL_TYPE_MULTIPLE,
            label: strings.explanationBubbleMultiple,
            color: COLOR_MULTIPLE_TYPES,
        },
    ]), [
        strings.explanationBubbleEmergencyAppeal,
        strings.explanationBubbleDref,
        strings.explanationBubbleEAP,
        strings.explanationBubbleMultiple,
    ]);

    const popupDetails = useMemo(() => {
        if (isNotDefined(clickedPointProperties)) {
            return undefined;
        }

        const appealList = countryGroupedAppeal[clickedPointProperties.properties.iso3];

        if (isNotDefined(appealList) || appealList.length === 0) {
            return undefined;
        }

        return appealList.map((appeal) => (
            <Container
                pending={false}
                filtered={false}
                empty={false}
                errored={false}
                key={appeal.id}
                heading={appeal.name}
                headingLevel={5}
                spacing="sm"
            >
                <ListView
                    layout="block"
                    withSpacingOpticalCorrection
                    spacing="2xs"
                >
                    <TextOutput
                        value={appeal.num_beneficiaries}
                        description={strings.operationPopoverPeopleAffected}
                        valueType="number"
                        textSize="sm"
                    />
                    <TextOutput
                        value={appeal.amount_requested}
                        description={strings.operationAmountRequested}
                        valueType="number"
                        textSize="sm"
                    />
                    <TextOutput
                        value={appeal.amount_funded}
                        description={strings.operationPopoverAmountFunded}
                        valueType="number"
                        textSize="sm"
                    />
                </ListView>
            </Container>
        ));
    }, [
        clickedPointProperties,
        countryGroupedAppeal,
        strings.operationAmountRequested,
        strings.operationPopoverAmountFunded,
        strings.operationPopoverPeopleAffected,
    ]);

    if (countryResponse?.sovereign_state_id && countryResponse?.independent === false) {
        const redirectCountryId = countryResponse.sovereign_state_id;
        const countryPath = generatePath(
            countryOngoingActivitiesEmergencies.absoluteForwardPath,
            { countryId: redirectCountryId },
        );

        return (
            <Navigate
                to={countryPath}
                replace
            />
        );
    }

    return (
        <TabPage>
            <Container
                headerDescription={strings.countryOngoingActivitiesEmergenciesDescription}
                withCenteredHeaderDescription
                pending={aggregatedAppealPending}
                errored={isDefined(aggregatedAppealError)}
                errorMessage={aggregatedAppealError?.value?.messageForNotification}
                filtered={false}
                empty={isNotDefined(aggregatedAppealResponse)}
                spacing="lg"
            >
                {aggregatedAppealResponse && (
                    <CountryKeyFigures
                        data={aggregatedAppealResponse}
                    />
                )}
            </Container>
            {isDefined(countryId) && (
                <HighlightedOperations
                    variant="country"
                    countryId={Number(countryId)}
                />
            )}
            {isDefined(countryId) && (
                <Container
                    pending={false}
                    errored={false}
                    empty={false}
                    heading={!presentationMode && heading}
                    withHeaderBorder={!presentationMode}
                    filtered={filtered}
                    filters={(
                        <Filters
                            value={rawFilter}
                            onChange={setFilterField}
                            setFilter={setFilter}
                            filtered={filtered}
                        />
                    )}
                    headerActions={!presentationMode && (
                        <Link
                            to="allAppeals"
                            urlSearch={allAppealsType.searchParam}
                            withLinkIcon
                            withUnderline
                        >
                            {allAppealsType.title}
                        </Link>
                    )}
                    footerActions={(
                        <Pager
                            activePage={page}
                            itemsCount={appealsResponse?.count ?? 0}
                            maxItemsPerPage={limit}
                            onActivePageChange={setPage}
                        />
                    )}
                >
                    <GlobalMap
                        // FIXME: We should use CountryMap instead
                        onAdminZeroFillClick={handleCountryClick}
                    >
                        <GoMapContainer
                            title={strings.downloadMapTitle}
                            withPresentationMode
                            onPresentationModeChange={setPresentationMode}
                            footer={(
                                <>
                                    <RadioInput
                                        label={strings.explanationBubbleScalePoints}
                                        name={undefined}
                                        options={scaleOptions}
                                        keySelector={optionKeySelector}
                                        labelSelector={optionLabelSelector}
                                        value={scaleBy}
                                        onChange={setScaleBy}
                                    />
                                    <ListView
                                        withWrap
                                        withSpacingOpticalCorrection
                                        spacing="sm"
                                    >
                                        {legendOptions.map((legendItem) => (
                                            <LegendItem
                                                key={legendItem.value}
                                                color={legendItem.color}
                                                label={legendItem.label}
                                            />
                                        ))}
                                    </ListView>
                                </>
                            )}
                        />
                        <MapSource
                            sourceKey="points"
                            sourceOptions={sourceOptions}
                            geoJson={countryCentroidGeoJson}
                        >
                            <MapLayer
                                layerKey="point-circle"
                                layerOptions={basePointLayerOptions}
                            />
                            <MapLayer
                                key={scaleBy}
                                layerKey="point-outer-circle"
                                layerOptions={
                                    scaleBy === 'peopleTargeted'
                                        ? outerCircleLayerOptionsForPeopleTargeted
                                        : outerCircleLayerOptionsForFinancialRequirements
                                }
                            />
                        </MapSource>
                        {clickedPointProperties?.lngLat && (
                            <MapPopup
                                onCloseButtonClick={handlePointClose}
                                coordinates={clickedPointProperties.lngLat}
                                heading={(
                                    <Link
                                        to="countriesLayout"
                                        urlParams={{
                                            countryId: clickedPointProperties
                                                .properties.country_id,
                                        }}
                                    >
                                        {clickedPointProperties.properties.name}
                                    </Link>
                                )}
                                withPadding
                                pending={false}
                                filtered={false}
                                errored={false}
                                empty={isNotDefined(popupDetails)}
                                emptyMessage={strings.operationPopoverEmpty}
                                withCompactMessage
                            >
                                {popupDetails}
                            </MapPopup>
                        )}
                        {isDefined(countryBounds) && (
                            <MapBounds
                                duration={DURATION_MAP_ZOOM}
                                bounds={countryBounds}
                                padding={DEFAULT_MAP_PADDING}
                            />
                        )}
                    </GlobalMap>
                    <SortContext.Provider value={sortState}>
                        <Table
                            pending={appealsPending}
                            filtered={isFiltered}
                            columns={columns}
                            keySelector={appealKeySelector}
                            data={appealsResponse?.results}
                            errored={isDefined(appealsResponseError)}
                        />
                    </SortContext.Provider>
                </Container>

            )}
        </TabPage>
    );
}
