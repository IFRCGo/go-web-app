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
    Legend,
    List,
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
    MapImage,
    MapLayer,
    MapSource,
} from '@togglecorp/re-map';
import getBbox from '@turf/bbox';
import { type SymbolLayer } from 'mapbox-gl';

import ActiveCountryBaseMapLayer from '#components/domain/ActiveCountryBaseMapLayer';
import BaseMap from '#components/domain/BaseMap';
import Link, { type Props as LinkProps } from '#components/Link';
import MapContainerWithDisclaimer from '#components/MapContainerWithDisclaimer';
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
    VALIDATED,
} from '../common';
import type { FilterValue } from '../Filters';
import LocalUnitsFormModal from '../LocalUnitsFormModal';
import { TYPE_HEALTH_CARE } from '../LocalUnitsFormModal/LocalUnitsForm/schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

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
    lngLat: mapboxgl.LngLatLike;
}

function emailKeySelector(email: string) {
    return email;
}

interface Props {
    onPresentationModeButtonClick?: () => void;
    presentationMode?: boolean;
    filter: FilterValue;
    localUnitsOptions: GoApiResponse<'/api/v2/local-units-options/'> | undefined;
}

function LocalUnitsMap(props: Props) {
    const {
        onPresentationModeButtonClick,
        presentationMode = false,
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
            validated: isDefined(filter.isValidated)
                ? filter.isValidated === VALIDATED : undefined,
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
            if (isGuestUser) {
                return 'public';
            }

            if (isAuthenticated) {
                return 'authenticated';
            }

            return 'public';
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
                    geometry: localUnit.location_geojson as unknown as {
                        type: 'Point',
                        coordinates: [number, number],
                    },
                    properties: {
                        id: localUnit.id,
                        localUnitId: localUnit.id,
                        // NOTE: we're adding radius here because of some bug in mapbox (not sure)
                        // which doesn't render circle if there aren't any expressions
                        radius: 12,
                        type: localUnit.type,
                        subType: localUnit.type === TYPE_HEALTH_CARE
                            ? localUnit.health_details?.health_facility_type
                            : undefined,
                        iconKey: isDefined(localUnit.health_details)
                            ? getIconKey(
                                localUnit.health_details?.health_facility_type,
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

    const handleLocalUnitHeadingClick = useCallback(
        () => {
            setReadOnlyLocalUnitModal(true);
            setShowLocalUnitViewModalTrue();
        },
        [setShowLocalUnitViewModalTrue],
    );

    const handleLocalUnitsFormModalClose = useCallback(
        () => {
            setShowLocalUnitViewModalFalse();
            setReadOnlyLocalUnitModal(true);
        },
        [setShowLocalUnitViewModalFalse],
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
            contentViewType="vertical"
            pending={pending}
            overlayPending
        >
            <div className={styles.mapContainerWithContactDetails}>
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
                    <MapContainerWithDisclaimer
                        className={styles.mapContainer}
                    />
                    {countryBounds && (
                        <MapBounds
                            duration={DURATION_MAP_ZOOM}
                            padding={DEFAULT_MAP_PADDING}
                            bounds={countryBounds}
                        />
                    )}
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
                    {isDefined(clickedPointProperties) && clickedPointProperties.lngLat && (
                        <MapPopup
                            popupClassName={styles.mapPopup}
                            coordinates={clickedPointProperties.lngLat}
                            onCloseButtonClick={handlePointClose}
                            heading={(
                                <Button
                                    name=""
                                    variant="tertiary"
                                    onClick={handleLocalUnitHeadingClick}
                                    disabled={!isAuthenticated}
                                >
                                    {localUnitName}
                                </Button>
                            )}
                            contentViewType="vertical"
                            pending={localUnitDetailPending}
                            errored={isDefined(localUnitDetailError)}
                            errorMessage={localUnitDetailError?.value.messageForNotification}
                            compactMessage
                        >
                            <TextOutput
                                label={strings.localUnitsMapLastUpdate}
                                value={localUnitDetail?.modified_at}
                                strongLabel
                                valueType="date"
                            />
                            <TextOutput
                                label={strings.localUnitsMapAddress}
                                strongLabel
                                value={localUnitAddress}
                            />
                            <TextOutput
                                label={strings.localUnitsMapLocalUnitType}
                                strongLabel
                                value={localUnitDetail?.type_details.name}
                            />
                            {isDefined(localUnitDetail?.health) && (
                                <TextOutput
                                    label={strings.localUnitsMapHealthFacilityType}
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
                                    {strings.localUnitsMapTooltipMoreDetails}
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
                        {strings.localUnitsMapPresentationModeButton}
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
            {(showLocalUnitModal && (
                <LocalUnitsFormModal
                    onClose={handleLocalUnitsFormModalClose}
                    localUnitId={clickedPointProperties?.localUnitId}
                    readOnly={readOnlyLocalUnitModal}
                    setReadOnly={setReadOnlyLocalUnitModal}
                    onDeleteActionSuccess={refetchLocalUnits}
                />
            ))}
        </Container>
    );
}

export default LocalUnitsMap;
