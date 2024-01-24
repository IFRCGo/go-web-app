import { useMemo, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { SearchLineIcon } from '@ifrc-go/icons';
import getBbox from '@turf/bbox';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import type {
    CirclePaint,
    CircleLayer,
    FillLayer,
} from 'mapbox-gl';
import {
    MapSource,
    MapLayer,
    MapBounds,
} from '@togglecorp/re-map';

import { adminUrl } from '#config';
import BaseMap from '#components/domain/BaseMap';
import Button from '#components/Button';
import Container from '#components/Container';
import Link from '#components/Link';
import MapContainerWithDisclaimer from '#components/MapContainerWithDisclaimer';
import MapPopup from '#components/MapPopup';
import SelectInput from '#components/SelectInput';
import TextInput from '#components/TextInput';
import TextOutput from '#components/TextOutput';
import useAuth from '#hooks/domain/useAuth';
import useFilterState from '#hooks/useFilterState';
import useTranslation from '#hooks/useTranslation';
import { resolveUrl } from '#utils/resolveUrl';
import {
    COLOR_RED,
    DURATION_MAP_ZOOM,
    DEFAULT_MAP_PADDING,
} from '#utils/constants';
import {
    stringLabelSelector,
    stringNameSelector,
} from '#utils/selectors';
import { type CountryOutletContext } from '#utils/outletContext';
import { type components } from '#generated/types';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

const basePointPaint: CirclePaint = {
    'circle-radius': 5,
    'circle-color': COLOR_RED,
};

const basePointLayerOptions: Omit<CircleLayer, 'id'> = {
    type: 'circle',
    paint: basePointPaint,
};
const sourceOption: mapboxgl.GeoJSONSourceRaw = {
    type: 'geojson',
};

type LocalUnitType = components<'read'>['schemas']['LocalUnitType'];

const localUnitCodeSelector = (localUnit: LocalUnitType) => localUnit.code;

interface Validation {
    label: string;
}

interface ClickedPoint {
    id: string;
    lngLat: mapboxgl.LngLatLike;
}

interface Props {
    className?: string;
}

function NationalSocietyLocalUnitsMap(props: Props) {
    const {
        className,
    } = props;

    const strings = useTranslation(i18n);
    const { countryId, countryResponse } = useOutletContext<CountryOutletContext>();
    const [
        clickedPointProperties,
        setClickedPointProperties,
    ] = useState<ClickedPoint | undefined>();

    const countryBounds = useMemo(() => (
        countryResponse ? getBbox(countryResponse.bbox) : undefined
    ), [countryResponse]);

    const { isAuthenticated } = useAuth();

    const {
        rawFilter,
        filter,
        filtered,
        setFilter,
        setFilterField,
    } = useFilterState<{
        type?: number;
        search?: string;
        isValidated?: string;
    }>({
        filter: {},
        pageSize: 9999,
    });

    const {
        response: localUnitListResponse,
    } = useRequest({
        skip: isNotDefined(countryResponse?.iso3),
        url: '/api/v2/local-units/',
        query: {
            limit: 9999,
            type__code: filter.type,
            validated: isDefined(filter.isValidated)
                ? filter.isValidated === strings.validated : undefined,
            search: filter.search,
            country__iso3: isDefined(countryResponse?.iso3) ? countryResponse?.iso3 : undefined,
        },
    });

    const {
        response: localUnitsOptionsResponse,
        pending: localUnitsOptionsResponsePending,
    } = useRequest({
        url: '/api/v2/local-units/options/',
    });

    const localUnitsGeoJson = useMemo((): GeoJSON.FeatureCollection<GeoJSON.Geometry> => ({
        type: 'FeatureCollection' as const,
        features: isDefined(localUnitListResponse)
            && isDefined(localUnitListResponse.results)
            ? localUnitListResponse?.results?.map((localUnit) => ({
                type: 'Feature' as const,
                geometry: localUnit.location as unknown as {
                    type: 'Point',
                    coordinates: [number, number],
                },
                properties: {
                    id: localUnit.local_branch_name,
                    type: localUnit.type.code,
                },
            })) : [],
    }), [localUnitListResponse]);

    const adminZeroHighlightLayerOptions = useMemo<Omit<FillLayer, 'id'>>(
        () => ({
            type: 'fill',
            layout: { visibility: 'visible' },
            filter: isDefined(countryResponse) ? [
                '!in',
                'country_id',
                countryResponse.id,
            ] : [],
        }),
        [countryResponse],
    );

    const selectedLocalUnitDetail = useMemo(
        () => {
            const id = clickedPointProperties?.id;
            if (isNotDefined(id)) {
                return undefined;
            }

            const selectedLocalUnit = localUnitListResponse?.results?.find(
                (localUnit) => localUnit.local_branch_name === id,
            );

            if (isNotDefined(selectedLocalUnit)) {
                return undefined;
            }

            return selectedLocalUnit;
        },
        [clickedPointProperties, localUnitListResponse?.results],
    );

    const validationOptions: Validation[] = useMemo(() => ([
        {
            label: strings.validated,
        },
        {
            label: strings.notValidated,
        },
    ]), [strings.validated, strings.notValidated]);

    const handlePointClick = useCallback(
        (feature: mapboxgl.MapboxGeoJSONFeature, lngLat: mapboxgl.LngLat) => {
            setClickedPointProperties({
                id: feature.properties?.id,
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

    const handleClearFilter = useCallback(
        () => {
            setFilter({});
        },
        [setFilter],
    );

    return (
        <Container
            className={_cs(styles.nationalSocietyLocalUnitsMap, className)}
            heading={strings.localUnitsMapTitle}
            childrenContainerClassName={styles.content}
            withGridViewInFilter
            withHeaderBorder
            actions={isAuthenticated && (
                <Link
                    external
                    href={resolveUrl(adminUrl, `api/country/${countryId}/change/`)}
                    variant="secondary"
                >
                    {strings.editLocalUnitLink}
                </Link>
            )}
            filters={(
                <>
                    <SelectInput
                        placeholder={strings.localUnitsFilterTypePlaceholder}
                        label={strings.localUnitsFilterTypeLabel}
                        name="type"
                        value={rawFilter.type}
                        onChange={setFilterField}
                        keySelector={localUnitCodeSelector}
                        labelSelector={stringNameSelector}
                        disabled={localUnitsOptionsResponsePending}
                        options={localUnitsOptionsResponse?.type}
                    />
                    <SelectInput
                        placeholder={strings.localUnitsFilterValidatedPlaceholder}
                        label={strings.localUnitsFilterValidatedLabel}
                        name="isValidated"
                        value={rawFilter.isValidated}
                        onChange={setFilterField}
                        keySelector={stringLabelSelector}
                        labelSelector={stringLabelSelector}
                        options={validationOptions}
                    />
                    <TextInput
                        name="search"
                        label={strings.localUnitsFilterSearchLabel}
                        placeholder={strings.localUnitsFilterSearchPlaceholderLabel}
                        value={rawFilter.search}
                        onChange={setFilterField}
                        icons={<SearchLineIcon />}
                    />
                    <div className={styles.clearButton}>
                        <Button
                            name={undefined}
                            variant="secondary"
                            onClick={handleClearFilter}
                            disabled={!filtered}
                        >
                            {strings.localUnitsFilterClear}
                        </Button>
                    </div>
                </>
            )}
        >
            <BaseMap
                baseLayers={(
                    <MapLayer
                        layerKey="admin-0-highlight"
                        layerOptions={adminZeroHighlightLayerOptions}
                    />
                )}
            >
                <MapContainerWithDisclaimer
                    className={styles.mapContainer}
                />
                <MapSource
                    sourceKey="points"
                    sourceOptions={sourceOption}
                    geoJson={localUnitsGeoJson}
                >
                    <MapLayer
                        layerKey="point-circle"
                        layerOptions={basePointLayerOptions}
                        onClick={handlePointClick}
                    />
                </MapSource>
                <MapBounds
                    duration={DURATION_MAP_ZOOM}
                    padding={DEFAULT_MAP_PADDING}
                    bounds={countryBounds}
                />
                {clickedPointProperties?.lngLat && selectedLocalUnitDetail && (
                    <MapPopup
                        coordinates={clickedPointProperties.lngLat}
                        onCloseButtonClick={handlePointClose}
                        heading={(
                            <Link
                                className={styles.localUnitInfo}
                                href={selectedLocalUnitDetail.link}
                                external
                                withLinkIcon
                            >
                                {selectedLocalUnitDetail.english_branch_name}
                            </Link>
                        )}
                        childrenContainerClassName={styles.popupContent}
                        contentViewType="vertical"
                    >
                        <TextOutput
                            className={styles.localUnitInfo}
                            label={strings.localUnitDetailLastUpdate}
                            value={selectedLocalUnitDetail.modified_at}
                            strongLabel
                            valueType="date"
                        />
                        <TextOutput
                            className={styles.localUnitInfo}
                            label={strings.localUnitDetailAddress}
                            strongLabel
                            value={selectedLocalUnitDetail.address_en}
                        />
                        <TextOutput
                            className={styles.localUnitInfo}
                            label={strings.localUnitDetailPhoneNumber}
                            strongLabel
                            value={selectedLocalUnitDetail.phone}
                        />
                        <TextOutput
                            className={styles.localUnitInfo}
                            label={strings.localUnitDetailFocalPerson}
                            strongLabel
                            value={selectedLocalUnitDetail.focal_person_en}
                        />
                        <TextOutput
                            className={styles.localUnitInfo}
                            label={strings.localUnitDetailEmail}
                            strongLabel
                            value={(
                                <Link
                                    href={`mailto:${selectedLocalUnitDetail.email}`}
                                    external
                                >
                                    {selectedLocalUnitDetail.email}
                                </Link>
                            )}
                        />
                    </MapPopup>
                )}
            </BaseMap>
            <Container
                className={styles.mapDetail}
                childrenContainerClassName={styles.addressDetail}
            >
                <div className={styles.location}>
                    <div>{countryResponse?.address_1}</div>
                    <div>{countryResponse?.address_2}</div>
                    <div>{countryResponse?.city_code}</div>
                </div>
                <Link
                    href={`mailto:${countryResponse?.email ?? '-'}`}
                    variant="tertiary"
                    withUnderline
                    external
                >
                    {countryResponse?.email}
                </Link>
            </Container>
        </Container>
    );
}

export default NationalSocietyLocalUnitsMap;
