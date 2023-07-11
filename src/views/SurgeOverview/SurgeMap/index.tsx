import {
    useMemo,
    useState,
    useContext,
    useCallback,
} from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
    listToGroupList,
    mapToList,
    sum,
} from '@togglecorp/fujs';
import Map, {
    MapContainer,
    MapSource,
    MapLayer,
} from '@togglecorp/re-map';
import { generatePath } from 'react-router-dom';

import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';
import Container from '#components/Container';
import Link from '#components/Link';
import MapPopup from '#components/MapPopup';
import { paths } from '#generated/types';
import GoMapDisclaimer from '#components/GoMapDisclaimer';
import RadioInput from '#components/RadioInput';
import TextOutput from '#components/TextOutput';
import useInputState from '#hooks/useInputState';
import {
    defaultMapStyle,
    defaultMapOptions,
} from '#utils/map';
import RouteContext from '#contexts/route';

import {
    ScaleOption,
    getScaleOptions,
    optionKeySelector,
    optionLabelSelector,
    getLegendOptions,
    adminFillLayerOptions,
    adminLabelLayerOptions,
    basePointLayerOptions,
    outerCircleLayerOptionsForEru,
    outerCircleLayerOptionsForPersonnel,
} from './utils';
import i18n from './i18n.json';
import styles from './styles.module.css';

type GetEmergencyResponseUnit = paths['/api/v2/eru/']['get'];
type GetEmergencyResponseUnitParams = GetEmergencyResponseUnit['parameters']['query'];
type GetEmergencyResponseUnitResponse = GetEmergencyResponseUnit['responses']['200']['content']['application/json'];

type GetPersonnel = paths['/api/v2/personnel/']['get'];
type GetPersonnelParams = GetPersonnel['parameters']['query'];
type GetPersonnelResponse = GetPersonnel['responses']['200']['content']['application/json'];

type GetCountry = paths['/api/v2/country/']['get'];
type GetCountryResponse = GetCountry['responses']['200']['content']['application/json'];

const today = new Date().toISOString();

const sourceOptions: mapboxgl.GeoJSONSourceRaw = {
    type: 'geojson',
};

interface CountryProperties {
    country_id: number;
    disputed: boolean;
    fdrs: string;
    independent: boolean;
    is_deprecated: boolean;
    iso: string;
    iso3: string;
    name: string;
    name_ar: string;
    name_es: string;
    name_fr: string;
    record_type: number;
    region_id: number;
}

interface ClickedPoint {
    feature: GeoJSON.Feature<GeoJSON.Point, CountryProperties>;
    lngLat: mapboxgl.LngLatLike;
}

interface Props {
    className?: string;
}

