import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    ArtboardLineIcon,
    LocationIcon,
    MailIcon,
} from '@ifrc-go/icons';
import {
    Button,
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
    SymbolLayer,
} from 'mapbox-gl';

import ActiveCountryBaseMapLayer from '#components/domain/ActiveCountryBaseMapLayer';
import BaseMap from '#components/domain/BaseMap';
import Link, { type Props as LinkProps } from '#components/Link';
import MapContainerWithDisclaimer from '#components/MapContainerWithDisclaimer';
import MapPopup from '#components/MapPopup';
import useAuth from '#hooks/domain/useAuth';
import useFilterState from '#hooks/useFilterState';
import { chooseName } from '#utils/common';
import {
    COLOR_DARK_GREY,
    COLOR_PRIMARY_BLUE,
    COLOR_WHITE,
    DEFAULT_MAP_PADDING,
    DURATION_MAP_ZOOM,
} from '#utils/constants';
import { localUnitMapStyle } from '#utils/map';
import { type CountryOutletContext } from '#utils/outletContext';
import {
    GoApiUrlQuery,
    useRequest,
} from '#utils/restRequest';

import {
    AUTHENTICATED,
    PUBLIC,
    VALIDATED,
} from '../common';
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

interface Props {
    onPresentationModeButtonClick?: () => void;
    presentationMode?: boolean;
}

function LocalUnitsMap(props: Props) {
    const {
        onPresentationModeButtonClick,
        presentationMode = false,
    } = props;
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

    const { isAuthenticated } = useAuth();

    const requestType = useMemo(
        () => {
            if (isAuthenticated) {
                return 'authenticated';
            }

            return 'public';
        },
        [isAuthenticated],
    );

    const {
        response: publicLocalUnitsResponse,
        pending: publicLocalUnitsPending,
    } = useRequest({
        skip: requestType !== PUBLIC || isNotDefined(countryResponse),
        url: '/api/v2/public-local-units/',
        query: urlQuery,
    });

    const {
        response: localUnitsResponse,
        pending: localUnitsPending,
    } = useRequest({
        skip: requestType !== AUTHENTICATED || isNotDefined(countryResponse),
        url: '/api/v2/local-units/',
        query: urlQuery,
    });

    const localUnits = requestType === AUTHENTICATED
        ? localUnitsResponse : publicLocalUnitsResponse;
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
        (countryResponse && countryResponse.bbox)
            ? getBbox(countryResponse.bbox)
            : undefined
    ), [countryResponse]);

    const {
        response: publicLocalUnitDetailResponse,
        pending: publicLocalUnitDetailPending,
        error: publicLocalUnitDetailError,
    } = useRequest({
        skip: requestType !== PUBLIC || isNotDefined(clickedPointProperties),
        url: '/api/v2/public-local-units/{id}/',
        pathVariables: isDefined(clickedPointProperties) ? ({
            id: clickedPointProperties.localUnitId,
        }) : undefined,
    });

    const {
        response: superLocalUnitDetailResponse,
        pending: superLocalUnitDetailPending,
        error: superLocalUnitDetailError,
    } = useRequest({
        skip: requestType !== AUTHENTICATED || isNotDefined(clickedPointProperties),
        url: '/api/v2/local-units/{id}/',
        pathVariables: isDefined(clickedPointProperties) ? ({
            id: clickedPointProperties.localUnitId,
        }) : undefined,
    });

    const localUnitDetail = requestType !== AUTHENTICATED
        ? publicLocalUnitDetailResponse
        : superLocalUnitDetailResponse;

    const localUnitDetailPending = requestType !== AUTHENTICATED
        ? publicLocalUnitDetailPending
        : superLocalUnitDetailPending;

    const localUnitDetailError = requestType !== AUTHENTICATED
        ? publicLocalUnitDetailError
        : superLocalUnitDetailError;

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

    const localUnitName = useMemo(() => chooseName(
        localUnitDetail?.local_branch_name,
        localUnitDetail?.english_branch_name,
    ), [localUnitDetail?.local_branch_name, localUnitDetail?.english_branch_name]);

    const localUnitAddress = useMemo(() => chooseName(
        localUnitDetail?.address_loc,
        localUnitDetail?.address_en,
    ), [localUnitDetail?.address_loc, localUnitDetail?.address_en]);

    return (
        <Container
            className={styles.localUnitsMap}
            contentViewType="vertical"
            withGridViewInFilter
            filters={!presentationMode && (
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
                    mapStyle={localUnitMapStyle}
                    withoutLabel
                    baseLayers={(
                        <ActiveCountryBaseMapLayer
                            activeCountryIso3={countryResponse?.iso3}
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
                    {isDefined(clickedPointProperties) && clickedPointProperties.lngLat && (
                        <MapPopup
                            popupClassName={styles.mapPopup}
                            coordinates={clickedPointProperties.lngLat}
                            onCloseButtonClick={handlePointClose}
                            heading={localUnitName}
                            contentViewType="vertical"
                            pending={localUnitDetailPending}
                            errored={isDefined(localUnitDetailError)}
                            errorMessage={localUnitDetailError?.value.messageForNotification}
                            compactMessage
                            ellipsizeHeading
                        >
                            <TextOutput
                                label={strings.localUnitDetailLastUpdate}
                                value={localUnitDetail?.modified_at}
                                strongLabel
                                valueType="date"
                            />
                            <TextOutput
                                label={strings.localUnitDetailAddress}
                                strongLabel
                                value={localUnitAddress}
                            />
                            <TextOutput
                                label={strings.localUnitLocalUnitType}
                                strongLabel
                                value={localUnitDetail?.type_details.name}
                            />
                            {isDefined(localUnitDetail?.health) && (
                                <TextOutput
                                    label={strings.localUnitHealthFacilityType}
                                    strongLabel
                                    value={
                                        localUnitDetail
                                            ?.health?.health_facility_type_details.name
                                    }
                                />
                            )}
                            {isTruthyString(localUnitDetail?.link) && (
                                <Link
                                    href={localUnitDetail?.link}
                                    external
                                    withLinkIcon
                                >
                                    {strings.localUnitTooltipMoreDetails}
                                </Link>
                            )}
                        </MapPopup>
                    )}
                </BaseMap>
                {onPresentationModeButtonClick && !presentationMode && (
                    <Button
                        className={styles.presentationModeButton}
                        name={undefined}
                        icons={<ArtboardLineIcon />}
                        onClick={onPresentationModeButtonClick}
                        variant="secondary"
                    >
                        {strings.presentationModeButton}
                    </Button>
                )}
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
            {
                isDefined(localUnitsOptions) && (
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
                )
            }
        </Container>
    );
}

export default LocalUnitsMap;
