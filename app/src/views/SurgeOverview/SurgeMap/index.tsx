import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    Container,
    LegendItem,
    RadioInput,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { sumSafe } from '@ifrc-go/ui/utils';
import {
    _cs,
    isDefined,
    isNotDefined,
    listToGroupList,
    mapToList,
} from '@togglecorp/fujs';
import {
    MapLayer,
    MapSource,
} from '@togglecorp/re-map';

import BaseMap from '#components/domain/BaseMap';
import Link from '#components/Link';
import MapContainerWithDisclaimer from '#components/MapContainerWithDisclaimer';
import MapPopup from '#components/MapPopup';
import useCountryRaw from '#hooks/domain/useCountryRaw';
import useInputState from '#hooks/useInputState';
import { useRequest } from '#utils/restRequest';

import {
    adminFillLayerOptions,
    basePointLayerOptions,
    getLegendOptions,
    getScaleOptions,
    optionKeySelector,
    optionLabelSelector,
    outerCircleLayerOptionsForEru,
    outerCircleLayerOptionsForPersonnel,
    ScaleOption,
} from './utils';

import i18n from './i18n.json';
import styles from './styles.module.css';

const now = new Date().toISOString();

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
    const [
        clickedPointProperties,
        setClickedPointProperties,
    ] = useState<ClickedPoint | undefined>();

    const [scaleBy, setScaleBy] = useInputState<ScaleOption['value']>('eru');

    const {
        response: eruResponse,
    } = useRequest({
        url: '/api/v2/eru/',
        query: {
            deployed_to__isnull: false,
            limit: 9999,
        },
    });

    const {
        response: personnelResponse,
    } = useRequest({
        url: '/api/v2/personnel/',
        query: {
            end_date__gt: now,
            limit: 9999,
        },
    });

    const countryResponse = useCountryRaw();

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
            ?.map((personnel) => {
                if (isNotDefined(personnel.deployment.country_deployed_to)) {
                    return undefined;
                }

                return {
                    units: 1,
                    deployedTo: personnel.deployment.country_deployed_to,
                    event: {
                        id: personnel.deployment.event_deployed_to?.id,
                        name: personnel.deployment.event_deployed_to?.name,
                    },
                };
            }).filter(isDefined);

        return (
            listToGroupList(
                personnelWithCountry,
                (personnel) => personnel.deployedTo?.id ?? '<no-key>',
            )
        );
    }, [personnelResponse]);

    const countryCentroidGeoJson = useMemo(
        (): GeoJSON.FeatureCollection<GeoJSON.Geometry> => ({
            type: 'FeatureCollection' as const,
            features: countryResponse
                ?.map((country) => {
                    if (
                        (!country.independent && isNotDefined(country.record_type))
                        || isNotDefined(country.centroid)
                        || isNotDefined(country.iso3)
                    ) {
                        return undefined;
                    }

                    const eruList = countryGroupedErus[country.id];
                    const personnelList = countryGroupedPersonnel?.[country.id];
                    if (isNotDefined(eruList) && isNotDefined(personnelList)) {
                        return undefined;
                    }

                    const units = sumSafe(eruList?.map((eru) => eru.units)) ?? 0;
                    const personnel = personnelList ? personnelList.length : 0;

                    return {
                        type: 'Feature' as const,
                        geometry: country.centroid as {
                            type: 'Point',
                            coordinates: [number, number],
                        },
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
                    (eru) => eru.event.id ?? -1,
                ),
                (eru) => ({
                    ...eru[0].event,
                    units: sumSafe(eru.map((e) => e.units)) ?? 0,
                }),
            ),
            personnelDeployedEvents: mapToList(
                listToGroupList(
                    // eslint-disable-next-line max-len
                    countryGroupedPersonnel?.[clickedPointProperties.feature.properties.country_id] ?? [],
                    (personnel) => personnel.event.id,
                ),
                (personnel) => ({
                    ...personnel[0].event,
                    units: sumSafe(personnel.map((p) => p.units)) ?? 0,
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
            <BaseMap
                baseLayers={(
                    <MapLayer
                        layerKey="admin-0"
                        hoverable
                        layerOptions={adminFillLayerOptions}
                        onClick={handleCountryClick}
                    />
                )}
            >
                <MapContainerWithDisclaimer
                    className={styles.mapContainer}
                    title={strings.surgeDownloadMapTitle}
                    footer={(
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
                                    <LegendItem
                                        className={styles.legendItem}
                                        key={legendItem.value}
                                        label={legendItem.label}
                                        color={legendItem.color}
                                    />
                                ))}
                            </div>
                        </div>
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
                                to="countriesLayout"
                                urlParams={{
                                    countryId: clickedPointProperties.feature.properties.country_id,
                                }}
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
                        {(isNotDefined(popupDetails) || (
                            popupDetails.eruDeployedEvents.length === 0
                            && popupDetails.personnelDeployedEvents.length === 0
                        )) && (
                            <div>
                                {strings.eventPopoverEmpty}
                            </div>
                        )}
                    </MapPopup>
                )}
            </BaseMap>
        </Container>
    );
}

export default SurgeMap;
