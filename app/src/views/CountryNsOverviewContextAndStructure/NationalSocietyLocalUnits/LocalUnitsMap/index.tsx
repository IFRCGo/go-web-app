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
    Button,
    Container,
    InlineLayout,
    Legend,
    ListView,
    RawList,
    TextOutput,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import {
    numericIdSelector,
    stringNameSelector,
    sumSafe,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';
import {
    MapBounds,
    MapCenter,
    MapImage,
    MapLayer,
    MapSource,
} from '@togglecorp/re-map';
import getBbox from '@turf/bbox';
import { type SymbolLayer } from 'mapbox-gl';

import ActiveCountryBaseMapLayer from '#components/domain/ActiveCountryBaseMapLayer';
import BaseMap from '#components/domain/BaseMap';
import GoMapContainer from '#components/GoMapContainer';
import Link, { type Props as LinkProps } from '#components/Link';
import MapPopup from '#components/MapPopup';
import useAuth from '#hooks/domain/useAuth';
import usePermissions from '#hooks/domain/usePermissions';
import { getFirstTruthyString } from '#utils/common';
import {
    COLOR_PRIMARY_RED,
    COLOR_WHITE,
    DEFAULT_MAP_PADDING,
    DURATION_MAP_ZOOM,
    MAX_PAGE_LIMIT,
} from '#utils/constants';
import { localUnitMapStyle } from '#utils/map';
import { type CountryOutletContext } from '#utils/outletContext';
import {
    type GoApiResponse,
    type GoApiUrlQuery,
    useRequest,
} from '#utils/restRequest';

import {
    AUTHENTICATED,
    PUBLIC,
} from '../common';
import type { FilterValue } from '../Filters';
import LocalUnitsFormModal from '../LocalUnitsFormModal';
import { TYPE_HEALTH_CARE } from '../LocalUnitsFormModal/schema';
import LocalUnitStatus from '../LocalUnitStatus';

import i18n from './i18n.json';
import styles from './styles.module.css';

type LocationGeoJson = {
    type: 'Point',
    coordinates: [number, number],
};

const LOCAL_UNIT_ICON_KEY = 'local-units';
const HEALTHCARE_ICON_KEY = 'healthcare';

function iconSourceSelector({ image_url }: { image_url?: string | undefined }) {
    return image_url;
}

function primaryRedColorSelector() {
    return COLOR_PRIMARY_RED;
}

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
    center: [number, number];
}

function emailKeySelector(email: string) {
    return email;
}

interface Props {
    filter: FilterValue;
    localUnitsOptions: GoApiResponse<'/api/v2/local-units-options/'> | undefined;
}