function SurgeMap(props: Props) {
    const {
        className,
    } = props;

    const strings = useTranslation(i18n);
    const {
        country: countryRoute,
    } = useContext(RouteContext);
    const [
        clickedPointProperties,
        setClickedPointProperties,
    ] = useState<ClickedPoint | undefined>();

    const [scaleBy, setScaleBy] = useInputState<ScaleOption['value']>('eru');
    const eruQuery: GetEmergencyResponseUnitParams = {
        deployed_to__isnull: false,
        limit: 1000, // FIXME: we should fix this unbounded request
    };

    const personnelQuery: GetPersonnelParams = {
        end_date__gt: today,
        limit: 1000, // FIXME: we should fix this unbounded request
    };

    const {
        response: eruResponse,
    } = useRequest<GetEmergencyResponseUnitResponse>({
        url: 'api/v2/eru/',
        query: eruQuery,
    });

    const {
        response: personnelResponse,
    } = useRequest<GetPersonnelResponse>({
        url: '/api/v2/personnel/',
        query: personnelQuery,
    });

    const {
        response: countryResponse,
    } = useRequest<GetCountryResponse>({
        url: 'api/v2/country/',
        query: {
            limit: 500,
        },
    });

    const [
        scaleOptions,
        legendOptions,
    ] = useMemo(() => ([
        getScaleOptions(strings),
        getLegendOptions(strings),
    ]), [strings]);

    const countryGroupedErus = useMemo(() => {
        const erusWithCountry = eruResponse?.results
            ?.filter((eru) => isDefined(eru.deployed_to.iso3))
            ?.map((eru) => ({
                units: eru.units,
                deployedTo: eru.deployed_to,
                event: { id: eru.event?.id, name: eru.event?.name },
            })) ?? [];

        return (
            listToGroupList(
                erusWithCountry,
                (eru) => eru.deployedTo.id,
            )
        );
    }, [eruResponse]);

    const countryGroupedPersonnel = useMemo(() => {
        const personnelWithCountry = personnelResponse?.results
            ?.filter((personnel) => isDefined(personnel.deployment.country_deployed_to.iso3))
            ?.map((personnel) => ({
                units: 1,
                deployedTo: personnel.deployment.country_deployed_to,
                event: {
                    id: personnel.deployment.event_deployed_to?.id,
                    name: personnel.deployment.event_deployed_to?.name,
                },
            })) ?? [];

        return (
            listToGroupList(
                personnelWithCountry,
                (personnel) => personnel.deployedTo.id,
            )
        );
    }, [personnelResponse]);

    const countryCentroidGeoJson = useMemo(
        (): GeoJSON.FeatureCollection<GeoJSON.Geometry> => ({
            type: 'FeatureCollection' as const,
            features: countryResponse?.results
                ?.filter((country) => country.independent || country.record_type)
                ?.map((country) => {
                    if (!country.centroid || !country.iso3) {
                        return undefined;
                    }

                    const eruList = countryGroupedErus[country.id];
                    const personnelList = countryGroupedPersonnel[country.id];

                    if (isNotDefined(eruList) && isNotDefined(personnelList)) {
                        return undefined;
                    }

                    const units = eruList ? sum(eruList.map((eru) => eru.units ?? 0)) : 0;
                    const personnel = personnelList ? personnelList.length : 0;

                    return {
                        type: 'Feature' as const,
                        // FIXME: this type issue should be fixed in server
                        geometry: country.centroid as unknown as GeoJSON.Geometry,
                        properties: {
                            id: country.id,
                            name: country.name,
                            units,
                            personnel,
                        },
                    };
                }).filter(isDefined) ?? [],
        }),
        [countryResponse, countryGroupedErus, countryGroupedPersonnel],
    );

    const popupDetails = clickedPointProperties
        ? {
            eruDeployedEvents: mapToList(
                listToGroupList(
                    countryGroupedErus[clickedPointProperties.feature.properties.country_id] ?? [],
                    (eru) => eru.event.id,
                ),
                (eru) => ({
                    ...eru[0].event,
                    units: sum(eru.map((e) => e.units ?? 0)),
                }),
            ),
            personnelDeployedEvents: mapToList(
                listToGroupList(
                    // eslint-disable-next-line max-len
                    countryGroupedPersonnel[clickedPointProperties.feature.properties.country_id] ?? [],
                    (personnel) => personnel.event.id,
                ),
                (personnel) => ({
                    ...personnel[0].event,
                    units: sum(personnel.map((p) => p.units ?? 0)),
                }),
            ),
        }
        : undefined;

    const handleCountryClick = useCallback((
        feature: mapboxgl.MapboxGeoJSONFeature,
        lngLat: mapboxgl.LngLatLike,
    ) => {
        setClickedPointProperties({
            feature: feature as unknown as ClickedPoint['feature'],
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

    return (
        <Container
            className={_cs(styles.surgeMap, className)}
        >
            <Map
                mapStyle={defaultMapStyle}
                mapOptions={defaultMapOptions}
                navControlShown
                navControlPosition="top-right"
            >
                <div className={styles.mapContainerWrapper}>
                    <MapContainer className={styles.mapContainer} />
                    <GoMapDisclaimer className={styles.mapDisclaimer} />
                </div>
                <MapSource
                    sourceKey="composite"
                    managed={false}
                >
                    <MapLayer
                        layerKey="admin-0"
                        hoverable
                        layerOptions={adminFillLayerOptions}
                        onClick={handleCountryClick}
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
                        layerKey="outer-circle"
                        layerOptions={
                            scaleBy === 'eru'
                                ? outerCircleLayerOptionsForEru
                                : outerCircleLayerOptionsForPersonnel
                        }
                    />
                </MapSource>
                {clickedPointProperties?.lngLat && (
                    <MapPopup
                        onCloseButtonClick={handlePointClose}
                        coordinates={clickedPointProperties.lngLat}
                        heading={(
                            <Link
                                to={
                                    generatePath(
                                        countryRoute.absolutePath,
                                        // eslint-disable-next-line max-len
                                        { countryId: clickedPointProperties.feature.properties.country_id },
                                    )
                                }
                            >
                                {clickedPointProperties.feature.properties.name}
                            </Link>
                        )}
                        childrenContainerClassName={styles.popupContent}
                    >
                        {popupDetails?.eruDeployedEvents?.map(
                            (event) => (
                                <Container
                                    key={event.id}
                                    className={styles.popupEvent}
                                    childrenContainerClassName={styles.popupEventDetail}
                                    heading={event?.name}
                                    headingLevel={5}
                                >
                                    <TextOutput
                                        value={event.units}
                                        description={strings.deployedErus}
                                        valueType="number"
                                    />
                                </Container>
                            ),
                        )}
                        {popupDetails?.personnelDeployedEvents?.map(
                            (event) => (
                                <Container
                                    key={event.id}
                                    className={styles.popupEvent}
                                    childrenContainerClassName={styles.popupEventDetail}
                                    heading={event?.name}
                                    headingLevel={5}
                                >
                                    <TextOutput
                                        value={event.units}
                                        description={strings.deployedPersonnel}
                                        valueType="number"
                                    />
                                </Container>
                            ),
                        )}
                        {(!popupDetails || (
                            popupDetails.eruDeployedEvents.length === 0
                            && popupDetails.personnelDeployedEvents.length === 0
                        )) && (
                            <div>
                                {strings.eventPopoverEmpty}
                            </div>
                        )}
                    </MapPopup>
                )}
            </Map>
            <div className={styles.footer}>
                <div className={styles.left}>
                    <RadioInput
                        label={strings.explanationScalePoints}
                        name={undefined}
                        options={scaleOptions}
                        keySelector={optionKeySelector}
                        labelSelector={optionLabelSelector}
                        value={scaleBy}
                        onChange={setScaleBy}
                    />
                </div>
                <div className={styles.legend}>
                    {legendOptions.map((legendItem) => (
                        <div
                            key={legendItem.value}
                            className={styles.legendItem}
                        >
                            <div
                                className={styles.color}
                                style={{ backgroundColor: legendItem.color }}
                            />
                            <div className={styles.label}>
                                {legendItem.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Container>
    );
}

export default SurgeMap;
