import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    LocationIcon,
    MailIcon,
} from '@ifrc-go/icons';
import {
    Container,
    LegendItem,
    List,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { sumSafe } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';
import {
    MapBounds,
    MapImage,
    MapLayer,
    MapSource,
} from '@togglecorp/re-map';
import getBbox from '@turf/bbox';
import type {
    CircleLayer,
    FillLayer,
    SymbolLayer,
} from 'mapbox-gl';

import BaseMap from '#components/domain/BaseMap';
import Link, { type Props as LinkProps } from '#components/Link';
import MapContainerWithDisclaimer from '#components/MapContainerWithDisclaimer';
import MapPopup from '#components/MapPopup';
import useUserMe from '#hooks/domain/useUserMe';
import useFilterState from '#hooks/useFilterState';
import {
    COLOR_DARK_GREY,
    COLOR_PRIMARY_BLUE,
    COLOR_WHITE,
    DEFAULT_MAP_PADDING,
    DURATION_MAP_ZOOM,
} from '#utils/constants';
import { type CountryOutletContext } from '#utils/outletContext';
import {
    GoApiUrlQuery,
    useRequest,
} from '#utils/restRequest';

import { VALIDATED } from '../common';
import Filters, { FilterValue } from '../Filters';

import i18n from './i18n.json';
import styles from './styles.module.css';

const LOCAL_UNIT_ICON_KEY = 'local-units';
const HEALTHCARE_ICON_KEY = 'healthcare';

const localUnitIconLayerOptions: Omit<SymbolLayer, 'id'> = {
    layout: {
        visibility: 'visible',
        'icon-size': 0.2,
        'icon-allow-overlap': false,
        'icon-image': ['get', 'iconKey'],
    },
    type: 'symbol',
    paint: {
        'icon-color': COLOR_WHITE,
    },
};

function getIconKey(code: number, type: string) {
    return `${type}:${code}`;
}

const mapImageOption = {
    sdf: true,
};

const sourceOption: mapboxgl.GeoJSONSourceRaw = {
    type: 'geojson',
};

interface ClickedPoint {
    id: string;
    localUnitId: number;
    lngLat: mapboxgl.LngLatLike;
}

function emailKeySelector(email: string) {
    return email;
}

function LocalUnitsMap() {
    const { countryResponse } = useOutletContext<CountryOutletContext>();

    const {
        response: localUnitsOptions,
        // pending: localUnitsOptionsResponsePending,
    } = useRequest({
        url: '/api/v2/local-units-options/',
    });

    const {
        filter,
        rawFilter,
        setFilterField,
        filtered,
        resetFilter,
        limit,
    } = useFilterState<FilterValue>({
        filter: {},
        pageSize: 9999,
    });

    const urlQuery = useMemo<GoApiUrlQuery<'/api/v2/public-local-units/'>>(
        () => ({
            limit,
            type__code: filter.type,
            validated: isDefined(filter.isValidated)
                ? filter.isValidated === VALIDATED : undefined,
            search: filter.search,
            country__iso3: isDefined(countryResponse?.iso3) ? countryResponse?.iso3 : undefined,
        }),
        [limit, filter, countryResponse],
    );

    const meResponse = useUserMe();

    const {
        response: publicLocalUnitsResponse,
        pending: publicLocalUnitsPending,
    } = useRequest({
        skip: isNotDefined(countryResponse?.iso3) || meResponse?.is_superuser,
        url: '/api/v2/public-local-units/',
        query: urlQuery,
    });

    const {
        response: localUnitsResponse,
        pending: localUnitsPending,
    } = useRequest({
        skip: isNotDefined(countryResponse?.iso3)
            || isNotDefined(meResponse)
            || !meResponse.is_superuser,
        url: '/api/v2/local-units/',
        query: urlQuery,
    });

    const localUnits = meResponse?.is_superuser ? localUnitsResponse : publicLocalUnitsResponse;
    const pending = publicLocalUnitsPending || localUnitsPending;

    const strings = useTranslation(i18n);
    const [
        clickedPointProperties,
        setClickedPointProperties,
    ] = useState<ClickedPoint | undefined>();

    const [loadedIcons, setLoadedIcons] = useState<Record<string, boolean>>({});

    const handleIconLoad = useCallback(
        (loaded: boolean, key: string) => {
            setLoadedIcons((prevValue) => ({
                ...prevValue,
                [key]: loaded,
            }));
        },
        [],
    );

    const allIconsLoaded = useMemo(
        () => (
            Object.values(loadedIcons).filter(Boolean).length === sumSafe([
                localUnitsOptions?.type.length,
                localUnitsOptions?.health_facility_type.length,
            ])
        ),
        [loadedIcons, localUnitsOptions],
    );

    const localUnitPointLayerOptions: Omit<CircleLayer, 'id'> = useMemo(() => ({
        layout: {
            visibility: 'visible',
        },
        type: 'circle',
        paint: {
            'circle-radius': 12,
            'circle-color': isDefined(localUnitsOptions) ? [
                'match',
                ['get', 'type'],
                ...localUnitsOptions.type.flatMap(
                    ({ code, colour }) => [code, colour],
                ),
                COLOR_DARK_GREY,
            ] : COLOR_DARK_GREY,
            'circle-opacity': 0.6,
            'circle-stroke-color': isDefined(localUnitsOptions) ? [
                'match',
                ['get', 'type'],
                ...localUnitsOptions.type.flatMap(
                    ({ code, colour }) => [code, colour],
                ),
                COLOR_DARK_GREY,
            ] : COLOR_DARK_GREY,
            'circle-stroke-width': 1,
            'circle-stroke-opacity': 1,
        },
    }), [localUnitsOptions]);

    const countryBounds = useMemo(() => (
        countryResponse ? getBbox(countryResponse.bbox) : undefined
    ), [countryResponse]);

    const { response: localUnitDetailResponse } = useRequest({
        skip: isNotDefined(clickedPointProperties?.localUnitId),
        url: '/api/v2/local-units/{id}/',
        pathVariables: isDefined(clickedPointProperties) ? ({
            id: clickedPointProperties.localUnitId,
        }) : undefined,
    });

    const localUnitsGeoJson = useMemo<GeoJSON.FeatureCollection<GeoJSON.Geometry>>(
        () => ({
            type: 'FeatureCollection' as const,
            features: localUnits?.results?.map(
                (localUnit) => ({
                    type: 'Feature' as const,
                    geometry: localUnit.location_details as unknown as {
                        type: 'Point',
                        coordinates: [number, number],
                    },
                    properties: {
                        id: localUnit.id,
                        localUnitId: localUnit.id,
                        type: localUnit.type,
                        subType: isDefined(localUnit.health_details)
                            ? localUnit.health_details.health_facility_type
                            : undefined,
                        iconKey: isDefined(localUnit.health_details)
                            ? getIconKey(
                                localUnit.health_details.health_facility_type,
                                HEALTHCARE_ICON_KEY,
                            ) : getIconKey(localUnit.type, LOCAL_UNIT_ICON_KEY),
                    },
                }),
            ) ?? [],
        }),
        [localUnits],
    );

    const adminZeroHighlightLayerOptions = useMemo<Omit<FillLayer, 'id'>>(
        () => ({
            type: 'fill',
            layout: { visibility: 'visible' },
            filter: isDefined(countryResponse) ? [
                '!in',
                'country_id',
                countryResponse.id,
            ] : undefined,
        }),
        [countryResponse],
    );

    const handlePointClick = useCallback(
        (feature: mapboxgl.MapboxGeoJSONFeature, lngLat: mapboxgl.LngLat) => {
            setClickedPointProperties({
                id: feature.properties?.id,
                localUnitId: feature.properties?.localUnitId,
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

    const emailRendererParams = useCallback(
        (_: string, email: string): LinkProps => ({
            className: styles.email,
            withUnderline: true,
            external: true,
            href: `mailto:${email}`,
            children: email,
        }),
        [],
    );

    const hasAddress = isDefined(countryResponse) && (
        isDefined(countryResponse.address_1) || isDefined(countryResponse.address_2)
    );
    const hasEmails = isDefined(countryResponse)
        && isDefined(countryResponse.emails)
        && countryResponse.emails.length > 0;
    const hasContactDetails = hasAddress || hasEmails;

    return (
        <Container
            className={styles.localUnitsMap}
            contentViewType="vertical"
            withGridViewInFilter
            filters={(
                <Filters
                    value={rawFilter}
                    setFieldValue={setFilterField}
                    options={localUnitsOptions}
                    resetFilter={resetFilter}
                    filtered={filtered}
                />
            )}
            pending={pending}
            overlayPending
        >
            <div className={styles.mapContainerWithContactDetails}>
                <BaseMap
                    baseLayers={(
                        <MapLayer
                            layerKey="admin-0-highlight"
                            layerOptions={adminZeroHighlightLayerOptions}
                        />
                    )}
                    mapOptions={{ bounds: countryBounds }}
                >
                    <MapContainerWithDisclaimer
                        className={styles.mapContainer}
                    />
                    {localUnitsOptions?.type.map(
                        (typeOption) => (
                            <MapImage
                                key={typeOption.id}
                                name={getIconKey(typeOption.code, LOCAL_UNIT_ICON_KEY)}
                                url={typeOption.image_url}
                                onLoad={handleIconLoad}
                                imageOptions={mapImageOption}
                            />
                        ),
                    )}
                    {localUnitsOptions?.health_facility_type.map(
                        (healthTypeOption) => (
                            <MapImage
                                key={healthTypeOption.id}
                                name={getIconKey(healthTypeOption.code, HEALTHCARE_ICON_KEY)}
                                url={healthTypeOption.image_url}
                                onLoad={handleIconLoad}
                                imageOptions={mapImageOption}
                            />
                        ),
                    )}
                    <MapSource
                        sourceKey="local-unit-points"
                        sourceOptions={sourceOption}
                        geoJson={localUnitsGeoJson}
                    >
                        <MapLayer
                            layerKey="point"
                            layerOptions={localUnitPointLayerOptions}
                            onClick={handlePointClick}
                        />
                        {allIconsLoaded && (
                            <MapLayer
                                layerKey="icon"
                                layerOptions={localUnitIconLayerOptions}
                            />
                        )}
                    </MapSource>
                    <MapBounds
                        duration={DURATION_MAP_ZOOM}
                        padding={DEFAULT_MAP_PADDING}
                        bounds={countryBounds}
                    />
                    {clickedPointProperties?.lngLat && localUnitDetailResponse && (
                        <MapPopup
                            coordinates={clickedPointProperties.lngLat}
                            onCloseButtonClick={handlePointClose}
                            heading={isTruthyString(localUnitDetailResponse?.english_branch_name)
                                ? localUnitDetailResponse?.english_branch_name
                                : localUnitDetailResponse?.local_branch_name}
                            contentViewType="vertical"
                        >
                            <TextOutput
                                label={strings.localUnitDetailLastUpdate}
                                value={localUnitDetailResponse?.modified_at}
                                strongLabel
                                valueType="date"
                            />
                            <TextOutput
                                label={strings.localUnitDetailAddress}
                                strongLabel
                                value={localUnitDetailResponse?.address_en
                                    ?? localUnitDetailResponse?.address_loc}
                            />
                            <TextOutput
                                label={strings.localUnitLocalUnitType}
                                strongLabel
                                value={localUnitDetailResponse?.type_details.name}
                            />
                            {isDefined(localUnitDetailResponse?.health) && (
                                <TextOutput
                                    label={strings.localUnitHealthFacilityType}
                                    strongLabel
                                    value={
                                        localUnitDetailResponse
                                            ?.health?.health_facility_type_details.name
                                    }
                                />
                            )}
                            {isTruthyString(localUnitDetailResponse?.link) && (
                                <Link
                                    href={localUnitDetailResponse?.link}
                                    external
                                    withLinkIcon
                                >
                                    {strings.localUnitTooltipMoreDetails}
                                </Link>
                            )}
                        </MapPopup>
                    )}
                </BaseMap>
                {hasContactDetails && (
                    <Container
                        className={styles.contactDetail}
                        contentViewType="vertical"
                        withInternalPadding
                    >
                        {hasAddress && (
                            <TextOutput
                                className={styles.info}
                                labelClassName={styles.label}
                                icon={(
                                    <LocationIcon className={styles.icon} />
                                )}
                                withoutLabelColon
                                value={(
                                    <>
                                        <div>{countryResponse.address_1}</div>
                                        <div>{countryResponse.address_2}</div>
                                    </>
                                )}
                            />
                        )}
                        {hasEmails && (
                            <TextOutput
                                className={styles.info}
                                labelClassName={styles.label}
                                icon={(
                                    <MailIcon className={styles.icon} />
                                )}
                                withoutLabelColon
                                value={(
                                    <List
                                        data={countryResponse?.emails?.filter(isDefined)}
                                        renderer={Link}
                                        rendererParams={emailRendererParams}
                                        keySelector={emailKeySelector}
                                        withoutMessage
                                        compact
                                        pending={false}
                                        errored={false}
                                        filtered={false}
                                    />
                                )}
                            />
                        )}
                    </Container>
                )}
            </div>
            {isDefined(localUnitsOptions) && (
                <Container
                    contentViewType="vertical"
                    spacing="comfortable"
                >
                    <Container
                        heading={strings.localUnitLegendLocalUnitTitle}
                        headingLevel={4}
                        contentViewType="grid"
                        numPreferredGridContentColumns={5}
                        spacing="compact"
                    >
                        {localUnitsOptions?.type.map((legendItem) => (
                            <LegendItem
                                key={legendItem.id}
                                iconSrc={legendItem.image_url}
                                iconClassName={styles.legendIcon}
                                color={legendItem.colour ?? COLOR_DARK_GREY}
                                label={legendItem.name}
                            />
                        ))}
                    </Container>
                    <Container
                        heading={strings.localUnitLegendHealthCareTitle}
                        headingLevel={5}
                        contentViewType="grid"
                        numPreferredGridContentColumns={5}
                        spacing="compact"
                    >
                        {localUnitsOptions?.health_facility_type.map((legendItem) => (
                            <LegendItem
                                key={legendItem.id}
                                // FIXME: use color from server
                                color={COLOR_PRIMARY_BLUE}
                                iconSrc={legendItem.image_url}
                                iconClassName={styles.legendIcon}
                                label={legendItem.name}
                            />
                        ))}
                    </Container>
                </Container>
            )}
        </Container>
    );
}

export default LocalUnitsMap;