function LocalUnitsMap(props: Props) {
    const {
        filter,
        localUnitsOptions,
    } = props;
    const { countryResponse } = useOutletContext<CountryOutletContext>();
    const { isAuthenticated } = useAuth();
    const [showLocalUnitModal, {
        setTrue: setShowLocalUnitViewModalTrue,
        setFalse: setShowLocalUnitViewModalFalse,
    }] = useBooleanState(false);
    const [readOnlyLocalUnitModal, setReadOnlyLocalUnitModal] = useState(true);

    const urlQuery = useMemo<GoApiUrlQuery<'/api/v2/public-local-units/'>>(
        () => ({
            limit: MAX_PAGE_LIMIT,
            type__code: filter.type,
            status: filter.status,
            search: filter.search,
            country__iso3: isDefined(countryResponse?.iso3) ? countryResponse?.iso3 : undefined,
        }),
        [filter, countryResponse],
    );

    const {
        isGuestUser,
    } = usePermissions();

    const requestType = useMemo(
        () => {
            if (isGuestUser || !isAuthenticated) {
                return PUBLIC;
            }

            return AUTHENTICATED;
        },
        [isAuthenticated, isGuestUser],
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
        retrigger: refetchLocalUnits,
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
                    geometry: localUnit.location_geojson as unknown as LocationGeoJson,
                    properties: {
                        id: localUnit.id,
                        localUnitId: localUnit.id,
                        // NOTE: we're adding radius here because of some bug in mapbox (not sure)
                        // which doesn't render circle if there aren't any expressions
                        lng: (
                            localUnit.location_geojson as unknown as LocationGeoJson
                        ).coordinates[0],
                        lat: (
                            localUnit.location_geojson as unknown as LocationGeoJson
                        ).coordinates[1],
                        radius: 12,
                        type: localUnit.type,
                        subType: localUnit.type === TYPE_HEALTH_CARE
                            ? localUnit.health_details?.health_facility_type
                            : undefined,
                        iconKey: ((isDefined(filter.type) && filter.type === TYPE_HEALTH_CARE)
                            && isDefined(localUnit.health_details))
                            ? getIconKey(
                                localUnit.health_details?.health_facility_type,
                                HEALTHCARE_ICON_KEY,
                            ) : getIconKey(localUnit.type, LOCAL_UNIT_ICON_KEY),
                    },
                }),
            ) ?? [],
        }),
        [localUnits, filter.type],
    );

    const handlePointClick = useCallback(
        (feature: mapboxgl.MapboxGeoJSONFeature) => {
            setClickedPointProperties({
                id: feature.properties?.id,
                localUnitId: feature.properties?.localUnitId,
                center: [feature.properties?.lng, feature.properties?.lat],
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

    const handleLocalUnitHeadingClick = useCallback(
        () => {
            setReadOnlyLocalUnitModal(true);
            setShowLocalUnitViewModalTrue();
        },
        [setShowLocalUnitViewModalTrue],
    );

    const handleLocalUnitsFormModalClose = useCallback(
        (shouldUpdate?: boolean) => {
            setShowLocalUnitViewModalFalse();
            setReadOnlyLocalUnitModal(true);

            if (shouldUpdate) {
                refetchLocalUnits();
            }
        },
        [setShowLocalUnitViewModalFalse, refetchLocalUnits],
    );

    const emailRendererParams = useCallback(
        (_: string, email: string): LinkProps => ({
            withUnderline: true,
            external: true,
            href: `mailto:${email}`,
            children: email,
            withEllipsizedContent: true,
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

    const localUnitName = useMemo(() => getFirstTruthyString(
        localUnitDetail?.local_branch_name,
        localUnitDetail?.english_branch_name,
    ), [localUnitDetail?.local_branch_name, localUnitDetail?.english_branch_name]);

    const localUnitAddress = useMemo(() => getFirstTruthyString(
        localUnitDetail?.address_loc,
        localUnitDetail?.address_en,
    ), [localUnitDetail?.address_loc, localUnitDetail?.address_en]);

    return (
        <Container
            className={styles.localUnitsMap}
            pending={pending}
            empty={false}
            filtered={false}
            errored={false}
            overlayPending
        >
            <BaseMap
                // NOTE: Even though we are using localUnitMapStyle, the
                // layer override defined inside BaseMap works
                mapStyle={localUnitMapStyle}
                baseLayers={(
                    <ActiveCountryBaseMapLayer
                        activeCountryIso3={countryResponse?.iso3}
                    />
                )}
                mapOptions={{ bounds: countryBounds }}
            >
                {clickedPointProperties && (
                    <MapCenter
                        center={clickedPointProperties?.center}
                        centerOptions={{
                            zoom: 18,
                            duration: DURATION_MAP_ZOOM,
                        }}
                    />
                )}
                <GoMapContainer
                    // FIXME: use strings
                    title={`${countryResponse?.name} Local Units`}
                    withPresentationMode
                    footer={(
                        <>
                            {filter.type === TYPE_HEALTH_CARE && (
                                <Legend
                                    label={strings.localUnitsMapHealthFacilityType}
                                    items={localUnitsOptions?.health_facility_type}
                                    keySelector={numericIdSelector}
                                    labelSelector={stringNameSelector}
                                    iconSrcSelector={iconSourceSelector}
                                    colorSelector={primaryRedColorSelector}
                                    iconElementClassName={styles.legendIcon}
                                />
                            )}
                            {filter.type !== TYPE_HEALTH_CARE && (
                                <Legend
                                    label={strings.localUnitsMapLocalUnitType}
                                    items={localUnitsOptions?.type}
                                    keySelector={numericIdSelector}
                                    labelSelector={stringNameSelector}
                                    iconSrcSelector={iconSourceSelector}
                                    colorSelector={primaryRedColorSelector}
                                    iconElementClassName={styles.legendIcon}
                                />
                            )}
                        </>
                    )}
                >
                    {hasContactDetails && (
                        <Container
                            pending={false}
                            errored={false}
                            filtered={false}
                            empty={false}
                            withPadding
                            withShadow
                            withBackground
                            className={styles.contactDetails}
                        >
                            <ListView
                                layout="block"
                                spacing="sm"
                                withSpacingOpticalCorrection
                            >
                                {hasAddress && (
                                    <InlineLayout
                                        contentAlignment="start"
                                        before={<LocationIcon className={styles.icon} />}
                                        spacing="sm"
                                    >
                                        <div>{countryResponse.address_1}</div>
                                        <div>{countryResponse.address_2}</div>
                                    </InlineLayout>
                                )}
                                {hasEmails && (
                                    <InlineLayout
                                        contentAlignment="start"
                                        before={<MailIcon className={styles.icon} />}
                                        spacing="sm"
                                    >
                                        <ListView
                                            layout="block"
                                            spacing="xs"
                                            withSpacingOpticalCorrection
                                        >
                                            <RawList
                                                data={countryResponse?.emails?.filter(isDefined)}
                                                renderer={Link}
                                                rendererParams={emailRendererParams}
                                                keySelector={emailKeySelector}
                                            />
                                        </ListView>
                                    </InlineLayout>
                                )}
                            </ListView>
                        </Container>
                    )}
                </GoMapContainer>
                {countryBounds && !clickedPointProperties && (
                    <MapBounds
                        duration={DURATION_MAP_ZOOM}
                        padding={DEFAULT_MAP_PADDING}
                        bounds={countryBounds}
                    />
                )}
                {(localUnitsOptions?.type.map(
                    (typeOption) => (
                        <MapImage
                            key={typeOption.id}
                            name={getIconKey(typeOption.code, LOCAL_UNIT_ICON_KEY)}
                            url={typeOption.image_url}
                            onLoad={handleIconLoad}
                            imageOptions={mapImageOption}
                        />
                    ),
                ))}
                {localUnitsOptions?.health_facility_type?.map(
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
                        layerOptions={{
                            type: 'circle',
                            paint: {
                                // NOTE: we're using expression for radius here because
                                // of a bug in mapbox (potentially)
                                'circle-radius': ['get', 'radius'],
                                'circle-color': COLOR_PRIMARY_RED,
                                'circle-opacity': 0.7,
                                'circle-stroke-color': COLOR_PRIMARY_RED,
                                'circle-stroke-width': 1,
                            },
                        }}
                        onClick={handlePointClick}
                    />
                    {allIconsLoaded && (
                        <MapLayer
                            layerKey="icon"
                            layerOptions={localUnitIconLayerOptions}
                        />
                    )}
                </MapSource>
                {isDefined(clickedPointProperties) && clickedPointProperties.center && (
                    <MapPopup
                        popupClassName={styles.mapPopup}
                        coordinates={clickedPointProperties.center}
                        onCloseButtonClick={handlePointClose}
                        heading={(
                            <Button
                                name={undefined}
                                styleVariant="action"
                                onClick={handleLocalUnitHeadingClick}
                                disabled={!isAuthenticated}
                            >
                                {localUnitName}
                            </Button>
                        )}
                        headerDescription={(
                            <LocalUnitStatus
                                value={localUnitDetail?.status}
                                valueDisplay={localUnitDetail?.status_details}
                            />
                        )}
                        pending={localUnitDetailPending}
                        errored={isDefined(localUnitDetailError)}
                        errorMessage={localUnitDetailError?.value.messageForNotification}
                        withCompactMessage
                        empty={false}
                        filtered={false}
                    >
                        <ListView
                            layout="block"
                            withSpacingOpticalCorrection
                            spacing="sm"
                        >
                            <TextOutput
                                label={strings.localUnitsMapLastUpdate}
                                value={localUnitDetail?.modified_at}
                                strongValue
                                valueType="date"
                            />
                            <TextOutput
                                label={strings.localUnitsMapAddress}
                                strongValue
                                value={localUnitAddress}
                            />
                            <TextOutput
                                label={strings.localUnitsMapLocalUnitType}
                                strongValue
                                value={localUnitDetail?.type_details.name}
                            />
                            {isDefined(localUnitDetail?.health) && (
                                <TextOutput
                                    label={strings.localUnitsMapHealthFacilityType}
                                    strongValue
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
                                    {strings.localUnitsMapTooltipMoreDetails}
                                </Link>
                            )}
                        </ListView>
                    </MapPopup>
                )}
            </BaseMap>
            {(showLocalUnitModal && (
                <LocalUnitsFormModal
                    onClose={handleLocalUnitsFormModalClose}
                    localUnitId={clickedPointProperties?.localUnitId}
                    readOnly={readOnlyLocalUnitModal}
                    setReadOnly={setReadOnlyLocalUnitModal}
                />
            ))}
        </Container>
    );
}

export default LocalUnitsMap;
